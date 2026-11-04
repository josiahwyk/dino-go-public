/* ---------- Maths questions: Australian Curriculum v9, Year 2 (levels 7-12) ---------- */
// mix() builds the tap choices: the answer, the slip a child is most likely to make (extras[0], always used if valid),
// other likely slips (random), then near numbers. Always up to 4 choices, sorted.
function mix(ans, extras = [], spread = [1, 2], min = 0, max = Infinity) {
  const ok = (v) => Number.isInteger(v) && v >= min && v <= max && v !== ans,
    s = new Set([ans]),
    ex = extras.filter(ok);
  if (ex.length) s.add(ex[0]);
  shuffle(ex.slice(1)).forEach((v) => {
    if (s.size < 4) s.add(v);
  });
  for (let g = 0; s.size < 4 && g < 200; g++) {
    const v = ans + pick(spread) * (Math.random() < 0.5 ? -1 : 1);
    if (v >= min && v <= max) s.add(v);
  }
  topUp(s, ans, Math.min(...spread), min, max);
  return [...s].sort((a, b) => a - b);
}
// Base-ten pictures: rods = tens (green), cubes = ones (orange); alt = the second number in yellow; gt/gu fade the tens/ones being taken away
const bt = (n, o = {}) => {
  const t = Math.floor(n / 10),
    u = n % 10,
    r = o.alt ? "rod stack" : "rod",
    c = o.alt ? "cube gold" : "cube",
    gt = o.gt || 0,
    gu = o.gu || 0;
  return `<div class="base">${Array.from({ length: t }, (_, i) => `<span class="rl"><i class="${r}${i >= t - gt ? " ghost" : ""}"></i><b>${10 * (i + 1)}</b></span>`).join("")}${u ? `<div class="cubes lg">${Array.from({ length: u }, (_, i) => `<i class="${c}${i >= u - gu ? " ghost" : ""}"></i>`).join("")}</div>` : ""}</div>`;
};
// Hundreds counted by 100s on the top row, then the tens carry on from there on the row below (100, 200, 210, 220...), like tensRun for Year 1
const pv = (h, t, o) =>
  `<div class="pvs"><div class="base">${Array.from({ length: h }, (_, i) => `<span class="rl"><i class="flat"></i><b>${100 * (i + 1)}</b></span>`).join("")}</div>${t || o ? `<div class="base">${Array.from({ length: t }, (_, i) => `<span class="rl"><i class="rod"></i><b>${h * 100 + 10 * (i + 1)}</b></span>`).join("")}${o ? `<div class="cubes lg">${'<i class="cube"></i>'.repeat(o)}</div>` : ""}</div>` : ""}</div>`;
const pair = (a, b) => `<div class="row-vis pair">${bt(a)}<b class="plus">+</b>${bt(b, { alt: true })}</div>`;
const $L = { label: (v) => "$" + v, sayAns: (v) => `${v} ${plural(v, "dollar", "dollars")}` },
  cL = { label: (v) => v + "c", sayAns: (v) => `${v} cents` };

// Level 7: place value to 1000 (AC9M2N01, AC9M2N02)
// Likely slips when writing a 3-digit number: digits swapped, a zero dropped, a ten out.
const numChoices = (h, t, o) => {
  const n = h * 100 + t * 10 + o;
  return mix(n, [h * 100 + o * 10 + t, +`${h}${t || ""}${o || ""}`, n + 10, n - 10, n + 100], [1, 10], 1, 999);
};
function pvBlocks() {
  const h = between(1, 5),
    t = between(0, 9),
    o = between(0, 9),
    w = `${h} ${plural(h, "hundred", "hundreds")}, ${t} ${plural(t, "ten", "tens")} and ${o} ${plural(o, "one", "ones")}`;
  return {
    html: pv(h, t, o) + words(w),
    say: `${w}. What number is that?`,
    ans: h * 100 + t * 10 + o,
    choices: numChoices(h, t, o),
    hint: Clue.pv(h, t, o),
  };
}
function digitValue() {
  let ds;
  do {
    ds = [between(1, 9), between(1, 9), between(1, 9)];
  } while (new Set(ds).size < 3); // distinct digits so "the 5" is clear
  const p = rand(3),
    d = ds[p],
    n = ds[0] * 100 + ds[1] * 10 + ds[2],
    hi = (x) => `<span style="color:var(--lava)">${x}</span>`;
  return {
    html: eq(ds.map((x, i) => (i === p ? hi(x) : x)).join("")) + words(`What is the ${hi(d)} worth?`),
    say: `In ${n}, what is the ${d} worth?`,
    ans: d * 10 ** (2 - p),
    choices: [d, d * 10, d * 100],
    hint: clue(`The ${d} is in the ${PL[p]} place. What are ${d} ${PL[p]} worth?`, pvChart([ds], p)),
  };
}
function partition() {
  const h = between(1, 9),
    t = between(0, 9);
  let o = between(0, 9);
  if (!t && !o) o = between(1, 9);
  const parts = [h * 100, t * 10, o].filter((x) => x);
  return {
    html: eq(parts.join(" + ") + " = ?"),
    say: `${parts.join(" plus ")}. What number is that?`,
    ans: h * 100 + t * 10 + o,
    choices: numChoices(h, t, o),
    hint: Clue.pv(h, t, o),
  };
}
function partMissing() {
  const h = between(1, 9),
    t = between(1, 9),
    o = between(1, 9),
    n = h * 100 + t * 10 + o,
    k = rand(3),
    parts = [h * 100, t * 10, o],
    ans = parts[k];
  const extras = [
    [h, h * 10, ans + 100],
    [t, t * 100, ans + 10],
    [o * 10, o + 1, o - 1],
  ][k];
  return {
    html: eq(`${n} = ${parts.map((p, i) => (i === k ? "?" : p)).join(" + ")}`),
    say: `${n} equals ${parts.map((p, i) => (i === k ? "what" : p)).join(" plus ")}. What is the missing part?`,
    ans,
    choices: mix(ans, extras, [1, 10], 1, 999),
    hint: clue(`Look at the ${PL[k]} digit in ${n}. What is it worth?`, pvChart([[h, t, o]], k)),
  };
}
function moreLess() {
  const step = Math.random() < 0.6 ? 10 : 100,
    up = Math.random() < 0.5,
    s = up ? 1 : -1,
    n = up ? between(100, 1000 - step) : between(100 + step, 999),
    ans = n + s * step;
  const extras = step === 10 ? [n + 100 * s, n + s, n - 10 * s] : [n + 10 * s, n + s, n - 100 * s];
  return {
    html: strip(up ? [n, "?"] : ["?", n]) + words(`${step} ${up ? "more" : "less"}`),
    say: `What is ${step} ${up ? "more" : "less"} than ${n}?`,
    ans,
    choices: mix(ans, extras, [1, 10, 100], 0, 1000),
    hint: Clue.ten(n, s * step),
  };
}
function biggerSmaller() {
  const big = Math.random() < 0.5,
    a = between(100, 999);
  let b;
  do {
    b = Math.random() < 0.7 ? Math.floor(a / 100) * 100 + rand(100) : between(100, 999);
  } while (b === a);
  return {
    html: words(`Which number is ${big ? "bigger" : "smaller"}?`),
    say: `Which number is ${big ? "bigger" : "smaller"}, ${a} or ${b}?`,
    ans: big ? Math.max(a, b) : Math.min(a, b),
    choices: [a, b],
    hint: Clue.cmp(a, b, big),
  };
}
function howManyTens() {
  const n = between(10, 99) * 10;
  return {
    html: eq(String(n)) + words("How many tens?"),
    say: `How many tens are in ${n}?`,
    ans: n / 10,
    choices: mix(n / 10, [Math.floor(n / 100), (n / 10) % 10, n / 10 + 10], [1, 2], 1),
    hint: Clue.tensIn(n),
  };
}

// Level 8: add and take away within 100, no trading (AC9M2N04)
function addPlain() {
  const k = pick(["tens", "ones", "both"]);
  let t1, o1, t2, o2;
  if (k === "tens") {
    t1 = between(1, 8);
    o1 = rand(10);
    t2 = between(1, 9 - t1);
    o2 = 0;
  } else if (k === "ones") {
    t1 = between(1, 9);
    o1 = between(0, 8);
    t2 = 0;
    o2 = between(1, 9 - o1);
  } else {
    t1 = between(1, 8);
    o1 = between(0, 8);
    t2 = between(1, 9 - t1);
    o2 = between(1, 9 - o1);
  }
  const a = t1 * 10 + o1,
    b = t2 * 10 + o2,
    ans = a + b;
  return {
    html: eq(`${a} + ${b} = ?`) + pair(a, b),
    say: `${a} plus ${b}?`,
    ans,
    choices: mix(ans, [ans + 10, ans - 10, ans + 1, ans - 1], [1, 2, 10], 1, 99),
    hint: Clue.add(a, b),
  };
}
function subPlain() {
  const k = pick(["tens", "ones", "both"]);
  let t1, o1, t2, o2;
  if (k === "tens") {
    t1 = between(2, 9);
    o1 = rand(10);
    t2 = between(1, t1 - 1);
    o2 = 0;
  } else if (k === "ones") {
    t1 = between(1, 9);
    o1 = between(1, 9);
    t2 = 0;
    o2 = between(1, o1);
  } else {
    t1 = between(2, 9);
    o1 = between(1, 9);
    t2 = between(1, t1 - 1);
    o2 = between(1, o1);
  }
  const a = t1 * 10 + o1,
    b = t2 * 10 + o2,
    ans = a - b;
  return {
    html: eq(`${a} − ${b} = ?`) + `<div class="row-vis">${bt(a, { gt: t2, gu: o2 })}</div>`,
    say: `${a} take away ${b}?`,
    ans,
    choices: mix(ans, [ans + 10, ans - 10, ans + 1, ans - 1], [1, 2, 10], 1, 99),
    hint: Clue.on(a, -b),
  };
}
function tensTo100() {
  const k = between(1, 9),
    a = k * 10,
    ans = 100 - a,
    take = Math.random() < 0.4,
    rods = `<div class="base">${Array.from({ length: 10 }, (_, i) => `<span class="rl"><i class="rod${i >= k ? " ghost" : ""}"></i><b>${10 * (i + 1)}</b></span>`).join("")}</div>`;
  return take
    ? {
        html: eq(`100 − ${a} = ?`) + rods,
        say: `100 take away ${a}?`,
        ans,
        choices: mix(ans, [ans + 10, ans - 10, ans + 20, ans - 20], [10], 10, 90),
        hint: Clue.on(100, -a),
      }
    : {
        html: eq(`${a} + ? = 100`) + rods,
        say: `${a} and how many more make 100?`,
        ans,
        choices: mix(ans, [ans + 10, ans - 10, ans + 20, ans - 20], [10], 10, 90),
        hint: Clue.gap(a, 100),
      };
}

// Level 9: trading / regrouping within 100 (AC9M2N04)
function addTrade() {
  const o1 = between(2, 9),
    o2 = between(10 - o1, 9),
    t2 = between(0, 6),
    t1 = between(1, 8 - t2),
    a = t1 * 10 + o1,
    b = t2 * 10 + o2,
    ans = a + b; // ones make 10 or more, total stays under 100
  return {
    html: eq(`${a} + ${b} = ?`) + pair(a, b),
    say: `${a} plus ${b}?`,
    ans,
    choices: mix(ans, [ans - 10, ans + 10, ans + 1, ans - 1], [1, 2], 1, 99),
    hint: Clue.add(a, b),
  }; // ans-10 = forgot to trade
}
function subTrade() {
  const t1 = between(2, 9),
    o1 = between(0, 7),
    t2 = between(0, t1 - 1),
    o2 = between(o1 + 1, 9),
    a = t1 * 10 + o1,
    b = t2 * 10 + o2,
    ans = a - b;
  const slip = (t1 - t2) * 10 + (o2 - o1); // took the smaller ones from the larger
  return {
    html: eq(`${a} − ${b} = ?`) + `<div class="row-vis">${bt(a)}</div>`,
    say: `${a} take away ${b}?`,
    ans,
    choices: mix(ans, [slip, ans + 10, ans + 1, ans - 1], [1, 2], 1, 99),
    hint: Clue.on(a, -b),
  };
}
function bridgeTen() {
  const extra = Math.random() < 0.5 ? 0 : between(1, 2),
    t = between(1, extra ? 7 : 8),
    o = between(1, 9),
    a = t * 10 + o,
    target = (t + 1 + extra) * 10,
    ans = target - a;
  return {
    html: eq(`${a} + ? = ${target}`) + bt(a),
    say: `${a} and how many more make ${target}?`,
    ans,
    choices: mix(ans, [ans + 10, ans - 10, ans + 1, ans - 1], [1, 2], 1),
    hint: Clue.gap(a, target),
  };
}

// Level 10: skip counting by 2s, 3s, 5s, 10s and additive patterns (AC9M2A01, AC9M2N05)
function skipY2() {
  const step = pick([2, 3, 5, 10]),
    down = Math.random() < 0.3,
    off = Math.random() < 0.25 ? between(1, step - 1) : 0;
  const start = down ? step * between(5, 10) + off : step * rand(8) + off,
    seq = [0, 1, 2, 3, 4].map((i) => start + (down ? -i : i) * step);
  const hide = Math.random() < 0.6 ? 4 : between(1, 3),
    ans = seq[hide],
    dir = down ? "back" : "on";
  return {
    html: strip(seq.map((v, i) => (i === hide ? "?" : v))) + words(`Count ${dir} by ${step}s`),
    say: `Count ${dir} by ${step}s. ${seq.map((v, i) => (i === hide ? "what" : v)).join(", ")}?`,
    ans,
    choices: mix(ans, [ans + step, ans - step, ans + 1, ans - 1], [1, 2]),
    hint: Clue.seq(seq, hide, step),
  };
}
function stepGuess() {
  const step = pick([2, 3, 5, 10]),
    down = Math.random() < 0.25,
    off = Math.random() < 0.2 ? between(1, step - 1) : 0;
  const start = down ? step * between(5, 9) + off : step * rand(6) + off,
    seq = [0, 1, 2, 3].map((i) => start + (down ? -i : i) * step),
    w = down ? "down" : "up";
  return {
    html: strip(seq) + words(`How much does it go ${w} each time?`),
    say: `The numbers go ${seq.join(", ")}. How much does it go ${w} each time?`,
    ans: step,
    choices: [2, 3, 5, 10],
    hint: Clue.steps(seq[0], seq[1]),
  };
}
function growing() {
  const step = between(1, 3),
    a = between(1, 5),
    seq = [a, a + step, a + 2 * step],
    ans = a + 3 * step;
  const tile = (n) =>
    `<div class="grp" style="grid-template-columns:repeat(${Math.min(n, 4)},auto)">${"<i></i>".repeat(n)}</div>`;
  return {
    html:
      `<div class="row-vis">${seq.map(tile).join("")}<div class="strip"><b class="ask">?</b></div></div>` +
      words("How many dots come next?"),
    say: `The groups have ${seq.join(", ")} dots. How many dots come next?`,
    ans,
    choices: mix(ans, [ans + 1, ans - 1, ans + step, ans - step], [1, 2], 1),
    hint: clue("How many more dots each time? Add that many again.", numLine([...seq, ans])),
  };
}

// Level 11: equal groups, arrays, sharing, halves, quarters and eighths (AC9M2N05, AC9M2N03, AC9M2M02)
function groupsY2() {
  const k = pick([2, 3, 4, 5, 10]),
    g = between(2, k === 10 ? 4 : 6),
    grp = `<div class="grp" style="grid-template-columns:repeat(${Math.min(k, 5)},auto)">${"<i></i>".repeat(k)}</div>`;
  return {
    html: `<div class="row-vis">${grp.repeat(g)}</div>` + words(`${g} groups of ${k}`),
    say: `${g} groups of ${k}. How many altogether?`,
    ans: g * k,
    choices: mix(g * k, [g * k + k, g * k - k, g + k], [1, 2], 1),
    hint: Clue.count(k, g),
  };
}
function arrayQ() {
  const r = between(2, 5),
    c = between(2, 5);
  return {
    html:
      `<div class="arr" style="grid-template-columns:repeat(${c},20px)">${"<i></i>".repeat(r * c)}</div>` +
      words(`${r} rows of ${c}`),
    say: `${r} rows of ${c}. How many dots altogether?`,
    ans: r * c,
    choices: mix(r * c, [r + c, r * c + c, r * c - c], [1, 2], 1),
    hint: Clue.count(c, r),
  };
}
function repAdd() {
  const k = pick([2, 3, 4, 5]),
    g = between(3, 5),
    grp = `<div class="grp" style="grid-template-columns:repeat(${Math.min(k, 5)},auto)">${"<i></i>".repeat(k)}</div>`;
  return {
    html: eq(Array(g).fill(k).join(" + ") + " = ?") + `<div class="row-vis">${grp.repeat(g)}</div>`,
    say: `${Array(g).fill(k).join(" plus ")}. How many altogether?`,
    ans: g * k,
    choices: mix(g * k, [g * k + k, g * k - k, g + k], [1, 2], 1),
    hint: Clue.count(k, g),
  };
}
function shareY2() {
  const d = between(2, 5),
    each = between(2, 6),
    n = d * each,
    s = src(E.me);
  const dino = s ? `<img class="mini" src="${s}" alt="">` : '<span style="font-size:2.4rem">🦕</span>';
  return {
    html: `${berries(n)}<div class="row-vis">${dino.repeat(d)}</div>` + words(`${n} berries shared by ${d} dinos`),
    say: `${n} berries, shared equally between ${d} dinos. How many berries does each dino get?`,
    ans: each,
    choices: mix(each, [each + 1, each - 1, d, n - d], [1, 2], 1),
    hint: Clue.deal(n, d),
  };
}
function bagsY2() {
  const k = pick([2, 3, 4, 5, 10]),
    b = between(2, k === 10 ? 4 : 6),
    n = k * b;
  return {
    html: `${berries(n)}` + words(`${n} berries in bags of ${k}`),
    say: `${n} berries go into bags of ${k}. How many bags do you need?`,
    ans: b,
    choices: mix(b, [k, b + 1, b - 1], [1, 2], 1),
    hint: Clue.howMany(k, n),
  };
}
const FRN = { 2: "half", 4: "quarter", 8: "eighth" },
  FRS = { "1/2": "one half", "1/4": "one quarter", "1/8": "one eighth" };
const fracLabel = (k) => `<span class="fr"><i>1</i><i>${k.slice(2)}</i></span>`;
// A shape split into equal parts with part number `on` shaded
function fracSvg(kind, parts, on = 0) {
  const st = 'stroke="#1E2B1F" stroke-width="3" stroke-linejoin="round"',
    fill = (i) => (i === on ? "#F2762E" : "#fff");
  if (kind === "rect") {
    const w = 160 / parts;
    return `<svg class="pie rect" viewBox="-3 -3 166 76" aria-hidden="true">${Array.from({ length: parts }, (_, i) => `<rect x="${i * w}" y="0" width="${w}" height="70" fill="${fill(i)}" ${st}/>`).join("")}</svg>`;
  }
  const c = 60,
    r = 56,
    pt = (a) => `${(c + r * Math.cos(a)).toFixed(2)} ${(c + r * Math.sin(a)).toFixed(2)}`;
  return `<svg class="pie" viewBox="0 0 120 120" aria-hidden="true">${Array.from({ length: parts }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / parts,
      b = a + (2 * Math.PI) / parts;
    return `<path d="M${c} ${c}L${pt(a)}A${r} ${r} 0 0 1 ${pt(b)}Z" fill="${fill(i)}" ${st}/>`;
  }).join("")}</svg>`;
}
function fracShaded() {
  const parts = pick([2, 4, 8]),
    kind = pick(["pie", "rect"]);
  return {
    html: `<div class="row-vis">${fracSvg(kind, parts, rand(parts))}</div>` + words("What fraction is shaded?"),
    say: "What fraction of the shape is shaded?",
    ans: "1/" + parts,
    choices: shuffle(["1/2", "1/4", "1/8"]),
    label: fracLabel,
    sayAns: (k) => FRS[k],
    hint: Clue.frac(),
  };
}
function fracPick() {
  const parts = pick([2, 4, 8]),
    kind = pick(["pie", "rect"]);
  return {
    html: words(`Tap the shape with <b>one ${FRN[parts]}</b> shaded`),
    say: `Tap the shape with one ${FRN[parts]} shaded.`,
    ans: "1/" + parts,
    choices: shuffle(["1/2", "1/4", "1/8"]),
    label: (k) => fracSvg(kind, +k.slice(2), 0),
    sayAns: (k) => FRS[k],
    hint: clue(
      `One ${FRN[parts]} means ${parts} equal parts, with one part shaded. Count the parts in each shape.`,
      words(`one ${FRN[parts]} = ${parts} equal parts`),
    ),
  };
}
function fracOf() {
  const parts = pick([2, 2, 4, 8]),
    each = parts === 8 ? between(1, 3) : parts === 4 ? between(2, 5) : between(2, 8),
    n = parts * each,
    w = parts === 2 ? "half" : parts === 4 ? "a quarter" : "an eighth";
  const grp = `<div class="grp" style="grid-template-columns:repeat(${Math.min(each, 4)},auto)">${"<i></i>".repeat(each)}</div>`;
  return {
    html: `<div class="row-vis">${grp.repeat(parts)}</div>` + words(`${w[0].toUpperCase() + w.slice(1)} of ${n} = ?`),
    say: `${n} berries in ${parts} equal groups. What is ${w} of ${n}?`,
    ans: each,
    choices: mix(each, [each + 1, each - 1, parts, n - each], [1, 2], 1),
    hint: clue(
      `${w[0].toUpperCase() + w.slice(1)} of ${n} means ${parts} equal groups. Count the berries in one group.`,
      words(`${n} berries, ${parts} equal groups`),
    ),
  };
}

// Level 12: money, change and story problems (AC9M2N06, AC9M2N04)
function coinsTotal() {
  let cs;
  do {
    cs = [];
    let t = 0;
    for (let i = between(3, 5); i > 0; i--) {
      const v = pick([50, 20, 10, 5]);
      if (t + v < 100) {
        cs.push(v);
        t += v;
      }
    }
  } while (cs.length < 3);
  cs.sort((a, b) => b - a);
  const ans = cs.reduce((a, b) => a + b, 0);
  return {
    html:
      `<div class="row-vis">${cs.map((v) => `<span class="coin silver">${v}c</span>`).join("")}</div>` +
      words("How many cents?"),
    say: "Count the coins. How many cents altogether?",
    ans,
    choices: mix(ans, [ans + 5, ans - 5, ans + 10, ans - 10], [5, 10], 5, 95),
    ...cL,
    hint: clue(
      `Start with the biggest coin, ${cs[0]} cents. Count on each coin.`,
      numLine(cs.map((_, i) => cs.slice(0, i + 1).reduce((a, b) => a + b, 0))),
    ),
  };
}
function changeNote() {
  const a = pick([5, 10, 20]),
    b = a === 5 ? between(1, 4) : a === 10 ? between(1, 9) : between(2, 19),
    ans = a - b,
    t = `You pay with a $${a} note. A toy costs $${b}. How much change do you get?`;
  return {
    html:
      words(t) +
      `<div class="row-vis"><span class="note ${{ 5: "five", 10: "ten", 20: "twenty" }[a]}">$${a}</span></div>`,
    say: t,
    ans,
    choices: mix(ans, [b, ans + 1, ans - 1], [1, 2], 1, a),
    ...$L,
    hint: {
      ...Clue.gap(b, a, "$"),
      say: `Count up from the price, ${b} dollars, to ${a} dollars. How far did you hop?`,
    },
  };
}
function changeCents() {
  const pay = pick([50, 100]),
    p = 5 * between(1, pay === 50 ? 9 : 19),
    ans = pay - p,
    t = `You pay with ${pay === 50 ? "a 50 cent coin" : "a $1 coin"}. A sticker costs ${p} cents. How much change do you get?`;
  return {
    html:
      words(t) +
      `<div class="row-vis"><span class="coin${pay === 50 ? " silver" : ""}">${pay === 50 ? "50c" : "$1"}</span></div>`,
    say: t,
    ans,
    choices: mix(ans, [ans + 5, ans - 5, ans + 10, ans - 10], [5, 10], 5, pay - 5),
    ...cL,
    hint: { ...Clue.gap(p, pay), say: `Count up from ${p} cents to ${pay} cents. How far did you hop?` },
  };
}
function twoItems() {
  const big = Math.random() < 0.5,
    a = big ? between(11, 45) : between(2, 9),
    b = big ? between(11, 45) : between(2, 9),
    ans = a + b,
    t = `A toy costs $${a} and a book costs $${b}. How much altogether?`;
  return {
    html: words(t),
    say: t,
    ans,
    choices: mix(ans, big ? [ans - 10, ans + 10, ans + 1, ans - 1] : [ans + 1, ans - 1, a, b], [1, 2], 1),
    ...$L,
    hint: Clue.add(a, b, "$"),
  };
}
function spendLeft() {
  const h = pick([20, 30, 50, 100]),
    s = between(6, h - 3),
    ans = h - s,
    t = `You have $${h}. You spend $${s}. How much money is left?`;
  return {
    html: words(t),
    say: t,
    ans,
    choices: mix(ans, [ans + 10, ans - 10, ans + 1, ans - 1], [1, 2], 1),
    ...$L,
    hint: Clue.on(h, -s, "$"),
  };
}
function eachCost() {
  const g = between(2, 5),
    p = pick([2, 5, 10]),
    thing = pick(["eggs", "stickers", "toys", "cards"]),
    t = `${g} ${thing} cost $${p} each. How much for all ${g}?`;
  const one = p === 2 ? '<span class="coin">$2</span>' : `<span class="note ${p === 5 ? "five" : "ten"}">$${p}</span>`;
  return {
    html: words(t) + `<div class="row-vis">${one.repeat(g)}</div>`,
    say: t,
    ans: g * p,
    choices: mix(g * p, [g + p, g * p + p, g * p - p], [1, 2], 1),
    ...$L,
    hint: Clue.count(p, g, "$"),
  };
}
function storyY2() {
  const me = E.me ? BY[E.me].name : "dino",
    wild = E.wild ? E.wild.name : "dino";
  const take = (t) => ({ html: words(t), say: t });
  return pick([
    () => {
      const o1 = between(2, 9),
        o2 = between(10 - o1, 9),
        a = between(2, 5) * 10 + o1,
        b = between(1, 3) * 10 + o2,
        ans = a + b,
        t = `There are ${a} eggs in the nest. Then ${b} more eggs are laid. How many eggs are there now?`;
      return {
        ...take(t),
        ans,
        choices: mix(ans, [ans - 10, ans + 10, ans + 1, ans - 1], [1, 2], 1, 99),
        hint: Clue.add(a, b),
      };
    },
    () => {
      const t1 = between(4, 9),
        o1 = between(0, 6),
        t2 = between(1, t1 - 2),
        o2 = between(o1 + 1, 9),
        a = t1 * 10 + o1,
        b = t2 * 10 + o2,
        ans = a - b,
        t = `Your ${me} collected ${a} leaves. It gave ${b} leaves to the wild ${wild}. How many leaves does your ${me} have left?`;
      return {
        ...take(t),
        ans,
        choices: mix(ans, [ans + 10, ans - 10, ans + 1, ans - 1], [1, 2], 1, 99),
        hint: Clue.on(a, -b),
      };
    },
    () => {
      const t1 = between(4, 9),
        o1 = between(0, 6),
        t2 = between(1, t1 - 2),
        o2 = between(o1 + 1, 9),
        a = t1 * 10 + o1,
        b = t2 * 10 + o2,
        ans = a - b,
        t = `Your ${me} has ${a} points. The wild ${wild} has ${b} points. How many more points does your ${me} have?`;
      return {
        ...take(t),
        ans,
        choices: mix(ans, [ans + 10, ans - 10, ans + 1, ans - 1], [1, 2], 1, 99),
        hint: Clue.gap(b, a),
      };
    },
  ])();
}
