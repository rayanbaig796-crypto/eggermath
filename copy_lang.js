const fs = require('fs');
const src = fs.readFileSync('C:\\Users\\rayan\\OneDrive\\Pictures\\Downloads\\PRACTIC\\eggermath-astro\\src\\pages\\[slug].astro', 'utf8');

let newSrc = src;
newSrc = newSrc.replace("import EmulatorLayout from '../layouts/EmulatorLayout.astro';", "import EmulatorLayout from '../../layouts/EmulatorLayout.astro';");
newSrc = newSrc.replace("import NoscriptFallback from '../components/NoscriptFallback.astro';", "import NoscriptFallback from '../../components/NoscriptFallback.astro';");
newSrc = newSrc.replace("import EmulatorContainer from '../components/EmulatorContainer.astro';", "import EmulatorContainer from '../../components/EmulatorContainer.astro';");
newSrc = newSrc.replace("import TouchControls from '../components/TouchControls.astro';", "import TouchControls from '../../components/TouchControls.astro';");
newSrc = newSrc.replace("import { games, SITE } from '../data/games.js';", "import { games, SITE } from '../../data/games.js';");
newSrc = newSrc.replace("import { gameTranslations, supportedLangs, langNames } from '../data/translations.js';", "import { gameTranslations, supportedLangs, langNames } from '../../data/translations.js';");
newSrc = newSrc.replace("import '../scripts/emulator.js';", "import '../../../scripts/emulator.js';");

const dir = 'C:\\Users\\rayan\\OneDrive\\Pictures\\Downloads\\PRACTIC\\eggermath-astro\\src\\pages\\[lang]';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(dir + '\\[slug].astro', newSrc, 'utf8');
console.log('Created [lang]/[slug].astro');
