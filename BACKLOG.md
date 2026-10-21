# Dino Go backlog

Ideas and open items, newest thinking first. Move an item to "Done" with the date and chat number when it ships. Chats are named "Dino Go · NN Topic" (see CLAUDE.md).

Rules that apply to everything here: every instruction is spoken aloud, big tap targets, designed for a young child; test at iPhone size (about 428x660) and iPad; cloud save stays working (republish keeping the db + user capabilities, never change the save key or delete saved fields); new perks should be computed from data already saved (xp, wins, caught) where possible.

## A. Make fighting more engaging (raised 2026-10-22, chat 04)
Why: every fight is the same loop (answer, lunge, hit, health bar) and he never decides anything. Choice and anticipation beat flashier effects at his age. Battle length (right answers needed) stays fixed because it is the maths practice.

Suggested first slice: A1 + A2 + A3 together. No new art needed.

- [x] **A1. Choose the attack.** Before each question he picks from 2-3 moves, e.g. "Quick bite" (easy question, small hit) vs "Mega stomp" (harder question, big hit). Gives a real decision, and makes maths difficulty adaptive and visible (he opts into harder questions). Move names and damage can come from dino type and attack stat (MOVES in index.html).
- [x] **A2. Combos and a finisher.** Streak counter, hits get bigger as it climbs. At 5 in a row a super move: zoom, screen flash, bigger roar, big damage number, using the existing attack-pose art. Ties into the shield (3 in a row).
- [x] **A3. The wild dino acts.** Telegraphed warning ("T. rex is winding up a Chomp!", shake + growing glow). Anticipation only, NO countdown timer (stressful at 5). Right answer interrupts the move, wrong answer lets it land. Per-type attack effects (splash, dive-bomb...).
- [ ] **A4. A world that changes.** Arena background by habitat (forest, swamp, beach, volcano; shares art with the explore screen, item C1), simple music loop, dino-specific roars, wild dino reactions (wince, stagger, scared when low).
- [ ] **A5. A payoff for fighting.** XP bar filling after a win and a proper level-up moment; berries earned from streaks that he can spend to heal mid-fight (gives a recovery other than fainting); later a boss dino needing two phases or two of his dinos (see C3 raids).
- [ ] **A6. A quick skill moment.** Occasional tap-the-moving-target bar for bonus damage, to break up the answer-tap rhythm.
- [ ] **A7. Research first.** Watch him play ~10 minutes without helping. Note when he gets bored (guess: the repeated lunge) and what he cheers at; use it to order A1-A6.

## B. Levelling up should mean something (raised 2026-10-22, chat 04)
Today: level = 1 + floor(xp / 3); xp +1 per battle won and +1 per duplicate catch. A level only gives +2 max health in battle and bigger numbers on the dino-book card. The attack stat is cosmetic: damage to the wild dino comes from the wild dino's health split across the battle length, so Attack 12 hits exactly like Attack 5. Using one dino for 30 battles feels the same as using it once.

Suggested first slice: B1 + B2 + B4.

- [x] **B1. Moves unlock with level.** L1 basic, L3 second move, L5 special; each dino gets its own move names (e.g. Triceratops "Horn charge"). Designed together with A1 so the level thresholds and the move menu match.
- [x] **B2. Better shield.** L4 charges after 2 right answers instead of 3; L8 starts every fight with a free shield.
- [ ] **B3. Make the attack stat real.** It sets how big the damage numbers look and how fast the finisher charges. Total hits to win stays the same.
- [x] **B4. Visible growth, no new art.** Level badge on the picture; title that changes ("Triceratops", "Brave Triceratops", "Mighty Triceratops"); glow/aura at levels 5 and 10; special entrance animation at higher levels; short "evolution" celebration at milestones using the same picture.
- [ ] **B5. Bond hearts for favourites.** A dino he uses a lot earns hearts; at thresholds it does something (cheer line, free berry or heal, its own roar). This is what rewards using one dino again and again.
- [ ] **B6. Optional catch-up XP.** Lower-level dinos earn extra XP so new catches are worth using. Skip if he should stay loyal to a favourite.
- [ ] **B7. Pacing.** Cap levels at about 10 with a visible XP bar. Once his dino outclasses wild dinos fights get easy, so scale wild dinos a little toward his level or add rarer tough wild dinos for veterans.

## Art needs (Gemini) for A and B (noted 2026-10-22)
No new art is needed for A1-A3 and B1-B4. Every dino already has a normal and an attack picture. Move variety comes from code: different animations on the existing pictures (nip, charge, jump-stomp, spin), CSS/SVG effects coloured by dino type (bursts, slashes, shockwaves, splashes), screen flash and shake, sounds, text callouts, badges, titles and auras.

Optional art, for later, after he has played the first slice (batch these into one Gemini session, since downloads need a yes each session):
- [ ] **Special-move pose per dino** (19 images, same job as the attack poses) for the level-5 finisher. Without it the finisher reuses the attack pose with a zoom, flash and glow.
- [ ] **Habitat backgrounds** (forest, swamp, beach, volcano; about 4 images) for A4. Probably the biggest visual upgrade, and they double as the explore-screen maps (C1).
- [ ] **Hurt or faint pose** (optional; the tilt-and-fade animation covers it now).

Already outstanding and more important: art for dinos 20 and 28-40 (item in section D), since it limits how many dinos he can catch.

## E. Follow-ups from chat 05 (check after he has played)
- [ ] Watch him use the move menu: does he pick the biggest move every time, or always the easy one? Always-easy keeps his maths level from rising (only his-level and harder questions count). Tune the powers/offsets in MOVE_SLOTS if so.
- [ ] Levels come slowly (level = 1 + xp/3, so L5 = 12 wins, L10 = 27). If the unlocks feel too far away, change the xp curve (lvl() in index.html) but note saved xp keeps its meaning.
- [ ] Special-move pose art for the finisher (see Art needs); it reuses the normal attack pose until then.
- [ ] B3, B5-B7 and A4-A7 are untouched.

## C. Bigger ideas (from CLAUDE.md, moved here)
- [ ] **C1. Explore screen** (2026-10-17): before encounters he walks a little avatar around illustrated habitats (forest, swamp, beach, volcano); rustling bushes / footprints trigger a dino matched to that habitat. He liked the feel of a 2.5D pixel RPG (top-down map, wandering, boss fights). No real GPS.
- [ ] **C2. Evolution** (overlaps B4).
- [ ] **C3. Raids / boss fights** (overlaps A5).
- [ ] **C4. Printed track cards** (fill-in-the-blank words).
- [ ] **C5. NFC.**
- [ ] **C6. Cantonese.**

## D. Content and fixes
- [ ] Art for dinos 20 and 28-40 (01-19 and 21-27 have pictures; prompts in assets/dino_prompts.md).
- [ ] 15 Therizinosaurus attack pose is front-on (he didn't ask to redo it).
- [ ] Dino facts in SPECIES haven't been checked against a source.
- [ ] Check on his iPad: Year 2 fraction shapes and cent coins (shipped 2026-10-22, untested on the real device).
- [ ] Decide whether to add 3/4 (Year 2 names only halves, quarters, eighths, so left out).

## Done
- 2026-10-22 (chat 05): A1 move menu, A2 combo + finisher, A3 wild wind-up, B1 moves unlock at L1/3/5, B2 shield perks (L4 two right answers, L8 free shield), B4 level badge, titles (Brave L3, Mighty L5, Legendary L10), glow at L5 and golden aura at L10, evolution celebration at L3/5/10 (L4 and L8 get a shorter overlay). No new art. Design in DESIGN-05.md.
- 2026-10-22 (chat 04): 12 maths levels (7-12 = Year 2, AC9M2), "Suggest words" spelling pattern bank, no repeat fights with "Rematch!" once every dino with art is caught.
- 2026-10-17 (chat 03): cloud save across iPad/iPhone.
- 2026-10-22 (chat 06): art (standing + attack, all facing right) for the 7 meat-eaters 21-27 (T. rex, Velociraptor, Spinosaurus, Allosaurus, Carnotaurus, Giganotosaurus, Dilophosaurus), added to BUILTIN and published as artifact version 15.
- 2026-10-16 (chat 02): attack poses for 01-19, health bar, streak shield, faint/escape, harder Year 1 maths and spelling, phone layout fixes.
