(function() {
  if (typeof SharedArrayBuffer !== 'undefined') return;
  var _Worker = window.Worker;
  window.Worker = function(url, opts) {
    try {
      return new _Worker(url, opts);
    } catch(e) {
      console.warn('mGBA: Worker creation blocked (iOS/single-thread mode):', e.message);
      return {
        postMessage: function(){},
        terminate: function(){},
        addEventListener: function(){},
        removeEventListener: function(){},
        onmessage: null,
        onerror: null
      };
    }
  };
  window.Worker.prototype = _Worker.prototype;
  window.__MGBA_NO_THREADS = true;
})();
