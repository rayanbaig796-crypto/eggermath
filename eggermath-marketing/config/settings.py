import os
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent

# Website
SITE_URL = "https://www.eggermath.com"
SITE_NAME = "EggerMath"

# Twitter/X API (get from https://developer.twitter.com)
TWITTER_API_KEY = os.getenv("TWITTER_API_KEY", "")
TWITTER_API_SECRET = os.getenv("TWITTER_API_SECRET", "")
TWITTER_ACCESS_TOKEN = os.getenv("TWITTER_ACCESS_TOKEN", "")
TWITTER_ACCESS_SECRET = os.getenv("TWITTER_ACCESS_SECRET", "")

# OpenAI API (for content generation)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Analytics
GA_PROPERTY_ID = os.getenv("GA_PROPERTY_ID", "")  # Google Analytics
ANALYTICS_DB = BASE_DIR / "analytics" / "traffic.db"

# SEO Blog
BLOG_OUTPUT_DIR = BASE_DIR / "seo-generator" / "posts"
KEYWORDS_FILE = BASE_DIR / "config" / "keywords.txt"

# Schedule (hours)
TWITTER_POST_INTERVAL = 24  # posts once per day
BLOG_POST_INTERVAL = 72  # posts every 3 days
ANALYTICS_CHECK_INTERVAL = 6  # checks every 6 hours
