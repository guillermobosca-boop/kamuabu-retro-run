const VALID_CITIES = new Set(["valencia", "roma", "paris", "venecia", "londres"]);

function slugifyNickname(nickname) {
  return nickname
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

function sanitizeNickname(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 18);
}

function buildNicknameSlug(nickname) {
  return slugifyNickname(nickname) || `runner-${Math.random().toString(36).slice(2, 8)}`;
}

function validateCity(cityKey) {
  return VALID_CITIES.has(cityKey);
}

function validateRun(body) {
  const score = Math.max(0, Math.floor(body.score || 0));
  const distance = Math.max(0, Math.floor(body.distance || 0));
  const enemiesKilled = Math.max(0, Math.floor(body.enemiesKilled || 0));
  const comboMax = Math.max(1, Math.floor(body.comboMax || 1));
  const hitsTaken = Math.max(0, Math.floor(body.hitsTaken || 0));
  const runDurationMs = Math.max(0, Math.floor(body.runDurationMs || 0));
  const socksCollected = Math.max(0, Math.floor(body.socksCollected || 0));
  const shirtsCollected = Math.max(0, Math.floor(body.shirtsCollected || 0));
  const scootersCollected = Math.max(0, Math.floor(body.scootersCollected || 0));
  const cityKey = String(body.cityKey || "");
  const weaponPeak = String(body.weaponPeak || "Pistol").slice(0, 32);

  const issues = [];
  if (!validateCity(cityKey)) issues.push("invalid_city");
  if (score > 5000000) issues.push("score_too_high");
  if (distance > 250000) issues.push("distance_too_high");
  if (enemiesKilled > 12000) issues.push("enemy_count_too_high");
  if (comboMax > 99) issues.push("combo_too_high");
  if (runDurationMs < 3000) issues.push("duration_too_short");
  if (runDurationMs > 1000 * 60 * 90) issues.push("duration_too_long");
  if (score > runDurationMs * 1.8) issues.push("score_rate_suspicious");

  return {
    cityKey,
    score,
    distance,
    enemiesKilled,
    comboMax,
    hitsTaken,
    runDurationMs,
    socksCollected,
    shirtsCollected,
    scootersCollected,
    weaponPeak,
    miniBossKilled: Boolean(body.miniBossKilled),
    bossKilled: Boolean(body.bossKilled),
    victory: Boolean(body.victory),
    issues,
    valid: issues.length === 0,
  };
}

module.exports = {
  buildNicknameSlug,
  sanitizeNickname,
  validateCity,
  validateRun,
};
