// Geo-detection and country redirect for EggerMath
// Uses timezone + language to detect region, stores preference in localStorage

(function() {
  'use strict';

  // Country detection map: timezone → country code
  var TZ_COUNTRY = {
    // Americas
    'America/New_York': 'us', 'America/Chicago': 'us', 'America/Denver': 'us',
    'America/Los_Angeles': 'us', 'America/Anchorage': 'us', 'Pacific/Honolulu': 'us',
    'America/Phoenix': 'us', 'America/Detroit': 'us', 'America/Indiana/Indianapolis': 'us',
    'America/Toronto': 'us', 'America/Vancouver': 'us', 'America/Edmonton': 'us',
    'America/Winnipeg': 'us', 'America/Halifax': 'us', 'America/St_Johns': 'us',
    'America/Sao_Paulo': 'br', 'America/Fortaleza': 'br', 'America/Manaus': 'br',
    'America/Bahia': 'br', 'America/Belem': 'br', 'America/Recife': 'br',
    'America/Buenos_Aires': 'ar', 'America/Argentina/Buenos_Aires': 'ar',
    'America/Argentina/Cordoba': 'ar', 'America/Mexico_City': 'mx',
    'America/Bogota': 'co', 'America/Lima': 'pe', 'America/Santiago': 'cl',
    'America/Caracas': 've',
    // Europe
    'Europe/London': 'uk', 'Europe/Gb_Eire': 'uk',
    'Europe/Berlin': 'de', 'Europe/Munich': 'de', 'Europe/Vienna': 'de',
    'Europe/Paris': 'fr', 'Europe/Amsterdam': 'nl', 'Europe/Brussels': 'be',
    'Europe/Madrid': 'es', 'Europe/Barcelona': 'es', 'Europe/Lisbon': 'pt',
    'Europe/Rome': 'it', 'Europe/Milan': 'it',
    'Europe/Moscow': 'ru', 'Europe/Samara': 'ru', 'Asia/Yekaterinburg': 'ru',
    'Europe/Warsaw': 'pl', 'Europe/Prague': 'cz', 'Europe/Budapest': 'hu',
    'Europe/Bucharest': 'ro', 'Europe/Athens': 'gr', 'Europe/Istanbul': 'tr',
    'Europe/Dublin': 'ie',
    // Asia
    'Asia/Tokyo': 'jp', 'Asia/Osaka': 'jp', 'Asia/Sapporo': 'jp',
    'Asia/Seoul': 'kr', 'Asia/Busan': 'kr',
    'Asia/Shanghai': 'cn', 'Asia/Hong_Kong': 'hk', 'Asia/Taipei': 'tw',
    'Asia/Kolkata': 'in', 'Asia/Calcutta': 'in', 'Asia/Mumbai': 'in',
    'Asia/Dubai': 'ae', 'Asia/Riyadh': 'sa',
    'Asia/Jakarta': 'id', 'Asia/Makassar': 'id', 'Asia/Jayapura': 'id',
    'Asia/Bangkok': 'th', 'Asia/Ho_Chi_Minh': 'vn', 'Asia/Phnom_Penh': 'kh',
    'Asia/Kuala_Lumpur': 'my', 'Asia/Singapore': 'sg',
    'Asia/Manila': 'ph',
    'Asia/Tashkent': 'uz',
    // Oceania
    'Australia/Sydney': 'au', 'Australia/Melbourne': 'au',
    'Australia/Brisbane': 'au', 'Australia/Perth': 'au',
    'Pacific/Auckland': 'nz',
    // Africa
    'Africa/Lagos': 'ng', 'Africa/Nairobi': 'ke', 'Africa/Johannesburg': 'za',
    'Africa/Cairo': 'eg', 'Africa/Casablanca': 'ma'
  };

  // Language → country mapping for fallback
  var LANG_COUNTRY = {
    'pt': 'br', 'pt-BR': 'br', 'pt-PT': 'br',
    'es': 'es', 'es-ES': 'es', 'es-MX': 'mx', 'es-AR': 'ar',
    'ja': 'jp', 'ja-JP': 'jp',
    'de': 'de', 'de-DE': 'de', 'de-AT': 'de',
    'fr': 'fr', 'fr-FR': 'fr',
    'ru': 'ru', 'ru-RU': 'ru',
    'ko': 'kr', 'ko-KR': 'kr',
    'it': 'it', 'it-IT': 'it',
    'id': 'id', 'id-ID': 'id',
    'ar': 'ar', 'ar-SA': 'ar', 'ar-AE': 'ar',
    'hi': 'in', 'hi-IN': 'in',
    'en-US': 'us', 'en-GB': 'uk', 'en-AU': 'au', 'en-IN': 'in', 'en-NG': 'ng'
  };

  // Valid country codes
  var VALID_COUNTRIES = ['us','uk','in','br','jp','de','fr','es','id','ru','au','ng'];

  function detectCountry() {
    // 1. Check localStorage (user explicitly chose)
    var stored = localStorage.getItem('eggermath_country');
    if (stored && VALID_COUNTRIES.indexOf(stored) !== -1) return stored;

    // 2. Check URL params (?country=us)
    var params = new URLSearchParams(window.location.search);
    var urlCountry = params.get('country');
    if (urlCountry && VALID_COUNTRIES.indexOf(urlCountry) !== -1) {
      localStorage.setItem('eggermath_country', urlCountry);
      return urlCountry;
    }

    // 3. Detect by timezone
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && TZ_COUNTRY[tz]) return TZ_COUNTRY[tz];
    } catch(e) {}

    // 4. Detect by language
    try {
      var lang = navigator.language || navigator.userLanguage;
      if (lang && LANG_COUNTRY[lang]) return LANG_COUNTRY[lang];
      if (lang) {
        var langPart = lang.split('-')[0];
        if (LANG_COUNTRY[langPart]) return LANG_COUNTRY[langPart];
      }
    } catch(e) {}

    // 5. Default to US
    return 'us';
  }

  function getCurrentCountry() {
    var path = window.location.pathname;
    var match = path.match(/^\/([a-z]{2})\//);
    if (match && VALID_COUNTRIES.indexOf(match[1]) !== -1) return match[1];
    return null;
  }

  function getCountryPath(countryCode) {
    var path = window.location.pathname;
    // Remove existing country prefix if present
    var currentCountry = getCurrentCountry();
    if (currentCountry) {
      path = path.replace(/^\/[a-z]{2}/, '');
    }
    // Remove language prefix if present
    path = path.replace(/^\/(pt-BR|es|ja|de|fr|ru|ko|it|id|ar)/, '');
    // Ensure path starts with /
    if (!path.startsWith('/')) path = '/' + path;
    return '/' + countryCode + path;
  }

  // Auto-redirect if not on a country page and not already redirected
  function autoRedirect() {
    var currentCountry = getCurrentCountry();
    if (currentCountry) return; // Already on a country page

    // Check if user has been redirected before in this session
    if (sessionStorage.getItem('eggermath_geo_redirected')) return;

    var detected = detectCountry();
    if (detected === 'us') return; // US is the default, no redirect needed

    var targetPath = getCountryPath(detected);
    if (targetPath !== window.location.pathname) {
      sessionStorage.setItem('eggermath_geo_redirected', '1');
      window.location.href = targetPath;
    }
  }

  // Create country selector banner
  function createCountryBanner() {
    var currentCountry = getCurrentCountry();
    if (!currentCountry) return; // Only show on country pages

    var detected = detectCountry();
    if (detected === currentCountry) return; // Already on correct country

    var banner = document.createElement('div');
    banner.id = 'country-banner';
    banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#1a1a2e;border-top:2px solid #c4a35a;padding:12px 16px;z-index:9999;display:flex;align-items:center;justify-content:center;gap:12px;font-family:DM Sans,sans-serif;font-size:14px;color:#f0ebe0;';

    var text = document.createElement('span');
    text.textContent = 'You seem to be from ' + getCountryName(detected) + '. ';

    var link = document.createElement('a');
    link.href = getCountryPath(detected);
    link.textContent = 'Switch to ' + getCountryName(detected);
    link.style.cssText = 'color:#c4a35a;text-decoration:underline;font-weight:600;';

    var dismiss = document.createElement('button');
    dismiss.textContent = '✕';
    dismiss.style.cssText = 'background:none;border:none;color:#888;cursor:pointer;font-size:18px;margin-left:8px;';
    dismiss.onclick = function() {
      banner.remove();
      sessionStorage.setItem('eggermath_banner_dismissed', '1');
    };

    banner.appendChild(text);
    banner.appendChild(link);
    banner.appendChild(dismiss);
    document.body.appendChild(banner);
  }

  function getCountryName(code) {
    var names = {
      'us': 'United States', 'uk': 'United Kingdom', 'in': 'India',
      'br': 'Brazil', 'jp': 'Japan', 'de': 'Germany',
      'fr': 'France', 'es': 'Spain', 'id': 'Indonesia',
      'ru': 'Russia', 'au': 'Australia', 'ng': 'Nigeria'
    };
    return names[code] || code;
  }

  // Init
  try {
    autoRedirect();
    if (!sessionStorage.getItem('eggermath_banner_dismissed')) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createCountryBanner);
      } else {
        createCountryBanner();
      }
    }
  } catch(e) {}
})();
