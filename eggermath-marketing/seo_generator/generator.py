"""
SEO Blog Post Generator for EggerMath
Generates optimized blog posts about browser games
"""

import json
import random
import hashlib
from datetime import datetime
from pathlib import Path

try:
    import openai
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False

import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from config.settings import OPENAI_API_KEY, BLOG_OUTPUT_DIR, KEYWORDS_FILE, SITE_URL


# Game categories and their typical keywords
GAME_CATEGORIES = {
    "puzzle": ["puzzle games", "brain teasers", "logic games", "thinking games", "mind games"],
    "action": ["action games", "fighting games", "shooting games", "adventure games"],
    "racing": ["racing games", "driving games", "car games", "speed games"],
    "platformer": ["platformer games", "jumping games", "side-scroller", "retro platformer"],
    "io": ["io games", "multiplayer online", "competitive games", "arena games"],
    "sandbox": ["sandbox games", "creative games", "building games", "open world games"],
}

BLOG_TEMPLATES = [
    "Top 10 {keyword} to Play in {year} — No Download Required",
    "Best Free {keyword} Online — Play Instantly on {site}",
    "{keyword}: The Ultimate Guide to Playing in Your Browser",
    "Why {keyword} Are More Popular Than Ever in {year}",
    "{keyword} vs Mobile Games: Why Browser Wins",
    "How to Play {keyword} at School (Unblocked & Free)",
    "The Evolution of {keyword}: From Flash to HTML5",
    "5 {keyword} You Haven't Tried Yet",
    "Daily Picks: Today's Best {keyword} on {site}",
    "{keyword} for Every Mood: Our Complete Guide",
]


def load_keywords():
    """Load target keywords from config file"""
    if KEYWORDS_FILE.exists():
        return [k.strip() for k in KEYWORDS_FILE.read_text().splitlines() if k.strip()]
    return list(GAME_CATEGORIES.keys())


def generate_blog_title(keyword):
    """Generate an SEO-optimized blog title"""
    template = random.choice(BLOG_TEMPLATES)
    year = datetime.now().year
    return template.format(keyword=keyword.title(), year=year, site="EggerMath")


def generate_blog_content(title, keyword):
    """Generate blog post content using OpenAI or fallback template"""
    if HAS_OPENAI and OPENAI_API_KEY:
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an SEO content writer for a free browser games website called EggerMath. Write engaging, keyword-rich blog posts that rank well on Google. Include internal links to https://www.eggermath.com. Use HTML formatting."},
                {"role": "user", "content": f"""Write a 1000-word blog post titled: {title}

Target keyword: {keyword}
Website: https://www.eggermath.com

Requirements:
- Include the keyword naturally 5-8 times
- Add subheadings (H2, H3)
- Include a meta description
- Add internal links to the homepage
- Write in a fun, casual tone
- End with a CTA to play games on EggerMath
- Include FAQ section with schema markup

Return as JSON:
{{
  "title": "...",
  "meta_description": "...",
  "content": "HTML content...",
  "tags": ["tag1", "tag2"],
  "slug": "url-slug"
}}"""}
            ],
            temperature=0.7,
        )
        return json.loads(response.choices[0].message.content)
    else:
        return generate_fallback_content(title, keyword)


def generate_fallback_content(title, keyword):
    """Generate content without AI (template-based)"""
    slug = keyword.lower().replace(" ", "-")
    year = datetime.now().year

    content = f"""
    <article itemscope itemtype="https://schema.org/Article">
        <meta itemprop="headline" content="{title}">
        <meta itemprop="description" content="Discover the best {keyword} to play for free on EggerMath. No downloads, no installs — just click and play!">

        <h1>{title}</h1>

        <p>Looking for the best {keyword}? <a href="{SITE_URL}">EggerMath</a> has over 8,000 free browser games you can play instantly — no download required.</p>

        <h2>Why Play {keyword.title()} on EggerMath?</h2>
        <ul>
            <li>✅ Instant play — no downloads or signups</li>
            <li>✅ Works on any device with a browser</li>
            <li>✅ New games added daily</li>
            <li>✅ 100% free, always</li>
        </ul>

        <h2>How to Get Started</h2>
        <p>Simply visit <a href="{SITE_URL}">{SITE_URL}</a>, browse our collection of {keyword}, and click to play. It's that easy!</p>

        <h2>Top Features of Our {keyword.title()} Collection</h2>
        <p>We curate only the best {keyword} from top developers. Each game is tested to ensure it runs smoothly in your browser.</p>

        <h2>Play {keyword.title()} Anywhere</h2>
        <p>Whether you're at school, work, or home, our {keyword} work on desktop, tablet, and mobile browsers.</p>

        <section itemscope itemtype="https://schema.org/FAQPage">
            <h2>Frequently Asked Questions</h2>

            <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
                <h3 itemprop="name">Are these {keyword} really free?</h3>
                <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
                    <p itemprop="text">Yes! All games on EggerMath are completely free to play.</p>
                </div>
            </div>

            <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
                <h3 itemprop="name">Do I need to download anything?</h3>
                <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
                    <p itemprop="text">No downloads needed. All games run directly in your browser.</p>
                </div>
            </div>
        </section>

        <p><strong>Ready to play?</strong> <a href="{SITE_URL}#games">Start playing {keyword} now on EggerMath!</a></p>
    </article>
    """

    return {
        "title": title,
        "meta_description": f"Discover the best {keyword} to play for free on EggerMath. No downloads required — play instantly in your browser!",
        "content": content,
        "tags": [keyword, "free games", "browser games", "online games"],
        "slug": slug,
    }


def save_blog_post(post_data):
    """Save generated blog post to file"""
    BLOG_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    date_str = datetime.now().strftime("%Y-%m-%d")
    filename = f"{date_str}-{post_data['slug']}.html"
    filepath = BLOG_OUTPUT_DIR / filename

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{post_data['title']} | EggerMath Blog</title>
    <meta name="description" content="{post_data['meta_description']}">
    <meta name="keywords" content="{', '.join(post_data.get('tags', []))}">
    <link rel="canonical" href="{SITE_URL}/blog/{post_data['slug']}">
</head>
<body>
    <header>
        <nav>
            <a href="{SITE_URL}">EggerMath</a> | <a href="{SITE_URL}/blog.html">Blog</a>
        </nav>
    </header>

    <main>
        {post_data['content']}
    </main>

    <footer>
        <p>&copy; {datetime.now().year} <a href="{SITE_URL}">EggerMath</a> — Free Browser Games</p>
    </footer>
</body>
</html>"""

    filepath.write_text(html, encoding="utf-8")
    print(f"[SEO] Blog post saved: {filepath}")
    return filepath


def run():
    """Generate a blog post"""
    keywords = load_keywords()
    keyword = random.choice(keywords)
    title = generate_blog_title(keyword)

    print(f"[SEO] Generating post for: {keyword}")
    print(f"[SEO] Title: {title}")

    post_data = generate_blog_content(title, keyword)
    filepath = save_blog_post(post_data)

    return filepath


if __name__ == "__main__":
    run()
