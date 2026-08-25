import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GAMES_PATH = join(__dirname, '..', 'src', 'data', 'games.js');
const PUBLIC_DIR = join(__dirname, '..', 'public');
const OUT_DIR = join(__dirname, '..', 'yt-shorts');

const games = [];
const content = readFileSync(GAMES_PATH, 'utf-8');
for (const block of content.split(/\},\s*\{/)) {
  const s = block.match(/slug:\s*['"]([^'"]+)['"]/);
  const t = block.match(/title:\s*['"]([^'"]+)['"]/);
  const g = block.match(/genre:\s*['"]([^'"]+)['"]/);
  if (s && t) games.push({ slug: s[1], title: t[1], genre: g ? g[1] : 'GBA' });
}
}

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickGames(n) {
  const shuffled = [...games].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

const targetSlug = process.env.GAME_SLUG;
let selectedGames;
if (targetSlug) {
  const found = games.find(g => g.slug === targetSlug);
  selectedGames = found ? [found] : [pickRandom(games)];
} else {
  selectedGames = pickGames(1);
}
const game = selectedGames[0];

// Generate text-based short script
// This creates a simple text video using ffmpeg
// For real gameplay footage, user needs to provide .mp4 clips in yt-clips/ folder

const clipsDir = join(__dirname, '..', 'yt-clips');
const hasClip = existsSync(join(clipsDir, `${game.slug}.mp4`));

if (hasClip) {
  console.log(`Using gameplay clip: ${game.slug}.mp4`);
  const clip = join(clipsDir, `${game.slug}.mp4`);
  const out = join(OUT_DIR, `${game.slug}-short.mp4`);

  // Trim to 30s, add text overlay, crop to 9:16
  execSync(`ffmpeg -y -i "${clip}" -t 30 -vf "crop=ih*9/16:ih,scale=1080:1920,drawtext=text='${game.title}':fontsize=72:fontcolor=white:x=(w-text_w)/2:y=100:box=1:boxcolor=black@0.5:boxborderw=20,drawtext=text='Play Free at eggermath.com':fontsize=48:fontcolor=#c4a35a:x=(w-text_w)/2:y=h-200:box=1:boxcolor=black@0.5:boxborderw=15" -c:v libx264 -preset fast -crf 23 "${out}"`);
  console.log(`Created: ${out}`);
} else {
  console.log(`No clip found for ${game.slug}.`);
  console.log(`To generate YouTube Shorts:`);
  console.log(`  1. Record 30-60s gameplay clip`);
  console.log(`  2. Save as: yt-clips/${game.slug}.mp4`);
  console.log(`  3. Run: node scripts/generate-yt-short.mjs`);
  console.log(`\nCreating placeholder frame instead...`);

  // Create a static image frame as placeholder
  const svgPath = join(PUBLIC_DIR, 'pins', `pin-${game.slug}.svg`);
  if (existsSync(svgPath)) {
    const out = join(OUT_DIR, `${game.slug}-frame.mp4`);
    execSync(`ffmpeg -y -loop 1 -i "${svgPath}" -t 15 -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=#0d0d0d" -c:v libx264 -preset fast -pix_fmt yuv420p "${out}"`);
    console.log(`Created placeholder: ${out}`);
  }
}
