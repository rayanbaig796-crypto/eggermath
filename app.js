// ────────────────────────────────────────────────────────────────
//  EggerMath client — accounts, favorites, reviews, reports
//  Talks to /api/* backend. Zero dependencies, plain JS.
// ────────────────────────────────────────────────────────────────
(function () {
  'use strict';

  var TOKEN_KEY = 'eggerMathToken';
  var USER_KEY = 'eggerMathUser';

  function getToken() { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return ''; } }
  function setToken(t) { try { if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); } catch (e) {} }
  function getUser() { try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch (e) { return null; } }
  function setUser(u) { try { if (u) localStorage.setItem(USER_KEY, JSON.stringify(u)); else localStorage.removeItem(USER_KEY); } catch (e) {} }

  function api(path, opts) {
    opts = opts || {};
    var headers = opts.headers || {};
    headers['Content-Type'] = 'application/json';
    var token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return fetch(path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        data._status = res.status;
        return data;
      });
    });
  }

  var authDone = false;
  function initAuth() {
    if (authDone) return;
    authDone = true;
    if (getUser()) return;
    api('/api/auth/me').then(function (d) {
      if (d.user && d._status === 200) setUser(d.user);
    }).catch(function () {});
  }

  // ── Modal for login / register ───────────────────────────────
  var modalEl = null;
  function modal() {
    if (modalEl) return modalEl;
    modalEl = document.createElement('div');
    modalEl.id = 'eggm-auth-modal';
    modalEl.style.cssText = 'position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);font-family:DM Sans,Segoe UI,system-ui,sans-serif;';
    modalEl.innerHTML = '' +
      '<div style="background:#1e2319;border:1px solid rgba(196,163,90,0.3);border-radius:14px;padding:28px;max-width:360px;width:90%;color:#f0ebe0;position:relative;">' +
      '<button id="eggm-modal-close" style="position:absolute;top:10px;right:14px;background:none;border:none;color:rgba(240,235,224,0.6);font-size:20px;cursor:pointer;">&times;</button>' +
      '<h2 id="eggm-modal-title" style="margin:0 0 16px;font-size:20px;color:#c4a35a;">Login</h2>' +
      '<div id="eggm-modal-err" style="display:none;background:rgba(220,53,69,0.12);border:1px solid rgba(220,53,69,0.3);color:#ff7b86;padding:8px 12px;border-radius:8px;font-size:13px;margin-bottom:12px;"></div>' +
      '<div id="eggm-reg-fields" style="display:none;">' +
      '<input id="eggm-email" type="email" placeholder="Email (optional)" style="width:100%;box-sizing:border-box;margin-bottom:10px;padding:10px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:#161a13;color:#f0ebe0;font-size:14px;">' +
      '</div>' +
      '<input id="eggm-username" type="text" placeholder="Username" style="width:100%;box-sizing:border-box;margin-bottom:10px;padding:10px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:#161a13;color:#f0ebe0;font-size:14px;">' +
      '<input id="eggm-password" type="password" placeholder="Password" style="width:100%;box-sizing:border-box;margin-bottom:16px;padding:10px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:#161a13;color:#f0ebe0;font-size:14px;">' +
      '<button id="eggm-modal-submit" style="width:100%;background:#c4a35a;color:#161a13;border:none;padding:12px;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;">Login</button>' +
      '<p style="text-align:center;margin:14px 0 0;font-size:13px;color:rgba(240,235,224,0.6);">' +
      '<a href="#" id="eggm-modal-toggle" style="color:#c4a35a;">Need an account? Register</a>' +
      '</p>' +
      '</div>';
    document.body.appendChild(modalEl);

    var closeBtn = modalEl.querySelector('#eggm-modal-close');
    var toggleBtn = modalEl.querySelector('#eggm-modal-toggle');
    var submitBtn = modalEl.querySelector('#eggm-modal-submit');
    var errEl = modalEl.querySelector('#eggm-modal-err');
    var regFields = modalEl.querySelector('#eggm-reg-fields');
    var isRegister = false;

    function close() { modalEl.style.display = 'none'; }
    function showErr(msg) { errEl.textContent = msg; errEl.style.display = 'block'; }
    function setMode(reg) {
      isRegister = reg;
      modalEl.querySelector('#eggm-modal-title').textContent = reg ? 'Create Account' : 'Login';
      submitBtn.textContent = reg ? 'Sign Up' : 'Login';
      toggleBtn.textContent = reg ? 'Already have an account? Login' : 'Need an account? Register';
      regFields.style.display = reg ? 'block' : 'none';
    }

    closeBtn.onclick = close;
    modalEl.onclick = function (e) { if (e.target === modalEl) close(); };
    toggleBtn.onclick = function (e) { e.preventDefault(); setMode(!isRegister); };
    submitBtn.onclick = function () {
      var username = modalEl.querySelector('#eggm-username').value.trim();
      var password = modalEl.querySelector('#eggm-password').value;
      var email = modalEl.querySelector('#eggm-email').value.trim();
      errEl.style.display = 'none';
      var path = isRegister ? '/api/auth/register' : '/api/auth/login';
      api(path, { method: 'POST', body: { username: username, password: password, email: email } }).then(function (d) {
        if (d.token) {
          setToken(d.token);
          setUser(d.user);
          close();
          refreshAuthUI();
          window.dispatchEvent(new CustomEvent('eggmAuth', { detail: { user: d.user } }));
          if (window.eggmOnLogin) window.eggmOnLogin(d.user);
        } else {
          showErr(d.error || 'Something went wrong.');
        }
      });
    };
    modalEl.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    return modalEl;
  }

  function requireLogin(cb) {
    if (getUser() && getToken()) {
      if (cb) cb();
      return;
    }
    openAuthModal();
  }

  function openAuthModal() {
    var m = modal();
    m.style.display = 'flex';
    m.querySelector('#eggm-modal-err').style.display = 'none';
    m.querySelector('#eggm-modal-username').value = '';
    m.querySelector('#eggm-password').value = '';
    m.querySelector('#eggm-email').value = '';
    if (!getUser()) setModeReg(false);
    setTimeout(function () { m.querySelector('#eggm-username').focus(); }, 50);
  }

  function setModeReg(reg) {
    var m = modal();
    var toggleBtn = m.querySelector('#eggm-modal-toggle');
    var submitBtn = m.querySelector('#eggm-modal-submit');
    var regFields = m.querySelector('#eggm-reg-fields');
    m.querySelector('#eggm-modal-title').textContent = reg ? 'Create Account' : 'Login';
    submitBtn.textContent = reg ? 'Sign Up' : 'Login';
    toggleBtn.textContent = reg ? 'Already have an account? Login' : 'Need an account? Register';
    regFields.style.display = reg ? 'block' : 'none';
    m.dataset.mode = reg ? 'register' : 'login';
  }

  function logout() {
    api('/api/auth/logout', { method: 'POST' }).catch(function () {});
    setToken(null);
    setUser(null);
    refreshAuthUI();
    window.dispatchEvent(new CustomEvent('eggmAuth', { detail: { user: null } }));
  }

  // ── In-page auth bar (top of page) ───────────────────────────
  function refreshAuthUI() {
    var el = document.getElementById('eggm-auth-bar');
    if (!el) return;
    var u = getUser();
    if (u) {
      el.innerHTML = '<span style="color:#f0ebe0;">Welcome, <strong style="color:#c4a35a;">' + u.username + '</strong></span>' +
        ' <a href="#" id="eggm-logout" style="color:#c4a35a;margin-left:10px;">Logout</a>';
      var lo = document.getElementById('eggm-logout');
      if (lo) lo.onclick = function (e) { e.preventDefault(); logout(); };
    } else {
      el.innerHTML = '<a href="#" id="eggm-login-link" style="color:#c4a35a;">Login</a>' +
        ' <span style="color:rgba(240,235,224,0.4);">|</span> ' +
        '<a href="#" id="eggm-register-link" style="color:#c4a35a;">Register</a>';
      document.getElementById('eggm-login-link').onclick = function (e) { e.preventDefault(); openAuthModal(); setModeReg(false); };
      document.getElementById('eggm-register-link').onclick = function (e) { e.preventDefault(); openAuthModal(); setModeReg(true); };
    }
  }

  // ── Favorites ────────────────────────────────────────────────
  function toggleFavorite(slug, btn) {
    requireLogin(function () {
      api('/api/favorites', { method: 'POST', body: { slug: slug } }).then(function (d) {
        if (d.error) { alert(d.error); return; }
        var fav = d.favorites || [];
        var on = fav.indexOf(slug) >= 0;
        if (btn) {
          btn.dataset.active = on ? '1' : '0';
          btn.innerHTML = on ? '♥ In Favorites' : '♥ Add to Favorites';
          btn.style.background = on ? 'rgba(196,163,90,0.35)' : 'rgba(196,163,90,0.12)';
        }
      });
    });
  }

  function initFavorites() {
    var slug = document.body.getAttribute('data-game-slug');
    document.querySelectorAll('[data-fav-btn]').forEach(function (btn) {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(slug || btn.dataset.slug || '', btn);
      };
    });
    if (slug) {
      api('/api/favorites').then(function (d) {
        if (d.error || !d.favorites) return;
        if (d.favorites.indexOf(slug) >= 0) {
          document.querySelectorAll('[data-fav-btn]').forEach(function (btn) {
            btn.dataset.active = '1';
            btn.innerHTML = '♥ In Favorites';
            btn.style.background = 'rgba(196,163,90,0.35)';
          });
        }
      }).catch(function () {});
    }
  }

  // ── Reviews ──────────────────────────────────────────────────
  function renderReviews(slug, container, ratingEl, countEl) {
    api('/api/games/' + slug + '/reviews').then(function (d) {
      var list = d.reviews || [];
      if (ratingEl) {
        ratingEl.textContent = d.count ? d.rating.toFixed(1) + '/5' : 'No ratings yet';
      }
      if (countEl) countEl.textContent = d.count ? d.count + ' review' + (d.count > 1 ? 's' : '') : '0 reviews';
      if (!container) return;
      if (!list.length) {
        container.innerHTML = '<p style="color:rgba(240,235,224,0.5);font-size:0.9rem;">No reviews yet. Be the first to review!</p>';
        return;
      }
      container.innerHTML = list.map(function (r) {
        var stars = '';
        for (var i = 1; i <= 5; i++) stars += r.rating >= i ? '★' : '☆';
        return '<div style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);">' +
          '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span style="color:#c4a35a;font-size:1rem;letter-spacing:2px;">' + stars + '</span>' +
          '<strong style="color:#f0ebe0;font-size:0.9rem;">' + escapeHtml(r.username) + '</strong>' +
          '<span style="color:rgba(240,235,224,0.4);font-size:0.8rem;">' + new Date(r.createdAt).toLocaleDateString() + '</span>' +
          '</div>' +
          '<p style="color:rgba(240,235,224,0.75);font-size:0.9rem;line-height:1.6;margin:6px 0 0;">' + escapeHtml(r.text) + '</p>' +
          '</div>';
      }).join('');
    }).catch(function () {});
  }

  function submitReview(slug, rating, text) {
    return api('/api/games/' + slug + '/reviews', { method: 'POST', body: { rating: rating, text: text } });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ── Reports ──────────────────────────────────────────────────
  function submitReport(slug, reason) {
    return api('/api/games/' + slug + '/report', { method: 'POST', body: { reason: reason } });
  }

  function initReports() {
    var slug = document.body.getAttribute('data-game-slug');
    document.querySelectorAll('[data-report-btn]').forEach(function (btn) {
      btn.onclick = function (e) {
        e.preventDefault();
        requireLogin(function () {
          var reason = prompt('Describe the issue with this game:');
          if (reason === null) return;
          reason = reason.trim();
          if (!reason) return;
          submitReport(slug, reason).then(function (d) {
            if (d.error) { alert(d.error); return; }
            alert('Report submitted. Thank you!');
          });
        });
      };
    });
  }

  // ── Wire up ──────────────────────────────────────────────────
  function init() {
    initAuth();

    var bar = document.getElementById('eggm-auth-bar');
    if (bar) refreshAuthUI();

    initFavorites();
    initReports();

    var revBtn = document.getElementById('eggm-review-btn');
    if (revBtn) {
      revBtn.onclick = function () {
        requireLogin(function () {
          var rating = prompt('Rate this game 1-5 stars:');
          if (rating === null) return;
          rating = Math.round(Number(rating));
          if (!rating || rating < 1 || rating > 5) { alert('Please enter a number from 1 to 5.'); return; }
          var text = prompt('Write a short review:');
          if (text === null) return;
          text = text.trim();
          if (!text) { alert('Review text is required.'); return; }
          submitReview(revBtn.dataset.slug, rating, text).then(function (d) {
            if (d.error) { alert(d.error); return; }
            alert('Thanks for your review!');
            renderReviews(revBtn.dataset.slug, document.getElementById('eggm-reviews-list'), document.getElementById('eggm-reviews-rating'), document.getElementById('eggm-reviews-count'));
          });
        });
      };
    }

    var list = document.getElementById('eggm-reviews-list');
    var slug = document.body.getAttribute('data-game-slug');
    if (slug) {
      renderReviews(slug, list, document.getElementById('eggm-reviews-rating'), document.getElementById('eggm-reviews-count'));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();