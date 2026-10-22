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
// Only called on resize for now (rule 9): the map is one ready-made picture, just scaled up.
function draw(){
  ctx.imageSmoothingEnabled=false;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.drawImage(WORLD,0,0,cv.width,cv.height);
}

/* ---------- Start ---------- */
window.addEventListener("resize",fit);
addEventListener("pointerdown",()=>say("Let's explore!"),{once:true});
fit();
})();
