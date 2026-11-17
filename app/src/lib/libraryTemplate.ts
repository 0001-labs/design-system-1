import componentTokens from '../../../DS1/1-root/component-tokens.css?raw';
import componentMetrics from '../../../DS1/1-root/component-metrics.css?raw';
import { LIBRARY_REVISION } from '../../../DS1/1-root/library-tokens';
import { version } from '../../../package.json';

export const templateStamp = `/* DS1 — version ${version}+${LIBRARY_REVISION} */`;

export const libraryTemplate = `${templateStamp}\n/* Design system 1 component library */\n${componentMetrics}\n${componentTokens.replace(/^@import[^;]+;\s*/gm, '')}`;

export function templateVersion(template = libraryTemplate): string {
  const stamped = /\/\* DS1 — version ([^*]+?) \*\//.exec(template);
  return stamped?.[1]?.trim() ?? 'components-1';
}
