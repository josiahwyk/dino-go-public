# Dino Go · 05 design note: battle engagement + levelling

One system: the move menu (A1), combo/finisher (A2), wind-up (A3), level unlocks (B1), shield perks (B2) and visible growth (B4). Everything is computed from the saved `xp` (level = 1 + floor(xp/3)); no new saved fields, so old saves and cloud merges are untouched.

## Level perks (all from `lvl(o)`)
| Level | What they get |
|---|---|
| 1 | Basic move |
| 3 | Second move, title "Brave", evolution celebration |
| 4 | Shield charges after 2 right answers (not 3) |
| 5 | Special move, title "Mighty", glow, evolution celebration |
| 8 | Starts every fight with a free shield |
| 10 | Title "Legendary", gold aura, evolution celebration |

## Move menu
- Before each question they tap one of their unlocked moves (big rows: name, power stars, "easy/medium/hard"). With only the basic move (L1-2) there is nothing to choose, so it goes straight to the question as before (question at their current maths level, 1 in 5 review).
- With 2+ moves the question level follows the move, relative to their maths level `S.mathLvl`: basic = one level easier, second = their level, special = one level harder (clamped 1..MAXL).
- Move names per dino (`MOVE_NAMES`), type defaults otherwise. Motion by slot (nip / charge / jump-and-spin), impact effect by type (plant: leaves + ground ring, meat: slash marks, sea: splash, fly: wind swirl). No new art.
- Maths adaptation: only questions at their current level count as before; a right-first-time harder question also counts toward levelling up; a wrong answer on a harder question never counts toward "stuck".

## Fixed battle length
`S.hits` right answers always win. Wild health `H` with `k` hits left: a move of power `p` takes `H*p/(p+1.6*(k-1))` (the other hits are assumed middling; min 1, always leaving 1 per remaining hit; the last hit takes the rest; the finisher takes at least 55% of what is left). So big moves show big numbers early, small moves small ones, and the fight can never end early or need an extra answer. Powers: basic 1, second 1.6, special 2.4, finisher 3.4, plus 10% per combo step.

## Combo and finisher
- Combo = right answers first time in a row in this fight; any wrong answer resets it. Shown as stars on their plate and a "Combo xN!" callout.
- At 5 in a row (4 on Short battles, so it can happen there) the attack is the finisher: screen flash, zoom on the attack pose, bigger roar, shockwave, huge damage number, "SUPER <special move>!". Combo then restarts.

## Wild dino wind-up
Each round the wild dino picks a move and winds up: shake plus glow that grows then holds, text "winding up Chomp!" on its plate, spoken. No timer. A right answer interrupts it ("Stopped it!", glow off); a wrong answer lets it land (existing damage, shield still blocks). Retries keep the wind-up going.

## Shield
Pips show how many are needed (3, or 2 from L4). L8+ starts the fight shielded. Blocking works as before; a wrong answer still resets the pips.

## Visible growth
Level badge on their dino picture (battle, pick screen, dino book, sheet, caught), title in the name (Brave / Mighty / Legendary), glow at L5 and aura at L10, entrance flourish for L5+ in battle, and an evolution celebration overlay at L3, L5 and L10 (same picture: white flash, pulse, reveal, confetti, spoken, big tap button). Other level-ups get a short banner; L4 and L8 announce their shield perk.

## Out of scope this slice
B3 (attack stat), B5-B7, A4-A7, and any new art.
