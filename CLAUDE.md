# Dino Go

Learning game for my son: Pokémon-Go-style dinosaur catching. Maths battles weaken wild dinos; spelling catches them; a dino book shows stats and facts.

## REMINDER: before this repo is ever made public
The repo (github.com/josiahwyk/dino-go) is PRIVATE and contains personal info. If Josiah ever wants to make it public (or share it), stop and remind him to remove or genericise first:
- His son's age and details: this file (CLAUDE.md), BACKLOG.md, assets/dino_prompts.md (age details are in CLAUDE.local.md, which is not committed).
- Names: "Josiah" in CLAUDE.md and BACKLOG.md.
- The live game link in this file (claude.ai artifact, shared with anyone who has the link): decide whether it should stay public.
- Git history: every earlier commit keeps the old text and the author email (josiahwyk@gmail.com). Deleting lines from the files is not enough. Either start a fresh public repo with a clean first commit, or rewrite history, before changing visibility.
- Root Gemini_Generated_Image*.jpeg originals and the Gemini art: check he is happy to publish them.

## Files
- game/index.html: the whole game (one HTML file, no build step). Open it in a browser to run it.
- game/dinos/NN_name.jpg: game art (512px). Ids match the SPECIES list in index.html.
- game/dinos/NN_name_attack.webp: attack pose for each dino (swapped in during the battle lunge). Full-size originals are assets/dinos/NN_name_attack.jpeg.
- All game art must face RIGHT (his dino is drawn as-is on the left; the wild dino is flipped). Mirrored because the Gemini art faced left: 08_pachycephalosaurus (normal only) and 16_amargasaurus (attack only). Judge facing by where the head and eyes point, not the body: the normal Amargasaurus has its neck on the left but looks right, so it is NOT mirrored. Mirror again if you regenerate them from assets/, and check the facing of every new dino.
- game/dinos/NN_name.webp: the same art cut out of its white background. This is what the game loads. Make it with `python3 tools/cutout.py` (needs Pillow + numpy).
- assets/dinos/NN_name.jpeg: full-size originals from Gemini. assets/style-reference/style-sheet.jpeg: the style all dinos copy.
- assets/dino_prompts.md: the 40 dinos with types and image prompts. All 40 dinos have art (standing + attack).
- Root Gemini_Generated_Image*.jpeg files are the original downloads. Don't delete them.

## Live version
Published as a claude.ai artifact (opened on his iPad): https://claude.ai/artifact/Te5KgkGw2tJm9iyCkh8PDM
To add a dino: put its 512px .jpg in game/dinos/, run `python3 tools/cutout.py game/dinos/NN_name.jpg`, add its id to the BUILTIN set in index.html, and publish the .webp with the page.

## Background scenes
drawScene() in index.html draws an SVG scene behind home, battle and catch (no art files, nothing saved). SCENES holds 7 habitats (colours kept light so text stays readable), SCENE_FOR picks battle scenes by the wild dino's type (plant: jungle/plains/swamp, meat: volcano/canyon/jungle, sea: beach/swamp, fly: cliffs/beach/canyon), PROPS draws palms, ferns, rocks and so on. setScene() is called in goHome() (any scene) and startEncounter() (by type), never the same scene twice in a row; a seed keeps the picture the same on resize/rotate. The book and grown-up screens keep the plain gradient.

## Maths
Battle questions follow the Australian Curriculum v9: see LEVELS and QUESTIONS in index.html. Twelve levels, auto-adjusting: 1-6 are Year 1 (AC9M1, number + algebra), 7-12 are Year 2 (AC9M2): place value to 1000, add/take away within 100, trading, skip counting, equal groups/arrays/halves-quarters-eighths, money and change. The parent screen can set the level and battle length (4/6/8 hits). MAXL is the top level; older saves hold 1-6 and still mean the same thing. Review questions come from any earlier level up to level 6, then only the 3 levels below. Skills (F3, 2026-11-04): S.skills["level:generatorName"]=[right first time, tries], last ~10 tries only (noteSkill); weakest(lv) picks the kind with the lowest rate (needs 2+ tries) for about 1 maths question in 3 (makeQ). Keys use the generator name (index for unnamed level 1-3 lambdas), so keep QUESTIONS order stable.
Year 1 tens pictures (tensOnes, tensOnesOther, coinStacks) use tensRun() (each ten wrapped in .rl; its running count label is hidden with .rl b{display:none} because Josiah found the labels made the bars harder to read, 2026-11-04); loose coins are real $1 coins and the broken ten is a full ten-frame. Josiah found these hard to read twice (2026-11-04): any new question with tens should do the same, and be checked at 9 tens + 9 ones on a phone so the choices stay on screen. Year 1 ones are a ten-frame of orange dots (easier to count than cubes); Year 2 pictures (bt, pv, tensTo100) use the same hidden labels, and pv puts hundreds on a top row and tens + ones below. Never name a class "big": .big is the orange button style (a "cubes big" class turned the ones into an orange pad in v27; it is "cubes lg" now).
Year 2 generators use mix() for the 4 tap choices (answer + the slip a child most often makes). Fraction answers are strings like "1/4" (drawn by fracLabel / fracSvg).

Clues and retry (F1 in BACKLOG.md, 2026-11-04): every generator returns hint {html,say} built with the Clue helpers ("Clues" section of index.html): number-line hops (jumps(): 1s for small steps, "make ten" for hops of 7-9 that cross a ten, tens then ones for big ones), counting strips, place-value charts (pvChart), the repeating unit, numbered fraction parts. The step that gives the answer is always a "?". A wrong choice is crossed out (.nope); the first miss shows the clue card (.cluecard, id "hint"; not the home-screen .hint class) over the arena (showHint/hideHint) and speaks hint.say; tapping the card or 🔊 repeats it; ✕ on the card hides it (it covers the dinos) and the 💡 button (#b-clue) next to the question brings it back. A missed question queues its generator in RETRY (memory only, not saved, max 3, each kind back at most twice); makeQ serves it 2 rounds later as a fresh question at the level it was asked ("One like before", cheered if right first time). Any new generator needs a hint too.

Answer glow: the right maths answer (after 2 wrong taps) and the right spelling tile (after 3 wrong taps) only glow if the grown-up turned on "Glow the right answer" (S.hintAnswer, off by default). Spelling still repeats the word either way.

## Spelling
Homework words come from the parent screen (S.words). PATTERNS is a built-in word bank (Year 1 and Year 2 spelling patterns) behind the "Suggest words" button: it fills the words box with ~8 words, never ones in CHALLENGE, and nothing saves until Save words. "Challenge words" is a separate setting (S.challenge) that mixes CHALLENGE words into ~1 catch in 4.

Word sentences (2026-11-04): SENT holds a short sentence for every word in PATTERNS, CHALLENGE, DEFAULT_WORDS and his homework list (544 words); sayWord(w) says "word... sentence... word" everywhere a spelling word is spoken (catch, Listen retries, spelling battles, clues). Homework words without one are said alone and listed when the grown-up taps Save words; add a line to SENT for them.

Voice (2026-11-04): pickVoice() prefers Premium, then Enhanced, Australian first; the grown-up Voice picker (renderVoices, Test button) overrides it and is saved in localStorage "dinogo.voice" on that device only (not in S, since devices have different voices). Premium/Enhanced voices use pitch 1, others 1.1.

Spelling battles (2026-11-04): grown-up setting "Battle questions" (S.battle: "math" default, "words", "mix" = about half each). makeQ() hands off to wordQ(slot) in the "Spelling questions in battle" section: easy move = one missing letter, medium = two letters side by side, hard = pick the right spelling of 4. Gaps go on vowels and never the first letter. misspell() makes the wrong spellings from real slips (wrong vowel, ie/ei swap, dropped vowel or double letter first; look-alike consonants after) and never offers a real word (known() = PATTERNS + CHALLENGE + DEFAULT_WORDS + COMMON). Spelling questions have lvl 0 so they never move the maths level; clues and "one like before" (same word) work as for maths.

## Levels and growth
Level = 1 + floor(xp/3), unchanged; everything below is worked out from saved xp, nothing extra is saved (mergeSaves only keeps xp/wins/caught/t per dino, so never put new per-dino fields there without updating it).
- All 3 moves for every dino from level 1 (Josiah, 2026-11-04: he doesn't follow levels yet; the reward is the bigger hits and the super move). L3 title "Brave", L4 shield charges after 2 right answers (3 before), L5 "Mighty" + glow, L8 every fight starts with a shield, L10 "Legendary" + golden aura.
- MOVE_NAMES (per dino, 01-25; others use MOVE_DEFAULT by type), MOVE_SLOTS (powers, question offsets, animation style), perks(), titleFor(), decorate() (badge + aura) and celebrate() (evolution overlay) are in the "Levels, moves and growth" / "Level-up celebration" sections of index.html.
- Moves are animated with code only (nip / charge / jump-spin on the existing pictures; leaves, slashes, splash, wind by type). No new art was needed.
- Adaptation: only questions at his current maths level count as before; right-first-time on a harder question also counts toward levelling up; wrong answers on harder questions never count toward "stuck"; easier ones count for nothing.

## Wild dinos
pickWild() only picks dinos he hasn't caught that have art. When he owns every one with art, repeats come back and are labelled "Rematch!" (E.rematch, nothing is saved for it).

## Rules
- Designed for a young child: every instruction spoken aloud (speechSynthesis), big buttons, difficulty adapts.
- Battles (chat 05, full design in DESIGN-05.md): each round the wild dino winds up a move (glow, "Winding up X!", no timer); he picks one of his 3 moves first (basic = one maths level easier, second = his level, special = one harder), then answers. Right answer = his dino hits and interrupts the wind-up; wrong answer = the wind-up lands. Right answers needed to win is always S.hits: hitDamage() takes a share of the wild dino's remaining health, so move choice only changes the numbers. Super meter (E.combo, changed 2026-11-04 after Josiah saw only one super per battle): right first time adds the move's charge (MOVE_SLOTS charge: basic 1, second 1, special 2), the first wrong tap on a question takes 1 away; full at 3 (finNeed) = finisher with flash/zoom/roar, then it empties. A 6-answer battle gives 2 supers, 3 if he picks the hard move every time. A charged shield blocks the next hit. His dino's health is its dino-book Health stat; it faints after roughly 5-6 wrong answers in one fight and the wild dino runs away (chosen by Josiah, 2026-10-16; this replaced "he never loses").
- Dino facts in SPECIES haven't been checked against a source yet.
- BACKLOG.md holds the open ideas and fixes (fighting engagement, levelling perks, explore screen, art still to make). Read it before planning a new feature and tick items off when they ship.
- Later scope: printed track cards (fill-in-the-blank words), NFC, evolution, raids, Cantonese.
- Idea (2026-10-17): an "explore" screen before encounters, like Pokémon: he walks a little avatar around illustrated habitats (forest, swamp, beach, volcano) and rustling bushes / footprints trigger a dino matched to that habitat. Josiah liked the feel of a 2.5D pixel RPG he saw (top-down map, wandering, boss fights). No real GPS.
- Test every layout change at iPhone size (about 428x660 visible inside the claude.ai viewer) as well as iPad.
