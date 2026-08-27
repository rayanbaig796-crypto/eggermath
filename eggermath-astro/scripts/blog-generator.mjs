import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { groqChat } from './groq-client.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GAMES_PATH = path.join(__dirname, '..', 'src', 'data', 'games.js');
const BLOG_DIR = path.join(__dirname, '..', 'src', 'pages', 'blog');

function getGameLinks() {
  const content = fs.readFileSync(GAMES_PATH, 'utf-8');
  const games = [];
  for (const block of content.split(/\},\s*\{/)) {
    const s = block.match(/slug:\s*['"]([^'"]+)['"]/);
    const t = block.match(/title:\s*['"]([^'"]+)['"]/);
    if (s && t) games.push({ slug: s[1], title: t[1] });
  }
  return games;
}

export function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

export async function generateBlogPost(post) {
  const games = getGameLinks();
  const gameList = games.slice(0, 20).map(g => `${g.title}: /${g.slug}/`).join('\n');

  const commentsText = (post.topComments || [])
    .slice(0, 10)
    .map(c => `[${c.score} points] ${c.author}: ${c.body.slice(0, 200)}`)
    .join('\n');

  const prompt = `You are a retro gaming blogger for EggerMath.com (a free browser-based GBA/GBC/GB emulator).

Create a blog post from this Reddit post:

SUBREDDIT: r/${post.subreddit}
TITLE: ${post.title}
SCORE: ${post.score} upvotes
COMMENTS: ${post.numComments}
URL: ${post.url}
IMAGE: ${post.imageUrl || 'None'}
AUTHOR: u/${post.author}

REDDIT COMMENTS:
${commentsText}

EXISTING GAMES ON EGGERMATH (link to these when relevant):
${gameList}

RULES:
1. Write 800-1200 words
2. Use the Reddit discussion as inspiration, but write ORIGINAL content
3. Add your own analysis, tips, and recommendations
4. Link to 2-3 game pages on EggerMath where relevant
5. Include a "Play Now" CTA at the end
6. Make it SEO-friendly (include keywords people would search for)
7. Reference the Reddit discussion naturally (quote users if relevant)
8. Do NOT copy the Reddit post - create unique content

OUTPUT FORMAT (exact JSON):
{
  "title": "Blog post title (SEO optimized, max 60 chars)",
  "slug": "url-friendly-slug",
  "description": "Meta description (max 160 chars)",
  "category": "Guides|Lists|Discussion|News|Opinion",
  "content": "Full HTML blog post content (use <h2>, <p>, <ul>, <ol>, <blockquote>, <img> tags)",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "gameLinks": [{"slug": "game-slug", "text": "anchor text"}]
}`;

  const response = await groqChat([
    { role: 'system', content: 'You are a professional retro gaming blogger. Output only valid JSON, no markdown fences.' },
    { role: 'user', content: prompt },
  ], { model: 'openai/gpt-oss-120b', temperature: 0.7, max_tokens: 3000 });

  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('Failed to parse AI response:', response.slice(0, 200));
    return null;
  }
}

export function createAstroFile(blogData, post) {
  const date = getToday();
  const imageUrl = post.imageUrl || '';
  const imageHtml = imageUrl
    ? `<img src="${imageUrl}" alt="${blogData.title}" style="width:100%;border-radius:12px;margin-bottom:24px" loading="lazy" />\n  <p style="color:#555;font-size:12px;margin-top:-16px;margin-bottom:24px">Image from <a href="${post.url}" style="color:#c4a35a" target="_blank">r/${post.subreddit}</a></p>`
    : '';

  const relatedLinks = (blogData.gameLinks || []).slice(0, 3).map(g =>
    `<li><a href="/${g.slug}/" style="color:#c4a35a;text-decoration:none">${g.text}</a></li>`
  ).join('\n      ');

  return `---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { SITE } from '../../data/games.js';

const jsonLd = {"@context":"https://schema.org","@type":"BlogPosting","headline":"${blogData.title.replace(/"/g, '\\"')}","description":"${blogData.description.replace(/"/g, '\\"')}","datePublished":"${date}","author":{"@type":"Organization","name":"EggerMath"},"publisher":{"@type":"Organization","name":"EggerMath","url":"https://www.eggermath.com"},"image":"${imageUrl}"};
---
<BaseLayout title="${blogData.title} | EggerMath Blog" description="${blogData.description}" jsonLd={jsonLd}>
<main style="max-width:800px;margin:0 auto;padding:24px">
  <a href="/blog/" style="color:#c4a35a;text-decoration:none;font-size:14px">← Back to Blog</a>
  <span style="color:#555;font-size:12px;margin-left:12px">${date}</span>
  <span style="color:#c4a35a;font-size:12px;margin-left:8px;text-transform:uppercase">${blogData.category}</span>

  <h1 style="font-size:2rem;margin:16px 0 8px">${blogData.title}</h1>
  <p style="color:#aaa;margin-bottom:24px">${blogData.description}</p>

  ${imageHtml}

  <article style="color:#ccc;line-height:1.8">
    ${blogData.content}
  </article>

  <div style="margin-top:32px;padding:20px;background:#111;border:1px solid #1e1e22;border-radius:12px">
    <h2 style="font-size:1.1rem;margin-bottom:8px">Play Now on EggerMath</h2>
    <p style="color:#aaa;font-size:14px;margin-bottom:12px">Play retro games free in your browser. No download required.</p>
    <a href="/" style="color:#c4a35a;text-decoration:none;font-weight:700">Browse All Games →</a>
  </div>

  ${relatedLinks ? `<div style="margin-top:32px">
    <h2 style="font-size:1.1rem;margin-bottom:8px">Related Games</h2>
    <ul style="padding-left:20px">
      ${relatedLinks}
    </ul>
  </div>` : ''}
</main>
</BaseLayout>`;
}
