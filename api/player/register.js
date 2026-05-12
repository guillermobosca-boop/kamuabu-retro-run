const { handleOptions, readJson, sendJson, sendMethodNotAllowed } = require("../_lib/http");
const { buildNicknameSlug, sanitizeNickname } = require("../_lib/score");
const { insert, patch, selectFirst } = require("../_lib/supabase");

async function buildAvailableSlug(nickname, playerId = null) {
  const base = buildNicknameSlug(nickname);
  const current = await selectFirst("players", `select=id,slug&slug=eq.${encodeURIComponent(base)}&limit=1`);

  if (!current || current.id === playerId) {
    return base;
  }

  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`.slice(0, 32);
}

async function loadBestScore(playerId) {
  const best = await selectFirst(
    "runs",
    `select=score&player_id=eq.${encodeURIComponent(playerId)}&valid=is.true&order=score.desc,run_duration_ms.asc&limit=1`
  );
  return best?.score || 0;
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }
  if (req.method !== "POST") {
    return sendMethodNotAllowed(res, ["POST"]);
  }

  try {
    const body = await readJson(req);
    const nickname = sanitizeNickname(body.nickname);
    const playerId = body.playerId ? String(body.playerId) : null;

    if (nickname.length < 3) {
      return sendJson(res, 400, { ok: false, error: "nickname_too_short" });
    }

    let row = null;
    if (playerId) {
      row = await selectFirst("players", `select=id,nickname,slug,created_at&id=eq.${encodeURIComponent(playerId)}&limit=1`);
    }

    if (row) {
      const updated = await patch(
        "players",
        `id=eq.${encodeURIComponent(row.id)}`,
        {
          nickname,
          slug: await buildAvailableSlug(nickname, row.id),
          updated_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
        }
      );
      const player = Array.isArray(updated) ? updated[0] : row;
      return sendJson(res, 200, {
        ok: true,
        player: {
          id: player.id,
          nickname: player.nickname,
          slug: player.slug,
          bestScore: await loadBestScore(player.id),
          createdAt: player.created_at,
        },
      });
    }

    const createdRows = await insert("players", {
      nickname,
      slug: await buildAvailableSlug(nickname),
      status: "active",
      last_seen_at: new Date().toISOString(),
    });

    const player = createdRows[0];
    return sendJson(res, 200, {
      ok: true,
      player: {
        id: player.id,
        nickname: player.nickname,
        slug: player.slug,
        bestScore: 0,
        createdAt: player.created_at,
      },
    });
  } catch (error) {
    const status = error.code === "supabase_not_configured" ? 503 : 500;
    return sendJson(res, status, {
      ok: false,
      error: error.code || error.message || "player_register_failed",
    });
  }
};
