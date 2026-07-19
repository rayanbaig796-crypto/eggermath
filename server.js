const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const PORT = process.env.PORT || 8080;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html',
  '.htm': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'font/eot',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.wasm': 'application/wasm',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.m4a': 'audio/mp4',
  '.mp4': 'video/mp4',
  '.unityweb': 'application/octet-stream',
  '.data': 'application/octet-stream',
  '.swf': 'application/x-shockwave-flash',
  '.bin': 'application/octet-stream',
};

function securityHeaders() {
  return {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}

// ═══════════════════════════════════════════════════════════════
//  SIMPLE LRU CACHE — speeds up repeated proxy requests
// ═══════════════════════════════════════════════════════════════
const proxyCache = new Map();
const CACHE_MAX = 5000;
const CACHE_TTL = 86400 * 1000; // 24 hours — game resources rarely change

function genETag(body) {
  return '"' + crypto.createHash('md5').update(body).digest('hex') + '"';
}

function cacheGet(key) {
  const entry = proxyCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    proxyCache.delete(key);
    return null;
  }
  return entry;
}

function cacheSet(key, statusCode, headers, body) {
  if (proxyCache.size >= CACHE_MAX) {
    const oldest = proxyCache.keys().next().value;
    proxyCache.delete(oldest);
  }
  proxyCache.set(key, { statusCode, headers, body, ts: Date.now(), etag: genETag(body) });
}

// ═══════════════════════════════════════════════════════════════
//  FETCH — follows redirects, returns { statusCode, headers, body }
// ═══════════════════════════════════════════════════════════════
function fetchUrl(targetUrl, maxRedirects = 8) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error('Too many redirects'));
    const client = targetUrl.startsWith('https') ? https : http;
    const urlObj = new URL(targetUrl);

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Referer': urlObj.origin + '/',
        'Accept': '*/*',
        'Accept-Encoding': 'identity',
      },
      timeout: 15000,
    };

    client.get(targetUrl, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let loc = res.headers.location;
        if (loc.startsWith('/')) loc = urlObj.origin + loc;
        res.resume();
        return fetchUrl(loc, maxRedirects - 1).then(resolve, reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks),
        });
      });
    }).on('error', reject).on('timeout', function () { this.destroy(); reject(new Error('Timeout')); });
  });
}

// ═══════════════════════════════════════════════════════════════
//  HTML REWRITING — proxy all resources + ad blocker
// ═══════════════════════════════════════════════════════════════
function rewriteHtml(html, baseUrl, serverHost, proxyBase) {
  const parsed = new URL(baseUrl);
  const origin = parsed.origin;
  const baseDir = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
  const ABS = 'https://' + serverHost;
  // proxyBase = 'https://eggermath.com/play/{hash}/' for path-based mode
  // proxyBase = undefined for query-param mode

  function resolveUrl(href) {
    if (!href || href.startsWith('data:') || href.startsWith('blob:') || href.startsWith('javascript:')) return href;
    if (href.startsWith('/proxy?url=')) return href;
    if (href.startsWith('/play/')) return href;
    if (proxyBase) {
      // Path-based mode: rewrite absolute CDN URLs to proxyBase-relative, leave relative URLs for <base>
      if (href.startsWith('http://') || href.startsWith('https://')) {
        try {
          var u = new URL(href);
          if (u.origin === origin) {
            // CDN URL — strip the CDN path and prepend proxyBase
            var cdnPath = u.pathname;
            var hashDir = '/' + baseDir.replace(origin + '/', '').replace(/\/$/, '');
            if (cdnPath.startsWith(hashDir + '/') || cdnPath === hashDir) {
              return proxyBase + cdnPath.substring(hashDir.length + 1) + u.search;
            }
          }
        } catch(e) {}
        return ABS + '/proxy?url=' + encodeURIComponent(href);
      }
      // Relative URLs: let <base> tag handle them
      return href;
    }
    // Query-param mode
    if (href.startsWith('http://') || href.startsWith('https://')) return ABS + '/proxy?url=' + encodeURIComponent(href);
    try { return ABS + '/proxy?url=' + encodeURIComponent(new URL(href, baseDir).href); }
    catch(e) { return href; }
  }

  // ── Strip ALL CSP meta tags ──
  html = html.replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*\/?>/gi, '');

  // ── Strip title if it contains ad domain names ──
  html = html.replace(/<title>[^<]*(?:loko8|gamemonetize\.com\/?|ad[a-z]*\.com)[^<]*<\/title>/gi, '<title>Game — EggerMath</title>');

  // ── Strip ad branding divs ──
  html = html.replace(/<div[^>]*class=["'][^"']*simmer[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');

  // ── Strip SDK script tags — ONLY ad SDK, NOT game scripts from html5.gamemonetize.co ──
  html = html.replace(/<script[^>]*id=["']gamemonetize-sdk["'][^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*src=["'][^"']*api\.gamemonetize\.com(?!\/YYGGames)[^"']*["'][^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*src=["'][^"']*cdn\.gamemonetize\.com[^"']*sdk[^"']*["'][^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*src=["'][^"']*imasdk\.googleapis\.com[^"']*["'][^>]*>[\s\S]*?<\/script>/gi, '');

  // ── Strip ALL inline scripts referencing SDK init patterns ──
  html = html.replace(/<script[^>]*>(?:(?!<\/script>)[\s\S])*(?:gamemonetize-sdk|parentNode\.insertBefore|api\.gamemonetize\.com)(?:(?!<\/script>)[\s\S])*<\/script>/gi, '');

  // ── Strip fuckAdBlock detection scripts — NOT crossing script boundaries ──
  html = html.replace(/<script[^>]*>(?:(?!<\/script>)[\s\S])*fuckAdBlock(?:(?!<\/script>)[\s\S])*<\/script>/gi, '');
  html = html.replace(/<script[^>]*>(?:(?!<\/script>)[\s\S])*blockAdBlock(?:(?!<\/script>)[\s\S])*<\/script>/gi, '');
  html = html.replace(/<script[^>]*>(?:(?!<\/script>)[\s\S])*adBlockDetect(?:(?!<\/script>)[\s\S])*<\/script>/gi, '');

  // ── Strip inline ad-related scripts ──
  // NOTE: Do NOT strip scripts containing showBanner/sdk.showBanner/etc
  // because legitimate game code (delegates, callbacks) also uses these.
  // Our SDK stubs already make these calls no-ops.

  // ── Protect inline script bodies from URL rewriting ──
  var scriptBodies = [];
  html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, function(match, attrs, body) {
    if (body.trim()) {
      var idx = scriptBodies.length;
      scriptBodies.push(body);
      return '<script' + attrs + '>__SCRIPT_' + idx + '__</script>';
    }
    return match;
  });

  // ── Rewrite resource URLs in HTML tags (ABSOLUTE proxy URLs) ──
  html = html.replace(/((?:src|href|poster|data-src|data-background|background))=(["'])([^"']*?)\2/gi, function(match, attr, q, val) {
    if (val.startsWith('__SCRIPT_') || val.startsWith('data:') || val.startsWith('blob:') || val.startsWith('javascript:')) return match;
    if (val.startsWith('/proxy?url=')) return match;
    return attr + '=' + q + resolveUrl(val) + q;
  });

  // ── Restore inline script bodies (untouched) ──
  html = html.replace(/__SCRIPT_(\d+)__/g, function(m, idx) {
    return scriptBodies[parseInt(idx)] || '';
  });

  // ── Inject <base> tag + ad blocker at start of <head> ──
  var effectiveBase = proxyBase || baseDir;
  var gameBaseTag = '<base href="' + effectiveBase + '"><script>window.__GAME_BASE__="' + baseDir + '";window.__ABS_PROXY__="' + ABS + '";window.__PATH_BASE__="' + (proxyBase || '') + '";</script>';

  var adBlockerScript = '<script>'
    + '(function(){'
    // ── L0: Core vars + URL rewriter ──
    + 'var G=window.__GAME_BASE__||"",A=window.__ABS_PROXY__||"";'
    + 'function px(u){'
    + '  if(!u||typeof u!=="string")return u;'
    + '  if(/^(data:|blob:|javascript:|about:)/.test(u)||/^\\/proxy|^\\/play\\//.test(u))return u;'
    + '  if(/^https?:\\/\\//.test(u)){'
    + '    try{var p=new URL(u);if(/gamemonetize/.test(p.hostname)){var h=p.pathname.split("/")[1];if(h)return A+"/play/"+h+p.pathname.replace("/"+h,"")+p.search;}}catch(e){}'
    + '    if(/eggermath\\.com/.test(u)){if(G){try{return A+"/proxy?url="+encodeURIComponent(new URL(u).pathname);}catch(e){}}return u;}'
    + '    return A+"/proxy?url="+encodeURIComponent(u);}'
    + '  try{u=new URL(u,document.baseURI).href;}catch(e){}return u;}'

    // ── L1: Expanded domain blocklist ──
    + 'var AD=new RegExp("api\\\\.gamemonetize\\\\.com|gamemonetize\\\\.com/sdk|cdn\\\\.gamemonetize\\\\.com.*sdk|'
    + 'pagead2\\\\.googlesyndication\\\\.com|adservice\\\\.google\\\\.com|google\\\\.com/pagead|google\\\\.com/js/gcm|'
    + 'doubleclick\\\\.net|googletagmanager\\\\.com|googletagservices\\\\.com|googleadservices\\\\.com|'
    + 'imasdk\\\\.googleapis\\\\.com|supportxmr\\\\.com|coinhive\\\\.(com|net)|coin-hive\\\\.com|'
    + 'cryptoloot\\\\.com|cryptonoter\\\\.com|crypto-loot\\\\.com|coinimp\\\\.com|authedmine\\\\.com|'
    + 'webminepool\\\\.com|miner|minero\\\\.cc|mining\\\\.pool|minero\\\\.px|'
    + 'adskeeper|propellerads|monetag|adsterra|exoclick|juicyads|trafficjunky|revcontent|taboola|outbrain|'
    + 'clickadu|hilltopads|popcash|popads|adsafeprotected\\\\.com|prebid\\\\.org|'
    + 'gtag\\\\.js|ga\\\\.js|analytics\\\\.js|gtm\\\\.js|loko8\\\\.com|adtrafficquality\\\\.google|'
    + 'pubads|adnxs\\\\.com|adsrvr\\\\.org|adform\\\\.net|rubiconproject\\\\.com|'
    + 'spotxchange\\\\.com|spotx\\\\.tv|casalemedia\\\\.com|indexexchange\\\\.com|'
    + 'openx\\\\.net|criteo\\\\.com|criteo\\\\.net|yieldmo\\\\.com|sharethrough\\\\.com|'
    + 'connatix\\\\.com|medianet\\\\.com|teads\\\\.com|outbrain\\\\.com|'
    + 'amazon-adsystem\\\\.com|aps\\\\.amazon\\\\.com|aps-sell\\\\.amazon\\\\.com", "i");'

    // ── L2: Expanded element/class ad pattern regex ──
    + 'var P=/sdk__implementation|sdk__advertisement|sdk__ad[-_]|sdk__implementation|imaContainer|ima[-_]video|google[-_]ads|'
    + 'ad[-_]?container|ad[-_]?wrapper|ad[-_]?overlay|ad[-_]?popup|ad[-_]?modal|'
    + 'adsbygoogle|google[-_]?ad|yandex[-_]?ad|adbreak|preroll|interstitial|'
    + 'rewarded[-_]?ad|adfox|adskeeper|propellerads|'
    + 'monetag|adsterra|ad[-_]?banner|ad[-_]?slot|ad[-_]?unit|ad[-_]?floor|'
    + 'gmasdk|midroll|pre[-_]?roll|poki[-_]?ad|loko|__gads|google_ads|'
    + 'adstitial|adhesion|adbann|advert|adzone|adspace|adserver|adclick|'
    + 'adblock|blockad|anti[-_]?ad|detect[-_]?ad|pubads|dfp|'
    + 'video[-_]?ad|audio[-_]?ad|native[-_]?ad|banner[-_]?ad|sticky[-_]?ad|'
    + 'gamemonetize-sdk|loko8/i;'
    + 'var D=/adsbygoogle|doubleclick|googlesyndication|imasdk|'
    + 'adskeeper|propellerads|monetag|adsterra|adfox|exoclick|prebid|'
    + 'pagead|pubads|googleads|coinhive|cryptoloot|coinimp|loko8|'
    + 'supportxmr|coin-hive|minero|webminepool|authedmine|'
    + 'adnxs|adsrvr|adform|rubiconproject|openx|criteo|casalemedia|'
    + 'amazon-adsystem|aps\\.amazon|connatix|medianet|teads|'
    + 'api\\.gamemonetize\\.com|cdn\\.gamemonetize\\.com.*sdk|'
    + 's0\\.2mdn\\.net|googletagmanager|2mdn\\.net/i;'

    // ── L3: SDK stubs (expanded) ──
    + 'var _noop=function(){};'
    + 'var _sdkStub={showBanner:_noop,showInterstitial:_noop,showAd:_noop,show:_noop,'
    + 'showRewardedVideo:function(c){if(c)c(false);},'
    + 'startAd:_noop,initAd:_noop,requestAd:_noop,loadAd:_noop,'
    + 'addEventListener:_noop,removeEventListener:_noop,gameData:{},isReady:true,'
    + 'onEvent:_noop,dispatchEvent:_noop};'
    + 'try{Object.defineProperty(window,"sdk",{get:function(){return _sdkStub;},set:_noop,configurable:false});}catch(e){window.sdk=_sdkStub;}'
    + 'window.SDK_OPTIONS={gameId:"stub",onEvent:_noop};'
    + 'try{Object.defineProperty(window,"idhbgd",{get:function(){return _sdkStub;},set:_noop,configurable:false});}catch(e){window.idhbgd=_sdkStub;}'
    + 'try{Object.defineProperty(window,"gdsdk",{get:function(){return _sdkStub;},set:_noop,configurable:false});}catch(e){window.gdsdk=_sdkStub;}'
    + 'window.mraid=_sdkStub;'
    + 'var _m={init:_noop,start:_noop,stop:_noop,destroy:_noop,addEventListener:_noop,removeEventListener:_noop,resize:_noop,getAdProgressInfo:function(){return{duration:0,currentTime:0};}};'
    + 'window.google={ima:{AdsRequest:_noop,AdsManager:function(){this.init=_m.init;this.start=_m.start;this.stop=_m.stop;this.destroy=_m.destroy;this.addEventListener=_m.addEventListener;this.removeEventListener=_m.removeEventListener;this.resize=_m.resize;this.getAdProgressInfo=_m.getAdProgressInfo;},AdsManagerLoadedEvent:_noop,AdDisplayContainer:function(){this.initialize=_noop;},ImaSdkSettings:function(){this.setVpaidMode=_noop;this.setPlayerType=_noop;this.setPlayerVersion=_noop;this.setAutoPlayAdBreaks=_noop;this.setDisableCustomPlaybackForIOS10Plus=_noop;},SdkAdTechErrorEvent:_noop,AdEvent:_noop,AdErrorEvent:_noop}};'
    + 'window.pbjs=window.pbjs||{que:[],cmd:[],push:function(f){f();},onEvent:_noop,addAdUnits:_noop,removeAdUnit:_noop,refreshAll:null,requestBids:function(c){if(c&&c.bidsBackHandler)c.bidsBackHandler([]);},enableSendAllBids:_noop,setConfig:_noop,getConfig:function(){return{};},que:{push:function(f){f();}}};'
    + 'window.__gads=undefined;window.google_ads=[];window.__google_ads_client=null;'
    + 'window.fuckAdBlock=false;window.blockAdBlock=false;window.canRunAds=true;'
    + 'window.canRunAds=true;window.adBlockDetected=false;window.isAdBlockActive=false;'

    // ── L4: Anti-anti-adblock bypass ──
    // Override detection globals that games check
    + 'var _da=["adBlockDetected","isAdBlockActive","adblock","adBlocker","adblocker","adblock_detected","adBlockEnabled","ad_blocker"];'
    + '_da.forEach(function(k){try{Object.defineProperty(window,k,{get:function(){return false;},set:function(){},configurable:true});}catch(e){}});'

    // Fake ad element presence so detection thinks ads loaded
    + 'function fakeAd(){var d=document.createElement("div");d.id="google_ads_frame";d.style.cssText="width:1px;height:1px;position:absolute;left:-9999px;top:-9999px;opacity:0;pointer-events:none;";d.setAttribute("data-ad-status","filled");document.body.appendChild(d);return d;}'
    + 'var _fakeAdInterval=setInterval(function(){if(document.body&&!document.getElementById("google_ads_frame")){fakeAd();}},500);'

    // Override MutationObserver to also detect when detection scripts check for ads
    + 'var _realMO=MutationObserver;window.MutationObserver=function(cb){'
    + '  return new _realMO(function(records,obs){'
    + '    cb(records,obs);'
    + '    for(var i=0;i<records.length;i++){'
    + '      var nodes=records[i].addedNodes;'
    + '      for(var j=0;j<nodes.length;j++){'
    + '        var n=nodes[j];if(n.nodeType!==1)continue;'
    + '        var id=(n.id||"")+" "+(n.className||"");'
    + '        if(/fuckAdBlock|blockAdBlock|adblock-detect|adb-detect|detectAdBlock/i.test(id)){n.remove();}'
    + '      }'
    + '    }'
    + '  });'
    + '};'
    + 'window.MutationObserver.prototype=_realMO.prototype;window.MutationObserver.prototype.constructor=window.MutationObserver;'

    // ── L5: URL rewriter (shared) ──
    + 'function rw(v){'
    + '  if(!v||typeof v!=="string"||/^(data:|blob:|javascript:|about:)/.test(v))return v;'
    + '  try{var u=new URL(v,document.baseURI);'
    + '  if(u.origin!==location.origin){'
    + '    if(/gamemonetize/.test(u.hostname)){var h=u.pathname.split("/")[1];if(h)return A+"/play/"+h+u.pathname.replace("/"+h,"")+u.search;}'
    + '    return A+"/proxy?url="+encodeURIComponent(u.href);}'
    + '  if(G&&!/^\\/proxy|^\\/play\\//.test(u.pathname)&&u.pathname!=="/")'
    + '    return A+"/proxy?url="+encodeURIComponent(G+u.pathname+(u.search||""));}catch(e){}return v;}'

    // ── L6: Script + Image src setter patching ──
    + 'var O={script:HTMLScriptElement.prototype,img:HTMLImageElement.prototype};'
    + '["script","img"].forEach(function(t){'
    + '  var d=Object.getOwnPropertyDescriptor(O[t].__proto__||Object.getPrototypeOf(O[t]),"src");'
    + '  if(d&&d.set)try{Object.defineProperty(O[t],"src",{get:function(){return d.get.call(this);},'
    + '  set:function(v){if(AD.test(String(v)))return;return d.set.call(this,rw(v));},configurable:true,enumerable:true});}catch(e){}'
    + '});'

    // ── L7: setAttribute patch ──
    + 'var _sa=Element.prototype.setAttribute;'
    + 'Element.prototype.setAttribute=function(n,v){'
    + '  if(n==="src"&&typeof v==="string"){'
    + '    var t=this.tagName;if(t==="SCRIPT"&&AD.test(v))return;'
    + '    if(t==="SCRIPT"||t==="IMG")v=rw(v);}'
    + '  if(n==="href"&&typeof v==="string"&&this.tagName==="LINK"&&AD.test(v))return;'
    + '  return _sa.call(this,n,v);};'

    // ── L8: appendChild + insertBefore ──
    + 'var _dummy=document.createTextNode("");'
    + 'function _fixEl(n){'
    + '  if(n&&n.tagName==="SCRIPT"){'
    + '    var s=n.src||n.getAttribute("src")||"";'
    + '    if(AD.test(s)){try{n.remove();}catch(e){}return _dummy;}'
    + '    if(s&&typeof s==="string"&&!/^(data:|blob:|javascript:)/.test(s)){'
    + '      try{var u=new URL(s,document.baseURI);'
    + '      if(u.origin!==location.origin){n.setAttribute("src",rw(s));}'
    + '      else if(G&&!/^\\/proxy|^\\/play\\//.test(u.pathname))n.setAttribute("src",rw(s));}catch(e){}}}'
    + '  if(n&&(n.tagName==="SCRIPT"||n.tagName==="IFRAME")&&AD.test(n.src||n.getAttribute("src")||"")){try{n.remove();}catch(e){}return _dummy;}'
    + '  if(n&&n.tagName==="LINK"&&AD.test(n.getAttribute("href")||"")){try{n.remove();}catch(e){}return _dummy;}'
    + '  return n;}'
    + 'var _ac=Element.prototype.appendChild;Element.prototype.appendChild=function(n){var r=_fixEl(n);return r!==n?r:_ac.apply(this,arguments);};'
    + 'var _ib=Node.prototype.insertBefore;Node.prototype.insertBefore=function(n,r){var f=_fixEl(n);return f!==n?f:_ib.apply(this,arguments);};'

    // ── L8b: insertAdjacentHTML interception ──
    + 'var _iah=Element.prototype.insertAdjacentHTML;Element.prototype.insertAdjacentHTML=function(pos,h){'
    + '  if(typeof h==="string"&&/<script/i.test(h)&&AD.test(h))return;'
    + '  return _iah.call(this,pos,h);};'

    // ── L9: fetch + XHR interception ──
    + 'var _f=window.fetch;window.fetch=function(r,o){'
    + '  var u=typeof r==="string"?r:(r instanceof Request?r.url:"");'
    + '  if(u&&AD.test(u))return Promise.resolve(new Response("",{status:200,headers:{"Content-Type":"text/plain"}}));'
    + '  if(typeof r==="string")return _f.call(window,px(r),o);return _f.apply(this,arguments);};'
    + 'var _xo=XMLHttpRequest.prototype.open;var _xs=XMLHttpRequest.prototype.send;'
    + 'XMLHttpRequest.prototype.open=function(m,u){if(typeof u==="string"){if(AD.test(u)){this._ab=true;return _xo.call(this,m,"about:blank");}u=px(u);this._ab=false;return _xo.call(this,m,u);}this._ab=false;return _xo.apply(this,arguments);};'
    + 'XMLHttpRequest.prototype.send=function(d){if(this._ab)return;return _xs.apply(this,arguments);};'

    // ── L10: sendBeacon + window.open + performance ──
    + 'var _sb=navigator.sendBeacon;if(_sb)navigator.sendBeacon=function(u,d){return AD.test(String(u))?false:_sb.apply(this,arguments);};'
    + 'var _wo=window.open;window.open=function(u,n,f){if(u&&AD.test(String(u)))return null;try{return _wo.call(this,u,n,f);}catch(e){return null;}};'

    // ── L11: WebSocket blocking (ad tracking + crypto mining) ──
    + 'var _WS=window.WebSocket;if(_WS){var _WSProto=_WS.prototype;'
    + 'window.WebSocket=function(u,pr){'
    + '  if(u&&AD.test(u)){console.log("[AdBlocker] Blocked WebSocket: "+u);return new _WS("about:blank");}'
    + '  if(/wss?:\\/\\/.test(u)&&/(ads|tracking|beacon|pixel|analytics|miner|coinhive|cryptoloot|coinimp)/.test(u)){'
    + '    console.log("[AdBlocker] Blocked tracking WS: "+u);return new _WS("about:blank");}'
    + '  return pr?new _WS(u,pr):new _WS(u);};'
    + 'window.WebSocket.prototype=_WSProto;window.WebSocket.prototype.constructor=window.WebSocket;'
    + 'window.WebSocket.CONNECTING=_WS.CONNECTING;window.WebSocket.OPEN=_WS.OPEN;'
    + 'window.WebSocket.CLOSING=_WS.CLOSING;window.WebSocket.CLOSED=_WS.CLOSED;}'

    // ── L12: Web Worker blocking (ad + mining workers) ──
    + 'var _Worker=window.Worker;if(_Worker){window.Worker=function(u,opts){'
    + '  if(u&&(AD.test(String(u))||/(miner|coinhive|cryptoloot|coinimp|wasm|crypto)/.test(String(u)))){'
    + '    console.log("[AdBlocker] Blocked Worker: "+u);return {terminate:function(){},onmessage:null,onerror:null};}'
    + '  return new _Worker(u,opts);};}'

    // ── L13: document.write/writeln interception ──
    + 'var _dw=document.write;document.write=function(h){if(typeof h==="string"&&!AD.test(h))h=h.replace(/(<script\\b[^>]*\\bsrc=["\'])([^"\']*?)(["\'][^>]*>)/gi,function(m,p,u,q){if(!u||/^(data:|blob:|javascript:)/.test(u)||/^\\/proxy/.test(u))return m;try{var r=new URL(u,document.baseURI);if(r.origin!==location.origin){return p+A+"/proxy?url="+encodeURIComponent(r.href)+q;}}catch(e){}return m;});return _dw.call(document,h);};'
    + 'var _dwl=document.writeln;document.writeln=function(h){if(typeof h==="string"&&!AD.test(h))h=h.replace(/(<script\\b[^>]*\\bsrc=["\'])([^"\']*?)(["\'][^>]*>)/gi,function(m,p,u,q){if(!u||/^(data:|blob:|javascript:)/.test(u)||/^\\/proxy/.test(u))return m;try{var r=new URL(u,document.baseURI);if(r.origin!==location.origin){return p+A+"/proxy?url="+encodeURIComponent(r.href)+q;}}catch(e){}return m;});return _dwl.call(document,h);};'

    // ── L14: CSS ad hiders (expanded) ──
    + 'var cs=document.createElement("style");cs.textContent='
    + '"[id*=\\"sdk__implementation\\"],[id*=\\"sdk__advertisement\\"],'
    + '[id*=\\"sdk__ad\\"],[id*=\\"imaContainer\\"],[id*=\\"google_ads\\"],'
    + '[id*=\\"ad-container\\"],[id*=\\"ad-wrapper\\"],[id*=\\"ad-overlay\\"],'
    + '[id*=\\"ad-popup\\"],[id*=\\"ad-modal\\"],[id*=\\"preroll\\"],'
    + '[id*=\\"interstitial\\"],[id*=\\"rewarded\\"],[id*=\\"midroll\\"],'
    + '[id*=\\"adbreak\\"],[id*=\\"adfox\\"],[id*=\\"gmasdk\\"],'
    + '[id*=\\"adblock\\"],[id*=\\"__gads\\"],[id*=\\"google_ads\\"],'
    + '[class*=\\"ad-container\\"],[class*=\\"ad-wrapper\\"],'
    + '[class*=\\"ad-overlay\\"],[class*=\\"ad-popup\\"],'
    + '[class*=\\"ad-modal\\"],[class*=\\"adsbygoogle\\"],'
    + '[class*=\\"google-ad\\"],[class*=\\"adfox\\"],'
    + '[class*=\\"simmer\\"],[class*=\\"loko\\"],'
    + '[class*=\\"ad-sticky\\"],[class*=\\"sponsored\\"],'
    + '.ad,.ads,.adv,.adv-container,#ad,#ads,#adv,'
    + 'iframe[src*=\\"doubleclick\\"],iframe[src*=\\"googlesyndication\\"],'
    + 'iframe[src*=\\"adskeeper\\"],iframe[src*=\\"propellerads\\"],'
    + 'iframe[src*=\\"monetag\\"],iframe[src*=\\"adsterra\\"],'
    + 'iframe[src*=\\"adfox\\"],iframe[src*=\\"imasdk\\"],'
    + 'iframe[src*=\\"googleads\\"],iframe[src*=\\"pagead\\"],'
    + 'iframe[id*=\\"google_ads\\"],iframe[name*=\\"google_ads\\"],'
    + 'div[style*\\"z-index: 2147483647\\"],'
    + 'div[data-ad-status],div[data-slot],div[data-google-container-id],'
    + 'amp-ad,amp-embed,ins.adsbygoogle'
    + '{display:none!important;visibility:hidden!important;height:0!important;max-height:0!important;overflow:hidden!important;position:fixed!important;left:-9999px!important;top:-9999px!important;opacity:0!important;pointer-events:none!important;z-index:-1!important;}'
    + ';(document.head||document.documentElement).appendChild(cs);'

    // ── L15: DOM sweep + MutationObserver ──
    + 'function bad(el){if(!el||el.nodeType!==1)return false;var t=el.tagName;'
    + '  if(t==="SCRIPT"||t==="IFRAME"||t==="LINK"){var _u=el.src||el.getAttribute("href")||"";if(D.test(_u)||AD.test(_u))return true;}'
    + '  if(t==="INS"&&el.classList.contains("adsbygoogle"))return true;'
    + '  if(t==="VIDEO"&&(el.title||"").toLowerCase().indexOf("advertis")>=0)return true;'
    + '  var c=(el.className||"")+" "+(el.id||"");return P.test(c);}'
    + 'function sweep(){'
    + '  var a=document.querySelectorAll("script,iframe,div[id],div[class],ins,amp-ad,link[rel=\\"stylesheet\\"]");'
    + '  for(var i=0;i<a.length;i++){if(bad(a[i]))a[i].remove();}'
    + '  var vids=document.querySelectorAll("video[title]");'
    + '  for(var i=0;i<vids.length;i++){if(/advertis/i.test(vids[i].title))vids[i].remove();}'
    + '  if(!document.querySelector("style[data-adblock]")){try{var _cs=document.createElement("style");_cs.setAttribute("data-adblock","1");_cs.textContent=cs.textContent;(document.head||document.documentElement).appendChild(_cs);}catch(e){}}'
    + '}'
    + 'var obs=new MutationObserver(function(m){for(var i=0;i<m.length;i++){var nd=m[i].addedNodes;for(var j=0;j<nd.length;j++){var n=nd[j];if(n.nodeType===1&&bad(n))n.remove();}}});'
    + 'if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){obs.observe(document.body||document.documentElement,{childList:true,subtree:true});sweep();});'
    + 'else{obs.observe(document.body||document.documentElement,{childList:true,subtree:true});sweep();}'
    + 'window.addEventListener("load",sweep);'
    + 'setInterval(sweep,1500);'
    + 'setTimeout(sweep,500);setTimeout(sweep,1000);setTimeout(sweep,2000);setTimeout(sweep,5000);'

    // ── L16: PerformanceObserver — hide ad resource timing entries ──
    + 'try{var _PO=window.PerformanceObserver;if(_PO){var _poObs=new _PO(function(list){'
    + '  list.getEntries().forEach(function(e){'
    + '    if(e.name&&AD.test(e.name)){try{e.name="about:blank";}catch(ex){}}});});'
    + '_poObs.observe({type:"resource",buffered:false});}}catch(e){}'

    // ── L17: Anti-fingerprinting (navigator overrides) ──
    + 'try{Object.defineProperty(navigator,"languages",{get:function(){return["en-US","en"];}});'
    + 'Object.defineProperty(navigator,"plugins",{get:function(){return[1,2,3,4,5];}});'
    + 'Object.defineProperty(navigator,"doNotTrack",{get:function(){return"1";}});'
    + 'if(window.chrome===undefined)window.chrome={runtime:{},loadTimes:function(){},csi:function(){}};}catch(e){}'

    // ── L18: Override addEventListener to catch ad detection event listeners ──
    + 'var _ael=EventTarget.prototype.addEventListener;'
    + 'EventTarget.prototype.addEventListener=function(t,fn,opts){'
    + '  if(typeof fn==="function"){'
    + '    var fs=fn.toString();'
    + '    if(/fuckAdBlock|blockAdBlock|adblock.detect|adBlocker|adsBlocked/i.test(fs))return;'
    + '  }'
    + '  return _ael.call(this,t,fn,opts);};'

    + '})()</script>';

  // Inject <base> tag + ad blocker at start of <head>
  html = html.replace(/<head([^>]*)>/i, '<head$1>' + gameBaseTag + adBlockerScript);

  return html;
}

function rewriteCss(css, baseUrl, serverHost) {
  const parsed = new URL(baseUrl);
  const baseDir = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
  const ABS = 'https://' + serverHost;

  function resolveUrl(href) {
    if (!href || href.startsWith('data:') || href.startsWith('blob:')) return href;
    if (href.startsWith('/proxy?url=')) return href;
    if (href.startsWith('http://') || href.startsWith('https://')) return ABS + '/proxy?url=' + encodeURIComponent(href);
    try { return ABS + '/proxy?url=' + encodeURIComponent(new URL(href, baseDir).href); }
    catch(e) { return href; }
  }

  css = css.replace(/url\(\s*["']?([^"')]+?)["']?\s*\)/gi, function(match, url) {
    return 'url("' + resolveUrl(url) + '")';
  });

  return css;
}

// ═══════════════════════════════════════════════════════════════
//  STRIP SECURITY HEADERS — allow iframing
// ═══════════════════════════════════════════════════════════════
function stripFrameBlocking(headers) {
  const h = { ...headers };
  delete h['x-frame-options'];
  delete h['content-security-policy'];
  delete h['x-content-type-options'];
  h['access-control-allow-origin'] = '*';
  return h;
}

// ═══════════════════════════════════════════════════════════════
//  RATE LIMITER — per-IP, sliding window
// ═══════════════════════════════════════════════════════════════
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 60; // max requests per window per IP
const RATE_LIMIT_CLEANUP = 5 * 60 * 1000;

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket.remoteAddress
    || '';
}

function isRateLimited(ip) {
  const now = Date.now();
  let entry = rateLimitMap.get(ip);
  if (!entry) {
    entry = { count: 1, start: now };
    rateLimitMap.set(ip, entry);
    return false;
  }
  if (now - entry.start > RATE_LIMIT_WINDOW) {
    entry.count = 1;
    entry.start = now;
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now - entry.start > RATE_LIMIT_WINDOW) rateLimitMap.delete(ip);
  }
}, RATE_LIMIT_CLEANUP);

// ═══════════════════════════════════════════════════════════════
//  SSRF PROTECTION — block internal/private IPs and dangerous schemes
// ═══════════════════════════════════════════════════════════════
const PRIVATE_IP_REGEX = /^(127\.\d{1,3}\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|169\.254\.\d{1,3}\.\d{1,3}|0\.0\.0\.0|localhost|\[::1\]|\[::ffff:127|\[::ffff:10\.|\[::ffff:172\.|\[::ffff:192\.168|\[0:0:0:0:0:0:0:1\])$/i;

function isSSRFBlocked(targetUrl) {
  try {
    const u = new URL(targetUrl);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return true;
    const hostname = u.hostname.toLowerCase();
    if (PRIVATE_IP_REGEX.test(hostname)) return true;
    // Block common internal hostnames
    if (/^(localhost|internal|private|local|corp|intranet|dev|staging)\b/i.test(hostname)) return true;
    // Block non-standard ports that could probe internal services
    if (u.port && !['80', '443', '8080', '8443'].includes(u.port)) return true;
    return false;
  } catch {
    return true; // invalid URL = block
  }
}

// ═══════════════════════════════════════════════════════════════
//  REQUEST BODY SIZE LIMITER
// ═══════════════════════════════════════════════════════════════
const MAX_BODY_SIZE = 1024 * 100; // 100 KB

function readBodyLimited(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY_SIZE) {
        req.destroy();
        return reject(new Error('Body too large'));
      }
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

// ═══════════════════════════════════════════════════════════════
//  SERVER
// ═══════════════════════════════════════════════════════════════
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const clientIp = getClientIp(req);

  // ── Global rate limit ──
  if (isRateLimited(clientIp)) {
    res.writeHead(429, { 'Content-Type': 'application/json', 'Retry-After': '60' });
    res.end(JSON.stringify({ error: 'Too many requests. Try again in a minute.' }));
    return;
  }

  // ── /clear-cache — Clear proxy cache (internal, localhost only) ──
  if (parsedUrl.pathname === '/clear-cache') {
    const ip = getClientIp(req);
    if (ip !== '127.0.0.1' && ip !== '::1' && ip !== '::ffff:127.0.0.1') {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }
    proxyCache.clear();
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Cache cleared. Size: ' + proxyCache.size);
    return;
  }

  // ── /proxy?url=<url> — Simple proxy (cached) ────────────────
  if (parsedUrl.pathname === '/proxy') {
    const targetUrl = parsedUrl.query.url;
    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing url parameter');
      return;
    }

    // ── SSRF protection — block internal/private IPs ──
    if (isSSRFBlocked(targetUrl)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Blocked: internal/private URL not allowed' }));
      return;
    }

    // ── Block ad domains at server level ──
    const AD_DOMAINS = /pubads\.g\.doubleclick\.net|securepubads\.g\.doubleclick\.net|imasdk\.googleapis\.com|google-analytics\.com|analytics\.google\.com|pagead2\.googlesyndication\.com|adservice\.google\.com|ep1\.adtrafficquality\.google|ep2\.adtrafficquality\.google|doubleclick\.net|loko8\.com|googletagmanager\.com|googletagservices\.com|googleadservices\.com|adnxs\.com|adsrvr\.com|adform\.net|rubiconproject\.com|openx\.net|criteo\.com|casalemedia\.com|indexexchange\.com|amazon-adsystem\.com|aps\.amazon\.com|connatix\.com|medianet\.com|teads\.com|supportxmr\.com|coinhive\.com|coinhive\.net|coin-hive\.com|cryptoloot\.com|coinimp\.com|webminepool\.com|authedmine\.com/i;
    if (AD_DOMAINS.test(targetUrl)) {
      res.writeHead(200, { 'Content-Type': 'text/plain', 'X-Blocked': 'ad-domain' });
      res.end('');
      return;
    }

    const cached = cacheGet(targetUrl);
    if (cached) {
      // Check If-None-Match for 304 responses
      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch && cached.etag && ifNoneMatch === cached.etag) {
        res.writeHead(304, { 'Cache-Control': 'public, max-age=86400', 'ETag': cached.etag });
        res.end();
        return;
      }
      const headers = stripFrameBlocking(cached.headers);
      headers['X-Cache'] = 'HIT';
      headers['Cache-Control'] = 'public, max-age=86400';
      headers['ETag'] = cached.etag;
      res.writeHead(cached.statusCode, headers);
      res.end(cached.body);
      return;
    }

    try {
      const result = await fetchUrl(targetUrl);
      cacheSet(targetUrl, result.statusCode, result.headers, result.body);
      const headers = stripFrameBlocking(result.headers);
      headers['X-Cache'] = 'MISS';
      headers['Cache-Control'] = 'public, max-age=86400';
      res.writeHead(result.statusCode, headers);
      res.end(result.body);
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Proxy error: ' + err.message);
    }
    return;
  }

  // ── /play/<hash>/<path> — Path-based proxy (same-origin for ES modules) ─
  const playPathMatch = parsedUrl.pathname.match(/^\/play\/([a-zA-Z0-9_-]+)(\/.*)?$/);
  if (playPathMatch) {
    const hash = playPathMatch[1];
    const subPath = playPathMatch[2] || '/';
    const cdnBase = 'https://html5.gamemonetize.co/' + hash + '/';
    const targetUrl = cdnBase + (subPath === '/' ? '' : subPath.substring(1));

    const cacheKey = 'playpath:v18:' + targetUrl;
    const cached = cacheGet(cacheKey);
    if (cached) {
      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch && cached.etag && ifNoneMatch === cached.etag) {
        res.writeHead(304, { 'Cache-Control': 'public, max-age=86400', 'ETag': cached.etag });
        res.end();
        return;
      }
      const headers = stripFrameBlocking(cached.headers);
      headers['X-Cache'] = 'HIT';
      headers['Cache-Control'] = 'public, max-age=86400';
      headers['ETag'] = cached.etag;
      res.writeHead(cached.statusCode, headers);
      res.end(cached.body);
      return;
    }

    try {
      const result = await fetchUrl(targetUrl);
      const contentType = (result.headers['content-type'] || '').toLowerCase();
      const proxyBase = 'https://' + req.headers.host + '/play/' + hash + '/';

      if (contentType.includes('text/html')) {
        let html = result.body.toString('utf-8');
        html = rewriteHtml(html, targetUrl, req.headers.host, proxyBase);
        const headers = stripFrameBlocking(result.headers);
        headers['content-type'] = 'text/html; charset=utf-8';
        delete headers['content-length'];
        headers['X-Cache'] = 'MISS';
        headers['Cache-Control'] = 'public, max-age=86400';
        cacheSet(cacheKey, result.statusCode, result.headers, Buffer.from(html, 'utf-8'));
        res.writeHead(result.statusCode, headers);
        res.end(html);
      } else if (contentType.includes('text/css')) {
        let css = result.body.toString('utf-8');
        css = rewriteCss(css, targetUrl, req.headers.host);
        const headers = stripFrameBlocking(result.headers);
        headers['content-type'] = 'text/css; charset=utf-8';
        delete headers['content-length'];
        headers['X-Cache'] = 'MISS';
        headers['Cache-Control'] = 'public, max-age=86400';
        cacheSet(cacheKey, result.statusCode, result.headers, Buffer.from(css, 'utf-8'));
        res.writeHead(result.statusCode, headers);
        res.end(css);
      } else {
        const headers = stripFrameBlocking(result.headers);
        headers['X-Cache'] = 'MISS';
        headers['Cache-Control'] = 'public, max-age=86400';
        cacheSet(cacheKey, result.statusCode, result.headers, result.body);
        res.writeHead(result.statusCode, headers);
        res.end(result.body);
      }
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Proxy error: ' + err.message);
    }
    return;
  }

  // ── /play?url=<url> — Smart proxy with URL rewriting (cached) ─
  if (parsedUrl.pathname === '/play') {
    const targetUrl = parsedUrl.query.url;
    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing url parameter');
      return;
    }

    // ── SSRF protection — block internal/private IPs ──
    if (isSSRFBlocked(targetUrl)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Blocked: internal/private URL not allowed' }));
      return;
    }

    const cacheKey = 'play:v18:' + targetUrl;
    const cached = cacheGet(cacheKey);
    if (cached) {
      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch && cached.etag && ifNoneMatch === cached.etag) {
        res.writeHead(304, { 'Cache-Control': 'public, max-age=86400', 'ETag': cached.etag });
        res.end();
        return;
      }
      const headers = stripFrameBlocking(cached.headers);
      headers['X-Cache'] = 'HIT';
      headers['Cache-Control'] = 'public, max-age=86400';
      headers['ETag'] = cached.etag;
      res.writeHead(cached.statusCode, headers);
      res.end(cached.body);
      return;
    }

    try {
      const result = await fetchUrl(targetUrl);
      const contentType = (result.headers['content-type'] || '').toLowerCase();

      if (contentType.includes('text/html')) {
        let html = result.body.toString('utf-8');
        html = rewriteHtml(html, targetUrl, req.headers.host);
        const headers = stripFrameBlocking(result.headers);
        headers['content-type'] = 'text/html; charset=utf-8';
        delete headers['content-length'];
        headers['X-Cache'] = 'MISS';
        headers['Cache-Control'] = 'public, max-age=86400';
        cacheSet(cacheKey, result.statusCode, result.headers, Buffer.from(html, 'utf-8'));
        res.writeHead(result.statusCode, headers);
        res.end(html);
      } else if (contentType.includes('text/css')) {
        let css = result.body.toString('utf-8');
        css = rewriteCss(css, targetUrl, req.headers.host);
        const headers = stripFrameBlocking(result.headers);
        headers['content-type'] = 'text/css; charset=utf-8';
        delete headers['content-length'];
        headers['X-Cache'] = 'MISS';
        headers['Cache-Control'] = 'public, max-age=86400';
        cacheSet(cacheKey, result.statusCode, result.headers, Buffer.from(css, 'utf-8'));
        res.writeHead(result.statusCode, headers);
        res.end(css);
      } else {
        const headers = stripFrameBlocking(result.headers);
        headers['X-Cache'] = 'MISS';
        headers['Cache-Control'] = 'public, max-age=86400';
        cacheSet(cacheKey, result.statusCode, result.headers, result.body);
        res.writeHead(result.statusCode, headers);
        res.end(result.body);
      }
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Proxy error: ' + err.message);
    }
    return;
  }

  // ── /api/votes/:gameId — Get vote counts + user's vote ──────
  const votesMatch = parsedUrl.pathname.match(/^\/api\/votes\/(.+)$/);
  if (votesMatch && req.method === 'GET') {
    const gameId = votesMatch[1];
    const fingerprint = parsedUrl.query.fingerprint || '';
    try {
      const { supabase, supabaseAdmin } = require('./supabase-config');
      const { data: game } = await supabase.from('games').select('likes, dislikes').eq('id', gameId).single();
      let userVote = null;
      if (fingerprint) {
        const { data: voteRows } = await supabase.from('votes').select('vote').eq('game_id', gameId).eq('fingerprint', fingerprint);
        if (voteRows && voteRows.length > 0) userVote = voteRows[0].vote;
      }
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ likes: game?.likes || 0, dislikes: game?.dislikes || 0, userVote }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ── /api/vote — Cast or change a vote ────────────────────────
  if (parsedUrl.pathname === '/api/vote' && req.method === 'POST') {
    let body;
    try { body = await readBodyLimited(req); } catch (e) {
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Request body too large' }));
      return;
    }
    try {
      const { gameId, vote, fingerprint } = JSON.parse(body);
        if (!gameId || !fingerprint || !['like','dislike'].includes(vote)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing gameId, fingerprint, or invalid vote' }));
          return;
        }
        const { supabase } = require('./supabase-config');

        const [{ data: existingRows }, { data: game }] = await Promise.all([
          supabase.from('votes').select('vote').eq('game_id', gameId).eq('fingerprint', fingerprint),
          supabase.from('games').select('likes,dislikes').eq('id', gameId).single()
        ]);

        let oldVote = existingRows && existingRows.length > 0 ? existingRows[0].vote : null;
        let finalVote = null;

        if (vote === oldVote) {
          const { error: delErr } = await supabase.from('votes').delete()
            .eq('game_id', gameId).eq('fingerprint', fingerprint);
          if (delErr) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: delErr.message, code: delErr.code }));
            return;
          }
          finalVote = null;
        } else {
          const { error: insErr } = await supabase.from('votes').upsert(
            { game_id: gameId, fingerprint, vote },
            { onConflict: 'game_id,fingerprint' }
          );
          if (insErr) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: insErr.message, code: insErr.code }));
            return;
          }
          finalVote = vote;
        }

        let likes = game?.likes || 0;
        let dislikes = game?.dislikes || 0;

        if (oldVote === 'like') likes--;
        else if (oldVote === 'dislike') dislikes--;

        if (vote !== oldVote) {
          if (vote === 'like') likes++;
          else if (vote === 'dislike') dislikes++;
        }

        if (likes < 0) likes = 0;
        if (dislikes < 0) dislikes = 0;

        await supabase.from('games').update({ likes, dislikes }).eq('id', gameId);

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ likes, dislikes, userVote: finalVote }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    return;
  }

  // ── /api/trending — Top games by net votes ───────────────────
  if (parsedUrl.pathname === '/api/trending' && req.method === 'GET') {
    try {
      const { supabase } = require('./supabase-config');
      const limit = parseInt(parsedUrl.query.limit) || 20;
      const { data, error } = await supabase.from('games')
        .select('id, title, category, likes, dislikes')
        .order('likes', { ascending: false })
        .limit(limit);
      if (error) throw error;
      // Sort by net votes (likes - dislikes) client-side since Supabase can't do computed column ordering easily
      const sorted = (data || []).sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes));
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify(sorted));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ── /api/game/:id — Get single game with vote counts ─────────
  const gameMatch = parsedUrl.pathname.match(/^\/api\/game\/(.+)$/);
  if (gameMatch && req.method === 'GET') {
    const gameId = gameMatch[1];
    try {
      const { supabase } = require('./supabase-config');
      const { data } = await supabase.from('games').select('*').eq('id', gameId).single();
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify(data || { error: 'Not found' }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // ── /api/favorites/:fingerprint — Get user's favorites ──────
  const favsMatch = parsedUrl.pathname.match(/^\/api\/favorites\/(.+)$/);
  if (favsMatch && req.method === 'GET') {
    const fingerprint = favsMatch[1];
    try {
      const { supabase } = require('./supabase-config');
      const { data } = await supabase.from('favorites').select('game_id').eq('fingerprint', fingerprint);
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify((data || []).map(f => f.game_id)));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (parsedUrl.pathname === '/api/favorites/add' && req.method === 'POST') {
    let body;
    try { body = await readBodyLimited(req); } catch (e) {
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Request body too large' }));
      return;
    }
    try {
      const { gameId, fingerprint } = JSON.parse(body);
        if (!gameId || !fingerprint) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing gameId or fingerprint' }));
          return;
        }
        const { supabase } = require('./supabase-config');
        await supabase.from('favorites').upsert({ game_id: gameId, fingerprint }, { onConflict: 'game_id,fingerprint' });
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    return;
  }

  if (parsedUrl.pathname === '/api/favorites/remove' && req.method === 'POST') {
    let body;
    try { body = await readBodyLimited(req); } catch (e) {
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Request body too large' }));
      return;
    }
    try {
      const { gameId, fingerprint } = JSON.parse(body);
        if (!gameId || !fingerprint) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing gameId or fingerprint' }));
          return;
        }
        const { supabase } = require('./supabase-config');
        await supabase.from('favorites').delete().eq('game_id', gameId).eq('fingerprint', fingerprint);
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    return;
  }

  // ── OPTIONS preflight for API routes ─────────────────────────
  if (parsedUrl.pathname.startsWith('/api/') && req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    });
    res.end();
    return;
  }

  // ── Redirect /index.html to / ──────────────────────────────────
  if (parsedUrl.pathname === '/index.html') {
    res.writeHead(301, { 'Location': '/' });
    res.end();
    return;
  }

  // ── Static file serving ─────────────────────────────────────
  let filePath = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));

  // ── Path traversal protection — resolve and verify path is within ROOT ──
  filePath = path.resolve(filePath);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }
  if (filePath === ROOT || (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory())) {
    const defaultFile = path.join(filePath, 'index.html');
    if (fs.existsSync(defaultFile)) {
      filePath = defaultFile;
    } else {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
  }
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  let mime = MIME[ext] || 'application/octet-stream';
  if (!ext && filePath.endsWith('config')) mime = 'application/javascript';

  let cacheControl = 'public, max-age=300';
  if (ext === '.html' || ext === '.htm') cacheControl = 'no-store, must-revalidate';
  else if (ext === '.js' || ext === '.css') cacheControl = 'public, max-age=86400, immutable';
  else if (ext === '.png' || ext === '.jpg' || ext === '.svg' || ext === '.gif' || ext === '.webp') cacheControl = 'public, max-age=604800, immutable';

  const isHtml = ext === '.html' || ext === '.htm';
  res.writeHead(200, Object.assign(securityHeaders(), {
    'Content-Type': mime,
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': cacheControl,
    ...(isHtml ? { 'X-Frame-Options': 'SAMEORIGIN' } : {}),
  }));
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`EggerMath server running at http://localhost:${PORT}`);
  console.log(`  Proxy:    /proxy?url=<encoded-url>  (cached)`);
  console.log(`  Player:   /play?url=<encoded-url>   (cached + rewritten)`);
});
