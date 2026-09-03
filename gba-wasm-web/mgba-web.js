export default class Mgba {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 240;
    this.canvas.height = 160;
    this.running = false;
    this.speed = 1;
    this.currentSlot = 0;
    this.onLoad = null;
    this.onError = null;
  }

  async loadRom(source) {
    let data;
    if (source instanceof ArrayBuffer) {
      data = source;
    } else if (typeof source === 'string') {
      const resp = await fetch(source);
      data = await resp.arrayBuffer();
    } else {
      throw new Error('Source must be ArrayBuffer or URL string');
    }
    this.romData = new Uint8Array(data);
    if (this.onLoad) this.onLoad();
    return this;
  }

  start() {
    if (!this.romData) throw new Error('No ROM loaded');
    this.running = true;
    this._render();
  }

  pause() {
    this.running = false;
  }

  reset() {
    this.running = false;
    this.romData = null;
    this.ctx.clearRect(0, 0, 240, 160);
  }

  saveState(slot = 0) {
    this.currentSlot = Math.min(9, Math.max(0, slot));
  }

  loadState(slot = 0) {
    this.currentSlot = Math.min(9, Math.max(0, slot));
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  fullscreen() {
    const el = this.canvas.closest('.game-embed') || this.canvas.parentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  }

  _render() {
    if (!this.running) return;
    requestAnimationFrame(() => this._render());
  }

  setKeyHandler(callback) {
    this.keyHandler = callback;
  }
}
