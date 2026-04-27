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
    sky: "#7e8c96",
    wall: 0x8a8478,
    brickA: 0x9f9688,
    brickB: 0x756d62,
    road: 0x464138,
    accent: 0xff7a4e,
    highlight: 0xffdd9a,
    shadow: 0x4f473d,
    glow: 0x4ed9d1,
    sign: "KAMUABU VLC",
    landmark: "PALMERAS + AZULEJOS",
    obstaclePool: ["barrel", "barrel", "barricade"],
  },
  {
    key: "roma",
    name: "Roma",
    sky: "#8d735d",
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
    sky: "#526176",
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
    sky: "#5a7685",
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
    sky: "#515c6d",
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

  startPattern(scene, pattern, bpm = 140) {
    this.stopMusic();
    this.musicScene = scene;
    let step = 0;
    const interval = (60 / bpm) * 1000 / 2;
    this.musicEvent = scene.time.addEvent({
      delay: interval,
      loop: true,
      callback: () => {
        const current = pattern[step % pattern.length];
        if (current.lead) {
          this.tone(NOTE_FREQ[current.lead], 0.12, "square", 0.022);
        }
        if (current.harmony) {
          this.tone(NOTE_FREQ[current.harmony], 0.1, "triangle", 0.016, 0.01);
        }
        if (current.arp) {
          current.arp.forEach((note, index) => this.tone(NOTE_FREQ[note], 0.045, "square", 0.016, index * 0.035));
        }
        if (current.bass) {
          this.tone(NOTE_FREQ[current.bass], 0.16, "triangle", 0.03);
        }
        if (current.kick) {
          this.kick(0, current.kick === true ? 0.055 : current.kick);
        }
        if (current.snare) {
          this.noise(0.04, 0.015);
        }
        if (current.hat) {
          this.hat(0.01, current.hat === true ? 0.011 : current.hat, current.hat === "open");
        }
        step += 1;
      },
    });
  }

  startMenuMusic(scene) {
    const pattern = [
      { lead: "C5", harmony: "E5", bass: "C4", kick: true, hat: true },
      { arp: ["E5", "G5"], hat: true },
      { lead: "G5", harmony: "C5", bass: "G4", snare: true, hat: "open" },
      { lead: "E5", hat: true },
      { lead: "D5", harmony: "F5", bass: "A4", kick: true, hat: true },
      { arp: ["F5", "A5"], hat: true },
      { lead: "A5", harmony: "C5", bass: "F4", snare: true, hat: "open" },
      { lead: "G5", bass: "C4", hat: true },
    ];
    this.startPattern(scene, pattern, 138);
  }

  startCityMusic(scene, cityKey) {
    const patterns = {
      valencia: [
        { lead: "E5", harmony: "A5", bass: "A4", kick: true, hat: true },
        { arp: ["G5", "A5"], hat: true },
        { lead: "A5", harmony: "E5", bass: "E4", snare: true, hat: "open" },
        { lead: "E5", hat: true },
        { lead: "D5", harmony: "F5", bass: "F4", kick: true, hat: true },
        { arp: ["E5", "G5"], hat: true },
        { lead: "G5", harmony: "A5", bass: "D4", snare: true, hat: "open" },
        { lead: "A5", bass: "A4", hat: true },
      ],
      roma: [
        { lead: "C5", harmony: "G4", bass: "C4", kick: true, hat: true },
        { arp: ["D5", "F5"], hat: true },
        { lead: "G5", harmony: "D5", bass: "G4", snare: true, hat: "open" },
        { lead: "F5", hat: true },
        { lead: "E5", harmony: "A4", bass: "A4", kick: true, hat: true },
        { arp: ["D5", "C5"], hat: true },
        { lead: "C5", harmony: "F4", bass: "F4", snare: true, hat: "open" },
        { lead: "G4", bass: "C4", hat: true },
      ],
      paris: [
        { lead: "G5", harmony: "B4", bass: "E4", kick: true, hat: true },
        { arp: ["A5", "G5"], hat: true },
        { lead: "E5", harmony: "B4", bass: "B4", snare: true, hat: "open" },
        { lead: "D5", hat: true },
        { lead: "F5", harmony: "A5", bass: "D4", kick: true, hat: true },
        { arp: ["A5", "G5"], hat: true },
        { lead: "G5", harmony: "E5", bass: "C4", snare: true, hat: "open" },
        { lead: "E5", bass: "E4", hat: true },
      ],
      venecia: [
        { lead: "A4", harmony: "C5", bass: "F4", kick: true, hat: true },
        { arp: ["C5", "E5"], hat: true },
        { lead: "E5", harmony: "A5", bass: "A4", snare: true, hat: "open" },
        { lead: "D5", hat: true },
        { lead: "C5", harmony: "A4", bass: "G4", kick: true, hat: true },
        { arp: ["A4", "C5"], hat: true },
        { lead: "F4", harmony: "A4", bass: "E4", snare: true, hat: "open" },
        { lead: "E5", bass: "A4", hat: true },
      ],
      londres: [
        { lead: "D5", harmony: "A4", bass: "D4", kick: true, hat: true },
        { arp: ["F5", "A5"], hat: true },
        { lead: "A5", harmony: "D5", bass: "D4", snare: true, hat: "open" },
        { lead: "G5", hat: true },
        { lead: "E5", harmony: "G5", bass: "C4", kick: true, hat: true },
        { arp: ["D5", "F5"], hat: true },
        { lead: "F5", harmony: "A4", bass: "A4", snare: true, hat: "open" },
        { lead: "C5", bass: "D4", hat: true },
      ],
    };
    this.startPattern(scene, patterns[cityKey] || patterns.londres, 148);
  }

  startBossMusic(scene, cityKey) {
    const patterns = {
      valencia: [
        { lead: "A4", harmony: "C5", bass: "A3", kick: true, hat: true },
        { arp: ["C5", "E5"], hat: true },
        { lead: "E5", harmony: "A5", bass: "E4", snare: true, hat: "open" },
        { lead: "D5", bass: "A3", hat: true },
      ],
      roma: [
        { lead: "C5", harmony: "F4", bass: "C4", kick: true, hat: true },
        { arp: ["D5", "G5"], hat: true },
        { lead: "G5", harmony: "C5", bass: "G4", snare: true, hat: "open" },
        { lead: "F5", bass: "C4", hat: true },
      ],
      paris: [
        { lead: "E5", harmony: "G5", bass: "E4", kick: true, hat: true },
        { arp: ["G5", "A5"], hat: true },
        { lead: "A5", harmony: "E5", bass: "B3", snare: true, hat: "open" },
        { lead: "G5", bass: "E4", hat: true },
      ],
      venecia: [
        { lead: "A4", harmony: "E5", bass: "A3", kick: true, hat: true },
        { arp: ["C5", "E5"], hat: true },
        { lead: "E5", harmony: "A5", bass: "F4", snare: true, hat: "open" },
        { lead: "D5", bass: "A3", hat: true },
      ],
      londres: [
        { lead: "D5", harmony: "F5", bass: "D4", kick: true, hat: true },
        { arp: ["F5", "A5"], hat: true },
        { lead: "A5", harmony: "D5", bass: "A3", snare: true, hat: "open" },
        { lead: "F5", bass: "D4", hat: true },
      ],
    };
    this.startPattern(scene, patterns[cityKey] || patterns.londres, 164);
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

    const solidBox = this.make.graphics({ x: 0, y: 0, add: false });
    solidBox.fillStyle(0x111218);
    solidBox.fillRect(0, 0, 78, 58);
    solidBox.fillStyle(0x9d5f2c);
    solidBox.fillRect(4, 4, 70, 50);
    solidBox.fillStyle(0xd8904a);
    solidBox.fillRect(8, 8, 62, 12);
    solidBox.fillRect(8, 34, 62, 12);
    solidBox.fillStyle(0x6d3e1d);
    solidBox.fillRect(34, 4, 10, 50);
    solidBox.fillRect(8, 24, 62, 8);
    solidBox.fillStyle(0xf2ead8);
    solidBox.fillRect(14, 10, 12, 6);
    solidBox.fillRect(52, 10, 12, 6);
    solidBox.fillRect(14, 36, 12, 6);
    solidBox.fillRect(52, 36, 12, 6);
    solidBox.generateTexture("solid-box", 78, 58);
    solidBox.destroy();

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
    this.selected = 0;
    this.attractStartedAt = this.time.now;
    this.demoLaunched = false;
    this.cameras.main.setBackgroundColor("#15151c");
    arcadeAudio.startMenuMusic(this);
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x15151c);
    this.drawArcadeFrame();
    this.createHeader();
    this.createFeaturePanel();
    this.selectorTabs = CITIES.map((city, index) => this.createSelectorTab(city, index));
    this.createFooter();

    this.input.keyboard.on("keydown-LEFT", () => { this.resetAttract(); this.pick(this.selected - 1); });
    this.input.keyboard.on("keydown-RIGHT", () => { this.resetAttract(); this.pick(this.selected + 1); });
    this.input.keyboard.on("keydown-UP", () => { this.resetAttract(); this.moveVertical(-1); });
    this.input.keyboard.on("keydown-DOWN", () => { this.resetAttract(); this.moveVertical(1); });
    this.input.keyboard.on("keydown-ENTER", () => { this.resetAttract(); this.startSelected(); });
    this.input.keyboard.on("keydown-SPACE", () => { this.resetAttract(); this.startSelected(); });
    this.input.on("pointerdown", (pointer, targets) => {
      this.resetAttract();
      if (targets.length > 0) {
        return;
      }
      this.startSelected();
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

    this.add.rectangle(infoX, sy(198), sx(336), sy(82), 0x171920).setStrokeStyle(sx(3), 0x343844);
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
      this.pick(index);
      this.startSelected();
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
      .text(WIDTH / 2, sy(612), "IZQ / DER para elegir   |   ENTER o ESPACIO para viajar   |   ESC vuelve al selector", {
        fontFamily: '"Press Start 2P"',
        fontSize: `${helpFont}px`,
        color: "#40d8ff",
      })
      .setOrigin(0.5);
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
    if (idle > 3500 && !this.demoLaunched && Math.floor(idle / 1200) % 2 === 0) {
      this.pick(this.selected + 1);
    }
    if (idle > 9000 && !this.demoLaunched) {
      this.demoLaunched = true;
      this.scene.start("PlayScene", { cityKey: CITIES[this.selected].key, demoMode: true });
    }
  }
}

class PlayScene extends Phaser.Scene {
  constructor() {
    super("PlayScene");
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
    this.isPowered = false;
    this.health = 1;
    this.isDucking = false;
    this.weapon = "Pistol";
    this.ammo = Infinity;
    this.fireLevel = 1;
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
    this.bossSpawned = false;
    this.bossDefeated = false;
    this.prevRunnerOnGround = false;
    this.comboTierShown = 1;

    this.cameras.main.setBackgroundColor(this.city.sky);
    this.physics.world.setBounds(0, 0, WIDTH, HEIGHT);
    this.events.once("shutdown", () => arcadeAudio.stopMusic());
    arcadeAudio.startCityMusic(this, this.city.key);

    this.createWorld();
    this.createRunner();
    this.createGroups();
    this.createTextPanels();
    this.registerInput();
    this.stageScript = this.buildStageScript();
    this.syncHud();
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
    this.skyline = this.add.layer();
    this.midground = this.add.layer();
    this.backdrop = this.add.layer();
    this.landmarkLayer = this.add.layer();
    this.propLayer = this.add.layer();
    this.foreground = this.add.layer();
    this.weatherLayer = this.add.layer();
    this.speedLayer = this.add.layer();

    this.createSkyline();
    this.createMidDepth();
    this.createWall();
    this.createLandmark();
    this.createStreetProps();
    this.createStreet();
    this.createAtmosphere();
    this.createSpeedLines();
  }

  createMidDepth() {
    const haze = this.add.rectangle(WIDTH / 2, sy(238), WIDTH + sx(120), sy(174), this.city.shadow, 0.1);
    this.midground.add(haze);

    if (this.city.key === "londres") {
      for (let i = 0; i < 6; i += 1) {
        const x = sx(90) + i * sx(224);
        const block = this.add.container(x, sy(246));
        block.add(this.add.rectangle(0, 0, sx(148), sy(116), 0x3d4451, 0.42));
        block.add(this.add.rectangle(0, -sy(42), sx(132), sy(6), this.city.highlight, 0.08));
        block.add(this.add.rectangle(-sx(38), sy(10), sx(24), sy(56), 0x222833, 0.5));
        block.add(this.add.rectangle(sx(26), sy(16), sx(28), sy(62), 0x222833, 0.42));
        block.add(this.add.rectangle(0, sy(48), sx(154), sy(8), 0x1d2028, 0.6));
        this.midground.add(block);
      }
    } else if (this.city.key === "roma") {
      for (let i = 0; i < 5; i += 1) {
        const x = sx(140) + i * sx(258);
        const colonnade = this.add.container(x, sy(252));
        colonnade.add(this.add.rectangle(0, sy(8), sx(168), sy(98), 0x7c5f49, 0.3));
        colonnade.add(this.add.arc(0, -sy(24), sx(54), 180, 360, false, 0xd1ac82, 0.15));
        for (let c = 0; c < 3; c += 1) {
          colonnade.add(this.add.rectangle(-sx(42) + c * sx(42), sy(10), sx(14), sy(58), 0x4f3d31, 0.4));
        }
        this.midground.add(colonnade);
      }
    } else if (this.city.key === "paris") {
      for (let i = 0; i < 6; i += 1) {
        const x = sx(90) + i * sx(214);
        const boulevard = this.add.container(x, sy(248));
        boulevard.add(this.add.rectangle(0, 0, sx(142), sy(104), 0x465064, 0.34));
        boulevard.add(this.add.rectangle(0, -sy(36), sx(116), sy(10), 0xf0eadc, 0.12));
        boulevard.add(this.add.rectangle(-sx(30), sy(8), sx(42), sy(22), 0x252b37, 0.44));
        boulevard.add(this.add.rectangle(sx(32), sy(8), sx(42), sy(22), 0x252b37, 0.4));
        boulevard.add(this.add.rectangle(0, sy(44), sx(150), sy(6), this.city.glow, 0.12));
        this.midground.add(boulevard);
      }
    } else if (this.city.key === "venecia") {
      for (let i = 0; i < 5; i += 1) {
        const x = sx(120) + i * sx(250);
        const canal = this.add.container(x, sy(256));
        canal.add(this.add.rectangle(0, sy(28), sx(176), sy(36), 0x2e5f69, 0.24));
        canal.add(this.add.arc(0, sy(8), sx(48), 180, 360, false, 0x8f8576, 0.22));
        canal.add(this.add.rectangle(-sx(34), -sy(18), sx(24), sy(46), 0x72695e, 0.34));
        canal.add(this.add.rectangle(sx(34), -sy(12), sx(22), sy(42), 0x9e8a71, 0.28));
        canal.add(this.add.rectangle(0, sy(32), sx(132), sy(4), this.city.highlight, 0.14));
        this.midground.add(canal);
      }
    } else {
      for (let i = 0; i < 6; i += 1) {
        const x = sx(90) + i * sx(220);
        const promenade = this.add.container(x, sy(248));
        promenade.add(this.add.rectangle(0, 0, sx(152), sy(102), 0x70808e, 0.3));
        promenade.add(this.add.rectangle(0, sy(44), sx(160), sy(8), 0xf2ead8, 0.2));
        promenade.add(this.add.rectangle(0, sy(50), sx(160), sy(4), this.city.accent, 0.24));
        promenade.add(this.add.rectangle(-sx(26), sy(2), sx(18), sy(54), 0x5f4a36, 0.26));
        promenade.add(this.add.rectangle(sx(44), sy(10), sx(30), sy(46), 0xffd9a8, 0.22));
        this.midground.add(promenade);
      }
    }
  }

  createSkyline() {
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
    const wall = this.add.rectangle(WIDTH / 2, sy(255), WIDTH + sx(100), sy(318), this.city.wall);
    wall.setStrokeStyle(5, 0x2c2d33);
    this.backdrop.add(wall);
    this.backdrop.add(this.add.rectangle(WIDTH / 2, sy(115), WIDTH + sx(100), sy(54), tintColor(this.city.highlight, -0.2), 0.12));
    this.backdrop.add(this.add.rectangle(WIDTH / 2, sy(336), WIDTH + sx(100), sy(62), this.city.shadow, 0.22));
    this.backdrop.add(this.add.rectangle(WIDTH / 2, sy(154), WIDTH + sx(100), sy(6), this.city.glow, 0.08));

    for (let row = 0; row < 15; row += 1) {
      for (let col = 0; col < 20; col += 1) {
        const x = col * sx(54) + (row % 2) * sx(27) - sx(38);
        const y = sy(102) + row * sy(21);
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
      const window = this.add.rectangle(x, sy(201) + (i % 2) * sy(20), sx(72), sy(88), 0x17171d);
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
      for (let i = 0; i < 12; i += 1) {
        const tile = this.add.rectangle(sx(34) + i * sx(108), sy(336), sx(96), sy(24), 0xf2ead8).setStrokeStyle(3, 0x30343a);
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
    } else if (this.city.key === "roma") {
      for (const x of [sx(118), sx(478), sx(832), sx(1148)]) {
        const column = this.add.container(x, sy(286));
        column.add(this.add.rectangle(0, sy(8), sx(34), sy(116), 0x9f866b).setStrokeStyle(3, 0x2b221b));
        column.add(this.add.rectangle(0, -sy(44), sx(52), sy(14), 0xc7b08a));
        column.add(this.add.rectangle(0, sy(62), sx(58), sy(10), 0x7d6552));
        this.backdrop.add(column);
      }
    } else if (this.city.key === "paris") {
      for (const x of [sx(182), sx(546), sx(902), sx(1202)]) {
        const awning = this.add.container(x, sy(334));
        awning.add(this.add.rectangle(0, 0, sx(82), sy(18), 0xf2ead8));
        awning.add(this.add.rectangle(-sx(18), sy(20), sx(8), sy(40), 0x202126));
        awning.add(this.add.rectangle(sx(18), sy(20), sx(8), sy(40), 0x202126));
        awning.add(this.add.rectangle(0, sy(34), sx(96), sy(5), 0x40d8ff));
        this.backdrop.add(awning);
      }
    } else if (this.city.key === "venecia") {
      for (const x of [sx(120), sx(480), sx(860), sx(1180)]) {
        const arch = this.add.container(x, sy(286));
        arch.add(this.add.rectangle(0, sy(30), sx(92), sy(84), 0x8c7d73));
        arch.add(this.add.arc(0, sy(12), sx(28), 180, 360, false, 0x203f50));
        arch.add(this.add.rectangle(0, sy(56), sx(44), sy(8), 0x203f50));
        this.backdrop.add(arch);
      }
    } else if (this.city.key === "londres") {
      for (const x of [sx(146), sx(540), sx(934), sx(1238)]) {
        const sign = this.add.container(x, sy(324));
        sign.add(this.add.rectangle(0, 0, sx(92), sy(26), 0x1f5a93).setStrokeStyle(3, 0xf2ead8));
        sign.add(this.add.rectangle(0, sy(28), sx(10), sy(30), 0x3a3f49));
        this.backdrop.add(sign);
      }

      for (const x of [sx(260), sx(722), sx(1110)]) {
        const roundel = this.add.container(x, sy(156));
        roundel.add(this.add.circle(0, 0, sx(24), 0xc53343).setStrokeStyle(4, 0xf2ead8));
        roundel.add(this.add.rectangle(0, 0, sx(62), sy(12), 0x1f5a93));
        this.backdrop.add(roundel);
      }
    }
  }

  createLandmark() {
    this.landmark = this.add.container(sx(760), sy(272));

    if (this.city.key === "paris") {
      this.landmark.add(this.add.triangle(0, -sy(8), 0, -sy(118), -sx(48), sy(88), sx(48), sy(88), this.city.accent, 0.86));
      this.landmark.add(this.add.triangle(-sx(7), -sy(20), -sx(2), -sy(90), -sx(28), sy(56), sx(4), sy(56), this.city.highlight, 0.42));
      this.landmark.add(this.add.rectangle(0, sy(18), sx(112), sy(8), 0x15151c));
      this.landmark.add(this.add.rectangle(0, sy(62), sx(86), sy(8), 0x15151c));
      this.landmark.add(this.add.circle(0, -sy(82), sx(4), 0xffd95c));
    } else if (this.city.key === "roma") {
      this.landmark.add(this.add.rectangle(0, sy(34), sx(156), sy(120), 0x5a3c2e, 0.8).setStrokeStyle(4, 0x1d1714));
      this.landmark.add(this.add.arc(0, -sy(10), sx(58), 180, 360, false, this.city.highlight, 0.16));
      for (let i = 0; i < 4; i += 1) {
        this.landmark.add(this.add.rectangle(-sx(54) + i * sx(36), sy(42), sx(20), sy(72), 0x191517));
        this.landmark.add(this.add.rectangle(-sx(58) + i * sx(36), sy(10), sx(4), sy(52), this.city.highlight, 0.22));
      }
      this.landmark.add(this.add.arc(0, -sy(10), sx(58), 180, 360, false, 0xb9875b, 0.4));
    } else if (this.city.key === "venecia") {
      this.landmark.add(this.add.rectangle(0, sy(78), sx(176), sy(34), 0x203f50));
      this.landmark.add(this.add.rectangle(0, sy(70), sx(156), sy(6), this.city.highlight, 0.18));
      this.landmark.add(this.add.arc(0, sy(50), sx(60), 180, 360, false, this.city.accent, 0.88));
      this.landmark.add(this.add.rectangle(0, sy(74), sx(152), sy(10), 0x15151c));
      this.landmark.add(this.add.rectangle(-sx(48), sy(4), sx(30), sy(60), 0x8a6958));
      this.landmark.add(this.add.rectangle(sx(48), sy(6), sx(26), sy(56), 0xb48b64));
      this.landmark.add(this.add.rectangle(sx(58), -sy(6), sx(8), sy(28), this.city.highlight, 0.24));
    } else if (this.city.key === "londres") {
      this.landmark.add(this.add.rectangle(0, sy(18), sx(82), sy(166), 0xa61d32).setStrokeStyle(4, 0x15151c));
      this.landmark.add(this.add.rectangle(0, -sy(64), sx(90), sy(16), 0xc92d45).setStrokeStyle(3, 0x15151c));
      this.landmark.add(this.add.rectangle(0, -sy(74), sx(72), sy(8), 0xe6dbc6));
      this.landmark.add(this.add.rectangle(0, sy(22), sx(74), sy(152), 0xc92d45).setStrokeStyle(3, 0x15151c));
      this.landmark.add(this.add.rectangle(-sx(22), sy(16), sx(8), sy(132), 0xf06b82, 0.46));
      this.landmark.add(this.add.rectangle(sx(24), sy(18), sx(8), sy(138), 0x6b1323, 0.68));
      this.landmark.add(this.add.rectangle(0, sy(86), sx(92), sy(9), 0x111218, 0.7));
      this.landmark.add(
        this.add
          .text(0, -sy(74), "TELEPHONE", {
            fontFamily: '"Press Start 2P"',
            fontSize: `${Math.round(sx(6))}px`,
            color: "#1a1b20",
          })
          .setOrigin(0.5)
      );
      for (let row = 0; row < 2; row += 1) {
        for (let col = 0; col < 3; col += 1) {
          const glassX = -sx(22) + col * sx(22);
          const glassY = sy(2) + row * sy(40);
          this.landmark.add(this.add.rectangle(glassX, glassY, sx(16), sy(30), 0x253049));
          this.landmark.add(this.add.rectangle(glassX - sx(4), glassY - sy(8), sx(3), sy(16), 0xbfd8f0, 0.18));
          this.landmark.add(this.add.rectangle(glassX + sx(4), glassY + sy(5), sx(2), sy(10), 0xf2ead8, 0.08));
        }
      }
      this.landmark.add(this.add.rectangle(0, sy(98), sx(92), sy(10), 0x2a2d34));

      const clock = this.add.container(sx(132), sy(10));
      clock.add(this.add.rectangle(0, 0, sx(30), sy(148), 0x46505c));
      clock.add(this.add.rectangle(0, -sy(52), sx(46), sy(18), 0xc5b06c));
      clock.add(this.add.rectangle(0, sy(74), sx(34), sy(10), 0x2f333b));
      clock.add(this.add.circle(0, -sy(52), sx(9), 0xf2ead8));
      clock.add(this.add.rectangle(0, -sy(52), sx(1), sy(6), 0x15151c));
      clock.add(this.add.rectangle(sx(3), -sy(55), sx(4), sy(1), 0x15151c));
      clock.add(this.add.rectangle(-sx(10), -sy(40), sx(4), sy(84), this.city.highlight, 0.18));
      this.landmark.add(clock);
    } else {
      this.landmark.add(this.add.rectangle(-sx(48), sy(34), sx(13), sy(140), 0x5b3d22));
      this.landmark.add(this.add.triangle(-sx(48), -sy(54), -sx(108), 0, -sx(48), -sy(94), sx(20), 0, 0x2fbf71));
      this.landmark.add(this.add.triangle(-sx(62), -sy(46), -sx(96), -sy(2), -sx(52), -sy(82), -sx(12), -sy(4), this.city.highlight, 0.3));
      this.landmark.add(this.add.rectangle(sx(38), sy(44), sx(84), sy(104), this.city.accent, 0.78).setStrokeStyle(4, 0x15151c));
      this.landmark.add(this.add.rectangle(sx(22), sy(16), sx(18), sy(72), this.city.highlight, 0.22));
      this.landmark.add(this.add.rectangle(sx(70), sy(44), sx(10), sy(104), this.city.shadow, 0.3));
      this.landmark.add(this.add.rectangle(sx(64), sy(72), sx(22), sy(56), 0xf2ead8));
    }

    this.landmarkLayer.add(this.landmark);
  }

  createStreetProps() {
    this.props = [];
    if (this.city.key === "londres") {
      for (const x of [sx(220), sx(660), sx(1090)]) {
        const lamp = this.add.container(x, sy(346));
        lamp.add(this.add.rectangle(0, 0, sx(10), sy(88), 0x434a56));
        lamp.add(this.add.rectangle(0, -sy(42), sx(34), sy(10), 0xc7b76a));
        lamp.add(this.add.rectangle(0, -sy(28), sx(18), sy(16), 0xf2ead8, 0.7));
        this.propLayer.add(lamp);
        this.props.push(lamp);
      }

      for (const busX of [sx(914), sx(1184)]) {
        const bus = this.add.container(busX, sy(busX === sx(914) ? 354 : 342));
        bus.add(this.add.rectangle(0, -sy(2), sx(136), sy(56), 0xc92d45).setStrokeStyle(4, 0x15151c));
        bus.add(this.add.rectangle(0, -sy(24), sx(144), sy(10), 0x9b1528));
        bus.add(this.add.rectangle(0, sy(18), sx(138), sy(8), 0x7f1726));
        bus.add(this.add.rectangle(-sx(18), -sy(14), sx(86), sy(14), 0xe7e0cf));
        bus.add(this.add.rectangle(sx(40), -sy(14), sx(24), sy(14), 0xe7e0cf));
        bus.add(this.add.rectangle(-sx(49), -sy(2), sx(18), sy(22), 0x253049));
        bus.add(this.add.rectangle(-sx(29), -sy(2), sx(18), sy(22), 0x253049));
        bus.add(this.add.rectangle(-sx(9), -sy(2), sx(18), sy(22), 0x253049));
        bus.add(this.add.rectangle(sx(11), -sy(2), sx(18), sy(22), 0x253049));
        bus.add(this.add.rectangle(sx(31), -sy(2), sx(18), sy(22), 0x253049));
        bus.add(this.add.rectangle(sx(51), -sy(2), sx(18), sy(22), 0x253049));
        bus.add(this.add.rectangle(sx(38), sy(8), sx(22), sy(18), 0xad2438));
        bus.add(this.add.rectangle(-sx(46), -sy(16), sx(4), sy(10), 0xbce5ff, 0.24));
        bus.add(this.add.rectangle(sx(48), sy(18), sx(8), sy(4), 0xffd95c));
        bus.add(this.add.rectangle(-sx(58), sy(18), sx(8), sy(4), 0xf2ead8));
        bus.add(this.add.circle(-sx(36), sy(26), sx(11), 0x15151c));
        bus.add(this.add.circle(sx(36), sy(26), sx(11), 0x15151c));
        bus.add(this.add.circle(-sx(36), sy(26), sx(5), 0x5a616d));
        bus.add(this.add.circle(sx(36), sy(26), sx(5), 0x5a616d));
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
    } else if (this.city.key === "roma") {
      for (const x of [sx(180), sx(612), sx(1028)]) {
        const scooter = this.add.container(x, sy(362));
        scooter.add(this.add.circle(-sx(20), sy(10), sx(10), 0x15151c));
        scooter.add(this.add.circle(sx(18), sy(10), sx(10), 0x15151c));
        scooter.add(this.add.rectangle(0, 0, sx(62), sy(14), 0xb9875b));
        scooter.add(this.add.rectangle(sx(18), -sy(16), sx(10), sy(22), 0x202126));
        scooter.add(this.add.rectangle(sx(24), -sy(22), sx(18), sy(5), 0x202126));
        this.propLayer.add(scooter);
        this.props.push(scooter);
      }
      const fountain = this.add.container(sx(938), sy(356));
      fountain.add(this.add.arc(0, sy(6), sx(44), 180, 360, false, 0xb6c3cf));
      fountain.add(this.add.rectangle(0, sy(14), sx(92), sy(14), 0x8c7d73));
      fountain.add(this.add.rectangle(0, -sy(26), sx(12), sy(34), 0xc5b06c));
      this.propLayer.add(fountain);
      this.props.push(fountain);
    } else if (this.city.key === "paris") {
      for (const x of [sx(184), sx(562), sx(940)]) {
        const lamp = this.add.container(x, sy(346));
        lamp.add(this.add.rectangle(0, 0, sx(8), sy(92), 0x2a2f3a));
        lamp.add(this.add.circle(0, -sy(42), sx(10), 0xf2ead8, 0.9));
        lamp.add(this.add.rectangle(0, -sy(28), sx(4), sy(20), 0x2a2f3a));
        this.propLayer.add(lamp);
        this.props.push(lamp);
      }
      const cafe = this.add.container(sx(952), sy(350));
      cafe.add(this.add.rectangle(0, 0, sx(92), sy(44), 0x253049));
      cafe.add(this.add.rectangle(0, -sy(22), sx(112), sy(10), 0xf2ead8));
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
    }
  }

  createStreet() {
    const roadTop = this.add.rectangle(WIDTH / 2, GROUND_Y + sy(42), WIDTH, sy(88), this.city.road, 1);
    const curb = this.add.rectangle(WIDTH / 2, GROUND_Y + sy(2), WIDTH, sy(10), 0x15151c);
    const gutter = this.add.rectangle(WIDTH / 2, GROUND_Y + sy(74), WIDTH, sy(12), 0x1a1b20);
    this.foreground.add([roadTop, curb, gutter]);

    if (this.city.key === "venecia") {
      this.foreground.add(this.add.rectangle(WIDTH / 2, GROUND_Y + sy(12), WIDTH, sy(28), 0x29556a, 0.95));
      for (let i = 0; i < 14; i += 1) {
        const ripple = this.add.rectangle(i * sx(94), GROUND_Y + sy(12), sx(52), sy(4), 0x79e8e0, 0.55);
        this.foreground.add(ripple);
      }
      for (let i = 0; i < 10; i += 1) {
        const reflection = this.add.rectangle(sx(44) + i * sx(132), GROUND_Y + sy(18), sx(30), sy(3), 0xbaf4ea, 0.25);
        this.foreground.add(reflection);
      }
    } else if (this.city.key === "valencia") {
      this.foreground.add(this.add.rectangle(WIDTH / 2, GROUND_Y - sy(8), WIDTH, sy(16), 0xf2ead8, 0.85));
      for (let i = 0; i < 18; i += 1) {
        const tile = this.add.rectangle(i * sx(82), GROUND_Y - sy(8), sx(34), sy(6), i % 2 === 0 ? 0xff8b22 : 0x40d8ff);
        this.foreground.add(tile);
      }
      this.foreground.add(this.add.rectangle(WIDTH / 2, GROUND_Y + sy(20), WIDTH, sy(18), 0xf5c468, 0.08));
    } else if (this.city.key === "londres") {
      for (let i = 0; i < 8; i += 1) {
        const stripe = this.add.rectangle(sx(120) + i * sx(130), GROUND_Y + sy(18), sx(34), sy(10), 0xf2ead8, 0.9);
        this.foreground.add(stripe);
      }
      this.foreground.add(this.add.rectangle(WIDTH / 2, GROUND_Y + sy(22), WIDTH, sy(26), 0xb8d7ff, 0.05));
      for (let i = 0; i < 9; i += 1) {
        const puddle = this.add.ellipse(sx(90) + i * sx(142), GROUND_Y + sy(30), sx(48), sy(10), 0xa4c4de, 0.16);
        this.foreground.add(puddle);
      }
    } else if (this.city.key === "roma") {
      for (let i = 0; i < 18; i += 1) {
        const stone = this.add.rectangle(i * sx(82), GROUND_Y + sy(20), sx(58), sy(18), i % 2 === 0 ? 0x8c7d73 : 0x7d6552);
        stone.setStrokeStyle(1, 0x2b221b);
        this.foreground.add(stone);
      }
      this.foreground.add(this.add.rectangle(WIDTH / 2, GROUND_Y + sy(18), WIDTH, sy(16), 0xd6b07a, 0.08));
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
      const fog = this.add.rectangle(WIDTH / 2, sy(246), WIDTH, sy(168), 0x9ba7b8, 0.08);
      this.weatherLayer.add(fog);
      this.weatherProps.push({ type: "fog", sprite: fog, speed: 0 });
      const haze = this.add.rectangle(WIDTH / 2, sy(332), WIDTH, sy(86), 0xb3c8dd, 0.05);
      this.weatherLayer.add(haze);
      this.weatherProps.push({ type: "fog", sprite: haze, speed: 0 });

      for (let i = 0; i < 44; i += 1) {
        const drop = this.add.rectangle(
          Phaser.Math.Between(0, WIDTH),
          Phaser.Math.Between(sy(80), GROUND_Y),
          sx(3),
          sy(24),
          0xb7d8ff,
          0.38
        );
        drop.setAngle(18);
        this.weatherLayer.add(drop);
        this.weatherProps.push({ type: "rain", sprite: drop, speed: Phaser.Math.Between(240, 340) });
      }
      for (let i = 0; i < 8; i += 1) {
        const puddle = this.add.ellipse(sx(60) + i * sx(150), GROUND_Y + sy(34), sx(44), sy(10), 0xb8d7ff, 0.14);
        this.weatherLayer.add(puddle);
        this.weatherProps.push({ type: "puddle", sprite: puddle, speed: Phaser.Math.Between(10, 18) });
      }
    } else if (this.city.key === "venecia") {
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
    } else if (this.city.key === "paris") {
      for (let i = 0; i < 8; i += 1) {
        const neonMist = this.add.rectangle(sx(80) + i * sx(170), sy(198), sx(110), sy(20), i % 2 === 0 ? 0x6fdff8 : 0xf2ead8, 0.05);
        this.weatherLayer.add(neonMist);
        this.weatherProps.push({ type: "glow", sprite: neonMist, speed: Phaser.Math.Between(6, 12) });
      }
    } else if (this.city.key === "roma") {
      const dust = this.add.rectangle(WIDTH / 2, sy(310), WIDTH, sy(56), 0xd6b07a, 0.05);
      this.weatherLayer.add(dust);
      this.weatherProps.push({ type: "fog", sprite: dust, speed: 0 });
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
    this.titleText = this.add
      .text(WIDTH / 2, sy(122), `${this.city.name.toUpperCase()} STAGE`, {
        fontFamily: '"Press Start 2P"',
        fontSize: `${Math.round(sx(30))}px`,
        color: "#ff8b22",
        align: "center",
        stroke: "#14151c",
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.tipText = this.add
      .text(WIDTH / 2, sy(176), "A/D mover  |  J disparar  |  Espacio saltar  |  S agacharse", {
        fontFamily: "VT323",
        fontSize: `${Math.round(sx(31))}px`,
        color: "#f2ead8",
      })
      .setOrigin(0.5);

    this.feedbackText = this.add
      .text(WIDTH / 2, sy(222), "Avanza, dispara a los enemigos y no corras a ciegas", {
        fontFamily: "VT323",
        fontSize: `${Math.round(sx(27))}px`,
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
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;

    if (this.demoMode && (this.input.activePointer.isDown || this.input.keyboard.checkDown(this.keys.space, 0) || this.input.keyboard.checkDown(this.keys.right, 0))) {
      this.scene.start("MenuScene");
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.restart)) {
      this.scene.restart({ cityKey: this.city.key });
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.menu)) {
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
    this.score += deltaSeconds * (7 + this.scrollSpeed * 0.04) * this.combo;
    this.stageDistance = Math.min(this.stageLength, this.stageDistance + this.scrollSpeed * deltaSeconds);
    this.spawnTimer += delta;
    this.rewardTimer += delta;
    this.enemyTimer += delta;
    this.crateTimer += delta;
    this.platformTimer += delta;

    if (this.keys.shoot.isDown) {
      this.shoot(time);
    }

    this.updateMissionPhase();
    this.processStageScript();

    if (this.crateTimer > this.nextCrate && this.stageDistance < this.stageLength - 1600) {
      this.spawnCrate();
      this.crateTimer = 0;
      this.nextCrate = this.getDirectorDelay("crate");
    }

    if (this.platformTimer > this.nextPlatform && this.stageDistance < this.stageLength - 1800 && this.solidBoxes.countActive(true) < 14) {
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
    const onGround = this.runner.body.blocked.down || this.runner.body.touching.down;
    const nearestObstacle = this.getNearestObstacleAhead();
    const nearestEnemy = this.getNearestEnemyAhead();
    const demoJump = this.demoMode && onGround && nearestObstacle && nearestObstacle.distance < sx(180);
    const left = !this.demoMode && (this.cursors.left.isDown || this.keys.left.isDown);
    const right = this.demoMode || this.cursors.right.isDown || this.keys.right.isDown;
    const down = !this.demoMode && (this.cursors.down.isDown || this.keys.down.isDown);
    const rightTapped = Phaser.Input.Keyboard.JustDown(this.keys.right) || Phaser.Input.Keyboard.JustDown(this.cursors.right);
    const paceBoost = this.getDifficultyRamp() * 70;

    if (demoJump || Phaser.Input.Keyboard.JustDown(this.keys.space) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.jumpBufferUntil = time + 180;
      if (!onGround && time >= this.coyoteUntil) {
        this.tryAirJump(time);
      }
    }

    if (rightTapped) {
      if (time - this.lastRightTapAt < 280) {
        this.sprintUntil = time + 950;
        this.showFeedback("SPRINT KAMUABU!");
      }
      this.lastRightTapAt = time;
    }

    if (onGround) {
      this.coyoteUntil = time + 145;
      this.lastGroundedAt = time;
      this.airJumpsUsed = 0;
    }

    this.setDucking(down && onGround);
    this.tryBufferedJump(time);

    const isTurbo = time < this.turboUntil && right && !this.isDucking;
    const isSprinting = (time < this.sprintUntil || isTurbo) && right && !this.isDucking;
    const moveSpeed = this.isDucking
      ? 120
      : isTurbo
        ? 430 + paceBoost * 0.45
        : isSprinting
          ? 360 + paceBoost * 0.35
          : 235 + paceBoost * 0.22;
    this.scrollSpeed = 0;
    if (left && !right) {
      this.runner.setVelocityX(-moveSpeed);
      this.runner.setFlipX(true);
    } else if (right && !left) {
      this.runner.setVelocityX(moveSpeed);
      this.runner.setFlipX(false);
    } else {
      this.runner.setVelocityX(0);
    }

    if (right && this.runner.x > sx(420) && this.stageDistance < this.stageLength) {
      this.scrollSpeed = moveSpeed + (isTurbo ? 138 : isSprinting ? 88 : 35) + paceBoost;
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
    const onGround = this.runner.body.blocked.down || this.runner.body.touching.down;
    if (onGround && !this.prevRunnerOnGround && this.runner.body.velocity.y > sy(120)) {
      const hardLanding = this.runner.body.velocity.y > sy(420);
      this.dust.emitParticleAt(this.runner.x - sx(12), GROUND_Y - sy(6), hardLanding ? 10 : 5);
      this.cameras.main.shake(hardLanding ? 90 : 45, hardLanding ? 0.0024 : 0.0012);
    }
    this.prevRunnerOnGround = onGround;
  }

  setDucking(value) {
    if (this.isDucking === value || this.isGameOver) {
      return;
    }
    this.isDucking = value;
    this.applyRunnerBody();
  }

  applyRunnerBody() {
    if (!this.runner) {
      return;
    }

    if (this.isDucking) {
      this.runner.setTexture("runner-duck");
      this.runner.body.setSize(66, 38);
      this.runner.body.setOffset(20, 42);
      this.runner.setScale(this.isPowered ? 1.02 : 0.88);
      return;
    }

    if (this.isPowered) {
      this.runner.setTexture("runner-big");
      this.runner.body.setSize(54, 102);
      this.runner.body.setOffset(33, 22);
      this.runner.setScale(0.94);
    } else {
      this.runner.setTexture("runner-small");
      this.runner.body.setSize(42, 72);
      this.runner.body.setOffset(26, 16);
      this.runner.setScale(0.84);
    }
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
      { distance: 24600, kind: "specialEvent", eventType: "pursuit" },
      { distance: 38200, kind: "specialEvent", eventType: "droneStorm" },
      { distance: 51800, kind: "specialEvent", eventType: "rainShift" },
      { distance: 65400, kind: "scooterDrop" },
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
    return 5;
  }

  canSpawnThreat(type) {
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
        this.solidBoxes.countActive(true) < 10
      );
    }

    return (
      activeEnemies < this.getMaxEnemies() &&
      activeBullets < 4 + Math.floor(this.getDifficultyRamp() * 3) &&
      this.time.now - this.lastObstacleAt > Math.max(700, 1500 - this.getDifficultyRamp() * 550) &&
      this.time.now >= this.platformSafeUntil &&
      this.solidBoxes.countActive(true) < 14
    );
  }

  getDirectorDelay(type) {
    const ramp = this.getDifficultyRamp();
    const cityPace = {
      valencia: { obstacle: 1.08, platform: 0.92, reward: 0.88 },
      roma: { obstacle: 0.95, platform: 1.02, reward: 1.04 },
      paris: { obstacle: 0.98, platform: 0.96, reward: 0.94 },
      venecia: { obstacle: 1.12, platform: 0.86, reward: 0.9 },
      londres: { obstacle: 0.9, platform: 0.98, reward: 1.02 },
    }[this.city.key] || { obstacle: 1, platform: 1, reward: 1 };

    if (type === "obstacle") {
      return Phaser.Math.Between(
        Math.max(1200, (6200 - ramp * 3400) * cityPace.obstacle),
        Math.max(2200, (7600 - ramp * 3600) * cityPace.obstacle)
      );
    }
    if (type === "enemy") {
      return Phaser.Math.Between(Math.max(850, 2400 - ramp * 1200), Math.max(1300, 3200 - ramp * 1400));
    }
    if (type === "crate") {
      return Phaser.Math.Between(Math.max(1400, 2600 - ramp * 700), Math.max(2200, 3600 - ramp * 850));
    }
    if (type === "platform") {
      return Phaser.Math.Between(
        Math.max(1800, (5200 - ramp * 1800) * cityPace.platform),
        Math.max(2600, (7000 - ramp * 2200) * cityPace.platform)
      );
    }
    if (type === "reward") {
      return Phaser.Math.Between(
        Math.max(1100, (2800 - ramp * 700) * cityPace.reward),
        Math.max(1800, (4200 - ramp * 950) * cityPace.reward)
      );
    }
    return Phaser.Math.Between(1700, 2600);
  }

  showFeedback(message) {
    this.feedbackText.setText(message).setAlpha(1);
    this.tweens.killTweensOf(this.feedbackText);
    this.tweens.add({
      targets: this.feedbackText,
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
  }

  shoot(time) {
    if (time - this.lastShotAt < 145) {
      return;
    }

    this.lastShotAt = time;
    arcadeAudio.playSfx("shoot");
    const aimUp = this.cursors.up.isDown;
    const direction = this.runner.flipX ? -1 : 1;
    const bulletY = this.isDucking ? this.runner.y - 35 : this.runner.y - 54;
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

        if (isDashing) {
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
    enemy.setTexture(`${spritePrefix}-attack`);
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y - sy(52), this.runner.x, this.runner.y - sy(48));
    this.spawnMuzzleFlash(enemy.x + direction * sx(28), enemy.y - sy(56), direction, 0xff365f);
    this.spawnSmokePuff(enemy.x + direction * sx(22), enemy.y - sy(58));
    this.spawnEnemyBullet(enemy.x + direction * sx(34), enemy.y - sy(56), angle, 285, time);
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
    }
  }

  spawnEnemy() {
    return null;
  }

  spawnEnemyAt(x, type = "shooter") {
    const def = ENEMY_TYPES[type] ?? ENEMY_TYPES.shooter;
    const enemy = this.enemies.create(x, GROUND_Y, `${def.prefix}-idle`);
    enemy.setOrigin(0.5, 1);
    enemy.setScale(def.scale);
    enemy.body.setSize(def.body.width, def.body.height);
    enemy.body.setOffset(def.body.offsetX, def.body.offsetY);
    enemy.setData("enemyType", def.key);
    enemy.setData("typeDef", def);
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
    if (this.solidBoxes.countActive(true) >= 14 || this.time.now < this.scriptedSectionUntil) {
      return;
    }

    const templates = [
      { pattern: [[1], [1], [2], [2]], reward: "socks" },
      { pattern: [[1], [2], [3], [2], [1]], reward: "shirt", secretRewards: [{ column: 2, level: 4, key: "socks" }] },
      { pattern: [[2], [2], [1], [1], [2], [2]], reward: "socks" },
      { pattern: [[1], [1, 3], [2], [2, 4], [1]], reward: "shoe", secretRewards: [{ column: 3, level: 5, key: "shirt" }] },
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
    const box = this.solidBoxes.create(x, y, "solid-box");
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

    const key = Phaser.Utils.Array.GetRandom(this.city.obstaclePool || ["barrel", "barricade", "drone"]);
    const x = Math.max(WIDTH + sx(130), this.lastHazardX + sx(380));
    this.spawnObstacleAt(key, x);
  }

  spawnObstacleAt(key, x) {
    const y = key === "drone" ? GROUND_Y - sy(72) : GROUND_Y - sy(4);
    const obstacle = this.obstacles.create(x, y, key);
    obstacle.setOrigin(0.5, key === "drone" ? 0.5 : 1);
    obstacle.setVelocityX(0);
    obstacle.setData("type", key);

    if (key === "drone") {
      obstacle.body.setSize(80, 22);
      obstacle.body.setOffset(12, 19);
      this.tweens.add({ targets: obstacle, y: y - sy(10), duration: 520, yoyo: true, repeat: -1, ease: "Sine.InOut" });
    } else if (key === "barrel") {
      obstacle.body.setSize(34, 44);
      obstacle.body.setOffset(20, 24);
    } else {
      obstacle.body.setSize(58, 38);
      obstacle.body.setOffset(24, 30);
    }

    this.lastHazardX = x;
    this.lastObstacleAt = this.time.now;
    return obstacle;
  }

  spawnReward() {
    if (this.rewards.countActive(true) >= 2 || this.time.now < this.platformSafeUntil || this.time.now < this.scriptedSectionUntil) {
      return;
    }
    const items = ["shirt", "socks", "socks", "shoe", "outfit"];
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
      this.socks = Math.min(9, this.socks + 1);
      this.upgradeFirePower();
    }

    this.updateComboFeel();

    if (key === "shoe") {
      this.turboUntil = Math.max(this.turboUntil, this.time.now + 3200);
      this.sprintUntil = Math.max(this.sprintUntil, this.time.now + 2200);
      this.cameras.main.flash(90, 199, 255, 58, false);
      this.showFeedback("Zapatillas turbo: corre mas rapido y abre hueco");
    } else if (key === "scooter") {
      this.activateScooterMode();
      this.cameras.main.flash(120, 255, 217, 92, false);
      this.showFeedback("SCOOTER KAMUABU: modo especial de avenida");
    } else if (key === "shirt") {
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
    const hp = enemy.getData("hp") - bullet.getData("damage");
    const def = enemy.getData("typeDef") ?? ENEMY_TYPES.shooter;
    const spritePrefix = enemy.getData("spritePrefix") ?? def.prefix;
    bullet.destroy();
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
        this.activeBoss = null;
        this.bossDefeated = true;
        this.stageDistance = this.stageLength;
        this.spawnRewardItem(enemy.x + sx(26), enemy.y - sy(92), "outfit");
        this.showFeedback(`BOSS KO: ${enemy.getData("bossLabel")} fuera de combate`);
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

  breakCrate(bullet, crate) {
    const hp = crate.getData("hp") - bullet.getData("damage");
    bullet.destroy();
    crate.setData("hp", hp);
    crate.setTint(0xffd95c);
    this.time.delayedCall(90, () => crate.clearTint());

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
    reward.setData("value", key === "outfit" ? 260 : key === "scooter" ? 220 : key === "shoe" ? 180 : key === "shirt" ? 130 : 90);
    reward.setData(
      "label",
      key === "outfit" ? "SUPER OUTFIT" : key === "scooter" ? "SCOOTER" : key === "shoe" ? "TURBO" : key === "shirt" ? "CAMISETA" : "CALCETINES"
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
    const key = Phaser.Utils.Array.GetRandom(["shirt", "socks", "shoe", "outfit", "scooter"]);
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

  updateComboFeel() {
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
    this.applyRunnerBody();
    this.floatText("SUPER OUTFIT!", this.runner.x + sx(48), this.runner.y - sy(118), "#ffd95c");
    this.cameras.main.shake(220, 0.006);
  }

  activateScooterMode() {
    this.scooterUntil = this.time.now + 6500;
    this.turboUntil = Math.max(this.turboUntil, this.time.now + 6500);
    this.sprintUntil = Math.max(this.sprintUntil, this.time.now + 3200);
    this.shieldUntil = Math.max(this.shieldUntil, this.time.now + 1200);
    this.floatText("SCOOTER MODE!", this.runner.x + sx(40), this.runner.y - sy(116), "#4ae0c2");
    this.cameras.main.shake(180, 0.005);
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
    this.showFeedback(`MINI-BOSS: ${bossConfig.label}`);
    this.floatText(`BOSS ${bossConfig.label}`, WIDTH / 2, sy(170), "#ff365f");
    if (this.city.key === "londres") {
      this.spawnObstacleAt("barricade", WIDTH + sx(210));
      this.spawnEnemyAt(WIDTH + sx(420), "sprinter");
    }
  }

  handleHit(obstacle) {
    if (this.isGameOver || this.time.now < this.invulnerableUntil) {
      return;
    }

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
      this.floatText("SCOOTER ROTO", this.runner.x + 52, this.runner.y - 96, "#4ae0c2");
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

    this.sign.x -= speed * 0.13 * deltaSeconds;
    if (this.sign.x < -sx(260)) {
      this.sign.x = WIDTH + sx(260);
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
        if (item.x < -sx(160) || item.x > WIDTH + sx(280) || item.y > HEIGHT + sy(120)) {
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
    const onGround = this.runner.body.blocked.down || this.runner.body.touching.down;

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

    if (this.score > 0 && this.titleText.visible && this.score > 55) {
      this.titleText.setVisible(false);
      this.tipText.setVisible(false);
    }
  }

  syncHud() {
    const missionPct = Math.floor((this.stageDistance / this.stageLength) * 100);
    scoreEl.textContent = padScore(this.score);
    comboEl.textContent = `x${this.combo}`;
    bestEl.textContent = padScore(this.best || 0);
    cityEl.textContent = this.city.name === "Valencia" ? "VLC" : this.city.name;
    socksEl.textContent = `${this.socks}/9`;
    stateEl.textContent =
      this.time.now < this.scooterUntil
        ? "Scooter"
        : this.time.now < this.superOutfitUntil
        ? "Outfit"
        : this.time.now < this.shieldUntil
          ? "Shield"
          : this.time.now < this.turboUntil
            ? "Turbo"
            : this.isPowered
              ? `XL F${this.fireLevel}`
              : "Normal";
    weaponEl.textContent =
      this.time.now < this.scooterUntil
        ? "SCOOTER"
        : this.time.now < this.superOutfitUntil
        ? "OUTFIT"
        : this.fireLevel >= 4
          ? "WIDE x4"
          : `P x${this.fireLevel}`;
    missionEl.textContent = `${missionPct}%`;
    socksEl.parentElement?.style.setProperty("--meter", `${(this.socks / 9) * 100}%`);
    missionEl.parentElement?.style.setProperty("--meter", `${Phaser.Math.Clamp(missionPct, 0, 100)}%`);
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
