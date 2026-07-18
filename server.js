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
const CACHE_TTL = 60 * 1000; // 60 seconds for proxy, /thumb uses 3 days

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
  proxyCache.set(key, { statusCode, headers, body, ts: Date.now() });
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
function rewriteHtml(html, baseUrl, serverHost) {
  const parsed = new URL(baseUrl);
  const origin = parsed.origin;
  const baseDir = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
  const ABS = 'https://' + serverHost;

  function resolveUrl(href) {
    if (!href || href.startsWith('data:') || href.startsWith('blob:') || href.startsWith('javascript:')) return href;
    if (href.startsWith('/proxy?url=')) return href;
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
  html = html.replace(/<script[^>]*src=["'][^"']*api\.gamemonetize\.com[^"']*["'][^>]*>[\s\S]*?<\/script>/gi, '');
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

  // ── Inject <base> tag pointing to original CDN + ad blocker at start of <head> ──
  var gameBaseTag = '<base href="' + baseDir + '"><script>window.__GAME_BASE__="' + baseDir + '";window.__ABS_PROXY__="' + ABS + '";</script>';

  var adBlockerScript = '<script>'
    + '(function(){'
    + 'var GB=window.__GAME_BASE__||"";'
    + 'var ABS=window.__ABS_PROXY__||"";'
    + 'function px(u){'
    + '  if(!u||typeof u!=="string")return u;'
    + '  if(/^(data:|blob:|javascript:|about:)/.test(u))return u;'
    + '  if(/^\\/proxy/.test(u))return u;'
    + '  if(/https?:\\/\\/[^/]*eggermath\\.com/.test(u)){'
    + '    if(GB&&/\\/proxy/.test(u))return u;'
    + '    if(GB){try{var p=new URL(u).pathname;return ABS+"/proxy?url="+encodeURIComponent(GB+p);}catch(e){}}'
    + '    return u;'
    + '  }'
    + '  try{u=new URL(u,document.baseURI).href;}catch(e){}'
    + '  return ABS+"/proxy?url="+encodeURIComponent(u);'
    + '}'

    // Ad domain regex
    + 'var AD=new RegExp(['
    + '"api\\\\.gamemonetize\\\\.com",'
    + '"gamemonetize\\\\.com/sdk",'
    + '"cdn\\\\.gamemonetize\\\\.com.*sdk",'
    + '"pagead2\\\\.googlesyndication\\\\.com",'
    + '"adservice\\\\.google\\\\.com",'
    + '"google\\\\.com/pagead",'
    + '"google\\\\.com/js/gcm",'
    + '"doubleclick\\\\.net",'
    + '"imasdk\\\\.googleapis\\\\.com",'
    + '"adskeeper",'
    + '"propellerads",'
    + '"monetag",'
    + '"adsterra",'
    + '"exoclick",'
    + '"juicyads",'
    + '"trafficjunky",'
    + '"revcontent",'
    + '"taboola",'
    + '"outbrain",'
    + '"clickadu",'
    + '"hilltopads",'
    + '"popcash",'
    + '"popads",'
    + '"fuckadblock",'
    + '"blockadblock",'
    + '"adsafeprotected\\\\.com",'
    + '"prebid\\\\.org",'
    + '"coinhive\\\\.com",'
    + '"coinhive\\\\.net",'
    + '"cryptoloot\\\\.com",'
    + '"cryptonoter\\\\.com",'
    + '"crypto-loot",'
    + '"miner\\\\.start",'
    + '"coinimp\\\\.com",'
    + '"authedmine\\\\.com",'
    + '"webminepool",'
    + '"gtag\\\\.js",'
    + '"ga\\\\.js",'
    + '"analytics\\\\.js",'
    + '"loko8\\\\.com",'
    + '"adtrafficquality\\\\.google"'
    + '].join("|"));'

    // SDK stubs
    + 'window.sdk={showBanner:function(){},'
    + 'showInterstitial:function(){},'
    + 'showRewardedVideo:function(cb){if(cb)cb(false);},'
    + 'addEventListener:function(){},removeEventListener:function(){},'
    + 'gameData:{},isReady:false};'
    + 'window.SDK_OPTIONS={gameId:"stub",onEvent:function(){}};'
    + 'window.idhbgd=window.sdk;window.gdsdk=window.sdk;'
    + 'window.google={ima:{AdsRequest:function(){},'
    + 'AdsManager:function(){this.init=function(){};this.start=function(){};'
    + 'this.stop=function(){};this.destroy=function(){};'
    + 'this.addEventListener=function(){};this.resize=function(){};'
    + 'this.getAdProgressInfo=function(){return{duration:0,currentTime:0};}},'
    + 'AdsManagerLoadedEvent:function(){},'
    + 'AdDisplayContainer:function(){this.initialize=function(){};},'
    + 'ImaSdkSettings:function(){this.setVpaidMode=function(){};'
    + 'this.setPlayerType=function(){};this.setPlayerVersion=function(){};},'
    + 'SdkAdTechErrorEvent:function(){},AdEvent:function(){},AdErrorEvent:function(){}}};'
    + 'window.pbjs=window.pbjs||{que:[],cmd:[],push:function(f){f();}};'
    + 'window.adsbygoogle=[];window.__gads=undefined;window.google_ads=[];'
    + 'window.fuckAdBlock=false;window.blockAdBlock=false;window.canRunAds=true;'
    + 'window.AdBlockDetect=false;window.adBlockEnabled=false;'

    // Script src setter — block ads + proxy cross-origin scripts
    + 'var OSD=Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype,"src");'
    + 'if(OSD&&OSD.set){try{Object.defineProperty(HTMLScriptElement.prototype,"src",{'
    + 'get:function(){return OSD.get.call(this);},'
    + 'set:function(v){'
    + '  if(v&&AD.test(String(v)))return;'
    + '  if(v&&typeof v==="string"&&!/^(data:|blob:|javascript:)/.test(v)){'
    + '    try{var u=new URL(v,document.baseURI);'
    + '    if(u.origin!==location.origin){'
    + '      v=ABS+"/proxy?url="+encodeURIComponent(u.href);'
    + '    }else if(GB&&u.pathname&&u.origin===location.origin&&!/^\\/proxy/.test(u.pathname)){'
    + '      v=ABS+"/proxy?url="+encodeURIComponent(GB+u.pathname+(u.search||""));'
    + '    }}catch(e){}'
    + '  }'
    + '  return OSD.set.call(this,v);'
    + '},'
    + 'configurable:true,enumerable:true'
    + '});}catch(e){}}'

    // Image src setter — proxy cross-origin images for CORS
    + 'var OI=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,"src");'
    + 'if(OI&&OI.set){try{Object.defineProperty(HTMLImageElement.prototype,"src",{'
    + 'get:function(){return OI.get.call(this);},'
    + 'set:function(v){'
    + '  if(v&&typeof v==="string"&&!/^(data:|blob:|javascript:|about:)/.test(v)){'
    + '    try{var u=new URL(v,document.baseURI);'
    + '    if(u.origin!==location.origin){'
    + '      v=ABS+"/proxy?url="+encodeURIComponent(u.href);'
    + '    }}catch(e){}'
    + '  }'
    + '  return OI.set.call(this,v);'
    + '},'
    + 'configurable:true,enumerable:true'
    + '});}catch(e){}}'

    // setAttribute — block ads + proxy cross-origin script AND image src
    + 'var OSA=Element.prototype.setAttribute;'
    + 'Element.prototype.setAttribute=function(n,v){'
    + '  if(n==="src"&&typeof v==="string"){'
    + '    if(this.tagName==="SCRIPT"){'
    + '      if(AD.test(v))return;'
    + '      try{var u=new URL(v,document.baseURI);'
    + '      if(u.origin!==location.origin){'
    + '        v=ABS+"/proxy?url="+encodeURIComponent(u.href);'
    + '      }}catch(e){}'
    + '    }else if(this.tagName==="IMG"){'
    + '      if(!/^(data:|blob:|javascript:|about:)/.test(v)){'
    + '        try{var u2=new URL(v,document.baseURI);'
    + '        if(u2.origin!==location.origin){'
    + '          v=ABS+"/proxy?url="+encodeURIComponent(u2.href);'
    + '        }}catch(e){}'
    + '      }'
    + '    }'
    + '  }'
    + '  return OSA.call(this,n,v);'
    + '};'

    // appendChild — block ad scripts/iframes + proxy cross-origin scripts
    + 'var OAC=Element.prototype.appendChild;'
    + 'Element.prototype.appendChild=function(n){'
    + '  if(n&&n.tagName==="SCRIPT"){'
    + '    var s=n.src||n.getAttribute("src")||"";'
    + '    if(AD.test(s))return n;'
    + '    if(s&&typeof s==="string"&&!/^(data:|blob:|javascript:)/.test(s)){'
    + '      try{var u=new URL(s,document.baseURI);'
    + '      if(u.origin!==location.origin){'
    + '        n.setAttribute("src",ABS+"/proxy?url="+encodeURIComponent(u.href));'
    + '      }else if(GB&&u.pathname&&!/^\\/proxy/.test(u.pathname)){'
    + '        n.setAttribute("src",ABS+"/proxy?url="+encodeURIComponent(GB+u.pathname+(u.search||"")));'
    + '      }}catch(e){}'
    + '    }'
    + '  }'
    + '  if(n&&(n.tagName==="SCRIPT"||n.tagName==="IFRAME")){'
    + '    var s2=n.src||n.getAttribute("src")||"";'
    + '    if(AD.test(s2))return n;'
    + '  }'
    + '  return OAC.apply(this,arguments);'
    + '};'

    // insertBefore — block SDK insertion + proxy cross-origin scripts
    + 'var OIB=Node.prototype.insertBefore;'
    + 'Node.prototype.insertBefore=function(n,r){'
    + '  if(n&&n.tagName==="SCRIPT"){'
    + '    var s=n.src||n.getAttribute("src")||"";'
    + '    if(AD.test(s))return n;'
    + '    if(s&&typeof s==="string"&&!/^(data:|blob:|javascript:)/.test(s)){'
    + '      try{var u=new URL(s,document.baseURI);'
    + '      if(u.origin!==location.origin){'
    + '        n.setAttribute("src",ABS+"/proxy?url="+encodeURIComponent(u.href));'
    + '      }else if(GB&&u.pathname&&!/^\\/proxy/.test(u.pathname)){'
    + '        n.setAttribute("src",ABS+"/proxy?url="+encodeURIComponent(GB+u.pathname+(u.search||"")));'
    + '      }}catch(e){}'
    + '    }'
    + '  }'
    + '  if(n&&(n.tagName==="SCRIPT"||n.tagName==="IFRAME")){'
    + '    var s2=n.src||n.getAttribute("src")||"";'
    + '    if(AD.test(s2))return n;'
    + '  }'
    + '  return OIB.apply(this,arguments);'
    + '};'

    // Fetch — block ads + proxy all URLs for CORS
    + 'var OF=window.fetch;'
    + 'window.fetch=function(r,o){'
    + '  var u=typeof r==="string"?r:(r instanceof Request?r.url:"");'
    + '  if(u&&AD.test(u)){'
    + '    return Promise.resolve(new Response("",{status:200,headers:{"Content-Type":"text/plain"}}));'
    + '  }'
    + '  if(typeof r==="string")return OF.call(window,px(r),o);'
    + '  return OF.apply(this,arguments);'
    + '};'

    // XHR — block ads + proxy all URLs for CORS
    + 'var OO=XMLHttpRequest.prototype.open;'
    + 'var OSend=XMLHttpRequest.prototype.send;'
    + 'XMLHttpRequest.prototype.open=function(m,u){'
    + '  if(typeof u==="string"){'
    + '    if(AD.test(u)){this._ab=true;return OO.call(this,m,"about:blank");}'
    + '    u=px(u);'
    + '    this._ab=false;'
    + '    return OO.call(this,m,u);'
    + '  }'
    + '  this._ab=false;'
    + '  return OO.apply(this,arguments);'
    + '};'
    + 'XMLHttpRequest.prototype.send=function(d){'
    + '  if(this._ab)return;'
    + '  return OSend.apply(this,arguments);'
    + '};'

    // sendBeacon — block ads
    + 'var OSB=navigator.sendBeacon;'
    + 'if(OSB){navigator.sendBeacon=function(u,d){'
    + '  if(u&&AD.test(String(u)))return false;'
    + '  return OSB.apply(this,arguments);'
    + '};}'

    // Popup/popunder blocker
    + 'var OFn=window.open;'
    + 'window.open=function(u,n,f){'
    + '  if(u&&AD.test(String(u)))return null;'
    + '  try{return OFn.call(this,u,n,f);}catch(e){return null;}'
    + '};'

    // document.write interception — block ads + rewrite script src to proxy
    + 'var ODW=document.write;'
    + 'document.write=function(h){'
    + '  if(typeof h==="string"){'
    + '    if(AD.test(h))return;'
    + '    h=h.replace(/(<script\\b[^>]*\\bsrc=["\'])([^"\']*?)(["\'][^>]*>)/gi,function(m,p,u,q){'
    + '      if(!u||/^(data:|blob:|javascript:)/.test(u)||/^\\/proxy/.test(u))return m;'
    + '      try{var r=new URL(u,document.baseURI);'
    + '      if(r.origin!==location.origin){return p+ABS+"/proxy?url="+encodeURIComponent(r.href)+q;'
    + '      }}catch(e){}'
    + '      return m;'
    + '    });'
    + '  }'
    + '  return ODW.call(document,h);'
    + '};'
    + 'var ODWI=document.writeln;'
    + 'document.writeln=function(h){'
    + '  if(typeof h==="string"){'
    + '    if(AD.test(h))return;'
    + '    h=h.replace(/(<script\\b[^>]*\\bsrc=["\'])([^"\']*?)(["\'][^>]*>)/gi,function(m,p,u,q){'
    + '      if(!u||/^(data:|blob:|javascript:)/.test(u)||/^\\/proxy/.test(u))return m;'
    + '      try{var r=new URL(u,document.baseURI);'
    + '      if(r.origin!==location.origin){return p+ABS+"/proxy?url="+encodeURIComponent(r.href)+q;'
    + '      }}catch(e){}'
    + '      return m;'
    + '    });'
    + '  }'
    + '  return ODWI.call(document,h);'
    + '};'

    // CSS ad hiders — use double-quoted string with proper escaping
    + 'var cs=document.createElement("style");'
    + 'cs.textContent='
    + '"#sdk__implementation,#imaContainer,#ima-video-container,'
    + '#google_ads_frame,#adContainer,#ad-wrapper,'
    + '#preroll-overlay,#preroll-ad,#midroll-overlay,#midroll-ad,'
    + '#interstitial-overlay,#interstitial-ad,#rewarded-overlay,#rewarded-ad,'
    + '[id*=\\"ad-container\\"],[class*=\\"ad-container\\"],'
    + '[class*=\\"ad-wrapper\\"],[class*=\\"ad-overlay\\"],'
    + '[class*=\\"ad-popup\\"],[class*=\\"ad-modal\\"],'
    + '[class*=\\"adsbygoogle\\"],[class*=\\"google-ad\\"],'
    + '[id*=\\"google_ads\\"],[id*=\\"adfox\\"],[class*=\\"adfox\\"],'
    + '[id*=\\"adbreak\\"],[class*=\\"adbreak\\"],'
    + '[id*=\\"preroll\\"],[class*=\\"preroll\\"],'
    + '[id*=\\"interstitial\\"],[class*=\\"interstitial\\"],'
    + '[id*=\\"rewarded\\"],[class*=\\"rewarded\\"],'
    + '[id*=\\"sponsor\\"],[class*=\\"sponsor\\"],'
    + '[id*=\\"gmasdk\\"],[class*=\\"gmasdk\\"],'
    + '[id*=\\"midroll\\"],[class*=\\"midroll\\"],'
    + '[data-ad],[data-ads],[data-ad-unit],[data-ad-slot],'
    + '.ad,.ads,.adv,.adv-container,#ad,#ads,#adv,'
    + '.simmer,.loko,'
    + 'iframe[src*=\\"doubleclick\\"],iframe[src*=\\"googlesyndication\\"],'
    + 'iframe[src*=\\"adskeeper\\"],iframe[src*=\\"propellerads\\"],'
    + 'iframe[src*=\\"monetag\\"],iframe[src*=\\"adsterra\\"],'
    + 'iframe[src*=\\"adfox\\"],iframe[src*=\\"imasdk\\"],'
    + 'script[src*=\\"imasdk\\"],'
    + 'script[src*=\\"showBanner\\"],script[src*=\\"pubads.g.doubleclick\\"],'
    + 'script[src*=\\"pagead2.googlesyndication\\"],'
    + 'div[style*\\"z-index: 9999\\"],div[style*\\"z-index:9999\\"],'
    + 'div[style*\\"z-index: 667\\"],div[style*\\"z-index:667\\"],'
    + 'div[style*\\"z-index: 668\\"],div[style*\\"z-index:668\\"],'
    + 'div[style*\\"z-index: 2147483647\\"]'
    + '{display:none!important;visibility:hidden!important;'
    + 'width:0!important;height:0!important;'
    + 'max-width:0!important;max-height:0!important;'
    + 'overflow:hidden!important;margin:0!important;padding:0!important;}"'
    + ';(document.head||document.documentElement).appendChild(cs);'

    // MutationObserver — remove ad elements
    + 'var P=/sdk__implementation|imaContainer|ima[-_]video|google[-_]ads|'
    + 'ad[-_]?container|ad[-_]?wrapper|ad[-_]?overlay|ad[-_]?popup|'
    + 'adsbygoogle|google[-_]?ad|yandex[-_]?ad|adbreak|preroll|interstitial|'
    + 'rewarded[-_]?ad|sponsor|promo[-_]?banner|adfox|adskeeper|propellerads|'
    + 'monetag|adsterra|ad[-_]?banner|ad[-_]?slot|ad[-_]?unit|ad[-_]?modal|'
    + 'gmasdk|midroll|pre[-_]?roll|poki[-_]?ad|loko/i;'
    + 'var D=/adsbygoogle|doubleclick|googlesyndication|imasdk|'
    + 'adskeeper|propellerads|monetag|adsterra|adfox|exoclick|prebid|'
    + 'pagead|pubads|googleads|coinhive|cryptoloot|coinimp|loko8/i;'
    + 'function bad(el){'
    + '  if(!el||el.nodeType!==1)return false;'
    + '  var t=el.tagName;'
    + '  if(t==="SCRIPT"||t==="IFRAME"||t==="LINK"){'
    + '    var s=el.src||el.getAttribute("href")||"";if(D.test(s))return true;'
    + '  }'
    + '  var c=(el.className||"")+" "+(el.id||"");return P.test(c);'
    + '}'
    + 'function sweep(){'
    + '  var a=document.querySelectorAll("script,iframe,div[id],div[class],span[id],span[class]");'
    + '  for(var i=0;i<a.length;i++){if(bad(a[i]))a[i].remove();}'
    + '  document.querySelectorAll("script").forEach(function(s){'
    + '    var txt=s.textContent||"";'
    + '    if(/showBanner|showInterstitial|showRewarded|sdk\\.showBanner|'
    + 'ima\\.AdsRequest|\\.start\\(\\)|preroll|interstitial/.test(txt))s.remove();'
    + '  });'
    + '  document.querySelectorAll("[style]").forEach(function(el){'
    + '    var s=el.style.cssText||"";'
    + '    if(/z-index\\s*:\\s*(9999|667|668|2147483647)/.test(s)){'
    + '      var r=el.getBoundingClientRect();'
    + '      if(r.width>window.innerWidth*0.7&&r.height>window.innerHeight*0.7)'
    + '        el.remove();'
    + '    }'
    + '  });'
    + '}'
    + 'var obs=new MutationObserver(function(m){'
    + '  for(var i=0;i<m.length;i++){'
    + '    var n=m[i].addedNodes;'
    + '    for(var j=0;j<n.length;j++){if(bad(n[j]))n[j].remove();}'
    + '  }'
    + '});'
    + 'function start(){'
    + '  if(!document.body)return;'
    + '  obs.observe(document.body,{childList:true,subtree:true,'
    + '    attributes:true,attributeFilter:["class","id","style"]});'
    + '  sweep();'
    + '}'
    + 'if(document.readyState==="loading")'
    + '  document.addEventListener("DOMContentLoaded",start);'
    + 'else start();'
    + 'setInterval(sweep,1000);'
    + 'window.addEventListener("load",sweep);'

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
//  SERVER
// ═══════════════════════════════════════════════════════════════
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // ── /clear-cache — Clear proxy cache (internal) ──────────────
  if (parsedUrl.pathname === '/clear-cache') {
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

    // ── Block ad domains at server level ──
    const AD_DOMAINS = /api\.gamemonetize\.com|pubads\.g\.doubleclick\.net|securepubads\.g\.doubleclick\.net|imasdk\.googleapis\.com|google-analytics\.com|analytics\.google\.com|pagead2\.googlesyndication\.com|adservice\.google\.com|ep1\.adtrafficquality\.google|ep2\.adtrafficquality\.google|doubleclick\.net|loko8\.com/i;
    if (AD_DOMAINS.test(targetUrl)) {
      res.writeHead(200, { 'Content-Type': 'text/plain', 'X-Blocked': 'ad-domain' });
      res.end('');
      return;
    }

    const cached = cacheGet(targetUrl);
    if (cached) {
      const headers = stripFrameBlocking(cached.headers);
      headers['X-Cache'] = 'HIT';
      res.writeHead(cached.statusCode, headers);
      res.end(cached.body);
      return;
    }

    try {
      const result = await fetchUrl(targetUrl);
      cacheSet(targetUrl, result.statusCode, result.headers, result.body);
      const headers = stripFrameBlocking(result.headers);
      headers['X-Cache'] = 'MISS';
      res.writeHead(result.statusCode, headers);
      res.end(result.body);
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

    const cacheKey = 'play:v14:' + targetUrl;
    const cached = cacheGet(cacheKey);
    if (cached) {
      const headers = stripFrameBlocking(cached.headers);
      headers['X-Cache'] = 'HIT';
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
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
        headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
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
        headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        cacheSet(cacheKey, result.statusCode, result.headers, Buffer.from(css, 'utf-8'));
        res.writeHead(result.statusCode, headers);
        res.end(css);
      } else {
        const headers = stripFrameBlocking(result.headers);
        headers['X-Cache'] = 'MISS';
        headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
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
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
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
    });
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
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
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
    });
    return;
  }

  if (parsedUrl.pathname === '/api/favorites/remove' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
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
    });
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
  if (ext === '.html' || ext === '.htm') cacheControl = 'no-cache';
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
