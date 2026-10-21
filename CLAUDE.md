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
- assets/dino_prompts.md: the 40 dinos with types and image prompts. Dinos 01–34 all have art (standing + attack); 35–40 (sea and flying reptiles) still to generate.
- Root Gemini_Generated_Image*.jpeg files are the original downloads. Don't delete them.

## Live version
Published as a claude.ai artifact (opened on his iPad): https://claude.ai/artifact/Te5KgkGw2tJm9iyCkh8PDM
To add a dino: put its 512px .jpg in game/dinos/, run `python3 tools/cutout.py game/dinos/NN_name.jpg`, add its id to the BUILTIN set in index.html, and publish the .webp with the page.

## Maths
Battle questions follow the Australian Curriculum v9: see LEVELS and QUESTIONS in index.html. Twelve levels, auto-adjusting: 1-6 are Year 1 (AC9M1, number + algebra), 7-12 are Year 2 (AC9M2): place value to 1000, add/take away within 100, trading, skip counting, equal groups/arrays/halves-quarters-eighths, money and change. The parent screen can set the level and battle length (4/6/8 hits). MAXL is the top level; older saves hold 1-6 and still mean the same thing. Review questions come from any earlier level up to level 6, then only the 3 levels below.
Year 2 generators use mix() for the 4 tap choices (answer + the slip a child most often makes). Fraction answers are strings like "1/4" (drawn by fracLabel / fracSvg).

## Spelling
Homework words come from the parent screen (S.words). PATTERNS is a built-in word bank (Year 1 and Year 2 spelling patterns) behind the "Suggest words" button: it fills the words box with ~8 words, never ones in CHALLENGE, and nothing saves until Save words. "Challenge words" is a separate setting (S.challenge) that mixes CHALLENGE words into ~1 catch in 4.

## Levels and growth
Level = 1 + floor(xp/3), unchanged; everything below is worked out from saved xp, nothing extra is saved (mergeSaves only keeps xp/wins/caught/t per dino, so never put new per-dino fields there without updating it).
- L1 basic move, L3 second move + title "Brave", L4 shield charges after 2 right answers (3 before), L5 special move + "Mighty" + glow, L8 every fight starts with a shield, L10 "Legendary" + golden aura.
- MOVE_NAMES (per dino, 01-25; others use MOVE_DEFAULT by type), MOVE_SLOTS (powers, question offsets, animation style), perks(), titleFor(), decorate() (badge + aura) and celebrate() (evolution overlay) are in the "Levels, moves and growth" / "Level-up celebration" sections of index.html.
- Moves are animated with code only (nip / charge / jump-spin on the existing pictures; leaves, slashes, splash, wind by type). No new art was needed.
- Adaptation: only questions at his current maths level count as before; right-first-time on a harder question also counts toward levelling up; wrong answers on harder questions never count toward "stuck"; easier ones count for nothing.

## Wild dinos
pickWild() only picks dinos he hasn't caught that have art. When he owns every one with art, repeats come back and are labelled "Rematch!" (E.rematch, nothing is saved for it).

## Rules
- Designed for a young child: every instruction spoken aloud (speechSynthesis), big buttons, difficulty adapts.
- Battles (chat 05, full design in DESIGN-05.md): each round the wild dino winds up a move (glow, "Winding up X!", no timer); with 2+ moves he picks one first (basic = one maths level easier, second = his level, special = one harder), then answers. Right answer = his dino hits and interrupts the wind-up; wrong answer = the wind-up lands. Right answers needed to win is always S.hits: hitDamage() takes a share of the wild dino's remaining health, so move choice only changes the numbers. 5 right first time in a row (4 on Short) = finisher with flash/zoom/roar; combo resets on any wrong answer. A charged shield blocks the next hit. His dino's health is its dino-book Health stat; it faints after roughly 5-6 wrong answers in one fight and the wild dino runs away (chosen by Josiah, 2026-10-16; this replaced "he never loses").
- Dino facts in SPECIES haven't been checked against a source yet.
- BACKLOG.md holds the open ideas and fixes (fighting engagement, levelling perks, explore screen, art still to make). Read it before planning a new feature and tick items off when they ship.
- Later scope: printed track cards (fill-in-the-blank words), NFC, evolution, raids, Cantonese.
- Idea (2026-10-17): an "explore" screen before encounters, like Pokémon: he walks a little avatar around illustrated habitats (forest, swamp, beach, volcano) and rustling bushes / footprints trigger a dino matched to that habitat. Josiah liked the feel of a 2.5D pixel RPG he saw (top-down map, wandering, boss fights). No real GPS.
- Test every layout change at iPhone size (about 428x660 visible inside the claude.ai viewer) as well as iPad.
