const { chromium } = require('playwright');

const GAMES_TO_TEST = [
  { id: 'gm-the-kulka', name: 'The Kulka (Arcade)', expectCanvas: true },
  { id: 'gm-city-ride', name: 'City Ride (Action)', expectCanvas: true },
  { id: 'gm-block-puzzle-2023', name: 'Block Puzzle (Puzzle)', expectCanvas: true },
  { id: 'gm-memory-match', name: 'Memory Match (Clicker)', expectCanvas: true },
  { id: 'gm-soccer-duel', name: 'Soccer Duel (Soccer)', expectCanvas: true },
  { id: 'gm-car-evolution-pro-math-gates', name: 'Car Evolution (Hypercasual)', expectCanvas: true },
  { id: 'gm-head-sport-basketball', name: 'Head Sport Basketball (Sports)', expectCanvas: true },
  { id: 'gm-stick-duel-medieval-wars', name: 'Stick Duel (Stickman)', expectCanvas: true },
  { id: 'gm-wonder-vending-machine', name: 'Wonder Vending (Cooking)', expectCanvas: true },
  { id: 'gm-nitro-speed-car-racing', name: 'Nitro Speed (Boys)', expectCanvas: true },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  
  for (const game of GAMES_TO_TEST) {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text().substring(0, 200));
    });
    
    const url = `https://www.eggermath.com/game.html?id=${game.id}`;
    
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      // Wait for page to load
      await page.waitForTimeout(3000);
      
      // Check if game title loaded
      const title = await page.title();
      
      // Click play overlay if present
      try {
        const playBtn = page.getByText('Click to Play');
        if (await playBtn.isVisible({ timeout: 3000 })) {
          await playBtn.click();
        }
      } catch (e) {}
      
      // Wait for game to load
      await page.waitForTimeout(8000);
      
      // Check for canvas element inside iframe
      const iframe = page.frameLocator('iframe').first();
      let hasCanvas = false;
      let hasContent = false;
      
      try {
        hasCanvas = await iframe.locator('canvas').count() > 0;
        hasContent = await iframe.locator('body').evaluate(el => el.innerHTML.length > 100);
      } catch (e) {}
      
      // Take screenshot
      await page.screenshot({ path: `test-${game.id}.png`, type: 'png' });
      
      const criticalErrors = errors.filter(e => 
        !e.includes('gameanalytics') && 
        !e.includes('img.gamemonetize') &&
        !e.includes('favicon') &&
        !e.includes('service-worker') &&
        !e.includes('pointer-lock') &&
        !e.includes('sandbox')
      );
      
      results.push({
        id: game.id,
        name: game.name,
        title,
        hasCanvas,
        hasContent,
        totalErrors: errors.length,
        criticalErrors: criticalErrors.length,
        criticalMessages: criticalErrors.slice(0, 3),
        status: criticalErrors.length === 0 && hasCanvas ? 'PASS' : 
                hasCanvas ? 'WARN' : 'FAIL'
      });
      
      console.log(`[${results[results.length-1].status}] ${game.name}: canvas=${hasCanvas}, errors=${errors.length}, critical=${criticalErrors.length}`);
      
    } catch (e) {
      results.push({ id: game.id, name: game.name, status: 'ERROR', error: e.message.substring(0, 100) });
      console.log(`[ERROR] ${game.name}: ${e.message.substring(0, 100)}`);
    }
    
    await context.close();
  }
  
  console.log('\n=== SUMMARY ===');
  console.log(`Total: ${results.length}`);
  console.log(`Pass: ${results.filter(r => r.status === 'PASS').length}`);
  console.log(`Warn: ${results.filter(r => r.status === 'WARN').length}`);
  console.log(`Fail: ${results.filter(r => r.status === 'FAIL').length}`);
  console.log(`Error: ${results.filter(r => r.status === 'ERROR').length}`);
  
  const fails = results.filter(r => r.status === 'FAIL' || r.status === 'ERROR');
  if (fails.length > 0) {
    console.log('\nFailed games:');
    fails.forEach(f => console.log(`  - ${f.name}: ${f.error || f.criticalMessages?.join('; ')}`));
  }
  
  await browser.close();
})();
