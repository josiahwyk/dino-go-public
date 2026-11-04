/* ---------- Pictures (IndexedDB, this device only) ---------- */
const IMG = {}; // id -> objectURL
const JPG = new Set(); // uploaded pictures still on a white background (older uploads)
let db = null;
function openDB() {
  return new Promise((res) => {
    try {
      const r = indexedDB.open("dinogo", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("img");
      r.onsuccess = () => {
        db = r.result;
        res(db);
      };
      r.onerror = () => res(null);
    } catch (e) {
      res(null);
    }
  });
}
function idb(mode, fn) {
  return new Promise((res) => {
    if (!db) return res(null);
    try {
      const tx = db.transaction("img", mode);
      const st = tx.objectStore("img");
      const out = fn(st);
      tx.oncomplete = () => res(out && out.result !== undefined ? out.result : true);
      tx.onerror = () => res(null);
    } catch (e) {
      res(null);
    }
  });
}
async function loadImgs() {
  await openDB();
  if (!db) return;
  await new Promise((res) => {
    try {
      const tx = db.transaction("img", "readonly");
      const c = tx.objectStore("img").openCursor();
      c.onsuccess = () => {
        const cur = c.result;
        if (cur) {
          IMG[cur.key] = URL.createObjectURL(cur.value);
          if (cur.value && cur.value.type === "image/jpeg") JPG.add(cur.key);
          cur.continue();
        } else res();
      };
      c.onerror = () => res();
    } catch (e) {
      res();
    }
  });
}
async function putImg(id, blob) {
  if (IMG[id]) URL.revokeObjectURL(IMG[id]);
  IMG[id] = URL.createObjectURL(blob);
  JPG[blob.type === "image/jpeg" ? "add" : "delete"](id);
  await idb("readwrite", (st) => st.put(blob, id));
}
async function getBlob(id) {
  return await idb("readonly", (st) => st.get(id));
}
async function delImg(id) {
  if (IMG[id]) URL.revokeObjectURL(IMG[id]);
  delete IMG[id];
  JPG.delete(id);
  await idb("readwrite", (st) => st.delete(id));
}
// Built-in art is cut out of its white background (tools/cutout.py makes dinos/<id>.webp)
const ART_V = "3"; // bump when a picture changes but keeps its file name, so devices don't show a cached old copy
const src = (id) => IMG[id] || (BUILTIN.has(id) ? "dinos/" + id + ".webp?v=" + ART_V : null);
const hasArt = (id) => !!src(id);
// Attack pose shown during a lunge (built-in art only; uploaded pictures keep their one pose)
const atkSrc = (id) => (!IMG[id] && BUILTIN.has(id) ? "dinos/" + id + "_attack.webp?v=" + ART_V : null);
const ATK_OK = new Set(); // poses that have finished loading
function preloadAtk(id) {
  const a = atkSrc(id);
  if (!a || ATK_OK.has(id)) return;
  const i = new Image();
  i.onload = () => ATK_OK.add(id);
  i.src = a;
}

function art(el, sp) {
  el.innerHTML = "";
  const s = src(sp.id);
  const ph = () => {
    [...el.children].forEach((c) => {
      if (c.tagName === "IMG" || c.classList.contains("ph")) c.remove();
    });
    el.insertAdjacentHTML(
      "afterbegin",
      `<div class="ph" style="--c:var(--t-${sp.type})"><span class="e">${TYPES[sp.type].e}</span><span class="n">${sp.name}</span></div>`,
    );
  };
  if (!s) return ph();
  const i = new Image();
  i.alt = sp.name;
  i.decoding = "async";
  i.onerror = ph;
  if (IMG[sp.id] && JPG.has(sp.id)) i.className = "jpg";
  i.src = s;
  el.appendChild(i);
}
const pill = (el, sp) => {
  el.className = "pill t-" + sp.type;
  el.textContent = TYPES[sp.type].label;
};
