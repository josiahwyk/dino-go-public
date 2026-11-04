/* ---------- Encounter ---------- */
// Everything one encounter keeps (wild dino appears, battle, catch). Made fresh each time, so nothing leaks from the last one.
function newEncounter(wild, rematch = false) {
  return {
    wild,
    rematch,
    first: false, // their very first dino: no battle, straight to the catch
    // Battle (startBattle fills these in)
    me: null, // id of the dino they battle with
    hp: 0, // the wild dino's health
    maxHp: 0,
    turn: 0, // right answers so far (the fight ends on the S.hits-th)
    myHp: 0, // their dino's health
    myMax: 0,
    wildDmg: 0, // what a landed wind-up costs their dino
    round: 0,
    phase: "", // "menu" (pick a move), "q" (answer the question) or "won"
    busy: false, // an animation is playing, so taps are ignored
    menuSay: "", // what the 🔊 button repeats on the move menu
    slot: 0, // the move they picked (0 basic, 1 second, 2 special)
    q: null, // the question being asked
    miss: 0, // wrong taps on this question
    combo: 0, // super meter
    shield: false, // shield ready
    shieldN: 0, // shield pips
    wind: "", // the move the wild dino is winding up
    windSlot: 0,
    // Catch
    word: "", // the word to spell
    pos: 0, // letters placed so far
    lm: 0, // wrong taps on this letter
    challenge: false, // it's a challenge word
  };
}
let E = newEncounter(null);
// Wild dinos are only ones they haven't caught yet. Once they have every dino that has art, repeats are allowed again (shown as "Rematch!").
function pickWild() {
  let pool = SPECIES.filter((s) => hasArt(s.id));
  if (!pool.length) pool = SPECIES;
  const fresh = pool.filter((s) => !S.owned[s.id]);
  const from = fresh.length ? fresh : pool;
  let w = from[rand(from.length)];
  if (from.length > 1 && w.id === S.lastWild) w = pick(from.filter((s) => s.id !== S.lastWild));
  S.lastWild = w.id;
  return w;
}
function startEncounter(chosen) {
  const wild = chosen || pickWild();
  S.lastWild = wild.id;
  E = newEncounter(wild, !!S.owned[wild.id]);
  setScene(SCENE_FOR[wild.type]);
  const owned = Object.keys(S.owned);
  const intro = `${E.rematch ? "Rematch! " : ""}A wild ${wild.say} appeared!`;
  if (!owned.length) {
    E.first = true;
    startCatch(intro + " Catch your very first dino!");
    return;
  }
  if (owned.length === 1) {
    startBattle(owned[0], intro);
    return;
  }
  $("p-title").textContent = `${E.rematch ? "Rematch! " : ""}A wild ${wild.name}! Who will battle?`;
  const g = $("pick-grid");
  g.innerHTML = "";
  owned
    .sort((a, b) => lvl(S.owned[b]) - lvl(S.owned[a]))
    .forEach((id) => {
      const sp = BY[id],
        o = S.owned[id],
        b = document.createElement("button"),
        a = document.createElement("div");
      a.className = "art";
      art(a, sp);
      decorate(a, id);
      b.append(a);
      b.insertAdjacentHTML(
        "beforeend",
        `<span>${fullName(sp, o)}</span><small>Level ${lvl(o)} · ${slotsOf(o).length} ${slotsOf(o).length === 1 ? "move" : "moves"}</small>`,
      );
      b.onclick = () => startBattle(id, "");
      g.appendChild(b);
    });
  show("s-pick");
  say(intro + " Who will battle?");
}
