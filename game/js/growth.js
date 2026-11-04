/* ---------- Levels, moves and growth (everything here is worked out from the saved xp, nothing extra is saved) ---------- */
// Every dino has all 3 moves from level 1 (2026-11-04: he doesn't follow levels yet, so the reward is the bigger hits and the super move).
// Level perks: L3 "Brave", L4 shield after 2, L5 "Mighty" + glow, L8 free shield each fight, L10 "Legendary" + golden aura.
const MOVE_NAMES = {
  // [basic, second, special]; dinos not listed use their type's set in MOVE_DEFAULT
  "01_triceratops": ["Horn poke", "Horn charge", "Triple horn storm"],
  "02_stegosaurus": ["Tail flick", "Spike swing", "Thagomizer smash"],
  "03_brachiosaurus": ["Neck bonk", "Big stomp", "Sky-high slam"],
  "04_ankylosaurus": ["Club tap", "Club swing", "Mega club smash"],
  "05_parasaurolophus": ["Crest toot", "Echo honk", "Thunder honk"],
  "06_diplodocus": ["Tail tap", "Tail whip", "Thunder whip"],
  "07_iguanodon": ["Thumb jab", "Thumb spike", "Spike storm"],
  "08_pachycephalosaurus": ["Head bonk", "Dome bash", "Mega headbutt"],
  "09_styracosaurus": ["Spike poke", "Spike charge", "Crown crash"],
  "10_argentinosaurus": ["Foot tap", "Giant stomp", "Earth shaker"],
  "11_protoceratops": ["Beak nip", "Frill bash", "Desert dash"],
  "12_kentrosaurus": ["Back spike", "Tail spikes", "Spike spin"],
  "13_edmontosaurus": ["Quick nip", "Stampede", "Herd rush"],
  "14_corythosaurus": ["Crest bump", "Echo call", "Helmet crash"],
  "15_therizinosaurus": ["Claw swipe", "Long slash", "Claw storm"],
  "16_amargasaurus": ["Spine poke", "Spine whip", "Spine storm"],
  "17_psittacosaurus": ["Parrot peck", "Beak snap", "Feather dash"],
  "18_maiasaura": ["Gentle bump", "Mama stomp", "Mighty mama roar"],
  "19_muttaburrasaurus": ["Nose bump", "Outback charge", "Mighty bash"],
  "20_minmi": ["Armour bump", "Spiny roll", "Armour spin"],
  "21_trex": ["Quick bite", "Crunchy chomp", "Mega chomp"],
  "22_velociraptor": ["Claw scratch", "Pounce", "Raptor frenzy"],
  "23_spinosaurus": ["Fin flick", "Water snap", "Sail slam"],
  "24_allosaurus": ["Quick bite", "Claw rake", "Hunter pounce"],
  "25_carnotaurus": ["Horn poke", "Bull charge", "Horn storm"],
};
const MOVE_DEFAULT = {
  plant: ["Tail swipe", "Head bump", "Big stomp"],
  meat: ["Quick bite", "Claw slash", "Mega chomp"],
  sea: ["Splash", "Tail slap", "Wave crash"],
  fly: ["Wing flap", "Dive bomb", "Wing gust"],
};
const movesOf = (sp) => MOVE_NAMES[sp.id] || MOVE_DEFAULT[sp.type];
// Slot 0 basic, 1 second, 2 special. dq: how much harder than his maths level the question is. power: share of the wild dino's remaining health
// (see hitDamage). The number of right answers to win never changes, whichever moves he picks.
const MOVE_SLOTS = [
  { need: 1, power: 1, dq: -1, stars: 1, charge: 1, tag: "Easy question", icon: "⚡", style: "nip", size: 1 },
  { need: 1, power: 1.6, dq: 0, stars: 2, charge: 1, tag: "Medium question", icon: "💥", style: "charge", size: 1.25 },
  {
    need: 1,
    power: 2.4,
    dq: 1,
    stars: 3,
    charge: 2,
    tag: "Hard question · super charges ×2",
    icon: "🌟",
    style: "jump",
    size: 1.6,
  },
];
const FIN_POWER = 3.4;
// Super meter (E.combo): a right-first-time answer adds the move's charge (the hard move adds 2), the first wrong tap on a question takes 1 away.
// Full at 3, so a 6-answer battle can have 2 supers (more with hard moves). The number of right answers to win never changes.
const finNeed = () => 3;
const slotsOf = (o) => MOVE_SLOTS.map((m, i) => i).filter((i) => lvl(o) >= MOVE_SLOTS[i].need);
const titleFor = (L) => (L >= 10 ? "Legendary" : L >= 5 ? "Mighty" : L >= 3 ? "Brave" : "");
const titleOf = (o) => titleFor(lvl(o));
const fullName = (sp, o) => {
  const t = o ? titleOf(o) : "";
  return t ? `${t} ${sp.name}` : sp.name;
};
const fullSay = (sp, o) => {
  const t = o ? titleOf(o) : "";
  return t ? `${t} ${sp.say}` : sp.say;
};
const shieldNeed = (o) => (lvl(o) >= 4 ? 2 : 3);
const startsShielded = (o) => lvl(o) >= 8;
// New things a level gives him: returned as spoken/written lines. title = the name changes (evolution celebration).
function perks(sp, o, L) {
  const out = [],
    t = { 3: "Brave", 5: "Mighty", 10: "Legendary" }[L];
  if (t) out.push(`New name: ${t} ${sp.name}`);
  if (L === 4) out.push("Your shield charges after 2 right answers");
  if (L === 8) out.push("Every fight starts with a shield");
  if (L === 5) out.push("It glows now");
  if (L === 10) out.push("A golden glow");
  return { title: t, lines: out };
}
const NEXT_PERK = [
  [3, "a new name"],
  [4, "a faster shield"],
  [5, "a new name and a glow"],
  [8, "a free shield each fight"],
  [10, "a golden glow"],
];
// Level badge and glow on a dino's picture (call after art())
function decorate(el, id, badge = true, atLevel) {
  el.classList.remove("aura5", "aura10");
  el.querySelectorAll(".lvbadge").forEach((b) => b.remove());
  const o = S.owned[id];
  if (!o) return;
  const L = atLevel || lvl(o);
  el.style.setProperty("--ac", TCOL[BY[id].type]);
  if (L >= 10) el.classList.add("aura10");
  else if (L >= 5) el.classList.add("aura5");
  if (badge) {
    const b = document.createElement("span");
    b.className = "lvbadge" + (L >= 10 ? " gold" : "");
    b.textContent = "Lv " + L;
    b.setAttribute("aria-label", "Level " + L);
    el.appendChild(b);
  }
}
const nameHtml = (sp, o) => {
  const t = titleOf(o);
  return (t ? `<span class="ttl${lvl(o) >= 10 ? " t10" : ""}">${t}</span>` : "") + sp.name;
};
