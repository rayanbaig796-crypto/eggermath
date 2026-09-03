# gba-wasm-web

Play GBA (Game Boy Advance) games in the browser using mGBA WebAssembly. No downloads, no plugins — just open a HTML file.

## Features

- mGBA WASM core (pthreads + single-threaded fallback)
- Save/Load state (10 slots)
- Fast Forward (2x)
- Keyboard controls (arrow keys, Z/X/A/S, Enter, Backspace)
- Touch controls for mobile
- Fullscreen support
- iOS Safari compatibility (single-threaded mode)
- Responsive design

## Quick Start

```bash
# Clone
git clone https://github.com/rayanbaig796-crypto/gba-wasm-web.git
cd gba-wasm-web

# Open in browser
open index.html
# or
npx serve .
```

## Integration

### 1. Copy mGBA WASM files

Copy `mgba.js`, `mgba.wasm`, and `mgba-v2.js` from mGBA build output to your project.

### 2. HTML

```html
<canvas id="canvas"></canvas>
<script type="module">
  import Mgba from './mgba-web.js';
  
  const mgba = new Mgba('canvas');
  await mgba.loadRom('game.gba');
  mgba.start();
</script>
```

### 3. JavaScript API

```javascript
import Mgba from './mgba-web.js';

const mgba = new Mgba('canvas-element-id');

// Load ROM (ArrayBuffer)
const rom = await fetch('game.gba').then(r => r.arrayBuffer());
mgba.loadRom(rom);

// Controls
mgba.start();
mgba.pause();
mgba.reset();

// Save/Load
mgba.saveState(0); // slot 0-9
mgba.loadState(0);

// Fast forward
mgba.setSpeed(2); // 1x, 2x, 4x

// Fullscreen
mgba.fullscreen();
```

## Keyboard Controls

| Key | Action |
|-----|--------|
| Arrow keys | D-pad |
| Z | A button |
| X | B button |
| Enter | Start |
| Backspace | Select |
| F5 | Save state |
| F7 | Next slot |
| F9 | Load state |
| F | Fast forward |
| F11 | Fullscreen |

## How It Works

This project wraps mGBA's WebAssembly build with a clean JavaScript API:

1. **mGBA WASM Core** — Compiled from C to WebAssembly using Emscripten
2. **SharedArrayBuffer** — Requires COOP/COEP headers for multi-threaded mode
3. **Single-threaded fallback** — Falls back when SharedArrayBuffer is unavailable (iOS Safari)
4. **Web Audio API** — Audio output via AudioWorklet
5. **Canvas 2D** — 240x160 GBA framebuffer rendered to canvas

## Headers Required

For multi-threaded mode (SharedArrayBuffer), set these HTTP headers:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Or use the `_headers` file for Cloudflare Pages / Netlify.

## Browser Support

| Browser | Multi-threaded | Single-threaded |
|---------|---------------|-----------------|
| Chrome 92+ | ✅ | ✅ |
| Firefox 79+ | ✅ | ✅ |
| Safari 15+ | ❌ | ✅ |
| Edge 92+ | ✅ | ✅ |

## Credits

- [mGBA](https://mgba.io) — GBA emulator core
- [Emscripten](https://emscripten.org) — C to WASM compiler

## License

MIT
