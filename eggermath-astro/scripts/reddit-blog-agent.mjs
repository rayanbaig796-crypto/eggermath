import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { findBestPost } from './reddit-scraper.mjs';
import { generateBlogPost, createAstroFile, slugify } from './blog-generator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const BLOG_DIR = path.join(PROJECT_ROOT, 'src', 'pages', 'blog');
const SITEMAP_SCRIPT = path.join(PROJECT_ROOT, 'generate-sitemap.mjs');
const INDEXNOW_KEY = 'a7f3c9e2b1d04a6f8e2c5d9b0a3f6c1e8';
const SITE_URL = 'https://www.eggermath.com';
const LOG_FILE = path.join(PROJECT_ROOT, 'reddit-blog-log.json');

function logRun(slug, title, success) {
  const logs = fs.existsSync(LOG_FILE) ? JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8')) : [];
  logs.unshift({
    time: new Date().toISOString(),
    slug,
    title,
    success,
    url: success ? `${SITE_URL}/blog/${slug}/` : null,
  });
  if (logs.length > 100) logs.length = 100;
  fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
}

async function pingIndexNow(slug) {
  try {
    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: 'www.eggermath.com',
        key: INDEXNOW_KEY,
        urlList: [`${SITE_URL}/blog/${slug}/`],
      }),
    });
    console.log(`  IndexNow pinged for /blog/${slug}/`);
  } catch (e) {
    console.error('  IndexNow ping failed:', e.message);
  }
}

function regenerateSitemap() {
  try {
    execSync(`node "${SITEMAP_SCRIPT}"`, { cwd: PROJECT_ROOT, stdio: 'pipe' });
    console.log('  Sitemap regenerated');
  } catch (e) {
    console.error('  Sitemap regeneration failed:', e.message);
  }
}

function gitCommit(slug, title) {
  try {
    execSync('git add src/pages/blog/ reddit-blog-log.json reddit-blog-state.json', { cwd: PROJECT_ROOT, stdio: 'pipe' });
    const diff = execSync('git diff --cached --stat', { cwd: PROJECT_ROOT, encoding: 'utf-8' });
    if (!diff.trim()) {
      console.log('  No changes to commit');
      return;
    }
    execSync(`git commit -m "Blog: ${title.slice(0, 50)}"`, { cwd: PROJECT_ROOT, stdio: 'pipe' });
    execSync('git push origin main', { cwd: PROJECT_ROOT, stdio: 'pipe' });
    console.log('  Git committed and pushed');
  } catch (e) {
    console.error('  Git push failed:', e.message);
  }
}

async function run() {
  console.log('=== Reddit Blog Agent ===');
  console.log(`Time: ${new Date().toISOString()}`);

  console.log('\n[1/5] Finding best Reddit post...');
  const post = await findBestPost();
  if (!post) {
    console.log('No suitable post found. Exiting.');
    return;
  }
  console.log(`  Found: "${post.title}" (r/${post.subreddit}, ${post.score} pts, ${post.numComments} comments)`);

  console.log('\n[2/5] Generating blog post with AI...');
  const blogData = await generateBlogPost(post);
  if (!blogData) {
    console.log('  Blog generation failed. Exiting.');
    return;
  }
  console.log(`  Generated: "${blogData.title}"`);

  console.log('\n[3/5] Saving .astro file...');
  let slug = blogData.slug || slugify(blogData.title);
  const dateSuffix = new Date().toISOString().split('T')[0];
  slug = `${slug}-${dateSuffix}`;
  const astroContent = createAstroFile(blogData, post);
  const filePath = path.join(BLOG_DIR, `${slug}.astro`);
  fs.writeFileSync(filePath, astroContent);
  console.log(`  Saved: src/pages/blog/${slug}.astro`);

  console.log('\n[4/5] Regenerating sitemap...');
  regenerateSitemap();

  console.log('\n[5/5] IndexNow ping...');
  await pingIndexNow(slug);

  console.log('\n[6/6] Git commit and push...');
  gitCommit(slug, blogData.title);

  console.log('\n=== Done! ===');
  console.log(`Blog post: ${SITE_URL}/blog/${slug}/`);
  logRun(slug, blogData.title, true);
}

run().catch(e => {
  console.error('Agent failed:', e);
  logRun(null, e.message, false);
  process.exit(1);
});
