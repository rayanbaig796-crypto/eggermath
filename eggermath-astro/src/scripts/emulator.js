const mGBA = window.mGBA;

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

function setStatus(msg) { if (statusText) statusText.textContent = msg; }
function setProgress(pct) { if (progressFill) progressFill.style.width = pct + '%'; }

if (!window.WebAssembly) {
  setStatus('Your browser does not support WebAssembly. Please use Chrome, Firefox, Edge, or Safari 11+.');
  if (uploadArea) uploadArea.style.display = 'none';
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

if (uploadArea) {
  uploadArea.addEventListener('click', () => fileInput.click());
  uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('dragover'); });
  uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
  uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    if (e.dataTransfer.files.length) loadFile(e.dataTransfer.files[0]);
  });
}

if (fileInput) {
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) loadFile(fileInput.files[0]);
  });
}

async function loadFile(file) {
  var ext = file.name.toLowerCase();
  if (!ext.endsWith('.gba') && !ext.endsWith('.zip') && !ext.endsWith('.gb') && !ext.endsWith('.gbc')) {
    setStatus('Please select a .gba, .zip, .gb, or .gbc file');
    return;
  }

  if (uploadArea) uploadArea.style.display = 'none';
  var preGame = document.getElementById('pre-game-content');
  if (preGame) preGame.classList.add('hidden');
  var continueBar = document.getElementById('continue-bar');
  if (continueBar) continueBar.classList.remove('visible');
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
        if (uploadArea) uploadArea.style.display = '';
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
      fileInfo.classList.remove('visible');
      emulatorContainer.classList.add('visible');
      var gameBackBar = document.getElementById('game-back-bar');
      if (gameBackBar) gameBackBar.classList.add('visible');
      setupToolbar();
      setupKeyboard();
      setupFullscreen();
      setupSavePersistence();
      setupTouchControls();

      if (window.__GAME_PAGE__ && !document.fullscreenElement) {
        function autoFullscreenOnce() {
          document.removeEventListener('pointerdown', autoFullscreenOnce);
          document.removeEventListener('keydown', autoFullscreenOnce);
          if (!document.fullscreenElement) {
            emulatorContainer.requestFullscreen().catch(function() {});
          }
        }
        document.addEventListener('pointerdown', autoFullscreenOnce, { once: true });
        document.addEventListener('keydown', autoFullscreenOnce, { once: true });
      }
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
  if (!emuToolbar || !toolbarHint) return;
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
  function toggleFullscreenClass() {
    if (document.fullscreenElement) {
      document.body.classList.add('game-fullscreen');
    } else {
      document.body.classList.remove('game-fullscreen');
    }
  }
  document.addEventListener('fullscreenchange', toggleFullscreenClass);

  canvas.addEventListener('dblclick', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      emulatorContainer.requestFullscreen();
    }
  });

  var btnFs = document.getElementById('btn-fullscreen');
  if (btnFs) btnFs.addEventListener('click', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      emulatorContainer.requestFullscreen();
    }
  });

  var btnReset = document.getElementById('btn-reset');
  if (btnReset) btnReset.addEventListener('click', () => {
    if (emulator) {
      emulator.quickReload();
      syncSaves();
    }
  });

  var btnBack = document.getElementById('game-back-btn');
  if (btnBack) btnBack.addEventListener('click', goBack);

  var btnMute = document.getElementById('btn-mute');
  if (btnMute) btnMute.addEventListener('click', () => {
    if (!emulator) return;
    isMuted = !isMuted;
    if (isMuted) {
      emulator.pauseAudio();
      btnMute.classList.add('active');
    } else {
      emulator.resumeAudio();
      btnMute.classList.remove('active');
    }
  });

  var btnSaveState = document.getElementById('btn-save-state');
  if (btnSaveState) btnSaveState.addEventListener('click', () => {
    if (!emulator) return;
    const ok = emulator.saveState(activeSlot);
    setStatus(ok ? 'State saved (slot ' + activeSlot + ')' : 'Save failed');
    syncSaves();
    setTimeout(() => setStatus(''), 2000);
  });

  var btnLoadState = document.getElementById('btn-load-state');
  if (btnLoadState) btnLoadState.addEventListener('click', () => {
    if (!emulator) return;
    const ok = emulator.loadState(activeSlot);
    setStatus(ok ? 'State loaded (slot ' + activeSlot + ')' : 'Load failed — no save in slot ' + activeSlot);
    setTimeout(() => setStatus(''), 2000);
  });

  var btnFF = document.getElementById('btn-fast-forward');
  if (btnFF) btnFF.addEventListener('click', () => {
    if (!emulator) return;
    const cur = emulator.getFastForwardMultiplier();
    const next = cur > 1 ? 1 : 4;
    emulator.setFastForwardMultiplier(next);
    btnFF.classList.toggle('active', next > 1);
    setStatus(next > 1 ? 'Fast Forward: x' + next : 'Normal speed');
    setTimeout(() => setStatus(''), 1500);
  });
}

function goBack() {
  if (emulator) {
    try { emulator.pauseAudio(); } catch(e) {}
    try { emulator.pause(); } catch(e) {}
  }
  syncSaves();
  emulatorContainer.classList.remove('visible');
  var gameBackBar = document.getElementById('game-back-bar');
  if (gameBackBar) gameBackBar.classList.remove('visible');
  if (uploadArea) uploadArea.style.display = '';
  fileInfo.classList.remove('visible');
  progressBar.classList.remove('visible');
  var preGame = document.getElementById('pre-game-content');
  if (preGame) preGame.classList.remove('hidden');
  loadContinueBar();
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
  if (!isTouch || !tc) return;

  tc.classList.add('active');

  var isLandscape = window.matchMedia('(orientation: landscape)');
  function updateLandscape() {
    if (isLandscape.matches) {
      document.body.classList.add('game-landscape');
    } else {
      document.body.classList.remove('game-landscape');
    }
  }
  updateLandscape();
  isLandscape.addEventListener('change', updateLandscape);

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
    dpadTouchIds.clear();
    btnTouchIds.clear();
    tc.querySelectorAll('.tc-btn.pressed').forEach(el => el.classList.remove('pressed'));
    var dpad = document.getElementById('tc-dpad');
    if (dpad) {
      dpad.className = 'tc-dpad';
      activeDpadDirs.clear();
    }
  }

  var dpadTouchIds = new Set();
  var btnTouchIds = new Set();

  tc.querySelectorAll('.tc-btn[data-btn]').forEach(el => {
    const btn = el.dataset.btn;
    if (!btn) return;

    el.addEventListener('touchstart', e => {
      e.preventDefault();
      e.stopPropagation();
      Array.from(e.changedTouches).forEach(function(touch) {
        btnTouchIds.add(touch.identifier);
        pressBtn(btn);
        el.classList.add('pressed');
      });
    }, { passive: false });

    el.addEventListener('touchend', e => {
      e.preventDefault();
      e.stopPropagation();
      Array.from(e.changedTouches).forEach(function(touch) {
        btnTouchIds.delete(touch.identifier);
        unpressBtn(btn);
        el.classList.remove('pressed');
      });
    }, { passive: false });

    el.addEventListener('touchcancel', e => {
      e.preventDefault();
      Array.from(e.changedTouches).forEach(function(touch) {
        btnTouchIds.delete(touch.identifier);
        unpressBtn(btn);
        el.classList.remove('pressed');
      });
    }, { passive: false });
  });

  var dpad = document.getElementById('tc-dpad');
  if (dpad) {
    var dpadDirs = { u: 'Up', d: 'Down', l: 'Left', r: 'Right' };
    var dpadClassMap = { u: 'pressed-up', d: 'pressed-down', l: 'pressed-left', r: 'pressed-right' };

    function getDpadDir(touch) {
      var rect = dpad.getBoundingClientRect();
      if (touch.clientX < rect.left || touch.clientX > rect.right ||
          touch.clientY < rect.top || touch.clientY > rect.bottom) return null;
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = touch.clientX - cx;
      var dy = touch.clientY - cy;
      var absDx = Math.abs(dx);
      var absDy = Math.abs(dy);
      var deadzone = 12;
      if (absDx < deadzone && absDy < deadzone) return null;
      if (absDx > absDy) return dx > 0 ? 'r' : 'l';
      return dy > 0 ? 'd' : 'u';
    }

    var activeDpadDirs = new Set();

    dpad.addEventListener('touchstart', function(e) {
      e.preventDefault();
      e.stopPropagation();
      Array.from(e.changedTouches).forEach(function(touch) {
        if (btnTouchIds.has(touch.identifier)) return;
        dpadTouchIds.add(touch.identifier);
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
        if (!dpadTouchIds.has(touch.identifier)) return;
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
        if (!dpadTouchIds.has(touch.identifier)) return;
        dpadTouchIds.delete(touch.identifier);
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

/* ── Continue Playing ── */
var CONTINUE_KEY = 'gba_continue_games';
var MAX_CONTINUE = 6;
var megaFiles = null;

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

function downloadOrCache(megaKey, title) {
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
    var continueBar = document.getElementById('continue-bar');
    if (!list || !list.length || !continueBar) {
      if (continueBar) continueBar.classList.remove('visible');
      return;
    }
    var container = document.getElementById('continue-games-list');
    if (!container) return;
    container.innerHTML = '';
    list = list.filter(function(g) { return g && g.title && g.mega; });
    if (!list.length) { continueBar.classList.remove('visible'); return; }
    localStorage.setItem(CONTINUE_KEY, JSON.stringify(list));
    list.forEach(function(g) {
      var card = document.createElement('div');
      card.className = 'continue-game-card';
      card.innerHTML = '<div class="cgc-title">' + g.title + '</div><button class="cgc-play">Play</button>';
      card.querySelector('.cgc-play').addEventListener('click', function(e) {
        e.stopPropagation();
        resumeGame(g);
      });
      container.appendChild(card);
    });
    continueBar.classList.add('visible');
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
  if (uploadArea) uploadArea.style.display = 'none';
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
    if (uploadArea) uploadArea.style.display = '';
    if (preGame) preGame.classList.remove('hidden');
    fileInfo.classList.remove('visible');
  });
}

function clearContinue() {
  try { localStorage.removeItem(CONTINUE_KEY); } catch(e) {}
  var continueBar = document.getElementById('continue-bar');
  if (continueBar) continueBar.classList.remove('visible');
}

var continueClear = document.getElementById('continue-clear');
if (continueClear) {
  continueClear.addEventListener('click', function(e) {
    e.stopPropagation(); clearContinue();
  });
}

loadContinueBar();

/* ── URL ?game= auto-load ── */
var autoGame = new URLSearchParams(window.location.search).get('game');

/* ── MEGA Integration ── */
var MEGA_FOLDER = 'https://mega.nz/folder/eWRFRTTC#hlIqNhqqS8y9OgTrGIWLcA';

// Game page auto-load support
var gamePageData = window.__GAME_PAGE__;

function initMegaIntegration() {
  window.mega.File.fromURL(MEGA_FOLDER).loadAttributes(function(err, folder) {
    if (err) { console.warn('MEGA folder load failed:', err); return; }
    megaFiles = {};
    folder.children.forEach(function(f) { megaFiles[f.name] = f; });
    console.log('MEGA folder loaded:', Object.keys(megaFiles).length, 'files');

    // Handle game page auto-load
    if (gamePageData && gamePageData.mega && megaFiles[gamePageData.mega]) {
      setStatus('Loading ' + gamePageData.title + '...');
      setProgress(0);
      progressBar.classList.add('visible');
      if (uploadArea) uploadArea.style.display = 'none';
      var preGame2 = document.getElementById('pre-game-content');
      if (preGame2) preGame2.classList.add('hidden');
      fileInfo.classList.add('visible');
      fileName.textContent = gamePageData.title;
      downloadOrCache(gamePageData.mega, gamePageData.title).then(function(data) {
        setProgress(90);
        setStatus('Starting game...');
        saveLastPlayed(gamePageData.title, gamePageData.mega);
        var blob = new Blob([data], { type: 'application/zip' });
        var file = new File([blob], gamePageData.mega, { type: 'application/zip' });
        loadFile(file);
      }).catch(function(err) {
        console.error('Auto-load error:', err);
        setStatus('Download failed. Try again.');
        progressBar.classList.remove('visible');
        if (uploadArea) uploadArea.style.display = '';
        if (preGame2) preGame2.classList.remove('hidden');
        fileInfo.classList.remove('visible');
      });
      return;
    }

    // Handle URL ?game= parameter
    if (autoGame && megaFiles[autoGame]) {
      var grid = document.getElementById('games-grid');
      if (!grid) return;
      var cardToAutoLoad = grid.querySelector('[data-mega="' + CSS.escape(autoGame) + '"]');
      if (cardToAutoLoad) cardToAutoLoad.click();
    }
  });
}

/* ── Games Grid Click Handlers ── */
function initGamesGrid() {
  var grid = document.getElementById('games-grid');
  if (!grid) return;

  grid.querySelectorAll('.game-pill[data-mega]').forEach(function(card) {
    var megaKey = card.dataset.mega;
    var title = card.dataset.title;

    card.addEventListener('click', function(e) {
      var link = card.querySelector('a');
      if (link && link.href) {
        window.location.href = link.href;
      }
    });
  });
}

initGamesGrid();
initMegaIntegration();
