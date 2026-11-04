const QUESTIONS = {
  1: [
    () => {
      const a = between(1, 9);
      return add(a, between(1, 10 - a));
    },
  ],
  2: [
    makeTen,
    () => missingPart(10),
    () => {
      const a = between(3, 10);
      return sub(a, between(1, a - 1));
    },
  ],
  3: [
    () => {
      const n = between(1, 9);
      return Math.random() < 0.5 ? add(10, n) : add(n, 10);
    },
    () => {
      const a = between(11, 17);
      return add(a, between(1, 19 - a));
    },
    () => {
      const a = between(6, 9);
      return add(a, between(11 - a, 9));
    },
    () => {
      const a = between(11, 19);
      return sub(a, between(1, a - 10));
    },
    () => {
      const a = between(11, 18);
      return sub(a, between(a - 9, 9));
    },
    () => missingPart(20),
    () => {
      const a = between(4, 9);
      return add(a, a + 1);
    },
    () => sub(20, between(3, 12)),
  ],
  4: [tensOnes, tensOnesOther, nextTo, tenMore, bigger, lookAlike],
  5: [skip, groups, pattern, longPattern, countMoney, coinStacks, equalGroups],
  6: [share, story, money, moneyAdd, bus, bags],
  // Year 2
  7: [pvBlocks, pvBlocks, digitValue, partition, partMissing, moreLess, biggerSmaller, howManyTens],
  8: [addPlain, subPlain, addPlain, subPlain, tensTo100],
  9: [addTrade, subTrade, addTrade, subTrade, bridgeTen],
  10: [skipY2, skipY2, stepGuess, growing],
  11: [groupsY2, arrayQ, repAdd, shareY2, bagsY2, fracShaded, fracPick, fracOf],
  12: [coinsTotal, changeNote, changeCents, twoItems, spendLeft, eachCost, storyY2],
};
function makeQ(fixed, slot) {
  // With one move the question is at their level, and 1 in 5 reviews an easier level: any earlier level up to Year 1's end, then only the 3 levels just below.
  // With a move menu (fixed given) the move decides the level instead.
  // A question they missed earlier comes back first (a new one of the same kind, at the level it was asked at).
  const due = RETRY.findIndex((r) => r.wait <= 0);
  if (due >= 0) {
    const r = RETRY.splice(due, 1)[0],
      q = r.gen();
    Object.assign(q, {
      gen: r.gen,
      lvl: r.lvl,
      retry: true,
      tries: r.tries,
      key: r.lvl ? skillKey(r.lvl, r.gen) : undefined,
    });
    return q;
  }
  if (useWords()) return wordQ(slot);
  // About 1 in 3 questions is the kind they find hardest at this level (see skills below); the rest are picked at random.
  const L = S.mathLvl,
    lv = fixed || (L > 1 && Math.random() < 0.2 ? between(L > 6 ? L - 3 : 1, L - 1) : L),
    weak = Math.random() < 1 / 3 ? weakest(lv) : null;
  let q,
    gen,
    g = 0;
  do {
    gen = weak && g === 0 ? weak : pick(QUESTIONS[lv]);
    q = gen();
    g++;
  } while (E.q && q.say === E.q.say && g < 6);
  q.gen = gen;
  q.lvl = lv;
  q.key = skillKey(lv, gen);
  return q;
}
// Skills: for each kind of maths question (one generator in QUESTIONS), right-first-time out of tries, saved as S.skills["level:name"]=[right,tries].
// Only the last ~10 tries count (older ones fade out), so a kind they have since learned stops coming up as "hardest".
const skillKey = (lv, gen) => `${lv}:${gen.name || QUESTIONS[lv].indexOf(gen)}`;
function weakest(lv) {
  const sk = S.skills || {},
    rated = [...new Set(QUESTIONS[lv])]
      .map((g) => {
        const s = sk[skillKey(lv, g)];
        return s && s[1] >= 2 ? { g, rate: (s[0] + 1) / (s[1] + 2) } : null;
      })
      .filter(Boolean);
  if (!rated.length) return null;
  const low = Math.min(...rated.map((x) => x.rate));
  return pick(rated.filter((x) => x.rate === low)).g;
}
function noteSkill(k, ok) {
  if (!k) return;
  S.skills = S.skills || {};
  let [r, n] = S.skills[k] || [0, 0];
  n++;
  if (ok) r++;
  if (n > 10) {
    r = (r * 10) / n;
    n = 10;
  }
  S.skills[k] = [Math.round(r * 100) / 100, n];
}
// Questions they got wrong first time come back as a fresh one of the same kind 2 rounds later ("one like before"). Memory only, not saved;
// if the battle ends first they come up in the next battle. Each kind comes back at most twice, and only 3 wait at a time.
let RETRY = [];
// The card covers the dinos, so ✕ tucks it away and the 💡 button by the question brings it back (tapping the card itself says the clue again).
function showHint() {
  hideHint();
  const h = E.q && E.q.hint;
  if (!h || !h.html) return;
  const d = document.createElement("div");
  d.className = "cluecard";
  d.id = "hint";
  d.innerHTML = `<button class="cc-x" aria-label="Hide the clue">✕</button><h4>💡 Clue</h4>${h.html}`;
  d.onclick = () => say(h.say);
  d.querySelector(".cc-x").onclick = (e) => {
    e.stopPropagation();
    d.hidden = true;
    $("b-clue").hidden = false;
  };
  $("arena").appendChild(d);
}
function hideHint() {
  const d = $("hint");
  if (d) d.remove();
  $("b-clue").hidden = true;
}
$("b-clue").onclick = () => {
  const d = $("hint");
  if (!d) return;
  d.hidden = false;
  $("b-clue").hidden = true;
  say(E.q.hint.say);
};
