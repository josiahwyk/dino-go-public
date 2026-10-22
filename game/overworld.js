/* Dino World overworld (OVERWORLD-PLAN.md). Loaded by world.html. A separate game from Dino Go: it doesn't use index.html at all. */
(()=>{
const $=id=>document.getElementById(id);
// Spoken aloud for a young child. iPad only allows speech after a tap, so the first line waits for one.
function say(text){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.88;u.pitch=1.1;u.lang="en-AU";speechSynthesis.speak(u)}catch(e){}}

/* ---------- Map ----------
   One letter per tile: G grass, T tall grass, R tree, W water, P path, F flowers. Every row is the same width. */
const TILE=16;
const MAP=[
  "RRRRRRRRRRRRRRRRRRRR",
  "RGGGGGGFGGGGGTTTTGGR",
  "RGTTTGGGGGGGGTTTTGGR",
  "RGTTTGGGPPPPPPGGGGGR",
  "RGGGGGGGPGGGGPGGWWGR",
  "RGGFGGGGPGGFGPGWWWWR",
  "RGGGGPPPPGGGGPGWWWWR",
  "RRGGGPGGGGRRGPGGWWGR",
  "RGGGGPGTTGRRGPGGGGGR",
  "RGTTGPGTTGGGGPPPPPGR",
  "RGTTGPGGGGGFGGGGGPGR",
  "RGGGGPPPPPPPPPPPPPGR",
  "RGFGGGGGGPGGGTTTGGGR",
  "RGGGGGGGGPGGGTTTGFGR",
  "RRRRRRRRRPRRRRRRRRRR"];
const COLS=MAP[0].length, ROWS=MAP.length;
const tileAt=(x,y)=>(MAP[y]||"")[x]||"R";

/* ---------- Tile art ----------
   Each tile is a 16x16 picture written as text, one letter per pixel, with its own small palette (Game Boy Color feel).
   They're drawn once into little offscreen canvases, then the whole map is drawn once into WORLD and reused. */
const PAL={".":"#7CC46A",d:"#4E9A47",l:"#A8DC86"};   // grass, shared by tiles that sit on grass
const ART={
  G:{pal:PAL,px:[
    "................","..d.d...........","...d........l...","................",
    "..........d.d...","...l.......d....","................","....d.d.........",
    ".....d.......d.d","..............d.","...........l....","..l.............",
    ".........d.d....","d.d.......d.....",".d..............","................"]},
  T:{pal:{".":"#4FAA4F",d:"#21602B",g:"#3A8A40",l:"#9AD872"},px:[
    ".d...d...d...d..",".ld.dl...ld.dl..","..ldl..d..ldl..d","d.ldl.dl..ldl.dl",
    "ld.l.dl.ld.l.dl.",".ldgddl..ldgddl.","..dlgd....dlgd..","...dd......dd...",
    ".d...d...d...d..",".ld.dl...ld.dl..","..ldl..d..ldl..d","d.ldl.dl..ldl.dl",
    "ld.l.dl.ld.l.dl.",".ldgddl..ldgddl.","..dlgd....dlgd..","...dd......dd..."]},
  R:{pal:{...PAL,o:"#173A1F",c:"#2F7A3A",h:"#5EAE4E",k:"#225E2C",t:"#7A5230",s:"#5E9F52"},px:[
    ".....oooooo.....","...oohhccccoo...","..ohhhhcccccco..",".ohhhccccccccco.",
    "ohhcccccccccccco","ohccccccccccckco","ohccccccccccckco","occcccccccccckco",
    "occccccccccckkco",".occcccccckkkco.",".ookcccckkkkkoo.","...ooookkkooo...",
    "......otto......","......otto......",".....otttto.....","....ssssssss...."]},
  W:{pal:{w:"#5BB8E0",r:"#D2F0FA",b:"#4AA6D2"},px:[
    "wwwwwwwwwwwwwwww","wwwwwwwwwwwwwwww","wwrrwwwwwwwwwwww","wrwwrwwrwwwwwwww",
    "wwwwwrrwwwwwwwww","wwbbbbbwwwwwwwww","wwwwwwwwwwwwwwww","wwwwwwwwwwwwwwww",
    "wwwwwwwwwwwwwwww","wwwwwwwwwwrrwwww","wwwwwwwwwrwwrwwr","wwwwwwwwwwwwwrrw",
    "wwwwwwwwwwbbbbbw","wwwwwwwwwwwwwwww","wwwwwwwwwwwwwwww","wwwwwwwwwwwwwwww"]},
  P:{pal:{p:"#E8CF95",k:"#C4A066",l:"#F7E7C0"},px:[
    "pppppppppppppppp","pppppppppppplppp","pplpppppppppkkpp","ppkkpppppppppppp",
    "pppppppppppppppp","pppppppplppppppp","ppppppppkkpppppp","pppppppppppppppp",
    "pplppppppppppppp","ppkppppppppplppp","pppppppppppkkppp","pppppppppppppppp",
    "pppppplppppppppp","ppppppkkpppppplp","ppppppppppppppkp","pppppppppppppppp"]},
  F:{pal:{...PAL,f:"#F06AA6",y:"#F7D44C",w:"#FFFFFF"},px:[
    "................","...f............","..fff...........",".ffyff....w.....",
    "..fff....www....","...f....wwyww...","...d.....www....","..d.d.....w.....",
    "..........d.....","......f..d.d....",".....fff........","....ffyff.......",
    ".....fff........","......f.........","......d.........",".....d.d........"]},
};
// Edges where a tile meets a different one: water gets a darker shore line, the path a darker rim.
const EDGE={W:"#3B8FC0",P:"#CDB176"};
const tileImg={};
for(const k in ART){
  const c=document.createElement("canvas"); c.width=c.height=TILE;
  const g=c.getContext("2d"), {pal,px}=ART[k];
  px.forEach((row,y)=>[...row].forEach((ch,x)=>{g.fillStyle=pal[ch]||pal["."]||"#f0f";g.fillRect(x,y,1,1)}));
  tileImg[k]=c;
}
const WORLD=document.createElement("canvas"); WORLD.width=COLS*TILE; WORLD.height=ROWS*TILE;
(function buildWorld(){
  const g=WORLD.getContext("2d");
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
    const t=tileAt(x,y), X=x*TILE, Y=y*TILE;
    g.drawImage(tileImg[t]||tileImg.G,X,Y);
    if(EDGE[t]){g.fillStyle=EDGE[t];
      if(tileAt(x,y-1)!==t)g.fillRect(X,Y,TILE,1);
      if(tileAt(x,y+1)!==t)g.fillRect(X,Y+TILE-1,TILE,1);
      if(tileAt(x-1,y)!==t)g.fillRect(X,Y,1,TILE);
      if(tileAt(x+1,y)!==t)g.fillRect(X+TILE-1,Y,1,TILE);}
  }
})();

/* ---------- The explorer ----------
   16x16 like the tiles: 2 frames (standing, one foot forward) for down, up and right; left is right mirrored. */
const HERO_PAL={o:"#2B2220",h:"#E04A3C",H:"#A9322A",w:"#FF9C8C",s:"#F6C69A",n:"#6B4026",c:"#3E86D6",b:"#E8A23A",B:"#B8742A",p:"#3A4766"};
const HERO_PX={
  down:[[
      "................",".....oooooo.....","....ohhhhhho....","...ohhhwhhhho...",
      "..oHHHHHHHHHHo..","...onssssssno...","...osossssoso...","...osssssssso...",
      "....oossssoo....","...obccccccbo...","..osbccccccbso..","..ooccccccccoo..",
      "...oppppppppo...","...oppo..oppo...","...ooo....ooo...","................"],
    [
      "................",".....oooooo.....","....ohhhhhho....","...ohhhwhhhho...",
      "..oHHHHHHHHHHo..","...onssssssno...","...osossssoso...","...osssssssso...",
      "....oossssoo....","...obccccccbo...","..osbccccccbso..","..ooccccccccoo..",
      "...oppppppppo...","...oppo..oppo...","...ooo...oppo...",".........oooo..."]],
  up:[[
      "................",".....oooooo.....","....ohhhhhho....","...ohhhhhhhho...",
      "..oHHHHHHHHHHo..","...onnnnnnnno...","...onnnnnnnno...","....onnnnnno....",
      "...oobbbbbboo...","..osobbbbbboso..","..osoBbbbbBoso..","..oocBBBBBBcoo..",
      "...oppppppppo...","...oppo..oppo...","...ooo....ooo...","................"],
    [
      "................",".....oooooo.....","....ohhhhhho....","...ohhhhhhhho...",
      "..oHHHHHHHHHHo..","...onnnnnnnno...","...onnnnnnnno...","....onnnnnno....",
      "...oobbbbbboo...","..osobbbbbboso..","..osoBbbbbBoso..","..oocBBBBBBcoo..",
      "...oppppppppo...","...oppo..oppo...","...ooo...oppo...",".........oooo..."]],
  right:[[
      "................","....oooooo......","...ohhhhhho.....","..ohhhwhhhho....",
      "..ohhhhhhhHHHHo.","..onnssssso.....","..onssssosso....","..onsssssso.....",
      "...oossssoo.....","..obbocccco.....",".obbbocscco.....",".obbbocscco.....",
      "..obbopppo......","....oppo........","....ooooo.......","................"],
    [
      "................","....oooooo......","...ohhhhhho.....","..ohhhwhhhho....",
      "..ohhhhhhhHHHHo.","..onnssssso.....","..onssssosso....","..onsssssso.....",
      "...oossssoo.....","..obbocccco.....",".obbbocscco.....",".obbbocscco.....",
      "..obbopppo......","...opo.opo......","..ooo..ooo......","................"]]};
function spriteImg(px,flip){
  const c=document.createElement("canvas"); c.width=c.height=TILE; const g=c.getContext("2d");
  px.forEach((row,y)=>[...row].forEach((ch,x)=>{if(HERO_PAL[ch]){g.fillStyle=HERO_PAL[ch];g.fillRect(flip?TILE-1-x:x,y,1,1)}}));
  return c;
}
// Down and up get a 3rd frame: the step mirrored, so his feet take turns.
const HERO={down:[...HERO_PX.down.map(f=>spriteImg(f)),spriteImg(HERO_PX.down[1],true)],
  up:[...HERO_PX.up.map(f=>spriteImg(f)),spriteImg(HERO_PX.up[1],true)],
  right:HERO_PX.right.map(f=>spriteImg(f)),left:HERO_PX.right.map(f=>spriteImg(f,true))};
// x,y = the tile he's on (or walking to); px,py = where he's drawn while sliding between tiles.
const hero={x:9,y:12,px:9,py:12,dir:"down",frame:0};

/* ---------- Drawing ---------- */
const cv=$("w-canvas"), ctx=cv.getContext("2d");
// Fit the whole map in the space under the top bar, at a whole-number scale so pixels stay crisp.
function fit(){
  const box=$("w-view").getBoundingClientRect(), dpr=window.devicePixelRatio||1;
  const w=COLS*TILE, h=ROWS*TILE;
  let s=Math.min(box.width*dpr/w, box.height*dpr/h);
  if(s>=1)s=Math.floor(s);
  cv.width=Math.round(w*s); cv.height=Math.round(h*s);
  cv.style.width=cv.width/dpr+"px"; cv.style.height=cv.height/dpr+"px";
  draw();
}
// Called on resize and while he's sliding, not every frame (rule 9): the map is one ready-made picture, scaled up, with him on top.
function draw(){
  ctx.imageSmoothingEnabled=false;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.drawImage(WORLD,0,0,cv.width,cv.height);
  const s=cv.width/WORLD.width, X=Math.round(hero.px*TILE), Y=Math.round(hero.py*TILE);
  ctx.setTransform(s,0,0,s,0,0);
  ctx.fillStyle="rgba(0,0,0,.2)"; ctx.fillRect(X+4,Y+14,8,2); ctx.fillRect(X+3,Y+15,10,1);   // soft shadow under his feet
  ctx.drawImage(HERO[hero.dir][hero.frame],X,Y);
}

/* ---------- Walking ----------
   One tile per step with a short slide. Holding a D-pad button (or arrow key) keeps him walking. Trees and water block him; he still turns to face them. */
const STEP_MS=180, SOLID=new Set(["R","W"]);
const DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
let held=null, queued=null, moving=false, steps=0;   // queued: a quick tap made mid-slide, done next so taps never get lost
function tryStep(dir){
  if(moving){queued=dir;return}
  hero.dir=dir; hero.frame=0;
  const [dx,dy]=DIRS[dir], sx=hero.x, sy=hero.y;
  if(SOLID.has(tileAt(sx+dx,sy+dy))){draw();return}
  moving=true; hero.x+=dx; hero.y+=dy; steps++;
  const walk=(dir==="up"||dir==="down")&&steps%2?2:1, t0=performance.now();
  (function slide(now){
    const k=Math.min(1,(now-t0)/STEP_MS);
    hero.px=sx+dx*k; hero.py=sy+dy*k; hero.frame=k>.2&&k<.85?walk:0;
    draw();
    if(k<1)return requestAnimationFrame(slide);
    moving=false;
    const next=held||queued; queued=null;
    if(next)tryStep(next);
  })(t0);
}
// D-pad: press = walk that way, keep holding = keep walking, let go anywhere = stop.
for(const b of document.querySelectorAll("#w-pad [data-dir]")){
  b.addEventListener("pointerdown",e=>{e.preventDefault();held=b.dataset.dir;b.classList.add("on");tryStep(held)});
  b.addEventListener("contextmenu",e=>e.preventDefault());
}
function letGo(){held=null;for(const b of document.querySelectorAll("#w-pad .on"))b.classList.remove("on")}
addEventListener("pointerup",letGo); addEventListener("pointercancel",letGo); addEventListener("blur",letGo);
// Arrow keys (and WASD) for testing on a computer.
const KEYS={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right",w:"up",s:"down",a:"left",d:"right"};
addEventListener("keydown",e=>{const d=KEYS[e.key];if(!d)return;e.preventDefault();if(e.repeat)return;held=d;tryStep(d)});
addEventListener("keyup",e=>{if(KEYS[e.key]===held)held=null});

/* ---------- Start ---------- */
window.addEventListener("resize",fit);
addEventListener("pointerdown",()=>say("Let's explore! Press the arrows to walk."),{once:true});
fit();
})();
