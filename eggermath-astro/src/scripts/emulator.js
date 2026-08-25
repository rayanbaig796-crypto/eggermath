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

function getFsElement() { return document.querySelector('.game-embed') || document.documentElement; }
function requestFs() {
  var el = getFsElement();
  if (el.requestFullscreen) return el.requestFullscreen();
  if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
  return Promise.reject();
}

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

  // Detect ROM type from filename for control adaptation
  var fnLower = file.name.toLowerCase();
  var romSystem = 'GBA';
  if (fnLower.endsWith('.gb')) romSystem = 'GB';
  else if (fnLower.endsWith('.gbc')) romSystem = 'GBC';
  document.body.dataset.system = romSystem;

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
        function tryFs() { if (!document.fullscreenElement) requestFs().catch(function(){}); }
        tryFs();
        function autoFsOnce() {
          document.removeEventListener('pointerdown', autoFsOnce);
          document.removeEventListener('touchend', autoFsOnce);
          document.removeEventListener('keydown', autoFsOnce);
          tryFs();
        }
        document.addEventListener('pointerdown', autoFsOnce, { once: true });
        document.addEventListener('touchend', autoFsOnce, { once: true });
        document.addEventListener('keydown', autoFsOnce, { once: true });
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
      if (emulator) openSlotPicker('save');
      return;
    }
    if (e.key === 'F9') {
      e.preventDefault();
      if (emulator) openSlotPicker('load');
      return;
    }
    if (e.key === 'F7') {
      e.preventDefault();
      openSlotPicker(slotPickerMode || 'save');
      return;
    }
    const btn = keyMap[e.code];
    if (btn && emulator) {
      var sys = document.body.dataset.system;
      if ((btn === 'L' || btn === 'R') && (sys === 'GB' || sys === 'GBC')) return;
      e.preventDefault();
      emulator.buttonPress(btn);
    }
  });

  document.addEventListener('keyup', e => {
    const btn = keyMap[e.code];
    if (btn && emulator) {
      var sys2 = document.body.dataset.system;
      if ((btn === 'L' || btn === 'R') && (sys2 === 'GB' || sys2 === 'GBC')) return;
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
  document.addEventListener('webkitfullscreenchange', toggleFullscreenClass);

  canvas.addEventListener('dblclick', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      requestFs().catch(function(){});
    }
  });

  var btnFs = document.getElementById('btn-fullscreen');
  if (btnFs) btnFs.addEventListener('click', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      requestFs().catch(function(){});
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

  // save/load/slot moved to global init — see initGameButtons() below

  var btnFF = document.getElementById('btn-fast-forward');
  if (btnFF) {
    let ffOn = false;
    btnFF.addEventListener('click', () => {
      if (!emulator) return;
      try {
        const cur = emulator.getFastForwardMultiplier ? emulator.getFastForwardMultiplier() : (ffOn ? 4 : 1);
        const next = cur > 1 ? 1 : 4;
        emulator.setFastForwardMultiplier(next);
        ffOn = next > 1;
      } catch(e) { ffOn = !ffOn; }
      btnFF.classList.toggle('active', ffOn);
      setStatus(ffOn ? 'Fast Forward: x4' : 'Normal speed');
      setTimeout(() => setStatus(''), 1500);
    });
  }
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
      if (emulatorContainer && emulatorContainer.classList.contains('visible') && !document.fullscreenElement) {
        requestFs().catch(function(){});
      }
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
/* ── Slot Picker (PPSSPP-style) ── */
function getSlotMetaKey() {
  var slug = (window.__GAME_PAGE__ && window.__GAME_PAGE__.slug) || 'unknown';
  return 'gba_slot_meta_' + slug;
}
function getSlotMeta() {
  try { return JSON.parse(localStorage.getItem(getSlotMetaKey()) || '{}'); } catch(e) { return {}; }
}
function setSlotMeta(meta) {
  try { localStorage.setItem(getSlotMetaKey(), JSON.stringify(meta)); } catch(e) {}
}
function saveSlotTimestamp(slot) {
  var meta = getSlotMeta();
  meta[slot] = new Date().toISOString();
  setSlotMeta(meta);
}
function clearSlotTimestamp(slot) {
  var meta = getSlotMeta();
  delete meta[slot];
  setSlotMeta(meta);
}
function formatSlotTime(iso) {
  if (!iso) return 'Empty';
  var d = new Date(iso);
  var now = new Date();
  var diff = now - d;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return Math.floor(diff/60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff/3600000) + 'h ago';
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
}

function createSlotPicker() {
  if (document.getElementById('slot-picker-overlay')) return;
  var overlay = document.createElement('div');
  overlay.id = 'slot-picker-overlay';
  overlay.innerHTML = '<div id="slot-picker-modal">'
    + '<div class="sp-header"><span id="sp-title">Save States</span><button id="sp-close" class="sp-close-btn">&times;</button></div>'
    + '<div id="sp-slots" class="sp-slots"></div>'
    + '<div class="sp-footer"><span class="sp-hint">Click a slot to save or load</span></div>'
    + '</div>';
  document.body.appendChild(overlay);

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeSlotPicker();
  });
  document.getElementById('sp-close').addEventListener('click', closeSlotPicker);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('slot-picker-overlay')) closeSlotPicker();
  });
}

var slotPickerMode = 'save';

function openSlotPicker(mode) {
  slotPickerMode = mode;
  createSlotPicker();
  var overlay = document.getElementById('slot-picker-overlay');
  var title = document.getElementById('sp-title');
  var slotsEl = document.getElementById('sp-slots');
  title.textContent = mode === 'save' ? 'Save State' : 'Load State';
  title.style.color = mode === 'save' ? '#c4a35a' : '#6db3f2';

  var meta = getSlotMeta();
  var html = '';
  for (var i = 0; i < 10; i++) {
    var ts = meta[i] || null;
    var timeStr = formatSlotTime(ts);
    var isEmpty = !ts;
    var currentClass = i === activeSlot ? ' sp-current' : '';
    var emptyClass = isEmpty ? ' sp-empty' : '';
    html += '<div class="sp-slot' + currentClass + emptyClass + '" data-slot="' + i + '">'
      + '<div class="sp-slot-num">Slot ' + i + '</div>'
      + '<div class="sp-slot-time">' + timeStr + '</div>'
      + (mode === 'load' && isEmpty ? '<div class="sp-slot-action sp-no-save">No Save</div>' : '<div class="sp-slot-action">' + (mode === 'save' ? 'Save' : 'Load') + '</div>')
      + '</div>';
  }
  slotsEl.innerHTML = html;

  slotsEl.querySelectorAll('.sp-slot').forEach(function(el) {
    el.addEventListener('click', function() {
      var slot = parseInt(el.dataset.slot);
      if (mode === 'save') {
        if (!emulator) { setStatus('Load a game first'); closeSlotPicker(); setTimeout(function(){ setStatus(''); }, 1500); return; }
        try {
          emulator.saveState(slot);
          syncSaves();
          saveSlotTimestamp(slot);
          activeSlot = slot;
          updateSlotDisplay();
          setStatus('Saved to slot ' + slot);
        } catch(e) { console.error('Save error:', e); setStatus('Save failed: ' + e.message); }
      } else {
        if (!emulator) { setStatus('Load a game first'); closeSlotPicker(); setTimeout(function(){ setStatus(''); }, 1500); return; }
        if (!meta[slot]) { setStatus('No save in slot ' + slot); closeSlotPicker(); setTimeout(function(){ setStatus(''); }, 1500); return; }
        try {
          emulator.loadState(slot);
          activeSlot = slot;
          updateSlotDisplay();
          setStatus('Loaded from slot ' + slot);
        } catch(e) { console.error('Load error:', e); setStatus('Load failed: ' + e.message); }
      }
      closeSlotPicker();
      setTimeout(function(){ setStatus(''); }, 2000);
    });
  });

  overlay.classList.add('sp-visible');
}

function closeSlotPicker() {
  var overlay = document.getElementById('slot-picker-overlay');
  if (overlay) overlay.classList.remove('sp-visible');
}

function updateSlotDisplay() {
  var slotNum = document.getElementById('slot-num');
  if (slotNum) slotNum.textContent = activeSlot;
  var btnSlot = document.getElementById('btn-slot');
  if (btnSlot) {
    var meta = getSlotMeta();
    btnSlot.classList.toggle('sp-has-save', !!meta[activeSlot]);
  }
}

function initGameButtons() {
  var btnSaveState = document.getElementById('btn-save-state');
  if (btnSaveState) btnSaveState.addEventListener('click', function() {
    if (!emulator) { setStatus('Load a game first'); setTimeout(function(){ setStatus(''); }, 1500); return; }
    openSlotPicker('save');
  });

  var btnLoadState = document.getElementById('btn-load-state');
  if (btnLoadState) btnLoadState.addEventListener('click', function() {
    if (!emulator) { setStatus('Load a game first'); setTimeout(function(){ setStatus(''); }, 1500); return; }
    openSlotPicker('load');
  });

  var btnSlot = document.getElementById('btn-slot');
  if (btnSlot) btnSlot.addEventListener('click', function() {
    openSlotPicker(slotPickerMode || 'save');
  });

  updateSlotDisplay();
}
initGameButtons();

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

function saveLastPlayed(title, megaKey, slug, img, genre) {
  try {
    // Resolve missing slug/img/genre from global games data (homepage)
    if (!slug && window.__GAMES_DATA__) {
      var found = window.__GAMES_DATA__.find(function(g) { return g.mega === megaKey; });
      if (found) { slug = found.slug; img = found.img; genre = found.genre; }
    }
    // Fallback: try to resolve from DOM (game cards on homepage)
    if (!slug) {
      var card = document.querySelector('.game-pill[data-mega="' + (CSS.escape ? CSS.escape(megaKey) : megaKey) + '"]');
      if (card) { slug = card.dataset.slug || slug; }
    }
    var list = JSON.parse(localStorage.getItem(CONTINUE_KEY)) || [];
    list = list.filter(function(g) { return g.mega !== megaKey; });
    var entry = { title: title, mega: megaKey, ts: Date.now() };
    if (slug) entry.slug = slug;
    if (img) entry.img = img;
    if (genre) entry.genre = genre;
    list.unshift(entry);
    if (list.length > MAX_CONTINUE) list = list.slice(0, MAX_CONTINUE);
    localStorage.setItem(CONTINUE_KEY, JSON.stringify(list));
  } catch(e) {}
}

function getContinueLang() {
  var seg = (location.pathname.split('/')[1] || '').trim();
  var langs = ['pt-BR','es','ja','de','fr','ru','ko','it','id','ar'];
  return langs.indexOf(seg) !== -1 ? seg : 'en';
}
function buildGameHref(slug) {
  var lang = getContinueLang();
  return lang === 'en' ? '/' + slug + '/' : '/' + lang + '/' + slug + '/';
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
    // Filter valid entries and migrate old ones without slug
    list = list.filter(function(g) { return g && g.title && g.mega; });
    // Migrate: resolve missing slug/img/genre from global data or DOM
    var migrated = false;
    list.forEach(function(g) {
      if (!g.slug && window.__GAMES_DATA__) {
        var found = window.__GAMES_DATA__.find(function(x) { return x.mega === g.mega; });
        if (found) { g.slug = found.slug; g.img = found.img; g.genre = found.genre; migrated = true; }
      }
      if (!g.slug) {
        var c = document.querySelector('.game-pill[data-mega="' + (CSS.escape ? CSS.escape(g.mega) : g.mega) + '"]');
        if (c && c.dataset.slug) { g.slug = c.dataset.slug; migrated = true; }
      }
    });
    if (migrated) localStorage.setItem(CONTINUE_KEY, JSON.stringify(list));
    // Remove entries that still have no slug (cannot navigate to dedicated page)
    var navigable = list.filter(function(g) { return g.slug; });
    if (!navigable.length) {
      // Fallback: keep old entries but they will use inline play
      navigable = list;
    } else {
      list = navigable;
    }
    if (!list.length) { continueBar.classList.remove('visible'); return; }
    localStorage.setItem(CONTINUE_KEY, JSON.stringify(list));
    list.forEach(function(g) {
      var card = document.createElement('a');
      card.className = 'continue-game-card';
      if (g.slug) card.href = buildGameHref(g.slug);
      else card.href = 'javascript:void(0)';
      card.style.textDecoration = 'none';
      // Build card with image like game page related-card style
      var thumb = '';
      if (g.img) {
        thumb = '<img class="cgc-thumb" src="' + g.img.replace(/"/g, '&quot;') + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">';
      } else {
        thumb = '<div class="cgc-thumb cgc-thumb--placeholder"></div>';
      }
      var genreHtml = g.genre ? '<div class="cgc-genre">' + g.genre + '</div>' : '';
      card.innerHTML = thumb + '<div class="cgc-info"><div class="cgc-title">' + g.title + '</div>' + genreHtml + '</div><span class="cgc-play">Play &rsaquo;</span>';
      if (!g.slug) {
        // No slug: inline play fallback for legacy data without matching game
        card.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          resumeGame(g);
        });
      }
      // If slug exists, native <a> navigation handles it — no JS needed
      container.appendChild(card);
    });
    continueBar.classList.add('visible');
  } catch(e) {}
}

function resumeGame(data) {
  if (!data || !data.mega) return;
  // If we have a slug, navigate to dedicated game page (same as clicking a game card)
  if (data.slug) {
    window.location.href = buildGameHref(data.slug);
    return;
  }
  // Try to resolve slug from global data before falling back to inline
  if (window.__GAMES_DATA__) {
    var found = window.__GAMES_DATA__.find(function(x) { return x.mega === data.mega; });
    if (found && found.slug) { window.location.href = buildGameHref(found.slug); return; }
  }
  var domCard = document.querySelector('.game-pill[data-mega="' + (CSS.escape ? CSS.escape(data.mega) : data.mega) + '"]');
  if (domCard && domCard.dataset.slug) { window.location.href = buildGameHref(domCard.dataset.slug); return; }
  // Fallback: inline load for uploaded ROMs or unknown mega files
  var fnLower = data.mega.toLowerCase();
  if (fnLower.endsWith('.gb')) document.body.dataset.system = 'GB';
  else if (fnLower.endsWith('.gbc')) document.body.dataset.system = 'GBC';
  else document.body.dataset.system = 'GBA';
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
      if (gamePageData.system) document.body.dataset.system = gamePageData.system;
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
        saveLastPlayed(gamePageData.title, gamePageData.mega, gamePageData.slug, gamePageData.img, gamePageData.genre);
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
