const fs = require('fs');
const filePath = 'C:\\Users\\rayan\\OneDrive\\Pictures\\Downloads\\PRACTIC\\eggermath-astro\\src\\data\\translations.js';
const gSrc = fs.readFileSync('C:\\Users\\rayan\\OneDrive\\Pictures\\Downloads\\PRACTIC\\eggermath-astro\\src\\data\\games.js', 'utf8');
const slugs = [...gSrc.matchAll(/slug: '([^']+)'/g)].map(m => m[1]);
const titles = [...gSrc.matchAll(/title: '([^']+)'/g)].map(m => m[1]);
const sys = [...gSrc.matchAll(/system: '([^']+)'/g)].map(m => m[1]);

const tr = {
  'pt-BR': (t,s) => ({ t: `Jogue ${t} Online Gratis`, d: `Jogue ${t} online no navegador. Emulador ${s} gratuito.` }),
  'es':    (t,s) => ({ t: `Jugar ${t} Online Gratis`, d: `Juega ${t} online en el navegador. Emulador ${s} gratuito.` }),
  'ja':    (t,s) => ({ t: `${t}????????????`, d: `${t}?????????????${s}????????` }),
  'de':    (t,s) => ({ t: `${t} Online Kostenlos Spielen`, d: `Spiele ${t} online im Browser. Kostenloser ${s}-Emulator.` }),
  'fr':    (t,s) => ({ t: `Jouez a ${t} En Ligne Gratuitement`, d: `Jouez a ${t} en ligne. Emulateur ${s} gratuit.` }),
  'ru':    (t,s) => ({ t: `${t} Onlayn Besplatno`, d: `Igrayte ${t} onlayn. Besplatnyy ${s} emulyator.` }),
  'ko':    (t,s) => ({ t: `${t} ??? ?? ???`, d: `${t}? ????? ??????. ?? ${s} ?????.` }),
  'it':    (t,s) => ({ t: `Gioca a ${t} Online Gratis`, d: `Gioca a ${t} online. Emulatore ${s} gratuito.` }),
  'id':    (t,s) => ({ t: `Main ${t} Online Gratis`, d: `Main ${t} online. Emulator ${s} gratis.` }),
  'ar':    (t,s) => ({ t: `???? ${t} ??????? ?????`, d: `???? ${t} ???????. ????? ${s} ?????.` }),
};

let out = 'export const gameTranslations = {\n';
slugs.forEach((slug, i) => {
  const t = titles[i];
  const s = sys[i] || 'GBA';
  out += `  '${slug}': {\n`;
  out += `    'en': { title: 'Play ${t} Online Free', desc: 'Play ${t} online. Free ${s} emulator in your browser.' },\n`;
  for (const [lang, fn] of Object.entries(tr)) {
    const r = fn(t, s);
    out += `    '${lang}': { title: '${r.t.replace(/'/g,"\\'")}', desc: '${r.d.replace(/'/g,"\\'")}' },\n`;
  }
  out += '  },\n';
});
out += '};\nexport const supportedLangs = ["en","pt-BR","es","ja","de","fr","ru","ko","it","id","ar"];\nexport const langNames = { "en":"English","pt-BR":"Portugues","es":"Espanol","ja":"???","de":"Deutsch","fr":"Francais","ru":"???????","ko":"???","it":"Italiano","id":"Bahasa Indonesia","ar":"???????" };\n';
fs.writeFileSync(filePath, out, 'utf8');
console.log('Generated translations for', slugs.length, 'games');
