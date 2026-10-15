# Dino Go — image prompts (40 dinos)

## Style rules (prepend to every prompt)
Original cartoon dinosaur character for a children's game for a young child. Not based on any existing franchise, show or game. Match the attached style reference image exactly.
- Friendly, cute, chunky proportions: big head, big round eyes, small body, short legs
- Thick clean dark outlines, flat colours with soft simple shading
- Bright, saturated, kid-friendly palette; happy or curious expression, never scary, no blood
- Show the species' real identifying features (horns, crests, plates, feathers) so a dinosaur-loving kid recognises it
- One character only, full body, side-on three-quarter view, facing right, centred
- Plain solid white background, no ground, no shadows, no scenery, no text, square image

## Dinos (filename | type | prompt)
01_triceratops | plant-eater | Triceratops: three face horns, big round neck frill. Orange body, teal frill.
02_stegosaurus | plant-eater | Stegosaurus: two rows of tall back plates, four tail spikes. Green body, orange plates.
03_brachiosaurus | plant-eater | Brachiosaurus: very long neck held high, front legs longer than back legs. Sky blue with white belly.
04_ankylosaurus | plant-eater | Ankylosaurus: armoured back with bumps, heavy club at the end of the tail. Sandy brown with dark brown armour.
05_parasaurolophus | plant-eater | Parasaurolophus: long tube-shaped crest curving backwards from the head. Purple with yellow crest.
06_diplodocus | plant-eater | Diplodocus: extremely long neck and very long whip-like tail. Lime green with darker stripes.
07_iguanodon | plant-eater | Iguanodon: big spike on each thumb. Olive green with cream belly.
08_pachycephalosaurus | plant-eater | Pachycephalosaurus: thick round dome on top of the head with little bumps. Red-brown with a pale dome.
09_styracosaurus | plant-eater | Styracosaurus: one long nose horn, long spikes around the frill. Yellow body, red frill spikes.
10_argentinosaurus | plant-eater | Argentinosaurus: giant long-necked sauropod, enormous and heavy. Grey with soft blue patches.
11_protoceratops | plant-eater | Protoceratops: small, parrot-like beak, small frill, no big horns. Tan with brown spots.
12_kentrosaurus | plant-eater | Kentrosaurus: plates on the front of the back turning into long spikes, shoulder spikes. Teal with pink spikes.
13_edmontosaurus | plant-eater | Edmontosaurus: flat duck-like bill, walks on two legs. Light green with dark green stripes.
14_corythosaurus | plant-eater | Corythosaurus: rounded helmet-shaped crest on the head. Blue with orange crest.
15_therizinosaurus | plant-eater | Therizinosaurus: huge long claws on its arms, pot belly, a little fluffy feathers. Cream with brown feathers.
16_amargasaurus | plant-eater | Amargasaurus: two rows of tall spines along the neck. Pink with purple spines.
17_psittacosaurus | plant-eater | Psittacosaurus: small, parrot beak, little bristles on the tail. Yellow-green with orange beak.
18_maiasaura | plant-eater | Maiasaura: duck-billed with a small bump crest, gentle mother dinosaur. Peach with brown spots.
19_muttaburrasaurus | plant-eater | Muttaburrasaurus: bump on its snout, sturdy body. Gold with green stripes.
20_minmi | plant-eater | Minmi: small armoured dinosaur with little bony plates. Brown with orange armour.
21_trex | meat-eater | Tyrannosaurus rex: huge head, big teeth, tiny two-fingered arms. Dark green with yellow belly.
22_velociraptor | meat-eater | Velociraptor: small, covered in feathers, big curved toe claw. Blue and white feathers.
23_spinosaurus | meat-eater | Spinosaurus: tall sail on its back, long crocodile-like snout. Red with orange sail.
24_allosaurus | meat-eater | Allosaurus: small horns above the eyes, three-fingered arms. Brown with dark stripes.
25_carnotaurus | meat-eater | Carnotaurus: two bull-like horns above the eyes, very tiny arms. Red with black spots.
26_giganotosaurus | meat-eater | Giganotosaurus: very large, long low head, three-fingered hands. Grey with red stripes.
27_dilophosaurus | meat-eater | Dilophosaurus: two thin crests on top of the head, no neck frill. Yellow with black stripes.
28_baryonyx | meat-eater | Baryonyx: long crocodile-like snout, one huge thumb claw. Green-brown with cream belly.
29_utahraptor | meat-eater | Utahraptor: big feathered raptor, large curved toe claw. Orange and brown feathers.
30_microraptor | meat-eater | Microraptor: tiny, feathered wings on both arms and legs. Shiny black feathers with a blue shimmer.
31_deinonychus | meat-eater | Deinonychus: feathered, long stiff tail, big toe claw. Grey with white feathers.
32_compsognathus | meat-eater | Compsognathus: very tiny, chicken-sized, quick and slim. Light green with yellow belly.
33_yutyrannus | meat-eater | Yutyrannus: feathered tyrannosaur covered in fluffy feathers. White and grey feathers.
34_australovenator | meat-eater | Australovenator: slim and fast, big hand claws. Rust red with tan stripes.
35_mosasaurus | sea-reptile | Mosasaurus: long body, flippers, tail fin, big jaws. Dark blue with light blue belly.
36_plesiosaurus | sea-reptile | Plesiosaurus: long neck, small head, four big flippers. Turquoise with white spots.
37_ichthyosaurus | sea-reptile | Ichthyosaurus: dolphin-shaped, big eyes, tail fin. Silver-blue.
38_kronosaurus | sea-reptile | Kronosaurus: huge head, short neck, four flippers. Navy with grey stripes.
39_pteranodon | flying-reptile | Pteranodon: long pointed crest on the back of the head, big wings, no teeth. Purple wings, cream body.
40_quetzalcoatlus | flying-reptile | Quetzalcoatlus: giant, very long neck and beak, huge wings. Grey with red crest.

## Attack poses (for battles)

Make these after the normal picture, one per dino. Attach two images to each prompt: the style reference AND that dino's own picture from assets/dinos/, so it stays the same character.

Save as `NN_name_attack.jpeg` in assets/dinos/ (e.g. `01_triceratops_attack.jpeg`). Then copy a 512px version into game/dinos/ as `NN_name_attack.jpg` and run `python3 tools/cutout.py` on it.

### Attack style rules (prepend to every attack prompt)
Same cartoon dinosaur character as the attached character image: identical colours, markings, proportions and outline style. Only the pose and expression change. Match the attached style reference exactly.
- Mid-attack action pose, full of energy, leaning forward towards the right
- Determined, brave, playful expression (eyebrows down, small confident grin or open mouth roaring). Never scary, angry or mean; no blood, no sharp drool, no visible injury
- Keep the whole body inside the frame, nothing cropped, roughly the same size in the frame as the original picture
- One character only, side-on three-quarter view, facing right
- Plain solid white background, no ground, no shadows, no motion lines, no dust, no effects, no text, square image

### Attack prompts (filename | attack)
01_triceratops_attack | Triceratops charging forward with head lowered, all three horns pointing ahead, front foot stamping.
02_stegosaurus_attack | Stegosaurus swinging its spiked tail up and forward, body twisting, back plates standing tall.
03_brachiosaurus_attack | Brachiosaurus rearing up on its back legs, front legs raised high ready to stomp down, neck stretched up.
04_ankylosaurus_attack | Ankylosaurus swinging its heavy tail club in a big arc to the side, body braced low.
05_parasaurolophus_attack | Parasaurolophus leaning forward with mouth open in a big honk, crest held high, one foot kicking forward.
06_diplodocus_attack | Diplodocus whipping its long tail in a wide curve towards the right, neck pulled back.
07_iguanodon_attack | Iguanodon standing up on its back legs, thumb spikes thrust forward like a karate chop.
08_pachycephalosaurus_attack | Pachycephalosaurus running head-first with its dome lowered for a head bump, back leg kicking off.
09_styracosaurus_attack | Styracosaurus charging with its long nose horn pointed forward, frill spikes flared wide.
10_argentinosaurus_attack | Argentinosaurus lifting one giant front foot high for a ground-shaking stomp, neck swinging down.
11_protoceratops_attack | Protoceratops leaping forward with its beak open wide, small frill raised.
12_kentrosaurus_attack | Kentrosaurus swinging its long tail spikes sideways, shoulder spikes pointing out.
13_edmontosaurus_attack | Edmontosaurus rearing up on two legs, duck bill open in a loud call, front feet up.
14_corythosaurus_attack | Corythosaurus leaning forward in a big honk, helmet crest held high, tail out for balance.
15_therizinosaurus_attack | Therizinosaurus with both long-clawed arms raised and swinging forward, feathers fluffed up.
16_amargasaurus_attack | Amargasaurus lowering its neck to point the two rows of neck spines forward, front foot stamping.
17_psittacosaurus_attack | Psittacosaurus jumping forward with its parrot beak open, tail bristles up.
18_maiasaura_attack | Maiasaura stamping forward protectively, bill open in a call, tail swung out.
19_muttaburrasaurus_attack | Muttaburrasaurus leaning forward with its snout bump leading a charge, front foot raised.
20_minmi_attack | Minmi tucked low and rolling forward like a little armoured ball, plates bristling.
21_trex_attack | T. rex mid-roar, big mouth wide open (teeth rounded and friendly), tiny arms out, leaning forward on one leg.
22_velociraptor_attack | Velociraptor leaping through the air, feathered arms spread, big toe claw raised.
23_spinosaurus_attack | Spinosaurus lunging forward with its long snout open, sail standing tall.
24_allosaurus_attack | Allosaurus leaning forward with mouth open in a roar, three-fingered hands reaching out.
25_carnotaurus_attack | Carnotaurus charging head-down with its two bull horns forward, tiny arms tucked.
26_giganotosaurus_attack | Giganotosaurus mid-roar, long head stretched forward, hands reaching.
27_dilophosaurus_attack | Dilophosaurus with both head crests raised, mouth open in a hiss, leaning forward.
28_baryonyx_attack | Baryonyx swiping its big thumb claw forward, crocodile snout open.
29_utahraptor_attack | Utahraptor leaping forward with its big toe claw raised, feathered arms spread.
30_microraptor_attack | Microraptor gliding forward with all four feathered wings spread wide.
31_deinonychus_attack | Deinonychus mid-pounce with its big toe claw raised, stiff tail straight out behind.
32_compsognathus_attack | Compsognathus sprinting forward in a fast dash, legs blurred mid-stride, mouth open.
33_yutyrannus_attack | Yutyrannus roaring forward with its fluffy feathers puffed up big.
34_australovenator_attack | Australovenator slashing forward with both big hand claws, running fast.
35_mosasaurus_attack | Mosasaurus bursting forward with its big jaws open, tail fin curled for a push.
36_plesiosaurus_attack | Plesiosaurus whipping its long neck forward, front flippers sweeping back.
37_ichthyosaurus_attack | Ichthyosaurus leaping forward like a dolphin, tail fin flicking.
38_kronosaurus_attack | Kronosaurus lunging forward with its huge head and open jaws, flippers pushing.
39_pteranodon_attack | Pteranodon diving down towards the right with wings swept back and beak pointed forward.
40_quetzalcoatlus_attack | Quetzalcoatlus swooping forward with huge wings spread wide and long beak stabbing ahead.
