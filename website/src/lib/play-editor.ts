import { createPlainEditor } from '../vendor/aa/aa.js';

export type TokenKind = 'tag' | 'attribute' | 'string' | 'comment' | 'keyword' | 'property' | 'number' | 'punctuation';
export interface Token { from: number; to: number; kind: TokenKind }

const KINDS: TokenKind[] = ['tag', 'attribute', 'string', 'comment', 'keyword', 'property', 'number', 'punctuation'];
const JS_KEYWORDS = /\b(?:await|async|break|case|catch|class|const|continue|default|delete|do|else|export|extends|false|finally|for|from|function|if|import|in|instanceof|let|new|null|of|return|static|super|switch|this|throw|true|try|typeof|undefined|var|void|while|yield)\b/y;

function css(code: string, start: number, end: number, tokens: Token[]): void {
  const pattern = /\/\*[\s\S]*?(?:\*\/|$)|"[^"\n]*"?|'[^'\n]*'?|@[\w-]+|--[\w-]+|[\w-]+(?=\s*:(?!:))|#[0-9a-fA-F]{3,8}\b|-?\d*\.?\d+(?:[a-z%]+)?|[{}:;,()]/g;
  pattern.lastIndex = start;
  for (let match; (match = pattern.exec(code)) && match.index < end;) {
    const word = match[0];
    const kind: TokenKind = word.startsWith('/*') ? 'comment'
      : word[0] === '"' || word[0] === "'" ? 'string'
      : word[0] === '@' ? 'keyword'
      : word.startsWith('--') || /[\w-]/.test(word[0]) && /^[\w-]+$/.test(word) && !/^\d/.test(word) ? 'property'
      : /^[{}:;,()]$/.test(word) ? 'punctuation' : 'number';
    tokens.push({ from: match.index, to: Math.min(match.index + word.length, end), kind });
  }
}

function javascript(code: string, start: number, end: number, tokens: Token[]): void {
  const pattern = /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|`(?:\\.|[^`\\])*`?|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b|[{}()[\];,.=<>+\-*/!?:&|]/g;
  pattern.lastIndex = start;
  for (let match; (match = pattern.exec(code)) && match.index < end;) {
    const word = match[0];
    let kind: TokenKind | null = null;
    if (word.startsWith('//') || word.startsWith('/*')) kind = 'comment';
    else if (/^["'`]/.test(word)) kind = 'string';
    else if (/^\d/.test(word)) kind = 'number';
    else if (/^[A-Za-z_$]/.test(word)) {
      JS_KEYWORDS.lastIndex = 0;
      if (JS_KEYWORDS.test(word) && JS_KEYWORDS.lastIndex === word.length) kind = 'keyword';
      else if (code[match.index + word.length] === '(') kind = 'property';
    } else kind = 'punctuation';
    if (kind) tokens.push({ from: match.index, to: Math.min(match.index + word.length, end), kind });
  }
}

export function highlight(code: string, language: 'html' | 'css' = 'html'): Token[] {
  const tokens: Token[] = [];
  if (language === 'css') { css(code, 0, code.length, tokens); return tokens; }
  const pattern = /<!--[\s\S]*?(?:-->|$)|<![^>]*>?|<\/?[A-Za-z][\w:-]*[^>]*>?/g;
  for (let match; (match = pattern.exec(code));) {
    const at = match.index;
    const text = match[0];
    if (text.startsWith('<!')) { tokens.push({ from: at, to: at + text.length, kind: 'comment' }); continue; }
    const name = /^<\/?([A-Za-z][\w:-]*)/.exec(text)!;
    tokens.push({ from: at, to: at + name[0].length, kind: 'tag' });
    const attributes = /([^\s=/>"']+)(\s*=\s*("[^"]*"?|'[^']*'?|[^\s>]+))?/g;
    attributes.lastIndex = name[0].length;
    const close = text.endsWith('>') ? text.length - 1 : text.length;
    for (let attribute; (attribute = attributes.exec(text)) && attribute.index < close;) {
      tokens.push({ from: at + attribute.index, to: at + attribute.index + attribute[1].length, kind: 'attribute' });
      if (attribute[3]) {
        const valueAt = attribute.index + attribute[0].length - attribute[3].length;
        tokens.push({ from: at + valueAt, to: at + valueAt + attribute[3].length, kind: 'string' });
      }
    }
    if (text.endsWith('>')) tokens.push({ from: at + text.length - (text.endsWith('/>') ? 2 : 1), to: at + text.length, kind: 'tag' });
    const element = name[1].toLowerCase();
    if (!name[0].startsWith('</') && text.endsWith('>') && (element === 'style' || element === 'script')) {
      const start = at + text.length;
      const closing = code.toLowerCase().indexOf(`</${element}`, start);
      const end = closing < 0 ? code.length : closing;
      (element === 'style' ? css : javascript)(code, start, end, tokens);
      pattern.lastIndex = end;
    }
  }
  return tokens;
}

export interface PlayEditor {
  readonly value: string;
  readonly caret: number;
  set(value: string, language?: 'html' | 'css'): void;
}

const supported = typeof CSS !== 'undefined' && 'highlights' in CSS && typeof Highlight !== 'undefined';

export function createPlayEditor(parent: HTMLElement, value: string, onChange: () => void): PlayEditor {
  const lines = document.createElement('div');
  lines.className = 'play-lines';
  lines.setAttribute('aria-hidden', 'true');
  const host = document.createElement('div');
  host.className = 'play-aa';
  host.setAttribute('aria-label', 'Code of the file');
  parent.replaceChildren(lines, host);
  const editor = createPlainEditor(host, { value, onChange: () => { paint(); onChange(); } });
  const block = host.querySelector<HTMLElement>('.aa-block')!;
  let language: 'html' | 'css' = 'html';

  function nodes(): { node: Node; from: number; length: number }[] {
    const out: { node: Node; from: number; length: number }[] = [];
    let at = 0;
    const walk = (parentNode: Node) => {
      for (const node of parentNode.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) { out.push({ node, from: at, length: node.textContent!.length }); at += node.textContent!.length; }
        else if (node.nodeName === 'BR') { out.push({ node, from: at, length: 1 }); at += 1; }
        else walk(node);
      }
    };
    walk(block);
    return out;
  }
  function range(map: ReturnType<typeof nodes>, from: number, to: number): Range | null {
    const start = map.find(part => part.node.nodeType === Node.TEXT_NODE && from >= part.from && from <= part.from + part.length);
    const end = map.find(part => part.node.nodeType === Node.TEXT_NODE && to >= part.from && to <= part.from + part.length);
    if (!start || !end) return null;
    const result = document.createRange();
    result.setStart(start.node, from - start.from);
    result.setEnd(end.node, to - end.from);
    return result;
  }
  function paint() {
    const text = editor.value;
    const count = Math.max(1, text.split('\n').length - (text.endsWith('\n') ? 1 : 0));
    if (lines.childElementCount !== count) {
      lines.replaceChildren(...Array.from({ length: count }, (_, index) => {
        const number = document.createElement('span');
        number.textContent = String(index + 1);
        return number;
      }));
      marked = null;
    }
    mark();
    if (!supported) return;
    const map = nodes();
    const groups = new Map<TokenKind, Range[]>(KINDS.map(kind => [kind, []]));
    for (const token of highlight(text, language)) {
      const found = range(map, token.from, token.to);
      if (found) groups.get(token.kind)!.push(found);
    }
    for (const kind of KINDS) CSS.highlights.set(`play-${kind}`, new Highlight(...groups.get(kind)!));
  }

  let marked: Element | null = null;
  function mark() {
    const line = caretOffset() === null ? -1 : editor.value.slice(0, caretOffset()!).split('\n').length - 1;
    const next = line >= 0 ? lines.children[line] ?? null : null;
    if (next === marked) return;
    marked?.classList.remove('play-line-current');
    next?.classList.add('play-line-current');
    marked = next;
  }
  function caretOffset(): number | null {
    const selection = document.getSelection();
    if (!selection?.rangeCount || !block.contains(selection.anchorNode)) return null;
    const before = document.createRange();
    before.selectNodeContents(block);
    before.setEnd(selection.anchorNode!, selection.anchorOffset);
    return before.toString().length;
  }
  document.addEventListener('selectionchange', mark);

  block.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || event.shiftKey || event.altKey || event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    document.execCommand('insertText', false, '  ');
  });
  paint();

  return {
    get value() { return editor.value; },
    get caret() { return caretOffset() ?? editor.value.length; },
    set(next: string, nextLanguage: 'html' | 'css' = 'html') {
      language = nextLanguage;
      editor.value = next;
      paint();
    },
  };
}
