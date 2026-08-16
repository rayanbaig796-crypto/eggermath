import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });

  const consoleErrors = [];
  const consoleWarnings = [];
  const allConsoleLogs = [];

  // ═══════════════════════════════════════════════════════════════
  // TEST 1: Game page at /games/pokemon-emerald.html
  // ═══════════════════════════════════════════════════════════════
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('TEST 1: Navigating to game page...');
  console.log('══════════════════════════════════════════════════════════════');

  const page1 = await context.newPage();
  page1.on('console', msg => {
    const entry = `[${msg.type()}] ${msg.text()}`;
    allConsoleLogs.push(entry);
    if (msg.type() === 'error') consoleErrors.push(entry);
    if (msg.type() === 'warning') consoleWarnings.push(entry);
  });
  page1.on('pageerror', err => {
    consoleErrors.push(`[PAGE_ERROR] ${err.message}`);
  });

  try {
    await page1.goto('http://localhost:8080/games/pokemon-emerald.html', { waitUntil: 'networkidle', timeout: 30000 });
  } catch(e) {
    console.log('Navigation timeout or error:', e.message);
  }
  await page1.waitForTimeout(3000);

  // Full-page screenshot
  await page1.screenshot({ path: 'game-page-after.png', fullPage: true });
  console.log('Screenshot saved: game-page-after.png');

  // Analyze page structure
  console.log('\n--- GAME PAGE STRUCTURE ANALYSIS ---');

  // Check for nav bars
  const outerNav = await page1.$$('body > .nav, body > nav.nav');
  const iframeNavs = await page1.$$('iframe.emulator-frame');
  console.log(`Outer nav elements (body > .nav): ${outerNav.length}`);

  // Check iframe
  const iframeSrc = await page1.$eval('iframe.emulator-frame', el => el.src).catch(() => 'NOT FOUND');
  console.log(`Iframe src: ${iframeSrc}`);

  // Check iframe dimensions
  const iframeBox = await page1.$eval('iframe.emulator-frame', el => {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return {
      width: rect.width, height: rect.height,
      display: style.display, visibility: style.visibility,
      border: style.border, borderRadius: style.borderRadius
    };
  }).catch(() => null);
  console.log(`Iframe dimensions: ${JSON.stringify(iframeBox)}`);

  // Check overall page structure
  const bodyChildren = await page1.$$eval('body > *', els => els.map(el => ({
    tag: el.tagName.toLowerCase(),
    classes: el.className,
    id: el.id,
    display: window.getComputedStyle(el).display,
    visible: window.getComputedStyle(el).visibility
  })));
  console.log('\nBody direct children:');
  bodyChildren.forEach((child, i) => {
    console.log(`  [${i}] <${child.tag}> class="${child.classes}" id="${child.id}" display=${child.display} visible=${child.visible}`);
  });

  // Check for duplicate nav
  const allNavs = await page1.$$eval('nav', navs => navs.map(n => ({
    classes: n.className,
    text: n.textContent.substring(0, 100).trim(),
    parent: n.parentElement.tagName + (n.parentElement.className ? '.' + n.parentElement.className : '')
  })));
  console.log(`\nAll <nav> elements on page: ${allNavs.length}`);
  allNavs.forEach((nav, i) => {
    console.log(`  [${i}] class="${nav.classes}" parent=${nav.parent} text="${nav.text}"`);
  });

  // Check content below iframe
  const controlsBox = await page1.$('.controls-box');
  console.log(`\nControls box present: ${!!controlsBox}`);
  const footer = await page1.$('.footer');
  console.log(`Footer present: ${!!footer}`);

  // Check if iframe loaded content
  let iframeLoaded = false;
  let iframeBodyContent = '';
  try {
    const frame = page1.frames().find(f => f.url().includes('gba-emulator-web'));
    if (frame) {
      iframeLoaded = true;
      const bodyClasses = await frame.$eval('body', el => el.className);
      console.log(`\nIframe body classes: "${bodyClasses}"`);
      const embedMode = bodyClasses.includes('embed-mode');
      console.log(`Embed-mode class applied: ${embedMode}`);

      // Check what's visible in the iframe
      const visibleElements = await frame.$$eval('body > *', els => els.map(el => ({
        tag: el.tagName.toLowerCase(),
        classes: el.className,
        display: window.getComputedStyle(el).display,
      })));
      console.log('\nIframe body children:');
      visibleElements.forEach((el, i) => {
        console.log(`  [${i}] <${el.tag}> class="${el.classes}" display=${el.display}`);
      });

      // Check if nav is hidden in iframe
      const iframeNav = await frame.$('.site-nav');
      if (iframeNav) {
        const navDisplay = await iframeNav.evaluate(el => window.getComputedStyle(el).display);
        console.log(`\nIframe .site-nav display: ${navDisplay}`);
      }
      const iframeBreadcrumbs = await frame.$('.breadcrumbs');
      if (iframeBreadcrumbs) {
        const breadDisplay = await iframeBreadcrumbs.evaluate(el => window.getComputedStyle(el).display);
        console.log(`Iframe .breadcrumbs display: ${breadDisplay}`);
      }
      const iframeUploadArea = await frame.$('#upload-area');
      if (iframeUploadArea) {
        const uploadDisplay = await iframeUploadArea.evaluate(el => window.getComputedStyle(el).display);
        console.log(`Iframe #upload-area display: ${uploadDisplay}`);
      }
      const iframeGamesGrid = await frame.$('#games-grid');
      if (iframeGamesGrid) {
        const gridDisplay = await iframeGamesGrid.evaluate(el => window.getComputedStyle(el).display);
        console.log(`Iframe #games-grid display: ${gridDisplay}`);
      }

      // Check pre-game-content visibility
      const preGame = await frame.$('#pre-game-content');
      if (preGame) {
        const preGameDisplay = await preGame.evaluate(el => window.getComputedStyle(el).display);
        console.log(`Iframe #pre-game-content display: ${preGameDisplay}`);
      }

      // Check emulator container
      const emuContainer = await frame.$('#emulator-container');
      if (emuContainer) {
        const emuDisplay = await emuContainer.evaluate(el => window.getComputedStyle(el).display);
        console.log(`Iframe #emulator-container display: ${emuDisplay}`);
      }
    }
  } catch(e) {
    console.log(`\nCannot access iframe content (cross-origin?): ${e.message}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // TEST 2: Direct emulator page with embed mode
  // ═══════════════════════════════════════════════════════════════
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('TEST 2: Direct emulator embed page...');
  console.log('══════════════════════════════════════════════════════════════');

  const page2 = await context.newPage();
  page2.on('console', msg => {
    const entry = `[page2][${msg.type()}] ${msg.text()}`;
    if (msg.type() === 'error') consoleErrors.push(entry);
  });

  try {
    await page2.goto('http://localhost:8080/gba-emulator-web/?game=Pokemon%20-%20Emerald%20Version%20(USA%2C%20Europe).zip', { waitUntil: 'networkidle', timeout: 30000 });
  } catch(e) {
    console.log('Navigation timeout or error:', e.message);
  }
  await page2.waitForTimeout(3000);

  await page2.screenshot({ path: 'emulator-embed-test.png', fullPage: true });
  console.log('Screenshot saved: emulator-embed-test.png');

  // Check embed-mode
  const bodyClasses2 = await page2.$eval('body', el => el.className);
  console.log(`\nBody classes: "${bodyClasses2}"`);
  const isEmbedMode = bodyClasses2.includes('embed-mode');
  console.log(`Embed-mode applied: ${isEmbedMode}`);

  // Check hidden elements
  const siteNav2 = await page2.$('.site-nav');
  if (siteNav2) {
    const d = await siteNav2.evaluate(el => window.getComputedStyle(el).display);
    console.log(`.site-nav display: ${d} (should be none)`);
  }
  const breadcrumbs2 = await page2.$('.breadcrumbs');
  if (breadcrumbs2) {
    const d = await breadcrumbs2.evaluate(el => window.getComputedStyle(el).display);
    console.log(`.breadcrumbs display: ${d} (should be none)`);
  }
  const uploadArea2 = await page2.$('#upload-area');
  if (uploadArea2) {
    const d = await uploadArea2.evaluate(el => window.getComputedStyle(el).display);
    console.log(`#upload-area display: ${d} (should be none)`);
  }
  const preGame2 = await page2.$('#pre-game-content');
  if (preGame2) {
    const d = await preGame2.evaluate(el => window.getComputedStyle(el).display);
    console.log(`#pre-game-content display: ${d} (should be none)`);
  }
  const gamesGrid2 = await page2.$('#games-grid');
  if (gamesGrid2) {
    const d = await gamesGrid2.evaluate(el => window.getComputedStyle(el).display);
    console.log(`#games-grid display: ${d}`);
  }

  // Check emulator container in embed mode
  const emuContainer2 = await page2.$('#emulator-container');
  if (emuContainer2) {
    const emuDisplay = await emuContainer2.evaluate(el => window.getComputedStyle(el).display);
    console.log(`#emulator-container display: ${emuDisplay}`);
  }

  // Check overall layout
  const bodyChildren2 = await page2.$$eval('body > *', els => els.map(el => ({
    tag: el.tagName.toLowerCase(),
    classes: el.className,
    display: window.getComputedStyle(el).display,
  })));
  console.log('\nEmbed page body children:');
  bodyChildren2.forEach((child, i) => {
    console.log(`  [${i}] <${child.tag}> class="${child.classes}" display=${child.display}`);
  });

  // ═══════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('CONSOLE ERRORS & WARNINGS');
  console.log('══════════════════════════════════════════════════════════════');
  if (consoleErrors.length === 0) {
    console.log('No console errors detected.');
  } else {
    consoleErrors.forEach(e => console.log(e));
  }
  if (consoleWarnings.length > 0) {
    console.log('\nWarnings:');
    consoleWarnings.forEach(w => console.log(w));
  }

  await browser.close();
  console.log('\nDone.');
})();
