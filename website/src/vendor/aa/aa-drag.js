import { besideChange as e, parseBlocks as t } from "./aa.js";
//#region src/placement.ts
function n(e, t, n, r = 20) {
	let i = e.findIndex((e, i) => i !== t && n.y >= e.top && n.y <= e.bottom && n.x >= e.left - r && n.x <= e.right + r), a = e[i];
	if (!a) return null;
	let o = Math.min(a.width / 5, 4 * r), s = n.x < a.left + o ? "start" : n.x > a.right - o ? "end" : null;
	return s ? {
		index: i,
		at: s,
		rect: a
	} : null;
}
function r(e, t, n) {
	let r = e.caretPositionFromPoint?.(t, n);
	if (r) return {
		node: r.offsetNode,
		offset: r.offset
	};
	let i = e.caretRangeFromPoint?.(t, n);
	return i ? {
		node: i.startContainer,
		offset: i.startOffset
	} : null;
}
//#endregion
//#region src/vendor/drag/flow.ts
function i(e, t) {
	return Math.max(e, t, 0) + Math.min(e, t, 0);
}
function a(e, t, n) {
	let r = [], a = n;
	return e.forEach((n, o) => {
		let s = e[o - 1], c = s ? t.collapse ? i(s.marginEnd, n.marginStart) : s.marginEnd + t.gap + n.marginStart : t.collapse && t.through ? 0 : n.marginStart;
		r.push(a + c), a += c + n.size;
	}), r;
}
function o(e, t, n) {
	let r = a(e, t, n);
	return e.every((e, t) => Math.abs(r[t] - e.start) <= 1);
}
//#endregion
//#region src/vendor/drag/util.ts
function s(e) {
	let t = !1, n;
	return ((...r) => (t || (t = !0, n = e(...r)), n));
}
//#endregion
//#region src/vendor/drag/sortable.ts
var c = {
	instructions: "Press space to lift. Then use the arrow keys to move, space to drop and escape to cancel.",
	lifted: (e) => `Lifted ${e.item}, position ${e.position} of ${e.count} in ${e.list}.`,
	moved: (e) => `${e.item}, position ${e.position} of ${e.count} in ${e.list}.`,
	outside: (e) => `${e} is outside every list.`,
	combining: (e, t) => `${e} is over ${t}. Drop to put them together.`,
	combined: (e, t) => `Dropped ${e} onto ${t}.`,
	dropped: (e) => `Dropped ${e.item} at position ${e.position} of ${e.count} in ${e.list}.`,
	returned: (e) => `${e.item} is back at position ${e.position} of ${e.count} in ${e.list}.`
}, l = {
	touchHold: 250,
	dragDistance: 5,
	outOfTheWay: {
		duration: 200,
		easing: "cubic-bezier(0.2, 0, 0, 1)"
	},
	drop: {
		minDuration: 330,
		maxDuration: 550,
		easing: "cubic-bezier(.2, 1, .1, 1)"
	},
	autoScrollEdge: 60
}, u = 1500, d = 24, f = 1e3 / 60, p = 10, m = [
	"color",
	"font",
	"letter-spacing",
	"line-height",
	"-webkit-font-smoothing"
], h = "input, textarea, select, option, button, a[href], [contenteditable]:not([contenteditable=\"false\"])", g = "data-0001-drag-sortable-style", _ = "\n[data-drag-handle]:not([data-drag-handle=\"text\"]){-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;cursor:grab;touch-action:manipulation}\n:root[data-drag-active],:root[data-drag-active] *{-webkit-user-select:none!important;user-select:none!important;cursor:grabbing!important;overflow-anchor:none!important}\n";
function v(e = {}) {
	let t = {
		touchHold: e.touchHold ?? l.touchHold,
		dragDistance: e.dragDistance ?? l.dragDistance,
		outOfTheWay: e.outOfTheWay ?? l.outOfTheWay,
		drop: e.drop ?? l.drop,
		autoScrollEdge: e.autoScrollEdge ?? l.autoScrollEdge
	}, n = {
		...c,
		...e.messages
	}, r = e.pointerPoint ?? ((e) => ({
		x: e.clientX,
		y: e.clientY
	})), i = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), v = /* @__PURE__ */ new Map(), N = null, P = null, I = /* @__PURE__ */ new Map(), L = null, ae = !1, R = !1, z = /* @__PURE__ */ new Set(), oe = null, B = null;
	function V(e) {
		let t = {
			element: e.element,
			id: e.id,
			type: e.type ?? "default",
			axis: e.axis ?? "vertical",
			isDropDisabled: e.isDropDisabled ?? (() => !1),
			isCombineEnabled: e.isCombineEnabled ?? (() => !1),
			label: () => e.label ?? e.element.getAttribute("aria-label") ?? e.id,
			still: e.still ?? !1,
			lockAxis: e.lockAxis,
			renderPreview: e.renderPreview,
			hitArea: e.hitArea ?? null
		};
		return i.set(e.element, t), s(() => {
			i.get(e.element) === t && i.delete(e.element);
		});
	}
	function H(e) {
		let t = e.handle ?? e.element, n = {
			element: e.element,
			id: e.id,
			type: e.type ?? "default",
			handle: t,
			canDrag: e.canDrag ?? (() => !0),
			allowInteractive: e.allowInteractive ?? !1,
			label: () => e.label ?? ee(e.element, t),
			text: e.text
		};
		o.set(e.element, n), v.set(t, n), t.setAttribute("data-drag-handle", e.text ? "text" : "");
		let r = !e.text && !t.hasAttribute("tabindex") && !t.matches(h);
		r && (t.tabIndex = 0);
		let i = t.getAttribute("aria-describedby"), { instructions: a } = U(t.ownerDocument);
		return e.text || t.setAttribute("aria-describedby", [i, a.id].filter(Boolean).join(" ")), s(() => {
			if (o.get(e.element) === n && o.delete(e.element), v.get(t) === n) {
				if (v.delete(t), t.removeAttribute("data-drag-handle"), r && t.removeAttribute("tabindex"), e.text) return;
				i ? t.setAttribute("aria-describedby", i) : t.removeAttribute("aria-describedby");
			}
		});
	}
	function U(e) {
		let t = I.get(e);
		if (t) return t;
		let r = e.defaultView ?? window;
		if (r.addEventListener("pointerdown", ue, !0), r.addEventListener("keydown", ce, !0), !e.querySelector(`style[${g}]`)) {
			let t = e.createElement("style");
			t.setAttribute(g, ""), t.textContent = _, e.head.appendChild(t);
		}
		let i = T(e, `0001-drag-instructions-${++S}`);
		i.textContent = n.instructions;
		let a = T(e, `0001-drag-live-${S}`);
		a.setAttribute("aria-live", "assertive"), a.setAttribute("aria-atomic", "true");
		let o = {
			view: r,
			instructions: i,
			liveRegion: a
		};
		return I.set(e, o), o;
	}
	function W(e) {
		oe && (oe.textContent = e);
	}
	function se(e) {
		let t = e.destination;
		return t ? {
			item: e.item.label(),
			list: t.container.registration.label(),
			position: t.index + 1,
			count: t.container.slots.length + 1
		} : null;
	}
	function G(e) {
		let t = se(e);
		W(t ? n.moved(t) : n.outside(e.item.label()));
	}
	function ce(e) {
		if (ae || P || N || e.key !== " " || e.defaultPrevented) return;
		let t = x(e.target);
		if (t?.matches("input, textarea, select, [contenteditable]:not([contenteditable=\"false\"])")) return;
		let n = t ? v.get(t) : void 0;
		if (!n || n.text || !n.canDrag({
			input: "keyboard",
			target: n.handle
		})) return;
		e.preventDefault(), e.stopPropagation(), xe(n.element.ownerDocument.defaultView ?? window);
		let r = O(n.element);
		we(n, -1, r.left + r.width / 2, r.top + r.height / 2, "SNAP");
	}
	function le(e) {
		let t = x(e), n = !1;
		for (; t;) {
			let e = v.get(t);
			if (e) return n && !e.allowInteractive ? null : e;
			t.matches(h) && (n = !0), t = t.parentElement;
		}
		return null;
	}
	function ue(e) {
		if (ae) return;
		if (B?.(), P?.dropping && !N && P.land?.(), P && P.mode === "SNAP" && !P.dropping) {
			X("CANCEL");
			return;
		}
		if (P || N || e.pointerType === "mouse" && e.button !== 0) return;
		let n = le(e.target), i = x(e.target);
		if (!n || !n.canDrag({
			input: e.pointerType || "mouse",
			target: i
		})) return;
		let a = e.pointerType !== "touch" && n.text ? Math.max(0, n.text.hold()) : 0;
		N = {
			item: n,
			pointerId: e.pointerId,
			pointerType: e.pointerType,
			startX: r(e).x,
			startY: r(e).y,
			timer: null,
			held: a > 0
		}, (e.pointerType === "touch" || a > 0) && (N.timer = setTimeout(() => {
			N && we(N.item, N.pointerId, N.startX, N.startY);
		}, a || t.touchHold)), xe(n.element.ownerDocument.defaultView ?? window);
	}
	function de(e) {
		if (e.pointerType === "mouse" && e.buttons === 0) N && e.pointerId === N.pointerId ? q() : P && P.mode === "FLUID" && e.pointerId === P.pointerId && !P.dropping && X("CANCEL");
		else {
			if (N && e.pointerId === N.pointerId) {
				let n = r(e);
				if (Math.hypot(n.x - N.startX, n.y - N.startY) < t.dragDistance) return;
				let i = N.pointerType === "touch" ? void 0 : N.item.text?.carries;
				if ((N.pointerType === "touch" || N.held || N.choosing) && !i?.(n)) {
					if (N.choosing) return;
					let e = N.pointerType === "touch" ? void 0 : N.item.text?.axis, t = Math.abs(e === "x" ? n.x - N.startX : n.y - N.startY), r = Math.abs(e === "x" ? n.y - N.startY : n.x - N.startX);
					if (!e || t < 2 * r) {
						if (!i) {
							q();
							return;
						}
						N.timer && clearTimeout(N.timer), N.timer = null, N.held = !1, N.choosing = !0;
						return;
					}
				}
				we(N.item, N.pointerId, N.startX, N.startY);
			}
			if (P && e.pointerId === P.pointerId && !P.dropping) {
				let t = r(e);
				Te(t.x, t.y);
			}
		}
	}
	function fe(e) {
		N && e.pointerId === N.pointerId ? q() : P && e.pointerId === P.pointerId && !P.dropping && (Ce(), X("DROP"));
	}
	function pe(e) {
		N && e.pointerId === N.pointerId && q(), P && e.pointerId === P.pointerId && !P.dropping && X("CANCEL");
	}
	function me(e) {
		let t = P;
		if (t && !t.dropping) {
			if (e.key === "Escape") e.preventDefault(), e.stopPropagation(), X("CANCEL");
			else if (t.mode === "SNAP") {
				if (e.key === " " || e.key === "Enter") X("DROP");
				else if (e.key in C) Oe(t, C[e.key]);
				else if (e.key !== "Tab") return;
				e.preventDefault(), e.stopPropagation();
			}
		}
	}
	function he(e) {
		P && e.cancelable && e.preventDefault();
	}
	function ge(e) {
		(N || P) && (e.preventDefault(), e.stopImmediatePropagation());
	}
	function _e(e) {
		(N || P) && e.preventDefault();
	}
	function ve() {
		q(), P && !P.dropping && X("CANCEL");
	}
	function ye(e) {
		(e.type !== "visibilitychange" || L?.document.visibilityState === "hidden") && ve();
	}
	function be() {
		if (!P || P.dropping || P.impactFrame !== null) return;
		let e = P.overlay.ownerDocument.defaultView;
		e && (P.impactFrame = e.requestAnimationFrame(() => {
			P && (P.impactFrame = null, P.mode === "SNAP" ? je(P, !1) : De(P));
		}));
	}
	function xe(e) {
		L !== e && (K(), L = e, oe = I.get(e.document)?.liveRegion ?? null, e.addEventListener("pointermove", de, !0), e.addEventListener("pointerup", fe, !0), e.addEventListener("pointercancel", pe, !0), e.addEventListener("touchmove", he, {
			capture: !0,
			passive: !1
		}), e.addEventListener("contextmenu", ge, !0), e.addEventListener("dragstart", _e, !0), e.addEventListener("keydown", me, !0), e.addEventListener("blur", ve), e.addEventListener("pagehide", ye), e.document.addEventListener("visibilitychange", ye), e.addEventListener("scroll", be, !0));
	}
	function K() {
		let e = L;
		e && (L = null, e.removeEventListener("pointermove", de, !0), e.removeEventListener("pointerup", fe, !0), e.removeEventListener("pointercancel", pe, !0), e.removeEventListener("touchmove", he, !0), e.removeEventListener("contextmenu", ge, !0), e.removeEventListener("dragstart", _e, !0), e.removeEventListener("keydown", me, !0), e.removeEventListener("blur", ve), e.removeEventListener("pagehide", ye), e.document.removeEventListener("visibilitychange", ye), e.removeEventListener("scroll", be, !0));
	}
	function q() {
		N && (N.timer && clearTimeout(N.timer), N = null, P || K());
	}
	function Se(e, t) {
		B?.();
		let n = (n) => {
			n.pointerId === t && (B?.(), n.type === "pointerup" && Ce(e));
		};
		e.addEventListener("pointerup", n, !0), e.addEventListener("pointercancel", n, !0), B = () => {
			B = null, e.removeEventListener("pointerup", n, !0), e.removeEventListener("pointercancel", n, !0);
		};
	}
	function Ce(e = P?.overlay.ownerDocument.defaultView ?? L ?? window) {
		let t = (e) => {
			e.preventDefault(), e.stopPropagation();
		};
		e.addEventListener("click", t, {
			capture: !0,
			once: !0
		}), setTimeout(() => e.removeEventListener("click", t, !0), 0);
	}
	function we(t, r, a, o, s = "FLUID") {
		N?.timer && clearTimeout(N.timer), N = null, e.onBeforeCapture?.({
			draggableId: t.id,
			mode: s
		});
		for (let e of z) e.finish();
		z.clear();
		let c = Qe(t);
		if (!c) {
			K();
			return;
		}
		let l = c.element.ownerDocument, u = l.defaultView ?? window, d = Ye(c);
		if (!d) {
			K();
			return;
		}
		R = u.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? !1;
		let f = O(c.element), p = u.getComputedStyle(c.element), h = {
			top: M(p.marginTop),
			left: M(p.marginLeft),
			vertical: M(p.marginTop) + M(p.marginBottom),
			horizontal: M(p.marginLeft) + M(p.marginRight)
		}, g = E(c.element, f), _ = /* @__PURE__ */ new Map(), v = [], y = 0;
		for (let e of i.values()) {
			if (e.type !== c.type || !e.element.isConnected || e.element.ownerDocument !== l || c.element.contains(e.element)) continue;
			let t = Xe(e), n = e === d, r = u.getComputedStyle(e.element), i = e.axis === "vertical", a = O(e.element), o = E(e.element, a), s = M(i ? r.rowGap : r.columnGap) * o, p = [], m = [], b = (e, t) => {
				let n = u.getComputedStyle(e), r = E(e, t);
				return {
					start: i ? t.top : t.left,
					size: i ? t.height : t.width,
					marginStart: M(i ? n.marginTop : n.marginLeft) * r,
					marginEnd: M(i ? n.marginBottom : n.marginRight) * r
				};
			};
			t.forEach((t, n) => {
				let r = t === c ? f : O(t.element);
				e.still || m.push(b(t.element, r)), t === c ? y = n : p.push({
					item: t,
					original: n,
					box: r
				});
			});
			let x = re(e.element).map((e) => {
				let t = _.get(e);
				return t || (t = {
					element: e,
					liftLeft: e.scrollLeft,
					liftTop: e.scrollTop
				}, _.set(e, t)), t;
			});
			v.push({
				registration: e,
				box: a,
				scale: o,
				gap: s,
				paddingStart: M(i ? r.paddingTop : r.paddingLeft) * o,
				scrollers: x,
				hitArea: e.hitArea ? {
					element: e.hitArea,
					scrollers: re(e.hitArea)
				} : null,
				slots: p,
				room: e.still ? 0 : (i ? f.height + h.vertical * g : f.width + h.horizontal * g) + s,
				marginStart: (i ? h.top : h.left) * g,
				isHome: n,
				flow: e.still ? null : te(r, a, o, i, m, n ? m[y] : b(c.element, f))
			});
		}
		let b = v.find((e) => e.isHome);
		if (!b) {
			K();
			return;
		}
		let x = l.createElement("div");
		x.setAttribute("data-drag-overlay", ""), Object.assign(x.style, {
			position: "fixed",
			inset: "0",
			pointerEvents: "none",
			zIndex: "2147483000",
			contain: "layout style"
		});
		for (let t of e.inheritProperties ?? []) x.style.setProperty(t, p.getPropertyValue(t));
		let S = b.registration.renderPreview?.(c.element) ?? e.renderPreview?.(c.element), C = S ? null : F(c.element), w = S ?? C.clone;
		for (let e of S ? m : []) w.style.setProperty(e, p.getPropertyValue(e));
		w.setAttribute("data-drag-preview", ""), w.setAttribute("aria-hidden", "true"), Object.assign(w.style, {
			position: "absolute",
			left: `${f.left}px`,
			top: `${f.top}px`,
			width: `${f.width / g}px`,
			height: `${f.height / g}px`,
			transformOrigin: "0 0",
			margin: "0",
			boxSizing: "border-box",
			translate: "none",
			transform: D(0, 0, g),
			transition: "none",
			willChange: "transform",
			pointerEvents: "none"
		}), x.appendChild(w), S || ie(w, c.element), e.onPreview?.(w, c.element), l.body.appendChild(x);
		for (let [e, t, n] of C?.scrolled ?? []) e.scrollLeft = t, e.scrollTop = n;
		let T = c.element;
		P = {
			item: c,
			mode: s,
			pointerId: r,
			startX: a,
			startY: o,
			lastX: a,
			lastY: o,
			liftBox: f,
			previewScale: g,
			sourceIndex: y,
			home: b,
			containers: v,
			windowLiftX: u.scrollX,
			windowLiftY: u.scrollY,
			overlay: x,
			preview: w,
			destination: {
				container: b,
				index: y
			},
			shifts: /* @__PURE__ */ new Map(),
			sourceVisibility: T.style.visibility,
			reserved: null,
			scrollFrame: null,
			scrollTime: null,
			scrollOwed: /* @__PURE__ */ new Map(),
			scrollArmed: /* @__PURE__ */ new Map(),
			impactFrame: null,
			dropping: !1,
			combine: null,
			lockAxis: b.registration.lockAxis ?? e.lockAxis
		}, T.style.visibility = "hidden", T.setAttribute("data-drag-source", ""), b.registration.element.setAttribute("data-drag-over", ""), l.documentElement.setAttribute("data-drag-active", c.type), e.onDragStart?.(Q(P));
		let ee = se(P);
		ee && W(n.lifted(ee));
	}
	function Te(e, t) {
		let n = P;
		if (!n) return;
		n.lastX = e, n.lastY = t;
		let r = n.lockAxis === "y" ? 0 : e - n.startX, i = n.lockAxis === "x" ? 0 : t - n.startY;
		n.preview.style.transform = D(r, i, n.previewScale), De(n), Be(n);
	}
	function J(e, t) {
		let n = e.overlay.ownerDocument.defaultView ?? window, r = n.scrollX - e.windowLiftX, i = n.scrollY - e.windowLiftY;
		for (let e of t.scrollers) r += e.element.scrollLeft - e.liftLeft, i += e.element.scrollTop - e.liftTop;
		return {
			x: r,
			y: i
		};
	}
	function Ee(e, t) {
		if (t.hitArea) return t.hitArea.scrollers.reduce((e, t) => k(e, O(t)), O(t.hitArea.element));
		let n = J(e, t), r = t.box, i = {
			...r,
			left: r.left - n.x,
			top: r.top - n.y
		};
		return t.scrollers.reduce((e, { element: t }) => k(e, O(t)), i);
	}
	function De(t) {
		let r = t.lastX, i = t.lastY, a = null, o = Infinity;
		if (e.stay?.({
			x: r,
			y: i
		})) {
			let n = Fe(t, null), r = t.destination;
			if (r?.container === t.home && r.index === t.sourceIndex) {
				n && e.onDragUpdate?.($(t));
				return;
			}
			t.destination = {
				container: t.home,
				index: t.sourceIndex
			}, Le(t, r?.container ?? null), t.overlay.ownerDocument.documentElement.toggleAttribute("data-drag-outside", !1), e.onDragUpdate?.($(t)), G(t);
			return;
		}
		for (let e of t.containers) {
			if (e.registration.isDropDisabled()) continue;
			let n = Ee(t, e);
			if (!A(n, r, i)) continue;
			let s = n.width * n.height;
			s < o && (a = e, o = s);
		}
		let s = a && t.mode === "FLUID" ? Pe(t, a) : null;
		if (s && a) {
			Fe(t, {
				container: a,
				slot: s
			}) && (e.onDragUpdate?.($(t)), W(n.combining(t.item.label(), s.item.label())));
			return;
		}
		let c = Fe(t, null), l = null;
		a && (l = {
			container: a,
			index: Ie(t, a)
		});
		let u = t.destination;
		u?.container === l?.container && u?.index === l?.index ? c && (e.onDragUpdate?.($(t)), G(t)) : (t.destination = l, Le(t, u?.container ?? null), t.overlay.ownerDocument.documentElement.toggleAttribute("data-drag-outside", !l), e.onDragUpdate?.($(t)), G(t));
	}
	function Oe(t, n) {
		let r = t.destination ?? {
			container: t.home,
			index: t.sourceIndex
		}, i = r.container.registration.axis === "vertical" ? n.y : n.x, a = null;
		if (i !== 0) {
			let e = r.index + i;
			e >= 0 && e <= r.container.slots.length && (a = {
				container: r.container,
				index: e
			});
		} else {
			let e = ke(t, r.container, n);
			e && (a = {
				container: e,
				index: Ae(t, e)
			});
		}
		if (!a) return;
		let o = t.destination?.container ?? null;
		t.destination = a, Le(t, o), je(t, !0), Me(t), e.onDragUpdate?.($(t)), G(t);
	}
	function ke(e, t, n) {
		let r = w(Ee(e, t)), i = null, a = Infinity;
		for (let o of e.containers) {
			if (o === t || o.registration.isDropDisabled()) continue;
			let s = w(Ee(e, o)), c = (s.x - r.x) * n.x + (s.y - r.y) * n.y;
			if (c <= 1) continue;
			let l = c + (Math.abs((s.x - r.x) * n.y) + Math.abs((s.y - r.y) * n.x)) * 2;
			l < a && (i = o, a = l);
		}
		return i;
	}
	function Ae(e, t) {
		let n = t.registration.axis === "vertical", r = J(e, t), i = ne(e.preview.style.transform), a = n ? e.liftBox.top + i.y + e.liftBox.height / 2 : e.liftBox.left + i.x + e.liftBox.width / 2;
		return t.slots.filter((i) => Y(e, t, i) - (n ? r.y : r.x) + (n ? i.box.height : i.box.width) / 2 < a).length;
	}
	function je(e, n) {
		let r = Ue(e), { duration: i, easing: a } = t.outOfTheWay;
		e.preview.style.transition = n && !R ? `transform ${i}ms ${a}` : "none", e.preview.style.transform = D(r.x, r.y, e.previewScale);
	}
	function Me(e) {
		let n = e.overlay.ownerDocument.defaultView;
		if (!n) return;
		let r = t.autoScrollEdge, i = (t) => {
			let n = Ue(e), i = e.liftBox.left + n.x, a = e.liftBox.top + n.y;
			return {
				x: Math.min(0, i - r - t.left) + Math.max(0, i + e.liftBox.width + r - t.left - t.width),
				y: Math.min(0, a - r - t.top) + Math.max(0, a + e.liftBox.height + r - t.top - t.height)
			};
		};
		for (let { element: t } of e.destination?.container.scrollers ?? []) {
			let e = i(O(t));
			(e.x || e.y) && t.scrollBy(e.x, e.y);
		}
		let a = i({
			left: 0,
			top: 0,
			width: n.innerWidth,
			height: n.innerHeight
		});
		(a.x || a.y) && n.scrollBy(a.x, a.y), je(e, !0);
	}
	function Ne(e, t) {
		let n = t.registration.axis === "vertical", r = n ? e.liftBox.top : e.liftBox.left, i = n ? e.liftBox.height : e.liftBox.width, a = n ? e.lockAxis === "x" ? 0 : e.lastY - e.startY : e.lockAxis === "y" ? 0 : e.lastX - e.startX;
		return {
			start: r + a,
			end: r + a + i
		};
	}
	function Pe(e, t) {
		let n = e.destination;
		if (!n || n.container !== t || !t.registration.isCombineEnabled()) return null;
		let r = t.registration.axis === "vertical", i = r ? J(e, t).y : J(e, t).x, a = Ne(e, t);
		return t.slots.find((o, s) => {
			let c = r ? o.box.height : o.box.width, l = s >= n.index, u = Y(e, t, o) - i + (l ? t.room : 0), d = c / 4, f = l ? a.end : a.start;
			return f > u + d && f < u + c - d;
		}) ?? null;
	}
	function Fe(e, t) {
		return e.combine?.slot !== t?.slot && (e.combine?.slot.item.element.removeAttribute("data-drag-combine"), t?.slot.item.element.setAttribute("data-drag-combine", ""), e.combine = t, !0);
	}
	function Ie(e, t) {
		let n = t.registration.axis === "vertical", r = J(e, t), { start: i, end: a } = Ne(e, t), o = n ? r.y : r.x, s = t.slots.map((r) => Y(e, t, r) - o + (n ? r.box.height : r.box.width) / 2), c = s.length;
		if (e.destination?.container !== t) {
			let e = (i + a) / 2;
			return s.filter((t) => t < e).length;
		}
		let l = e.destination.index;
		for (; l > 0 && i < s[l - 1];) l--;
		if (l !== e.destination.index) return l;
		for (; l < c && a > s[l] + t.room;) l++;
		return l;
	}
	function Y(e, t, n) {
		let r = t.registration.axis === "vertical" ? n.box.top : n.box.left;
		return t.isHome && n.original > e.sourceIndex ? r - t.room : r;
	}
	function Le(e, t) {
		let n = e.destination, r = /* @__PURE__ */ new Set([e.home]);
		t && r.add(t), n && r.add(n.container);
		for (let t of r) {
			let r = Re(e, t);
			t.slots.forEach((i, a) => {
				let o = 0;
				r ? o = r.shifts[a] : (t.isHome && i.original > e.sourceIndex && (o -= t.room), n?.container === t && a >= n.index && (o += t.room)), ze(e, i.item.element, o, t);
			});
		}
		let i = n && !n.container.isHome ? n.container : null;
		e.reserved !== i && (e.reserved?.registration.element.style.removeProperty("--drag-reserve"), e.reserved?.registration.element.removeAttribute("data-drag-over"), i && !i.registration.still && i.registration.element.style.setProperty("--drag-reserve", `${i.room}px`), e.reserved = i);
		for (let t of e.containers) n?.container === t ? t.registration.element.setAttribute("data-drag-over", "") : t.registration.element.removeAttribute("data-drag-over");
	}
	function Re(e, t) {
		let n = t.flow;
		if (!n) return null;
		let r = t.slots.map((e) => n.items[e.original]), i = e.destination?.container === t ? e.destination.index : -1;
		i >= 0 && r.splice(i, 0, n.source);
		let o = a(r, n.flow, n.origin);
		return {
			shifts: t.slots.map((e, t) => o[i >= 0 && t >= i ? t + 1 : t] - n.items[e.original].start),
			source: i >= 0 ? o[i] : null
		};
	}
	function ze(n, r, i, a) {
		let o = a.registration.axis, s = i / a.scale, c = n.shifts.get(r), l = c?.value ?? 0;
		if (Math.abs(l - s) < .01) return;
		if (c) c.value = s;
		else {
			n.shifts.set(r, {
				value: s,
				scale: a.scale,
				translate: r.style.translate,
				transition: r.style.transition
			});
			let { duration: e, easing: i } = t.outOfTheWay;
			r.style.transition = R ? "none" : `translate ${e}ms ${i}`;
		}
		let u = (s - l) * a.scale;
		e.onMovement?.({
			element: r,
			phase: "drag",
			x: o === "vertical" ? 0 : u,
			y: o === "vertical" ? u : 0
		}), r.style.translate = s === 0 ? "none" : o === "vertical" ? `0 ${s}px` : `${s}px 0`, r.style.setProperty("--drag-shift", `${s}px`);
	}
	function Be(e) {
		if (e.scrollFrame !== null) return;
		let t = e.overlay.ownerDocument.defaultView;
		if (!t) return;
		let n = (r) => {
			if (P !== e || e.dropping) return;
			e.scrollFrame = null;
			let i = e.scrollTime === null ? f : r - e.scrollTime;
			e.scrollTime = r, Ve(e, Math.min(2, Math.max(.25, i / f))) ? (De(e), e.scrollFrame = t.requestAnimationFrame(n)) : e.scrollTime = null;
		};
		e.scrollFrame = t.requestAnimationFrame(n);
	}
	function Ve(e, t) {
		let n = e.overlay.ownerDocument.defaultView;
		if (!n) return !1;
		let r = !1, i = !1, a = !1, o = (n, o, s, c) => {
			let l = r ? 0 : o.x, u = i ? 0 : o.y, d = e.scrollOwed.get(n) ?? {
				x: 0,
				y: 0
			};
			if (e.scrollOwed.set(n, d), d.x = l ? d.x + l * t : 0, d.y = u ? d.y + u * t : 0, !l && !u) return;
			let f = Math.trunc(d.x), p = Math.trunc(d.y);
			d.x -= f, d.y -= p;
			let m = c();
			(f || p) && s(f, p);
			let h = c(), g = f ? h.x !== m.x : !!l, _ = p ? h.y !== m.y : !!u;
			r ||= g, i ||= _, a ||= g || _;
		}, s = e.destination?.container.scrollers ?? e.home.scrollers;
		for (let { element: t } of s) {
			let n = O(t);
			if (A(n, e.lastX, e.lastY) && (o(t, He(e, t, n), (e, n) => t.scrollBy(e, n), () => ({
				x: t.scrollLeft,
				y: t.scrollTop
			})), r && i)) return !0;
		}
		return o(n, He(e, n, {
			left: 0,
			top: 0,
			width: n.innerWidth,
			height: n.innerHeight
		}), (e, t) => n.scrollBy(e, t), () => ({
			x: n.scrollX,
			y: n.scrollY
		})), a;
	}
	function He(e, n, r) {
		let i = e.scrollArmed.get(n) ?? {
			left: !1,
			right: !1,
			top: !1,
			bottom: !1
		};
		e.scrollArmed.set(n, i);
		let a = (e, n, r, a, o, s) => {
			let c = Math.min(t.autoScrollEdge, a / 5);
			if (c <= 0) return 0;
			let l = e - r, u = r + a - e;
			return (l >= c || e <= n - p) && (i[o] = !0), (u >= c || e >= n + p) && (i[s] = !0), l < c ? i[o] ? -24 * ((c - Math.max(l, 0)) / c) ** 2 : 0 : u < c && i[s] ? d * ((c - Math.max(u, 0)) / c) ** 2 : 0;
		};
		return {
			x: a(e.lastX, e.startX, r.left, r.width, "left", "right"),
			y: a(e.lastY, e.startY, r.top, r.height, "top", "bottom")
		};
	}
	async function X(n) {
		let r = P;
		if (!r || r.dropping) return;
		r.dropping = !0;
		let i = r.overlay.ownerDocument.defaultView ?? window;
		if (r.scrollFrame !== null && i.cancelAnimationFrame(r.scrollFrame), r.impactFrame !== null && i.cancelAnimationFrame(r.impactFrame), n === "DROP" && r.combine) {
			let { container: e, slot: i } = r.combine, a = {
				...Q(r),
				destination: null,
				combine: Ze(r),
				reason: n
			}, o = e.registration.axis === "vertical", s = J(r, e), c = e.slots.indexOf(i), l = Y(r, e, i) + (r.destination && c >= r.destination.index ? e.room : 0), u = (o ? i.box.left : l) - s.x - r.liftBox.left, d = (o ? l : i.box.top) - s.y - r.liftBox.top, { maxDuration: f, easing: p } = t.drop;
			if (R) {
				Z(r, a);
				return;
			}
			r.preview.style.transition = `transform ${f}ms ${p}, opacity ${f}ms ${p}`, r.preview.style.transform = D(u, d, r.previewScale * .75), r.preview.style.opacity = "0";
			let m = !1, h = () => {
				m || (m = !0, Z(r, a));
			};
			r.land = h, r.preview.addEventListener("transitionend", h, { once: !0 }), setTimeout(h, f + 50);
			return;
		}
		if (Fe(r, null), n === "CANCEL" && r.mode === "FLUID" && Se(i, r.pointerId), n === "DROP" && !r.destination && r.mode === "FLUID" && e.onDropOutside?.(Q(r), {
			x: r.lastX,
			y: r.lastY
		})) {
			Z(r, {
				...Q(r),
				destination: null,
				combine: null,
				reason: "DROP"
			});
			return;
		}
		let a = n === "CANCEL" || !r.destination;
		if (a) {
			let e = r.destination?.container ?? null;
			r.destination = {
				container: r.home,
				index: r.sourceIndex
			}, Le(r, e);
		}
		let o = null, s = null, c = (e, n, a) => {
			let s = /* @__PURE__ */ new Map();
			r.committed = {
				boxes: /* @__PURE__ */ new Map(),
				scrollX: i.scrollX,
				scrollY: i.scrollY
			};
			for (let t of e) {
				if (!t.isConnected || t === o) continue;
				let e = n.get(t), i = t.getBoundingClientRect();
				qe(t, a.get(t), i), s.set(t, {
					x: e.left - i.left,
					y: e.top - i.top
				}), r.committed.boxes.set(t, {
					left: i.left,
					top: i.top,
					width: i.width,
					height: i.height
				});
			}
			for (let [e, n] of R ? [] : s) {
				let r = e.parentElement;
				for (; r && !s.has(r);) r = r.parentElement;
				let i = r ? s.get(r) : {
					x: 0,
					y: 0
				}, a = n.x - i.x, o = n.y - i.y;
				if (Math.abs(a) < .01 && Math.abs(o) < .01) continue;
				let c = e.animate([{ translate: `${a}px ${o}px` }, { translate: (e.ownerDocument.defaultView ?? window).getComputedStyle(e).translate }], {
					duration: t.outOfTheWay.duration,
					easing: t.outOfTheWay.easing
				});
				c && (z.add(c), c.addEventListener?.("finish", () => z.delete(c)), c.addEventListener?.("cancel", () => z.delete(c)));
			}
		};
		if (n === "DROP" && e.prepareDrop) {
			r.preparing = !0;
			let t = Ge(r), l = new Map(t.map((e) => [e, e.getBoundingClientRect()])), u = Ke(r, t);
			for (let [e, t] of r.shifts) e.style.transition = "none", e.style.translate = t.translate;
			r.reserved?.registration.element.style.removeProperty("--drag-reserve");
			try {
				let i = e.prepareDrop({
					...Q(r),
					destination: a ? null : $e(r.destination),
					combine: null,
					reason: n
				}), d = b(i) ? await i : i, f = typeof d == "function" ? d : () => d;
				if (o = f(), P !== r || (o?.isConnected && (r.landing = {
					element: o,
					visibility: o.style.visibility
				}, o.style.visibility = "hidden"), s = o?.isConnected ? O(o) : null, c(t, l, u), await new Promise((e) => (r.overlay.ownerDocument.defaultView ?? window).requestAnimationFrame(() => e())), P !== r)) return;
				let p = f();
				p !== o && (r.landing && (r.landing.element.style.visibility = r.landing.visibility), o = p, o?.isConnected && (r.landing = {
					element: o,
					visibility: o.style.visibility
				}, o.style.visibility = "hidden"), s = o?.isConnected ? j(o, r.shifts) : null);
			} catch (e) {
				P === r && Z(r, {
					...Q(r),
					destination: null,
					combine: null,
					reason: "CANCEL"
				}), y(i, e);
				return;
			}
		}
		let l = s ? {
			x: s.left - r.liftBox.left,
			y: s.top - r.liftBox.top
		} : Ue(r), d = ne(r.preview.style.transform), f = Math.hypot(l.x - d.x, l.y - d.y), { minDuration: p, maxDuration: m, easing: h } = t.drop, g = !a && !!r.destination?.container.registration.still, _ = f < .5 || R || g ? 0 : p + (m - p) * Math.min(f / u, 1), v = {
			...Q(r),
			destination: a || !r.destination ? null : $e(r.destination),
			combine: null,
			reason: n
		};
		if (_ === 0) {
			Z(r, v);
			return;
		}
		r.preview.style.transition = `transform ${_}ms ${h}`, r.preview.style.transform = D(l.x, l.y, r.previewScale);
		let x = !1, S = () => {
			x || (x = !0, Z(r, v));
		};
		r.land = S, r.preview.addEventListener("transitionend", S, { once: !0 }), setTimeout(S, _ + 50);
	}
	function Ue(e) {
		let t = e.destination ?? {
			container: e.home,
			index: e.sourceIndex
		}, n = t.container, r = n.registration.axis === "vertical", i = J(e, n), a = n.slots, o, s = n.registration.still, c = s ? We(n, t.index) : void 0, l = s ? null : Re(e, n)?.source ?? null;
		if (n.isHome && t.index === e.sourceIndex) o = r ? e.liftBox.top : e.liftBox.left;
		else if (l !== null) o = l;
		else if (c) o = r ? c.box.top : c.box.left;
		else if (s && a.length > 0) {
			let e = a[a.length - 1];
			o = (r ? e.box.top + e.box.height : e.box.left + e.box.width) + n.gap;
		} else if (t.index < a.length) o = Y(e, n, a[t.index]);
		else if (a.length > 0) {
			let t = a[a.length - 1], i = r ? e.liftBox.height : e.liftBox.width;
			o = Y(e, n, t) + (r ? t.box.height : t.box.width) + n.room - i;
		} else o = (r ? n.box.top : n.box.left) + n.paddingStart + n.marginStart;
		let u = r ? e.liftBox.left - e.home.box.left : e.liftBox.top - e.home.box.top, d = n.isHome ? r ? e.liftBox.left : e.liftBox.top : (r ? n.box.left : n.box.top) + u, f = o - (r ? i.y : i.x), p = d - (r ? i.x : i.y);
		return {
			x: (r ? p : f) - e.liftBox.left,
			y: (r ? f : p) - e.liftBox.top
		};
	}
	function We(e, t) {
		return e.isHome ? e.slots.find((e) => e.original === t) : e.slots[t];
	}
	function Z(t, r) {
		let i = se(t), a = e.onMovement && !t.preparing ? Ge(t) : [], s = Ke(t, a);
		try {
			e.onDragEnd?.(r);
		} finally {
			Je(t);
		}
		let c = t.overlay.ownerDocument.defaultView ?? window;
		a.length && c.requestAnimationFrame(() => {
			for (let e of a) e.isConnected && qe(e, s.get(e), e.getBoundingClientRect());
		});
		let l = e.onMovement ? t.committed : void 0;
		if (l && c.requestAnimationFrame(() => {
			let e = c.scrollX - l.scrollX, n = c.scrollY - l.scrollY;
			for (let [r, i] of l.boxes) {
				if (!r.isConnected) continue;
				let a = j(r, t.shifts);
				qe(r, i, {
					...a,
					left: a.left + e,
					top: a.top + n
				});
			}
		}), r.combine && t.combine ? W(n.combined(t.item.label(), t.combine.slot.item.label())) : i && W(r.reason === "DROP" && r.destination ? n.dropped(i) : n.returned(i)), t.mode === "SNAP") {
			for (let e of o.values()) if (e.id === t.item.id && e.element.isConnected) {
				e.handle.focus({ preventScroll: !0 });
				break;
			}
		}
	}
	function Ge(e) {
		return [...new Set(e.containers.flatMap((e) => e.slots.map((e) => e.item.element)))].filter((e) => e.isConnected);
	}
	function Ke(e, t) {
		return new Map(t.map((t) => [t, j(t, e.shifts)]));
	}
	function qe(t, n, r) {
		let i = r.left - n.left, a = r.top - n.top;
		(Math.abs(i) > 1 || Math.abs(a) > 1) && e.onMovement?.({
			element: t,
			phase: "drop",
			x: i,
			y: a
		});
	}
	function Je(e) {
		let t = e.item.element, n = e.overlay.ownerDocument.defaultView ?? window;
		for (let [t, n] of e.shifts) t.style.transition = "none", t.style.translate = n.translate, t.style.removeProperty("--drag-shift");
		let r = [...e.shifts];
		n.requestAnimationFrame(() => {
			n.requestAnimationFrame(() => {
				for (let [e, t] of r) e.style.transition = t.transition;
			});
		}), e.landing && (e.landing.element.style.visibility = e.landing.visibility), t.style.visibility = e.sourceVisibility, t.removeAttribute("data-drag-source"), e.combine?.slot.item.element.removeAttribute("data-drag-combine"), e.reserved?.registration.element.style.removeProperty("--drag-reserve");
		for (let t of e.containers) t.registration.element.removeAttribute("data-drag-over");
		e.overlay.remove(), t.ownerDocument.documentElement.removeAttribute("data-drag-active"), t.ownerDocument.documentElement.removeAttribute("data-drag-outside"), P = null, K();
	}
	function Ye(e) {
		let t = e.element.parentElement;
		for (; t;) {
			let n = i.get(t);
			if (n && n.type === e.type) return n;
			t = t.parentElement;
		}
		return null;
	}
	function Xe(e) {
		let t = [];
		for (let n of o.values()) n.type === e.type && n.element.isConnected && Ye(n) === e && t.push(n);
		return t.sort((e, t) => e.element.compareDocumentPosition(t.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
	}
	function Q(e) {
		return {
			draggableId: e.item.id,
			type: e.item.type,
			source: {
				droppableId: e.home.registration.id,
				index: e.sourceIndex
			},
			mode: e.mode
		};
	}
	function $(e) {
		return {
			...Q(e),
			destination: e.destination && !e.combine ? $e(e.destination) : null,
			combine: Ze(e)
		};
	}
	function Ze(e) {
		return e.combine ? {
			draggableId: e.combine.slot.item.id,
			droppableId: e.combine.container.registration.id
		} : null;
	}
	function Qe(e) {
		if (e.element.isConnected && o.get(e.element) === e) return e;
		for (let t of o.values()) if (t.id === e.id && t.type === e.type && t.element.isConnected) return t;
		return null;
	}
	function $e(e) {
		return {
			droppableId: e.container.registration.id,
			index: e.index
		};
	}
	return {
		container: V,
		item: H,
		isDragging: () => P !== null,
		cancel: () => {
			q(), P && !P.dropping && X("CANCEL");
		},
		destroy: () => {
			ae = !0, q(), B?.(), P && !P.preparing && Je(P);
			for (let { view: e, instructions: t, liveRegion: n } of I.values()) e.removeEventListener("pointerdown", ue, !0), e.removeEventListener("keydown", ce, !0), t.remove(), n.remove();
			I.clear(), i.clear(), o.clear(), v.clear();
		}
	};
}
function y(e, t) {
	let n = e.reportError;
	typeof n == "function" ? n.call(e, t) : setTimeout(() => {
		throw t;
	});
}
function b(e) {
	return !!e && typeof e.then == "function";
}
function x(e) {
	return e && e.nodeType === 1 ? e : null;
}
var S = 0, C = {
	ArrowUp: {
		x: 0,
		y: -1
	},
	ArrowDown: {
		x: 0,
		y: 1
	},
	ArrowLeft: {
		x: -1,
		y: 0
	},
	ArrowRight: {
		x: 1,
		y: 0
	}
};
function w(e) {
	return {
		x: e.left + e.width / 2,
		y: e.top + e.height / 2
	};
}
function T(e, t) {
	let n = e.createElement("div");
	return n.id = t, Object.assign(n.style, {
		position: "absolute",
		width: "1px",
		height: "1px",
		margin: "-1px",
		padding: "0",
		overflow: "hidden",
		clip: "rect(0 0 0 0)",
		whiteSpace: "nowrap",
		border: "0"
	}), e.body.appendChild(n), n;
}
function ee(e, t) {
	let n = e.getAttribute("aria-label") ?? t.getAttribute("aria-label") ?? e.textContent?.replace(/\s+/g, " ").trim() ?? "";
	return n.length > 60 ? `${n.slice(0, 59)}…` : n || "Item";
}
function E(e, t) {
	if (e.offsetWidth <= 0 || t.width <= 0) return 1;
	let n = t.width / e.offsetWidth;
	return Math.abs(n - 1) < .02 ? 1 : n;
}
function D(e, t, n) {
	return `translate3d(${e}px, ${t}px, 0)${n === 1 ? "" : ` scale(${n})`}`;
}
function O(e) {
	let t = e.getBoundingClientRect();
	return {
		left: t.left,
		top: t.top,
		width: t.width,
		height: t.height
	};
}
function k(e, t) {
	let n = Math.max(e.left, t.left), r = Math.max(e.top, t.top), i = Math.min(e.left + e.width, t.left + t.width), a = Math.min(e.top + e.height, t.top + t.height);
	return {
		left: n,
		top: r,
		width: Math.max(0, i - n),
		height: Math.max(0, a - r)
	};
}
function A(e, t, n) {
	return t >= e.left && t < e.left + e.width && n >= e.top && n < e.top + e.height;
}
function te(e, t, n, r, i, a) {
	let s = r && /^(block|flow-root|list-item)$/.test(e.display), c = s ? 0 : M(r ? e.rowGap : e.columnGap) * n, l = (r ? t.top : t.left) + (M(r ? e.borderTopWidth : e.borderLeftWidth) + M(r ? e.paddingTop : e.paddingLeft)) * n, u = i[0], d = {
		gap: c,
		collapse: s,
		through: s && !!u && u.marginStart > .5 && Math.abs(u.start - l) <= 1
	};
	return o(i, d, l) ? {
		items: i,
		source: a,
		flow: d,
		origin: l
	} : null;
}
function j(e, t) {
	let n = O(e), r = e.ownerDocument.defaultView ?? window, i = (e) => {
		if (!e || e === "none") return {
			x: 0,
			y: 0
		};
		let [t = "0", n = "0"] = e.trim().split(/\s+/);
		return {
			x: M(t),
			y: M(n)
		};
	}, a = n.left, o = n.top;
	for (let n = e; n; n = n.parentElement) {
		let e = n.style.translate, s = r.getComputedStyle(n).translate;
		if (e === s || !e && s === "none") continue;
		let c = i(e), l = i(s), u = t.get(n)?.scale ?? 1;
		a += (c.x - l.x) * u, o += (c.y - l.y) * u;
	}
	return {
		...n,
		left: a,
		top: o
	};
}
function M(e) {
	let t = Number.parseFloat(e);
	return Number.isFinite(t) ? t : 0;
}
function ne(e) {
	let t = /translate3d\(\s*(-?[\d.]+)px,\s*(-?[\d.]+)px/.exec(e);
	return t ? {
		x: Number(t[1]),
		y: Number(t[2])
	} : {
		x: 0,
		y: 0
	};
}
function re(e) {
	let t = [], n = e.ownerDocument.defaultView, r = e.parentElement;
	for (; r && r !== e.ownerDocument.body && r !== e.ownerDocument.documentElement;) {
		let e = n?.getComputedStyle(r), i = (e) => e === "auto" || e === "scroll" || e === "overlay";
		e && (i(e.overflowY) || i(e.overflowX)) && t.push(r), r = r.parentElement;
	}
	return t;
}
function N(e) {
	return (!e.backgroundImage || e.backgroundImage === "none") && /^(transparent|rgba\([^)]*,\s*0\)|)$/.test(e.backgroundColor.trim());
}
function ie(e, t) {
	let n = t.ownerDocument.defaultView;
	if (n && N(n.getComputedStyle(t))) for (let r = t.parentElement; r; r = r.parentElement ?? r.getRootNode().host ?? null) {
		let t = n.getComputedStyle(r);
		if (t.backgroundColor && !N(t)) {
			e.style.setProperty("background-color", t.backgroundColor, "important");
			return;
		}
	}
}
var P = /^(style|script|template|link|meta|title|head)$/;
function F(e) {
	let t = e.cloneNode(!0), n = e.ownerDocument.defaultView, r = [], i = n.getComputedStyle(e), a = Array.from(i).filter((e) => !e.startsWith("--")), o = a.length > 100 ? a : null, s = /* @__PURE__ */ new Map(), c = (e, t) => {
		try {
			t.getContext("2d")?.drawImage(e, 0, 0);
		} catch {}
	}, l = (e, t) => {
		let r = n.getComputedStyle(e, t).content;
		return !!r && r !== "none" && r !== "normal";
	}, u = (t, i, a = !1) => {
		let u = i;
		if (a) (t.scrollLeft || t.scrollTop) && r.push([
			i,
			t.scrollLeft,
			t.scrollTop
		]), t.localName === "canvas" && c(t, i);
		else if (u.style && !P.test(t.localName)) {
			let a = t.constructor.elementProperties;
			if (a instanceof Map) for (let e of a.keys()) i[e] = t[e];
			let d = n.getComputedStyle(t);
			if (t !== e && d.display === "none") {
				u.style.setProperty("display", "none", "important");
				return;
			}
			if (!o || t === e) for (let e of Array.from(d)) {
				let t = d.getPropertyValue(e);
				e.startsWith("--") && s.set(e, t), u.style.setProperty(e, t, "important");
			}
			else {
				for (let e of o) u.style.setProperty(e, d.getPropertyValue(e), "important");
				if (t.localName.includes("-") || t.shadowRoot || l(t, "::before") || l(t, "::after")) for (let e = 0; e < d.length; e++) {
					let t = d[e];
					if (!t.startsWith("--")) continue;
					let n = d.getPropertyValue(t);
					s.get(t) !== n && u.style.setProperty(t, n, "important");
				}
			}
			u.style.setProperty("pointer-events", "none", "important"), i.removeAttribute("contenteditable"), (t.scrollLeft || t.scrollTop) && r.push([
				i,
				t.scrollLeft,
				t.scrollTop
			]), t.localName === "canvas" && c(t, i);
		}
		let f = t.shadowRoot;
		if (f && !i.shadowRoot && !n.customElements?.get(t.localName)) try {
			let e = i.attachShadow({ mode: "open" });
			for (let t of Array.from(f.childNodes)) e.appendChild(t.cloneNode(!0));
			f.adoptedStyleSheets?.length && (e.adoptedStyleSheets = [...f.adoptedStyleSheets]), d(f, e, !0);
		} catch {}
		d(t, i, a);
	}, d = (e, t, n) => {
		let r = e.children, i = t.children;
		for (let e = 0; e < r.length && e < i.length; e++) u(r[e], i[e], n);
	};
	u(e, t);
	for (let e of [
		"inset",
		"inset-block",
		"inset-inline",
		"inset-block-start",
		"inset-block-end",
		"inset-inline-start",
		"inset-inline-end",
		"top",
		"right",
		"bottom",
		"left",
		"margin-block",
		"margin-inline",
		"margin-block-start",
		"margin-block-end",
		"margin-inline-start",
		"margin-inline-end"
	]) t.style.removeProperty(e);
	t.removeAttribute("id"), t.removeAttribute("data-drag-source"), t.style.visibility = "visible";
	for (let e of t.querySelectorAll("[id]")) e.removeAttribute("id");
	for (let e of t.querySelectorAll("[data-drag-handle]")) e.removeAttribute("data-drag-handle");
	return t.removeAttribute("data-drag-handle"), {
		clone: t,
		scrolled: r
	};
}
//#endregion
//#region src/drag.ts
var I = 400, L = 400, ae = 8, R = "button, input, textarea, select, video, audio, .aa-caption, [data-aa-interactive]", z = (e, t) => {
	let n = e?.closest(R);
	return !!n && t.contains(n);
}, oe = [
	"--aa-unit",
	"--aa-sf",
	"--aa-rule-color",
	"--aa-gap",
	"--aa-indent"
];
function B(i, a, o) {
	let s = new AbortController(), { signal: c } = s, l = i.element, u = l.ownerDocument, d = u.defaultView, f = u.createElement("div");
	f.className = "aa-drop-line", f.hidden = !0, o.append(f);
	let p = u.createElement("div");
	p.className = "aa-drop-line aa-drop-side", p.hidden = !0, o.append(p);
	let m = () => {
		let e = u.querySelector("[data-drag-overlay]");
		if (!e) return;
		let t = getComputedStyle(l).getPropertyValue("--ds-accent-color");
		for (let n of [f, p]) t && n.style.setProperty("--ds-accent-color", t), e.append(n);
	}, h = () => {
		f.parentElement !== o && o.append(f), p.parentElement !== o && o.append(p);
	}, g = (e, t, n, r = "") => {
		Object.assign(p.style, {
			left: `${e}px`,
			top: `${t}px`,
			height: `${n}px`,
			width: r
		}), p.hidden = !1;
	}, _ = null, y = null, b = () => Array.from(l.children), x = () => !i.readOnly && a.menus !== !1 && (i.reordering || i.placing), S = () => x() && i.placing;
	l.toggleAttribute("data-movable", x());
	let C = null, w = null, T = (e, t) => {
		let n = d.getSelection();
		return !n?.rangeCount || n.isCollapsed ? !1 : Array.from(n.getRangeAt(0).getClientRects()).some((n) => e >= n.left && e <= n.right && t >= n.top && t <= n.bottom);
	}, ee = (e, t) => {
		let n = r(u, e, t), i = (n?.node.nodeType === 1 ? n.node : n?.node.parentElement)?.closest(".aa-block");
		n && i && i.parentElement === l && (i.focus({ preventScroll: !0 }), d.getSelection()?.collapse(n.node, n.offset));
	}, E = () => {
		w && d.getSelection()?.rangeCount && d.getSelection().removeAllRanges();
	}, D = [], O = {
		x: 0,
		y: 0
	}, k = !1, A = v({
		inheritProperties: oe,
		stay: (e) => ne(e),
		onPreview: (e) => {
			for (let t of [e, ...e.querySelectorAll("[data-aa-selection],[data-selected],[data-ghost]")]) t.removeAttribute("data-aa-selection"), t.removeAttribute("data-selected"), t.removeAttribute("data-ghost");
		},
		onDragStart: (e) => {
			let t = b()[e.source.index], n = C?.selected ?? [], r = t && n.includes(t) ? n : [];
			D = b().map((e) => e.getBoundingClientRect()), O = {
				x: d.scrollX,
				y: d.scrollY
			}, w = {
				caret: r.length ? null : i.selection(),
				group: r,
				from: e.source.index
			};
			for (let e of r) e !== t && e.setAttribute("data-ghost", "");
			l.setAttribute("data-dragging", ""), m(), u.addEventListener("selectionchange", E, { signal: c }), E();
		},
		prepareDrop: (e) => {
			k = !0;
			let t = b()[e.source.index], n = t?.textContent, r = t?.querySelector(":scope > .aa-atom")?.dataset.source, i = l;
			for (let e = l.parentElement; e; e = e.parentElement) e.classList.contains("aa") && (i = e);
			let a = new Set(i.querySelectorAll(".aa-block")), o = y && { ...y }, s = _ && { ..._ }, c = l.parentElement?.classList.contains("aa-columns") ? l.parentElement : null, u = c ? Array.from(i.querySelectorAll(".aa-columns")).indexOf(c) : -1, d = e.source.index, f = s ? s.index - +(d < s.index) : -1;
			return M(e), () => {
				if (o) {
					let e = c?.isConnected ? c : i.querySelectorAll(".aa-columns")[u], t = "swap" in o ? o.swap : o.slot, n = (e?.querySelectorAll(":scope > .aa-column")[t])?.querySelector(":scope > .aa-block");
					if (n) return n;
				}
				if (s) {
					let e = (l.isConnected ? l : i).querySelectorAll(":scope > .aa-block")[f]?.querySelectorAll(":scope > .aa-atom.aa-columns > .aa-column"), t = (e?.[s.at === "start" ? 0 : e.length - 1])?.querySelector(":scope > .aa-block");
					if (t) return t;
				}
				if (t?.isConnected && i.contains(t)) return t;
				let e = Array.from(i.querySelectorAll(".aa-block")).filter((e) => r === void 0 ? !e.querySelector(".aa-block") && e.textContent === n : e.querySelector(":scope > .aa-atom")?.dataset.source === r);
				return e.find((e) => !a.has(e)) ?? e[0] ?? null;
			};
		},
		onDragEnd: (e) => {
			k || M(e), k = !1;
		}
	}), te = (e) => {
		let t = l.parentElement;
		if (!l.classList.contains("aa-column") || !t?.classList.contains("aa-columns") || !S()) return !1;
		let n = t.getBoundingClientRect();
		return e.y < n.top || e.y > n.bottom ? !1 : Array.from(t.children).some((t) => {
			if (t === l || !t.classList.contains("aa-column")) return !1;
			let n = t.getBoundingClientRect();
			return e.x >= n.left && e.x <= n.right;
		});
	}, j = () => l.dispatchEvent(new CustomEvent("aa-moved"));
	function M(e) {
		let { caret: t, group: n } = w ?? {
			caret: null,
			group: []
		};
		w = null, D = [];
		let r = _, a = y;
		_ = null, y = null, p.hidden = !0, p.removeAttribute("data-swap"), h();
		for (let e of l.querySelectorAll(":scope > [data-ghost]")) e.removeAttribute("data-ghost");
		l.removeAttribute("data-dragging"), u.removeEventListener("selectionchange", E);
		let o = b(), s = e.source.index, c = e.destination?.index;
		if (!(e.reason === "DROP" && r && n.length <= 1 && S() && ie(s, r.index, r.at))) {
			if (e.reason === "DROP" && a && n.length <= 1 && S()) l.dispatchEvent(new CustomEvent("aa-column-carry", {
				bubbles: !0,
				detail: {
					from: s,
					...a
				}
			}));
			else {
				if (e.reason === "DROP" && c !== void 0 && x() && i.reordering) {
					if (n.length > 1) {
						let e = o.indexOf(n[0]), t = n.length, r = o.filter((e, t) => t !== s).slice(0, c).filter((e) => !n.includes(e)).length;
						r === e ? i.selectBlocks(e, e + t - 1) : i.moveBlock(e, r, t), j();
						return;
					}
					if (c !== s) {
						i.moveBlock(s, c), j();
						return;
					}
				}
				t ? i.selectRange(t.start, t.end) : n.length && (i.selectBlocks(o.indexOf(n[0]), o.indexOf(n[n.length - 1])), j());
			}
		}
	}
	A.container({
		element: l,
		id: "aa",
		type: "aa-block",
		isDropDisabled: () => !x()
	});
	function ne(e) {
		if (!w || w.group.length > 1 || !S()) return _ = null, y = null, p.hidden = !0, !1;
		if (re(e)) return !0;
		let t = parseFloat(getComputedStyle(l).getPropertyValue("--aa-unit")) || 20, r = d.scrollX - O.x, i = d.scrollY - O.y, a = e.x + r, o = e.y + i, s = n(D, w.from, {
			x: a,
			y: o
		}, t), c = s?.index ?? -1, u = s?.at, f = s?.rect, m = f ? new DOMRect(f.left - r, f.top - i, f.width, f.height) : null;
		return !u || !m ? (_ = null, p.hidden = !0, !1) : (p.removeAttribute("data-swap"), _ = {
			index: c,
			at: u
		}, g(u === "start" ? m.left : m.right, m.top, m.height), !0);
	}
	function re(e) {
		y = null;
		let t = l.parentElement;
		if (!l.classList.contains("aa-column") || !t?.classList.contains("aa-columns")) return !1;
		let n = parseFloat(getComputedStyle(l).getPropertyValue("--aa-unit")) || 20, r = t.getBoundingClientRect();
		if (e.y < r.top - n || e.y > r.bottom + n) return !1;
		let i = l.getBoundingClientRect();
		if (e.x >= i.left && e.x <= i.right) return !1;
		let a = Array.from(t.children).filter((e) => e.classList.contains("aa-column")), o = a.indexOf(l), s = l.querySelectorAll(":scope > .aa-block").length <= 1, c = s ? a.filter((e) => e !== l) : a;
		p.removeAttribute("data-swap");
		let u = s ? a.findIndex((t) => {
			let n = t.getBoundingClientRect();
			return t !== l && e.x >= n.left && e.x <= n.right;
		}) : -1;
		if (u >= 0) {
			let e = (a[u].querySelector(":scope > .aa-block") ?? a[u]).getBoundingClientRect();
			return y = { swap: u }, _ = null, p.setAttribute("data-swap", ""), g(e.left, e.top, e.height, `${e.width}px`), !0;
		}
		let d = c.map((e) => e.getBoundingClientRect()), f = d.filter((t) => t.left + t.width / 2 < e.x).length;
		if (p.hidden = !0, s && f === o) return !0;
		y = { slot: f };
		let m = d.length > 1 ? d[1].left - d[0].right : 2 * n, h = f === 0 ? d[0].left - m / 2 : f === d.length ? d[d.length - 1].right + m / 2 : (d[f - 1].right + d[f].left) / 2;
		return _ = null, g(h, r.top, r.height), !0;
	}
	function N(e) {
		let n = t(i.value)[b().indexOf(e)];
		return !!n && /^(?:!\[[^\]\n]*\]\([^)\n]*\)\s*)+$/.test(n.source.trim());
	}
	function ie(n, r, a) {
		if (t(i.value).length !== b().length) return !1;
		let o = e(i.value, n, r, a);
		return o ? (i.replace(o.start, o.end, o.text), !0) : !1;
	}
	d.addEventListener("pointerdown", (e) => {
		let t = e.target?.nodeType === 1 ? e.target : null, n = t?.closest?.(".aa-block"), r = !!n && H === n;
		if (U(), !n || n.parentElement !== l) {
			C = null;
			return;
		}
		I();
		let i = b().filter((e) => e.hasAttribute("data-selected")), a = i.includes(n) ? i : [];
		C = {
			block: n,
			mouse: e.pointerType === "mouse" && e.button === 0,
			plain: !e.shiftKey && !e.altKey && !e.metaKey && !e.ctrlKey,
			own: z(t, n),
			inSelection: T(e.clientX, e.clientY),
			selected: a,
			grabbed: r,
			x: e.clientX,
			y: e.clientY
		}, (a.length || r || N(n)) && C.mouse && C.plain && !C.own && !C.inSelection && x() && e.preventDefault();
	}, {
		capture: !0,
		signal: c
	});
	let P = 0, F = /* @__PURE__ */ new Map();
	function I() {
		for (let [e, t] of F) e.parentElement !== l && (t(), F.delete(e));
		for (let e of b()) !F.has(e) && e.classList.contains("aa-block") && F.set(e, A.item({
			element: e,
			id: `aa-block-${++P}`,
			type: "aa-block",
			text: {
				hold: () => C?.block === e && (C.selected.length || C.grabbed || N(e)) ? 0 : 400,
				axis: "y",
				carries: te
			},
			canDrag: ({ input: t }) => t === "mouse" && x() && !!C && C.block === e && C.mouse && C.plain && !C.own && !C.inSelection
		}));
	}
	I();
	let L = new MutationObserver(I);
	L.observe(l, { childList: !0 });
	let R = (e) => {
		e.detail > 1 && !A.isDragging() && A.cancel();
	}, B = (e) => {
		let t = C;
		C = null, !(!(t?.selected.length || t?.grabbed) || t.inSelection || A.isDragging() || w || !x() || e.type !== "pointerup") && Math.hypot(e.clientX - t.x, e.clientY - t.y) < 5 && ee(e.clientX, e.clientY);
	};
	l.addEventListener("mousedown", R, {
		capture: !0,
		signal: c
	}), d.addEventListener("pointerup", B, {
		capture: !0,
		signal: c
	}), d.addEventListener("pointercancel", B, {
		capture: !0,
		signal: c
	});
	let V = null, H = null;
	function U() {
		V && clearTimeout(V.timer), V = null, H?.removeAttribute("data-grab"), H = null;
	}
	l.addEventListener("pointermove", (e) => {
		if (e.pointerType !== "mouse" || e.buttons || A.isDragging() || !x()) {
			U();
			return;
		}
		let t = e.target?.nodeType === 1 ? e.target : null, n = t?.closest?.(".aa-block");
		if (!n || n.parentElement !== l || z(t, n)) {
			U();
			return;
		}
		if (V?.block === n && Math.hypot(e.clientX - V.x, e.clientY - V.y) < ae) return;
		U();
		let r = setTimeout(() => {
			V?.block === n && x() && (H = n, n.setAttribute("data-grab", ""));
		}, 400);
		V = {
			block: n,
			x: e.clientX,
			y: e.clientY,
			timer: r
		};
	}, { signal: c }), l.addEventListener("pointerleave", U, { signal: c }), l.addEventListener("keydown", U, { signal: c });
	let W = (e) => {
		let t = b().findIndex((t) => {
			let n = t.getBoundingClientRect();
			return e < n.top + n.height / 2;
		});
		return t < 0 ? l.children.length : t;
	}, se = (e) => {
		let t = b(), n = t[e], r = t[e - 1];
		if (e < 0 || !n && !r) {
			f.hidden = !0;
			return;
		}
		let i = (n ?? r).getBoundingClientRect(), a = n && r ? (r.getBoundingClientRect().bottom + i.top) / 2 : n ? i.top : i.bottom;
		f.style.left = `${i.left}px`, f.style.top = `${a}px`, f.style.width = `${i.width}px`, f.hidden = !1;
	}, G = -1, ce = (e) => !i.readOnly && i.placing && !!a.onFiles && Array.from(e.dataTransfer?.types ?? []).includes("Files");
	return l.addEventListener("aa-movement-change", () => {
		A.cancel(), C = null, U(), _ = null, y = null, p.hidden = !0, f.hidden = !0, G = -1, l.toggleAttribute("data-movable", x());
	}, { signal: c }), l.addEventListener("dragover", (e) => {
		ce(e) && (e.preventDefault(), G = W(e.clientY), se(G));
	}, { signal: c }), l.addEventListener("dragleave", (e) => {
		l.contains(e.relatedTarget) || (f.hidden = !0, G = -1);
	}, { signal: c }), l.addEventListener("drop", (e) => {
		f.hidden = !0;
		let t = G;
		if (G = -1, t < 0 || !ce(e) || !e.dataTransfer?.files.length) return;
		e.preventDefault(), e.stopImmediatePropagation();
		let n = b(), r = n[t] ?? n[n.length - 1];
		r.focus({ preventScroll: !0 }), d.getSelection()?.collapse(r, n[t] ? 0 : r.childNodes.length), a.onFiles(Array.from(e.dataTransfer.files));
	}, {
		capture: !0,
		signal: c
	}), () => {
		s.abort(), L.disconnect(), A.destroy(), F.clear(), w = null, C = null, f.remove(), p.remove(), l.removeAttribute("data-movable"), l.removeAttribute("data-dragging"), U();
	};
}
//#endregion
export { I as HOLD, L as REST, B as createDragging };

