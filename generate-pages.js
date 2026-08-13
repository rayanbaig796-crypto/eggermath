const fs = require('fs');
const path = require('path');

const GAMES = [
  { title: 'Pokemon Emerald', slug: 'pokemon-emerald', genre: 'RPG', series: 'Pokemon', year: '2004', desc: 'Play Pokemon Emerald online in your browser. Explore the Hoenn region, catch 200+ Pokemon, challenge gym leaders, and face Team Magma and Team Aqua. Features the Battle Frontier post-game with 7 challenge facilities. One of the best GBA RPGs ever made.', mega: 'Pokemon - Emerald Version (USA, Europe).zip' },
  { title: 'Pokemon FireRed', slug: 'pokemon-firered', genre: 'RPG', series: 'Pokemon', year: '2004', desc: 'Play Pokemon FireRed online. An enhanced remake of Pokemon Red for GBA with updated graphics, abilities, and the Sevii Islands post-game. Explore Kanto, collect all 151 original Pokemon, and become Pokemon Champion.', mega: 'Pokemon_ FireRed Version.zip' },
  { title: 'Pokemon LeafGreen', slug: 'pokemon-leafgreen', genre: 'RPG', series: 'Pokemon', year: '2004', desc: 'Play Pokemon LeafGreen online in your browser. The counterpart to FireRed featuring Pokemon Green exclusives. Explore Kanto with updated graphics, new mechanics like abilities and natures, and the Sevii Islands.', mega: 'Pokemon - Leaf Green Version (U) (V1.1).zip' },
  { title: 'Pokemon Ruby', slug: 'pokemon-ruby', genre: 'RPG', series: 'Pokemon', year: '2002', desc: 'Play Pokemon Ruby online. Journey through the Hoenn region, catch 135 new Pokemon, and stop Team Magma from expanding the land. Features double battles, Pokemon Contests, and the Battle Tower.', mega: 'Pokemon_ Ruby Version.zip' },
  { title: 'Pokemon Sapphire', slug: 'pokemon-sapphire', genre: 'RPG', series: 'Pokemon', year: '2002', desc: 'Play Pokemon Sapphire online in your browser. The counterpart to Ruby featuring Team Aqua and exclusive Pokemon. Explore Hoenn, master double battles, and challenge the Battle Tower.', mega: 'Pokemon_ Sapphire Version.zip' },
  { title: 'Pokemon Ultra Violet', slug: 'pokemon-ultra-violet', genre: 'RPG', series: 'Pokemon', year: '2023', desc: 'Play Pokemon Ultra Violet online. A FireRed ROM hack featuring all Pokemon from Gen 1-3 in one game. Catch every Pokemon without trading, explore expanded Sevii Islands, and enjoy quality-of-life improvements.', mega: 'Pokemon Ultra Violet (1.22) LSA (Fire Red Hack).zip' },
  { title: 'Pokemon Jupiter', slug: 'pokemon-jupiter', genre: 'RPG', series: 'Pokemon', year: '2023', desc: 'Play Pokemon Jupiter online. A Ruby ROM hack set in the Oxalis region with 200+ new fakemon, custom story, and updated mechanics. Features a darker narrative and challenging gym battles.', mega: 'Pokemon Jupiter - 6.04 (Ruby Hack).zip' },
  { title: 'Zelda: Minish Cap', slug: 'zelda-minish-cap', genre: 'Adventure', series: 'Zelda', year: '2004', desc: 'Play Zelda Minish Cap online in your browser. Help Link shrink to Minish size and explore Hyrule from a new perspective. Features the Gust Jar, Mole Mitts, and the ability to fuse Kinstones with NPCs.', mega: 'Legend of Zelda, The_ The Minish Cap.zip' },
  { title: 'Zelda: A Link to the Past', slug: 'zelda-link-to-the-past', genre: 'Adventure', series: 'Zelda', year: '2002', desc: 'Play Zelda A Link to the Past online. The GBA port of the SNES classic featuring both the original Light/Dark World adventure and the new Four Swords multiplayer mode.', mega: 'Legend of Zelda, The - A Link to the Past & Four Swords (USA).zip' },
  { title: 'Mario Kart Super Circuit', slug: 'mario-kart-super-circuit', genre: 'Racing', series: 'Mario', year: '2001', desc: 'Play Mario Kart Super Circuit online in your browser. The first portable Mario Kart featuring 20 tracks from Super Mario Kart (SNES) plus 20 new courses. Drift, use items, and race.', mega: 'Mario Kart_ Super Circuit.zip' },
  { title: 'Super Mario World', slug: 'super-mario-world', genre: 'Platformer', series: 'Mario', year: '2002', desc: 'Play Super Mario World online. The GBA port of the SNES classic featuring Yoshi, secret exits, and 96 levels. Explore Dinosaur Land and rescue Princess Peach from Bowser.', mega: 'Super Mario Advance 2_ Super Mario World.zip' },
  { title: 'Mario & Luigi: Superstar Saga', slug: 'mario-luigi-superstar-saga', genre: 'RPG', series: 'Mario', year: '2003', desc: 'Play Mario & Luigi Superstar Saga online. An action RPG where Mario and Luigi travel to the Beanbean Kingdom. Features timing-based combat, Bros. Attacks, and humorous dialogue.', mega: 'Mario & Luigi_ Superstar Saga.zip' },
  { title: 'Classic NES: Super Mario Bros', slug: 'classic-nes-super-mario-bros', genre: 'Platformer', series: 'Mario', year: '2004', desc: 'Play Classic NES Super Mario Bros online. The original 1985 platformer ported to GBA. Run, jump, and stomp through 32 levels across 8 worlds.', mega: 'Classic NES Series_ Super Mario Bros..zip' },
  { title: 'Metroid Fusion', slug: 'metroid-fusion', genre: 'Action', series: 'Metroid', year: '2002', desc: 'Play Metroid Fusion online in your browser. Guide Samus Aran through the infected SR388 space station. Fight the X Parasites and confront the SA-X.', mega: 'Metroid Fusion.zip' },
  { title: 'Metroid: Zero Mission', slug: 'metroid-zero-mission', genre: 'Action', series: 'Metroid', year: '2004', desc: 'Play Metroid Zero Mission online. A remake of the original NES Metroid with updated graphics and gameplay. Explore Planet Zebes and defeat Mother Brain.', mega: 'Metroid_ Zero Mission.zip' },
  { title: 'Kirby: Nightmare in Dream Land', slug: 'kirby-nightmare-in-dream-land', genre: 'Platformer', series: 'Kirby', year: '2002', desc: 'Play Kirby Nightmare in Dream Land online. Help Kirby reclaim the Dream Rod from King Dedede. Copy enemy abilities and float through colorful levels.', mega: 'Kirby_ Nightmare in Dream Land.zip' },
  { title: 'Kirby & the Amazing Mirror', slug: 'kirby-amazing-mirror', genre: 'Platformer', series: 'Kirby', year: '2004', desc: 'Play Kirby and the Amazing Mirror online. Explore the mirror world with 4 Kirbys, copy 12 abilities, and collect 900 stars.', mega: 'Kirby & the Amazing Mirror.zip' },
  { title: 'Castlevania: Aria of Sorrow', slug: 'castlevania-aria-of-sorrow', genre: 'Action', series: 'Castlevania', year: '2003', desc: 'Play Castlevania Aria of Sorrow online. Fight through Dracula castle as Soma Cruz, who can absorb monster souls for new abilities.', mega: 'Castlevania_ Aria of Sorrow.zip' },
  { title: 'Donkey Kong Country', slug: 'donkey-kong-country', genre: 'Platformer', series: 'Donkey Kong', year: '2003', desc: 'Play Donkey Kong Country online. The GBA port of the SNES classic. Swing on vines, ride mine carts, and defeat King K. Rool.', mega: 'Donkey Kong Country.zip' },
  { title: 'Fire Emblem: Sacred Stones', slug: 'fire-emblem-sacred-stones', genre: 'Strategy', series: 'Fire Emblem', year: '2004', desc: 'Play Fire Emblem Sacred Stones online. Lead Eirika or Ephraim through Magvel. Recruit 24 characters and navigate branching story paths.', mega: 'Fire Emblem_ The Sacred Stones.zip' },
  { title: 'Sonic Advance 3', slug: 'sonic-advance-3', genre: 'Platformer', series: 'Sonic', year: '2004', desc: 'Play Sonic Advance 3 online in your browser. Race through 7 zones as Sonic, Tails, Knuckles, or Amy.', mega: 'Sonic Advance 3 (USA) (En,Ja,Fr,De,Es,It).zip' },
  { title: 'Dragon Ball: Advanced Adventure', slug: 'dragon-ball-advanced-adventure', genre: 'Fighting', series: 'Dragon Ball', year: '2004', desc: 'Play Dragon Ball Advanced Adventure online. Relive the original Dragon Ball saga as young Goku. Fight through 100+ missions.', mega: 'Dragon Ball - Advanced Adventure (USA).zip' },
  { title: 'Harvest Moon', slug: 'harvest-moon-friends-of-mineral-town', genre: 'Simulation', series: 'Harvest Moon', year: '2003', desc: 'Play Harvest Moon Friends of Mineral Town online. Build a farm, grow crops, raise animals, and find a partner.', mega: 'Harvest Moon - Friends of Mineral Town (U) [!].zip' },
  { title: 'Crash Bandicoot', slug: 'crash-bandicoot-huge-adventure', genre: 'Platformer', series: 'Crash Bandicoot', year: '2002', desc: 'Play Crash Bandicoot online. Help Crash shrink down to micro-size and battle the mutant insects of Cortex.', mega: 'Crash Bandicoot_ The Huge Adventure.zip' },
  { title: 'GTA Advance', slug: 'gta-advance', genre: 'Action', series: 'GTA', year: '2004', desc: 'Play GTA Advance online in your browser. Explore Liberty City as Vinnie, completing missions for the mob.', mega: 'Grand Theft Auto Advance.zip' },
];

const GENRES = [
  { name: 'RPG', slug: 'rpg', desc: 'Play GBA RPG games online free. Pokemon, Fire Emblem, Mario & Luigi, and more classic role-playing games in your browser.' },
  { name: 'Platformer', slug: 'platformer', desc: 'Play GBA platformer games online free. Super Mario, Kirby, Donkey Kong, Sonic, and Crash Bandicoot in your browser.' },
  { name: 'Action', slug: 'action', desc: 'Play GBA action games online free. Metroid, Castlevania, GTA, and more classic action games in your browser.' },
  { name: 'Adventure', slug: 'adventure', desc: 'Play GBA adventure games online free. Zelda: Minish Cap, Zelda: A Link to the Past, and more classic adventures.' },
  { name: 'Racing', slug: 'racing', desc: 'Play GBA racing games online free. Mario Kart Super Circuit and more classic racing games in your browser.' },
  { name: 'Fighting', slug: 'fighting', desc: 'Play GBA fighting games online free. Dragon Ball Advanced Adventure and more classic fighting games.' },
  { name: 'Strategy', slug: 'strategy', desc: 'Play GBA strategy games online free. Fire Emblem: Sacred Stones and more classic strategy games.' },
  { name: 'Simulation', slug: 'simulation', desc: 'Play GBA simulation games online free. Harvest Moon Friends of Mineral Town and more classic sim games.' },
];

const SERIES = [
  { name: 'Pokemon', slug: 'pokemon', desc: 'Play Pokemon GBA games online free. Pokemon Emerald, FireRed, LeafGreen, Ruby, Sapphire, and ROM hacks in your browser.' },
  { name: 'Zelda', slug: 'zelda', desc: 'Play Zelda GBA games online free. Zelda: Minish Cap and Zelda: A Link to the Past in your browser.' },
  { name: 'Mario', slug: 'mario', desc: 'Play Mario GBA games online free. Super Mario World, Mario Kart, Mario & Luigi, and Classic NES Mario in your browser.' },
  { name: 'Metroid', slug: 'metroid', desc: 'Play Metroid GBA games online free. Metroid Fusion and Metroid: Zero Mission in your browser.' },
  { name: 'Kirby', slug: 'kirby', desc: 'Play Kirby GBA games online free. Kirby: Nightmare in Dream Land and Kirby & the Amazing Mirror in your browser.' },
  { name: 'Castlevania', slug: 'castlevania', desc: 'Play Castlevania GBA games online free. Castlevania: Aria of Sorrow in your browser.' },
  { name: 'Sonic', slug: 'sonic', desc: 'Play Sonic GBA games online free. Sonic Advance 3 in your browser.' },
  { name: 'Fire Emblem', slug: 'fire-emblem', desc: 'Play Fire Emblem GBA games online free. Fire Emblem: Sacred Stones in your browser.' },
  { name: 'Dragon Ball', slug: 'dragon-ball', desc: 'Play Dragon Ball GBA games online free. Dragon Ball: Advanced Adventure in your browser.' },
  { name: 'Harvest Moon', slug: 'harvest-moon', desc: 'Play Harvest Moon GBA games online free. Harvest Moon: Friends of Mineral Town in your browser.' },
  { name: 'Donkey Kong', slug: 'donkey-kong', desc: 'Play Donkey Kong GBA games online free. Donkey Kong Country in your browser.' },
  { name: 'Crash Bandicoot', slug: 'crash-bandicoot', desc: 'Play Crash Bandicoot GBA games online free. Crash Bandicoot: The Huge Adventure in your browser.' },
  { name: 'GTA', slug: 'gta', desc: 'Play GTA GBA games online free. GTA Advance in your browser.' },
];

const LANGUAGES = [
  { code: 'en', name: 'English', hreflang: 'en' },
  { code: 'es', name: 'Espanol', hreflang: 'es' },
  { code: 'pt', name: 'Portugues', hreflang: 'pt' },
  { code: 'fr', name: 'Francais', hreflang: 'fr' },
  { code: 'de', name: 'Deutsch', hreflang: 'de' },
  { code: 'ja', name: 'Japanese', hreflang: 'ja' },
  { code: 'ko', name: 'Korean', hreflang: 'ko' },
  { code: 'hi', name: 'Hindi', hreflang: 'hi' },
  { code: 'ar', name: 'Arabic', hreflang: 'ar' },
  { code: 'ru', name: 'Russian', hreflang: 'ru' },
];

const SITE = 'https://www.eggermath.com';

function gamePageHTML(game) {
  const related = GAMES.filter(g => g.series === game.series && g.slug !== game.slug).slice(0, 4);
  const relatedHTML = related.map(g => `<li><a href="/games/${g.slug}.html">${g.title}</a> - ${g.genre} (${g.year})</li>`).join('\n                ');
  const otherGames = GAMES.filter(g => g.genre === game.genre && g.slug !== game.slug).slice(0, 4);
  const otherHTML = otherGames.map(g => `<li><a href="/games/${g.slug}.html">${g.title}</a> - ${g.series} (${g.year})</li>`).join('\n                ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Play ${game.title} Online Free — No Download, No Install</title>
  <meta name="description" content="Play ${game.title} online free in your browser. No download, no install. Save states, fast forward, fullscreen, mobile touch controls.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${SITE}/games/${game.slug}.html">
  <meta property="og:title" content="Play ${game.title} Online Free — No Download">
  <meta property="og:description" content="${game.desc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE}/games/${game.slug}.html">
  <meta property="og:site_name" content="EggerMath">
  <meta property="og:image" content="${SITE}/images/eggermath-logo.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Play ${game.title} Online Free — GBA Emulator">
  <meta name="twitter:description" content="${game.desc}">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "VideoGame",
        "name": "${game.title}",
        "description": "${game.desc}",
        "gameEmulator": "Game Boy Advance",
        "applicationCategory": "Game",
        "operatingSystem": "Web Browser",
        "datePublished": "${game.year}",
        "genre": ["${game.genre}"],
        "gamePlatform": "Game Boy Advance",
        "isAccessibleForFree": true,
        "inLanguage": "en",
        "keywords": "${game.title}, GBA, Game Boy Advance, play ${game.title} online, ${game.title} emulator, ${game.title} free",
        "author": {"@type": "Organization", "name": "EggerMath"},
        "gameSeries": "${game.series}",
        "url": "${SITE}/games/${game.slug}.html"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {"@type": "ListItem", "position": 1, "name": "Home", "item": "${SITE}/"},
          {"@type": "ListItem", "position": 2, "name": "GBA Emulator", "item": "${SITE}/gba-emulator-web/"},
          {"@type": "ListItem", "position": 3, "name": "${game.title}", "item": "${SITE}/games/${game.slug}.html"}
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do I play ${game.title} online?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Click the Play button above to start ${game.title} instantly in your browser. No download, no installation required. The game runs on mGBA WebAssembly."
            }
          },
          {
            "@type": "Question",
            "name": "Can I save my progress in ${game.title}?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Press F5 to save, F9 to load, and F7 to switch between 10 save slots. Progress also auto-saves every 30 seconds."
            }
          },
          {
            "@type": "Question",
            "name": "Is ${game.title} free to play?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, ${game.title} is completely free to play on EggerMath. No account, no fees, no hidden costs."
            }
          }
        ]
      }
    ]
  }
  </script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', sans-serif; background: #161a13; color: #f0ebe0; min-height: 100vh; }
    .nav { background: #0d0d1a; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .nav a { color: rgba(240,235,224,0.6); text-decoration: none; font-size: 0.85rem; margin-left: 20px; }
    .nav a.brand { color: #c4a35a; font-weight: 700; font-size: 1.1rem; margin-left: 0; }
    .nav a.active { color: #c4a35a; }
    .breadcrumbs { padding: 10px 24px; font-size: 0.8rem; color: rgba(240,235,224,0.4); }
    .breadcrumbs a { color: rgba(240,235,224,0.5); text-decoration: none; }
    .breadcrumbs .sep { margin: 0 6px; }
    .breadcrumbs .current { color: #c4a35a; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px 24px; }
    h1 { font-size: 1.8rem; color: #f0ebe0; margin-bottom: 8px; }
    .meta { color: rgba(240,235,224,0.5); font-size: 0.9rem; margin-bottom: 20px; }
    .meta span { margin-right: 12px; }
    .meta .genre { color: #c4a35a; }
    .desc { font-size: 1rem; line-height: 1.7; color: rgba(240,235,224,0.7); margin-bottom: 30px; }
    .play-btn { display: inline-block; background: #c4a35a; color: #161a13; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 1rem; transition: background 0.2s; }
    .play-btn:hover { background: #d4b36a; }
    .section { margin-top: 40px; }
    .section h2 { font-size: 1.2rem; color: #c4a35a; margin-bottom: 12px; }
    .section ul { list-style: none; }
    .section li { padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
    .section a { color: #f0ebe0; text-decoration: none; }
    .section a:hover { color: #c4a35a; }
    .faq-item { border-bottom: 1px solid rgba(255,255,255,0.04); }
    .faq-item summary { padding: 14px 0; cursor: pointer; font-weight: 600; color: #f0ebe0; list-style: none; }
    .faq-item summary::-webkit-details-marker { display: none; }
    .faq-item summary::before { content: '+ '; color: #c4a35a; font-weight: 700; }
    .faq-item[open] summary::before { content: '- '; }
    .faq-item p { padding: 0 0 14px 0; color: rgba(240,235,224,0.6); font-size: 0.9rem; line-height: 1.6; }
    .footer { margin-top: 60px; padding: 30px 24px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; color: rgba(240,235,224,0.3); font-size: 0.8rem; }
  </style>
</head>
<body>
  <nav class="nav">
    <a href="/" class="brand">EggerMath</a>
    <div>
      <a href="/">Home</a>
      <a href="/gba-emulator-web/" class="active">GBA Emulator</a>
      <a href="/blog/">Blog</a>
    </div>
  </nav>
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <a href="/">Home</a><span class="sep">›</span>
    <a href="/gba-emulator-web/">GBA Emulator</a><span class="sep">›</span>
    <a href="/genre/${game.genre.toLowerCase()}/">${game.genre} Games</a><span class="sep">›</span>
    <span class="current">${game.title}</span>
  </nav>
  <div class="container">
    <h1>${game.title}</h1>
    <div class="meta">
      <span class="genre">${game.genre}</span>
      <span>${game.year}</span>
      <span>${game.series} Series</span>
      <span>Game Boy Advance</span>
    </div>
    <p class="desc">${game.desc}</p>
    <a href="/gba-emulator-web/" class="play-btn">Play ${game.title} Online Free</a>

    ${related.length ? `<div class="section">
      <h2>More ${game.series} Games</h2>
      <ul>
                ${relatedHTML}
      </ul>
    </div>` : ''}

    ${otherGames.length ? `<div class="section">
      <h2>More ${game.genre} Games</h2>
      <ul>
                ${otherHTML}
      </ul>
    </div>` : ''}

    <div class="section">
      <h2>How to Play ${game.title}</h2>
      <p class="desc">Click the "Play" button above to start ${game.title} instantly in your browser. No download, no installation required. The game runs on mGBA WebAssembly — the same engine used by standalone emulators. Use your keyboard or touch controls to play. Save states, fast forward, and fullscreen are built in.</p>
    </div>

    <div class="section faq">
      <h2>Frequently Asked Questions</h2>
      <details class="faq-item">
        <summary>How do I play ${game.title} online?</summary>
        <p>Click the Play button above to start ${game.title} instantly in your browser. No download, no installation required. The game runs on mGBA WebAssembly.</p>
      </details>
      <details class="faq-item">
        <summary>Can I save my progress in ${game.title}?</summary>
        <p>Yes. Press F5 to save, F9 to load, and F7 to switch between 10 save slots. Progress also auto-saves every 30 seconds.</p>
      </details>
      <details class="faq-item">
        <summary>Is ${game.title} free to play?</summary>
        <p>Yes, ${game.title} is completely free to play on EggerMath. No account, no fees, no hidden costs.</p>
      </details>
    </div>
  </div>
  <footer class="footer">
    <p>&copy; 2026 EggerMath — Free GBA Emulator</p>
    <p><a href="/" style="color:rgba(240,235,224,0.4);">Home</a> | <a href="/gba-emulator-web/" style="color:rgba(240,235,224,0.4);">Emulator</a> | <a href="/privacy.html" style="color:rgba(240,235,224,0.4);">Privacy</a> | <a href="/terms.html" style="color:rgba(240,235,224,0.4);">Terms</a></p>
  </footer>
</body>
</html>`;
}

function genrePageHTML(genre) {
  const games = GAMES.filter(g => g.genre === genre.name);
  const gamesHTML = games.map(g => `
    <div style="padding:16px;background:rgba(18,18,31,0.8);border-radius:12px;border:1px solid rgba(255,255,255,0.04);">
      <h3 style="font-size:1rem;color:#c4a35a;margin-bottom:6px;"><a href="/games/${g.slug}.html" style="color:#c4a35a;text-decoration:none;">${g.title}</a></h3>
      <p style="font-size:0.82rem;color:rgba(240,235,224,0.55);line-height:1.5;">${g.desc}</p>
      <span style="font-size:0.75rem;color:rgba(240,235,224,0.3);">${g.series} · ${g.year}</span>
    </div>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Play ${genre.name} GBA Games Online Free — No Download, No Install</title>
  <meta name="description" content="Play ${genre.name} GBA games online free in your browser. No download, no install. Save states, fast forward, mobile touch controls.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${SITE}/genre/${genre.slug}/">
  <meta property="og:title" content="Play ${genre.name} GBA Games Online Free">
  <meta property="og:description" content="${genre.desc}">
  <meta property="og:url" content="${SITE}/genre/${genre.slug}/">
  <meta property="og:site_name" content="EggerMath">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Play ${genre.name} GBA Games Online Free",
    "description": "${genre.desc}",
    "url": "${SITE}/genre/${genre.slug}/",
    "isPartOf": {"@type": "WebSite", "name": "EggerMath", "url": "${SITE}"}
  }
  </script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', sans-serif; background: #161a13; color: #f0ebe0; min-height: 100vh; }
    .nav { background: #0d0d1a; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .nav a { color: rgba(240,235,224,0.6); text-decoration: none; font-size: 0.85rem; margin-left: 20px; }
    .nav a.brand { color: #c4a35a; font-weight: 700; font-size: 1.1rem; margin-left: 0; }
    .breadcrumbs { padding: 10px 24px; font-size: 0.8rem; color: rgba(240,235,224,0.4); }
    .breadcrumbs a { color: rgba(240,235,224,0.5); text-decoration: none; }
    .container { max-width: 900px; margin: 0 auto; padding: 40px 24px; }
    h1 { font-size: 1.6rem; color: #f0ebe0; margin-bottom: 8px; }
    .desc { color: rgba(240,235,224,0.5); font-size: 0.9rem; margin-bottom: 30px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  </style>
</head>
<body>
  <nav class="nav">
    <a href="/" class="brand">EggerMath</a>
    <div><a href="/">Home</a><a href="/gba-emulator-web/">GBA Emulator</a><a href="/blog/">Blog</a></div>
  </nav>
  <nav class="breadcrumbs"><a href="/">Home</a> › <a href="/gba-emulator-web/">GBA Emulator</a> › <span style="color:#c4a35a;">${genre.name} Games</span></nav>
  <div class="container">
    <h1>Play ${genre.name} GBA Games Online Free</h1>
    <p class="desc">${genre.desc}</p>
    <div class="grid">${gamesHTML}</div>
  </div>
</body>
</html>`;
}

function seriesPageHTML(series) {
  const games = GAMES.filter(g => g.series === series.name);
  const gamesHTML = games.map(g => `
    <div style="padding:16px;background:rgba(18,18,31,0.8);border-radius:12px;border:1px solid rgba(255,255,255,0.04);">
      <h3 style="font-size:1rem;color:#c4a35a;margin-bottom:6px;"><a href="/games/${g.slug}.html" style="color:#c4a35a;text-decoration:none;">${g.title}</a></h3>
      <p style="font-size:0.82rem;color:rgba(240,235,224,0.55);line-height:1.5;">${g.desc}</p>
      <span style="font-size:0.75rem;color:rgba(240,235,224,0.3);">${g.genre} · ${g.year}</span>
    </div>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Play ${series.name} GBA Games Online Free — No Download, No Install</title>
  <meta name="description" content="Play ${series.name} GBA games online free in your browser. No download, no install. Save states, fast forward, mobile touch controls.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${SITE}/series/${series.slug}/">
  <meta property="og:title" content="Play ${series.name} GBA Games Online Free">
  <meta property="og:description" content="${series.desc}">
  <meta property="og:url" content="${SITE}/series/${series.slug}/">
  <meta property="og:site_name" content="EggerMath">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Play ${series.name} GBA Games Online Free",
    "description": "${series.desc}",
    "url": "${SITE}/series/${series.slug}/",
    "isPartOf": {"@type": "WebSite", "name": "EggerMath", "url": "${SITE}"}
  }
  </script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', sans-serif; background: #161a13; color: #f0ebe0; min-height: 100vh; }
    .nav { background: #0d0d1a; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .nav a { color: rgba(240,235,224,0.6); text-decoration: none; font-size: 0.85rem; margin-left: 20px; }
    .nav a.brand { color: #c4a35a; font-weight: 700; font-size: 1.1rem; margin-left: 0; }
    .breadcrumbs { padding: 10px 24px; font-size: 0.8rem; color: rgba(240,235,224,0.4); }
    .breadcrumbs a { color: rgba(240,235,224,0.5); text-decoration: none; }
    .container { max-width: 900px; margin: 0 auto; padding: 40px 24px; }
    h1 { font-size: 1.6rem; color: #f0ebe0; margin-bottom: 8px; }
    .desc { color: rgba(240,235,224,0.5); font-size: 0.9rem; margin-bottom: 30px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  </style>
</head>
<body>
  <nav class="nav">
    <a href="/" class="brand">EggerMath</a>
    <div><a href="/">Home</a><a href="/gba-emulator-web/">GBA Emulator</a><a href="/blog/">Blog</a></div>
  </nav>
  <nav class="breadcrumbs"><a href="/">Home</a> › <a href="/gba-emulator-web/">GBA Emulator</a> › <span style="color:#c4a35a;">${series.name} Games</span></nav>
  <div class="container">
    <h1>Play ${series.name} GBA Games Online Free</h1>
    <p class="desc">${series.desc}</p>
    <div class="grid">${gamesHTML}</div>
  </div>
</body>
</html>`;
}

// Generate game pages
const gamesDir = path.join(__dirname, 'games');
if (!fs.existsSync(gamesDir)) fs.mkdirSync(gamesDir, { recursive: true });
GAMES.forEach(g => {
  fs.writeFileSync(path.join(gamesDir, g.slug + '.html'), gamePageHTML(g));
  console.log('Created: games/' + g.slug + '.html');
});

// Generate genre pages
GENRES.forEach(g => {
  const dir = path.join(__dirname, 'genre', g.slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), genrePageHTML(g));
  console.log('Created: genre/' + g.slug + '/index.html');
});

// Generate series pages
SERIES.forEach(s => {
  const dir = path.join(__dirname, 'series', s.slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), seriesPageHTML(s));
  console.log('Created: series/' + s.slug + '/index.html');
});

// Generate hreflang sitemap
let hreflangXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

// Homepage hreflang
hreflangXML += `  <url><loc>${SITE}/</loc>\n`;
LANGUAGES.forEach(l => {
  hreflangXML += `    <xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${SITE}/${l.code}/" />\n`;
});
hreflangXML += `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/" />\n`;
hreflangXML += `  </url>\n`;

// Emulator page hreflang
hreflangXML += `  <url><loc>${SITE}/gba-emulator-web/</loc>\n`;
LANGUAGES.forEach(l => {
  hreflangXML += `    <xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${SITE}/${l.code}/gba-emulator-web/" />\n`;
});
hreflangXML += `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/gba-emulator-web/" />\n`;
hreflangXML += `  </url>\n`;

hreflangXML += `</urlset>`;
fs.writeFileSync(path.join(__dirname, 'sitemap-hreflang.xml'), hreflangXML);
console.log('Created: sitemap-hreflang.xml');

// Update main sitemap
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}/</loc><lastmod>2026-08-12</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${SITE}/gba-emulator-web/</loc><lastmod>2026-08-12</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>\n`;

GAMES.forEach(g => {
  sitemap += `  <url><loc>${SITE}/games/${g.slug}.html</loc><lastmod>2026-08-12</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n`;
});

GENRES.forEach(g => {
  sitemap += `  <url><loc>${SITE}/genre/${g.slug}/</loc><lastmod>2026-08-12</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
});

SERIES.forEach(s => {
  sitemap += `  <url><loc>${SITE}/series/${s.slug}/</loc><lastmod>2026-08-12</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
});

// Add existing pages
['about', 'contact', 'privacy', 'terms', 'takedown'].forEach(p => {
  sitemap += `  <url><loc>${SITE}/${p}.html</loc><lastmod>2026-08-12</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>\n`;
});

sitemap += `  <url><loc>${SITE}/blog/</loc><lastmod>2026-08-12</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;

// Blog posts
const blogs = [
  'how-to-play-gba-games-in-browser', 'best-gba-rom-hacks-2026', 'top-25-best-gba-games',
  'play-pokemon-fire-red-in-browser', 'gba-emulator-no-download', 'play-gba-games-on-pc-free',
  'gba-emulator-save-states-explained', 'best-gba-games-speedrunning', 'gba-vs-gbc-difference',
  'play-multiplayer-gba-online', 'play-pokemon-emerald-in-browser', 'best-free-gba-emulator-2026',
  'play-zelda-minish-cap-in-browser'
];
blogs.forEach(b => {
  sitemap += `  <url><loc>${SITE}/blog/${b}.html</loc><lastmod>2026-08-12</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
});

sitemap += `</urlset>`;
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap);
console.log('Updated: sitemap.xml');
console.log('Done!');
