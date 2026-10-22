# Overworld build plan (BACKLOG C1)

Goal: a Game Boy-style top-down world before encounters. He walks a little explorer around, steps into tall grass, a bush rustles, and a battle starts with a dino that lives in that habitat. Later: four habitats, signs, a town, boss dinos with badges.

Budget: Josiah's leftover Pro tokens, usually 5-10% of the week on the last day before reset. So **one step = one short session**. Steps are cut small on purpose. If a step looks too big when you start it, split it in this file first and do only the first half.

## Rules for every session (read these, they are what keeps it cheap)

1. **Don't read game/index.html in full.** It is about 140KB (roughly 35-40k tokens on its own). Find what you need with `grep -n` and read only those lines. The hooks this plan needs are listed under "Hooks" below.
2. **All overworld code goes in `game/overworld.js`**, not index.html. index.html only gets a `<script src="overworld.js">` tag, the screen's `<section>`, and the Explore button. A session should only need this file, overworld.js and a few grepped lines.
3. **No art from Gemini.** Tiles and the explorer are drawn in code (canvas, small pixel style). That keeps it small, and an image session with downloads costs a lot more.
4. **Publish only at milestones** (the "Publish" steps). Republishing needs a full read of the saved live copy, which is the most expensive thing in this project. Between milestones, test locally: preview `dino-go` from `.claude/launch.json` (port 8765), one screenshot at iPhone size (about 428x660) is enough. Check iPad size at milestones only.
5. **Don't touch the cloud save.** Keep the explorer's position in localStorage (per device, wrapped in try/catch). Badges (step 17) are the only thing that needs saving across devices, and that step says how.
6. **End every session the same way:** tick the step below, add a line to the cost log, commit (`Overworld step N: ...`). If a step is half done when tokens run out, commit it anyway with "WIP" in the message and write one line under the step saying what is left.
7. Model: **Sonnet** unless the step says Opus. Sonnet uses less of the Pro allowance.
8. **Cap the art fix-up loop** (steps 3, 4, 12). "Keep fixing until it looks good" is where the tokens go. Before drawing, write the target in one line in this file: a limited palette (about 4 colours per tile, Game Boy Color feel) and what each tile should read as at a glance. Then at most 2 rounds of fixes per session; if it's still off, commit it as good enough and note what to improve.
9. **Keep it light on the iPad.** Tiles are drawn once and reused (step 3). Only redraw while the explorer is moving or something is animating, not every frame, and stop drawing entirely when the world screen is hidden.

### Starting a session (paste this)

> Dino Go overworld. Read OVERWORLD-PLAN.md and do the next unticked step only. Follow its session rules: don't read index.html in full, grep for the hooks. Stop after that step and commit.

## Hooks in index.html (grep for these, don't read around them)

- `function show(id)`: switches screens. Screens are `<section id="s-..." class="screen">`.
- `<section id="s-home"`: the home screen, with the `#find` "Find a dino!" button.
- `function startEncounter(chosen)`: starts a battle. It already takes a chosen dino, so the overworld can pass one in.
- `function pickWild()`: picks the wild dino (uncaught first, "Rematch!" after all are caught). Step 11 adds a habitat filter here.
- `function goHome()`: where battles and catches end. Step 8 sends him back to the world instead.
- `SPECIES`: every dino has `type`: `plant` (20), `meat` (13), `sea` (4), `fly` (2).
- `say(...)` / speechSynthesis: every instruction must be spoken aloud.

## Milestone 1: Walk around (not published yet)

- [ ] **1. Empty world screen.** Create `game/overworld.js` with an `openWorld()` function. Add `<section id="s-world" class="screen" hidden>` holding a `<canvas>` and a back button, a `<script src="overworld.js">` tag, and an "Explore!" button on the home screen that calls `openWorld()`. The canvas fills the screen area. *Done when:* tapping Explore shows a blank coloured canvas and Back returns home.
- [ ] **2. Map as text.** One 20x15 map as an array of strings (`G` grass, `T` tall grass, `R` tree, `W` water, `P` path, `F` flowers). Draw each tile as a flat coloured square, 16px tiles scaled up. *Done when:* you can see the map layout in plain colours.
- [ ] **3. Tile art in code** (Opus). Draw each tile type once into a small offscreen canvas in a Game Boy-ish pixel style: grass texture, tall-grass tufts, a round tree, water with a ripple line, path pebbles, flowers. Use `imageSmoothingEnabled=false` so it stays crisp. *Done when:* the map looks like a little pixel world, not coloured squares.
- [ ] **4. The explorer.** A small code-drawn kid sprite (hat, backpack) facing 4 directions, 2-frame walk. Placed on a path tile. *Done when:* he stands on the map facing down.
- [ ] **5. Walking.** Big on-screen D-pad (4 buttons, thumb-sized) plus arrow keys for testing. Moves one tile at a time with a short slide, blocked by trees and water. *Done when:* he walks around and can't walk through trees or water.
- [ ] **6. Camera** (Opus). Make the map 40x30 and let the view follow the explorer, clamped at the edges. Check the D-pad doesn't cover the explorer on iPhone size. *Done when:* walking to the edge scrolls the world smoothly at 428x660.

## Milestone 2: Find dinos in the grass

- [ ] **7. Rustle and encounter.** Each step into tall grass has about a 1-in-8 chance of a rustle: the tufts shake, a rustle sound, "Something's in the grass!" spoken, then `startEncounter()`. No encounter on the first 3 steps after a battle, so he isn't ambushed. *Done when:* walking in tall grass starts a normal battle.
- [ ] **8. Back to the world** (Opus). After a battle or catch, if it started from the world, return to the world at the same spot instead of home (grep how `goHome()` is called; add a flag, don't rewrite the flow). Save the explorer's position in localStorage. *Done when:* battle, win or catch, and he's back where he was standing; reloading the page keeps his spot.
- [ ] **9. Spoken guide.** First visit: "Walk into the tall grass to find dinos!" Speak again if he walks around for a while without touching grass. A soft step sound. *Done when:* a child who can't read yet knows what to do.
- [ ] **10. Publish milestone 1+2** (Opus). Full read of the live copy as CLAUDE.md says, republish `index.html` plus `overworld.js` in `files`, keep the capabilities (omit `capabilities`). Check iPhone and iPad size first. Update BACKLOG and CLAUDE.md (one line under Files for overworld.js).

## Milestone 3: Habitats

- [ ] **11. Habitat-aware wild dinos.** Give `pickWild()` an optional habitat: `forest` → plant, `volcano` → meat, `beach` → sea, `cliffs` → fly. If that habitat has nothing uncaught, fall back to the normal pick. *Done when:* `pickWild("beach")` only gives sea reptiles (test in the console).
- [ ] **12. Four zones** (Opus). Grow the map so it has 4 zones joined by paths: forest (green), volcano (dark rock, lava instead of water), beach (sand, sea), cliffs (grey rock, high ledges). Each zone gets its own tile colours from the step 3 drawing code (palette swap, not new tiles). Tall grass in each zone passes its habitat to `startEncounter`. *Done when:* grass on the beach gives sea reptiles, grass in the volcano gives meat-eaters.
- [ ] **13. Signs.** A sign at each zone entrance. Walking into it opens a Game Boy-style text box at the bottom ("Volcano. Watch out for meat-eaters!"), spoken aloud, tap to close. *Done when:* all 4 signs talk.
- [ ] **14. Publish milestone 3.** Same as step 10.

## Milestone 4: Town and boss dinos (later, only if he loves it)

- [ ] **15. Home town.** A small town in the middle: a house where his dinos heal (if they have health to heal; check first) and one friendly grown-up NPC who gives tips. Uses the step 13 text box.
- [ ] **16. Boss dino, part 1.** One boss per zone, standing on the map (not in grass). Talking to it starts a battle with a high-level wild dino and the "boss" feel: bigger picture, its own intro line. Reuse the existing battle; don't build a new one.
- [ ] **17. Boss dino, part 2: badges.** Beating a boss gives a badge, shown on the home screen. Badges must reach the cloud save, so read `mergeSaves` first and add a top-level `badges` field that merges by union. Never change the save key or remove saved fields.
- [ ] **18. Publish milestone 4.**

## Cost log

One line per session, so we learn how big a step can be. Check usage at claude.ai → Settings → Usage before and after.

| Date | Step | Model | % of week used | Notes |
|------|------|-------|----------------|-------|
