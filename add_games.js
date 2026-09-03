const fs = require('fs');
const filePath = 'C:\\Users\\rayan\\OneDrive\\Pictures\\Downloads\\PRACTIC\\eggermath-astro\\src\\data\\games.js';
let content = fs.readFileSync(filePath, 'utf8');

const newGames = [
  { title: 'Golden Sun', genre: 'RPG', system: 'GBA', slug: 'golden-sun', mega: 'Golden Sun.zip', img: '', year: 2001, developer: 'Camelot Software Planning', series: 'Golden Sun', desc: 'Play Golden Sun online. Epic RPG adventure as Isaac wielding Psynergy with Djinn summoning.', keywords: 'golden sun online, play golden sun gba' },
  { title: 'Super Mario Advance', genre: 'Platformer', system: 'GBA', slug: 'super-mario-advance', mega: 'Super Mario Advance.zip', img: '', year: 2001, developer: 'Nintendo', series: 'Mario', desc: 'Play Super Mario Advance online. GBA remake of Super Mario Bros. 2 with 4 playable characters.', keywords: 'super mario advance online, play super mario advance gba' },
  { title: 'Super Mario Bros. 3', genre: 'Platformer', system: 'GBA', slug: 'super-mario-bros-3', mega: 'Super Mario Advance 4_ Super Mario Bros. 3.zip', img: '', year: 2003, developer: 'Nintendo', series: 'Mario', desc: 'Play Super Mario Bros. 3 online. GBA port of the NES classic with Super Leaf and Tanooki Suit.', keywords: 'super mario bros 3 online, play super mario bros 3 gba' },
  { title: 'Pokemon Crystal', genre: 'RPG', system: 'GBC', slug: 'pokemon-crystal', mega: 'Pokemon_ Crystal Version.zip', img: '', year: 2001, developer: 'Game Freak', series: 'Pokemon', desc: 'Play Pokemon Crystal online. Enhanced Gold/Silver with Suicune, animated sprites, Battle Tower.', keywords: 'pokemon crystal online, play pokemon crystal, gameboy color emulator' },
  { title: 'Pokemon Gold', genre: 'RPG', system: 'GBC', slug: 'pokemon-gold', mega: 'Pokemon_ Gold Version.zip', img: '', year: 1999, developer: 'Game Freak', series: 'Pokemon', desc: 'Play Pokemon Gold online. Journey through Johto, 100 new Pokemon, day/night cycle.', keywords: 'pokemon gold online, play pokemon gold, gameboy color emulator' },
  { title: 'Pokemon Silver', genre: 'RPG', system: 'GBC', slug: 'pokemon-silver', mega: 'Pokemon_ Silver Version.zip', img: '', year: 1999, developer: 'Game Freak', series: 'Pokemon', desc: 'Play Pokemon Silver online. Lugia featured, Johto region, day/night system.', keywords: 'pokemon silver online, play pokemon silver, gameboy color emulator' },
  { title: 'Pokemon Yellow', genre: 'RPG', system: 'GB', slug: 'pokemon-yellow', mega: 'Pokemon_ Yellow Version - Special Pikachu Edition.zip', img: '', year: 1998, developer: 'Game Freak', series: 'Pokemon', desc: 'Play Pokemon Yellow online. Pikachu follows you, catch all 151 Pokemon in Kanto.', keywords: 'pokemon yellow online, play pokemon yellow, gameboy emulator' },
  { title: 'DBZ: Legendary Super Warriors', genre: 'Fighting', system: 'GBC', slug: 'dbz-legendary-super-warriors', mega: 'Dragon Ball Z_ Legendary Super Warriors.zip', img: '', year: 2002, developer: 'Banpresto', series: 'Dragon Ball', desc: 'Play DBZ Legendary Super Warriors online. Card-based combat through DBZ sagas.', keywords: 'dragon ball z legendary super warriors online, play dbz gbc' },
  { title: 'Shantae', genre: 'Platformer', system: 'GBC', slug: 'shantae', mega: 'Shantae.zip', img: '', year: 2002, developer: 'WayForward', series: 'Shantae', desc: 'Play Shantae online. Half-genie hero with hair-whip attacks and dance transformations.', keywords: 'shantae online, play shantae gbc' },
  { title: 'Super Mario Bros. Deluxe', genre: 'Platformer', system: 'GBC', slug: 'super-mario-bros-deluxe', mega: 'Super Mario Bros. Deluxe.zip', img: '', year: 1999, developer: 'Nintendo', series: 'Mario', desc: 'Play Super Mario Bros. Deluxe online. NES classic on Game Boy Color with extras.', keywords: 'super mario bros deluxe online, play super mario bros gbc' },
  { title: 'Tetris DX', genre: 'Puzzle', system: 'GBC', slug: 'tetris-dx', mega: 'Tetris DX.zip', img: '', year: 1998, developer: 'Nintendo', series: 'Tetris', desc: 'Play Tetris DX online. Definitive Game Boy Color Tetris with 3 save slots.', keywords: 'tetris dx online, play tetris dx gbc' },
  { title: 'Wario Land 3', genre: 'Platformer', system: 'GBC', slug: 'wario-land-3', mega: 'Wario Land 3.zip', img: '', year: 2000, developer: 'Nintendo', series: 'Wario', desc: 'Play Wario Land 3 online. 20+ levels collecting treasures with transformations.', keywords: 'wario land 3 online, play wario land 3 gbc' },
  { title: 'Castlevania Legends', genre: 'Action', system: 'GB', slug: 'castlevania-legends', mega: 'Castlevania Legends.zip', img: '', year: 1997, developer: 'Konami', series: 'Castlevania', desc: 'Play Castlevania Legends online. Young Simon Belmont fights through Dracula castle.', keywords: 'castlevania legends online, play castlevania gb' },
  { title: 'Contra: The Alien Wars', genre: 'Action', system: 'GB', slug: 'contra-alien-wars', mega: 'Contra_ The Alien Wars.zip', img: '', year: 1994, developer: 'Konami', series: 'Contra', desc: 'Play Contra: The Alien Wars online. Intense run-and-gun action with power-ups.', keywords: 'contra alien wars online, play contra gb' },
  { title: 'Donkey Kong', genre: 'Platformer', system: 'GB', slug: 'donkey-kong-gb', mega: 'Donkey Kong (JU) (V1.1) [S][!].zip', img: '', year: 1994, developer: 'Nintendo', series: 'Donkey Kong', desc: 'Play Donkey Kong online. 100 levels of puzzle-platforming as Mario rescues Pauline.', keywords: 'donkey kong online, play donkey kong gb' },
  { title: 'Dr. Mario', genre: 'Puzzle', system: 'GB', slug: 'dr-mario', mega: 'Dr. Mario.zip', img: '', year: 1990, developer: 'Nintendo', series: 'Mario', desc: 'Play Dr. Mario online. Toss capsules to eliminate viruses in Fever and Chill modes.', keywords: 'dr mario online, play dr mario gb' },
  { title: 'DuckTales', genre: 'Platformer', system: 'GB', slug: 'ducktales', mega: 'DuckTales.zip', img: '', year: 1989, developer: 'Capcom', series: 'DuckTales', desc: 'Play DuckTales online. Scrooge McDuck explores 5 worlds with pogo-jump mechanics.', keywords: 'ducktales online, play ducktales gb' },
  { title: 'Final Fantasy Adventure', genre: 'RPG', system: 'GB', slug: 'final-fantasy-adventure', mega: 'Final Fantasy Adventure (USA).zip', img: '', year: 1991, developer: 'Square', series: 'Final Fantasy', desc: 'Play Final Fantasy Adventure online. Action RPG, the first Mana game.', keywords: 'final fantasy adventure online, play final fantasy adventure gb' },
  { title: "Kirby's Dream Land 2", genre: 'Platformer', system: 'GB', slug: 'kirbys-dream-land-2', mega: "Kirby's Dream Land 2.zip", img: '', year: 1995, developer: 'HAL Laboratory', series: 'Kirby', desc: "Play Kirby's Dream Land 2 online. Animal friends help Kirby defeat Dedede.", keywords: "kirby's dream land 2 online, play kirby gb" },
  { title: "Kirby's Pinball Land", genre: 'Puzzle', system: 'GB', slug: 'kirbys-pinball-land', mega: "Kirby's Pinball Land.zip", img: '', year: 1993, developer: 'HAL Laboratory', series: 'Kirby', desc: "Play Kirby's Pinball Land online. Pinball with Kirby bouncing through boards.", keywords: "kirby's pinball land online, play kirby pinball gb" },
  { title: 'Street Fighter II', genre: 'Fighting', system: 'GB', slug: 'street-fighter-ii-gb', mega: 'Street Fighter II.zip', img: '', year: 1995, developer: 'Capcom', series: 'Street Fighter', desc: 'Play Street Fighter II online. 8 world warriors with special moves on Game Boy.', keywords: 'street fighter ii online, play street fighter gb' },
  { title: 'Super Mario Land', genre: 'Platformer', system: 'GB', slug: 'super-mario-land', mega: 'Super Mario Land (World) (Rev 1).zip', img: '', year: 1989, developer: 'Nintendo', series: 'Mario', desc: 'Play Super Mario Land online. Original Game Boy Mario in Sarasaland, 12 worlds.', keywords: 'super mario land online, play super mario land gb' },
  { title: 'Super Mario Land 2', genre: 'Platformer', system: 'GB', slug: 'super-mario-land-2', mega: 'Super Mario Land 2 - 6 Golden Coins (USA, Europe) (Rev 2).zip', img: '', year: 1992, developer: 'Nintendo', series: 'Mario', desc: 'Play Super Mario Land 2 online. Collect 6 golden coins, defeat Wario.', keywords: 'super mario land 2 online, play super mario land 2 gb' },
  { title: 'Tetris', genre: 'Puzzle', system: 'GB', slug: 'tetris-gb', mega: 'Tetris (JUE) (V1.1) [!].zip', img: '', year: 1989, developer: 'Nintendo', series: 'Tetris', desc: 'Play Tetris online. The Game Boy classic that launched a phenomenon.', keywords: 'tetris online, play tetris gb' },
  { title: 'Wario Land: Super Mario Land 3', genre: 'Platformer', system: 'GB', slug: 'wario-land', mega: 'Wario Land_ Super Mario Land 3.zip', img: '', year: 1994, developer: 'Nintendo', series: 'Wario', desc: 'Play Wario Land online. Wario debut adventure, steal treasures and conquer stages.', keywords: 'wario land online, play wario land gb' },
  { title: "Kirby's Dream Land", genre: 'Platformer', system: 'GB', slug: 'kirbys-dream-land', mega: "Kirby's Dream Land.zip", img: '', year: 1992, developer: 'HAL Laboratory', series: 'Kirby', desc: "Play Kirby's Dream Land online. Inhale enemies, float, and defeat King Dedede.", keywords: "kirby's dream land online, play kirby gb" },
  { title: "Mega Man: Dr. Wily's Revenge", genre: 'Action', system: 'GB', slug: 'mega-man-dr-wilys-revenge', mega: "Mega Man - Dr. Wily's Revenge.zip", img: '', year: 1991, developer: 'Capcom', series: 'Mega Man', desc: "Play Mega Man Dr. Wily's Revenge online. Battle robots across 6 stages as Mega Man.", keywords: "mega man dr wily's revenge online, play mega man gb" },
];
// Add system field to existing games that lack it
const systemRegex = /(\n  \{[^}]*?title:)/g;
let updated = content.replace(/\n  \{\n/g, (match) => {
  return match;
});

// For each existing game, add system: 'GBA' if not present
const existingGames = content.match(/export const games = \[([\s\S]*?)\];/);
if (existingGames) {
  let gamesBlock = existingGames[1];
  // Split by game entries and add system field
  const gameEntries = gamesBlock.split(/\n  \{\n/).filter(Boolean);
  let rebuilt = '';
  for (let i = 0; i < gameEntries.length; i++) {
    let entry = gameEntries[i];
    if (!entry.includes('system:')) {
      entry = "    system: 'GBA',\n" + entry;
    }
    rebuilt += '  {\n' + entry;
  }
  content = content.replace(/export const games = \[([\s\S]*?)\];/, 'export const games = [' + rebuilt + '];');
}

// Append new games before the closing ];
const newGamesBlock = newGames.map(g => {
  const lines = ['  {'];
  for (const [k, v] of Object.entries(g)) {
    if (typeof v === 'string') {
      const escaped = v.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      lines.push(`    ${k}: '${escaped}',`);
    } else {
      lines.push(`    ${k}: ${v},`);
    }
  }
  lines.push('  },');
  return lines.join('\n');
}).join('\n');

content = content.replace(/\n\];\n/, '\n' + newGamesBlock + '\n];\n');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done! Added ' + newGames.length + ' new games and system field to existing games.');
