# EggerMath Distribution Kit — 100/day Sprint

Copy-paste templates for D1-D7. All links = `https://www.eggermath.com` (no UTM to keep SEO clean; track via GA4 Referral).

---

## 1. Reddit (highest AI-mention correlator = 0.68)

**r/Emulation** (post D1, Tue 14:00 UTC — peak)
```
Title: I ported mGBA to WASM so you can play GBA/GBC/GB in the browser — no download, 52 games, save states

Body:
Hey r/Emulation — I built https://www.eggermath.com

- mGBA compiled to WebAssembly (COOP/COEP, 240x160 canvas, pixel-perfect)
- 52 games: 28 GBA + 8 GBC + 16 GB (Emerald, FireRed, Crystal, Tetris, Kirby, Shantae, etc.)
- Save states (IndexedDB, 10 slots), fast-forward, touch controls, 11 languages (pt-BR/es/ja/...)
- ROMs stream from MEGA via megajs, cached in IndexedDB — no server storage
- Also runs GB/GBC ROMs (mGBA handles .gb/.gbc too). Try on phone: touch D-pad works in Safari/Chrome.

Tech: Astro + Cloudflare Pages, `_headers` strips COOP/COEP for .js/.wasm, canvas uses `object-fit: contain`.

Would love feedback on mobile controls + which game to add next. Source for WASM build: https://github.com/rayanbaig796-crypto/gba-wasm-web

AMA!
```

**r/Pokemon** (D2, Wed)
```
Title: Play Pokemon Emerald/FireRed/Crystal/Gold/Silver/Yellow free in browser (no download)

Body: https://www.eggermath.com — click any Pokemon game, instant play, save states, works on phone. No ads wall. Which Pokemon game should I add next?
```

**r/Gameboy** (D3)
```
Title: 16 original GB + 8 GBC games now playable in browser — Donkey Kong, Tetris, Zelda links included

Body: same + list GB games. https://www.eggermath.com
```

**Rules:** No link-dump — add 2 gameplay screenshots, flair = `Showcase`.

---

## 2. Product Hunt (D2, 00:01 PST Thu)

- Name: EggerMath — Play GBA games in browser (no download)
- Tagline: mGBA in your browser. 52 GBA/GBC/GB games, instant play.
- Topics: Games, Emulator, Developer Tools
- Description: Same as Reddit + "Built because cartridges die. Uses mGBA WASM at 240x160, SharedArrayBuffer + COOP/COEP, Cloudflare Pages. 11 langs."
- Images: 3 screenshots (homepage grid, Pokemon Emerald gameplay, mobile touch controls)
- Maker comment: Story + ask for feedback
- Hunt on Thu/Fri (Games category low competition)

---

## 3. X / Hacker News / Indie Hackers

**X thread (D1)**
```
1/ I got tired of hunting GBA cartridges that no longer save.

So I ported mGBA to WASM.

→ https://eggermath.com
🧵 how it works

2/ mGBA = most accurate GBA emulator. Compile to WASM → runs at 60fps in browser.
But WASM + SharedArrayBuffer needs COOP/COEP. Cloudflare was stripping it → fixed with _headers selective strip.

3/ 52 games (GBA/GBC/GB), 11 languages, save states in IndexedDB, drag-and-drop your own ROM.

Try Pokemon Emerald → https://www.eggermath.com/pokemon-emerald/

4/ Open source WASM build: github.com/rayanbaig796-crypto/gba-wasm-web

What game did I miss?

#retrogaming #webassembly #indiedev
```

**Hacker News `Show HN` (D3, 08:00 UTC)**
```
Show HN: mGBA in WASM — play GBA/GBC/GB in browser, no download (Astro + Cloudflare Pages)
Link: https://www.eggermath.com
Comment: Technical writeup: COOP/COEP headers, canvas 240x160 vs CSS aspect-ratio, IndexedDB ROM cache, MEGA direct via megajs, pitfalls with Cloudflare caching (renamed mgba.js → mgba-v2.js).
```

**Indie Hackers (D1)**
Same X thread as post — group: `Build in Public`.

---

## 4. Quora (5 answers, D3)

Search Quora: "how to play pokemon emerald on pc", "best gba emulator online", "gba emulator android". Answer each with:
```
You can play it instantly at https://www.eggermath.com/pokemon-emerald/ — no download, save states, works on phone. I built it on mGBA WASM. For controls: WASD = D-pad, K = A, J = B. More games: /best-gba-games
```
Add 1 screenshot each.

---

## 5. Discord (5 servers, D3)

- `Emulation` (discord.gg/emulation)
- `Retro Gaming` 
- `Pokemon` servers

Post in #showcase: Short + 1 gif.

---

## 6. Backlink Week 1 (DA stacking)

| Target | Action | DA |
|---|---|---|
| github.com/rayanbaig796-crypto/gba-wasm-web | Push 2 commits, pin repo | 99 |
| producthunt.com/posts/eggermath | Launch → backlink | 92 |
| medium.com | Repost PH story "How I ported mGBA..." → link | 95 |
| dev.to | Cross-post | 85 |
| 3 retro blogs comments | Comment on retrogames.cc blog, etc. | 40-70 |

---

## 7. Daily 10-min Tracking (GA4 + GSC)

```
GA4 → Realtime → Users by Source
GSC → Indexing → Pages → Submitted vs Indexed (goal: 200 by D7)
Bing WMT → URL Submissions

If Reddit <50 clicks by +6h: cross-post to r/GameboyAdvance + r/retrogaming
If PH <50 votes by noon: ask 10 friends to upvote + reply to every comment
If indexed <50 by D4: re-submit sitemap + IndexNow all 14 sitemaps
```

**Escalation:** If Day 3 sessions <80 → add YouTube comment blast (10 videos: "best gba emulator") + 2nd Reddit post in r/AndroidGaming.

---

*All templates are pre-approved: no YouTube Shorts per your rule, no email spam.*
