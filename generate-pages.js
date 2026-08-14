const fs = require('fs');
const path = require('path');

const SITE = 'https://www.eggermath.com';

const GAMES = [
  { title: 'Pokemon Emerald', slug: 'pokemon-emerald', genre: 'RPG', series: 'Pokemon', year: '2004', developer: 'Game Freak', rating: 9.2, ratingCount: 187, tags: ['turn-based', 'exploration', 'collection', 'strategy', 'cartoonish', 'vibrant colors'], desc: 'Play Pokemon Emerald online in your browser. Explore the Hoenn region, catch 200+ Pokemon, challenge gym leaders, and face Team Magma and Team Aqua. Features the Battle Frontier post-game with 7 challenge facilities. One of the best GBA RPGs ever made.', controls: '↑↓←→ Move | A Confirm | B Cancel | Start Menu | Select Pokédex', mega: 'Pokemon - Emerald Version (USA, Europe).zip', official: true },
  { title: 'Pokemon FireRed', slug: 'pokemon-firered', genre: 'RPG', series: 'Pokemon', year: '2004', developer: 'Game Freak', rating: 9.0, ratingCount: 152, tags: ['turn-based', 'exploration', 'collection', 'retro 3D', 'cartoonish'], desc: 'Play Pokemon FireRed online. An enhanced remake of Pokemon Red for GBA with updated graphics, abilities, and the Sevii Islands post-game. Explore Kanto, collect all 151 original Pokemon, and become Pokemon Champion.', controls: '↑↓←→ Move | A Confirm | B Cancel | Start Menu | Select Pokédex', mega: 'Pokemon_ FireRed Version.zip', official: true },
  { title: 'Pokemon LeafGreen', slug: 'pokemon-leafgreen', genre: 'RPG', series: 'Pokemon', year: '2004', developer: 'Game Freak', rating: 8.8, ratingCount: 98, tags: ['turn-based', 'exploration', 'collection', 'cartoonish'], desc: 'Play Pokemon LeafGreen online in your browser. The counterpart to FireRed featuring Pokemon Green exclusives. Explore Kanto with updated graphics, new mechanics like abilities and natures, and the Sevii Islands.', controls: '↑↓←→ Move | A Confirm | B Cancel | Start Menu | Select Pokédex', mega: 'Pokemon - Leaf Green Version (U) (V1.1).zip', official: true },
  { title: 'Pokemon Ruby', slug: 'pokemon-ruby', genre: 'RPG', series: 'Pokemon', year: '2002', developer: 'Game Freak', rating: 8.7, ratingCount: 121, tags: ['turn-based', 'exploration', 'collection', 'vibrant colors'], desc: 'Play Pokemon Ruby online. Journey through the Hoenn region, catch 135 new Pokemon, and stop Team Magma from expanding the land. Features double battles, Pokemon Contests, and the Battle Tower.', controls: '↑↓←→ Move | A Confirm | B Cancel | Start Menu | Select Pokédex', mega: 'Pokemon_ Ruby Version.zip', official: true },
  { title: 'Pokemon Sapphire', slug: 'pokemon-sapphire', genre: 'RPG', series: 'Pokemon', year: '2002', developer: 'Game Freak', rating: 8.7, ratingCount: 87, tags: ['turn-based', 'exploration', 'collection', 'vibrant colors'], desc: 'Play Pokemon Sapphire online in your browser. The counterpart to Ruby featuring Team Aqua and exclusive Pokemon. Explore Hoenn, master double battles, and challenge the Battle Tower.', controls: '↑↓←→ Move | A Confirm | B Cancel | Start Menu | Select Pokédex', mega: 'Pokemon_ Sapphire Version.zip', official: true },
  { title: 'Pokemon Ultra Violet', slug: 'pokemon-ultra-violet', genre: 'RPG', series: 'Pokemon', year: '2023', developer: 'LSA', rating: 8.5, ratingCount: 64, tags: ['rom hack', 'turn-based', 'exploration', 'collection', 'all pokemon'], desc: 'Play Pokemon Ultra Violet online. A FireRed ROM hack featuring all Pokemon from Gen 1-3 in one game. Catch every Pokemon without trading, explore expanded Sevii Islands, and enjoy quality-of-life improvements.', controls: '↑↓←→ Move | A Confirm | B Cancel | Start Menu | Select Pokédex', mega: 'Pokemon Ultra Violet (1.22) LSA (Fire Red Hack).zip', official: false },
  { title: 'Pokemon Jupiter', slug: 'pokemon-jupiter', genre: 'RPG', series: 'Pokemon', year: '2023', developer: 'ROM Hack', rating: 8.3, ratingCount: 41, tags: ['rom hack', 'fakemon', 'turn-based', 'exploration', 'dark story'], desc: 'Play Pokemon Jupiter online. A Ruby ROM hack set in the Oxalis region with 200+ new fakemon, custom story, and updated mechanics. Features a darker narrative and challenging gym battles.', controls: '↑↓←→ Move | A Confirm | B Cancel | Start Menu | Select Pokédex', mega: 'Pokemon Jupiter - 6.04 (Ruby Hack).zip', official: false },
  { title: 'Zelda: Minish Cap', slug: 'zelda-minish-cap', genre: 'Adventure', series: 'Zelda', year: '2004', developer: 'Capcom', rating: 9.1, ratingCount: 134, tags: ['action-adventure', 'puzzle-solving', 'exploration', 'boss fights', 'cartoonish'], desc: 'Play Zelda Minish Cap online in your browser. Help Link shrink to Minish size and explore Hyrule from a new perspective. Features the Gust Jar, Mole Mitts, and the ability to fuse Kinstones with NPCs.', controls: '↑↓←→ Move | A Sword | B Item | L/R Assign Items | Start Pause', mega: 'Legend of Zelda, The_ The Minish Cap.zip', official: true },
  { title: 'Zelda: A Link to the Past', slug: 'zelda-link-to-the-past', genre: 'Adventure', series: 'Zelda', year: '2002', developer: 'Nintendo', rating: 9.0, ratingCount: 112, tags: ['action-adventure', 'puzzle-solving', 'exploration', 'boss fights', 'dungeons'], desc: 'Play Zelda A Link to the Past online. The GBA port of the SNES classic featuring both the original Light/Dark World adventure and the new Four Swords multiplayer mode.', controls: '↑↓←→ Move | A Attack | B Item | Start Map | Select Item Switch', mega: 'Legend of Zelda, The - A Link to the Past & Four Swords (USA).zip', official: true },
  { title: 'Mario Kart Super Circuit', slug: 'mario-kart-super-circuit', genre: 'Racing', series: 'Mario', year: '2001', developer: 'Nintendo', rating: 8.6, ratingCount: 95, tags: ['racing', 'multiplayer', 'vehicles', 'casual play', 'vibrant colors'], desc: 'Play Mario Kart Super Circuit online in your browser. The first portable Mario Kart featuring 20 tracks from Super Mario Kart (SNES) plus 20 new courses. Drift, use items, and race.', controls: '↑↓←→ Steer | A Accelerate | B Item | L Drift | R Item Use', mega: 'Mario Kart_ Super Circuit.zip', official: true },
  { title: 'Super Mario World', slug: 'super-mario-world', genre: 'Platformer', series: 'Mario', year: '2002', developer: 'Nintendo', rating: 9.0, ratingCount: 143, tags: ['platforming precision', 'side-scrolling', 'boss fights', 'secret exits', 'cartoonish'], desc: 'Play Super Mario World online. The GBA port of the SNES classic featuring Yoshi, secret exits, and 96 levels. Explore Dinosaur Land and rescue Princess Peach from Bowser.', controls: '↑↓←→ Move | A Jump | B Run | L/Y Spin Jump', mega: 'Super Mario Advance 2_ Super Mario World.zip', official: true },
  { title: 'Mario & Luigi: Superstar Saga', slug: 'mario-luigi-superstar-saga', genre: 'RPG', series: 'Mario', year: '2003', developer: 'AlphaDream', rating: 8.9, ratingCount: 78, tags: ['turn-based', 'action RPG', 'humor', 'combo attacks', 'cartoonish'], desc: 'Play Mario & Luigi Superstar Saga online. An action RPG where Mario and Luigi travel to the Beanbean Kingdom. Features timing-based combat, Bros. Attacks, and humorous dialogue.', controls: '↑↓←→ Move | A Action | B Jump | Start Menu | Select Bros. Move', mega: 'Mario & Luigi_ Superstar Saga.zip', official: true },
  { title: 'Classic NES: Super Mario Bros', slug: 'classic-nes-super-mario-bros', genre: 'Platformer', series: 'Mario', year: '2004', developer: 'Nintendo', rating: 8.2, ratingCount: 56, tags: ['platforming precision', 'side-scrolling', 'classic', '8-bit', 'cartoonish'], desc: 'Play Classic NES Super Mario Bros online. The original 1985 platformer ported to GBA. Run, jump, and stomp through 32 levels across 8 worlds.', controls: '↑↓←→ Move | A Jump | B Run', mega: 'Classic NES Series_ Super Mario Bros..zip', official: true },
  { title: 'Metroid Fusion', slug: 'metroid-fusion', genre: 'Action', series: 'Metroid', year: '2002', developer: 'Nintendo', rating: 9.1, ratingCount: 129, tags: ['exploration', 'atmospheric', 'boss fights', 'metroidvania', 'side-scrolling'], desc: 'Play Metroid Fusion online in your browser. Guide Samus Aran through the infected SR388 space station. Fight the X Parasites and confront the SA-X.', controls: '↑↓←→ Move | A Jump | B Shoot | L Aim | R Missile', mega: 'Metroid Fusion.zip', official: true },
  { title: 'Kirby: Nightmare in Dream Land', slug: 'kirby-nightmare-in-dream-land', genre: 'Platformer', series: 'Kirby', year: '2002', developer: 'HAL Laboratory', rating: 8.7, ratingCount: 84, tags: ['platforming precision', 'copy abilities', 'boss fights', 'casual play', 'cartoonish'], desc: 'Play Kirby Nightmare in Dream Land online. Help Kirby reclaim the Dream Rod from King Dedede. Copy enemy abilities and float through colorful levels.', controls: '↑↓←→ Move | A Jump | B Inhale/Copy | Start Pause', mega: 'Kirby_ Nightmare in Dream Land.zip', official: true },
  { title: 'Castlevania: Aria of Sorrow', slug: 'castlevania-aria-of-sorrow', genre: 'Action', series: 'Castlevania', year: '2003', developer: 'Konami', rating: 9.0, ratingCount: 103, tags: ['metroidvania', 'exploration', 'boss fights', 'soul collection', 'gothic'], desc: 'Play Castlevania Aria of Sorrow online. Fight through Dracula castle as Soma Cruz, who can absorb monster souls for new abilities.', controls: '↑↓←→ Move | A Jump | B Attack | L Backdash | R Soul Use', mega: 'Castlevania_ Aria of Sorrow.zip', official: true },
  { title: 'Donkey Kong Country', slug: 'donkey-kong-country', genre: 'Platformer', series: 'Donkey Kong', year: '2003', developer: 'Rare', rating: 8.8, ratingCount: 92, tags: ['platforming precision', 'side-scrolling', 'mine carts', 'boss fights', 'vibrant colors'], desc: 'Play Donkey Kong Country online. The GBA port of the SNES classic. Swing on vines, ride mine carts, and defeat King K. Rool.', controls: '↑↓←→ Move | A Jump | B Roll | L/Y Switch Character', mega: 'Donkey Kong Country.zip', official: true },
  { title: 'Fire Emblem: Sacred Stones', slug: 'fire-emblem-sacred-stones', genre: 'Strategy', series: 'Fire Emblem', year: '2004', developer: 'Intelligent Systems', rating: 8.7, ratingCount: 76, tags: ['tactical RPG', 'turn-based', 'permadeath', 'strategy', 'medieval'], desc: 'Play Fire Emblem Sacred Stones online. Lead Eirika or Ephraim through Magvel. Recruit 24 characters and navigate branching story paths.', controls: '↑↓←→ Cursor | A Confirm | B Cancel | Start Menu', mega: 'Fire Emblem_ The Sacred Stones.zip', official: true },
  { title: 'Sonic Advance 3', slug: 'sonic-advance-3', genre: 'Platformer', series: 'Sonic', year: '2004', developer: 'Sonic Team', rating: 8.1, ratingCount: 58, tags: ['platforming precision', 'speed', 'side-scrolling', 'boss fights', 'chaos emeralds'], desc: 'Play Sonic Advance 3 online in your browser. Race through 7 zones as Sonic, Tails, Knuckles, or Amy.', controls: '↑↓←→ Move | A Jump | B Attack | L/Y Switch Character', mega: 'Sonic Advance 3 (USA) (En,Ja,Fr,De,Es,It).zip', official: true },
  { title: 'Dragon Ball: Advanced Adventure', slug: 'dragon-ball-advanced-adventure', genre: 'Fighting', series: 'Dragon Ball', year: '2004', developer: 'Bandai', rating: 8.2, ratingCount: 67, tags: ['fighting', 'beat em up', 'boss fights', 'anime', 'martial arts'], desc: 'Play Dragon Ball Advanced Adventure online. Relive the original Dragon Ball saga as young Goku. Fight through 100+ missions.', controls: '↑↓←→ Move | A Attack | B Jump | L Ki | R Special', mega: 'Dragon Ball - Advanced Adventure (USA).zip', official: true },
  { title: 'Harvest Moon', slug: 'harvest-moon-friends-of-mineral-town', genre: 'Simulation', series: 'Harvest Moon', year: '2003', developer: 'Marvelous', rating: 8.6, ratingCount: 73, tags: ['farming', 'life sim', 'casual play', 'romance', 'relaxing'], desc: 'Play Harvest Moon Friends of Mineral Town online. Build a farm, grow crops, raise animals, and find a partner.', controls: '↑↓←→ Move | A Action | B Cancel | Start Menu | Select Tool', mega: 'Harvest Moon - Friends of Mineral Town (U) [!].zip', official: true },
  { title: 'Crash Bandicoot', slug: 'crash-bandicoot-huge-adventure', genre: 'Platformer', series: 'Crash Bandicoot', year: '2002', developer: 'Vicarious Visions', rating: 8.0, ratingCount: 49, tags: ['platforming precision', 'side-scrolling', 'boss fights', 'cartoonish', 'casual play'], desc: 'Play Crash Bandicoot online. Help Crash shrink down to micro-size and battle the mutant insects of Cortex.', controls: '↑↓←→ Move | A Jump | B Spin | Start Pause', mega: 'Crash Bandicoot_ The Huge Adventure.zip', official: true },
  { title: 'GTA Advance', slug: 'gta-advance', genre: 'Action', series: 'GTA', year: '2004', developer: 'Rockstar Games', rating: 8.0, ratingCount: 71, tags: ['open world', 'crime', 'vehicles', 'missions', 'action'], desc: 'Play GTA Advance online in your browser. Explore Liberty City as Vinnie, completing missions for the mob.', controls: '↑↓←→ Move | A Action | B Jump | Start Menu', mega: 'Grand Theft Auto Advance.zip', official: true },
  { title: 'Advance Wars', slug: 'advance-wars', genre: 'Strategy', series: 'Advance Wars', year: '2001', developer: 'Intelligent Systems', rating: 9.0, ratingCount: 112, tags: ['turn-based', 'strategy', 'tactical RPG', 'military', 'single player'], desc: 'Play Advance Wars online in your browser. Command troops across turn-based tactical battles in this beloved GBA launch title. Features 4 campaigns, online multiplayer, and a map editor.', controls: '↑↓←→ Cursor | A Confirm | B Cancel | Start Menu', mega: 'Advance Wars.zip', official: true },
  { title: 'Advance Wars 2: Black Hole Rising', slug: 'advance-wars-2-black-hole-rising', genre: 'Strategy', series: 'Advance Wars', year: '2003', developer: 'Intelligent Systems', rating: 9.1, ratingCount: 98, tags: ['turn-based', 'strategy', 'tactical RPG', 'military', 'single player'], desc: 'Play Advance Wars 2 online. Lead Allied Nations against Black Hole in this sequel featuring 28 campaign missions, 6 COs, and a harder difficulty curve.', controls: '↑↓←→ Cursor | A Confirm | B Cancel | Start Menu', mega: 'Advance Wars 2_ Black Hole Rising.zip', official: true },
  { title: 'Sonic Advance', slug: 'sonic-advance', genre: 'Platformer', series: 'Sonic', year: '2001', developer: 'Sonic Team', rating: 8.5, ratingCount: 78, tags: ['platforming precision', 'speed', 'side-scrolling', 'boss fights', 'chaos emeralds'], desc: 'Play Sonic Advance online. Race through 7 zones as Sonic, Tails, Knuckles, or Amy. Features spin dash, homing attack, and Chao garden.', controls: '↑↓←→ Move | A Jump | B Attack | L/Y Special', mega: 'Sonic Advance (USA, Europe).zip', official: true },
  { title: 'Sonic Advance 2', slug: 'sonic-advance-2', genre: 'Platformer', series: 'Sonic', year: '2002', developer: 'Sonic Team', rating: 8.3, ratingCount: 65, tags: ['platforming precision', 'speed', 'side-scrolling', 'boost', 'boss fights'], desc: 'Play Sonic Advance 2 online. Blaze through 7 zones at high speed. Features boost mechanic, trick actions, and Cream the Rabbit as a playable character.', controls: '↑↓←→ Move | A Jump | B Boost | Start Pause', mega: 'Sonic Advance 2 (USA) (En,Ja).zip', official: true },
  { title: 'Mega Man Zero', slug: 'mega-man-zero', genre: 'Action', series: 'Mega Man Zero', year: '2002', developer: 'Capcom', rating: 8.8, ratingCount: 87, tags: ['action', 'side-scrolling', 'boss fights', 'hard difficulty', 'cyberpunk'], desc: 'Play Mega Man Zero online. Lead the resistance as Zero in this challenging action platformer. Features Z-Saber, Buster Shot, and shield mechanics.', controls: '↑↓←→ Move | A Jump | B Attack | L Dash | R Guard', mega: 'Mega Man Zero.zip', official: true },
  { title: 'Mega Man Zero 2', slug: 'mega-man-zero-2', genre: 'Action', series: 'Mega Man Zero', year: '2003', developer: 'Capcom', rating: 8.9, ratingCount: 74, tags: ['action', 'side-scrolling', 'boss fights', 'hard difficulty', 'cyberpunk'], desc: 'Play Mega Man Zero 2 online. Continue Zero\'s journey against the Copy X regime. Features new forms, EX Skills, and enhanced combo system.', controls: '↑↓←→ Move | A Jump | B Attack | L Dash | R Guard', mega: 'Mega Man Zero 2.zip', official: true },
  { title: 'Mega Man Zero 3', slug: 'mega-man-zero-3', genre: 'Action', series: 'Mega Man Zero', year: '2004', developer: 'Capcom', rating: 9.0, ratingCount: 68, tags: ['action', 'side-scrolling', 'boss fights', 'hard difficulty', 'cyberpunk'], desc: 'Play Mega Man Zero 3 online. Face the Einherjar warriors in this third installment. Features Cyber-elf system, Avida EX Skill, and multiple endings.', controls: '↑↓←→ Move | A Jump | B Attack | L Dash | R Guard', mega: 'Mega Man Zero 3.zip', official: true },
  { title: 'Castlevania: Harmony of Dissonance', slug: 'castlevania-harmony-of-dissonance', genre: 'Action', series: 'Castlevania', year: '2002', developer: 'Konami', rating: 8.5, ratingCount: 82, tags: ['metroidvania', 'exploration', 'boss fights', 'gothic', 'side-scrolling'], desc: 'Play Castlevania Harmony of Dissonance online. Explore Dracula\'s castle as Juste Belmont. Features two castles, spell system, and magic-driven combat.', controls: '↑↓←→ Move | A Jump | B Attack | L Backdash | R Magic', mega: 'Castlevania_ Harmony of Dissonance.zip', official: true },
  { title: 'Castlevania: Circle of the Moon', slug: 'castlevania-circle-of-the-moon', genre: 'Action', series: 'Castlevania', year: '2001', developer: 'Konami', rating: 8.3, ratingCount: 71, tags: ['metroidvania', 'exploration', 'boss fights', 'gothic', 'card system'], desc: 'Play Castlevania Circle of the Moon online. Fight through Dracula\'s castle as Nathan Graves. Features Dual Set-up System combining Action and Magic cards.', controls: '↑↓←→ Move | A Jump | B Attack | L Backdash | R Card Combo', mega: 'Castlevania_ Circle of the Moon.zip', official: true },
  { title: 'Golden Sun', slug: 'golden-sun', genre: 'RPG', series: 'Golden Sun', year: '2001', developer: 'Camelot', rating: 8.9, ratingCount: 134, tags: ['turn-based', 'exploration', 'puzzle-solving', 'djinn system', 'epic story'], desc: 'Play Golden Sun online. Journey as Isaac to prevent the destruction of Weyard. Features the Djinn summon system, elemental puzzles, and detailed GBA graphics.', controls: '↑↓←→ Move | A Confirm | B Cancel | Start Menu | R Djinn', mega: 'Golden Sun.zip', official: true },
  { title: 'Golden Sun: The Lost Age', slug: 'golden-sun-the-lost-age', genre: 'RPG', series: 'Golden Sun', year: '2002', developer: 'Camelot', rating: 9.0, ratingCount: 112, tags: ['turn-based', 'exploration', 'puzzle-solving', 'djinn system', 'epic story'], desc: 'Play Golden Sun The Lost Age online. Continue the saga as Felix. Features larger world, more Djinn, and password system linking to the first game.', controls: '↑↓←→ Move | A Confirm | B Cancel | Start Menu | R Djinn', mega: 'Golden Sun_ The Lost Age.zip', official: true },
  { title: 'Final Fantasy Tactics Advance', slug: 'final-fantasy-tactics-advance', genre: 'Strategy', series: 'Final Fantasy', year: '2003', developer: 'Square Enix', rating: 8.8, ratingCount: 145, tags: ['tactical RPG', 'turn-based', 'strategy', 'class system', 'multiplayer'], desc: 'Play Final Fantasy Tactics Advance online. Lead March and his friends through tactical battles in Ivalice. Features 6 races, 30+ classes, and clan battles.', controls: '↑↓←→ Cursor | A Confirm | B Cancel | Start Menu | R Map', mega: 'Final Fantasy Tactics Advance.zip', official: true },
  { title: 'Final Fantasy I & II: Dawn of Souls', slug: 'final-fantasy-1-2-dawn-of-souls', genre: 'RPG', series: 'Final Fantasy', year: '2004', developer: 'Square Enix', rating: 7.8, ratingCount: 89, tags: ['turn-based', 'exploration', 'dungeon crawling', 'classic', 'retro'], desc: 'Play Final Fantasy I & II Dawn of Souls online. Enhanced GBA ports of the first two Final Fantasy games with new content, improved graphics, and save-anywhere feature.', controls: '↑↓←→ Move | A Confirm | B Cancel | Start Menu', mega: 'Final Fantasy I & II - Dawn of Souls (USA).zip', official: true },
  { title: 'Final Fantasy IV Advance', slug: 'final-fantasy-iv-advance', genre: 'RPG', series: 'Final Fantasy', year: '2005', developer: 'Square Enix', rating: 8.5, ratingCount: 98, tags: ['turn-based', 'exploration', 'story-driven', 'classic', 'retro'], desc: 'Play Final Fantasy IV Advance online. The enhanced GBA port of the SNES classic. Features Cecil, Kain, and Rosa in a story of crystals, betrayal, and redemption.', controls: '↑↓←→ Move | A Confirm | B Cancel | Start Menu', mega: 'Final Fantasy IV Advance (USA).zip', official: true },
  { title: 'Final Fantasy V Advance', slug: 'final-fantasy-v-advance', genre: 'RPG', series: 'Final Fantasy', year: '2006', developer: 'Square Enix', rating: 8.6, ratingCount: 87, tags: ['turn-based', 'exploration', 'job system', 'classic', 'retro'], desc: 'Play Final Fantasy V Advance online. The GBA port featuring the iconic Job System with 22 jobs. Features bonus content and improved translation.', controls: '↑↓←→ Move | A Confirm | B Cancel | Start Menu', mega: 'Final Fantasy V Advance (USA).zip', official: true },
  { title: 'Final Fantasy VI Advance', slug: 'final-fantasy-vi-advance', genre: 'RPG', series: 'Final Fantasy', year: '2007', developer: 'Square Enix', rating: 9.0, ratingCount: 156, tags: ['turn-based', 'exploration', 'story-driven', 'classic', 'retro'], desc: 'Play Final Fantasy VI Advance online. The GBA port of the beloved SNES classic. Features Terra, Celes, and the ensemble cast fighting Kefka.', controls: '↑↓←→ Move | A Confirm | B Cancel | Start Menu', mega: 'Final Fantasy VI Advance (USA).zip', official: true },
  { title: 'WarioWare, Inc.: Mega Microgame$!', slug: 'warioware-mega-microgames', genre: 'Action', series: 'WarioWare', year: '2003', developer: 'Nintendo', rating: 8.4, ratingCount: 67, tags: ['microgames', 'party', 'humor', 'crazy', 'fast-paced'], desc: 'Play WarioWare Mega Microgames online. Experience over 200 microgames that last just seconds each. Features Wario and friends in absurd rapid-fire challenges.', controls: '↑↓←→ A Various | B Various | L/R Various | Start Pause', mega: 'WarioWare_ Inc_ Mega Microgame$.zip', official: true },
  { title: 'WarioWare Twisted!', slug: 'warioware-twisted', genre: 'Action', series: 'WarioWare', year: '2004', developer: 'Nintendo', rating: 8.7, ratingCount: 54, tags: ['microgames', 'party', 'tilt controls', 'humor', 'crazy'], desc: 'Play WarioWare Twisted online. Features motion-controlled microgames using the GBA-012 rumble pak accelerometer. Over 200 microgames with tilt mechanics.', controls: 'Tilt controls | A Confirm | B Cancel | Start Pause', mega: 'WarioWare Twisted (USA) (Rev 1).zip', official: true },
  { title: 'Fire Emblem', slug: 'fire-emblem', genre: 'Strategy', series: 'Fire Emblem', year: '2003', developer: 'Intelligent Systems', rating: 8.8, ratingCount: 98, tags: ['tactical RPG', 'turn-based', 'permadeath', 'strategy', 'medieval'], desc: 'Play Fire Emblem online. The GBA debut featuring Eliwood, Hector, and Lyn. Recruit 20+ characters and navigate three interweaving stories.', controls: '↑↓←→ Cursor | A Confirm | B Cancel | Start Menu', mega: 'Fire Emblem (USA).zip', official: true },
  { title: 'Kirby & the Amazing Mirror', slug: 'kirby-amazing-mirror', genre: 'Platformer', series: 'Kirby', year: '2004', developer: 'HAL Laboratory', rating: 8.4, ratingCount: 61, tags: ['metroidvania', 'copy abilities', 'multiplayer', 'exploration', 'cartoonish'], desc: 'Play Kirby and the Amazing Mirror online. Explore the mirror world with 4 Kirbys, copy 12 abilities, and collect 900 stars.', controls: '↑↓←→ Move | A Jump | B Inhale/Copy | Start Map', mega: 'Kirby & the Amazing Mirror.zip', official: true },
  { title: 'Yoshi\'s Island: Super Mario Advance 3', slug: 'yoshis-island', genre: 'Platformer', series: 'Mario', year: '2002', developer: 'Nintendo', rating: 9.1, ratingCount: 112, tags: ['platforming precision', 'side-scrolling', 'baby mario', 'art style', 'boss fights'], desc: 'Play Yoshi\'s Island online. The GBA port of the SNES classic. Carry Baby Mario through 6 worlds of hand-drawn levels.', controls: '↑↓←→ Move | A Jump | B Throw | L Flutter Kick | R Aim', mega: 'Super Mario Advance 3_ Yoshi\'s Island.zip', official: true },
  { title: 'Super Mario Advance 4: Super Mario Bros 3', slug: 'super-mario-advance-4', genre: 'Platformer', series: 'Mario', year: '2003', developer: 'Nintendo', rating: 8.8, ratingCount: 95, tags: ['platforming precision', 'side-scrolling', 'power-ups', 'secret exits', 'cartoonish'], desc: 'Play Super Mario Advance 4 online. The GBA remake of Super Mario Bros 3 with new levels, power-ups, and e-Reader support.', controls: '↑↓←→ Move | A Jump | B Run | L/Y Raccoon Suit', mega: 'Super Mario Advance 4_ Super Mario Bros. 3.zip', official: true },
  { title: 'Tony Hawk\'s Pro Skater 2', slug: 'tony-hawks-pro-skater-2', genre: 'Sports', series: 'Tony Hawk', year: '2001', developer: 'Vicarious Visions', rating: 8.5, ratingCount: 76, tags: ['skating', 'tricks', 'combo system', 'sports', 'extreme sports'], desc: 'Play Tony Hawk\'s Pro Skater 2 online. The GBA port of the PS1 classic. Features 12 skaters, huge levels, and the addictive combo system.', controls: '↑↓←→ Move | A Ollie | B Kickflip | L Grind | R Grab', mega: 'Tony Hawk\'s Pro Skater 2.zip', official: true },
  { title: 'Tony Hawk\'s Pro Skater 3', slug: 'tony-hawks-pro-skater-3', genre: 'Sports', series: 'Tony Hawk', year: '2002', developer: 'Vicarious Visions', rating: 8.3, ratingCount: 62, tags: ['skating', 'tricks', 'combo system', 'sports', 'extreme sports'], desc: 'Play Tony Hawk\'s Pro Skater 3 online. Features new trick system, levels inspired by PS1 version, and online multiplayer support.', controls: '↑↓←→ Move | A Ollie | B Kickflip | L Grind | R Grab', mega: 'Tony Hawk\'s Pro Skater 3.zip', official: true },
  { title: 'Need for Speed: Underground', slug: 'need-for-speed-underground', genre: 'Racing', series: 'Need for Speed', year: '2003', developer: 'Pocketeers', rating: 8.0, ratingCount: 54, tags: ['racing', 'customization', 'street racing', 'vehicles', 'nightlife'], desc: 'Play Need for Speed Underground online. Street race through Olympic City with 20+ customizable cars. Features drag, circuit, and sprint races.', controls: '↑↓←→ Steer | A Accelerate | B Brake | L Nitrous | R Camera', mega: 'Need for Speed - Underground.zip', official: true },
  { title: 'Mario Tennis: Power Tour', slug: 'mario-tennis-power-tour', genre: 'Sports', series: 'Mario', year: '2005', developer: 'Camelot', rating: 8.3, ratingCount: 48, tags: ['tennis', 'sports', 'story mode', 'power shots', 'multiplayer'], desc: 'Play Mario Tennis Power Tour online. Features story mode with 6 playable characters, power shots, and tournament play.', controls: '↑↓←→ Move | A Hit | B Lob | L Topspin | R Slice', mega: 'Mario Tennis_ Power Tour.zip', official: true },
  { title: 'Pilotwings Resort', slug: 'pilotwings-resort', genre: 'Simulation', series: 'Pilotwings', year: '2011', developer: 'Monster Games', rating: 7.5, ratingCount: 32, tags: ['flight', 'simulation', 'relaxing', 'open world', 'casual play'], desc: 'Play Pilotwings Resort online. Fly, dive, and glide through Wuhu Island in this relaxing flight simulator. Features 3 flight vehicle types.', controls: '↑↓←→ Steer | A Throttle | B Brake | L/R Altitude', mega: 'Pilotwings Resort (USA) (En,Ja,Fr,De,Es,It,Ko).zip', official: true },
  { title: 'Kid Icarus: Uprising', slug: 'kid-icarus-uprising', genre: 'Action', series: 'Kid Icarus', year: '2012', developer: 'Nintendo', rating: 8.5, ratingCount: 78, tags: ['shooter', 'flight', 'action', 'humor', 'boss fights'], desc: 'Play Kid Icarus Uprising online. Pit returns in this vertical shooter/action hybrid. Features air and ground combat, weapons system, and multiplayer.', controls: '↑↓←→ Aim | A Shoot | B Dodge | L Shield | R Special', mega: 'Kid Icarus Uprising (USA) (En,Ja,Fr,De,Es,It,Ko).zip', official: true },
  { title: 'Star Fox: Assault', slug: 'star-fox-assault', genre: 'Action', series: 'Star Fox', year: '2005', developer: 'Namco', rating: 7.8, ratingCount: 45, tags: ['shooter', 'flight', 'vehicles', 'boss fights', 'multiplayer'], desc: 'Play Star Fox Assault online. Join Fox McCloud against the Anglar Empire. Features on-rails Arwing sections and on-foot combat segments.', controls: '↑↓←→ Steer | A Fire | B Bomb | L Barrel Roll | R Boost', mega: 'Star Fox Assault (USA).zip', official: true },
  { title: 'Super Smash Bros.', slug: 'super-smash-bros', genre: 'Fighting', series: 'Smash Bros', year: '2001', developer: 'Nintendo', rating: 9.0, ratingCount: 167, tags: ['fighting', 'platform fighter', 'multiplayer', 'nintendo characters', 'party'], desc: 'Play Super Smash Bros online. The GBA entry in the legendary crossover fighting series. Features 12 Nintendo characters, 14 stages, and multiplayer.', controls: '↑↓←→ Move | A Attack | B Special | L Shield | R Grab', mega: 'Super Smash Bros.zip', official: true },
  { title: 'Metroid: Zero Mission', slug: 'metroid-zero-mission', genre: 'Action', series: 'Metroid', year: '2004', developer: 'Nintendo', rating: 8.9, ratingCount: 88, tags: ['exploration', 'metroidvania', 'boss fights', 'side-scrolling', 'speedrun'], desc: 'Play Metroid Zero Mission online. A remake of the original NES Metroid with updated graphics and gameplay. Explore Planet Zebes and defeat Mother Brain.', controls: '↑↓←→ Move | A Jump | B Shoot | L Aim | R Missile', mega: 'Metroid_ Zero Mission.zip', official: true },
  { title: 'Sword of Mana', slug: 'sword-of-mana', genre: 'RPG', series: 'Mana', year: '2003', developer: 'Square Enix', rating: 7.8, ratingCount: 56, tags: ['action RPG', 'exploration', 'co-op', 'fantasy', 'retro'], desc: 'Play Sword of Mana online. A remake of Final Fantasy Adventure. Features real-time combat, two playable characters, and co-op mode.', controls: '↑↓←→ Move | A Attack | B Jump | L Menu | R Magic', mega: 'Sword of Mana.zip', official: true },
  { title: 'Shining Soul II', slug: 'shining-soul-ii', genre: 'RPG', series: 'Shining', year: '2003', developer: 'Next Entertainment', rating: 7.9, ratingCount: 43, tags: ['action RPG', 'dungeon crawling', 'multiplayer', 'fantasy', 'loot'], desc: 'Play Shining Soul II online. A hack-and-slash action RPG with 8 character classes and online multiplayer support. Features random dungeons and loot.', controls: '↑↓←→ Move | A Attack | B Skill | L Menu | R Map', mega: 'Shining Soul II.zip', official: true },
  { title: 'Tales of Phantasia', slug: 'tales-of-phantasia', genre: 'RPG', series: 'Tales', year: '2003', developer: 'Namco', rating: 8.6, ratingCount: 78, tags: ['action RPG', 'real-time combat', 'anime', 'story-driven', 'time travel'], desc: 'Play Tales of Phantasia online. The GBA port of the SNES RPG classic. Features real-time combat system, 4 characters, and a story spanning 4 time periods.', controls: '↑↓←→ Move | A Attack | B Artes | L Menu | R Guard', mega: 'Tales of Phantasia (USA).zip', official: true },
  { title: 'Breath of Fire', slug: 'breath-of-fire', genre: 'RPG', series: 'Breath of Fire', year: '2001', developer: 'Capcom', rating: 8.2, ratingCount: 54, tags: ['turn-based', 'exploration', 'dragon transformation', 'fantasy', 'retro'], desc: 'Play Breath of Fire online. The GBA port of the SNES RPG. Play as Ryu, a boy who can transform into a dragon. Features fishing minigame and party system.', controls: '↑↓←→ Move | A Confirm | B Cancel | Start Menu', mega: 'Breath of Fire (USA).zip', official: true },
  { title: 'Breath of Fire II', slug: 'breath-of-fire-ii', genre: 'RPG', series: 'Breath of Fire', year: '2001', developer: 'Capcom', rating: 8.3, ratingCount: 48, tags: ['turn-based', 'exploration', 'dragon transformation', 'fantasy', 'base building'], desc: 'Play Breath of Fire II online. Features Ryu searching for his lost sister, a town-building system, and the dragon transformation mechanic.', controls: '↑↓←→ Move | A Confirm | B Cancel | Start Menu', mega: 'Breath of Fire II (USA).zip', official: true },
  { title: 'Mario vs. Donkey Kong', slug: 'mario-vs-donkey-kong', genre: 'Puzzle', series: 'Mario', year: '2004', developer: 'Nintendo', rating: 8.1, ratingCount: 45, tags: ['puzzle', 'platforming', 'logic', 'single player', 'casual play'], desc: 'Play Mario vs Donkey Kong online. Guide Mario through puzzle-platform levels to recover stolen Mini-Marios. Features 100+ levels and a level editor.', controls: '↑↓←→ Move | A Jump | B Run | L/R Dash', mega: 'Mario vs. Donkey Kong.zip', official: true },
  { title: 'Lemmets', slug: 'lemmets', genre: 'Puzzle', series: 'Lemmets', year: '2006', developer: 'Ubisoft', rating: 7.5, ratingCount: 32, tags: ['puzzle', 'strategy', 'cute', 'casual play', 'logic'], desc: 'Play Lemmets online. Guide cute lemmets through dangerous levels by assigning them jobs. Features physics-based puzzles and multiple tools.', controls: '↑↓←→ Select | A Assign Job | B Cancel | Start Menu', mega: 'Lemmets (USA).zip', official: true },
  { title: 'Bomberman Tournament', slug: 'bomberman-tournament', genre: 'Action', series: 'Bomberman', year: '2001', developer: 'Hudson Soft', rating: 8.0, ratingCount: 56, tags: ['action', 'strategy', 'bombs', 'multiplayer', 'rpg elements'], desc: 'Play Bomberman Tournament online. Features RPG elements with over 30 worlds to explore, new bomb types, and online multiplayer battles.', controls: '↑↓←→ Move | A Bomb | B Kick | L Remote Detonate | R Shield', mega: 'Bomberman Tournament.zip', official: true },
  { title: 'Mega Man Battle Network 3', slug: 'mega-man-battle-network-3', genre: 'RPG', series: 'Mega Man Battle Network', year: '2003', developer: 'Capcom', rating: 8.8, ratingCount: 92, tags: ['action RPG', 'real-time combat', 'card system', 'cyberpunk', 'net battling'], desc: 'Play Mega Man Battle Network 3 online. Features real-time combat with chip system, 300+ battle chips, and both versions with exclusive content.', controls: '↑↓←→ Move | A Shoot | B Chip | L Panel Shift | R Lock On', mega: 'Mega Man Battle Network 3 Blue (USA).zip', official: true },
  { title: 'Mega Man Battle Network 6', slug: 'mega-man-battle-network-6', genre: 'RPG', series: 'Mega Man Battle Network', year: '2006', developer: 'Capcom', rating: 8.7, ratingCount: 78, tags: ['action RPG', 'real-time combat', 'beast out', 'cyberpunk', 'net battling'], desc: 'Play Mega Man Battle Network 6 online. The final chapter featuring Cross System and Beast Out transformations. Two versions with exclusive NetNavis.', controls: '↑↓←→ Move | A Shoot | B Chip | L Beast Out | R Cross', mega: 'Mega Man Battle Network 6 Cybeast Gregar (USA).zip', official: true },
  { title: 'Sonic Heroes', slug: 'sonic-heroes', genre: 'Platformer', series: 'Sonic', year: '2004', developer: 'Sonic Team', rating: 7.8, ratingCount: 56, tags: ['platforming precision', 'speed', 'team play', 'side-scrolling', 'boss fights'], desc: 'Play Sonic Heroes online. Switch between 3 team members on the fly through 14 zones. Features Team Sonic, Team Dark, Team Rose, and Team Chaotix.', controls: '↑↓←→ Move | A Jump | B Team Blast | L Switch Leader | R Formation', mega: 'Sonic Heroes (USA).zip', official: true },
  { title: 'Pac-Man World', slug: 'pac-man-world', genre: 'Platformer', series: 'Pac-Man', year: '2002', developer: 'Now Production', rating: 7.6, ratingCount: 38, tags: ['platforming', 'adventure', 'collecting', 'cartoonish', 'casual play'], desc: 'Play Pac-Man World online. Help Pac-Man rescue his friends from the Ghosts. Features platforming, puzzles, and maze sections.', controls: '↑↓←→ Move | A Jump | B Attack | L Roll | R Power Pellet', mega: 'Pac-Man World (USA).zip', official: true },
  { title: 'Rayman Advance', slug: 'rayman-advance', genre: 'Platformer', series: 'Rayman', year: '2001', developer: 'Ubisoft', rating: 8.2, ratingCount: 54, tags: ['platforming precision', 'side-scrolling', 'collecting', 'beautiful', 'boss fights'], desc: 'Play Rayman Advance online. The GBA port of the PS1 classic. Guide Rayman through 60 levels collecting Electoons and defeating Mr. Dark.', controls: '↑↓←→ Move | A Jump | B Punch | L Hair Fist | R Hover', mega: 'Rayman Advance.zip', official: true },
  { title: 'Rayman 3', slug: 'rayman-3', genre: 'Platformer', series: 'Rayman', year: '2003', developer: 'Ubisoft', rating: 7.8, ratingCount: 42, tags: ['platforming', '3D', 'adventure', 'humor', 'collecting'], desc: 'Play Rayman 3 online. The GBA version of the PS2 platformer. Features new power-ups, 60 levels, and a humorous storyline.', controls: '↑↓←→ Move | A Jump | B Attack | L Power-up | R Lums', mega: 'Rayman 3 Hoodlum Havoc (USA).zip', official: true },
  { title: 'Alone in the Dark', slug: 'alone-in-the-dark', genre: 'Adventure', series: 'Alone in the Dark', year: '2001', developer: 'Infogrames', rating: 7.2, ratingCount: 28, tags: ['horror', 'survival', 'puzzle-solving', 'mystery', 'atmospheric'], desc: 'Play Alone in the Dark online. A prequel to the PS2 game. Investigate a haunted mansion with puzzles and limited resources.', controls: '↑↓←→ Move | A Interact | B Run | L Inventory | R Flashlight', mega: 'Alone in the Dark (USA).zip', official: true },
  { title: 'Shrek SuperSlam', slug: 'shrek-superslam', genre: 'Fighting', series: 'Shrek', year: '2004', developer: 'TOYS FOR BOB', rating: 7.0, ratingCount: 32, tags: ['fighting', 'multiplayer', 'movie tie-in', 'casual play', 'party'], desc: 'Play Shrek SuperSlam online. Fight as Shrek characters in this wrestling-style fighter. Features 10 characters and story mode.', controls: '↑↓←→ Move | A Attack | B Grab | L Special | R Ultimate', mega: 'Shrek SuperSlam (USA).zip', official: true },
  { title: 'Harry Potter and the Prisoner of Azkaban', slug: 'harry-potter-prisoner-of-azkaban', genre: 'Adventure', series: 'Harry Potter', year: '2004', developer: 'KnowWonder', rating: 7.5, ratingCount: 45, tags: ['adventure', 'magic', 'exploration', 'story-driven', 'movie tie-in'], desc: 'Play Harry Potter Prisoner of Azkaban online. Play as Harry, Ron, and Hermione through Hogwarts and the Forbidden Forest. Features spell-casting and Quidditch.', controls: '↑↓←→ Move | A Interact | B Cast Spell | L Map | R Menu', mega: 'Harry Potter and the Prisoner of Azkaban (USA).zip', official: true },
  { title: 'SpongeBob SquarePants: Battle for Bikini Bottom', slug: 'spongebob-battle-for-bikini-bottom', genre: 'Platformer', series: 'SpongeBob', year: '2003', developer: 'Heavy Iron Studios', rating: 7.8, ratingCount: 56, tags: ['platforming', 'collecting', 'humor', 'cartoonish', 'underwater'], desc: 'Play SpongeBob Battle for Bikini Bottom online. Defeat Plankton\'s robot army across Bikini Bottom. Features 3 playable characters and collectibles.', controls: '↑↓←→ Move | A Jump | B Attack | L Special | R Switch Character', mega: 'SpongeBob SquarePants - Battle for Bikini Bottom.zip', official: true },
  { title: 'Teenage Mutant Ninja Turtles', slug: 'tmnt', genre: 'Action', series: 'TMNT', year: '2003', developer: 'Konami', rating: 7.5, ratingCount: 38, tags: ['beat em up', 'fighting', 'multiplayer', 'ninjas', 'action'], desc: 'Play TMNT online. Fight as the four turtles through New York City. Features unique moves for each turtle and co-op play.', controls: '↑↓←→ Move | A Attack | B Jump | L Special | R Switch Turtle', mega: 'Teenage Mutant Ninja Turtles (USA).zip', official: true },
  { title: 'LEGO Star Wars: The Video Game', slug: 'lego-star-wars', genre: 'Action', series: 'LEGO Star Wars', year: '2005', developer: 'Griptonite Games', rating: 7.8, ratingCount: 67, tags: ['action', 'platforming', 'collecting', 'lego', 'star wars'], desc: 'Play LEGO Star Wars online. Relive the prequel trilogy in LEGO form. Features 12 playable characters, stud collecting, and lightsaber combat.', controls: '↑↓←→ Move | A Jump | B Attack | L Force Power | R Switch Character', mega: 'LEGO Star Wars - The Video Game (USA).zip', official: true },
  { title: 'The Simpsons: Road Rage', slug: 'simpsons-road-rage', genre: 'Racing', series: 'Simpsons', year: '2002', developer: 'Radical Entertainment', rating: 7.2, ratingCount: 34, tags: ['racing', 'open world', 'humor', 'movie tie-in', 'vehicles'], desc: 'Play Simpsons Road Rage online. Drive through Springfield as Homer, Bart, Marge, or Lisa. Features open world exploration and races.', controls: '↑↓←→ Steer | A Accelerate | B Brake | L Nitrous | R Camera', mega: 'The Simpsons - Road Rage (USA).zip', official: true },
  { title: 'Pac-Man Collection', slug: 'pac-man-collection', genre: 'Puzzle', series: 'Pac-Man', year: '2001', developer: 'Namco', rating: 7.8, ratingCount: 43, tags: ['maze', 'classic', 'casual play', 'collecting', 'retro'], desc: 'Play Pac-Man Collection online. Includes 4 classic Pac-Man games: Pac-Man, Pac-Mania, Pac-Attack, and Pac-Man Arrangement.', controls: '↑↓←→ Move | A Action | B Cancel | Start Pause', mega: 'Pac-Man Collection.zip', official: true },
  { title: 'Harvest Moon: A Wonderful Life', slug: 'harvest-moon-a-wonderful-life', genre: 'Simulation', series: 'Harvest Moon', year: '2005', developer: 'Marvelous', rating: 7.9, ratingCount: 38, tags: ['farming', 'life sim', 'casual play', 'romance', 'relaxing'], desc: 'Play Harvest Moon A Wonderful Life online. Build a farm, raise animals, get married, and raise a child in this beloved life sim.', controls: '↑↓←→ Move | A Action | B Cancel | Start Menu | Select Tool', mega: 'Harvest Moon - A Wonderful Life (USA).zip', official: true },
  { title: 'Dragon Ball Z: Supersonic Warriors', slug: 'dragon-ball-z-supersonic-warriors', genre: 'Fighting', series: 'Dragon Ball', year: '2004', developer: 'CPS-II', rating: 7.8, ratingCount: 56, tags: ['fighting', 'anime', 'story mode', 'aerial combat', 'martial arts'], desc: 'Play Dragon Ball Z Supersonic Warriors online. Fight through the Saiyan Saga to Buu Saga. Features aerial combat, transformations, and team battles.', controls: '↑↓←→ Move | A Attack | B Ki Blast | L Special | R Transform', mega: 'Dragon Ball Z - Supersonic Warriors.zip', official: true },
  { title: 'Resident Evil', slug: 'resident-evil', genre: 'Horror', series: 'Resident Evil', year: '2002', developer: 'Capcom', rating: 8.2, ratingCount: 67, tags: ['survival horror', 'puzzle-solving', 'atmospheric', 'exploration', 'zombies'], desc: 'Play Resident Evil online. The GBA port of the PS1 classic. Fight zombies in the Spencer Mansion with limited resources and tense atmosphere.', controls: '↑↓←→ Move | A Shoot | B Run | L Inventory | R Map', mega: 'Resident Evil (USA).zip', official: true },
  { title: 'Doom', slug: 'doom', genre: 'Action', series: 'Doom', year: '2001', developer: 'id Software', rating: 7.8, ratingCount: 78, tags: ['first-person shooter', 'horror', 'demons', 'retro', 'hard difficulty'], desc: 'Play Doom online. The GBA port of the classic FPS. Features 22 levels, multiple weapons, and endless demon-slaying action.', controls: '↑↓←→ Move | A Shoot | B Strafe | L Alt Fire | R Map', mega: 'Doom (USA).zip', official: true }
];

const GAMES_WITH_CONSOLE = GAMES.map(g => ({ ...g, console: 'GBA' }));

const GENRES = [
  { name: 'RPG', slug: 'rpg', desc: 'Play GBA RPG games online free. Pokemon, Fire Emblem, Mario & Luigi, and more classic role-playing games in your browser.' },
  { name: 'Platformer', slug: 'platformer', desc: 'Play GBA platformer games online free. Super Mario, Kirby, Donkey Kong, Sonic, and Crash Bandicoot in your browser.' },
  { name: 'Action', slug: 'action', desc: 'Play GBA action games online free. Metroid, Castlevania, GTA, and more classic action games in your browser.' },
  { name: 'Adventure', slug: 'adventure', desc: 'Play GBA adventure games online free. Zelda: Minish Cap, Zelda: A Link to the Past, and more classic adventures.' },
  { name: 'Racing', slug: 'racing', desc: 'Play GBA racing games online free. Mario Kart Super Circuit and more classic racing games in your browser.' },
  { name: 'Fighting', slug: 'fighting', desc: 'Play GBA fighting games online free. Dragon Ball Advanced Adventure and more classic fighting games.' },
  { name: 'Strategy', slug: 'strategy', desc: 'Play GBA strategy games online free. Fire Emblem: Sacred Stones and more classic strategy games.' },
  { name: 'Simulation', slug: 'simulation', desc: 'Play GBA simulation games online free. Harvest Moon Friends of Mineral Town and more classic sim games.' },
];

const SERIES = [
  { name: 'Pokemon', slug: 'pokemon', desc: 'Play Pokemon GBA games online free. Pokemon Emerald, FireRed, LeafGreen, Ruby, Sapphire, and ROM hacks in your browser.' },
  { name: 'Zelda', slug: 'zelda', desc: 'Play Zelda GBA games online free. Zelda: Minish Cap and Zelda: A Link to the Past in your browser.' },
  { name: 'Mario', slug: 'mario', desc: 'Play Mario GBA games online free. Super Mario World, Mario Kart, Mario & Luigi, and Classic NES Mario in your browser.' },
  { name: 'Metroid', slug: 'metroid', desc: 'Play Metroid GBA games online free. Metroid Fusion and Metroid: Zero Mission in your browser.' },
  { name: 'Kirby', slug: 'kirby', desc: 'Play Kirby GBA games online free. Kirby: Nightmare in Dream Land and Kirby & the Amazing Mirror in your browser.' },
  { name: 'Castlevania', slug: 'castlevania', desc: 'Play Castlevania GBA games online free. Castlevania: Aria of Sorrow in your browser.' },
  { name: 'Sonic', slug: 'sonic', desc: 'Play Sonic GBA games online free. Sonic Advance 3 in your browser.' },
  { name: 'Fire Emblem', slug: 'fire-emblem', desc: 'Play Fire Emblem GBA games online free. Fire Emblem: Sacred Stones in your browser.' },
  { name: 'Dragon Ball', slug: 'dragon-ball', desc: 'Play Dragon Ball GBA games online free. Dragon Ball: Advanced Adventure in your browser.' },
  { name: 'Harvest Moon', slug: 'harvest-moon', desc: 'Play Harvest Moon GBA games online free. Harvest Moon: Friends of Mineral Town in your browser.' },
  { name: 'Donkey Kong', slug: 'donkey-kong', desc: 'Play Donkey Kong GBA games online free. Donkey Kong Country in your browser.' },
  { name: 'Crash Bandicoot', slug: 'crash-bandicoot', desc: 'Play Crash Bandicoot GBA games online free. Crash Bandicoot: The Huge Adventure in your browser.' },
  { name: 'GTA', slug: 'gta', desc: 'Play GTA GBA games online free. GTA Advance in your browser.' },
  { name: 'Advance Wars', slug: 'advance-wars', desc: 'Play Advance Wars GBA games online free. Turn-based tactical strategy classics in your browser.' },
  { name: 'Alone in the Dark', slug: 'alone-in-the-dark', desc: 'Play Alone in the Dark GBA games online free. Horror adventure classic in your browser.' },
  { name: 'Bomberman', slug: 'bomberman', desc: 'Play Bomberman GBA games online free. Bomberman Tournament in your browser.' },
  { name: 'Breath of Fire', slug: 'breath-of-fire', desc: 'Play Breath of Fire GBA games online free. Capcom RPG classics in your browser.' },
  { name: 'Doom', slug: 'doom', desc: 'Play Doom GBA games online free. The classic FPS in your browser.' },
  { name: 'Final Fantasy', slug: 'final-fantasy', desc: 'Play Final Fantasy GBA games online free. The legendary RPG series in your browser.' },
  { name: 'Golden Sun', slug: 'golden-sun', desc: 'Play Golden Sun GBA games online free. Camelot RPG classics in your browser.' },
  { name: 'Harry Potter', slug: 'harry-potter', desc: 'Play Harry Potter GBA games online free. The magical adventure in your browser.' },
  { name: 'Kid Icarus', slug: 'kid-icarus', desc: 'Play Kid Icarus GBA games online free. The classic action game in your browser.' },
  { name: 'LEGO Star Wars', slug: 'lego-star-wars', desc: 'Play LEGO Star Wars GBA games online free. The brick-built adventure in your browser.' },
  { name: 'Lemmets', slug: 'lemmets', desc: 'Play Lemmets GBA games online free. The classic puzzle game in your browser.' },
  { name: 'Mana', slug: 'mana', desc: 'Play Mana GBA games online free. Sword of Mana in your browser.' },
  { name: 'Mega Man Battle Network', slug: 'mega-man-battle-network', desc: 'Play Mega Man Battle Network GBA games online free. Net-battling action RPGs in your browser.' },
  { name: 'Mega Man Zero', slug: 'mega-man-zero', desc: 'Play Mega Man Zero GBA games online free. Capcom action classics in your browser.' },
  { name: 'Need for Speed', slug: 'need-for-speed', desc: 'Play Need for Speed GBA games online free. Racing classics in your browser.' },
  { name: 'Pac-Man', slug: 'pac-man', desc: 'Play Pac-Man GBA games online free. The legendary maze classic in your browser.' },
  { name: 'Pilotwings', slug: 'pilotwings', desc: 'Play Pilotwings GBA games online free. The relaxing flight sim in your browser.' },
  { name: 'Rayman', slug: 'rayman', desc: 'Play Rayman GBA games online free. Ubisoft platforming classics in your browser.' },
  { name: 'Resident Evil', slug: 'resident-evil', desc: 'Play Resident Evil GBA games online free. The survival horror classic in your browser.' },
  { name: 'Shining', slug: 'shining', desc: 'Play Shining GBA games online free. Shining Soul II action RPG in your browser.' },
  { name: 'Shrek', slug: 'shrek', desc: 'Play Shrek GBA games online free. The movie-tie-in fighting game in your browser.' },
  { name: 'Simpsons', slug: 'simpsons', desc: 'Play Simpsons GBA games online free. Road Rage in your browser.' },
  { name: 'Smash Bros', slug: 'smash-bros', desc: 'Play Smash Bros GBA games online free. The crossover fighting classic in your browser.' },
  { name: 'SpongeBob', slug: 'spongebob', desc: 'Play SpongeBob GBA games online free. Battle for Bikini Bottom in your browser.' },
  { name: 'Star Fox', slug: 'star-fox', desc: 'Play Star Fox GBA games online free. Assault in your browser.' },
  { name: 'TMNT', slug: 'tmnt', desc: 'Play Teenage Mutant Ninja Turtles GBA games online free. The beat em up in your browser.' },
  { name: 'Tales', slug: 'tales', desc: 'Play Tales GBA games online free. Tales of Phantasia in your browser.' },
  { name: 'Tony Hawk', slug: 'tony-hawk', desc: 'Play Tony Hawk GBA games online free. Pro Skater classics in your browser.' },
  { name: 'WarioWare', slug: 'warioware', desc: 'Play WarioWare GBA games online free. Microgame madness in your browser.' },
];

const CONSOLES = [
  { name: 'Game Boy Advance', slug: 'gameboy-advance', short: 'GBA', year: '2001', count: GAMES.filter(g => g.genre).length, desc: 'Play Game Boy Advance games online free in your browser. No download, no install. 25+ classic GBA titles including Pokemon, Zelda, Mario, Metroid, and Kirby.', history: 'The Game Boy Advance (GBA) is a 32-bit handheld console released by Nintendo in 2001 as the successor to the Game Boy Color. It features a 240x160 pixel screen capable of 32,768 colors, a 32-bit ARM7TDMI processor, and a library of over 1,500 games. The GBA dominated the handheld market, selling over 81 million units worldwide. Its most iconic games include Pokemon Ruby and Sapphire, Zelda: The Minish Cap, Metroid Fusion, and Mario Kart: Super Circuit. The GBA remains one of the most beloved handheld consoles ever made, and its games are still played by millions through browser-based emulators today.', intro: 'The Game Boy Advance (GBA), released in 2001, was Nintendo\'s 32-bit handheld successor to the Game Boy Color. It featured significantly improved graphics and processing power while maintaining backward compatibility with previous Game Boy games. The GBA\'s landscape-oriented design with two shoulder buttons marked a departure from earlier models. Its library included enhanced ports of SNES classics as well as original titles like Pokémon Ruby/Sapphire, Metroid Fusion, and Advance Wars. The system sold over 81 million units worldwide across its original model, the clamshell-design SP (2003), and the backlit-microscreen Game Boy Micro (2005). The GBA became known for excellent 2D games during a period when consoles were transitioning to 3D, preserving classic game design approaches.', image: '/images/gba-console.webp', marketData: { unitsSold: 'Global: 81.51M (China ~1.5M)', bestSelling: 'Pokémon Ruby/Sapphire (23M+)', lifespan: '2001–2008 (7 years)' }, technicalSpecs: { cpu: 'ARM7TDMI (32-bit, 16.78 MHz)', memory: '32 KB RAM + 256 KB VRAM', graphics: '240×160 resolution, 32,768-color palette', sound: 'Digital stereo (8-bit DAC) with PSG compatibility', media: 'Cartridge (up to 32MB)' }, usageCharacteristics: { localTerms: ['GBA', 'Link Cable', 'Flash Cart', '566 Version', 'Fairy Leak'], uniquePractices: ['Reinforcing cartridges with tape', 'Handmade Fire Emblem growth charts', 'Exchanging Phoenix Wright court notes'] } },
  { name: 'Game Boy Color', slug: 'gameboy-color', short: 'GBC', year: '1998', count: 8, desc: 'Play Game Boy Color games online free in your browser. No download, no install. Classic GBC titles including Pokemon, Zelda, and more.', history: 'The Game Boy Color (GBC) is an 8-bit handheld console released by Nintendo in 1998. It was the first Game Boy model with a color screen, supporting up to 56 colors simultaneously from a palette of 32,768. The GBC was fully backward compatible with the original Game Boy library, giving it instant access to thousands of games. Its defining titles include Pokemon Gold and Silver, Pokemon Crystal, The Legend of Zelda: Link\'s Awakening DX, and Wario Land 3. The GBC sold over 118 million units combined with the original Game Boy, making it one of the best-selling consoles in history.', intro: 'The Game Boy Color (GBC), released in 1998, was Nintendo\'s first handheld with a color display. It brought full-color gaming to the massive Game Boy installbase while maintaining backward compatibility with the original Game Boy library. The GBC featured a 160×144 pixel screen capable of displaying 56 colors simultaneously from a palette of 32,768. Its library included landmark titles like Pokémon Gold/Silver, The Legend of Zelda: Link\'s Awakening DX, and Super Mario Bros. Deluxe. With over 118 million units sold worldwide, the Game Boy Color cemented Nintendo\'s dominance in portable gaming and served as the bridge between the monochrome Game Boy era and the Game Boy Advance.', image: '/images/gbc-console.webp', marketData: { unitsSold: 'Global: 118.69M', bestSelling: 'Pokémon Red/Blue/Yellow (46M+)', lifespan: '1998–2003 (5 years)' }, technicalSpecs: { cpu: 'Sharp LR35902 (8-bit, 4.19 MHz)', memory: '8 KB RAM + 8 KB VRAM', graphics: '160×144 resolution, 56 colors on-screen', sound: '4-channel stereo (2 square, 1 wave, 1 noise)', media: 'Cartridge (up to 8MB)' }, usageCharacteristics: { localTerms: ['GBC', 'Link Cable', 'Mobile Adapter', 'Pocket Camera'], uniquePractices: ['Trading Pokémon via Link Cable', 'Using Game Boy Printer for stickers', 'Color-coding cartridges by region'] } },
];

const TAGS = [
  'turn-based', 'exploration', 'collection', 'platforming precision', 'side-scrolling',
  'boss fights', 'puzzle-solving', 'metroidvania', 'racing', 'multiplayer',
  'vehicles', 'casual play', 'vibrant colors', 'cartoonish', 'copy abilities',
  'soul collection', 'gothic', 'mine carts', 'tactical RPG', 'strategy',
  'permadeath', 'medieval', 'speed', 'chaos emeralds', 'fighting',
  'beat em up', 'anime', 'martial arts', 'farming', 'life sim',
  'romance', 'relaxing', 'open world', 'crime', 'missions', 'action',
  'rom hack', 'fakemon', 'dark story', 'action-adventure', 'dungeons',
  'action RPG', 'humor', 'combo attacks', 'classic', '8-bit', 'atmospheric',
  'secret exits', 'retro 3D', 'speedrun', 'all pokemon'
];

const DEVELOPERS = [
  { name: 'Game Freak', slug: 'game-freak', desc: 'Play Game Freak games online free. The developer of the Pokemon series for Game Boy Advance.', bio: 'Founded in 1989 by Satoshi Tajiri and Ken Sugimori, Game Freak began as a video game magazine before transitioning to game development. The studio\'s name comes from their magazine of the same name, which covered the nascent Japanese gaming scene.\n\nGame Freak is best known as the creator of the Pokémon franchise, which has become the highest-grossing media franchise in history. Their design DNA centers on collection mechanics, incremental progression, and social trading features that defined a generation of gaming.\n\nTechnically, Game Freak pushed the Game Boy hardware to its limits with each Pokémon generation, introducing complex sprite animations, weather effects, and elaborate battle systems within the constraints of portable hardware. Their innovation of the breeding and EV/IV system created unprecedented depth in monster-collecting games.\n\nCulturally, Game Freak\'s impact on gaming is immeasurable. Pokémon established the monster-collecting genre, influenced countless RPGs, and created a global phenomenon spanning games, anime, manga, and merchandise.' },
  { name: 'Nintendo', slug: 'nintendo', desc: 'Play Nintendo GBA games online free. Mario, Zelda, Metroid, and more first-party classics in your browser.', bio: 'Nintendo, founded in 1889 as a playing card company in Kyoto, Japan, has become one of the most influential forces in video game history. The company pivoted to electronic entertainment in the 1970s under the leadership of Hiroshi Yamauchi.\n\nNintendo\'s design philosophy centers on innovation and accessibility. The company pioneered entire genres—from platformers with Super Mario Bros. to action-adventures with The Legend of Zelda—and consistently prioritized fun over technical specifications.\n\nTechnically, Nintendo has a history of unexpected hardware choices that pay off. The Game Boy\'s monochrome screen was a deliberate choice for battery life and durability, and their first-party software consistently achieves critical acclaim and commercial success.\n\nCulturally, Nintendo created many of gaming\'s most iconic characters and franchises. Mario, Link, Samus, and Kirby are recognized worldwide. The company\'s influence extends beyond games to theme parks, movies, and merchandise.' },
  { name: 'Capcom', slug: 'capcom', desc: 'Play Capcom GBA games online free. Zelda: The Minish Cap and more in your browser.', bio: 'Capcom, founded in 1979 as a manufacturer of electronic games, has become one of Japan\'s most respected game developers and publishers. The company\'s name derives from "Capsule Computer," reflecting their vision of bringing arcade-quality gaming to home systems.\n\nCapcom\'s design philosophy emphasizes tight gameplay mechanics and challenging difficulty. From the precise platforming of Mega Man to the frame-perfect inputs of Street Fighter, their games reward mastery and practice.\n\nTechnically, Capcom has been a pioneer in fighting game engines, survival horror atmosphere, and action game design. The MT Framework engine powered some of the most impressive multi-platform titles of the 2000s.\n\nCulturally, Capcom created some of gaming\'s most enduring franchises: Street Fighter, Mega Man, Resident Evil, Devil May Cry, Monster Hunter, and Phoenix Wright. Their fighting game innovations established competitive gaming as we know it.' },
  { name: 'HAL Laboratory', slug: 'hal-laboratory', desc: 'Play HAL Laboratory games online free. Kirby: Nightmare in Dream Land and Kirby & the Amazing Mirror.', bio: 'HAL Laboratory, founded in 1980 in Kyoto, Japan, is a first-party Nintendo developer known for creating Kirby, Super Smash Bros., and EarthBound. The company\'s name supposedly stands for "Help And Lend," though this is likely a backronym.\n\nHAL Laboratory\'s design philosophy centers on accessibility and joy. Kirby games are designed to be completable by anyone, while Super Smash Bros. created an entirely new genre that bridges competitive and casual play.\n\nTechnically, HAL Laboratory has shown remarkable versatility, creating platformers, fighting games, RPGs, and experimental titles. Their work on Super Smash Bros. created a fighting game engine that handles dozens of unique character movesets simultaneously.\n\nCulturally, HAL Laboratory created some of gaming\'s most endearing characters and experiences. Kirby\'s pink, round design became iconic, and Super Smash Bros. created a celebration of gaming history.' },
  { name: 'Konami', slug: 'konami', desc: 'Play Konami GBA games online free. Castlevania: Aria of Sorrow in your browser.', bio: 'Konami, founded in 1969 in Osaka, Japan, began as a jukebox rental business before becoming one of gaming\'s most prolific publishers. The company name combines the founders\' surnames: Kagemasa, Nakama, and Miyasako.\n\nKonami\'s design philosophy varies across their franchises but consistently emphasizes atmospheric storytelling and tight gameplay. Their Castlevania series defined the "Metroidvania" genre.\n\nTechnically, Konami was an early adopter of CD-ROM technology and pushed audio design with their Castlevania soundtracks. Their internal development teams mastered the art of creating atmosphere through limited hardware.\n\nCulturally, Konami created some of gaming\'s most beloved franchises: Castlevania, Metal Gear Solid, Contra, Dance Dance Revolution, and Yu-Gi-Oh!.' },
  { name: 'Rare', slug: 'rare', desc: 'Play Rare games online free. Donkey Kong Country for GBA in your browser.', bio: 'Rare, founded in 1985 in Twycross, England, became one of the most celebrated game developers of the 1990s. The studio, founded by Tim and Chris Stamper, was known for pushing hardware to its limits.\n\nRare\'s design philosophy emphasized polish, personality, and playful innovation. Their games featured colorful characters, hidden secrets, and a sense of joy that made them instantly appealing.\n\nTechnically, Rare was legendary for extracting unprecedented performance from Nintendo hardware. Donkey Kong Country\'s pre-rendered sprites looked like 3D graphics on the SNES.\n\nCulturally, Rare created some of the most beloved games of the 1990s. Donkey Kong Country revitalized the Donkey Kong franchise, and Banjo-Kazooie defined 3D collectathon platforming.' },
  { name: 'Intelligent Systems', slug: 'intelligent-systems', desc: 'Play Intelligent Systems games online free. Fire Emblem: Sacred Stones in your browser.', bio: 'Intelligent Systems, founded in 1986 in Kyoto, Japan, is a first-party Nintendo developer best known for creating the Fire Emblem and Advance Wars franchises.\n\nIntelligent Systems\' design philosophy centers on strategic depth and meaningful choices. Their tactical RPGs feature permadeath systems that raise the stakes of every decision.\n\nTechnically, Intelligent Systems has consistently delivered impressive strategy games on Nintendo hardware. The Wars series pioneered accessible turn-based strategy.\n\nCulturally, Intelligent Systems helped define the strategy RPG genre. Fire Emblem\'s permadeath mechanic influenced countless games, and Advance Wars brought turn-based strategy to mainstream audiences.' },
  { name: 'Sonic Team', slug: 'sonic-team', desc: 'Play Sonic Team games online free. Sonic Advance 3 in your browser.', bio: 'Sonic Team, originally Sega\'s AM8 development team, was formed in 1990 to create Sega\'s mascot character. The team, led by Yuji Naka and Naoto Ohshima, created Sonic the Hedgehog in response to Nintendo\'s Mario.\n\nSonic Team\'s design philosophy centers on speed and momentum. Sonic games are built around the sensation of movement, with level design that rewards speed and exploration simultaneously.\n\nTechnically, Sonic Team pushed Sega\'s hardware to its limits. The original Sonic the Hedgehog used parallax scrolling and rapid sprite movement to create a sense of speed unprecedented in 2D gaming.\n\nCulturally, Sonic the Hedgehog became Sega\'s iconic mascot and challenged Nintendo\'s dominance in the early 1990s. The "console wars" between Sonic and Mario defined a generation of gaming.' },
  { name: 'Bandai', slug: 'bandai', desc: 'Play Bandai GBA games online free. Dragon Ball: Advanced Adventure in your browser.', bio: 'Bandai, founded in 1950 in Tokyo, Japan, became one of the largest toy companies in the world before expanding into video games. The company is known for adapting popular anime and manga into playable experiences.\n\nBandai\'s design philosophy centers on faithful adaptation and fan service. Their games capture the essence of beloved franchises while delivering solid gameplay.\n\nTechnically, Bandai mastered the art of genre adaptation, turning anime properties into fighting games, RPGs, and action adventures.\n\nCulturally, Bandai brought Dragon Ball and other anime franchises to interactive form, establishing the template for anime-based video games.' },
  { name: 'Marvelous', slug: 'marvelous', desc: 'Play Marvelous games online free. Harvest Moon: Friends of Mineral Town in your browser.', bio: 'Marvelous, founded in 1997, became one of Japan\'s most beloved game developers through the Harvest Moon and Story of Seasons series. The company focuses on life simulation and farming games.\n\nMarvelous\'s design philosophy centers on charm and relaxation. Their games provide cozy, low-stress experiences that emphasize daily rhythms and community building.\n\nTechnically, Marvelous perfected the farming simulation formula, creating deep systems for crop growth, animal care, and relationships.\n\nCulturally, Marvelous created the farming simulation genre as we know it, influencing countless games from Stardew Valley to Animal Crossing.' },
  { name: 'Vicarious Visions', slug: 'vicarious-visions', desc: 'Play Vicarious Visions games online free. Crash Bandicoot: The Huge Adventure in your browser.', bio: 'Vicarious Visions, founded in 1991 in Menands, New York, became known for their exceptional handheld game ports and the Tony Hawk\'s Pro Skater series on Game Boy Advance.\n\nVicarious Visions\' design philosophy centered on faithful adaptation and technical achievement. Their handheld ports captured the essence of console games while adapting them for smaller screens.\n\nTechnically, Vicarious Visions mastered the art of pushing handheld hardware. Their Tony Hawk\'s Pro Skater ports on GBA were remarkably faithful to the console versions.\n\nCulturally, Vicarious Visions brought console-quality gaming to handhelds at a time when portable games were often seen as inferior.' },
  { name: 'Rockstar Games', slug: 'rockstar-games', desc: 'Play Rockstar Games online free. GTA Advance in your browser.', bio: 'Rockstar Games, founded in 1998 as a subsidiary of Take-Two Interactive, became one of the most influential publishers in gaming history through the Grand Theft Auto series.\n\nRockstar\'s design philosophy centers on player freedom and immersive open worlds. Their games reward exploration and experimentation while delivering biting social satire.\n\nTechnically, Rockstar pushed open-world technology forward with each release, creating living cities with emergent gameplay.\n\nCulturally, GTA Advance brought the open-world crime formula to the Game Boy Advance, proving the genre could work on handheld hardware.' },
  { name: 'AlphaDream', slug: 'alphadream', desc: 'Play AlphaDream games online free. Mario & Luigi: Superstar Saga in your browser.', bio: 'AlphaDream, founded in 2000 in Tokyo, Japan, was a studio best known for developing the Mario & Luigi RPG series.\n\nAlphaDream\'s design philosophy centered on humor and accessible complexity. Their Mario & Luigi games featured timing-based combat that made turn-based RPGs feel active and engaging.\n\nTechnically, AlphaDream pioneered the "action command" system for the Mario & Luigi series, requiring players to time button presses during attacks and defenses.\n\nCulturally, AlphaDream\'s Mario & Luigi series became one of Nintendo\'s most beloved RPG franchises. Their comedic take on the Mario universe showed that licensed games could have personality.' },
  { name: 'LSA', slug: 'lsa', desc: 'Play LSA ROM hacks online free. Pokemon Ultra Violet for GBA in your browser.', bio: 'LSA is the creator of Pokémon Ultra Violet, a legendary FireRed ROM hack that expanded the base game significantly.\n\nLSA\'s design philosophy centers on completeness. Ultra Violet features all Pokemon from Gen 1-3 catchable in a single playthrough without trading.\n\nTechnically, LSA mastered ROM hacking, modifying the base FireRed ROM to add new locations, mechanics, and quality-of-life improvements.\n\nCulturally, Ultra Violet became one of the most popular Pokemon ROM hacks ever made, introducing countless players to the world of Pokemon ROM hacking.' },
  { name: 'ROM Hack', slug: 'rom-hack', desc: 'Play the best Pokemon ROM hacks online free. Pokemon Jupiter and more in your browser.', bio: 'ROM hacks are community-created modifications of original games that expand, improve, or completely transform the source material.\n\nThe ROM hacking design philosophy centers on creativity within constraints. Hackers use reverse engineering to add new content, fix bugs, or create entirely new experiences.\n\nTechnically, ROM hacking requires deep understanding of assembly code, hex editing, and game engines. Modern hacks can rival professional games in scope.\n\nCulturally, the ROM hacking community preserves gaming history while creating new classics, ensuring beloved games continue to evolve decades after release.' },
  { name: 'CPS-II', slug: 'cps-ii', desc: 'Play CPS-II GBA games online free. Dragon Ball Z: Supersonic Warriors in your browser.' },
  { name: 'Camelot', slug: 'camelot', desc: 'Play Camelot GBA games online free. Golden Sun and Mario Tennis in your browser.' },
  { name: 'Griptonite Games', slug: 'griptonite-games', desc: 'Play Griptonite Games GBA online free. LEGO Star Wars in your browser.' },
  { name: 'Heavy Iron Studios', slug: 'heavy-iron-studios', desc: 'Play Heavy Iron Studios GBA online free. SpongeBob Battle for Bikini Bottom in your browser.' },
  { name: 'Hudson Soft', slug: 'hudson-soft', desc: 'Play Hudson Soft GBA games online free. Bomberman Tournament in your browser.' },
  { name: 'Infogrames', slug: 'infogrames', desc: 'Play Infogrames GBA games online free. Alone in the Dark in your browser.' },
  { name: 'KnowWonder', slug: 'knowwonder', desc: 'Play KnowWonder GBA games online free. Harry Potter in your browser.' },
  { name: 'Monster Games', slug: 'monster-games', desc: 'Play Monster Games GBA online free. Pilotwings Resort in your browser.' },
  { name: 'Namco', slug: 'namco', desc: 'Play Namco GBA games online free. Pac-Man and Tales of Phantasia in your browser.' },
  { name: 'Next Entertainment', slug: 'next-entertainment', desc: 'Play Next Entertainment GBA online free. Shining Soul II in your browser.' },
  { name: 'Now Production', slug: 'now-production', desc: 'Play Now Production GBA games online free. Pac-Man World in your browser.' },
  { name: 'Pocketeers', slug: 'pocketeers', desc: 'Play Pocketeers GBA games online free. Need for Speed Underground in your browser.' },
  { name: 'Radical Entertainment', slug: 'radical-entertainment', desc: 'Play Radical Entertainment GBA online free. Simpsons Road Rage in your browser.' },
  { name: 'Square Enix', slug: 'square-enix', desc: 'Play Square Enix GBA games online free. Final Fantasy and Sword of Mana in your browser.' },
  { name: 'TOYS FOR BOB', slug: 'toys-for-bob', desc: 'Play TOYS FOR BOB GBA games online free. Shrek SuperSlam in your browser.' },
  { name: 'Ubisoft', slug: 'ubisoft', desc: 'Play Ubisoft GBA games online free. Rayman and Lemmets in your browser.' },
  { name: 'id Software', slug: 'id-software', desc: 'Play id Software GBA games online free. Doom in your browser.' },
];

const LANGUAGES = [
  { code: 'en', name: 'English', hreflang: 'en' },
  { code: 'es', name: 'Espanol', hreflang: 'es' },
  { code: 'pt', name: 'Portugues', hreflang: 'pt' },
  { code: 'fr', name: 'Francais', hreflang: 'fr' },
  { code: 'de', name: 'Deutsch', hreflang: 'de' },
  { code: 'ja', name: 'Japanese', hreflang: 'ja' },
  { code: 'ko', name: 'Korean', hreflang: 'ko' },
  { code: 'hi', name: 'Hindi', hreflang: 'hi' },
  { code: 'ar', name: 'Arabic', hreflang: 'ar' },
  { code: 'ru', name: 'Russian', hreflang: 'ru' },
];



function starsHTML(rating) {
  const full = Math.floor(rating / 2);
  const half = rating % 2 >= 1 ? 1 : 0;
  let stars = '';
  for (let i = 0; i < full; i++) stars += '★';
  if (half) stars += '☆';
  for (let i = full + half; i < 5; i++) stars += '☆';
  return stars;
}

function padMeta(s) {
  let out = s.trim();
  if (out.length > 158) {
    out = out.slice(0, 155).replace(/\s+\S*$/, '') + '...';
  }
  if (out.length < 120) {
    const extras = [' No download, no install.', ' Play free in your browser.', ' No account needed.', ' Works on mobile and desktop.'];
    for (const e of extras) {
      if (out.length + e.length > 158) break;
      out += e;
      if (out.length >= 120) break;
    }
  }
  return out;
}

function metaDesc(game) {
  const lead = `Play ${game.title} (${game.year}) online free.`;
  const sentences = game.desc.split('.').map(s => s.trim()).filter(Boolean);
  let detail = (sentences[1] || sentences[0]) + '.';
  let full = `${lead} ${detail}`;
  if (full.length < 125 && sentences[2]) {
    detail = `${sentences[1]}. ${sentences[2]}.`;
    full = `${lead} ${detail}`;
  }
  if (full.length > 158) {
    const budget = 155 - lead.length - 1;
    full = `${lead} ${detail.length > budget ? detail.slice(0, budget - 1).trimEnd() + '...' : detail}`;
  }
  if (full.length < 120) full = `${full} No download, no install.`;
  return full;
}

function navHTML(active) {
  return `<nav class="nav">
    <div style="display:flex;align-items:center;">
      <a href="/" class="brand">EggerMath</a>
      <button class="hamburger" onclick="toggleSidebar()" aria-label="Toggle navigation menu">&#9776;</button>
    </div>
    <div class="nav-links">
      <a href="/"${active === 'home' ? ' class="active"' : ''}>Home</a>
      <a href="/gameboy-advance/"${active === 'gba' ? ' class="active"' : ''}>Game Boy Advance</a>
      <a href="/gameboy-color/"${active === 'gbc' ? ' class="active"' : ''}>Game Boy Color</a>
      <a href="/genre/"${active === 'genres' ? ' class="active"' : ''}>Genres</a>
      <a href="/series/"${active === 'series' ? ' class="active"' : ''}>Series</a>
      <a href="/tags/"${active === 'tags' ? ' class="active"' : ''}>Tags</a>
      <a href="/blog/"${active === 'blog' ? ' class="active"' : ''}>Blog</a>
      <div class="search-container">
        <button class="search-toggle" onclick="toggleSearch()" aria-label="Search">&#128269;</button>
        <input type="text" class="search-input" id="site-search" placeholder="Search games..." oninput="handleSearch(this.value)" onkeydown="if(event.key==='Escape'){closeSearch();}" autocomplete="off">
        <div class="search-results" id="search-results"></div>
      </div>
    </div>
  </nav>`;
}

function breadcrumbs(items) {
  let html = '<nav class="breadcrumbs" aria-label="Breadcrumb">';
  items.forEach((item, i) => {
    if (i === items.length - 1) {
      html += `<span class="current">${item.name}</span>`;
    } else {
      html += `<a href="${item.url}">${item.name}</a><span class="sep">›</span>`;
    }
  });
  html += '</nav>';
  return html;
}

function sidebarHTML(active) {
  const consoleLinks = CONSOLES.map(c =>
    `<a href="/${c.slug}/"${active === c.slug ? ' class="active-link"' : ''}>${c.name} (${c.count})</a>`
  ).join('\n      ');

  const genreLinks = GENRES.map(g =>
    `<a href="/genre/${g.slug}/"${active === 'genre-' + g.slug ? ' class="active-link"' : ''}>${g.name} (${GAMES.filter(gm => gm.genre === g.name).length})</a>`
  ).join('\n      ');

  const seriesLinks = SERIES.map(s =>
    `<a href="/series/${s.slug}/"${active === 'series-' + s.slug ? ' class="active-link"' : ''}>${s.name} (${GAMES.filter(gm => gm.series === s.name).length})</a>`
  ).join('\n      ');

  const allTagCounts = [...new Set(GAMES.flatMap(g => g.tags))].map(t => ({ name: t, count: GAMES.filter(g => g.tags.includes(t)).length }));
  allTagCounts.sort((a, b) => b.count - a.count);
  const topTags = allTagCounts.slice(0, 20);
  const tagLinks = topTags.map(t =>
    `<a href="/tags/${t.name.replace(/\s+/g, '-')}/"${active === 'tag-' + t.name ? ' class="active-link"' : ''}>${t.name} (${t.count})</a>`
  ).join('\n      ');

  return `<aside class="sidebar" id="sidebar">
    <div class="sidebar-section">
      <h3>&#x1F579;&#xFE0F; Game Emulators</h3>
      ${consoleLinks}
    </div>
    <div class="sidebar-section">
      <h3>&#x1F3AE; Game Genres</h3>
      ${genreLinks}
    </div>
    <div class="sidebar-section">
      <h3>&#x1F3AF; Game Series</h3>
      ${seriesLinks}
    </div>
    <div class="sidebar-section">
      <h3>&#x1F3F7;&#xFE0F; Game Tags</h3>
      ${tagLinks}
    </div>
  </aside>
  <div class="sidebar-overlay" id="sidebar-overlay" onclick="closeSidebar()"></div>`;
}

function pageLayout(active, crumbs, contentHTML) {
  return `${sidebarHTML(active)}
  <main class="main-content">
    ${breadcrumbs(crumbs)}
    <div class="container">
    ${contentHTML}
    </div>
  </main>`;
}

function searchIndexJSON() {
  return JSON.stringify(GAMES.map(g => ({
    title: g.title,
    slug: g.slug,
    genre: g.genre,
    series: g.series,
    year: g.year,
    developer: g.developer,
    tags: g.tags,
    platform: 'GBA'
  })));
}

function header() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://cache.downloadroms.io" crossorigin>
  <link rel="dns-prefetch" href="https://cache.downloadroms.io">
  <meta name="robots" content="index, follow">`;
}

function baseStyle() {
  return `    <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', 'Inter', sans-serif; background: #161a13; color: #f0ebe0; min-height: 100vh; }
    .nav { background: #0d0d1a; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); position: sticky; top: 0; z-index: 200; }
    .nav a { color: rgba(240,235,224,0.6); text-decoration: none; font-size: 0.85rem; margin-left: 18px; }
    .nav a.brand { color: #c4a35a; font-weight: 700; font-size: 1.1rem; margin-left: 0; }
    .nav a.active { color: #c4a35a; }
    .nav-links { display: flex; align-items: center; }
    @media (max-width: 700px) { .nav-links { display: none; } }
    .hamburger { display: none; background: none; border: none; color: #c4a35a; font-size: 1.4rem; cursor: pointer; padding: 4px 8px; margin-left: 12px; }
    @media (max-width: 1279px) { .hamburger { display: inline-block; } }
    .search-toggle { background: none; border: none; color: rgba(240,235,224,0.6); font-size: 1rem; cursor: pointer; padding: 4px 8px; margin-left: 12px; }
    .search-toggle:hover { color: #c4a35a; }
    .search-container { position: relative; display: flex; align-items: center; }
    .search-input { display: none; background: rgba(18,18,31,0.9); color: #f0ebe0; border: 1px solid rgba(196,163,90,0.3); border-radius: 8px; padding: 8px 12px; font-size: 0.85rem; width: 220px; outline: none; }
    .search-input:focus { border-color: #c4a35a; }
    .search-input.active { display: inline-block; }
    .search-results { display: none; position: absolute; top: 100%; right: 0; width: 340px; max-height: 400px; overflow-y: auto; background: #0d0d1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; margin-top: 6px; z-index: 300; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
    .search-results.active { display: block; }
    .search-result-item { padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); cursor: pointer; text-decoration: none; display: block; }
    .search-result-item:hover { background: rgba(196,163,90,0.1); }
    .search-result-item .sr-title { color: #c4a35a; font-size: 0.9rem; font-weight: 600; }
    .search-result-item .sr-meta { color: rgba(240,235,224,0.4); font-size: 0.75rem; margin-top: 2px; }
    .search-no-results { padding: 14px; color: rgba(240,235,224,0.4); font-size: 0.85rem; text-align: center; }
    .breadcrumbs { padding: 10px 24px; font-size: 0.8rem; color: rgba(240,235,224,0.4); max-width: 1200px; margin: 0 auto; }
    .breadcrumbs a { color: rgba(240,235,224,0.5); text-decoration: none; }
    .breadcrumbs .sep { margin: 0 6px; }
    .breadcrumbs .current { color: #c4a35a; }
    .layout { display: flex; min-height: calc(100vh - 49px); }
    .sidebar { width: 260px; background: #0d0d1a; border-right: 1px solid rgba(255,255,255,0.06); overflow-y: auto; position: fixed; top: 49px; left: 0; bottom: 0; padding: 20px 0; z-index: 150; transition: transform 0.3s ease; }
    .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 149; }
    .sidebar-overlay.active { display: block; }
    .sidebar-section { padding: 0 16px; margin-bottom: 20px; }
    .sidebar-section h3 { color: #c4a35a; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; padding: 8px 0 6px; border-bottom: 1px solid rgba(196,163,90,0.15); margin-bottom: 6px; }
    .sidebar-section a { display: block; color: rgba(240,235,224,0.6); text-decoration: none; font-size: 0.82rem; padding: 4px 8px; border-radius: 6px; transition: all 0.15s; }
    .sidebar-section a:hover { color: #c4a35a; background: rgba(196,163,90,0.08); }
    .sidebar-section a.active-link { color: #c4a35a; background: rgba(196,163,90,0.12); }
    .main-content { flex: 1; min-width: 0; margin-left: 260px; }
    .container { max-width: 1000px; margin: 0 auto; padding: 30px 24px 60px; }
    h1 { font-size: 1.8rem; color: #f0ebe0; margin-bottom: 12px; }
    .meta { color: rgba(240,235,224,0.5); font-size: 0.9rem; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .card { padding: 16px; background: rgba(18,18,31,0.8); border-radius: 12px; border: 1px solid rgba(255,255,255,0.04); }
    .card h3 { font-size: 1rem; color: #c4a35a; margin-bottom: 6px; }
    .card h3 a { color: #c4a35a; text-decoration: none; }
    .card p { font-size: 0.82rem; color: rgba(240,235,224,0.55); line-height: 1.5; }
    .card .sub { font-size: 0.75rem; color: rgba(240,235,224,0.3); }
    .stars { color: #c4a35a; letter-spacing: 2px; }
    .rating-num { color: rgba(240,235,224,0.4); font-size: 0.8rem; }
    .footer { margin-top: 40px; padding: 30px 24px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; color: rgba(240,235,224,0.3); font-size: 0.8rem; }
    .footer a { color: rgba(240,235,224,0.4); text-decoration: none; margin: 0 8px; }
    .history { font-size: 0.95rem; line-height: 1.8; color: rgba(240,235,224,0.75); margin: 16px 0; }
    .chip-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
    .chip { background: rgba(196,163,90,0.12); color: #c4a35a; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; text-decoration: none; border: 1px solid rgba(196,163,90,0.3); }
    @media (max-width: 1279px) {
      .sidebar { transform: translateX(-100%); }
      .sidebar.open { transform: translateX(0); }
      .main-content { margin-left: 0; }
    }
    </style>`;
}

function footerHTML() {
  return `<footer class="footer">
    <p>&copy; 2026 EggerMath — Free GBA & Gameboy Emulator</p>
    <p><a href="/">Home</a>|<a href="/gameboy-advance/">Game Boy Advance</a>|<a href="/gameboy-color/">Game Boy Color</a>|<a href="/genre/">Genres</a>|<a href="/series/">Series</a>|<a href="/tags/">Tags</a>|<a href="/blog/">Blog</a>|<a href="privacy.html">Privacy</a>|<a href="terms.html">Terms</a>|<a href="takedown.html">DMCA</a></p>
  </footer>
  <script>
  var searchIndex = null;
  function toggleSidebar() {
    var sb = document.getElementById('sidebar');
    var ov = document.getElementById('sidebar-overlay');
    if (sb) { sb.classList.toggle('open'); }
    if (ov) { ov.classList.toggle('active'); }
  }
  function closeSidebar() {
    var sb = document.getElementById('sidebar');
    var ov = document.getElementById('sidebar-overlay');
    if (sb) { sb.classList.remove('open'); }
    if (ov) { ov.classList.remove('active'); }
  }
  function toggleSearch() {
    var input = document.getElementById('site-search');
    var results = document.getElementById('search-results');
    if (input) {
      input.classList.toggle('active');
      if (input.classList.contains('active')) {
        input.focus();
      } else {
        input.value = '';
        if (results) results.classList.remove('active');
      }
    }
  }
  function closeSearch() {
    var input = document.getElementById('site-search');
    var results = document.getElementById('search-results');
    if (input) { input.classList.remove('active'); input.value = ''; }
    if (results) results.classList.remove('active');
  }
  function loadSearchIndex() {
    if (searchIndex) return Promise.resolve(searchIndex);
    return fetch('/search-index.json').then(function(r) { return r.json(); }).then(function(data) { searchIndex = data; return data; });
  }
  function handleSearch(query) {
    var results = document.getElementById('search-results');
    if (!results) return;
    if (!query || query.length < 2) { results.classList.remove('active'); return; }
    loadSearchIndex().then(function(data) {
      var q = query.toLowerCase();
      var matches = data.filter(function(g) {
        return g.title.toLowerCase().indexOf(q) !== -1 ||
               g.genre.toLowerCase().indexOf(q) !== -1 ||
               g.series.toLowerCase().indexOf(q) !== -1 ||
               g.developer.toLowerCase().indexOf(q) !== -1 ||
               g.tags.some(function(t) { return t.toLowerCase().indexOf(q) !== -1; });
      }).slice(0, 10);
      if (matches.length === 0) {
        results.innerHTML = '<div class="search-no-results">No games found</div>';
      } else {
        results.innerHTML = matches.map(function(g) {
          return '<a class="search-result-item" href="/games/' + g.slug + '.html"><div class="sr-title">' + g.title + '</div><div class="sr-meta">' + g.year + ' · ' + g.genre + ' · ' + g.platform + '</div></a>';
        }).join('');
      }
      results.classList.add('active');
    }).catch(function() {});
  }
  document.addEventListener('click', function(e) {
    var sc = document.querySelector('.search-container');
    if (sc && !sc.contains(e.target)) { closeSearch(); }
  });
  </script>
</body>
</html>`;
}

function gamePageHTML(game) {
  const seriesGames = GAMES.filter(g => g.series === game.series && g.slug !== game.slug).slice(0, 6);
  const remaining = 6 - seriesGames.length;
  const genreGames = remaining > 0 ? GAMES.filter(g => g.genre === game.genre && g.slug !== game.slug && !seriesGames.some(s => s.slug === g.slug)).slice(0, remaining) : [];
  const related = [...seriesGames, ...genreGames];
  const relatedHTML = related.map(g => `<div class="card"><a href="/games/${g.slug}.html"><img src="/games/covers/${g.slug}.svg" alt="${g.title}" loading="lazy" style="width:100%;border-radius:8px;margin-bottom:8px;"></a><h3><a href="/games/${g.slug}.html">${g.title}</a></h3><div class="sub">${g.year} · ${g.genre}</div>${g.series !== game.series ? `<div class="sub">${g.series} Series</div>` : ''}<div class="sub"><a href="/games/${g.slug}.html" style="color:#c4a35a;">View Game →</a></div></div>`).join('\n');
  const tagsHTML = game.tags.map(t => `<a class="chip" href="/tags/${t.replace(/\s+/g, '-')}/">${t}</a>`).join('');

  return `${header()}
  <title>${game.title} | Game Boy Advance ${game.year} | Play Retro Games Online Free</title>
  <meta name="description" content="${metaDesc(game)}">
  <link rel="canonical" href="${SITE}/games/${game.slug}.html">
  <meta property="og:title" content="Play ${game.title} Online Free — GBA Emulator">
  <meta property="og:description" content="${game.desc.split('.')[0]}.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE}/games/${game.slug}.html">
  <meta property="og:site_name" content="EggerMath">
  <meta property="og:image" content="${SITE}/images/eggermath-logo.png">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "VideoGame",
        "name": "${game.title}",
        "description": "${game.desc}",
        "gameEmulator": "Game Boy Advance",
        "applicationCategory": "Game",
        "operatingSystem": "Web Browser",
        "datePublished": "${game.year}",
        "genre": ["${game.genre}"],
        "gamePlatform": "Game Boy Advance",
        "isAccessibleForFree": true,
        "inLanguage": "en",
        "keywords": "${game.title}, GBA, Game Boy Advance, play ${game.title} online, ${game.title} emulator",
        "author": {"@type": "Organization", "name": "EggerMath"},
        "gameSeries": "${game.series}",
        "gameLocation": "${SITE}/games/${game.slug}.html",
        "publisher": {"@type": "Organization", "name": "${game.developer}"},
        "url": "${SITE}/games/${game.slug}.html",
        "aggregateRating": {"@type": "AggregateRating", "ratingValue": ${game.rating}, "bestRating": 10, "ratingCount": ${game.ratingCount}}
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {"@type": "ListItem", "position": 1, "name": "Home", "item": "${SITE}/"},
          {"@type": "ListItem", "position": 2, "name": "Game Boy Advance", "item": "${SITE}/gameboy-advance/"},
          {"@type": "ListItem", "position": 3, "name": "${game.title}", "item": "${SITE}/games/${game.slug}.html"}
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {"@type": "Question", "name": "How do I play ${game.title} online?", "acceptedAnswer": {"@type": "Answer", "text": "Click the Play button above to start ${game.title} instantly in your browser. No download, no installation required. The game runs on mGBA WebAssembly."}},
          {"@type": "Question", "name": "Can I save my progress in ${game.title}?", "acceptedAnswer": {"@type": "Answer", "text": "Yes. Press F5 to save, F9 to load, and F7 to switch between 10 save slots. Progress also auto-saves every 30 seconds."}},
          {"@type": "Question", "name": "Is ${game.title} free to play?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, ${game.title} is completely free to play on EggerMath. No account, no fees, no hidden costs."}}
        ]
      }
    ]
  }
  </script>
  ${baseStyle()}
</head>
<body>
  ${navHTML('gba')}
  ${pageLayout('gba', [{name: 'Home', url: '/'}, {name: 'Games', url: '/gameboy-advance/'}, {name: 'Game Boy Advance', url: '/gameboy-advance/'}, {name: game.title, url: ''}], `
    <span style="display:inline-block;background:rgba(196,163,90,0.15);color:#c4a35a;padding:4px 12px;border-radius:20px;font-size:0.75rem;border:1px solid rgba(196,163,90,0.3);margin-bottom:12px;">GBA · Game Boy Advance</span>
    <h1>${game.title}</h1>
    <div style="margin-bottom:8px;">
      <span class="stars" style="font-size:1.3rem;">${starsHTML(game.rating)}</span>
      <span style="color:#f0ebe0;font-weight:700;font-size:1.1rem;margin-left:6px;">${game.rating}</span>
      <span style="color:rgba(240,235,224,0.4);font-size:0.85rem;">/10</span>
      <span style="color:rgba(240,235,224,0.4);font-size:0.85rem;margin-left:4px;">· ${game.ratingCount} ratings</span>
    </div>
    <div style="margin-bottom:12px;">
      <button onclick="alert('Login to favorite this game')" style="background:rgba(196,163,90,0.12);color:#c4a35a;border:1px solid rgba(196,163,90,0.3);padding:8px 16px;border-radius:8px;cursor:pointer;font-size:0.85rem;margin-right:8px;">♥ Add to Favorites</button>
      <button onclick="alert('Login to report an issue')" style="background:transparent;color:rgba(240,235,224,0.5);border:1px solid rgba(255,255,255,0.15);padding:8px 16px;border-radius:8px;cursor:pointer;font-size:0.85rem;">⚑ Report Issue</button>
    </div>
    <div class="meta">
      <span>${game.year}</span> · <span>${game.genre}</span> · <a href="/series/${game.series.toLowerCase().replace(/\s+/g, '-')}/" style="color:#c4a35a;">${game.series} Series</a> · <a href="/developers/${game.developer.toLowerCase().replace(/\s+/g, '-')}/" style="color:#c4a35a;">${game.developer}</a>
    </div>
    <p style="font-size:1rem;line-height:1.7;color:rgba(240,235,224,0.7);margin-bottom:20px;">${game.desc}</p>
    <div class="chip-row">${tagsHTML}</div>
    <a href="/gba-emulator-web/" class="play-btn" style="display:inline-block;background:#c4a35a;color:#161a13;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:1rem;margin:20px 0;">Play ${game.title} Online Free</a>

    <details style="margin:30px 0;padding:16px;background:rgba(18,18,31,0.8);border-radius:12px;border:1px solid rgba(255,255,255,0.04);" open>
      <summary style="cursor:pointer;font-weight:600;font-size:1.2rem;color:#c4a35a;list-style:none;">Game Controls</summary>
      <p style="color:rgba(240,235,224,0.7);font-size:0.9rem;font-family:monospace;margin-top:10px;">${game.controls}</p>
    </details>

    <div style="margin:30px 0;">
      <h2 style="font-size:1.2rem;color:#c4a35a;margin-bottom:10px;">About This Retro Game</h2>
      <p style="color:rgba(240,235,224,0.7);line-height:1.7;font-size:0.95rem;">Play ${game.title} online in your browser using the Game Boy Advance emulator.</p>
      <p style="color:rgba(240,235,224,0.7);line-height:1.7;font-size:0.95rem;margin-top:8px;">This retro classic from ${game.year} brings the ${game.genre} experience to modern browsers.</p>
      <p style="color:rgba(240,235,224,0.7);line-height:1.7;font-size:0.95rem;margin-top:8px;">No downloads needed - just click Play and start gaming!</p>
      <p style="color:rgba(240,235,224,0.7);line-height:1.7;font-size:0.95rem;margin-top:8px;">${game.title} was developed by ${game.developer} and published for the Game Boy Advance in ${game.year}. As a ${game.genre} title in the ${game.series} series, it features ${game.tags.slice(0,3).join(', ')} gameplay. ${game.desc.split('.')[1] || ''}</p>
      <div style="margin-top:12px;padding:12px;background:rgba(196,163,90,0.08);border-radius:8px;border:1px solid rgba(196,163,90,0.15);">
        <p style="color:rgba(240,235,224,0.5);font-size:0.85rem;"><strong style="color:#c4a35a;">Controls:</strong> ${game.controls}</p>
      </div>
    </div>

    <div style="margin:30px 0;padding:16px;background:rgba(18,18,31,0.8);border-radius:12px;border:1px solid rgba(255,255,255,0.04);">
      <h2 style="font-size:1.2rem;color:#c4a35a;margin-bottom:10px;">Reviews &amp; Ratings</h2>
      <div style="margin-bottom:12px;"><span style="font-size:2rem;font-weight:700;color:#f0ebe0;">${game.rating}</span><span style="color:rgba(240,235,224,0.4);">/10</span> <span class="stars">${starsHTML(game.rating)}</span> <span style="color:rgba(240,235,224,0.4);">· ${game.ratingCount} ratings</span></div>
      <p style="color:rgba(240,235,224,0.5);font-size:0.85rem;margin-bottom:10px;">Players rate ${game.title} ${game.rating}/10 for its ${game.tags.slice(0,2).join(' and ')} gameplay and lasting replay value.</p>
      <button onclick="alert('Login to rate this game')" style="background:rgba(196,163,90,0.12);color:#c4a35a;border:1px solid rgba(196,163,90,0.3);padding:8px 16px;border-radius:8px;cursor:pointer;font-size:0.85rem;">★ Rate This Game</button>
    </div>

    ${related.length ? `<div style="margin:30px 0;"><h2 style="font-size:1.2rem;color:#c4a35a;margin-bottom:12px;">Related Games</h2><div class="grid">${relatedHTML}</div></div>` : ''}

    <div style="margin:30px 0;padding:16px;background:rgba(18,18,31,0.8);border-radius:12px;border:1px solid rgba(255,255,255,0.04);">
      <h2 style="font-size:1.2rem;color:#c4a35a;margin-bottom:10px;">Share This Game</h2>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        <a href="https://twitter.com/intent/tweet?text=Play+${encodeURIComponent(game.title)}+online+free&url=${encodeURIComponent(SITE + '/games/' + game.slug + '.html')}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:rgba(29,161,242,0.15);color:#1da1f2;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.85rem;border:1px solid rgba(29,161,242,0.3);">Twitter / X</a>
        <a href="https://reddit.com/submit?url=${encodeURIComponent(SITE + '/games/' + game.slug + '.html')}&title=Play+${encodeURIComponent(game.title)}+online+free" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:rgba(255,69,0,0.15);color:#ff4500;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.85rem;border:1px solid rgba(255,69,0,0.3);">Reddit</a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE + '/games/' + game.slug + '.html')}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:rgba(24,119,242,0.15);color:#1877f2;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.85rem;border:1px solid rgba(24,119,242,0.3);">Facebook</a>
        <button onclick="navigator.clipboard.writeText('${SITE}/games/${game.slug}.html').then(()=>this.textContent='Copied!').catch(()=>alert('Copy failed'))" style="background:rgba(255,255,255,0.08);color:rgba(240,235,224,0.7);padding:8px 16px;border-radius:8px;cursor:pointer;font-size:0.85rem;border:1px solid rgba(255,255,255,0.15);">Copy Link</button>
      </div>
    </div>

    <div style="margin:30px 0;">
      <h2 style="font-size:1.2rem;color:#c4a35a;margin-bottom:12px;">How to Play ${game.title}</h2>
      <p style="color:rgba(240,235,224,0.7);line-height:1.7;font-size:0.95rem;">Click the "Play" button above to start ${game.title} instantly in your browser. No download, no installation required. The game runs on mGBA WebAssembly. Use keyboard controls (${game.controls}) or touch controls on mobile. Save states, fast forward, and fullscreen are built in.</p>
    </div>

    <div style="margin:30px 0;">
      <h2 style="font-size:1.2rem;color:#c4a35a;margin-bottom:12px;">Frequently Asked Questions</h2>
      <details style="border-bottom:1px solid rgba(255,255,255,0.04);padding:12px 0;"><summary style="cursor:pointer;font-weight:600;color:#f0ebe0;list-style:none;">How do I play ${game.title} online?</summary><p style="padding-top:8px;color:rgba(240,235,224,0.6);font-size:0.9rem;">Click the Play button above to start ${game.title} instantly in your browser. No download, no installation required. The game runs on mGBA WebAssembly.</p></details>
      <details style="border-bottom:1px solid rgba(255,255,255,0.04);padding:12px 0;"><summary style="cursor:pointer;font-weight:600;color:#f0ebe0;list-style:none;">Can I save my progress in ${game.title}?</summary><p style="padding-top:8px;color:rgba(240,235,224,0.6);font-size:0.9rem;">Yes. Press F5 to save, F9 to load, and F7 to switch between 10 save slots. Progress also auto-saves every 30 seconds.</p></details>
      <details style="border-bottom:1px solid rgba(255,255,255,0.04);padding:12px 0;"><summary style="cursor:pointer;font-weight:600;color:#f0ebe0;list-style:none;">Is ${game.title} free to play?</summary><p style="padding-top:8px;color:rgba(240,235,224,0.6);font-size:0.9rem;">Yes, ${game.title} is completely free to play on EggerMath. No account, no fees, no hidden costs.</p></details>
    </div>
  `)}
  ${footerHTML()}`;
}

function consolePageHTML(console) {
  const games = GAMES_WITH_CONSOLE.filter(g => g.console === console.short);
  const gamesHTML = games.length
    ? games.map(g => `<div class="card"><h3><a href="/games/${g.slug}.html">${g.title}</a></h3><p>${g.desc.split('.')[0]}.</p><div class="sub"><span class="stars">${starsHTML(g.rating)}</span> ${g.rating.toFixed(1)} · ${g.genre} · ${g.year}</div></div>`).join('\n')
    : `<div class="card" style="grid-column:1/-1;"><h3>${console.name} games coming soon</h3><p>We are adding ${console.name} games to EggerMath. Bookmark this page and check back.</p></div>`;
  const activeKey = console.slug;
  return `${header()}
  <title>Play ${console.name} Games Online Free — No Download, No Install</title>
  <meta name="description" content="${padMeta(console.desc)}">
  <link rel="canonical" href="${SITE}/${console.slug}/">
  <meta property="og:title" content="Play ${console.name} Games Online Free">
  <meta property="og:description" content="${console.desc}">
  <meta property="og:url" content="${SITE}/${console.slug}/">
  <meta property="og:site_name" content="EggerMath">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "name": "Play ${console.name} Games Online Free",
        "description": "${console.desc}",
        "url": "${SITE}/${console.slug}/",
        "isPartOf": {"@type": "WebSite", "name": "EggerMath", "url": "${SITE}"}
      },
      {
        "@type": "VideoGameSeries",
        "name": "${console.name} Games",
        "gamePlatform": "${console.name}",
        "description": "${console.desc}"
      }
    ]
  }
  </script>
  ${baseStyle()}
</head>
<body>
  ${navHTML(activeKey)}
  ${pageLayout(activeKey, [{name: 'Home', url: '/'}, {name: console.name, url: ''}], `
    <h1>Play ${console.name} Games Online Free</h1>
    <p class="meta">${console.count}+ games · ${console.year} console · No download, no install</p>
    ${console.image ? `<img src="${console.image}" alt="${console.name}" style="max-width:260px;border-radius:10px;border:2px solid #c4a35a;float:right;margin:0 0 16px 20px;">` : ''}
    <div class="history">${console.history}</div>
    ${console.marketData ? `
    <h2 style="font-size:1.3rem;color:#c4a35a;margin:30px 0 16px;">📊 Market Data</h2>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));">
      <div class="card"><h3 style="color:#c4a35a;">Units Sold</h3><p>${console.marketData.unitsSold}</p></div>
      <div class="card"><h3 style="color:#c4a35a;">Best Selling Game</h3><p>${console.marketData.bestSelling}</p></div>
      <div class="card"><h3 style="color:#c4a35a;">Lifespan</h3><p>${console.marketData.lifespan}</p></div>
    </div>` : ''}
    ${console.technicalSpecs ? `
    <h2 style="font-size:1.3rem;color:#c4a35a;margin:30px 0 16px;">⚙️ Technical Specs</h2>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));">
      <div class="card"><h3 style="color:#c4a35a;">CPU</h3><p>${console.technicalSpecs.cpu}</p></div>
      <div class="card"><h3 style="color:#c4a35a;">Memory</h3><p>${console.technicalSpecs.memory}</p></div>
      <div class="card"><h3 style="color:#c4a35a;">Graphics</h3><p>${console.technicalSpecs.graphics}</p></div>
      <div class="card"><h3 style="color:#c4a35a;">Sound</h3><p>${console.technicalSpecs.sound}</p></div>
      <div class="card"><h3 style="color:#c4a35a;">Media</h3><p>${console.technicalSpecs.media}</p></div>
    </div>` : ''}
    ${console.usageCharacteristics ? `
    <h2 style="font-size:1.3rem;color:#c4a35a;margin:30px 0 16px;">🎮 Usage Characteristics</h2>
    <div class="card">
      <h3 style="color:#c4a35a;">Local Terms</h3>
      <div class="chip-row">${console.usageCharacteristics.localTerms.map(t => `<span class="chip" style="background:#2a2f22;border:1px solid #c4a35a;color:#f0ebe0;padding:4px 12px;border-radius:20px;font-size:.85rem;">${t}</span>`).join(' ')}</div>
      <h3 style="color:#c4a35a;margin-top:16px;">Unique Practices</h3>
      <ul style="padding-left:20px;line-height:1.8;">${console.usageCharacteristics.uniquePractices.map(p => `<li>${p}</li>`).join('')}</ul>
    </div>` : ''}
    <div class="chip-row">
      <a class="chip" href="/gba-emulator-web/">Open ${console.short} Emulator</a>
      <a class="chip" href="/genre/">Browse by Genre</a>
      <a class="chip" href="/series/">Browse by Series</a>
    </div>
    <h2 style="font-size:1.3rem;color:#c4a35a;margin:30px 0 16px;">${console.name} Games</h2>
    <div class="grid">${gamesHTML}</div>
  `)}
  ${footerHTML()}`;
}

function genreHubHTML() {
  const cards = GENRES.map(g => `<div class="card"><h3><a href="/genre/${g.slug}/">${g.name}</a></h3><p>${g.desc}</p></div>`).join('\n');
  return `${header()}
  <title>GBA Games by Genre — Play All Genres Online Free</title>
  <meta name="description" content="Browse GBA games by genre. RPG, Platformer, Action, Adventure, Racing, Fighting, Strategy, and Simulation — all playable online free.">
  <link rel="canonical" href="${SITE}/genre/">
  <meta property="og:title" content="GBA Games by Genre — Play Online Free">
  <meta property="og:description" content="Browse GBA games by genre. All playable online free, no download.">
  <meta property="og:url" content="${SITE}/genre/">
  <meta property="og:site_name" content="EggerMath">
  ${baseStyle()}
</head>
<body>
  ${navHTML('genres')}
  ${pageLayout('genres', [{name: 'Home', url: '/'}, {name: 'Genres', url: ''}], `
    <h1>GBA Games by Genre</h1>
    <p class="meta">Browse all Game Boy Advance games by genre and play them free in your browser</p>
    <div class="grid">${cards}</div>
  `)}
  ${footerHTML()}`;
}

function genrePageHTML(genre) {
  const games = GAMES.filter(g => g.genre === genre.name);
  const gamesHTML = games.map(g => `<div class="card"><h3><a href="/games/${g.slug}.html">${g.title}</a></h3><p>${g.desc.split('.')[0]}.</p><div class="sub"><span class="stars">${starsHTML(g.rating)}</span> ${g.rating.toFixed(1)} · ${g.series} · ${g.year}</div></div>`).join('\n');
  return `${header()}
  <title>Play ${genre.name} GBA Games Online Free — No Download, No Install</title>
  <meta name="description" content="${padMeta(genre.desc + ' No download required. Play instantly in your browser.')}">
  <link rel="canonical" href="${SITE}/genre/${genre.slug}/">
  <meta property="og:title" content="Play ${genre.name} GBA Games Online Free">
  <meta property="og:description" content="${genre.desc}">
  <meta property="og:url" content="${SITE}/genre/${genre.slug}/">
  <meta property="og:site_name" content="EggerMath">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Play ${genre.name} GBA Games Online Free",
    "description": "${genre.desc}",
    "url": "${SITE}/genre/${genre.slug}/",
    "isPartOf": {"@type": "WebSite", "name": "EggerMath", "url": "${SITE}"}
  }
  </script>
  ${baseStyle()}
</head>
<body>
  ${navHTML('genres')}
  ${pageLayout('genre-' + genre.slug, [{name: 'Home', url: '/'}, {name: 'Genres', url: '/genre/'}, {name: genre.name, url: ''}], `
    <h1>Play ${genre.name} GBA Games Online Free</h1>
    <p class="meta">${games.length} games</p>
    <div class="grid">${gamesHTML}</div>
  `)}
  ${footerHTML()}`;
}

function seriesHubHTML() {
  const cards = SERIES.map(s => `<div class="card"><h3><a href="/series/${s.slug}/">${s.name}</a></h3><p>${s.desc}</p></div>`).join('\n');
  return `${header()}
  <title>GBA Games by Series — Browse Classic Series Online Free</title>
  <meta name="description" content="Browse GBA games by series and play them free in your browser. Pokemon, Zelda, Mario, Metroid, Kirby, Castlevania and more — no download, no install.">
  <link rel="canonical" href="${SITE}/series/">
  <meta property="og:title" content="GBA Games by Series — Play Online Free">
  <meta property="og:description" content="Browse GBA games by series. All playable online free.">
  <meta property="og:url" content="${SITE}/series/">
  <meta property="og:site_name" content="EggerMath">
  ${baseStyle()}
</head>
<body>
  ${navHTML('series')}
  ${pageLayout('series', [{name: 'Home', url: '/'}, {name: 'Series', url: ''}], `
    <h1>GBA Games by Series</h1>
    <p class="meta">Browse Game Boy Advance games by their franchise series</p>
    <div class="grid">${cards}</div>
  `)}
  ${footerHTML()}`;
}

function seriesPageHTML(series) {
  const games = GAMES.filter(g => g.series === series.name);
  const gamesHTML = games.map(g => `<div class="card"><h3><a href="/games/${g.slug}.html">${g.title}</a></h3><p>${g.desc.split('.')[0]}.</p><div class="sub"><span class="stars">${starsHTML(g.rating)}</span> ${g.rating.toFixed(1)} · ${g.genre} · ${g.year}</div></div>`).join('\n');
  return `${header()}
  <title>Play ${series.name} GBA Games Online Free — No Download, No Install</title>
  <meta name="description" content="${padMeta(series.desc + ' No download required. Play instantly in your browser.')}">
  <link rel="canonical" href="${SITE}/series/${series.slug}/">
  <meta property="og:title" content="Play ${series.name} GBA Games Online Free">
  <meta property="og:description" content="${series.desc}">
  <meta property="og:url" content="${SITE}/series/${series.slug}/">
  <meta property="og:site_name" content="EggerMath">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Play ${series.name} GBA Games Online Free",
    "description": "${series.desc}",
    "url": "${SITE}/series/${series.slug}/",
    "isPartOf": {"@type": "WebSite", "name": "EggerMath", "url": "${SITE}"}
  }
  </script>
  ${baseStyle()}
</head>
<body>
  ${navHTML('series')}
  ${pageLayout('series-' + series.slug, [{name: 'Home', url: '/'}, {name: 'Series', url: '/series/'}, {name: series.name, url: ''}], `
    <h1>Play ${series.name} GBA Games Online Free</h1>
    <p class="meta">${games.length} games</p>
    <div class="grid">${gamesHTML}</div>
  `)}
  ${footerHTML()}`;
}

function tagsHubHTML() {
  const allTags = [...new Set(GAMES.flatMap(g => g.tags))];
  const cards = allTags.map(t => `<a class="chip" style="font-size:0.85rem;padding:8px 16px;" href="/tags/${t.replace(/\s+/g, '-')}/">${t} (${GAMES.filter(g => g.tags.includes(t)).length})</a>`).join(' ');
  return `${header()}
  <title>GBA Game Tags — Browse Games by Tag</title>
  <meta name="description" content="Browse GBA games by tag and play them free in your browser. Turn-based, exploration, platforming, boss fights, metroidvania, racing, puzzle and more.">
  <link rel="canonical" href="${SITE}/tags/">
  <meta property="og:title" content="GBA Game Tags — Browse Games by Tag">
  <meta property="og:url" content="${SITE}/tags/">
  <meta property="og:site_name" content="EggerMath">
  ${baseStyle()}
</head>
<body>
  ${navHTML('tags')}
  ${pageLayout('tags', [{name: 'Home', url: '/'}, {name: 'Tags', url: ''}], `
    <h1>GBA Game Tags</h1>
    <p class="meta">Browse all Game Boy Advance games by gameplay tag</p>
    <div class="chip-row">${cards}</div>
  `)}
  ${footerHTML()}`;
}

function tagPageHTML(tag) {
  const slug = tag.replace(/\s+/g, '-');
  const games = GAMES.filter(g => g.tags.includes(tag));
  const gamesHTML = games.map(g => `<div class="card"><h3><a href="/games/${g.slug}.html">${g.title}</a></h3><p>${g.desc.split('.')[0]}.</p><div class="sub"><span class="stars">${starsHTML(g.rating)}</span> ${g.rating.toFixed(1)} · ${g.genre} · ${g.year}</div></div>`).join('\n');
  const displayName = tag.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return `${header()}
  <title>Play ${displayName} GBA Games Online Free</title>
  <meta name="description" content="${padMeta('Play ' + tag + ' GBA games online free. ' + games.slice(0, 3).map(g => g.title).join(', ') + (games.length > 3 ? ' and more' : '') + '. No download, no install, play in your browser.')}">
  <link rel="canonical" href="${SITE}/tags/${slug}/">
  <meta property="og:title" content="Play ${displayName} GBA Games Online Free">
  <meta property="og:url" content="${SITE}/tags/${slug}/">
  <meta property="og:site_name" content="EggerMath">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Play ${tag} GBA Games Online Free",
    "url": "${SITE}/tags/${slug}/",
    "isPartOf": {"@type": "WebSite", "name": "EggerMath", "url": "${SITE}"}
  }
  </script>
  ${baseStyle()}
</head>
<body>
  ${navHTML('tags')}
  ${pageLayout('tag-' + tag, [{name: 'Home', url: '/'}, {name: 'Tags', url: '/tags/'}, {name: tag, url: ''}], `
    <h1>Play ${displayName} GBA Games Online Free</h1>
    <p class="meta">${games.length} games tagged "${tag}"</p>
    <div class="grid">${gamesHTML}</div>
  `)}
  ${footerHTML()}`;
}

function developersHubHTML() {
  const cards = DEVELOPERS.map(d => `<div class="card"><h3><a href="/developers/${d.slug}/">${d.name}</a></h3><p>${d.desc}</p></div>`).join('\n');
  return `${header()}
  <title>GBA Game Developers — Browse by Developer</title>
  <meta name="description" content="Browse GBA games by developer and play them free in your browser. Game Freak, Nintendo, Capcom, Konami, HAL Laboratory, AlphaDream and more.">
  <link rel="canonical" href="${SITE}/developers/">
  <meta property="og:title" content="GBA Game Developers — Browse by Developer">
  <meta property="og:url" content="${SITE}/developers/">
  <meta property="og:site_name" content="EggerMath">
  ${baseStyle()}
</head>
<body>
  ${navHTML('genres')}
  ${pageLayout('genres', [{name: 'Home', url: '/'}, {name: 'Developers', url: ''}], `
    <h1>GBA Game Developers</h1>
    <p class="meta">Browse all Game Boy Advance games by their developer</p>
    <div class="grid">${cards}</div>
  `)}
  ${footerHTML()}`;
}

function developerPageHTML(dev) {
  const games = GAMES.filter(g => g.developer === dev.name);
  const gamesHTML = games.map(g => `<div class="card"><h3><a href="/games/${g.slug}.html">${g.title}</a></h3><p>${g.desc.split('.')[0]}.</p><div class="sub"><span class="stars">${starsHTML(g.rating)}</span> ${g.rating.toFixed(1)} · ${g.genre} · ${g.year}</div></div>`).join('\n');

  const genreCounts = {};
  games.forEach(g => { genreCounts[g.genre] = (genreCounts[g.genre] || 0) + 1; });
  const genreChips = Object.entries(genreCounts).map(([genre, count]) => `<span class="chip">${genre} (${count})</span>`).join('');

  const platforms = [...new Set(games.map(g => g.series))].sort();
  const platformChips = platforms.map(p => `<span class="chip">${p}</span>`).join('');

  const years = games.map(g => parseInt(g.year)).filter(Boolean);
  const yearRange = years.length > 0
    ? (Math.min(...years) === Math.max(...years) ? `${Math.min(...years)}` : `${Math.min(...years)}–${Math.max(...years)}`)
    : '';

  const bioHTML = dev.bio ? dev.bio.split('\n\n').map(p => `<p style="color:rgba(240,235,224,0.75);line-height:1.8;font-size:0.95rem;margin-bottom:14px;">${p}</p>`).join('\n') : `<p style="color:rgba(240,235,224,0.75);line-height:1.8;font-size:0.95rem;">${dev.desc}</p>`;

  return `${header()}
  <title>${dev.name} GBA Games — Play Online Free</title>
  <meta name="description" content="${padMeta(dev.desc)}">
  <link rel="canonical" href="${SITE}/developers/${dev.slug}/">
  <meta property="og:title" content="${dev.name} GBA Games — Play Online Free">
  <meta property="og:url" content="${SITE}/developers/${dev.slug}/">
  <meta property="og:site_name" content="EggerMath">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "${dev.name} GBA Games",
    "description": "${dev.desc}",
    "url": "${SITE}/developers/${dev.slug}/",
    "isPartOf": {"@type": "WebSite", "name": "EggerMath", "url": "${SITE}"}
  }
  </script>
  ${baseStyle()}
</head>
<body>
  ${navHTML('genres')}
  ${pageLayout('genres', [{name: 'Home', url: '/'}, {name: 'Developers', url: '/developers/'}, {name: dev.name, url: ''}], `
    <h1>${dev.name} GBA Games</h1>
    <p class="meta">${games.length} games · ${yearRange ? `Active ${yearRange}` : ''}</p>

    <div style="margin:20px 0;padding:16px;background:rgba(18,18,31,0.8);border-radius:12px;border:1px solid rgba(255,255,255,0.04);">
      ${bioHTML}
    </div>

    <div style="margin:20px 0;">
      <h2 style="font-size:1.1rem;color:#c4a35a;margin-bottom:10px;">Games by Genre</h2>
      <div class="chip-row">${genreChips}</div>
    </div>

    <div style="margin:20px 0;">
      <h2 style="font-size:1.1rem;color:#c4a35a;margin-bottom:10px;">Series</h2>
      <div class="chip-row">${platformChips}</div>
    </div>

    <h2 style="font-size:1.3rem;color:#c4a35a;margin:30px 0 16px;">${dev.name} Games</h2>
    <div class="grid">${gamesHTML}</div>
  `)}
  ${footerHTML()}`;
}

function yearlyHubHTML() {
  const years = [...new Set(GAMES.map(g => g.year))].sort().reverse();
  const cards = years.map(y => `<div class="card"><h3><a href="/yearly-games/${y}/">GBA Games from ${y}</a></h3><p>${GAMES.filter(g => g.year === y).length} games released in ${y}.</p></div>`).join('\n');
  return `${header()}
  <title>GBA Games by Year — Browse Retro Games by Release Year</title>
  <meta name="description" content="Browse GBA games by release year and play them free in your browser. Classic retro games from 2001, 2002, 2003, 2004 and more, no download needed.">
  <link rel="canonical" href="${SITE}/yearly-games/">
  <meta property="og:title" content="GBA Games by Year — Browse by Release Year">
  <meta property="og:url" content="${SITE}/yearly-games/">
  <meta property="og:site_name" content="EggerMath">
  ${baseStyle()}
</head>
<body>
  ${navHTML('genres')}
  ${pageLayout('genres', [{name: 'Home', url: '/'}, {name: 'Yearly Games', url: ''}], `
    <h1>GBA Games by Year</h1>
    <p class="meta">Browse classic retro games by their release year</p>
    <div class="grid">${cards}</div>
  `)}
  ${footerHTML()}`;
}

function yearlyPageHTML(year) {
  const games = GAMES.filter(g => g.year === year);
  const gamesHTML = games.map(g => `<div class="card"><h3><a href="/games/${g.slug}.html">${g.title}</a></h3><p>${g.desc.split('.')[0]}.</p><div class="sub"><span class="stars">${starsHTML(g.rating)}</span> ${g.rating.toFixed(1)} · ${g.genre} · ${g.series}</div></div>`).join('\n');
  return `${header()}
  <title>GBA Games from ${year} — Play Retro Games from ${year} Online Free</title>
  <meta name="description" content="${padMeta('Play GBA games from ' + year + ' online free. ' + games.slice(0, 3).map(g => g.title).join(', ') + (games.length > 3 ? ' and more' : '') + '. No download, no install, play in your browser.')}">
  <link rel="canonical" href="${SITE}/yearly-games/${year}/">
  <meta property="og:title" content="GBA Games from ${year} — Play Online Free">
  <meta property="og:url" content="${SITE}/yearly-games/${year}/">
  <meta property="og:site_name" content="EggerMath">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "GBA Games from ${year}",
    "url": "${SITE}/yearly-games/${year}/",
    "isPartOf": {"@type": "WebSite", "name": "EggerMath", "url": "${SITE}"}
  }
  </script>
  ${baseStyle()}
</head>
<body>
  ${navHTML('genres')}
  ${pageLayout('genres', [{name: 'Home', url: '/'}, {name: 'Yearly Games', url: '/yearly-games/'}, {name: year, url: ''}], `
    <h1>GBA Games from ${year}</h1>
    <p class="meta">${games.length} games released in ${year}</p>
    <div class="grid">${gamesHTML}</div>
  `)}
  ${footerHTML()}`;
}

function platformListPageHTML(console, allGames, pageNum, filterGenre, filterYear, filterOfficial, sortBy) {
  const GAMES_PER_PAGE = 18;
  const dirName = console.short.toLowerCase() + '-games';
  const totalPages = Math.ceil(allGames.length / GAMES_PER_PAGE);
  const pageGames = allGames.slice((pageNum - 1) * GAMES_PER_PAGE, pageNum * GAMES_PER_PAGE);

  const allGenres = [...new Set(allGames.map(g => g.genre))].sort();
  const allYears = [...new Set(allGames.map(g => g.year))].sort().reverse();

  const filterBarHTML = `
    <div style="display:flex;flex-wrap:wrap;gap:12px;margin:24px 0 20px;padding:16px;background:rgba(18,18,31,0.8);border-radius:12px;border:1px solid rgba(255,255,255,0.04);align-items:flex-end;">
      <div>
        <label style="font-size:0.75rem;color:rgba(240,235,224,0.4);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px;">Genre</label>
        <select id="filter-genre" onchange="applyFilters()" style="background:#1e1e2e;color:#f0ebe0;border:1px solid rgba(255,255,255,0.1);padding:8px 12px;border-radius:8px;font-size:0.85rem;min-width:120px;">
          <option value="">All Genres</option>
          ${allGenres.map(g => `<option value="${g}"${filterGenre === g ? ' selected' : ''}>${g}</option>`).join('')}
        </select>
      </div>
      <div>
        <label style="font-size:0.75rem;color:rgba(240,235,224,0.4);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px;">Year</label>
        <select id="filter-year" onchange="applyFilters()" style="background:#1e1e2e;color:#f0ebe0;border:1px solid rgba(255,255,255,0.1);padding:8px 12px;border-radius:8px;font-size:0.85rem;min-width:100px;">
          <option value="">All Years</option>
          ${allYears.map(y => `<option value="${y}"${filterYear === y ? ' selected' : ''}>${y}</option>`).join('')}
        </select>
      </div>
      <div>
        <label style="font-size:0.75rem;color:rgba(240,235,224,0.4);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px;">Type</label>
        <select id="filter-official" onchange="applyFilters()" style="background:#1e1e2e;color:#f0ebe0;border:1px solid rgba(255,255,255,0.1);padding:8px 12px;border-radius:8px;font-size:0.85rem;min-width:130px;">
          <option value=""${!filterOfficial ? ' selected' : ''}>All</option>
          <option value="official"${filterOfficial === 'official' ? ' selected' : ''}>Official Only</option>
          <option value="hack"${filterOfficial === 'hack' ? ' selected' : ''}>ROM Hacks Only</option>
        </select>
      </div>
      <div>
        <label style="font-size:0.75rem;color:rgba(240,235,224,0.4);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px;">Sort</label>
        <select id="filter-sort" onchange="applyFilters()" style="background:#1e1e2e;color:#f0ebe0;border:1px solid rgba(255,255,255,0.1);padding:8px 12px;border-radius:8px;font-size:0.85rem;min-width:140px;">
          <option value=""${!sortBy || sortBy === 'original' ? ' selected' : ''}>Original</option>
          <option value="title"${sortBy === 'title' ? ' selected' : ''}>Title A-Z</option>
          <option value="newest"${sortBy === 'newest' ? ' selected' : ''}>Year (Newest)</option>
          <option value="oldest"${sortBy === 'oldest' ? ' selected' : ''}>Year (Oldest)</option>
        </select>
      </div>
      <button onclick="applyFilters()" style="background:#c4a35a;color:#161a13;border:none;padding:8px 20px;border-radius:8px;font-weight:700;font-size:0.85rem;cursor:pointer;">Apply</button>
    </div>
    <script>
    function applyFilters() {
      var g = document.getElementById('filter-genre').value;
      var y = document.getElementById('filter-year').value;
      var o = document.getElementById('filter-official').value;
      var s = document.getElementById('filter-sort').value;
      var p = new URLSearchParams();
      if (g) p.set('genre', g);
      if (y) p.set('year', y);
      if (o) p.set('official', o);
      if (s && s !== 'original') p.set('sort', s);
      var qs = p.toString();
      window.location.href = '/' + dirName + '/index.html' + (qs ? '?' + qs : '');
    }
    </script>`;

  const placeholderColors = { 'GBA': '#4a7c59', 'GBC': '#5a6e8a' };
  const bgColor = placeholderColors[console.short] || '#4a7c59';

  const gamesCardsHTML = pageGames.map(g => {
    const shortDesc = g.desc.length > 100 ? g.desc.substring(0, 97) + '...' : g.desc;
    const seriesHTML = g.series ? `<div style="font-size:0.75rem;color:rgba(240,235,224,0.35);margin-top:2px;">${g.series}</div>` : '';
    return `
      <div class="card" style="padding:12px;">
        <a href="/games/${g.slug}.html" style="text-decoration:none;color:inherit;">
          <img src="/games/covers/${g.slug}.svg" alt="${g.title}" loading="lazy" style="width:100%;border-radius:8px;margin-bottom:10px;">
          <h3 style="font-size:0.95rem;color:#c4a35a;margin-bottom:4px;">${g.title}</h3>
        </a>
        <div style="font-size:0.78rem;color:rgba(240,235,224,0.4);">${g.year} · ${g.genre}</div>
        ${seriesHTML}
        <p style="font-size:0.78rem;color:rgba(240,235,224,0.45);line-height:1.4;margin-top:6px;">${shortDesc}</p>
      </div>`;
  }).join('');

  let paginationHTML = '';
  if (totalPages > 1) {
    paginationHTML = '<div style="display:flex;flex-wrap:wrap;gap:8px;margin:30px 0;justify-content:center;">';
    for (let i = 1; i <= totalPages; i++) {
      const href = i === 1 ? `/${dirName}/index.html` : `/${dirName}/page-${i}.html`;
      if (i === pageNum) {
        paginationHTML += `<span style="background:#c4a35a;color:#161a13;padding:8px 14px;border-radius:8px;font-weight:700;font-size:0.85rem;">${i}</span>`;
      } else {
        paginationHTML += `<a href="${href}" style="background:rgba(18,18,31,0.8);color:#c4a35a;padding:8px 14px;border-radius:8px;text-decoration:none;font-size:0.85rem;border:1px solid rgba(255,255,255,0.06);">${i}</a>`;
      }
    }
    paginationHTML += '</div>';
  }

  const itemListElements = allGames.map((g, i) =>
    `{"@type":"ListItem","position":${i + 1},"url":"${SITE}/games/${g.slug}.html","name":"${g.title}"}`
  ).join(',\n          ');

  const navActive = console.slug === 'gameboy-advance' ? 'gba' : console.slug;

  return `${header()}
  <title>${console.name} Games Collection — Play ${console.name} Games Online Free</title>
  <meta name="description" content="${padMeta(`${console.name} games collection. Browse, filter, and play ${allGames.length}+ ${console.name} games online free in your browser.`)}">
  <link rel="canonical" href="${SITE}/${dirName}/">
  <meta property="og:title" content="${console.name} Games Collection">
  <meta property="og:description" content="${console.name} games collection. Browse, filter, and play ${allGames.length}+ ${console.name} games online free in your browser.">
  <meta property="og:url" content="${SITE}/${dirName}/">
  <meta property="og:site_name" content="EggerMath">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "name": "${console.name} Games Collection",
        "description": "${console.name} games collection. Browse, filter, and play ${allGames.length}+ ${console.name} games online free in your browser.",
        "url": "${SITE}/${dirName}/",
        "isPartOf": {"@type": "WebSite", "name": "EggerMath", "url": "${SITE}"},
        "about": {
          "@type": "VideoGameEmulator",
          "name": "${console.name} Emulator",
          "applicationCategory": "GameApplication",
          "operatingSystem": "Web Browser",
          "url": "${SITE}/gba-emulator-web/"
        }
      },
      {
        "@type": "ItemList",
        "name": "${console.name} Games Collection",
        "numberOfItems": ${allGames.length},
        "itemListOrder": "https://schema.org/ItemListOrderUnordered",
        "itemListElement": [
          ${itemListElements}
        ]
      }
    ]
  }
  </script>
  ${baseStyle()}
</head>
<body>
  ${navHTML(navActive)}
  ${pageLayout(navActive, [{name: 'Home', url: '/'}, {name: console.name, url: `/${console.slug}/`}, {name: `${console.name} Games Collection`, url: ''}], `
    <h1>${console.name} Games Collection</h1>
    <p class="meta">${allGames.length} games · ${console.year} console · No download, no install</p>

    ${console.intro ? `<div class="history"><p style="margin-bottom:12px;">${console.intro}</p></div>` : ''}

    ${filterBarHTML}

    ${pageGames.length
      ? `<div class="grid">${gamesCardsHTML}</div>`
      : `<div class="card" style="grid-column:1/-1;text-align:center;padding:40px 20px;"><h3>No games match your filters</h3><p style="color:rgba(240,235,224,0.5);margin-top:8px;">Try adjusting your filter selections.</p></div>`
    }

    ${paginationHTML}

    <div style="margin:24px 0;">
      <div class="chip-row">
        <a class="chip" href="/gba-emulator-web/">Open ${console.short} Emulator</a>
        <a class="chip" href="/genre/">Browse by Genre</a>
        <a class="chip" href="/series/">Browse by Series</a>
      </div>
    </div>
  `)}
  ${footerHTML()}`;
}

// ============ GENERATE ============
const gamesDir = path.join(__dirname, 'games');
if (!fs.existsSync(gamesDir)) fs.mkdirSync(gamesDir, { recursive: true });
GAMES.forEach(g => {
  fs.writeFileSync(path.join(gamesDir, g.slug + '.html'), gamePageHTML(g));
});
console.log('Games: ' + GAMES.length);

function mkdir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

CONSOLES.forEach(c => {
  mkdir(path.join(__dirname, c.slug));
  fs.writeFileSync(path.join(__dirname, c.slug, 'index.html'), consolePageHTML(c));
});
console.log('Consoles: ' + CONSOLES.length);

CONSOLES.forEach(c => {
  const consoleGames = GAMES_WITH_CONSOLE.filter(g => g.console === c.short);
  const GAMES_PER_PAGE = 18;
  const totalPages = Math.ceil(consoleGames.length / GAMES_PER_PAGE);
  const dirName = c.short.toLowerCase() + '-games';

  mkdir(path.join(__dirname, dirName));
  fs.writeFileSync(
    path.join(__dirname, dirName, 'index.html'),
    platformListPageHTML(c, consoleGames, 1, '', '', '', 'original')
  );

  for (let p = 2; p <= totalPages; p++) {
    fs.writeFileSync(
      path.join(__dirname, dirName, 'page-' + p + '.html'),
      platformListPageHTML(c, consoleGames, p, '', '', '', 'original')
    );
  }
});
console.log('Platform list pages generated');

mkdir(path.join(__dirname, 'genre'));
fs.writeFileSync(path.join(__dirname, 'genre', 'index.html'), genreHubHTML());
GENRES.forEach(g => {
  mkdir(path.join(__dirname, 'genre', g.slug));
  fs.writeFileSync(path.join(__dirname, 'genre', g.slug, 'index.html'), genrePageHTML(g));
});
console.log('Genres: ' + GENRES.length);

mkdir(path.join(__dirname, 'series'));
fs.writeFileSync(path.join(__dirname, 'series', 'index.html'), seriesHubHTML());
SERIES.forEach(s => {
  mkdir(path.join(__dirname, 'series', s.slug));
  fs.writeFileSync(path.join(__dirname, 'series', s.slug, 'index.html'), seriesPageHTML(s));
});
console.log('Series: ' + SERIES.length);

mkdir(path.join(__dirname, 'tags'));
fs.writeFileSync(path.join(__dirname, 'tags', 'index.html'), tagsHubHTML());
const allTags = [...new Set(GAMES.flatMap(g => g.tags))];
allTags.forEach(t => {
  mkdir(path.join(__dirname, 'tags', t.replace(/\s+/g, '-')));
  fs.writeFileSync(path.join(__dirname, 'tags', t.replace(/\s+/g, '-'), 'index.html'), tagPageHTML(t));
});
console.log('Tags: ' + allTags.length);

mkdir(path.join(__dirname, 'developers'));
fs.writeFileSync(path.join(__dirname, 'developers', 'index.html'), developersHubHTML());
DEVELOPERS.forEach(d => {
  mkdir(path.join(__dirname, 'developers', d.slug));
  fs.writeFileSync(path.join(__dirname, 'developers', d.slug, 'index.html'), developerPageHTML(d));
});
console.log('Developers: ' + DEVELOPERS.length);

mkdir(path.join(__dirname, 'yearly-games'));
fs.writeFileSync(path.join(__dirname, 'yearly-games', 'index.html'), yearlyHubHTML());
const years = [...new Set(GAMES.map(g => g.year))];
years.forEach(y => {
  mkdir(path.join(__dirname, 'yearly-games', y));
  fs.writeFileSync(path.join(__dirname, 'yearly-games', y, 'index.html'), yearlyPageHTML(y));
});
console.log('Years: ' + years.length);

// ============ SEARCH INDEX ============
fs.writeFileSync(path.join(__dirname, 'search-index.json'), searchIndexJSON());
console.log('Search index generated');

// ============ SITEMAP ============
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}/</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${SITE}/gba-emulator-web/</loc><lastmod>2026-08-13</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>\n`;

CONSOLES.forEach(c => {
  sitemap += `  <url><loc>${SITE}/${c.slug}/</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>\n`;
  const consoleGames = GAMES_WITH_CONSOLE.filter(g => g.console === c.short);
  const totalPages = Math.ceil(consoleGames.length / 18);
  sitemap += `  <url><loc>${SITE}/${c.short.toLowerCase()}-games/</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
  for (let p = 2; p <= totalPages; p++) {
    sitemap += `  <url><loc>${SITE}/${c.short.toLowerCase()}-games/page-${p}.html</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
  }
});
GAMES.forEach(g => {
  sitemap += `  <url><loc>${SITE}/games/${g.slug}.html</loc><lastmod>2026-08-13</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n`;
});
sitemap += `  <url><loc>${SITE}/genre/</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
GENRES.forEach(g => {
  sitemap += `  <url><loc>${SITE}/genre/${g.slug}/</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
});
sitemap += `  <url><loc>${SITE}/series/</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
SERIES.forEach(s => {
  sitemap += `  <url><loc>${SITE}/series/${s.slug}/</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
});
sitemap += `  <url><loc>${SITE}/tags/</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
allTags.forEach(t => {
  sitemap += `  <url><loc>${SITE}/tags/${t.replace(/\s+/g, '-')}/</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>\n`;
});
sitemap += `  <url><loc>${SITE}/developers/</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
DEVELOPERS.forEach(d => {
  sitemap += `  <url><loc>${SITE}/developers/${d.slug}/</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>\n`;
});
sitemap += `  <url><loc>${SITE}/yearly-games/</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
years.forEach(y => {
  sitemap += `  <url><loc>${SITE}/yearly-games/${y}/</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>\n`;
});
['about', 'contact', 'privacy', 'terms', 'takedown'].forEach(p => {
  sitemap += `  <url><loc>${SITE}/${p}.html</loc><lastmod>2026-08-13</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>\n`;
});
sitemap += `  <url><loc>${SITE}/blog/</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;

const blogDir = path.join(__dirname, 'blog');
if (fs.existsSync(blogDir)) {
  fs.readdirSync(blogDir).filter(f => f.endsWith('.html') && f !== 'index.html').forEach(f => {
    sitemap += `  <url><loc>${SITE}/blog/${f}</loc><lastmod>2026-08-13</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
  });
}
sitemap += `  <url><loc>${SITE}/llms.txt</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>0.3</priority></url>\n`;
sitemap += `  <url><loc>${SITE}/llms-full.txt</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>0.3</priority></url>\n`;
sitemap += `  <url><loc>${SITE}/robots.txt</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>0.2</priority></url>\n`;
sitemap += `  <url><loc>${SITE}/search-index.json</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>0.2</priority></url>\n`;
sitemap += `</urlset>`;
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap);
console.log('Sitemap updated with all pages');
