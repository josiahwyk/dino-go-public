# Dino Go backlog

Ideas and open items, newest thinking first. Move an item to "Done" with the date and chat number when it ships. Chats are named "Dino Go · NN Topic" (see CLAUDE.md).

Rules that apply to everything here: every instruction is spoken aloud, big tap targets, designed for a young child; test at iPhone size (about 428x660) and iPad; cloud save stays working (republish keeping the db + user capabilities, never change the save key or delete saved fields); new perks should be computed from data already saved (xp, wins, caught) where possible.

## A. Make fighting more engaging (raised 2026-10-22, chat 04)
Why: every fight is the same loop (answer, lunge, hit, health bar) and he never decides anything. Choice and anticipation beat flashier effects at his age. Battle length (right answers needed) stays fixed because it is the maths practice.

Suggested first slice: A1 + A2 + A3 together. No new art needed.

- [ ] **A1. Choose the attack.** Before each question he picks from 2-3 moves, e.g. "Quick bite" (easy question, small hit) vs "Mega stomp" (harder question, big hit). Gives a real decision, and makes maths difficulty adaptive and visible (he opts into harder questions). Move names and damage can come from dino type and attack stat (MOVES in index.html).
- [ ] **A2. Combos and a finisher.** Streak counter, hits get bigger as it climbs. At 5 in a row a super move: zoom, screen flash, bigger roar, big damage number, using the existing attack-pose art. Ties into the shield (3 in a row).
- [ ] **A3. The wild dino acts.** Telegraphed warning ("T. rex is winding up a Chomp!", shake + growing glow). Anticipation only, NO countdown timer (stressful at 5). Right answer interrupts the move, wrong answer lets it land. Per-type attack effects (splash, dive-bomb...).
- [ ] **A4. A world that changes.** Arena background by habitat (forest, swamp, beach, volcano; shares art with the explore screen, item C1), simple music loop, dino-specific roars, wild dino reactions (wince, stagger, scared when low).
- [ ] **A5. A payoff for fighting.** XP bar filling after a win and a proper level-up moment; berries earned from streaks that he can spend to heal mid-fight (gives a recovery other than fainting); later a boss dino needing two phases or two of his dinos (see C3 raids).
- [ ] **A6. A quick skill moment.** Occasional tap-the-moving-target bar for bonus damage, to break up the answer-tap rhythm.
- [ ] **A7. Research first.** Watch him play ~10 minutes without helping. Note when he gets bored (guess: the repeated lunge) and what he cheers at; use it to order A1-A6.

## B. Levelling up should mean something (raised 2026-10-22, chat 04)
Today: level = 1 + floor(xp / 3); xp +1 per battle won and +1 per duplicate catch. A level only gives +2 max health in battle and bigger numbers on the dino-book card. The attack stat is cosmetic: damage to the wild dino comes from the wild dino's health split across the battle length, so Attack 12 hits exactly like Attack 5. Using one dino for 30 battles feels the same as using it once.

Suggested first slice: B1 + B2 + B4.

- [ ] **B1. Moves unlock with level.** L1 basic, L3 second move, L5 special; each dino gets its own move names (e.g. Triceratops "Horn charge"). Designed together with A1 so the level thresholds and the move menu match.
- [ ] **B2. Better shield.** L4 charges after 2 right answers instead of 3; L8 starts every fight with a free shield.
- [ ] **B3. Make the attack stat real.** It sets how big the damage numbers look and how fast the finisher charges. Total hits to win stays the same.
- [ ] **B4. Visible growth, no new art.** Level badge on the picture; title that changes ("Triceratops", "Brave Triceratops", "Mighty Triceratops"); glow/aura at levels 5 and 10; special entrance animation at higher levels; short "evolution" celebration at milestones using the same picture.
- [ ] **B5. Bond hearts for favourites.** A dino he uses a lot earns hearts; at thresholds it does something (cheer line, free berry or heal, its own roar). This is what rewards using one dino again and again.
- [ ] **B6. Optional catch-up XP.** Lower-level dinos earn extra XP so new catches are worth using. Skip if he should stay loyal to a favourite.
- [ ] **B7. Pacing.** Cap levels at about 10 with a visible XP bar. Once his dino outclasses wild dinos fights get easy, so scale wild dinos a little toward his level or add rarer tough wild dinos for veterans.

## C. Bigger ideas (from CLAUDE.md, moved here)
- [ ] **C1. Explore screen** (2026-10-17): before encounters he walks a little avatar around illustrated habitats (forest, swamp, beach, volcano); rustling bushes / footprints trigger a dino matched to that habitat. He liked the feel of a 2.5D pixel RPG (top-down map, wandering, boss fights). No real GPS.
- [ ] **C2. Evolution** (overlaps B4).
- [ ] **C3. Raids / boss fights** (overlaps A5).
- [ ] **C4. Printed track cards** (fill-in-the-blank words).
- [ ] **C5. NFC.**
- [ ] **C6. Cantonese.**

## D. Content and fixes
- [ ] Art for dinos 20-40 (only 01-19 have pictures; prompts in assets/dino_prompts.md).
- [ ] 15 Therizinosaurus attack pose is front-on (he didn't ask to redo it).
- [ ] Dino facts in SPECIES haven't been checked against a source.
- [ ] Check on his iPad: Year 2 fraction shapes and cent coins (shipped 2026-10-22, untested on the real device).
- [ ] Decide whether to add 3/4 (Year 2 names only halves, quarters, eighths, so left out).

## Done
- 2026-10-22 (chat 04): 12 maths levels (7-12 = Year 2, AC9M2), "Suggest words" spelling pattern bank, no repeat fights with "Rematch!" once every dino with art is caught.
- 2026-10-17 (chat 03): cloud save across iPad/iPhone.
- 2026-10-16 (chat 02): attack poses for 01-19, health bar, streak shield, faint/escape, harder Year 1 maths and spelling, phone layout fixes.
