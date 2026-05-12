const { handleOptions, sendJson, sendMethodNotAllowed } = require("./_lib/http");
const { assertSupabase } = require("./_lib/supabase");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) {
    return;
  }
  if (req.method !== "GET") {
    return sendMethodNotAllowed(res, ["GET"]);
  }

  try {
    assertSupabase();
    return sendJson(res, 200, {
      ok: true,
      service: "kamuabu-retro-run-api",
      database: "configured",
    });
  } catch (error) {
    return sendJson(res, 503, {
      ok: false,
      service: "kamuabu-retro-run-api",
      database: error.code || "not_configured",
    });
  }
};
