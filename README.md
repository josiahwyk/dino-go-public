# Dino Go

A dinosaur-catching learning game I built for my kid. Wild dinos appear, you weaken them in a battle by answering maths questions, then catch them by spelling a word. Caught dinos go into a dino book with stats and facts, and they level up the more you play.

It runs in the browser on an iPad or phone. No accounts, no ads, no build step.

## What it does

- **Maths battles** follow the Australian Curriculum (v9), Year 1 and Year 2: place value, adding and taking away, skip counting, equal groups, fractions, money. There are twelve levels and the game moves up or down by itself based on how the player is going. It also tracks which kinds of question they find hardest and asks those more often.
- **Spelling catches** use this week's homework words, typed in by a grown-up, plus an optional built-in word bank sorted by spelling pattern.
- **Everything is spoken aloud**, so a child who can't read yet can still play. Every spelling word comes with a short sentence ("cat... The cat sat on the mat... cat").
- **Clues instead of answers.** A wrong answer shows a picture clue (number-line hops, place-value charts, counting strips) with the last step left as a "?", and the same kind of question comes back a couple of rounds later.
- **A grown-up screen** (press and hold ⚙️) sets the words, maths level and battle length.
- **40 dinos**, each with a standing pose and an attack pose. The art is AI-generated (Gemini) from one shared style sheet, then cut out of its background by a small Python script.

## Run it

Open `game/index.html` in a browser. That's it: it's plain HTML, CSS and JavaScript with no dependencies.

Progress saves in the browser (`localStorage`). When it's opened as a claude.ai artifact it can also sync between devices.

## Tests

```bash
node tests/run.js
```

No installs needed. The tests load the real game files into a Node sandbox with a fake page, then play thousands of pretend questions and battles. They check that every question's answer is among its choices with no repeats and comes with a clue, that wrong spellings are never real words, that the level moves up and down the way it should, that every battle takes exactly the set number of right answers, that saves from two devices merge without losing a dino, and that every dino has its art.

## How the code is laid out

```
game/
  index.html         the screens (markup only) and the list of scripts, in load order
  style.css
  js/
    data/            species, word lists, spoken sentences
    state.js         the save: defaults, loading old saves, saving
    rules.js         battle rules as plain functions (levels, damage, the super meter), no page code
    encounter.js     the state of one battle
    maths-y1.js      Year 1 question generators
    maths-y2.js      Year 2 question generators
    maths.js         picks the next question: level, review, weak spots, retries
    clues.js         the picture clues
    battle.js        the battle screen
    catch.js         the spelling catch
    ...              book, grown-up screen, sound, scenes, sync
  dinos/             game art (.webp cut-outs, plus .jpg sources)
tests/               the Node test harness and tests
tools/cutout.py      removes the white background from new dino art
docs/                design notes, game rules and the backlog
assets/              full-size art originals and the image prompts
```

The scripts are plain `<script>` tags that share globals, so order matters: a file can only use, while loading, what the files above it define. The battle rules live in `rules.js` without touching the page, which is what makes them testable.

## Built with

Written with [Claude Code](https://claude.com/claude-code). I designed the game, tested every screen with my kid and decided what to keep; Claude wrote most of the code.
