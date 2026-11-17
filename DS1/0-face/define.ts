type StyledElement = HTMLElement & {
  createRenderRoot?: () => HTMLElement | ShadowRoot;
  renderOptions?: { renderBefore?: ChildNode | null };
};
type StyledConstructor = CustomElementConstructor & {
  elementStyles?: Array<{ cssText?: string; cssRules?: CSSRuleList }>;
  shadowRootOptions?: ShadowRootInit;
};

export function define(name: string, element: CustomElementConstructor): void {
  if (typeof customElements === 'undefined' || customElements.get(name)) return;
  const type = element as StyledConstructor;
  const prototype = element.prototype as StyledElement;
  const original = prototype.createRenderRoot;
  if (original && typeof document !== 'undefined') {
    const definingDocument = document;
    prototype.createRenderRoot = function (this: StyledElement) {
      if (this.ownerDocument === definingDocument || !type.elementStyles?.length) return original.call(this);
      const root = this.shadowRoot ?? this.attachShadow(type.shadowRootOptions ?? { mode: 'open' });
      for (const sheet of type.elementStyles) {
        const style = this.ownerDocument.createElement('style');
        style.textContent = sheet.cssText ?? Array.from(sheet.cssRules ?? [], rule => rule.cssText).join('\n');
        root.append(style);
      }
      if (this.renderOptions) this.renderOptions.renderBefore ??= root.firstChild;
      return root;
    };
  }
  customElements.define(name, element);
}
