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
	})), i = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), v = /* @__PURE__ */ new Map(), F = null, I = null, L = /* @__PURE__ */ new Map(), R = null, z = !1, B = !1, V = /* @__PURE__ */ new Set(), H = null, U = null;
	function re(e) {
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
	function ie(e) {
		let t = e.handle ?? e.element, n = {
			element: e.element,
			id: e.id,
			type: e.type ?? "default",
			handle: t,
			canDrag: e.canDrag ?? (() => !0),
			allowInteractive: e.allowInteractive ?? !1,
			label: () => e.label ?? E(e.element, t),
			text: e.text
		};
		o.set(e.element, n), v.set(t, n), t.setAttribute("data-drag-handle", e.text ? "text" : "");
		let r = !e.text && !t.hasAttribute("tabindex") && !t.matches(h);
		r && (t.tabIndex = 0);
		let i = t.getAttribute("aria-describedby"), { instructions: a } = W(t.ownerDocument);
		return e.text || t.setAttribute("aria-describedby", [i, a.id].filter(Boolean).join(" ")), s(() => {
			if (o.get(e.element) === n && o.delete(e.element), v.get(t) === n) {
				if (v.delete(t), t.removeAttribute("data-drag-handle"), r && t.removeAttribute("tabindex"), e.text) return;
				i ? t.setAttribute("aria-describedby", i) : t.removeAttribute("aria-describedby");
			}
		});
	}
	function W(e) {
		let t = L.get(e);
		if (t) return t;
		let r = e.defaultView ?? window;
		if (r.addEventListener("pointerdown", le, !0), r.addEventListener("keydown", se, !0), !e.querySelector(`style[${g}]`)) {
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
		return L.set(e, o), o;
	}
	function G(e) {
		H && (H.textContent = e);
	}
	function ae(e) {
		let t = e.destination;
		return t ? {
			item: e.item.label(),
			list: t.container.registration.label(),
			position: t.index + 1,
			count: t.container.slots.length + 1
		} : null;
	}
	function oe(e) {
		let t = ae(e);
		G(t ? n.moved(t) : n.outside(e.item.label()));
	}
	function se(e) {
		if (z || I || F || e.key !== " " || e.defaultPrevented) return;
		let t = x(e.target);
		if (t?.matches("input, textarea, select, [contenteditable]:not([contenteditable=\"false\"])")) return;
		let n = t ? v.get(t) : void 0;
		if (!n || n.text || !n.canDrag({
			input: "keyboard",
			target: n.handle
		})) return;
		e.preventDefault(), e.stopPropagation(), ye(n.element.ownerDocument.defaultView ?? window);
		let r = k(n.element);
		Se(n, -1, r.left + r.width / 2, r.top + r.height / 2, "SNAP");
	}
	function ce(e) {
		let t = x(e), n = !1;
		for (; t;) {
			let e = v.get(t);
			if (e) return n && !e.allowInteractive ? null : e;
			t.matches(h) && (n = !0), t = t.parentElement;
		}
		return null;
	}
	function le(e) {
		if (z) return;
		if (U?.(), I?.dropping && !F && I.land?.(), I && I.mode === "SNAP" && !I.dropping) {
			Z("CANCEL");
			return;
		}
		if (I || F || e.pointerType === "mouse" && e.button !== 0) return;
		let n = ce(e.target), i = x(e.target);
		if (!n || !n.canDrag({
			input: e.pointerType || "mouse",
			target: i
		})) return;
		let a = e.pointerType !== "touch" && n.text ? Math.max(0, n.text.hold()) : 0;
		F = {
			item: n,
			pointerId: e.pointerId,
			pointerType: e.pointerType,
			startX: r(e).x,
			startY: r(e).y,
			timer: null,
			held: a > 0
		}, (e.pointerType === "touch" || a > 0) && (F.timer = setTimeout(() => {
			F && Se(F.item, F.pointerId, F.startX, F.startY);
		}, a || t.touchHold)), ye(n.element.ownerDocument.defaultView ?? window);
	}
	function ue(e) {
		if (e.pointerType === "mouse" && e.buttons === 0) F && e.pointerId === F.pointerId ? J() : I && I.mode === "FLUID" && e.pointerId === I.pointerId && !I.dropping && Z("CANCEL");
		else {
			if (F && e.pointerId === F.pointerId) {
				let n = r(e);
				if (Math.hypot(n.x - F.startX, n.y - F.startY) < t.dragDistance) return;
				if (F.pointerType === "touch" || F.held) {
					let e = F.pointerType === "touch" ? void 0 : F.item.text?.axis, t = Math.abs(e === "x" ? n.x - F.startX : n.y - F.startY), r = Math.abs(e === "x" ? n.y - F.startY : n.x - F.startX);
					if (!e || t < 2 * r) {
						J();
						return;
					}
				}
				Se(F.item, F.pointerId, F.startX, F.startY);
			}
			if (I && e.pointerId === I.pointerId && !I.dropping) {
				let t = r(e);
				Ce(t.x, t.y);
			}
		}
	}
	function de(e) {
		F && e.pointerId === F.pointerId ? J() : I && e.pointerId === I.pointerId && !I.dropping && (xe(), Z("DROP"));
	}
	function fe(e) {
		F && e.pointerId === F.pointerId && J(), I && e.pointerId === I.pointerId && !I.dropping && Z("CANCEL");
	}
	function pe(e) {
		let t = I;
		if (t && !t.dropping) {
			if (e.key === "Escape") e.preventDefault(), e.stopPropagation(), Z("CANCEL");
			else if (t.mode === "SNAP") {
				if (e.key === " " || e.key === "Enter") Z("DROP");
				else if (e.key in C) Ee(t, C[e.key]);
				else if (e.key !== "Tab") return;
				e.preventDefault(), e.stopPropagation();
			}
		}
	}
	function me(e) {
		I && e.cancelable && e.preventDefault();
	}
	function he(e) {
		(F || I) && e.preventDefault();
	}
	function ge(e) {
		(F || I) && e.preventDefault();
	}
	function _e() {
		J(), I && !I.dropping && Z("CANCEL");
	}
	function K(e) {
		(e.type !== "visibilitychange" || R?.document.visibilityState === "hidden") && _e();
	}
	function ve() {
		if (!I || I.dropping || I.impactFrame !== null) return;
		let e = I.overlay.ownerDocument.defaultView;
		e && (I.impactFrame = e.requestAnimationFrame(() => {
			I && (I.impactFrame = null, I.mode === "SNAP" ? ke(I, !1) : Te(I));
		}));
	}
	function ye(e) {
		R !== e && (q(), R = e, H = L.get(e.document)?.liveRegion ?? null, e.addEventListener("pointermove", ue, !0), e.addEventListener("pointerup", de, !0), e.addEventListener("pointercancel", fe, !0), e.addEventListener("touchmove", me, {
			capture: !0,
			passive: !1
		}), e.addEventListener("contextmenu", he, !0), e.addEventListener("dragstart", ge, !0), e.addEventListener("keydown", pe, !0), e.addEventListener("blur", _e), e.addEventListener("pagehide", K), e.document.addEventListener("visibilitychange", K), e.addEventListener("scroll", ve, !0));
	}
	function q() {
		let e = R;
		e && (R = null, e.removeEventListener("pointermove", ue, !0), e.removeEventListener("pointerup", de, !0), e.removeEventListener("pointercancel", fe, !0), e.removeEventListener("touchmove", me, !0), e.removeEventListener("contextmenu", he, !0), e.removeEventListener("dragstart", ge, !0), e.removeEventListener("keydown", pe, !0), e.removeEventListener("blur", _e), e.removeEventListener("pagehide", K), e.document.removeEventListener("visibilitychange", K), e.removeEventListener("scroll", ve, !0));
	}
	function J() {
		F && (F.timer && clearTimeout(F.timer), F = null, I || q());
	}
	function be(e, t) {
		U?.();
		let n = (n) => {
			n.pointerId === t && (U?.(), n.type === "pointerup" && xe(e));
		};
		e.addEventListener("pointerup", n, !0), e.addEventListener("pointercancel", n, !0), U = () => {
			U = null, e.removeEventListener("pointerup", n, !0), e.removeEventListener("pointercancel", n, !0);
		};
	}
	function xe(e = I?.overlay.ownerDocument.defaultView ?? R ?? window) {
		let t = (e) => {
			e.preventDefault(), e.stopPropagation();
		};
		e.addEventListener("click", t, {
			capture: !0,
			once: !0
		}), setTimeout(() => e.removeEventListener("click", t, !0), 0);
	}
	function Se(t, r, a, o, s = "FLUID") {
		F?.timer && clearTimeout(F.timer), F = null, e.onBeforeCapture?.({
			draggableId: t.id,
			mode: s
		});
		for (let e of V) e.finish();
		V.clear();
		let c = Ze(t);
		if (!c) {
			q();
			return;
		}
		let l = c.element.ownerDocument, u = l.defaultView ?? window, d = qe(c);
		if (!d) {
			q();
			return;
		}
		B = u.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? !1;
		let f = k(c.element), p = u.getComputedStyle(c.element), h = {
			top: N(p.marginTop),
			left: N(p.marginLeft),
			vertical: N(p.marginTop) + N(p.marginBottom),
			horizontal: N(p.marginLeft) + N(p.marginRight)
		}, g = D(c.element, f), _ = /* @__PURE__ */ new Map(), v = [], y = 0;
		for (let e of i.values()) {
			if (e.type !== c.type || !e.element.isConnected || e.element.ownerDocument !== l || c.element.contains(e.element)) continue;
			let t = Je(e), n = e === d, r = u.getComputedStyle(e.element), i = e.axis === "vertical", a = k(e.element), o = D(e.element, a), s = N(i ? r.rowGap : r.columnGap) * o, p = [], m = [], b = (e, t) => {
				let n = u.getComputedStyle(e), r = D(e, t);
				return {
					start: i ? t.top : t.left,
					size: i ? t.height : t.width,
					marginStart: N(i ? n.marginTop : n.marginLeft) * r,
					marginEnd: N(i ? n.marginBottom : n.marginRight) * r
				};
			};
			t.forEach((t, n) => {
				let r = t === c ? f : k(t.element);
				e.still || m.push(b(t.element, r)), t === c ? y = n : p.push({
					item: t,
					original: n,
					box: r
				});
			});
			let x = P(e.element).map((e) => {
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
				paddingStart: N(i ? r.paddingTop : r.paddingLeft) * o,
				scrollers: x,
				hitArea: e.hitArea ? {
					element: e.hitArea,
					scrollers: P(e.hitArea)
				} : null,
				slots: p,
				room: e.still ? 0 : (i ? f.height + h.vertical * g : f.width + h.horizontal * g) + s,
				marginStart: (i ? h.top : h.left) * g,
				isHome: n,
				flow: e.still ? null : ee(r, a, o, i, m, n ? m[y] : b(c.element, f))
			});
		}
		let b = v.find((e) => e.isHome);
		if (!b) {
			q();
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
		let S = b.registration.renderPreview?.(c.element) ?? e.renderPreview?.(c.element), C = S ? null : ne(c.element), w = S ?? C.clone;
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
			transform: O(0, 0, g),
			transition: "none",
			willChange: "transform",
			pointerEvents: "none"
		}), x.appendChild(w), e.onPreview?.(w, c.element), l.body.appendChild(x);
		for (let [e, t, n] of C?.scrolled ?? []) e.scrollLeft = t, e.scrollTop = n;
		let T = c.element;
		I = {
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
		}, T.style.visibility = "hidden", T.setAttribute("data-drag-source", ""), b.registration.element.setAttribute("data-drag-over", ""), l.documentElement.setAttribute("data-drag-active", c.type), e.onDragStart?.($(I));
		let E = ae(I);
		E && G(n.lifted(E));
	}
	function Ce(e, t) {
		let n = I;
		if (!n) return;
		n.lastX = e, n.lastY = t;
		let r = n.lockAxis === "y" ? 0 : e - n.startX, i = n.lockAxis === "x" ? 0 : t - n.startY;
		n.preview.style.transform = O(r, i, n.previewScale), Te(n), Re(n);
	}
	function Y(e, t) {
		let n = e.overlay.ownerDocument.defaultView ?? window, r = n.scrollX - e.windowLiftX, i = n.scrollY - e.windowLiftY;
		for (let e of t.scrollers) r += e.element.scrollLeft - e.liftLeft, i += e.element.scrollTop - e.liftTop;
		return {
			x: r,
			y: i
		};
	}
	function we(e, t) {
		if (t.hitArea) return t.hitArea.scrollers.reduce((e, t) => A(e, k(t)), k(t.hitArea.element));
		let n = Y(e, t), r = t.box, i = {
			...r,
			left: r.left - n.x,
			top: r.top - n.y
		};
		return t.scrollers.reduce((e, { element: t }) => A(e, k(t)), i);
	}
	function Te(t) {
		let r = t.lastX, i = t.lastY, a = null, o = Infinity;
		for (let e of t.containers) {
			if (e.registration.isDropDisabled()) continue;
			let n = we(t, e);
			if (!j(n, r, i)) continue;
			let s = n.width * n.height;
			s < o && (a = e, o = s);
		}
		let s = a && t.mode === "FLUID" ? Me(t, a) : null;
		if (s && a) {
			Ne(t, {
				container: a,
				slot: s
			}) && (e.onDragUpdate?.(Ye(t)), G(n.combining(t.item.label(), s.item.label())));
			return;
		}
		let c = Ne(t, null), l = null;
		a && (l = {
			container: a,
			index: Pe(t, a)
		});
		let u = t.destination;
		u?.container === l?.container && u?.index === l?.index ? c && (e.onDragUpdate?.(Ye(t)), oe(t)) : (t.destination = l, Fe(t, u?.container ?? null), t.overlay.ownerDocument.documentElement.toggleAttribute("data-drag-outside", !l), e.onDragUpdate?.(Ye(t)), oe(t));
	}
	function Ee(t, n) {
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
			let e = De(t, r.container, n);
			e && (a = {
				container: e,
				index: Oe(t, e)
			});
		}
		if (!a) return;
		let o = t.destination?.container ?? null;
		t.destination = a, Fe(t, o), ke(t, !0), Ae(t), e.onDragUpdate?.(Ye(t)), oe(t);
	}
	function De(e, t, n) {
		let r = w(we(e, t)), i = null, a = Infinity;
		for (let o of e.containers) {
			if (o === t || o.registration.isDropDisabled()) continue;
			let s = w(we(e, o)), c = (s.x - r.x) * n.x + (s.y - r.y) * n.y;
			if (c <= 1) continue;
			let l = c + (Math.abs((s.x - r.x) * n.y) + Math.abs((s.y - r.y) * n.x)) * 2;
			l < a && (i = o, a = l);
		}
		return i;
	}
	function Oe(e, t) {
		let n = t.registration.axis === "vertical", r = Y(e, t), i = te(e.preview.style.transform), a = n ? e.liftBox.top + i.y + e.liftBox.height / 2 : e.liftBox.left + i.x + e.liftBox.width / 2;
		return t.slots.filter((i) => X(e, t, i) - (n ? r.y : r.x) + (n ? i.box.height : i.box.width) / 2 < a).length;
	}
	function ke(e, n) {
		let r = Ve(e), { duration: i, easing: a } = t.outOfTheWay;
		e.preview.style.transition = n && !B ? `transform ${i}ms ${a}` : "none", e.preview.style.transform = O(r.x, r.y, e.previewScale);
	}
	function Ae(e) {
		let n = e.overlay.ownerDocument.defaultView;
		if (!n) return;
		let r = t.autoScrollEdge, i = (t) => {
			let n = Ve(e), i = e.liftBox.left + n.x, a = e.liftBox.top + n.y;
			return {
				x: Math.min(0, i - r - t.left) + Math.max(0, i + e.liftBox.width + r - t.left - t.width),
				y: Math.min(0, a - r - t.top) + Math.max(0, a + e.liftBox.height + r - t.top - t.height)
			};
		};
		for (let { element: t } of e.destination?.container.scrollers ?? []) {
			let e = i(k(t));
			(e.x || e.y) && t.scrollBy(e.x, e.y);
		}
		let a = i({
			left: 0,
			top: 0,
			width: n.innerWidth,
			height: n.innerHeight
		});
		(a.x || a.y) && n.scrollBy(a.x, a.y), ke(e, !0);
	}
	function je(e, t) {
		let n = t.registration.axis === "vertical", r = n ? e.liftBox.top : e.liftBox.left, i = n ? e.liftBox.height : e.liftBox.width, a = n ? e.lockAxis === "x" ? 0 : e.lastY - e.startY : e.lockAxis === "y" ? 0 : e.lastX - e.startX;
		return {
			start: r + a,
			end: r + a + i
		};
	}
	function Me(e, t) {
		let n = e.destination;
		if (!n || n.container !== t || !t.registration.isCombineEnabled()) return null;
		let r = t.registration.axis === "vertical", i = r ? Y(e, t).y : Y(e, t).x, a = je(e, t);
		return t.slots.find((o, s) => {
			let c = r ? o.box.height : o.box.width, l = s >= n.index, u = X(e, t, o) - i + (l ? t.room : 0), d = c / 4, f = l ? a.end : a.start;
			return f > u + d && f < u + c - d;
		}) ?? null;
	}
	function Ne(e, t) {
		return e.combine?.slot !== t?.slot && (e.combine?.slot.item.element.removeAttribute("data-drag-combine"), t?.slot.item.element.setAttribute("data-drag-combine", ""), e.combine = t, !0);
	}
	function Pe(e, t) {
		let n = t.registration.axis === "vertical", r = Y(e, t), { start: i, end: a } = je(e, t), o = n ? r.y : r.x, s = t.slots.map((r) => X(e, t, r) - o + (n ? r.box.height : r.box.width) / 2), c = s.length;
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
	function X(e, t, n) {
		let r = t.registration.axis === "vertical" ? n.box.top : n.box.left;
		return t.isHome && n.original > e.sourceIndex ? r - t.room : r;
	}
	function Fe(e, t) {
		let n = e.destination, r = /* @__PURE__ */ new Set([e.home]);
		t && r.add(t), n && r.add(n.container);
		for (let t of r) {
			let r = Ie(e, t);
			t.slots.forEach((i, a) => {
				let o = 0;
				r ? o = r.shifts[a] : (t.isHome && i.original > e.sourceIndex && (o -= t.room), n?.container === t && a >= n.index && (o += t.room)), Le(e, i.item.element, o, t);
			});
		}
		let i = n && !n.container.isHome ? n.container : null;
		e.reserved !== i && (e.reserved?.registration.element.style.removeProperty("--drag-reserve"), e.reserved?.registration.element.removeAttribute("data-drag-over"), i && !i.registration.still && i.registration.element.style.setProperty("--drag-reserve", `${i.room}px`), e.reserved = i);
		for (let t of e.containers) n?.container === t ? t.registration.element.setAttribute("data-drag-over", "") : t.registration.element.removeAttribute("data-drag-over");
	}
	function Ie(e, t) {
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
	function Le(n, r, i, a) {
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
			r.style.transition = B ? "none" : `translate ${e}ms ${i}`;
		}
		let u = (s - l) * a.scale;
		e.onMovement?.({
			element: r,
			phase: "drag",
			x: o === "vertical" ? 0 : u,
			y: o === "vertical" ? u : 0
		}), r.style.translate = s === 0 ? "none" : o === "vertical" ? `0 ${s}px` : `${s}px 0`, r.style.setProperty("--drag-shift", `${s}px`);
	}
	function Re(e) {
		if (e.scrollFrame !== null) return;
		let t = e.overlay.ownerDocument.defaultView;
		if (!t) return;
		let n = (r) => {
			if (I !== e || e.dropping) return;
			e.scrollFrame = null;
			let i = e.scrollTime === null ? f : r - e.scrollTime;
			e.scrollTime = r, ze(e, Math.min(2, Math.max(.25, i / f))) ? (Te(e), e.scrollFrame = t.requestAnimationFrame(n)) : e.scrollTime = null;
		};
		e.scrollFrame = t.requestAnimationFrame(n);
	}
	function ze(e, t) {
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
			let n = k(t);
			if (j(n, e.lastX, e.lastY) && (o(t, Be(e, t, n), (e, n) => t.scrollBy(e, n), () => ({
				x: t.scrollLeft,
				y: t.scrollTop
			})), r && i)) return !0;
		}
		return o(n, Be(e, n, {
			left: 0,
			top: 0,
			width: n.innerWidth,
			height: n.innerHeight
		}), (e, t) => n.scrollBy(e, t), () => ({
			x: n.scrollX,
			y: n.scrollY
		})), a;
	}
	function Be(e, n, r) {
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
	async function Z(n) {
		let r = I;
		if (!r || r.dropping) return;
		r.dropping = !0;
		let i = r.overlay.ownerDocument.defaultView ?? window;
		if (r.scrollFrame !== null && i.cancelAnimationFrame(r.scrollFrame), r.impactFrame !== null && i.cancelAnimationFrame(r.impactFrame), n === "DROP" && r.combine) {
			let { container: e, slot: i } = r.combine, a = {
				...$(r),
				destination: null,
				combine: Xe(r),
				reason: n
			}, o = e.registration.axis === "vertical", s = Y(r, e), c = e.slots.indexOf(i), l = X(r, e, i) + (r.destination && c >= r.destination.index ? e.room : 0), u = (o ? i.box.left : l) - s.x - r.liftBox.left, d = (o ? l : i.box.top) - s.y - r.liftBox.top, { maxDuration: f, easing: p } = t.drop;
			if (B) {
				Q(r, a);
				return;
			}
			r.preview.style.transition = `transform ${f}ms ${p}, opacity ${f}ms ${p}`, r.preview.style.transform = O(u, d, r.previewScale * .75), r.preview.style.opacity = "0";
			let m = !1, h = () => {
				m || (m = !0, Q(r, a));
			};
			r.land = h, r.preview.addEventListener("transitionend", h, { once: !0 }), setTimeout(h, f + 50);
			return;
		}
		if (Ne(r, null), n === "CANCEL" && r.mode === "FLUID" && be(i, r.pointerId), n === "DROP" && !r.destination && r.mode === "FLUID" && e.onDropOutside?.($(r), {
			x: r.lastX,
			y: r.lastY
		})) {
			Q(r, {
				...$(r),
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
			}, Fe(r, e);
		}
		let o = null, s = null;
		if (n === "DROP" && e.prepareDrop) {
			r.preparing = !0;
			let c = Ue(r), l = new Map(c.map((e) => [e, e.getBoundingClientRect()])), u = We(r, c);
			for (let [e, t] of r.shifts) e.style.transition = "none", e.style.translate = t.translate;
			r.reserved?.registration.element.style.removeProperty("--drag-reserve");
			try {
				let t = e.prepareDrop({
					...$(r),
					destination: a ? null : Qe(r.destination),
					combine: null,
					reason: n
				}), i = b(t) ? await t : t, s = typeof i == "function" ? i : () => i;
				if (o = s(), I !== r || (o?.isConnected && (r.landing = {
					element: o,
					visibility: o.style.visibility
				}, o.style.visibility = "hidden"), await new Promise((e) => (r.overlay.ownerDocument.defaultView ?? window).requestAnimationFrame(() => e())), I !== r)) return;
				let c = s();
				c !== o && (r.landing && (r.landing.element.style.visibility = r.landing.visibility), o = c, o?.isConnected && (r.landing = {
					element: o,
					visibility: o.style.visibility
				}, o.style.visibility = "hidden"));
			} catch (e) {
				I === r && Q(r, {
					...$(r),
					destination: null,
					combine: null,
					reason: "CANCEL"
				}), y(i, e);
				return;
			}
			s = o?.isConnected ? o.getBoundingClientRect() : null;
			let d = /* @__PURE__ */ new Map();
			r.committed = {
				boxes: /* @__PURE__ */ new Map(),
				scrollX: i.scrollX,
				scrollY: i.scrollY
			};
			for (let e of c) {
				if (!e.isConnected || e === o) continue;
				let t = l.get(e), n = e.getBoundingClientRect();
				Ge(e, u.get(e), n), d.set(e, {
					x: t.left - n.left,
					y: t.top - n.top
				}), r.committed.boxes.set(e, {
					left: n.left,
					top: n.top,
					width: n.width,
					height: n.height
				});
			}
			for (let [e, n] of B ? [] : d) {
				let r = e.parentElement;
				for (; r && !d.has(r);) r = r.parentElement;
				let i = r ? d.get(r) : {
					x: 0,
					y: 0
				}, a = n.x - i.x, o = n.y - i.y;
				if (Math.abs(a) < .01 && Math.abs(o) < .01) continue;
				let s = e.animate([{ translate: `${a}px ${o}px` }, { translate: (e.ownerDocument.defaultView ?? window).getComputedStyle(e).translate }], {
					duration: t.outOfTheWay.duration,
					easing: t.outOfTheWay.easing
				});
				s && (V.add(s), s.addEventListener?.("finish", () => V.delete(s)), s.addEventListener?.("cancel", () => V.delete(s)));
			}
		}
		let c = s ? {
			x: s.left - r.liftBox.left,
			y: s.top - r.liftBox.top
		} : Ve(r), l = te(r.preview.style.transform), d = Math.hypot(c.x - l.x, c.y - l.y), { minDuration: f, maxDuration: p, easing: m } = t.drop, h = !a && !!r.destination?.container.registration.still, g = d < .5 || B || h ? 0 : f + (p - f) * Math.min(d / u, 1), _ = {
			...$(r),
			destination: a || !r.destination ? null : Qe(r.destination),
			combine: null,
			reason: n
		};
		if (g === 0) {
			Q(r, _);
			return;
		}
		r.preview.style.transition = `transform ${g}ms ${m}`, r.preview.style.transform = O(c.x, c.y, r.previewScale);
		let v = !1, x = () => {
			v || (v = !0, Q(r, _));
		};
		r.land = x, r.preview.addEventListener("transitionend", x, { once: !0 }), setTimeout(x, g + 50);
	}
	function Ve(e) {
		let t = e.destination ?? {
			container: e.home,
			index: e.sourceIndex
		}, n = t.container, r = n.registration.axis === "vertical", i = Y(e, n), a = n.slots, o, s = n.registration.still, c = s ? He(n, t.index) : void 0, l = s ? null : Ie(e, n)?.source ?? null;
		if (n.isHome && t.index === e.sourceIndex) o = r ? e.liftBox.top : e.liftBox.left;
		else if (l !== null) o = l;
		else if (c) o = r ? c.box.top : c.box.left;
		else if (s && a.length > 0) {
			let e = a[a.length - 1];
			o = (r ? e.box.top + e.box.height : e.box.left + e.box.width) + n.gap;
		} else if (t.index < a.length) o = X(e, n, a[t.index]);
		else if (a.length > 0) {
			let t = a[a.length - 1], i = r ? e.liftBox.height : e.liftBox.width;
			o = X(e, n, t) + (r ? t.box.height : t.box.width) + n.room - i;
		} else o = (r ? n.box.top : n.box.left) + n.paddingStart + n.marginStart;
		let u = r ? e.liftBox.left - e.home.box.left : e.liftBox.top - e.home.box.top, d = n.isHome ? r ? e.liftBox.left : e.liftBox.top : (r ? n.box.left : n.box.top) + u, f = o - (r ? i.y : i.x), p = d - (r ? i.x : i.y);
		return {
			x: (r ? p : f) - e.liftBox.left,
			y: (r ? f : p) - e.liftBox.top
		};
	}
	function He(e, t) {
		return e.isHome ? e.slots.find((e) => e.original === t) : e.slots[t];
	}
	function Q(t, r) {
		let i = ae(t), a = e.onMovement && !t.preparing ? Ue(t) : [], s = We(t, a);
		try {
			e.onDragEnd?.(r);
		} finally {
			Ke(t);
		}
		let c = t.overlay.ownerDocument.defaultView ?? window;
		a.length && c.requestAnimationFrame(() => {
			for (let e of a) e.isConnected && Ge(e, s.get(e), e.getBoundingClientRect());
		});
		let l = e.onMovement ? t.committed : void 0;
		if (l && c.requestAnimationFrame(() => {
			let e = c.scrollX - l.scrollX, n = c.scrollY - l.scrollY;
			for (let [r, i] of l.boxes) {
				if (!r.isConnected) continue;
				let a = M(r, t.shifts);
				Ge(r, i, {
					...a,
					left: a.left + e,
					top: a.top + n
				});
			}
		}), r.combine && t.combine ? G(n.combined(t.item.label(), t.combine.slot.item.label())) : i && G(r.reason === "DROP" && r.destination ? n.dropped(i) : n.returned(i)), t.mode === "SNAP") {
			for (let e of o.values()) if (e.id === t.item.id && e.element.isConnected) {
				e.handle.focus({ preventScroll: !0 });
				break;
			}
		}
	}
	function Ue(e) {
		return [...new Set(e.containers.flatMap((e) => e.slots.map((e) => e.item.element)))].filter((e) => e.isConnected);
	}
	function We(e, t) {
		return new Map(t.map((t) => [t, M(t, e.shifts)]));
	}
	function Ge(t, n, r) {
		let i = r.left - n.left, a = r.top - n.top;
		(Math.abs(i) > 1 || Math.abs(a) > 1) && e.onMovement?.({
			element: t,
			phase: "drop",
			x: i,
			y: a
		});
	}
	function Ke(e) {
		let t = e.item.element, n = e.overlay.ownerDocument.defaultView ?? window;
		for (let [t, n] of e.shifts) t.style.transition = "none", t.style.translate = n.translate, t.style.removeProperty("--drag-shift");
		let r = [...e.shifts];
		n.requestAnimationFrame(() => {
			n.requestAnimationFrame(() => {
				for (let [e, t] of r) e.style.transition = t.transition;
			});
		}), e.landing && (e.landing.element.style.visibility = e.landing.visibility), t.style.visibility = e.sourceVisibility, t.removeAttribute("data-drag-source"), e.combine?.slot.item.element.removeAttribute("data-drag-combine"), e.reserved?.registration.element.style.removeProperty("--drag-reserve");
		for (let t of e.containers) t.registration.element.removeAttribute("data-drag-over");
		e.overlay.remove(), t.ownerDocument.documentElement.removeAttribute("data-drag-active"), t.ownerDocument.documentElement.removeAttribute("data-drag-outside"), I = null, q();
	}
	function qe(e) {
		let t = e.element.parentElement;
		for (; t;) {
			let n = i.get(t);
			if (n && n.type === e.type) return n;
			t = t.parentElement;
		}
		return null;
	}
	function Je(e) {
		let t = [];
		for (let n of o.values()) n.type === e.type && n.element.isConnected && qe(n) === e && t.push(n);
		return t.sort((e, t) => e.element.compareDocumentPosition(t.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
	}
	function $(e) {
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
	function Ye(e) {
		return {
			...$(e),
			destination: e.destination && !e.combine ? Qe(e.destination) : null,
			combine: Xe(e)
		};
	}
	function Xe(e) {
		return e.combine ? {
			draggableId: e.combine.slot.item.id,
			droppableId: e.combine.container.registration.id
		} : null;
	}
	function Ze(e) {
		if (e.element.isConnected && o.get(e.element) === e) return e;
		for (let t of o.values()) if (t.id === e.id && t.type === e.type && t.element.isConnected) return t;
		return null;
	}
	function Qe(e) {
		return {
			droppableId: e.container.registration.id,
			index: e.index
		};
	}
	return {
		container: re,
		item: ie,
		isDragging: () => I !== null,
		cancel: () => {
			J(), I && !I.dropping && Z("CANCEL");
		},
		destroy: () => {
			z = !0, J(), U?.(), I && !I.preparing && Ke(I);
			for (let { view: e, instructions: t, liveRegion: n } of L.values()) e.removeEventListener("pointerdown", le, !0), e.removeEventListener("keydown", se, !0), t.remove(), n.remove();
			L.clear(), i.clear(), o.clear(), v.clear();
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
function E(e, t) {
	let n = e.getAttribute("aria-label") ?? t.getAttribute("aria-label") ?? e.textContent?.replace(/\s+/g, " ").trim() ?? "";
	return n.length > 60 ? `${n.slice(0, 59)}…` : n || "Item";
}
function D(e, t) {
	if (e.offsetWidth <= 0 || t.width <= 0) return 1;
	let n = t.width / e.offsetWidth;
	return Math.abs(n - 1) < .02 ? 1 : n;
}
function O(e, t, n) {
	return `translate3d(${e}px, ${t}px, 0)${n === 1 ? "" : ` scale(${n})`}`;
}
function k(e) {
	let t = e.getBoundingClientRect();
	return {
		left: t.left,
		top: t.top,
		width: t.width,
		height: t.height
	};
}
function A(e, t) {
	let n = Math.max(e.left, t.left), r = Math.max(e.top, t.top), i = Math.min(e.left + e.width, t.left + t.width), a = Math.min(e.top + e.height, t.top + t.height);
	return {
		left: n,
		top: r,
		width: Math.max(0, i - n),
		height: Math.max(0, a - r)
	};
}
function j(e, t, n) {
	return t >= e.left && t < e.left + e.width && n >= e.top && n < e.top + e.height;
}
function ee(e, t, n, r, i, a) {
	let s = r && /^(block|flow-root|list-item)$/.test(e.display), c = s ? 0 : N(r ? e.rowGap : e.columnGap) * n, l = (r ? t.top : t.left) + (N(r ? e.borderTopWidth : e.borderLeftWidth) + N(r ? e.paddingTop : e.paddingLeft)) * n, u = i[0], d = {
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
function M(e, t) {
	let n = k(e), r = e.ownerDocument.defaultView ?? window, i = (e) => {
		if (!e || e === "none") return {
			x: 0,
			y: 0
		};
		let [t = "0", n = "0"] = e.trim().split(/\s+/);
		return {
			x: N(t),
			y: N(n)
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
function N(e) {
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
function P(e) {
	let t = [], n = e.ownerDocument.defaultView, r = e.parentElement;
	for (; r && r !== e.ownerDocument.body && r !== e.ownerDocument.documentElement;) {
		let e = n?.getComputedStyle(r), i = (e) => e === "auto" || e === "scroll" || e === "overlay";
		e && (i(e.overflowY) || i(e.overflowX)) && t.push(r), r = r.parentElement;
	}
	return t;
}
var F = /^(style|script|template|link|meta|title|head)$/;
function ne(e) {
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
		else if (u.style && !F.test(t.localName)) {
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
var I = 400, L = 400, R = 8, z = "button, input, textarea, select, video, audio, .aa-caption, [data-aa-interactive]", B = (e, t) => {
	let n = e?.closest(z);
	return !!n && t.contains(n);
}, V = [
	"--aa-unit",
	"--aa-sf",
	"--aa-rule-color",
	"--aa-gap",
	"--aa-indent"
];
function H(i, a, o) {
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
	}, h = null, g = null, _ = () => Array.from(l.children), y = () => !i.readOnly && a.menus !== !1 && (i.reordering || i.placing), b = () => y() && i.placing;
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
	}, O = !1, k = v({
		inheritProperties: V,
		onDragStart: (e) => {
			let t = _()[e.source.index], n = x?.selected ?? [], r = t && n.includes(t) ? n : [];
			E = _().map((e) => e.getBoundingClientRect()), D = {
				x: d.scrollX,
				y: d.scrollY
			}, S = {
				caret: r.length ? null : i.selection(),
				group: r,
				from: e.source.index
			}, u.addEventListener("pointermove", j, {
				capture: !0,
				signal: c
			});
			for (let e of r) e !== t && e.setAttribute("data-ghost", "");
			l.setAttribute("data-dragging", ""), u.addEventListener("selectionchange", T, { signal: c }), T();
		},
		prepareDrop: (e) => {
			O = !0;
			let t = _()[e.source.index], n = t?.textContent, r = t?.querySelector(":scope > .aa-atom")?.dataset.source, i = l;
			for (let e = l.parentElement; e; e = e.parentElement) e.classList.contains("aa") && (i = e);
			let a = new Set(i.querySelectorAll(".aa-block")), o = g && { ...g }, s = h && { ...h }, c = l.parentElement?.classList.contains("aa-columns") ? l.parentElement : null, u = c ? Array.from(i.querySelectorAll(".aa-columns")).indexOf(c) : -1, d = e.source.index, f = s ? s.index - +(d < s.index) : -1;
			return A(e), () => {
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
			O || A(e), O = !1;
		}
	});
	function A(e) {
		let { caret: t, group: n } = S ?? {
			caret: null,
			group: []
		};
		S = null, E = [], u.removeEventListener("pointermove", j, !0);
		let r = h, a = g;
		h = null, g = null, p.hidden = !0, p.removeAttribute("data-swap");
		for (let e of l.querySelectorAll(":scope > [data-ghost]")) e.removeAttribute("data-ghost");
		l.removeAttribute("data-dragging"), u.removeEventListener("selectionchange", T);
		let o = _(), s = e.source.index, c = e.destination?.index;
		if (!(e.reason === "DROP" && r && n.length <= 1 && b() && N(s, r.index, r.at))) {
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
	function j(e) {
		if (!S || S.group.length > 1 || !b() || ee(e)) return;
		let t = parseFloat(getComputedStyle(l).getPropertyValue("--aa-unit")) || 20, r = d.scrollX - D.x, i = d.scrollY - D.y, a = e.clientX + r, o = e.clientY + i, s = n(E, S.from, {
			x: a,
			y: o
		}, t), c = s?.index ?? -1, u = s?.at, f = s?.rect, g = f ? new DOMRect(f.left - r, f.top - i, f.width, f.height) : null;
		!u || !g ? (h = null, p.hidden = !0) : (p.removeAttribute("data-swap"), h = {
			index: c,
			at: u
		}, m(u === "start" ? g.left : g.right, g.top, g.height));
	}
	function ee(e) {
		g = null;
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
			return g = { swap: u }, h = null, p.setAttribute("data-swap", ""), m(e.left, e.top, e.height, `${e.width}px`), !0;
		}
		let d = c.map((e) => e.getBoundingClientRect()), f = d.filter((t) => t.left + t.width / 2 < e.clientX).length;
		if (p.hidden = !0, s && f === o) return !0;
		g = { slot: f };
		let _ = d.length > 1 ? d[1].left - d[0].right : 2 * n, v = f === 0 ? d[0].left - _ / 2 : f === d.length ? d[d.length - 1].right + _ / 2 : (d[f - 1].right + d[f].left) / 2;
		return h = null, m(v, r.top, r.height), !0;
	}
	function M(e) {
		let n = t(i.value)[_().indexOf(e)];
		return !!n && /^(?:!\[[^\]\n]*\]\([^)\n]*\)\s*)+$/.test(n.source.trim());
	}
	function N(n, r, a) {
		if (t(i.value).length !== _().length) return !1;
		let o = e(i.value, n, r, a);
		return o ? (i.replace(o.start, o.end, o.text), !0) : !1;
	}
	d.addEventListener("pointerdown", (e) => {
		let t = e.target?.nodeType === 1 ? e.target : null, n = t?.closest?.(".aa-block"), r = !!n && H === n;
		if (U(), !n || n.parentElement !== l) {
			x = null;
			return;
		}
		F();
		let i = _().filter((e) => e.hasAttribute("data-selected")), a = i.includes(n) ? i : [];
		x = {
			block: n,
			mouse: e.pointerType === "mouse" && e.button === 0,
			plain: !e.shiftKey && !e.altKey && !e.metaKey && !e.ctrlKey,
			own: B(t, n),
			inSelection: C(e.clientX, e.clientY),
			selected: a,
			grabbed: r,
			x: e.clientX,
			y: e.clientY
		}, (a.length || r || M(n)) && x.mouse && x.plain && !x.own && !x.inSelection && y() && e.preventDefault();
	}, {
		capture: !0,
		signal: c
	});
	let te = 0, P = /* @__PURE__ */ new Map();
	function F() {
		for (let [e, t] of P) e.parentElement !== l && (t(), P.delete(e));
		for (let e of _()) !P.has(e) && e.classList.contains("aa-block") && P.set(e, k.item({
			element: e,
			id: `aa-block-${++te}`,
			type: "aa-block",
			text: {
				hold: () => x?.block === e && (x.selected.length || x.grabbed || M(e)) ? 0 : 400,
				axis: "y"
			},
			canDrag: ({ input: t }) => t === "mouse" && y() && !!x && x.block === e && x.mouse && x.plain && !x.own && !x.inSelection
		}));
	}
	F();
	let ne = new MutationObserver(F);
	ne.observe(l, { childList: !0 });
	let I = (e) => {
		e.detail > 1 && !k.isDragging() && k.cancel();
	}, L = (e) => {
		let t = x;
		x = null, !(!(t?.selected.length || t?.grabbed) || t.inSelection || k.isDragging() || S || !y() || e.type !== "pointerup") && Math.hypot(e.clientX - t.x, e.clientY - t.y) < 5 && w(e.clientX, e.clientY);
	};
	l.addEventListener("mousedown", I, {
		capture: !0,
		signal: c
	}), d.addEventListener("pointerup", L, {
		capture: !0,
		signal: c
	}), d.addEventListener("pointercancel", L, {
		capture: !0,
		signal: c
	});
	let z = null, H = null;
	function U() {
		z && clearTimeout(z.timer), z = null, H?.removeAttribute("data-grab"), H = null;
	}
	l.addEventListener("pointermove", (e) => {
		if (e.pointerType !== "mouse" || e.buttons || k.isDragging() || !y()) {
			U();
			return;
		}
		let t = e.target?.nodeType === 1 ? e.target : null, n = t?.closest?.(".aa-block");
		if (!n || n.parentElement !== l || B(t, n)) {
			U();
			return;
		}
		if (z?.block === n && Math.hypot(e.clientX - z.x, e.clientY - z.y) < R) return;
		U();
		let r = setTimeout(() => {
			z?.block === n && y() && (H = n, n.setAttribute("data-grab", ""));
		}, 400);
		z = {
			block: n,
			x: e.clientX,
			y: e.clientY,
			timer: r
		};
	}, { signal: c }), l.addEventListener("pointerleave", U, { signal: c }), l.addEventListener("keydown", U, { signal: c });
	let re = (e) => {
		let t = _().findIndex((t) => {
			let n = t.getBoundingClientRect();
			return e < n.top + n.height / 2;
		});
		return t < 0 ? l.children.length : t;
	}, ie = (e) => {
		let t = _(), n = t[e], r = t[e - 1];
		if (e < 0 || !n && !r) {
			f.hidden = !0;
			return;
		}
		let i = (n ?? r).getBoundingClientRect(), a = n && r ? (r.getBoundingClientRect().bottom + i.top) / 2 : n ? i.top : i.bottom;
		f.style.left = `${i.left}px`, f.style.top = `${a}px`, f.style.width = `${i.width}px`, f.hidden = !1;
	}, W = -1, G = (e) => !i.readOnly && i.placing && !!a.onFiles && Array.from(e.dataTransfer?.types ?? []).includes("Files");
	return l.addEventListener("aa-movement-change", () => {
		k.cancel(), x = null, U(), h = null, g = null, p.hidden = !0, f.hidden = !0, W = -1, l.toggleAttribute("data-movable", y());
	}, { signal: c }), l.addEventListener("dragover", (e) => {
		G(e) && (e.preventDefault(), W = re(e.clientY), ie(W));
	}, { signal: c }), l.addEventListener("dragleave", (e) => {
		l.contains(e.relatedTarget) || (f.hidden = !0, W = -1);
	}, { signal: c }), l.addEventListener("drop", (e) => {
		f.hidden = !0;
		let t = W;
		if (W = -1, t < 0 || !G(e) || !e.dataTransfer?.files.length) return;
		e.preventDefault(), e.stopImmediatePropagation();
		let n = _(), r = n[t] ?? n[n.length - 1];
		r.focus({ preventScroll: !0 }), d.getSelection()?.collapse(r, n[t] ? 0 : r.childNodes.length), a.onFiles(Array.from(e.dataTransfer.files));
	}, {
		capture: !0,
		signal: c
	}), () => {
		s.abort(), ne.disconnect(), k.destroy(), P.clear(), S = null, x = null, f.remove(), p.remove(), l.removeAttribute("data-movable"), l.removeAttribute("data-dragging"), U();
	};
}
//#endregion
export { I as HOLD, L as REST, H as createDragging };

