# Dino World build plan (BACKLOG C1)

**Dino World is its own game, separate from Dino Go** (decided 2026-10-22). It lives in the same repo so it can reuse the 40 dino pictures, but it has its own page (`game/world.html`), its own code (`game/overworld.js`), its own save, and will get its own artifact link. Dino Go (`game/index.html`) is never edited for it.

Goal: a Game Boy-style top-down world. He walks a little explorer around, steps into tall grass, a bush rustles, and a dino that lives in that habitat appears. Later: four habitats, signs, a town, boss dinos with badges.

Budget: Josiah's leftover Pro tokens, usually 5-10% of the week on the last day before reset. So **one step = one short session**. Steps are cut small on purpose. If a step looks too big when you start it, split it in this file first and do only the first half.

## Rules for every session (read these, they are what keeps it cheap)

1. **Don't open game/index.html.** That's Dino Go, about 140KB (roughly 35-40k tokens). Dino World doesn't need it. The only exception is step 7, which copies the dino list out of it with a script, never by reading it.
2. **Files:** `game/world.html` is the page (small: styles, the canvas, a script tag). All game code goes in `game/overworld.js`. A session should only need this plan and those two files.
3. **No art from Gemini.** Tiles and the explorer are drawn in code (canvas, small pixel style). Dinos reuse the existing pictures in `game/dinos/NN_name.webp`.
4. **Publish only at milestones** (the "Publish" steps). Between milestones, test locally: preview `dino-go` from `.claude/launch.json` and open `/world.html`; one screenshot at iPhone size (about 428x660) is enough. Check iPad size at milestones only.
5. **Own save, kept simple.** Dino World saves in localStorage under its own key (`dinoworld`), wrapped in try/catch. Never touch Dino Go's save or cloud save. Saving across his iPad and iPhone can come later if he plays it a lot.
6. **End every session the same way:** tick the step below, add a line to the cost log, commit (`Dino World step N: ...`). If a step is half done when tokens run out, commit it anyway with "WIP" in the message and write one line under the step saying what is left.
7. Model: **Sonnet** unless the step says Opus. Sonnet uses less of the Pro allowance.
8. **Cap the art fix-up loop** (steps 3, 4, 12). "Keep fixing until it looks good" is where the tokens go. Before drawing, write the target in one line in this file: a limited palette (about 4 colours per tile, Game Boy Color feel) and what each tile should read as at a glance. Then at most 2 rounds of fixes per session; if it's still off, commit it as good enough and note what to improve.
9. **Keep it light on the iPad.** Tiles are drawn once and reused (step 3). Only redraw while the explorer is moving or something is animating, not every frame.
10. **Designed for a young child**, same as Dino Go: every instruction spoken aloud (`say()` in overworld.js), big tap targets, no timers.
11. **Don't commit Dino Go work you didn't make.** If `git status` shows changes in `game/index.html`, they belong to someone else: leave them alone and commit only Dino World files.

### Starting a session (paste this)

> Dino World. Read OVERWORLD-PLAN.md and do the next unticked step only. Follow its session rules: it's a separate game from Dino Go, so don't open index.html. Stop after that step, tick it, add a cost-log line and commit.

## Milestone 1: Walk around (not published yet)

- [x] **1. Empty world page.** `game/world.html` with a title and a canvas that fills the space; `game/overworld.js` holds the code. *Done when:* opening /world.html shows the canvas. (First built inside Dino Go, then moved out to its own page the same day.)
- [x] **2. Map as text.** One 20x15 map as an array of strings (`G` grass, `T` tall grass, `R` tree, `W` water, `P` path, `F` flowers). Each tile drawn as a flat coloured square, 16px tiles scaled up. *Done when:* you can see the map layout in plain colours.
- [x] **3. Tile art in code** (Opus). Draw each tile type once into a small offscreen canvas in a Game Boy-ish pixel style: grass texture, tall-grass tufts, a round tree, water with a ripple line, path pebbles, flowers. Use `imageSmoothingEnabled=false` so it stays crisp. *Done when:* the map looks like a little pixel world, not coloured squares.
  *Target look:* 16x16 pixel tiles, 3-5 colours each, Game Boy Color feel: **grass** = mid green with a few darker V-shaped blades; **tall grass** = darker green packed with 4 leafy tufts (clearly "go in here"); **tree** = round dark-green ball with a light top-left highlight and dark outline on grass, little brown trunk, so the border reads as a row of trees; **water** = blue with two white "~" ripples and a darker line where it meets land; **path** = sandy tan with a few pebbles and a slightly darker edge; **flowers** = grass with 3 small pink and white flowers with yellow middles.
- [x] **4. The explorer.** A small code-drawn kid sprite (hat, backpack) facing 4 directions, 2-frame walk. Placed on a path tile. *Done when:* he stands on the map facing down.
  *Target look:* fits one 16x16 tile, dark outline, ~6 colours: red cap (darker brim), skin face with 2 dot eyes, brown hair, blue shirt, orange backpack (straps from the front, the whole pack from behind, a bulge at the back from the side), dark trousers and shoes, small soft shadow under the feet. Down = face, up = cap + hair + backpack, right = side view with the brim pointing right, left = right mirrored. Frame 2 = one foot forward.
- [x] **5. Walking.** Big on-screen D-pad (4 buttons, thumb-sized) plus arrow keys for testing. Moves one tile at a time with a short slide, blocked by trees and water. *Done when:* he walks around and can't walk through trees or water.
- [ ] **6. Camera** (Opus). Make the map 40x30 and let the view follow the explorer, clamped at the edges. Check the D-pad doesn't cover the explorer on iPhone size. *Done when:* walking to the edge scrolls the world smoothly at 428x660.

## Milestone 2: Find dinos in the grass

- [ ] **7. Dino list.** Write a small script (in `tools/`) that pulls each dino's id, name and type out of `SPECIES` in index.html into `game/world-dinos.js` (`const DINOS=[{id,name,type},...]`). Run it, don't read index.html. Types are `plant` (20), `meat` (13), `sea` (4), `fly` (2). *Done when:* world.html loads world-dinos.js and `DINOS.length` is 40 in the console.
- [ ] **8. Rustle and appear.** Each step into tall grass has about a 1-in-8 chance of a rustle: the tufts shake, a rustle sound, "Something's in the grass!" spoken. Then a card pops up with the dino's picture (`dinos/NN_name.webp`) and its name spoken: "A wild Triceratops!" Tap to go back to walking. No rustle in the first 3 steps after one, so he isn't ambushed. *Done when:* walking in tall grass makes dinos appear.
- [ ] **9. Catch it** (Opus). On the dino card: one easy maths question (tap 1 of 3 big answers, spoken) to catch it. Caught dinos are saved (rule 5) and shown in a small "My dinos" list. Wrong answer: "It ran away! Try again in the grass." Decide with Josiah first whether catching should be maths, spelling or just a tap. *Done when:* he can catch a dino and it's still caught after a reload. Also save the explorer's position.
- [ ] **10. Publish milestone 1+2.** Publish world.html as a **new** artifact (not Dino Go's link), with overworld.js and world-dinos.js in `files`, and the dino pictures copied server-side from Dino Go's artifact (`{artifact, path}` entries, nothing re-uploaded). Check iPhone and iPad size first. Add the new link to CLAUDE.md and tick C1's first part in BACKLOG.

## Milestone 3: Habitats

- [ ] **11. Habitat-aware dinos.** The picker takes a habitat: `forest` → plant, `volcano` → meat, `beach` → sea, `cliffs` → fly. Uncaught dinos first; if that habitat has none left, any dino from it. *Done when:* the beach only gives sea reptiles (test in the console).
- [ ] **12. Four zones** (Opus). Grow the map so it has 4 zones joined by paths: forest (green), volcano (dark rock, lava instead of water), beach (sand, sea), cliffs (grey rock, high ledges). Each zone gets its own tile colours from the step 3 drawing code (palette swap, not new tiles). *Done when:* grass on the beach gives sea reptiles, grass in the volcano gives meat-eaters.
- [ ] **13. Signs.** A sign at each zone entrance. Walking into it opens a Game Boy-style text box at the bottom ("Volcano. Watch out for meat-eaters!"), spoken aloud, tap to close. *Done when:* all 4 signs talk.
- [ ] **14. Publish milestone 3.** Republish to the Dino World artifact.

## Milestone 4: Town and boss dinos (later, only if he loves it)

- [ ] **15. Home town.** A small town in the middle: a house that shows his caught dinos, and one friendly grown-up NPC who gives tips. Uses the step 13 text box.
- [ ] **16. Boss dino, part 1.** One boss per zone, standing on the map (not in grass). Talking to it starts a bigger catch challenge (3 questions in a row), with a bigger picture and its own intro line.
- [ ] **17. Boss dino, part 2: badges.** Beating a boss gives a badge, shown on the title bar. Saved like everything else (rule 5).
- [ ] **18. Publish milestone 4.**

## Cost log

One line per session, so we learn how big a step can be. Check usage at claude.ai → Settings → Usage before and after.

| Date | Step | Model | % of week used | Notes |
|------|------|-------|----------------|-------|
| 2026-10-22 | 1 + 2 | Opus | ? (not measured) | Done together in one chat, first inside Dino Go, then moved to its own page (world.html) in the same chat. Map fits the screen at a whole-number scale, so it's a bit small on iPhone until step 6's camera. |
| 2026-10-22 | 3 | Opus | ? (not measured) | Tiles are 16x16 text pictures in ART (overworld.js), drawn once, then the whole map drawn once into WORLD. Water and path get a darker edge where they meet other tiles. 1 fix round (bigger flowers). Preview: the `dino-go` entry the app uses is the one in ~/Documents/Claude/.claude/launch.json (port 8642), and it was already running. |
| 2026-10-22 | 4 | Opus | ? (not measured) | Same chat as step 3. HERO_PX holds 6 text frames (down/up/right x stand/step), left is right mirrored; `hero` {x,y,dir,frame} starts on the path at (9,12) with a soft shadow. 0 fix rounds. Could improve later: in the side view the arm reads as a blue stripe; the down/up step frame is subtle. Also added BACKLOG C7 (one look for both games, Pokémon-style battle). |
| 2026-10-22 | 5 | Opus | ? (not measured) | Same chat as 3-4. D-pad under the map (4 buttons, 64-84px), arrow keys/WASD; hold = keep walking, a quick tap made mid-slide is queued, not lost. SOLID = trees + water; the map edge counts as tree. Testing tip: the preview pane often doesn't paint, so requestAnimationFrame stalls and he looks stuck. In the console, swap in `requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16)` before scripting key presses. Took a while to find, so worth knowing. |
