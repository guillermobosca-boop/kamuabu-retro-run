const { handleOptions, sendJson, sendMethodNotAllowed } = require("../_lib/http");
const { computeSelfEntry, fetchLeaderboard, normalizeEntries } = require("../_lib/leaderboard");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }
  if (req.method !== "GET") {
    return sendMethodNotAllowed(res, ["GET"]);
  }

  try {
    const limit = req.query?.limit || 10;
    const playerId = String(req.query?.playerId || "");
    const rows = await fetchLeaderboard("global", { limit });
    return sendJson(res, 200, {
      ok: true,
      entries: normalizeEntries(rows),
      selfEntry: playerId ? await computeSelfEntry("global", { playerId }) : null,
      scope: "global",
      source: "remote",
    });
  } catch (error) {
    const status = error.code === "supabase_not_configured" ? 503 : 500;
    return sendJson(res, status, {
      ok: false,
      error: error.code || error.message || "leaderboard_global_failed",
    });
  }
};
