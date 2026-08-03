# Reddit Marketing Posts — EggerMath

## Strategy
- 9:1 ratio — 9 helpful/commentary posts for every 1 self-promo
- Post as a personal account, not a brand
- Answer old threads with solutions, THEN drop your link
- Best subs for massive reach: r/InternetIsBeautiful (17M+), r/WebGames

---

## r/InternetIsBeautiful (17M+ subscribers)
**Type: Self-promo (use sparingly — this is the golden goose)**

**Post 1:**
Title: I built a browser-based PSP emulator with multiplayer — no downloads needed

Body:
I've been working on a web-based PSP emulator that runs entirely in the browser using WebAssembly. You can play ISO/CSO files directly without installing anything.

Features:
- Full PSP emulation via PPSSPP compiled to WASM
- Keyboard + real controller support
- Save states with auto-persistence
- Built-in cheat system for 8+ games
- LAN/online multiplayer via WebSocket relay
- Mobile touch controls

It also has GBA, NES, SNES, N64, DS, Genesis, and PS1 emulators built in.

Link: https://www.eggermath.com

---

**Post 2:**
Title: I made a site where you can play retro games in your browser — 8 console emulators, no install

Body:
Been building this for months. It's a collection of browser-based emulators for PSP, GBA, NES, SNES, N64, Nintendo DS, Sega Genesis, and PlayStation 1.

Everything runs client-side via WebAssembly — no server-side emulation, no plugins, no downloads. Just pick a ROM and play.

Link: https://www.eggermath.com

---

## r/emulation (500K+ subscribers)
**Type: Discussion + soft promo**

**Post 1:**
Title: Browser-based PSP emulation — what are the current limitations?

Body:
I've been working on integrating PPSSPP (compiled to WASM) into a web app. The main challenges I've run into:

1. **No FFmpeg** — FMV-heavy games like God of War are broken because the WASM build can't include video codecs
2. **SharedArrayBuffer** — Requires COOP/COEP headers, which breaks iframing from other sites
3. **Performance** — ~60-70% of native PPSSPP speed on mid-range hardware
4. **Controller mapping** — Had to hook into the Gamepad API and map to PPSSPP's input system

What limitations have you hit with browser-based emulation? Any tips for the FFmpeg issue?

Site: https://www.eggermath.com

---

**Post 2:**
Title: What emulators would you want to see in a browser-based multi-system player?

Body:
I've been building a web app with browser-based emulators for PSP, GBA, NES, SNES, N64, DS, Genesis, and PS1. All using WebAssembly — no downloads needed.

Curious what systems people actually want to play in-browser vs. ones they prefer native emulators for. Are there any WASM-compiled emulators I'm missing?

---

## r/PSP (50K+ subscribers)
**Type: Helpful community member + soft promo**

**Post 1:**
Title: PPSSPP Web — play PSP games in your browser (no install)

Body:
I compiled PPSSPP to WebAssembly and built a browser-based player around it. You can drag-and-drop ISO/CSO files and play directly.

Current limitations:
- No FMV playback (FFmpeg not compiled in)
- ~60-70% of native speed
- Save states work via OPFS persistence

Works on desktop and mobile with touch controls. Would love feedback from the PSP community.

Link: https://www.eggermath.com/psp-emulator-web/

---

**Post 2:**
Title: Tip: If your PSP ISO won't load in PPSSPP, check the compression format

Body:
Common issue I see here — if your ISO won't load, try these steps:

1. Make sure it's actually an ISO or CSO, not a corrupted zip
2. Check the file isn't corrupted (re-download if needed)
3. For CSO files, make sure they were compressed with maxcso or similar
4. Try renaming to .iso if it's a .cso that won't load

If you want to test without installing anything, I built a browser-based PPSSPP player at https://www.eggermath.com — just drag and drop your ISO.

---

## r/Gameboy (100K+ subscribers)
**Type: Helpful + soft promo**

**Post 1:**
Title: Browser-based GBA emulator — play Pokemon/GBA games without installing

Body:
I built a browser-based GBA emulator using mGBA compiled to WebAssembly. Features:

- Drag-and-drop ROM loading (.gba, .zip)
- Save states (F5 to save, F9 to load, 10 slots)
- Fast forward (toggle button)
- Auto-save every 30 seconds
- Keyboard + controller support
- Mobile touch controls

Works on desktop and mobile. No downloads, no ads, no BS.

Link: https://www.eggermath.com/gba-emulator-web/

---

**Post 2:**
Title: What's the best GBA ROM hack you've played?

Body:
Looking for recommendations. I've played Pokemon Unbound and Kirbys Adventure DX. Any others worth trying?

(I also built a browser-based GBA emulator if anyone wants to test ROM hacks without installing: https://www.eggermath.com/gba-emulator-web/)

---

## r/retrogaming (200K+ subscribers)
**Type: Discussion + soft promo**

**Post 1:**
Title: Do you prefer native emulators or browser-based ones?

Body:
I've been building browser-based emulators (PSP, GBA, NES, SNES, N64, DS, Genesis, PS1) and I'm curious what the retro gaming community thinks.

Pros of browser-based:
- No installation
- Works on any device with a browser
- Easy to share with friends

Cons:
- Performance overhead (~30% slower than native)
- Limited codec support (no FMV in some cases)
- No netplay for most systems

What matters more to you — convenience or performance?

---

**Post 2:**
Title: Built a multi-system retro emulator that runs in the browser

Body:
I've been working on a web app that lets you play retro games directly in the browser. Supports 8 systems: PSP, GBA, NES, SNES, N64, DS, Genesis, and PS1.

All client-side via WebAssembly — no server-side emulation. Just pick a ROM and play.

Link: https://www.eggermath.com

---

## r/WebGames (100K+ subscribers)
**Type: Direct promo (this is your audience)**

**Post 1:**
Title: I built a retro game emulator site — 8 consoles, no download needed

Body:
Hey r/WebGames! I've been building EggerMath — a site with browser-based emulators for PSP, GBA, NES, SNES, N64, DS, Genesis, and PS1.

Everything runs in the browser via WebAssembly. No downloads, no plugins, no account needed. Just drag and drop a ROM file.

Features:
- Keyboard + controller support
- Save states
- Fullscreen mode
- Mobile touch controls
- Built-in cheats (PSP)

Would love feedback from the web games community!

Link: https://www.eggermath.com

---

## r/EmulationOnAndroid (200K+ subscribers)
**Type: Discussion + soft promo**

**Post 1:**
Title: Browser-based emulation on mobile — how does it compare to native Android emulators?

Body:
I've been building browser-based emulators and testing on Android. The experience is... mixed.

Pros:
- No installation needed
- Works on any Android browser
- Good for quick play sessions

Cons:
- 30-40% slower than native (RetroArch, PPSSPP Android)
- Touch controls less responsive than native apps
- Browser tabs can be killed by Android's memory management

For anyone who wants to try: https://www.eggermath.com

What's your take — is browser-based emulation viable on mobile, or is native always better?

---

## r/RetroArch (100K+ subscribers)
**Type: Discussion (careful — they're protective of RetroArch)**

**Post 1:**
Title: How does RetroArch's WASM core compare to standalone browser emulators?

Body:
I've been exploring browser-based emulation and I'm curious about RetroArch's WASM cores vs. standalone implementations.

For my project, I used:
- PPSSPP compiled to WASM (PSP)
- mGBA compiled to WASM (GBA)
- EmulatorJS for NES/SNES/N64/DS/Genesis/PS1

Has anyone here tried RetroArch's web player? How does it compare in terms of performance and compatibility?

---

## r/EmuDev (50K+ subscribers)
**Type: Technical discussion**

**Post 1:**
Title: Lessons learned building a multi-system browser emulator

Body:
I've been building a web app with 8 browser-based emulators. Here are the technical lessons:

1. **COOP/COEP headers are mandatory** for SharedArrayBuffer — without them, PPSSPP crashes
2. **Emscripten's addRunDependency** is critical for async FS operations — game files must be written before the runtime starts
3. **OPFS for persistence** — works great for save files, but browser support varies
4. **EmulatorJS CDN** is the easiest path for multi-system support — handles all the core loading
5. **Service workers** will corrupt WASM files if they cache them with wrong headers — exclude emulator paths

Stack: Node.js raw http server, vanilla JS frontend, Supabase for DB, PPSSPP/mGBA/EmulatorJS for emulation.

Repo: https://github.com/rayanbaig796-crypto/eggermath

---

## r/somethingimade (100K+ subscribers)
**Type: Show-and-tell (direct promo allowed)**

**Post 1:**
Title: I built a website with 8 retro game emulators that run in your browser

Body:
After months of work, I finally have a working multi-system retro game emulator site. It supports:

- PSP (via PPSSPP compiled to WASM)
- GBA (via mGBA compiled to WASM)
- NES, SNES, N64, DS, Genesis, PS1 (via EmulatorJS)

Everything runs entirely in the browser — no server-side processing, no downloads needed. You just pick a ROM file and play.

Features:
- Keyboard + controller support
- Save states with auto-persistence
- Fullscreen mode
- Mobile touch controls
- Built-in cheat system (PSP)

Built with: Node.js, vanilla JavaScript, WebAssembly, Supabase

Link: https://www.eggermath.com

---

## r/Roms (500K+ subscribers)
**Type: Helpful + careful (they're strict about piracy)**

**Post 1:**
Title: What's the best way to test if a ROM is corrupted?

Body:
I see a lot of posts about ROMs not working. Here are some quick checks:

1. **File size** — If it's suspiciously small (<100KB for most games), it's probably corrupted
2. **Hex header** — Open in a hex editor. Valid ISOs start with specific magic bytes
3. **Try multiple emulators** — If it fails in one, try another to rule out emulator issues
4. **Re-download** — The simplest fix. Download from a different source

I built a browser-based emulator that can help test — just drag and drop: https://www.eggermath.com

(For legal ROMs you own — I don't condone piracy)

---

## Posting Schedule

| Day | Sub | Post Type |
|-----|-----|-----------|
| Mon | r/InternetIsBeautiful | Self-promo |
| Tue | r/emulation | Discussion |
| Wed | r/PSP | Helpful tip |
| Thu | r/WebGames | Direct promo |
| Fri | r/Gameboy | Discussion |
| Sat | r/retrogaming | Discussion |
| Sun | r/somethingimade | Show-and-tell |

**Rules:**
1. Always engage with comments within 2 hours of posting
2. Reply to other posts before self-promoting
3. Never post the same content twice
4. Delete posts that get negative reception
5. Space self-promo posts at least 3 days apart
