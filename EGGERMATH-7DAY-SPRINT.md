# EggerMath — 100+ Daily Visitors in 7 Days
## Integrated Strategy: Consulting Framework × Claude SEO

**Site:** https://www.eggermath.com (Astro, Cloudflare Pages, `www` canonical)
**GA:** G-44ZYW1XML3 | **Stack:** mGBA WASM, MEGA CDN, 52 games (28 GBA / 8 GBC / 16 GB), 11 langs (en + pt-BR/es/ja/de/fr/ru/ko/it/id/ar), 651 pages, 14 sitemaps
**Goal:** 700+ sessions in next 7 days (100+/day active users), sustainable organic baseline by Day 7.

---

## 1) Situation Assessment [skill: situation-assessment]

**Executive Read:** EggerMath is technically launch-ready (650 indexed pages, professional sitemap with images+hreflang+x-default, GA live, mobile-responsive, COOP/COEP headers) but has 0 distribution. The site is a product without a go-to-market engine. SEO foundation is strong; demand capture is weak; activation loop is missing.

| Area | Evidence | Interpretation | Confidence |
|---|---|---|---|
| **Performance** | 651 pages built in 8.75s, 0 empty `img`, 100% sitemap coverage (verified via webfetch), build passes | Product surface area exists; no orphan pages | High |
| **Market** | Competitors: retrogames.cc, emulatorgames.net, retrogames.cc (DA 70+), thousands of "play pokemon emerald online" searches/mo | High-intent, low-trust niche; white space = instant-play + multi-GB+GBC+GBA + 11-lang + no ads | High |
| **Customers** | 52 games cover 9 genres; keywords scraped for 12 geos (BR is #1 with 200+ terms); no Reddit/Discord push yet | Supply matches demand but no channel to reach it | High |
| **Operations** | Cloudflare unlimited bandwidth, 500 builds/mo, 25MB limit respected; MEGA folder live; `robots.txt` allows GPTBot/ClaudeBot/PerplexityBot | Infrastructure not a constraint | High |
| **Org** | Solo founder (non-coder), handles DNS manually, no YouTube Shorts, Playwright for verification | Execution constraint = bandwidth, not skill | High |

**Momentum:** Flat (pre-launch). **Implication:** Need distribution-led growth first, SEO compounds second.

---

## 2) Growth Barrier Diagnosis [skill: growth-barriers]

**Growth equation:** `Sessions = Reach × CTR × Indexation% × Retention`

| Driver | Evidence | Impact | Root Cause |
|---|---|---|---|
| Acquisition (Reach) | No backlinks, no community posts active, only 1 GitHub backlink (DA99 pending crawl) | CRITICAL | No distribution system |
| Activation (CTR) | Beautiful cards but no programmatic title/H1 keyword dominance; OG image is generic `og-image.svg` | HIGH | Content not snippet-optimized |
| Conversion (Play) | mGBA requires COOP/COEP, rename cache-bust fixes done; emulator loads 240×160 | LOW | Solved |
| Retention | `Continue Playing` now navigates to dedicated page (fixed `63d20a3`), localStorage + IndexedDB save states | LOW | Solved |
| Indexation | Sitemap 650 URLs but Google GSC not submitted? IndexNow not configured → indexing lag 2-14 days | HIGH | Missing acceleration layer |

**Binding Constraint:** **Reach × Indexation Velocity.** The 650 pages will not self-traffic without forced discovery. Fix: Parallel distribution (days 1-3) + forced indexing (IndexNow + GSC + Bing) + passage citability for AI Overviews.

---

## 3) Market & Customer [skills: market-mapping, customer-segmentation, competitive-intel]

**Market boundary:** Browser-playable retro games (no download). TAM ~ 4M monthly searches globally for "gba emulator + play pokemon online" cluster; SAM (English + pt-BR + es) ~1.2M; SOM (long-tail 52 games × 11 langs) ~180k/mo if ranked p15.

**Segments (MECE):**

| Segment | Traits | Needs | Priority |
|---|---|---|---|
| **S1 Nostalgia Rush (26-38, EN/BR)** | Played GBA as kid, no hardware now | Instant play, save states, mobile | **P1** |
| **S2 Kids / Chromebook** | School unblocked, no install rights | Unblocked, works on weak device, fast | **P1** |
| **S3 Mobile-First (BR/IN/ID)** | Android, wants Pokemon on phone | Touch controls, pt-BR/es/id, offline after load | **P1** |
| **S4 Speedrunners / Collectors** | Wants FF (fast-forward), saves, ROM upload | FF ×4, 10 slots, ROM drop | P2 |
| **S5 AI-Crawler Curious** | Asks ChatGPT "best gba emulator online" | GEO-citable answer blocks, Reddit mentions | P2 |

**Competitive Intel:** retrogames.cc = thin content + ads + no multi-lang; emulatorgames.net = download wall; white space = **clean WASM + 52 instant-play + 11-lang titles/descs + save states + no ads**. Price is free → compete on UX + i18n.

---

## 4) Strategic Options [skill: strategic-options]

| Option | Logic | Trade-off | Verdict |
|---|---|---|---|
| A. SEO-Purist (wait for ranking) | Build content, wait 3-6mo | Too slow for 7-day 100/day | KILL |
| B. Distribution blitz only | Reddit/PH/X spam | Un-sustainable, no compounding | KILL |
| **C. Hybrid Sprint (chosen): Distribution → Forced Indexing → Compounding** | Days 1-3 distribution for immediate 100/day; Days 2-7 accelerate indexation; content is already there to capture | Requires daily execution | **GO** |

**Answer-first recommendation:** Execute **C**. Target: 60% traffic from distribution (Reddit/PH/X/Quora/Discord) Days 1-4, 40% from indexed long-tail + AI citations by Day 7.

---

## 5) Initiative Prioritization [skill: initiative-prioritizer]

**Criteria:** Impact (0-10) × Feasibility (0-10), weighted by strategic fit.

| Initiative | Impact | Feas | Priority | Rationale | Owner |
|---|---|---|---|---|---|
| **A1 IndexNow + Bing + GSC submit (all 14 sitemaps)** | 10 | 9 | **P0** | Unblocks 650 URLs in hours, not weeks | You |
| **A2 Reddit r/Emulation + r/Pokemon + r/Gameboy (3 posts, staggered)** | 9 | 9 | **P0** | 100-500 clicks/post, strongest AI-mention correlator (skill: seo-geo) | You (manual) |
| **A3 Product Hunt launch (Games category, Thu/Fri)** | 9 | 8 | **P0** | DA92 backlink + 200-600 day-1 visitors | You |
| **A4 X + Hacker News + Indie Hackers posts (emulator tech angle)** | 8 | 9 | **P0** | Tech audience loves WASM; mGBA story | You |
| **B1 Rewrite 15 top game pages: 134-167w citable answer block (first 30%) + FAQ schema** | 9 | 7 | **P0** | GEO citability → AI Overviews/ChatGPT | Agent (code) |
| **B2 OG images per game (1200×630) replacing generic svg** | 8 | 7 | **P1** | CTR + social + image sitemap | Agent |
| **B3 Internal linking: related-games mesh + faq/game cross-links + sitemap home hreflang** | 8 | 8 | **P1** | Already done: sitemap x-default + hreflang; extend to body links | Agent |
| **C1 Quora + YouTube comments + Discord (10 servers) distribution** | 7 | 9 | **P1** | Long-tail capture, zero cost | You |
| **C2 Backlink kit: 1 GitHub (live) + 5 profile + 3 blog comments** | 6 | 9 | **P1** | DA stacking | Agent+You |
| **D1 Programmatic cluster: /genre/{rpg/platformer} + /system/{gba/gbc/gb} (220 URLs future)** | 5 | 4 | KILL (week 2) | Big SEO but >7 days | — |

**Kill List:** Genre/system cluster pages, YouTube Shorts (you asked to skip), paid ads.

---

## 6) 7-Day Transformation Roadmap [skill: transformation-roadmap]

### Workstreams

| WS | Objective | Depends On |
|---|---|---|
| WS1 Indexation Acceleration | 650 URLs indexed/crawled in 48h | GSC verified |
| WS2 Distribution Blitz | 300+ sessions Day 1-3 | WS1 live |
| WS3 GEO & Content Citability | AI-search visibility by Day 5 | WS2 assets |
| WS4 Conversion & Retention | Play rate + save rate + return | WS2 traffic |

### Daily Plan

| Day | Major Actions | Milestone | Time |
|---|---|---|---|
| **D1 Mon** | 1. Verify GSC + Bing WMT, submit `sitemap.xml` (14). 2. Add IndexNow key + Cloudflare deployment. 3. Add `llms.txt` + allow AI bots (already done). 4. Reddit r/Emulation post (use folder link you handle). 5. Post to X (WASM thread) + Indie Hackers. | GSC submitted, 1 Reddit live, X live | 3h |
| **D2 Tue** | 1. Product Hunt launch (schedule 00:01 PST). 2. Implement B1: rewrite top 10 games (Pokemon Emerald, FireRed, Zelda Minish, Mario Advance, Crystal, Gold, Tetris GB, Kirby Dream Land, Shantae, Golden Sun) with 150w citable block at top. 3. Submit updated sitemap to GSC + IndexNow. | PH live, 10 pages GEO-optimized | 4h |
| **D3 Wed** | 1. Quora: answer 5 "play pokemon emerald online" questions with link. 2. Discord: post in 5 gaming servers. 3. Hacker News "Show HN: mGBA in WASM" (technical angle). 4. B2: generate per-game OG images (first 10). | 5 Quora + HN live | 3h |
| **D4 Thu** | 1. Check GSC indexation → request indexing for top 20 URLs manually. 2. B1: next 10 games (remaining GBC/GB). 3. You handle YouTube if chosen. 4. Measure: GA4 Realtime should show 80+ users. | 20/52 games requested, 20 geo-blocks | 3h |
| **D5 Fri** | 1. Backlinks: 3 blog comments on emulator blogs + 2 profile links (Medium/Dev.to repost PH story). 2. Internal linking audit via `/seo audit` run locally. 3. Fix any GSC errors. | 5 new backlinks | 2h |
| **D6 Sat** | 1. Double down on winner channel (highest Referral in GA4). 2. Post follow-up in winning Reddit thread. 3. Add FAQ schema to remaining pillar pages (`best-gba-games` etc.) Already have FAQPage but add QAPage for UGC? | Winner channel scaled | 2h |
| **D7 Sun** | 1. Weekly review: GA4 + GSC + Bing. 2. Decide: scale to genre pages (week 2) or double distribution. 3. Baseline organic should be 30-50/day by now; distribution fills to 100+. | Retro + Week 2 plan | 1h |

**First 90 mins today:** GSC verification + IndexNow + Reddit draft.

---

## 7) KPI Architecture [skill: kpi-architect]

**Strategic objective:** 100 DAU (active = played ≥1 game) within 7 days, with compounding organic base.

| KPI | Type | Decision It Supports | Owner | Threshold (Day 7) | Cadence |
|---|---|---|---|---|---|
| **Active Users (GA4)** | Lagging | Did we hit 100/day? | You | ≥100/day, ≥700 week | Daily 21:00 |
| **Indexed Pages (GSC)** | Leading | Is WS1 working? | You | ≥200/650 indexed | Daily |
| **Referral Sessions** | Leading | Which distribution works? | You | Reddit ≥150, PH ≥150 week | Daily |
| **AI Citations (manual: ask ChatGPT/Perplexity "best gba emulator")** | Leading | Is GEO working? | You | ≥1 AI mention | D5, D7 |
| **Play Conversion (plays / sessions)** | Driver | Does UX convert? | You | ≥40% | Daily |
| **Save Rate (Save clicks / plays)** | Driver | Retention loop health | You | ≥15% | Daily |

**Driver tree:** `100 DAU = 250 sessions × 40% play × 100% return` → Need 250 sessions/day. Distribution gives 150; organic gives 100 by D7.

**Metrics to REMOVE:** Bounce rate (vanity), total pageviews (inflated by 650 pages), DA (lags).

**Review:** Daily 10-min standup: GA4 Realtime + GSC + Referral table. Escalate if indexed <50 by D3 → re-submit via IndexNow + Bing WMT.

---

## 8) Integrated SEO Execution Layer (Claude SEO skills fused with consulting)

### 8.1 Technical [skill: seo-technical]
- Sitemap: DONE — 14 sitemaps, images, hreflang, `x-default`, `lastmod`, priority 1.0→0.2, `changefreq` tuned.
- Robots: DONE — `Allow: /`, `Disallow: /gba-emulator-web/roms/`, sitemap single ref, allows GPTBot/ClaudeBot.
- Headers: VERIFY `_headers` has COOP/COEP stripping for `*.js`/`*.wasm` (WASM needs `Cross-Origin-Embedder-Policy: require-corp` + `Cross-Origin-Opener-Policy: same-origin`; JS/WASM responses must strip). Already done per lessons.
- Next: Add `llms.txt` at root (see build artifacts below) + IndexNow key.
- Perf: Astro static + Cloudflare edge + WASM lazy-load. Check LCP via CrUX Tier0 (no key needed: `seo-google`).

### 8.2 Content & E-E-A-T [skill: seo-content]
- Who/How/Why: Add `Author: EggerMath Team` byline + `About` link on every game page footer (done), disclose WASM/mGBA process.
- Floors: Homepage 500w (OK), game pages ~300-400w → bump top 20 to 500w via citable block (B1).
- GEO pass: Front-load 150w answer block starting `"Play {Title} Online is..."` — self-contained, attributed, stats.

### 8.3 Schema [skill: seo-schema]
- Keep: `VideoGame + BreadcrumbList + FAQPage` on game pages. Drop deprecated `HowTo` (retired Sept 2023 per skill) — keep only if non-Google benefit; instead add `QAPage` for FAQ section where user Q&A exists.
- Add: `Organization` + `WebSite` with `sameAs` to GitHub `gba-wasm-web` repo (DA99), Reddit post.

### 8.4 Sitemap & Programmatic [skill: seo-sitemap, seo-programmatic]
- Current 650 is complete. Future (week 2): add `public/wordlists` style programmatic for cheats/walkthroughs only if GEO-validated.

### 8.5 GEO / AI Search [skill: seo-geo]
- Passages: 134-167w, first 30% of page. Add `llms.txt` at `/.well-known/llms.txt` + root `/llms.txt`.
- Brand mentions > backlinks: Prioritize Reddit/YouTube mentions (0.737 corr per skill) over DR.
- Do not: `llms.txt` as citation lever myth — still add for agent hygiene, but don't expect ranking boost.

### 8.6 Backlinks [skill: seo-backlinks]
- Existing: GitHub `gba-wasm-web` (DA99) — push more commits to trigger crawl.
- Week1: 3 blog comments (retro blogs), 2 profiles (Medium repost, Dev.to), PH backlink (DA92), Indie Hackers.

### 8.7 Hreflang [skill: seo-hreflang]
- DONE: `hreflangHtml` in BaseLayout + sitemap `xhtml:link` with `x-default`. Validate via `seo-hreflang` audit — return tags already full mesh in sitemap.

### 8.8 Images & Performance [skill: seo-images, seo-performance]
- All 52 `img` use `cache.downloadroms.io` (external) → add `loading=lazy` (already), add `width/height` to prevent CLS.
- OG: replace generic `og-image.svg` with per-game OG for top 10 (B2).

---

## 9) Risks [skill: war-gaming light]

| Risk | Mitigation |
|---|---|
| Google indexing <50 by D4 | IndexNow + Bing WMT + GSC request-indexing 20 URLs/day; add internal links from `best-gba-games` pillar to all 52 |
| Reddit post removed (self-promo) | Post as "I built" story, not link dump; include technical WASM details; stagger across 3 subs |
| MEGA rate-limit on launch day | Cache via `cacheRom` (IndexedDB) already does; prefetch top 5 |
| WASM fails on old iOS | `ios-compat.js` shim already; guide fallback to single-thread |

---

## 10) What to Do in Next 60 Minutes

1. **GSC:** Add property `https://www.eggermath.com`, verify via DNS TXT, submit `sitemap.xml`.
2. **IndexNow:** Generate key `https://www.bing.com/indexnow?url=...&key=...` — we'll create file below.
3. **Distribution:** Use templates in `DISTRIBUTION-KIT.md` (next file) for Reddit + PH + X.
4. **Verify:** `curl https://www.eggermath.com/sitemap.xml` + GA4 Realtime.

---

*Synthesized from 21 strategy-consulting skills (Oria) + 25 Claude SEO sub-skills (AgriciDaniel). Method: Situation → Barrier → Market → Options → Prioritize → Roadmap → KPI → SEO execution → Risk.*

