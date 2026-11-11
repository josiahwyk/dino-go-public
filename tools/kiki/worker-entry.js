// Source of game/js/kiki/kiki-worker.js: the Kiki voice, run in a Web Worker so speech never freezes the game.
// KittenTTS nano 0.8 (int8, voice "Kiki" = expr-voice-5-f) on onnxruntime-web (wasm, one thread), with
// espeak-ng (phonemizer) turning text into sounds.
//
// To rebuild (in an empty folder; nothing is installed in this repo):
//   npm install kitten-tts-js@0.1.2 esbuild@0.24.0
//   In node_modules/phonemizer/dist/phonemizer.js replace
//       C=[];for await(const A of e)C.push(A);const a=await new Blob(C).arrayBuffer();
//     with
//       a=await new Response(e).arrayBuffer();
//     (iPhone Safari cannot loop over a stream with "for await", so Kiki never started there.)
//   cp <repo>/tools/kiki/worker-entry.js entry.js
//   npx esbuild entry.js --bundle --format=iife --platform=browser --minify --target=safari15 \
//     --alias:onnxruntime-node=$PWD/node_modules/onnxruntime-web/dist/ort.wasm.bundle.min.mjs \
//     --alias:onnxruntime-web=$PWD/node_modules/onnxruntime-web/dist/ort.wasm.bundle.min.mjs \
//     --external:fs --external:path --external:os --external:module --outfile=<repo>/game/js/kiki/kiki-worker.js
// The other files in game/js/kiki/: kiki-runtime.wasm and ort-wasm-simd-threaded.mjs are copied from
// onnxruntime-web/dist; kiki-model-N.txt is the model (huggingface.co/KittenML/kitten-tts-nano-0.8-int8) as base64,
// split in three because the page host serves text but not raw binary and caps file size; kiki-voice.txt is the
// one voice's style table (400 x 256 float32) as base64.
import * as ort from "./node_modules/onnxruntime-web/dist/ort.wasm.bundle.min.mjs";
import { KittenTTS } from "./node_modules/kitten-tts-js/src/kitten-tts.js";

const VOICE = "expr-voice-5-f";
const BASE = new URL("./", self.location.href).href;
let tts = null;

async function fetchBytes(url, onBytes) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} loading ${url}`);
  if (!r.body) {
    const b = new Uint8Array(await r.arrayBuffer());
    onBytes(b.length);
    return b;
  }
  const reader = r.body.getReader(),
    parts = [];
  let n = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parts.push(value);
    n += value.length;
    onBytes(value.length);
  }
  const out = new Uint8Array(n);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

// Decodes base64 text straight into `out` at `at`; returns the number of bytes written.
function b64Into(bytes, out, at) {
  const CH = 1 << 19; // a multiple of 4, so each slice decodes on its own
  const dec = new TextDecoder("ascii");
  let o = at;
  for (let i = 0; i < bytes.length; i += CH) {
    const bin = atob(dec.decode(bytes.subarray(i, i + CH)));
    for (let j = 0; j < bin.length; j++) out[o++] = bin.charCodeAt(j);
  }
  return o - at;
}

// The unpacked voice is kept on the device (IndexedDB), so only the first visit downloads it.
const DB = "dinogo-kiki";
function idb(mode, fn) {
  return new Promise((res, rej) => {
    const open = indexedDB.open(DB, 1);
    open.onupgradeneeded = () => open.result.createObjectStore("files");
    open.onerror = () => rej(open.error);
    open.onsuccess = () => {
      const tx = open.result.transaction("files", mode),
        rq = fn(tx.objectStore("files"));
      tx.oncomplete = () => res(rq && rq.result);
      tx.onerror = tx.onabort = () => rej(tx.error);
    };
  });
}
const idbGet = (k) => idb("readonly", (s) => s.get(k)).catch(() => null);
const idbSet = (k, v) => idb("readwrite", (s) => s.put(v, k)).catch(() => {});

async function load() {
  const m = await (await fetch(BASE + "kiki-manifest.json")).json();
  let files = await idbGet("voice");
  let from = "device";
  if (!files || files.version !== m.version) {
    from = "download";
    let got = 0;
    const tick = (n) => {
      got += n;
      self.postMessage({ progress: Math.min(1, got / m.total) });
    };
    const wasm = await fetchBytes(BASE + m.wasm, tick);
    const voiceTxt = await fetchBytes(BASE + m.voice.file, tick);
    // One part at a time, decoded and dropped, so only one copy of the model is ever held.
    const model = new Uint8Array(m.bytes);
    let o = 0;
    for (const p of m.parts) o += b64Into(await fetchBytes(BASE + p, tick), model, o);
    if (o !== m.bytes) throw new Error(`model is ${o} bytes, expected ${m.bytes}`);
    const voice = new Uint8Array(m.voice.shape[0] * m.voice.shape[1] * 4);
    b64Into(voiceTxt, voice, 0);
    files = { version: m.version, wasm: wasm.buffer, model: model.buffer, voice: voice.buffer };
  }
  ort.env.wasm.numThreads = 1;
  ort.env.wasm.proxy = false;
  ort.env.wasm.wasmPaths = BASE;
  ort.env.wasm.wasmBinary = files.wasm;
  const session = await ort.InferenceSession.create(new Uint8Array(files.model), {
    executionProviders: ["wasm"],
    graphOptimizationLevel: "basic",
  });
  const voices = { [VOICE]: { data: new Float32Array(files.voice), shape: m.voice.shape } };
  tts = new KittenTTS(session, voices, m.config);
  await make("Ready,"); // warm up, so the first real line is not the slow one
  if (from === "download") idbSet("voice", files); // only once it has been proved to work
  return from;
}

// Cut the silence the model puts round each sentence, keeping a short pad.
function trim(a, rate) {
  const th = 0.012,
    pad = Math.round(rate * 0.04);
  let s = 0,
    e = a.length - 1;
  while (s < e && Math.abs(a[s]) < th) s++;
  while (e > s && Math.abs(a[e]) < th) e--;
  return a.subarray(Math.max(0, s - pad), Math.min(a.length, e + pad));
}

// Sentences are made one at a time so speech can start after the first. A very short one ("Oh no!") is
// joined to the next: alone it finishes long before the next is ready, which left a gap mid-line.
const SHORT = 14;
function sentences(text) {
  const out = [];
  let carry = "";
  for (const c of tts._chunkText(text)) {
    const s = carry ? `${carry} ${c}` : c;
    if (c.length < SHORT) carry = s;
    else {
      out.push(s);
      carry = "";
    }
  }
  if (carry) out.push(carry);
  return out;
}

// The game repeats itself ("You won!", "Oops!", the same word three times), so made sentences are kept.
const made = new Map(),
  KEEP = 80;
async function make(c) {
  let a = made.get(c);
  if (!a) {
    const inputs = await tts._prepareInputs(c, VOICE, 1.0, true);
    a = trim(await tts._runInference(inputs), tts.sampleRate).slice();
    made.set(c, a);
    if (made.size > KEEP) made.delete(made.keys().next().value);
  }
  return a;
}

// Messages in: {say: id, text, flush}. flush drops everything asked before it (the game moved on).
// Messages out: {ready, from} | {failed} | {progress} | {id, samples, rate} per sentence | {id, done} | {id, error}.
let jobs = [],
  busy = false,
  dead = 0; // ids up to this one are abandoned
async function work() {
  if (busy) return;
  busy = true;
  while (jobs.length) {
    const { id, text } = jobs.shift();
    try {
      for (const c of sentences(text)) {
        if (id <= dead) break;
        const a = (await make(c)).slice(); // a copy: the buffer is handed over to the page
        if (id <= dead) break;
        self.postMessage({ id, samples: a, rate: tts.sampleRate }, [a.buffer]);
      }
      self.postMessage({ id, done: true });
    } catch (e) {
      self.postMessage({ id, error: String((e && e.message) || e) });
    }
  }
  busy = false;
}
self.onmessage = ({ data }) => {
  if (!data || !tts) return;
  if (data.flush) {
    dead = data.say - 1;
    jobs = [];
  }
  jobs.push({ id: data.say, text: data.text });
  work();
};

load().then(
  (from) => self.postMessage({ ready: true, from }),
  (e) => self.postMessage({ failed: String((e && e.message) || e) }),
);
