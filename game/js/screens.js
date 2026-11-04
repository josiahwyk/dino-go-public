/* ---------- Screens ---------- */
function show(id) {
  document.querySelectorAll(".screen").forEach((s) => (s.hidden = s.id !== id));
  window.scrollTo(0, 0);
  drawScene();
}
document.querySelectorAll("[data-home]").forEach(
  (b) =>
    (b.onclick = () => {
      try {
        speechSynthesis.cancel();
      } catch (e) {
        console.warn("Dino Go:", e);
      }
      goHome();
    }),
);

function goHome() {
  BG++;
  $("cele").hidden = true;
  const team = $("h-team");
  team.innerHTML = "";
  // Up to 4 dinos they haven't caught yet, as "?" shadows. Tapping one finds that dino.
  const hiding = shuffle(SPECIES.filter((s) => hasArt(s.id) && !S.owned[s.id])).slice(0, 4);
  $("h-tease").textContent = hiding.length ? "Who's hiding? Tap one!" : "You found them all! Tap Find for a Rematch!";
  $("h-tease").hidden = !hiding.length && !Object.keys(S.owned).length;
  hiding.forEach((sp, i) => {
    const b = document.createElement("button"),
      a = document.createElement("div");
    b.className = "mystery";
    b.style.animationDelay = -i * 0.65 + "s";
    b.setAttribute("aria-label", "Mystery dino");
    a.className = "art";
    art(a, sp);
    a.querySelectorAll("img").forEach((im) => (im.alt = ""));
    b.append(a);
    b.insertAdjacentHTML("beforeend", '<span class="qm" aria-hidden="true">?</span>');
    b.onclick = () => startEncounter(sp);
    team.appendChild(b);
  });
  if (!hiding.length) {
    const ids = Object.keys(S.owned)
      .sort((a, b) => (S.owned[b].t || 0) - (S.owned[a].t || 0))
      .slice(0, 4);
    if (!ids.length) team.innerHTML = '<div class="egg-hero" aria-hidden="true"></div>';
    ids.forEach((id) => {
      const d = document.createElement("div");
      d.className = "art";
      art(d, BY[id]);
      decorate(d, id);
      team.appendChild(d);
    });
  }
  $("h-count").textContent = `${Object.keys(S.owned).length}/40`;
  setScene(Object.keys(SCENES));
  show("s-home");
}
