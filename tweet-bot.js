const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const readOnlyClient = client.readWrite;

// NOTE: games.js has been removed. Tweet generation needs to be rewritten
// to use a different data source (e.g. Supabase, hardcoded list, etc.)

const categories = {
  'Puzzle': '🧠', 'Arcade': '🎮', 'Shooting': '🎯', 'Racing': '🏎️',
  'Educational': '📚', 'Action': '💥', 'Adventure': '🗺️', 'Simulation': '⚙️',
  'Sports': '⚽', 'Girls': '💄', 'Strategy': '♟️', 'Creative': '🎨',
  'Card': '🃏', 'Other': '⭐'
};

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const tweetTypes = [generateEmulatorTweet];

function generateEmulatorTweet() {
  const emulators = ['PSP', 'GBA', 'NES', 'SNES', 'NDS', 'N64', 'Genesis', 'PS1'];
  const emoji = pick(['🕹️', '🎮', '👾', '🖥️']);
  const emu = pick(emulators);
  return `${emoji} Play ${emu} ROMs free in your browser!\n\nNo downloads needed — just pick a ROM and play instantly.\n\nPlay now 👉 eggermath.com\n\n#RetroGaming #${emu} #Emulator #FreeGames`;
}

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
