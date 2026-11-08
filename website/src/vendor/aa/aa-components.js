import { atomPattern as e, blockRuns as t } from "./aa.js";
//#region \0rolldown/runtime.js
var n = Object.defineProperty, r = (e, t, n) => () => {
	if (n) throw n[0];
	try {
		return e && (t = e(e = 0)), t;
	} catch (e) {
		throw n = [e], e;
	}
}, i = (e, t) => {
	let r = {};
	for (var i in e) n(r, i, {
		get: e[i],
		enumerable: !0
	});
	return t || n(r, Symbol.toStringTag, { value: "Module" }), r;
}, a = [
	"default",
	"primary",
	"secondary",
	"active",
	"disabled",
	"danger"
], o = /@Button\(("(?:[^"\\\n]|\\.)*"),\s*"(default|primary|secondary|active|disabled|danger)"\)/;
function s(e) {
	let t = o.exec(e);
	if (!t || t[0] !== e) return null;
	try {
		let e = JSON.parse(t[1]);
		return typeof e == "string" && !/[\r\n]/.test(e) ? {
			label: e,
			state: t[2]
		} : null;
	} catch {
		return null;
	}
}
function c({ label: e, state: t }) {
	return `@Button(${JSON.stringify(e.replace(/[\r\n]/g, " "))}, "${t}")`;
}
e("button-partial", o, (e) => !!s(e[0]));
function l(e, t) {
	e.textContent = t.label;
	for (let n of a) n !== "default" && (e[n] = t.state === n);
	e.literal = !0;
}
//#endregion
//#region node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/css-tag.js
var u = globalThis, d = u.ShadowRoot && (u.ShadyCSS === void 0 || u.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, f = Symbol(), p = /* @__PURE__ */ new WeakMap(), m = class {
	constructor(e, t, n) {
		if (this._$cssResult$ = !0, n !== f) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, t = this.t;
		if (d && e === void 0) {
			let n = t !== void 0 && t.length === 1;
			n && (e = p.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), n && p.set(t, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, h = (e) => new m(typeof e == "string" ? e : e + "", void 0, f), g = (e, ...t) => new m(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, f), _ = (e, t) => {
	if (d) e.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let n of t) {
		let t = document.createElement("style"), r = u.litNonce;
		r !== void 0 && t.setAttribute("nonce", r), t.textContent = n.cssText, e.appendChild(t);
	}
}, v = d ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return h(t);
})(e) : e, { is: y, defineProperty: b, getOwnPropertyDescriptor: x, getOwnPropertyNames: S, getOwnPropertySymbols: C, getPrototypeOf: w } = Object, ee = globalThis, te = ee.trustedTypes, ne = te ? te.emptyScript : "", re = ee.reactiveElementPolyfillSupport, T = (e, t) => e, ie = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? ne : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, ae = (e, t) => !y(e, t), oe = {
	attribute: !0,
	type: String,
	converter: ie,
	reflect: !1,
	useDefault: !1,
	hasChanged: ae
};
Symbol.metadata ??= Symbol("metadata"), ee.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var E = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = oe) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && b(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = x(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? oe;
	}
	static _$Ei() {
		if (this.hasOwnProperty(T("elementProperties"))) return;
		let e = w(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(T("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(T("properties"))) {
			let e = this.properties, t = [...S(e), ...C(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(1 / 0).reverse());
			for (let e of n) t.unshift(v(e));
		} else e !== void 0 && t.push(v(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
	}
	addController(e) {
		(this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this._$EO?.delete(e);
	}
	_$E_() {
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return _(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? ie : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? ie : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? ae)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
	}
	_$EM() {
		this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
	}
	get updateComplete() {
		return this.getUpdateComplete();
	}
	getUpdateComplete() {
		return this._$ES;
	}
	shouldUpdate(e) {
		return !0;
	}
	update(e) {
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
E.elementStyles = [], E.shadowRootOptions = { mode: "open" }, E[T("elementProperties")] = /* @__PURE__ */ new Map(), E[T("finalized")] = /* @__PURE__ */ new Map(), re?.({ ReactiveElement: E }), (ee.reactiveElementVersions ??= []).push("2.1.2");
//#endregion
//#region node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/lit-html.js
var se = globalThis, ce = (e) => e, le = se.trustedTypes, ue = le ? le.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, de = "$lit$", D = `lit$${Math.random().toFixed(9).slice(2)}$`, fe = "?" + D, pe = `<${fe}>`, O = document, k = () => O.createComment(""), A = (e) => e === null || typeof e != "object" && typeof e != "function", me = Array.isArray, he = (e) => me(e) || typeof e?.[Symbol.iterator] == "function", ge = "[ 	\n\f\r]", _e = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ve = /-->/g, ye = />/g, j = RegExp(`>|${ge}(?:([^\\s"'>=/]+)(${ge}*=${ge}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), be = /'/g, xe = /"/g, Se = /^(?:script|style|textarea|title)$/i, M = ((e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}))(1), N = Symbol.for("lit-noChange"), P = Symbol.for("lit-nothing"), Ce = /* @__PURE__ */ new WeakMap(), F = O.createTreeWalker(O, 129);
function we(e, t) {
	if (!me(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return ue === void 0 ? t : ue.createHTML(t);
}
var Te = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = _e;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === _e ? c[1] === "!--" ? o = ve : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = j) : (Se.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = j) : o = ye : o === j ? c[0] === ">" ? (o = i ?? _e, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? j : c[3] === "\"" ? xe : be) : o === xe || o === be ? o = j : o === ve || o === ye ? o = _e : (o = j, i = void 0);
		let d = o === j && e[t + 1].startsWith("/>") ? " " : "";
		a += o === _e ? n + pe : l >= 0 ? (r.push(s), n.slice(0, l) + de + n.slice(l) + D + d) : n + D + (l === -2 ? t : d);
	}
	return [we(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, Ee = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = Te(t, n);
		if (this.el = e.createElement(l, r), F.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = F.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(de)) {
					let t = u[o++], n = i.getAttribute(e).split(D), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? ke : r[1] === "?" ? Ae : r[1] === "@" ? je : L
					}), i.removeAttribute(e);
				} else e.startsWith(D) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (Se.test(i.tagName)) {
					let e = i.textContent.split(D), t = e.length - 1;
					if (t > 0) {
						i.textContent = le ? le.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], k()), F.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], k());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === fe) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(D, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += D.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = O.createElement("template");
		return n.innerHTML = e, n;
	}
};
function I(e, t, n = e, r) {
	if (t === N) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = A(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = I(e, i._$AS(e, t.values), i, r)), t;
}
var De = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? O).importNode(t, !0);
		F.currentNode = r;
		let i = F.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new Oe(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Me(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = F.nextNode(), a++);
		}
		return F.currentNode = O, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, Oe = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = P, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = I(this, e, t), A(e) ? e === P || e == null || e === "" ? (this._$AH !== P && this._$AR(), this._$AH = P) : e !== this._$AH && e !== N && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? he(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== P && A(this._$AH) ? this._$AA.nextSibling.data = e : this.T(O.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = Ee.createElement(we(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new De(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = Ce.get(e.strings);
		return t === void 0 && Ce.set(e.strings, t = new Ee(e)), t;
	}
	k(t) {
		me(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(k()), this.O(k()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = ce(e).nextSibling;
			ce(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, L = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = P, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = P;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = I(this, e, t, 0), a = !A(e) || e !== this._$AH && e !== N, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = I(this, r[n + o], t, o), s === N && (s = this._$AH[o]), a ||= !A(s) || s !== this._$AH[o], s === P ? e = P : e !== P && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === P ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, ke = class extends L {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === P ? void 0 : e;
	}
}, Ae = class extends L {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== P);
	}
}, je = class extends L {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = I(this, e, t, 0) ?? P) === N) return;
		let n = this._$AH, r = e === P && n !== P || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== P && (n === P || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Me = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		I(this, e);
	}
}, Ne = {
	M: de,
	P: D,
	A: fe,
	C: 1,
	L: Te,
	R: De,
	D: he,
	V: I,
	I: Oe,
	H: L,
	N: Ae,
	U: je,
	B: ke,
	F: Me
}, Pe = se.litHtmlPolyfillSupport;
Pe?.(Ee, Oe), (se.litHtmlVersions ??= []).push("3.3.3");
var Fe = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new Oe(t.insertBefore(k(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Ie = globalThis, R = class extends E {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Fe(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return N;
	}
};
R._$litElement$ = !0, R.finalized = !0, Ie.litElementHydrateSupport?.({ LitElement: R });
var Le = Ie.litElementPolyfillSupport;
Le?.({ LitElement: R }), (Ie.litElementVersions ??= []).push("4.2.2");
//#endregion
//#region node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/directives/if-defined.js
var z = (e) => e ?? P, B = [
	"da",
	"de",
	"en",
	"es",
	"fi",
	"fr",
	"is",
	"it",
	"ja",
	"ko",
	"nb",
	"nn",
	"no",
	"pt",
	"pt-BR",
	"sv",
	"zh"
], Re = {
	da: {
		code: "da",
		label: "Danish",
		nativeLabel: "Dansk",
		aliases: ["da-dk"]
	},
	de: {
		code: "de",
		label: "German",
		nativeLabel: "Deutsch",
		aliases: [
			"de-de",
			"de-at",
			"de-ch"
		]
	},
	en: {
		code: "en",
		label: "English",
		nativeLabel: "English",
		aliases: [
			"en-us",
			"en-gb",
			"en-ca",
			"en-au",
			"en-nz",
			"en-ie"
		]
	},
	es: {
		code: "es",
		label: "Spanish",
		nativeLabel: "Español",
		aliases: [
			"es-es",
			"es-mx",
			"es-ar",
			"es-cl",
			"es-co"
		]
	},
	fi: {
		code: "fi",
		label: "Finnish",
		nativeLabel: "Suomi",
		aliases: ["fi-fi"]
	},
	fr: {
		code: "fr",
		label: "French",
		nativeLabel: "Français",
		aliases: [
			"fr-fr",
			"fr-ca",
			"fr-be",
			"fr-ch"
		]
	},
	is: {
		code: "is",
		label: "Icelandic",
		nativeLabel: "Íslenska",
		aliases: ["is-is"]
	},
	it: {
		code: "it",
		label: "Italian",
		nativeLabel: "Italiano",
		aliases: ["it-it", "it-ch"]
	},
	ja: {
		code: "ja",
		label: "Japanese",
		nativeLabel: "日本語",
		aliases: ["ja-jp"]
	},
	ko: {
		code: "ko",
		label: "Korean",
		nativeLabel: "한국어",
		aliases: ["ko-kr"]
	},
	nb: {
		code: "nb",
		label: "Norwegian Bokmål",
		nativeLabel: "Norsk bokmål",
		aliases: ["nb-no"]
	},
	nn: {
		code: "nn",
		label: "Norwegian Nynorsk",
		nativeLabel: "Norsk nynorsk",
		aliases: ["nn-no"]
	},
	no: {
		code: "no",
		label: "Norwegian",
		nativeLabel: "Norsk",
		aliases: ["no-no"]
	},
	pt: {
		code: "pt",
		label: "Portuguese",
		nativeLabel: "Português",
		aliases: ["pt-pt"]
	},
	"pt-BR": {
		code: "pt-BR",
		label: "Brazilian Portuguese",
		nativeLabel: "Português (Brasil)",
		aliases: ["pt-br"]
	},
	sv: {
		code: "sv",
		label: "Swedish",
		nativeLabel: "Svenska",
		aliases: ["sv-se", "sv-fi"]
	},
	zh: {
		code: "zh",
		label: "Chinese",
		nativeLabel: "中文",
		aliases: [
			"zh-cn",
			"zh-tw",
			"zh-hk",
			"zh-sg",
			"zh-hans",
			"zh-hant"
		]
	}
}, ze = {
	nb: ["no", "nn"],
	no: ["nb", "nn"],
	nn: ["nb", "no"],
	pt: ["pt-BR"],
	"pt-BR": ["pt"]
}, V = /* @__PURE__ */ new Map();
for (let e of B) {
	V.set(e.toLowerCase(), e);
	for (let t of Re[e].aliases) V.set(t, e);
}
var Be = new Map(B.map((e, t) => [e, t]));
function Ve(e) {
	return typeof e == "string" && Be.has(e);
}
function He(e) {
	return e.split("-")[0] ?? "";
}
function Ue(e, t) {
	return t.has(e) ? e : ze[e]?.find((e) => t.has(e)) ?? null;
}
function We(e, t = "en", n = B) {
	let r = new Set(n), i = String(e ?? "").split(",").map((e) => e.split(";")[0]?.trim().toLowerCase().replace(/_/g, "-") ?? "").filter(Boolean);
	for (let e of i) {
		let t = V.get(e), n = t ? Ue(t, r) : null;
		if (n) return n;
		let i = V.get(He(e)), a = i ? Ue(i, r) : null;
		if (a) return a;
	}
	return t;
}
function Ge(e) {
	let t = [], n = (e) => {
		e && !t.includes(e) && t.push(e);
	};
	n(e);
	let r = String(e ?? "").toLowerCase().replace(/_/g, "-"), i = V.get(r);
	n(i), n(He(r));
	let a = i ?? V.get(He(r));
	for (let e of a ? ze[a] ?? [] : []) n(e);
	return t;
}
//#endregion
//#region src/vendor/ds1/0-face/language-routing.ts
var Ke = {};
function qe(e) {
	Ke = {
		...Ke,
		...e
	};
}
function Je(e) {
	let t = {
		...Ke,
		...e
	};
	return {
		languages: t.languages?.length ? t.languages : B,
		defaultLanguage: t.defaultLanguage || "en",
		prefixDefaultLanguage: t.prefixDefaultLanguage ?? !1
	};
}
function Ye(e) {
	return String(e ?? "").toLowerCase().replace(/_/g, "-");
}
function Xe(e, t = Je().languages) {
	let n = Ye(e);
	return n ? t.find((e) => Ye(e) === n) ?? null : null;
}
function Ze(e) {
	let t = e.search(/[?#]/);
	return t === -1 ? [e, ""] : [e.slice(0, t), e.slice(t)];
}
function Qe(e, t) {
	let { languages: n } = Je(t), [r, i] = Ze(e || "/"), a = r.startsWith("/") ? r : `/${r}`, o = a.split("/")[1] ?? "", s = Xe(o, n);
	return s ? {
		language: s,
		restPath: `${a.slice(o.length + 1) || "/"}${i}`
	} : {
		language: null,
		restPath: `${a}${i}`
	};
}
//#endregion
//#region src/vendor/ds1/0-face/translations-format.ts
var $e = "en", et = /\{\{\s*([\w.-]+)\s*\}\}|\{([\w.-]+)\}/g;
function tt(e, t) {
	return t ? e.replace(et, (e, n, r) => {
		let i = n ?? r;
		return Object.prototype.hasOwnProperty.call(t, i) ? String(t[i]) : e;
	}) : e;
}
function nt(e, t, n, r) {
	let i = Ge(t);
	i.includes($e) || i.push($e);
	for (let t of i) for (let i of n) {
		let n = i?.[t]?.[e];
		if (n) return {
			text: tt(n, r),
			language: t
		};
	}
	return {
		text: tt(e, r),
		language: null
	};
}
function rt(e) {
	return !!e && typeof e == "object" && !Array.isArray(e);
}
function it(e, t) {
	if (!rt(t)) return null;
	let n = t[e];
	if (rt(n)) return t;
	let r = Object.values(t);
	return r.length > 0 && r.every((e) => typeof e == "string") ? { [e]: t } : r.length > 0 && r.every(rt) ? t : null;
}
//#endregion
//#region src/vendor/ds1/0-face/translations/da.json
var at, ot, st = r((() => {
	at = {
		Save: "Gem",
		Cancel: "Annuller",
		Delete: "Slet",
		Close: "Luk",
		Back: "Tilbage",
		Next: "Næste",
		Done: "Færdig",
		Continue: "Fortsæt",
		Search: "Søg",
		Edit: "Rediger",
		Yes: "Ja",
		No: "Nej",
		"Sign in": "Log ind",
		"Sign out": "Log ud",
		Email: "E-mail",
		Password: "Adgangskode",
		"Nothing here yet": "Intet her endnu",
		Loading: "Indlæser",
		"{value} of {max}": "{value} af {max}",
		"{value} of {max}, over by {over}": "{value} af {max}, {over} for meget",
		Failed: "Mislykkedes",
		Today: "I dag",
		Yesterday: "I går",
		Tomorrow: "I morgen",
		Settings: "Indstillinger",
		Language: "Sprog",
		Theme: "Tema",
		Light: "Lys",
		Dark: "Mørk",
		System: "System",
		Shape: "Form",
		Square: "Firkantet",
		Rounded: "Afrundet",
		Circular: "Cirkulær",
		Note: "Note",
		Page: "Side",
		Red: "Rød",
		Orange: "Orange",
		Yellow: "Gul",
		"Apple green": "Æblegrøn",
		Green: "Grøn",
		"Light blue": "Lyseblå",
		Blue: "Blå",
		Pink: "Lyserød",
		"This is a beta version": "Dette er en betaversion",
		"Report issue": "Rapportér et problem",
		"Issue report": "Problemrapport",
		"Describe the issue:": "Beskriv problemet:",
		"App version:": "App-version:",
		Danish: "Dansk",
		German: "Tysk",
		English: "Engelsk",
		Spanish: "Spansk",
		Finnish: "Finsk",
		French: "Fransk",
		Icelandic: "Islandsk",
		Italian: "Italiensk",
		Japanese: "Japansk",
		Korean: "Koreansk",
		"Norwegian Bokmål": "Norsk bokmål",
		"Norwegian Nynorsk": "Nynorsk",
		Norwegian: "Norsk",
		Portuguese: "Portugisisk",
		"Brazilian Portuguese": "Brasiliansk portugisisk",
		Swedish: "Svensk",
		Chinese: "Kinesisk",
		"Show password": "Vis adgangskode",
		"Hide password": "Skjul adgangskode",
		OK: "OK",
		Copied: "Kopieret",
		"Could not copy": "Kunne ikke kopiere",
		Notifications: "Notifikationer",
		"Try again": "Prøv igen",
		Undo: "Fortryd",
		Redo: "Gentag",
		Copy: "Kopiér",
		"Copy link": "Kopiér link",
		Remove: "Fjern",
		Rename: "Omdøb",
		Duplicate: "Dupliker",
		Download: "Hent",
		Refresh: "Opdater",
		Open: "Åbn",
		Send: "Send",
		Clear: "Ryd",
		"This field is required": "Dette felt skal udfyldes",
		Saved: "Gemt",
		"Saving…": "Gemmer…",
		Untitled: "Uden titel",
		Account: "Konto",
		Carousel: "Karrusel",
		Slide: "Dias",
		Slides: "Dias",
		"Slide {index}": "Dias {index}",
		"{index} of {count}": "{index} af {count}",
		"Previous slide": "Forrige dias",
		"Next slide": "Næste dias",
		"Move row {index}": "Flyt række {index}",
		"Row {from} moved to {to}": "Række {from} flyttet til {to}",
		Pause: "Pause",
		Play: "Afspil",
		Menu: "Menu",
		Contents: "Indhold",
		"key.ctrl": "Ctrl",
		"key.shift": "Skift",
		"key.alt": "Alt",
		"key.enter": "Enter",
		"key.escape": "Esc",
		"key.tab": "Tab",
		"key.space": "Mellemrum",
		"key.backspace": "Backspace",
		"key.delete": "Delete",
		"key.home": "Home",
		"key.end": "End",
		"key.pageup": "Page Up",
		"key.pagedown": "Page Down",
		"Previous month": "Forrige måned",
		"Next month": "Næste måned",
		"Previous year": "Forrige år",
		"Next year": "Næste år",
		"Earlier years": "Tidligere år",
		"Later years": "Senere år",
		"Choose a month and year": "Vælg måned og år",
		"Choose a date": "Vælg en dato",
		Date: "Dato",
		"W{week}": "U{week}",
		Total: "I alt",
		"End date": "Slutdato",
		"Include time": "Medtag klokkeslæt",
		Time: "Klokkeslæt",
		Day: "Dag",
		Week: "Uge",
		Month: "Måned",
		Swimlane: "Baner",
		View: "Visning"
	}, ot = { da: at };
})), ct, lt, ut = r((() => {
	ct = {
		Save: "Speichern",
		Cancel: "Abbrechen",
		Delete: "Löschen",
		Close: "Schließen",
		Back: "Zurück",
		Next: "Weiter",
		Done: "Fertig",
		Continue: "Weiter",
		Search: "Suchen",
		Edit: "Bearbeiten",
		Yes: "Ja",
		No: "Nein",
		"Sign in": "Anmelden",
		"Sign out": "Abmelden",
		Email: "E-Mail",
		Password: "Passwort",
		"Nothing here yet": "Hier ist noch nichts",
		Loading: "Wird geladen",
		"{value} of {max}": "{value} von {max}",
		"{value} of {max}, over by {over}": "{value} von {max}, {over} darüber",
		Failed: "Fehlgeschlagen",
		Today: "Heute",
		Yesterday: "Gestern",
		Tomorrow: "Morgen",
		Settings: "Einstellungen",
		Language: "Sprache",
		Theme: "Thema",
		Light: "Hell",
		Dark: "Dunkel",
		System: "System",
		Shape: "Form",
		Square: "Eckig",
		Rounded: "Abgerundet",
		Circular: "Rund",
		Note: "Notiz",
		Page: "Seite",
		Red: "Rot",
		Orange: "Orange",
		Yellow: "Gelb",
		"Apple green": "Apfelgrün",
		Green: "Grün",
		"Light blue": "Hellblau",
		Blue: "Blau",
		Pink: "Rosa",
		"This is a beta version": "Dies ist eine Betaversion",
		"Report issue": "Problem melden",
		"Issue report": "Problembericht",
		"Describe the issue:": "Beschreiben Sie das Problem:",
		"App version:": "App-Version:",
		Danish: "Dänisch",
		German: "Deutsch",
		English: "Englisch",
		Spanish: "Spanisch",
		Finnish: "Finnisch",
		French: "Französisch",
		Icelandic: "Isländisch",
		Italian: "Italienisch",
		Japanese: "Japanisch",
		Korean: "Koreanisch",
		"Norwegian Bokmål": "Norwegisch (Bokmål)",
		"Norwegian Nynorsk": "Norwegisch (Nynorsk)",
		Norwegian: "Norwegisch",
		Portuguese: "Portugiesisch",
		"Brazilian Portuguese": "Brasilianisches Portugiesisch",
		Swedish: "Schwedisch",
		Chinese: "Chinesisch",
		"Show password": "Passwort anzeigen",
		"Hide password": "Passwort verbergen",
		OK: "OK",
		Copied: "Kopiert",
		"Could not copy": "Kopieren fehlgeschlagen",
		Notifications: "Mitteilungen",
		"Try again": "Erneut versuchen",
		Undo: "Widerrufen",
		Redo: "Wiederholen",
		Copy: "Kopieren",
		"Copy link": "Link kopieren",
		Remove: "Entfernen",
		Rename: "Umbenennen",
		Duplicate: "Duplizieren",
		Download: "Herunterladen",
		Refresh: "Aktualisieren",
		Open: "Öffnen",
		Send: "Senden",
		Clear: "Leeren",
		"This field is required": "Dieses Feld ist erforderlich",
		Saved: "Gespeichert",
		"Saving…": "Wird gespeichert …",
		Untitled: "Ohne Titel",
		Account: "Konto",
		Carousel: "Karussell",
		Slide: "Folie",
		Slides: "Folien",
		"Slide {index}": "Folie {index}",
		"{index} of {count}": "{index} von {count}",
		"Previous slide": "Vorherige Folie",
		"Next slide": "Nächste Folie",
		"Move row {index}": "Zeile {index} verschieben",
		"Row {from} moved to {to}": "Zeile {from} nach {to} verschoben",
		Pause: "Pause",
		Play: "Abspielen",
		Menu: "Menü",
		Contents: "Inhalt",
		"key.ctrl": "Strg",
		"key.shift": "Umschalt",
		"key.alt": "Alt",
		"key.enter": "Eingabe",
		"key.escape": "Esc",
		"key.tab": "Tab",
		"key.space": "Leertaste",
		"key.backspace": "Rücktaste",
		"key.delete": "Entf",
		"key.home": "Pos1",
		"key.end": "Ende",
		"key.pageup": "Bild auf",
		"key.pagedown": "Bild ab",
		"Previous month": "Vorheriger Monat",
		"Next month": "Nächster Monat",
		"Previous year": "Vorheriges Jahr",
		"Next year": "Nächstes Jahr",
		"Earlier years": "Frühere Jahre",
		"Later years": "Spätere Jahre",
		"Choose a month and year": "Monat und Jahr wählen",
		"Choose a date": "Datum wählen",
		Date: "Datum",
		"W{week}": "KW{week}",
		Total: "Gesamt",
		"End date": "Enddatum",
		"Include time": "Uhrzeit hinzufügen",
		Time: "Uhrzeit",
		Day: "Tag",
		Week: "Woche",
		Month: "Monat",
		Swimlane: "Bahnen",
		View: "Ansicht"
	}, lt = { de: ct };
})), dt, ft, pt = r((() => {
	dt = {
		Save: "Save",
		Cancel: "Cancel",
		Delete: "Delete",
		Close: "Close",
		Back: "Back",
		Next: "Next",
		Done: "Done",
		Continue: "Continue",
		Search: "Search",
		Edit: "Edit",
		Yes: "Yes",
		No: "No",
		"Sign in": "Sign in",
		"Sign out": "Sign out",
		Email: "Email",
		Password: "Password",
		"Nothing here yet": "Nothing here yet",
		Loading: "Loading",
		"{value} of {max}": "{value} of {max}",
		"{value} of {max}, over by {over}": "{value} of {max}, over by {over}",
		Failed: "Failed",
		Today: "Today",
		Yesterday: "Yesterday",
		Tomorrow: "Tomorrow",
		Settings: "Settings",
		Language: "Language",
		Theme: "Theme",
		Light: "Light",
		Dark: "Dark",
		System: "System",
		Shape: "Shape",
		Square: "Square",
		Rounded: "Rounded",
		Circular: "Circular",
		Note: "Note",
		Page: "Page",
		Red: "Red",
		Orange: "Orange",
		Yellow: "Yellow",
		"Apple green": "Apple green",
		Green: "Green",
		"Light blue": "Light blue",
		Blue: "Blue",
		Pink: "Pink",
		"This is a beta version": "This is a beta version",
		"Report issue": "Report issue",
		"Issue report": "Issue report",
		"Describe the issue:": "Describe the issue:",
		"App version:": "App version:",
		Danish: "Danish",
		German: "German",
		English: "English",
		Spanish: "Spanish",
		Finnish: "Finnish",
		French: "French",
		Icelandic: "Icelandic",
		Italian: "Italian",
		Japanese: "Japanese",
		Korean: "Korean",
		"Norwegian Bokmål": "Norwegian Bokmål",
		"Norwegian Nynorsk": "Norwegian Nynorsk",
		Norwegian: "Norwegian",
		Portuguese: "Portuguese",
		"Brazilian Portuguese": "Brazilian Portuguese",
		Swedish: "Swedish",
		Chinese: "Chinese",
		"Show password": "Show password",
		"Hide password": "Hide password",
		OK: "OK",
		Copied: "Copied",
		"Could not copy": "Could not copy",
		Notifications: "Notifications",
		"Try again": "Try again",
		Undo: "Undo",
		Redo: "Redo",
		Copy: "Copy",
		"Copy link": "Copy link",
		Remove: "Remove",
		Rename: "Rename",
		Duplicate: "Duplicate",
		Download: "Download",
		Refresh: "Refresh",
		Open: "Open",
		Send: "Send",
		Clear: "Clear",
		"This field is required": "This field is required",
		Saved: "Saved",
		"Saving…": "Saving…",
		Untitled: "Untitled",
		Account: "Account",
		Carousel: "Carousel",
		Slide: "Slide",
		Slides: "Slides",
		"Slide {index}": "Slide {index}",
		"{index} of {count}": "{index} of {count}",
		"Previous slide": "Previous slide",
		"Next slide": "Next slide",
		"Move row {index}": "Move row {index}",
		"Row {from} moved to {to}": "Row {from} moved to {to}",
		Pause: "Pause",
		Play: "Play",
		Menu: "Menu",
		Contents: "Contents",
		"key.ctrl": "Ctrl",
		"key.shift": "Shift",
		"key.alt": "Alt",
		"key.enter": "Enter",
		"key.escape": "Esc",
		"key.tab": "Tab",
		"key.space": "Space",
		"key.backspace": "Backspace",
		"key.delete": "Del",
		"key.home": "Home",
		"key.end": "End",
		"key.pageup": "PgUp",
		"key.pagedown": "PgDn",
		"Previous month": "Previous month",
		"Next month": "Next month",
		"Previous year": "Previous year",
		"Next year": "Next year",
		"Earlier years": "Earlier years",
		"Later years": "Later years",
		"Choose a month and year": "Choose a month and year",
		"Choose a date": "Choose a date",
		Date: "Date",
		"W{week}": "W{week}",
		Total: "Total",
		"End date": "End date",
		"Include time": "Include time",
		Time: "Time",
		Day: "Day",
		Week: "Week",
		Month: "Month",
		Swimlane: "Swimlane",
		View: "View"
	}, ft = { en: dt };
})), mt, ht, gt = r((() => {
	mt = {
		Save: "Guardar",
		Cancel: "Cancelar",
		Delete: "Eliminar",
		Close: "Cerrar",
		Back: "Atrás",
		Next: "Siguiente",
		Done: "Listo",
		Continue: "Continuar",
		Search: "Buscar",
		Edit: "Editar",
		Yes: "Sí",
		No: "No",
		"Sign in": "Iniciar sesión",
		"Sign out": "Cerrar sesión",
		Email: "Correo electrónico",
		Password: "Contraseña",
		"Nothing here yet": "Aún no hay nada aquí",
		Loading: "Cargando",
		"{value} of {max}": "{value} de {max}",
		"{value} of {max}, over by {over}": "{value} de {max}, {over} de más",
		Failed: "Fallido",
		Today: "Hoy",
		Yesterday: "Ayer",
		Tomorrow: "Mañana",
		Settings: "Ajustes",
		Language: "Idioma",
		Theme: "Tema",
		Light: "Claro",
		Dark: "Oscuro",
		System: "Sistema",
		Shape: "Forma",
		Square: "Cuadrada",
		Rounded: "Redondeada",
		Circular: "Circular",
		Note: "Nota",
		Page: "Página",
		Red: "Rojo",
		Orange: "Naranja",
		Yellow: "Amarillo",
		"Apple green": "Verde manzana",
		Green: "Verde",
		"Light blue": "Azul claro",
		Blue: "Azul",
		Pink: "Rosa",
		"This is a beta version": "Esta es una versión beta",
		"Report issue": "Informar de un problema",
		"Issue report": "Informe de problema",
		"Describe the issue:": "Describe el problema:",
		"App version:": "Versión de la app:",
		Danish: "Danés",
		German: "Alemán",
		English: "Inglés",
		Spanish: "Español",
		Finnish: "Finés",
		French: "Francés",
		Icelandic: "Islandés",
		Italian: "Italiano",
		Japanese: "Japonés",
		Korean: "Coreano",
		"Norwegian Bokmål": "Noruego bokmal",
		"Norwegian Nynorsk": "Noruego nynorsk",
		Norwegian: "Noruego",
		Portuguese: "Portugués",
		"Brazilian Portuguese": "Portugués de Brasil",
		Swedish: "Sueco",
		Chinese: "Chino",
		"Show password": "Mostrar contraseña",
		"Hide password": "Ocultar contraseña",
		OK: "Aceptar",
		Copied: "Copiado",
		"Could not copy": "No se pudo copiar",
		Notifications: "Notificaciones",
		"Try again": "Reintentar",
		Undo: "Deshacer",
		Redo: "Rehacer",
		Copy: "Copiar",
		"Copy link": "Copiar enlace",
		Remove: "Quitar",
		Rename: "Renombrar",
		Duplicate: "Duplicar",
		Download: "Descargar",
		Refresh: "Actualizar",
		Open: "Abrir",
		Send: "Enviar",
		Clear: "Borrar",
		"This field is required": "Este campo es obligatorio",
		Saved: "Guardado",
		"Saving…": "Guardando…",
		Untitled: "Sin título",
		Account: "Cuenta",
		Carousel: "Carrusel",
		Slide: "Diapositiva",
		Slides: "Diapositivas",
		"Slide {index}": "Diapositiva {index}",
		"{index} of {count}": "{index} de {count}",
		"Previous slide": "Diapositiva anterior",
		"Next slide": "Diapositiva siguiente",
		"Move row {index}": "Mover fila {index}",
		"Row {from} moved to {to}": "Fila {from} movida a {to}",
		Pause: "Pausar",
		Play: "Reproducir",
		Menu: "Menú",
		Contents: "Contenido",
		"key.ctrl": "Ctrl",
		"key.shift": "Mayús",
		"key.alt": "Alt",
		"key.enter": "Entrar",
		"key.escape": "Esc",
		"key.tab": "Tab",
		"key.space": "Espacio",
		"key.backspace": "Retroceso",
		"key.delete": "Supr",
		"key.home": "Inicio",
		"key.end": "Fin",
		"key.pageup": "Re Pág",
		"key.pagedown": "Av Pág",
		"Previous month": "Mes anterior",
		"Next month": "Mes siguiente",
		"Previous year": "Año anterior",
		"Next year": "Año siguiente",
		"Earlier years": "Años anteriores",
		"Later years": "Años siguientes",
		"Choose a month and year": "Elegir mes y año",
		"Choose a date": "Elegir una fecha",
		Date: "Fecha",
		"W{week}": "S{week}",
		Total: "Total",
		"End date": "Fecha de fin",
		"Include time": "Incluir hora",
		Time: "Hora",
		Day: "Día",
		Week: "Semana",
		Month: "Mes",
		Swimlane: "Carriles",
		View: "Vista"
	}, ht = { es: mt };
})), _t, vt, yt = r((() => {
	_t = {
		Save: "Tallenna",
		Cancel: "Peruuta",
		Delete: "Poista",
		Close: "Sulje",
		Back: "Takaisin",
		Next: "Seuraava",
		Done: "Valmis",
		Continue: "Jatka",
		Search: "Hae",
		Edit: "Muokkaa",
		Yes: "Kyllä",
		No: "Ei",
		"Sign in": "Kirjaudu sisään",
		"Sign out": "Kirjaudu ulos",
		Email: "Sähköposti",
		Password: "Salasana",
		"Nothing here yet": "Täällä ei ole vielä mitään",
		Loading: "Ladataan",
		"{value} of {max}": "{value}/{max}",
		"{value} of {max}, over by {over}": "{value}/{max}, {over} yli",
		Failed: "Epäonnistui",
		Today: "Tänään",
		Yesterday: "Eilen",
		Tomorrow: "Huomenna",
		Settings: "Asetukset",
		Language: "Kieli",
		Theme: "Teema",
		Light: "Vaalea",
		Dark: "Tumma",
		System: "Järjestelmä",
		Shape: "Muoto",
		Square: "Kulmikas",
		Rounded: "Pyöristetty",
		Circular: "Pyöreä",
		Note: "Muistiinpano",
		Page: "Sivu",
		Red: "Punainen",
		Orange: "Oranssi",
		Yellow: "Keltainen",
		"Apple green": "Omenanvihreä",
		Green: "Vihreä",
		"Light blue": "Vaaleansininen",
		Blue: "Sininen",
		Pink: "Vaaleanpunainen",
		"This is a beta version": "Tämä on beetaversio",
		"Report issue": "Ilmoita ongelmasta",
		"Issue report": "Ongelmaraportti",
		"Describe the issue:": "Kuvaile ongelma:",
		"App version:": "Sovelluksen versio:",
		Danish: "Tanska",
		German: "Saksa",
		English: "Englanti",
		Spanish: "Espanja",
		Finnish: "Suomi",
		French: "Ranska",
		Icelandic: "Islanti",
		Italian: "Italia",
		Japanese: "Japani",
		Korean: "Korea",
		"Norwegian Bokmål": "Norjan bokmål",
		"Norwegian Nynorsk": "Norjan nynorsk",
		Norwegian: "Norja",
		Portuguese: "Portugali",
		"Brazilian Portuguese": "Brasilianportugali",
		Swedish: "Ruotsi",
		Chinese: "Kiina",
		"Show password": "Näytä salasana",
		"Hide password": "Piilota salasana",
		OK: "OK",
		Copied: "Kopioitu",
		"Could not copy": "Kopiointi epäonnistui",
		Notifications: "Ilmoitukset",
		"Try again": "Yritä uudelleen",
		Undo: "Kumoa",
		Redo: "Tee uudelleen",
		Copy: "Kopioi",
		"Copy link": "Kopioi linkki",
		Remove: "Poista",
		Rename: "Nimeä uudelleen",
		Duplicate: "Monista",
		Download: "Lataa",
		Refresh: "Päivitä",
		Open: "Avaa",
		Send: "Lähetä",
		Clear: "Tyhjennä",
		"This field is required": "Tämä kenttä on pakollinen",
		Saved: "Tallennettu",
		"Saving…": "Tallennetaan…",
		Untitled: "Nimetön",
		Account: "Tili",
		Carousel: "Karuselli",
		Slide: "Dia",
		Slides: "Diat",
		"Slide {index}": "Dia {index}",
		"{index} of {count}": "{index}/{count}",
		"Previous slide": "Edellinen dia",
		"Next slide": "Seuraava dia",
		"Move row {index}": "Siirrä riviä {index}",
		"Row {from} moved to {to}": "Rivi {from} siirretty kohtaan {to}",
		Pause: "Tauko",
		Play: "Toista",
		Menu: "Valikko",
		Contents: "Sisällys",
		"key.ctrl": "Ctrl",
		"key.shift": "Vaihto",
		"key.alt": "Alt",
		"key.enter": "Enter",
		"key.escape": "Esc",
		"key.tab": "Sarkain",
		"key.space": "Välilyönti",
		"key.backspace": "Askelpalautin",
		"key.delete": "Delete",
		"key.home": "Home",
		"key.end": "End",
		"key.pageup": "Page Up",
		"key.pagedown": "Page Down",
		"Previous month": "Edellinen kuukausi",
		"Next month": "Seuraava kuukausi",
		"Previous year": "Edellinen vuosi",
		"Next year": "Seuraava vuosi",
		"Earlier years": "Aiemmat vuodet",
		"Later years": "Myöhemmät vuodet",
		"Choose a month and year": "Valitse kuukausi ja vuosi",
		"Choose a date": "Valitse päivämäärä",
		Date: "Päivämäärä",
		"W{week}": "Vk{week}",
		Total: "Yhteensä",
		"End date": "Päättymispäivä",
		"Include time": "Sisällytä kellonaika",
		Time: "Kellonaika",
		Day: "Päivä",
		Week: "Viikko",
		Month: "Kuukausi",
		Swimlane: "Kaistat",
		View: "Näkymä"
	}, vt = { fi: _t };
})), bt, xt, St = r((() => {
	bt = {
		Save: "Enregistrer",
		Cancel: "Annuler",
		Delete: "Supprimer",
		Close: "Fermer",
		Back: "Retour",
		Next: "Suivant",
		Done: "Terminé",
		Continue: "Continuer",
		Search: "Rechercher",
		Edit: "Modifier",
		Yes: "Oui",
		No: "Non",
		"Sign in": "Se connecter",
		"Sign out": "Se déconnecter",
		Email: "E-mail",
		Password: "Mot de passe",
		"Nothing here yet": "Rien ici pour l’instant",
		Loading: "Chargement",
		"{value} of {max}": "{value} sur {max}",
		"{value} of {max}, over by {over}": "{value} sur {max}, dépassé de {over}",
		Failed: "Échec",
		Today: "Aujourd’hui",
		Yesterday: "Hier",
		Tomorrow: "Demain",
		Settings: "Paramètres",
		Language: "Langue",
		Theme: "Thème",
		Light: "Clair",
		Dark: "Sombre",
		System: "Système",
		Shape: "Forme",
		Square: "Carrée",
		Rounded: "Arrondie",
		Circular: "Circulaire",
		Note: "Note",
		Page: "Page",
		Red: "Rouge",
		Orange: "Orange",
		Yellow: "Jaune",
		"Apple green": "Vert pomme",
		Green: "Vert",
		"Light blue": "Bleu clair",
		Blue: "Bleu",
		Pink: "Rose",
		"This is a beta version": "Ceci est une version bêta",
		"Report issue": "Signaler un problème",
		"Issue report": "Rapport de problème",
		"Describe the issue:": "Décrivez le problème :",
		"App version:": "Version de l’app :",
		Danish: "Danois",
		German: "Allemand",
		English: "Anglais",
		Spanish: "Espagnol",
		Finnish: "Finnois",
		French: "Français",
		Icelandic: "Islandais",
		Italian: "Italien",
		Japanese: "Japonais",
		Korean: "Coréen",
		"Norwegian Bokmål": "Norvégien bokmål",
		"Norwegian Nynorsk": "Norvégien nynorsk",
		Norwegian: "Norvégien",
		Portuguese: "Portugais",
		"Brazilian Portuguese": "Portugais brésilien",
		Swedish: "Suédois",
		Chinese: "Chinois",
		"Show password": "Afficher le mot de passe",
		"Hide password": "Masquer le mot de passe",
		OK: "OK",
		Copied: "Copié",
		"Could not copy": "Impossible de copier",
		Notifications: "Notifications",
		"Try again": "Réessayer",
		Undo: "Annuler",
		Redo: "Rétablir",
		Copy: "Copier",
		"Copy link": "Copier le lien",
		Remove: "Retirer",
		Rename: "Renommer",
		Duplicate: "Dupliquer",
		Download: "Télécharger",
		Refresh: "Actualiser",
		Open: "Ouvrir",
		Send: "Envoyer",
		Clear: "Effacer",
		"This field is required": "Ce champ est obligatoire",
		Saved: "Enregistré",
		"Saving…": "Enregistrement…",
		Untitled: "Sans titre",
		Account: "Compte",
		Carousel: "Carrousel",
		Slide: "Diapositive",
		Slides: "Diapositives",
		"Slide {index}": "Diapositive {index}",
		"{index} of {count}": "{index} sur {count}",
		"Previous slide": "Diapositive précédente",
		"Next slide": "Diapositive suivante",
		"Move row {index}": "Déplacer la ligne {index}",
		"Row {from} moved to {to}": "Ligne {from} déplacée en {to}",
		Pause: "Pause",
		Play: "Lecture",
		Menu: "Menu",
		Contents: "Sommaire",
		"key.ctrl": "Ctrl",
		"key.shift": "Maj",
		"key.alt": "Alt",
		"key.enter": "Entrée",
		"key.escape": "Échap",
		"key.tab": "Tab",
		"key.space": "Espace",
		"key.backspace": "Retour arrière",
		"key.delete": "Suppr",
		"key.home": "Origine",
		"key.end": "Fin",
		"key.pageup": "Page préc.",
		"key.pagedown": "Page suiv.",
		"Previous month": "Mois précédent",
		"Next month": "Mois suivant",
		"Previous year": "Année précédente",
		"Next year": "Année suivante",
		"Earlier years": "Années précédentes",
		"Later years": "Années suivantes",
		"Choose a month and year": "Choisir le mois et l’année",
		"Choose a date": "Choisir une date",
		Date: "Date",
		"W{week}": "S{week}",
		Total: "Total",
		"End date": "Date de fin",
		"Include time": "Inclure l’heure",
		Time: "Heure",
		Day: "Jour",
		Week: "Semaine",
		Month: "Mois",
		Swimlane: "Couloirs",
		View: "Vue"
	}, xt = { fr: bt };
})), Ct, wt, Tt = r((() => {
	Ct = {
		Save: "Vista",
		Cancel: "Hætta við",
		Delete: "Eyða",
		Close: "Loka",
		Back: "Til baka",
		Next: "Næsta",
		Done: "Lokið",
		Continue: "Halda áfram",
		Search: "Leita",
		Edit: "Breyta",
		Yes: "Já",
		No: "Nei",
		"Sign in": "Skrá inn",
		"Sign out": "Skrá út",
		Email: "Netfang",
		Password: "Lykilorð",
		"Nothing here yet": "Ekkert hér enn",
		Loading: "Hleður",
		"{value} of {max}": "{value} af {max}",
		"{value} of {max}, over by {over}": "{value} af {max}, {over} umfram",
		Failed: "Mistókst",
		Today: "Í dag",
		Yesterday: "Í gær",
		Tomorrow: "Á morgun",
		Settings: "Stillingar",
		Language: "Tungumál",
		Theme: "Þema",
		Light: "Ljóst",
		Dark: "Dökkt",
		System: "Kerfi",
		Shape: "Lögun",
		Square: "Ferhyrnt",
		Rounded: "Ávalt",
		Circular: "Hringlaga",
		Page: "Síða",
		Red: "Rauður",
		Orange: "Appelsínugulur",
		Yellow: "Gulur",
		Green: "Grænn",
		"Light blue": "Ljósblár",
		Blue: "Blár",
		Pink: "Bleikur",
		Danish: "Danska",
		German: "Þýska",
		English: "Enska",
		Spanish: "Spænska",
		Finnish: "Finnska",
		French: "Franska",
		Icelandic: "Íslenska",
		Italian: "Ítalska",
		Japanese: "Japanska",
		Korean: "Kóreska",
		"Norwegian Bokmål": "Norskt bókmál",
		"Norwegian Nynorsk": "Nýnorska",
		Norwegian: "Norska",
		Portuguese: "Portúgalska",
		"Brazilian Portuguese": "Brasílísk portúgalska",
		Swedish: "Sænska",
		Chinese: "Kínverska",
		"Show password": "Sýna lykilorð",
		"Hide password": "Fela lykilorð",
		OK: "Í lagi",
		Copied: "Afritað",
		"Could not copy": "Ekki tókst að afrita",
		Notifications: "Tilkynningar",
		"Try again": "Reyna aftur",
		Undo: "Afturkalla",
		Redo: "Endurgera",
		Copy: "Afrita",
		"Copy link": "Afrita tengil",
		Remove: "Fjarlægja",
		Rename: "Endurnefna",
		Duplicate: "Tvítaka",
		Download: "Sækja",
		Refresh: "Endurnýja",
		Open: "Opna",
		Send: "Senda",
		Clear: "Hreinsa",
		"This field is required": "Þennan reit þarf að fylla út",
		Saved: "Vistað",
		"Saving…": "Vistar…",
		Untitled: "Ónefnt",
		Account: "Aðgangur",
		Carousel: "Hringekja",
		Slide: "Glæra",
		Slides: "Glærur",
		"Slide {index}": "Glæra {index}",
		"{index} of {count}": "{index} af {count}",
		"Previous slide": "Fyrri glæra",
		"Next slide": "Næsta glæra",
		"Move row {index}": "Færa röð {index}",
		"Row {from} moved to {to}": "Röð {from} færð í {to}",
		Pause: "Gera hlé",
		Play: "Spila",
		Menu: "Valmynd",
		Contents: "Efnisyfirlit",
		"key.ctrl": "Ctrl",
		"key.shift": "Shift",
		"key.alt": "Alt",
		"key.enter": "Enter",
		"key.escape": "Esc",
		"key.tab": "Tab",
		"key.space": "Bilslá",
		"key.backspace": "Backspace",
		"key.delete": "Delete",
		"key.home": "Home",
		"key.end": "End",
		"key.pageup": "Page Up",
		"key.pagedown": "Page Down",
		"Previous month": "Fyrri mánuður",
		"Next month": "Næsti mánuður",
		"Previous year": "Fyrra ár",
		"Next year": "Næsta ár",
		"Earlier years": "Fyrri ár",
		"Later years": "Síðari ár",
		"Choose a month and year": "Velja mánuð og ár",
		"Choose a date": "Veldu dagsetningu",
		Date: "Dagsetning",
		"W{week}": "V{week}",
		Total: "Samtals",
		"End date": "Lokadagur",
		"Include time": "Taka með tíma",
		Time: "Tími",
		Day: "Dagur",
		Week: "Vika",
		Month: "Mánuður",
		Swimlane: "Brautir",
		View: "Yfirlit"
	}, wt = { is: Ct };
})), Et, Dt, Ot = r((() => {
	Et = {
		Save: "Salva",
		Cancel: "Annulla",
		Delete: "Elimina",
		Close: "Chiudi",
		Back: "Indietro",
		Next: "Avanti",
		Done: "Fine",
		Continue: "Continua",
		Search: "Cerca",
		Edit: "Modifica",
		Yes: "Sì",
		No: "No",
		"Sign in": "Accedi",
		"Sign out": "Esci",
		Email: "Email",
		Password: "Password",
		"Nothing here yet": "Ancora niente qui",
		Loading: "Caricamento",
		"{value} of {max}": "{value} su {max}",
		"{value} of {max}, over by {over}": "{value} su {max}, {over} in più",
		Failed: "Non riuscito",
		Today: "Oggi",
		Yesterday: "Ieri",
		Tomorrow: "Domani",
		Settings: "Impostazioni",
		Language: "Lingua",
		Theme: "Tema",
		Light: "Chiaro",
		Dark: "Scuro",
		System: "Sistema",
		Shape: "Forma",
		Square: "Quadrata",
		Rounded: "Arrotondata",
		Circular: "Circolare",
		Note: "Nota",
		Page: "Pagina",
		Red: "Rosso",
		Orange: "Arancione",
		Yellow: "Giallo",
		"Apple green": "Verde mela",
		Green: "Verde",
		"Light blue": "Azzurro",
		Blue: "Blu",
		Pink: "Rosa",
		"This is a beta version": "Questa è una versione beta",
		"Report issue": "Segnala un problema",
		"Issue report": "Segnalazione di problema",
		"Describe the issue:": "Descrivi il problema:",
		"App version:": "Versione dell’app:",
		Danish: "Danese",
		German: "Tedesco",
		English: "Inglese",
		Spanish: "Spagnolo",
		Finnish: "Finlandese",
		French: "Francese",
		Icelandic: "Islandese",
		Italian: "Italiano",
		Japanese: "Giapponese",
		Korean: "Coreano",
		"Norwegian Bokmål": "Norvegese bokmål",
		"Norwegian Nynorsk": "Norvegese nynorsk",
		Norwegian: "Norvegese",
		Portuguese: "Portoghese",
		"Brazilian Portuguese": "Portoghese brasiliano",
		Swedish: "Svedese",
		Chinese: "Cinese",
		"Show password": "Mostra password",
		"Hide password": "Nascondi password",
		OK: "OK",
		Copied: "Copiato",
		"Could not copy": "Impossibile copiare",
		Notifications: "Notifiche",
		"Try again": "Riprova",
		Undo: "Annulla",
		Redo: "Ripeti",
		Copy: "Copia",
		"Copy link": "Copia link",
		Remove: "Rimuovi",
		Rename: "Rinomina",
		Duplicate: "Duplica",
		Download: "Scarica",
		Refresh: "Aggiorna",
		Open: "Apri",
		Send: "Invia",
		Clear: "Cancella",
		"This field is required": "Questo campo è obbligatorio",
		Saved: "Salvato",
		"Saving…": "Salvataggio…",
		Untitled: "Senza titolo",
		Account: "Account",
		Carousel: "Carosello",
		Slide: "Slide",
		Slides: "Slide",
		"Slide {index}": "Slide {index}",
		"{index} of {count}": "{index} di {count}",
		"Previous slide": "Slide precedente",
		"Next slide": "Slide successiva",
		"Move row {index}": "Sposta la riga {index}",
		"Row {from} moved to {to}": "Riga {from} spostata in {to}",
		Pause: "Pausa",
		Play: "Riproduci",
		Menu: "Menu",
		Contents: "Indice",
		"key.ctrl": "Ctrl",
		"key.shift": "Maiusc",
		"key.alt": "Alt",
		"key.enter": "Invio",
		"key.escape": "Esc",
		"key.tab": "Tab",
		"key.space": "Spazio",
		"key.backspace": "Backspace",
		"key.delete": "Canc",
		"key.home": "Home",
		"key.end": "Fine",
		"key.pageup": "Pag su",
		"key.pagedown": "Pag giù",
		"Previous month": "Mese precedente",
		"Next month": "Mese successivo",
		"Previous year": "Anno precedente",
		"Next year": "Anno successivo",
		"Earlier years": "Anni precedenti",
		"Later years": "Anni successivi",
		"Choose a month and year": "Scegli mese e anno",
		"Choose a date": "Scegli una data",
		Date: "Data",
		"W{week}": "S{week}",
		Total: "Totale",
		"End date": "Data di fine",
		"Include time": "Includi ora",
		Time: "Ora",
		Day: "Giorno",
		Week: "Settimana",
		Month: "Mese",
		Swimlane: "Corsie",
		View: "Vista"
	}, Dt = { it: Et };
})), kt, At, jt = r((() => {
	kt = {
		Save: "保存",
		Cancel: "キャンセル",
		Delete: "削除",
		Close: "閉じる",
		Back: "戻る",
		Next: "次へ",
		Done: "完了",
		Continue: "続ける",
		Search: "検索",
		Edit: "編集",
		Yes: "はい",
		No: "いいえ",
		"Sign in": "サインイン",
		"Sign out": "サインアウト",
		Email: "メール",
		Password: "パスワード",
		"Nothing here yet": "まだ何もありません",
		Loading: "読み込み中",
		"{value} of {max}": "{max}中{value}",
		"{value} of {max}, over by {over}": "{max}中{value}、{over}超過",
		Failed: "失敗",
		Today: "今日",
		Yesterday: "昨日",
		Tomorrow: "明日",
		Settings: "設定",
		Language: "言語",
		Theme: "テーマ",
		Light: "ライト",
		Dark: "ダーク",
		System: "システム",
		Shape: "形状",
		Square: "角型",
		Rounded: "角丸",
		Circular: "円形",
		Note: "メモ",
		Page: "ページ",
		Red: "赤",
		Orange: "オレンジ",
		Yellow: "黄色",
		"Apple green": "アップルグリーン",
		Green: "緑",
		"Light blue": "ライトブルー",
		Blue: "青",
		Pink: "ピンク",
		"This is a beta version": "これはベータ版です",
		"Report issue": "問題を報告",
		"Issue report": "問題の報告",
		"Describe the issue:": "問題の内容：",
		"App version:": "アプリのバージョン：",
		Danish: "デンマーク語",
		German: "ドイツ語",
		English: "英語",
		Spanish: "スペイン語",
		Finnish: "フィンランド語",
		French: "フランス語",
		Icelandic: "アイスランド語",
		Italian: "イタリア語",
		Japanese: "日本語",
		Korean: "韓国語",
		"Norwegian Bokmål": "ノルウェー語（ブークモール）",
		"Norwegian Nynorsk": "ノルウェー語（ニーノシュク）",
		Norwegian: "ノルウェー語",
		Portuguese: "ポルトガル語",
		"Brazilian Portuguese": "ポルトガル語（ブラジル）",
		Swedish: "スウェーデン語",
		Chinese: "中国語",
		"Show password": "パスワードを表示",
		"Hide password": "パスワードを非表示",
		OK: "OK",
		Copied: "コピーしました",
		"Could not copy": "コピーできませんでした",
		Notifications: "通知",
		"Try again": "もう一度試す",
		Undo: "取り消す",
		Redo: "やり直す",
		Copy: "コピー",
		"Copy link": "リンクをコピー",
		Remove: "取り除く",
		Rename: "名前を変更",
		Duplicate: "複製",
		Download: "ダウンロード",
		Refresh: "更新",
		Open: "開く",
		Send: "送信",
		Clear: "クリア",
		"This field is required": "この項目は必須です",
		Saved: "保存しました",
		"Saving…": "保存中…",
		Untitled: "名称未設定",
		Account: "アカウント",
		Carousel: "カルーセル",
		Slide: "スライド",
		Slides: "スライド",
		"Slide {index}": "スライド {index}",
		"{index} of {count}": "{count} 枚中 {index} 枚目",
		"Previous slide": "前のスライド",
		"Next slide": "次のスライド",
		"Move row {index}": "{index} 行目を移動",
		"Row {from} moved to {to}": "{from} 行目を {to} 行目に移動しました",
		Pause: "一時停止",
		Play: "再生",
		Menu: "メニュー",
		Contents: "目次",
		"key.ctrl": "Ctrl",
		"key.shift": "Shift",
		"key.alt": "Alt",
		"key.enter": "Enter",
		"key.escape": "Esc",
		"key.tab": "Tab",
		"key.space": "スペース",
		"key.backspace": "Backspace",
		"key.delete": "Delete",
		"key.home": "Home",
		"key.end": "End",
		"key.pageup": "Page Up",
		"key.pagedown": "Page Down",
		"Previous month": "前の月",
		"Next month": "次の月",
		"Previous year": "前の年",
		"Next year": "次の年",
		"Earlier years": "前の12年",
		"Later years": "次の12年",
		"Choose a month and year": "年と月を選択",
		"Choose a date": "日付を選択",
		Date: "日付",
		"W{week}": "第{week}週",
		Total: "合計",
		"End date": "終了日",
		"Include time": "時刻を含める",
		Time: "時刻",
		Day: "日",
		Week: "週",
		Month: "月",
		Swimlane: "スイムレーン",
		View: "表示"
	}, At = { ja: kt };
})), Mt, Nt, Pt = r((() => {
	Mt = {
		Save: "저장",
		Cancel: "취소",
		Delete: "삭제",
		Close: "닫기",
		Back: "뒤로",
		Next: "다음",
		Done: "완료",
		Continue: "계속",
		Search: "검색",
		Edit: "편집",
		Yes: "예",
		No: "아니요",
		"Sign in": "로그인",
		"Sign out": "로그아웃",
		Email: "이메일",
		Password: "비밀번호",
		"Nothing here yet": "아직 아무것도 없습니다",
		Loading: "불러오는 중",
		"{value} of {max}": "{max} 중 {value}",
		"{value} of {max}, over by {over}": "{max} 중 {value}, {over} 초과",
		Failed: "실패",
		Today: "오늘",
		Yesterday: "어제",
		Tomorrow: "내일",
		Settings: "설정",
		Language: "언어",
		Theme: "테마",
		Light: "라이트",
		Dark: "다크",
		System: "시스템",
		Shape: "모양",
		Square: "사각형",
		Rounded: "둥근 모서리",
		Circular: "원형",
		Note: "메모",
		Page: "페이지",
		Red: "빨강",
		Orange: "주황",
		Yellow: "노랑",
		"Apple green": "애플 그린",
		Green: "초록",
		"Light blue": "하늘색",
		Blue: "파랑",
		Pink: "분홍",
		"This is a beta version": "베타 버전입니다",
		"Report issue": "문제 신고",
		"Issue report": "문제 신고",
		"Describe the issue:": "문제를 설명해 주세요:",
		"App version:": "앱 버전:",
		Danish: "덴마크어",
		German: "독일어",
		English: "영어",
		Spanish: "스페인어",
		Finnish: "핀란드어",
		French: "프랑스어",
		Icelandic: "아이슬란드어",
		Italian: "이탈리아어",
		Japanese: "일본어",
		Korean: "한국어",
		"Norwegian Bokmål": "노르웨이어(보크말)",
		"Norwegian Nynorsk": "노르웨이어(니노르스크)",
		Norwegian: "노르웨이어",
		Portuguese: "포르투갈어",
		"Brazilian Portuguese": "브라질 포르투갈어",
		Swedish: "스웨덴어",
		Chinese: "중국어",
		"Show password": "비밀번호 표시",
		"Hide password": "비밀번호 숨기기",
		OK: "확인",
		Copied: "복사됨",
		"Could not copy": "복사하지 못했습니다",
		Notifications: "알림",
		"Try again": "다시 시도",
		Undo: "실행 취소",
		Redo: "다시 실행",
		Copy: "복사",
		"Copy link": "링크 복사",
		Remove: "제거",
		Rename: "이름 변경",
		Duplicate: "복제",
		Download: "다운로드",
		Refresh: "새로 고침",
		Open: "열기",
		Send: "보내기",
		Clear: "지우기",
		"This field is required": "필수 입력 항목입니다",
		Saved: "저장됨",
		"Saving…": "저장 중…",
		Untitled: "제목 없음",
		Account: "계정",
		Carousel: "캐러셀",
		Slide: "슬라이드",
		Slides: "슬라이드",
		"Slide {index}": "슬라이드 {index}",
		"{index} of {count}": "{count}개 중 {index}번째",
		"Previous slide": "이전 슬라이드",
		"Next slide": "다음 슬라이드",
		"Move row {index}": "{index}행 이동",
		"Row {from} moved to {to}": "{from}행을 {to}행으로 이동함",
		Pause: "일시정지",
		Play: "재생",
		Menu: "메뉴",
		Contents: "목차",
		"key.ctrl": "Ctrl",
		"key.shift": "Shift",
		"key.alt": "Alt",
		"key.enter": "Enter",
		"key.escape": "Esc",
		"key.tab": "Tab",
		"key.space": "스페이스",
		"key.backspace": "Backspace",
		"key.delete": "Delete",
		"key.home": "Home",
		"key.end": "End",
		"key.pageup": "Page Up",
		"key.pagedown": "Page Down",
		"Previous month": "이전 달",
		"Next month": "다음 달",
		"Previous year": "이전 연도",
		"Next year": "다음 연도",
		"Earlier years": "이전 연도들",
		"Later years": "다음 연도들",
		"Choose a month and year": "연도와 월 선택",
		"Choose a date": "날짜 선택",
		Date: "날짜",
		"W{week}": "{week}주",
		Total: "합계",
		"End date": "종료일",
		"Include time": "시간 포함",
		Time: "시간",
		Day: "일",
		Week: "주",
		Month: "월",
		Swimlane: "스윔레인",
		View: "보기"
	}, Nt = { ko: Mt };
})), Ft, It, Lt = r((() => {
	Ft = {
		Save: "Lagre",
		Cancel: "Avbryt",
		Delete: "Slett",
		Close: "Lukk",
		Back: "Tilbake",
		Next: "Neste",
		Done: "Ferdig",
		Continue: "Fortsett",
		Search: "Søk",
		Edit: "Rediger",
		Yes: "Ja",
		No: "Nei",
		"Sign in": "Logg inn",
		"Sign out": "Logg ut",
		Email: "E-post",
		Password: "Passord",
		"Nothing here yet": "Ingenting her ennå",
		Loading: "Laster inn",
		"{value} of {max}": "{value} av {max}",
		"{value} of {max}, over by {over}": "{value} av {max}, {over} for mye",
		Failed: "Mislyktes",
		Today: "I dag",
		Yesterday: "I går",
		Tomorrow: "I morgen",
		Settings: "Innstillinger",
		Language: "Språk",
		Theme: "Tema",
		Light: "Lys",
		Dark: "Mørk",
		System: "System",
		Shape: "Form",
		Square: "Firkantet",
		Rounded: "Avrundet",
		Circular: "Sirkulær",
		Note: "Notat",
		Page: "Side",
		Red: "Rød",
		Orange: "Oransje",
		Yellow: "Gul",
		"Apple green": "Eplegrønn",
		Green: "Grønn",
		"Light blue": "Lyseblå",
		Blue: "Blå",
		Pink: "Rosa",
		"This is a beta version": "Dette er en betaversjon",
		"Report issue": "Rapporter et problem",
		"Issue report": "Problemrapport",
		"Describe the issue:": "Beskriv problemet:",
		"App version:": "Appversjon:",
		Danish: "Dansk",
		German: "Tysk",
		English: "Engelsk",
		Spanish: "Spansk",
		Finnish: "Finsk",
		French: "Fransk",
		Icelandic: "Islandsk",
		Italian: "Italiensk",
		Japanese: "Japansk",
		Korean: "Koreansk",
		"Norwegian Bokmål": "Norsk bokmål",
		"Norwegian Nynorsk": "Norsk nynorsk",
		Norwegian: "Norsk",
		Portuguese: "Portugisisk",
		"Brazilian Portuguese": "Brasiliansk portugisisk",
		Swedish: "Svensk",
		Chinese: "Kinesisk",
		"Show password": "Vis passord",
		"Hide password": "Skjul passord",
		OK: "OK",
		Copied: "Kopiert",
		"Could not copy": "Kunne ikke kopiere",
		Notifications: "Varsler",
		"Try again": "Prøv igjen",
		Undo: "Angre",
		Redo: "Gjør om",
		Copy: "Kopier",
		"Copy link": "Kopier lenke",
		Remove: "Fjern",
		Rename: "Gi nytt navn",
		Duplicate: "Dupliser",
		Download: "Last ned",
		Refresh: "Oppdater",
		Open: "Åpne",
		Send: "Send",
		Clear: "Tøm",
		"This field is required": "Dette feltet må fylles ut",
		Saved: "Lagret",
		"Saving…": "Lagrer…",
		Untitled: "Uten tittel",
		Account: "Konto",
		Carousel: "Karusell",
		Slide: "Lysbilde",
		Slides: "Lysbilder",
		"Slide {index}": "Lysbilde {index}",
		"{index} of {count}": "{index} av {count}",
		"Previous slide": "Forrige lysbilde",
		"Next slide": "Neste lysbilde",
		"Move row {index}": "Flytt rad {index}",
		"Row {from} moved to {to}": "Rad {from} flyttet til {to}",
		Pause: "Pause",
		Play: "Spill av",
		Menu: "Meny",
		Contents: "Innhold",
		"key.ctrl": "Ctrl",
		"key.shift": "Skift",
		"key.alt": "Alt",
		"key.enter": "Enter",
		"key.escape": "Esc",
		"key.tab": "Tab",
		"key.space": "Mellomrom",
		"key.backspace": "Tilbake",
		"key.delete": "Delete",
		"key.home": "Home",
		"key.end": "End",
		"key.pageup": "Page Up",
		"key.pagedown": "Page Down",
		"Previous month": "Forrige måned",
		"Next month": "Neste måned",
		"Previous year": "Forrige år",
		"Next year": "Neste år",
		"Earlier years": "Tidligere år",
		"Later years": "Senere år",
		"Choose a month and year": "Velg måned og år",
		"Choose a date": "Velg en dato",
		Date: "Dato",
		"W{week}": "U{week}",
		Total: "Totalt",
		"End date": "Sluttdato",
		"Include time": "Ta med klokkeslett",
		Time: "Klokkeslett",
		Day: "Dag",
		Week: "Uke",
		Month: "Måned",
		Swimlane: "Baner",
		View: "Visning"
	}, It = { nb: Ft };
})), Rt, zt, Bt = r((() => {
	Rt = {
		Save: "Guardar",
		Cancel: "Cancelar",
		Delete: "Eliminar",
		Close: "Fechar",
		Back: "Voltar",
		Next: "Seguinte",
		Done: "Concluído",
		Continue: "Continuar",
		Search: "Pesquisar",
		Edit: "Editar",
		Yes: "Sim",
		No: "Não",
		"Sign in": "Iniciar sessão",
		"Sign out": "Terminar sessão",
		Email: "E-mail",
		Password: "Palavra-passe",
		"Nothing here yet": "Ainda não há nada aqui",
		Loading: "A carregar",
		"{value} of {max}": "{value} de {max}",
		"{value} of {max}, over by {over}": "{value} de {max}, {over} acima",
		Failed: "Falhou",
		Today: "Hoje",
		Yesterday: "Ontem",
		Tomorrow: "Amanhã",
		Settings: "Definições",
		Language: "Idioma",
		Theme: "Tema",
		Light: "Claro",
		Dark: "Escuro",
		System: "Sistema",
		Shape: "Forma",
		Square: "Quadrada",
		Rounded: "Arredondada",
		Circular: "Circular",
		Note: "Nota",
		Page: "Página",
		Red: "Vermelho",
		Orange: "Laranja",
		Yellow: "Amarelo",
		"Apple green": "Verde-maçã",
		Green: "Verde",
		"Light blue": "Azul-claro",
		Blue: "Azul",
		Pink: "Cor-de-rosa",
		"This is a beta version": "Esta é uma versão beta",
		"Report issue": "Comunicar um problema",
		"Issue report": "Relatório de problema",
		"Describe the issue:": "Descreva o problema:",
		"App version:": "Versão da app:",
		Danish: "Dinamarquês",
		German: "Alemão",
		English: "Inglês",
		Spanish: "Espanhol",
		Finnish: "Finlandês",
		French: "Francês",
		Icelandic: "Islandês",
		Italian: "Italiano",
		Japanese: "Japonês",
		Korean: "Coreano",
		"Norwegian Bokmål": "Norueguês bokmål",
		"Norwegian Nynorsk": "Norueguês nynorsk",
		Norwegian: "Norueguês",
		Portuguese: "Português",
		"Brazilian Portuguese": "Português do Brasil",
		Swedish: "Sueco",
		Chinese: "Chinês",
		"Show password": "Mostrar palavra-passe",
		"Hide password": "Ocultar palavra-passe",
		OK: "OK",
		Copied: "Copiado",
		"Could not copy": "Não foi possível copiar",
		Notifications: "Notificações",
		"Try again": "Tentar novamente",
		Undo: "Desfazer",
		Redo: "Refazer",
		Copy: "Copiar",
		"Copy link": "Copiar ligação",
		Remove: "Remover",
		Rename: "Mudar o nome",
		Duplicate: "Duplicar",
		Download: "Descarregar",
		Refresh: "Atualizar",
		Open: "Abrir",
		Send: "Enviar",
		Clear: "Limpar",
		"This field is required": "Este campo é obrigatório",
		Saved: "Guardado",
		"Saving…": "A guardar…",
		Untitled: "Sem título",
		Account: "Conta",
		Carousel: "Carrossel",
		Slide: "Diapositivo",
		Slides: "Diapositivos",
		"Slide {index}": "Diapositivo {index}",
		"{index} of {count}": "{index} de {count}",
		"Previous slide": "Diapositivo anterior",
		"Next slide": "Diapositivo seguinte",
		"Move row {index}": "Mover linha {index}",
		"Row {from} moved to {to}": "Linha {from} movida para {to}",
		Pause: "Pausar",
		Play: "Reproduzir",
		Menu: "Menu",
		Contents: "Índice",
		"key.ctrl": "Ctrl",
		"key.shift": "Shift",
		"key.alt": "Alt",
		"key.enter": "Enter",
		"key.escape": "Esc",
		"key.tab": "Tab",
		"key.space": "Espaço",
		"key.backspace": "Retrocesso",
		"key.delete": "Delete",
		"key.home": "Home",
		"key.end": "End",
		"key.pageup": "Page Up",
		"key.pagedown": "Page Down",
		"Previous month": "Mês anterior",
		"Next month": "Mês seguinte",
		"Previous year": "Ano anterior",
		"Next year": "Ano seguinte",
		"Earlier years": "Anos anteriores",
		"Later years": "Anos seguintes",
		"Choose a month and year": "Escolher mês e ano",
		"Choose a date": "Escolher uma data",
		Date: "Data",
		"W{week}": "S{week}",
		Total: "Total",
		"End date": "Data de fim",
		"Include time": "Incluir hora",
		Time: "Hora",
		Day: "Dia",
		Week: "Semana",
		Month: "Mês",
		Swimlane: "Raias",
		View: "Vista"
	}, zt = { pt: Rt };
})), Vt, Ht = r((() => {
	Vt = { "pt-BR": {
		Save: "Salvar",
		Cancel: "Cancelar",
		Delete: "Excluir",
		Close: "Fechar",
		Back: "Voltar",
		Next: "Próximo",
		Done: "Concluído",
		Continue: "Continuar",
		Search: "Buscar",
		Edit: "Editar",
		Yes: "Sim",
		No: "Não",
		"Sign in": "Entrar",
		"Sign out": "Sair",
		Email: "E-mail",
		Password: "Senha",
		"Nothing here yet": "Nada aqui ainda",
		Loading: "Carregando",
		"{value} of {max}": "{value} de {max}",
		"{value} of {max}, over by {over}": "{value} de {max}, {over} acima",
		Failed: "Falhou",
		Today: "Hoje",
		Yesterday: "Ontem",
		Tomorrow: "Amanhã",
		Settings: "Configurações",
		Language: "Idioma",
		Theme: "Tema",
		Light: "Claro",
		Dark: "Escuro",
		System: "Sistema",
		Shape: "Formato",
		Square: "Quadrado",
		Rounded: "Arredondado",
		Circular: "Circular",
		Note: "Nota",
		Page: "Página",
		Red: "Vermelho",
		Orange: "Laranja",
		Yellow: "Amarelo",
		"Apple green": "Verde-maçã",
		Green: "Verde",
		"Light blue": "Azul-claro",
		Blue: "Azul",
		Pink: "Rosa",
		"This is a beta version": "Esta é uma versão beta",
		"Report issue": "Relatar problema",
		"Issue report": "Relatório de problema",
		"Describe the issue:": "Descreva o problema:",
		"App version:": "Versão do app:",
		Danish: "Dinamarquês",
		German: "Alemão",
		English: "Inglês",
		Spanish: "Espanhol",
		Finnish: "Finlandês",
		French: "Francês",
		Icelandic: "Islandês",
		Italian: "Italiano",
		Japanese: "Japonês",
		Korean: "Coreano",
		"Norwegian Bokmål": "Norueguês bokmål",
		"Norwegian Nynorsk": "Norueguês nynorsk",
		Norwegian: "Norueguês",
		Portuguese: "Português",
		"Brazilian Portuguese": "Português do Brasil",
		Swedish: "Sueco",
		Chinese: "Chinês",
		"Show password": "Mostrar senha",
		"Hide password": "Ocultar senha",
		OK: "OK",
		Copied: "Copiado",
		"Could not copy": "Não foi possível copiar",
		Notifications: "Notificações",
		"Try again": "Tentar novamente",
		Undo: "Desfazer",
		Redo: "Refazer",
		Copy: "Copiar",
		"Copy link": "Copiar link",
		Remove: "Remover",
		Rename: "Renomear",
		Duplicate: "Duplicar",
		Download: "Baixar",
		Refresh: "Atualizar",
		Open: "Abrir",
		Send: "Enviar",
		Clear: "Limpar",
		"This field is required": "Este campo é obrigatório",
		Saved: "Salvo",
		"Saving…": "Salvando…",
		Untitled: "Sem título",
		Account: "Conta",
		Carousel: "Carrossel",
		Slide: "Slide",
		Slides: "Slides",
		"Slide {index}": "Slide {index}",
		"{index} of {count}": "{index} de {count}",
		"Previous slide": "Slide anterior",
		"Next slide": "Próximo slide",
		"Move row {index}": "Mover linha {index}",
		"Row {from} moved to {to}": "Linha {from} movida para {to}",
		Pause: "Pausar",
		Play: "Reproduzir",
		Menu: "Menu",
		Contents: "Sumário",
		"key.ctrl": "Ctrl",
		"key.shift": "Shift",
		"key.alt": "Alt",
		"key.enter": "Enter",
		"key.escape": "Esc",
		"key.tab": "Tab",
		"key.space": "Espaço",
		"key.backspace": "Backspace",
		"key.delete": "Delete",
		"key.home": "Home",
		"key.end": "End",
		"key.pageup": "Page Up",
		"key.pagedown": "Page Down",
		"Previous month": "Mês anterior",
		"Next month": "Próximo mês",
		"Previous year": "Ano anterior",
		"Next year": "Próximo ano",
		"Earlier years": "Anos anteriores",
		"Later years": "Anos seguintes",
		"Choose a month and year": "Escolher mês e ano",
		"Choose a date": "Escolher uma data",
		Date: "Data",
		"W{week}": "S{week}",
		Total: "Total",
		"End date": "Data de término",
		"Include time": "Incluir horário",
		Time: "Horário",
		Day: "Dia",
		Week: "Semana",
		Month: "Mês",
		Swimlane: "Raias",
		View: "Visualização"
	} };
})), Ut, Wt, Gt = r((() => {
	Ut = {
		Save: "Spara",
		Cancel: "Avbryt",
		Delete: "Radera",
		Close: "Stäng",
		Back: "Tillbaka",
		Next: "Nästa",
		Done: "Klar",
		Continue: "Fortsätt",
		Search: "Sök",
		Edit: "Redigera",
		Yes: "Ja",
		No: "Nej",
		"Sign in": "Logga in",
		"Sign out": "Logga ut",
		Email: "E-post",
		Password: "Lösenord",
		"Nothing here yet": "Inget här än",
		Loading: "Läser in",
		"{value} of {max}": "{value} av {max}",
		"{value} of {max}, over by {over}": "{value} av {max}, {over} för mycket",
		Failed: "Misslyckades",
		Today: "I dag",
		Yesterday: "I går",
		Tomorrow: "I morgon",
		Settings: "Inställningar",
		Language: "Språk",
		Theme: "Tema",
		Light: "Ljust",
		Dark: "Mörkt",
		System: "System",
		Shape: "Form",
		Square: "Fyrkantig",
		Rounded: "Rundad",
		Circular: "Cirkulär",
		Note: "Anteckning",
		Page: "Sida",
		Red: "Röd",
		Orange: "Orange",
		Yellow: "Gul",
		"Apple green": "Äppelgrön",
		Green: "Grön",
		"Light blue": "Ljusblå",
		Blue: "Blå",
		Pink: "Rosa",
		"This is a beta version": "Det här är en betaversion",
		"Report issue": "Rapportera problem",
		"Issue report": "Problemrapport",
		"Describe the issue:": "Beskriv problemet:",
		"App version:": "Appversion:",
		Danish: "Danska",
		German: "Tyska",
		English: "Engelska",
		Spanish: "Spanska",
		Finnish: "Finska",
		French: "Franska",
		Icelandic: "Isländska",
		Italian: "Italienska",
		Japanese: "Japanska",
		Korean: "Koreanska",
		"Norwegian Bokmål": "Norskt bokmål",
		"Norwegian Nynorsk": "Nynorska",
		Norwegian: "Norska",
		Portuguese: "Portugisiska",
		"Brazilian Portuguese": "Brasiliansk portugisiska",
		Swedish: "Svenska",
		Chinese: "Kinesiska",
		"Show password": "Visa lösenord",
		"Hide password": "Dölj lösenord",
		OK: "OK",
		Copied: "Kopierat",
		"Could not copy": "Kunde inte kopiera",
		Notifications: "Aviseringar",
		"Try again": "Försök igen",
		Undo: "Ångra",
		Redo: "Gör om",
		Copy: "Kopiera",
		"Copy link": "Kopiera länk",
		Remove: "Ta bort",
		Rename: "Byt namn",
		Duplicate: "Duplicera",
		Download: "Hämta",
		Refresh: "Uppdatera",
		Open: "Öppna",
		Send: "Skicka",
		Clear: "Rensa",
		"This field is required": "Det här fältet måste fyllas i",
		Saved: "Sparat",
		"Saving…": "Sparar…",
		Untitled: "Namnlös",
		Account: "Konto",
		Carousel: "Karusell",
		Slide: "Bild",
		Slides: "Bilder",
		"Slide {index}": "Bild {index}",
		"{index} of {count}": "{index} av {count}",
		"Previous slide": "Föregående bild",
		"Next slide": "Nästa bild",
		"Move row {index}": "Flytta rad {index}",
		"Row {from} moved to {to}": "Rad {from} flyttad till {to}",
		Pause: "Pausa",
		Play: "Spela upp",
		Menu: "Meny",
		Contents: "Innehåll",
		"key.ctrl": "Ctrl",
		"key.shift": "Skift",
		"key.alt": "Alt",
		"key.enter": "Retur",
		"key.escape": "Esc",
		"key.tab": "Tabb",
		"key.space": "Blanksteg",
		"key.backspace": "Backsteg",
		"key.delete": "Delete",
		"key.home": "Home",
		"key.end": "End",
		"key.pageup": "Page Up",
		"key.pagedown": "Page Down",
		"Previous month": "Föregående månad",
		"Next month": "Nästa månad",
		"Previous year": "Föregående år",
		"Next year": "Nästa år",
		"Earlier years": "Tidigare år",
		"Later years": "Senare år",
		"Choose a month and year": "Välj månad och år",
		"Choose a date": "Välj ett datum",
		Date: "Datum",
		"W{week}": "V{week}",
		Total: "Totalt",
		"End date": "Slutdatum",
		"Include time": "Inkludera tid",
		Time: "Tid",
		Day: "Dag",
		Week: "Vecka",
		Month: "Månad",
		Swimlane: "Banor",
		View: "Vy"
	}, Wt = { sv: Ut };
})), Kt, qt, Jt = r((() => {
	Kt = {
		Save: "保存",
		Cancel: "取消",
		Delete: "删除",
		Close: "关闭",
		Back: "返回",
		Next: "下一步",
		Done: "完成",
		Continue: "继续",
		Search: "搜索",
		Edit: "编辑",
		Yes: "是",
		No: "否",
		"Sign in": "登录",
		"Sign out": "退出登录",
		Email: "邮箱",
		Password: "密码",
		"Nothing here yet": "这里还没有内容",
		Loading: "正在加载",
		"{value} of {max}": "{value}/{max}",
		"{value} of {max}, over by {over}": "{value}/{max}，超出 {over}",
		Failed: "失败",
		Today: "今天",
		Yesterday: "昨天",
		Tomorrow: "明天",
		Settings: "设置",
		Language: "语言",
		Theme: "主题",
		Light: "浅色",
		Dark: "深色",
		System: "跟随系统",
		Shape: "形状",
		Square: "方形",
		Rounded: "圆角",
		Circular: "圆形",
		Note: "笔记",
		Page: "页面",
		Red: "红色",
		Orange: "橙色",
		Yellow: "黄色",
		"Apple green": "苹果绿",
		Green: "绿色",
		"Light blue": "浅蓝色",
		Blue: "蓝色",
		Pink: "粉色",
		"This is a beta version": "这是测试版",
		"Report issue": "报告问题",
		"Issue report": "问题报告",
		"Describe the issue:": "描述问题：",
		"App version:": "应用版本：",
		Danish: "丹麦语",
		German: "德语",
		English: "英语",
		Spanish: "西班牙语",
		Finnish: "芬兰语",
		French: "法语",
		Icelandic: "冰岛语",
		Italian: "意大利语",
		Japanese: "日语",
		Korean: "韩语",
		"Norwegian Bokmål": "书面挪威语",
		"Norwegian Nynorsk": "挪威尼诺斯克语",
		Norwegian: "挪威语",
		Portuguese: "葡萄牙语",
		"Brazilian Portuguese": "巴西葡萄牙语",
		Swedish: "瑞典语",
		Chinese: "中文",
		"Show password": "显示密码",
		"Hide password": "隐藏密码",
		OK: "确定",
		Copied: "已复制",
		"Could not copy": "无法复制",
		Notifications: "通知",
		"Try again": "重试",
		Undo: "撤销",
		Redo: "重做",
		Copy: "复制",
		"Copy link": "复制链接",
		Remove: "移除",
		Rename: "重命名",
		Duplicate: "创建副本",
		Download: "下载",
		Refresh: "刷新",
		Open: "打开",
		Send: "发送",
		Clear: "清除",
		"This field is required": "此字段为必填项",
		Saved: "已保存",
		"Saving…": "正在保存…",
		Untitled: "未命名",
		Account: "账户",
		Carousel: "轮播",
		Slide: "幻灯片",
		Slides: "幻灯片",
		"Slide {index}": "幻灯片 {index}",
		"{index} of {count}": "第 {index} 张，共 {count} 张",
		"Previous slide": "上一张",
		"Next slide": "下一张",
		"Move row {index}": "移动第 {index} 行",
		"Row {from} moved to {to}": "第 {from} 行已移到第 {to} 行",
		Pause: "暂停",
		Play: "播放",
		Menu: "菜单",
		Contents: "目录",
		"key.ctrl": "Ctrl",
		"key.shift": "Shift",
		"key.alt": "Alt",
		"key.enter": "Enter",
		"key.escape": "Esc",
		"key.tab": "Tab",
		"key.space": "空格",
		"key.backspace": "Backspace",
		"key.delete": "Delete",
		"key.home": "Home",
		"key.end": "End",
		"key.pageup": "Page Up",
		"key.pagedown": "Page Down",
		"Previous month": "上个月",
		"Next month": "下个月",
		"Previous year": "上一年",
		"Next year": "下一年",
		"Earlier years": "更早的年份",
		"Later years": "更晚的年份",
		"Choose a month and year": "选择月份和年份",
		"Choose a date": "选择日期",
		Date: "日期",
		"W{week}": "第{week}周",
		Total: "合计",
		"End date": "结束日期",
		"Include time": "包含时间",
		Time: "时间",
		Day: "日",
		Week: "周",
		Month: "月",
		Swimlane: "泳道",
		View: "视图"
	}, qt = { zh: Kt };
})), Yt = /* @__PURE__ */ i({ SHARED_WORDS: () => Xt }), Xt, Zt = r((() => {
	st(), ut(), pt(), gt(), yt(), St(), Tt(), Ot(), jt(), Pt(), Lt(), Bt(), Ht(), Gt(), Jt(), Xt = {
		...ft,
		...ot,
		...lt,
		...ht,
		...vt,
		...xt,
		...wt,
		...Dt,
		...At,
		...Nt,
		...It,
		...zt,
		...Vt,
		...Wt,
		...qt
	};
})), Qt = {}, $t = "./translations.json", en = "language", tn = "ds-one:i18n-debug", H = "en", U = typeof window < "u" && window.DS_ONE_I18N ? { ...window.DS_ONE_I18N } : {}, nn;
function rn() {
	try {
		return typeof window < "u" ? window.localStorage ?? void 0 : void 0;
	} catch {
		return;
	}
}
function an() {
	return U.storageKey || en;
}
function on() {
	if (U.persist === !1) return null;
	try {
		return rn()?.getItem(an()) || null;
	} catch {
		return null;
	}
}
function sn(e) {
	if (U.persist !== !1) try {
		rn()?.setItem(an(), e);
	} catch {}
}
function cn(e) {
	return e ? e.toLowerCase().split(/[-_]/)[0] ?? "" : "";
}
function ln(e) {
	let t = U.languages;
	if (!t || t.length === 0) return cn(e) || null;
	let n = (e || "").toLowerCase().replace("_", "-"), r = t.find((e) => e.toLowerCase() === n);
	if (r) return r;
	let i = cn(e);
	return t.find((e) => e.toLowerCase() === i) ?? null;
}
function un(e) {
	let t = U.languageFile;
	return t ? fn(typeof t == "function" ? t(e) : t.split("{language}").join(e)) : null;
}
var dn = !1;
function fn(e) {
	if (!e) return null;
	let t = e.trim();
	return t ? t.startsWith("./") || t.startsWith("../") || t.startsWith("/") || /^https?:\/\//i.test(t) ? t : `./${t}` : null;
}
function pn() {
	return typeof document > "u" || !document.querySelector ? null : document.querySelector("script[data-ds-one-translations]")?.getAttribute("data-ds-one-translations") || document.querySelector("meta[name=\"ds-one:translations\"]")?.getAttribute("content") || document.querySelector("link[rel=\"ds-one-translations\"]")?.getAttribute("href") || null;
}
function mn() {
	let e = [], t = typeof window < "u" ? window.DS_ONE_TRANSLATIONS_FILE : null, n = pn(), r = fn(t ?? "");
	r && e.push(r);
	let i = fn(n ?? "");
	return i && !e.includes(i) && e.push(i), e.length === 0 && e.push(fn(U.translationsFile ?? "") ?? $t), e;
}
function hn() {
	let e = mn(), t = un(ln(W.value) ?? H);
	return t ? [t, ...e.filter((e) => e !== t)] : e;
}
function gn(e) {
	let t = ln(W.value) ?? H;
	return un(t) === e ? t : void 0;
}
function _n(e) {
	return !e || typeof e != "object" ? !1 : Object.values(e).every((e) => e && typeof e == "object");
}
var vn = /* @__PURE__ */ new Map();
function yn(e, t) {
	let n = vn.get(e);
	return n || (n = bn(e, t).then((t) => (t || vn.delete(e), t)), vn.set(e, n)), n;
}
async function bn(e, t) {
	try {
		let n = await fetch(e);
		if (!n.ok) return null;
		let r = await n.json(), i = t ? it(t, r) ?? r : r;
		return _n(i) ? Object.keys(i).length === 0 ? (console.warn(`[Design system 1] No languages found in ${e}`), null) : i : (console.warn(`[Design system 1] Invalid translation format in ${e}. Expected object with language codes as keys.`), null);
	} catch {
		return null;
	}
}
function xn(e) {
	typeof window > "u" ? Qt = {
		...Qt,
		...e
	} : window.DS_ONE_TRANSLATIONS = {
		...window.DS_ONE_TRANSLATIONS,
		...e
	};
}
async function Sn() {
	if (dn || (dn = !0, typeof window > "u")) return !1;
	if (window.DS_ONE_TRANSLATIONS && Object.keys(window.DS_ONE_TRANSLATIONS).length > 0) return Gn(`Translations already loaded (${Object.keys(window.DS_ONE_TRANSLATIONS).length} languages), skipping auto-load`), !0;
	let e = hn();
	for (let t of e) {
		let e = await yn(t, gn(t));
		if (!e) continue;
		xn(e);
		let n = Object.keys(e);
		return Gn(`External translations loaded from ${t}: ${n.length} language(s) – ${n.join(", ")}`), window.dispatchEvent(new CustomEvent("translations-ready")), !0;
	}
	return Gn(`No external translations found at ${e[0] ?? $t}. Using bundled translations.`), !1;
}
var Cn = /* @__PURE__ */ new Map();
function wn(e) {
	if (typeof window > "u" || !U.languageFile) return Promise.resolve();
	let t = ln(e) ?? H;
	if (Tn()[t]) return Promise.resolve();
	let n = Cn.get(t);
	return n || (n = (async () => {
		let e = un(t), n = e ? await yn(e, t) : null;
		for (let e of mn()) {
			if (n) break;
			n = await yn(e);
		}
		n && (xn(n), window.dispatchEvent(new CustomEvent("translations-ready")));
	})(), Cn.set(t, n)), n;
}
function Tn() {
	return typeof window < "u" && window.DS_ONE_TRANSLATIONS ? window.DS_ONE_TRANSLATIONS : Qt;
}
function En() {
	return U.languages?.length ? U.languages : null;
}
function Dn(e) {
	if (!e) return null;
	let t = En(), n = t ? t.filter(Ve) : B;
	return (n.length ? We(e, null, n) : null) || (t ? ln(e) : null);
}
function On() {
	if (typeof navigator > "u" || !navigator) return H;
	let e = [navigator.language, ...Array.isArray(navigator.languages) ? navigator.languages : []].filter((e) => !!e);
	for (let t of e) {
		let e = Dn(t);
		if (e) return e;
	}
	return !En() && e[0] ? e[0] : H;
}
function kn(e) {
	typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("language-changed", {
		detail: { language: e },
		bubbles: !0,
		composed: !0
	}));
}
function An() {
	if (!U.languageFromAddress || typeof window > "u") return null;
	let e = window.location?.pathname;
	return e ? Qe(e, Pn()).language : null;
}
function jn() {
	let e = U.langTarget;
	return e === !1 ? null : e || (typeof document < "u" ? document.documentElement ?? null : null);
}
var W = {
	value: An() || on() || On(),
	set: function(e, t = {}) {
		this.value = e, t.remember !== !1 && sn(e), wn(e);
		let n = jn();
		n && (n.lang = e), kn(e);
	}
};
function Mn(e) {
	let t = U.persist, n = an(), r = U.languages, i = U.languageFromAddress, a = U.routing;
	if (U = {
		...U,
		...e
	}, Nn(), U.persist !== t || an() !== n || U.languages !== r || U.languageFromAddress !== i || U.languageFromAddress && U.routing !== a) {
		let e = on(), t = e || On();
		e && En() && (t = Dn(e) ?? H), t = An() ?? t, t !== W.value && (W.value = t, kn(t));
	}
	e.sharedWords && In(), dn && U.languageFile && wn(W.value);
}
function Nn() {
	(U.routing || U.languages) && qe(Pn());
}
function Pn() {
	return {
		...U.languages ? { languages: U.languages } : {},
		...U.routing
	};
}
var Fn = null;
function In() {
	return Fn ||= Promise.resolve().then(() => (Zt(), Yt)).then(({ SHARED_WORDS: e }) => {
		nn = e, typeof window < "u" && window.dispatchEvent(new CustomEvent("translations-ready"));
	}), Fn;
}
var Ln = [], Rn = 1e3, zn = null, Bn = !1, Vn = typeof window < "u" ? window : void 0;
function Hn() {
	if (zn) return;
	let e = new Promise((e) => setTimeout(e, Rn));
	zn = Promise.race([Promise.allSettled(Ln.splice(0)), e]).then(() => {
		zn = null, Bn = !0, Un() && Vn && (Vn.dispatchEvent(new CustomEvent("translations-loaded")), kn(W.value));
	});
}
if (Nn(), U.sharedWords && Ln.push(In()), typeof window < "u" && typeof document < "u") {
	let e = () => {};
	Ln.push(new Promise((t) => e = t));
	let t = () => {
		U.autoLoad === !1 ? e() : Sn().finally(e);
	};
	document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", t) : setTimeout(t, 0);
}
var Un = () => typeof window < "u" && typeof window.addEventListener == "function" && typeof window.dispatchEvent == "function";
Un() && (window.addEventListener("translations-ready", Hn), setTimeout(() => {
	Un() && !Bn && window === Vn && Hn();
}, 100));
var Wn = /* @__PURE__ */ new Set();
function Gn(e) {
	Kn() && console.info(`[Design system 1] ${e}`);
}
function Kn() {
	if (typeof window > "u") return !1;
	if (window.DS_ONE_I18N_DEBUG === !0) return !0;
	try {
		return rn()?.getItem(tn) === "on";
	} catch {
		return !1;
	}
}
function qn() {
	let e = U.reportMissingKeys;
	try {
		if (typeof e == "function" ? e() : e) return !0;
	} catch {}
	return Kn();
}
function Jn(e, t) {
	if (!qn()) return;
	let n = `${t}:${e}`;
	Wn.has(n) || (Wn.add(n), console.warn(`[Design system 1 (Internationalization)] No translation found for key "${e}" in "${t}"`));
}
function Yn(e, t) {
	return Xn(e, W.value, t);
}
globalThis[Symbol.for("design-system-1.translate")] = Yn;
function Xn(e, t, n) {
	let r = Tn(), i = nt(e, t, [r, nn], n);
	if (i.language !== null) return i.text;
	let a = Ge(t);
	return !a.includes(H) && !r?.[H] && a.some((e) => r?.[e]) && wn(H), Jn(e, a[a.length - 1] ?? t), i.text;
}
function G(e, t) {
	return Yn(e, t);
}
//#endregion
//#region src/vendor/ds1/0-face/define.ts
function K(e, t) {
	if (typeof customElements > "u" || customElements.get(e)) return;
	let n = t, r = t.prototype, i = r.createRenderRoot;
	if (i && typeof document < "u") {
		let e = document;
		r.createRenderRoot = function() {
			if (this.ownerDocument === e || !n.elementStyles?.length) return i.call(this);
			let t = this.shadowRoot ?? this.attachShadow(n.shadowRootOptions ?? { mode: "open" });
			for (let e of n.elementStyles) {
				let n = this.ownerDocument.createElement("style");
				n.textContent = e.cssText ?? Array.from(e.cssRules ?? [], (e) => e.cssText).join("\n"), t.append(n);
			}
			return this.renderOptions && (this.renderOptions.renderBefore ??= t.firstChild), t;
		};
	}
	customElements.define(e, t);
}
//#endregion
//#region src/vendor/ds1/0-face/cut-fade.ts
var Zn = "data-cut";
[
	".ds-row__name",
	".ds-sidebar__label",
	".ds-menu__item",
	".ds-badge__label",
	".ds-notice__title",
	".ds-notice__text",
	".ds-progress__label",
	".ds-stat__figure",
	".ds-document__toc-list a",
	".ds-footer__links a",
	".item-text"
].join(", ");
function Qn(e) {
	return e.scrollWidth > e.clientWidth + 1;
}
function $n(e) {
	let t = [];
	for (let n of e) n.isConnected && n.checkVisibility?.({ contentVisibilityAuto: !0 }) !== !1 && t.push([n, Qn(n)]);
	lr();
	for (let [e, n] of t) {
		let t = e.getAttribute(Zn);
		n ? t !== "end" && e.setAttribute(Zn, "end") : t === "end" && e.removeAttribute(Zn);
	}
}
var er = /* @__PURE__ */ new Set(), tr = /* @__PURE__ */ new Set(), nr = !1, rr = (e) => {
	typeof requestAnimationFrame == "function" ? requestAnimationFrame(e) : setTimeout(e, 0);
};
function ir() {
	nr = !1;
	let e = [...tr];
	tr.clear();
	let t = /* @__PURE__ */ new Set();
	for (let n of e) if (!n.stopped) for (let e of n.refresh()) t.add(e);
	$n(t);
}
function q(e) {
	e.stopped || (tr.add(e), !nr && (nr = !0, rr(ir)));
}
var ar, J = /* @__PURE__ */ new Map();
function or(e) {
	if (typeof ResizeObserver > "u") return;
	ar ??= new ResizeObserver((e) => $n(e.map((e) => e.target)));
	let t = J.get(e) ?? 0;
	t || ar.observe(e), J.set(e, t + 1);
}
function sr(e) {
	let t = J.get(e);
	t && (t > 1 ? J.set(e, t - 1) : (J.delete(e), ar?.unobserve(e)));
}
var cr = !1;
function lr() {
	if (cr || typeof document > "u") return;
	cr = !0;
	let e = () => {
		for (let e of er) q(e);
	}, t = document.fonts;
	t?.ready?.then(e, () => {}), t?.addEventListener?.("loadingdone", e);
}
function ur(e = {}) {
	let t = [], n = /* @__PURE__ */ new Set(), r = e.text && typeof MutationObserver < "u" ? new MutationObserver(() => q(a)) : void 0, i = () => {
		let e = /* @__PURE__ */ new Set();
		for (let n of t) {
			let t = typeof n == "function" ? n() : n instanceof Element ? [n] : n;
			for (let n of t) e.add(n);
		}
		return e;
	}, a = {
		stopped: !1,
		refresh() {
			let e = i(), t = e.size !== n.size;
			for (let r of n) e.has(r) || (sr(r), t = !0);
			for (let r of e) n.has(r) || (or(r), t = !0);
			if (r && t) {
				r.disconnect();
				for (let t of e) r.observe(t, {
					childList: !0,
					characterData: !0,
					subtree: !0
				});
			}
			return n = e, n;
		}
	};
	return er.add(a), {
		watch(e) {
			t.push(e), q(a);
		},
		select(e, n) {
			t.push(() => e.querySelectorAll(n)), q(a);
		},
		measure() {
			q(a);
		},
		disconnect() {
			a.stopped = !0, er.delete(a), tr.delete(a);
			for (let e of n) sr(e);
			r?.disconnect(), n = /* @__PURE__ */ new Set(), t.length = 0;
		}
	};
}
var dr = class {
	watcher;
	words;
	host;
	options;
	constructor(e, t) {
		this.host = e, this.options = t, e.addController(this);
	}
	hostConnected() {
		this.hostDisconnected();
		let e = ur(), { selector: t, targets: n, text: r } = this.options;
		t && e.watch(() => (this.host.renderRoot ?? this.host).querySelectorAll(t)), n && e.watch(n), this.watcher = e, r && typeof MutationObserver < "u" && (this.words = new MutationObserver(() => this.measure()), this.words.observe(this.host, {
			childList: !0,
			characterData: !0,
			subtree: !0
		}));
	}
	hostUpdated() {
		this.measure();
	}
	hostDisconnected() {
		this.words?.disconnect(), this.words = void 0, this.watcher?.disconnect(), this.watcher = void 0;
	}
	measure() {
		this.watcher?.measure();
	}
}, fr = "[data-ds-shape=square],:host([data-ds-shape=square]){--ds-corner-size:0px;--ds-corner-shape:round;--ds-button-inset:.5px}[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:4px;--ds-corner-shape:round;--ds-button-inset:2.5px}[data-ds-shape=circular],:host([data-ds-shape=circular]){--ds-corner-size:999px;--ds-corner-shape:round;--ds-button-inset:5px}@supports (corner-shape:squircle){[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:8px;--ds-corner-shape:squircle}}:root,:host,:where([data-ds-surface]){--ds-unit:calc(var(--ds-1,20px) * var(--ds-sf,1));--ds-control-height:calc(var(--ds-control-size,var(--ds-08,16px)) * var(--ds-sf,1));--ds-row-height:calc(var(--ds-row-size,var(--ds-1,20px)) * var(--ds-sf,1));--ds-type-size-default:calc(var(--ds-text-size,14px) * var(--ds-sf,1));--ds-type-size-small:calc(var(--ds-small-text-size,10px) * var(--ds-sf,1));--ds-type-size-heading:calc(var(--ds-heading-text-size,13px) * var(--ds-sf,1));--ds-type-size-display:calc(var(--ds-display-text-size,20px) * var(--ds-sf,1));--ds-type-lineheight-default:calc(var(--ds-text-leading,16px) * var(--ds-sf,1));--ds-type-letterspacing-default:calc(var(--ds-text-tracking,-.3px) * var(--ds-sf,1));--ds-radius:calc(var(--ds-corner-size,4px) * var(--ds-sf,1));--ds-radius-card:calc(var(--ds-card-corner-size,4px) * var(--ds-sf,1))}:host{height:var(--ds-control-height);font-family:\"Inter Arrows\", var(--ds-typeface-regular);font-size:var(--ds-type-size-default);font-weight:var(--ds-type-weight-default);line-height:var(--ds-type-lineheight-default);letter-spacing:var(--ds-type-letterspacing-default);text-align:left;vertical-align:middle;white-space:nowrap;word-break:normal;overflow-wrap:normal;hyphens:manual;color:var(--ds-text-tone,inherit);justify-content:flex-start;align-items:center;display:inline-flex}:host([hidden]){display:none!important}:host([data-language=ja]){font-family:\"Inter Arrows\", var(--ds-typeface-regular-jp,var(--typeface-regular-jp))}:host([data-language=zh]),:host([data-language=zh-hant]){font-family:\"Inter Arrows\", var(--ds-typeface-regular-zh-hant,var(--typeface-regular-zh-hant));font-weight:var(--ds-type-weight-default,400)}:host([data-language=zh-hans]){font-family:\"Inter Arrows\", var(--ds-typeface-regular-zh-hans,var(--typeface-regular-zh-hans));font-weight:var(--ds-type-weight-default,400)}:host span{color:inherit}:host([literal]){height:auto;min-height:var(--ds-control-height);min-width:0;max-width:100%;overflow:var(--ds-text-overflow,hidden);font-family:\"Inter Arrows\", var(--ds-typeface-regular);font-feature-settings:var(--ds-font-features);font-size:var(--ds-type-size-default);font-weight:var(--ds-type-weight-default);line-height:var(--ds-type-lineheight-default);letter-spacing:var(--ds-type-letterspacing-default);text-overflow:clip;white-space:nowrap;display:inline-block}:host([literal]:not([wrap])[data-cut=end]){mask-image:linear-gradient(to right, #000 calc(100% - var(--ds-unit)), transparent)}:host([literal]:not([wrap])[data-cut=end]:dir(rtl)){mask-image:linear-gradient(to left, #000 calc(100% - var(--ds-unit)), transparent)}:host([strong]){font-weight:var(--ds-type-weight-bold)}:host([wrap]){height:auto;min-height:var(--ds-control-height);max-width:100%;line-height:var(--ds-unit);white-space:normal;display:inline-block;overflow:visible}:host([tone=muted]){--ds-text-tone:var(--ds-text-color-muted)}:host([tone=title]){--ds-text-tone:var(--ds-title-color)}:host([tone=danger]){--ds-text-tone:var(--ds-danger-color)}:host([tone=warning]){--ds-text-tone:var(--ds-warning-color)}:host([size=small]){font-size:var(--ds-type-size-small)}:host([size=heading]){height:auto;font-size:var(--ds-type-size-heading);line-height:var(--ds-type-lineheight-default)}:host([size=display]){height:auto;min-height:calc(2 * var(--ds-unit));font-size:var(--ds-type-size-display);line-height:calc(2 * var(--ds-unit));letter-spacing:calc(var(--ds-display-text-tracking,-.4px) * var(--ds-sf,1));display:inline-block}";
K("ds-text", class extends R {
	static get properties() {
		return {
			text: {
				type: String,
				reflect: !0
			},
			literal: {
				type: Boolean,
				reflect: !0
			},
			tone: {
				type: String,
				reflect: !0
			},
			size: {
				type: String,
				reflect: !0
			},
			strong: {
				type: Boolean,
				reflect: !0
			},
			wrap: {
				type: Boolean,
				reflect: !0
			},
			_text: {
				type: String,
				state: !0
			}
		};
	}
	_slotKey = "";
	cuts = new dr(this, {
		targets: () => this.literal && !this.wrap ? [this] : [],
		text: !0
	});
	boundHandlers;
	constructor() {
		super(), this.text = "", this.literal = !1, this.strong = !1, this.wrap = !1, this._text = "", this._currentLanguage = W.value, this.boundHandlers = { languageChanged: (() => {
			this._currentLanguage = W.value, this._updateLanguageAttribute(), this._loadText(), this.requestUpdate();
		}) };
	}
	static styles = h(fr);
	connectedCallback() {
		if (super.connectedCallback(), !this.text && !this.literal) {
			let e = this.textContent?.trim() || "";
			e && (this._slotKey = e, this.textContent = "");
		}
		this._currentLanguage = W.value, this._updateLanguageAttribute(), this._loadText(), window.addEventListener("language-changed", this.boundHandlers.languageChanged), window.addEventListener("translations-loaded", this.boundHandlers.languageChanged);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), window.removeEventListener("language-changed", this.boundHandlers.languageChanged), window.removeEventListener("translations-loaded", this.boundHandlers.languageChanged);
	}
	willUpdate(e) {
		super.willUpdate(e), (e.has("text") || e.has("literal")) && this._loadText();
	}
	_updateLanguageAttribute() {
		let e = (this._currentLanguage || W.value || "").toLowerCase().split(/[-_]/).filter(Boolean), t = e[0] || "";
		if (t === "ja") this.setAttribute("data-language", "ja");
		else if (t === "zh") {
			let t = e.includes("hans") || e.includes("cn") || e.includes("sg"), n = e.includes("hant") || e.includes("tw") || e.includes("hk") || e.includes("mo");
			t ? this.setAttribute("data-language", "zh-hans") : n ? this.setAttribute("data-language", "zh-hant") : this.setAttribute("data-language", "zh");
		} else this.removeAttribute("data-language");
	}
	_loadText() {
		let e = this.text || this._slotKey;
		if (!e) this._text = "", this._updateLanguageAttribute();
		else if (this.literal) this._text = e, this._updateLanguageAttribute();
		else {
			try {
				let t = G(e);
				this._text = t || e;
			} catch (t) {
				console.error("Error loading text for key:", e, t), this._text = e;
			}
			this._updateLanguageAttribute();
		}
	}
	render() {
		return this.literal && !this.text ? M`<slot></slot>` : M`<span>${this._text || this.text || this._slotKey}</span>`;
	}
});
//#endregion
//#region src/vendor/ds1/0-face/text-contrast.ts
var pr = [
	0,
	0,
	0,
	0
], mr = (e, t) => {
	let n = (e) => e.slice(0, 3).map((e) => e <= .04045 ? e / 12.92 : ((e + .055) / 1.055) ** 2.4).reduce((e, t, n) => e + t * [
		.2126,
		.7152,
		.0722
	][n], 0), [r, i] = [n(e), n(t)].sort((e, t) => t - e);
	return (r + .05) / (i + .05);
};
function hr(e, t) {
	let n = e[3] + t[3] * (1 - e[3]);
	return n ? [...[
		0,
		1,
		2
	].map((r) => (e[r] * e[3] + t[r] * t[3] * (1 - e[3])) / n), n] : [...pr];
}
function gr(e) {
	return e.assignedSlot ?? e.parentElement ?? e.getRootNode().host ?? null;
}
function _r(e) {
	let t = /* @__PURE__ */ new Map(), n;
	return (r) => {
		if (t.has(r)) return t.get(r);
		let i = null;
		r === "transparent" && (i = [...pr]);
		let a = /^rgba?\(([^)]+)\)$/.exec(r);
		if (a) {
			let e = a[1].split(/[\s,/]+/).filter(Boolean);
			e.length >= 3 && (i = [...e.slice(0, 3).map((e) => parseFloat(e) / (e.endsWith("%") ? 100 : 255)), e[3] ? parseFloat(e[3]) / (e[3].endsWith("%") ? 100 : 1) : 1]);
		} else r && e.defaultView?.CSS.supports("color", r) && (n ??= e.createElement("canvas").getContext("2d", { willReadFrequently: !0 }), n && (n.clearRect(0, 0, 1, 1), n.fillStyle = r, n.fillRect(0, 0, 1, 1), i = Array.from(n.getImageData(0, 0, 1, 1).data, (e) => e / 255)));
		return t.set(r, i), i;
	};
}
//#endregion
//#region src/vendor/ds1/0-face/choice-contrast.ts
var vr = class {
	host;
	controls;
	observer;
	frame = 0;
	constructor(e, t) {
		this.host = e, this.controls = t;
	}
	queue = () => {
		let e = this.host.ownerDocument.defaultView;
		this.frame ||= e.requestAnimationFrame(() => {
			this.frame = 0, this.resolve();
		});
	};
	connect() {
		if (this.observer) return;
		let e = this.host.ownerDocument.defaultView;
		this.observer = new e.MutationObserver(this.queue);
		for (let e = this.host; e; e = gr(e)) this.observer.observe(e, {
			attributes: !0,
			attributeFilter: [
				"class",
				"style",
				"data-theme",
				"theme"
			]
		});
		e.addEventListener("load", this.queue, !0);
	}
	disconnect() {
		this.observer?.disconnect(), this.observer = void 0;
		let e = this.host.ownerDocument.defaultView;
		e.cancelAnimationFrame(this.frame), this.frame = 0, e.removeEventListener("load", this.queue, !0);
	}
	resolve() {
		let e = this.host.ownerDocument.defaultView, t = _r(this.host.ownerDocument);
		for (let n of this.controls()) {
			n.style.removeProperty("--_ds-choice-ink");
			let r = [
				0,
				0,
				0,
				0
			];
			for (let i = n; i && r[3] < 1; i = gr(i)) {
				let n = t(e.getComputedStyle(i).backgroundColor);
				n && (r = hr(r, n));
			}
			if (r[3] < 1) continue;
			let i = t(e.getComputedStyle(n).color);
			i && mr(hr(i, r), r) >= 4.5 || n.style.setProperty("--_ds-choice-ink", mr([
				0,
				0,
				0,
				1
			], r) >= mr([
				1,
				1,
				1,
				1
			], r) ? "#000000" : "#ffffff");
		}
	}
}, yr = class extends R {
	static properties = { disabled: {
		type: Boolean,
		reflect: !0,
		noAccessor: !0
	} };
	#e = !1;
	#t;
	get hostControl() {
		return !0;
	}
	syncControl() {
		this.isConnected && this.#n();
	}
	get disabled() {
		return this.#e;
	}
	set disabled(e) {
		let t = this.#e;
		this.#e = !!e, this.isConnected && this.#n(), this.requestUpdate("disabled", t);
	}
	constructor() {
		super(), this.addEventListener("keydown", this.#i), this.addEventListener("keyup", this.#a), this.addEventListener("click", this.#r, { capture: !0 });
	}
	connectedCallback() {
		super.connectedCallback(), this.hostControl && !this.hasAttribute("role") && this.setAttribute("role", "button"), this.#n();
	}
	#n() {
		this.toggleAttribute("disabled", this.#e), this.hostControl && (this.hasAttribute("role") || this.setAttribute("role", "button"), this.#e ? (this.#t === void 0 && (this.#t = this.getAttribute("tabindex")), this.setAttribute("aria-disabled", "true"), this.setAttribute("tabindex", "-1")) : (this.removeAttribute("aria-disabled"), this.#t === void 0 ? this.hasAttribute("tabindex") || this.setAttribute("tabindex", "0") : (this.#t === null ? this.setAttribute("tabindex", "0") : this.setAttribute("tabindex", this.#t), this.#t = void 0)));
	}
	#r = (e) => {
		this.disabled && (e.preventDefault(), e.stopImmediatePropagation());
	};
	#i = (e) => {
		this.hostControl && !this.disabled && e.target === this && (e.key === "Enter" ? (e.preventDefault(), this.click()) : e.key === " " && e.preventDefault());
	};
	#a = (e) => {
		this.hostControl && !this.disabled && e.target === this && e.key === " " && (e.preventDefault(), this.click());
	};
}, br = "[data-ds-shape=square],:host([data-ds-shape=square]){--ds-corner-size:0px;--ds-corner-shape:round;--ds-button-inset:.5px}[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:4px;--ds-corner-shape:round;--ds-button-inset:2.5px}[data-ds-shape=circular],:host([data-ds-shape=circular]){--ds-corner-size:999px;--ds-corner-shape:round;--ds-button-inset:5px}@supports (corner-shape:squircle){[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:8px;--ds-corner-shape:squircle}}:root,:host,:where([data-ds-surface]){--ds-unit:calc(var(--ds-1,20px) * var(--ds-sf,1));--ds-control-height:calc(var(--ds-control-size,var(--ds-08,16px)) * var(--ds-sf,1));--ds-row-height:calc(var(--ds-row-size,var(--ds-1,20px)) * var(--ds-sf,1));--ds-type-size-default:calc(var(--ds-text-size,14px) * var(--ds-sf,1));--ds-type-size-small:calc(var(--ds-small-text-size,10px) * var(--ds-sf,1));--ds-type-size-heading:calc(var(--ds-heading-text-size,13px) * var(--ds-sf,1));--ds-type-size-display:calc(var(--ds-display-text-size,20px) * var(--ds-sf,1));--ds-type-lineheight-default:calc(var(--ds-text-leading,16px) * var(--ds-sf,1));--ds-type-letterspacing-default:calc(var(--ds-text-tracking,-.3px) * var(--ds-sf,1));--ds-radius:calc(var(--ds-corner-size,4px) * var(--ds-sf,1));--ds-radius-card:calc(var(--ds-card-corner-size,4px) * var(--ds-sf,1))}:host([control=host]),:host([control=slotted]) ::slotted(:is(button,a)){box-sizing:border-box!important;align-items:center!important;justify-content:var(--ds-button-align,flex-start)!important;gap:var(--ds-button-gap,calc(4px * var(--ds-sf)))!important;min-width:0!important;max-width:100%!important;height:var(--ds-button-height,var(--_button-height,var(--ds-control-height)))!important;padding:var(--ds-button-padding,0)!important;border-radius:var(--_button-radius,var(--ds-radius))!important;corner-shape:var(--ds-corner-shape,round)!important;background:var(--ds-button-background,transparent)!important;color:var(--ds-button-color,var(--ds-button-text-color))!important;font-family:\"Inter Arrows\", var(--ds-typeface-regular)!important;font-feature-settings:var(--ds-font-features)!important;font-size:var(--_button-font-size,var(--ds-type-size-default))!important;font-weight:var(--ds-type-weight-default)!important;line-height:var(--ds-type-lineheight-default)!important;letter-spacing:var(--ds-type-letterspacing-default)!important;white-space:nowrap!important;cursor:pointer!important;-webkit-user-select:none!important;user-select:none!important;-webkit-tap-highlight-color:transparent!important;outline:none!important;transition:opacity .12s!important;display:inline-flex!important}:host([control=host]) ::slotted(*){flex:none!important}:host([fit][control=slotted]) ::slotted(:is(button,a)){width:100%!important;min-width:var(--ds-button-min-width,0px)!important;justify-content:var(--ds-button-align,flex-start)!important}:host([control=host][primary]),:host([control=slotted][primary]){--ds-button-padding:0 var(--_button-padding,calc(var(--ds-button-inset,4px) * var(--ds-sf)));--ds-button-background:var(--ds-button-primary-fill,var(--ds-button-background-color-primary));--ds-button-color:var(--ds-button-primary-text,var(--ds-button-text-color-on-accent))}:host([control=host][secondary]),:host([control=slotted][secondary]){--ds-button-padding:0 var(--_button-padding,calc(var(--ds-button-inset,4px) * var(--ds-sf)));--ds-button-background:var(--ds-button-secondary-fill,var(--ds-button-background-color-secondary))}:host([control=host][secondary]:hover:not([disabled])),:host([control=slotted][secondary]:hover:not([disabled])){--ds-button-background:var(--ds-fill-hover)}:host([control=host][active]),:host([control=slotted][active]){--ds-button-background:var(--ds-fill)}:host([control=host][role=tab]),:host([control=host][choice]),:host([control=slotted][choice]){--ds-button-padding:0 calc(4px * var(--ds-sf));--ds-button-color:var(--ds-text-color-muted)}:host([control=host][role=tab]:hover:not([disabled])),:host([control=host][choice]:hover:not([disabled])),:host([control=slotted][choice]:hover:not([disabled])){--ds-button-background:color-mix(in srgb, var(--ds-fill) 72%, transparent);--ds-button-color:var(--ds-text-color)}:host([control=host][role=tab][active]),:host([control=host][role=tab][active]:hover:not([disabled])),:host([control=host][choice][active]),:host([control=host][choice][active]:hover:not([disabled])),:host([control=slotted][choice][active]),:host([control=slotted][choice][active]:hover:not([disabled])){--ds-button-background:var(--ds-fill);--ds-button-color:var(--ds-text-color)}:host([control=host]) ::slotted([slot=icon]){width:var(--ds-control-height)!important;height:var(--ds-control-height)!important;justify-content:center!important;align-items:center!important;display:inline-flex!important}:host([control=host]) ::slotted([slot=trailing]){color:var(--ds-text-color-muted)!important;font-variant-numeric:tabular-nums!important}:host([control=host][icon]),:host([control=slotted][icon]){width:var(--ds-button-height,var(--ds-control-height))!important;height:var(--ds-button-height,var(--ds-control-height))!important;color:var(--ds-button-color,var(--ds-text-color-muted))!important;justify-content:center!important;padding:0!important}:host([control=host][icon]:hover:not([disabled])){--ds-button-color:var(--ds-text-color)}:host([control=host][role=option]),:host([control=host][role=menuitem]),:host([control=host][role=menuitemradio]),:host([control=host][role=menuitemcheckbox]){--ds-button-height:auto;--ds-button-padding:calc(4px * var(--ds-sf)) calc(6px * var(--ds-sf));width:var(--ds-button-width,100%)!important;min-height:var(--ds-row-height)!important;border-radius:var(--ds-radius)!important}:host([control=host][role=option]:hover),:host([control=host][role=menuitem]:hover),:host([control=host][role=menuitemradio]:hover),:host([control=host][role=menuitemcheckbox]:hover),:host([control=host][role=option]:focus-visible),:host([control=host][role=menuitem]:focus-visible){--ds-button-background:var(--ds-fill);outline:none!important}:host([control=host][role=option][active]){--ds-button-background:var(--ds-fill)}:host([control=host]:focus-visible),:host([control=slotted]) ::slotted(:is(button,a):focus-visible){outline:2px solid var(--ds-focus-ring)!important;outline-offset:1px!important}:host([control=host][disabled]),:host([control=slotted]) ::slotted(:is(button:disabled,a[aria-disabled=true])){cursor:default!important;opacity:.5!important;pointer-events:none!important}:host([control=slotted]) ::slotted(:is(button,a)){appearance:none!important;box-sizing:border-box!important;width:100%!important;min-height:var(--ds-button-height,var(--_button-height,var(--ds-control-height)))!important;max-height:var(--ds-button-height,var(--_button-height,var(--ds-control-height)))!important;box-shadow:none!important;text-align:start!important;text-transform:none!important;text-overflow:clip!important;border:0!important;margin:0!important;text-decoration:none!important;overflow:hidden!important}:host([control=slotted][icon]) ::slotted(:is(button,a)){justify-content:center!important}:host([control=slotted]){min-height:var(--ds-row-height);vertical-align:bottom;width:var(--ds-button-width,var(--_button-inline-size,max-content));align-items:flex-end;overflow:visible}:host([control=slotted][icon]){width:max(var(--ds-row-height), var(--ds-button-height,var(--ds-control-height)))!important;height:max(var(--ds-row-height), var(--ds-button-height,var(--ds-control-height)))!important;justify-content:flex-start!important}:host([control=slotted][icon]) ::slotted(:is(button,a)){width:var(--ds-button-height,var(--ds-control-height))!important}:host([control=slotted][fixed]){width:var(--ds-button-width,calc(4 * var(--ds-unit)))}:host([control=slotted][wide]){width:var(--ds-button-width,calc(8 * var(--ds-unit)))}:host([control=slotted][fit]){width:max-content}:host([control=host][danger]),:host([control=slotted][danger]){--ds-button-color:var(--ds-danger-color,var(--ds-tuned-red))}:host([hidden]){display:none!important}:host([menu-item]){--ds-button-height:var(--ds-row-height);--ds-button-align:flex-start;--ds-button-padding:0 calc(4px * var(--ds-sf));flex:none;width:100%}:host([menu-item][control=host]),:host([menu-item][control=slotted]) ::slotted(:is(button,a)){align-items:flex-end!important}:host([menu-item]:is(:hover,:focus-within):not([disabled])){--ds-button-background:var(--ds-fill)}:host([menu-item][control=slotted]) ::slotted([aria-checked=true]){box-shadow:inset 0 0 0 1px var(--ds-focus-ring)!important}:host([control=host][paper]),:host([control=slotted][paper]) ::slotted(:is(button,a)){border-start-start-radius:var(--ds-radius)!important;border-start-end-radius:var(--ds-radius)!important;border-end-end-radius:0!important;border-end-start-radius:0!important;align-items:flex-end!important}:host([control=host][segment]){border-radius:0!important}:host([control=host]:is([segment=first],[segment=only])){border-start-start-radius:var(--ds-radius)!important;border-end-start-radius:var(--ds-radius)!important}:host([control=host]:is([segment=last],[segment=only])){border-start-end-radius:var(--ds-radius)!important;border-end-end-radius:var(--ds-radius)!important}:host([control=host]:not([icon]):not([split]):not([menu-item])){min-width:var(--ds-button-min-width,max-content)!important;min-width:var(--ds-button-min-width,calc-size(max-content, round(up, size, var(--ds-unit))))!important}:host([control=slotted]) ::slotted(:is(button,a)){min-width:max-content!important;overflow:visible!important}", xr = ":host{vertical-align:bottom;min-width:0;width:var(--ds-button-width,var(--_button-inline-size,max-content));--_button-size:var(--ds-button-size);--_button-height:calc(var(--_button-size) * var(--ds-sf));--_button-corner-size:var(--ds-button-corner-size);--_button-radius:calc(var(--_button-corner-size) * var(--ds-sf));--_button-text-size:var(--ds-button-text-size);--_button-font-size:calc(var(--_button-text-size) * var(--ds-sf));--_button-padding-size:var(--ds-button-padding-size);--_button-padding:calc(var(--_button-padding-size) * var(--ds-sf));--_button-inline-size:var(--ds-button-inline-size);flex:none;max-width:100%;display:inline-flex;overflow:visible}:host(:is([icon],[square],[split],[menu-item],[role=option],[role^=menuitem],[role=tab],[choice],[segment],[paper])){--_button-height:initial;--_button-radius:initial;--_button-font-size:initial;--_button-padding:initial;--_button-inline-size:initial}:host([fixed]){width:var(--ds-button-width,calc(4 * var(--ds-unit)))}:host([wide]){width:var(--ds-button-width,calc(8 * var(--ds-unit)))}:host([fit]){flex:none;width:max-content}:host([fit]) :is(button,a){width:100%;min-width:var(--ds-button-min-width,0px);justify-content:var(--ds-button-align,flex-start);flex:none}:host([fit]) :is(button,a) ds-text,:host([fit]) :is(button,a) ::slotted(*){flex:none;width:max-content}:is(button,a){box-sizing:border-box;max-height:var(--_button-height,var(--ds-control-height));height:var(--_button-height,var(--ds-control-height));min-height:var(--_button-height,var(--ds-control-height));border-radius:var(--_button-radius,var(--ds-radius));corner-shape:var(--ds-corner-shape,round);cursor:pointer;width:100%;min-width:0;max-width:100%;padding:var(--ds-text-tab-padding,0);color:var(--button-color,var(--button-text-color));font-family:\"Inter Arrows\", var(--ds-typeface-regular);font-size:var(--_button-font-size,var(--ds-type-size-default));line-height:var(--ds-type-lineheight-default);letter-spacing:var(--ds-type-letterspacing-default);-webkit-tap-highlight-color:transparent;white-space:nowrap;text-overflow:clip;background-color:#0000;border:none;justify-content:flex-start;align-items:center;text-decoration:none;display:inline-flex;overflow:clip visible}:is(button,a) ds-text,:is(button,a) ::slotted(*){text-overflow:clip;white-space:nowrap;text-align:left;max-width:100%;color:inherit;justify-content:flex-start;overflow:clip visible}:is(button,a) ds-text{--ds-type-size-default:var(--_button-font-size,calc(var(--ds-text-size,14px) * var(--ds-sf,1)))}:is(button,a)[primary]{background-color:var(--ds-button-primary-fill,var(--accent-color));color:var(--ds-button-primary-text,var(--button-text-color-on-light,var(--black)));font-family:\"Inter Arrows\", var(--ds-typeface-regular);padding:0 var(--_button-padding,calc(var(--ds-button-inset,4px) * var(--ds-sf)));text-decoration-line:none}:is(button,a)[secondary]{background-color:var(--ds-button-secondary-fill,var(--button-background-color-secondary));color:var(--ds-button-color,var(--ds-button-text-color));font-family:\"Inter Arrows\", var(--ds-typeface-regular);padding:0 var(--_button-padding,calc(var(--ds-button-inset,4px) * var(--ds-sf)))}:host(:is([menu-item],[role=option],[role^=menuitem])) :is(button,a){height:var(--ds-button-height,var(--ds-row-height));min-height:var(--ds-button-height,var(--ds-row-height));max-height:var(--ds-button-height,var(--ds-row-height));align-items:flex-end;justify-content:var(--ds-button-align,flex-start);padding:0 calc(var(--ds-button-inset,4px) * var(--ds-sf))}:host([danger]) :is(button,a){color:var(--ds-danger-color,var(--ds-tuned-red))}:is(button:disabled,a[aria-disabled=true]){cursor:default;opacity:.5}.loading{opacity:.7}:host([icon]){width:var(--ds-control-height);height:var(--ds-control-height);flex:none}:host([icon]) :is(button,a){width:var(--ds-control-height);justify-content:center;padding:0!important}:host([icon]) ::slotted(ds-icon){width:var(--ds-control-height);height:var(--ds-control-height);flex:none}:host([square]){width:var(--ds-control-height);flex:none}:host([square]) :is(button,a){width:var(--ds-control-height);justify-content:center;padding:0!important}:host(:is([primary],[secondary]):not([icon])) ::slotted(ds-icon:nth-last-child(1 of :not(.c9y-native-text)):not(:nth-child(1 of :not(.c9y-native-text)))){margin-inline-end:calc(-4px * var(--ds-sf))}:host(:is([primary],[secondary]):not([icon])) ::slotted(ds-icon:nth-child(1 of :not(.c9y-native-text)):not(:nth-last-child(1 of :not(.c9y-native-text)))){margin-inline-start:calc(-4px * var(--ds-sf))}:host([paper]) :is(button,a){height:var(--ds-row-height);min-height:var(--ds-row-height);max-height:var(--ds-row-height);padding:0 calc(10px * var(--ds-sf));border-radius:var(--ds-radius) var(--ds-radius) 0 0;background-color:var(--ds-button-background,transparent);color:var(--ds-button-color,var(--button-text-color));align-items:flex-end}:host([segment]) :is(button,a){border-radius:0!important}:host(:is([segment=first],[segment=only])) :is(button,a){border-start-start-radius:var(--ds-radius)!important;border-end-start-radius:var(--ds-radius)!important}:host(:is([segment=last],[segment=only])) :is(button,a){border-start-end-radius:var(--ds-radius)!important;border-end-end-radius:var(--ds-radius)!important}:host(:not([icon]):not([split]):not([menu-item])){min-width:max-content;min-width:calc-size(max-content, round(up, size, var(--ds-unit)))}:host(:not([menu-item])) :is(button,a),:host(:not([menu-item])) :is(button,a) ds-text,:host(:not([menu-item])) :is(button,a) ::slotted(*){text-overflow:clip;overflow:visible;mask-image:none}:host([segment][active]) :is(button,a){color:var(--_ds-choice-ink,var(--ds-button-color,var(--button-text-color)))}", Y = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, Sr = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), Cr = class {
	constructor(e) {}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AT(e, t, n) {
		this._$Ct = e, this._$AM = t, this._$Ci = n;
	}
	_$AS(e, t) {
		return this.update(e, t);
	}
	update(e, t) {
		return this.render(...t);
	}
}, wr = class extends Cr {
	constructor(e) {
		if (super(e), this.it = P, e.type !== Y.CHILD) throw Error(this.constructor.directiveName + "() can only be used in child bindings");
	}
	render(e) {
		if (e === P || e == null) return this._t = void 0, this.it = e;
		if (e === N) return e;
		if (typeof e != "string") throw Error(this.constructor.directiveName + "() called with a non-string value");
		if (e === this.it) return this._t;
		this.it = e;
		let t = [e];
		return t.raw = t, this._t = {
			_$litType$: this.constructor.resultType,
			strings: t,
			values: []
		};
	}
};
wr.directiveName = "unsafeHTML", wr.resultType = 1;
var Tr = Sr(wr), Er = ":host{--ds-icon-box:calc(var(--ds-icon-size,14px) * var(--ds-sf));width:var(--ds-icon-box);height:calc(var(--ds-icon-box) / var(--ds-icon-ratio,1));color:var(--ds-icon-color,currentColor);background:0 0;flex:none;justify-content:center;align-items:center;display:inline-flex}:host([hidden]){display:none!important}:host([size=small]){--ds-icon-size:12px}:host([size=large]){--ds-icon-size:16px}:host([variant=primary]){color:var(--ds-button-text-color-on-accent);background:var(--ds-accent-color)}:host([variant=secondary]){background:var(--ds-fill)}svg,::slotted(svg),::slotted(img){width:100%;height:100%;display:block}::slotted(img){object-fit:contain;border-radius:var(--ds-icon-radius,0px)}:host([size=app]){--ds-icon-size:40px}:host([size=app-large]){--ds-icon-size:60px}", Dr = {
	app: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<rect x=\"4.5\" y=\"2.5\" width=\"7\" height=\"11\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n<path d=\"M6.5 11.5H9.5\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n</svg>",
	apple: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M12.0351 10.793C11.8838 11.1424 11.7048 11.464 11.4974 11.7597C11.2147 12.1627 10.9832 12.4418 10.8048 12.5967C10.5283 12.851 10.232 12.9812 9.91475 12.9886C9.68698 12.9886 9.41229 12.9238 9.09255 12.7924C8.77176 12.6615 8.47695 12.5967 8.20739 12.5967C7.92469 12.5967 7.62148 12.6615 7.29717 12.7924C6.97237 12.9238 6.71071 12.9924 6.51065 12.9991C6.2064 13.0121 5.90314 12.8782 5.60044 12.5967C5.40723 12.4282 5.16557 12.1393 4.87607 11.73C4.56547 11.293 4.3101 10.7862 4.11005 10.2085C3.8958 9.58443 3.78839 8.98013 3.78839 8.39508C3.78839 7.72492 3.9332 7.14691 4.22325 6.66254C4.45121 6.27348 4.75447 5.96658 5.13403 5.74128C5.51359 5.51597 5.9237 5.40116 6.36535 5.39382C6.60701 5.39382 6.92391 5.46857 7.31773 5.61548C7.71043 5.76288 7.96259 5.83763 8.07314 5.83763C8.15579 5.83763 8.4359 5.75023 8.91077 5.57597C9.35983 5.41437 9.73883 5.34746 10.0493 5.37382C10.8906 5.44172 11.5227 5.77337 11.9431 6.37089C11.1906 6.8268 10.8184 7.46536 10.8258 8.28453C10.8326 8.9226 11.0641 9.45357 11.519 9.87516C11.7252 10.0708 11.9554 10.2221 12.2116 10.3295C12.156 10.4906 12.0974 10.6449 12.0351 10.793ZM10.1055 3.20006C10.1055 3.70017 9.92277 4.16713 9.55859 4.59933C9.11909 5.11315 8.5875 5.41005 8.01104 5.3632C8.0037 5.3032 7.99944 5.24006 7.99944 5.1737C7.99944 4.69359 8.20844 4.17978 8.5796 3.75967C8.76491 3.54696 9.00058 3.37009 9.28637 3.22901C9.57155 3.09002 9.84129 3.01316 10.095 3C10.1024 3.06686 10.1055 3.13372 10.1055 3.20006Z\" fill=\"currentColor\"/>\n</svg>",
	archive: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M2.5 3.5H13.5V5.5H12.5V12.5H3.5V5.5H2.5Z\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n<path d=\"M6.5 8.5H9.5\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n</svg>",
	bag: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<rect x=\"2.5\" y=\"5.5\" width=\"11\" height=\"8\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n<path d=\"M5.5 7.5V4.5C5.5 3.12 6.62 2 8 2C9.38 2 10.5 3.12 10.5 4.5V7.5\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n</svg>",
	calendar: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<rect x=\"3.5\" y=\"4.5\" width=\"9\" height=\"8\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n<path d=\"M3.5 6.5H12.5\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n<path d=\"M5.5 3.5V5.5M10.5 3.5V5.5\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n<path d=\"M5.5 8.5H9.5M5.5 10.5H9.5\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n</svg>",
	camera: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M2.5 12.5V4.5H5.5L6.5 3.5H9.5L10.5 4.5H13.5V12.5Z\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n<circle cx=\"8\" cy=\"8.5\" r=\"2\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n<rect x=\"11\" y=\"6\" width=\"1\" height=\"1\" fill=\"currentColor\"/>\n</svg>",
	check: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M6.68649 11.884L12.443 6.13601L11.736 5.42715L6.68835 10.4827L4.26399 8.0501L3.55696 8.74525L6.68649 11.884Z\" fill=\"currentColor\"/>\n</svg>",
	close: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M12.1215 4.58087L8.70453 7.99397L12.1176 11.4169L11.4106 12.112L7.99847 8.69108L4.58636 12.112L3.87836 11.4031L7.29535 7.99005L3.88226 4.56716L4.58929 3.87201L8.0014 7.29294L11.4145 3.87201L12.1215 4.58087Z\" fill=\"currentColor\"/>\n</svg>",
	collapse: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 12 12\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M2 4L6 8L10 4\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg></svg>",
	compose: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M8 2.5H2.5V13.5H13.5V8\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n<path d=\"M6.5 9.5V8L12 2.5L13.5 4L8 9.5H6.5Z\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n</svg>",
	delete: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 12 14\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M1 3H11M4.5 3V1.5H7.5V3M2.5 3V12.5C2.5 13.0523 2.94772 13.5 3.5 13.5H8.5C9.05228 13.5 9.5 13.0523 9.5 12.5V3\" stroke=\"currentColor\" stroke-width=\"1.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/>\n<line x1=\"4.5\" y1=\"5.5\" x2=\"4.5\" y2=\"11\" stroke=\"currentColor\" stroke-width=\"1.2\" stroke-linecap=\"round\"/>\n<line x1=\"7.5\" y1=\"5.5\" x2=\"7.5\" y2=\"11\" stroke=\"currentColor\" stroke-width=\"1.2\" stroke-linecap=\"round\"/>\n</svg></svg>",
	down: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\">\n  <path d=\"M7.49645 12.5178V2.86102e-06H8.50702L8.50841 12.5174L11.4156 9.61018L12.1095 10.317L8.00173 14.4248L3.8905 10.3135L4.59784 9.60619L7.49645 12.5178Z\" fill=\"currentColor\"/>\n</svg>",
	duplicate: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\">\n<g id=\"Icons\">\n<g id=\"Duplicate\">\n<path id=\"âD\" d=\"M2.41924 3.49777C2.08493 3.49777 1.78024 3.57818 1.50517 3.73898C1.23434 3.90402 1.0164 4.12196 0.851364 4.39279C0.690557 4.66786 0.610153 4.97254 0.610153 5.30685C0.610153 5.63693 0.690557 5.93739 0.851364 6.20822C1.0164 6.47905 1.23434 6.69276 1.50517 6.84933C1.78024 7.01014 2.08493 7.09055 2.41924 7.09055H7.82109C8.15117 7.09055 8.45374 7.01014 8.72881 6.84933C9.00387 6.69276 9.22181 6.47905 9.38261 6.20822C9.54342 5.93739 9.62383 5.63693 9.62383 5.30685C9.62383 4.97254 9.54342 4.66786 9.38261 4.39279C9.22181 4.12196 9.00387 3.90402 8.72881 3.73898C8.45374 3.57818 8.15117 3.49777 7.82109 3.49777C7.49101 3.49777 7.18844 3.57818 6.91338 3.73898C6.64254 3.90402 6.42461 4.12196 6.25957 4.39279C6.09876 4.66786 6.01836 4.97254 6.01836 5.30685V10.677C6.01836 11.007 6.09876 11.3096 6.25957 11.5847C6.42461 11.8598 6.64254 12.0777 6.91338 12.2385C7.18844 12.4035 7.49101 12.4861 7.82109 12.4861C8.15117 12.4861 8.45374 12.4035 8.72881 12.2385C9.00387 12.0777 9.22181 11.8598 9.38261 11.5847C9.54342 11.3096 9.62383 11.007 9.62383 10.677C9.62383 10.3427 9.54342 10.0401 9.38261 9.76926C9.22181 9.49842 9.00387 9.2826 8.72881 9.1218C8.45374 8.96522 8.15117 8.88693 7.82109 8.88693H3.7205C3.58086 8.88693 3.46237 8.9356 3.36504 9.03293C3.26771 9.13026 3.21904 9.24663 3.21904 9.38205C3.21904 9.5217 3.26771 9.64019 3.36504 9.73752C3.46237 9.83485 3.58086 9.88351 3.7205 9.88351H7.80205C8.02633 9.88351 8.21676 9.95969 8.37334 10.112C8.52991 10.2686 8.6082 10.4569 8.6082 10.677C8.6082 10.897 8.52991 11.0832 8.37334 11.2356C8.22099 11.3921 8.03691 11.4704 7.82109 11.4704C7.60527 11.4704 7.41907 11.3921 7.2625 11.2356C7.10592 11.079 7.02763 10.8864 7.02763 10.6579V5.31955C7.02763 5.09527 7.10592 4.90484 7.2625 4.74826C7.41907 4.59168 7.60527 4.5134 7.82109 4.5134C8.03691 4.5134 8.22099 4.58957 8.37334 4.74191C8.52991 4.89849 8.6082 5.0868 8.6082 5.30685C8.6082 5.52691 8.52991 5.71522 8.37334 5.8718C8.21676 6.02837 8.02633 6.10666 7.80205 6.10666H2.43828C2.21399 6.10666 2.02145 6.02837 1.86064 5.8718C1.70407 5.71522 1.62578 5.52691 1.62578 5.30685C1.62578 5.0868 1.70195 4.89849 1.85429 4.74191C2.01087 4.58957 2.19918 4.5134 2.41924 4.5134C2.63082 4.5134 2.81491 4.59168 2.97148 4.74826C3.12806 4.90907 3.20634 5.0995 3.20634 5.31955V10.6579C3.20634 10.8864 3.12806 11.079 2.97148 11.2356C2.81491 11.3921 2.63082 11.4704 2.41924 11.4704C2.19918 11.4704 2.01087 11.3921 1.85429 11.2356C1.70195 11.0832 1.62578 10.897 1.62578 10.677C1.62578 10.4569 1.70407 10.2686 1.86064 10.112C2.02145 9.95969 2.21399 9.88351 2.43828 9.88351H3.7205C3.85169 9.88351 3.96595 9.83485 4.06328 9.73752C4.16061 9.64019 4.20927 9.5217 4.20927 9.38205C4.20927 9.24663 4.16061 9.13026 4.06328 9.03293C3.96595 8.9356 3.85169 8.88693 3.7205 8.88693H2.41924C2.08493 8.88693 1.78024 8.96522 1.50517 9.1218C1.23434 9.2826 1.0164 9.49842 0.851364 9.76926C0.690557 10.0401 0.610153 10.3427 0.610153 10.677C0.610153 11.007 0.690557 11.3096 0.851364 11.5847C1.0164 11.8598 1.23434 12.0777 1.50517 12.2385C1.78024 12.4035 2.08493 12.4861 2.41924 12.4861C2.74931 12.4861 3.04977 12.4035 3.3206 12.2385C3.59567 12.0777 3.8136 11.8598 3.97441 11.5847C4.13945 11.3096 4.22197 11.007 4.22197 10.677V5.30685C4.22197 4.97254 4.13945 4.66786 3.97441 4.39279C3.8136 4.12196 3.59567 3.90402 3.3206 3.73898C3.04977 3.57818 2.74931 3.49777 2.41924 3.49777Z\" fill=\"currentColor\" />\n<path id=\"âD_2\" d=\"M10.4239 3.37692V12.6069H12.6079C14.4409 12.6069 15.3899 11.4759 15.3899 9.23992V6.89992C15.3899 4.57292 14.4279 3.37692 12.5819 3.37692H10.4239ZM12.4909 4.44292C13.4919 4.44292 13.9469 5.22292 13.9469 6.75692V9.27892C13.9469 10.8389 13.5049 11.5409 12.4909 11.5409H11.8149V4.44292H12.4909Z\" fill=\"currentColor\" />\n</g>\n</g>\n</svg>",
	email: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 11\" fill=\"none\">\n  <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M14.0871 0.989435L0.930906 0.988037L0.930542 11L13.0753 11H14.0871V0.989435ZM7.50709 8.0566L1.94249 2.49201L1.94248 9.98814H13.0753V2.48839L7.50709 8.0566ZM2.85116 2L7.50709 6.65593L12.1515 1.99952L2.85116 2Z\" fill=\"currentColor\"/>\n</svg></svg>",
	expand: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 12 12\" fill=\"none\">\n  <path d=\"M0 5.81415V0H5.80924L5.81842 0.990424H1.70698L11.0089 10.2943L10.9997 6.18585H12V12H6.19076L6.18158 11.0096H10.293L0.99115 1.70573L1.00033 5.81415H0Z\" fill=\"currentColor\"/>\n</svg></svg>",
	folder: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M2.5 13.5V3.5H6.5L8 5.5H13.5V13.5Z\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n</svg>",
	google: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M13.0004 8.11502C13.0004 7.77514 12.9723 7.43342 12.9123 7.09904H8.10071V9.02447H10.8561C10.7418 9.64542 10.3744 10.1948 9.83641 10.5438V11.7932H11.4803C12.4456 10.9223 13.0004 9.63627 13.0004 8.11502Z\" fill=\"#4285F4\"/>\n<path d=\"M8.10074 13.0001C9.47654 13.0001 10.6368 12.5573 11.4821 11.793L9.83829 10.5437C9.38094 10.8487 8.79049 11.0214 8.10259 11.0214C6.77176 11.0214 5.64336 10.1413 5.23849 8.95818H3.54215V10.2461C4.40813 11.9345 6.17195 13.0001 8.10074 13.0001Z\" fill=\"#34A853\"/>\n<path d=\"M5.23681 8.95856C5.02313 8.33756 5.02313 7.66515 5.23681 7.04416V5.75627H3.54234C2.81882 7.1691 2.81863 8.83323 3.54215 10.2461L5.23681 8.95856Z\" fill=\"#FBBC04\"/>\n<path d=\"M8.10074 4.97895C8.82799 4.96793 9.53089 5.23616 10.0576 5.72854L11.514 4.30101C10.5918 3.45222 9.36784 2.98556 8.10074 3.00026C6.17195 3.00026 4.40832 4.06603 3.54234 5.75627L5.23681 7.04416C5.63981 5.85915 6.76989 4.97895 8.10074 4.97895Z\" fill=\"#EA4335\"/>\n</svg>",
	home: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 12 12\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M1 5L6 1L11 5V11H7.5V7.5H4.5V11H1V5Z\" fill=\"currentColor\"/>\n</svg></svg>",
	left: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\">\n  <path d=\"M1.90697 8.60594H15.0636V9.61651L1.90734 9.61791L4.81456 12.5251L4.10774 13.219L0 9.11123L4.11122 5L4.81855 5.70734L1.90697 8.60594Z\" fill=\"currentColor\"/>\n</svg>",
	lists: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M2.5 4H13.5M2.5 8H13.5M2.5 12H13.5\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n</svg>",
	lock: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M8 2.60742C9.53669 2.60746 10.7822 3.85296 10.7822 5.38965V7.64746H11.5996V13.3926H4.40039V7.64746H5.21777V5.38965C5.21779 3.85295 6.4633 2.60744 8 2.60742ZM8 3.62695C7.02663 3.62697 6.23733 4.41628 6.2373 5.38965V7.64746H9.7627V5.38965C9.76267 4.41629 8.97336 3.62699 8 3.62695Z\" fill=\"currentColor\"/>\n</svg>",
	loop: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M12.0037 1.96826L12.0037 7.12486L14.9023 4.21328L15.6096 4.92061L11.4984 9.03184L7.39064 4.92409L8.08449 4.21727L10.9917 7.12449L10.9931 2.98673L5.00853 3.00323V1.98475L12.0037 1.96826Z\" fill=\"currentColor\"/>\n<path d=\"M3.99657 14.0318L3.99657 8.87523L1.09796 11.7868L0.390625 11.0795L4.50185 6.96825L8.6096 11.076L7.91576 11.7828L5.00853 8.8756L5.00714 13.0134L10.9917 12.9972V14.0157L3.99657 14.0318Z\" fill=\"currentColor\"/>\n<path d=\"M10.9917 12.9972V14.0157H12.0037V12.9973V9.85949L10.9917 9.85912V12.9972Z\" fill=\"currentColor\"/>\n<path d=\"M3.99657 5.1225V6.14098H5.00853V5.12251V1.98475L3.99657 1.98438V5.1225Z\" fill=\"currentColor\"/>\n</svg>",
	mic: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 10 14\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<rect x=\"2.5\" y=\"1\" width=\"5\" height=\"7\" rx=\"2.5\" stroke=\"currentColor\" stroke-width=\"1.2\" fill=\"none\"/>\n<path d=\"M1 6C1 8.76142 2.79086 11 5 11C7.20914 11 9 8.76142 9 6\" stroke=\"currentColor\" stroke-width=\"1.2\" fill=\"none\"/>\n<line x1=\"5\" y1=\"11\" x2=\"5\" y2=\"13\" stroke=\"currentColor\" stroke-width=\"1.2\" stroke-linecap=\"round\"/>\n</svg></svg>",
	more: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\"><circle cx=\"4.5\" cy=\"12\" r=\"0.75\" fill=\"currentColor\"/><circle cx=\"8\" cy=\"12\" r=\"0.75\" fill=\"currentColor\"/><circle cx=\"11.5\" cy=\"12\" r=\"0.75\" fill=\"currentColor\"/></svg>",
	note: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M13.9653 3.31348V12.6865H2.03467V3.31348H13.9653ZM3.03467 11.6865H12.9653V4.31348H3.03467V11.6865Z\" fill=\"currentColor\"/>\n<path d=\"M8.00641 7.08004V7.99996H3.71344V7.08004H8.00641ZM9.9527 5.08004V5.99996H3.71344V5.08004H9.9527Z\" fill=\"currentColor\"/>\n</svg>",
	open: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M1.96 7.81289V1.9592H7.80797L7.81721 2.95636H3.67836L13.0422 12.3235L13.033 8.18711H14.04V14.0408H8.19203L8.18279 13.0436H12.3216L2.95776 3.67653L2.967 7.81289H1.96Z\" fill=\"currentColor\"/>\n</svg>",
	pad: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<rect x=\"3.5\" y=\"2.5\" width=\"9\" height=\"11\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n<path d=\"M3.5 5.5H12.5\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n<rect x=\"6\" y=\"8\" width=\"1\" height=\"1\" fill=\"currentColor\"/>\n<rect x=\"9\" y=\"8\" width=\"1\" height=\"1\" fill=\"currentColor\"/>\n<rect x=\"6\" y=\"11\" width=\"1\" height=\"1\" fill=\"currentColor\"/>\n<rect x=\"9\" y=\"11\" width=\"1\" height=\"1\" fill=\"currentColor\"/>\n</svg>",
	pen: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M2.5 13.5L3.5 10.5L11 3L13 5L5.5 12.5Z\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n<path d=\"M9.5 4.5L11.5 6.5\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n</svg>",
	plus: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M8.50235 2.6739L8.4996 7.5035L13.3334 7.51044L13.325 8.50193L8.49328 8.49569L8.49951 13.3274L7.49764 13.3268L7.50039 8.49717L2.66663 8.49024L2.67503 7.49875L7.50672 7.50499L7.50117 2.67261L8.50235 2.6739Z\" fill=\"currentColor\"/>\n</svg>",
	right: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M13.1566 8.60594H0V9.61651L13.1562 9.61791L10.249 12.5251L10.9558 13.219L15.0636 9.11123L10.9524 5L10.245 5.70734L13.1566 8.60594Z\" fill=\"currentColor\"/>\n</svg>",
	sdown: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M8.50361 11.1717L8.50222 2.92134L7.49165 2.92134L7.49165 11.1713L4.58442 8.26409L3.89058 8.97091L7.99833 13.0787L12.1096 8.96744L11.4022 8.2601L8.50361 11.1717Z\" fill=\"currentColor\"/>\n</svg>",
	search: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M9.08545 6.62646C9.08545 5.25128 7.9704 4.13623 6.59521 4.13623C5.22003 4.13623 4.10498 5.25128 4.10498 6.62646C4.10498 8.00165 5.22003 9.1167 6.59521 9.1167C7.9704 9.1167 9.08545 8.00165 9.08545 6.62646ZM10.105 6.62646C10.105 7.39551 9.85647 8.10577 9.43701 8.68408L12.9146 12.1616L12.1929 12.8833L8.72412 9.41455C8.13339 9.86631 7.39632 10.1362 6.59521 10.1362C4.6567 10.1362 3.08545 8.56498 3.08545 6.62646C3.08545 4.68795 4.6567 3.1167 6.59521 3.1167C8.53373 3.1167 10.105 4.68795 10.105 6.62646Z\" fill=\"currentColor\"/>\n</svg>",
	see: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M8.07669 3.70416C10.1007 3.70416 11.795 4.74149 12.9566 5.73248C13.5418 6.23179 14.005 6.72991 14.3218 7.10358C14.4804 7.29069 14.6032 7.44763 14.687 7.55865C14.7289 7.61411 14.7615 7.65861 14.7837 7.68951C14.7947 7.70477 14.8031 7.71711 14.8091 7.72565C14.812 7.72971 14.8143 7.73297 14.8159 7.73541C14.8167 7.73644 14.8174 7.73762 14.8179 7.73834L14.8189 7.73932C14.819 7.73947 14.8195 7.74054 14.4409 8.00006L14.8189 8.25983L14.8179 8.2608C14.8174 8.2616 14.8168 8.26345 14.8159 8.26471C14.8142 8.26716 14.812 8.27042 14.8091 8.27448C14.8031 8.28303 14.7947 8.29531 14.7837 8.31061C14.7615 8.34152 14.7289 8.38597 14.687 8.44147C14.6032 8.5525 14.4805 8.70941 14.3218 8.89655C14.005 9.27021 13.5418 9.76835 12.9566 10.2676C11.795 11.2586 10.1006 12.296 8.07669 12.296C6.05499 12.296 4.32326 11.2606 3.12552 10.2725C2.52184 9.77448 2.04049 9.27717 1.7095 8.90436C1.54374 8.71764 1.4147 8.56095 1.32669 8.45026C1.28274 8.39498 1.24843 8.35111 1.22513 8.32037C1.21356 8.30511 1.20507 8.29275 1.19876 8.28424C1.19566 8.28005 1.19275 8.27694 1.19095 8.27448C1.19016 8.27341 1.18952 8.27227 1.189 8.27155L1.18802 8.27057V8.26959L0.99173 8.00006L1.18802 7.73053V7.72955L1.189 7.72858C1.18953 7.72784 1.19013 7.72676 1.19095 7.72565C1.19276 7.72318 1.19563 7.72011 1.19876 7.71588C1.20506 7.70738 1.21356 7.69502 1.22513 7.67975C1.24842 7.64902 1.28277 7.6051 1.32669 7.54987C1.4147 7.43918 1.54374 7.28248 1.7095 7.09576C2.04048 6.72296 2.52183 6.22565 3.12552 5.7276C4.32326 4.73948 6.05499 3.70417 8.07669 3.70416ZM8.07669 4.62213C6.36481 4.62213 4.83715 5.50531 3.7095 6.43561C3.15087 6.8965 2.70364 7.35865 2.39603 7.70514C2.29735 7.81629 2.21535 7.91722 2.147 8.00006C2.21534 8.08289 2.29738 8.18387 2.39603 8.29498C2.70365 8.64147 3.15087 9.10363 3.7095 9.56451C4.83715 10.4948 6.36481 11.378 8.07669 11.378C9.7862 11.378 11.2738 10.4968 12.3609 9.5694C12.9 9.10949 13.3285 8.64854 13.6216 8.3028C13.7189 8.18799 13.7987 8.0844 13.8648 8.00006C13.7987 7.91573 13.7189 7.81214 13.6216 7.69733C13.3285 7.35158 12.9 6.89064 12.3609 6.43073C11.2738 5.50334 9.78624 4.62213 8.07669 4.62213ZM14.9976 8.00006L14.8199 8.25983L14.4409 8.00006L14.8199 7.7403L14.9976 8.00006Z\" fill=\"currentColor\"/>\n<path d=\"M8.15292 5.66766C9.44109 5.66766 10.4858 6.71157 10.4859 7.99969C10.4859 9.28796 9.44119 10.3327 8.15292 10.3327C6.8648 10.3325 5.82089 9.28786 5.82089 7.99969C5.82106 6.71167 6.8649 5.66783 8.15292 5.66766Z\" fill=\"currentColor\" stroke=\"currentColor\" stroke-width=\"0.81\"/>\n</svg>",
	shared: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<circle cx=\"5\" cy=\"8\" r=\"3.5\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n<clipPath id=\"shared-behind\"><path d=\"M0 0H16V16H0ZM10 8A5 5 0 1 0 0 8A5 5 0 1 0 10 8Z\" clip-rule=\"evenodd\"/></clipPath>\n<circle cx=\"11\" cy=\"8\" r=\"3.5\" stroke=\"currentColor\" stroke-width=\"0.92\" clip-path=\"url(#shared-behind)\"/>\n</svg>",
	star: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M4.38604 13.4L5.77704 9.26605L2.42304 7.01705H6.53104L8.00004 2.58405L9.49504 7.01705H13.577L10.223 9.26605L11.64 13.4L8.00004 10.761L4.38604 13.4Z\" fill=\"currentColor\"/>\n</svg>",
	stats: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M4 7V13M8 3V13M12 5V13\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n</svg>",
	store: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<rect x=\"4\" y=\"4\" width=\"8\" height=\"8\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n<path d=\"M8 4V12M4 8H12\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n</svg>",
	sup: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M7.49658 4.82836L7.49798 13.0787L8.50855 13.0787L8.50855 4.82873L11.4158 7.73596L12.1096 7.02913L8.00187 2.92138L3.89064 7.03261L4.59798 7.73995L7.49658 4.82836Z\" fill=\"currentColor\"/>\n</svg>",
	template: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<rect x=\"3.5\" y=\"2.5\" width=\"9\" height=\"11\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n<path d=\"M5.5 6.5H9.5M5.5 8.5H9.5\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n</svg>",
	unlock: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M10.8617 2.90512C12.3984 2.90512 13.6438 4.15073 13.644 5.68735V7.95688H12.6244V5.68735C12.6243 4.71406 11.835 3.92465 10.8617 3.92465C9.88855 3.92482 9.09917 4.71417 9.09903 5.68735V7.59164H9.81583V13.3377H2.61563V7.59164H8.0795V5.68735C8.07964 4.15084 9.32522 2.90529 10.8617 2.90512ZM3.63516 12.3172H8.79532V8.61118H3.63516V12.3172Z\" fill=\"currentColor\"/>\n</svg>",
	unmic: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 10 14\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<rect x=\"2.5\" y=\"1\" width=\"5\" height=\"7\" rx=\"2.5\" stroke=\"currentColor\" stroke-width=\"1.2\" fill=\"none\"/>\n<path d=\"M1 6C1 8.76142 2.79086 11 5 11C7.20914 11 9 8.76142 9 6\" stroke=\"currentColor\" stroke-width=\"1.2\" fill=\"none\"/>\n<line x1=\"5\" y1=\"11\" x2=\"5\" y2=\"13\" stroke=\"currentColor\" stroke-width=\"1.2\" stroke-linecap=\"round\"/>\n<line x1=\"1\" y1=\"1\" x2=\"9\" y2=\"13\" stroke=\"currentColor\" stroke-width=\"1.2\" stroke-linecap=\"round\"/>\n</svg></svg>",
	unsee: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M12.4541 12.789L13.1743 12.0688L12.6027 11.4967L12.6 11.4994L12.0137 10.9144C11.7332 11.103 11.4336 11.283 11.1164 11.4457L11.4068 11.7363L11.4046 11.7385L12.4541 12.789Z\" fill=\"currentColor\"/>\n<path d=\"M5.96371 6.28857L9.79315 10.1213C10.0642 9.91923 10.2966 9.66816 10.4772 9.38122L6.69735 5.60959C6.41317 5.78931 6.16435 6.0199 5.96371 6.28857Z\" fill=\"currentColor\"/>\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M3.68238 4.00893L3.09583 3.42183L3.79957 2.7181L3.816 2.70167L5.35651 4.24363L6.05746 4.94524L6.712 5.6004L10.4818 9.3738L11.3559 10.2487L12.0181 10.9115L12.6027 11.4967L12.6 11.4994L12.0137 10.9144C11.7332 11.103 11.4336 11.283 11.1164 11.4457L11.4068 11.7363L11.4046 11.7385L11.1136 11.4472L10.4275 10.7604L9.79075 10.1231L5.96207 6.29078L5.08276 5.41064L4.4124 4.73965L3.68238 4.00893ZM12.6382 10.4584C12.7502 10.37 12.8582 10.2812 12.9619 10.1927C13.5472 9.69339 14.0104 9.19525 14.3271 8.82158C14.4858 8.63445 14.6085 8.47754 14.6924 8.36651C14.7343 8.31101 14.7669 8.26656 14.7891 8.23565L14.7965 8.22527L14.8089 8.20741L14.8145 8.19951L14.8213 8.18975C14.8218 8.18905 14.8222 8.18816 14.8225 8.18737L14.8232 8.18584L14.8242 8.18487L15.0029 7.9251L14.8252 7.66533L14.4463 7.9251C14.8248 7.66558 14.8243 7.66451 14.8242 7.66436L14.8232 7.66338L14.8213 7.66045L14.8145 7.65069C14.8085 7.64215 14.8 7.62981 14.7891 7.61455C14.7669 7.58365 14.7343 7.53915 14.6924 7.48369C14.6085 7.37267 14.4858 7.21573 14.3271 7.02862C14.0104 6.65495 13.5472 6.15682 12.9619 5.65752C11.8003 4.66652 10.106 3.6292 8.08203 3.6292C7.38933 3.6292 6.73067 3.75074 6.11587 3.95029L6.86093 4.69373C7.25481 4.60011 7.6629 4.54717 8.08203 4.54717C9.79158 4.54717 11.2792 5.42838 12.3662 6.35576C12.9053 6.81567 13.3338 7.27662 13.627 7.62237C13.7119 7.72259 13.7835 7.81425 13.8443 7.89203L13.8701 7.9251L13.8442 7.95828C13.7834 8.03603 13.7119 8.12766 13.627 8.22783C13.3338 8.57358 12.9053 9.03452 12.3662 9.49444C12.2436 9.599 12.116 9.70298 11.9835 9.80517L12.6382 10.4584ZM5.58478 6.99004L9.09135 10.4996C8.80023 10.6051 8.48611 10.6626 8.15857 10.6626C6.64663 10.6626 5.42096 9.43698 5.42096 7.92504C5.42096 7.59666 5.47878 7.28179 5.58478 6.99004ZM10.371 11.7804L9.65051 11.0593C9.15436 11.2126 8.62958 11.303 8.08203 11.303C6.37015 11.303 4.84249 10.4199 3.71484 9.48955C3.15622 9.02867 2.70899 8.56651 2.40137 8.22002C2.31556 8.12337 2.24231 8.03438 2.17972 7.95834L2.15234 7.9251L2.17972 7.89186C2.24231 7.81582 2.31553 7.72686 2.40137 7.63018C2.70898 7.28369 3.15621 6.82154 3.71484 6.36065C3.93564 6.17849 4.17177 5.99814 4.42162 5.82588L3.76309 5.16678C3.53867 5.32681 3.32756 5.49036 3.13086 5.65264C2.52717 6.15069 2.04582 6.648 1.71484 7.0208C1.54908 7.20752 1.42004 7.36421 1.33203 7.4749C1.28811 7.53014 1.25376 7.57406 1.23047 7.60479C1.22314 7.61446 1.21704 7.62297 1.21196 7.63006L1.2041 7.64092C1.20236 7.64328 1.20069 7.64527 1.19925 7.647L1.19629 7.65069L1.19434 7.65362L1.19336 7.65557L0.99707 7.9251L1.19336 8.19561L1.19434 8.19658L1.19629 8.19951L1.19926 8.20322C1.20071 8.20495 1.20238 8.20695 1.2041 8.20928L1.21195 8.22013C1.21704 8.22723 1.22314 8.23575 1.23047 8.24541C1.25377 8.27615 1.28809 8.32002 1.33203 8.3753C1.42004 8.48598 1.54908 8.64268 1.71484 8.8294C2.04583 9.20221 2.52718 9.69952 3.13086 10.1976C4.3286 11.1857 6.06033 12.221 8.08203 12.221C8.90391 12.221 9.67144 12.0499 10.371 11.7804ZM10.8048 8.62904C10.8644 8.4044 10.8962 8.16843 10.8962 7.92504C10.8962 6.4131 9.6705 5.18743 8.15857 5.18743C7.91309 5.18743 7.67517 5.21974 7.44881 5.28033L10.8048 8.62904ZM9.79315 10.1213L5.96371 6.28857C6.16435 6.0199 6.41317 5.78931 6.69735 5.60959L10.4772 9.38122C10.2966 9.66816 10.0642 9.91923 9.79315 10.1213Z\" fill=\"currentColor\"/>\n</svg>",
	unstar: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M10.1972 12.3545L7.99995 10.7617L4.3857 13.4014L5.7773 9.2666L2.42281 7.01758H4.86031L10.1972 12.3545Z\" fill=\"currentColor\"/>\n<path d=\"M13.039 12.6807L12.3193 13.4014L2.96089 4.03418L3.68062 3.31348L13.039 12.6807Z\" fill=\"currentColor\"/>\n<path d=\"M9.49507 7.01758H13.5771L10.5205 9.06738L7.01363 5.56055L7.99995 2.58496L9.49507 7.01758Z\" fill=\"currentColor\"/>\n</svg>",
	up: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M7.49645 3.48222V16H8.50702L8.50841 3.48259L11.4156 6.38982L12.1095 5.68299L8.00173 1.57524L3.8905 5.68647L4.59784 6.39381L7.49645 3.48222Z\" fill=\"currentColor\"/>\n</svg>",
	views: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<circle cx=\"7\" cy=\"7\" r=\"4.5\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n<path d=\"M10.2 10.2L13.5 13.5\" stroke=\"currentColor\" stroke-width=\"0.92\"/>\n</svg>"
}, Or = /* @__PURE__ */ "1x.1xdots.1xgrid.1xlines.2x.2xdots.2xgrid.2xgrid-alt.2xgrid-alt-2.2xgrid-alt-3.2xlines.4x4.airtable.android.app-airtable.app-asana.app-chatgpt.app-claude.app-confluence.app-dropbox.app-figma.app-gmail.app-google-calendar.app-google-drive.app-google-sheets.app-jira.app-notion.app-outlook.app-slack.archive-alt.arrange-archive.arrange-check.arrange-chevron.arrange-connect.arrange-draft.arrange-dropdown.arrange-home.arrange-link.arrange-menu.arrange-more.arrange-page.arrange-plus.arrange-site.attach.audio.avatar.badge-bands.badge-bands-3d.badge-blue-fan.badge-blue-fan-3d.badge-bricks.badge-bricks-3d.badge-broken-stripes.badge-broken-stripes-3d.badge-checker.badge-checker-3d.badge-diamond.badge-diamond-3d.badge-fan.badge-fan-3d.badge-fan-dark.badge-fan-dark-3d.badge-halves.badge-halves-3d.badge-halves-green.badge-halves-green-3d.badge-red.badge-red-3d.badge-red-blue-bricks.badge-red-blue-bricks-3d.badge-round-fan.badge-round-fan-3d.badge-shard.badge-shard-3d.badge-split-circle.badge-split-circle-3d.badge-tall-bricks.badge-tall-bricks-3d.badge-weave.badge-weave-3d.bag-alt.bank.banknote.block-accordion.block-banner.block-breadcrumbs.block-button.block-divider.block-forms.block-group.block-heading.block-image.block-logo-marquee.block-page-progress.block-section.block-table.block-tabs.block-text.bold.bolt.book.book-alt.box.briefcase.building.bullet.callout.car.card.cart.categories.check-alt.chevron-down.chevron-left.chevron-right.chevron-up.chrome.cloud.code.code-block.coffee.coins.color.column.comment.connect.content.cursor.curve.default.dictate.dislike.divider.dot-bank.dot-banknote.dot-banknotes.dot-card.dot-coin.dot-coins.dot-happy.dot-neutral.dot-receipt.dot-sad.dot-safe.dot-transfer.dot-wallet.download.drive.drop.dropbox.dumbbell.edge-brand.equation.exercise.eye.eye-off.facebook.figma.firefox.flame.flip.food.form.fuel.fullscreen.fullscreen-exit.gallery.game.gift.github.globe.group.group-alt.group-alt-2.h1.h2.h3.handle.head.health.heart.help.help-alt.history.home-alt.icon.image.in.income.indent.info.instagram.italic.item.jpbank.key.keyboard.life.like.link.linkedin.linux.list-line.lock-filled.logo-marquee.loom.map.material.medical.mention.menu.milestone.milestone-planned.minimize.minimize-alt.minus.money.moon.move.music.music-alt.navigation-check.network.note-alt.note-alt-2.note-lines.notifications.notion.numbered.offline.open-alt.open-source.opera.outdent.page.page-18.page-alt.page-note.panel.password-see.password-unsee.pattern-call-to-action.pattern-card.pattern-feature.pattern-hero.pause.paw.pdf.people.percent.phone.pill.plane.play-alt.postal.prediction.present.priority-high.priority-low.priority-medium.project.quote.reaction.receipt.redo.refresh.refund.relationships.repeat.repeat-small.rewind.rewind-30.rewind-30-alt.rotate.row.safari.safe.scaling.school.school-alt.search-30.see-30.settings.shield.shield-alt.shirt.shop.sign-in.sign-out.slack.slash.sparkle.star-alt.star-alt-2.star-outline.start.status.status-alt.status-filled.stop.strike.sun.system.table.tabs.tag.templates.text.ticket.title.title-struck.titlestyle.todo.toggle.train.transfer.tv.underline.undo.ungroup.unhead.unicon.untitle.up-right.upload.video.vimeo.wallet.warning.wifi.window.windows.work.wrench.x-brand.youtube".split("."), kr = { ...Dr }, Ar = new Set(Or), jr = !1, Mr;
function Nr() {
	return Mr ??= import("./aa-icons-extra.js").then(({ icons: e }) => {
		Object.assign(kr, e), jr = !0;
	}).catch((e) => {
		throw Mr = void 0, e;
	});
}
var Pr = /(fill|stroke)=("|')(#1E1E1E|#2A2A2A|#000000|#000|black)\2/gi, Fr = /(?:fill|stroke)=("|')([^"']+)\1/gi, Ir = /^(none|currentColor|white|#fff|#ffffff|url\(.*\))$/i, Lr = /^(#1E1E1E|#2A2A2A|#000000|#000|black)$/i, Rr = /* @__PURE__ */ new Map();
function zr(e) {
	for (let [, , t] of e.matchAll(Fr)) if (!Ir.test(t) && !Lr.test(t)) return !0;
	return !1;
}
function Br(e) {
	let t = Rr.get(e);
	if (t !== void 0) return t;
	let n = zr(e) ? e : e.replace(Pr, "$1=\"currentColor\"");
	return Rr.set(e, n), n;
}
K("ds-icon", class extends R {
	static properties = {
		type: {
			type: String,
			reflect: !0
		},
		variant: {
			type: String,
			reflect: !0
		},
		size: {
			type: String,
			reflect: !0
		}
	};
	_type = "";
	_iconsReady;
	_failedType;
	constructor() {
		super(), this.variant = "glyph";
	}
	get type() {
		return this._type;
	}
	set type(e) {
		let t = this._type;
		this._type = e, this.requestUpdate("type", t);
	}
	async getUpdateComplete() {
		return await super.getUpdateComplete(), await this._iconsReady, super.getUpdateComplete();
	}
	static styles = h(Er);
	render() {
		if (!this._type) return M`<slot></slot>`;
		let e = kr[this._type.toLowerCase()];
		if (e) return M`${Tr(this._type.startsWith("app-") ? e : Br(e))}`;
		if (!jr && Ar.has(this._type.toLowerCase()) && !this._iconsReady && this._failedType !== this._type) {
			let e = this._type;
			this._iconsReady = Nr().then(() => {
				this._failedType = void 0, this.requestUpdate();
			}).catch(() => {
				this._failedType = e;
			}).finally(() => {
				this._iconsReady = void 0;
			});
		}
		return M`<slot></slot>`;
	}
});
//#endregion
//#region src/vendor/ds1/2-core/button-split.ts
function Vr(e) {
	return e.segments ?? e.options.split(",").map((e) => e.trim()).filter(Boolean).map((e) => {
		let t = e.indexOf(":");
		if (t < 0) return {
			value: e.toLowerCase(),
			label: e
		};
		let n = e.slice(0, t).trim(), r = e.slice(t + 1).trim();
		if (!r.startsWith("@")) return {
			value: n,
			label: r
		};
		let i = r.indexOf(":");
		return {
			value: n,
			icon: r.slice(1, i < 0 ? void 0 : i).trim(),
			label: i < 0 ? n : r.slice(i + 1).trim()
		};
	});
}
function Hr(e, t) {
	e.splitDisabled || t.disabled || (e.actions ? e.dispatchEvent(new CustomEvent("press", {
		detail: { value: t.value },
		bubbles: !0,
		composed: !0
	})) : t.value !== e.value && e.dispatchEvent(new CustomEvent("change", {
		detail: { value: t.value },
		bubbles: !0,
		composed: !0,
		cancelable: !0
	})) && (e.value = t.value));
}
function Ur(e, t) {
	let n = [...e.renderRoot.querySelectorAll("button:not(:disabled)")];
	(n.find((e) => e.getAttribute("aria-pressed") === "true") ?? n[0])?.focus(t);
}
function Wr(e) {
	let t = (t) => M`<ds-text .text=${t.label} .literal=${e.literal}></ds-text>`;
	return M`${Vr(e).map((n) => M`<button
      type="button" part="segment" value=${n.value}
      aria-pressed=${e.actions ? P : String(n.value === e.value)}
      aria-label=${n.icon && !e.labelled ? e.literal ? n.label : G(n.label) : P}
      ?data-icon=${!!n.icon && !e.labelled}
      ?data-icon-words=${!!n.icon && !!e.labelled}
      ?data-short=${n.label.length === 1}
      ?disabled=${e.splitDisabled || n.disabled}
      @click=${() => Hr(e, n)}
    >${n.icon ? e.labelled ? M`<ds-icon type=${n.icon} aria-hidden="true"></ds-icon>${t(n)}` : M`<ds-icon type=${n.icon} aria-hidden="true"></ds-icon>` : t(n)}</button>`)}`;
}
//#endregion
//#region src/vendor/ds1/2-core/styles/ds-button-split.css?inline
var Gr = ":host([split]){max-width:none;height:var(--ds-control-height);vertical-align:bottom;flex:none;align-items:stretch;gap:1px;display:inline-flex;overflow:visible}:host([split][hidden]){display:none}:host([split]) button{appearance:none;box-sizing:border-box;width:auto;max-width:none;height:var(--ds-control-height);padding:0 calc(5px * var(--ds-sf));corner-shape:var(--ds-corner-shape,round);background:var(--ds-button-background-color-secondary);color:var(--ds-text-color-muted);font-family:\"Inter Arrows\", var(--ds-typeface-regular);font-feature-settings:var(--ds-font-features);font-size:var(--ds-type-size-default);font-weight:var(--ds-type-weight-default);line-height:var(--ds-control-height);letter-spacing:var(--ds-type-letterspacing-default);white-space:nowrap;cursor:pointer;-webkit-tap-highlight-color:transparent;border:0;border-radius:0;flex:none;justify-content:center;align-items:center;margin:0;display:inline-flex}:host([split]) button:first-child{border-start-start-radius:var(--ds-radius);border-end-start-radius:var(--ds-radius)}:host([split]) button:last-child{border-start-end-radius:var(--ds-radius);border-end-end-radius:var(--ds-radius)}:host([split]) button[data-icon]{width:var(--ds-control-height);padding:0}:host([split]) button[data-icon-words]{gap:0;padding-inline-start:0}:host([split]) ds-icon{--ds-icon-size:16px;color:inherit}:host([split]) ds-text{color:inherit}:host([split][compact]) button:not([data-icon],[data-short]){--ds-typeface-regular:var(--ds-typeface-compressed);padding-inline:calc(3px * var(--ds-sf))}:host([split][compact]) button[data-short]{width:var(--ds-control-height);padding:0}:host([split]) button:hover:not(:disabled,[aria-pressed=true]){color:var(--ds-text-color)}:host([split]) button[aria-pressed=true]{background:var(--ds-accent-color);color:var(--_ds-choice-ink,var(--ds-button-text-color-on-accent));cursor:default}:host([split]) button:disabled{cursor:default;opacity:.5}:host([split][plain]) button,:host([split][plain]) button[aria-pressed=true]{background:0 0}:host([split][plain]) button[aria-pressed=true]{color:var(--ds-text-color)}:host([split]) button:focus-visible{outline-offset:-2px;outline:1px solid}";
K("ds-button", class extends yr {
	static formAssociated = !0;
	static properties = {
		split: {
			type: Boolean,
			reflect: !0
		},
		segment: { type: String },
		options: { type: String },
		segments: { attribute: !1 },
		value: {
			type: String,
			reflect: !0
		},
		actions: {
			type: Boolean,
			reflect: !0
		},
		labelled: {
			type: Boolean,
			reflect: !0
		},
		literal: {
			type: Boolean,
			reflect: !0
		},
		compact: {
			type: Boolean,
			reflect: !0
		},
		plain: {
			type: Boolean,
			reflect: !0
		},
		_fieldsetDisabled: { state: !0 },
		primary: {
			type: Boolean,
			reflect: !0
		},
		secondary: {
			type: Boolean,
			reflect: !0
		},
		control: {
			type: String,
			reflect: !0,
			noAccessor: !0
		},
		active: {
			type: Boolean,
			reflect: !0
		},
		choice: {
			type: Boolean,
			reflect: !0
		},
		icon: {
			type: Boolean,
			reflect: !0
		},
		wide: {
			type: Boolean,
			reflect: !0
		},
		fixed: {
			type: Boolean,
			reflect: !0
		},
		fit: {
			type: Boolean,
			reflect: !0
		},
		danger: {
			type: Boolean,
			reflect: !0
		},
		menuItem: {
			type: Boolean,
			reflect: !0,
			attribute: "menu-item"
		},
		blank: {
			type: Boolean,
			reflect: !0
		},
		language: { type: String },
		text: { type: String },
		label: { type: String },
		href: { type: String },
		target: { type: String },
		rel: { type: String },
		_loading: {
			type: Boolean,
			state: !0
		}
	};
	splitRole = !1;
	get splitDisabled() {
		return this.disabled || this._fieldsetDisabled;
	}
	splitLanguageChanged = () => {
		this.split && this.requestUpdate();
	};
	_control = "native";
	get control() {
		return this._control;
	}
	set control(e) {
		let t = this._control;
		this._control = e, this.syncControl(), this.requestUpdate("control", t);
	}
	get hostControl() {
		return this.control === "host" && !this.split;
	}
	constructor() {
		super(), typeof this.attachInternals == "function" && this.attachInternals(), this.split = !1, this.options = "", this.value = "", this.actions = !1, this.labelled = !1, this.literal = !1, this.compact = !1, this.plain = !1, this._fieldsetDisabled = !1, this.addEventListener("click", (e) => {
			this._fieldsetDisabled && (e.preventDefault(), e.stopImmediatePropagation());
		}, { capture: !0 }), this.active = !1, this.choice = !1, this.icon = !1, this.wide = !1, this.fixed = !1, this.fit = !1, this.danger = !1, this.menuItem = !1, this.primary = !1, this.secondary = !1, this.disabled = !1, this.blank = !1, this.language = "en-US", this.text = "", this.label = "", this.href = "", this.target = "", this.rel = "", this._loading = !1;
	}
	static styles = [
		h(xr),
		h(br),
		h(Gr)
	];
	_reflectIcon() {
		if (this.control !== "native" || this.split) return;
		let e = this.firstElementChild, t = !this.text && this.childElementCount === 1 && e?.localName === "ds-icon" && !(this.textContent ?? "").trim();
		this.toggleAttribute("icon", !!t);
	}
	syncSlottedControl() {
		if (this.control !== "slotted" || this.split) return;
		let e = this.querySelector(":scope > button");
		e && (e.disabled = this.splitDisabled);
	}
	syncSplitRole() {
		this.split && !this.hasAttribute("role") ? (this.setAttribute("role", "group"), this.splitRole = !0) : !this.split && this.splitRole && (this.removeAttribute("role"), this.splitRole = !1, this.syncControl());
	}
	choiceContrast;
	updated() {
		this.split && !this.plain && !this.actions || this.hasAttribute("segment") && this.active ? (this.choiceContrast ??= new vr(this, () => [...this.renderRoot.querySelectorAll(this.split ? "button[aria-pressed=\"true\"]" : "[part=\"control\"]")]), this.choiceContrast.connect(), this.choiceContrast.resolve()) : (this.choiceContrast?.disconnect(), this.renderRoot.querySelectorAll("[style]").forEach((e) => e.style.removeProperty("--_ds-choice-ink"))), this.syncSplitRole(), this.syncSlottedControl();
	}
	focus(e) {
		this.split ? Ur(this, e) : this.control === "slotted" ? this.querySelector(":scope > :is(button, a)")?.focus(e) : this.hostControl ? super.focus(e) : this.shadowRoot?.querySelector("[part=\"control\"]")?.focus(e);
	}
	connectedCallback() {
		super.connectedCallback(), this.syncSplitRole(), (this.split && !this.plain && !this.actions || this.hasAttribute("segment") && this.active) && (this.choiceContrast?.connect(), this.updateComplete.then(() => this.choiceContrast?.resolve())), this._reflectIcon(), this.syncSlottedControl(), window.addEventListener("language-changed", this.splitLanguageChanged), window.addEventListener("translations-loaded", this.splitLanguageChanged);
	}
	disconnectedCallback() {
		this.choiceContrast?.disconnect(), window.removeEventListener("language-changed", this.splitLanguageChanged), window.removeEventListener("translations-loaded", this.splitLanguageChanged), super.disconnectedCallback();
	}
	formDisabledCallback(e) {
		this._fieldsetDisabled = e, this.syncSlottedControl();
	}
	render() {
		if (this.split) return Wr(this);
		let e = this.text;
		if (this.control === "slotted") return M`<slot @slotchange=${this.syncSlottedControl}></slot>`;
		if (this.hostControl) return M`<slot name="icon"></slot><slot></slot><slot name="trailing"></slot>`;
		let t = e ? M`<ds-text .text=${this.text}></ds-text>` : M`<slot @slotchange=${this._reflectIcon}></slot>`;
		if (this.href) {
			let e = this.splitDisabled, n = this.target || (this.blank ? "_blank" : ""), r = this.rel || (n === "_blank" ? "noopener noreferrer" : "");
			return M`<a
        part="control"
        ?primary=${this.primary}
        ?secondary=${this.secondary}
        href=${z(e ? void 0 : this.href)}
        target=${z(e || !n ? void 0 : n)}
        rel=${z(e || !r ? void 0 : r)}
        role=${z(e ? "link" : void 0)}
        aria-disabled=${z(e ? "true" : void 0)}
        aria-label=${z(this.label || void 0)}
        @click=${this._handleClick}
      >${t}</a>`;
		}
		return M`
      <button
        part="control"
        type="button"
        ?primary=${this.primary}
        ?secondary=${this.secondary}
        ?disabled=${this.splitDisabled}
        aria-label=${z(this.label || void 0)}
        @click=${this._handleClick}
      >
        ${t}
      </button>
    `;
	}
	_handleClick(e) {
		this.splitDisabled && (e.preventDefault(), e.stopPropagation());
	}
});
//#endregion
//#region node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/directive-helpers.js
var { I: Kr } = Ne, qr = (e) => e.strings === void 0, Jr = {}, Yr = (e, t = Jr) => e._$AH = t, Xr = Sr(class extends Cr {
	constructor(e) {
		if (super(e), e.type !== Y.PROPERTY && e.type !== Y.ATTRIBUTE && e.type !== Y.BOOLEAN_ATTRIBUTE) throw Error("The `live` directive is not allowed on child or event bindings");
		if (!qr(e)) throw Error("`live` bindings can only contain a single expression");
	}
	render(e) {
		return e;
	}
	update(e, [t]) {
		if (t === N || t === P) return t;
		let n = e.element, r = e.name;
		if (e.type === Y.PROPERTY) {
			if (t === n[r]) return N;
		} else if (e.type === Y.BOOLEAN_ATTRIBUTE) {
			if (!!t === n.hasAttribute(r)) return N;
		} else if (e.type === Y.ATTRIBUTE && n.getAttribute(r) === t + "") return N;
		return Yr(e), t;
	}
}), Zr = "important", Qr = " !" + Zr, $r = Sr(class extends Cr {
	constructor(e) {
		if (super(e), e.type !== Y.ATTRIBUTE || e.name !== "style" || e.strings?.length > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
	}
	render(e) {
		return Object.keys(e).reduce((t, n) => {
			let r = e[n];
			return r == null ? t : t + `${n = n.includes("-") ? n : n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${r};`;
		}, "");
	}
	update(e, [t]) {
		let { style: n } = e.element;
		if (this.ft === void 0) return this.ft = new Set(Object.keys(t)), this.render(t);
		for (let e of this.ft) t[e] ?? (this.ft.delete(e), e.includes("-") ? n.removeProperty(e) : n[e] = null);
		for (let e in t) {
			let r = t[e];
			if (r != null) {
				this.ft.add(e);
				let t = typeof r == "string" && r.endsWith(Qr);
				e.includes("-") || t ? n.setProperty(e, t ? r.slice(0, -11) : r, t ? Zr : "") : n[e] = r;
			}
		}
		return N;
	}
}), ei = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='16'%20viewBox='0%200%2016%2016'%3e%3csvg%20preserveAspectRatio='none'%20overflow='visible'%20style='display:%20block;'%20width='16'%20height='16'%20viewBox='0%200%2014.0059%208.5918'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20id='Group%2090'%3e%3cpath%20id='Vector%20(Stroke)'%20d='M7.08496%201.43051e-06C9.10892%201.43051e-06%2010.8032%201.03732%2011.9648%202.02832C12.5501%202.52762%2013.0133%203.02575%2013.3301%203.39942C13.4887%203.58653%2013.6115%203.74347%2013.6953%203.85449C13.7372%203.90995%2013.7698%203.95445%2013.792%203.98535C13.8029%204.00061%2013.8114%204.01295%2013.8174%204.02149C13.8202%204.02555%2013.8225%204.02881%2013.8242%204.03125C13.8249%204.03228%2013.8257%204.03346%2013.8262%204.03418L13.8271%204.03516C13.8273%204.03531%2013.8278%204.03638%2013.4492%204.2959L13.8271%204.55567L13.8262%204.55664C13.8256%204.55744%2013.8251%204.55929%2013.8242%204.56055C13.8225%204.563%2013.8202%204.56626%2013.8174%204.57031C13.8114%204.57887%2013.803%204.59115%2013.792%204.60645C13.7698%204.63736%2013.7372%204.68181%2013.6953%204.73731C13.6115%204.84834%2013.4887%205.00525%2013.3301%205.19238C13.0133%205.56604%2012.5501%206.06419%2011.9648%206.56348C10.8032%207.55446%209.10889%208.5918%207.08496%208.5918C5.06326%208.5918%203.33153%207.55649%202.13379%206.56836C1.53011%206.07032%201.04876%205.57301%200.717773%205.2002C0.55201%205.01348%200.422971%204.85678%200.334961%204.7461C0.291015%204.69082%200.2567%204.64695%200.233398%204.61621C0.221828%204.60095%200.213338%204.58859%200.207031%204.58008C0.203926%204.57589%200.201023%204.57277%200.199219%204.57031C0.198435%204.56924%200.197795%204.56811%200.197266%204.56738L0.196289%204.56641V4.56543L0%204.2959L0.196289%204.02637V4.02539L0.197266%204.02442C0.197805%204.02368%200.198405%204.0226%200.199219%204.02149C0.201027%204.01902%200.203896%204.01595%200.207031%204.01172C0.21333%204.00322%200.221826%203.99086%200.233398%203.97559C0.256689%203.94486%200.291044%203.90094%200.334961%203.8457C0.422971%203.73501%200.55201%203.57832%200.717773%203.3916C1.04875%203.0188%201.5301%202.52149%202.13379%202.02344C3.33153%201.03531%205.06326%203.87222e-06%207.08496%201.43051e-06ZM7.08496%200.91797C5.37308%200.917973%203.84542%201.80115%202.71777%202.73145C2.15914%203.19234%201.71191%203.65449%201.4043%204.00098C1.30562%204.11212%201.22362%204.21306%201.15527%204.2959C1.22361%204.37872%201.30565%204.47971%201.4043%204.59082C1.71192%204.93731%202.15914%205.39947%202.71777%205.86035C3.84542%206.79065%205.37308%207.67383%207.08496%207.67383C8.79447%207.67383%2010.2821%206.7926%2011.3691%205.86524C11.9082%205.40533%2012.3368%204.94438%2012.6299%204.59863C12.7272%204.48383%2012.807%204.38024%2012.873%204.2959C12.807%204.21156%2012.7272%204.10798%2012.6299%203.99317C12.3368%203.64742%2011.9082%203.18647%2011.3691%202.72656C10.2821%201.79918%208.79451%200.91797%207.08496%200.91797ZM14.0059%204.2959L13.8281%204.55567L13.4492%204.2959L13.8281%204.03613L14.0059%204.2959Z'%20fill='currentColor'/%3e%3cpath%20id='Ellipse%2040'%20d='M7.16119%201.9635C8.44936%201.9635%209.49404%203.00741%209.4942%204.29554C9.4942%205.5838%208.44946%206.62854%207.16119%206.62854C5.87307%206.62838%204.82916%205.5837%204.82916%204.29554C4.82933%203.00751%205.87317%201.96367%207.16119%201.9635Z'%20fill='currentColor'%20stroke='currentColor'%20stroke-width='0.81'/%3e%3c/g%3e%3c/svg%3e%3c/svg%3e", ti = "data:image/svg+xml,%3csvg%20preserveAspectRatio='none'%20overflow='visible'%20style='display:%20block;'%20width='16'%20height='16'%20viewBox='0%200%2016%2016'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20id='Unsee'%3e%3cg%20id='Vector'%3e%3cpath%20d='M12.4541%2012.789L13.1743%2012.0688L12.6027%2011.4967L12.6%2011.4994L12.0137%2010.9144C11.7332%2011.103%2011.4336%2011.283%2011.1164%2011.4457L11.4068%2011.7363L11.4046%2011.7385L12.4541%2012.789Z'%20fill='currentColor'/%3e%3cpath%20d='M5.96371%206.28858L9.79315%2010.1213C10.0642%209.91923%2010.2966%209.66817%2010.4772%209.38122L6.69735%205.60959C6.41317%205.78931%206.16435%206.01991%205.96371%206.28858Z'%20fill='currentColor'/%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M3.68238%204.00893L3.09583%203.42184L3.79957%202.7181L3.816%202.70167L5.35651%204.24363L6.05746%204.94524L6.712%205.6004L10.4818%209.3738L11.3559%2010.2487L12.0181%2010.9115L12.6027%2011.4967L12.6%2011.4994L12.0137%2010.9144C11.7332%2011.103%2011.4336%2011.283%2011.1164%2011.4457L11.4068%2011.7363L11.4046%2011.7385L11.1136%2011.4472L10.4275%2010.7604L9.79075%2010.1231L5.96207%206.29078L5.08276%205.41064L4.4124%204.73965L3.68238%204.00893ZM12.6382%2010.4584C12.7502%2010.37%2012.8582%2010.2812%2012.9619%2010.1927C13.5472%209.69339%2014.0104%209.19525%2014.3271%208.82159C14.4858%208.63445%2014.6085%208.47754%2014.6924%208.36651C14.7343%208.31101%2014.7669%208.26656%2014.7891%208.23565L14.7965%208.22527L14.8089%208.20741L14.8145%208.19952L14.8213%208.18975C14.8218%208.18905%2014.8222%208.18816%2014.8225%208.18737L14.8232%208.18584L14.8242%208.18487L15.0029%207.9251L14.8252%207.66534L14.4463%207.9251C14.8248%207.66558%2014.8243%207.66451%2014.8242%207.66436L14.8232%207.66338L14.8213%207.66045L14.8145%207.65069C14.8085%207.64215%2014.8%207.62981%2014.7891%207.61456C14.7669%207.58365%2014.7343%207.53915%2014.6924%207.4837C14.6085%207.37267%2014.4858%207.21573%2014.3271%207.02862C14.0104%206.65495%2013.5472%206.15683%2012.9619%205.65752C11.8003%204.66653%2010.106%203.6292%208.08203%203.6292C7.38933%203.6292%206.73067%203.75075%206.11587%203.95029L6.86093%204.69373C7.25481%204.60012%207.6629%204.54717%208.08203%204.54717C9.79158%204.54717%2011.2792%205.42838%2012.3662%206.35577C12.9053%206.81568%2013.3338%207.27662%2013.627%207.62237C13.7119%207.72259%2013.7835%207.81426%2013.8443%207.89203L13.8701%207.9251L13.8442%207.95828C13.7834%208.03604%2013.7119%208.12766%2013.627%208.22784C13.3338%208.57358%2012.9053%209.03453%2012.3662%209.49444C12.2436%209.599%2012.116%209.70298%2011.9835%209.80517L12.6382%2010.4584ZM5.58478%206.99004L9.09135%2010.4996C8.80023%2010.6051%208.48611%2010.6626%208.15857%2010.6626C6.64663%2010.6626%205.42096%209.43698%205.42096%207.92504C5.42096%207.59666%205.47878%207.28179%205.58478%206.99004ZM10.371%2011.7804L9.65051%2011.0593C9.15436%2011.2126%208.62958%2011.303%208.08203%2011.303C6.37015%2011.303%204.84249%2010.4199%203.71484%209.48956C3.15622%209.02867%202.70899%208.56651%202.40137%208.22002C2.31556%208.12337%202.24231%208.03438%202.17972%207.95834L2.15234%207.9251L2.17972%207.89186C2.24231%207.81582%202.31553%207.72686%202.40137%207.63018C2.70898%207.2837%203.15621%206.82154%203.71484%206.36065C3.93564%206.17849%204.17177%205.99815%204.42162%205.82588L3.76309%205.16679C3.53867%205.32681%203.32756%205.49036%203.13086%205.65264C2.52717%206.15069%202.04582%206.648%201.71484%207.02081C1.54908%207.20752%201.42004%207.36422%201.33203%207.47491C1.28811%207.53015%201.25376%207.57406%201.23047%207.60479C1.22314%207.61446%201.21704%207.62297%201.21196%207.63006L1.2041%207.64092C1.20236%207.64328%201.20069%207.64527%201.19925%207.647L1.19629%207.65069L1.19434%207.65362L1.19336%207.65557L0.99707%207.9251L1.19336%208.19561L1.19434%208.19659L1.19629%208.19952L1.19926%208.20322C1.20071%208.20496%201.20238%208.20695%201.2041%208.20928L1.21195%208.22013C1.21704%208.22723%201.22314%208.23575%201.23047%208.24541C1.25377%208.27615%201.28809%208.32002%201.33203%208.3753C1.42004%208.48599%201.54908%208.64268%201.71484%208.8294C2.04583%209.20221%202.52718%209.69952%203.13086%2010.1976C4.3286%2011.1857%206.06033%2012.221%208.08203%2012.221C8.90391%2012.221%209.67144%2012.0499%2010.371%2011.7804ZM10.8048%208.62904C10.8644%208.40441%2010.8962%208.16843%2010.8962%207.92504C10.8962%206.4131%209.6705%205.18743%208.15857%205.18743C7.91309%205.18743%207.67517%205.21974%207.44881%205.28034L10.8048%208.62904ZM9.79315%2010.1213L5.96371%206.28858C6.16435%206.01991%206.41317%205.78931%206.69735%205.60959L10.4772%209.38122C10.2966%209.66817%2010.0642%209.91923%209.79315%2010.1213Z'%20fill='currentColor'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e", ni = "[data-ds-shape=square],:host([data-ds-shape=square]){--ds-corner-size:0px;--ds-corner-shape:round;--ds-button-inset:.5px}[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:4px;--ds-corner-shape:round;--ds-button-inset:2.5px}[data-ds-shape=circular],:host([data-ds-shape=circular]){--ds-corner-size:999px;--ds-corner-shape:round;--ds-button-inset:5px}@supports (corner-shape:squircle){[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:8px;--ds-corner-shape:squircle}}:root,:host,:where([data-ds-surface]){--ds-unit:calc(var(--ds-1,20px) * var(--ds-sf,1));--ds-control-height:calc(var(--ds-control-size,var(--ds-08,16px)) * var(--ds-sf,1));--ds-row-height:calc(var(--ds-row-size,var(--ds-1,20px)) * var(--ds-sf,1));--ds-type-size-default:calc(var(--ds-text-size,14px) * var(--ds-sf,1));--ds-type-size-small:calc(var(--ds-small-text-size,10px) * var(--ds-sf,1));--ds-type-size-heading:calc(var(--ds-heading-text-size,13px) * var(--ds-sf,1));--ds-type-size-display:calc(var(--ds-display-text-size,20px) * var(--ds-sf,1));--ds-type-lineheight-default:calc(var(--ds-text-leading,16px) * var(--ds-sf,1));--ds-type-letterspacing-default:calc(var(--ds-text-tracking,-.3px) * var(--ds-sf,1));--ds-radius:calc(var(--ds-corner-size,4px) * var(--ds-sf,1));--ds-radius-card:calc(var(--ds-card-corner-size,4px) * var(--ds-sf,1))}:host{--_input-size:var(--ds-input-size);--_input-height:calc(var(--_input-size) * var(--ds-sf));--_input-padding-size:var(--ds-input-padding-size);--_input-padding:calc(var(--_input-padding-size) * var(--ds-sf));--_input-corner-size:var(--ds-input-corner-size);--_input-radius:calc(var(--_input-corner-size) * var(--ds-sf));width:100%;display:block}:host([hidden]){display:none!important}:host([variant=field]){width:var(--ds-input-inline-size,100%)}.input-wrapper{flex-direction:column;gap:0;width:100%;display:flex}label{font-family:\"Inter Arrows\", var(--ds-typeface-regular);font-size:var(--ds-type-size-default);line-height:var(--ds-row-height);color:var(--ds-text-color)}.input-container{align-items:center;width:100%;display:flex;position:relative}:is(input,textarea){background:var(--base-light-grey,#e8e8e8);padding:0 calc(2px * var(--ds-sf,1));font-size:var(--ds-type-size-default);font-family:\"Inter Arrows\", var(--ds-typeface-regular);color:var(--ds-input-color,#2a2a2a);line-height:calc(16px * var(--ds-sf,1));letter-spacing:calc(-.4px * var(--ds-sf,1));height:var(--ds-input-height,calc(16px * var(--ds-sf,1)));box-sizing:border-box;border:none;outline:none;width:100%}:is(input,textarea):focus{opacity:1;color:var(--base-slate,#1e1e1e);outline:none}input{border-radius:var(--ds-input-radius,var(--ds-radius));corner-shape:var(--ds-corner-shape,round)}:is(input,textarea)::placeholder{color:var(--ds-input-placeholder-color,var(--ds-text-color-muted));opacity:1}:is(input,textarea):disabled{cursor:not-allowed;opacity:.5}:is(input,textarea):read-only{background-color:var(--input-readonly-background,#fafafa)}:host([variant=filled]) :is(input,textarea){background-color:var(--input-filled-background,var(--surface-color-secondary,#f5f5f5));border:none;border-bottom:2px solid var(--border-color,#ccc);border-radius:calc(var(--025) * var(--ds-sf,1)) calc(var(--025) * var(--ds-sf,1)) 0 0}:host([variant=filled]) :is(input,textarea):focus{border-bottom-color:var(--accent-color,#007aff);box-shadow:none}:host([variant=outlined]) :is(input,textarea){border:2px solid var(--border-color,#ccc);background-color:#0000}:host([variant=outlined]) :is(input,textarea):focus{border-color:var(--accent-color,#007aff)}.input-wrapper.has-error{grid-template-columns:minmax(0,1fr);grid-auto-rows:minmax(var(--ds-input-control-row,var(--ds-row-height)), auto);align-items:start;display:grid}.error-message{min-width:0;color:var(--ds-danger-color);font-family:\"Inter Arrows\", var(--ds-typeface-regular);font-feature-settings:var(--ds-font-features);font-size:var(--ds-type-size-default);font-weight:var(--ds-type-weight-default);line-height:var(--ds-unit);letter-spacing:var(--ds-type-letterspacing-default);margin:0}.error-message>ds-text{display:block}:host([required]) label:after{content:\" *\";color:var(--ds-danger-color)}:is(input,textarea).has-error{border-color:var(--ds-danger-color)}:is(input,textarea).has-error:focus{box-shadow:0 0 0 2px color-mix(in srgb, var(--ds-danger-color) 20%, transparent)}:host([variant=row]){box-sizing:border-box;padding-top:calc(2px * var(--ds-sf,1));--ds-input-control-row:calc(18px * var(--ds-sf,1))}:host([variant=row]) .input-container,:host([variant=row]) :is(input,textarea){box-sizing:border-box;height:calc(18px * var(--ds-sf,1));min-height:calc(18px * var(--ds-sf,1));max-height:calc(18px * var(--ds-sf,1))}:host([variant=row]) :is(input,textarea){line-height:calc(16px * var(--ds-sf,1));background:var(--ds-input-background);color:var(--ds-input-color);opacity:1;border-radius:0;margin:0;padding-block:0}:host([variant=row]) :is(input,textarea)::placeholder{color:var(--ds-input-placeholder-color);opacity:1}:host([variant=row]) :is(input,textarea):focus{background:var(--ds-input-background);color:var(--ds-input-color);box-shadow:inset 0 0 0 1px var(--ds-accent-color);opacity:1}:host([variant=row]) :is(input,textarea):disabled{opacity:1;background:var(--ds-input-background);color:var(--ds-input-disabled-color);-webkit-text-fill-color:var(--ds-input-disabled-color)}:host([quiet-focus]) :is(input,textarea):focus,:host([quiet-focus]) :is(input,textarea):focus-visible,:host([quiet-focus]) .input-container:focus-within{box-shadow:none!important;outline:none!important}:is(input,textarea).has-reveal{padding-inline-end:calc(24px * var(--ds-sf,1))}.password-visibility{inset-inline-end:0;height:100%;width:calc(24px * var(--ds-sf,1));color:var(--ds-input-reveal-color);cursor:pointer;background:0 0;border:0;place-items:center;padding:0;display:grid;position:absolute;top:0}.password-visibility:focus-visible{outline-offset:-1px;outline:1px solid}.password-visibility:disabled{cursor:default;opacity:.5}.password-visibility span{width:calc(16px * var(--ds-sf,1));height:calc(16px * var(--ds-sf,1));mask:var(--eye-icon) center / 100% 100% no-repeat;background:currentColor;display:block}@supports (corner-shape:squircle){:is(input,textarea){corner-shape:var(--ds-corner-shape,squircle)}}:host([variant=field]) :is(input,textarea),:host([variant=plain]) :is(input,textarea){height:var(--ds-input-height,var(--ds-row-height));padding:var(--ds-input-padding,0 calc(4px * var(--ds-sf)));border:var(--ds-input-border,1px solid var(--ds-border-color));border-radius:var(--ds-input-radius,var(--ds-radius));background:var(--ds-input-field-background,var(--ds-fill));color:var(--ds-text-color);opacity:1;font-size:var(--ds-type-size-default);line-height:var(--ds-type-lineheight-default);letter-spacing:var(--ds-type-letterspacing-default)}:host([variant=field]){--_field-height:var(--ds-input-height,var(--_input-height,var(--ds-control-height)))}:host([variant=field]) .input-container{min-height:var(--ds-row-height);align-items:flex-end}:host([variant=field]) .password-visibility{height:var(--_field-height);top:auto;bottom:0}:host([variant=field]) input{height:var(--_field-height);padding:var(--ds-input-padding,0 var(--_input-padding,calc(4px * var(--ds-sf))));border-radius:var(--ds-input-radius,var(--_input-radius,var(--ds-radius)))}:host([variant=plain]) :is(input,textarea){padding:var(--ds-input-padding,0);background:0 0;border:0;border-radius:0}:host([variant=field]) :is(input,textarea)::placeholder,:host([variant=plain]) :is(input,textarea)::placeholder{color:var(--ds-text-color-muted);opacity:1}:host([variant=field]) :is(input,textarea):focus{outline:1px solid var(--ds-focus-ring);outline-offset:-1px}:host([variant=field]) :is(input,textarea):disabled,:host([variant=plain]) :is(input,textarea):disabled{opacity:.5}:host([variant=field]) :is(input,textarea).has-reveal,:host([variant=plain]) :is(input,textarea).has-reveal{padding-inline-end:calc(24px * var(--ds-sf))}.row-metric{width:0;height:var(--ds-row-height);visibility:hidden;pointer-events:none;position:absolute;overflow:hidden}:host([variant=field]) textarea{border-radius:var(--ds-textarea-radius,calc(4px * var(--ds-sf)));corner-shape:var(--ds-textarea-corner-shape,squircle)}:host([variant]) textarea{height:var(--ds-textarea-height,calc(var(--ds-textarea-rows,3) * var(--ds-row-height)));min-height:var(--ds-row-height);padding:var(--ds-textarea-padding,calc(4px * var(--ds-sf)));resize:vertical}:host([variant=plain]) textarea{padding:0}:host([auto-grow]) textarea{resize:none}", ri = {
	email: "email",
	tel: "tel",
	url: "url",
	password: "current-password"
};
K("ds-input", class e extends R {
	static formAssociated = !0;
	focusFromLabel = (e) => {
		e.composedPath()[0] === this && !this.disabled && !this._formDisabled && this.focus();
	};
	internals = typeof this.attachInternals == "function" ? this.attachInternals() : null;
	initialValue;
	static properties = {
		type: {
			type: String,
			reflect: !0
		},
		multiline: {
			type: Boolean,
			reflect: !0
		},
		rows: { type: Number },
		maxRows: {
			type: Number,
			attribute: "max-rows"
		},
		autoGrow: {
			type: Boolean,
			attribute: "auto-grow",
			reflect: !0
		},
		wrap: { type: String },
		inputMode: {
			type: String,
			attribute: "inputmode"
		},
		enterKeyHint: {
			type: String,
			attribute: "enterkeyhint"
		},
		list: { type: String },
		suggestions: { attribute: !1 },
		ariaLabel: {
			type: String,
			attribute: "aria-label"
		},
		ariaLabelledBy: {
			type: String,
			attribute: "aria-labelledby"
		},
		ariaDescribedBy: {
			type: String,
			attribute: "aria-describedby"
		},
		spellcheckHint: {
			type: String,
			attribute: "spellcheck"
		},
		ariaInvalid: {
			type: String,
			attribute: "aria-invalid"
		},
		revealable: {
			type: Boolean,
			reflect: !0
		},
		quietFocus: {
			type: Boolean,
			attribute: "quiet-focus",
			reflect: !0
		},
		_passwordVisible: {
			type: Boolean,
			state: !0
		},
		_formDisabled: {
			type: Boolean,
			state: !0
		},
		name: {
			type: String,
			reflect: !0
		},
		value: { type: String },
		placeholder: { type: String },
		placeholderKey: {
			type: String,
			attribute: "placeholder-key"
		},
		label: { type: String },
		labelText: {
			type: String,
			attribute: "label-text"
		},
		disabled: {
			type: Boolean,
			reflect: !0
		},
		readonly: {
			type: Boolean,
			reflect: !0
		},
		required: {
			type: Boolean,
			reflect: !0
		},
		autofocus: { type: Boolean },
		autocomplete: { type: String },
		pattern: { type: String },
		minlength: { type: Number },
		maxlength: { type: Number },
		min: { type: String },
		max: { type: String },
		step: { type: String },
		variant: {
			type: String,
			reflect: !0
		},
		error: { type: String },
		errorText: {
			type: String,
			attribute: "error-text"
		},
		_focused: {
			type: Boolean,
			state: !0
		},
		_placeholder: {
			type: String,
			state: !0
		},
		_currentLanguage: {
			type: String,
			state: !0
		}
	};
	resizeFrame = 0;
	measuredWidth = 0;
	resizeObserver;
	fontsChanged = () => this.resizeToContent();
	listObserver;
	boundHandlers;
	constructor() {
		super(), this.type = "text", this.multiline = !1, this.rows = 3, this.maxRows = 10, this.autoGrow = !1, this.wrap = "soft", this.inputMode = "", this.enterKeyHint = "", this.list = "", this.suggestions = [], this.ariaLabel = "", this.ariaLabelledBy = "", this.ariaDescribedBy = "", this.spellcheckHint = "", this.ariaInvalid = "", this.revealable = !1, this.quietFocus = !1, this._passwordVisible = !1, this._formDisabled = !1, this.name = "", this.value = "", this.placeholder = "", this.placeholderKey = "", this.label = "", this.labelText = "", this.disabled = !1, this.readonly = !1, this.required = !1, this.autofocus = !1, this.autocomplete = "", this.pattern = "", this.minlength = 0, this.maxlength = -1, this.min = "", this.max = "", this.step = "", this.variant = "default", this.error = "", this.errorText = "", this._focused = !1, this._placeholder = "", this._currentLanguage = W.value, this.boundHandlers = { languageChanged: (() => {
			this._currentLanguage = W.value, this._loadPlaceholder(), this.requestUpdate();
		}) };
	}
	static styles = h(ni);
	connectedCallback() {
		if (super.connectedCallback(), this._currentLanguage = W.value, this._loadPlaceholder(), this.addEventListener("click", this.focusFromLabel), window.addEventListener("language-changed", this.boundHandlers.languageChanged), window.addEventListener("translations-loaded", this.boundHandlers.languageChanged), typeof ResizeObserver < "u") {
			this.resizeObserver = new ResizeObserver((e) => {
				(this.clientWidth !== this.measuredWidth || e.some((e) => e.target !== this)) && (this.measuredWidth = this.clientWidth, this.resizeToContent());
			}), this.resizeObserver.observe(this);
			let e = this.shadowRoot?.querySelector(".row-metric");
			e && this.resizeObserver.observe(e);
		}
		document.fonts?.addEventListener("loadingdone", this.fontsChanged);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.removeEventListener("click", this.focusFromLabel), window.removeEventListener("language-changed", this.boundHandlers.languageChanged), window.removeEventListener("translations-loaded", this.boundHandlers.languageChanged), this.listObserver?.disconnect(), this.listObserver = void 0, this.resizeObserver?.disconnect(), document.fonts?.removeEventListener("loadingdone", this.fontsChanged), cancelAnimationFrame(this.resizeFrame);
	}
	firstUpdated() {
		this.autofocus && this.focus();
		let e = this.shadowRoot?.querySelector(".row-metric");
		e && this.resizeObserver?.observe(e);
	}
	willUpdate(e) {
		e.has("multiline") && this.multiline && this.variant === "default" && !this.hasAttribute("variant") && (this.variant = "field");
	}
	updated(e) {
		super.updated(e), (e.has("placeholder") || e.has("placeholderKey")) && this._loadPlaceholder(), this.initialValue === void 0 && (this.initialValue = this.value), e.has("type") && this.type !== "password" && (this._passwordVisible = !1), this.multiline && this.resizeToContent(), e.has("list") && this.observeList(), this.syncForm();
	}
	listSource() {
		if (!this.list) return null;
		let e = this.getRootNode().getElementById?.(this.list);
		return e instanceof HTMLDataListElement ? e : null;
	}
	observeList() {
		this.listObserver?.disconnect(), this.listObserver = void 0;
		let e = this.listSource();
		e && typeof MutationObserver < "u" && (this.listObserver = new MutationObserver(() => this.requestUpdate()), this.listObserver.observe(e, {
			childList: !0,
			subtree: !0,
			attributes: !0,
			characterData: !0
		}));
	}
	suggestionOptions() {
		if (this.suggestions?.length) return this.suggestions.map((e) => typeof e == "string" ? { value: e } : e);
		let e = this.listSource();
		return e ? [...e.options].map((e) => ({
			value: e.value,
			label: e.label === e.value ? void 0 : e.label
		})) : [];
	}
	renderSuggestions(e) {
		return e.length ? M`<datalist id="suggestions">${e.map((e) => M`<option value=${e.value} label=${z(e.label)}></option>`)}</datalist>` : null;
	}
	get input() {
		return this.shadowRoot?.querySelector("input, textarea") ?? null;
	}
	get isMultiline() {
		return this.multiline;
	}
	get selectionStart() {
		return this.input?.selectionStart ?? null;
	}
	get selectionEnd() {
		return this.input?.selectionEnd ?? null;
	}
	setSelectionRange(e, t, n) {
		this.input?.setSelectionRange(e, t, n);
	}
	get valueAsNumber() {
		let e = this.input;
		return e instanceof HTMLInputElement ? e.valueAsNumber : NaN;
	}
	get labels() {
		return this.internals?.labels;
	}
	get form() {
		return this.internals?.form ?? null;
	}
	get validity() {
		return this.input?.validity;
	}
	get validationMessage() {
		return this.input?.validationMessage ?? "";
	}
	get willValidate() {
		return this.input?.willValidate ?? !1;
	}
	syncForm() {
		let e = this.input;
		if (!e) return;
		this.internals?.setFormValue(this.disabled || this._formDisabled ? null : this.value);
		let t = this.errorText ? G(this.errorText) : this.error;
		e.setCustomValidity(t || ""), this.internals?.setValidity(e.validity, e.validationMessage, e);
	}
	checkValidity() {
		return this.syncForm(), this.input?.checkValidity() ?? !0;
	}
	reportValidity() {
		return this.syncForm(), this.input?.reportValidity() ?? !0;
	}
	formDisabledCallback(e) {
		this._formDisabled = e, queueMicrotask(() => {
			this.isConnected && this.requestUpdate();
		});
	}
	formResetCallback() {
		this.value = this.getAttribute("value") ?? this.initialValue ?? "", this._passwordVisible = !1, this.internals?.setFormValue(this.value), this.dispatchEvent(new Event("input-reset", {
			bubbles: !0,
			composed: !0
		}));
	}
	formStateRestoreCallback(e) {
		typeof e == "string" && (this.value = e, this.internals?.setFormValue(e));
	}
	resolvedAutocomplete() {
		if (this.autocomplete) return this.autocomplete;
		if (!this.multiline) return ri[this.type];
	}
	accessibleLabel() {
		if (this.ariaLabel) return this.ariaLabel;
		let e = this.getRootNode();
		return (this.ariaLabelledBy ?? "").split(/\s+/).filter(Boolean).map((t) => {
			let n = e.getElementById?.(t), r = n?.getAttribute("text");
			return r ? G(r) : n?.textContent?.trim() ?? "";
		}).join(" ").trim() || Array.from(this.internals?.labels ?? []).map((e) => e.textContent?.trim() ?? "").join(" ").trim() || void 0;
	}
	togglePassword() {
		let e = this.input;
		if (!(e instanceof HTMLInputElement) || this.disabled || this._formDisabled) return;
		let t = e.selectionStart, n = e.selectionEnd;
		this._passwordVisible = !this._passwordVisible, e.type = this._passwordVisible ? "text" : "password", t !== null && n !== null && e.setSelectionRange(t, n);
	}
	handleKeyDown(t) {
		t.key !== "Enter" || t.isComposing || t.keyCode === 229 || t.altKey || t.ctrlKey || t.metaKey || t.shiftKey || setTimeout(() => {
			let n = this.form;
			if (t.defaultPrevented || !n || this.disabled || this._formDisabled) return;
			let r = Array.from(n.elements), i = r.find((e) => e instanceof HTMLButtonElement && e.type === "submit" || e instanceof HTMLInputElement && e.type === "submit");
			if (i) {
				i.disabled || i.click();
				return;
			}
			let a = /* @__PURE__ */ new Set([
				"text",
				"search",
				"url",
				"tel",
				"email",
				"password",
				"date",
				"month",
				"week",
				"time",
				"datetime-local",
				"number"
			]);
			r.filter((t) => (t instanceof HTMLInputElement || t instanceof e) && a.has(t.type)).length === 1 && n.requestSubmit();
		}, 0);
	}
	handleChange(e) {
		e.stopPropagation(), this.value = e.target.value, this.syncForm(), this.dispatchEvent(new Event("change", {
			bubbles: !0,
			composed: !0
		}));
	}
	_loadPlaceholder() {
		let e = this.placeholderKey || this.placeholder;
		if (!e) this._placeholder = "", this.requestUpdate();
		else {
			try {
				let t = G(e);
				this._placeholder = t || e;
			} catch {
				this._placeholder = e;
			}
			this.requestUpdate();
		}
	}
	_handleInput(e) {
		let t = e.target;
		this.value = t.value, this.syncForm(), this.dispatchEvent(new CustomEvent("input-change", {
			detail: {
				value: this.value,
				name: this.name
			},
			bubbles: !0,
			composed: !0
		}));
	}
	_handleFocus() {
		this._focused = !0, this.dispatchEvent(new CustomEvent("input-focus", { bubbles: !0 }));
	}
	_handleBlur() {
		this._focused = !1, this.dispatchEvent(new CustomEvent("input-blur", { bubbles: !0 }));
	}
	renderNow() {
		this.performUpdate();
	}
	focus(e) {
		this.input?.focus(e);
	}
	blur() {
		this.input?.blur();
	}
	select() {
		this.input?.select();
	}
	resizeToContent() {
		cancelAnimationFrame(this.resizeFrame);
		let e = this.input;
		e && this.multiline && (this.autoGrow ? this.resizeFrame = requestAnimationFrame(() => {
			if (!this.isConnected) return;
			let t = getComputedStyle(e), n = parseFloat(t.getPropertyValue("--ds-row-height")) || 20 * (parseFloat(t.getPropertyValue("--ds-sf")) || 1), r = Math.max(1, Math.floor(this.rows || 1)) * n, i = Math.max(r, Math.floor(this.maxRows || this.rows || 1) * n);
			e.style.height = "0px";
			let a = parseFloat(t.borderTopWidth) + parseFloat(t.borderBottomWidth), o = Math.ceil((e.scrollHeight + a) / n) * n;
			e.style.height = `${Math.max(r, Math.min(i, o))}px`, e.style.overflowY = o > i ? "auto" : "hidden";
		}) : (e.style.height = "", e.style.overflowY = ""));
	}
	renderMultiline(e, t) {
		let n = Math.max(1, Math.floor(this.rows || 1));
		return M`<span class="row-metric" aria-hidden="true"></span><textarea
      id="input"
      part="input"
      aria-label=${z(this.accessibleLabel())}
      aria-invalid=${z(this.ariaInvalid || (e ? "true" : void 0))}
      aria-describedby=${z([t ? "description" : "", e ? "error" : ""].filter(Boolean).join(" ") || void 0)}
      inputmode=${z(this.inputMode || void 0)}
      enterkeyhint=${z(this.enterKeyHint || void 0)}
      spellcheck=${z(this.spellcheckHint || void 0)}
      .name=${this.name}
      .value=${Xr(this.value)}
      .placeholder=${this._placeholder || this.placeholder}
      ?disabled=${this.disabled || this._formDisabled}
      ?readonly=${this.readonly}
      ?required=${this.required}
      ?autofocus=${this.autofocus}
      autocomplete=${z(this.resolvedAutocomplete())}
      minlength=${z(this.minlength || void 0)}
      maxlength=${z(this.maxlength >= 0 ? this.maxlength : void 0)}
      rows=${n}
      wrap=${this.wrap || "soft"}
      style=${$r({ "--ds-textarea-rows": String(n) })}
      class=${e ? "has-error" : ""}
      @input=${this._handleInput}
      @change=${this.handleChange}
      @focus=${this._handleFocus}
      @blur=${this._handleBlur}
    ></textarea>`;
	}
	renderControl(e, t) {
		if (this.multiline) return this.renderMultiline(e, t);
		let n = this.suggestionOptions();
		return M`<input
      id="input"
      part="input"
      .type=${this.type === "password" && this._passwordVisible ? "text" : this.type}
      aria-label=${z(this.accessibleLabel())}
      aria-invalid=${z(this.ariaInvalid || (e ? "true" : void 0))}
      aria-describedby=${z([t ? "description" : "", e ? "error" : ""].filter(Boolean).join(" ") || void 0)}
      inputmode=${z(this.inputMode || void 0)}
      enterkeyhint=${z(this.enterKeyHint || void 0)}
      list=${z(n.length ? "suggestions" : void 0)}
      spellcheck=${z(this.spellcheckHint || void 0)}
      .name=${this.name}
      .value=${Xr(this.value)}
      .placeholder=${this._placeholder || this.placeholder}
      ?disabled=${this.disabled || this._formDisabled}
      ?readonly=${this.readonly}
      ?required=${this.required}
      ?autofocus=${this.autofocus}
      autocomplete=${z(this.resolvedAutocomplete())}
      pattern=${z(this.pattern || void 0)}
      minlength=${z(this.minlength || void 0)}
      maxlength=${z(this.maxlength >= 0 ? this.maxlength : void 0)}
      min=${z(this.min || void 0)}
      max=${z(this.max || void 0)}
      step=${z(this.step || void 0)}
      class=${[e ? "has-error" : "", this.revealable && this.type === "password" ? "has-reveal" : ""].join(" ")}
      @input=${this._handleInput}
      @change=${this.handleChange}
      @keydown=${this.handleKeyDown}
      @focus=${this._handleFocus}
      @blur=${this._handleBlur}
    />${this.renderSuggestions(n)}`;
	}
	render() {
		let e = !!(this.error || this.errorText), t = this.getRootNode(), n = (this.ariaDescribedBy ?? "").split(/\s+/).filter(Boolean).map((e) => t.getElementById?.(e)?.textContent?.trim() ?? "").filter(Boolean).join(" ");
		return M`
      <div class=${e ? "input-wrapper has-error" : "input-wrapper"}>
        ${this.label || this.labelText ? M`
                <label for="input">
                  ${this.labelText ? M`<ds-text .text=${this.labelText}></ds-text>` : this.label}
                </label>
              ` : null}

        <div class="input-container">
          ${this.renderControl(e, n)}
          ${!this.isMultiline && this.revealable && this.type === "password" ? M`
                  <button
                    class="password-visibility"
                    part="reveal"
                    type="button"
                    aria-label=${G(this._passwordVisible ? "Hide password" : "Show password")}
                    aria-pressed=${String(this._passwordVisible)}
                    ?disabled=${this.disabled || this._formDisabled}
                    @pointerdown=${(e) => e.preventDefault()}
                    @keydown=${(e) => {
			(e.key === "Enter" || e.key === " ") && e.stopPropagation();
		}}
                    @click=${this.togglePassword}
                  >
                    <span
                      aria-hidden="true"
                      style=${`--eye-icon: url("${this._passwordVisible ? ti : ei}")`}
                    ></span>
                  </button>
                ` : null}
        </div>

        ${n ? M`<span id="description" hidden>${n}</span>` : null}
        ${e ? M`
                <div id="error" class="error-message" role="status">
                  ${this.errorText ? M`<ds-text wrap .text=${this.errorText}></ds-text>` : this.error}
                </div>
              ` : null}
      </div>
    `;
	}
});
//#endregion
//#region src/vendor/ds1/0-face/keys.ts
var ii = {
	"key.ctrl": "Ctrl",
	"key.shift": "Shift",
	"key.alt": "Alt",
	"key.enter": "Enter",
	"key.escape": "Esc",
	"key.tab": "Tab",
	"key.space": "Space",
	"key.backspace": "Backspace",
	"key.delete": "Del",
	"key.home": "Home",
	"key.end": "End",
	"key.pageup": "PgUp",
	"key.pagedown": "PgDn"
}, ai = Symbol.for("design-system-1.translate"), oi = null;
function si(e) {
	if (typeof oi == "function") return oi(e);
	let t = oi?.[e];
	if (t !== void 0) return t;
	let n = globalThis[ai];
	if (typeof n == "function") {
		let t = String(n(e));
		if (t && t !== e) return t;
	}
	return ii[e];
}
function ci() {
	if (typeof navigator > "u") return !1;
	let e = navigator.userAgentData?.platform || navigator.platform || "";
	return /mac|iphone|ipad|ipod|ios/i.test(e);
}
var li = (e) => e?.platform ?? (ci() ? "apple" : "other"), ui = {
	esc: "escape",
	return: "enter",
	del: "delete",
	up: "arrowup",
	down: "arrowdown",
	left: "arrowleft",
	right: "arrowright",
	spacebar: "space",
	" ": "space",
	pgup: "pageup",
	pgdn: "pagedown",
	cmd: "meta",
	command: "meta",
	control: "ctrl",
	option: "alt",
	opt: "alt"
};
function di(e, t) {
	let n = li(t) === "apple", r = e.trim().toLowerCase().split("+").map((e) => e.trim()), i = r[r.length - 1] === "" ? "plus" : r.pop(), a = {
		ctrl: !1,
		meta: !1,
		alt: !1,
		shift: !1,
		key: ui[i] ?? i
	};
	for (let t of r) {
		let r = ui[t] ?? t;
		if (r === "mod") a[n ? "meta" : "ctrl"] = !0;
		else if (r === "ctrl" || r === "meta" || r === "alt" || r === "shift") a[r] = !0;
		else if (r !== "") throw Error(`Unknown modifier in shortcut "${e}": ${t}`);
	}
	if (!a.key) throw Error(`A shortcut names a key: "${e}"`);
	return a;
}
var fi = {
	enter: "↩",
	escape: "⎋",
	tab: "⇥",
	backspace: "⌫",
	delete: "⌦",
	home: "↖",
	end: "↘",
	pageup: "⇞",
	pagedown: "⇟"
}, pi = {
	arrowup: "↑",
	arrowdown: "↓",
	arrowleft: "←",
	arrowright: "→"
}, mi = {
	enter: "key.enter",
	escape: "key.escape",
	tab: "key.tab",
	space: "key.space",
	backspace: "key.backspace",
	delete: "key.delete",
	home: "key.home",
	end: "key.end",
	pageup: "key.pageup",
	pagedown: "key.pagedown"
};
function hi(e, t) {
	return pi[e] ? pi[e] : e === "plus" ? "+" : t && fi[e] ? fi[e] : mi[e] ? si(mi[e]) : /^f\d{1,2}$/.test(e) ? e.toUpperCase() : e === "insert" ? "Ins" : e.length === 1 ? e.toUpperCase() : e[0].toUpperCase() + e.slice(1);
}
function gi(e, t) {
	let n = li(t) === "apple", r = di(e, t), i = hi(r.key, n);
	return n ? `${r.ctrl ? "⌃" : ""}${r.alt ? "⌥" : ""}${r.shift ? "⇧" : ""}${r.meta ? "⌘" : ""}${i}` : [
		r.meta ? "Meta" : "",
		r.ctrl ? si("key.ctrl") : "",
		r.alt ? si("key.alt") : "",
		r.shift ? si("key.shift") : "",
		i
	].filter(Boolean).join("+");
}
//#endregion
//#region src/vendor/ds1/x-icon/chevron-down.svg?raw
var _i = "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M4.25 6.25L8 10L11.75 6.25\" stroke=\"currentColor\"/>\n</svg>\n", vi = "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M6.68649 11.884L12.443 6.13601L11.736 5.42715L6.68835 10.4827L4.26399 8.0501L3.55696 8.74525L6.68649 11.884Z\" fill=\"currentColor\"/>\n</svg>\n", yi = "[data-ds-shape=square],:host([data-ds-shape=square]){--ds-corner-size:0px;--ds-corner-shape:round;--ds-button-inset:.5px}[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:4px;--ds-corner-shape:round;--ds-button-inset:2.5px}[data-ds-shape=circular],:host([data-ds-shape=circular]){--ds-corner-size:999px;--ds-corner-shape:round;--ds-button-inset:5px}@supports (corner-shape:squircle){[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:8px;--ds-corner-shape:squircle}}:root,:host,:where([data-ds-surface]){--ds-unit:calc(var(--ds-1,20px) * var(--ds-sf,1));--ds-control-height:calc(var(--ds-control-size,var(--ds-08,16px)) * var(--ds-sf,1));--ds-row-height:calc(var(--ds-row-size,var(--ds-1,20px)) * var(--ds-sf,1));--ds-type-size-default:calc(var(--ds-text-size,14px) * var(--ds-sf,1));--ds-type-size-small:calc(var(--ds-small-text-size,10px) * var(--ds-sf,1));--ds-type-size-heading:calc(var(--ds-heading-text-size,13px) * var(--ds-sf,1));--ds-type-size-display:calc(var(--ds-display-text-size,20px) * var(--ds-sf,1));--ds-type-lineheight-default:calc(var(--ds-text-leading,16px) * var(--ds-sf,1));--ds-type-letterspacing-default:calc(var(--ds-text-tracking,-.3px) * var(--ds-sf,1));--ds-radius:calc(var(--ds-corner-size,4px) * var(--ds-sf,1));--ds-radius-card:calc(var(--ds-card-corner-size,4px) * var(--ds-sf,1))}:host{--ds-menu-row:var(--ds-row-height);box-sizing:border-box;min-width:calc(8 * var(--ds-unit));max-height:var(--ds-menu-max-height,calc(16 * var(--ds-unit)));background:0 0;border:0;padding:0;display:block}:host([hidden]){display:none!important}.frame{box-sizing:border-box;width:100%;max-height:min(var(--ds-menu-max-height,calc(16 * var(--ds-unit))), var(--ds-menu-available-height,100vh));padding:calc(var(--ds-unit) / 2 - 1px);border:1px solid var(--ds-border-color);border-radius:var(--ds-radius-card);background:var(--ds-paper);color:var(--ds-text-color);box-shadow:none;font-family:\"Inter Arrows\", var(--ds-typeface-regular);font-feature-settings:var(--ds-font-features);font-size:var(--ds-type-size-default);line-height:var(--ds-type-lineheight-default);letter-spacing:var(--ds-type-letterspacing-default);flex-direction:column;gap:0;display:flex;overflow-y:auto}slot{display:contents}::slotted(:is(ds-button,ds-file-picker)){--ds-button-height:var(--ds-menu-row);flex:none;width:100%}::slotted(:is(button,a,[role=option],[role^=menuitem]):not(ds-button,ds-file-picker)){box-sizing:border-box!important;height:var(--ds-menu-row)!important;min-height:var(--ds-menu-row)!important;max-height:var(--ds-menu-row)!important;line-height:var(--ds-type-lineheight-default)!important;flex:none!important;margin-block:0!important;padding-block:0!important}:host([floating]:not([open])){display:none}:host([floating]){min-width:0;width:var(--ds-menu-width,var(--ds-menu-anchor-width));z-index:1;scroll-padding:calc(var(--ds-unit) / 2);margin:0;position:fixed;inset:auto}:host([floating]) ::slotted(:is(ds-button,ds-file-picker)){--ds-button-height:var(--ds-menu-row);--ds-button-align:flex-start;--ds-button-padding:0 calc(4px * var(--ds-sf));flex:none;width:100%}:host([data-grid]){width:max-content;min-width:0}:host([data-grid]) .frame{grid-template-columns:repeat(var(--ds-menu-columns), var(--ds-row-height));width:max-content;max-width:100%;display:grid}:host([data-grid]) ::slotted(:is(ds-button,ds-file-picker)){--ds-button-height:var(--ds-menu-row);--ds-button-min-width:0px;--ds-button-padding:0;--ds-button-align:center}:host([compact]){--ds-menu-row:calc(var(--ds-row-height) - 1px);width:var(--ds-menu-width,calc(8 * var(--ds-unit)));min-width:calc(4 * var(--ds-unit));max-width:100%;max-height:none}:host([compact]) .frame{background:0 0;border:0;border-radius:0;gap:1px;padding:0;overflow:visible}:host([compact]) ::slotted(:is(ds-button,ds-file-picker)){--ds-button-height:var(--ds-menu-row);--ds-button-padding:0 calc(4px * var(--ds-sf));--ds-button-background:var(--ds-fill);--ds-button-color:var(--ds-text-color);--ds-radius:0px;width:100%}:host([floating]) ::slotted(:is(ds-button,ds-file-picker):is(:hover,:focus-within):not([disabled],[data-disabled])){--ds-button-background:var(--ds-fill)}:host([trigger-mode=context]),:host([trigger-mode=submenu]),:host([trigger-mode=manual]){width:var(--ds-menu-width,calc(8 * var(--ds-unit)))}:host([data-grid]){width:calc((var(--ds-menu-columns) + 1) * var(--ds-row-height))}:host([data-grid]) .frame{width:100%;padding-inline:calc(var(--ds-unit) / 2 - 1px)}:host([data-grid]) ::slotted([data-ds-menu-start]){grid-column-start:1}:host([data-grid]) ::slotted(:is([data-ds-menu-row],[data-ds-menu-separator],[data-ds-menu-label])){grid-column:1/-1}:host([data-grid]) ::slotted([data-ds-menu-row]){--ds-button-align:flex-start;--ds-button-padding:0 calc(4px * var(--ds-sf))}::slotted([data-ds-menu-label]){box-sizing:border-box;height:var(--ds-menu-row);padding:0 calc(4px * var(--ds-sf));color:var(--ds-text-color-muted);display:block}::slotted([data-ds-menu-separator]){box-sizing:border-box;border:0;border-top:1px solid var(--ds-border-color);width:100%;margin:calc(var(--ds-unit) / 2 - 1px) 0 calc(var(--ds-unit) / 2)}", bi = "[data-ds-shape=square],:host([data-ds-shape=square]){--ds-corner-size:0px;--ds-corner-shape:round;--ds-button-inset:.5px}[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:4px;--ds-corner-shape:round;--ds-button-inset:2.5px}[data-ds-shape=circular],:host([data-ds-shape=circular]){--ds-corner-size:999px;--ds-corner-shape:round;--ds-button-inset:5px}@supports (corner-shape:squircle){[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:8px;--ds-corner-shape:squircle}}:root,:host,:where([data-ds-surface]){--ds-unit:calc(var(--ds-1,20px) * var(--ds-sf,1));--ds-control-height:calc(var(--ds-control-size,var(--ds-08,16px)) * var(--ds-sf,1));--ds-row-height:calc(var(--ds-row-size,var(--ds-1,20px)) * var(--ds-sf,1));--ds-type-size-default:calc(var(--ds-text-size,14px) * var(--ds-sf,1));--ds-type-size-small:calc(var(--ds-small-text-size,10px) * var(--ds-sf,1));--ds-type-size-heading:calc(var(--ds-heading-text-size,13px) * var(--ds-sf,1));--ds-type-size-display:calc(var(--ds-display-text-size,20px) * var(--ds-sf,1));--ds-type-lineheight-default:calc(var(--ds-text-leading,16px) * var(--ds-sf,1));--ds-type-letterspacing-default:calc(var(--ds-text-tracking,-.3px) * var(--ds-sf,1));--ds-radius:calc(var(--ds-corner-size,4px) * var(--ds-sf,1));--ds-radius-card:calc(var(--ds-card-corner-size,4px) * var(--ds-sf,1))}:host([data-field]){--ds-select-unit:calc(var(--ds-1) * var(--ds-sf));vertical-align:bottom;width:max-content;min-width:0;max-width:100%;max-height:none;height:var(--ds-control-height);display:inline-flex;position:relative}:host([data-field]:not([data-listbox])){flex:none!important;justify-self:start!important;width:max-content!important}:host([hidden]){display:none!important}::slotted(select){field-sizing:content;appearance:none!important;box-sizing:border-box!important;width:auto!important;min-width:0!important;max-width:100%!important;height:100%!important;min-height:0!important;padding:0 var(--ds-select-unit) 0 calc(4px * var(--ds-sf))!important;border:1px solid var(--ds-border-color)!important;border-radius:var(--ds-radius)!important;corner-shape:var(--ds-corner-shape,round)!important;background:var(--ds-input-background)!important;color:var(--ds-input-color)!important;font-family:\"Inter Arrows\", var(--ds-typeface-regular)!important;font-size:var(--ds-type-size-default)!important;font-weight:var(--ds-type-weight-default)!important;letter-spacing:var(--ds-type-letterspacing-default)!important;line-height:calc(var(--ds-control-height) - 2px)!important;box-shadow:none!important;cursor:pointer!important;margin:0!important;display:block!important}.arrow{pointer-events:none;inset-inline-end:calc(2px * var(--ds-sf));width:var(--ds-control-height);height:var(--ds-control-height);background:var(--ds-input-color);mask:var(--ds-select-arrow) center / contain no-repeat;position:absolute;top:50%;transform:translateY(-50%)}::slotted(select:focus-visible){outline:2px solid var(--ds-focus-ring)!important;outline-offset:1px!important}::slotted(select:disabled){cursor:default!important;opacity:.5!important}.arrow.disabled{opacity:.5}.arrow[hidden]{display:none}::slotted(select[multiple]),::slotted(select[size]:not([size=\"0\"]):not([size=\"1\"])){padding:0 calc(4px * var(--ds-sf))!important;line-height:calc(var(--ds-select-unit) - 2px)!important}:host([data-listbox]){width:calc(8 * var(--ds-select-unit));height:calc(var(--ds-select-rows,1) * var(--ds-select-unit))}:host([data-listbox]) ::slotted(select){width:100%!important}:host([fit]:not([data-listbox])){width:max-content}:host([fit]:not([data-listbox])) ::slotted(select){width:auto!important;max-width:100%!important}:host([chip]:not([data-listbox])) ::slotted(select){background:var(--ds-button-background-color-secondary)!important;color:var(--ds-button-text-color)!important;line-height:var(--ds-control-height)!important;border:0!important}:host([chip][primary]:not([data-listbox])) ::slotted(select){background:var(--ds-button-background-color-primary)!important;color:var(--ds-button-text-color-on-accent)!important}:host([chip]) .arrow{background:var(--ds-button-text-color)}:host([chip][primary]) .arrow{background:var(--ds-button-text-color-on-accent)}:host([swatch]:not([swatch=\"\"]):not([data-listbox])){width:var(--ds-select-unit);height:var(--ds-select-unit);border-radius:var(--ds-radius);background:var(--ds-input-background)}:host([swatch]:not([swatch=\"\"]):not([data-listbox])) ::slotted(select){z-index:1;opacity:0!important;width:100%!important;position:relative!important}:host([swatch]:not([swatch=\"\"]):not([data-listbox]):focus-within){outline:2px solid var(--ds-focus-ring);outline-offset:1px}ds-swatch{pointer-events:none;margin:auto;position:absolute;inset:0}ds-swatch.disabled{opacity:.5}:host([data-listed]){cursor:pointer}:host([data-listed]) ::slotted(select){pointer-events:none!important}.list{--ds-menu-width:var(--ds-select-list-width)}.choice,.group-label{box-sizing:border-box;align-items:flex-end;gap:calc(4px * var(--ds-sf));width:100%;height:var(--ds-row-height);min-width:0;padding:0 calc(4px * var(--ds-sf));color:var(--ds-text-color);font:inherit;line-height:var(--ds-type-lineheight-default);text-align:start;white-space:nowrap;background:0 0;border:0;border-radius:0;flex:none;margin:0;display:flex}.choice{cursor:pointer;-webkit-tap-highlight-color:transparent;outline:none}.choice:hover:not(:disabled),.choice:focus-visible{background:var(--ds-row-fill-hover,var(--ds-fill))}.choice:active:not(:disabled){background:var(--ds-row-fill-press,var(--ds-fill-hover))}.choice:focus-visible{box-shadow:inset 0 0 0 2px var(--ds-focus-ring)}.choice:disabled{cursor:default;opacity:.5}.group{flex-direction:column;display:flex}.group-label{color:var(--ds-text-color-muted)}.name{flex:0 auto;min-width:0;overflow:hidden}.details{min-width:0;color:var(--ds-text-color-muted);flex:0 auto;overflow:hidden}.shortcut{color:var(--ds-text-color-muted);flex:none;margin-inline-start:auto}.mark{width:calc(16px * var(--ds-sf));height:calc(16px * var(--ds-sf));flex:none}.check{width:calc(16px * var(--ds-sf));height:calc(16px * var(--ds-sf));mask:var(--ds-select-check) center / contain no-repeat;visibility:hidden;background:currentColor;flex:none;margin-inline-start:auto}.shortcut+.check{margin-inline-start:0}.choice[aria-selected=true] .check{visibility:visible}.choice[aria-selected=true] .name{font-weight:var(--ds-row-current-weight,var(--ds-type-weight-bold))}";
K("ds-swatch", class extends R {
	static properties = {
		value: { type: String },
		selected: {
			type: Boolean,
			reflect: !0
		}
	};
	constructor() {
		super(), this.value = "transparent", this.selected = !1;
	}
	static styles = g`
    :host { display: inline-block; flex: 0 0 auto; width: calc(var(--ds-08) * var(--ds-sf)); height: calc(var(--ds-08) * var(--ds-sf)); vertical-align: middle; }
    :host([hidden]) { display: none !important; }
    span { display: block; box-sizing: border-box; width: 100%; height: 100%; border: 1px solid var(--ds-border-color); }
    :host([selected]) span { outline: 2px solid var(--ds-text-color); outline-offset: 0; }
  `;
	render() {
		return M`<span style=${$r({ backgroundColor: this.value })}></span>`;
	}
});
//#endregion
//#region src/vendor/ds1/0-face/anchored-panel.ts
function xi(e, t, n, r = 4) {
	let i = n.left + n.width - r, a = n.top + n.height - r, o = n.left + r, s = n.top + r, c = Math.max(0, a - e.bottom - 4), l = Math.max(0, e.top - 4 - s), u = c < t.height && l > c, d = u ? l : c, f = Math.min(t.height, d);
	return {
		left: Math.max(o, Math.min(e.left + (e.width - t.width) / 2, i - t.width)),
		top: Math.max(s, u ? e.top - 4 - f : Math.min(e.bottom + 4, a - f)),
		availableHeight: d,
		availableWidth: Math.max(0, i - o)
	};
}
var Si = /* @__PURE__ */ new WeakMap();
function Ci(e) {
	let t = e.ownerDocument, n = t.defaultView, r = Si.get(t);
	r?.isConnected || (r = t.createElement("span"), r.setAttribute("aria-hidden", "true"), r.style.cssText = "position:fixed;visibility:hidden;pointer-events:none;inset:0;width:0;height:0;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)", t.body.appendChild(r), Si.set(t, r));
	let i = n.getComputedStyle(r), a = parseFloat(i.paddingLeft) || 0, o = parseFloat(i.paddingRight) || 0, s = parseFloat(i.paddingTop) || 0, c = parseFloat(i.paddingBottom) || 0, l = n.visualViewport;
	return {
		left: (l?.offsetLeft ?? 0) + a,
		top: (l?.offsetTop ?? 0) + s,
		width: Math.max(0, (l?.width ?? n.innerWidth) - a - o),
		height: Math.max(0, (l?.height ?? n.innerHeight) - s - c)
	};
}
function wi(e) {
	return e.ownerDocument.defaultView?.matchMedia("(max-width: 768px)").matches ?? !1;
}
//#endregion
//#region src/vendor/ds1/2-core/styles/ds-file-picker.css?inline
var Ti = "[data-ds-shape=square],:host([data-ds-shape=square]){--ds-corner-size:0px;--ds-corner-shape:round;--ds-button-inset:.5px}[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:4px;--ds-corner-shape:round;--ds-button-inset:2.5px}[data-ds-shape=circular],:host([data-ds-shape=circular]){--ds-corner-size:999px;--ds-corner-shape:round;--ds-button-inset:5px}@supports (corner-shape:squircle){[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:8px;--ds-corner-shape:squircle}}:root,:host,:where([data-ds-surface]){--ds-unit:calc(var(--ds-1,20px) * var(--ds-sf,1));--ds-control-height:calc(var(--ds-control-size,var(--ds-08,16px)) * var(--ds-sf,1));--ds-row-height:calc(var(--ds-row-size,var(--ds-1,20px)) * var(--ds-sf,1));--ds-type-size-default:calc(var(--ds-text-size,14px) * var(--ds-sf,1));--ds-type-size-small:calc(var(--ds-small-text-size,10px) * var(--ds-sf,1));--ds-type-size-heading:calc(var(--ds-heading-text-size,13px) * var(--ds-sf,1));--ds-type-size-display:calc(var(--ds-display-text-size,20px) * var(--ds-sf,1));--ds-type-lineheight-default:calc(var(--ds-text-leading,16px) * var(--ds-sf,1));--ds-type-letterspacing-default:calc(var(--ds-text-tracking,-.3px) * var(--ds-sf,1));--ds-radius:calc(var(--ds-corner-size,4px) * var(--ds-sf,1));--ds-radius-card:calc(var(--ds-card-corner-size,4px) * var(--ds-sf,1))}:host{vertical-align:middle;width:max-content;min-width:0;max-width:100%;height:var(--ds-row-height);border-radius:var(--ds-radius);corner-shape:var(--ds-corner-shape,round);display:inline-flex;position:relative}:host([hidden]){display:none!important}ds-button{--ds-button-height:var(--ds-row-height);pointer-events:none;max-width:100%;overflow:hidden}:host([icon]){width:var(--ds-row-height)}:host([preview]){width:calc(4 * var(--ds-unit));height:calc(4 * var(--ds-unit))}:host([preview]) ds-button{--ds-button-height:calc(4 * var(--ds-unit))}:host([preview][compact]){width:calc(2 * var(--ds-unit));height:calc(2 * var(--ds-unit))}:host([preview][compact]) ds-button{--ds-button-height:calc(2 * var(--ds-unit))}::slotted([slot=content]){justify-content:center;align-items:center;gap:calc(var(--ds-unit) / 2);pointer-events:none;display:inline-flex}:host([preview]) ::slotted([slot=content]){width:100%;height:100%}:host([area]){width:100%;height:calc(8 * var(--ds-unit))}:host([area]) ds-button{--ds-button-min-width:0px;--ds-button-height:calc(8 * var(--ds-unit));width:100%}:host([area][compact]){height:calc(4 * var(--ds-unit))}:host([area][compact]) ds-button{--ds-button-height:calc(4 * var(--ds-unit))}:host([area]) slot[name=content]{text-align:center;white-space:normal;width:100%;display:block}:host([area]) ::slotted([slot=content]){box-sizing:border-box;width:100%;padding:var(--ds-unit);white-space:normal}::slotted(input[type=file]){box-sizing:border-box!important;opacity:0!important;clip:auto!important;clip-path:none!important;cursor:pointer!important;border:0!important;width:100%!important;min-width:0!important;max-width:none!important;height:100%!important;min-height:0!important;max-height:none!important;margin:0!important;padding:0!important;display:block!important;position:absolute!important;inset:0!important;overflow:hidden!important}::slotted(input[type=file]:disabled){cursor:default!important}::slotted(input[hidden]){display:none!important}:host(:focus-within){outline:2px solid var(--ds-focus-ring);outline-offset:1px}:host(:is([secondary],[area]):hover:not([data-disabled])) ds-button{--ds-button-background:var(--ds-fill-hover)}:host(:is([data-dragging],[dragging]):not([data-disabled])){outline:2px solid var(--ds-focus-ring);outline-offset:1px}:host(:is([data-dragging],[dragging]):not([data-disabled])) ds-button{--ds-button-background:var(--ds-fill-hover)}:host([data-menu-item]){width:100%}:host([data-menu-item]) ds-button{--ds-button-padding:0 calc(4px * var(--ds-sf));width:100%}:host([data-menu-item]:is(:hover,:focus-within):not([data-disabled])) ds-button{--ds-button-background:var(--ds-fill)}";
K("ds-file-picker", class extends R {
	static properties = {
		label: { type: String },
		icon: {
			type: Boolean,
			reflect: !0
		},
		preview: {
			type: Boolean,
			reflect: !0
		},
		area: {
			type: Boolean,
			reflect: !0
		},
		dragging: {
			type: Boolean,
			reflect: !0
		},
		compact: {
			type: Boolean,
			reflect: !0
		},
		primary: {
			type: Boolean,
			reflect: !0
		},
		secondary: {
			type: Boolean,
			reflect: !0
		}
	};
	static styles = h(Ti);
	controlDisabled = !1;
	observer = new MutationObserver(() => this.syncDisabled());
	constructor() {
		super(), this.label = "", this.icon = this.preview = this.area = this.dragging = this.compact = this.primary = this.secondary = !1;
	}
	control() {
		return this.querySelector(":scope > input[type=file]");
	}
	syncDisabled() {
		if (!this.isConnected) return;
		let e = this.control();
		this.toggleAttribute("data-menu-item", e?.getAttribute("role") === "menuitem"), this.controlDisabled = !e || e.matches(":disabled"), this.toggleAttribute("data-disabled", this.controlDisabled), this.controlDisabled && this.clearDrag(), this.requestUpdate();
	}
	showDrag = (e) => {
		let t = this.control();
		t && !t.matches(":disabled") && e.dataTransfer?.types.includes("Files") && this.setAttribute("data-dragging", "");
	};
	clearDrag = () => {
		this.removeAttribute("data-dragging");
	};
	observeControl() {
		if (this.observer.disconnect(), !this.isConnected) return;
		let e = this.control();
		e && this.observer.observe(e, {
			attributes: !0,
			attributeFilter: ["disabled", "role"]
		});
		for (let e = this.parentElement; e; e = e.parentElement) e.localName === "fieldset" && this.observer.observe(e, {
			attributes: !0,
			attributeFilter: ["disabled"]
		});
		this.syncDisabled();
	}
	connectedCallback() {
		super.connectedCallback(), this.observeControl(), this.addEventListener("dragenter", this.showDrag), this.addEventListener("dragleave", this.clearDrag), this.addEventListener("drop", this.clearDrag);
	}
	disconnectedCallback() {
		this.observer.disconnect(), this.clearDrag(), this.removeEventListener("dragenter", this.showDrag), this.removeEventListener("dragleave", this.clearDrag), this.removeEventListener("drop", this.clearDrag), super.disconnectedCallback();
	}
	focus(e) {
		this.control()?.focus(e);
	}
	render() {
		return M`<ds-button control="host" inert aria-hidden="true" tabindex="-1"
      .icon=${!this.area && (this.icon || this.preview)} .primary=${this.primary} .secondary=${this.secondary || this.area}
      .disabled=${this.controlDisabled}><slot name="content">${this.label}</slot></ds-button>
      <slot @slotchange=${this.observeControl}></slot>`;
	}
});
function Ei(e, t, { resolve: n = () => e, touch: r = !0, selection: i = !1, aria: a = !0 } = {}) {
	let o = e.ownerDocument, s = e.getAttribute("aria-haspopup"), c = e.classList.contains("ds-context-trigger"), l, u, d = null, f, p = !1, m;
	a && e.setAttribute("aria-haspopup", "menu"), i && e.classList.add("ds-context-trigger");
	let h = (e) => e.isConnected && !e.matches(":disabled, [disabled], [aria-disabled=\"true\"], [data-disabled]") && !e.closest("[hidden], [inert]"), g = () => {
		clearTimeout(f), d = null, o.removeEventListener("click", _, !0);
	}, _ = (e) => {
		let t = d && e.composedPath().includes(d);
		g(), t && (e.preventDefault(), e.stopImmediatePropagation());
	}, v = (e) => {
		g(), d = e, o.addEventListener("click", _, !0), f = setTimeout(g, 1e3);
	}, y = () => {
		m = void 0, clearTimeout(l), l = void 0, u = void 0, o.removeEventListener("pointermove", S), o.removeEventListener("pointerup", y), o.removeEventListener("pointercancel", y), d && (clearTimeout(f), f = setTimeout(g, 1e3));
	}, b = (r) => {
		if (r.defaultPrevented) return;
		let a = m;
		m = void 0;
		let o = a && r.button === 2 && Math.hypot(r.clientX - a.event.clientX, r.clientY - a.event.clientY) <= 10 ? new Proxy(a.event, { get(e, t) {
			if (t === "composedPath") return () => a.path;
			if (t === "target") return a.target;
			let n = Reflect.get(e, t, e);
			return typeof n == "function" ? n.bind(e) : n;
		} }) : r;
		if (o !== r && (typeof o.target?.nodeType != "number" || !e.contains(o.target))) return;
		let s = n(o);
		s && h(s) && (y(), d === s ? r.preventDefault() : t({
			x: r.clientX,
			y: r.clientY
		}, s, o) !== !1 && (r.preventDefault(), i && r.button === 0 && v(s)));
	}, x = (e) => {
		if (e.defaultPrevented || e.isComposing || e.altKey || e.ctrlKey || e.metaKey || e.key !== "ContextMenu" && !(e.key === "F10" && e.shiftKey)) return;
		let r = n(e);
		if (!r || !h(r)) return;
		let i = r.getBoundingClientRect();
		t({
			x: i.left,
			y: i.bottom
		}, r, e) !== !1 && (e.preventDefault(), e.stopPropagation());
	}, S = (e) => {
		u && Math.hypot(e.clientX - u.x, e.clientY - u.y) > 10 && y();
	}, C = (i) => {
		if (!r || i.defaultPrevented || i.pointerType !== "touch" || i.button !== 0) return;
		let a = n(i);
		if (!a || !h(a)) return;
		y(), g();
		let s = {
			x: i.clientX,
			y: i.clientY
		};
		u = s, o.addEventListener("pointermove", S), o.addEventListener("pointerup", y), o.addEventListener("pointercancel", y), l = setTimeout(() => {
			l = void 0, u = void 0, p || !h(a) || !e.contains(a) ? y() : t(s, a, i) !== !1 && v(a);
		}, 500);
	}, w = (e) => {
		m = !e.defaultPrevented && e.pointerType === "mouse" && e.button === 2 ? {
			event: e,
			path: e.composedPath(),
			target: e.target
		} : void 0;
	};
	return e.addEventListener("pointerdown", w, !0), e.addEventListener("pointercancel", y, !0), e.addEventListener("contextmenu", b), e.addEventListener("keydown", x), e.addEventListener("pointerdown", C), {
		cancel: y,
		dispose() {
			p = !0, y(), g(), e.removeEventListener("contextmenu", b), e.removeEventListener("keydown", x), e.removeEventListener("pointerdown", C), e.removeEventListener("pointerdown", w, !0), e.removeEventListener("pointercancel", y, !0), a && (s === null ? e.removeAttribute("aria-haspopup") : e.setAttribute("aria-haspopup", s)), i && !c && e.classList.remove("ds-context-trigger");
		}
	};
}
//#endregion
//#region src/vendor/ds1/3-unit/ds-menu.ts
var Di = "[role=\"option\"], [role=\"menuitem\"], [role=\"menuitemradio\"], [role=\"menuitemcheckbox\"]", Oi = "button, a[href], input, select, textarea, [tabindex]", X = "ds-menu, ds-select, ds-context", Z = /* @__PURE__ */ new WeakMap(), Q = /* @__PURE__ */ new WeakMap();
function ki(e) {
	let t = Q.get(e);
	if (t) return t;
	t = {
		menus: /* @__PURE__ */ new Set(),
		blocked: /* @__PURE__ */ new Set(),
		point: null,
		version: 0
	}, Q.set(e, t);
	let n = t, r = (e) => {
		if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
		let t = !n.point || n.point.x !== e.clientX || n.point.y !== e.clientY;
		if (n.point = {
			x: e.clientX,
			y: e.clientY
		}, t) for (let e of n.blocked) e.releaseNavigationHoverIfOutside(n.point);
	};
	return e.addEventListener("pointermove", r, {
		capture: !0,
		passive: !0
	}), e.addEventListener("pointerdown", r, {
		capture: !0,
		passive: !0
	}), t;
}
var Ai = class e extends R {
	static styles = h(yi);
	static properties = {
		compact: {
			type: Boolean,
			reflect: !0
		},
		floating: {
			type: Boolean,
			reflect: !0
		},
		open: {
			type: Boolean,
			reflect: !0
		},
		disabled: {
			type: Boolean,
			reflect: !0
		},
		columns: {
			type: Number,
			reflect: !0
		},
		anchor: { attribute: !1 },
		placement: { type: String },
		trigger: { attribute: !1 },
		for: { type: String },
		triggerMode: {
			type: String,
			attribute: "trigger-mode",
			reflect: !0
		},
		contextSelector: {
			type: String,
			attribute: "context-selector"
		},
		hover: {
			type: Boolean,
			reflect: !0
		},
		controller: { attribute: !1 },
		activeId: {
			type: String,
			attribute: "active-id"
		}
	};
	listeningTo = null;
	listeningTrigger = null;
	listeningSelector = "";
	listeningMode = null;
	contextBinding;
	triggerAttributes = /* @__PURE__ */ new Map();
	openingEdge = "first";
	search = "";
	searchAt = 0;
	gridColumn = 0;
	focusOnOpen = !0;
	hoverTimer;
	hoverAwaitingExit = !1;
	hoverNavigationVersion = 0;
	hoverReleased = !1;
	shown = !1;
	connectedBefore = !1;
	observer;
	choicesObserver;
	opener = null;
	observedAnchor = null;
	restoreFocus = !0;
	heldFocus = !1;
	focusVersion = 0;
	contextPoint = null;
	invokingControl = null;
	closesOnChoice = !1;
	get parentMenu() {
		return this.parentElement?.closest(X) ?? null;
	}
	get rootMenu() {
		return this.parentMenu?.rootMenu ?? this;
	}
	constructor() {
		super(), this.compact = !1, this.floating = !1, this.open = !1, this.disabled = !1, this.placement = "bottom", this.triggerMode = "click", this.contextSelector = "", this.columns = 1, this.anchor = null, this.trigger = null, this.for = "", this.hover = !1, this.controller = null, this.activeId = "", this.addEventListener("keydown", this.onKeyDown), this.addEventListener("click", this.onChoice), this.addEventListener("pointerdown", this.retainController), this.addEventListener("pointerover", this.onPointerChoice), this.addEventListener("pointerenter", this.onHoverEnter), this.addEventListener("pointerleave", this.onHoverLeave), this.addEventListener("focusin", () => {
			this.heldFocus = !0, this.syncTabStops();
		}), this.addEventListener("focusout", (e) => {
			e.relatedTarget instanceof Node && !this.contains(e.relatedTarget) && (this.heldFocus = !1);
		});
	}
	connectedCallback() {
		super.connectedCallback();
		let e = ki(this.ownerDocument);
		e.menus.add(this);
		let t = this.connectedBefore;
		this.connectedBefore = !0, t && e.version > 0 && this.floating && this.open && (this.requestClose("navigation"), this.open = !1), this.hasAttribute("role") || this.setAttribute("role", "listbox"), this.requestUpdate();
	}
	disconnectedCallback() {
		Q.get(this.ownerDocument)?.menus.delete(this), Q.get(this.ownerDocument)?.blocked.delete(this), this.listeningTo?.removeEventListener("keydown", this.onControllerKey), this.listeningTo = null, this.bindTrigger(null), clearTimeout(this.hoverTimer), this.hide(!0), super.disconnectedCallback();
	}
	get anchorElement() {
		return this.anchor instanceof HTMLElement ? this.anchor : !this.anchor && this.triggerMode !== "context" && this.triggerMode !== "manual" ? this.trigger : null;
	}
	get forTarget() {
		return this.trigger ? this.trigger : this.for ? this.getRootNode().getElementById?.(this.for) ?? null : null;
	}
	updated() {
		this.disabled && this.contextBinding?.cancel(), !this.trigger && this.for && (this.trigger = this.forTarget), this.bindTrigger(this.trigger), this.trigger && !this.contextSelector && (this.trigger.setAttribute("aria-haspopup", this.getAttribute("role") === "menu" ? "menu" : "listbox"), this.trigger.setAttribute("aria-expanded", String(this.open)), this.id && this.trigger.setAttribute("aria-controls", this.id)), this.style.setProperty("--ds-menu-columns", String(Math.max(1, Math.floor(this.columns || 1)))), this.toggleAttribute("data-grid", this.columns > 1), this.listeningTo !== this.controller && (this.listeningTo?.removeEventListener("keydown", this.onControllerKey), this.listeningTo = this.controller, this.listeningTo?.addEventListener("keydown", this.onControllerKey)), this.floating && this.open ? this.show() : this.hide(!0), this.syncTabStops();
		let e = this.anchorElement;
		this.observer && this.observedAnchor !== e && (this.observedAnchor && this.observer.unobserve(this.observedAnchor), e && this.observer.observe(e), this.observedAnchor = e), this.place(), this.scrollActive();
	}
	renderNow() {
		this.performUpdate();
	}
	bindTrigger(e) {
		if (this.listeningTrigger !== e || this.listeningSelector !== this.contextSelector || this.listeningMode !== this.triggerMode) {
			this.contextBinding?.dispose(), this.contextBinding = void 0;
			for (let [e, t] of this.triggerAttributes) t === null ? this.listeningTrigger?.removeAttribute(e) : this.listeningTrigger?.setAttribute(e, t);
			if (this.triggerAttributes.clear(), this.listeningTrigger?.removeEventListener("click", this.onTriggerClick), this.listeningTrigger?.removeEventListener("keydown", this.onTriggerKey), this.listeningTrigger?.removeEventListener("pointerenter", this.onHoverEnter), this.listeningTrigger?.removeEventListener("pointerleave", this.onHoverLeave), this.listeningTrigger = e, this.listeningSelector = this.contextSelector, this.listeningMode = this.triggerMode, this.hoverNavigationVersion = 0, this.holdNavigationHover(), e && this.triggerMode === "context" && (this.contextBinding = Ei(e, (e, t) => {
				if (this.disabled) return !1;
				this.openAt(e, t);
			}, {
				resolve: (e) => this.contextControl(e),
				aria: !1
			})), e && !this.contextSelector) for (let t of [
				"aria-haspopup",
				"aria-expanded",
				"aria-controls"
			]) this.triggerAttributes.set(t, e.getAttribute(t));
			e?.addEventListener("click", this.onTriggerClick), e?.addEventListener("keydown", this.onTriggerKey), e?.addEventListener("pointerenter", this.onHoverEnter), e?.addEventListener("pointerleave", this.onHoverLeave);
		}
	}
	toggleFromTrigger(e, t = { trigger: this.trigger }) {
		if (this.disabled || !this.trigger && this.triggerMode !== "manual" || this.trigger && !this.enabled(this.trigger)) return;
		let n = new CustomEvent("ds-menu-toggle", {
			detail: {
				open: e,
				...t
			},
			bubbles: !0,
			composed: !0,
			cancelable: !0
		});
		this.dispatchEvent(n) && (this.open = e);
	}
	openAt(e, t = this.trigger, { focus: n = !0 } = {}) {
		if (this.disabled || this.trigger && !this.enabled(this.trigger) || t && (!t.isConnected || !this.enabled(t))) return;
		this.contextPoint = {
			left: e.x,
			right: e.x,
			top: e.y,
			bottom: e.y,
			width: 0,
			height: 0
		};
		let r = this.ownerDocument.activeElement;
		this.invokingControl = t?.matches(Oi) ? t : t?.contains(r) && r instanceof HTMLElement ? r : t?.querySelector(Oi) ?? t, this.shown && (this.opener = this.invokingControl), this.focusOnOpen = n, this.openingEdge = "first", this.toggleFromTrigger(!0, {
			trigger: t,
			point: e
		}), this.open && this.place();
	}
	onChoice = (e) => {
		if (!this.closesOnChoice) return;
		let t = e.composedPath().find((e) => e instanceof HTMLElement && e.matches(Di));
		t && t.closest(X) === this && !t.hasAttribute("data-keep-open") && this.enabled(t) && (t.getAttribute("aria-haspopup") || t.matches("ds-file-picker, input[type=\"file\"]") || t.querySelector("input[type=\"file\"]") || queueMicrotask(() => {
			!e.defaultPrevented && this.open && this.select();
		}));
	};
	select() {
		this.rootMenu.requestClose("select");
	}
	contextControl(t) {
		if (this.disabled || !this.trigger) return null;
		if (!this.contextSelector) return this.enabled(this.trigger) ? this.trigger : null;
		for (let n of t.composedPath()) {
			if (n === this.trigger) break;
			if (n instanceof e) return null;
			if (n instanceof HTMLElement && n.matches(this.contextSelector)) return this.enabled(n) && !n.closest("[hidden], [inert]") ? n : null;
		}
		return null;
	}
	onTriggerClick = (e) => {
		this.triggerMode === "context" || this.triggerMode === "manual" || e.defaultPrevented || this.hover && this.trigger?.matches("a[href], ds-button[href]") || (this.focusOnOpen = !0, this.openingEdge = "first", this.toggleFromTrigger(this.triggerMode === "submenu" || !this.open));
	};
	onTriggerKey = (e) => {
		if (!(e.defaultPrevented || e.isComposing || e.altKey || e.metaKey || e.ctrlKey || e.shiftKey && (this.triggerMode !== "context" || e.key !== "F10") || !this.trigger || !this.enabled(this.trigger)) && this.triggerMode !== "context" && this.triggerMode !== "manual") {
			if (this.triggerMode === "submenu") {
				let t = this.ownerDocument.defaultView?.getComputedStyle(this).direction === "rtl" ? "ArrowLeft" : "ArrowRight";
				if (e.key !== t && e.key !== "Enter" && e.key !== " ") return;
				e.preventDefault(), e.stopPropagation(), this.focusOnOpen = !0, this.open ? this.initialChoice()?.focus() : this.toggleFromTrigger(!0);
			} else (e.key === "ArrowDown" || e.key === "ArrowUp") && (e.preventDefault(), this.focusOnOpen = !0, this.openingEdge = e.key === "ArrowUp" ? "last" : "first", this.open ? this.initialChoice()?.focus() : this.toggleFromTrigger(!0));
		}
	};
	holdNavigationHover() {
		if (!this.isConnected) return;
		let e = Q.get(this.ownerDocument);
		if (!e?.version || !this.hover && this.triggerMode !== "submenu" || (this.hoverNavigationVersion !== e.version && (this.hoverNavigationVersion = e.version, this.hoverReleased = !1), this.hoverReleased)) return;
		let t = e.point, n = (this.trigger ?? this).getBoundingClientRect();
		this.hoverAwaitingExit = !!(t && n.width > 0 && n.height > 0 && t.x >= n.left && t.x < n.right && t.y >= n.top && t.y < n.bottom), this.hoverAwaitingExit ? e.blocked.add(this) : e.blocked.delete(this);
	}
	releaseNavigationHoverIfOutside(e) {
		let t = (this.trigger ?? this).getBoundingClientRect();
		e.x >= t.left && e.x < t.right && e.y >= t.top && e.y < t.bottom || (this.hoverAwaitingExit = !1, this.hoverReleased = !0, Q.get(this.ownerDocument)?.blocked.delete(this));
	}
	onHoverEnter = (e) => {
		if (!this.hover && this.triggerMode !== "submenu" || e.pointerType === "touch") return;
		clearTimeout(this.hoverTimer);
		let t = Q.get(this.ownerDocument)?.point;
		t && t.x === e.clientX && t.y === e.clientY && this.holdNavigationHover(), !this.hoverAwaitingExit && (this.open || (this.focusOnOpen = !1, this.toggleFromTrigger(!0)));
	};
	onHoverLeave = (e) => {
		!this.hover && this.triggerMode !== "submenu" || e.pointerType === "touch" || e.relatedTarget instanceof Node && (this.contains(e.relatedTarget) || this.trigger?.contains(e.relatedTarget)) || (clearTimeout(this.hoverTimer), this.hoverTimer = setTimeout(() => {
			this.open && !this.contains(this.ownerDocument.activeElement) && this.requestClose("outside");
		}, 180));
	};
	initialChoice() {
		let e = this.items();
		return e.find((e) => e.getAttribute("aria-selected") === "true" || e.getAttribute("aria-checked") === "true") ?? (this.openingEdge === "last" ? e.at(-1) : e[0]);
	}
	items(e = !1) {
		return Array.from(this.querySelectorAll(Di)).filter((t) => (e || this.enabled(t)) && !t.closest("[hidden], [inert]") && t.closest(X) === this);
	}
	enabled(e) {
		return !e.matches(":disabled") && !e.hasAttribute("disabled") && e.getAttribute("aria-disabled") !== "true";
	}
	syncTabStops() {
		if (!this.floating) return;
		let e = this.items(!0), t = this.controller ? null : e.find((e) => e === this.ownerDocument.activeElement) ?? e.find((e) => this.enabled(e));
		for (let n of e) n.tabIndex = n === t ? 0 : -1;
	}
	onChoicesChanged = () => {
		this.syncTabStops(), this.place(), this.scrollActive(), this.shown && this.heldFocus && this.ownerDocument.activeElement === this.ownerDocument.body && this.focusInitial(this.ownerDocument.body);
	};
	focusInitial(e) {
		let t = ++this.focusVersion;
		Promise.all(Array.from(this.querySelectorAll("ds-button, ds-file-picker"), (e) => e.updateComplete)).then(() => {
			let n = this.ownerDocument.activeElement;
			if (this.shown && this.isConnected && t === this.focusVersion && !this.controller && (n === e || n === this.opener || n === this.ownerDocument.body || n === this)) {
				let e = this.initialChoice();
				e?.focus({ preventScroll: !0 }), e && this.scrollChoice(e);
			}
		});
	}
	isTop() {
		return [...Z.get(this.ownerDocument) ?? []].at(-1) === this;
	}
	show() {
		if (this.shown || !this.isConnected) return;
		this.shown = !0;
		let e = this.ownerDocument.activeElement;
		this.opener = this.invokingControl ?? this.controller ?? this.trigger ?? (this.anchor instanceof HTMLElement ? this.anchor : null) ?? (e instanceof HTMLElement ? e : null), this.search = "", this.restoreFocus = !0, this.heldFocus = !1;
		let t = Z.get(this.ownerDocument);
		t || Z.set(this.ownerDocument, t = /* @__PURE__ */ new Set()), t.add(this), this.popover = "manual", this.showPopover?.(), this.choicesObserver = new MutationObserver(this.onChoicesChanged), this.choicesObserver.observe(this, {
			childList: !0,
			subtree: !0,
			attributes: !0,
			attributeFilter: [
				"disabled",
				"hidden",
				"aria-disabled"
			]
		}), typeof ResizeObserver < "u" && (this.observer = new ResizeObserver(this.place), this.observer.observe(this), this.observedAnchor = this.anchorElement, this.observedAnchor && this.observer.observe(this.observedAnchor)), this.ownerDocument.addEventListener("pointerdown", this.onOutside, !0), this.ownerDocument.addEventListener("focusin", this.onOutside), this.ownerDocument.addEventListener("keydown", this.onEscape, !0), this.ownerDocument.addEventListener("scroll", this.place, !0), this.ownerDocument.defaultView?.addEventListener("resize", this.place), this.ownerDocument.defaultView?.visualViewport?.addEventListener("resize", this.place), this.ownerDocument.defaultView?.visualViewport?.addEventListener("scroll", this.place), !this.controller && this.focusOnOpen && this.focusInitial(e);
	}
	hide(e) {
		if (!this.shown) return;
		this.shown = !1;
		for (let e of this.querySelectorAll(X)) e.open && e.requestClose("parent");
		clearTimeout(this.hoverTimer), this.focusVersion++;
		let t = this.ownerDocument.activeElement, n = t instanceof Node && this.contains(t);
		this.isConnected && this.matches(":popover-open") && this.hidePopover?.(), Z.get(this.ownerDocument)?.delete(this), this.observer?.disconnect(), this.observer = void 0, this.observedAnchor = null, this.choicesObserver?.disconnect(), this.choicesObserver = void 0, this.ownerDocument.removeEventListener("pointerdown", this.onOutside, !0), this.ownerDocument.removeEventListener("focusin", this.onOutside), this.ownerDocument.removeEventListener("keydown", this.onEscape, !0), this.ownerDocument.removeEventListener("scroll", this.place, !0), this.ownerDocument.defaultView?.removeEventListener("resize", this.place), this.ownerDocument.defaultView?.visualViewport?.removeEventListener("resize", this.place), this.ownerDocument.defaultView?.visualViewport?.removeEventListener("scroll", this.place);
		let r = new CustomEvent("ds-menu-close-focus", {
			bubbles: !0,
			composed: !0,
			cancelable: !0
		});
		this.dispatchEvent(r) && e && this.restoreFocus && (n || this.heldFocus && t === this.ownerDocument.body) && this.opener?.isConnected && this.opener.focus({ preventScroll: !0 }), this.opener = null, this.invokingControl = null, this.heldFocus = !1;
	}
	requestClose(e) {
		this.restoreFocus = e !== "outside" && e !== "parent" && e !== "navigation";
		for (let e of this.querySelectorAll(X)) e.restoreFocus = !1;
		let t = new CustomEvent("ds-menu-close", {
			detail: { reason: e },
			bubbles: !0,
			composed: !0,
			cancelable: !0
		});
		this.dispatchEvent(t) && (this.open = !1);
	}
	onEscape = (e) => {
		this.isTop() && e.key === "Escape" && !e.defaultPrevented && !e.isComposing && (e.preventDefault(), e.stopPropagation(), this.requestClose("escape"));
	};
	onOutside = (e) => {
		let t = [...Z.get(this.ownerDocument) ?? []].at(-1);
		if (t !== this && (!t || !this.contains(t))) return;
		let n = e.composedPath(), r = this.contextSelector || this.triggerMode === "manual" ? this.invokingControl : this.trigger;
		!n.includes(this) && !(this.anchor instanceof HTMLElement && !this.controller && n.includes(this.anchor)) && !(r && n.includes(r)) && !(this.controller && n.includes(this.controller)) && this.requestClose("outside");
	};
	onPointerChoice = (e) => {
		if (this.controller || this.getAttribute("role") !== "menu" || e.pointerType === "touch") return;
		let t = e.composedPath().find((e) => e instanceof HTMLElement && e.matches(Di));
		t && t.closest(X) === this && this.enabled(t) && t.focus({ preventScroll: !0 });
	};
	retainController = (e) => {
		this.controller && e.button === 0 && e.composedPath().some((e) => e instanceof HTMLElement && e.matches(Di)) && e.preventDefault();
	};
	place = () => {
		let e = this.triggerMode === "context" || this.triggerMode === "manual" ? this.contextPoint ?? this.anchor : this.anchor ?? this.trigger;
		if (!this.shown || !e) return;
		let t = e instanceof HTMLElement ? e.getBoundingClientRect() : e, n = this.ownerDocument.defaultView, r = n.visualViewport, i = r?.offsetLeft ?? 0, a = r?.offsetTop ?? 0, o = r?.width ?? n.innerWidth, s = r?.height ?? n.innerHeight, c = parseFloat(n.getComputedStyle(this).scrollPaddingTop) || 10, l = c * 2, u = (e, t) => t(Math.max(0, e) / l + (t === Math.floor ? .001 : -.001)) * l, d = u(o - 2 * c, Math.floor);
		this.style.maxWidth = `${d}px`;
		let f = Math.min(d, Math.max(4 * l, u(t.width, Math.ceil)));
		if (this.style.setProperty("--ds-menu-anchor-width", `${f}px`), this.hasAttribute("data-ds-hug") && !n.getComputedStyle(this).getPropertyValue("--ds-menu-width").trim()) {
			this.style.width = "max-content";
			let e = this.getBoundingClientRect().width, t = (this.triggerMode === "context" || this.triggerMode === "manual") && this.contextPoint ? 4 * l : f;
			this.style.width = `${Math.min(d, Math.max(t, u(e, Math.ceil)))}px`;
		}
		if (this.placement === "right" || this.placement === "left" || this.triggerMode === "submenu") {
			this.style.setProperty("--ds-menu-available-height", `${u(s - 2 * c, Math.floor)}px`);
			let e = this.getBoundingClientRect(), r = this.placement === "left" || n.getComputedStyle(this).direction === "rtl", l = i + o - t.right, d = t.left - i, f = r ? d >= e.width || d > l : l < e.width && d > l;
			this.style.left = `${Math.max(i + c, Math.min(f ? t.left - e.width : t.right, i + o - c - e.width))}px`, this.style.top = `${Math.max(a + c, Math.min(t.top, a + s - c - e.height))}px`;
			return;
		}
		if (e instanceof HTMLElement && this.triggerMode !== "context" && this.placement === "bottom" && wi(this)) {
			let e = Ci(this);
			this.style.maxWidth = `${u(e.width - 8, Math.floor)}px`;
			let n = this.shadowRoot?.querySelector(".frame"), r = this.getBoundingClientRect(), i = xi(t, {
				width: r.width,
				height: n?.scrollHeight ?? r.height
			}, e);
			this.style.setProperty("--ds-menu-available-height", `${u(i.availableHeight, Math.floor)}px`);
			let a = xi(t, this.getBoundingClientRect(), e);
			this.style.left = `${a.left}px`, this.style.top = `${a.top}px`;
			return;
		}
		let p = a + s - t.bottom - 2 * c, m = t.top - a - 2 * c, h = this.shadowRoot?.querySelector(".frame"), g = Math.min(h?.scrollHeight ?? this.scrollHeight, 8 * l), _ = this.placement === "top" ? m >= g || m >= p : p < g && m > p;
		this.style.setProperty("--ds-menu-available-height", `${u(Math.min(s - 2 * c, _ ? m : p), Math.floor)}px`);
		let v = this.getBoundingClientRect();
		this.style.left = `${Math.max(i + c, Math.min(t.left, i + o - c - v.width))}px`, this.style.top = `${Math.max(a + c, _ ? t.top - c - v.height : t.bottom + c)}px`;
	};
	activate(e) {
		let t = new CustomEvent("ds-menu-active", {
			detail: { id: e.id },
			bubbles: !0,
			composed: !0,
			cancelable: !0
		});
		this.dispatchEvent(t) && (this.activeId = e.id);
	}
	scrollActive() {
		if (!this.controller || !this.shown) return;
		let e = this.items().find((e) => e.id === this.activeId);
		e && this.scrollChoice(e);
	}
	scrollChoice(e) {
		let t = this.shadowRoot?.querySelector(".frame");
		if (!t) return;
		let n = e.getBoundingClientRect(), r = t.getBoundingClientRect();
		n.top < r.top ? t.scrollTop -= r.top - n.top : n.bottom > r.bottom && (t.scrollTop += n.bottom - r.bottom);
	}
	navigate(e, t) {
		if (e.defaultPrevented || e.isComposing || e.altKey || e.metaKey || e.ctrlKey || e.shiftKey || t && (!this.open || !this.floating || !this.isTop())) return;
		let n = this.items(!0);
		if (!n.some((e) => this.enabled(e))) return;
		let r = t ? n.findIndex((e) => e.id === this.activeId) : n.findIndex((t) => e.composedPath().includes(t)), i = Math.max(1, Math.floor(this.columns || 1)), a = this.getAttribute("aria-orientation") === "horizontal", o = this.ownerDocument.defaultView?.getComputedStyle(this).direction === "rtl" ? -1 : 1, s;
		switch (e.key) {
			case "ArrowDown":
				if (a) return;
				s = i > 1 ? this.gridStep(n, r, i, 1) : this.step(n, r, 1, 1);
				break;
			case "ArrowUp":
				if (a) return;
				s = i > 1 ? this.gridStep(n, r, i, -1) : this.step(n, r, 1, -1);
				break;
			case "ArrowRight":
				if (a) {
					s = this.step(n, r, 1, o);
					break;
				}
				if (i === 1 || t) return;
				s = this.step(n, r, 1, 1);
				break;
			case "ArrowLeft":
				if (a) {
					s = this.step(n, r, 1, -o);
					break;
				}
				if (i === 1 || t) return;
				s = this.step(n, r, 1, -1);
				break;
			case "Home":
				if (t) return;
				s = n.findIndex((e) => this.enabled(e));
				break;
			case "End":
				if (t) return;
				s = this.lastEnabled(n);
				break;
			case "Enter":
				t && r >= 0 && this.enabled(n[r]) && (e.preventDefault(), n[r].click());
				return;
			default:
				if (t || e.key.length !== 1 || e.key === " ") return;
				let c = Date.now();
				this.search = (c - this.searchAt < 700 ? this.search : "") + e.key.toLocaleLowerCase(), this.searchAt = c;
				let l = [...this.search].every((e) => e === this.search[0]), u = l ? this.search[0] : this.search, d = l ? r + 1 : Math.max(0, r);
				s = -1;
				for (let e = 0; e < n.length; e++) {
					let t = (d + e + n.length) % n.length, r = n[t];
					if (this.enabled(r) && (r.getAttribute("data-text-value") ?? r.getAttribute("aria-label") ?? r.textContent ?? "").trim().toLocaleLowerCase().startsWith(u)) {
						s = t;
						break;
					}
				}
		}
		if (s < 0) return;
		e.preventDefault();
		let c = n[s];
		t ? this.activate(c) : (c.focus({ preventScroll: !0 }), this.scrollChoice(c));
	}
	lastEnabled(e) {
		return e.reduce((e, t, n) => this.enabled(t) ? n : e, -1);
	}
	gridStep(e, t, n, r) {
		if (t < 0) return r > 0 ? e.findIndex((e) => this.enabled(e)) : this.lastEnabled(e);
		let i = [], a = [], o = () => {
			a.length && i.push({
				indices: a,
				wide: !1
			}), a = [];
		};
		for (let t = 0; t < e.length; t++) {
			let r = e[t];
			r.closest("[data-ds-menu-row], [data-ds-menu-start]") && o(), r.closest("[data-ds-menu-row]") ? i.push({
				indices: [t],
				wide: !0
			}) : (a.push(t), a.length === n && o());
		}
		o();
		let s = i.findIndex((e) => e.indices.includes(t));
		if (s < 0) return t;
		i[s].wide || (this.gridColumn = i[s].indices.indexOf(t));
		for (let t = 1; t <= i.length; t++) {
			let n = i[(s + r * t + i.length * t) % i.length], a = n.indices[Math.min(this.gridColumn, n.indices.length - 1)];
			if (this.enabled(e[a])) return a;
		}
		return t;
	}
	step(e, t, n, r) {
		if (t < 0) return r > 0 ? e.findIndex((e) => this.enabled(e)) : this.lastEnabled(e);
		let i = Math.ceil(e.length / n), a = t % n;
		for (let o = 1; o <= i; o++) {
			let s = (Math.floor(t / n) + r * o + i * o) % i, c = Math.min(s * n + a, e.length - 1);
			if (this.enabled(e[c])) return c;
		}
		return t;
	}
	onControllerKey = (e) => this.navigate(e, !0);
	onKeyDown = (t) => {
		if (t.key === "Tab" && this.floating && !this.controller && !t.defaultPrevented) {
			this.rootMenu.requestClose("outside");
			return;
		}
		if (t.composedPath().some((e) => e instanceof HTMLElement && (e.isContentEditable || e.matches("input:not([type=\"file\"][role=\"menuitem\"]), textarea, select, [role=\"textbox\"], [role=\"combobox\"]"))) || t.composedPath().find((t) => t instanceof e) !== this) return;
		let n = this.ownerDocument.defaultView?.getComputedStyle(this).direction === "rtl" ? "ArrowRight" : "ArrowLeft";
		this.parentMenu && t.key === n && !t.defaultPrevented && !t.isComposing ? (t.preventDefault(), t.stopPropagation(), this.requestClose("back")) : this.navigate(t, !1);
	};
	render() {
		return M`<div class="frame"><slot @slotchange=${this.onChoicesChanged}></slot></div>`;
	}
};
K("ds-menu", Ai);
//#endregion
//#region src/vendor/ds1/3-unit/ds-select.ts
var ji = /* @__PURE__ */ new Set([
	"ArrowDown",
	"ArrowUp",
	"Enter",
	" ",
	"F4"
]), Mi = 0;
K("ds-select", class extends Ai {
	static properties = {
		...Ai.properties,
		swatch: {
			type: String,
			reflect: !0
		},
		native: {
			type: Boolean,
			reflect: !0
		}
	};
	static styles = [
		h(yi),
		h(bi),
		h(`:host { --ds-select-arrow: url("data:image/svg+xml,${encodeURIComponent(_i)}"); --ds-select-check: url("data:image/svg+xml,${encodeURIComponent(vi)}"); }`)
	];
	listbox = !1;
	fieldDisabled = !1;
	listOpen = !1;
	listId = `ds-select-list-${++Mi}`;
	fieldObserver = new MutationObserver(() => this.syncRows());
	childObserver = new MutationObserver(() => {
		this.control() !== this.bound && this.observeControl();
	});
	constructor() {
		super(), this.swatch = void 0, this.native = !1;
	}
	control() {
		let e = this.querySelector(":scope > select");
		return e instanceof HTMLSelectElement ? e : null;
	}
	get field() {
		return !!this.control();
	}
	get listed() {
		return this.field && !this.native && !this.listbox;
	}
	connectedCallback() {
		!this.field && !this.hasAttribute("role") && this.setAttribute("role", "menu"), super.connectedCallback(), this.childObserver.observe(this, { childList: !0 }), this.observeControl();
	}
	disconnectedCallback() {
		this.childObserver.disconnect(), this.fieldObserver.disconnect(), this.unbindControl(), super.disconnectedCallback();
	}
	willUpdate(e) {
		!this.field && !this.hasAttribute("floating") && (this.trigger || this.for) && (this.floating = !0), this.closesOnChoice = !this.field && !this.controller, this.toggleAttribute("data-ds-hug", !this.field && this.triggerMode !== "submenu" && !this.controller), super.willUpdate(e);
	}
	focus(e) {
		let t = this.control();
		t ? t.focus(e) : super.focus(e);
	}
	bound = null;
	unbindControl() {
		this.bound?.removeEventListener("keydown", this.onFieldKey), this.bound = null, this.removeEventListener("click", this.onFieldClick);
	}
	syncRows() {
		let e = this.control();
		if (this.style.setProperty("--ds-select-rows", String(e ? e.size || (e.multiple ? 4 : 1) : 1)), this.listbox = !!(e && (e.multiple || e.size > 1)), this.toggleAttribute("data-listbox", this.listbox), this.toggleAttribute("data-field", !!e), this.toggleAttribute("data-listed", this.listed), this.fieldDisabled = !!e?.matches(":disabled"), e && this.listed) e.setAttribute("aria-haspopup", "listbox"), e.setAttribute("aria-expanded", String(this.listOpen)), e.setAttribute("aria-controls", this.listId);
		else if (e) for (let t of [
			"aria-haspopup",
			"aria-expanded",
			"aria-controls"
		]) e.removeAttribute(t);
		this.requestUpdate();
	}
	observeControl = () => {
		this.fieldObserver.disconnect(), this.unbindControl();
		let e = this.control();
		e && (this.fieldObserver.observe(e, {
			attributes: !0,
			attributeFilter: [
				"size",
				"multiple",
				"disabled"
			],
			childList: !0,
			subtree: !0,
			characterData: !0
		}), this.bound = e, e.addEventListener("keydown", this.onFieldKey), this.addEventListener("click", this.onFieldClick), (this.getAttribute("role") === "menu" || this.getAttribute("role") === "listbox") && this.removeAttribute("role"));
		for (let e = this.parentElement; e; e = e.parentElement) e.localName === "fieldset" && this.fieldObserver.observe(e, {
			attributes: !0,
			attributeFilter: ["disabled"]
		});
		this.syncRows();
	};
	onFieldClick = (e) => {
		!this.listed || this.fieldDisabled || e.defaultPrevented || e.composedPath().some((e) => e instanceof HTMLElement && e.classList.contains("list")) || (e.preventDefault(), this.control()?.focus({ preventScroll: !0 }), this.setList(!this.listOpen));
	};
	onFieldKey = (e) => {
		!this.listed || this.fieldDisabled || e.defaultPrevented || e.isComposing || e.metaKey || e.ctrlKey || (ji.has(e.key) || e.altKey && (e.key === "ArrowDown" || e.key === "ArrowUp")) && (e.preventDefault(), this.setList(!0));
	};
	setList(e) {
		this.listOpen !== e && (this.listOpen = e, this.control()?.setAttribute("aria-expanded", String(e)), this.requestUpdate());
	}
	onListClose = (e) => {
		e.target === this.shadowRoot?.querySelector(".list") && this.setList(!1);
	};
	choose(e) {
		let t = this.control();
		t && !e.disabled && (e.selected || (e.selected = !0, t.dispatchEvent(new Event("input", {
			bubbles: !0,
			composed: !0
		})), t.dispatchEvent(new Event("change", { bubbles: !0 }))), this.setList(!1));
	}
	renderOption(e, t) {
		if (e.hidden) return P;
		let n = e.label || e.text, { details: r, shortcut: i, icon: a } = e.dataset;
		return M`<button type="button" role="option" class="choice" id=${`${this.listId}-${t}`} aria-selected=${e.selected ? "true" : "false"}
      ?disabled=${e.disabled || this.fieldDisabled} data-text-value=${n} @click=${(t) => {
			t.stopPropagation(), this.choose(e);
		}}>${a ? M`<ds-icon class="mark" type=${a} aria-hidden="true"></ds-icon>` : P}<span class="name">${n}</span>${r ? M`<span class="details">${r}</span>` : P}${i ? M`<span class="shortcut" aria-hidden="true">${i.includes("+") || i.startsWith("mod") ? gi(i) : i}</span>` : P}<span class="check" aria-hidden="true"></span></button>`;
	}
	renderChoices() {
		let e = this.control();
		if (!e) return P;
		let t = 0;
		return [...e.children].map((e, n) => {
			if (e instanceof HTMLOptionElement) return this.renderOption(e, t++);
			if (!(e instanceof HTMLOptGroupElement) || e.hidden) return P;
			let r = `${this.listId}-group-${n}`;
			return M`<div role="group" class="group" aria-labelledby=${r}><div class="group-label" id=${r}>${e.label}</div>${[...e.children].map((e) => e instanceof HTMLOptionElement ? this.renderOption(e, t++) : P)}</div>`;
		});
	}
	fieldName(e) {
		if (!e) return "";
		let t = e.getAttribute("aria-label");
		if (t) return t;
		let n = e.labels?.[0];
		return n ? [...n.childNodes].filter((e) => !e.contains(this)).map((e) => e.textContent ?? "").join("").trim() : "";
	}
	render() {
		if (!this.field) return super.render();
		let e = this.control(), t = this.fieldName(e), n = this.fieldDisabled ? "disabled" : "";
		return M`<slot @slotchange=${this.observeControl}></slot><span aria-hidden="true" ?hidden=${this.listbox || !!this.swatch} class="arrow ${n}"></span>${this.swatch && !this.listbox ? M`<ds-swatch aria-hidden="true" .value=${this.swatch} class=${n}></ds-swatch>` : null}${this.listed ? M`<ds-menu class="list" id=${this.listId} floating data-ds-hug role="listbox" trigger-mode="manual" aria-label=${t || P} .anchor=${this} ?open=${this.listOpen} @ds-menu-close=${this.onListClose}>${this.listOpen ? this.renderChoices() : P}</ds-menu>` : P}`;
	}
});
//#endregion
//#region src/vendor/ds1/0-face/overlay-swipe.ts
var Ni = 10, Pi = .998, Fi = (e) => e / 1e3 * Pi / .0020000000000000018, Ii = (e, t, n = .55) => e * t * n / (t + n * Math.abs(e)), Li = /* @__PURE__ */ new Set([
	"none",
	"bottom",
	"end",
	"start"
]);
function Ri(e) {
	let t = e.getAttribute("data-ds-edge");
	return t && Li.has(t) ? t : e.classList.contains("ds-overlay--sheet") ? "bottom" : e.classList.contains("ds-overlay--drawer") ? e.classList.contains("ds-overlay--start") ? "start" : "end" : "none";
}
function zi(e, t) {
	if (t === "bottom" || t === "none") return {
		axis: "y",
		sign: 1
	};
	let n = e.ownerDocument.defaultView?.getComputedStyle(e).direction === "rtl";
	return {
		axis: "x",
		sign: t === "end" === n ? -1 : 1
	};
}
function Bi(e, t, n, r) {
	let i = t.ownerDocument.defaultView;
	for (let a of e) {
		if (!(a instanceof Element)) continue;
		let e = i?.getComputedStyle(a);
		if (n === "y") {
			if (/auto|scroll/.test(e?.overflowY ?? "") && a.scrollHeight > a.clientHeight && (r > 0 ? a.scrollTop > 0 : a.scrollTop + a.clientHeight < a.scrollHeight - 1)) return !0;
		} else if (/auto|scroll/.test(e?.overflowX ?? "") && a.scrollWidth > a.clientWidth) return !0;
		if (a === t) break;
	}
	return !1;
}
function Vi(e, t, n) {
	let r = e.ownerDocument.defaultView?.getComputedStyle(e).transform;
	if (!r || r === "none" || typeof DOMMatrixReadOnly > "u") return 0;
	try {
		let e = new DOMMatrixReadOnly(r);
		return n * (t === "y" ? e.m42 : e.m41);
	} catch {
		return 0;
	}
}
function Hi(e, t = {}) {
	let n = () => (typeof t.edge == "function" ? t.edge() : t.edge) ?? Ri(e), r = null, i = 0, a = e.ownerDocument.defaultView, o = (e) => a?.requestAnimationFrame ? a.requestAnimationFrame(e) : a?.setTimeout(e, 16) ?? 0, s = (t, n, r) => {
		e.style.setProperty("--ds-overlay-drag", `${r * t}px`), e.style.setProperty("--ds-overlay-progress", String(n > 0 ? Math.min(1, Math.max(0, t / n)) : 0));
	}, c = () => {
		e.style.removeProperty("--ds-overlay-drag"), e.style.removeProperty("--ds-overlay-progress"), e.removeAttribute("data-ds-overlay-dragging");
	}, l = () => {
		e.removeAttribute("data-ds-overlay-dragging"), e.style.setProperty("--ds-overlay-drag", "0px"), e.style.setProperty("--ds-overlay-progress", "0");
	}, u = () => {
		if (e.removeAttribute("data-ds-overlay-dragging"), t.onDismiss) t.onDismiss(e);
		else {
			let t = new CustomEvent("ds-close-request", {
				detail: { reason: "swipe" },
				bubbles: !0,
				composed: !0,
				cancelable: !0
			});
			e.dispatchEvent(t) && e.close();
		}
		let n = ++i;
		o(() => o(() => {
			n === i && e.open && l();
		}));
	}, d = (t) => {
		let i = n();
		if (!e.open || i === "none") return;
		if (t.touches.length !== 1) {
			r?.mode === "drag" && l(), r = null;
			return;
		}
		let a = t.composedPath();
		if (a.some((e) => e instanceof Element && e.matches("[data-ds-overlay-no-swipe], input[type=\"range\"], [role=\"slider\"]"))) return;
		let o = t.touches[0], { axis: s, sign: c } = zi(e, i);
		r = {
			id: o.identifier,
			x: o.clientX,
			y: o.clientY,
			base: Math.max(0, Vi(e, s, c)),
			start: 0,
			mode: "pending",
			offset: 0,
			samples: [],
			target: t.target,
			path: a
		};
	}, f = (t) => {
		if (!r || r.mode === "ignore") return;
		let o = [...t.touches].find((e) => e.identifier === r.id);
		if (!o) return;
		let c = n();
		if (c === "none") {
			r = null;
			return;
		}
		let { axis: l, sign: u } = zi(e, c), d = o.clientX - r.x, f = o.clientY - r.y, p = l === "y" ? f * u : d * u, m = l === "y" ? d : f;
		if (r.mode === "pending") {
			if (Math.hypot(d, f) < Ni) {
				t.cancelable && p > 0 && p >= Math.abs(m) && !Bi(r.path, e, l, p) && t.preventDefault();
				return;
			}
			if (Math.abs(p) <= Math.abs(m) || Bi(r.path, e, l, p)) {
				r.mode = "ignore";
				return;
			}
			r.mode = "drag", r.start = p, i++, e.setAttribute("data-ds-overlay-dragging", "");
		}
		t.preventDefault();
		let h = e.getBoundingClientRect(), g = l === "y" ? h.height : h.width, _ = r.base + p - r.start;
		r.offset = _ < 0 ? Ii(_, g || 1) : _, s(r.offset, g, u);
		let v = t.timeStamp || (a?.performance?.now() ?? Date.now());
		for (r.samples.push({
			time: v,
			offset: r.offset
		}); r.samples.length > 2 && v - r.samples[0].time > 150;) r.samples.shift();
	}, p = (t) => {
		if (!r || [...t.touches].some((e) => e.identifier === r.id)) return;
		let i = r;
		if (r = null, i.mode !== "drag") return;
		let o = n(), { axis: s } = zi(e, o), c = e.getBoundingClientRect(), d = s === "y" ? c.height : c.width, f = t.timeStamp || (a?.performance?.now() ?? Date.now()), p = i.samples.filter((e) => f - e.time <= 100), m = p[0], h = p[p.length - 1], g = m && h ? h.time - m.time : 0, _ = m && h && g > 0 ? (h.offset - m.offset) / g * 1e3 : 0, v = i.offset + Fi(_);
		t.type !== "touchcancel" && o !== "none" && i.offset > 0 && v > d / 2 && _ > -100 ? u() : l();
	}, m = new MutationObserver(() => {
		e.open && (i++, r = null, c());
	});
	return m.observe(e, {
		attributes: !0,
		attributeFilter: ["open"]
	}), e.addEventListener("touchstart", d, { passive: !0 }), e.addEventListener("touchmove", f, { passive: !1 }), e.addEventListener("touchend", p, { passive: !0 }), e.addEventListener("touchcancel", p, { passive: !0 }), () => {
		m.disconnect(), e.removeEventListener("touchstart", d), e.removeEventListener("touchmove", f), e.removeEventListener("touchend", p), e.removeEventListener("touchcancel", p), i++, r = null, c();
	};
}
//#endregion
//#region src/vendor/ds1/4-page/styles/ds-overlay.css?inline
var Ui = "ds-overlay>dialog{box-sizing:border-box;position:var(--ds-overlay-position,fixed);inset:var(--ds-overlay-inset,0);width:var(--ds-overlay-width,calc(20 * var(--ds-unit)));max-width:var(--ds-overlay-max-width,calc(100vw - 2 * var(--ds-unit)));max-height:var(--ds-overlay-max-height,calc(100dvh - 2 * var(--ds-unit)));height:var(--ds-overlay-height,fit-content);margin:var(--ds-overlay-margin,auto);padding:var(--ds-overlay-padding,var(--ds-unit));border:var(--ds-overlay-border,1px solid var(--ds-border-color));background:var(--ds-overlay-paper,var(--ds-paper));color:var(--ds-text-color);z-index:var(--ds-overlay-layer,auto);box-shadow:none;overflow:var(--ds-overlay-overflow,auto);overscroll-behavior:contain;font-family:\"Inter Arrows\", var(--ds-typeface-regular);font-feature-settings:var(--ds-font-features);font-size:var(--ds-type-size-default);font-weight:var(--ds-type-weight-default);line-height:var(--ds-type-lineheight-default);letter-spacing:var(--ds-type-letterspacing-default);border-radius:0}ds-overlay>dialog[open]{gap:var(--ds-unit);flex-direction:column;display:flex}ds-overlay>dialog:not([open]){display:none}ds-overlay>dialog[data-ds-type=popover]{inset:auto;left:var(--ds-overlay-anchor-left,0px);top:var(--ds-overlay-anchor-top,0px);margin:calc(var(--ds-unit) / 2);width:var(--ds-overlay-width,max-content);max-width:var(--ds-overlay-available-width,calc(100vw - var(--ds-unit)));max-height:var(--ds-overlay-available-height,calc(100dvh - var(--ds-unit)))}ds-overlay>dialog[data-ds-type=popover]:has(>ds-calendar[compact]){border:0;gap:0;margin:0;padding:0}ds-overlay>dialog[data-ds-overlay-flush]{gap:0;padding:0}ds-overlay>dialog[data-ds-overlay-rotated]{width:calc(100dvh - 2 * var(--ds-unit));height:calc(100vw - 2 * var(--ds-unit));max-width:none;max-height:none;margin:0;inset:50% auto auto 50%;transform:translate(-50%,-50%)rotate(90deg)}ds-overlay>dialog[data-ds-type=screen][data-ds-overlay-rotated]{width:100dvh;height:100vw}ds-overlay>dialog::backdrop{background:color-mix(in srgb, var(--ds-black) 40%, transparent)}ds-overlay [data-ds-overlay=header]{flex-direction:column;display:flex}ds-overlay>dialog:has(>[data-ds-overlay=close]) [data-ds-overlay=header]{padding-inline-end:var(--ds-unit)}ds-overlay [data-ds-overlay=title]{min-height:var(--ds-row-height);color:var(--ds-text-color);font:inherit;font-weight:var(--ds-type-weight-bold);line-height:var(--ds-type-lineheight-default);align-items:flex-end;margin:0;display:flex}ds-overlay [data-ds-overlay=description]{color:var(--ds-text-color-muted);font:inherit;margin:0}ds-overlay [data-ds-overlay=footer]{justify-content:flex-end;align-items:center;gap:calc(var(--ds-unit) / 2);min-height:var(--ds-row-height);flex-wrap:wrap;display:flex}ds-overlay [data-ds-overlay=close]{top:var(--ds-unit);right:var(--ds-unit);position:absolute}ds-overlay>dialog[data-ds-overlay-inline]{background:0 0;border:0;gap:0;width:100%;max-width:none;max-height:none;margin:0;padding:0;position:relative;inset:auto}@media (width<=768px){ds-overlay>dialog[data-ds-type=sheet] [data-ds-overlay=close]{clip-path:inset(50%);white-space:nowrap;border:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}ds-overlay>dialog[data-ds-type=sheet] [data-ds-overlay=header]{padding-inline-end:0}ds-overlay>dialog[data-ds-type=sheet][data-ds-overlay-tabbed]{height:calc(var(--ds-overlay-viewport-height,100dvh) - var(--ds-overlay-sheet-gap,calc(2 * var(--ds-unit))) - env(safe-area-inset-top,0px));overflow:hidden}ds-overlay>dialog[data-ds-type=sheet][data-ds-overlay-tabbed]>:is([data-ds-overlay=header],ds-tabs){flex-shrink:0}ds-overlay>dialog[data-ds-type=sheet][data-ds-overlay-tabbed]>[data-ds-overlay=body]{overscroll-behavior:contain;flex:auto;min-height:0;overflow:auto}}", Wi = ":is(ds-overlay>dialog[data-ds-edge=bottom],dialog.ds-overlay.ds-overlay--sheet),:is(ds-overlay>dialog[data-ds-edge=end],dialog.ds-overlay.ds-overlay--drawer:not(.ds-overlay--start)),:is(ds-overlay>dialog[data-ds-edge=start],dialog.ds-overlay.ds-overlay--drawer.ds-overlay--start){--ds-overlay-gap:var(--ds-unit);--ds-overlay-inner:var(--ds-overlay-padding,var(--ds-unit));--ds-overlay-within:max(0px, var(--ds-overlay-inner) - var(--ds-overlay-line,1px));--ds-overlay-motion:var(--ds-overlay-enter,.38s);--ds-overlay-curve:var(--ds-overlay-easing,cubic-bezier(.32, .72, 0, 1));gap:var(--ds-overlay-gap);transform:var(--ds-overlay-held);transition:transform var(--ds-overlay-motion) var(--ds-overlay-curve), opacity var(--ds-overlay-motion) var(--ds-overlay-curve), overlay var(--ds-overlay-motion) allow-discrete, display var(--ds-overlay-motion) allow-discrete;margin:0}:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer))[data-ds-overlay-flush]{--ds-overlay-inner:0px;--ds-overlay-gap:0px}:is(ds-overlay>dialog[data-ds-edge=bottom],dialog.ds-overlay.ds-overlay--sheet){--ds-overlay-held:translateY(var(--ds-overlay-drag,0px));--ds-overlay-away:translateY(100%);inset:auto 0 var(--ds-overlay-viewport-bottom,0px);width:var(--ds-overlay-width,100%);max-width:min(100%, var(--ds-overlay-sheet-width,calc(32 * var(--ds-unit))));height:var(--ds-overlay-height,fit-content);max-height:calc(var(--ds-overlay-viewport-height,100dvh) - var(--ds-overlay-sheet-gap,calc(2 * var(--ds-unit))) - env(safe-area-inset-top,0px));padding:var(--ds-overlay-within) calc(var(--ds-overlay-inner) + env(safe-area-inset-right,0px)) calc(var(--ds-overlay-inner) + env(safe-area-inset-bottom,0px)) calc(var(--ds-overlay-inner) + env(safe-area-inset-left,0px));border-bottom:0;margin:0 auto}:is(ds-overlay>dialog[data-ds-edge=bottom],dialog.ds-overlay.ds-overlay--sheet):before{--ds-overlay-handle-height:calc(4px * var(--ds-sf,1));content:\"\";display:var(--ds-overlay-handle,block);z-index:1;top:calc((var(--ds-unit) - var(--ds-overlay-handle-height)) / 2 - var(--ds-overlay-line,1px) - var(--ds-overlay-within));width:calc(2 * var(--ds-unit));height:var(--ds-overlay-handle-height);margin-top:calc(var(--ds-overlay-inner) * -1 + (var(--ds-unit) - var(--ds-overlay-handle-height)) / 2);margin-bottom:calc(var(--ds-overlay-inner) - var(--ds-overlay-gap) - var(--ds-overlay-handle-height) - (var(--ds-unit) - var(--ds-overlay-handle-height)) / 2);border-radius:calc(var(--ds-overlay-handle-height) / 2);background:var(--ds-overlay-handle-color,var(--ds-border-color));pointer-events:none;flex:none;align-self:center;position:sticky}:is(ds-overlay>dialog[data-ds-edge=end],dialog.ds-overlay.ds-overlay--drawer:not(.ds-overlay--start)),:is(ds-overlay>dialog[data-ds-edge=start],dialog.ds-overlay.ds-overlay--drawer.ds-overlay--start){--ds-overlay-held:translateX(var(--ds-overlay-drag,0px));width:calc(var(--ds-overlay-width,calc(16 * var(--ds-unit))) + var(--ds-overlay-safe-side,0px));max-width:calc(100vw - 2 * var(--ds-unit));border-top:0;border-bottom:0;height:100dvh;max-height:none}:is(ds-overlay>dialog[data-ds-edge=end],dialog.ds-overlay.ds-overlay--drawer:not(.ds-overlay--start)):not(:dir(rtl)),:is(ds-overlay>dialog[data-ds-edge=start],dialog.ds-overlay.ds-overlay--drawer.ds-overlay--start):dir(rtl){--ds-overlay-away:translateX(100%);--ds-overlay-safe-side:env(safe-area-inset-right,0px);padding:calc(var(--ds-overlay-inner) + env(safe-area-inset-top,0px)) calc(var(--ds-overlay-inner) + env(safe-area-inset-right,0px)) calc(var(--ds-overlay-inner) + env(safe-area-inset-bottom,0px)) var(--ds-overlay-within);border-right:0;inset:0 0 0 auto}:is(ds-overlay>dialog[data-ds-edge=start],dialog.ds-overlay.ds-overlay--drawer.ds-overlay--start):not(:dir(rtl)),:is(ds-overlay>dialog[data-ds-edge=end],dialog.ds-overlay.ds-overlay--drawer:not(.ds-overlay--start)):dir(rtl){--ds-overlay-away:translateX(-100%);--ds-overlay-safe-side:env(safe-area-inset-left,0px);padding:calc(var(--ds-overlay-inner) + env(safe-area-inset-top,0px)) var(--ds-overlay-within) calc(var(--ds-overlay-inner) + env(safe-area-inset-bottom,0px)) calc(var(--ds-overlay-inner) + env(safe-area-inset-left,0px));border-left:0;inset:0 auto 0 0}:root:has(dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer):modal){overscroll-behavior:none;overflow:hidden}:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer)):not([open]){--ds-overlay-motion:var(--ds-overlay-exit,.26s);transform:var(--ds-overlay-away)}@starting-style{:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer))[open]{transform:var(--ds-overlay-away)}}:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer))::backdrop{opacity:calc(1 - var(--ds-overlay-progress,0));transition:opacity var(--ds-overlay-motion,.38s) ease, overlay var(--ds-overlay-motion,.38s) allow-discrete, display var(--ds-overlay-motion,.38s) allow-discrete}:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer)):not([open])::backdrop{opacity:0}@starting-style{:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer))[open]::backdrop{opacity:0}}:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer))[data-ds-overlay-dragging],:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer))[data-ds-overlay-dragging]::backdrop{transition:none}@media (prefers-reduced-motion:reduce){:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer)){--ds-overlay-motion:.15s;transition:opacity var(--ds-overlay-motion) ease, overlay var(--ds-overlay-motion) allow-discrete, display var(--ds-overlay-motion) allow-discrete}:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer)):not([open]){--ds-overlay-motion:.15s;transform:var(--ds-overlay-held);opacity:0}@starting-style{:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer))[open]{transform:var(--ds-overlay-held);opacity:0}}}:is(ds-overlay>dialog[data-ds-type=screen],dialog.ds-overlay.ds-overlay--screen){--ds-overlay-width:100vw;width:100vw;max-width:none;height:100dvh;max-height:none;padding:var(--ds-unit);background:var(--ds-overlay-paper,var(--background,Canvas));border:0;gap:0;margin:0;overflow-y:auto}:is(ds-overlay>dialog[data-ds-type=screen],dialog.ds-overlay.ds-overlay--screen)[open]{align-items:stretch;gap:var(--ds-unit);flex-direction:column;display:flex}:is(ds-overlay>dialog[data-ds-type=screen],dialog.ds-overlay.ds-overlay--screen)[data-ds-overlay-flush]{gap:0;padding:0}:is(ds-overlay>dialog[data-ds-type=screen],dialog.ds-overlay.ds-overlay--screen)::backdrop{background:0 0}@media (prefers-reduced-motion:no-preference){:is(ds-overlay>dialog[data-ds-type=screen],dialog.ds-overlay.ds-overlay--screen)[open]{transition:opacity .16s ease-out,transform .16s ease-out}@starting-style{:is(ds-overlay>dialog[data-ds-type=screen],dialog.ds-overlay.ds-overlay--screen)[open]{opacity:0;transform:translateY(calc(var(--ds-unit) / -2))}}}.ds-overlay__bar{min-height:var(--ds-row-height);justify-content:flex-end;align-items:center;display:flex}.ds-overlay__bar>.ds-overlay__close{margin-inline-end:calc((var(--ds-unit) - var(--ds-control-height)) / 2)}.ds-overlay__toggle:not([aria-expanded=true])>:nth-child(2),.ds-overlay__toggle[aria-expanded=true]>:first-child:not(:only-child),.ds-overlay__close>:first-child:not(:only-child){display:none}", Gi = "[data-ds-shape=square],:host([data-ds-shape=square]){--ds-corner-size:0px;--ds-corner-shape:round;--ds-button-inset:.5px}[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:4px;--ds-corner-shape:round;--ds-button-inset:2.5px}[data-ds-shape=circular],:host([data-ds-shape=circular]){--ds-corner-size:999px;--ds-corner-shape:round;--ds-button-inset:5px}@supports (corner-shape:squircle){[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:8px;--ds-corner-shape:squircle}}:root,:host,:where([data-ds-surface]){--ds-unit:calc(var(--ds-1,20px) * var(--ds-sf,1));--ds-control-height:calc(var(--ds-control-size,var(--ds-08,16px)) * var(--ds-sf,1));--ds-row-height:calc(var(--ds-row-size,var(--ds-1,20px)) * var(--ds-sf,1));--ds-type-size-default:calc(var(--ds-text-size,14px) * var(--ds-sf,1));--ds-type-size-small:calc(var(--ds-small-text-size,10px) * var(--ds-sf,1));--ds-type-size-heading:calc(var(--ds-heading-text-size,13px) * var(--ds-sf,1));--ds-type-size-display:calc(var(--ds-display-text-size,20px) * var(--ds-sf,1));--ds-type-lineheight-default:calc(var(--ds-text-leading,16px) * var(--ds-sf,1));--ds-type-letterspacing-default:calc(var(--ds-text-tracking,-.3px) * var(--ds-sf,1));--ds-radius:calc(var(--ds-corner-size,4px) * var(--ds-sf,1));--ds-radius-card:calc(var(--ds-card-corner-size,4px) * var(--ds-sf,1))}", Ki = `${Ui}\n${Wi}`, qi = /* @__PURE__ */ new Set([
	"modal",
	"sheet",
	"drawer",
	"detail",
	"popover",
	"screen"
]), Ji = () => typeof matchMedia == "function" && matchMedia("(max-width: 768px)").matches, Yi = /* @__PURE__ */ new WeakMap(), Xi = /* @__PURE__ */ new WeakMap();
function Zi(e) {
	let t = [...Yi.get(e) ?? []], n = t.some((e) => !e.modeless || e.holdScroll), r = t.some((e) => !e.modeless), i = Xi.get(e);
	if (!n && !i) return;
	i || (i = {
		declarations: [],
		x: e.defaultView?.scrollX ?? 0,
		y: e.defaultView?.scrollY ?? 0
	}, Xi.set(e, i));
	let a = e.documentElement.style, o = e.body.style, s = n ? [
		[
			a,
			"overflow",
			"hidden"
		],
		[
			a,
			"overscroll-behavior",
			"none"
		],
		[
			o,
			"overscroll-behavior",
			"none"
		],
		[
			o,
			"touch-action",
			"none"
		]
	] : [];
	r && s.push([
		o,
		"position",
		"fixed"
	], [
		o,
		"top",
		`${-i.y}px`
	], [
		o,
		"left",
		`${-i.x}px`
	], [
		o,
		"width",
		"100%"
	]);
	let c = i.declarations.some((e) => e.name === "position");
	for (let e of [...i.declarations]) s.some(([t, n]) => t === e.style && n === e.name) || (e.style.getPropertyValue(e.name) === e.locked && e.style.getPropertyPriority(e.name) === "important" && (e.value ? e.style.setProperty(e.name, e.value, e.priority) : e.style.removeProperty(e.name)), i.declarations.splice(i.declarations.indexOf(e), 1));
	for (let [e, t, n] of s) i.declarations.some((n) => n.style === e && n.name === t) || (i.declarations.push({
		style: e,
		name: t,
		locked: n,
		value: e.getPropertyValue(t),
		priority: e.getPropertyPriority(t)
	}), e.setProperty(t, n, "important"));
	(!n || c && !r) && e.defaultView && (e.defaultView.scrollX !== i.x || e.defaultView.scrollY !== i.y) && e.defaultView.scrollTo(i.x, i.y), n || Xi.delete(e);
}
var Qi = /* @__PURE__ */ new WeakSet();
function $i(e) {
	if (!(e instanceof ShadowRoot) || Qi.has(e)) return;
	let t = new CSSStyleSheet();
	t.replaceSync(Ki), e.adoptedStyleSheets = [...e.adoptedStyleSheets, t], Qi.add(e);
}
K("ds-overlay", class extends R {
	static properties = {
		open: {
			type: Boolean,
			reflect: !0
		},
		nonModal: {
			type: Boolean,
			attribute: "non-modal",
			reflect: !0
		},
		closeOnOutside: {
			type: Boolean,
			attribute: "close-on-outside"
		},
		blockOutside: {
			type: Boolean,
			attribute: "block-outside"
		},
		holdScroll: {
			type: Boolean,
			attribute: "hold-scroll"
		},
		closeOnEscape: {
			type: Boolean,
			attribute: "close-on-escape"
		},
		closeOnBackdrop: {
			type: Boolean,
			attribute: "close-on-backdrop"
		},
		type: {
			type: String,
			reflect: !0
		},
		side: {
			type: String,
			reflect: !0
		},
		anchor: { attribute: !1 },
		trigger: { attribute: !1 },
		returnFocus: { attribute: !1 }
	};
	static styles = [h(Gi), g`:host { display: contents; } :host([hidden]) { display: none !important; }`];
	dialog = null;
	opener = null;
	pointerStartedOutside = !1;
	pendingOpen = null;
	outsidePress = null;
	observer = new MutationObserver(() => this.bindDialog());
	sizeObserver = null;
	unbindSwipe = null;
	constructor() {
		super(), this.open = !1, this.nonModal = !1, this.closeOnOutside = !1, this.blockOutside = !1, this.holdScroll = !1, this.closeOnEscape = !0, this.closeOnBackdrop = !0, this.type = "modal", this.side = "end", this.anchor = null, this.trigger = null, this.returnFocus = null;
	}
	connectedCallback() {
		super.connectedCallback(), $i(this.getRootNode()), this.observer.observe(this, { childList: !0 }), this.bindDialog();
	}
	disconnectedCallback() {
		this.observer.disconnect(), this.detachDialog(), super.disconnectedCallback();
	}
	updated() {
		this.syncType(), this.syncOpen(), this.place();
	}
	get kind() {
		let e = qi.has(this.type) ? this.type : "modal";
		return e === "detail" ? Ji() ? "sheet" : "drawer" : e === "modal" && Ji() ? "sheet" : e;
	}
	get modeless() {
		return this.nonModal || this.kind === "popover";
	}
	get edge() {
		return this.kind === "sheet" ? "bottom" : this.kind === "drawer" ? this.side === "start" ? "start" : "end" : "none";
	}
	syncType() {
		let e = this.dialog;
		if (!e) return;
		e.setAttribute("data-ds-type", this.kind);
		let t = this.edge;
		t === "none" ? e.removeAttribute("data-ds-edge") : e.setAttribute("data-ds-edge", t), t !== "none" && !this.unbindSwipe ? this.unbindSwipe = Hi(e, {
			edge: () => this.edge,
			onDismiss: () => this.requestClose("swipe")
		}) : t === "none" && this.unbindSwipe && (this.unbindSwipe(), this.unbindSwipe = null);
	}
	place = () => {
		let e = this.dialog, t = this.ownerDocument.defaultView;
		if (!e || !t) return;
		this.syncType();
		let n = t.visualViewport;
		if (e.style.setProperty("--ds-overlay-viewport-height", `${n?.height ?? t.innerHeight}px`), e.style.setProperty("--ds-overlay-viewport-bottom", `${Math.max(0, t.innerHeight - (n?.height ?? t.innerHeight) - (n?.offsetTop ?? 0))}px`), this.kind !== "popover" || !this.anchor && !this.trigger || !e.open) return;
		if (this.trigger && wi(this)) {
			let n = Ci(this);
			e.style.setProperty("--ds-overlay-available-width", `${Math.max(0, n.width - 8)}px`);
			let r = xi(this.trigger.getBoundingClientRect(), e.getBoundingClientRect(), n);
			e.style.setProperty("--ds-overlay-available-height", `${r.availableHeight}px`);
			let i = xi(this.trigger.getBoundingClientRect(), e.getBoundingClientRect(), n), a = parseFloat(t.getComputedStyle(e).marginLeft) || 0;
			e.style.setProperty("--ds-overlay-anchor-left", `${i.left - a}px`), e.style.setProperty("--ds-overlay-anchor-top", `${i.top - a}px`);
			return;
		}
		let r = this.trigger?.getBoundingClientRect(), i = this.anchor ?? {
			x: r.left,
			y: r.bottom
		}, a = n?.offsetLeft ?? 0, o = n?.offsetTop ?? 0, s = n?.width ?? t.innerWidth, c = n?.height ?? t.innerHeight, l = parseFloat(t.getComputedStyle(e).marginLeft) || 0;
		e.style.setProperty("--ds-overlay-available-width", `${Math.max(0, s - 2 * l)}px`), e.style.setProperty("--ds-overlay-available-height", `${Math.max(0, c - 2 * l)}px`);
		let u = e.getBoundingClientRect();
		e.style.setProperty("--ds-overlay-anchor-left", `${Math.max(a, Math.min(i.x - l, a + s - u.width - 2 * l))}px`), e.style.setProperty("--ds-overlay-anchor-top", `${Math.max(o, Math.min(i.y - l, o + c - u.height - 2 * l))}px`);
	};
	bindDialog = () => {
		let e = this.querySelector(":scope > dialog");
		e === this.dialog || (this.detachDialog(), this.dialog = e, e?.addEventListener("cancel", this.onCancel), e?.addEventListener("close", this.onNativeClose), e?.addEventListener("pointerdown", this.onPointerDown), e?.addEventListener("click", this.onClick), this.syncType()), this.syncOpen();
	};
	detachDialog() {
		let e = this.dialog;
		e?.removeEventListener("cancel", this.onCancel), e?.removeEventListener("close", this.onNativeClose), e?.removeEventListener("pointerdown", this.onPointerDown), e?.removeEventListener("click", this.onClick), this.unbindSwipe?.(), this.unbindSwipe = null, e?.removeAttribute("data-ds-type"), e?.removeAttribute("data-ds-edge"), e?.open && e.close(), this.release(), this.dialog = null;
	}
	syncOpen() {
		let e = this.dialog;
		if (e && this.isConnected) {
			if (this.open && !e.open) {
				if (this.pendingOpen) return;
				let t = [...e.querySelectorAll("*")].map((e) => e.updateComplete);
				this.pendingOpen = Promise.all(t).then(() => {
					this.pendingOpen = null, this.dialog !== e || !this.open || !this.isConnected ? this.syncOpen() : this.showDialog(e);
				});
			} else this.open || (e.open && e.close(), this.release());
		}
	}
	async show({ immediate: e = !1 } = {}) {
		if (this.open = !0, e) {
			this.performUpdate();
			for (let e of this.querySelectorAll("*")) e.renderNow?.();
			this.bindDialog(), this.dialog && this.isConnected && this.showDialog(this.dialog);
		}
		await this.updateComplete, await this.pendingOpen;
	}
	close() {
		this.open = !1, this.syncOpen();
	}
	showDialog(e) {
		if (e.open) return;
		let t = this.ownerDocument.activeElement;
		for (; t?.shadowRoot?.activeElement;) t = t.shadowRoot.activeElement;
		this.opener ??= t instanceof HTMLElement ? t : null;
		let n = this.ownerDocument, r = Yi.get(n);
		r || Yi.set(n, r = /* @__PURE__ */ new Set()), r.add(this), Zi(n);
		try {
			this.modeless ? e.show() : e.showModal();
		} catch (e) {
			throw r.delete(this), Zi(n), e;
		}
		this.place(), typeof ResizeObserver < "u" && (this.sizeObserver = new ResizeObserver(this.place), this.sizeObserver.observe(e)), n.addEventListener("scroll", this.place, !0), n.defaultView?.addEventListener("resize", this.place), n.defaultView?.visualViewport?.addEventListener("resize", this.place), n.defaultView?.visualViewport?.addEventListener("scroll", this.place), (n.defaultView ?? n).addEventListener("keydown", this.onSheetEscape, !0), n.addEventListener("keydown", this.onDocumentKey), n.addEventListener("pointerdown", this.onOutsidePress, !0), n.addEventListener("click", this.onOutsideClick, !0), n.addEventListener("pointerup", this.onOutsideRelease, !0), n.addEventListener("wheel", this.onScrollGesture, { passive: !1 }), n.addEventListener("touchmove", this.onScrollGesture, { passive: !1 });
	}
	release() {
		let e = this.ownerDocument;
		this.sizeObserver?.disconnect(), this.sizeObserver = null, e.removeEventListener("scroll", this.place, !0), e.defaultView?.removeEventListener("resize", this.place), e.defaultView?.visualViewport?.removeEventListener("resize", this.place), e.defaultView?.visualViewport?.removeEventListener("scroll", this.place);
		let t = Yi.get(e), n = t ? [...t] : [], r = n[n.length - 1] === this;
		if (!t?.delete(this)) return;
		Zi(e), (e.defaultView ?? e).removeEventListener("keydown", this.onSheetEscape, !0), e.removeEventListener("keydown", this.onDocumentKey), e.removeEventListener("pointerdown", this.onOutsidePress, !0), e.removeEventListener("click", this.onOutsideClick, !0), e.removeEventListener("pointerup", this.onOutsideRelease, !0), e.removeEventListener("wheel", this.onScrollGesture), e.removeEventListener("touchmove", this.onScrollGesture), this.outsidePress = null;
		let i = e.activeElement;
		for (; i?.shadowRoot?.activeElement;) i = i.shadowRoot.activeElement;
		let a = i;
		for (; a && !this.dialog?.contains(a);) {
			let e = a.getRootNode();
			a = e instanceof ShadowRoot ? e.host : null;
		}
		if (r && (!this.modeless || i === e.body || i === this.dialog || a)) {
			let e = this.returnFocus;
			e ? queueMicrotask(() => {
				let t = e();
				t?.isConnected && t.focus({ preventScroll: !0 });
			}) : this.opener?.isConnected && this.opener.focus({ preventScroll: !0 });
		}
		this.opener = null;
	}
	requestClose(e = "button") {
		if (!this.open) return;
		let t = new CustomEvent("ds-close-request", {
			detail: { reason: e },
			bubbles: !0,
			composed: !0,
			cancelable: !0
		});
		(this.dispatchEvent(t) || e === "escape" && this.kind === "sheet") && this.close();
	}
	isTop() {
		let e = [...Yi.get(this.ownerDocument) ?? []];
		return e[e.length - 1] === this;
	}
	onSheetEscape = (e) => {
		e.key === "Escape" && this.kind === "sheet" && this.isTop() && (e.preventDefault(), e.stopImmediatePropagation(), this.requestClose("escape"));
	};
	onDocumentKey = (e) => {
		this.modeless && this.isTop() && !e.defaultPrevented && (e.key === "Escape" && this.closeOnEscape ? (e.preventDefault(), e.stopImmediatePropagation(), this.requestClose("escape")) : this.holdScroll && !e.composedPath().includes(this) && !e.composedPath().some((e) => e instanceof HTMLElement && (e.isContentEditable || e.matches("input, textarea, select"))) && [
			"ArrowUp",
			"ArrowDown",
			"ArrowLeft",
			"ArrowRight",
			"PageUp",
			"PageDown",
			"Home",
			"End",
			" "
		].includes(e.key) && e.preventDefault());
	};
	onScrollGesture = (e) => {
		this.modeless && this.holdScroll && this.isTop() && !e.composedPath().includes(this) && e.preventDefault();
	};
	onOutsidePress = (e) => {
		this.modeless && this.isTop() && (this.outsidePress = !e.composedPath().includes(this), this.outsidePress && this.blockOutside && (e.preventDefault(), e.stopImmediatePropagation()));
	};
	onOutsideClick = (e) => {
		this.modeless && this.isTop() && !e.composedPath().includes(this) && (this.blockOutside && (e.preventDefault(), e.stopImmediatePropagation()), this.closesOutside && this.outsidePress !== !1 && this.requestClose("outside"), this.outsidePress = null);
	};
	onOutsideRelease = (e) => {
		e.pointerType !== "mouse" && this.modeless && this.isTop() && !this.blockOutside && !e.composedPath().includes(this) && this.closesOutside && this.outsidePress === !0 && this.requestClose("outside");
	};
	get closesOutside() {
		return this.closeOnOutside || this.kind === "sheet" && this.closeOnBackdrop;
	}
	onCancel = (e) => {
		e.preventDefault(), (this.kind === "sheet" || this.closeOnEscape) && this.requestClose("escape");
	};
	onNativeClose = () => {
		!this.open || this.dialog?.open || this.pendingOpen || (this.requestClose("native"), this.syncOpen());
	};
	outside(e) {
		let t = this.dialog;
		if (!t || e.target !== t) return !1;
		let n = t.getBoundingClientRect();
		return e.clientX < n.left || e.clientX > n.right || e.clientY < n.top || e.clientY > n.bottom;
	}
	onPointerDown = (e) => {
		this.pointerStartedOutside = e.button === 0 && this.outside(e);
	};
	onClick = (e) => {
		e.defaultPrevented || (e.composedPath().find((e) => e instanceof HTMLElement && e.hasAttribute("data-ds-overlay-dismiss"))?.closest("dialog") === this.dialog ? this.requestClose("button") : this.closeOnBackdrop && this.pointerStartedOutside && this.outside(e) && this.requestClose("backdrop")), this.pointerStartedOutside = !1;
	};
	render() {
		return M`<slot @slotchange=${this.bindDialog}></slot>`;
	}
});
//#endregion
//#region src/vendor/ds1/0-face/tooltips.ts
var ea = 2e3, ta = 10, na = Symbol.for("ds-one:tooltips");
function ra() {
	if (typeof document > "u" || !document.body) return;
	let e = document.documentElement;
	if (e.hasAttribute("data-ds-tooltips-ready")) return;
	e.setAttribute("data-ds-tooltips-ready", "");
	let t = document.createElement("div");
	t.setAttribute("data-ds-tooltip", ""), t.setAttribute("role", "tooltip"), t.id = "ds-tooltip";
	let n = document.createElement("style");
	n.textContent = "\n    [data-ds-tooltip] {\n      position: fixed; z-index: 2147483646; top: 0; left: 0; pointer-events: none; visibility: hidden;\n      max-width: 320px; min-height: 16px; box-sizing: border-box; padding: 0 2.5px; border-radius: 4px;\n      background: var(--ds-tooltip-background, light-dark(#000, #fff));\n      color: var(--ds-tooltip-color, light-dark(#fff, #000));\n      font-family: var(--typeface-regular, var(--font-regular, system-ui)), sans-serif;\n      font-size: 14px; font-weight: 400; line-height: 16px; letter-spacing: 0; white-space: nowrap;\n    }\n    [data-ds-tooltip].is-wide { white-space: normal; }\n    [data-ds-tooltip].is-visible { visibility: visible; }\n    @media print { [data-ds-tooltip] { display: none; } }\n  ", document.head.appendChild(n), document.body.appendChild(t);
	let r = null, i, a = (e) => {
		let n = e.getBoundingClientRect(), r = t.offsetWidth, i = t.offsetHeight, a = Math.min(Math.max(4, n.left + n.width / 2 - r / 2), window.innerWidth - r - 4), o = e.closest("[data-tooltip-over]")?.getBoundingClientRect() ?? n, s = o.top - i - 2 >= 4 ? o.top - i - 2 : o.bottom + 2;
		t.style.transform = `translate(${Math.round(a)}px, ${Math.round(s)}px)`;
	}, o = (e) => {
		let n = e.dataset.tooltip;
		if (!n) return !1;
		t.textContent = n;
		let r = e.dataset.tooltipColour;
		return r ? (t.style.setProperty("--ds-tooltip-background", r), t.style.setProperty("--ds-tooltip-color", "#1e1e1e")) : (t.style.removeProperty("--ds-tooltip-background"), t.style.removeProperty("--ds-tooltip-color")), t.classList.remove("is-wide"), t.scrollWidth > 320 && t.classList.add("is-wide"), a(e), !0;
	}, s = typeof MutationObserver == "function" ? new MutationObserver(() => {
		r && (!r.isConnected || !o(r)) && l();
	}) : null, c = (e, n = {}) => {
		clearTimeout(i), i = void 0, r && r !== e && l(), o(e) && (r = e, e.getRootNode() === document && e.setAttribute("aria-describedby", t.id), s?.disconnect(), s?.observe(e, {
			attributes: !0,
			attributeFilter: ["data-tooltip", "data-tooltip-colour"]
		}), t.classList.add("is-visible"), n.duration !== void 0 && n.duration >= 0 && (i = setTimeout(l, n.duration)));
	};
	function l() {
		clearTimeout(i), i = void 0, s?.disconnect(), r?.removeAttribute("aria-describedby"), r = null, t.classList.remove("is-visible");
	}
	window[na] = {
		show: c,
		hide: l
	};
	let u = (e) => {
		for (let t of e.composedPath()) {
			if (t === document || t === window) break;
			if (t.hasAttribute?.("data-tooltip")) return t;
		}
		return e.target?.closest?.("[data-tooltip]") ?? null;
	}, d = (e) => {
		let t = e.composedPath()[0];
		try {
			return !!t?.matches?.(":focus-visible");
		} catch {
			return !1;
		}
	}, f = (e) => e.pointerType === "touch";
	document.addEventListener("pointerover", (e) => {
		if (f(e)) return;
		let t = u(e);
		t !== r && (t ? c(t) : l());
	}, { passive: !0 }), document.addEventListener("pointerleave", (e) => {
		f(e) || l();
	}, { passive: !0 }), document.addEventListener("focusin", (e) => {
		let t = u(e);
		t && d(e) && c(t);
	}), document.addEventListener("focusout", l), document.addEventListener("keydown", (e) => {
		e.key === "Escape" && l();
	}), window.addEventListener("scroll", l, {
		passive: !0,
		capture: !0
	});
	let p = null, m = !1, h = () => {
		p && clearTimeout(p.timer), p = null;
	};
	document.addEventListener("pointerdown", (e) => {
		if (m = !1, !f(e)) return;
		h(), l();
		let t = u(e);
		if (!t?.dataset.tooltip) return;
		let n = e;
		p = {
			target: t,
			id: n.pointerId,
			x: n.clientX,
			y: n.clientY,
			timer: setTimeout(() => {
				p &&= (m = !0, c(p.target, { duration: ea }), null);
			}, 500)
		};
	}, {
		passive: !0,
		capture: !0
	}), document.addEventListener("pointermove", (e) => {
		let t = e;
		p && t.pointerId === p.id && Math.hypot(t.clientX - p.x, t.clientY - p.y) > ta && h();
	}, {
		passive: !0,
		capture: !0
	}), document.addEventListener("pointerup", (e) => {
		if (!p || e.pointerId !== p.id) return;
		let { target: t } = p;
		h(), t.hasAttribute("data-tooltip-press") && c(t, { duration: ea });
	}, {
		passive: !0,
		capture: !0
	}), document.addEventListener("pointercancel", h, {
		passive: !0,
		capture: !0
	}), document.addEventListener("click", (e) => {
		m && (m = !1, e.preventDefault(), e.stopPropagation());
	}, { capture: !0 });
}
typeof document < "u" && (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", ra, { once: !0 }) : ra());
//#endregion
//#region src/vendor/ds1/3-unit/styles/ds-table-of-contents.css?inline
var ia = "[data-ds-shape=square],:host([data-ds-shape=square]){--ds-corner-size:0px;--ds-corner-shape:round;--ds-button-inset:.5px}[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:4px;--ds-corner-shape:round;--ds-button-inset:2.5px}[data-ds-shape=circular],:host([data-ds-shape=circular]){--ds-corner-size:999px;--ds-corner-shape:round;--ds-button-inset:5px}@supports (corner-shape:squircle){[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:8px;--ds-corner-shape:squircle}}:root,:host,:where([data-ds-surface]){--ds-unit:calc(var(--ds-1,20px) * var(--ds-sf,1));--ds-control-height:calc(var(--ds-control-size,var(--ds-08,16px)) * var(--ds-sf,1));--ds-row-height:calc(var(--ds-row-size,var(--ds-1,20px)) * var(--ds-sf,1));--ds-type-size-default:calc(var(--ds-text-size,14px) * var(--ds-sf,1));--ds-type-size-small:calc(var(--ds-small-text-size,10px) * var(--ds-sf,1));--ds-type-size-heading:calc(var(--ds-heading-text-size,13px) * var(--ds-sf,1));--ds-type-size-display:calc(var(--ds-display-text-size,20px) * var(--ds-sf,1));--ds-type-lineheight-default:calc(var(--ds-text-leading,16px) * var(--ds-sf,1));--ds-type-letterspacing-default:calc(var(--ds-text-tracking,-.3px) * var(--ds-sf,1));--ds-radius:calc(var(--ds-corner-size,4px) * var(--ds-sf,1));--ds-radius-card:calc(var(--ds-card-corner-size,4px) * var(--ds-sf,1))}:host{width:var(--ds-toc-width,calc(12 * var(--ds-unit)));max-width:100%;color:var(--ds-text-color);font-family:\"Inter Arrows\", var(--ds-typeface-regular);font-size:var(--ds-type-size-default);font-weight:var(--ds-type-weight-default);line-height:var(--ds-type-lineheight-default);letter-spacing:var(--ds-type-letterspacing-default);display:block}:host([hidden]){display:none!important}.title{min-height:var(--ds-unit);align-items:flex-end;display:flex}.links{margin-top:var(--ds-unit)}a,::slotted(a){box-sizing:border-box;min-height:var(--ds-unit);padding-top:calc(4px * var(--ds-sf));color:var(--ds-toc-color,var(--ds-text-color-muted));font:inherit;line-height:var(--ds-type-lineheight-default);letter-spacing:inherit;white-space:nowrap;text-overflow:clip;padding-inline-start:calc(var(--toc-depth,0) * var(--ds-unit));text-decoration:none;display:block;overflow:hidden}a[data-cut=end],::slotted(a[data-cut=end]){mask-image:linear-gradient(to right, #000 calc(100% - var(--ds-unit)), transparent)}:host(:dir(rtl)) a[data-cut=end],:host(:dir(rtl)) ::slotted(a[data-cut=end]){mask-image:linear-gradient(to left, #000 calc(100% - var(--ds-unit)), transparent)}a:hover,::slotted(a:hover){color:var(--ds-text-color);text-decoration:underline}a[aria-current],::slotted(a[aria-current]){color:var(--ds-toc-current-color,var(--ds-sharp-blue))}a:focus-visible,::slotted(a:focus-visible){outline:1px solid var(--ds-focus-ring);outline-offset:1px}";
K("ds-table-of-contents", class extends R {
	static properties = {
		items: { attribute: !1 },
		label: { type: String },
		literal: { type: Boolean },
		target: { attribute: !1 },
		current: { state: !0 }
	};
	static styles = h(ia);
	cuts = new dr(this, {
		selector: "a",
		targets: () => this.querySelectorAll(":scope > a"),
		text: !0
	});
	links = [];
	sections = [];
	scroller = null;
	frame = 0;
	observer;
	resize;
	relabel = () => this.requestUpdate();
	constructor() {
		super(), this.items = [], this.label = "Contents", this.literal = !1, this.current = "";
	}
	connectedCallback() {
		super.connectedCallback(), this.addEventListener("click", this.follow), window.addEventListener("scroll", this.schedule, { passive: !0 }), window.addEventListener("resize", this.schedule, { passive: !0 }), window.addEventListener("hashchange", this.schedule), window.addEventListener("language-changed", this.relabel), window.addEventListener("translations-loaded", this.relabel), this.observer = new MutationObserver(() => this.refresh()), this.observer.observe(this, {
			subtree: !0,
			childList: !0,
			characterData: !0,
			attributes: !0,
			attributeFilter: ["href", "data-depth"]
		}), typeof ResizeObserver < "u" && (this.resize = new ResizeObserver(this.schedule)), this.updateComplete.then(() => {
			this.isConnected && this.refresh();
		}), this.ownerDocument.fonts?.ready.then(this.schedule);
	}
	disconnectedCallback() {
		this.removeEventListener("click", this.follow), window.removeEventListener("scroll", this.schedule), this.scroller?.removeEventListener("scroll", this.schedule), window.removeEventListener("resize", this.schedule), window.removeEventListener("hashchange", this.schedule), window.removeEventListener("language-changed", this.relabel), window.removeEventListener("translations-loaded", this.relabel), this.observer?.disconnect(), this.resize?.disconnect(), cancelAnimationFrame(this.frame), super.disconnectedCallback();
	}
	updated(e) {
		(e.has("items") || e.has("target")) && this.refresh();
	}
	destination(e) {
		try {
			let t = new URL(e.href, this.ownerDocument.baseURI), n = new URL(this.ownerDocument.URL);
			if (!t.hash || t.origin !== n.origin || t.pathname !== n.pathname || t.search !== n.search) return null;
			let r = decodeURIComponent(t.hash.slice(1));
			return this.target ? [...this.target.querySelectorAll("[id]")].find((e) => e.id === r) ?? null : this.getRootNode().getElementById(r) ?? null;
		} catch {
			return null;
		}
	}
	refresh() {
		if (!this.isConnected) return;
		this.links = this.items.length ? [...this.renderRoot.querySelectorAll("a")] : [...this.querySelectorAll("a[href]")], this.sections = this.links.flatMap((e) => {
			let t = this.destination(e);
			return t ? [{
				link: e,
				heading: t
			}] : [];
		});
		for (let e of this.links) {
			let t = Number(e.dataset.depth ?? 0);
			e.style.setProperty("--toc-depth", String(Number.isFinite(t) ? Math.max(0, t) : 0));
		}
		this.scroller?.removeEventListener("scroll", this.schedule), this.scroller = null;
		let e = (e) => e.parentElement ?? (e.getRootNode() instanceof ShadowRoot ? e.getRootNode().host : null);
		for (let t = this.sections[0] ? e(this.sections[0].heading) : null; t; t = e(t)) if (/(auto|scroll)/.test(getComputedStyle(t).overflowY)) {
			this.scroller = t;
			break;
		}
		this.scroller?.addEventListener("scroll", this.schedule, { passive: !0 }), this.resize?.disconnect(), this.resize?.observe(this), this.target && this.resize?.observe(this.target), this.scroller && this.resize?.observe(this.scroller), this.schedule();
	}
	schedule = () => {
		this.isConnected && (cancelAnimationFrame(this.frame), this.frame = requestAnimationFrame(() => this.track()));
	};
	track() {
		for (let e of this.links) e.scrollWidth > e.clientWidth ? e.setAttribute("data-tooltip", e.textContent?.trim() ?? "") : e.removeAttribute("data-tooltip");
		if (!this.sections.length) {
			this.mark("");
			return;
		}
		let e = this.scroller?.getBoundingClientRect()?.top ?? 0, t = this.scroller?.clientHeight ?? window.innerHeight, n = this.scroller?.scrollTop ?? window.scrollY, r = this.scroller?.scrollHeight ?? this.ownerDocument.documentElement.scrollHeight, i = n > 0 && n + t >= r - 1, a = this.renderRoot.querySelector(".title")?.getBoundingClientRect().height || 20, o = e + (i ? t : a), s = this.sections[0].link.getAttribute("href");
		for (let { link: e, heading: t } of this.sections) if (t.getBoundingClientRect().top <= o) s = e.getAttribute("href");
		else break;
		this.mark(s);
	}
	mark(e) {
		for (let t of this.links) t.getAttribute("href") === e ? t.setAttribute("aria-current", "location") : t.removeAttribute("aria-current");
		this.current !== e && (this.current = e, this.dispatchEvent(new CustomEvent("toc-change", {
			detail: { href: e },
			bubbles: !0,
			composed: !0
		})));
	}
	follow = (e) => {
		if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
		let t = e.composedPath().find((e) => e instanceof HTMLAnchorElement);
		if (!t || !this.links.includes(t) || t.target === "_blank" || t.hasAttribute("download")) return;
		let n = this.destination(t);
		n && (e.preventDefault(), n.scrollIntoView({
			block: "start",
			behavior: "auto"
		}), n.hasAttribute("tabindex") || n.setAttribute("tabindex", "-1"), n.focus({ preventScroll: !0 }), history.pushState(history.state, "", t.href), this.mark(t.getAttribute("href")));
	};
	render() {
		let e = this.label || "Contents", t = this.literal ? e : G(e) || e;
		return M`<nav aria-label=${t} part="navigation">
      <div class="title"><ds-text literal strong role="heading" aria-level="2" part="title">${t}</ds-text></div>
      <div class="links" part="links"><slot @slotchange=${() => this.refresh()}>
        ${this.items.map((e) => M`<a href=${e.href} data-depth=${e.depth ?? 0} aria-current=${this.current === e.href ? "location" : P} part="link">${e.label}</a>`)}
      </slot></div>
    </nav>`;
	}
});
//#endregion
//#region src/words.ts
var aa = { da: {
	Save: "Gem",
	"Saving…": "Gemmer…",
	Saved: "Gemt",
	"Not saved": "Ikke gemt",
	"Not saved yet": "Ikke gemt endnu",
	Draft: "Kladde",
	"Draft saved": "Kladde gemt",
	"Draft restored": "Kladde hentet",
	"Text style": "Teksttype",
	"More formatting": "Mere formatering",
	Lists: "Lister",
	Highlight: "Fremhævning",
	"Add picture or file": "Tilføj billede eller fil",
	"Add a caption": "Tilføj billedtekst",
	"Add a comment": "Tilføj en kommentar",
	"Add headings to show them here.": "Tilføj overskrifter for at vise dem her.",
	"Add reaction": "Tilføj reaktion",
	"Add tab": "Tilføj fane",
	"Added {name}": "Tilføjede {name}",
	Apply: "Anvend",
	"Arrow (A)": "Pil (A)",
	"Ask AI": "Spørg AI",
	"Ask AI about the selected words": "Spørg AI om de markerede ord",
	"Ask AI about these words": "Spørg AI om disse ord",
	"Ask AI or press space to speak": "Spørg AI, eller tryk mellemrum for at tale",
	"Ask AI to write": "Bed AI om at skrive",
	"Asking AI is not set up here": "AI er ikke sat op her",
	"Block commands": "Blokkommandoer",
	Blocks: "Blokke",
	Blue: "Blå",
	"Blue fill": "Blå baggrund",
	Bold: "Fed",
	Brown: "Brun",
	"Brown fill": "Brun baggrund",
	"Bulleted list": "Punktliste",
	Button: "Knap",
	"Button label": "Knaptekst",
	"Button state": "Knaptilstand",
	"Button: {label}, {state}": "Knap: {label}, {state}",
	Callout: "Fremhævet boks",
	"Callout icon": "Ikon til boksen",
	Cancel: "Annuller",
	chart: "diagram",
	Close: "Luk",
	"Close find": "Luk søgning",
	Code: "Kode",
	Colour: "Farve",
	Columns: "Kolonner",
	Comment: "Kommentér",
	Comments: "Kommentarer",
	Default: "Standard",
	Delete: "Slet",
	"Delete thread": "Slet tråd",
	"Delete?": "Slet?",
	"Deleted {name}": "Slettede {name}",
	Diagram: "Diagram",
	Divider: "Skillelinje",
	Drawn: "Tegnet",
	Duplicate: "Duplikér",
	Edit: "Redigér",
	"Edit button": "Redigér knap",
	"Edit button: {label}, {state}": "Redigér knap: {label}, {state}",
	"Edit comment": "Redigér kommentar",
	"Edit link": "Redigér link",
	Edited: "Redigeret",
	Internal: "Intern",
	Editing: "Redigerer",
	Equation: "Ligning",
	Find: "Find",
	"Fit the width": "Tilpas bredden",
	"Fits the width": "Tilpasser bredden",
	Green: "Grøn",
	"Green fill": "Grøn baggrund",
	Grey: "Grå",
	"Grey fill": "Grå baggrund",
	grid: "gitter",
	group: "gruppe",
	Heading: "Overskrift",
	"Heading 1": "Overskrift 1",
	"Heading 2": "Overskrift 2",
	"Heading 3": "Overskrift 3",
	"Icon {emoji}": "Ikon {emoji}",
	"Image or file": "Billede eller fil",
	Indent: "Ryk ind",
	"Insert block": "Indsæt blok",
	Italic: "Kursiv",
	Item: "Punkt",
	item: "punkt",
	"Item (I)": "Punkt (I)",
	"Joined {name} to {end}": "Forbandt {name} med {end}",
	"Joining {name}. Tab to the one to join it to, then Enter. Escape stops.": "Forbinder {name}. Tab til det, den skal forbindes med, og tryk Enter. Escape stopper.",
	"Keeps its layout": "Beholder sit layout",
	Label: "Tekst",
	"Line (L)": "Linje (L)",
	Link: "Link",
	"Link URL": "Linkadresse",
	"Listening…": "Lytter…",
	"Made a line": "Lavede en linje",
	"Made an arrow": "Lavede en pil",
	month: "måned",
	More: "Mere",
	"Move down": "Flyt ned",
	"Move up": "Flyt op",
	"Moved {name}": "Flyttede {name}",
	Name: "Navn",
	"Named {name}": "Navngav {name}",
	"Next comment": "Næste kommentar",
	"Next match": "Næste resultat",
	"No colour": "Ingen farve",
	"No comments yet.": "Ingen kommentarer endnu.",
	"No icon": "Intet ikon",
	"No matching commands": "Ingen kommandoer passer",
	"No microphone was found": "Der blev ikke fundet en mikrofon",
	"Nobody to mention": "Ingen at nævne",
	"Not answered": "Intet svar",
	"Not joined": "Ikke forbundet",
	Note: "Note",
	note: "note",
	"Note (N)": "Note (N)",
	"Nothing here": "Intet her",
	"Nothing resolved yet.": "Intet er løst endnu.",
	"Nothing was heard: press Space twice to try again": "Intet blev hørt: tryk mellemrum to gange for at prøve igen",
	"Numbered list": "Nummereret liste",
	Open: "Åbne",
	Orange: "Orange",
	"Orange fill": "Orange baggrund",
	Outdent: "Ryk ud",
	"People to mention": "Personer at nævne",
	"Picture width": "Billedbredde",
	Pink: "Lyserød",
	"Pink fill": "Lyserød baggrund",
	"Press space for AI": "Tryk mellemrum for AI",
	"Press space for AI, or {action}": "Tryk mellemrum for AI, eller {action}",
	"Press space to speak, or {action}": "Tryk mellemrum for at tale, eller {action}",
	"Previous comment": "Forrige kommentar",
	"Previous match": "Forrige resultat",
	Purple: "Lilla",
	"Purple fill": "Lilla baggrund",
	Quote: "Citat",
	"React with {emoji}": "Reagér med {emoji}",
	Red: "Rød",
	"Red fill": "Rød baggrund",
	Reopen: "Genåbn",
	Replace: "Erstat",
	"Replace all": "Erstat alle",
	Reply: "Svar",
	Resolve: "Løs",
	Resolved: "Løste",
	"Resolved by {name}.": "Løst af {name}.",
	"Resolved.": "Løst.",
	Revert: "Fortryd",
	"Revert what AI changed here": "Fortryd det, AI ændrede her",
	"Revert what AI wrote here": "Fortryd det, AI skrev her",
	"Select words and press Comment to start a thread.": "Markér ord, og tryk Kommentér for at starte en tråd.",
	"Sized {name}": "Ændrede størrelsen på {name}",
	"Speaking could not start here": "Tale kunne ikke starte her",
	"Speaking is not available in this browser": "Tale virker ikke i denne browser",
	"Speaking is turned off in this browser": "Tale er slået fra i denne browser",
	"Speaking needs a connection": "Tale kræver forbindelse",
	State: "Tilstand",
	Strikethrough: "Gennemstreget",
	"Tab chooses each item and line. Arrows move what is chosen, Alt and arrows size it, Enter or a click writes in it, L or A joins it to another, I adds an item, N a note, Delete takes it away.": "Tab vælger hvert punkt og hver linje. Pile flytter det valgte, Alt og pile ændrer størrelsen, Enter eller et klik skriver i det, L eller A forbinder det med et andet, I tilføjer et punkt, N en note, Delete fjerner det.",
	"Tab name": "Fanenavn",
	"Tab {number}": "Fane {number}",
	Table: "Tabel",
	"Table of contents": "Indholdsfortegnelse",
	Tabs: "Faner",
	Text: "Tekst",
	"Text colour": "Tekstfarve",
	"Background colour": "Baggrundsfarve",
	Header: "Overskrift",
	"Column width": "Kolonnebredde",
	"Text formatting": "Tekstformatering",
	"The microphone is blocked: allow it for this site in Safari › Settings › Websites › Microphone": "Mikrofonen er blokeret: tillad den for siden i Safari › Indstillinger › Websteder › Mikrofon",
	"The microphone is blocked: allow it for this site in the browser’s settings": "Mikrofonen er blokeret: tillad den for siden i browserens indstillinger",
	"Thinking…": "Tænker…",
	"To-do": "To do",
	Toggle: "Fold ud",
	"Toggle heading 1": "Fold ud-overskrift 1",
	"Toggle heading 2": "Fold ud-overskrift 2",
	"Toggle heading 3": "Fold ud-overskrift 3",
	"Turn into": "Lav om til",
	"Turn on Dictation in System Settings › Keyboard to speak here": "Slå Diktering til i Systemindstillinger › Tastatur for at tale her",
	Underline: "Understreget",
	Unnamed: "Unavngivet",
	White: "Hvid",
	"White fill": "Hvid baggrund",
	write: "skriv",
	Yellow: "Gul",
	"Yellow fill": "Gul baggrund",
	"{count} comment": "{count} kommentar",
	"{count} comments": "{count} kommentarer",
	"{count} matches": "{count} resultater",
	"{count} resolved": "{count} løst",
	"{number} of {count}": "{number} af {count}",
	"{words} words, {characters} characters": "{words} ord, {characters} tegn"
} }, oa = Symbol.for("design-system-1.translate"), sa = Symbol.for("aa.words"), ca = globalThis;
function la() {
	return (typeof document > "u" ? "" : document.documentElement.lang || "").trim().toLowerCase() || "en";
}
function $(e, t) {
	let n = la(), r = ca[sa], i = typeof r == "function" ? r(e, n) : r?.[e];
	if (i === void 0) {
		let t = globalThis[oa];
		if (typeof t == "function") {
			let n = String(t(e));
			n !== e && (i = n);
		}
	}
	i === void 0 && (i = aa[n]?.[e] ?? aa[n.split("-")[0]]?.[e]);
	let a = i ?? e;
	return t ? a.replace(/\{(\w+)\}/g, (e, n) => n in t ? String(t[n]) : e) : a;
}
//#endregion
//#region src/components.ts
Mn({
	autoLoad: !1,
	persist: !1,
	langTarget: !1
});
function ua(e, t, n) {
	let r = s(t);
	e.classList.add("aa-partial"), e.setAttribute("data-aa-interactive", "");
	let i = document.createElement("ds-button");
	i.inert = !0, i.setAttribute("aria-hidden", "true"), l(i, r), e.append(i);
	let o, u = () => {
		e.tabIndex = n() ? 0 : -1, e.setAttribute("role", n() ? "button" : "img"), e.setAttribute("aria-label", $(n() ? "Edit button: {label}, {state}" : "Button: {label}, {state}", {
			label: r.label,
			state: r.state
		}));
	};
	u();
	let d = new MutationObserver(u);
	queueMicrotask(() => {
		e.isConnected && d.observe(e.closest(".aa-block"), {
			attributes: !0,
			attributeFilter: ["data-readonly"]
		});
	});
	let f = () => {
		if (!n() || o) return;
		let s = e.ownerDocument;
		if (!s.querySelector("style[data-aa-partial-overlay]")) {
			let e = s.createElement("style");
			e.dataset.aaPartialOverlay = "", e.textContent = Ui, s.head.append(e);
		}
		let d = s.createElement("ds-overlay");
		d.type = "popover", d.closeOnOutside = !0, d.returnFocus = () => e, d.setAttribute("data-aa-interactive", "");
		let f = e.getBoundingClientRect();
		d.anchor = {
			x: f.left,
			y: f.bottom
		};
		let p = s.createElement("dialog");
		p.className = "aa-partial-properties", p.setAttribute("aria-label", $("Edit button"));
		let m = s.createElement("ds-input");
		m.labelText = $("Label"), m.value = r.label, m.setAttribute("aria-label", $("Button label"));
		let h = s.createElement("label");
		h.textContent = $("State");
		let g = s.createElement("ds-select"), _ = s.createElement("select");
		_.setAttribute("aria-label", $("Button state"));
		for (let e of a) {
			let t = s.createElement("option");
			t.value = e, t.textContent = e[0].toUpperCase() + e.slice(1), _.append(t);
		}
		_.value = r.state, g.append(_), h.append(g);
		let v = s.createElement("div");
		v.className = "aa-partial-actions";
		let y = s.createElement("ds-button");
		y.textContent = $("Cancel");
		let b = s.createElement("ds-button");
		b.textContent = $("Apply"), b.primary = !0;
		let x = s.createElement("ds-button");
		x.inert = !0, x.setAttribute("aria-hidden", "true"), l(x, r);
		let S = () => ({
			label: m.value,
			state: _.value
		}), C = () => l(x, S());
		m.addEventListener("input", C), _.addEventListener("change", C);
		let w = () => {
			d.close(), d.remove(), o = void 0;
		};
		o = w, y.addEventListener("click", w), b.addEventListener("click", () => {
			if (!n()) {
				w();
				return;
			}
			let a = c(S());
			w(), a !== t && (r = S(), t = a, l(i, r), u(), e.dispatchEvent(new CustomEvent("aa-atom-source", {
				bubbles: !0,
				detail: { source: a }
			})));
		}), d.addEventListener("ds-close-request", (e) => {
			e.preventDefault(), w();
		}), v.append(y, b), p.append(m, h, x, v), d.append(p), (e.closest("dialog") ?? s.body).append(d), d.show({ immediate: !0 }).then(() => {
			d.isConnected && m.focus();
		});
	};
	return e.addEventListener("click", (e) => {
		e.preventDefault(), e.stopPropagation(), f();
	}), e.addEventListener("keydown", (t) => {
		(t.key === "Backspace" || t.key === "Delete") && n() && (t.preventDefault(), t.stopPropagation(), e.dispatchEvent(new CustomEvent("aa-atom-source", {
			bubbles: !0,
			detail: { source: "" }
		}))), (t.key === "Enter" || t.key === " ") && (t.preventDefault(), t.stopPropagation(), f());
	}), () => {
		d.disconnect(), o?.();
	};
}
function da(e) {
	let t = e.element, n = t.ownerDocument, r = n.createElement("ds-menu");
	r.floating = !0, r.focusOnOpen = !1, r.setAttribute("aria-label", $("Button state")), r.id = `aa-partials-${crypto.randomUUID()}`;
	let i = null, o = !1, s = "", l = () => {
		r.open = !1, i = null;
	}, u = a.map((t, a) => {
		let o = n.createElement("ds-button");
		return o.menuItem = !0, o.setAttribute("role", "option"), o.id = `${r.id}-${a}`, o.textContent = t[0].toUpperCase() + t.slice(1), o.addEventListener("click", () => {
			let n = i;
			if (!n || e.readOnly || !/^@button$/i.test(e.value.slice(n.start, n.end))) return;
			let r = c({
				label: "Button",
				state: t
			});
			l(), e.replace(n.start, n.end, r), e.selectRange(n.start + r.length);
		}), o;
	});
	r.append(...u), (t.closest("dialog") ?? n.body).append(r);
	let d = () => {
		if (o) return;
		let n = e.selection(), a = e.activeBlock();
		if (e.readOnly || !n || n.start !== n.end || !a || ["code", "table"].includes(a.block.kind)) {
			l();
			return;
		}
		let c = e.value.slice(a.start, n.end), d = /(?:^|\s)(@button)$/i.exec(c), f = `${n.end}:${e.value}`;
		if (!d || s === f) {
			l();
			return;
		}
		let p = e.rangeOf(n.end - 7, n.end);
		(p?.startContainer.parentElement)?.closest(".aa-c, code, a") ? l() : (i = {
			start: n.end - d[1].length,
			end: n.end
		}, r.controller = t.children[a.index], r.anchor = p?.getBoundingClientRect?.() ?? r.controller.getBoundingClientRect(), r.open || (r.activeId = u[0].id), r.open = !0, r.renderNow());
	};
	r.addEventListener("ds-menu-close", () => {
		s = `${e.selection()?.end}:${e.value}`, i = null;
	});
	let f = () => {
		o = !0, l();
	}, p = () => {
		o = !1, d();
	};
	return t.addEventListener("aa-change", d), t.addEventListener("aa-selectionchange", d), t.addEventListener("compositionstart", f), t.addEventListener("compositionend", p), () => {
		r.remove(), t.removeEventListener("aa-change", d), t.removeEventListener("aa-selectionchange", d), t.removeEventListener("compositionstart", f), t.removeEventListener("compositionend", p);
	};
}
function fa(e, n, r, i) {
	e.classList.add("aa-toc"), e.setAttribute("data-aa-interactive", "");
	let a = document.createElement("ds-table-of-contents");
	a.label = $("Table of contents"), a.literal = !0, a.target = r;
	let o = document.createElement("span");
	o.className = "aa-toc-empty", o.textContent = $("Add headings to show them here."), e.append(a, o);
	let s = `aa-heading-${crypto.randomUUID()}`, c = 0, l = "";
	return () => {
		let e = n().flatMap((e, n) => {
			if (e.kind !== "heading") return [];
			let i = t(e).filter((e) => e.kind === "text").map((t) => e.source.slice(t.from, t.to)).join("").trim();
			if (!i) return [];
			let a = r.children[n];
			return a ? (a.id ||= `${s}-${c++}`, [{
				index: n,
				text: i,
				level: e.level ?? 1,
				id: a.id
			}]) : [];
		}), u = JSON.stringify(e);
		if (u !== l) {
			l = u;
			let t = Math.min(...e.map((e) => e.level));
			a.replaceChildren(...e.map((e) => {
				let n = document.createElement("a");
				return n.href = `#${e.id}`, n.dataset.depth = String(e.level - t), n.textContent = e.text, n.addEventListener("click", (t) => {
					t.preventDefault(), t.stopPropagation(), i(e.index);
				}), n;
			})), o.hidden = !!e.length;
		}
		a.refresh?.();
	};
}
//#endregion
export { da as createPartialPicker, fa as createTableOfContents, ua as drawButtonPartial };

