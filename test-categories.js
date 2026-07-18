// Test games across categories - checks proxy output for issues
const http = require('http');
const fs = require('fs');

eval(fs.readFileSync('games.js', 'utf8'));

const categories = ['Arcade', 'Racing', 'Action', 'Shooting', 'Adventure', 'Sports', 'Puzzle', '.IO', 'Hypercasual', 'Girls', 'Boys', 'Stickman', 'Clicker', 'Cooking', 'Soccer'];

async function testGame(game) {
  return new Promise((resolve) => {
    const encoded = encodeURIComponent(game.embedUrl);
    const url = 'http://localhost:8080/play?v=14&url=' + encoded;
    
    http.get(url, { headers: { 'Cache-Control': 'no-cache' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const issues = [];
        
        // Check ad blocker script injected
        if (!data.includes('HTMLImageElement')) issues.push('NO_IMAGE_INTERCEPTOR');
        if (!data.includes('var GB=')) issues.push('NO_GAME_BASE');
        if (!data.includes('var ABS=')) issues.push('NO_ABS_PROXY');
        
        // Check base tag
        if (!data.includes('<base href=')) issues.push('NO_BASE_TAG');
        
        // Check SDK stubs
        if (!data.includes('window.sdk=')) issues.push('NO_SDK_STUBS');
        
        // Check image proxy
        if (!data.includes('OI=')) issues.push('NO_OI_INTERCEPTOR');
        
        // Check for script stripping (SDK removed)
        if (data.includes('api.gamemonetize.com')) issues.push('SDK_NOT_STRIPPED');
        
        // Check CSP removed
        if (data.includes('Content-Security-Policy')) issues.push('CSP_NOT_REMOVED');
        
        resolve({
          id: game.id,
          title: game.title,
          status: res.statusCode,
          size: data.length,
          issues: issues
        });
      });
    }).on('error', (e) => {
      resolve({ id: game.id, title: game.title, status: 'ERROR', error: e.message, issues: ['CONNECTION_ERROR'] });
    });
  });
}

async function main() {
  console.log('Testing games across categories...\n');
  
  for (const cat of categories) {
    const games = GAMES.filter(g => g.category === cat);
    if (games.length === 0) continue;
    
    const game = games[0];
    const result = await testGame(game);
    
    const status = result.issues.length === 0 ? 'OK' : 'ISSUES';
    console.log(`[${status}] ${cat}: ${result.title} (${result.id})`);
    console.log(`  Status: ${result.status}, Size: ${result.size}`);
    if (result.issues.length > 0) {
      console.log(`  Issues: ${result.issues.join(', ')}`);
    }
    if (result.error) console.log(`  Error: ${result.error}`);
  }
}

main().catch(console.error);
