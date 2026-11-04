/* ---------- Cloud save (claude.ai account, syncs iPad <-> iPhone) ---------- */
// Device save (localStorage) stays as the offline copy. When signed in, the same
// state lives in this account's private db doc; both sides are merged so
// dinos caught on either device are kept.
let cloudRef = null,
  cloudBusy = false,
  cloudAgain = false,
  cloudMsg = "Saved on this device only.";
function syncNote(m) {
  cloudMsg = m;
  const el = $("p-sync");
  if (el) el.textContent = m;
}
// Compares saves by content, whatever order their keys are in (two devices, or the db, can list the same dinos in a different order).
// Comparing JSON strings made two open devices push back and forth forever.
const canon = (v) =>
  Array.isArray(v)
    ? "[" + v.map(canon).join(",") + "]"
    : v && typeof v === "object"
      ? "{" +
        Object.keys(v)
          .filter((k) => v[k] !== undefined)
          .sort()
          .map((k) => JSON.stringify(k) + ":" + canon(v[k]))
          .join(",") +
        "}"
      : JSON.stringify(v);
const sameExceptU = (a, b) => {
  const x = { ...a },
    y = { ...b };
  delete x.u;
  delete y.u;
  return canon(x) === canon(y);
};
function mergeSaves(a, b) {
  const newer = (a.u || 0) >= (b.u || 0) ? a : b,
    older = newer === a ? b : a,
    reset = Math.max(a.reset || 0, b.reset || 0);
  const out = JSON.parse(JSON.stringify(newer));
  out.reset = reset || undefined;
  out.owned = {};
  new Set([...Object.keys(a.owned || {}), ...Object.keys(b.owned || {})]).forEach((id) => {
    const x = (newer.owned || {})[id],
      y = (older.owned || {})[id];
    if (x && y)
      out.owned[id] = {
        xp: Math.max(x.xp || 0, y.xp || 0),
        wins: Math.max(x.wins || 0, y.wins || 0),
        caught: Math.max(x.caught || 1, y.caught || 1),
        t: Math.max(x.t || 0, y.t || 0),
      };
    else {
      const o = x || y;
      if (x || (o.t || 0) > reset) out.owned[id] = JSON.parse(JSON.stringify(o));
    }
  });
  return out;
}
async function cloudPush() {
  if (!cloudRef) return;
  if (cloudBusy) {
    cloudAgain = true;
    return;
  }
  cloudBusy = true;
  try {
    await cloudRef.set({ s: JSON.parse(JSON.stringify(S)), u: S.u || 0 });
    syncNote("Synced to your claude.ai account ✓");
  } catch (e) {
    if ((e && e.code === "invalid_argument") || (e && e.code === "revoked")) {
      cloudRef = null;
      syncNote("Saved on this device only (this account can't sync here).");
    } else syncNote("Saved on this device. Will sync when back online.");
  }
  cloudBusy = false;
  if (cloudAgain) {
    cloudAgain = false;
    cloudPush();
  }
}
function refreshScreen() {
  const vis = [...document.querySelectorAll(".screen")].find((x) => !x.hidden);
  if (!vis) return;
  if (vis.id === "s-home") goHome();
  else if (vis.id === "s-book") openBook(true);
  else if (vis.id === "s-parent") {
    $("p-words").value = (S.words || []).join(", ");
    syncMath();
  }
  // battle/catch screens pick it up on the way home
}
(async () => {
  try {
    if (!window.claude || !claude.use) return;
    const [cdb, user] = await Promise.all([claude.use("db"), claude.use("user")]);
    const uid = user && (await user.id());
    if (!cdb || !uid) {
      syncNote("Saved on this device only. Open while signed in to claude.ai to sync devices.");
      return;
    }
    const ref = cdb.doc("data/users/" + uid + "/dinogo");
    ref.onSnapshot(
      (snap) => {
        if (snap.metadata.hasPendingWrites) return;
        const r = snap.exists && snap.data() && snap.data().s;
        if (!cloudRef) {
          cloudRef = ref;
        }
        if (!r) {
          if (Object.keys(S.owned).length || S.u) {
            save();
          } else syncNote("Synced to your claude.ai account ✓");
          return;
        }
        if ((r.u || 0) === (S.u || 0)) {
          syncNote("Synced to your claude.ai account ✓");
          return;
        }
        const m = mergeSaves(S, r),
          changed = !sameExceptU(m, S);
        Object.assign(S, normalizeSave({ ...S, ...m }));
        if (!m.reset) delete S.reset;
        try {
          localStorage.setItem(KEY, JSON.stringify(S));
        } catch (e) {
          console.warn("Dino Go:", e);
        }
        if (changed) refreshScreen();
        // push back if this device had something the cloud copy didn't
        if (canon(m.owned) !== canon(r.owned || {}) || (S.u || 0) > (r.u || 0)) {
          S.u = Math.max(S.u || 0, r.u || 0) + 1;
          cloudPush();
        } else syncNote("Synced to your claude.ai account ✓");
      },
      (e) => {
        cloudRef = null;
        syncNote("Saved on this device only (sync paused). Reopen the game to retry.");
      },
    );
  } catch (e) {
    syncNote("Saved on this device only.");
  }
})();
