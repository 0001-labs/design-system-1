import './build-interface-catalog';
import { mkdir, writeFile, copyFile, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { PRODUCTS, drawingSvg, packIco } from '../website/src/lib/icons/studio';
const require = createRequire(new URL('../website/package.json', import.meta.url));
const sharp = require('sharp');
const destination = new URL('../website/public/icons/', import.meta.url);
await mkdir(destination, { recursive: true });
for (const preset of PRODUCTS) {
  const svg = drawingSvg(preset);
  await writeFile(new URL(preset.key + '.svg', destination), svg);
  const images = await Promise.all([16, 32, 48, 256].map(async size => ({ size, bytes: new Uint8Array(await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer()) })));
  await writeFile(new URL(preset.key + '.ico', destination), packIco(images));
  await writeFile(new URL(preset.key + '.png', destination), await sharp(Buffer.from(svg)).resize(512, 512).png().toBuffer());
}
for (const key of ['0001', '0001-light', '0001-dark']) {
  const svg = await readFile(new URL(`../website/src/lib/icons/brands/${key}.svg`, import.meta.url), 'utf8');
  await writeFile(new URL(key + '.svg', destination), svg);
  const images = await Promise.all([16, 32, 48, 256].map(async size => ({ size, bytes: new Uint8Array(await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer()) })));
  await writeFile(new URL(key + '.ico', destination), packIco(images));
  await writeFile(new URL(key + '.png', destination), await sharp(Buffer.from(svg)).resize(512, 512).png().toBuffer());
}
await writeFile(new URL('apple-touch-icon.png', destination), await sharp(Buffer.from(drawingSvg(PRODUCTS[0]))).resize(180, 180).png().toBuffer());
await copyFile(new URL('design-system-1.ico', destination), new URL('../favicon.ico', destination));
await copyFile(new URL('design-system-1.svg', destination), new URL('../favicon.svg', destination));
console.log(`Built ${PRODUCTS.length} favicon sets.`);

const apps = JSON.parse(await readFile(new URL("../DS1/x-app/catalog.json", import.meta.url), "utf8"));
await mkdir(new URL("apps/", destination), { recursive: true });
for (const app of apps) {
  await copyFile(new URL(`../DS1/x-app/${app.key}.svg`, import.meta.url), new URL(`apps/${app.key}.svg`, destination));
}
await copyFile(new URL("../DS1/x-app/catalog.json", import.meta.url), new URL("apps/catalog.json", destination));
