import { copyText } from '../../../DS1/0-face/copy-text';

export function connectCodeCopy(root: Document = document): () => void {
  const copy = (event: MouseEvent) => {
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('.expressive-code .copy button[data-code]') : null;
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    void copyText((button.dataset.code ?? '').replace(/\u007f/g, '\n'));
  };
  root.addEventListener('click', copy, true);
  return () => root.removeEventListener('click', copy, true);
}
