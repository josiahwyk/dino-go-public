# Dino Go backlog

Ideas and open items, newest thinking first. Move an item to "Done" with the date and chat number when it ships. Chats are named "Dino Go · NN Topic" (see CLAUDE.md).

Rules that apply to everything here: every instruction is spoken aloud, big tap targets, designed for a young child; test at iPhone size (about 428x660) and iPad; cloud save stays working (republish keeping the db + user capabilities, never change the save key or delete saved fields); new perks should be computed from data already saved (xp, wins, caught) where possible.

## F. Learning fixes (teacher + parent review, 2026-11-04)
Why: the game tests them but rarely teaches them. A wrong answer only says "Ouch, try again", so they can tap through the choices without learning how. Order agreed with Josiah: F1, then F2-F4; F5 later. Nothing here changes the number of right answers needed to win.

- [x] **F1. Wrong answers teach.** Built 2026-11-04 (all 60 question kinds have a clue; tested at iPhone and iPad size). Published as artifact v21; v22 adds ✕ to hide the clue and 💡 to bring it back (Josiah, after first play). Not yet tried by them.
  - A wrong choice is crossed out and can't be tapped again.
  - After the first miss, a hint appears under the question and is spoken: the strategy, not the answer. Kinds: number-line hops (count on / back, jump the tens then the ones, count up for change), counting by 2s/5s/10s along the groups, tens-and-ones place-value chart, "look at the biggest place first" for comparing, the part of a pattern that repeats, numbered equal parts for fractions. The last step is always a "?" so they still work out the answer themselves.
  - A question they missed comes back as a fresh one of the same kind about 2 rounds later ("Here's one like before!"), and is cheered if they get it right first time. Kept in memory only (not saved); if the battle ends first it comes up in the next battle.
- [x] **F2. The hard move is worth picking.** Done 2026-11-04 (artifact v23), chosen by Josiah instead of extra XP: the super meter fills at 3 stars instead of 5 in a row, the hard (special) move adds 2 stars, a wrong answer takes 1 star instead of emptying it. Since v25 every dino has all 3 moves from level 1 (Josiah: reward through damage and the super, not levels), so the move menu shows every round. Watch whether they always pick the easy move (item E).
- [x] **F3. Track each maths skill, not one level.** Done 2026-11-04 (artifact v30). Count right-first-time per question kind (per generator) and serve the weakest kinds at their level more often (about 1 in 3 questions). Saved on S (not per dino), so check mergeSaves keeps it when syncing.
- [ ] **F4. Spelling.**
  - [x] a) Done 2026-11-04 (artifact v30), 544 words. Every word is said with a short sentence ("sea... the fish swim in the sea... sea"), needed for sound-alike pairs (see/sea, their/there) and words like read/live. Sentences for the PATTERNS + CHALLENGE + default words; homework words without one fall back to the word alone.
  - b) Tiles are sound chunks for digraph words (sh, ch, ai, igh...) and each tile says its sound when tapped.
  - c) For words they have spelled right before: show the word for 2 seconds, hide it, then they spell it (look, cover, spell).
  - [x] d) More spelling practice: done another way 2026-11-04 (artifact v26), Josiah's idea: battles can ask spelling questions instead of maths (grown-up setting "Battle questions": Maths / Spelling words / Mix). Catching still needs 1 word.
- [ ] **F5. (later) Parent report.** Log which wrong choice they pick (mix() already knows the likely slip) and misspellings; show "this week" on the grown-up screen.
- [ ] **F6. A reason to pick a dino.** In battle every dino plays the same today: wild hits take a share of their dino's max health, so Health cancels out; Attack is only shown in the book; types are labels. Plan: type matchups shown as a "Super pick!" badge on the pick screen and spoken (strong match = super move one answer sooner and less damage from wrong answers); one trait per dino from its stats ("Tough" = survives more wrong answers, fixing the Health cancel-out; "Strong" = super move sooner); catch-up XP for low-level dinos (B6). Josiah to approve the type rules.
- [ ] **F7. Better voice.** Step 1 done 2026-11-04 (artifact v30): prefers Premium/Enhanced voices + grown-up Voice picker with Test. Josiah downloaded Premium "Cameron" (en-AU) on their iPhone; check it shows in the picker on the device (iOS may hide some voices from web pages). If not, steps 2-3. They dislike the robotic voice. Step 1: grown-up voice picker with a test button that prefers "Premium"/"Enhanced" voices (Josiah downloads one on the iPad: Settings > Accessibility > Read & Speak > Voices). Step 2 if still robotic: a "Dino-Bot" guide character. Step 3: recorded lines (Josiah's voice or an AI voice) with the device voice for numbers.

## A. Make fighting more engaging (raised 2026-10-22, chat 04)
Why: every fight is the same loop (answer, lunge, hit, health bar) and they never decide anything. Choice and anticipation beat flashier effects at their age. Battle length (right answers needed) stays fixed because it is the maths practice.

Suggested first slice: A1 + A2 + A3 together. No new art needed.

- [x] **A1. Choose the attack.** Before each question they pick from 2-3 moves, e.g. "Quick bite" (easy question, small hit) vs "Mega stomp" (harder question, big hit). Gives a real decision, and makes maths difficulty adaptive and visible (they opt into harder questions). Move names and damage can come from dino type and attack stat (MOVES in index.html).
- [x] **A2. Combos and a finisher.** Streak counter, hits get bigger as it climbs. At 5 in a row a super move: zoom, screen flash, bigger roar, big damage number, using the existing attack-pose art. Ties into the shield (3 in a row).
- [x] **A3. The wild dino acts.** Telegraphed warning ("T. rex is winding up a Chomp!", shake + growing glow). Anticipation only, NO countdown timer (stressful at 5). Right answer interrupts the move, wrong answer lets it land. Per-type attack effects (splash, dive-bomb...).
- [ ] **A4. A world that changes.** ~~Arena background by habitat~~ done 2026-10-22 (chat 08, code-drawn scenes, see CLAUDE.md "Background scenes"). Still open: simple music loop, dino-specific roars, wild dino reactions (wince, stagger, scared when low).
- [ ] **A5. A payoff for fighting.** XP bar filling after a win and a proper level-up moment; berries earned from streaks that they can spend to heal mid-fight (gives a recovery other than fainting); later a boss dino needing two phases or two of their dinos (see C3 raids).
- [ ] **A6. A quick skill moment.** Occasional tap-the-moving-target bar for bonus damage, to break up the answer-tap rhythm.
- [ ] **A7. Research first.** Watch them play ~10 minutes without helping. Note when they get bored (guess: the repeated lunge) and what they cheer at; use it to order A1-A6.

## B. Levelling up should mean something (raised 2026-10-22, chat 04)
Today: level = 1 + floor(xp / 3); xp +1 per battle won and +1 per duplicate catch. A level only gives +2 max health in battle and bigger numbers on the dino-book card. The attack stat is cosmetic: damage to the wild dino comes from the wild dino's health split across the battle length, so Attack 12 hits exactly like Attack 5. Using one dino for 30 battles feels the same as using it once.

Suggested first slice: B1 + B2 + B4.

- [x] **B1. Moves unlock with level.** L1 basic, L3 second move, L5 special; each dino gets its own move names (e.g. Triceratops "Horn charge"). Designed together with A1 so the level thresholds and the move menu match.
- [x] **B2. Better shield.** L4 charges after 2 right answers instead of 3; L8 starts every fight with a free shield.
- [ ] **B3. Make the attack stat real.** It sets how big the damage numbers look and how fast the finisher charges. Total hits to win stays the same.
- [x] **B4. Visible growth, no new art.** Level badge on the picture; title that changes ("Triceratops", "Brave Triceratops", "Mighty Triceratops"); glow/aura at levels 5 and 10; special entrance animation at higher levels; short "evolution" celebration at milestones using the same picture.
- [ ] **B5. Bond hearts for favourites.** A dino they use a lot earns hearts; at thresholds it does something (cheer line, free berry or heal, its own roar). This is what rewards using one dino again and again.
- [ ] **B6. Optional catch-up XP.** Lower-level dinos earn extra XP so new catches are worth using. Skip if they should stay loyal to a favourite.
- [ ] **B7. Pacing.** Cap levels at about 10 with a visible XP bar. Once their dino outclasses wild dinos fights get easy, so scale wild dinos a little toward their level or add rarer tough wild dinos for veterans.

## Art needs (Gemini) for A and B (noted 2026-10-22)
No new art is needed for A1-A3 and B1-B4. Every dino already has a normal and an attack picture. Move variety comes from code: different animations on the existing pictures (nip, charge, jump-stomp, spin), CSS/SVG effects coloured by dino type (bursts, slashes, shockwaves, splashes), screen flash and shake, sounds, text callouts, badges, titles and auras.

Optional art, for later, after they have played the first slice (batch these into one Gemini session, since downloads need a yes each session):
- [ ] **Special-move pose per dino** (19 images, same job as the attack poses) for the level-5 finisher. Without it the finisher reuses the attack pose with a zoom, flash and glow.
- [ ] **Habitat backgrounds** (optional now): code-drawn scenes shipped 2026-10-22 (chat 08), so Gemini paintings would only be an upgrade. They could replace the SVG scenes later.
- [ ] **Hurt or faint pose** (optional; the tilt-and-fade animation covers it now).

All 40 dinos now have art (done 2026-10-22).

## E. Follow-ups from chat 05 (check after they have played)
- [ ] Watch them use the move menu: does they pick the biggest move every time, or always the easy one? Always-easy keeps their maths level from rising (only their-level and harder questions count). Tune the powers/offsets in MOVE_SLOTS if so.
- [ ] Levels come slowly (level = 1 + xp/3, so L5 = 12 wins, L10 = 27). If the unlocks feel too far away, change the xp curve (lvl() in index.html) but note saved xp keeps its meaning.
- [ ] Special-move pose art for the finisher (see Art needs); it reuses the normal attack pose until then.
- [ ] B3, B5-B7 and A4-A7 are untouched.

## C. Bigger ideas (from CLAUDE.md, moved here)
- [ ] **C1. Explore screen** (2026-10-17): before encounters they walk a little avatar around illustrated habitats (forest, swamp, beach, volcano); rustling bushes / footprints trigger a dino matched to that habitat. Josiah liked the feel of a 2.5D pixel RPG (top-down map, wandering, boss fights). No real GPS.
- [ ] **C2. Evolution** (overlaps B4).
- [ ] **C3. Raids / boss fights** (overlaps A5).
- [ ] **C4. Printed track cards** (fill-in-the-blank words).
- [ ] **C5. NFC.**
- [ ] **C6. Cantonese.**
- [ ] **C7. A more Pokémon-like battle** (raised 2026-10-22, not urgent). Dino Go's battle doesn't feel like a Pokémon battle: the classic look (Game Boy / Switch games, not Pokémon Go) has their dino seen from behind bottom-left, the wild one facing you top-right, a name + health box for each, and a text box with the move menu along the bottom. Pokémon Go itself has no turn-based wild battle (you flick a ball at a Pokémon on the camera view). Decide later which style to aim for; changing their dino to a back view would need new art.

## D. Content and fixes
- [x] Art for all 40 dinos (standing + attack, published as artifact v17, 2026-10-22).
- [ ] 15 Therizinosaurus attack pose is front-on (Josiah didn't ask to redo it).
- [ ] Dino facts in SPECIES haven't been checked against a source.
- [ ] Check on their iPad: Year 2 fraction shapes and cent coins (shipped 2026-10-22, untested on the real device).
- [ ] Decide whether to add 3/4 (Year 2 names only halves, quarters, eighths, so left out).

## Done
- 2026-10-22 (chat 08, artifact v20, commit 48998fc): background scenes drawn in code behind home, battle and catch (7 habitats: jungle, plains, swamp, beach, volcano, canyon, cliffs; battles pick one that suits the wild dino's type). Cloud-sync fixes: a win is no longer lost if a sync lands mid-attack, and two open devices no longer push saves back and forth forever (saves compared by content, not key order). Built in the chat 07 code review but left unpublished until chat 08.
- 2026-10-22 (chat 05): A1 move menu, A2 combo + finisher, A3 wild wind-up, B1 moves unlock at L1/3/5, B2 shield perks (L4 two right answers, L8 free shield), B4 level badge, titles (Brave L3, Mighty L5, Legendary L10), glow at L5 and golden aura at L10, evolution celebration at L3/5/10 (L4 and L8 get a shorter overlay). No new art. Design in DESIGN-05.md.
- 2026-10-22 (chat 04): 12 maths levels (7-12 = Year 2, AC9M2), "Suggest words" spelling pattern bank, no repeat fights with "Rematch!" once every dino with art is caught.
- 2026-10-17 (chat 03): cloud save across iPad/iPhone.
- 2026-10-22 (chat 06): art (standing + attack, all facing right) for the meat-eaters 21-27 (artifact v15), then Minmi 20 and meat-eaters 28-34 (artifact v16), then sea and flying reptiles 35-40 (artifact v17), all added to BUILTIN.
- 2026-10-16 (chat 02): attack poses for 01-19, health bar, streak shield, faint/escape, harder Year 1 maths and spelling, phone layout fixes.
