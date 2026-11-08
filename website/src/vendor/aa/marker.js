//#region src/marker.ts
var e = (e, t, n, r, i, a, o = [7, 11], s = t) => `
  <filter id="${e}" x="-${t}%" y="-${s}%" width="${100 + 2 * t}%" height="${100 + 2 * s}%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="${n}" numOctaves="2" seed="${o[0]}" result="grain"/>
    <feColorMatrix in="grain" type="luminanceToAlpha" result="ga"/>
    <feComposite in="SourceGraphic" in2="ga" operator="arithmetic" k1="0" k2="1" k3="${r}" k4="0" result="inked"/>
    <feTurbulence type="fractalNoise" baseFrequency="${i}" numOctaves="2" seed="${o[1]}" result="warp"/>
    <feDisplacementMap in="inked" in2="warp" scale="${a}" xChannelSelector="R" yChannelSelector="G"/>
  </filter>`, t = e("aa-marker", 8, .55, -.3, .11, 2.6) + e("aa-marker-fine", 12, 1.1, -.3, .22, 1.3) + e("aa-marker-rule", 8, .72, -.12, .07, .6, [5, 3], 50);
function n(e) {
	let t = e >>> 0 || 1;
	return () => (t ^= t << 13, t ^= t >>> 17, t ^= t << 5, (t >>> 0) / 4294967296);
}
function r(e, t) {
	let r = n(e), i = Array.from({ length: 3 }, (e, n) => ({
		frequency: (.6 + r()) / t / (n + 1),
		phase: r() * Math.PI * 2,
		weight: 1 / (n + 1)
	})), a = i.reduce((e, t) => e + t.weight, 0);
	return (e) => i.reduce((t, n) => t + Math.sin(e * n.frequency * Math.PI * 2 + n.phase) * n.weight, 0) / a;
}
function i(e, t) {
	if (e.length < 2) return e;
	let n = [];
	for (let r = 0; r < e.length - 1; r++) {
		let i = e[Math.max(0, r - 1)], a = e[r], o = e[r + 1], s = e[Math.min(e.length - 1, r + 2)], c = Math.max(1, Math.ceil(Math.hypot(o.x - a.x, o.y - a.y) / t));
		for (let e = 0; e < c; e++) {
			let t = e / c, r = t * t, l = r * t;
			n.push({
				x: .5 * (2 * a.x + (-i.x + o.x) * t + (2 * i.x - 5 * a.x + 4 * o.x - s.x) * r + (-i.x + 3 * a.x - 3 * o.x + s.x) * l),
				y: .5 * (2 * a.y + (-i.y + o.y) * t + (2 * i.y - 5 * a.y + 4 * o.y - s.y) * r + (-i.y + 3 * a.y - 3 * o.y + s.y) * l)
			});
		}
	}
	return n.push(e[e.length - 1]), n;
}
var a = (e) => Math.round(e * 10) / 10;
function o(e, t, o, { offset: s = 0, whole: c = !1 } = {}) {
	let l = i(e, 3);
	if (l.length < 2) return [];
	let u = n(o), d = r(Math.floor(u() * 1e9), 60), f = r(Math.floor(u() * 1e9), 60), p = r(Math.floor(u() * 1e9), 140), m = [0];
	for (let e = 1; e < l.length; e++) m.push(m[e - 1] + Math.hypot(l[e].x - l[e - 1].x, l[e].y - l[e - 1].y));
	let h = m[m.length - 1], g = c ? Infinity : 90 + u() * 50, _ = [];
	for (let e = 0; e < h - 3; e += g - 6) {
		let n = Math.min(h, e + g), r = [], i = [], o = t * .35;
		for (let a = 0; a < l.length; a++) {
			let c = m[a];
			if (c < e - o || c > n + o) continue;
			let u = l[Math.max(0, a - 1)], h = l[Math.min(l.length - 1, a + 1)], g = h.x - u.x, _ = h.y - u.y, v = Math.hypot(g, _) || 1, y = -_ / v, b = g / v, x = p(c) * t * .08 + s, S = .86 + .14 * Math.min(1, (c - e + o) / (t * 1.5), (n + o - c) / (t * 1.5)), C = t / 2 * S, w = C * (1 + d(c) * .14) + x, T = C * (1 + f(c) * .14) - x;
			c >= e && c <= n + o && r.push({
				x: l[a].x + y * w,
				y: l[a].y + b * w
			}), c >= e - o && c <= n && i.push({
				x: l[a].x - y * T,
				y: l[a].y - b * T
			});
		}
		if (r.length < 2 || i.length < 2) continue;
		let c = [...r, ...i.reverse()];
		_.push(`M${c.map((e) => `${a(e.x)} ${a(e.y)}`).join("L")}Z`);
	}
	return _;
}
function s(e, t, n) {
	let i = Math.hypot(t.x - e.x, t.y - e.y), o = Math.max(1, Math.round(i / 5)), s = r(n, 80), c = -(t.y - e.y) / (i || 1), l = (t.x - e.x) / (i || 1);
	return `M${Array.from({ length: o + 1 }, (n, r) => {
		let u = r / o, d = s(u * i) * .4;
		return `${a(e.x + (t.x - e.x) * u + c * d)} ${a(e.y + (t.y - e.y) * u + l * d)}`;
	}).join("L")}`;
}
var c = (e, t, n) => n.map((n) => ({
	d: n,
	tone: e,
	opacity: t
}));
function l(e, t, n, r = .86) {
	return [
		...c("body", r, o(e, t, n, { whole: !0 })),
		...c("pass", .3, o(e, t * .45, n + 1, {
			offset: t * .04,
			whole: !0
		})),
		...c("pass", .22, o(e, t * .16, n + 2, {
			offset: -t * .34,
			whole: !0
		}))
	];
}
function u(e, t, n, r, i) {
	let a = (e, t, n) => o([e, t], 1.6, i + n, { whole: !0 });
	return c("body", .3, [
		...a({
			x: e,
			y: t
		}, {
			x: e + n,
			y: t
		}, 1),
		...a({
			x: e,
			y: t + r
		}, {
			x: e + n,
			y: t + r
		}, 2),
		...a({
			x: e,
			y: t
		}, {
			x: e,
			y: t + r
		}, 3),
		...a({
			x: e + n,
			y: t
		}, {
			x: e + n,
			y: t + r
		}, 4)
	]);
}
function d(e, t, r, i) {
	let a = n(i), s = r * .08, l = e + s, u = t + s, d = r - s * 2, f = (e, t, n, r = 0) => {
		let i = (a() - .5) * d * .05;
		return o([{
			x: l - d * .02 + (a() - .5) * d * .04,
			y: u + d * e + i - r * d / 2
		}, {
			x: l + d * 1.02 + (a() - .5) * d * .04,
			y: u + d * e - i + r * d / 2
		}], d * t, n, { whole: !0 });
	}, p = (e, t, n) => o([{
		x: l + d * e + (a() - .5) * d * .04,
		y: u - d * .02
	}, {
		x: l + d * e - (a() - .5) * d * .04,
		y: u + d * 1.02
	}], d * t, n, { whole: !0 }), m = () => Math.floor(a() * 1e9), h = (e, t) => o([e, t], d * .05, m(), { whole: !0 });
	return [
		...c("body", 1, [
			.14,
			.31,
			.48,
			.66,
			.83
		].flatMap((e) => f(e, .38, m()))),
		...c("paper", .05, f(.5, .75, m())),
		...c("paper", .09, f(.3 + a() * .4, .34, m())),
		...c("pass", .05, f(.45 + a() * .1, .78, m())),
		...c("pass", .1, f(.25 + a() * .5, .36, m())),
		...c("pass", .06, f(.5, .9, m(), .35)),
		...c("pass", .12, f(.4 + a() * .2, .5, m(), -.3)),
		...c("pass", .06, p(.3 + a() * .4, .42, m())),
		...c("pass", .08, p(.2 + a() * .6, .3, m())),
		...c("edge", .16, h({
			x: l,
			y: u + d * .02
		}, {
			x: l + d,
			y: u + d * .02
		})),
		...c("edge", .16, h({
			x: l + d * .98,
			y: u
		}, {
			x: l + d * .98,
			y: u + d
		})),
		...c("edge", .16, h({
			x: l + d,
			y: u + d * .98
		}, {
			x: l,
			y: u + d * .98
		})),
		...c("edge", .16, h({
			x: l + d * .02,
			y: u + d
		}, {
			x: l + d * .02,
			y: u
		}))
	];
}
function f(e) {
	let t = Math.imul(e | 0, 2654435761) ^ 1831565813;
	return () => {
		t = t + 1831565813 | 0;
		let e = Math.imul(t ^ t >>> 15, 1 | t);
		return e = e + Math.imul(e ^ e >>> 7, 61 | e) ^ e, ((e ^ e >>> 14) >>> 0) / 4294967296;
	};
}
function p(e, t) {
	let n = f(e), r = Array.from({ length: t + 2 }, () => n() * 2 - 1);
	return (e) => {
		let n = Math.max(0, Math.min(1, e)) * t, i = Math.floor(n), a = n - i;
		return r[i] + (r[i + 1] - r[i]) * (a * a * (3 - 2 * a));
	};
}
var m = (e) => e * e * (3 - 2 * e), h = (e) => e.reduce((t, n, r) => r ? t + Math.hypot(n.x - e[r - 1].x, n.y - e[r - 1].y) : 0, 0);
function g(e, t) {
	if (e.length < 2) return e.slice();
	let n = [0];
	for (let t = 1; t < e.length; t++) n.push(n[t - 1] + Math.hypot(e[t].x - e[t - 1].x, e[t].y - e[t - 1].y));
	let r = n[n.length - 1];
	if (!r) return e.slice();
	let i = [], a = 0;
	for (let o = 0; o < t; o++) {
		let s = r * o / (t - 1);
		for (; a < n.length - 2 && n[a + 1] < s;) a++;
		let c = (s - n[a]) / (n[a + 1] - n[a] || 1);
		i.push({
			x: e[a].x + (e[a + 1].x - e[a].x) * c,
			y: e[a].y + (e[a + 1].y - e[a].y) * c
		});
	}
	return i;
}
function _(e) {
	return e.map((t, n) => {
		let r = e[Math.max(0, n - 1)], i = e[Math.min(e.length - 1, n + 1)], a = i.x - r.x, o = i.y - r.y, s = Math.hypot(a, o) || 1;
		return {
			x: a / s,
			y: o / s
		};
	});
}
function v(e, t) {
	let n = _(e);
	return e.map((r, i) => {
		let a = t(i / (e.length - 1));
		return {
			x: r.x - n[i].y * a,
			y: r.y + n[i].x * a
		};
	});
}
function y(e, t) {
	let n = e.length;
	if (n < 2) return "";
	let { width: r, seed: i } = t, o = t.taperIn ?? .14, s = t.taperOut ?? .08, c = t.startWidth ?? .14, l = t.endWidth ?? .8, u = t.belly ?? .07, d = t.wobble ?? .14, f = t.edge ?? .055 * r + .35, h = t.chisel ?? .35, g = p(7 * i + 1, Math.max(3, Math.round(n / 9))), v = p(13 * i + 2, Math.max(4, Math.round(n / 5))), y = p(17 * i + 3, Math.max(4, Math.round(n / 5))), b = _(e), x = [], S = [];
	e.forEach((e, t) => {
		let i = t / (n - 1), a = 1;
		o > 0 && i < o && (a *= c + (1 - c) * m(i / o)), s > 0 && i > 1 - s && (a *= l + (1 - l) * m((1 - i) / s)), a *= (1 + u * Math.sin(Math.PI * i)) * (1 + d * g(i));
		let p = Math.max(.25, r * a / 2), h = -b[t].y, _ = b[t].x, C = p + f * v(i), w = p + f * y(i);
		x.push({
			x: e.x + h * C,
			y: e.y + _ * C
		}), S.push({
			x: e.x - h * w,
			y: e.y - _ * w
		});
	});
	let C = h * r, w = n - 1;
	return x[w] = {
		x: x[w].x + b[w].x * C,
		y: x[w].y + b[w].y * C
	}, S[0] = {
		x: S[0].x - b[0].x * C * .6,
		y: S[0].y - b[0].y * C * .6
	}, `M${[...x, ...S.reverse()].map((e) => `${a(e.x)} ${a(e.y)}`).join("L")}Z`;
}
var b = (e) => Math.max(16, Math.min(160, Math.round(h(e) / 5)));
function x(e, t) {
	let { width: n, seed: r } = t, i = g(e, b(e)), a = [{
		tone: "body",
		opacity: t.opacity ?? .92,
		d: y(i, t)
	}];
	if (n >= 3.5 && t.core !== !1) {
		let e = p(5 * r + 9, 5);
		a.push({
			tone: "pass",
			opacity: .3,
			d: y(v(i, (t) => e(t) * n * .17), {
				width: n * .45,
				seed: r + 31,
				taperIn: .2,
				taperOut: .16,
				startWidth: .2,
				endWidth: .5,
				edge: .03 * n + .3,
				chisel: .25
			})
		}), a.push({
			tone: "edge",
			opacity: .22,
			d: y(v(i, () => n * .3), {
				width: n * .16,
				seed: r + 57,
				taperIn: .25,
				taperOut: .2,
				startWidth: .15,
				endWidth: .4,
				edge: .5,
				chisel: .15
			})
		});
	}
	return n >= 14 && t.streaks !== !1 && [
		-.22,
		.05,
		.26
	].forEach((e, t) => {
		a.push({
			tone: "paper",
			opacity: .1 + t % 2 * .04,
			d: y(v(i, (r) => e * n * (1 + .15 * Math.sin(5 * r + t))), {
				width: n * (.09 + .04 * t),
				seed: r + 71 + 13 * t,
				taperIn: .3,
				taperOut: .25,
				startWidth: .2,
				endWidth: .3,
				edge: .6,
				chisel: .1
			})
		});
	}), a;
}
function S(e, t) {
	let { width: n, seed: r } = t, i = t.dashLength ?? 3.4 * n, a = t.gap ?? 1.6 * n, o = t.opacity ?? 1, s = g(e, Math.max(48, t.samples ?? b(e))), c = h(s), l = f(101 * r + 5), u = [], d = (e, t) => {
		let i = Math.max(0, Math.floor(e / c * (s.length - 1))), a = Math.min(s.length - 1, Math.ceil(t / c * (s.length - 1)));
		if (a - i < 1) return;
		let d = (l() - .5) * .06, f = Math.cos(d), p = Math.sin(d), m = g(s.slice(i, a + 1), 8), h = m.reduce((e, t) => e + t.x, 0) / m.length, _ = m.reduce((e, t) => e + t.y, 0) / m.length, v = m.map((e) => ({
			x: h + (e.x - h) * f - (e.y - _) * p,
			y: _ + (e.x - h) * p + (e.y - _) * f
		})), b = n * (.85 + .35 * l()), x = [{
			tone: "body",
			opacity: Math.round((.82 + .16 * l()) * o * 100) / 100,
			d: y(v, {
				width: b,
				seed: r + Math.round(e),
				taperIn: .18,
				taperOut: .18,
				startWidth: .55,
				endWidth: .5,
				belly: .05,
				wobble: .08,
				edge: .05 * b + .3,
				chisel: .35
			})
		}];
		l() < .35 && x.push({
			tone: "pass",
			opacity: Math.round(.3 * o * 100) / 100,
			d: y(v, {
				width: b * .5,
				seed: r + Math.round(e) + 7,
				taperIn: .3,
				taperOut: .3,
				startWidth: .3,
				endWidth: .3,
				edge: .4,
				chisel: .2
			})
		}), u.push(x);
	};
	for (let e = .3 * i * l(); e < c - 2;) {
		let t = Math.min(c, e + i * (.8 + .45 * l()));
		d(e, t), e = t + a * (.75 + .5 * l());
	}
	return u;
}
function C(e) {
	let t = 43758.5453 * Math.sin(127.1 * e + 311.7);
	return t - Math.floor(t);
}
//#endregion
export { t as MARKER_FILTERS, C as hashed, S as markerDashes, u as markerFrame, l as markerLine, s as markerRule, d as markerSquare, x as markerStroke, o as markerStrokes, y as ribbon };

