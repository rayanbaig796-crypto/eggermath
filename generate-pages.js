const fs = require('fs');
const path = require('path');

const SITE = 'https://www.eggermath.com';

const GAMES = [
  { title: 'Pokemon Emerald', slug: 'pokemon-emerald', genre: 'RPG', series: 'Pokemon', year: '2004', developer: 'Game Freak', rating: 9.2, ratingCount: 187, tags: ['turn-based', 'exploration', 'collection', 'strategy', 'cartoonish', 'vibrant colors'], desc: 'Play Pokemon Emerald online in your browser. Explore the Hoenn region, catch 200+ Pokemon, challenge gym leaders, and face Team Magma and Team Aqua. Features the Battle Frontier post-game with 7 challenge facilities. One of the best GBA RPGs ever made.', controls: '↑↓←→ Move | A Confirm | B Cancel | Start Menu | Select Pokédex', mega: 'Pokemon - Emerald Version (USA, Europe).zip' },
  { title: 'Pokemon FireRed', slug: 'pokemon-firered', genre: 'RPG', series: 'Pokemon', year: '2004', developer: 'Game Freak', rating: 9.0, ratingCount: 152, tags: ['turn-based', 'exploration', 'collection', 'retro 3D', 'cartoonish'], desc: 'Play Pokemon FireRed online. An enhanced remake of Pokemon Red for GBA with updated graphics, abilities, and the Sevii Islands post-game. Explore Kanto, collect all 151 original Pokemon, and become Pokemon Champion.', controls: '↑↓←→ Move | A Confirm | B Cancel | Start Menu | Select Pokédex', mega: 'Pokemon_ FireRed Version.zip' },
  { title: 'Pokemon LeafGreen', slug: 'pokemon-leafgreen', genre: 'RPG', series: 'Pokemon', year: '2004', developer: 'Game Freak', rating: 8.8, ratingCount: 98, tags: ['turn-based', 'exploration', 'collection', 'cartoonish'], desc: 'Play Pokemon LeafGreen online in your browser. The counterpart to FireRed featuring Pokemon Green exclusives. Explore Kanto with updated graphics, new mechanics like abilities and natures, and the Sevii Islands.', controls: '↑↓←→ Move | A Confirm | B Cancel | Start Menu | Select Pokédex', mega: 'Pokemon - Leaf Green Version (U) (V1.1).zip' },
  { title: 'Pokemon Ruby', slug: 'pokemon-ruby', genre: 'RPG', series: 'Pokemon', year: '2002', developer: 'Game Freak', rating: 8.7, ratingCount: 121, tags: ['turn-based', 'exploration', 'collection', 'vibrant colors'], desc: 'Play Pokemon Ruby online. Journey through the Hoenn region, catch 135 new Pokemon, and stop Team Magma from expanding the land. Features double battles, Pokemon Contests, and the Battle Tower.', controls: '↑↓←→ Move | A Confirm | B Cancel | Start Menu | Select Pokédex', mega: 'Pokemon_ Ruby Version.zip' },
  { title: 'Pokemon Sapphire', slug: 'pokemon-sapphire', genre: 'RPG', series: 'Pokemon', year: '2002', developer: 'Game Freak', rating: 8.7, ratingCount: 87, tags: ['turn-based', 'exploration', 'collection', 'vibrant colors'], desc: 'Play Pokemon Sapphire online in your browser. The counterpart to Ruby featuring Team Aqua and exclusive Pokemon. Explore Hoenn, master double battles, and challenge the Battle Tower.', controls: '↑↓←→ Move | A Confirm | B Cancel | Start Menu | Select Pokédex', mega: 'Pokemon_ Sapphire Version.zip' },
  { title: 'Pokemon Ultra Violet', slug: 'pokemon-ultra-violet', genre: 'RPG', series: 'Pokemon', year: '2023', developer: 'LSA', rating: 8.5, ratingCount: 64, tags: ['rom hack', 'turn-based', 'exploration', 'collection', 'all pokemon'], desc: 'Play Pokemon Ultra Violet online. A FireRed ROM hack featuring all Pokemon from Gen 1-3 in one game. Catch every Pokemon without trading, explore expanded Sevii Islands, and enjoy quality-of-life improvements.', controls: '↑↓←→ Move | A Confirm | B Cancel | Start Menu | Select Pokédex', mega: 'Pokemon Ultra Violet (1.22) LSA (Fire Red Hack).zip' },
  { title: 'Pokemon Jupiter', slug: 'pokemon-jupiter', genre: 'RPG', series: 'Pokemon', year: '2023', developer: 'ROM Hack', rating: 8.3, ratingCount: 41, tags: ['rom hack', 'fakemon', 'turn-based', 'exploration', 'dark story'], desc: 'Play Pokemon Jupiter online. A Ruby ROM hack set in the Oxalis region with 200+ new fakemon, custom story, and updated mechanics. Features a darker narrative and challenging gym battles.', controls: '↑↓←→ Move | A Confirm | B Cancel | Start Menu | Select Pokédex', mega: 'Pokemon Jupiter - 6.04 (Ruby Hack).zip' },
  { title: 'Zelda: Minish Cap', slug: 'zelda-minish-cap', genre: 'Adventure', series: 'Zelda', year: '2004', developer: 'Capcom', rating: 9.1, ratingCount: 134, tags: ['action-adventure', 'puzzle-solving', 'exploration', 'boss fights', 'cartoonish'], desc: 'Play Zelda Minish Cap online in your browser. Help Link shrink to Minish size and explore Hyrule from a new perspective. Features the Gust Jar, Mole Mitts, and the ability to fuse Kinstones with NPCs.', controls: '↑↓←→ Move | A Sword | B Item | L/R Assign Items | Start Pause', mega: 'Legend of Zelda, The_ The Minish Cap.zip' },
  { title: 'Zelda: A Link to the Past', slug: 'zelda-link-to-the-past', genre: 'Adventure', series: 'Zelda', year: '2002', developer: 'Nintendo', rating: 9.0, ratingCount: 112, tags: ['action-adventure', 'puzzle-solving', 'exploration', 'boss fights', 'dungeons'], desc: 'Play Zelda A Link to the Past online. The GBA port of the SNES classic featuring both the original Light/Dark World adventure and the new Four Swords multiplayer mode.', controls: '↑↓←→ Move | A Attack | B Item | Start Map | Select Item Switch', mega: 'Legend of Zelda, The - A Link to the Past & Four Swords (USA).zip' },
  { title: 'Mario Kart Super Circuit', slug: 'mario-kart-super-circuit', genre: 'Racing', series: 'Mario', year: '2001', developer: 'Nintendo', rating: 8.6, ratingCount: 95, tags: ['racing', 'multiplayer', 'vehicles', 'casual play', 'vibrant colors'], desc: 'Play Mario Kart Super Circuit online in your browser. The first portable Mario Kart featuring 20 tracks from Super Mario Kart (SNES) plus 20 new courses. Drift, use items, and race.', controls: '↑↓←→ Steer | A Accelerate | B Item | L Drift | R Item Use', mega: 'Mario Kart_ Super Circuit.zip' },
  { title: 'Super Mario World', slug: 'super-mario-world', genre: 'Platformer', series: 'Mario', year: '2002', developer: 'Nintendo', rating: 9.0, ratingCount: 143, tags: ['platforming precision', 'side-scrolling', 'boss fights', 'secret exits', 'cartoonish'], desc: 'Play Super Mario World online. The GBA port of the SNES classic featuring Yoshi, secret exits, and 96 levels. Explore Dinosaur Land and rescue Princess Peach from Bowser.', controls: '↑↓←→ Move | A Jump | B Run | L/Y Spin Jump', mega: 'Super Mario Advance 2_ Super Mario World.zip' },
  { title: 'Mario & Luigi: Superstar Saga', slug: 'mario-luigi-superstar-saga', genre: 'RPG', series: 'Mario', year: '2003', developer: 'AlphaDream', rating: 8.9, ratingCount: 78, tags: ['turn-based', 'action RPG', 'humor', 'combo attacks', 'cartoonish'], desc: 'Play Mario & Luigi Superstar Saga online. An action RPG where Mario and Luigi travel to the Beanbean Kingdom. Features timing-based combat, Bros. Attacks, and humorous dialogue.', controls: '↑↓←→ Move | A Action | B Jump | Start Menu | Select Bros. Move', mega: 'Mario & Luigi_ Superstar Saga.zip' },
  { title: 'Classic NES: Super Mario Bros', slug: 'classic-nes-super-mario-bros', genre: 'Platformer', series: 'Mario', year: '2004', developer: 'Nintendo', rating: 8.2, ratingCount: 56, tags: ['platforming precision', 'side-scrolling', 'classic', '8-bit', 'cartoonish'], desc: 'Play Classic NES Super Mario Bros online. The original 1985 platformer ported to GBA. Run, jump, and stomp through 32 levels across 8 worlds.', controls: '↑↓←→ Move | A Jump | B Run', mega: 'Classic NES Series_ Super Mario Bros..zip' },
  { title: 'Metroid Fusion', slug: 'metroid-fusion', genre: 'Action', series: 'Metroid', year: '2002', developer: 'Nintendo', rating: 9.1, ratingCount: 129, tags: ['exploration', 'atmospheric', 'boss fights', 'metroidvania', 'side-scrolling'], desc: 'Play Metroid Fusion online in your browser. Guide Samus Aran through the infected SR388 space station. Fight the X Parasites and confront the SA-X.', controls: '↑↓←→ Move | A Jump | B Shoot | L Aim | R Missile', mega: 'Metroid Fusion.zip' },
  { title: 'Metroid: Zero Mission', slug: 'metroid-zero-mission', genre: 'Action', series: 'Metroid', year: '2004', developer: 'Nintendo', rating: 8.9, ratingCount: 88, tags: ['exploration', 'metroidvania', 'boss fights', 'side-scrolling', 'speedrun'], desc: 'Play Metroid Zero Mission online. A remake of the original NES Metroid with updated graphics and gameplay. Explore Planet Zebes and defeat Mother Brain.', controls: '↑↓←→ Move | A Jump | B Shoot | L Aim | R Missile', mega: 'Metroid_ Zero Mission.zip' },
  { title: 'Kirby: Nightmare in Dream Land', slug: 'kirby-nightmare-in-dream-land', genre: 'Platformer', series: 'Kirby', year: '2002', developer: 'HAL Laboratory', rating: 8.7, ratingCount: 84, tags: ['platforming precision', 'copy abilities', 'boss fights', 'casual play', 'cartoonish'], desc: 'Play Kirby Nightmare in Dream Land online. Help Kirby reclaim the Dream Rod from King Dedede. Copy enemy abilities and float through colorful levels.', controls: '↑↓←→ Move | A Jump | B Inhale/Copy | Start Pause', mega: 'Kirby_ Nightmare in Dream Land.zip' },
  { title: 'Kirby & the Amazing Mirror', slug: 'kirby-amazing-mirror', genre: 'Platformer', series: 'Kirby', year: '2004', developer: 'HAL Laboratory', rating: 8.4, ratingCount: 61, tags: ['metroidvania', 'copy abilities', 'multiplayer', 'exploration', 'cartoonish'], desc: 'Play Kirby and the Amazing Mirror online. Explore the mirror world with 4 Kirbys, copy 12 abilities, and collect 900 stars.', controls: '↑↓←→ Move | A Jump | B Inhale/Copy | Start Map', mega: 'Kirby & the Amazing Mirror.zip' },
  { title: 'Castlevania: Aria of Sorrow', slug: 'castlevania-aria-of-sorrow', genre: 'Action', series: 'Castlevania', year: '2003', developer: 'Konami', rating: 9.0, ratingCount: 103, tags: ['metroidvania', 'exploration', 'boss fights', 'soul collection', 'gothic'], desc: 'Play Castlevania Aria of Sorrow online. Fight through Dracula castle as Soma Cruz, who can absorb monster souls for new abilities.', controls: '↑↓←→ Move | A Jump | B Attack | L Backdash | R Soul Use', mega: 'Castlevania_ Aria of Sorrow.zip' },
  { title: 'Donkey Kong Country', slug: 'donkey-kong-country', genre: 'Platformer', series: 'Donkey Kong', year: '2003', developer: 'Rare', rating: 8.8, ratingCount: 92, tags: ['platforming precision', 'side-scrolling', 'mine carts', 'boss fights', 'vibrant colors'], desc: 'Play Donkey Kong Country online. The GBA port of the SNES classic. Swing on vines, ride mine carts, and defeat King K. Rool.', controls: '↑↓←→ Move | A Jump | B Roll | L/Y Switch Character', mega: 'Donkey Kong Country.zip' },
  { title: 'Fire Emblem: Sacred Stones', slug: 'fire-emblem-sacred-stones', genre: 'Strategy', series: 'Fire Emblem', year: '2004', developer: 'Intelligent Systems', rating: 8.7, ratingCount: 76, tags: ['tactical RPG', 'turn-based', 'permadeath', 'strategy', 'medieval'], desc: 'Play Fire Emblem Sacred Stones online. Lead Eirika or Ephraim through Magvel. Recruit 24 characters and navigate branching story paths.', controls: '↑↓←→ Cursor | A Confirm | B Cancel | Start Menu', mega: 'Fire Emblem_ The Sacred Stones.zip' },
  { title: 'Sonic Advance 3', slug: 'sonic-advance-3', genre: 'Platformer', series: 'Sonic', year: '2004', developer: 'Sonic Team', rating: 8.1, ratingCount: 58, tags: ['platforming precision', 'speed', 'side-scrolling', 'boss fights', 'chaos emeralds'], desc: 'Play Sonic Advance 3 online in your browser. Race through 7 zones as Sonic, Tails, Knuckles, or Amy.', controls: '↑↓←→ Move | A Jump | B Attack | L/Y Switch Character', mega: 'Sonic Advance 3 (USA) (En,Ja,Fr,De,Es,It).zip' },
  { title: 'Dragon Ball: Advanced Adventure', slug: 'dragon-ball-advanced-adventure', genre: 'Fighting', series: 'Dragon Ball', year: '2004', developer: 'Bandai', rating: 8.2, ratingCount: 67, tags: ['fighting', 'beat em up', 'boss fights', 'anime', 'martial arts'], desc: 'Play Dragon Ball Advanced Adventure online. Relive the original Dragon Ball saga as young Goku. Fight through 100+ missions.', controls: '↑↓←→ Move | A Attack | B Jump | L Ki | R Special', mega: 'Dragon Ball - Advanced Adventure (USA).zip' },
  { title: 'Harvest Moon', slug: 'harvest-moon-friends-of-mineral-town', genre: 'Simulation', series: 'Harvest Moon', year: '2003', developer: 'Marvelous', rating: 8.6, ratingCount: 73, tags: ['farming', 'life sim', 'casual play', 'romance', 'relaxing'], desc: 'Play Harvest Moon Friends of Mineral Town online. Build a farm, grow crops, raise animals, and find a partner.', controls: '↑↓←→ Move | A Action | B Cancel | Start Menu | Select Tool', mega: 'Harvest Moon - Friends of Mineral Town (U) [!].zip' },
  { title: 'Crash Bandicoot', slug: 'crash-bandicoot-huge-adventure', genre: 'Platformer', series: 'Crash Bandicoot', year: '2002', developer: 'Vicarious Visions', rating: 8.0, ratingCount: 49, tags: ['platforming precision', 'side-scrolling', 'boss fights', 'cartoonish', 'casual play'], desc: 'Play Crash Bandicoot online. Help Crash shrink down to micro-size and battle the mutant insects of Cortex.', controls: '↑↓←→ Move | A Jump | B Spin | Start Pause', mega: 'Crash Bandicoot_ The Huge Adventure.zip' },
  { title: 'GTA Advance', slug: 'gta-advance', genre: 'Action', series: 'GTA', year: '2004', developer: 'Rockstar Games', rating: 8.0, ratingCount: 71, tags: ['open world', 'crime', 'vehicles', 'missions', 'action'], desc: 'Play GTA Advance online in your browser. Explore Liberty City as Vinnie, completing missions for the mob.', controls: '↑↓←→ Move | A Action | B Jump | Start Menu', mega: 'Grand Theft Auto Advance.zip' },
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
];

const CONSOLES = [
  { name: 'Game Boy Advance', slug: 'gameboy-advance', short: 'GBA', year: '2001', count: GAMES.filter(g => g.genre).length, desc: 'Play Game Boy Advance games online free in your browser. No download, no install. 25+ classic GBA titles including Pokemon, Zelda, Mario, Metroid, and Kirby.', history: 'The Game Boy Advance (GBA) is a 32-bit handheld console released by Nintendo in 2001 as the successor to the Game Boy Color. It features a 240x160 pixel screen capable of 32,768 colors, a 32-bit ARM7TDMI processor, and a library of over 1,500 games. The GBA dominated the handheld market, selling over 81 million units worldwide. Its most iconic games include Pokemon Ruby and Sapphire, Zelda: The Minish Cap, Metroid Fusion, and Mario Kart: Super Circuit. The GBA remains one of the most beloved handheld consoles ever made, and its games are still played by millions through browser-based emulators today.' },
  { name: 'Game Boy Color', slug: 'gameboy-color', short: 'GBC', year: '1998', count: 8, desc: 'Play Game Boy Color games online free in your browser. No download, no install. Classic GBC titles including Pokemon, Zelda, and more.', history: 'The Game Boy Color (GBC) is an 8-bit handheld console released by Nintendo in 1998. It was the first Game Boy model with a color screen, supporting up to 56 colors simultaneously from a palette of 32,768. The GBC was fully backward compatible with the original Game Boy library, giving it instant access to thousands of games. Its defining titles include Pokemon Gold and Silver, Pokemon Crystal, The Legend of Zelda: Link\'s Awakening DX, and Wario Land 3. The GBC sold over 118 million units combined with the original Game Boy, making it one of the best-selling consoles in history.' },
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
  { name: 'Game Freak', slug: 'game-freak', desc: 'Play Game Freak games online free. The developer of the Pokemon series for Game Boy Advance.' },
  { name: 'Nintendo', slug: 'nintendo', desc: 'Play Nintendo GBA games online free. Mario, Zelda, Metroid, and more first-party classics in your browser.' },
  { name: 'Capcom', slug: 'capcom', desc: 'Play Capcom GBA games online free. Zelda: The Minish Cap and more in your browser.' },
  { name: 'HAL Laboratory', slug: 'hal-laboratory', desc: 'Play HAL Laboratory games online free. Kirby: Nightmare in Dream Land and Kirby & the Amazing Mirror.' },
  { name: 'Konami', slug: 'konami', desc: 'Play Konami GBA games online free. Castlevania: Aria of Sorrow in your browser.' },
  { name: 'Rare', slug: 'rare', desc: 'Play Rare games online free. Donkey Kong Country for GBA in your browser.' },
  { name: 'Intelligent Systems', slug: 'intelligent-systems', desc: 'Play Intelligent Systems games online free. Fire Emblem: Sacred Stones in your browser.' },
  { name: 'Sonic Team', slug: 'sonic-team', desc: 'Play Sonic Team games online free. Sonic Advance 3 in your browser.' },
  { name: 'Bandai', slug: 'bandai', desc: 'Play Bandai GBA games online free. Dragon Ball: Advanced Adventure in your browser.' },
  { name: 'Marvelous', slug: 'marvelous', desc: 'Play Marvelous games online free. Harvest Moon: Friends of Mineral Town in your browser.' },
  { name: 'Vicarious Visions', slug: 'vicarious-visions', desc: 'Play Vicarious Visions games online free. Crash Bandicoot: The Huge Adventure in your browser.' },
  { name: 'Rockstar Games', slug: 'rockstar-games', desc: 'Play Rockstar Games online free. GTA Advance in your browser.' },
  { name: 'AlphaDream', slug: 'alphadream', desc: 'Play AlphaDream games online free. Mario & Luigi: Superstar Saga in your browser.' },
  { name: 'LSA', slug: 'lsa', desc: 'Play LSA ROM hacks online free. Pokemon Ultra Violet for GBA in your browser.' },
  { name: 'ROM Hack', slug: 'rom-hack', desc: 'Play the best Pokemon ROM hacks online free. Pokemon Jupiter and more in your browser.' },
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
    <a href="/" class="brand">EggerMath</a>
    <div class="nav-links">
      <a href="/"${active === 'home' ? ' class="active"' : ''}>Home</a>
      <a href="/gameboy-advance/"${active === 'gba' ? ' class="active"' : ''}>Game Boy Advance</a>
      <a href="/gameboy-color/"${active === 'gbc' ? ' class="active"' : ''}>Game Boy Color</a>
      <a href="/genre/"${active === 'genres' ? ' class="active"' : ''}>Genres</a>
      <a href="/series/"${active === 'series' ? ' class="active"' : ''}>Series</a>
      <a href="/tags/"${active === 'tags' ? ' class="active"' : ''}>Tags</a>
      <a href="/blog/"${active === 'blog' ? ' class="active"' : ''}>Blog</a>
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
    .nav { background: #0d0d1a; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); position: sticky; top: 0; z-index: 100; }
    .nav a { color: rgba(240,235,224,0.6); text-decoration: none; font-size: 0.85rem; margin-left: 18px; }
    .nav a.brand { color: #c4a35a; font-weight: 700; font-size: 1.1rem; margin-left: 0; }
    .nav a.active { color: #c4a35a; }
    .nav-links { display: flex; align-items: center; }
    @media (max-width: 700px) { .nav-links { display: none; } }
    .breadcrumbs { padding: 10px 24px; font-size: 0.8rem; color: rgba(240,235,224,0.4); max-width: 1200px; margin: 0 auto; }
    .breadcrumbs a { color: rgba(240,235,224,0.5); text-decoration: none; }
    .breadcrumbs .sep { margin: 0 6px; }
    .breadcrumbs .current { color: #c4a35a; }
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
    </style>`;
}

function footerHTML() {
  return `<footer class="footer">
    <p>&copy; 2026 EggerMath — Free GBA & Gameboy Emulator</p>
    <p><a href="/">Home</a>|<a href="/gameboy-advance/">Game Boy Advance</a>|<a href="/gameboy-color/">Game Boy Color</a>|<a href="/genre/">Genres</a>|<a href="/series/">Series</a>|<a href="/tags/">Tags</a>|<a href="/blog/">Blog</a>|<a href="privacy.html">Privacy</a>|<a href="terms.html">Terms</a>|<a href="takedown.html">DMCA</a></p>
  </footer>
</body>
</html>`;
}

function gamePageHTML(game) {
  const related = GAMES.filter(g => g.series === game.series && g.slug !== game.slug).slice(0, 4);
  const relatedHTML = related.map(g => `<div class="card"><h3><a href="/games/${g.slug}.html">${g.title}</a></h3><p>${g.desc.split('.')[0]}.</p><div class="sub"><span class="stars">${starsHTML(g.rating)}</span> ${g.rating.toFixed(1)} · ${g.genre} · ${g.year}</div></div>`).join('\n');
  const otherGames = GAMES.filter(g => g.genre === game.genre && g.slug !== game.slug).slice(0, 4);
  const otherHTML = otherGames.map(g => `<div class="card"><h3><a href="/games/${g.slug}.html">${g.title}</a></h3><p>${g.desc.split('.')[0]}.</p><div class="sub"><span class="stars">${starsHTML(g.rating)}</span> ${g.rating.toFixed(1)} · ${g.series} · ${g.year}</div></div>`).join('\n');
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
        "aggregateRating": {"@type": "AggregateRating", "ratingValue": "${game.rating}", "reviewCount": "${game.ratingCount}", "bestRating": "10", "worstRating": "1"}
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
  ${breadcrumbs([{name: 'Home', url: '/'}, {name: 'Game Boy Advance', url: '/gameboy-advance/'}, {name: game.title, url: ''}])}
  <div class="container">
    <h1>${game.title}</h1>
    <div class="meta">
      <span class="stars">${starsHTML(game.rating)}</span> <span class="rating-num">${game.rating}/10 (${game.ratingCount} ratings)</span>
      <span>${game.year}</span> · <span>${game.genre}</span> · <a href="/series/${game.series.toLowerCase().replace(/\s+/g, '-')}/" style="color:#c4a35a;">${game.series} Series</a> · <a href="/developers/${game.developer.toLowerCase().replace(/\s+/g, '-')}/" style="color:#c4a35a;">${game.developer}</a>
    </div>
    <p style="font-size:1rem;line-height:1.7;color:rgba(240,235,224,0.7);margin-bottom:20px;">${game.desc}</p>
    <div class="chip-row">${tagsHTML}</div>
    <a href="/gba-emulator-web/" class="play-btn" style="display:inline-block;background:#c4a35a;color:#161a13;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:1rem;margin:20px 0;">Play ${game.title} Online Free</a>

    <div style="margin:30px 0;padding:16px;background:rgba(18,18,31,0.8);border-radius:12px;border:1px solid rgba(255,255,255,0.04);">
      <h2 style="font-size:1.2rem;color:#c4a35a;margin-bottom:10px;">Game Controls</h2>
      <p style="color:rgba(240,235,224,0.7);font-size:0.9rem;font-family:monospace;">${game.controls}</p>
    </div>

    <div style="margin:30px 0;">
      <h2 style="font-size:1.2rem;color:#c4a35a;margin-bottom:10px;">About This Retro Game</h2>
      <p style="color:rgba(240,235,224,0.7);line-height:1.7;font-size:0.95rem;">${game.title} was developed by ${game.developer} and published for the Game Boy Advance in ${game.year}. As a ${game.genre} title in the ${game.series} series, it features ${game.tags.slice(0,3).join(', ')} gameplay. ${game.desc.split('.')[1] || ''}</p>
      <div class="chip-row">
        <button style="background:rgba(196,163,90,0.12);color:#c4a35a;border:1px solid rgba(196,163,90,0.3);padding:8px 16px;border-radius:8px;cursor:pointer;font-size:0.85rem;">♡ Add to Favorites</button>
        <button style="background:transparent;color:rgba(240,235,224,0.5);border:1px solid rgba(255,255,255,0.15);padding:8px 16px;border-radius:8px;cursor:pointer;font-size:0.85rem;">Report Issue</button>
      </div>
    </div>

    <div style="margin:30px 0;padding:16px;background:rgba(18,18,31,0.8);border-radius:12px;border:1px solid rgba(255,255,255,0.04);">
      <h2 style="font-size:1.2rem;color:#c4a35a;margin-bottom:10px;">Reviews &amp; Ratings</h2>
      <div style="margin-bottom:12px;"><span style="font-size:2rem;font-weight:700;color:#f0ebe0;">${game.rating}</span><span style="color:rgba(240,235,224,0.4);">/10</span> <span class="stars">${starsHTML(game.rating)}</span> <span style="color:rgba(240,235,224,0.4);">· ${game.ratingCount} ratings</span></div>
      <p style="color:rgba(240,235,224,0.5);font-size:0.85rem;">Players rate ${game.title} ${game.rating}/10 for its ${game.tags.slice(0,2).join(' and ')} gameplay and lasting replay value. Be the first to write a review!</p>
    </div>

    ${related.length ? `<div style="margin:30px 0;"><h2 style="font-size:1.2rem;color:#c4a35a;margin-bottom:12px;">More ${game.series} Games</h2><div class="grid">${relatedHTML}</div></div>` : ''}
    ${otherGames.length ? `<div style="margin:30px 0;"><h2 style="font-size:1.2rem;color:#c4a35a;margin-bottom:12px;">More ${game.genre} Games</h2><div class="grid">${otherHTML}</div></div>` : ''}

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
  </div>
  ${footerHTML()}`;
}

function consolePageHTML(console) {
  const games = GAMES_WITH_CONSOLE.filter(g => g.console === console.short);
  const gamesHTML = games.length
    ? games.map(g => `<div class="card"><h3><a href="/games/${g.slug}.html">${g.title}</a></h3><p>${g.desc.split('.')[0]}.</p><div class="sub"><span class="stars">${starsHTML(g.rating)}</span> ${g.rating.toFixed(1)} · ${g.genre} · ${g.year}</div></div>`).join('\n')
    : `<div class="card" style="grid-column:1/-1;"><h3>${console.name} games coming soon</h3><p>We are adding ${console.name} games to EggerMath. Bookmark this page and check back.</p></div>`;
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
  ${navHTML(console.slug === 'gameboy-advance' ? 'gba' : 'gbc')}
  ${breadcrumbs([{name: 'Home', url: '/'}, {name: console.name, url: ''}])}
  <div class="container">
    <h1>Play ${console.name} Games Online Free</h1>
    <p class="meta">${console.count}+ games · ${console.year} console · No download, no install</p>
    <div class="history">${console.history}</div>
    <div class="chip-row">
      <a class="chip" href="/gba-emulator-web/">Open ${console.short} Emulator</a>
      <a class="chip" href="/genre/">Browse by Genre</a>
      <a class="chip" href="/series/">Browse by Series</a>
    </div>
    <h2 style="font-size:1.3rem;color:#c4a35a;margin:30px 0 16px;">${console.name} Games</h2>
    <div class="grid">${gamesHTML}</div>
  </div>
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
  ${breadcrumbs([{name: 'Home', url: '/'}, {name: 'Genres', url: ''}])}
  <div class="container">
    <h1>GBA Games by Genre</h1>
    <p class="meta">Browse all Game Boy Advance games by genre and play them free in your browser</p>
    <div class="grid">${cards}</div>
  </div>
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
  ${breadcrumbs([{name: 'Home', url: '/'}, {name: 'Genres', url: '/genre/'}, {name: genre.name, url: ''}])}
  <div class="container">
    <h1>Play ${genre.name} GBA Games Online Free</h1>
    <p class="meta">${games.length} games</p>
    <div class="grid">${gamesHTML}</div>
  </div>
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
  ${breadcrumbs([{name: 'Home', url: '/'}, {name: 'Series', url: ''}])}
  <div class="container">
    <h1>GBA Games by Series</h1>
    <p class="meta">Browse Game Boy Advance games by their franchise series</p>
    <div class="grid">${cards}</div>
  </div>
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
  ${breadcrumbs([{name: 'Home', url: '/'}, {name: 'Series', url: '/series/'}, {name: series.name, url: ''}])}
  <div class="container">
    <h1>Play ${series.name} GBA Games Online Free</h1>
    <p class="meta">${games.length} games</p>
    <div class="grid">${gamesHTML}</div>
  </div>
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
  ${breadcrumbs([{name: 'Home', url: '/'}, {name: 'Tags', url: ''}])}
  <div class="container">
    <h1>GBA Game Tags</h1>
    <p class="meta">Browse all Game Boy Advance games by gameplay tag</p>
    <div class="chip-row">${cards}</div>
  </div>
  ${footerHTML()}`;
}

function tagPageHTML(tag) {
  const slug = tag.replace(/\s+/g, '-');
  const games = GAMES.filter(g => g.tags.includes(tag));
  const gamesHTML = games.map(g => `<div class="card"><h3><a href="/games/${g.slug}.html">${g.title}</a></h3><p>${g.desc.split('.')[0]}.</p><div class="sub"><span class="stars">${starsHTML(g.rating)}</span> ${g.rating.toFixed(1)} · ${g.genre} · ${g.year}</div></div>`).join('\n');
  return `${header()}
  <title>Play ${tag.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} GBA Games Online Free</title>
  <meta name="description" content="${padMeta('Play ' + tag + ' GBA games online free. ' + games.slice(0, 3).map(g => g.title).join(', ') + (games.length > 3 ? ' and more' : '') + '. No download, no install, play in your browser.')}">
  <link rel="canonical" href="${SITE}/tags/${slug}/">
  <meta property="og:title" content="Play ${tag.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} GBA Games Online Free">
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
  ${breadcrumbs([{name: 'Home', url: '/'}, {name: 'Tags', url: '/tags/'}, {name: tag, url: ''}])}
  <div class="container">
    <h1>Play ${tag.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} GBA Games Online Free</h1>
    <p class="meta">${games.length} games tagged "${tag}"</p>
    <div class="grid">${gamesHTML}</div>
  </div>
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
  ${breadcrumbs([{name: 'Home', url: '/'}, {name: 'Developers', url: ''}])}
  <div class="container">
    <h1>GBA Game Developers</h1>
    <p class="meta">Browse all Game Boy Advance games by their developer</p>
    <div class="grid">${cards}</div>
  </div>
  ${footerHTML()}`;
}

function developerPageHTML(dev) {
  const games = GAMES.filter(g => g.developer === dev.name);
  const gamesHTML = games.map(g => `<div class="card"><h3><a href="/games/${g.slug}.html">${g.title}</a></h3><p>${g.desc.split('.')[0]}.</p><div class="sub"><span class="stars">${starsHTML(g.rating)}</span> ${g.rating.toFixed(1)} · ${g.genre} · ${g.year}</div></div>`).join('\n');
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
    "url": "${SITE}/developers/${dev.slug}/",
    "isPartOf": {"@type": "WebSite", "name": "EggerMath", "url": "${SITE}"}
  }
  </script>
  ${baseStyle()}
</head>
<body>
  ${navHTML('genres')}
  ${breadcrumbs([{name: 'Home', url: '/'}, {name: 'Developers', url: '/developers/'}, {name: dev.name, url: ''}])}
  <div class="container">
    <h1>${dev.name} GBA Games</h1>
    <p class="meta">${games.length} games developed by ${dev.name}</p>
    <div class="grid">${gamesHTML}</div>
  </div>
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
  ${breadcrumbs([{name: 'Home', url: '/'}, {name: 'Yearly Games', url: ''}])}
  <div class="container">
    <h1>GBA Games by Year</h1>
    <p class="meta">Browse classic retro games by their release year</p>
    <div class="grid">${cards}</div>
  </div>
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
  ${breadcrumbs([{name: 'Home', url: '/'}, {name: 'Yearly Games', url: '/yearly-games/'}, {name: year, url: ''}])}
  <div class="container">
    <h1>GBA Games from ${year}</h1>
    <p class="meta">${games.length} games released in ${year}</p>
    <div class="grid">${gamesHTML}</div>
  </div>
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

// ============ SITEMAP ============
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}/</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${SITE}/gba-emulator-web/</loc><lastmod>2026-08-13</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>\n`;

CONSOLES.forEach(c => {
  sitemap += `  <url><loc>${SITE}/${c.slug}/</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>\n`;
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
sitemap += `</urlset>`;
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap);
console.log('Sitemap updated with all pages');
