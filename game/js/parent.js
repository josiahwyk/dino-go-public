/* ---------- Grown-up settings ---------- */
let holdT = null;
const gear = $("gear");
gear.addEventListener("pointerdown", () => {
  holdT = setTimeout(openParent, 1200);
});
["pointerup", "pointerleave", "pointercancel"].forEach((ev) => gear.addEventListener(ev, () => clearTimeout(holdT)));
gear.onclick = () => {
  $("h-hint").textContent = "Grown-ups: press and hold ⚙️ for 1 second";
};
[1, 2].forEach((y) => {
  const g = document.createElement("optgroup");
  g.label = `Year ${y} patterns`;
  PATTERNS.forEach((p, i) => {
    if (p.y !== y) return;
    const o = document.createElement("option");
    o.value = i;
    o.textContent = p.name;
    g.appendChild(o);
  });
  $("p-pattern").appendChild(g);
});
// Fills the words box (not saved until they tap Save words) with about 8 words for the chosen pattern, never ones from the Challenge list.
$("p-suggest").onclick = () => {
  const p = PATTERNS[+$("p-pattern").value],
    skip = new Set(CHALLENGE),
    out = [];
  for (const it of shuffle(p.list.filter((x) => !x.split("/").some((w) => skip.has(w))))) {
    const ws = it.split("/");
    if (out.length + ws.length <= 8) out.push(...ws);
    if (out.length >= 8) break;
  }
  $("p-words").value = out.join(", ");
  $("p-words-status").textContent = "";
  $("p-sug-status").textContent =
    `Filled the box with ${out.length} words (${p.name.split(" (")[0]}). Not saved yet: change any you like, then tap Save words.`;
};
function openParent() {
  $("p-words").value = (S.words || []).join(", ");
  $("p-words-status").textContent = "";
  $("p-sug-status").textContent = "";
  syncMath();
  renderAssign();
  renderVoices();
  syncNote(cloudMsg);
  show("s-parent");
}
$("p-save-words").onclick = () => {
  const w = [
    ...new Set(
      $("p-words")
        .value.toLowerCase()
        .split(/[\s,;]+/)
        .filter((x) => /^[a-z]+$/.test(x)),
    ),
  ].slice(0, 30);
  S.words = w.length ? w : DEFAULT_WORDS.slice();
  save();
  $("p-words").value = S.words.join(", ");
  const bare = S.words.filter((w) => !SENT[w]);
  $("p-words-status").textContent =
    `Saved ${S.words.length} words.${bare.length ? ` These are said without a sentence (ask Claude to add one): ${bare.join(", ")}.` : ""}`;
};
function syncMath() {
  const box = $("p-math");
  box.innerHTML = "";
  for (let i = 1; i < LEVELS.length; i++) {
    if (i === 1 || i === 7) {
      const h = document.createElement("div");
      h.className = "lvlhead";
      h.textContent = i === 1 ? "Year 1" : "Year 2";
      box.appendChild(h);
    }
    const b = document.createElement("button");
    b.innerHTML = `${LEVELS[i].name}<small style="display:block;font-weight:400;opacity:.75">${LEVELS[i].code}</small>`;
    b.setAttribute("aria-pressed", String(S.mathLvl === i));
    b.onclick = () => {
      S.mathLvl = i;
      S.streak = 0;
      S.stuck = 0;
      save();
      syncMath();
    };
    box.appendChild(b);
  }
  document
    .querySelectorAll("#p-hits button")
    .forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.h === S.hits)));
  document
    .querySelectorAll("#p-chal button")
    .forEach((b) => b.setAttribute("aria-pressed", String((b.dataset.c === "1") === (S.challenge !== false))));
  document
    .querySelectorAll("#p-hint button")
    .forEach((b) => b.setAttribute("aria-pressed", String((b.dataset.h === "1") === (S.hintAnswer === true))));
  document
    .querySelectorAll("#p-battle button")
    .forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.b === (S.battle || "math"))));
}
document.querySelectorAll("#p-battle button").forEach(
  (b) =>
    (b.onclick = () => {
      S.battle = b.dataset.b;
      save();
      syncMath();
    }),
);
// Voice list: best first, with a star on Premium/Enhanced ones
function renderVoices() {
  const sel = $("p-voice"),
    vs = engVoices().sort((a, b) => vScore(b) - vScore(a) || a.name.localeCompare(b.name));
  sel.innerHTML = vs.length
    ? vs
        .map(
          (v) =>
            `<option value="${v.voiceURI.replace(/"/g, "&quot;")}"${VOICE && v.voiceURI === VOICE.voiceURI ? " selected" : ""}>${fancy(v) ? "⭐ " : ""}${v.name} (${v.lang})</option>`,
        )
        .join("")
    : '<option value="">No English voices found</option>';
  $("p-voice-status").textContent = vs.some(fancy)
    ? ""
    : "No Premium or Enhanced voice here yet: download one in Settings, then reopen the game.";
}
$("p-voice").onchange = () => {
  const v = engVoices().find((x) => x.voiceURI === $("p-voice").value);
  if (!v) return;
  VOICE = v;
  try {
    localStorage.setItem(VKEY, v.voiceURI);
  } catch (e) {
    console.warn("Dino Go:", e);
  }
  say("Hello! I'm your dino guide. Let's catch some dinos!");
};
$("p-voice-test").onclick = () => say("Hello! I'm your dino guide. A wild T. rex appeared! 7 plus 5?");
document.querySelectorAll("#p-hits button").forEach(
  (b) =>
    (b.onclick = () => {
      S.hits = +b.dataset.h;
      save();
      syncMath();
    }),
);
document.querySelectorAll("#p-chal button").forEach(
  (b) =>
    (b.onclick = () => {
      S.challenge = b.dataset.c === "1";
      save();
      syncMath();
    }),
);
document.querySelectorAll("#p-hint button").forEach(
  (b) =>
    (b.onclick = () => {
      S.hintAnswer = b.dataset.h === "1";
      save();
      syncMath();
    }),
);
$("p-reset").onclick = () => {
  $("p-reset-yes").hidden = false;
};
$("p-reset-yes").onclick = () => {
  S.owned = {};
  S.reset = Date.now();
  S.streak = 0;
  S.stuck = 0;
  save();
  $("p-reset-yes").hidden = true;
  $("p-reset").textContent = "Progress reset";
};

async function shrink(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise((r, j) => {
      img.onload = r;
      img.onerror = j;
      img.src = url;
    });
    const k = Math.min(1, 560 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * k);
    c.height = Math.round(img.naturalHeight * k);
    const x = c.getContext("2d");
    x.fillStyle = "#fff";
    x.fillRect(0, 0, c.width, c.height);
    x.drawImage(img, 0, 0, c.width, c.height);
    try {
      cutout(c);
      return await new Promise((r) => c.toBlob((b) => r(b || file), "image/png"));
    } catch (e) {
      return await new Promise((r) => c.toBlob((b) => r(b || file), "image/jpeg", 0.86));
    }
  } catch (e) {
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}
// Same as tools/cutout.py: white connected to the border becomes transparent; the edge is softened.
function cutout(c) {
  const x = c.getContext("2d"),
    w = c.width,
    h = c.height,
    N = w * h,
    D = x.getImageData(0, 0, w, h),
    p = D.data,
    bg = new Uint8Array(N),
    st = new Int32Array(N * 4 + 2 * (w + h));
  let sp = 0;
  const white = (i) => p[i * 4] >= 236 && p[i * 4 + 1] >= 236 && p[i * 4 + 2] >= 236;
  for (let X = 0; X < w; X++) {
    st[sp++] = X;
    st[sp++] = N - w + X;
  }
  for (let Y = 0; Y < h; Y++) {
    st[sp++] = Y * w;
    st[sp++] = Y * w + w - 1;
  }
  while (sp) {
    const i = st[--sp];
    if (bg[i] || !white(i)) continue;
    bg[i] = 1;
    const X = i % w;
    if (X > 0) st[sp++] = i - 1;
    if (X < w - 1) st[sp++] = i + 1;
    if (i >= w) st[sp++] = i - w;
    if (i < N - w) st[sp++] = i + w;
  }
  let near = bg;
  for (let r = 0; r < 2; r++) {
    const n2 = near.slice();
    for (let i = 0; i < N; i++) {
      if (near[i]) continue;
      const X = i % w;
      if ((X > 0 && near[i - 1]) || (X < w - 1 && near[i + 1]) || (i >= w && near[i - w]) || (i < N - w && near[i + w]))
        n2[i] = 1;
    }
    near = n2;
  }
  for (let i = 0; i < N; i++) {
    const k = i * 4;
    if (bg[i]) {
      p[k + 3] = 0;
      continue;
    }
    if (!near[i]) continue;
    const a = Math.min(1, Math.max(0, (250 - (p[k] + p[k + 1] + p[k + 2]) / 3) / 160));
    if (!a) {
      p[k + 3] = 0;
      continue;
    }
    for (let j = 0; j < 3; j++) p[k + j] = Math.max(0, Math.min(255, (p[k + j] - (1 - a) * 255) / a));
    p[k + 3] = Math.round(a * 255);
  }
  x.putImageData(D, 0, 0);
}
function matchName(fn) {
  fn = fn.toLowerCase();
  const m = fn.match(/^(\d{1,2})[_\- ]/);
  if (m) {
    const sp = SPECIES.find((s) => s.n === +m[1]);
    if (sp) return sp.id;
  }
  for (const s of SPECIES) {
    const key = s.id.slice(3);
    if (fn.includes(key)) return s.id;
  }
  if (fn.includes("rex") || fn.includes("tyranno")) return "21_trex";
  return null;
}
$("p-files").onchange = async (e) => {
  const files = [...e.target.files];
  if (!files.length) return;
  const st = $("p-img-status");
  st.textContent = `Adding ${files.length} pictures…`;
  const named = [],
    rest = [];
  files.forEach((f) => {
    const id = matchName(f.name);
    id ? named.push([id, f]) : rest.push(f);
  });
  rest.sort((a, b) => a.lastModified - b.lastModified || a.name.localeCompare(b.name, undefined, { numeric: true }));
  const taken = new Set(named.map((x) => x[0]));
  const free = SPECIES.filter((s) => !taken.has(s.id) && !IMG[s.id]);
  const plan = named.concat(rest.map((f, i) => (free[i] ? [free[i].id, f] : null)).filter(Boolean));
  let done = 0;
  for (const [id, f] of plan) {
    await putImg(id, await shrink(f));
    done++;
    st.textContent = `Added ${done} of ${plan.length}…`;
  }
  const skipped = files.length - plan.length;
  st.textContent = `Added ${done} pictures.${skipped ? ` ${skipped} didn't fit (all 40 dinos already have pictures).` : ""} Check each one below.`;
  e.target.value = "";
  renderAssign();
};
function renderAssign() {
  const box = $("p-assign");
  box.innerHTML = "";
  const ids = SPECIES.filter((s) => IMG[s.id]).map((s) => s.id);
  if (!ids.length) {
    box.innerHTML = "<p>No pictures added yet. Dinos show as coloured cards until you add them.</p>";
    return;
  }
  ids.forEach((id) => {
    const d = document.createElement("div"),
      a = document.createElement("div");
    a.className = "art";
    art(a, BY[id]);
    const sel = document.createElement("select");
    sel.id = "as-" + id;
    sel.setAttribute("aria-label", "Which dino is this picture?");
    SPECIES.forEach((s) => {
      const o = document.createElement("option");
      o.value = s.id;
      o.textContent = `${s.n}. ${s.name}`;
      if (s.id === id) o.selected = true;
      sel.appendChild(o);
    });
    const opt = document.createElement("option");
    opt.value = "__del";
    opt.textContent = "Remove this picture";
    sel.appendChild(opt);
    sel.onchange = async () => {
      const to = sel.value;
      if (to === id) return;
      const mine = await getBlob(id);
      if (to === "__del") {
        await delImg(id);
      } else {
        const theirs = IMG[to] ? await getBlob(to) : null;
        if (mine) await putImg(to, mine);
        if (theirs) await putImg(id, theirs);
        else await delImg(id);
      }
      renderAssign();
    };
    d.append(a, sel);
    box.appendChild(d);
  });
}
