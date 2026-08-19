import mGBA from '../gba-emulator-web/mgba.js';

const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const fileInfo = document.getElementById('file-info');
const fileName = document.getElementById('file-name');
const progressBar = document.getElementById('progress-bar');
const progressFill = document.getElementById('progress-fill');
const statusText = document.getElementById('status-text');
const emulatorContainer = document.getElementById('emulator-container');
const canvas = document.getElementById('emulator-canvas');
const toolbarHint = document.getElementById('toolbar-hint');
const emuToolbar = document.getElementById('emu-toolbar');

let emulator = null;
let toolbarTimeout = null;
let isMuted = false;
let syncInterval = null;
let activeSlot = 0;

function setStatus(msg) { statusText.textContent = msg; }
function setProgress(pct) { progressFill.style.width = pct + '%'; }

if (!window.WebAssembly) {
setStatus('Your browser does not support WebAssembly. Please use Chrome, Firefox, Edge, or Safari 11+.');
uploadArea.style.display = 'none';
}

function formatSize(bytes) {
if (bytes < 1024) return bytes + ' B';
if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
return (bytes / 1048576).toFixed(1) + ' MB';
}

async function syncSaves() {
if (!emulator) return;
try { await emulator.FSSync(); } catch (e) { console.warn('FSSync failed:', e); }
}

uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('dragover'); });
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
uploadArea.addEventListener('drop', e => {
e.preventDefault();
uploadArea.classList.remove('dragover');
if (e.dataTransfer.files.length) loadFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', () => {
if (fileInput.files.length) loadFile(fileInput.files[0]);
});

async function loadFile(file) {
var ext = file.name.toLowerCase();
if (!ext.endsWith('.gba') && !ext.endsWith('.zip') && !ext.endsWith('.gb') && !ext.endsWith('.gbc')) {
setStatus('Please select a .gba, .zip, .gb, or .gbc file');
return;
}

uploadArea.style.display = 'none';
var preGame = document.getElementById('pre-game-content');
if (preGame) preGame.classList.add('hidden');
document.getElementById('continue-bar').classList.remove('visible');
fileInfo.classList.add('visible');
fileName.textContent = file.name.replace(/\.zip$/i, '').replace(/\.gba$/i, '').replace(/\.gb$/i, '').replace(/\.gbc$/i, '');
progressBar.classList.add('visible');
setStatus('Initializing emulator...');

try {
if (!emulator) {
setProgress(10);
setStatus('Initializing emulator...');
try {
emulator = await Promise.race([
mGBA({ canvas }),
new Promise((_, reject) => setTimeout(() => reject(new Error('Emulator initialization timed out. Try Chrome or Edge browser.')), 30000))
]);
} catch (initErr) {
console.error('mGBA init failed:', initErr);
setStatus('Failed to initialize. Try Chrome or Edge. ' + initErr.message);
progressBar.classList.remove('visible');
uploadArea.style.display = '';
var preGame3 = document.getElementById('pre-game-content');
if (preGame3) preGame3.classList.remove('hidden');
fileInfo.classList.remove('visible');
return;
}
setProgress(30);
setStatus('Setting up filesystem...');
await emulator.FSInit();
setProgress(60);

emulator.setCoreSettings({
autoSaveStateEnable: true,
autoSaveStateTimerIntervalSeconds: 30,
restoreAutoSaveStateOnLoad: true,
});

emulator.addCoreCallbacks({
saveDataUpdatedCallback: () => syncSaves(),
});
}

setProgress(70);
setStatus('Loading ROM...');

await new Promise((resolve, reject) => {
emulator.uploadRom(file, (err) => {
if (err) reject(err);
else resolve();
});
});

setProgress(90);
setStatus('Starting game...');

const paths = emulator.filePaths();
const success = emulator.loadGame(paths.gamePath + '/' + file.name);

if (success) {
setProgress(100);
setStatus('');
progressBar.classList.remove('visible');
emulatorContainer.classList.add('visible');
document.getElementById('game-back-bar').classList.add('visible');
setupToolbar();
setupKeyboard();
setupFullscreen();
setupSavePersistence();
setupTouchControls();
} else {
setStatus('Failed to load ROM. The file may be corrupted.');
progressBar.classList.remove('visible');
}
} catch (err) {
console.error('Load error:', err);
setStatus('Error: ' + (err.message || 'Unknown error'));
progressBar.classList.remove('visible');
}
}

function setupToolbar() {
let hideTimer;
function showToolbar() {
emuToolbar.classList.add('visible');
toolbarHint.classList.remove('visible');
clearTimeout(hideTimer);
hideTimer = setTimeout(() => {
emuToolbar.classList.remove('visible');
toolbarHint.classList.add('visible');
}, 3000);
}

toolbarHint.addEventListener('click', showToolbar);
emuToolbar.addEventListener('mouseleave', () => {
emuToolbar.classList.remove('visible');
toolbarHint.classList.add('visible');
clearTimeout(hideTimer);
});
}

function setupKeyboard() {
const keyMap = {
'KeyW': 'Up', 'ArrowUp': 'Up',
'KeyS': 'Down', 'ArrowDown': 'Down',
'KeyA': 'Left', 'ArrowLeft': 'Left',
'KeyD': 'Right', 'ArrowRight': 'Right',
'KeyK': 'A',
'KeyJ': 'B',
'KeyQ': 'L',
'KeyE': 'R',
'Enter': 'Start',
'ShiftRight': 'Select',
};

document.addEventListener('keydown', e => {
if (e.key === 'F5') {
e.preventDefault();
if (emulator) { emulator.saveState(activeSlot); syncSaves(); setStatus('State saved'); setTimeout(() => setStatus(''), 1500); }
return;
}
if (e.key === 'F9') {
e.preventDefault();
if (emulator) { emulator.loadState(activeSlot); setStatus('State loaded'); setTimeout(() => setStatus(''), 1500); }
return;
}
if (e.key === 'F7') {
e.preventDefault();
activeSlot = (activeSlot + 1) % 10;
setStatus('Save slot: ' + activeSlot);
setTimeout(() => setStatus(''), 1500);
return;
}
const btn = keyMap[e.code];
if (btn && emulator) {
e.preventDefault();
emulator.buttonPress(btn);
}
});

document.addEventListener('keyup', e => {
const btn = keyMap[e.code];
if (btn && emulator) {
e.preventDefault();
emulator.buttonUnpress(btn);
}
});
}

function setupFullscreen() {
canvas.addEventListener('dblclick', () => {
if (document.fullscreenElement) {
document.exitFullscreen();
} else {
emulatorContainer.requestFullscreen();
}
});

document.getElementById('btn-fullscreen').addEventListener('click', () => {
if (document.fullscreenElement) {
document.exitFullscreen();
} else {
emulatorContainer.requestFullscreen();
}
});

document.getElementById('btn-reset').addEventListener('click', () => {
if (emulator) {
emulator.quickReload();
syncSaves();
}
});

document.getElementById('game-back-btn').addEventListener('click', goBack);

function goBack() {
if (emulator) {
try { emulator.pauseAudio(); } catch(e) {}
try { emulator.pause(); } catch(e) {}
}
syncSaves();
emulatorContainer.classList.remove('visible');
document.getElementById('game-back-bar').classList.remove('visible');
uploadArea.style.display = '';
fileInfo.classList.remove('visible');
progressBar.classList.remove('visible');
var preGame = document.getElementById('pre-game-content');
if (preGame) preGame.classList.remove('hidden');
loadContinueBar();
}

document.getElementById('btn-mute').addEventListener('click', () => {
if (!emulator) return;
isMuted = !isMuted;
if (isMuted) {
emulator.pauseAudio();
document.getElementById('btn-mute').classList.add('active');
} else {
emulator.resumeAudio();
document.getElementById('btn-mute').classList.remove('active');
}
});

document.getElementById('btn-save-state').addEventListener('click', () => {
if (!emulator) return;
const ok = emulator.saveState(activeSlot);
setStatus(ok ? 'State saved (slot ' + activeSlot + ')' : 'Save failed');
syncSaves();
setTimeout(() => setStatus(''), 2000);
});

document.getElementById('btn-load-state').addEventListener('click', () => {
if (!emulator) return;
const ok = emulator.loadState(activeSlot);
setStatus(ok ? 'State loaded (slot ' + activeSlot + ')' : 'Load failed — no save in slot ' + activeSlot);
setTimeout(() => setStatus(''), 2000);
});

document.getElementById('btn-fast-forward').addEventListener('click', () => {
if (!emulator) return;
const cur = emulator.getFastForwardMultiplier();
const next = cur > 1 ? 1 : 4;
emulator.setFastForwardMultiplier(next);
const btn = document.getElementById('btn-fast-forward');
btn.classList.toggle('active', next > 1);
setStatus(next > 1 ? 'Fast Forward: x' + next : 'Normal speed');
setTimeout(() => setStatus(''), 1500);
});
}

function setupSavePersistence() {
if (syncInterval) clearInterval(syncInterval);
syncInterval = setInterval(syncSaves, 15000);

window.addEventListener('beforeunload', syncSaves);
window.addEventListener('pagehide', syncSaves);
document.addEventListener('visibilitychange', () => {
if (document.visibilityState === 'hidden') syncSaves();
});
}

function setupTouchControls() {
const tc = document.getElementById('touch-controls');
const isTouch = window.matchMedia('(pointer: coarse)').matches;
if (!isTouch) return;

tc.classList.add('active');

const heldButtons = new Set();

function pressBtn(btn) {
if (heldButtons.has(btn)) return;
heldButtons.add(btn);
if (emulator) emulator.buttonPress(btn);
}
function unpressBtn(btn) {
if (!heldButtons.has(btn)) return;
heldButtons.delete(btn);
if (emulator) emulator.buttonUnpress(btn);
}
function unpressAll() {
heldButtons.forEach(btn => {
if (emulator) emulator.buttonUnpress(btn);
});
heldButtons.clear();
tc.querySelectorAll('.tc-btn.pressed').forEach(el => el.classList.remove('pressed'));
var dpad = document.getElementById('tc-dpad');
if (dpad) dpad.className = 'tc-dpad';
}

tc.querySelectorAll('.tc-btn[data-btn]').forEach(el => {
const btn = el.dataset.btn;
if (!btn) return;

el.addEventListener('touchstart', e => {
e.preventDefault();
e.stopPropagation();
pressBtn(btn);
el.classList.add('pressed');
}, { passive: false });

el.addEventListener('touchend', e => {
e.preventDefault();
e.stopPropagation();
unpressBtn(btn);
el.classList.remove('pressed');
}, { passive: false });

el.addEventListener('touchcancel', e => {
e.preventDefault();
unpressBtn(btn);
el.classList.remove('pressed');
}, { passive: false });
});

var dpad = document.getElementById('tc-dpad');
if (dpad) {
var dpadDirs = { u: 'Up', d: 'Down', l: 'Left', r: 'Right' };
var dpadClassMap = { u: 'pressed-up', d: 'pressed-down', l: 'pressed-left', r: 'pressed-right' };

function getDpadDir(touch) {
var rect = dpad.getBoundingClientRect();
var cx = rect.left + rect.width / 2;
var cy = rect.top + rect.height / 2;
var dx = touch.clientX - cx;
var dy = touch.clientY - cy;
var absDx = Math.abs(dx);
var absDy = Math.abs(dy);
var deadzone = 8;
if (absDx < deadzone && absDy < deadzone) return null;
if (absDx > absDy) return dx > 0 ? 'r' : 'l';
return dy > 0 ? 'd' : 'u';
}

var activeDpadDirs = new Set();

dpad.addEventListener('touchstart', function(e) {
e.preventDefault();
e.stopPropagation();
Array.from(e.changedTouches).forEach(function(touch) {
var dir = getDpadDir(touch);
if (dir) {
pressBtn(dpadDirs[dir]);
activeDpadDirs.add(dir);
dpad.classList.add(dpadClassMap[dir]);
}
});
}, { passive: false });

dpad.addEventListener('touchmove', function(e) {
e.preventDefault();
e.stopPropagation();
var newDirs = new Set();
Array.from(e.changedTouches).forEach(function(touch) {
var dir = getDpadDir(touch);
if (dir) {
newDirs.add(dir);
if (!activeDpadDirs.has(dir)) {
pressBtn(dpadDirs[dir]);
dpad.classList.add(dpadClassMap[dir]);
}
}
});
activeDpadDirs.forEach(function(dir) {
if (!newDirs.has(dir)) {
unpressBtn(dpadDirs[dir]);
dpad.classList.remove(dpadClassMap[dir]);
}
});
activeDpadDirs = newDirs;
}, { passive: false });

function endDpad(e) {
e.preventDefault();
e.stopPropagation();
Array.from(e.changedTouches).forEach(function(touch) {
var dir = getDpadDir(touch);
if (dir && activeDpadDirs.has(dir)) {
unpressBtn(dpadDirs[dir]);
dpad.classList.remove(dpadClassMap[dir]);
activeDpadDirs.delete(dir);
}
});
}

dpad.addEventListener('touchend', endDpad, { passive: false });
dpad.addEventListener('touchcancel', endDpad, { passive: false });
}

document.addEventListener('visibilitychange', () => {
if (document.visibilityState === 'hidden') unpressAll();
});
window.addEventListener('blur', unpressAll);
}

/* ── Continue Playing (multi-game) ── */
var CONTINUE_KEY = 'gba_continue_games';
var MAX_CONTINUE = 6;
var megaFiles = null;

/* ── ROM Cache (IndexedDB) for instant repeat plays ── */
var ROM_CACHE_DB = 'gba_rom_cache';
var ROM_CACHE_STORE = 'roms';
function openRomCache() {
return new Promise(function(resolve, reject) {
var req = indexedDB.open(ROM_CACHE_DB, 1);
req.onupgradeneeded = function(e) {
var db = e.target.result;
if (!db.objectStoreNames.contains(ROM_CACHE_STORE)) {
db.createObjectStore(ROM_CACHE_STORE);
}
};
req.onsuccess = function(e) { resolve(e.target.result); };
req.onerror = function(e) { reject(e.target.error); };
});
}
function getCachedRom(key) {
return openRomCache().then(function(db) {
return new Promise(function(resolve) {
var tx = db.transaction(ROM_CACHE_STORE, 'readonly');
var req = tx.objectStore(ROM_CACHE_STORE).get(key);
req.onsuccess = function() { resolve(req.result || null); };
req.onerror = function() { resolve(null); };
});
});
}
function cacheRom(key, data) {
return openRomCache().then(function(db) {
return new Promise(function(resolve) {
var tx = db.transaction(ROM_CACHE_STORE, 'readwrite');
tx.objectStore(ROM_CACHE_STORE).put(data, key);
tx.oncomplete = function() { resolve(); };
tx.onerror = function() { resolve(); };
});
});
}

/* Pre-fetch map: megaKey -> Promise<Uint8Array> */
var prefetchMap = {};
function prefetchRom(megaKey) {
if (prefetchMap[megaKey]) return;
if (!megaFiles || !megaFiles[megaKey]) return;
prefetchMap[megaKey] = new Promise(function(resolve) {
megaFiles[megaKey].downloadBuffer(function(err, data) {
if (!err && data) {
cacheRom(megaKey, data).then(function() {
prefetchMap[megaKey] = Promise.resolve(data);
resolve(data);
});
} else {
resolve(null);
}
});
});
}

function downloadOrCache(megaKey, title, onProgress) {
return getCachedRom(megaKey).then(function(cached) {
if (cached) {
console.log('ROM cache hit:', title);
return cached;
}
if (prefetchMap[megaKey] && prefetchMap[megaKey] !== true) {
return prefetchMap[megaKey];
}
return new Promise(function(resolve, reject) {
var megaFile = megaFiles[megaKey];
if (!megaFile) { reject(new Error('Not found')); return; }
var progressInterval = setInterval(function() {
var current = parseInt(progressFill.style.width) || 0;
if (current < 85) setProgress(current + 1);
}, 200);
megaFile.downloadBuffer(function(err, data) {
clearInterval(progressInterval);
if (err) { reject(err); return; }
cacheRom(megaKey, data).then(function() {
resolve(data);
});
});
});
});
}

function saveLastPlayed(title, megaKey) {
try {
var list = JSON.parse(localStorage.getItem(CONTINUE_KEY)) || [];
list = list.filter(function(g) { return g.mega !== megaKey; });
list.unshift({ title: title, mega: megaKey, ts: Date.now() });
if (list.length > MAX_CONTINUE) list = list.slice(0, MAX_CONTINUE);
localStorage.setItem(CONTINUE_KEY, JSON.stringify(list));
} catch(e) {}
}

function loadContinueBar() {
try {
var list = JSON.parse(localStorage.getItem(CONTINUE_KEY));
if (!list || !list.length) {
document.getElementById('continue-bar').classList.remove('visible');
return;
}
var container = document.getElementById('continue-games-list');
container.innerHTML = '';
list.forEach(function(g) {
var card = document.createElement('div');
card.className = 'continue-game-card';
card.innerHTML = '<div class="cgc-title">' + g.title + '</div><button class="cgc-play">▶ Play</button>';
card.querySelector('.cgc-play').addEventListener('click', function(e) {
e.stopPropagation();
resumeGame(g);
});
container.appendChild(card);
});
document.getElementById('continue-bar').classList.add('visible');
} catch(e) {}
}

function resumeGame(data) {
if (!data || !data.mega) return;
if (!megaFiles) {
setStatus('Connecting to game library...');
setTimeout(function() { resumeGame(data); }, 2000);
return;
}
var megaFile = megaFiles[data.mega];
if (!megaFile) { setStatus('Game not found in library'); setTimeout(function() { setStatus(''); }, 3000); return; }
setStatus('Loading ' + data.title + '...');
setProgress(0);
progressBar.classList.add('visible');
uploadArea.style.display = 'none';
var preGame = document.getElementById('pre-game-content');
if (preGame) preGame.classList.add('hidden');
fileInfo.classList.add('visible');
fileName.textContent = data.title;

downloadOrCache(data.mega, data.title).then(function(downloadData) {
setProgress(90);
setStatus('Starting game...');
var blob = new Blob([downloadData], { type: 'application/zip' });
var file = new File([blob], data.mega, { type: 'application/zip' });
loadFile(file);
}).catch(function(err) {
console.error('Resume download error:', err);
setStatus('Download failed. Try again.');
progressBar.classList.remove('visible');
uploadArea.style.display = '';
if (preGame) preGame.classList.remove('hidden');
fileInfo.classList.remove('visible');
});
}

function clearContinue() {
try { localStorage.removeItem(CONTINUE_KEY); } catch(e) {}
document.getElementById('continue-bar').classList.remove('visible');
}

document.getElementById('continue-clear').addEventListener('click', function(e) {
e.stopPropagation(); clearContinue();
});

loadContinueBar();

/* ── URL ?game= auto-load ── */
var autoGame = new URLSearchParams(window.location.search).get('game');

/* ── Popular Games Grid + MEGA Integration ── */
(function initGamesGrid() {
var grid = document.getElementById('games-grid');
if (!grid) return;

var games = [
{ title: 'Pokemon Emerald', genre: 'RPG', desc: 'Play Pokemon Emerald online in your browser. Explore the Hoenn region, catch 200+ Pokemon, challenge gym leaders, and face Team Magma and Team Aqua. Features the Battle Frontier post-game with 7 challenge facilities.', mega: 'Pokemon - Emerald Version (USA, Europe).zip', img: 'https://cache.downloadroms.io/static/1211cfa3fd892bcfc38f890ff5f4a7c25f4a1533/image.jpeg', slug: '/gameboy-advance-rom-pokemon-emerald-version/' },
{ title: 'Pokemon FireRed', genre: 'RPG', desc: 'Play Pokemon FireRed online. An enhanced remake of Pokemon Red for GBA with updated graphics, abilities, and the Sevii Islands post-game. Explore Kanto, collect all 151 original Pokemon, and become Pokemon Champion.', mega: 'Pokemon_ FireRed Version.zip', img: 'https://cache.downloadroms.io/static/465a276ce69d99c8a0993c72972149086d369d28/image.jpeg', slug: '/gameboy-advance-rom-pokemon-firered-version/' },
{ title: 'Pokemon LeafGreen', genre: 'RPG', desc: 'Play Pokemon LeafGreen online in your browser. The counterpart to FireRed featuring Pokemon Green exclusives. Explore Kanto with updated graphics, new mechanics like abilities and natures, and the Sevii Islands.', mega: 'Pokemon - Leaf Green Version (U) (V1.1).zip', img: 'https://cache.downloadroms.io/static/15c4020193a0639699374676644b60a243588a39/image.jpg', slug: '/gameboy-advance-rom-pokemon---leaf-green-version-v11/' },
{ title: 'Pokemon Ruby', genre: 'RPG', desc: 'Play Pokemon Ruby online. Journey through the Hoenn region, catch 135 new Pokemon, and stop Team Magma from expanding the land. Features double battles, Pokemon Contests, and the Battle Tower.', mega: 'Pokemon_ Ruby Version.zip', img: 'https://cache.downloadroms.io/static/5639a44279ef95f3a62707b463dbccbfa96179c6/image.jpeg', slug: '/gameboy-advance-rom-pokemon-ruby-version/' },
{ title: 'Pokemon Sapphire', genre: 'RPG', desc: 'Play Pokemon Sapphire online in your browser. The counterpart to Ruby featuring Team Aqua and exclusive Pokemon. Explore Hoenn, master double battles, and challenge the Battle Tower.', mega: 'Pokemon_ Sapphire Version.zip', img: 'https://cache.downloadroms.io/static/be0dffdade13546184dd5abddb94d07bff953970/image.jpeg', slug: '/gameboy-advance-rom-pokemon-sapphire-version/' },
{ title: 'Pokemon Ultra Violet', genre: 'RPG', desc: 'Play Pokemon Ultra Violet online. A FireRed ROM hack featuring all Pokemon from Gen 1-3 in one game. Catch every Pokemon without trading, explore expanded Sevii Islands, and enjoy quality-of-life improvements.', mega: 'Pokemon Ultra Violet (1.22) LSA (Fire Red Hack).zip', img: 'https://cache.downloadroms.io/static/465a276ce69d99c8a0993c72972149086d369d28/image.jpeg', slug: '/gameboy-advance-rom-pokemon-ultra-violet-122-lsa-fire-red-hack/' },
{ title: 'Pokemon Jupiter', genre: 'RPG', desc: 'Play Pokemon Jupiter online. A Ruby ROM hack set in the Oxalis region with 200+ new fakemon, custom story, and updated mechanics. Features a darker narrative and challenging gym battles.', mega: 'Pokemon Jupiter - 6.04 (Ruby Hack).zip', img: 'https://cache.downloadroms.io/static/5639a44279ef95f3a62707b463dbccbfa96179c6/image.jpeg', slug: '/gameboy-advance-rom-pokemon-jupiter---604-ruby-hack/' },
{ title: 'Zelda: Minish Cap', genre: 'Adventure', desc: 'Play Zelda Minish Cap online in your browser. Help Link shrink to Minish size and explore Hyrule from a new perspective. Features the Gust Jar, Mole Mitts, and the ability to fuse Kinstones with NPCs.', mega: 'Legend of Zelda, The_ The Minish Cap.zip', img: 'https://cache.downloadroms.io/static/c5349b077fe3d330c816a7c8f094df8c7ff799ea/image.jpeg', slug: '/gameboy-advance-rom-legend-of-zelda-the-the-minish-cap/' },
{ title: 'Zelda: A Link to the Past', genre: 'Adventure', desc: 'Play Zelda A Link to the Past online. The GBA port of the SNES classic featuring both the original Light/Dark World adventure and the new Four Swords multiplayer mode. Explore dungeons, collect artifacts, and defeat Ganon.', mega: 'Legend of Zelda, The - A Link to the Past & Four Swords (USA).zip', img: 'https://cache.downloadroms.io/static/5e103c326eaeeec1bf39d72f0842cd32a1f69e00/image.jpeg', slug: '/gameboy-advance-rom-legend-of-zelda-the-a-link-to-the-past-four-swords/' },
{ title: 'Mario Kart Super Circuit', genre: 'Racing', desc: 'Play Mario Kart Super Circuit online in your browser. The first portable Mario Kart featuring 20 tracks from Super Mario Kart (SNES) plus 20 new courses. Drift, use items, and race against friends.', mega: 'Mario Kart_ Super Circuit.zip', img: 'https://cache.downloadroms.io/static/687a99e94fff34d7a3d6fcf1c164a6af97d1ced4/image.jpeg', slug: '/gameboy-advance-rom-mario-kart-super-circuit/' },
{ title: 'Super Mario World', genre: 'Platformer', desc: 'Play Super Mario World online. The GBA port of the SNES classic featuring Yoshi, secret exits, and 96 levels. Explore Dinosaur Land, ride Yoshi through colorful worlds, and rescue Princess Peach from Bowser.', mega: 'Super Mario Advance 2_ Super Mario World.zip', img: 'https://cache.downloadroms.io/static/97d992d1314c66211224c5af8adac66ed344364e/image.jpeg', slug: '/gameboy-advance-rom-super-mario-advance-2-super-mario-world/' },
{ title: 'Mario & Luigi: Superstar Saga', genre: 'RPG', desc: 'Play Mario & Luigi Superstar Saga online. An action RPG where Mario and Luigi travel to the Beanbean Kingdom to recover Princess Peach stolen voice. Features timing-based combat, Bros. Attacks, and humorous dialogue.', mega: 'Mario & Luigi_ Superstar Saga.zip', img: 'https://cache.downloadroms.io/static/e2ba65e8c9fc44f24e306f20a6bbdc650a6f28e6/image.jpeg', slug: '/gameboy-advance-rom-mario-luigi-superstar-saga/' },
{ title: 'Classic NES: Super Mario Bros', genre: 'Platformer', desc: 'Play Classic NES Super Mario Bros online. The original 1985 platformer ported to GBA. Run, jump, and stomp through 32 levels across 8 worlds to rescue Princess Toadstool from Bowser.', mega: 'Classic NES Series_ Super Mario Bros..zip', img: 'https://cache.downloadroms.io/static/4892e138d49d06903582ca7a63ff5ec61316aa01/image.jpeg', slug: '/gameboy-advance-rom-classic-nes-series-super-mario-bros/' },
{ title: 'Metroid Fusion', genre: 'Action', desc: 'Play Metroid Fusion online in your browser. Guide Samus Aran through the infected SR388 space station. Fight the X Parasites, recover your ship parts, and confront the SA-X in this atmospheric action-adventure.', mega: 'Metroid Fusion.zip', img: 'https://cache.downloadroms.io/static/8691fc127944a0b73e7bd34734385e68ce889b50/image.jpeg', slug: '/gameboy-advance-rom-metroid-fusion-1/' },
{ title: 'Metroid: Zero Mission', genre: 'Action', desc: 'Play Metroid Zero Mission online. A remake of the original NES Metroid with updated graphics and gameplay. Explore Planet Zebes, collect power-ups, and defeat Mother Brain in this fast-paced action game.', mega: 'Metroid_ Zero Mission.zip', img: 'https://cache.downloadroms.io/static/6e17ed38093925abed2b35680a2213463dc51246/image.jpeg', slug: '/gameboy-advance-rom-metroid-zero-mission/' },
{ title: 'Kirby: Nightmare in Dream Land', genre: 'Platformer', desc: 'Play Kirby Nightmare in Dream Land online. Help Kirby reclaim the Dream Rod from King Dedede. Copy enemy abilities, float through colorful levels, and enjoy this GBA remake of the NES classic.', mega: 'Kirby_ Nightmare in Dream Land.zip', img: 'https://cache.downloadroms.io/static/9562f6332bbfe23ea855242e958a08c6cc3fbc5e/image.jpeg', slug: '/gameboy-advance-rom-kirby-nightmare-in-dream-land/' },
{ title: 'Kirby & the Amazing Mirror', genre: 'Platformer', desc: 'Play Kirby and the Amazing Mirror online. Explore the mirror world with 4 Kirbys, copy 12 abilities, and collect 900 stars. Features a Metroidvania-style map with interconnected areas.', mega: 'Kirby & the Amazing Mirror.zip', img: 'https://cache.downloadroms.io/static/f59132ffa23f14bcd4d5e9694cf57afb8a8dd02d/image.jpeg', slug: '/gameboy-advance-rom-kirby-the-amazing-mirror/' },
{ title: 'Castlevania: Aria of Sorrow', genre: 'Action', desc: 'Play Castlevania Aria of Sorrow online. Fight through Dracula castle as Soma Cruz, who can absorb monster souls for new abilities. Features 100+ collectible souls, multiple weapons, and multiple endings.', mega: 'Castlevania_ Aria of Sorrow.zip', img: 'https://cache.downloadroms.io/static/4b7793d18f32f1ae48c630213b909b089dc3d191/image.jpeg', slug: '/gameboy-advance-rom-castlevania-aria-of-sorrow/' },
{ title: 'Donkey Kong Country', genre: 'Platformer', desc: 'Play Donkey Kong Country online. The GBA port of the SNES classic. Swing on vines, ride mine carts, and defeat King K. Rool with Diddy Kong. Features 40 levels across 7 worlds.', mega: 'Donkey Kong Country.zip', img: 'https://cache.downloadroms.io/static/ca0f70fea0a44c63d443ca96b203accfa34bcf12/image.jpeg', slug: '/gameboy-advance-rom-donkey-kong-country/' },
{ title: 'Fire Emblem: Sacred Stones', genre: 'Strategy', desc: 'Play Fire Emblem Sacred Stones online. Lead Eirika or Ephraim through the war-torn continents of Magvel. Recruit 24 characters, promote classes, and navigate branching story paths in this tactical RPG.', mega: 'Fire Emblem_ The Sacred Stones.zip', img: 'https://cache.downloadroms.io/static/526f9e2e1b09b6c40bf9a4c276ee232666f34442/image.jpeg', slug: '/gameboy-advance-rom-fire-emblem-the-sacred-stones/' },
{ title: 'Sonic Advance 3', genre: 'Platformer', desc: 'Play Sonic Advance 3 online in your browser. Race through 7 zones as Sonic, Tails, Knuckles, or Amy. Use the Tag feature to switch characters mid-level and find hidden Chao.', mega: 'Sonic Advance 3 (USA) (En,Ja,Fr,De,Es,It).zip', img: 'https://cache.downloadroms.io/static/3113ce42ab3471f38d8de19649e3eca6edd997ad/image.jpeg', slug: '/gameboy-advance-rom-sonic-advance-3/' },
{ title: 'Dragon Ball: Advanced Adventure', genre: 'Fighting', desc: 'Play Dragon Ball Advanced Adventure online. Relive the original Dragon Ball saga as young Goku. Fight through 100+ missions, collect 20+ characters, and master martial arts combos in this action-fighting game.', mega: 'Dragon Ball - Advanced Adventure (USA).zip', img: 'https://cache.downloadroms.io/static/3d31e5d0d96ce4e60bb45987b42f2c9750ec5197/image.jpeg', slug: '/gameboy-advance-rom-dragon-ball-advanced-adventure/' },
{ title: 'Harvest Moon', genre: 'Simulation', desc: 'Play Harvest Moon Friends of Mineral Town online. Build a farm, grow crops, raise animals, and find a partner in this charming life simulation. Features 4 seasons, mining, fishing, and 30+ bachelorettes.', mega: 'Harvest Moon - Friends of Mineral Town (U) [!].zip', img: 'https://cache.downloadroms.io/static/3da1858039ac4d6e9b64d4f6be716b300d58a109/image.jpg', slug: '/gameboy-advance-rom-harvest-moon---friends-of-mineral-town/' },
{ title: 'Crash Bandicoot', genre: 'Platformer', desc: 'Play Crash Bandicoot online. Help Crash shrink down to micro-size and battle the mutant insects of Cortex. Features 5 worlds, 30+ levels, and classic Crash platforming action.', mega: 'Crash Bandicoot_ The Huge Adventure.zip', img: 'https://cache.downloadroms.io/static/dccc383ed757660b06f608b1040bb2c8f364ff73/image.jpeg', slug: '/gameboy-advance-rom-crash-bandicoot-the-huge-adventure/' },
{ title: 'GTA Advance', genre: 'Action', desc: 'Play GTA Advance online in your browser. Explore Liberty City as Vinnie, completing missions for the mob. Features an open world, driveable vehicles, and the classic GTA crime gameplay on GBA.', mega: 'Grand Theft Auto Advance.zip', img: 'https://cache.downloadroms.io/static/bb1b6675a61175d35c748ac283089af2c0241d6b/image.jpeg', slug: '/gameboy-advance-rom-grand-theft-auto-advance/' },
];

var MEGA_FOLDER = 'https://mega.nz/folder/eWRFRTTC#hlIqNhqqS8y9OgTrGIWLcA';

window.mega.File.fromURL(MEGA_FOLDER).loadAttributes(function(err, folder) {
if (err) { console.warn('MEGA folder load failed:', err); return; }
  megaFiles = {};
  folder.children.forEach(function(f) { megaFiles[f.name] = f; });
  console.log('MEGA folder loaded:', Object.keys(megaFiles).length, 'files');
  if (autoGame && megaFiles[autoGame]) {
    var ag = games.find(function(g) { return g.mega === autoGame; });
    if (ag) {
      setStatus('Loading ' + ag.title + '...');
      setProgress(0);
      progressBar.classList.add('visible');
      uploadArea.style.display = 'none';
      var preGame2 = document.getElementById('pre-game-content');
      if (preGame2) preGame2.classList.add('hidden');
      fileInfo.classList.add('visible');
      fileName.textContent = ag.title;
      downloadOrCache(ag.mega, ag.title).then(function(data) {
        setProgress(90);
        setStatus('Starting game...');
        saveLastPlayed(ag.title, ag.mega);
        var blob = new Blob([data], { type: 'application/zip' });
        var file = new File([blob], ag.mega, { type: 'application/zip' });
        loadFile(file);
      }).catch(function(err) {
        console.error('Auto-load error:', err);
        setStatus('Download failed. Try again.');
        progressBar.classList.remove('visible');
        uploadArea.style.display = '';
        if (preGame2) preGame2.classList.remove('hidden');
        fileInfo.classList.remove('visible');
      });
    }
  } else if (autoGame) {
    setStatus('Game not found in library');
  }
  });

var svgPlay = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';

games.forEach(function(g) {
// Remove static cards once JS takes over
document.querySelectorAll('.game-pill-static').forEach(function(el) { el.remove(); });
var card = document.createElement('div');
card.className = 'game-pill' + (g.gbc ? ' gbc' : '');
card.dataset.mega = g.mega;
var badge = g.gbc ? '<span class="game-pill-badge">GBC</span>' : '';
card.innerHTML =
'<img class="game-pill-img" src="' + g.img + '" alt="' + g.title + '" loading="lazy" onerror="this.style.display=\'none\'">' +
'<div class="game-pill-overlay">' +
badge +
'<div class="game-pill-title">' + g.title + '</div>' +
'<div class="game-pill-genre">' + g.genre + '</div>' +
'<div class="game-pill-play">' + svgPlay + ' Play Now</div>' +
'</div>';
card.addEventListener('mouseenter', function() { prefetchRom(g.mega); });
card.addEventListener('click', function(e) {
e.preventDefault();
if (!megaFiles) {
setStatus('Connecting to game library...');
setTimeout(function() { card.click(); }, 2000);
return;
}
var megaFile = megaFiles[g.mega];
if (!megaFile) {
setStatus('Game not found in library: ' + g.mega);
setTimeout(function() { setStatus(''); }, 3000);
return;
}
setStatus('Loading ' + g.title + '...');
setProgress(0);
progressBar.classList.add('visible');
uploadArea.style.display = 'none';
var preGame = document.getElementById('pre-game-content');
if (preGame) preGame.classList.add('hidden');
fileInfo.classList.add('visible');
fileName.textContent = g.title;

downloadOrCache(g.mega, g.title).then(function(data) {
setProgress(90);
setStatus('Starting game...');
saveLastPlayed(g.title, g.mega);
var blob = new Blob([data], { type: 'application/zip' });
var file = new File([blob], g.mega, { type: 'application/zip' });
loadFile(file);
}).catch(function(err) {
console.error('Download error:', err);
setStatus('Download failed. Try again.');
progressBar.classList.remove('visible');
uploadArea.style.display = '';
if (preGame) preGame.classList.remove('hidden');
fileInfo.classList.remove('visible');
});
});
grid.appendChild(card);
});
})();
