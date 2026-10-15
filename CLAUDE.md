# Dino Go

Learning game for my son: Pokémon-Go-style dinosaur catching. Maths battles weaken wild dinos; spelling catches them; a dino book shows stats and facts.

## Files
- game/index.html: the whole game (one HTML file, no build step). Open it in a browser to run it.
- game/dinos/NN_name.jpg: game art (512px). Ids match the SPECIES list in index.html.
- assets/dinos/NN_name.jpeg: full-size originals from Gemini. assets/style-reference/style-sheet.jpeg: the style all dinos copy.
- assets/dino_prompts.md: the 40 dinos with types and image prompts. Dinos 01–19 have art; 20–40 still to generate.
- Root Gemini_Generated_Image*.jpeg files are the original downloads. Don't delete them.

## Live version
Published as a claude.ai artifact (opened on his iPad): https://claude.ai/artifact/Te5KgkGw2tJm9iyCkh8PDM
To add a dino: put its image in game/dinos/ and add its id to the BUILTIN set in index.html.

## Rules
- Designed for a young child: every instruction spoken aloud (speechSynthesis), big buttons, he never loses, difficulty adapts.
- Dino facts in SPECIES haven't been checked against a source yet.
- Later scope: printed track cards (fill-in-the-blank words), NFC, evolution, raids, Cantonese.
