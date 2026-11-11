// Run with: node tests/run.js   (no installs needed)
// Checks the game rules by playing thousands of pretend questions and battles. Exits with an error if anything fails.
let { loadGame } = require("./harness");

let failed = 0,
  passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log("  ok  " + name);
  } catch (e) {
    failed++;
    console.log("  FAIL " + name + "\n       " + e.message);
  }
}
function check(cond, msg) {
  if (!cond) throw new Error(msg);
}
const show = (q) => JSON.stringify({ say: q.say, ans: q.ans, choices: q.choices });
// Story questions name their dino and the wild one, so every test starts mid-battle.
const _load = loadGame;
loadGame = (o) => {
  const g = _load(o);
  Object.assign(g.E(), { me: "01_triceratops", wild: g.SPECIES[20] });
  return g;
};

const RUNS = 400; // questions per generator

// ---------- Maths questions ----------
test("every maths question: answer is one of the choices, choices are different, there is a clue", () => {
  const g = loadGame();
  for (let lv = 1; lv <= g.MAXL; lv++) {
    for (const gen of new Set(g.QUESTIONS[lv])) {
      const name = `level ${lv} ${gen.name || "#" + g.QUESTIONS[lv].indexOf(gen)}`;
      for (let i = 0; i < RUNS; i++) {
        const q = gen();
        check(typeof q.html === "string" && q.html.length, `${name}: no picture/html`);
        check(typeof q.say === "string" && q.say.length, `${name}: nothing to say`);
        check(Array.isArray(q.choices), `${name}: no choices`);
        check(q.choices.length >= 2 && q.choices.length <= 4, `${name}: ${q.choices.length} choices ${show(q)}`);
        check(q.choices.includes(q.ans), `${name}: answer not in choices ${show(q)}`);
        check(new Set(q.choices.map(String)).size === q.choices.length, `${name}: repeated choice ${show(q)}`);
        check(q.hint && q.hint.html && q.hint.say, `${name}: no clue`);
        for (const c of q.choices)
          check(
            typeof c === "number" ? Number.isFinite(c) && c >= 0 : typeof c === "string",
            `${name}: odd choice ${c}`,
          );
      }
    }
  }
});

// Some kinds have 2 or 3 choices on purpose (bigger/smaller, patterns, fractions), but a kind never loses a button at random.
test("each kind of maths question always shows the same number of choices", () => {
  const g = loadGame();
  for (let lv = 1; lv <= g.MAXL; lv++)
    for (const gen of new Set(g.QUESTIONS[lv])) {
      const counts = new Set();
      for (let i = 0; i < RUNS * 3; i++) counts.add(gen().choices.length);
      check(counts.size === 1, `level ${lv} ${gen.name}: sometimes ${[...counts].join(" or ")} choices`);
    }
});

test("makeQ gives a question at a sensible level and remembers its kind", () => {
  const g = loadGame();
  for (let L = 1; L <= g.MAXL; L++) {
    g.S().mathLvl = L;
    for (let i = 0; i < 200; i++) {
      const q = g.makeQ();
      check(q.lvl >= 1 && q.lvl <= L, `level ${L}: question at level ${q.lvl}`);
      if (L > 6) check(q.lvl >= L - 3, `level ${L}: review question too easy (level ${q.lvl})`);
      check(g.QUESTIONS[q.lvl].includes(q.gen), `level ${L}: unknown generator`);
      check(q.key === g.skillKey(q.lvl, q.gen), "skill key mismatch");
    }
    for (let i = 0; i < 50; i++) check(g.makeQ(L).lvl === L, "fixed level not honoured");
  }
});

test("skills keep only about the last 10 tries", () => {
  const g = loadGame();
  for (let i = 0; i < 30; i++) g.noteSkill("4:x", false);
  for (let i = 0; i < 10; i++) g.noteSkill("4:x", true);
  const [r, n] = g.S().skills["4:x"];
  check(n === 10, "tries should stay at 10, got " + n);
  check(r > 6, "recent right answers should dominate, got " + r);
});

// ---------- Battles ----------
test("every battle takes exactly S.hits right answers, whatever moves they pick", () => {
  const g = loadGame();
  const powers = g.MOVE_SLOTS.map((m) => m.power);
  for (const hits of [4, 6, 8])
    for (const sp of g.SPECIES)
      for (let run = 0; run < 30; run++) {
        g.S().hits = hits;
        const E = g.E();
        E.hp = sp.hp;
        E.maxHp = sp.hp;
        E.turn = 0;
        E.combo = 0;
        for (let t = 0; t < hits; t++) {
          check(E.hp > 0, `${sp.name}: fainted after ${t} of ${hits} hits`);
          const fin = Math.random() < 0.25;
          const dmg = g.rules.hitDamage(
            E,
            hits,
            fin ? g.FIN_POWER : powers[run % powers.length] * (1 + Math.random() * 0.3),
            fin,
          );
          check(dmg >= 1, "a hit did no damage");
          g.rules.applyHit(E, dmg, hits);
          if (t < hits - 1) check(E.hp >= 1, `${sp.name}: knocked out early on hit ${t + 1} of ${hits}`);
        }
        check(E.hp === 0, `${sp.name}: still standing after ${hits} hits`);
      }
});

// ---------- Spelling ----------
test("wrong spellings are never real words or the word itself", () => {
  const g = loadGame();
  const k = g.known();
  const words = [
    ...new Set([...g.PATTERNS.flatMap((p) => p.list.flatMap((x) => x.split("/"))), ...g.CHALLENGE, ...g.DEFAULT_WORDS]),
  ];
  for (const w of words)
    for (const m of g.misspell(w)) {
      check(m !== w, `${w}: offered itself`);
      check(!k.has(m), `${w}: offered real word "${m}"`);
      check(m[0] === w[0], `${w}: changed the first letter ("${m}")`);
    }
});

test("spelling battle questions: answer in choices, no repeats, a clue", () => {
  const g = loadGame();
  for (const w of [...g.CHALLENGE, ...g.DEFAULT_WORDS, "careful", "children", "thought"])
    for (const slot of [0, 1, 2])
      for (let i = 0; i < 20; i++) {
        const q = g.wordQ(slot, w);
        check(q.choices.includes(q.ans), `${w} slot ${slot}: answer missing ${show(q)}`);
        check(new Set(q.choices).size === q.choices.length, `${w} slot ${slot}: repeated choice ${show(q)}`);
        check(q.lvl === 0, "spelling must not count as a maths level");
        check(q.hint && q.hint.say, `${w}: no clue`);
        if (slot < 2) check(q.choices.length === 4, `${w} slot ${slot}: ${q.choices.length} choices`);
      }
});

test("every built-in word has a sentence", () => {
  const g = loadGame();
  const words = [
    ...new Set([...g.PATTERNS.flatMap((p) => p.list.flatMap((x) => x.split("/"))), ...g.CHALLENGE, ...g.DEFAULT_WORDS]),
  ];
  const missing = words.filter((w) => !g.SENT[w]);
  check(!missing.length, "no sentence for: " + missing.join(", "));
});

// ---------- Saves on two devices ----------
const dino = (xp, wins, t, caught = 1) => ({ xp, wins, caught, t });

test("merging two devices keeps every dino caught on either", () => {
  const g = loadGame();
  const ipad = { u: 100, owned: { a: dino(3, 2, 10), b: dino(0, 0, 20) }, mathLvl: 4 };
  const phone = { u: 200, owned: { a: dino(1, 1, 10), c: dino(0, 0, 30) }, mathLvl: 5 };
  const m = g.mergeSaves(ipad, phone);
  check(Object.keys(m.owned).sort().join() === "a,b,c", "lost a dino: " + Object.keys(m.owned));
  check(m.owned.a.xp === 3 && m.owned.a.wins === 2, "kept the lower xp/wins for a");
  check(m.mathLvl === 5, "settings should come from the newer save");
  const m2 = g.mergeSaves(phone, ipad);
  check(
    JSON.stringify(Object.keys(m2.owned).sort()) === JSON.stringify(Object.keys(m.owned).sort()),
    "merge depends on order",
  );
});

test("a reset on one device removes dinos caught before it, keeps ones caught after", () => {
  const g = loadGame();
  const reset = { u: 300, reset: 250, owned: {} };
  const other = { u: 200, owned: { old: dino(5, 5, 100), fresh: dino(0, 0, 260) } };
  const m = g.mergeSaves(reset, other);
  check(!m.owned.old, "a dino from before the reset came back");
  check(m.owned.fresh, "a dino caught after the reset was lost");
  check(m.reset === 250, "reset time lost");
});

test("merge doesn't share objects with its inputs", () => {
  const g = loadGame();
  const a = { u: 1, owned: { x: dino(1, 1, 1) }, words: ["cat"] };
  const m = g.mergeSaves(a, { u: 0, owned: {} });
  m.owned.x.xp = 99;
  m.words.push("dog");
  check(a.owned.x.xp === 1 && a.words.length === 1, "changing the merged save changed the original");
});

// ---------- Rules pulled out of the battle screen (see js/rules.js) ----------
test("adaptive level: 5 right first time at their level moves them up, 2 stuck moves them down", () => {
  const g = loadGame();
  if (!g.rules) throw new Error("js/rules.js not loaded");
  const s = { mathLvl: 4, streak: 0, stuck: 0 };
  for (let i = 0; i < 4; i++) g.rules.adaptLevel(s, 4, 0);
  check(s.mathLvl === 4, "moved up too early");
  g.rules.adaptLevel(s, 4, 0);
  check(s.mathLvl === 5 && s.streak === 0, "should be level 5 after 5 in a row");
  g.rules.adaptLevel(s, 5, 2);
  g.rules.adaptLevel(s, 5, 2);
  check(s.mathLvl === 4, "should drop after being stuck twice");
  const t = { mathLvl: 3, streak: 4, stuck: 0 };
  g.rules.adaptLevel(t, 2, 0);
  check(t.streak === 4, "easier questions must not count");
  g.rules.adaptLevel(t, 4, 0);
  check(t.mathLvl === 4, "harder question right first time should count toward moving up");
  const u = { mathLvl: 3, streak: 0, stuck: 1 };
  g.rules.adaptLevel(u, 4, 3);
  check(u.mathLvl === 3 && u.stuck === 1, "a miss on a harder question must not count toward stuck");
  const top = { mathLvl: g.MAXL, streak: 4, stuck: 0 };
  g.rules.adaptLevel(top, g.MAXL, 0);
  check(top.mathLvl === g.MAXL, "went past the top level");
  const bottom = { mathLvl: 1, streak: 0, stuck: 1 };
  g.rules.adaptLevel(bottom, 1, 2);
  check(bottom.mathLvl === 1, "went below level 1");
});

test("super meter and shield charge as designed", () => {
  const g = loadGame();
  const r = g.rules;
  // right first time with the hard move fills 2 of 3
  let e = { combo: 0, shield: false, shieldN: 0 };
  let out = r.rightAnswer(e, { first: true, charge: 2, shieldNeed: 3 });
  check(e.combo === 2 && !out.fin, "hard move should add 2 and not fire");
  out = r.rightAnswer(e, { first: true, charge: 1, shieldNeed: 3 });
  check(out.fin, "super should fire at 3");
  // shield
  e = { combo: 0, shield: false, shieldN: 0 };
  r.rightAnswer(e, { first: true, charge: 1, shieldNeed: 2 });
  out = r.rightAnswer(e, { first: true, charge: 1, shieldNeed: 2 });
  check(e.shield && out.shieldUp && e.shieldN === 0, "shield should charge after 2 at level 4+");
  // not first time: nothing charges
  e = { combo: 1, shield: false, shieldN: 1 };
  out = r.rightAnswer(e, { first: false, charge: 2, shieldNeed: 3 });
  check(e.combo === 1 && e.shieldN === 1 && !out.fin, "a late right answer should charge nothing");
  // wrong taps
  e = { combo: 2, shieldN: 2 };
  r.wrongTap(e, 1);
  check(e.combo === 1 && e.shieldN === 0, "first wrong tap takes 1 from the meter and resets the shield");
  r.wrongTap(e, 2);
  check(e.combo === 1, "only the first wrong tap on a question costs meter");
});

// ---------- Saves loaded from a device ----------
test("normalizeSave fixes or fills in every setting", () => {
  const g = loadGame();
  if (!g.normalizeSave) throw new Error("normalizeSave missing");
  const s = g.normalizeSave({
    mathLvl: 99,
    hits: 5,
    words: "cat",
    owned: { a: { xp: "3" }, bad: null },
    battle: "chess",
    skills: [],
    mathMax: 4,
  });
  check(s.mathLvl === 3 && s.hits === 6, "bad level/hits not fixed");
  check(Array.isArray(s.words) && s.words.length, "words not fixed");
  check(s.battle === "math", "battle setting not fixed");
  check(s.owned.a && s.owned.a.xp === 3 && !("bad" in s.owned), "owned dinos not cleaned");
  check(s.skills && !Array.isArray(s.skills), "skills not fixed");
  check(!("mathMax" in s), "old field kept");
  const d = g.normalizeSave(null);
  check(d.mathLvl === 3 && d.hits === 6 && d.owned && Object.keys(d.owned).length === 0, "empty save not filled in");
  const keep = g.normalizeSave({
    mathLvl: 8,
    hits: 4,
    words: ["dog"],
    battle: "mix",
    challenge: false,
    hintAnswer: true,
  });
  check(
    keep.mathLvl === 8 &&
      keep.hits === 4 &&
      keep.words[0] === "dog" &&
      keep.battle === "mix" &&
      keep.challenge === false &&
      keep.hintAnswer === true,
    "good values changed",
  );
});

test("a save loaded from the device goes through normalizeSave", () => {
  const g = loadGame({
    saved: { mathLvl: 0, hits: 7, owned: { "01_triceratops": { xp: 2, wins: 1, caught: 1, t: 1 } } },
  });
  check(g.S().mathLvl === 3 && g.S().hits === 6, "bad stored values not fixed");
  check(g.S().owned["01_triceratops"].xp === 2, "dino lost on load");
});

test("newEncounter starts every field fresh", () => {
  const g = loadGame();
  if (!g.newEncounter) throw new Error("newEncounter missing");
  const a = g.newEncounter(g.SPECIES[0]);
  a.combo = 3;
  a.shield = true;
  a.q = { say: "x" };
  const b = g.newEncounter(g.SPECIES[1]);
  check(b.combo === 0 && b.shield === false && b.q === null && b.wild === g.SPECIES[1], "fields leaked between fights");
});

test("every dino has art", () => {
  const g = loadGame();
  const fs = require("fs"),
    path = require("path");
  for (const s of g.SPECIES) {
    check(g.hasArt(s.id), s.id + " has no art");
    for (const f of [s.id + ".webp", s.id + "_attack.webp"])
      check(fs.existsSync(path.join(__dirname, "..", "game", "dinos", f)), "missing file dinos/" + f);
  }
});

test("the voice says dino as dyno, and the Kiki voice files are all there", () => {
  const g = loadGame();
  check(g.sayFix("You have 3 dinos! Tap one.") === "You have 3 dynos! Tap one.", "dinos not respelt");
  check(g.sayFix("each dino gets 2") === "each dyno gets 2", "dino not respelt");
  check(g.sayFix("A dinosaur. Dinos!") === "A dinosaur. dynos!", "dinosaur changed, or Dinos missed");
  const fs = require("fs"),
    path = require("path"),
    dir = path.join(__dirname, "..", "game", "js", "kiki");
  const m = JSON.parse(fs.readFileSync(path.join(dir, "kiki-manifest.json"), "utf8"));
  for (const f of ["kiki-worker.js", "ort-wasm-simd-threaded.mjs", m.wasm, m.voice.file, ...m.parts])
    check(fs.existsSync(path.join(dir, f)), "missing file js/kiki/" + f);
  // The model parts are base64 text: together they must decode to exactly the size the worker expects.
  const len = m.parts.reduce((n, p) => n + Buffer.from(fs.readFileSync(path.join(dir, p), "utf8"), "base64").length, 0);
  check(len === m.bytes, `model parts decode to ${len} bytes, manifest says ${m.bytes}`);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
