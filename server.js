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
//  HTML / CSS REWRITING — routes sub-resources through /proxy
// ═══════════════════════════════════════════════════════════════
function rewriteHtml(html, baseUrl) {
  const parsed = new URL(baseUrl);
  const origin = parsed.origin;
  const baseDir = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);

  // Inject fetch/XHR interceptor so dynamically-created relative URLs go through proxy
  const interceptor = '<script>'
    + '(function(){'
    + 'var ORIGIN="' + origin + '";'
    + 'var BASE="' + baseDir + '";'
    + 'function toProxy(u){'
    + '  if(!u||typeof u!=="string") return u;'
    + '  if(u.indexOf("data:")==0||u.indexOf("javascript:")==0||u.indexOf("blob:")==0||u.indexOf("about:")==0) return u;'
    + '  if(u.indexOf("/proxy?url=")==0||u.indexOf("/play?url=")==0) return u;'
    + '  if(u.indexOf("//")==0) u="https:"+u;'
    + '  else if(u.indexOf("http")!=0) u=BASE+u;'
    + '  var loc=location.origin;'
    + '  if(u.indexOf(loc)==0) u=BASE+u.substring(loc.length+1);'
    + '  return "/proxy?url="+encodeURIComponent(u);'
    + '}'
    // Fetch interceptor — only rewrite string URLs
    + 'var origFetch=window.fetch;'
    + 'window.fetch=function(r,opts){'
    + '  if(typeof r==="string") return origFetch.call(this,toProxy(r),opts);'
    + '  return origFetch.call(this,r,opts);'
    + '};'
    // XHR interceptor — rewrite ALL URLs (sync and async)
    // Sync XHR + responseType error is non-fatal; skipping breaks relative URL resolution
    + 'var origOpen=XMLHttpRequest.prototype.open;'
    + 'XMLHttpRequest.prototype.open=function(m,u,a,w,p){'
    + '  return origOpen.call(this,m,toProxy(u),a,w,p);'
    + '};'
    // createElement interceptor — only patch script src, wrapped in try/catch
    + 'var origCreate=Document.prototype.createElement;'
    + 'Document.prototype.createElement=function(tag){'
    + '  var el=origCreate.call(this,tag);'
    + '  if(tag&&tag.toLowerCase&&tag.toLowerCase()==="script"){'
    + '    try{'
    + '      var origSrc=Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype,"src");'
    + '      if(origSrc&&origSrc.set){'
    + '        Object.defineProperty(el,"src",{'
    + '          get:function(){return origSrc.get.call(this);},'
    + '          set:function(v){origSrc.set.call(this,toProxy(v));},'
    + '          configurable:true'
    + '        });'
    + '      }'
    + '    }catch(e){}'
    + '  }'
    + '  return el;'
    + '};'
    + '})()</script>';

  // Inject ad-hiding CSS — hides common ad containers, overlays, and popups
  const adBlockCss = '<style>'
    + '[id*="ad" i][class*="banner" i],'
    + '[class*="ad-container" i],'
    + '[class*="ad-wrapper" i],'
    + '[class*="ad-overlay" i],'
    + '[class*="ad-popup" i],'
    + '[class*="ad-modal" i],'
    + '[class*="adsbygoogle" i],'
    + '[class*="google-ad" i],'
    + '[id*="google_ads" i],'
    + '[id*="adfox" i],'
    + '[class*="adfox" i],'
    + '[id*="yandex_ad" i],'
    + '[class*="yandex" i][class*="ad" i],'
    + '[id*="adbreak" i],'
    + '[class*="adbreak" i],'
    + '[id*="preroll" i],'
    + '[class*="preroll" i],'
    + '[id*="interstitial" i],'
    + '[class*="interstitial" i],'
    + '[id*="rewarded" i],'
    + '[class*="rewarded" i],'
    + '[id*="sponsor" i],'
    + '[class*="sponsor" i],'
    + '[id*="promo" i]:not(.game-card):not(.sidebar-promo),'
    + '[class*="promo" i]:not(.game-card):not(.sidebar-promo),'
    + 'iframe[src*="ad" i],'
    + 'iframe[src*="doubleclick" i],'
    + 'iframe[src*="googlesyndication" i],'
    + 'iframe[src*="adskeeper" i],'
    + 'iframe[src*="propellerads" i],'
    + 'iframe[src*="monetag" i],'
    + 'iframe[src*="adsterra" i],'
    + 'iframe[src*="gamemonetize" i][src*="ad" i],'
    + '[data-ad],'
    + '[data-ads],'
    + '[data-ad-unit],'
    + '[data-ad-slot],'
    + '.ad, .ads, .adv, .adv-container,'
    + '#ad, #ads, #adv'
    + '{display:none !important; visibility:hidden !important; '
    + 'width:0 !important; height:0 !important; '
    + 'max-width:0 !important; max-height:0 !important; '
    + 'overflow:hidden !important; margin:0 !important; padding:0 !important;}'
    + '</style>';

  // Inject ad-removal JS — watches for dynamically injected ad elements and removes them
  const adBlockJs = '<script>'
    + '(function(){'
    + 'var AD_PATTERNS=/ad[-_]?container|ad[-_]?wrapper|ad[-_]?overlay|ad[-_]?popup|'
    + 'adsbygoogle|google[-_]?ad|yandex[-_]?ad|adbreak|preroll|interstitial|'
    + 'rewarded[-_]?ad|sponsor|promo[-_]?banner|adfox|adskeeper|propellerads|'
    + 'monetag|adsterra|ad[-_]?banner|ad[-_]?slot|ad[-_]?unit|ad[-_]?modal/i;'
    + 'var AD_TAG_NAMES={SCRIPT:1,IFRAME:1};'
    + 'var AD_DOMAINS=[\'googlesyndication\',\'googleadservices\',\'doubleclick\','
    + '\'adskeeper\',\'propellerads\',\'monetag\',\'adsterra\',\'adfox\',\'exoclick\'];'
    + 'function isAd(el){'
    + '  if(el.nodeType!==1)return false;'
    + '  var t=el.tagName;'
    + '  if(AD_TAG_NAMES[t]){'
    + '    var s=el.src||el.getAttribute(\'data-src\')||\'\';'
    + '    for(var i=0;i<AD_DOMAINS.length;i++){'
    + '      if(s.indexOf(AD_DOMAINS[i])!==-1)return true;'
    + '    }'
    + '  }'
    + '  var c=(el.className||\'\')+\' \'+(el.id||\'\');'
    + '  if(AD_PATTERNS.test(c))return true;'
    + '  return false;'
    + '}'
    + 'function sweep(){'
    + '  var els=document.querySelectorAll(\'script[src],iframe[src],div[id],div[class]\');'
    + '  for(var i=0;i<els.length;i++){'
    + '    if(isAd(els[i])){els[i].remove();}'
    + '  }'
    + '}'
    + 'var obs=new MutationObserver(function(muts){'
    + '  for(var i=0;i<muts.length;i++){'
    + '    var added=muts[i].addedNodes;'
    + '    for(var j=0;j<added.length;j++){'
    + '      var n=added[j];'
    + '      if(n.nodeType===1&&isAd(n)){n.remove();}'
    + '    }'
    + '  }'
    + '});'
    + 'if(document.body){'
    + '  obs.observe(document.body,{childList:true,subtree:true});'
    + '  sweep();'
    + '}'
    + 'if(document.readyState==="loading"){'
    + '  document.addEventListener("DOMContentLoaded",function(){'
    + '    obs.observe(document.body,{childList:true,subtree:true});'
    + '    sweep();'
    + '  });'
    + '}'
    + 'setInterval(sweep,3000);'
    + '})()</script>';

  html = html.replace(/<head([^>]*)>/i, '<head$1>' + interceptor + adBlockCss + adBlockJs);

  // Protect <script> tag bodies from regex rewriting — the inline JS must not be touched
  const protectedScripts = [];
  html = html.replace(
    /(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi,
    (match, openTag, body, closeTag) => {
      protectedScripts.push(body);
      return openTag + '\x00SCRIPT_' + (protectedScripts.length - 1) + '\x00' + closeTag;
    }
  );

  html = html.replace(/((?:src|href|poster|action|data-src|data-url|srcset)\s*=\s*["'])(?!(?:data:|javascript:|#|blob:))([^"']+)(["'])/gi, (match, prefix, value, suffix) => {
    if (value.startsWith('http://') || value.startsWith('https://'))
      return prefix + '/proxy?url=' + encodeURIComponent(value) + suffix;
    if (value.startsWith('//'))
      return prefix + '/proxy?url=' + encodeURIComponent('https:' + value) + suffix;
    if (value.startsWith('/'))
      return prefix + '/proxy?url=' + encodeURIComponent(origin + value) + suffix;
    return prefix + '/proxy?url=' + encodeURIComponent(new URL(value, baseUrl).href) + suffix;
  });

  html = html.replace(/(url\s*\(\s*["']?)(?!(?:data:|javascript:|#|blob:))([^"')]+)(["']?\s*\))/gi, (match, prefix, value, suffix) => {
    if (value.startsWith('http://') || value.startsWith('https://'))
      return prefix + '/proxy?url=' + encodeURIComponent(value) + suffix;
    if (value.startsWith('//'))
      return prefix + '/proxy?url=' + encodeURIComponent('https:' + value) + suffix;
    if (value.startsWith('/'))
      return prefix + '/proxy?url=' + encodeURIComponent(origin + value) + suffix;
    return prefix + '/proxy?url=' + encodeURIComponent(new URL(value, baseUrl).href) + suffix;
  });

  // Restore protected <script> bodies
  for (let i = 0; i < protectedScripts.length; i++) {
    html = html.replace('\x00SCRIPT_' + i + '\x00', protectedScripts[i]);
  }

  return html;
}

function rewriteCss(css, baseUrl) {
  const origin = new URL(baseUrl).origin;
  css = css.replace(/(url\s*\(\s*["']?)(?!(?:data:|javascript:|#|blob:))([^"')]+)(["']?\s*\))/gi, (match, prefix, value, suffix) => {
    if (value.startsWith('http://') || value.startsWith('https://'))
      return prefix + '/proxy?url=' + encodeURIComponent(value) + suffix;
    if (value.startsWith('//'))
      return prefix + '/proxy?url=' + encodeURIComponent('https:' + value) + suffix;
    if (value.startsWith('/'))
      return prefix + '/proxy?url=' + encodeURIComponent(origin + value) + suffix;
    return prefix + '/proxy?url=' + encodeURIComponent(new URL(value, baseUrl).href) + suffix;
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

  // ── /proxy?url=<url> — Simple proxy (cached) ────────────────
  if (parsedUrl.pathname === '/proxy') {
    const targetUrl = parsedUrl.query.url;
    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing url parameter');
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

    const cacheKey = 'play:' + targetUrl;
    const cached = cacheGet(cacheKey);
    if (cached) {
      const headers = stripFrameBlocking(cached.headers);
      headers['X-Cache'] = 'HIT';
      res.writeHead(cached.statusCode, headers);
      res.end(cached.body);
      return;
    }

    try {
      const result = await fetchUrl(targetUrl);
      const contentType = (result.headers['content-type'] || '').toLowerCase();

      if (contentType.includes('text/html')) {
        let html = result.body.toString('utf-8');
        html = rewriteHtml(html, targetUrl);
        const headers = stripFrameBlocking(result.headers);
        headers['content-type'] = 'text/html; charset=utf-8';
        delete headers['content-length'];
        headers['X-Cache'] = 'MISS';
        cacheSet(cacheKey, result.statusCode, result.headers, Buffer.from(html, 'utf-8'));
        res.writeHead(result.statusCode, headers);
        res.end(html);
      } else if (contentType.includes('text/css')) {
        let css = result.body.toString('utf-8');
        css = rewriteCss(css, targetUrl);
        const headers = stripFrameBlocking(result.headers);
        headers['content-type'] = 'text/css; charset=utf-8';
        delete headers['content-length'];
        headers['X-Cache'] = 'MISS';
        cacheSet(cacheKey, result.statusCode, result.headers, Buffer.from(css, 'utf-8'));
        res.writeHead(result.statusCode, headers);
        res.end(css);
      } else {
        const headers = stripFrameBlocking(result.headers);
        headers['X-Cache'] = 'MISS';
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

        // Read existing vote
        const { data: existingRows } = await supabase.from('votes')
          .select('id, vote').eq('game_id', gameId).eq('fingerprint', fingerprint);

        let oldVote = null;
        if (existingRows && existingRows.length > 0) {
          oldVote = existingRows[0].vote;
        }

        let finalVote = null;

        if (vote === oldVote) {
          // Toggle off — delete the vote row
          const { error: delErr } = await supabase.from('votes').delete()
            .eq('game_id', gameId).eq('fingerprint', fingerprint);
          if (delErr) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: delErr.message, code: delErr.code }));
            return;
          }
          finalVote = null;
        } else {
          // Upsert new/changed vote
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

        // Recount from votes table
        const { data: allVotes } = await supabase.from('votes')
          .select('vote').eq('game_id', gameId);

        let likes = 0, dislikes = 0;
        if (allVotes) {
          for (const v of allVotes) {
            if (v.vote === 'like') likes++;
            else if (v.vote === 'dislike') dislikes++;
          }
        }

        // Update game counts
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

  res.writeHead(200, {
    'Content-Type': mime,
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': cacheControl,
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`EggerMath server running at http://localhost:${PORT}`);
  console.log(`  Proxy:    /proxy?url=<encoded-url>  (cached)`);
  console.log(`  Player:   /play?url=<encoded-url>   (cached + rewritten)`);
});
