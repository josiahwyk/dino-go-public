/* ---------- Sound + voice ---------- */
let AC = null,
  VOICE = null;
// The voice: the first English voice the device has, Australian first (the original Karen on iPhone and iPad).
function pickVoice() {
  try {
    const vs = speechSynthesis.getVoices();
    for (const l of ["en-AU", "en-GB", "en-NZ", "en-US"]) {
      const v = vs.find((v) => (v.lang || "").replace("_", "-").startsWith(l));
      if (v) {
        VOICE = v;
        return;
      }
    }
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
// Both voices read "dino" as "deeno"; spelt "dyno" they say it right. (Only what is spoken changes.)
const sayFix = (text) => String(text).replace(/\bdino(s?)\b/gi, "dyno$1");

/* Kiki: a small voice model that runs on the device, in a worker (js/kiki/, built from tools/kiki/).
   It loads after the page does. Until it is ready, and whenever it fails, the device voice speaks instead. */
let KIKI = null, // the worker, once it has said it is ready
  kikiId = 0, // each say() gets the next id
  kikiDead = 0, // lines up to this id were cut off
  kikiNext = 0, // when the last scheduled sentence ends (AudioContext time)
  kikiSrc = [];
function startKiki() {
  try {
    if (typeof Worker !== "function") return;
    const w = new Worker("js/kiki/kiki-worker.js");
    w.onerror = (e) => {
      console.warn("Dino Go: Kiki", e.message || e);
      KIKI = null;
    };
    w.onmessage = ({ data }) => {
      if (data.ready) KIKI = w;
      else if (data.failed) console.warn("Dino Go: Kiki", data.failed);
      else if (data.error) {
        // One line could not be made: let the device voice say it, and keep Kiki for the next.
        console.warn("Dino Go: Kiki", data.error);
        if (data.id > kikiDead) deviceSay(kikiText[data.id] || "", true);
      } else if (data.samples && data.id > kikiDead) kikiPlay(data.samples, data.rate);
      if (data.done || data.error) delete kikiText[data.id];
    };
  } catch (e) {
    console.warn("Dino Go:", e);
  }
}
const kikiText = {};
function kikiPlay(samples, rate) {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state !== "running") AC.resume();
    const buf = AC.createBuffer(1, samples.length, rate);
    buf.getChannelData(0).set(samples);
    const src = AC.createBufferSource();
    src.buffer = buf;
    src.connect(AC.destination);
    const at = Math.max(AC.currentTime, kikiNext ? kikiNext + 0.2 : 0);
    src.start(at);
    kikiNext = at + buf.duration;
    kikiSrc.push(src);
    src.onended = () => (kikiSrc = kikiSrc.filter((s) => s !== src));
  } catch (e) {
    console.warn("Dino Go:", e);
  }
}
// Stops whatever is being said, by either voice.
function stopSpeech() {
  try {
    speechSynthesis.cancel();
  } catch (e) {
    console.warn("Dino Go:", e);
  }
  kikiDead = kikiId;
  kikiNext = 0;
  for (const s of kikiSrc)
    try {
      s.stop();
    } catch (e) {}
  kikiSrc = [];
}
function say(text, queue) {
  text = sayFix(text);
  if (!KIKI) return deviceSay(text, queue);
  if (!queue) stopSpeech();
  kikiText[++kikiId] = text;
  KIKI.postMessage({ say: kikiId, text, flush: !queue });
}
function deviceSay(text, queue) {
  try {
    if (!queue) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.88;
    u.pitch = 1.1;
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
// iPhones and iPads mute this kind of sound (Kiki and the effects) when the ring/silent switch is on, but not
// the device voice. A silent media track, kept playing, makes them treat the page as media, so Kiki is heard.
let UNMUTE = null;
function silentWav() {
  const n = 4000, // half a second at 8 kHz, 8-bit, mono
    b = new Uint8Array(44 + n),
    v = new DataView(b.buffer);
  const str = (o, s) => {
    for (let i = 0; i < s.length; i++) b[o + i] = s.charCodeAt(i);
  };
  str(0, "RIFF");
  v.setUint32(4, 36 + n, true);
  str(8, "WAVEfmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true);
  v.setUint32(28, 8000, true);
  v.setUint16(32, 1, true);
  v.setUint16(34, 8, true);
  str(36, "data");
  v.setUint32(40, n, true);
  b.fill(128, 44);
  let s = "";
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return "data:audio/wav;base64," + btoa(s);
}
function unmute() {
  try {
    if (!UNMUTE) {
      UNMUTE = new Audio(silentWav());
      UNMUTE.loop = true;
      UNMUTE.setAttribute("playsinline", "");
      UNMUTE.setAttribute("x-webkit-airplay", "deny");
    }
    if (UNMUTE.paused && !document.hidden) UNMUTE.play().catch(() => {});
  } catch (e) {
    console.warn("Dino Go:", e);
  }
}
document.addEventListener("pointerdown", unmute); // every tap: it has to start inside one, and restarts after a pause
document.addEventListener("visibilitychange", () => {
  if (document.hidden && UNMUTE) UNMUTE.pause();
});
// Kiki starts once the page's own files are in, so the game is never waiting on the voice.
window.addEventListener("load", startKiki);
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
