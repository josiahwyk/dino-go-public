/* ---------- Catch (spelling) ---------- */
// Year 1 challenge words (AC9 English), mixed in with his homework words about 1 catch in 4.
const CHALLENGE=[
  "wish","rest","ship","chat","shop","then","stop","frog","swim","flag","black","step", // digraphs and blends (AC9E1LY11, LY13)
  "time","cake","rain","play","keep","boat","ride","home",                          // common long vowels (AC9E1LY11)
  "plays","played","playing","jumped","helped","looking",                         // word families (AC9E1LY15)
  "rabbit","sunset","picnic","dinner","garden","robot",                            // two-syllable words (AC9E1LY13)
  "one","have","pretty","little","what","where"];                                 // high-frequency words (AC9E1LY14)
// Built-in word bank for the grown-up "Suggest words" button (no internet or AI). Words are lowercase letters only (that is all Save accepts).
// "a/b" entries are homophone pairs and are always suggested together. Words in CHALLENGE are never suggested.
const PATTERNS=[
  {y:1,name:"Short vowels (cat, sit, hop)",w:"cat sit hop bug red pig dog sun hen mud cup net bag lip pot web jam tin rug map fan leg bed hug"},
  {y:1,name:"Digraphs: sh, ch, th, wh (fish, chin, this)",w:"ship shop shed fish dish chat chop chin much such rich thin thick this that with whip when which shell chick thank path bath wish then"},
  {y:1,name:"Blends at the start (frog, step, clap)",w:"frog flag swim step stop black clap drum grab plum snap slip crab drip flat skip spot trip twin clock glad brick plan sled stem flip grin"},
  {y:1,name:"Blends at the end (hand, nest, jump)",w:"hand lamp nest milk jump tent desk gift camp belt sand pond lost went fast list dust bend rest"},
  {y:1,name:"Long vowels: magic e (make, bike, hope)",w:"make game name late bike five nine kite hope bone rope nose cube tube huge cute lake wave like hole joke rule time cake home ride"},
  {y:1,name:"Long vowels: ai, ay, ee, ea, oa (rain, play, keep, boat)",w:"tail wait sail train day say stay tray feet tree seed sleep green eat sea read team leaf road coat goat soap toast rain play keep boat"},
  {y:1,name:"Endings -ed and -ing (jumped, looking)",w:"walked picked asked wanted jumping helping walking picking asking painted kicked pulled called talking singing camping lifted melted rested resting jumped helped looking played playing plays"},
  {y:1,name:"Plurals: -s and -es (cats, boxes, dishes)",w:"cats dogs hats cups pigs books trees birds boxes dishes foxes buses kisses wishes brushes glasses lunches"},
  {y:1,name:"Two-syllable and compound words (rabbit, sunset)",w:"pancake cupcake bedroom rainbow raincoat outside inside cannot into upon seaside someone window finger summer winter pocket basket happy funny jumper tiger lemon magic number spider yellow kitten button puppet ladder monster rabbit sunset picnic dinner garden robot"},
  {y:1,name:"Tricky everyday words (said, was, they)",w:"some said was were are you your come there here they put push pull full give live love does who why one have little what where pretty"},
  {y:2,name:"Long vowels: igh, ow, ue, ew (night, snow, blue, flew)",w:"night light right high fight bright flight tonight snow grow show blow slow blue glue true clue flew grew new chew threw knew"},
  {y:2,name:"Endings -ed and -ing that change the word (hopped, making)",w:"hopped hopping stopped running swimming sitting clapped skipped planned grabbed making baking hiking riding hoped baked liked smiled chased danced shining taking coming having writing giving dropping"},
  {y:2,name:"Vowel pairs: ou, ow, oi, oy (house, down, coin, boy)",w:"house mouse cloud found sound round loud out down brown town crown clown owl boil coin soil join oil boy toy enjoy royal"},
  {y:2,name:"Vowel pairs: oo, aw, au (moon, book, paw, sauce)",w:"moon food cool school spoon book look good wood foot paw saw draw yawn claw lawn sauce cause haunt"},
  {y:2,name:"Bossy r: ar, or, er, ir, ur (car, fork, bird, turn)",w:"car star farm park dark yard shark storm horse corn fork sport born her fern term sister bird girl shirt first third turn burn hurt nurse purple fur"},
  {y:2,name:"Soft c and g (city, race, giant, page)",w:"city race face nice mice rice ice price place space circle cent fence dance pencil giant gentle page cage huge gem stage orange change magic"},
  {y:2,name:"Silent letters: kn, wr, gn, mb (knee, write, lamb)",w:"knee knock knot knife know write wrong wrap wrist wren gnat gnome lamb comb thumb climb crumb limb"},
  {y:2,name:"Endings: -ck, -tch, -dge (duck, catch, badge)",w:"duck neck sock pack kick back deck luck catch match patch watch witch ditch pitch fetch badge edge fudge bridge judge hedge ridge lodge"},
  {y:2,name:"Word endings: -ful, -less, -ly, -er, -est (helpful, slowly)",w:"helpful careful playful painful useful thankful hopeful helpless careless homeless hopeless endless quickly slowly softly kindly sadly loudly quietly faster slower taller smaller tallest"},
  {y:2,name:"Plurals: -ies, -ves and odd ones (babies, wolves, feet)",w:"babies puppies ponies flies cities stories berries wolves leaves knives shelves children mice feet teeth geese men women"},
  {y:2,name:"Words that sound the same (see/sea, two/too)",w:"their/there to/too/two see/sea no/know blue/blew here/hear night/knight sun/son bear/bare tail/tale meet/meat road/rode wait/weight fair/fare pair/pear flour/flower hour/our write/right whole/hole sail/sale"},
  {y:2,name:"Tricky Year 2 words (because, friend, people)",w:"because friend people would again thought through other water before always every first after been many any only even never along around laugh another school country enough"},
].map(p=>({...p,list:p.w.split(" ")}));
// Decoy letters that are easy to mix up with the word's real letters (b/d, short vowels, c/k/s...)
const CONFUSE={a:"eou",e:"ai",i:"ey",o:"au",u:"oa",b:"dp",d:"bp",p:"bd",m:"nw",n:"mh",c:"ks",k:"c",s:"cz",g:"j",j:"g",f:"vt",v:"fw",w:"vy",y:"wi",h:"n",t:"fl",l:"it",r:"wn",x:"ks",z:"s"};

// plus common English words that aren't in the lists (from the first few hundred sight words)
const COMMON="the of and a to in is you that it he was for on are as with his they i at be this have from or one had by word but not what all were we when your can said there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who its now find long down day did get come made may part over new sound take only little work know place year live me back give most very after thing our just name good man think say great where help through much before line right too mean old any same tell boy follow came want show also around form three small set put end does another well large must big even such because turn here why ask went men read need land different home us move try kind hand again change off play spell air away animal house point page letter mother answer found still learn should world hat sat mat bat rat bad dad mad sad bed fed led red ten hen pen men pin win bin tin hot got lot not pot dot cut hut nut but fun run sun bun bug hug mug rug dog log fog hog den din dim ham him hum hop hip hit hut lap lip lop map mop nap net nod pad pat peg pet pig pit pod pop pup rag ram rim rip rob rod rot rub sap sip sit sob tap tip top tub van vet wag web wet wig yes yet zip cold fold mold bold sold toad load road loud lord last lost list lust fast fist mast mist past best rest test vest west nest pest cake take make lake bake rake wake sake came game name same tame late gate hate mate rate home some come dome more sore bore core tore wore door poor floor block clock rock sock lock duck luck stack track".split(" ");
