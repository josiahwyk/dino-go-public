/* ---------- Sound + voice ---------- */
let AC = null,
  VOICE = null;
// The voice: the one picked on the grown-up screen (saved on this device only, since each device has its own voices), otherwise the best
// English voice here: Premium, then Enhanced (downloaded in Settings > Accessibility > Read & Speak > Voices), Australian first.
const VKEY = "dinogo.voice",
  engVoices = () => {
    try {
      return speechSynthesis.getVoices().filter((v) => /^en[-_]/i.test(v.lang || ""));
    } catch (e) {
      return [];
    }
  };
const vScore = (v) => {
  const id = (v.name + " " + v.voiceURI).toLowerCase(),
    l = (v.lang || "").replace("_", "-");
  return (
    (/premium/.test(id) ? 8 : /enhanced/.test(id) ? 6 : 0) +
    (l.startsWith("en-AU") ? 3 : /en-(GB|NZ)/.test(l) ? 2 : l.startsWith("en-US") ? 1 : 0) +
    (/compact|eloquence|novelty/.test(id) ? -5 : 0)
  );
};
const fancy = (v) => !!v && /premium|enhanced/i.test(v.name + " " + v.voiceURI);
function pickVoice() {
  try {
    const vs = engVoices();
    let saved = null;
    try {
      saved = localStorage.getItem(VKEY);
    } catch (e) {
      console.warn("Dino Go:", e);
    }
    VOICE =
      (saved && vs.find((v) => v.voiceURI === saved)) || vs.slice().sort((a, b) => vScore(b) - vScore(a))[0] || null;
    if ($("p-voice")) renderVoices();
  } catch (e) {
    console.warn("Dino Go:", e);
  }
}
try {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
} catch (e) {
  console.warn("Dino Go:", e);
}
function say(text, queue) {
  try {
    if (!queue) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.88;
    u.pitch = fancy(VOICE) ? 1 : 1.1;
    if (VOICE) {
      u.voice = VOICE;
      u.lang = VOICE.lang;
    } else u.lang = "en-AU";
    speechSynthesis.speak(u);
  } catch (e) {
    console.warn("Dino Go:", e);
  }
}
function tone(freqs, dur = 0.12, type = "triangle", gap = 0.09) {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = AC.currentTime;
    freqs.forEach((f, i) => {
      const o = AC.createOscillator(),
        g = AC.createGain();
      o.type = type;
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0 + i * gap);
      g.gain.exponentialRampToValueAtTime(0.25, t0 + i * gap + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * gap + dur);
      o.connect(g).connect(AC.destination);
      o.start(t0 + i * gap);
      o.stop(t0 + i * gap + dur + 0.02);
    });
  } catch (e) {
    console.warn("Dino Go:", e);
  }
}
function noise(dur, freq, to, vol = 0.35, q = 0.9) {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = AC.currentTime,
      n = Math.floor(AC.sampleRate * dur),
      buf = AC.createBuffer(1, n, AC.sampleRate),
      d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = AC.createBufferSource(),
      f = AC.createBiquadFilter(),
      g = AC.createGain();
    s.buffer = buf;
    f.type = "bandpass";
    f.Q.value = q;
    f.frequency.setValueAtTime(freq, t0);
    if (to) f.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    g.gain.value = vol;
    s.connect(f).connect(g).connect(AC.destination);
    s.start(t0);
  } catch (e) {
    console.warn("Dino Go:", e);
  }
}
const sfx = {
  good: () => tone([660, 880]),
  bad: () => tone([220, 180], 0.18, "square"),
  win: () => tone([523, 659, 784, 1046], 0.18),
  catch: () => tone([784, 988, 1175, 1568], 0.2),
  whoosh: () => noise(0.28, 500, 2600, 0.25),
  hit: () => {
    noise(0.22, 160, 60, 0.7, 0.7);
    tone([110, 60], 0.2, "sine", 0.03);
  },
  block: () => tone([880, 660], 0.1, "triangle", 0.05),
};
function sweep(f0, f1, dur, type = "sawtooth", vol = 0.2) {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = AC.currentTime,
      o = AC.createOscillator(),
      g = AC.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t0);
    o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + dur * 0.15);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(AC.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  } catch (e) {
    console.warn("Dino Go:", e);
  }
}
Object.assign(sfx, {
  growl: () => {
    sweep(150, 70, 0.5, "sawtooth", 0.1);
    noise(0.4, 300, 120, 0.12);
  },
  stop: () => tone([520, 780, 1040], 0.1, "triangle", 0.07),
  charge: () => sweep(120, 900, 0.7, "sawtooth", 0.1),
  roar: () => {
    sweep(180, 50, 0.9, "sawtooth", 0.26);
    noise(0.8, 500, 90, 0.5, 0.6);
  },
  combo: (n) => tone([523 + n * 50, 659 + n * 50], 0.1, "triangle", 0.07),
  yay: () => tone([523, 659, 784, 1046, 1318], 0.16, "triangle", 0.1),
});
document.addEventListener(
  "pointerdown",
  () => {
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === "suspended") AC.resume();
    } catch (e) {
      console.warn("Dino Go:", e);
    }
  },
  { once: true },
);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// Resolves when the animation ends, or on a timer if the page's animation clock is paused (e.g. hidden tab), so a battle never gets stuck.
const anim = (el, k, o) => {
  try {
    const opt = Object.assign(
      { duration: 400 },
      o,
      reduce ? { duration: Math.min(150, (o && o.duration) || 400) } : {},
    );
    const a = el.animate(k, opt),
      total = (opt.delay || 0) + opt.duration * (opt.iterations || 1);
    return Promise.race([a.finished, wait(total + 250)]).catch(() => {});
  } catch (e) {
    return Promise.resolve();
  }
};
