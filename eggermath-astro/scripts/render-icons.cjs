// One-off icon renderer: favicon.svg -> PNG fallbacks + favicon.ico
// Usage: node scripts/render-icons.cjs (requires `sharp` in node_modules)
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

(async () => {
  const pub = path.join(__dirname, '..', 'public');
  let svg = fs.readFileSync(path.join(pub, 'favicon.svg'), 'utf8');
  if (!svg.includes('width=')) {
    svg = svg.replace('<svg ', '<svg width="512" height="512" ');
  }
  const buf = Buffer.from(svg);

  const targets = [
    ['favicon-16x16.png', 16],
    ['favicon-32x32.png', 32],
    ['favicon-48x48.png', 48],
    ['apple-touch-icon.png', 180],
    ['icon-192.png', 192],
    ['icon-512.png', 512],
  ];
  for (const [name, size] of targets) {
    await sharp(buf).resize(size, size).png().toFile(path.join(pub, name));
    console.log('wrote', name);
  }

  // favicon.ico = ICO container with a single 48px PNG (valid for all modern browsers)
  const png48 = await sharp(buf).resize(48, 48).png().toBuffer();
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header.writeUInt8(48, 6);
  header.writeUInt8(48, 7);
  header.writeUInt8(0, 8);
  header.writeUInt8(0, 9);
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png48.length, 14);
  header.writeUInt32LE(22, 18);
  fs.writeFileSync(path.join(pub, 'favicon.ico'), Buffer.concat([header, png48]));
  console.log('wrote favicon.ico');
})().catch((e) => { console.error(e); process.exit(1); });
