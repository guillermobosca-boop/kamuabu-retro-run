const PLAYER_STORAGE_KEY = "kamuabu-retro-run-player";
const LOCAL_RUNS_KEY = "kamuabu-retro-run-offline-runs";
const ACTIVE_SCOPE_KEY = "kamuabu-retro-run-board-scope";

const CITY_LABELS = {
  valencia: "Valencia",
  roma: "Roma",
  paris: "Paris",
  venecia: "Venecia",
  londres: "Londres",
};

const padScore = (value) => String(Math.max(0, Math.floor(value || 0))).padStart(6, "0");
const safeJsonParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const slugifyNickname = (nickname) =>
  nickname
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || `runner-${Math.random().toString(36).slice(2, 8)}`;

const randomId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `offline-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

class CompetitionClient {
  constructor() {
    this.player = safeJsonParse(localStorage.getItem(PLAYER_STORAGE_KEY), null);
    this.remoteEnabled = window.location.protocol !== "file:";
    this.currentSession = null;
  }

  savePlayer(player) {
    this.player = player;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(player));
    return player;
  }

  getOfflineRuns() {
    return safeJsonParse(localStorage.getItem(LOCAL_RUNS_KEY), []);
  }

  setOfflineRuns(runs) {
    localStorage.setItem(LOCAL_RUNS_KEY, JSON.stringify(runs));
  }

  async request(path, options = {}) {
    const response = await fetch(path, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || `API ${response.status}`);
    }
    return payload;
  }

  async registerPlayer(nickname) {
    const cleanNickname = nickname.trim().slice(0, 18);
    if (cleanNickname.length < 3) {
      throw new Error("El apodo debe tener al menos 3 caracteres.");
    }

    if (!this.remoteEnabled) {
      const player = this.savePlayer({
        id: this.player?.id || randomId(),
        nickname: cleanNickname,
        slug: slugifyNickname(cleanNickname),
        bestScore: this.player?.bestScore || 0,
        createdAt: this.player?.createdAt || new Date().toISOString(),
      });
      return { ok: true, player, source: "offline" };
    }

    try {
      const payload = await this.request("/api/player/register", {
        method: "POST",
        body: {
          nickname: cleanNickname,
          playerId: this.player?.id || null,
        },
      });
      const player = this.savePlayer(payload.player);
      return { ...payload, player, source: "remote" };
    } catch (error) {
      const player = this.savePlayer({
        id: this.player?.id || randomId(),
        nickname: cleanNickname,
        slug: slugifyNickname(cleanNickname),
        bestScore: this.player?.bestScore || 0,
        createdAt: this.player?.createdAt || new Date().toISOString(),
      });
      return {
        ok: true,
        player,
        source: "offline-fallback",
        warning: error.message,
      };
    }
  }

  async startRun(cityKey) {
    if (!this.player) {
      return null;
    }

    const baseSession = {
      id: randomId(),
      cityKey,
      startedAt: new Date().toISOString(),
      playerId: this.player.id,
    };

    if (!this.remoteEnabled) {
      this.currentSession = baseSession;
      return baseSession;
    }

    try {
      const payload = await this.request("/api/run/start", {
        method: "POST",
        body: {
          playerId: this.player.id,
          cityKey,
          buildVersion: "desktop-competitive-v1",
          deviceType: "desktop",
        },
      });
      this.currentSession = payload.session;
      return payload.session;
    } catch {
      this.currentSession = baseSession;
      return baseSession;
    }
  }

  computeOfflineLeaderboard(scope, cityKey, limit = 8) {
    const now = Date.now();
    const byPlayer = new Map();
    const runs = this.getOfflineRuns().filter((run) => {
      if (scope === "city" && run.cityKey !== cityKey) return false;
      if (scope === "weekly") {
        const created = new Date(run.createdAt).getTime();
        return now - created <= 7 * 24 * 60 * 60 * 1000;
      }
      return true;
    });

    for (const run of runs) {
      const existing = byPlayer.get(run.playerId);
      if (!existing || run.score > existing.score) {
        byPlayer.set(run.playerId, run);
      }
    }

    return Array.from(byPlayer.values())
      .sort((a, b) => b.score - a.score || a.runDurationMs - b.runDurationMs)
      .slice(0, limit)
      .map((run, index) => ({
        rank: index + 1,
        nickname: run.nickname,
        playerId: run.playerId,
        score: run.score,
        cityKey: run.cityKey,
        createdAt: run.createdAt,
      }));
  }

  async fetchLeaderboard(scope = "global", cityKey = "valencia", limit = 8) {
    if (!this.remoteEnabled) {
      return {
        ok: true,
        entries: this.computeOfflineLeaderboard(scope, cityKey, limit),
        source: "offline",
      };
    }

    const endpoint =
      scope === "weekly"
        ? `/api/leaderboard/weekly?limit=${limit}`
        : scope === "city"
          ? `/api/leaderboard/city?city=${encodeURIComponent(cityKey)}&limit=${limit}`
          : `/api/leaderboard/global?limit=${limit}`;

    try {
      return await this.request(endpoint);
    } catch {
      return {
        ok: true,
        entries: this.computeOfflineLeaderboard(scope, cityKey, limit),
        source: "offline-fallback",
      };
    }
  }

  async finishRun(payload) {
    if (!this.player) {
      return { ok: false, error: "player_missing" };
    }

    const localRun = {
      id: randomId(),
      sessionId: payload.sessionId || this.currentSession?.id || randomId(),
      playerId: this.player.id,
      nickname: this.player.nickname,
      cityKey: payload.cityKey,
      score: Math.floor(payload.score || 0),
      distance: Math.floor(payload.distance || 0),
      enemiesKilled: payload.enemiesKilled || 0,
      miniBossKilled: Boolean(payload.miniBossKilled),
      bossKilled: Boolean(payload.bossKilled),
      comboMax: payload.comboMax || 1,
      hitsTaken: payload.hitsTaken || 0,
      weaponPeak: payload.weaponPeak || "Pistol",
      runDurationMs: payload.runDurationMs || 0,
      socksCollected: payload.socksCollected || 0,
      shirtsCollected: payload.shirtsCollected || 0,
      scootersCollected: payload.scootersCollected || 0,
      victory: Boolean(payload.victory),
      createdAt: new Date().toISOString(),
    };

    const bestScore = Math.max(this.player?.bestScore || 0, localRun.score);
    this.savePlayer({ ...this.player, bestScore });

    if (!this.remoteEnabled) {
      const runs = this.getOfflineRuns();
      runs.push(localRun);
      this.setOfflineRuns(runs);
      return this.buildOfflineFinishResponse(localRun);
    }

    try {
      const response = await this.request("/api/run/finish", {
        method: "POST",
        body: {
          ...localRun,
          sessionId: this.currentSession?.id || localRun.sessionId,
        },
      });
      if (response.player) {
        this.savePlayer({ ...this.player, ...response.player });
      }
      return response;
    } catch {
      const runs = this.getOfflineRuns();
      runs.push(localRun);
      this.setOfflineRuns(runs);
      return this.buildOfflineFinishResponse(localRun, true);
    }
  }

  buildOfflineFinishResponse(run, fallback = false) {
    const global = this.computeOfflineLeaderboard("global", run.cityKey, 100);
    const weekly = this.computeOfflineLeaderboard("weekly", run.cityKey, 100);
    const city = this.computeOfflineLeaderboard("city", run.cityKey, 100);
    const globalRank = global.findIndex((entry) => entry.playerId === run.playerId) + 1 || null;
    const weeklyRank = weekly.findIndex((entry) => entry.playerId === run.playerId) + 1 || null;
    const cityRank = city.findIndex((entry) => entry.playerId === run.playerId) + 1 || null;
    return {
      ok: true,
      run,
      rankings: { globalRank, weeklyRank, cityRank },
      leaderboardPreview: global.slice(0, 5),
      source: fallback ? "offline-fallback" : "offline",
      player: this.player,
    };
  }
}

class CompetitionUI {
  constructor() {
    this.client = new CompetitionClient();
    this.cityKey = "valencia";
    this.activeScope = localStorage.getItem(ACTIVE_SCOPE_KEY) || "global";
    this.pendingStart = null;
    this.bound = false;
    this.refs = {};
  }

  init() {
    if (this.bound) return;
    this.bound = true;
    this.refs.playerBadge = document.querySelector("#player-badge");
    this.refs.playerBestBadge = document.querySelector("#player-best-badge");
    this.refs.changePlayer = document.querySelector("#change-player");
    this.refs.tabs = Array.from(document.querySelectorAll("[data-board]"));
    this.refs.list = document.querySelector("#leaderboard-list");
    this.refs.empty = document.querySelector("#leaderboard-empty");
    this.refs.status = document.querySelector("#leaderboard-status");
    this.refs.refresh = document.querySelector("#leaderboard-refresh");
    this.refs.playerModal = document.querySelector("#player-modal");
    this.refs.playerForm = document.querySelector("#player-form");
    this.refs.playerNickname = document.querySelector("#player-nickname");
    this.refs.playerFormStatus = document.querySelector("#player-form-status");
    this.refs.resultModal = document.querySelector("#result-modal");
    this.refs.resultClose = document.querySelector("#result-close");
    this.refs.resultScore = document.querySelector("#result-score");
    this.refs.resultCity = document.querySelector("#result-city");
    this.refs.resultRank = document.querySelector("#result-rank");
    this.refs.resultCombo = document.querySelector("#result-combo");
    this.refs.resultGlobalPosition = document.querySelector("#result-global-position");
    this.refs.resultWeeklyPosition = document.querySelector("#result-weekly-position");
    this.refs.resultCityPosition = document.querySelector("#result-city-position");
    this.refs.resultSummaryCopy = document.querySelector("#result-summary-copy");
    this.refs.resultTopList = document.querySelector("#result-top-list");

    this.refs.changePlayer?.addEventListener("click", () => this.openPlayerModal());
    this.refs.refresh?.addEventListener("click", () => this.refreshLeaderboard());
    this.refs.resultClose?.addEventListener("click", () => this.hideResult());
    this.refs.tabs?.forEach((tab) => {
      tab.addEventListener("click", () => {
        this.activeScope = tab.dataset.board || "global";
        localStorage.setItem(ACTIVE_SCOPE_KEY, this.activeScope);
        this.syncTabs();
        this.refreshLeaderboard();
      });
    });
    this.refs.playerForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      await this.handlePlayerSubmit();
    });

    this.renderPlayer();
    this.syncTabs();
    this.refreshLeaderboard();
  }

  setCity(cityKey) {
    this.cityKey = cityKey;
    if (this.activeScope === "city") {
      this.refreshLeaderboard();
    }
  }

  renderPlayer() {
    const player = this.client.player;
    if (this.refs.playerBadge) {
      this.refs.playerBadge.textContent = player?.nickname || "Invitado";
    }
    if (this.refs.playerBestBadge) {
      this.refs.playerBestBadge.textContent = player?.bestScore ? `PB ${padScore(player.bestScore)}` : "Sin marca";
    }
  }

  syncTabs() {
    this.refs.tabs?.forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.board === this.activeScope);
    });
  }

  openPlayerModal(onReady) {
    this.pendingStart = onReady || this.pendingStart;
    this.refs.playerModal?.classList.remove("is-hidden");
    this.refs.playerModal?.setAttribute("aria-hidden", "false");
    if (this.refs.playerNickname) {
      this.refs.playerNickname.value = this.client.player?.nickname || "";
      this.refs.playerNickname.focus();
      this.refs.playerNickname.select();
    }
  }

  closePlayerModal() {
    this.refs.playerModal?.classList.add("is-hidden");
    this.refs.playerModal?.setAttribute("aria-hidden", "true");
  }

  hideResult() {
    this.refs.resultModal?.classList.add("is-hidden");
    this.refs.resultModal?.setAttribute("aria-hidden", "true");
  }

  showResult(result, payload) {
    if (!this.refs.resultModal) return;
    const rankings = result.rankings || {};
    this.refs.resultScore.textContent = padScore(payload.score);
    this.refs.resultCity.textContent = CITY_LABELS[payload.cityKey] || payload.cityKey.toUpperCase();
    this.refs.resultRank.textContent = payload.rankLabel || (payload.victory ? "VICTORIA" : "RUNNER");
    this.refs.resultCombo.textContent = `x${payload.comboMax || 1}`;
    this.refs.resultGlobalPosition.textContent = rankings.globalRank ? `#${rankings.globalRank}` : "--";
    this.refs.resultWeeklyPosition.textContent = rankings.weeklyRank ? `#${rankings.weeklyRank}` : "--";
    this.refs.resultCityPosition.textContent = rankings.cityRank ? `#${rankings.cityRank}` : "--";
    this.refs.resultSummaryCopy.textContent =
      result.source === "offline" || result.source === "offline-fallback"
        ? "Resultado guardado en modo local. Al activar la base de datos online, este panel mostrará el ranking mundial real."
        : "Resultado enviado al circuito online. Ya estás compitiendo contra el resto de jugadores.";
    this.refs.resultTopList.innerHTML = "";
    const preview = result.leaderboardPreview || [];
    preview.forEach((entry, index) => {
      const item = document.createElement("li");
      item.className = "result-top-item";
      item.innerHTML = `
        <span class="result-top-rank">#${entry.rank || index + 1}</span>
        <span class="result-top-name">${entry.nickname}</span>
        <strong class="result-top-score">${padScore(entry.score)}</strong>
      `;
      this.refs.resultTopList.appendChild(item);
    });
    this.refs.resultModal.classList.remove("is-hidden");
    this.refs.resultModal.setAttribute("aria-hidden", "false");
  }

  async handlePlayerSubmit() {
    const nickname = this.refs.playerNickname?.value?.trim() || "";
    this.refs.playerFormStatus.textContent = "Registrando dorsal...";
    try {
      await this.client.registerPlayer(nickname);
      this.renderPlayer();
      this.refs.playerFormStatus.textContent = "Apodo guardado. Ya puedes competir.";
      this.closePlayerModal();
      await this.refreshLeaderboard();
      if (this.pendingStart) {
        const fn = this.pendingStart;
        this.pendingStart = null;
        fn();
      }
    } catch (error) {
      this.refs.playerFormStatus.textContent = error.message || "No se pudo guardar el apodo.";
    }
  }

  ensurePlayerForStart(onReady) {
    if (this.client.player) {
      return true;
    }
    this.openPlayerModal(onReady);
    return false;
  }

  async refreshLeaderboard() {
    if (!this.refs.list || !this.refs.empty || !this.refs.status) return;
    this.refs.status.textContent = "Actualizando ranking...";
    const payload = await this.client.fetchLeaderboard(this.activeScope, this.cityKey, 8);
    const entries = payload.entries || [];
    this.refs.list.innerHTML = "";
    if (!entries.length) {
      this.refs.empty.style.display = "block";
      this.refs.empty.textContent = "Aún no hay carreras válidas. Sé el primero en dejar huella.";
    } else {
      this.refs.empty.style.display = "none";
      entries.forEach((entry, index) => {
        const item = document.createElement("li");
        item.className = "leaderboard-item";
        if (entry.playerId === this.client.player?.id) {
          item.classList.add("is-self");
        }
        item.innerHTML = `
          <span class="leaderboard-rank">#${entry.rank || index + 1}</span>
          <span class="leaderboard-name">${entry.nickname}</span>
          <strong class="leaderboard-score">${padScore(entry.score)}</strong>
        `;
        this.refs.list.appendChild(item);
      });
    }
    const suffix =
      this.activeScope === "city"
        ? `ciudad: ${CITY_LABELS[this.cityKey] || this.cityKey}`
        : this.activeScope === "weekly"
          ? "semana actual"
          : "circuito global";
    this.refs.status.textContent =
      payload.source === "offline" || payload.source === "offline-fallback"
        ? `Ranking local (${suffix})`
        : `Ranking online (${suffix})`;
  }

  async startRun(cityKey) {
    this.hideResult();
    this.setCity(cityKey);
    return this.client.startRun(cityKey);
  }

  async finishRun(payload) {
    const result = await this.client.finishRun(payload);
    this.renderPlayer();
    await this.refreshLeaderboard();
    this.showResult(result, payload);
    return result;
  }
}

export const competitionUi = new CompetitionUI();
competitionUi.init();
