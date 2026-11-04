/* ---------- Data ---------- */
const TYPES={plant:{label:"Plant-eater",e:"🦕"},meat:{label:"Meat-eater",e:"🦖"},sea:{label:"Sea reptile",e:"🌊"},fly:{label:"Flying reptile",e:"☁️"}};
// id, name, type, length, food, when, where, fun, hp, atk, say (TTS spelling for tricky names)
const SPECIES=[
["01_triceratops","Triceratops","plant","About 9 metres, as long as a fire truck","Plants","68 to 66 million years ago","North America","Its name means three-horned face.",26,5],
["02_stegosaurus","Stegosaurus","plant","About 9 metres","Plants","155 to 150 million years ago","North America","The spikes on its tail are called a thagomizer.",24,5],
["03_brachiosaurus","Brachiosaurus","plant","About 22 metres, almost two buses long","Plants","154 to 150 million years ago","North America","It could lift its head higher than a three-storey building.",30,4],
["04_ankylosaurus","Ankylosaurus","plant","About 7 metres","Plants","68 to 66 million years ago","North America","It swung the heavy club on its tail to protect itself.",28,4],
["05_parasaurolophus","Parasaurolophus","plant","About 9 metres","Plants","76 to 73 million years ago","North America","Air going through its long crest may have made a loud honking sound.",22,3],
["06_diplodocus","Diplodocus","plant","About 26 metres, more than two buses long","Plants","154 to 152 million years ago","North America","Its tail had about 80 bones in it.",30,3],
["07_iguanodon","Iguanodon","plant","About 10 metres","Plants","126 to 122 million years ago","Europe","It was one of the very first dinosaurs ever named, back in 1825.",22,4],
["08_pachycephalosaurus","Pachycephalosaurus","plant","About 4.5 metres","Plants","70 to 66 million years ago","North America","The dome on its head was made of very thick bone.",18,5,"pack-ee-seff-allo-saw-rus"],
["09_styracosaurus","Styracosaurus","plant","About 5.5 metres","Plants","About 75 million years ago","North America","Its name means spiked lizard.",22,5,"sty-rack-oh-saw-rus"],
["10_argentinosaurus","Argentinosaurus","plant","About 35 metres, three buses long","Plants","About 95 million years ago","South America","It is one of the biggest land animals that ever lived.",34,3],
["11_protoceratops","Protoceratops","plant","About 2 metres, as long as a sofa","Plants","75 to 71 million years ago","Asia","One fossil shows a Protoceratops and a Velociraptor locked in a fight.",14,3],
["12_kentrosaurus","Kentrosaurus","plant","About 4.5 metres","Plants","About 152 million years ago","Africa","It was a smaller cousin of Stegosaurus.",18,5],
["13_edmontosaurus","Edmontosaurus","plant","About 12 metres, as long as a bus","Plants","73 to 66 million years ago","North America","It had hundreds of teeth for grinding up plants.",24,3],
["14_corythosaurus","Corythosaurus","plant","About 9 metres","Plants","77 to 75 million years ago","North America","Its name means helmet lizard.",22,3,"co-rith-oh-saw-rus"],
["15_therizinosaurus","Therizinosaurus","plant","About 9 metres","Mostly plants","About 70 million years ago","Asia","Its claws were as long as your arm, but it mostly ate plants.",24,6,"theh-rizz-in-oh-saw-rus"],
["16_amargasaurus","Amargasaurus","plant","About 10 metres","Plants","129 to 122 million years ago","South America","It was found in Argentina, near a place called La Amarga.",24,4],
["17_psittacosaurus","Psittacosaurus","plant","About 2 metres","Plants","125 to 100 million years ago","Asia","Its name means parrot lizard.",14,3,"sit-ack-oh-saw-rus"],
["18_maiasaura","Maiasaura","plant","About 9 metres","Plants","About 77 million years ago","North America","Its name means good mother lizard. Scientists found its nests with babies.",22,3,"my-ah-saw-rah"],
["19_muttaburrasaurus","Muttaburrasaurus","plant","About 8 metres","Plants","About 100 million years ago","Australia (Queensland)","It was named after the town of Muttaburra in Queensland.",22,4,"mutta-burra-saw-rus"],
["20_minmi","Minmi","plant","About 3 metres","Plants","About 115 million years ago","Australia (Queensland)","It was named after Minmi Crossing in Queensland, where it was found.",18,4],
["21_trex","T. rex","meat","About 12 metres, as long as a bus","Meat","68 to 66 million years ago","North America","It had one of the strongest bites of any land animal ever.",30,7,"Tyrannosaurus rex"],
["22_velociraptor","Velociraptor","meat","About 2 metres, as big as a turkey","Meat","75 to 71 million years ago","Asia","It was covered in feathers.",14,6],
["23_spinosaurus","Spinosaurus","meat","About 14 metres","Fish and meat","About 95 million years ago","Africa","It ate lots of fish and spent time in the water.",30,7],
["24_allosaurus","Allosaurus","meat","About 8.5 metres","Meat","155 to 145 million years ago","North America","It was the top hunter in the time of Stegosaurus.",26,6],
["25_carnotaurus","Carnotaurus","meat","About 8 metres","Meat","72 to 69 million years ago","South America","Its name means meat-eating bull.",24,6],
["26_giganotosaurus","Giganotosaurus","meat","About 12 metres, as long as a bus","Meat","About 98 million years ago","South America","It was about as big as T. rex, maybe a little bigger.",30,7,"jig-a-note-oh-saw-rus"],
["27_dilophosaurus","Dilophosaurus","meat","About 7 metres","Meat","About 190 million years ago","North America","Its name means two-crested lizard.",22,6,"die-loff-oh-saw-rus"],
["28_baryonyx","Baryonyx","meat","About 9 metres","Fish and meat","About 125 million years ago","Europe (England)","Scientists found fish scales inside its stomach.",24,6,"barry-on-ix"],
["29_utahraptor","Utahraptor","meat","About 6 metres","Meat","About 135 million years ago","North America","It was one of the biggest raptors ever found.",22,7],
["30_microraptor","Microraptor","meat","Less than 1 metre","Small animals, fish and lizards","About 120 million years ago","Asia","It had four feathered wings, and its feathers were shiny black.",12,4],
["31_deinonychus","Deinonychus","meat","About 3.4 metres","Meat","115 to 108 million years ago","North America","Its name means terrible claw.",18,6,"die-non-ick-us"],
["32_compsognathus","Compsognathus","meat","About 1 metre, as big as a chicken","Lizards and insects","About 150 million years ago","Europe","It was one of the smallest dinosaurs.",10,4,"comp-sog-nay-thus"],
["33_yutyrannus","Yutyrannus","meat","About 9 metres","Meat","About 125 million years ago","Asia","Its full name means beautiful feathered tyrant.",26,7,"you-tie-ran-us"],
["34_australovenator","Australovenator","meat","About 6 metres","Meat","About 95 million years ago","Australia (Queensland)","Scientists nicknamed it Banjo, after the poet Banjo Paterson.",20,6,"oss-tral-oh-ven-ah-tor"],
["35_mosasaurus","Mosasaurus","sea","Up to about 15 metres","Fish, turtles and other sea animals","82 to 66 million years ago","Seas around the world","It was not a dinosaur. It was a giant sea lizard, related to snakes and monitor lizards.",30,7,"moe-za-saw-rus"],
["36_plesiosaurus","Plesiosaurus","sea","About 3.5 metres","Fish and squid-like animals","About 195 million years ago","Europe (England)","A fossil hunter called Mary Anning found the first full skeleton in 1823.",18,4,"plee-zee-oh-saw-rus"],
["37_ichthyosaurus","Ichthyosaurus","sea","About 2 metres","Fish and squid-like animals","200 to 190 million years ago","Europe","It gave birth to live babies in the water, like dolphins do.",16,4,"ick-thee-oh-saw-rus"],
["38_kronosaurus","Kronosaurus","sea","About 10 metres","Sea animals","About 110 million years ago","Australia (Queensland)","Its fossils were found in Queensland, where an inland sea used to be.",30,7],
["39_pteranodon","Pteranodon","fly","Wings about 6 metres wide","Fish","86 to 84 million years ago","North America","Its name means wing without teeth. It was a flying reptile, not a dinosaur.",18,5,"ter-an-oh-don"],
["40_quetzalcoatlus","Quetzalcoatlus","fly","Wings about 10 metres wide","Small animals","68 to 66 million years ago","North America","Standing up, it was as tall as a giraffe.",24,6,"ket-sal-co-at-lus"]
].map(a=>({id:a[0],n:+a[0].slice(0,2),name:a[1],type:a[2],len:a[3],food:a[4],when:a[5],where:a[6],fun:a[7],hp:a[8],atk:a[9],say:a[10]||a[1]}));
const BY=Object.fromEntries(SPECIES.map(s=>[s.id,s]));
// Every dino has art published with the game (dinos/<id>.webp + _attack.webp; tests/run.js checks the files are there).
const BUILTIN=new Set(SPECIES.map(s=>s.id));
