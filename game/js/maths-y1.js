/* ---------- Maths questions: Australian Curriculum v9, Year 1 ---------- */
// Level 1 is Foundation revision; levels 2-6 cover the Year 1 number and algebra content descriptions.
const LEVELS = [
  null,
  { name: "1. Adding to 10", code: "Foundation revision" },
  { name: "2. Make 10, missing parts, take away", code: "AC9M1N02, AC9M1N04" },
  { name: "3. Add and take away to 20", code: "AC9M1N02, AC9M1N04" },
  { name: "4. Numbers to 120, tens and ones", code: "AC9M1N01, AC9M1N02" },
  { name: "5. Skip counting, coins, groups, patterns", code: "AC9M1A01, AC9M1A02, AC9M1N03, AC9M1N06" },
  { name: "6. Story problems, money, sharing", code: "AC9M1N05, AC9M1N06" },
  // Year 2 (levels 7-12)
  { name: "7. Place value to 1000", code: "AC9M2N01, AC9M2N02" },
  { name: "8. Add and take away within 100", code: "AC9M2N04" },
  { name: "9. Add and take away with trading (regrouping)", code: "AC9M2N04" },
  { name: "10. Skip counting and number patterns", code: "AC9M2A01, AC9M2N05" },
  { name: "11. Equal groups, arrays, halves and quarters", code: "AC9M2N05, AC9M2N03, AC9M2M02" },
  { name: "12. Money, change and story problems", code: "AC9M2N06, AC9M2N04" },
];
const SHAPES = { circle: "circle", square: "square", tri: "triangle", star: "star" };
const shape = (k) => `<i class="shp ${k}"></i>`;
const eq = (t) => `<div class="eq">${t}</div>`,
  words = (t) => `<div class="eq words">${t}</div>`;
const strip = (xs) =>
  `<div class="strip">${xs.map((x) => (x === "?" ? '<b class="ask">?</b>' : `<b>${x}</b>`)).join("")}</div>`;
// Berries in rows of 5, ten to a card (like a ten-frame, without the empty spaces)
const berries = (n) =>
  `<div class="row-vis">${Array.from({ length: Math.ceil(n / 10) }, (_, i) => `<div class="bf">${'<i class="berry"></i>'.repeat(Math.min(10, n - 10 * i))}</div>`).join("")}</div>`;
function frames(cells) {
  let h = "";
  for (let i = 0; i < cells.length; i += 10) {
    const c = cells.slice(i, i + 10);
    while (c.length < 10) c.push("");
    h += `<div class="tf">${c.map((x) => `<i class="${x}"></i>`).join("")}</div>`;
  }
  return `<div class="row-vis">${h}</div>`;
}
function nums(ans, spread = [1, 2], min = 0) {
  const s = new Set([ans]);
  for (let g = 0; s.size < 4 && g < 80; g++) {
    const v = ans + pick(spread) * (Math.random() < 0.5 ? -1 : 1);
    if (v >= min) s.add(v);
  }
  topUp(s, ans, Math.min(...spread), min);
  return [...s].sort((a, b) => a - b);
}
// Random hops can run out near a limit (answer 1 with no zeros allowed only reaches 2 and 3), so step further out until there are 4 choices.
function topUp(s, ans, step, min = 0, max = Infinity) {
  for (let k = 1; s.size < 4 && k <= 50; k++)
    for (const v of [ans + k * step, ans - k * step]) if (s.size < 4 && v >= min && v <= max) s.add(v);
}
const plural = (n, one, many) => (n === 1 ? one : many);

const add = (a, b) => ({
  html: eq(`${a} + ${b} = ?`) + frames([...rep(a, "a"), ...rep(b, "b")]),
  say: `${a} plus ${b}?`,
  ans: a + b,
  choices: nums(a + b, [1, 2], 1),
  hint: Clue.add(a, b),
});
const sub = (a, b) => ({
  html: eq(`${a} − ${b} = ?`) + frames([...rep(a - b, "a"), ...rep(b, "x")]),
  say: `${a} take away ${b}?`,
  ans: a - b,
  choices: nums(a - b, [1, 2]),
  hint: Clue.on(a, -b),
});
function makeTen() {
  const a = between(1, 9);
  return {
    html: eq(`${a} + ? = 10`) + frames([...rep(a, "a"), ...rep(10 - a, "e")]),
    say: `${a} and how many more make 10?`,
    ans: 10 - a,
    choices: nums(10 - a, [1, 2]),
    hint: Clue.gap(a, 10),
  };
}
// Year 1 tens pictures: each ten has its running count under it (10, 20, 30...), so he counts by tens and then counts on the ones.
const tensRun = (t, cls = "rod") =>
  Array.from({ length: t }, (_, i) => `<span class="rl"><i class="${cls}"></i><b>${10 * (i + 1)}</b></span>`).join("");
function tensOnes() {
  const t = between(1, 9),
    o = between(0, 9),
    ans = t * 10 + o,
    s = new Set([ans]);
  if (o > 0 && o !== t) s.add(o * 10 + t);
  s.add(ans + (ans < 100 ? 10 : -10));
  s.add(ans + (o < 9 ? 1 : -1));
  const choices = [...s].slice(0, 4);
  for (const v of nums(ans, [1, 10])) if (choices.length < 4 && !choices.includes(v)) choices.push(v);
  return {
    html:
      `<div class="base">${tensRun(t)}${o ? `<div style="margin-left:8px">${frames(rep(o, "a"))}</div>` : ""}</div>` +
      words(`${t} ${plural(t, "ten", "tens")} and ${o} ${plural(o, "one", "ones")}`),
    say: `${t} ${plural(t, "ten", "tens")} and ${o} ${plural(o, "one", "ones")}. Count the tens by 10s, then count on the ones. What number is that?`,
    ans,
    choices: choices.sort((a, b) => a - b),
    hint: Clue.tens(t, o),
  };
}
function nextTo() {
  const n = between(10, 119);
  return Math.random() < 0.6
    ? {
        html: strip([n - 1, n, "?"]),
        say: `What number comes after ${n}?`,
        ans: n + 1,
        choices: nums(n + 1, [1, 2, 10]),
        hint: clue(`What comes after ${n}? Count on one.`, numLine([n, n + 1])),
      }
    : {
        html: strip(["?", n, n + 1]),
        say: `What number comes before ${n}?`,
        ans: n - 1,
        choices: nums(n - 1, [1, 2, 10]),
        hint: clue(`Count back one from ${n}.`, numLine([n, n - 1])),
      };
}
function bigger() {
  const a = between(10, 120);
  let b = a;
  while (b === a) b = Math.random() < 0.5 ? Math.floor(a / 10) * 10 + rand(10) : between(10, 120);
  return {
    html: words("Which number is bigger?"),
    say: `Which number is bigger, ${a} or ${b}?`,
    ans: Math.max(a, b),
    choices: [a, b],
    hint: Clue.cmp(a, b, true),
  };
}
function skip() {
  const step = pick([2, 5, 10]),
    start = step * rand(step === 2 ? 20 : step === 5 ? 12 : 8),
    seq = [0, 1, 2, 3, 4].map((i) => start + i * step);
  const hide = Math.random() < 0.7 ? 4 : between(1, 3),
    ans = seq[hide];
  return {
    html: strip(seq.map((v, i) => (i === hide ? "?" : v))) + words(`Count by ${step}s`),
    say: `Count by ${step}s. ${seq.map((v, i) => (i === hide ? "what" : v)).join(", ")}?`,
    ans,
    choices: nums(ans, [1, step]),
    hint: Clue.seq(seq, hide, step),
  };
}
function groups() {
  const k = pick([2, 5, 10]),
    g = between(2, 5),
    cols = Math.min(k, 5);
  const grp = `<div class="grp" style="grid-template-columns:repeat(${cols},auto)">${"<i></i>".repeat(k)}</div>`;
  return {
    html: `<div class="row-vis">${grp.repeat(g)}</div>` + words(`${g} groups of ${k}`),
    say: `${g} groups of ${k}. How many altogether? Count by ${k}s.`,
    ans: g * k,
    choices: nums(g * k, [k, 1], 1),
    hint: Clue.count(k, g),
  };
}
function pattern() {
  const [A, B, C] = shuffle(Object.keys(SHAPES)),
    unit = pick([
      [A, B],
      [A, A, B],
      [A, B, B],
      [A, B, C],
    ]);
  const len = unit.length * 2 + rand(unit.length),
    seq = Array.from({ length: len }, (_, i) => unit[i % unit.length]),
    ans = unit[len % unit.length];
  const choices = shuffle([...new Set([...unit, ...Object.keys(SHAPES)])].slice(0, 3));
  if (!choices.includes(ans)) choices[0] = ans;
  return {
    html: `<div class="strip">${seq.map((k) => `<b>${shape(k)}</b>`).join("")}<b class="ask">?</b></div>`,
    say: `${seq.map((k) => SHAPES[k]).join(", ")}. What shape comes next?`,
    ans,
    choices,
    label: shape,
    sayAns: (k) => SHAPES[k],
    hint: Clue.unit(unit),
  };
}

function share() {
  const d = between(2, 4),
    each = between(1, 5),
    n = d * each,
    s = src(E.me);
  const dino = s ? `<img class="mini" src="${s}" alt="">` : '<span style="font-size:2.4rem">🦕</span>';
  return {
    html: `${berries(n)}<div class="row-vis">${dino.repeat(d)}</div>` + words(`${n} berries shared by ${d} dinos`),
    say: `${n} berries, shared equally between ${d} dinos. How many berries does each dino get?`,
    ans: each,
    choices: nums(each, [1, 2], 1),
    hint: Clue.deal(n, d),
  };
}
function story() {
  const me = BY[E.me].name,
    wild = E.wild.name;
  return pick([
    () => {
      const a = between(5, 15),
        b = between(1, a - 1),
        t = `There are ${a} eggs in the nest. ${b} ${plural(b, "egg hatches", "eggs hatch")}. How many eggs are left?`;
      return {
        html: words(t) + frames([...rep(a - b, "a"), ...rep(b, "x")]),
        say: t,
        ans: a - b,
        choices: nums(a - b, [1, 2]),
        hint: Clue.on(a, -b),
      };
    },
    () => {
      const a = between(3, 12),
        b = between(2, 20 - a),
        t = `Your ${me} ate ${a} berries, then ${b} more. How many berries altogether?`;
      return {
        html: words(t) + frames([...rep(a, "a"), ...rep(b, "b")]),
        say: t,
        ans: a + b,
        choices: nums(a + b, [1, 2], 1),
        hint: Clue.add(a, b),
      };
    },
    () => {
      const a = between(6, 15),
        b = between(2, a - 1),
        t = `Your ${me} found ${a} leaves. The wild ${wild} found ${b}. How many more did your ${me} find?`;
      return {
        html: words(t) + frames([...rep(b, "b"), ...rep(a - b, "a")]),
        say: t,
        ans: a - b,
        choices: nums(a - b, [1, 2]),
        hint: Clue.gap(b, a),
      };
    },
  ])();
}
function money() {
  const a = between(3, 10),
    b = between(1, a - 1),
    t = `You have ${a} dollars. A dino egg costs ${b} ${plural(b, "dollar", "dollars")}. How much money is left?`;
  const coins = Array.from(
    { length: a },
    (_, i) => `<span class="coin" style="${i >= a - b ? "opacity:.3" : ""}">$1</span>`,
  ).join("");
  return {
    html: words(t) + `<div class="c5">${coins}</div>`,
    say: t,
    ans: a - b,
    choices: nums(a - b, [1, 2]),
    hint: Clue.on(a, -b),
  };
}
/* Harder Year 1 variants, each modelled on an official AC9 elaboration */
const ONES = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ],
  TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const numWord = (n) =>
  n < 20
    ? ONES[n]
    : n >= 100
      ? "one hundred" + (n > 100 ? " and " + numWord(n - 100) : "")
      : TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "");
// AC9M1N02 part-part-whole: "4 and how many more make 9?"
function missingPart(max) {
  const b = between(5, max),
    a = between(1, b - 1);
  return {
    html: eq(`${a} + ? = ${b}`) + frames([...rep(a, "a"), ...rep(b - a, "e")]),
    say: `${a} and how many more make ${b}?`,
    ans: b - a,
    choices: nums(b - a, [1, 2]),
    hint: Clue.gap(a, b),
  };
}
// AC9M1N02: "35 is 2 tens and 15 ones"
function tensOnesOther() {
  const t = between(2, 9),
    o = between(0, 9),
    n = t * 10 + o,
    ans = 10 + o,
    s = new Set([ans, o, ans + 1, ans - 1]);
  // Shown already broken so he can count it: the tens left as rods, the broken ten as a full blue ten-frame, the ones in orange.
  return {
    html:
      eq(String(n)) +
      `<div class="row-vis"><div class="base">${tensRun(t - 1)}</div><div class="fstack">${frames([...rep(10, "b"), ...rep(o, "a")])}</div></div>` +
      words(`${t - 1} ${plural(t - 1, "ten", "tens")} and ? ones`),
    say: `${n} is ${t} tens${o ? ` and ${o} ${plural(o, "one", "ones")}` : ""}. Break one ten into 10 ones. Now it's ${t - 1} ${plural(t - 1, "ten", "tens")} and how many ones?`,
    ans,
    choices: [...s]
      .filter((v) => v >= 0)
      .slice(0, 4)
      .sort((a, b) => a - b),
    hint: o
      ? clue(
          `Break one ten into 10 ones. Start at 10 and count on ${o} more ${plural(o, "one", "ones")}.`,
          numLine(jumps(10, o)),
        )
      : clue("Break one ten into ones. How many ones make one ten?", words("1 ten = ? ones")),
  };
}
// AC9M1N01: numbers that look and sound alike, e.g. 16, 60, 61, 66
function lookAlike() {
  let a = between(1, 9),
    b = between(1, 9);
  while (b === a) b = between(1, 9);
  const opts = shuffle([...new Set([a * 10 + b, b * 10 + a, a * 11, b * 10, a * 10])]).slice(0, 4),
    ans = pick(opts);
  return {
    html: words("Tap the number") + words(`<b style="font-size:1.4em">${numWord(ans)}</b>`),
    say: `Tap the number ${ans}.`,
    ans,
    choices: opts.sort((x, y) => x - y),
    hint: Clue.hear(ans),
  };
}
// AC9M1N01 hundreds chart: 10 more / 10 less
function tenMore() {
  const n = between(10, 110),
    up = n + 10 <= 120 && Math.random() < 0.6,
    ans = up ? n + 10 : n - 10;
  return {
    html: strip(up ? [n, "?"] : ["?", n]) + words(up ? "10 more" : "10 less"),
    say: `What is 10 ${up ? "more" : "less"} than ${n}?`,
    ans,
    choices: nums(ans, [1, 10]),
    hint: Clue.ten(n, up ? 10 : -10),
  };
}
// AC9M1A01: count $2 coins by twos, $5 and $10 notes by fives and tens
function countMoney() {
  const [v, cls] = pick([
      [2, "coin"],
      [5, "note five"],
      [10, "note ten"],
    ]),
    k = between(2, v === 2 ? 10 : v === 5 ? 8 : 6);
  return {
    html: `<div class="row-vis">${`<span class="${cls}">$${v}</span>`.repeat(k)}</div>` + words(`Count by ${v}s`),
    say: `Count by ${v}s. How many dollars altogether?`,
    ans: k * v,
    choices: nums(k * v, [v, 1], 1),
    hint: Clue.count(v, k, "$"),
  };
}
// AC9M1N03: stacks of ten $1 coins plus leftovers
function coinStacks() {
  const g = between(1, 9),
    o = between(0, 9),
    ans = g * 10 + o;
  return {
    html:
      `<div class="base">${tensRun(g, "rod stack")}${o ? `<div class="coins">${'<span class="coin">$1</span>'.repeat(o)}</div>` : ""}</div>` +
      words(`Each stack is 10 coins`),
    say: `Each stack has 10 one-dollar coins. Count the stacks by tens${o ? `, then count on the ${o} loose ${plural(o, "coin", "coins")}` : ""}. How many dollars?`,
    ans,
    choices: nums(ans, [1, 10], 1),
    hint: Clue.tens(g, o),
  };
}
// AC9M1A02: longer repeating units, e.g. SSCSC
function longPattern() {
  const [A, B, C] = shuffle(Object.keys(SHAPES)),
    unit = pick([
      [A, A, B, A, B],
      [A, B, C, C],
      [A, B, B, C],
    ]);
  const len = unit.length + 1 + rand(unit.length),
    seq = Array.from({ length: len }, (_, i) => unit[i % unit.length]),
    ans = unit[len % unit.length];
  const choices = shuffle([...new Set(unit)]);
  if (choices.length < 3) choices.push(Object.keys(SHAPES).find((k) => !choices.includes(k)));
  return {
    html: `<div class="strip">${seq.map((k) => `<b>${shape(k)}</b>`).join("")}<b class="ask">?</b></div>`,
    say: `${seq.map((k) => SHAPES[k]).join(", ")}. What shape comes next?`,
    ans,
    choices,
    label: shape,
    sayAns: (k) => SHAPES[k],
    hint: Clue.unit(unit),
  };
}
// AC9M1N06: "How many wheels are needed for 3 cars?"
function equalGroups() {
  const o = pick([
      { n: "cars", e: 4, w: "wheels" },
      { n: "dinos", e: 4, w: "legs" },
      { n: "birds", e: 2, w: "legs" },
      { n: "hands", e: 5, w: "fingers" },
      { n: "tricycles", e: 3, w: "wheels" },
    ]),
    g = between(2, 5);
  const grp = `<div class="grp" style="grid-template-columns:repeat(${Math.min(o.e, 3)},auto)">${"<i></i>".repeat(o.e)}</div>`;
  return {
    html: `<div class="row-vis">${grp.repeat(g)}</div>` + words(`${g} ${o.n}: how many ${o.w}?`),
    say: `How many ${o.w} on ${g} ${o.n}?`,
    ans: g * o.e,
    choices: nums(g * o.e, [o.e, 1], 1),
    hint: Clue.count(o.e, g),
  };
}
// AC9M1N05: whole-dollar money stories ("I had $14 and was given $15")
function moneyAdd() {
  const a = between(5, 15),
    b = between(5, 15),
    t = `You had ${a} dollars. You got ${b} dollars for your birthday. How many dollars do you have now?`;
  return { html: words(t), say: t, ans: a + b, choices: nums(a + b, [1, 2, 10], 1), hint: Clue.add(a, b) };
}
// AC9M1N05: people getting on and off a bus
function bus() {
  const a = between(4, 12),
    off = between(1, a - 1),
    on = between(1, 8),
    t = `${a} people are on the bus. ${off} get off. Then ${on} get on. How many people are on the bus now?`;
  return {
    html: words(t),
    say: t,
    ans: a - off + on,
    choices: nums(a - off + on, [1, 2]),
    hint: clue(
      `First take away the ${off} who got off. Then add the ${on} who got on.`,
      words(`${a} − ${off} = ?`),
      words(`then ? + ${on}`),
    ),
  };
}
// AC9M1N06: grouping, "How many bags?"
function bags() {
  const k = pick([2, 3, 4, 5]),
    b = between(2, 5),
    n = k * b;
  return {
    html: `${berries(n)}` + words(`${n} berries in bags of ${k}`),
    say: `${n} berries go into bags of ${k}. How many bags do you need?`,
    ans: b,
    choices: nums(b, [1, 2], 1),
    hint: Clue.howMany(k, n),
  };
}
