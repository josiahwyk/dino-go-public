/* ---------- State ---------- */
const KEY = "dinogo.v1";
const DEFAULT_WORDS = ["come", "there", "should", "could", "said", "they", "was", "here"];
const MAXL = 12; // highest maths level: 1-6 are Year 1, 7-12 are Year 2 (older saves only ever hold 1-6, which still mean the same thing)
// Every saved setting with its default. normalizeSave() runs on every save that's loaded (this device's and the cloud copy),
// so a missing or bad value never reaches the game. Add new settings here, with their default and a check.
// Per-dino entries in owned are {xp,wins,caught,t}: mergeSaves (cloud.js) only keeps those four, so add any new one there too.
const defaultSave = () => ({
  owned: {},
  words: DEFAULT_WORDS.slice(),
  mathLvl: 3,
  hits: 6,
  streak: 0,
  stuck: 0,
  lastWord: null,
  lastWild: null,
  skills: {},
  battle: "math",
  challenge: true,
  hintAnswer: false,
});
function normalizeSave(raw) {
  const s = Object.assign(defaultSave(), raw && typeof raw === "object" ? raw : {});
  const int = (v, lo, hi, d) => (Number.isInteger(+v) && +v >= lo && +v <= hi ? +v : d),
    n = (v) => (Number.isFinite(+v) && +v > 0 ? +v : 0);
  s.mathLvl = int(s.mathLvl, 1, MAXL, 3);
  if (![4, 6, 8].includes(+s.hits)) s.hits = 6;
  else s.hits = +s.hits;
  s.streak = int(s.streak, 0, 999, 0);
  s.stuck = int(s.stuck, 0, 999, 0);
  if (!Array.isArray(s.words) || !s.words.length || !s.words.every((w) => typeof w === "string"))
    s.words = DEFAULT_WORDS.slice();
  if (!["math", "words", "mix"].includes(s.battle)) s.battle = "math";
  s.challenge = s.challenge !== false;
  s.hintAnswer = s.hintAnswer === true;
  if (!s.skills || typeof s.skills !== "object" || Array.isArray(s.skills)) s.skills = {};
  const owned = {};
  for (const [id, o] of Object.entries(s.owned && typeof s.owned === "object" ? s.owned : {}))
    if (o && typeof o === "object")
      owned[id] = { ...o, xp: n(o.xp), wins: n(o.wins), caught: Math.max(1, n(o.caught)), t: n(o.t) };
  s.owned = owned;
  delete s.mathMax;
  delete s.last; // no longer used
  return s;
}
let S = defaultSave();
try {
  const raw = localStorage.getItem(KEY);
  if (raw) S = JSON.parse(raw);
} catch (e) {
  console.warn("Dino Go: couldn't read the saved game", e);
}
S = normalizeSave(S);
function save() {
  S.u = Date.now();
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
  } catch (e) {
    console.warn("Dino Go:", e);
  }
  cloudPush();
}
const lvl = (o) => 1 + Math.floor((o.xp || 0) / 3);
const rand = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rand(a.length)];
const between = (lo, hi) => lo + rand(hi - lo + 1);
const rep = (n, c) => Array(n).fill(c);
const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const $ = (id) => document.getElementById(id);
