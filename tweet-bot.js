const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs');
const path = require('path');

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const readOnlyClient = client.readWrite;

// Load games
const gamesCode = fs.readFileSync(path.join(__dirname, 'games.js'), 'utf-8').replace('const GAMES =', 'GAMES =');
let GAMES = [];
eval(gamesCode);

const categories = {
  'Puzzle': '🧠', 'Arcade': '🎮', 'Shooting': '🎯', 'Racing': '🏎️',
  'Educational': '📚', 'Action': '💥', 'Adventure': '🗺️', 'Simulation': '⚙️',
  'Sports': '⚽', 'Girls': '💄', 'Strategy': '♟️', 'Creative': '🎨',
  'Card': '🃏', 'Other': '⭐'
};

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateGameTweet() {
  const g = pick(GAMES);
  const emoji = categories[g.category] || '🎮';
  return `${emoji} Play "${g.title}" free online!\n\n${g.category} game — no download needed\n\nPlay now 👉 eggermath.com/game.html?id=${g.id}\n\n#FreeGames #HTML5Games #BrowserGames #${g.category.replace(/\s/g, '')}`;
}

function generateCategoryTweet() {
  const cat = Object.keys(categories);
  const chosen = pick(cat);
  const emoji = categories[chosen];
  const catGames = GAMES.filter(g => g.category === chosen);
  const samples = [];
  for (let i = 0; i < Math.min(3, catGames.length); i++) {
    const g = pick(catGames.filter(x => !samples.includes(x.title)));
    if (g) samples.push(g.title);
  }
  return `${emoji} Top ${chosen} Games:\n\n${samples.join(', ')}\n\nPlay all free 👉 eggermath.com/play/${chosen.toLowerCase().replace(/\s+/g, '-')}-games\n\n#FreeGames #${chosen.replace(/\s/g, '')} #BrowserGames`;
}

function generateStatsTweet() {
  const total = GAMES.length;
  const cats = {};
  GAMES.forEach(g => { cats[g.category] = (cats[g.category] || 0) + 1; });
  const topCat = Object.keys(cats).sort((a, b) => cats[b] - cats[a])[0];
  return `🔥 EggerMath now has ${total}+ free browser games!\n\n📊 Top category: ${topCat} with ${cats[topCat]} games\n\nAll FREE, no download 👉 eggermath.com\n\n#FreeGames #HTML5Games #BrowserGames`;
}

const tweetTypes = [generateGameTweet, generateCategoryTweet, generateStatsTweet];

async function postTweet() {
  try {
    const generator = pick(tweetTypes);
    const text = generator();
    const result = await readOnlyClient.v2.tweet(text);
    console.log(`[${new Date().toISOString()}] Posted tweet: ${result.data.id}`);
    console.log(`Text: ${text}\n`);
    return { success: true, id: result.data.id, text };
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error:`, err.message);
    return { success: false, error: err.message };
  }
}

// Run if called directly
if (require.main === module) {
  postTweet().then(result => {
    if (!result.success) process.exit(1);
  });
}

module.exports = { postTweet };
