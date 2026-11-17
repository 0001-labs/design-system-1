import { build as bundleNativeClient } from 'esbuild';
import { readFile as readNativeClientFile } from 'node:fs/promises';
import { resolve as resolveNativeClient } from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { join, posix } from 'node:path';
import { componentGraph } from './scripts/component-graph.mjs';
import { applePackage } from './scripts/native-apple.mjs';
import { androidPackage } from './scripts/native-android.mjs';
import { libraryPin, pinnedFiles, pinnedLibrary } from './scripts/library-pin.mjs';

const nativeCssCache=new Map();
async function nativeInlineSource(path){
 if(!path.endsWith('.css'))return readNativeClientFile(path,'utf8');
 if(!nativeCssCache.has(path))nativeCssCache.set(path,bundleNativeClient({absWorkingDir:import.meta.dirname,entryPoints:[path],bundle:true,write:false,minify:true,loader:{'.woff2':'dataurl','.woff':'dataurl','.ttf':'dataurl','.svg':'dataurl','.png':'dataurl'},logLevel:'silent'}).then(result=>result.outputFiles[0].text));
 return nativeCssCache.get(path);
}
const rootStyles = ['one.css', 'grid.css', 'text.css', 'component-tokens.css', 'component-metrics.css', 'component-appearance.css', 'fonts.css', 'palette.css'];
const importsText = ['one.css', 'controls.css'];
const oneImports = ['fonts.css', 'palette.css'];
const controlSheets = ['table.css', 'empty.css', 'notice.css', 'overlay.css', 'header.css', 'footer.css', 'document.css', 'bento.css', 'carousel.css', 'card.css', 'figures.css', 'progress.css', 'row.css', 'context.css', 'native-controls.css'];
const writingSheets = { prose: 'prose.css', cjk: 'cjk.css', material: 'material.css' };
const askedSheets = options => Object.entries(writingSheets).filter(([flag]) => options[flag]).map(([, file]) => file);
const rootFonts = ['GT-America-Standard-Regular.woff2', 'GT-America-Standard-Medium.woff2', 'GT-America-Compressed-Regular.woff2', 'GT-Canon-M-Standard-Medium-Trial.woff2', 'Inter-Arrows.woff2', 'Iosevka-Regular.woff2', 'Inter-LICENSE.md', 'Iosevka-LICENSE.md'];
const alwaysFonts = ['Inter-Arrows.woff2', 'Iosevka-Regular.woff2', 'Inter-LICENSE.md', 'Iosevka-LICENSE.md'];
const rootModules = {
  grid: ['grid.ts', 'layout-inspector.ts', 'grid-fit.ts', 'constraint-panel.ts', 'constraint-site.ts', 'constraints.ts', 'fault-lines.ts', 'button-label.ts', 'tag-label.ts', 'text-contrast.ts', 'word-wrap.ts', 'window-shape.ts', 'scaling.ts', 'contrast-watch.ts', 'contrast-selectors.ts', 'failures.ts'],
  'grid-fit': ['grid-fit.ts'],
  'layout-inspector': ['layout-inspector.ts'],
  constraints: ['constraint-panel.ts', 'constraint-site.ts', 'constraints.ts', 'fault-lines.ts', 'button-label.ts', 'tag-label.ts', 'text-contrast.ts', 'word-wrap.ts', 'window-shape.ts', 'scaling.ts', 'contrast-watch.ts', 'contrast-selectors.ts', 'failures.ts'],
  'contrast-watch': ['contrast-watch.ts', 'contrast-selectors.ts', 'text-contrast.ts', 'failures.ts'],
  scaling: ['scaling.ts'],
  'theme-bootstrap': ['theme-bootstrap.js'],
  tooltips: ['tooltips.ts'],
  keys: ['keys.ts'],
  'overlay-swipe': ['overlay-swipe.ts'],
  header: ['header.ts', 'attach-overlay.ts'],
  'app-banner': ['app-banner.ts', 'scaling.ts'],
  bento: ['bento.ts'],
  focus: ['focus.ts', 'focus-vision.swift'],
  carousel: ['carousel.ts'],
  sidebar: ['sidebar.ts'],
  'cut-fade': ['cut-fade.ts'],
  'face-correction': ['face-correction.ts', 'google-face-metrics.json'],
  theme: ['theme.ts', 'theme-bootstrap.js', 'preference-options.ts'],
};
const tokenStyles = ['component-appearance.css', 'component-metrics.css', 'component-tokens.css'];
const withoutImports = css => css.replace(/^@import\s+"\.\/[^"]+";\s*\n/gm, '');
const remoteImport = /^@import\s+url\([^)]*\)[^;]*;\s*\n/gm;

const languageFiles = ['i18n.ts', 'languages.ts', 'language-routing.ts', 'translations-format.ts', 'language-validator.ts', 'shared-words.ts', 'format.ts', 'pricing.ts'];

function moduleGraph(read, entry) {
  const imports = /(?:\bfrom\s*|\bimport\s*\(\s*|^\s*import\s*|@import\s*)["'](\.[^"']+)["']/gm;
  const exists = path => { try { read(`DS1/${path}`); return true; } catch { return false; } };
  const files = new Map();
  const visit = file => {
    if (files.has(file)) return;
    const content = read(`DS1/${file}`);
    files.set(file, content);
    if (!/\.(ts|css)$/.test(file)) return;
    for (const match of String(content).matchAll(imports)) {
      const base = posix.normalize(posix.join(posix.dirname(file), match[1].split('?')[0]));
      if (base.startsWith('..')) throw new Error(`Dependency outside DS1: ${match[1]} in ${file}`);
      const dependency = [base, `${base}.ts`, `${base}.json`, `${base}/index.ts`].find(exists);
      if (!dependency) throw new Error(`Unresolved ${match[1]} in ${file}`);
      visit(dependency);
    }
  };
  visit(entry);
  return files;
}

function bundleFiles(read, entry, as = 'design-system-1.js') {
  const dist = posix.dirname(entry);
  const strip = text => String(text).replace(/\n?\/\/# sourceMappingURL=\S*\s*$/, '\n');
  const files = new Map();
  const queue = [[posix.basename(entry), as]];
  while (queue.length) {
    const [name, as] = queue.shift();
    if (files.has(as)) continue;
    const text = strip(read(`${dist}/${name}`));
    files.set(as, text);
    for (const [, chunk] of text.matchAll(/(?:from\s*|import\s*\(\s*)["']\.\/([^"']+\.js)["']/g)) queue.push([chunk, chunk]);
  }
  return files;
}

export default {
  exports: {
    'native-content': {
      async files({ read, tree }) {
        const client = await bundleNativeClient({ absWorkingDir:import.meta.dirname,entryPoints:[resolveNativeClient(import.meta.dirname,'shared/consistency-block-client.ts')],bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,write:false,outdir:resolveNativeClient(import.meta.dirname,'.reports/native-block-client'),entryNames:'blocks',loader:{'.woff2':'dataurl','.woff':'dataurl','.ttf':'dataurl','.svg':'text','.png':'dataurl'},plugins:[{name:'native-source-text',setup(build){build.onResolve({filter:/\.(?:css|svg)\?(?:inline|raw)$/},args=>({path:resolveNativeClient(args.resolveDir,args.path.replace(/\?(?:inline|raw)$/, '')),namespace:'native-source-text'}));build.onLoad({filter:/.*/,namespace:'native-source-text'},async args=>({contents:await nativeInlineSource(args.path),loader:'text'}));}}] });

        const behaviours = await bundleNativeClient({absWorkingDir:import.meta.dirname,entryPoints:[resolveNativeClient(import.meta.dirname,'shared/consistency-behaviours.ts')],bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,write:false});
        const scaling = await bundleNativeClient({absWorkingDir:import.meta.dirname,entryPoints:[resolveNativeClient(import.meta.dirname,'shared/consistency-scaling.ts')],bundle:true,format:'iife',platform:'browser',target:'es2022',minify:true,write:false});
        const themeRuntime = await bundleNativeClient({absWorkingDir:import.meta.dirname,entryPoints:[resolveNativeClient(import.meta.dirname,'DS1/0-face/theme-bootstrap.js')],bundle:true,format:'iife',platform:'browser',target:'es2020',minify:true,write:false});
        const importer = await bundleNativeClient({absWorkingDir:import.meta.dirname,entryPoints:[resolveNativeClient(import.meta.dirname,'shared/consistency-import.ts')],bundle:true,format:'esm',platform:'node',write:false});
        let source = String(read('shared/consistency-native-content.ts'))
          .replace('../website/src/vendor/aa/parse.js', './aa/parse.js')
          .replace('../DS1/2-core/generated/icons-immediate', './icons-immediate')
          .replace('../DS1/2-core/generated/icons-extra', './icons-extra');
        source = source.replace(/^import (\w+) from '([^']+)\?raw';$/gm, (_, name, path) =>
          `const ${name} = ${JSON.stringify(String(read(posix.normalize(posix.join('shared', path)))))};`);
        return {
          'native-content.ts': source,
          'import-html.mjs': importer.outputFiles[0].text,
          'workspace-migration.ts': String(read('shared/consistency-workspace-migration.ts')).replaceAll('./consistency-template-pages.json','./template-pages.json').replaceAll('./consistency-workspace-page','./workspace-page').replaceAll('./consistency-layout-import','./layout-import').replaceAll('./consistency-native-page','./native-page'),
          'layout-import.ts': String(read('shared/consistency-layout-import.ts')).replaceAll('./consistency-native-page','./native-page'),
          'native-client.js.txt': client.outputFiles.find(file=>file.path.endsWith('.js'))?.text??'',
          'native-client.css.txt': client.outputFiles.find(file=>file.path.endsWith('.css'))?.text??'',
          'native-behaviours.js.txt': behaviours.outputFiles[0].text,
          'native-theme.js.txt': themeRuntime.outputFiles[0].text,
          'native-scaling.ts': `export default ${JSON.stringify(scaling.outputFiles[0].text)};\n`,
          'components.ts': String(read('shared/consistency-components.ts')).replace('./consistency-site-design','./site-design'),
          'template-pages.json': read('shared/consistency-template-pages.json'),
          'native-page.ts': String(read('shared/consistency-native-page.ts'))
            .replace('./consistency-native-content', './native-content')
            .replaceAll('./consistency-vocabulary', './vocabulary').replaceAll('./consistency-components','./components').replaceAll('./consistency-site-design','./site-design')
            .replace(/^import (\w+) from '([^']+)\?raw';$/gm, (_, name, path) =>
              `const ${name} = ${JSON.stringify(String(read(posix.normalize(posix.join('shared', path)))))};`),
          'workspace-page.ts': String(read('shared/consistency-workspace-page.ts')).replace('./consistency-native-page', './native-page').replace('./consistency-template-pages.json','./template-pages.json').replace('./consistency-components','./components'),
          'vocabulary.ts': String(read('shared/consistency-vocabulary.ts')).replace('./consistency-native-page', './native-page'),
          'vocabulary.json': read('shared/generated/vocabulary.json'),
          'site-design.ts': read('shared/consistency-site-design.ts'),
          'consistency-content.ts': read('shared/consistency-content.ts'),
          'consistency-carousel.ts': read('shared/consistency-carousel.ts'),
          'consistency-signup.ts': read('shared/consistency-signup.ts'),
          'consistency-meetings.ts': read('shared/consistency-meetings.ts'),
          'consistency-fence-words.ts': read('shared/consistency-fence-words.ts'),
          'icons-immediate.ts': read('DS1/2-core/generated/icons-immediate.ts'),
          'icons-extra.ts': read('DS1/2-core/generated/icons-extra.ts'),
          'aa/parse.js': read('website/src/vendor/aa/parse.js'),
          ...Object.fromEntries([...tree('website/src/vendor/aa', { only: /^[^/]+\.d\.ts$/ })].map(([path, content]) => [`aa/${path}`, content])),
        };
      },
    },
    bundle: {
      owned: true,
      build: ({ run }) => run('vp', ['run', 'build:bundle']),
      files({ read, exists, options }) {
        const entry = 'dist/design-system-1.bundle.min.js';
        if (!exists(entry)) throw new Error('Design system 1 is not built: run vp run build:bundle');
        if (options.entry !== undefined && !/^[a-z0-9][a-z0-9.-]*\.js$/.test(String(options.entry))) throw new Error('"entry" is a file name ending in .js: "entry": "components.js"');
        return bundleFiles(read, entry, options.entry);
      },
    },
    'library-prepare': {
      async files() {
        const script = await bundleNativeClient({ absWorkingDir: import.meta.dirname, entryPoints: [resolveNativeClient(import.meta.dirname, 'packages/css-validate/src/prepare-library-cli.ts')], bundle: true,
          alias: { 'css-tree': createRequire(resolveNativeClient(import.meta.dirname, 'packages/css-validate/package.json')).resolve('css-tree') }, format: 'esm', platform: 'node', target: 'node20', write: false, banner: { js: '#!/usr/bin/env node' } });
        return { 'prepare-library.mjs': script.outputFiles[0].text };
      },
    },
    'device-artwork': {
      files({ read, options }) {
        if (options.bezels !== undefined && !Array.isArray(options.bezels)) throw new Error('Name the extra bezels to copy: "bezels": ["ipad-pro-11-space-gray"]');
        const bezels = (options.bezels ?? []).map(bezel => `${bezel}.png`);
        return Object.fromEntries(['iphone-17-pro-max-deep-blue.png','status-wifi.svg','status-battery.svg',...bezels].map(file=>[file,read(`packages/visual-kit/private-assets/${file}`)]));
      },
    },
    ask: {
      files({ read }) {
        return Object.fromEntries(['2-core/ds-ask.ts', '2-core/styles/ds-ask.css', '0-face/ask-listen.ts']
          .map(file => [file, read(`packages/app/src/${file}`)]));
      },
    },
    library: {
      async files({ read, options }) {
        const files = options.styles === false ? {} : { 'library-styles.ts': read('DS1/0-face/library-styles.ts') };
        const pin = libraryPin(options);
        if (!pin) {
          if (options.styles === false) throw new Error('Name the library to pin ("id" and "version"), or copy library-styles.ts');
          return files;
        }
        return { ...files, ...pinnedFiles(pin, await pinnedLibrary(pin)) };
      },
    },
    fonts: {
      files({ read, options }) {
        const available = {
          'OlivettiDot-Regular.woff2': 'website/src/assets/fonts/OlivettiDot-Regular.woff2',
          ...Object.fromEntries(rootFonts.map(name => [name, `DS1/1-root/fonts/${name}`])),
        };
        if (options.fonts !== undefined && !Array.isArray(options.fonts)) throw new Error('Name the fonts to copy: "fonts": ["Iosevka-Regular.woff2", …]');
        const names = [...(options.fonts ?? [])];
        if (options.stylesheet) for (const name of options.fonts ? alwaysFonts : rootFonts) if (!names.includes(name)) names.push(name);
        if (!names.length) throw new Error('Name the fonts to copy, or ask for the stylesheet');
        const files = Object.fromEntries(names.map(name => {
          if (!Object.hasOwn(available, name)) throw new Error(`Unknown font: ${name}`);
          return [name, read(available[name])];
        }));
        if (options.stylesheet) files['fonts.css'] = String(read('DS1/1-root/fonts.css')).replaceAll('url("./fonts/', 'url("./');
        return files;
      },
    },
    tokens: {
      files({ read, options }) {
        const files = options.bundle ? [...tokenStyles] : ['component-tokens.css', 'component-metrics.css', 'component-appearance.css'];
        files.push('palette.css');
        if (options.nativeControls) files.push('table.css', 'text.css', ...controlSheets.slice(1), 'controls.css');
        files.push(...askedSheets(options));
        if (options.bundle) {
          const sheets = files.map(file => withoutImports(String(read(`DS1/1-root/${file}`))));
          const remote = sheets.flatMap(css => css.match(remoteImport) ?? []).join('');
          return { 'bundle.css': `/* Generated from Design system 1/DS1/1-root: ${files.join(', ')}. Change Design system 1 and sync. */\n` + remote + sheets.map(css => css.replace(remoteImport, '')).join('\n') };
        }
        return Object.fromEntries(files.map(file => [file, read(`DS1/1-root/${file}`)]));
      },
    },
    root: {
      files({ read, options }) {
        const files = {};
        const styles = [...(options.styles ?? rootStyles), ...askedSheets(options)];
        for (const file of styles) {
          if (file !== 'inter-arrows.css' && !rootStyles.includes(file) && !Object.values(writingSheets).includes(file)) throw new Error(`Unknown root stylesheet: ${file}`);
          files[file] = read(`DS1/1-root/${file}`);
        }
        if (options.nativeControls) for (const file of [...controlSheets, 'controls.css']) files[file] = read(`DS1/1-root/${file}`);
        if (Object.keys(files).some(file => importsText.includes(file))) files['text.css'] = read('DS1/1-root/text.css');
        if (files['one.css']) for (const file of oneImports) files[file] ??= read(`DS1/1-root/${file}`);
        if (options.fonts !== false) for (const font of rootFonts) files[`fonts/${font}`] = read(`DS1/1-root/fonts/${font}`);
        for (const name of options.modules ?? []) {
          if (!Object.hasOwn(rootModules, name)) throw new Error(`Unknown page script: ${name}`);
          for (const file of rootModules[name]) files[posix.join(options.scriptsTo ?? '.', '0-face', file)] = read(`DS1/0-face/${file}`);
        }
        return files;
      },
    },
    sheets: {
      files({ read, options }) {
        if (!Array.isArray(options.sheets) || !options.sheets.length) throw new Error('Name the sheets to copy: "sheets": ["context.css"]');
        const files = {};
        const visit = file => {
          if (Object.hasOwn(files, file)) return;
          files[file] = read(`DS1/1-root/${file}`);
          for (const [, imported] of String(files[file]).matchAll(/^@import\s+"\.\/([^"]+)";/gm)) visit(imported);
        };
        for (const file of options.sheets) {
          if (![...controlSheets, 'guide.css'].includes(file)) throw new Error(`Unknown sheet: ${file}; the sheets are ${controlSheets.join(', ')}`);
          visit(file);
        }
        return files;
      },
    },
    languages: {
      files({ read, tree, options }) {
        const files = new Map();
        for (const file of languageFiles) {
          files.set(`0-face/${file}`, read(`DS1/0-face/${file}`));
          if (options.entries) files.set(file, `/** Generated language entry. Change Design system 1 and sync. */\nexport * from './0-face/${file.slice(0, -3)}';\n`);
        }
        for (const [file, content] of tree('DS1/0-face/translations', { only: /^[^/]+\.json$/ })) files.set(`0-face/translations/${file}`, content);
        return files;
      },
    },
    documentation: {
      files({ read, options }) {
        const componentPath = options.componentPath;
        if (typeof componentPath !== 'string' || !/^\.{1,2}\/[a-zA-Z0-9_./-]+$/.test(componentPath)) throw new Error('documentation needs componentPath: the relative import path to the copied DS1 components');
        return Object.fromEntries(['frame', 'columns', 'sidebar'].map(name => [`${name}.astro`, String(read(`DS1/4-page/docs/${name}.astro`))
          .replaceAll("'../ds-page'", `'${componentPath}/4-page/ds-page'`)
          .replaceAll("'../../3-unit/ds-sidebar'", `'${componentPath}/3-unit/ds-sidebar'`)]));
      },
    },
    components: {
      files({ source, options, git }) {
        if (!Array.isArray(options.components) || !options.components.length) throw new Error('Name the components to copy: "components": ["button", …]');
        if (options.react !== undefined && typeof options.react !== 'boolean') throw new Error('"react" is true (the default, with the React adapters) or false (the Lit elements alone)');
        const { components, files } = componentGraph(join(source, 'DS1'), options.components, { react: options.react !== false });
        const hashes = Object.fromEntries([...files].sort(([a], [b]) => a.localeCompare(b)).map(([file, content]) => [file, createHash('sha256').update(content).digest('hex')]));
        const tracked = [...files.keys()].filter(file => file !== 'components.ts').map(file => `DS1/${file}`);
        const commit = git(['log', '-1', '--format=%H', '--', ...tracked]) || git(['rev-parse', 'HEAD']);
        files.set('components-manifest.json', JSON.stringify({ source: 'Design system 1/DS1', commit, components, files: hashes }, null, 2) + '\n');
        return files;
      },
    },
    feedback: {
      files({ read, options }) {
        const files = moduleGraph(read, '0-face/feedback.ts');
        if (options.languages) for (const [file, content] of moduleGraph(read, '0-face/i18n.ts')) files.set(file, content);
        return files;
      },
    },
    email: {
      files({ read, options }) {
        return {
          [options.email ?? 'shared/design-system-1/email.ts']: read('DS1/4-page/email.ts'),
          [options.font ?? 'public/fonts/GT-America-Standard-Regular.woff2']: read('DS1/1-root/fonts/GT-America-Standard-Regular.woff2'),
        };
      },
    },
    swift: {
      owned: true,
      files({ read, tree, options }) { return applePackage({ read, tree, fonts: options.fonts ?? [] }); },
    },
    kotlin: {
      owned: true,
      files({ read, tree, options }) { return androidPackage({ read, tree, fonts: options.fonts ?? [] }); },
    },
    icons: {
      files({ read, options }) {
        const icons = Array.isArray(options.icons) ? Object.fromEntries(options.icons.map(name => [name, `${name}.svg`])) : options.icons;
        if (!icons || !Object.keys(icons).length) throw new Error('Name the icons to copy: "icons": ["duplicate", …]');
        const files = Object.fromEntries(Object.entries(icons).map(([name, file]) => [file, read(name.startsWith("app-") ? `DS1/x-app/${name.slice(4)}.svg` : `DS1/x-icon/${name}.svg`)]));
        if (Object.keys(icons).some(name => name.startsWith("app-"))) {
          for (const file of ['SVGL-LICENSE', 'Devicon-LICENSE', 'Logos-LICENSE', 'catalog.json']) files[`app-${file}`] = read(`DS1/x-app/${file}`);
        }
        return files;
      },
    },
    flags: {
      files({ read, tree, options }) {
        const all = [...tree('DS1/x-flag', { only: /^[^/]+\.svg$/ }).keys()];
        const files = options.flags === true ? all : Array.isArray(options.flags) ? options.flags.map(code => `${code}.svg`) : [];
        if (!files.length) throw new Error('Name the flags to copy: "flags": ["jp", …], or true for every one');
        for (const file of files) if (!all.includes(file)) throw new Error(`Unknown flag: ${file.slice(0, -4)}`);
        return { 'LICENSE.md': read('DS1/x-flag/LICENSE.md'), ...Object.fromEntries(files.map(file => [file, read(`DS1/x-flag/${file}`)])) };
      },
    },
  },
};
