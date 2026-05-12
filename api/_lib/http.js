function applyCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  applyCors(res);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function sendMethodNotAllowed(res, methods) {
  applyCors(res);
  res.setHeader("Allow", methods.join(", "));
  sendJson(res, 405, { ok: false, error: "method_not_allowed" });
}

function handleOptions(req, res) {
  if (req.method !== "OPTIONS") {
    return false;
  }
  res.statusCode = 204;
  applyCors(res);
  res.end();
  return true;
}

async function readJson(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

module.exports = {
  handleOptions,
  readJson,
  sendJson,
  sendMethodNotAllowed,
};
