export const isElement = (node: unknown): node is Element => node != null && typeof node === "object" && "nodeType" in node && node.nodeType === 1;
export const isHTMLElement = (node: unknown): node is HTMLElement => isElement(node) && node.namespaceURI === "http://www.w3.org/1999/xhtml";
export const isTag = <K extends keyof HTMLElementTagNameMap>(node: Node, tag: K): node is HTMLElementTagNameMap[K] => isHTMLElement(node) && node.localName === tag;

export function hasSlottedContent(host: Node, name: string): boolean {
  return [...host.childNodes].some(node => name
    ? isElement(node) && node.getAttribute("slot") === name
    : isElement(node) ? !node.hasAttribute("slot") : node.nodeType === 3 && Boolean(node.textContent?.trim()));
}
