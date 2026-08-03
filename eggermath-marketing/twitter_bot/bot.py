"""
Twitter/X Bot for EggerMath
Automatically posts about free browser games
"""

import json
import random
import time
from datetime import datetime
from pathlib import Path

try:
    import tweepy
    HAS_TWEEPY = True
except ImportError:
    HAS_TWEEPY = False

try:
    import openai
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False

import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from config.settings import (
    TWITTER_API_KEY, TWITTER_API_SECRET,
    TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET,
    OPENAI_API_KEY, SITE_URL
)


# Pre-written tweet templates (used as fallback)
TWEET_TEMPLATES = [
    "🎮 Play \"{game}\" for free — no download needed!\n\n▶️ {url}\n\n#FreeGames #BrowserGames #Gaming",
    "🕹️ New game alert: {game}\n\nPlay instantly in your browser 👇\n{url}\n\n#OnlineGames #WebGames",
    "🎯 Today's pick: {game}\n\n✅ Free\n✅ No download\n✅ Play now\n\n{url}\n\n#GameRecommendation",
    "🔥 Trending now: {game}\n\n18,000+ free games at your fingertips:\n{url}\n\n#FreeGaming #BrowserGames",
    "💡 Bored? Play {game} — it's free!\n\nNo signup, no download, just play:\n{url}\n\n#GamingCommunity",
    "🏆 Top pick today: {game}\n\nOne click to play 👇\n{url}\n\n#IndieGames #FreeToPlay",
    "⭐ Staff favorite: {game}\n\nWorks on any device 📱💻\n\nTry it now: {url}\n\n#GameNight",
    "🎲 Random game for you: {game}\n\nDiscover 18,000+ free browser games:\n{url}\n\n#BrowserGames #FreeGames",
]

GAME_SUGGESTIONS = [
    "Stickman Fighting", "Pixel Run", "Space Shooter", "Puzzle Master",
    "Car Racing 3D", "Zombie Survival", "Tower Defense", "Soccer Stars",
    "Chess Online", "Basketball Stars", "Fruit Ninja", "Snake Classic",
    "Tetris Mania", "Mario Style Platformer", "Battle Royale",
    "Minecraft Builder", "Crossy Road", "Flappy Bird Style",
    "Tank War", "Archery Challenge", "Basketball Dunk", "Golf Master",
    "Fishing Game", "Cooking Mama Style", "Dance Battle",
]


def get_twitter_client():
    """Create Twitter API client"""
    if not HAS_TWEEPY:
        print("[TWITTER] tweepy not installed. Run: pip install tweepy")
        return None

    if not all([TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET]):
        print("[TWITTER] API keys not configured. Set environment variables.")
        return None

    client = tweepy.Client(
        consumer_key=TWITTER_API_KEY,
        consumer_secret=TWITTER_API_SECRET,
        access_token=TWITTER_ACCESS_TOKEN,
        access_token_secret=TWITTER_ACCESS_SECRET,
    )
    return client


def generate_tweet_with_ai():
    """Generate a tweet using OpenAI"""
    if not HAS_OPENAI or not OPENAI_API_KEY:
        return None

    client = openai.OpenAI(api_key=OPENAI_API_KEY)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a social media manager for EggerMath (https://www.eggermath.com), a free browser games website with 18000+ games. Write engaging tweets that drive clicks. Use emojis. Keep under 280 characters. Include hashtags."},
            {"role": "user", "content": "Write a tweet promoting a random browser game from our site. Make it fun and clickable."}
        ],
        temperature=0.8,
        max_tokens=150,
    )
    return response.choices[0].message.content


def generate_tweet():
    """Generate a tweet (AI or template)"""
    # Try AI first
    ai_tweet = generate_tweet_with_ai()
    if ai_tweet:
        return ai_tweet

    # Fallback to templates
    template = random.choice(TWEET_TEMPLATES)
    game = random.choice(GAME_SUGGESTIONS)
    return template.format(game=game, url=SITE_URL)


def post_tweet(client, tweet_text):
    """Post a tweet"""
    if not client:
        safe_text = tweet_text.encode('ascii', errors='replace').decode('ascii')
        print(f"[TWITTER] Would post: {safe_text}")
        return False

    try:
        response = client.create_tweet(text=tweet_text)
        print(f"[TWITTER] Posted tweet ID: {response.data['id']}")
        return True
    except Exception as e:
        print(f"[TWITTER] Error posting: {e}")
        return False


def run():
    """Main bot run"""
    print(f"[TWITTER] Starting at {datetime.now()}")

    client = get_twitter_client()
    tweet = generate_tweet()
    post_tweet(client, tweet)

    # Log the post
    log_path = Path(__file__).parent / "tweet_log.jsonl"
    with open(log_path, "a", encoding="utf-8", errors="replace") as f:
        f.write(json.dumps({
            "timestamp": datetime.now().isoformat(),
            "tweet": tweet,
            "posted": client is not None
        }, ensure_ascii=False) + "\n")

    return tweet


if __name__ == "__main__":
    run()
