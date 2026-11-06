import { createHash } from 'node:crypto';
import { transformSync } from 'esbuild';
import { Window } from 'happy-dom';

type Definition = { tag: string; markup?: string; [key: string]: unknown };
type Page = { components: Record<string, Definition>; document: { blocks: unknown[] }; library?: string; [key: string]: unknown };
export type TemplateRegistry = Record<string, Page>;
const refresh = 'Run vp exec tsx scripts/consistency-templates.ts --refresh, review the retained definitions and commit the registry.';
const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
function css(source: string): string {
  const result = transformSync(source, { loader: 'css', target: 'esnext', legalComments: 'inline' });
  if (result.warnings.length) throw Error('Cannot compare template CSS safely: ' + result.warnings.map(w => w.text).join('; '));
  return result.code;
}
/** Comparison only. Never substitute normalized bytes into a recorded presentation. */
function signature(page: Page): string {
  const window = new Window();
  try {
    const definitions = new Map<string, string>();
    const definition = (name: string) => {
      if (definitions.has(name)) return definitions.get(name)!;
      const value = page.components[name];
      if (!value) throw Error(`Missing template presentation: ${name}`);
      const comparable = { ...value };
      if (value.tag === 'style' && typeof value.markup === 'string') {
        const template = window.document.createElement('template'); template.innerHTML = value.markup;
        const style = template.content.firstElementChild;
        if (!style || style.localName !== 'style' || template.content.childNodes.length !== 1) throw Error('Cannot compare template style markup safely.');
        style.textContent = css(style.textContent ?? ''); comparable.markup = style.outerHTML;
      }
      const result = hash(comparable); definitions.set(name, result); return result;
    };
    const walk = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.map(walk);
      if (!value || typeof value !== 'object') return value;
      const object = value as Record<string, unknown>;
      return Object.fromEntries(Object.entries(object).map(([key, entry]) => [key, key === 'name' && object.kind === 'component' ? definition(String(entry)) : walk(entry)]));
    };
    const { components: _, library, ...fields } = page;
    return hash({ ...fields, document: walk(page.document), ...(library === undefined ? {} : { library: css(library) }) });
  } finally { void window.happyDOM.close(); }
}

/** Retained names always retain exact definition bytes, including comments and licenses. */
export function reconcileTemplateRegistry(previous: TemplateRegistry, candidate: TemplateRegistry, update = false): TemplateRegistry {
  const removed = Object.keys(previous).filter(id => !candidate[id]);
  if (removed.length) throw Error(`Template removal requires an explicit history migration: ${removed.join(', ')}.`);
  const next: TemplateRegistry = {};
  const changed: string[] = [];
  for (const [id, page] of Object.entries(candidate)) {
    const recorded = previous[id];
    for (const [name, definition] of Object.entries(recorded?.components ?? {})) {
      if (page.components[name] && JSON.stringify(page.components[name]) !== JSON.stringify(definition)) throw Error(`Immutable template presentation changed: ${id}/${name}.`);
    }
    if (recorded && signature(recorded) === signature(page)) { next[id] = recorded; continue; }
    changed.push(id);
    next[id] = { ...page, components: { ...recorded?.components, ...page.components } };
  }
  if (changed.length && !update) throw Error(`Template registry is stale: ${changed.join(', ')}. ${refresh}`);
  return changed.length ? next : previous;
}
