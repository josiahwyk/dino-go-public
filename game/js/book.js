/* ---------- Dino book + stats ---------- */
function openBook(quiet) {
  const b = $("book");
  b.innerHTML = "";
  let n = 0;
  SPECIES.forEach((sp) => {
    const o = S.owned[sp.id],
      btn = document.createElement("button"),
      a = document.createElement("div");
    a.className = "art";
    if (o) {
      n++;
      art(a, sp);
      decorate(a, sp.id);
      btn.append(a);
      btn.insertAdjacentHTML("beforeend", `<span>${sp.name}</span>`);
      btn.onclick = () => openSheet(sp.id);
    } else {
      btn.className = "empty";
      a.textContent = "?";
      btn.append(a);
      btn.insertAdjacentHTML("beforeend", `<span>No. ${sp.n}</span>`);
      btn.onclick = () => say("Not caught yet. Keep looking!");
    }
    b.appendChild(btn);
  });
  $("b-count").textContent = `${n}/40`;
  show("s-book");
  if (quiet !== true) say(n ? `You have ${n} dinos! Tap one to see it.` : "No dinos yet. Go find one!");
}
let sheetSp = null;
function openSheet(id) {
  const sp = BY[id],
    o = S.owned[id],
    L = lvl(o);
  sheetSp = sp;
  art($("sh-art"), sp);
  decorate($("sh-art"), id);
  $("sh-name").textContent = fullName(sp, o);
  pill($("sh-type"), sp);
  const st = [
    ["Level", L],
    ["Health", sp.hp + (L - 1) * 2],
    ["Attack", sp.atk + (L - 1)],
    ["Wins", o.wins || 0],
    ["Caught", o.caught || 1],
  ];
  $("sh-stats").innerHTML = st.map(([k, v]) => `<div class="stat"><b>${v}</b><small>${k}</small></div>`).join("");
  const mv = movesOf(sp),
    nx = NEXT_PERK.find(([n]) => n > L);
  $("sh-facts").innerHTML = [
    ["Moves", MOVE_SLOTS.map((m, i) => (L >= m.need ? mv[i] : `🔒 Level ${m.need}`)).join(" · ")],
    [
      "Shield",
      `Charges after ${shieldNeed(o)} right answers${startsShielded(o) ? ", and every fight starts with one" : ""}`,
    ],
    ...(nx ? [["Next", `Level ${nx[0]}: ${nx[1]}`]] : []),
    ["Size", sp.len],
    ["Ate", sp.food],
    ["Lived", sp.when],
    ["Found in", sp.where],
    ["Fun fact", sp.fun],
  ]
    .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`)
    .join("");
  $("sheet-bg").hidden = false;
  readSheet();
}
function readSheet() {
  const sp = sheetSp,
    o = S.owned[sp.id];
  say(`${fullSay(sp, o)}. A ${TYPES[sp.type].label}. Level ${lvl(o)}. ${sp.len}. It lived ${sp.when}. ${sp.fun}`);
}
$("sh-say").onclick = readSheet;
$("sh-close").onclick = () => {
  $("sheet-bg").hidden = true;
  try {
    speechSynthesis.cancel();
  } catch (e) {
    console.warn("Dino Go:", e);
  }
};
$("sheet-bg").onclick = (e) => {
  if (e.target.id === "sheet-bg") $("sh-close").onclick();
};
$("k-again").onclick = () => startEncounter();
$("k-book").onclick = openBook;
$("find").onclick = () => startEncounter();
$("to-book").onclick = () => openBook();
