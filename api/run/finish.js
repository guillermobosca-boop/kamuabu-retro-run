const { readJson, sendJson, sendMethodNotAllowed } = require("../_lib/http");
const { computeRanks } = require("../_lib/leaderboard");
const { validateRun } = require("../_lib/score");
const { insert, patch, selectFirst, upsert } = require("../_lib/supabase");

const CITY_BEST_FIELDS = {
  valencia: "best_valencia_score",
  roma: "best_roma_score",
  paris: "best_paris_score",
  venecia: "best_venecia_score",
  londres: "best_londres_score",
};

async function ensureSession(sessionId, playerId, cityKey) {
  if (!sessionId) return null;
  const session = await selectFirst(
    "run_sessions",
    `select=id,player_id,city_key&id=eq.${encodeURIComponent(sessionId)}&limit=1`
  );
  if (session) {
    return session;
  }
  const createdRows = await insert("run_sessions", {
    id: sessionId,
    player_id: playerId,
    city_key: cityKey,
    status: "started",
    build_version: "desktop-competitive-v1",
    device_type: "desktop",
  });
  return createdRows[0];
}

async function updatePlayerBest(playerId, run) {
  const current = await selectFirst(
    "player_bests",
    `select=player_id,best_global_score,best_global_run_id,best_valencia_score,best_roma_score,best_paris_score,best_venecia_score,best_londres_score&player_id=eq.${encodeURIComponent(
      playerId
    )}&limit=1`
  );

  const cityField = CITY_BEST_FIELDS[run.city_key];
  const payload = {
    player_id: playerId,
    updated_at: new Date().toISOString(),
  };

  const currentGlobal = current?.best_global_score || 0;
  if (run.valid && run.score >= currentGlobal) {
    payload.best_global_score = run.score;
    payload.best_global_run_id = run.id;
  } else if (!current) {
    payload.best_global_score = 0;
  }

  const currentCity = current?.[cityField] || 0;
  if (run.valid && run.score >= currentCity) {
    payload[cityField] = run.score;
  } else if (!current) {
    payload[cityField] = 0;
  }

  await upsert("player_bests", payload, "player_id");
}

async function loadPlayerSummary(playerId) {
  const player = await selectFirst(
    "players",
    `select=id,nickname,slug,created_at&id=eq.${encodeURIComponent(playerId)}&limit=1`
  );
  const best = await selectFirst(
    "runs",
    `select=score&player_id=eq.${encodeURIComponent(playerId)}&valid=is.true&order=score.desc,run_duration_ms.asc&limit=1`
  );
  return {
    id: player?.id || playerId,
    nickname: player?.nickname || "Runner",
    slug: player?.slug || "runner",
    bestScore: best?.score || 0,
    createdAt: player?.created_at || new Date().toISOString(),
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return sendMethodNotAllowed(res, ["POST"]);
  }

  try {
    const body = await readJson(req);
    const playerId = String(body.playerId || "");
    const sessionId = String(body.sessionId || "");

    if (!playerId) {
      return sendJson(res, 400, { ok: false, error: "player_id_required" });
    }

    const validated = validateRun(body);
    if (!validated.cityKey) {
      return sendJson(res, 400, { ok: false, error: "city_required" });
    }

    const player = await selectFirst("players", `select=id&id=eq.${encodeURIComponent(playerId)}&limit=1`);
    if (!player) {
      return sendJson(res, 404, { ok: false, error: "player_not_found" });
    }

    await ensureSession(sessionId, playerId, validated.cityKey);

    const runRows = await insert("runs", {
      session_id: sessionId || null,
      player_id: playerId,
      city_key: validated.cityKey,
      score: validated.score,
      distance: validated.distance,
      enemies_killed: validated.enemiesKilled,
      mini_boss_killed: validated.miniBossKilled,
      boss_killed: validated.bossKilled,
      combo_max: validated.comboMax,
      hits_taken: validated.hitsTaken,
      weapon_peak: validated.weaponPeak,
      run_duration_ms: validated.runDurationMs,
      socks_collected: validated.socksCollected,
      shirts_collected: validated.shirtsCollected,
      scooters_collected: validated.scootersCollected,
      valid: validated.valid,
      validation_notes: validated.issues.length ? validated.issues.join(",") : null,
    });

    const run = runRows[0];

    await patch(
      "players",
      `id=eq.${encodeURIComponent(playerId)}`,
      {
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );

    if (sessionId) {
      await patch(
        "run_sessions",
        `id=eq.${encodeURIComponent(sessionId)}`,
        {
          ended_at: new Date().toISOString(),
          status: "finished",
        }
      );
    }

    await updatePlayerBest(playerId, run);

    const rankings = validated.valid
      ? await computeRanks(playerId, validated.cityKey)
      : {
          globalRank: null,
          weeklyRank: null,
          cityRank: null,
          leaderboardPreview: [],
        };

    return sendJson(res, 200, {
      ok: true,
      run: {
        id: run.id,
        score: run.score,
        cityKey: run.city_key,
        valid: run.valid,
        validationNotes: run.validation_notes,
      },
      rankings: {
        globalRank: rankings.globalRank,
        weeklyRank: rankings.weeklyRank,
        cityRank: rankings.cityRank,
      },
      leaderboardPreview: rankings.leaderboardPreview,
      player: await loadPlayerSummary(playerId),
    });
  } catch (error) {
    const status = error.code === "supabase_not_configured" ? 503 : 500;
    return sendJson(res, status, {
      ok: false,
      error: error.code || error.message || "run_finish_failed",
    });
  }
};
