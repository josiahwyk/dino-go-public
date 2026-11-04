/* ---------- Backgrounds: a new scene drawn in code each visit (no art files, nothing saved) ---------- */
// Colours stay light so the dark text on top stays easy to read. Home picks any scene; a battle picks one that suits the wild dino's type.
const SCENES = {
  jungle: {
    sky: ["#CDEBF5", "#E8F6E4"],
    sun: "#FFF3B0",
    far: "#A9D79A",
    near: "#9ACF86",
    ground: "#CBE8B4",
    props: ["palm", "fern", "fern", "bush", "palm"],
  },
  plains: {
    sky: ["#D6EEFA", "#F3F8E2"],
    sun: "#FFE9A0",
    far: "#C3DE9E",
    near: "#B4D68E",
    ground: "#DDEEBB",
    props: ["tree", "bush", "flower", "flower", "tree"],
  },
  swamp: {
    sky: ["#D3E7E2", "#E9F2E4"],
    sun: "#F6F2D2",
    far: "#A3C9B2",
    near: "#93BFA1",
    ground: "#BFDCC6",
    water: "#A6D2D6",
    props: ["reed", "reed", "log", "fern"],
  },
  beach: {
    sky: ["#C9EBFB", "#EDF9FB"],
    sun: "#FFF0A8",
    far: "#9BD3EE",
    near: "#F1DDA8",
    ground: "#F7E6BC",
    water: "#93D2EF",
    props: ["palm", "shell", "rock", "shell"],
  },
  volcano: {
    sky: ["#FBE1CC", "#FDF2E4"],
    sun: "#FFD9A0",
    far: "#D3B7A8",
    near: "#DCC6B4",
    ground: "#ECDDCB",
    volcano: true,
    props: ["rock", "rock", "fern"],
  },
  canyon: {
    sky: ["#FCE6D2", "#FEF5E8"],
    sun: "#FFE2A6",
    far: "#E8C1A6",
    near: "#EDCDB2",
    ground: "#F4E1C8",
    mesa: true,
    props: ["cactus", "rock", "rock"],
  },
  cliffs: {
    sky: ["#D9E9FB", "#F2F7FD"],
    sun: "#FFF2B8",
    far: "#C2CFDF",
    near: "#C9DABF",
    ground: "#DDEACB",
    props: ["tree", "rock", "bush"],
  },
};
const SCENE_FOR = {
  plant: ["jungle", "plains", "swamp"],
  meat: ["volcano", "canyon", "jungle"],
  sea: ["beach", "swamp"],
  fly: ["cliffs", "beach", "canyon"],
};
// Props stand on (x,y); k is their size unit
const PROPS = {
  palm: (x, y, k) =>
    `<path d="M${x} ${y}q${k * 3} ${-k * 8} ${k} ${-k * 16}" stroke="#B9905F" stroke-width="${k * 1.5}" fill="none" stroke-linecap="round"/>` +
    [-1, -0.45, 0, 0.45, 1]
      .map(
        (a) =>
          `<path d="M${x + k} ${y - k * 16}q${a * k * 5} ${-k * 3} ${a * k * 9} ${k * (2 + Math.abs(a) * 3)}" stroke="#63A85C" stroke-width="${k * 1.8}" fill="none" stroke-linecap="round"/>`,
      )
      .join(""),
  fern: (x, y, k) =>
    [-0.9, -0.45, 0, 0.45, 0.9]
      .map(
        (a) =>
          `<path d="M${x} ${y}q${a * k * 3} ${-k * 4} ${a * k * 6} ${-k * (6 - Math.abs(a) * 2)}" stroke="#6DAF60" stroke-width="${k * 1.3}" fill="none" stroke-linecap="round"/>`,
      )
      .join(""),
  bush: (x, y, k) =>
    `<g fill="#82C26F"><circle cx="${x - k * 2.5}" cy="${y - k * 2}" r="${k * 2.6}"/><circle cx="${x + k * 2.5}" cy="${y - k * 2}" r="${k * 2.6}"/><circle cx="${x}" cy="${y - k * 3.6}" r="${k * 3.2}"/></g>`,
  tree: (x, y, k) =>
    `<rect x="${x - k * 0.8}" y="${y - k * 8}" width="${k * 1.6}" height="${k * 8}" rx="${k * 0.6}" fill="#B9905F"/><g fill="#78B968"><circle cx="${x}" cy="${y - k * 11}" r="${k * 4.6}"/><circle cx="${x - k * 3.4}" cy="${y - k * 8.6}" r="${k * 3.2}"/><circle cx="${x + k * 3.4}" cy="${y - k * 8.6}" r="${k * 3.2}"/></g>`,
  flower: (x, y, k, R) =>
    `<path d="M${x} ${y}v${-k * 3.5}" stroke="#6DAF60" stroke-width="${k * 0.6}"/><circle cx="${x}" cy="${y - k * 3.8}" r="${k * 1.1}" fill="${["#F49AC1", "#FFD23F", "#F2762E", "#B39DF0"][Math.floor(R() * 4)]}"/>`,
  reed: (x, y, k) =>
    [-1.2, 0, 1.2]
      .map(
        (d) =>
          `<path d="M${x + d * k} ${y}l${d * k * 0.6} ${-k * 9}" stroke="#7FA86E" stroke-width="${k * 0.6}"/><ellipse cx="${x + d * k * 1.6}" cy="${y - k * 8.6}" rx="${k * 0.6}" ry="${k * 1.6}" fill="#A0785A"/>`,
      )
      .join(""),
  log: (x, y, k) =>
    `<rect x="${x - k * 5}" y="${y - k * 2.2}" width="${k * 10}" height="${k * 2.4}" rx="${k * 1.2}" fill="#B08A66"/><circle cx="${x + k * 4}" cy="${y - k}" r="${k}" fill="#D7B48E"/>`,
  shell: (x, y, k) => `<path d="M${x - k * 1.8} ${y}a${k * 1.8} ${k * 1.8} 0 0 1 ${k * 3.6} 0z" fill="#F4B9A6"/>`,
  rock: (x, y, k) =>
    `<ellipse cx="${x}" cy="${y - k * 1.4}" rx="${k * 3.4}" ry="${k * 2}" fill="#BDB3A8"/><ellipse cx="${x - k}" cy="${y - k * 2}" rx="${k * 1.2}" ry="${k * 0.6}" fill="#D6CEC4"/>`,
  cactus: (x, y, k) =>
    `<g fill="#7DB56C"><rect x="${x - k}" y="${y - k * 9}" width="${k * 2}" height="${k * 9}" rx="${k}"/><rect x="${x - k * 3.4}" y="${y - k * 6}" width="${k * 1.6}" height="${k * 3.6}" rx="${k * 0.8}"/><rect x="${x + k * 1.8}" y="${y - k * 7}" width="${k * 1.6}" height="${k * 3.2}" rx="${k * 0.8}"/><rect x="${x - k * 3.4}" y="${y - k * 3.2}" width="${k * 3}" height="${k * 1.4}" rx="${k * 0.7}"/><rect x="${x + k * 0.4}" y="${y - k * 4.6}" width="${k * 3}" height="${k * 1.4}" rx="${k * 0.7}"/></g>`,
};
let SC = null; // the current scene {k, seed}: the seed keeps the same picture when the screen is resized or turned
function setScene(list) {
  const ks = list.filter((k) => !SC || k !== SC.k);
  SC = { k: pick(ks.length ? ks : list), seed: rand(1e9) };
} // drawn by the next show(); never the same scene twice in a row
function seeded(s) {
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Where the ground starts: just above his dino's feet in a battle, under the egg and wild dino when catching, a bit below the middle at home.
function horizon(H, u) {
  const feet = (sel) => {
    const e = document.querySelector(sel);
    return e ? e.getBoundingClientRect().bottom : 0;
  };
  const y = !$("s-battle").hidden
    ? feet("#s-battle .spot") - u * 9
    : !$("s-catch").hidden
      ? feet("#c-stage") - u * 9
      : H * 0.6;
  return Math.min(H * 0.8, Math.max(H * 0.3, y || H * 0.6));
}
function drawScene() {
  const el = $("scene"),
    plain = !$("s-book").hidden || !$("s-parent").hidden;
  if (!SC || plain) {
    el.hidden = true;
    return;
  }
  const s = SCENES[SC.k],
    R = seeded(SC.seed),
    W = innerWidth,
    H = innerHeight,
    u = Math.min(W, H) / 100,
    hy = horizon(H, u),
    r = (a, b) => a + R() * (b - a);
  const hills = (y, amp, col, n) => {
    const p = Array.from({ length: n + 1 }, (_, i) => [(W * i) / n, y - r(0, amp)]),
      w = W / n / 2;
    return `<path d="M0 ${H}L${p[0].join(" ")}${p
      .slice(1)
      .map((q, i) => `C${p[i][0] + w} ${p[i][1]} ${q[0] - w} ${q[1]} ${q.join(" ")}`)
      .join("")}L${W} ${H}Z" fill="${col}"/>`;
  };
  let g = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.sky[0]}"/><stop offset="1" stop-color="${s.sky[1]}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  const sx = r(0.1, 0.9) * W,
    sy = hy * r(0.2, 0.45),
    sr = u * r(6, 9);
  g += `<circle cx="${sx}" cy="${sy}" r="${sr * 1.8}" fill="${s.sun}" opacity=".35"/><circle cx="${sx}" cy="${sy}" r="${sr}" fill="${s.sun}"/>`;
  for (let i = 0, n = 2 + Math.floor(r(0, 3)); i < n; i++) {
    const cx = r(0, W),
      cy = hy * r(0.1, 0.65),
      k = u * r(3, 5.5);
    g += `<g fill="#fff" opacity=".85"><ellipse cx="${cx}" cy="${cy}" rx="${k * 2.6}" ry="${k}"/><ellipse cx="${cx - k * 1.2}" cy="${cy + k * 0.2}" rx="${k * 1.6}" ry="${k * 0.8}"/><ellipse cx="${cx + k * 0.6}" cy="${cy - k * 0.5}" rx="${k * 1.5}" ry="${k * 1.1}"/></g>`;
  }
  if (s.volcano) {
    const vx = r(0.2, 0.8) * W,
      bw = u * r(32, 42),
      tw = u * 6,
      vh = u * r(30, 40);
    g +=
      `<g opacity=".7"><circle cx="${vx - u * 2}" cy="${hy - vh - u * 8}" r="${u * 5}" fill="#E9E2DC"/><circle cx="${vx + u * 4}" cy="${hy - vh - u * 15}" r="${u * 6.5}" fill="#EFEAE5"/></g>` +
      `<polygon points="${vx - bw},${hy + u * 4} ${vx - tw},${hy - vh} ${vx + tw},${hy - vh} ${vx + bw},${hy + u * 4}" fill="#C9A493"/>` +
      `<path d="M${vx - tw} ${hy - vh}h${tw * 2}l${-u * 2} ${u * 5}l${-u * 1.5} ${u * 9}l${-u} ${-u * 7}l${-u * 1.5} ${u * 4}z" fill="#F2A060"/>`;
  }
  if (s.mesa)
    for (let i = 0, n = 2 + Math.floor(r(0, 2)); i < n; i++) {
      const mx = r(0, W),
        mw = u * r(14, 26),
        mh = u * r(12, 22);
      g += `<polygon points="${mx - mw},${hy + u * 4} ${mx - mw * 0.8},${hy - mh} ${mx + mw * 0.8},${hy - mh} ${mx + mw},${hy + u * 4}" fill="#E2AE90"/>`;
    }
  g += hills(hy - u * 2, u * 12, s.far, 6);
  if (s.water) g += `<rect x="0" y="${hy - u * 2}" width="${W}" height="${H}" fill="${s.water}"/>`;
  g += hills(hy + u * (s.water ? 5 : 3), u * 4, s.near, 4) + hills(hy + u * (s.water ? 9 : 7), u * 2.5, s.ground, 3);
  const ps = Array.from({ length: 4 + Math.floor(r(0, 4)) }, () => ({
    x: r(0, W),
    y: hy + u * r(8, 34),
    t: s.props[Math.floor(R() * s.props.length)],
  }))
    .filter((p) => p.y < H)
    .sort((a, b) => a.y - b.y);
  for (const p of ps) g += PROPS[p.t](p.x, p.y, u * r(0.9, 1.3) * (0.8 + (0.6 * (p.y - hy)) / (H - hy + 1)), R);
  el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${g}</svg>`;
  el.hidden = false;
}
addEventListener("resize", () => {
  clearTimeout(drawScene.t);
  drawScene.t = setTimeout(drawScene, 150);
});
