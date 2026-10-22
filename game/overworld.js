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
// Step 2: plain colours. Step 3 replaces these with pixel tiles drawn in code.
const FLAT={G:"#7CC46A",T:"#3F9A45",R:"#24592E",W:"#5BB8E0",P:"#E8CF95",F:"#E89AC0"};
const tileAt=(x,y)=>(MAP[y]||"")[x]||"R";

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
function draw(){
  const s=cv.width/(COLS*TILE);
  ctx.imageSmoothingEnabled=false;
  ctx.setTransform(s,0,0,s,0,0);
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){ctx.fillStyle=FLAT[tileAt(x,y)]||FLAT.G; ctx.fillRect(x*TILE,y*TILE,TILE,TILE);}
}

/* ---------- Start ---------- */
window.addEventListener("resize",fit);
addEventListener("pointerdown",()=>say("Let's explore!"),{once:true});
fit();
})();
