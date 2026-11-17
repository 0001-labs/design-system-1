import { posix } from 'node:path';

export const appleFonts = {
  'Inter-Arrows.woff2': 'DS1/1-root/fonts/Inter-Arrows.woff2',
  'Iosevka-Regular.woff2': 'DS1/1-root/fonts/Iosevka-Regular.woff2',
  'GT-America-Standard-Regular.woff2': 'DS1/1-root/fonts/GT-America-Standard-Regular.woff2',
  'GT-America-Standard-Medium.woff2': 'DS1/1-root/fonts/GT-America-Standard-Medium.woff2',
  'GT-America-Compressed-Regular.woff2': 'DS1/1-root/fonts/GT-America-Compressed-Regular.woff2',
  'OlivettiDot-Regular.woff2': 'website/src/assets/fonts/OlivettiDot-Regular.woff2',
};
export const appleFontsAlways = ['Inter-Arrows.woff2', 'Iosevka-Regular.woff2'];
const licences = {
  'Inter-LICENSE.md': 'DS1/1-root/fonts/Inter-LICENSE.md',
  'Iosevka-LICENSE.md': 'DS1/1-root/fonts/Iosevka-LICENSE.md',
  'Tabler-LICENSE.md': 'DS1/x-icon/Tabler-LICENSE.md',
};

const resources = 'Sources/DS1/Resources';
const json = value => JSON.stringify(value, null, 2) + '\n';

export function iconNames(tree) {
  return [...tree('DS1/x-icon', { only: /^[^/]+\.svg$/ }).keys()].map(file => file.slice(0, -4)).sort();
}

export function applePackage({ read, tree, fonts = [], sources = true }) {
  const files = new Map();
  if (sources)
    for (const [file, content] of tree('native/apple', { skip: /(^|\/)(\.build|\.swiftpm|Resources|Licences)(\/|$)|(^|\/)(\.gitignore|\.DS_Store)$/ })) files.set(file, content);
  for (const name of new Set([...appleFontsAlways, ...fonts])) {
    if (!Object.hasOwn(appleFonts, name)) throw new Error(`Unknown font for the Swift package: ${name}`);
    files.set(`${resources}/Fonts/${name}`, read(appleFonts[name]));
  }
  for (const [name, path] of Object.entries(licences)) files.set(`Licences/${name}`, read(path));
  const catalogue = `${resources}/Icons.xcassets`;
  files.set(`${catalogue}/Contents.json`, json({ info: { author: 'xcode', version: 1 } }));
  for (const name of iconNames(tree)) {
    files.set(posix.join(catalogue, `${name}.imageset`, `${name}.svg`), read(`DS1/x-icon/${name}.svg`));
    files.set(
      posix.join(catalogue, `${name}.imageset`, 'Contents.json'),
      json({
        images: [{ filename: `${name}.svg`, idiom: 'universal' }],
        info: { author: 'xcode', version: 1 },
        properties: { 'preserves-vector-representation': true, 'template-rendering-intent': 'template' },
      }),
    );
  }
  return files;
}
