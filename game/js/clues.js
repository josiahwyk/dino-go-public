/* ---------- Clues (shown after a wrong answer) ---------- */
// Each question carries hint {html,say}: the strategy, never the answer. The step that gives the answer is always a "?" so they still work it out.
const clue = (say, ...parts) => ({ say, html: parts.join("") });
// Hops on an empty number line, the way Year 1-2 classes teach it: 1s for small steps, jump to the next ten when a hop of 7-9 crosses one
// ("make ten"), tens first then ones for big steps.
function jumps(a, d) {
  const s = d < 0 ? -1 : 1,
    pts = [a],
    toTen = (v) => (s > 0 ? (10 - (v % 10)) % 10 : v % 10);
  let v = a,
    n = Math.abs(d);
  if (n < 10) {
    const t = toTen(v);
    if (n > 6 && t > 0 && t < n) {
      pts.push((v += s * t));
      pts.push((v += s * (n - t)));
    } else for (let i = 0; i < n; i++) pts.push((v += s));
    return pts;
  }
  for (let k = Math.floor(n / 10); k > 0; k--) pts.push((v += s * 10));
  let r = n % 10;
  if (!r) return pts;
  const t = toTen(v);
  if (t > 0 && t < r) {
    pts.push((v += s * t));
    r -= t;
  }
  pts.push((v += s * r));
  return pts;
}
// pts must only go up or only go down (a line going down is drawn smallest on the left, hops going left). ask = which point shows "?" (-1 none).
function numLine(pts, ask = pts.length - 1, u = "") {
  const n = pts.length,
    gap = n > 8 ? 52 : 64,
    W = gap * (n - 1) + 64,
    rev = pts[n - 1] < pts[0],
    x = (i) => 32 + (rev ? n - 1 - i : i) * gap;
  let s = `<svg class="nl" viewBox="0 0 ${W} 112" style="max-width:${Math.round(W * 1.15)}px" aria-hidden="true"><line class="nl-base" x1="8" y1="72" x2="${W - 8}" y2="72"/>`;
  for (let i = 1; i < n; i++) {
    const a = x(i - 1),
      b = x(i),
      d = pts[i] - pts[i - 1],
      h = Math.min(44, 14 + Math.abs(b - a) * 0.25),
      dl = (0.3 + i * 0.45).toFixed(2) + "s",
      m = (a + b) / 2;
    s += `<path class="nl-hop" pathLength="1" style="animation-delay:${dl}" d="M${a} 70Q${m} ${70 - 2 * h} ${b} 70"/><text class="nl-by" style="animation-delay:${dl}" x="${m}" y="${64 - h}">${d < 0 ? "−" : "+"}${u}${Math.abs(d)}</text>`;
  }
  pts.forEach((p, i) => {
    s +=
      `<line class="nl-tick" x1="${x(i)}" y1="63" x2="${x(i)}" y2="81"/>` +
      (i === ask
        ? `<rect class="nl-ask" x="${x(i) - 22}" y="85" width="44" height="26" rx="8"/><text class="nl-n ask" x="${x(i)}" y="105">?</text>`
        : `<text class="nl-n" x="${x(i)}" y="105">${u}${p}</text>`);
  });
  return s + "</svg>";
}
const PL = ["hundreds", "tens", "ones"];
const dg = (n, cols) =>
  String(n)
    .padStart(cols, " ")
    .slice(-cols)
    .split("")
    .map((c) => (c === " " ? "" : c));
// Place-value chart: rows of digits, hi = the column to highlight
function pvChart(rows, hi = -1, cols = 3) {
  const hd = ["100s", "10s", "1s"].slice(3 - cols),
    c = (i) => (i === hi ? ' class="hi"' : "");
  return `<table class="pvc"><tr>${hd.map((h, i) => `<th${c(i)}>${h}</th>`).join("")}</tr>${rows.map((r) => `<tr>${r.map((d, i) => `<td${c(i)}>${d}</td>`).join("")}</tr>`).join("")}</table>`;
}
const boxes = (xs) => `<div class="strip">${xs.map((x) => `<b>${x}</b>`).join("")}</div>`;
const Clue = {
  on: (a, d, u = "") =>
    clue(
      d > 0
        ? `Start at ${u ? "$" : ""}${a}. Hop on ${d}. Where do you land?`
        : `Start at ${u ? "$" : ""}${a}. Hop back ${-d}. Where do you land?`,
      numLine(jumps(a, d), undefined, u),
    ),
  add: (a, b, u = "") =>
    a >= b
      ? Clue.on(a, b, u)
      : { ...Clue.on(b, a, u), say: `Start with the bigger number, ${b}. Hop on ${a}. Where do you land?` },
  // missing part, difference, change: hop from a up to b; the answer is how far it hopped
  gap: (a, b, u = "") =>
    clue(`Start at ${a} and hop up to ${b}. How far did you hop altogether?`, numLine(jumps(a, b - a), -1, u)),
  steps: (a, b) => {
    const s = b > a ? 1 : -1;
    return clue(
      `Count the hops from ${a} to ${b}.`,
      numLine(
        Array.from({ length: Math.abs(b - a) + 1 }, (_, i) => a + i * s),
        -1,
      ),
    );
  },
  seq: (seq, hide, step) =>
    clue(`Each hop is ${step}. Count by ${step}s to find the missing number.`, numLine(seq, hide)),
  count: (k, g, u = "") =>
    clue(
      `Count by ${k}s, one number for each group.`,
      boxes(Array.from({ length: g }, (_, i) => (i < g - 1 ? u + k * (i + 1) : "?"))),
    ),
  howMany: (k, n) =>
    clue(
      `Count by ${k}s until you reach ${n}. How many numbers did you say?`,
      boxes(Array.from({ length: n / k }, (_, i) => k * (i + 1))),
    ),
  tens: (t, o) =>
    o
      ? clue(
          `Count the tens: ${Array.from({ length: t }, (_, i) => 10 * (i + 1)).join(", ")}. Then count on ${o} ${plural(o, "one", "ones")}.`,
          boxes(Array.from({ length: t }, (_, i) => 10 * (i + 1))),
          numLine(jumps(t * 10, o)),
        )
      : clue(
          "Count the tens by 10s, one number for each ten.",
          boxes(Array.from({ length: t }, (_, i) => (i < t - 1 ? 10 * (i + 1) : "?"))),
        ),
  pv: (h, t, o) =>
    clue("Put each part in its place: hundreds, tens and ones. An empty place gets a zero.", pvChart([[h, t, o]])),
  cmp: (a, b, big) => {
    const cols = Math.max(String(a).length, String(b).length),
      da = dg(a, cols),
      db = dg(b, cols);
    let i = 0;
    while (i < cols - 1 && da[i] === db[i]) i++;
    const p = PL[3 - cols + i],
      same = i ? `The ${PL[3 - cols + i - 1]} are the same, so look at the ${p}.` : `Look at the ${p} first.`;
    return clue(`${same} Which number has ${big ? "more" : "fewer"} ${p}?`, pvChart([da, db], i, cols));
  },
  ten: (n, d) => {
    const st = Math.abs(d),
      p = st === 10 ? "ten" : "hundred",
      cols = String(n).length;
    return clue(
      `${st} ${d > 0 ? "more" : "less"} means one ${d > 0 ? "more" : "less"} ${p}. Which digit changes?`,
      numLine([n, n + d]),
      pvChart([dg(n, cols)], cols - (st === 10 ? 2 : 3), cols),
    );
  },
  tensIn: (n) => {
    const h = Math.floor(n / 100),
      t = (n / 10) % 10,
      hs = Array.from({ length: h }, (_, i) => 10 * (i + 1));
    return clue(
      `Every hundred is 10 tens. Count by 10s for the hundreds${t ? `, then count on the other ${t} ${plural(t, "ten", "tens")}` : ""}.`,
      t ? boxes(hs) + numLine(jumps(10 * h, t)) : boxes(hs.map((v, i) => (i < h - 1 ? v : "?"))),
      words("tens"),
    );
  },
  hear: (n) => {
    const t = Math.floor(n / 10);
    return clue(
      `Listen: ${numWord(n)}. ${n >= 20 ? `${TENS[t][0].toUpperCase() + TENS[t].slice(1)} means ${t} tens.` : "Teen numbers start with a 1."}`,
      words(numWord(n)),
      pvChart([[t, "?"]], 0, 2),
    );
  },
  unit: (unit) =>
    clue(
      `Find the part that repeats: ${unit.map((k) => SHAPES[k]).join(", ")}. Then say it again and again.`,
      `<div class="strip">${unit.map((k) => `<b>${shape(k)}</b>`).join("")}</div>`,
      words("again and again..."),
    ),
  deal: (n, d) =>
    clue(
      `Give one berry to each dino, again and again, until all ${n} are gone. Then count one dino's berries.`,
      `<div class="deal">${`<div class="row-vis">${'<i class="berry"></i>'.repeat(n / d)}</div>`.repeat(d)}</div>`,
    ),
  frac: () =>
    clue(
      "Count the equal parts. 2 parts make halves, 4 parts make quarters, 8 parts make eighths.",
      `<div class="row-vis fk">${[2, 4, 8].map((p) => `<span>${fracSvg("pie", p, 0)}${p} parts</span>`).join("")}</div>`,
    ),
};
