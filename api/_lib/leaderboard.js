const { select } = require("./supabase");

async function fetchLeaderboard(scope, { cityKey, limit = 10 } = {}) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 10, 100));
  if (scope === "city") {
    return select(
      "leaderboard_city",
      `select=player_id,nickname,city_key,score,combo_max,enemies_killed,run_duration_ms,created_at&city_key=eq.${encodeURIComponent(
        cityKey
      )}&order=score.desc,run_duration_ms.asc&limit=${safeLimit}`
    );
  }

  if (scope === "weekly") {
    return select(
      "leaderboard_weekly",
      `select=player_id,nickname,city_key,score,combo_max,enemies_killed,run_duration_ms,created_at&order=score.desc,run_duration_ms.asc&limit=${safeLimit}`
    );
  }

  return select(
    "leaderboard_global",
    `select=player_id,nickname,city_key,score,combo_max,enemies_killed,run_duration_ms,created_at&order=score.desc,run_duration_ms.asc&limit=${safeLimit}`
  );
}

function normalizeEntries(rows = []) {
  return rows.map((row, index) => ({
    rank: index + 1,
    playerId: row.player_id,
    nickname: row.nickname,
    cityKey: row.city_key,
    score: row.score,
    comboMax: row.combo_max,
    enemiesKilled: row.enemies_killed,
    runDurationMs: row.run_duration_ms,
    createdAt: row.created_at,
  }));
}

async function computeSelfEntry(scope, { playerId, cityKey } = {}) {
  if (!playerId) {
    return null;
  }

  const rows = await fetchLeaderboard(scope, { cityKey, limit: 500 });
  const entries = normalizeEntries(rows);
  return entries.find((entry) => entry.playerId === playerId) || null;
}

async function computeRanks(playerId, cityKey) {
  const [globalRows, weeklyRows, cityRows] = await Promise.all([
    fetchLeaderboard("global", { limit: 500 }),
    fetchLeaderboard("weekly", { limit: 500 }),
    fetchLeaderboard("city", { cityKey, limit: 500 }),
  ]);

  const global = normalizeEntries(globalRows);
  const weekly = normalizeEntries(weeklyRows);
  const city = normalizeEntries(cityRows);

  return {
    globalRank: global.find((entry) => entry.playerId === playerId)?.rank || null,
    weeklyRank: weekly.find((entry) => entry.playerId === playerId)?.rank || null,
    cityRank: city.find((entry) => entry.playerId === playerId)?.rank || null,
    leaderboardPreview: global.slice(0, 5),
  };
}

module.exports = {
  computeRanks,
  computeSelfEntry,
  fetchLeaderboard,
  normalizeEntries,
};
