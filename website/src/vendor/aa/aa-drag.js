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
}, u = 1500, d = 24, f = [
	"color",
	"font",
	"letter-spacing",
	"line-height",
	"-webkit-font-smoothing"
], p = "input, textarea, select, option, button, a[href], [contenteditable]:not([contenteditable=\"false\"])", m = "data-0001-drag-sortable-style", h = "\n[data-drag-handle]:not([data-drag-handle=\"text\"]){-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;cursor:grab;touch-action:manipulation}\n:root[data-drag-active],:root[data-drag-active] *{-webkit-user-select:none!important;user-select:none!important;cursor:grabbing!important}\n";
function g(e = {}) {
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
	})), i = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map(), j = null, M = null, N = /* @__PURE__ */ new Map(), P = null, F = !1, I = !1, L = /* @__PURE__ */ new Set(), R = null;
	function ie(e) {
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
			renderPreview: e.renderPreview
		};
		return i.set(e.element, t), s(() => {
			i.get(e.element) === t && i.delete(e.element);
		});
	}
	function z(e) {
		let t = e.handle ?? e.element, n = {
			element: e.element,
			id: e.id,
			type: e.type ?? "default",
			handle: t,
			canDrag: e.canDrag ?? (() => !0),
			allowInteractive: e.allowInteractive ?? !1,
			label: () => e.label ?? C(e.element, t),
			text: e.text
		};
		o.set(e.element, n), g.set(t, n), t.setAttribute("data-drag-handle", e.text ? "text" : "");
		let r = !e.text && !t.hasAttribute("tabindex") && !t.matches(p);
		r && (t.tabIndex = 0);
		let i = t.getAttribute("aria-describedby"), { instructions: a } = B(t.ownerDocument);
		return e.text || t.setAttribute("aria-describedby", [i, a.id].filter(Boolean).join(" ")), s(() => {
			if (o.get(e.element) === n && o.delete(e.element), g.get(t) === n) {
				if (g.delete(t), t.removeAttribute("data-drag-handle"), r && t.removeAttribute("tabindex"), e.text) return;
				i ? t.setAttribute("aria-describedby", i) : t.removeAttribute("aria-describedby");
			}
		});
	}
	function B(e) {
		let t = N.get(e);
		if (t) return t;
		let r = e.defaultView ?? window;
		if (r.addEventListener("pointerdown", oe, !0), r.addEventListener("keydown", W, !0), !e.querySelector(`style[${m}]`)) {
			let t = e.createElement("style");
			t.setAttribute(m, ""), t.textContent = h, e.head.appendChild(t);
		}
		let i = S(e, `0001-drag-instructions-${++y}`);
		i.textContent = n.instructions;
		let a = S(e, `0001-drag-live-${y}`);
		a.setAttribute("aria-live", "assertive"), a.setAttribute("aria-atomic", "true");
		let o = {
			view: r,
			instructions: i,
			liveRegion: a
		};
		return N.set(e, o), o;
	}
	function V(e) {
		R && (R.textContent = e);
	}
	function H(e) {
		let t = e.destination;
		return t ? {
			item: e.item.label(),
			list: t.container.registration.label(),
			position: t.index + 1,
			count: t.container.slots.length + 1
		} : null;
	}
	function U(e) {
		let t = H(e);
		V(t ? n.moved(t) : n.outside(e.item.label()));
	}
	function W(e) {
		if (F || M || j || e.key !== " " || e.defaultPrevented) return;
		let t = v(e.target);
		if (t?.matches("input, textarea, select, [contenteditable]:not([contenteditable=\"false\"])")) return;
		let n = t ? g.get(t) : void 0;
		if (!n || n.text || !n.canDrag({
			input: "keyboard",
			target: n.handle
		})) return;
		e.preventDefault(), e.stopPropagation(), ge(n.element.ownerDocument.defaultView ?? window);
		let r = E(n.element);
		ve(n, -1, r.left + r.width / 2, r.top + r.height / 2, "SNAP");
	}
	function ae(e) {
		let t = v(e), n = !1;
		for (; t;) {
			let e = g.get(t);
			if (e) return n && !e.allowInteractive ? null : e;
			t.matches(p) && (n = !0), t = t.parentElement;
		}
		return null;
	}
	function oe(e) {
		if (F || M || j || e.pointerType === "mouse" && e.button !== 0) return;
		let n = ae(e.target), i = v(e.target);
		if (!n || !n.canDrag({
			input: e.pointerType || "mouse",
			target: i
		})) return;
		let a = e.pointerType !== "touch" && n.text ? Math.max(0, n.text.hold()) : 0;
		j = {
			item: n,
			pointerId: e.pointerId,
			pointerType: e.pointerType,
			startX: r(e).x,
			startY: r(e).y,
			timer: null,
			held: a > 0
		}, (e.pointerType === "touch" || a > 0) && (j.timer = setTimeout(() => {
			j && ve(j.item, j.pointerId, j.startX, j.startY);
		}, a || t.touchHold)), ge(n.element.ownerDocument.defaultView ?? window);
	}
	function se(e) {
		if (j && e.pointerId === j.pointerId) {
			let n = r(e);
			if (Math.hypot(n.x - j.startX, n.y - j.startY) < t.dragDistance) return;
			if (j.pointerType === "touch" || j.held) {
				let e = j.pointerType === "touch" ? void 0 : j.item.text?.axis, t = Math.abs(e === "x" ? n.x - j.startX : n.y - j.startY), r = Math.abs(e === "x" ? n.y - j.startY : n.x - j.startX);
				if (!e || t < 2 * r) {
					q();
					return;
				}
			}
			ve(j.item, j.pointerId, j.startX, j.startY);
		}
		if (M && e.pointerId === M.pointerId && !M.dropping) {
			let t = r(e);
			ye(t.x, t.y);
		}
	}
	function ce(e) {
		j && e.pointerId === j.pointerId ? q() : M && e.pointerId === M.pointerId && !M.dropping && (_e(), X("DROP"));
	}
	function le(e) {
		j && e.pointerId === j.pointerId && q(), M && e.pointerId === M.pointerId && !M.dropping && X("CANCEL");
	}
	function ue(e) {
		let t = M;
		if (t && !t.dropping) {
			if (e.key === "Escape") e.preventDefault(), e.stopPropagation(), X("CANCEL");
			else if (t.mode === "SNAP") {
				if (e.key === " " || e.key === "Enter") X("DROP");
				else if (e.key in b) Se(t, b[e.key]);
				else if (e.key !== "Tab") return;
				e.preventDefault(), e.stopPropagation();
			}
		}
	}
	function de(e) {
		M && e.cancelable && e.preventDefault();
	}
	function fe(e) {
		(j || M) && e.preventDefault();
	}
	function pe(e) {
		(j || M) && e.preventDefault();
	}
	function me() {
		q(), M && !M.dropping && X("CANCEL");
	}
	function G(e) {
		(e.type !== "visibilitychange" || P?.document.visibilityState === "hidden") && me();
	}
	function he() {
		if (!M || M.dropping || M.impactFrame !== null) return;
		let e = M.overlay.ownerDocument.defaultView;
		e && (M.impactFrame = e.requestAnimationFrame(() => {
			M && (M.impactFrame = null, M.mode === "SNAP" ? Te(M, !1) : xe(M));
		}));
	}
	function ge(e) {
		P !== e && (K(), P = e, R = N.get(e.document)?.liveRegion ?? null, e.addEventListener("pointermove", se, !0), e.addEventListener("pointerup", ce, !0), e.addEventListener("pointercancel", le, !0), e.addEventListener("touchmove", de, {
			capture: !0,
			passive: !1
		}), e.addEventListener("contextmenu", fe, !0), e.addEventListener("dragstart", pe, !0), e.addEventListener("keydown", ue, !0), e.addEventListener("blur", me), e.addEventListener("pagehide", G), e.document.addEventListener("visibilitychange", G), e.addEventListener("scroll", he, !0));
	}
	function K() {
		let e = P;
		e && (P = null, e.removeEventListener("pointermove", se, !0), e.removeEventListener("pointerup", ce, !0), e.removeEventListener("pointercancel", le, !0), e.removeEventListener("touchmove", de, !0), e.removeEventListener("contextmenu", fe, !0), e.removeEventListener("dragstart", pe, !0), e.removeEventListener("keydown", ue, !0), e.removeEventListener("blur", me), e.removeEventListener("pagehide", G), e.document.removeEventListener("visibilitychange", G), e.removeEventListener("scroll", he, !0));
	}
	function q() {
		j && (j.timer && clearTimeout(j.timer), j = null, M || K());
	}
	function _e() {
		let e = M?.overlay.ownerDocument.defaultView ?? P ?? window, t = (e) => {
			e.preventDefault(), e.stopPropagation();
		};
		e.addEventListener("click", t, {
			capture: !0,
			once: !0
		}), setTimeout(() => e.removeEventListener("click", t, !0), 0);
	}
	function ve(t, r, a, o, s = "FLUID") {
		j?.timer && clearTimeout(j.timer), j = null, e.onBeforeCapture?.({
			draggableId: t.id,
			mode: s
		});
		for (let e of L) e.finish();
		L.clear();
		let c = Ke(t);
		if (!c) {
			K();
			return;
		}
		let l = c.element.ownerDocument, u = l.defaultView ?? window, d = Ue(c);
		if (!d) {
			K();
			return;
		}
		I = u.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? !1;
		let p = E(c.element), m = u.getComputedStyle(c.element), h = {
			top: A(m.marginTop),
			left: A(m.marginLeft),
			vertical: A(m.marginTop) + A(m.marginBottom),
			horizontal: A(m.marginLeft) + A(m.marginRight)
		}, g = w(c.element, p), _ = /* @__PURE__ */ new Map(), v = [], y = 0;
		for (let e of i.values()) {
			if (e.type !== c.type || !e.element.isConnected || e.element.ownerDocument !== l || c.element.contains(e.element)) continue;
			let t = We(e), n = e === d, r = u.getComputedStyle(e.element), i = e.axis === "vertical", a = E(e.element), o = w(e.element, a), s = A(i ? r.rowGap : r.columnGap) * o, f = [], m = [], b = (e, t) => {
				let n = u.getComputedStyle(e), r = w(e, t);
				return {
					start: i ? t.top : t.left,
					size: i ? t.height : t.width,
					marginStart: A(i ? n.marginTop : n.marginLeft) * r,
					marginEnd: A(i ? n.marginBottom : n.marginRight) * r
				};
			};
			t.forEach((t, n) => {
				let r = t === c ? p : E(t.element);
				e.still || m.push(b(t.element, r)), t === c ? y = n : f.push({
					item: t,
					original: n,
					box: r
				});
			});
			let x = ne(e.element), S = _.get(x) ?? null;
			!S && x && (S = {
				element: x,
				liftLeft: x.scrollLeft,
				liftTop: x.scrollTop,
				box: E(x)
			}, _.set(x, S)), v.push({
				registration: e,
				box: a,
				scale: o,
				gap: s,
				paddingStart: A(i ? r.paddingTop : r.paddingLeft) * o,
				scroller: S,
				slots: f,
				room: e.still ? 0 : (i ? p.height + h.vertical * g : p.width + h.horizontal * g) + s,
				marginStart: (i ? h.top : h.left) * g,
				isHome: n,
				flow: e.still ? null : k(r, a, o, i, m, n ? m[y] : b(c.element, p))
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
		for (let t of e.inheritProperties ?? []) x.style.setProperty(t, m.getPropertyValue(t));
		let S = b.registration.renderPreview?.(c.element) ?? e.renderPreview?.(c.element), C = S ?? re(c.element);
		for (let e of S ? f : []) C.style.setProperty(e, m.getPropertyValue(e));
		C.setAttribute("data-drag-preview", ""), C.setAttribute("aria-hidden", "true"), Object.assign(C.style, {
			position: "absolute",
			left: `${p.left}px`,
			top: `${p.top}px`,
			width: `${p.width / g}px`,
			height: `${p.height / g}px`,
			transformOrigin: "0 0",
			margin: "0",
			boxSizing: "border-box",
			translate: "none",
			transform: T(0, 0, g),
			transition: "none",
			willChange: "transform",
			pointerEvents: "none"
		}), x.appendChild(C), l.body.appendChild(x);
		let D = c.element;
		M = {
			item: c,
			mode: s,
			pointerId: r,
			startX: a,
			startY: o,
			lastX: a,
			lastY: o,
			liftBox: p,
			previewScale: g,
			sourceIndex: y,
			home: b,
			containers: v,
			scrollers: [..._.values()],
			windowLiftX: u.scrollX,
			windowLiftY: u.scrollY,
			overlay: x,
			preview: C,
			destination: {
				container: b,
				index: y
			},
			shifts: /* @__PURE__ */ new Map(),
			sourceVisibility: D.style.visibility,
			reserved: null,
			scrollFrame: null,
			impactFrame: null,
			dropping: !1,
			combine: null,
			lockAxis: b.registration.lockAxis ?? e.lockAxis
		}, D.style.visibility = "hidden", D.setAttribute("data-drag-source", ""), b.registration.element.setAttribute("data-drag-over", ""), l.documentElement.setAttribute("data-drag-active", c.type), e.onDragStart?.(Q(M));
		let O = H(M);
		O && V(n.lifted(O));
	}
	function ye(e, t) {
		let n = M;
		if (!n) return;
		n.lastX = e, n.lastY = t;
		let r = n.lockAxis === "y" ? 0 : e - n.startX, i = n.lockAxis === "x" ? 0 : t - n.startY;
		n.preview.style.transform = T(r, i, n.previewScale), xe(n), Pe(n);
	}
	function J(e, t) {
		let n = e.overlay.ownerDocument.defaultView ?? window, r = n.scrollX - e.windowLiftX, i = n.scrollY - e.windowLiftY, a = t.scroller;
		return a?.element && (r += a.element.scrollLeft - a.liftLeft, i += a.element.scrollTop - a.liftTop), {
			x: r,
			y: i
		};
	}
	function be(e, t) {
		let n = J(e, t), r = t.box, i = t.scroller, a = {
			...r,
			left: r.left - n.x,
			top: r.top - n.y
		};
		return i?.element ? D(a, i.box) : a;
	}
	function xe(t) {
		let r = t.lastX, i = t.lastY, a = null, o = Infinity;
		for (let e of t.containers) {
			if (e.registration.isDropDisabled()) continue;
			let n = be(t, e);
			if (!O(n, r, i)) continue;
			let s = n.width * n.height;
			s < o && (a = e, o = s);
		}
		let s = a && t.mode === "FLUID" ? Oe(t, a) : null;
		if (s && a) {
			ke(t, {
				container: a,
				slot: s
			}) && (e.onDragUpdate?.($(t)), V(n.combining(t.item.label(), s.item.label())));
			return;
		}
		let c = ke(t, null), l = null;
		a && (l = {
			container: a,
			index: Ae(t, a)
		});
		let u = t.destination;
		u?.container === l?.container && u?.index === l?.index ? c && (e.onDragUpdate?.($(t)), U(t)) : (t.destination = l, je(t, u?.container ?? null), t.overlay.ownerDocument.documentElement.toggleAttribute("data-drag-outside", !l), e.onDragUpdate?.($(t)), U(t));
	}
	function Se(t, n) {
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
			let e = Ce(t, r.container, n);
			e && (a = {
				container: e,
				index: we(t, e)
			});
		}
		if (!a) return;
		let o = t.destination?.container ?? null;
		t.destination = a, je(t, o), Te(t, !0), Ee(t), e.onDragUpdate?.($(t)), U(t);
	}
	function Ce(e, t, n) {
		let r = x(be(e, t)), i = null, a = Infinity;
		for (let o of e.containers) {
			if (o === t || o.registration.isDropDisabled()) continue;
			let s = x(be(e, o)), c = (s.x - r.x) * n.x + (s.y - r.y) * n.y;
			if (c <= 1) continue;
			let l = c + (Math.abs((s.x - r.x) * n.y) + Math.abs((s.y - r.y) * n.x)) * 2;
			l < a && (i = o, a = l);
		}
		return i;
	}
	function we(e, t) {
		let n = t.registration.axis === "vertical", r = J(e, t), i = te(e.preview.style.transform), a = n ? e.liftBox.top + i.y + e.liftBox.height / 2 : e.liftBox.left + i.x + e.liftBox.width / 2;
		return t.slots.filter((i) => Y(e, t, i) - (n ? r.y : r.x) + (n ? i.box.height : i.box.width) / 2 < a).length;
	}
	function Te(e, n) {
		let r = Le(e), { duration: i, easing: a } = t.outOfTheWay;
		e.preview.style.transition = n && !I ? `transform ${i}ms ${a}` : "none", e.preview.style.transform = T(r.x, r.y, e.previewScale);
	}
	function Ee(e) {
		let n = e.overlay.ownerDocument.defaultView;
		if (!n) return;
		let r = Le(e), i = {
			left: e.liftBox.left + r.x,
			top: e.liftBox.top + r.y,
			width: e.liftBox.width,
			height: e.liftBox.height
		}, a = t.autoScrollEdge, o = e.destination?.container.scroller, s = (e) => ({
			x: Math.min(0, i.left - a - e.left) + Math.max(0, i.left + i.width + a - e.left - e.width),
			y: Math.min(0, i.top - a - e.top) + Math.max(0, i.top + i.height + a - e.top - e.height)
		});
		if (o?.element) {
			let e = s(o.box);
			(e.x || e.y) && o.element.scrollBy(e.x, e.y);
		}
		let c = s({
			left: 0,
			top: 0,
			width: n.innerWidth,
			height: n.innerHeight
		});
		(c.x || c.y) && n.scrollBy(c.x, c.y), Te(e, !0);
	}
	function De(e, t) {
		let n = t.registration.axis === "vertical", r = n ? e.liftBox.top : e.liftBox.left, i = n ? e.liftBox.height : e.liftBox.width, a = n ? e.lockAxis === "x" ? 0 : e.lastY - e.startY : e.lockAxis === "y" ? 0 : e.lastX - e.startX;
		return {
			start: r + a,
			end: r + a + i
		};
	}
	function Oe(e, t) {
		let n = e.destination;
		if (!n || n.container !== t || !t.registration.isCombineEnabled()) return null;
		let r = t.registration.axis === "vertical", i = r ? J(e, t).y : J(e, t).x, a = De(e, t);
		return t.slots.find((o, s) => {
			let c = r ? o.box.height : o.box.width, l = s >= n.index, u = Y(e, t, o) - i + (l ? t.room : 0), d = c / 4, f = l ? a.end : a.start;
			return f > u + d && f < u + c - d;
		}) ?? null;
	}
	function ke(e, t) {
		return e.combine?.slot !== t?.slot && (e.combine?.slot.item.element.removeAttribute("data-drag-combine"), t?.slot.item.element.setAttribute("data-drag-combine", ""), e.combine = t, !0);
	}
	function Ae(e, t) {
		let n = t.registration.axis === "vertical", r = J(e, t), { start: i, end: a } = De(e, t), o = n ? r.y : r.x, s = t.slots.map((r) => Y(e, t, r) - o + (n ? r.box.height : r.box.width) / 2), c = s.length;
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
	function je(e, t) {
		let n = e.destination, r = /* @__PURE__ */ new Set([e.home]);
		t && r.add(t), n && r.add(n.container);
		for (let t of r) {
			let r = Me(e, t);
			t.slots.forEach((i, a) => {
				let o = 0;
				r ? o = r.shifts[a] : (t.isHome && i.original > e.sourceIndex && (o -= t.room), n?.container === t && a >= n.index && (o += t.room)), Ne(e, i.item.element, o, t);
			});
		}
		let i = n && !n.container.isHome ? n.container : null;
		e.reserved !== i && (e.reserved?.registration.element.style.removeProperty("--drag-reserve"), e.reserved?.registration.element.removeAttribute("data-drag-over"), i && !i.registration.still && i.registration.element.style.setProperty("--drag-reserve", `${i.room}px`), e.reserved = i);
		for (let t of e.containers) n?.container === t ? t.registration.element.setAttribute("data-drag-over", "") : t.registration.element.removeAttribute("data-drag-over");
	}
	function Me(e, t) {
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
	function Ne(n, r, i, a) {
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
			r.style.transition = I ? "none" : `translate ${e}ms ${i}`;
		}
		let u = (s - l) * a.scale;
		e.onMovement?.({
			element: r,
			phase: "drag",
			x: o === "vertical" ? 0 : u,
			y: o === "vertical" ? u : 0
		}), r.style.translate = s === 0 ? "none" : o === "vertical" ? `0 ${s}px` : `${s}px 0`, r.style.setProperty("--drag-shift", `${s}px`);
	}
	function Pe(e) {
		if (e.scrollFrame !== null) return;
		let t = e.overlay.ownerDocument.defaultView;
		if (!t) return;
		let n = () => {
			M !== e || e.dropping || (e.scrollFrame = null, Fe(e) && (xe(e), e.scrollFrame = t.requestAnimationFrame(n)));
		};
		Ie(e, e.destination?.container.scroller ?? null, t) && (e.scrollFrame = t.requestAnimationFrame(n));
	}
	function Fe(e) {
		let t = e.overlay.ownerDocument.defaultView;
		if (!t) return !1;
		let n = e.destination?.container.scroller ?? null, r = Ie(e, n, t);
		if (!r) return !1;
		if (n?.element) {
			let e = {
				left: n.element.scrollLeft,
				top: n.element.scrollTop
			};
			if (n.element.scrollBy(r.x, r.y), n.element.scrollLeft !== e.left || n.element.scrollTop !== e.top) return !0;
		}
		let i = Ie(e, null, t);
		if (!i) return !1;
		let a = {
			x: t.scrollX,
			y: t.scrollY
		};
		return t.scrollBy(i.x, i.y), t.scrollX !== a.x || t.scrollY !== a.y;
	}
	function Ie(e, n, r) {
		let i = n?.element ? n.box : {
			left: 0,
			top: 0,
			width: r.innerWidth,
			height: r.innerHeight
		}, a = t.autoScrollEdge, o = (e, t, n) => {
			let r = e - t, i = t + n - e;
			return r < a ? -24 * ((a - Math.max(r, 0)) / a) ** 2 : i < a ? d * ((a - Math.max(i, 0)) / a) ** 2 : 0;
		}, s = o(e.lastX, i.left, i.width), c = o(e.lastY, i.top, i.height);
		return s || c ? {
			x: s,
			y: c
		} : null;
	}
	async function X(n) {
		let r = M;
		if (!r || r.dropping) return;
		r.dropping = !0;
		let i = r.overlay.ownerDocument.defaultView ?? window;
		if (r.scrollFrame !== null && i.cancelAnimationFrame(r.scrollFrame), r.impactFrame !== null && i.cancelAnimationFrame(r.impactFrame), n === "DROP" && r.combine) {
			let { container: e, slot: i } = r.combine, a = {
				...Q(r),
				destination: null,
				combine: Ge(r),
				reason: n
			}, o = e.registration.axis === "vertical", s = J(r, e), c = e.slots.indexOf(i), l = Y(r, e, i) + (r.destination && c >= r.destination.index ? e.room : 0), u = (o ? i.box.left : l) - s.x - r.liftBox.left, d = (o ? l : i.box.top) - s.y - r.liftBox.top, { maxDuration: f, easing: p } = t.drop;
			if (I) {
				Z(r, a);
				return;
			}
			r.preview.style.transition = `transform ${f}ms ${p}, opacity ${f}ms ${p}`, r.preview.style.transform = T(u, d, r.previewScale * .75), r.preview.style.opacity = "0";
			let m = !1, h = () => {
				m || (m = !0, Z(r, a));
			};
			r.preview.addEventListener("transitionend", h, { once: !0 }), setTimeout(h, f + 50);
			return;
		}
		if (ke(r, null), n === "DROP" && !r.destination && r.mode === "FLUID" && e.onDropOutside?.(Q(r), {
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
			}, je(r, e);
		}
		let o = null;
		if (n === "DROP" && e.prepareDrop) {
			r.preparing = !0;
			let i = ze(r), s = new Map(i.map((e) => [e, e.getBoundingClientRect()])), c = Be(r, i);
			for (let [e, t] of r.shifts) e.style.transition = "none", e.style.translate = t.translate;
			r.reserved?.registration.element.style.removeProperty("--drag-reserve");
			let l = e.prepareDrop({
				...Q(r),
				destination: a ? null : qe(r.destination),
				combine: null,
				reason: n
			}), u = _(l) ? await l : l, d = typeof u == "function" ? u : () => u;
			if (o = d(), M !== r || (o?.isConnected && (r.landing = {
				element: o,
				visibility: o.style.visibility
			}, o.style.visibility = "hidden"), await new Promise((e) => (r.overlay.ownerDocument.defaultView ?? window).requestAnimationFrame(() => e())), M !== r)) return;
			let f = d();
			f !== o && (r.landing && (r.landing.element.style.visibility = r.landing.visibility), o = f, o?.isConnected && (r.landing = {
				element: o,
				visibility: o.style.visibility
			}, o.style.visibility = "hidden"));
			for (let e of i) {
				if (!e.isConnected || e === o) continue;
				let n = s.get(e), r = e.getBoundingClientRect();
				Ve(e, c.get(e), r);
				let i = n.left - r.left, a = n.top - r.top;
				if (!I && (i || a)) {
					let n = e.animate([{ translate: `${i}px ${a}px` }, { translate: (e.ownerDocument.defaultView ?? window).getComputedStyle(e).translate }], {
						duration: t.outOfTheWay.duration,
						easing: t.outOfTheWay.easing
					});
					if (!n) continue;
					L.add(n), n.addEventListener?.("finish", () => L.delete(n)), n.addEventListener?.("cancel", () => L.delete(n));
				}
			}
		}
		let s = o?.isConnected ? o.getBoundingClientRect() : null, c = s ? {
			x: s.left - r.liftBox.left,
			y: s.top - r.liftBox.top
		} : Le(r), l = te(r.preview.style.transform), d = Math.hypot(c.x - l.x, c.y - l.y), { minDuration: f, maxDuration: p, easing: m } = t.drop, h = !a && !!r.destination?.container.registration.still, g = d < .5 || I || h ? 0 : f + (p - f) * Math.min(d / u, 1), v = {
			...Q(r),
			destination: a || !r.destination ? null : qe(r.destination),
			combine: null,
			reason: n
		};
		if (g === 0) {
			Z(r, v);
			return;
		}
		r.preview.style.transition = `transform ${g}ms ${m}`, r.preview.style.transform = T(c.x, c.y, r.previewScale);
		let y = !1, b = () => {
			y || (y = !0, Z(r, v));
		};
		r.preview.addEventListener("transitionend", b, { once: !0 }), setTimeout(b, g + 50);
	}
	function Le(e) {
		let t = e.destination ?? {
			container: e.home,
			index: e.sourceIndex
		}, n = t.container, r = n.registration.axis === "vertical", i = J(e, n), a = n.slots, o, s = n.registration.still, c = s ? Re(n, t.index) : void 0, l = s ? null : Me(e, n)?.source ?? null;
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
	function Re(e, t) {
		return e.isHome ? e.slots.find((e) => e.original === t) : e.slots[t];
	}
	function Z(t, r) {
		let i = H(t), a = e.onMovement && !t.preparing ? ze(t) : [], s = Be(t, a);
		try {
			e.onDragEnd?.(r);
		} finally {
			He(t);
		}
		if (a.length && (t.overlay.ownerDocument.defaultView ?? window).requestAnimationFrame(() => {
			for (let e of a) e.isConnected && Ve(e, s.get(e), e.getBoundingClientRect());
		}), r.combine && t.combine ? V(n.combined(t.item.label(), t.combine.slot.item.label())) : i && V(r.reason === "DROP" && r.destination ? n.dropped(i) : n.returned(i)), t.mode === "SNAP") {
			for (let e of o.values()) if (e.id === t.item.id && e.element.isConnected) {
				e.handle.focus({ preventScroll: !0 });
				break;
			}
		}
	}
	function ze(e) {
		return [...new Set(e.containers.flatMap((e) => e.slots.map((e) => e.item.element)))].filter((e) => e.isConnected);
	}
	function Be(e, t) {
		return new Map(t.map((t) => [t, ee(t, e.shifts.get(t)?.scale ?? 1)]));
	}
	function Ve(t, n, r) {
		let i = r.left - n.left, a = r.top - n.top;
		(Math.abs(i) > 1 || Math.abs(a) > 1) && e.onMovement?.({
			element: t,
			phase: "drop",
			x: i,
			y: a
		});
	}
	function He(e) {
		let t = e.item.element, n = e.overlay.ownerDocument.defaultView ?? window;
		for (let [t, n] of e.shifts) t.style.transition = "none", t.style.translate = n.translate, t.style.removeProperty("--drag-shift");
		let r = [...e.shifts];
		n.requestAnimationFrame(() => {
			n.requestAnimationFrame(() => {
				for (let [e, t] of r) e.style.transition = t.transition;
			});
		}), e.landing && (e.landing.element.style.visibility = e.landing.visibility), t.style.visibility = e.sourceVisibility, t.removeAttribute("data-drag-source"), e.combine?.slot.item.element.removeAttribute("data-drag-combine"), e.reserved?.registration.element.style.removeProperty("--drag-reserve");
		for (let t of e.containers) t.registration.element.removeAttribute("data-drag-over");
		e.overlay.remove(), t.ownerDocument.documentElement.removeAttribute("data-drag-active"), t.ownerDocument.documentElement.removeAttribute("data-drag-outside"), M = null, K();
	}
	function Ue(e) {
		let t = e.element.parentElement;
		for (; t;) {
			let n = i.get(t);
			if (n && n.type === e.type) return n;
			t = t.parentElement;
		}
		return null;
	}
	function We(e) {
		let t = [];
		for (let n of o.values()) n.type === e.type && n.element.isConnected && Ue(n) === e && t.push(n);
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
			destination: e.destination && !e.combine ? qe(e.destination) : null,
			combine: Ge(e)
		};
	}
	function Ge(e) {
		return e.combine ? {
			draggableId: e.combine.slot.item.id,
			droppableId: e.combine.container.registration.id
		} : null;
	}
	function Ke(e) {
		if (e.element.isConnected && o.get(e.element) === e) return e;
		for (let t of o.values()) if (t.id === e.id && t.type === e.type && t.element.isConnected) return t;
		return null;
	}
	function qe(e) {
		return {
			droppableId: e.container.registration.id,
			index: e.index
		};
	}
	return {
		container: ie,
		item: z,
		isDragging: () => M !== null,
		cancel: () => {
			q(), M && !M.dropping && X("CANCEL");
		},
		destroy: () => {
			F = !0, q(), M && !M.preparing && He(M);
			for (let { view: e, instructions: t, liveRegion: n } of N.values()) e.removeEventListener("pointerdown", oe, !0), e.removeEventListener("keydown", W, !0), t.remove(), n.remove();
			N.clear(), i.clear(), o.clear(), g.clear();
		}
	};
}
function _(e) {
	return !!e && typeof e.then == "function";
}
function v(e) {
	return e && e.nodeType === 1 ? e : null;
}
var y = 0, b = {
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
function x(e) {
	return {
		x: e.left + e.width / 2,
		y: e.top + e.height / 2
	};
}
function S(e, t) {
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
function C(e, t) {
	let n = e.getAttribute("aria-label") ?? t.getAttribute("aria-label") ?? e.textContent?.replace(/\s+/g, " ").trim() ?? "";
	return n.length > 60 ? `${n.slice(0, 59)}…` : n || "Item";
}
function w(e, t) {
	if (e.offsetWidth <= 0 || t.width <= 0) return 1;
	let n = t.width / e.offsetWidth;
	return Math.abs(n - 1) < .02 ? 1 : n;
}
function T(e, t, n) {
	return `translate3d(${e}px, ${t}px, 0)${n === 1 ? "" : ` scale(${n})`}`;
}
function E(e) {
	let t = e.getBoundingClientRect();
	return {
		left: t.left,
		top: t.top,
		width: t.width,
		height: t.height
	};
}
function D(e, t) {
	let n = Math.max(e.left, t.left), r = Math.max(e.top, t.top), i = Math.min(e.left + e.width, t.left + t.width), a = Math.min(e.top + e.height, t.top + t.height);
	return {
		left: n,
		top: r,
		width: Math.max(0, i - n),
		height: Math.max(0, a - r)
	};
}
function O(e, t, n) {
	return t >= e.left && t < e.left + e.width && n >= e.top && n < e.top + e.height;
}
function k(e, t, n, r, i, a) {
	let s = r && /^(block|flow-root|list-item)$/.test(e.display), c = s ? 0 : A(r ? e.rowGap : e.columnGap) * n, l = (r ? t.top : t.left) + (A(r ? e.borderTopWidth : e.borderLeftWidth) + A(r ? e.paddingTop : e.paddingLeft)) * n, u = i[0], d = {
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
function ee(e, t) {
	let n = E(e), r = (e) => {
		if (!e || e === "none") return {
			x: 0,
			y: 0
		};
		let [t = "0", n = "0"] = e.trim().split(/\s+/);
		return {
			x: A(t),
			y: A(n)
		};
	}, i = r(e.style.translate), a = r((e.ownerDocument.defaultView ?? window).getComputedStyle(e).translate);
	return {
		...n,
		left: n.left + (i.x - a.x) * t,
		top: n.top + (i.y - a.y) * t
	};
}
function A(e) {
	let t = Number.parseFloat(e);
	return Number.isFinite(t) ? t : 0;
}
function te(e) {
	let t = /translate3d\(\s*(-?[\d.]+)px,\s*(-?[\d.]+)px/.exec(e);
	return t ? {
		x: Number(t[1]),
		y: Number(t[2])
	} : {
		x: 0,
		y: 0
	};
}
function ne(e) {
	let t = e.ownerDocument.defaultView, n = e.parentElement;
	for (; n && n !== e.ownerDocument.body && n !== e.ownerDocument.documentElement;) {
		let e = t?.getComputedStyle(n), r = (e) => e === "auto" || e === "scroll" || e === "overlay";
		if (e && (r(e.overflowY) || r(e.overflowX))) return n;
		n = n.parentElement;
	}
	return null;
}
function re(e) {
	let t = e.cloneNode(!0), n = e.ownerDocument.defaultView, r = [e, ...e.querySelectorAll("*")], i = [t, ...t.querySelectorAll("*")];
	r.forEach((e, t) => {
		let r = i[t];
		if (!r.style) return;
		let a = n.getComputedStyle(e);
		for (let e of Array.from(a)) r.style.setProperty(e, a.getPropertyValue(e), "important");
		r.removeAttribute("contenteditable");
	});
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
	return t.removeAttribute("data-drag-handle"), t;
}
//#endregion
//#region src/drag.ts
var j = 400, M = 400, N = 8, P = "button, input, textarea, select, video, audio, .aa-caption, [data-aa-interactive]", F = (e, t) => {
	let n = e?.closest(P);
	return !!n && t.contains(n);
}, I = [
	"--aa-unit",
	"--aa-sf",
	"--aa-rule-color",
	"--aa-gap",
	"--aa-indent"
];
function L(i, a, o) {
	let s = new AbortController(), { signal: c } = s, l = i.element, u = l.ownerDocument, d = u.defaultView, f = u.createElement("div");
	f.className = "aa-drop-line", f.hidden = !0, o.append(f);
	let p = u.createElement("div");
	p.className = "aa-drop-line aa-drop-side", p.hidden = !0, o.append(p);
	let m = (e, t, n, r = "") => {
		Object.assign(p.style, {
			left: `${e}px`,
			top: `${t}px`,
			height: `${n}px`,
			width: r
		}), p.hidden = !1;
	}, h = null, _ = null, v = () => Array.from(l.children), y = () => !i.readOnly && a.menus !== !1 && (i.reordering || i.placing), b = () => y() && i.placing;
	l.toggleAttribute("data-movable", y());
	let x = null, S = null, C = (e, t) => {
		let n = d.getSelection();
		return !n?.rangeCount || n.isCollapsed ? !1 : Array.from(n.getRangeAt(0).getClientRects()).some((n) => e >= n.left && e <= n.right && t >= n.top && t <= n.bottom);
	}, w = (e, t) => {
		let n = r(u, e, t), i = (n?.node.nodeType === 1 ? n.node : n?.node.parentElement)?.closest(".aa-block");
		n && i && i.parentElement === l && (i.focus({ preventScroll: !0 }), d.getSelection()?.collapse(n.node, n.offset));
	}, T = () => {
		S && d.getSelection()?.rangeCount && d.getSelection().removeAllRanges();
	}, E = [], D = {
		x: 0,
		y: 0
	}, O = !1, k = g({
		inheritProperties: I,
		onDragStart: (e) => {
			let t = v()[e.source.index], n = x?.selected ?? [], r = t && n.includes(t) ? n : [];
			E = v().map((e) => e.getBoundingClientRect()), D = {
				x: d.scrollX,
				y: d.scrollY
			}, S = {
				caret: r.length ? null : i.selection(),
				group: r,
				from: e.source.index
			}, u.addEventListener("pointermove", A, {
				capture: !0,
				signal: c
			});
			for (let e of r) e !== t && e.setAttribute("data-ghost", "");
			l.setAttribute("data-dragging", ""), u.addEventListener("selectionchange", T, { signal: c }), T();
		},
		prepareDrop: (e) => {
			O = !0;
			let t = v()[e.source.index], n = t?.textContent, r = t?.querySelector(":scope > .aa-atom")?.dataset.source, i = l;
			for (let e = l.parentElement; e; e = e.parentElement) e.classList.contains("aa") && (i = e);
			let a = new Set(i.querySelectorAll(".aa-block")), o = _ && { ..._ }, s = h && { ...h }, c = l.parentElement?.classList.contains("aa-columns") ? l.parentElement : null, u = c ? Array.from(i.querySelectorAll(".aa-columns")).indexOf(c) : -1, d = e.source.index, f = s ? s.index - +(d < s.index) : -1;
			return ee(e), () => {
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
			O || ee(e), O = !1;
		}
	});
	function ee(e) {
		let { caret: t, group: n } = S ?? {
			caret: null,
			group: []
		};
		S = null, E = [], u.removeEventListener("pointermove", A, !0);
		let r = h, a = _;
		h = null, _ = null, p.hidden = !0, p.removeAttribute("data-swap");
		for (let e of l.querySelectorAll(":scope > [data-ghost]")) e.removeAttribute("data-ghost");
		l.removeAttribute("data-dragging"), u.removeEventListener("selectionchange", T);
		let o = v(), s = e.source.index, c = e.destination?.index;
		if (!(e.reason === "DROP" && r && n.length <= 1 && b() && re(s, r.index, r.at))) {
			if (e.reason === "DROP" && a && n.length <= 1 && b()) l.dispatchEvent(new CustomEvent("aa-column-carry", {
				bubbles: !0,
				detail: {
					from: s,
					...a
				}
			}));
			else {
				if (e.reason === "DROP" && c !== void 0 && y() && i.reordering) {
					if (n.length > 1) {
						let e = o.indexOf(n[0]), t = n.length, r = o.filter((e, t) => t !== s).slice(0, c).filter((e) => !n.includes(e)).length;
						if (r !== e) {
							i.moveBlock(e, r, t);
							return;
						}
						i.selectBlocks(e, e + t - 1);
						return;
					}
					if (c !== s) {
						i.moveBlock(s, c);
						return;
					}
				}
				t ? i.selectRange(t.start, t.end) : n.length && i.selectBlocks(o.indexOf(n[0]), o.indexOf(n[n.length - 1]));
			}
		}
	}
	k.container({
		element: l,
		id: "aa",
		type: "aa-block",
		isDropDisabled: () => !y()
	});
	function A(e) {
		if (!S || S.group.length > 1 || !b() || te(e)) return;
		let t = parseFloat(getComputedStyle(l).getPropertyValue("--aa-unit")) || 20, r = d.scrollX - D.x, i = d.scrollY - D.y, a = e.clientX + r, o = e.clientY + i, s = n(E, S.from, {
			x: a,
			y: o
		}, t), c = s?.index ?? -1, u = s?.at, f = s?.rect, g = f ? new DOMRect(f.left - r, f.top - i, f.width, f.height) : null;
		!u || !g ? (h = null, p.hidden = !0) : (p.removeAttribute("data-swap"), h = {
			index: c,
			at: u
		}, m(u === "start" ? g.left : g.right, g.top, g.height));
	}
	function te(e) {
		_ = null;
		let t = l.parentElement;
		if (!l.classList.contains("aa-column") || !t?.classList.contains("aa-columns")) return !1;
		let n = parseFloat(getComputedStyle(l).getPropertyValue("--aa-unit")) || 20, r = t.getBoundingClientRect();
		if (e.clientY < r.top - n || e.clientY > r.bottom + n) return !1;
		let i = l.getBoundingClientRect();
		if (e.clientX >= i.left && e.clientX <= i.right) return !1;
		let a = Array.from(t.children).filter((e) => e.classList.contains("aa-column")), o = a.indexOf(l), s = l.querySelectorAll(":scope > .aa-block").length <= 1, c = s ? a.filter((e) => e !== l) : a;
		p.removeAttribute("data-swap");
		let u = s ? a.findIndex((t) => {
			let n = t.getBoundingClientRect();
			return t !== l && e.clientX >= n.left && e.clientX <= n.right;
		}) : -1;
		if (u >= 0) {
			let e = (a[u].querySelector(":scope > .aa-block") ?? a[u]).getBoundingClientRect();
			return _ = { swap: u }, h = null, p.setAttribute("data-swap", ""), m(e.left, e.top, e.height, `${e.width}px`), !0;
		}
		let d = c.map((e) => e.getBoundingClientRect()), f = d.filter((t) => t.left + t.width / 2 < e.clientX).length;
		if (p.hidden = !0, s && f === o) return !0;
		_ = { slot: f };
		let g = d.length > 1 ? d[1].left - d[0].right : 2 * n, v = f === 0 ? d[0].left - g / 2 : f === d.length ? d[d.length - 1].right + g / 2 : (d[f - 1].right + d[f].left) / 2;
		return h = null, m(v, r.top, r.height), !0;
	}
	function ne(e) {
		let n = t(i.value)[v().indexOf(e)];
		return !!n && /^(?:!\[[^\]\n]*\]\([^)\n]*\)\s*)+$/.test(n.source.trim());
	}
	function re(n, r, a) {
		if (t(i.value).length !== v().length) return !1;
		let o = e(i.value, n, r, a);
		return o ? (i.replace(o.start, o.end, o.text), !0) : !1;
	}
	d.addEventListener("pointerdown", (e) => {
		let t = e.target?.nodeType === 1 ? e.target : null, n = t?.closest?.(".aa-block"), r = !!n && B === n;
		if (V(), !n || n.parentElement !== l) {
			x = null;
			return;
		}
		P();
		let i = v().filter((e) => e.hasAttribute("data-selected")), a = i.includes(n) ? i : [];
		x = {
			block: n,
			mouse: e.pointerType === "mouse" && e.button === 0,
			plain: !e.shiftKey && !e.altKey && !e.metaKey && !e.ctrlKey,
			own: F(t, n),
			inSelection: C(e.clientX, e.clientY),
			selected: a,
			grabbed: r,
			x: e.clientX,
			y: e.clientY
		}, (a.length || r || ne(n)) && x.mouse && x.plain && !x.own && !x.inSelection && y() && e.preventDefault();
	}, {
		capture: !0,
		signal: c
	});
	let j = 0, M = /* @__PURE__ */ new Map();
	function P() {
		for (let [e, t] of M) e.parentElement !== l && (t(), M.delete(e));
		for (let e of v()) !M.has(e) && e.classList.contains("aa-block") && M.set(e, k.item({
			element: e,
			id: `aa-block-${++j}`,
			type: "aa-block",
			text: {
				hold: () => x?.block === e && (x.selected.length || x.grabbed || ne(e)) ? 0 : 400,
				axis: "y"
			},
			canDrag: ({ input: t }) => t === "mouse" && y() && !!x && x.block === e && x.mouse && x.plain && !x.own && !x.inSelection
		}));
	}
	P();
	let L = new MutationObserver(P);
	L.observe(l, { childList: !0 });
	let R = (e) => {
		e.detail > 1 && !k.isDragging() && k.cancel();
	}, ie = (e) => {
		let t = x;
		x = null, !(!(t?.selected.length || t?.grabbed) || t.inSelection || k.isDragging() || S || !y() || e.type !== "pointerup") && Math.hypot(e.clientX - t.x, e.clientY - t.y) < 5 && w(e.clientX, e.clientY);
	};
	l.addEventListener("mousedown", R, {
		capture: !0,
		signal: c
	}), d.addEventListener("pointerup", ie, {
		capture: !0,
		signal: c
	}), d.addEventListener("pointercancel", ie, {
		capture: !0,
		signal: c
	});
	let z = null, B = null;
	function V() {
		z && clearTimeout(z.timer), z = null, B?.removeAttribute("data-grab"), B = null;
	}
	l.addEventListener("pointermove", (e) => {
		if (e.pointerType !== "mouse" || e.buttons || k.isDragging() || !y()) {
			V();
			return;
		}
		let t = e.target?.nodeType === 1 ? e.target : null, n = t?.closest?.(".aa-block");
		if (!n || n.parentElement !== l || F(t, n)) {
			V();
			return;
		}
		if (z?.block === n && Math.hypot(e.clientX - z.x, e.clientY - z.y) < N) return;
		V();
		let r = setTimeout(() => {
			z?.block === n && y() && (B = n, n.setAttribute("data-grab", ""));
		}, 400);
		z = {
			block: n,
			x: e.clientX,
			y: e.clientY,
			timer: r
		};
	}, { signal: c }), l.addEventListener("pointerleave", V, { signal: c }), l.addEventListener("keydown", V, { signal: c });
	let H = (e) => {
		let t = v().findIndex((t) => {
			let n = t.getBoundingClientRect();
			return e < n.top + n.height / 2;
		});
		return t < 0 ? l.children.length : t;
	}, U = (e) => {
		let t = v(), n = t[e], r = t[e - 1];
		if (e < 0 || !n && !r) {
			f.hidden = !0;
			return;
		}
		let i = (n ?? r).getBoundingClientRect(), a = n && r ? (r.getBoundingClientRect().bottom + i.top) / 2 : n ? i.top : i.bottom;
		f.style.left = `${i.left}px`, f.style.top = `${a}px`, f.style.width = `${i.width}px`, f.hidden = !1;
	}, W = -1, ae = (e) => !i.readOnly && i.placing && !!a.onFiles && Array.from(e.dataTransfer?.types ?? []).includes("Files");
	return l.addEventListener("aa-movement-change", () => {
		k.cancel(), x = null, V(), h = null, _ = null, p.hidden = !0, f.hidden = !0, W = -1, l.toggleAttribute("data-movable", y());
	}, { signal: c }), l.addEventListener("dragover", (e) => {
		ae(e) && (e.preventDefault(), W = H(e.clientY), U(W));
	}, { signal: c }), l.addEventListener("dragleave", (e) => {
		l.contains(e.relatedTarget) || (f.hidden = !0, W = -1);
	}, { signal: c }), l.addEventListener("drop", (e) => {
		f.hidden = !0;
		let t = W;
		if (W = -1, t < 0 || !ae(e) || !e.dataTransfer?.files.length) return;
		e.preventDefault(), e.stopImmediatePropagation();
		let n = v(), r = n[t] ?? n[n.length - 1];
		r.focus({ preventScroll: !0 }), d.getSelection()?.collapse(r, n[t] ? 0 : r.childNodes.length), a.onFiles(Array.from(e.dataTransfer.files));
	}, {
		capture: !0,
		signal: c
	}), () => {
		s.abort(), L.disconnect(), k.destroy(), M.clear(), S = null, x = null, f.remove(), p.remove(), l.removeAttribute("data-movable"), l.removeAttribute("data-dragging"), V();
	};
}
//#endregion
export { j as HOLD, M as REST, L as createDragging };

