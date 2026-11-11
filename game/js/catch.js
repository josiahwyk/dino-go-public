function pickWord() {
  const home = S.words && S.words.length ? S.words : DEFAULT_WORDS,
    ch = S.challenge !== false && Math.random() < 0.25,
    w = ch ? CHALLENGE : home;
  let x = w[rand(w.length)];
  if (w.length > 1 && x === S.lastWord) x = w[rand(w.length)];
  S.lastWord = x;
  save();
  E.challenge = ch;
  return x;
}

const sayWord = (w) => (SENT[w] ? `${w}... ${SENT[w].replace(/[.!?]$/, "")}... ${w}.` : `${w}.`);

function startCatch(intro) {
  const w = E.wild,
    word = pickWord();
  E.word = word;
  E.pos = 0;
  E.lm = 0;
  E.busy = false;
  art($("c-art"), w);
  $("c-title").textContent = E.first ? `Catch your first dino!` : `${E.rematch ? "Rematch! " : ""}Catch the ${w.name}!`;
  $("egg").style.setProperty("--charge", 0);
  $("egg").style.transform = "";
  const slots = $("slots");
  slots.innerHTML = "";
  for (let i = 0; i < word.length; i++) {
    const s = document.createElement("div");
    s.className = "slot";
    slots.appendChild(s);
  }
  const letters = word.split(""),
    decoys = [];
  for (const c of shuffle([...new Set(letters)]))
    for (const d of CONFUSE[c] || "") if (!letters.includes(d) && !decoys.includes(d)) decoys.push(d);
  const pool = shuffle("abcdefghijklmnoprstuvwy".split("").filter((c) => !letters.includes(c) && !decoys.includes(c)));
  const extra = shuffle(decoys).slice(0, 3).concat(pool).slice(0, 4); // 4 decoys, mostly look-alike or sound-alike letters
  letters.push(...extra);
  shuffle(letters);
  const tiles = $("tiles");
  tiles.innerHTML = "";
  letters.forEach((c) => {
    const t = document.createElement("button");
    t.className = "tile";
    t.textContent = c;
    t.dataset.c = c;
    t.onclick = () => tap(t);
    tiles.appendChild(t);
  });
  show("s-catch");
  say(`${intro} ${E.challenge ? "Challenge word! " : ""}Spell... ${sayWord(word)}`);
}
$("c-say").onclick = () => say(sayWord(E.word));
function tap(t) {
  if (E.busy || t.classList.contains("used")) return;
  const need = E.word[E.pos];
  if (t.dataset.c === need) {
    sfx.good();
    t.classList.add("used");
    document.querySelectorAll(".tile.glow").forEach((x) => x.classList.remove("glow"));
    $("slots").children[E.pos].textContent = need;
    E.pos++;
    E.lm = 0;
    $("egg").style.setProperty("--charge", E.pos / E.word.length);
    if (E.pos === E.word.length) throwEgg();
    return;
  }
  E.lm++;
  sfx.bad();
  t.classList.remove("shake");
  void t.offsetWidth;
  t.classList.add("shake");
  // The right tile only glows after 3 wrong taps; after 2 they hear the word again.
  if (E.lm >= 3) {
    const g = [...document.querySelectorAll(".tile:not(.used)")].find((x) => x.dataset.c === need);
    if (g && S.hintAnswer === true) g.classList.add("glow");
    say(`Listen... ${sayWord(E.word)}`);
  } else if (E.lm === 2) say(`Listen... ${sayWord(E.word)}`);
  else say("Try again!");
}
async function throwEgg() {
  E.busy = true;
  const egg = $("egg"),
    a = $("c-art");
  const er = egg.getBoundingClientRect(),
    ar = a.getBoundingClientRect();
  const dx = ar.left + ar.width / 2 - (er.left + er.width / 2),
    dy = ar.top + ar.height / 2 - (er.top + er.height / 2);
  await wait(500);
  await anim(
    egg,
    [
      { transform: "translate(0,0) rotate(0)" },
      { transform: `translate(${dx}px,${dy - 60}px) rotate(200deg)`, offset: 0.6 },
      { transform: `translate(${dx}px,${dy}px) rotate(360deg)` },
    ],
    { duration: 700, easing: "ease-out", fill: "forwards" },
  );
  await anim(
    a,
    [
      { transform: "scale(1)", opacity: 1 },
      { transform: "scale(.1)", opacity: 0 },
    ],
    { duration: 350, fill: "forwards" },
  );
  const base = `translate(${dx}px,${dy}px)`;
  await anim(
    egg,
    [
      { transform: base + " rotate(0)" },
      { transform: base + " rotate(-18deg)" },
      { transform: base + " rotate(18deg)" },
      { transform: base + " rotate(-12deg)" },
      { transform: base + " rotate(12deg)" },
      { transform: base + " rotate(0)" },
    ],
    { duration: 1200, fill: "forwards" },
  );
  sfx.catch();
  await wait(300);
  try {
    a.getAnimations().forEach((x) => x.cancel());
    egg.getAnimations().forEach((x) => x.cancel());
  } catch (e) {
    console.warn("Dino Go:", e);
  }
  caught();
}
function caught() {
  const w = E.wild;
  const o = S.owned[w.id];
  const isNew = !o,
    before = o ? lvl(o) : 1;
  if (isNew) S.owned[w.id] = { xp: 0, wins: 0, caught: 1, t: Date.now() };
  else {
    o.caught = (o.caught || 1) + 1;
    o.xp = (o.xp || 0) + 1;
    o.t = Date.now();
  }
  save();
  $("k-title").textContent = isNew ? `You caught a ${w.name}!` : `Another ${w.name}!`;
  $("k-new").hidden = !isNew;
  art($("k-art"), w);
  decorate($("k-art"), w.id);
  pill($("k-type"), w);
  $("k-fact").textContent = isNew ? w.fun : `Your ${w.name} got stronger! It's now level ${lvl(S.owned[w.id])}.`;
  show("s-caught");
  say(isNew ? `You caught a ${w.say}!` : `Another ${w.say}!`);
  // a duplicate can level it up too: celebrate new moves, shields and titles here as well
  const L = isNew ? 1 : lvl(S.owned[w.id]);
  if (L > before && perks(w, S.owned[w.id], L).lines.length)
    setTimeout(async () => {
      if (!$("s-caught").hidden) {
        await celebrate(w.id, L);
        decorate($("k-art"), w.id);
      }
    }, 2600);
}
