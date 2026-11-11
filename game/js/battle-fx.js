/* ---------- Battle effects ---------- */
const TCOL = { plant: "#3E9B4F", meat: "#D9443A", sea: "#2F7FD1", fly: "#8A55C9" };
const fig = (box) =>
  box.firstElementChild && !box.firstElementChild.classList.contains("lvbadge")
    ? box.firstElementChild
    : box.querySelector("img,.ph") || box; // the picture (or placeholder card) inside an .art box
function center(el) {
  const a = $("arena").getBoundingClientRect(),
    r = el.getBoundingClientRect();
  return { x: r.left - a.left + r.width / 2, y: r.top - a.top + r.height / 2, h: r.height };
}
function fx(cls, x, y, html = "") {
  const d = document.createElement("div");
  d.className = "fx " + cls;
  d.style.left = x + "px";
  d.style.top = y + "px";
  d.innerHTML = html;
  $("arena").appendChild(d);
  return d;
}
const pop = (d, k, o) => anim(d, k, o).then(() => d.remove());
const settle = (el) => {
  try {
    el.getAnimations().forEach((a) => {
      if (!a.animationName) a.cancel();
    });
  } catch (e) {
    console.warn("Dino Go:", e);
  }
};
const gap = () => $("b-wild").getBoundingClientRect().left - $("b-me").getBoundingClientRect().left;
function callout(text, box, col, dy = -0.55, cls = "") {
  const c = center(box),
    d = fx("callout " + cls, c.x, c.y + c.h * dy, text);
  d.style.setProperty("--c", col);
  return pop(
    d,
    [
      { transform: "translate(-50%,-50%) scale(.4)", opacity: 0 },
      { transform: "translate(-50%,-50%) scale(1.12)", opacity: 1, offset: 0.12 },
      { transform: "translate(-50%,-50%) scale(1)", opacity: 1, offset: 0.25 },
      { transform: "translate(-50%,-65%)", opacity: 1, offset: 0.8 },
      { transform: "translate(-50%,-85%)", opacity: 0 },
    ],
    { duration: 1400 },
  );
}
function shake(a = 1) {
  anim(
    $("arena"),
    [
      { translate: "0 0" },
      { translate: `${-8 * a}px ${5 * a}px` },
      { translate: `${7 * a}px ${-4 * a}px` },
      { translate: `${-4 * a}px ${2 * a}px` },
      { translate: "0 0" },
    ],
    { duration: 300 + 60 * a },
  );
}
function screenFlash(col, peak, ms) {
  const f = $("flash");
  f.hidden = false;
  f.style.background = col;
  return anim(f, [{ opacity: 0 }, { opacity: peak, offset: 0.2 }, { opacity: 0 }], { duration: ms }).then(() => {
    f.hidden = true;
  });
}
// Impact on the target: burst, sparks, damage number, flash, knock-back, plus an effect that fits the attacker's type. size: 1 small, 1.25 medium, 1.6 special, 2 finisher.
function impact(box, col, dmg, dir = 1, o = {}) {
  // dir: which way the target gets knocked (1 = right)
  const c = center(box),
    t = fig(box),
    sz = o.size || 1;
  const b = fx("burst", c.x, c.y);
  b.style.setProperty("--c", col);
  pop(
    b,
    [
      { transform: "scale(.2) rotate(0deg)", opacity: 1 },
      { transform: `scale(${1.1 * sz}) rotate(20deg)`, opacity: 1, offset: 0.4 },
      { transform: `scale(${1.4 * sz}) rotate(35deg)`, opacity: 0 },
    ],
    { duration: 460, easing: "ease-out" },
  );
  for (let i = 0; i < Math.round(12 * sz); i++) {
    const s = fx("spark", c.x, c.y),
      a = Math.random() * Math.PI * 2,
      r = (70 + Math.random() * 90) * Math.min(sz, 1.5);
    s.style.setProperty("--c", i % 3 ? "#FFD23F" : col);
    pop(
      s,
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${Math.cos(a) * r}px,${Math.sin(a) * r}px) scale(.2)`, opacity: 0 },
      ],
      { duration: 500 + rand(250), easing: "cubic-bezier(.15,.7,.3,1)" },
    );
  }
  const ts = o.txt || sz;
  pop(
    fx("dmg" + (ts >= 2 ? " huge" : ts >= 1.5 ? " big" : ""), c.x, c.y - c.h * 0.15, "−" + dmg),
    [
      { transform: "translate(-50%,-50%) scale(.3)", opacity: 0 },
      { transform: "translate(-50%,-85%) scale(1.3)", opacity: 1, offset: 0.18 },
      { transform: "translate(-50%,-100%) scale(1)", opacity: 1, offset: 0.65 },
      { transform: "translate(-50%,-160%) scale(.9)", opacity: 0 },
    ],
    { duration: 1250, easing: "ease-out" },
  );
  anim(
    t,
    [
      { filter: "brightness(1)" },
      { filter: "brightness(1.9) saturate(.4)" },
      { filter: "brightness(1)" },
      { filter: "brightness(1.9) saturate(.4)" },
      { filter: "brightness(1)" },
    ],
    { duration: 340 },
  );
  anim(
    t,
    [
      { translate: "0 0", rotate: "0deg" },
      { translate: `${28 * dir * Math.min(sz, 1.6)}px -8px`, rotate: `${7 * dir}deg` },
      { translate: `${-8 * dir}px 0`, rotate: `${-3 * dir}deg` },
      { translate: "0 0", rotate: "0deg" },
    ],
    { duration: 440, easing: "ease-out" },
  );
  shake(sz >= 1.6 ? 1.8 : sz >= 1.25 ? 1.3 : 1);
  if (o.type) moveFx(o.type, box, col, sz);
}
// Type effects, drawn with CSS only: plant = leaves and a ground ring, meat = slash marks, sea = splash, fly = wind swirls
function moveFx(type, box, col, sz) {
  const c = center(box);
  const ring = (color, w, y = 0.4, dur = 620) => {
    const r = fx("ring", c.x, c.y + c.h * y);
    r.style.setProperty("--c", color);
    r.style.width = w + "px";
    r.style.height = w * 0.32 + "px";
    r.style.margin = `${-w * 0.16}px 0 0 ${-w / 2}px`;
    pop(
      r,
      [
        { transform: "scale(.15)", opacity: 0.95 },
        { transform: "scale(1)", opacity: 0 },
      ],
      { duration: dur, easing: "ease-out" },
    );
  };
  if (type === "plant") {
    ring(col, 170 * sz);
    if (sz >= 1.25) ring("#FFE066", 110 * sz, 0.4, 800);
    for (let i = 0; i < Math.round(6 + 4 * sz); i++) {
      const l = fx("leaf", c.x, c.y + c.h * 0.2),
        a = -Math.PI * (0.1 + Math.random() * 0.8),
        r = (60 + Math.random() * 80) * Math.min(sz, 1.5);
      l.style.setProperty("--c", i % 2 ? col : "#8BD36A");
      pop(
        l,
        [
          { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
          {
            transform: `translate(${Math.cos(a) * r}px,${Math.sin(a) * r}px) rotate(${rand(360)}deg)`,
            opacity: 1,
            offset: 0.6,
          },
          {
            transform: `translate(${Math.cos(a) * r * 1.1}px,${Math.sin(a) * r + 50}px) rotate(${rand(720)}deg)`,
            opacity: 0,
          },
        ],
        { duration: 900, easing: "ease-out" },
      );
    }
  } else if (type === "meat") {
    const n = sz >= 1.6 ? 4 : 3;
    for (let i = 0; i < n; i++) {
      const sl = fx("slash", c.x + (i - (n - 1) / 2) * 28, c.y);
      sl.style.setProperty("--c", col);
      sl.style.height = 150 * Math.min(sz, 1.5) + "px";
      sl.style.marginTop = -75 * Math.min(sz, 1.5) + "px";
      pop(
        sl,
        [
          { transform: "rotate(28deg) scaleY(0)", opacity: 1 },
          { transform: "rotate(28deg) scaleY(1)", opacity: 1, offset: 0.35 },
          { transform: "rotate(28deg) scaleY(1)", opacity: 0 },
        ],
        { duration: 520, delay: i * 90, easing: "ease-out", fill: "backwards" },
      );
    }
  } else if (type === "sea") {
    ring("#7CC3FF", 180 * sz);
    ring(col, 120 * sz, 0.4, 820);
    for (let i = 0; i < Math.round(8 + 5 * sz); i++) {
      const d = fx("drop", c.x, c.y + c.h * 0.1),
        dx = (Math.random() - 0.5) * 150 * Math.min(sz, 1.5),
        h = 60 + Math.random() * 90;
      d.style.setProperty("--c", i % 2 ? "#BFE3FF" : col);
      pop(
        d,
        [
          { transform: "translate(0,0)", opacity: 1 },
          { transform: `translate(${dx * 0.6}px,${-h}px)`, opacity: 1, offset: 0.45 },
          { transform: `translate(${dx}px,${40}px)`, opacity: 0 },
        ],
        { duration: 800, easing: "cubic-bezier(.3,.6,.5,1)" },
      );
    }
  } else {
    for (let i = 0; i < Math.round(2 + sz); i++) {
      const g = fx("gust", c.x, c.y);
      g.style.setProperty("--c", col);
      pop(
        g,
        [
          { transform: "scale(.3) rotate(0deg)", opacity: 1 },
          { transform: `scale(${1 + i * 0.35}) rotate(${300 + i * 60}deg)`, opacity: 0 },
        ],
        { duration: 600 + i * 120, delay: i * 70, easing: "ease-out", fill: "backwards" },
      );
    }
    for (let i = 0; i < 6; i++) {
      const l = fx("leaf", c.x, c.y),
        a = Math.random() * Math.PI * 2,
        r = 60 + Math.random() * 60;
      l.style.setProperty("--c", "#fff");
      pop(
        l,
        [
          { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
          { transform: `translate(${Math.cos(a) * r}px,${Math.sin(a) * r}px) rotate(${rand(540)}deg)`, opacity: 0 },
        ],
        { duration: 700, easing: "ease-out" },
      );
    }
  }
}
function speedLines(box, dir, col) {
  const c = center(box);
  for (let i = 0; i < 4; i++) {
    const l = fx("speed", c.x - dir * c.h * 0.45, c.y + (i - 1.5) * c.h * 0.16);
    l.style.setProperty("--c", col);
    pop(
      l,
      [
        { transform: `translateX(0) scaleX(${dir})`, opacity: 0.9 },
        { transform: `translateX(${dir * 60}px) scaleX(${dir * 1.6})`, opacity: 0 },
      ],
      { duration: 380, delay: i * 30, fill: "backwards" },
    );
  }
}

// style: "nip" quick short jab, "charge" run-up and ram, "jump" crouch, leap with a spin, slam. zoom grows the picture during the slam (finisher).
async function lunge(box, dir, dist, id, style = "charge", zoom = 1) {
  const t = fig(box),
    pose = t.tagName === "IMG" && ATK_OK.has(id) && atkSrc(id),
    still = t.src,
    col = TCOL[BY[id].type];
  if (pose) t.src = pose;
  const hit = `${dist * dir}px -10px`;
  let endRot,
    endScale = "1 1";
  if (style === "jump") {
    const b = `${-20 * dir}px 10px`;
    await anim(
      t,
      [
        { translate: "0 0", scale: "1 1" },
        { translate: b, scale: "1.1 .84" },
      ],
      { duration: 260, easing: "ease-out", fill: "forwards" },
    );
    sfx.whoosh();
    endScale = `${zoom} ${zoom}`;
    endRot = `${360 * dir}deg`;
    await anim(
      t,
      [
        { translate: b, rotate: "0deg", scale: "1.1 .84" },
        { translate: `${dist * dir * 0.5}px -120px`, rotate: `${180 * dir}deg`, scale: "1 1", offset: 0.5 },
        { translate: hit, rotate: endRot, scale: endScale },
      ],
      { duration: 430, easing: "ease-in-out", fill: "forwards" },
    );
  } else {
    const nip = style === "nip",
      back = `${-(nip ? 14 : 24) * dir}px 6px`;
    endRot = `${(nip ? 5 : 8) * dir}deg`;
    if (!nip) speedLines(box, dir, col);
    await anim(
      t,
      [
        { translate: "0 0", rotate: "0deg" },
        { translate: back, rotate: `${-6 * dir}deg` },
      ],
      { duration: nip ? 150 : 210, easing: "ease-out", fill: "forwards" },
    );
    sfx.whoosh();
    await anim(
      t,
      [
        { translate: back, rotate: `${-6 * dir}deg` },
        { translate: hit, rotate: endRot },
      ],
      { duration: nip ? 110 : 160, easing: "cubic-bezier(.5,0,1,.5)", fill: "forwards" },
    );
  }
  const toRot = style === "jump" ? endRot : "0deg"; // a full spin ends where it started, so don't unwind it
  return () =>
    anim(
      t,
      [
        { translate: hit, rotate: endRot, scale: endScale },
        { translate: "0 0", rotate: toRot, scale: "1 1" },
      ],
      { duration: 420, easing: "cubic-bezier(.3,1.4,.5,1)", fill: "forwards" },
    ).then(() => {
      settle(t);
      if (pose) t.src = still;
    });
}
async function attack(m) {
  const sp = BY[E.me],
    col = TCOL[sp.type],
    sl = MOVE_SLOTS[m.slot];
  const dmg = RULES.hitDamage(E, S.hits, sl.power * (1 + 0.1 * Math.max(0, E.combo - 1)));
  callout(m.name + "!", $("b-me"), col);
  const back = await lunge($("b-me"), 1, gap() * (m.slot === 0 ? 0.45 : 0.6), E.me, sl.style);
  RULES.applyHit(E, dmg, S.hits);
  impact($("b-wild"), col, dmg, 1, { type: sp.type, size: sl.size });
  sfx.hit();
  hpBar();
  await back();
}
// The finisher (5 right in a row): charge-up glow, screen flash, zoomed leap in the attack pose, roar, double shockwave, huge number.
async function superAttack(m) {
  const sp = BY[E.me],
    col = TCOL[sp.type],
    t = fig($("b-me"));
  const dmg = RULES.hitDamage(E, S.hits, FIN_POWER * (1 + 0.1 * (E.combo - 1)), true);
  callout("⭐ " + m.name + "! ⭐", $("arena"), "#E08A1E", -0.5, "super");
  sfx.charge();
  const glow = `brightness(1.7) saturate(1.3) drop-shadow(0 0 16px ${col}) drop-shadow(0 0 30px #FFD23F)`;
  await anim(
    t,
    [
      { filter: "brightness(1)", translate: "0 0" },
      { filter: glow, translate: "-4px 0", offset: 0.25 },
      { filter: glow, translate: "4px 0", offset: 0.5 },
      { filter: glow, translate: "-4px 0", offset: 0.75 },
      { filter: glow, translate: "0 0" },
    ],
    { duration: 700, fill: "forwards" },
  );
  screenFlash(col, 0.5, 360);
  const back = await lunge($("b-me"), 1, gap() * 0.6, E.me, "jump", 1.35);
  RULES.applyHit(E, dmg, S.hits);
  screenFlash("#fff", 0.9, 520);
  sfx.roar();
  sfx.hit();
  impact($("b-wild"), col, dmg, 1, { type: sp.type, size: 2 });
  const w = center($("b-wild"));
  for (const [i, sz] of [
    [0, 150],
    [1, 230],
  ]) {
    const r = fx("ring", w.x, w.y + w.h * 0.4);
    r.style.setProperty("--c", i ? "#FFD23F" : col);
    r.style.width = sz * 1.4 + "px";
    r.style.height = sz * 0.45 + "px";
    r.style.margin = `${-sz * 0.22}px 0 0 ${-sz * 0.7}px`;
    pop(
      r,
      [
        { transform: "scale(.15)", opacity: 1 },
        { transform: "scale(1.4)", opacity: 0 },
      ],
      { duration: 760, delay: i * 140, easing: "ease-out", fill: "backwards" },
    );
  }
  setTimeout(() => shake(1.6), 160);
  hpBar();
  await back();
  try {
    t.getAnimations().forEach((a) => {
      if (!a.animationName) a.cancel();
    });
  } catch (e) {
    console.warn("Dino Go:", e);
  }
}
// The wild dino winds up an attack (glow grows, then holds; there is no countdown). A right answer interrupts it, a wrong one lets it land.
function windUp() {
  const w = E.wild;
  E.windSlot = rand(3);
  E.wind = movesOf(w)[E.windSlot];
  const el = $("b-wild");
  el.style.setProperty("--wc", TCOL[w.type]);
  el.classList.remove("winding");
  void el.offsetWidth;
  el.classList.add("winding");
  const wr = $("b-warn");
  wr.hidden = false;
  wr.className = "warn";
  wr.textContent = `⚠ Winding up ${E.wind}!`;
  sfx.growl();
  callout("⚠ Winding up!", el, TCOL[w.type], -0.55);
}
function stopWind(stopped) {
  $("b-wild").classList.remove("winding");
  const wr = $("b-warn");
  if (stopped) {
    wr.hidden = false;
    wr.className = "warn ok";
    wr.textContent = "✓ Stopped it!";
    sfx.stop();
    callout("Stopped it!", $("b-wild"), "#3E9B4F", -0.4);
  } else wr.hidden = true;
}
// The wild dino's wind-up lands after a wrong answer. A charged shield blocks it. Returns true if blocked.
async function counter() {
  const w = E.wild,
    col = TCOL[w.type],
    sl = MOVE_SLOTS[E.windSlot];
  callout(E.wind + "!", $("b-wild"), col);
  const back = await lunge($("b-wild"), -1, gap() * (E.windSlot === 0 ? 0.4 : 0.5), w.id, sl.style);
  const blocked = E.shield;
  if (blocked) {
    E.shield = false;
    const c = center($("b-me"));
    sfx.block();
    pop(
      fx("shield", c.x, c.y),
      [
        { transform: "scale(.5)", opacity: 0 },
        { transform: "scale(1.05)", opacity: 1, offset: 0.3 },
        { transform: "scale(1.25)", opacity: 0 },
      ],
      { duration: 650, easing: "ease-out" },
    );
    callout("Blocked!", $("b-me"), "#2F7FD1", -0.1);
    anim(fig($("b-me")), [{ translate: "0 0" }, { translate: "-12px 0" }, { translate: "0 0" }], { duration: 320 });
  } else {
    E.myHp = Math.max(0, E.myHp - E.wildDmg);
    impact($("b-me"), col, E.wildDmg, -1, { type: w.type, size: Math.min(sl.size, 1.25), txt: 1 });
    sfx.hit();
  }
  hpBar();
  await back();
  return blocked;
}
function dizzy(box) {
  const c = center(box),
    dz = fx("dizzy", c.x, c.y - c.h * 0.4, "<i></i><i></i><i></i>");
  anim(dz, [{ transform: "scaleY(.45) rotate(0deg)" }, { transform: "scaleY(.45) rotate(360deg)" }], {
    duration: 900,
    iterations: 3,
  }).then(() => dz.remove());
}
// Their dino runs out of health: it flops over, the wild dino runs off, back to the home screen.
async function faint() {
  const me = BY[E.me],
    w = E.wild;
  stopWind(false);
  say(`Oh no! The wild ${w.say} ran away!`);
  dizzy($("b-me"));
  await anim(
    fig($("b-me")),
    [
      { rotate: "0deg", translate: "0 0", opacity: 1 },
      { rotate: "12deg", translate: "0 8px", offset: 0.3 },
      { rotate: "-8deg", translate: "0 14px", offset: 0.6 },
      { rotate: "0deg", translate: "0 22px", scale: "1 .88", opacity: 0.5 },
    ],
    { duration: 1300, fill: "forwards" },
  );
  callout("Ran away!", $("b-wild"), "#56664F", -0.45);
  sfx.whoosh();
  await anim(
    fig($("b-wild")),
    [
      { translate: "0 0", opacity: 1 },
      { translate: "-20px -6px", offset: 0.2 },
      { translate: "160% -10px", opacity: 0 },
    ],
    { duration: 1000, easing: "ease-in", fill: "forwards" },
  );
  await wait(3200);
  goHome();
}
function dodge() {
  sfx.whoosh();
  callout("Missed!", $("b-wild"), "#56664F", -0.45);
  anim(
    fig($("b-wild")),
    [
      { translate: "0 0", rotate: "0deg" },
      { translate: "44px -34px", rotate: "10deg", offset: 0.4 },
      { translate: "0 0", rotate: "0deg" },
    ],
    { duration: 540, easing: "ease-out" },
  );
}
async function knockout() {
  dizzy($("b-wild"));
  anim(
    fig($("b-me")),
    [
      { translate: "0 0" },
      { translate: "0 -44px", offset: 0.25 },
      { translate: "0 0", offset: 0.5 },
      { translate: "0 -30px", offset: 0.75 },
      { translate: "0 0" },
    ],
    { duration: 950, delay: 300 },
  );
  const m = center($("b-me"));
  for (let i = 0; i < 16; i++) {
    const s = fx("spark", m.x, m.y - m.h * 0.3),
      a = -Math.PI * (0.15 + Math.random() * 0.7),
      r = 90 + Math.random() * 90;
    s.style.setProperty("--c", pick(Object.values(TCOL).concat("#FFD23F")));
    pop(
      s,
      [
        { transform: "translate(0,0)", opacity: 1 },
        { transform: `translate(${Math.cos(a) * r}px,${Math.sin(a) * r}px)`, opacity: 1, offset: 0.6 },
        { transform: `translate(${Math.cos(a) * r}px,${Math.sin(a) * r + 60}px)`, opacity: 0 },
      ],
      { duration: 1200, delay: 300, easing: "ease-out" },
    );
  }
  await anim(
    fig($("b-wild")),
    [
      { rotate: "0deg", translate: "0 0", opacity: 1 },
      { rotate: "-12deg", translate: "0 6px", offset: 0.3 },
      { rotate: "10deg", translate: "0 10px", offset: 0.6 },
      { rotate: "0deg", translate: "0 20px", scale: "1 .9", opacity: 0.5 },
    ],
    { duration: 1300, fill: "forwards" },
  );
}

/* ---------- Level-up celebration ---------- */
function confetti() {
  const box = $("conf");
  box.innerHTML = "";
  for (let i = 0; i < 40; i++) {
    const d = document.createElement("i");
    d.style.left = rand(100) + "%";
    d.style.background = pick(["#F2762E", "#3E9B4F", "#2F7FD1", "#8A55C9", "#FFD23F", "#D9443A"]);
    box.appendChild(d);
    anim(
      d,
      [
        { transform: "translateY(0) rotate(0deg)", opacity: 1 },
        { transform: `translateY(${innerHeight * 1.1}px) rotate(${rand(720)}deg)`, opacity: 0.9 },
      ],
      { duration: 1800 + rand(1800), delay: rand(700), easing: "ease-in", fill: "both" },
    );
  }
}
// Level-up with something new (L3, L4, L5, L8, L10): a full-screen celebration. At L3, L5 and L10 the title changes, so the same picture "evolves": flashes white, pulses, then is revealed with its new name and glow.
function celebrate(id, L) {
  return new Promise(async (res) => {
    const sp = BY[id],
      o = S.owned[id],
      pk = perks(sp, o, L),
      oldT = titleFor(L - 1),
      evolve = !!pk.title,
      cele = $("cele"),
      ok = $("ce-ok");
    $("ce-head").textContent = `Level ${L}!`;
    art($("ce-art"), sp);
    decorate($("ce-art"), id, true, L - 1);
    $("ce-title").textContent = oldT ? `${oldT} ${sp.name}` : sp.name;
    $("ce-list").innerHTML = "";
    ok.hidden = true;
    $("conf").innerHTML = "";
    cele.hidden = false;
    window.scrollTo(0, 0);
    sfx.yay();
    say(evolve ? `Wow! Your ${oldT ? oldT + " " : ""}${sp.say} is changing!` : "Level up!");
    if (evolve) {
      const t = fig($("ce-art"));
      await anim(
        t,
        [
          { filter: "brightness(1)", scale: "1" },
          { filter: "brightness(6) saturate(0)", scale: "1.12" },
          { filter: "brightness(1)", scale: "1" },
          { filter: "brightness(6) saturate(0)", scale: "1.2" },
          { filter: "brightness(1)", scale: "1" },
          { filter: "brightness(8) saturate(0)", scale: "1.3" },
          { filter: "brightness(1)", scale: "1" },
        ],
        { duration: 2000, easing: "ease-in-out" },
      );
      sfx.roar();
    }
    decorate($("ce-art"), id, true, L);
    $("ce-title").textContent = fullName(sp, o);
    $("ce-list").innerHTML = pk.lines.map((l) => `<li>${l}</li>`).join("");
    confetti();
    if (evolve) screenFlash("#fff", 0.7, 500);
    say(evolve ? `Your ${sp.say} is now ${fullSay(sp, o)}! Yay!` : "Yay!");
    await wait(900);
    ok.hidden = false;
    ok.onclick = () => {
      cele.hidden = true;
      $("conf").innerHTML = "";
      try {
        speechSynthesis.cancel();
      } catch (e) {
        console.warn("Dino Go:", e);
      }
      res();
    };
  });
}
