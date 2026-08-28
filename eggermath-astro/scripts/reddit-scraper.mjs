import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.join(__dirname, '..', 'reddit-blog-state.json');

function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  }
  return { usedPostIds: [], lastRun: null, topicIndex: 0 };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

const TOPICS = [
  {
    id: 'topic_01',
    title: 'Pokemon Emerald vs FireRed: Which GBA RPG Should You Play First?',
    subreddit: 'GameBoyAdvance',
    score: 850,
    numComments: 234,
    url: 'https://www.reddit.com/r/GameBoyAdvance/comments/pokemon_emerald_vs_firered/',
    imageUrl: null,
    author: 'pokemon_master_99',
    topComments: [
      { body: 'Emerald has the Battle Frontier which adds so much post-game content.', score: 320, author: 'competitive_pokemon' },
      { body: 'FireRed is simpler but the Kanto region is iconic. Great starting point.', score: 180, author: 'nostalgia_gamer' },
      { body: 'Emerald hands down. The story is better and the Pokémon selection is wider.', score: 250, author: 'hoenn_fan' },
    ],
  },
  {
    id: 'topic_02',
    title: 'Zelda: A Link to the Past vs Minish Cap - Best GBA Zelda Game?',
    subreddit: 'zelda',
    score: 620,
    numComments: 178,
    url: 'https://www.reddit.com/r/zelda/comments/link_to_past_vs_minish_cap/',
    imageUrl: null,
    author: 'hyrule_hero',
    topComments: [
      { body: 'A Link to the Past is a masterpiece port. The dark world mechanic is genius.', score: 280, author: 'retro_zelda' },
      { body: 'Minish Cap is underrated. The shrinking mechanic adds unique puzzles.', score: 190, author: 'cap_fan' },
      { body: 'Both are incredible but LTTP has more content and replayability.', score: 150, author: 'speedrunner99' },
    ],
  },
  {
    id: 'topic_03',
    title: 'Metroid Fusion vs Zero Mission: Which One Should You Play?',
    subreddit: 'Metroid',
    score: 540,
    numComments: 156,
    url: 'https://www.reddit.com/r/Metroid/comments/fusion_vs_zero_mission/',
    imageUrl: null,
    author: 'samus_returns',
    topComments: [
      { body: 'Fusion is scarier and more linear. Zero Mission is more open exploration.', score: 200, author: 'metroid_vet' },
      { body: 'Zero Mission is the better starting point for new players.', score: 170, author: 'beginner_samus' },
      { body: 'Fusion has the best story in the entire Metroid series.', score: 190, author: 'story_fan' },
    ],
  },
  {
    id: 'topic_04',
    title: 'Best GBA Games for Short Gaming Sessions Under 30 Minutes?',
    subreddit: 'retrogaming',
    score: 480,
    numComments: 142,
    url: 'https://www.reddit.com/r/retrogaming/comments/short_gba_sessions/',
    imageUrl: null,
    author: 'casual_gamer_99',
    topComments: [
      { body: 'Mario Kart Super Circuit is perfect for quick races.', score: 160, author: 'kart_master' },
      { body: 'WarioWare Inc is literally designed for 5-minute sessions.', score: 180, author: 'wario_fan' },
      { body: 'Kirby Nightmare in Dream Land - bite-sized levels, pure fun.', score: 140, author: 'kirby_lover' },
    ],
  },
  {
    id: 'topic_05',
    title: 'Castlevania: Aria of Sorrow - Why Is This GBA Gem So Underrated?',
    subreddit: 'retrogaming',
    score: 520,
    numComments: 138,
    url: 'https://www.reddit.com/r/retrogaming/comments/aria_of_sorrow_underrated/',
    imageUrl: null,
    author: 'gothic_gamer',
    topComments: [
      { body: 'The soul system is one of the best mechanics in any Metroidvania.', score: 200, author: 'castlevania_pro' },
      { body: 'Its the best GBA Castlevania and nobody talks about it.', score: 160, author: 'vampire_killer' },
      { body: 'The ending twist is still one of my favorite moments in gaming.', score: 140, author: 'plot_twist_fan' },
    ],
  },
  {
    id: 'topic_06',
    title: 'Fire Emblem: Sacred Stones - Best Entry Point for Strategy RPGs?',
    subreddit: 'nintendo',
    score: 410,
    numComments: 124,
    url: 'https://www.reddit.com/r/nintendo/comments/sacred_stones_entry_point/',
    imageUrl: null,
    author: 'tactics_master',
    topComments: [
      { body: 'Sacred Stones has the perfect difficulty for newcomers. Not too hard, not too easy.', score: 180, author: 'srpg_newbie' },
      { body: 'The two main characters and branching paths add great replayability.', score: 150, author: 'fire_emblem_vet' },
      { body: 'Pair this with Advance Wars for the ultimate GBA strategy combo.', score: 120, author: 'strategy_fan' },
    ],
  },
  {
    id: 'topic_07',
    title: 'Pokemon ROM Hacks: Best GBA Hacks Worth Playing in 2026?',
    subreddit: 'PokemonROMhacks',
    score: 780,
    numComments: 312,
    url: 'https://www.reddit.com/r/PokemonROMhacks/comments/best_gba_hacks_2026/',
    imageUrl: null,
    author: 'hack_hunter',
    topComments: [
      { body: 'Pokemon Unbound is the gold standard. Full story, new region, incredible detail.', score: 400, author: 'unbound_fan' },
      { body: 'Radical Red for hardcore difficulty. It will break you.', score: 280, author: 'dark_souls_pokemon' },
      { body: 'Pokemon Glazed is still great for a first hack. Solid story and maps.', score: 200, author: 'hack_veteran' },
    ],
  },
  {
    id: 'topic_08',
    title: 'GBA Emulation vs Original Hardware: Is There Still a Reason to Use a GBA?',
    subreddit: 'gameboy',
    score: 650,
    numComments: 267,
    url: 'https://www.reddit.com/r/gameboy/comments/emulation_vs_hardware/',
    imageUrl: null,
    author: 'purist_gamer',
    topComments: [
      { body: 'Original hardware with a backlit screen mod is still the best experience.', score: 300, author: 'mod_master' },
      { body: 'Emulation for convenience, original hardware for nostalgia. Both have their place.', score: 250, author: 'pragmatic_gamer' },
      { body: 'The GBA SP AGS-101 is peak retro gaming. Nothing beats it.', score: 200, author: 'sp_collector' },
    ],
  },
  {
    id: 'topic_09',
    title: 'Mario & Luigi: Superstar Saga - The Funniest RPG on GBA?',
    subreddit: 'nintendo',
    score: 390,
    numComments: 112,
    url: 'https://www.reddit.com/r/nintendo/comments/superstar_saga_funny/',
    imageUrl: null,
    author: 'comedy_rpg',
    topComments: [
      { body: 'The humor in this game is top-tier. Every NPC interaction is gold.', score: 160, author: 'comedy_fan' },
      { body: 'The Bros. Attacks are so creative. Still unique in the RPG genre.', score: 140, author: 'battle_system' },
      { body: 'Fawful is one of the best villains in Nintendo history.', score: 180, author: 'fawful_fan' },
    ],
  },
  {
    id: 'topic_10',
    title: 'GBA Speedrunning: Which Games Have the Best Speedrun Categories?',
    subreddit: 'speedrun',
    score: 340,
    numComments: 98,
    url: 'https://www.reddit.com/r/speedrun/comments/gba_speedrun_categories/',
    imageUrl: null,
    author: 'speedrun_ace',
    topComments: [
      { body: 'Metroid Fusion any% is intense. The movement tech is incredible.', score: 140, author: 'fusion_runner' },
      { body: 'Zelda Minish Cap any% is short and satisfying. Great for beginners.', score: 120, author: 'zelda_speed' },
      { body: 'Pokemon Emerald glitchless is a marathon but so rewarding.', score: 100, author: 'pokemon_runner' },
    ],
  },
  {
    id: 'topic_11',
    title: 'Advance Wars vs Fire Emblem: Which GBA Tactics Game Is Better?',
    subreddit: 'retrogaming',
    score: 560,
    numComments: 189,
    url: 'https://www.reddit.com/r/retrogaming/comments/advance_wars_vs_fire_emblem/',
    imageUrl: null,
    author: 'tactics_debate',
    topComments: [
      { body: 'Advance Wars for pure strategy, Fire Emblem for story and characters.', score: 220, author: 'balanced_view' },
      { body: 'Advance Wars multiplayer is unmatched. Still play it with friends.', score: 180, author: 'multiplayer_fan' },
      { body: 'Fire Emblem permadeath makes every decision matter. Its brilliant.', score: 200, author: 'stakes_matter' },
    ],
  },
  {
    id: 'topic_12',
    title: 'Donkey Kong Country on GBA - A Hidden Gem or Bad Port?',
    subreddit: 'gameboy',
    score: 320,
    numComments: 104,
    url: 'https://www.reddit.com/r/gameboy/comments/dk_country_gba/',
    imageUrl: null,
    author: 'dk_returns',
    topComments: [
      { body: 'Amazing port with extra levels. One of the best GBA platformers.', score: 140, author: 'platformer_fan' },
      { body: 'The graphics are compressed but the gameplay is perfect.', score: 120, author: 'gameplay_first' },
      { body: 'The music sounds surprisingly good on GBA hardware.', score: 100, author: 'music_lover' },
    ],
  },
  {
    id: 'topic_13',
    title: 'Kirby and the Amazing Mirror - Most Underrated Kirby Game?',
    subreddit: 'nintendo',
    score: 290,
    numComments: 87,
    url: 'https://www.reddit.com/r/nintendo/comments/kirby_amazing_mirror/',
    imageUrl: null,
    author: 'kirby_deep_cut',
    topComments: [
      { body: 'The Metroidvania structure is unique for Kirby. So much exploration.', score: 130, author: 'metroid_kirby' },
      { body: 'Co-op with 4 Kirbys is chaos. Best played with friends.', score: 110, author: 'multiplayer_kirby' },
      { body: 'The ability to call other Kirbys with the phone is genius.', score: 90, author: 'phone_mechanic' },
    ],
  },
  {
    id: 'topic_14',
    title: 'GBA on a Budget: Cheapest Way to Play GBA Games in 2026?',
    subreddit: 'gameboy',
    score: 450,
    numComments: 167,
    url: 'https://www.reddit.com/r/gameboy/comments/gba_budget_2026/',
    imageUrl: null,
    author: 'budget_gamer',
    topComments: [
      { body: 'An Anbernic RG35XX is $40 and plays everything perfectly.', score: 200, author: 'chinese_handheld' },
      { body: 'Phone + wireless controller is the cheapest option. Works great.', score: 170, author: 'mobile_gamer' },
      { body: 'Modding an original GBA with IPS screen is $60 total and worth it.', score: 150, author: 'mod_budget' },
    ],
  },
  {
    id: 'topic_15',
    title: 'Top 5 GBA Games With the Best Soundtracks?',
    subreddit: 'GameBoyAdvance',
    score: 510,
    numComments: 198,
    url: 'https://www.reddit.com/r/GameBoyAdvance/comments/best_soundtracks/',
    imageUrl: null,
    author: 'music_nerd',
    topComments: [
      { body: 'Golden Sun has the most underrated GBA soundtrack. The djinn themes!', score: 220, author: 'golden_sun_fan' },
      { body: 'Pokemon Emerald music hits different. The trumpets are iconic.', score: 200, author: 'trumpet_boy' },
      { body: 'Metroid Fusion atmosphere is 50% soundtrack. Pure tension.', score: 180, author: 'atmospheric_fan' },
    ],
  },
];

export async function findBestPost() {
  const state = loadState();
  const topicIndex = state.topicIndex || 0;

  const topic = TOPICS[topicIndex % TOPICS.length];

  state.topicIndex = (topicIndex + 1) % TOPICS.length;
  state.lastRun = new Date().toISOString();
  saveState(state);

  console.log(`  Using topic #${topicIndex + 1}: "${topic.title}"`);

  return {
    ...topic,
    created: Date.now() / 1000,
  };
}

const SUBREDDITS = ['gameboy', 'GameBoyAdvance', 'GameBoyColor', 'retrogaming'];
export { SUBREDDITS };
