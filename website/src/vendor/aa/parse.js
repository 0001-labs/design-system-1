//#region src/table.ts
function e(e) {
	let t = 0;
	return e.split("\n").flatMap((e, n) => {
		let r = t;
		if (t += e.length + 1, n === 1) return [];
		let i = [-1], a = !1;
		for (let t = 0; t < e.length; t++) e[t] === "\\" ? t++ : (e[t] === "`" && (a = !a), e[t] === "|" && !a && i.push(t));
		i.push(e.length);
		let o = [];
		for (let t = 1; t < i.length; t++) {
			let n = i[t - 1] + 1, a = i[t];
			if ((t === 1 || t === i.length - 1) && !e.slice(n, a).trim()) continue;
			let s = e.slice(n, a), c = n + (s.match(/^[ \t]?/)?.[0].length ?? 0), l = Math.max(c, a - (s.match(/[ \t]?$/)?.[0].length ?? 0));
			o.push({
				text: e.slice(c, l),
				from: r + c,
				to: r + l
			});
		}
		return [o];
	});
}
function t(e) {
	return (e.split("\n")[1] ?? "").replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((e) => {
		let t = e.trim(), n = t.startsWith(":"), r = t.endsWith(":");
		return n && r ? "center" : r ? "end" : n ? "start" : null;
	});
}
function n(e) {
	return (e.split("\n")[1] ?? "").replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((e) => {
		let t = e.trim().replace(/:/g, "").length;
		return t > 3 ? t : null;
	});
}
//#endregion
//#region src/markdown.ts
var r = /^ {0,3}(#{1,6})[ \t]+/, i = /^ *(?:([-*+])|(\d{1,9})[.)])[ \t]+(?:\[([ xX])\][ \t]+)?/, a = /^ {0,3}>[ \t]?/, o = /^ {0,3}(`{3,}|~{3,})/, s = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/, c = [
	"gray",
	"brown",
	"orange",
	"yellow",
	"green",
	"blue",
	"purple",
	"pink",
	"red",
	"white"
], l = /^>\s*\[!([^\]\n]*)\](-)?[ \t]*/;
function u(e) {
	let t = l.exec(e);
	if (!t) return null;
	let n = "", r, i;
	for (let e of t[1].trim().split(/\s+/).filter(Boolean)) {
		let t = e.toLowerCase();
		c.includes(t) ? i = t : /^[a-z]+$/i.test(e) ? n = t : r = e;
	}
	return {
		kind: n,
		icon: r,
		color: i,
		folded: !!t[2],
		length: t[0].length
	};
}
function d(e) {
	return e.icon !== void 0 || e.color !== void 0 || !e.kind;
}
var f = /^\s*<columns>\s*$/, p = /^\s*<\/columns>\s*$/, m = /^\s*<column>\s*$/, h = /^\s*<\/column>\s*$/;
function g(e) {
	let t = [], n = null;
	for (let r of e.replace(/\r\n?/g, "\n").split("\n")) f.test(r) || p.test(r) || (m.test(r) ? (n = [], t.push(n)) : h.test(r) ? n = null : n && n.push(r.replace(/^\t{1,2}/, "")));
	let r = t.map((e) => e.join("\n").replace(/^\n+|\n+$/g, ""));
	return r.length ? r : ["", ""];
}
var _ = /^\s*<table_of_contents\s*\/>\s*$/, v = /^\s*<tabs>\s*$/, y = /^\s*<\/tabs>\s*$/, b = /^\s*<tab\b([^>]*)>\s*$/, x = /^\s*<\/tab>\s*$/, S = (e) => e.replace(/&quot;/g, "\"").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
function ee(e) {
	let t = [], n = null;
	for (let r of e.replace(/\r\n?/g, "\n").split("\n")) {
		if (v.test(r) || y.test(r)) continue;
		let e = b.exec(r);
		if (e) {
			let r = {};
			for (let t of e[1].matchAll(/([a-z]+)="([^"]*)"/g)) r[t[1]] = S(t[2]);
			n = {
				name: r.name ?? "",
				...r.icon ? { icon: r.icon } : {},
				content: "",
				lines: []
			}, t.push(n);
		} else x.test(r) ? n = null : n && n.lines.push(r.replace(/^\t{1,2}/, ""));
	}
	let r = t.map(({ lines: e, ...t }) => ({
		...t,
		content: e.join("\n").replace(/^\n+|\n+$/g, "")
	}));
	return r.length ? r : [{
		name: "",
		content: ""
	}];
}
function C(e, t) {
	let n = o.exec(e);
	return !!n && n[1][0] === t[0] && n[1].length >= t.length && !e.slice(n[0].length).trim();
}
function te(e) {
	return !!e.trim() && !o.test(e) && !s.test(e) && !r.test(e) && !i.test(e) && !a.test(e) && !f.test(e) && !v.test(e) && !_.test(e);
}
function ne(e) {
	let t = e.replace(/\r\n?/g, "\n").split("\n"), n = [], c = 0;
	for (let e of t) n.push(c), c += e.length + 1;
	let l = [], m = (e, r, i, a = {}) => {
		l.push({
			kind: e,
			source: t.slice(r, i + 1).join("\n"),
			prefix: 0,
			...a,
			start: n[r]
		});
	}, h = 0;
	for (; h < t.length;) {
		let e = t[h];
		if (e.trim() === "$$") {
			let n = h + 1;
			for (; n < t.length && t[n].trim() !== "$$";) n++;
			m("equation", h, Math.min(n, t.length - 1), { prefix: e.length }), h = n + 1;
			continue;
		}
		if (h + 1 < t.length && e.includes("|") && /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(t[h + 1])) {
			let e = h + 1;
			for (; e + 1 < t.length && t[e + 1].trim() && t[e + 1].includes("|");) e++;
			m("table", h, e), h = e + 1;
			continue;
		}
		if (f.test(e)) {
			let n = h + 1;
			for (; n < t.length && !p.test(t[n]);) n++;
			m("columns", h, Math.min(n, t.length - 1), { prefix: e.length }), h = n + 1;
			continue;
		}
		if (_.test(e)) {
			m("toc", h, h), h++;
			continue;
		}
		if (v.test(e)) {
			let n = h + 1;
			for (; n < t.length && !y.test(t[n]);) n++;
			m("tabs", h, Math.min(n, t.length - 1), { prefix: e.length }), h = n + 1;
			continue;
		}
		let n = o.exec(e);
		if (n) {
			let r = h + 1;
			for (; r < t.length && !C(t[r], n[1]);) r++;
			m("code", h, Math.min(r, t.length - 1), { prefix: e.length }), h = r + 1;
			continue;
		}
		if (!e.trim()) {
			h++;
			continue;
		}
		if (s.test(e)) {
			m("divider", h, h, { prefix: e.length }), h++;
			continue;
		}
		let c = r.exec(e);
		if (c) {
			m("heading", h, h, {
				level: c[1].length,
				prefix: c[0].length
			}), h++;
			continue;
		}
		let g = i.exec(e);
		if (g) {
			let t = /^ */.exec(e)[0].length, n = l[l.length - 1], r = 0;
			t && n?.kind === "bullet" ? r = t > (n.indent ?? 0) ? (n.depth ?? 0) + 1 : [...l].reverse().find((e) => e.kind === "bullet" && (e.indent ?? 0) <= t)?.depth ?? 1 : t && (r = Math.floor(t / (g[2] ? 3 : 2))), m("bullet", h, h, {
				prefix: g[0].length,
				indent: t,
				depth: r,
				checked: g[3] === void 0 ? void 0 : g[3] !== " ",
				number: g[2] ? Number(g[2]) : void 0
			}), h++;
			continue;
		}
		if (a.test(e)) {
			let n = h;
			for (; n + 1 < t.length && a.test(t[n + 1]);) n++;
			let r = u(e), i = r ? /^(#{1,6})\s+/.exec(e.slice(r.length)) : null;
			m(r ? "callout" : "quote", h, n, r ? {
				level: i?.[1].length,
				prefix: r.length + (i?.[0].length ?? 0),
				callout: r.kind,
				folded: r.folded,
				...r.icon === void 0 ? {} : { icon: r.icon },
				...r.color ? { color: r.color } : {},
				...d(r) ? { box: !0 } : {}
			} : { prefix: a.exec(e)[0].length }), h = n + 1;
			continue;
		}
		let b = h;
		for (; b + 1 < t.length && te(t[b + 1]);) b++;
		m("paragraph", h, b), h = b + 1;
	}
	l.length || l.push({
		kind: "paragraph",
		source: "",
		prefix: 0,
		start: 0
	});
	let g = /^\n+/.exec(e)?.[0] ?? "", b = e.length > g.length ? /\n+$/.exec(e)?.[0] ?? "" : "", x = l[0], S = l[l.length - 1];
	return g && x.kind === "paragraph" && (x.source = g + x.source, x.start = 0), b && S.kind === "paragraph" && (S.source += b), l;
}
function re(e) {
	let t = "";
	return e.forEach((n, r) => {
		r && (t += e[r - 1].kind === "bullet" && n.kind === "bullet" ? "\n" : "\n\n"), t += n.source;
	}), t;
}
function w(e) {
	let t = e.source.split("\n");
	return t.length > 1 && C(t[t.length - 1], o.exec(t[0])[1]);
}
function ie(e, t) {
	if (e.kind !== "code" || !w(e)) return;
	let n = e.source.slice(0, e.prefix).replace(/^ {0,3}(`{3,}|~{3,})/, "").trim().toLowerCase().split(/\s+/)[0];
	return n ? t.find((e) => e.fence?.toLowerCase() === n) : void 0;
}
function T(e, t, n) {
	let r = new RegExp(t.source, t.flags.replace(/[gy]/g, "") + "y");
	return {
		name: e,
		match(e, t) {
			r.lastIndex = t;
			let i = r.exec(e);
			return i && i[0].length && (!n || n(i)) ? i[0].length : 0;
		}
	};
}
var E = [T("image", /!\[[^\]\n]*\]\([^\s()]+(?: "w\d+")?\)/), T("equation", /\$(?!\$)(?:\\.|[^$\n])+\$/)], D = /_background$/, O = /<u>|<span color="([a-z_]+)">/y, ae = String.raw`\[((?:\\.|[^[\]\\])*)\]\(\s*(<(?:\\.|[^<>\\\n])*>|(?:\\.|[^\s()\\]|\((?:\\.|[^\s()\\])*\))*)(?:\s+("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^()\\])*\)))?\s*\)`, k = new RegExp(ae, "y"), oe = /^[\s\u200b-\u200d\u2060\ufeff]*$/u, se = /(?:https?:\/\/|www\.)[^\s<>()]*[^\s<>().,;:!?'"]/g, ce = /[!-/:-@[-`{-~]/, A = (e) => e.replace(/\\([!-/:-@[-`{-~])/g, "$1");
function le(e, t) {
	let [n, r, i, a] = e, o = a ? A(a.slice(1, -1)) : "", s = !oe.test(o), c = A(i.replace(/^<([^]*)>$/, "$1")), l = `(${i}${s ? ` ${a}` : ""})`;
	return {
		words: r,
		href: c,
		close: t + 1 + r.length,
		end: t + n.length,
		...s ? { title: o } : {},
		...l === `(${c})` ? {} : { linkSource: l }
	};
}
var j = (e) => !!e && (/[A-Za-z0-9]/.test(e) || e > "" && /[\p{L}\p{N}]/u.test(e)), M = (e) => !e || /\s/.test(e), N = {
	"*": {
		one: "italic",
		two: "bold"
	},
	_: {
		one: "italic",
		two: "bold"
	},
	"~": { two: "strike" },
	"=": { two: "highlight" }
};
function ue(e, t, n, r, i) {
	let a = [], o = t, s = e.lastIndexOf("\n", t - 1) + 1, c = null, l = -1, u = -1, d = null, f = () => {
		if (c === null) {
			let t = e.indexOf("\n", s);
			c = e.slice(s, t < 0 ? e.length : t);
		}
		return c;
	};
	for (; o < n;) {
		if (o === l) {
			a.push({
				type: "link-end",
				at: o,
				end: u,
				group: d.group
			}), o = u, l = -1, d = null;
			continue;
		}
		let p = e[o], m = l >= 0 ? l : n;
		if (p === "\n") {
			let t = i?.(o + 1) ?? 0;
			a.push({
				type: "break",
				at: o,
				prefix: t
			}), o += 1 + t, s = e.lastIndexOf("\n", o - 1) + 1, c = null;
		} else if (p === "\\" && o + 1 < m && ce.test(e[o + 1])) a.push({
			type: "escape",
			at: o
		}), o += 2;
		else if (p === "`") {
			let t = 1;
			for (; e[o + t] === "`";) t++;
			let n = "`".repeat(t), r = e.indexOf(n, o + t);
			for (; r >= 0 && r + t < m && e[r + t] === "`";) {
				let t = r;
				for (; e[t] === "`";) t++;
				r = e.indexOf(n, t);
			}
			if (r >= 0 && r + t <= m && !(i && e.slice(o, r).includes("\n"))) {
				a.push({
					type: "code",
					at: o,
					ticks: t,
					close: r
				}), o = r + t;
				continue;
			}
			o += t;
		} else {
			if (l < 0 && r.length) {
				let e = 0, t = "";
				for (let i of r) {
					if (e = i.match(f(), o - s), e && o + e <= n) {
						t = i.name;
						break;
					}
					e = 0;
				}
				if (e) {
					a.push({
						type: "atom",
						at: o,
						length: e,
						name: t
					}), o += e;
					continue;
				}
			}
			if (p === "[" && l < 0) {
				k.lastIndex = o;
				let t = k.exec(e);
				if (t && o + t[0].length <= n) {
					let { words: e, ...n } = le(t, o);
					d = {
						type: "link",
						at: o,
						...n,
						group: [o, n.end]
					}, a.push(d), l = d.close, u = d.end, o++;
					continue;
				}
			}
			if (p === "<") {
				O.lastIndex = o;
				let t = O.exec(e);
				if (t && o + t[0].length <= m) {
					a.push({
						type: "tag",
						at: o,
						length: t[0].length,
						mark: t[1] ? "color" : "underline",
						color: t[1],
						closing: !1,
						group: [o, n],
						lone: !0,
						id: a.length
					}), o += t[0].length;
					continue;
				}
				let r = e.startsWith("</span>", o) ? 7 : e.startsWith("</u>", o) ? 4 : 0;
				if (r && o + r <= m) {
					a.push({
						type: "tag",
						at: o,
						length: r,
						mark: r === 7 ? "color" : "underline",
						closing: !0,
						group: [o, o + r],
						lone: !0,
						id: a.length
					}), o += r;
					continue;
				}
			}
			if (N[p]) {
				let n = 1;
				for (; o + n < m && e[o + n] === p;) n++;
				let r = n >= 2;
				if (r || N[p].one) {
					let i = a[a.length - 1], c = o === s || e[o - 1] === "\n" || i?.type === "break" && i.at + 1 + i.prefix === o, l = o === t ? void 0 : c ? "\n" : e[o - 1], u = o + n < m ? e[o + n] : void 0, d = c && o > t && !M(e[e.lastIndexOf("\n", o - 1) - 1]) && (!u || u === "\n"), f = !M(u) && !(p === "_" && j(l)), h = (!M(l) || d) && !(p === "_" && j(u));
					a.push({
						type: "delimiters",
						run: {
							at: o,
							length: n,
							char: p,
							left: 0,
							right: 0,
							opens: f,
							closes: h,
							looseOpen: r && !f && !!u && M(l),
							looseClose: r && !h && !!l && M(u),
							used: []
						}
					});
				}
				o += n;
			} else o++;
		}
	}
	return l >= 0 && a.push({
		type: "link-end",
		at: l,
		end: u,
		group: d.group
	}), a;
}
function de(e) {
	let t = e.flatMap((e) => e.type === "delimiters" ? [e.run] : []), n = (e) => e.length - e.left - e.right;
	for (let e = 0; e < t.length; e++) {
		let r = t[e];
		if (r.closes || r.looseClose) for (; n(r) > 0;) {
			let i = -1, a = 0;
			for (let o = e - 1; o >= 0; o--) {
				let e = t[o];
				if (e.char !== r.char || !n(e) || !(e.opens || e.looseOpen) || !e.opens && !r.closes) continue;
				let s = e.opens && e.closes || r.opens && r.closes, c = n(e), l = n(r);
				if (!(s && (c + l) % 3 == 0 && (c % 3 || l % 3) && (c % 2 || l % 2)) && (a = Math.min(n(e), n(r)) >= 2 ? 2 : +!!N[r.char].one, a)) {
					i = o;
					break;
				}
			}
			if (i < 0) break;
			let o = t[i], s = o.at + o.length - o.right - a, c = r.at + r.left, l = a === 2 ? N[r.char].two : N[r.char].one, u = [s, c + a];
			o.used.push({
				at: s,
				length: a,
				mark: l,
				opening: !0,
				group: u
			}), r.used.push({
				at: c,
				length: a,
				mark: l,
				opening: !1,
				group: u
			}), o.right += a, r.left += a;
		}
	}
}
function fe(e) {
	let t = {
		underline: [],
		color: []
	};
	for (let n of e) {
		if (n.type !== "tag") continue;
		if (!n.closing) {
			t[n.mark].push(n);
			continue;
		}
		let e = t[n.mark].pop();
		e && (e.lone = n.lone = !1, e.group = n.group = [e.at, n.at + n.length], n.id = e.id);
	}
}
function pe(e, t, n, r, i, a) {
	if (n <= t) return;
	if (i.href || i.code) {
		a.push({
			kind: "text",
			from: r + t,
			to: r + n,
			...i
		});
		return;
	}
	let o = e.slice(t, n), s = 0;
	for (let e of o.matchAll(se)) {
		let n = e.index;
		n > s && a.push({
			kind: "text",
			from: r + t + s,
			to: r + t + n,
			...i
		});
		let o = e[0];
		a.push({
			kind: "text",
			from: r + t + n,
			to: r + t + n + o.length,
			...i,
			autolink: !0,
			href: o.startsWith("www.") ? `https://${o}` : o
		}), s = n + o.length;
	}
	s < o.length && a.push({
		kind: "text",
		from: r + t + s,
		to: r + n,
		...i
	});
}
function P(e, t, n, r, i, a, o) {
	let s = ue(e, t, n, a, o);
	de(s), fe(s);
	let c = {
		bold: 0,
		italic: 0,
		strike: 0,
		highlight: 0,
		underline: 0
	}, l = [], u, d, f, p = t, m = () => {
		let e = {};
		c.bold && (e.bold = !0), c.italic && (e.italic = !0), c.strike && (e.strike = !0), c.highlight && (e.highlight = !0), c.underline && (e.underline = !0);
		for (let { color: t } of l) D.test(t) ? e.background = t.replace(D, "") : e.color = t;
		return u !== void 0 && (e.href = u), d !== void 0 && (e.title = d), f !== void 0 && (e.linkSource = f), e;
	}, h = (t) => pe(e, p, t, r, m(), i), g = (e, t, n, a = !1) => {
		h(e), i.push({
			kind: "syntax",
			from: r + e,
			to: r + t,
			group: [r + n[0], r + n[1]],
			...a ? { lone: !0 } : {}
		}), p = t;
	};
	for (let e of s) switch (e.type) {
		case "break":
			h(e.at), i.push({
				kind: "break",
				from: r + e.at,
				to: r + e.at + 1
			}), e.prefix && i.push({
				kind: "syntax",
				from: r + e.at + 1,
				to: r + e.at + 1 + e.prefix,
				prefix: !0
			}), p = e.at + 1 + e.prefix;
			break;
		case "code": {
			let t = [e.at, e.close + e.ticks];
			g(e.at, e.at + e.ticks, t), e.close > p && i.push({
				kind: "text",
				from: r + p,
				to: r + e.close,
				...m(),
				code: !0
			}), p = e.close, g(e.close, e.close + e.ticks, t);
			break;
		}
		case "atom":
			h(e.at), i.push({
				kind: "atom",
				atom: e.name,
				from: r + e.at,
				to: r + e.at + e.length,
				...m(),
				...e.name === "equation" ? { group: [r + e.at, r + e.at + e.length] } : {}
			}), p = e.at + e.length;
			break;
		case "escape":
			h(e.at), i.push({
				kind: "syntax",
				from: r + e.at,
				to: r + e.at + 1,
				escape: !0
			}), p = e.at + 1;
			break;
		case "delimiters":
			for (let t of [...e.run.used].sort((e, t) => e.at - t.at)) t.opening || (h(t.at), c[t.mark]--, p = t.at), g(t.at, t.at + t.length, t.group), t.opening && c[t.mark]++;
			break;
		case "tag":
			if (g(e.at, e.at + e.length, e.group, e.lone), e.closing) {
				if (e.lone) break;
				e.mark === "underline" ? c.underline-- : l.splice(l.findIndex((t) => t.id === e.id), 1);
			} else e.mark === "underline" ? c.underline++ : l.push({
				id: e.id,
				color: e.color
			});
			break;
		case "link":
			g(e.at, e.at + 1, e.group), {href: u, title: d, linkSource: f} = e;
			break;
		case "link-end": h(e.at), p = e.at, u = d = f = void 0, g(e.at, e.end, e.group);
	}
	h(n);
}
function me(e, t = E) {
	let n = F.get(e);
	n || F.set(e, n = /* @__PURE__ */ new WeakMap());
	let r = n.get(t);
	return r || (r = I && I.atoms === t && I.source === e.source && I.kind === e.kind && I.prefix === e.prefix ? I.runs : he(e, t), n.set(t, r), I = {
		atoms: t,
		source: e.source,
		kind: e.kind,
		prefix: e.prefix,
		runs: r
	}), r;
}
var F = /* @__PURE__ */ new WeakMap(), I = null;
function he(t, n) {
	let r = [], i = t.source.split("\n"), o = t.kind === "code" && w(t);
	if (t.kind === "equation") return [{
		kind: "atom",
		atom: "equation-block",
		from: 0,
		to: t.source.length,
		group: [0, t.source.length]
	}];
	if (t.kind === "columns") return [{
		kind: "atom",
		atom: "columns",
		from: 0,
		to: t.source.length
	}];
	if (t.kind === "toc") return [{
		kind: "atom",
		atom: "toc",
		from: 0,
		to: t.source.length
	}];
	if (t.kind === "tabs") return [{
		kind: "atom",
		atom: "tabs",
		from: 0,
		to: t.source.length
	}];
	let s = ie(t, n);
	if (s) return [{
		kind: "atom",
		atom: s.name,
		from: 0,
		to: t.source.length,
		group: [0, t.source.length]
	}];
	if (t.kind === "paragraph") return P(t.source, 0, t.source.length, 0, r, n), r;
	if (t.kind === "quote" || t.kind === "callout") {
		let e = t.kind === "callout" ? t.prefix : a.exec(i[0])?.[0].length ?? 0;
		return e && r.push({
			kind: "syntax",
			from: 0,
			to: e,
			prefix: !0
		}), P(t.source, e, t.source.length, 0, r, n, (e) => {
			let n = t.source.indexOf("\n", e);
			return a.exec(t.source.slice(e, n < 0 ? t.source.length : n))?.[0].length ?? 0;
		}), r;
	}
	if (t.kind === "table") {
		let i = 0;
		for (let a of e(t.source).flat()) a.from > i && r.push({
			kind: "syntax",
			from: i,
			to: a.from,
			prefix: !0
		}), P(a.text, 0, a.text.length, a.from, r, n), i = a.to;
		return i < t.source.length && r.push({
			kind: "syntax",
			from: i,
			to: t.source.length,
			prefix: !0
		}), r;
	}
	let c = 0;
	return i.forEach((e, a) => {
		if (a && r.push({
			kind: "break",
			from: c - 1,
			to: c
		}), t.kind === "code") a === 0 || o && a === i.length - 1 ? r.push({
			kind: "syntax",
			from: c,
			to: c + e.length,
			prefix: !0
		}) : e && r.push({
			kind: "text",
			from: c,
			to: c + e.length,
			code: !0
		});
		else if (t.kind === "divider") r.push({
			kind: "syntax",
			from: c,
			to: c + e.length,
			prefix: !0
		});
		else {
			let i = a === 0 && (t.kind === "heading" || t.kind === "bullet") ? t.prefix : 0;
			i && r.push({
				kind: "syntax",
				from: c,
				to: c + i,
				prefix: !0
			}), P(e, i, e.length, c, r, n);
		}
		c += e.length + 1;
	}), r;
}
//#endregion
//#region src/comment-yaml.ts
var L = (e, t) => {
	throw Error(`Invalid comment YAML (line ${e + 1}: ${t}).`);
}, ge = /^(?:~|[Nn]ull|NULL)?$/, _e = /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/, ve = /^(?:[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)(?:[eE][-+]?[0-9]+)?|0o[0-7]+|0x[0-9a-fA-F]+|[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/;
function R(e) {
	return ge.test(e) ? null : _e.test(e) ? /^[tT]/.test(e) : ve.test(e) ? Number(e) : e;
}
var z = {
	0: "\0",
	a: "\x07",
	b: "\b",
	t: "	",
	"	": "	",
	n: "\n",
	v: "\v",
	f: "\f",
	r: "\r",
	e: "\x1B",
	" ": " ",
	"\"": "\"",
	"/": "/",
	"\\": "\\",
	N: "",
	_: "\xA0",
	L: "\u2028",
	P: "\u2029"
}, ye = {
	x: 2,
	u: 4,
	U: 8
};
function B(e, t, n) {
	let r = e[t], i = "", a = t + 1;
	for (; a < e.length; a++) {
		let t = e[a];
		if (r === "'") {
			if (t !== "'") {
				i += t;
				continue;
			}
			if (e[a + 1] === "'") {
				i += "'", a++;
				continue;
			}
			return {
				value: i,
				end: a + 1
			};
		}
		if (t === "\"") return {
			value: i,
			end: a + 1
		};
		if (t !== "\\") {
			i += t;
			continue;
		}
		let o = e[++a], s = ye[o];
		if (s) {
			let t = e.slice(a + 1, a + 1 + s);
			(!/^[0-9a-fA-F]+$/.test(t) || t.length !== s) && L(n, "bad escape"), i += s === 8 ? String.fromCodePoint(parseInt(t, 16)) : String.fromCharCode(parseInt(t, 16)), a += s;
		} else o in z ? i += z[o] : L(n, "bad escape");
	}
	return L(n, "quote not closed on its line");
}
function V(e, t, n) {
	let r = e.slice(t);
	/[^ \t]/.test(r) && !/^[ \t]+#/.test(r) && L(n, "text after a value");
}
var be = (e) => /^[ \t]*(?:#.*)?$/.test(e), H = (e) => e.replace(/^[ \t]+|[ \t]+$/g, ""), U = /^(?:---|\.\.\.)(?:[ \t]|$)/, W = /^[^ \t\-?:,[\]{}#&*!|>'"%@`]|^[-?:][^ \t,[\]{}]/;
function G(e, t) {
	if (e[0] === "\"" || e[0] === "'") {
		let { value: n, end: r } = B(e, 0, t), i = e.slice(r).replace(/^[ \t]+/, "");
		return i[0] === ":" && (i.length === 1 || /[ \t]/.test(i[1])) ? {
			key: n,
			rest: i.slice(1)
		} : null;
	}
	if (!W.test(e)) return null;
	let n = e.search(/:(?:[ \t]|$)/);
	return n < 0 || /[ \t]#/.test(e.slice(0, n)) ? null : {
		key: H(e.slice(0, n)),
		rest: e.slice(n + 1)
	};
}
function K(e, t, n, r) {
	r > 16 && L(n, "too deep");
	let i = (t) => {
		for (; e[t] === " " || e[t] === "	";) t++;
		return t;
	}, a = e[t], o = a === "[" ? "]" : "}", s = a === "[", c = [], l = {}, u = /* @__PURE__ */ new Set(), d = i(t + 1), f = (t) => {
		let i = e[t];
		if (i === "[" || i === "{") return {
			...K(e, t, n, r + 1),
			quoted: !0
		};
		if (i === "\"" || i === "'") return {
			...B(e, t, n),
			quoted: !0
		};
		let a = t;
		for (; a < e.length && !/[,[\]{}]/.test(e[a]) && !(e[a] === ":" && /[ \t,[\]{}]|^$/.test(e[a + 1] ?? ""));) a++;
		let o = H(e.slice(t, a));
		return (!o || !W.test(o) || /[ \t]#/.test(o) || /[&*!]/.test(o[0])) && L(n, "bad flow value"), {
			value: R(o),
			end: a,
			quoted: !1
		};
	};
	for (; e[d] !== o;) {
		d >= e.length && L(n, "flow not closed on its line");
		let t = f(d);
		if (d = i(t.end), s) e[d] === ":" && L(n, "mapping in a flow sequence"), c.push(t.value);
		else {
			(typeof t.value != "string" || e[d] !== ":") && L(n, "bad flow key"), u.has(t.value) && L(n, "duplicate key"), u.add(t.value);
			let r = f(i(d + 1));
			q(l, t.value, r.value), d = i(r.end);
		}
		e[d] === "," ? d = i(d + 1) : e[d] !== o && L(n, "flow not closed on its line");
	}
	return {
		value: s ? c : l,
		end: d + 1
	};
}
function q(e, t, n) {
	Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		writable: !0,
		configurable: !0
	});
}
function xe(e) {
	let t = e.split(/\r\n|\n/);
	t[t.length - 1] === "" && t.pop();
	let n = 0, r = !1, i = () => {
		for (; n < t.length; n++) {
			if (be(t[n])) {
				/^ *\t/.test(t[n]) && L(n, "a tab in the indent");
				continue;
			}
			let e = /^ */.exec(t[n])[0].length;
			return t[n][e] === "	" && L(n, "a tab in the indent"), r && U.test(t[n]) && L(n, "one document only"), {
				indent: e,
				text: H(t[n].slice(e))
			};
		}
		return null;
	}, a = (e, r) => {
		let [, i, a, o, s, c] = e;
		c && !/^[ \t]/.test(c) && L(n, "bad block header");
		let l = a || s, u = o ? r + Number(o) : -1, d = [], f = n + 1;
		for (; f < t.length; f++) {
			let e = t[f], i = /^ */.exec(e)[0].length;
			if (U.test(e)) break;
			if (e.length === i) d.push(u >= 0 ? e.slice(u) : "");
			else {
				if (u < 0) {
					if (i <= r && r >= 0) break;
					e[i] === "	" && i === 0 && L(f, "a tab in the indent"), u = i;
					for (let e of t.slice(n + 1, f)) e.length > u && L(f, "indent");
					d.length = 0;
					for (let e = n + 1; e < f; e++) d.push("");
				}
				if (i < u) break;
				d.push(e.slice(u));
			}
		}
		n = f;
		let p = 0;
		for (; d.length - p > 0 && d[d.length - 1 - p] === "";) p++;
		let m = d.slice(0, d.length - p), h;
		if (i === "|") h = m.join("\n");
		else {
			m.some((e) => /^[ \t]/.test(e)) && L(n, "a more-indented folded line"), h = "";
			for (let e = 0; e < m.length; e++) e && m[e] && m[e - 1] ? h += " " : e && !m[e] && (h += "\n"), h += m[e];
		}
		return m.length ? l === "-" ? h : l === "+" ? `${h}\n${"\n".repeat(p)}` : `${h}\n` : l === "+" ? "\n".repeat(p) : "";
	}, o = (e, t) => {
		let r = n, i = /^([|>])([-+]?)([1-9]?)([-+]?)(.*)$/.exec(e);
		if (i) return (i[2] && i[4] || /[^ \t]/.test(i[5]) && !/^[ \t]+#/.test(i[5])) && L(r, "bad block header"), a(i, t);
		if (n++, e[0] === "\"" || e[0] === "'") {
			let { value: t, end: n } = B(e, 0, r);
			return V(e, n, r), t;
		}
		if (e[0] === "[" || e[0] === "{") {
			let { value: t, end: n } = K(e, 0, r, 0);
			return V(e, n, r), t;
		}
		let o = H(e.replace(/[ \t]+#.*$/, ""));
		return /:(?:[ \t]|$)/.test(o) && L(r, "a mapping inside a plain value"), o[0] === "#" ? null : (W.test(o) || L(r, "anchors, aliases, tags and reserved characters are not read"), R(o));
	}, s = (e, t) => {
		t > 32 && L(n, "too deep");
		let r = i();
		return r.text === "-" || r.text.startsWith("- ") ? c(e, t) : l(e, t);
	}, c = (e, r) => {
		let a = [];
		for (let c = i(); c && c.indent === e && (c.text === "-" || c.text.startsWith("- ")); c = i()) {
			let l = H(c.text.slice(1));
			if (!l || l[0] === "#") {
				n++;
				let t = i();
				a.push(t && t.indent > e ? s(t.indent, r + 1) : null);
				continue;
			}
			let u = c.text.length - l.length + e;
			l === "-" || l.startsWith("- ") || G(l, n) ? (t[n] = " ".repeat(u) + l, a.push(s(u, r + 1))) : a.push(o(l, e));
		}
		let c = i();
		return c && c.indent > e && L(n, "indent"), a;
	}, l = (e, t) => {
		let r = {}, a = /* @__PURE__ */ new Set();
		for (let l = i(); l && l.indent === e; l = i()) {
			let u = G(l.text, n);
			u || L(n, "expected a key");
			let { key: d, rest: f } = u;
			a.has(d) && L(n, "duplicate key"), a.add(d);
			let p = H(f);
			if (p && p[0] !== "#") {
				q(r, d, o(p, e));
				continue;
			}
			p && !/^[ \t]/.test(f) && L(n, "expected a key"), n++;
			let m = i();
			m && m.indent > e ? q(r, d, s(m.indent, t + 1)) : m && m.indent === e && (m.text === "-" || m.text.startsWith("- ")) ? q(r, d, c(e, t + 1)) : q(r, d, null);
		}
		let l = i();
		return l && l.indent > e && L(n, "indent"), r;
	}, u = i();
	if (!u || (u.text === "---" ? n++ : U.test(t[n]) && L(n, "one document only"), r = !0, !i())) return null;
	let d = i();
	d.indent !== 0 && d.text.match(/^-/) && L(n, "indent");
	let f = d.text.startsWith("- ") || d.text === "-" || G(d.text, n) ? s(d.indent, 0) : o(d.text, -1);
	return i() && L(n, "more than one value"), f;
}
var Se = {
	account: /^(?:[A-Za-z]{2}\d{4}|[A-Za-z]{4}\d{2})$/,
	product: /^[A-Za-z]{4}\d{2}$/,
	list: /^\d{2}[A-Za-z]{4}$/,
	item: /^[A-Za-z]{2}\d{2}(?:[A-Za-z][A-Za-z0-9]|\d[A-Za-z])$/
}, J = (e, t) => Se[e].test(t), Ce = /<!--aa:(start|end) ([A-Za-z0-9]{6})-->/g, Y = (e) => typeof e == "string" && /^\d{4}-\d\d-\d\dT.*Z$/.test(e) && Number.isFinite(Date.parse(e)), X = (e) => typeof e == "string" && J("account", e), Z = (e) => typeof e == "string" && J("item", e), Q = (e) => !!e && typeof e == "object" && !Array.isArray(e);
function $(e) {
	if (!Q(e) || !Array.isArray(e.threads) || e.threads.length > 1e4) throw Error("Expected threads array (at most 10000 threads).");
	let t = /* @__PURE__ */ new Set(), n = (e) => {
		if (!Z(e) || t.has(e)) throw Error("Thread and comment IDs must be unique IDv1 item codes.");
		t.add(e);
	};
	for (let t of e.threads) {
		if (!Q(t)) throw Error("Invalid thread.");
		if (n(t.id), typeof t.quote != "string" || !["open", "resolved"].includes(t.status) || !Array.isArray(t.comments) || !t.comments.length) throw Error("Invalid thread fields.");
		if (t.status === "resolved" && (!Y(t.resolved) || !X(t.resolvedBy))) throw Error("Resolved threads need resolved and resolvedBy.");
		for (let e of t.comments) {
			if (!Q(e)) throw Error("Invalid comment.");
			if (n(e.id), !X(e.author) || !Y(e.created) || typeof e.body != "string" || !e.body.trim() || e.edited !== void 0 && !Y(e.edited)) throw Error("Invalid comment author, date or body.");
			if (e.mentions !== void 0 && (!Array.isArray(e.mentions) || !e.mentions.every(X))) throw Error("Invalid mentions.");
			if (e.reactions !== void 0 && (!Q(e.reactions) || !Object.values(e.reactions).every((e) => Array.isArray(e) && e.every(X)))) throw Error("Invalid reactions.");
		}
	}
	return e.threads;
}
function we(e) {
	let t = [], n = [], r = [...e.matchAll(/[^\n]*(?:\n|$)/g)].filter((e) => e[0]);
	for (let i = 0; i < r.length; i++) {
		let a = r[i], o = /^ {0,3}(`{3,}|~{3,})([^\r\n]*)/.exec(a[0]);
		if (!o) continue;
		let s = a.index, c = s + a[0].length, l = i + 1;
		for (; l < r.length; l++) {
			let e = /^ {0,3}(`{3,}|~{3,})[ \t]*(?:\r?\n)?$/.exec(r[l][0]);
			if (e && e[1][0] === o[1][0] && e[1].length >= o[1].length) break;
		}
		let u = l < r.length, d = u ? r[l].index + r[l][0].length : e.length;
		t.push({
			from: s,
			to: d,
			info: o[2].trim(),
			body: e.slice(c, u ? r[l].index : d),
			closed: u
		}), n.push({
			from: s,
			to: d
		}), i = l;
	}
	for (let e of r) /^(?: {4}|\t)/.test(e[0]) && n.push({
		from: e.index,
		to: e.index + e[0].length
	});
	let i = (e) => n.some((t) => e >= t.from && e < t.to);
	for (let t = 0; t < e.length; t++) {
		if (e[t] !== "`" || i(t) || e[t - 1] === "\\") continue;
		let r = 1;
		for (; e[t + r] === "`";) r++;
		let a = t + r;
		for (; (a = e.indexOf("`".repeat(r), a)) >= 0 && (i(a) || e[a - 1] === "`" || e[a + r] === "`");) a += r;
		a >= 0 ? (n.push({
			from: t,
			to: a + r
		}), t = a + r - 1) : t += r - 1;
	}
	return {
		fences: t,
		protectedAt: i
	};
}
function Te(e) {
	let { fences: t, protectedAt: n } = we(e), r = [], i = [], a = [], o = t.filter((e) => /^aa-comments(?:\s|$)/.test(e.info));
	for (let t of o) {
		if (o.length > 1) {
			i.push("Multiple aa-comments blocks.");
			break;
		}
		if (t.info !== "aa-comments v1") i.push("Unsupported aa-comments version.");
		else if (!t.closed || e.slice(t.to).trim()) i.push("The aa-comments block must be closed and last.");
		else try {
			if (t.body.length > 2e6) throw Error("Comment metadata exceeds 2 MB.");
			a = $(xe(t.body));
			let n = e.slice(0, t.from), i = n.endsWith("\r\n\r\n") ? 4 : n.endsWith("\n\n") ? 2 : 0;
			r.push({
				from: t.from - i,
				to: t.to,
				metadata: !0
			});
		} catch (e) {
			i.push(String(e instanceof Error ? e.message : e)), a = [];
		}
	}
	let s = /* @__PURE__ */ new Map();
	for (let t of e.matchAll(Ce)) {
		if (n(t.index) || e[t.index - 1] === "\\" || !Z(t[2])) continue;
		let i = {
			from: t.index,
			to: t.index + t[0].length
		};
		r.push(i);
		let a = s.get(t[2]) ?? {
			start: [],
			end: []
		};
		a[t[1]].push(i), s.set(t[2], a);
	}
	r.sort((e, t) => e.from - t.from);
	let c = (e) => e - r.reduce((t, n) => t + Math.max(0, Math.min(e, n.to) - n.from), 0), l = Object.create(null);
	for (let e of a) {
		let t = s.get(e.id);
		t?.start.length === 1 && t.end.length === 1 && t.start[0].to < t.end[0].from ? l[e.id] = {
			from: c(t.start[0].to),
			to: c(t.end[0].from)
		} : t && (t.start.length > 1 || t.end.length > 1) && i.push(`Duplicate anchors for ${e.id}.`);
	}
	let u = "", d = 0;
	for (let t of r) u += e.slice(d, t.from), d = t.to;
	return u += e.slice(d), {
		markdown: u,
		threads: a,
		anchors: l,
		diagnostics: i,
		spans: r
	};
}
function Ee(e) {
	let t = Te(e);
	if (t.diagnostics.length) throw Error(`Cannot export Markdown: ${t.diagnostics.join(" ")}`);
	return t.markdown;
}
//#endregion
export { E as DEFAULT_ATOMS, me as blockRuns, Ee as exportMarkdown, ne as parseBlocks, g as readColumns, ee as readTabs, re as serialize, t as tableAlignments, e as tableRows, n as tableWidths };

