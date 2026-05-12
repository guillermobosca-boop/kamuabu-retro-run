const { handleOptions, sendJson, sendMethodNotAllowed } = require("../_lib/http");
const { computeSelfEntry, fetchLeaderboard, normalizeEntries } = require("../_lib/leaderboard");
const { validateCity } = require("../_lib/score");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }
  if (req.method !== "GET") {
    return sendMethodNotAllowed(res, ["GET"]);
  }

  try {
    const cityKey = String(req.query?.city || "");
    const limit = req.query?.limit || 10;
    const playerId = String(req.query?.playerId || "");

    if (!validateCity(cityKey)) {
      return sendJson(res, 400, { ok: false, error: "invalid_city" });
    }

    const rows = await fetchLeaderboard("city", { cityKey, limit });
    return sendJson(res, 200, {
      ok: true,
      entries: normalizeEntries(rows),
      selfEntry: playerId ? await computeSelfEntry("city", { playerId, cityKey }) : null,
      scope: "city",
      cityKey,
      source: "remote",
    });
  } catch (error) {
    const status = error.code === "supabase_not_configured" ? 503 : 500;
    return sendJson(res, status, {
      ok: false,
      error: error.code || error.message || "leaderboard_city_failed",
    });
  }
};
