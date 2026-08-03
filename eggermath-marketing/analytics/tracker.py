"""
Traffic Analytics Tracker for EggerMath
Tracks website traffic, rankings, and performance
"""

import json
import sqlite3
import hashlib
from datetime import datetime, timedelta
from pathlib import Path

import requests

import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from config.settings import SITE_URL, ANALYTICS_DB, GA_PROPERTY_ID


def init_db():
    """Initialize SQLite database for analytics"""
    conn = sqlite3.connect(str(ANALYTICS_DB))
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS daily_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT UNIQUE,
            pageviews INTEGER,
            unique_visitors INTEGER,
            bounce_rate REAL,
            avg_session_duration REAL,
            top_pages TEXT,
            traffic_sources TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS seo_rankings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            keyword TEXT,
            position INTEGER,
            url TEXT,
            change INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS social_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            platform TEXT,
            posts INTEGER,
            impressions INTEGER,
            engagements INTEGER,
            clicks INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS competitor_tracking (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            competitor TEXT,
            estimated_traffic INTEGER,
            keywords_ranking INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    return conn


def fetch_traffic_data():
    """Fetch traffic data (simulated or from API)"""
    # In production, connect to Google Analytics API or Plausible/Fathom
    # For now, we'll scrape basic metrics

    print("[ANALYTICS] Fetching traffic data...")

    try:
        response = requests.get(SITE_URL, timeout=10)
        status = response.status_code
        load_time = response.elapsed.total_seconds()
    except Exception as e:
        print(f"[ANALYTICS] Error fetching site: {e}")
        status = 0
        load_time = 0

    return {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "status": status,
        "load_time": load_time,
        "pageviews": 0,  # Would come from analytics API
        "unique_visitors": 0,
        "bounce_rate": 0,
        "avg_session_duration": 0,
    }


def check_keyword_rankings():
    """Check keyword rankings using search (simulated)"""
    keywords = [
        "free browser games",
        "online games no download",
        "unblocked games",
        "play games online free",
        "browser games 2026",
    ]

    rankings = []
    for keyword in keywords:
        # In production, use SEMrush, Ahrefs, or Google Search Console API
        rankings.append({
            "keyword": keyword,
            "position": 0,  # Would be real ranking
            "change": 0,
        })

    return rankings


def check_competitors():
    """Track competitor sites"""
    competitors = [
        {"name": "CrazyGames", "url": "https://www.crazygames.com"},
        {"name": "Poki", "url": "https://poki.com"},
        {"name": "Kongregate", "url": "https://www.kongregate.com"},
        {"name": "Newgrounds", "url": "https://www.newgrounds.com"},
    ]

    results = []
    for comp in competitors:
        try:
            resp = requests.get(comp["url"], timeout=10)
            results.append({
                "name": comp["name"],
                "status": resp.status_code,
                "response_time": resp.elapsed.total_seconds(),
            })
        except Exception:
            results.append({"name": comp["name"], "status": 0, "response_time": 0})

    return results


def generate_report(conn, traffic_data, rankings, competitors):
    """Generate analytics report"""
    date = datetime.now().strftime("%Y-%m-%d")

    report = f"""
# EggerMath Analytics Report - {date}

## Website Status
- Status: {'ONLINE' if traffic_data['status'] == 200 else 'DOWN'}
- Load Time: {traffic_data['load_time']:.2f}s
- Pageviews: {traffic_data['pageviews']}

## Keyword Rankings
"""
    for r in rankings:
        arrow = "UP" if r["change"] > 0 else "DOWN" if r["change"] < 0 else "SAME"
        report += f"- {r['keyword']}: #{r['position']} ({arrow} {abs(r['change'])})\n"

    report += "\n## Competitor Status\n"
    for c in competitors:
        status = "OK" if c["status"] == 200 else "WARN"
        report += f"- [{status}] {c['name']}: {c['response_time']:.2f}s\n"

    # Save report
    report_path = Path(__file__).parent / "reports" / f"{date}.md"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(report, encoding="utf-8")
    print(f"[ANALYTICS] Report saved: {report_path}")

    return report


def save_to_db(conn, traffic_data, rankings):
    """Save analytics data to database"""
    c = conn.cursor()

    try:
        c.execute("""
            INSERT OR REPLACE INTO daily_stats (date, pageviews, unique_visitors, bounce_rate, avg_session_duration)
            VALUES (?, ?, ?, ?, ?)
        """, (
            traffic_data["date"],
            traffic_data["pageviews"],
            traffic_data["unique_visitors"],
            traffic_data["bounce_rate"],
            traffic_data["avg_session_duration"],
        ))

        for r in rankings:
            c.execute("""
                INSERT INTO seo_rankings (date, keyword, position, change)
                VALUES (?, ?, ?, ?)
            """, (traffic_data["date"], r["keyword"], r["position"], r["change"]))

        conn.commit()
    except Exception as e:
        print(f"[ANALYTICS] DB error: {e}")


def run():
    """Main analytics run"""
    print(f"[ANALYTICS] Starting at {datetime.now()}")

    conn = init_db()
    traffic = fetch_traffic_data()
    rankings = check_keyword_rankings()
    competitors = check_competitors()

    report = generate_report(conn, traffic, rankings, competitors)
    save_to_db(conn, traffic, rankings)

    conn.close()
    return report


if __name__ == "__main__":
    run()
