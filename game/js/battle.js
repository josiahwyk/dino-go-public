/* ---------- Battle (maths) ---------- */
let BG = 0; // bumped when a battle starts or they go home, so a fight they left stops itself
function startBattle(meId, intro) {
  BG++;
  E.me = meId;
  const me = BY[meId],
    w = E.wild,
    o = S.owned[meId];
  // The wild dino's health (from SPECIES) is taken off by their hits. Every battle takes exactly S.hits right answers (see hitDamage).
  E.maxHp = w.hp;
  E.hp = E.maxHp;
  E.turn = 0;
  E.q = null;
  E.combo = 0;
  E.round = 0;
  E.phase = "";
  // Their dino's health is its dino-book Health stat. Each wrong answer costs about a sixth of it
  // (a bit more against strong wild dinos), so it faints after roughly 5-6 wrong answers in one fight.
  E.myMax = me.hp + (lvl(o) - 1) * 2;
  E.myHp = E.myMax;
  E.wildDmg = Math.max(2, Math.round(E.myMax * (0.13 + 0.01 * w.atk)));
  E.shieldN = 0;
  E.shield = startsShielded(o);
  hideHint();
  art($("b-me"), me);
  decorate($("b-me"), meId);
  art($("b-wild"), w);
  $("b-wild").classList.remove("winding");
  $("b-warn").hidden = true;
  preloadAtk(me.id);
  preloadAtk(w.id); // so the pose swap doesn't flicker
  $("b-me-name").innerHTML = nameHtml(me, o);
  $("b-wild-name").textContent = w.name;
  $("b-title").textContent = `${E.rematch ? "Rematch! " : ""}Battle the wild ${w.name}!`;
  $("moves").hidden = true;
  $("q-row").hidden = false;
  $("choices").hidden = false;
  hpBar();
  show("s-battle");
  anim(
    fig($("b-me")),
    [
      { translate: "-120% 0", opacity: 0 },
      { translate: "0 0", opacity: 1 },
    ],
    { duration: 550, easing: "cubic-bezier(.2,.8,.3,1.15)" },
  );
  anim(
    fig($("b-wild")),
    [
      { translate: "120% 0", opacity: 0 },
      { translate: "0 0", opacity: 1 },
    ],
    { duration: 550, delay: 150, easing: "cubic-bezier(.2,.8,.3,1.15)" },
  );
  if (lvl(o) >= 5) {
    // stronger dinos arrive with a flourish
    const gen = BG;
    setTimeout(() => {
      if (gen !== BG) return;
      const c = center($("b-me"));
      sfx.whoosh();
      const r = fx("ring", c.x, c.y + c.h * 0.4);
      r.style.setProperty("--c", lvl(o) >= 10 ? "#FFC93C" : TCOL[me.type]);
      r.style.width = "220px";
      r.style.height = "70px";
      r.style.margin = "-35px 0 0 -110px";
      pop(
        r,
        [
          { transform: "scale(.2)", opacity: 1 },
          { transform: "scale(1.3)", opacity: 0 },
        ],
        { duration: 700, easing: "ease-out" },
      );
      for (let i = 0; i < 14; i++) {
        const s = fx("spark", c.x, c.y + c.h * 0.3),
          a = -Math.PI * Math.random(),
          d = 60 + Math.random() * 90;
        s.style.setProperty("--c", i % 2 ? "#FFD23F" : TCOL[me.type]);
        pop(
          s,
          [
            { transform: "translate(0,0)", opacity: 1 },
            { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) scale(.3)`, opacity: 0 },
          ],
          { duration: 800, easing: "ease-out" },
        );
      }
    }, 600);
  }
  say(
    `${intro} Your ${fullSay(me, o)} is ready!${E.shield ? " It starts with a shield!" : ""} Get it right to attack.`,
  );
  beginRound();
}
function setBar(id, hp, max) {
  const p = hp / max,
    bar = $(id);
  bar.querySelector("i").style.width = bar.querySelector("b").style.width = p * 100 + "%";
  bar.classList.toggle("low", p < 0.35);
}
function hpBar() {
  const o = S.owned[E.me],
    need = shieldNeed(o),
    fn = finNeed();
  setBar("b-hp", E.hp, E.maxHp);
  $("b-hp-num").textContent = `Health ${E.hp}`;
  setBar("b-me-hp", E.myHp, E.myMax);
  $("b-me-lv").textContent = `Level ${lvl(o)} · Health ${E.myHp}`;
  const n = E.shield ? need : E.shieldN,
    p = $("b-pips");
  p.innerHTML =
    `<span class="sh" role="img" aria-label="${E.shield ? "Shield ready" : `Shield: ${n} of ${need}`}">🛡️${E.shield ? "Ready" : ""}${Array.from({ length: need }, (_, i) => `<i class="${i < n ? "on" : ""}"></i>`).join("")}</span>` +
    `<span class="cb${E.combo > 0 && E.combo >= fn - 1 ? " hot" : ""}" role="img" aria-label="Combo ${E.combo} of ${fn}">${Array.from({ length: fn }, (_, i) => `<i class="${i < E.combo ? "on" : ""}">★</i>`).join("")}</span>`;
  p.classList.toggle("ready", E.shield);
  $("b-me").parentElement.classList.toggle("shielded", E.shield);
}
// A round: the wild dino winds up, they pick a move (if they have more than one), then answers the question that move asks.
function beginRound() {
  E.busy = false;
  E.miss = 0;
  E.round++;
  RETRY.forEach((r) => r.wait--);
  const slots = slotsOf(S.owned[E.me]),
    first = E.round === 1;
  windUp();
  const warn = `${E.wild.say} is winding up ${E.wind}!${first ? " Get it right to stop it!" : ""}`;
  if (slots.length < 2) {
    chooseMove(slots[0], warn);
    return;
  }
  showMenu(
    slots,
    `${warn} Pick a move!${first ? " A bigger move asks a harder question, but it hits harder, and the biggest one charges your super move twice as fast." : ""}`,
  );
}
function showMenu(slots, spoken) {
  E.phase = "menu";
  E.menuSay = spoken;
  const mv = movesOf(BY[E.me]),
    col = TCOL[BY[E.me].type];
  $("q-row").hidden = true;
  $("choices").hidden = true;
  $("moves").hidden = false;
  const list = $("m-list");
  list.innerHTML = "";
  MOVE_SLOTS.forEach((m, i) => {
    const b = document.createElement("button"),
      ok = slots.includes(i);
    b.className = "mv" + (ok ? "" : " locked");
    b.style.setProperty("--c", col);
    b.innerHTML = `<span class="mi">${ok ? m.icon : "🔒"}</span><span><span class="mn">${mv[i]}</span><small>${ok ? m.tag : "Unlocks at level " + m.need}</small></span><span class="st" aria-hidden="true">${"★".repeat(m.stars)}</span>`;
    if (ok) {
      b.setAttribute("aria-label", `${mv[i]}. ${m.tag}. Power ${m.stars} of 3.`);
      b.onclick = () => pickMove(i);
    } else {
      b.disabled = true;
      b.setAttribute("aria-label", `${mv[i]}, locked until level ${m.need}`);
    }
    list.appendChild(b);
  });
  say(spoken, true);
}
function pickMove(i) {
  if (E.phase !== "menu") return;
  chooseMove(i);
}
function chooseMove(i, preface) {
  E.phase = "q";
  E.slot = i;
  E.busy = false;
  const multi = slotsOf(S.owned[E.me]).length > 1;
  E.q = makeQ(multi ? Math.max(1, Math.min(MAXL, S.mathLvl + MOVE_SLOTS[i].dq)) : 0, i);
  $("moves").hidden = true;
  $("q-row").hidden = false;
  $("choices").hidden = false;
  showQ();
  const again = E.q.retry ? "Here's one like before! " : "";
  if (preface) say(`${preface} ${again}${E.q.say}`, true);
  else say(`${movesOf(BY[E.me])[i]}! ${again}${E.q.say}`);
}
function showQ() {
  hideHint();
  $("qbox").innerHTML = (E.q.retry ? '<div class="again">🔁 One like before</div>' : "") + E.q.html;
  const box = $("choices");
  box.innerHTML = "";
  box.classList.toggle("wide", !!E.q.wide);
  box.classList.toggle("letters", !!E.q.letters);
  E.q.choices.forEach((v) => {
    const k = document.createElement("button");
    k.innerHTML = E.q.label ? E.q.label(v) : v;
    k.dataset.v = v;
    k.setAttribute("aria-label", E.q.sayAns ? E.q.sayAns(v) : String(v));
    k.onclick = () => answer(v, k);
    box.appendChild(k);
  });
}
$("b-say").onclick = () => {
  if (E.q) say(E.q.say + ($("hint") ? " " + E.q.hint.say : ""));
};
$("m-say").onclick = () => say(E.menuSay || "Pick a move!");
async function answer(v, btn) {
  if (E.busy || E.phase !== "q") return;
  const q = E.q,
    gen = BG,
    me = BY[E.me];
  let o = S.owned[E.me];
  if (v !== q.ans) {
    // Wrong: their attack misses and the wild dino's wind-up lands (unless their shield is charged). The combo and shield pips start again.
    // The wrong choice is crossed out. The first miss on a question queues one like it for later and shows a clue.
    E.busy = true;
    E.miss++;
    RULES.wrongTap(E, E.miss);
    sfx.bad();
    btn.classList.add("nope");
    hpBar();
    if (E.miss === 1) {
      RULES.queueRetry(RETRY, q);
      noteSkill(q.key, false);
      save();
    }
    say("Missed! Look out!");
    dodge();
    await wait(650);
    if (gen !== BG) return;
    stopWind(false);
    const blocked = await counter();
    if (gen !== BG) return;
    if (E.myHp <= 0) {
      await faint();
      return;
    }
    if (E.miss >= 2 && S.hintAnswer === true) {
      const g = [...$("choices").children].find((b) => b.dataset.v === String(q.ans));
      if (g) g.classList.add("glow");
    }
    windUp();
    E.busy = false;
    const oops = blocked ? "Blocked! Your shield saved you." : "Ouch!";
    if (E.miss === 1 && q.hint) {
      showHint();
      say(`${oops} Here's a clue. ${q.hint.say}`);
    } else say(`${oops} Try again. ${q.say}`);
    return;
  }
  E.busy = true;
  hideHint();
  const first = E.miss === 0;
  // Right first time: the super meter charges by the move's charge and the shield charges (2 pips from level 4, otherwise 3).
  const { fin, shieldUp } = RULES.rightAnswer(E, {
    first,
    charge: MOVE_SLOTS[E.slot || 0].charge,
    shieldNeed: shieldNeed(o),
  });
  if (first) noteSkill(q.key, true);
  // Their maths level adapts (see RULES.adaptLevel). Either change is saved.
  if (RULES.adaptLevel(S, q.lvl, E.miss) || first) save();
  const mv = movesOf(me),
    m = { name: fin ? `SUPER ${mv[2].toUpperCase()}` : mv[E.slot], slot: E.slot, fin };
  stopWind(true);
  hpBar();
  if (q.retry && first) callout("You got it!", $("b-me"), "#2F9E44", -0.1);
  say(
    `${q.sayRight || (q.sayAns ? q.sayAns(v) : v)}! ${q.retry && first ? "You got it this time! " : ""}${fin ? "Super move! " : ""}${m.name}!${shieldUp ? " Shield ready!" : ""}`,
  );
  if (first && !fin && E.combo === finNeed() - 1) {
    sfx.combo(E.combo);
    callout("Super almost ready!", $("b-me"), "#F2762E", -0.95);
  }
  await (fin ? superAttack(m) : attack(m));
  if (gen !== BG) return;
  if (fin) {
    E.combo = 0;
    hpBar();
  }
  if (shieldUp && E.hp > 0) {
    sfx.block();
    callout("Shield ready!", $("b-me"), "#2F7FD1", -0.1);
    await wait(700);
  }
  if (E.hp > 0) {
    await wait(300);
    if (gen !== BG) return;
    beginRound();
    return;
  }
  // win. The fight is over, so no more answers count (startCatch clears E.busy, and a second win would double the xp).
  E.phase = "won";
  // Look the dino up again: a cloud sync during the attack replaces S.owned with fresh copies, and a win added to the old copy was lost.
  o = S.owned[E.me] || o;
  const w = E.wild,
    before = lvl(o);
  o.wins = (o.wins || 0) + 1;
  o.xp = (o.xp || 0) + 1;
  save();
  sfx.win();
  const L = lvl(o),
    up = L > before,
    pk = up ? perks(me, o, L) : { lines: [] },
    big = up && pk.lines.length > 0;
  decorate($("b-me"), E.me);
  $("b-me-name").innerHTML = nameHtml(me, o);
  if (big) say("You won!");
  else
    say(
      `You won! ${up ? `Level up! Your ${me.say} is now level ${L}! ` : ""}Now spell the word to catch the ${w.say}!`,
    );
  await knockout();
  if (gen !== BG) return;
  if (big) {
    await celebrate(E.me, L);
    startCatch(`Now spell the word to catch the ${w.say}!`);
    return;
  }
  if (up) {
    callout(`Level ${L}!`, $("b-me"), "#F2762E", -0.5);
    sfx.yay();
  }
  await wait(up ? 2200 : 1400);
  startCatch("");
}
