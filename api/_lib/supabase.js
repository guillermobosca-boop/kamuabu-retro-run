const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assertSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    const error = new Error("supabase_not_configured");
    error.code = "supabase_not_configured";
    throw error;
  }
}

async function rest(path, { method = "GET", query = "", body, headers = {} } = {}) {
  assertSupabase();
  const url = `${SUPABASE_URL}/rest/v1/${path}${query ? `?${query}` : ""}`;
  const response = await fetch(url, {
    method,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.message || payload?.error || "supabase_rest_error");
    error.payload = payload;
    throw error;
  }
  return payload;
}

async function insert(table, body, headers = {}) {
  return rest(table, {
    method: "POST",
    body,
    headers,
  });
}

async function upsert(table, body, onConflict, headers = {}) {
  const conflictValue = Array.isArray(onConflict) ? onConflict.join(",") : onConflict;
  return rest(table, {
    method: "POST",
    query: conflictValue ? `on_conflict=${encodeURIComponent(conflictValue)}` : "",
    body,
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
      ...headers,
    },
  });
}

async function patch(table, query, body) {
  return rest(table, {
    method: "PATCH",
    query,
    body,
  });
}

async function select(table, query) {
  return rest(table, { method: "GET", query });
}

async function selectFirst(table, query) {
  const rows = await select(table, query);
  return Array.isArray(rows) ? rows[0] || null : null;
}

module.exports = {
  assertSupabase,
  insert,
  patch,
  select,
  selectFirst,
  upsert,
};
