const { readJson, sendJson, sendMethodNotAllowed } = require("../_lib/http");
const { validateCity } = require("../_lib/score");
const { insert, selectFirst } = require("../_lib/supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return sendMethodNotAllowed(res, ["POST"]);
  }

  try {
    const body = await readJson(req);
    const playerId = String(body.playerId || "");
    const cityKey = String(body.cityKey || "");

    if (!playerId) {
      return sendJson(res, 400, { ok: false, error: "player_id_required" });
    }
    if (!validateCity(cityKey)) {
      return sendJson(res, 400, { ok: false, error: "invalid_city" });
    }

    const player = await selectFirst("players", `select=id&id=eq.${encodeURIComponent(playerId)}&limit=1`);
    if (!player) {
      return sendJson(res, 404, { ok: false, error: "player_not_found" });
    }

    const createdRows = await insert("run_sessions", {
      player_id: playerId,
      city_key: cityKey,
      build_version: String(body.buildVersion || "desktop-competitive-v1").slice(0, 64),
      device_type: String(body.deviceType || "desktop").slice(0, 32),
      user_agent: String(req.headers["user-agent"] || "").slice(0, 512),
      status: "started",
    });

    const session = createdRows[0];
    return sendJson(res, 200, {
      ok: true,
      session: {
        id: session.id,
        playerId: session.player_id,
        cityKey: session.city_key,
        startedAt: session.started_at,
      },
    });
  } catch (error) {
    const status = error.code === "supabase_not_configured" ? 503 : 500;
    return sendJson(res, status, {
      ok: false,
      error: error.code || error.message || "run_start_failed",
    });
  }
};
