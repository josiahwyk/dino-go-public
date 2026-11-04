# Dino Go

Learning game for my kid: Pokémon-Go-style dinosaur catching. Maths battles weaken wild dinos; spelling catches them; a dino book shows stats and facts.

## Private details stay out of the repo
This repo is meant to be public. Their age and any other personal details about them live in CLAUDE.local.md (git-ignored, on this computer only). Read it, design for it, but never write their age, name, school or similar into a committed file, commit message or published page. Keep committed text gender-neutral: "my kid", "they", "the player".

## Files
No build step: the game is plain files, opened in a browser.
- game/index.html: the screens (markup only) and the list of scripts, loaded in order. game/style.css: all the styles.
- game/js/: the code, one file per part of the game. They are plain scripts sharing globals, so **order matters**: a file can only use, at load time, what files above it in index.html define (calls inside functions are fine). Load order: data/species, state (save, helpers), pictures, sound, scenes, screens, growth (levels, moves), rules, encounter, maths-y1, clues, maths-y2, maths (makeQ, skills, retry), battle-fx, battle, data/words, data/sentences, catch, spelling-battle, book, parent (grown-up screen), cloud (sync), boot.
- game/js/rules.js: the battle rules with no screen code (adaptive level, super meter, shield, retry queue, damage). battle.js does the animation, speech and saving around them. Put new game rules here so they can be tested.
- game/js/data/: species facts, word lists and the spelling sentences. Kept compact (one item per line) and left out of Prettier.
- tests/run.js: `node tests/run.js` (no installs). Plays thousands of pretend questions and battles: every question's answer is a choice, no repeated choices, every question has a clue, each kind always shows the same number of buttons, every battle takes exactly S.hits right answers, misspellings are never real words, two-device save merging keeps every dino, saves are cleaned on load. **Run it before publishing**; add a test for any new rule or generator kind. tests/harness.js loads the game's scripts in Node with a fake page.
- Formatting: `npx prettier@3.3.3 --write "game/js/**/*.js" game/style.css tests/*.js` (settings in .prettierrc.json; data files, HTML and Markdown are skipped).
- game/dinos/NN_name.webp (cut out of its white background; what the game loads) and NN_name_attack.webp (attack pose, swapped in during the battle lunge). NN_name.jpg is the 512px source. Ids match SPECIES in js/data/species.js.
- All game art must face RIGHT (their dino is drawn as-is on the left; the wild dino is flipped). Mirrored because the Gemini art faced left: 08_pachycephalosaurus (normal only) and 16_amargasaurus (attack only). Judge facing by where the head and eyes point, not the body: the normal Amargasaurus has its neck on the left but looks right, so it is NOT mirrored. Mirror again if you regenerate them from assets/, and check the facing of every new dino.
- Make cut-outs with `python3 tools/cutout.py` (needs Pillow + numpy).
- assets/dinos/NN_name.jpeg (+ _attack.jpeg): full-size originals. assets/style-reference/style-sheet.jpeg: the style all dinos copy. assets/dino_prompts.md: the 40 dinos with types and image prompts. All 40 have art (standing + attack).
- assets/originals/: the original Gemini downloads. Don't delete them.
- docs/GAME-RULES.md: how each part works and why (maths levels, question pictures, clues, spelling, voice, levels and growth, battles). Read the relevant section before changing that part, and update it when the behaviour changes.
- docs/BACKLOG.md: open ideas and fixes. Read it before planning a new feature and tick items off when they ship. docs/DESIGN-05.md: the battle design. docs/OVERWORLD-PLAN.md: Dino World (game/world.html + game/overworld.js), a separate game that doesn't use index.html.

## Live version
Published as a claude.ai artifact (opened on their iPad): https://claude.ai/artifact/Te5KgkGw2tJm9iyCkh8PDM
Publish game/index.html as the page with style.css and every js/ file in `files` (same paths), plus any changed dino art. Run the tests first.
To add a dino: add it to SPECIES (js/data/species.js), put its 512px .jpg in game/dinos/, run `python3 tools/cutout.py game/dinos/NN_name.jpg`, make the attack pose, run the tests (they check both .webp files exist), and publish the new .webp files with the page.

## Gotchas
- Never name a class "big": .big is the orange button style (a "cubes big" class turned the ones into an orange pad in v27).
- Any new question generator needs a hint ({html,say}, the answering step shown as "?"), and anything with tens or things to count follows the picture rules in docs/GAME-RULES.md (rows of 5, hidden running-count labels, checked at worst case on a phone).
- Skill keys use the generator name (index for unnamed level 1-3 lambdas), so keep QUESTIONS order stable.
- New save settings go in defaultSave()/normalizeSave() (js/state.js). New per-dino fields also need mergeSaves (js/cloud.js), which only keeps xp/wins/caught/t.
- Swallowed errors log `console.warn("Dino Go:", …)`; the game keeps going rather than stopping a child mid-battle.

## Rules
- Designed for a young child: every instruction spoken aloud (speechSynthesis), big buttons, difficulty adapts.
- Battles: each round the wild dino winds up a move, they pick one of their 3 moves (easier / their level / harder question), then answers. Right = their dino hits; wrong = the wind-up lands. Every battle takes exactly S.hits right answers. Details, the super meter and fainting are in docs/GAME-RULES.md.
- Dino facts in SPECIES haven't been checked against a source yet.
- Later scope: printed track cards (fill-in-the-blank words), NFC, evolution, raids, Cantonese.
- Idea (2026-10-17): an "explore" screen before encounters, like Pokémon: they walk a little avatar around illustrated habitats (forest, swamp, beach, volcano) and rustling bushes / footprints trigger a dino matched to that habitat. Josiah liked the feel of a 2.5D pixel RPG (top-down map, wandering, boss fights). No real GPS.
- Test every layout change at iPhone size (about 428x660 visible inside the claude.ai viewer) as well as iPad.
