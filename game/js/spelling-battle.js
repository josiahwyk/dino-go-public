/* ---------- Spelling questions in battle (grown-up setting "Battle questions": maths, words or a mix) ---------- */
// Same homework + challenge words as catching. The move picks the kind: easy = one missing letter, medium = two missing letters
// side by side, hard = pick the right spelling. Spelling questions have lvl 0, so they never move his maths level.
let KNOWN = null; // every real word the game knows: a wrong spelling on offer is never a real word (no their/there traps)

const known = () =>
  KNOWN ||
  (KNOWN = new Set([
    ...PATTERNS.flatMap((p) => p.list.flatMap((x) => x.split("/"))),
    ...CHALLENGE,
    ...DEFAULT_WORDS,
    ...COMMON,
  ]));
const useWords = () => S.battle === "words" || (S.battle === "mix" && Math.random() < 0.5);
function battleWord() {
  const home = S.words && S.words.length ? S.words : DEFAULT_WORDS,
    w = S.challenge !== false && Math.random() < 0.25 ? CHALLENGE : home;
  const ws = w.filter((x) => !E.q || x !== E.q.word);
  return pick(ws.length ? ws : w);
}
const VOW = "aeiou";
// Slips children really make, most likely first, never touching the first letter: a wrong vowel, two vowels swapped (ie/ei), a vowel or a
// doubled letter left out (shold, dolar); then a look-alike consonant (b/d) or a doubled consonant. Shuffled within each group.
function misspell(w) {
  const k = known(),
    seen = new Set([w]),
    tiers = [[], []],
    add = (t, v) => {
      if (v.length >= 2 && !seen.has(v) && !k.has(v) && !(S.words || []).includes(v)) {
        seen.add(v);
        tiers[t].push(v);
      }
    };
  const at = (i, s) => w.slice(0, i) + s + w.slice(i + 1),
    v = (c) => VOW.includes(c);
  for (let i = 1; i < w.length; i++) {
    if (v(w[i])) {
      for (const c of CONFUSE[w[i]] || "") add(0, at(i, c));
      if (w.length > 3 && [...w].filter(v).length > 1) add(0, at(i, ""));
    }
    if (i < w.length - 1 && v(w[i]) && v(w[i + 1]) && w[i] !== w[i + 1])
      add(0, w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2));
    if (w[i] === w[i - 1]) add(0, at(i, ""));
    if (!v(w[i])) {
      for (const c of CONFUSE[w[i]] || "") if (!v(c)) add(1, at(i, c));
      if (w[i] !== w[i - 1] && w[i] !== w[i + 1] && i < w.length - 1) add(1, at(i, w[i] + w[i]));
    }
  }
  return [...shuffle(tiers[0]), ...shuffle(tiers[1])];
}
const chunkAlts = (p) => {
  const s = new Set([p[1] + p[0]]);
  for (let i = 0; i < 2; i++) for (const c of CONFUSE[p[i]] || "") s.add(i ? p[0] + c : c + p[1]);
  s.delete(p);
  return [...s];
};
const wordSlots = (w, at, n) =>
  `<div class="slots sm" style="--n:${w.length}">${[...w].map((c, i) => (i >= at && i < at + n ? '<div class="slot ask">?</div>' : `<div class="slot">${c}</div>`)).join("")}</div>`;
function wordQ(slot, word) {
  const w = word || battleWord(),
    kind = slot || 0,
    base = { word: w, sayRight: w, lvl: 0, gen: () => wordQ(kind, w) };
  if (kind === 2) {
    const blanks = `<div class="slots sm">${'<div class="slot"></div>'.repeat(w.length)}</div>`;
    return {
      ...base,
      html: words("Listen, then tap the right spelling"),
      say: `Which one spells... ${sayWord(w)}`,
      ans: w,
      choices: shuffle([w, ...misspell(w).slice(0, 3)]),
      wide: true,
      hint: clue(
        `${w} has ${w.length} letters. Say it slowly, then check each one.`,
        blanks,
        words(`${w.length} letters`),
      ),
    };
  }
  // where the gap goes: on a vowel if possible (the part most often misspelled), never the first letter (he hears that one easily)
  const n = kind === 1 && w.length >= 3 ? 2 : 1,
    all = [...Array(w.length - n + 1).keys()],
    starts = all.length > 1 ? all.slice(1) : all,
    vs = starts.filter((i) => [...w.slice(i, i + n)].some((c) => VOW.includes(c)));
  const at = pick(vs.length ? vs : starts),
    part = w.slice(at, at + n),
    opts = new Set([part]);
  shuffle(n === 1 ? [...(CONFUSE[part] || "")] : chunkAlts(part)).forEach((a) => {
    if (opts.size < 4) opts.add(a);
  });
  for (let g = 0; opts.size < 4 && g < 60; g++)
    opts.add(n === 1 ? pick([..."abcdefghijklmnoprstuvwy"]) : pick([...VOW]) + pick([..."aeiourlnwy"]));
  const which = n === 1 ? "letter is" : "letters are";
  return {
    ...base,
    html: wordSlots(w, at, n) + words(`Which ${which} missing?`),
    say: `${sayWord(w)} Which ${which} missing?`,
    ans: part,
    choices: shuffle([...opts]),
    letters: true,
    hint: clue(`Listen again: ${sayWord(w)} Say it slowly and listen for the sound in the gap.`, wordSlots(w, at, n)),
  };
}
