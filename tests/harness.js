// Loads the game's scripts into a plain Node sandbox (no browser, no installs) so the game rules can be tested.
// The page itself is faked: every element is a "stub" that accepts anything, so the code that wires up buttons runs harmlessly.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const GAME = path.join(__dirname, "..", "game");

// An object that can be read, written, called and looped over, and always gives back another stub.
function stub() {
  const fn = function () {};
  return new Proxy(fn, {
    get(t, k) {
      if (k === Symbol.iterator) return function* () {};
      if (k === Symbol.toPrimitive) return () => "";
      if (k === "length") return 0;
      if (k in t && k !== "name") return t[k];
      if (!(k in store(t))) store(t)[k] = stub();
      return store(t)[k];
    },
    set(t, k, v) {
      store(t)[k] = v;
      return true;
    },
    apply: () => stub(),
    construct: () => stub(),
  });
}
const stores = new WeakMap();
const store = (t) => stores.get(t) || (stores.set(t, {}), stores.get(t));

// Script order is read from index.html, so the tests always load what the page loads.
function scriptList() {
  const html = fs.readFileSync(path.join(GAME, "index.html"), "utf8");
  return [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
}

// skip: scripts not to run (boot loads pictures and draws the home screen).
function loadGame({ skip = ["js/boot.js"], saved = null } = {}) {
  const mem = saved ? { "dinogo.v1": JSON.stringify(saved) } : {};
  const sandbox = {
    console,
    setTimeout: () => 0,
    clearTimeout: () => {},
    localStorage: {
      getItem: (k) => (k in mem ? mem[k] : null),
      setItem: (k, v) => (mem[k] = String(v)),
      removeItem: (k) => delete mem[k],
    },
    document: stub(),
    matchMedia: () => ({ matches: false }),
    addEventListener: () => {},
    speechSynthesis: stub(),
    SpeechSynthesisUtterance: function () {},
    indexedDB: undefined,
    URL: { createObjectURL: () => "", revokeObjectURL: () => {} },
  };
  sandbox.window = sandbox;
  const ctx = vm.createContext(sandbox);
  let src = "";
  for (const f of scriptList()) if (!skip.includes(f)) src += fs.readFileSync(path.join(GAME, f), "utf8") + "\n;\n";
  // Top-level let/const aren't properties of the sandbox, so hand back the ones the tests use.
  src +=
    "\n({S:()=>S,setS:v=>{S=v},E:()=>E,setE:v=>{E=v},RETRY:()=>RETRY,setRetry:v=>{RETRY=v}," +
    "QUESTIONS,LEVELS,MAXL,SPECIES,BY,MOVE_SLOTS,FIN_POWER,mergeSaves:typeof mergeSaves==='function'?mergeSaves:null," +
    "misspell,known,wordQ,makeQ,skillKey,noteSkill,weakest,PATTERNS,CHALLENGE,DEFAULT_WORDS,SENT,hasArt," +
    "rules:typeof RULES==='object'?RULES:null,normalizeSave:typeof normalizeSave==='function'?normalizeSave:null," +
    "newEncounter:typeof newEncounter==='function'?newEncounter:null})";
  return vm.runInContext(src, ctx, { filename: "game" });
}

module.exports = { loadGame, GAME };
