const fs = require('fs');

// ─── Tag-to-Category mapping ───
const TAG_CATEGORY = {
  // Action
  'fighting': 'Action', 'gun': 'Action', 'sword': 'Action', 'boxing': 'Action',
  'wrestling': 'Action', 'karate': 'Action', 'archer': 'Action', 'sniper': 'Action',
  'bow': 'Action', 'arrow': 'Action', 'shoot': 'Action', 'ninja': 'Action',
  'knight': 'Action', 'warrior': 'Action', 'ragdoll': 'Action',
  // Racing
  'car': 'Racing', 'racing': 'Racing', 'motorcycle': 'Racing', 'bmx': 'Racing',
  'drifting': 'Racing', 'drift': 'Racing', 'road': 'Racing', 'parking': 'Racing',
  'taxi': 'Racing', 'bus': 'Racing', 'helicopter': 'Racing', 'boat': 'Racing',
  'airplane': 'Racing', 'rocket': 'Racing', 'skiing': 'Racing',
  'skateboard': 'Racing', 'snowboard': 'Racing', 'surfing': 'Racing',
  // Shooting
  'shooting': 'Shooting', 'gun': 'Shooting', 'sniper': 'Shooting',
  'horror': 'Shooting', 'war': 'Shooting',
  // Sports
  'basketball': 'Sports', 'soccer': 'Sports', 'football': 'Sports',
  'baseball': 'Sports', 'tennis': 'Sports', 'bowling': 'Sports',
  'sports': 'Sports', 'cricket': 'Sports', 'rugby': 'Sports',
  // Puzzle
  'puzzle': 'Puzzle', 'match-3': 'Puzzle', 'bubble': 'Puzzle', 'color': 'Puzzle',
  'solitaire': 'Puzzle', 'chess': 'Puzzle', 'checkers': 'Puzzle', 'sudoku': 'Puzzle',
  'mahjong': 'Puzzle', 'word': 'Puzzle', 'brain': 'Puzzle', 'slide': 'Puzzle',
  'sort': 'Puzzle', 'merge': 'Puzzle', 'stack': 'Puzzle', 'brick': 'Puzzle',
  'tetris': 'Puzzle', 'pinball': 'Puzzle', 'idle': 'Puzzle', 'clicker': 'Puzzle',
  'quiz': 'Puzzle', 'trivia': 'Puzzle', 'crossword': 'Puzzle', 'memory': 'Puzzle',
  // Arcade
  'io': 'Arcade', 'run': 'Arcade', 'jumping': 'Arcade', 'parkour': 'Arcade',
  'balloon': 'Arcade', 'fly': 'Arcade', 'ice': 'Arcade', 'tap': 'Arcade',
  'swipe': 'Arcade', 'catch': 'Arcade', 'dodge': 'Arcade', 'climbing': 'Arcade',
  // Adventure
  'adventure': 'Adventure', 'quest': 'Adventure', 'rpg': 'Adventure',
  'strategy': 'Strategy', 'tower': 'Strategy', 'defense': 'Strategy',
  'kingdom': 'Strategy', 'empire': 'Strategy', 'base': 'Strategy',
  'mining': 'Adventure', 'survival': 'Adventure', 'craft': 'Adventure',
  // Simulation
  'simulation': 'Simulation', 'management': 'Simulation', 'building': 'Simulation',
  'builder': 'Simulation', 'cooking': 'Simulation', 'farm': 'Simulation',
  'fishing': 'Simulation', 'hunting': 'Simulation', 'train': 'Simulation',
  // Educational
  'math': 'Educational', 'kids': 'Educational', 'coloring': 'Educational',
  'painting': 'Educational', 'drawing': 'Educational', 'school': 'Educational',
  'animal': 'Educational', 'bird': 'Educational', 'cat': 'Educational',
  'dog': 'Educational', 'fish': 'Educational', 'dinosaur': 'Educational',
  // Girls
  'dress-up': 'Girls', 'princess': 'Girls', 'unicorn': 'Girls',
  // Creative
  'music': 'Creative', 'dance': 'Creative',
  // Card
  'card': 'Card', 'board': 'Card',
  // Action (more)
  'multiplayer': 'Arcade', 'two-player': 'Arcade', 'skill': 'Arcade',
  'zombie': 'Shooting', 'monster': 'Shooting', 'alien': 'Shooting',
  'robot': 'Action', 'superhero': 'Action', 'pirate': 'Action',
  'viking': 'Action', 'spartan': 'Action', 'dragon': 'Action',
  'ninja': 'Action', 'wizard': 'Action', 'mage': 'Action',
  'castle': 'Strategy', 'tower-defense': 'Strategy',
  'cool': 'Arcade', 'escape': 'Puzzle', 'maze': 'Puzzle',
  'run': 'Arcade', 'stacking': 'Puzzle', 'tank': 'Action',
  'halloween': 'Shooting', 'christmas': 'Creative',
  'tropical': 'Arcade', 'arctic': 'Arcade', 'desert': 'Arcade',
  'forest': 'Adventure', 'jungle': 'Adventure', 'cave': 'Adventure',
  'ocean': 'Adventure', 'island': 'Adventure', 'volcano': 'Adventure',
  'mountain': 'Adventure', 'city': 'Simulation', 'village': 'Simulation',
  'space': 'Arcade', 'weather': 'Creative',
  'kitchen': 'Simulation', 'factory': 'Simulation', 'hospital': 'Simulation',
  'office': 'Simulation', 'home': 'Simulation', 'school': 'Simulation',
  'mine': 'Adventure', 'fishing': 'Adventure',
  'helicopter': 'Racing', 'shoot': 'Shooting', 'stick': 'Arcade',
  'balloon': 'Arcade', 'parkour': 'Arcade',
};

function mapTagToCategory(tag) {
  return TAG_CATEGORY[tag] || 'Other';
}

function slugToTitle(slug) {
  return slug
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
}

function titleToId(title, source) {
  return source + '-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+$/, '');
}

function main() {
  // Load existing Y8 games
  const gamesContent = fs.readFileSync('games.js', 'utf-8');
  const match = gamesContent.match(/const GAMES = (\[[\s\S]*\]);/);
  if (!match) { console.error('Cannot parse games.js'); process.exit(1); }
  const y8Games = JSON.parse(match[1]);
  console.log(`Loaded ${y8Games.length} Y8 games`);

  // Load GamePix slugs
  const gpSlugs = JSON.parse(fs.readFileSync('gamepix-slugs.json', 'utf-8'));
  console.log(`Loaded ${gpSlugs.length} GamePix game slugs`);

  // Deduplicate — keep first occurrence per slug
  const seen = new Set();
  const uniqueGp = [];
  for (const g of gpSlugs) {
    if (!seen.has(g.slug)) {
      seen.add(g.slug);
      uniqueGp.push(g);
    }
  }
  console.log(`Unique GamePix games: ${uniqueGp.length}`);

  // Build GamePix game entries
  const gpGames = uniqueGp.map((g, i) => {
    const title = slugToTitle(g.slug);
    const category = mapTagToCategory(g.tag);
    const thumb = `https://img.gamepix.com/games/${g.slug}/cover/${g.slug}.png?w=400&ar=4:3`;
    return {
      id: 'gp-' + g.slug,
      title: title,
      category: category,
      description: `Play ${title} free on EggerMath. No download required.`,
      embedUrl: `https://www.gamepix.com/play/${g.slug}`,
      thumb: thumb,
      source: 'gamepix',
      tags: [g.tag],
    };
  });

  // Count categories
  const catCounts = {};
  for (const g of [...y8Games, ...gpGames]) {
    catCounts[g.category] = (catCounts[g.category] || 0) + 1;
  }
  console.log('\nCategory breakdown:');
  for (const [cat, count] of Object.entries(catCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }

  // Merge — GamePix games first (as requested), then Y8 games
  const allGames = [...gpGames, ...y8Games];

  // Write games.js
  const output = 'const GAMES = ' + JSON.stringify(allGames, null, 0) + ';\n';
  fs.writeFileSync('games.js', output);
  console.log(`\nWrote ${allGames.length} total games to games.js`);
  console.log(`File size: ${(Buffer.byteLength(output) / 1024 / 1024).toFixed(2)} MB`);
}

main();
