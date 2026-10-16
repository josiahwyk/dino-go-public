# Dino Go

Learning game for my son: Pokémon-Go-style dinosaur catching. Maths battles weaken wild dinos; spelling catches them; a dino book shows stats and facts.

## Files
- game/index.html: the whole game (one HTML file, no build step). Open it in a browser to run it.
- game/dinos/NN_name.jpg: game art (512px). Ids match the SPECIES list in index.html.
- game/dinos/NN_name_attack.webp: attack pose for each dino (swapped in during the battle lunge). Full-size originals are assets/dinos/NN_name_attack.jpeg.
- 16_amargasaurus: its Gemini art faced left, so the game copies (normal + attack) are mirrored to face right like the others. Mirror again if you regenerate them from assets/.
- game/dinos/NN_name.webp: the same art cut out of its white background. This is what the game loads. Make it with `python3 tools/cutout.py` (needs Pillow + numpy).
- assets/dinos/NN_name.jpeg: full-size originals from Gemini. assets/style-reference/style-sheet.jpeg: the style all dinos copy.
- assets/dino_prompts.md: the 40 dinos with types and image prompts. Dinos 01–19 have art; 20–40 still to generate.
- Root Gemini_Generated_Image*.jpeg files are the original downloads. Don't delete them.

## Live version
Published as a claude.ai artifact (opened on his iPad): https://claude.ai/artifact/Te5KgkGw2tJm9iyCkh8PDM
To add a dino: put its 512px .jpg in game/dinos/, run `python3 tools/cutout.py game/dinos/NN_name.jpg`, add its id to the BUILTIN set in index.html, and publish the .webp with the page.

## Maths
Battle questions follow the Australian Curriculum v9, Year 1 (number + algebra strands): see LEVELS and QUESTIONS in index.html. Six levels, auto-adjusting; the parent screen can set the level and battle length (4/6/8 hits).

## Rules
- Designed for a young child: every instruction spoken aloud (speechSynthesis), big buttons, difficulty adapts.
- Battles: right answer = his dino hits; wrong answer = his attack misses and the wild dino hits back. 3 right first time in a row charges a shield that blocks the next hit. His dino's health is its dino-book Health stat; it faints after roughly 5-6 wrong answers in one fight and the wild dino runs away (chosen by Josiah, 2026-10-16; this replaced "he never loses").
- Dino facts in SPECIES haven't been checked against a source yet.
- Later scope: printed track cards (fill-in-the-blank words), NFC, evolution, raids, Cantonese.
