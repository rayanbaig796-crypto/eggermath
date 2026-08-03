"""
EggerMath Marketing Automation Scheduler
Runs all marketing tasks on a schedule
"""

import schedule
import time
from datetime import datetime
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).parent))

from seo_generator.generator import run as generate_blog
from twitter_bot.bot import run as post_tweet
from analytics.tracker import run as track_analytics
from config.settings import (
    TWITTER_POST_INTERVAL,
    BLOG_POST_INTERVAL,
    ANALYTICS_CHECK_INTERVAL,
)


def run_seo_task():
    """Generate a blog post"""
    print(f"\n{'='*50}")
    print(f"[{datetime.now()}] Running SEO Blog Generator")
    print('='*50)
    try:
        generate_blog()
    except Exception as e:
        print(f"[ERROR] SEO task failed: {e}")


def run_twitter_task():
    """Post a tweet"""
    print(f"\n{'='*50}")
    print(f"[{datetime.now()}] Running Twitter Bot")
    print('='*50)
    try:
        post_tweet()
    except Exception as e:
        print(f"[ERROR] Twitter task failed: {e}")


def run_analytics_task():
    """Check analytics"""
    print(f"\n{'='*50}")
    print(f"[{datetime.now()}] Running Analytics Tracker")
    print('='*50)
    try:
        track_analytics()
    except Exception as e:
        print(f"[ERROR] Analytics task failed: {e}")


def run_all():
    """Run all tasks once (for testing)"""
    print(f"\n{'='*50}")
    print(f"[{datetime.now()}] Running ALL tasks")
    print('='*50)
    run_seo_task()
    run_twitter_task()
    run_analytics_task()


def start_scheduler():
    """Start the scheduler"""
    print(f"""
╔══════════════════════════════════════════════════════════╗
║         EggerMath Marketing Automation System           ║
║                                                         ║
║  SEO Blog:   Every {BLOG_POST_INTERVAL} hours                          ║
║  Twitter:    Every {TWITTER_POST_INTERVAL} hours                           ║
║  Analytics:  Every {ANALYTICS_CHECK_INTERVAL} hours                          ║
║                                                         ║
║  Press Ctrl+C to stop                                   ║
╚══════════════════════════════════════════════════════════╝
    """)

    # Schedule tasks
    schedule.every(BLOG_POST_INTERVAL).hours.do(run_seo_task)
    schedule.every(TWITTER_POST_INTERVAL).hours.do(run_twitter_task)
    schedule.every(ANALYTICS_CHECK_INTERVAL).hours.do(run_analytics_task)

    # Run once immediately on start
    print("[SCHEDULER] Running initial tasks...")
    run_all()

    # Keep running
    while True:
        schedule.run_pending()
        time.sleep(60)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="EggerMath Marketing Automation")
    parser.add_argument("--once", action="store_true", help="Run all tasks once and exit")
    parser.add_argument("--seo", action="store_true", help="Run SEO task only")
    parser.add_argument("--twitter", action="store_true", help="Run Twitter task only")
    parser.add_argument("--analytics", action="store_true", help="Run analytics only")
    args = parser.parse_args()

    if args.once:
        run_all()
    elif args.seo:
        run_seo_task()
    elif args.twitter:
        run_twitter_task()
    elif args.analytics:
        run_analytics_task()
    else:
        start_scheduler()
