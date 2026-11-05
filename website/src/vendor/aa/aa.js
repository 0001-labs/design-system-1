//#region \0rolldown/runtime.js
var e = Object.defineProperty, t = (e, t, n) => () => {
	if (n) throw n[0];
	try {
		return e && (t = e(e = 0)), t;
	} catch (e) {
		throw n = [e], e;
	}
}, n = (t, n) => {
	let r = {};
	for (var i in t) e(r, i, {
		get: t[i],
		enumerable: !0
	});
	return n || e(r, Symbol.toStringTag, { value: "Module" }), r;
}, r = (e, t) => {
	throw Error(`Invalid comment YAML (line ${e + 1}: ${t}).`);
}, i = /^(?:~|[Nn]ull|NULL)?$/, a = /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/, o = /^(?:[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)(?:[eE][-+]?[0-9]+)?|0o[0-7]+|0x[0-9a-fA-F]+|[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/;
function s(e) {
	return i.test(e) ? null : a.test(e) ? /^[tT]/.test(e) : o.test(e) ? Number(e) : e;
}
var c = {
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
}, l = {
	x: 2,
	u: 4,
	U: 8
};
function u(e, t, n) {
	let i = e[t], a = "", o = t + 1;
	for (; o < e.length; o++) {
		let t = e[o];
		if (i === "'") {
			if (t !== "'") {
				a += t;
				continue;
			}
			if (e[o + 1] === "'") {
				a += "'", o++;
				continue;
			}
			return {
				value: a,
				end: o + 1
			};
		}
		if (t === "\"") return {
			value: a,
			end: o + 1
		};
		if (t !== "\\") {
			a += t;
			continue;
		}
		let s = e[++o], u = l[s];
		if (u) {
			let t = e.slice(o + 1, o + 1 + u);
			(!/^[0-9a-fA-F]+$/.test(t) || t.length !== u) && r(n, "bad escape"), a += u === 8 ? String.fromCodePoint(parseInt(t, 16)) : String.fromCharCode(parseInt(t, 16)), o += u;
		} else s in c ? a += c[s] : r(n, "bad escape");
	}
	return r(n, "quote not closed on its line");
}
function d(e, t, n) {
	let i = e.slice(t);
	/[^ \t]/.test(i) && !/^[ \t]+#/.test(i) && r(n, "text after a value");
}
var f = (e) => /^[ \t]*(?:#.*)?$/.test(e), p = (e) => e.replace(/^[ \t]+|[ \t]+$/g, ""), m = /^(?:---|\.\.\.)(?:[ \t]|$)/, h = /^[^ \t\-?:,[\]{}#&*!|>'"%@`]|^[-?:][^ \t,[\]{}]/;
function g(e, t) {
	if (e[0] === "\"" || e[0] === "'") {
		let { value: n, end: r } = u(e, 0, t), i = e.slice(r).replace(/^[ \t]+/, "");
		return i[0] === ":" && (i.length === 1 || /[ \t]/.test(i[1])) ? {
			key: n,
			rest: i.slice(1)
		} : null;
	}
	if (!h.test(e)) return null;
	let n = e.search(/:(?:[ \t]|$)/);
	return n < 0 || /[ \t]#/.test(e.slice(0, n)) ? null : {
		key: p(e.slice(0, n)),
		rest: e.slice(n + 1)
	};
}
function _(e, t, n, i) {
	i > 16 && r(n, "too deep");
	let a = (t) => {
		for (; e[t] === " " || e[t] === "	";) t++;
		return t;
	}, o = e[t], c = o === "[" ? "]" : "}", l = o === "[", d = [], f = {}, m = /* @__PURE__ */ new Set(), g = a(t + 1), y = (t) => {
		let a = e[t];
		if (a === "[" || a === "{") return {
			..._(e, t, n, i + 1),
			quoted: !0
		};
		if (a === "\"" || a === "'") return {
			...u(e, t, n),
			quoted: !0
		};
		let o = t;
		for (; o < e.length && !/[,[\]{}]/.test(e[o]) && !(e[o] === ":" && /[ \t,[\]{}]|^$/.test(e[o + 1] ?? ""));) o++;
		let c = p(e.slice(t, o));
		return (!c || !h.test(c) || /[ \t]#/.test(c) || /[&*!]/.test(c[0])) && r(n, "bad flow value"), {
			value: s(c),
			end: o,
			quoted: !1
		};
	};
	for (; e[g] !== c;) {
		g >= e.length && r(n, "flow not closed on its line");
		let t = y(g);
		if (g = a(t.end), l) e[g] === ":" && r(n, "mapping in a flow sequence"), d.push(t.value);
		else {
			(typeof t.value != "string" || e[g] !== ":") && r(n, "bad flow key"), m.has(t.value) && r(n, "duplicate key"), m.add(t.value);
			let i = y(a(g + 1));
			v(f, t.value, i.value), g = a(i.end);
		}
		e[g] === "," ? g = a(g + 1) : e[g] !== c && r(n, "flow not closed on its line");
	}
	return {
		value: l ? d : f,
		end: g + 1
	};
}
function v(e, t, n) {
	Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		writable: !0,
		configurable: !0
	});
}
function y(e) {
	let t = e.split(/\r\n|\n/);
	t[t.length - 1] === "" && t.pop();
	let n = 0, i = !1, a = () => {
		for (; n < t.length; n++) {
			if (f(t[n])) {
				/^ *\t/.test(t[n]) && r(n, "a tab in the indent");
				continue;
			}
			let e = /^ */.exec(t[n])[0].length;
			return t[n][e] === "	" && r(n, "a tab in the indent"), i && m.test(t[n]) && r(n, "one document only"), {
				indent: e,
				text: p(t[n].slice(e))
			};
		}
		return null;
	}, o = (e, i) => {
		let [, a, o, s, c, l] = e;
		l && !/^[ \t]/.test(l) && r(n, "bad block header");
		let u = o || c, d = s ? i + Number(s) : -1, f = [], p = n + 1;
		for (; p < t.length; p++) {
			let e = t[p], a = /^ */.exec(e)[0].length;
			if (m.test(e)) break;
			if (e.length === a) f.push(d >= 0 ? e.slice(d) : "");
			else {
				if (d < 0) {
					if (a <= i && i >= 0) break;
					e[a] === "	" && a === 0 && r(p, "a tab in the indent"), d = a;
					for (let e of t.slice(n + 1, p)) e.length > d && r(p, "indent");
					f.length = 0;
					for (let e = n + 1; e < p; e++) f.push("");
				}
				if (a < d) break;
				f.push(e.slice(d));
			}
		}
		n = p;
		let h = 0;
		for (; f.length - h > 0 && f[f.length - 1 - h] === "";) h++;
		let g = f.slice(0, f.length - h), _;
		if (a === "|") _ = g.join("\n");
		else {
			g.some((e) => /^[ \t]/.test(e)) && r(n, "a more-indented folded line"), _ = "";
			for (let e = 0; e < g.length; e++) e && g[e] && g[e - 1] ? _ += " " : e && !g[e] && (_ += "\n"), _ += g[e];
		}
		return g.length ? u === "-" ? _ : u === "+" ? `${_}\n${"\n".repeat(h)}` : `${_}\n` : u === "+" ? "\n".repeat(h) : "";
	}, c = (e, t) => {
		let i = n, a = /^([|>])([-+]?)([1-9]?)([-+]?)(.*)$/.exec(e);
		if (a) return (a[2] && a[4] || /[^ \t]/.test(a[5]) && !/^[ \t]+#/.test(a[5])) && r(i, "bad block header"), o(a, t);
		if (n++, e[0] === "\"" || e[0] === "'") {
			let { value: t, end: n } = u(e, 0, i);
			return d(e, n, i), t;
		}
		if (e[0] === "[" || e[0] === "{") {
			let { value: t, end: n } = _(e, 0, i, 0);
			return d(e, n, i), t;
		}
		let c = p(e.replace(/[ \t]+#.*$/, ""));
		return /:(?:[ \t]|$)/.test(c) && r(i, "a mapping inside a plain value"), c[0] === "#" ? null : (h.test(c) || r(i, "anchors, aliases, tags and reserved characters are not read"), s(c));
	}, l = (e, t) => {
		t > 32 && r(n, "too deep");
		let i = a();
		return i.text === "-" || i.text.startsWith("- ") ? y(e, t) : b(e, t);
	}, y = (e, i) => {
		let o = [];
		for (let r = a(); r && r.indent === e && (r.text === "-" || r.text.startsWith("- ")); r = a()) {
			let s = p(r.text.slice(1));
			if (!s || s[0] === "#") {
				n++;
				let t = a();
				o.push(t && t.indent > e ? l(t.indent, i + 1) : null);
				continue;
			}
			let u = r.text.length - s.length + e;
			s === "-" || s.startsWith("- ") || g(s, n) ? (t[n] = " ".repeat(u) + s, o.push(l(u, i + 1))) : o.push(c(s, e));
		}
		let s = a();
		return s && s.indent > e && r(n, "indent"), o;
	}, b = (e, t) => {
		let i = {}, o = /* @__PURE__ */ new Set();
		for (let s = a(); s && s.indent === e; s = a()) {
			let u = g(s.text, n);
			u || r(n, "expected a key");
			let { key: d, rest: f } = u;
			o.has(d) && r(n, "duplicate key"), o.add(d);
			let m = p(f);
			if (m && m[0] !== "#") {
				v(i, d, c(m, e));
				continue;
			}
			m && !/^[ \t]/.test(f) && r(n, "expected a key"), n++;
			let h = a();
			h && h.indent > e ? v(i, d, l(h.indent, t + 1)) : h && h.indent === e && (h.text === "-" || h.text.startsWith("- ")) ? v(i, d, y(e, t + 1)) : v(i, d, null);
		}
		let s = a();
		return s && s.indent > e && r(n, "indent"), i;
	}, x = a();
	if (!x || (x.text === "---" ? n++ : m.test(t[n]) && r(n, "one document only"), i = !0, !a())) return null;
	let S = a();
	S.indent !== 0 && S.text.match(/^-/) && r(n, "indent");
	let C = S.text.startsWith("- ") || S.text === "-" || g(S.text, n) ? l(S.indent, 0) : c(S.text, -1);
	return a() && r(n, "more than one value"), C;
}
var b = /^[^\s\-?:,[\]{}#&*!|>'"%@`=~][^\t\n\r]*$/u, x = /[^\t\n\x20-\x7e\u0085\u00a0-\ud7ff\ue000-\ufffd\u{10000}-\u{10ffff}]/u, S = (e) => b.test(e) && !/\s$|: |:$| #/.test(e) && s(e) === e && !x.test(e);
function C(e, t) {
	if (S(e)) return e;
	if (e.includes("\n") && !e.startsWith("\n") && !x.test(e) && !e.includes("\r") && !e.includes("") && !/\n[ \t]+(?:\n|$)|^[ \t]+\n/.test(e)) {
		let n = /\n*$/.exec(e)[0].length, r = n === 0 ? "-" : n === 1 ? "" : "+", i = /^[ \t]/.test(e) ? "2" : "", a = e.slice(0, e.length - n).split("\n"), o = " ".repeat(t);
		return `|${i}${r}\n${a.map((e) => e ? o + e : "").join("\n")}${r === "+" ? "\n".repeat(n - 1) : ""}`;
	}
	return JSON.stringify(e);
}
function w(e) {
	let t = (e, t, a) => {
		let o = " ".repeat(a), s = S(e) ? e : JSON.stringify(e);
		return Array.isArray(t) && t.length || n(t) && Object.keys(t).length ? `${o}${s}:\n${i(t, a + 2)}` : `${o}${s}: ${r(t, a + 2)}\n`;
	}, n = (e) => !!e && typeof e == "object" && !Array.isArray(e), r = (e, t) => typeof e == "string" ? C(e, t) : Array.isArray(e) ? "[]" : n(e) ? "{}" : String(e), i = (e, a) => {
		let o = " ".repeat(a);
		return Array.isArray(e) ? e.map((e) => Array.isArray(e) && e.length || n(e) && Object.keys(e).length ? `${o}- ${i(e, a + 2).slice(a + 2)}` : `${o}- ${r(e, a + 2)}\n`).join("") : Object.entries(e).filter(([, e]) => e !== void 0).map(([e, n]) => t(e, n, a)).join("");
	};
	return i(e, 0);
}
//#endregion
//#region src/vendor/idv1/words.ts
var T = /* @__PURE__ */ "fuck.fuk.fck.fux.shit.sht.crap.turd.piss.cunt.twat.dick.dik.cock.knob.wank.jizz.cum.porn.sex.anal.anus.arse.ass.butt.boob.tit.puss.slut.whor.hoe.bich.btch.bitc.damn.hell.suck.fart.puke.barf.poo.smeg.dumb.ugly.fat.kill.dead.rape.hate.nazi.hitl.heil.kkk.isis.fag.nig.nigg.coon.spic.kike.gook.paki.dyke.homo.tard.jew.gay.lort.pik.pis.fis.fiss.kuss.knep.hore.lude.skid.nege.fand.svin.klam.baka.aho.kuso.unko.mank.chnk.ecch.etch.ero.hent.kasu.kuzu.busu.debu.hage.kich.yari.oppa.fick.fotz.hure.kack.arsc.fitt.kuk.hora.knul.puta.puto.cono.culo.mier.jode.pene.verg.merd.pute.bite.salo.cazz.figa.porr.ssib.shib.tmd.cao".split("."), E = [
	"42",
	"49",
	"69"
];
function D(e) {
	let t = e.toLowerCase();
	return T.some((e) => t.includes(e));
}
function ee(e) {
	return D(e.slice(0, 4)) || E.includes(e.slice(4));
}
//#endregion
//#region src/vendor/idv1/shapes.ts
var O = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", te = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", ne = "0123456789", re = /^[A-Za-z]{4}\d{2}$/, k = /^(?:[A-Za-z]{2}\d{4}|[A-Za-z]{4}\d{2})$/, A = /^\d{2}[A-Za-z]{4}$/, j = /^[A-Za-z]{2}\d{2}(?:[A-Za-z][A-Za-z0-9]|\d[A-Za-z])$/, M = (e, t) => e[Math.floor(t() * e.length)];
function N(e, t = Math.random) {
	let n = e ?? M("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", t) + M("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", t);
	for (;;) {
		let e = n + String(Math.floor(t() * 1e4)).padStart(4, "0");
		if (!P(e)) return e;
	}
}
var ie = {
	owner: "Jo4712",
	studio: "Jo0001",
	onboarding: "On0001",
	test: "Te0001"
}, ae = ["On4713"], oe, P = (e) => (oe ??= new Set([...Object.values(ie), ...ae].map((e) => e.toLowerCase()))).has(e.toLowerCase());
function se(e = Math.random) {
	for (let t = 0; t < 1e3; t++) {
		let t = Array.from({ length: 4 }, () => M(O, e)).join("") + String(Math.floor(e() * 100)).padStart(2, "0");
		if (!ee(t)) return t;
	}
	throw Error("No product code could be drawn.");
}
function F(e = Math.random) {
	return M(ne, e) + M(ne, e) + Array.from({ length: 4 }, () => M(te, e)).join("");
}
function I(e = Math.random) {
	let t = M(O, e) + M(O, e) + M(ne, e) + M(ne, e), n = M(O + ne, e), r = M(O + ne, e);
	return t + (/\d/.test(n) && /\d/.test(r) ? M(O, e) : n) + r;
}
var L = {
	account: k,
	product: re,
	list: A,
	item: j
}, R = (e, t) => L[e].test(t);
function ce(e, t = {}) {
	let n = t.random ?? Math.random;
	return e === "account" ? N(t.letters ?? null, n) : e === "product" ? se(n) : e === "list" ? F(n) : I(n);
}
//#endregion
//#region src/words.ts
var z = { da: {
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
	Cancel: "Annullér",
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
	"Not saved": "Ikke gemt",
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
	"Press space for AI or / for commands": "Tryk mellemrum for AI eller / for kommandoer",
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
	Highlight: "Markering",
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
	"Type / for commands": "Skriv / for kommandoer",
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
} }, le = Symbol.for("design-system-1.translate"), ue = null;
function B(e) {
	ue = e;
}
function de() {
	return (typeof document > "u" ? "" : document.documentElement.lang || "").trim().toLowerCase() || "en";
}
function V(e, t) {
	let n = de(), r = typeof ue == "function" ? ue(e, n) : ue?.[e];
	if (r === void 0) {
		let t = globalThis[le];
		if (typeof t == "function") {
			let n = String(t(e));
			n !== e && (r = n);
		}
	}
	r === void 0 && (r = z[n]?.[e] ?? z[n.split("-")[0]]?.[e]);
	let i = r ?? e;
	return t ? i.replace(/\{(\w+)\}/g, (e, n) => n in t ? String(t[n]) : e) : i;
}
//#endregion
//#region src/comments.ts
var fe = [
	"👍",
	"❤️",
	"😂",
	"🎉",
	"🙏",
	"👏",
	"😊",
	"🔥",
	"✅",
	"👀",
	"🤔",
	"💡",
	"🚀",
	"✨",
	"🙌",
	"💯"
];
function pe(e, t) {
	let n = 0;
	for (; n < e.length && n < t.length && e[n] === t[n];) n++;
	let r = e.length, i = t.length;
	for (; r > n && i > n && e[r - 1] === t[i - 1];) r--, i--;
	let a = (t) => t === 0 || /\s/.test(e[t - 1]), o = n, s = r, c = i;
	for (; !a(o) && o > 0 && e[o - 1] === t[c - 1] && e[o - 1] === e[s - 1];) o--, s--, c--;
	return o < n && a(o) && (n = o, r = s, i = c), {
		start: n,
		end: r,
		text: t.slice(n, i)
	};
}
function me(e, t) {
	let { start: n, end: r, text: i } = t, a = i.length - (r - n), { from: o, to: s } = e;
	return r <= o ? {
		from: o + a,
		to: s + a
	} : n === s && r === s ? {
		from: o,
		to: s + i.length
	} : n >= s ? {
		from: o,
		to: s
	} : n <= o && r >= s ? null : (n <= o ? (o = n + i.length, s += a) : r >= s ? s = n : s += a, o < s ? {
		from: o,
		to: s
	} : null);
}
function he(e, t, n) {
	return e.map((e) => {
		if (e.orphaned) return {
			...e,
			orphaned: !0
		};
		let r = me(e, t);
		return r ? {
			...e,
			...r,
			quote: n.slice(r.from, r.to),
			orphaned: !1
		} : {
			...e,
			orphaned: !0
		};
	});
}
function H(e, t) {
	if (!e.quote) return null;
	if (t.slice(e.from, e.to) === e.quote) return {
		from: e.from,
		to: e.to
	};
	let n = null;
	for (let r = t.indexOf(e.quote); r >= 0; r = t.indexOf(e.quote, r + 1)) (n === null || Math.abs(r - e.from) < Math.abs(n - e.from)) && (n = r);
	return n === null ? null : {
		from: n,
		to: n + e.quote.length
	};
}
function ge(e, t) {
	return e.map((e) => {
		let n = e.orphaned ? null : H(e, t);
		return n ? {
			...e,
			...n,
			orphaned: !1
		} : {
			...e,
			orphaned: !0
		};
	});
}
function _e(e, t) {
	let n = new Map(e.map((e) => [e.id, e]));
	return t.filter((e) => {
		let t = n.get(e.id);
		return !!t && !e.orphaned && (t.from !== e.from || t.to !== e.to || t.quote !== e.quote);
	}).map(({ id: e, from: t, to: n, quote: r }) => ({
		id: e,
		from: t,
		to: n,
		quote: r
	}));
}
function ve(e) {
	let t = (e) => (e.resolvedAt ? 2 : 0) + +!!e.orphaned;
	return [...e].sort((e, n) => t(e) - t(n) || e.from - n.from || e.createdAt - n.createdAt);
}
function U(e, t) {
	return e.filter((e) => !e.orphaned && !e.resolvedAt && e.from <= t && t <= e.to);
}
function ye(e) {
	let t = e.filter((e) => e.resolvedAt).length;
	return {
		open: e.length - t,
		resolved: t
	};
}
function be(e, t) {
	if (e <= 0 && t <= 0) return V("Comments");
	let n = V(e === 1 ? "{count} comment" : "{count} comments", { count: Math.max(0, e) });
	return t > 0 ? `${n} · ${V("{count} resolved", { count: t })}` : n;
}
function xe(e, t) {
	let n = [], r = [...t].filter((e) => e.name.trim()).sort((e, t) => t.name.length - e.name.length), i = e;
	for (let e of r) {
		let t = `@${e.name.trim()}`;
		i.includes(t) && (n.push(e), i = i.split(t).join(" "));
	}
	return n;
}
function W(e, t) {
	let n = e.slice(0, t), r = n.lastIndexOf("@");
	if (r < 0 || r > 0 && !/\s/.test(n[r - 1])) return null;
	let i = n.slice(r + 1);
	return /\s/.test(i) || i.length > 40 ? null : {
		start: r,
		query: i
	};
}
function Se(e, t = Date.now(), n) {
	let r = n ?? de();
	if (!r.startsWith("en")) return Ce(r, e, t);
	let i = Math.round((t - e) / 1e3);
	if (i < 45) return "now";
	let a = Math.round(i / 60);
	if (a < 60) return `${a} minute${a === 1 ? "" : "s"} ago`;
	let o = Math.round(a / 60), s = new Date(e), c = new Date(t), l = (e) => Math.floor((e.getTime() - e.getTimezoneOffset() * 6e4) / 864e5), u = l(c) - l(s);
	return o < 24 && u === 0 ? `${o} hour${o === 1 ? "" : "s"} ago` : u === 1 ? "yesterday" : u < 7 ? `${u} days ago` : s.toLocaleDateString(n, {
		day: "numeric",
		month: "short",
		...s.getFullYear() === c.getFullYear() ? {} : { year: "numeric" }
	});
}
function Ce(e, t, n) {
	let r = new Intl.RelativeTimeFormat(e, { numeric: "auto" }), i = Math.round((n - t) / 1e3);
	if (i < 45) return r.format(0, "second");
	let a = Math.round(i / 60);
	if (a < 60) return r.format(-a, "minute");
	let o = Math.round(a / 60), s = new Date(t), c = new Date(n), l = (e) => Math.floor((e.getTime() - e.getTimezoneOffset() * 6e4) / 864e5), u = l(c) - l(s);
	return o < 24 && u === 0 ? r.format(-o, "hour") : u < 7 ? r.format(-u, "day") : s.toLocaleDateString(e, {
		day: "numeric",
		month: "short",
		...s.getFullYear() === c.getFullYear() ? {} : { year: "numeric" }
	});
}
var we = /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
function Te(e) {
	let t = e.trim();
	return we.test(t) ? [...t.split(/[\s　・]/)[0]].slice(0, 2).join("") : ([...t][0] ?? "?").toLocaleUpperCase();
}
var Ee = [
	["#2e9e1f", "#99ff73"],
	["#4b44e6", "#b3aeff"],
	["#c4417f", "#f5aad1"],
	["#d93b3b", "#ff8f8f"],
	["#b27a00", "#fec20d"],
	["#6f6b1f", "#d2cd72"]
];
function De(e) {
	if (e.colour) return e.colour;
	let t = 0;
	for (let n of e.id) t = t * 31 + n.charCodeAt(0) >>> 0;
	let [n, r] = Ee[t % Ee.length];
	return `light-dark(${n}, ${r})`;
}
//#endregion
//#region src/comments-markdown.ts
var Oe = /<!--aa:(start|end) ([A-Za-z0-9]{6})-->/g, ke = (e) => typeof e == "string" && /^\d{4}-\d\d-\d\dT.*Z$/.test(e) && Number.isFinite(Date.parse(e)), Ae = (e) => typeof e == "string" && R("account", e), G = (e) => typeof e == "string" && R("item", e), je = (e) => !!e && typeof e == "object" && !Array.isArray(e);
function Me(e) {
	if (!je(e) || !Array.isArray(e.threads) || e.threads.length > 1e4) throw Error("Expected threads array (at most 10000 threads).");
	let t = /* @__PURE__ */ new Set(), n = (e) => {
		if (!G(e) || t.has(e)) throw Error("Thread and comment IDs must be unique IDv1 item codes.");
		t.add(e);
	};
	for (let t of e.threads) {
		if (!je(t)) throw Error("Invalid thread.");
		if (n(t.id), typeof t.quote != "string" || !["open", "resolved"].includes(t.status) || !Array.isArray(t.comments) || !t.comments.length) throw Error("Invalid thread fields.");
		if (t.status === "resolved" && (!ke(t.resolved) || !Ae(t.resolvedBy))) throw Error("Resolved threads need resolved and resolvedBy.");
		for (let e of t.comments) {
			if (!je(e)) throw Error("Invalid comment.");
			if (n(e.id), !Ae(e.author) || !ke(e.created) || typeof e.body != "string" || !e.body.trim() || e.edited !== void 0 && !ke(e.edited)) throw Error("Invalid comment author, date or body.");
			if (e.mentions !== void 0 && (!Array.isArray(e.mentions) || !e.mentions.every(Ae))) throw Error("Invalid mentions.");
			if (e.reactions !== void 0 && (!je(e.reactions) || !Object.values(e.reactions).every((e) => Array.isArray(e) && e.every(Ae)))) throw Error("Invalid reactions.");
		}
	}
	return e.threads;
}
function Ne(e) {
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
function Pe(e) {
	return /aa-comments/.test(e) && Ne(e).fences.some((e) => /^aa-comments(?:\s|$)/.test(e.info));
}
function Fe(e) {
	let { fences: t, protectedAt: n } = Ne(e), r = [], i = [], a = [], o = t.filter((e) => /^aa-comments(?:\s|$)/.test(e.info));
	for (let t of o) {
		if (o.length > 1) {
			i.push("Multiple aa-comments blocks.");
			break;
		}
		if (t.info !== "aa-comments v1") i.push("Unsupported aa-comments version.");
		else if (!t.closed || e.slice(t.to).trim()) i.push("The aa-comments block must be closed and last.");
		else try {
			if (t.body.length > 2e6) throw Error("Comment metadata exceeds 2 MB.");
			a = Me(y(t.body));
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
	for (let t of e.matchAll(Oe)) {
		if (n(t.index) || e[t.index - 1] === "\\" || !G(t[2])) continue;
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
function Ie(e, t) {
	return t - e.spans.reduce((e, n) => e + Math.max(0, Math.min(t, n.to) - n.from), 0);
}
function K(e, t, n = !0) {
	let r = t;
	for (let t of e.spans) (t.from < r || n && !t.metadata && t.from === r) && (r += t.to - t.from);
	return r;
}
function Le(e) {
	if (!e.threads.length) return e.markdown;
	Me({ threads: e.threads });
	let t = [];
	for (let n of e.threads) {
		let r = e.anchors[n.id];
		!r || r.from < 0 || r.to <= r.from || r.to > e.markdown.length || t.push({
			at: r.from,
			text: `<!--aa:start ${n.id}-->`,
			order: 1
		}, {
			at: r.to,
			text: `<!--aa:end ${n.id}-->`,
			order: 0
		});
	}
	t.sort((e, t) => t.at - e.at || t.order - e.order || t.text.localeCompare(e.text));
	let n = e.markdown;
	for (let e of t) n = n.slice(0, e.at) + e.text + n.slice(e.at);
	let r = w({ threads: e.threads }), i = "`".repeat(Math.max(3, ...[...r.matchAll(/`+/g)].map((e) => e[0].length + 1)));
	return `${n}\n\n${i}aa-comments v1\n${r}${i}`;
}
function Re(e) {
	let t = Fe(e);
	if (t.diagnostics.length) throw Error(`Cannot export Markdown: ${t.diagnostics.join(" ")}`);
	return t.markdown;
}
function ze(e, t) {
	let n = pe(e.markdown, t), r = Object.create(null), i = e.threads.map((i) => {
		let a = e.anchors[i.id], o = a && me(a, n);
		return !o || o.from >= o.to ? i : (r[i.id] = o, {
			...i,
			quote: t.slice(o.from, o.to)
		});
	});
	return {
		...e,
		markdown: t,
		threads: i,
		anchors: r
	};
}
function Be(e, t, n, r = (/* @__PURE__ */ new Date()).toISOString()) {
	if (!Ae(t)) throw Error("Author must be an IDv1 account code.");
	if (!ke(r)) throw Error("Invalid UTC timestamp.");
	let i = Fe(e);
	if (i.diagnostics.length) throw Error(i.diagnostics.join(" "));
	let a = new Set(i.threads.flatMap((e) => [e.id, ...e.comments.map((e) => e.id)])), o = () => {
		let e;
		do
			e = ce("item");
		while (a.has(e));
		return a.add(e), e;
	}, s = "body" in n ? n.body : "";
	if ("body" in n && !s.trim()) throw Error("A comment cannot be empty.");
	let c = () => ({
		id: o(),
		author: t,
		created: r,
		body: s
	});
	if (n.type === "add") {
		let { from: e, to: t } = n;
		if (!Number.isInteger(e) || !Number.isInteger(t) || e < 0 || t <= e || t > i.markdown.length) throw Error("Invalid comment range.");
		let { protectedAt: r } = Ne(i.markdown), a = (e) => {
			let t = i.markdown.slice(0, e);
			return ["columns", "tabs"].some((e) => t.lastIndexOf(`<${e}>`) > t.lastIndexOf(`</${e}>`));
		};
		if (r(e) || r(t - 1) || a(e) || a(t - 1) || /<(?:columns|tabs)>/.test(i.markdown.slice(e, t))) throw Error("Select prose outside code and nested writing surfaces.");
		let s = {
			id: o(),
			quote: i.markdown.slice(e, t),
			status: "open",
			comments: [c()]
		};
		i.threads.push(s), i.anchors[s.id] = {
			from: e,
			to: t
		};
	} else {
		let e = i.threads.find((e) => "thread" in n ? e.id === n.thread : e.comments.some((e) => e.id === n.comment));
		if (!e) throw Error("Comment or thread not found.");
		if (n.type === "reply") {
			if (e.status === "resolved") throw Error("Reopen the thread before replying.");
			e.comments.push(c());
		} else if (n.type === "resolve") e.status = "resolved", e.resolved = r, e.resolvedBy = t;
		else if (n.type === "reopen") e.status = "open", delete e.resolved, delete e.resolvedBy;
		else if (n.type === "remove") {
			if (e.comments[0].author !== t) throw Error("Only the thread author may delete it.");
			i.threads = i.threads.filter((t) => t !== e);
		} else {
			let i = e.comments.find((e) => e.id === n.comment);
			if (n.type === "edit") {
				if (i.author !== t) throw Error("Only the author may edit a comment.");
				i.body = s, i.edited = r;
			} else {
				if (!n.emoji.trim() || n.emoji.length > 32) throw Error("Invalid reaction.");
				i.reactions ??= Object.create(null);
				let e = i.reactions[n.emoji] ?? [];
				i.reactions[n.emoji] = e.includes(t) ? e.filter((e) => e !== t) : [...e, t];
			}
		}
	}
	return Le(i);
}
//#endregion
//#region src/comments-editor.ts
function Ve(e, t, n) {
	if (t.comments) throw Error("Choose sourceComments or an external comments store, not both.");
	let r = t.sourceComments ?? {}, i = t.value ?? "", a = Fe(i);
	if (a.diagnostics.length) throw Error(a.diagnostics.join(" "));
	let o, s = [i], c = [], l = 0, u = !1, d = /* @__PURE__ */ new Set(), f = (e) => [r.me, ...r.people ?? []].find((t) => t?.id === e) ?? {
		id: e,
		name: e
	}, p = () => a.threads.map((e) => ({
		id: e.id,
		quote: a.anchors[e.id] ? a.markdown.slice(a.anchors[e.id].from, a.anchors[e.id].to) : e.quote,
		from: a.anchors[e.id]?.from ?? -1,
		to: a.anchors[e.id]?.to ?? -1,
		orphaned: !a.anchors[e.id],
		createdAt: Date.parse(e.comments[0].created),
		updatedAt: Math.max(...e.comments.map((e) => Date.parse(e.edited ?? e.created))),
		...e.status === "resolved" ? {
			resolvedAt: Date.parse(e.resolved),
			resolvedBy: f(e.resolvedBy)
		} : {},
		canDelete: e.comments[0].author === r.me?.id,
		comments: e.comments.map((e) => ({
			id: e.id,
			author: f(e.author),
			body: e.body,
			createdAt: Date.parse(e.created),
			...e.edited ? { editedAt: Date.parse(e.edited) } : {},
			mentions: e.mentions?.map(f),
			reactions: Object.entries(e.reactions ?? {}).filter(([, e]) => e.length).map(([e, t]) => ({
				emoji: e,
				count: t.length,
				reacted: t.includes(r.me?.id ?? ""),
				names: t.map((e) => f(e).name)
			}))
		}))
	})), m = () => {
		for (let e of d) e(p());
	}, h = (e, n = !1) => {
		if (e === i) return;
		i = e, a = Fe(i);
		let r = Date.now();
		n && l && r - l < 700 && s.length > 1 ? s[s.length - 1] = i : s.push(i), l = n ? r : 0, c = [], m(), t.onChange?.(i);
	}, g = async (t) => {
		if (u || o.readOnly || !r.me) throw Error("Comments are read only.");
		let n = Be(i, r.me.id, t);
		h(n), e.dispatchEvent(new Event("aa-change"));
	}, _ = {
		me: r.me,
		panel: r.panel,
		subscribe(e) {
			return d.add(e), e(p()), () => {
				d.delete(e);
			};
		},
		people(e) {
			return [r.me, ...r.people ?? []].filter((t) => !!t && t.name.toLowerCase().includes(e.toLowerCase()));
		},
		add(e, t) {
			return g({
				type: "add",
				from: e.from,
				to: e.to,
				body: t
			});
		},
		reply(e, t) {
			return g({
				type: "reply",
				thread: e,
				body: t
			});
		},
		edit(e, t) {
			return g({
				type: "edit",
				comment: e,
				body: t
			});
		},
		resolve(e, t) {
			return g({
				type: t ? "resolve" : "reopen",
				thread: e
			});
		},
		remove(e) {
			return g({
				type: "remove",
				thread: e
			});
		},
		react(e, t) {
			return g({
				type: "react",
				comment: e,
				emoji: t
			});
		}
	};
	o = n(e, {
		...t,
		sourceComments: void 0,
		comments: _,
		value: a.markdown,
		onChange(e) {
			let t = Math.abs(e.length - a.markdown.length) === 1 && !/\s$/.test(e);
			h(Le(ze(a, e)), t);
		}
	});
	let v = (n) => {
		i = n, a = Fe(n), o.value = a.markdown, m(), t.onChange?.(i), e.dispatchEvent(new Event("aa-change"));
	}, y = () => o.readOnly || s.length < 2 ? !1 : (c.push(s.pop()), l = 0, v(s[s.length - 1]), !0), b = () => {
		if (o.readOnly || !c.length) return !1;
		let e = c.pop();
		return s.push(e), l = 0, v(e), !0;
	};
	o.setHistoryProvider({
		undo: y,
		redo: b
	});
	let x = () => m();
	e.addEventListener("aa-change", x);
	let S = (e, t = !0) => K(a, e, t), C = (e) => Ie(a, e), w = {
		exportMarkdown: () => Re(i),
		undo: y,
		redo: b,
		selection() {
			let e = o.selection();
			return e && {
				start: S(e.start),
				end: S(e.end, e.start === e.end)
			};
		},
		selectRange(e, t = e) {
			o.selectRange(C(e), C(t));
		},
		replace(t, n, r) {
			if (o.readOnly) return;
			if (!Number.isInteger(t) || !Number.isInteger(n) || t < 0 || n < t || n > i.length) throw Error("Invalid source range.");
			let s = i.slice(0, t) + r + i.slice(n), c = Fe(s);
			if (c.diagnostics.length) throw Error(c.diagnostics.join(" "));
			c.markdown === a.markdown || /aa-comments|<!--aa:/.test(r) ? (o.value = c.markdown, h(s), e.dispatchEvent(new Event("aa-change"))) : o.replace(C(t), C(n), r);
		},
		rangeOf(e, t) {
			return o.rangeOf(C(e), C(t));
		},
		find(e, t) {
			return o.find(e, t).map((e) => ({
				start: S(e.start),
				end: S(e.end, !1)
			}));
		},
		activeBlock() {
			let e = o.activeBlock();
			return e && {
				...e,
				start: S(e.start),
				end: S(e.end, !1)
			};
		},
		decorate(e, t) {
			o.decorate(e.map((e) => ({
				...e,
				from: C(e.from),
				to: C(e.to)
			})), t);
		},
		transaction(e) {
			o.transaction(e);
		},
		setHistoryProvider(e) {
			if (e) throw Error("Source comments require revision-checked document writes; the Yjs text adapter is not supported yet.");
			o.setHistoryProvider({
				undo: y,
				redo: b
			});
		},
		destroy() {
			u = !0, e.removeEventListener("aa-change", x), d.clear(), o.destroy();
		}
	};
	return new Proxy(o, {
		get(e, t) {
			if (t === "value") return i;
			if (t in w) return Reflect.get(w, t);
			if (t === "comments") {
				let t = e.comments;
				return t && {
					open: t.open,
					start: t.start,
					close: t.close,
					get threads() {
						return t.threads.map((e) => ({
							...e,
							from: e.orphaned ? -1 : S(e.from),
							to: e.orphaned ? -1 : S(e.to, !1)
						}));
					}
				};
			}
			return Reflect.get(e, t);
		},
		set(e, t, n) {
			if (t !== "value") return Reflect.set(e, t, n);
			if (n === i) return !0;
			let r = Fe(n);
			if (r.diagnostics.length) throw Error(r.diagnostics.join(" "));
			return i = n, a = r, o.value = r.markdown, s = [i], c = [], l = 0, m(), !0;
		}
	});
}
//#endregion
//#region src/markdown.ts
var He = /^ {0,3}(#{1,6})[ \t]+/, Ue = /^ *(?:([-*+])|(\d{1,9})[.)])[ \t]+(?:\[([ xX])\][ \t]+)?/, We = /^ {0,3}>[ \t]?/, Ge = /^ {0,3}(`{3,}|~{3,})/, Ke = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/, qe = [
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
], Je = /^>\s*\[!([^\]\n]*)\](-)?[ \t]*/;
function Ye(e) {
	let t = Je.exec(e);
	if (!t) return null;
	let n = "", r, i;
	for (let e of t[1].trim().split(/\s+/).filter(Boolean)) {
		let t = e.toLowerCase();
		qe.includes(t) ? i = t : /^[a-z]+$/i.test(e) ? n = t : r = e;
	}
	return {
		kind: n,
		icon: r,
		color: i,
		folded: !!t[2],
		length: t[0].length
	};
}
function Xe(e) {
	return `> [!${[
		e.kind,
		e.icon,
		e.color
	].filter(Boolean).join(" ")}]${e.folded ? "-" : ""}`;
}
function Ze(e) {
	return e.icon !== void 0 || e.color !== void 0 || !e.kind;
}
var Qe = /^\s*<columns>\s*$/, $e = /^\s*<\/columns>\s*$/, et = /^\s*<column>\s*$/, tt = /^\s*<\/column>\s*$/;
function nt(e) {
	let t = [], n = null;
	for (let r of e.replace(/\r\n?/g, "\n").split("\n")) Qe.test(r) || $e.test(r) || (et.test(r) ? (n = [], t.push(n)) : tt.test(r) ? n = null : n && n.push(r.replace(/^\t{1,2}/, "")));
	let r = t.map((e) => e.join("\n").replace(/^\n+|\n+$/g, ""));
	return r.length ? r : ["", ""];
}
function rt(e) {
	return [
		"<columns>",
		...e.flatMap((e) => [
			"<column>",
			...e ? [e] : [],
			"</column>"
		]),
		"</columns>"
	].join("\n");
}
var it = /^\s*<table_of_contents\s*\/>\s*$/, at = /^\s*<tabs>\s*$/, ot = /^\s*<\/tabs>\s*$/, st = /^\s*<tab\b([^>]*)>\s*$/, ct = /^\s*<\/tab>\s*$/, lt = (e) => e.replace(/&quot;/g, "\"").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"), ut = (e) => e.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, " ");
function dt(e) {
	let t = [], n = null;
	for (let r of e.replace(/\r\n?/g, "\n").split("\n")) {
		if (at.test(r) || ot.test(r)) continue;
		let e = st.exec(r);
		if (e) {
			let r = {};
			for (let t of e[1].matchAll(/([a-z]+)="([^"]*)"/g)) r[t[1]] = lt(t[2]);
			n = {
				name: r.name ?? "",
				...r.icon ? { icon: r.icon } : {},
				content: "",
				lines: []
			}, t.push(n);
		} else ct.test(r) ? n = null : n && n.lines.push(r.replace(/^\t{1,2}/, ""));
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
function ft(e) {
	return [
		"<tabs>",
		...e.flatMap((e) => [
			`<tab name="${ut(e.name)}"${e.icon ? ` icon="${ut(e.icon)}"` : ""}>`,
			...e.content ? [e.content] : [],
			"</tab>"
		]),
		"</tabs>"
	].join("\n");
}
function pt(e, t, n, r) {
	let i = gt(e), a = i[t], o = i[n];
	if (t === n || !a || !o || a.kind === "columns") return null;
	let s = o.kind === "columns" ? nt(o.source) : [o.source];
	r === "start" ? s.unshift(a.source) : s.push(a.source);
	let c = i.filter((e, n) => n !== t).map((e) => e === o ? {
		...e,
		kind: "columns",
		prefix: 9,
		source: rt(s)
	} : e), l = Math.min(t, n), u = Math.max(t, n);
	return {
		start: i[l].start,
		end: i[u].start + i[u].source.length,
		text: _t(c.slice(l, u))
	};
}
function mt(e, t) {
	let n = Ge.exec(e);
	return !!n && n[1][0] === t[0] && n[1].length >= t.length && !e.slice(n[0].length).trim();
}
function ht(e) {
	return !!e.trim() && !Ge.test(e) && !Ke.test(e) && !He.test(e) && !Ue.test(e) && !We.test(e) && !Qe.test(e) && !at.test(e) && !it.test(e);
}
function gt(e) {
	let t = e.replace(/\r\n?/g, "\n").split("\n"), n = [], r = 0;
	for (let e of t) n.push(r), r += e.length + 1;
	let i = [], a = (e, r, a, o = {}) => {
		i.push({
			kind: e,
			source: t.slice(r, a + 1).join("\n"),
			prefix: 0,
			...o,
			start: n[r]
		});
	}, o = 0;
	for (; o < t.length;) {
		let e = t[o];
		if (e.trim() === "$$") {
			let n = o + 1;
			for (; n < t.length && t[n].trim() !== "$$";) n++;
			a("equation", o, Math.min(n, t.length - 1), { prefix: e.length }), o = n + 1;
			continue;
		}
		if (o + 1 < t.length && e.includes("|") && /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(t[o + 1])) {
			let e = o + 1;
			for (; e + 1 < t.length && t[e + 1].trim() && t[e + 1].includes("|");) e++;
			a("table", o, e), o = e + 1;
			continue;
		}
		if (Qe.test(e)) {
			let n = o + 1;
			for (; n < t.length && !$e.test(t[n]);) n++;
			a("columns", o, Math.min(n, t.length - 1), { prefix: e.length }), o = n + 1;
			continue;
		}
		if (it.test(e)) {
			a("toc", o, o), o++;
			continue;
		}
		if (at.test(e)) {
			let n = o + 1;
			for (; n < t.length && !ot.test(t[n]);) n++;
			a("tabs", o, Math.min(n, t.length - 1), { prefix: e.length }), o = n + 1;
			continue;
		}
		let n = Ge.exec(e);
		if (n) {
			let r = o + 1;
			for (; r < t.length && !mt(t[r], n[1]);) r++;
			a("code", o, Math.min(r, t.length - 1), { prefix: e.length }), o = r + 1;
			continue;
		}
		if (!e.trim()) {
			o++;
			continue;
		}
		if (Ke.test(e)) {
			a("divider", o, o, { prefix: e.length }), o++;
			continue;
		}
		let r = He.exec(e);
		if (r) {
			a("heading", o, o, {
				level: r[1].length,
				prefix: r[0].length
			}), o++;
			continue;
		}
		let s = Ue.exec(e);
		if (s) {
			let t = /^ */.exec(e)[0].length, n = i[i.length - 1], r = 0;
			t && n?.kind === "bullet" ? r = t > (n.indent ?? 0) ? (n.depth ?? 0) + 1 : [...i].reverse().find((e) => e.kind === "bullet" && (e.indent ?? 0) <= t)?.depth ?? 1 : t && (r = Math.floor(t / (s[2] ? 3 : 2))), a("bullet", o, o, {
				prefix: s[0].length,
				indent: t,
				depth: r,
				checked: s[3] === void 0 ? void 0 : s[3] !== " ",
				number: s[2] ? Number(s[2]) : void 0
			}), o++;
			continue;
		}
		if (We.test(e)) {
			let n = o;
			for (; n + 1 < t.length && We.test(t[n + 1]);) n++;
			let r = Ye(e), i = r ? /^(#{1,6})\s+/.exec(e.slice(r.length)) : null;
			a(r ? "callout" : "quote", o, n, r ? {
				level: i?.[1].length,
				prefix: r.length + (i?.[0].length ?? 0),
				callout: r.kind,
				folded: r.folded,
				...r.icon === void 0 ? {} : { icon: r.icon },
				...r.color ? { color: r.color } : {},
				...Ze(r) ? { box: !0 } : {}
			} : { prefix: We.exec(e)[0].length }), o = n + 1;
			continue;
		}
		let c = o;
		for (; c + 1 < t.length && ht(t[c + 1]);) c++;
		a("paragraph", o, c), o = c + 1;
	}
	i.length || i.push({
		kind: "paragraph",
		source: "",
		prefix: 0,
		start: 0
	});
	let s = /^\n+/.exec(e)?.[0] ?? "", c = e.length > s.length ? /\n+$/.exec(e)?.[0] ?? "" : "", l = i[0], u = i[i.length - 1];
	return s && l.kind === "paragraph" && (l.source = s + l.source, l.start = 0), c && u.kind === "paragraph" && (u.source += c), i;
}
function _t(e) {
	let t = "";
	return e.forEach((n, r) => {
		r && (t += e[r - 1].kind === "bullet" && n.kind === "bullet" ? "\n" : "\n\n"), t += n.source;
	}), t;
}
function vt(e) {
	let t = e.source.split("\n");
	return t.length > 1 && mt(t[t.length - 1], Ge.exec(t[0])[1]);
}
function yt(e, t) {
	if (e.kind !== "code" || !vt(e)) return;
	let n = e.source.slice(0, e.prefix).replace(/^ {0,3}(`{3,}|~{3,})/, "").trim().toLowerCase().split(/\s+/)[0];
	return n ? t.find((e) => e.fence?.toLowerCase() === n) : void 0;
}
function bt(e, t, n) {
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
var xt = bt("image", /!\[[^\]\n]*\]\([^\s()]+(?: "w\d+")?\)/);
function St(e) {
	let [, t = "", n = "", r] = /^!\[([^\]]*)\]\(([^\s)]*)(?: "w(\d+)")?\)$/.exec(e) ?? [];
	return {
		alt: t,
		src: n,
		width: r ? Number(r) : null
	};
}
function Ct(e, t, n) {
	return `![${e}](${t}${n ? ` "w${n}"` : ""})`;
}
var wt = bt("equation", /\$(?!\$)(?:\\.|[^$\n])+\$/), q = [xt, wt], Tt = [
	"gray",
	"red",
	"orange",
	"green",
	"blue",
	"purple"
], Et = [
	"gray",
	"yellow",
	"orange",
	"green",
	"blue",
	"purple",
	"red"
], Dt = /_background$/, Ot = /<u>|<span color="([a-z_]+)">/y, kt = /\[([^[\]]*)\]\(([^\s()]*)\)/y, At = /(?:https?:\/\/|www\.)[^\s<>()]*[^\s<>().,;:!?'"]/g, jt = /[!-/:-@[-`{-~]/, Mt = (e) => !!e && (/[A-Za-z0-9]/.test(e) || e > "" && /[\p{L}\p{N}]/u.test(e)), Nt = (e) => !e || /\s/.test(e), Pt = {
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
function Ft(e, t, n, r, i) {
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
		} else if (p === "\\" && o + 1 < m && jt.test(e[o + 1])) a.push({
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
				kt.lastIndex = o;
				let t = kt.exec(e);
				if (t && o + t[0].length <= n) {
					d = {
						type: "link",
						at: o,
						href: t[2],
						close: o + 1 + t[1].length,
						end: o + t[0].length,
						group: [o, o + t[0].length]
					}, a.push(d), l = d.close, u = d.end, o++;
					continue;
				}
			}
			if (p === "<") {
				Ot.lastIndex = o;
				let t = Ot.exec(e);
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
			if (Pt[p]) {
				let n = 1;
				for (; o + n < m && e[o + n] === p;) n++;
				let r = n >= 2;
				if (r || Pt[p].one) {
					let i = a[a.length - 1], c = o === s || e[o - 1] === "\n" || i?.type === "break" && i.at + 1 + i.prefix === o, l = o === t ? void 0 : c ? "\n" : e[o - 1], u = o + n < m ? e[o + n] : void 0, d = c && o > t && !Nt(e[e.lastIndexOf("\n", o - 1) - 1]) && (!u || u === "\n"), f = !Nt(u) && !(p === "_" && Mt(l)), h = (!Nt(l) || d) && !(p === "_" && Mt(u));
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
							looseOpen: r && !f && !!u && Nt(l),
							looseClose: r && !h && !!l && Nt(u),
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
function It(e) {
	let t = e.flatMap((e) => e.type === "delimiters" ? [e.run] : []), n = (e) => e.length - e.left - e.right;
	for (let e = 0; e < t.length; e++) {
		let r = t[e];
		if (r.closes || r.looseClose) for (; n(r) > 0;) {
			let i = -1, a = 0;
			for (let o = e - 1; o >= 0; o--) {
				let e = t[o];
				if (e.char !== r.char || !n(e) || !(e.opens || e.looseOpen) || !e.opens && !r.closes) continue;
				let s = e.opens && e.closes || r.opens && r.closes, c = n(e), l = n(r);
				if (!(s && (c + l) % 3 == 0 && (c % 3 || l % 3) && (c % 2 || l % 2)) && (a = Math.min(n(e), n(r)) >= 2 ? 2 : +!!Pt[r.char].one, a)) {
					i = o;
					break;
				}
			}
			if (i < 0) break;
			let o = t[i], s = o.at + o.length - o.right - a, c = r.at + r.left, l = a === 2 ? Pt[r.char].two : Pt[r.char].one, u = [s, c + a];
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
function Lt(e) {
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
function Rt(e, t, n, r, i, a) {
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
	for (let e of o.matchAll(At)) {
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
function zt(e, t, n, r, i, a, o) {
	let s = Ft(e, t, n, a, o);
	It(s), Lt(s);
	let c = {
		bold: 0,
		italic: 0,
		strike: 0,
		highlight: 0,
		underline: 0
	}, l = [], u, d = t, f = () => {
		let e = {};
		c.bold && (e.bold = !0), c.italic && (e.italic = !0), c.strike && (e.strike = !0), c.highlight && (e.highlight = !0), c.underline && (e.underline = !0);
		for (let { color: t } of l) Dt.test(t) ? e.background = t.replace(Dt, "") : e.color = t;
		return u !== void 0 && (e.href = u), e;
	}, p = (t) => Rt(e, d, t, r, f(), i), m = (e, t, n, a = !1) => {
		p(e), i.push({
			kind: "syntax",
			from: r + e,
			to: r + t,
			group: [r + n[0], r + n[1]],
			...a ? { lone: !0 } : {}
		}), d = t;
	};
	for (let e of s) switch (e.type) {
		case "break":
			p(e.at), i.push({
				kind: "break",
				from: r + e.at,
				to: r + e.at + 1
			}), e.prefix && i.push({
				kind: "syntax",
				from: r + e.at + 1,
				to: r + e.at + 1 + e.prefix,
				prefix: !0
			}), d = e.at + 1 + e.prefix;
			break;
		case "code": {
			let t = [e.at, e.close + e.ticks];
			m(e.at, e.at + e.ticks, t), e.close > d && i.push({
				kind: "text",
				from: r + d,
				to: r + e.close,
				...f(),
				code: !0
			}), d = e.close, m(e.close, e.close + e.ticks, t);
			break;
		}
		case "atom":
			p(e.at), i.push({
				kind: "atom",
				atom: e.name,
				from: r + e.at,
				to: r + e.at + e.length,
				...f(),
				...e.name === "equation" ? { group: [r + e.at, r + e.at + e.length] } : {}
			}), d = e.at + e.length;
			break;
		case "escape":
			p(e.at), i.push({
				kind: "syntax",
				from: r + e.at,
				to: r + e.at + 1,
				escape: !0
			}), d = e.at + 1;
			break;
		case "delimiters":
			for (let t of [...e.run.used].sort((e, t) => e.at - t.at)) t.opening || (p(t.at), c[t.mark]--, d = t.at), m(t.at, t.at + t.length, t.group), t.opening && c[t.mark]++;
			break;
		case "tag":
			if (m(e.at, e.at + e.length, e.group, e.lone), e.closing) {
				if (e.lone) break;
				e.mark === "underline" ? c.underline-- : l.splice(l.findIndex((t) => t.id === e.id), 1);
			} else e.mark === "underline" ? c.underline++ : l.push({
				id: e.id,
				color: e.color
			});
			break;
		case "link":
			m(e.at, e.at + 1, e.group), u = e.href;
			break;
		case "link-end": p(e.at), d = e.at, u = void 0, m(e.at, e.end, e.group);
	}
	p(n);
}
function Bt(e, t = q) {
	let n = [], r = e.source.split("\n"), i = e.kind === "code" && vt(e);
	if (e.kind === "equation") return [{
		kind: "atom",
		atom: "equation-block",
		from: 0,
		to: e.source.length,
		group: [0, e.source.length]
	}];
	if (e.kind === "columns") return [{
		kind: "atom",
		atom: "columns",
		from: 0,
		to: e.source.length
	}];
	if (e.kind === "toc") return [{
		kind: "atom",
		atom: "toc",
		from: 0,
		to: e.source.length
	}];
	if (e.kind === "tabs") return [{
		kind: "atom",
		atom: "tabs",
		from: 0,
		to: e.source.length
	}];
	let a = yt(e, t);
	if (a) return [{
		kind: "atom",
		atom: a.name,
		from: 0,
		to: e.source.length,
		group: [0, e.source.length]
	}];
	if (e.kind === "paragraph") return zt(e.source, 0, e.source.length, 0, n, t), n;
	if (e.kind === "quote" || e.kind === "callout") {
		let i = e.kind === "callout" ? e.prefix : We.exec(r[0])?.[0].length ?? 0;
		return i && n.push({
			kind: "syntax",
			from: 0,
			to: i,
			prefix: !0
		}), zt(e.source, i, e.source.length, 0, n, t, (t) => {
			let n = e.source.indexOf("\n", t);
			return We.exec(e.source.slice(t, n < 0 ? e.source.length : n))?.[0].length ?? 0;
		}), n;
	}
	let o = 0;
	return r.forEach((a, s) => {
		if (s && n.push({
			kind: "break",
			from: o - 1,
			to: o
		}), e.kind === "code") s === 0 || i && s === r.length - 1 ? n.push({
			kind: "syntax",
			from: o,
			to: o + a.length,
			prefix: !0
		}) : a && n.push({
			kind: "text",
			from: o,
			to: o + a.length,
			code: !0
		});
		else if (e.kind === "divider") n.push({
			kind: "syntax",
			from: o,
			to: o + a.length,
			prefix: !0
		});
		else {
			let r = s === 0 && (e.kind === "heading" || e.kind === "bullet") ? e.prefix : 0;
			r && n.push({
				kind: "syntax",
				from: o,
				to: o + r,
				prefix: !0
			}), zt(a, r, a.length, o, n, t);
		}
		o += a.length + 1;
	}), n;
}
//#endregion
//#region src/rich.ts
var Vt = (e, t, n, r, i) => ({
	family: e,
	key: e,
	open: t,
	close: n,
	tight: r,
	rank: i
}), Ht = Vt("bold", "**", "**", !0, 2), Ut = Vt("italic", "*", "*", !0, 3), Wt = Vt("strike", "~~", "~~", !0, 4), Gt = Vt("highlight", "==", "==", !0, 5), Kt = Vt("underline", "<u>", "</u>", !1, 1), qt = Vt("code", "`", "`", !1, 7), Jt = (e) => ({
	family: "color",
	key: `color:${e}`,
	open: `<span color="${e}">`,
	close: "</span>",
	tight: !1,
	rank: 0
}), Yt = (e) => ({
	family: "background",
	key: `background:${e}`,
	open: `<span color="${e}_background">`,
	close: "</span>",
	tight: !1,
	rank: 0
}), Xt = (e) => ({
	family: "link",
	key: `link:${e}`,
	open: "[",
	close: `](${e})`,
	tight: !1,
	rank: 6
});
function Zt(e, t) {
	return e === "[" ? Xt(t.replace(/^\]\(|\)$/g, "")) : {
		"**": Ht,
		"*": Ut,
		"~~": Wt,
		"==": Gt,
		"<u>": Kt,
		"`": qt
	}[e] ?? null;
}
var Qt = /* @__PURE__ */ new Set([
	"paragraph",
	"heading",
	"bullet",
	"quote",
	"callout",
	"table"
]), $t = (e) => Qt.has(e.kind);
function en(e) {
	let t = [];
	return e.background && t.push(Yt(e.background)), e.color && t.push(Jt(e.color)), e.underline && t.push(Kt), e.bold && t.push(Ht), e.italic && t.push(Ut), e.strike && t.push(Wt), e.highlight && t.push(Gt), e.href !== void 0 && !e.autolink && t.push(Xt(e.href)), e.code && t.push(qt), t;
}
var tn = (e, t) => e.some((e) => e.key === t);
function nn(e, t = q) {
	let n = [], r = "";
	for (let i of Bt(e, t)) {
		let t = e.source.slice(i.from, i.to);
		if (i.kind === "syntax") {
			if (i.escape) r = t;
			else if (i.prefix) {
				let e = n[n.length - 1];
				if (e?.breaks) e.source += t, e.to = i.to;
				else for (let e = 0; e < t.length; e++) n.push({
					source: t[e],
					marks: [],
					from: i.from + e,
					to: i.from + e + 1,
					fixed: !0
				});
			}
			continue;
		}
		if (i.kind === "break") {
			n.push({
				source: t,
				marks: [],
				from: i.from,
				to: i.to,
				breaks: !0
			});
			continue;
		}
		let a = en(i);
		if (i.kind === "atom") n.push({
			source: t,
			marks: a,
			from: i.from,
			to: i.to
		});
		else {
			for (let e = 0; e < t.length; e++) {
				let o = e === 0 ? r : "";
				n.push({
					source: o + t[e],
					marks: a,
					from: i.from + e - o.length,
					to: i.from + e + 1
				});
			}
			r = "";
		}
	}
	return n.forEach((e, t) => {
		if (!e.breaks) return;
		let r = n[t - 1], i = n[t + 1];
		r && i && (e.marks = r.marks.filter((e) => tn(i.marks, e.key)));
	}), n;
}
var rn = (e) => !!e.breaks || /^\s+$/.test(e.source);
function an(e) {
	let t = e.map((e) => ({ ...e })), n = /* @__PURE__ */ new Map();
	for (let e of t) for (let t of e.marks) n.set(t.key, t);
	for (let [e, r] of n) {
		let n = (e) => r.tight ? rn(e) : !!e.breaks;
		for (let r = 0; r < t.length; r++) {
			if (!tn(t[r].marks, e)) continue;
			let i = r;
			for (; i + 1 < t.length && tn(t[i + 1].marks, e);) i++;
			let a = r, o = i;
			for (; a <= o && n(t[a]);) a++;
			for (; o >= a && n(t[o]);) o--;
			let s = t.slice(a, o + 1).every(rn);
			for (let n = r; n <= i; n++) (s || n < a || n > o) && (t[n].marks = t[n].marks.filter((t) => t.key !== e));
			r = i;
		}
	}
	return t;
}
function on(e) {
	let t = an(e);
	for (;;) {
		let e = sn(t);
		if (!e.loose.length) return {
			text: e.text,
			starts: e.starts,
			ends: e.ends,
			fitted: t
		};
		for (let { at: n, key: r } of e.loose) t[n] = {
			...t[n],
			marks: t[n].marks.filter((e) => e.key !== r)
		};
	}
}
function sn(e) {
	let t = [], n = [], r = [], i = [], a = "", o = (t, n) => {
		let r = t;
		for (; r + 1 < e.length && tn(e[r + 1].marks, n);) r++;
		return r;
	}, s = (n, r) => {
		for (; t.length > n;) {
			let { mark: n, close: o, from: s } = t.pop();
			a += o, n.tight && (rn(e[s]) && i.push({
				at: s,
				key: n.key
			}), r !== s && rn(e[r]) && i.push({
				at: r,
				key: n.key
			}));
		}
	};
	return e.forEach((i, c) => {
		let l = i.marks, u = l.filter((e) => !t.some((t) => t.mark.key === e.key)), d = 0;
		for (; d < t.length && tn(l, t[d].mark.key) && !(t[d].mark === qt && u.length);) d++;
		s(d, c - 1);
		let f = l.filter((e) => !t.some((t) => t.mark.key === e.key)).sort((e, t) => e.key === "code" ? 1 : t.key === "code" ? -1 : o(c, t.key) - o(c, e.key) || e.rank - t.rank);
		for (let n of f) {
			let r = n.open, i = n.close;
			if (n.key === "code") {
				let t = "";
				for (let n = c; n <= o(c, "code"); n++) t += e[n].source;
				r = i = "`".repeat(Math.max(0, ...Array.from(t.matchAll(/`+/g), (e) => e[0].length)) + 1);
			}
			a += r, t.push({
				mark: n,
				close: i,
				from: c
			});
		}
		n.push(a.length), a += i.source, r.push(a.length);
	}), s(0, e.length - 1), {
		text: a,
		starts: n,
		ends: r,
		loose: i
	};
}
function cn(e, t = q) {
	let n = Bt(e, t).filter((e) => e.kind !== "syntax");
	return {
		start: n[0]?.from ?? e.source.length,
		end: n[n.length - 1]?.to ?? e.source.length
	};
}
var ln = (e) => {
	let t = 0;
	for (let n of e) n.kind === "syntax" && n.group && !n.lone && t++;
	return t / 2;
}, un = (e, t = q) => ln(Bt(e, t)) > 0;
function dn(e, t, n) {
	let r = /* @__PURE__ */ new Set();
	for (let i of e) i.kind === "syntax" && i.group && !i.lone && i.group[0] >= t && i.group[1] <= n && r.add(i.group[0]);
	return r.size;
}
function fn(e, t, n, r) {
	let i = "", a = "";
	for (let o of t) {
		if (o.kind !== "text" && o.kind !== "atom") continue;
		let t = Math.max(o.from, n), s = Math.min(o.to, r);
		if (s <= t) continue;
		let c = en(o).map((e) => e.key).join(",");
		c !== a && (i += `\u0000${c}\u0000`, a = c), i += e.slice(t, s);
	}
	return i;
}
var pn = (e, t, n) => e.some((e) => e.kind === "syntax" && e.group && !e.lone && e.group[0] < t && e.group[1] > n), mn = (e, t) => {
	let n = 0;
	for (; n < e.length && e[n].to <= t;) n++;
	return n;
}, hn = (e, t) => {
	let n = 0;
	for (; n < e.length && e[n].from < t;) n++;
	return n;
}, gn = (e, t) => {
	let n = new Set(t.map((e) => e.family));
	return [...e.filter((e) => !n.has(e.family)), ...t];
};
function _n(e, t, n, r, i = q, a) {
	if (!$t(e)) return null;
	let o = Bt(e, i), s = ln(o);
	if (!a) {
		if (!s) return null;
		let a = e.source.slice(0, t) + r + e.source.slice(n), c = gt(a), l = 0;
		for (let e of c) l += ln(Bt(e, i));
		let u = r.length > 1 && !r.includes("\n") && un({
			kind: "paragraph",
			source: r,
			prefix: 0
		}, i), d = l >= s - dn(o, t, n) && !(u && pn(o, t, n)), f = !/[*_~=`<[\\\n]/.test(r), p = t + r.length, m = c.length === 1 ? Bt(c[0], i) : [];
		if (d && (!f || c.length > 1 || fn(e.source, o, 0, t) === fn(a, m, 0, t) && fn(e.source, o, n, Infinity) === fn(a, m, p, Infinity))) return null;
	}
	let c = nn(e, i), l = mn(c, t), u = t === n ? l : Math.max(l, hn(c, n));
	if (r.includes("\n")) {
		let e = on(c.slice(0, l)).text, t = on(c.slice(u)).text;
		return {
			source: e + r + t,
			caret: e.length + r.length
		};
	}
	let d = t < n ? c[l] : c[l - 1] ?? c[l], f = d && !d.fixed && !d.breaks ? d.marks : [], p = c.slice(0, l);
	if (a) {
		f = gn(f, a.add).filter((e) => !a.remove.includes(e.key));
		for (let e = Math.max(0, p.length - a.back); e < p.length; e++) p[e] = {
			...p[e],
			marks: gn(p[e].marks, a.add)
		};
	}
	let m = r ? nn({
		kind: "paragraph",
		source: r,
		prefix: 0
	}, i).map((e) => ({
		...e,
		marks: gn(f, e.marks)
	})) : [], h = [
		...p,
		...m,
		...c.slice(u)
	], g = on(h), _ = p.length + m.length - 1, v = _ < 0 ? 0 : g.ends[_], y = /* @__PURE__ */ new Map(), b = 0;
	if (r && /^\s+$/.test(r) || a) for (let e = _; e >= 0 && rn(h[e]); e--) {
		let t = h[e].marks.filter((t) => !tn(g.fitted[e].marks, t.key));
		if (!t.length) break;
		for (let e of t) y.set(e.key, e);
		b++;
	}
	return {
		source: g.text,
		caret: v,
		...y.size ? { carry: {
			add: [...y.values()],
			remove: [],
			back: b
		} } : {}
	};
}
function vn(e, t, n = q) {
	if (!$t(e) || !un(e, n)) return null;
	let r = nn(e, n), i = mn(r, t);
	return [on(r.slice(0, i)).text, on(r.slice(i)).text];
}
function yn(e, t, n, r, i, a = q) {
	if (!$t(e) || !$t(n) || !(un(e, a) || un(n, a))) return null;
	let o = nn(e, a), s = o.filter((e) => e.to <= t), c = nn(n, a).filter((e) => e.from >= r);
	if (i.includes("\n")) {
		let e = on(s).text;
		return {
			source: e + i + on(c).text,
			caret: e.length + i.length
		};
	}
	let l = o[s.length] ?? s[s.length - 1], u = l && !l.fixed && !l.breaks ? l.marks : [], d = i ? nn({
		kind: "paragraph",
		source: i,
		prefix: 0
	}, a).map((e) => ({
		...e,
		marks: gn(u, e.marks)
	})) : [], f = on([
		...s,
		...d,
		...c
	]), p = s.length + d.length - 1;
	return {
		source: f.text,
		caret: p < 0 ? 0 : f.ends[p]
	};
}
function bn(e, t, n, r = q) {
	if (!$t(e) || !un(e, r)) return null;
	let i = nn(e, r);
	return on(i.slice(mn(i, t), Math.max(mn(i, t), hn(i, n)))).text;
}
function xn(e, t, n, r, i = q) {
	let a = nn(e, i), o = a.slice(mn(a, t), hn(a, n)).filter((e) => !e.fixed && !rn(e));
	return {
		words: o.length > 0,
		all: o.length > 0 && o.every((e) => tn(e.marks, r))
	};
}
function Sn(e, t, n, r, i = q) {
	let a = nn(e, i), o = mn(a, t), s = Math.max(o, hn(a, n)), c = on(a.map((e, t) => {
		if (t < o || t >= s || e.fixed) return e;
		let n = [r.remove ?? []].flat(), i = e.marks.filter((e) => !n.includes(e.family) && !n.includes(e.key));
		return {
			...e,
			marks: r.add ? gn(i, [r.add]) : i
		};
	}));
	return {
		source: c.text,
		from: c.starts[o] ?? c.text.length,
		to: s > o ? c.ends[s - 1] : c.starts[o] ?? c.text.length
	};
}
function Cn(e, t, n, r = q) {
	let i = nn(e, r), a = i[mn(i, t) - 1];
	return !!a && !a.fixed && !a.breaks && tn(a.marks, n);
}
//#endregion
//#region src/document.ts
function wn(e) {
	return gt(e.replace(/\r\n?/g, "\n").replace(/^\n+|\n+$/g, "")).map(({ start: e, ...t }) => t);
}
var Tn = {
	kind: "paragraph",
	source: "",
	prefix: 0
};
function En(e) {
	return e.trim() ? wn(e) : [Tn];
}
var J = _t;
function Dn(e, t) {
	return e.block - t.block || e.offset - t.offset;
}
function On(e, t) {
	return Dn(e, t) <= 0 ? [e, t] : [t, e];
}
function kn(e, t, n, r, i) {
	let a = gt(r), o = a.map(({ start: e, ...t }) => t), s = [
		...e.slice(0, t),
		...o,
		...e.slice(n + 1)
	], c = {
		block: t + a.length - 1,
		offset: o[o.length - 1].source.length
	};
	for (let e = 0; e < a.length; e++) {
		let n = a[e];
		if (i < n.start) {
			c = {
				block: t + e,
				offset: 0
			};
			break;
		}
		if (i <= n.start + n.source.length) {
			c = {
				block: t + e,
				offset: i - n.start
			};
			break;
		}
	}
	return {
		blocks: s,
		caret: c
	};
}
function Y(e, t, n, r, i = q) {
	let [a, o] = On(t, n), s = a.block === o.block ? _n(e[a.block], a.offset, o.offset, r, i) : yn(e[a.block], a.offset, e[o.block], o.offset, r, i);
	if (s) return {
		...kn(e, a.block, o.block, s.source, s.caret),
		...s.carry ? { carry: s.carry } : {}
	};
	let c = e[a.block].source.slice(0, a.offset), l = e[o.block].source.slice(o.offset);
	return kn(e, a.block, o.block, c + r + l, c.length + r.length);
}
function An(e, t, n, r = n.length) {
	return kn(e, t, t, n, r);
}
function jn(e, t, n, r = q) {
	let [i, a] = On(t, n), o = (e, t, n) => bn(e, t, n, r) ?? e.source.slice(t, n);
	if (i.block === a.block) return o(e[i.block], i.offset, a.offset);
	let s = e[i.block], c = e[a.block];
	return _t([
		{
			...s,
			source: o(s, i.offset, s.source.length)
		},
		...e.slice(i.block + 1, a.block),
		{
			...c,
			source: o(c, 0, a.offset)
		}
	]);
}
function Mn(e) {
	let t = e.source.slice(0, e.prefix), n = e.checked === void 0 ? "" : "[ ] ";
	return e.number === void 0 ? t.replace(/\[[ xX]\][ \t]+$/, "") + n : t.replace(/\d+/, String(e.number + 1)).replace(/\[[ xX]\][ \t]+$/, "") + n;
}
function Nn(e, t, n = q) {
	let r = e[t.block], i = r.source, a = r.kind === "quote" ? null : vn(r, t.offset, n), o = a ? a[0] : i.slice(0, t.offset), s = a ? a[1] : i.slice(t.offset);
	if (r.kind === "code") {
		if (!(t.offset === i.length && vt(r))) return Y(e, t, t, "\n", n);
	} else if (r.kind === "bullet") {
		if (!i.slice(r.prefix).trim()) return r.depth ? Yn(e, {
			anchor: t.block,
			focus: t.block
		}, -1) : Y(e, {
			block: t.block,
			offset: 0
		}, {
			block: t.block,
			offset: i.length
		}, "");
		s = Mn(r) + s;
	} else if (r.kind === "quote") {
		let r = i.lastIndexOf("\n", t.offset - 1) + 1;
		if (!i.slice(r, t.offset).replace(We, "").trim() && !s.trim()) o = i.slice(0, Math.max(0, r - 1)), s = "";
		else return Y(e, t, t, "\n> ", n);
	}
	let c = En(o), l = En(s), u = [
		...e.slice(0, t.block),
		...c,
		...l,
		...e.slice(t.block + 1)
	], d = l[0], f = d.kind === "bullet" || d.kind === "quote" ? d.prefix : 0;
	return {
		blocks: u,
		caret: {
			block: t.block + c.length,
			offset: f
		}
	};
}
function Pn(e, t) {
	let n = e[t];
	return !n.prefix || n.kind === "code" || n.kind === "divider" ? null : Y(e, {
		block: t,
		offset: 0
	}, {
		block: t,
		offset: n.prefix
	}, "");
}
function Fn(e, t, n = q) {
	if (t === 0) return null;
	let r = e[t - 1], i = {
		block: t - 1,
		offset: r.source.length
	};
	return r.kind === "divider" ? Y(e, {
		block: t - 1,
		offset: 0
	}, {
		block: t,
		offset: 0
	}, "", n) : r.kind === "code" && e[t].source ? {
		blocks: [...e],
		caret: i
	} : {
		...Y(e, i, {
			block: t,
			offset: [
				"heading",
				"bullet",
				"quote",
				"callout"
			].includes(e[t].kind) ? e[t].prefix : 0
		}, "", n),
		caret: i
	};
}
function In(e, t, n = q) {
	if (t + 1 >= e.length) return null;
	let r = e[t + 1];
	if (r.kind === "divider") return Y(e, {
		block: t,
		offset: e[t].source.length
	}, {
		block: t + 1,
		offset: r.source.length
	}, "", n);
	let i = Fn(e, t + 1, n);
	return i && {
		...i,
		caret: {
			block: t,
			offset: e[t].source.length
		}
	};
}
function Ln(e, t, n, r, i = r, a = q) {
	let [o, s] = On(t, n), c = Zt(r, i);
	if (!c || Dn(o, s) === 0) return Rn(e, t, n, r, i);
	let l = (t) => [t === o.block ? Math.max(o.offset, e[t].prefix) : e[t].prefix, t === s.block ? s.offset : e[t].source.length], u = [], d = !1, f = !0;
	for (let t = o.block; t <= s.block; t++) {
		let n = e[t];
		if (!$t(n)) continue;
		let [r, i] = l(t), o = xn(n, r, i, c.key, a);
		o.words && (u.push(t), d = !0, f &&= o.all);
	}
	if (!d) return {
		blocks: [...e],
		anchor: o,
		focus: s
	};
	let p = [...e], m = o, h = s;
	for (let t of u.reverse()) {
		let [n, r] = l(t), i = Sn(e[t], n, r, f ? { remove: c.family } : { add: c }, a);
		p = An(p, t, i.source).blocks, t === o.block && (m = {
			block: t,
			offset: i.from
		}), t === s.block && (h = {
			block: t,
			offset: i.to
		});
	}
	return {
		blocks: p,
		anchor: m,
		focus: h
	};
}
function Rn(e, t, n, r, i) {
	let [a, o] = On(t, n);
	if (a.block !== o.block) {
		let t = [...e], n = a, s = o;
		for (let c = o.block; c >= a.block; c--) {
			let l = c === a.block ? Math.max(a.offset, e[c].prefix) : e[c].prefix, u = c === o.block ? o.offset : e[c].source.length, d = e[c].source;
			if (c === a.block && d.slice(l - r.length, l) === r && d.endsWith(i) && (u -= i.length), c === o.block && d.slice(u, u + i.length) === i && d.slice(l, l + r.length) === r && (l += r.length), u <= l || e[c].kind === "code" || e[c].kind === "divider") continue;
			let f = Rn(t, {
				block: c,
				offset: l
			}, {
				block: c,
				offset: u
			}, r, i);
			t = f.blocks, c === a.block && (n = f.anchor), c === o.block && (s = f.focus);
		}
		return {
			blocks: t,
			anchor: n,
			focus: s
		};
	}
	let s = e[a.block].source, c = s.slice(a.offset, o.offset), l = r.length, u = i.length, d = (e) => ({
		block: a.block,
		offset: e
	});
	if (s.slice(a.offset - l, a.offset) === r && s.slice(o.offset, o.offset + u) === i) return {
		blocks: Y(e, d(a.offset - l), d(o.offset + u), c).blocks,
		anchor: d(a.offset - l),
		focus: d(o.offset - l)
	};
	if (c.length > l + u && c.startsWith(r) && c.endsWith(i)) return {
		blocks: Y(e, a, o, c.slice(l, c.length - u)).blocks,
		anchor: a,
		focus: d(o.offset - l - u)
	};
	let f = [
		"**",
		"*",
		"~~",
		"==",
		"<u>"
	].includes(r), p = f ? c.match(/^\s*/)?.[0] ?? "" : "", m = f ? c.slice(p.length).match(/\s*$/)?.[0] ?? "" : "", h = c.slice(p.length, c.length - m.length);
	return c && !h ? {
		blocks: [...e],
		anchor: a,
		focus: o
	} : {
		blocks: Y(e, a, o, p + r + h + i + m).blocks,
		anchor: d(a.offset + p.length + l),
		focus: d(a.offset + p.length + l + h.length)
	};
}
function zn(e, t, n, r, i = q) {
	return Vn(e, t, n, r ? { add: Jt(r) } : { remove: "color" }, i);
}
function Bn(e, t, n, r, i = q) {
	return r ? Vn(e, t, n, r === "yellow" ? {
		add: Gt,
		remove: "background"
	} : {
		add: Yt(r),
		remove: "highlight"
	}, i) : Vn(e, t, n, { remove: ["background", "highlight"] }, i);
}
function Vn(e, t, n, r, i) {
	let [a, o] = On(t, n), s = [...e], c = a, l = o, u = !1;
	for (let t = o.block; t >= a.block; t--) {
		let n = e[t];
		if (!$t(n)) continue;
		let d = t === a.block ? Math.max(a.offset, n.prefix) : n.prefix, f = t === o.block ? o.offset : n.source.length;
		if (f <= d) continue;
		let p = Sn(n, d, f, r, i);
		p.source !== n.source && (s = An(s, t, p.source).blocks, u = !0, t === a.block && (c = {
			block: t,
			offset: p.from
		}), t === o.block && (l = {
			block: t,
			offset: p.to
		}));
	}
	return u ? {
		blocks: s,
		anchor: c,
		focus: l
	} : null;
}
function Hn(e, t) {
	let n = e[t];
	if (n.kind !== "bullet" || n.checked === void 0) return null;
	let r = n.source.indexOf("[") + 1;
	return Y(e, {
		block: t,
		offset: r
	}, {
		block: t,
		offset: r + 1
	}, n.checked ? " " : "x");
}
function Un(e, t, n = t) {
	let r = (t) => Math.max(0, Math.min(e.length - 1, t));
	return {
		anchor: r(t),
		focus: r(n)
	};
}
function Wn(e, t, n) {
	let r = Math.min(t.anchor, t.focus), i = Math.max(t.anchor, t.focus), a = e.flatMap((e, t) => {
		if (t < r || t > i) return [e];
		let a = e.source.slice(e.prefix);
		if (e.kind === "code") {
			let t = e.source.split("\n").slice(1);
			vt(e) && t.pop(), a = t.join("\n");
		} else e.kind === "quote" || e.kind === "callout" ? a = e.source.split("\n").map((t, n) => n === 0 ? t.slice(e.prefix) : t.replace(We, "")).join("\n") : e.kind === "divider" && (a = "");
		let o = {
			paragraph: "",
			h1: "# ",
			h2: "## ",
			h3: "### ",
			todo: "- [ ] ",
			bullet: "- ",
			numbered: `${t - r + 1}. `,
			quote: "> ",
			code: "",
			divider: "",
			callout: "> [!💡] ",
			toggle: "> [!note]- ",
			"toggle-h1": "> [!note]- # ",
			"toggle-h2": "> [!note]- ## ",
			"toggle-h3": "> [!note]- ### ",
			table: "",
			equation: ""
		}[n], s = "`".repeat(Math.max(3, ...Array.from(a.matchAll(/`+/g), (e) => e[0].length + 1)));
		return gt(n === "code" ? `${s}\n${a}\n${s}` : n === "divider" ? "---" : n === "equation" ? `$$\n${a}\n$$` : n === "table" ? "| Column 1 | Column 2 |\n| --- | --- |\n|  |  |" : n === "callout" || n.startsWith("toggle") ? o + a.split("\n").join("\n> ") : a.split("\n").map((e) => o + e).join("\n")).map(({ start: e, ...t }) => t);
	});
	return {
		blocks: a,
		caret: {
			block: r,
			offset: a[r].prefix
		}
	};
}
function Gn(e, t) {
	let n = Math.min(t.anchor, t.focus), r = Math.max(t.anchor, t.focus), i = [...e.slice(0, n), ...e.slice(r + 1)];
	i.length || i.push({ ...Tn });
	let a = Math.min(n, i.length - 1);
	return {
		blocks: i,
		caret: {
			block: a,
			offset: i[a].prefix
		}
	};
}
function Kn(e, t) {
	let n = Math.min(t.anchor, t.focus), r = Math.max(t.anchor, t.focus), i = e.slice(n, r + 1).map((e) => ({ ...e }));
	return {
		blocks: [
			...e.slice(0, r + 1),
			...i,
			...e.slice(r + 1)
		],
		caret: {
			block: r + 1,
			offset: i[0].prefix
		}
	};
}
function qn(e, t, n) {
	let r = Math.min(t.anchor, t.focus), i = Math.max(t.anchor, t.focus);
	if (n < 0 ? r === 0 : i === e.length - 1) return null;
	let a = [...e], o = a.splice(r, i - r + 1);
	return a.splice(r + n, 0, ...o), {
		blocks: a,
		caret: {
			block: r + n,
			offset: o[0].prefix
		}
	};
}
function Jn(e) {
	let t = /* @__PURE__ */ new Map();
	return e.map((e) => {
		if (e.kind !== "bullet") return t.clear(), e;
		let n = e.indent ?? 0;
		for (let e of t.keys()) e > n && t.delete(e);
		if (e.number === void 0) return t.delete(n), e;
		let r = t.has(n) ? t.get(n) + 1 : e.number;
		if (t.set(n, r), r === e.number) return e;
		let i = e.source.replace(/^( *)(\d+)/, `$1${r}`);
		return {
			...e,
			source: i,
			number: r,
			prefix: e.prefix + String(r).length - String(e.number).length
		};
	});
}
function Yn(e, t, n) {
	let r = Math.min(t.anchor, t.focus), i = Math.max(t.anchor, t.focus), a = e[r];
	if (a.kind !== "bullet" || n === 1 && (r === 0 || e[r - 1].kind !== "bullet") || n === -1 && !(a.indent ?? 0)) return null;
	let o = e[r - 1], s = o?.indent ?? 0, c = n === 1 ? Math.max(0, s + (o.number === void 0 ? 2 : 3) - (a.indent ?? 0)) : -Math.min(a.indent ?? 0, a.number === void 0 ? 2 : 3);
	if (!c) return null;
	let l = e.map((e, t) => {
		if (t < r || t > i || e.kind !== "bullet") return e;
		let a = c > 0 ? " ".repeat(c) + e.source : e.source.slice(Math.min(-c, e.indent ?? 0));
		return {
			...e,
			source: a,
			prefix: e.prefix + a.length - e.source.length,
			indent: Math.max(0, (e.indent ?? 0) + c),
			depth: Math.max(0, (e.depth ?? 0) + n)
		};
	});
	return {
		blocks: Jn(l),
		caret: {
			block: r,
			offset: l[r].prefix
		}
	};
}
function Xn(e, t, n) {
	let r = e[t];
	if (r.kind !== "callout") return null;
	let i = n === void 0 ? !r.folded : !n, a = r.source.replace(/^(>\s*\[![^\]\n]*\])-?/, `$1${i ? "-" : ""}`), o = [...e];
	return o[t] = {
		...r,
		source: a,
		folded: i,
		prefix: r.prefix + a.length - r.source.length
	}, {
		blocks: o,
		caret: {
			block: t,
			offset: o[t].prefix
		}
	};
}
function Zn(e, t, n) {
	let r = e[t];
	if (r.kind !== "callout") return null;
	let i = Ye(r.source);
	if (!i) return null;
	let a = n.icon === void 0 ? i.icon : n.icon ?? void 0, o = n.color === void 0 ? i.color : n.color ?? void 0, s = Xe({
		kind: a !== void 0 || o !== void 0 ? "" : i.kind,
		icon: a,
		color: o,
		folded: i.folded
	}), c = r.source.slice(i.length), l = s + (/[ \t]*$/.exec(r.source.slice(0, i.length))[0] || (c && !c.startsWith("\n") ? " " : "")) + c, u = [...e];
	return u[t] = gt(l).map(({ start: e, ...t }) => t)[0], {
		blocks: u,
		caret: {
			block: t,
			offset: u[t].prefix
		}
	};
}
//#endregion
//#region src/history.ts
var Qn = class {
	past = [];
	future = [];
	lastKind = null;
	lastTime = 0;
	lastBlock = -1;
	constructor(e) {
		this.past.push(e);
	}
	get current() {
		return this.past[this.past.length - 1];
	}
	reset(e) {
		this.past = [e], this.future = [], this.lastKind = null;
	}
	record(e, t, n = Date.now()) {
		t !== "edit" && t === this.lastKind && n - this.lastTime < 700 && e.focus.block === this.lastBlock && !(t === "type" && $n(e)) ? this.past[this.past.length - 1] = e : this.past.push(e), this.future = [], this.lastKind = t, this.lastTime = n, this.lastBlock = e.focus.block;
	}
	undo() {
		if (this.past.length < 2) return null;
		let e = this.past.pop();
		this.future.push(e), this.lastKind = null;
		let t = tr(this.current.blocks, e.blocks);
		return t ? {
			...this.current,
			anchor: t,
			focus: t
		} : this.current;
	}
	redo() {
		let e = this.future.pop();
		return e ? (this.past.push(e), this.lastKind = null, e) : null;
	}
}, $n = ({ blocks: e, focus: t }) => {
	let n = e[t.block]?.source ?? "";
	return /\s/.test(n[t.offset - 1] ?? "") && /\S/.test(n[t.offset - 2] ?? "");
}, er = (e, t) => e === t || e.kind === t.kind && e.source === t.source;
function tr(e, t) {
	let n = 0;
	for (; n < e.length && n < t.length && er(e[n], t[n]);) n++;
	if (n === e.length && n === t.length) return null;
	let r = e.length, i = t.length;
	for (; r > n && i > n && er(e[r - 1], t[i - 1]);) r--, i--;
	if (r === n) return n > 0 ? {
		block: n - 1,
		offset: e[n - 1].source.length
	} : {
		block: 0,
		offset: 0
	};
	let a = e[r - 1].source;
	if (i === n) return {
		block: r - 1,
		offset: a.length
	};
	let o = t[i - 1].source, s = 0;
	if (r - 1 === n && i - 1 === n) for (; s < a.length && s < o.length && a[s] === o[s];) s++;
	let c = 0, l = Math.min(a.length, o.length) - s;
	for (; c < l && a[a.length - 1 - c] === o[o.length - 1 - c];) c++;
	return {
		block: r - 1,
		offset: a.length - c
	};
}
//#endregion
//#region src/table.ts
function nr(e) {
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
function rr(e) {
	return (e.split("\n")[1] ?? "").replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((e) => {
		let t = e.trim(), n = t.startsWith(":"), r = t.endsWith(":");
		return n && r ? "center" : r ? "end" : n ? "start" : null;
	});
}
function ir(e) {
	return (e.split("\n")[1] ?? "").replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((e) => {
		let t = e.trim().replace(/:/g, "").length;
		return t > 3 ? t : null;
	});
}
var ar = (e, t) => {
	let n = "-".repeat(Math.max(3, t ?? 3));
	return e === "center" ? `:${n}:` : e === "end" ? `${n}:` : e === "start" ? `:${n}` : n;
};
function or(e, t) {
	let n = e.split("\n"), r = rr(e);
	return n[1] = `| ${t.map((e, t) => ar(r[t], e)).join(" | ")} |`, n.join("\n");
}
function sr(e, t = [], n = []) {
	let r = Math.max(1, ...e.map((e) => e.length)), i = (e) => `| ${Array.from({ length: r }, (t, n) => (e[n] ?? "").replace(/\r?\n/g, " ").replace(/(?<!\\)\|/g, "\\|")).join(" | ")} |`, a = `| ${Array.from({ length: r }, (e, r) => ar(t[r], n[r])).join(" | ")} |`;
	return [
		i(e[0] ?? [""]),
		a,
		...e.slice(1).map(i)
	].join("\n");
}
function cr(e) {
	return e.includes("	") ? sr(e.replace(/\r\n?/g, "\n").replace(/\n$/, "").split("\n").map((e) => e.split("	"))) : null;
}
function lr(e, t, n, r) {
	let i = nr(e.source).map((e) => e.map((e) => e.text)), a = rr(e.source), o = ir(e.source), s = Math.max(1, ...i.map((e) => e.length));
	return i.forEach((e) => {
		for (; e.length < s;) e.push("");
	}), t === "add-row" && i.splice(n + 1, 0, Array(s).fill("")), t === "delete-row" && n > 0 && i.length > 1 && i.splice(n, 1), t === "add-column" && (i.forEach((e) => e.splice(r + 1, 0, "")), a.splice(r + 1, 0, null), o.splice(r + 1, 0, null)), t === "delete-column" && s > 1 && (i.forEach((e) => e.splice(r, 1)), a.splice(r, 1), o.splice(r, 1)), sr(i, a, o);
}
//#endregion
//#region src/icons.ts
var ur = {
	"./icons/check.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M6.68649 11.884L12.443 6.13601L11.736 5.42715L6.68835 10.4827L4.26399 8.0501L3.55696 8.74525L6.68649 11.884Z\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/note.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M13.9653 3.31348V12.6865H2.03467V3.31348H13.9653ZM3.03467 11.6865H12.9653V4.31348H3.03467V11.6865Z\" fill=\"#1E1E1E\"/>\n<path d=\"M8.00641 7.08004V7.99996H3.71344V7.08004H8.00641ZM9.9527 5.08004V5.99996H3.71344V5.08004H9.9527Z\" fill=\"#1E1E1E\"/>\n</svg>\n",
	"./icons/send.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M8 12.5V4.5M4.75 7.75L8 4.5L11.25 7.75\" stroke=\"currentColor\" stroke-width=\"1\"/>\n</svg>\n",
	"./icons/chevron-up.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M4.25 9.75L8 6L11.75 9.75\" stroke=\"currentColor\"/>\n</svg>\n",
	"./icons/chevron-down.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M4.25 6.25L8 10L11.75 6.25\" stroke=\"currentColor\"/>\n</svg>\n",
	"./icons/bold.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M5 3.5H8.75A2.25 2.25 0 0 1 8.75 8H5M5 8H9.25A2.25 2.25 0 0 1 9.25 12.5H5M5 3.5V12.5\" stroke=\"currentColor\" stroke-width=\"1.5\"/>\n</svg>\n",
	"./icons/bullet.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<circle cx=\"4\" cy=\"5.5\" r=\"1.15\" fill=\"currentColor\"/>\n<circle cx=\"4\" cy=\"10.5\" r=\"1.15\" fill=\"currentColor\"/>\n<path d=\"M7 5H13V6H7ZM7 10H13V11H7Z\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/callout.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M2.5 3.5H13.5V12.5H2.5Z\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n<circle cx=\"5.5\" cy=\"8\" r=\"1.2\" fill=\"currentColor\"/>\n<path d=\"M8 6H11.5V7H8ZM8 9H11.5V10H8Z\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/close.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M12.1215 4.58087L8.70453 7.99397L12.1176 11.4169L11.4106 12.112L7.99847 8.69108L4.58636 12.112L3.87836 11.4031L7.29535 7.99005L3.88226 4.56716L4.58929 3.87201L8.0014 7.29294L11.4145 3.87201L12.1215 4.58087Z\" fill=\"#1E1E1E\"/>\n</svg>\n",
	"./icons/code-block.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M2.5 3H13.5V13H2.5Z\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n<path d=\"M6.5 6L4.5 8L6.5 10M9.5 6L11.5 8L9.5 10\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n</svg>\n",
	"./icons/code.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M6.5 4.5L3 8L6.5 11.5M9.5 4.5L13 8L9.5 11.5\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n</svg>\n",
	"./icons/comment.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M3 3.5H13V10.5H8L5.5 12.75V10.5H3Z\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n</svg>\n",
	"./icons/delete.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\">\n<g id=\"Icons\">\n<g id=\"Delete\">\n<g id=\"Vector\">\n<path d=\"M7.0972 3.47745L13.9422 3.48149L13.9424 12.7615L7.09744 12.7655L2.31717 8.121L7.0972 3.47745ZM3.75174 8.12003L7.43924 11.7021H12.9422V4.51944H7.45877L3.75174 8.12003Z\" fill=\"currentColor\" />\n<path d=\"M8.16022 10.2823L7.45988 9.58199L8.92933 8.11177L7.45877 6.64608L8.16207 5.94278L9.63109 7.41184L11.1002 5.94278L11.8005 6.64312L10.3309 8.11372L11.8009 9.58047L11.0982 10.2827L9.62915 8.81366L8.16022 10.2823Z\" fill=\"currentColor\" />\n</g>\n</g>\n</g>\n</svg>\n",
	"./icons/divider.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M3 4H9V5H3ZM2 7.5H14V8.5H2ZM3 11H9V12H3Z\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/down.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\">\n  <path d=\"M7.49645 12.5178V2.86102e-06H8.50702L8.50841 12.5174L11.4156 9.61018L12.1095 10.317L8.00173 14.4248L3.8905 10.3135L4.59784 9.60619L7.49645 12.5178Z\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/duplicate.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\">\n<g id=\"Icons\">\n<g id=\"Duplicate\">\n<path id=\"âD\" d=\"M2.41924 3.49777C2.08493 3.49777 1.78024 3.57818 1.50517 3.73898C1.23434 3.90402 1.0164 4.12196 0.851364 4.39279C0.690557 4.66786 0.610153 4.97254 0.610153 5.30685C0.610153 5.63693 0.690557 5.93739 0.851364 6.20822C1.0164 6.47905 1.23434 6.69276 1.50517 6.84933C1.78024 7.01014 2.08493 7.09055 2.41924 7.09055H7.82109C8.15117 7.09055 8.45374 7.01014 8.72881 6.84933C9.00387 6.69276 9.22181 6.47905 9.38261 6.20822C9.54342 5.93739 9.62383 5.63693 9.62383 5.30685C9.62383 4.97254 9.54342 4.66786 9.38261 4.39279C9.22181 4.12196 9.00387 3.90402 8.72881 3.73898C8.45374 3.57818 8.15117 3.49777 7.82109 3.49777C7.49101 3.49777 7.18844 3.57818 6.91338 3.73898C6.64254 3.90402 6.42461 4.12196 6.25957 4.39279C6.09876 4.66786 6.01836 4.97254 6.01836 5.30685V10.677C6.01836 11.007 6.09876 11.3096 6.25957 11.5847C6.42461 11.8598 6.64254 12.0777 6.91338 12.2385C7.18844 12.4035 7.49101 12.4861 7.82109 12.4861C8.15117 12.4861 8.45374 12.4035 8.72881 12.2385C9.00387 12.0777 9.22181 11.8598 9.38261 11.5847C9.54342 11.3096 9.62383 11.007 9.62383 10.677C9.62383 10.3427 9.54342 10.0401 9.38261 9.76926C9.22181 9.49842 9.00387 9.2826 8.72881 9.1218C8.45374 8.96522 8.15117 8.88693 7.82109 8.88693H3.7205C3.58086 8.88693 3.46237 8.9356 3.36504 9.03293C3.26771 9.13026 3.21904 9.24663 3.21904 9.38205C3.21904 9.5217 3.26771 9.64019 3.36504 9.73752C3.46237 9.83485 3.58086 9.88351 3.7205 9.88351H7.80205C8.02633 9.88351 8.21676 9.95969 8.37334 10.112C8.52991 10.2686 8.6082 10.4569 8.6082 10.677C8.6082 10.897 8.52991 11.0832 8.37334 11.2356C8.22099 11.3921 8.03691 11.4704 7.82109 11.4704C7.60527 11.4704 7.41907 11.3921 7.2625 11.2356C7.10592 11.079 7.02763 10.8864 7.02763 10.6579V5.31955C7.02763 5.09527 7.10592 4.90484 7.2625 4.74826C7.41907 4.59168 7.60527 4.5134 7.82109 4.5134C8.03691 4.5134 8.22099 4.58957 8.37334 4.74191C8.52991 4.89849 8.6082 5.0868 8.6082 5.30685C8.6082 5.52691 8.52991 5.71522 8.37334 5.8718C8.21676 6.02837 8.02633 6.10666 7.80205 6.10666H2.43828C2.21399 6.10666 2.02145 6.02837 1.86064 5.8718C1.70407 5.71522 1.62578 5.52691 1.62578 5.30685C1.62578 5.0868 1.70195 4.89849 1.85429 4.74191C2.01087 4.58957 2.19918 4.5134 2.41924 4.5134C2.63082 4.5134 2.81491 4.59168 2.97148 4.74826C3.12806 4.90907 3.20634 5.0995 3.20634 5.31955V10.6579C3.20634 10.8864 3.12806 11.079 2.97148 11.2356C2.81491 11.3921 2.63082 11.4704 2.41924 11.4704C2.19918 11.4704 2.01087 11.3921 1.85429 11.2356C1.70195 11.0832 1.62578 10.897 1.62578 10.677C1.62578 10.4569 1.70407 10.2686 1.86064 10.112C2.02145 9.95969 2.21399 9.88351 2.43828 9.88351H3.7205C3.85169 9.88351 3.96595 9.83485 4.06328 9.73752C4.16061 9.64019 4.20927 9.5217 4.20927 9.38205C4.20927 9.24663 4.16061 9.13026 4.06328 9.03293C3.96595 8.9356 3.85169 8.88693 3.7205 8.88693H2.41924C2.08493 8.88693 1.78024 8.96522 1.50517 9.1218C1.23434 9.2826 1.0164 9.49842 0.851364 9.76926C0.690557 10.0401 0.610153 10.3427 0.610153 10.677C0.610153 11.007 0.690557 11.3096 0.851364 11.5847C1.0164 11.8598 1.23434 12.0777 1.50517 12.2385C1.78024 12.4035 2.08493 12.4861 2.41924 12.4861C2.74931 12.4861 3.04977 12.4035 3.3206 12.2385C3.59567 12.0777 3.8136 11.8598 3.97441 11.5847C4.13945 11.3096 4.22197 11.007 4.22197 10.677V5.30685C4.22197 4.97254 4.13945 4.66786 3.97441 4.39279C3.8136 4.12196 3.59567 3.90402 3.3206 3.73898C3.04977 3.57818 2.74931 3.49777 2.41924 3.49777Z\" fill=\"currentColor\" />\n<path id=\"âD_2\" d=\"M10.4239 3.37692V12.6069H12.6079C14.4409 12.6069 15.3899 11.4759 15.3899 9.23992V6.89992C15.3899 4.57292 14.4279 3.37692 12.5819 3.37692H10.4239ZM12.4909 4.44292C13.4919 4.44292 13.9469 5.22292 13.9469 6.75692V9.27892C13.9469 10.8389 13.5049 11.5409 12.4909 11.5409H11.8149V4.44292H12.4909Z\" fill=\"currentColor\" />\n</g>\n</g>\n</svg>\n",
	"./icons/equation.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M2.5 9.5L4.75 12.5L7.5 3.5H13.5M9.25 6.5L12.25 11M12.25 6.5L9.25 11\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n</svg>\n",
	"./icons/h1.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M3 3.5V12.5M7 3.5V12.5M3 8H7M9.75 7L11.75 5.25V12.5\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n</svg>\n",
	"./icons/h2.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M3 3.5V12.5M7 3.5V12.5M3 8H7M9.5 7.1A1.85 1.85 0 1 1 12.75 8.3L9.5 12.5H13.5\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n</svg>\n",
	"./icons/h3.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M3 3.5V12.5M7 3.5V12.5M3 8H7M9.5 5.25H13.25L10.75 8.25H11.25A2.1 2.1 0 1 1 9.5 11.5\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n</svg>\n",
	"./icons/handle.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<circle cx=\"5.5\" cy=\"4\" r=\"1.1\" fill=\"currentColor\"/>\n<circle cx=\"5.5\" cy=\"8\" r=\"1.1\" fill=\"currentColor\"/>\n<circle cx=\"5.5\" cy=\"12\" r=\"1.1\" fill=\"currentColor\"/>\n<circle cx=\"10.5\" cy=\"4\" r=\"1.1\" fill=\"currentColor\"/>\n<circle cx=\"10.5\" cy=\"8\" r=\"1.1\" fill=\"currentColor\"/>\n<circle cx=\"10.5\" cy=\"12\" r=\"1.1\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/image.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M2.5 3H13.5V13H2.5Z\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n<path d=\"M2.5 11.5L6.5 7.5L9 10L10.5 8.5L13.5 11.5\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n<circle cx=\"10.5\" cy=\"5.75\" r=\"1.1\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/indent.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M3 3.5H13V4.5H3ZM8 7.5H13V8.5H8ZM3 11.5H13V12.5H3Z\" fill=\"currentColor\"/>\n<path d=\"M3 6L5.75 8L3 10Z\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/italic.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M6.5 3.5H11M5 12.5H9.5M8.75 3.5L7.25 12.5\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n</svg>\n",
	"./icons/link.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M8.25 4.75L9.5 3.5A2.12 2.12 0 0 1 12.5 6.5L11.25 7.75M7.75 11.25L6.5 12.5A2.12 2.12 0 0 1 3.5 9.5L4.75 8.25M6 10L10 6\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n</svg>\n",
	"./icons/mention.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<circle cx=\"8\" cy=\"8\" r=\"2.4\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n<path d=\"M10.4 8V9.4A1.3 1.3 0 0 0 13 9.4V8A5 5 0 1 0 11 12\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n</svg>\n",
	"./icons/numbered.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M2.5 4.5L3.9 3.25V7M2.6 9.75A1.3 1.3 0 1 1 4.9 10.6L2.6 12.9H5.3\" stroke=\"currentColor\" stroke-width=\"1\"/>\n<path d=\"M7 4.5H13V5.5H7ZM7 10.5H13V11.5H7Z\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/outdent.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M3 3.5H13V4.5H3ZM8 7.5H13V8.5H8ZM3 11.5H13V12.5H3Z\" fill=\"currentColor\"/>\n<path d=\"M5.75 6L3 8L5.75 10Z\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/plus.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M8.50235 2.6739L8.4996 7.5035L13.3334 7.51044L13.325 8.50193L8.49328 8.49569L8.49951 13.3274L7.49764 13.3268L7.50039 8.49717L2.66663 8.49024L2.67503 7.49875L7.50672 7.50499L7.50117 2.67261L8.50235 2.6739Z\" fill=\"#1E1E1E\"/>\n</svg>\n",
	"./icons/quote.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M3 3.5H4V12.5H3ZM6.5 5H13V6H6.5ZM6.5 7.5H13V8.5H6.5ZM6.5 10H11V11H6.5Z\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/search.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M9.08545 6.62646C9.08545 5.25128 7.9704 4.13623 6.59521 4.13623C5.22003 4.13623 4.10498 5.25128 4.10498 6.62646C4.10498 8.00165 5.22003 9.1167 6.59521 9.1167C7.9704 9.1167 9.08545 8.00165 9.08545 6.62646ZM10.105 6.62646C10.105 7.39551 9.85647 8.10577 9.43701 8.68408L12.9146 12.1616L12.1929 12.8833L8.72412 9.41455C8.13339 9.86631 7.39632 10.1362 6.59521 10.1362C4.6567 10.1362 3.08545 8.56498 3.08545 6.62646C3.08545 4.68795 4.6567 3.1167 6.59521 3.1167C8.53373 3.1167 10.105 4.68795 10.105 6.62646Z\" fill=\"#1E1E1E\"/>\n</svg>\n",
	"./icons/strike.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M10.6 5.4C10.4 4.2 9.4 3.5 8 3.5C6.5 3.5 5.5 4.3 5.5 5.5C5.5 8.2 10.5 7.4 10.5 10.3C10.5 11.6 9.4 12.5 8 12.5C6.5 12.5 5.5 11.7 5.4 10.6M4 8H12\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n</svg>\n",
	"./icons/table.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M2.5 3H13.5V13H2.5Z\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n<path d=\"M6.2 3V13M9.8 3V13M2.5 8H13.5\" stroke=\"currentColor\" stroke-width=\"1\"/>\n</svg>\n",
	"./icons/text.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M3 4H13V5H3ZM3 7.5H13V8.5H3ZM3 11H9V12H3Z\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/todo.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M2.5 3H6.5V7H2.5ZM2.5 9H6.5V13H2.5Z\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n<path d=\"M3.5 5L4.4 5.9L5.7 4.2\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n<path d=\"M8.5 4.5H13.5V5.5H8.5ZM8.5 10.5H13.5V11.5H8.5Z\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/toggle.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M3 5L7.5 8L3 11Z\" fill=\"currentColor\"/>\n<path d=\"M9.5 7.5H13.5V8.5H9.5Z\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/up.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M7.49645 3.48222V16H8.50702L8.50841 3.48259L11.4156 6.38982L12.1095 5.68299L8.00173 1.57524L3.8905 5.68647L4.59784 6.39381L7.49645 3.48222Z\" fill=\"#1E1E1E\"/>\n</svg>\n",
	"./icons/connect.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M11.7982 7.99673L7.65899 12.1359L6.94737 11.4243L9.87875 8.50597L3.88054 8.51223L3.88054 7.49375L9.87875 7.48749L6.9539 4.56264L7.66552 3.86407L11.7982 7.99673Z\" fill=\"black\"/>\n<path d=\"M3.37131 7.99987C3.37131 8.81187 2.71305 9.47013 1.90105 9.47013C1.08904 9.47013 0.430786 8.81187 0.430786 7.99987C0.430786 7.18787 1.08904 6.52961 1.90105 6.52961C2.71305 6.52961 3.37131 7.18787 3.37131 7.99987Z\" fill=\"black\"/>\n<path d=\"M15.5692 7.99987C15.5692 8.81187 14.911 9.47013 14.099 9.47013C13.2869 9.47013 12.6287 8.81187 12.6287 7.99987C12.6287 7.18787 13.2869 6.52961 14.099 6.52961C14.911 6.52961 15.5692 7.18787 15.5692 7.99987Z\" fill=\"black\"/>\n</svg>\n",
	"./icons/slash.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M10.25 3L5.75 13\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n</svg>\n",
	"./icons/underline.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M5.5 3.25V8A2.5 2.5 0 0 0 10.5 8V3.25M4 12.75H12\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n</svg>\n",
	"./icons/color.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 12 12\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<circle cx=\"6\" cy=\"6\" r=\"5\" stroke=\"currentColor\" stroke-width=\"1.2\" fill=\"none\"/>\n<circle cx=\"6\" cy=\"6\" r=\"3\" fill=\"currentColor\"/>\n</svg></svg>\n",
	"./icons/background.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M4 2H12A2 2 0 0 1 14 4V12A2 2 0 0 1 12 14H4A2 2 0 0 1 2 12V4A2 2 0 0 1 4 2ZM7.4 4L4.8 12H6L6.65 10H9.35L10 12H11.2L8.6 4H7.4ZM7 9L8 5.9L9 9H7Z\" fill=\"currentColor\"/></svg>\n",
	"./icons/tabs.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M2.5 13V3H6.5V6H13.5V13Z\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n<path d=\"M9.5 6V3H13.5V6\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n</svg>\n"
}, dr = (e, t) => {
	let n = fr(e, t);
	return n.textContent = t, n;
};
function fr(e, t, n = globalThis.document) {
	let r = n.createElement("span");
	return r.className = "aa-atom", r.contentEditable = "false", r.dataset.atom = e, r.dataset.source = t, r;
}
var pr = (e) => e.nodeType === 1, mr = (e) => pr(e) && e.classList.contains("aa-atom");
function hr(e, t, n = q) {
	if (!t || yt(e, n)) return "";
	let r = [];
	for (let i of Bt(e, n)) i.kind === "atom" && i.group && t.from <= i.group[1] && t.to >= i.group[0] && r.push(`${i.group[0]}-${i.group[1]}`);
	let i = e.kind === "callout" && e.source.includes("\n") && t.to > e.source.indexOf("\n");
	return r.length || i ? `on:${r.join(",")}${i ? ":body" : ""}` : "";
}
var gr = (e) => `${e.href ?? ""}|${e.bold ? "b" : ""}${e.italic ? "i" : ""}${e.strike ? "s" : ""}${e.underline ? "u" : ""}${e.code ? "c" : ""}${e.highlight ? "h" : ""}|${e.color ?? ""}|${e.background ?? ""}`, _r = /* @__PURE__ */ new WeakMap();
function vr(e, t, n, r, i = 0) {
	let a = t.href ? e.createElement("a") : e.createElement("span");
	return t.href && (a.href = t.href, a.className = "aa-link", a.rel = "noopener"), t.bold && a.classList.add("aa-b"), t.italic && a.classList.add("aa-i"), t.strike && a.classList.add("aa-s"), t.underline && a.classList.add("aa-u"), t.color && (a.dataset.color = t.color), t.background && (a.classList.add("aa-bg"), a.dataset.fill = t.background), t.code && (a.classList.add("aa-c"), a.spellcheck = !1), t.highlight && a.classList.add("aa-highlight"), a.textContent = n, _r.set(a, gr(t)), Sr(a, i + t.from, r), a;
}
function yr(e, t) {
	let n = e.createElement("span");
	return n.className = "aa-syntax", n.setAttribute("data-hidden", ""), n.textContent = t, n;
}
function br(e, t, n, r = q) {
	if (n.kind !== t.kind || n.kind === "table" || n.kind === "callout" || n.prefix !== t.prefix || n.level !== t.level || n.checked !== t.checked || n.number !== t.number || n.depth !== t.depth || n.kind === "heading" && !n.source.slice(n.prefix).trim() != !t.source.slice(t.prefix).trim() || n.kind === "code" && !!yt(n, r) != !!yt(t, r)) return !1;
	let i = e.firstChild, a = !1, o = !1;
	for (let e of Bt(n, r)) {
		if (o = e.kind === "break", e.kind === "atom") return !1;
		if (e.kind === "break") {
			if (!i || i.tagName !== "BR" || !("line" in i.dataset)) return !1;
			i = i.nextSibling;
			continue;
		}
		let t = n.source.slice(e.from, e.to);
		if (t) {
			if (e.kind === "text" && (a = !0), !i || i.childNodes.length !== 1 || i.firstChild.nodeType !== 3 || i.firstChild.data !== t || (e.kind === "syntax" ? !i.classList?.contains("aa-syntax") : _r.get(i) !== gr(e))) return !1;
			i = i.nextSibling;
		}
	}
	return !a || o ? !!i && i.tagName === "BR" && "filler" in i.dataset && !i.nextSibling : !i;
}
function xr(e, t, n, r = q, i = dr, a = []) {
	let o = e.ownerDocument;
	i === dr && (i = (e, t) => {
		let n = fr(e, t, o);
		return n.textContent = t, n;
	}), e.className = "aa-block", e.dataset.kind = t.kind;
	for (let n of [
		"spellcheck",
		"autocorrect",
		"autocapitalize"
	]) t.kind === "code" ? e.setAttribute(n, n === "spellcheck" ? "false" : "off") : e.removeAttribute(n);
	if (t.level ? e.dataset.level = String(t.level) : delete e.dataset.level, t.checked === void 0 ? delete e.dataset.checked : e.dataset.checked = t.checked ? "true" : "false", e.toggleAttribute("data-active", !!n), e.toggleAttribute("data-empty", t.kind === "heading" && !t.source.slice(t.prefix).trim()), e.dataset.reveal = hr(t, n, r), e.style.setProperty("--aa-depth", String(t.depth ?? 0)), t.number === void 0 ? delete e.dataset.number : e.dataset.number = String(t.number), t.kind === "callout") {
		let r = t.box && t.icon && /^https?:\/\//i.test(t.icon) ? t.icon : void 0;
		if (e.toggleAttribute("data-box", !!t.box), t.box && t.icon && !r ? e.dataset.icon = t.icon : delete e.dataset.icon, e.toggleAttribute("data-picture", !!r), r ? e.style.setProperty("--aa-callout-picture", `url("${r.replace(/["\\\s]/g, (e) => encodeURIComponent(e))}")`) : e.style.removeProperty("--aa-callout-picture"), t.box && t.color ? e.dataset.fill = t.color : delete e.dataset.fill, t.box) e.style.removeProperty("--aa-callout-icon");
		else {
			let n = ur[`./icons/${t.folded ? "toggle" : t.callout === "tip" ? "check" : t.callout === "warning" || t.callout === "caution" ? "callout" : "note"}.svg`];
			e.style.setProperty("--aa-callout-icon", `url("data:image/svg+xml,${encodeURIComponent(n.replace(/currentColor/g, "black"))}")`);
		}
		e.dataset.callout = t.callout, e.toggleAttribute("data-folded", !!t.folded), e.toggleAttribute("data-body-active", !!n && n.to > t.source.indexOf("\n") && t.source.includes("\n"));
	} else delete e.dataset.callout, delete e.dataset.icon, delete e.dataset.fill, e.removeAttribute("data-box"), e.removeAttribute("data-picture"), e.style.removeProperty("--aa-callout-picture"), e.removeAttribute("data-folded"), e.removeAttribute("data-body-active");
	if (t.kind === "table") {
		wr(e, t, a, r), Cr(e, a);
		return;
	}
	let s = yt(t, r);
	e.toggleAttribute("data-drawn", !!s || t.kind === "columns" || t.kind === "tabs" || t.kind === "toc"), s ? e.dataset.fence = s.name : delete e.dataset.fence;
	let c = /* @__PURE__ */ new Map();
	for (let t of e.querySelectorAll(".aa-atom")) {
		let e = `${t.dataset.atom}\u0000${t.dataset.source}`;
		c.set(e, [...c.get(e) ?? [], t]);
	}
	let l = o.createDocumentFragment(), u = o.createElement("span");
	u.className = "aa-callout-body";
	let d = l, f = !1, p = !1;
	for (let e of Bt(t, r)) {
		if (t.kind === "callout" && e.from >= t.source.indexOf("\n") && t.source.includes("\n") && d === l && (l.append(u), d = u), p = e.kind === "break", e.kind === "break") {
			let e = o.createElement("br");
			e.dataset.line = "", d.append(e);
			continue;
		}
		let r = t.source.slice(e.from, e.to);
		r && (e.kind === "atom" ? (e.group && n && !s && n.from <= e.to && n.to >= e.from ? d.append(o.createTextNode(r)) : d.append(c.get(`${e.atom}\u0000${r}`)?.shift() ?? i(e.atom, r)), f = !0) : e.kind === "syntax" ? d.append(yr(o, r)) : (f = !0, d.append(vr(o, e, r, a))));
	}
	if (!f || p) {
		let e = o.createElement("br");
		e.dataset.filler = "", l.append(e);
	}
	e.replaceChildren(l), Cr(e, a);
}
function Sr(e, t, n) {
	let r = e.ownerDocument, i = e.textContent ?? "", a = n.filter((e) => e.from < t + i.length && e.to > t);
	if (!a.length) return;
	let o = [.../* @__PURE__ */ new Set([
		0,
		i.length,
		...a.flatMap((e) => [Math.max(0, e.from - t), Math.min(i.length, e.to - t)])
	])].sort((e, t) => e - t);
	e.replaceChildren();
	for (let n = 1; n < o.length; n++) {
		let s = o[n - 1], c = o[n], l = r.createElement("span");
		l.textContent = i.slice(s, c);
		for (let e of a) if (e.from < t + c && e.to > t + s) {
			l.classList.add(...e.className.split(/\s+/).filter(Boolean)), e.label && (l.title = e.label);
			for (let [t, n] of Object.entries(e.attributes ?? {})) l.setAttribute(t, l.hasAttribute(t) ? `${l.getAttribute(t)} ${n}` : n);
		}
		e.append(l);
	}
}
function Cr(e, t) {
	let n = e.ownerDocument;
	for (let r of t.filter((t) => t.from === t.to && t.from >= 0 && t.from <= Tr(e).length)) {
		let t = n.createElement("span");
		t.className = `${r.className} aa-peer-caret`, t.contentEditable = "false", t.dataset.label = r.label ?? "", r.label && (t.dataset.initial = Te(r.label)), t.title = r.label ?? "";
		let i = Or(e, r.from), a = n.createRange();
		a.setStart(i.node, i.offset), a.collapse(!0), a.insertNode(t);
	}
}
function wr(e, t, n, r) {
	let i = e.ownerDocument;
	e.contentEditable = "false";
	let a = nr(t.source), o = rr(t.source), s = ir(t.source);
	s.some((e) => e !== null) ? e.style.setProperty("--aa-table-columns", s.map((e) => e === null ? "minmax(0, 1fr)" : `calc(${e} * var(--aa-unit))`).join(" ")) : e.style.removeProperty("--aa-table-columns");
	let c = i.createDocumentFragment(), l = 0;
	a.forEach((a, s) => {
		let u = i.createElement("span");
		u.className = "aa-table-row", u.style.setProperty("--aa-columns", String(a.length)), a.forEach((a, c) => {
			let d = i.createElement("span");
			d.className = "aa-table-cell", d.dataset.cell = `${s}:${c}`, o[c] && (d.dataset.align = o[c]), d.dataset.from = String(a.from), d.dataset.to = String(a.to), d.contentEditable = e.dataset.readonly === "true" ? "false" : "true";
			let f = i.createElement("span");
			f.className = "aa-syntax", f.dataset.hidden = "", f.textContent = t.source.slice(l, a.from);
			let p = i.createElement("span");
			for (let e of Bt({
				kind: "paragraph",
				source: a.text,
				prefix: 0
			}, r)) {
				let t = a.text.slice(e.from, e.to);
				t && (e.kind === "syntax" ? p.append(yr(i, t)) : e.kind === "text" ? p.append(vr(i, e, t, n, a.from)) : p.append(i.createTextNode(t)));
			}
			if (!a.text) {
				let e = i.createElement("br");
				e.dataset.filler = "", p.append(e);
			}
			if (s === 0) {
				let e = i.createElement("span");
				e.className = "ds-table-column-resize", e.contentEditable = "false", e.tabIndex = 0, e.setAttribute("data-aa-interactive", ""), e.setAttribute("role", "separator"), e.setAttribute("aria-orientation", "vertical"), e.setAttribute("aria-label", V("Column width")), d.append(e);
			}
			d.append(f, p), u.append(d), l = a.to;
		}), c.append(u);
	});
	let u = i.createElement("span");
	u.className = "aa-syntax", u.dataset.hidden = "", u.textContent = t.source.slice(l), c.append(u), e.replaceChildren(c);
}
function Tr(e) {
	let t = "", n = 0, r = "", i = () => {
		t += "\n".repeat(n) + r, n = 0, r = "";
	}, a = (e) => {
		for (let o of Array.from(e.childNodes)) if (o.nodeType === Node.TEXT_NODE) {
			let e = o.textContent ?? "";
			if (!e) continue;
			if (n && Er(o)) {
				r += e;
				continue;
			}
			i(), t += e.replace(/\u00a0/g, " ");
		} else pr(o) && (mr(o) ? (i(), t += o.dataset.source ?? "") : o.tagName === "BR" ? "filler" in o.dataset ? i() : "line" in o.dataset ? (i(), t += "\n") : n++ : (/^(DIV|P)$/.test(o.tagName) && t && !t.endsWith("\n") && (t += "\n"), a(o)));
	};
	return a(e), n = Math.max(0, n - 1), i(), t;
}
function Er(e) {
	let t = e.parentElement;
	return !!t && !!t.closest(".aa-syntax[data-hidden]");
}
function Dr(e, t, n) {
	let r = 0, i = -1, a = (e) => {
		let o = 0;
		for (let s = e.firstChild; s; s = s.nextSibling, o++) {
			if (e === t && o === n) return i = r, !0;
			if (s === t && s.nodeType === Node.TEXT_NODE) return i = r + n, !0;
			if (s.nodeType === Node.TEXT_NODE) r += s.length;
			else if (pr(s)) {
				if (mr(s)) {
					let e = (s.dataset.source ?? "").length;
					if (s === t || s.contains(t)) return i = s === t && n === 0 ? r : r + e, !0;
					r += e;
				} else if (s.tagName === "BR") r += "filler" in s.dataset ? 0 : 1;
				else if (a(s)) return !0;
			}
		}
		return e === t && n >= o && (i = r, !0);
	};
	return (t === e || e.contains(t)) && a(e), i < 0 ? r : i;
}
function Or(e, t) {
	if (e.ownerDocument, e.dataset.kind === "table") {
		let n = Array.from(e.querySelectorAll("[data-cell]")).find((e) => t >= Number(e.dataset.from) && t <= Number(e.dataset.to));
		if (n?.lastElementChild) return Or(n.lastElementChild, t - Number(n.dataset.from));
	}
	let n = 0, r = null, i = (e) => {
		let a = Array.from(e.childNodes);
		for (let o = 0; o < a.length; o++) {
			let s = a[o];
			if (s.nodeType === Node.TEXT_NODE) {
				let e = (s.textContent ?? "").length;
				if (!Er(s) && t <= n + e) return r = {
					node: s,
					offset: Math.max(0, t - n)
				}, !0;
				n += e;
			} else if (pr(s)) {
				if (mr(s)) {
					let i = (s.dataset.source ?? "").length;
					if (t === n) return r = {
						node: e,
						offset: o
					}, !0;
					if (t <= n + i) return r = {
						node: e,
						offset: o + 1
					}, !0;
					n += i;
				} else if (s.tagName === "BR") {
					if ("filler" in s.dataset) {
						if (t <= n) return r = {
							node: e,
							offset: o
						}, !0;
						continue;
					}
					if (t === n) return r = {
						node: e,
						offset: o
					}, !0;
					if (n += 1, t === n && o === a.length - 1) return r = {
						node: e,
						offset: o + 1
					}, !0;
				} else if (i(s)) return !0;
			}
		}
		return !1;
	};
	return i(e), r ?? {
		node: e,
		offset: e.childNodes.length
	};
}
//#endregion
//#region src/table-resize.ts
var kr = 4, Ar = 140;
function jr(e, t) {
	let n = (e) => e?.closest?.(".ds-table-column-resize") ?? null, r = (e) => e.closest(".aa-block"), i = (e) => Array.from(e.querySelectorAll(".ds-table-column-resize")), a = (e) => i(e).map((e) => e.parentElement.getBoundingClientRect().width), o = (e, t) => e.style.setProperty("--aa-table-columns", t.map((e) => `${e}px`).join(" ")), s = (e, t) => e.map((e) => Math.max(kr, Math.round(e / t))), c = (e) => e.style.setProperty("--ds-table-resize-height", `${r(e).getBoundingClientRect().height}px`), l = null, u = (e, n, r) => {
		let a = t.write(e, n), o = a && i(a)[r];
		o && (c(o), o.focus({ preventScroll: !0 }));
	}, d = () => {
		if (!l) return;
		let { handle: e } = l;
		delete e.dataset.resizing, e.removeEventListener("pointermove", f), e.removeEventListener("pointerup", m), e.removeEventListener("pointercancel", p), l = null;
	}, f = (e) => {
		if (!l) return;
		let t = (e.clientX - l.start) * (l.rtl ? -1 : 1);
		l.widths = l.before.map((e, n) => n === l.index ? Math.max(kr * l.unit, e + t) : e), o(l.block, l.widths);
	}, p = () => {
		if (!l) return;
		let { block: e, written: t } = l;
		t ? e.style.setProperty("--aa-table-columns", t) : e.style.removeProperty("--aa-table-columns"), d();
	}, m = () => {
		if (!l) return;
		let { block: e, widths: t, unit: n, index: r } = l;
		d();
		let i = s(t, n), a = !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
		e.toggleAttribute("data-settling", a), e.getBoundingClientRect(), o(e, i.map((e) => e * n));
		let c = () => {
			e.removeAttribute("data-settling"), u(e, i, r);
		};
		a ? setTimeout(c, Ar) : c();
	}, h = (e) => {
		let o = n(e.target);
		if (!o || e.button !== 0 || t.readOnly()) return;
		e.preventDefault();
		let s = r(o);
		l = {
			handle: o,
			block: s,
			pointer: e.pointerId,
			index: i(s).indexOf(o),
			start: e.clientX,
			before: a(s),
			widths: a(s),
			written: s.style.getPropertyValue("--aa-table-columns"),
			unit: t.square(s),
			rtl: getComputedStyle(s).direction === "rtl"
		}, o.dataset.resizing = "", o.focus({ preventScroll: !0 }), o.setPointerCapture(e.pointerId), o.addEventListener("pointermove", f), o.addEventListener("pointerup", m), o.addEventListener("pointercancel", p);
	}, g = (e) => {
		let o = n(e.target);
		if (!o) return;
		if (e.key === "Escape" && l) {
			e.preventDefault(), e.stopPropagation(), p();
			return;
		}
		if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" || (e.preventDefault(), e.stopPropagation(), t.readOnly() || l)) return;
		let c = r(o), d = t.square(c), f = i(c).indexOf(o), m = getComputedStyle(c).direction === "rtl", h = s(a(c), d);
		h[f] = Math.max(kr, h[f] + (e.key === "ArrowRight" ? 1 : -1) * (m ? -1 : 1) * (e.shiftKey ? 5 : 1)), u(c, h, f);
	}, _ = (e) => {
		let t = n(e.target);
		t && c(t);
	};
	return e.addEventListener("pointerdown", h, !0), e.addEventListener("keydown", g, !0), e.addEventListener("pointerover", _), e.addEventListener("focusin", _), () => {
		p(), e.removeEventListener("pointerdown", h, !0), e.removeEventListener("keydown", g, !0), e.removeEventListener("pointerover", _), e.removeEventListener("focusin", _);
	};
}
//#endregion
//#region src/placement.ts
function Mr(e, t, n, r = 20) {
	let i = e.findIndex((e, i) => i !== t && n.y >= e.top && n.y <= e.bottom && n.x >= e.left - r && n.x <= e.right + r), a = e[i];
	if (!a) return null;
	let o = Math.min(a.width / 5, 4 * r), s = n.x < a.left + o ? "start" : n.x > a.right - o ? "end" : null;
	return s ? {
		index: i,
		at: s,
		rect: a
	} : null;
}
//#endregion
//#region src/vendor/drag/flow.ts
function Nr(e, t) {
	return Math.max(e, t, 0) + Math.min(e, t, 0);
}
function Pr(e, t, n) {
	let r = [], i = n;
	return e.forEach((n, a) => {
		let o = e[a - 1], s = o ? t.collapse ? Nr(o.marginEnd, n.marginStart) : o.marginEnd + t.gap + n.marginStart : t.collapse && t.through ? 0 : n.marginStart;
		r.push(i + s), i += s + n.size;
	}), r;
}
function Fr(e, t, n) {
	let r = Pr(e, t, n);
	return e.every((e, t) => Math.abs(r[t] - e.start) <= 1);
}
//#endregion
//#region src/vendor/drag/util.ts
function Ir(e) {
	let t = !1, n;
	return ((...r) => (t || (t = !0, n = e(...r)), n));
}
//#endregion
//#region src/vendor/drag/sortable.ts
var Lr = {
	instructions: "Press space to lift. Then use the arrow keys to move, space to drop and escape to cancel.",
	lifted: (e) => `Lifted ${e.item}, position ${e.position} of ${e.count} in ${e.list}.`,
	moved: (e) => `${e.item}, position ${e.position} of ${e.count} in ${e.list}.`,
	outside: (e) => `${e} is outside every list.`,
	combining: (e, t) => `${e} is over ${t}. Drop to put them together.`,
	combined: (e, t) => `Dropped ${e} onto ${t}.`,
	dropped: (e) => `Dropped ${e.item} at position ${e.position} of ${e.count} in ${e.list}.`,
	returned: (e) => `${e.item} is back at position ${e.position} of ${e.count} in ${e.list}.`
}, Rr = {
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
}, zr = 1500, Br = 24, Vr = [
	"color",
	"font",
	"letter-spacing",
	"line-height",
	"-webkit-font-smoothing"
], Hr = "input, textarea, select, option, button, a[href], [contenteditable]:not([contenteditable=\"false\"])", Ur = "data-0001-drag-sortable-style", Wr = "\n[data-drag-handle]:not([data-drag-handle=\"text\"]){-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;cursor:grab;touch-action:manipulation}\n:root[data-drag-active],:root[data-drag-active] *{-webkit-user-select:none!important;user-select:none!important;cursor:grabbing!important}\n";
function Gr(e = {}) {
	let t = {
		touchHold: e.touchHold ?? Rr.touchHold,
		dragDistance: e.dragDistance ?? Rr.dragDistance,
		outOfTheWay: e.outOfTheWay ?? Rr.outOfTheWay,
		drop: e.drop ?? Rr.drop,
		autoScrollEdge: e.autoScrollEdge ?? Rr.autoScrollEdge
	}, n = {
		...Lr,
		...e.messages
	}, r = e.pointerPoint ?? ((e) => ({
		x: e.clientX,
		y: e.clientY
	})), i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), s = null, c = null, l = /* @__PURE__ */ new Map(), u = null, d = !1, f = !1, p = /* @__PURE__ */ new Set(), m = null;
	function h(e) {
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
		return i.set(e.element, t), Ir(() => {
			i.get(e.element) === t && i.delete(e.element);
		});
	}
	function g(e) {
		let t = e.handle ?? e.element, n = {
			element: e.element,
			id: e.id,
			type: e.type ?? "default",
			handle: t,
			canDrag: e.canDrag ?? (() => !0),
			allowInteractive: e.allowInteractive ?? !1,
			label: () => e.label ?? Qr(e.element, t),
			text: e.text
		};
		a.set(e.element, n), o.set(t, n), t.setAttribute("data-drag-handle", e.text ? "text" : "");
		let r = !e.text && !t.hasAttribute("tabindex") && !t.matches(Hr);
		r && (t.tabIndex = 0);
		let i = t.getAttribute("aria-describedby"), { instructions: s } = _(t.ownerDocument);
		return e.text || t.setAttribute("aria-describedby", [i, s.id].filter(Boolean).join(" ")), Ir(() => {
			if (a.get(e.element) === n && a.delete(e.element), o.get(t) === n) {
				if (o.delete(t), t.removeAttribute("data-drag-handle"), r && t.removeAttribute("tabindex"), e.text) return;
				i ? t.setAttribute("aria-describedby", i) : t.removeAttribute("aria-describedby");
			}
		});
	}
	function _(e) {
		let t = l.get(e);
		if (t) return t;
		let r = e.defaultView ?? window;
		if (r.addEventListener("pointerdown", C, !0), r.addEventListener("keydown", x, !0), !e.querySelector(`style[${Ur}]`)) {
			let t = e.createElement("style");
			t.setAttribute(Ur, ""), t.textContent = Wr, e.head.appendChild(t);
		}
		let i = Zr(e, `0001-drag-instructions-${++Jr}`);
		i.textContent = n.instructions;
		let a = Zr(e, `0001-drag-live-${Jr}`);
		a.setAttribute("aria-live", "assertive"), a.setAttribute("aria-atomic", "true");
		let o = {
			view: r,
			instructions: i,
			liveRegion: a
		};
		return l.set(e, o), o;
	}
	function v(e) {
		m && (m.textContent = e);
	}
	function y(e) {
		let t = e.destination;
		return t ? {
			item: e.item.label(),
			list: t.container.registration.label(),
			position: t.index + 1,
			count: t.container.slots.length + 1
		} : null;
	}
	function b(e) {
		let t = y(e);
		v(t ? n.moved(t) : n.outside(e.item.label()));
	}
	function x(e) {
		if (d || c || s || e.key !== " " || e.defaultPrevented) return;
		let t = qr(e.target);
		if (t?.matches("input, textarea, select, [contenteditable]:not([contenteditable=\"false\"])")) return;
		let n = t ? o.get(t) : void 0;
		if (!n || n.text || !n.canDrag({
			input: "keyboard",
			target: n.handle
		})) return;
		e.preventDefault(), e.stopPropagation(), A(n.element.ownerDocument.defaultView ?? window);
		let r = ti(n.element);
		ie(n, -1, r.left + r.width / 2, r.top + r.height / 2, "SNAP");
	}
	function S(e) {
		let t = qr(e), n = !1;
		for (; t;) {
			let e = o.get(t);
			if (e) return n && !e.allowInteractive ? null : e;
			t.matches(Hr) && (n = !0), t = t.parentElement;
		}
		return null;
	}
	function C(e) {
		if (d || c || s || e.pointerType === "mouse" && e.button !== 0) return;
		let n = S(e.target), i = qr(e.target);
		if (!n || !n.canDrag({
			input: e.pointerType || "mouse",
			target: i
		})) return;
		let a = e.pointerType !== "touch" && n.text ? Math.max(0, n.text.hold()) : 0;
		s = {
			item: n,
			pointerId: e.pointerId,
			pointerType: e.pointerType,
			startX: r(e).x,
			startY: r(e).y,
			timer: null,
			held: a > 0
		}, (e.pointerType === "touch" || a > 0) && (s.timer = setTimeout(() => {
			s && ie(s.item, s.pointerId, s.startX, s.startY);
		}, a || t.touchHold)), A(n.element.ownerDocument.defaultView ?? window);
	}
	function w(e) {
		if (s && e.pointerId === s.pointerId) {
			let n = r(e);
			if (Math.hypot(n.x - s.startX, n.y - s.startY) < t.dragDistance) return;
			if (s.pointerType === "touch" || s.held) {
				let e = s.pointerType === "touch" ? void 0 : s.item.text?.axis, t = Math.abs(e === "x" ? n.x - s.startX : n.y - s.startY), r = Math.abs(e === "x" ? n.y - s.startY : n.x - s.startX);
				if (!e || t < 2 * r) {
					M();
					return;
				}
			}
			ie(s.item, s.pointerId, s.startX, s.startY);
		}
		if (c && e.pointerId === c.pointerId && !c.dropping) {
			let t = r(e);
			ae(t.x, t.y);
		}
	}
	function T(e) {
		s && e.pointerId === s.pointerId ? M() : c && e.pointerId === c.pointerId && !c.dropping && (N(), ge("DROP"));
	}
	function E(e) {
		s && e.pointerId === s.pointerId && M(), c && e.pointerId === c.pointerId && !c.dropping && ge("CANCEL");
	}
	function D(e) {
		let t = c;
		if (t && !t.dropping) {
			if (e.key === "Escape") e.preventDefault(), e.stopPropagation(), ge("CANCEL");
			else if (t.mode === "SNAP") {
				if (e.key === " " || e.key === "Enter") ge("DROP");
				else if (e.key in Yr) F(t, Yr[e.key]);
				else if (e.key !== "Tab") return;
				e.preventDefault(), e.stopPropagation();
			}
		}
	}
	function ee(e) {
		c && e.cancelable && e.preventDefault();
	}
	function O(e) {
		(s || c) && e.preventDefault();
	}
	function te(e) {
		(s || c) && e.preventDefault();
	}
	function ne() {
		M(), c && !c.dropping && ge("CANCEL");
	}
	function re(e) {
		(e.type !== "visibilitychange" || u?.document.visibilityState === "hidden") && ne();
	}
	function k() {
		if (!c || c.dropping || c.impactFrame !== null) return;
		let e = c.overlay.ownerDocument.defaultView;
		e && (c.impactFrame = e.requestAnimationFrame(() => {
			c && (c.impactFrame = null, c.mode === "SNAP" ? R(c, !1) : se(c));
		}));
	}
	function A(e) {
		u !== e && (j(), u = e, m = l.get(e.document)?.liveRegion ?? null, e.addEventListener("pointermove", w, !0), e.addEventListener("pointerup", T, !0), e.addEventListener("pointercancel", E, !0), e.addEventListener("touchmove", ee, {
			capture: !0,
			passive: !1
		}), e.addEventListener("contextmenu", O, !0), e.addEventListener("dragstart", te, !0), e.addEventListener("keydown", D, !0), e.addEventListener("blur", ne), e.addEventListener("pagehide", re), e.document.addEventListener("visibilitychange", re), e.addEventListener("scroll", k, !0));
	}
	function j() {
		let e = u;
		e && (u = null, e.removeEventListener("pointermove", w, !0), e.removeEventListener("pointerup", T, !0), e.removeEventListener("pointercancel", E, !0), e.removeEventListener("touchmove", ee, !0), e.removeEventListener("contextmenu", O, !0), e.removeEventListener("dragstart", te, !0), e.removeEventListener("keydown", D, !0), e.removeEventListener("blur", ne), e.removeEventListener("pagehide", re), e.document.removeEventListener("visibilitychange", re), e.removeEventListener("scroll", k, !0));
	}
	function M() {
		s && (s.timer && clearTimeout(s.timer), s = null, c || j());
	}
	function N() {
		let e = c?.overlay.ownerDocument.defaultView ?? u ?? window, t = (e) => {
			e.preventDefault(), e.stopPropagation();
		};
		e.addEventListener("click", t, {
			capture: !0,
			once: !0
		}), setTimeout(() => e.removeEventListener("click", t, !0), 0);
	}
	function ie(t, r, a, o, l = "FLUID") {
		s?.timer && clearTimeout(s.timer), s = null, e.onBeforeCapture?.({
			draggableId: t.id,
			mode: l
		});
		for (let e of p) e.finish();
		p.clear();
		let u = De(t);
		if (!u) {
			j();
			return;
		}
		let d = u.element.ownerDocument, m = d.defaultView ?? window, h = Se(u);
		if (!h) {
			j();
			return;
		}
		f = m.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? !1;
		let g = ti(u.element), _ = m.getComputedStyle(u.element), b = {
			top: oi(_.marginTop),
			left: oi(_.marginLeft),
			vertical: oi(_.marginTop) + oi(_.marginBottom),
			horizontal: oi(_.marginLeft) + oi(_.marginRight)
		}, x = $r(u.element, g), S = /* @__PURE__ */ new Map(), C = [], w = 0;
		for (let e of i.values()) {
			if (e.type !== u.type || !e.element.isConnected || e.element.ownerDocument !== d || u.element.contains(e.element)) continue;
			let t = Ce(e), n = e === h, r = m.getComputedStyle(e.element), i = e.axis === "vertical", a = ti(e.element), o = $r(e.element, a), s = oi(i ? r.rowGap : r.columnGap) * o, c = [], l = [], f = (e, t) => {
				let n = m.getComputedStyle(e), r = $r(e, t);
				return {
					start: i ? t.top : t.left,
					size: i ? t.height : t.width,
					marginStart: oi(i ? n.marginTop : n.marginLeft) * r,
					marginEnd: oi(i ? n.marginBottom : n.marginRight) * r
				};
			};
			t.forEach((t, n) => {
				let r = t === u ? g : ti(t.element);
				e.still || l.push(f(t.element, r)), t === u ? w = n : c.push({
					item: t,
					original: n,
					box: r
				});
			});
			let p = ci(e.element), _ = S.get(p) ?? null;
			!_ && p && (_ = {
				element: p,
				liftLeft: p.scrollLeft,
				liftTop: p.scrollTop,
				box: ti(p)
			}, S.set(p, _)), C.push({
				registration: e,
				box: a,
				scale: o,
				gap: s,
				paddingStart: oi(i ? r.paddingTop : r.paddingLeft) * o,
				scroller: _,
				slots: c,
				room: e.still ? 0 : (i ? g.height + b.vertical * x : g.width + b.horizontal * x) + s,
				marginStart: (i ? b.top : b.left) * x,
				isHome: n,
				flow: e.still ? null : ii(r, a, o, i, l, n ? l[w] : f(u.element, g))
			});
		}
		let T = C.find((e) => e.isHome);
		if (!T) {
			j();
			return;
		}
		let E = d.createElement("div");
		E.setAttribute("data-drag-overlay", ""), Object.assign(E.style, {
			position: "fixed",
			inset: "0",
			pointerEvents: "none",
			zIndex: "2147483000",
			contain: "layout style"
		});
		for (let t of e.inheritProperties ?? []) E.style.setProperty(t, _.getPropertyValue(t));
		let D = T.registration.renderPreview?.(u.element) ?? e.renderPreview?.(u.element), ee = D ?? li(u.element);
		for (let e of D ? Vr : []) ee.style.setProperty(e, _.getPropertyValue(e));
		ee.setAttribute("data-drag-preview", ""), ee.setAttribute("aria-hidden", "true"), Object.assign(ee.style, {
			position: "absolute",
			left: `${g.left}px`,
			top: `${g.top}px`,
			width: `${g.width / x}px`,
			height: `${g.height / x}px`,
			transformOrigin: "0 0",
			margin: "0",
			boxSizing: "border-box",
			translate: "none",
			transform: ei(0, 0, x),
			transition: "none",
			willChange: "transform",
			pointerEvents: "none"
		}), E.appendChild(ee), d.body.appendChild(E);
		let O = u.element;
		c = {
			item: u,
			mode: l,
			pointerId: r,
			startX: a,
			startY: o,
			lastX: a,
			lastY: o,
			liftBox: g,
			previewScale: x,
			sourceIndex: w,
			home: T,
			containers: C,
			scrollers: [...S.values()],
			windowLiftX: m.scrollX,
			windowLiftY: m.scrollY,
			overlay: E,
			preview: ee,
			destination: {
				container: T,
				index: w
			},
			shifts: /* @__PURE__ */ new Map(),
			sourceVisibility: O.style.visibility,
			reserved: null,
			scrollFrame: null,
			impactFrame: null,
			dropping: !1,
			combine: null,
			lockAxis: T.registration.lockAxis ?? e.lockAxis
		}, O.style.visibility = "hidden", O.setAttribute("data-drag-source", ""), T.registration.element.setAttribute("data-drag-over", ""), d.documentElement.setAttribute("data-drag-active", u.type), e.onDragStart?.(we(c));
		let te = y(c);
		te && v(n.lifted(te));
	}
	function ae(e, t) {
		let n = c;
		if (!n) return;
		n.lastX = e, n.lastY = t;
		let r = n.lockAxis === "y" ? 0 : e - n.startX, i = n.lockAxis === "x" ? 0 : t - n.startY;
		n.preview.style.transform = ei(r, i, n.previewScale), se(n), me(n);
	}
	function oe(e, t) {
		let n = e.overlay.ownerDocument.defaultView ?? window, r = n.scrollX - e.windowLiftX, i = n.scrollY - e.windowLiftY, a = t.scroller;
		return a?.element && (r += a.element.scrollLeft - a.liftLeft, i += a.element.scrollTop - a.liftTop), {
			x: r,
			y: i
		};
	}
	function P(e, t) {
		let n = oe(e, t), r = t.box, i = t.scroller, a = {
			...r,
			left: r.left - n.x,
			top: r.top - n.y
		};
		return i?.element ? ni(a, i.box) : a;
	}
	function se(t) {
		let r = t.lastX, i = t.lastY, a = null, o = Infinity;
		for (let e of t.containers) {
			if (e.registration.isDropDisabled()) continue;
			let n = P(t, e);
			if (!ri(n, r, i)) continue;
			let s = n.width * n.height;
			s < o && (a = e, o = s);
		}
		let s = a && t.mode === "FLUID" ? le(t, a) : null;
		if (s && a) {
			ue(t, {
				container: a,
				slot: s
			}) && (e.onDragUpdate?.(Te(t)), v(n.combining(t.item.label(), s.item.label())));
			return;
		}
		let c = ue(t, null), l = null;
		a && (l = {
			container: a,
			index: B(t, a)
		});
		let u = t.destination;
		u?.container === l?.container && u?.index === l?.index ? c && (e.onDragUpdate?.(Te(t)), b(t)) : (t.destination = l, V(t, u?.container ?? null), t.overlay.ownerDocument.documentElement.toggleAttribute("data-drag-outside", !l), e.onDragUpdate?.(Te(t)), b(t));
	}
	function F(t, n) {
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
			let e = I(t, r.container, n);
			e && (a = {
				container: e,
				index: L(t, e)
			});
		}
		if (!a) return;
		let o = t.destination?.container ?? null;
		t.destination = a, V(t, o), R(t, !0), ce(t), e.onDragUpdate?.(Te(t)), b(t);
	}
	function I(e, t, n) {
		let r = Xr(P(e, t)), i = null, a = Infinity;
		for (let o of e.containers) {
			if (o === t || o.registration.isDropDisabled()) continue;
			let s = Xr(P(e, o)), c = (s.x - r.x) * n.x + (s.y - r.y) * n.y;
			if (c <= 1) continue;
			let l = c + (Math.abs((s.x - r.x) * n.y) + Math.abs((s.y - r.y) * n.x)) * 2;
			l < a && (i = o, a = l);
		}
		return i;
	}
	function L(e, t) {
		let n = t.registration.axis === "vertical", r = oe(e, t), i = si(e.preview.style.transform), a = n ? e.liftBox.top + i.y + e.liftBox.height / 2 : e.liftBox.left + i.x + e.liftBox.width / 2;
		return t.slots.filter((i) => de(e, t, i) - (n ? r.y : r.x) + (n ? i.box.height : i.box.width) / 2 < a).length;
	}
	function R(e, n) {
		let r = _e(e), { duration: i, easing: a } = t.outOfTheWay;
		e.preview.style.transition = n && !f ? `transform ${i}ms ${a}` : "none", e.preview.style.transform = ei(r.x, r.y, e.previewScale);
	}
	function ce(e) {
		let n = e.overlay.ownerDocument.defaultView;
		if (!n) return;
		let r = _e(e), i = {
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
		(c.x || c.y) && n.scrollBy(c.x, c.y), R(e, !0);
	}
	function z(e, t) {
		let n = t.registration.axis === "vertical", r = n ? e.liftBox.top : e.liftBox.left, i = n ? e.liftBox.height : e.liftBox.width, a = n ? e.lockAxis === "x" ? 0 : e.lastY - e.startY : e.lockAxis === "y" ? 0 : e.lastX - e.startX;
		return {
			start: r + a,
			end: r + a + i
		};
	}
	function le(e, t) {
		let n = e.destination;
		if (!n || n.container !== t || !t.registration.isCombineEnabled()) return null;
		let r = t.registration.axis === "vertical", i = r ? oe(e, t).y : oe(e, t).x, a = z(e, t);
		return t.slots.find((o, s) => {
			let c = r ? o.box.height : o.box.width, l = s >= n.index, u = de(e, t, o) - i + (l ? t.room : 0), d = c / 4, f = l ? a.end : a.start;
			return f > u + d && f < u + c - d;
		}) ?? null;
	}
	function ue(e, t) {
		return e.combine?.slot !== t?.slot && (e.combine?.slot.item.element.removeAttribute("data-drag-combine"), t?.slot.item.element.setAttribute("data-drag-combine", ""), e.combine = t, !0);
	}
	function B(e, t) {
		let n = t.registration.axis === "vertical", r = oe(e, t), { start: i, end: a } = z(e, t), o = n ? r.y : r.x, s = t.slots.map((r) => de(e, t, r) - o + (n ? r.box.height : r.box.width) / 2), c = s.length;
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
	function de(e, t, n) {
		let r = t.registration.axis === "vertical" ? n.box.top : n.box.left;
		return t.isHome && n.original > e.sourceIndex ? r - t.room : r;
	}
	function V(e, t) {
		let n = e.destination, r = /* @__PURE__ */ new Set([e.home]);
		t && r.add(t), n && r.add(n.container);
		for (let t of r) {
			let r = fe(e, t);
			t.slots.forEach((i, a) => {
				let o = 0;
				r ? o = r.shifts[a] : (t.isHome && i.original > e.sourceIndex && (o -= t.room), n?.container === t && a >= n.index && (o += t.room)), pe(e, i.item.element, o, t);
			});
		}
		let i = n && !n.container.isHome ? n.container : null;
		e.reserved !== i && (e.reserved?.registration.element.style.removeProperty("--drag-reserve"), e.reserved?.registration.element.removeAttribute("data-drag-over"), i && !i.registration.still && i.registration.element.style.setProperty("--drag-reserve", `${i.room}px`), e.reserved = i);
		for (let t of e.containers) n?.container === t ? t.registration.element.setAttribute("data-drag-over", "") : t.registration.element.removeAttribute("data-drag-over");
	}
	function fe(e, t) {
		let n = t.flow;
		if (!n) return null;
		let r = t.slots.map((e) => n.items[e.original]), i = e.destination?.container === t ? e.destination.index : -1;
		i >= 0 && r.splice(i, 0, n.source);
		let a = Pr(r, n.flow, n.origin);
		return {
			shifts: t.slots.map((e, t) => a[i >= 0 && t >= i ? t + 1 : t] - n.items[e.original].start),
			source: i >= 0 ? a[i] : null
		};
	}
	function pe(n, r, i, a) {
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
			r.style.transition = f ? "none" : `translate ${e}ms ${i}`;
		}
		let u = (s - l) * a.scale;
		e.onMovement?.({
			element: r,
			phase: "drag",
			x: o === "vertical" ? 0 : u,
			y: o === "vertical" ? u : 0
		}), r.style.translate = s === 0 ? "none" : o === "vertical" ? `0 ${s}px` : `${s}px 0`, r.style.setProperty("--drag-shift", `${s}px`);
	}
	function me(e) {
		if (e.scrollFrame !== null) return;
		let t = e.overlay.ownerDocument.defaultView;
		if (!t) return;
		let n = () => {
			c !== e || e.dropping || (e.scrollFrame = null, he(e) && (se(e), e.scrollFrame = t.requestAnimationFrame(n)));
		};
		H(e, e.destination?.container.scroller ?? null, t) && (e.scrollFrame = t.requestAnimationFrame(n));
	}
	function he(e) {
		let t = e.overlay.ownerDocument.defaultView;
		if (!t) return !1;
		let n = e.destination?.container.scroller ?? null, r = H(e, n, t);
		if (!r) return !1;
		if (n?.element) {
			let e = {
				left: n.element.scrollLeft,
				top: n.element.scrollTop
			};
			if (n.element.scrollBy(r.x, r.y), n.element.scrollLeft !== e.left || n.element.scrollTop !== e.top) return !0;
		}
		let i = H(e, null, t);
		if (!i) return !1;
		let a = {
			x: t.scrollX,
			y: t.scrollY
		};
		return t.scrollBy(i.x, i.y), t.scrollX !== a.x || t.scrollY !== a.y;
	}
	function H(e, n, r) {
		let i = n?.element ? n.box : {
			left: 0,
			top: 0,
			width: r.innerWidth,
			height: r.innerHeight
		}, a = t.autoScrollEdge, o = (e, t, n) => {
			let r = e - t, i = t + n - e;
			return r < a ? -24 * ((a - Math.max(r, 0)) / a) ** 2 : i < a ? Br * ((a - Math.max(i, 0)) / a) ** 2 : 0;
		}, s = o(e.lastX, i.left, i.width), c = o(e.lastY, i.top, i.height);
		return s || c ? {
			x: s,
			y: c
		} : null;
	}
	async function ge(n) {
		let r = c;
		if (!r || r.dropping) return;
		r.dropping = !0;
		let i = r.overlay.ownerDocument.defaultView ?? window;
		if (r.scrollFrame !== null && i.cancelAnimationFrame(r.scrollFrame), r.impactFrame !== null && i.cancelAnimationFrame(r.impactFrame), n === "DROP" && r.combine) {
			let { container: e, slot: i } = r.combine, a = {
				...we(r),
				destination: null,
				combine: Ee(r),
				reason: n
			}, o = e.registration.axis === "vertical", s = oe(r, e), c = e.slots.indexOf(i), l = de(r, e, i) + (r.destination && c >= r.destination.index ? e.room : 0), u = (o ? i.box.left : l) - s.x - r.liftBox.left, d = (o ? l : i.box.top) - s.y - r.liftBox.top, { maxDuration: p, easing: m } = t.drop;
			if (f) {
				U(r, a);
				return;
			}
			r.preview.style.transition = `transform ${p}ms ${m}, opacity ${p}ms ${m}`, r.preview.style.transform = ei(u, d, r.previewScale * .75), r.preview.style.opacity = "0";
			let h = !1, g = () => {
				h || (h = !0, U(r, a));
			};
			r.preview.addEventListener("transitionend", g, { once: !0 }), setTimeout(g, p + 50);
			return;
		}
		if (ue(r, null), n === "DROP" && !r.destination && r.mode === "FLUID" && e.onDropOutside?.(we(r), {
			x: r.lastX,
			y: r.lastY
		})) {
			U(r, {
				...we(r),
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
			}, V(r, e);
		}
		let o = null;
		if (n === "DROP" && e.prepareDrop) {
			r.preparing = !0;
			let i = ye(r), s = new Map(i.map((e) => [e, e.getBoundingClientRect()])), l = be(r, i);
			for (let [e, t] of r.shifts) e.style.transition = "none", e.style.translate = t.translate;
			r.reserved?.registration.element.style.removeProperty("--drag-reserve");
			let u = e.prepareDrop({
				...we(r),
				destination: a ? null : Oe(r.destination),
				combine: null,
				reason: n
			}), d = Kr(u) ? await u : u, m = typeof d == "function" ? d : () => d;
			if (o = m(), c !== r || (o?.isConnected && (r.landing = {
				element: o,
				visibility: o.style.visibility
			}, o.style.visibility = "hidden"), await new Promise((e) => (r.overlay.ownerDocument.defaultView ?? window).requestAnimationFrame(() => e())), c !== r)) return;
			let h = m();
			h !== o && (r.landing && (r.landing.element.style.visibility = r.landing.visibility), o = h, o?.isConnected && (r.landing = {
				element: o,
				visibility: o.style.visibility
			}, o.style.visibility = "hidden"));
			for (let e of i) {
				if (!e.isConnected || e === o) continue;
				let n = s.get(e), r = e.getBoundingClientRect();
				xe(e, l.get(e), r);
				let i = n.left - r.left, a = n.top - r.top;
				if (!f && (i || a)) {
					let n = e.animate([{ translate: `${i}px ${a}px` }, { translate: (e.ownerDocument.defaultView ?? window).getComputedStyle(e).translate }], {
						duration: t.outOfTheWay.duration,
						easing: t.outOfTheWay.easing
					});
					if (!n) continue;
					p.add(n), n.addEventListener?.("finish", () => p.delete(n)), n.addEventListener?.("cancel", () => p.delete(n));
				}
			}
		}
		let s = o?.isConnected ? o.getBoundingClientRect() : null, l = s ? {
			x: s.left - r.liftBox.left,
			y: s.top - r.liftBox.top
		} : _e(r), u = si(r.preview.style.transform), d = Math.hypot(l.x - u.x, l.y - u.y), { minDuration: m, maxDuration: h, easing: g } = t.drop, _ = !a && !!r.destination?.container.registration.still, v = d < .5 || f || _ ? 0 : m + (h - m) * Math.min(d / zr, 1), y = {
			...we(r),
			destination: a || !r.destination ? null : Oe(r.destination),
			combine: null,
			reason: n
		};
		if (v === 0) {
			U(r, y);
			return;
		}
		r.preview.style.transition = `transform ${v}ms ${g}`, r.preview.style.transform = ei(l.x, l.y, r.previewScale);
		let b = !1, x = () => {
			b || (b = !0, U(r, y));
		};
		r.preview.addEventListener("transitionend", x, { once: !0 }), setTimeout(x, v + 50);
	}
	function _e(e) {
		let t = e.destination ?? {
			container: e.home,
			index: e.sourceIndex
		}, n = t.container, r = n.registration.axis === "vertical", i = oe(e, n), a = n.slots, o, s = n.registration.still, c = s ? ve(n, t.index) : void 0, l = s ? null : fe(e, n)?.source ?? null;
		if (n.isHome && t.index === e.sourceIndex) o = r ? e.liftBox.top : e.liftBox.left;
		else if (l !== null) o = l;
		else if (c) o = r ? c.box.top : c.box.left;
		else if (s && a.length > 0) {
			let e = a[a.length - 1];
			o = (r ? e.box.top + e.box.height : e.box.left + e.box.width) + n.gap;
		} else if (t.index < a.length) o = de(e, n, a[t.index]);
		else if (a.length > 0) {
			let t = a[a.length - 1], i = r ? e.liftBox.height : e.liftBox.width;
			o = de(e, n, t) + (r ? t.box.height : t.box.width) + n.room - i;
		} else o = (r ? n.box.top : n.box.left) + n.paddingStart + n.marginStart;
		let u = r ? e.liftBox.left - e.home.box.left : e.liftBox.top - e.home.box.top, d = n.isHome ? r ? e.liftBox.left : e.liftBox.top : (r ? n.box.left : n.box.top) + u, f = o - (r ? i.y : i.x), p = d - (r ? i.x : i.y);
		return {
			x: (r ? p : f) - e.liftBox.left,
			y: (r ? f : p) - e.liftBox.top
		};
	}
	function ve(e, t) {
		return e.isHome ? e.slots.find((e) => e.original === t) : e.slots[t];
	}
	function U(t, r) {
		let i = y(t), o = e.onMovement && !t.preparing ? ye(t) : [], s = be(t, o);
		try {
			e.onDragEnd?.(r);
		} finally {
			W(t);
		}
		if (o.length && (t.overlay.ownerDocument.defaultView ?? window).requestAnimationFrame(() => {
			for (let e of o) e.isConnected && xe(e, s.get(e), e.getBoundingClientRect());
		}), r.combine && t.combine ? v(n.combined(t.item.label(), t.combine.slot.item.label())) : i && v(r.reason === "DROP" && r.destination ? n.dropped(i) : n.returned(i)), t.mode === "SNAP") {
			for (let e of a.values()) if (e.id === t.item.id && e.element.isConnected) {
				e.handle.focus({ preventScroll: !0 });
				break;
			}
		}
	}
	function ye(e) {
		return [...new Set(e.containers.flatMap((e) => e.slots.map((e) => e.item.element)))].filter((e) => e.isConnected);
	}
	function be(e, t) {
		return new Map(t.map((t) => [t, ai(t, e.shifts.get(t)?.scale ?? 1)]));
	}
	function xe(t, n, r) {
		let i = r.left - n.left, a = r.top - n.top;
		(Math.abs(i) > 1 || Math.abs(a) > 1) && e.onMovement?.({
			element: t,
			phase: "drop",
			x: i,
			y: a
		});
	}
	function W(e) {
		let t = e.item.element, n = e.overlay.ownerDocument.defaultView ?? window;
		for (let [t, n] of e.shifts) t.style.transition = "none", t.style.translate = n.translate, t.style.removeProperty("--drag-shift");
		let r = [...e.shifts];
		n.requestAnimationFrame(() => {
			n.requestAnimationFrame(() => {
				for (let [e, t] of r) e.style.transition = t.transition;
			});
		}), e.landing && (e.landing.element.style.visibility = e.landing.visibility), t.style.visibility = e.sourceVisibility, t.removeAttribute("data-drag-source"), e.combine?.slot.item.element.removeAttribute("data-drag-combine"), e.reserved?.registration.element.style.removeProperty("--drag-reserve");
		for (let t of e.containers) t.registration.element.removeAttribute("data-drag-over");
		e.overlay.remove(), t.ownerDocument.documentElement.removeAttribute("data-drag-active"), t.ownerDocument.documentElement.removeAttribute("data-drag-outside"), c = null, j();
	}
	function Se(e) {
		let t = e.element.parentElement;
		for (; t;) {
			let n = i.get(t);
			if (n && n.type === e.type) return n;
			t = t.parentElement;
		}
		return null;
	}
	function Ce(e) {
		let t = [];
		for (let n of a.values()) n.type === e.type && n.element.isConnected && Se(n) === e && t.push(n);
		return t.sort((e, t) => e.element.compareDocumentPosition(t.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
	}
	function we(e) {
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
	function Te(e) {
		return {
			...we(e),
			destination: e.destination && !e.combine ? Oe(e.destination) : null,
			combine: Ee(e)
		};
	}
	function Ee(e) {
		return e.combine ? {
			draggableId: e.combine.slot.item.id,
			droppableId: e.combine.container.registration.id
		} : null;
	}
	function De(e) {
		if (e.element.isConnected && a.get(e.element) === e) return e;
		for (let t of a.values()) if (t.id === e.id && t.type === e.type && t.element.isConnected) return t;
		return null;
	}
	function Oe(e) {
		return {
			droppableId: e.container.registration.id,
			index: e.index
		};
	}
	return {
		container: h,
		item: g,
		isDragging: () => c !== null,
		cancel: () => {
			M(), c && !c.dropping && ge("CANCEL");
		},
		destroy: () => {
			d = !0, M(), c && !c.preparing && W(c);
			for (let { view: e, instructions: t, liveRegion: n } of l.values()) e.removeEventListener("pointerdown", C, !0), e.removeEventListener("keydown", x, !0), t.remove(), n.remove();
			l.clear(), i.clear(), a.clear(), o.clear();
		}
	};
}
function Kr(e) {
	return !!e && typeof e.then == "function";
}
function qr(e) {
	return e && e.nodeType === 1 ? e : null;
}
var Jr = 0, Yr = {
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
function Xr(e) {
	return {
		x: e.left + e.width / 2,
		y: e.top + e.height / 2
	};
}
function Zr(e, t) {
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
function Qr(e, t) {
	let n = e.getAttribute("aria-label") ?? t.getAttribute("aria-label") ?? e.textContent?.replace(/\s+/g, " ").trim() ?? "";
	return n.length > 60 ? `${n.slice(0, 59)}…` : n || "Item";
}
function $r(e, t) {
	if (e.offsetWidth <= 0 || t.width <= 0) return 1;
	let n = t.width / e.offsetWidth;
	return Math.abs(n - 1) < .02 ? 1 : n;
}
function ei(e, t, n) {
	return `translate3d(${e}px, ${t}px, 0)${n === 1 ? "" : ` scale(${n})`}`;
}
function ti(e) {
	let t = e.getBoundingClientRect();
	return {
		left: t.left,
		top: t.top,
		width: t.width,
		height: t.height
	};
}
function ni(e, t) {
	let n = Math.max(e.left, t.left), r = Math.max(e.top, t.top), i = Math.min(e.left + e.width, t.left + t.width), a = Math.min(e.top + e.height, t.top + t.height);
	return {
		left: n,
		top: r,
		width: Math.max(0, i - n),
		height: Math.max(0, a - r)
	};
}
function ri(e, t, n) {
	return t >= e.left && t < e.left + e.width && n >= e.top && n < e.top + e.height;
}
function ii(e, t, n, r, i, a) {
	let o = r && /^(block|flow-root|list-item)$/.test(e.display), s = o ? 0 : oi(r ? e.rowGap : e.columnGap) * n, c = (r ? t.top : t.left) + (oi(r ? e.borderTopWidth : e.borderLeftWidth) + oi(r ? e.paddingTop : e.paddingLeft)) * n, l = i[0], u = {
		gap: s,
		collapse: o,
		through: o && !!l && l.marginStart > .5 && Math.abs(l.start - c) <= 1
	};
	return Fr(i, u, c) ? {
		items: i,
		source: a,
		flow: u,
		origin: c
	} : null;
}
function ai(e, t) {
	let n = ti(e), r = (e) => {
		if (!e || e === "none") return {
			x: 0,
			y: 0
		};
		let [t = "0", n = "0"] = e.trim().split(/\s+/);
		return {
			x: oi(t),
			y: oi(n)
		};
	}, i = r(e.style.translate), a = r((e.ownerDocument.defaultView ?? window).getComputedStyle(e).translate);
	return {
		...n,
		left: n.left + (i.x - a.x) * t,
		top: n.top + (i.y - a.y) * t
	};
}
function oi(e) {
	let t = Number.parseFloat(e);
	return Number.isFinite(t) ? t : 0;
}
function si(e) {
	let t = /translate3d\(\s*(-?[\d.]+)px,\s*(-?[\d.]+)px/.exec(e);
	return t ? {
		x: Number(t[1]),
		y: Number(t[2])
	} : {
		x: 0,
		y: 0
	};
}
function ci(e) {
	let t = e.ownerDocument.defaultView, n = e.parentElement;
	for (; n && n !== e.ownerDocument.body && n !== e.ownerDocument.documentElement;) {
		let e = t?.getComputedStyle(n), r = (e) => e === "auto" || e === "scroll" || e === "overlay";
		if (e && (r(e.overflowY) || r(e.overflowX))) return n;
		n = n.parentElement;
	}
	return null;
}
function li(e) {
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
var ui = 8, di = "button, input, textarea, select, video, audio, .aa-caption, [data-aa-interactive]", fi = (e, t) => {
	let n = e?.closest(di);
	return !!n && t.contains(n);
}, pi = [
	"--aa-unit",
	"--aa-sf",
	"--aa-rule-color",
	"--aa-gap",
	"--aa-indent"
];
function mi(e, t, n) {
	let r = e.element, i = r.ownerDocument, a = i.defaultView, o = i.createElement("div");
	o.className = "aa-drop-line", o.hidden = !0, n.append(o);
	let s = i.createElement("div");
	s.className = "aa-drop-line aa-drop-side", s.hidden = !0, n.append(s);
	let c = null, l = null, u = () => Array.from(r.children), d = () => !e.readOnly && t.menus !== !1 && (e.reordering || e.placing), f = () => d() && e.placing;
	r.toggleAttribute("data-movable", d());
	let p = null, m = null, h = (e, t) => {
		let n = a.getSelection();
		return !n?.rangeCount || n.isCollapsed ? !1 : Array.from(n.getRangeAt(0).getClientRects()).some((n) => e >= n.left && e <= n.right && t >= n.top && t <= n.bottom);
	}, g = (e, t) => {
		let n = i.caretPositionFromPoint?.(e, t);
		if (n) return {
			node: n.offsetNode,
			offset: n.offset
		};
		let r = i.caretRangeFromPoint?.(e, t);
		return r ? {
			node: r.startContainer,
			offset: r.startOffset
		} : null;
	}, _ = (e, t) => {
		let n = g(e, t), i = (n?.node.nodeType === 1 ? n.node : n?.node.parentElement)?.closest(".aa-block");
		n && i && i.parentElement === r && (i.focus({ preventScroll: !0 }), a.getSelection()?.collapse(n.node, n.offset));
	}, v = () => {
		m && a.getSelection()?.rangeCount && a.getSelection().removeAllRanges();
	}, y = [], b = {
		x: 0,
		y: 0
	}, x = !1, S = Gr({
		inheritProperties: pi,
		onDragStart: (t) => {
			let n = u()[t.source.index], o = p?.selected ?? [], s = n && o.includes(n) ? o : [];
			y = u().map((e) => e.getBoundingClientRect()), b = {
				x: a.scrollX,
				y: a.scrollY
			}, m = {
				caret: s.length ? null : e.selection(),
				group: s,
				from: t.source.index
			}, i.addEventListener("pointermove", w, !0);
			for (let e of s) e !== n && e.setAttribute("data-ghost", "");
			r.setAttribute("data-dragging", ""), i.addEventListener("selectionchange", v), v();
		},
		prepareDrop: (e) => {
			x = !0;
			let t = u()[e.source.index], n = t?.textContent, i = t?.querySelector(":scope > .aa-atom")?.dataset.source, a = r;
			for (let e = r.parentElement; e; e = e.parentElement) e.classList.contains("aa") && (a = e);
			let o = new Set(a.querySelectorAll(".aa-block")), s = l && { ...l }, d = c && { ...c }, f = r.parentElement?.classList.contains("aa-columns") ? r.parentElement : null, p = f ? Array.from(a.querySelectorAll(".aa-columns")).indexOf(f) : -1, m = e.source.index, h = d ? d.index - +(m < d.index) : -1;
			return C(e), () => {
				if (s) {
					let e = f?.isConnected ? f : a.querySelectorAll(".aa-columns")[p], t = "swap" in s ? s.swap : s.slot, n = (e?.querySelectorAll(":scope > .aa-column")[t])?.querySelector(":scope > .aa-block");
					if (n) return n;
				}
				if (d) {
					let e = (r.isConnected ? r : a).querySelectorAll(":scope > .aa-block")[h]?.querySelectorAll(":scope > .aa-atom.aa-columns > .aa-column"), t = (e?.[d.at === "start" ? 0 : e.length - 1])?.querySelector(":scope > .aa-block");
					if (t) return t;
				}
				if (t?.isConnected && a.contains(t)) return t;
				let e = Array.from(a.querySelectorAll(".aa-block")).filter((e) => i === void 0 ? !e.querySelector(".aa-block") && e.textContent === n : e.querySelector(":scope > .aa-atom")?.dataset.source === i);
				return e.find((e) => !o.has(e)) ?? e[0] ?? null;
			};
		},
		onDragEnd: (e) => {
			x || C(e), x = !1;
		}
	});
	function C(t) {
		let { caret: n, group: a } = m ?? {
			caret: null,
			group: []
		};
		m = null, y = [], i.removeEventListener("pointermove", w, !0);
		let o = c, p = l;
		c = null, l = null, s.hidden = !0, s.removeAttribute("data-swap");
		for (let e of r.querySelectorAll(":scope > [data-ghost]")) e.removeAttribute("data-ghost");
		r.removeAttribute("data-dragging"), i.removeEventListener("selectionchange", v);
		let h = u(), g = t.source.index, _ = t.destination?.index;
		if (!(t.reason === "DROP" && o && a.length <= 1 && f() && D(g, o.index, o.at))) {
			if (t.reason === "DROP" && p && a.length <= 1 && f()) r.dispatchEvent(new CustomEvent("aa-column-carry", {
				bubbles: !0,
				detail: {
					from: g,
					...p
				}
			}));
			else {
				if (t.reason === "DROP" && _ !== void 0 && d() && e.reordering) {
					if (a.length > 1) {
						let t = h.indexOf(a[0]), n = a.length, r = h.filter((e, t) => t !== g).slice(0, _).filter((e) => !a.includes(e)).length;
						if (r !== t) {
							e.moveBlock(t, r, n);
							return;
						}
						e.selectBlocks(t, t + n - 1);
						return;
					}
					if (_ !== g) {
						e.moveBlock(g, _);
						return;
					}
				}
				n ? e.selectRange(n.start, n.end) : a.length && e.selectBlocks(h.indexOf(a[0]), h.indexOf(a[a.length - 1]));
			}
		}
	}
	S.container({
		element: r,
		id: "aa",
		type: "aa-block",
		isDropDisabled: () => !d()
	});
	function w(e) {
		if (!m || m.group.length > 1 || !f() || T(e)) return;
		let t = parseFloat(getComputedStyle(r).getPropertyValue("--aa-unit")) || 20, n = a.scrollX - b.x, i = a.scrollY - b.y, o = e.clientX + n, l = e.clientY + i, u = Mr(y, m.from, {
			x: o,
			y: l
		}, t), d = u?.index ?? -1, p = u?.at, h = u?.rect, g = h ? new DOMRect(h.left - n, h.top - i, h.width, h.height) : null;
		!p || !g ? (c = null, s.hidden = !0) : (s.removeAttribute("data-swap"), c = {
			index: d,
			at: p
		}, s.style.left = `${p === "start" ? g.left : g.right}px`, s.style.top = `${g.top}px`, s.style.height = `${g.height}px`, s.style.width = "", s.hidden = !1);
	}
	function T(e) {
		l = null;
		let t = r.parentElement;
		if (!r.classList.contains("aa-column") || !t?.classList.contains("aa-columns")) return !1;
		let n = parseFloat(getComputedStyle(r).getPropertyValue("--aa-unit")) || 20, i = t.getBoundingClientRect();
		if (e.clientY < i.top - n || e.clientY > i.bottom + n) return !1;
		let a = r.getBoundingClientRect();
		if (e.clientX >= a.left && e.clientX <= a.right) return !1;
		let o = Array.from(t.children).filter((e) => e.classList.contains("aa-column")), u = o.indexOf(r), d = r.querySelectorAll(":scope > .aa-block").length <= 1, f = d ? o.filter((e) => e !== r) : o;
		s.removeAttribute("data-swap");
		let p = d ? o.findIndex((t) => {
			let n = t.getBoundingClientRect();
			return t !== r && e.clientX >= n.left && e.clientX <= n.right;
		}) : -1;
		if (p >= 0) {
			let e = (o[p].querySelector(":scope > .aa-block") ?? o[p]).getBoundingClientRect();
			return l = { swap: p }, c = null, s.setAttribute("data-swap", ""), s.style.left = `${e.left}px`, s.style.top = `${e.top}px`, s.style.height = `${e.height}px`, s.style.width = `${e.width}px`, s.hidden = !1, !0;
		}
		let m = f.map((e) => e.getBoundingClientRect()), h = m.filter((t) => t.left + t.width / 2 < e.clientX).length;
		if (s.hidden = !0, d && h === u) return !0;
		l = { slot: h };
		let g = m.length > 1 ? m[1].left - m[0].right : 2 * n, _ = h === 0 ? m[0].left - g / 2 : h === m.length ? m[m.length - 1].right + g / 2 : (m[h - 1].right + m[h].left) / 2;
		return c = null, s.style.left = `${_}px`, s.style.top = `${i.top}px`, s.style.height = `${i.height}px`, s.style.width = "", s.hidden = !1, !0;
	}
	function E(t) {
		let n = gt(e.value)[u().indexOf(t)];
		return !!n && /^(?:!\[[^\]\n]*\]\([^)\n]*\)\s*)+$/.test(n.source.trim());
	}
	function D(t, n, r) {
		if (gt(e.value).length !== u().length) return !1;
		let i = pt(e.value, t, n, r);
		return i ? (e.replace(i.start, i.end, i.text), !0) : !1;
	}
	let ee = (e) => {
		let t = e.target?.nodeType === 1 ? e.target : null, n = t?.closest?.(".aa-block"), i = !!n && M === n;
		if (N(), !n || n.parentElement !== r) {
			p = null;
			return;
		}
		ne();
		let a = u().filter((e) => e.hasAttribute("data-selected")), o = a.includes(n) ? a : [];
		p = {
			block: n,
			mouse: e.pointerType === "mouse" && e.button === 0,
			plain: !e.shiftKey && !e.altKey && !e.metaKey && !e.ctrlKey,
			own: fi(t, n),
			inSelection: h(e.clientX, e.clientY),
			selected: o,
			grabbed: i,
			x: e.clientX,
			y: e.clientY
		}, (o.length || i || E(n)) && p.mouse && p.plain && !p.own && !p.inSelection && d() && e.preventDefault();
	};
	a.addEventListener("pointerdown", ee, !0);
	let O = 0, te = /* @__PURE__ */ new Map();
	function ne() {
		for (let [e, t] of te) e.parentElement !== r && (t(), te.delete(e));
		for (let e of u()) !te.has(e) && e.classList.contains("aa-block") && te.set(e, S.item({
			element: e,
			id: `aa-block-${++O}`,
			type: "aa-block",
			text: {
				hold: () => p?.block === e && (p.selected.length || p.grabbed || E(e)) ? 0 : 400,
				axis: "y"
			},
			canDrag: ({ input: t }) => t === "mouse" && d() && !!p && p.block === e && p.mouse && p.plain && !p.own && !p.inSelection
		}));
	}
	ne();
	let re = new MutationObserver(ne);
	re.observe(r, { childList: !0 });
	let k = (e) => {
		e.detail > 1 && !S.isDragging() && S.cancel();
	}, A = (e) => {
		let t = p;
		p = null, !(!(t?.selected.length || t?.grabbed) || t.inSelection || S.isDragging() || m || !d() || e.type !== "pointerup") && Math.hypot(e.clientX - t.x, e.clientY - t.y) < 5 && _(e.clientX, e.clientY);
	};
	r.addEventListener("mousedown", k, !0), a.addEventListener("pointerup", A, !0), a.addEventListener("pointercancel", A, !0);
	let j = null, M = null;
	function N() {
		j && clearTimeout(j.timer), j = null, M?.removeAttribute("data-grab"), M = null;
	}
	let ie = (e) => {
		if (e.pointerType !== "mouse" || e.buttons || S.isDragging() || !d()) {
			N();
			return;
		}
		let t = e.target?.nodeType === 1 ? e.target : null, n = t?.closest?.(".aa-block");
		if (!n || n.parentElement !== r || fi(t, n)) {
			N();
			return;
		}
		if (j?.block === n && Math.hypot(e.clientX - j.x, e.clientY - j.y) < ui) return;
		N();
		let i = setTimeout(() => {
			j?.block === n && d() && (M = n, n.setAttribute("data-grab", ""));
		}, 400);
		j = {
			block: n,
			x: e.clientX,
			y: e.clientY,
			timer: i
		};
	};
	r.addEventListener("pointermove", ie), r.addEventListener("pointerleave", N), r.addEventListener("keydown", N);
	let ae = (e) => {
		let t = u().findIndex((t) => {
			let n = t.getBoundingClientRect();
			return e < n.top + n.height / 2;
		});
		return t < 0 ? r.children.length : t;
	}, oe = (e) => {
		let t = u(), n = t[e], r = t[e - 1];
		if (e < 0 || !n && !r) {
			o.hidden = !0;
			return;
		}
		let i = (n ?? r).getBoundingClientRect(), a = n && r ? (r.getBoundingClientRect().bottom + i.top) / 2 : n ? i.top : i.bottom;
		o.style.left = `${i.left}px`, o.style.top = `${a}px`, o.style.width = `${i.width}px`, o.hidden = !1;
	}, P = -1, se = (n) => !e.readOnly && e.placing && !!t.onFiles && Array.from(n.dataTransfer?.types ?? []).includes("Files"), F = (e) => {
		se(e) && (e.preventDefault(), P = ae(e.clientY), oe(P));
	}, I = (e) => {
		r.contains(e.relatedTarget) || (o.hidden = !0, P = -1);
	}, L = (e) => {
		o.hidden = !0;
		let n = P;
		if (P = -1, n < 0 || !se(e) || !e.dataTransfer?.files.length) return;
		e.preventDefault(), e.stopImmediatePropagation();
		let r = u(), i = r[n] ?? r[r.length - 1];
		i.focus({ preventScroll: !0 }), a.getSelection()?.collapse(i, r[n] ? 0 : i.childNodes.length), t.onFiles(Array.from(e.dataTransfer.files));
	}, R = () => {
		S.cancel(), p = null, N(), c = null, l = null, s.hidden = !0, o.hidden = !0, P = -1, r.toggleAttribute("data-movable", d());
	};
	return r.addEventListener("aa-movement-change", R), r.addEventListener("dragover", F), r.addEventListener("dragleave", I), r.addEventListener("drop", L, !0), () => {
		re.disconnect(), S.destroy(), te.clear(), m = null, p = null, i.removeEventListener("selectionchange", v), o.remove(), s.remove(), i.removeEventListener("pointermove", w, !0), r.removeAttribute("data-movable"), r.removeAttribute("data-dragging"), a.removeEventListener("pointerdown", ee, !0), r.removeEventListener("mousedown", k, !0), a.removeEventListener("pointerup", A, !0), a.removeEventListener("pointercancel", A, !0), N(), r.removeEventListener("pointermove", ie), r.removeEventListener("pointerleave", N), r.removeEventListener("keydown", N), r.removeEventListener("aa-movement-change", R), r.removeEventListener("dragover", F), r.removeEventListener("dragleave", I), r.removeEventListener("drop", L, !0);
	};
}
//#endregion
//#region src/ds1/0-face/overlay-swipe.ts
var hi = 10, gi = .998, _i = (e) => e / 1e3 * gi / .0020000000000000018, vi = (e, t, n = .55) => e * t * n / (t + n * Math.abs(e)), yi = /* @__PURE__ */ new Set([
	"none",
	"bottom",
	"end",
	"start"
]);
function bi(e) {
	let t = e.getAttribute("data-ds-edge");
	return t && yi.has(t) ? t : e.classList.contains("ds-overlay--sheet") ? "bottom" : e.classList.contains("ds-overlay--drawer") ? e.classList.contains("ds-overlay--start") ? "start" : "end" : "none";
}
function xi(e, t) {
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
function Si(e, t, n, r) {
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
function Ci(e, t, n) {
	let r = e.ownerDocument.defaultView?.getComputedStyle(e).transform;
	if (!r || r === "none" || typeof DOMMatrixReadOnly > "u") return 0;
	try {
		let e = new DOMMatrixReadOnly(r);
		return n * (t === "y" ? e.m42 : e.m41);
	} catch {
		return 0;
	}
}
function wi(e, t = {}) {
	let n = () => (typeof t.edge == "function" ? t.edge() : t.edge) ?? bi(e), r = null, i = 0, a = e.ownerDocument.defaultView, o = (e) => a?.requestAnimationFrame ? a.requestAnimationFrame(e) : a?.setTimeout(e, 16) ?? 0, s = (t, n, r) => {
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
		let o = t.touches[0], { axis: s, sign: c } = xi(e, i);
		r = {
			id: o.identifier,
			x: o.clientX,
			y: o.clientY,
			base: Math.max(0, Ci(e, s, c)),
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
		let { axis: l, sign: u } = xi(e, c), d = o.clientX - r.x, f = o.clientY - r.y, p = l === "y" ? f * u : d * u, m = l === "y" ? d : f;
		if (r.mode === "pending") {
			if (Math.hypot(d, f) < hi) {
				t.cancelable && p > 0 && p >= Math.abs(m) && !Si(r.path, e, l, p) && t.preventDefault();
				return;
			}
			if (Math.abs(p) <= Math.abs(m) || Si(r.path, e, l, p)) {
				r.mode = "ignore";
				return;
			}
			r.mode = "drag", r.start = p, i++, e.setAttribute("data-ds-overlay-dragging", "");
		}
		t.preventDefault();
		let h = e.getBoundingClientRect(), g = l === "y" ? h.height : h.width, _ = r.base + p - r.start;
		r.offset = _ < 0 ? vi(_, g || 1) : _, s(r.offset, g, u);
		let v = t.timeStamp || (a?.performance?.now() ?? Date.now());
		for (r.samples.push({
			time: v,
			offset: r.offset
		}); r.samples.length > 2 && v - r.samples[0].time > 150;) r.samples.shift();
	}, p = (t) => {
		if (!r || [...t.touches].some((e) => e.identifier === r.id)) return;
		let i = r;
		if (r = null, i.mode !== "drag") return;
		let o = n(), { axis: s } = xi(e, o), c = e.getBoundingClientRect(), d = s === "y" ? c.height : c.width, f = t.timeStamp || (a?.performance?.now() ?? Date.now()), p = i.samples.filter((e) => f - e.time <= 100), m = p[0], h = p[p.length - 1], g = m && h ? h.time - m.time : 0, _ = m && h && g > 0 ? (h.offset - m.offset) / g * 1e3 : 0, v = i.offset + _i(_);
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
//#region src/sheet.ts
var Ti = 400;
function Ei(e) {
	let t = e.root.ownerDocument, n = t.createElement("dialog");
	n.className = "aa-sheet ds-overlay ds-overlay--sheet", n.setAttribute("aria-label", V(e.title)), e.nonModal && (n.style.zIndex = "var(--ds-overlay-layer, 1)");
	let r = t.createElement("div");
	r.className = "aa-sheet-head";
	let i = t.createElement("h2");
	i.className = "aa-sheet-title", i.textContent = V(e.title);
	let a = t.createElement("button");
	a.type = "button", a.className = "aa-sheet-cancel", a.textContent = V("Cancel"), r.append(i, a), n.append(r);
	let o = null;
	for (let r of e.groups) {
		if (!r.rows.length) continue;
		let e = t.createElement("div");
		if (e.className = "aa-sheet-group", e.setAttribute("role", "group"), r.label) {
			let n = t.createElement("div");
			n.className = "aa-sheet-label", n.textContent = V(r.label), e.append(n), e.setAttribute("aria-label", V(r.label));
		}
		for (let i of r.rows) {
			let r = t.createElement("button");
			r.type = "button", r.className = "aa-sheet-row", r.dataset.command = i.id;
			let a = t.createElement("span");
			a.className = "aa-icon";
			let s = i.icon ? ur[`./icons/${i.icon}.svg`] : void 0;
			s && (a.style.maskImage = `url("data:image/svg+xml,${encodeURIComponent(s.replace(/currentColor/g, "black"))}")`);
			let c = t.createElement("span");
			if (c.className = "aa-sheet-words", c.textContent = V(i.label), r.append(a, c), i.key) {
				let e = t.createElement("span");
				e.className = "aa-sheet-key", e.setAttribute("aria-hidden", "true"), e.textContent = i.key, r.append(e);
			}
			r.addEventListener("click", () => {
				o = i, n.close();
			}), e.append(r);
		}
		n.append(e);
	}
	a.addEventListener("click", () => n.close()), n.addEventListener("click", (e) => {
		e.target === n && n.close();
	});
	let s = wi(n);
	n.addEventListener("close", () => {
		s();
		let t = o;
		o = null, setTimeout(() => n.remove(), Ti), e.onClose?.(t), t?.run();
	}, { once: !0 }), e.root.append(n), e.nonModal && typeof n.show == "function" ? n.show() : typeof n.showModal == "function" ? n.showModal() : n.setAttribute("open", "");
	let c = (t) => {
		e.nonModal && t.key === "Escape" && !t.defaultPrevented && (t.preventDefault(), t.stopPropagation(), n.close());
	};
	return n.addEventListener("keydown", c), n.addEventListener("close", () => n.removeEventListener("keydown", c), { once: !0 }), n.tabIndex = -1, n.focus(), () => {
		n.open ? n.close() : n.remove();
	};
}
//#endregion
//#region src/ds1/0-face/tooltips.ts
var Di = 2e3, Oi = 10, ki = Symbol.for("ds-one:tooltips");
function Ai() {
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
	window[ki] = {
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
				p &&= (m = !0, c(p.target, { duration: Di }), null);
			}, 500)
		};
	}, {
		passive: !0,
		capture: !0
	}), document.addEventListener("pointermove", (e) => {
		let t = e;
		p && t.pointerId === p.id && Math.hypot(t.clientX - p.x, t.clientY - p.y) > Oi && h();
	}, {
		passive: !0,
		capture: !0
	}), document.addEventListener("pointerup", (e) => {
		if (!p || e.pointerId !== p.id) return;
		let { target: t } = p;
		h(), t.hasAttribute("data-tooltip-press") && c(t, { duration: Di });
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
typeof document < "u" && (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", Ai, { once: !0 }) : Ai());
//#endregion
//#region src/controls.ts
var ji = [
	{
		kind: "paragraph",
		label: "Text",
		icon: "text"
	},
	{
		kind: "h1",
		label: "Heading 1",
		icon: "h1"
	},
	{
		kind: "h2",
		label: "Heading 2",
		icon: "h2"
	},
	{
		kind: "h3",
		label: "Heading 3",
		icon: "h3"
	},
	{
		kind: "todo",
		label: "To-do",
		icon: "todo"
	},
	{
		kind: "bullet",
		label: "Bulleted list",
		icon: "bullet"
	},
	{
		kind: "numbered",
		label: "Numbered list",
		icon: "numbered"
	},
	{
		kind: "quote",
		label: "Quote",
		icon: "quote"
	},
	{
		kind: "code",
		label: "Code",
		icon: "code-block"
	},
	{
		kind: "divider",
		label: "Divider",
		icon: "divider"
	},
	{
		kind: "callout",
		label: "Callout",
		icon: "callout"
	},
	{
		kind: "toggle",
		label: "Toggle",
		icon: "toggle"
	},
	{
		kind: "toggle-h1",
		label: "Toggle heading 1",
		icon: "h1"
	},
	{
		kind: "toggle-h2",
		label: "Toggle heading 2",
		icon: "h2"
	},
	{
		kind: "toggle-h3",
		label: "Toggle heading 3",
		icon: "h3"
	},
	{
		kind: "table",
		label: "Table",
		icon: "table"
	},
	{
		kind: "equation",
		label: "Equation",
		icon: "equation"
	}
], Mi = {
	h1: "#",
	h2: "##",
	h3: "###",
	todo: "[ ]",
	bullet: "-",
	numbered: "1.",
	quote: ">",
	code: "```",
	divider: "---",
	callout: "> [!",
	table: "|",
	equation: "$$"
};
function Ni(e, t, n, r = !1, i) {
	let a = V(e), o = document.createElement("button");
	o.type = "button", o.setAttribute("aria-label", a), r || (o.dataset.tooltip = i ? `${a} ${i}` : a);
	let s = document.createElement("span");
	s.className = "aa-icon";
	let c = ur[`./icons/${t}.svg`];
	if (c && (s.style.maskImage = `url("data:image/svg+xml,${encodeURIComponent(c.replace(/currentColor/g, "black"))}")`), o.append(s), r) {
		let e = document.createElement("span");
		e.textContent = a, o.append(e);
	}
	return o.addEventListener("pointerdown", (e) => e.preventDefault()), o.addEventListener("click", n), o;
}
var Pi = class extends (typeof HTMLElement > "u" ? class {} : HTMLElement) {
	editor = null;
	actions = [];
	below = null;
	connectedCallback() {
		this.classList.add("ds-context", "ds-context--bar"), this.setAttribute("role", "toolbar"), this.setAttribute("aria-label", V("Text formatting")), this.refresh();
	}
	refresh() {
		if (this.replaceChildren(...this.actions.map((e) => {
			let t = Ni(e.label, e.icon, () => {
				this.editor && !this.editor.readOnly && e.run(this.editor);
			}, !1, e.shortcut);
			return t.classList.add("note-menu-row", "ds-context__item--icon"), t.dataset.action = e.id, t;
		})), !Ri(this.ownerDocument.defaultView)) for (let e = this.actions.length; e % 5; e++) {
			let e = document.createElement("span");
			e.className = "aa-toolbar-spacer", e.setAttribute("aria-hidden", "true"), this.append(e);
		}
		this.below && this.append(this.below);
	}
};
function Fi() {
	customElements.get("aa-toolbar") || customElements.define("aa-toolbar", Pi);
}
function Ii(e) {
	let t = e.insert;
	return t ? {
		id: `insert-${e.name}`,
		label: t.label,
		icon: t.icon,
		keywords: t.keywords,
		preview: t.preview,
		run: (e) => {
			let n = e.activeBlock(), r = !n || !n.block.source.trim(), i = n ? r ? n.start : n.end : e.value.length, a = r && (n || !e.value) ? "" : "\n\n";
			e.replace(i, n && r ? n.end : i, a + t.source);
			let o = t.source.indexOf("\n") + 1;
			e.selectRange(i + a.length + o);
		}
	} : null;
}
function Li(e) {
	let t = e.visualViewport;
	return {
		top: t?.offsetTop ?? 0,
		left: t?.offsetLeft ?? 0,
		width: t?.width ?? e.innerWidth,
		height: t?.height ?? e.innerHeight
	};
}
var Ri = (e) => !!e.matchMedia?.("(pointer: coarse)").matches;
function zi(e) {
	let t = getComputedStyle(e);
	return parseFloat(t.getPropertyValue("--ds-sf")) || parseFloat(t.getPropertyValue("--sf")) || 1;
}
function Bi(e, t) {
	let n = e.ownerDocument.defaultView, r = Li(n);
	e.dataset.docked = "", e.style.left = `${r.left}px`, e.style.width = `${r.width}px`;
	let i = r.height >= n.innerHeight - 1 && parseFloat(getComputedStyle(e).getPropertyValue("--aa-safe-bottom")) || 0, a = e.getBoundingClientRect().height, o = r.top + r.height - a - i;
	t && t.bottom > o && t.top < o + a && t.top - a >= r.top && (o = t.top - a), e.style.top = `${o}px`;
}
function Vi(e, t, n, r) {
	let i = e.top - t.height;
	return {
		left: Math.max(n.left, Math.min(e.left + (e.width - t.width) / 2, n.left + n.width - t.width)),
		top: Math.max(n.top, Math.min(i >= n.top ? i : e.bottom + 0, n.top + n.height - t.height))
	};
}
function Hi(e, t) {
	Fi(), Ai();
	let n = (t.atoms ?? []).map(Ii).filter((e) => !!e), r = e.element, i = r.ownerDocument, a = i.defaultView, o = () => Li(a), s = () => Ri(a), c = i.adoptNode(globalThis.document.createElement("aa-toolbar"));
	c.className = "aa-controls aa-toolbar", c.hidden = !0, c.editor = e, c.dataset.tooltipOver = "";
	let l = null, u = null, d = () => {
		l && e.selectRange(l.start, l.end);
	}, f = (e) => ji.map((t) => ({
		id: t.kind,
		label: t.label,
		icon: t.icon,
		key: Mi[t.kind],
		run: () => {
			d(), e(t.kind);
		}
	})), p = (n, r) => {
		c.hidden = !0, Ei({
			title: n,
			groups: r,
			root: x,
			nonModal: t.nonModalSheets,
			onClose: (t) => {
				if (!t) {
					let t = l?.end ?? e.selection()?.end;
					l = null, t !== void 0 && (u = {
						start: t,
						end: t
					}, e.selectRange(t)), c.hidden = !0;
				}
			}
		});
	}, m = (t) => {
		let n = e.activeBlock();
		if (!n || n.block.kind === "paragraph" && !n.block.source.trim()) {
			e.turnInto(t);
			return;
		}
		let i = Wn([{
			kind: "paragraph",
			source: "",
			prefix: 0
		}], {
			anchor: 0,
			focus: 0
		}, t), a = i.blocks.map((e) => e.source).join("\n\n");
		a ? (e.replace(n.end, n.end, `\n\n${a}`), e.selectRange(n.end + 2 + i.caret.offset)) : (e.selectRange(n.end), r.children[n.index]?.dispatchEvent(new KeyboardEvent("keydown", {
			key: "Enter",
			bubbles: !0,
			cancelable: !0
		})));
	}, h = (t, n, r) => ({
		id: t,
		icon: t,
		label: n,
		shortcut: r,
		run: () => {
			d(), e.format(t);
		}
	}), g = [{
		id: "color-default",
		label: "Default",
		icon: "color",
		run: () => e.color(null)
	}, ...Tt.map((t) => ({
		id: `color-${t}`,
		label: t === "gray" ? "Grey" : t[0].toUpperCase() + t.slice(1),
		icon: "color",
		ink: t,
		run: () => e.color(t)
	}))], _ = (e) => e === "gray" ? "Grey" : e[0].toUpperCase() + e.slice(1), v = [{
		id: "color-bg-default",
		label: "Default",
		icon: "color",
		run: () => e.background(null)
	}, ...Et.map((t) => ({
		id: `color-bg-${t}`,
		label: t === "yellow" ? "Highlight" : _(t),
		icon: "color",
		swatch: t,
		run: () => e.background(t)
	}))];
	c.actions = [
		{
			id: "color",
			icon: "color",
			label: "Text colour",
			run: () => {
				d(), me(g, (c.querySelector("[data-action=\"color\"]") ?? c).getBoundingClientRect());
			}
		},
		{
			id: "background",
			icon: "background",
			label: "Background colour",
			run: () => {
				d(), me(v, (c.querySelector("[data-action=\"background\"]") ?? c).getBoundingClientRect());
			}
		},
		h("bold", "Bold", "⌘B"),
		h("italic", "Italic", "⌘I"),
		h("underline", "Underline", "⌘U"),
		h("strike", "Strikethrough", "⌘⇧S"),
		h("link", "Link", "⌘K"),
		h("code", "Code", "⌘E"),
		h("equation", "Equation"),
		...t.comments ? [{
			id: "comment",
			icon: "comment",
			label: "Comment",
			shortcut: "⌘⇧M",
			run: () => {
				d(), e.comments?.start();
			}
		}] : [],
		...(Array.isArray(t.toolbar) ? t.toolbar : []).map((t) => ({
			...t,
			run: () => {
				d(), t.run(e);
			}
		}))
	];
	let y = {
		id: "turn",
		icon: "text",
		label: "Turn into",
		run: () => {
			d(), e.activeBlock() && p("Turn into", [{ rows: f((t) => e.turnInto(t)) }]);
		}
	}, b = [
		"color",
		"bold",
		"italic",
		"underline",
		"strike",
		"link"
	];
	if (s() && (c.actions = c.actions.filter((e) => b.includes(e.id))), t.prompt) {
		let t = i.createElement("form");
		t.className = "aa-toolbar-ask";
		let n = i.createElement("textarea");
		n.rows = 1, n.placeholder = "Ask", n.setAttribute("aria-label", V("Ask AI about the selected words")), n.autocomplete = "off", t.append(n);
		let r = (e) => {
			c.toggleAttribute("data-asking", e);
			for (let t of c.querySelectorAll("button")) t.inert = e;
			e || (n.scrollTop = 0);
		};
		n.addEventListener("focus", () => r(!0)), n.addEventListener("blur", () => r(!1)), t.addEventListener("submit", (t) => {
			t.preventDefault();
			let i = n.value.trim(), a = l;
			i && a && !n.disabled && !e.readOnly && (n.disabled = !0, r(!1), e.selectRange(a.start, a.end), e.askAbout(i).then((e) => {
				n.value = e ? "" : n.value, e || (n.placeholder = V("Not answered"));
			}).catch(() => {
				n.placeholder = V("Not answered");
			}).finally(() => {
				n.disabled = !1, setTimeout(() => {
					n.placeholder = "Ask";
				}, 2e3);
			}));
		}), n.addEventListener("keydown", (e) => {
			e.isComposing || e.key === "Enter" && !e.shiftKey && (e.preventDefault(), t.requestSubmit());
		}), c.below = t;
	}
	s() && (c.actions = [
		...c.actions,
		{
			id: "insert",
			label: "Insert block",
			icon: "plus",
			run: () => {
				d(), p("Insert block", [{
					label: "Blocks",
					rows: f(m)
				}, {
					label: "More",
					rows: [...he.filter((e) => !ji.some((t) => t.kind === e.id)), ...t.commands ?? []].map((t) => ({
						id: t.id,
						label: t.label,
						icon: t.icon,
						run: () => {
							d(), t.run(e);
						}
					}))
				}]);
			}
		},
		y,
		...t.menus === !1 ? [] : [{
			id: "block",
			label: "Block commands",
			icon: "slash",
			run: () => {
				d(), F = e.activeBlock()?.index ?? -1, H(c.querySelector("[data-action=\"block\"]")?.getBoundingClientRect());
			}
		}],
		...t.comments ? [{
			id: "comment",
			icon: "comment",
			label: "Comment",
			run: () => {
				d(), e.comments?.start();
			}
		}] : [],
		{
			id: "indent",
			label: "Indent",
			icon: "indent",
			run: () => {
				d(), e.indent(1);
			}
		},
		{
			id: "outdent",
			label: "Outdent",
			icon: "outdent",
			run: () => {
				d(), e.indent(-1);
			}
		},
		...(Array.isArray(t.toolbar) ? t.toolbar : []).map((t) => ({
			...t,
			run: () => {
				d(), t.run(e);
			}
		}))
	]), c.refresh();
	let x = r.closest("dialog") ?? r.ownerDocument.body;
	t.toolbar && x.append(c);
	let S = i.createElement("div");
	S.className = "aa-controls aa-menu", S.hidden = !0, S.setAttribute("role", "menu"), S.setAttribute("aria-label", V("Block commands"));
	let C = i.createElement("div");
	C.className = "aa-menu-list", C.setAttribute("role", "none");
	let w = Ni("Close", "close", () => B(), !0);
	w.classList.add("note-menu-row"), w.dataset.command = "close", w.setAttribute("role", "menuitem"), w.tabIndex = -1, w.querySelector(".aa-icon")?.remove();
	let T = i.createElement("kbd");
	T.textContent = "esc", w.append(T);
	let E = i.createElement("div");
	E.className = "aa-controls aa-find", E.hidden = !0, E.setAttribute("role", "search");
	let D = i.createElement("div");
	D.className = "aa-controls aa-command-preview", D.hidden = !0, D.setAttribute("aria-hidden", "true");
	let ee, O, te = () => {
		O?.(), O = void 0, ee = void 0, D.replaceChildren(), D.hidden = !0, D.remove();
	}, ne = () => {
		if (!ee?.preview || S.hidden) {
			D.hidden = !0;
			return;
		}
		let e = o(), t = 20 * zi(r), n = S.getBoundingClientRect(), i = D.getBoundingClientRect().width || 16 * t, a = n.right + t / 2, s = n.left - t / 2 - i;
		if (a + i > e.left + e.width && s < e.left) {
			D.hidden = !0;
			return;
		}
		D.hidden = !1, D.style.left = `${a + i <= e.left + e.width ? a : s}px`;
		let c = D.getBoundingClientRect().height;
		D.style.top = `${Math.max(e.top, Math.min(Math.round(n.top / t) * t, e.top + e.height - c))}px`;
	}, re = (e = "keyboard", t = !1) => {
		let n = L[I];
		n === ee && !t ? ne() : (te(), n?.preview && (ee = n, D.hidden = !1, x.append(D), O = n.preview(D, { input: e }), ne()));
	};
	x.append(S, E);
	let k = i.createElement("form");
	k.className = "aa-controls aa-find aa-link-editor", k.hidden = !0, k.setAttribute("aria-label", V("Edit link"));
	let A = i.createElement("input");
	A.type = "text", A.placeholder = V("Link URL"), A.setAttribute("aria-label", V("Link URL"));
	let j = i.createElement("button");
	j.type = "submit", j.textContent = V("Apply");
	let M = i.createElement("button");
	M.type = "button", M.textContent = V("Cancel"), k.append(A, j, M), x.append(k);
	let N = null, ie = () => {
		k.hidden = !0, N && e.selectRange(N.start, N.end), N = null;
	}, ae = (t) => {
		if (N = t.detail, N && !e.readOnly) {
			if (A.value = N.url, k.hidden = !1, c.hidden = !0, s()) Bi(k);
			else {
				delete k.dataset.docked, k.style.width = "";
				let e = r.getBoundingClientRect(), t = 20 * zi(r), n = o();
				k.style.left = `${Math.max(n.left, Math.min(e.left, n.left + n.width - 16 * t))}px`, k.style.top = `${Math.max(n.top, Math.min(e.top, n.top + n.height - 3 * t))}px`;
			}
			A.focus(), A.select();
		}
	};
	k.addEventListener("submit", (t) => {
		if (t.preventDefault(), !N || e.readOnly) return;
		let n = A.value.trim().replace(/\(/g, "%28").replace(/\)/g, "%29"), r = N.text || n;
		(n || N.url) && e.replace(N.start, N.end, n ? `[${r}](${n})` : r), k.hidden = !0, N = null;
	}), M.addEventListener("click", ie), k.addEventListener("keydown", (e) => {
		e.key === "Escape" && (e.preventDefault(), ie());
	}), r.addEventListener("aa-link-request", ae);
	let oe = null, P = () => {
		oe?.remove(), oe = null;
	}, se = (t, n) => {
		if (P(), e.readOnly) return;
		let a = i.createElement("div");
		a.className = "aa-controls aa-menu aa-reaction-picker aa-callout-icons", a.setAttribute("role", "menu"), a.setAttribute("aria-label", V("Callout icon"));
		let s = (n) => {
			P(), e.callout({ icon: n }, t), e.focus();
		};
		for (let e of fe) {
			let t = i.createElement("button");
			t.type = "button", t.setAttribute("role", "menuitem"), t.textContent = e, t.setAttribute("aria-label", V("Icon {emoji}", { emoji: e })), t.addEventListener("pointerdown", (e) => e.preventDefault()), t.addEventListener("click", (t) => {
				t.preventDefault(), s(e);
			}), a.append(t);
		}
		let c = i.createElement("button");
		c.type = "button", c.setAttribute("role", "menuitem"), c.className = "aa-callout-icons-none", c.textContent = V("No icon"), c.addEventListener("pointerdown", (e) => e.preventDefault()), c.addEventListener("click", (e) => {
			e.preventDefault(), s(null);
		}), a.append(c), a.addEventListener("keydown", (t) => {
			t.key === "Escape" && (t.preventDefault(), t.stopPropagation(), P(), e.focus());
		}), x.append(a), oe = a;
		let l = 20 * zi(r), u = o(), d = 8 * l, f = 3 * l, p = 4 * l / 20;
		a.style.left = `${Math.max(u.left, Math.min(n.left, u.left + u.width - d))}px`, a.style.top = `${n.bottom + p + f <= u.top + u.height ? n.bottom + p : Math.max(u.top, n.top - p - f)}px`, a.querySelector("button")?.focus();
	};
	r.addEventListener("aa-callout-icon", (e) => {
		let t = e.detail;
		se(t.index, t.rect);
	}), i.addEventListener("pointerdown", (e) => {
		oe && !oe.contains(e.target) && P();
	}, !0);
	let F = -1, I = 0, L = [], R = null, ce, z = !1, le = (e) => {
		let t = 20 * zi(r), n = o(), i = S.getBoundingClientRect(), a = i.height || (Math.min(L.length, 8) + 1) * t;
		for (let e of Array.from(C.querySelectorAll("button > span:not(.aa-icon)"))) e.toggleAttribute("data-cut", e.scrollWidth > e.clientWidth + 1);
		S.style.left = `${Math.max(n.left, Math.min(e.left, n.left + n.width - i.width))}px`;
		let s = e.bottom, c = e.top - a, l = s + a <= n.top + n.height;
		S.style.top = `${l || c < n.top ? Math.max(n.top, Math.min(s, n.top + n.height - a)) : c}px`;
	}, ue = () => {
		clearTimeout(ce), c.contains(i.activeElement) && i.activeElement.blur(), c.hidden = !0;
		let t = e.selection();
		u = t ? { ...t } : null;
	}, B = () => {
		delete S.dataset.palette, te(), S.hidden = !0, R = null, C.replaceChildren(), S.replaceChildren(), r.removeAttribute("aria-controls");
	}, de = (t) => {
		if (e.readOnly) return;
		let n = R;
		if (B(), e.transaction(() => {
			n && e.replace(n.from, n.to, ""), t.run(e);
		}), s()) {
			let t = e.selection();
			t && t.start !== t.end && e.selectRange(t.end);
		}
		t.id.startsWith("color-") ? (c.hidden = !1, _e()) : ue();
	}, pe = () => {
		if (C.replaceChildren(...L.map((e, t) => {
			let n = Ni(e.label, e.icon, () => de(e), !("palette" in S.dataset));
			return "palette" in S.dataset && (n.classList.add("aa-colour-swatch"), n.querySelector(".aa-icon")?.removeAttribute("style")), e.ink && n.querySelector(".aa-icon")?.setAttribute("data-color", e.ink), e.swatch && n.querySelector(".aa-icon")?.setAttribute("data-fill", e.swatch), n.classList.add("note-menu-row"), n.dataset.command = e.id, n.setAttribute("role", "menuitem"), e.id === "count" && (n.lastElementChild.textContent = V(e.label).split(",")[0], n.querySelector(".aa-icon")?.remove()), n.tabIndex = t === I ? 0 : -1, n.toggleAttribute("data-current", t === I), n.addEventListener("pointerenter", () => {
				I = t, Array.from(C.children).forEach((e, t) => e.toggleAttribute("data-current", t === I)), re("pointer", !0);
			}), n;
		})), !L.length) {
			let e = i.createElement("span");
			e.className = "aa-menu-empty", e.textContent = V("No matching commands"), C.append(e);
		}
		S.replaceChildren(C, w), re();
		let e = C.children[I];
		e && typeof e.scrollIntoView == "function" && e.scrollIntoView({ block: "nearest" });
	};
	function me(t, n) {
		L = t.filter((t) => t.enabled?.(e) !== !1), S.toggleAttribute("data-palette", L.length > 0 && L.every((e) => e.id.startsWith("color-"))), S.setAttribute("aria-label", V("palette" in S.dataset ? L[0].id.startsWith("color-bg") ? "Background colour" : "Text colour" : "Block commands")), I = 0, S.hidden = !1, pe(), le(n), ne();
	}
	let he = [...ji.map((t) => ({
		id: t.kind,
		label: t.label,
		icon: t.icon,
		run: () => e.turnInto(t.kind)
	})), ...n];
	t.onFiles && he.push({
		id: "image",
		label: "Image or file",
		icon: "image",
		run: () => {
			let t = i.createElement("input");
			t.type = "file", t.multiple = !0, t.addEventListener("change", () => Array.from(t.files ?? []).forEach((t) => e.insertFile(t)), { once: !0 }), t.click();
		}
	});
	let H = (n) => {
		if (F < 0 || t.menus === !1) return;
		let i = e.activeBlock();
		(i?.index !== F || i.block.kind !== "table" && !s()) && e.selectBlocks(F);
		let a = [
			...he,
			{
				id: "duplicate",
				label: "Duplicate",
				icon: "duplicate",
				run: () => e.blockAction("duplicate")
			},
			{
				id: "delete",
				label: "Delete",
				icon: "delete",
				run: () => e.blockAction("delete")
			},
			{
				id: "up",
				label: "Move up",
				icon: "up",
				enabled: (e) => e.reordering,
				run: () => e.blockAction("up")
			},
			{
				id: "down",
				label: "Move down",
				icon: "down",
				enabled: (e) => e.reordering,
				run: () => e.blockAction("down")
			},
			{
				id: "indent",
				label: "Indent",
				icon: "indent",
				run: () => e.indent(1),
				enabled: (e) => e.activeBlock()?.block.kind === "bullet"
			},
			{
				id: "outdent",
				label: "Outdent",
				icon: "outdent",
				run: () => e.indent(-1),
				enabled: (e) => e.activeBlock()?.block.kind === "bullet"
			},
			...[
				"add-row",
				"delete-row",
				"add-column",
				"delete-column"
			].map((t) => ({
				id: t,
				label: t.replace("-", " ").replace(/^./, (e) => e.toUpperCase()),
				icon: "table",
				enabled: (e) => e.activeBlock()?.block.kind === "table",
				run: () => e.table(t)
			})),
			...qe.map((t) => ({
				id: `fill-${t}`,
				label: `${t === "gray" ? "Grey" : t[0].toUpperCase() + t.slice(1)} fill`,
				icon: "color",
				swatch: t,
				keywords: "callout colour background",
				enabled: (e) => e.activeBlock()?.block.kind === "callout",
				run: () => e.callout({ color: t }, F)
			})),
			...t.blockCommands ?? []
		], o = e.stats();
		a.push({
			id: "count",
			label: V("{words} words, {characters} characters", {
				words: o.words,
				characters: o.characters
			}),
			icon: "text",
			run: () => {}
		}), R = null, me(a, n ?? (r.children[F] ?? r).getBoundingClientRect());
	}, ge = () => {
		if (z || e.readOnly || t.menus === !1) {
			B();
			return;
		}
		let n = e.activeBlock(), i = e.selection();
		if (!n || !i || i.start !== i.end || n.block.kind === "code" || n.block.kind === "table") return;
		let a = e.value.slice(n.start, i.end), o = /(?:^|\s)\/([^/\n]*)$/.exec(a);
		if (!o) {
			R && B();
			return;
		}
		let s = o[1].toLocaleLowerCase();
		R = {
			from: i.end - o[1].length - 1,
			to: i.end
		}, me([...he, ...t.commands ?? []].filter((e) => `${V(e.label)} ${e.label} ${e.keywords ?? ""}`.toLocaleLowerCase().includes(s)), r.children[n.index]?.getBoundingClientRect() ?? r.getBoundingClientRect());
	}, _e = () => {
		if (!c.hidden) {
			if (s()) c.below && c.lastElementChild !== c.below && c.append(c.below), Bi(c, l ? e.rangeOf(l.start, l.end)?.getBoundingClientRect() : null);
			else {
				delete c.dataset.docked, c.style.width = "";
				let t = l ? e.rangeOf(l.start, l.end) : null, n = Array.from(t?.getClientRects?.() ?? []).filter((e) => e.width > 0 && e.height > 0), i = n[0], a = i ? n.filter((e) => Math.abs(e.top - i.top) < 2) : [], s = t?.getBoundingClientRect?.() ?? r.getBoundingClientRect(), u = a.length ? {
					left: Math.min(...a.map((e) => e.left)),
					top: Math.min(...a.map((e) => e.top)),
					width: Math.max(...a.map((e) => e.right)) - Math.min(...a.map((e) => e.left)),
					bottom: s.bottom
				} : s, d = Vi(u, c.getBoundingClientRect(), o(), zi(r));
				if (c.below) {
					let e = u.top - c.getBoundingClientRect().height < o().top;
					e && c.firstElementChild !== c.below ? c.prepend(c.below) : !e && c.lastElementChild !== c.below && c.append(c.below);
				}
				c.style.left = `${Math.round(d.left)}px`, c.style.top = `${Math.round(d.top)}px`;
			}
		}
	}, ve = () => {
		if (clearTimeout(ce), c.contains(i.activeElement)) return;
		let n = e.selection();
		if (n && n.start === u?.start && n.end === u?.end) {
			c.hidden = !0;
			return;
		}
		u = null;
		let a = s() && r.contains(i.activeElement);
		!n || !a && n.start === n.end || e.readOnly ? c.hidden = !0 : (l = n, ce = setTimeout(() => {
			!z && t.toolbar && !e.readOnly && (c.hidden = !1, _e());
		}, 140));
	}, U = i.createElement("input");
	U.placeholder = V("Find"), U.setAttribute("aria-label", V("Find"));
	let ye = i.createElement("input");
	ye.placeholder = V("Replace"), ye.setAttribute("aria-label", V("Replace"));
	let be = i.createElement("span");
	be.setAttribute("aria-live", "polite");
	let xe = [], W = -1, Se = () => {
		E.hidden || (xe = e.find(U.value), e.decorate(xe.map((e) => ({
			from: e.start,
			to: e.end,
			className: "aa-find-match"
		})), "find"), be.textContent = V("{count} matches", { count: xe.length }), W = Math.min(W, xe.length - 1));
	}, Ce = (t) => {
		if (!xe.length) return;
		W = (W + t + xe.length) % xe.length;
		let n = xe[W];
		e.selectRange(n.start, n.end), be.textContent = V("{number} of {count}", {
			number: W + 1,
			count: xe.length
		});
	}, we = () => {
		E.hidden = !0, e.decorate([], "find"), e.focus();
	};
	U.addEventListener("input", Se), E.append(U, ye, Ni("Previous match", "up", () => Ce(-1)), Ni("Next match", "down", () => Ce(1)), Ni("Replace", "text", () => {
		let t = xe[W < 0 ? 0 : W];
		t && !e.readOnly && (e.replace(t.start, t.end, ye.value), Se());
	}), Ni("Replace all", "text", () => {
		if (!xe.length || e.readOnly) return;
		let t = e.value;
		for (let e of [...xe].reverse()) t = t.slice(0, e.start) + ye.value + t.slice(e.end);
		e.replace(0, e.value.length, t), Se();
	}), be, Ni("Close find", "close", we)), E.addEventListener("keydown", (e) => {
		e.key === "Escape" ? (e.preventDefault(), we()) : e.key === "Enter" && (e.preventDefault(), Ce(e.shiftKey ? -1 : 1));
	});
	let Te = () => {
		clearTimeout(ce);
		let t = i.activeElement;
		t?.nodeType === 1 && [
			c,
			S,
			k,
			E
		].some((e) => e.contains(t)) && t.blur(), B(), c.hidden = !0, k.hidden = !0, N = null, E.hidden = !0, e.decorate([], "find"), l = null, u = null;
	}, Ee = (t) => {
		if (t.key !== "Escape" || t.isComposing || t.defaultPrevented) return;
		let n = t.target;
		n && [
			r,
			c,
			S,
			k,
			E
		].some((e) => e.contains(n)) && (c.hidden && S.hidden && k.hidden && E.hidden || (t.preventDefault(), t.stopImmediatePropagation(), e.dismiss()));
	}, De = (n) => {
		if (n.isComposing || n.defaultPrevented) return;
		let i = /Mac|iPhone|iPad/.test(navigator.platform) ? n.metaKey : n.ctrlKey;
		if (i && n.key.toLowerCase() === "f") {
			n.preventDefault(), n.stopImmediatePropagation(), E.hidden = !1;
			let e = r.getBoundingClientRect();
			E.style.left = `${Math.max(0, e.left)}px`, E.style.top = `${Math.max(0, e.top)}px`, Se(), U.focus();
		} else i && n.key === "/" && t.menus !== !1 ? (n.preventDefault(), n.stopImmediatePropagation(), F = e.activeBlock()?.index ?? -1, H()) : S.hidden || (n.key === "Escape" ? (n.preventDefault(), n.stopImmediatePropagation(), B()) : n.key === "ArrowDown" || n.key === "ArrowUp" ? (n.preventDefault(), n.stopImmediatePropagation(), L.length && (I = (I + (n.key === "ArrowDown" ? 1 : -1) + L.length) % L.length), pe()) : n.key === "Enter" && L[I] && (n.preventDefault(), n.stopImmediatePropagation(), de(L[I])));
	};
	S.addEventListener("keydown", De);
	let Oe = (e) => {
		let t = e.target;
		S.contains(t) || B(), [
			c,
			S,
			k,
			E
		].some((e) => e.contains(t)) || (ue(), k.hidden = !0, N = null);
	}, ke = () => {
		ge(), Se(), e.readOnly && (c.hidden = !0, k.hidden = !0, N = null);
	}, Ae = (n) => {
		let i = n.target, a = i.closest(".aa-block");
		!a || a.parentElement !== r || e.readOnly || t.menus === !1 || n.shiftKey || s() || i.closest("input, textarea, .aa-caption, [data-aa-interactive]") || (n.preventDefault(), F = Array.from(r.children).indexOf(a), H(new DOMRect(n.clientX, n.clientY, 0, 0)), clearTimeout(ce), c.hidden = !0, u = e.selection());
	}, G = (t) => {
		let n = t.target;
		if (!(n?.nodeType && S.contains(n)) && (_e(), !k.hidden && "docked" in k.dataset && Bi(k), !S.hidden)) {
			let t = e.activeBlock(), n = t ? r.children[t.index]?.getBoundingClientRect() : null;
			n && (le(n), ne());
		}
	}, je = () => {
		u = null;
	};
	r.addEventListener("pointerdown", je), r.addEventListener("aa-dismiss", Te), i.addEventListener("keydown", Ee, !0), r.addEventListener("aa-selectionchange", ve), r.addEventListener("aa-change", ke), r.addEventListener("contextmenu", Ae), r.addEventListener("keydown", De, !0), i.addEventListener("pointerdown", Oe), a.addEventListener("resize", G), a.addEventListener("scroll", G, !0), a.visualViewport?.addEventListener("resize", G), a.visualViewport?.addEventListener("scroll", G);
	let Me = mi(e, t, x);
	return () => {
		te(), D.remove(), z = !0, clearTimeout(ce), Me(), c.remove(), S.remove(), E.remove(), k.remove(), r.removeEventListener("aa-link-request", ae), r.removeEventListener("aa-selectionchange", ve), r.removeEventListener("aa-change", ke), r.removeEventListener("aa-dismiss", Te), r.removeEventListener("keydown", De, !0), r.removeEventListener("contextmenu", Ae), r.removeEventListener("pointerdown", je), i.removeEventListener("keydown", Ee, !0), i.removeEventListener("pointerdown", Oe), a.removeEventListener("resize", G), a.removeEventListener("scroll", G, !0), a.visualViewport?.removeEventListener("resize", G), a.visualViewport?.removeEventListener("scroll", G);
	};
}
//#endregion
//#region src/selection.ts
function Ui(e, t, n) {
	let r = [];
	for (let t of [...e].filter((e) => e.right > e.left && e.bottom > e.top).sort((e, t) => e.top - t.top || e.left - t.left)) {
		let e = r.find((e) => Math.min(e.bottom, t.bottom) - Math.max(e.top, t.top) > Math.min(e.bottom - e.top, t.bottom - t.top) / 2);
		e ? (e.fragments.push(t), e.left = Math.min(e.left, t.left), e.right = Math.max(e.right, t.right), e.top = Math.min(e.top, t.top), e.bottom = Math.max(e.bottom, t.bottom)) : r.push({
			...t,
			fragments: [t]
		});
	}
	for (let e of r) {
		let n = e.left;
		for (let t of e.fragments.sort((e, t) => e.left - t.left)) {
			if (t.left > n + 1) return null;
			n = Math.max(n, t.right);
		}
		let r = Math.max(0, t - (e.bottom - e.top)) / 2;
		e.top -= r, e.bottom += r;
	}
	let i = [];
	for (let e of r) {
		let t = i.at(-1), n = t?.at(-1);
		n && e.top <= n.bottom + 1 && e.left < n.right && e.right > n.left ? (n.bottom = e.top = (n.bottom + e.top) / 2, t.push(e)) : i.push([e]);
	}
	return i.map((e) => {
		let t = e[0], r = e.at(-1), i = [{
			x: t.left,
			y: t.top
		}, {
			x: t.right,
			y: t.top
		}];
		for (let t of e) i.push({
			x: t.right,
			y: t.top
		}, {
			x: t.right,
			y: t.bottom
		});
		i.push({
			x: r.left,
			y: r.bottom
		});
		for (let t of [...e].reverse()) i.push({
			x: t.left,
			y: t.bottom
		}, {
			x: t.left,
			y: t.top
		});
		return Wi(i, n);
	}).join(" ");
}
function Wi(e, t) {
	let n = e.filter((t, n) => !n || t.x !== e[n - 1].x || t.y !== e[n - 1].y);
	n[0].x === n.at(-1).x && n[0].y === n.at(-1).y && n.pop(), n = n.filter((e, t, n) => {
		let r = n[(t + n.length - 1) % n.length], i = n[(t + 1) % n.length];
		return !(r.x === e.x && e.x === i.x || r.y === e.y && e.y === i.y);
	});
	let r = (e) => Number(e.toFixed(3));
	return n.map((e, i) => {
		let a = n[(i + n.length - 1) % n.length], o = n[(i + 1) % n.length], s = Math.hypot(a.x - e.x, a.y - e.y), c = Math.hypot(o.x - e.x, o.y - e.y), l = Math.max(0, Math.min(t, s / 2, c / 2)), u = e.x + (a.x - e.x) * l / s, d = e.y + (a.y - e.y) * l / s, f = e.x + (o.x - e.x) * l / c, p = e.y + (o.y - e.y) * l / c;
		return `${i ? "L" : "M"}${r(u)} ${r(d)} Q${r(e.x)} ${r(e.y)} ${r(f)} ${r(p)}`;
	}).join(" ") + " Z";
}
function Gi(e) {
	let t = e.ownerDocument, n = t.defaultView ?? window, r = 0, i = !1, a = !1, o = /* @__PURE__ */ new Set(), s = n.matchMedia("(forced-colors: active)"), c = () => {
		for (let e of o) e.removeAttribute("data-aa-selection"), e.style.removeProperty("--aa-selection-mask"), e.style.removeProperty("--aa-selection-box"), e.style.removeProperty("--aa-selection-width"), e.style.removeProperty("--aa-selection-height");
		o.clear();
	}, l = () => {
		r = 0, c();
		let l = n.getSelection();
		if (i || a || s.matches || !l?.rangeCount || l.isCollapsed || !e.contains(l.anchorNode) || !e.contains(l.focusNode)) return;
		let u = l.getRangeAt(0);
		for (let r of Array.from(e.children)) {
			if (!r.classList.contains("aa-block") || r.dataset.kind === "table" || !u.intersectsNode(r)) continue;
			let e = t.createRange();
			if (e.selectNodeContents(r), u.compareBoundaryPoints(Range.START_TO_START, e) > 0 && e.setStart(u.startContainer, u.startOffset), u.compareBoundaryPoints(Range.END_TO_END, e) < 0 && e.setEnd(u.endContainer, u.endOffset), e.collapsed || typeof e.getClientRects != "function") continue;
			let i = r.getBoundingClientRect(), a = n.getComputedStyle(r);
			if (a.writingMode && a.writingMode !== "horizontal-tb" || Math.abs(i.width - r.offsetWidth) > 1) continue;
			let s = parseFloat(a.lineHeight) || parseFloat(a.fontSize) * 1.2, c = Array.from(e.getClientRects()).filter((e) => e.width > 0 && e.height > 0).map((e) => ({
				left: e.left - i.left + r.scrollLeft - r.clientLeft,
				right: e.right - i.left + r.scrollLeft - r.clientLeft,
				top: e.top - i.top + r.scrollTop - r.clientTop,
				bottom: e.bottom - i.top + r.scrollTop - r.clientTop
			}));
			if (!c.length) continue;
			let l = Math.min(...c.map((e) => e.left)), d = Math.min(...c.map((e) => e.top)) - s / 2, f = Math.max(...c.map((e) => e.right)) - l, p = Math.max(...c.map((e) => e.bottom)) - d + s / 2, m = parseFloat(a.getPropertyValue("--sf")) || 1, h = Ui(c.map((e) => ({
				left: e.left - l,
				right: e.right - l,
				top: e.top - d,
				bottom: e.bottom - d
			})), s, 2 * m);
			if (!h) continue;
			let g = `<svg xmlns="http://www.w3.org/2000/svg" width="${f}" height="${p}" viewBox="0 0 ${f} ${p}"><path d="${h}"/></svg>`;
			r.style.setProperty("--aa-selection-mask", `url("data:image/svg+xml,${encodeURIComponent(g)}")`), r.style.setProperty("--aa-selection-box", `${d}px auto auto ${l}px`), r.style.setProperty("--aa-selection-width", `${f}px`), r.style.setProperty("--aa-selection-height", `${p}px`), r.setAttribute("data-aa-selection", ""), o.add(r);
		}
	}, u = () => {
		!i && !r && (r = n.requestAnimationFrame(l));
	}, d = () => {
		a = !0, c();
	}, f = () => {
		a = !1, u();
	}, p = new (n.ResizeObserver ?? ResizeObserver)(u);
	p.observe(e);
	let m = new (n.MutationObserver ?? MutationObserver)(u);
	return m.observe(e, {
		childList: !0,
		subtree: !0,
		characterData: !0
	}), t.addEventListener("selectionchange", u), t.addEventListener("scroll", u, !0), n.addEventListener("resize", u), e.addEventListener("compositionstart", d), e.addEventListener("compositionend", f), e.addEventListener("load", u, !0), t.fonts?.addEventListener("loadingdone", u), s.addEventListener?.("change", u), () => {
		i = !0, n.cancelAnimationFrame(r), c(), p.disconnect(), m.disconnect(), t.removeEventListener("selectionchange", u), t.removeEventListener("scroll", u, !0), n.removeEventListener("resize", u), e.removeEventListener("compositionstart", d), e.removeEventListener("compositionend", f), e.removeEventListener("load", u, !0), t.fonts?.removeEventListener("loadingdone", u), s.removeEventListener?.("change", u);
	};
}
//#endregion
//#region src/span.ts
var Ki = 24, qi = "button, input, textarea, select, video, audio, .aa-caption, [data-aa-interactive]", Ji = (e) => e.hasAttribute("data-aa-across");
function Yi(e) {
	if (Ji(e)) {
		e.removeAttribute("data-aa-across"), e.removeAttribute("contenteditable");
		for (let t of Array.from(e.children)) t.contentEditable === "inherit" && (t.contentEditable = "true");
	}
}
function Xi(e, t, n, r) {
	if (t.setBaseAndExtent(n.node, n.offset, r.node, r.offset), (t.focusNode !== r.node || t.anchorNode !== n.node) && n.node.isConnected && r.node.isConnected) {
		e.setAttribute("data-aa-across", ""), e.contentEditable = "true";
		for (let t of Array.from(e.children)) t.contentEditable === "true" && (t.contentEditable = "inherit");
		e.focus({ preventScroll: !0 }), t.setBaseAndExtent(n.node, n.offset, r.node, r.offset);
	}
}
function Zi(e, t) {
	let n = e.ownerDocument, r = n.defaultView, i = () => Array.from(e.children).filter((e) => e.classList.contains("aa-block")), a = (t) => {
		let n = (t?.nodeType === 1 ? t : t?.parentElement)?.closest(".aa-block");
		return n && n.parentElement === e ? n : null;
	}, o = (e, t) => {
		let r = n.caretPositionFromPoint?.(e, t);
		if (r) return {
			node: r.offsetNode,
			offset: r.offset
		};
		let i = n.caretRangeFromPoint?.(e, t);
		return i ? {
			node: i.startContainer,
			offset: i.startOffset
		} : null;
	}, s = (e, t) => {
		let n = i();
		if (!n.length) return null;
		let r = n.map((e) => e.getBoundingClientRect()), s = r.findIndex((e) => t < e.bottom);
		s < 0 && (s = n.length - 1), s > 0 && t < r[s].top && r[s].top - t > t - r[s - 1].bottom && s--;
		let l = n[s], u = r[s];
		if (t < u.top) return {
			block: l,
			offset: 0
		};
		if (t >= u.bottom) return {
			block: l,
			offset: c(l)
		};
		let d = o(Math.min(Math.max(e, u.left + 1), u.right - 1), t);
		return !d || a(d.node) !== l ? {
			block: l,
			offset: e < u.left + u.width / 2 ? 0 : c(l)
		} : {
			block: l,
			offset: Dr(l, d.node, d.offset)
		};
	}, c = (e) => Dr(e, e, e.childNodes.length), l = (e, t) => {
		let n = a(e);
		return n && e ? {
			block: n,
			offset: Dr(n, e, t)
		} : null;
	}, u = !1, d = (t, n) => {
		let i = r.getSelection();
		if (!i || !t.block.isConnected || !n.block.isConnected) return;
		let a = Or(t.block, t.offset), o = Or(n.block, n.offset);
		if (i.anchorNode !== a.node || i.anchorOffset !== a.offset || i.focusNode !== o.node || i.focusOffset !== o.offset) {
			u = !0;
			try {
				Xi(e, i, a, o);
			} finally {
				u = !1;
			}
		}
	}, f = null, p = 0, m = (e) => {
		if (f = null, e.pointerType !== "mouse" || e.button !== 0 || e.altKey || e.metaKey || e.ctrlKey || t()) return;
		let n = e.target?.nodeType === 1 ? e.target : null;
		if (!a(n) || n?.closest(qi)) return;
		let i = s(e.clientX, e.clientY);
		if (i) {
			if (e.shiftKey) {
				let t = r.getSelection(), n = t?.rangeCount ? l(t.anchorNode, t.anchorOffset) : null;
				if (!n || n.block === i.block) return;
				e.preventDefault(), f = {
					pointer: e.pointerId,
					start: n,
					words: !1,
					anchor: n,
					focus: i,
					x: e.clientX,
					y: e.clientY
				}, d(n, i);
			} else f = {
				pointer: e.pointerId,
				start: i,
				words: !1,
				anchor: null,
				focus: null,
				x: e.clientX,
				y: e.clientY
			};
		}
	}, h = () => {
		if (!f?.anchor) return;
		let e = s(f.x, f.y);
		e && (f.focus = e, d(f.anchor, e));
	}, g = (t) => {
		if (f && t.pointerId === f.pointer) {
			if (!(t.buttons & 1) || e.hasAttribute("data-dragging")) S();
			else {
				if (f.x = t.clientX, f.y = t.clientY, !f.anchor) {
					let e = s(t.clientX, t.clientY);
					if (!e || e.block === f.start.block) return;
					let n = r.getSelection(), i = f.words && n?.rangeCount ? l(n.anchorNode, n.anchorOffset) : null;
					f.anchor = i?.block === f.start.block ? i : f.start;
				}
				h(), x();
			}
		}
	}, _ = (e) => {
		f?.anchor && e.buttons & 1 && e.preventDefault();
	}, v = (e) => {
		f && e.detail > 1 && (f.words = !0);
	}, y = (e) => {
		f?.anchor && e.preventDefault();
	}, b = () => {
		!u && f?.anchor && f.focus && d(f.anchor, f.focus);
	}, x = () => {
		if (p || !f?.anchor) return;
		let t = f.y < Ki ? f.y - Ki : f.y > r.innerHeight - Ki ? f.y - (r.innerHeight - Ki) : 0;
		t && (p = requestAnimationFrame(() => {
			p = 0, f?.anchor && (Qi(e).scrollBy(0, Math.sign(t) * Math.min(Math.abs(t), Ki)), h(), x());
		}));
	}, S = () => {
		f = null, p && cancelAnimationFrame(p), p = 0;
	}, C = (e) => {
		f && e.pointerId === f.pointer && S();
	};
	return r.addEventListener("pointerdown", m, !0), r.addEventListener("pointermove", g, !0), r.addEventListener("pointerup", C, !0), r.addEventListener("pointercancel", C, !0), r.addEventListener("mousemove", _, !0), r.addEventListener("mousedown", v, !0), n.addEventListener("selectstart", y, !0), n.addEventListener("selectionchange", b), () => {
		S(), r.removeEventListener("pointerdown", m, !0), r.removeEventListener("pointermove", g, !0), r.removeEventListener("pointerup", C, !0), r.removeEventListener("pointercancel", C, !0), r.removeEventListener("mousemove", _, !0), r.removeEventListener("mousedown", v, !0), n.removeEventListener("selectstart", y, !0), n.removeEventListener("selectionchange", b);
	};
}
function Qi(e) {
	for (let t = e.parentElement; t; t = t.parentElement) {
		let e = getComputedStyle(t).overflowY;
		if ((e === "auto" || e === "scroll") && t.scrollHeight > t.clientHeight) return t;
	}
	return e.ownerDocument.defaultView;
}
var $i = 4e3, ea = /* @__PURE__ */ new Set([
	"paragraph",
	"heading",
	"bullet",
	"quote",
	"callout"
]), ta = /[\p{L}\p{M}\p{N}_]/u, na = /[\p{L}\p{M}\p{N}_]+(?:['’][\p{L}\p{M}\p{N}_]+)*|\s+|[^]/gu, ra = /(?:https?:\/\/|www\.)\S+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
function ia(e) {
	return ea.has(e.kind) && e.source.length <= $i && /\p{L}/u.test(e.source);
}
function aa(e, t) {
	if (!ia(e)) return [];
	let n = [];
	for (let r of Bt(e, t)) {
		if (r.kind !== "text" || r.code) continue;
		let e = n[n.length - 1];
		e && e[1] === r.from ? e[1] = r.to : n.push([r.from, r.to]);
	}
	for (let t of e.source.matchAll(ra)) {
		let e = t.index, r = e + t[0].length;
		n = n.flatMap(([t, n]) => n <= e || t >= r ? [[t, n]] : [...t < e ? [[t, e]] : [], ...n > r ? [[r, n]] : []]);
	}
	return n;
}
var oa = (e) => Array.from(e.matchAll(na), (e) => ({
	text: e[0],
	at: e.index
}));
function sa(e, t) {
	let n = oa(e), r = oa(t), i = (t) => t < n.length ? n[t].at : e.length, a = (e, t) => r.slice(e, t).map((e) => e.text).join(""), o = 0;
	for (; o < n.length && o < r.length && n[o].text === r[o].text;) o++;
	let s = n.length, c = r.length;
	for (; s > o && c > o && n[s - 1].text === r[c - 1].text;) s--, c--;
	let l = s - o, u = c - o;
	if (!l && !u) return [];
	if (l * u > 25e4) return [{
		from: i(o),
		to: i(s),
		text: a(o, c)
	}];
	let d = Array.from({ length: l + 1 }, () => new Uint16Array(u + 1));
	for (let e = l - 1; e >= 0; e--) for (let t = u - 1; t >= 0; t--) d[e][t] = n[o + e].text === r[o + t].text ? d[e + 1][t + 1] + 1 : Math.max(d[e + 1][t], d[e][t + 1]);
	let f = [], p = 0, m = 0, h = null, g = () => {
		h && f.push({
			from: i(o + h[0]),
			to: i(o + p),
			text: a(o + h[1], o + m)
		}), h = null;
	};
	for (; p < l || m < u;) p < l && m < u && n[o + p].text === r[o + m].text ? (g(), p++, m++) : (h ??= [p, m], m < u && (p >= l || d[p][m + 1] >= d[p + 1][m]) ? m++ : p++);
	return g(), f;
}
var ca = (e, t) => {
	let n = 0;
	for (; n < e.length && n < t.length && e[n] === t[n];) n++;
	let r = 0;
	for (; r < e.length - n && r < t.length - n && e[e.length - 1 - r] === t[t.length - 1 - r];) r++;
	return Math.max(e.length, t.length) - n - r;
};
function la(e, t) {
	let n = gt(e);
	if (n.length !== 1) return "";
	let { start: r, ...i } = n[0], a = [];
	for (let n of Bt(i, t)) {
		let t = n.kind === "text" && !n.code ? [
			"text",
			n.bold,
			n.italic,
			n.strike,
			n.highlight,
			n.href
		] : [n.kind, e.slice(n.from, n.to)];
		(t[0] !== "text" || JSON.stringify(a[a.length - 1]) !== JSON.stringify(t)) && a.push(t);
	}
	return JSON.stringify([
		i.kind,
		i.prefix,
		i.level,
		i.checked,
		i.number,
		i.callout,
		i.icon,
		i.color,
		i.folded,
		a
	]);
}
var ua = (e, t) => `${e}\u0000${t}`;
function da(e, t, n = {}) {
	let { source: r } = e, [, i, , a] = /^(\s*)([^]*?)(\s*)$/.exec(r), o = i + t.trim() + a, s = aa(e, n.atoms);
	if (o === r || !t.trim() || !s.length) return {
		edits: [],
		partial: !1
	};
	let c = sa(r, o).filter((e) => s.some(([t, n]) => e.from >= t && e.to <= n)), l = s.reduce((e, [t, n]) => e + n - t, 0);
	if (c.reduce((e, t) => e + ca(r.slice(t.from, t.to), t.text), 0) > Math.max(12, l / 2)) return {
		edits: [],
		partial: !1
	};
	let u = la(r, n.atoms), d = [], f = !1, p = r, m = 0;
	for (let e of c) {
		let t = r.slice(e.from, e.to);
		if (/\n/.test(t + e.text) || n.rejected?.has(ua(t, e.text))) continue;
		let i = n.protect;
		if (i && e.from <= i[1] && e.to >= i[0]) {
			f = !0;
			continue;
		}
		let a = p.slice(0, e.from + m) + e.text + p.slice(e.to + m);
		la(a, n.atoms) === u && (d.push(e), p = a, m += e.text.length - t.length);
	}
	return {
		edits: d,
		partial: f
	};
}
function fa(e, t) {
	let n = e;
	for (let e = t.length - 1; e >= 0; e--) n = n.slice(0, t[e].from) + t[e].text + n.slice(t[e].to);
	return n;
}
function pa(e, t) {
	let n = fa(e, t), r = [], i = 0;
	for (let e of t) {
		let t = e.from + i;
		i += e.text.length - (e.to - e.from);
		let [a, o] = ha(n, t, t + e.text.length);
		for (; a < o && /\s/.test(n[a]);) a++;
		for (; o > a && /\s/.test(n[o - 1]);) o--;
		if (a === o) continue;
		let s = r[r.length - 1];
		s && a <= s[1] ? s[1] = Math.max(s[1], o) : r.push([a, o]);
	}
	return r;
}
function ma(e, t) {
	let n = 0;
	for (let r of t) {
		if (e <= r.from) break;
		if (e < r.to) return r.from + n + Math.min(e - r.from, r.text.length);
		n += r.text.length - (r.to - r.from);
	}
	return e + n;
}
function ha(e, t, n = t) {
	for (; t > 0 && ta.test(e[t - 1]);) t--;
	for (; n < e.length && ta.test(e[n]);) n++;
	return [t, n];
}
function ga(e, t, n = !0) {
	let r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), s = [], c = /* @__PURE__ */ new Set(), l, u = !1, d = (e, t) => {
		o.delete(e), o.set(e, t), o.size > 200 && o.delete(o.keys().next().value);
	}, f = (t, a) => {
		let o = e.blocks().indexOf(t);
		if (!n || o < 0 || e.busy()) return;
		let l = e.selection(), u = null;
		if (l) {
			let [e, n] = l.anchor.block < l.focus.block || l.anchor.block === l.focus.block && l.anchor.offset <= l.focus.offset ? [l.anchor, l.focus] : [l.focus, l.anchor];
			e.block <= o && n.block >= o && (u = ha(t.source, e.block === o ? e.offset : 0, n.block === o ? n.offset : t.source.length));
		}
		let { edits: f, partial: p } = da(t, a, {
			atoms: e.atoms,
			protect: u,
			rejected: c
		});
		r.delete(t), i.delete(t);
		let m = t;
		f.length && (e.apply(o, fa(t.source, f), (e) => ma(e, f), pa(t.source, f)), m = e.blocks()[o], p && d(m.source, a), s.push({
			value: e.value(),
			pairs: f.map((e) => ua(t.source.slice(e.from, e.to), e.text))
		}), s.length > 50 && s.shift()), p && (r.add(m), i.add(m));
	}, p = (n, i) => {
		let s = new AbortController();
		a.set(n, s);
		let c = o.get(n.source), l;
		if (c !== void 0) l = Promise.resolve(c);
		else {
			let r = e.blocks(), a = r.slice(Math.max(0, i - 2), i).map((e) => e.source).join("\n\n").slice(-1e3), o = r.slice(i + 1, i + 2).map((e) => e.source).join("\n\n").slice(0, 500);
			try {
				l = Promise.resolve(t(n.source, {
					kind: n.kind,
					before: a,
					after: o,
					signal: s.signal
				}));
			} catch (e) {
				l = Promise.reject(e);
			}
		}
		l.then((e) => {
			a.get(n) === s && (a.delete(n), !(s.signal.aborted || typeof e != "string") && (d(n.source, e), f(n, e)));
		}, () => {
			a.get(n) === s && (a.delete(n), r.delete(n));
		});
	}, m = () => {
		if (!n || e.busy()) return;
		let t = e.blocks(), s = e.selection(), c = s ? Math.min(s.anchor.block, s.focus.block) : -1, l = s ? Math.max(s.anchor.block, s.focus.block) : -2;
		for (let e of r) {
			let n = t.indexOf(e);
			n < 0 ? (r.delete(e), i.delete(e)) : a.has(e) || n >= c && n <= l && (!u || i.has(e) && !o.has(e.source)) || p(e, n);
		}
	}, h = () => {
		clearTimeout(l);
		for (let e of a.values()) e.abort();
		a.clear(), r.clear(), i.clear(), u = !1;
	};
	return {
		get enabled() {
			return n;
		},
		set enabled(e) {
			n = e, e || h();
		},
		written(t, o) {
			if (!n) return;
			let s = e.blocks(), c = new Set(t), d = new Set(s), f = !1;
			for (let e of t) d.has(e) || (f ||= r.has(e), r.delete(e), i.delete(e), a.get(e)?.abort(), a.delete(e));
			if (o || f) for (let e of s) !c.has(e) && ia(e) && r.add(e);
			u = !1, clearTimeout(l), l = setTimeout(() => {
				u = !0, m();
			}, 400), m();
		},
		moved() {
			m();
		},
		undoing() {
			let t = e.value();
			for (let e = s.length - 1; e >= 0; e--) if (s[e].value === t) {
				for (let t of s[e].pairs) c.add(t);
				s.splice(e, 1);
				break;
			}
			h();
		},
		stop: h
	};
}
//#endregion
//#region src/shimmer.ts
var _a = 60, va = 6;
function ya(e) {
	let t = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(e);
	if (t) return (.2126 * t[1] + .7152 * t[2] + .0722 * t[3]) / 255;
	let n = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(e);
	if (n) return .2126 * n[1] + .7152 * n[2] + .0722 * n[3];
	let r = /^ok(?:lch|lab)\(\s*([\d.]+)(%?)/.exec(e);
	if (r) return r[2] ? r[1] / 100 : +r[1];
	let i = /^(?:lch|lab)\(\s*([\d.]+)/.exec(e);
	return i ? i[1] / 100 : null;
}
function ba(e, t, n = e.closest("dialog") ?? e.ownerDocument.body) {
	let r = e.ownerDocument, i = r.defaultView;
	if (!i || !t.length || !e.isConnected || i.matchMedia?.("(forced-colors: active)").matches) return () => {};
	let a = i.getComputedStyle(e), o = [
		"--aa-shimmer",
		"--ds-accent-color",
		"--accent-color"
	].map((e) => a.getPropertyValue(e).trim()).find(Boolean), s = ya(a.color), c = s === null ? !!i.matchMedia?.("(prefers-color-scheme: dark)").matches : s > .5, l = [];
	if (t.forEach(([t, n], i) => {
		let a = r.createRange();
		try {
			let r = Or(e, t), i = Or(e, n);
			a.setStart(r.node, r.offset), a.setEnd(i.node, i.offset);
		} catch {
			return;
		}
		if (!(a.collapsed || typeof a.getClientRects != "function")) for (let e of Array.from(a.getClientRects())) {
			if (e.width <= 0 || e.height <= 0) continue;
			let t = r.createElement("div");
			t.className = "aa-shimmer", t.setAttribute("aria-hidden", "true"), c && (t.dataset.dark = ""), Object.assign(t.style, {
				left: `${e.left}px`,
				top: `${e.top}px`,
				width: `${e.width}px`,
				height: `${e.height}px`,
				animationDelay: `${Math.min(i, va) * _a}ms`
			}), o && t.style.setProperty("--aa-shimmer-color", o), l.push(t);
		}
	}), !l.length) return () => {};
	n.append(...l);
	let u = () => {
		clearTimeout(d), r.removeEventListener("scroll", u, !0), i.removeEventListener("resize", u);
		for (let e of l) e.remove();
	}, d = setTimeout(u, 1360);
	return r.addEventListener("scroll", u, !0), i.addEventListener("resize", u), u;
}
//#endregion
//#region src/aa.css?inline
var xa = "[data-ds-shape=square],:host([data-ds-shape=square]){--ds-corner-size:0px;--ds-corner-shape:round;--ds-button-inset:.5px}[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:4px;--ds-corner-shape:round;--ds-button-inset:2.5px}[data-ds-shape=circular],:host([data-ds-shape=circular]){--ds-corner-size:999px;--ds-corner-shape:round;--ds-button-inset:5px}@supports (corner-shape:squircle){[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:8px;--ds-corner-shape:squircle}}:root,:host,:where([data-ds-surface]){--ds-unit:calc(var(--ds-1,20px) * var(--ds-sf,1));--ds-control-height:calc(var(--ds-control-size,var(--ds-08,16px)) * var(--ds-sf,1));--ds-row-height:calc(var(--ds-row-size,var(--ds-1,20px)) * var(--ds-sf,1));--ds-type-size-default:calc(var(--ds-text-size,14px) * var(--ds-sf,1));--ds-type-size-small:calc(var(--ds-small-text-size,10px) * var(--ds-sf,1));--ds-type-size-heading:calc(var(--ds-heading-text-size,13px) * var(--ds-sf,1));--ds-type-size-display:calc(var(--ds-display-text-size,20px) * var(--ds-sf,1));--ds-type-lineheight-default:calc(var(--ds-text-leading,16px) * var(--ds-sf,1));--ds-type-letterspacing-default:calc(var(--ds-text-tracking,-.3px) * var(--ds-sf,1));--ds-radius:calc(var(--ds-corner-size,4px) * var(--ds-sf,1));--ds-radius-card:calc(var(--ds-card-corner-size,4px) * var(--ds-sf,1))}.ds-context{--ds-context-row:calc(var(--ds-row-height) - 1px);--ds-context-fill:light-dark(var(--ds-black,#2a2a2a),var(--ds-slate,#1e1e1e));--ds-context-ink:var(--ds-white,#fff);--ds-context-hover:color-mix(in srgb, var(--ds-context-fill) 78%, var(--ds-context-ink));--ds-context-danger:var(--ds-tuned-red,#ff5f5f);--ds-context-refused:var(--ds-tuned-red,#ff5f5f);box-sizing:border-box;width:var(--ds-menu-width,max-content);min-width:calc(4 * var(--ds-unit));max-height:var(--ds-menu-max-height,calc(16 * var(--ds-unit)));box-shadow:none;clip-path:inset(0 round var(--ds-context-radius,var(--ds-radius,4px)));color:var(--ds-context-ink);font-family:\"Inter Arrows\", var(--ds-typeface-regular);font-feature-settings:var(--ds-font-features);font-size:var(--ds-type-size-default);font-weight:var(--ds-type-weight-default);line-height:var(--ds-type-lineheight-default);letter-spacing:var(--ds-type-letterspacing-default);background:0 0;border:0;flex-direction:column;gap:1px;margin:0;padding:0;list-style:none;display:flex;overflow-y:auto}.ds-context>[role=group]{display:contents}.ds-context :is(.ds-context__item,:is(.ds-context,.ds-context>[role=group])>:is(button,a,li,[role^=menuitem]):not(.ds-context__label,.ds-context__separator,[role=separator])){gap:calc(4px * var(--ds-sf,1));width:100%;font:inherit;letter-spacing:inherit;text-align:start;white-space:nowrap;cursor:pointer;appearance:none;-webkit-tap-highlight-color:transparent;outline:none;text-decoration:none;box-sizing:border-box!important;height:var(--ds-context-row)!important;min-height:var(--ds-context-row)!important;max-height:var(--ds-context-row)!important;padding:0 calc(4px * var(--ds-sf,1))!important;background:var(--ds-context-fill)!important;color:var(--ds-context-ink)!important;line-height:var(--ds-type-lineheight-default)!important;border:0!important;border-radius:0!important;flex:none!important;justify-content:space-between!important;align-items:flex-end!important;margin:0!important;display:flex!important}.ds-context :is(.ds-context__item,:is(.ds-context,.ds-context>[role=group])>:is(button,a,li,[role^=menuitem])):is(:hover,:focus-visible,[data-highlighted]):not(:disabled,[aria-disabled=true],[data-disabled]){background:var(--ds-context-hover)!important}.ds-context :is(.ds-context__item,:is(.ds-context,.ds-context>[role=group])>:is(button,a,li,[role^=menuitem])):focus-visible{box-shadow:inset 0 0 0 2px var(--ds-focus-ring,#594dff)}.ds-context :is(.ds-context__item,:is(.ds-context,.ds-context>[role=group])>:is(button,a,li,[role^=menuitem])):is(:disabled,[aria-disabled=true],[data-disabled]){cursor:default;opacity:.5}.ds-context[aria-busy=true]>*{cursor:wait!important}.ds-context :is(.ds-context__item,:is(.ds-context,.ds-context>[role=group])>:is(button,a,li,[role^=menuitem])):is(.ds-context__item--danger,[data-danger],[data-variant=destructive]){color:var(--ds-context-danger)!important}.ds-context :is(.ds-context__item,:is(.ds-context,.ds-context>[role=group])>:is(button,a,li,[role^=menuitem]))[data-ds-refused]{background:var(--ds-context-refused)!important}.ds-context>:is(hr,.ds-context__separator,[role=separator]){background:0 0!important;border:0!important;flex:0 0 0!important;height:0!important;margin:0!important;padding:0!important}.ds-context>:is(hr,.ds-context__separator,[role=separator]):is(:first-child,:last-child),.ds-context>:is(hr,.ds-context__separator,[role=separator])+:is(hr,.ds-context__separator,[role=separator]){display:none!important}.ds-context :is(.ds-context__label,[data-ds-menu-label]){box-sizing:border-box;height:var(--ds-context-row);padding:calc(var(--ds-context-row) - var(--ds-type-lineheight-default)) calc(4px * var(--ds-sf,1)) 0;background:var(--ds-context-fill);color:color-mix(in srgb, var(--ds-context-ink) 60%, var(--ds-context-fill));line-height:var(--ds-type-lineheight-default);white-space:nowrap}.ds-context__shortcut{color:color-mix(in srgb, var(--ds-context-ink) 60%, var(--ds-context-fill));margin-left:auto}.ds-context.ds-context--bar{width:var(--ds-menu-width,max-content);min-width:0;height:var(--ds-context-row);scrollbar-width:none;flex-direction:row;max-height:none;overflow:auto hidden}.ds-context.ds-context--bar :is(.ds-context__item,:is(.ds-context,.ds-context>[role=group])>:is(button,a,li,[role^=menuitem])){width:auto;min-width:var(--ds-context-row)}.ds-context.ds-context--bar :is(.ds-context__item,:is(.ds-context,.ds-context>[role=group])>:is(button,a,li,[role^=menuitem])):is(.ds-context__item--icon,[data-ds-context-icon]){width:var(--ds-context-row);justify-content:center!important;align-items:center!important;padding:0!important}.ds-context.ds-context--bar>:is(hr,.ds-context__separator,[role=separator]){width:0!important;height:auto!important}:is(ds-overlay>dialog[data-ds-edge=bottom],dialog.ds-overlay.ds-overlay--sheet),:is(ds-overlay>dialog[data-ds-edge=end],dialog.ds-overlay.ds-overlay--drawer:not(.ds-overlay--start)),:is(ds-overlay>dialog[data-ds-edge=start],dialog.ds-overlay.ds-overlay--drawer.ds-overlay--start){--ds-overlay-gap:var(--ds-unit);--ds-overlay-inner:var(--ds-overlay-padding,var(--ds-unit));--ds-overlay-within:max(0px, var(--ds-overlay-inner) - var(--ds-overlay-line,1px));--ds-overlay-motion:var(--ds-overlay-enter,.38s);--ds-overlay-curve:var(--ds-overlay-easing,cubic-bezier(.32, .72, 0, 1));gap:var(--ds-overlay-gap);transform:var(--ds-overlay-held);transition:transform var(--ds-overlay-motion) var(--ds-overlay-curve), opacity var(--ds-overlay-motion) var(--ds-overlay-curve), overlay var(--ds-overlay-motion) allow-discrete, display var(--ds-overlay-motion) allow-discrete;margin:0}:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer))[data-ds-overlay-flush]{--ds-overlay-inner:0px;--ds-overlay-gap:0px}:is(ds-overlay>dialog[data-ds-edge=bottom],dialog.ds-overlay.ds-overlay--sheet){--ds-overlay-held:translateY(var(--ds-overlay-drag,0px));--ds-overlay-away:translateY(100%);inset:auto 0 var(--ds-overlay-viewport-bottom,0px);width:var(--ds-overlay-width,100%);max-width:min(100%, var(--ds-overlay-sheet-width,calc(32 * var(--ds-unit))));height:var(--ds-overlay-height,fit-content);max-height:calc(var(--ds-overlay-viewport-height,100dvh) - var(--ds-overlay-sheet-gap,calc(2 * var(--ds-unit))) - env(safe-area-inset-top,0px));padding:var(--ds-overlay-within) calc(var(--ds-overlay-inner) + env(safe-area-inset-right,0px)) calc(var(--ds-overlay-inner) + env(safe-area-inset-bottom,0px)) calc(var(--ds-overlay-inner) + env(safe-area-inset-left,0px));border-bottom:0;margin:0 auto}:is(ds-overlay>dialog[data-ds-edge=bottom],dialog.ds-overlay.ds-overlay--sheet):before{--ds-overlay-handle-height:calc(4px * var(--ds-sf,1));content:\"\";display:var(--ds-overlay-handle,block);z-index:1;top:calc((var(--ds-unit) - var(--ds-overlay-handle-height)) / 2 - var(--ds-overlay-line,1px) - var(--ds-overlay-within));width:calc(2 * var(--ds-unit));height:var(--ds-overlay-handle-height);margin-top:calc(var(--ds-overlay-inner) * -1 + (var(--ds-unit) - var(--ds-overlay-handle-height)) / 2);margin-bottom:calc(var(--ds-overlay-inner) - var(--ds-overlay-gap) - var(--ds-overlay-handle-height) - (var(--ds-unit) - var(--ds-overlay-handle-height)) / 2);border-radius:calc(var(--ds-overlay-handle-height) / 2);background:var(--ds-overlay-handle-color,var(--ds-border-color));pointer-events:none;flex:none;align-self:center;position:sticky}:is(ds-overlay>dialog[data-ds-edge=end],dialog.ds-overlay.ds-overlay--drawer:not(.ds-overlay--start)),:is(ds-overlay>dialog[data-ds-edge=start],dialog.ds-overlay.ds-overlay--drawer.ds-overlay--start){--ds-overlay-held:translateX(var(--ds-overlay-drag,0px));width:calc(var(--ds-overlay-width,calc(16 * var(--ds-unit))) + var(--ds-overlay-safe-side,0px));max-width:calc(100vw - 2 * var(--ds-unit));border-top:0;border-bottom:0;height:100dvh;max-height:none}:is(ds-overlay>dialog[data-ds-edge=end],dialog.ds-overlay.ds-overlay--drawer:not(.ds-overlay--start)):not(:dir(rtl)),:is(ds-overlay>dialog[data-ds-edge=start],dialog.ds-overlay.ds-overlay--drawer.ds-overlay--start):dir(rtl){--ds-overlay-away:translateX(100%);--ds-overlay-safe-side:env(safe-area-inset-right,0px);padding:calc(var(--ds-overlay-inner) + env(safe-area-inset-top,0px)) calc(var(--ds-overlay-inner) + env(safe-area-inset-right,0px)) calc(var(--ds-overlay-inner) + env(safe-area-inset-bottom,0px)) var(--ds-overlay-within);border-right:0;inset:0 0 0 auto}:is(ds-overlay>dialog[data-ds-edge=start],dialog.ds-overlay.ds-overlay--drawer.ds-overlay--start):not(:dir(rtl)),:is(ds-overlay>dialog[data-ds-edge=end],dialog.ds-overlay.ds-overlay--drawer:not(.ds-overlay--start)):dir(rtl){--ds-overlay-away:translateX(-100%);--ds-overlay-safe-side:env(safe-area-inset-left,0px);padding:calc(var(--ds-overlay-inner) + env(safe-area-inset-top,0px)) var(--ds-overlay-within) calc(var(--ds-overlay-inner) + env(safe-area-inset-bottom,0px)) calc(var(--ds-overlay-inner) + env(safe-area-inset-left,0px));border-left:0;inset:0 auto 0 0}:root:has(dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer):modal){overscroll-behavior:none;overflow:hidden}:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer)):not([open]){--ds-overlay-motion:var(--ds-overlay-exit,.26s);transform:var(--ds-overlay-away)}@starting-style{:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer))[open]{transform:var(--ds-overlay-away)}}:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer))::backdrop{opacity:calc(1 - var(--ds-overlay-progress,0));transition:opacity var(--ds-overlay-motion,.38s) ease, overlay var(--ds-overlay-motion,.38s) allow-discrete, display var(--ds-overlay-motion,.38s) allow-discrete}:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer)):not([open])::backdrop{opacity:0}@starting-style{:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer))[open]::backdrop{opacity:0}}:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer))[data-ds-overlay-dragging],:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer))[data-ds-overlay-dragging]::backdrop{transition:none}@media (prefers-reduced-motion:reduce){:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer)){--ds-overlay-motion:.15s;transition:opacity var(--ds-overlay-motion) ease, overlay var(--ds-overlay-motion) allow-discrete, display var(--ds-overlay-motion) allow-discrete}:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer)):not([open]){--ds-overlay-motion:.15s;transform:var(--ds-overlay-held);opacity:0}@starting-style{:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer))[open]{transform:var(--ds-overlay-held);opacity:0}}}:is(ds-overlay>dialog[data-ds-type=screen],dialog.ds-overlay.ds-overlay--screen){--ds-overlay-width:100vw;width:100vw;max-width:none;height:100dvh;max-height:none;padding:var(--ds-unit);background:var(--ds-overlay-paper,var(--background,Canvas));border:0;gap:0;margin:0;overflow-y:auto}:is(ds-overlay>dialog[data-ds-type=screen],dialog.ds-overlay.ds-overlay--screen)[open]{align-items:stretch;gap:var(--ds-unit);flex-direction:column;display:flex}:is(ds-overlay>dialog[data-ds-type=screen],dialog.ds-overlay.ds-overlay--screen)[data-ds-overlay-flush]{gap:0;padding:0}:is(ds-overlay>dialog[data-ds-type=screen],dialog.ds-overlay.ds-overlay--screen)::backdrop{background:0 0}@media (prefers-reduced-motion:no-preference){:is(ds-overlay>dialog[data-ds-type=screen],dialog.ds-overlay.ds-overlay--screen)[open]{transition:opacity .16s ease-out,transform .16s ease-out}@starting-style{:is(ds-overlay>dialog[data-ds-type=screen],dialog.ds-overlay.ds-overlay--screen)[open]{opacity:0;transform:translateY(calc(var(--ds-unit) / -2))}}}.ds-overlay__bar{min-height:var(--ds-row-height);justify-content:flex-end;align-items:center;display:flex}.ds-overlay__bar>.ds-overlay__close{margin-inline-end:calc((var(--ds-unit) - var(--ds-control-height)) / 2)}.ds-overlay__toggle:not([aria-expanded=true])>:nth-child(2),.ds-overlay__toggle[aria-expanded=true]>:first-child:not(:only-child),.ds-overlay__close>:first-child:not(:only-child){display:none}@font-face{font-family:Inter Arrows;src:url(data:font/woff2;base64,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)format(\"woff2\");unicode-range:U+2190-21FF,U+27F?,U+2900-297F,U+2B??;font-weight:100 900;font-style:normal;font-display:swap}@font-face{font-family:Aa Mono;src:url(data:font/woff2;base64,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)format(\"woff2\");font-weight:400;font-style:normal;font-display:swap}:root{--aa-sheet:1}:where(.aa,aa-editor){--aa-sf:var(--ds-sf,var(--sf,1));--aa-unit:var(--ds-unit,var(--1,calc(20px * var(--sf,1))));--aa-rule-color:var(--aa-rule,var(--ds-border-color,light-dark(#d8d8d8,#3d3d3d)));font-family:\"Inter Arrows\", var(--aa-typeface,var(--ds-typeface-regular,var(--typeface-regular,system-ui))), system-ui, sans-serif;font-feature-settings:var(--aa-font-features,var(--ds-font-features,normal));font-size:var(--aa-size,var(--ds-type-size-default,calc(14px * var(--aa-sf))));line-height:var(--aa-line,var(--aa-unit));font-weight:var(--aa-weight,var(--ds-type-weight-default,400));letter-spacing:var(--aa-letterspacing,var(--ds-type-letterspacing-default,calc(-.3px * var(--aa-sf))));color:var(--aa-color,var(--ds-text-color,currentColor));-webkit-font-smoothing:antialiased;touch-action:manipulation;-webkit-tap-highlight-color:transparent;display:block}.aa-block{white-space:pre-wrap;overflow-wrap:anywhere;-webkit-user-modify:read-write-plaintext-only;outline:none;min-height:1lh;margin:0;position:relative}.aa-block+.aa-block{margin-top:var(--aa-gap,var(--aa-unit))}:where(.aa-block:not([data-kind=heading]))+.aa-block[data-kind=heading]{margin-top:var(--aa-heading-gap,calc(2 * var(--aa-gap,var(--aa-unit))))}.aa-block[data-selected],.aa-block[data-lifted]{background:var(--aa-selection,var(--aa-text-selection,color-mix(in srgb, currentColor 15%, transparent)));border-radius:calc(2px * var(--aa-sf))}.aa[data-movable]>.aa-block[data-selected],.aa[data-movable]>.aa-block[data-grab]{cursor:grab}.aa[data-dragging],.aa[data-dragging] *,.aa[data-dragging] :before{cursor:grabbing;-webkit-user-select:none;user-select:none}.aa-block[data-ghost]{opacity:.4}.aa-block[data-aa-selection]{isolation:isolate}.aa-block[data-aa-selection]:after{content:\"\";inset:var(--aa-selection-box);width:var(--aa-selection-width);height:var(--aa-selection-height);pointer-events:none;z-index:-1;background:var(--aa-text-selection,color-mix(in srgb, currentColor 15%, transparent));mask:var(--aa-selection-mask) 0 0 / 100% 100% no-repeat;position:absolute}.aa-block[data-aa-selection]::selection,.aa-block[data-aa-selection] ::selection{color:inherit;background:0 0}.aa-block[data-selected][data-aa-selection]:after,.aa-block[data-lifted][data-aa-selection]:after{display:none}@media (forced-colors:active){.aa-block[data-aa-selection]:after{display:none}.aa-block[data-aa-selection]::selection,.aa-block[data-aa-selection] ::selection{color:highlighttext;background:highlight}}.aa-block[data-kind=bullet]+.aa-block[data-kind=bullet]{margin-top:0}.aa-syntax{display:none}.aa[data-aa-across]{outline:none}.aa-b{font-family:\"Inter Arrows\", var(--aa-typeface-bold,var(--ds-typeface-medium,var(--typeface-medium,var(--aa-typeface,var(--typeface-regular,system-ui))))), system-ui, sans-serif;font-weight:var(--aa-weight-bold,var(--ds-type-weight-bold,500))}.aa-i{font-style:italic}.aa-s{text-decoration:line-through}.aa-u{text-underline-offset:.15em;text-decoration-line:underline}.aa-s.aa-u{text-decoration-line:underline line-through}[data-color=gray]{color:var(--aa-color-gray,var(--ds-darker-grey,#797979))}[data-color=red]{color:var(--aa-color-red,var(--ds-danger-color,light-dark(#de0331,#ff5f5f)))}[data-color=orange]{color:var(--aa-color-orange,var(--ds-warning-color,light-dark(#4c3f1a,#fec20d)))}[data-color=green]{color:var(--aa-color-green,light-dark(#026d5b,#99ff73))}[data-color=blue]{color:var(--aa-color-blue,light-dark(#0275fa,#69d8fb))}[data-color=purple]{color:var(--aa-color-purple,light-dark(#e63aaf,#f5aad1))}.aa-c,.aa-block[data-kind=code]{font-family:\"Inter Arrows\", var(--aa-typeface-mono,var(--typeface-mono,\"Aa Mono\")), \"Aa Mono\", ui-monospace, \"SF Mono\", Menlo, monospace;font-size:var(--aa-code-size,calc(var(--ds-code-text-size,13px) * var(--aa-sf)));font-variant-ligatures:none;letter-spacing:0}.aa-c{padding:0 calc(4px * var(--aa-sf));border-radius:var(--ds-radius,calc(4px * var(--aa-sf)));background:var(--aa-code-fill,var(--ds-fill,light-dark(#e6e6e6,#3c3c3c)))}a.aa-link{color:var(--aa-link,currentColor);text-underline-offset:calc(3px * var(--aa-sf));cursor:text;text-decoration-line:underline;text-decoration-thickness:1px}.aa-block[data-kind=heading]{font-family:\"Inter Arrows\", var(--aa-typeface-heading,var(--ds-typeface-medium,var(--typeface-medium,var(--aa-typeface,var(--typeface-regular,system-ui))))), system-ui, sans-serif;font-weight:var(--aa-weight-heading,var(--ds-type-weight-bold,500))}.aa-block[data-kind=heading][data-level=\"1\"]{font-size:var(--aa-h1,var(--ds-type-size-display,calc(20px * var(--aa-sf))));line-height:calc(2 * var(--aa-unit));letter-spacing:calc(var(--ds-display-text-tracking,-.4px) * var(--aa-sf))}.aa-block[data-kind=heading][data-level=\"2\"]{font-size:var(--aa-h2,calc(var(--ds-prose-h2-size,17px) * var(--aa-sf)));letter-spacing:calc(var(--ds-prose-h2-tracking,-.34px) * var(--aa-sf))}.aa-block[data-kind=heading][data-level=\"3\"]{font-size:var(--aa-h3,calc(var(--ds-prose-h3-size,15px) * var(--aa-sf)))}.aa-block[data-kind=quote]{padding-left:var(--aa-unit);box-shadow:inset 1px 0 var(--aa-quote-rule,var(--ds-text-color-muted,light-dark(#5f5f5f,#cacaca)))}.aa-block[data-kind=code]{padding:var(--aa-unit);border-radius:var(--ds-radius,calc(4px * var(--aa-sf)));box-shadow:inset 0 0 0 1px var(--aa-rule-color);background:var(--aa-code-paper,transparent)}.aa-block[data-kind=bullet]{padding-left:var(--aa-indent,var(--aa-unit))}.aa-block[data-kind=bullet]:before{content:\"\";width:var(--aa-indent,var(--aa-unit));height:1lh;color:var(--aa-marker,currentColor);pointer-events:none;justify-content:center;align-items:center;display:flex;position:absolute;top:0;left:0}.aa-block[data-kind=bullet]:not([data-checked]):before{content:\"•\"}.aa-block[data-kind=bullet][data-checked]:before{content:\"\";width:calc(16px * var(--aa-sf));height:calc(16px * var(--aa-sf));margin-top:calc((var(--aa-unit) - 16px * var(--aa-sf)) / 2);box-sizing:border-box;border:1px solid var(--aa-rule-color);border-radius:var(--ds-radius,calc(4px * var(--aa-sf)));background:var(--ds-input-background,light-dark(#e8e8e8,#303030));pointer-events:auto;cursor:pointer}.aa-block[data-kind=bullet][data-checked=true]:before{background:var(--ds-accent-color,var(--accent-color,#99ff73)) url(data:image/svg+xml,%3Csvg%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6.68649%2011.884L12.443%206.13601L11.736%205.42715L6.68835%2010.4827L4.26399%208.0501L3.55696%208.74525L6.68649%2011.884Z%22%20fill%3D%22%232a2a2a%22%2F%3E%3C%2Fsvg%3E) center / 100% no-repeat;border-color:#0000}.aa-block[data-kind=bullet][data-checked=true]{color:var(--aa-done,var(--ds-text-color-muted,color-mix(in srgb, currentColor 55%, transparent)))}.aa-block+.aa-block[data-kind=divider]{margin-top:0}.aa-block[data-kind=divider]{min-height:1lh}.aa-block[data-kind=divider]:before{content:\"\";background:var(--aa-rule-color);height:1px;position:absolute;top:100%;left:0;right:0}.aa-block[data-placeholder]:before{content:attr(data-placeholder)}.aa-block[data-kind=heading][data-empty]:before{content:var(--aa-heading-word,\"Heading\") \" \" attr(data-level)}.aa-block[data-hint]:after{content:attr(data-hint);color:var(--aa-placeholder,var(--ds-input-placeholder-color,light-dark(#797979,#ababab)));pointer-events:none}.aa-block[data-kind=bullet][data-hint]:has(>br[data-filler]):after{inset-inline-start:var(--aa-indent,var(--aa-unit));inset-inline-end:0;position:absolute;top:0}.aa-block[data-placeholder]:before,.aa-block[data-kind=heading][data-empty]:before{color:var(--aa-placeholder,var(--ds-input-placeholder-color,light-dark(#797979,#ababab)));pointer-events:none;white-space:nowrap;position:absolute;top:0;left:0}.aa-atom{-webkit-user-modify:read-only;cursor:default}.aa-atom[data-atom=image]{vertical-align:top;max-width:100%;display:inline-block;position:relative}.aa-atom[data-atom=image] img{border-radius:var(--aa-picture-radius,var(--ds-radius,calc(4px * var(--aa-sf))));max-width:100%;height:auto;display:block}.aa-atom[data-atom=image]:not([data-width]){max-width:min(100%, calc(var(--aa-picture-default,16) * var(--aa-unit)))}.aa-atom[data-atom=image][data-width]{width:calc(var(--aa-picture-width) * var(--aa-unit))}.aa-atom[data-atom=image][data-settling]{transition:width .14s cubic-bezier(.2,1,.1,1)}@media (prefers-reduced-motion:reduce){.aa-atom[data-atom=image][data-settling]{transition:none}}.aa-atom[data-atom=image][data-width] img{width:100%}.aa-picture-grip{top:50%;width:calc(4px * var(--aa-sf));height:min(40%, calc(2 * var(--aa-unit)));border-radius:calc(2px * var(--aa-sf));cursor:ew-resize;opacity:0;touch-action:none;background:#0000008c;transition:opacity .12s ease-out;position:absolute;inset-inline-end:calc(6px * var(--aa-sf));transform:translateY(-50%);box-shadow:0 0 0 1px #fffc}.aa-atom[data-atom=image]:hover .aa-picture-grip,.aa-atom[data-atom=image][data-sizing] .aa-picture-grip{opacity:1}.aa-block[data-readonly=true] .aa-picture-grip{display:none}@media (hover:none){.aa-picture-grip{display:none}}@media (prefers-reduced-motion:reduce){.aa-picture-grip{transition:none}}.aa-controls{--aa-sf:var(--ds-sf,var(--sf,1));--aa-square:var(--ds-unit,var(--1,calc(20px * var(--sf,1))));--aa-menu-fill:light-dark(var(--ds-black,#2a2a2a),var(--ds-slate,#1e1e1e));--aa-menu-ink:var(--ds-white,#fff);--aa-menu-hover:color-mix(in srgb, var(--aa-menu-fill) 78%, var(--aa-menu-ink));z-index:var(--aa-controls-layer,1000);-webkit-tap-highlight-color:transparent;font:var(--ds-type-weight-default,400) var(--ds-type-size-default,calc(14px * var(--aa-sf)))/var(--aa-square) \"Inter Arrows\", var(--ds-typeface-regular,var(--typeface-regular,system-ui)), system-ui, sans-serif;font-feature-settings:var(--ds-font-features,normal);letter-spacing:var(--ds-type-letterspacing-default,calc(-.3px * var(--aa-sf)));position:fixed}.aa-controls[hidden],.aa-drop-line[hidden]{display:none}.aa-controls button{box-sizing:border-box;height:var(--aa-square);min-width:var(--aa-square);color:inherit;font:inherit;cursor:pointer;background:0 0;border:0;border-radius:0;flex-shrink:0;justify-content:center;align-items:center;margin:0;padding:0;display:inline-flex}.aa-controls button[data-current]{background:var(--ds-accent-color,var(--accent-color,var(--apple-green,Highlight)))}@media (hover:hover){.aa-controls button:hover{background:var(--ds-accent-color,var(--accent-color,var(--apple-green,Highlight)))}}.aa-controls button:focus-visible{outline:2px solid var(--ds-focus-ring,currentColor);outline-offset:-2px}.aa-icon{width:calc(16px * var(--aa-sf,var(--sf,1)));height:calc(16px * var(--aa-sf,var(--sf,1)));background:currentColor;flex-shrink:0;display:inline-block;mask-position:50%;mask-size:contain;mask-repeat:no-repeat}.aa-toolbar{max-width:100vw}.aa-toolbar.aa-controls:not([data-docked]){width:calc(5 * var(--aa-square) - 1px);flex-wrap:wrap;height:auto;max-height:none}.aa-toolbar.aa-controls:has(.aa-toolbar-ask){flex-wrap:wrap;height:auto;max-height:none}.aa-toolbar-ask{contain:inline-size;box-sizing:border-box;height:var(--ds-context-row,calc(var(--aa-square) - 1px));background:var(--aa-menu-fill);flex:1 0 100%;margin:0;display:flex}.aa-toolbar-ask textarea{box-sizing:border-box;width:100%;min-width:0;height:100%;padding:calc(3px * var(--aa-sf)) calc(4px * var(--aa-sf)) 0;color:var(--aa-menu-ink);font:inherit;line-height:calc(16px * var(--aa-sf));letter-spacing:inherit;resize:none;background:0 0;border:0;border-radius:0;outline:none}.aa-toolbar-ask textarea::placeholder{color:color-mix(in srgb, var(--aa-menu-ink) 60%, var(--aa-menu-fill))}.aa-toolbar-ask textarea:focus-visible{box-shadow:inset 0 0 0 2px var(--ds-focus-ring,#594dff)}.aa-toolbar.aa-controls:has(.aa-toolbar-ask){overflow:hidden}.aa-toolbar-ask:before,.aa-toolbar-ask textarea{width:100%;height:100%;transform:translateY(calc(100% - var(--ds-context-row,calc(var(--aa-square) - 1px))));transition:transform .18s cubic-bezier(.23,1,.32,1);position:absolute;inset:0}.aa-toolbar-ask:before{content:\"\";z-index:1;background:var(--aa-menu-fill);pointer-events:none}.aa-toolbar-ask textarea{z-index:2}.aa-toolbar-ask:first-child:before{transform:translateY(calc(-100% + var(--ds-context-row,calc(var(--aa-square) - 1px))))}.aa-toolbar-ask:first-child textarea{height:var(--ds-context-row,calc(var(--aa-square) - 1px));transform:none}.aa-toolbar[data-asking] .aa-toolbar-ask:first-child textarea{height:100%}.aa-toolbar[data-asking] .aa-toolbar-ask:before,.aa-toolbar[data-asking] .aa-toolbar-ask textarea{transform:translateY(0)}.aa-toolbar[data-asking] .aa-toolbar-ask textarea{padding-top:calc(3px * var(--aa-sf));line-height:var(--aa-square)}@media (prefers-reduced-motion:reduce){.aa-toolbar-ask:before,.aa-toolbar-ask textarea{transition:none}}.aa-controls[data-docked]{--aa-safe-bottom:env(safe-area-inset-bottom,0px);max-width:none}.ds-context.ds-context--bar.aa-toolbar[data-docked]{grid-template-columns:repeat(6,minmax(0,1fr));height:auto;max-height:none;display:grid;overflow:hidden}.ds-context.ds-context--bar.aa-toolbar.aa-controls[data-docked]>button.note-menu-row.ds-context__item--icon{width:auto;min-width:0}.aa-toolbar[data-docked]>.aa-toolbar-ask{grid-column:1/-1}.aa-find[data-docked]{border-width:1px 0 0}.aa-menu{width:calc(4 * var(--aa-square));border-radius:var(--aa-menu-radius,var(--ds-radius,calc(4px * var(--aa-sf))));max-width:100vw;clip-path:inset(0 round var(--aa-menu-radius,var(--ds-radius,calc(4px * var(--aa-sf)))));color:var(--aa-menu-ink);line-height:calc(16px * var(--aa-sf));background:0 0;border:0;flex-direction:column;gap:1px;display:flex;overflow:hidden}.aa-menu button{width:100%;height:calc(var(--aa-square) - 1px);text-align:start;justify-content:space-between;align-items:flex-end;gap:calc(4px * var(--aa-sf));padding:0 calc(4px * var(--aa-sf));white-space:nowrap;background:var(--aa-menu-fill);color:var(--aa-menu-ink);display:flex}.aa-menu button[data-current],.aa-menu button:focus-visible{background:var(--aa-menu-hover);color:var(--aa-menu-ink)}@media (hover:hover){.aa-menu button:hover{background:var(--aa-menu-hover);color:var(--aa-menu-ink)}}.aa-menu button:focus-visible{box-shadow:inset 0 0 0 2px var(--ds-focus-ring,currentColor);outline:0}.aa-menu-list{max-height:calc(8 * var(--aa-square));overscroll-behavior:contain;scrollbar-width:none;flex-direction:column;gap:1px;display:flex;overflow-y:auto}.aa-menu-list::-webkit-scrollbar{display:none}.aa-menu button[data-command=close] kbd{font:inherit;color:color-mix(in srgb, var(--aa-menu-ink) 60%, var(--aa-menu-fill));order:2}.aa-menu button[data-command=count]{font-size:var(--ds-type-size-small,calc(10px * var(--aa-sf)))}.aa-menu button .aa-icon{order:2}.aa-menu button>span:not(.aa-icon){flex:1;order:1;min-width:0;overflow:hidden}.aa-menu button>span:not(.aa-icon)[data-cut]{mask-image:linear-gradient(to right, black calc(100% - var(--aa-square)), transparent 100%)}.aa-menu button>span.aa-avatar{flex:none;order:0}.aa-menu-empty{height:calc(var(--aa-square) - 1px);padding:calc(3px * var(--aa-sf)) calc(4px * var(--aa-sf)) 0;box-sizing:border-box;background:var(--aa-menu-fill);display:block}dialog.aa-sheet{--aa-sf:var(--ds-sf,var(--sf,1));--aa-square:var(--ds-unit,var(--1,calc(20px * var(--sf,1))));box-sizing:border-box;width:100%;height:fit-content;max-height:calc(100dvh - 2 * var(--aa-square));padding:var(--aa-square);border:1px solid var(--ds-border-color,light-dark(#d8d8d8,#3d3d3d));box-shadow:none;background:var(--ds-overlay-paper,var(--ds-paper,var(--background,Canvas)));color:var(--ds-text-color,var(--text-color,CanvasText));overscroll-behavior:contain;font:var(--ds-type-weight-default,400) var(--ds-type-size-default,calc(14px * var(--aa-sf)))/calc(16px * var(--aa-sf)) \"Inter Arrows\", var(--ds-typeface-regular,var(--typeface-regular,system-ui)), system-ui, sans-serif;font-feature-settings:var(--ds-font-features,normal);letter-spacing:var(--ds-type-letterspacing-default,calc(-.3px * var(--aa-sf)));-webkit-tap-highlight-color:transparent;border-radius:0;margin:auto;position:fixed;inset:0;overflow:auto}dialog.aa-sheet[open]{gap:var(--aa-square);flex-direction:column;display:flex}dialog.aa-sheet:focus{outline:none}dialog.aa-sheet::backdrop{background:color-mix(in srgb, var(--ds-black,#2a2a2a) 40%, transparent)}.aa-sheet-head{height:var(--aa-square);line-height:calc(16px * var(--aa-sf));flex:none;justify-content:space-between;align-items:flex-end;display:flex}.aa-sheet-title{font:inherit;font-family:\"Inter Arrows\", var(--ds-typeface-medium,var(--typeface-medium,inherit)), system-ui, sans-serif;font-weight:var(--ds-type-weight-bold,500);margin:0}.aa-sheet-cancel{color:inherit;font:inherit;line-height:inherit;cursor:pointer;background:0 0;border:0;margin:0;padding:0}.aa-sheet-group{flex-direction:column;flex:none;display:flex}.aa-sheet-label{box-sizing:border-box;height:var(--aa-square);padding-top:calc(4px * var(--aa-sf));line-height:calc(16px * var(--aa-sf));color:var(--ds-text-color-muted,GrayText)}.aa-sheet-row{width:100%;height:var(--aa-square);border-radius:calc(2px * var(--aa-sf));color:inherit;font:inherit;line-height:calc(16px * var(--aa-sf));text-align:start;cursor:pointer;background:0 0;border:0;align-items:flex-end;margin:0;padding:0;display:flex}.aa-sheet-row:active{background:var(--ds-row-fill-press,var(--ds-fill,light-dark(#e6e6e6,#3c3c3c)))}.aa-sheet-row:focus-visible{outline:2px solid var(--ds-focus-ring,currentColor);outline-offset:-2px}.aa-sheet-row>.aa-icon{margin-right:calc(var(--aa-square) - 16px * var(--aa-sf))}.aa-sheet-words{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;overflow:hidden}.aa-sheet-key{color:var(--ds-text-color-muted,GrayText);font-family:\"Inter Arrows\", var(--aa-typeface-mono,var(--typeface-mono,\"Aa Mono\")), \"Aa Mono\", ui-monospace, monospace;font-size:calc(var(--ds-code-text-size,13px) * var(--aa-sf));letter-spacing:0}.aa-drop-line{z-index:1000;background:var(--ds-accent-color,var(--accent-color,var(--apple-green,Highlight)));pointer-events:none;height:1px;position:fixed}.aa-find{width:calc(16 * var(--aa-square));max-width:calc(100vw - 2 * var(--aa-square) - 2px);border:1px solid var(--aa-rule,var(--ds-border-color,currentColor));color:var(--ds-text-color,var(--text-color,CanvasText));background:var(--ds-paper,var(--background,Canvas));flex-wrap:wrap;display:flex}.aa-find input{box-sizing:border-box;font:inherit;color:inherit;width:50%;min-width:0;height:var(--aa-square);padding:0 calc(4px * var(--aa-sf));border:0;border-right:1px solid var(--ds-border-color,currentColor);background:0 0;border-radius:0}.aa-find span[aria-live]{padding-inline:calc(4px * var(--aa-sf));white-space:nowrap}.aa-bg{background:var(--aa-callout-fill)}.aa-menu [data-command=color-bg-yellow] .aa-icon[data-fill]{background:var(--aa-highlight,var(--ds-yellow,var(--yellow,Highlight)))}.aa-find-match,.aa-highlight{background:var(--aa-highlight,var(--ds-yellow,var(--yellow,Highlight)));color:var(--aa-highlight-ink,var(--ds-black,inherit))}.aa-block[data-kind=bullet]{margin-left:calc(var(--aa-depth,0) * var(--aa-indent,var(--aa-unit)))}.aa-block[data-kind=bullet][data-number]:before{content:attr(data-number) \".\"}.aa-block[data-kind=callout]{padding-left:var(--aa-unit);box-shadow:inset 1px 0 var(--aa-rule-color)}.aa-block[data-kind=callout]:before{content:\"\";width:var(--aa-unit);height:var(--aa-unit);mask:var(--aa-callout-icon) 50% 100% / calc(16px * var(--aa-sf)) no-repeat;cursor:pointer;background:currentColor;position:absolute;top:0;left:0}.aa-block[data-folded]:not([data-body-active]) .aa-callout-body{display:none}[data-fill=gray]{--aa-callout-fill:var(--aa-callout-fill-gray,color-mix(in srgb, var(--ds-fill,light-dark(#e6e6e6,#3c3c3c)) 50%, transparent))}[data-fill=brown]{--aa-callout-fill:var(--aa-callout-fill-brown,var(--one-sand-pastel,light-dark(#f3ecd8,#403926)))}[data-fill=orange]{--aa-callout-fill:var(--aa-callout-fill-orange,var(--one-orange-pastel,light-dark(#fff2cc,#4c3f1a)))}[data-fill=yellow]{--aa-callout-fill:var(--aa-callout-fill-yellow,var(--one-yellow-pastel,light-dark(#fbffcc,#484c1a)))}[data-fill=green]{--aa-callout-fill:var(--aa-callout-fill-green,var(--one-apple-green-pastel,light-dark(#daffcc,#284c1a)))}[data-fill=blue]{--aa-callout-fill:var(--aa-callout-fill-blue,var(--one-sharp-blue-pastel,light-dark(#ccf,#1d1a4c)))}[data-fill=purple]{--aa-callout-fill:var(--aa-callout-fill-purple,var(--one-purple-pastel,light-dark(#f9d2ed,#46203a)))}[data-fill=pink]{--aa-callout-fill:var(--aa-callout-fill-pink,var(--one-pink-pastel,light-dark(#fad1e6,#471f34)))}[data-fill=red]{--aa-callout-fill:var(--aa-callout-fill-red,var(--one-tuned-red-pastel,light-dark(#fcc,#4c1a1a)))}[data-fill=white]{--aa-callout-fill:var(--aa-callout-fill-white,transparent)}.aa-block[data-kind=callout][data-box]{--aa-callout-grey:var(--aa-callout-fill-gray,color-mix(in srgb, var(--ds-fill,light-dark(#e6e6e6,#3c3c3c)) 50%, transparent));box-sizing:border-box;padding:var(--aa-unit);border-radius:var(--ds-radius,calc(4px * var(--aa-sf)));background:var(--aa-callout-fill,var(--aa-callout-grey));box-shadow:none}.aa-block[data-kind=callout][data-box][data-fill=white]{box-shadow:inset 0 0 0 1px var(--aa-rule-color)}.aa-block[data-kind=callout][data-box][data-icon],.aa-block[data-kind=callout][data-box][data-picture]{padding-left:calc(2 * var(--aa-unit))}.aa-block[data-kind=callout][data-box]:before{content:none;left:var(--aa-unit);top:var(--aa-unit);background:0 0;mask:none}.aa-block[data-kind=callout][data-box][data-icon]:before{content:attr(data-icon);box-sizing:border-box;padding-top:calc(4px * var(--aa-sf));font-size:var(--aa-size,var(--ds-type-size-default,calc(14px * var(--aa-sf))));line-height:calc(16px * var(--aa-sf));letter-spacing:0;text-align:start;white-space:nowrap;-webkit-user-select:none;user-select:none;overflow:hidden}.aa-block[data-kind=callout][data-box][data-picture]:before{content:\"\";background:var(--aa-callout-picture) 0 100% / calc(16px * var(--aa-sf)) calc(16px * var(--aa-sf)) no-repeat}.aa-block[data-kind=callout][data-box][data-selected],.aa-block[data-kind=callout][data-box][data-lifted]{background:color-mix(in srgb, currentColor 15%, var(--aa-callout-fill,var(--aa-callout-grey)))}.aa-icon[data-fill]{border-radius:var(--ds-radius,calc(4px * var(--aa-sf)));background:var(--aa-callout-fill);mask:none}.aa-icon[data-fill=white]{box-shadow:inset 0 0 0 1px var(--aa-rule-color)}.aa-block[data-kind=table]{white-space:normal;font-variant-numeric:tabular-nums}.aa-table-row{grid-template-columns:var(--aa-table-columns,repeat(var(--aa-columns), minmax(0, 1fr)));width:max-content;min-width:100%;display:grid}.aa-block[data-kind=table]:not([style*=--aa-table-columns]) .aa-table-row{width:auto}.aa-block[data-kind=table]{scrollbar-width:none;overflow-x:auto}.aa-block[data-kind=table][data-settling] .aa-table-row{transition:grid-template-columns .14s cubic-bezier(.2,1,.1,1)}@media (prefers-reduced-motion:reduce){.aa-block[data-kind=table][data-settling] .aa-table-row{transition:none}}.aa-table-cell:has(>.ds-table-column-resize){overflow:visible}.ds-table-column-resize{z-index:3;width:var(--aa-unit);height:var(--ds-table-resize-height,var(--aa-unit));cursor:col-resize;touch-action:none;-webkit-user-select:none;user-select:none;outline:none;position:absolute;inset-block-start:0;inset-inline-end:calc(var(--aa-unit) / -2)}.ds-table-column-resize:after{content:\"\";background:var(--aa-table-rule,var(--aa-rule-color));opacity:0;pointer-events:none;width:1px;height:100%;transition:opacity .14s ease-out;position:absolute;inset-block-start:0;inset-inline-start:calc(50% - .5px)}.ds-table-column-resize:is(:focus,[data-resizing]):after{opacity:1}@media (hover:hover){.ds-table-column-resize:hover:after{opacity:1}}.aa-table-cell:last-child>.ds-table-column-resize{inset-inline-end:0}.aa-table-cell:last-child>.ds-table-column-resize:after{inset-inline:auto 0}.aa-block[data-readonly=true] .ds-table-column-resize{display:none}.aa-table-cell{box-sizing:border-box;min-width:0;min-height:var(--aa-unit);padding:0 calc(var(--aa-unit) / 2);box-shadow:inset 0 -1px var(--aa-table-rule,var(--aa-rule-color));line-height:var(--aa-unit);white-space:pre-wrap;-webkit-user-modify:read-write-plaintext-only;outline:none;position:relative}.aa-table-cell[data-align=center]{text-align:center}.aa-table-cell[data-align=end]{text-align:end}.aa-table-row:first-child{color:var(--aa-table-header,inherit);font-family:\"Inter Arrows\", var(--ds-typeface-medium,var(--typeface-medium,inherit)), system-ui, sans-serif;font-weight:var(--ds-type-weight-bold,500)}.aa-atom video,.aa-atom audio{max-width:100%;display:block}.aa-caption{font:inherit;font-size:var(--ds-type-size-small,calc(10px * var(--aa-sf)));color:var(--ds-text-color-muted,inherit);cursor:text;-webkit-user-modify:read-write-plaintext-only;outline:none;min-height:1lh;display:block}.aa-caption:empty:before{content:attr(data-placeholder);color:var(--aa-placeholder,var(--ds-input-placeholder-color,GrayText))}.aa-atom[data-atom=equation-block]{display:block}.aa-block[data-fence][data-drawn]{box-shadow:none;font-size:inherit;letter-spacing:inherit;background:0 0;border-radius:0;padding:0}.aa-block[data-fence]>.aa-atom{max-width:100%;font-family:\"Inter Arrows\", var(--aa-typeface,var(--ds-typeface-regular,var(--typeface-regular,system-ui))), system-ui, sans-serif;font-size:var(--aa-size,var(--ds-type-size-default,calc(14px * var(--aa-sf))));letter-spacing:var(--aa-letterspacing,var(--ds-type-letterspacing-default,calc(-.3px * var(--aa-sf))));display:block;overflow-x:auto}.aa-block[data-fence]>.aa-atom>*{margin-inline-start:0}.aa-peer-selection{background:color-mix(in srgb, var(--aa-accent,var(--ds-sharp-blue,Highlight)) 20%, transparent)}.aa-peer-caret{border-left:calc(1px * var(--aa-sf)) solid var(--aa-accent,var(--ds-sharp-blue,Highlight));display:inline;position:relative}.aa-peer-caret:after{content:attr(data-initial);box-sizing:border-box;width:calc(16px * var(--aa-sf,1));height:calc(16px * var(--aa-sf,1));background:var(--aa-accent,var(--ds-sharp-blue,Highlight));color:var(--ds-white,HighlightText);font:var(--ds-type-weight-default,400) var(--ds-type-size-small,calc(10px * var(--aa-sf,1))) / 1 var(--aa-typeface,var(--ds-typeface-regular,var(--typeface-regular,system-ui)));letter-spacing:normal;white-space:nowrap;pointer-events:none;-webkit-user-select:none;user-select:none;border-radius:50%;place-items:center;font-style:normal;text-decoration:none;display:grid;position:absolute;bottom:100%;left:0;transform:translate(-50%)}.aa-peer-caret:not([data-initial]):after{content:none}.aa-block[data-kind=callout][data-level]>span:not(.aa-syntax):not(.aa-callout-body){font-family:\"Inter Arrows\", var(--ds-typeface-medium,var(--typeface-medium,inherit)), system-ui, sans-serif;font-weight:var(--ds-type-weight-bold,500)}.aa-link-editor input{flex:1;width:auto}:where(.aa-plain){font:inherit;font-feature-settings:inherit;letter-spacing:inherit;color:inherit}:where(.aa-plain)>.aa-block{font:inherit;letter-spacing:inherit}.aa-plain[data-empty]>.aa-block[data-placeholder]:before{content:attr(data-placeholder);color:var(--ds-text-color-muted,#8a8a8a);pointer-events:none}.aa-plain[data-listening]>.aa-block{caret-color:#0000}.aa-plain[data-listening]>.aa-block[data-placeholder]:before{color:var(--aa-prompt,light-dark(#594dff,#b7b0ff));margin-inline-end:.25em}.aa-shimmer{z-index:1000;pointer-events:none;mix-blend-mode:screen;opacity:0;animation:.9s ease-out both aa-shimmer-show;position:fixed;overflow:hidden}.aa-shimmer[data-dark]{mix-blend-mode:multiply}.aa-shimmer:after{content:\"\";background:linear-gradient(90deg, transparent, var(--aa-shimmer-color,var(--ds-accent-color,var(--accent-color,var(--apple-green,Highlight)))) 50%, transparent);animation:.9s cubic-bezier(.4,0,.2,1) both aa-shimmer-pass;animation-delay:inherit;position:absolute;inset:0;transform:translate(-100%)}@keyframes aa-shimmer-pass{to{transform:translate(100%)}}@keyframes aa-shimmer-show{0%{opacity:0}15%,70%{opacity:1}to{opacity:0}}@media (prefers-reduced-motion:reduce){.aa-shimmer:after{background:var(--aa-shimmer-color,var(--ds-accent-color,var(--accent-color,var(--apple-green,Highlight))));animation:none;transform:none}}@media (forced-colors:active){.aa-shimmer{display:none}}.aa-prompt{--aa-prompt-color:var(--aa-prompt,light-dark(#594dff,#b7b0ff));z-index:1000;box-sizing:border-box;color:var(--aa-prompt-color);caret-color:var(--aa-prompt-color);white-space:pre-wrap;overflow-wrap:anywhere;padding:0;background:0 0;outline:none;margin:0;padding-inline-end:.2em;position:fixed;overflow:visible}.aa-prompt[data-placed=page]{position:absolute}.aa-prompt:empty:before{content:attr(data-placeholder);color:var(--aa-prompt-color);pointer-events:none}.aa-prompt[data-listening]{caret-color:#0000}.aa-prompt-caret{width:calc(6px * var(--aa-sf,1));height:calc(6px * var(--aa-sf,1));background:var(--aa-prompt,light-dark(#594dff,#b7b0ff));vertical-align:middle;pointer-events:none;border-radius:50%;display:inline-block;position:relative}.aa-prompt-caret[data-after]{margin-inline-start:.25em}.aa-prompt i{margin-inline-end:-.2em;padding-inline-end:.2em;font-style:italic}.aa-prompt .aa-prompt-heard{text-underline-offset:.15em;-webkit-text-decoration:underline dotted;text-decoration:underline dotted}.aa-prompt[data-loading]{cursor:progress}.aa-prompt[data-failed]{-webkit-text-decoration:underline wavy var(--ds-danger-color,#d33);text-decoration:underline wavy var(--ds-danger-color,#d33);text-underline-offset:3px}@keyframes aa-prompt-breathe{0%,to{opacity:.35}50%{opacity:1}}[data-aa-glisten]{background-image:linear-gradient(105deg, currentColor 35%, var(--aa-prompt,light-dark(#594dff,#b7b0ff)) 50%, currentColor 65%);-webkit-text-fill-color:transparent;animation:1.8s ease-in-out infinite aa-glisten-pass;animation-delay:var(--aa-glisten-delay,0s);background-position:100% 0;background-repeat:no-repeat;background-size:300% 100%;background-clip:text}[data-aa-glisten] :is(.aa-c,.aa-comment,.aa-highlight){background:0 0}@keyframes aa-glisten-pass{to{background-position:0 0}}@media (prefers-reduced-motion:reduce){[data-aa-glisten]{-webkit-text-fill-color:currentColor;background-image:none;animation:none}}@media (forced-colors:active){[data-aa-glisten]{-webkit-text-fill-color:currentColor;background-image:none;animation:none}}.aa-ai-marks{z-index:999;pointer-events:none;position:fixed;inset:0}.aa-ai-hold{box-sizing:border-box;border:1px solid color-mix(in srgb, var(--ds-sharp-blue,var(--sharp-blue,#594dff)) 45%, transparent);border-radius:var(--ds-radius,calc(4px * var(--aa-sf,1)));background:color-mix(in srgb, var(--ds-zenith-blue,var(--zenith-blue,#ccf)) 30%, transparent);mix-blend-mode:multiply;animation:.24s cubic-bezier(.2,0,0,1) both aa-ai-appear;position:fixed}@media (prefers-color-scheme:dark){.aa-ai-hold{mix-blend-mode:screen;background:color-mix(in srgb, var(--ds-sharp-blue,var(--sharp-blue,#594dff)) 18%, transparent)}}.aa-ai-revert{width:calc(16px * var(--aa-sf,1));height:calc(16px * var(--aa-sf,1));transform:translate(calc(2px * var(--aa-sf,1)), -50%);cursor:pointer;pointer-events:auto;background:0 0;border:0;margin:0;padding:0;animation:.24s cubic-bezier(.2,0,0,1) both aa-ai-appear;display:block;position:fixed}.aa-ai-dot{left:calc(4px * var(--aa-sf,1));top:calc(5px * var(--aa-sf,1));width:calc(6px * var(--aa-sf,1));height:calc(6px * var(--aa-sf,1));background:var(--ds-sharp-blue,var(--sharp-blue,#594dff));border-radius:50%;transition:transform .18s cubic-bezier(.2,0,0,1),opacity .18s cubic-bezier(.2,0,0,1);position:absolute}.aa-ai-label{height:calc(16px * var(--aa-sf,1));padding:0 calc(4px * var(--aa-sf,1));border-radius:var(--ds-radius,calc(4px * var(--aa-sf,1)));background:var(--ds-sharp-blue,var(--sharp-blue,#594dff));color:var(--ds-white,#fff);font:inherit;font-family:var(--aa-typeface,var(--ds-typeface-regular,var(--typeface-regular,system-ui))), system-ui, sans-serif;font-size:var(--ds-type-size-default,calc(14px * var(--aa-sf,1)));line-height:calc(16px * var(--aa-sf,1));white-space:nowrap;opacity:0;transform-origin:calc(7px * var(--aa-sf,1)) 50%;transition:transform .22s cubic-bezier(.2,0,0,1),opacity .16s cubic-bezier(.2,0,0,1);position:absolute;top:0;left:0;transform:scale(.25)}.aa-ai-revert:hover .aa-ai-dot,.aa-ai-revert:focus-visible .aa-ai-dot{opacity:0;transform:scale(2)}.aa-ai-revert:hover .aa-ai-label,.aa-ai-revert:focus-visible .aa-ai-label{opacity:1;transform:none}.aa-ai-revert:focus-visible{outline:none}.aa-ai-revert:focus-visible .aa-ai-label{box-shadow:0 0 0 2px var(--ds-focus-ring,#594dff), 0 0 0 3px var(--ds-white,#fff)}.aa-ai-mark[data-kind=section] .aa-ai-revert{transform:translate(calc(-16px * var(--aa-sf,1)), -50%)}.aa-ai-mark[data-kind=section] .aa-ai-label{transform-origin:calc(100% - 7px * var(--aa-sf,1)) 50%;left:auto;right:0}@keyframes aa-ai-appear{0%{opacity:0}to{opacity:1}}@media (prefers-reduced-motion:reduce){.aa-ai-hold,.aa-ai-revert{animation:none}.aa-ai-dot,.aa-ai-label{transition:none}}@media (forced-colors:active){.aa-ai-hold{background:0 0;border-color:highlight}}.aa-block[data-kind=bullet][data-checked][data-ai-box]:before{border-color:var(--ds-sharp-blue,var(--sharp-blue,#594dff));box-shadow:0 0 0 1px var(--ds-sharp-blue,var(--sharp-blue,#594dff))}.aa[data-ai-fading] .aa-block[data-ai-box]:before{box-shadow:none}.aa-ai-marks[data-fading]{opacity:0;transition:opacity .4s cubic-bezier(.2,0,0,1)}@media (prefers-reduced-motion:reduce){.aa-ai-changed,.aa-ai-marks[data-fading]{transition:none}}.aa-comment{background:var(--aa-comment-fill,color-mix(in srgb, var(--ds-orange,var(--orange,#fec20d)) 28%, transparent));border-radius:calc(2px * var(--aa-sf,1));transition:background-color .18s cubic-bezier(.2,0,0,1)}.aa-comment--open{background:var(--aa-comment-fill-open,color-mix(in srgb, var(--ds-orange,var(--orange,#fec20d)) 55%, transparent))}.aa-comment--unread{box-shadow:inset 0 -1px var(--ds-orange,var(--orange,#fec20d))}.aa-comment--draft{background:var(--aa-comment-fill-open,color-mix(in srgb, var(--ds-orange,var(--orange,#fec20d)) 55%, transparent))}@media (forced-colors:active){.aa-comment{background:0 0;outline:1px solid highlight}}.aa-comments{--aa-unit:var(--ds-unit,var(--1,calc(20px * var(--sf,1))));--aa-sf:var(--ds-sf,var(--sf,1));--aa-rule-color:var(--aa-rule,var(--ds-border-color,light-dark(#d8d8d8,#3d3d3d)));--aa-muted:var(--ds-text-color-muted,light-dark(#797979,#ababab));box-sizing:border-box;color:var(--ds-text-color,light-dark(#1e1e1e,#fff));font-family:\"Inter Arrows\", var(--aa-typeface,var(--ds-typeface-regular,var(--typeface-regular,system-ui))), system-ui, sans-serif;font-feature-settings:var(--aa-font-features,var(--ds-font-features,normal));font-size:var(--ds-type-size-default,calc(14px * var(--aa-sf,1)));font-weight:var(--ds-type-weight-default,400);letter-spacing:var(--ds-type-letterspacing-default,calc(-.3px * var(--aa-sf,1)));line-height:var(--aa-unit)}.aa-comments[data-mode=popover]{z-index:1000;max-height:calc(100vh - var(--aa-unit));padding:calc(var(--aa-unit) / 2);border:1px solid var(--aa-rule-color);border-radius:var(--ds-radius-card,calc(8px * var(--aa-sf,1)));background:var(--ds-background-color,light-dark(#fff,#1e1e1e));box-shadow:var(--ds-shadow,0 calc(4px * var(--aa-sf,1)) calc(20px * var(--aa-sf,1)) #00000014);animation:.22s cubic-bezier(.2,0,0,1) both aa-comments-in;position:fixed;overflow-y:auto}@keyframes aa-comments-in{0%{opacity:0;transform:translateY(calc(4px * var(--aa-sf,1)))}}.aa-comments[data-mode=popover] :is(.aa-thread-head,.aa-comment-meta,.aa-composer,.aa-comment-reactions,.aa-thread-actions){align-items:center}.aa-comments[data-mode=popover] .aa-composer textarea{padding:0}.aa-comments[data-mode=panel] .aa-thread+.aa-thread{margin-top:calc(var(--aa-unit) / 2)}.aa-comments-tabs{align-items:flex-end;gap:calc(4px * var(--aa-sf,1));height:var(--aa-unit);margin:0 0 0 calc(-4px * var(--aa-sf,1));line-height:calc(16px * var(--aa-sf,1));display:flex}.aa-comments-tabs [role=tab]{height:calc(16px * var(--aa-sf,1));padding:0 calc(4px * var(--aa-sf,1));border-radius:var(--ds-radius,calc(4px * var(--aa-sf,1)));color:var(--aa-muted);font:inherit;letter-spacing:inherit;line-height:calc(16px * var(--aa-sf,1));white-space:nowrap;cursor:pointer;background:0 0;border:0;margin:0}.aa-comments-tabs [role=tab][aria-selected=true],.aa-comments-tabs [role=tab]:hover{color:inherit}.aa-comments-tabs [role=tab]:focus-visible{outline:2px solid var(--ds-focus-ring,#594dff);outline-offset:-2px}.aa-comments-tab-count{font-variant-numeric:tabular-nums}.aa-comments-empty{color:var(--aa-muted)}.aa-comments[data-mode=panel] .aa-comments-tabs+.aa-thread{margin-top:0}.aa-comments-empty{margin:0}.aa-thread-head{align-items:flex-end;gap:calc(4px * var(--aa-sf,1));box-sizing:border-box;width:100%;min-height:var(--aa-unit);color:inherit;font:inherit;letter-spacing:inherit;line-height:calc(16px * var(--aa-sf,1));text-align:start;background:0 0;border:0;margin:0;padding:0;display:flex}button.aa-thread-head{cursor:pointer}button.aa-thread-head:focus-visible{outline:2px solid var(--ds-focus-ring,#594dff);outline-offset:1px;border-radius:calc(2px * var(--aa-sf,1))}.aa-thread-quote{min-width:0;color:var(--aa-muted);white-space:nowrap;mask-image:linear-gradient(to right, black calc(100% - var(--aa-unit)), transparent 100%);flex:auto;overflow:hidden}.aa-thread[data-orphaned] .aa-thread-quote{font-style:italic}.aa-thread[data-unread] .aa-thread-quote:before{content:\"\";width:calc(6px * var(--aa-sf,1));height:calc(6px * var(--aa-sf,1));margin-right:calc(4px * var(--aa-sf,1));background:var(--ds-orange,var(--orange,#fec20d));vertical-align:calc(2px * var(--aa-sf,1));border-radius:50%;display:inline-block}.aa-thread-count{color:var(--aa-muted);font-variant-numeric:tabular-nums;flex:none}.aa-thread-title{min-width:0;font-family:\"Inter Arrows\", var(--aa-typeface-bold,var(--ds-typeface-medium,var(--typeface-medium,inherit))), system-ui, sans-serif;font-weight:var(--ds-type-weight-bold,500);white-space:nowrap;flex:auto}.aa-thread[data-titled]>.aa-thread-head{margin-bottom:calc(var(--aa-unit) / 2)}.aa-thread-actions{align-items:flex-end;gap:calc(4px * var(--aa-sf,1));flex:none;margin-left:auto;display:flex}.aa-comments-button{width:calc(16px * var(--aa-sf,1));height:calc(16px * var(--aa-sf,1));border-radius:var(--ds-radius,calc(4px * var(--aa-sf,1)));color:inherit;cursor:pointer;background:0 0;border:0;justify-content:center;align-items:center;margin:0;padding:0;display:inline-flex}.aa-comments-button:hover{background:var(--ds-fill,light-dark(#e6e6e6,#3c3c3c))}.aa-comments-button:disabled{opacity:.5;cursor:default}.aa-comments-word{height:calc(16px * var(--aa-sf,1));padding:0 calc(4px * var(--aa-sf,1));border-radius:var(--ds-radius,calc(4px * var(--aa-sf,1)));background:var(--ds-fill,light-dark(#e6e6e6,#3c3c3c));color:inherit;font:inherit;letter-spacing:inherit;line-height:calc(16px * var(--aa-sf,1));white-space:nowrap;cursor:pointer;border:0;margin:0}.aa-comments-word:hover{background:var(--ds-fill-hover,light-dark(#d8d8d8,#4a4a4a))}.aa-thread-reopen{background:var(--ds-zenith-blue,var(--zenith-blue,#ccf));color:var(--ds-sharp-blue,var(--sharp-blue,#594dff))}.aa-thread-delete{background:var(--ds-tuned-red,var(--tuned-red,#ff5f5f));color:var(--ds-white,#fff)}.aa-comment-edit{color:var(--aa-muted);background:0 0;margin-left:auto}.aa-comment-meta .aa-thread-actions{margin-left:auto}.aa-comment-meta .aa-comment-edit+.aa-thread-actions{margin-left:0}.aa-comment-edit:hover{color:inherit}.aa-comments-button:focus-visible,.aa-comments-word:focus-visible{outline:2px solid var(--ds-focus-ring,#594dff);outline-offset:1px}.aa-comment-entry{margin-top:calc(var(--aa-unit) / 2)}.aa-thread-head+.aa-comment-entry{margin-top:0}.aa-comment-meta{align-items:flex-end;gap:calc(4px * var(--aa-sf,1));min-height:var(--aa-unit);line-height:calc(16px * var(--aa-sf,1));display:flex}.aa-comment-author{font-family:\"Inter Arrows\", var(--aa-typeface-bold,var(--ds-typeface-medium,var(--typeface-medium,inherit))), system-ui, sans-serif;font-weight:var(--ds-type-weight-bold,500);white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.aa-comment-time{color:var(--aa-muted);white-space:nowrap}.aa-comment-body{margin:0 0 0 var(--aa-unit);line-height:var(--aa-unit);white-space:pre-wrap;overflow-wrap:anywhere}.aa-comment-mention{color:var(--aa-person,inherit)}.aa-comment-entry--internal{border-radius:var(--ds-radius,calc(4px * var(--aa-sf,1)));background:var(--aa-internal,light-dark(#e4e4e7,#34343a));box-shadow:0 0 0 calc(var(--aa-unit) / 4) var(--aa-internal,light-dark(#e4e4e7,#34343a))}.aa-comment-internal{color:var(--aa-muted);white-space:nowrap}.aa-comment-reactions{align-items:flex-end;gap:calc(var(--aa-unit) / 2);min-height:var(--aa-unit);margin-left:var(--aa-unit);line-height:calc(16px * var(--aa-sf,1));flex-wrap:wrap;display:flex}.aa-reaction{align-items:center;gap:calc(4px * var(--aa-sf,1));height:calc(16px * var(--aa-sf,1));border-radius:var(--ds-radius,calc(4px * var(--aa-sf,1)));color:var(--aa-muted);font:inherit;letter-spacing:inherit;line-height:calc(16px * var(--aa-sf,1));cursor:pointer;background:0 0;border:0;margin:0;padding:0;display:inline-flex}.aa-reaction:hover:not(:disabled){color:inherit}.aa-reaction[aria-pressed=true]{color:var(--ds-sharp-blue,var(--sharp-blue,#594dff))}.aa-reaction:disabled{cursor:default}.aa-reaction:is(:hover,:active,[aria-pressed]){background:0 0}.aa-reaction-count{font-variant-numeric:tabular-nums}.aa-reaction-add{color:var(--aa-muted)}.aa-reaction-add:hover{color:inherit}.aa-reaction:focus-visible{outline:2px solid var(--ds-focus-ring,#594dff);outline-offset:1px}.aa-reaction-picker{grid-template-columns:repeat(8, calc(var(--aa-square) - 1px));grid-auto-rows:calc(var(--aa-square) - 1px);width:calc(8 * var(--aa-square) - 1px);gap:1px;display:grid}.aa-reaction-picker button{width:calc(var(--aa-square) - 1px);height:calc(var(--aa-square) - 1px);min-width:0;font-size:calc(12px * var(--aa-sf,1));justify-content:center;align-items:center;padding:0;line-height:1;overflow:visible}.aa-callout-icons{position:fixed}.aa-callout-icons .aa-callout-icons-none{width:auto;padding:0 calc(4px * var(--aa-sf));grid-column:1/-1;justify-content:flex-start}.aa-thread-resolved{margin:0 0 0 var(--aa-unit);min-height:var(--aa-unit);color:var(--aa-muted)}.aa-comments-error{margin:0 0 0 var(--aa-unit);min-height:var(--aa-unit);color:var(--ds-tuned-red,var(--tuned-red,#ff5f5f))}.aa-avatar{--ds-avatar-background:var(--aa-person,var(--ds-fill,#ededed));--ds-avatar-color:var(--aa-person-ink,#1e1e1e);box-sizing:border-box;width:calc(16px * var(--aa-sf,1));height:calc(16px * var(--aa-sf,1));background:var(--aa-person,var(--ds-fill,#ededed));color:var(--aa-person-ink,#1e1e1e);font:var(--ds-type-weight-default,400) var(--ds-type-size-small,calc(10px * var(--aa-sf,1))) / 1 var(--aa-typeface,var(--ds-typeface-regular,var(--typeface-regular,system-ui)));letter-spacing:normal;text-align:center;white-space:nowrap;-webkit-user-select:none;user-select:none;border-radius:50%;flex:none;place-items:center;display:inline-grid;position:relative;overflow:hidden}.aa-composer{align-items:flex-end;gap:calc(4px * var(--aa-sf,1));margin:calc(var(--aa-unit) / 2) 0 0;min-height:var(--aa-unit);display:flex}.aa-thread-head+.aa-composer,.aa-thread>.aa-composer:first-child{margin-top:0}.aa-composer textarea,.aa-comment-editing{box-sizing:border-box;width:100%;min-width:0;min-height:var(--aa-unit);max-height:calc(8 * var(--aa-unit));color:inherit;font:inherit;letter-spacing:inherit;line-height:var(--aa-unit);resize:none;background:0 0;border:0;border-radius:0;outline:none;flex:auto;margin:0;padding:0;overflow:hidden}.aa-comment-editing{width:calc(100% - var(--aa-unit));margin-left:var(--aa-unit);background:0 0;padding:0;display:block}.aa-composer textarea::placeholder,.aa-comment-editing::placeholder{color:var(--aa-placeholder,var(--ds-input-placeholder-color,light-dark(#797979,#ababab)))}.aa-composer textarea[data-asking]{color:var(--aa-prompt,light-dark(#594dff,#b7b0ff));caret-color:var(--aa-prompt,light-dark(#594dff,#b7b0ff))}.aa-composer>.aa-avatar{margin-top:calc((var(--aa-unit) - 16px * var(--aa-sf,1)) / 2);align-self:flex-start}.aa-composer>.aa-composer-send{align-self:flex-end}.aa-composer-send{color:var(--aa-muted)}.aa-composer-field[hidden]{display:none}.aa-composer-field{flex:auto;min-width:0;display:flex;position:relative}.aa-composer-backdrop{white-space:pre-wrap;overflow-wrap:break-word;line-height:var(--aa-unit);pointer-events:none;position:absolute;inset:0;overflow:hidden}.aa-composer textarea{position:relative}.aa-composer textarea[data-mentions]:not([data-asking],[data-listening]){color:#0000;caret-color:var(--ds-text-color,currentColor)}.aa-composer textarea[data-listening]{color:#0000;caret-color:#0000}.aa-composer-field:has(textarea[data-listening]) .aa-composer-backdrop{color:var(--aa-prompt,light-dark(#594dff,#b7b0ff))}.aa-composer-listening{color:var(--aa-placeholder,var(--ds-input-placeholder-color,light-dark(#797979,#ababab)));margin-inline-start:.25em}.aa-composer textarea[data-mentions]::selection{color:#0000}.aa-composer-field:has(textarea[data-asking]) .aa-composer-backdrop{visibility:hidden}.aa-composer-thinking{min-width:0;line-height:var(--aa-unit);flex:auto}.aa-composer-send:hover{color:inherit}.aa-menu.aa-comments-people{--aa-menu-fill:var(--ds-paper,#fff);--aa-menu-ink:var(--ds-text-color,#1e1e1e);--aa-menu-hover:var(--ds-fill,#f2f2f2);width:calc(8 * var(--aa-square));background:var(--aa-menu-fill);box-shadow:inset 0 0 0 1px var(--ds-border-color,#0000001f);gap:0}.aa-comments-people button{justify-content:flex-start}.aa-comments-people button span:last-child{white-space:nowrap;mask-image:linear-gradient(to right, black calc(100% - var(--aa-square)), transparent 100%);flex:1}@media (prefers-reduced-motion:reduce){.aa-comments[data-mode=popover]{animation:none}.aa-comment{transition:none}}.aa-atom.aa-columns{grid-template-columns:repeat(var(--aa-columns,2), minmax(0, 1fr));gap:calc(2 * var(--aa-unit));vertical-align:top;width:100%;display:grid}.aa-column{min-width:0}@media (width<=480px){.aa-atom.aa-columns{gap:var(--aa-unit);grid-template-columns:minmax(0,1fr)}}.aa-atom.aa-tabs{vertical-align:top;width:100%;display:block}.aa-tabs-row{align-items:flex-end;gap:calc(4px * var(--aa-sf));min-height:var(--aa-unit);line-height:calc(16px * var(--aa-sf));white-space:nowrap;overscroll-behavior-x:contain;scrollbar-width:none;margin-inline-start:calc(-4px * var(--aa-sf));display:flex;overflow-x:auto}.aa-tabs-row::-webkit-scrollbar{display:none}.aa-tab{align-items:flex-end;gap:calc(4px * var(--aa-sf));box-sizing:border-box;height:calc(16px * var(--aa-sf));padding:0 calc(4px * var(--aa-sf));border-radius:var(--ds-radius,calc(4px * var(--aa-sf)));color:var(--ds-text-color-muted,GrayText);font:inherit;letter-spacing:inherit;line-height:calc(16px * var(--aa-sf));white-space:nowrap;cursor:pointer;-webkit-user-select:none;user-select:none;background:0 0;border:0;flex:none;margin:0;display:inline-flex}.aa-tab[aria-selected=true]{color:var(--ds-text-color,inherit)}.aa-tab:focus-visible{outline:2px solid var(--ds-focus-ring,currentColor);outline-offset:-2px}.aa-tab-icon{font-size:calc(12px * var(--aa-sf));line-height:calc(16px * var(--aa-sf))}.aa-tab-add{color:var(--ds-text-color-muted,GrayText)}.aa-tab-add:hover,.aa-tab-add:focus-visible{color:var(--ds-text-color,inherit)}.aa-tab-name[data-editing]{display:inline-grid}.aa-tab-name[data-editing]:after{content:attr(data-editing);visibility:hidden;white-space:pre;grid-area:1/1}.aa-tab-field{box-sizing:border-box;width:100%;min-width:1px;height:calc(16px * var(--aa-sf));color:var(--ds-text-color,inherit);font:inherit;letter-spacing:inherit;line-height:calc(16px * var(--aa-sf));background:0 0;border:0;border-radius:0;outline:none;grid-area:1/1;margin:0;padding:0}.aa-tab-panel{margin-top:var(--aa-unit);min-height:var(--aa-unit)}.aa-block[data-readonly=true] .aa-tab{cursor:default}.aa-drop-line.aa-drop-side{width:calc(2px * var(--aa-sf))}.aa-drop-line.aa-drop-side[data-swap]{box-shadow:inset 0 0 0 calc(2px * var(--aa-sf)) var(--ds-accent-color,var(--accent-color,var(--apple-green,Highlight)));border-radius:var(--ds-radius,calc(4px * var(--aa-sf)));background:0 0}.aa-column .aa-atom[data-atom=image]:not([data-width]){width:100%;max-width:100%;display:block}.aa-column .aa-atom:has(>img):not([data-width]){width:100%;max-width:100%;display:block}.aa-column .aa-atom[data-atom=image][data-width]{display:block}.aa-column .aa-atom>img{width:100%}:where(.aa-toc){white-space:normal;display:block}:where(.aa-toc ds-table-of-contents){--ds-toc-width:100%}:where(.aa-toc-empty){color:var(--ds-text-color-muted,GrayText)}:where(.aa-partial){vertical-align:baseline;cursor:pointer;max-width:100%;display:inline-block}:where(.aa-partial>ds-button){pointer-events:none}:where(.aa-partial:focus-visible){outline:1px solid var(--ds-focus-color,Highlight);outline-offset:2px}:where(.aa-partial-properties){--ds-overlay-width:calc(12 * var(--ds-unit,20px))}:where(.aa-partial-properties>*){margin-bottom:var(--ds-unit,20px);display:block}:where(.aa-partial-properties>label>ds-select){display:block}:where(.aa-partial-properties>.aa-partial-actions){justify-content:flex-end;gap:var(--ds-half,10px);margin-bottom:0;display:flex}.aa-command-preview{z-index:1001;width:calc(16 * var(--aa-square,20px));pointer-events:none;position:fixed}.aa-command-preview[hidden]{display:none}.aa-toolbar-spacer{flex:0 0 var(--ds-context-row,calc(var(--aa-square) - 1px));height:var(--ds-context-row,calc(var(--aa-square) - 1px));background:var(--aa-menu-fill);pointer-events:none;justify-content:center;align-items:center;display:flex}.aa-menu[data-palette]{width:max-content;min-width:0}.aa-menu[data-palette] .aa-menu-list{grid-template-columns:repeat(4,var(--aa-square));gap:1px;display:grid;overflow:visible}.aa-menu[data-palette] .aa-colour-swatch{width:var(--aa-square);justify-content:center;min-width:0;padding:0}.aa-menu[data-palette] .aa-colour-swatch .aa-icon{width:calc(10px * var(--aa-sf));height:calc(10px * var(--aa-sf));border-radius:calc(2px * var(--aa-sf));mask-image:none}.aa-menu[data-palette]>button[data-command=close]{display:none}";
//#endregion
//#region src/styles.ts
function Sa(e) {
	let t = e.getRootNode(), n = e.ownerDocument, r = t.host ? t : n.head ?? n.documentElement;
	if (r.querySelector("style[data-aa-styles]") || r !== t && n.defaultView?.getComputedStyle(n.documentElement).getPropertyValue("--aa-sheet").trim()) return;
	let i = n.createElement("style");
	i.dataset.aaStyles = "", i.textContent = xa, r.prepend(i);
}
//#endregion
//#region node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/css-tag.js
var Ca = globalThis, wa = Ca.ShadowRoot && (Ca.ShadyCSS === void 0 || Ca.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Ta = Symbol(), Ea = /* @__PURE__ */ new WeakMap(), Da = class {
	constructor(e, t, n) {
		if (this._$cssResult$ = !0, n !== Ta) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, t = this.t;
		if (wa && e === void 0) {
			let n = t !== void 0 && t.length === 1;
			n && (e = Ea.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), n && Ea.set(t, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, Oa = (e) => new Da(typeof e == "string" ? e : e + "", void 0, Ta), ka = (e, ...t) => new Da(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, Ta), Aa = (e, t) => {
	if (wa) e.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let n of t) {
		let t = document.createElement("style"), r = Ca.litNonce;
		r !== void 0 && t.setAttribute("nonce", r), t.textContent = n.cssText, e.appendChild(t);
	}
}, ja = wa ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return Oa(t);
})(e) : e, { is: Ma, defineProperty: Na, getOwnPropertyDescriptor: Pa, getOwnPropertyNames: Fa, getOwnPropertySymbols: Ia, getPrototypeOf: La } = Object, Ra = globalThis, za = Ra.trustedTypes, Ba = za ? za.emptyScript : "", Va = Ra.reactiveElementPolyfillSupport, Ha = (e, t) => e, Ua = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? Ba : null;
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
}, Wa = (e, t) => !Ma(e, t), Ga = {
	attribute: !0,
	type: String,
	converter: Ua,
	reflect: !1,
	useDefault: !1,
	hasChanged: Wa
};
Symbol.metadata ??= Symbol("metadata"), Ra.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var Ka = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = Ga) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && Na(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = Pa(this.prototype, e) ?? {
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
		return this.elementProperties.get(e) ?? Ga;
	}
	static _$Ei() {
		if (this.hasOwnProperty(Ha("elementProperties"))) return;
		let e = La(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(Ha("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Ha("properties"))) {
			let e = this.properties, t = [...Fa(e), ...Ia(e)];
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
			for (let e of n) t.unshift(ja(e));
		} else e !== void 0 && t.push(ja(e));
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
		return Aa(e, this.constructor.elementStyles), e;
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
			let i = (n.converter?.toAttribute === void 0 ? Ua : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? Ua : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? Wa)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
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
Ka.elementStyles = [], Ka.shadowRootOptions = { mode: "open" }, Ka[Ha("elementProperties")] = /* @__PURE__ */ new Map(), Ka[Ha("finalized")] = /* @__PURE__ */ new Map(), Va?.({ ReactiveElement: Ka }), (Ra.reactiveElementVersions ??= []).push("2.1.2");
//#endregion
//#region node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/lit-html.js
var qa = globalThis, Ja = (e) => e, Ya = qa.trustedTypes, Xa = Ya ? Ya.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, Za = "$lit$", Qa = `lit$${Math.random().toFixed(9).slice(2)}$`, $a = "?" + Qa, eo = `<${$a}>`, to = document, no = () => to.createComment(""), ro = (e) => e === null || typeof e != "object" && typeof e != "function", io = Array.isArray, ao = (e) => io(e) || typeof e?.[Symbol.iterator] == "function", oo = "[ 	\n\f\r]", so = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, co = /-->/g, lo = />/g, uo = RegExp(`>|${oo}(?:([^\\s"'>=/]+)(${oo}*=${oo}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), fo = /'/g, po = /"/g, mo = /^(?:script|style|textarea|title)$/i, X = ((e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}))(1), ho = Symbol.for("lit-noChange"), Z = Symbol.for("lit-nothing"), go = /* @__PURE__ */ new WeakMap(), _o = to.createTreeWalker(to, 129);
function vo(e, t) {
	if (!io(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return Xa === void 0 ? t : Xa.createHTML(t);
}
var yo = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = so;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === so ? c[1] === "!--" ? o = co : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = uo) : (mo.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = uo) : o = lo : o === uo ? c[0] === ">" ? (o = i ?? so, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? uo : c[3] === "\"" ? po : fo) : o === po || o === fo ? o = uo : o === co || o === lo ? o = so : (o = uo, i = void 0);
		let d = o === uo && e[t + 1].startsWith("/>") ? " " : "";
		a += o === so ? n + eo : l >= 0 ? (r.push(s), n.slice(0, l) + Za + n.slice(l) + Qa + d) : n + Qa + (l === -2 ? t : d);
	}
	return [vo(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, bo = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = yo(t, n);
		if (this.el = e.createElement(l, r), _o.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = _o.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(Za)) {
					let t = u[o++], n = i.getAttribute(e).split(Qa), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? To : r[1] === "?" ? Eo : r[1] === "@" ? Do : wo
					}), i.removeAttribute(e);
				} else e.startsWith(Qa) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (mo.test(i.tagName)) {
					let e = i.textContent.split(Qa), t = e.length - 1;
					if (t > 0) {
						i.textContent = Ya ? Ya.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], no()), _o.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], no());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === $a) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(Qa, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += Qa.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = to.createElement("template");
		return n.innerHTML = e, n;
	}
};
function xo(e, t, n = e, r) {
	if (t === ho) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = ro(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = xo(e, i._$AS(e, t.values), i, r)), t;
}
var So = class {
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? to).importNode(t, !0);
		_o.currentNode = r;
		let i = _o.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new Co(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Oo(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = _o.nextNode(), a++);
		}
		return _o.currentNode = to, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, Co = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = Z, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = xo(this, e, t), ro(e) ? e === Z || e == null || e === "" ? (this._$AH !== Z && this._$AR(), this._$AH = Z) : e !== this._$AH && e !== ho && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? ao(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== Z && ro(this._$AH) ? this._$AA.nextSibling.data = e : this.T(to.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = bo.createElement(vo(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new So(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = go.get(e.strings);
		return t === void 0 && go.set(e.strings, t = new bo(e)), t;
	}
	k(t) {
		io(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(no()), this.O(no()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = Ja(e).nextSibling;
			Ja(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, wo = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = Z, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = Z;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = xo(this, e, t, 0), a = !ro(e) || e !== this._$AH && e !== ho, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = xo(this, r[n + o], t, o), s === ho && (s = this._$AH[o]), a ||= !ro(s) || s !== this._$AH[o], s === Z ? e = Z : e !== Z && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === Z ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, To = class extends wo {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === Z ? void 0 : e;
	}
}, Eo = class extends wo {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== Z);
	}
}, Do = class extends wo {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = xo(this, e, t, 0) ?? Z) === ho) return;
		let n = this._$AH, r = e === Z && n !== Z || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== Z && (n === Z || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Oo = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		xo(this, e);
	}
}, ko = {
	M: Za,
	P: Qa,
	A: $a,
	C: 1,
	L: yo,
	R: So,
	D: ao,
	V: xo,
	I: Co,
	H: wo,
	N: Eo,
	U: Do,
	B: To,
	F: Oo
}, Ao = qa.litHtmlPolyfillSupport;
Ao?.(bo, Co), (qa.litHtmlVersions ??= []).push("3.3.3");
var jo = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new Co(t.insertBefore(no(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, Mo = globalThis, No = class extends Ka {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = jo(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return ho;
	}
};
No._$litElement$ = !0, No.finalized = !0, Mo.litElementHydrateSupport?.({ LitElement: No });
var Po = Mo.litElementPolyfillSupport;
Po?.({ LitElement: No }), (Mo.litElementVersions ??= []).push("4.2.2");
//#endregion
//#region src/vendor/ds1/0-face/define.ts
function Fo(e, t) {
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
var Io = "data-cut";
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
function Lo(e) {
	return e.scrollWidth > e.clientWidth + 1;
}
function Ro(e) {
	let t = [];
	for (let n of e) n.isConnected && n.checkVisibility?.({ contentVisibilityAuto: !0 }) !== !1 && t.push([n, Lo(n)]);
	Xo();
	for (let [e, n] of t) {
		let t = e.getAttribute(Io);
		n ? t !== "end" && e.setAttribute(Io, "end") : t === "end" && e.removeAttribute(Io);
	}
}
var zo = /* @__PURE__ */ new Set(), Bo = /* @__PURE__ */ new Set(), Vo = !1, Ho = (e) => {
	typeof requestAnimationFrame == "function" ? requestAnimationFrame(e) : setTimeout(e, 0);
};
function Uo() {
	Vo = !1;
	let e = [...Bo];
	Bo.clear();
	let t = /* @__PURE__ */ new Set();
	for (let n of e) if (!n.stopped) for (let e of n.refresh()) t.add(e);
	Ro(t);
}
function Wo(e) {
	e.stopped || (Bo.add(e), !Vo && (Vo = !0, Ho(Uo)));
}
var Go, Ko = /* @__PURE__ */ new Map();
function qo(e) {
	if (typeof ResizeObserver > "u") return;
	Go ??= new ResizeObserver((e) => Ro(e.map((e) => e.target)));
	let t = Ko.get(e) ?? 0;
	t || Go.observe(e), Ko.set(e, t + 1);
}
function Jo(e) {
	let t = Ko.get(e);
	t && (t > 1 ? Ko.set(e, t - 1) : (Ko.delete(e), Go?.unobserve(e)));
}
var Yo = !1;
function Xo() {
	if (Yo || typeof document > "u") return;
	Yo = !0;
	let e = () => {
		for (let e of zo) Wo(e);
	}, t = document.fonts;
	t?.ready?.then(e, () => {}), t?.addEventListener?.("loadingdone", e);
}
function Zo(e = {}) {
	let t = [], n = /* @__PURE__ */ new Set(), r = e.text && typeof MutationObserver < "u" ? new MutationObserver(() => Wo(a)) : void 0, i = () => {
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
			for (let r of n) e.has(r) || (Jo(r), t = !0);
			for (let r of e) n.has(r) || (qo(r), t = !0);
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
	return zo.add(a), {
		watch(e) {
			t.push(e), Wo(a);
		},
		select(e, n) {
			t.push(() => e.querySelectorAll(n)), Wo(a);
		},
		measure() {
			Wo(a);
		},
		disconnect() {
			a.stopped = !0, zo.delete(a), Bo.delete(a);
			for (let e of n) Jo(e);
			r?.disconnect(), n = /* @__PURE__ */ new Set(), t.length = 0;
		}
	};
}
var Qo = class {
	watcher;
	words;
	host;
	options;
	constructor(e, t) {
		this.host = e, this.options = t, e.addController(this);
	}
	hostConnected() {
		this.hostDisconnected();
		let e = Zo(), { selector: t, targets: n, text: r } = this.options;
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
}, $o = [
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
], es = {
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
}, ts = {
	nb: ["no", "nn"],
	no: ["nb", "nn"],
	nn: ["nb", "no"],
	pt: ["pt-BR"],
	"pt-BR": ["pt"]
}, ns = /* @__PURE__ */ new Map();
for (let e of $o) {
	ns.set(e.toLowerCase(), e);
	for (let t of es[e].aliases) ns.set(t, e);
}
var rs = new Map($o.map((e, t) => [e, t]));
function is(e) {
	return typeof e == "string" && rs.has(e);
}
function as(e) {
	return e.split("-")[0] ?? "";
}
function os(e, t) {
	return t.has(e) ? e : ts[e]?.find((e) => t.has(e)) ?? null;
}
function ss(e, t = "en", n = $o) {
	let r = new Set(n), i = String(e ?? "").split(",").map((e) => e.split(";")[0]?.trim().toLowerCase().replace(/_/g, "-") ?? "").filter(Boolean);
	for (let e of i) {
		let t = ns.get(e), n = t ? os(t, r) : null;
		if (n) return n;
		let i = ns.get(as(e)), a = i ? os(i, r) : null;
		if (a) return a;
	}
	return t;
}
function cs(e) {
	let t = [], n = (e) => {
		e && !t.includes(e) && t.push(e);
	};
	n(e);
	let r = String(e ?? "").toLowerCase().replace(/_/g, "-"), i = ns.get(r);
	n(i), n(as(r));
	let a = i ?? ns.get(as(r));
	for (let e of a ? ts[a] ?? [] : []) n(e);
	return t;
}
//#endregion
//#region src/vendor/ds1/0-face/language-routing.ts
var ls = {};
function us(e) {
	ls = {
		...ls,
		...e
	};
}
function ds(e) {
	let t = {
		...ls,
		...e
	};
	return {
		languages: t.languages?.length ? t.languages : $o,
		defaultLanguage: t.defaultLanguage || "en",
		prefixDefaultLanguage: t.prefixDefaultLanguage ?? !1
	};
}
function fs(e) {
	return String(e ?? "").toLowerCase().replace(/_/g, "-");
}
function ps(e, t = ds().languages) {
	let n = fs(e);
	return n ? t.find((e) => fs(e) === n) ?? null : null;
}
function ms(e) {
	let t = e.search(/[?#]/);
	return t === -1 ? [e, ""] : [e.slice(0, t), e.slice(t)];
}
function hs(e, t) {
	let { languages: n } = ds(t), [r, i] = ms(e || "/"), a = r.startsWith("/") ? r : `/${r}`, o = a.split("/")[1] ?? "", s = ps(o, n);
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
var gs = "en", _s = /\{\{\s*([\w.-]+)\s*\}\}|\{([\w.-]+)\}/g;
function vs(e, t) {
	return t ? e.replace(_s, (e, n, r) => {
		let i = n ?? r;
		return Object.prototype.hasOwnProperty.call(t, i) ? String(t[i]) : e;
	}) : e;
}
function ys(e, t, n, r) {
	let i = cs(t);
	i.includes(gs) || i.push(gs);
	for (let t of i) for (let i of n) {
		let n = i?.[t]?.[e];
		if (n) return {
			text: vs(n, r),
			language: t
		};
	}
	return {
		text: vs(e, r),
		language: null
	};
}
function bs(e) {
	return !!e && typeof e == "object" && !Array.isArray(e);
}
function xs(e, t) {
	if (!bs(t)) return null;
	let n = t[e];
	if (bs(n)) return t;
	let r = Object.values(t);
	return r.length > 0 && r.every((e) => typeof e == "string") ? { [e]: t } : r.length > 0 && r.every(bs) ? t : null;
}
//#endregion
//#region src/vendor/ds1/0-face/translations/da.json
var Ss, Cs, ws = t((() => {
	Ss = {
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
	}, Cs = { da: Ss };
})), Ts, Es, Ds = t((() => {
	Ts = {
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
	}, Es = { de: Ts };
})), Os, ks, As = t((() => {
	Os = {
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
	}, ks = { en: Os };
})), js, Ms, Ns = t((() => {
	js = {
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
	}, Ms = { es: js };
})), Ps, Fs, Is = t((() => {
	Ps = {
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
	}, Fs = { fi: Ps };
})), Ls, Rs, zs = t((() => {
	Ls = {
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
	}, Rs = { fr: Ls };
})), Bs, Vs, Hs = t((() => {
	Bs = {
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
	}, Vs = { is: Bs };
})), Us, Ws, Gs = t((() => {
	Us = {
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
	}, Ws = { it: Us };
})), Ks, qs, Js = t((() => {
	Ks = {
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
	}, qs = { ja: Ks };
})), Ys, Xs, Zs = t((() => {
	Ys = {
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
	}, Xs = { ko: Ys };
})), Qs, $s, ec = t((() => {
	Qs = {
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
	}, $s = { nb: Qs };
})), tc, nc, rc = t((() => {
	tc = {
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
	}, nc = { pt: tc };
})), ic, ac = t((() => {
	ic = { "pt-BR": {
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
})), oc, sc, cc = t((() => {
	oc = {
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
	}, sc = { sv: oc };
})), lc, uc, dc = t((() => {
	lc = {
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
	}, uc = { zh: lc };
})), fc = /* @__PURE__ */ n({ SHARED_WORDS: () => pc }), pc, mc = t((() => {
	ws(), Ds(), As(), Ns(), Is(), zs(), Hs(), Gs(), Js(), Zs(), ec(), rc(), ac(), cc(), dc(), pc = {
		...ks,
		...Cs,
		...Es,
		...Ms,
		...Fs,
		...Rs,
		...Vs,
		...Ws,
		...qs,
		...Xs,
		...$s,
		...nc,
		...ic,
		...sc,
		...uc
	};
})), hc = {}, gc = "./translations.json", _c = "language", vc = "ds-one:i18n-debug", yc = "en", Q = typeof window < "u" && window.DS_ONE_I18N ? { ...window.DS_ONE_I18N } : {}, bc;
function xc() {
	try {
		return typeof window < "u" ? window.localStorage ?? void 0 : void 0;
	} catch {
		return;
	}
}
function Sc() {
	return Q.storageKey || _c;
}
function Cc() {
	if (Q.persist === !1) return null;
	try {
		return xc()?.getItem(Sc()) || null;
	} catch {
		return null;
	}
}
function wc(e) {
	if (Q.persist !== !1) try {
		xc()?.setItem(Sc(), e);
	} catch {}
}
function Tc(e) {
	return e ? e.toLowerCase().split(/[-_]/)[0] ?? "" : "";
}
function Ec(e) {
	let t = Q.languages;
	if (!t || t.length === 0) return Tc(e) || null;
	let n = (e || "").toLowerCase().replace("_", "-"), r = t.find((e) => e.toLowerCase() === n);
	if (r) return r;
	let i = Tc(e);
	return t.find((e) => e.toLowerCase() === i) ?? null;
}
function Dc(e) {
	let t = Q.languageFile;
	return t ? kc(typeof t == "function" ? t(e) : t.split("{language}").join(e)) : null;
}
var Oc = !1;
function kc(e) {
	if (!e) return null;
	let t = e.trim();
	return t ? t.startsWith("./") || t.startsWith("../") || t.startsWith("/") || /^https?:\/\//i.test(t) ? t : `./${t}` : null;
}
function Ac() {
	return typeof document > "u" || !document.querySelector ? null : document.querySelector("script[data-ds-one-translations]")?.getAttribute("data-ds-one-translations") || document.querySelector("meta[name=\"ds-one:translations\"]")?.getAttribute("content") || document.querySelector("link[rel=\"ds-one-translations\"]")?.getAttribute("href") || null;
}
function jc() {
	let e = [], t = typeof window < "u" ? window.DS_ONE_TRANSLATIONS_FILE : null, n = Ac(), r = kc(t ?? "");
	r && e.push(r);
	let i = kc(n ?? "");
	return i && !e.includes(i) && e.push(i), e.length === 0 && e.push(kc(Q.translationsFile ?? "") ?? gc), e;
}
function Mc() {
	let e = jc(), t = Dc(Ec(Yc.value) ?? yc);
	return t ? [t, ...e.filter((e) => e !== t)] : e;
}
function Nc(e) {
	let t = Ec(Yc.value) ?? yc;
	return Dc(t) === e ? t : void 0;
}
function Pc(e) {
	return !e || typeof e != "object" ? !1 : Object.values(e).every((e) => e && typeof e == "object");
}
var Fc = /* @__PURE__ */ new Map();
function Ic(e, t) {
	let n = Fc.get(e);
	return n || (n = Lc(e, t).then((t) => (t || Fc.delete(e), t)), Fc.set(e, n)), n;
}
async function Lc(e, t) {
	try {
		let n = await fetch(e);
		if (!n.ok) return null;
		let r = await n.json(), i = t ? xs(t, r) ?? r : r;
		return Pc(i) ? Object.keys(i).length === 0 ? (console.warn(`[Design system 1] No languages found in ${e}`), null) : i : (console.warn(`[Design system 1] Invalid translation format in ${e}. Expected object with language codes as keys.`), null);
	} catch {
		return null;
	}
}
function Rc(e) {
	typeof window > "u" ? hc = {
		...hc,
		...e
	} : window.DS_ONE_TRANSLATIONS = {
		...window.DS_ONE_TRANSLATIONS,
		...e
	};
}
async function zc() {
	if (Oc || (Oc = !0, typeof window > "u")) return !1;
	if (window.DS_ONE_TRANSLATIONS && Object.keys(window.DS_ONE_TRANSLATIONS).length > 0) return ll(`Translations already loaded (${Object.keys(window.DS_ONE_TRANSLATIONS).length} languages), skipping auto-load`), !0;
	let e = Mc();
	for (let t of e) {
		let e = await Ic(t, Nc(t));
		if (!e) continue;
		Rc(e);
		let n = Object.keys(e);
		return ll(`External translations loaded from ${t}: ${n.length} language(s) – ${n.join(", ")}`), window.dispatchEvent(new CustomEvent("translations-ready")), !0;
	}
	return ll(`No external translations found at ${e[0] ?? gc}. Using bundled translations.`), !1;
}
var Bc = /* @__PURE__ */ new Map();
function Vc(e) {
	if (typeof window > "u" || !Q.languageFile) return Promise.resolve();
	let t = Ec(e) ?? yc;
	if (Hc()[t]) return Promise.resolve();
	let n = Bc.get(t);
	return n || (n = (async () => {
		let e = Dc(t), n = e ? await Ic(e, t) : null;
		for (let e of jc()) {
			if (n) break;
			n = await Ic(e);
		}
		n && (Rc(n), window.dispatchEvent(new CustomEvent("translations-ready")));
	})(), Bc.set(t, n)), n;
}
function Hc() {
	return typeof window < "u" && window.DS_ONE_TRANSLATIONS ? window.DS_ONE_TRANSLATIONS : hc;
}
function Uc() {
	return Q.languages?.length ? Q.languages : null;
}
function Wc(e) {
	if (!e) return null;
	let t = Uc(), n = t ? t.filter(is) : $o;
	return (n.length ? ss(e, null, n) : null) || (t ? Ec(e) : null);
}
function Gc() {
	if (typeof navigator > "u" || !navigator) return yc;
	let e = [navigator.language, ...Array.isArray(navigator.languages) ? navigator.languages : []].filter((e) => !!e);
	for (let t of e) {
		let e = Wc(t);
		if (e) return e;
	}
	return !Uc() && e[0] ? e[0] : yc;
}
function Kc(e) {
	typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("language-changed", {
		detail: { language: e },
		bubbles: !0,
		composed: !0
	}));
}
function qc() {
	if (!Q.languageFromAddress || typeof window > "u") return null;
	let e = window.location?.pathname;
	return e ? hs(e, Qc()).language : null;
}
function Jc() {
	let e = Q.langTarget;
	return e === !1 ? null : e || (typeof document < "u" ? document.documentElement ?? null : null);
}
var Yc = {
	value: qc() || Cc() || Gc(),
	set: function(e, t = {}) {
		this.value = e, t.remember !== !1 && wc(e), Vc(e);
		let n = Jc();
		n && (n.lang = e), Kc(e);
	}
};
function Xc(e) {
	let t = Q.persist, n = Sc(), r = Q.languages, i = Q.languageFromAddress, a = Q.routing;
	if (Q = {
		...Q,
		...e
	}, Zc(), Q.persist !== t || Sc() !== n || Q.languages !== r || Q.languageFromAddress !== i || Q.languageFromAddress && Q.routing !== a) {
		let e = Cc(), t = e || Gc();
		e && Uc() && (t = Wc(e) ?? yc), t = qc() ?? t, t !== Yc.value && (Yc.value = t, Kc(t));
	}
	e.sharedWords && el(), Oc && Q.languageFile && Vc(Yc.value);
}
function Zc() {
	(Q.routing || Q.languages) && us(Qc());
}
function Qc() {
	return {
		...Q.languages ? { languages: Q.languages } : {},
		...Q.routing
	};
}
var $c = null;
function el() {
	return $c ||= Promise.resolve().then(() => (mc(), fc)).then(({ SHARED_WORDS: e }) => {
		bc = e, typeof window < "u" && window.dispatchEvent(new CustomEvent("translations-ready"));
	}), $c;
}
var tl = [], nl = 1e3, rl = null, il = !1, al = typeof window < "u" ? window : void 0;
function ol() {
	if (rl) return;
	let e = new Promise((e) => setTimeout(e, nl));
	rl = Promise.race([Promise.allSettled(tl.splice(0)), e]).then(() => {
		rl = null, il = !0, sl() && al && (al.dispatchEvent(new CustomEvent("translations-loaded")), Kc(Yc.value));
	});
}
if (Zc(), Q.sharedWords && tl.push(el()), typeof window < "u" && typeof document < "u") {
	let e = () => {};
	tl.push(new Promise((t) => e = t));
	let t = () => {
		Q.autoLoad === !1 ? e() : zc().finally(e);
	};
	document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", t) : setTimeout(t, 0);
}
var sl = () => typeof window < "u" && typeof window.addEventListener == "function" && typeof window.dispatchEvent == "function";
sl() && (window.addEventListener("translations-ready", ol), setTimeout(() => {
	sl() && !il && window === al && ol();
}, 100));
var cl = /* @__PURE__ */ new Set();
function ll(e) {
	ul() && console.info(`[Design system 1] ${e}`);
}
function ul() {
	if (typeof window > "u") return !1;
	if (window.DS_ONE_I18N_DEBUG === !0) return !0;
	try {
		return xc()?.getItem(vc) === "on";
	} catch {
		return !1;
	}
}
function dl() {
	let e = Q.reportMissingKeys;
	try {
		if (typeof e == "function" ? e() : e) return !0;
	} catch {}
	return ul();
}
function fl(e, t) {
	if (!dl()) return;
	let n = `${t}:${e}`;
	cl.has(n) || (cl.add(n), console.warn(`[Design system 1 (Internationalization)] No translation found for key "${e}" in "${t}"`));
}
function pl(e, t) {
	return ml(e, Yc.value, t);
}
globalThis[Symbol.for("design-system-1.translate")] = pl;
function ml(e, t, n) {
	let r = Hc(), i = ys(e, t, [r, bc], n);
	if (i.language !== null) return i.text;
	let a = cs(t);
	return !a.includes(yc) && !r?.[yc] && a.some((e) => r?.[e]) && Vc(yc), fl(e, a[a.length - 1] ?? t), i.text;
}
function hl(e, t) {
	return pl(e, t);
}
//#endregion
//#region src/vendor/ds1/0-face/tooltips.ts
var gl = 2e3, _l = 10, vl = Symbol.for("ds-one:tooltips");
function yl() {
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
	window[vl] = {
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
				p &&= (m = !0, c(p.target, { duration: gl }), null);
			}, 500)
		};
	}, {
		passive: !0,
		capture: !0
	}), document.addEventListener("pointermove", (e) => {
		let t = e;
		p && t.pointerId === p.id && Math.hypot(t.clientX - p.x, t.clientY - p.y) > _l && h();
	}, {
		passive: !0,
		capture: !0
	}), document.addEventListener("pointerup", (e) => {
		if (!p || e.pointerId !== p.id) return;
		let { target: t } = p;
		h(), t.hasAttribute("data-tooltip-press") && c(t, { duration: gl });
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
typeof document < "u" && (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", yl, { once: !0 }) : yl());
//#endregion
//#region src/vendor/ds1/2-core/styles/ds-text.css?inline
var bl = "[data-ds-shape=square],:host([data-ds-shape=square]){--ds-corner-size:0px;--ds-corner-shape:round;--ds-button-inset:.5px}[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:4px;--ds-corner-shape:round;--ds-button-inset:2.5px}[data-ds-shape=circular],:host([data-ds-shape=circular]){--ds-corner-size:999px;--ds-corner-shape:round;--ds-button-inset:5px}@supports (corner-shape:squircle){[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:8px;--ds-corner-shape:squircle}}:root,:host,:where([data-ds-surface]){--ds-unit:calc(var(--ds-1,20px) * var(--ds-sf,1));--ds-control-height:calc(var(--ds-control-size,var(--ds-08,16px)) * var(--ds-sf,1));--ds-row-height:calc(var(--ds-row-size,var(--ds-1,20px)) * var(--ds-sf,1));--ds-type-size-default:calc(var(--ds-text-size,14px) * var(--ds-sf,1));--ds-type-size-small:calc(var(--ds-small-text-size,10px) * var(--ds-sf,1));--ds-type-size-heading:calc(var(--ds-heading-text-size,13px) * var(--ds-sf,1));--ds-type-size-display:calc(var(--ds-display-text-size,20px) * var(--ds-sf,1));--ds-type-lineheight-default:calc(var(--ds-text-leading,16px) * var(--ds-sf,1));--ds-type-letterspacing-default:calc(var(--ds-text-tracking,-.3px) * var(--ds-sf,1));--ds-radius:calc(var(--ds-corner-size,4px) * var(--ds-sf,1));--ds-radius-card:calc(var(--ds-card-corner-size,4px) * var(--ds-sf,1))}:host{height:var(--ds-control-height);font-family:\"Inter Arrows\", var(--ds-typeface-regular);font-size:var(--ds-type-size-default);font-weight:var(--ds-type-weight-default);line-height:var(--ds-type-lineheight-default);letter-spacing:var(--ds-type-letterspacing-default);text-align:left;vertical-align:middle;white-space:nowrap;word-break:normal;overflow-wrap:normal;hyphens:manual;color:var(--ds-text-tone,inherit);justify-content:flex-start;align-items:center;display:inline-flex}:host([hidden]){display:none!important}:host([data-language=ja]){font-family:\"Inter Arrows\", var(--ds-typeface-regular-jp,var(--typeface-regular-jp))}:host([data-language=zh]),:host([data-language=zh-hant]){font-family:\"Inter Arrows\", var(--ds-typeface-regular-zh-hant,var(--typeface-regular-zh-hant));font-weight:var(--ds-type-weight-default,400)}:host([data-language=zh-hans]){font-family:\"Inter Arrows\", var(--ds-typeface-regular-zh-hans,var(--typeface-regular-zh-hans));font-weight:var(--ds-type-weight-default,400)}:host span{color:inherit}:host([literal]){height:auto;min-height:var(--ds-control-height);min-width:0;max-width:100%;overflow:var(--ds-text-overflow,hidden);font-family:\"Inter Arrows\", var(--ds-typeface-regular);font-feature-settings:var(--ds-font-features);font-size:var(--ds-type-size-default);font-weight:var(--ds-type-weight-default);line-height:var(--ds-type-lineheight-default);letter-spacing:var(--ds-type-letterspacing-default);text-overflow:clip;white-space:nowrap;display:inline-block}:host([literal]:not([wrap])[data-cut=end]){mask-image:linear-gradient(to right, #000 calc(100% - var(--ds-unit)), transparent)}:host([literal]:not([wrap])[data-cut=end]:dir(rtl)){mask-image:linear-gradient(to left, #000 calc(100% - var(--ds-unit)), transparent)}:host([strong]){font-weight:var(--ds-type-weight-bold)}:host([wrap]){height:auto;min-height:var(--ds-control-height);max-width:100%;line-height:var(--ds-unit);white-space:normal;display:inline-block;overflow:visible}:host([tone=muted]){--ds-text-tone:var(--ds-text-color-muted)}:host([tone=title]){--ds-text-tone:var(--ds-title-color)}:host([tone=danger]){--ds-text-tone:var(--ds-danger-color)}:host([tone=warning]){--ds-text-tone:var(--ds-warning-color)}:host([size=small]){font-size:var(--ds-type-size-small)}:host([size=heading]){height:auto;font-size:var(--ds-type-size-heading);line-height:var(--ds-type-lineheight-default)}:host([size=display]){height:auto;min-height:calc(2 * var(--ds-unit));font-size:var(--ds-type-size-display);line-height:calc(2 * var(--ds-unit));letter-spacing:calc(var(--ds-display-text-tracking,-.4px) * var(--ds-sf,1));display:inline-block}";
Fo("ds-text", class extends No {
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
	cuts = new Qo(this, {
		targets: () => this.literal && !this.wrap ? [this] : [],
		text: !0
	});
	boundHandlers;
	constructor() {
		super(), this.text = "", this.literal = !1, this.strong = !1, this.wrap = !1, this._text = "", this._currentLanguage = Yc.value, this.boundHandlers = { languageChanged: (() => {
			this._currentLanguage = Yc.value, this._updateLanguageAttribute(), this._loadText(), this.requestUpdate();
		}) };
	}
	static styles = Oa(bl);
	connectedCallback() {
		if (super.connectedCallback(), !this.text && !this.literal) {
			let e = this.textContent?.trim() || "";
			e && (this._slotKey = e, this.textContent = "");
		}
		this._currentLanguage = Yc.value, this._updateLanguageAttribute(), this._loadText(), window.addEventListener("language-changed", this.boundHandlers.languageChanged), window.addEventListener("translations-loaded", this.boundHandlers.languageChanged);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), window.removeEventListener("language-changed", this.boundHandlers.languageChanged), window.removeEventListener("translations-loaded", this.boundHandlers.languageChanged);
	}
	willUpdate(e) {
		super.willUpdate(e), (e.has("text") || e.has("literal")) && this._loadText();
	}
	_updateLanguageAttribute() {
		let e = (this._currentLanguage || Yc.value || "").toLowerCase().split(/[-_]/).filter(Boolean), t = e[0] || "";
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
				let t = hl(e);
				this._text = t || e;
			} catch (t) {
				console.error("Error loading text for key:", e, t), this._text = e;
			}
			this._updateLanguageAttribute();
		}
	}
	render() {
		return this.literal && !this.text ? X`<slot></slot>` : X`<span>${this._text || this.text || this._slotKey}</span>`;
	}
});
//#endregion
//#region src/vendor/ds1/3-unit/styles/ds-table-of-contents.css?inline
var xl = "[data-ds-shape=square],:host([data-ds-shape=square]){--ds-corner-size:0px;--ds-corner-shape:round;--ds-button-inset:.5px}[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:4px;--ds-corner-shape:round;--ds-button-inset:2.5px}[data-ds-shape=circular],:host([data-ds-shape=circular]){--ds-corner-size:999px;--ds-corner-shape:round;--ds-button-inset:5px}@supports (corner-shape:squircle){[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:8px;--ds-corner-shape:squircle}}:root,:host,:where([data-ds-surface]){--ds-unit:calc(var(--ds-1,20px) * var(--ds-sf,1));--ds-control-height:calc(var(--ds-control-size,var(--ds-08,16px)) * var(--ds-sf,1));--ds-row-height:calc(var(--ds-row-size,var(--ds-1,20px)) * var(--ds-sf,1));--ds-type-size-default:calc(var(--ds-text-size,14px) * var(--ds-sf,1));--ds-type-size-small:calc(var(--ds-small-text-size,10px) * var(--ds-sf,1));--ds-type-size-heading:calc(var(--ds-heading-text-size,13px) * var(--ds-sf,1));--ds-type-size-display:calc(var(--ds-display-text-size,20px) * var(--ds-sf,1));--ds-type-lineheight-default:calc(var(--ds-text-leading,16px) * var(--ds-sf,1));--ds-type-letterspacing-default:calc(var(--ds-text-tracking,-.3px) * var(--ds-sf,1));--ds-radius:calc(var(--ds-corner-size,4px) * var(--ds-sf,1));--ds-radius-card:calc(var(--ds-card-corner-size,4px) * var(--ds-sf,1))}:host{width:var(--ds-toc-width,calc(12 * var(--ds-unit)));max-width:100%;color:var(--ds-text-color);font-family:\"Inter Arrows\", var(--ds-typeface-regular);font-size:var(--ds-type-size-default);font-weight:var(--ds-type-weight-default);line-height:var(--ds-type-lineheight-default);letter-spacing:var(--ds-type-letterspacing-default);display:block}:host([hidden]){display:none!important}.title{min-height:var(--ds-unit);align-items:flex-end;display:flex}.links{margin-top:var(--ds-unit)}a,::slotted(a){box-sizing:border-box;min-height:var(--ds-unit);padding-top:calc(4px * var(--ds-sf));color:var(--ds-toc-color,var(--ds-text-color-muted));font:inherit;line-height:var(--ds-type-lineheight-default);letter-spacing:inherit;white-space:nowrap;text-overflow:clip;padding-inline-start:calc(var(--toc-depth,0) * var(--ds-unit));text-decoration:none;display:block;overflow:hidden}a[data-cut=end],::slotted(a[data-cut=end]){mask-image:linear-gradient(to right, #000 calc(100% - var(--ds-unit)), transparent)}:host(:dir(rtl)) a[data-cut=end],:host(:dir(rtl)) ::slotted(a[data-cut=end]){mask-image:linear-gradient(to left, #000 calc(100% - var(--ds-unit)), transparent)}a:hover,::slotted(a:hover){color:var(--ds-text-color);text-decoration:underline}a[aria-current],::slotted(a[aria-current]){color:var(--ds-toc-current-color,var(--ds-sharp-blue))}a:focus-visible,::slotted(a:focus-visible){outline:1px solid var(--ds-focus-ring);outline-offset:1px}";
//#endregion
//#region src/table-of-contents.ts
Fo("ds-table-of-contents", class extends No {
	static properties = {
		items: { attribute: !1 },
		label: { type: String },
		literal: { type: Boolean },
		target: { attribute: !1 },
		current: { state: !0 }
	};
	static styles = Oa(xl);
	cuts = new Qo(this, {
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
		let e = this.label || "Contents", t = this.literal ? e : hl(e) || e;
		return X`<nav aria-label=${t} part="navigation">
      <div class="title"><ds-text literal strong role="heading" aria-level="2" part="title">${t}</ds-text></div>
      <div class="links" part="links"><slot @slotchange=${() => this.refresh()}>
        ${this.items.map((e) => X`<a href=${e.href} data-depth=${e.depth ?? 0} aria-current=${this.current === e.href ? "location" : Z} part="link">${e.label}</a>`)}
      </slot></div>
    </nav>`;
	}
}), Xc({
	autoLoad: !1,
	persist: !1,
	langTarget: !1
});
function Sl(e, t, n, r) {
	e.classList.add("aa-toc"), e.setAttribute("data-aa-interactive", "");
	let i = document.createElement("ds-table-of-contents");
	i.label = V("Table of contents"), i.literal = !0, i.target = n;
	let a = document.createElement("span");
	a.className = "aa-toc-empty", a.textContent = V("Add headings to show them here."), e.append(i, a);
	let o = `aa-heading-${crypto.randomUUID()}`, s = 0, c = "";
	return () => {
		let e = t().flatMap((e, t) => {
			if (e.kind !== "heading") return [];
			let r = Bt(e).filter((e) => e.kind === "text").map((t) => e.source.slice(t.from, t.to)).join("").trim();
			if (!r) return [];
			let i = n.children[t];
			return i ? (i.id ||= `${o}-${s++}`, [{
				index: t,
				text: r,
				level: e.level ?? 1,
				id: i.id
			}]) : [];
		}), l = JSON.stringify(e);
		if (l !== c) {
			c = l;
			let t = Math.min(...e.map((e) => e.level));
			i.replaceChildren(...e.map((e) => {
				let n = document.createElement("a");
				return n.href = `#${e.id}`, n.dataset.depth = String(e.level - t), n.textContent = e.text, n.addEventListener("click", (t) => {
					t.preventDefault(), t.stopPropagation(), r(e.index);
				}), n;
			})), a.hidden = !!e.length;
		}
		i.refresh?.();
	};
}
//#endregion
//#region node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/directives/if-defined.js
var $ = (e) => e ?? Z, Cl = [
	0,
	0,
	0,
	0
], wl = (e, t) => {
	let n = (e) => e.slice(0, 3).map((e) => e <= .04045 ? e / 12.92 : ((e + .055) / 1.055) ** 2.4).reduce((e, t, n) => e + t * [
		.2126,
		.7152,
		.0722
	][n], 0), [r, i] = [n(e), n(t)].sort((e, t) => t - e);
	return (r + .05) / (i + .05);
};
function Tl(e, t) {
	let n = e[3] + t[3] * (1 - e[3]);
	return n ? [...[
		0,
		1,
		2
	].map((r) => (e[r] * e[3] + t[r] * t[3] * (1 - e[3])) / n), n] : [...Cl];
}
function El(e) {
	return e.assignedSlot ?? e.parentElement ?? e.getRootNode().host ?? null;
}
function Dl(e) {
	let t = /* @__PURE__ */ new Map(), n;
	return (r) => {
		if (t.has(r)) return t.get(r);
		let i = null;
		r === "transparent" && (i = [...Cl]);
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
var Ol = class {
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
		for (let e = this.host; e; e = El(e)) this.observer.observe(e, {
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
		let e = this.host.ownerDocument.defaultView, t = Dl(this.host.ownerDocument);
		for (let n of this.controls()) {
			n.style.removeProperty("--_ds-choice-ink");
			let r = [
				0,
				0,
				0,
				0
			];
			for (let i = n; i && r[3] < 1; i = El(i)) {
				let n = t(e.getComputedStyle(i).backgroundColor);
				n && (r = Tl(r, n));
			}
			if (r[3] < 1) continue;
			let i = t(e.getComputedStyle(n).color);
			i && wl(Tl(i, r), r) >= 4.5 || n.style.setProperty("--_ds-choice-ink", wl([
				0,
				0,
				0,
				1
			], r) >= wl([
				1,
				1,
				1,
				1
			], r) ? "#000000" : "#ffffff");
		}
	}
}, kl = class extends No {
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
}, Al = "[data-ds-shape=square],:host([data-ds-shape=square]){--ds-corner-size:0px;--ds-corner-shape:round;--ds-button-inset:.5px}[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:4px;--ds-corner-shape:round;--ds-button-inset:2.5px}[data-ds-shape=circular],:host([data-ds-shape=circular]){--ds-corner-size:999px;--ds-corner-shape:round;--ds-button-inset:5px}@supports (corner-shape:squircle){[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:8px;--ds-corner-shape:squircle}}:root,:host,:where([data-ds-surface]){--ds-unit:calc(var(--ds-1,20px) * var(--ds-sf,1));--ds-control-height:calc(var(--ds-control-size,var(--ds-08,16px)) * var(--ds-sf,1));--ds-row-height:calc(var(--ds-row-size,var(--ds-1,20px)) * var(--ds-sf,1));--ds-type-size-default:calc(var(--ds-text-size,14px) * var(--ds-sf,1));--ds-type-size-small:calc(var(--ds-small-text-size,10px) * var(--ds-sf,1));--ds-type-size-heading:calc(var(--ds-heading-text-size,13px) * var(--ds-sf,1));--ds-type-size-display:calc(var(--ds-display-text-size,20px) * var(--ds-sf,1));--ds-type-lineheight-default:calc(var(--ds-text-leading,16px) * var(--ds-sf,1));--ds-type-letterspacing-default:calc(var(--ds-text-tracking,-.3px) * var(--ds-sf,1));--ds-radius:calc(var(--ds-corner-size,4px) * var(--ds-sf,1));--ds-radius-card:calc(var(--ds-card-corner-size,4px) * var(--ds-sf,1))}:host([control=host]),:host([control=slotted]) ::slotted(:is(button,a)){box-sizing:border-box!important;align-items:center!important;justify-content:var(--ds-button-align,flex-start)!important;gap:var(--ds-button-gap,calc(4px * var(--ds-sf)))!important;min-width:0!important;max-width:100%!important;height:var(--ds-button-height,var(--_button-height,var(--ds-control-height)))!important;padding:var(--ds-button-padding,0)!important;border-radius:var(--_button-radius,var(--ds-radius))!important;corner-shape:var(--ds-corner-shape,round)!important;background:var(--ds-button-background,transparent)!important;color:var(--ds-button-color,var(--ds-button-text-color))!important;font-family:\"Inter Arrows\", var(--ds-typeface-regular)!important;font-feature-settings:var(--ds-font-features)!important;font-size:var(--_button-font-size,var(--ds-type-size-default))!important;font-weight:var(--ds-type-weight-default)!important;line-height:var(--ds-type-lineheight-default)!important;letter-spacing:var(--ds-type-letterspacing-default)!important;white-space:nowrap!important;cursor:pointer!important;-webkit-user-select:none!important;user-select:none!important;-webkit-tap-highlight-color:transparent!important;outline:none!important;transition:opacity .12s!important;display:inline-flex!important}:host([control=host]) ::slotted(*){flex:none!important}:host([fit][control=slotted]) ::slotted(:is(button,a)){width:100%!important;min-width:var(--ds-button-min-width,0px)!important;justify-content:var(--ds-button-align,flex-start)!important}:host([control=host][primary]),:host([control=slotted][primary]){--ds-button-padding:0 var(--_button-padding,calc(var(--ds-button-inset,4px) * var(--ds-sf)));--ds-button-background:var(--ds-button-primary-fill,var(--ds-button-background-color-primary));--ds-button-color:var(--ds-button-primary-text,var(--ds-button-text-color-on-accent))}:host([control=host][secondary]),:host([control=slotted][secondary]){--ds-button-padding:0 var(--_button-padding,calc(var(--ds-button-inset,4px) * var(--ds-sf)));--ds-button-background:var(--ds-button-secondary-fill,var(--ds-button-background-color-secondary))}:host([control=host][secondary]:hover:not([disabled])),:host([control=slotted][secondary]:hover:not([disabled])){--ds-button-background:var(--ds-fill-hover)}:host([control=host][active]),:host([control=slotted][active]){--ds-button-background:var(--ds-fill)}:host([control=host][role=tab]),:host([control=host][choice]),:host([control=slotted][choice]){--ds-button-padding:0 calc(4px * var(--ds-sf));--ds-button-color:var(--ds-text-color-muted)}:host([control=host][role=tab]:hover:not([disabled])),:host([control=host][choice]:hover:not([disabled])),:host([control=slotted][choice]:hover:not([disabled])){--ds-button-background:color-mix(in srgb, var(--ds-fill) 72%, transparent);--ds-button-color:var(--ds-text-color)}:host([control=host][role=tab][active]),:host([control=host][role=tab][active]:hover:not([disabled])),:host([control=host][choice][active]),:host([control=host][choice][active]:hover:not([disabled])),:host([control=slotted][choice][active]),:host([control=slotted][choice][active]:hover:not([disabled])){--ds-button-background:var(--ds-fill);--ds-button-color:var(--ds-text-color)}:host([control=host]) ::slotted([slot=icon]){width:var(--ds-control-height)!important;height:var(--ds-control-height)!important;justify-content:center!important;align-items:center!important;display:inline-flex!important}:host([control=host]) ::slotted([slot=trailing]){color:var(--ds-text-color-muted)!important;font-variant-numeric:tabular-nums!important}:host([control=host][icon]),:host([control=slotted][icon]){width:var(--ds-button-height,var(--ds-control-height))!important;height:var(--ds-button-height,var(--ds-control-height))!important;color:var(--ds-button-color,var(--ds-text-color-muted))!important;justify-content:center!important;padding:0!important}:host([control=host][icon]:hover:not([disabled])){--ds-button-color:var(--ds-text-color)}:host([control=host][role=option]),:host([control=host][role=menuitem]),:host([control=host][role=menuitemradio]),:host([control=host][role=menuitemcheckbox]){--ds-button-height:auto;--ds-button-padding:calc(4px * var(--ds-sf)) calc(6px * var(--ds-sf));width:var(--ds-button-width,100%)!important;min-height:var(--ds-row-height)!important;border-radius:var(--ds-radius)!important}:host([control=host][role=option]:hover),:host([control=host][role=menuitem]:hover),:host([control=host][role=menuitemradio]:hover),:host([control=host][role=menuitemcheckbox]:hover),:host([control=host][role=option]:focus-visible),:host([control=host][role=menuitem]:focus-visible){--ds-button-background:var(--ds-fill);outline:none!important}:host([control=host][role=option][active]){--ds-button-background:var(--ds-fill)}:host([control=host]:focus-visible),:host([control=slotted]) ::slotted(:is(button,a):focus-visible){outline:2px solid var(--ds-focus-ring)!important;outline-offset:1px!important}:host([control=host][disabled]),:host([control=slotted]) ::slotted(:is(button:disabled,a[aria-disabled=true])){cursor:default!important;opacity:.5!important;pointer-events:none!important}:host([control=slotted]) ::slotted(:is(button,a)){appearance:none!important;box-sizing:border-box!important;width:100%!important;min-height:var(--ds-button-height,var(--_button-height,var(--ds-control-height)))!important;max-height:var(--ds-button-height,var(--_button-height,var(--ds-control-height)))!important;box-shadow:none!important;text-align:start!important;text-transform:none!important;text-overflow:clip!important;border:0!important;margin:0!important;text-decoration:none!important;overflow:hidden!important}:host([control=slotted][icon]) ::slotted(:is(button,a)){justify-content:center!important}:host([control=slotted]){min-height:var(--ds-row-height);vertical-align:bottom;width:var(--ds-button-width,var(--_button-inline-size,max-content));align-items:flex-end;overflow:visible}:host([control=slotted][icon]){width:max(var(--ds-row-height), var(--ds-button-height,var(--ds-control-height)))!important;height:max(var(--ds-row-height), var(--ds-button-height,var(--ds-control-height)))!important;justify-content:flex-start!important}:host([control=slotted][icon]) ::slotted(:is(button,a)){width:var(--ds-button-height,var(--ds-control-height))!important}:host([control=slotted][fixed]){width:var(--ds-button-width,calc(4 * var(--ds-unit)))}:host([control=slotted][wide]){width:var(--ds-button-width,calc(8 * var(--ds-unit)))}:host([control=slotted][fit]){width:max-content}:host([control=host][danger]),:host([control=slotted][danger]){--ds-button-color:var(--ds-danger-color,var(--ds-tuned-red))}:host([hidden]){display:none!important}:host([menu-item]){--ds-button-height:var(--ds-row-height);--ds-button-align:flex-start;--ds-button-padding:0 calc(4px * var(--ds-sf));flex:none;width:100%}:host([menu-item][control=host]),:host([menu-item][control=slotted]) ::slotted(:is(button,a)){align-items:flex-end!important}:host([menu-item]:is(:hover,:focus-within):not([disabled])){--ds-button-background:var(--ds-fill)}:host([menu-item][control=slotted]) ::slotted([aria-checked=true]){box-shadow:inset 0 0 0 1px var(--ds-focus-ring)!important}:host([control=host][paper]),:host([control=slotted][paper]) ::slotted(:is(button,a)){border-start-start-radius:var(--ds-radius)!important;border-start-end-radius:var(--ds-radius)!important;border-end-end-radius:0!important;border-end-start-radius:0!important;align-items:flex-end!important}:host([control=host][segment]){border-radius:0!important}:host([control=host]:is([segment=first],[segment=only])){border-start-start-radius:var(--ds-radius)!important;border-end-start-radius:var(--ds-radius)!important}:host([control=host]:is([segment=last],[segment=only])){border-start-end-radius:var(--ds-radius)!important;border-end-end-radius:var(--ds-radius)!important}:host([control=host]:not([icon]):not([split]):not([menu-item])){min-width:var(--ds-button-min-width,max-content)!important;min-width:var(--ds-button-min-width,calc-size(max-content, round(up, size, var(--ds-unit))))!important}:host([control=slotted]) ::slotted(:is(button,a)){min-width:max-content!important;overflow:visible!important}", jl = ":host{vertical-align:bottom;min-width:0;width:var(--ds-button-width,var(--_button-inline-size,max-content));--_button-size:var(--ds-button-size);--_button-height:calc(var(--_button-size) * var(--ds-sf));--_button-corner-size:var(--ds-button-corner-size);--_button-radius:calc(var(--_button-corner-size) * var(--ds-sf));--_button-text-size:var(--ds-button-text-size);--_button-font-size:calc(var(--_button-text-size) * var(--ds-sf));--_button-padding-size:var(--ds-button-padding-size);--_button-padding:calc(var(--_button-padding-size) * var(--ds-sf));--_button-inline-size:var(--ds-button-inline-size);flex:none;max-width:100%;display:inline-flex;overflow:visible}:host(:is([icon],[square],[split],[menu-item],[role=option],[role^=menuitem],[role=tab],[choice],[segment],[paper])){--_button-height:initial;--_button-radius:initial;--_button-font-size:initial;--_button-padding:initial;--_button-inline-size:initial}:host([fixed]){width:var(--ds-button-width,calc(4 * var(--ds-unit)))}:host([wide]){width:var(--ds-button-width,calc(8 * var(--ds-unit)))}:host([fit]){flex:none;width:max-content}:host([fit]) :is(button,a){width:100%;min-width:var(--ds-button-min-width,0px);justify-content:var(--ds-button-align,flex-start);flex:none}:host([fit]) :is(button,a) ds-text,:host([fit]) :is(button,a) ::slotted(*){flex:none;width:max-content}:is(button,a){box-sizing:border-box;max-height:var(--_button-height,var(--ds-control-height));height:var(--_button-height,var(--ds-control-height));min-height:var(--_button-height,var(--ds-control-height));border-radius:var(--_button-radius,var(--ds-radius));corner-shape:var(--ds-corner-shape,round);cursor:pointer;width:100%;min-width:0;max-width:100%;padding:var(--ds-text-tab-padding,0);color:var(--button-color,var(--button-text-color));font-family:\"Inter Arrows\", var(--ds-typeface-regular);font-size:var(--_button-font-size,var(--ds-type-size-default));line-height:var(--ds-type-lineheight-default);letter-spacing:var(--ds-type-letterspacing-default);-webkit-tap-highlight-color:transparent;white-space:nowrap;text-overflow:clip;background-color:#0000;border:none;justify-content:flex-start;align-items:center;text-decoration:none;display:inline-flex;overflow:clip visible}:is(button,a) ds-text,:is(button,a) ::slotted(*){text-overflow:clip;white-space:nowrap;text-align:left;max-width:100%;color:inherit;justify-content:flex-start;overflow:clip visible}:is(button,a) ds-text{--ds-type-size-default:var(--_button-font-size,calc(var(--ds-text-size,14px) * var(--ds-sf,1)))}:is(button,a)[primary]{background-color:var(--ds-button-primary-fill,var(--accent-color));color:var(--ds-button-primary-text,var(--button-text-color-on-light,var(--black)));font-family:\"Inter Arrows\", var(--ds-typeface-regular);padding:0 var(--_button-padding,calc(var(--ds-button-inset,4px) * var(--ds-sf)));text-decoration-line:none}:is(button,a)[secondary]{background-color:var(--ds-button-secondary-fill,var(--button-background-color-secondary));color:var(--ds-button-color,var(--ds-button-text-color));font-family:\"Inter Arrows\", var(--ds-typeface-regular);padding:0 var(--_button-padding,calc(var(--ds-button-inset,4px) * var(--ds-sf)))}:host(:is([menu-item],[role=option],[role^=menuitem])) :is(button,a){height:var(--ds-button-height,var(--ds-row-height));min-height:var(--ds-button-height,var(--ds-row-height));max-height:var(--ds-button-height,var(--ds-row-height));align-items:flex-end;justify-content:var(--ds-button-align,flex-start);padding:0 calc(var(--ds-button-inset,4px) * var(--ds-sf))}:host([danger]) :is(button,a){color:var(--ds-danger-color,var(--ds-tuned-red))}:is(button:disabled,a[aria-disabled=true]){cursor:default;opacity:.5}.loading{opacity:.7}:host([icon]){width:var(--ds-control-height);height:var(--ds-control-height);flex:none}:host([icon]) :is(button,a){width:var(--ds-control-height);justify-content:center;padding:0!important}:host([icon]) ::slotted(ds-icon){width:var(--ds-control-height);height:var(--ds-control-height);flex:none}:host([square]){width:var(--ds-control-height);flex:none}:host([square]) :is(button,a){width:var(--ds-control-height);justify-content:center;padding:0!important}:host(:is([primary],[secondary]):not([icon])) ::slotted(ds-icon:nth-last-child(1 of :not(.c9y-native-text)):not(:nth-child(1 of :not(.c9y-native-text)))){margin-inline-end:calc(-4px * var(--ds-sf))}:host(:is([primary],[secondary]):not([icon])) ::slotted(ds-icon:nth-child(1 of :not(.c9y-native-text)):not(:nth-last-child(1 of :not(.c9y-native-text)))){margin-inline-start:calc(-4px * var(--ds-sf))}:host([paper]) :is(button,a){height:var(--ds-row-height);min-height:var(--ds-row-height);max-height:var(--ds-row-height);padding:0 calc(10px * var(--ds-sf));border-radius:var(--ds-radius) var(--ds-radius) 0 0;background-color:var(--ds-button-background,transparent);color:var(--ds-button-color,var(--button-text-color));align-items:flex-end}:host([segment]) :is(button,a){border-radius:0!important}:host(:is([segment=first],[segment=only])) :is(button,a){border-start-start-radius:var(--ds-radius)!important;border-end-start-radius:var(--ds-radius)!important}:host(:is([segment=last],[segment=only])) :is(button,a){border-start-end-radius:var(--ds-radius)!important;border-end-end-radius:var(--ds-radius)!important}:host(:not([icon]):not([split]):not([menu-item])){min-width:max-content;min-width:calc-size(max-content, round(up, size, var(--ds-unit)))}:host(:not([menu-item])) :is(button,a),:host(:not([menu-item])) :is(button,a) ds-text,:host(:not([menu-item])) :is(button,a) ::slotted(*){text-overflow:clip;overflow:visible;mask-image:none}:host([segment][active]) :is(button,a){color:var(--_ds-choice-ink,var(--ds-button-color,var(--button-text-color)))}", Ml = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, Nl = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), Pl = class {
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
}, Fl = class extends Pl {
	constructor(e) {
		if (super(e), this.it = Z, e.type !== Ml.CHILD) throw Error(this.constructor.directiveName + "() can only be used in child bindings");
	}
	render(e) {
		if (e === Z || e == null) return this._t = void 0, this.it = e;
		if (e === ho) return e;
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
Fl.directiveName = "unsafeHTML", Fl.resultType = 1;
var Il = Nl(Fl), Ll = ":host{--ds-icon-box:calc(var(--ds-icon-size,14px) * var(--ds-sf));width:var(--ds-icon-box);height:calc(var(--ds-icon-box) / var(--ds-icon-ratio,1));color:var(--ds-icon-color,currentColor);background:0 0;flex:none;justify-content:center;align-items:center;display:inline-flex}:host([hidden]){display:none!important}:host([size=small]){--ds-icon-size:12px}:host([size=large]){--ds-icon-size:16px}:host([variant=primary]){color:var(--ds-button-text-color-on-accent);background:var(--ds-accent-color)}:host([variant=secondary]){background:var(--ds-fill)}svg,::slotted(svg),::slotted(img){width:100%;height:100%;display:block}::slotted(img){object-fit:contain;border-radius:var(--ds-icon-radius,0px)}:host([size=app]){--ds-icon-size:40px}:host([size=app-large]){--ds-icon-size:60px}", Rl = {
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
}, zl = /* @__PURE__ */ "1x.1xdots.1xgrid.1xlines.2x.2xdots.2xgrid.2xgrid-alt.2xgrid-alt-2.2xgrid-alt-3.2xlines.4x4.airtable.android.app-airtable.app-asana.app-confluence.app-dropbox.app-figma.app-gmail.app-google-calendar.app-google-drive.app-google-sheets.app-jira.app-notion.app-outlook.app-slack.archive-alt.arrange-archive.arrange-check.arrange-chevron.arrange-connect.arrange-draft.arrange-dropdown.arrange-home.arrange-link.arrange-menu.arrange-more.arrange-page.arrange-plus.arrange-site.attach.audio.avatar.badge-bands.badge-bands-3d.badge-blue-fan.badge-blue-fan-3d.badge-bricks.badge-bricks-3d.badge-broken-stripes.badge-broken-stripes-3d.badge-checker.badge-checker-3d.badge-diamond.badge-diamond-3d.badge-fan.badge-fan-3d.badge-fan-dark.badge-fan-dark-3d.badge-halves.badge-halves-3d.badge-halves-green.badge-halves-green-3d.badge-red.badge-red-3d.badge-red-blue-bricks.badge-red-blue-bricks-3d.badge-round-fan.badge-round-fan-3d.badge-shard.badge-shard-3d.badge-split-circle.badge-split-circle-3d.badge-tall-bricks.badge-tall-bricks-3d.badge-weave.badge-weave-3d.bag-alt.bank.banknote.block-accordion.block-banner.block-breadcrumbs.block-button.block-divider.block-forms.block-group.block-heading.block-image.block-logo-marquee.block-page-progress.block-section.block-table.block-tabs.block-text.bold.bolt.book.book-alt.box.briefcase.building.bullet.callout.car.card.cart.categories.check-alt.chevron-down.chevron-left.chevron-right.chevron-up.chrome.cloud.code.code-block.coffee.coins.color.column.comment.connect.content.cursor.curve.default.dictate.dislike.divider.dot-bank.dot-banknote.dot-banknotes.dot-card.dot-coin.dot-coins.dot-happy.dot-neutral.dot-receipt.dot-sad.dot-safe.dot-transfer.dot-wallet.download.drive.drop.dropbox.dumbbell.edge-brand.equation.exercise.eye.eye-off.facebook.figma.firefox.flame.flip.food.form.fuel.fullscreen.fullscreen-exit.gallery.game.gift.github.globe.group.group-alt.group-alt-2.h1.h2.h3.handle.head.health.heart.help.help-alt.history.home-alt.icon.image.in.income.indent.info.instagram.italic.item.jpbank.key.keyboard.life.like.link.linkedin.linux.list-line.lock-filled.logo-marquee.loom.map.material.medical.mention.menu.milestone.milestone-planned.minimize.minimize-alt.minus.money.moon.move.music.music-alt.navigation-check.network.note-alt.note-alt-2.note-lines.notifications.notion.numbered.offline.open-alt.open-source.opera.outdent.page.page-18.page-alt.page-note.panel.password-see.password-unsee.pattern-call-to-action.pattern-card.pattern-feature.pattern-hero.pause.paw.pdf.people.percent.phone.pill.plane.play-alt.postal.prediction.present.priority-high.priority-low.priority-medium.project.quote.reaction.receipt.redo.refresh.refund.relationships.repeat.repeat-small.rewind.rewind-30.rewind-30-alt.rotate.row.safari.safe.scaling.school.school-alt.search-30.see-30.settings.shield.shield-alt.shirt.shop.sign-in.sign-out.slack.slash.sparkle.star-alt.star-alt-2.star-outline.start.status.status-alt.status-filled.stop.strike.sun.system.table.tabs.tag.templates.text.ticket.title.title-struck.titlestyle.todo.toggle.train.transfer.tv.underline.undo.ungroup.unhead.unicon.untitle.up-right.upload.video.vimeo.wallet.warning.wifi.window.windows.work.wrench.x-brand.youtube".split("."), Bl = { ...Rl }, Vl = new Set(zl), Hl = !1, Ul;
function Wl() {
	return Ul ??= import("./aa-icons-extra.js").then(({ icons: e }) => {
		Object.assign(Bl, e), Hl = !0;
	}).catch((e) => {
		throw Ul = void 0, e;
	});
}
var Gl = /(fill|stroke)=("|')(#1E1E1E|#2A2A2A|#000000|#000|black)\2/gi, Kl = /(?:fill|stroke)=("|')([^"']+)\1/gi, ql = /^(none|currentColor|white|#fff|#ffffff|url\(.*\))$/i, Jl = /^(#1E1E1E|#2A2A2A|#000000|#000|black)$/i, Yl = /* @__PURE__ */ new Map();
function Xl(e) {
	for (let [, , t] of e.matchAll(Kl)) if (!ql.test(t) && !Jl.test(t)) return !0;
	return !1;
}
function Zl(e) {
	let t = Yl.get(e);
	if (t !== void 0) return t;
	let n = Xl(e) ? e : e.replace(Gl, "$1=\"currentColor\"");
	return Yl.set(e, n), n;
}
Fo("ds-icon", class extends No {
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
	static styles = Oa(Ll);
	render() {
		if (!this._type) return X`<slot></slot>`;
		let e = Bl[this._type.toLowerCase()];
		if (e) return X`${Il(this._type.startsWith("app-") ? e : Zl(e))}`;
		if (!Hl && Vl.has(this._type.toLowerCase()) && !this._iconsReady && this._failedType !== this._type) {
			let e = this._type;
			this._iconsReady = Wl().then(() => {
				this._failedType = void 0, this.requestUpdate();
			}).catch(() => {
				this._failedType = e;
			}).finally(() => {
				this._iconsReady = void 0;
			});
		}
		return X`<slot></slot>`;
	}
});
//#endregion
//#region src/vendor/ds1/2-core/button-split.ts
function Ql(e) {
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
function $l(e, t) {
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
function eu(e, t) {
	let n = [...e.renderRoot.querySelectorAll("button:not(:disabled)")];
	(n.find((e) => e.getAttribute("aria-pressed") === "true") ?? n[0])?.focus(t);
}
function tu(e) {
	let t = (t) => X`<ds-text .text=${t.label} .literal=${e.literal}></ds-text>`;
	return X`${Ql(e).map((n) => X`<button
      type="button" part="segment" value=${n.value}
      aria-pressed=${e.actions ? Z : String(n.value === e.value)}
      aria-label=${n.icon && !e.labelled ? e.literal ? n.label : hl(n.label) : Z}
      ?data-icon=${!!n.icon && !e.labelled}
      ?data-icon-words=${!!n.icon && !!e.labelled}
      ?data-short=${n.label.length === 1}
      ?disabled=${e.splitDisabled || n.disabled}
      @click=${() => $l(e, n)}
    >${n.icon ? e.labelled ? X`<ds-icon type=${n.icon} aria-hidden="true"></ds-icon>${t(n)}` : X`<ds-icon type=${n.icon} aria-hidden="true"></ds-icon>` : t(n)}</button>`)}`;
}
//#endregion
//#region src/vendor/ds1/2-core/styles/ds-button-split.css?inline
var nu = ":host([split]){max-width:none;height:var(--ds-control-height);vertical-align:bottom;flex:none;align-items:stretch;gap:1px;display:inline-flex;overflow:visible}:host([split][hidden]){display:none}:host([split]) button{appearance:none;box-sizing:border-box;width:auto;max-width:none;height:var(--ds-control-height);padding:0 calc(5px * var(--ds-sf));corner-shape:var(--ds-corner-shape,round);background:var(--ds-button-background-color-secondary);color:var(--ds-text-color-muted);font-family:\"Inter Arrows\", var(--ds-typeface-regular);font-feature-settings:var(--ds-font-features);font-size:var(--ds-type-size-default);font-weight:var(--ds-type-weight-default);line-height:var(--ds-control-height);letter-spacing:var(--ds-type-letterspacing-default);white-space:nowrap;cursor:pointer;-webkit-tap-highlight-color:transparent;border:0;border-radius:0;flex:none;justify-content:center;align-items:center;margin:0;display:inline-flex}:host([split]) button:first-child{border-start-start-radius:var(--ds-radius);border-end-start-radius:var(--ds-radius)}:host([split]) button:last-child{border-start-end-radius:var(--ds-radius);border-end-end-radius:var(--ds-radius)}:host([split]) button[data-icon]{width:var(--ds-control-height);padding:0}:host([split]) button[data-icon-words]{gap:0;padding-inline-start:0}:host([split]) ds-icon{--ds-icon-size:16px;color:inherit}:host([split]) ds-text{color:inherit}:host([split][compact]) button:not([data-icon],[data-short]){--ds-typeface-regular:var(--ds-typeface-compressed);padding-inline:calc(3px * var(--ds-sf))}:host([split][compact]) button[data-short]{width:var(--ds-control-height);padding:0}:host([split]) button:hover:not(:disabled,[aria-pressed=true]){color:var(--ds-text-color)}:host([split]) button[aria-pressed=true]{background:var(--ds-accent-color);color:var(--_ds-choice-ink,var(--ds-button-text-color-on-accent));cursor:default}:host([split]) button:disabled{cursor:default;opacity:.5}:host([split][plain]) button,:host([split][plain]) button[aria-pressed=true]{background:0 0}:host([split][plain]) button[aria-pressed=true]{color:var(--ds-text-color)}:host([split]) button:focus-visible{outline-offset:-2px;outline:1px solid}";
Fo("ds-button", class extends kl {
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
		Oa(jl),
		Oa(Al),
		Oa(nu)
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
		this.split && !this.plain && !this.actions || this.hasAttribute("segment") && this.active ? (this.choiceContrast ??= new Ol(this, () => [...this.renderRoot.querySelectorAll(this.split ? "button[aria-pressed=\"true\"]" : "[part=\"control\"]")]), this.choiceContrast.connect(), this.choiceContrast.resolve()) : (this.choiceContrast?.disconnect(), this.renderRoot.querySelectorAll("[style]").forEach((e) => e.style.removeProperty("--_ds-choice-ink"))), this.syncSplitRole(), this.syncSlottedControl();
	}
	focus(e) {
		this.split ? eu(this, e) : this.control === "slotted" ? this.querySelector(":scope > :is(button, a)")?.focus(e) : this.hostControl ? super.focus(e) : this.shadowRoot?.querySelector("[part=\"control\"]")?.focus(e);
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
		if (this.split) return tu(this);
		let e = this.text;
		if (this.control === "slotted") return X`<slot @slotchange=${this.syncSlottedControl}></slot>`;
		if (this.hostControl) return X`<slot name="icon"></slot><slot></slot><slot name="trailing"></slot>`;
		let t = e ? X`<ds-text .text=${this.text}></ds-text>` : X`<slot @slotchange=${this._reflectIcon}></slot>`;
		if (this.href) {
			let e = this.splitDisabled, n = this.target || (this.blank ? "_blank" : ""), r = this.rel || (n === "_blank" ? "noopener noreferrer" : "");
			return X`<a
        part="control"
        ?primary=${this.primary}
        ?secondary=${this.secondary}
        href=${$(e ? void 0 : this.href)}
        target=${$(e || !n ? void 0 : n)}
        rel=${$(e || !r ? void 0 : r)}
        role=${$(e ? "link" : void 0)}
        aria-disabled=${$(e ? "true" : void 0)}
        aria-label=${$(this.label || void 0)}
        @click=${this._handleClick}
      >${t}</a>`;
		}
		return X`
      <button
        part="control"
        type="button"
        ?primary=${this.primary}
        ?secondary=${this.secondary}
        ?disabled=${this.splitDisabled}
        aria-label=${$(this.label || void 0)}
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
var { I: ru } = ko, iu = (e) => e.strings === void 0, au = {}, ou = (e, t = au) => e._$AH = t, su = Nl(class extends Pl {
	constructor(e) {
		if (super(e), e.type !== Ml.PROPERTY && e.type !== Ml.ATTRIBUTE && e.type !== Ml.BOOLEAN_ATTRIBUTE) throw Error("The `live` directive is not allowed on child or event bindings");
		if (!iu(e)) throw Error("`live` bindings can only contain a single expression");
	}
	render(e) {
		return e;
	}
	update(e, [t]) {
		if (t === ho || t === Z) return t;
		let n = e.element, r = e.name;
		if (e.type === Ml.PROPERTY) {
			if (t === n[r]) return ho;
		} else if (e.type === Ml.BOOLEAN_ATTRIBUTE) {
			if (!!t === n.hasAttribute(r)) return ho;
		} else if (e.type === Ml.ATTRIBUTE && n.getAttribute(r) === t + "") return ho;
		return ou(e), t;
	}
}), cu = "important", lu = " !" + cu, uu = Nl(class extends Pl {
	constructor(e) {
		if (super(e), e.type !== Ml.ATTRIBUTE || e.name !== "style" || e.strings?.length > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
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
				let t = typeof r == "string" && r.endsWith(lu);
				e.includes("-") || t ? n.setProperty(e, t ? r.slice(0, -11) : r, t ? cu : "") : n[e] = r;
			}
		}
		return ho;
	}
}), du = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='16'%20viewBox='0%200%2016%2016'%3e%3csvg%20preserveAspectRatio='none'%20overflow='visible'%20style='display:%20block;'%20width='16'%20height='16'%20viewBox='0%200%2014.0059%208.5918'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20id='Group%2090'%3e%3cpath%20id='Vector%20(Stroke)'%20d='M7.08496%201.43051e-06C9.10892%201.43051e-06%2010.8032%201.03732%2011.9648%202.02832C12.5501%202.52762%2013.0133%203.02575%2013.3301%203.39942C13.4887%203.58653%2013.6115%203.74347%2013.6953%203.85449C13.7372%203.90995%2013.7698%203.95445%2013.792%203.98535C13.8029%204.00061%2013.8114%204.01295%2013.8174%204.02149C13.8202%204.02555%2013.8225%204.02881%2013.8242%204.03125C13.8249%204.03228%2013.8257%204.03346%2013.8262%204.03418L13.8271%204.03516C13.8273%204.03531%2013.8278%204.03638%2013.4492%204.2959L13.8271%204.55567L13.8262%204.55664C13.8256%204.55744%2013.8251%204.55929%2013.8242%204.56055C13.8225%204.563%2013.8202%204.56626%2013.8174%204.57031C13.8114%204.57887%2013.803%204.59115%2013.792%204.60645C13.7698%204.63736%2013.7372%204.68181%2013.6953%204.73731C13.6115%204.84834%2013.4887%205.00525%2013.3301%205.19238C13.0133%205.56604%2012.5501%206.06419%2011.9648%206.56348C10.8032%207.55446%209.10889%208.5918%207.08496%208.5918C5.06326%208.5918%203.33153%207.55649%202.13379%206.56836C1.53011%206.07032%201.04876%205.57301%200.717773%205.2002C0.55201%205.01348%200.422971%204.85678%200.334961%204.7461C0.291015%204.69082%200.2567%204.64695%200.233398%204.61621C0.221828%204.60095%200.213338%204.58859%200.207031%204.58008C0.203926%204.57589%200.201023%204.57277%200.199219%204.57031C0.198435%204.56924%200.197795%204.56811%200.197266%204.56738L0.196289%204.56641V4.56543L0%204.2959L0.196289%204.02637V4.02539L0.197266%204.02442C0.197805%204.02368%200.198405%204.0226%200.199219%204.02149C0.201027%204.01902%200.203896%204.01595%200.207031%204.01172C0.21333%204.00322%200.221826%203.99086%200.233398%203.97559C0.256689%203.94486%200.291044%203.90094%200.334961%203.8457C0.422971%203.73501%200.55201%203.57832%200.717773%203.3916C1.04875%203.0188%201.5301%202.52149%202.13379%202.02344C3.33153%201.03531%205.06326%203.87222e-06%207.08496%201.43051e-06ZM7.08496%200.91797C5.37308%200.917973%203.84542%201.80115%202.71777%202.73145C2.15914%203.19234%201.71191%203.65449%201.4043%204.00098C1.30562%204.11212%201.22362%204.21306%201.15527%204.2959C1.22361%204.37872%201.30565%204.47971%201.4043%204.59082C1.71192%204.93731%202.15914%205.39947%202.71777%205.86035C3.84542%206.79065%205.37308%207.67383%207.08496%207.67383C8.79447%207.67383%2010.2821%206.7926%2011.3691%205.86524C11.9082%205.40533%2012.3368%204.94438%2012.6299%204.59863C12.7272%204.48383%2012.807%204.38024%2012.873%204.2959C12.807%204.21156%2012.7272%204.10798%2012.6299%203.99317C12.3368%203.64742%2011.9082%203.18647%2011.3691%202.72656C10.2821%201.79918%208.79451%200.91797%207.08496%200.91797ZM14.0059%204.2959L13.8281%204.55567L13.4492%204.2959L13.8281%204.03613L14.0059%204.2959Z'%20fill='currentColor'/%3e%3cpath%20id='Ellipse%2040'%20d='M7.16119%201.9635C8.44936%201.9635%209.49404%203.00741%209.4942%204.29554C9.4942%205.5838%208.44946%206.62854%207.16119%206.62854C5.87307%206.62838%204.82916%205.5837%204.82916%204.29554C4.82933%203.00751%205.87317%201.96367%207.16119%201.9635Z'%20fill='currentColor'%20stroke='currentColor'%20stroke-width='0.81'/%3e%3c/g%3e%3c/svg%3e%3c/svg%3e", fu = "data:image/svg+xml,%3csvg%20preserveAspectRatio='none'%20overflow='visible'%20style='display:%20block;'%20width='16'%20height='16'%20viewBox='0%200%2016%2016'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20id='Unsee'%3e%3cg%20id='Vector'%3e%3cpath%20d='M12.4541%2012.789L13.1743%2012.0688L12.6027%2011.4967L12.6%2011.4994L12.0137%2010.9144C11.7332%2011.103%2011.4336%2011.283%2011.1164%2011.4457L11.4068%2011.7363L11.4046%2011.7385L12.4541%2012.789Z'%20fill='currentColor'/%3e%3cpath%20d='M5.96371%206.28858L9.79315%2010.1213C10.0642%209.91923%2010.2966%209.66817%2010.4772%209.38122L6.69735%205.60959C6.41317%205.78931%206.16435%206.01991%205.96371%206.28858Z'%20fill='currentColor'/%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M3.68238%204.00893L3.09583%203.42184L3.79957%202.7181L3.816%202.70167L5.35651%204.24363L6.05746%204.94524L6.712%205.6004L10.4818%209.3738L11.3559%2010.2487L12.0181%2010.9115L12.6027%2011.4967L12.6%2011.4994L12.0137%2010.9144C11.7332%2011.103%2011.4336%2011.283%2011.1164%2011.4457L11.4068%2011.7363L11.4046%2011.7385L11.1136%2011.4472L10.4275%2010.7604L9.79075%2010.1231L5.96207%206.29078L5.08276%205.41064L4.4124%204.73965L3.68238%204.00893ZM12.6382%2010.4584C12.7502%2010.37%2012.8582%2010.2812%2012.9619%2010.1927C13.5472%209.69339%2014.0104%209.19525%2014.3271%208.82159C14.4858%208.63445%2014.6085%208.47754%2014.6924%208.36651C14.7343%208.31101%2014.7669%208.26656%2014.7891%208.23565L14.7965%208.22527L14.8089%208.20741L14.8145%208.19952L14.8213%208.18975C14.8218%208.18905%2014.8222%208.18816%2014.8225%208.18737L14.8232%208.18584L14.8242%208.18487L15.0029%207.9251L14.8252%207.66534L14.4463%207.9251C14.8248%207.66558%2014.8243%207.66451%2014.8242%207.66436L14.8232%207.66338L14.8213%207.66045L14.8145%207.65069C14.8085%207.64215%2014.8%207.62981%2014.7891%207.61456C14.7669%207.58365%2014.7343%207.53915%2014.6924%207.4837C14.6085%207.37267%2014.4858%207.21573%2014.3271%207.02862C14.0104%206.65495%2013.5472%206.15683%2012.9619%205.65752C11.8003%204.66653%2010.106%203.6292%208.08203%203.6292C7.38933%203.6292%206.73067%203.75075%206.11587%203.95029L6.86093%204.69373C7.25481%204.60012%207.6629%204.54717%208.08203%204.54717C9.79158%204.54717%2011.2792%205.42838%2012.3662%206.35577C12.9053%206.81568%2013.3338%207.27662%2013.627%207.62237C13.7119%207.72259%2013.7835%207.81426%2013.8443%207.89203L13.8701%207.9251L13.8442%207.95828C13.7834%208.03604%2013.7119%208.12766%2013.627%208.22784C13.3338%208.57358%2012.9053%209.03453%2012.3662%209.49444C12.2436%209.599%2012.116%209.70298%2011.9835%209.80517L12.6382%2010.4584ZM5.58478%206.99004L9.09135%2010.4996C8.80023%2010.6051%208.48611%2010.6626%208.15857%2010.6626C6.64663%2010.6626%205.42096%209.43698%205.42096%207.92504C5.42096%207.59666%205.47878%207.28179%205.58478%206.99004ZM10.371%2011.7804L9.65051%2011.0593C9.15436%2011.2126%208.62958%2011.303%208.08203%2011.303C6.37015%2011.303%204.84249%2010.4199%203.71484%209.48956C3.15622%209.02867%202.70899%208.56651%202.40137%208.22002C2.31556%208.12337%202.24231%208.03438%202.17972%207.95834L2.15234%207.9251L2.17972%207.89186C2.24231%207.81582%202.31553%207.72686%202.40137%207.63018C2.70898%207.2837%203.15621%206.82154%203.71484%206.36065C3.93564%206.17849%204.17177%205.99815%204.42162%205.82588L3.76309%205.16679C3.53867%205.32681%203.32756%205.49036%203.13086%205.65264C2.52717%206.15069%202.04582%206.648%201.71484%207.02081C1.54908%207.20752%201.42004%207.36422%201.33203%207.47491C1.28811%207.53015%201.25376%207.57406%201.23047%207.60479C1.22314%207.61446%201.21704%207.62297%201.21196%207.63006L1.2041%207.64092C1.20236%207.64328%201.20069%207.64527%201.19925%207.647L1.19629%207.65069L1.19434%207.65362L1.19336%207.65557L0.99707%207.9251L1.19336%208.19561L1.19434%208.19659L1.19629%208.19952L1.19926%208.20322C1.20071%208.20496%201.20238%208.20695%201.2041%208.20928L1.21195%208.22013C1.21704%208.22723%201.22314%208.23575%201.23047%208.24541C1.25377%208.27615%201.28809%208.32002%201.33203%208.3753C1.42004%208.48599%201.54908%208.64268%201.71484%208.8294C2.04583%209.20221%202.52718%209.69952%203.13086%2010.1976C4.3286%2011.1857%206.06033%2012.221%208.08203%2012.221C8.90391%2012.221%209.67144%2012.0499%2010.371%2011.7804ZM10.8048%208.62904C10.8644%208.40441%2010.8962%208.16843%2010.8962%207.92504C10.8962%206.4131%209.6705%205.18743%208.15857%205.18743C7.91309%205.18743%207.67517%205.21974%207.44881%205.28034L10.8048%208.62904ZM9.79315%2010.1213L5.96371%206.28858C6.16435%206.01991%206.41317%205.78931%206.69735%205.60959L10.4772%209.38122C10.2966%209.66817%2010.0642%209.91923%209.79315%2010.1213Z'%20fill='currentColor'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e", pu = "[data-ds-shape=square],:host([data-ds-shape=square]){--ds-corner-size:0px;--ds-corner-shape:round;--ds-button-inset:.5px}[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:4px;--ds-corner-shape:round;--ds-button-inset:2.5px}[data-ds-shape=circular],:host([data-ds-shape=circular]){--ds-corner-size:999px;--ds-corner-shape:round;--ds-button-inset:5px}@supports (corner-shape:squircle){[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:8px;--ds-corner-shape:squircle}}:root,:host,:where([data-ds-surface]){--ds-unit:calc(var(--ds-1,20px) * var(--ds-sf,1));--ds-control-height:calc(var(--ds-control-size,var(--ds-08,16px)) * var(--ds-sf,1));--ds-row-height:calc(var(--ds-row-size,var(--ds-1,20px)) * var(--ds-sf,1));--ds-type-size-default:calc(var(--ds-text-size,14px) * var(--ds-sf,1));--ds-type-size-small:calc(var(--ds-small-text-size,10px) * var(--ds-sf,1));--ds-type-size-heading:calc(var(--ds-heading-text-size,13px) * var(--ds-sf,1));--ds-type-size-display:calc(var(--ds-display-text-size,20px) * var(--ds-sf,1));--ds-type-lineheight-default:calc(var(--ds-text-leading,16px) * var(--ds-sf,1));--ds-type-letterspacing-default:calc(var(--ds-text-tracking,-.3px) * var(--ds-sf,1));--ds-radius:calc(var(--ds-corner-size,4px) * var(--ds-sf,1));--ds-radius-card:calc(var(--ds-card-corner-size,4px) * var(--ds-sf,1))}:host{--_input-size:var(--ds-input-size);--_input-height:calc(var(--_input-size) * var(--ds-sf));--_input-padding-size:var(--ds-input-padding-size);--_input-padding:calc(var(--_input-padding-size) * var(--ds-sf));--_input-corner-size:var(--ds-input-corner-size);--_input-radius:calc(var(--_input-corner-size) * var(--ds-sf));width:100%;display:block}:host([variant=field]){width:var(--ds-input-inline-size,100%)}.input-wrapper{flex-direction:column;gap:0;width:100%;display:flex}label{font-family:\"Inter Arrows\", var(--ds-typeface-regular);font-size:var(--ds-type-size-default);line-height:var(--ds-row-height);color:var(--ds-text-color)}.input-container{align-items:center;width:100%;display:flex;position:relative}:is(input,textarea){background:var(--base-light-grey,#e8e8e8);padding:0 calc(2px * var(--ds-sf,1));font-size:var(--ds-type-size-default);font-family:\"Inter Arrows\", var(--ds-typeface-regular);color:var(--ds-input-color,#2a2a2a);line-height:calc(16px * var(--ds-sf,1));letter-spacing:calc(-.4px * var(--ds-sf,1));height:var(--ds-input-height,calc(16px * var(--ds-sf,1)));box-sizing:border-box;border:none;outline:none;width:100%}:is(input,textarea):focus{opacity:1;color:var(--base-slate,#1e1e1e);outline:none}input{border-radius:var(--ds-input-radius,var(--ds-radius));corner-shape:var(--ds-corner-shape,round)}:is(input,textarea)::placeholder{color:var(--ds-input-placeholder-color,var(--ds-text-color-muted));opacity:1}:is(input,textarea):disabled{cursor:not-allowed;opacity:.5}:is(input,textarea):read-only{background-color:var(--input-readonly-background,#fafafa)}:host([variant=filled]) :is(input,textarea){background-color:var(--input-filled-background,var(--surface-color-secondary,#f5f5f5));border:none;border-bottom:2px solid var(--border-color,#ccc);border-radius:calc(var(--025) * var(--ds-sf,1)) calc(var(--025) * var(--ds-sf,1)) 0 0}:host([variant=filled]) :is(input,textarea):focus{border-bottom-color:var(--accent-color,#007aff);box-shadow:none}:host([variant=outlined]) :is(input,textarea){border:2px solid var(--border-color,#ccc);background-color:#0000}:host([variant=outlined]) :is(input,textarea):focus{border-color:var(--accent-color,#007aff)}.input-wrapper.has-error{grid-template-columns:minmax(0,1fr);grid-auto-rows:minmax(var(--ds-input-control-row,var(--ds-row-height)), auto);align-items:start;display:grid}.error-message{min-width:0;color:var(--ds-danger-color);font-family:\"Inter Arrows\", var(--ds-typeface-regular);font-feature-settings:var(--ds-font-features);font-size:var(--ds-type-size-default);font-weight:var(--ds-type-weight-default);line-height:var(--ds-unit);letter-spacing:var(--ds-type-letterspacing-default);margin:0}.error-message>ds-text{display:block}:host([required]) label:after{content:\" *\";color:var(--ds-danger-color)}:is(input,textarea).has-error{border-color:var(--ds-danger-color)}:is(input,textarea).has-error:focus{box-shadow:0 0 0 2px color-mix(in srgb, var(--ds-danger-color) 20%, transparent)}:host([variant=row]){box-sizing:border-box;padding-top:calc(2px * var(--ds-sf,1));--ds-input-control-row:calc(18px * var(--ds-sf,1))}:host([variant=row]) .input-container,:host([variant=row]) :is(input,textarea){box-sizing:border-box;height:calc(18px * var(--ds-sf,1));min-height:calc(18px * var(--ds-sf,1));max-height:calc(18px * var(--ds-sf,1))}:host([variant=row]) :is(input,textarea){line-height:calc(16px * var(--ds-sf,1));background:var(--ds-input-background);color:var(--ds-input-color);opacity:1;border-radius:0;margin:0;padding-block:0}:host([variant=row]) :is(input,textarea)::placeholder{color:var(--ds-input-placeholder-color);opacity:1}:host([variant=row]) :is(input,textarea):focus{background:var(--ds-input-background);color:var(--ds-input-color);box-shadow:inset 0 0 0 1px var(--ds-accent-color);opacity:1}:host([variant=row]) :is(input,textarea):disabled{opacity:1;background:var(--ds-input-background);color:var(--ds-input-disabled-color);-webkit-text-fill-color:var(--ds-input-disabled-color)}:host([quiet-focus]) :is(input,textarea):focus,:host([quiet-focus]) :is(input,textarea):focus-visible,:host([quiet-focus]) .input-container:focus-within{box-shadow:none!important;outline:none!important}:is(input,textarea).has-reveal{padding-inline-end:calc(24px * var(--ds-sf,1))}.password-visibility{inset-inline-end:0;height:100%;width:calc(24px * var(--ds-sf,1));color:var(--ds-input-reveal-color);cursor:pointer;background:0 0;border:0;place-items:center;padding:0;display:grid;position:absolute;top:0}.password-visibility:focus-visible{outline-offset:-1px;outline:1px solid}.password-visibility:disabled{cursor:default;opacity:.5}.password-visibility span{width:calc(16px * var(--ds-sf,1));height:calc(16px * var(--ds-sf,1));mask:var(--eye-icon) center / 100% 100% no-repeat;background:currentColor;display:block}@supports (corner-shape:squircle){:is(input,textarea){corner-shape:var(--ds-corner-shape,squircle)}}:host([variant=field]) :is(input,textarea),:host([variant=plain]) :is(input,textarea){height:var(--ds-input-height,var(--ds-row-height));padding:var(--ds-input-padding,0 calc(4px * var(--ds-sf)));border:var(--ds-input-border,1px solid var(--ds-border-color));border-radius:var(--ds-input-radius,var(--ds-radius));background:var(--ds-input-field-background,var(--ds-fill));color:var(--ds-text-color);opacity:1;font-size:var(--ds-type-size-default);line-height:var(--ds-type-lineheight-default);letter-spacing:var(--ds-type-letterspacing-default)}:host([variant=field]){--_field-height:var(--ds-input-height,var(--_input-height,var(--ds-control-height)))}:host([variant=field]) .input-container{min-height:var(--ds-row-height);align-items:flex-end}:host([variant=field]) .password-visibility{height:var(--_field-height);top:auto;bottom:0}:host([variant=field]) input{height:var(--_field-height);padding:var(--ds-input-padding,0 var(--_input-padding,calc(4px * var(--ds-sf))));border-radius:var(--ds-input-radius,var(--_input-radius,var(--ds-radius)))}:host([variant=plain]) :is(input,textarea){padding:var(--ds-input-padding,0);background:0 0;border:0;border-radius:0}:host([variant=field]) :is(input,textarea)::placeholder,:host([variant=plain]) :is(input,textarea)::placeholder{color:var(--ds-text-color-muted);opacity:1}:host([variant=field]) :is(input,textarea):focus{outline:1px solid var(--ds-focus-ring);outline-offset:-1px}:host([variant=field]) :is(input,textarea):disabled,:host([variant=plain]) :is(input,textarea):disabled{opacity:.5}:host([variant=field]) :is(input,textarea).has-reveal,:host([variant=plain]) :is(input,textarea).has-reveal{padding-inline-end:calc(24px * var(--ds-sf))}.row-metric{width:0;height:var(--ds-row-height);visibility:hidden;pointer-events:none;position:absolute;overflow:hidden}:host([variant=field]) textarea{border-radius:var(--ds-textarea-radius,calc(4px * var(--ds-sf)));corner-shape:var(--ds-textarea-corner-shape,squircle)}:host([variant]) textarea{height:var(--ds-textarea-height,calc(var(--ds-textarea-rows,3) * var(--ds-row-height)));min-height:var(--ds-row-height);padding:var(--ds-textarea-padding,calc(4px * var(--ds-sf)));resize:vertical}:host([variant=plain]) textarea{padding:0}:host([auto-grow]) textarea{resize:none}", mu = {
	email: "email",
	tel: "tel",
	url: "url",
	password: "current-password"
};
Fo("ds-input", class e extends No {
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
		super(), this.type = "text", this.multiline = !1, this.rows = 3, this.maxRows = 10, this.autoGrow = !1, this.wrap = "soft", this.inputMode = "", this.enterKeyHint = "", this.list = "", this.suggestions = [], this.ariaLabel = "", this.ariaLabelledBy = "", this.ariaDescribedBy = "", this.spellcheckHint = "", this.ariaInvalid = "", this.revealable = !1, this.quietFocus = !1, this._passwordVisible = !1, this._formDisabled = !1, this.name = "", this.value = "", this.placeholder = "", this.placeholderKey = "", this.label = "", this.labelText = "", this.disabled = !1, this.readonly = !1, this.required = !1, this.autofocus = !1, this.autocomplete = "", this.pattern = "", this.minlength = 0, this.maxlength = -1, this.min = "", this.max = "", this.step = "", this.variant = "default", this.error = "", this.errorText = "", this._focused = !1, this._placeholder = "", this._currentLanguage = Yc.value, this.boundHandlers = { languageChanged: (() => {
			this._currentLanguage = Yc.value, this._loadPlaceholder(), this.requestUpdate();
		}) };
	}
	static styles = Oa(pu);
	connectedCallback() {
		if (super.connectedCallback(), this._currentLanguage = Yc.value, this._loadPlaceholder(), this.addEventListener("click", this.focusFromLabel), window.addEventListener("language-changed", this.boundHandlers.languageChanged), window.addEventListener("translations-loaded", this.boundHandlers.languageChanged), typeof ResizeObserver < "u") {
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
		return e.length ? X`<datalist id="suggestions">${e.map((e) => X`<option value=${e.value} label=${$(e.label)}></option>`)}</datalist>` : null;
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
		let t = this.errorText ? hl(this.errorText) : this.error;
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
		if (!this.multiline) return mu[this.type];
	}
	accessibleLabel() {
		if (this.ariaLabel) return this.ariaLabel;
		let e = this.getRootNode();
		return (this.ariaLabelledBy ?? "").split(/\s+/).filter(Boolean).map((t) => {
			let n = e.getElementById?.(t), r = n?.getAttribute("text");
			return r ? hl(r) : n?.textContent?.trim() ?? "";
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
				let t = hl(e);
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
		return X`<span class="row-metric" aria-hidden="true"></span><textarea
      id="input"
      part="input"
      aria-label=${$(this.accessibleLabel())}
      aria-invalid=${$(this.ariaInvalid || (e ? "true" : void 0))}
      aria-describedby=${$([t ? "description" : "", e ? "error" : ""].filter(Boolean).join(" ") || void 0)}
      inputmode=${$(this.inputMode || void 0)}
      enterkeyhint=${$(this.enterKeyHint || void 0)}
      spellcheck=${$(this.spellcheckHint || void 0)}
      .name=${this.name}
      .value=${su(this.value)}
      .placeholder=${this._placeholder || this.placeholder}
      ?disabled=${this.disabled || this._formDisabled}
      ?readonly=${this.readonly}
      ?required=${this.required}
      ?autofocus=${this.autofocus}
      autocomplete=${$(this.resolvedAutocomplete())}
      minlength=${$(this.minlength || void 0)}
      maxlength=${$(this.maxlength >= 0 ? this.maxlength : void 0)}
      rows=${n}
      wrap=${this.wrap || "soft"}
      style=${uu({ "--ds-textarea-rows": String(n) })}
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
		return X`<input
      id="input"
      part="input"
      .type=${this.type === "password" && this._passwordVisible ? "text" : this.type}
      aria-label=${$(this.accessibleLabel())}
      aria-invalid=${$(this.ariaInvalid || (e ? "true" : void 0))}
      aria-describedby=${$([t ? "description" : "", e ? "error" : ""].filter(Boolean).join(" ") || void 0)}
      inputmode=${$(this.inputMode || void 0)}
      enterkeyhint=${$(this.enterKeyHint || void 0)}
      list=${$(n.length ? "suggestions" : void 0)}
      spellcheck=${$(this.spellcheckHint || void 0)}
      .name=${this.name}
      .value=${su(this.value)}
      .placeholder=${this._placeholder || this.placeholder}
      ?disabled=${this.disabled || this._formDisabled}
      ?readonly=${this.readonly}
      ?required=${this.required}
      ?autofocus=${this.autofocus}
      autocomplete=${$(this.resolvedAutocomplete())}
      pattern=${$(this.pattern || void 0)}
      minlength=${$(this.minlength || void 0)}
      maxlength=${$(this.maxlength >= 0 ? this.maxlength : void 0)}
      min=${$(this.min || void 0)}
      max=${$(this.max || void 0)}
      step=${$(this.step || void 0)}
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
		return X`
      <div class=${e ? "input-wrapper has-error" : "input-wrapper"}>
        ${this.label || this.labelText ? X`
                <label for="input">
                  ${this.labelText ? X`<ds-text .text=${this.labelText}></ds-text>` : this.label}
                </label>
              ` : null}

        <div class="input-container">
          ${this.renderControl(e, n)}
          ${!this.isMultiline && this.revealable && this.type === "password" ? X`
                  <button
                    class="password-visibility"
                    part="reveal"
                    type="button"
                    aria-label=${hl(this._passwordVisible ? "Hide password" : "Show password")}
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
                      style=${`--eye-icon: url("${this._passwordVisible ? fu : du}")`}
                    ></span>
                  </button>
                ` : null}
        </div>

        ${n ? X`<span id="description" hidden>${n}</span>` : null}
        ${e ? X`
                <div id="error" class="error-message" role="status">
                  ${this.errorText ? X`<ds-text wrap .text=${this.errorText}></ds-text>` : this.error}
                </div>
              ` : null}
      </div>
    `;
	}
});
//#endregion
//#region src/vendor/ds1/0-face/keys.ts
var hu = {
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
}, gu = Symbol.for("design-system-1.translate"), _u = null;
function vu(e) {
	if (typeof _u == "function") return _u(e);
	let t = _u?.[e];
	if (t !== void 0) return t;
	let n = globalThis[gu];
	if (typeof n == "function") {
		let t = String(n(e));
		if (t && t !== e) return t;
	}
	return hu[e];
}
function yu() {
	if (typeof navigator > "u") return !1;
	let e = navigator.userAgentData?.platform || navigator.platform || "";
	return /mac|iphone|ipad|ipod|ios/i.test(e);
}
var bu = (e) => e?.platform ?? (yu() ? "apple" : "other"), xu = {
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
function Su(e, t) {
	let n = bu(t) === "apple", r = e.trim().toLowerCase().split("+").map((e) => e.trim()), i = r[r.length - 1] === "" ? "plus" : r.pop(), a = {
		ctrl: !1,
		meta: !1,
		alt: !1,
		shift: !1,
		key: xu[i] ?? i
	};
	for (let t of r) {
		let r = xu[t] ?? t;
		if (r === "mod") a[n ? "meta" : "ctrl"] = !0;
		else if (r === "ctrl" || r === "meta" || r === "alt" || r === "shift") a[r] = !0;
		else if (r !== "") throw Error(`Unknown modifier in shortcut "${e}": ${t}`);
	}
	if (!a.key) throw Error(`A shortcut names a key: "${e}"`);
	return a;
}
var Cu = {
	enter: "↩",
	escape: "⎋",
	tab: "⇥",
	backspace: "⌫",
	delete: "⌦",
	home: "↖",
	end: "↘",
	pageup: "⇞",
	pagedown: "⇟"
}, wu = {
	arrowup: "↑",
	arrowdown: "↓",
	arrowleft: "←",
	arrowright: "→"
}, Tu = {
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
function Eu(e, t) {
	return wu[e] ? wu[e] : e === "plus" ? "+" : t && Cu[e] ? Cu[e] : Tu[e] ? vu(Tu[e]) : /^f\d{1,2}$/.test(e) ? e.toUpperCase() : e === "insert" ? "Ins" : e.length === 1 ? e.toUpperCase() : e[0].toUpperCase() + e.slice(1);
}
function Du(e, t) {
	let n = bu(t) === "apple", r = Su(e, t), i = Eu(r.key, n);
	return n ? `${r.ctrl ? "⌃" : ""}${r.alt ? "⌥" : ""}${r.shift ? "⇧" : ""}${r.meta ? "⌘" : ""}${i}` : [
		r.meta ? "Meta" : "",
		r.ctrl ? vu("key.ctrl") : "",
		r.alt ? vu("key.alt") : "",
		r.shift ? vu("key.shift") : "",
		i
	].filter(Boolean).join("+");
}
//#endregion
//#region src/vendor/ds1/x-icon/chevron-down.svg?raw
var Ou = "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M4.25 6.25L8 10L11.75 6.25\" stroke=\"currentColor\"/>\n</svg>\n", ku = "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M6.68649 11.884L12.443 6.13601L11.736 5.42715L6.68835 10.4827L4.26399 8.0501L3.55696 8.74525L6.68649 11.884Z\" fill=\"currentColor\"/>\n</svg>\n", Au = "[data-ds-shape=square],:host([data-ds-shape=square]){--ds-corner-size:0px;--ds-corner-shape:round;--ds-button-inset:.5px}[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:4px;--ds-corner-shape:round;--ds-button-inset:2.5px}[data-ds-shape=circular],:host([data-ds-shape=circular]){--ds-corner-size:999px;--ds-corner-shape:round;--ds-button-inset:5px}@supports (corner-shape:squircle){[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:8px;--ds-corner-shape:squircle}}:root,:host,:where([data-ds-surface]){--ds-unit:calc(var(--ds-1,20px) * var(--ds-sf,1));--ds-control-height:calc(var(--ds-control-size,var(--ds-08,16px)) * var(--ds-sf,1));--ds-row-height:calc(var(--ds-row-size,var(--ds-1,20px)) * var(--ds-sf,1));--ds-type-size-default:calc(var(--ds-text-size,14px) * var(--ds-sf,1));--ds-type-size-small:calc(var(--ds-small-text-size,10px) * var(--ds-sf,1));--ds-type-size-heading:calc(var(--ds-heading-text-size,13px) * var(--ds-sf,1));--ds-type-size-display:calc(var(--ds-display-text-size,20px) * var(--ds-sf,1));--ds-type-lineheight-default:calc(var(--ds-text-leading,16px) * var(--ds-sf,1));--ds-type-letterspacing-default:calc(var(--ds-text-tracking,-.3px) * var(--ds-sf,1));--ds-radius:calc(var(--ds-corner-size,4px) * var(--ds-sf,1));--ds-radius-card:calc(var(--ds-card-corner-size,4px) * var(--ds-sf,1))}:host{--ds-menu-row:var(--ds-row-height);box-sizing:border-box;min-width:calc(8 * var(--ds-unit));max-height:var(--ds-menu-max-height,calc(16 * var(--ds-unit)));background:0 0;border:0;padding:0;display:block}:host([hidden]){display:none!important}.frame{box-sizing:border-box;width:100%;max-height:min(var(--ds-menu-max-height,calc(16 * var(--ds-unit))), var(--ds-menu-available-height,100vh));padding:calc(var(--ds-unit) / 2 - 1px);border:1px solid var(--ds-border-color);border-radius:var(--ds-radius-card);background:var(--ds-paper);color:var(--ds-text-color);box-shadow:none;font-family:\"Inter Arrows\", var(--ds-typeface-regular);font-feature-settings:var(--ds-font-features);font-size:var(--ds-type-size-default);line-height:var(--ds-type-lineheight-default);letter-spacing:var(--ds-type-letterspacing-default);flex-direction:column;gap:0;display:flex;overflow-y:auto}slot{display:contents}::slotted(:is(ds-button,ds-file-picker)){--ds-button-height:var(--ds-menu-row);flex:none;width:100%}::slotted(:is(button,a,[role=option],[role^=menuitem]):not(ds-button,ds-file-picker)){box-sizing:border-box!important;height:var(--ds-menu-row)!important;min-height:var(--ds-menu-row)!important;max-height:var(--ds-menu-row)!important;line-height:var(--ds-type-lineheight-default)!important;flex:none!important;margin-block:0!important;padding-block:0!important}:host([floating]:not([open])){display:none}:host([floating]){min-width:0;width:var(--ds-menu-width,var(--ds-menu-anchor-width));z-index:1;scroll-padding:calc(var(--ds-unit) / 2);margin:0;position:fixed;inset:auto}:host([floating]) ::slotted(:is(ds-button,ds-file-picker)){--ds-button-height:var(--ds-menu-row);--ds-button-align:flex-start;--ds-button-padding:0 calc(4px * var(--ds-sf));flex:none;width:100%}:host([data-grid]){width:max-content;min-width:0}:host([data-grid]) .frame{grid-template-columns:repeat(var(--ds-menu-columns), var(--ds-row-height));width:max-content;max-width:100%;display:grid}:host([data-grid]) ::slotted(:is(ds-button,ds-file-picker)){--ds-button-height:var(--ds-menu-row);--ds-button-min-width:0px;--ds-button-padding:0;--ds-button-align:center}:host([compact]){--ds-menu-row:calc(var(--ds-row-height) - 1px);width:var(--ds-menu-width,calc(8 * var(--ds-unit)));min-width:calc(4 * var(--ds-unit));max-width:100%;max-height:none}:host([compact]) .frame{background:0 0;border:0;border-radius:0;gap:1px;padding:0;overflow:visible}:host([compact]) ::slotted(:is(ds-button,ds-file-picker)){--ds-button-height:var(--ds-menu-row);--ds-button-padding:0 calc(4px * var(--ds-sf));--ds-button-background:var(--ds-fill);--ds-button-color:var(--ds-text-color);--ds-radius:0px;width:100%}:host([floating]) ::slotted(:is(ds-button,ds-file-picker):is(:hover,:focus-within):not([disabled],[data-disabled])){--ds-button-background:var(--ds-fill)}:host([trigger-mode=context]),:host([trigger-mode=submenu]),:host([trigger-mode=manual]){width:var(--ds-menu-width,calc(8 * var(--ds-unit)))}:host([data-grid]){width:calc((var(--ds-menu-columns) + 1) * var(--ds-row-height))}:host([data-grid]) .frame{width:100%;padding-inline:calc(var(--ds-unit) / 2 - 1px)}:host([data-grid]) ::slotted([data-ds-menu-start]){grid-column-start:1}:host([data-grid]) ::slotted(:is([data-ds-menu-row],[data-ds-menu-separator],[data-ds-menu-label])){grid-column:1/-1}:host([data-grid]) ::slotted([data-ds-menu-row]){--ds-button-align:flex-start;--ds-button-padding:0 calc(4px * var(--ds-sf))}::slotted([data-ds-menu-label]){box-sizing:border-box;height:var(--ds-menu-row);padding:0 calc(4px * var(--ds-sf));color:var(--ds-text-color-muted);display:block}::slotted([data-ds-menu-separator]){box-sizing:border-box;border:0;border-top:1px solid var(--ds-border-color);width:100%;margin:calc(var(--ds-unit) / 2 - 1px) 0 calc(var(--ds-unit) / 2)}", ju = "[data-ds-shape=square],:host([data-ds-shape=square]){--ds-corner-size:0px;--ds-corner-shape:round;--ds-button-inset:.5px}[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:4px;--ds-corner-shape:round;--ds-button-inset:2.5px}[data-ds-shape=circular],:host([data-ds-shape=circular]){--ds-corner-size:999px;--ds-corner-shape:round;--ds-button-inset:5px}@supports (corner-shape:squircle){[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:8px;--ds-corner-shape:squircle}}:root,:host,:where([data-ds-surface]){--ds-unit:calc(var(--ds-1,20px) * var(--ds-sf,1));--ds-control-height:calc(var(--ds-control-size,var(--ds-08,16px)) * var(--ds-sf,1));--ds-row-height:calc(var(--ds-row-size,var(--ds-1,20px)) * var(--ds-sf,1));--ds-type-size-default:calc(var(--ds-text-size,14px) * var(--ds-sf,1));--ds-type-size-small:calc(var(--ds-small-text-size,10px) * var(--ds-sf,1));--ds-type-size-heading:calc(var(--ds-heading-text-size,13px) * var(--ds-sf,1));--ds-type-size-display:calc(var(--ds-display-text-size,20px) * var(--ds-sf,1));--ds-type-lineheight-default:calc(var(--ds-text-leading,16px) * var(--ds-sf,1));--ds-type-letterspacing-default:calc(var(--ds-text-tracking,-.3px) * var(--ds-sf,1));--ds-radius:calc(var(--ds-corner-size,4px) * var(--ds-sf,1));--ds-radius-card:calc(var(--ds-card-corner-size,4px) * var(--ds-sf,1))}:host([data-field]){--ds-select-unit:calc(var(--ds-1) * var(--ds-sf));vertical-align:bottom;width:max-content;min-width:0;max-width:100%;max-height:none;height:var(--ds-control-height);display:inline-flex;position:relative}:host([data-field]:not([data-listbox])){flex:none!important;justify-self:start!important;width:max-content!important}:host([hidden]){display:none!important}::slotted(select){field-sizing:content;appearance:none!important;box-sizing:border-box!important;width:auto!important;min-width:0!important;max-width:100%!important;height:100%!important;min-height:0!important;padding:0 var(--ds-select-unit) 0 calc(4px * var(--ds-sf))!important;border:1px solid var(--ds-border-color)!important;border-radius:var(--ds-radius)!important;corner-shape:var(--ds-corner-shape,round)!important;background:var(--ds-input-background)!important;color:var(--ds-input-color)!important;font-family:\"Inter Arrows\", var(--ds-typeface-regular)!important;font-size:var(--ds-type-size-default)!important;font-weight:var(--ds-type-weight-default)!important;letter-spacing:var(--ds-type-letterspacing-default)!important;line-height:calc(var(--ds-control-height) - 2px)!important;box-shadow:none!important;cursor:pointer!important;margin:0!important;display:block!important}.arrow{pointer-events:none;inset-inline-end:calc(2px * var(--ds-sf));width:var(--ds-control-height);height:var(--ds-control-height);background:var(--ds-input-color);mask:var(--ds-select-arrow) center / contain no-repeat;position:absolute;top:50%;transform:translateY(-50%)}::slotted(select:focus-visible){outline:2px solid var(--ds-focus-ring)!important;outline-offset:1px!important}::slotted(select:disabled){cursor:default!important;opacity:.5!important}.arrow.disabled{opacity:.5}.arrow[hidden]{display:none}::slotted(select[multiple]),::slotted(select[size]:not([size=\"0\"]):not([size=\"1\"])){padding:0 calc(4px * var(--ds-sf))!important;line-height:calc(var(--ds-select-unit) - 2px)!important}:host([data-listbox]){width:calc(8 * var(--ds-select-unit));height:calc(var(--ds-select-rows,1) * var(--ds-select-unit))}:host([data-listbox]) ::slotted(select){width:100%!important}:host([fit]:not([data-listbox])){width:max-content}:host([fit]:not([data-listbox])) ::slotted(select){width:auto!important;max-width:100%!important}:host([chip]:not([data-listbox])) ::slotted(select){background:var(--ds-button-background-color-secondary)!important;color:var(--ds-button-text-color)!important;line-height:var(--ds-control-height)!important;border:0!important}:host([chip][primary]:not([data-listbox])) ::slotted(select){background:var(--ds-button-background-color-primary)!important;color:var(--ds-button-text-color-on-accent)!important}:host([chip]) .arrow{background:var(--ds-button-text-color)}:host([chip][primary]) .arrow{background:var(--ds-button-text-color-on-accent)}:host([swatch]:not([swatch=\"\"]):not([data-listbox])){width:var(--ds-select-unit);height:var(--ds-select-unit);border-radius:var(--ds-radius);background:var(--ds-input-background)}:host([swatch]:not([swatch=\"\"]):not([data-listbox])) ::slotted(select){z-index:1;opacity:0!important;width:100%!important;position:relative!important}:host([swatch]:not([swatch=\"\"]):not([data-listbox]):focus-within){outline:2px solid var(--ds-focus-ring);outline-offset:1px}ds-swatch{pointer-events:none;margin:auto;position:absolute;inset:0}ds-swatch.disabled{opacity:.5}:host([data-listed]){cursor:pointer}:host([data-listed]) ::slotted(select){pointer-events:none!important}.list{--ds-menu-width:var(--ds-select-list-width)}.choice,.group-label{box-sizing:border-box;align-items:flex-end;gap:calc(4px * var(--ds-sf));width:100%;height:var(--ds-row-height);min-width:0;padding:0 calc(4px * var(--ds-sf));color:var(--ds-text-color);font:inherit;line-height:var(--ds-type-lineheight-default);text-align:start;white-space:nowrap;background:0 0;border:0;border-radius:0;flex:none;margin:0;display:flex}.choice{cursor:pointer;-webkit-tap-highlight-color:transparent;outline:none}.choice:hover:not(:disabled),.choice:focus-visible{background:var(--ds-row-fill-hover,var(--ds-fill))}.choice:active:not(:disabled){background:var(--ds-row-fill-press,var(--ds-fill-hover))}.choice:focus-visible{box-shadow:inset 0 0 0 2px var(--ds-focus-ring)}.choice:disabled{cursor:default;opacity:.5}.group{flex-direction:column;display:flex}.group-label{color:var(--ds-text-color-muted)}.name{flex:0 auto;min-width:0;overflow:hidden}.details{min-width:0;color:var(--ds-text-color-muted);flex:0 auto;overflow:hidden}.shortcut{color:var(--ds-text-color-muted);flex:none;margin-inline-start:auto}.mark{width:calc(16px * var(--ds-sf));height:calc(16px * var(--ds-sf));flex:none}.check{width:calc(16px * var(--ds-sf));height:calc(16px * var(--ds-sf));mask:var(--ds-select-check) center / contain no-repeat;visibility:hidden;background:currentColor;flex:none;margin-inline-start:auto}.shortcut+.check{margin-inline-start:0}.choice[aria-selected=true] .check{visibility:visible}.choice[aria-selected=true] .name{font-weight:var(--ds-row-current-weight,var(--ds-type-weight-bold))}";
Fo("ds-swatch", class extends No {
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
	static styles = ka`
    :host { display: inline-block; flex: 0 0 auto; width: calc(var(--ds-08) * var(--ds-sf)); height: calc(var(--ds-08) * var(--ds-sf)); vertical-align: middle; }
    :host([hidden]) { display: none !important; }
    span { display: block; box-sizing: border-box; width: 100%; height: 100%; border: 1px solid var(--ds-border-color); }
    :host([selected]) span { outline: 2px solid var(--ds-text-color); outline-offset: 0; }
  `;
	render() {
		return X`<span style=${uu({ backgroundColor: this.value })}></span>`;
	}
});
//#endregion
//#region src/vendor/ds1/0-face/anchored-panel.ts
function Mu(e, t, n, r = 4) {
	let i = n.left + n.width - r, a = n.top + n.height - r, o = n.left + r, s = n.top + r, c = Math.max(0, a - e.bottom - 4), l = Math.max(0, e.top - 4 - s), u = c < t.height && l > c, d = u ? l : c, f = Math.min(t.height, d);
	return {
		left: Math.max(o, Math.min(e.left + (e.width - t.width) / 2, i - t.width)),
		top: Math.max(s, u ? e.top - 4 - f : Math.min(e.bottom + 4, a - f)),
		availableHeight: d,
		availableWidth: Math.max(0, i - o)
	};
}
var Nu = /* @__PURE__ */ new WeakMap();
function Pu(e) {
	let t = e.ownerDocument, n = t.defaultView, r = Nu.get(t);
	r?.isConnected || (r = t.createElement("span"), r.setAttribute("aria-hidden", "true"), r.style.cssText = "position:fixed;visibility:hidden;pointer-events:none;inset:0;width:0;height:0;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)", t.body.appendChild(r), Nu.set(t, r));
	let i = n.getComputedStyle(r), a = parseFloat(i.paddingLeft) || 0, o = parseFloat(i.paddingRight) || 0, s = parseFloat(i.paddingTop) || 0, c = parseFloat(i.paddingBottom) || 0, l = n.visualViewport;
	return {
		left: (l?.offsetLeft ?? 0) + a,
		top: (l?.offsetTop ?? 0) + s,
		width: Math.max(0, (l?.width ?? n.innerWidth) - a - o),
		height: Math.max(0, (l?.height ?? n.innerHeight) - s - c)
	};
}
function Fu(e) {
	return e.ownerDocument.defaultView?.matchMedia("(max-width: 768px)").matches ?? !1;
}
//#endregion
//#region src/vendor/ds1/2-core/styles/ds-file-picker.css?inline
var Iu = "[data-ds-shape=square],:host([data-ds-shape=square]){--ds-corner-size:0px;--ds-corner-shape:round;--ds-button-inset:.5px}[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:4px;--ds-corner-shape:round;--ds-button-inset:2.5px}[data-ds-shape=circular],:host([data-ds-shape=circular]){--ds-corner-size:999px;--ds-corner-shape:round;--ds-button-inset:5px}@supports (corner-shape:squircle){[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:8px;--ds-corner-shape:squircle}}:root,:host,:where([data-ds-surface]){--ds-unit:calc(var(--ds-1,20px) * var(--ds-sf,1));--ds-control-height:calc(var(--ds-control-size,var(--ds-08,16px)) * var(--ds-sf,1));--ds-row-height:calc(var(--ds-row-size,var(--ds-1,20px)) * var(--ds-sf,1));--ds-type-size-default:calc(var(--ds-text-size,14px) * var(--ds-sf,1));--ds-type-size-small:calc(var(--ds-small-text-size,10px) * var(--ds-sf,1));--ds-type-size-heading:calc(var(--ds-heading-text-size,13px) * var(--ds-sf,1));--ds-type-size-display:calc(var(--ds-display-text-size,20px) * var(--ds-sf,1));--ds-type-lineheight-default:calc(var(--ds-text-leading,16px) * var(--ds-sf,1));--ds-type-letterspacing-default:calc(var(--ds-text-tracking,-.3px) * var(--ds-sf,1));--ds-radius:calc(var(--ds-corner-size,4px) * var(--ds-sf,1));--ds-radius-card:calc(var(--ds-card-corner-size,4px) * var(--ds-sf,1))}:host{vertical-align:middle;width:max-content;min-width:0;max-width:100%;height:var(--ds-row-height);border-radius:var(--ds-radius);corner-shape:var(--ds-corner-shape,round);display:inline-flex;position:relative}:host([hidden]){display:none!important}ds-button{--ds-button-height:var(--ds-row-height);pointer-events:none;max-width:100%;overflow:hidden}:host([icon]){width:var(--ds-row-height)}:host([preview]){width:calc(4 * var(--ds-unit));height:calc(4 * var(--ds-unit))}:host([preview]) ds-button{--ds-button-height:calc(4 * var(--ds-unit))}:host([preview][compact]){width:calc(2 * var(--ds-unit));height:calc(2 * var(--ds-unit))}:host([preview][compact]) ds-button{--ds-button-height:calc(2 * var(--ds-unit))}::slotted([slot=content]){justify-content:center;align-items:center;gap:calc(var(--ds-unit) / 2);pointer-events:none;display:inline-flex}:host([preview]) ::slotted([slot=content]){width:100%;height:100%}:host([area]){width:100%;height:calc(8 * var(--ds-unit))}:host([area]) ds-button{--ds-button-min-width:0px;--ds-button-height:calc(8 * var(--ds-unit));width:100%}:host([area][compact]){height:calc(4 * var(--ds-unit))}:host([area][compact]) ds-button{--ds-button-height:calc(4 * var(--ds-unit))}:host([area]) slot[name=content]{text-align:center;white-space:normal;width:100%;display:block}:host([area]) ::slotted([slot=content]){box-sizing:border-box;width:100%;padding:var(--ds-unit);white-space:normal}::slotted(input[type=file]){box-sizing:border-box!important;opacity:0!important;clip:auto!important;clip-path:none!important;cursor:pointer!important;border:0!important;width:100%!important;min-width:0!important;max-width:none!important;height:100%!important;min-height:0!important;max-height:none!important;margin:0!important;padding:0!important;display:block!important;position:absolute!important;inset:0!important;overflow:hidden!important}::slotted(input[type=file]:disabled){cursor:default!important}::slotted(input[hidden]){display:none!important}:host(:focus-within){outline:2px solid var(--ds-focus-ring);outline-offset:1px}:host(:is([secondary],[area]):hover:not([data-disabled])) ds-button{--ds-button-background:var(--ds-fill-hover)}:host(:is([data-dragging],[dragging]):not([data-disabled])){outline:2px solid var(--ds-focus-ring);outline-offset:1px}:host(:is([data-dragging],[dragging]):not([data-disabled])) ds-button{--ds-button-background:var(--ds-fill-hover)}:host([data-menu-item]){width:100%}:host([data-menu-item]) ds-button{--ds-button-padding:0 calc(4px * var(--ds-sf));width:100%}:host([data-menu-item]:is(:hover,:focus-within):not([data-disabled])) ds-button{--ds-button-background:var(--ds-fill)}";
Fo("ds-file-picker", class extends No {
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
	static styles = Oa(Iu);
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
		return X`<ds-button control="host" inert aria-hidden="true" tabindex="-1"
      .icon=${!this.area && (this.icon || this.preview)} .primary=${this.primary} .secondary=${this.secondary || this.area}
      .disabled=${this.controlDisabled}><slot name="content">${this.label}</slot></ds-button>
      <slot @slotchange=${this.observeControl}></slot>`;
	}
});
function Lu(e, t, { resolve: n = () => e, touch: r = !0, selection: i = !1, aria: a = !0 } = {}) {
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
var Ru = "[role=\"option\"], [role=\"menuitem\"], [role=\"menuitemradio\"], [role=\"menuitemcheckbox\"]", zu = "button, a[href], input, select, textarea, [tabindex]", Bu = "ds-menu, ds-select, ds-context", Vu = /* @__PURE__ */ new WeakMap(), Hu = /* @__PURE__ */ new WeakMap();
function Uu(e) {
	let t = Hu.get(e);
	if (t) return t;
	t = {
		menus: /* @__PURE__ */ new Set(),
		blocked: /* @__PURE__ */ new Set(),
		point: null,
		version: 0
	}, Hu.set(e, t);
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
var Wu = class e extends No {
	static styles = Oa(Au);
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
		return this.parentElement?.closest(Bu) ?? null;
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
		let e = Uu(this.ownerDocument);
		e.menus.add(this);
		let t = this.connectedBefore;
		this.connectedBefore = !0, t && e.version > 0 && this.floating && this.open && (this.requestClose("navigation"), this.open = !1), this.hasAttribute("role") || this.setAttribute("role", "listbox"), this.requestUpdate();
	}
	disconnectedCallback() {
		Hu.get(this.ownerDocument)?.menus.delete(this), Hu.get(this.ownerDocument)?.blocked.delete(this), this.listeningTo?.removeEventListener("keydown", this.onControllerKey), this.listeningTo = null, this.bindTrigger(null), clearTimeout(this.hoverTimer), this.hide(!0), super.disconnectedCallback();
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
			if (this.triggerAttributes.clear(), this.listeningTrigger?.removeEventListener("click", this.onTriggerClick), this.listeningTrigger?.removeEventListener("keydown", this.onTriggerKey), this.listeningTrigger?.removeEventListener("pointerenter", this.onHoverEnter), this.listeningTrigger?.removeEventListener("pointerleave", this.onHoverLeave), this.listeningTrigger = e, this.listeningSelector = this.contextSelector, this.listeningMode = this.triggerMode, this.hoverNavigationVersion = 0, this.holdNavigationHover(), e && this.triggerMode === "context" && (this.contextBinding = Lu(e, (e, t) => {
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
		this.invokingControl = t?.matches(zu) ? t : t?.contains(r) && r instanceof HTMLElement ? r : t?.querySelector(zu) ?? t, this.shown && (this.opener = this.invokingControl), this.focusOnOpen = n, this.openingEdge = "first", this.toggleFromTrigger(!0, {
			trigger: t,
			point: e
		}), this.open && this.place();
	}
	onChoice = (e) => {
		if (!this.closesOnChoice) return;
		let t = e.composedPath().find((e) => e instanceof HTMLElement && e.matches(Ru));
		t && t.closest(Bu) === this && !t.hasAttribute("data-keep-open") && this.enabled(t) && (t.getAttribute("aria-haspopup") || t.matches("ds-file-picker, input[type=\"file\"]") || t.querySelector("input[type=\"file\"]") || queueMicrotask(() => {
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
		let e = Hu.get(this.ownerDocument);
		if (!e?.version || !this.hover && this.triggerMode !== "submenu" || (this.hoverNavigationVersion !== e.version && (this.hoverNavigationVersion = e.version, this.hoverReleased = !1), this.hoverReleased)) return;
		let t = e.point, n = (this.trigger ?? this).getBoundingClientRect();
		this.hoverAwaitingExit = !!(t && n.width > 0 && n.height > 0 && t.x >= n.left && t.x < n.right && t.y >= n.top && t.y < n.bottom), this.hoverAwaitingExit ? e.blocked.add(this) : e.blocked.delete(this);
	}
	releaseNavigationHoverIfOutside(e) {
		let t = (this.trigger ?? this).getBoundingClientRect();
		e.x >= t.left && e.x < t.right && e.y >= t.top && e.y < t.bottom || (this.hoverAwaitingExit = !1, this.hoverReleased = !0, Hu.get(this.ownerDocument)?.blocked.delete(this));
	}
	onHoverEnter = (e) => {
		if (!this.hover && this.triggerMode !== "submenu" || e.pointerType === "touch") return;
		clearTimeout(this.hoverTimer);
		let t = Hu.get(this.ownerDocument)?.point;
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
		return Array.from(this.querySelectorAll(Ru)).filter((t) => (e || this.enabled(t)) && !t.closest("[hidden], [inert]") && t.closest(Bu) === this);
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
		return [...Vu.get(this.ownerDocument) ?? []].at(-1) === this;
	}
	show() {
		if (this.shown || !this.isConnected) return;
		this.shown = !0;
		let e = this.ownerDocument.activeElement;
		this.opener = this.invokingControl ?? this.controller ?? this.trigger ?? (this.anchor instanceof HTMLElement ? this.anchor : null) ?? (e instanceof HTMLElement ? e : null), this.search = "", this.restoreFocus = !0, this.heldFocus = !1;
		let t = Vu.get(this.ownerDocument);
		t || Vu.set(this.ownerDocument, t = /* @__PURE__ */ new Set()), t.add(this), this.popover = "manual", this.showPopover?.(), this.choicesObserver = new MutationObserver(this.onChoicesChanged), this.choicesObserver.observe(this, {
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
		for (let e of this.querySelectorAll(Bu)) e.open && e.requestClose("parent");
		clearTimeout(this.hoverTimer), this.focusVersion++;
		let t = this.ownerDocument.activeElement, n = t instanceof Node && this.contains(t);
		this.isConnected && this.matches(":popover-open") && this.hidePopover?.(), Vu.get(this.ownerDocument)?.delete(this), this.observer?.disconnect(), this.observer = void 0, this.observedAnchor = null, this.choicesObserver?.disconnect(), this.choicesObserver = void 0, this.ownerDocument.removeEventListener("pointerdown", this.onOutside, !0), this.ownerDocument.removeEventListener("focusin", this.onOutside), this.ownerDocument.removeEventListener("keydown", this.onEscape, !0), this.ownerDocument.removeEventListener("scroll", this.place, !0), this.ownerDocument.defaultView?.removeEventListener("resize", this.place), this.ownerDocument.defaultView?.visualViewport?.removeEventListener("resize", this.place), this.ownerDocument.defaultView?.visualViewport?.removeEventListener("scroll", this.place);
		let r = new CustomEvent("ds-menu-close-focus", {
			bubbles: !0,
			composed: !0,
			cancelable: !0
		});
		this.dispatchEvent(r) && e && this.restoreFocus && (n || this.heldFocus && t === this.ownerDocument.body) && this.opener?.isConnected && this.opener.focus({ preventScroll: !0 }), this.opener = null, this.invokingControl = null, this.heldFocus = !1;
	}
	requestClose(e) {
		this.restoreFocus = e !== "outside" && e !== "parent" && e !== "navigation";
		for (let e of this.querySelectorAll(Bu)) e.restoreFocus = !1;
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
		let t = [...Vu.get(this.ownerDocument) ?? []].at(-1);
		if (t !== this && (!t || !this.contains(t))) return;
		let n = e.composedPath(), r = this.contextSelector || this.triggerMode === "manual" ? this.invokingControl : this.trigger;
		!n.includes(this) && !(this.anchor instanceof HTMLElement && !this.controller && n.includes(this.anchor)) && !(r && n.includes(r)) && !(this.controller && n.includes(this.controller)) && this.requestClose("outside");
	};
	onPointerChoice = (e) => {
		if (this.controller || this.getAttribute("role") !== "menu" || e.pointerType === "touch") return;
		let t = e.composedPath().find((e) => e instanceof HTMLElement && e.matches(Ru));
		t && t.closest(Bu) === this && this.enabled(t) && t.focus({ preventScroll: !0 });
	};
	retainController = (e) => {
		this.controller && e.button === 0 && e.composedPath().some((e) => e instanceof HTMLElement && e.matches(Ru)) && e.preventDefault();
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
		if (e instanceof HTMLElement && this.triggerMode !== "context" && this.placement === "bottom" && Fu(this)) {
			let e = Pu(this);
			this.style.maxWidth = `${u(e.width - 8, Math.floor)}px`;
			let n = this.shadowRoot?.querySelector(".frame"), r = this.getBoundingClientRect(), i = Mu(t, {
				width: r.width,
				height: n?.scrollHeight ?? r.height
			}, e);
			this.style.setProperty("--ds-menu-available-height", `${u(i.availableHeight, Math.floor)}px`);
			let a = Mu(t, this.getBoundingClientRect(), e);
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
		return X`<div class="frame"><slot @slotchange=${this.onChoicesChanged}></slot></div>`;
	}
};
Fo("ds-menu", Wu);
//#endregion
//#region src/vendor/ds1/3-unit/ds-select.ts
var Gu = /* @__PURE__ */ new Set([
	"ArrowDown",
	"ArrowUp",
	"Enter",
	" ",
	"F4"
]), Ku = 0;
Fo("ds-select", class extends Wu {
	static properties = {
		...Wu.properties,
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
		Oa(Au),
		Oa(ju),
		Oa(`:host { --ds-select-arrow: url("data:image/svg+xml,${encodeURIComponent(Ou)}"); --ds-select-check: url("data:image/svg+xml,${encodeURIComponent(ku)}"); }`)
	];
	listbox = !1;
	fieldDisabled = !1;
	listOpen = !1;
	listId = `ds-select-list-${++Ku}`;
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
		!this.listed || this.fieldDisabled || e.defaultPrevented || e.isComposing || e.metaKey || e.ctrlKey || (Gu.has(e.key) || e.altKey && (e.key === "ArrowDown" || e.key === "ArrowUp")) && (e.preventDefault(), this.setList(!0));
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
		if (e.hidden) return Z;
		let n = e.label || e.text, { details: r, shortcut: i, icon: a } = e.dataset;
		return X`<button type="button" role="option" class="choice" id=${`${this.listId}-${t}`} aria-selected=${e.selected ? "true" : "false"}
      ?disabled=${e.disabled || this.fieldDisabled} data-text-value=${n} @click=${(t) => {
			t.stopPropagation(), this.choose(e);
		}}>${a ? X`<ds-icon class="mark" type=${a} aria-hidden="true"></ds-icon>` : Z}<span class="name">${n}</span>${r ? X`<span class="details">${r}</span>` : Z}${i ? X`<span class="shortcut" aria-hidden="true">${i.includes("+") || i.startsWith("mod") ? Du(i) : i}</span>` : Z}<span class="check" aria-hidden="true"></span></button>`;
	}
	renderChoices() {
		let e = this.control();
		if (!e) return Z;
		let t = 0;
		return [...e.children].map((e, n) => {
			if (e instanceof HTMLOptionElement) return this.renderOption(e, t++);
			if (!(e instanceof HTMLOptGroupElement) || e.hidden) return Z;
			let r = `${this.listId}-group-${n}`;
			return X`<div role="group" class="group" aria-labelledby=${r}><div class="group-label" id=${r}>${e.label}</div>${[...e.children].map((e) => e instanceof HTMLOptionElement ? this.renderOption(e, t++) : Z)}</div>`;
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
		return X`<slot @slotchange=${this.observeControl}></slot><span aria-hidden="true" ?hidden=${this.listbox || !!this.swatch} class="arrow ${n}"></span>${this.swatch && !this.listbox ? X`<ds-swatch aria-hidden="true" .value=${this.swatch} class=${n}></ds-swatch>` : null}${this.listed ? X`<ds-menu class="list" id=${this.listId} floating data-ds-hug role="listbox" trigger-mode="manual" aria-label=${t || Z} .anchor=${this} ?open=${this.listOpen} @ds-menu-close=${this.onListClose}>${this.listOpen ? this.renderChoices() : Z}</ds-menu>` : Z}`;
	}
});
//#endregion
//#region src/vendor/ds1/0-face/overlay-swipe.ts
var qu = 10, Ju = .998, Yu = (e) => e / 1e3 * Ju / .0020000000000000018, Xu = (e, t, n = .55) => e * t * n / (t + n * Math.abs(e)), Zu = /* @__PURE__ */ new Set([
	"none",
	"bottom",
	"end",
	"start"
]);
function Qu(e) {
	let t = e.getAttribute("data-ds-edge");
	return t && Zu.has(t) ? t : e.classList.contains("ds-overlay--sheet") ? "bottom" : e.classList.contains("ds-overlay--drawer") ? e.classList.contains("ds-overlay--start") ? "start" : "end" : "none";
}
function $u(e, t) {
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
function ed(e, t, n, r) {
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
function td(e, t, n) {
	let r = e.ownerDocument.defaultView?.getComputedStyle(e).transform;
	if (!r || r === "none" || typeof DOMMatrixReadOnly > "u") return 0;
	try {
		let e = new DOMMatrixReadOnly(r);
		return n * (t === "y" ? e.m42 : e.m41);
	} catch {
		return 0;
	}
}
function nd(e, t = {}) {
	let n = () => (typeof t.edge == "function" ? t.edge() : t.edge) ?? Qu(e), r = null, i = 0, a = e.ownerDocument.defaultView, o = (e) => a?.requestAnimationFrame ? a.requestAnimationFrame(e) : a?.setTimeout(e, 16) ?? 0, s = (t, n, r) => {
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
		let o = t.touches[0], { axis: s, sign: c } = $u(e, i);
		r = {
			id: o.identifier,
			x: o.clientX,
			y: o.clientY,
			base: Math.max(0, td(e, s, c)),
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
		let { axis: l, sign: u } = $u(e, c), d = o.clientX - r.x, f = o.clientY - r.y, p = l === "y" ? f * u : d * u, m = l === "y" ? d : f;
		if (r.mode === "pending") {
			if (Math.hypot(d, f) < qu) {
				t.cancelable && p > 0 && p >= Math.abs(m) && !ed(r.path, e, l, p) && t.preventDefault();
				return;
			}
			if (Math.abs(p) <= Math.abs(m) || ed(r.path, e, l, p)) {
				r.mode = "ignore";
				return;
			}
			r.mode = "drag", r.start = p, i++, e.setAttribute("data-ds-overlay-dragging", "");
		}
		t.preventDefault();
		let h = e.getBoundingClientRect(), g = l === "y" ? h.height : h.width, _ = r.base + p - r.start;
		r.offset = _ < 0 ? Xu(_, g || 1) : _, s(r.offset, g, u);
		let v = t.timeStamp || (a?.performance?.now() ?? Date.now());
		for (r.samples.push({
			time: v,
			offset: r.offset
		}); r.samples.length > 2 && v - r.samples[0].time > 150;) r.samples.shift();
	}, p = (t) => {
		if (!r || [...t.touches].some((e) => e.identifier === r.id)) return;
		let i = r;
		if (r = null, i.mode !== "drag") return;
		let o = n(), { axis: s } = $u(e, o), c = e.getBoundingClientRect(), d = s === "y" ? c.height : c.width, f = t.timeStamp || (a?.performance?.now() ?? Date.now()), p = i.samples.filter((e) => f - e.time <= 100), m = p[0], h = p[p.length - 1], g = m && h ? h.time - m.time : 0, _ = m && h && g > 0 ? (h.offset - m.offset) / g * 1e3 : 0, v = i.offset + Yu(_);
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
var rd = "ds-overlay>dialog{box-sizing:border-box;position:var(--ds-overlay-position,fixed);inset:var(--ds-overlay-inset,0);width:var(--ds-overlay-width,calc(20 * var(--ds-unit)));max-width:var(--ds-overlay-max-width,calc(100vw - 2 * var(--ds-unit)));max-height:var(--ds-overlay-max-height,calc(100dvh - 2 * var(--ds-unit)));height:var(--ds-overlay-height,fit-content);margin:var(--ds-overlay-margin,auto);padding:var(--ds-overlay-padding,var(--ds-unit));border:var(--ds-overlay-border,1px solid var(--ds-border-color));background:var(--ds-overlay-paper,var(--ds-paper));color:var(--ds-text-color);z-index:var(--ds-overlay-layer,auto);box-shadow:none;overflow:var(--ds-overlay-overflow,auto);overscroll-behavior:contain;font-family:\"Inter Arrows\", var(--ds-typeface-regular);font-feature-settings:var(--ds-font-features);font-size:var(--ds-type-size-default);font-weight:var(--ds-type-weight-default);line-height:var(--ds-type-lineheight-default);letter-spacing:var(--ds-type-letterspacing-default);border-radius:0}ds-overlay>dialog[open]{gap:var(--ds-unit);flex-direction:column;display:flex}ds-overlay>dialog:not([open]){display:none}ds-overlay>dialog[data-ds-type=popover]{inset:auto;left:var(--ds-overlay-anchor-left,0px);top:var(--ds-overlay-anchor-top,0px);margin:calc(var(--ds-unit) / 2);width:var(--ds-overlay-width,max-content);max-width:var(--ds-overlay-available-width,calc(100vw - var(--ds-unit)));max-height:var(--ds-overlay-available-height,calc(100dvh - var(--ds-unit)))}ds-overlay>dialog[data-ds-type=popover]:has(>ds-calendar[compact]){border:0;gap:0;margin:0;padding:0}ds-overlay>dialog[data-ds-overlay-flush]{gap:0;padding:0}ds-overlay>dialog[data-ds-overlay-rotated]{width:calc(100dvh - 2 * var(--ds-unit));height:calc(100vw - 2 * var(--ds-unit));max-width:none;max-height:none;margin:0;inset:50% auto auto 50%;transform:translate(-50%,-50%)rotate(90deg)}ds-overlay>dialog[data-ds-type=screen][data-ds-overlay-rotated]{width:100dvh;height:100vw}ds-overlay>dialog::backdrop{background:color-mix(in srgb, var(--ds-black) 40%, transparent)}ds-overlay [data-ds-overlay=header]{flex-direction:column;display:flex}ds-overlay>dialog:has(>[data-ds-overlay=close]) [data-ds-overlay=header]{padding-inline-end:var(--ds-unit)}ds-overlay [data-ds-overlay=title]{min-height:var(--ds-row-height);color:var(--ds-text-color);font:inherit;font-weight:var(--ds-type-weight-bold);line-height:var(--ds-type-lineheight-default);align-items:flex-end;margin:0;display:flex}ds-overlay [data-ds-overlay=description]{color:var(--ds-text-color-muted);font:inherit;margin:0}ds-overlay [data-ds-overlay=footer]{justify-content:flex-end;align-items:center;gap:calc(var(--ds-unit) / 2);min-height:var(--ds-row-height);flex-wrap:wrap;display:flex}ds-overlay [data-ds-overlay=close]{top:var(--ds-unit);right:var(--ds-unit);position:absolute}ds-overlay>dialog[data-ds-overlay-inline]{background:0 0;border:0;gap:0;width:100%;max-width:none;max-height:none;margin:0;padding:0;position:relative;inset:auto}@media (width<=768px){ds-overlay>dialog[data-ds-type=sheet] [data-ds-overlay=close]{clip-path:inset(50%);white-space:nowrap;border:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}ds-overlay>dialog[data-ds-type=sheet] [data-ds-overlay=header]{padding-inline-end:0}ds-overlay>dialog[data-ds-type=sheet][data-ds-overlay-tabbed]{height:calc(var(--ds-overlay-viewport-height,100dvh) - var(--ds-overlay-sheet-gap,calc(2 * var(--ds-unit))) - env(safe-area-inset-top,0px));overflow:hidden}ds-overlay>dialog[data-ds-type=sheet][data-ds-overlay-tabbed]>:is([data-ds-overlay=header],ds-tabs){flex-shrink:0}ds-overlay>dialog[data-ds-type=sheet][data-ds-overlay-tabbed]>[data-ds-overlay=body]{overscroll-behavior:contain;flex:auto;min-height:0;overflow:auto}}", id = ":is(ds-overlay>dialog[data-ds-edge=bottom],dialog.ds-overlay.ds-overlay--sheet),:is(ds-overlay>dialog[data-ds-edge=end],dialog.ds-overlay.ds-overlay--drawer:not(.ds-overlay--start)),:is(ds-overlay>dialog[data-ds-edge=start],dialog.ds-overlay.ds-overlay--drawer.ds-overlay--start){--ds-overlay-gap:var(--ds-unit);--ds-overlay-inner:var(--ds-overlay-padding,var(--ds-unit));--ds-overlay-within:max(0px, var(--ds-overlay-inner) - var(--ds-overlay-line,1px));--ds-overlay-motion:var(--ds-overlay-enter,.38s);--ds-overlay-curve:var(--ds-overlay-easing,cubic-bezier(.32, .72, 0, 1));gap:var(--ds-overlay-gap);transform:var(--ds-overlay-held);transition:transform var(--ds-overlay-motion) var(--ds-overlay-curve), opacity var(--ds-overlay-motion) var(--ds-overlay-curve), overlay var(--ds-overlay-motion) allow-discrete, display var(--ds-overlay-motion) allow-discrete;margin:0}:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer))[data-ds-overlay-flush]{--ds-overlay-inner:0px;--ds-overlay-gap:0px}:is(ds-overlay>dialog[data-ds-edge=bottom],dialog.ds-overlay.ds-overlay--sheet){--ds-overlay-held:translateY(var(--ds-overlay-drag,0px));--ds-overlay-away:translateY(100%);inset:auto 0 var(--ds-overlay-viewport-bottom,0px);width:var(--ds-overlay-width,100%);max-width:min(100%, var(--ds-overlay-sheet-width,calc(32 * var(--ds-unit))));height:var(--ds-overlay-height,fit-content);max-height:calc(var(--ds-overlay-viewport-height,100dvh) - var(--ds-overlay-sheet-gap,calc(2 * var(--ds-unit))) - env(safe-area-inset-top,0px));padding:var(--ds-overlay-within) calc(var(--ds-overlay-inner) + env(safe-area-inset-right,0px)) calc(var(--ds-overlay-inner) + env(safe-area-inset-bottom,0px)) calc(var(--ds-overlay-inner) + env(safe-area-inset-left,0px));border-bottom:0;margin:0 auto}:is(ds-overlay>dialog[data-ds-edge=bottom],dialog.ds-overlay.ds-overlay--sheet):before{--ds-overlay-handle-height:calc(4px * var(--ds-sf,1));content:\"\";display:var(--ds-overlay-handle,block);z-index:1;top:calc((var(--ds-unit) - var(--ds-overlay-handle-height)) / 2 - var(--ds-overlay-line,1px) - var(--ds-overlay-within));width:calc(2 * var(--ds-unit));height:var(--ds-overlay-handle-height);margin-top:calc(var(--ds-overlay-inner) * -1 + (var(--ds-unit) - var(--ds-overlay-handle-height)) / 2);margin-bottom:calc(var(--ds-overlay-inner) - var(--ds-overlay-gap) - var(--ds-overlay-handle-height) - (var(--ds-unit) - var(--ds-overlay-handle-height)) / 2);border-radius:calc(var(--ds-overlay-handle-height) / 2);background:var(--ds-overlay-handle-color,var(--ds-border-color));pointer-events:none;flex:none;align-self:center;position:sticky}:is(ds-overlay>dialog[data-ds-edge=end],dialog.ds-overlay.ds-overlay--drawer:not(.ds-overlay--start)),:is(ds-overlay>dialog[data-ds-edge=start],dialog.ds-overlay.ds-overlay--drawer.ds-overlay--start){--ds-overlay-held:translateX(var(--ds-overlay-drag,0px));width:calc(var(--ds-overlay-width,calc(16 * var(--ds-unit))) + var(--ds-overlay-safe-side,0px));max-width:calc(100vw - 2 * var(--ds-unit));border-top:0;border-bottom:0;height:100dvh;max-height:none}:is(ds-overlay>dialog[data-ds-edge=end],dialog.ds-overlay.ds-overlay--drawer:not(.ds-overlay--start)):not(:dir(rtl)),:is(ds-overlay>dialog[data-ds-edge=start],dialog.ds-overlay.ds-overlay--drawer.ds-overlay--start):dir(rtl){--ds-overlay-away:translateX(100%);--ds-overlay-safe-side:env(safe-area-inset-right,0px);padding:calc(var(--ds-overlay-inner) + env(safe-area-inset-top,0px)) calc(var(--ds-overlay-inner) + env(safe-area-inset-right,0px)) calc(var(--ds-overlay-inner) + env(safe-area-inset-bottom,0px)) var(--ds-overlay-within);border-right:0;inset:0 0 0 auto}:is(ds-overlay>dialog[data-ds-edge=start],dialog.ds-overlay.ds-overlay--drawer.ds-overlay--start):not(:dir(rtl)),:is(ds-overlay>dialog[data-ds-edge=end],dialog.ds-overlay.ds-overlay--drawer:not(.ds-overlay--start)):dir(rtl){--ds-overlay-away:translateX(-100%);--ds-overlay-safe-side:env(safe-area-inset-left,0px);padding:calc(var(--ds-overlay-inner) + env(safe-area-inset-top,0px)) var(--ds-overlay-within) calc(var(--ds-overlay-inner) + env(safe-area-inset-bottom,0px)) calc(var(--ds-overlay-inner) + env(safe-area-inset-left,0px));border-left:0;inset:0 auto 0 0}:root:has(dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer):modal){overscroll-behavior:none;overflow:hidden}:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer)):not([open]){--ds-overlay-motion:var(--ds-overlay-exit,.26s);transform:var(--ds-overlay-away)}@starting-style{:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer))[open]{transform:var(--ds-overlay-away)}}:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer))::backdrop{opacity:calc(1 - var(--ds-overlay-progress,0));transition:opacity var(--ds-overlay-motion,.38s) ease, overlay var(--ds-overlay-motion,.38s) allow-discrete, display var(--ds-overlay-motion,.38s) allow-discrete}:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer)):not([open])::backdrop{opacity:0}@starting-style{:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer))[open]::backdrop{opacity:0}}:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer))[data-ds-overlay-dragging],:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer))[data-ds-overlay-dragging]::backdrop{transition:none}@media (prefers-reduced-motion:reduce){:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer)){--ds-overlay-motion:.15s;transition:opacity var(--ds-overlay-motion) ease, overlay var(--ds-overlay-motion) allow-discrete, display var(--ds-overlay-motion) allow-discrete}:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer)):not([open]){--ds-overlay-motion:.15s;transform:var(--ds-overlay-held);opacity:0}@starting-style{:is(ds-overlay>dialog[data-ds-edge],dialog.ds-overlay:is(.ds-overlay--sheet,.ds-overlay--drawer))[open]{transform:var(--ds-overlay-held);opacity:0}}}:is(ds-overlay>dialog[data-ds-type=screen],dialog.ds-overlay.ds-overlay--screen){--ds-overlay-width:100vw;width:100vw;max-width:none;height:100dvh;max-height:none;padding:var(--ds-unit);background:var(--ds-overlay-paper,var(--background,Canvas));border:0;gap:0;margin:0;overflow-y:auto}:is(ds-overlay>dialog[data-ds-type=screen],dialog.ds-overlay.ds-overlay--screen)[open]{align-items:stretch;gap:var(--ds-unit);flex-direction:column;display:flex}:is(ds-overlay>dialog[data-ds-type=screen],dialog.ds-overlay.ds-overlay--screen)[data-ds-overlay-flush]{gap:0;padding:0}:is(ds-overlay>dialog[data-ds-type=screen],dialog.ds-overlay.ds-overlay--screen)::backdrop{background:0 0}@media (prefers-reduced-motion:no-preference){:is(ds-overlay>dialog[data-ds-type=screen],dialog.ds-overlay.ds-overlay--screen)[open]{transition:opacity .16s ease-out,transform .16s ease-out}@starting-style{:is(ds-overlay>dialog[data-ds-type=screen],dialog.ds-overlay.ds-overlay--screen)[open]{opacity:0;transform:translateY(calc(var(--ds-unit) / -2))}}}.ds-overlay__bar{min-height:var(--ds-row-height);justify-content:flex-end;align-items:center;display:flex}.ds-overlay__bar>.ds-overlay__close{margin-inline-end:calc((var(--ds-unit) - var(--ds-control-height)) / 2)}.ds-overlay__toggle:not([aria-expanded=true])>:nth-child(2),.ds-overlay__toggle[aria-expanded=true]>:first-child:not(:only-child),.ds-overlay__close>:first-child:not(:only-child){display:none}", ad = "[data-ds-shape=square],:host([data-ds-shape=square]){--ds-corner-size:0px;--ds-corner-shape:round;--ds-button-inset:.5px}[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:4px;--ds-corner-shape:round;--ds-button-inset:2.5px}[data-ds-shape=circular],:host([data-ds-shape=circular]){--ds-corner-size:999px;--ds-corner-shape:round;--ds-button-inset:5px}@supports (corner-shape:squircle){[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:8px;--ds-corner-shape:squircle}}:root,:host,:where([data-ds-surface]){--ds-unit:calc(var(--ds-1,20px) * var(--ds-sf,1));--ds-control-height:calc(var(--ds-control-size,var(--ds-08,16px)) * var(--ds-sf,1));--ds-row-height:calc(var(--ds-row-size,var(--ds-1,20px)) * var(--ds-sf,1));--ds-type-size-default:calc(var(--ds-text-size,14px) * var(--ds-sf,1));--ds-type-size-small:calc(var(--ds-small-text-size,10px) * var(--ds-sf,1));--ds-type-size-heading:calc(var(--ds-heading-text-size,13px) * var(--ds-sf,1));--ds-type-size-display:calc(var(--ds-display-text-size,20px) * var(--ds-sf,1));--ds-type-lineheight-default:calc(var(--ds-text-leading,16px) * var(--ds-sf,1));--ds-type-letterspacing-default:calc(var(--ds-text-tracking,-.3px) * var(--ds-sf,1));--ds-radius:calc(var(--ds-corner-size,4px) * var(--ds-sf,1));--ds-radius-card:calc(var(--ds-card-corner-size,4px) * var(--ds-sf,1))}", od = `${rd}\n${id}`, sd = /* @__PURE__ */ new Set([
	"modal",
	"sheet",
	"drawer",
	"detail",
	"popover",
	"screen"
]), cd = () => typeof matchMedia == "function" && matchMedia("(max-width: 768px)").matches, ld = /* @__PURE__ */ new WeakMap(), ud = /* @__PURE__ */ new WeakMap();
function dd(e) {
	let t = [...ld.get(e) ?? []], n = t.some((e) => !e.modeless || e.holdScroll), r = t.some((e) => !e.modeless), i = ud.get(e);
	if (!n && !i) return;
	i || (i = {
		declarations: [],
		x: e.defaultView?.scrollX ?? 0,
		y: e.defaultView?.scrollY ?? 0
	}, ud.set(e, i));
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
	(!n || c && !r) && e.defaultView && (e.defaultView.scrollX !== i.x || e.defaultView.scrollY !== i.y) && e.defaultView.scrollTo(i.x, i.y), n || ud.delete(e);
}
var fd = /* @__PURE__ */ new WeakSet();
function pd(e) {
	if (!(e instanceof ShadowRoot) || fd.has(e)) return;
	let t = new CSSStyleSheet();
	t.replaceSync(od), e.adoptedStyleSheets = [...e.adoptedStyleSheets, t], fd.add(e);
}
Fo("ds-overlay", class extends No {
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
	static styles = [Oa(ad), ka`:host { display: contents; } :host([hidden]) { display: none !important; }`];
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
		super.connectedCallback(), pd(this.getRootNode()), this.observer.observe(this, { childList: !0 }), this.bindDialog();
	}
	disconnectedCallback() {
		this.observer.disconnect(), this.detachDialog(), super.disconnectedCallback();
	}
	updated() {
		this.syncType(), this.syncOpen(), this.place();
	}
	get kind() {
		let e = sd.has(this.type) ? this.type : "modal";
		return e === "detail" ? cd() ? "sheet" : "drawer" : e === "modal" && cd() ? "sheet" : e;
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
		t === "none" ? e.removeAttribute("data-ds-edge") : e.setAttribute("data-ds-edge", t), t !== "none" && !this.unbindSwipe ? this.unbindSwipe = nd(e, {
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
		if (this.trigger && Fu(this)) {
			let n = Pu(this);
			e.style.setProperty("--ds-overlay-available-width", `${Math.max(0, n.width - 8)}px`);
			let r = Mu(this.trigger.getBoundingClientRect(), e.getBoundingClientRect(), n);
			e.style.setProperty("--ds-overlay-available-height", `${r.availableHeight}px`);
			let i = Mu(this.trigger.getBoundingClientRect(), e.getBoundingClientRect(), n), a = parseFloat(t.getComputedStyle(e).marginLeft) || 0;
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
		let n = this.ownerDocument, r = ld.get(n);
		r || ld.set(n, r = /* @__PURE__ */ new Set()), r.add(this), dd(n);
		try {
			this.modeless ? e.show() : e.showModal();
		} catch (e) {
			throw r.delete(this), dd(n), e;
		}
		this.place(), typeof ResizeObserver < "u" && (this.sizeObserver = new ResizeObserver(this.place), this.sizeObserver.observe(e)), n.addEventListener("scroll", this.place, !0), n.defaultView?.addEventListener("resize", this.place), n.defaultView?.visualViewport?.addEventListener("resize", this.place), n.defaultView?.visualViewport?.addEventListener("scroll", this.place), (n.defaultView ?? n).addEventListener("keydown", this.onSheetEscape, !0), n.addEventListener("keydown", this.onDocumentKey), n.addEventListener("pointerdown", this.onOutsidePress, !0), n.addEventListener("click", this.onOutsideClick, !0), n.addEventListener("pointerup", this.onOutsideRelease, !0), n.addEventListener("wheel", this.onScrollGesture, { passive: !1 }), n.addEventListener("touchmove", this.onScrollGesture, { passive: !1 });
	}
	release() {
		let e = this.ownerDocument;
		this.sizeObserver?.disconnect(), this.sizeObserver = null, e.removeEventListener("scroll", this.place, !0), e.defaultView?.removeEventListener("resize", this.place), e.defaultView?.visualViewport?.removeEventListener("resize", this.place), e.defaultView?.visualViewport?.removeEventListener("scroll", this.place);
		let t = ld.get(e), n = t ? [...t] : [], r = n[n.length - 1] === this;
		if (!t?.delete(this)) return;
		dd(e), (e.defaultView ?? e).removeEventListener("keydown", this.onSheetEscape, !0), e.removeEventListener("keydown", this.onDocumentKey), e.removeEventListener("pointerdown", this.onOutsidePress, !0), e.removeEventListener("click", this.onOutsideClick, !0), e.removeEventListener("pointerup", this.onOutsideRelease, !0), e.removeEventListener("wheel", this.onScrollGesture), e.removeEventListener("touchmove", this.onScrollGesture), this.outsidePress = null;
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
		let e = [...ld.get(this.ownerDocument) ?? []];
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
		return X`<slot @slotchange=${this.bindDialog}></slot>`;
	}
});
//#endregion
//#region src/button-partial.ts
var md = [
	"default",
	"primary",
	"secondary",
	"active",
	"disabled",
	"danger"
], hd = /@Button\(("(?:[^"\\\n]|\\.)*"),\s*"(default|primary|secondary|active|disabled|danger)"\)/;
function gd(e) {
	let t = hd.exec(e);
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
function _d({ label: e, state: t }) {
	return `@Button(${JSON.stringify(e.replace(/[\r\n]/g, " "))}, "${t}")`;
}
var vd = bt("button-partial", hd, (e) => !!gd(e[0]));
function yd(e, t) {
	e.textContent = t.label;
	for (let n of md) n !== "default" && (e[n] = t.state === n);
	e.literal = !0;
}
//#endregion
//#region src/partials.ts
function bd(e) {
	return {
		...vd,
		draw(t, n) {
			let r = gd(n);
			t.classList.add("aa-partial"), t.setAttribute("data-aa-interactive", "");
			let i = document.createElement("ds-button");
			i.inert = !0, i.setAttribute("aria-hidden", "true"), yd(i, r), t.append(i);
			let a, o = () => {
				t.tabIndex = e() ? 0 : -1, t.setAttribute("role", e() ? "button" : "img"), t.setAttribute("aria-label", V(e() ? "Edit button: {label}, {state}" : "Button: {label}, {state}", {
					label: r.label,
					state: r.state
				}));
			};
			o();
			let s = new MutationObserver(o);
			queueMicrotask(() => {
				t.isConnected && s.observe(t.closest(".aa-block"), {
					attributes: !0,
					attributeFilter: ["data-readonly"]
				});
			});
			let c = () => {
				if (!e() || a) return;
				let s = t.ownerDocument;
				if (!s.querySelector("style[data-aa-partial-overlay]")) {
					let e = s.createElement("style");
					e.dataset.aaPartialOverlay = "", e.textContent = rd, s.head.append(e);
				}
				let c = s.createElement("ds-overlay");
				c.type = "popover", c.closeOnOutside = !0, c.returnFocus = () => t, c.setAttribute("data-aa-interactive", "");
				let l = t.getBoundingClientRect();
				c.anchor = {
					x: l.left,
					y: l.bottom
				};
				let u = s.createElement("dialog");
				u.className = "aa-partial-properties", u.setAttribute("aria-label", V("Edit button"));
				let d = s.createElement("ds-input");
				d.labelText = V("Label"), d.value = r.label, d.setAttribute("aria-label", V("Button label"));
				let f = s.createElement("label");
				f.textContent = V("State");
				let p = s.createElement("ds-select"), m = s.createElement("select");
				m.setAttribute("aria-label", V("Button state"));
				for (let e of md) {
					let t = s.createElement("option");
					t.value = e, t.textContent = e[0].toUpperCase() + e.slice(1), m.append(t);
				}
				m.value = r.state, p.append(m), f.append(p);
				let h = s.createElement("div");
				h.className = "aa-partial-actions";
				let g = s.createElement("ds-button");
				g.textContent = V("Cancel");
				let _ = s.createElement("ds-button");
				_.textContent = V("Apply"), _.primary = !0;
				let v = s.createElement("ds-button");
				v.inert = !0, v.setAttribute("aria-hidden", "true"), yd(v, r);
				let y = () => ({
					label: d.value,
					state: m.value
				}), b = () => yd(v, y());
				d.addEventListener("input", b), m.addEventListener("change", b);
				let x = () => {
					c.close(), c.remove(), a = void 0;
				};
				a = x, g.addEventListener("click", x), _.addEventListener("click", () => {
					if (!e()) {
						x();
						return;
					}
					let a = _d(y());
					x(), a !== n && (r = y(), n = a, yd(i, r), o(), t.dispatchEvent(new CustomEvent("aa-atom-source", {
						bubbles: !0,
						detail: { source: a }
					})));
				}), c.addEventListener("ds-close-request", (e) => {
					e.preventDefault(), x();
				}), h.append(g, _), u.append(d, f, v, h), c.append(u), (t.closest("dialog") ?? s.body).append(c), c.show({ immediate: !0 }).then(() => {
					c.isConnected && d.focus();
				});
			};
			return t.addEventListener("click", (e) => {
				e.preventDefault(), e.stopPropagation(), c();
			}), t.addEventListener("keydown", (n) => {
				(n.key === "Backspace" || n.key === "Delete") && e() && (n.preventDefault(), n.stopPropagation(), t.dispatchEvent(new CustomEvent("aa-atom-source", {
					bubbles: !0,
					detail: { source: "" }
				}))), (n.key === "Enter" || n.key === " ") && (n.preventDefault(), n.stopPropagation(), c());
			}), () => {
				s.disconnect(), a?.();
			};
		}
	};
}
function xd(e) {
	let t = e.element, n = t.ownerDocument, r = n.createElement("ds-menu");
	r.floating = !0, r.focusOnOpen = !1, r.setAttribute("aria-label", V("Button state")), r.id = `aa-partials-${crypto.randomUUID()}`;
	let i = null, a = !1, o = "", s = () => {
		r.open = !1, i = null;
	}, c = md.map((t, a) => {
		let o = n.createElement("ds-button");
		return o.menuItem = !0, o.setAttribute("role", "option"), o.id = `${r.id}-${a}`, o.textContent = t[0].toUpperCase() + t.slice(1), o.addEventListener("click", () => {
			let n = i;
			if (!n || e.readOnly || !/^@button$/i.test(e.value.slice(n.start, n.end))) return;
			let r = _d({
				label: "Button",
				state: t
			});
			s(), e.replace(n.start, n.end, r), e.selectRange(n.start + r.length);
		}), o;
	});
	r.append(...c), (t.closest("dialog") ?? n.body).append(r);
	let l = () => {
		if (a) return;
		let n = e.selection(), l = e.activeBlock();
		if (e.readOnly || !n || n.start !== n.end || !l || ["code", "table"].includes(l.block.kind)) {
			s();
			return;
		}
		let u = e.value.slice(l.start, n.end), d = /(?:^|\s)(@button)$/i.exec(u), f = `${n.end}:${e.value}`;
		if (!d || o === f) {
			s();
			return;
		}
		let p = e.rangeOf(n.end - 7, n.end);
		(p?.startContainer.parentElement)?.closest(".aa-c, code, a") ? s() : (i = {
			start: n.end - d[1].length,
			end: n.end
		}, r.controller = t.children[l.index], r.anchor = p?.getBoundingClientRect?.() ?? r.controller.getBoundingClientRect(), r.open || (r.activeId = c[0].id), r.open = !0, r.renderNow());
	};
	r.addEventListener("ds-menu-close", () => {
		o = `${e.selection()?.end}:${e.value}`, i = null;
	});
	let u = () => {
		a = !0, s();
	}, d = () => {
		a = !1, l();
	};
	return t.addEventListener("aa-change", l), t.addEventListener("aa-selectionchange", l), t.addEventListener("compositionstart", u), t.addEventListener("compositionend", d), () => {
		r.remove(), t.removeEventListener("aa-change", l), t.removeEventListener("aa-selectionchange", l), t.removeEventListener("compositionstart", u), t.removeEventListener("compositionend", d);
	};
}
//#endregion
//#region src/marks.ts
function Sd(e, t) {
	let n = (e) => e.match(/\s+|[^\s]+/g) ?? [], r = n(e), i = n(t);
	if (r.length * i.length > 6e4) return t.trim() ? [[0, t.length]] : [];
	let a = Array.from({ length: r.length + 1 }, () => new Uint16Array(i.length + 1));
	for (let e = r.length - 1; e >= 0; e--) for (let t = i.length - 1; t >= 0; t--) a[e][t] = r[e] === i[t] ? a[e + 1][t + 1] + 1 : Math.max(a[e + 1][t], a[e][t + 1]);
	let o = Array(i.length).fill(!1), s = 0, c = 0;
	for (; c < i.length;) s < r.length && r[s] === i[c] ? (s++, c++) : s < r.length && a[s + 1][c] >= a[s][c + 1] ? s++ : (o[c] = !0, c++);
	let l = [], u = 0;
	return i.forEach((e, t) => {
		let n = u;
		u += e.length, o[t] && e.trim() && (l.length && (o[t - 1] || t > 1 && !i[t - 1].trim() && o[t - 2]) ? l[l.length - 1][1] = u : l.push([n, u]));
	}), l;
}
function Cd(e, t) {
	let n = /^(\s*[-*+][ \t]+)\[([ xX])\]/, r = n.exec(e), i = n.exec(t);
	return !!r && !!i && r[2].toLowerCase() !== i[2].toLowerCase() && e.slice(r[0].length) === t.slice(i[0].length);
}
function wd(e, t) {
	let n = e.ownerDocument, r = n.defaultView, i = [], a = null, o = 0, s = () => i.filter((e) => e.blocks.every((e) => t.blocks().includes(e))), c = () => {
		o = 0, i = s(), t.shown?.(i);
		let r = t.elements(), c = t.blocks();
		for (let e of r) e.toggleAttribute("data-ai-box", i.some((t) => t.box && t.blocks.some((t) => r[c.indexOf(t)] === e)));
		if (!i.length) {
			a?.remove(), a = null;
			return;
		}
		if (!a) {
			let r = n.createElement("div");
			r.className = "aa-ai-marks", (t.root ?? e.closest("dialog") ?? n.body).append(r), a = r;
		}
		let u = i.map((e) => {
			let a = e.blocks.map((e) => r[c.indexOf(e)]?.getBoundingClientRect()).filter((e) => !!e);
			if (!a.length) return null;
			let o = e.blocks.length > 1 || e.before.length > 1 || /^(`{3,}|~{3,})/.test(e.blocks[0]?.source ?? ""), s = n.createElement("div");
			s.className = "aa-ai-mark", s.dataset.kind = o ? "section" : "dot";
			let u = Math.min(...a.map((e) => e.top)), d = Math.max(...a.map((e) => e.bottom)), f = Math.min(...a.map((e) => e.left)), p = Math.max(...a.map((e) => e.right));
			if (o) {
				let e = n.createElement("div");
				e.className = "aa-ai-hold", Object.assign(e.style, {
					left: `${f - 4}px`,
					top: `${u - 4}px`,
					width: `${p - f + 8}px`,
					height: `${d - u + 8}px`
				}), s.append(e);
			}
			let m = o ? {
				x: p,
				y: u + 10
			} : Td(r[c.indexOf(e.blocks[0])]) ?? {
				x: p,
				y: u + 10
			}, h = n.createElement("button");
			return h.type = "button", h.className = "aa-ai-revert", h.setAttribute("aria-label", V(o ? "Revert what AI wrote here" : "Revert what AI changed here")), h.title = V("Revert"), h.style.left = `${m.x}px`, h.style.top = `${m.y}px`, h.append(Object.assign(n.createElement("span"), { className: "aa-ai-dot" }), Object.assign(n.createElement("span"), {
				className: "aa-ai-label",
				textContent: V("Revert")
			})), h.addEventListener("pointerdown", (e) => {
				e.preventDefault(), e.stopPropagation();
			}), h.addEventListener("click", (n) => {
				n.preventDefault(), n.stopPropagation(), t.revert(e), i = i.filter((t) => t !== e), l();
			}), s.append(h), s;
		}).filter((e) => !!e);
		a.replaceChildren(...u);
	}, l = () => {
		o ||= r.requestAnimationFrame(c);
	}, u = () => {
		if (!i.length) return;
		e.setAttribute("data-ai-fading", ""), a?.setAttribute("data-fading", "");
		let t = r.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
		setTimeout(() => {
			e.removeAttribute("data-ai-fading"), i = [], c();
		}, t ? 0 : 400);
	}, d = typeof ResizeObserver > "u" ? null : new ResizeObserver(l);
	return d?.observe(e), r.addEventListener("scroll", l, !0), r.addEventListener("resize", l), r.visualViewport?.addEventListener("resize", l), {
		set(e) {
			i = e.filter((e) => e.blocks.length), c();
		},
		clear: u,
		get size() {
			return s().length;
		},
		draw: l,
		destroy() {
			o && r.cancelAnimationFrame(o), d?.disconnect(), r.removeEventListener("scroll", l, !0), r.removeEventListener("resize", l), r.visualViewport?.removeEventListener("resize", l), a?.remove();
		}
	};
}
function Td(e) {
	if (!e) return null;
	let t = e.ownerDocument.createTreeWalker(e, NodeFilter.SHOW_TEXT), n = null;
	for (let e = t.nextNode(); e; e = t.nextNode()) {
		let t = e.parentElement;
		(e.textContent ?? "").trim() && !t?.closest("[data-hidden], .aa-atom") && (n = e);
	}
	if (!n) return null;
	let r = (n.textContent ?? "").trimEnd().length;
	if (!r) return null;
	let i = e.ownerDocument.createRange();
	i.setStart(n, r - 1), i.setEnd(n, r);
	let a = Array.from(i.getClientRects()).pop();
	return a ? {
		x: a.right,
		y: a.top + a.height / 2
	} : null;
}
//#endregion
//#region src/prompt.ts
var Ed = "⟦here⟧", Dd = typeof navigator < "u" && /^((?!chrome|chromium|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);
function Od(e) {
	return e === "not-allowed" ? V(Dd ? "The microphone is blocked: allow it for this site in Safari › Settings › Websites › Microphone" : "The microphone is blocked: allow it for this site in the browser’s settings") : e === "service-not-allowed" ? V(Dd ? "Turn on Dictation in System Settings › Keyboard to speak here" : "Speaking is turned off in this browser") : e === "audio-capture" ? V("No microphone was found") : e === "network" ? V("Speaking needs a connection") : e === "no-speech" ? V("Nothing was heard: press Space twice to try again") : null;
}
function kd() {
	let e = globalThis, t = e.SpeechRecognition ?? e.webkitSpeechRecognition;
	return t ? new t() : null;
}
function Ad(e, t, n) {
	return e ? .85 : Math.min(1, .55 + .3 * t + .3 * n);
}
function jd(e, t) {
	if (t.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return {
		followVoice: null,
		stop: () => {}
	};
	let n = 0, r = !1, i = 0, a = Ad(!1, 0, 0), o = null, s, c, l = /* @__PURE__ */ new Float32Array(512), u = performance.now(), d = -Infinity, f = !1, p = null, m = (t) => {
		if (r) return;
		o && (o.getFloatTimeDomainData(l), i += (Math.min(1, Math.sqrt(l.reduce((e, t) => e + t * t, 0) / l.length) * 8) - i) * .15);
		let s = e.getBoundingClientRect();
		p && (Math.abs(s.left - p.x) > .5 || Math.abs(s.top - p.y) > .5) && (d = t), p = {
			x: s.left,
			y: s.top
		};
		let c = t - d < 500;
		f && !c && (u = t), f = c;
		let h = .5 - .5 * Math.cos((t - u) / 2400 * 2 * Math.PI);
		a += (Ad(c, h, i) - a) * .12, e.style.opacity = a.toFixed(3), n = requestAnimationFrame(m);
	};
	return n = requestAnimationFrame(m), {
		followVoice: async () => {
			if (!Dd && navigator.mediaDevices?.getUserMedia && typeof AudioContext < "u") try {
				let e = await navigator.mediaDevices.getUserMedia({ audio: !0 });
				if (r) {
					e.getTracks().forEach((e) => e.stop());
					return;
				}
				s = e, c = new AudioContext(), o = c.createAnalyser(), o.fftSize = l.length, c.createMediaStreamSource(e).connect(o);
			} catch {}
		},
		stop: () => {
			r = !0, cancelAnimationFrame(n), s?.getTracks().forEach((e) => e.stop()), c?.close();
		}
	};
}
var Md = () => {
	let e = globalThis;
	return !!(e.SpeechRecognition ?? e.webkitSpeechRecognition);
};
function Nd(e) {
	let t = kd();
	if (!t) return null;
	let n = null, r = !1;
	t.lang = e.lang, t.continuous = !0, t.interimResults = !0, t.onresult = (t) => {
		let n = "";
		for (let e = 0; e < t.results.length; e++) n += t.results[e][0]?.transcript ?? "";
		e.heard(n.replace(/\s+/g, " ").trim());
	};
	let i = () => {
		r || (r = !0, e.end(n));
	};
	t.onend = i, t.onerror = (e) => {
		n = Od(e.error) ?? n, i();
	}, e.audio && (t.onaudiostart = e.audio);
	try {
		t.start();
	} catch {
		return n = V("Speaking could not start here"), i(), null;
	}
	return {
		stop: () => t.stop(),
		abort: () => {
			t.abort(), i();
		}
	};
}
function Pd(e) {
	let t = e.type.ownerDocument, n = t.defaultView, r = t.createElement("div");
	r.className = "aa-prompt", r.setAttribute("role", "textbox"), r.setAttribute("aria-label", V("Ask AI")), r.dataset.placeholder = e.placeholder ?? V("Ask AI or press space to speak"), r.spellcheck = !1;
	try {
		r.contentEditable = "plaintext-only";
	} catch {
		r.contentEditable = "true";
	}
	r.contentEditable !== "plaintext-only" && (r.contentEditable = "true");
	let i = n.getComputedStyle(e.type);
	for (let e of [
		"font-family",
		"font-size",
		"font-weight",
		"letter-spacing",
		"line-height"
	]) r.style.setProperty(e, i.getPropertyValue(e));
	let a = ya(i.color);
	a !== null && a > .5 && (r.dataset.dark = "");
	let o = e.root ?? t.body;
	o.append(r);
	let s = typeof ResizeObserver > "u" ? null : new ResizeObserver(() => e.grow?.(r.offsetHeight));
	s?.observe(r);
	let c = o === t.body;
	c && (r.dataset.placed = "page");
	let l = () => {
		if (!c) return {
			x: 0,
			y: 0
		};
		if (n.getComputedStyle(o).position !== "static") {
			let e = o.getBoundingClientRect();
			return {
				x: -e.left - o.clientLeft,
				y: -e.top - o.clientTop
			};
		}
		return {
			x: n.scrollX,
			y: n.scrollY
		};
	}, u = () => {
		let t = e.place(), n = l();
		Object.assign(r.style, {
			left: `${t.left + n.x}px`,
			top: `${t.top + n.y}px`,
			width: `${Math.max(t.width, 80)}px`,
			minHeight: `${t.height}px`,
			textIndent: e.indent ? `${e.indent}px` : ""
		});
	};
	u(), r.focus({ preventScroll: !0 });
	let d = !1, f = null, p = () => {}, m = null, h = null, g = null, _ = null, v = () => {
		if (!g) return;
		let e = t.createRange();
		e.setStartBefore(g), e.collapse(!0);
		let r = n.getSelection();
		r?.removeAllRanges(), r?.addRange(e);
	}, y = () => {
		g && g.toggleAttribute("data-after", !!S());
	}, b = () => {
		g?.remove(), g = null, _ &&= (_.stop(), null);
	}, x = () => {
		if (!g) return null;
		let e = jd(g, n);
		return _ = {
			frame: 0,
			stop: e.stop
		}, e.followVoice;
	}, S = () => (r.textContent ?? "").replace(/\s+/g, " ").trim(), C = (t = !1) => {
		d || (d = !0, f?.abort(), m?.abort(), b(), p(), s?.disconnect(), r.remove(), e.grow?.(0), n.removeEventListener("scroll", u, !0), n.removeEventListener("resize", u), e.close(t));
	}, w = () => {
		let i = kd();
		if (!i) {
			r.dataset.placeholder = V("Speaking is not available in this browser");
			return;
		}
		m = i, r.dataset.listening = "", g = Object.assign(t.createElement("span"), {
			className: "aa-prompt-caret",
			contentEditable: "false"
		}), g.setAttribute("aria-hidden", "true"), r.append(g), y(), v(), r.dataset.placeholder = V("Listening…"), i.lang = t.documentElement.lang || navigator.language, i.continuous = !0, i.interimResults = !0;
		let a = null;
		i.onresult = (e) => {
			for (let n = e.resultIndex; n < e.results.length; n++) {
				let i = e.results[n], a = i[0]?.transcript ?? "";
				h ??= Object.assign(t.createElement("i"), {
					className: "aa-prompt-heard",
					contentEditable: "false"
				}), h.isConnected || (g ? g.before(h) : r.append(h)), h.textContent = `${h.previousSibling && !/\s$/.test(h.previousSibling.textContent ?? "") ? " " : ""}${a.trim()}`, i.isFinal && (h.removeAttribute("class"), h.removeAttribute("contenteditable"), h.textContent = `${S() && !/\s$/.test(r.textContent ?? "") && h.previousSibling ? " " : ""}${a.trim()}`, h = null);
			}
			y();
			let i = n.getSelection();
			i?.rangeCount && r.contains(i.anchorNode) && !(i.isCollapsed && g && i.anchorNode === r && r.childNodes[i.anchorOffset] === g) || v();
		}, i.onend = () => {
			m = null, b(), delete r.dataset.listening, r.dataset.placeholder = a ?? e.placeholder ?? V("Ask AI to write");
		}, i.onerror = (e) => {
			a = Od(e.error) ?? a, i.onend?.();
		};
		try {
			i.start();
		} catch {
			a = V("Speaking could not start here"), i.onend?.();
			return;
		}
		let o = x();
		o && (i.onaudiostart = () => {
			o();
		});
	}, T = async () => {
		let t = S();
		if (t && !f) {
			m?.stop(), f = new AbortController(), r.contentEditable = "false", r.dataset.loading = "", r.setAttribute("aria-busy", "true"), p = Fd([r, ...e.about()]);
			try {
				await e.send(t, f.signal), C(!0);
			} catch {
				if (d) return;
				p(), f = null, delete r.dataset.loading, r.removeAttribute("aria-busy"), r.dataset.failed = "", r.contentEditable = "plaintext-only", r.contentEditable !== "plaintext-only" && (r.contentEditable = "true"), r.focus({ preventScroll: !0 });
			}
		}
	};
	r.addEventListener("keydown", (e) => {
		e.stopPropagation(), !e.isComposing && (delete r.dataset.failed, e.key === "Escape" ? (e.preventDefault(), C()) : e.key === "Enter" && !e.shiftKey ? (e.preventDefault(), T()) : e.key === "Backspace" && !r.textContent ? (e.preventDefault(), C()) : e.key === " " && !r.textContent && !m && (e.preventDefault(), w()));
	}), r.addEventListener("beforeinput", (e) => {
		e.stopPropagation(), !(e.isComposing || m || r.textContent) && e.inputType === "insertText" && (e.data === " " || e.data === "\xA0") && (e.preventDefault(), w());
	});
	for (let e of [
		"keyup",
		"keypress",
		"input",
		"paste",
		"cut",
		"copy",
		"pointerdown",
		"click"
	]) r.addEventListener(e, (e) => e.stopPropagation());
	return r.addEventListener("blur", () => {
		!f && !m && !S() && C();
	}), n.addEventListener("scroll", u, !0), n.addEventListener("resize", u), e.listen && w(), {
		element: r,
		close: () => C()
	};
}
function Fd(e, t) {
	let n = [];
	for (let t of e) {
		if (!(t instanceof HTMLElement) || !t.isConnected) continue;
		let e = t.ownerDocument.defaultView;
		e && !e.matchMedia?.("(forced-colors: active)").matches && (t.setAttribute("data-aa-glisten", ""), t.style.setProperty("--aa-glisten-delay", `${n.length % 6 * 120}ms`), n.push(t));
	}
	return () => {
		for (let e of n) e.removeAttribute("data-aa-glisten"), e.style.removeProperty("--aa-glisten-delay");
	};
}
//#endregion
//#region src/comments-view.ts
var Id = 800, Ld = (e) => {
	let t = document.createElement("span");
	t.className = "aa-icon";
	let n = ur[`./icons/${e}.svg`];
	return n && (t.style.maskImage = `url("data:image/svg+xml,${encodeURIComponent(n.replace(/currentColor/g, "black"))}")`), t;
}, Rd = (e, t, n) => {
	let r = V(e), i = document.createElement("button");
	return i.type = "button", i.className = "aa-comments-button", i.dataset.tooltip = r, i.setAttribute("aria-label", r), i.append(Ld(t)), i.addEventListener("click", (e) => {
		e.preventDefault(), n();
	}), i;
}, zd = (e, t, n = "") => {
	let r = document.createElement("button");
	return r.type = "button", r.className = `aa-comments-word ${n}`.trim(), r.textContent = V(e), r.addEventListener("click", (e) => {
		e.preventDefault(), t();
	}), r;
}, Bd = (e) => {
	let t = document.createElement("span");
	return t.className = "aa-avatar ds-avatar", t.textContent = Te(e.name), t.style.setProperty("--aa-person", De(e)), t.setAttribute("aria-hidden", "true"), t;
};
function Vd(e, t) {
	let { store: n } = t, r = e.ownerDocument, i = r.defaultView, a = t.root ?? e.closest("dialog") ?? r.body, o = n.panel ?? null, s = [], c = [], l = t.value(), u = null, d = null, f = null, p = null, m = !1, h = 0, g, _ = /* @__PURE__ */ new Map(), v = null, y = null, b = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Set(), S = /* @__PURE__ */ new Map(), C = null, w = null, T = "open", E = (e) => o && T === "resolved" ? !!e.resolvedAt : !e.resolvedAt, D = () => !!n.me && !t.readOnly(), ee = () => c.find((e) => e.id === u) ?? null, O = () => {
		let e = [];
		for (let t of c) {
			if (t.orphaned || !E(t)) continue;
			let n = [
				"aa-comment",
				t.id === u ? "aa-comment--open" : "",
				t.unread ? "aa-comment--unread" : "",
				t.resolvedAt ? "aa-comment--resolved" : ""
			].filter(Boolean).join(" ");
			e.push({
				from: t.from,
				to: t.to,
				className: n,
				attributes: { "data-comment": t.id }
			});
		}
		f && e.push({
			from: f.from,
			to: f.to,
			className: "aa-comment aa-comment--open aa-comment--draft",
			attributes: { "data-comment": "draft" }
		}), t.decorate(e);
	}, te = (t) => Array.from(e.querySelectorAll("[data-comment]")).filter((e) => (e.getAttribute("data-comment") ?? "").split(" ").includes(t)).flatMap((e) => Array.from(e.getClientRects())), ne = (e) => {
		if (n.move && e.length) {
			for (let t of e) _.set(t.id, t);
			clearTimeout(g), g = setTimeout(() => {
				let e = [..._.values()];
				_ = /* @__PURE__ */ new Map(), s = s.map((t) => {
					let n = e.find((e) => e.id === t.id);
					return n ? {
						...t,
						...n
					} : t;
				}), Promise.resolve(n.move(e)).catch(() => {});
			}, Id);
		}
	}, re = (e) => {
		if (!m) {
			if (s = e, l = t.value(), c = ge(e, t.value()), u && !c.some((e) => e.id === u) && (u = null), p) {
				let e = c.find((e) => e.from === p.from && e.to === p.to && !e.resolvedAt);
				e && (p = null, f = null, u = e.id, n.seen?.(e.id));
			}
			ne(_e(s, c)), O(), K();
		}
	}, k = () => {
		if (m) return;
		let e = t.value();
		if (e === l) return;
		let n = pe(l, e);
		if (l = e, c = he(c, n, e).map((t) => {
			if (!t.orphaned) return t;
			let n = s.find((e) => e.id === t.id), r = n && !n.orphaned && H(n, e);
			return r ? {
				...t,
				...r,
				quote: n.quote,
				orphaned: !1
			} : t;
		}), f) {
			let t = me(f, n);
			f = t ? {
				...t,
				quote: e.slice(t.from, t.to)
			} : null, f || ie();
		}
		ne(_e(s, c)), O(), K();
	}, A = () => {
		if (m) return;
		let e = t.selection();
		if (!e || e.start !== e.end) return;
		let n = U(c, e.start);
		n.length ? u && n.some((e) => e.id === u) || n[0].id !== d && N(n[0].id) : (d = null, u && !o && !f && (u = null, O(), K()));
	}, j = () => A(), M = (t) => {
		let n = t.target?.closest?.("[data-comment]");
		if (!n || !e.contains(n)) return;
		let r = (n.getAttribute("data-comment") ?? "").split(" ").find((e) => e !== "draft");
		r && N(r);
	};
	e.addEventListener("aa-selectionchange", j), e.addEventListener("aa-change", k), e.addEventListener("click", M);
	let N = (e) => {
		let t = c.find((t) => t.id === e);
		t && (o && (T = t.resolvedAt ? "resolved" : "open"), f && (f = null, S.delete("draft")), u = e, d = null, C = null, w = null, t.unread && Promise.resolve(n.seen?.(e)).catch(() => {}), O(), K(), o && v?.querySelector(`[data-thread="${e}"]`)?.scrollIntoView({ block: "nearest" }));
	}, ie = () => {
		f = null, S.delete("draft"), p = null;
	}, ae = () => {
		let n = !!u || !!f;
		u && (d = u);
		let i = ee()?.to ?? f?.to;
		return u = null, ie(), C = null, w = null, L(), je(), O(), K(), n && i !== void 0 && !e.contains(r.activeElement) && t.selectRange(i), n;
	}, oe = () => {
		if (!D()) return !1;
		let e = t.selection();
		if (!e || e.start === e.end) return !1;
		let n = t.value(), r = Math.min(e.start, e.end), i = Math.max(e.start, e.end), a = n.slice(r, i);
		return a.trim() ? (u = null, f = {
			from: r,
			to: i,
			quote: a
		}, C = null, w = null, O(), K(), v?.querySelector("textarea")?.focus(), !0) : !1;
	}, P = (e, t) => {
		b.set(e, t instanceof Error && t.message ? t.message : V("Not saved")), K(), setTimeout(() => {
			b.get(e) && (b.delete(e), K());
		}, 4e3);
	}, se = async (e, t, n) => {
		if (!x.has(e)) {
			x.add(e), K();
			try {
				await t(), n?.();
			} catch (t) {
				P(e, t);
			} finally {
				x.delete(e), K();
			}
		}
	}, F = /* @__PURE__ */ new Map(), I = (e, t) => {
		let r = t.trim();
		if (!r || !D()) return;
		let i = xe(r, [...F.values()]);
		if (e === "draft") {
			if (!f) return;
			let t = f;
			p = t, se(e, () => n.add(t, r, i), () => {
				S.delete("draft"), f = null, O(), K();
			}).then(() => {
				b.has("draft") && (p = null);
			});
		} else se(e, () => n.reply(e, r, i), () => {
			S.delete(e), K();
		});
	}, L = () => {
		y?.remove(), y = null;
	}, R = [], ce = 0, z = null, le = null, ue = 0, B = (e) => {
		if (!z || !le) return;
		F.set(e.id, e);
		let t = z, { start: n } = le, r = t.selectionStart ?? t.value.length;
		t.value = `${t.value.slice(0, n)}@${e.name} ${t.value.slice(r)}`;
		let i = n + e.name.length + 2;
		t.setSelectionRange(i, i), t.dispatchEvent(new Event("input", { bubbles: !0 })), L(), t.focus();
	}, be = () => {
		if (y && (y.replaceChildren(...R.map((e, t) => {
			let n = r.createElement("button");
			n.type = "button", n.setAttribute("role", "option"), n.className = "note-menu-row", n.setAttribute("aria-selected", String(t === ce)), n.toggleAttribute("data-current", t === ce);
			let i = r.createElement("span");
			return i.textContent = e.name, n.append(Bd(e), i), n.addEventListener("pointerdown", (e) => e.preventDefault()), n.addEventListener("click", () => B(e)), n;
		})), !R.length)) {
			let e = r.createElement("span");
			e.className = "aa-menu-empty", e.textContent = V("Nobody to mention"), y.append(e);
		}
	}, Ce = () => {
		if (!y || !z) return;
		let t = z.getBoundingClientRect(), n = 20 * (parseFloat(getComputedStyle(e).getPropertyValue("--aa-sf")) || 1), r = Math.max(1, Math.min(R.length, 8)) * n, a = t.bottom + n / 2;
		y.style.left = `${Math.max(0, Math.min(t.left, i.innerWidth - 4 * n))}px`, y.style.top = `${a + r <= i.innerHeight ? a : Math.max(0, t.top - n / 2 - r)}px`;
	}, we = (e) => {
		if (!n.people) return;
		let t = W(e.value, e.selectionStart ?? e.value.length);
		if (!t) {
			L();
			return;
		}
		z = e, le = t;
		let i = ++ue;
		Promise.resolve(n.people(t.query)).then((t) => {
			if (!m && i === ue && z && z === e) {
				R = t.slice(0, 8);
				for (let e of R) F.set(e.id, e);
				y || (y = r.createElement("div"), y.className = "aa-controls aa-menu aa-comments-people", y.setAttribute("role", "listbox"), y.setAttribute("aria-label", V("People to mention")), a.append(y)), ce = Math.min(ce, Math.max(0, R.length - 1)), be(), Ce();
			}
		}).catch(() => L());
	}, Te = (e) => y ? e.key === "ArrowDown" || e.key === "ArrowUp" ? (e.preventDefault(), ce = (ce + (e.key === "ArrowDown" ? 1 : R.length - 1)) % Math.max(1, R.length), be(), !0) : (e.key === "Enter" || e.key === "Tab") && R.length ? (e.preventDefault(), B(R[ce]), !0) : e.key === "Escape" && (e.preventDefault(), L(), !0) : !1, Ee = (e, t) => {
		let n = t.filter((e) => e.name.trim()).sort((e, t) => t.name.length - e.name.length), i = n.length ? new RegExp(n.map((e) => `@${e.name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).join("|"), "g") : null;
		if (!i) return [e];
		let a = [], o = 0;
		for (let t of e.matchAll(i)) {
			a.push(e.slice(o, t.index));
			let i = r.createElement("span");
			i.className = "aa-comment-mention", i.textContent = t[0];
			let s = n.find((e) => `@${e.name.trim()}` === t[0]);
			s && i.style.setProperty("--aa-person", De(s)), a.push(i), o = t.index + t[0].length;
		}
		return a.push(e.slice(o)), a;
	}, Oe = (e) => {
		e.style.height = "0px";
		let t = e.scrollHeight;
		e.style.height = t ? `${t}px` : "";
	}, ke = (e, a) => {
		let o = r.createElement("form");
		o.className = "aa-composer", o.setAttribute("aria-label", a), n.me && o.append(Bd(n.me));
		let s = r.createElement("textarea"), l = Md(), u = `${a.charAt(0).toLowerCase()}${a.slice(1)}`, d = l ? V("Press space to speak, or {action}", { action: u }) : t.prompt ? V("Press space for AI, or {action}", { action: u }) : a;
		s.rows = 1, s.placeholder = d, s.setAttribute("aria-label", a), s.value = S.get(e) ?? "";
		let p = r.createElement("span");
		p.className = "aa-composer-field";
		let m = r.createElement("span");
		m.className = "aa-composer-backdrop", m.setAttribute("aria-hidden", "true"), p.append(m, s);
		let h = null, g = () => {
			let e = s.value.includes("@") ? xe(s.value, [...F.values()]) : [];
			if (s.toggleAttribute("data-mentions", e.length > 0), h) {
				h.toggleAttribute("data-after", !!s.value);
				let t = s.value ? [] : [Object.assign(r.createElement("span"), {
					className: "aa-composer-listening",
					textContent: V("Listening…")
				})];
				m.replaceChildren(...Ee(s.value, e), h, ...t);
			} else e.length ? m.replaceChildren(...Ee(s.value, e), "​") : m.replaceChildren();
		};
		g(), s.disabled = x.has(e);
		let _ = null, v = () => {
			_?.abort(), _ = null, delete s.dataset.asking, s.removeAttribute("data-aa-glisten"), s.placeholder = d;
		}, b = async () => {
			let n = s.value.trim();
			if (!n || !t.prompt || !_) return;
			let i = e === "draft" ? null : c.find((t) => t.id === e), a = e === "draft" ? f?.quote ?? "" : i?.quote ?? "", o = i ? i.comments.map((e) => `${e.author.name}: ${e.body}`).join("\n\n") : "", { signal: l } = _, u = Object.assign(r.createElement("span"), {
				className: "aa-composer-thinking",
				textContent: V("Thinking…")
			});
			u.setAttribute("data-aa-glisten", ""), u.setAttribute("role", "status"), p.before(u), p.hidden = !0, s.readOnly = !0;
			try {
				let r = await t.prompt(n, {
					kind: "writing",
					signal: l,
					text: a,
					before: o,
					after: ""
				});
				if (l.aborted) return;
				let i = typeof r == "string" ? r : r.insert ?? r.document ?? "";
				s.value = i.trim(), S.set(e, s.value);
			} catch (t) {
				l.aborted || P(e, t);
			} finally {
				u.remove(), p.hidden = !1, s.readOnly = !1, v(), g(), Oe(s), s.focus();
			}
		}, C = null, w = () => {
			let t = s.value, n = null;
			C = Nd({
				lang: r.documentElement.lang || navigator.language,
				heard: (n) => {
					s.isConnected ? (s.value = `${t}${t && n ? " " : ""}${n}`, S.set(e, s.value), g(), Oe(s)) : C?.abort();
				},
				audio: () => {
					n?.followVoice?.();
				},
				end: (e) => {
					C = null, n?.stop(), h = null, delete s.dataset.listening, s.placeholder = e ?? d, g();
				}
			}), C && (s.dataset.listening = "", s.placeholder = "", h = Object.assign(r.createElement("span"), { className: "aa-prompt-caret" }), n = jd(h, i), g());
		};
		s.addEventListener("blur", () => C?.stop()), s.addEventListener("input", () => {
			S.set(e, s.value), g(), Oe(s), _ || we(s);
		}), s.addEventListener("keydown", (n) => {
			if (!Te(n)) {
				if (C && !n.isComposing) {
					if (n.key === "Escape") {
						n.preventDefault(), n.stopPropagation(), C.abort();
						return;
					}
					if (n.key === "Enter" && !n.shiftKey) {
						n.preventDefault(), C.abort(), I(e, s.value);
						return;
					}
					C.stop();
				}
				if (n.key === "Backspace" && !n.isComposing && s.selectionStart === s.selectionEnd) {
					let e = s.selectionStart ?? 0, t = s.value.slice(0, e), r = xe(s.value, [...F.values()]).find((e) => t.endsWith(`@${e.name.trim()}`));
					if (r) {
						n.preventDefault();
						let t = e - r.name.trim().length - 1;
						s.setRangeText("", t, e, "end"), s.dispatchEvent(new Event("input", { bubbles: !0 }));
						return;
					}
				}
				n.key === " " && !s.value && l && !n.isComposing ? (n.preventDefault(), w()) : n.key === " " && !s.value && t.prompt && !_ && !n.isComposing ? (n.preventDefault(), _ = new AbortController(), s.dataset.asking = "", s.placeholder = V("Ask AI about these words")) : _ ? (n.key === "Enter" && !n.shiftKey && !n.isComposing && (n.preventDefault(), b()), (n.key === "Escape" || n.key === "Backspace" && !s.value) && (n.preventDefault(), v(), s.value = "", S.delete(e))) : (n.key === "Enter" && !n.shiftKey && !n.isComposing && (n.preventDefault(), I(e, s.value)), n.key === "Escape" && (n.preventDefault(), ae()));
			}
		}), s.addEventListener("blur", () => setTimeout(() => {
			z === s && !y?.contains(r.activeElement) && L();
		}, 120));
		let T = Rd(e === "draft" ? "Comment" : "Reply", "send", () => I(e, s.value));
		return T.classList.add("aa-composer-send"), T.disabled = x.has(e), o.append(p, T), o.addEventListener("submit", (t) => {
			t.preventDefault(), I(e, s.value);
		}), i.requestAnimationFrame(() => Oe(s)), o;
	}, Ae = (e, t) => {
		let a = r.createElement("div");
		a.className = t.internal ? "aa-comment-entry aa-comment-entry--internal" : "aa-comment-entry";
		let o = r.createElement("div");
		o.className = "aa-comment-meta";
		let s = r.createElement("span");
		s.className = "aa-comment-author", s.textContent = t.author.name;
		let c = r.createElement("time");
		if (c.className = "aa-comment-time", c.dateTime = new Date(t.createdAt).toISOString(), c.textContent = `${Se(t.createdAt)}${C === t.id ? ` · ${V("Editing")}` : t.editedAt ? ` · ${V("Edited")}` : ""}`, c.title = new Date(t.createdAt).toLocaleString(de()), o.append(Bd(t.author), s, c), t.internal) {
			let e = r.createElement("span");
			e.className = "aa-comment-internal", e.textContent = V("Internal"), o.append(e);
		}
		if (n.me && t.author.id === n.me.id && n.edit && D() && !e.resolvedAt && C !== t.id && o.append(zd("Edit", () => {
			C = t.id, S.set(`edit:${t.id}`, t.body), K(), v?.querySelector(`[data-edit="${t.id}"]`)?.focus();
		}, "aa-comment-edit")), a.append(o), C === t.id) {
			let e = r.createElement("textarea");
			e.className = "aa-comment-body aa-comment-editing", e.setAttribute("aria-label", V("Edit comment")), e.dataset.edit = t.id, e.value = S.get(`edit:${t.id}`) ?? t.body, e.rows = Math.max(1, e.value.split("\n").length);
			let o = () => {
				let r = e.value.trim();
				r && se(`edit:${t.id}`, () => n.edit(t.id, r), () => {
					C = null, S.delete(`edit:${t.id}`);
				});
			};
			e.addEventListener("input", () => {
				S.set(`edit:${t.id}`, e.value), Oe(e);
			}), e.addEventListener("keydown", (e) => {
				e.key === "Enter" && !e.shiftKey && !e.isComposing && (e.preventDefault(), o()), e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), C = null, S.delete(`edit:${t.id}`), K());
			}), a.append(e), i.requestAnimationFrame(() => Oe(e));
		} else {
			let e = r.createElement("p");
			e.className = "aa-comment-body", e.append(...Ee(t.body, t.mentions ?? [])), a.append(e);
		}
		let l = !!n.react && D() && !e.resolvedAt;
		if (t.reactions?.length || l) {
			let e = r.createElement("div");
			e.className = "aa-comment-reactions";
			for (let i of t.reactions ?? []) {
				let a = r.createElement("button");
				a.type = "button", a.className = "aa-reaction", a.setAttribute("aria-pressed", String(i.reacted)), a.setAttribute("aria-label", `${i.emoji} ${i.count}${i.names.length ? `, from ${i.names.join(", ")}` : ""}${i.reacted ? ", you too" : ""}`), a.title = [...i.names, ...i.reacted ? ["You"] : []].join(", "), a.append(Object.assign(r.createElement("span"), {
					className: "aa-reaction-emoji",
					textContent: i.emoji
				}), Object.assign(r.createElement("span"), {
					className: "aa-reaction-count",
					textContent: String(i.count)
				})), a.disabled = !l, a.addEventListener("click", (e) => {
					e.preventDefault(), se(`react:${t.id}`, () => n.react(t.id, i.emoji));
				}), e.append(a);
			}
			if (l) {
				let n = Rd("Add reaction", "plus", () => Me(n, t.id));
				n.classList.add("aa-reaction-add"), e.append(n);
			}
			a.append(e);
		}
		let u = b.get(`edit:${t.id}`) ?? b.get(`react:${t.id}`);
		if (u) {
			let e = r.createElement("p");
			e.className = "aa-comments-error", e.setAttribute("role", "alert"), e.textContent = u, a.append(e);
		}
		return a;
	}, G = null, je = () => {
		G?.remove(), G = null;
	}, Me = (t, o) => {
		je(), G = r.createElement("div"), G.className = "aa-controls aa-menu aa-reaction-picker", G.setAttribute("role", "menu"), G.setAttribute("aria-label", "Reactions");
		for (let e of fe) {
			let t = r.createElement("button");
			t.type = "button", t.setAttribute("role", "menuitem"), t.textContent = e, t.setAttribute("aria-label", V("React with {emoji}", { emoji: e })), t.addEventListener("pointerdown", (e) => e.preventDefault()), t.addEventListener("click", (t) => {
				t.preventDefault(), je(), se(`react:${o}`, () => n.react(o, e));
			}), G.append(t);
		}
		G.addEventListener("keydown", (e) => {
			e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), je(), t.focus());
		}), a.append(G);
		let s = t.getBoundingClientRect(), c = 20 * (parseFloat(getComputedStyle(e).getPropertyValue("--aa-sf")) || 1), l = 8 * c, u = 2 * c, d = 4 * c / 20, f = t.closest(".aa-comments")?.getBoundingClientRect(), p = Math.max(0, f?.left ?? 0), m = Math.min(i.innerWidth, f?.right ?? i.innerWidth), h = s.right + d + l <= m ? s.right + d : s.left - d - l >= p ? s.left - d - l : null;
		G.style.left = `${h ?? Math.max(p, Math.min(s.left, m - l))}px`, G.style.top = `${h === null ? s.bottom + d + u <= i.innerHeight ? s.bottom + d : Math.max(0, s.top - d - u) : Math.max(0, Math.min(s.top, i.innerHeight - u))}px`, G.querySelector("button")?.focus();
	}, Ne = (e) => e.comments.length >= 3 && e.comments.reduce((e, t) => e + 1 + Math.ceil(t.body.length / 40), 0) >= 10, Pe = (e, i) => {
		let a = r.createElement("article");
		a.className = "aa-thread", a.dataset.thread = e.id, a.toggleAttribute("data-open", i), a.toggleAttribute("data-resolved", !!e.resolvedAt), a.toggleAttribute("data-orphaned", e.orphaned), a.toggleAttribute("data-unread", !!e.unread);
		let s = r.createElement(o ? "button" : "div");
		s.className = "aa-thread-head", s instanceof HTMLButtonElement && (s.type = "button", s.setAttribute("aria-expanded", String(i)), s.addEventListener("click", () => {
			i ? (u = null, O(), K()) : (N(e.id), t.selectRange(e.from, e.to));
		}));
		let l = !!o || e.orphaned;
		if (l) {
			let t = r.createElement("span");
			t.className = "aa-thread-quote", t.textContent = e.orphaned ? `“${e.quote}” is no longer in the text` : e.quote.replace(/\s+/g, " "), t.title = e.quote, s.append(t);
		}
		if (!i) {
			let t = r.createElement("span");
			t.className = "aa-thread-count", t.textContent = String(e.comments.length), s.append(t);
		}
		if (a.append(s), !i) return a;
		let d = r.createElement("div");
		d.className = "aa-thread-actions";
		let f = ve(c).filter((e) => !e.orphaned && !e.resolvedAt), p = f.findIndex((t) => t.id === e.id);
		if (!o && f.length > 1 && p >= 0) {
			let e = (e) => {
				let n = f[(p + e + f.length) % f.length];
				t.selectRange(n.from), N(n.id);
			};
			d.append(Rd("Previous comment", "chevron-up", () => e(-1)), Rd("Next comment", "chevron-down", () => e(1)));
		}
		if (D() && (e.resolvedAt ? d.append(zd("Reopen", () => void se(`resolve:${e.id}`, () => n.resolve(e.id, !1)), "aa-thread-reopen")) : d.append(Rd("Resolve", "check", () => void se(`resolve:${e.id}`, () => n.resolve(e.id, !0), () => {
			o || ae();
		}))), n.remove && e.canDelete)) {
			let t = w === e.id ? zd("Delete?", () => void se(`remove:${e.id}`, () => n.remove(e.id), () => {
				w = null, u === e.id && (u = null);
			}), "aa-thread-delete") : Rd("Delete thread", "delete", () => {
				w = e.id, K();
			});
			d.append(t);
		}
		!l && Ne(e) && (s.append(Object.assign(r.createElement("span"), {
			className: "aa-thread-title",
			textContent: `${e.comments.length} comments`
		})), a.toggleAttribute("data-titled", !0)), s.append(d);
		for (let t of e.comments) a.append(Ae(e, t));
		let m = b.get(`resolve:${e.id}`) ?? b.get(`remove:${e.id}`) ?? b.get(e.id);
		if (m) {
			let e = r.createElement("p");
			e.className = "aa-comments-error", e.setAttribute("role", "alert"), e.textContent = m, a.append(e);
		}
		if (e.resolvedAt) {
			let t = r.createElement("p");
			t.className = "aa-thread-resolved", t.textContent = e.resolvedBy ? V("Resolved by {name}.", { name: e.resolvedBy.name }) : V("Resolved."), a.append(t);
		} else D() && a.append(ke(e.id, V("Reply")));
		return a;
	}, Fe = () => {
		let e = r.createElement("article");
		e.className = "aa-thread", e.dataset.thread = "draft", e.setAttribute("data-open", "");
		let t = ke("draft", V("Add a comment"));
		if (o) {
			let n = r.createElement("div");
			n.className = "aa-thread-head";
			let i = r.createElement("span");
			i.className = "aa-thread-quote", i.textContent = f.quote.replace(/\s+/g, " "), n.append(i), e.append(n, t);
		} else e.append(t);
		let n = b.get("draft");
		if (n) {
			let t = r.createElement("p");
			t.className = "aa-comments-error", t.setAttribute("role", "alert"), t.textContent = n, e.append(t);
		}
		return e;
	}, Ie = () => v || (v = o ?? r.createElement("div"), v.classList.add("aa-comments"), v.dataset.mode = o ? "panel" : "popover", v.setAttribute("role", o ? "region" : "dialog"), v.setAttribute("aria-label", V("Comments")), v.addEventListener("keydown", (e) => {
		e.key === "Escape" && !y && !G && !C && (e.preventDefault(), ae());
	}), o || a.append(v), v), K = () => {
		if (m) return;
		let e = v?.getRootNode()?.activeElement ?? r.activeElement, t = v?.contains(e) ? e : null, n = t?.closest("[data-thread]")?.dataset.thread, i = t instanceof HTMLTextAreaElement ? {
			start: t.selectionStart,
			end: t.selectionEnd,
			edit: t.dataset.edit
		} : null;
		if (o) {
			let e = Ie(), t = ye(c), n = r.createElement("div");
			n.className = "aa-comments-tabs", n.setAttribute("role", "tablist"), n.setAttribute("aria-label", V("Comments"));
			for (let [e, i, a] of [[
				"open",
				"Open",
				t.open
			], [
				"resolved",
				"Resolved",
				t.resolved
			]]) {
				let t = r.createElement("button");
				t.type = "button", t.setAttribute("role", "tab"), t.dataset.tab = e, t.setAttribute("aria-selected", String(T === e)), t.tabIndex = T === e ? 0 : -1, t.append(V(i), Object.assign(r.createElement("span"), {
					className: "aa-comments-tab-count",
					textContent: ` ${a}`
				})), t.addEventListener("click", () => {
					T !== e && (T = e, u && !E(ee()) && (u = null), O(), K());
				}), t.addEventListener("keydown", (t) => {
					(t.key === "ArrowLeft" || t.key === "ArrowRight") && (t.preventDefault(), n.querySelector(`[data-tab="${e === "open" ? "resolved" : "open"}"]`)?.click(), K(), v?.querySelector(`[data-tab="${e === "open" ? "resolved" : "open"}"]`)?.focus());
				}), n.append(t);
			}
			let i = ve(c).filter(E), a = [n];
			f && T === "open" && a.push(Fe());
			for (let e of i) a.push(Pe(e, e.id === u));
			if (!i.length && !(f && T === "open")) {
				let e = r.createElement("p");
				e.className = "aa-comments-empty", e.textContent = V(T === "resolved" ? "Nothing resolved yet." : D() ? "Select words and press Comment to start a thread." : "No comments yet."), a.push(e);
			}
			e.replaceChildren(...a);
		} else {
			let e = ee();
			if (!e && !f) {
				v?.remove(), v = null, L();
				return;
			}
			Ie().replaceChildren(f ? Fe() : Pe(e, !0)), Le();
		}
		if (n) {
			let e = v?.querySelector(i?.edit ? `[data-edit="${i.edit}"]` : `[data-thread="${n}"] .aa-composer textarea`);
			if (e && i) {
				e.focus({ preventScroll: !0 });
				try {
					e.setSelectionRange(i.start, i.end);
				} catch {}
			}
		}
	}, Le = () => {
		if (h = 0, !v || o) return;
		let t = f ? "draft" : u, n = t ? te(t) : [], r = 20 * (parseFloat(getComputedStyle(e).getPropertyValue("--aa-sf")) || 1), a = Math.min(16 * r, i.innerWidth - 2 * r);
		v.style.width = `${a}px`;
		let s = n.length ? {
			left: Math.min(...n.map((e) => e.left)),
			top: Math.min(...n.map((e) => e.top)),
			bottom: Math.max(...n.map((e) => e.bottom))
		} : (() => {
			let t = e.getBoundingClientRect();
			return {
				left: t.left,
				top: t.top,
				bottom: t.top
			};
		})(), c = v.offsetHeight, l = Math.max(r, Math.min(s.left, i.innerWidth - a - r)), d = s.bottom + r / 2, p = d + c <= i.innerHeight - r / 2 || s.top - r / 2 - c < r / 2 ? d : s.top - r / 2 - c;
		v.style.left = `${l}px`, v.style.top = `${Math.max(r / 2, Math.min(p, i.innerHeight - c - r / 2))}px`;
	}, Re = () => {
		!h && v && !o && (h = i.requestAnimationFrame(Le));
	}, ze = typeof ResizeObserver > "u" ? null : new ResizeObserver(Re);
	ze?.observe(e), i.addEventListener("scroll", Re, !0), i.addEventListener("resize", Re);
	let Be = (t) => {
		if (!v || o || !(t.target instanceof Node)) return;
		let n = (e) => !!e && t.composedPath().some((t) => t instanceof Node && e.contains(t));
		G && !n(G) && je();
		let r = t.composedPath().some((t) => t instanceof Element && t.hasAttribute("data-comment") && e.contains(t));
		n(v) || n(y) || n(G) || r || ae();
	};
	r.addEventListener("pointerdown", Be, !0);
	let Ve = n.subscribe(re);
	return {
		open: N,
		start: oe,
		close: ae,
		changed: k,
		get threads() {
			return c;
		},
		destroy() {
			m = !0, Ve(), clearTimeout(g), h && i.cancelAnimationFrame(h), ze?.disconnect(), i.removeEventListener("scroll", Re, !0), i.removeEventListener("resize", Re), r.removeEventListener("pointerdown", Be, !0), e.removeEventListener("aa-selectionchange", j), e.removeEventListener("aa-change", k), e.removeEventListener("click", M), L(), je(), o ? (o.replaceChildren(), o.classList.remove("aa-comments")) : v?.remove(), v = null, t.decorate([]);
		}
	};
}
//#endregion
//#region src/editor.ts
var Hd = 4;
function Ud(e) {
	let t = document.createElement("span");
	t.style.cssText = "position:absolute;visibility:hidden;width:var(--aa-unit, 20px)", e.append(t);
	let n = t.getBoundingClientRect().width;
	return t.remove(), n || 20;
}
function Wd(e, t, n) {
	let r = document.createElement("span");
	r.className = "aa-picture-grip", r.setAttribute("data-aa-interactive", ""), r.setAttribute("role", "separator"), r.setAttribute("aria-orientation", "vertical"), r.setAttribute("aria-label", V("Picture width")), r.contentEditable = "false";
	let i = () => Number(e.dataset.width) || null, a = (r) => e.dispatchEvent(new CustomEvent("aa-atom-source", {
		bubbles: !0,
		detail: { source: Ct(t, n, r) }
	}));
	r.addEventListener("pointerdown", (t) => {
		if (t.button !== 0 || e.closest(".aa-block")?.getAttribute("data-readonly") === "true") return;
		t.preventDefault(), t.stopPropagation();
		let n = Ud(e), o = t.clientX, s = e.getBoundingClientRect().width, c = e.closest(".aa-block")?.clientWidth ?? s, l = Math.max(Hd, Math.floor(c / n)), u = i(), d = Math.round(s / n);
		r.setPointerCapture(t.pointerId), e.setAttribute("data-sizing", "");
		let f = (t) => {
			e.style.setProperty("--aa-picture-width", String(t)), e.dataset.width = String(Math.round(t));
		}, p = (e) => {
			let t = Math.min(l, Math.max(Hd, (s + e.clientX - o) / n));
			d = Math.round(t), f(t);
		}, m = () => {
			r.removeEventListener("pointermove", p), r.removeEventListener("pointerup", m), r.removeEventListener("pointercancel", m), e.removeAttribute("data-sizing"), e.setAttribute("data-settling", ""), e.getBoundingClientRect(), f(d), d !== u && a(d), setTimeout(() => e.removeAttribute("data-settling"), 160);
		};
		r.addEventListener("pointermove", p), r.addEventListener("pointerup", m), r.addEventListener("pointercancel", m);
	}), r.addEventListener("dblclick", (e) => {
		e.preventDefault(), e.stopPropagation(), i() !== null && a(null);
	}), e.append(r);
}
function Gd(e, t) {
	let { alt: n, src: r, width: i } = St(t);
	i && (e.dataset.width = String(i), e.style.setProperty("--aa-picture-width", String(i))), Wd(e, n, r);
}
var Kd = {
	...xt,
	draw(e, t) {
		let { alt: n, src: r } = St(t), i = r.split(/[?#]/)[0].split(".").pop()?.toLowerCase();
		if (/^data:(audio|video)\//.test(r) || i && /^(mp4|webm|mov|mp3|wav|ogg|m4a)$/.test(i)) {
			let t = document.createElement(/^data:video\//.test(r) || /^(mp4|webm|mov)$/.test(i ?? "") ? "video" : "audio");
			t.src = r, t.controls = !0, t.preload = "metadata", t.setAttribute("aria-label", n), e.append(t);
		} else {
			let i = document.createElement("img");
			i.src = r, i.alt = n, i.loading = "lazy", i.draggable = !1, e.append(i), Gd(e, t);
		}
		let a = document.createElement("span");
		a.className = "aa-caption", a.textContent = n, a.contentEditable = "true", a.dataset.placeholder = V("Add a caption"), e.append(a);
	}
};
function qd(e, t, n) {
	let r = 0, i = Math.min(e.length, t.length - Math.min(n, t.length));
	for (; r < i && e[e.length - 1 - r] === t[t.length - 1 - r];) r++;
	let a = 0, o = Math.min(e.length - r, t.length - r);
	for (; a < o && e[a] === t[a];) a++;
	return {
		from: a,
		to: e.length - r,
		text: t.slice(a, t.length - r)
	};
}
var Jd = typeof navigator < "u" && /Mac|iPhone|iPad/.test(navigator.platform);
function Yd(e, t = {}) {
	return Sa(e), t.sourceComments || Pe(t.value ?? "") ? Ve(e, t, Xd) : Xd(e, t);
}
function Xd(e, t = {}) {
	let n = e.ownerDocument, r = n.defaultView, i = wn(t.value ?? ""), a = !!t.readOnly, o = t.reordering !== !1, s = t.placing !== !1, c = t.placeholder ?? "", l = t.menus === !1 ? "" : t.blockPlaceholder ?? V(t.prompt ? "Press space for AI or / for commands" : "Type / for commands"), u = !1, d = !1, f = null, p = !1, m = [], h = /* @__PURE__ */ new Map(), g = () => {}, _ = () => {}, v = 0, y = null, b = /* @__PURE__ */ new Map(), x = [
		...t.atoms ?? [Kd],
		...t.partials ? [bd(() => !a)] : [],
		{
			...wt,
			draw: (e, n) => t.drawEquation ? t.drawEquation(e, n.slice(1, -1), !1) : void (e.textContent = n.slice(1, -1))
		},
		{
			name: "equation-block",
			match: () => 0,
			draw: (e, n) => t.drawEquation ? t.drawEquation(e, n.replace(/^\$\$\n?|\n?\$\$$/g, ""), !0) : void (e.textContent = n.replace(/^\$\$\n?|\n?\$\$$/g, ""))
		},
		{
			name: "columns",
			match: () => 0,
			draw: (e, t) => T(e, t),
			insert: {
				label: "Columns",
				icon: "column",
				keywords: "side by side layout pictures images",
				source: rt(["", ""])
			}
		},
		{
			name: "toc",
			match: () => 0,
			draw: (e) => S(e),
			insert: {
				label: "Table of contents",
				icon: "bullet",
				keywords: "toc outline headings navigation",
				source: "<table_of_contents/>"
			}
		},
		{
			name: "tabs",
			match: () => 0,
			draw: (e, t) => E(e, t),
			insert: {
				label: "Tabs",
				icon: "tabs",
				keywords: "tab pages sections panels",
				source: ft([{
					name: V("Tab {number}", { number: 1 }),
					content: ""
				}, {
					name: V("Tab {number}", { number: 2 }),
					content: ""
				}])
			}
		}
	];
	function S(t) {
		let n = Sl(t, () => i, e, (e) => {
			let t = j()[e];
			if (t && (t.scrollIntoView({
				block: "start",
				behavior: "instant"
			}), a && (t.tabIndex = -1), t.focus({ preventScroll: !0 }), !a)) {
				let t = {
					block: e,
					offset: i[e].prefix
				};
				z(t), B({
					anchor: t,
					focus: t
				});
			}
		});
		return b.set(t, n), () => {
			b.delete(t);
		};
	}
	let C = () => {
		for (let e of b.values()) e();
	}, w = /* @__PURE__ */ new Set();
	function T(e, r) {
		e.classList.add("aa-columns"), e.setAttribute("data-aa-interactive", "");
		let i = nt(r), c = [], l = () => {
			let t = rt(i);
			e.dataset.source = t, e.dispatchEvent(new CustomEvent("aa-atom-change", {
				bubbles: !0,
				detail: { source: t }
			}));
		}, u = () => {
			c.forEach((e) => {
				w.delete(e), e.destroy();
			}), e.querySelectorAll(":scope > .aa-column").forEach((e) => e.remove()), e.style.setProperty("--aa-columns", String(i.length)), c = i.map((r, c) => {
				let u = n.createElement("div");
				u.className = "aa-column", e.append(u);
				let d = Yd(u, {
					value: r,
					readOnly: a,
					reordering: o,
					placing: s,
					atoms: t.atoms,
					partials: t.partials,
					drawEquation: t.drawEquation,
					blockPlaceholder: "",
					onChange(e) {
						i[c] = e, l();
					}
				});
				return w.add(d), d;
			});
		}, d = (t) => {
			let { from: n, slot: r, swap: o } = t.detail, c = Array.from(e.querySelectorAll(":scope > .aa-column")).indexOf(t.target.closest(".aa-column"));
			if (c < 0 || !s || a) return;
			if (t.stopPropagation(), o !== void 0) {
				if (o === c || i[o] === void 0 || gt(i[c]).length !== 1) return;
				let e = [...i];
				[e[c], e[o]] = [e[o], e[c]], i = e, u(), l();
				return;
			}
			let d = gt(i[c]), f = d[n];
			if (!f || r === void 0) return;
			let p = _t(d.filter((e, t) => t !== n)), m = p.trim() ? i.map((e, t) => t === c ? p : e) : i.filter((e, t) => t !== c);
			m.splice(Math.max(0, Math.min(r, m.length)), 0, f.source), i = m, u(), l();
		};
		return e.addEventListener("aa-column-carry", d), u(), () => {
			e.removeEventListener("aa-column-carry", d), c.forEach((e) => {
				w.delete(e), e.destroy();
			});
		};
	}
	function E(e, r) {
		e.classList.add("aa-tabs"), e.setAttribute("data-aa-interactive", "");
		let i = dt(r), c = 0, l = null, u = n.createElement("div");
		u.className = "aa-tabs-row", u.setAttribute("role", "tablist");
		let d = n.createElement("div");
		d.className = "aa-tab-panel", d.setAttribute("role", "tabpanel"), e.append(u, d);
		let f = () => {
			let t = ft(i);
			e.dataset.source = t, e.dispatchEvent(new CustomEvent("aa-atom-change", {
				bubbles: !0,
				detail: { source: t }
			}));
		}, p = () => {
			if (u.replaceChildren(...i.map((e, t) => {
				let r = n.createElement("button");
				if (r.type = "button", r.className = "aa-tab", r.setAttribute("role", "tab"), r.setAttribute("aria-selected", String(t === c)), r.tabIndex = t === c ? 0 : -1, r.dataset.tab = String(t), e.icon) {
					let t = n.createElement("span");
					t.className = "aa-tab-icon", t.textContent = e.icon, r.append(t);
				}
				let i = n.createElement("span");
				return i.className = "aa-tab-name", i.textContent = e.name || V("Tab {number}", { number: t + 1 }), r.append(i), r.addEventListener("pointerdown", (e) => {
					t === c && !a && e.preventDefault();
				}), r.addEventListener("click", (e) => {
					e.preventDefault(), e.stopPropagation(), t === c && !a ? m(t, r) : h(t, !0);
				}), r;
			})), !a) {
				let e = n.createElement("button");
				e.type = "button", e.className = "aa-tab aa-tab-add", e.setAttribute("aria-label", V("Add tab")), e.dataset.tooltip = V("Add tab");
				let t = n.createElement("span");
				t.className = "aa-icon";
				let r = ur["./icons/plus.svg"];
				r && (t.style.maskImage = `url("data:image/svg+xml,${encodeURIComponent(r.replace(/currentColor/g, "black"))}")`), e.append(t), e.addEventListener("pointerdown", (e) => e.preventDefault()), e.addEventListener("click", (e) => {
					e.preventDefault(), e.stopPropagation(), i = [...i, {
						name: V("Tab {number}", { number: i.length + 1 }),
						content: ""
					}], c = i.length - 1, f(), g();
					let t = u.querySelector(`[data-tab="${c}"]`);
					t && m(c, t);
				}), u.append(e);
			}
		}, m = (e, t) => {
			let r = t.querySelector(".aa-tab-name");
			if (!r) return;
			let a = n.createElement("input");
			a.type = "text", a.className = "aa-tab-field", a.value = i[e].name, a.size = 1, a.setAttribute("aria-label", V("Tab name"));
			let o = r.textContent ?? "", s = () => {
				r.dataset.editing = a.value || o;
			}, c = !1, l = (t) => {
				if (c) return;
				c = !0;
				let n = a.value.trim();
				a.remove(), delete r.dataset.editing, r.textContent = o, t && n !== i[e].name && (i = i.map((t, r) => r === e ? {
					...t,
					name: n
				} : t), f(), p()), u.querySelector(`[data-tab="${e}"]`)?.focus({ preventScroll: !0 });
			};
			a.addEventListener("input", s), a.addEventListener("keydown", (e) => {
				e.stopPropagation(), e.key === "Enter" && (e.preventDefault(), l(!0)), e.key === "Escape" && (e.preventDefault(), l(!1));
			}), a.addEventListener("blur", () => l(!0)), a.addEventListener("pointerdown", (e) => e.stopPropagation()), a.addEventListener("click", (e) => e.stopPropagation()), s(), r.replaceChildren(a), a.focus(), a.select();
		}, h = (e, n = !1) => {
			c = Math.max(0, Math.min(i.length - 1, e)), l &&= (w.delete(l), l.destroy(), null), d.replaceChildren(), p(), l = Yd(d, {
				value: i[c]?.content ?? "",
				readOnly: a,
				reordering: o,
				placing: s,
				atoms: t.atoms,
				partials: t.partials,
				drawEquation: t.drawEquation,
				blockPlaceholder: "",
				onChange(e) {
					i = i.map((t, n) => n === c ? {
						...t,
						content: e
					} : t), f();
				}
			}), w.add(l), n && u.querySelector(`[data-tab="${c}"]`)?.focus({ preventScroll: !0 });
		}, g = () => h(c);
		return u.addEventListener("keydown", (e) => {
			let t = e.target.closest(".aa-tab[data-tab]");
			if (!t || !u.contains(t)) return;
			let n = Number(t.dataset.tab);
			e.key === "ArrowRight" || e.key === "ArrowLeft" ? (e.preventDefault(), e.stopPropagation(), h((n + (e.key === "ArrowRight" ? 1 : i.length - 1)) % i.length, !0)) : (e.key === "Enter" || e.key === "F2") && !a ? (e.preventDefault(), e.stopPropagation(), m(n, t)) : (e.key === "Delete" || e.key === "Backspace") && !a && i.length > 1 && (e.preventDefault(), e.stopPropagation(), i = i.filter((e, t) => t !== n), c = Math.min(n, i.length - 1), f(), h(c, !0));
		}), g(), () => {
			l &&= (w.delete(l), l.destroy(), null);
		};
	}
	let D = /* @__PURE__ */ new Map(), ee = (e, t) => {
		let r = fr(e, t, n), i = x.find((t) => t.name === e);
		return i?.draw ? D.set(r, i.draw(r, t)) : r.textContent = t, r.querySelectorAll(".aa-caption").forEach((e) => e.contentEditable = a ? "false" : "true"), r;
	}, O = (t = !1) => {
		for (let [n, r] of D) (t || !e.contains(n)) && (D.delete(n), r?.());
	}, te = (e, t, n) => {
		e.dataset.readonly = String(a), xr(e, t, n, x, ee, ne(t));
	}, ne = (e) => {
		if (!m.length) return [];
		let t = i.indexOf(e), n = t < 0 ? 0 : pe({
			block: t,
			offset: 0
		});
		return m.map((e) => ({
			...e,
			from: e.from - n,
			to: e.to - n
		}));
	}, re = new Qn({
		blocks: i,
		anchor: {
			block: 0,
			offset: 0
		},
		focus: {
			block: 0,
			offset: 0
		}
	});
	e.classList.add("aa"), V("Heading") !== "Heading" && e.style.setProperty("--aa-heading-word", JSON.stringify(V("Heading"))), e.setAttribute("role", "textbox"), e.setAttribute("aria-multiline", "true");
	let k = () => {
		e.setAttribute("aria-readonly", String(a)), c ? e.setAttribute("aria-placeholder", c) : e.removeAttribute("aria-placeholder");
	};
	k();
	let A = null, j = () => A ??= Array.from(e.children), M = new r.MutationObserver(() => {
		A = null;
	});
	M.observe(e, { childList: !0 });
	let N = (e, t) => {
		let r = n.createElement("div");
		return r.contentEditable = a ? "false" : "true", t && r.append(...Array.from(t.querySelectorAll(":scope > .aa-atom[data-aa-interactive]"))), te(r, e, null), r;
	}, ie = (e) => {
		if (!e || !t.prompt || a || f || u || Dn(e.anchor, e.focus) !== 0) return !1;
		let n = i[e.focus.block];
		return !n || e.focus.offset !== n.source.length ? !1 : n.kind === "bullet" && n.source.length === n.prefix || (n.kind === "paragraph" || n.kind === "bullet") && /[^\s][.!?]["”’)]? $/.test(n.source);
	}, ae = null, oe = null, P = (t) => {
		t === void 0 && (t = R());
		let n = ie(t) ? t.focus.block : -1, r = t && !f && !a && Dn(t.anchor, t.focus) === 0 ? t.focus.block : -1, o = i.length === 1 ? 0 : r, s = i[o], u = !s || s.source ? "" : i.length === 1 && c ? c : o === r && s.kind === "paragraph" ? l : "", d = u ? e.children[o] : void 0;
		ae && ae !== d && delete ae.dataset.placeholder, ae = d ?? null, d && d.dataset.placeholder !== u && (d.dataset.placeholder = u);
		let p = n >= 0 ? e.children[n] : void 0;
		oe && oe !== p && delete oe.dataset.hint, oe = p ?? null, p && (p.dataset.hint = V("Press space for AI"));
	}, se = () => {
		e.replaceChildren(...i.map((e) => N(e))), A = null, C(), P(), O();
	}, F = (t) => {
		let r = i, a = j(), o = 0;
		for (; o < r.length && o < t.length && r[o] === t[o];) o++;
		let s = r.length, c = t.length;
		for (; s > o && c > o && r[s - 1] === t[c - 1];) s--, c--;
		i = t;
		let l = s - o === c - o, u = l, d = n.getSelection(), f = n.activeElement, p = l && f && e.contains(f) && f.closest(".aa-atom") ? {
			focused: f,
			...d?.rangeCount ? {
				anchorNode: d.anchorNode,
				anchorOffset: d.anchorOffset,
				focusNode: d.focusNode,
				focusOffset: d.focusOffset
			} : {}
		} : null;
		if (l) for (let e = 0; e < c - o; e++) {
			let n = a[o + e], i = r[o + e], s = t[o + e];
			(m.length || !br(n, i, s, x)) && (u = !1, s.kind !== "table" && i.kind !== "table" ? te(n, s, null) : (n.replaceWith(N(s, n)), A = null));
		}
		else {
			let n = t.slice(o, c).map((e) => N(e)), r = a[s] ?? null;
			for (let e = o; e < s; e++) a[e].remove();
			for (let t of n) e.insertBefore(t, r);
			A = null;
		}
		if (p && e.contains(p.focused) && n.activeElement !== p.focused && (p.focused.focus({ preventScroll: !0 }), p.anchorNode && p.focusNode && p.focused.contains(p.focusNode))) try {
			d.setBaseAndExtent(p.anchorNode, p.anchorOffset, p.focusNode, p.focusOffset);
		} catch {}
		return C(), P(), O(), et?.draw(), u;
	}, I = (t) => {
		let n = (t?.nodeType === 1 ? t : t?.parentElement ?? null)?.closest(".aa-block");
		return !n || n.parentElement !== e ? -1 : j().indexOf(n);
	}, L = () => !!n.activeElement?.closest?.(".aa-caption, [data-aa-interactive]"), R = () => {
		if (L()) return null;
		if (f) {
			let e = Math.min(f.anchor, f.focus), t = Math.max(f.anchor, f.focus);
			return {
				anchor: {
					block: e,
					offset: 0
				},
				focus: {
					block: t,
					offset: i[t].source.length
				}
			};
		}
		let e = r.getSelection();
		if (!e || !e.rangeCount || !e.anchorNode || !e.focusNode) return null;
		let t = I(e.anchorNode), n = I(e.focusNode);
		if (t < 0 || n < 0) return null;
		let a = j();
		return {
			anchor: {
				block: t,
				offset: Dr(a[t], e.anchorNode, e.anchorOffset)
			},
			focus: {
				block: n,
				offset: Dr(a[n], e.focusNode, e.focusOffset)
			}
		};
	}, ce = !1, z = (t, n = t) => {
		let a = j(), o = Or(a[t.block], Math.min(t.offset, i[t.block].source.length)), s = Or(a[n.block], Math.min(n.offset, i[n.block].source.length)), c = r.getSelection();
		if (c) {
			ce = !0;
			try {
				t.block === n.block && Ji(e) && (Yi(e), a[n.block].focus({ preventScroll: !0 })), Xi(e, c, o, s);
			} finally {
				ce = !1;
			}
		}
	}, le = (e, t) => {
		if (!t) return null;
		let [n, r] = On(t.anchor, t.focus);
		return e < n.block || e > r.block ? null : {
			from: e === n.block ? n.offset : 0,
			to: e === r.block ? r.offset : i[e].source.length
		};
	}, ue = /* @__PURE__ */ new Set(), B = (e) => {
		if (e === void 0 && (e = R()), u) return;
		let t = j(), n = !1, r = (r) => {
			let a = t[r], o = i[r], s = le(r, e);
			s ? ue.add(a) : ue.delete(a), a.dataset.reveal === hr(o, s, x) ? a.hasAttribute("data-active") !== !!s && a.toggleAttribute("data-active", !!s) : (te(a, o, s), n = !0);
		}, [a, o] = e ? On(e.anchor, e.focus) : [], s = a?.block ?? 0, c = o?.block ?? -1;
		for (let e of [...ue]) {
			let n = t.indexOf(e);
			n < 0 ? ue.delete(e) : (n < s || n > c) && r(n);
		}
		for (let e = s; e <= c; e++) r(e);
		n && (O(), e && z(e.anchor, e.focus)), de(e);
	}, de = (e) => {
		if (!e || a || f || Dn(e.anchor, e.focus) !== 0) return;
		let t = e.focus.block;
		yt(i[t], x) && j()[t]?.querySelector("[data-aa-interactive]")?.focus({ preventScroll: !0 });
	}, fe = (e) => i[e].kind === "bullet" && i[e + 1]?.kind === "bullet" ? 1 : 2, pe = (e) => {
		let t = 0;
		for (let n = 0; n < e.block; n++) t += i[n].source.length + fe(n);
		return t + e.offset;
	}, me = (e) => {
		let t = 0;
		for (let n = 0; n < i.length; n++) {
			let r = t + i[n].source.length;
			if (e <= r || n === i.length - 1) return {
				block: n,
				offset: Math.max(0, Math.min(e - t, i[n].source.length))
			};
			if (e < r + fe(n)) return {
				block: n,
				offset: i[n].source.length
			};
			t = r + fe(n);
		}
		return {
			block: 0,
			offset: 0
		};
	}, he = (e, t) => ({
		blocks: i,
		anchor: e,
		focus: t
	}), H = (r, a, o, s) => {
		let c = i, l = e.contains(n.activeElement);
		K();
		let u = Jn(r), d = (e) => ({
			...e,
			offset: Math.max(0, e.offset + u[e.block].prefix - r[e.block].prefix)
		});
		a = d(a), o = d(o);
		let f = !F(u), p = f ? null : R();
		(f || !p || Dn(p.anchor, a) !== 0 || Dn(p.focus, o) !== 0) && z(a, o), B({
			anchor: a,
			focus: o
		}), P({
			anchor: a,
			focus: o
		}), f && Pe(l), v || (re.record(he(a, o), s), t.onChange?.(J(i)), e.dispatchEvent(new Event("aa-change")), Ee?.written(c, s !== "edit"));
	}, ge = (r) => {
		let a = e.contains(n.activeElement), o = !!n.activeElement?.closest?.("[data-aa-interactive]");
		K(), F(r.blocks), o ? B(null) : (z(r.anchor, r.focus), B({
			anchor: r.anchor,
			focus: r.focus
		}), Pe(a)), t.onChange?.(J(i)), e.dispatchEvent(new Event("aa-change"));
	}, _e = () => {
		if (a) return !1;
		if (Ee?.undoing(), y) return y.undo();
		let e = re.undo();
		return e && ge(e), !!e;
	}, ve = () => {
		if (a) return !1;
		if (Ee?.stop(), y) return y.redo();
		let e = re.redo();
		return e && ge(e), !!e;
	}, U = null, ye = (e, t, n) => {
		n && Dn(e, t) === 0 && (U = {
			...n,
			block: i[t.block],
			offset: t.offset
		});
	}, be = (e) => {
		let t = j().indexOf(e);
		if (t < 0) return;
		let n = Tr(e), r = n.replace(/^\[\] /, "- [ ] "), a = i[t];
		if (r === a.source) return;
		let o = r.length < a.source.length ? "delete" : "type", s = R(), c = U?.block === a ? U : null;
		U = null;
		let l = qd(a.source, r, s?.focus.block === t ? s.focus.offset : r.length), u = r === n ? _n(a, l.from, l.to, l.text, x, c && l.from === c.offset && l.to === c.offset ? c : null) : null;
		u && (r = u.source);
		let { blocks: d, caret: f } = An(i, t, r, u?.caret);
		if (u) {
			H(d, f, f, o), ye(f, f, u.carry);
			return;
		}
		let p = (e) => e.block === t ? xe(d, t, f, r, e.offset) : {
			...e,
			block: e.block + (d.length - i.length) * +(e.block > t)
		}, m = (e) => r !== n && e.block === t ? {
			...e,
			offset: e.offset + r.length - n.length
		} : e, h = s ? p(m(s.anchor)) : f, g = s ? p(m(s.focus)) : f;
		H(d, h, g, o);
	}, xe = (e, t, n, r, i) => {
		let a = 0;
		for (let o = t; o <= n.block; o++) {
			let t = e[o].source.length;
			if (i <= a + t) return {
				block: o,
				offset: Math.max(0, i - a)
			};
			if (a = r.indexOf(e[o + 1]?.source ?? "", a + t), a < 0) break;
		}
		return n;
	}, W = (e, t, n = "edit") => {
		let { blocks: r, caret: a, carry: o } = Y(i, e.anchor, e.focus, t, x);
		H(r, a, a, n), ye(a, a, o);
	}, Se = /* @__PURE__ */ new Set(), Ce = (r, a, o, s) => {
		let c = R(), l = e.contains(n.activeElement), { blocks: u } = Y(i, {
			block: r,
			offset: 0
		}, {
			block: r,
			offset: i[r].source.length
		}, a);
		if (u.length !== i.length) return;
		let d = (e) => e.block === r ? {
			block: r,
			offset: o(e.offset)
		} : e, f = {
			block: r,
			offset: u[r].source.length
		}, p = c ? d(c.anchor) : f, m = c ? d(c.focus) : f;
		i = u, te(j()[r], i[r], le(r, c && {
			anchor: p,
			focus: m
		})), C(), O(), c && Math.min(c.anchor.block, c.focus.block) <= r && Math.max(c.anchor.block, c.focus.block) >= r && l && z(p, m);
		let h = ba(j()[r], s);
		Se.add(h), setTimeout(() => Se.delete(h), 2e3), re.record(he(p, m), "edit"), t.onChange?.(J(i)), e.dispatchEvent(new CustomEvent("aa-change", { detail: { correction: !0 } }));
	}, we = e.getAttribute("spellcheck"), Te = (t) => {
		t ? e.setAttribute("spellcheck", "false") : we === null ? e.removeAttribute("spellcheck") : e.setAttribute("spellcheck", we);
	}, Ee = t.correct ? ga({
		blocks: () => i,
		atoms: x,
		selection: R,
		busy: () => a || u || d || v > 0,
		apply: Ce,
		value: () => J(i)
	}, t.correct, t.correcting !== !1) : null;
	Ee?.enabled && Te(!0);
	let De = (e, t) => {
		let [n, r] = On(e.anchor, e.focus);
		if (n.block !== r.block || n.offset !== r.offset) return !1;
		let a = i[n.block];
		if (a.kind === "table") {
			let e = nr(a.source).flat().find((e) => n.offset >= e.from && n.offset <= e.to);
			return !!e && (t === "backward" ? n.offset === e.from : n.offset === e.to);
		}
		let o = $t(a) ? cn(a, x) : {
			start: 0,
			end: a.source.length
		};
		if (t === "backward") {
			if (n.offset <= Math.max(a.prefix, o.start)) {
				let e = Pn(i, n.block);
				if (e) return H(e.blocks, e.caret, e.caret, "edit"), !0;
			}
			if (n.offset > o.start) return !1;
			let e = Fn(i, n.block, x);
			return e && H(e.blocks, e.caret, e.caret, "edit"), !0;
		}
		if (n.offset < o.end) return !1;
		let s = In(i, n.block, x);
		return s && H(s.blocks, s.caret, s.caret, "edit"), !0;
	}, Oe = (e) => {
		if (d) return;
		if (a) {
			e.preventDefault();
			return;
		}
		if (e.target.closest?.(".aa-caption")) return;
		let n = e.inputType;
		if (n === "historyUndo") {
			e.preventDefault(), _e();
			return;
		}
		if (n === "historyRedo") {
			e.preventDefault(), ve();
			return;
		}
		if (u || e.isComposing) return;
		let r = R();
		if (!r) return;
		if (f && n.startsWith("insert")) {
			e.preventDefault(), W(r, e.data ?? "", "edit");
			return;
		}
		let [o, s] = On(r.anchor, r.focus), c = o.block !== s.block, l = !c && o.offset === s.offset, p = i[o.block];
		if (n === "insertText" && (e.data === " " || e.data === "\xA0") && t.prompt && l) {
			if (p.kind === "paragraph" && !p.source) {
				e.preventDefault(), ot(o.block);
				return;
			}
			if (ie(r)) {
				e.preventDefault(), ot(o.block, !0);
				return;
			}
		}
		if (p.kind === "table") {
			let t = nr(p.source).flat().find((e) => o.offset >= e.from && o.offset <= e.to);
			if (t && l && (n === "deleteContentBackward" && o.offset === t.from || n === "deleteContentForward" && o.offset === t.to)) {
				e.preventDefault();
				return;
			}
		}
		switch (n) {
			case "insertParagraph":
			case "insertLineBreak":
				e.preventDefault(), Ae(r);
				return;
			case "insertFromPaste": {
				e.preventDefault();
				let t = e.dataTransfer?.getData("text/plain") ?? "";
				t && W(r, t.replace(/\r\n?/g, "\n"));
				return;
			}
			case "insertFromDrop":
				e.preventDefault();
				return;
			case "deleteContentBackward":
				if (!l) {
					e.preventDefault(), W(r, "");
					return;
				}
				De(r, "backward") && e.preventDefault();
				return;
			case "deleteContentForward":
				if (!l) {
					e.preventDefault(), W(r, "");
					return;
				}
				De(r, "forward") && e.preventDefault();
				return;
			case "deleteByCut":
				e.preventDefault();
				return;
			case "formatBold":
				e.preventDefault(), G(r, "**");
				return;
			case "formatItalic":
				e.preventDefault(), G(r, "*");
				return;
			case "formatStrikeThrough":
				e.preventDefault(), G(r, "~~");
				return;
			default:
				if (!c) return;
				e.preventDefault(), n.startsWith("insert") ? W(r, e.data ?? "", "type") : n.startsWith("delete") && W(r, "");
		}
	}, ke = (n) => {
		if (d || a || u || "isComposing" in n && n.isComposing) return;
		let r = n.target.closest?.(".aa-caption");
		if (r) {
			let n = r.closest(".aa-atom"), a = n.closest(".aa-block"), o = j().indexOf(a), s = (n.dataset.source ?? "").replace(/^!\[[^\]]*\]/, `![${(r.textContent ?? "").replace(/\]/g, "").replace(/\n/g, " ")}]`);
			n.dataset.source = s;
			let c = [...i];
			c[o] = {
				...i[o],
				source: Tr(a)
			}, i = c, C();
			let l = {
				block: o,
				offset: Dr(a, n, 1)
			};
			re.record(he(l, l), "type"), t.onChange?.(J(i)), e.dispatchEvent(new Event("aa-change"));
			return;
		}
		let o = n.target?.closest?.(".aa-block");
		o && o.parentElement === e && be(o);
	}, Ae = (e, t = !1) => {
		if (i[e.focus.block].kind === "table") {
			let n = e.focus.block, r = i[n], a = nr(r.source), o = a.at(-1)?.at(-1);
			if (!t && Dn(e.anchor, e.focus) === 0 && o && e.focus.offset >= o.from && e.focus.offset <= o.to) {
				let e = lr(r, "add-row", a.length - 1, 0), t = Y(i, {
					block: n,
					offset: 0
				}, {
					block: n,
					offset: r.source.length
				}, e), o = {
					block: n,
					offset: nr(e).at(-1)[0].from
				};
				H(t.blocks, o, o, "edit");
				return;
			}
			let s = [
				...i.slice(0, n + 1),
				{
					kind: "paragraph",
					source: "",
					prefix: 0
				},
				...i.slice(n + 1)
			], c = {
				block: n + 1,
				offset: 0
			};
			H(s, c, c, "edit");
			return;
		}
		if (i[e.focus.block].kind === "callout" && !t) {
			W(e, "\n> ");
			return;
		}
		if (t) {
			W(e, "\n");
			return;
		}
		let [n, r] = On(e.anchor, e.focus), a = i, o = n;
		Dn(n, r) !== 0 && ({blocks: a, caret: o} = Y(i, n, r, "", x));
		let s = Nn(a, o, x);
		H(s.blocks, s.caret, s.caret, "edit");
	}, G = (e, t, n = t) => {
		let r = Zt(t, n);
		if (r && t !== "[" && Dn(e.anchor, e.focus) === 0) {
			let { block: t, offset: n } = e.focus, a = U?.block === i[t] && U.offset === n ? U : null;
			if (a?.add.some((e) => e.key === r.key) || a?.remove.includes(r.key)) {
				U = null;
				return;
			}
			U = {
				add: [...a?.add ?? [], ...Cn(i[t], n, r.key, x) ? [] : [r]],
				remove: [...a?.remove ?? [], ...Cn(i[t], n, r.key, x) ? [r.key] : []],
				back: 0,
				block: i[t],
				offset: n
			};
			return;
		}
		let a = Ln(i, e.anchor, e.focus, t, n, x);
		a && H(a.blocks, a.anchor, a.focus, "edit");
	}, je = (t) => {
		let [n, r] = On(t.anchor, t.focus);
		if (n.block !== r.block) return;
		let a = n.offset, o = r.offset, s = i[n.block].source.slice(a, o), c = "";
		for (let e of i[n.block].source.matchAll(/\[([^\]]*)\]\(([^)]*)\)/g)) if (n.offset >= e.index && r.offset <= e.index + e[0].length) {
			a = e.index, o = a + e[0].length, s = e[1], c = e[2];
			break;
		}
		e.dispatchEvent(new CustomEvent("aa-link-request", { detail: {
			start: pe({
				block: n.block,
				offset: a
			}),
			end: pe({
				block: n.block,
				offset: o
			}),
			text: s,
			url: c
		} }));
	}, Me = () => {
		let e = r.getSelection();
		if (!e?.rangeCount) return null;
		let t = e.getRangeAt(0), i = t.getClientRects();
		if (i.length) return i[i.length - 1];
		let a = t.getBoundingClientRect();
		if (a.height) return a;
		let o = t.startContainer;
		if (o.nodeType === Node.TEXT_NODE && t.startOffset > 0) {
			let e = n.createRange();
			e.setStart(o, t.startOffset - 1), e.setEnd(o, t.startOffset);
			let r = e.getClientRects();
			if (r.length) return r[r.length - 1];
		}
		return (o?.nodeType === 1 ? o : o.parentElement)?.getBoundingClientRect() ?? null;
	}, Ne = (e, t, n, r) => e < n ? e - n : t > r ? Math.min(t - r, e - n) : 0, Pe = (t = e.contains(n.activeElement)) => {
		if (!t) return;
		let i = Me(), a = r.getSelection()?.focusNode;
		if (!i || !a || !e.contains(a) || !i.width && !i.height && !i.top && !i.left) return;
		let { top: o, bottom: s, left: c, right: l } = i;
		for (let e = a?.nodeType === 1 ? a : a.parentElement; e && e !== n.body && e !== n.documentElement; e = e.parentElement) {
			let t = getComputedStyle(e), n = /auto|scroll|overlay/.test(t.overflowY) && e.scrollHeight > e.clientHeight, r = /auto|scroll|overlay/.test(t.overflowX) && e.scrollWidth > e.clientWidth;
			if (!n && !r) continue;
			let i = e.getBoundingClientRect(), a = i.top + e.clientTop, u = i.left + e.clientLeft, d = n ? Ne(o, s, a, a + e.clientHeight) : 0, f = r ? Ne(c, l, u, u + e.clientWidth) : 0;
			if (!f && !d) continue;
			let p = e.scrollTop, m = e.scrollLeft;
			e.scrollBy({
				top: d,
				left: f,
				behavior: "instant"
			}), o -= e.scrollTop - p, s -= e.scrollTop - p, c -= e.scrollLeft - m, l -= e.scrollLeft - m;
		}
		let u = r.visualViewport, d = u?.offsetTop ?? 0, f = u?.offsetLeft ?? 0, p = Ne(o, s, d, d + (u?.height ?? r.innerHeight)), m = Ne(c, l, f, f + (u?.width ?? r.innerWidth));
		(m || p) && r.scrollBy({
			top: p,
			left: m,
			behavior: "instant"
		});
	}, Fe = (e, t, r) => {
		let a = j()[e], o = a.getBoundingClientRect(), s = r === "top" ? o.top + 2 : o.bottom - 2, c = null, l = 0, u = n.caretPositionFromPoint;
		if (u) {
			let e = u.call(n, t, s);
			e && (c = e.offsetNode, l = e.offset);
		} else if (n.caretRangeFromPoint) {
			let e = n.caretRangeFromPoint(t, s);
			e && (c = e.startContainer, l = e.startOffset);
		}
		let d = c && a.contains(c) ? {
			block: e,
			offset: Dr(a, c, l)
		} : {
			block: e,
			offset: r === "top" ? Ie(e) : i[e].source.length
		};
		z(d), B({
			anchor: d,
			focus: d
		}), Pe();
	}, Ie = (e) => {
		let t = i[e];
		return t.kind === "code" || t.kind === "divider" ? 0 : t.prefix;
	}, K = () => {
		if (f) {
			f = null;
			for (let e of j()) e.removeAttribute("data-selected");
		}
	}, Le = (e, t = e) => {
		f = Un(i, e, t);
		let n = Math.min(f.anchor, f.focus), r = Math.max(f.anchor, f.focus);
		z({
			block: n,
			offset: 0
		}, {
			block: r,
			offset: i[r].source.length
		}), B(), j().forEach((e, t) => e.toggleAttribute("data-selected", t >= n && t <= r));
	}, ze = (e, t) => {
		if (!o && (e === "up" || e === "down")) return;
		let n = Math.min(t.anchor, t.focus), r = Math.max(t.anchor, t.focus), a = e === "delete" ? Gn(i, t) : e === "duplicate" ? Kn(i, t) : qn(i, t, e === "up" ? -1 : 1);
		a && (H(a.blocks, a.caret, a.caret, "edit"), e !== "delete" && Le(a.caret.block, a.caret.block + r - n));
	}, Be = () => {
		tt?.close(), et?.clear(), K(), Yi(e);
		let t = e.ownerDocument.getSelection();
		t && (e.contains(t.anchorNode) || e.contains(t.focusNode)) && t.removeAllRanges();
		let n = e.ownerDocument.activeElement;
		n?.nodeType === 1 && e.contains(n) && n.blur(), B(), e.dispatchEvent(new Event("aa-dismiss"));
	}, Ve = (e) => {
		if (d || a || u || e.isComposing || e.defaultPrevented) return;
		let o = e.target.closest?.(".aa-caption");
		if (o) {
			if ((Jd ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "a") {
				e.preventDefault();
				let t = n.createRange();
				t.selectNodeContents(o);
				let i = r.getSelection();
				i?.removeAllRanges(), i?.addRange(t);
				return;
			}
			e.key === "Escape" ? (e.preventDefault(), e.stopPropagation(), Be()) : e.key === "Enter" && (e.preventDefault(), e.target.blur());
			return;
		}
		let s = Jd ? e.metaKey : e.ctrlKey;
		if (s && !e.altKey && e.key.toLowerCase() === "z") {
			e.preventDefault(), e.shiftKey ? ve() : _e();
			return;
		}
		if (s && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "y") {
			e.preventDefault(), ve();
			return;
		}
		if (e.key === "Escape") {
			e.preventDefault(), e.stopPropagation(), Be();
			return;
		}
		let c = R();
		if (!c) return;
		let l = e.key.toLowerCase();
		if (p = !1, c.anchor.block !== c.focus.block && !f && !s && !e.ctrlKey) {
			if (e.key === "Backspace" || e.key === "Delete") {
				e.preventDefault(), W(c, "");
				return;
			}
			if (e.key === "Process" || e.keyCode === 229) {
				W(c, "");
				return;
			}
			if (e.key.length === 1 && !e.altKey) {
				e.preventDefault(), W(c, e.key, "type");
				return;
			}
		}
		if (s && e.shiftKey && l === "v") {
			p = !0;
			return;
		}
		if (s && e.shiftKey && !e.altKey && l === "m" && tt) {
			e.preventDefault(), tt.start();
			return;
		}
		if (e.key === " " && t.prompt && !s && !e.altKey && !e.shiftKey && !f && Dn(c.anchor, c.focus) === 0) {
			let t = i[c.focus.block];
			if (t.kind === "paragraph" && !t.source) {
				e.preventDefault(), ot(c.focus.block);
				return;
			}
			if (ie(c)) {
				e.preventDefault(), ot(c.focus.block, !0);
				return;
			}
		}
		if ((e.key === "Backspace" || e.key === "Delete") && !f && !s && !e.altKey && !e.shiftKey && De(c, e.key === "Backspace" ? "backward" : "forward")) {
			e.preventDefault();
			return;
		}
		if (s && l === "a" && !e.altKey) {
			e.preventDefault();
			let t = c.focus.block, n = i[t], r = n.kind === "table" && !f ? nr(n.source).flat().find((e) => c.focus.offset >= e.from && c.focus.offset <= e.to) : null, a = r ? r.from : Ie(t), o = r ? r.to : n.source.length, [s, l] = On(c.anchor, c.focus), u = s.block === t && l.block === t && s.offset <= a && l.offset >= o, d = i.length - 1, p = !!f || u;
			if (K(), !p) {
				z({
					block: t,
					offset: a
				}, {
					block: t,
					offset: o
				}), B();
				return;
			}
			let m = {
				block: d,
				offset: i[d].source.length
			};
			z({
				block: 0,
				offset: Ie(0)
			}, m);
			let h = R(), [g, _] = h ? On(h.anchor, h.focus) : [];
			!g || !_ || g.block !== 0 || g.offset > Ie(0) || Dn(_, m) !== 0 ? Le(0, d) : B();
			return;
		}
		let m = f ?? Un(i, c.anchor.block, c.focus.block), h = i[c.focus.block];
		if (h.kind === "table" && !s && !e.shiftKey && c.anchor.offset === c.focus.offset && /^Arrow/.test(e.key)) {
			let t = nr(h.source), n = t.flat(), r = n.findIndex((e) => c.focus.offset >= e.from && c.focus.offset <= e.to), i = n[r], a;
			if (i && e.key === "ArrowLeft" && c.focus.offset === i.from && (a = n[r - 1]), i && e.key === "ArrowRight" && c.focus.offset === i.to && (a = n[r + 1]), i && (e.key === "ArrowUp" || e.key === "ArrowDown") && (a = n[r + (e.key === "ArrowUp" ? -t[0].length : t[0].length)]), a) {
				e.preventDefault();
				let t = {
					block: c.focus.block,
					offset: e.key === "ArrowLeft" ? a.to : a.from
				};
				j()[t.block].querySelectorAll("[data-cell]")[n.indexOf(a)]?.focus(), z(t);
				return;
			}
		}
		if (e.key === "Tab" && !s && !e.altKey) {
			let t = i[c.focus.block];
			if (t.kind === "table") {
				e.preventDefault();
				let n = nr(t.source).flat(), r = n[n.findIndex((e) => c.focus.offset >= e.from && c.focus.offset <= e.to) + (e.shiftKey ? -1 : 1)];
				if (r) {
					let e = {
						block: c.focus.block,
						offset: r.from
					};
					z(e), j()[e.block].querySelectorAll("[data-cell]")[n.indexOf(r)]?.focus(), z(e);
				} else e.shiftKey || Ae(c);
				return;
			}
			if (t.kind === "bullet") {
				e.preventDefault();
				let t = Yn(i, m, e.shiftKey ? -1 : 1);
				t && H(t.blocks, t.caret, t.caret, "edit");
				return;
			}
		}
		if (s && e.altKey && l === "t") {
			e.preventDefault();
			let t = i;
			for (let e = 0; e < t.length; e++) t = Xn(t, e, !0)?.blocks ?? t;
			H(t, c.anchor, c.focus, "edit");
			return;
		}
		if (s && l === "d" && !e.altKey) {
			e.preventDefault(), ze("duplicate", m);
			return;
		}
		if (s && e.shiftKey && (l === "arrowup" || l === "arrowdown")) {
			e.preventDefault(), ze(l === "arrowup" ? "up" : "down", m);
			return;
		}
		let g = /^Digit[0-9]$/.test(e.code) ? Number(e.code.slice(-1)) : /^\d$/.test(l) ? Number(l) : -1;
		if (s && e.altKey && g >= 0) {
			let t = [
				"paragraph",
				"h1",
				"h2",
				"h3",
				"todo",
				"bullet",
				"numbered",
				"quote",
				"code"
			][g];
			if (t) {
				e.preventDefault();
				let n = Wn(i, m, t);
				H(n.blocks, n.caret, n.caret, "edit");
			}
			return;
		}
		if (s && e.key === "Enter") {
			e.preventDefault();
			let t = Hn(i, c.focus.block) ?? Xn(i, c.focus.block);
			t && H(t.blocks, t.caret, t.caret, "edit");
			return;
		}
		if (f) {
			if (l === "backspace" || l === "delete") {
				e.preventDefault(), ze("delete", f);
				return;
			}
			if (l === "arrowup" || l === "arrowdown") {
				e.preventDefault();
				let t = f.focus + (l === "arrowup" ? -1 : 1);
				Le(e.shiftKey ? f.anchor : t, t);
				return;
			}
			if (l === "arrowleft" || l === "arrowright" || l === "enter") {
				e.preventDefault();
				let t = f.focus;
				K();
				let n = {
					block: t,
					offset: l === "arrowright" ? i[t].source.length : Ie(t)
				};
				j()[t].focus(), z(n), B();
				return;
			}
		}
		if (!s && !e.altKey && e.shiftKey && (l === "arrowup" || l === "arrowdown")) {
			e.preventDefault(), Le(c.anchor.block, c.focus.block + (l === "arrowup" ? -1 : 1));
			return;
		}
		if (e.key === "Enter" && !s && !e.altKey) {
			e.preventDefault(), Ae(c, e.shiftKey);
			return;
		}
		if (s && !e.altKey) {
			let t = e.key.toLowerCase();
			if (t === "b" && !e.shiftKey) {
				e.preventDefault(), G(c, "**");
				return;
			}
			if (t === "i" && !e.shiftKey) {
				e.preventDefault(), G(c, "*");
				return;
			}
			if (t === "e" && !e.shiftKey) {
				e.preventDefault(), G(c, "`");
				return;
			}
			if (t === "u" && !e.shiftKey) {
				e.preventDefault(), G(c, "<u>", "</u>");
				return;
			}
			if ((t === "x" || t === "s") && e.shiftKey) {
				e.preventDefault(), G(c, "~~");
				return;
			}
			if (t === "k" && !e.shiftKey) {
				e.preventDefault(), je(c);
				return;
			}
			return;
		}
		if (e.altKey || e.shiftKey || e.metaKey || e.ctrlKey || Dn(c.anchor, c.focus) !== 0) return;
		let { block: _, offset: v } = c.focus, y = j()[_], b = $t(i[_]) ? cn(i[_], x) : {
			start: 0,
			end: i[_].source.length
		};
		if (e.key === "ArrowLeft" && v <= b.start && _ > 0) {
			e.preventDefault();
			let t = {
				block: _ - 1,
				offset: i[_ - 1].source.length
			};
			z(t), B({
				anchor: t,
				focus: t
			}), Pe();
		} else if (e.key === "ArrowRight" && v >= b.end && _ + 1 < i.length) {
			e.preventDefault();
			let t = {
				block: _ + 1,
				offset: Ie(_ + 1)
			};
			z(t), B({
				anchor: t,
				focus: t
			}), Pe();
		} else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
			let t = e.key === "ArrowUp";
			if (t ? _ === 0 : _ + 1 >= i.length) return;
			let n = Me(), r = y.getBoundingClientRect();
			if (!n) return;
			let a = n.height || parseFloat(getComputedStyle(y).lineHeight) || 16;
			if (!(t ? n.top - r.top < a * .75 : r.bottom - n.bottom < a * .75)) return;
			e.preventDefault(), Fe(t ? _ - 1 : _ + 1, n.left, t ? "bottom" : "top");
		}
	}, He = (e) => {
		if (e.target.closest?.(".aa-caption")) return;
		let t = R();
		t && e.clipboardData && Dn(t.anchor, t.focus) !== 0 && (e.preventDefault(), e.clipboardData.setData("text/plain", jn(i, t.anchor, t.focus, x)), e.type === "cut" && !a && (f ? ze("delete", f) : W(t, "")));
	}, Ue = (t) => {
		K();
		let n = t.target, o = n?.closest?.("a.aa-link");
		if (o && e.contains(o)) {
			t.metaKey || t.ctrlKey || a ? (t.preventDefault(), r.open(o.href, "_blank", "noopener,noreferrer")) : t.preventDefault();
			return;
		}
		let s = n?.closest?.(".aa-block");
		if (!s || s.parentElement !== e || a) return;
		let c = j().indexOf(s), l = i[c];
		if (l.kind === "callout") {
			let n = s.getBoundingClientRect(), r = getComputedStyle(s), a = t.clientX - n.left, o = t.clientY - n.top, u = parseFloat(r.paddingLeft);
			if (l.box) {
				let i = parseFloat(r.paddingTop) || u;
				a >= u - i && a < u && o >= i && o < 2 * i && (t.preventDefault(), e.dispatchEvent(new CustomEvent("aa-callout-icon", {
					bubbles: !0,
					detail: {
						index: c,
						rect: new DOMRect(n.left + u - i, n.top + i, i, i)
					}
				})));
				return;
			}
			if (a < u) {
				t.preventDefault();
				let e = Xn(i, c);
				e && H(e.blocks, e.caret, e.caret, "edit");
			}
			return;
		}
		if (l.kind !== "bullet" || l.checked === void 0) return;
		let u = s.getBoundingClientRect(), d = parseFloat(getComputedStyle(s).paddingLeft);
		if (t.clientX - u.left > d) return;
		t.preventDefault();
		let f = Hn(i, c);
		f && H(f.blocks, f.caret, f.caret, "edit");
	}, We = () => {
		let e = 0;
		return i.map((t, n) => {
			let r = e, i = e + t.source.length;
			return e = i + fe(n), JSON.stringify(m.filter((e) => e.from <= i && e.to >= r).map((e) => ({
				...e,
				from: e.from - r,
				to: e.to - r
			})));
		});
	}, Ge = null, Ke = (e) => {
		Ge = null;
		let t = R(), n = j(), r = We(), a = !1;
		i.forEach((i, o) => {
			e[o] !== r[o] && (te(n[o], i, le(o, t)), a = !0);
		}), a && (t && z(t.anchor, t.focus), O());
	}, qe = (e) => {
		u = !0;
		let t = e.target?.closest?.(".aa-block");
		t && delete t.dataset.placeholder;
	}, Je = (t) => {
		if (u = !1, t.target.closest?.(".aa-caption")) {
			ke(t);
			return;
		}
		let n = t.target?.closest?.(".aa-block");
		n && n.parentElement === e && be(n), Ge && Ke(Ge);
	}, Ye = () => {
		if (!d && !u && !ce && !L() && !r.getSelection()?.anchorNode?.parentElement?.closest(".aa-caption")) {
			if (U) {
				let e = R();
				(!e || e.focus.offset !== U.offset || e.anchor.offset !== U.offset || i[e.focus.block] !== U.block) && (U = null);
			}
			if (Ji(e) && !f) {
				let e = R();
				e && e.anchor.block === e.focus.block && z(e.anchor, e.focus);
			}
			B(), P(), e.dispatchEvent(new Event("aa-selectionchange")), Ee?.moved();
		}
	}, Xe = (n) => {
		let r = n.detail?.source, o = n.target?.closest?.(".aa-block");
		if (d || a || typeof r != "string" || !o || o.parentElement !== e) return;
		n.stopPropagation();
		let s = j().indexOf(o);
		if (s < 0 || i[s].source === r) return;
		let c = R(), { blocks: l } = Y(i, {
			block: s,
			offset: 0
		}, {
			block: s,
			offset: i[s].source.length
		}, r);
		K(), F(Jn(l));
		let u = (e) => ({
			block: Math.min(e.block, i.length - 1),
			offset: Math.min(e.offset, i[Math.min(e.block, i.length - 1)].source.length)
		});
		c && (z(u(c.anchor), u(c.focus)), B({
			anchor: u(c.anchor),
			focus: u(c.focus)
		}));
		let f = c ? u(c.focus) : {
			block: Math.min(s, i.length - 1),
			offset: 0
		};
		re.record(he(f, f), "edit"), t.onChange?.(J(i)), e.dispatchEvent(new Event("aa-change"));
	}, Ze = (n) => {
		let r = n.detail?.source, o = n.target?.closest?.(".aa-atom"), s = o?.closest(".aa-block");
		if (d || a || typeof r != "string" || !o || !s || s.parentElement !== e) return;
		n.stopPropagation();
		let c = j().indexOf(s);
		if (c < 0) return;
		o.dataset.source = r;
		let l = [...i];
		l[c] = {
			...i[c],
			source: Tr(s)
		};
		let { width: u } = St(r);
		u ? (o.dataset.width = String(u), o.style.setProperty("--aa-picture-width", String(u))) : (delete o.dataset.width, o.style.removeProperty("--aa-picture-width"));
		let { blocks: f } = Y(i, {
			block: c,
			offset: 0
		}, {
			block: c,
			offset: i[c].source.length
		}, l[c].source);
		K(), F(Jn(f));
		let p = {
			block: c,
			offset: 0
		};
		re.record(he(p, p), "edit"), t.onChange?.(J(i)), e.dispatchEvent(new Event("aa-change"));
	}, Qe = (t) => {
		let n = t.detail?.forward !== !1, r = t.target?.closest?.(".aa-block");
		if (d || !r || r.parentElement !== e) return;
		t.stopPropagation();
		let a = j().indexOf(r) + (n ? 1 : -1);
		if (a < 0 || a >= i.length) return;
		let o = {
			block: a,
			offset: n ? Ie(a) : i[a].source.length
		};
		j()[a].focus({ preventScroll: !0 }), z(o), B({
			anchor: o,
			focus: o
		}), Pe();
	}, $e = null, et = null, tt = null, it = (e) => {
		let t = e, n = e;
		for (; t > 0 && i[t].kind !== "heading";) t--;
		for (; n + 1 < i.length && i[n + 1].kind !== "heading";) n++;
		return Array.from({ length: n - t + 1 }, (e, n) => t + n).filter((t) => t !== e && i[t].source.trim());
	}, at = () => {
		let e = r.getSelection();
		if (!e?.rangeCount) return;
		let t = e.getRangeAt(0), i = t.getClientRects()[0];
		if (i && i.height) return i;
		let a = t.startContainer, o = t.startOffset;
		if (a.nodeType !== Node.TEXT_NODE || !o) return;
		let s = n.createRange();
		s.setStart(a, o - 1), s.setEnd(a, o);
		let c = s.getClientRects()[0];
		return c ? new DOMRect(c.right, c.top, 0, c.height) : void 0;
	}, ot = (e, n = !1) => {
		let r = j()[e], o = i[e], s = o.source, c = n ? at() : void 0, l = r.getBoundingClientRect(), u = getComputedStyle(r), f = r.clientLeft + (parseFloat(u.paddingLeft) || 0), p = (parseFloat(u.paddingRight) || 0) + (parseFloat(u.borderRightWidth) || 0), m = r.clientTop + (parseFloat(u.paddingTop) || 0), h = parseFloat(u.lineHeight) || c?.height || 0, g = c ? c.left - l.left - f : 0, _ = c ? m + (h ? Math.max(0, Math.floor((c.top + c.height / 2 - l.top - m) / h)) * h : c.top - l.top - m) : m;
		$e?.close(), $e = Pd({
			place: () => {
				let e = r.getBoundingClientRect();
				return new DOMRect(e.left + f, e.top + _, Math.max(e.width - f - p, 80), h || c?.height || e.height);
			},
			indent: g,
			type: r,
			placeholder: n ? V("Ask AI or press space to speak") : void 0,
			grow: (e) => {
				r.style.minHeight = e ? `${_ + e}px` : "";
			},
			about: () => it(i.indexOf(o)).map((e) => j()[e]),
			send: async (e, c) => {
				let l = i.indexOf(o), u = await t.prompt(e, {
					kind: "writing",
					signal: c,
					text: J(it(l).map((e) => i[e])),
					before: J(i.slice(0, l)),
					after: J(i.slice(l + 1)),
					document: J(i.map((e) => e === o ? {
						...e,
						source: n ? `${e.source}${Ed}` : Ed
					} : e))
				}), f = i.indexOf(o);
				if (d || a || f < 0 || o.source !== (n ? s : "")) throw Error(V("Not answered"));
				r.style.minHeight = "";
				let p = ht(f, u, n);
				if (!p) throw Error(V("Not answered"));
				j()[Math.min(p.caret, i.length - 1)]?.focus({ preventScroll: !0 });
			},
			close: (e) => {
				$e = null, r.style.minHeight = "";
				let t = i.indexOf(o);
				e || t < 0 || d || (j()[t].focus({ preventScroll: !0 }), z({
					block: t,
					offset: n ? i[t].source.length : 0
				}));
			}
		});
	}, st = (e, t, n = !1) => {
		let r = t.replace(/\r\n?/g, "\n"), a = r.indexOf(Ed), o = a < 0 ? null : r.slice(0, a).trimEnd(), s = (a < 0 ? r : n ? r.slice(0, a) + r.slice(a + Ed.length) : `${r.slice(0, a).trimEnd()}\n\n${r.slice(a + Ed.length).trimStart()}`).trim();
		if (s === J(n ? i : i.filter((t, n) => n !== e)).trim()) return null;
		if (n) return ct(s, Math.max(0, o ? wn(r.slice(0, a)).length - 1 : e));
		let c = o === null ? e : o ? wn(o).length : 0;
		return ct(s, Math.max(0, c - 1));
	}, ct = (e, t) => {
		let n = i, r = Jn(wn(e)), a = /* @__PURE__ */ new Set(), o = r.map((e) => {
			let t = n.find((t) => !a.has(t) && t.source === e.source && t.kind === e.kind && (t.depth ?? 0) === (e.depth ?? 0) && t.number === e.number);
			return t ? (a.add(t), t) : e;
		}), s = Math.min(t, o.length - 1), c = {
			block: s,
			offset: o[s].source.length
		};
		H(o, c, c, "edit"), i.forEach((e, t) => {
			if (n.includes(e)) return;
			let r = ba(j()[t], [[0, e.source.length]]);
			Se.add(r), setTimeout(() => Se.delete(r), 2e3);
		});
		let l = pt(n, i);
		return et?.set(l), { caret: s };
	}, lt = "", ut = (e) => {
		let t = [];
		for (let n of e) n.blocks.forEach((e, r) => {
			let a = i.indexOf(e);
			if (a < 0) return;
			let o = pe({
				block: a,
				offset: 0
			});
			for (let [e, i] of n.words[r] ?? []) t.push({
				from: o + e,
				to: o + i,
				className: "aa-ai-changed"
			});
		});
		let n = JSON.stringify(t);
		if (n === lt) return;
		lt = n;
		let r = Ge ?? We();
		t.length ? h.set("ai", t) : h.delete("ai"), m = [...h.values()].flat(), u ? Ge = r : Ke(r);
	}, pt = (e, t) => {
		let n = [], r = 0, i = [], a = (t) => {
			let a = e.slice(r, t).filter((e) => e.source);
			i.length && i.length === a.length ? i.forEach((e, t) => {
				let r = Cd(a[t].source, e.source);
				n.push({
					blocks: [e],
					before: [a[t]],
					words: [r ? [] : Sd(a[t].source.slice(a[t].prefix), e.source.slice(e.prefix)).map(([t, n]) => [t + e.prefix, n + e.prefix])],
					box: r
				});
			}) : i.length && n.push({
				blocks: i,
				before: a,
				words: i.map((e) => e.source.trim() ? [[e.prefix, e.source.length]] : [])
			}), i = [];
		};
		for (let n of t) {
			let t = e.indexOf(n);
			t < r ? i.push(n) : (a(t), r = t + 1);
		}
		return a(e.length), n;
	}, mt = (e) => {
		let t = i.indexOf(e.blocks[0]), n = e.blocks.length;
		if (a || d || t < 0 || e.blocks.some((e, n) => i[t + n] !== e)) return !1;
		let r = t + n - 1, o = e.before.length - n, s = R(), c = Jn([
			...i.slice(0, t),
			...e.before,
			...i.slice(r + 1)
		]), l = (n) => n.block > r ? {
			...n,
			block: n.block + o
		} : n.block >= t ? {
			block: Math.max(0, Math.min(t + e.before.length - 1, c.length - 1)),
			offset: 0
		} : n, u = s ? l(s.anchor) : {
			block: Math.min(t, c.length - 1),
			offset: 0
		}, f = s ? l(s.focus) : u, p = (e) => ({
			block: Math.min(e.block, c.length - 1),
			offset: Math.min(e.offset, c[Math.min(e.block, c.length - 1)].source.length)
		});
		return H(c, p(u), p(f), "edit"), !0;
	}, ht = (e, t, n = !1) => {
		let { edits: r = [], insert: a = "", document: o } = typeof t == "string" ? { insert: t } : t;
		if (typeof o == "string" && o.trim()) return st(e, o, n);
		if (n) return null;
		let s = (e, t) => {
			let n = e.indexOf(t);
			return n >= 0 && e.indexOf(t, n + 1) < 0 ? n : -1;
		}, c = J(i.slice(0, e)), l = J(i.slice(e + 1)), u = 0;
		for (let { find: e, replace: t } of r) {
			if (!e) continue;
			let n = s(c, e), r = s(l, e);
			n >= 0 && l.indexOf(e) < 0 ? (c = c.slice(0, n) + t + c.slice(n + e.length), u++) : r >= 0 && c.indexOf(e) < 0 && (l = l.slice(0, r) + t + l.slice(r + e.length), u++);
		}
		let d = a.trim();
		if (!u && !d) return null;
		let f = c.trim() ? wn(c.trimEnd()).length : 0;
		return ct([
			c.trimEnd(),
			d,
			l.trimStart()
		].filter(Boolean).join("\n\n"), d ? f + wn(d).length - 1 : Math.max(0, f - 1));
	}, vt = (e) => {
		let n = e.detail;
		!n || d || a || (e.stopPropagation(), n.available = !!t.prompt, t.prompt && n.prompt && n.signal && (n.answer = t.prompt(n.prompt, {
			kind: "diagram",
			text: n.text ?? "",
			signal: n.signal
		}).then((e) => typeof e == "string" ? e : e.insert ?? "")));
	}, bt = () => K(), xt = (e) => Array.from(e?.files ?? []), Ct = (e) => {
		if (e.target.closest?.(".aa-caption")) return;
		let n = p;
		if (p = !1, a || d) return;
		let r = xt(e.clipboardData);
		if (r.length && t.onFiles) {
			e.preventDefault(), t.onFiles(r);
			return;
		}
		let o = R(), s = e.clipboardData?.getData("text/plain");
		if (!o || s === void 0) return;
		e.preventDefault();
		let [c, l] = On(o.anchor, o.focus), u = i[c.block];
		if (!n && !f && c.block === l.block && u.kind === "table" && s.includes("	")) {
			let e = nr(u.source), t = e.findIndex((e) => e.some((e) => c.offset >= e.from && c.offset <= e.to)), n = t < 0 ? -1 : e[t].findIndex((e) => c.offset >= e.from && c.offset <= e.to);
			if (t >= 0 && n >= 0) {
				let r = e.map((e) => e.map((e) => e.text));
				s.replace(/\r\n?/g, "\n").replace(/\n$/, "").split("\n").map((e) => e.split("	")).forEach((e, i) => {
					let a = r[t + i] ?? (r[t + i] = []);
					e.forEach((e, t) => {
						a[n + t] = e;
					});
				});
				let a = sr(r, rr(u.source), ir(u.source)), o = nr(a)[t][n], l = Y(i, {
					block: c.block,
					offset: 0
				}, {
					block: c.block,
					offset: u.source.length
				}, a), d = {
					block: c.block,
					offset: o.to
				};
				H(l.blocks, d, d, "edit");
				return;
			}
		}
		if (n && c.block === l.block) {
			let e = Bt(u, x).find((e) => e.kind === "syntax" && e.group && u.source.slice(e.from, e.from + 2) === "](" && c.offset === e.group[0] + 1 && l.offset === e.from);
			if (e?.group) {
				W({
					anchor: {
						block: c.block,
						offset: e.group[0]
					},
					focus: {
						block: c.block,
						offset: e.group[1]
					}
				}, s.replace(/\r\n?/g, "\n"));
				return;
			}
		}
		!n && c.block === l.block && c.offset !== l.offset && /^https?:\/\/[^\s<>]+$/i.test(s.trim()) ? G(o, "[", `](${s.trim().replace(/\(/g, "%28").replace(/\)/g, "%29")})`) : W(o, (n ? null : cr(s)) ?? s.replace(/\r\n?/g, "\n"));
	}, q = (e) => {
		e.preventDefault();
		let r = xt(e.dataTransfer);
		if (!r.length || !t.onFiles || a || d || !s) return;
		let i = n.caretRangeFromPoint?.(e.clientX, e.clientY), o = i ? I(i.startContainer) : -1;
		if (i && o >= 0) {
			let e = {
				block: o,
				offset: Dr(j()[o], i.startContainer, i.startOffset)
			};
			j()[o].focus({ preventScroll: !0 }), z(e);
		}
		t.onFiles(r);
	};
	e.addEventListener("beforeinput", Oe), e.addEventListener("input", ke), e.addEventListener("keydown", Ve), e.addEventListener("copy", He), e.addEventListener("cut", He), e.addEventListener("click", Ue), e.addEventListener("pointerdown", bt), e.addEventListener("drop", q), e.addEventListener("paste", Ct), e.addEventListener("aa-atom-change", Xe), e.addEventListener("aa-atom-source", Ze), e.addEventListener("aa-atom-leave", Qe), e.addEventListener("aa-atom-prompt", vt), e.addEventListener("compositionstart", qe), e.addEventListener("compositionend", Je), n.addEventListener("selectionchange", Ye), et = wd(e, {
		blocks: () => i,
		elements: j,
		revert: mt,
		shown: ut
	}), se();
	let Tt = Gi(e), Et = Zi(e, () => a || d), Dt = jr(e, {
		readOnly: () => a || d,
		square: Ud,
		write(n, r) {
			let a = j().indexOf(n);
			if (a < 0) return null;
			let o = or(i[a].source, r);
			if (o === i[a].source) return n;
			let { blocks: s } = An(i, a, o);
			K(), F(Jn(s));
			let c = {
				block: a,
				offset: 0
			};
			return re.record(he(c, c), "edit"), t.onChange?.(J(i)), e.dispatchEvent(new Event("aa-change")), j()[a] ?? null;
		}
	}), Ot = (t) => {
		for (let e of w) e.readOnly = t;
		if (t !== a) {
			a = t, k(), K(), P(), Ee?.stop();
			for (let e of j()) e.contentEditable = t || e.dataset.kind === "table" ? "false" : "true", e.dataset.readonly = String(t), e.querySelectorAll("[data-cell], .aa-caption").forEach((e) => e.contentEditable = t ? "false" : "true");
			e.dispatchEvent(new Event("aa-change"));
		}
	}, kt = {
		element: e,
		exportMarkdown() {
			return Re(J(i));
		},
		get value() {
			return J(i);
		},
		set value(t) {
			if (J(i) === t) return;
			let r = e.contains(n.activeElement) ? R() : null, a = i, o = wn(t), s = (e, t) => JSON.stringify(e) === JSON.stringify(t), c = 0;
			for (; c < a.length && c < o.length && s(a[c], o[c]);) c++;
			let l = 0;
			for (; l < a.length - c && l < o.length - c && s(a[a.length - 1 - l], o[o.length - 1 - l]);) l++;
			let u = [
				...a.slice(0, c),
				...o.slice(c, o.length - l),
				...a.slice(a.length - l)
			];
			K(), F(u);
			let d = (e) => {
				let t = e.block < c ? e.block : e.block >= a.length - l ? e.block + u.length - a.length : Math.min(e.block, u.length - 1);
				return {
					block: t,
					offset: Math.min(e.offset, u[t].source.length)
				};
			}, f = r ? d(r.anchor) : {
				block: 0,
				offset: 0
			}, p = r ? d(r.focus) : f;
			r && (z(f, p), B({
				anchor: f,
				focus: p
			})), re.reset({
				blocks: i,
				anchor: f,
				focus: p
			}), tt?.changed();
		},
		get readOnly() {
			return a;
		},
		set readOnly(e) {
			Ot(e);
		},
		get reordering() {
			return o;
		},
		set reordering(t) {
			if (o !== t) {
				o = t;
				for (let e of w) e.reordering = t;
				e.dispatchEvent(new Event("aa-movement-change"));
			}
		},
		get placing() {
			return s;
		},
		set placing(t) {
			if (s !== t) {
				s = t;
				for (let e of w) e.placing = t;
				e.dispatchEvent(new Event("aa-movement-change"));
			}
		},
		get placeholder() {
			return c;
		},
		set placeholder(e) {
			c = e, P(), k();
		},
		focus() {
			let e = i.length - 1;
			j()[e]?.focus({ preventScroll: !0 });
			let t = {
				block: e,
				offset: i[e].source.length
			};
			z(t), B({
				anchor: t,
				focus: t
			});
		},
		blur() {
			n.activeElement?.blur();
		},
		dismiss: Be,
		selection() {
			let e = R();
			if (!e) return null;
			let [t, n] = On(e.anchor, e.focus);
			return {
				start: pe(t),
				end: pe(n)
			};
		},
		replace(t, r, a) {
			if (d) return;
			let { blocks: o, caret: s } = Y(i, me(Math.min(t, r)), me(Math.max(t, r)), a, x);
			H(o, s, s, "edit"), e.contains(n.activeElement) || (j()[s.block]?.focus({ preventScroll: !0 }), z(s));
		},
		undo: _e,
		redo: ve,
		activeBlock() {
			let e = R();
			if (!e) return null;
			let t = e.focus.block;
			return {
				index: t,
				block: i[t],
				start: pe({
					block: t,
					offset: 0
				}),
				end: pe({
					block: t,
					offset: i[t].source.length
				})
			};
		},
		selectBlocks: Le,
		format(e) {
			if (a) return;
			let t = R();
			t && (e === "link" ? je(t) : e === "underline" ? G(t, "<u>", "</u>") : G(t, {
				bold: "**",
				italic: "*",
				strike: "~~",
				code: "`",
				link: "[",
				equation: "$",
				highlight: "=="
			}[e]));
		},
		background(e) {
			if (a) return;
			let t = R();
			if (!t) return;
			let n = Bn(i, t.anchor, t.focus, e, x);
			n && H(n.blocks, n.anchor, n.focus, "edit");
		},
		color(e) {
			if (a) return;
			let t = R();
			if (!t) return;
			let n = zn(i, t.anchor, t.focus, e, x);
			n && H(n.blocks, n.anchor, n.focus, "edit");
		},
		turnInto(e) {
			if (a) return;
			let t = R();
			if (!t) return;
			let n = Wn(i, f ?? Un(i, t.anchor.block, t.focus.block), e);
			H(n.blocks, n.caret, n.caret, "edit");
		},
		blockAction(e) {
			if (a) return;
			let t = R();
			t && ze(e, f ?? Un(i, t.anchor.block, t.focus.block));
		},
		moveBlock(e, t, n = 1) {
			if (a || !o || n < 1 || e < 0 || t < 0 || e + n > i.length || t + n > i.length || e === t) return;
			let r = [...i], s = r.splice(e, n);
			r.splice(t, 0, ...s);
			let c = {
				block: t,
				offset: s[0].prefix
			};
			H(r, c, c, "edit"), j()[t].focus({ preventScroll: !0 }), Le(t, t + n - 1);
		},
		indent(e) {
			if (a) return;
			let t = R();
			if (!t) return;
			let n = Yn(i, f ?? Un(i, t.anchor.block, t.focus.block), e);
			n && H(n.blocks, n.caret, n.caret, "edit");
		},
		toggle(e) {
			if (a) return;
			let t = R();
			if (!t) return;
			let n = Xn(i, t.focus.block, e) ?? Hn(i, t.focus.block);
			n && H(n.blocks, n.caret, n.caret, "edit");
		},
		callout(e, t) {
			if (a) return;
			let n = t ?? R()?.focus.block ?? -1;
			if (n < 0 || n >= i.length) return;
			let r = Zn(i, n, e);
			if (!r) return;
			let o = R(), s = o && o.focus.block === n && o.focus.offset >= i[n].prefix, c = r.blocks[n].prefix - i[n].prefix, l = s ? {
				block: n,
				offset: o.focus.offset + c
			} : r.caret;
			H(r.blocks, l, l, "edit");
		},
		table(e) {
			if (a) return;
			let t = R();
			if (!t) return;
			let n = t.focus.block, r = i[n];
			if (r.kind !== "table") return;
			let o = nr(r.source), s = 0, c = 0;
			o.forEach((e, n) => e.forEach((e, r) => {
				t.focus.offset >= e.from && t.focus.offset <= e.to && (s = n, c = r);
			}));
			let l = lr(r, e, s, c), u = Y(i, {
				block: n,
				offset: 0
			}, {
				block: n,
				offset: r.source.length
			}, l), d = {
				block: n,
				offset: nr(l)[Math.min(s, nr(l).length - 1)][Math.min(c, nr(l)[0].length - 1)].from
			};
			H(u.blocks, d, d, "edit");
		},
		insertFile(e) {
			!a && !d && t.onFiles?.([e]);
		},
		decorate(e, t = "external") {
			let n = Ge ?? We();
			h.set(t, e.map((e) => ({ ...e }))), m = [...h.values()].flat(), u ? Ge = n : Ke(n);
		},
		stats() {
			let e = i.flatMap((e) => e.kind === "code" ? [] : [e.source.slice(e.prefix)]).join(" ").replace(/[*_~`#>|=$\[\]()]/g, " ");
			return {
				words: typeof Intl.Segmenter == "function" ? [...new Intl.Segmenter(void 0, { granularity: "word" }).segment(e)].filter((e) => e.isWordLike).length : e.match(/\S+/g)?.length ?? 0,
				characters: [...J(i)].length,
				blocks: i.length
			};
		},
		find(e, t = !1) {
			if (!e) return [];
			let n = t ? J(i) : J(i).toLocaleLowerCase(), r = t ? e : e.toLocaleLowerCase(), a = [];
			for (let t = n.indexOf(r); t >= 0; t = n.indexOf(r, t + r.length)) a.push({
				start: t,
				end: t + e.length
			});
			return a;
		},
		rangeOf(e, t) {
			let r = me(e), a = me(t), o = j();
			if (!o[r.block] || !o[a.block]) return null;
			let s = Or(o[r.block], Math.min(r.offset, i[r.block].source.length)), c = Or(o[a.block], Math.min(a.offset, i[a.block].source.length)), l = n.createRange();
			return l.setStart(s.node, s.offset), l.setEnd(c.node, c.offset), l;
		},
		selectRange(e, t = e) {
			let n = me(e), r = me(t);
			K(), j()[n.block].focus(), z(n, r), B({
				anchor: n,
				focus: r
			});
		},
		transaction(n) {
			let r = J(i);
			v++;
			try {
				n();
			} finally {
				if (v--, !v && J(i) !== r) {
					let n = R() ?? {
						anchor: {
							block: 0,
							offset: 0
						},
						focus: {
							block: 0,
							offset: 0
						}
					};
					re.record(he(n.anchor, n.focus), "edit"), t.onChange?.(J(i)), e.dispatchEvent(new Event("aa-change"));
				}
			}
		},
		setHistoryProvider(e) {
			y = e;
		},
		async askAbout(e) {
			let n = e.trim(), r = R();
			if (!n || !t.prompt || a || d || !r || Dn(r.anchor, r.focus) === 0) return !1;
			let [o, s] = On(r.anchor, r.focus), c = pe(o), l = pe(s), u = J(i), f = Fd(j().slice(o.block, s.block + 1));
			try {
				let e = await t.prompt(n, {
					kind: "writing",
					signal: new AbortController().signal,
					text: u.slice(c, l),
					before: u.slice(0, c),
					after: u.slice(l)
				});
				if (d || a || J(i) !== u) return !1;
				let r = (typeof e == "string" ? e : e.insert ?? "").trim();
				return r ? (kt.replace(c, l, r), kt.selectRange(c, c + r.length), !0) : !1;
			} finally {
				f();
			}
		},
		get comments() {
			return tt ?? void 0;
		},
		get correcting() {
			return !!Ee?.enabled;
		},
		set correcting(e) {
			Ee && Ee.enabled !== e && (Ee.enabled = e, Te(e));
		},
		destroy() {
			d = !0, M.disconnect(), Yi(e), Ee?.stop();
			for (let e of Se) e();
			Se.clear(), Tt(), Et(), Dt(), g(), _(), e.removeEventListener("beforeinput", Oe), e.removeEventListener("input", ke), e.removeEventListener("keydown", Ve), e.removeEventListener("copy", He), e.removeEventListener("cut", He), e.removeEventListener("click", Ue), e.removeEventListener("pointerdown", bt), e.removeEventListener("drop", q), e.removeEventListener("paste", Ct), e.removeEventListener("aa-atom-change", Xe), e.removeEventListener("aa-atom-source", Ze), e.removeEventListener("aa-atom-leave", Qe), e.removeEventListener("aa-atom-prompt", vt), $e?.close(), et?.destroy(), tt?.destroy(), e.removeEventListener("compositionstart", qe), e.removeEventListener("compositionend", Je), n.removeEventListener("selectionchange", Ye), O(!0);
		}
	};
	return t.comments && (tt = Vd(e, {
		store: t.comments,
		value: () => J(i),
		selection: () => kt.selection(),
		decorate: (e) => kt.decorate(e, "comments"),
		selectRange: (e, t) => kt.selectRange(e, t),
		readOnly: () => a,
		prompt: t.prompt
	})), g = Hi(kt, {
		...t,
		atoms: x
	}), t.partials && t.menus !== !1 && (_ = xd(kt)), kt;
}
//#endregion
//#region src/element.ts
var Zd = class extends (typeof HTMLElement > "u" ? class {} : HTMLElement) {
	static observedAttributes = [
		"readonly",
		"placeholder",
		"correct"
	];
	#e = null;
	#t = null;
	#n = {};
	get options() {
		return this.#n;
	}
	set options(e) {
		this.#n = e;
	}
	constructor() {
		super();
		for (let e of [
			"options",
			"value",
			"readOnly"
		]) {
			let t = Object.getOwnPropertyDescriptor(this, e);
			t && (Reflect.deleteProperty(this, e), Reflect.set(this, e, t.value));
		}
	}
	connectedCallback() {
		this.#e ||= Yd(this, {
			...this.options,
			value: this.#t ?? this.getAttribute("value") ?? "",
			readOnly: this.hasAttribute("readonly"),
			placeholder: this.getAttribute("placeholder") ?? "",
			toolbar: this.options.toolbar ?? this.hasAttribute("toolbar"),
			correcting: this.options.correcting !== !1 && this.getAttribute("correct") !== "off",
			onChange: (e) => {
				this.options.onChange?.(e), this.dispatchEvent(new Event("input", { bubbles: !0 }));
			}
		});
	}
	disconnectedCallback() {
		this.#t = this.#e?.value ?? this.#t, this.#e?.destroy(), this.#e = null;
	}
	attributeChangedCallback(e, t, n) {
		this.#e && (e === "readonly" && (this.#e.readOnly = n !== null), e === "placeholder" && (this.#e.placeholder = n ?? ""), e === "correct" && (this.#e.correcting = n !== "off"));
	}
	get value() {
		return this.#e ? this.#e.value : this.#t ?? this.getAttribute("value") ?? "";
	}
	set value(e) {
		this.#e ? this.#e.value = e : this.#t = e;
	}
	get readOnly() {
		return this.hasAttribute("readonly");
	}
	set readOnly(e) {
		this.toggleAttribute("readonly", e);
	}
	focus() {
		this.#e?.focus();
	}
	undo() {
		return this.#e?.undo() ?? !1;
	}
	redo() {
		return this.#e?.redo() ?? !1;
	}
	get editor() {
		return this.#e;
	}
};
function Qd(e = "aa-editor") {
	customElements.get(e) || customElements.define(e, Zd);
}
//#endregion
//#region src/plain.ts
function $d(e, t = {}) {
	let n = e.ownerDocument;
	Sa(e);
	let r = n.createElement("div");
	r.className = "aa-block", r.contentEditable = t.readOnly ? "false" : "plaintext-only", r.spellcheck = !1, r.textContent = t.value ?? e.textContent ?? "", e.classList.add("aa", "aa-plain"), e.setAttribute("role", "textbox"), e.setAttribute("aria-multiline", "true"), e.replaceChildren(r);
	let i = !!t.speak && Md(), a = t.placeholder ? `${t.placeholder.charAt(0).toLowerCase()}${t.placeholder.slice(1)}` : V("write"), o = i ? V("Press space to speak, or {action}", { action: a }) : t.placeholder ?? "";
	t.placeholder && e.setAttribute("aria-label", t.placeholder);
	let s = () => r.innerText, c = () => e.toggleAttribute("data-empty", !s().trim()), l = (e) => {
		e ? r.dataset.placeholder = e : delete r.dataset.placeholder;
	};
	l(o), c();
	let u = null, d = () => {
		let i = s().trim(), a = Object.assign(n.createElement("span"), {
			className: "aa-prompt-caret",
			contentEditable: "false"
		});
		a.setAttribute("aria-hidden", "true");
		let d = null;
		u = Nd({
			lang: n.documentElement.lang || navigator.language,
			heard: (e) => {
				let n = `${i}${i && e ? " " : ""}${e}`;
				a.toggleAttribute("data-after", !!n), r.replaceChildren(n, a), c(), t.onChange?.(n);
			},
			audio: () => {
				d?.followVoice?.();
			},
			end: (t) => {
				u = null, d?.stop(), a.remove(), delete e.dataset.listening, l(t ?? o), c();
				let i = n.getSelection();
				n.activeElement === r && i && (i.selectAllChildren(r), i.collapseToEnd());
			}
		}), u && (e.dataset.listening = "", l(V("Listening…")), r.append(a), d = jd(a, n.defaultView));
	}, f = (e) => {
		if (!(e.isComposing || e.defaultPrevented)) {
			if (u) {
				if (e.key === "Escape") {
					e.preventDefault(), e.stopPropagation(), u.abort();
					return;
				}
				u.stop();
			} else if ((/Mac|iPhone|iPad/.test(n.defaultView?.navigator.platform ?? navigator.platform) ? e.metaKey : e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "a") {
				e.preventDefault(), e.stopPropagation();
				let t = n.createRange();
				t.selectNodeContents(r);
				let i = n.getSelection();
				i?.removeAllRanges(), i?.addRange(t);
			} else e.key === " " && i && !s().trim() && !e.metaKey && !e.ctrlKey && !e.altKey && r.isContentEditable && (e.preventDefault(), d());
		}
	}, p = () => {
		c(), t.onChange?.(s());
	}, m = () => u?.stop(), h = () => r.focus({ preventScroll: !0 }), g = (t) => {
		t.target === e && h();
	};
	r.addEventListener("input", p), r.addEventListener("keydown", f), r.addEventListener("blur", m), e.addEventListener("click", g);
	let _ = Gi(e);
	return {
		element: e,
		get value() {
			return s();
		},
		set value(e) {
			s() !== e && (r.textContent = e, c());
		},
		get readOnly() {
			return r.contentEditable === "false";
		},
		set readOnly(e) {
			let t = e ? "false" : "plaintext-only";
			r.contentEditable !== t && (r.contentEditable = t);
		},
		get listening() {
			return !!u;
		},
		focus: h,
		destroy() {
			u?.abort(), _(), r.removeEventListener("input", p), r.removeEventListener("keydown", f), r.removeEventListener("blur", m), e.removeEventListener("click", g);
		}
	};
}
//#endregion
//#region src/comments-memory.ts
function ef(e = {}) {
	let t = e.now ?? (() => Date.now()), n = [...e.threads ?? []], r = /* @__PURE__ */ new Set(), i = 0, a = (e) => `${e}${(++i).toString(36)}${t().toString(36).slice(-3)}`, o = e.me, s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), l = (e) => {
		let t = c.get(e.id) ?? [];
		if (!t.length && !e.reactions?.length) return e;
		let n = /* @__PURE__ */ new Map();
		for (let t of e.reactions ?? []) n.set(t.emoji, {
			...t,
			names: [...t.names]
		});
		for (let { emoji: e, person: r } of t) {
			let t = n.get(e) ?? {
				emoji: e,
				count: 0,
				reacted: !1,
				names: []
			};
			t.count++, o && r.id === o.id ? t.reacted = !0 : t.names.push(r.name), n.set(e, t);
		}
		return {
			...e,
			reactions: [...n.values()]
		};
	}, u = () => n.map((e) => ({
		...e,
		comments: e.comments.map(l),
		canDelete: !!o && e.comments[0]?.author.id === o.id,
		unread: !!o && e.comments.some((t) => t.author.id !== o.id && t.createdAt > (s.get(e.id) ?? 0))
	})), d = () => {
		let e = u();
		for (let t of r) t(e);
	}, f = () => new Promise((t) => setTimeout(t, e.delay ?? 0)), p = () => {
		if (!o) throw Error("Sign in to comment");
		return o;
	}, m = (e) => {
		let t = n.find((t) => t.id === e);
		if (!t) throw Error("This thread is gone");
		return t;
	}, h = (e) => {
		n = n.map((t) => t.id === e.id ? e : t);
	};
	return {
		me: o,
		panel: e.panel,
		get threads() {
			return n;
		},
		put(e) {
			n.some((t) => t.id === e.id) ? h(e) : n = [...n, e], d();
		},
		subscribe(e) {
			return r.add(e), e(u()), () => {
				r.delete(e);
			};
		},
		async add(e, r, i) {
			let o = p();
			if (await f(), !r.trim()) throw Error("Write a comment first");
			let c = t(), l = {
				id: a("c"),
				author: o,
				body: r,
				createdAt: c,
				mentions: [...i]
			}, u = {
				id: a("t"),
				...e,
				comments: [l],
				createdAt: c,
				updatedAt: c
			};
			return n = [...n, u], s.set(u.id, c), d(), u.id;
		},
		async reply(e, n, r) {
			let i = p();
			if (await f(), !n.trim()) throw Error("Write a comment first");
			let o = m(e);
			if (o.resolvedAt) throw Error("Reopen this thread before replying");
			let c = t();
			h({
				...o,
				comments: [...o.comments, {
					id: a("c"),
					author: i,
					body: n,
					createdAt: c,
					mentions: [...r]
				}],
				updatedAt: c
			}), s.set(e, c), d();
		},
		async edit(e, r) {
			let i = p();
			await f();
			let a = n.find((t) => t.comments.some((t) => t.id === e));
			if (!a) throw Error("This comment is gone");
			if (!a.comments.find((t) => t.id === e && t.author.id === i.id)) throw Error("Only your own comments can be edited");
			h({
				...a,
				comments: a.comments.map((n) => n.id === e ? {
					...n,
					body: r,
					editedAt: t()
				} : n),
				updatedAt: t()
			}), d();
		},
		async resolve(e, n) {
			let r = p();
			await f();
			let i = m(e);
			h(n ? {
				...i,
				resolvedAt: t(),
				resolvedBy: r,
				updatedAt: t()
			} : {
				...i,
				resolvedAt: void 0,
				resolvedBy: void 0,
				updatedAt: t()
			}), d();
		},
		async remove(e) {
			let t = p();
			if (await f(), m(e).comments[0]?.author.id !== t.id) throw Error("Only the person who started a thread can delete it");
			n = n.filter((t) => t.id !== e), d();
		},
		async move(e) {
			await f();
			for (let t of e) {
				let e = n.find((e) => e.id === t.id);
				e && h({
					...e,
					from: t.from,
					to: t.to,
					quote: t.quote
				});
			}
			d();
		},
		async seen(e) {
			s.set(e, t()), d();
		},
		async react(e, t) {
			let r = p();
			if (await f(), !fe.includes(t)) throw Error("Not one of the reactions");
			if (!n.some((t) => t.comments.some((t) => t.id === e))) throw Error("This comment is gone");
			let i = c.get(e) ?? [], a = i.findIndex((e) => e.emoji === t && e.person.id === r.id);
			c.set(e, a >= 0 ? i.filter((e, t) => t !== a) : [...i, {
				emoji: t,
				person: r
			}]), d();
		},
		people(t) {
			let n = t.trim().toLocaleLowerCase();
			return (e.people ?? []).filter((e) => !n || e.name.toLocaleLowerCase().includes(n));
		}
	};
}
//#endregion
export { Zd as AaEditorElement, Pi as AaToolbarElement, vd as BUTTON_PARTIAL, md as BUTTON_STATES, qe as CALLOUT_COLORS, q as DEFAULT_ATOMS, wt as EQUATION, Qn as History, xt as IMAGE, Ed as PROMPT_HERE, fe as REACTION_EMOJIS, Tt as TEXT_COLORS, de as aaLanguage, V as aaWord, ge as anchorThreads, he as applyEdit, fr as atomElement, bt as atomPattern, Bt as blockRuns, Ze as calloutIsBox, Be as changeCommentSource, be as commentsLabel, ye as countThreads, Vd as createCommentsView, Yd as createEditor, $d as createPlainEditor, Qd as defineAaEditor, Fi as defineAaToolbar, Gn as deleteBlocks, Kn as duplicateBlocks, lr as editTable, Re as exportMarkdown, wn as fromMarkdown, cr as fromTSV, Fd as glisten, Kd as imageAtom, Yn as indentBlocks, Te as initialOf, In as joinWithNext, Fn as joinWithPrevious, Pn as liftPrefix, me as mapRange, ef as memoryCommentStore, W as mentionQuery, xe as mentionsIn, qn as moveBlocks, _e as movedThreads, gt as parseBlocks, De as personColour, gd as readButtonPartial, Ye as readCallout, nt as readColumns, Fe as readCommentSource, St as readPicture, dt as readTabs, Se as relativeTime, H as relocate, Jn as renumber, Y as replaceRange, Un as select, _t as serialize, B as setAaWords, Zn as setCallout, or as setTableWidths, Mr as sidePlacement, Gd as sizePicture, jn as sliceMarkdown, ve as sortThreads, Nn as splitAt, rr as tableAlignments, nr as tableRows, ir as tableWidths, pe as textChange, U as threadsAt, J as toMarkdown, Hn as toggleBox, Xn as toggleCallout, Wn as turnInto, Ln as wrapSelection, _d as writeButtonPartial, Xe as writeCallout, rt as writeColumns, Le as writeCommentSource, Ct as writePicture, sr as writeTable, ft as writeTabs };

