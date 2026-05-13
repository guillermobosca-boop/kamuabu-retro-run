import { competitionUi } from "./competition.js";

const BASE_WIDTH = 960;
const BASE_HEIGHT = 540;
const GAME_SCALE = 4 / 3;
const WIDTH = BASE_WIDTH * GAME_SCALE;
const HEIGHT = BASE_HEIGHT * GAME_SCALE;
const GROUND_Y = 438 * GAME_SCALE;
const BEST_KEY = "kamuabu-retro-run-best";
const RENDER_RESOLUTION = Math.min(window.devicePixelRatio || 1, 2);
const sx = (value) => value * GAME_SCALE;
const sy = (value) => value * GAME_SCALE;

const scoreEl = document.querySelector("#score");
const comboEl = document.querySelector("#combo");
const bestEl = document.querySelector("#best");
const cityEl = document.querySelector("#city");
const socksEl = document.querySelector("#socks");
const stateEl = document.querySelector("#state");
const weaponEl = document.querySelector("#weapon");
const missionEl = document.querySelector("#mission");
const progressFillEl = document.querySelector("#progress-fill");
const progressDistanceEl = document.querySelector("#progress-distance");
const progressLabelEl = document.querySelector("#progress-label");
const progressPhaseEl = document.querySelector("#progress-phase");
const progressMiniEl = document.querySelector("#progress-mini");
const progressBossEl = document.querySelector("#progress-boss");
const touchButtons = Array.from(document.querySelectorAll("[data-touch]"));
const mobilePortraitQuery = window.matchMedia("(max-width: 900px) and (orientation: portrait)");

const updateViewportMode = () => {
  document.body.classList.toggle("mobile-portrait", mobilePortraitQuery.matches);
};
updateViewportMode();
if (typeof mobilePortraitQuery.addEventListener === "function") {
  mobilePortraitQuery.addEventListener("change", updateViewportMode);
} else if (typeof mobilePortraitQuery.addListener === "function") {
  mobilePortraitQuery.addListener(updateViewportMode);
}
window.addEventListener("resize", updateViewportMode);

const padScore = (value) => String(Math.floor(value)).padStart(6, "0");
const clampByte = (value) => Math.max(0, Math.min(255, Math.round(value)));
const tintColor = (hex, amount = 0) => {
  const r = (hex >> 16) & 0xff;
  const g = (hex >> 8) & 0xff;
  const b = hex & 0xff;
  const next = (channel) =>
    amount >= 0 ? channel + (255 - channel) * amount : channel * (1 + amount);
  return (clampByte(next(r)) << 16) | (clampByte(next(g)) << 8) | clampByte(next(b));
};
const cssHex = (hex) => `#${hex.toString(16).padStart(6, "0")}`;
const ART_DIRECTION = {
  style: "32-bit arcade premium",
  runner: {
    skin: 0xf1c798,
    skinLight: 0xf7dbc0,
    hair: 0x5d2c1d,
    shirt: 0xd93542,
    shirtLight: 0xf16b53,
    shirtShadow: 0x8c1e2e,
    shirtPower: 0xffd95c,
    shirtPowerLight: 0xffef9d,
    shirtPowerShadow: 0xc49a3a,
    stripe: 0xff8b22,
    sleeve: 0x40d8ff,
    pants: 0x6e785c,
    pantsLight: 0x879372,
    pantsShadow: 0x47513f,
    shoes: 0x202126,
    shoesLight: 0x4e545d,
    weapon: 0x3d4249,
    weaponLight: 0x686f77,
    white: 0xf2ead8,
    outline: 0x111218,
  },
};

const CITIES = [
  {
    key: "valencia",
    name: "Valencia",
    sky: "#93d8e8",
    wall: 0x7f8178,
    brickA: 0x9e9b90,
    brickB: 0x6d6960,
    road: 0x3e3c38,
    accent: 0xff8b47,
    highlight: 0xffe2a7,
    shadow: 0x45413a,
    glow: 0x5ee2d8,
    sign: "VALENCIA SUN RUN",
    landmark: "CIUTAT + SERRANOS",
    obstaclePool: ["barrel", "barrel", "barricade"],
  },
  {
    key: "roma",
    name: "Roma",
    sky: "#bc8667",
    wall: 0x8c694f,
    brickA: 0xa07a5d,
    brickB: 0x654b3a,
    road: 0x3d322d,
    accent: 0xd0824d,
    highlight: 0xe7c79b,
    shadow: 0x3a2e29,
    glow: 0xbba37d,
    sign: "KAMUABU ROMA",
    landmark: "ARCOS ANTIGUOS",
    obstaclePool: ["barrel", "barricade", "barrel"],
  },
  {
    key: "paris",
    name: "Paris",
    sky: "#4a48c2",
    wall: 0x566074,
    brickA: 0x667489,
    brickB: 0x3f4858,
    road: 0x2b313d,
    accent: 0x53dfff,
    highlight: 0xf0eadc,
    shadow: 0x293446,
    glow: 0x77eaff,
    sign: "KAMUABU PARIS",
    landmark: "TORRE NEON",
    obstaclePool: ["drone", "barrel", "barricade"],
  },
  {
    key: "venecia",
    name: "Venecia",
    sky: "#82b6be",
    wall: 0x768070,
    brickA: 0x8b9386,
    brickB: 0x566560,
    road: 0x2f5560,
    accent: 0x54d9c7,
    highlight: 0xa4efe6,
    shadow: 0x2f4d58,
    glow: 0xb48b64,
    sign: "KAMUABU CANAL",
    landmark: "PUENTE + CANAL",
    obstaclePool: ["drone", "barrel", "drone"],
  },
  {
    key: "londres",
    name: "Londres",
    sky: "#415067",
    wall: 0x606671,
    brickA: 0x747c88,
    brickB: 0x434954,
    road: 0x2b3038,
    accent: 0xc92d45,
    highlight: 0xd4c28d,
    shadow: 0x2d3442,
    glow: 0xb9d0e7,
    sign: "KAMUABU LDN",
    landmark: "ROYAL ROAD / NIGHT SHIFT",
    obstaclePool: ["barricade", "drone", "barricade"],
  },
];

const getCity = (key) => CITIES.find((city) => city.key === key) || CITIES[0];

const CITY_ART = {
  valencia: {
    top: 0x9dddf2,
    mid: 0xcdecef,
    bottom: 0xffcf9b,
    glow: 0xffa96d,
    sun: 0xfff3c5,
    haze: 0xffefd4,
    farA: 0xcfe6ec,
    farB: 0xa8c8d3,
    nearA: 0x6f99b1,
    nearB: 0x4f718c,
    water: 0x73ddd8,
  },
  roma: {
    top: 0xb87d62,
    mid: 0xdba06e,
    bottom: 0xf2d1a1,
    glow: 0xf1b07b,
    sun: 0xffebbe,
    haze: 0xe8c89d,
    farA: 0x9c7a67,
    farB: 0x755646,
    nearA: 0x65483a,
    nearB: 0x513629,
    water: 0xcaa07b,
  },
  paris: {
    top: 0x2e2aa8,
    mid: 0x6058d1,
    bottom: 0xe2c4ef,
    glow: 0xff92d8,
    sun: 0xf7f5ff,
    haze: 0xd8d3ff,
    farA: 0x433ab4,
    farB: 0x2a2586,
    nearA: 0x253049,
    nearB: 0x1d2438,
    water: 0x8ddff6,
  },
  venecia: {
    top: 0x6e9fb1,
    mid: 0xa7d2d2,
    bottom: 0xe8d9c4,
    glow: 0xffd5aa,
    sun: 0xf4f3d1,
    haze: 0xd4efe8,
    farA: 0x7692a0,
    farB: 0x4c6673,
    nearA: 0x405c66,
    nearB: 0x2b414a,
    water: 0x7ce2d8,
  },
  londres: {
    top: 0x273145,
    mid: 0x47566f,
    bottom: 0x97a4b4,
    glow: 0xc99b64,
    sun: 0xeae7cf,
    haze: 0xa9b4c0,
    farA: 0x354152,
    farB: 0x222c3a,
    nearA: 0x2a313d,
    nearB: 0x1a1f28,
    water: 0x8fb2c8,
  },
};

const ENEMY_TYPES = {
  sprinter: {
    key: "sprinter",
    label: "RUSH",
    prefix: "enemy-sprinter",
    hp: 2,
    moveSpeed: 118,
    retreatSpeed: 42,
    score: 180,
    canShoot: false,
    scale: 0.88,
    body: { width: 38, height: 66, offsetX: 24, offsetY: 18 },
  },
  bruiser: {
    key: "bruiser",
    label: "TANK",
    prefix: "enemy-bruiser",
    hp: 5,
    moveSpeed: 52,
    retreatSpeed: 18,
    score: 340,
    canShoot: false,
    scale: 0.98,
    body: { width: 52, height: 84, offsetX: 24, offsetY: 14 },
  },
  shooter: {
    key: "shooter",
    label: "SHOT",
    prefix: "enemy-shooter",
    hp: 3,
    moveSpeed: 68,
    retreatSpeed: 34,
    score: 260,
    canShoot: true,
    scale: 0.92,
    body: { width: 42, height: 72, offsetX: 22, offsetY: 14 },
  },
};

const NOTE_FREQ = {
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
};

class ArcadeAudio {
  constructor() {
    this.ctx = null;
    this.musicEvent = null;
    this.musicScene = null;
  }

  ensure() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        return null;
      }
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  tone(freq, duration = 0.12, type = "square", volume = 0.035, delay = 0) {
    const ctx = this.ensure();
    if (!ctx || !freq) {
      return;
    }
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  noise(duration = 0.08, volume = 0.03) {
    const ctx = this.ensure();
    if (!ctx) {
      return;
    }
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  }

  kick(delay = 0, volume = 0.06) {
    const ctx = this.ensure();
    if (!ctx) {
      return;
    }
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(132, start);
    osc.frequency.exponentialRampToValueAtTime(42, start + 0.12);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.16);
  }

  hat(delay = 0, volume = 0.012, open = false) {
    this.noise(open ? 0.06 : 0.025, volume);
    const ctx = this.ensure();
    if (!ctx) {
      return;
    }
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(open ? 6800 : 8200, start);
    gain.gain.setValueAtTime(volume * 0.7, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + (open ? 0.08 : 0.03));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + (open ? 0.1 : 0.04));
  }

  playSfx(name, variant = null) {
    const ctx = this.ensure();
    if (!ctx) {
      return;
    }
    if (name === "shoot") {
      this.tone(880, 0.05, "square", 0.028);
      this.tone(660, 0.04, "square", 0.018, 0.02);
    } else if (name === "jump") {
      this.tone(523.25, 0.06, "square", 0.03);
      this.tone(783.99, 0.08, "square", 0.024, 0.03);
    } else if (name === "hit") {
      this.noise(0.06, 0.03);
      this.tone(180, 0.08, "sawtooth", 0.02);
    } else if (name === "reward") {
      this.tone(659.25, 0.05, "square", 0.028);
      this.tone(783.99, 0.05, "square", 0.028, 0.05);
      this.tone(987.77, 0.08, "square", 0.024, 0.1);
    } else if (name === "combo") {
      const tier = variant ?? 1;
      const sequences = {
        3: ["E5", "G5", "B4"],
        5: ["G5", "B4", "D5"],
        7: ["A5", "C5", "E5"],
        9: ["C5", "E5", "G5", "A5"],
      };
      const notes = sequences[tier] || ["E5", "G5", "B4"];
      notes.forEach((note, index) => this.tone(NOTE_FREQ[note], 0.06 + index * 0.01, "square", 0.028, index * 0.045));
      this.hat(0.02, 0.01);
    } else if (name === "boss") {
      if (variant === "spawn") {
        this.kick(0, 0.07);
        this.tone(NOTE_FREQ.C4, 0.12, "sawtooth", 0.03, 0.03);
        this.tone(NOTE_FREQ.G4, 0.16, "square", 0.028, 0.12);
      } else if (variant === "phase") {
        this.kick(0, 0.06);
        this.tone(NOTE_FREQ.D4, 0.08, "square", 0.03, 0.03);
        this.tone(NOTE_FREQ.F5, 0.09, "square", 0.026, 0.1);
      } else if (variant === "ko") {
        this.tone(NOTE_FREQ.A4, 0.08, "square", 0.028);
        this.tone(NOTE_FREQ.F4, 0.1, "sawtooth", 0.024, 0.08);
        this.tone(NOTE_FREQ.D4, 0.16, "triangle", 0.028, 0.18);
      }
    } else if (name === "gameover") {
      this.kick(0.01, 0.05);
      this.tone(392.0, 0.14, "sawtooth", 0.03);
      this.tone(311.13, 0.18, "sawtooth", 0.028, 0.12);
      this.tone(261.63, 0.24, "triangle", 0.026, 0.28);
      this.noise(0.08, 0.014);
    } else if (name === "victory") {
      this.kick(0, 0.045);
      this.tone(523.25, 0.08, "square", 0.03);
      this.tone(659.25, 0.08, "square", 0.03, 0.08);
      this.tone(783.99, 0.08, "square", 0.03, 0.16);
      this.tone(1046.5, 0.18, "triangle", 0.026, 0.28);
      this.tone(659.25, 0.12, "triangle", 0.018, 0.36);
    }
  }

  stopMusic() {
    if (this.musicEvent) {
      this.musicEvent.remove(false);
      this.musicEvent = null;
    }
    this.musicScene = null;
  }

  startPattern(scene, pattern, bpm = 128) {
    this.stopMusic();
    this.musicScene = scene;
    const phrases = Array.isArray(pattern[0]) ? pattern : [pattern];
    let step = 0;
    let phraseIndex = 0;
    const interval = (60 / bpm) * 1000 / 2;
    this.musicEvent = scene.time.addEvent({
      delay: interval,
      loop: true,
      callback: () => {
        const phrase = phrases[phraseIndex % phrases.length];
        const current = phrase[step];
        if (current.lead) {
          this.tone(NOTE_FREQ[current.lead], 0.11, "square", 0.018);
        }
        if (current.harmony) {
          this.tone(NOTE_FREQ[current.harmony], 0.09, "triangle", 0.013, 0.01);
        }
        if (current.arp) {
          current.arp.forEach((note, index) =>
            this.tone(NOTE_FREQ[note], 0.04, "square", 0.012, index * 0.032),
          );
        }
        if (current.bass) {
          this.tone(NOTE_FREQ[current.bass], 0.15, "triangle", 0.024);
        }
        if (current.kick) {
          this.kick(0, current.kick === true ? 0.045 : current.kick);
        }
        if (current.snare) {
          this.noise(0.035, 0.011);
        }
        if (current.hat) {
          const hatOpen = current.hat === "open";
          const hatVolume = typeof current.hat === "number" ? current.hat : 0.007;
          this.hat(0.01, hatVolume, hatOpen);
        }
        step += 1;
        if (step >= phrase.length) {
          step = 0;
          phraseIndex += 1;
        }
      },
    });
  }

  startMenuMusic(scene) {
    const pattern = [
      [
        { lead: "C5", harmony: "E5", bass: "C4", kick: true },
        {},
        { arp: ["E5", "G5"], hat: 0.006 },
        {},
        { lead: "G5", harmony: "C5", bass: "G4", snare: true, hat: "open" },
        {},
        { lead: "E5", hat: 0.005 },
        {},
      ],
      [
        { lead: "D5", harmony: "F5", bass: "A4", kick: true },
        {},
        { arp: ["F5", "A5"], hat: 0.006 },
        {},
        { lead: "A5", harmony: "C5", bass: "F4", snare: true, hat: "open" },
        {},
        { lead: "G5", bass: "C4" },
        {},
      ],
    ];
    this.startPattern(scene, pattern, 118);
  }

  startCityMusic(scene, cityKey) {
    const patterns = {
      valencia: [
        [
          { lead: "E5", harmony: "A5", bass: "A4", kick: true },
          {},
          { arp: ["G5", "A5"], hat: 0.006 },
          {},
          { lead: "A5", harmony: "E5", bass: "E4", snare: true, hat: "open" },
          {},
          { lead: "E5", bass: "A4" },
          {},
        ],
        [
          { lead: "D5", harmony: "F5", bass: "F4", kick: true },
          {},
          { arp: ["E5", "G5"], hat: 0.006 },
          {},
          { lead: "G5", harmony: "A5", bass: "D4", snare: true, hat: "open" },
          {},
          { lead: "A5", bass: "A4", hat: 0.005 },
          {},
        ],
      ],
      roma: [
        [
          { lead: "C5", harmony: "G4", bass: "C4", kick: true },
          {},
          { arp: ["D5", "F5"], hat: 0.006 },
          {},
          { lead: "G5", harmony: "D5", bass: "G4", snare: true, hat: "open" },
          {},
          { lead: "F5", bass: "C4" },
          {},
        ],
        [
          { lead: "E5", harmony: "A4", bass: "A4", kick: true },
          {},
          { arp: ["D5", "C5"], hat: 0.006 },
          {},
          { lead: "C5", harmony: "F4", bass: "F4", snare: true, hat: "open" },
          {},
          { lead: "G4", bass: "C4", hat: 0.005 },
          {},
        ],
      ],
      paris: [
        [
          { lead: "G5", harmony: "B4", bass: "E4", kick: true },
          {},
          { arp: ["A5", "G5"], hat: 0.006 },
          {},
          { lead: "E5", harmony: "B4", bass: "B4", snare: true, hat: "open" },
          {},
          { lead: "D5", bass: "E4" },
          {},
        ],
        [
          { lead: "F5", harmony: "A5", bass: "D4", kick: true },
          {},
          { arp: ["A5", "G5"], hat: 0.006 },
          {},
          { lead: "G5", harmony: "E5", bass: "C4", snare: true, hat: "open" },
          {},
          { lead: "E5", bass: "E4", hat: 0.005 },
          {},
        ],
      ],
      venecia: [
        [
          { lead: "A4", harmony: "C5", bass: "F4", kick: true },
          {},
          { arp: ["C5", "E5"], hat: 0.006 },
          {},
          { lead: "E5", harmony: "A5", bass: "A4", snare: true, hat: "open" },
          {},
          { lead: "D5", bass: "F4" },
          {},
        ],
        [
          { lead: "C5", harmony: "A4", bass: "G4", kick: true },
          {},
          { arp: ["A4", "C5"], hat: 0.006 },
          {},
          { lead: "F4", harmony: "A4", bass: "E4", snare: true, hat: "open" },
          {},
          { lead: "E5", bass: "A4", hat: 0.005 },
          {},
        ],
      ],
      londres: [
        [
          { lead: "D5", harmony: "A4", bass: "D4", kick: true },
          {},
          { arp: ["F5", "A5"], hat: 0.006 },
          {},
          { lead: "A5", harmony: "D5", bass: "D4", snare: true, hat: "open" },
          {},
          { lead: "G5", bass: "D4" },
          {},
        ],
        [
          { lead: "E5", harmony: "G5", bass: "C4", kick: true },
          {},
          { arp: ["D5", "F5"], hat: 0.006 },
          {},
          { lead: "F5", harmony: "A4", bass: "A4", snare: true, hat: "open" },
          {},
          { lead: "C5", bass: "D4", hat: 0.005 },
          {},
        ],
      ],
    };
    this.startPattern(scene, patterns[cityKey] || patterns.londres, 126);
  }

  startBossMusic(scene, cityKey) {
    const patterns = {
      valencia: [
        [
          { lead: "A4", harmony: "C5", bass: "A3", kick: true, hat: 0.007 },
          { arp: ["C5", "E5"] },
          { lead: "E5", harmony: "A5", bass: "E4", snare: true, hat: "open" },
          { lead: "D5", bass: "A3" },
        ],
        [
          { lead: "G4", harmony: "C5", bass: "F3", kick: true, hat: 0.007 },
          { arp: ["C5", "D5"] },
          { lead: "F5", harmony: "A5", bass: "D4", snare: true, hat: "open" },
          { lead: "E5", bass: "A3" },
        ],
      ],
      roma: [
        [
          { lead: "C5", harmony: "F4", bass: "C4", kick: true, hat: 0.007 },
          { arp: ["D5", "G5"] },
          { lead: "G5", harmony: "C5", bass: "G4", snare: true, hat: "open" },
          { lead: "F5", bass: "C4" },
        ],
        [
          { lead: "A4", harmony: "D5", bass: "A3", kick: true, hat: 0.007 },
          { arp: ["C5", "F5"] },
          { lead: "F5", harmony: "A4", bass: "F4", snare: true, hat: "open" },
          { lead: "D5", bass: "C4" },
        ],
      ],
      paris: [
        [
          { lead: "E5", harmony: "G5", bass: "E4", kick: true, hat: 0.007 },
          { arp: ["G5", "A5"] },
          { lead: "A5", harmony: "E5", bass: "B3", snare: true, hat: "open" },
          { lead: "G5", bass: "E4" },
        ],
        [
          { lead: "D5", harmony: "F5", bass: "D4", kick: true, hat: 0.007 },
          { arp: ["F5", "G5"] },
          { lead: "G5", harmony: "D5", bass: "A3", snare: true, hat: "open" },
          { lead: "E5", bass: "E4" },
        ],
      ],
      venecia: [
        [
          { lead: "A4", harmony: "E5", bass: "A3", kick: true, hat: 0.007 },
          { arp: ["C5", "E5"] },
          { lead: "E5", harmony: "A5", bass: "F4", snare: true, hat: "open" },
          { lead: "D5", bass: "A3" },
        ],
        [
          { lead: "G4", harmony: "C5", bass: "G3", kick: true, hat: 0.007 },
          { arp: ["A4", "C5"] },
          { lead: "F5", harmony: "A5", bass: "E4", snare: true, hat: "open" },
          { lead: "E5", bass: "A3" },
        ],
      ],
      londres: [
        [
          { lead: "D5", harmony: "F5", bass: "D4", kick: true, hat: 0.007 },
          { arp: ["F5", "A5"] },
          { lead: "A5", harmony: "D5", bass: "A3", snare: true, hat: "open" },
          { lead: "F5", bass: "D4" },
        ],
        [
          { lead: "C5", harmony: "E5", bass: "C4", kick: true, hat: 0.007 },
          { arp: ["E5", "G5"] },
          { lead: "G5", harmony: "C5", bass: "G3", snare: true, hat: "open" },
          { lead: "D5", bass: "D4" },
        ],
      ],
    };
    this.startPattern(scene, patterns[cityKey] || patterns.londres, 142);
  }
}

const arcadeAudio = new ArcadeAudio();

class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    this.createPixelTextures();
    this.scene.start("MenuScene");
  }

  createPixelTextures() {
    this.createRunnerTexture();
    this.createRunnerRunTexture();
    this.createRunnerRunMidTexture();
    this.createRunnerRunAltTexture();
    this.createRunnerSprintTexture();
    this.createRunnerSprintAltTexture();
    this.createRunnerBigTexture();
    this.createRunnerBigRunTexture();
    this.createRunnerBigRunMidTexture();
    this.createRunnerBigRunAltTexture();
    this.createRunnerDuckTexture();
    this.createRunnerBigDuckTexture();
    this.createRunnerJumpTextures();
    this.createRunnerScooterTextures();
    this.createObstacleTextures();
    this.createRewardTextures();
    this.createCombatTextures();
    this.createEffectTextures();
  }

  paintRunnerFigure(g, pose = {}) {
    const lean = pose.lean ?? 0;
    const crouch = !!pose.crouch;
    const jump = !!pose.jump;
    const leadLeg = pose.leadLeg ?? 0;
    const trailLeg = pose.trailLeg ?? 0;
    const leadFoot = pose.leadFoot ?? 0;
    const trailFoot = pose.trailFoot ?? 0;
    const armSwing = pose.armSwing ?? 0;
    const weaponLift = pose.weaponLift ?? 0;
    const torsoDrop = pose.torsoDrop ?? 0;
    const headShift = pose.headShift ?? 0;
    const headY = crouch ? 15 : 8;
    const torsoY = 34 + torsoDrop + (crouch ? 11 : 0) + (jump ? -3 : 0);
    const torsoH = crouch ? 22 : 28;
    const legY = torsoY + torsoH;
    const gunY = torsoY + (crouch ? 6 : 9) + weaponLift;
    const frontLegH = crouch ? 16 : jump ? 16 : 24;
    const backLegH = crouch ? 15 : jump ? 19 : 25;

    g.fillStyle(0x0d0f14);
    g.fillRect(18, legY + frontLegH - 1, 30 + leadFoot, 8);
    g.fillRect(48 + trailLeg, legY + backLegH, 32 + trailFoot, 8);

    g.fillStyle(0x1a1d26);
    g.fillRect(24 + lean, torsoY - 3, 12, 46);
    g.fillRect(25 + lean, torsoY - 9, 18, 10);
    g.fillStyle(0x2e3441);
    g.fillRect(26 + lean, torsoY, 8, 17);
    g.fillStyle(0x111318);
    g.fillRect(28 + lean, torsoY + 2, 4, 12);

    g.fillStyle(0xf2ead8);
    g.fillRect(35 + lean, torsoY, 33, 10);
    g.fillStyle(0xd0c8ba);
    g.fillRect(36 + lean, torsoY + 7, 31, 3);

    g.fillStyle(0xd93542);
    g.fillRect(32 + lean, torsoY + 10, 40, torsoH);
    g.fillStyle(0xf16b53);
    g.fillRect(35 + lean, torsoY + 13, 15, 7);
    g.fillStyle(0x8c1e2e);
    g.fillRect(63 + lean, torsoY + 10, 7, torsoH);
    g.fillStyle(0xff8b22);
    g.fillRect(44 + lean, torsoY + 16, 17, 5);
    g.fillStyle(0x253c58);
    g.fillRect(28 + lean, torsoY + 13, 8, 14);
    g.fillStyle(0x40d8ff);
    g.fillRect(26 + lean, torsoY + 16, 7, 8);

    g.fillStyle(0xf1c798);
    g.fillRect(44 + lean + headShift, headY, 24, 24);
    g.fillRect(61 + armSwing, gunY - 1, 12, 8);
    g.fillRect(27 + lean, torsoY + 9, 10, 9);
    g.fillStyle(0xf8dfc2);
    g.fillRect(48 + lean + headShift, headY + 3, 8, 4);
    g.fillRect(62 + armSwing, gunY, 5, 3);

    g.fillStyle(0xffd95c);
    g.fillRect(40 + lean + headShift, headY - 4, 29, 6);
    g.fillRect(59 + lean + headShift, headY + 1, 10, 4);
    g.fillStyle(0x5d2c1d);
    g.fillRect(37 + lean + headShift, headY + 4, 12, 21);
    g.fillRect(43 + lean + headShift, headY + 21, 21, 5);
    g.fillStyle(0x101218);
    g.fillRect(56 + lean + headShift, headY + 9, 5, 4);

    g.fillStyle(0x1a1d24);
    g.fillRect(64 + armSwing, gunY - 2, 36, 8);
    g.fillRect(97 + armSwing, gunY - 1, 15, 5);
    g.fillStyle(0x4f5762);
    g.fillRect(67 + armSwing, gunY - 2, 12, 3);
    g.fillStyle(0x9aa5af);
    g.fillRect(89 + armSwing, gunY, 10, 2);
    g.fillStyle(0xffb45a);
    g.fillRect(100 + armSwing, gunY + 1, 6, 2);

    const frontLegX = 36 + leadLeg;
    const backLegX = 56 + trailLeg;
    g.fillStyle(0x6e785c);
    g.fillRect(frontLegX, legY, 14, frontLegH);
    g.fillRect(backLegX, legY - (jump ? 2 : 0), 14, backLegH);
    g.fillStyle(0x879372);
    g.fillRect(frontLegX + 2, legY + 2, 6, 7);
    g.fillRect(backLegX + 2, legY + 2, 6, 7);
    g.fillStyle(0x47513f);
    g.fillRect(frontLegX + 9, legY, 5, frontLegH);
    g.fillRect(backLegX + 9, legY - (jump ? 2 : 0), 5, backLegH);
    g.fillStyle(0x2f4a39);
    g.fillRect(frontLegX + 3, legY + 2, 8, 7);
    g.fillRect(backLegX + 3, legY + 2, 8, 7);

    g.fillStyle(0x202126);
    g.fillRect(frontLegX - 3, legY + frontLegH - 1, 20 + leadFoot, 7);
    g.fillRect(backLegX - 2, legY + backLegH, 21 + trailFoot, 7);
    g.fillStyle(0x4e545d);
    g.fillRect(frontLegX - 1, legY + frontLegH - 1, 9, 3);
    g.fillRect(backLegX, legY + backLegH, 9, 3);
  }

  buildRunnerPoseTexture(key, pose) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    this.paintRunnerFigure(g, pose);
    g.generateTexture(key, 124, 102);
    g.destroy();
  }

  createRunnerTexture() {
    this.buildRunnerPoseTexture("runner-small", {});
  }

  createRunnerRunTexture() {
    this.buildRunnerPoseTexture("runner-small-run", {
      lean: 3,
      leadLeg: -8,
      trailLeg: 8,
      leadFoot: 4,
      trailFoot: -1,
      armSwing: 3,
      weaponLift: -1,
      torsoDrop: -1,
    });
  }

  createRunnerRunMidTexture() {
    this.buildRunnerPoseTexture("runner-small-run-mid", {
      lean: 2,
      leadLeg: -3,
      trailLeg: 3,
      leadFoot: 2,
      trailFoot: 1,
      armSwing: 1,
      torsoDrop: 0,
    });
  }

  createRunnerRunAltTexture() {
    this.buildRunnerPoseTexture("runner-small-run-alt", {
      lean: 1,
      leadLeg: 7,
      trailLeg: -8,
      leadFoot: -2,
      trailFoot: 5,
      armSwing: -5,
      weaponLift: 2,
      torsoDrop: 1,
      headShift: -1,
    });
  }

  createRunnerSprintTexture() {
    this.buildRunnerPoseTexture("runner-sprint-a", {
      lean: 8,
      leadLeg: -12,
      trailLeg: 10,
      leadFoot: 6,
      trailFoot: -2,
      armSwing: 6,
      weaponLift: -2,
      torsoDrop: -2,
      headShift: 1,
    });
  }

  createRunnerSprintAltTexture() {
    this.buildRunnerPoseTexture("runner-sprint-b", {
      lean: 7,
      leadLeg: 10,
      trailLeg: -11,
      leadFoot: -2,
      trailFoot: 7,
      armSwing: -7,
      weaponLift: 2,
      torsoDrop: -1,
      headShift: -1,
    });
  }

  createRunnerBigTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x111218);
    g.fillRect(8, 25, 14, 58);
    g.fillRect(18, 105, 90, 13);
    g.fillRect(62, 47, 62, 15);
    g.fillStyle(0xf1c798);
    g.fillRect(32, 8, 39, 38);
    g.fillRect(68, 52, 22, 15);
    g.fillStyle(0xffd95c);
    g.fillRect(28, 5, 46, 9);
    g.fillRect(66, 14, 20, 7);
    g.fillStyle(0x5d2c1d);
    g.fillRect(22, 14, 17, 37);
    g.fillRect(32, 42, 38, 9);
    g.fillStyle(0x15151c);
    g.fillRect(58, 24, 8, 7);
    g.fillRect(72, 56, 55, 7);
    g.fillStyle(0xf2ead8);
    g.fillRect(23, 52, 56, 14);
    g.fillStyle(0xd93542);
    g.fillRect(19, 66, 66, 27);
    g.fillStyle(0xf16b53);
    g.fillRect(24, 70, 27, 7);
    g.fillStyle(0x8c1e2e);
    g.fillRect(67, 66, 14, 27);
    g.fillStyle(0xff8b22);
    g.fillRect(36, 72, 34, 7);
    g.fillStyle(0x6e785c);
    g.fillRect(28, 93, 28, 30);
    g.fillRect(63, 91, 25, 32);
    g.fillStyle(0x879372);
    g.fillRect(31, 97, 13, 10);
    g.fillRect(66, 95, 11, 10);
    g.fillStyle(0x47513f);
    g.fillRect(46, 93, 10, 30);
    g.fillRect(78, 91, 10, 32);
    g.fillStyle(0x2f4a39);
    g.fillRect(34, 96, 16, 11);
    g.fillRect(68, 94, 15, 11);
    g.fillStyle(0x202126);
    g.fillRect(16, 122, 46, 10);
    g.fillRect(57, 122, 53, 10);
    g.fillStyle(0x4e545d);
    g.fillRect(18, 122, 18, 4);
    g.fillRect(59, 122, 20, 4);
    g.fillStyle(0x3d4249);
    g.fillRect(88, 46, 37, 11);
    g.fillRect(120, 50, 23, 6);
    g.fillStyle(0x686f77);
    g.fillRect(89, 46, 14, 4);
    g.fillStyle(0x40d8ff);
    g.fillRect(4, 61, 22, 10);
    g.fillRect(84, 68, 14, 7);
    g.generateTexture("runner-big", 146, 136);
    g.destroy();
  }

  createRunnerBigRunTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x111218);
    g.fillRect(8, 25, 14, 58);
    g.fillRect(20, 105, 84, 13);
    g.fillRect(66, 43, 64, 15);
    g.fillStyle(0xf1c798);
    g.fillRect(32, 8, 39, 38);
    g.fillRect(72, 49, 22, 15);
    g.fillStyle(0xffd95c);
    g.fillRect(28, 5, 46, 9);
    g.fillRect(66, 14, 20, 7);
    g.fillStyle(0x5d2c1d);
    g.fillRect(22, 14, 17, 37);
    g.fillRect(32, 42, 38, 9);
    g.fillStyle(0x15151c);
    g.fillRect(58, 24, 8, 7);
    g.fillRect(77, 53, 55, 7);
    g.fillStyle(0xf2ead8);
    g.fillRect(23, 52, 56, 14);
    g.fillStyle(0xd93542);
    g.fillRect(19, 66, 66, 27);
    g.fillStyle(0xf16b53);
    g.fillRect(24, 70, 27, 7);
    g.fillStyle(0x8c1e2e);
    g.fillRect(67, 66, 14, 27);
    g.fillStyle(0xff8b22);
    g.fillRect(36, 72, 34, 7);
    g.fillStyle(0x6e785c);
    g.fillRect(26, 93, 24, 30);
    g.fillRect(66, 88, 34, 26);
    g.fillStyle(0x879372);
    g.fillRect(29, 97, 11, 10);
    g.fillRect(70, 92, 14, 10);
    g.fillStyle(0x47513f);
    g.fillRect(42, 93, 8, 30);
    g.fillRect(86, 88, 14, 26);
    g.fillStyle(0x2f4a39);
    g.fillRect(32, 96, 14, 11);
    g.fillRect(73, 92, 20, 11);
    g.fillStyle(0x202126);
    g.fillRect(10, 122, 52, 10);
    g.fillRect(75, 112, 50, 10);
    g.fillStyle(0x4e545d);
    g.fillRect(12, 122, 18, 4);
    g.fillRect(77, 112, 18, 4);
    g.fillStyle(0x3d4249);
    g.fillRect(92, 43, 37, 11);
    g.fillRect(124, 47, 23, 6);
    g.fillStyle(0x686f77);
    g.fillRect(93, 43, 14, 4);
    g.fillStyle(0x40d8ff);
    g.fillRect(4, 61, 22, 10);
    g.fillRect(88, 65, 14, 7);
    g.generateTexture("runner-big-run", 146, 136);
    g.destroy();
  }

  createRunnerBigRunMidTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x111218);
    g.fillRect(9, 25, 14, 58);
    g.fillRect(20, 107, 90, 12);
    g.fillRect(64, 45, 62, 14);
    g.fillStyle(0xf1c798);
    g.fillRect(32, 8, 39, 38);
    g.fillRect(70, 49, 22, 15);
    g.fillStyle(0xffd95c);
    g.fillRect(28, 5, 46, 9);
    g.fillRect(66, 14, 20, 7);
    g.fillStyle(0x5d2c1d);
    g.fillRect(22, 14, 17, 37);
    g.fillRect(32, 42, 38, 9);
    g.fillStyle(0x15151c);
    g.fillRect(58, 24, 8, 7);
    g.fillRect(74, 53, 54, 7);
    g.fillStyle(0xf2ead8);
    g.fillRect(23, 52, 56, 14);
    g.fillStyle(0xd93542);
    g.fillRect(19, 66, 66, 27);
    g.fillStyle(0xf16b53);
    g.fillRect(24, 70, 27, 7);
    g.fillStyle(0x8c1e2e);
    g.fillRect(67, 66, 14, 27);
    g.fillStyle(0xff8b22);
    g.fillRect(36, 72, 34, 7);
    g.fillStyle(0x6e785c);
    g.fillRect(27, 93, 26, 28);
    g.fillRect(64, 92, 24, 29);
    g.fillStyle(0x879372);
    g.fillRect(30, 97, 12, 10);
    g.fillRect(67, 96, 11, 10);
    g.fillStyle(0x47513f);
    g.fillRect(43, 93, 10, 28);
    g.fillRect(78, 92, 10, 29);
    g.fillStyle(0x2f4a39);
    g.fillRect(33, 96, 15, 11);
    g.fillRect(69, 95, 14, 11);
    g.fillStyle(0x202126);
    g.fillRect(15, 121, 44, 10);
    g.fillRect(59, 121, 49, 10);
    g.fillStyle(0x4e545d);
    g.fillRect(17, 121, 17, 4);
    g.fillRect(61, 121, 18, 4);
    g.fillStyle(0x3d4249);
    g.fillRect(90, 45, 37, 11);
    g.fillRect(123, 49, 22, 6);
    g.fillStyle(0x686f77);
    g.fillRect(91, 45, 14, 4);
    g.fillStyle(0x40d8ff);
    g.fillRect(4, 61, 22, 10);
    g.fillRect(86, 67, 14, 7);
    g.generateTexture("runner-big-run-mid", 146, 136);
    g.destroy();
  }

  createRunnerBigRunAltTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x111218);
    g.fillRect(9, 27, 13, 56);
    g.fillRect(12, 111, 96, 12);
    g.fillRect(48, 55, 24, 13);
    g.fillRect(75, 74, 52, 13);
    g.fillStyle(0xf1c798);
    g.fillRect(33, 8, 39, 38);
    g.fillRect(57, 55, 21, 15);
    g.fillStyle(0xffd95c);
    g.fillRect(29, 5, 46, 9);
    g.fillRect(67, 14, 20, 7);
    g.fillStyle(0x5d2c1d);
    g.fillRect(23, 14, 17, 37);
    g.fillRect(33, 42, 38, 9);
    g.fillStyle(0x15151c);
    g.fillRect(59, 24, 8, 7);
    g.fillRect(83, 77, 48, 7);
    g.fillStyle(0xf2ead8);
    g.fillRect(23, 52, 56, 14);
    g.fillStyle(0xd93542);
    g.fillRect(19, 66, 67, 27);
    g.fillStyle(0xf16b53);
    g.fillRect(24, 70, 27, 7);
    g.fillStyle(0x8c1e2e);
    g.fillRect(68, 66, 14, 27);
    g.fillStyle(0xff8b22);
    g.fillRect(36, 72, 34, 7);
    g.fillStyle(0x6e785c);
    g.fillRect(24, 93, 40, 25);
    g.fillRect(66, 92, 24, 33);
    g.fillStyle(0x879372);
    g.fillRect(28, 97, 16, 9);
    g.fillRect(69, 96, 11, 10);
    g.fillStyle(0x47513f);
    g.fillRect(48, 93, 16, 25);
    g.fillRect(80, 92, 10, 33);
    g.fillStyle(0x2f4a39);
    g.fillRect(32, 96, 24, 11);
    g.fillRect(71, 96, 15, 11);
    g.fillStyle(0x202126);
    g.fillRect(4, 118, 58, 10);
    g.fillRect(62, 125, 56, 10);
    g.fillStyle(0x4e545d);
    g.fillRect(6, 118, 22, 4);
    g.fillRect(64, 125, 20, 4);
    g.fillStyle(0x3d4249);
    g.fillRect(104, 73, 37, 11);
    g.fillStyle(0x686f77);
    g.fillRect(105, 73, 14, 4);
    g.fillStyle(0x40d8ff);
    g.fillRect(4, 61, 22, 10);
    g.fillRect(85, 65, 14, 7);
    g.generateTexture("runner-big-run-alt", 146, 136);
    g.destroy();
  }

  createRunnerDuckTexture() {
    this.buildRunnerPoseTexture("runner-duck", {
      crouch: true,
      lean: 2,
      leadLeg: 1,
      trailLeg: 0,
      leadFoot: 2,
      armSwing: 1,
      weaponLift: 2,
    });
  }

  createRunnerBigDuckTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x111218);
    g.fillRect(20, 66, 12, 36);
    g.fillRect(70, 72, 56, 12);
    g.fillRect(28, 96, 40, 16);
    g.fillRect(72, 94, 22, 16);
    g.fillStyle(0xf1c798);
    g.fillRect(46, 34, 34, 24);
    g.fillRect(78, 73, 16, 10);
    g.fillStyle(0xffd95c);
    g.fillRect(42, 30, 40, 7);
    g.fillRect(73, 37, 16, 5);
    g.fillStyle(0x5d2c1d);
    g.fillRect(37, 37, 13, 23);
    g.fillStyle(0xf2ead8);
    g.fillRect(35, 58, 54, 12);
    g.fillStyle(0xd93542);
    g.fillRect(30, 70, 60, 20);
    g.fillStyle(0xf16b53);
    g.fillRect(34, 73, 22, 5);
    g.fillStyle(0x8c1e2e);
    g.fillRect(76, 70, 10, 20);
    g.fillStyle(0xff8b22);
    g.fillRect(48, 75, 24, 5);
    g.fillStyle(0x40d8ff);
    g.fillRect(14, 67, 18, 9);
    g.fillRect(89, 72, 12, 5);
    g.fillStyle(0x6e785c);
    g.fillRect(34, 90, 26, 18);
    g.fillRect(66, 89, 24, 20);
    g.fillStyle(0x879372);
    g.fillRect(37, 93, 9, 6);
    g.fillRect(69, 92, 9, 7);
    g.fillStyle(0x47513f);
    g.fillRect(50, 90, 10, 18);
    g.fillRect(79, 89, 11, 20);
    g.fillStyle(0x202126);
    g.fillRect(24, 108, 38, 8);
    g.fillRect(66, 109, 34, 8);
    g.fillStyle(0x4e545d);
    g.fillRect(26, 108, 14, 3);
    g.fillRect(68, 109, 12, 3);
    g.fillStyle(0x3d4249);
    g.fillRect(98, 72, 30, 9);
    g.fillStyle(0x686f77);
    g.fillRect(99, 72, 12, 3);
    g.generateTexture("runner-big-duck", 146, 136);
    g.destroy();
  }

  createRunnerJumpTextures() {
    this.buildRunnerPoseTexture("runner-small-jump", {
      jump: true,
      lean: 3,
      leadLeg: -2,
      trailLeg: 4,
      leadFoot: 1,
      trailFoot: 2,
      armSwing: 2,
      weaponLift: -1,
      torsoDrop: -2,
    });

    const big = this.make.graphics({ x: 0, y: 0, add: false });
    big.fillStyle(0x111218);
    big.fillRect(20, 28, 12, 52);
    big.fillRect(66, 48, 62, 12);
    big.fillRect(28, 96, 26, 24);
    big.fillRect(61, 94, 28, 24);
    big.fillStyle(0xf1c798);
    big.fillRect(35, 10, 39, 36);
    big.fillRect(74, 51, 18, 13);
    big.fillStyle(0xffd95c);
    big.fillRect(31, 7, 45, 9);
    big.fillRect(68, 14, 18, 7);
    big.fillStyle(0x5d2c1d);
    big.fillRect(25, 16, 16, 34);
    big.fillStyle(0xf2ead8);
    big.fillRect(26, 51, 54, 13);
    big.fillStyle(0xd93542);
    big.fillRect(22, 64, 64, 25);
    big.fillStyle(0xf16b53);
    big.fillRect(26, 68, 25, 6);
    big.fillStyle(0x8c1e2e);
    big.fillRect(69, 64, 13, 25);
    big.fillStyle(0xff8b22);
    big.fillRect(39, 71, 31, 7);
    big.fillStyle(0x40d8ff);
    big.fillRect(8, 61, 20, 10);
    big.fillRect(85, 67, 13, 6);
    big.fillStyle(0x6e785c);
    big.fillRect(30, 88, 20, 22);
    big.fillRect(63, 88, 22, 24);
    big.fillStyle(0x879372);
    big.fillRect(33, 91, 9, 8);
    big.fillRect(66, 91, 9, 8);
    big.fillStyle(0x47513f);
    big.fillRect(43, 88, 7, 22);
    big.fillRect(76, 88, 9, 24);
    big.fillStyle(0x202126);
    big.fillRect(25, 109, 28, 9);
    big.fillRect(60, 111, 30, 9);
    big.fillStyle(0x4e545d);
    big.fillRect(26, 109, 11, 3);
    big.fillRect(61, 111, 12, 3);
    big.fillStyle(0x3d4249);
    big.fillRect(95, 48, 33, 10);
    big.fillStyle(0x686f77);
    big.fillRect(96, 48, 12, 4);
    big.generateTexture("runner-big-jump", 146, 136);
    big.destroy();
  }

  createRunnerScooterTextures() {
    const createScooterPose = (key, palette, shift = 0) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x15151c);
      g.fillCircle(25, 74, 13);
      g.fillCircle(90, 74, 13);
      g.fillStyle(0x4e545d);
      g.fillCircle(25, 74, 6);
      g.fillCircle(90, 74, 6);
      g.fillStyle(0x20242d);
      g.fillRect(18, 69, 79, 8);
      g.fillRect(73, 42, 11, 30);
      g.fillRect(77, 35, 22, 5);
      g.fillStyle(palette.scooter);
      g.fillRect(29, 54, 41, 18);
      g.fillStyle(tintColor(palette.scooter, 0.26));
      g.fillRect(32, 57, 18, 5);
      g.fillStyle(tintColor(palette.scooter, -0.36));
      g.fillRect(60, 54, 8, 18);
      g.fillStyle(tintColor(palette.scooter, -0.18));
      g.fillRect(69, 59, 13, 9);
      g.fillStyle(0xf2ead8);
      g.fillRect(46, 51, 12, 5);
      g.fillStyle(0x40d8ff);
      g.fillRect(33, 58, 17, 5);
      g.fillRect(72, 61, 6, 3);
      g.fillStyle(0x111218);
      g.fillRect(40, 24 + shift, 12, 30);
      g.fillRect(66, 35 + shift, 36, 11);
      g.fillStyle(palette.skin);
      g.fillRect(52, 11 + shift, 24, 22);
      g.fillRect(70, 37 + shift, 13, 9);
      g.fillStyle(tintColor(palette.skin, 0.18));
      g.fillRect(56, 14 + shift, 8, 4);
      g.fillStyle(palette.hair);
      g.fillRect(44, 15 + shift, 12, 18);
      g.fillRect(50, 8 + shift, 27, 6);
      g.fillStyle(0xf2ead8);
      g.fillRect(48, 34 + shift, 35, 10);
      g.fillStyle(palette.shirt);
      g.fillRect(43, 44 + shift, 39, 17);
      g.fillStyle(palette.shirtLight ?? tintColor(palette.shirt, 0.22));
      g.fillRect(46, 47 + shift, 16, 5);
      g.fillStyle(palette.shirtShadow ?? tintColor(palette.shirt, -0.34));
      g.fillRect(73, 44 + shift, 7, 17);
      g.fillStyle(0xff8b22);
      g.fillRect(53, 48 + shift, 18, 4);
      g.fillStyle(palette.pants);
      g.fillRect(47, 61 + shift, 14, 12);
      g.fillRect(65, 61 + shift, 15, 12);
      g.fillStyle(tintColor(palette.pants, 0.2));
      g.fillRect(49, 63 + shift, 6, 4);
      g.fillRect(67, 63 + shift, 6, 4);
      g.fillStyle(tintColor(palette.pants, -0.3));
      g.fillRect(57, 61 + shift, 4, 12);
      g.fillRect(74, 61 + shift, 4, 12);
      g.fillStyle(0x202126);
      g.fillRect(45, 73 + shift, 18, 5);
      g.fillRect(64, 73 + shift, 19, 5);
      g.fillStyle(0x4e545d);
      g.fillRect(46, 73 + shift, 7, 2);
      g.fillRect(65, 73 + shift, 7, 2);
      g.generateTexture(key, 118, 92);
      g.destroy();
    };

    createScooterPose("runner-scooter-a", {
      scooter: 0xff365f,
      skin: 0xf1c798,
      hair: 0x5d2c1d,
      shirt: 0xd93542,
      shirtLight: 0xf16b53,
      shirtShadow: 0x8c1e2e,
      pants: 0x6e785c,
    }, 0);
    createScooterPose("runner-scooter-b", {
      scooter: 0xff365f,
      skin: 0xf1c798,
      hair: 0x5d2c1d,
      shirt: 0xd93542,
      shirtLight: 0xf16b53,
      shirtShadow: 0x8c1e2e,
      pants: 0x6e785c,
    }, 2);
    createScooterPose("runner-big-scooter-a", {
      scooter: 0xff365f,
      skin: 0xf1c798,
      hair: 0x5d2c1d,
      shirt: 0xffd95c,
      shirtLight: 0xffef9d,
      shirtShadow: 0xc49a3a,
      pants: 0x6e785c,
    }, 0);
    createScooterPose("runner-big-scooter-b", {
      scooter: 0xff365f,
      skin: 0xf1c798,
      hair: 0x5d2c1d,
      shirt: 0xffd95c,
      shirtLight: 0xffef9d,
      shirtShadow: 0xc49a3a,
      pants: 0x6e785c,
    }, 2);
  }

  createObstacleTextures() {
    const barrel = this.make.graphics({ x: 0, y: 0, add: false });
    barrel.fillStyle(0x4b2119);
    barrel.fillRect(10, 8, 52, 60);
    barrel.fillStyle(0x723628);
    barrel.fillRect(14, 12, 18, 52);
    barrel.fillStyle(0xb84f32);
    barrel.fillRect(6, 17, 60, 12);
    barrel.fillRect(6, 44, 60, 12);
    barrel.fillStyle(0xe78c5a);
    barrel.fillRect(12, 20, 42, 4);
    barrel.fillRect(12, 47, 42, 4);
    barrel.fillStyle(0x15151c);
    barrel.fillRect(9, 8, 54, 7);
    barrel.fillRect(4, 68, 66, 8);
    barrel.fillStyle(0x2a0f0b);
    barrel.fillRect(47, 12, 10, 52);
    barrel.fillStyle(0xffd95c);
    barrel.fillRect(23, 29, 23, 6);
    barrel.fillStyle(0xf2ead8);
    barrel.fillRect(25, 31, 9, 2);
    barrel.generateTexture("barrel", 72, 80);
    barrel.destroy();

    const barricade = this.make.graphics({ x: 0, y: 0, add: false });
    barricade.fillStyle(0xffd95c);
    barricade.fillRect(4, 8, 98, 15);
    barricade.fillRect(10, 48, 82, 15);
    barricade.fillStyle(0xffef99);
    barricade.fillRect(8, 11, 88, 4);
    barricade.fillRect(14, 51, 70, 4);
    barricade.fillStyle(0x15151c);
    barricade.fillRect(18, 23, 11, 57);
    barricade.fillRect(73, 23, 11, 57);
    barricade.fillStyle(0x30343a);
    barricade.fillRect(20, 25, 3, 53);
    barricade.fillRect(75, 25, 3, 53);
    barricade.fillStyle(0xe33c46);
    barricade.fillRect(11, 12, 18, 7);
    barricade.fillRect(46, 12, 18, 7);
    barricade.fillRect(80, 12, 18, 7);
    barricade.fillStyle(0x8b1825);
    barricade.fillRect(14, 12, 6, 51);
    barricade.fillRect(49, 12, 6, 51);
    barricade.fillRect(83, 12, 6, 51);
    barricade.generateTexture("barricade", 106, 84);
    barricade.destroy();

    const drone = this.make.graphics({ x: 0, y: 0, add: false });
    drone.fillStyle(0x252936);
    drone.fillRect(22, 18, 58, 24);
    drone.fillStyle(0x40485b);
    drone.fillRect(28, 20, 44, 6);
    drone.fillStyle(0x40d8ff);
    drone.fillRect(32, 24, 18, 8);
    drone.fillStyle(0xff365f);
    drone.fillRect(54, 24, 14, 8);
    drone.fillStyle(0x101218);
    drone.fillRect(30, 36, 42, 4);
    drone.fillStyle(0x111218);
    drone.fillRect(0, 14, 22, 8);
    drone.fillRect(80, 14, 22, 8);
    drone.fillRect(6, 40, 16, 8);
    drone.fillRect(80, 40, 16, 8);
    drone.fillStyle(0xb9efff);
    drone.fillRect(34, 25, 8, 2);
    drone.generateTexture("drone", 104, 58);
    drone.destroy();

    const waterGap = this.make.graphics({ x: 0, y: 0, add: false });
    waterGap.fillStyle(0x0e1724);
    waterGap.fillRect(0, 24, 176, 24);
    waterGap.fillStyle(0x17415c);
    waterGap.fillRect(0, 8, 176, 26);
    waterGap.fillStyle(0x2a718f);
    waterGap.fillRect(0, 12, 176, 18);
    waterGap.fillStyle(0x74d5db);
    waterGap.fillRect(12, 14, 28, 4);
    waterGap.fillRect(62, 16, 34, 4);
    waterGap.fillRect(118, 15, 24, 4);
    waterGap.fillStyle(0xb9efff);
    waterGap.fillRect(24, 18, 12, 2);
    waterGap.fillRect(86, 19, 10, 2);
    waterGap.fillRect(130, 17, 8, 2);
    waterGap.fillStyle(0x0b1017);
    waterGap.fillRect(0, 0, 176, 10);
    waterGap.fillRect(0, 48, 176, 12);
    waterGap.generateTexture("water-gap", 176, 60);
    waterGap.destroy();

    const lavaGap = this.make.graphics({ x: 0, y: 0, add: false });
    lavaGap.fillStyle(0x1a0908);
    lavaGap.fillRect(0, 22, 176, 26);
    lavaGap.fillStyle(0x602014);
    lavaGap.fillRect(0, 8, 176, 24);
    lavaGap.fillStyle(0xd94a1c);
    lavaGap.fillRect(0, 12, 176, 16);
    lavaGap.fillStyle(0xff9b2f);
    lavaGap.fillRect(16, 14, 24, 6);
    lavaGap.fillRect(58, 13, 28, 7);
    lavaGap.fillRect(108, 15, 20, 6);
    lavaGap.fillRect(142, 14, 18, 5);
    lavaGap.fillStyle(0xffe17e);
    lavaGap.fillRect(20, 16, 8, 2);
    lavaGap.fillRect(64, 15, 10, 3);
    lavaGap.fillRect(114, 17, 6, 2);
    lavaGap.fillStyle(0x0b1017);
    lavaGap.fillRect(0, 0, 176, 10);
    lavaGap.fillRect(0, 48, 176, 12);
    lavaGap.generateTexture("lava-gap", 176, 60);
    lavaGap.destroy();
  }

  createRewardTextures() {
    const shirt = this.make.graphics({ x: 0, y: 0, add: false });
    shirt.fillStyle(0x111218);
    shirt.fillRect(10, 11, 58, 58);
    shirt.fillRect(0, 18, 21, 25);
    shirt.fillRect(57, 18, 21, 25);
    shirt.fillStyle(0xf2ead8);
    shirt.fillRect(17, 13, 44, 11);
    shirt.fillStyle(0xd93542);
    shirt.fillRect(14, 23, 50, 42);
    shirt.fillStyle(0xf16b53);
    shirt.fillRect(17, 26, 20, 8);
    shirt.fillStyle(0x8c1e2e);
    shirt.fillRect(48, 23, 13, 42);
    shirt.fillStyle(0xff8b22);
    shirt.fillRect(25, 39, 28, 7);
    shirt.fillStyle(0x40d8ff);
    shirt.fillRect(3, 22, 17, 17);
    shirt.fillRect(58, 22, 17, 17);
    shirt.fillStyle(0xc7ff3a);
    shirt.fillRect(30, 51, 18, 6);
    shirt.fillStyle(0x15151c);
    shirt.fillRect(29, 20, 22, 5);
    shirt.generateTexture("shirt", 80, 76);
    shirt.destroy();

    const socks = this.make.graphics({ x: 0, y: 0, add: false });
    socks.fillStyle(0x15151c);
    socks.fillRect(12, 5, 21, 49);
    socks.fillRect(41, 5, 21, 49);
    socks.fillRect(6, 48, 34, 12);
    socks.fillRect(35, 48, 34, 12);
    socks.fillStyle(0xf2ead8);
    socks.fillRect(15, 8, 15, 40);
    socks.fillRect(44, 8, 15, 40);
    socks.fillStyle(0xffffff);
    socks.fillRect(17, 10, 7, 26);
    socks.fillRect(46, 10, 7, 26);
    socks.fillStyle(0xff8b22);
    socks.fillRect(15, 8, 15, 10);
    socks.fillRect(44, 8, 15, 10);
    socks.fillStyle(0xca5f1e);
    socks.fillRect(24, 8, 6, 10);
    socks.fillRect(53, 8, 6, 10);
    socks.fillStyle(0x40d8ff);
    socks.fillRect(9, 49, 28, 8);
    socks.fillRect(38, 49, 28, 8);
    socks.fillStyle(0xd93542);
    socks.fillRect(19, 27, 8, 5);
    socks.fillRect(48, 27, 8, 5);
    socks.generateTexture("socks", 74, 66);
    socks.destroy();

    const shoe = this.make.graphics({ x: 0, y: 0, add: false });
    shoe.fillStyle(0xff365f);
    shoe.fillRect(8, 24, 48, 20);
    shoe.fillStyle(0xff7090);
    shoe.fillRect(12, 27, 20, 5);
    shoe.fillStyle(0x981734);
    shoe.fillRect(42, 24, 12, 20);
    shoe.fillStyle(0xc7ff3a);
    shoe.fillRect(50, 34, 29, 10);
    shoe.fillStyle(0x15151c);
    shoe.fillRect(4, 44, 78, 8);
    shoe.fillStyle(0x4e545d);
    shoe.fillRect(8, 44, 18, 3);
    shoe.fillStyle(0xf2ead8);
    shoe.fillRect(22, 28, 21, 5);
    shoe.generateTexture("shoe", 86, 60);
    shoe.destroy();

    const scooter = this.make.graphics({ x: 0, y: 0, add: false });
    scooter.fillStyle(0x111218);
    scooter.fillRect(8, 36, 72, 8);
    scooter.fillRect(54, 18, 10, 22);
    scooter.fillRect(60, 10, 18, 5);
    scooter.fillStyle(0xff365f);
    scooter.fillRect(18, 24, 38, 16);
    scooter.fillStyle(0xff6e8f);
    scooter.fillRect(22, 26, 18, 5);
    scooter.fillStyle(0x8b1b31);
    scooter.fillRect(44, 24, 10, 16);
    scooter.fillStyle(0x40d8ff);
    scooter.fillRect(22, 27, 16, 6);
    scooter.fillStyle(0xf2ead8);
    scooter.fillRect(44, 24, 9, 8);
    scooter.fillStyle(0x15151c);
    scooter.fillCircle(22, 48, 12);
    scooter.fillCircle(64, 48, 12);
    scooter.generateTexture("scooter", 90, 64);
    scooter.destroy();

    const outfit = this.make.graphics({ x: 0, y: 0, add: false });
    outfit.fillStyle(0x111218);
    outfit.fillRect(12, 10, 56, 62);
    outfit.fillRect(0, 18, 18, 26);
    outfit.fillRect(62, 18, 18, 26);
    outfit.fillStyle(0xffd95c);
    outfit.fillRect(18, 14, 44, 10);
    outfit.fillRect(21, 28, 38, 30);
    outfit.fillStyle(0xffef9d);
    outfit.fillRect(22, 17, 22, 5);
    outfit.fillStyle(0xff365f);
    outfit.fillRect(23, 31, 34, 20);
    outfit.fillStyle(0xff7997);
    outfit.fillRect(26, 34, 14, 6);
    outfit.fillStyle(0x971b35);
    outfit.fillRect(47, 31, 8, 20);
    outfit.fillStyle(0x40d8ff);
    outfit.fillRect(4, 21, 13, 19);
    outfit.fillRect(63, 21, 13, 19);
    outfit.fillStyle(0xc7ff3a);
    outfit.fillRect(28, 56, 24, 8);
    outfit.fillStyle(0xf2ead8);
    outfit.fillRect(30, 17, 20, 6);
    outfit.generateTexture("outfit", 82, 78);
    outfit.destroy();

    const laser = this.make.graphics({ x: 0, y: 0, add: false });
    laser.fillStyle(0x111218);
    laser.fillRect(10, 28, 70, 12);
    laser.fillStyle(0x40d8ff);
    laser.fillRect(16, 31, 52, 6);
    laser.fillStyle(0xbff7ff);
    laser.fillRect(22, 33, 40, 2);
    laser.fillStyle(0xffd95c);
    laser.fillRect(66, 24, 10, 20);
    laser.fillStyle(0x253049);
    laser.fillRect(18, 24, 16, 20);
    laser.generateTexture("laser", 90, 64);
    laser.destroy();

    const rocket = this.make.graphics({ x: 0, y: 0, add: false });
    rocket.fillStyle(0x111218);
    rocket.fillRect(8, 26, 58, 16);
    rocket.fillStyle(0xd93542);
    rocket.fillRect(12, 28, 38, 12);
    rocket.fillStyle(0xff7c90);
    rocket.fillRect(16, 30, 16, 4);
    rocket.fillStyle(0xc7ff3a);
    rocket.fillRect(50, 28, 12, 12);
    rocket.fillStyle(0xffd95c);
    rocket.fillRect(62, 30, 18, 8);
    rocket.fillStyle(0xf2ead8);
    rocket.fillRect(68, 32, 8, 4);
    rocket.fillStyle(0x4e545d);
    rocket.fillRect(6, 22, 12, 24);
    rocket.generateTexture("rocket", 86, 64);
    rocket.destroy();
  }

  createCombatTextures() {
    const enemyIdle = this.make.graphics({ x: 0, y: 0, add: false });
    enemyIdle.fillStyle(0x111218);
    enemyIdle.fillRect(11, 18, 13, 50);
    enemyIdle.fillRect(54, 36, 42, 10);
    enemyIdle.fillRect(15, 86, 71, 9);
    enemyIdle.fillStyle(0xf0c18f);
    enemyIdle.fillRect(27, 6, 28, 27);
    enemyIdle.fillRect(57, 38, 14, 11);
    enemyIdle.fillStyle(0x2b1718);
    enemyIdle.fillRect(21, 11, 12, 24);
    enemyIdle.fillRect(30, 30, 20, 6);
    enemyIdle.fillStyle(0xff365f);
    enemyIdle.fillRect(25, 4, 34, 7);
    enemyIdle.fillRect(49, 9, 14, 6);
    enemyIdle.fillStyle(0x111218);
    enemyIdle.fillRect(45, 17, 6, 5);
    enemyIdle.fillRect(69, 39, 29, 6);
    enemyIdle.fillStyle(0xf3ead8);
    enemyIdle.fillRect(20, 35, 42, 11);
    enemyIdle.fillStyle(0x2ad8ff);
    enemyIdle.fillRect(16, 46, 49, 18);
    enemyIdle.fillStyle(0xffd95c);
    enemyIdle.fillRect(31, 50, 18, 5);
    enemyIdle.fillStyle(0x45484f);
    enemyIdle.fillRect(20, 64, 18, 23);
    enemyIdle.fillRect(44, 62, 18, 25);
    enemyIdle.fillStyle(0xb4ff32);
    enemyIdle.fillRect(6, 40, 15, 8);
    enemyIdle.fillRect(62, 48, 10, 5);
    enemyIdle.fillStyle(0x202126);
    enemyIdle.fillRect(11, 86, 30, 8);
    enemyIdle.fillRect(41, 86, 31, 8);
    enemyIdle.fillStyle(0x2b2b30);
    enemyIdle.fillRect(73, 34, 25, 9);
    enemyIdle.generateTexture("enemy-grunt", 102, 98);
    enemyIdle.destroy();

    const enemyRunA = this.make.graphics({ x: 0, y: 0, add: false });
    enemyRunA.fillStyle(0x111218);
    enemyRunA.fillRect(11, 18, 13, 50);
    enemyRunA.fillRect(59, 32, 43, 10);
    enemyRunA.fillRect(10, 85, 39, 8);
    enemyRunA.fillRect(58, 78, 36, 8);
    enemyRunA.fillStyle(0xf0c18f);
    enemyRunA.fillRect(27, 6, 28, 27);
    enemyRunA.fillRect(61, 34, 14, 11);
    enemyRunA.fillStyle(0x2b1718);
    enemyRunA.fillRect(21, 11, 12, 24);
    enemyRunA.fillRect(30, 30, 20, 6);
    enemyRunA.fillStyle(0xff365f);
    enemyRunA.fillRect(25, 4, 34, 7);
    enemyRunA.fillRect(49, 9, 14, 6);
    enemyRunA.fillStyle(0x111218);
    enemyRunA.fillRect(45, 17, 6, 5);
    enemyRunA.fillRect(74, 35, 29, 6);
    enemyRunA.fillStyle(0xf3ead8);
    enemyRunA.fillRect(20, 35, 42, 11);
    enemyRunA.fillStyle(0x2ad8ff);
    enemyRunA.fillRect(16, 46, 49, 18);
    enemyRunA.fillStyle(0xffd95c);
    enemyRunA.fillRect(31, 50, 18, 5);
    enemyRunA.fillStyle(0x45484f);
    enemyRunA.fillRect(18, 64, 18, 23);
    enemyRunA.fillRect(49, 60, 25, 19);
    enemyRunA.fillStyle(0xb4ff32);
    enemyRunA.fillRect(6, 41, 15, 8);
    enemyRunA.fillRect(65, 45, 10, 5);
    enemyRunA.fillStyle(0x202126);
    enemyRunA.fillRect(5, 84, 42, 8);
    enemyRunA.fillRect(60, 78, 37, 8);
    enemyRunA.fillStyle(0x2b2b30);
    enemyRunA.fillRect(77, 31, 25, 9);
    enemyRunA.generateTexture("enemy-run-a", 104, 98);
    enemyRunA.destroy();

    const enemyRunB = this.make.graphics({ x: 0, y: 0, add: false });
    enemyRunB.fillStyle(0x111218);
    enemyRunB.fillRect(13, 20, 12, 48);
    enemyRunB.fillRect(46, 44, 18, 10);
    enemyRunB.fillRect(62, 53, 39, 10);
    enemyRunB.fillRect(13, 78, 37, 8);
    enemyRunB.fillRect(57, 87, 38, 8);
    enemyRunB.fillStyle(0xf0c18f);
    enemyRunB.fillRect(28, 6, 28, 27);
    enemyRunB.fillRect(53, 44, 14, 11);
    enemyRunB.fillStyle(0x2b1718);
    enemyRunB.fillRect(22, 11, 12, 24);
    enemyRunB.fillRect(31, 30, 20, 6);
    enemyRunB.fillStyle(0xff365f);
    enemyRunB.fillRect(26, 4, 34, 7);
    enemyRunB.fillRect(50, 9, 14, 6);
    enemyRunB.fillStyle(0x111218);
    enemyRunB.fillRect(46, 17, 6, 5);
    enemyRunB.fillRect(69, 54, 33, 6);
    enemyRunB.fillStyle(0xf3ead8);
    enemyRunB.fillRect(21, 35, 42, 11);
    enemyRunB.fillStyle(0x2ad8ff);
    enemyRunB.fillRect(17, 46, 49, 18);
    enemyRunB.fillStyle(0xffd95c);
    enemyRunB.fillRect(32, 50, 18, 5);
    enemyRunB.fillStyle(0x45484f);
    enemyRunB.fillRect(20, 64, 26, 18);
    enemyRunB.fillRect(49, 64, 18, 23);
    enemyRunB.fillStyle(0xb4ff32);
    enemyRunB.fillRect(7, 41, 15, 8);
    enemyRunB.fillRect(61, 43, 10, 5);
    enemyRunB.fillStyle(0x202126);
    enemyRunB.fillRect(8, 77, 42, 8);
    enemyRunB.fillRect(58, 87, 39, 8);
    enemyRunB.fillStyle(0x2b2b30);
    enemyRunB.fillRect(84, 50, 22, 9);
    enemyRunB.generateTexture("enemy-run-b", 108, 100);
    enemyRunB.destroy();

    const runnerBullet = this.make.graphics({ x: 0, y: 0, add: false });
    runnerBullet.fillStyle(0xfff2a8);
    runnerBullet.fillRect(0, 3, 22, 6);
    runnerBullet.fillStyle(0xff8b22);
    runnerBullet.fillRect(15, 0, 8, 12);
    runnerBullet.generateTexture("player-bullet", 24, 12);
    runnerBullet.destroy();

    const enemyBullet = this.make.graphics({ x: 0, y: 0, add: false });
    enemyBullet.fillStyle(0xff365f);
    enemyBullet.fillRect(2, 2, 14, 14);
    enemyBullet.fillStyle(0xfff2a8);
    enemyBullet.fillRect(6, 6, 6, 6);
    enemyBullet.generateTexture("enemy-bullet", 18, 18);
    enemyBullet.destroy();

    const enemyCigarette = this.make.graphics({ x: 0, y: 0, add: false });
    enemyCigarette.fillStyle(0xf4efe2);
    enemyCigarette.fillRect(0, 3, 20, 6);
    enemyCigarette.fillStyle(0xd89e52);
    enemyCigarette.fillRect(14, 3, 6, 6);
    enemyCigarette.fillStyle(0xff5b3d);
    enemyCigarette.fillRect(0, 3, 3, 6);
    enemyCigarette.fillStyle(0x8cc9ff, 0.55);
    enemyCigarette.fillRect(-4, 4, 4, 4);
    enemyCigarette.generateTexture("enemy-cigarette", 24, 12);
    enemyCigarette.destroy();

    const warning = this.make.graphics({ x: 0, y: 0, add: false });
    warning.fillStyle(0xfff2a8);
    warning.fillRect(8, 0, 8, 24);
    warning.fillRect(8, 30, 8, 8);
    warning.fillStyle(0xff365f);
    warning.fillRect(11, 3, 3, 18);
    warning.generateTexture("warning", 24, 42);
    warning.destroy();

    this.createEnemyArchetypeTextures();
    this.createBossArchetypeTextures();

    const crate = this.make.graphics({ x: 0, y: 0, add: false });
    crate.fillStyle(0x7a4a25);
    crate.fillRect(4, 4, 58, 58);
    crate.fillStyle(0xb67837);
    crate.fillRect(10, 10, 46, 46);
    crate.fillStyle(0x2a1a12);
    crate.fillRect(6, 28, 54, 8);
    crate.fillRect(28, 6, 8, 54);
    crate.generateTexture("crate", 66, 66);
    crate.destroy();

    const makePlatformTexture = (key, palette) => {
      const platform = this.make.graphics({ x: 0, y: 0, add: false });
      platform.fillStyle(palette.outline);
      platform.fillRect(0, 0, 78, 58);
      platform.fillStyle(palette.bodyDark);
      platform.fillRect(3, 4, 72, 50);
      platform.fillStyle(palette.top);
      platform.fillRect(4, 4, 70, 12);
      platform.fillStyle(palette.topHighlight);
      platform.fillRect(8, 7, 62, 4);
      platform.fillStyle(palette.topShadow);
      platform.fillRect(6, 15, 66, 3);
      platform.fillStyle(palette.bodyMid);
      platform.fillRect(4, 18, 70, 34);
      platform.fillStyle(palette.bodyHighlight);
      platform.fillRect(8, 23, 16, 4);
      platform.fillRect(30, 30, 12, 3);
      platform.fillRect(54, 25, 14, 4);
      platform.fillRect(18, 40, 10, 3);
      platform.fillStyle(palette.bodyShadow);
      platform.fillRect(10, 34, 58, 4);
      platform.fillRect(12, 46, 54, 3);
      platform.fillStyle(palette.motifA);
      platform.fillRect(10, 20, 16, 8);
      platform.fillRect(32, 20, 14, 8);
      platform.fillRect(52, 20, 16, 8);
      platform.fillStyle(palette.motifB);
      platform.fillRect(14, 22, 8, 4);
      platform.fillRect(36, 22, 6, 4);
      platform.fillRect(56, 22, 8, 4);
      platform.fillStyle(palette.rim);
      platform.fillRect(4, 52, 70, 3);
      platform.fillStyle(palette.shadowEdge);
      platform.fillRect(4, 55, 70, 3);
      platform.generateTexture(key, 78, 58);
      platform.destroy();
    };

    makePlatformTexture("solid-box", {
      outline: 0x15151c,
      top: 0x9ece5c,
      topHighlight: 0xc6ef86,
      topShadow: 0x6d8a39,
      bodyMid: 0xa8663c,
      bodyDark: 0x7a4326,
      bodyHighlight: 0xd38f60,
      bodyShadow: 0x5b311d,
      motifA: 0x7f4b2e,
      motifB: 0xc48a60,
      rim: 0x6f3e25,
      shadowEdge: 0x312016,
    });

    makePlatformTexture("solid-box-valencia", {
      outline: 0x1e323c,
      top: 0xf8f2e4,
      topHighlight: 0xffffff,
      topShadow: 0xdccca9,
      bodyMid: 0xe5d3b3,
      bodyDark: 0xb99267,
      bodyHighlight: 0xf8ead4,
      bodyShadow: 0x8d6846,
      motifA: 0xff8d33,
      motifB: 0x4ddfe3,
      rim: 0x2f596d,
      shadowEdge: 0x14232c,
    });

    makePlatformTexture("solid-box-roma", {
      outline: 0x1d1714,
      top: 0xd8c39f,
      topHighlight: 0xf2e3c2,
      topShadow: 0xb49771,
      bodyMid: 0x9e7759,
      bodyDark: 0x73503d,
      bodyHighlight: 0xcda27c,
      bodyShadow: 0x573b2e,
      motifA: 0xe0c38b,
      motifB: 0x8a5d41,
      rim: 0x6d4f3d,
      shadowEdge: 0x2d211a,
    });

    makePlatformTexture("solid-box-paris", {
      outline: 0x171925,
      top: 0xe8e1d9,
      topHighlight: 0xf9f5ef,
      topShadow: 0xc9c0b6,
      bodyMid: 0x536073,
      bodyDark: 0x3a4455,
      bodyHighlight: 0x74859d,
      bodyShadow: 0x29303c,
      motifA: 0x46d9ff,
      motifB: 0xf7d0ea,
      rim: 0x252b36,
      shadowEdge: 0x11141b,
    });

    makePlatformTexture("solid-box-venecia", {
      outline: 0x18272f,
      top: 0xdce7db,
      topHighlight: 0xf2faf2,
      topShadow: 0xb8c9bb,
      bodyMid: 0x6f8982,
      bodyDark: 0x516760,
      bodyHighlight: 0x93b0a8,
      bodyShadow: 0x374842,
      motifA: 0x50dfd0,
      motifB: 0xc79d71,
      rim: 0x28424a,
      shadowEdge: 0x131d22,
    });

    makePlatformTexture("solid-box-londres", {
      outline: 0x16181f,
      top: 0x9eafbf,
      topHighlight: 0xc2d3df,
      topShadow: 0x788899,
      bodyMid: 0x55616d,
      bodyDark: 0x3d4650,
      bodyHighlight: 0x738190,
      bodyShadow: 0x2c333b,
      motifA: 0xc5b06c,
      motifB: 0xb9d9f4,
      rim: 0x242932,
      shadowEdge: 0x111319,
    });

    const pow = this.make.graphics({ x: 0, y: 0, add: false });
    pow.fillStyle(0xf1d2aa);
    pow.fillRect(22, 8, 22, 22);
    pow.fillStyle(0x15151c);
    pow.fillRect(37, 16, 5, 5);
    pow.fillStyle(0xf2ead8);
    pow.fillRect(12, 30, 44, 36);
    pow.fillStyle(0xff8b22);
    pow.fillRect(17, 39, 34, 8);
    pow.fillStyle(0x40d8ff);
    pow.fillRect(18, 66, 15, 22);
    pow.fillRect(40, 66, 15, 22);
    pow.fillStyle(0x111218);
    pow.fillRect(12, 87, 26, 7);
    pow.fillRect(37, 87, 27, 7);
    pow.generateTexture("pow", 68, 96);
    pow.destroy();

    const explosion = this.make.graphics({ x: 0, y: 0, add: false });
    explosion.fillStyle(0xfff2a8);
    explosion.fillRect(24, 0, 18, 62);
    explosion.fillRect(0, 24, 66, 18);
    explosion.fillStyle(0xff8b22);
    explosion.fillRect(14, 14, 38, 38);
    explosion.fillStyle(0xff365f);
    explosion.fillRect(24, 24, 18, 18);
    explosion.generateTexture("hit-burst", 66, 66);
    explosion.destroy();
  }

  createEnemyArchetypeTextures() {
    const base = ART_DIRECTION.runner;
    const variants = [
      {
        prefix: "enemy-sprinter",
        head: 0xf0c18f,
        hair: 0x1b1516,
        shirt: base.sleeve,
        stripe: 0xc7ff3a,
        pants: 0x323741,
        shoes: base.shirt,
        arm: base.white,
        gear: base.outline,
      },
      {
        prefix: "enemy-bruiser",
        head: 0xd9a77f,
        hair: 0x231414,
        shirt: base.shirt,
        stripe: base.shirtPower,
        pants: 0x5a5d66,
        shoes: base.shoes,
        arm: base.white,
        gear: base.outline,
      },
      {
        prefix: "enemy-shooter",
        head: 0xf0c18f,
        hair: 0x2b1718,
        shirt: base.sleeve,
        stripe: base.shirtPower,
        pants: 0x45484f,
        shoes: base.shoes,
        arm: base.white,
        gear: base.outline,
      },
      {
        prefix: "enemy-paris-sprinter",
        head: 0xf0c18f,
        hair: 0x1b1516,
        shirt: 0x172c63,
        stripe: 0xe23e57,
        pants: 0x24304a,
        shoes: 0xf2ead8,
        arm: 0xf2ead8,
        gear: base.outline,
      },
      {
        prefix: "enemy-paris-bruiser",
        head: 0xd9a77f,
        hair: 0x231414,
        shirt: 0x172c63,
        stripe: 0xffffff,
        pants: 0x2b3854,
        shoes: 0x15151c,
        arm: 0xf2ead8,
        gear: base.outline,
      },
      {
        prefix: "enemy-paris-shooter",
        head: 0xf0c18f,
        hair: 0x2b1718,
        shirt: 0x172c63,
        stripe: 0xe23e57,
        pants: 0x2c3653,
        shoes: 0xf2ead8,
        arm: 0xf2ead8,
        gear: base.outline,
      },
    ];

    for (const variant of variants) {
      for (const pose of ["idle", "run-a", "run-b", "brake", "attack", "hurt", "fall"]) {
        this.createEnemyPoseTexture(variant, pose);
      }
    }
  }

  createEnemyPoseTexture(variant, pose) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const isBruiser = variant.prefix === "enemy-bruiser";
    const isShooter = variant.prefix === "enemy-shooter";
    const bodyX = isBruiser ? 30 : 28;
    const bodyW = isBruiser ? 34 : 28;
    const bodyH = isBruiser ? 44 : 40;
    const bodyY = 36;
    const headX = bodyX + 2;
    const headW = isBruiser ? 26 : 24;
    const headH = isBruiser ? 25 : 24;
    const headY = 10;
    const legY = bodyY + bodyH;

    let leftLegX = bodyX + 2;
    let leftLegY = legY;
    let rightLegX = bodyX + bodyW - 13;
    let rightLegY = legY;
    let armX = bodyX + bodyW - 2;
    let armY = bodyY + 4;
    let armW = isBruiser ? 20 : 18;
    let weaponX = bodyX + bodyW + 14;
    let weaponY = bodyY + 8;
    let weaponW = isBruiser ? 30 : 28;
    let torsoOffsetY = 0;
    let headOffsetY = 0;
    let showWeapon = isShooter || isBruiser;
    let shirtColor = variant.shirt;

    if (pose === "run-a") {
      leftLegX -= 6;
      leftLegY += 2;
      rightLegX += 5;
      rightLegY -= 3;
      armX += 6;
      armY -= 2;
      weaponX += 6;
      weaponY -= 2;
      torsoOffsetY = -1;
    } else if (pose === "run-b") {
      leftLegX += 5;
      leftLegY -= 3;
      rightLegX -= 6;
      rightLegY += 3;
      armX -= 3;
      weaponX -= 4;
      torsoOffsetY = 1;
    } else if (pose === "brake") {
      leftLegX -= 9;
      rightLegX -= 1;
      armX -= 10;
      weaponX -= 10;
      torsoOffsetY = 2;
      headOffsetY = 1;
    } else if (pose === "attack") {
      armX += 10;
      armW += 8;
      weaponX += 12;
      weaponW += 8;
      torsoOffsetY = -1;
    } else if (pose === "hurt") {
      shirtColor = 0xffd95c;
      armX -= 4;
      leftLegX -= 2;
      rightLegX += 2;
      headOffsetY = -1;
    } else if (pose === "fall") {
      showWeapon = isShooter;
      g.fillStyle(variant.gear);
      g.fillRect(20, 68, 56, 10);
      g.fillStyle(variant.pants);
      g.fillRect(28, 56, 28, 14);
      g.fillRect(58, 58, 18, 12);
      g.fillStyle(tintColor(variant.pants, 0.2));
      g.fillRect(30, 58, 12, 4);
      g.fillStyle(shirtColor);
      g.fillRect(24, 34, 36, 22);
      g.fillStyle(tintColor(shirtColor, 0.2));
      g.fillRect(27, 37, 14, 4);
      g.fillStyle(tintColor(shirtColor, -0.35));
      g.fillRect(47, 34, 10, 22);
      g.fillStyle(variant.arm);
      g.fillRect(54, 38, 16, 9);
      g.fillStyle(variant.head);
      g.fillRect(10, 30, 24, 20);
      g.fillStyle(tintColor(variant.head, 0.18));
      g.fillRect(13, 33, 8, 5);
      g.fillStyle(variant.hair);
      g.fillRect(8, 28, 14, 18);
      if (showWeapon) {
        g.fillStyle(variant.gear);
        g.fillRect(70, 42, 22, 6);
      }
      g.generateTexture(`${variant.prefix}-fall`, 96, 96);
      g.destroy();
      return;
    }

    g.fillStyle(variant.gear);
    g.fillRect(bodyX - 10, bodyY + 4 + torsoOffsetY, 10, bodyH + 10);
    if (showWeapon) {
      g.fillRect(weaponX, weaponY + torsoOffsetY, weaponW, 6);
      g.fillRect(weaponX + weaponW - 4, weaponY + torsoOffsetY - 2, 8, 4);
      g.fillStyle(tintColor(variant.gear, 0.28));
      g.fillRect(weaponX + 4, weaponY + torsoOffsetY, Math.max(10, weaponW - 12), 2);
      g.fillStyle(variant.gear);
    }

    g.fillStyle(variant.head);
    g.fillRect(headX, headY + headOffsetY, headW, headH);
    g.fillRect(armX - 8, armY + torsoOffsetY, 14, 10);
    g.fillStyle(tintColor(variant.head, 0.18));
    g.fillRect(headX + 3, headY + 3 + headOffsetY, 8, 5);
    g.fillStyle(tintColor(variant.head, -0.22));
    g.fillRect(headX + headW - 6, headY + 6 + headOffsetY, 4, 11);
    g.fillStyle(variant.hair);
    g.fillRect(headX - 5, headY + 4 + headOffsetY, 12, headH - 2);
    g.fillRect(headX + 2, headY - 2 + headOffsetY, headW + 6, 6);
    g.fillStyle(variant.gear);
    g.fillRect(headX + headW - 7, headY + 9 + headOffsetY, 5, 4);

    g.fillStyle(variant.arm);
    g.fillRect(bodyX - 4, bodyY + 2 + torsoOffsetY, 18, 10);
    g.fillRect(armX, armY + torsoOffsetY, armW, 10);

    g.fillStyle(shirtColor);
    g.fillRect(bodyX, bodyY + torsoOffsetY, bodyW, bodyH);
    g.fillStyle(tintColor(shirtColor, 0.22));
    g.fillRect(bodyX + 3, bodyY + 4 + torsoOffsetY, Math.max(8, bodyW - 15), 5);
    g.fillStyle(tintColor(shirtColor, -0.35));
    g.fillRect(bodyX + bodyW - 8, bodyY + torsoOffsetY, 8, bodyH);
    g.fillStyle(variant.stripe);
    g.fillRect(bodyX + 6, bodyY + 10 + torsoOffsetY, bodyW - 12, 5);
    g.fillStyle(variant.pants);
    g.fillRect(leftLegX, leftLegY, 11, 24);
    g.fillRect(rightLegX, rightLegY, 11, 24);
    g.fillStyle(tintColor(variant.pants, 0.2));
    g.fillRect(leftLegX + 2, leftLegY + 4, 4, 8);
    g.fillRect(rightLegX + 2, rightLegY + 4, 4, 8);
    g.fillStyle(tintColor(variant.pants, -0.28));
    g.fillRect(leftLegX + 7, leftLegY, 4, 24);
    g.fillRect(rightLegX + 7, rightLegY, 4, 24);
    g.fillStyle(variant.shoes);
    g.fillRect(leftLegX - 2, leftLegY + 24, 17, 7);
    g.fillRect(rightLegX - 2, rightLegY + 24, 17, 7);
    g.fillStyle(tintColor(variant.shoes, 0.2));
    g.fillRect(leftLegX - 1, leftLegY + 24, 7, 2);
    g.fillRect(rightLegX - 1, rightLegY + 24, 7, 2);
    g.fillStyle(variant.gear);
    g.fillRect(bodyX + bodyW - 2, bodyY + 7 + torsoOffsetY, 8, 5);
    if (isBruiser) {
      g.fillStyle(0x15151c);
      g.fillRect(bodyX - 10, bodyY + 16 + torsoOffsetY, 12, 12);
    }

    g.generateTexture(`${variant.prefix}-${pose}`, 96, 96);
    g.destroy();
  }

  createBossArchetypeTextures() {
    const variants = [
      { prefix: "boss-valencia", accent: 0xff8b22, shirt: 0xd93542, stripe: 0x40d8ff, pants: 0x6e785c, head: 0xf0c18f, hair: 0x5d2c1d, skin: 0xf3ead8, gear: 0x111218, accessory: "visor" },
      { prefix: "boss-roma", accent: 0xc5b06c, shirt: 0x8c4d2b, stripe: 0xffd95c, pants: 0x62584f, head: 0xd9a77f, hair: 0x2b1718, skin: 0xf3ead8, gear: 0x15151c, accessory: "armor" },
      { prefix: "boss-paris", accent: 0x40d8ff, shirt: 0x253049, stripe: 0xf2ead8, pants: 0x4a5060, head: 0xf0c18f, hair: 0x1a1418, skin: 0xf3ead8, gear: 0x111218, accessory: "beret" },
      { prefix: "boss-venecia", accent: 0x4ae0c2, shirt: 0x2b6a63, stripe: 0xff365f, pants: 0x5f6a63, head: 0xe7bf95, hair: 0x231414, skin: 0xf3ead8, gear: 0x111218, accessory: "cape" },
      { prefix: "boss-londres", accent: 0xff365f, shirt: 0x253049, stripe: 0xc5b06c, pants: 0x515766, head: 0xf0c18f, hair: 0x1b1516, skin: 0xf3ead8, gear: 0x111218, accessory: "tower" },
    ];

    for (const variant of variants) {
      for (const pose of ["idle", "run-a", "run-b", "attack", "hurt", "fall"]) {
        this.createBossPoseTexture(variant, pose);
      }
    }
  }

  createBossPoseTexture(variant, pose) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const isLondonBoss = variant.prefix === "boss-londres";
    if (pose === "fall") {
      g.fillStyle(variant.gear);
      g.fillRect(24, 82, 88, 12);
      g.fillStyle(variant.pants);
      g.fillRect(40, 64, 40, 18);
      g.fillRect(82, 66, 24, 16);
      g.fillStyle(variant.shirt);
      g.fillRect(28, 40, 54, 26);
      g.fillStyle(variant.skin);
      g.fillRect(74, 45, 18, 10);
      g.fillRect(12, 35, 30, 24);
      g.fillStyle(variant.hair);
      g.fillRect(8, 31, 16, 22);
      g.fillStyle(variant.accent);
      g.fillRect(98, 47, 20, 7);
      g.generateTexture(`${variant.prefix}-fall`, 124, 102);
      g.destroy();
      return;
    }

    if (isLondonBoss) {
      const offsets = {
        "run-a": { legLeft: -5, legRight: 5, arm: 8, torso: -2, weapon: 10, cape: 5 },
        "run-b": { legLeft: 5, legRight: -5, arm: -3, torso: 1, weapon: -3, cape: -4 },
        attack: { legLeft: 0, legRight: 2, arm: 14, torso: -1, weapon: 18, cape: 7 },
        hurt: { legLeft: -2, legRight: 4, arm: -6, torso: 1, weapon: -2, cape: -6 },
        idle: { legLeft: 0, legRight: 0, arm: 0, torso: 0, weapon: 0, cape: 0 },
      }[pose];

      const bodyX = 34;
      const bodyY = 34 + offsets.torso;
      const headX = 42;
      const headY = 10 + offsets.torso;

      g.fillStyle(0x111218);
      g.fillRect(bodyX - 18, bodyY + 8, 16, 54);
      g.fillRect(bodyX - 22 + offsets.cape, bodyY + 26, 14, 30);
      g.fillRect(bodyX + 52 + offsets.weapon, bodyY + 14, 42, 8);
      g.fillRect(bodyX + 90 + offsets.weapon, bodyY + 12, 16, 5);
      g.fillStyle(variant.accent);
      g.fillRect(bodyX - 12, bodyY + 8, 10, 46);
      g.fillRect(bodyX - 18 + offsets.cape, bodyY + 26, 10, 28);
      g.fillStyle(variant.skin);
      g.fillRect(headX, headY, 30, 28);
      g.fillRect(bodyX - 3, bodyY + 8, 18, 12);
      g.fillRect(bodyX + 44 + offsets.arm, bodyY + 10, 24, 11);
      g.fillStyle(tintColor(variant.skin, 0.16));
      g.fillRect(headX + 4, headY + 4, 8, 4);
      g.fillStyle(variant.hair);
      g.fillRect(headX - 6, headY + 5, 15, 23);
      g.fillRect(headX + 2, headY - 4, 34, 7);
      g.fillStyle(variant.shirt);
      g.fillRect(bodyX, bodyY, 44, 50);
      g.fillStyle(tintColor(variant.shirt, 0.24));
      g.fillRect(bodyX + 4, bodyY + 4, 14, 30);
      g.fillStyle(tintColor(variant.shirt, -0.26));
      g.fillRect(bodyX + 35, bodyY, 9, 50);
      g.fillStyle(variant.stripe);
      g.fillRect(bodyX + 8, bodyY + 13, 28, 6);
      g.fillRect(bodyX + 6, bodyY - 6, 30, 8);
      g.fillStyle(0x1b2027);
      g.fillRect(bodyX + 2, bodyY + 31, 40, 19);
      g.fillStyle(0x39414d);
      g.fillRect(bodyX + 4, bodyY + 33, 12, 10);
      g.fillStyle(variant.pants);
      g.fillRect(bodyX + 6 + offsets.legLeft, bodyY + 50, 13, 30);
      g.fillRect(bodyX + 24 + offsets.legRight, bodyY + 50, 13, 30);
      g.fillStyle(tintColor(variant.pants, 0.18));
      g.fillRect(bodyX + 8 + offsets.legLeft, bodyY + 54, 6, 8);
      g.fillRect(bodyX + 26 + offsets.legRight, bodyY + 54, 6, 8);
      g.fillStyle(tintColor(variant.pants, -0.24));
      g.fillRect(bodyX + 15 + offsets.legLeft, bodyY + 50, 4, 30);
      g.fillRect(bodyX + 33 + offsets.legRight, bodyY + 50, 4, 30);
      g.fillStyle(variant.gear);
      g.fillRect(bodyX + 3 + offsets.legLeft, bodyY + 79, 18, 8);
      g.fillRect(bodyX + 21 + offsets.legRight, bodyY + 79, 18, 8);
      g.fillStyle(0x535c69);
      g.fillRect(bodyX + 4 + offsets.legLeft, bodyY + 79, 8, 3);
      g.fillRect(bodyX + 22 + offsets.legRight, bodyY + 79, 8, 3);
      g.fillStyle(variant.gear);
      g.fillRect(bodyX + 46, bodyY + 12, 10, 8);
      g.fillRect(bodyX + 58 + offsets.weapon, bodyY + 15, 36, 6);
      g.fillRect(bodyX + 92 + offsets.weapon, bodyY + 13, 14, 4);
      g.fillStyle(0x5e6875);
      g.fillRect(bodyX + 61 + offsets.weapon, bodyY + 15, 11, 2);
      g.fillStyle(variant.highlight ?? 0xf2ead8);
      g.fillRect(bodyX + 84 + offsets.weapon, bodyY + 16, 10, 1);
      g.fillStyle(variant.stripe);
      g.fillRect(headX + 18, headY - 10, 12, 10);
      g.fillRect(headX + 15, headY - 4, 18, 5);
      g.fillRect(bodyX + 54 + offsets.weapon, bodyY + 28, 12, 12);

      if (pose === "hurt") {
        g.fillStyle(0xffd95c);
        g.fillRect(bodyX + 4, bodyY + 18, 34, 6);
      }

      g.generateTexture(`${variant.prefix}-${pose}`, 132, 124);
      g.destroy();
      return;
    }

    const offsets = {
      "run-a": { legLeft: -7, legRight: 6, arm: 8, torso: -2, weapon: 10 },
      "run-b": { legLeft: 6, legRight: -7, arm: -4, torso: 1, weapon: -4 },
      attack: { legLeft: -1, legRight: 2, arm: 14, torso: -1, weapon: 18 },
      hurt: { legLeft: -2, legRight: 3, arm: -6, torso: 1, weapon: -2 },
      idle: { legLeft: 0, legRight: 0, arm: 0, torso: 0, weapon: 0 },
    }[pose];

    const bodyX = 38;
    const bodyY = 36 + offsets.torso;
    const bodyW = 38;
    const bodyH = 48;
    const headX = 42;
    const headY = 10 + offsets.torso;

    g.fillStyle(variant.gear);
    g.fillRect(bodyX - 12, bodyY + 8, 12, bodyH + 12);
    g.fillRect(bodyX + bodyW + 14 + offsets.weapon, bodyY + 10, 36, 7);
    g.fillRect(bodyX + bodyW + 42 + offsets.weapon, bodyY + 8, 10, 5);
    g.fillStyle(variant.skin);
    g.fillRect(headX, headY, 28, 28);
    g.fillRect(bodyX - 4, bodyY + 6, 20, 11);
    g.fillRect(bodyX + bodyW - 2 + offsets.arm, bodyY + 8, 25, 11);
    g.fillStyle(variant.hair);
    g.fillRect(headX - 6, headY + 6, 14, 22);
    g.fillRect(headX + 2, headY - 3, 32, 7);
    g.fillStyle(variant.shirt);
    g.fillRect(bodyX, bodyY, bodyW, bodyH);
    g.fillStyle(variant.stripe);
    g.fillRect(bodyX + 6, bodyY + 12, bodyW - 12, 6);
    g.fillStyle(variant.pants);
    g.fillRect(bodyX + 4 + offsets.legLeft, bodyY + bodyH, 12, 28);
    g.fillRect(bodyX + 22 + offsets.legRight, bodyY + bodyH, 12, 28);
    g.fillStyle(variant.gear);
    g.fillRect(bodyX + 2 + offsets.legLeft, bodyY + bodyH + 27, 18, 8);
    g.fillRect(bodyX + 20 + offsets.legRight, bodyY + bodyH + 27, 18, 8);
    g.fillRect(bodyX + bodyW - 1, bodyY + 10, 8, 6);

    if (variant.accessory === "visor") {
      g.fillStyle(variant.accent);
      g.fillRect(headX - 2, headY + 2, 34, 5);
      g.fillRect(bodyX - 14, bodyY + 18, 10, 18);
    } else if (variant.accessory === "armor") {
      g.fillStyle(variant.accent);
      g.fillRect(bodyX - 12, bodyY + 18, 14, 14);
      g.fillRect(bodyX + 8, bodyY - 6, 24, 8);
    } else if (variant.accessory === "beret") {
      g.fillStyle(variant.accent);
      g.fillRect(headX - 4, headY - 2, 34, 6);
      g.fillRect(headX + 22, headY + 2, 10, 5);
    } else if (variant.accessory === "cape") {
      g.fillStyle(variant.accent);
      g.fillRect(bodyX - 14, bodyY + 8, 10, 42);
      g.fillRect(bodyX - 20, bodyY + 26, 12, 22);
    } else if (variant.accessory === "tower") {
      g.fillStyle(0xc5b06c);
      g.fillRect(headX + 18, headY - 10, 12, 10);
      g.fillRect(headX + 15, headY - 4, 18, 5);
      g.fillStyle(variant.accent);
      g.fillRect(bodyX + bodyW + 8 + offsets.weapon, bodyY + 26, 10, 12);
    }

    if (pose === "hurt") {
      g.fillStyle(0xffd95c);
      g.fillRect(bodyX + 3, bodyY + 18, bodyW - 6, 6);
    }

    g.generateTexture(`${variant.prefix}-${pose}`, 132, 124);
    g.destroy();
  }

  createEffectTextures() {
    const dust = this.make.graphics({ x: 0, y: 0, add: false });
    dust.fillStyle(0xd8d0c2);
    dust.fillRect(4, 8, 12, 8);
    dust.fillRect(21, 3, 18, 10);
    dust.fillRect(43, 10, 10, 7);
    dust.generateTexture("dust", 58, 22);
    dust.destroy();

    const muzzle = this.make.graphics({ x: 0, y: 0, add: false });
    muzzle.fillStyle(0xfff2a8);
    muzzle.fillTriangle(0, 12, 18, 2, 18, 22);
    muzzle.fillStyle(0xff8b22);
    muzzle.fillTriangle(6, 12, 18, 6, 18, 18);
    muzzle.fillStyle(0xff365f);
    muzzle.fillRect(14, 10, 8, 4);
    muzzle.generateTexture("muzzle-flash", 24, 24);
    muzzle.destroy();

    const smoke = this.make.graphics({ x: 0, y: 0, add: false });
    smoke.fillStyle(0xe8e0d0);
    smoke.fillCircle(14, 12, 10);
    smoke.fillCircle(26, 10, 8);
    smoke.fillCircle(22, 18, 9);
    smoke.fillStyle(0xb3ad9f);
    smoke.fillCircle(18, 15, 7);
    smoke.generateTexture("smoke-puff", 36, 30);
    smoke.destroy();

    const shell = this.make.graphics({ x: 0, y: 0, add: false });
    shell.fillStyle(0xd7b16f);
    shell.fillRect(2, 2, 12, 6);
    shell.fillStyle(0xf0d59a);
    shell.fillRect(3, 2, 4, 6);
    shell.fillStyle(0x8b5c24);
    shell.fillRect(12, 2, 2, 6);
    shell.generateTexture("shell", 16, 10);
    shell.destroy();

    const trail = this.make.graphics({ x: 0, y: 0, add: false });
    trail.fillStyle(0xfff2a8);
    trail.fillRect(0, 2, 26, 3);
    trail.fillStyle(0xff8b22);
    trail.fillRect(16, 1, 12, 5);
    trail.generateTexture("bullet-trail", 28, 7);
    trail.destroy();

    const splash = this.make.graphics({ x: 0, y: 0, add: false });
    splash.fillStyle(0xb8d7ff);
    splash.fillRect(10, 10, 18, 4);
    splash.fillRect(4, 16, 30, 3);
    splash.fillRect(14, 4, 4, 8);
    splash.fillRect(24, 2, 4, 10);
    splash.generateTexture("rain-splash", 38, 24);
    splash.destroy();

    const burstHot = this.make.graphics({ x: 0, y: 0, add: false });
    burstHot.fillStyle(0xfff2a8);
    burstHot.fillRect(28, 0, 12, 60);
    burstHot.fillRect(0, 24, 68, 12);
    burstHot.fillStyle(0xff8b22);
    burstHot.fillRect(16, 12, 36, 36);
    burstHot.fillStyle(0xff365f);
    burstHot.fillRect(24, 22, 20, 20);
    burstHot.generateTexture("hit-burst-hot", 68, 60);
    burstHot.destroy();
  }
}

class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    document.body.classList.add("menu-active");
    this.events.once("shutdown", () => document.body.classList.remove("menu-active"));
    this.events.once("shutdown", () => arcadeAudio.stopMusic());
    competitionUi.hideResult();
    this.selected = 0;
    this.attractStartedAt = this.time.now;
    this.demoLaunched = false;
    this.menuStarting = false;
    this.cameras.main.setBackgroundColor("#15151c");
    arcadeAudio.startMenuMusic(this);
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x15151c);
    this.drawArcadeFrame();
    this.createHeader();
    this.createFeaturePanel();
    this.selectorTabs = CITIES.map((city, index) => this.createSelectorTab(city, index));
    this.createFooter();
    competitionUi.setCity(CITIES[this.selected].key);

    this.input.keyboard.on("keydown-LEFT", () => { this.resetAttract(); this.pick(this.selected - 1); });
    this.input.keyboard.on("keydown-RIGHT", () => { this.resetAttract(); this.pick(this.selected + 1); });
    this.input.keyboard.on("keydown-UP", () => { this.resetAttract(); this.moveVertical(-1); });
    this.input.keyboard.on("keydown-DOWN", () => { this.resetAttract(); this.moveVertical(1); });
    this.input.keyboard.on("keydown-ENTER", () => { this.resetAttract(); this.requestStartSelected(); });
    this.input.keyboard.on("keydown-SPACE", () => { this.resetAttract(); this.requestStartSelected(); });
    this.input.on("pointerdown", (pointer, targets) => {
      this.resetAttract();
      const clickedInteractive = targets.some((target) => target?.getData?.("menu-action"));
      if (clickedInteractive) {
        return;
      }
      this.pickCityFromPointer(pointer);
    });
    this.updateCards();
  }

  drawArcadeFrame() {
    this.outerWidth = WIDTH - sx(34);
    this.innerWidth = WIDTH - sx(128);
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, this.outerWidth, HEIGHT - sy(30), 0x252936).setStrokeStyle(sx(6), 0xf2ead8);
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, this.outerWidth - sx(20), HEIGHT - sy(50), 0x1c1f27).setStrokeStyle(sx(4), 0x050507, 0.9);
    this.add.rectangle(WIDTH / 2, sy(44), this.innerWidth - sx(40), sy(22), 0xff365f);
    this.add.rectangle(WIDTH / 2, sy(246), this.innerWidth, sy(178), 0x2c313c).setStrokeStyle(sx(4), 0x111218, 1);
    this.add.rectangle(WIDTH / 2, sy(470), this.innerWidth, sy(92), 0x20242d).setStrokeStyle(sx(4), 0x111218, 1);
    this.add.rectangle(WIDTH / 2, sy(598), this.innerWidth, sy(24), 0x17191f).setStrokeStyle(sx(3), 0x0b0c10, 1);

    for (let i = 0; i < 15; i += 1) {
      this.add.rectangle(WIDTH / 2 - this.innerWidth / 2 + sx(34) + i * sx(69), sy(322), sx(3), sy(406), 0xffffff, 0.028);
    }
  }

  createHeader() {
    const logoFont = Math.round(sx(23));
    const subFont = Math.round(sx(20));
    const coinFont = Math.round(sx(13));
    this.add
      .text(WIDTH / 2, sy(58), "KAMUABU WORLD TOUR", {
        fontFamily: '"Press Start 2P"',
        fontSize: `${logoFont}px`,
        color: "#ff8b22",
        stroke: "#000000",
        strokeThickness: Math.round(sx(7)),
      })
      .setOrigin(0.5);
    this.add
      .text(WIDTH / 2, sy(105), "Elige ciudad y entra en una mision arcade con sabor propio", {
        fontFamily: "VT323",
        fontSize: `${subFont}px`,
        color: "#f2ead8",
      })
      .setOrigin(0.5);
    this.insertCoin = this.add
      .text(WIDTH / 2, sy(138), "INSERT COIN  |  PRESS START", {
        fontFamily: '"Press Start 2P"',
        fontSize: `${coinFont}px`,
        color: "#c7ff3a",
        stroke: "#000000",
        strokeThickness: Math.max(2, Math.round(sx(2))),
      })
      .setOrigin(0.5);
    this.insertCoin
      .setInteractive({ useHandCursor: true })
      .setData("menu-action", "start")
      .on("pointerdown", () => {
        this.resetAttract();
        this.requestStartSelected();
      });
    this.tweens.add({
      targets: this.insertCoin,
      alpha: 0.28,
      duration: 420,
      yoyo: true,
      repeat: -1,
      ease: "Stepped",
    });
    this.attractText = this.add
      .text(WIDTH / 2, sy(160), "ATTRACT MODE IN 09", {
        fontFamily: '"Press Start 2P"',
        fontSize: `${Math.round(sx(8))}px`,
        color: "#40d8ff",
      })
      .setOrigin(0.5);
    this.menuHotzone = this.add
      .zone(WIDTH / 2, sy(138), sx(420), sy(56))
      .setInteractive({ useHandCursor: true })
      .setData("menu-action", "start")
      .on("pointerdown", () => {
        this.resetAttract();
        this.requestStartSelected();
      });
  }

  createFeaturePanel() {
    const leftX = WIDTH / 2 - sx(170);
    const topY = sy(178);
    const previewW = sx(264);
    const previewH = sy(142);
    const infoX = WIDTH / 2 + sx(164);
    this.featureLeftX = leftX;
    this.featureTopY = topY;
    this.featurePreviewW = previewW;
    this.featurePreviewH = previewH;
    const featureShellMaskShape = this.make.graphics({
      x: leftX - previewW / 2 - sx(2),
      y: topY - sy(2),
      add: false,
    });
    featureShellMaskShape.fillRect(0, 0, previewW + sx(4), previewH + sy(4));
    const featureShellMask = featureShellMaskShape.createGeometryMask();

    this.featureFrameBase = this.add
      .rectangle(leftX, topY + previewH / 2, previewW, previewH, 0x343844)
      .setStrokeStyle(sx(4), 0x000000)
      .setMask(featureShellMask);
    this.featureFrameBase
      .setInteractive({ useHandCursor: true })
      .setData("menu-action", "start")
      .on("pointerdown", () => {
        this.resetAttract();
        this.requestStartSelected();
      });
    this.featureFrameInner = this.add
      .rectangle(leftX, topY + previewH / 2, previewW - sx(16), previewH - sy(16), 0x2a2e38)
      .setStrokeStyle(sx(3), 0x6c7280, 0.85)
      .setMask(featureShellMask);
    this.featureFrameHeader = this.add
      .rectangle(leftX, topY + previewH / 2 - sy(60), previewW - sx(22), sy(26), 0x1b1d25)
      .setMask(featureShellMask);
    this.featurePreview = this.add.container(leftX, topY + previewH / 2 + sy(2));
    const previewMaskShape = this.make.graphics({
      x: leftX - (previewW - sx(24)) / 2,
      y: topY + sy(10),
      add: false,
    });
    previewMaskShape.fillRect(0, 0, previewW - sx(24), sy(98));
    this.featurePreview.setMask(previewMaskShape.createGeometryMask());

    this.featureCityTitle = this.add
      .text(leftX, topY + previewH / 2 - sy(61), "", {
        fontFamily: '"Press Start 2P"',
        fontSize: `${Math.round(sx(12))}px`,
        color: "#f2ead8",
      })
      .setOrigin(0.5)
      .setMask(featureShellMask);

    this.featureInfoCard = this.add.rectangle(infoX, sy(198), sx(336), sy(82), 0x171920).setStrokeStyle(sx(3), 0x343844);
    this.featureInfoCard
      .setInteractive({ useHandCursor: true })
      .setData("menu-action", "start")
      .on("pointerdown", () => {
        this.resetAttract();
        this.requestStartSelected();
      });
    this.featureLabel = this.add
      .text(infoX - sx(142), sy(176), "DESTINO", {
        fontFamily: '"Press Start 2P"',
        fontSize: `${Math.round(sx(9))}px`,
        color: "#40d8ff",
      })
      .setOrigin(0, 0.5);
    this.featureLandmark = this.add
      .text(infoX - sx(142), sy(201), "", {
        fontFamily: '"Press Start 2P"',
        fontSize: `${Math.round(sx(14))}px`,
        color: "#ffd95c",
      })
      .setOrigin(0, 0.5);
    this.featureBlurb = this.add
      .text(infoX - sx(142), sy(236), "", {
        fontFamily: "VT323",
        fontSize: `${Math.round(sx(20))}px`,
        color: "#f2ead8",
        wordWrap: { width: sx(284) },
        lineSpacing: 4,
      })
      .setOrigin(0, 0);
    this.featureStamp = this.add
      .text(infoX - sx(142), sy(326), "", {
        fontFamily: '"Press Start 2P"',
        fontSize: `${Math.round(sx(10))}px`,
        color: "#c7ff3a",
      })
      .setOrigin(0, 0.5);
  }

  createSelectorTab(city, index) {
    const cardW = sx(154);
    const cardH = sy(82);
    const gap = sx(18);
    const totalWidth = cardW * CITIES.length + gap * (CITIES.length - 1);
    const startX = WIDTH / 2 - totalWidth / 2 + cardW / 2 + sx(10);
    const x = startX + index * (cardW + gap);
    const y = sy(466);
    if (!this.selectorRowMask) {
      const rowMaskShape = this.make.graphics({
        x: WIDTH / 2 - this.innerWidth / 2 + sx(8),
        y: sy(424),
        add: false,
      });
      rowMaskShape.fillRect(0, 0, this.innerWidth - sx(16), sy(116));
      this.selectorRowMask = rowMaskShape.createGeometryMask();
    }
    const tab = this.add.container(x, y);
    const base = this.add.rectangle(0, 0, cardW, cardH, 0x343844).setStrokeStyle(sx(4), 0x000000);
    const inner = this.add.rectangle(0, 0, cardW - sx(14), cardH - sy(14), 0x2a2e38).setStrokeStyle(sx(3), 0x6c7280, 0.85);
    const header = this.add.rectangle(0, -cardH / 2 + sy(16), cardW - sx(14), sy(22), 0x1c1f28);
    const preview = this.add.container(0, sy(2));
    const previewMaskShape = this.make.graphics({ x: x - (cardW - sx(24)) / 2, y: y - sy(24), add: false });
    previewMaskShape.fillRect(0, 0, cardW - sx(24), sy(38));
    preview.setMask(previewMaskShape.createGeometryMask());
    const sky = this.add.rectangle(0, -sy(4), cardW - sx(26), sy(28), Phaser.Display.Color.HexStringToColor(city.sky).color);
    const mid = this.add.rectangle(0, sy(11), cardW - sx(26), sy(18), city.wall);
    const road = this.add.rectangle(0, sy(23), cardW - sx(26), sy(7), city.road);
    preview.add([sky, mid, road]);
    this.drawMiniLandmark(preview, city, cardW, cardH);
    const title = this.add
      .text(0, -cardH / 2 + sy(16), city.name.toUpperCase(), {
        fontFamily: '"Press Start 2P"',
        fontSize: `${Math.round(sx(6))}px`,
        color: "#f2ead8",
        align: "center",
      })
      .setOrigin(0.5);
    const accent = this.add.rectangle(0, cardH / 2 - sy(16), cardW - sx(24), sy(8), city.accent);
    tab.add([base, inner, header, preview, accent, title]);
    tab.setSize(cardW, cardH);
    tab.setMask(this.selectorRowMask);
    tab.setInteractive(new Phaser.Geom.Rectangle(-cardW / 2, -cardH / 2, cardW, cardH), Phaser.Geom.Rectangle.Contains);
    tab.on("pointerdown", () => {
      this.resetAttract();
      if (this.selected === index) {
        this.requestStartSelected();
        return;
      }
      this.pick(index);
    });
    return { tab, base, inner, city };
  }

  drawMiniLandmark(card, city, cardW, cardH) {
    const previewBottom = sy(48);

    if (city.key === "valencia") {
      card.add(this.add.rectangle(-sx(54), sy(12), sx(8), sy(72), 0x6d4a2b));
      card.add(this.add.triangle(-sx(54), -sy(26), -sx(90), sy(4), -sx(54), -sy(52), -sx(20), sy(4), 0x2fc474));
      card.add(this.add.triangle(-sx(76), -sy(10), -sx(106), sy(16), -sx(76), -sy(36), -sx(44), sy(16), 0x39d47a));
      card.add(this.add.rectangle(sx(34), sy(18), sx(54), sy(48), 0xff8b22));
      card.add(this.add.rectangle(sx(34), sy(18), sx(18), sy(48), 0xf2ead8));
      card.add(this.add.rectangle(sx(50), sy(44), sx(22), sy(10), 0x40d8ff));
      for (let i = 0; i < 4; i += 1) {
        card.add(this.add.rectangle(-sx(24) + i * sx(14), previewBottom, sx(10), sy(4), 0xf2ead8));
      }
    } else if (city.key === "roma") {
      card.add(this.add.rectangle(0, sy(16), sx(118), sy(54), 0x9f7c60));
      for (let i = 0; i < 4; i += 1) {
        card.add(this.add.rectangle(-sx(42) + i * sx(28), sy(16), sx(14), sy(54), 0x2c2320));
      }
      card.add(this.add.arc(0, -sy(8), sx(42), 180, 360, false, 0xc89a6d, 0.65));
      card.add(this.add.rectangle(0, previewBottom, sx(126), sy(6), 0x2b2320));
    } else if (city.key === "paris") {
      card.add(this.add.triangle(0, -sy(8), 0, -sy(48), -sx(22), sy(36), sx(22), sy(36), city.accent));
      card.add(this.add.rectangle(0, sy(18), sx(56), sy(6), 0x15151c));
      card.add(this.add.rectangle(-sx(48), sy(28), sx(28), sy(16), 0x253049));
      card.add(this.add.rectangle(sx(48), sy(28), sx(28), sy(16), 0x253049));
      card.add(this.add.rectangle(0, previewBottom, sx(126), sy(6), 0x15151c));
    } else if (city.key === "venecia") {
      card.add(this.add.rectangle(0, sy(40), sx(132), sy(14), 0x204d58));
      card.add(this.add.arc(0, sy(26), sx(42), 180, 360, false, city.accent, 0.92));
      card.add(this.add.rectangle(0, sy(34), sx(124), sy(6), 0x15151c));
      card.add(this.add.triangle(-sx(40), sy(20), -sx(52), sy(10), -sx(34), sy(4), -sx(28), sy(20), 0x15151c));
      card.add(this.add.rectangle(-sx(36), sy(18), sx(20), sy(4), 0xff365f));
      card.add(this.add.rectangle(sx(36), sy(8), sx(20), sy(34), 0xb48b64));
    } else if (city.key === "londres") {
      card.add(this.add.rectangle(-sx(34), sy(12), sx(26), sy(74), 0x454b58));
      card.add(this.add.rectangle(-sx(34), -sy(18), sx(36), sy(12), 0xc5b06c));
      card.add(this.add.rectangle(-sx(34), -sy(30), sx(8), sy(12), 0x454b58));
      card.add(this.add.triangle(-sx(34), -sy(42), -sx(44), -sy(24), -sx(34), -sy(54), -sx(24), -sy(24), 0xc5b06c));
      card.add(this.add.rectangle(sx(34), sy(16), sx(28), sy(76), 0xd32d3f).setStrokeStyle(sx(2), 0x15151c));
      card.add(this.add.rectangle(sx(34), sy(6), sx(18), sy(12), 0xf2ead8));
      card.add(this.add.rectangle(0, previewBottom, sx(132), sy(6), 0x15151c));
    }

    for (let i = 0; i < 6; i += 1) {
      card.add(this.add.rectangle(-cardW / 2 + sx(20) + i * sx(34), -cardH / 2 + sy(48), sx(4), sy(4), 0xf2ead8, 0.5));
    }
  }

  moveVertical(direction) {
    this.pick(this.selected + direction);
  }

  pick(index) {
    this.selected = Phaser.Math.Wrap(index, 0, CITIES.length);
    this.updateCards();
  }

  updateCards() {
    const selectedCity = CITIES[this.selected];
    competitionUi.setCity(selectedCity.key);
    this.featureCityTitle.setText(selectedCity.name.toUpperCase());
    this.featureLandmark.setText(selectedCity.landmark.toUpperCase());
    this.featureBlurb.setText(this.getMenuBlurb(selectedCity));
    this.featureStamp.setText(this.getMenuStamp(selectedCity));
    this.selectionLabel.setText(`${selectedCity.name.toUpperCase()}  |  ${selectedCity.landmark.toUpperCase()}`);
    this.featurePreview.removeAll(true);
    const previewW = this.featurePreviewW;
    const previewH = this.featurePreviewH;
    const sky = this.add.rectangle(0, -sy(24), previewW - sx(24), sy(70), Phaser.Display.Color.HexStringToColor(selectedCity.sky).color);
    const mid = this.add.rectangle(0, sy(26), previewW - sx(24), sy(62), selectedCity.wall);
    const road = this.add.rectangle(0, sy(64), previewW - sx(24), sy(24), selectedCity.road);
    this.featurePreview.add([sky, mid, road]);
    this.drawMiniLandmark(this.featurePreview, selectedCity, previewW, previewH);

    this.selectorTabs.forEach(({ tab, base, inner, city }, index) => {
      const active = index === this.selected;
      base.setStrokeStyle(active ? sx(6) : sx(4), active ? 0xffd95c : 0x000000);
      inner.setStrokeStyle(active ? sx(3) : sx(2), active ? city.accent : 0x6c7280, 0.95);
      tab.setScale(active ? 1.02 : 0.98);
      tab.y = active ? sy(462) : sy(466);
    });
  }

  createFooter() {
    const helpFont = Math.round(sx(11));
    this.selectionLabel = this.add
      .text(WIDTH / 2, sy(594), "", {
        fontFamily: '"Press Start 2P"',
        fontSize: `${Math.round(sx(10))}px`,
        color: "#ffd95c",
        align: "center",
      })
      .setOrigin(0.5);
    this.help = this.add
      .text(WIDTH / 2, sy(612), "TOCA una ciudad para elegir   |   INSERT COIN / ENTER para jugar", {
        fontFamily: '"Press Start 2P"',
        fontSize: `${helpFont}px`,
        color: "#40d8ff",
      })
      .setOrigin(0.5);
  }

  pickCityFromPointer(pointer) {
    const rowY = sy(466);
    const cardW = sx(154);
    const cardH = sy(82);
    const gap = sx(18);
    const totalWidth = cardW * CITIES.length + gap * (CITIES.length - 1);
    const startX = WIDTH / 2 - totalWidth / 2 + cardW / 2 + sx(10);
    if (pointer.y < rowY - cardH / 2 || pointer.y > rowY + cardH / 2) {
      return;
    }
    for (let i = 0; i < CITIES.length; i += 1) {
      const x = startX + i * (cardW + gap);
      if (pointer.x >= x - cardW / 2 && pointer.x <= x + cardW / 2) {
        this.pick(i);
        return;
      }
    }
  }

  getMenuBlurb(city) {
    const blurbs = {
      valencia: "Palmeras, azulejos y energia mediterranea para arrancar la gira con color y luz de calle.",
      roma: "Arcos antiguos, piedra dorada y actitud de arena arcade en una mision con peso historico.",
      paris: "Neon, escaparates y moda nocturna para una ruta elegante con ritmo de recreativa urbana.",
      venecia: "Puentes, canal y siluetas de postal para un tramo mas exotico, acuatico y teatral.",
      londres: "Cabina roja, relojes y asfalto britanico con atmosfera gris, iconica y muy runner.",
    };
    return blurbs[city.key];
  }

  getMenuStamp(city) {
    const stamps = {
      valencia: "SUNSET SPRINT / COSTA PIXEL",
      roma: "STONE ARENA / CLASSIC ROUTE",
      paris: "NEON DISTRICT / FASHION RAID",
      venecia: "CANAL RUSH / BRIDGE LINE",
      londres: "ROYAL ROAD / NIGHT SHIFT",
    };
    return stamps[city.key];
  }

  requestStartSelected() {
    if (this.menuStarting) return;
    if (!competitionUi.ensurePlayerForStart(() => this.requestStartSelected())) {
      return;
    }
    this.menuStarting = true;
    this.input.enabled = false;
    this.time.delayedCall(80, () => this.startSelected());
  }

  startSelected() {
    document.body.classList.remove("menu-active");
    this.scene.start("PlayScene", { cityKey: CITIES[this.selected].key });
  }

  resetAttract() {
    this.attractStartedAt = this.time.now;
    this.demoLaunched = false;
    arcadeAudio.ensure();
  }

  update(time) {
    const idle = time - this.attractStartedAt;
    const remaining = Math.max(0, 9 - Math.floor(idle / 1000));
    this.attractText.setText(idle < 9000 ? `ATTRACT MODE IN ${String(remaining).padStart(2, "0")}` : "ATTRACT MODE READY");
    if (idle > 9000 && !this.demoLaunched) {
      this.demoLaunched = true;
      this.scene.start("PlayScene", { cityKey: CITIES[this.selected].key, demoMode: true });
    }
  }
}

class PlayScene extends Phaser.Scene {
  constructor() {
    super("PlayScene");
    this.touchState = { left: false, right: false, down: false, jump: false, shoot: false };
    this.touchJumpQueued = false;
    this.keyboardState = {
      left: false,
      right: false,
      down: false,
      shoot: false,
      jumpQueued: false,
      restartQueued: false,
      menuQueued: false,
    };
    this.boundTouchButtons = [];
    this.handleWindowBlur = null;
    this.handleVisibilityChange = null;
    this.handleKeyDown = null;
    this.handleKeyUp = null;
  }

  create(data) {
    document.body.classList.remove("menu-active");
    this.city = getCity(data.cityKey);
    this.applyCityTheme();
    this.demoMode = Boolean(data.demoMode);
    this.score = 0;
    this.combo = 1;
    this.speed = 0;
    this.stageDistance = 0;
    this.stageLength = 84000;
    this.scrollSpeed = 0;
    this.socks = 0;
    this.scooters = 0;
    this.isPowered = false;
    this.health = 1;
    this.isDucking = false;
    this.weapon = "Pistol";
    this.ammo = Infinity;
    this.fireLevel = 1;
    this.specialWeapon = null;
    this.specialAmmo = 0;
    this.shieldUntil = 0;
    this.turboUntil = 0;
    this.superOutfitUntil = 0;
    this.scooterUntil = 0;
    this.weatherBoostUntil = 0;
    this.lastShotAt = 0;
    this.lastRightTapAt = -9999;
    this.sprintUntil = 0;
    this.jumpBufferUntil = 0;
    this.coyoteUntil = 0;
    this.lastGroundedAt = 0;
    this.airJumpsUsed = 0;
    this.maxAirJumps = 1;
    this.lastDamageAt = -9999;
    this.enemiesDefeated = 0;
    this.prisonersSaved = 0;
    this.totalSocksCollected = 0;
    this.totalShirtsCollected = 0;
    this.totalScootersCollected = 0;
    this.hitsTaken = 0;
    this.maxComboObserved = 1;
    this.midBossDefeated = false;
    this.runStartedAt = this.time.now;
    this.weaponPeak = "Pistol";
    this.invulnerableUntil = 0;
    this.isGameOver = false;
    this.best = Number(localStorage.getItem(BEST_KEY) || 0);
    this.spawnTimer = 0;
    this.rewardTimer = 850;
    this.enemyTimer = 650;
    this.crateTimer = 1200;
    this.platformTimer = 900;
    this.nextEnemy = 900;
    this.nextCrate = 1600;
    this.nextPlatform = 2400;
    this.nextObstacle = 2800;
    this.nextReward = 1100;
    this.lastHazardX = WIDTH + 260;
    this.lastObstacleAt = -9999;
    this.lastEnemyAt = -9999;
    this.platformSafeUntil = 0;
    this.scriptedSectionUntil = 0;
    this.lastMilestone = -1;
    this.stageEventIndex = 0;
    this.missionPhase = "intro";
    this.activeBoss = null;
    this.midBossSpawned = false;
    this.bossSpawned = false;
    this.bossDefeated = false;
    this.prevRunnerOnGround = false;
    this.comboTierShown = 1;
    this.lastSafeRunnerX = sx(150);
    this.lastSafeRunnerY = GROUND_Y;

    this.cameras.main.setBackgroundColor(this.city.sky);
    this.physics.world.setBounds(0, 0, WIDTH, HEIGHT);
    this.events.once("shutdown", () => {
      this.resetTransientInput();
      if (this.handleWindowBlur) {
        window.removeEventListener("blur", this.handleWindowBlur);
      }
      if (this.handleWindowPointerUp) {
        window.removeEventListener("pointerup", this.handleWindowPointerUp, true);
      }
      if (this.handleWindowPointerCancel) {
        window.removeEventListener("pointercancel", this.handleWindowPointerCancel, true);
      }
      if (this.handleVisibilityChange) {
        document.removeEventListener("visibilitychange", this.handleVisibilityChange);
      }
      if (this.handleKeyDown) {
        window.removeEventListener("keydown", this.handleKeyDown, true);
      }
      if (this.handleKeyUp) {
        window.removeEventListener("keyup", this.handleKeyUp, true);
      }
      this.boundTouchButtons.forEach(({ button, activate, deactivate, handleLeave }) => {
        button.removeEventListener("pointerdown", activate);
        button.removeEventListener("pointerup", deactivate);
        button.removeEventListener("pointercancel", deactivate);
        button.removeEventListener("pointerleave", handleLeave);
        button.removeEventListener("lostpointercapture", deactivate);
      });
      this.boundTouchButtons = [];
      arcadeAudio.stopMusic();
    });
    arcadeAudio.startCityMusic(this, this.city.key);

    this.createWorld();
    this.createRunner();
    this.createGroups();
    this.createTextPanels();
    this.registerInput();
    this.stageScript = this.buildStageScript();
    this.syncHud();
    if (!this.demoMode) {
      competitionUi.startRun(this.city.key);
    }
  }

  resetTransientInput() {
    this.touchState = { left: false, right: false, down: false, jump: false, shoot: false };
    this.touchJumpQueued = false;
    this.keyboardState.left = false;
    this.keyboardState.right = false;
    this.keyboardState.down = false;
    this.keyboardState.shoot = false;
    this.keyboardState.jumpQueued = false;
    this.keyboardState.restartQueued = false;
    this.keyboardState.menuQueued = false;
    this.lastRightTapAt = -9999;
    this.sprintUntil = 0;
    if (this.runner?.body) {
      this.runner.setVelocityX(0);
    }
    if (!this.isGameOver) {
      this.setDucking(false);
    }
    [this.cursors?.left, this.cursors?.right, this.cursors?.down, this.cursors?.up, this.keys?.left, this.keys?.right, this.keys?.down, this.keys?.shoot, this.keys?.space].forEach((key) => {
      if (key?.reset) {
        key.reset();
      } else if (key) {
        key.isDown = false;
        key.isUp = true;
        key.duration = 0;
        key.repeats = 0;
        key.timeDown = 0;
        key.timeUp = this.time?.now || 0;
      }
    });
    this.input?.keyboard?.resetKeys?.();
    this.boundTouchButtons.forEach(({ button }) => button.classList.remove("is-active"));
  }

  resetTouchInputOnly() {
    this.touchState = { left: false, right: false, down: false, jump: false, shoot: false };
    this.touchJumpQueued = false;
    this.boundTouchButtons.forEach(({ button }) => button.classList.remove("is-active"));
  }

  applyCityTheme() {
    document.body.style.setProperty("--city-accent", cssHex(this.city.accent));
    document.body.style.setProperty("--city-highlight", cssHex(this.city.highlight));
    document.body.style.setProperty("--city-shadow", cssHex(this.city.shadow));
    document.body.style.setProperty("--city-glow", cssHex(this.city.glow));
    document.body.style.setProperty("--hud-metal-a", cssHex(tintColor(this.city.highlight, 0.36)));
    document.body.style.setProperty("--hud-metal-b", cssHex(tintColor(this.city.shadow, 0.24)));
    document.body.style.setProperty("--hud-title", cssHex(tintColor(this.city.shadow, 0.12)));
    document.body.style.setProperty("--hud-value", cssHex(tintColor(this.city.shadow, -0.42)));
  }

  createWorld() {
    this.skyArt = this.add.layer();
    this.vistaLayer = this.add.layer();
    this.skyline = this.add.layer();
    this.midground = this.add.layer();
    this.backdrop = this.add.layer();
    this.landmarkLayer = this.add.layer();
    this.propLayer = this.add.layer();
    this.frontDepth = this.add.layer();
    this.foreground = this.add.layer();
    this.weatherLayer = this.add.layer();
    this.gradeLayer = this.add.layer();
    this.speedLayer = this.add.layer();

    this.createSkyBackdrop();
    this.createVista();
    this.createSkyline();
    this.createMidDepth();
    this.createWall();
    this.createLandmark();
    this.createStreetProps();
    this.createForegroundDepth();
    this.createStreet();
    this.createAtmosphere();
    this.createColorGrade();
    this.createSpeedLines();
  }

  createVista() {
    const addHorizonBand = (y, h, color, alpha = 1) => {
      this.vistaLayer.add(this.add.rectangle(WIDTH / 2, y, WIDTH, h, color, alpha));
    };
    const addGlow = (x, y, w, h, color, alpha = 0.16) => {
      this.vistaLayer.add(this.add.ellipse(x, y, w, h, color, alpha));
    };

    if (this.city.key === "valencia") {
      addHorizonBand(sy(248), sy(20), 0xfff0c6, 0.24);
      addHorizonBand(sy(304), sy(84), 0x7fe0da, 0.24);
      addHorizonBand(sy(338), sy(18), 0xf7fffb, 0.14);
      addGlow(sx(1120), sy(154), sx(520), sy(194), 0xffc176, 0.2);

      const postcard = this.add.container(sx(92), sy(292));
      postcard.add(this.add.rectangle(sx(624), sy(58), sx(1326), sy(10), 0x294d60, 0.94));
      postcard.add(this.add.rectangle(sx(624), sy(72), sx(1326), sy(6), 0xcafcf3, 0.12));

      const agora = this.add.container(sx(6), -sy(4));
      agora.add(this.add.triangle(0, 0, -sx(118), sy(4), 0, -sy(138), sx(118), sy(4), 0x7b3f88, 0.96));
      for (let i = 0; i < 8; i += 1) {
        agora.add(this.add.rectangle(-sx(78) + i * sx(20), -sy(58) + i * sy(14), sx(164 - i * 18), sy(5), 0xffc655, 0.86));
      }
      agora.add(this.add.rectangle(0, sy(6), sx(236), sy(10), 0x2f2738));
      postcard.add(agora);

      const sciences = this.add.container(sx(282), -sy(6));
      sciences.add(this.add.rectangle(0, sy(64), sx(350), sy(10), 0x234a5b));
      sciences.add(this.add.arc(-sx(120), sy(22), sx(104), 180, 360, false, 0xf8fcff, 0.96));
      sciences.add(this.add.arc(-sx(120), sy(22), sx(80), 180, 360, false, 0xffbf74, 0.2));
      sciences.add(this.add.arc(-sx(8), sy(28), sx(64), 180, 360, false, 0xf8fcff, 0.92));
      sciences.add(this.add.arc(-sx(8), sy(28), sx(44), 180, 360, false, 0x86e2e0, 0.18));
      sciences.add(this.add.triangle(sx(132), -sy(12), sx(36), sy(64), sx(122), -sy(62), sx(188), sy(64), 0xf8fcff, 0.98));
      sciences.add(this.add.triangle(sx(138), sy(2), sx(52), sy(52), sx(126), -sy(34), sx(178), sy(52), 0x88e1e0, 0.32));
      sciences.add(this.add.rectangle(sx(134), sy(60), sx(130), sy(8), 0x203946));
      sciences.add(this.add.rectangle(-sx(10), sy(56), sx(94), sy(8), 0x203946));
      postcard.add(sciences);

      const oldTown = this.add.container(sx(836), -sy(18));
      const miguelete = this.add.container(-sx(44), 0);
      miguelete.add(this.add.rectangle(0, 0, sx(34), sy(156), 0xd59f34, 0.96).setOrigin(0.5, 1));
      miguelete.add(this.add.rectangle(0, -sy(122), sx(50), sy(14), 0x35545f));
      miguelete.add(this.add.circle(0, -sy(100), sx(9), 0x35545f));
      miguelete.add(this.add.rectangle(0, -sy(146), sx(6), sy(20), 0x35545f));
      oldTown.add(miguelete);

      const cathedral = this.add.container(sx(112), sy(14));
      cathedral.add(this.add.rectangle(0, sy(34), sx(164), sy(84), 0x703565, 0.92).setOrigin(0.5, 1));
      cathedral.add(this.add.rectangle(0, -sy(18), sx(92), sy(14), 0x703565));
      cathedral.add(this.add.circle(0, sy(0), sx(26), 0xffd95c, 0.94).setStrokeStyle(4, 0x703565));
      cathedral.add(this.add.triangle(0, sy(16), -sx(30), sy(48), 0, -sy(20), sx(30), sy(48), 0xffd95c, 0.92));
      cathedral.add(this.add.rectangle(0, sy(42), sx(30), sy(36), 0x5c2420));
      cathedral.add(this.add.rectangle(-sx(60), sy(20), sx(22), sy(62), 0xc94838, 0.9));
      cathedral.add(this.add.rectangle(sx(60), sy(20), sx(22), sy(62), 0xc94838, 0.9));
      oldTown.add(cathedral);

      const basilica = this.add.container(sx(258), sy(22));
      basilica.add(this.add.rectangle(0, sy(38), sx(138), sy(70), 0xa6c548, 0.9).setOrigin(0.5, 1));
      basilica.add(this.add.circle(0, -sy(4), sx(32), 0x2d8f49, 0.96));
      basilica.add(this.add.rectangle(0, -sy(42), sx(12), sy(28), 0xffd95c, 0.92));
      basilica.add(this.add.triangle(0, -sy(58), -sx(12), -sy(32), 0, -sy(76), sx(12), -sy(32), 0xffd95c));
      oldTown.add(basilica);
      postcard.add(oldTown);

      const serranos = this.add.container(sx(1178), sy(4));
      serranos.add(this.add.rectangle(0, sy(44), sx(176), sy(78), 0x59a9df, 0.92).setOrigin(0.5, 1));
      serranos.add(this.add.rectangle(-sx(56), -sy(6), sx(42), sy(88), 0x44b7f4, 0.96));
      serranos.add(this.add.rectangle(sx(56), -sy(6), sx(42), sy(88), 0x44b7f4, 0.96));
      serranos.add(this.add.rectangle(0, sy(46), sx(32), sy(36), 0x2a607d));
      serranos.add(this.add.rectangle(-sx(56), -sy(34), sx(50), sy(8), 0xe6f6ff, 0.22));
      serranos.add(this.add.rectangle(sx(56), -sy(34), sx(50), sy(8), 0xe6f6ff, 0.22));
      postcard.add(serranos);

      for (const x of [sx(128), sx(396), sx(1046), sx(1284)]) {
        const palm = this.add.container(x, sy(302));
        palm.add(this.add.rectangle(0, sy(18), sx(7), sy(58), 0x6f4720));
        palm.add(this.add.triangle(0, -sy(10), -sx(32), sy(12), 0, -sy(38), sx(32), sy(12), 0x30c977));
        palm.add(this.add.triangle(-sx(18), sy(2), -sx(34), sy(14), -sx(12), -sy(22), sx(4), sy(14), 0x4ddd8c));
        postcard.add(palm);
      }
      for (let i = 0; i < 7; i += 1) {
        postcard.add(this.add.rectangle(sx(162) + i * sx(168), sy(74) + (i % 2) * sy(6), sx(92), sy(3), 0xf6fffb, i % 2 ? 0.08 : 0.16));
      }
      this.vistaLayer.add(postcard);
      return;
    }

    if (this.city.key === "roma") {
      addHorizonBand(sy(274), sy(22), 0xf6ddb4, 0.1);
      addGlow(sx(1090), sy(164), sx(480), sy(180), 0xf1b071, 0.14);

      const hills = [
        [sx(54), sy(296), sx(280), sy(96), 0x7c5d4d],
        [sx(300), sy(284), sx(340), sy(110), 0x946f59],
        [sx(632), sy(292), sx(300), sy(90), 0x6c4d3e],
        [sx(916), sy(286), sx(360), sy(108), 0x855f4b],
        [sx(1220), sy(298), sx(260), sy(84), 0x684638],
      ];
      hills.forEach(([x, y, w, h, c]) => {
        this.vistaLayer.add(this.add.arc(x, y, w, h, 180, 360, false, c, 0.88));
      });

      const rome = this.add.container(sx(720), sy(282));
      rome.add(this.add.rectangle(0, sy(46), sx(720), sy(8), 0x2e231e));
      rome.add(this.add.arc(-sx(128), sy(18), sx(92), 180, 360, false, 0x73584a, 0.96));
      for (let i = 0; i < 4; i += 1) {
        rome.add(this.add.rectangle(-sx(164) + i * sx(28), sy(26), sx(16), sy(58), 0x2f2520, 0.86));
      }
      rome.add(this.add.rectangle(sx(30), sy(22), sx(128), sy(64), 0x6f5445, 0.92));
      rome.add(this.add.arc(sx(30), sy(2), sx(42), 180, 360, false, 0xb38d6f, 0.28));
      rome.add(this.add.rectangle(sx(172), sy(10), sx(188), sy(22), 0x8f705a, 0.86));
      for (let i = 0; i < 5; i += 1) {
        rome.add(this.add.arc(sx(108) + i * sx(20), sy(10), sx(14), 180, 360, false, 0x2b211c, 0.7));
      }
      rome.add(this.add.circle(-sx(258), -sy(20), sx(22), 0x8f6b59, 0.94));
      rome.add(this.add.rectangle(-sx(258), sy(22), sx(54), sy(48), 0x7d5d4b, 0.92));
      this.vistaLayer.add(rome);

      for (const x of [sx(164), sx(410), sx(1178)]) {
        const cypress = this.add.container(x, sy(314));
        cypress.add(this.add.triangle(0, 0, -sx(16), sy(8), 0, -sy(70), sx(16), sy(8), 0x223427, 0.92));
        cypress.add(this.add.rectangle(0, sy(18), sx(4), sy(22), 0x6c4d35, 0.5));
        this.vistaLayer.add(cypress);
      }
      return;
    }

    if (this.city.key === "paris") {
      addHorizonBand(sy(278), sy(22), 0xf7ddf1, 0.08);
      addGlow(sx(1122), sy(126), sx(340), sy(180), 0xf7f3ff, 0.14);
      this.vistaLayer.add(this.add.circle(sx(1122), sy(122), sx(72), 0xf8f6ff, 0.94));

      for (let i = 0; i < 14; i += 1) {
        this.vistaLayer.add(this.add.rectangle(sx(80) + i * sx(98), sy(110) + (i % 4) * sy(16), sx(72 + (i % 3) * 22), sy(3), 0xf8f3ff, i % 2 ? 0.14 : 0.24));
      }

      const roofs = this.add.container(sx(112), sy(286));
      for (let i = 0; i < 7; i += 1) {
        const baseX = i * sx(176);
        roofs.add(this.add.rectangle(baseX, sy(42), sx(124), sy(54), 0x394459, 0.88).setOrigin(0.5, 1));
        roofs.add(this.add.triangle(baseX, -sy(8), -sx(62), sy(42), 0, -sy(30), sx(62), sy(42), 0x232942, 0.94));
        roofs.add(this.add.rectangle(baseX, sy(14), sx(98), sy(3), 0x93ddff, 0.08));
      }
      const tower = this.add.container(sx(744), sy(270));
      tower.add(this.add.triangle(0, -sy(12), 0, -sy(138), -sx(42), sy(88), sx(42), sy(88), 0x58d5ff, 0.92));
      tower.add(this.add.triangle(-sx(8), -sy(16), -sx(2), -sy(108), -sx(28), sy(62), sx(4), sy(62), 0xf1eadf, 0.32));
      roofs.add(tower);
      this.vistaLayer.add(roofs);
      return;
    }

    if (this.city.key === "venecia") {
      addHorizonBand(sy(284), sy(26), 0xf3e8d9, 0.08);
      addHorizonBand(sy(316), sy(78), 0x7de3da, 0.18);
      addGlow(sx(1110), sy(152), sx(420), sy(180), 0xffd6a9, 0.12);

      const lagoon = this.add.container(sx(116), sy(286));
      lagoon.add(this.add.rectangle(sx(620), sy(40), sx(1300), sy(8), 0x2a575f, 0.92));
      lagoon.add(this.add.rectangle(sx(620), sy(56), sx(1300), sy(6), 0xbaf6ef, 0.12));
      for (let i = 0; i < 8; i += 1) {
        lagoon.add(this.add.rectangle(i * sx(158), sy(56) + (i % 2) * sy(6), sx(58), sy(3), 0xe8fff8, i % 2 ? 0.1 : 0.16));
      }
      const palazzoX = [sx(80), sx(280), sx(470), sx(668), sx(868), sx(1052)];
      palazzoX.forEach((x, i) => {
        lagoon.add(this.add.rectangle(x, sy(34), sx(124), sy(58 + (i % 3) * 10), i % 2 ? 0x566f75 : 0x6b837f, 0.88).setOrigin(0.5, 1));
        lagoon.add(this.add.arc(x, sy(10), sx(26), 180, 360, false, i % 2 ? 0x9e8a71 : 0xc0a889, 0.24));
      });
      const campanile = this.add.container(sx(822), -sy(10));
      campanile.add(this.add.rectangle(0, sy(20), sx(24), sy(142), 0xb99566, 0.94).setOrigin(0.5, 1));
      campanile.add(this.add.rectangle(0, -sy(92), sx(42), sy(16), 0xcbb596));
      campanile.add(this.add.triangle(0, -sy(112), -sx(14), -sy(88), 0, -sy(138), sx(14), -sy(88), 0xc66f5a));
      lagoon.add(campanile);
      const dome = this.add.container(sx(558), sy(14));
      dome.add(this.add.circle(0, 0, sx(36), 0xb9d2ca, 0.96));
      dome.add(this.add.rectangle(0, sy(38), sx(96), sy(34), 0x68837c, 0.88));
      dome.add(this.add.rectangle(0, -sy(34), sx(10), sy(20), 0xd4c5ab));
      lagoon.add(dome);
      this.vistaLayer.add(lagoon);
      return;
    }

    if (this.city.key === "londres") {
      addHorizonBand(sy(276), sy(28), 0xb6c3cf, 0.08);
      addGlow(sx(1098), sy(122), sx(360), sy(180), 0xc7b070, 0.12);

      const parliament = this.add.container(sx(120), sy(288));
      parliament.add(this.add.rectangle(sx(560), sy(44), sx(1160), sy(8), 0x1a1f28, 0.94));
      for (let i = 0; i < 7; i += 1) {
        parliament.add(this.add.rectangle(sx(96) + i * sx(146), sy(14), sx(108), sy(68 + (i % 2) * 8), 0x313a46, 0.9).setOrigin(0.5, 1));
      }
      const bigBen = this.add.container(sx(820), -sy(12));
      bigBen.add(this.add.rectangle(0, sy(28), sx(26), sy(146), 0x324051, 0.96).setOrigin(0.5, 1));
      bigBen.add(this.add.rectangle(0, -sy(90), sx(46), sy(20), 0xc5b06c));
      bigBen.add(this.add.rectangle(0, -sy(116), sx(10), sy(20), 0x324051));
      bigBen.add(this.add.triangle(0, -sy(136), -sx(14), -sy(108), 0, -sy(162), sx(14), -sy(108), 0xc5b06c));
      bigBen.add(this.add.circle(0, -sy(90), sx(7), 0xf2ead8));
      parliament.add(bigBen);
      const bridge = this.add.container(sx(1086), sy(12));
      bridge.add(this.add.rectangle(0, 0, sx(210), sy(8), 0x171b22));
      bridge.add(this.add.rectangle(-sx(72), -sy(28), sx(12), sy(58), 0x334051));
      bridge.add(this.add.rectangle(sx(72), -sy(28), sx(12), sy(58), 0x334051));
      bridge.add(this.add.rectangle(-sx(72), -sy(46), sx(34), sy(8), 0xc5b06c, 0.72));
      bridge.add(this.add.rectangle(sx(72), -sy(46), sx(34), sy(8), 0xc5b06c, 0.72));
      parliament.add(bridge);
      this.vistaLayer.add(parliament);
    }
  }

  createSkyBackdrop() {
    const art = CITY_ART[this.city.key] || CITY_ART.valencia;
    const addBand = (y, h, color, alpha = 1) => this.skyArt.add(this.add.rectangle(WIDTH / 2, y, WIDTH, h, color, alpha));
    const addCross = (x, y, s, color, alpha = 1) => {
      this.skyArt.add(this.add.rectangle(x, y, s, sy(3), color, alpha));
      this.skyArt.add(this.add.rectangle(x, y, sx(3), s, color, alpha));
    };
    const addRange = (items, colorA, colorB, yA, yB) => {
      items.forEach((item, index) => {
        this.skyArt.add(this.add.triangle(item.x, yA, -item.w, item.h, 0, -item.peak, item.w * 1.12, item.h, colorA, 0.94));
        this.skyArt.add(this.add.triangle(item.x + item.offset, yB, -item.w * 0.82, item.h * 0.92, 0, -item.peak * 0.82, item.w, item.h * 0.92, colorB, index % 2 ? 0.92 : 0.86));
      });
    };

    addBand(sy(78), sy(164), art.top);
    addBand(sy(230), sy(154), art.mid);
    addBand(sy(364), sy(168), art.bottom);
    addBand(sy(252), sy(76), art.glow, 0.18);

    if (this.city.key === "valencia") {
      this.skyArt.add(this.add.circle(sx(1128), sy(126), sx(150), 0xffe0a8, 0.98));
      this.skyArt.add(this.add.circle(sx(1128), sy(126), sx(112), 0xfff4db, 0.92));
      for (let i = 0; i < 7; i += 1) {
        this.skyArt.add(this.add.rectangle(sx(1128), sy(176) + i * sy(15), sx(264 - i * 28), sy(4), 0xfff4df, 0.36));
      }
      addBand(sy(198), sy(28), 0xfff0cf, 0.12);
      addBand(sy(228), sy(24), 0xffd8a9, 0.08);
      addBand(sy(254), sy(30), art.haze, 0.2);
      addBand(sy(292), sy(24), 0xd6f3ee, 0.14);
      addBand(sy(332), sy(70), art.water, 0.5);
      addBand(sy(350), sy(8), 0xf7fffb, 0.2);
      addBand(sy(368), sy(10), 0x6fd3d0, 0.14);
      for (const cloud of [
        [sx(132), sy(92), sx(210), sy(18), 0xfff9ef, 0.3],
        [sx(376), sy(128), sx(158), sy(16), 0xfff7e8, 0.22],
        [sx(700), sy(88), sx(224), sy(16), 0xfffbf2, 0.24],
        [sx(948), sy(138), sx(172), sy(14), 0xfff5e1, 0.18],
      ]) {
        this.skyArt.add(this.add.rectangle(cloud[0], cloud[1], cloud[2], cloud[3], cloud[4], cloud[5]));
        this.skyArt.add(this.add.rectangle(cloud[0] + sx(28), cloud[1] - sy(7), cloud[2] * 0.48, sy(6), cloud[4], cloud[5] * 0.9));
      }
      for (let i = 0; i < 11; i += 1) {
        this.skyArt.add(this.add.rectangle(sx(86) + i * sx(138), sy(182) + (i % 3) * sy(12), sx(112 + (i % 2) * 20), sy(5), 0xfff4df, i % 3 === 0 ? 0.24 : 0.14));
      }
      for (let i = 0; i < 14; i += 1) {
        this.skyArt.add(this.add.rectangle(sx(62) + i * sx(110), sy(338) + (i % 3) * sy(5), sx(82 + (i % 2) * 16), sy(3), 0xf6fffb, i % 2 ? 0.14 : 0.22));
      }
      for (const bird of [
        [sx(170), sy(108), 0xff8e3b],
        [sx(342), sy(132), 0xffd95c],
        [sx(560), sy(116), 0x4ddfe3],
        [sx(1180), sy(108), 0xffd95c],
      ]) {
        this.skyArt.add(this.add.rectangle(bird[0], bird[1], sx(12), sy(2), bird[2], 0.72).setAngle(-28));
        this.skyArt.add(this.add.rectangle(bird[0] + sx(8), bird[1] + sy(1), sx(9), sy(2), bird[2], 0.72).setAngle(28));
      }
    } else if (this.city.key === "roma") {
      this.skyArt.add(this.add.circle(sx(1082), sy(150), sx(104), art.sun, 0.9));
      for (let i = 0; i < 5; i += 1) {
        this.skyArt.add(this.add.rectangle(sx(1082), sy(192) + i * sy(16), sx(168 - i * 14), sy(4), 0xffe8c8, 0.28));
      }
      addBand(sy(274), sy(14), art.haze, 0.18);
      for (let i = 0; i < 9; i += 1) {
        this.skyArt.add(this.add.rectangle(sx(98) + i * sx(142), sy(214) + (i % 2) * sy(10), sx(86 + (i % 3) * 16), sy(5), 0xf7efd8, 0.1));
      }
      addRange([
        { x: sx(92), w: sx(132), h: sy(92), peak: sy(86), offset: sx(60) },
        { x: sx(364), w: sx(154), h: sy(86), peak: sy(78), offset: sx(66) },
        { x: sx(678), w: sx(138), h: sy(88), peak: sy(82), offset: sx(54) },
        { x: sx(976), w: sx(160), h: sy(92), peak: sy(84), offset: sx(70) },
        { x: sx(1278), w: sx(124), h: sy(80), peak: sy(74), offset: sx(54) },
      ], 0xa67e67, 0x725344, sy(296), sy(320));
    } else if (this.city.key === "paris") {
      this.skyArt.add(this.add.circle(sx(1106), sy(116), sx(78), art.sun, 0.98));
      for (let i = 0; i < 20; i += 1) {
        const width = sx(78 + (i % 4) * 30);
        this.skyArt.add(this.add.rectangle(sx(74) + i * sx(80), sy(108) + (i % 6) * sy(20), width, sy(4), 0xf1edff, i % 3 === 0 ? 0.32 : 0.16));
      }
      addRange([
        { x: sx(70), w: sx(114), h: sy(70), peak: sy(64), offset: sx(50) },
        { x: sx(330), w: sx(136), h: sy(74), peak: sy(72), offset: sx(56) },
        { x: sx(598), w: sx(124), h: sy(72), peak: sy(70), offset: sx(52) },
        { x: sx(890), w: sx(148), h: sy(76), peak: sy(72), offset: sx(60) },
        { x: sx(1184), w: sx(118), h: sy(64), peak: sy(60), offset: sx(48) },
      ], 0x483fb8, 0x28257b, sy(306), sy(332));
      [
        [sx(110), sy(84), sx(9)], [sx(430), sy(72), sx(7)], [sx(808), sy(126), sx(8)], [sx(1160), sy(94), sx(10)],
        [sx(1322), sy(78), sx(7)], [sx(980), sy(58), sx(6)]
      ].forEach((star) => addCross(star[0], star[1], star[2], 0xf7f5ff, 0.94));
    } else if (this.city.key === "venecia") {
      this.skyArt.add(this.add.circle(sx(1088), sy(136), sx(94), art.sun, 0.92));
      for (let i = 0; i < 4; i += 1) {
        this.skyArt.add(this.add.rectangle(sx(1088), sy(184) + i * sy(18), sx(178 - i * 18), sy(4), 0xfff6dc, 0.24));
      }
      addBand(sy(286), sy(16), art.haze, 0.18);
      addRange([
        { x: sx(80), w: sx(118), h: sy(82), peak: sy(74), offset: sx(48) },
        { x: sx(364), w: sx(144), h: sy(76), peak: sy(72), offset: sx(54) },
        { x: sx(666), w: sx(136), h: sy(78), peak: sy(76), offset: sx(56) },
        { x: sx(962), w: sx(152), h: sy(82), peak: sy(78), offset: sx(60) },
        { x: sx(1252), w: sx(126), h: sy(74), peak: sy(66), offset: sx(50) },
      ], 0x7e9aa6, 0x4f6976, sy(310), sy(334));
      this.skyArt.add(this.add.rectangle(WIDTH / 2, sy(340), WIDTH, sy(64), art.water, 0.36));
      for (let i = 0; i < 12; i += 1) {
        this.skyArt.add(this.add.rectangle(sx(70) + i * sx(116), sy(344) + (i % 3) * sy(6), sx(58 + (i % 2) * 10), sy(3), 0xeafffa, 0.16));
      }
    } else if (this.city.key === "londres") {
      this.skyArt.add(this.add.circle(sx(1124), sy(118), sx(82), art.sun, 0.66));
      addBand(sy(252), sy(30), art.haze, 0.16);
      for (let i = 0; i < 18; i += 1) {
        this.skyArt.add(this.add.rectangle(sx(68) + i * sx(82), sy(108) + (i % 5) * sy(18), sx(76 + (i % 3) * 26), sy(4), 0xe5edf5, i % 2 ? 0.06 : 0.12));
      }
      addRange([
        { x: sx(52), w: sx(104), h: sy(80), peak: sy(74), offset: sx(34) },
        { x: sx(258), w: sx(116), h: sy(88), peak: sy(82), offset: sx(42) },
        { x: sx(478), w: sx(124), h: sy(84), peak: sy(78), offset: sx(40) },
        { x: sx(712), w: sx(138), h: sy(88), peak: sy(82), offset: sx(46) },
        { x: sx(962), w: sx(128), h: sy(86), peak: sy(80), offset: sx(44) },
        { x: sx(1198), w: sx(132), h: sy(90), peak: sy(84), offset: sx(48) },
        { x: sx(1410), w: sx(112), h: sy(82), peak: sy(74), offset: sx(40) },
      ], 0x334053, 0x1d2735, sy(314), sy(338));
    }
  }

  createMidDepth() {
    const haze = this.add.rectangle(WIDTH / 2, sy(238), WIDTH + sx(120), sy(174), this.city.shadow, 0.1);
    this.midground.add(haze);

    if (this.city.key === "londres") {
      const glowBand = this.add.rectangle(WIDTH / 2, sy(184), WIDTH + sx(140), sy(32), 0xc5b06c, 0.06);
      const coolBand = this.add.rectangle(WIDTH / 2, sy(226), WIDTH + sx(140), sy(44), 0x7aa3c7, 0.06);
      this.midground.add(glowBand);
      this.midground.add(coolBand);
      for (let i = 0; i < 6; i += 1) {
        const x = sx(92) + i * sx(224);
        const block = this.add.container(x, sy(248));
        block.add(this.add.rectangle(0, sy(6), sx(166), sy(122), 0x3d4552, 0.44));
        block.add(this.add.rectangle(0, -sy(48), sx(146), sy(8), 0x77889d, 0.08));
        block.add(this.add.rectangle(-sx(46), sy(12), sx(26), sy(64), 0x242a35, 0.54));
        block.add(this.add.rectangle(-sx(6), sy(8), sx(24), sy(72), 0x2a313c, 0.5));
        block.add(this.add.rectangle(sx(34), sy(18), sx(30), sy(74), 0x252b36, 0.48));
        block.add(this.add.rectangle(0, sy(54), sx(170), sy(10), 0x1b2028, 0.68));
        block.add(this.add.rectangle(-sx(58), -sy(58), sx(18), sy(10), 0xc5b06c, 0.18));
        block.add(this.add.rectangle(sx(52), -sy(56), sx(20), sy(8), 0x93abc3, 0.14));
        for (let row = 0; row < 2; row += 1) {
          for (let col = 0; col < 4; col += 1) {
            block.add(this.add.rectangle(-sx(48) + col * sx(30), -sy(10) + row * sy(26), sx(8), sy(12), 0xdce6f3, row === 0 ? 0.16 : 0.08));
          }
        }
        this.midground.add(block);
      }
      for (const bridgeX of [sx(254), sx(772), sx(1220)]) {
        const bridge = this.add.container(bridgeX, sy(268));
        bridge.add(this.add.rectangle(0, 0, sx(218), sy(8), 0x20242d, 0.74));
        bridge.add(this.add.rectangle(-sx(74), -sy(32), sx(10), sy(64), 0x3b414c, 0.7));
        bridge.add(this.add.rectangle(sx(74), -sy(32), sx(10), sy(64), 0x3b414c, 0.7));
        bridge.add(this.add.rectangle(-sx(74), -sy(52), sx(34), sy(8), 0xc5b06c, 0.48));
        bridge.add(this.add.rectangle(sx(74), -sy(52), sx(34), sy(8), 0xc5b06c, 0.48));
        bridge.add(this.add.rectangle(0, -sy(8), sx(198), sy(3), 0xa4bdd6, 0.08));
        this.midground.add(bridge);
      }
    } else if (this.city.key === "roma") {
      this.midground.add(this.add.rectangle(WIDTH / 2, sy(186), WIDTH + sx(120), sy(30), 0xe4bf89, 0.06));
      for (let i = 0; i < 5; i += 1) {
        const x = sx(140) + i * sx(258);
        const colonnade = this.add.container(x, sy(252));
        colonnade.add(this.add.rectangle(0, sy(8), sx(184), sy(108), 0x7c5f49, 0.34));
        colonnade.add(this.add.arc(0, -sy(26), sx(58), 180, 360, false, 0xd1ac82, 0.18));
        colonnade.add(this.add.rectangle(0, sy(54), sx(194), sy(10), 0x44352b, 0.5));
        for (let c = 0; c < 3; c += 1) {
          colonnade.add(this.add.rectangle(-sx(42) + c * sx(42), sy(10), sx(16), sy(62), 0x4f3d31, 0.46));
          colonnade.add(this.add.rectangle(-sx(46) + c * sx(42), -sy(8), sx(4), sy(48), 0xe4bf89, 0.12));
        }
        colonnade.add(this.add.rectangle(-sx(56), -sy(40), sx(22), sy(8), 0xb68b66, 0.14));
        colonnade.add(this.add.rectangle(sx(56), -sy(36), sx(26), sy(8), 0xb68b66, 0.1));
        this.midground.add(colonnade);
      }
    } else if (this.city.key === "valencia") {
      this.midground.add(this.add.rectangle(WIDTH / 2, sy(190), WIDTH + sx(120), sy(34), 0xfff0cf, 0.08));
      this.midground.add(this.add.rectangle(WIDTH / 2, sy(302), WIDTH + sx(120), sy(70), 0x88dfda, 0.14));
      this.midground.add(this.add.rectangle(WIDTH / 2, sy(330), WIDTH + sx(120), sy(16), 0xf8fffb, 0.12));

      const lagoon = this.add.container(WIDTH / 2, sy(280));
      lagoon.add(this.add.rectangle(0, sy(54), WIDTH + sx(120), sy(16), 0x2c5f74, 0.52));
      lagoon.add(this.add.rectangle(0, sy(60), WIDTH + sx(120), sy(5), 0xeafff7, 0.16));
      for (let i = 0; i < 14; i += 1) {
        lagoon.add(this.add.rectangle(sx(-720) + i * sx(112), sy(44) + (i % 2) * sy(5), sx(78 + (i % 3) * 10), sy(3), 0xf6fff9, i % 2 ? 0.08 : 0.16));
      }
      this.midground.add(lagoon);

      const silhouette = this.add.container(WIDTH / 2, sy(256));
      silhouette.add(this.add.rectangle(-sx(420), sy(10), sx(220), sy(62), 0x7092a8, 0.16).setOrigin(0.5, 1));
      silhouette.add(this.add.rectangle(-sx(430), -sy(46), sx(18), sy(104), 0x916f31, 0.28));
      silhouette.add(this.add.rectangle(-sx(430), -sy(76), sx(32), sy(10), 0x33586a, 0.24));
      silhouette.add(this.add.rectangle(-sx(430), -sy(96), sx(6), sy(18), 0x33586a, 0.24));
      silhouette.add(this.add.rectangle(sx(462), sy(18), sx(178), sy(72), 0x6eb0dc, 0.18).setOrigin(0.5, 1));
      silhouette.add(this.add.rectangle(sx(414), -sy(14), sx(26), sy(92), 0x5f9fcb, 0.22));
      silhouette.add(this.add.rectangle(sx(510), -sy(14), sx(26), sy(92), 0x5f9fcb, 0.22));
      silhouette.add(this.add.rectangle(sx(462), sy(10), sx(34), sy(42), 0x386782, 0.22));
      this.midground.add(silhouette);

      for (const x of [sx(188), sx(520), sx(1114), sx(1368)]) {
        const palm = this.add.container(x, sy(314));
        palm.add(this.add.rectangle(0, sy(18), sx(8), sy(54), 0x714821, 0.2));
        palm.add(this.add.triangle(0, -sy(8), -sx(28), sy(10), 0, -sy(34), sx(28), sy(10), 0x31c474, 0.18));
        palm.add(this.add.triangle(-sx(14), sy(4), -sx(34), sy(18), -sx(12), -sy(20), sx(2), sy(16), 0x4ddd8c, 0.16));
        this.midground.add(palm);
      }
    } else if (this.city.key === "paris") {
      this.midground.add(this.add.rectangle(WIDTH / 2, sy(176), WIDTH + sx(120), sy(28), 0xf0eadc, 0.05));
      for (let i = 0; i < 6; i += 1) {
        const x = sx(90) + i * sx(214);
        const boulevard = this.add.container(x, sy(248));
        boulevard.add(this.add.rectangle(0, sy(2), sx(148), sy(112), 0x465064, 0.38));
        boulevard.add(this.add.rectangle(0, -sy(38), sx(122), sy(12), 0xf0eadc, 0.14));
        boulevard.add(this.add.rectangle(0, sy(48), sx(154), sy(8), this.city.glow, 0.16));
        boulevard.add(this.add.rectangle(-sx(34), sy(6), sx(44), sy(24), 0x252b37, 0.46));
        boulevard.add(this.add.rectangle(sx(34), sy(6), sx(44), sy(24), 0x252b37, 0.42));
        boulevard.add(this.add.rectangle(-sx(20), -sy(14), sx(20), sy(40), 0xbfeefe, 0.08));
        boulevard.add(this.add.rectangle(sx(24), -sy(10), sx(18), sy(34), 0xf7f1e7, 0.06));
        this.midground.add(boulevard);
      }
    } else if (this.city.key === "venecia") {
      this.midground.add(this.add.rectangle(WIDTH / 2, sy(200), WIDTH + sx(120), sy(34), 0xc4f4ef, 0.05));
      for (let i = 0; i < 5; i += 1) {
        const x = sx(120) + i * sx(250);
        const canal = this.add.container(x, sy(256));
        canal.add(this.add.rectangle(0, sy(30), sx(182), sy(42), 0x2e5f69, 0.28));
        canal.add(this.add.rectangle(0, sy(36), sx(162), sy(6), 0xa4efe6, 0.12));
        canal.add(this.add.arc(0, sy(8), sx(54), 180, 360, false, 0x8f8576, 0.26));
        canal.add(this.add.rectangle(-sx(34), -sy(18), sx(26), sy(50), 0x72695e, 0.38));
        canal.add(this.add.rectangle(sx(34), -sy(12), sx(24), sy(46), 0x9e8a71, 0.32));
        canal.add(this.add.rectangle(0, sy(34), sx(142), sy(4), this.city.highlight, 0.18));
        canal.add(this.add.rectangle(-sx(52), sy(18), sx(18), sy(3), 0xc4f4ef, 0.08));
        canal.add(this.add.rectangle(sx(52), sy(24), sx(16), sy(3), 0xc4f4ef, 0.06));
        this.midground.add(canal);
      }
    } else {
      this.midground.add(this.add.rectangle(WIDTH / 2, sy(164), WIDTH + sx(120), sy(26), 0xffd59f, 0.06));
      for (let i = 0; i < 6; i += 1) {
        const x = sx(90) + i * sx(220);
        const promenade = this.add.container(x, sy(248));
        promenade.add(this.add.rectangle(0, sy(2), sx(158), sy(108), 0x70808e, 0.34));
        promenade.add(this.add.rectangle(0, sy(46), sx(164), sy(8), 0xf2ead8, 0.24));
        promenade.add(this.add.rectangle(0, sy(52), sx(164), sy(4), this.city.accent, 0.28));
        promenade.add(this.add.rectangle(-sx(26), sy(2), sx(18), sy(58), 0x5f4a36, 0.3));
        promenade.add(this.add.rectangle(sx(44), sy(10), sx(34), sy(50), 0xffd9a8, 0.24));
        promenade.add(this.add.rectangle(sx(48), -sy(12), sx(16), sy(24), 0x40d8ff, 0.08));
        this.midground.add(promenade);
      }
    }
  }

  createSkyline() {
    if (this.city.key === "londres") {
      const farColor = 0x1d232d;
      const midColor = 0x27303b;
      const frontColor = 0x313945;
      for (let i = 0; i < 10; i += 1) {
        const x = i * sx(126) + sx(14);
        const far = this.add.rectangle(x, sy(214), sx(90 + (i % 3) * 12), sy(96 + (i % 4) * 18), farColor, 0.46);
        far.setOrigin(0.5, 1);
        this.skyline.add(far);
      }
      for (let i = 0; i < 8; i += 1) {
        const x = i * sx(156) + sx(54);
        const group = this.add.container(x, sy(230));
        const width = sx(102 + (i % 2) * 18);
        const height = sy(126 + (i % 4) * 12);
        group.add(this.add.rectangle(0, 0, width, height, midColor, 0.72).setOrigin(0.5, 1));
        group.add(this.add.rectangle(-width / 2 + sx(7), -height / 2, sx(8), height - sy(6), 0x7f93a9, 0.16));
        group.add(this.add.rectangle(width / 2 - sx(7), -height / 2, sx(10), height - sy(4), 0x12161d, 0.32));
        group.add(this.add.rectangle(0, -height + sy(8), width - sx(8), sy(8), 0xb9c9d9, 0.08));
        for (let row = 0; row < 3; row += 1) {
          for (let col = 0; col < 3; col += 1) {
            group.add(this.add.rectangle(-sx(24) + col * sx(22), -height + sy(30) + row * sy(22), sx(7), sy(11), row === 1 ? 0xc5b06c : 0xdce6f3, row === 1 ? 0.42 : 0.2));
          }
        }
        this.skyline.add(group);
      }
      for (const towerX of [sx(404), sx(1032)]) {
        const tower = this.add.container(towerX, sy(186));
        tower.add(this.add.rectangle(0, 0, sx(24), sy(132), frontColor, 0.82).setOrigin(0.5, 1));
        tower.add(this.add.rectangle(0, -sy(74), sx(42), sy(20), 0xc5b06c, 0.88));
        tower.add(this.add.rectangle(0, -sy(96), sx(10), sy(18), frontColor, 0.82));
        tower.add(this.add.triangle(0, -sy(114), -sx(12), -sy(92), 0, -sy(136), sx(12), -sy(92), 0xc5b06c, 0.88));
        tower.add(this.add.circle(0, -sy(74), sx(6), 0xf2ead8, 0.78));
        tower.add(this.add.rectangle(-sx(7), -sy(6), sx(4), sy(90), 0x8ea5b8, 0.18));
        this.skyline.add(tower);
      }
      const skylineBridge = this.add.container(sx(1188), sy(214));
      skylineBridge.add(this.add.rectangle(0, 0, sx(214), sy(8), 0x191d24, 0.8));
      skylineBridge.add(this.add.rectangle(-sx(74), -sy(34), sx(12), sy(70), frontColor, 0.82));
      skylineBridge.add(this.add.rectangle(sx(74), -sy(34), sx(12), sy(70), frontColor, 0.82));
      skylineBridge.add(this.add.rectangle(-sx(74), -sy(58), sx(36), sy(8), 0xc5b06c, 0.7));
      skylineBridge.add(this.add.rectangle(sx(74), -sy(58), sx(36), sy(8), 0xc5b06c, 0.7));
      skylineBridge.add(this.add.rectangle(0, -sy(12), sx(188), sy(3), 0xbcd7ef, 0.1));
      this.skyline.add(skylineBridge);
      return;
    }

    if (this.city.key === "valencia") {
      this.skyline.add(this.add.rectangle(WIDTH / 2, sy(170), WIDTH + sx(120), sy(40), 0xfff5d9, 0.12));
      this.skyline.add(this.add.rectangle(WIDTH / 2, sy(308), WIDTH + sx(120), sy(18), 0xcaf7ef, 0.16));

      const skyline = this.add.container(sx(80), sy(286));
      skyline.add(this.add.rectangle(sx(664), sy(52), sx(1360), sy(8), 0x244d62, 0.92));
      skyline.add(this.add.rectangle(sx(664), sy(60), sx(1360), sy(4), 0xf9fff9, 0.12));

      const waterfrontGlow = this.add.rectangle(sx(664), sy(26), sx(1320), sy(12), 0x9be9e0, 0.12);
      skyline.add(waterfrontGlow);

      const oldTown = this.add.container(sx(156), -sy(18));
      const serranos = this.add.container(0, sy(20));
      serranos.add(this.add.rectangle(0, sy(46), sx(196), sy(72), 0x5ea7df, 0.96).setOrigin(0.5, 1));
      serranos.add(this.add.rectangle(-sx(58), -sy(6), sx(42), sy(96), 0x43b4ef, 0.98));
      serranos.add(this.add.rectangle(sx(58), -sy(6), sx(42), sy(96), 0x43b4ef, 0.98));
      serranos.add(this.add.rectangle(0, sy(50), sx(34), sy(30), 0x2a607d));
      serranos.add(this.add.rectangle(-sx(58), -sy(42), sx(56), sy(8), 0xeef9ff, 0.24));
      serranos.add(this.add.rectangle(sx(58), -sy(42), sx(56), sy(8), 0xeef9ff, 0.24));
      oldTown.add(serranos);

      const miguelete = this.add.container(sx(172), 0);
      miguelete.add(this.add.rectangle(0, sy(10), sx(34), sy(158), 0xd7a23a, 0.98).setOrigin(0.5, 1));
      miguelete.add(this.add.rectangle(0, -sy(118), sx(52), sy(14), 0x365567));
      miguelete.add(this.add.circle(0, -sy(98), sx(9), 0x365567));
      miguelete.add(this.add.rectangle(0, -sy(146), sx(6), sy(18), 0x365567));
      oldTown.add(miguelete);

      const cathedral = this.add.container(sx(316), sy(18));
      cathedral.add(this.add.rectangle(0, sy(40), sx(172), sy(82), 0x743967, 0.96).setOrigin(0.5, 1));
      cathedral.add(this.add.rectangle(0, -sy(8), sx(88), sy(14), 0x743967));
      cathedral.add(this.add.circle(0, sy(0), sx(24), 0xffd75d, 0.96).setStrokeStyle(4, 0x743967));
      cathedral.add(this.add.triangle(0, sy(18), -sx(28), sy(44), 0, -sy(16), sx(28), sy(44), 0xffd75d, 0.94));
      cathedral.add(this.add.rectangle(0, sy(46), sx(28), sy(30), 0x5c2622));
      cathedral.add(this.add.rectangle(-sx(54), sy(22), sx(20), sy(54), 0xcb4738, 0.9));
      cathedral.add(this.add.rectangle(sx(54), sy(22), sx(20), sy(54), 0xcb4738, 0.9));
      oldTown.add(cathedral);
      skyline.add(oldTown);

      const arts = this.add.container(sx(760), -sy(6));
      arts.add(this.add.rectangle(0, sy(92), sx(680), sy(10), 0x1d4256));
      arts.add(this.add.arc(-sx(162), sy(26), sx(138), 180, 360, false, 0xf8fbfd, 0.99));
      arts.add(this.add.arc(-sx(162), sy(26), sx(110), 180, 360, false, 0xffc978, 0.2));
      arts.add(this.add.arc(-sx(12), sy(34), sx(100), 180, 360, false, 0xf8fbfd, 0.94));
      arts.add(this.add.arc(-sx(12), sy(34), sx(72), 180, 360, false, 0x85e7e0, 0.22));
      arts.add(this.add.triangle(sx(206), -sy(2), sx(36), sy(92), sx(196), -sy(88), sx(286), sy(92), 0xf8fbfd, 0.99));
      arts.add(this.add.triangle(sx(212), sy(12), sx(62), sy(78), sx(198), -sy(44), sx(274), sy(78), 0x9ceee6, 0.34));
      arts.add(this.add.rectangle(sx(206), sy(84), sx(176), sy(8), 0x1d3744));
      arts.add(this.add.rectangle(-sx(18), sy(78), sx(132), sy(8), 0x1d3744));
      arts.add(this.add.rectangle(-sx(188), sy(62), sx(34), sy(10), 0xeef8fb, 0.72));
      arts.add(this.add.rectangle(sx(22), sy(70), sx(24), sy(8), 0xeef8fb, 0.56));
      skyline.add(arts);

      const assut = this.add.container(sx(1062), -sy(18));
      assut.add(this.add.rectangle(0, sy(92), sx(18), sy(222), 0xf8fbff));
      assut.add(this.add.triangle(sx(84), sy(18), sx(12), sy(154), sx(84), -sy(88), sx(140), sy(154), 0xf8fbff, 0.98));
      for (let i = 0; i < 8; i += 1) {
        assut.add(this.add.rectangle(sx(14) + i * sx(16), -sy(4) + i * sy(26), sx(64 - i * 4), sy(2), 0xe1fbf7, 0.44).setAngle(-30));
      }
      skyline.add(assut);

      for (const x of [sx(84), sx(478), sx(1198), sx(1412)]) {
        const palm = this.add.container(x, sy(302));
        palm.add(this.add.rectangle(0, sy(20), sx(8), sy(64), 0x6e4722));
        palm.add(this.add.triangle(0, -sy(14), -sx(32), sy(10), 0, -sy(44), sx(32), sy(10), 0x2ec777));
        palm.add(this.add.triangle(-sx(16), sy(0), -sx(36), sy(14), -sx(12), -sy(30), sx(4), sy(14), 0x4fdd92));
        palm.add(this.add.triangle(sx(18), sy(2), -sx(2), sy(14), sx(16), -sy(32), sx(38), sy(12), 0x43d189));
        skyline.add(palm);
      }

      for (let i = 0; i < 10; i += 1) {
        skyline.add(this.add.rectangle(sx(122) + i * sx(138), sy(74) + (i % 2) * sy(8), sx(92), sy(3), 0xf8fff8, i % 2 ? 0.1 : 0.16));
      }

      this.skyline.add(skyline);
      return;
    }

    if (this.city.key === "roma") {
      this.skyline.add(this.add.rectangle(WIDTH / 2, sy(170), WIDTH + sx(120), sy(40), 0xe4bf89, 0.08));
      for (let i = 0; i < 7; i += 1) {
        const x = i * sx(188) + sx(54);
        const terrace = this.add.container(x, sy(232));
        const width = sx(124 + (i % 2) * 16);
        const height = sy(92 + (i % 4) * 14);
        terrace.add(this.add.rectangle(0, 0, width, height, 0x5f4a3b, 0.66).setOrigin(0.5, 1));
        terrace.add(this.add.rectangle(0, -height + sy(10), width - sx(6), sy(10), 0xc7b08a, 0.18));
        terrace.add(this.add.rectangle(-width / 2 + sx(8), -height / 2, sx(8), height - sy(4), 0xe4bf89, 0.1));
        terrace.add(this.add.rectangle(width / 2 - sx(10), -height / 2, sx(12), height - sy(4), 0x33261f, 0.24));
        terrace.add(this.add.arc(0, -sy(20), sx(36), 180, 360, false, 0xc39a72, 0.3));
        for (let c = 0; c < 3; c += 1) {
          terrace.add(this.add.rectangle(-sx(28) + c * sx(28), sy(10), sx(10), sy(44), 0x2c211c, 0.52));
        }
        this.skyline.add(terrace);
      }
      return;
    }

    if (this.city.key === "paris") {
      this.skyline.add(this.add.rectangle(WIDTH / 2, sy(156), WIDTH + sx(120), sy(36), 0xf0eadc, 0.07));
      for (let i = 0; i < 8; i += 1) {
        const x = i * sx(164) + sx(40);
        const block = this.add.container(x, sy(228));
        const width = sx(104 + (i % 2) * 10);
        const height = sy(98 + (i % 3) * 18);
        block.add(this.add.rectangle(0, 0, width, height, 0x394458, 0.66).setOrigin(0.5, 1));
        block.add(this.add.rectangle(0, -height + sy(10), width - sx(8), sy(10), 0xe8dfcf, 0.18));
        block.add(this.add.rectangle(-width / 2 + sx(6), -height / 2, sx(8), height - sy(6), 0x7fe7ff, 0.1));
        block.add(this.add.rectangle(width / 2 - sx(8), -height / 2, sx(10), height - sy(6), 0x1f2532, 0.26));
        for (let row = 0; row < 2; row += 1) {
          for (let col = 0; col < 3; col += 1) {
            block.add(this.add.rectangle(-sx(24) + col * sx(22), -height + sy(26) + row * sy(22), sx(8), sy(12), row === 0 ? 0xf2ead8 : 0x40d8ff, row === 0 ? 0.16 : 0.12));
          }
        }
        if (i === 4) {
          block.add(this.add.rectangle(0, -sy(52), sx(54), sy(6), 0x40d8ff, 0.3));
        }
        this.skyline.add(block);
      }
      return;
    }

    if (this.city.key === "venecia") {
      this.skyline.add(this.add.rectangle(WIDTH / 2, sy(176), WIDTH + sx(120), sy(44), 0xc4f4ef, 0.06));
      for (let i = 0; i < 7; i += 1) {
        const x = i * sx(184) + sx(56);
        const palazzo = this.add.container(x, sy(232));
        const width = sx(114 + (i % 3) * 8);
        const height = sy(100 + (i % 2) * 16);
        palazzo.add(this.add.rectangle(0, 0, width, height, 0x4f676e, 0.62).setOrigin(0.5, 1));
        palazzo.add(this.add.rectangle(0, -height + sy(10), width - sx(8), sy(10), 0xa4efe6, 0.14));
        palazzo.add(this.add.arc(0, -sy(12), sx(26), 180, 360, false, 0x9e8a71, 0.22));
        palazzo.add(this.add.rectangle(-width / 2 + sx(8), -height / 2, sx(8), height - sy(6), 0xc4f4ef, 0.08));
        palazzo.add(this.add.rectangle(width / 2 - sx(8), -height / 2, sx(10), height - sy(6), 0x2b3940, 0.24));
        palazzo.add(this.add.rectangle(0, sy(8), width - sx(20), sy(4), 0x7ae4db, 0.12));
        for (let col = 0; col < 3; col += 1) {
          palazzo.add(this.add.rectangle(-sx(24) + col * sx(24), -height + sy(30), sx(8), sy(14), 0xcfeee7, 0.12));
        }
        this.skyline.add(palazzo);
      }
      return;
    }

    const skylineConfigs = {
      valencia: { tint: 0x2f3946, heights: [92, 118, 96, 132, 110, 88, 126, 98], width: 108 },
      roma: { tint: 0x352d2b, heights: [104, 86, 128, 92, 140, 84, 118, 100], width: 112 },
      paris: { tint: 0x2b3444, heights: [94, 126, 88, 138, 104, 120, 96, 116], width: 104 },
      venecia: { tint: 0x2d4348, heights: [110, 96, 120, 102, 128, 92, 122, 106], width: 98 },
      londres: { tint: 0x242a36, heights: [122, 146, 104, 154, 118, 138, 112, 150], width: 114 },
    };
    const config = skylineConfigs[this.city.key] || skylineConfigs.valencia;

    for (let i = 0; i < config.heights.length; i += 1) {
      const x = i * sx(156) + sx(30);
      const building = this.add.rectangle(x, sy(230), sx(config.width), sy(config.heights[i]), config.tint, 0.72);
      building.setOrigin(0.5, 1);
      building.setStrokeStyle(3, 0x15151c, 0.45);
      this.skyline.add(building);
      this.skyline.add(
        this.add.rectangle(
          x - sx(config.width / 2 - 5),
          sy(230) - sy(config.heights[i] / 2),
          sx(8),
          sy(config.heights[i] - 8),
          this.city.highlight,
          0.18
        )
      );
      this.skyline.add(
        this.add.rectangle(
          x + sx(config.width / 2 - 6),
          sy(230) - sy(config.heights[i] / 2),
          sx(10),
          sy(config.heights[i] - 6),
          this.city.shadow,
          0.28
        )
      );
      this.skyline.add(
        this.add.rectangle(x, sy(230) - sy(config.heights[i]) + sy(7), sx(config.width - 10), sy(8), this.city.highlight, 0.1)
      );

      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 3; col += 1) {
          const light = this.add.rectangle(
            x - sx(28) + col * sx(24),
            sy(130) + row * sy(24) + (i % 2 ? sy(6) : 0),
            sx(8),
            sy(14),
            row === 1 ? this.city.glow : row === 0 ? this.city.highlight : 0xd8d0c2,
            row === 1 ? 0.62 : 0.28
          );
          this.skyline.add(light);
        }
      }

      const roofUnit = this.add.container(x + sx(i % 2 ? 22 : -16), sy(230) - sy(config.heights[i]) + sy(4));
      roofUnit.add(this.add.rectangle(0, 0, sx(26), sy(10), tintColor(config.tint, -0.2), 0.9));
      roofUnit.add(this.add.rectangle(0, -sy(8), sx(10), sy(9), tintColor(this.city.highlight, -0.1), 0.55));
      roofUnit.add(this.add.rectangle(0, sy(4), sx(26), sy(2), this.city.shadow, 0.45));
      this.skyline.add(roofUnit);

      if (this.city.key === "valencia" && i % 2 === 0) {
        const palm = this.add.container(x + sx(40), sy(227));
        palm.add(this.add.rectangle(0, 0, sx(6), sy(54), 0x5b3d22));
        palm.add(this.add.triangle(0, -sy(42), -sx(30), -sy(12), 0, -sy(60), sx(30), -sy(12), 0x2fbf71));
        palm.add(this.add.triangle(-sx(16), -sy(26), -sx(42), -sy(8), -sx(16), -sy(48), sx(6), -sy(8), 0x39d47a));
        this.skyline.add(palm);
      }

      if (this.city.key === "londres") {
        if (i === 2 || i === 5) {
          const tower = this.add.container(x + sx(i === 2 ? -18 : 22), sy(i === 2 ? 194 : 184));
          tower.add(this.add.rectangle(0, 0, sx(i === 2 ? 18 : 22), sy(i === 2 ? 84 : 96), 0x3a3f49));
          tower.add(this.add.rectangle(0, -sy(44), sx(i === 2 ? 34 : 42), sy(18), 0xc5b06c));
          tower.add(this.add.rectangle(0, -sy(60), sx(10), sy(16), 0x3a3f49));
          tower.add(this.add.triangle(0, -sy(76), -sx(12), -sy(52), 0, -sy(92), sx(12), -sy(52), 0xc5b06c));
          tower.add(this.add.circle(0, -sy(44), sx(5), 0x15151c));
          this.skyline.add(tower);
        }

        if (i === 6) {
          const bridge = this.add.container(x + sx(40), sy(220));
          bridge.add(this.add.rectangle(0, 0, sx(142), sy(9), 0x1b1d24));
          bridge.add(this.add.rectangle(-sx(44), -sy(24), sx(10), sy(48), 0x2c313c));
          bridge.add(this.add.rectangle(sx(44), -sy(24), sx(10), sy(48), 0x2c313c));
          bridge.add(this.add.rectangle(-sx(44), -sy(40), sx(34), sy(8), 0xc5b06c));
          bridge.add(this.add.rectangle(sx(44), -sy(40), sx(34), sy(8), 0xc5b06c));
          this.skyline.add(bridge);
        }
      }
    }
  }

  createWall() {
    if (this.city.key === "londres") {
      const wall = this.add.rectangle(WIDTH / 2, sy(298), WIDTH + sx(100), sy(226), 0x5a6270);
      wall.setStrokeStyle(5, 0x2c2d33);
      this.backdrop.add(wall);
      this.backdrop.add(this.add.rectangle(WIDTH / 2, sy(198), WIDTH + sx(100), sy(38), 0xa0b4c4, 0.1));
      this.backdrop.add(this.add.rectangle(WIDTH / 2, sy(384), WIDTH + sx(100), sy(56), 0x1f232c, 0.3));
      this.backdrop.add(this.add.rectangle(WIDTH / 2, sy(210), WIDTH + sx(100), sy(5), 0xe3d7a0, 0.08));
      this.backdrop.add(this.add.rectangle(WIDTH / 2, sy(286), WIDTH + sx(100), sy(14), 0xb4cee6, 0.05));

      for (let row = 0; row < 11; row += 1) {
        for (let col = 0; col < 20; col += 1) {
          const x = col * sx(54) + (row % 2) * sx(27) - sx(38);
          const y = sy(188) + row * sy(21);
          const tint = row % 2 ? 0x676f7a : 0x59616b;
          const brick = this.add.rectangle(x, y, sx(50), sy(17), tint, 0.92);
          brick.setStrokeStyle(1, 0x343943, 0.72);
          this.backdrop.add(brick);
          if ((row + col) % 4 === 0) {
            this.backdrop.add(this.add.rectangle(x - sx(4), y - sy(4), sx(20), sy(2), 0xdce6f3, 0.14));
          }
          if ((row + col) % 5 === 0) {
            this.backdrop.add(this.add.rectangle(x + sx(6), y + sy(5), sx(18), sy(2), 0x20262f, 0.12));
          }
        }
      }

      for (let i = 0; i < 5; i += 1) {
        const x = sx(120) + i * sx(212);
        const win = this.add.container(x, sy(274) + (i % 2 ? sy(14) : 0));
        win.add(this.add.rectangle(0, 0, sx(84), sy(98), 0x17181e).setStrokeStyle(6, 0x404652));
        win.add(this.add.rectangle(-sx(22), -sy(8), sx(18), sy(58), 0x08090d));
        win.add(this.add.rectangle(sx(20), sy(12), sx(22), sy(48), 0x090b10));
        win.add(this.add.rectangle(0, sy(4), sx(86), sy(5), 0xe7e0cf, 0.88));
        win.add(this.add.rectangle(-sx(26), -sy(26), sx(8), sy(3), 0xb8d7ff, 0.14));
        win.add(this.add.rectangle(sx(20), sy(18), sx(10), sy(18), 0x10131a, 0.5));
        this.backdrop.add(win);
      }

      for (const x of [sx(162), sx(550), sx(936), sx(1246)]) {
        const station = this.add.container(x, sy(378));
        station.add(this.add.rectangle(0, 0, sx(102), sy(30), 0x225f98).setStrokeStyle(3, 0xf2ead8));
        station.add(this.add.rectangle(0, sy(32), sx(12), sy(34), 0x434a56));
        station.add(this.add.rectangle(0, -sy(8), sx(82), sy(4), 0xbfd8f0, 0.16));
        this.backdrop.add(station);
      }

      for (const x of [sx(262), sx(728), sx(1116)]) {
        const roundel = this.add.container(x, sy(224));
        roundel.add(this.add.circle(0, 0, sx(26), 0xc53343).setStrokeStyle(4, 0xf2ead8));
        roundel.add(this.add.rectangle(0, 0, sx(68), sy(12), 0x1f5a93));
        roundel.add(this.add.rectangle(0, sy(2), sx(60), sy(2), 0xbcd7ef, 0.14));
        this.backdrop.add(roundel);
      }
      this.sign = this.add
        .text(sx(594), sy(72), this.city.sign, {
          fontFamily: '"Press Start 2P"',
          fontSize: `${Math.round(sx(17))}px`,
          color: "#ffd95c",
          stroke: "#14151c",
          strokeThickness: Math.round(sx(5)),
        })
        .setOrigin(0.5);
      return;
    }

    if (this.city.key === "valencia") {
      const promenadeShadow = this.add.rectangle(WIDTH / 2, sy(292), WIDTH + sx(120), sy(118), 0x163847, 0.12);
      this.backdrop.add(promenadeShadow);
      const water = this.add.container(WIDTH / 2, sy(352));
      water.add(this.add.rectangle(0, 0, WIDTH + sx(120), sy(62), 0x72ddd9, 0.44));
      water.add(this.add.rectangle(0, -sy(18), WIDTH + sx(120), sy(14), 0xf7fffb, 0.08));
      water.add(this.add.rectangle(0, sy(18), WIDTH + sx(120), sy(10), 0x2d5e73, 0.22));
      for (let i = 0; i < 13; i += 1) {
        water.add(this.add.rectangle(sx(-706) + i * sx(120), -sy(4) + (i % 2) * sy(6), sx(82 + (i % 3) * 10), sy(3), 0xf7fffb, i % 2 ? 0.08 : 0.16));
      }
      this.backdrop.add(water);

      const promenade = this.add.container(WIDTH / 2, sy(394));
      promenade.add(this.add.rectangle(0, 0, WIDTH + sx(120), sy(34), 0xf6ead4).setStrokeStyle(3, 0x304956));
      promenade.add(this.add.rectangle(0, -sy(8), WIDTH + sx(120), sy(5), 0xffffff, 0.14));
      promenade.add(this.add.rectangle(0, sy(10), WIDTH + sx(120), sy(6), 0x315263, 0.18));
      for (let i = 0; i < 14; i += 1) {
        const x = sx(-688) + i * sx(106);
        promenade.add(this.add.rectangle(x, 0, sx(88), sy(18), 0xf4ead7).setStrokeStyle(2, 0x314452));
        promenade.add(this.add.rectangle(x, 0, sx(28), sy(7), 0x42d7dc));
        promenade.add(this.add.rectangle(x - sx(24), 0, sx(12), sy(7), 0xff9641));
        promenade.add(this.add.rectangle(x + sx(24), 0, sx(12), sy(7), 0xff9641));
      }
      this.backdrop.add(promenade);

      for (const [x, y, scale] of [
        [sx(168), sy(336), 0.96],
        [sx(484), sy(332), 0.82],
        [sx(1194), sy(338), 0.92],
      ]) {
        const palm = this.add.container(x, y);
        palm.setScale(scale);
        palm.add(this.add.rectangle(0, sy(14), sx(7), sy(62), 0x6f4721));
        palm.add(this.add.triangle(0, -sy(18), -sx(30), sy(10), 0, -sy(44), sx(30), sy(10), 0x2fc675));
        palm.add(this.add.triangle(-sx(16), sy(0), -sx(34), sy(14), -sx(12), -sy(28), sx(4), sy(14), 0x4ddd8c));
        palm.add(this.add.triangle(sx(18), sy(0), -sx(2), sy(14), sx(16), -sy(30), sx(38), sy(12), 0x4ddd8c));
        this.backdrop.add(palm);
      }

      this.sign = this.add
        .text(sx(612), sy(72), "KAMUABU VLC", {
          fontFamily: '"Press Start 2P"',
          fontSize: `${Math.round(sx(17))}px`,
          color: "#ffd95c",
          stroke: "#14151c",
          strokeThickness: Math.round(sx(5)),
        })
        .setOrigin(0.5);
      return;
    }

    const wall = this.add.rectangle(WIDTH / 2, sy(304), WIDTH + sx(100), sy(214), this.city.wall);
    wall.setStrokeStyle(5, 0x2c2d33);
    this.backdrop.add(wall);
    this.backdrop.add(this.add.rectangle(WIDTH / 2, sy(212), WIDTH + sx(100), sy(42), tintColor(this.city.highlight, -0.2), 0.11));
    this.backdrop.add(this.add.rectangle(WIDTH / 2, sy(392), WIDTH + sx(100), sy(48), this.city.shadow, 0.22));
    this.backdrop.add(this.add.rectangle(WIDTH / 2, sy(222), WIDTH + sx(100), sy(5), this.city.glow, 0.08));

    for (let row = 0; row < 10; row += 1) {
      for (let col = 0; col < 20; col += 1) {
        const x = col * sx(54) + (row % 2) * sx(27) - sx(38);
        const y = sy(196) + row * sy(21);
        const brick = this.add.rectangle(x, y, sx(50), sy(17), row % 2 ? this.city.brickA : this.city.brickB, 0.78);
        brick.setStrokeStyle(1, 0x25272e, 0.62);
        this.backdrop.add(brick);
        if ((row + col) % 5 === 0) {
          this.backdrop.add(
            this.add.rectangle(x - sx(5), y - sy(4), sx(18), sy(2), tintColor(this.city.highlight, 0.12), 0.18)
          );
        }
      }
    }

    for (let i = 0; i < 5; i += 1) {
      const x = sx(126) + i * sx(190);
      const window = this.add.rectangle(x, sy(276) + (i % 2) * sy(18), sx(72), sy(88), 0x17171d);
      window.setStrokeStyle(6, 0x3e414a);
      this.backdrop.add(window);
      this.backdrop.add(this.add.rectangle(x - sx(20), window.y - sy(26), sx(18), sy(5), this.city.highlight, 0.12));
      this.backdrop.add(this.add.rectangle(x + sx(22), window.y + sy(18), sx(16), sy(34), 0x050609, 0.45));
      this.backdrop.add(this.add.rectangle(x - sx(14), window.y - sy(5), sx(16), sy(52), 0x090a0e));
      this.backdrop.add(this.add.rectangle(x + sx(20), window.y + sy(10), sx(20), sy(44), 0x090a0e));
      this.backdrop.add(this.add.rectangle(x + sx(2), window.y + sy(1), sx(76), sy(5), 0xd6d0bd));
    }

    this.sign = this.add
      .text(sx(570), sy(72), this.city.sign, {
        fontFamily: '"Press Start 2P"',
        fontSize: `${Math.round(sx(17))}px`,
        color: "#ffd95c",
        stroke: "#14151c",
        strokeThickness: Math.round(sx(5)),
      })
      .setOrigin(0.5);

    if (this.city.key === "valencia") {
      this.backdrop.add(this.add.rectangle(WIDTH / 2, sy(366), WIDTH + sx(100), sy(38), 0x7ce2d8, 0.16));
      this.backdrop.add(this.add.rectangle(WIDTH / 2, sy(388), WIDTH + sx(100), sy(10), 0xf2ead8, 0.16));
      for (let i = 0; i < 12; i += 1) {
        const tile = this.add.rectangle(sx(34) + i * sx(108), sy(398), sx(96), sy(24), 0xf2ead8).setStrokeStyle(3, 0x30343a);
        const center = this.add.rectangle(tile.x, tile.y, sx(28), sy(10), 0x40d8ff);
        const sideA = this.add.rectangle(tile.x - sx(22), tile.y, sx(14), sy(10), 0xff8b22);
        const sideB = this.add.rectangle(tile.x + sx(22), tile.y, sx(14), sy(10), 0xff8b22);
        const shine = this.add.rectangle(tile.x, tile.y - sy(6), sx(80), sy(3), 0xffffff, 0.16);
        this.backdrop.add(tile);
        this.backdrop.add(center);
        this.backdrop.add(sideA);
        this.backdrop.add(sideB);
        this.backdrop.add(shine);
      }

      for (const x of [sx(184), sx(536), sx(902), sx(1262)]) {
        const palm = this.add.container(x, sy(350));
        palm.add(this.add.rectangle(0, sy(14), sx(6), sy(58), 0x6d4726));
        palm.add(this.add.triangle(0, -sy(14), -sx(26), sy(10), 0, -sy(34), sx(26), sy(10), 0x2fbf71));
        palm.add(this.add.triangle(-sx(14), sy(2), -sx(30), sy(12), -sx(12), -sy(22), sx(2), sy(12), 0x48d886));
        this.backdrop.add(palm);
      }

      const reflection = this.add.container(sx(774), sy(372));
      reflection.add(this.add.rectangle(0, 0, sx(420), sy(16), 0xb9f0e9, 0.12));
      reflection.add(this.add.rectangle(-sx(106), -sy(6), sx(124), sy(6), 0xffd95c, 0.12));
      reflection.add(this.add.rectangle(0, sy(2), sx(104), sy(5), 0x8ed8e1, 0.1));
      reflection.add(this.add.rectangle(sx(132), -sy(2), sx(146), sy(6), 0x5aa7df, 0.08));
      this.backdrop.add(reflection);
    } else if (this.city.key === "roma") {
      for (const x of [sx(118), sx(478), sx(832), sx(1148)]) {
        const column = this.add.container(x, sy(336));
        column.add(this.add.rectangle(0, sy(8), sx(34), sy(116), 0x9f866b).setStrokeStyle(3, 0x2b221b));
        column.add(this.add.rectangle(0, -sy(44), sx(52), sy(14), 0xc7b08a));
        column.add(this.add.rectangle(0, sy(62), sx(58), sy(10), 0x7d6552));
        column.add(this.add.rectangle(-sx(8), -sy(6), sx(4), sy(74), 0xe4bf89, 0.18));
        column.add(this.add.rectangle(sx(8), sy(18), sx(4), sy(64), 0x5f4a3b, 0.18));
        this.backdrop.add(column);
      }
      this.backdrop.add(this.add.rectangle(WIDTH / 2, sy(388), WIDTH + sx(100), sy(20), 0x6d5444, 0.28));
    } else if (this.city.key === "paris") {
      for (const x of [sx(182), sx(546), sx(902), sx(1202)]) {
        const awning = this.add.container(x, sy(378));
        awning.add(this.add.rectangle(0, 0, sx(82), sy(18), 0xf2ead8).setStrokeStyle(2, 0x202126));
        awning.add(this.add.rectangle(-sx(18), sy(20), sx(8), sy(40), 0x202126));
        awning.add(this.add.rectangle(sx(18), sy(20), sx(8), sy(40), 0x202126));
        awning.add(this.add.rectangle(0, sy(34), sx(96), sy(5), 0x40d8ff));
        awning.add(this.add.rectangle(0, sy(8), sx(74), sy(4), 0xf2ead8, 0.18));
        this.backdrop.add(awning);
      }
      for (const x of [sx(304), sx(738), sx(1146)]) {
        const shop = this.add.container(x, sy(358));
        shop.add(this.add.rectangle(0, 0, sx(116), sy(52), 0x253049, 0.62).setStrokeStyle(3, 0x1c2029));
        shop.add(this.add.rectangle(0, -sy(18), sx(88), sy(8), 0xf2ead8, 0.16));
        shop.add(this.add.rectangle(0, sy(8), sx(72), sy(18), 0x6fdff8, 0.08));
        shop.add(this.add.rectangle(-sx(24), sy(8), sx(14), sy(22), 0x111218, 0.4));
        shop.add(this.add.rectangle(sx(24), sy(8), sx(14), sy(22), 0x111218, 0.4));
        this.backdrop.add(shop);
      }
    } else if (this.city.key === "venecia") {
      for (const x of [sx(120), sx(480), sx(860), sx(1180)]) {
        const arch = this.add.container(x, sy(338));
        arch.add(this.add.rectangle(0, sy(30), sx(92), sy(84), 0x8c7d73));
        arch.add(this.add.arc(0, sy(12), sx(28), 180, 360, false, 0x203f50));
        arch.add(this.add.rectangle(0, sy(56), sx(44), sy(8), 0x203f50));
        arch.add(this.add.rectangle(-sx(18), sy(8), sx(4), sy(36), 0xc4f4ef, 0.14));
        arch.add(this.add.rectangle(sx(18), sy(18), sx(4), sy(30), 0x3e5c63, 0.16));
        this.backdrop.add(arch);
      }
      this.backdrop.add(this.add.rectangle(WIDTH / 2, sy(392), WIDTH + sx(100), sy(18), 0x79e8e0, 0.14));
    } else if (this.city.key === "londres") {
      for (const x of [sx(146), sx(540), sx(934), sx(1238)]) {
        const sign = this.add.container(x, sy(378));
        sign.add(this.add.rectangle(0, 0, sx(92), sy(26), 0x1f5a93).setStrokeStyle(3, 0xf2ead8));
        sign.add(this.add.rectangle(0, sy(28), sx(10), sy(30), 0x3a3f49));
        this.backdrop.add(sign);
      }

      for (const x of [sx(260), sx(722), sx(1110)]) {
        const roundel = this.add.container(x, sy(222));
        roundel.add(this.add.circle(0, 0, sx(24), 0xc53343).setStrokeStyle(4, 0xf2ead8));
        roundel.add(this.add.rectangle(0, 0, sx(62), sy(12), 0x1f5a93));
        this.backdrop.add(roundel);
      }
    }
  }

  createLandmark() {
    this.landmark = this.add.container(sx(760), sy(272));

    if (this.city.key === "paris") {
      this.landmark.x = sx(756);
      this.landmark.add(this.add.triangle(0, -sy(2), 0, -sy(132), -sx(54), sy(96), sx(54), sy(96), this.city.accent, 0.88));
      this.landmark.add(this.add.triangle(-sx(8), -sy(12), -sx(2), -sy(104), -sx(34), sy(68), sx(6), sy(68), this.city.highlight, 0.4));
      this.landmark.add(this.add.rectangle(0, sy(12), sx(124), sy(8), 0x15151c));
      this.landmark.add(this.add.rectangle(0, sy(58), sx(94), sy(8), 0x15151c));
      this.landmark.add(this.add.circle(0, -sy(94), sx(5), 0xffd95c));
      const cafe = this.add.container(sx(146), sy(56));
      cafe.add(this.add.rectangle(0, 0, sx(122), sy(70), 0x253049).setStrokeStyle(4, 0x15151c));
      cafe.add(this.add.rectangle(0, -sy(30), sx(134), sy(12), 0xf2ead8));
      cafe.add(this.add.rectangle(0, sy(12), sx(96), sy(18), 0x6fdff8, 0.08));
      cafe.add(this.add.rectangle(-sx(28), sy(12), sx(16), sy(24), 0x15151c));
      cafe.add(this.add.rectangle(sx(28), sy(12), sx(16), sy(24), 0x15151c));
      cafe.add(this.add.circle(-sx(28), sy(42), sx(10), 0x15151c));
      cafe.add(this.add.circle(sx(28), sy(42), sx(10), 0x15151c));
      this.landmark.add(cafe);
    } else if (this.city.key === "roma") {
      this.landmark.x = sx(754);
      this.landmark.add(this.add.rectangle(0, sy(34), sx(164), sy(128), 0x5a3c2e, 0.82).setStrokeStyle(4, 0x1d1714));
      this.landmark.add(this.add.arc(0, -sy(10), sx(60), 180, 360, false, this.city.highlight, 0.18));
      for (let i = 0; i < 4; i += 1) {
        this.landmark.add(this.add.rectangle(-sx(54) + i * sx(36), sy(42), sx(20), sy(72), 0x191517));
        this.landmark.add(this.add.rectangle(-sx(58) + i * sx(36), sy(10), sx(4), sy(52), this.city.highlight, 0.22));
      }
      this.landmark.add(this.add.arc(0, -sy(10), sx(60), 180, 360, false, 0xb9875b, 0.42));
      const scooter = this.add.container(sx(154), sy(90));
      scooter.add(this.add.circle(-sx(22), sy(10), sx(12), 0x15151c));
      scooter.add(this.add.circle(sx(22), sy(10), sx(12), 0x15151c));
      scooter.add(this.add.rectangle(0, 0, sx(76), sy(16), 0xb9875b).setStrokeStyle(3, 0x2b221b));
      scooter.add(this.add.rectangle(sx(22), -sy(18), sx(12), sy(24), 0x202126));
      scooter.add(this.add.rectangle(sx(28), -sy(24), sx(24), sy(6), 0x202126));
      scooter.add(this.add.rectangle(-sx(8), -sy(8), sx(18), sy(10), 0xd6b07a, 0.2));
      this.landmark.add(scooter);
    } else if (this.city.key === "venecia") {
      this.landmark.x = sx(762);
      this.landmark.add(this.add.rectangle(0, sy(82), sx(194), sy(36), 0x203f50));
      this.landmark.add(this.add.rectangle(0, sy(72), sx(174), sy(7), this.city.highlight, 0.2));
      this.landmark.add(this.add.arc(0, sy(50), sx(66), 180, 360, false, this.city.accent, 0.9));
      this.landmark.add(this.add.rectangle(0, sy(78), sx(166), sy(10), 0x15151c));
      this.landmark.add(this.add.rectangle(-sx(56), sy(0), sx(32), sy(66), 0x8a6958));
      this.landmark.add(this.add.rectangle(sx(56), sy(2), sx(30), sy(62), 0xb48b64));
      this.landmark.add(this.add.rectangle(sx(68), -sy(10), sx(8), sy(28), this.city.highlight, 0.22));
      const gondola = this.add.container(-sx(146), sy(78));
      gondola.add(this.add.rectangle(0, 0, sx(118), sy(10), 0x111218));
      gondola.add(this.add.arc(0, -sy(4), sx(50), 180, 360, false, 0x202126));
      gondola.add(this.add.rectangle(sx(30), -sy(24), sx(8), sy(34), 0x8a6958));
      gondola.add(this.add.triangle(-sx(42), -sy(4), -sx(18), -sy(4), -sx(58), -sy(14), -sx(42), sy(12), 0x111218));
      gondola.add(this.add.rectangle(-sx(6), -sy(6), sx(18), sy(4), 0xff365f));
      this.landmark.add(gondola);
    } else if (this.city.key === "londres") {
      this.landmark.x = sx(774);
      const bus = this.add.container(-sx(112), sy(58));
      bus.add(this.add.rectangle(0, 0, sx(176), sy(74), 0xc92d45).setStrokeStyle(5, 0x15151c));
      bus.add(this.add.rectangle(0, -sy(32), sx(182), sy(14), 0x981727));
      bus.add(this.add.rectangle(0, sy(24), sx(176), sy(10), 0x7b1020));
      bus.add(this.add.rectangle(-sx(20), -sy(16), sx(108), sy(18), 0xe7e0cf));
      bus.add(this.add.rectangle(sx(54), -sy(16), sx(28), sy(18), 0xe7e0cf));
      for (let i = 0; i < 5; i += 1) {
        bus.add(this.add.rectangle(-sx(56) + i * sx(24), -sy(4), sx(18), sy(24), 0x253049));
      }
      bus.add(this.add.rectangle(sx(58), sy(10), sx(24), sy(20), 0xa71e30));
      bus.add(this.add.rectangle(-sx(70), -sy(20), sx(6), sy(12), 0xbfd8f0, 0.24));
      bus.add(this.add.circle(-sx(52), sy(34), sx(13), 0x14151a));
      bus.add(this.add.circle(sx(52), sy(34), sx(13), 0x14151a));
      bus.add(this.add.circle(-sx(52), sy(34), sx(6), 0x5d6674));
      bus.add(this.add.circle(sx(52), sy(34), sx(6), 0x5d6674));
      this.landmark.add(bus);

      const booth = this.add.container(sx(42), sy(18));
      booth.add(this.add.rectangle(0, sy(26), sx(88), sy(174), 0xae1d32).setStrokeStyle(4, 0x15151c));
      booth.add(this.add.rectangle(0, -sy(62), sx(96), sy(18), 0xc92d45).setStrokeStyle(3, 0x15151c));
      booth.add(this.add.rectangle(0, -sy(72), sx(74), sy(8), 0xf2ead8));
      booth.add(this.add.text(0, -sy(72), "PHONE", {
        fontFamily: '"Press Start 2P"',
        fontSize: `${Math.round(sx(6))}px`,
        color: "#1b1d22",
      }).setOrigin(0.5));
      booth.add(this.add.rectangle(-sx(24), sy(16), sx(9), sy(136), 0xf06b82, 0.44));
      booth.add(this.add.rectangle(sx(25), sy(16), sx(9), sy(138), 0x681322, 0.66));
      for (let row = 0; row < 2; row += 1) {
        for (let col = 0; col < 3; col += 1) {
          const glassX = -sx(24) + col * sx(24);
          const glassY = sy(2) + row * sy(42);
          booth.add(this.add.rectangle(glassX, glassY, sx(18), sy(32), 0x253049));
          booth.add(this.add.rectangle(glassX - sx(5), glassY - sy(9), sx(3), sy(16), 0xbfd8f0, 0.2));
          booth.add(this.add.rectangle(glassX + sx(5), glassY + sy(6), sx(2), sy(12), 0xf2ead8, 0.08));
        }
      }
      booth.add(this.add.rectangle(0, sy(102), sx(96), sy(10), 0x24272f));
      this.landmark.add(booth);

      const clock = this.add.container(sx(172), sy(10));
      clock.add(this.add.rectangle(0, sy(12), sx(34), sy(170), 0x47505c));
      clock.add(this.add.rectangle(0, -sy(58), sx(52), sy(20), 0xc5b06c));
      clock.add(this.add.rectangle(0, -sy(86), sx(10), sy(18), 0x47505c));
      clock.add(this.add.triangle(0, -sy(104), -sx(14), -sy(82), 0, -sy(126), sx(14), -sy(82), 0xc5b06c));
      clock.add(this.add.rectangle(0, sy(86), sx(40), sy(12), 0x2f333b));
      clock.add(this.add.circle(0, -sy(58), sx(11), 0xf2ead8));
      clock.add(this.add.rectangle(0, -sy(58), sx(1), sy(7), 0x15151c));
      clock.add(this.add.rectangle(sx(4), -sy(61), sx(5), sy(1), 0x15151c));
      clock.add(this.add.rectangle(-sx(12), -sy(44), sx(4), sy(96), 0x9eb2c4, 0.16));
      this.landmark.add(clock);

      const crosswalk = this.add.container(0, sy(126));
      for (let i = 0; i < 5; i += 1) {
        crosswalk.add(this.add.rectangle(-sx(110) + i * sx(56), 0, sx(32), sy(9), 0xf2ead8, i === 2 ? 0.9 : 0.72));
      }
      this.landmark.add(crosswalk);
    } else if (this.city.key === "valencia") {
      this.landmark.x = sx(798);

      const reflection = this.add.container(0, sy(124));
      reflection.add(this.add.rectangle(0, 0, sx(864), sy(30), 0x76ddd8, 0.34));
      reflection.add(this.add.rectangle(0, -sy(10), sx(820), sy(8), 0xf8fffb, 0.14));
      reflection.add(this.add.rectangle(-sx(194), -sy(2), sx(156), sy(4), 0xffd56f, 0.16));
      reflection.add(this.add.rectangle(sx(72), sy(2), sx(180), sy(4), 0x8be5df, 0.14));
      reflection.add(this.add.rectangle(sx(272), -sy(1), sx(132), sy(4), 0x5caee4, 0.12));
      this.landmark.add(reflection);

      const arts = this.add.container(-sx(40), sy(12));
      arts.add(this.add.rectangle(-sx(26), sy(92), sx(514), sy(12), 0x1f4255));
      arts.add(this.add.arc(-sx(176), sy(26), sx(152), 180, 360, false, 0xf8fbfd, 0.99));
      arts.add(this.add.arc(-sx(176), sy(26), sx(120), 180, 360, false, 0xffcf7f, 0.22));
      arts.add(this.add.arc(-sx(18), sy(36), sx(112), 180, 360, false, 0xf8fbfd, 0.94));
      arts.add(this.add.arc(-sx(18), sy(36), sx(82), 180, 360, false, 0x84e7e0, 0.22));
      arts.add(this.add.triangle(sx(188), 0, sx(42), sy(92), sx(184), -sy(84), sx(260), sy(92), 0xf7fbfd, 0.99));
      arts.add(this.add.triangle(sx(194), sy(16), sx(72), sy(76), sx(186), -sy(42), sx(250), sy(76), 0x9beee6, 0.36));
      arts.add(this.add.rectangle(sx(188), sy(84), sx(170), sy(8), 0x1f3744));
      arts.add(this.add.rectangle(-sx(34), sy(78), sx(148), sy(8), 0x1f3744));
      arts.add(this.add.rectangle(-sx(208), sy(62), sx(36), sy(10), 0xeef7fb, 0.74));
      arts.add(this.add.rectangle(sx(28), sy(70), sx(28), sy(8), 0xeef7fb, 0.58));
      this.landmark.add(arts);

      const assut = this.add.container(sx(300), -sy(8));
      assut.add(this.add.rectangle(0, sy(92), sx(18), sy(228), 0xf8fbff));
      assut.add(this.add.triangle(sx(92), sy(24), sx(12), sy(158), sx(92), -sy(88), sx(150), sy(158), 0xf8fbff, 0.98));
      for (let i = 0; i < 8; i += 1) {
        assut.add(this.add.rectangle(sx(18) + i * sx(16), -sy(2) + i * sy(27), sx(68 - i * 4), sy(2), 0xe1fbf7, 0.44).setAngle(-30));
      }
      this.landmark.add(assut);

      const promenade = this.add.container(sx(104), sy(110));
      promenade.add(this.add.rectangle(0, 0, sx(454), sy(20), 0xf4ead6).setStrokeStyle(3, 0x2d4653));
      promenade.add(this.add.rectangle(0, -sy(6), sx(328), sy(4), 0xff9641));
      promenade.add(this.add.rectangle(0, sy(4), sx(164), sy(4), 0x42d7dc));
      promenade.add(this.add.rectangle(-sx(156), -sy(24), sx(10), sy(42), 0x2f5968));
      promenade.add(this.add.rectangle(sx(156), -sy(24), sx(10), sy(42), 0x2f5968));
      promenade.add(this.add.rectangle(-sx(92), -sy(8), sx(40), sy(3), 0xffffff, 0.18));
      promenade.add(this.add.rectangle(sx(96), -sy(8), sx(34), sy(3), 0xffffff, 0.14));
      this.landmark.add(promenade);
    } else {
      this.landmark.x = sx(758);
      this.landmark.add(this.add.rectangle(-sx(62), sy(30), sx(14), sy(150), 0x5b3d22));
      this.landmark.add(this.add.triangle(-sx(62), -sy(54), -sx(124), sy(2), -sx(62), -sy(96), sx(18), sy(2), 0x2fbf71));
      this.landmark.add(this.add.triangle(-sx(78), -sy(44), -sx(112), 0, -sx(70), -sy(84), -sx(20), -sy(4), this.city.highlight, 0.3));
      this.landmark.add(this.add.rectangle(sx(34), sy(44), sx(92), sy(112), this.city.accent, 0.82).setStrokeStyle(4, 0x15151c));
      this.landmark.add(this.add.rectangle(sx(16), sy(12), sx(22), sy(76), this.city.highlight, 0.24));
      this.landmark.add(this.add.rectangle(sx(72), sy(44), sx(12), sy(112), this.city.shadow, 0.3));
      this.landmark.add(this.add.rectangle(sx(62), sy(72), sx(24), sy(58), 0xf2ead8));
      this.landmark.add(this.add.rectangle(-sx(4), sy(102), sx(178), sy(10), 0xf2ead8, 0.8));
      this.landmark.add(this.add.rectangle(-sx(4), sy(112), sx(178), sy(5), 0x40d8ff, 0.22));
    }

    this.landmarkLayer.add(this.landmark);
  }

  createStreetProps() {
    this.props = [];
    if (this.city.key === "londres") {
      for (const x of [sx(214), sx(620), sx(1024), sx(1386)]) {
        const lamp = this.add.container(x, sy(346));
        lamp.add(this.add.rectangle(0, 0, sx(10), sy(94), 0x434a56));
        lamp.add(this.add.rectangle(0, -sy(44), sx(38), sy(12), 0xc7b76a));
        lamp.add(this.add.rectangle(0, -sy(28), sx(22), sy(18), 0xf2ead8, 0.76));
        lamp.add(this.add.rectangle(0, -sy(18), sx(12), sy(8), 0xbfd8f0, 0.16));
        this.propLayer.add(lamp);
        this.props.push(lamp);
      }

      for (const busX of [sx(936), sx(1298)]) {
        const bus = this.add.container(busX, sy(busX === sx(914) ? 354 : 342));
        bus.add(this.add.rectangle(0, -sy(3), sx(148), sy(60), 0xc92d45).setStrokeStyle(4, 0x15151c));
        bus.add(this.add.rectangle(0, -sy(27), sx(156), sy(12), 0x8d1324));
        bus.add(this.add.rectangle(0, sy(20), sx(148), sy(10), 0x6a0f1c));
        bus.add(this.add.rectangle(-sx(16), -sy(17), sx(94), sy(16), 0xe7e0cf));
        bus.add(this.add.rectangle(sx(46), -sy(17), sx(28), sy(16), 0xe7e0cf));
        for (let i = 0; i < 6; i += 1) {
          bus.add(this.add.rectangle(-sx(52) + i * sx(20), -sy(4), sx(18), sy(24), 0x253049));
        }
        bus.add(this.add.rectangle(sx(44), sy(9), sx(24), sy(20), 0xa71e30));
        bus.add(this.add.rectangle(-sx(52), -sy(18), sx(5), sy(12), 0xbce5ff, 0.24));
        bus.add(this.add.rectangle(sx(54), sy(19), sx(10), sy(4), 0xffd95c));
        bus.add(this.add.rectangle(-sx(64), sy(19), sx(10), sy(4), 0xf2ead8));
        bus.add(this.add.circle(-sx(40), sy(28), sx(12), 0x15151c));
        bus.add(this.add.circle(sx(40), sy(28), sx(12), 0x15151c));
        bus.add(this.add.circle(-sx(40), sy(28), sx(5), 0x5a616d));
        bus.add(this.add.circle(sx(40), sy(28), sx(5), 0x5a616d));
        bus.setData("type", "bus");
        bus.setData("baseY", bus.y);
        this.propLayer.add(bus);
        this.props.push(bus);
      }

      for (const x of [sx(338), sx(792), sx(1266)]) {
        const traffic = this.add.container(x, sy(336));
        const red = this.add.circle(0, -sy(38), sx(5), 0xff365f);
        const amber = this.add.circle(0, -sy(28), sx(5), 0xffd95c, 0.35);
        const green = this.add.circle(0, -sy(18), sx(5), 0x4ae0c2, 0.35);
        traffic.add(this.add.rectangle(0, 0, sx(10), sy(70), 0x3a3f49));
        traffic.add(this.add.rectangle(0, -sy(28), sx(24), sy(34), 0x1a1b20));
        traffic.add(red);
        traffic.add(amber);
        traffic.add(green);
        traffic.setData("type", "traffic");
        traffic.setData("lights", { red, amber, green, offset: Phaser.Math.Between(0, 2000) });
        this.propLayer.add(traffic);
        this.props.push(traffic);
      }
      for (const x of [sx(312), sx(988)]) {
        const steam = this.add.container(x, sy(384));
        const plumeA = this.add.ellipse(0, -sy(18), sx(42), sy(18), 0xd7e1ea, 0.16);
        const plumeB = this.add.ellipse(sx(10), -sy(38), sx(34), sy(16), 0xd7e1ea, 0.12);
        steam.add(this.add.rectangle(0, 0, sx(32), sy(8), 0x1b1d22));
        steam.add(plumeA);
        steam.add(plumeB);
        steam.setData("type", "steam");
        steam.setData("plumes", [plumeA, plumeB]);
        this.propLayer.add(steam);
        this.props.push(steam);
      }
    } else if (this.city.key === "roma") {
      for (const x of [sx(180), sx(612), sx(1028)]) {
        const scooter = this.add.container(x, sy(362));
        scooter.add(this.add.circle(-sx(20), sy(10), sx(10), 0x15151c));
        scooter.add(this.add.circle(sx(18), sy(10), sx(10), 0x15151c));
        scooter.add(this.add.rectangle(0, 0, sx(62), sy(14), 0xb9875b).setStrokeStyle(3, 0x2b221b));
        scooter.add(this.add.rectangle(sx(18), -sy(16), sx(10), sy(22), 0x202126));
        scooter.add(this.add.rectangle(sx(24), -sy(22), sx(18), sy(5), 0x202126));
        scooter.add(this.add.rectangle(-sx(10), -sy(8), sx(20), sy(10), 0xd6b07a, 0.2));
        this.propLayer.add(scooter);
        this.props.push(scooter);
      }
      const fountain = this.add.container(sx(938), sy(356));
      fountain.add(this.add.arc(0, sy(6), sx(44), 180, 360, false, 0xb6c3cf));
      fountain.add(this.add.rectangle(0, sy(14), sx(92), sy(14), 0x8c7d73));
      fountain.add(this.add.rectangle(0, -sy(26), sx(12), sy(34), 0xc5b06c));
      fountain.add(this.add.rectangle(0, -sy(42), sx(4), sy(20), 0xb6c3cf, 0.5));
      fountain.setData("type", "fountain");
      fountain.setData("baseY", fountain.y);
      this.propLayer.add(fountain);
      this.props.push(fountain);
    } else if (this.city.key === "paris") {
      for (const x of [sx(184), sx(562), sx(940)]) {
        const lamp = this.add.container(x, sy(346));
        lamp.add(this.add.rectangle(0, 0, sx(8), sy(92), 0x2a2f3a));
        lamp.add(this.add.circle(0, -sy(42), sx(10), 0xf2ead8, 0.9));
        lamp.add(this.add.rectangle(0, -sy(28), sx(4), sy(20), 0x2a2f3a));
        lamp.add(this.add.circle(0, -sy(42), sx(16), 0x6fdff8, 0.08));
        this.propLayer.add(lamp);
        this.props.push(lamp);
      }
      const cafe = this.add.container(sx(952), sy(350));
      cafe.add(this.add.rectangle(0, 0, sx(92), sy(44), 0x253049).setStrokeStyle(4, 0x15151c));
      cafe.add(this.add.rectangle(0, -sy(22), sx(112), sy(10), 0xf2ead8));
      cafe.add(this.add.rectangle(0, sy(8), sx(68), sy(18), 0x6fdff8, 0.08));
      cafe.add(this.add.circle(-sx(20), sy(24), sx(11), 0x15151c));
      cafe.add(this.add.circle(sx(20), sy(24), sx(11), 0x15151c));
      cafe.setData("type", "cafe");
      this.propLayer.add(cafe);
      this.props.push(cafe);
    } else if (this.city.key === "venecia") {
      for (const x of [sx(242), sx(706), sx(1142)]) {
        const bridge = this.add.container(x, sy(360));
        bridge.add(this.add.arc(0, 0, sx(44), 180, 360, false, 0x8a6958));
        bridge.add(this.add.rectangle(0, sy(4), sx(104), sy(6), 0x203f50));
        bridge.add(this.add.rectangle(0, sy(8), sx(88), sy(2), 0xc4f4ef, 0.14));
        this.propLayer.add(bridge);
        this.props.push(bridge);
      }
      const gondola = this.add.container(sx(972), sy(366));
      gondola.add(this.add.rectangle(0, 0, sx(118), sy(10), 0x111218));
      gondola.add(this.add.arc(0, -sy(4), sx(50), 180, 360, false, 0x202126));
      gondola.add(this.add.rectangle(sx(32), -sy(24), sx(8), sy(34), 0x8a6958));
      gondola.add(this.add.triangle(-sx(42), -sy(4), -sx(18), -sy(4), -sx(58), -sy(14), -sx(42), sy(12), 0x111218));
      gondola.setData("type", "gondola");
      gondola.setData("baseY", gondola.y);
      this.propLayer.add(gondola);
      this.props.push(gondola);
    } else if (this.city.key === "valencia") {
      for (const x of [sx(202), sx(612), sx(1118), sx(1340)]) {
        const orangeTree = this.add.container(x, sy(356));
        orangeTree.add(this.add.rectangle(0, sy(10), sx(8), sy(62), 0x75491f));
        orangeTree.add(this.add.circle(0, -sy(22), sx(30), 0x45bc68, 0.94));
        orangeTree.add(this.add.circle(-sx(20), -sy(8), sx(19), 0x56ca76, 0.96));
        orangeTree.add(this.add.circle(sx(20), -sy(8), sx(19), 0x56ca76, 0.96));
        orangeTree.add(this.add.circle(-sx(10), -sy(20), sx(4), 0xffb33f));
        orangeTree.add(this.add.circle(sx(6), -sy(28), sx(4), 0xffb33f));
        orangeTree.add(this.add.circle(sx(18), -sy(14), sx(4), 0xffb33f));
        this.propLayer.add(orangeTree);
        this.props.push(orangeTree);
      }
      for (const x of [sx(356), sx(834), sx(1238)]) {
        const bench = this.add.container(x, sy(368));
        bench.add(this.add.rectangle(0, 0, sx(88), sy(10), 0xf2ead8).setStrokeStyle(3, 0x29414e));
        bench.add(this.add.rectangle(-sx(26), sy(18), sx(6), sy(26), 0x29414e));
        bench.add(this.add.rectangle(sx(26), sy(18), sx(6), sy(26), 0x29414e));
        bench.add(this.add.rectangle(0, -sy(8), sx(72), sy(4), 0xff8f37));
        bench.add(this.add.rectangle(0, sy(4), sx(28), sy(4), 0x42d7dc));
        this.propLayer.add(bench);
        this.props.push(bench);
      }
      const bridgeBench = this.add.container(sx(972), sy(346));
      bridgeBench.add(this.add.rectangle(0, sy(20), sx(196), sy(12), 0x295061));
      bridgeBench.add(this.add.rectangle(-sx(74), sy(4), sx(8), sy(42), 0x345c6d));
      bridgeBench.add(this.add.rectangle(sx(74), sy(4), sx(8), sy(42), 0x345c6d));
      bridgeBench.add(this.add.rectangle(0, -sy(4), sx(156), sy(10), 0xf4ead6).setStrokeStyle(2, 0x2b4656));
      bridgeBench.add(this.add.rectangle(0, sy(4), sx(64), sy(4), 0x42d7dc));
      bridgeBench.add(this.add.rectangle(-sx(28), -sy(4), sx(14), sy(4), 0xff8f37));
      bridgeBench.add(this.add.rectangle(sx(28), -sy(4), sx(14), sy(4), 0xff8f37));
      bridgeBench.setData("type", "bridgeBench");
      this.propLayer.add(bridgeBench);
      this.props.push(bridgeBench);

      const trencadis = this.add.container(sx(1210), sy(348));
      trencadis.add(this.add.rectangle(0, sy(22), sx(142), sy(10), 0x274a58));
      trencadis.add(this.add.arc(0, 0, sx(62), 180, 360, false, 0xf7fbfc, 0.98));
      trencadis.add(this.add.arc(0, 0, sx(48), 180, 360, false, 0xffcb73, 0.18));
      trencadis.add(this.add.rectangle(-sx(34), sy(2), sx(10), sy(20), 0xffffff, 0.24));
      trencadis.add(this.add.rectangle(sx(22), sy(6), sx(16), sy(16), 0x8de7df, 0.24));
      trencadis.add(this.add.rectangle(sx(38), -sy(2), sx(10), sy(10), 0xff8f37, 0.24));
      trencadis.setData("type", "trencadis");
      this.propLayer.add(trencadis);
      this.props.push(trencadis);
    } else {
      for (const x of [sx(200), sx(600), sx(1030)]) {
        const palm = this.add.container(x, sy(352));
        palm.add(this.add.rectangle(0, 0, sx(8), sy(74), 0x5b3d22));
        palm.add(this.add.triangle(0, -sy(52), -sx(30), -sy(12), 0, -sy(78), sx(30), -sy(12), 0x2fbf71));
        palm.add(this.add.triangle(-sx(18), -sy(36), -sx(40), -sy(10), -sx(18), -sy(60), sx(4), -sy(10), 0x39d47a));
        palm.setData("type", "palm");
        palm.setData("baseRotation", 0);
        this.propLayer.add(palm);
        this.props.push(palm);
      }
      for (const x of [sx(304), sx(756), sx(1150)]) {
        const tile = this.add.rectangle(x, sy(342), sx(88), sy(36), 0xf2ead8).setStrokeStyle(3, 0x202126);
        const lineA = this.add.rectangle(x, sy(342), sx(22), sy(8), 0x40d8ff);
        const lineB = this.add.rectangle(x - sx(24), sy(342), sx(14), sy(8), 0xff8b22);
        const lineC = this.add.rectangle(x + sx(24), sy(342), sx(14), sy(8), 0xff8b22);
        this.propLayer.add(tile);
        this.propLayer.add(lineA);
        this.propLayer.add(lineB);
        this.propLayer.add(lineC);
      }
      for (const x of [sx(430), sx(900)]) {
        const banner = this.add.container(x, sy(214));
        const cloth = this.add.rectangle(0, 0, sx(86), sy(18), 0xff8b22).setStrokeStyle(2, 0xf2ead8);
        banner.add(this.add.rectangle(-sx(52), -sy(18), sx(4), sy(40), 0x5b3d22));
        banner.add(this.add.rectangle(sx(52), -sy(18), sx(4), sy(40), 0x5b3d22));
        banner.add(cloth);
        banner.setData("type", "banner");
        banner.setData("cloth", cloth);
        this.propLayer.add(banner);
        this.props.push(banner);
      }
      const kiosk = this.add.container(sx(980), sy(346));
      kiosk.add(this.add.rectangle(0, 0, sx(116), sy(52), 0xf2ead8).setStrokeStyle(3, 0x202126));
      kiosk.add(this.add.rectangle(0, -sy(20), sx(126), sy(10), 0xff8b22));
      kiosk.add(this.add.rectangle(0, sy(6), sx(82), sy(18), 0x40d8ff, 0.12));
      kiosk.add(this.add.rectangle(-sx(26), sy(10), sx(14), sy(22), 0x202126, 0.18));
      kiosk.add(this.add.rectangle(sx(26), sy(10), sx(14), sy(22), 0x202126, 0.18));
      this.propLayer.add(kiosk);
      this.props.push(kiosk);
    }
  }

  createForegroundDepth() {
    this.frontDepthProps = [];
    const shadowBand = this.add.rectangle(WIDTH / 2, GROUND_Y + sy(2), WIDTH, sy(86), 0x0b0c10, 0.12);
    this.frontDepth.add(shadowBand);

    const pushDepth = (container, speedFactor = 0.24) => {
      container.setData("speedFactor", speedFactor);
      this.frontDepth.add(container);
      this.frontDepthProps.push(container);
    };

    if (this.city.key === "valencia") {
      for (const x of [sx(112), sx(1092)]) {
        const palm = this.add.container(x, sy(360));
        palm.add(this.add.rectangle(0, sy(18), sx(10), sy(102), 0x13252c, 0.78));
        palm.add(this.add.triangle(0, -sy(50), -sx(54), sy(8), 0, -sy(96), sx(54), sy(8), 0x163842, 0.66));
        palm.add(this.add.triangle(-sx(26), -sy(26), -sx(62), sy(14), -sx(20), -sy(72), sx(12), sy(12), 0x1b4d57, 0.58));
        palm.add(this.add.triangle(sx(28), -sy(24), -sx(12), sy(14), sx(22), -sy(74), sx(62), sy(12), 0x1b4d57, 0.58));
        pushDepth(palm, 0.2);
      }
      for (const x of [sx(300), sx(724), sx(1188)]) {
        const rail = this.add.container(x, sy(396));
        rail.add(this.add.rectangle(0, 0, sx(124), sy(10), 0x12252e, 0.72));
        rail.add(this.add.rectangle(-sx(36), -sy(8), sx(4), sy(28), 0x183844, 0.7));
        rail.add(this.add.rectangle(sx(36), -sy(8), sx(4), sy(28), 0x183844, 0.7));
        pushDepth(rail, 0.26);
      }
      for (const x of [sx(468), sx(948)]) {
        const lamp = this.add.container(x, sy(374));
        lamp.add(this.add.rectangle(0, sy(8), sx(8), sy(84), 0x102932, 0.76));
        lamp.add(this.add.rectangle(0, -sy(28), sx(28), sy(8), 0x1b4450, 0.72));
        lamp.add(this.add.circle(0, -sy(28), sx(18), 0xffd98a, 0.08));
        pushDepth(lamp, 0.22);
      }
      for (const x of [sx(210), sx(716), sx(1228)]) {
        const mist = this.add.container(x, sy(412));
        mist.add(this.add.ellipse(0, 0, sx(138), sy(18), 0xf4fff9, 0.12));
        mist.add(this.add.ellipse(sx(22), -sy(4), sx(96), sy(12), 0xa7eee6, 0.08));
        pushDepth(mist, 0.16);
      }
    } else if (this.city.key === "roma") {
      for (const x of [sx(178), sx(1080)]) {
        const ruin = this.add.container(x, sy(374));
        ruin.add(this.add.rectangle(0, sy(10), sx(112), sy(84), 0x2b211b, 0.72));
        ruin.add(this.add.arc(0, -sy(18), sx(38), 180, 360, false, 0x3f3128, 0.64));
        ruin.add(this.add.rectangle(-sx(26), sy(0), sx(16), sy(48), 0x1f1814, 0.74));
        ruin.add(this.add.rectangle(sx(26), sy(4), sx(16), sy(44), 0x1f1814, 0.74));
        pushDepth(ruin, 0.22);
      }
    } else if (this.city.key === "paris") {
      for (const x of [sx(156), sx(1120)]) {
        const lamp = this.add.container(x, sy(364));
        lamp.add(this.add.rectangle(0, sy(10), sx(8), sy(102), 0x121625, 0.76));
        lamp.add(this.add.circle(0, -sy(46), sx(12), 0x1e2742, 0.64));
        lamp.add(this.add.circle(0, -sy(46), sx(24), 0x3fdcff, 0.06));
        pushDepth(lamp, 0.2);
      }
    } else if (this.city.key === "venecia") {
      for (const x of [sx(210), sx(1022)]) {
        const post = this.add.container(x, sy(384));
        post.add(this.add.rectangle(0, sy(8), sx(12), sy(76), 0x1a2c35, 0.76));
        post.add(this.add.rectangle(0, -sy(26), sx(16), sy(10), 0x254651, 0.68));
        pushDepth(post, 0.22);
      }
    } else if (this.city.key === "londres") {
      for (const x of [sx(172), sx(1092)]) {
        const rail = this.add.container(x, sy(394));
        rail.add(this.add.rectangle(0, 0, sx(144), sy(12), 0x161a22, 0.78));
        rail.add(this.add.rectangle(-sx(42), -sy(10), sx(4), sy(28), 0x2d3744, 0.74));
        rail.add(this.add.rectangle(sx(42), -sy(10), sx(4), sy(28), 0x2d3744, 0.74));
        pushDepth(rail, 0.24);
      }
    }
  }

  createStreet() {
    const roadTop = this.add.rectangle(WIDTH / 2, GROUND_Y + sy(42), WIDTH, sy(88), this.city.road, 1);
    const curb = this.add.rectangle(WIDTH / 2, GROUND_Y + sy(2), WIDTH, sy(10), 0x15151c);
    const gutter = this.add.rectangle(WIDTH / 2, GROUND_Y + sy(74), WIDTH, sy(12), 0x1a1b20);
    this.foreground.add([roadTop, curb, gutter]);

    if (this.city.key === "venecia") {
      this.foreground.add(this.add.rectangle(WIDTH / 2, GROUND_Y - sy(6), WIDTH, sy(18), 0xeaf6f2, 0.1));
      this.foreground.add(this.add.rectangle(WIDTH / 2, GROUND_Y + sy(12), WIDTH, sy(28), 0x29556a, 0.95));
      for (let i = 0; i < 14; i += 1) {
        const ripple = this.add.rectangle(i * sx(94), GROUND_Y + sy(12), sx(52), sy(4), 0x79e8e0, 0.55);
        this.foreground.add(ripple);
      }
      for (let i = 0; i < 10; i += 1) {
        const reflection = this.add.rectangle(sx(44) + i * sx(132), GROUND_Y + sy(18), sx(30), sy(3), 0xbaf4ea, 0.25);
        this.foreground.add(reflection);
      }
      for (let i = 0; i < 8; i += 1) {
        this.foreground.add(this.add.ellipse(sx(90) + i * sx(164), GROUND_Y + sy(32), sx(74), sy(14), 0x9ee9de, i % 2 ? 0.08 : 0.14));
      }
    } else if (this.city.key === "valencia") {
      this.foreground.add(this.add.rectangle(WIDTH / 2, GROUND_Y - sy(10), WIDTH, sy(24), 0xf7efdd, 0.98));
      this.foreground.add(this.add.rectangle(WIDTH / 2, GROUND_Y - sy(1), WIDTH, sy(6), 0xe6d7bd, 0.88));
      for (let i = 0; i < 16; i += 1) {
        const x = i * sx(92);
        this.foreground.add(this.add.rectangle(x, GROUND_Y - sy(10), sx(74), sy(6), i % 2 === 0 ? 0xff9543 : 0x43d7dc));
        this.foreground.add(this.add.rectangle(x, GROUND_Y - sy(4), sx(28), sy(2), 0xffffff, 0.16));
      }
      this.foreground.add(this.add.rectangle(WIDTH / 2, GROUND_Y + sy(10), WIDTH, sy(20), 0xf0e2c8, 0.34));
      this.foreground.add(this.add.rectangle(WIDTH / 2, GROUND_Y + sy(24), WIDTH, sy(12), 0xffd9a8, 0.14));
      this.foreground.add(this.add.rectangle(WIDTH / 2, GROUND_Y + sy(38), WIDTH, sy(16), 0x74ddd8, 0.11));
      for (let i = 0; i < 12; i += 1) {
        const tileX = sx(34) + i * sx(128);
        this.foreground.add(this.add.rectangle(tileX, GROUND_Y + sy(20), sx(90), sy(18), 0xf7efdd).setStrokeStyle(2, 0x29414e));
        this.foreground.add(this.add.rectangle(tileX, GROUND_Y + sy(20), sx(22), sy(6), 0x42d7dc));
        this.foreground.add(this.add.rectangle(tileX - sx(24), GROUND_Y + sy(20), sx(10), sy(6), 0xff9240));
        this.foreground.add(this.add.rectangle(tileX + sx(24), GROUND_Y + sy(20), sx(10), sy(6), 0xff9240));
      }
      for (let i = 0; i < 8; i += 1) {
        this.foreground.add(this.add.ellipse(sx(96) + i * sx(184), GROUND_Y + sy(28), sx(112), sy(14), 0x88e1de, i % 2 ? 0.08 : 0.13));
        this.foreground.add(this.add.rectangle(sx(92) + i * sx(184), GROUND_Y + sy(24), sx(38), sy(3), 0xf9fffc, i % 2 ? 0.08 : 0.14));
      }
    } else if (this.city.key === "londres") {
      this.foreground.add(this.add.rectangle(WIDTH / 2, GROUND_Y + sy(26), WIDTH, sy(34), 0x7fa6c5, 0.06));
      for (let i = 0; i < 9; i += 1) {
        const stripe = this.add.rectangle(sx(98) + i * sx(118), GROUND_Y + sy(18), sx(42), sy(12), 0xf2ead8, i % 3 === 0 ? 0.94 : 0.78);
        this.foreground.add(stripe);
      }
      this.foreground.add(this.add.rectangle(WIDTH / 2, GROUND_Y + sy(22), WIDTH, sy(28), 0xb8d7ff, 0.06));
      this.foreground.add(this.add.rectangle(WIDTH / 2, GROUND_Y + sy(6), WIDTH, sy(6), 0xe7e0cf, 0.24));
      for (let i = 0; i < 10; i += 1) {
        const puddle = this.add.ellipse(sx(70) + i * sx(128), GROUND_Y + sy(30), sx(58), sy(12), 0xa4c4de, i % 2 ? 0.16 : 0.22);
        this.foreground.add(puddle);
        this.foreground.add(this.add.rectangle(puddle.x - sx(8), puddle.y - sy(1), sx(20), sy(2), 0xeaf5ff, 0.12));
      }
      for (let i = 0; i < 8; i += 1) {
        this.foreground.add(this.add.rectangle(sx(96) + i * sx(164), GROUND_Y + sy(42), sx(78), sy(3), 0xd7e6f4, i % 2 ? 0.06 : 0.11));
      }
    } else if (this.city.key === "roma") {
      for (let i = 0; i < 18; i += 1) {
        const stone = this.add.rectangle(i * sx(82), GROUND_Y + sy(20), sx(58), sy(18), i % 2 === 0 ? 0x8c7d73 : 0x7d6552);
        stone.setStrokeStyle(1, 0x2b221b);
        this.foreground.add(stone);
      }
      this.foreground.add(this.add.rectangle(WIDTH / 2, GROUND_Y + sy(18), WIDTH, sy(16), 0xd6b07a, 0.08));
      this.foreground.add(this.add.rectangle(WIDTH / 2, GROUND_Y + sy(28), WIDTH, sy(10), 0xefe1bb, 0.06));
      for (let i = 0; i < 10; i += 1) {
        this.foreground.add(this.add.rectangle(sx(72) + i * sx(134), GROUND_Y + sy(34), sx(58), sy(4), 0xf4dfb9, i % 2 ? 0.06 : 0.1));
      }
    } else if (this.city.key === "paris") {
      this.foreground.add(this.add.rectangle(WIDTH / 2, GROUND_Y - sy(6), WIDTH, sy(10), 0x2f3340));
      for (let i = 0; i < 10; i += 1) {
        const bulb = this.add.circle(sx(80) + i * sx(122), GROUND_Y - sy(10), sx(5), i % 2 === 0 ? 0x40d8ff : 0xf2ead8, 0.9);
        this.foreground.add(bulb);
      }
      for (let i = 0; i < 7; i += 1) {
        const gloss = this.add.rectangle(sx(120) + i * sx(170), GROUND_Y + sy(24), sx(52), sy(4), 0x6fdff8, 0.12);
        this.foreground.add(gloss);
      }
      this.foreground.add(this.add.rectangle(WIDTH / 2, GROUND_Y + sy(26), WIDTH, sy(22), 0xf2ead8, 0.04));
      for (let i = 0; i < 8; i += 1) {
        this.foreground.add(this.add.rectangle(sx(88) + i * sx(156), GROUND_Y + sy(36), sx(66), sy(3), 0xffd7f3, i % 2 ? 0.05 : 0.1));
      }
    }

    this.trackLines = [];
    for (let i = 0; i < 22; i += 1) {
      const tile = this.add.rectangle(i * sx(66), GROUND_Y + sy(34), sx(62), sy(24), 0x777b82);
      tile.setStrokeStyle(2, 0x22242a);
      this.trackLines.push(tile);
    }
  }

  createAtmosphere() {
    this.weatherProps = [];

    if (this.city.key === "londres") {
      const fog = this.add.rectangle(WIDTH / 2, sy(240), WIDTH, sy(178), 0x9ba7b8, 0.1);
      this.weatherLayer.add(fog);
      this.weatherProps.push({ type: "fog", sprite: fog, speed: 0 });
      const haze = this.add.rectangle(WIDTH / 2, sy(328), WIDTH, sy(92), 0xb3c8dd, 0.06);
      this.weatherLayer.add(haze);
      this.weatherProps.push({ type: "fog", sprite: haze, speed: 0 });
      const cloudBand = this.add.rectangle(WIDTH / 2, sy(118), WIDTH, sy(40), 0xe2e8ef, 0.05);
      this.weatherLayer.add(cloudBand);
      this.weatherProps.push({ type: "fog", sprite: cloudBand, speed: 0 });

      for (let i = 0; i < 60; i += 1) {
        const drop = this.add.rectangle(
          Phaser.Math.Between(0, WIDTH),
          Phaser.Math.Between(sy(80), GROUND_Y),
          sx(3),
          sy(26),
          0xb7d8ff,
          0.42
        );
        drop.setAngle(18);
        this.weatherLayer.add(drop);
        this.weatherProps.push({ type: "rain", sprite: drop, speed: Phaser.Math.Between(240, 340) });
      }
      for (let i = 0; i < 10; i += 1) {
        const puddle = this.add.ellipse(sx(60) + i * sx(126), GROUND_Y + sy(34), sx(54), sy(10), 0xb8d7ff, 0.14);
        this.weatherLayer.add(puddle);
        this.weatherProps.push({ type: "puddle", sprite: puddle, speed: Phaser.Math.Between(10, 18) });
      }
    } else if (this.city.key === "venecia") {
      const glowMist = this.add.rectangle(WIDTH / 2, sy(212), WIDTH, sy(60), 0xe6fff7, 0.05);
      this.weatherLayer.add(glowMist);
      this.weatherProps.push({ type: "fog", sprite: glowMist, speed: 0 });
      for (let i = 0; i < 12; i += 1) {
        const shimmer = this.add.rectangle(i * sx(108), GROUND_Y + sy(10), sx(42), sy(4), 0x79e8e0, 0.35);
        this.weatherLayer.add(shimmer);
        this.weatherProps.push({ type: "shimmer", sprite: shimmer, speed: Phaser.Math.Between(22, 38) });
      }
      for (let i = 0; i < 7; i += 1) {
        const ripple = this.add.ellipse(sx(100) + i * sx(182), GROUND_Y + sy(16), sx(70), sy(8), 0xc4f4ef, 0.08);
        this.weatherLayer.add(ripple);
        this.weatherProps.push({ type: "waterRipple", sprite: ripple, speed: Phaser.Math.Between(8, 16) });
      }
      const mist = this.add.rectangle(WIDTH / 2, sy(296), WIDTH, sy(82), 0xc4f4ef, 0.05);
      this.weatherLayer.add(mist);
      this.weatherProps.push({ type: "fog", sprite: mist, speed: 0 });
    } else if (this.city.key === "valencia") {
      const glow = this.add.circle(sx(1140), sy(96), sx(82), 0xffd95c, 0.18);
      this.weatherLayer.add(glow);
      this.weatherProps.push({ type: "glow", sprite: glow, speed: 8 });
      const heat = this.add.rectangle(WIDTH / 2, sy(138), WIDTH, sy(74), 0xffd38b, 0.05);
      this.weatherLayer.add(heat);
      this.weatherProps.push({ type: "glow", sprite: heat, speed: 3 });
      const seaMist = this.add.rectangle(WIDTH / 2, sy(288), WIDTH, sy(54), 0xf8f0dd, 0.04);
      this.weatherLayer.add(seaMist);
      this.weatherProps.push({ type: "fog", sprite: seaMist, speed: 0 });
      for (let i = 0; i < 6; i += 1) {
        const shimmer = this.add.rectangle(sx(140) + i * sx(210), sy(214), sx(94), sy(10), 0xffd95c, 0.04);
        this.weatherLayer.add(shimmer);
        this.weatherProps.push({ type: "glow", sprite: shimmer, speed: Phaser.Math.Between(4, 10) });
      }
    } else if (this.city.key === "paris") {
      for (let i = 0; i < 8; i += 1) {
        const neonMist = this.add.rectangle(sx(80) + i * sx(170), sy(198), sx(110), sy(20), i % 2 === 0 ? 0x6fdff8 : 0xf2ead8, 0.05);
        this.weatherLayer.add(neonMist);
        this.weatherProps.push({ type: "glow", sprite: neonMist, speed: Phaser.Math.Between(6, 12) });
      }
      const creamMist = this.add.rectangle(WIDTH / 2, sy(274), WIDTH, sy(76), 0xf2ead8, 0.04);
      this.weatherLayer.add(creamMist);
      this.weatherProps.push({ type: "fog", sprite: creamMist, speed: 0 });
      for (let i = 0; i < 6; i += 1) {
        const sparkle = this.add.rectangle(sx(140) + i * sx(216), sy(150) + (i % 2) * sy(18), sx(8), sy(2), 0xffe6f6, 0.18);
        this.weatherLayer.add(sparkle);
        this.weatherProps.push({ type: "glow", sprite: sparkle, speed: Phaser.Math.Between(8, 14) });
      }
    } else if (this.city.key === "roma") {
      const dust = this.add.rectangle(WIDTH / 2, sy(310), WIDTH, sy(56), 0xd6b07a, 0.05);
      this.weatherLayer.add(dust);
      this.weatherProps.push({ type: "fog", sprite: dust, speed: 0 });
      for (let i = 0; i < 8; i += 1) {
        const motes = this.add.rectangle(Phaser.Math.Between(0, WIDTH), Phaser.Math.Between(sy(170), GROUND_Y), sx(6), sy(2), 0xe4bf89, 0.16);
        this.weatherLayer.add(motes);
        this.weatherProps.push({ type: "glow", sprite: motes, speed: Phaser.Math.Between(8, 16) });
      }
    }
  }

  createColorGrade() {
    const overlay = (x, y, w, h, color, alpha = 0.1) => this.gradeLayer.add(this.add.ellipse(x, y, w, h, color, alpha));
    const frame = (x, y, w, h, color, alpha = 0.16) => this.gradeLayer.add(this.add.rectangle(x, y, w, h, color, alpha));
    const vignette = (x, y, w, h, color, alpha = 0.14) => this.gradeLayer.add(this.add.ellipse(x, y, w, h, color, alpha));

    vignette(sx(40), HEIGHT / 2, sx(240), HEIGHT, 0x090a0f, 0.16);
    vignette(WIDTH - sx(40), HEIGHT / 2, sx(240), HEIGHT, 0x090a0f, 0.16);
    this.gradeLayer.add(this.add.rectangle(WIDTH / 2, sy(36), WIDTH, sy(72), 0x0a0c11, 0.08));
    this.gradeLayer.add(this.add.rectangle(WIDTH / 2, HEIGHT - sy(26), WIDTH, sy(54), 0x07090d, 0.14));

    if (this.city.key === "londres") {
      overlay(sx(1180), sy(114), sx(360), sy(220), 0xc79b63, 0.1);
      overlay(sx(150), sy(210), sx(240), sy(420), 0x182231, 0.16);
      overlay(sx(1260), sy(258), sx(260), sy(380), 0x182231, 0.12);
      frame(WIDTH / 2, sy(420), WIDTH, sy(120), 0x0f131a, 0.12);
    } else if (this.city.key === "valencia") {
      overlay(sx(1122), sy(112), sx(520), sy(292), 0xffc06e, 0.18);
      overlay(sx(180), sy(250), sx(300), sy(440), 0x2a7f6f, 0.12);
      overlay(sx(1188), sy(318), sx(320), sy(194), 0xffedd0, 0.1);
      frame(WIDTH / 2, sy(410), WIDTH, sy(130), 0xffa24f, 0.08);
      this.gradeLayer.add(this.add.rectangle(WIDTH / 2, sy(314), WIDTH, sy(30), 0x9ff1ef, 0.06));
      this.gradeLayer.add(this.add.rectangle(WIDTH / 2, sy(176), WIDTH, sy(20), 0xfff4d9, 0.05));
    } else if (this.city.key === "roma") {
      overlay(sx(1080), sy(146), sx(420), sy(240), 0xf0b06c, 0.12);
      overlay(sx(176), sy(250), sx(240), sy(420), 0x5f4032, 0.12);
      frame(WIDTH / 2, sy(414), WIDTH, sy(110), 0x7f5842, 0.08);
    } else if (this.city.key === "paris") {
      overlay(sx(1128), sy(120), sx(360), sy(220), 0xf3c8ff, 0.08);
      overlay(sx(140), sy(214), sx(220), sy(420), 0x201f57, 0.16);
      overlay(sx(1260), sy(244), sx(220), sy(380), 0x1a183d, 0.12);
      frame(WIDTH / 2, sy(410), WIDTH, sy(100), 0x1a1735, 0.12);
    } else if (this.city.key === "venecia") {
      overlay(sx(1120), sy(144), sx(400), sy(220), 0xffddb1, 0.08);
      overlay(sx(160), sy(248), sx(230), sy(420), 0x29515a, 0.14);
      overlay(sx(1260), sy(284), sx(240), sy(320), 0x224147, 0.1);
      frame(WIDTH / 2, sy(418), WIDTH, sy(110), 0x1b3438, 0.1);
    }
  }

  createSpeedLines() {
    this.speedLines = [];
    for (let i = 0; i < 12; i += 1) {
      const line = this.add.rectangle(
        Phaser.Math.Between(sx(160), WIDTH - sx(80)),
        Phaser.Math.Between(sy(120), sy(360)),
        sx(80),
        sy(3),
        0xf2ead8,
        0
      );
      line.setAngle(-8);
      this.speedLayer.add(line);
      this.speedLines.push(line);
    }
  }

  createRunner() {
    this.runner = this.physics.add.sprite(sx(150), GROUND_Y, "runner-small");
    this.runner.setOrigin(0.5, 1);
    this.runner.setCollideWorldBounds(true);
    this.runner.body.setGravityY(1300);
    this.applyRunnerBody();

    this.floor = this.add.rectangle(WIDTH / 2, GROUND_Y + sy(8), WIDTH, sy(24), 0x000000, 0);
    this.physics.add.existing(this.floor, true);
    this.physics.add.collider(this.runner, this.floor);

    this.dust = this.add.particles(0, 0, "dust", {
      speed: { min: 20, max: 90 },
      lifespan: 270,
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.58, end: 0 },
      emitting: false,
    });
  }

  createGroups() {
    this.obstacles = this.physics.add.group({ allowGravity: false, immovable: true });
    this.rewards = this.physics.add.group({ allowGravity: false });
    this.enemies = this.physics.add.group({ allowGravity: false });
    this.playerBullets = this.physics.add.group({ allowGravity: false });
    this.enemyBullets = this.physics.add.group({ allowGravity: false });
    this.crates = this.physics.add.group({ allowGravity: false, immovable: true });
    this.solidBoxes = this.physics.add.group({ allowGravity: false, immovable: true });
    this.prisoners = this.physics.add.group({ allowGravity: false });

    this.physics.add.collider(this.runner, this.solidBoxes);
    this.physics.add.overlap(this.runner, this.obstacles, (_, obstacle) => this.handleObstacleContact(obstacle));
    this.physics.add.overlap(this.runner, this.rewards, (_, reward) => this.collectReward(reward));
    this.physics.add.overlap(this.runner, this.enemyBullets, (_, bullet) => this.handleHit(bullet));
    this.physics.add.overlap(this.runner, this.enemies, (_, enemy) => this.handleEnemyContact(enemy));
    this.physics.add.overlap(this.runner, this.prisoners, (_, prisoner) => this.rescuePrisoner(prisoner));
    this.physics.add.overlap(this.playerBullets, this.enemies, (bullet, enemy) => this.hitEnemy(bullet, enemy));
    this.physics.add.overlap(this.playerBullets, this.crates, (bullet, crate) => this.breakCrate(bullet, crate));
    this.physics.add.collider(this.runner, this.crates, (_, crate) => this.handleCrateTouch(crate));
  }

  createTextPanels() {
    this.stageStampPlate = this.add
      .rectangle(sx(182), sy(102), sx(280), sy(62), 0x12151d, 0.84)
      .setStrokeStyle(sx(3), this.city.highlight, 0.44);
    this.titleText = this.add
      .text(sx(64), sy(92), `${this.city.name.toUpperCase()} STAGE`, {
        fontFamily: '"Press Start 2P"',
        fontSize: `${Math.round(sx(14))}px`,
        color: "#ff8b22",
        align: "left",
        stroke: "#14151c",
        strokeThickness: 6,
      })
      .setOrigin(0, 0.5);

    this.tipText = this.add
      .text(sx(64), sy(116), "MOVE  SHOOT  JUMP  DUCK", {
        fontFamily: "VT323",
        fontSize: `${Math.round(sx(22))}px`,
        color: "#f2ead8",
      })
      .setOrigin(0, 0.5);

    this.feedbackPlate = this.add
      .rectangle(WIDTH / 2, sy(162), sx(628), sy(40), 0x12151d, 0.68)
      .setStrokeStyle(sx(3), this.city.accent, 0.24);

    this.feedbackText = this.add
      .text(WIDTH / 2, sy(162), "Arranca con ritmo, domina la calle y busca la ruta alta", {
        fontFamily: "VT323",
        fontSize: `${Math.round(sx(22))}px`,
        color: "#ffd95c",
      })
      .setOrigin(0.5);

    this.gameOverText = this.add
      .text(WIDTH / 2, sy(150), "", {
        fontFamily: '"Press Start 2P"',
        fontSize: `${Math.round(sx(27))}px`,
        color: "#ff365f",
        align: "center",
        stroke: "#14151c",
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.comboBurst = this.add
      .text(WIDTH / 2, sy(248), "", {
        fontFamily: '"Press Start 2P"',
        fontSize: `${Math.round(sx(12))}px`,
        color: "#40d8ff",
        stroke: "#14151c",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: [this.stageStampPlate, this.titleText, this.tipText],
      alpha: 0,
      delay: 2200,
      duration: 720,
      ease: "Sine.InOut",
    });

    this.tweens.add({
      targets: [this.feedbackPlate, this.feedbackText],
      alpha: 0,
      delay: 3000,
      duration: 900,
      ease: "Sine.InOut",
    });

    this.damageOverlay = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0xff365f, 0).setDepth(2000);

    this.bossHudGlow = this.add.rectangle(WIDTH / 2, sy(80), sx(548), sy(48), this.city.accent, 0.12).setVisible(false);
    this.bossBarShell = this.add
      .rectangle(WIDTH / 2, sy(82), sx(446), sy(32), 0x111218, 0.96)
      .setStrokeStyle(4, 0xf2ead8)
      .setVisible(false);
    this.bossBarFrame = this.add
      .rectangle(WIDTH / 2 + sx(16), sy(82), sx(388), sy(18), 0x1d2129, 0.98)
      .setStrokeStyle(3, 0x000000)
      .setVisible(false);
    this.bossBarUnder = this.add.rectangle(WIDTH / 2 + sx(16), sy(82), sx(372), sy(8), this.city.shadow, 0.55).setVisible(false);
    this.bossBarFill = this.add.rectangle(WIDTH / 2 + sx(16), sy(82), sx(372), sy(10), this.city.accent).setVisible(false);
    this.bossBarShine = this.add.rectangle(WIDTH / 2 + sx(16), sy(78), sx(372), sy(3), this.city.highlight, 0.3).setVisible(false);
    this.bossPortraitFrame = this.add
      .rectangle(WIDTH / 2 - sx(204), sy(82), sx(48), sy(48), 0x111218, 0.96)
      .setStrokeStyle(4, this.city.highlight)
      .setVisible(false);
    this.bossPortrait = this.add.image(WIDTH / 2 - sx(204), sy(82), "enemy-shooter-idle").setScale(0.44).setVisible(false);
    this.bossNameText = this.add
      .text(WIDTH / 2 + sx(18), sy(52), "", {
        fontFamily: '"Press Start 2P"',
        fontSize: `${Math.round(sx(13))}px`,
        color: "#ffd95c",
        stroke: "#14151c",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setVisible(false);
    this.bossPhaseText = this.add
      .text(WIDTH / 2 + sx(185), sy(52), "PHASE 1", {
        fontFamily: '"Press Start 2P"',
        fontSize: `${Math.round(sx(8))}px`,
        color: "#40d8ff",
        stroke: "#14151c",
        strokeThickness: 5,
      })
      .setOrigin(1, 0.5)
      .setVisible(false);
  }

  registerInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      shoot: Phaser.Input.Keyboard.KeyCodes.J,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      restart: Phaser.Input.Keyboard.KeyCodes.R,
      menu: Phaser.Input.Keyboard.KeyCodes.ESC,
    });
    this.input.on("pointerdown", (pointer) => {
      if (this.isGameOver) {
        this.scene.restart({ cityKey: this.city.key });
        return;
      }
      if (pointer.y > HEIGHT * 0.62) {
        this.setDucking(true);
      } else {
        this.tryJump();
      }
    });
    this.input.on("pointerup", () => this.setDucking(false));
    this.handleWindowBlur = () => this.resetTransientInput();
    this.handleVisibilityChange = () => {
      if (document.hidden) {
        this.resetTransientInput();
      }
    };
    this.handleKeyDown = (event) => {
      if (event.repeat) {
        return;
      }
      switch (event.code) {
        case "ArrowLeft":
        case "KeyA":
          this.keyboardState.left = true;
          break;
        case "ArrowRight":
        case "KeyD":
          this.keyboardState.right = true;
          break;
        case "ArrowDown":
        case "KeyS":
          this.keyboardState.down = true;
          break;
        case "ArrowUp":
        case "Space":
          this.keyboardState.jumpQueued = true;
          break;
        case "KeyJ":
          this.keyboardState.shoot = true;
          break;
        case "KeyR":
          this.keyboardState.restartQueued = true;
          break;
        case "Escape":
          this.keyboardState.menuQueued = true;
          break;
        default:
          break;
      }
    };
    this.handleKeyUp = (event) => {
      switch (event.code) {
        case "ArrowLeft":
        case "KeyA":
          this.keyboardState.left = false;
          break;
        case "ArrowRight":
        case "KeyD":
          this.keyboardState.right = false;
          break;
        case "ArrowDown":
        case "KeyS":
          this.keyboardState.down = false;
          break;
        case "KeyJ":
          this.keyboardState.shoot = false;
          break;
        default:
          break;
      }
    };
    this.handleWindowPointerUp = () => this.resetTouchInputOnly();
    this.handleWindowPointerCancel = () => this.resetTouchInputOnly();
    window.addEventListener("blur", this.handleWindowBlur);
    window.addEventListener("keydown", this.handleKeyDown, true);
    window.addEventListener("keyup", this.handleKeyUp, true);
    window.addEventListener("pointerup", this.handleWindowPointerUp, true);
    window.addEventListener("pointercancel", this.handleWindowPointerCancel, true);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);

    const touchUiEnabled =
      document.body.classList.contains("mobile-portrait") ||
      globalThis.matchMedia?.("(pointer: coarse)")?.matches ||
      globalThis.matchMedia?.("(hover: none)")?.matches;

    if (!touchUiEnabled) {
      return;
    }

    const setTouch = (action, active) => {
      if (action === "jump") {
        if (active) {
          this.touchJumpQueued = true;
        }
        this.touchState.jump = active;
        return;
      }
      this.touchState[action] = active;
    };

    touchButtons.forEach((button) => {
      const action = button.dataset.touch;
      if (!action) {
        return;
      }

      const activate = (event) => {
        event.preventDefault();
        this.resetTouchInputOnly();
        setTouch(action, true);
        button.classList.add("is-active");
        if (button.setPointerCapture && typeof event.pointerId === "number") {
          try {
            button.setPointerCapture(event.pointerId);
          } catch {
            // Ignore browsers that reject pointer capture on these controls.
          }
        }
      };

      const deactivate = (event) => {
        event.preventDefault();
        setTouch(action, false);
        button.classList.remove("is-active");
        if (button.releasePointerCapture && typeof event.pointerId === "number") {
          try {
            button.releasePointerCapture(event.pointerId);
          } catch {
            // Ignore browsers that reject pointer capture release.
          }
        }
      };

      const handleLeave = (event) => {
        if (event.pointerType === "mouse") {
          deactivate(event);
        }
      };

      button.addEventListener("pointerdown", activate);
      button.addEventListener("pointerup", deactivate);
      button.addEventListener("pointercancel", deactivate);
      button.addEventListener("pointerleave", handleLeave);
      button.addEventListener("lostpointercapture", deactivate);
      this.boundTouchButtons.push({ button, activate, deactivate, handleLeave });
    });
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;

    if (this.demoMode && (this.input.activePointer.isDown || this.input.keyboard.checkDown(this.keys.space, 0) || this.input.keyboard.checkDown(this.keys.right, 0))) {
      this.scene.start("MenuScene");
      return;
    }

    if (this.keyboardState.restartQueued || Phaser.Input.Keyboard.JustDown(this.keys.restart)) {
      this.keyboardState.restartQueued = false;
      this.scene.restart({ cityKey: this.city.key });
      return;
    }

    if (this.keyboardState.menuQueued || Phaser.Input.Keyboard.JustDown(this.keys.menu)) {
      this.keyboardState.menuQueued = false;
      this.scene.start("MenuScene");
      return;
    }

    if (this.isGameOver) {
      return;
    }

    if (this.weapon === "Outfit" && time >= this.superOutfitUntil) {
      this.weapon = "Pistol";
    }

    this.updatePlayerInput(time);
    this.updateEnemyAI(time, deltaSeconds);
    const distanceAdvance = Math.max(0, this.scrollSpeed * deltaSeconds);
    const scoreAdvance = distanceAdvance * (1 + Math.max(0, this.combo - 1) * 0.12);
    this.score += scoreAdvance * 0.18;
    this.stageDistance = Math.min(this.stageLength, this.stageDistance + distanceAdvance);
    this.spawnTimer += delta;
    this.rewardTimer += delta;
    this.enemyTimer += delta;
    this.crateTimer += delta;
    this.platformTimer += delta;

    if (this.keys.shoot.isDown || this.touchState.shoot) {
      this.shoot(time);
    }

    if (this.isRunnerBelowPlayableLane() || this.runner.body.bottom > HEIGHT + sy(40) || this.runner.y > HEIGHT + sy(24)) {
      this.rescueRunnerFromVoid();
    }

    this.updateMissionPhase();
    this.processStageScript();

    if (this.crateTimer > this.nextCrate && this.stageDistance < this.stageLength - 1600) {
      this.spawnCrate();
      this.crateTimer = 0;
      this.nextCrate = this.getDirectorDelay("crate");
    }

    if (this.platformTimer > this.nextPlatform && this.stageDistance < this.stageLength - 1800 && this.solidBoxes.countActive(true) < 18) {
      this.spawnSolidBox();
      this.platformTimer = 0;
      this.nextPlatform = this.getDirectorDelay("platform");
    }

    if (this.spawnTimer > this.nextObstacle && this.canSpawnThreat("obstacle")) {
      this.spawnObstacle();
      this.spawnTimer = 0;
      this.nextObstacle = this.getDirectorDelay("obstacle");
    }

    if (this.rewardTimer > this.nextReward && this.stageDistance < this.stageLength - 1600 && this.rewards.countActive(true) < 2) {
      this.spawnReward();
      this.rewardTimer = 0;
      this.nextReward = this.getDirectorDelay("reward");
    }

    if (
      this.stageDistance >= this.stageLength &&
      this.enemies.countActive(true) === 0 &&
      !this.activeBoss &&
      !this.victoryText
    ) {
      this.completeMission();
    }

    this.moveWorld(deltaSeconds);
    this.recycleObjects();
    this.updateLandingFeedback();
    this.animateRunner(time);
    this.updateBossHud();
    this.syncHud();
  }

  updatePlayerInput(time) {
    const onGround = this.runner.body.onFloor?.() || this.runner.body.blocked.down || this.runner.body.touching.down;
    const groundedForDuck = onGround || Math.abs(this.runner.body.bottom - GROUND_Y) <= sy(16);
    const nearestObstacle = this.getNearestObstacleAhead();
    const nearestEnemy = this.getNearestEnemyAhead();
    const demoJump = this.demoMode && onGround && nearestObstacle && nearestObstacle.distance < sx(180);
    const left = !this.demoMode && (this.keyboardState.left || this.touchState.left);
    const rightPressed = this.keyboardState.right;
    const right = this.demoMode || rightPressed || this.touchState.right;
    const down = !this.demoMode && (this.keyboardState.down || this.touchState.down);
    const rightTapped = rightPressed && time - this.lastRightTapAt > 0 && time - this.lastRightTapAt < 280;
    const paceBoost = this.getDifficultyRamp() * 70;
    const touchJump = this.touchJumpQueued || this.keyboardState.jumpQueued;

    if (demoJump || touchJump) {
      this.jumpBufferUntil = time + 180;
      if (!onGround && time >= this.coyoteUntil) {
        this.tryAirJump(time);
      }
    }
    this.touchJumpQueued = false;
    this.keyboardState.jumpQueued = false;

    if (rightPressed && !this.prevRightPressedAtInput) {
      if (time - this.lastRightTapAt < 280) {
        this.sprintUntil = time + 950;
        this.showFeedback("SPRINT KAMUABU!");
      }
      this.lastRightTapAt = time;
    }
    this.prevRightPressedAtInput = rightPressed;

    if (onGround) {
      this.coyoteUntil = time + 145;
      this.lastGroundedAt = time;
      this.airJumpsUsed = 0;
    }

    this.setDucking(down && groundedForDuck);
    this.tryBufferedJump(time);

    const movingForward = right;
    const isScootering = time < this.scooterUntil && movingForward && !this.isDucking;
    const isTurbo = time < this.turboUntil && movingForward && !this.isDucking;
    const isSprinting = (time < this.sprintUntil || isTurbo) && movingForward && !this.isDucking;
    const moveSpeed = this.isDucking
      ? 120
      : isScootering
        ? 510 + paceBoost * 0.55
      : isTurbo
        ? 430 + paceBoost * 0.45
        : isSprinting
          ? 360 + paceBoost * 0.35
          : 235 + paceBoost * 0.22;
    this.scrollSpeed = 0;
    if (left && !(rightPressed || this.touchState.right)) {
      this.runner.setVelocityX(-moveSpeed);
      this.runner.setFlipX(true);
    } else if (movingForward && !left) {
      this.runner.setVelocityX(moveSpeed);
      this.runner.setFlipX(false);
    } else {
      this.runner.setVelocityX(0);
    }

    if (movingForward && this.runner.x > sx(420) && this.stageDistance < this.stageLength) {
      this.scrollSpeed = moveSpeed + (isScootering ? 176 : isTurbo ? 138 : isSprinting ? 88 : 42) + paceBoost;
      this.runner.x = sx(420);
    }

    this.runner.x = Phaser.Math.Clamp(this.runner.x, sx(84), sx(520));

    if (onGround && Math.abs(this.runner.body.velocity.x) > 20 && time % 130 < 20) {
      this.dust.emitParticleAt(this.runner.x - sx(26), GROUND_Y - sy(8), 1);
    }

    if (this.demoMode && nearestEnemy && nearestEnemy.distance < sx(420) && time - this.lastShotAt > 180) {
      this.shoot(time);
    }
  }

  getNearestObstacleAhead() {
    let nearest = null;
    this.obstacles.children.each((obstacle) => {
      if (!obstacle.active) {
        return;
      }
      const distance = obstacle.x - this.runner.x;
      if (distance > 0 && (!nearest || distance < nearest.distance)) {
        nearest = { obstacle, distance };
      }
    });
    return nearest;
  }

  getNearestEnemyAhead() {
    let nearest = null;
    this.enemies.children.each((enemy) => {
      if (!enemy.active) {
        return;
      }
      const distance = enemy.x - this.runner.x;
      if (distance > 0 && (!nearest || distance < nearest.distance)) {
        nearest = { enemy, distance };
      }
    });
    return nearest;
  }

  tryJump() {
    if (this.isDucking) {
      return;
    }

    if (this.runner.body.blocked.down || this.runner.body.touching.down || this.time.now < this.coyoteUntil) {
      this.runner.setVelocityY(this.isPowered ? -715 : -668);
      arcadeAudio.playSfx("jump");
      this.coyoteUntil = 0;
      this.jumpBufferUntil = 0;
      this.runner.setAngle(-7);
      this.dust.emitParticleAt(this.runner.x - 22, GROUND_Y - 8, 6);
      this.tweens.add({
        targets: this.runner,
        angle: 0,
        duration: 260,
        ease: "Back.Out",
      });
    }
  }

  tryAirJump(time) {
    if (this.isDucking || this.airJumpsUsed >= this.maxAirJumps) {
      return;
    }

    this.airJumpsUsed += 1;
    this.jumpBufferUntil = 0;
    this.runner.setVelocityY(this.isPowered ? -810 : -760);
    arcadeAudio.playSfx("jump");
    this.runner.setAngle(this.runner.flipX ? 12 : -12);
    this.dust.emitParticleAt(this.runner.x, this.runner.y - 48, 9);
    this.floatText("x2 JUMP", this.runner.x + 42, this.runner.y - 92, "#40d8ff");
    this.tweens.add({
      targets: this.runner,
      angle: 0,
      duration: 310,
      ease: "Back.Out",
    });
  }

  tryBufferedJump(time) {
    if (time < this.jumpBufferUntil && !this.isDucking && time < this.coyoteUntil) {
      this.tryJump();
    }
  }

  updateLandingFeedback() {
    const onGround = this.runner.body.onFloor?.() || this.runner.body.blocked.down || this.runner.body.touching.down;
    if (onGround && this.runner.y <= GROUND_Y + sy(10)) {
      this.lastSafeRunnerX = this.runner.x;
      this.lastSafeRunnerY = GROUND_Y;
    }
    if (onGround && !this.prevRunnerOnGround && this.runner.body.velocity.y > sy(120)) {
      const hardLanding = this.runner.body.velocity.y > sy(420);
      this.dust.emitParticleAt(this.runner.x - sx(12), GROUND_Y - sy(6), hardLanding ? 10 : 5);
      this.cameras.main.shake(hardLanding ? 90 : 45, hardLanding ? 0.0024 : 0.0012);
    }
    this.prevRunnerOnGround = onGround;
  }

  rescueRunnerFromVoid() {
    if (!this.runner || this.isGameOver) {
      return;
    }
    this.resetTransientInput();
    this.isDucking = false;
    const safeX = Phaser.Math.Clamp(this.lastSafeRunnerX || sx(150), sx(110), sx(420));
    const safeY = GROUND_Y;
    this.runner.setPosition(safeX, safeY);
    this.applyRunnerBodyConfig(this.getRunnerBodyConfig(this.isPowered, false), { preserveFeet: false });
    this.runner.setVelocity(0, 0);
    this.runner.body.updateFromGameObject();
    this.invulnerableUntil = Math.max(this.invulnerableUntil, this.time.now + 700);
    this.floatText("RECOVERY", this.runner.x + sx(42), this.runner.y - sy(90), "#40d8ff");
  }

  isRunnerBelowPlayableLane() {
    if (!this.runner?.body) {
      return false;
    }

    const onGround = this.runner.body.onFloor?.() || this.runner.body.blocked.down || this.runner.body.touching.down;
    return onGround && this.runner.y > GROUND_Y + sy(26);
  }

  setDucking(value) {
    if (this.isGameOver || !this.runner) {
      return;
    }
    if (!value && this.isDucking && !this.canStandUp()) {
      return;
    }
    if (this.isDucking === value) {
      return;
    }
    this.isDucking = value;
    this.applyRunnerBody();
  }

  getRunnerBodyConfig(powered = this.isPowered, ducking = this.isDucking) {
    if (ducking) {
      if (powered) {
        return {
          texture: "runner-big-duck",
          bodyWidth: 44,
          bodyHeight: 34,
          offsetX: 36,
          offsetY: 90,
          scaleX: 0.94,
          scaleY: 0.94,
        };
      }
      return {
        texture: "runner-duck",
        bodyWidth: 54,
        bodyHeight: 34,
        offsetX: 18,
        offsetY: 54,
        scaleX: 0.84,
        scaleY: 0.84,
      };
    }

    if (powered) {
      return {
        texture: "runner-big",
        bodyWidth: 54,
        bodyHeight: 102,
        offsetX: 33,
        offsetY: 22,
        scaleX: 0.94,
        scaleY: 0.94,
      };
    }

    return {
      texture: "runner-small",
      bodyWidth: 42,
      bodyHeight: 72,
      offsetX: 26,
      offsetY: 16,
      scaleX: 0.84,
      scaleY: 0.84,
    };
  }

  applyRunnerBodyConfig(config, options = {}) {
    const preserveFeet = options.preserveFeet !== false;
    const previousBottom = preserveFeet && this.runner?.body ? this.runner.body.bottom : null;
    this.runner.setTexture(config.texture);
    this.runner.body.setSize(config.bodyWidth, config.bodyHeight);
    this.runner.body.setOffset(config.offsetX, config.offsetY);
    this.runner.setScale(config.scaleX, config.scaleY);
    this.runner.body.updateFromGameObject();
    if (previousBottom !== null && Number.isFinite(previousBottom)) {
      const deltaY = previousBottom - this.runner.body.bottom;
      if (deltaY !== 0) {
        this.runner.y += deltaY;
        this.runner.body.updateFromGameObject();
      }
    }
  }

  canStandUp() {
    if (!this.runner || !this.isDucking) {
      return true;
    }

    const duckConfig = this.getRunnerBodyConfig(this.isPowered, true);
    const standConfig = this.getRunnerBodyConfig(this.isPowered, false);
    const originalX = this.runner.x;
    const originalY = this.runner.y;
    const originalVelocityX = this.runner.body.velocity.x;
    const originalVelocityY = this.runner.body.velocity.y;

    this.applyRunnerBodyConfig(standConfig);
    const blocked =
      this.physics.world.overlap(this.runner, this.solidBoxes) ||
      this.physics.world.overlap(this.runner, this.crates);
    this.applyRunnerBodyConfig(duckConfig);
    this.runner.setPosition(originalX, originalY);
    this.runner.body.setVelocity(originalVelocityX, originalVelocityY);
    this.runner.body.updateFromGameObject();
    return !blocked;
  }

  applyRunnerBody() {
    if (!this.runner) {
      return;
    }
    this.applyRunnerBodyConfig(this.getRunnerBodyConfig());
  }

  updateMissionPhase() {
    const progress = this.stageDistance / this.stageLength;
    const nextPhase =
      progress < 0.08
        ? "intro"
        : progress < 0.2
          ? "warmup"
          : progress < 0.38
            ? "patrol"
            : progress < 0.56
              ? "chase"
              : progress < 0.76
                ? "assault"
                : progress < 0.92
                  ? "chaos"
                  : "final";

    if (nextPhase !== this.missionPhase) {
      this.missionPhase = nextPhase;
      const labels = {
        warmup: "Empieza la persecucion: aprende el ritmo y no regales golpes",
        patrol: "Patrulla enemiga: controla la distancia y dispara",
        chase: "La ciudad despierta: mas runners, mas fuego, mas velocidad",
        assault: "Asalto urbano: mezcla saltos, cajas y disparos",
        chaos: "Caos total: aguanta la presion y toma riesgos",
        final: "Ultimos metros: aguanta y remata la mision",
      };
      if (labels[nextPhase]) {
        this.showFeedback(labels[nextPhase]);
      }
    }

    const milestone = Math.floor(progress * 10);
    if (milestone !== this.lastMilestone && milestone > 0 && milestone < 10) {
      this.lastMilestone = milestone;
      if (milestone % 2 === 0) {
        this.floatText(`CHECK ${milestone * 10}%`, this.runner.x + sx(90), this.runner.y - sy(120), "#ffd95c");
      }
    }
  }

  getDifficultyRamp() {
    const progress = Phaser.Math.Clamp(this.stageDistance / this.stageLength, 0, 1);
    return Phaser.Math.Easing.Cubic.In(progress);
  }

  buildStageScript() {
    const script = [
      { distance: 280, kind: "reward", key: "socks", y: sy(300) },
      {
        distance: 520,
        kind: "platformPattern",
        pattern: [[1], [1], [2], [2], [3]],
        reward: "socks",
        secretRewards: [{ column: 4, level: 4, key: "shirt" }],
      },
      { distance: 700, kind: "crateLine", count: 2 },
      { distance: 860, kind: "enemyWave", types: ["sprinter"] },
      { distance: 1180, kind: "obstacleLine", keys: ["barrel"] },
      {
        distance: 1560,
        kind: "platformPattern",
        pattern: [[1], [2], [3], [2], [1], [1]],
        reward: "shirt",
        secretRewards: [{ column: 2, level: 4, key: "socks" }],
      },
      { distance: 2100, kind: "enemyWave", types: ["sprinter", "shooter"], spacing: sx(148) },
      { distance: 2320, kind: "crateLine", count: 3 },
      { distance: 2640, kind: "rewardBurst", keys: ["socks", "socks", "shoe"] },
      {
        distance: 2920,
        kind: "platformPattern",
        pattern: [[1], [1, 3], [2], [2, 4], [1], [3]],
        reward: "socks",
        secretRewards: [{ column: 5, level: 4, key: "shoe" }],
      },
      { distance: 3200, kind: "enemyWave", types: ["bruiser"], spacing: sx(150) },
      { distance: 4200, kind: "specialEvent", eventType: "openingSetPiece" },
      { distance: 5200, kind: "scooterDrop" },
      { distance: 6400, kind: "scooterDrop" },
    ];

    script.push(...this.buildCitySignatureScript());

    if (this.city.key === "londres") {
      script.push(
        { distance: 7600, kind: "specialEvent", eventType: "londonBridgeRush" },
        { distance: 18400, kind: "specialEvent", eventType: "londonCrossfire" },
        { distance: 33800, kind: "specialEvent", eventType: "londonBusLane" },
        { distance: 61200, kind: "specialEvent", eventType: "londonFinale" }
      );
    }

    for (let marker = 3600; marker < this.stageLength - 2600; marker += 1180) {
      const pattern = Math.floor(marker / 1180) % 7;
      if (pattern === 0) {
        script.push({
          distance: marker,
          kind: "platformPattern",
          pattern: [[1], [2], [3], [3], [2], [1]],
          reward: "socks",
          secretRewards: [{ column: 3, level: 4, key: "shirt" }],
        });
        script.push({ distance: marker + 260, kind: "enemyWave", types: ["sprinter", "sprinter"] });
      } else if (pattern === 1) {
        script.push({ distance: marker, kind: "obstacleLine", keys: ["barrel", "barricade"] });
        script.push({ distance: marker + 220, kind: "crateLine", count: 2 });
        script.push({ distance: marker + 480, kind: "enemyWave", types: ["shooter", "sprinter"] });
      } else if (pattern === 2) {
        script.push({
          distance: marker,
          kind: "platformPattern",
          pattern: [[1], [1, 2], [2, 3], [3], [2], [1]],
          reward: "shoe",
          secretRewards: [{ column: 2, level: 4, key: "socks" }, { column: 5, level: 3, key: "socks" }],
        });
        script.push({ distance: marker + 320, kind: "rewardBurst", keys: ["socks", "shirt"] });
        script.push({ distance: marker + 500, kind: "enemyWave", types: ["bruiser"] });
      } else if (pattern === 3) {
        script.push({ distance: marker, kind: "enemyWave", types: ["sprinter", "shooter", "sprinter"] });
        script.push({
          distance: marker + 240,
          kind: "platformPattern",
          pattern: [[1], [1], [3], [3], [1], [1]],
          reward: "socks",
          secretRewards: [{ column: 2, level: 4, key: "shoe" }],
        });
      } else if (pattern === 4) {
        script.push({
          distance: marker,
          kind: "platformPattern",
          pattern: [[2], [2], [1], [1], [3], [3], [2]],
          reward: "socks",
          secretRewards: [{ column: 4, level: 4, key: "shirt" }],
        });
        script.push({ distance: marker + 340, kind: "enemyWave", types: ["shooter", "bruiser"], spacing: sx(170) });
        script.push({ distance: marker + 680, kind: "obstacleLine", keys: ["barrel", "barrel"] });
      } else if (pattern === 5) {
        script.push({ distance: marker, kind: "crateLine", count: 3 });
        script.push({
          distance: marker + 180,
          kind: "platformPattern",
          pattern: [[1], [2], [2], [3], [4]],
          reward: "shirt",
          secretRewards: [{ column: 4, level: 5, key: "shoe" }],
        });
        script.push({ distance: marker + 520, kind: "enemyWave", types: ["sprinter", "sprinter", "shooter"], spacing: sx(136) });
      } else {
        script.push({ distance: marker, kind: "obstacleLine", keys: ["barrel", "drone"] });
        script.push({
          distance: marker + 240,
          kind: "platformPattern",
          pattern: [[1], [1, 3], [2], [2, 4], [3], [1]],
          reward: "socks",
          secretRewards: [{ column: 3, level: 5, key: "shirt" }],
        });
        script.push({ distance: marker + 620, kind: "rewardBurst", keys: ["socks", "socks"] });
        script.push({ distance: marker + 780, kind: "enemyWave", types: ["bruiser", "shooter"] });
      }
    }

    script.push(
      { distance: 12800, kind: "specialEvent", eventType: "platformRush" },
      { distance: 16800, kind: "scooterDrop" },
      { distance: 24600, kind: "specialEvent", eventType: "pursuit" },
      { distance: 28400, kind: "scooterDrop" },
      { distance: Math.floor(this.stageLength * 0.5) - 3200, kind: "specialEvent", eventType: "midBossApproach" },
      { distance: Math.floor(this.stageLength * 0.5), kind: "midBossSpawn" },
      { distance: 38200, kind: "specialEvent", eventType: "droneStorm" },
      { distance: 42800, kind: "scooterDrop" },
      { distance: 51800, kind: "specialEvent", eventType: "rainShift" },
      { distance: 65400, kind: "scooterDrop" },
      { distance: this.stageLength - 7200, kind: "specialEvent", eventType: "finalBossApproach" },
      { distance: this.stageLength - 2600, kind: "bossSpawn" },
    );

    return script.sort((a, b) => a.distance - b.distance);
  }

  buildCitySignatureScript() {
    const signatures = {
      valencia: [
        {
          distance: 9800,
          kind: "platformPattern",
          pattern: [[1], [2], [3], [4], [4], [3], [2], [1]],
          reward: "shoe",
          secretRewards: [{ column: 4, level: 6, key: "outfit" }],
        },
        { distance: 10480, kind: "enemyWave", types: ["sprinter", "sprinter", "shooter"], spacing: sx(162) },
        { distance: 11200, kind: "crateLine", count: 4 },
        {
          distance: 20100,
          kind: "platformPattern",
          pattern: [[1], [1, 3], [2, 4], [3, 5], [2, 4], [1, 3], [1]],
          reward: "shirt",
          secretRewards: [{ column: 3, level: 6, key: "scooter" }],
        },
        { distance: 20880, kind: "rewardBurst", keys: ["socks", "socks", "shoe", "shirt"] },
      ],
      roma: [
        { distance: 9200, kind: "enemyWave", types: ["bruiser", "sprinter"], spacing: sx(210) },
        {
          distance: 10040,
          kind: "platformPattern",
          pattern: [[1], [2], [2], [3], [3], [2], [2], [1]],
          reward: "shirt",
          secretRewards: [{ column: 6, level: 5, key: "outfit" }],
        },
        { distance: 10840, kind: "obstacleLine", keys: ["barrel", "barricade", "barrel"] },
        {
          distance: 23800,
          kind: "platformPattern",
          pattern: [[2], [3], [4], [4], [3], [2], [1], [1]],
          reward: "shoe",
          secretRewards: [{ column: 2, level: 6, key: "shirt" }],
        },
        { distance: 24660, kind: "enemyWave", types: ["bruiser", "shooter", "bruiser"], spacing: sx(190) },
      ],
      paris: [
        {
          distance: 9500,
          kind: "platformPattern",
          pattern: [[1], [1], [2], [3], [3], [2], [1], [1]],
          reward: "socks",
          secretRewards: [{ column: 4, level: 5, key: "outfit" }],
        },
        { distance: 10340, kind: "enemyWave", types: ["shooter", "sprinter", "shooter"], spacing: sx(176) },
        { distance: 10980, kind: "obstacleLine", keys: ["drone", "barricade"] },
        {
          distance: 22600,
          kind: "platformPattern",
          pattern: [[1], [2], [3], [2], [1], [3], [4], [3]],
          reward: "shirt",
          secretRewards: [{ column: 6, level: 6, key: "shoe" }],
        },
        { distance: 23400, kind: "rewardBurst", keys: ["socks", "shirt", "shoe"] },
      ],
      venecia: [
        {
          distance: 9900,
          kind: "platformPattern",
          pattern: [[1], [2], [3], [4], [3], [2], [1]],
          reward: "shoe",
          secretRewards: [{ column: 3, level: 6, key: "outfit" }],
        },
        { distance: 10780, kind: "enemyWave", types: ["shooter", "shooter"], spacing: sx(188) },
        { distance: 11420, kind: "obstacleLine", keys: ["drone", "drone", "barrel"] },
        {
          distance: 25400,
          kind: "platformPattern",
          pattern: [[2], [3], [4], [5], [4], [3], [2], [1]],
          reward: "shirt",
          secretRewards: [{ column: 4, level: 7, key: "scooter" }],
        },
        { distance: 26280, kind: "rewardBurst", keys: ["socks", "socks", "outfit"] },
      ],
      londres: [
        {
          distance: 12100,
          kind: "platformPattern",
          pattern: [[1], [2], [3], [4], [4], [3], [2], [2], [1]],
          reward: "shoe",
          secretRewards: [{ column: 6, level: 6, key: "outfit" }],
        },
        { distance: 12940, kind: "enemyWave", types: ["shooter", "sprinter", "shooter"], spacing: sx(182) },
        { distance: 13620, kind: "obstacleLine", keys: ["barricade", "drone", "barricade"] },
        {
          distance: 28600,
          kind: "platformPattern",
          pattern: [[2], [3], [4], [4], [3], [2], [3], [4], [3]],
          reward: "shirt",
          secretRewards: [{ column: 7, level: 6, key: "scooter" }],
        },
        { distance: 29520, kind: "crateLine", count: 4 },
        { distance: 30120, kind: "enemyWave", types: ["bruiser", "shooter", "sprinter"], spacing: sx(176) },
      ],
    };

    return signatures[this.city.key] || [];
  }

  processStageScript() {
    while (this.stageEventIndex < this.stageScript.length && this.stageDistance >= this.stageScript[this.stageEventIndex].distance) {
      this.triggerStageEvent(this.stageScript[this.stageEventIndex]);
      this.stageEventIndex += 1;
    }
  }

  triggerStageEvent(event) {
    if (event.kind === "reward") {
      this.spawnRewardItem(WIDTH + sx(180), event.y ?? sy(290), event.key);
      return;
    }

    if (event.kind === "rewardBurst") {
      event.keys.forEach((key, index) => {
        this.spawnRewardItem(WIDTH + sx(170) + index * sx(58), sy(250) + (index % 2) * sy(36), key);
      });
      return;
    }

    if (event.kind === "enemyWave") {
      this.scriptedSectionUntil = Math.max(this.scriptedSectionUntil, this.time.now + 1500);
      const types = event.types ?? Array.from({ length: event.count ?? 1 }, () => "shooter");
      const spacing = event.spacing ?? sx(150);
      for (let i = 0; i < types.length; i += 1) {
        this.spawnEnemyAt(WIDTH + sx(160) + i * spacing, types[i]);
      }
      return;
    }

    if (event.kind === "obstacleLine") {
      this.scriptedSectionUntil = Math.max(this.scriptedSectionUntil, this.time.now + 1200);
      event.keys.forEach((key, index) => {
        this.spawnObstacleAt(key, WIDTH + sx(150) + index * sx(118));
      });
      return;
    }

    if (event.kind === "crateLine") {
      this.scriptedSectionUntil = Math.max(this.scriptedSectionUntil, this.time.now + 1200);
      for (let i = 0; i < event.count; i += 1) {
        this.spawnCrateAt(WIDTH + sx(150) + i * sx(90), GROUND_Y - sy(2));
      }
      return;
    }

    if (event.kind === "platformRow") {
      this.scriptedSectionUntil = Math.max(this.scriptedSectionUntil, this.time.now + 2200);
      this.spawnPlatformLayout({
        startX: WIDTH + sx(180),
        columns: event.columns,
        levels: event.levels,
        reward: event.reward,
      });
      return;
    }

    if (event.kind === "platformStairs") {
      this.scriptedSectionUntil = Math.max(this.scriptedSectionUntil, this.time.now + 2200);
      this.spawnPlatformLayout({
        startX: WIDTH + sx(180),
        columns: event.columns,
        staircase: true,
        reward: event.reward,
      });
      return;
    }

    if (event.kind === "platformTower") {
      this.scriptedSectionUntil = Math.max(this.scriptedSectionUntil, this.time.now + 2200);
      this.spawnPlatformLayout({
        startX: WIDTH + sx(200),
        columns: event.columns,
        towerHeight: event.height,
        reward: event.reward,
      });
      return;
    }

    if (event.kind === "platformPattern") {
      this.scriptedSectionUntil = Math.max(this.scriptedSectionUntil, this.time.now + 2400);
      this.spawnPlatformLayout({
        startX: WIDTH + sx(180),
        pattern: event.pattern,
        reward: event.reward,
        secretRewards: event.secretRewards,
        trailingSupport: event.trailingSupport,
      });
      return;
    }

    if (event.kind === "specialEvent") {
      this.scriptedSectionUntil = Math.max(this.scriptedSectionUntil, this.time.now + 2200);
      this.triggerSpecialEvent(event.eventType);
      return;
    }

    if (event.kind === "scooterDrop") {
      this.spawnRewardItem(WIDTH + sx(220), sy(258), "scooter");
      this.showFeedback("SCOOTER KAMUABU: cogelo y arrasa la avenida");
      return;
    }

    if (event.kind === "midBossSpawn" && !this.midBossSpawned) {
      this.spawnStormMiniBoss();
      return;
    }

    if (event.kind === "bossSpawn" && !this.bossSpawned) {
      this.spawnMiniBoss();
    }
  }

  getMaxEnemies() {
    const progress = this.stageDistance / this.stageLength;
    if (progress < 0.18) {
      return 2;
    }
    if (progress < 0.5) {
      return 3;
    }
    if (progress < 0.8) {
      return 4;
    }
    if (progress < 0.92) {
      return 5;
    }
    return 6;
  }

  canSpawnThreat(type) {
    if (this.activeBoss?.active) {
      return false;
    }

    if (this.stageDistance >= this.stageLength - 850) {
      return false;
    }

    if (this.time.now < this.scriptedSectionUntil) {
      return false;
    }

    const activeObstacles = this.obstacles.countActive(true);
    const activeEnemies = this.enemies.countActive(true);
    const activeBullets = this.enemyBullets.countActive(true);

    if (type === "obstacle") {
      return (
        activeObstacles < 1 &&
        activeEnemies < Math.max(2, this.getMaxEnemies() - 1) &&
        this.time.now - this.lastDamageAt > Math.max(900, 2100 - this.getDifficultyRamp() * 900) &&
        this.time.now - this.lastEnemyAt > Math.max(750, 1300 - this.getDifficultyRamp() * 420) &&
        this.time.now >= this.platformSafeUntil &&
        this.solidBoxes.countActive(true) < 14
      );
    }

    return (
      activeEnemies < this.getMaxEnemies() &&
      activeBullets < 4 + Math.floor(this.getDifficultyRamp() * 3) &&
      this.time.now - this.lastObstacleAt > Math.max(700, 1500 - this.getDifficultyRamp() * 550) &&
      this.time.now >= this.platformSafeUntil &&
      this.solidBoxes.countActive(true) < 18
    );
  }

  getDirectorDelay(type) {
    const ramp = this.getDifficultyRamp();
    const progress = this.stageDistance / this.stageLength;
    const tension =
      progress > 0.9 ? 0.72
      : progress > 0.78 ? 0.82
      : progress > 0.46 ? 0.9
      : 1;
    const cityPace = {
      valencia: { obstacle: 1.08, platform: 0.92, reward: 0.88 },
      roma: { obstacle: 0.95, platform: 1.02, reward: 1.04 },
      paris: { obstacle: 0.98, platform: 0.96, reward: 0.94 },
      venecia: { obstacle: 1.12, platform: 0.86, reward: 0.9 },
      londres: { obstacle: 0.9, platform: 0.98, reward: 1.02 },
    }[this.city.key] || { obstacle: 1, platform: 1, reward: 1 };

    if (type === "obstacle") {
      return Phaser.Math.Between(
        Math.max(900, (6200 - ramp * 3400) * cityPace.obstacle * tension),
        Math.max(1800, (7600 - ramp * 3600) * cityPace.obstacle * tension)
      );
    }
    if (type === "enemy") {
      return Phaser.Math.Between(
        Math.max(650, (2400 - ramp * 1200) * tension),
        Math.max(1000, (3200 - ramp * 1400) * tension)
      );
    }
    if (type === "crate") {
      return Phaser.Math.Between(
        Math.max(1100, (2600 - ramp * 700) * (progress > 0.82 ? 0.88 : 1)),
        Math.max(1800, (3600 - ramp * 850) * (progress > 0.82 ? 0.88 : 1))
      );
    }
    if (type === "platform") {
      return Phaser.Math.Between(
        Math.max(1300, (5200 - ramp * 1800) * cityPace.platform * (progress > 0.76 ? 0.82 : 1)),
        Math.max(2200, (7000 - ramp * 2200) * cityPace.platform * (progress > 0.76 ? 0.82 : 1))
      );
    }
    if (type === "reward") {
      return Phaser.Math.Between(
        Math.max(1200, (2800 - ramp * 700) * cityPace.reward * (progress > 0.78 ? 1.14 : 1)),
        Math.max(1900, (4200 - ramp * 950) * cityPace.reward * (progress > 0.78 ? 1.14 : 1))
      );
    }
    return Phaser.Math.Between(1700, 2600);
  }

  showFeedback(message) {
    this.feedbackText.setText(message).setAlpha(1);
    this.feedbackPlate.setAlpha(1);
    this.tweens.killTweensOf(this.feedbackText);
    this.tweens.killTweensOf(this.feedbackPlate);
    this.tweens.add({
      targets: [this.feedbackText, this.feedbackPlate],
      alpha: 0,
      delay: 1800,
      duration: 700,
      ease: "Sine.InOut",
    });
  }

  triggerSpecialEvent(eventType) {
    if (eventType === "openingSetPiece") {
      const openingText = {
        valencia: "Paseo mediterraneo: salta, sube y encadena premios",
        roma: "Entrada de plaza: columnas, scooters y piedra antigua",
        paris: "Boulevard nocturno: neon, vitrinas y fuego cruzado",
        venecia: "Puente del canal: agua, arcos y altura",
        londres: "Lluvia britanica: cabinas, pasos y visibilidad baja",
      };
      this.showFeedback(openingText[this.city.key] || "Comienza el set piece");
      return;
    }

    if (eventType === "platformRush") {
      this.showFeedback("TRAMO DE PLATAFORMAS: ruta alta y baja, elige bien");
      this.spawnPlatformLayout({
        startX: WIDTH + sx(160),
        pattern: [[1], [2], [3], [3], [2], [1], [1]],
        reward: "shirt",
        secretRewards: [{ column: 3, level: 5, key: "outfit" }],
      });
      this.spawnPlatformLayout({
        startX: WIDTH + sx(760),
        pattern: [[1], [1], [2], [4], [2], [1]],
        reward: "socks",
        secretRewards: [{ column: 3, level: 5, key: "shoe" }],
      });
      return;
    }

    if (eventType === "pursuit") {
      this.showFeedback("PERSECUCION KAMUABU: aguanta la oleada y no frenes");
      ["sprinter", "sprinter", "shooter", "sprinter"].forEach((type, index) => {
        this.spawnEnemyAt(WIDTH + sx(180) + index * sx(132), type);
      });
      return;
    }

    if (eventType === "droneStorm") {
      this.showFeedback("TORMENTA DE DRONES: agachate, dispara y busca hueco");
      ["drone", "drone", "barricade", "drone"].forEach((key, index) => {
        this.spawnObstacleAt(key, WIDTH + sx(160) + index * sx(126));
      });
      this.spawnEnemyAt(WIDTH + sx(620), "shooter");
      return;
    }

    if (eventType === "midBossApproach") {
      this.showFeedback("SUBE LA PRESION: altura, huecos y peligro antes del mini-boss");
      this.spawnPlatformLayout({
        startX: WIDTH + sx(150),
        pattern: [[1], [2], [3], [4], [5], [5], [4], [3], [2]],
        reward: "shirt",
        secretRewards: [{ column: 4, level: 7, key: "laser" }],
        trailingSupport: true,
      });
      this.spawnObstacleAt(this.city.key === "venecia" || this.city.key === "valencia" ? "water-gap" : "lava-gap", WIDTH + sx(930));
      this.spawnPlatformLayout({
        startX: WIDTH + sx(1140),
        pattern: [[2], [3], [4], [5], [4], [3], [2], [1]],
        reward: "socks",
        secretRewards: [{ column: 5, level: 6, key: "rocket" }],
      });
      ["sprinter", "shooter", "sprinter"].forEach((type, index) => {
        this.spawnEnemyAt(WIDTH + sx(1620) + index * sx(158), type);
      });
      return;
    }

    if (eventType === "rainShift") {
      this.weatherBoostUntil = this.time.now + 5200;
      const labels = {
        londres: "RAIN SHIFT: la lluvia aprieta y la calle se vuelve hostil",
        venecia: "MAREA VIVA: el agua brilla y el puente no perdona",
        paris: "NIGHT GLOW: escaparates, neones y visibilidad traicionera",
        roma: "DUST STORM: piedra, polvo y runners resistentes",
        valencia: "SUNSET BLAST: la luz sube, la calle corre contigo",
      };
      this.showFeedback(labels[this.city.key] || "Cambio de atmosfera");
      if (this.city.key === "londres") {
        for (let i = 0; i < 14; i += 1) {
          const drop = this.add.rectangle(
            Phaser.Math.Between(sx(120), WIDTH - sx(120)),
            Phaser.Math.Between(sy(90), GROUND_Y),
            sx(3),
            sy(32),
            0xb7d8ff,
            0.42
          );
          drop.setAngle(18);
          this.weatherLayer.add(drop);
          this.weatherProps.push({ type: "rain", sprite: drop, speed: Phaser.Math.Between(310, 410) });
        }
      }
      return;
    }

    if (eventType === "londonBridgeRush") {
      this.showFeedback("LONDON BRIDGE RUSH: dos alturas, lluvia y runners cerrando");
      this.spawnPlatformLayout({
        startX: WIDTH + sx(160),
        pattern: [[1], [2], [3], [3], [2], [1], [2], [3]],
        reward: "shoe",
        secretRewards: [{ column: 7, level: 5, key: "outfit" }],
      });
      this.spawnEnemyAt(WIDTH + sx(520), "shooter");
      this.spawnEnemyAt(WIDTH + sx(760), "sprinter");
      return;
    }

    if (eventType === "londonCrossfire") {
      this.showFeedback("CROSSFIRE IN THE RAIN: shooter, drones y asfalto britanico");
      ["shooter", "sprinter", "shooter"].forEach((type, index) => {
        this.spawnEnemyAt(WIDTH + sx(180) + index * sx(188), type);
      });
      ["drone", "barricade", "drone", "barricade"].forEach((key, index) => {
        this.spawnObstacleAt(key, WIDTH + sx(220) + index * sx(146));
      });
      return;
    }

    if (eventType === "londonBusLane") {
      this.showFeedback("BUS LANE CHAOS: carril rapido con escalones y blindaje");
      this.spawnPlatformLayout({
        startX: WIDTH + sx(180),
        pattern: [[1], [1], [2], [2], [3], [4], [3], [2], [1]],
        reward: "shirt",
        secretRewards: [{ column: 5, level: 6, key: "scooter" }],
      });
      this.spawnEnemyAt(WIDTH + sx(880), "bruiser");
      this.spawnEnemyAt(WIDTH + sx(1060), "shooter");
      return;
    }

    if (eventType === "londonFinale") {
      this.showFeedback("ROYAL ROAD FINALE: prepara outfit, boss y ultima subida");
      this.spawnPlatformLayout({
        startX: WIDTH + sx(160),
        pattern: [[1], [2], [3], [4], [4], [3], [2], [1]],
        reward: "outfit",
        secretRewards: [{ column: 6, level: 6, key: "shirt" }],
      });
      ["sprinter", "sprinter", "shooter"].forEach((type, index) => {
        this.spawnEnemyAt(WIDTH + sx(620) + index * sx(156), type);
      });
      return;
    }

    if (eventType === "finalBossApproach") {
      const hazardKey = this.city.key === "venecia" || this.city.key === "valencia" ? "water-gap" : "lava-gap";
      this.showFeedback("ULTIMA SUBIDA: menos regalos, mas altura y zona de peligro total");
      this.spawnPlatformLayout({
        startX: WIDTH + sx(140),
        pattern: [[1], [2], [3], [4], [5], [6], [5], [4], [3], [2]],
        reward: "outfit",
        secretRewards: [{ column: 5, level: 8, key: "shirt" }],
        trailingSupport: true,
      });
      this.spawnObstacleAt(hazardKey, WIDTH + sx(1040));
      this.spawnPlatformLayout({
        startX: WIDTH + sx(1270),
        pattern: [[2], [3], [4], [5], [6], [6], [5], [4], [3], [2], [1]],
        reward: "laser",
        secretRewards: [{ column: 8, level: 7, key: "rocket" }],
      });
      ["bruiser", "shooter", "sprinter", "shooter"].forEach((type, index) => {
        this.spawnEnemyAt(WIDTH + sx(1860) + index * sx(168), type);
      });
      ["drone", "barricade", "drone"].forEach((key, index) => {
        this.spawnObstacleAt(key, WIDTH + sx(2480) + index * sx(170));
      });
      return;
    }
  }

  shoot(time) {
    const fireCooldown =
      this.time.now < this.superOutfitUntil
        ? 120
        : this.specialWeapon === "Laser"
          ? 210
          : this.specialWeapon === "Rocket"
            ? 320
            : 145;

    if (time - this.lastShotAt < fireCooldown) {
      return;
    }

    this.lastShotAt = time;
    arcadeAudio.playSfx("shoot");
    const aimUp = this.cursors.up.isDown;
    const direction = this.runner.flipX ? -1 : 1;
    const bulletY = this.isDucking ? this.runner.y - 35 : this.runner.y - 54;

    if (this.time.now >= this.superOutfitUntil && this.specialWeapon === "Laser" && this.specialAmmo > 0) {
      this.fireLaser(time, direction, bulletY, aimUp);
      return;
    }

    if (this.time.now >= this.superOutfitUntil && this.specialWeapon === "Rocket" && this.specialAmmo > 0) {
      this.fireRocket(time, direction, bulletY);
      return;
    }

    const spread =
      this.fireLevel >= 4
        ? [-0.34, -0.12, 0.12, 0.34]
        : this.fireLevel === 3
          ? [-0.22, 0, 0.22]
          : this.fireLevel === 2
            ? [-0.12, 0.12]
            : [0];
    const bulletDamage = this.fireLevel >= 4 || this.time.now < this.superOutfitUntil ? 2 : 1;
    const flashTint = this.fireLevel >= 4 ? 0xffd95c : this.fireLevel >= 2 ? 0xfff2a8 : 0xffffff;
    this.spawnMuzzleFlash(this.runner.x + direction * sx(50), bulletY, direction, flashTint);
    this.spawnSmokePuff(this.runner.x + direction * sx(34), bulletY - sy(2));
    this.spawnShellCase(this.runner.x + direction * sx(12), bulletY + sy(10), direction);
    spread.forEach((offset, index) => {
      const bullet = this.playerBullets.create(this.runner.x + direction * sx(42), bulletY + index * sy(2), "player-bullet");
      bullet.setOrigin(0.5);
      const speedX = aimUp ? direction * 290 : direction * 620;
      const speedY = aimUp ? -520 : 0;
      const angle = aimUp ? Phaser.Math.Angle.Between(0, 0, direction * 290, -520 + offset * 420) : direction < 0 ? Math.PI : 0;
      bullet.setVelocity(speedX, speedY + offset * 420);
      bullet.setData("damage", bulletDamage);
      bullet.setData("born", time);
      bullet.setFlipX(direction < 0);
      bullet.body.setSize(22, 8);
      this.spawnBulletTrail(bullet.x, bullet.y, angle, flashTint, this.fireLevel >= 4 ? 1.15 : 1);
    });

    this.cameras.main.shake(35, 0.0015);
    this.runner.x -= direction * 3;
  }

  fireLaser(time, direction, bulletY, aimUp) {
    this.specialAmmo = Math.max(0, this.specialAmmo - 1);
    const beamColor = 0x40d8ff;
    this.spawnMuzzleFlash(this.runner.x + direction * sx(54), bulletY, direction, beamColor);
    this.spawnSmokePuff(this.runner.x + direction * sx(34), bulletY - sy(4));
    const beam = this.add.rectangle(
      this.runner.x + direction * sx(280),
      bulletY,
      sx(470),
      sy(10),
      beamColor,
      0.62
    ).setOrigin(direction < 0 ? 1 : 0, 0.5);
    beam.setStrokeStyle(sx(3), 0xbff7ff, 0.95);
    this.foreground.add(beam);
    this.tweens.add({
      targets: beam,
      alpha: 0,
      scaleY: 1.6,
      duration: 120,
      ease: "Quad.Out",
      onComplete: () => beam.destroy(),
    });

    const bullet = this.playerBullets.create(this.runner.x + direction * sx(50), bulletY, "player-bullet");
    bullet.setTint(beamColor);
    bullet.setScale(1.35, 0.9);
    bullet.setOrigin(0.5);
    bullet.setVelocity(aimUp ? direction * 340 : direction * 920, aimUp ? -680 : 0);
    bullet.setData("damage", 4);
    bullet.setData("born", time);
    bullet.setData("piercing", true);
    bullet.setData("weaponType", "laser");
    bullet.body.setSize(34, 10);
    const angle = aimUp ? Phaser.Math.Angle.Between(0, 0, direction * 340, -680) : direction < 0 ? Math.PI : 0;
    this.spawnBulletTrail(bullet.x, bullet.y, angle, beamColor, 1.45);
    this.floatText(`LASER ${this.specialAmmo}`, this.runner.x + direction * sx(58), this.runner.y - sy(106), "#40d8ff");
    if (this.specialAmmo <= 0) {
      this.specialWeapon = null;
      this.showFeedback("LASER agotado: vuelves al arsenal base");
    } else {
      this.showFeedback("LASER KAMUABU: atraviesa la calle");
    }
    this.cameras.main.flash(50, 64, 216, 255, false);
    this.cameras.main.shake(70, 0.0028);
  }

  fireRocket(time, direction, bulletY) {
    this.specialAmmo = Math.max(0, this.specialAmmo - 1);
    const rocketTint = 0xff8b22;
    this.spawnMuzzleFlash(this.runner.x + direction * sx(54), bulletY, direction, rocketTint);
    this.spawnSmokePuff(this.runner.x + direction * sx(28), bulletY - sy(2));
    const rocket = this.playerBullets.create(this.runner.x + direction * sx(46), bulletY + sy(2), "rocket");
    rocket.setOrigin(0.5);
    rocket.setFlipX(direction < 0);
    rocket.setVelocity(direction * 430, 0);
    rocket.setData("damage", 5);
    rocket.setData("born", time);
    rocket.setData("weaponType", "rocket");
    rocket.setData("splashRadius", sx(126));
    rocket.setTint(rocketTint);
    rocket.body.setSize(34, 12);
    this.spawnBulletTrail(rocket.x, rocket.y, direction < 0 ? Math.PI : 0, rocketTint, 1.15);
    this.floatText(`ROCKET ${this.specialAmmo}`, this.runner.x + direction * sx(58), this.runner.y - sy(106), "#ff8b22");
    if (this.specialAmmo <= 0) {
      this.specialWeapon = null;
      this.showFeedback("COHETES agotados: vuelves al arsenal base");
    } else {
      this.showFeedback("ROCKET BLAST: impacto pesado y explosion");
    }
    this.cameras.main.shake(90, 0.0032);
  }

  updateEnemyAI(time, deltaSeconds) {
    this.enemies.children.each((enemy) => {
      if (!enemy.active) {
        return;
      }

      if (enemy.getData("falling")) {
        enemy.x -= this.scrollSpeed * 0.45 * deltaSeconds;
        const warn = enemy.getData("warning");
        if (warn) {
          warn.destroy();
          enemy.setData("warning", null);
        }
        return;
      }

      enemy.x -= this.scrollSpeed * deltaSeconds;
      const def = enemy.getData("typeDef") ?? ENEMY_TYPES.shooter;
      const spritePrefix = enemy.getData("spritePrefix") ?? def.prefix;
      const isBoss = enemy.getData("isBoss");
      const distance = enemy.x - this.runner.x;
      enemy.setFlipX(distance > 0);
      const warn = enemy.getData("warning");
      if (warn) {
        warn.x = enemy.x;
        warn.y = enemy.y - sy(106);
      }

      let targetVelocity = 0;
      let state = "idle";
      const absDistance = Math.abs(distance);

      if (isBoss) {
        if (enemy.getData("bossCasting") && time > enemy.getData("bossCastUntil")) {
          this.executeBossCast(enemy, time);
        }

        const maxHp = Math.max(1, enemy.getData("maxHp") ?? enemy.getData("hp") ?? 1);
        const hpRatio = (enemy.getData("hp") ?? maxHp) / maxHp;
        const nextSpecial = enemy.getData("nextSpecial") ?? 0;
        const isCasting = enemy.getData("bossCasting");
        const isDashing = enemy.getData("bossDashUntil") > time;
        const isMidBoss = enemy.getData("midBoss");

        if (isMidBoss) {
          const phase = hpRatio > 0.6 ? 1 : 2;
          if (phase !== enemy.getData("bossPhase")) {
            enemy.setData("bossPhase", phase);
            arcadeAudio.playSfx("boss", "phase");
            this.showFeedback(phase === 2 ? "STORM CORE: segunda fase, mas rayos y menos huecos" : "STORM CORE: tormenta electrica en camino");
          }

          if (!isCasting && time > nextSpecial && absDistance < sx(460)) {
            this.startBossCast(enemy, time, {
              type: "storm-rays",
              label: phase === 2 ? "MEGA VOLT" : "STORM GRID",
              color: "#c7ff3a",
              tint: 0xc7ff3a,
              duration: phase === 2 ? 520 : 680,
              payload: { phase },
            });
            state = "attack";
          } else if (distance > sx(320)) {
            targetVelocity = -def.moveSpeed * 0.72;
            state = "run";
          } else if (distance < sx(120)) {
            targetVelocity = def.retreatSpeed * 1.2;
            state = "brake";
          } else if (def.canShoot && !enemy.getData("charging") && time > enemy.getData("nextShot")) {
            this.telegraphEnemyShot(enemy, time);
            enemy.setData("nextShot", time + (phase === 2 ? 860 : 1080));
            state = "attack";
          } else {
            targetVelocity = 0;
            state = "idle";
          }
        } else if (isDashing) {
          targetVelocity = -def.moveSpeed * 3.1;
          state = "attack";
        } else if (this.city.key === "londres") {
          const phase = hpRatio > 0.66 ? 1 : hpRatio > 0.33 ? 2 : 3;
          if (phase !== enemy.getData("bossPhase")) {
            enemy.setData("bossPhase", phase);
            if (phase === 2) {
              arcadeAudio.playSfx("boss", "phase");
              this.showFeedback("BIG BEN HUNTER: fase 2, mas lluvia y mas disparo");
              this.spawnObstacleAt("drone", WIDTH + sx(200));
              this.spawnEnemyAt(WIDTH + sx(340), "sprinter");
            } else if (phase === 3) {
              arcadeAudio.playSfx("boss", "phase");
              this.showFeedback("BIG BEN HUNTER: fase 3, cierre total de avenida");
              this.spawnObstacleAt("barricade", WIDTH + sx(180));
              this.spawnObstacleAt("drone", WIDTH + sx(320));
            }
          }

          if (!isCasting && time > nextSpecial && absDistance < sx(420) && absDistance > sx(150)) {
            this.startBossCast(enemy, time, {
              type: "london-crossfire",
              label: "CLOCK STRIKE",
              color: "#ff365f",
              tint: 0xff365f,
              duration: phase === 3 ? 380 : 460,
            });
            state = "attack";
          } else if (distance > sx(340)) {
            targetVelocity = -def.moveSpeed * (phase === 3 ? 1.05 : 0.85);
            state = "run";
          } else if (distance < sx(168)) {
            targetVelocity = def.retreatSpeed * (phase === 3 ? 1.5 : 1.2);
            state = "brake";
          } else if (def.canShoot && !enemy.getData("charging") && time > enemy.getData("nextShot")) {
            this.telegraphEnemyShot(enemy, time);
            enemy.setData("nextShot", time + (phase === 3 ? 760 : phase === 2 ? 900 : 1080));
            state = "attack";
          } else {
            targetVelocity = 0;
            state = "idle";
          }
        } else {
          if (!isCasting && time > nextSpecial && absDistance < sx(430) && absDistance > sx(110)) {
            const casts = {
              valencia: { type: "valencia-dash", label: "PALM DASH", color: "#ff8b22", tint: 0xff8b22, duration: 420 },
              roma: { type: "roma-stomp", label: "ARENA STOMP", color: "#ffd95c", tint: 0xc5b06c, duration: 560 },
              paris: { type: "paris-laser", label: "NEON SIGHT", color: "#40d8ff", tint: 0x40d8ff, duration: 520 },
              venecia: { type: "venecia-wave", label: "CANAL WAVE", color: "#4ae0c2", tint: 0x4ae0c2, duration: 520 },
            };
            const cast = casts[this.city.key];
            if (cast) {
              this.startBossCast(enemy, time, cast);
              state = "attack";
            }
          } else if (distance > sx(300)) {
            targetVelocity = -def.moveSpeed * 0.8;
            state = "run";
          } else if (distance < sx(160)) {
            targetVelocity = def.retreatSpeed * 1.1;
            state = "brake";
          } else if (def.canShoot && !enemy.getData("charging") && time > enemy.getData("nextShot")) {
            this.telegraphEnemyShot(enemy, time);
            state = "attack";
          } else {
            targetVelocity = 0;
            state = "idle";
          }
        }
      } else if (enemy.getData("hurtUntil") > time) {
        targetVelocity = distance > 0 ? -def.retreatSpeed : def.retreatSpeed;
        state = "hurt";
      } else if (enemy.getData("charging")) {
        targetVelocity = 0;
        state = "attack";
      } else if (def.key === "sprinter") {
        if (distance > sx(225)) {
          targetVelocity = -def.moveSpeed;
          state = "run";
        } else if (distance > sx(118)) {
          targetVelocity = -def.moveSpeed * 0.55;
          state = "run";
        } else if (distance > sx(52)) {
          targetVelocity = def.retreatSpeed;
          state = "brake";
        } else {
          targetVelocity = def.retreatSpeed * 1.1;
          state = "attack";
        }
      } else if (def.key === "bruiser") {
        if (distance > sx(250)) {
          targetVelocity = -def.moveSpeed;
          state = "run";
        } else if (distance > sx(100)) {
          targetVelocity = -def.moveSpeed * 0.45;
          state = "run";
        } else if (distance > sx(28)) {
          targetVelocity = 0;
          state = "brake";
        } else {
          targetVelocity = def.retreatSpeed;
          state = "attack";
        }
      } else {
        if (distance > sx(360)) {
          targetVelocity = -def.moveSpeed;
          state = "run";
        } else if (distance > sx(220)) {
          targetVelocity = -def.moveSpeed * 0.45;
          state = "run";
        } else if (distance < sx(150)) {
          targetVelocity = def.retreatSpeed;
          state = "brake";
        } else {
          targetVelocity = 0;
          state = "idle";
        }
      }

      enemy.setVelocityX(targetVelocity);

      if (def.canShoot && enemy.getData("charging") && time > enemy.getData("chargeUntil")) {
        this.enemyShoot(enemy, time);
        enemy.setData("charging", false);
        enemy.setData("nextShot", time + Phaser.Math.Between(isBoss ? 900 : 1150, isBoss ? 1450 : 1850));
        enemy.clearTint();
        const shotWarn = enemy.getData("warning");
        if (shotWarn) {
          shotWarn.destroy();
          enemy.setData("warning", null);
        }
        state = "attack";
      } else if (
        def.canShoot &&
        !enemy.getData("charging") &&
        absDistance < sx(540) &&
        absDistance > sx(145) &&
        time > enemy.getData("nextShot")
      ) {
        this.telegraphEnemyShot(enemy, time);
        state = "attack";
      }

      let textureState = "idle";
      if (state === "hurt") {
        textureState = "hurt";
      } else if (state === "attack") {
        textureState = "attack";
      } else if (state === "brake") {
        textureState = "brake";
      } else if (state === "run") {
        textureState = Math.floor(time / (def.key === "sprinter" ? 90 : 120)) % 2 === 0 ? "run-a" : "run-b";
      }

      const nextTexture = `${spritePrefix}-${textureState}`;
      if (enemy.texture.key !== nextTexture) {
        enemy.setTexture(nextTexture);
      }

      if (enemy.getData("charging") && time > enemy.getData("chargeUntil")) {
        enemy.setData("charging", false);
      }
    });

    this.enemyBullets.children.each((bullet) => {
      bullet.x -= this.scrollSpeed * deltaSeconds;
    });

    this.playerBullets.children.each((bullet) => {
      if (time - bullet.getData("born") > 1050 || bullet.x < -80 || bullet.x > WIDTH + 80 || bullet.y < 20) {
        bullet.destroy();
      }
    });
  }

  enemyShoot(enemy, time) {
    const def = enemy.getData("typeDef") ?? ENEMY_TYPES.shooter;
    const spritePrefix = enemy.getData("spritePrefix") ?? def.prefix;
    const direction = enemy.flipX ? -1 : 1;
    const parisShooter = spritePrefix.startsWith("enemy-paris-");
    enemy.setTexture(`${spritePrefix}-attack`);
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y - sy(52), this.runner.x, this.runner.y - sy(48));
    this.spawnMuzzleFlash(enemy.x + direction * sx(28), enemy.y - sy(56), direction, parisShooter ? 0xf2ead8 : 0xff365f);
    this.spawnSmokePuff(enemy.x + direction * sx(22), enemy.y - sy(58));
    this.spawnEnemyBullet(enemy.x + direction * sx(34), enemy.y - sy(56), angle, 285, time, parisShooter
      ? { texture: "enemy-cigarette", tint: 0xffffff, scale: 0.92, bodyWidth: 20, bodyHeight: 8 }
      : {});
  }

  telegraphEnemyShot(enemy, time) {
    const def = enemy.getData("typeDef") ?? ENEMY_TYPES.shooter;
    const spritePrefix = enemy.getData("spritePrefix") ?? def.prefix;
    enemy.setData("charging", true);
    enemy.setData("chargeUntil", time + 520);
    enemy.setTint(0xffd95c);
    enemy.setTexture(`${spritePrefix}-attack`);

    const warn = this.add.image(enemy.x, enemy.y - sy(112), "warning").setScale(0.9);
    enemy.setData("warning", warn);
    this.tweens.add({
      targets: warn,
      y: warn.y - sy(10),
      alpha: 0.35,
      duration: 160,
      yoyo: true,
      repeat: 2,
      ease: "Sine.InOut",
    });
  }

  spawnEnemyBullet(x, y, angle, speed, time, options = {}) {
    const bullet = this.enemyBullets.create(x, y, options.texture || "enemy-bullet");
    bullet.setOrigin(0.5);
    bullet.setScale(options.scale ?? 1);
    if (options.tint) {
      bullet.setTint(options.tint);
    } else {
      bullet.clearTint();
    }
    this.physics.velocityFromRotation(angle, speed, bullet.body.velocity);
    if (options.velocityY) {
      bullet.body.velocity.y += options.velocityY;
    }
    bullet.setData("born", time);
    bullet.body.setSize(options.bodyWidth ?? 14, options.bodyHeight ?? 14);
    this.spawnBulletTrail(x, y, angle, options.tint || 0xff365f, options.scale ?? 0.9);
    return bullet;
  }

  startBossCast(enemy, time, config) {
    enemy.setData("bossCasting", true);
    enemy.setData("bossCastType", config.type);
    enemy.setData("bossCastUntil", time + (config.duration ?? 520));
    enemy.setData("bossCastPayload", config.payload ?? null);
    enemy.setTint(config.tint ?? 0xffd95c);
    const existing = enemy.getData("warning");
    if (existing) {
      existing.destroy();
    }
    const warn = this.add
      .text(enemy.x, enemy.y - sy(122), config.label, {
        fontFamily: '"Press Start 2P"',
        fontSize: `${Math.round(sx(8))}px`,
        color: config.color || "#ffd95c",
        stroke: "#14151c",
        strokeThickness: 5,
      })
      .setOrigin(0.5);
    enemy.setData("warning", warn);
    this.tweens.add({
      targets: warn,
      alpha: 0.3,
      y: warn.y - sy(10),
      duration: 170,
      yoyo: true,
      repeat: 2,
      ease: "Sine.InOut",
    });
  }

  executeBossCast(enemy, time) {
    const type = enemy.getData("bossCastType");
    enemy.setData("bossCasting", false);
    enemy.setData("bossCastType", null);
    enemy.setData("bossCastPayload", null);
    enemy.clearTint();
    const warn = enemy.getData("warning");
    if (warn) {
      warn.destroy();
      enemy.setData("warning", null);
    }

    if (type === "valencia-dash") {
      enemy.setData("bossDashUntil", time + 620);
      enemy.setData("nextSpecial", time + 2100);
      this.showFeedback("PALM RUSH: carga frontal, salta o retrocede");
      this.cameras.main.shake(120, 0.004);
      return;
    }

    if (type === "roma-stomp") {
      const originX = enemy.x - sx(24);
      const originY = GROUND_Y - sy(14);
      this.spawnEnemyBullet(originX, originY, Math.PI, 250, time, { scale: 1.15, tint: 0xc5b06c, bodyWidth: 20, bodyHeight: 16 });
      this.spawnEnemyBullet(originX, originY - sy(16), Math.PI, 330, time, { scale: 0.92, tint: 0xf2ead8, bodyWidth: 14, bodyHeight: 14 });
      this.spawnObstacleAt("barrel", WIDTH + sx(180));
      enemy.setData("nextSpecial", time + 2400);
      this.showFeedback("ARENA STOMP: doble onda a ras de suelo");
      this.cameras.main.shake(180, 0.007);
      return;
    }

    if (type === "paris-laser") {
      const targetY = Phaser.Math.Clamp(this.runner.y - sy(54), sy(130), GROUND_Y - sy(36));
      const beam = this.add.rectangle(enemy.x - sx(220), targetY, sx(420), sy(5), 0x40d8ff, 0.85).setOrigin(1, 0.5);
      this.tweens.add({
        targets: beam,
        alpha: 0,
        duration: 220,
        onComplete: () => beam.destroy(),
      });
      const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y - sy(56), this.runner.x, targetY);
      this.spawnEnemyBullet(enemy.x - sx(28), enemy.y - sy(56), angle, 460, time, { tint: 0x40d8ff, scale: 1.08, bodyWidth: 16, bodyHeight: 16 });
      enemy.setData("nextSpecial", time + 2200);
      this.showFeedback("NEON SIGHT: un disparo fino, rapido y mortal");
      return;
    }

    if (type === "venecia-wave") {
      [-0.26, 0, 0.26].forEach((offset, index) => {
        this.spawnEnemyBullet(enemy.x - sx(26), enemy.y - sy(72) + index * sy(10), Math.PI, 250, time, {
          tint: 0x4ae0c2,
          scale: 1.05,
          bodyWidth: 16,
          bodyHeight: 16,
          velocityY: offset * 260,
        });
      });
      enemy.setData("nextSpecial", time + 2300);
      this.showFeedback("CANAL WAVE: abanico de marea, busca el hueco");
      return;
    }

    if (type === "london-crossfire") {
      [-0.2, 0, 0.2].forEach((offset, index) => {
        this.spawnEnemyBullet(enemy.x - sx(30), enemy.y - sy(58) + index * sy(8), Math.PI, 300, time, {
          tint: 0xff365f,
          scale: 1.1,
          bodyWidth: 16,
          bodyHeight: 16,
          velocityY: offset * 180,
        });
      });
      this.spawnObstacleAt("drone", WIDTH + sx(240));
      enemy.setData("nextSpecial", time + 1850);
      this.showFeedback("CLOCK STRIKE: abanico rojo y dron de cierre");
      return;
    }

    if (type === "storm-rays") {
      const phase = enemy.getData("bossCastPayload")?.phase ?? 1;
      const baseX = Phaser.Math.Clamp(this.runner.x + sx(120), sx(240), WIDTH - sx(180));
      const offsets = phase === 2 ? [-220, -120, 0, 120, 220] : [-180, -60, 60, 180];
      offsets.forEach((offset, index) => {
        const strikeX = Phaser.Math.Clamp(baseX + sx(offset), sx(120), WIDTH - sx(80));
        this.time.delayedCall(index * 90, () => {
          if (!enemy.active) return;
          this.spawnLightningStrike(strikeX, time + index * 90);
        });
      });
      enemy.setData("nextSpecial", time + (phase === 2 ? 2200 : 2800));
      this.showFeedback(phase === 2 ? "MEGA VOLT: rayos por todos los lados" : "STORM GRID: lee el patron y busca hueco");
    }
  }

  spawnLightningStrike(x, time) {
    const warning = this.add.rectangle(x, HEIGHT / 2, sx(14), GROUND_Y - sy(64), 0xc7ff3a, 0.2);
    this.weatherLayer.add(warning);
    this.tweens.add({
      targets: warning,
      alpha: 0.56,
      duration: 110,
      yoyo: true,
      repeat: 1,
      onComplete: () => warning.destroy(),
    });
    this.time.delayedCall(150, () => {
      const bolt = this.add.rectangle(x, HEIGHT / 2, sx(18), GROUND_Y - sy(40), 0xf2ead8, 0.86);
      const core = this.add.rectangle(x, HEIGHT / 2, sx(8), GROUND_Y - sy(40), 0x40d8ff, 0.94);
      this.foreground.add(bolt);
      this.foreground.add(core);
      this.spawnEnemyBullet(x, sy(92), Math.PI / 2, 560, time, {
        tint: 0xc7ff3a,
        scale: 1.22,
        bodyWidth: 18,
        bodyHeight: 34,
      });
      this.cameras.main.flash(70, 199, 255, 58, false);
      this.cameras.main.shake(110, 0.004);
      this.tweens.add({
        targets: [bolt, core],
        alpha: 0,
        duration: 170,
        onComplete: () => {
          bolt.destroy();
          core.destroy();
        },
      });
    });
  }

  spawnEnemy() {
    return null;
  }

  spawnEnemyAt(x, type = "shooter") {
    const def = ENEMY_TYPES[type] ?? ENEMY_TYPES.shooter;
    const spritePrefix = this.city.key === "paris" ? `enemy-paris-${def.key}` : def.prefix;
    const enemy = this.enemies.create(x, GROUND_Y, `${spritePrefix}-idle`);
    enemy.setOrigin(0.5, 1);
    enemy.setScale(def.scale);
    enemy.body.setSize(def.body.width, def.body.height);
    enemy.body.setOffset(def.body.offsetX, def.body.offsetY);
    enemy.setData("enemyType", def.key);
    enemy.setData("typeDef", def);
    enemy.setData("spritePrefix", spritePrefix);
    enemy.setData("hp", def.hp);
    enemy.setData("hurtUntil", 0);
    enemy.setData("charging", false);
    enemy.setData("falling", false);
    enemy.setData("warning", null);
    enemy.setData("nextShot", this.time.now + Phaser.Math.Between(700, 1200));
    this.lastHazardX = x;
    this.lastEnemyAt = this.time.now;
    return enemy;
  }

  spawnCrate() {
    if (this.crates.countActive(true) >= 2 || this.time.now < this.platformSafeUntil || this.time.now < this.scriptedSectionUntil) {
      return;
    }
    this.spawnCrateAt(Math.max(WIDTH + sx(110), this.lastHazardX + sx(280)), GROUND_Y - sy(2));
  }

  spawnCrateAt(x, y) {
    const crate = this.crates.create(x, y, "crate");
    crate.setOrigin(0.5, 1);
    crate.body.setSize(54, 54);
    crate.body.setOffset(6, 8);
    crate.setData("hp", 2);
    this.lastHazardX = crate.x;
    return crate;
  }

  spawnSolidBox() {
    if (this.solidBoxes.countActive(true) >= 18 || this.time.now < this.scriptedSectionUntil) {
      return;
    }

    const templates = [
      { pattern: [[1], [1], [2], [2]], reward: "socks" },
      { pattern: [[1], [2], [3], [2], [1]], reward: "shirt", secretRewards: [{ column: 2, level: 4, key: "socks" }] },
      { pattern: [[2], [2], [1], [1], [2], [2]], reward: "socks" },
      { pattern: [[1], [1, 3], [2], [2, 4], [1]], reward: "shoe", secretRewards: [{ column: 3, level: 5, key: "shirt" }] },
      { pattern: [[1], [2], [3], [4], [5], [4], [3], [2]], reward: "shoe", secretRewards: [{ column: 4, level: 7, key: "shirt" }] },
      { pattern: [[2], [3], [4], [5], [6], [5], [4], [3], [2]], reward: "shirt", secretRewards: [{ column: 5, level: 7, key: "laser" }] },
      { pattern: [[1], [2], [2, 4], [3, 5], [4, 6], [3, 5], [2, 4], [1]], reward: "rocket", secretRewards: [{ column: 4, level: 8, key: "outfit" }] },
    ];
    const template = Phaser.Utils.Array.GetRandom(templates);
    this.spawnPlatformLayout({
      startX: Math.max(WIDTH + sx(180), this.lastHazardX + sx(400)),
      pattern: template.pattern,
      reward: Math.random() > 0.32 ? template.reward : null,
      secretRewards: template.secretRewards,
      trailingSupport: true,
    });
  }

  spawnSolidBoxAt(x, y) {
    const textureByCity = {
      valencia: "solid-box-valencia",
      roma: "solid-box-roma",
      paris: "solid-box-paris",
      venecia: "solid-box-venecia",
      londres: "solid-box-londres",
    };
    const box = this.solidBoxes.create(x, y, textureByCity[this.city.key] || "solid-box");
    box.setOrigin(0.5, 1);
    box.body.setSize(72, 54);
    box.body.setOffset(3, 4);
    box.setData("solid", true);
    return box;
  }

  spawnPlatformLayout({ startX, columns = 3, levels = [1], staircase = false, towerHeight = 0, reward = null, trailingSupport = false, pattern = null, secretRewards = [] }) {
    let farX = startX;
    let highestLevel = Math.max(...levels, 1);
    let normalizedPattern = pattern;

    if (!normalizedPattern) {
      if (towerHeight > 0) {
        normalizedPattern = Array.from({ length: columns }, () =>
          Array.from({ length: towerHeight }, (_, index) => index + 1)
        );
      } else if (staircase) {
        normalizedPattern = Array.from({ length: columns }, (_, col) => [col + 1]);
      } else {
        normalizedPattern = Array.from({ length: columns }, (_, col) =>
          levels.map((level, row) => level + row)
        );
      }
    }

    highestLevel = normalizedPattern.reduce((maxLevel, columnLevels) => {
      if (!columnLevels || columnLevels.length === 0) {
        return maxLevel;
      }
      return Math.max(maxLevel, ...columnLevels);
    }, 1);

    normalizedPattern.forEach((columnLevels, col) => {
      const x = startX + col * sx(76);
      (columnLevels ?? []).forEach((level) => {
        const y = GROUND_Y - sy(4) - (level - 1) * sy(58);
        this.spawnSolidBoxAt(x, y);
        farX = x;
      });
      farX = x;
    });

    if (trailingSupport && normalizedPattern.length <= 5) {
      this.spawnSolidBoxAt(farX + sx(76), GROUND_Y - sy(4));
      farX += sx(76);
    }

    if (reward) {
      const centerColumn = Math.floor((normalizedPattern.length - 1) / 2);
      this.spawnRewardItem(startX + centerColumn * sx(76), GROUND_Y - sy(92) - highestLevel * sy(42), reward);
    }

    secretRewards.forEach((secret) => {
      const column = Phaser.Math.Clamp(secret.column ?? 0, 0, normalizedPattern.length - 1);
      const rewardLevel = secret.level ?? highestLevel + 1;
      this.spawnRewardItem(
        startX + column * sx(76),
        GROUND_Y - sy(96) - (rewardLevel - 1) * sy(48),
        secret.key ?? "socks"
      );
    });

    this.platformSafeUntil = this.time.now + 3200;
    this.lastObstacleAt = this.time.now;
    this.lastEnemyAt = this.time.now;
    this.lastHazardX = farX;
  }

  spawnObstacle() {
    if (this.obstacles.countActive(true) > 1 || this.time.now < this.platformSafeUntil) {
      return;
    }

    const progress = this.stageDistance / this.stageLength;
    const lateHazard =
      progress > 0.55
        ? (this.city.key === "venecia" || this.city.key === "valencia" ? "water-gap" : "lava-gap")
        : null;
    const pool = [...(this.city.obstaclePool || ["barrel", "barricade", "drone"])];
    if (lateHazard && progress > 0.78) {
      pool.push(lateHazard);
    }
    const key = Phaser.Utils.Array.GetRandom(pool);
    const x = Math.max(WIDTH + sx(130), this.lastHazardX + sx(380));
    this.spawnObstacleAt(key, x);
  }

  spawnObstacleAt(key, x) {
    const y =
      key === "drone" ? GROUND_Y - sy(72)
      : key === "water-gap" || key === "lava-gap" ? GROUND_Y + sy(10)
      : GROUND_Y - sy(4);
    const obstacle = this.obstacles.create(x, y, key);
    obstacle.setOrigin(0.5, key === "drone" ? 0.5 : 1);
    obstacle.setVelocityX(0);
    obstacle.setData("type", key);

    if (key === "drone") {
      obstacle.body.setSize(80, 22);
      obstacle.body.setOffset(12, 19);
      this.tweens.add({ targets: obstacle, y: y - sy(10), duration: 520, yoyo: true, repeat: -1, ease: "Sine.InOut" });
    } else if (key === "water-gap" || key === "lava-gap") {
      obstacle.body.setSize(156, 20);
      obstacle.body.setOffset(10, 12);
    } else if (key === "barrel") {
      obstacle.body.setSize(34, 44);
      obstacle.body.setOffset(20, 24);
    } else {
      obstacle.body.setSize(58, 38);
      obstacle.body.setOffset(24, 30);
    }

    this.lastHazardX = key === "water-gap" || key === "lava-gap" ? x + sx(88) : x;
    this.lastObstacleAt = this.time.now;
    return obstacle;
  }

  spawnReward() {
    if (this.rewards.countActive(true) >= 2 || this.time.now < this.platformSafeUntil || this.time.now < this.scriptedSectionUntil) {
      return;
    }
    const items = ["shirt", "socks", "socks", "shoe", "outfit", "scooter", "scooter"];
    const key = Phaser.Utils.Array.GetRandom(items);
    this.spawnRewardItem(WIDTH + sx(80), Phaser.Math.Between(sy(228), sy(350)), key);
  }

  collectReward(reward) {
    const key = reward.texture.key;
    const value = reward.getData("value");
    const label = reward.getData("label");
    this.combo = Math.min(this.combo + 1, 9);
    this.score += value * this.combo;

    if (key === "socks") {
      this.totalSocksCollected += 1;
      this.socks = Math.min(9, this.socks + 1);
      this.upgradeFirePower();
    }

    this.updateComboFeel();

    if (key === "shoe") {
      this.turboUntil = Math.max(this.turboUntil, this.time.now + 3200);
      this.sprintUntil = Math.max(this.sprintUntil, this.time.now + 2200);
      this.cameras.main.flash(90, 199, 255, 58, false);
      this.showFeedback("Zapatillas turbo: corre mas rapido y abre hueco");
    } else if (key === "laser") {
      this.activateSpecialWeapon("Laser", 16);
      this.cameras.main.flash(110, 64, 216, 255, false);
      this.showFeedback("LASER KAMUABU: rayo super potente");
    } else if (key === "rocket") {
      this.activateSpecialWeapon("Rocket", 10);
      this.cameras.main.flash(110, 255, 139, 34, false);
      this.showFeedback("ROCKET BLAST: cohetes pesados");
    } else if (key === "scooter") {
      this.totalScootersCollected += 1;
      this.scooters = Math.min(5, this.scooters + 1);
      if (this.scooters >= 5) {
        this.scooters = 0;
        this.activateScooterMode();
        this.cameras.main.flash(120, 255, 217, 92, false);
        this.showFeedback("PATINETE KAMUABU: montado y a toda velocidad");
      } else {
        this.cameras.main.flash(90, 255, 217, 92, false);
        this.showFeedback(`Patinete ${this.scooters}/5: sigue recogiendo para montarlo`);
      }
    } else if (key === "shirt") {
      this.totalShirtsCollected += 1;
      this.shieldUntil = Math.max(this.shieldUntil, this.time.now + 3200);
      this.cameras.main.flash(90, 199, 255, 58, false);
      this.showFeedback("Camiseta KAMUABU: escudo temporal");
    } else if (key === "outfit") {
      this.activateSuperOutfit();
      this.cameras.main.flash(120, 255, 217, 92, false);
      this.showFeedback("SUPER OUTFIT KAMUABU: outfit total y fuego premium");
    } else {
      this.cameras.main.flash(70, 255, 217, 92, false);
    }

    this.floatText(label, reward.x, reward.y, key === "socks" ? "#40d8ff" : "#c7ff3a");
    arcadeAudio.playSfx("reward");
    reward.destroy();
    this.syncHud();
  }

  hitEnemy(bullet, enemy) {
    const damage = bullet.getData("damage");
    const splashRadius = bullet.getData("splashRadius");
    if (splashRadius) {
      this.explodeRocket(enemy.x, enemy.y - sy(44), splashRadius, damage, enemy);
      bullet.destroy();
      return;
    }
    bullet.destroy();
    this.applyEnemyDamage(enemy, damage);
  }

  breakCrate(bullet, crate) {
    const damage = bullet.getData("damage");
    const splashRadius = bullet.getData("splashRadius");
    if (splashRadius) {
      this.explodeRocket(crate.x, crate.y - sy(30), splashRadius, damage, null, crate);
      bullet.destroy();
      return;
    }
    bullet.destroy();
    this.applyCrateDamage(crate, damage);
  }

  applyEnemyDamage(enemy, damage) {
    if (!enemy?.active) return;
    const appliedDamage = enemy.getData("midBoss") ? 1 : damage;
    const hp = enemy.getData("hp") - appliedDamage;
    const def = enemy.getData("typeDef") ?? ENEMY_TYPES.shooter;
    const spritePrefix = enemy.getData("spritePrefix") ?? def.prefix;
    enemy.setData("hp", hp);
    this.spawnBurst(enemy.x, enemy.y - 48);

    if (hp <= 0) {
      this.enemiesDefeated += 1;
      this.score += (enemy.getData("score") ?? def.score) * this.combo;
      this.combo = Math.min(this.combo + 1, 9);
      this.updateComboFeel();
      const warn = enemy.getData("warning");
      if (warn) {
        warn.destroy();
        enemy.setData("warning", null);
      }
      if (Math.random() > 0.66) {
        this.spawnRewardAt(enemy.x, enemy.y - 70);
      }
      if (enemy.getData("isBoss")) {
        const isMidBoss = enemy.getData("midBoss");
        this.activeBoss = null;
        if (!isMidBoss) {
          this.bossDefeated = true;
          this.stageDistance = this.stageLength;
          this.spawnRewardItem(enemy.x + sx(26), enemy.y - sy(92), "outfit");
        } else {
          this.midBossDefeated = true;
          this.spawnRewardItem(enemy.x + sx(26), enemy.y - sy(92), Phaser.Utils.Array.GetRandom(["laser", "rocket", "outfit"]));
          this.showFeedback(`MID-BOSS KO: ${enemy.getData("bossLabel")} abatido`);
        }
        arcadeAudio.playSfx("boss", "ko");
        this.bossHudGlow.setVisible(false);
        this.bossBarShell.setVisible(false);
        this.bossBarFrame.setVisible(false);
        this.bossBarUnder.setVisible(false);
        this.bossBarFill.setVisible(false);
        this.bossBarShine.setVisible(false);
        this.bossPortraitFrame.setVisible(false);
        this.bossPortrait.setVisible(false);
        this.bossNameText.setVisible(false);
        this.bossPhaseText.setVisible(false);
        if (!isMidBoss) {
          this.showFeedback(`BOSS KO: ${enemy.getData("bossLabel")} fuera de combate`);
        }
      }
      enemy.setData("falling", true);
      enemy.setData("charging", false);
      enemy.body.enable = false;
      enemy.setVelocity(-sx(120), -sy(240));
      enemy.setAngularVelocity(enemy.flipX ? -220 : 220);
      enemy.setTexture(`${spritePrefix}-fall`);
      this.tweens.add({
        targets: enemy,
        angle: enemy.flipX ? -38 : 38,
        alpha: 0,
        y: enemy.y + sy(52),
        duration: 420,
        ease: "Quad.In",
        onComplete: () => enemy.destroy(),
      });
    } else {
      enemy.setData("hurtUntil", this.time.now + 170);
      enemy.setTint(0xffd95c);
      enemy.setTexture(`${spritePrefix}-hurt`);
      this.time.delayedCall(90, () => {
        if (enemy.active && enemy.getData("hurtUntil") <= this.time.now) {
          enemy.clearTint();
        }
      });
    }
  }

  applyCrateDamage(crate, damage) {
    if (!crate?.active) return;
    const hp = crate.getData("hp") - damage;
    crate.setData("hp", hp);
    crate.setTint(0xffd95c);
    this.time.delayedCall(90, () => crate.active && crate.clearTint());

    if (hp <= 0) {
      this.spawnBurst(crate.x, crate.y - 34);
      if (Math.random() > 0.38) {
        this.spawnPrisoner(crate.x, crate.y);
      } else {
        this.spawnRewardAt(crate.x, crate.y - 48);
      }
      crate.destroy();
    }
  }

  handleCrateTouch(crate) {
    if (this.runner.body.blocked.up && this.runner.body.velocity.y < -140) {
      this.breakCrate({ destroy: () => {}, getData: () => 1 }, crate);
    }
  }

  handleObstacleContact(obstacle) {
    if (!obstacle?.body || this.time.now < this.invulnerableUntil) {
      return;
    }

    const type = obstacle.getData("type");
    const runnerBottom = this.runner.body.bottom;
    const runnerTop = this.runner.body.top;
    const obstacleTop = obstacle.body.top;
    const overlapCenter = Math.abs(this.runner.body.center.x - obstacle.body.center.x);

    if (type === "water-gap" || type === "lava-gap") {
      if (this.runner.body.velocity.y >= 0 && runnerBottom <= obstacleTop + sy(6)) {
        return;
      }
      this.handleHit();
      return;
    }

    if ((type === "barricade" || type === "barrel") && this.runner.body.velocity.y >= 0 && runnerBottom <= obstacleTop + sy(12)) {
      return;
    }

    if ((type === "barricade" || type === "barrel") && overlapCenter < obstacle.body.width * 0.22) {
      return;
    }

    if (type === "drone" && runnerTop >= obstacle.body.bottom - sy(8)) {
      return;
    }

    this.handleHit(obstacle);
  }

  handleEnemyContact(enemy) {
    if (this.time.now < this.invulnerableUntil) {
      return;
    }

    const enemyTop = enemy.body?.top ?? enemy.y - sy(40);
    const runnerBottom = this.runner.body.bottom;
    if (!enemy.getData("isBoss") && this.runner.body.velocity.y > sy(120) && runnerBottom <= enemyTop + sy(18)) {
      this.runner.setVelocityY(this.isPowered ? -460 : -420);
      this.hitEnemy({ destroy: () => {}, getData: () => 2 }, enemy);
      this.floatText("STOMP!", enemy.x, enemy.y - sy(96), "#40d8ff");
      return;
    }

    const warn = enemy.getData("warning");
    if (warn) {
      warn.destroy();
      enemy.setData("warning", null);
    }
    if (!enemy.getData("isBoss")) {
      enemy.destroy();
    }
    this.handleHit(enemy);
  }

  spawnPrisoner(x, y) {
    const prisoner = this.prisoners.create(x, y - 2, "pow");
    prisoner.setOrigin(0.5, 1);
    prisoner.body.setSize(42, 76);
    prisoner.body.setOffset(12, 18);
    prisoner.setVelocityX(0);
  }

  rescuePrisoner(prisoner) {
    this.prisonersSaved += 1;
    this.score += 500 * this.combo;
    this.combo = Math.min(this.combo + 2, 9);
    this.updateComboFeel();
    this.floatText("RESCATE +500", prisoner.x, prisoner.y - 80, "#ffd95c");
    this.spawnRewardAt(prisoner.x + 40, prisoner.y - 70);
    prisoner.destroy();
  }

  spawnRewardItem(x, y, key) {
    const reward = this.rewards.create(x, y, key);
    reward.setOrigin(0.5);
    reward.setVelocityX(0);
    reward.setData("value", key === "outfit" ? 260 : key === "laser" ? 240 : key === "rocket" ? 240 : key === "scooter" ? 220 : key === "shoe" ? 180 : key === "shirt" ? 130 : 90);
    reward.setData(
      "label",
      key === "outfit"
        ? "SUPER OUTFIT"
        : key === "laser"
          ? "LASER"
          : key === "rocket"
            ? "ROCKET"
            : key === "scooter"
              ? "PATINETE"
              : key === "shoe"
                ? "TURBO"
                : key === "shirt"
                  ? "CAMISETA"
                  : "CALCETINES"
    );
    reward.body.setSize(56, 48);
    this.tweens.add({
      targets: reward,
      y: reward.y - sy(13),
      duration: 430,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
    return reward;
  }

  spawnRewardAt(x, y) {
    if (this.rewards.countActive(true) >= 3) {
      return;
    }
    const key = Phaser.Utils.Array.GetRandom(["shirt", "socks", "socks", "shoe", "outfit", "scooter", "scooter", "laser", "rocket"]);
    this.spawnRewardItem(x, y, key);
  }

  spawnRainSplash(x, y) {
    const splash = this.add.image(x, y, "rain-splash").setAlpha(0.32).setScale(0.7);
    this.weatherLayer.add(splash);
    this.tweens.add({
      targets: splash,
      alpha: 0,
      scaleX: 1.15,
      scaleY: 1.05,
      duration: 220,
      ease: "Quad.Out",
      onComplete: () => splash.destroy(),
    });
  }

  spawnMuzzleFlash(x, y, direction, tint = 0xffffff) {
    const flash = this.add.image(x, y, "muzzle-flash").setOrigin(direction < 0 ? 1 : 0, 0.5);
    flash.setFlipX(direction < 0);
    flash.setTint(tint);
    this.foreground.add(flash);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 1.35,
      scaleY: 1.2,
      duration: 80,
      ease: "Quad.Out",
      onComplete: () => flash.destroy(),
    });
  }

  spawnSmokePuff(x, y) {
    const puff = this.add.image(x, y, "smoke-puff").setAlpha(0.48).setScale(0.72);
    this.foreground.add(puff);
    this.tweens.add({
      targets: puff,
      y: y - sy(12),
      alpha: 0,
      scale: 1.18,
      duration: 320,
      ease: "Quad.Out",
      onComplete: () => puff.destroy(),
    });
  }

  spawnShellCase(x, y, direction) {
    const shell = this.add.image(x, y, "shell").setScale(0.9);
    this.foreground.add(shell);
    this.tweens.add({
      targets: shell,
      x: x - direction * sx(16),
      y: y + sy(14),
      angle: direction < 0 ? -120 : 120,
      alpha: 0,
      duration: 360,
      ease: "Quad.Out",
      onComplete: () => shell.destroy(),
    });
  }

  spawnBulletTrail(x, y, angle, tint = 0xffffff, scale = 1) {
    const trail = this.add.image(x, y, "bullet-trail").setAngle(Phaser.Math.RadToDeg(angle)).setScale(scale);
    trail.setTint(tint);
    this.foreground.add(trail);
    this.tweens.add({
      targets: trail,
      alpha: 0,
      scaleX: scale * 1.22,
      duration: 120,
      ease: "Quad.Out",
      onComplete: () => trail.destroy(),
    });
  }

  spawnBurst(x, y) {
    arcadeAudio.playSfx("hit");
    const burstBack = this.add.image(x, y, "hit-burst").setScale(0.7);
    const burst = this.add.image(x, y, "hit-burst-hot").setScale(0.42);
    this.foreground.add(burstBack);
    this.foreground.add(burst);
    const smoke = this.add.image(x + sx(4), y + sy(2), "smoke-puff").setAlpha(0.42).setScale(0.66);
    this.foreground.add(smoke);
    this.tweens.add({
      targets: burstBack,
      scale: 1.28,
      alpha: 0,
      duration: 180,
      ease: "Quad.Out",
      onComplete: () => burstBack.destroy(),
    });
    this.tweens.add({
      targets: burst,
      scale: 1.12,
      alpha: 0,
      duration: 150,
      ease: "Quad.Out",
      onComplete: () => burst.destroy(),
    });
    this.tweens.add({
      targets: smoke,
      y: y - sy(10),
      alpha: 0,
      scale: 1.24,
      duration: 260,
      ease: "Quad.Out",
      onComplete: () => smoke.destroy(),
    });
  }

  explodeRocket(x, y, radius, damage, directEnemy = null, directCrate = null) {
    arcadeAudio.playSfx("boss", "phase");
    const blastBack = this.add.circle(x, y, radius * 0.36, 0xff8b22, 0.34);
    const blastCore = this.add.circle(x, y, radius * 0.18, 0xffd95c, 0.88);
    const ring = this.add.circle(x, y, radius * 0.12).setStrokeStyle(sx(6), 0xf2ead8, 0.92);
    this.foreground.add(blastBack);
    this.foreground.add(blastCore);
    this.foreground.add(ring);
    this.spawnBurst(x, y);
    this.cameras.main.shake(160, 0.006);
    this.tweens.add({
      targets: [blastBack, blastCore, ring],
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 220,
      ease: "Quad.Out",
      onComplete: () => {
        blastBack.destroy();
        blastCore.destroy();
        ring.destroy();
      },
    });

    this.enemies.children.each((enemy) => {
      if (!enemy.active) return;
      const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y - sy(44));
      if (enemy === directEnemy || dist <= radius) {
        this.applyEnemyDamage(enemy, damage);
      }
    });

    this.crates.children.each((crate) => {
      if (!crate.active) return;
      const dist = Phaser.Math.Distance.Between(x, y, crate.x, crate.y - sy(30));
      if (crate === directCrate || dist <= radius) {
        this.applyCrateDamage(crate, damage);
      }
    });
  }

  updateComboFeel() {
    this.maxComboObserved = Math.max(this.maxComboObserved, this.combo);
    if (this.combo >= 3 && this.combo > this.comboTierShown) {
      this.comboTierShown = this.combo;
      const labels = {
        3: "COMBO!",
        5: "STREET HEAT!",
        7: "ARCADE FEVER!",
        9: "KAMUABU MADNESS!",
      };
      const label = labels[this.combo] || `COMBO x${this.combo}`;
      arcadeAudio.playSfx("combo", this.combo);
      this.comboBurst.setText(label).setAlpha(1).setScale(0.86);
      this.tweens.killTweensOf(this.comboBurst);
      this.tweens.add({
        targets: this.comboBurst,
        alpha: 0,
        scale: 1.08,
        y: sy(226),
        duration: 560,
        ease: "Back.Out",
        onComplete: () => {
          this.comboBurst.y = sy(248);
        },
      });
      this.cameras.main.shake(70, 0.0022);
    }
  }

  powerUp() {
    this.isPowered = true;
    this.health = 2;
    this.applyRunnerBody();
    this.floatText("KAMUABU XL!", this.runner.x + 30, this.runner.y - 112, "#ffd95c");
    this.cameras.main.shake(160, 0.004);
    this.tweens.add({
      targets: this.runner,
      scaleX: 1.14,
      scaleY: 1.14,
      duration: 110,
      yoyo: true,
      repeat: 2,
      ease: "Quad.Out",
    });
  }

  activateSuperOutfit() {
    this.superOutfitUntil = this.time.now + 7000;
    this.shieldUntil = Math.max(this.shieldUntil, this.time.now + 2400);
    this.turboUntil = Math.max(this.turboUntil, this.time.now + 3600);
    this.sprintUntil = Math.max(this.sprintUntil, this.time.now + 2400);
    this.fireLevel = 4;
    this.isPowered = true;
    this.health = 2;
    this.weapon = "Outfit";
    this.ammo = Infinity;
    this.weaponPeak = "Outfit";
    this.applyRunnerBody();
    this.floatText("SUPER OUTFIT!", this.runner.x + sx(48), this.runner.y - sy(118), "#ffd95c");
    this.cameras.main.shake(220, 0.006);
  }

  activateScooterMode() {
    this.scooterUntil = Number.POSITIVE_INFINITY;
    this.turboUntil = Number.POSITIVE_INFINITY;
    this.sprintUntil = Math.max(this.sprintUntil, this.time.now + 3200);
    this.floatText("PATINETE!", this.runner.x + sx(40), this.runner.y - sy(116), "#4ae0c2");
    this.cameras.main.shake(180, 0.005);
  }

  activateSpecialWeapon(type, ammo) {
    this.specialWeapon = type;
    this.specialAmmo = ammo;
    this.weaponPeak = type;
    this.floatText(`${type.toUpperCase()} READY`, this.runner.x + sx(42), this.runner.y - sy(114), type === "Laser" ? "#40d8ff" : "#ff8b22");
  }

  buildCompetitionPayload(victory) {
    return {
      cityKey: this.city.key,
      score: Math.floor(this.score),
      distance: Math.floor(this.stageDistance),
      enemiesKilled: this.enemiesDefeated,
      miniBossKilled: this.midBossDefeated,
      bossKilled: victory ? true : this.bossDefeated,
      comboMax: this.maxComboObserved,
      hitsTaken: this.hitsTaken,
      weaponPeak: this.weaponPeak || (this.specialWeapon || (this.fireLevel >= 4 ? "WIDE" : "Pistol")),
      runDurationMs: Math.max(0, this.time.now - this.runStartedAt),
      socksCollected: this.totalSocksCollected,
      shirtsCollected: this.totalShirtsCollected,
      scootersCollected: this.totalScootersCollected,
      victory,
      rankLabel: this.getMissionRank(victory),
    };
  }

  spawnStormMiniBoss() {
    this.midBossSpawned = true;
    this.scriptedSectionUntil = Math.max(this.scriptedSectionUntil, this.time.now + 4200);
    const configs = {
      valencia: { type: "sprinter", hp: 10, label: "SOLAR STORM", x: WIDTH + sx(280) },
      roma: { type: "bruiser", hp: 11, label: "TEMPESTA CORE", x: WIDTH + sx(300) },
      paris: { type: "shooter", hp: 10, label: "NEON STORM", x: WIDTH + sx(300) },
      venecia: { type: "shooter", hp: 10, label: "LAGUNA VOLT", x: WIDTH + sx(300) },
      londres: { type: "shooter", hp: 12, label: "THUNDER WARDEN", x: WIDTH + sx(320) },
    };
    const bossConfig = configs[this.city.key] || configs.londres;
    const boss = this.spawnEnemyAt(bossConfig.x, bossConfig.type);
    const def = boss.getData("typeDef");
    boss.setTexture(`boss-${this.city.key}-idle`);
    boss.setScale(def.scale * 1.12);
    boss.body.setSize(def.body.width + 8, def.body.height + 10);
    boss.setData("hp", bossConfig.hp);
    boss.setData("maxHp", bossConfig.hp);
    boss.setData("isBoss", true);
    boss.setData("midBoss", true);
    boss.setData("bossLabel", bossConfig.label);
    boss.setData("score", 900);
    boss.setData("bossPhase", 1);
    boss.setData("nextShot", this.time.now + 820);
    boss.setData("nextSpecial", this.time.now + 1200);
    boss.setData("spritePrefix", `boss-${this.city.key}`);
    boss.setData("bossCasting", false);
    boss.setData("bossCastType", null);
    boss.setData("bossCastUntil", 0);
    boss.setData("bossDashUntil", 0);
    this.activeBoss = boss;
    arcadeAudio.playSfx("boss", "spawn");
    this.showFeedback(`MID-BOSS: ${bossConfig.label}`);
    this.floatText(`MID ${bossConfig.label}`, WIDTH / 2, sy(170), "#c7ff3a");
    this.spawnObstacleAt("barricade", WIDTH + sx(190));
    this.spawnObstacleAt("drone", WIDTH + sx(340));
  }

  spawnMiniBoss() {
    this.bossSpawned = true;
    const configs = {
      valencia: { type: "sprinter", hp: 11, label: "PALM RUSH", x: WIDTH + sx(280) },
      roma: { type: "bruiser", hp: 16, label: "ARENA BRUTE", x: WIDTH + sx(280) },
      paris: { type: "shooter", hp: 12, label: "NEON SNIPER", x: WIDTH + sx(300) },
      venecia: { type: "shooter", hp: 13, label: "CANAL GUNNER", x: WIDTH + sx(300) },
      londres: { type: "shooter", hp: 18, label: "BIG BEN HUNTER", x: WIDTH + sx(330) },
    };
    const bossConfig = configs[this.city.key] || configs.londres;
    const boss = this.spawnEnemyAt(bossConfig.x, bossConfig.type);
    const def = boss.getData("typeDef");
    boss.setTexture(`boss-${this.city.key}-idle`);
    boss.setScale(def.scale * (this.city.key === "londres" ? 1.4 : 1.28));
    boss.body.setSize(def.body.width + (this.city.key === "londres" ? 18 : 12), def.body.height + (this.city.key === "londres" ? 22 : 16));
    boss.setData("hp", bossConfig.hp);
    boss.setData("maxHp", bossConfig.hp);
    boss.setData("isBoss", true);
    boss.setData("bossLabel", bossConfig.label);
    boss.setData("score", 1400);
    boss.setData("bossPhase", 1);
    boss.setData("nextShot", this.time.now + 900);
    boss.setData("nextSpecial", this.time.now + 1500);
    boss.setData("spritePrefix", `boss-${this.city.key}`);
    boss.setData("bossCasting", false);
    boss.setData("bossCastType", null);
    boss.setData("bossCastUntil", 0);
    boss.setData("bossDashUntil", 0);
    this.activeBoss = boss;
    arcadeAudio.startBossMusic(this, this.city.key);
    arcadeAudio.playSfx("boss", "spawn");
    this.showFeedback(`FINAL BOSS: ${bossConfig.label}`);
    this.floatText(`FINAL ${bossConfig.label}`, WIDTH / 2, sy(170), "#ff365f");
    if (this.city.key === "londres") {
      this.spawnObstacleAt("barricade", WIDTH + sx(210));
      this.spawnEnemyAt(WIDTH + sx(420), "sprinter");
    }
  }

  handleHit(obstacle) {
    if (this.isGameOver || this.time.now < this.invulnerableUntil) {
      return;
    }

    this.hitsTaken += 1;
    if (obstacle?.destroy) {
      obstacle.destroy();
    }
    this.combo = 1;
    this.comboTierShown = 1;
    this.comboBurst.setAlpha(0);
    this.runner.setVelocityX(this.runner.flipX ? sx(120) : -sx(120));
    this.cameras.main.flash(90, 255, 54, 95, false);
    this.damageOverlay.setAlpha(0.28);
    this.tweens.killTweensOf(this.damageOverlay);
    this.tweens.add({
      targets: this.damageOverlay,
      alpha: 0,
      duration: 220,
      ease: "Quad.Out",
    });

    if (this.time.now < this.shieldUntil) {
      this.shieldUntil = 0;
      this.invulnerableUntil = this.time.now + 900;
      this.spawnBurst(this.runner.x, this.runner.y - 54);
      this.floatText("ESCUDO!", this.runner.x + 45, this.runner.y - 96, "#40d8ff");
      this.cameras.main.shake(170, 0.006);
      return;
    }

    this.invulnerableUntil = this.time.now + 1100;
    this.lastDamageAt = this.time.now;

    if (this.time.now < this.superOutfitUntil) {
      this.superOutfitUntil = 0;
      this.fireLevel = 3;
      this.socks = Math.min(this.socks, 6);
      this.weapon = "Pistol";
      this.isPowered = true;
      this.health = 2;
      this.applyRunnerBody();
      this.floatText("OUTFIT ROTO", this.runner.x + 52, this.runner.y - 96, "#ff8b22");
      this.cameras.main.shake(220, 0.008);
      return;
    }

    if (this.time.now < this.scooterUntil) {
      this.scooterUntil = 0;
      this.turboUntil = 0;
      this.scooters = 0;
      this.floatText("PATINETE ROTO", this.runner.x + 52, this.runner.y - 96, "#4ae0c2");
      this.cameras.main.shake(220, 0.008);
      return;
    }

    if (this.specialWeapon && this.specialAmmo > 0) {
      const lostWeapon = this.specialWeapon;
      this.specialWeapon = null;
      this.specialAmmo = 0;
      this.floatText(`${lostWeapon.toUpperCase()} PERDIDA`, this.runner.x + 52, this.runner.y - 96, lostWeapon === "Laser" ? "#40d8ff" : "#ff8b22");
      this.showFeedback(`Golpe recibido: pierdes ${lostWeapon === "Laser" ? "el laser" : "los cohetes"}`);
      this.cameras.main.shake(220, 0.008);
      return;
    }

    if (this.isPowered && this.health > 1) {
      this.health = 1;
      this.fireLevel = Math.max(1, this.fireLevel - 1);
      this.socks = this.fireLevel >= 4 ? 9 : this.fireLevel === 3 ? 6 : this.fireLevel === 2 ? 3 : 0;
      this.isPowered = this.fireLevel > 1;
      this.weapon = "Pistol";
      this.applyRunnerBody();
      this.floatText("OUCH! BAJA DE NIVEL", this.runner.x + 48, this.runner.y - 94, "#ffd95c");
      this.cameras.main.shake(260, 0.01);
      this.runner.setTint(0xffd95c);
      this.time.delayedCall(180, () => this.runner.clearTint());
      return;
    }

    this.endRun();
  }

  floatText(label, x, y, color = "#c7ff3a") {
    const text = this.add
      .text(x, y - 24, `+ ${label}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: "14px",
        color,
        stroke: "#14151c",
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: y - 78,
      alpha: 0,
      duration: 760,
      ease: "Cubic.Out",
      onComplete: () => text.destroy(),
    });
  }

  upgradeFirePower() {
    const previousLevel = this.fireLevel;
    if (this.socks >= 9) {
      this.fireLevel = 4;
    } else if (this.socks >= 6) {
      this.fireLevel = 3;
    } else if (this.socks >= 3) {
      this.fireLevel = 2;
    } else {
      this.fireLevel = 1;
    }

    this.isPowered = this.fireLevel > 1;
    this.health = this.isPowered ? 2 : 1;
    this.applyRunnerBody();

    if (this.fireLevel > previousLevel) {
      const labels = {
        2: "DOBLE DISPARO",
        3: "TRIPLE DISPARO",
        4: "DISPARO ANCHO",
      };
      this.floatText(labels[this.fireLevel] || "POWER UP", this.runner.x + sx(46), this.runner.y - sy(110), "#40d8ff");
      this.showFeedback(`Calcetines ${this.socks}/9: ${labels[this.fireLevel] || "POWER UP"}`);
      this.cameras.main.flash(120, 64, 216, 255, false);
      arcadeAudio.playSfx("reward");
    }
  }

  getMissionRank(victory = true) {
    const scoreFactor = this.score;
    const enemyFactor = this.enemiesDefeated * 90;
    const rescueFactor = this.prisonersSaved * 180;
    const total = scoreFactor + enemyFactor + rescueFactor;
    if (!victory) {
      return total > 20000 ? "A" : total > 9000 ? "B" : "C";
    }
    if (total > 42000) {
      return "KAMUABU LEGEND";
    }
    if (total > 28000) {
      return "S";
    }
    if (total > 18000) {
      return "A";
    }
    return "B";
  }

  completeMission() {
    this.isGameOver = true;
    this.runner.setVelocity(0, 0);
    this.bossHudGlow.setVisible(false);
    this.bossBarShell.setVisible(false);
    this.bossBarFrame.setVisible(false);
    this.bossBarUnder.setVisible(false);
    this.bossBarFill.setVisible(false);
    this.bossBarShine.setVisible(false);
    this.bossPortraitFrame.setVisible(false);
    this.bossPortrait.setVisible(false);
    this.bossNameText.setVisible(false);
    this.bossPhaseText.setVisible(false);
    this.score += 1500 + this.prisonersSaved * 300 + this.enemiesDefeated * 80;
    this.best = Math.max(this.best, Math.floor(this.score));
    localStorage.setItem(BEST_KEY, String(this.best));
    const rank = this.getMissionRank(true);
    arcadeAudio.playSfx("victory");
    this.victoryText = this.add
      .text(WIDTH / 2, 144, `MISSION COMPLETE\n${this.city.name.toUpperCase()}\nRANGO ${rank}\n${padScore(this.score)} PUNTOS\nR: OTRA VEZ  ESC: CIUDADES`, {
        fontFamily: '"Press Start 2P"',
        fontSize: "25px",
        color: "#c7ff3a",
        align: "center",
        stroke: "#14151c",
        strokeThickness: 8,
      })
      .setOrigin(0.5);
    this.cameras.main.flash(320, 199, 255, 58, false);
    this.syncHud();
    if (!this.demoMode) {
      competitionUi.finishRun(this.buildCompetitionPayload(true));
    }
  }

  endRun() {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;
    this.combo = 1;
    this.bossHudGlow.setVisible(false);
    this.bossBarShell.setVisible(false);
    this.bossBarFrame.setVisible(false);
    this.bossBarUnder.setVisible(false);
    this.bossBarFill.setVisible(false);
    this.bossBarShine.setVisible(false);
    this.bossPortraitFrame.setVisible(false);
    this.bossPortrait.setVisible(false);
    this.bossNameText.setVisible(false);
    this.bossPhaseText.setVisible(false);
    this.runner.setTint(0xff365f);
    this.runner.setVelocity(0, -170);
    this.runner.body.setGravityY(1700);
    this.obstacles.children.each((obstacle) => obstacle.setVelocityX(0));
    this.rewards.children.each((reward) => reward.setVelocityX(0));
    this.enemies.children.each((enemy) => enemy.setVelocityX(0));
    this.playerBullets.clear(true, true);
    this.enemyBullets.clear(true, true);
    this.cameras.main.shake(320, 0.012);

    this.best = Math.max(this.best, Math.floor(this.score));
    localStorage.setItem(BEST_KEY, String(this.best));
    const rank = this.getMissionRank(false);
    arcadeAudio.playSfx("gameover");
    this.gameOverText
      .setText(`GAME OVER\n${this.city.name.toUpperCase()} - ${padScore(this.score)}\nRANGO ${rank}\nR/CLICK: REPETIR  ESC: CIUDADES`)
      .setVisible(true);
    this.titleText.setVisible(false);
    this.tipText.setVisible(false);
    this.syncHud();
    if (!this.demoMode) {
      competitionUi.finishRun(this.buildCompetitionPayload(false));
    }
  }

  moveWorld(deltaSeconds) {
    const speed = this.scrollSpeed;

    this.skyline.x -= speed * 0.035 * deltaSeconds;
    if (this.skyline.x < -sx(156)) {
      this.skyline.x = 0;
    }

    this.midground.x -= speed * 0.055 * deltaSeconds;
    if (this.midground.x < -sx(210)) {
      this.midground.x = 0;
    }

    this.backdrop.x -= speed * 0.075 * deltaSeconds;
    if (this.backdrop.x < -sx(188)) {
      this.backdrop.x = 0;
    }

    if (this.sign) {
      this.sign.x -= speed * 0.13 * deltaSeconds;
      if (this.sign.x < -sx(260)) {
        this.sign.x = WIDTH + sx(260);
      }
    }

    this.landmark.x -= speed * 0.08 * deltaSeconds;
    if (this.landmark.x < -sx(220)) {
      this.landmark.x = WIDTH + sx(220);
    }

    for (const prop of this.props) {
      prop.x -= speed * 0.15 * deltaSeconds;
      const propType = prop.getData("type");
      if (propType === "bus") {
        prop.y = prop.getData("baseY") + Math.sin((this.time.now + prop.x) / 220) * sy(1.6);
      } else if (propType === "traffic") {
        const lights = prop.getData("lights");
        if (lights) {
          const cycle = Math.floor(((this.time.now + lights.offset) % 2700) / 900);
          lights.red.alpha = cycle === 0 ? 1 : 0.25;
          lights.amber.alpha = cycle === 1 ? 1 : 0.2;
          lights.green.alpha = cycle === 2 ? 1 : 0.25;
        }
      } else if (propType === "steam") {
        const plumes = prop.getData("plumes");
        if (plumes) {
          plumes[0].alpha = 0.12 + Math.sin((this.time.now + prop.x) / 280) * 0.05;
          plumes[1].alpha = 0.08 + Math.cos((this.time.now + prop.x) / 320) * 0.04;
          plumes[0].scaleX = 1 + Math.sin((this.time.now + prop.x) / 360) * 0.1;
          plumes[1].scaleX = 1 + Math.cos((this.time.now + prop.x) / 400) * 0.08;
          plumes[0].y = -sy(18) + Math.sin((this.time.now + prop.x) / 420) * sy(2);
          plumes[1].y = -sy(38) + Math.cos((this.time.now + prop.x) / 460) * sy(2);
        }
      } else if (propType === "gondola") {
        prop.y = prop.getData("baseY") + Math.sin((this.time.now + prop.x) / 320) * sy(2.4);
      } else if (propType === "banner") {
        const cloth = prop.getData("cloth");
        if (cloth) {
          cloth.scaleY = 1 + Math.sin((this.time.now + prop.x) / 240) * 0.08;
          cloth.angle = Math.sin((this.time.now + prop.x) / 270) * 3.5;
        }
      } else if (propType === "palm") {
        prop.angle = Math.sin((this.time.now + prop.x) / 340) * 2.4;
      } else if (propType === "cafe") {
        prop.alpha = 0.92 + Math.sin((this.time.now + prop.x) / 420) * 0.08;
      }
      if (prop.x < -sx(120)) {
        prop.x = WIDTH + Phaser.Math.Between(sx(80), sx(260));
      }
    }

    if (this.frontDepthProps) {
      for (const prop of this.frontDepthProps) {
        prop.x -= speed * (prop.getData("speedFactor") ?? 0.22) * deltaSeconds;
        if (prop.x < -sx(180)) {
          prop.x = WIDTH + Phaser.Math.Between(sx(90), sx(220));
        }
      }
    }

    for (const tile of this.trackLines) {
      tile.x -= speed * deltaSeconds;
      if (tile.x < -sx(45)) {
        tile.x = WIDTH + sx(45);
      }
    }

    if (this.weatherProps) {
      const boostedWeather = this.time.now < this.weatherBoostUntil;
      for (const entry of this.weatherProps) {
        if (entry.type === "rain") {
          entry.sprite.alpha = boostedWeather ? 0.62 : 0.38;
          entry.sprite.x -= speed * 0.08 * deltaSeconds;
          entry.sprite.y += entry.speed * deltaSeconds * (boostedWeather ? 1.45 : 1);
          if (entry.sprite.y > GROUND_Y + sy(18)) {
            this.spawnRainSplash(entry.sprite.x, GROUND_Y + sy(30));
            entry.sprite.y = sy(80);
            entry.sprite.x = Phaser.Math.Between(0, WIDTH);
          }
          if (entry.sprite.x < -sx(20)) {
            entry.sprite.x = WIDTH + sx(20);
          }
        } else if (entry.type === "shimmer") {
          entry.sprite.alpha = boostedWeather ? 0.58 : 0.35;
          entry.sprite.x -= speed * 0.12 * deltaSeconds + entry.speed * deltaSeconds * (boostedWeather ? 1.6 : 1);
          if (entry.sprite.x < -sx(50)) {
            entry.sprite.x = WIDTH + sx(50);
          }
        } else if (entry.type === "glow") {
          entry.sprite.alpha = (boostedWeather ? 0.22 : 0.14) + Math.sin(this.time.now / 520) * 0.04;
        } else if (entry.type === "fog") {
          entry.sprite.alpha = boostedWeather ? 0.14 : 0.08;
        } else if (entry.type === "puddle") {
          entry.sprite.alpha = 0.1 + Math.sin((this.time.now + entry.sprite.x) / 280) * 0.06;
        } else if (entry.type === "waterRipple") {
          entry.sprite.alpha = 0.06 + Math.sin((this.time.now + entry.sprite.x) / 340) * 0.05;
          entry.sprite.scaleX = 1 + Math.sin((this.time.now + entry.sprite.x) / 260) * 0.08;
        }
      }
    }

    const speedAlpha = Phaser.Math.Clamp((this.scrollSpeed - 180) / 320, 0, 0.5);
    if (this.speedLines) {
      for (const line of this.speedLines) {
        line.alpha = speedAlpha;
        if (speedAlpha > 0.02) {
          line.x -= (speed * 1.45 + sx(120)) * deltaSeconds;
          if (line.x < -sx(120)) {
            line.x = WIDTH + sx(120);
            line.y = Phaser.Math.Between(sy(120), sy(360));
            line.width = Phaser.Math.Between(sx(56), sx(124));
          }
        }
      }
    }

    for (const group of [this.obstacles, this.rewards, this.crates, this.prisoners, this.solidBoxes]) {
      group.children.each((item) => {
        item.x -= speed * deltaSeconds;
      });
    }
  }

  recycleObjects() {
    this.obstacles.children.each((obstacle) => {
      if (obstacle.x < -sx(130)) {
        obstacle.destroy();
      }
    });

    this.rewards.children.each((reward) => {
      if (reward.x < -sx(100)) {
        this.combo = 1;
        reward.destroy();
      }
    });

    for (const group of [this.enemies, this.enemyBullets, this.crates, this.prisoners, this.solidBoxes]) {
      group.children.each((item) => {
        const isEnemy = group === this.enemies;
        const isBoss = isEnemy && item.getData("isBoss");
        const rightCull =
          isBoss
            ? WIDTH + sx(520)
            : isEnemy
              ? WIDTH + sx(420)
              : WIDTH + sx(280);
        if (item.x < -sx(160) || item.x > rightCull || item.y > HEIGHT + sy(120)) {
          if (group === this.enemies) {
            const warn = item.getData("warning");
            if (warn) {
              warn.destroy();
              item.setData("warning", null);
            }
          }
          item.destroy();
        }
      });
    }
  }

  animateRunner(time) {
    const onGround = this.runner.body.onFloor?.() || this.runner.body.blocked.down || this.runner.body.touching.down;

    if (this.time.now < this.invulnerableUntil) {
      this.runner.setAlpha(time % 150 < 75 ? 0.38 : 1);
      this.runner.clearTint();
    } else if (this.time.now < this.scooterUntil) {
      this.runner.setAlpha(1);
      this.runner.setTint(0x4ae0c2);
    } else if (this.time.now < this.superOutfitUntil) {
      this.runner.setAlpha(time % 180 < 90 ? 0.88 : 1);
      this.runner.setTint(time % 240 < 120 ? 0xffd95c : 0xff8b22);
    } else if (this.time.now < this.shieldUntil) {
      this.runner.setAlpha(time % 220 < 110 ? 0.82 : 1);
      this.runner.setTint(0x40d8ff);
    } else {
      this.runner.setAlpha(1);
      if (!this.isGameOver) {
        this.runner.clearTint();
      }
    }

    if (this.isDucking) {
      const duckTexture = this.isPowered ? "runner-big-duck" : "runner-duck";
      if (this.runner.texture.key !== duckTexture) {
        this.runner.setTexture(duckTexture);
      }
      const duckScale = this.isPowered ? 0.94 : 0.84;
      this.runner.setScale(duckScale, duckScale);
      this.runner.setAngle(0);
      return;
    }

    if (onGround) {
      const moving = Math.abs(this.runner.body.velocity.x) > 25 || this.scrollSpeed > 0;
      if (moving) {
        const sprinting = time < this.sprintUntil;
        const scootering = time < this.scooterUntil;
        const runFrames = scootering
          ? this.isPowered
            ? ["runner-big-scooter-a", "runner-big-scooter-b"]
            : ["runner-scooter-a", "runner-scooter-b"]
          : this.isPowered
            ? ["runner-big-run", "runner-big-run-mid", "runner-big-run-alt"]
            : sprinting
              ? ["runner-sprint-a", "runner-sprint-b", "runner-small-run-mid"]
              : ["runner-small-run", "runner-small-run-mid", "runner-small-run-alt"];
        const frameRate = sprinting ? 70 : 95;
        const texture = runFrames[Math.floor(time / frameRate) % runFrames.length];
        if (this.runner.texture.key !== texture) {
          this.runner.setTexture(texture);
        }
      } else {
        const idleTexture = this.isPowered ? "runner-big" : "runner-small";
        if (this.runner.texture.key !== idleTexture) {
          this.runner.setTexture(idleTexture);
        }
      }

      const stretch = Math.sin(time / 85) * 0.024;
      const baseScale = this.time.now < this.scooterUntil ? 0.9 : this.isPowered ? 0.94 : 0.84;
      this.runner.setScale(baseScale + stretch * 0.45, baseScale - stretch * 0.3);
    } else {
      const airTexture = this.isPowered ? "runner-big-jump" : "runner-small-jump";
      if (this.runner.texture.key !== airTexture) {
        this.runner.setTexture(airTexture);
      }
      this.runner.setScale(this.isPowered ? 0.94 : 0.84, this.isPowered ? 0.94 : 0.84);
    }

  }

  syncHud() {
    const missionPct = Math.floor((this.stageDistance / this.stageLength) * 100);
    const remainingPct = Math.max(0, 100 - missionPct);
    const miniPct = Phaser.Math.Clamp((Math.floor(this.stageLength * 0.5) / this.stageLength) * 100, 0, 100);
    const bossPct = Phaser.Math.Clamp(((this.stageLength - 2600) / this.stageLength) * 100, 0, 100);
    const phaseMap = {
      intro: "STREET RUN",
      warmup: "WARMUP",
      patrol: "CITY FLOW",
      chase: "PRESSURE",
      assault: "DANGER",
      chaos: "MAYHEM",
      final: "FINAL PUSH",
    };
    scoreEl.textContent = padScore(this.score);
    comboEl.textContent = `x${this.combo}`;
    bestEl.textContent = padScore(this.best || 0);
    cityEl.textContent = this.city.name === "Valencia" ? "VLC" : this.city.name;
    socksEl.textContent = `${this.socks}/9`;
    stateEl.textContent =
      this.time.now < this.scooterUntil
        ? "Patinete"
        : this.time.now < this.superOutfitUntil
        ? "Outfit"
        : this.specialWeapon
          ? `${this.specialWeapon} ${this.specialAmmo}`
        : this.time.now < this.shieldUntil
          ? "Shield"
        : this.time.now < this.turboUntil
            ? "Turbo"
            : this.scooters > 0
              ? `PAT ${this.scooters}/5`
            : this.isPowered
              ? `XL F${this.fireLevel}`
              : "Normal";
    weaponEl.textContent =
      this.time.now < this.scooterUntil
        ? "PATINETE"
        : this.time.now < this.superOutfitUntil
        ? "OUTFIT"
        : this.specialWeapon === "Laser"
          ? `LASER ${this.specialAmmo}`
          : this.specialWeapon === "Rocket"
            ? `ROCKET ${this.specialAmmo}`
        : this.fireLevel >= 4
          ? "WIDE x4"
          : `P x${this.fireLevel}`;
    missionEl.textContent = `${missionPct}%`;
    socksEl.parentElement?.style.setProperty("--meter", `${(this.socks / 9) * 100}%`);
    missionEl.parentElement?.style.setProperty("--meter", `${Phaser.Math.Clamp(missionPct, 0, 100)}%`);
    if (progressFillEl) {
      progressFillEl.style.width = `${Phaser.Math.Clamp(missionPct, 0, 100)}%`;
    }
    if (progressDistanceEl) {
      progressDistanceEl.textContent = remainingPct <= 0 ? "META" : `FALTA ${remainingPct}%`;
    }
    if (progressLabelEl) {
      progressLabelEl.textContent = `${this.city.name.toUpperCase()} STAGE`;
    }
    if (progressPhaseEl) {
      progressPhaseEl.textContent = phaseMap[this.missionPhase] || "ARCADE RUN";
    }
    if (progressMiniEl) {
      progressMiniEl.style.left = `${miniPct}%`;
      progressMiniEl.style.opacity = missionPct >= miniPct ? "0.42" : "1";
    }
    if (progressBossEl) {
      progressBossEl.style.left = `${bossPct}%`;
      progressBossEl.style.opacity = missionPct >= bossPct ? "0.42" : "1";
    }
  }

  updateBossHud() {
    const boss = this.activeBoss;
    if (!boss?.active || this.isGameOver) {
      this.bossHudGlow.setVisible(false);
      this.bossBarShell.setVisible(false);
      this.bossBarFrame.setVisible(false);
      this.bossBarUnder.setVisible(false);
      this.bossBarFill.setVisible(false);
      this.bossBarShine.setVisible(false);
      this.bossPortraitFrame.setVisible(false);
      this.bossPortrait.setVisible(false);
      this.bossNameText.setVisible(false);
      this.bossPhaseText.setVisible(false);
      return;
    }

    const maxHp = Math.max(1, boss.getData("maxHp") ?? 1);
    const hp = Phaser.Math.Clamp(boss.getData("hp") ?? maxHp, 0, maxHp);
    const ratio = hp / maxHp;
    const width = sx(372) * ratio;
    const phase = boss.getData("bossPhase") ?? 1;
    const portraitTexture = boss.getData("spritePrefix")
      ? `${boss.getData("spritePrefix")}-idle`
      : boss.texture.key;
    const fillColor = ratio > 0.66 ? this.city.glow : ratio > 0.33 ? this.city.highlight : this.city.accent;
    this.bossHudGlow.setVisible(true).setFillStyle(this.city.accent, ratio > 0.33 ? 0.11 : 0.18);
    this.bossBarShell.setVisible(true);
    this.bossBarFrame.setVisible(true);
    this.bossBarUnder.setVisible(true);
    this.bossBarFill.setVisible(true);
    this.bossBarShine.setVisible(true);
    this.bossPortraitFrame.setVisible(true);
    this.bossPortrait.setVisible(true).setTexture(portraitTexture).setFlipX(true);
    this.bossNameText.setVisible(true);
    this.bossPhaseText.setVisible(true);
    this.bossNameText.setText(boss.getData("bossLabel") || "BOSS");
    this.bossPhaseText.setText(`PHASE ${phase}`);
    this.bossBarFill.width = Math.max(sx(12), width);
    this.bossBarFill.setPosition(WIDTH / 2 - sx(170) + this.bossBarFill.width / 2, sy(82));
    this.bossBarFill.setFillStyle(fillColor, 1);
    this.bossBarShine.width = Math.max(sx(12), width - sx(8));
    this.bossBarShine.setPosition(WIDTH / 2 - sx(170) + this.bossBarShine.width / 2, sy(78));
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: WIDTH,
  height: HEIGHT,
  resolution: RENDER_RESOLUTION,
  pixelArt: false,
  roundPixels: false,
  render: {
    antialias: true,
    antialiasGL: true,
    pixelArt: false,
    roundPixels: false,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, PlayScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
