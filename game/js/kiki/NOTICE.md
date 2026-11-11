# Third-party software in the Kiki voice

The files in this folder are the narrator voice for Dino Go. They are other people's work, built together
into a form a browser can run. The game's own code talks to them only by sending text to a worker
(`kiki-worker.js`) and getting audio back. This file lists each part, its licence and where its source is.
The full licence texts are in `licenses/`.

Nothing here is covered by Dino Go's own licence: each part keeps its own.

## What is in each file

| File | Contains |
|---|---|
| `kiki-worker.js` | eSpeak NG (inside phonemizer.js), kitten-tts-js, onnxruntime-web's JavaScript, JSZip, and a small Dino Go wrapper |
| `kiki-runtime.wasm`, `ort-wasm-simd-threaded.mjs` | ONNX Runtime Web, unmodified |
| `kiki-model-1.txt`, `kiki-model-2.txt`, `kiki-model-3.txt` | The KittenTTS nano 0.8 (int8) model, base64-encoded and split in three, otherwise unmodified |
| `kiki-voice.txt` | One voice ("Kiki", `expr-voice-5-f`) taken from the model's `voices.npz`, base64-encoded |
| `kiki-manifest.json` | Sizes and settings for the files above, including the model's own `config.json` |

## The parts

### eSpeak NG — GPL-3.0-or-later
Turns text into speech sounds (phonemes). It is included as compiled WebAssembly inside phonemizer.js.

- Copyright: the eSpeak NG authors (Reece H. Dunn and contributors), based on eSpeak by Jonathan Duddington
- Source: https://github.com/espeak-ng/espeak-ng
- Licence text: `licenses/GPL-3.0.txt`

Because eSpeak NG is under the GNU General Public License, you may copy, change and pass on `kiki-worker.js`
under the terms of that licence. The source for everything in that file is at the links in this notice, and
the exact steps used to build it, including the one change described below, are in
`tools/kiki/worker-entry.js` in the Dino Go repository.

### phonemizer.js 1.2.1 — Apache-2.0
The JavaScript wrapper that carries eSpeak NG.

- Copyright: Xenova
- Source: https://github.com/xenova/phonemizer.js
- Licence text: `licenses/Apache-2.0.txt`
- **Changed for Dino Go:** one statement that unpacks eSpeak NG's data was rewritten, from a `for await`
  loop over a stream to `new Response(stream).arrayBuffer()`, because iPhone and iPad browsers cannot run
  the original. It does the same thing.

### KittenTTS nano 0.8 (model and voices) — Apache-2.0
The voice model itself.

- Copyright: KittenML / Stellon Labs
- Source: https://github.com/KittenML/KittenTTS and https://huggingface.co/KittenML/kitten-tts-nano-0.8-int8
- Licence text: `licenses/Apache-2.0.txt`
- **Changed for Dino Go:** re-encoded as base64 text and split into parts; only one of the eight voices is
  included. The model's contents are unchanged.

### kitten-tts-js 0.1.2 — Apache-2.0
An unofficial JavaScript port of KittenTTS, used to run the model.

- Copyright: Algiras; the original KittenTTS is copyright KittenML / Stellon Labs
- Source: https://github.com/Algiras/kitten-tts-js
- Licence text: `licenses/Apache-2.0.txt`; its own notice is `licenses/NOTICE-kitten-tts-js.txt`
- Unmodified. Dino Go calls a few of its internal functions directly (see `tools/kiki/worker-entry.js`).

### ONNX Runtime Web 1.22.0-dev.20250409 — MIT
Runs the model in the browser.

- Copyright: Microsoft Corporation
- Source: https://github.com/microsoft/onnxruntime
- Licence text: `licenses/MIT-onnxruntime.txt`
- Unmodified.

### JSZip 3.10 — MIT (used under its MIT option)
Pulled in by kitten-tts-js; Dino Go does not call it. JSZip is offered under MIT or GPL-3.0; it is used here
under MIT. It includes pako (MIT).

- Copyright: Stuart Knightley, David Duponchel, Franz Buchinger, António Afonso
- Source: https://github.com/Stuk/jszip
- Licence text: `licenses/LICENSE-jszip.txt`

### Dino Go's wrapper
The loading, storage and sentence-joining code around these parts is `tools/kiki/worker-entry.js`.
