//#region src/comment-yaml.ts
var e = (e, t) => {
	throw Error(`Invalid comment YAML (line ${e + 1}: ${t}).`);
}, t = /^(?:~|[Nn]ull|NULL)?$/, n = /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/, r = /^(?:[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)(?:[eE][-+]?[0-9]+)?|0o[0-7]+|0x[0-9a-fA-F]+|[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/;
function i(e) {
	return t.test(e) ? null : n.test(e) ? /^[tT]/.test(e) : r.test(e) ? Number(e) : e;
}
var a = {
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
}, o = {
	x: 2,
	u: 4,
	U: 8
};
function s(t, n, r) {
	let i = t[n], s = "", c = n + 1;
	for (; c < t.length; c++) {
		let n = t[c];
		if (i === "'") {
			if (n !== "'") {
				s += n;
				continue;
			}
			if (t[c + 1] === "'") {
				s += "'", c++;
				continue;
			}
			return {
				value: s,
				end: c + 1
			};
		}
		if (n === "\"") return {
			value: s,
			end: c + 1
		};
		if (n !== "\\") {
			s += n;
			continue;
		}
		let l = t[++c], u = o[l];
		if (u) {
			let n = t.slice(c + 1, c + 1 + u);
			(!/^[0-9a-fA-F]+$/.test(n) || n.length !== u) && e(r, "bad escape"), s += u === 8 ? String.fromCodePoint(parseInt(n, 16)) : String.fromCharCode(parseInt(n, 16)), c += u;
		} else l in a ? s += a[l] : e(r, "bad escape");
	}
	return e(r, "quote not closed on its line");
}
function c(t, n, r) {
	let i = t.slice(n);
	/[^ \t]/.test(i) && !/^[ \t]+#/.test(i) && e(r, "text after a value");
}
var l = (e) => /^[ \t]*(?:#.*)?$/.test(e), u = (e) => e.replace(/^[ \t]+|[ \t]+$/g, ""), d = /^(?:---|\.\.\.)(?:[ \t]|$)/, f = /^[^ \t\-?:,[\]{}#&*!|>'"%@`]|^[-?:][^ \t,[\]{}]/;
function p(e, t) {
	if (e[0] === "\"" || e[0] === "'") {
		let { value: n, end: r } = s(e, 0, t), i = e.slice(r).replace(/^[ \t]+/, "");
		return i[0] === ":" && (i.length === 1 || /[ \t]/.test(i[1])) ? {
			key: n,
			rest: i.slice(1)
		} : null;
	}
	if (!f.test(e)) return null;
	let n = e.search(/:(?:[ \t]|$)/);
	return n < 0 || /[ \t]#/.test(e.slice(0, n)) ? null : {
		key: u(e.slice(0, n)),
		rest: e.slice(n + 1)
	};
}
function m(t, n, r, a) {
	a > 16 && e(r, "too deep");
	let o = (e) => {
		for (; t[e] === " " || t[e] === "	";) e++;
		return e;
	}, c = t[n], l = c === "[" ? "]" : "}", d = c === "[", p = [], g = {}, _ = /* @__PURE__ */ new Set(), v = o(n + 1), y = (n) => {
		let o = t[n];
		if (o === "[" || o === "{") return {
			...m(t, n, r, a + 1),
			quoted: !0
		};
		if (o === "\"" || o === "'") return {
			...s(t, n, r),
			quoted: !0
		};
		let c = n;
		for (; c < t.length && !/[,[\]{}]/.test(t[c]) && !(t[c] === ":" && /[ \t,[\]{}]|^$/.test(t[c + 1] ?? ""));) c++;
		let l = u(t.slice(n, c));
		return (!l || !f.test(l) || /[ \t]#/.test(l) || /[&*!]/.test(l[0])) && e(r, "bad flow value"), {
			value: i(l),
			end: c,
			quoted: !1
		};
	};
	for (; t[v] !== l;) {
		v >= t.length && e(r, "flow not closed on its line");
		let n = y(v);
		if (v = o(n.end), d) t[v] === ":" && e(r, "mapping in a flow sequence"), p.push(n.value);
		else {
			(typeof n.value != "string" || t[v] !== ":") && e(r, "bad flow key"), _.has(n.value) && e(r, "duplicate key"), _.add(n.value);
			let i = y(o(v + 1));
			h(g, n.value, i.value), v = o(i.end);
		}
		t[v] === "," ? v = o(v + 1) : t[v] !== l && e(r, "flow not closed on its line");
	}
	return {
		value: d ? p : g,
		end: v + 1
	};
}
function h(e, t, n) {
	Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		writable: !0,
		configurable: !0
	});
}
function g(t) {
	let n = t.split(/\r\n|\n/);
	n[n.length - 1] === "" && n.pop();
	let r = 0, a = !1, o = () => {
		for (; r < n.length; r++) {
			if (l(n[r])) {
				/^ *\t/.test(n[r]) && e(r, "a tab in the indent");
				continue;
			}
			let t = /^ */.exec(n[r])[0].length;
			return n[r][t] === "	" && e(r, "a tab in the indent"), a && d.test(n[r]) && e(r, "one document only"), {
				indent: t,
				text: u(n[r].slice(t))
			};
		}
		return null;
	}, g = (t, i) => {
		let [, a, o, s, c, l] = t;
		l && !/^[ \t]/.test(l) && e(r, "bad block header");
		let u = o || c, f = s ? i + Number(s) : -1, p = [], m = r + 1;
		for (; m < n.length; m++) {
			let t = n[m], a = /^ */.exec(t)[0].length;
			if (d.test(t)) break;
			if (t.length === a) p.push(f >= 0 ? t.slice(f) : "");
			else {
				if (f < 0) {
					if (a <= i && i >= 0) break;
					t[a] === "	" && a === 0 && e(m, "a tab in the indent"), f = a;
					for (let t of n.slice(r + 1, m)) t.length > f && e(m, "indent");
					p.length = 0;
					for (let e = r + 1; e < m; e++) p.push("");
				}
				if (a < f) break;
				p.push(t.slice(f));
			}
		}
		r = m;
		let h = 0;
		for (; p.length - h > 0 && p[p.length - 1 - h] === "";) h++;
		let g = p.slice(0, p.length - h), _;
		if (a === "|") _ = g.join("\n");
		else {
			g.some((e) => /^[ \t]/.test(e)) && e(r, "a more-indented folded line"), _ = "";
			for (let e = 0; e < g.length; e++) e && g[e] && g[e - 1] ? _ += " " : e && !g[e] && (_ += "\n"), _ += g[e];
		}
		return g.length ? u === "-" ? _ : u === "+" ? `${_}\n${"\n".repeat(h)}` : `${_}\n` : u === "+" ? "\n".repeat(h) : "";
	}, _ = (t, n) => {
		let a = r, o = /^([|>])([-+]?)([1-9]?)([-+]?)(.*)$/.exec(t);
		if (o) return (o[2] && o[4] || /[^ \t]/.test(o[5]) && !/^[ \t]+#/.test(o[5])) && e(a, "bad block header"), g(o, n);
		if (r++, t[0] === "\"" || t[0] === "'") {
			let { value: e, end: n } = s(t, 0, a);
			return c(t, n, a), e;
		}
		if (t[0] === "[" || t[0] === "{") {
			let { value: e, end: n } = m(t, 0, a, 0);
			return c(t, n, a), e;
		}
		let l = u(t.replace(/[ \t]+#.*$/, ""));
		return /:(?:[ \t]|$)/.test(l) && e(a, "a mapping inside a plain value"), l[0] === "#" ? null : (f.test(l) || e(a, "anchors, aliases, tags and reserved characters are not read"), i(l));
	}, v = (t, n) => {
		n > 32 && e(r, "too deep");
		let i = o();
		return i.text === "-" || i.text.startsWith("- ") ? y(t, n) : b(t, n);
	}, y = (t, i) => {
		let a = [];
		for (let e = o(); e && e.indent === t && (e.text === "-" || e.text.startsWith("- ")); e = o()) {
			let s = u(e.text.slice(1));
			if (!s || s[0] === "#") {
				r++;
				let e = o();
				a.push(e && e.indent > t ? v(e.indent, i + 1) : null);
				continue;
			}
			let c = e.text.length - s.length + t;
			s === "-" || s.startsWith("- ") || p(s, r) ? (n[r] = " ".repeat(c) + s, a.push(v(c, i + 1))) : a.push(_(s, t));
		}
		let s = o();
		return s && s.indent > t && e(r, "indent"), a;
	}, b = (t, n) => {
		let i = {}, a = /* @__PURE__ */ new Set();
		for (let s = o(); s && s.indent === t; s = o()) {
			let c = p(s.text, r);
			c || e(r, "expected a key");
			let { key: l, rest: d } = c;
			a.has(l) && e(r, "duplicate key"), a.add(l);
			let f = u(d);
			if (f && f[0] !== "#") {
				h(i, l, _(f, t));
				continue;
			}
			f && !/^[ \t]/.test(d) && e(r, "expected a key"), r++;
			let m = o();
			m && m.indent > t ? h(i, l, v(m.indent, n + 1)) : m && m.indent === t && (m.text === "-" || m.text.startsWith("- ")) ? h(i, l, y(t, n + 1)) : h(i, l, null);
		}
		let s = o();
		return s && s.indent > t && e(r, "indent"), i;
	}, x = o();
	if (!x || (x.text === "---" ? r++ : d.test(n[r]) && e(r, "one document only"), a = !0, !o())) return null;
	let S = o();
	S.indent !== 0 && S.text.match(/^-/) && e(r, "indent");
	let C = S.text.startsWith("- ") || S.text === "-" || p(S.text, r) ? v(S.indent, 0) : _(S.text, -1);
	return o() && e(r, "more than one value"), C;
}
var _ = /^[^\s\-?:,[\]{}#&*!|>'"%@`=~][^\t\n\r]*$/u, v = /[^\t\n\x20-\x7e\u0085\u00a0-\ud7ff\ue000-\ufffd\u{10000}-\u{10ffff}]/u, y = (e) => _.test(e) && !/\s$|: |:$| #/.test(e) && i(e) === e && !v.test(e);
function b(e, t) {
	if (y(e)) return e;
	if (e.includes("\n") && !e.startsWith("\n") && !v.test(e) && !e.includes("\r") && !e.includes("") && !/\n[ \t]+(?:\n|$)|^[ \t]+\n/.test(e)) {
		let n = /\n*$/.exec(e)[0].length, r = n === 0 ? "-" : n === 1 ? "" : "+", i = /^[ \t]/.test(e) ? "2" : "", a = e.slice(0, e.length - n).split("\n"), o = " ".repeat(t);
		return `|${i}${r}\n${a.map((e) => e ? o + e : "").join("\n")}${r === "+" ? "\n".repeat(n - 1) : ""}`;
	}
	return JSON.stringify(e);
}
function x(e) {
	let t = (e, t, a) => {
		let o = " ".repeat(a), s = y(e) ? e : JSON.stringify(e);
		return Array.isArray(t) && t.length || n(t) && Object.keys(t).length ? `${o}${s}:\n${i(t, a + 2)}` : `${o}${s}: ${r(t, a + 2)}\n`;
	}, n = (e) => !!e && typeof e == "object" && !Array.isArray(e), r = (e, t) => typeof e == "string" ? b(e, t) : Array.isArray(e) ? "[]" : n(e) ? "{}" : String(e), i = (e, a) => {
		let o = " ".repeat(a);
		return Array.isArray(e) ? e.map((e) => Array.isArray(e) && e.length || n(e) && Object.keys(e).length ? `${o}- ${i(e, a + 2).slice(a + 2)}` : `${o}- ${r(e, a + 2)}\n`).join("") : Object.entries(e).filter(([, e]) => e !== void 0).map(([e, n]) => t(e, n, a)).join("");
	};
	return i(e, 0);
}
//#endregion
//#region src/vendor/idv1/words.ts
var S = /* @__PURE__ */ "fuck.fuk.fck.fux.shit.sht.crap.turd.piss.cunt.twat.dick.dik.cock.knob.wank.jizz.cum.porn.sex.anal.anus.arse.ass.butt.boob.tit.puss.slut.whor.hoe.bich.btch.bitc.damn.hell.suck.fart.puke.barf.poo.smeg.dumb.ugly.fat.kill.dead.rape.hate.nazi.hitl.heil.kkk.isis.fag.nig.nigg.coon.spic.kike.gook.paki.dyke.homo.tard.jew.gay.lort.pik.pis.fis.fiss.kuss.knep.hore.lude.skid.nege.fand.svin.klam.baka.aho.kuso.unko.mank.chnk.ecch.etch.ero.hent.kasu.kuzu.busu.debu.hage.kich.yari.oppa.fick.fotz.hure.kack.arsc.fitt.kuk.hora.knul.puta.puto.cono.culo.mier.jode.pene.verg.merd.pute.bite.salo.cazz.figa.porr.ssib.shib.tmd.cao".split("."), C = [
	"42",
	"49",
	"69"
];
function w(e) {
	let t = e.toLowerCase();
	return S.some((e) => t.includes(e));
}
function T(e) {
	return w(e.slice(0, 4)) || C.includes(e.slice(4));
}
//#endregion
//#region src/vendor/idv1/shapes.ts
var E = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", ee = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", D = "0123456789", O = /^[A-Za-z]{4}\d{2}$/, te = /^(?:[A-Za-z]{2}\d{4}|[A-Za-z]{4}\d{2})$/, k = /^\d{2}[A-Za-z]{4}$/, A = /^[A-Za-z]{2}\d{2}(?:[A-Za-z][A-Za-z0-9]|\d[A-Za-z])$/, j = (e, t) => e[Math.floor(t() * e.length)];
function ne(e, t = Math.random) {
	let n = e ?? j("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", t) + j("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", t);
	for (;;) {
		let e = n + String(Math.floor(t() * 1e4)).padStart(4, "0");
		if (!re(e)) return e;
	}
}
var M = {
	owner: "Jo4712",
	studio: "Jo0001",
	onboarding: "On0001",
	test: "Te0001"
}, N = ["On4713"], P, re = (e) => (P ??= new Set([...Object.values(M), ...N].map((e) => e.toLowerCase()))).has(e.toLowerCase());
function F(e = Math.random) {
	for (let t = 0; t < 1e3; t++) {
		let t = Array.from({ length: 4 }, () => j(E, e)).join("") + String(Math.floor(e() * 100)).padStart(2, "0");
		if (!T(t)) return t;
	}
	throw Error("No product code could be drawn.");
}
function ie(e = Math.random) {
	return j(D, e) + j(D, e) + Array.from({ length: 4 }, () => j(ee, e)).join("");
}
function ae(e = Math.random) {
	let t = j(E, e) + j(E, e) + j(D, e) + j(D, e), n = j(E + D, e), r = j(E + D, e);
	return t + (/\d/.test(n) && /\d/.test(r) ? j(E, e) : n) + r;
}
var oe = {
	account: te,
	product: O,
	list: k,
	item: A
}, I = (e, t) => oe[e].test(t);
function L(e, t = {}) {
	let n = t.random ?? Math.random;
	return e === "account" ? ne(t.letters ?? null, n) : e === "product" ? F(n) : e === "list" ? ie(n) : ae(n);
}
//#endregion
//#region src/words.ts
var se = { da: {
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
} }, R = Symbol.for("design-system-1.translate"), z = Symbol.for("aa.words"), ce = globalThis;
function B(e) {
	ce[z] = e;
}
function V() {
	return (typeof document > "u" ? "" : document.documentElement.lang || "").trim().toLowerCase() || "en";
}
function H(e, t) {
	let n = V(), r = ce[z], i = typeof r == "function" ? r(e, n) : r?.[e];
	if (i === void 0) {
		let t = globalThis[R];
		if (typeof t == "function") {
			let n = String(t(e));
			n !== e && (i = n);
		}
	}
	i === void 0 && (i = se[n]?.[e] ?? se[n.split("-")[0]]?.[e]);
	let a = i ?? e;
	return t ? a.replace(/\{(\w+)\}/g, (e, n) => n in t ? String(t[n]) : e) : a;
}
//#endregion
//#region src/comments.ts
var le = [
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
function U(e, t) {
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
function ue(e, t) {
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
function de(e, t, n) {
	return e.map((e) => {
		if (e.orphaned) return {
			...e,
			orphaned: !0
		};
		let r = ue(e, t);
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
function W(e, t) {
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
function fe(e, t) {
	return e.map((e) => {
		let n = e.orphaned ? null : W(e, t);
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
function pe(e, t) {
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
function me(e) {
	let t = (e) => (e.resolvedAt ? 2 : 0) + +!!e.orphaned;
	return [...e].sort((e, n) => t(e) - t(n) || e.from - n.from || e.createdAt - n.createdAt);
}
function he(e, t) {
	return e.filter((e) => !e.orphaned && !e.resolvedAt && e.from <= t && t <= e.to);
}
function ge(e) {
	let t = e.filter((e) => e.resolvedAt).length;
	return {
		open: e.length - t,
		resolved: t
	};
}
function _e(e, t) {
	if (e <= 0 && t <= 0) return H("Comments");
	let n = H(e === 1 ? "{count} comment" : "{count} comments", { count: Math.max(0, e) });
	return t > 0 ? `${n} · ${H("{count} resolved", { count: t })}` : n;
}
function ve(e, t) {
	let n = [], r = [...t].filter((e) => e.name.trim()).sort((e, t) => t.name.length - e.name.length), i = e;
	for (let e of r) {
		let t = `@${e.name.trim()}`;
		i.includes(t) && (n.push(e), i = i.split(t).join(" "));
	}
	return n;
}
function ye(e, t) {
	let n = e.slice(0, t), r = n.lastIndexOf("@");
	if (r < 0 || r > 0 && !/\s/.test(n[r - 1])) return null;
	let i = n.slice(r + 1);
	return /\s/.test(i) || i.length > 40 ? null : {
		start: r,
		query: i
	};
}
function G(e, t = Date.now(), n) {
	let r = n ?? V(), i = new Intl.RelativeTimeFormat(r, { numeric: "auto" }), a = Math.round((t - e) / 1e3);
	if (a < 45) return i.format(0, "second");
	let o = Math.round(a / 60);
	if (o < 60) return i.format(-o, "minute");
	let s = Math.round(o / 60), c = new Date(e), l = new Date(t), u = (e) => Math.floor((e.getTime() - e.getTimezoneOffset() * 6e4) / 864e5), d = u(l) - u(c);
	return s < 24 && d === 0 ? i.format(-s, "hour") : d < 7 ? i.format(-d, "day") : c.toLocaleDateString(r.startsWith("en") ? n : r, {
		day: "numeric",
		month: "short",
		...c.getFullYear() === l.getFullYear() ? {} : { year: "numeric" }
	});
}
var be = /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
function xe(e) {
	let t = e.trim();
	return be.test(t) ? [...t.split(/[\s　・]/)[0]].slice(0, 2).join("") : ([...t][0] ?? "?").toLocaleUpperCase();
}
var Se = [
	["#2e9e1f", "#99ff73"],
	["#4b44e6", "#b3aeff"],
	["#c4417f", "#f5aad1"],
	["#d93b3b", "#ff8f8f"],
	["#b27a00", "#fec20d"],
	["#6f6b1f", "#d2cd72"]
];
function Ce(e) {
	if (e.colour) return e.colour;
	let t = 0;
	for (let n of e.id) t = t * 31 + n.charCodeAt(0) >>> 0;
	let [n, r] = Se[t % Se.length];
	return `light-dark(${n}, ${r})`;
}
//#endregion
//#region src/comments-markdown.ts
var we = /<!--aa:(start|end) ([A-Za-z0-9]{6})-->/g, Te = (e) => typeof e == "string" && /^\d{4}-\d\d-\d\dT.*Z$/.test(e) && Number.isFinite(Date.parse(e)), Ee = (e) => typeof e == "string" && I("account", e), K = (e) => typeof e == "string" && I("item", e), De = (e) => !!e && typeof e == "object" && !Array.isArray(e);
function Oe(e) {
	if (!De(e) || !Array.isArray(e.threads) || e.threads.length > 1e4) throw Error("Expected threads array (at most 10000 threads).");
	let t = /* @__PURE__ */ new Set(), n = (e) => {
		if (!K(e) || t.has(e)) throw Error("Thread and comment IDs must be unique IDv1 item codes.");
		t.add(e);
	};
	for (let t of e.threads) {
		if (!De(t)) throw Error("Invalid thread.");
		if (n(t.id), typeof t.quote != "string" || !["open", "resolved"].includes(t.status) || !Array.isArray(t.comments) || !t.comments.length) throw Error("Invalid thread fields.");
		if (t.status === "resolved" && (!Te(t.resolved) || !Ee(t.resolvedBy))) throw Error("Resolved threads need resolved and resolvedBy.");
		for (let e of t.comments) {
			if (!De(e)) throw Error("Invalid comment.");
			if (n(e.id), !Ee(e.author) || !Te(e.created) || typeof e.body != "string" || !e.body.trim() || e.edited !== void 0 && !Te(e.edited)) throw Error("Invalid comment author, date or body.");
			if (e.mentions !== void 0 && (!Array.isArray(e.mentions) || !e.mentions.every(Ee))) throw Error("Invalid mentions.");
			if (e.reactions !== void 0 && (!De(e.reactions) || !Object.values(e.reactions).every((e) => Array.isArray(e) && e.every(Ee)))) throw Error("Invalid reactions.");
		}
	}
	return e.threads;
}
function ke(e) {
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
function q(e) {
	return /aa-comments/.test(e) && ke(e).fences.some((e) => /^aa-comments(?:\s|$)/.test(e.info));
}
function J(e) {
	let { fences: t, protectedAt: n } = ke(e), r = [], i = [], a = [], o = t.filter((e) => /^aa-comments(?:\s|$)/.test(e.info));
	for (let t of o) {
		if (o.length > 1) {
			i.push("Multiple aa-comments blocks.");
			break;
		}
		if (t.info !== "aa-comments v1") i.push("Unsupported aa-comments version.");
		else if (!t.closed || e.slice(t.to).trim()) i.push("The aa-comments block must be closed and last.");
		else try {
			if (t.body.length > 2e6) throw Error("Comment metadata exceeds 2 MB.");
			a = Oe(g(t.body));
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
	for (let t of e.matchAll(we)) {
		if (n(t.index) || e[t.index - 1] === "\\" || !K(t[2])) continue;
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
function Ae(e, t) {
	return t - e.spans.reduce((e, n) => e + Math.max(0, Math.min(t, n.to) - n.from), 0);
}
function je(e, t, n = !0) {
	let r = t;
	for (let t of e.spans) (t.from < r || n && !t.metadata && t.from === r) && (r += t.to - t.from);
	return r;
}
function Me(e) {
	if (!e.threads.length) return e.markdown;
	Oe({ threads: e.threads });
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
	let r = x({ threads: e.threads }), i = "`".repeat(Math.max(3, ...[...r.matchAll(/`+/g)].map((e) => e[0].length + 1)));
	return `${n}\n\n${i}aa-comments v1\n${r}${i}`;
}
function Ne(e) {
	let t = J(e);
	if (t.diagnostics.length) throw Error(`Cannot export Markdown: ${t.diagnostics.join(" ")}`);
	return t.markdown;
}
function Pe(e, t) {
	let n = U(e.markdown, t), r = Object.create(null), i = e.threads.map((i) => {
		let a = e.anchors[i.id], o = a && ue(a, n);
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
function Y(e, t, n, r = (/* @__PURE__ */ new Date()).toISOString()) {
	if (!Ee(t)) throw Error("Author must be an IDv1 account code.");
	if (!Te(r)) throw Error("Invalid UTC timestamp.");
	let i = J(e);
	if (i.diagnostics.length) throw Error(i.diagnostics.join(" "));
	let a = new Set(i.threads.flatMap((e) => [e.id, ...e.comments.map((e) => e.id)])), o = () => {
		let e;
		do
			e = L("item");
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
		let { protectedAt: r } = ke(i.markdown), a = (e) => {
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
	return Me(i);
}
//#endregion
//#region src/comments-editor.ts
function Fe(e, t, n) {
	if (t.comments) throw Error("Choose sourceComments or an external comments store, not both.");
	let r = t.sourceComments ?? {}, i = t.value ?? "", a = J(i);
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
		i = e, a = J(i);
		let r = Date.now();
		n && l && r - l < 700 && s.length > 1 ? s[s.length - 1] = i : s.push(i), l = n ? r : 0, c = [], m(), t.onChange?.(i);
	}, g = async (t) => {
		if (u || o.readOnly || !r.me) throw Error("Comments are read only.");
		let n = Y(i, r.me.id, t);
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
			h(Me(Pe(a, e)), t);
		}
	});
	let v = (n) => {
		i = n, a = J(n), o.value = a.markdown, m(), t.onChange?.(i), e.dispatchEvent(new Event("aa-change"));
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
	let S = (e, t = !0) => je(a, e, t), C = (e) => Ae(a, e), w = {
		exportMarkdown: () => Ne(i),
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
			let s = i.slice(0, t) + r + i.slice(n), c = J(s);
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
			let r = J(n);
			if (r.diagnostics.length) throw Error(r.diagnostics.join(" "));
			return i = n, a = r, o.value = r.markdown, s = [i], c = [], l = 0, m(), !0;
		}
	});
}
//#endregion
//#region src/table.ts
function X(e) {
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
var Ie = (e, t) => X(e).flat().find((e) => t >= e.from && t <= e.to), Le = (e, t, n) => X(e).flat().some((e) => t >= e.from && n <= e.to);
function Re(e) {
	return (e.split("\n")[1] ?? "").replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((e) => {
		let t = e.trim(), n = t.startsWith(":"), r = t.endsWith(":");
		return n && r ? "center" : r ? "end" : n ? "start" : null;
	});
}
function ze(e) {
	return (e.split("\n")[1] ?? "").replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((e) => {
		let t = e.trim().replace(/:/g, "").length;
		return t > 3 ? t : null;
	});
}
var Be = (e, t) => {
	let n = "-".repeat(Math.max(3, t ?? 3));
	return e === "center" ? `:${n}:` : e === "end" ? `${n}:` : e === "start" ? `:${n}` : n;
};
function Ve(e, t) {
	let n = e.split("\n"), r = Re(e);
	return n[1] = `| ${t.map((e, t) => Be(r[t], e)).join(" | ")} |`, n.join("\n");
}
function He(e, t = [], n = []) {
	let r = Math.max(1, ...e.map((e) => e.length)), i = (e) => `| ${Array.from({ length: r }, (t, n) => (e[n] ?? "").replace(/\r?\n/g, " ").replace(/(?<!\\)\|/g, "\\|")).join(" | ")} |`, a = `| ${Array.from({ length: r }, (e, r) => Be(t[r], n[r])).join(" | ")} |`;
	return [
		i(e[0] ?? [""]),
		a,
		...e.slice(1).map(i)
	].join("\n");
}
function Ue(e) {
	return e.includes("	") ? He(e.replace(/\r\n?/g, "\n").replace(/\n$/, "").split("\n").map((e) => e.split("	"))) : null;
}
function We(e, t, n, r) {
	let i = X(e.source).map((e) => e.map((e) => e.text)), a = Re(e.source), o = ze(e.source), s = Math.max(1, ...i.map((e) => e.length));
	if (i.forEach((e) => {
		for (; e.length < s;) e.push("");
	}), t === "add-row" && i.splice(n + 1, 0, Array(s).fill("")), t === "delete-row" && n > 0 && i.length > 1 && i.splice(n, 1), t === "bold-header") {
		let e = /^\*\*(.+)\*\*$/, t = i[0].filter((e) => e.trim()), n = t.length > 0 && t.every((t) => e.test(t));
		i[0] = i[0].map((t) => t.trim() ? n ? t.replace(e, "$1") : e.test(t) ? t : `**${t}**` : t);
	}
	return t === "add-column" && (i.forEach((e) => e.splice(r + 1, 0, "")), a.splice(r + 1, 0, null), o.splice(r + 1, 0, null)), t === "delete-column" && s > 1 && (i.forEach((e) => e.splice(r, 1)), a.splice(r, 1), o.splice(r, 1)), He(i, a, o);
}
//#endregion
//#region src/markdown.ts
var Ge = /^ {0,3}(#{1,6})[ \t]+/, Ke = /^ *(?:([-*+])|(\d{1,9})[.)])[ \t]+(?:\[([ xX])\][ \t]+)?/, qe = /^ {0,3}>[ \t]?/, Je = /^ {0,3}(`{3,}|~{3,})/, Ye = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/, Xe = [
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
], Ze = /^>\s*\[!([^\]\n]*)\](-)?[ \t]*/;
function Qe(e) {
	let t = Ze.exec(e);
	if (!t) return null;
	let n = "", r, i;
	for (let e of t[1].trim().split(/\s+/).filter(Boolean)) {
		let t = e.toLowerCase();
		Xe.includes(t) ? i = t : /^[a-z]+$/i.test(e) ? n = t : r = e;
	}
	return {
		kind: n,
		icon: r,
		color: i,
		folded: !!t[2],
		length: t[0].length
	};
}
function $e(e) {
	return `> [!${[
		e.kind,
		e.icon,
		e.color
	].filter(Boolean).join(" ")}]${e.folded ? "-" : ""}`;
}
function et(e) {
	return e.icon !== void 0 || e.color !== void 0 || !e.kind;
}
var tt = /^\s*<columns>\s*$/, nt = /^\s*<\/columns>\s*$/, rt = /^\s*<column>\s*$/, it = /^\s*<\/column>\s*$/;
function at(e) {
	let t = ot(e, [tt, nt], rt, it).map((e) => e.text);
	return t.length ? t : ["", ""];
}
function ot(e, t, n, r) {
	let i = [], a = null;
	for (let o of e.replace(/\r\n?/g, "\n").split("\n")) {
		if (t.some((e) => e.test(o))) continue;
		let e = n.exec(o);
		e ? (a = [], i.push({
			open: e,
			lines: a
		})) : r.test(o) ? a = null : a && a.push(o.replace(/^\t{1,2}/, ""));
	}
	return i.map((e) => ({
		open: e.open,
		text: e.lines.join("\n").replace(/^\n+|\n+$/g, "")
	}));
}
function st(e) {
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
var ct = /^\s*<table_of_contents\s*\/>\s*$/, lt = /^\s*<tabs>\s*$/, ut = /^\s*<\/tabs>\s*$/, dt = /^\s*<tab\b([^>]*)>\s*$/, ft = /^\s*<\/tab>\s*$/, pt = (e) => e.replace(/&quot;/g, "\"").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"), mt = (e) => e.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, " ");
function ht(e) {
	let t = ot(e, [lt, ut], dt, ft).map(({ open: e, text: t }) => {
		let n = {};
		for (let t of e[1].matchAll(/([a-z]+)="([^"]*)"/g)) n[t[1]] = pt(t[2]);
		return {
			name: n.name ?? "",
			...n.icon ? { icon: n.icon } : {},
			content: t
		};
	});
	return t.length ? t : [{
		name: "",
		content: ""
	}];
}
function gt(e) {
	return [
		"<tabs>",
		...e.flatMap((e) => [
			`<tab name="${mt(e.name)}"${e.icon ? ` icon="${mt(e.icon)}"` : ""}>`,
			...e.content ? [e.content] : [],
			"</tab>"
		]),
		"</tabs>"
	].join("\n");
}
function _t(e, t, n, r) {
	let i = St(e), a = i[t], o = i[n];
	if (t === n || !a || !o || a.kind === "columns") return null;
	let s = o.kind === "columns" ? at(o.source) : [o.source];
	r === "start" ? s.unshift(a.source) : s.push(a.source);
	let c = i.filter((e, n) => n !== t).map((e) => e === o ? {
		...e,
		kind: "columns",
		prefix: 9,
		source: st(s)
	} : e), l = Math.min(t, n), u = Math.max(t, n);
	return {
		start: i[l].start,
		end: i[u].start + i[u].source.length,
		text: Ct(c.slice(l, u))
	};
}
function vt(e, t) {
	let n = Je.exec(e);
	return !!n && n[1][0] === t[0] && n[1].length >= t.length && !e.slice(n[0].length).trim();
}
function yt(e) {
	let t = Ke.exec(e);
	return t ? /^ */.exec(e)[0].length + (t[1] ? 1 : t[2].length + 1) + 1 : 0;
}
function bt(e) {
	switch (e.kind) {
		case "paragraph":
		case "code": return "\n";
		case "quote":
		case "callout": return "\n> ";
		case "bullet": return "\n" + " ".repeat(yt(e.source.split("\n")[0]));
		default: return null;
	}
}
function xt(e) {
	return !!e.trim() && !Je.test(e) && !Ye.test(e) && !Ge.test(e) && !Ke.test(e) && !qe.test(e) && !tt.test(e) && !lt.test(e) && !ct.test(e);
}
function St(e) {
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
	}, o = 0, s = (e, n) => {
		let r = o + 1;
		for (; r < t.length && !n(t[r]);) r++;
		a(e, o, Math.min(r, t.length - 1), { prefix: t[o].length }), o = r + 1;
	};
	for (; o < t.length;) {
		let e = t[o];
		if (e.trim() === "$$") {
			s("equation", (e) => e.trim() === "$$");
			continue;
		}
		if (o + 1 < t.length && e.includes("|") && /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(t[o + 1])) {
			let e = o + 1;
			for (; e + 1 < t.length && t[e + 1].trim() && t[e + 1].includes("|");) e++;
			a("table", o, e), o = e + 1;
			continue;
		}
		if (tt.test(e)) {
			s("columns", (e) => nt.test(e));
			continue;
		}
		if (ct.test(e)) {
			a("toc", o, o), o++;
			continue;
		}
		if (lt.test(e)) {
			s("tabs", (e) => ut.test(e));
			continue;
		}
		let n = Je.exec(e);
		if (n) {
			s("code", (e) => vt(e, n[1]));
			continue;
		}
		if (!e.trim()) {
			o++;
			continue;
		}
		if (Ye.test(e)) {
			a("divider", o, o, { prefix: e.length }), o++;
			continue;
		}
		let r = Ge.exec(e);
		if (r) {
			a("heading", o, o, {
				level: r[1].length,
				prefix: r[0].length
			}), o++;
			continue;
		}
		let c = Ke.exec(e);
		if (c) {
			let n = /^ */.exec(e)[0].length, r = i[i.length - 1], s = 0;
			n && r?.kind === "bullet" ? s = n > (r.indent ?? 0) ? (r.depth ?? 0) + 1 : [...i].reverse().find((e) => e.kind === "bullet" && (e.indent ?? 0) <= n)?.depth ?? 1 : n && (s = Math.floor(n / (c[2] ? 3 : 2)));
			let l = " ".repeat(yt(e)), u = o;
			for (; u + 1 < t.length && t[u + 1].startsWith(l) && t[u + 1].trim() && !Ke.test(t[u + 1]);) u++;
			a("bullet", o, u, {
				prefix: c[0].length,
				indent: n,
				depth: s,
				checked: c[3] === void 0 ? void 0 : c[3] !== " ",
				number: c[2] ? Number(c[2]) : void 0
			}), o = u + 1;
			continue;
		}
		if (qe.test(e)) {
			let n = o;
			for (; n + 1 < t.length && qe.test(t[n + 1]);) n++;
			let r = Qe(e), i = r ? /^(#{1,6})\s+/.exec(e.slice(r.length)) : null;
			a(r ? "callout" : "quote", o, n, r ? {
				level: i?.[1].length,
				prefix: r.length + (i?.[0].length ?? 0),
				callout: r.kind,
				folded: r.folded,
				...r.icon === void 0 ? {} : { icon: r.icon },
				...r.color ? { color: r.color } : {},
				...et(r) ? { box: !0 } : {}
			} : { prefix: qe.exec(e)[0].length }), o = n + 1;
			continue;
		}
		let l = o;
		for (; l + 1 < t.length && xt(t[l + 1]);) l++;
		a("paragraph", o, l), o = l + 1;
	}
	i.length || i.push({
		kind: "paragraph",
		source: "",
		prefix: 0,
		start: 0
	});
	let c = /^\n+/.exec(e)?.[0] ?? "", l = e.length > c.length ? /\n+$/.exec(e)?.[0] ?? "" : "", u = i[0], d = i[i.length - 1];
	if (c && u.kind === "paragraph" && (u.source = c + u.source, u.start = 0), l && d.kind === "paragraph" && (d.source += l), d.kind === "bullet") {
		let t = "\n" + " ".repeat(yt(d.source.split("\n")[0]));
		e.endsWith(t) && !d.source.endsWith(t) && (d.source += t);
	}
	return i;
}
function Ct(e) {
	let t = "";
	return e.forEach((n, r) => {
		r && (t += e[r - 1].kind === "bullet" && n.kind === "bullet" ? "\n" : "\n\n"), t += n.source;
	}), t;
}
function wt(e) {
	let t = e.source.split("\n");
	return t.length > 1 && vt(t[t.length - 1], Je.exec(t[0])[1]);
}
function Tt(e, t) {
	if (e.kind !== "code" || !wt(e)) return;
	let n = e.source.slice(0, e.prefix).replace(/^ {0,3}(`{3,}|~{3,})/, "").trim().toLowerCase().split(/\s+/)[0];
	return n ? t.find((e) => e.fence?.toLowerCase() === n) : void 0;
}
function Et(e, t, n) {
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
var Dt = Et("image", /!\[[^\]\n]*\]\([^\s()]+(?: "w\d+")?\)/);
function Ot(e) {
	let [, t = "", n = "", r] = /^!\[([^\]]*)\]\(([^\s)]*)(?: "w(\d+)")?\)$/.exec(e) ?? [];
	return {
		alt: t,
		src: n,
		width: r ? Number(r) : null
	};
}
function kt(e, t, n) {
	return `![${e}](${t}${n ? ` "w${n}"` : ""})`;
}
var At = Et("equation", /\$(?!\$)(?:\\.|[^$\n])+\$/), Z = [Dt, At], jt = [
	"gray",
	"red",
	"orange",
	"green",
	"blue",
	"purple"
], Mt = [
	"gray",
	"yellow",
	"orange",
	"green",
	"blue",
	"purple",
	"red"
], Nt = /_background$/, Pt = /<u>|<span color="([a-z_]+)">/y, Ft = String.raw`\[((?:\\.|[^[\]\\])*)\]\(\s*(<(?:\\.|[^<>\\\n])*>|(?:\\.|[^\s()\\]|\((?:\\.|[^\s()\\])*\))*)(?:\s+("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^()\\])*\)))?\s*\)`, It = new RegExp(Ft, "y"), Lt = /^[\s\u200b-\u200d\u2060\ufeff]*$/u, Rt = /(?:https?:\/\/|www\.)[^\s<>()]*[^\s<>().,;:!?'"]/g, zt = /[!-/:-@[-`{-~]/, Bt = (e) => e.replace(/\\([!-/:-@[-`{-~])/g, "$1");
function Vt(e, t) {
	let [n, r, i, a] = e, o = a ? Bt(a.slice(1, -1)) : "", s = !Lt.test(o), c = Bt(i.replace(/^<([^]*)>$/, "$1")), l = `(${i}${s ? ` ${a}` : ""})`;
	return {
		words: r,
		href: c,
		close: t + 1 + r.length,
		end: t + n.length,
		...s ? { title: o } : {},
		...l === `(${c})` ? {} : { linkSource: l }
	};
}
function Ht(e, t, n) {
	for (let r of e.matchAll(new RegExp(Ft, "g"))) {
		let e = r.index;
		if (t < e || n > e + r[0].length) continue;
		let i = Vt(r, e);
		return {
			from: e,
			to: i.end,
			words: i.words,
			href: i.href
		};
	}
	for (let r of e.matchAll(Rt)) {
		let e = r.index;
		if (t >= e && n <= e + r[0].length) return {
			from: e,
			to: e + r[0].length,
			words: r[0],
			href: r[0].startsWith("www.") ? `https://${r[0]}` : r[0]
		};
	}
	return null;
}
var Ut = (e) => !!e && (/[A-Za-z0-9]/.test(e) || e > "" && /[\p{L}\p{N}]/u.test(e)), Wt = (e) => !e || /\s/.test(e), Gt = {
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
function Kt(e, t, n, r, i) {
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
		} else if (p === "\\" && o + 1 < m && zt.test(e[o + 1])) a.push({
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
				It.lastIndex = o;
				let t = It.exec(e);
				if (t && o + t[0].length <= n) {
					let { words: e, ...n } = Vt(t, o);
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
				Pt.lastIndex = o;
				let t = Pt.exec(e);
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
			if (Gt[p]) {
				let n = 1;
				for (; o + n < m && e[o + n] === p;) n++;
				let r = n >= 2;
				if (r || Gt[p].one) {
					let i = a[a.length - 1], c = o === s || e[o - 1] === "\n" || i?.type === "break" && i.at + 1 + i.prefix === o, l = o === t ? void 0 : c ? "\n" : e[o - 1], u = o + n < m ? e[o + n] : void 0, d = c && o > t && !Wt(e[e.lastIndexOf("\n", o - 1) - 1]) && (!u || u === "\n"), f = !Wt(u) && !(p === "_" && Ut(l)), h = (!Wt(l) || d) && !(p === "_" && Ut(u));
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
							looseOpen: r && !f && !!u && Wt(l),
							looseClose: r && !h && !!l && Wt(u),
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
function qt(e) {
	let t = e.flatMap((e) => e.type === "delimiters" ? [e.run] : []), n = (e) => e.length - e.left - e.right;
	for (let e = 0; e < t.length; e++) {
		let r = t[e];
		if (r.closes || r.looseClose) for (; n(r) > 0;) {
			let i = -1, a = 0;
			for (let o = e - 1; o >= 0; o--) {
				let e = t[o];
				if (e.char !== r.char || !n(e) || !(e.opens || e.looseOpen) || !e.opens && !r.closes) continue;
				let s = e.opens && e.closes || r.opens && r.closes, c = n(e), l = n(r);
				if (!(s && (c + l) % 3 == 0 && (c % 3 || l % 3) && (c % 2 || l % 2)) && (a = Math.min(n(e), n(r)) >= 2 ? 2 : +!!Gt[r.char].one, a)) {
					i = o;
					break;
				}
			}
			if (i < 0) break;
			let o = t[i], s = o.at + o.length - o.right - a, c = r.at + r.left, l = a === 2 ? Gt[r.char].two : Gt[r.char].one, u = [s, c + a];
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
function Jt(e) {
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
function Yt(e, t, n, r, i, a) {
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
	for (let e of o.matchAll(Rt)) {
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
function Xt(e, t, n, r, i, a, o) {
	let s = Kt(e, t, n, a, o);
	qt(s), Jt(s);
	let c = {
		bold: 0,
		italic: 0,
		strike: 0,
		highlight: 0,
		underline: 0
	}, l = [], u, d, f, p = t, m = () => {
		let e = {};
		c.bold && (e.bold = !0), c.italic && (e.italic = !0), c.strike && (e.strike = !0), c.highlight && (e.highlight = !0), c.underline && (e.underline = !0);
		for (let { color: t } of l) Nt.test(t) ? e.background = t.replace(Nt, "") : e.color = t;
		return u !== void 0 && (e.href = u), d !== void 0 && (e.title = d), f !== void 0 && (e.linkSource = f), e;
	}, h = (t) => Yt(e, p, t, r, m(), i), g = (e, t, n, a = !1) => {
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
function Zt(e, t = Z) {
	let n = Qt.get(e);
	n || Qt.set(e, n = /* @__PURE__ */ new WeakMap());
	let r = n.get(t);
	return r || (r = $t && $t.atoms === t && $t.source === e.source && $t.kind === e.kind && $t.prefix === e.prefix ? $t.runs : en(e, t), n.set(t, r), $t = {
		atoms: t,
		source: e.source,
		kind: e.kind,
		prefix: e.prefix,
		runs: r
	}), r;
}
var Qt = /* @__PURE__ */ new WeakMap(), $t = null;
function en(e, t) {
	let n = [], r = e.source.split("\n"), i = e.kind === "code" && wt(e);
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
	let a = Tt(e, t);
	if (a) return [{
		kind: "atom",
		atom: a.name,
		from: 0,
		to: e.source.length,
		group: [0, e.source.length]
	}];
	if (e.kind === "paragraph") return Xt(e.source, 0, e.source.length, 0, n, t), n;
	if (e.kind === "quote" || e.kind === "callout") {
		let i = e.kind === "callout" ? e.prefix : qe.exec(r[0])?.[0].length ?? 0;
		return i && n.push({
			kind: "syntax",
			from: 0,
			to: i,
			prefix: !0
		}), Xt(e.source, i, e.source.length, 0, n, t, (t) => {
			let n = e.source.indexOf("\n", t);
			return qe.exec(e.source.slice(t, n < 0 ? e.source.length : n))?.[0].length ?? 0;
		}), n;
	}
	if (e.kind === "bullet" && r.length > 1) return n.push({
		kind: "syntax",
		from: 0,
		to: e.prefix,
		prefix: !0
	}), Xt(e.source, e.prefix, e.source.length, 0, n, t, (t) => /^ */.exec(e.source.slice(t))[0].length), n;
	if (e.kind === "table") {
		let r = 0;
		for (let i of X(e.source).flat()) i.from > r && n.push({
			kind: "syntax",
			from: r,
			to: i.from,
			prefix: !0
		}), Xt(i.text, 0, i.text.length, i.from, n, t), r = i.to;
		return r < e.source.length && n.push({
			kind: "syntax",
			from: r,
			to: e.source.length,
			prefix: !0
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
			}), Xt(a, r, a.length, o, n, t);
		}
		o += a.length + 1;
	}), n;
}
//#endregion
//#region src/rich.ts
var tn = (e, t, n, r, i) => ({
	family: e,
	key: e,
	open: t,
	close: n,
	tight: r,
	rank: i
}), nn = tn("bold", "**", "**", !0, 2), rn = tn("italic", "*", "*", !0, 3), an = tn("strike", "~~", "~~", !0, 4), on = tn("highlight", "==", "==", !0, 5), sn = tn("underline", "<u>", "</u>", !1, 1), cn = tn("code", "`", "`", !1, 7), ln = (e) => ({
	family: "color",
	key: `color:${e}`,
	open: `<span color="${e}">`,
	close: "</span>",
	tight: !1,
	rank: 0
}), un = (e) => ({
	family: "background",
	key: `background:${e}`,
	open: `<span color="${e}_background">`,
	close: "</span>",
	tight: !1,
	rank: 0
}), dn = (e, t = `(${e})`) => ({
	family: "link",
	key: `link:${t}`,
	open: "[",
	close: `]${t}`,
	tight: !1,
	rank: 6
});
function fn(e, t) {
	return e === "[" ? dn(t.replace(/^\]\(|\)$/g, "")) : {
		"**": nn,
		"*": rn,
		"~~": an,
		"==": on,
		"<u>": sn,
		"`": cn
	}[e] ?? null;
}
var pn = /* @__PURE__ */ new Set([
	"paragraph",
	"heading",
	"bullet",
	"quote",
	"callout",
	"table"
]), mn = (e) => pn.has(e.kind);
function hn(e) {
	let t = [];
	return e.background && t.push(un(e.background)), e.color && t.push(ln(e.color)), e.underline && t.push(sn), e.bold && t.push(nn), e.italic && t.push(rn), e.strike && t.push(an), e.highlight && t.push(on), e.href !== void 0 && !e.autolink && t.push(dn(e.href, e.linkSource)), e.code && t.push(cn), t;
}
var gn = (e, t) => e.some((e) => e.key === t);
function _n(e, t = Z) {
	let n = [], r = "";
	for (let i of Zt(e, t)) {
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
		let a = hn(i);
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
					to: i.from + e + 1,
					...i.autolink ? { bare: i.href } : {}
				});
			}
			r = "";
		}
	}
	return n.forEach((e, t) => {
		if (!e.breaks) return;
		let r = n[t - 1], i = n[t + 1];
		r && i && (e.marks = r.marks.filter((e) => gn(i.marks, e.key)));
	}), n;
}
var vn = (e) => !!e.breaks || /^\s+$/.test(e.source);
function yn(e) {
	let t = e.map((e) => ({ ...e })), n = /* @__PURE__ */ new Map(), r = (e, r, i, a) => {
		n.delete(e);
		let o = (e) => r.tight ? vn(e) : !!e.breaks, s = i, c = a;
		for (; s <= c && o(t[s]);) s++;
		for (; c >= s && o(t[c]);) c--;
		let l = t.slice(s, c + 1).every(vn);
		for (let n = i; n <= a; n++) (l || n < s || n > c) && (t[n].marks = t[n].marks.filter((t) => t.key !== e));
	};
	t.forEach((e, t) => {
		for (let [i, { mark: a, from: o }] of n) gn(e.marks, i) || r(i, a, o, t - 1);
		for (let r of e.marks) n.has(r.key) || n.set(r.key, {
			mark: r,
			from: t
		});
	});
	for (let [e, { mark: i, from: a }] of n) r(e, i, a, t.length - 1);
	return t;
}
function bn(e) {
	let t = yn(e);
	for (;;) {
		let e = xn(t);
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
function xn(e) {
	let t = [], n = [], r = [], i = [], a = "", o = (t, n) => {
		let r = t;
		for (; r + 1 < e.length && gn(e[r + 1].marks, n);) r++;
		return r;
	}, s = (n, r) => {
		for (; t.length > n;) {
			let { mark: n, close: o, from: s } = t.pop();
			a += o, n.tight && (vn(e[s]) && i.push({
				at: s,
				key: n.key
			}), r !== s && vn(e[r]) && i.push({
				at: r,
				key: n.key
			}));
		}
	};
	return e.forEach((i, c) => {
		let l = i.marks, u = l.filter((e) => !t.some((t) => t.mark.key === e.key)), d = 0;
		for (; d < t.length && gn(l, t[d].mark.key) && !(t[d].mark === cn && u.length);) d++;
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
function Sn(e, t = Z) {
	let n = Zt(e, t).filter((e) => e.kind !== "syntax");
	return {
		start: n[0]?.from ?? e.source.length,
		end: n[n.length - 1]?.to ?? e.source.length
	};
}
var Cn = (e) => {
	let t = 0;
	for (let n of e) n.kind === "syntax" && n.group && !n.lone && t++;
	return t / 2;
}, wn = (e, t = Z) => Cn(Zt(e, t)) > 0;
function Tn(e, t, n) {
	let r = /* @__PURE__ */ new Set();
	for (let i of e) i.kind === "syntax" && i.group && !i.lone && i.group[0] >= t && i.group[1] <= n && r.add(i.group[0]);
	return r.size;
}
function En(e, t, n, r) {
	let i = "", a = "";
	for (let o of t) {
		if (o.kind !== "text" && o.kind !== "atom") continue;
		let t = Math.max(o.from, n), s = Math.min(o.to, r);
		if (s <= t) continue;
		let c = hn(o).map((e) => e.key).join(",");
		c !== a && (i += `\u0000${c}\u0000`, a = c), i += e.slice(t, s);
	}
	return i;
}
var Dn = (e, t, n) => e.some((e) => e.kind === "syntax" && e.group && !e.lone && e.group[0] < t && e.group[1] > n), On = (e, t) => {
	let n = 0;
	for (; n < e.length && e[n].to <= t;) n++;
	return n;
}, kn = (e, t) => {
	let n = 0;
	for (; n < e.length && e[n].from < t;) n++;
	return n;
}, An = (e, t) => {
	let n = new Set(t.map((e) => e.family));
	return [...e.filter((e) => !n.has(e.family)), ...t];
};
function jn(e, t, n, r, i = Z, a) {
	if (!mn(e)) return null;
	let o = Zt(e, i), s = Cn(o);
	if (!a) {
		if (!s) return null;
		let a = e.source.slice(0, t) + r + e.source.slice(n), c = St(a), l = 0;
		for (let e of c) l += Cn(Zt(e, i));
		let u = r.length > 1 && !r.includes("\n") && wn({
			kind: "paragraph",
			source: r,
			prefix: 0
		}, i), d = l >= s - Tn(o, t, n) && !(u && Dn(o, t, n)), f = !/[*_~=`<[\\\n]/.test(r), p = t + r.length, m = c.length === 1 ? Zt(c[0], i) : [];
		if (d && (!f || c.length > 1 || En(e.source, o, 0, t) === En(a, m, 0, t) && En(e.source, o, n, Infinity) === En(a, m, p, Infinity))) return null;
	}
	let c = _n(e, i), l = On(c, t), u = t === n ? l : Math.max(l, kn(c, n));
	if (r.includes("\n")) {
		let e = bn(c.slice(0, l)).text, t = bn(c.slice(u)).text;
		return {
			source: e + r + t,
			caret: e.length + r.length
		};
	}
	let d = t < n ? c[l] : c[l - 1] ?? c[l], f = d && !d.fixed && !d.breaks ? d.marks : [], p = c.slice(0, l);
	if (a) {
		f = An(f, a.add).filter((e) => !a.remove.includes(e.key));
		for (let e = Math.max(0, p.length - a.back); e < p.length; e++) p[e] = {
			...p[e],
			marks: An(p[e].marks, a.add)
		};
	}
	let m = r ? _n({
		kind: "paragraph",
		source: r,
		prefix: 0
	}, i).map((e) => ({
		...e,
		marks: An(f, e.marks)
	})) : [], h = [
		...p,
		...m,
		...c.slice(u)
	], g = bn(h), _ = p.length + m.length - 1, v = _ < 0 ? 0 : g.ends[_], y = /* @__PURE__ */ new Map(), b = 0;
	if (r && /^\s+$/.test(r) || a) for (let e = _; e >= 0 && vn(h[e]); e--) {
		let t = h[e].marks.filter((t) => !gn(g.fitted[e].marks, t.key));
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
function Mn(e, t, n = Z) {
	if (!mn(e) || !wn(e, n)) return null;
	let r = _n(e, n), i = On(r, t);
	return [bn(r.slice(0, i)).text, bn(r.slice(i)).text];
}
function Nn(e, t, n, r, i, a = Z) {
	if (!mn(e) || !mn(n) || !(wn(e, a) || wn(n, a))) return null;
	let o = _n(e, a), s = o.filter((e) => e.to <= t), c = _n(n, a).filter((e) => e.from >= r);
	if (i.includes("\n")) {
		let e = bn(s).text;
		return {
			source: e + i + bn(c).text,
			caret: e.length + i.length
		};
	}
	let l = o[s.length] ?? s[s.length - 1], u = l && !l.fixed && !l.breaks ? l.marks : [], d = i ? _n({
		kind: "paragraph",
		source: i,
		prefix: 0
	}, a).map((e) => ({
		...e,
		marks: An(u, e.marks)
	})) : [], f = bn([
		...s,
		...d,
		...c
	]), p = s.length + d.length - 1;
	return {
		source: f.text,
		caret: p < 0 ? 0 : f.ends[p]
	};
}
function Pn(e, t, n, r = Z) {
	if (!mn(e) || !wn(e, r)) return null;
	let i = _n(e, r);
	return bn(i.slice(On(i, t), Math.max(On(i, t), kn(i, n)))).text;
}
function Fn(e, t, n, r, i = Z) {
	let a = _n(e, i), o = a.slice(On(a, t), kn(a, n)).filter((e) => !e.fixed && !vn(e));
	return {
		words: o.length > 0,
		all: o.length > 0 && o.every((e) => gn(e.marks, r))
	};
}
function In(e, t, n) {
	for (let r of [t, n]) {
		let t = e[r]?.bare;
		if (!t || e[r - 1]?.bare !== t) continue;
		let n = r, i = r;
		for (; e[n - 1]?.bare === t;) n--;
		for (; e[i + 1]?.bare === t;) i++;
		let a = dn(t);
		for (let t = n; t <= i; t++) gn(e[t].marks, a.key) || (e[t] = {
			...e[t],
			marks: An(e[t].marks, [a])
		});
	}
}
function Ln(e, t, n, r, i = Z) {
	let a = _n(e, i), o = On(a, t), s = Math.max(o, kn(a, n));
	r.add && s > o && In(a, o, s);
	let c = bn(a.map((e, t) => {
		if (t < o || t >= s || e.fixed) return e;
		let n = [r.remove ?? []].flat(), i = e.marks.filter((e) => !n.includes(e.family) && !n.includes(e.key));
		return {
			...e,
			marks: r.add ? An(i, [r.add]) : i
		};
	}));
	return {
		source: c.text,
		from: c.starts[o] ?? c.text.length,
		to: s > o ? c.ends[s - 1] : c.starts[o] ?? c.text.length
	};
}
function Rn(e, t, n, r = Z) {
	let i = _n(e, r), a = i[On(i, t) - 1];
	return !!a && !a.fixed && !a.breaks && gn(a.marks, n);
}
//#endregion
//#region src/document.ts
function zn(e) {
	return St(e.replace(/\r\n?/g, "\n").replace(/^\n+|\n+$/g, "")).map(({ start: e, ...t }) => t);
}
var Bn = {
	kind: "paragraph",
	source: "",
	prefix: 0
};
function Vn(e) {
	return e.trim() ? zn(e) : [Bn];
}
var Q = Ct;
function Hn(e, t) {
	return e.block - t.block || e.offset - t.offset;
}
function Un(e, t) {
	return Hn(e, t) <= 0 ? [e, t] : [t, e];
}
function Wn(e, t, n, r, i) {
	let a = St(r), o = a.map(({ start: e, ...t }) => t), s = [
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
function $(e, t, n, r, i = Z) {
	let [a, o] = Un(t, n);
	if (a.block === o.block && Gn(e[a.block], a.offset, o.offset)) {
		let { source: t, caret: n } = Kn(e[a.block], a.offset, o.offset, r, i);
		return Wn(e, a.block, a.block, t, n);
	}
	let s = a.block === o.block ? jn(e[a.block], a.offset, o.offset, r, i) : Nn(e[a.block], a.offset, e[o.block], o.offset, r, i);
	if (s) return {
		...Wn(e, a.block, o.block, s.source, s.caret),
		...s.carry ? { carry: s.carry } : {}
	};
	let c = e[a.block].source.slice(0, a.offset), l = e[o.block].source.slice(o.offset);
	return Wn(e, a.block, o.block, c + r + l, c.length + r.length);
}
var Gn = (e, t, n) => e.kind === "table" && (t !== 0 || n !== e.source.length) && !Le(e.source, t, n);
function Kn(e, t, n, r, i) {
	let a = X(e.source).flat().filter((e) => e.to > t && e.from < n), o = r.replace(/\s*\n\s*/g, " ").replace(/(?<!\\)\|/g, "\\|"), s = e.source, c = t;
	for (let r = a.length - 1; r >= 0; r--) {
		let l = Math.max(t, a[r].from), u = Math.min(n, a[r].to), d = r ? "" : o, f = jn({
			...e,
			source: s
		}, l, u, d, i);
		s = f?.source ?? s.slice(0, l) + d + s.slice(u), c = f?.caret ?? l + d.length;
	}
	return {
		source: s,
		caret: c
	};
}
function qn(e, t, n, r = n.length) {
	return Wn(e, t, t, n, r);
}
function Jn(e, t, n, r = Z) {
	let [i, a] = Un(t, n), o = (e, t, n) => Pn(e, t, n, r) ?? e.source.slice(t, n);
	if (i.block === a.block) return o(e[i.block], i.offset, a.offset);
	let s = e[i.block], c = e[a.block];
	return Ct([
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
function Yn(e) {
	let t = e.source.slice(0, e.prefix), n = e.checked === void 0 ? "" : "[ ] ";
	return e.number === void 0 ? t.replace(/\[[ xX]\][ \t]+$/, "") + n : t.replace(/\d+/, String(e.number + 1)).replace(/\[[ xX]\][ \t]+$/, "") + n;
}
function Xn(e, t, n = Z) {
	let r = e[t.block], i = r.source, a = r.kind === "quote" ? null : Mn(r, t.offset, n), o = a ? a[0] : i.slice(0, t.offset), s = a ? a[1] : i.slice(t.offset);
	if (r.kind === "code") {
		if (!(t.offset === i.length && wt(r))) return $(e, t, t, "\n", n);
	} else if (r.kind === "bullet") {
		if (!i.slice(r.prefix).trim()) return r.depth ? fr(e, {
			anchor: t.block,
			focus: t.block
		}, -1) : $(e, {
			block: t.block,
			offset: 0
		}, {
			block: t.block,
			offset: i.length
		}, "");
		s = Yn(r) + s;
	} else if (r.kind === "quote") {
		let r = i.lastIndexOf("\n", t.offset - 1) + 1;
		if (!i.slice(r, t.offset).replace(qe, "").trim() && !s.trim()) o = i.slice(0, Math.max(0, r - 1)), s = "";
		else return $(e, t, t, "\n> ", n);
	}
	let c = Vn(o), l = Vn(s), u = [
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
function Zn(e, t) {
	let n = e[t];
	return !n.prefix || n.kind === "code" || n.kind === "divider" ? null : $(e, {
		block: t,
		offset: 0
	}, {
		block: t,
		offset: n.prefix
	}, "");
}
function Qn(e, t, n = Z) {
	if (t === 0) return null;
	let r = e[t - 1], i = {
		block: t - 1,
		offset: r.source.length
	};
	return r.kind === "divider" ? $(e, {
		block: t - 1,
		offset: 0
	}, {
		block: t,
		offset: 0
	}, "", n) : r.kind === "code" && e[t].source ? {
		blocks: [...e],
		caret: i
	} : {
		...$(e, i, {
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
function $n(e, t, n = Z) {
	if (t + 1 >= e.length) return null;
	let r = e[t + 1];
	if (r.kind === "divider") return $(e, {
		block: t,
		offset: e[t].source.length
	}, {
		block: t + 1,
		offset: r.source.length
	}, "", n);
	let i = Qn(e, t + 1, n);
	return i && {
		...i,
		caret: {
			block: t,
			offset: e[t].source.length
		}
	};
}
function er(e, t, n, r, i = r, a = Z) {
	let [o, s] = Un(t, n), c = fn(r, i);
	if (!c || Hn(o, s) === 0) return tr(e, t, n, r, i);
	let l = (t) => [t === o.block ? Math.max(o.offset, e[t].prefix) : e[t].prefix, t === s.block ? s.offset : e[t].source.length], u = !1, d = !0;
	for (let t = o.block; t <= s.block; t++) {
		let n = e[t];
		if (!mn(n)) continue;
		let [r, i] = l(t), o = Fn(n, r, i, c.key, a);
		o.words && (u = !0, d &&= o.all);
	}
	return u ? ir(e, o, s, d ? { remove: c.family } : { add: c }, a) ?? {
		blocks: [...e],
		anchor: o,
		focus: s
	} : {
		blocks: [...e],
		anchor: o,
		focus: s
	};
}
function tr(e, t, n, r, i) {
	let [a, o] = Un(t, n);
	if (a.block !== o.block) {
		let t = [...e], n = a, s = o;
		for (let c = o.block; c >= a.block; c--) {
			let l = c === a.block ? Math.max(a.offset, e[c].prefix) : e[c].prefix, u = c === o.block ? o.offset : e[c].source.length, d = e[c].source;
			if (c === a.block && d.slice(l - r.length, l) === r && d.endsWith(i) && (u -= i.length), c === o.block && d.slice(u, u + i.length) === i && d.slice(l, l + r.length) === r && (l += r.length), u <= l || e[c].kind === "code" || e[c].kind === "divider" || e[c].kind === "table") continue;
			let f = tr(t, {
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
	let s = e[a.block].source;
	if (e[a.block].kind === "table" && !Le(s, a.offset, o.offset)) return null;
	let c = s.slice(a.offset, o.offset), l = r.length, u = i.length, d = (e) => ({
		block: a.block,
		offset: e
	});
	return s.slice(a.offset - l, a.offset) === r && s.slice(o.offset, o.offset + u) === i ? {
		blocks: $(e, d(a.offset - l), d(o.offset + u), c).blocks,
		anchor: d(a.offset - l),
		focus: d(o.offset - l)
	} : c.length > l + u && c.startsWith(r) && c.endsWith(i) ? {
		blocks: $(e, a, o, c.slice(l, c.length - u)).blocks,
		anchor: a,
		focus: d(o.offset - l - u)
	} : {
		blocks: $(e, a, o, r + c + i).blocks,
		anchor: d(a.offset + l),
		focus: d(a.offset + l + c.length)
	};
}
function nr(e, t, n, r, i = Z) {
	return ir(e, t, n, r ? { add: ln(r) } : { remove: "color" }, i);
}
function rr(e, t, n, r, i = Z) {
	return r ? ir(e, t, n, r === "yellow" ? {
		add: on,
		remove: "background"
	} : {
		add: un(r),
		remove: "highlight"
	}, i) : ir(e, t, n, { remove: ["background", "highlight"] }, i);
}
function ir(e, t, n, r, i) {
	let [a, o] = Un(t, n), s = [...e], c = a, l = o, u = !1;
	for (let t = o.block; t >= a.block; t--) {
		let n = e[t];
		if (!mn(n)) continue;
		let d = t === a.block ? Math.max(a.offset, n.prefix) : n.prefix, f = t === o.block ? o.offset : n.source.length;
		if (f <= d) continue;
		let p = Ln(n, d, f, r, i);
		p.source !== n.source && (s = qn(s, t, p.source).blocks, u = !0, t === a.block && (c = {
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
function ar(e, t) {
	let n = e[t];
	if (n.kind !== "bullet" || n.checked === void 0) return null;
	let r = n.source.indexOf("[") + 1;
	return $(e, {
		block: t,
		offset: r
	}, {
		block: t,
		offset: r + 1
	}, n.checked ? " " : "x");
}
function or(e, t, n = t) {
	let r = (t) => Math.max(0, Math.min(e.length - 1, t));
	return {
		anchor: r(t),
		focus: r(n)
	};
}
function sr(e, t, n) {
	let r = Math.min(t.anchor, t.focus), i = Math.max(t.anchor, t.focus), a = e.flatMap((e, t) => {
		if (t < r || t > i) return [e];
		let a = e.source.slice(e.prefix);
		if (e.kind === "code") {
			let t = e.source.split("\n").slice(1);
			wt(e) && t.pop(), a = t.join("\n");
		} else e.kind === "quote" || e.kind === "callout" ? a = e.source.split("\n").map((t, n) => n === 0 ? t.slice(e.prefix) : t.replace(qe, "")).join("\n") : e.kind === "divider" && (a = "");
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
		return St(n === "code" ? `${s}\n${a}\n${s}` : n === "divider" ? "---" : n === "equation" ? `$$\n${a}\n$$` : n === "table" ? "|  |  |\n| --- | --- |\n|  |  |" : n === "callout" || n.startsWith("toggle") ? o + a.split("\n").join("\n> ") : a.split("\n").map((e) => o + e).join("\n")).map(({ start: e, ...t }) => t);
	});
	return {
		blocks: a,
		caret: {
			block: r,
			offset: a[r].prefix
		}
	};
}
function cr(e, t) {
	let n = Math.min(t.anchor, t.focus), r = Math.max(t.anchor, t.focus), i = [...e.slice(0, n), ...e.slice(r + 1)];
	i.length || i.push({ ...Bn });
	let a = Math.min(n, i.length - 1);
	return {
		blocks: i,
		caret: {
			block: a,
			offset: i[a].prefix
		}
	};
}
function lr(e, t) {
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
function ur(e, t, n) {
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
function dr(e) {
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
function fr(e, t, n) {
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
		blocks: dr(l),
		caret: {
			block: r,
			offset: l[r].prefix
		}
	};
}
function pr(e, t, n) {
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
function mr(e, t, n) {
	let r = e[t];
	if (r.kind !== "callout") return null;
	let i = Qe(r.source);
	if (!i) return null;
	let a = n.icon === void 0 ? i.icon : n.icon ?? void 0, o = n.color === void 0 ? i.color : n.color ?? void 0, s = $e({
		kind: a !== void 0 || o !== void 0 ? "" : i.kind,
		icon: a,
		color: o,
		folded: i.folded
	}), c = r.source.slice(i.length), l = s + (/[ \t]*$/.exec(r.source.slice(0, i.length))[0] || (c && !c.startsWith("\n") ? " " : "")) + c, u = [...e];
	return u[t] = St(l).map(({ start: e, ...t }) => t)[0], {
		blocks: u,
		caret: {
			block: t,
			offset: u[t].prefix
		}
	};
}
//#endregion
//#region src/history.ts
var hr = class {
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
		t !== "edit" && t === this.lastKind && n - this.lastTime < 700 && e.focus.block === this.lastBlock && !(t === "type" && gr(e)) ? this.past[this.past.length - 1] = e : this.past.push(e), this.future = [], this.lastKind = t, this.lastTime = n, this.lastBlock = e.focus.block;
	}
	undo() {
		if (this.past.length < 2) return null;
		let e = this.past.pop();
		this.future.push(e), this.lastKind = null;
		let t = vr(this.current.blocks, e.blocks);
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
}, gr = ({ blocks: e, focus: t }) => {
	let n = e[t.block]?.source ?? "";
	return /\s/.test(n[t.offset - 1] ?? "") && /\S/.test(n[t.offset - 2] ?? "");
}, _r = (e, t) => e === t || e.kind === t.kind && e.source === t.source;
function vr(e, t) {
	let n = 0;
	for (; n < e.length && n < t.length && _r(e[n], t[n]);) n++;
	if (n === e.length && n === t.length) return null;
	let r = e.length, i = t.length;
	for (; r > n && i > n && _r(e[r - 1], t[i - 1]);) r--, i--;
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
//#region src/icons.ts
var yr = /* #__PURE__ */ Object.assign({
	"./icons/background.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M4 2H12A2 2 0 0 1 14 4V12A2 2 0 0 1 12 14H4A2 2 0 0 1 2 12V4A2 2 0 0 1 4 2ZM7.4 4L4.8 12H6L6.65 10H9.35L10 12H11.2L8.6 4H7.4ZM7 9L8 5.9L9 9H7Z\" fill=\"currentColor\"/></svg>\n",
	"./icons/bold.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M5 3.5H8.75A2.25 2.25 0 0 1 8.75 8H5M5 8H9.25A2.25 2.25 0 0 1 9.25 12.5H5M5 3.5V12.5\" stroke=\"currentColor\" stroke-width=\"1.5\"/>\n</svg>\n",
	"./icons/box.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<g stroke=\"currentColor\" stroke-width=\"0.92\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2.25 5L8 2.25L13.75 5V11L8 13.75L2.25 11Z\"/><path d=\"M2.25 5L8 7.75L13.75 5M8 7.75V13.75\"/><path d=\"M5.1 3.6L10.9 6.4\"/></g>\n</svg>\n",
	"./icons/bullet.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<circle cx=\"4\" cy=\"5.5\" r=\"1.15\" fill=\"currentColor\"/>\n<circle cx=\"4\" cy=\"10.5\" r=\"1.15\" fill=\"currentColor\"/>\n<path d=\"M7 5H13V6H7ZM7 10H13V11H7Z\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/callout.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M2.5 3.5H13.5V12.5H2.5Z\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n<circle cx=\"5.5\" cy=\"8\" r=\"1.2\" fill=\"currentColor\"/>\n<path d=\"M8 6H11.5V7H8ZM8 9H11.5V10H8Z\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/check.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M6.68649 11.884L12.443 6.13601L11.736 5.42715L6.68835 10.4827L4.26399 8.0501L3.55696 8.74525L6.68649 11.884Z\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/chevron-down.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M4.25 6.25L8 10L11.75 6.25\" stroke=\"currentColor\"/>\n</svg>\n",
	"./icons/chevron-up.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M4.25 9.75L8 6L11.75 9.75\" stroke=\"currentColor\"/>\n</svg>\n",
	"./icons/close.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M12.1215 4.58087L8.70453 7.99397L12.1176 11.4169L11.4106 12.112L7.99847 8.69108L4.58636 12.112L3.87836 11.4031L7.29535 7.99005L3.88226 4.56716L4.58929 3.87201L8.0014 7.29294L11.4145 3.87201L12.1215 4.58087Z\" fill=\"#1E1E1E\"/>\n</svg>\n",
	"./icons/code-block.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M2.5 3H13.5V13H2.5Z\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n<path d=\"M6.5 6L4.5 8L6.5 10M9.5 6L11.5 8L9.5 10\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n</svg>\n",
	"./icons/code.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M6.5 4.5L3 8L6.5 11.5M9.5 4.5L13 8L9.5 11.5\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n</svg>\n",
	"./icons/color.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 12 12\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<circle cx=\"6\" cy=\"6\" r=\"5\" stroke=\"currentColor\" stroke-width=\"1.2\" fill=\"none\"/>\n<circle cx=\"6\" cy=\"6\" r=\"3\" fill=\"currentColor\"/>\n</svg></svg>\n",
	"./icons/column.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M4.67614 12.123L0.536957 7.98382L4.66961 3.85117L5.38124 4.54974L2.45639 7.47459L13.5436 7.50693L10.6122 4.5886L11.3239 3.87698L15.463 8.01616L11.3304 12.1488L10.6188 11.4503L13.5436 8.5254L2.45639 8.49306L5.38777 11.4114L4.67614 12.123Z\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/comment.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M3 3.5H13V10.5H8L5.5 12.75V10.5H3Z\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n</svg>\n",
	"./icons/connect.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M11.7982 7.99673L7.65899 12.1359L6.94737 11.4243L9.87875 8.50597L3.88054 8.51223L3.88054 7.49375L9.87875 7.48749L6.9539 4.56264L7.66552 3.86407L11.7982 7.99673Z\" fill=\"black\"/>\n<path d=\"M3.37131 7.99987C3.37131 8.81187 2.71305 9.47013 1.90105 9.47013C1.08904 9.47013 0.430786 8.81187 0.430786 7.99987C0.430786 7.18787 1.08904 6.52961 1.90105 6.52961C2.71305 6.52961 3.37131 7.18787 3.37131 7.99987Z\" fill=\"black\"/>\n<path d=\"M15.5692 7.99987C15.5692 8.81187 14.911 9.47013 14.099 9.47013C13.2869 9.47013 12.6287 8.81187 12.6287 7.99987C12.6287 7.18787 13.2869 6.52961 14.099 6.52961C14.911 6.52961 15.5692 7.18787 15.5692 7.99987Z\" fill=\"black\"/>\n</svg>\n",
	"./icons/copy.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M5.5 5.5H12.5V12.5H5.5ZM3.5 10.5V3.5H10.5\" stroke=\"currentColor\" stroke-width=\"1.1\"/></svg>\n",
	"./icons/cursor.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<g stroke=\"currentColor\" stroke-width=\"0.92\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 2.25V12.75L6.75 10.25L8.5 14L10 13.25L8.25 9.75H12L4 2.25Z\"/></g>\n</svg>\n",
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
	"./icons/note.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M13.9653 3.31348V12.6865H2.03467V3.31348H13.9653ZM3.03467 11.6865H12.9653V4.31348H3.03467V11.6865Z\" fill=\"#1E1E1E\"/>\n<path d=\"M8.00641 7.08004V7.99996H3.71344V7.08004H8.00641ZM9.9527 5.08004V5.99996H3.71344V5.08004H9.9527Z\" fill=\"#1E1E1E\"/>\n</svg>\n",
	"./icons/numbered.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M2.5 4.5L3.9 3.25V7M2.6 9.75A1.3 1.3 0 1 1 4.9 10.6L2.6 12.9H5.3\" stroke=\"currentColor\" stroke-width=\"1\"/>\n<path d=\"M7 4.5H13V5.5H7ZM7 10.5H13V11.5H7Z\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/outdent.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M3 3.5H13V4.5H3ZM8 7.5H13V8.5H8ZM3 11.5H13V12.5H3Z\" fill=\"currentColor\"/>\n<path d=\"M5.75 6L3 8L5.75 10Z\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/plus.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M8.50235 2.6739L8.4996 7.5035L13.3334 7.51044L13.325 8.50193L8.49328 8.49569L8.49951 13.3274L7.49764 13.3268L7.50039 8.49717L2.66663 8.49024L2.67503 7.49875L7.50672 7.50499L7.50117 2.67261L8.50235 2.6739Z\" fill=\"#1E1E1E\"/>\n</svg>\n",
	"./icons/quote.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M3 3.5H4V12.5H3ZM6.5 5H13V6H6.5ZM6.5 7.5H13V8.5H6.5ZM6.5 10H11V11H6.5Z\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/right.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M13.1566 8.60594H0V9.61651L13.1562 9.61791L10.249 12.5251L10.9558 13.219L15.0636 9.11123L10.9524 5L10.245 5.70734L13.1566 8.60594Z\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/search.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M9.08545 6.62646C9.08545 5.25128 7.9704 4.13623 6.59521 4.13623C5.22003 4.13623 4.10498 5.25128 4.10498 6.62646C4.10498 8.00165 5.22003 9.1167 6.59521 9.1167C7.9704 9.1167 9.08545 8.00165 9.08545 6.62646ZM10.105 6.62646C10.105 7.39551 9.85647 8.10577 9.43701 8.68408L12.9146 12.1616L12.1929 12.8833L8.72412 9.41455C8.13339 9.86631 7.39632 10.1362 6.59521 10.1362C4.6567 10.1362 3.08545 8.56498 3.08545 6.62646C3.08545 4.68795 4.6567 3.1167 6.59521 3.1167C8.53373 3.1167 10.105 4.68795 10.105 6.62646Z\" fill=\"#1E1E1E\"/>\n</svg>\n",
	"./icons/send.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M8 12.5V4.5M4.75 7.75L8 4.5L11.25 7.75\" stroke=\"currentColor\" stroke-width=\"1\"/>\n</svg>\n",
	"./icons/slash.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M10.25 3L5.75 13\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n</svg>\n",
	"./icons/strike.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M10.6 5.4C10.4 4.2 9.4 3.5 8 3.5C6.5 3.5 5.5 4.3 5.5 5.5C5.5 8.2 10.5 7.4 10.5 10.3C10.5 11.6 9.4 12.5 8 12.5C6.5 12.5 5.5 11.7 5.4 10.6M4 8H12\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n</svg>\n",
	"./icons/table.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M2.5 3H13.5V13H2.5Z\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n<path d=\"M6.2 3V13M9.8 3V13M2.5 8H13.5\" stroke=\"currentColor\" stroke-width=\"1\"/>\n</svg>\n",
	"./icons/tabs.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M2.5 13V3H6.5V6H13.5V13Z\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n<path d=\"M9.5 6V3H13.5V6\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n</svg>\n",
	"./icons/text.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M3 4H13V5H3ZM3 7.5H13V8.5H3ZM3 11H9V12H3Z\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/todo.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M2.5 3H6.5V7H2.5ZM2.5 9H6.5V13H2.5Z\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n<path d=\"M3.5 5L4.4 5.9L5.7 4.2\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n<path d=\"M8.5 4.5H13.5V5.5H8.5ZM8.5 10.5H13.5V11.5H8.5Z\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/toggle.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M3 5L7.5 8L3 11Z\" fill=\"currentColor\"/>\n<path d=\"M9.5 7.5H13.5V8.5H9.5Z\" fill=\"currentColor\"/>\n</svg>\n",
	"./icons/underline.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M5.5 3.25V8A2.5 2.5 0 0 0 10.5 8V3.25M4 12.75H12\" stroke=\"currentColor\" stroke-width=\"1.1\"/>\n</svg>\n",
	"./icons/undo.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 12 10\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M1 4L4 1M1 4L4 7M1 4H8C9.65685 4 11 5.34315 11 7V9\" stroke=\"currentColor\" stroke-width=\"1.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/>\n</svg></svg>\n",
	"./icons/up.svg": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M7.49645 3.48222V16H8.50702L8.50841 3.48259L11.4156 6.38982L12.1095 5.68299L8.00173 1.57524L3.8905 5.68647L4.59784 6.39381L7.49645 3.48222Z\" fill=\"#1E1E1E\"/>\n</svg>\n"
});
function br(e) {
	let t = xr.get(e);
	if (t === void 0) {
		let n = yr[`./icons/${e}.svg`];
		xr.set(e, t = n ? `url("data:image/svg+xml,${encodeURIComponent(n.replace(/currentColor/g, "black"))}")` : "");
	}
	return t;
}
var xr = /* @__PURE__ */ new Map();
function Sr(e, t = globalThis.document) {
	let n = t.createElement("span");
	return n.className = "aa-icon", n.style.maskImage = br(e), n;
}
//#endregion
//#region src/urls.ts
function Cr(e) {
	if (/[\u0000-\u001f\u007f]/.test(e)) return null;
	try {
		let t = new URL(e, "https://aa.invalid/");
		return [
			"http:",
			"https:",
			"mailto:",
			"tel:"
		].includes(t.protocol) ? e : null;
	} catch {
		return null;
	}
}
//#endregion
//#region src/render.ts
function wr(e, t, n = globalThis.document) {
	let r = n.createElement("span");
	return r.className = "aa-atom", r.contentEditable = "false", r.dataset.atom = e, r.dataset.source = t, r;
}
var Tr = (e) => e.nodeType === 1, Er = (e) => Tr(e) && e.classList.contains("aa-atom"), Dr = (e, t, n) => !!e && e.from <= n && e.to >= t, Or = 56, kr = 6;
function Ar(e, t) {
	if (!e.href || e.code || /\s/.test(t)) return null;
	let n = /^(?:https?:\/\/(?:www\.)?|www\.)/.exec(t)?.[0].length ?? 0;
	if (!n || n === t.length) return null;
	let r = t.endsWith("/") ? t.length - 1 : t.length;
	if (r - n <= Or) return {
		shown: n,
		end: r,
		more: !1
	};
	let i = t.slice(n, n + Or).search(/[-_/.?&=#][^-_/.?&=#]*$/);
	return {
		shown: n,
		end: n + (i > Or / 2 ? i : Or),
		more: !0
	};
}
function jr(e, t, n = Z) {
	if (!t || Tt(e, n)) return "";
	let r = [], i = 0;
	for (let a of Zt(e, n)) a.kind === "text" && Ar(a, e.source.slice(a.from, a.to)) && ++i && Dr(t, a.from, a.to) && r.push(`address ${i}`), a.kind === "atom" && a.group && t.from <= a.group[1] && t.to >= a.group[0] && r.push(`${a.group[0]}-${a.group[1]}`);
	let a = e.kind === "callout" && e.source.includes("\n") && t.to > e.source.indexOf("\n");
	return r.length || a ? `on:${r.join(",")}${a ? ":body" : ""}` : "";
}
var Mr = (e) => `${e.href ?? ""}|${e.title ?? ""}|${e.bold ? "b" : ""}${e.italic ? "i" : ""}${e.strike ? "s" : ""}${e.underline ? "u" : ""}${e.code ? "c" : ""}${e.highlight ? "h" : ""}|${e.color ?? ""}|${e.background ?? ""}`, Nr = /* @__PURE__ */ new WeakMap();
function Pr(e, t, n, r, i = 0, a = null) {
	let o = t.href ? Cr(t.href) : null, s = o ? e.createElement("a") : e.createElement("span");
	if (o && (s.href = o, s.className = "aa-link", s.rel = "noopener", s.title = t.title ?? o), t.bold && s.classList.add("aa-b"), t.italic && s.classList.add("aa-i"), t.strike && s.classList.add("aa-s"), t.underline && s.classList.add("aa-u"), t.color && (s.dataset.color = t.color), t.background && (s.classList.add("aa-bg"), s.dataset.fill = t.background), t.code && (s.classList.add("aa-c"), s.spellcheck = !1), t.highlight && s.classList.add("aa-highlight"), s.textContent = n, Nr.set(s, Mr(t)), Br(s, i + t.from, r), a && s.childNodes.length === 1 && s.firstChild.nodeType === 3) {
		let t = a.more ? a.end - kr : a.end;
		if (s.replaceChildren(Lr(e, n.slice(0, a.shown)), n.slice(a.shown, t)), a.more) {
			let r = e.createElement("span");
			r.className = "aa-link-fade", r.textContent = n.slice(t, a.end), s.append(r);
		}
		a.end < n.length && s.append(Lr(e, n.slice(a.end)));
	}
	return s;
}
function Fr(e, t, n) {
	n === void 0 ? delete e.dataset[t] : e.dataset[t] = n;
}
function Ir(e, t, n) {
	n === void 0 ? e.style.removeProperty(t) : e.style.setProperty(t, n);
}
function Lr(e, t) {
	let n = e.createElement("span");
	return n.className = "aa-syntax", n.setAttribute("data-hidden", ""), n.textContent = t, n;
}
function Rr(e, t, n, r = Z) {
	if (n.kind !== t.kind || n.kind === "table" || n.kind === "callout" || n.prefix !== t.prefix || n.level !== t.level || n.checked !== t.checked || n.number !== t.number || n.depth !== t.depth || n.kind === "heading" && !n.source.slice(n.prefix).trim() != !t.source.slice(t.prefix).trim() || n.kind === "code" && !!Tt(n, r) != !!Tt(t, r)) return !1;
	let i = e.firstChild, a = !1, o = !1;
	for (let e of Zt(n, r)) {
		if (o = e.kind === "break", e.kind === "atom") return !1;
		if (e.kind === "break") {
			if (!i || i.tagName !== "BR" || !("line" in i.dataset)) return !1;
			i = i.nextSibling;
			continue;
		}
		let t = n.source.slice(e.from, e.to);
		if (!t) continue;
		e.kind === "text" && (a = !0);
		let r = e.kind === "text" && !!i?.querySelector?.(":scope > .aa-syntax");
		if (!i || (r ? i.textContent !== t : i.childNodes.length !== 1 || i.firstChild.nodeType !== 3 || i.firstChild.data !== t) || (e.kind === "syntax" ? !i.classList?.contains("aa-syntax") : Nr.get(i) !== Mr(e))) return !1;
		i = i.nextSibling;
	}
	return !a || o ? !!i && i.tagName === "BR" && "filler" in i.dataset && !i.nextSibling : !i;
}
function zr(e, t, n, r = Z, i, a = []) {
	let o = e.ownerDocument;
	i ??= (e, t) => {
		let n = wr(e, t, o);
		return n.textContent = t, n;
	}, e.className = "aa-block", e.dataset.kind = t.kind;
	for (let n of [
		"spellcheck",
		"autocorrect",
		"autocapitalize"
	]) t.kind === "code" ? e.setAttribute(n, n === "spellcheck" ? "false" : "off") : e.removeAttribute(n);
	Fr(e, "level", t.level ? String(t.level) : void 0), Fr(e, "checked", t.checked === void 0 ? void 0 : String(t.checked)), e.toggleAttribute("data-active", !!n), e.toggleAttribute("data-empty", t.kind === "heading" && !t.source.slice(t.prefix).trim()), e.dataset.reveal = jr(t, n, r), e.style.setProperty("--aa-depth", String(t.depth ?? 0)), Fr(e, "number", t.number === void 0 ? void 0 : String(t.number));
	let s = t.kind === "callout", c = s && !!t.box, l = c && t.icon && /^https?:\/\//i.test(t.icon) ? t.icon : void 0;
	if (e.toggleAttribute("data-box", c), Fr(e, "icon", c && !l ? t.icon : void 0), e.toggleAttribute("data-picture", !!l), Ir(e, "--aa-callout-picture", l && `url("${l.replace(/["\\\s]/g, (e) => encodeURIComponent(e))}")`), Fr(e, "fill", c ? t.color : void 0), Ir(e, "--aa-callout-icon", s && !c ? br(t.folded ? "toggle" : t.callout === "tip" ? "check" : t.callout === "warning" || t.callout === "caution" ? "callout" : "note") : void 0), Fr(e, "callout", s ? t.callout : void 0), e.toggleAttribute("data-folded", s && !!t.folded), e.toggleAttribute("data-body-active", s && !!n && n.to > t.source.indexOf("\n") && t.source.includes("\n")), t.kind === "table") {
		Hr(e, t, n, a, r), Vr(e, a);
		return;
	}
	let u = Tt(t, r);
	e.toggleAttribute("data-drawn", !!u || t.kind === "columns" || t.kind === "tabs" || t.kind === "toc"), Fr(e, "fence", u?.name), t.kind === "code" && !u ? (e.style.setProperty("--aa-copy-icon", br("copy")), e.style.setProperty("--aa-copied-icon", br("check"))) : (e.style.removeProperty("--aa-copy-icon"), e.style.removeProperty("--aa-copied-icon"));
	let d = /* @__PURE__ */ new Map();
	for (let t of e.querySelectorAll(".aa-atom")) {
		let e = `${t.dataset.atom}\u0000${t.dataset.source}`;
		d.set(e, [...d.get(e) ?? [], t]);
	}
	let f = o.createDocumentFragment(), p = o.createElement("span");
	p.className = "aa-callout-body";
	let m = f, h = !1, g = !1;
	for (let e of Zt(t, r)) {
		if (t.kind === "callout" && e.from >= t.source.indexOf("\n") && t.source.includes("\n") && m === f && (f.append(p), m = p), g = e.kind === "break", e.kind === "break") {
			let e = o.createElement("br");
			e.dataset.line = "", m.append(e);
			continue;
		}
		let r = t.source.slice(e.from, e.to);
		r && (e.kind === "atom" ? (e.group && n && !u && n.from <= e.to && n.to >= e.from ? m.append(o.createTextNode(r)) : m.append(d.get(`${e.atom}\u0000${r}`)?.shift() ?? i(e.atom, r)), h = !0) : e.kind === "syntax" ? m.append(Lr(o, r)) : (h = !0, m.append(Pr(o, e, r, a, 0, Dr(n, e.from, e.to) ? null : Ar(e, r)))));
	}
	if (!h || g) {
		let e = o.createElement("br");
		e.dataset.filler = "", f.append(e);
	}
	e.replaceChildren(f), Vr(e, a);
}
function Br(e, t, n) {
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
function Vr(e, t) {
	let n = e.ownerDocument;
	for (let r of t.filter((t) => t.from === t.to && t.from >= 0 && t.from <= Ur(e).length)) {
		let t = n.createElement("span");
		t.className = `${r.className} aa-peer-caret`, t.contentEditable = "false", t.dataset.label = r.label ?? "", r.label && (t.dataset.initial = xe(r.label)), t.title = r.label ?? "";
		let i = Kr(e, r.from), a = n.createRange();
		a.setStart(i.node, i.offset), a.collapse(!0), a.insertNode(t);
	}
}
function Hr(e, t, n, r, i) {
	let a = e.ownerDocument;
	e.contentEditable = "false";
	let o = X(t.source), s = Re(t.source), c = ze(t.source);
	c.some((e) => e !== null) ? e.style.setProperty("--aa-table-columns", c.map((e) => e === null ? "minmax(0, 1fr)" : `calc(${e} * var(--aa-unit))`).join(" ")) : e.style.removeProperty("--aa-table-columns");
	let l = Math.max(1, o[0]?.length ?? 1);
	e.style.setProperty("--aa-table-auto", `${l > 1 ? `repeat(${l - 1}, round(down, calc(100% / ${l}), var(--aa-unit))) ` : ""}minmax(0, 1fr)`);
	let u = a.createDocumentFragment(), d = 0;
	o.forEach((o, c) => {
		let l = a.createElement("span");
		l.className = "aa-table-row", l.style.setProperty("--aa-columns", String(o.length)), o.forEach((o, u) => {
			let f = a.createElement("span");
			f.className = "aa-table-cell", f.dataset.cell = `${c}:${u}`, s[u] && (f.dataset.align = s[u]), f.dataset.from = String(o.from), f.dataset.to = String(o.to), f.contentEditable = e.dataset.readonly === "true" ? "false" : "true";
			let p = Lr(a, t.source.slice(d, o.from)), m = a.createElement("span");
			c === 0 && !o.text && e.dataset.readonly !== "true" && (m.dataset.tablePlaceholder = H("Header"));
			for (let e of Zt({
				kind: "paragraph",
				source: o.text,
				prefix: 0
			}, i)) {
				let t = o.text.slice(e.from, e.to);
				t && (e.kind === "syntax" ? m.append(Lr(a, t)) : e.kind === "text" ? m.append(Pr(a, e, t, r, o.from, Dr(n, o.from + e.from, o.from + e.to) ? null : Ar(e, t))) : m.append(a.createTextNode(t)));
			}
			if (!o.text) {
				let e = a.createElement("br");
				e.dataset.filler = "", m.append(e);
			}
			if (c === 0) {
				let e = a.createElement("span");
				e.className = "ds-table-column-resize", e.contentEditable = "false", e.tabIndex = 0, e.setAttribute("data-aa-interactive", ""), e.setAttribute("role", "separator"), e.setAttribute("aria-orientation", "vertical"), e.setAttribute("aria-label", H("Column width")), f.append(e);
			}
			f.append(p, m), l.append(f), d = o.to;
		}), u.append(l);
	}), u.append(Lr(a, t.source.slice(d))), e.replaceChildren(u);
}
function Ur(e) {
	let t = "", n = 0, r = "", i = () => {
		t += "\n".repeat(n) + r, n = 0, r = "";
	}, a = (e) => {
		for (let o = e.firstChild; o; o = o.nextSibling) if (o.nodeType === Node.TEXT_NODE) {
			let e = o.data;
			if (!e) continue;
			if (n && Wr(o)) {
				r += e;
				continue;
			}
			i(), t += e.includes("\xA0") ? e.replace(/\u00a0/g, " ") : e;
		} else Tr(o) && (Er(o) ? (i(), t += o.dataset.source ?? "") : o.tagName === "BR" ? "filler" in o.dataset ? i() : "line" in o.dataset ? (i(), t += "\n") : n++ : ((o.tagName === "DIV" || o.tagName === "P") && t && !t.endsWith("\n") && (t += "\n"), a(o)));
	};
	return a(e), n = Math.max(0, n - 1), i(), t;
}
function Wr(e) {
	let t = e.parentElement;
	return !!t && !!t.closest(".aa-syntax[data-hidden]");
}
function Gr(e, t, n) {
	let r = 0, i = -1, a = (e) => {
		let o = 0;
		for (let s = e.firstChild; s; s = s.nextSibling, o++) {
			if (e === t && o === n) return i = r, !0;
			if (s === t && s.nodeType === Node.TEXT_NODE) return i = r + n, !0;
			if (s.nodeType === Node.TEXT_NODE) r += s.length;
			else if (Tr(s)) {
				if (Er(s)) {
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
function Kr(e, t) {
	if (e.dataset.kind === "table") {
		let n = Array.from(e.querySelectorAll("[data-cell]")).find((e) => t >= Number(e.dataset.from) && t <= Number(e.dataset.to));
		if (n?.lastElementChild) return Kr(n.lastElementChild, t - Number(n.dataset.from));
	}
	let n = 0, r = null, i = (e) => {
		let a = Array.from(e.childNodes);
		for (let o = 0; o < a.length; o++) {
			let s = a[o];
			if (s.nodeType === Node.TEXT_NODE) {
				let e = (s.textContent ?? "").length;
				if (!Wr(s) && t <= n + e) return r = {
					node: s,
					offset: Math.max(0, t - n)
				}, !0;
				n += e;
			} else if (Tr(s)) {
				if (Er(s)) {
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
var qr = 4, Jr = 140;
function Yr(e, t) {
	let n = (e) => e?.closest?.(".ds-table-column-resize") ?? null, r = (e) => e.closest(".aa-block"), i = (e) => Array.from(e.querySelectorAll(".ds-table-column-resize")), a = (e) => i(e).map((e) => e.parentElement.getBoundingClientRect().width), o = (e, t) => e.style.setProperty("--aa-table-columns", t.map((e) => `${e}px`).join(" ")), s = (e, t) => e.map((e) => Math.max(qr, Math.round(e / t))), c = (e) => e.style.setProperty("--ds-table-resize-height", `${r(e).getBoundingClientRect().height}px`), l = null, u = (e, n, r) => {
		let a = t.write(e, n), o = a && i(a)[r];
		o && (c(o), o.focus({ preventScroll: !0 }));
	}, d = () => {
		if (!l) return;
		let { handle: e } = l;
		delete e.dataset.resizing, e.removeEventListener("pointermove", f), e.removeEventListener("pointerup", m), e.removeEventListener("pointercancel", p), l = null;
	}, f = (e) => {
		if (!l) return;
		let t = (e.clientX - l.start) * (l.rtl ? -1 : 1);
		l.widths = l.before.map((e, n) => n === l.index ? Math.max(qr * l.unit, e + t) : e), o(l.block, l.widths);
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
		a ? setTimeout(c, Jr) : c();
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
		h[f] = Math.max(qr, h[f] + (e.key === "ArrowRight" ? 1 : -1) * (m ? -1 : 1) * (e.shiftKey ? 5 : 1)), u(c, h, f);
	}, _ = (e) => {
		let t = n(e.target);
		t && c(t);
	};
	return e.addEventListener("pointerdown", h, !0), e.addEventListener("keydown", g, !0), e.addEventListener("pointerover", _), e.addEventListener("focusin", _), () => {
		p(), e.removeEventListener("pointerdown", h, !0), e.removeEventListener("keydown", g, !0), e.removeEventListener("pointerover", _), e.removeEventListener("focusin", _);
	};
}
//#endregion
//#region src/atoms.ts
function Xr(e, t) {
	return {
		name: "person",
		tag: !0,
		match(t, n) {
			if (t[n] !== "@" || n > 0 && !/[\s([{>*_~]/.test(t[n - 1])) return 0;
			let r = t.slice(n + 1).toLocaleLowerCase(), i = e().map((e) => e.trim()).filter(Boolean).sort((e, t) => t.length - e.length).find((e) => r.startsWith(e.toLocaleLowerCase()) && !/[\p{L}\p{N}_-]/u.test(r[e.length] ?? ""));
			return i ? i.length + 1 : 0;
		},
		draw(e, n) {
			e.textContent = n;
			let r = t?.(n.slice(1));
			r && e.style.setProperty("--aa-person", r);
		}
	};
}
var Zr = 4;
function Qr(e) {
	let t = document.createElement("span");
	t.style.cssText = "position:absolute;visibility:hidden;width:var(--aa-unit, 20px)", e.append(t);
	let n = t.getBoundingClientRect().width;
	return t.remove(), n || 20;
}
var $r = (e) => {
	let t = e.querySelector("img");
	return t?.naturalWidth ? t.naturalHeight / t.naturalWidth : null;
};
function ei(e) {
	let t = e.querySelector("img");
	if (!t) return;
	let n = () => {
		let n = $r(e);
		if (!n || !e.isConnected || e.hasAttribute("data-sizing")) return;
		let r = Qr(e), i = Math.floor((e.closest(".aa-block")?.clientWidth ?? e.getBoundingClientRect().width) / r), a = Number(e.dataset.width) || Math.floor(Math.min(16, t.naturalWidth / r)), o = Math.max(1, Math.min(i || a, a));
		e.style.setProperty("--aa-picture-across", String(o)), e.style.setProperty("--aa-picture-down", String(Math.max(1, Math.round(o * n)))), e.setAttribute("data-fitted", "");
	};
	t.addEventListener("load", n), t.complete && n();
	let r = e.closest(".aa-block") ?? e.parentElement;
	if (r && typeof ResizeObserver < "u") {
		let t = new ResizeObserver(() => {
			e.isConnected ? n() : t.disconnect();
		});
		t.observe(r);
	}
}
function ti(e) {
	let t = Math.round(Number(e.style.getPropertyValue("--aa-picture-across")) || Number(e.dataset.width) || 0);
	if (!t) return [];
	let n = e.closest(".aa-block"), r = e.closest(".aa-columns"), i = r ?? n;
	return i ? Array.from(i.querySelectorAll(".aa-atom[data-atom=\"image\"]")).filter((i) => i !== e && Math.round(Number(i.style.getPropertyValue("--aa-picture-across")) || Number(i.dataset.width) || 0) === t && (r ? i.closest(".aa-columns") === r : i.closest(".aa-block") === n)) : [];
}
function ni(e, t, n) {
	let r = document.createElement("span");
	r.className = "aa-picture-grip", r.setAttribute("data-aa-interactive", ""), r.setAttribute("role", "separator"), r.setAttribute("aria-orientation", "vertical"), r.setAttribute("aria-label", H("Picture width")), r.contentEditable = "false";
	let i = () => Number(e.dataset.width) || null, a = (r, i) => {
		let a = Ot(r.dataset.source ?? "");
		r.dispatchEvent(new CustomEvent("aa-atom-source", {
			bubbles: !0,
			detail: { source: r === e ? kt(t, n, i) : kt(a.alt, a.src, i) }
		}));
	}, o = [], s = (t) => {
		for (let e of o) e.removeAttribute("data-linked");
		o = t ? ti(e) : [];
		for (let e of o) e.setAttribute("data-linked", "");
	}, c = (t) => {
		t.key === "Shift" && !e.hasAttribute("data-sizing") && s(t.type === "keydown");
	};
	r.addEventListener("pointerenter", (e) => {
		s(e.shiftKey), document.addEventListener("keydown", c), document.addEventListener("keyup", c);
	}), r.addEventListener("pointerleave", () => {
		e.hasAttribute("data-sizing") || (s(!1), document.removeEventListener("keydown", c), document.removeEventListener("keyup", c));
	}), r.addEventListener("pointerdown", (t) => {
		if (t.button !== 0 || e.closest(".aa-block")?.getAttribute("data-readonly") === "true") return;
		t.preventDefault(), t.stopPropagation();
		let n = Qr(e), i = t.clientX, c = e.getBoundingClientRect().width, l = e.closest(".aa-block")?.clientWidth ?? c, u = Math.max(Zr, Math.floor(l / n));
		t.shiftKey && !o.length && s(!0);
		let d = t.shiftKey ? [e, ...o] : [e], f = d.map((e) => Number(e.dataset.width) || null), p = Math.round(c / n);
		r.setPointerCapture(t.pointerId);
		for (let e of d) e.setAttribute("data-sizing", "");
		let m = (e) => {
			for (let t of d) {
				t.style.setProperty("--aa-picture-width", String(e)), t.dataset.width = String(Math.round(e)), t.style.setProperty("--aa-picture-across", String(e));
				let n = $r(t);
				n && t.style.setProperty("--aa-picture-down", String(Math.max(1, Math.round(e * n))));
			}
		}, h = (e) => {
			let t = Math.min(u, Math.max(Zr, (c + e.clientX - i) / n));
			p = Math.round(t), m(t);
		}, g = () => {
			r.removeEventListener("pointermove", h), r.removeEventListener("pointerup", g), r.removeEventListener("pointercancel", g);
			for (let e of d) e.removeAttribute("data-sizing"), e.setAttribute("data-settling", "");
			e.getBoundingClientRect(), m(p), d.forEach((e, t) => {
				p !== f[t] && a(e, p);
			}), s(!1), setTimeout(() => {
				for (let e of d) e.removeAttribute("data-settling");
			}, 160);
		};
		r.addEventListener("pointermove", h), r.addEventListener("pointerup", g), r.addEventListener("pointercancel", g);
	}), r.addEventListener("dblclick", (t) => {
		t.preventDefault(), t.stopPropagation(), i() !== null && a(e, null);
	}), e.append(r);
}
function ri(e, t) {
	let { alt: n, src: r, width: i } = Ot(t);
	i && (e.dataset.width = String(i), e.style.setProperty("--aa-picture-width", String(i))), ni(e, n, r), ei(e);
}
function ii({ caption: e = !0 } = {}) {
	return {
		...Dt,
		draw(t, n) {
			let { alt: r, src: i } = Ot(n), a = i.split(/[?#]/)[0].split(".").pop()?.toLowerCase();
			if (/^data:(audio|video)\//.test(i) || a && /^(mp4|webm|mov|mp3|wav|ogg|m4a)$/.test(a)) {
				let e = document.createElement(/^data:video\//.test(i) || /^(mp4|webm|mov)$/.test(a ?? "") ? "video" : "audio");
				e.src = i, e.controls = !0, e.preload = "metadata", e.setAttribute("aria-label", r), t.append(e);
			} else {
				let e = document.createElement("img");
				e.src = i, e.alt = r, e.loading = "lazy", e.draggable = !1, t.append(e), ri(t, n);
			}
			if (e) {
				let e = document.createElement("span");
				e.className = "aa-caption", e.textContent = r, e.contentEditable = "true", e.dataset.placeholder = H("Add a caption"), t.append(e);
			}
		}
	};
}
function ai(e) {
	e.dataset.open = "", e.addEventListener("blur", () => {
		delete e.dataset.open;
	}, { once: !0 }), e.focus();
	let t = e.parentElement?.querySelector("img")?.getAttribute("src") ?? "", n = t.startsWith("data:") ? t.split("#")[1] ?? "" : t.split(/[?#]/)[0].split("/").pop() ?? "", r;
	try {
		r = decodeURIComponent(n);
	} catch {
		return;
	}
	/^(?:screen[ _-]?shot|skærmbillede)(?:[ ._-]|$)/i.test(r) && (e.textContent = r, e.dispatchEvent(new Event("input", { bubbles: !0 })));
}
var oi = ii();
//#endregion
//#region src/lazy.ts
function si(e) {
	let t, n = async () => t ??= await e();
	return {
		get: n,
		here: () => t,
		when(e) {
			if (t) return e(t) ?? (() => {});
			let r, i = !1;
			return n().then((t) => {
				i || (r = e(t));
			}), () => {
				i = !0, r?.();
			};
		}
	};
}
//#endregion
//#region src/ds1/0-face/overlay-swipe.ts
var ci = 10, li = .998, ui = (e) => e / 1e3 * li / .0020000000000000018, di = (e, t, n = .55) => e * t * n / (t + n * Math.abs(e)), fi = /* @__PURE__ */ new Set([
	"none",
	"bottom",
	"end",
	"start"
]);
function pi(e) {
	let t = e.getAttribute("data-ds-edge");
	return t && fi.has(t) ? t : e.classList.contains("ds-overlay--sheet") ? "bottom" : e.classList.contains("ds-overlay--drawer") ? e.classList.contains("ds-overlay--start") ? "start" : "end" : "none";
}
function mi(e, t) {
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
function hi(e, t, n, r) {
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
function gi(e, t, n) {
	let r = e.ownerDocument.defaultView?.getComputedStyle(e).transform;
	if (!r || r === "none" || typeof DOMMatrixReadOnly > "u") return 0;
	try {
		let e = new DOMMatrixReadOnly(r);
		return n * (t === "y" ? e.m42 : e.m41);
	} catch {
		return 0;
	}
}
function _i(e, t = {}) {
	let n = () => (typeof t.edge == "function" ? t.edge() : t.edge) ?? pi(e), r = null, i = 0, a = e.ownerDocument.defaultView, o = (e) => a?.requestAnimationFrame ? a.requestAnimationFrame(e) : a?.setTimeout(e, 16) ?? 0, s = (t, n, r) => {
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
		let o = t.touches[0], { axis: s, sign: c } = mi(e, i);
		r = {
			id: o.identifier,
			x: o.clientX,
			y: o.clientY,
			base: Math.max(0, gi(e, s, c)),
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
		let { axis: l, sign: u } = mi(e, c), d = o.clientX - r.x, f = o.clientY - r.y, p = l === "y" ? f * u : d * u, m = l === "y" ? d : f;
		if (r.mode === "pending") {
			if (Math.hypot(d, f) < ci) {
				t.cancelable && p > 0 && p >= Math.abs(m) && !hi(r.path, e, l, p) && t.preventDefault();
				return;
			}
			if (Math.abs(p) <= Math.abs(m) || hi(r.path, e, l, p)) {
				r.mode = "ignore";
				return;
			}
			r.mode = "drag", r.start = p, i++, e.setAttribute("data-ds-overlay-dragging", "");
		}
		t.preventDefault();
		let h = e.getBoundingClientRect(), g = l === "y" ? h.height : h.width, _ = r.base + p - r.start;
		r.offset = _ < 0 ? di(_, g || 1) : _, s(r.offset, g, u);
		let v = t.timeStamp || (a?.performance?.now() ?? Date.now());
		for (r.samples.push({
			time: v,
			offset: r.offset
		}); r.samples.length > 2 && v - r.samples[0].time > 150;) r.samples.shift();
	}, p = (t) => {
		if (!r || [...t.touches].some((e) => e.identifier === r.id)) return;
		let i = r;
		if (r = null, i.mode !== "drag") return;
		let o = n(), { axis: s } = mi(e, o), c = e.getBoundingClientRect(), d = s === "y" ? c.height : c.width, f = t.timeStamp || (a?.performance?.now() ?? Date.now()), p = i.samples.filter((e) => f - e.time <= 100), m = p[0], h = p[p.length - 1], g = m && h ? h.time - m.time : 0, _ = m && h && g > 0 ? (h.offset - m.offset) / g * 1e3 : 0, v = i.offset + ui(_);
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
var vi = 400;
function yi(e) {
	let t = e.root.ownerDocument, n = t.createElement("dialog");
	n.className = "aa-sheet ds-overlay ds-overlay--sheet", n.setAttribute("aria-label", H(e.title)), e.nonModal && (n.style.zIndex = "var(--ds-overlay-layer, 1)");
	let r = t.createElement("div");
	r.className = "aa-sheet-head";
	let i = t.createElement("h2");
	i.className = "aa-sheet-title", i.textContent = H(e.title);
	let a = t.createElement("button");
	a.type = "button", a.className = "aa-sheet-cancel", a.textContent = H("Cancel"), r.append(i, a), n.append(r);
	let o = null;
	for (let r of e.groups) {
		if (!r.rows.length) continue;
		let e = t.createElement("div");
		if (e.className = "aa-sheet-group", e.setAttribute("role", "group"), r.label) {
			let n = t.createElement("div");
			n.className = "aa-sheet-label", n.textContent = H(r.label), e.append(n), e.setAttribute("aria-label", H(r.label));
		}
		for (let i of r.rows) {
			let r = t.createElement("button");
			r.type = "button", r.className = "aa-sheet-row", r.dataset.command = i.id;
			let a = Sr(i.icon ?? "", t), s = t.createElement("span");
			if (s.className = "aa-sheet-words", s.textContent = H(i.label), r.append(a, s), i.key) {
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
	let s = _i(n);
	n.addEventListener("close", () => {
		s();
		let t = o;
		o = null, setTimeout(() => n.remove(), vi), e.onClose?.(t), t?.run();
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
var bi = 2e3, xi = 10, Si = Symbol.for("ds-one:tooltips");
function Ci() {
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
	window[Si] = {
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
				p &&= (m = !0, c(p.target, { duration: bi }), null);
			}, 500)
		};
	}, {
		passive: !0,
		capture: !0
	}), document.addEventListener("pointermove", (e) => {
		let t = e;
		p && t.pointerId === p.id && Math.hypot(t.clientX - p.x, t.clientY - p.y) > xi && h();
	}, {
		passive: !0,
		capture: !0
	}), document.addEventListener("pointerup", (e) => {
		if (!p || e.pointerId !== p.id) return;
		let { target: t } = p;
		h(), t.hasAttribute("data-tooltip-press") && c(t, { duration: bi });
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
typeof document < "u" && (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", Ci, { once: !0 }) : Ci());
//#endregion
//#region src/controls.ts
var wi = [
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
], Ti = {
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
function Ei(e, t, n, r = !1, i) {
	let a = H(e), o = document.createElement("button");
	if (o.type = "button", o.setAttribute("aria-label", a), r || (o.dataset.tooltip = i ? `${a} ${i}` : a), o.append(Sr(t)), r) {
		let e = document.createElement("span");
		e.textContent = a, o.append(e);
	}
	return o.addEventListener("pointerdown", (e) => e.preventDefault()), o.addEventListener("click", n), o;
}
var Di = class extends (typeof HTMLElement > "u" ? class {} : HTMLElement) {
	editor = null;
	actions = [];
	below = null;
	connectedCallback() {
		this.classList.add("ds-context", "ds-context--bar"), this.setAttribute("role", "toolbar"), this.setAttribute("aria-label", H("Text formatting")), this.refresh();
	}
	refresh() {
		if (this.replaceChildren(...this.actions.map((e) => {
			let t = Ei(e.label, e.icon, () => {
				this.editor && !this.editor.readOnly && e.run(this.editor);
			}, !1, e.shortcut);
			return t.classList.add("note-menu-row", "ds-context__item--icon"), t.dataset.action = e.id, t;
		})), !Ni(this.ownerDocument.defaultView)) for (let e = this.actions.length; e % 5; e++) {
			let e = document.createElement("span");
			e.className = "aa-toolbar-spacer", e.setAttribute("aria-hidden", "true"), this.append(e);
		}
		this.below && this.append(this.below);
	}
};
function Oi(e, t, n, r) {
	let i = e.createElement("button");
	return i.type = "button", i.setAttribute("role", "menuitem"), i.textContent = n, i.setAttribute("aria-label", t), i.addEventListener("pointerdown", (e) => e.preventDefault()), i.addEventListener("click", (e) => {
		e.preventDefault(), r();
	}), i;
}
function ki() {
	customElements.get("aa-toolbar") || customElements.define("aa-toolbar", Di);
}
function Ai(e) {
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
function ji(e, t) {
	let n = e.activeBlock();
	if (!n || n.block.kind === "paragraph" && !n.block.source.trim()) {
		e.turnInto(t);
		return;
	}
	let r = sr([{
		kind: "paragraph",
		source: "",
		prefix: 0
	}], {
		anchor: 0,
		focus: 0
	}, t), i = r.blocks.map((e) => e.source).join("\n\n");
	i ? (e.replace(n.end, n.end, `\n\n${i}`), e.selectRange(n.end + 2 + r.caret.offset)) : (e.selectRange(n.end), e.element.children[n.index]?.dispatchEvent(new KeyboardEvent("keydown", {
		key: "Enter",
		bubbles: !0,
		cancelable: !0
	})));
}
function Mi(e) {
	let t = e.visualViewport;
	return {
		top: t?.offsetTop ?? 0,
		left: t?.offsetLeft ?? 0,
		width: t?.width ?? e.innerWidth,
		height: t?.height ?? e.innerHeight
	};
}
var Ni = (e) => !!e.matchMedia?.("(pointer: coarse)").matches;
function Pi(e) {
	let t = getComputedStyle(e);
	return parseFloat(t.getPropertyValue("--ds-sf")) || parseFloat(t.getPropertyValue("--sf")) || 1;
}
function Fi(e, t) {
	let n = e.ownerDocument.defaultView, r = Mi(n);
	e.dataset.docked = "", e.style.left = `${r.left}px`, e.style.width = `${r.width}px`;
	let i = r.height >= n.innerHeight - 1 && parseFloat(getComputedStyle(e).getPropertyValue("--aa-safe-bottom")) || 0, a = e.getBoundingClientRect().height, o = r.top + r.height - a - i;
	t && t.bottom > o && t.top < o + a && t.top - a >= r.top && (o = t.top - a), e.style.top = `${o}px`;
}
function Ii(e, t, n, r) {
	let i = e.top - t.height;
	return {
		left: Math.max(n.left, Math.min(e.left + (e.width - t.width) / 2, n.left + n.width - t.width)),
		top: Math.max(n.top, Math.min(i >= n.top ? i : e.bottom + 0, n.top + n.height - t.height))
	};
}
var Li = si(() => import("./aa-drag.js"));
Li.get;
function Ri(e, t) {
	let n = new AbortController(), { signal: r } = n;
	ki(), Ci();
	let i = (t.atoms ?? []).map(Ai).filter((e) => !!e), a = e.element, o = a.ownerDocument, s = o.defaultView, c = () => Mi(s), l = () => Ni(s), u = o.adoptNode(globalThis.document.createElement("aa-toolbar"));
	u.className = "aa-controls aa-toolbar", u.hidden = !0, u.editor = e, u.dataset.tooltipOver = "";
	let d = null, f = null, p = () => {
		d && e.selectRange(d.start, d.end);
	}, m = (e) => wi.map((t) => ({
		id: t.kind,
		label: t.label,
		icon: t.icon,
		key: Ti[t.kind],
		run: () => {
			p(), e(t.kind);
		}
	})), h = (n, r) => {
		u.hidden = !0, yi({
			title: n,
			groups: r,
			root: C,
			nonModal: t.nonModalSheets,
			onClose: (t) => {
				if (!t) {
					let t = d?.end ?? e.selection()?.end;
					d = null, t !== void 0 && (f = {
						start: t,
						end: t
					}, e.selectRange(t)), u.hidden = !0;
				}
			}
		});
	}, g = (t) => ji(e, t), _ = (t, n, r) => ({
		id: t,
		icon: t,
		label: n,
		shortcut: r,
		run: () => {
			p(), e.format(t);
		}
	}), v = [{
		id: "color-default",
		label: "Default",
		icon: "color",
		run: () => e.color(null)
	}, ...jt.map((t) => ({
		id: `color-${t}`,
		label: t === "gray" ? "Grey" : t[0].toUpperCase() + t.slice(1),
		icon: "color",
		ink: t,
		run: () => e.color(t)
	}))], y = (e) => e === "gray" ? "Grey" : e[0].toUpperCase() + e.slice(1), b = [{
		id: "color-bg-default",
		label: "Default",
		icon: "color",
		run: () => e.background(null)
	}, ...Mt.map((t) => ({
		id: `color-bg-${t}`,
		label: t === "yellow" ? "Highlight" : y(t),
		icon: "color",
		swatch: t,
		run: () => e.background(t)
	}))];
	u.actions = [
		{
			id: "color",
			icon: "color",
			label: "Text colour",
			run: () => {
				p(), fe(v, (u.querySelector("[data-action=\"color\"]") ?? u).getBoundingClientRect());
			}
		},
		{
			id: "background",
			icon: "background",
			label: "Background colour",
			run: () => {
				p(), fe(b, (u.querySelector("[data-action=\"background\"]") ?? u).getBoundingClientRect());
			}
		},
		_("bold", "Bold", "⌘B"),
		_("italic", "Italic", "⌘I"),
		_("underline", "Underline", "⌘U"),
		_("strike", "Strikethrough", "⌘⇧S"),
		_("link", "Link", "⌘K"),
		_("code", "Code", "⌘E"),
		_("equation", "Equation"),
		...t.comments ? [{
			id: "comment",
			icon: "comment",
			label: "Comment",
			shortcut: "⌘⇧M",
			run: () => {
				p(), e.comments?.start();
			}
		}] : [],
		...(Array.isArray(t.toolbar) ? t.toolbar : []).map((t) => ({
			...t,
			run: () => {
				p(), t.run(e);
			}
		}))
	];
	let x = {
		id: "turn",
		icon: "text",
		label: "Turn into",
		run: () => {
			p(), e.activeBlock() && h("Turn into", [{ rows: m((t) => e.turnInto(t)) }]);
		}
	}, S = [
		"color",
		"bold",
		"italic",
		"underline",
		"strike",
		"link"
	];
	if (l() && (u.actions = u.actions.filter((e) => S.includes(e.id))), t.prompt) {
		let t = o.createElement("form");
		t.className = "aa-toolbar-ask";
		let n = o.createElement("textarea");
		n.rows = 1, n.placeholder = "Ask", n.setAttribute("aria-label", H("Ask AI about the selected words")), n.autocomplete = "off", t.append(n);
		let r = (e) => {
			u.toggleAttribute("data-asking", e);
			for (let t of u.querySelectorAll("button")) t.inert = e;
			e || (n.scrollTop = 0);
		};
		n.addEventListener("focus", () => r(!0)), n.addEventListener("blur", () => r(!1)), t.addEventListener("submit", (t) => {
			t.preventDefault();
			let i = n.value.trim(), a = d;
			i && a && !n.disabled && !e.readOnly && (n.disabled = !0, r(!1), e.selectRange(a.start, a.end), e.askAbout(i).then((e) => {
				n.value = e ? "" : n.value, e || (n.placeholder = H("Not answered"));
			}).catch(() => {
				n.placeholder = H("Not answered");
			}).finally(() => {
				n.disabled = !1, setTimeout(() => {
					n.placeholder = "Ask";
				}, 2e3);
			}));
		}), n.addEventListener("keydown", (e) => {
			e.isComposing || e.key === "Enter" && !e.shiftKey && (e.preventDefault(), t.requestSubmit());
		}), u.below = t;
	}
	l() && (u.actions = [
		...u.actions,
		{
			id: "insert",
			label: "Insert block",
			icon: "plus",
			run: () => {
				p(), h("Insert block", [{
					label: "Blocks",
					rows: m(g)
				}, {
					label: "More",
					rows: [...pe.filter((e) => !wi.some((t) => t.kind === e.id)), ...t.commands ?? []].map((t) => ({
						id: t.id,
						label: t.label,
						icon: t.icon,
						run: () => {
							p(), t.run(e);
						}
					}))
				}]);
			}
		},
		x,
		...t.menus === !1 ? [] : [{
			id: "block",
			label: "Block commands",
			icon: "slash",
			run: () => {
				p(), L = e.activeBlock()?.index ?? -1, me(u.querySelector("[data-action=\"block\"]")?.getBoundingClientRect());
			}
		}],
		...t.comments ? [{
			id: "comment",
			icon: "comment",
			label: "Comment",
			run: () => {
				p(), e.comments?.start();
			}
		}] : [],
		{
			id: "indent",
			label: "Indent",
			icon: "indent",
			run: () => {
				p(), e.indent(1);
			}
		},
		{
			id: "outdent",
			label: "Outdent",
			icon: "outdent",
			run: () => {
				p(), e.indent(-1);
			}
		},
		...(Array.isArray(t.toolbar) ? t.toolbar : []).map((t) => ({
			...t,
			run: () => {
				p(), t.run(e);
			}
		}))
	]), u.refresh();
	let C = a.closest("dialog") ?? a.ownerDocument.body;
	t.toolbar && C.append(u);
	let w = o.createElement("div");
	w.className = "aa-controls aa-menu", w.hidden = !0, w.setAttribute("role", "menu"), w.setAttribute("aria-label", H("Block commands"));
	let T = o.createElement("div");
	T.className = "aa-menu-list", T.setAttribute("role", "none");
	let E = Ei("Close", "close", () => ue(), !0);
	E.classList.add("note-menu-row"), E.dataset.command = "close", E.setAttribute("role", "menuitem"), E.tabIndex = -1, E.querySelector(".aa-icon")?.remove();
	let ee = o.createElement("kbd");
	ee.textContent = "esc", E.append(ee);
	let D = o.createElement("div");
	D.className = "aa-controls aa-find", D.hidden = !0, D.setAttribute("role", "search");
	let O = o.createElement("div");
	O.className = "aa-controls aa-command-preview", O.hidden = !0, O.setAttribute("aria-hidden", "true");
	let te, k, A = () => {
		k?.(), k = void 0, te = void 0, O.replaceChildren(), O.hidden = !0, O.remove();
	}, j = () => {
		if (!te?.preview || w.hidden) {
			O.hidden = !0;
			return;
		}
		let e = c(), t = 20 * Pi(a), n = w.getBoundingClientRect(), r = O.getBoundingClientRect().width || 16 * t, i = n.right + t / 2, o = n.left - t / 2 - r;
		if (i + r > e.left + e.width && o < e.left) {
			O.hidden = !0;
			return;
		}
		O.hidden = !1, O.style.left = `${i + r <= e.left + e.width ? i : o}px`;
		let s = O.getBoundingClientRect().height;
		O.style.top = `${Math.max(e.top, Math.min(Math.round(n.top / t) * t, e.top + e.height - s))}px`;
	}, ne = (e = "keyboard", t = !1) => {
		let n = R[se];
		n === te && !t ? j() : (A(), n?.preview && (te = n, O.hidden = !1, C.append(O), k = n.preview(O, { input: e }), j()));
	};
	C.append(w, D);
	let M = o.createElement("form");
	M.className = "aa-controls aa-find aa-link-editor", M.hidden = !0, M.setAttribute("aria-label", H("Edit link"));
	let N = o.createElement("input");
	N.type = "text", N.placeholder = H("Link URL"), N.setAttribute("aria-label", H("Link URL"));
	let P = o.createElement("button");
	P.type = "submit", P.textContent = H("Apply");
	let re = o.createElement("button");
	re.type = "button", re.textContent = H("Cancel"), M.append(N, P, re), C.append(M);
	let F = null, ie = () => {
		M.hidden = !0, F && e.selectRange(F.start, F.end), F = null;
	};
	M.addEventListener("submit", (t) => {
		if (t.preventDefault(), !F || e.readOnly) return;
		let n = N.value.trim().replace(/\(/g, "%28").replace(/\)/g, "%29"), r = F.text || n;
		(n || F.url) && e.replace(F.start, F.end, n ? `[${r}](${n})` : r), M.hidden = !0, F = null;
	}), re.addEventListener("click", ie), M.addEventListener("keydown", (e) => {
		e.key === "Escape" && (e.preventDefault(), ie());
	}), a.addEventListener("aa-link-request", (t) => {
		if (F = t.detail, F && !e.readOnly) {
			if (N.value = F.url, M.hidden = !1, u.hidden = !0, l()) Fi(M);
			else {
				delete M.dataset.docked, M.style.width = "";
				let e = a.getBoundingClientRect(), t = 20 * Pi(a), n = c();
				M.style.left = `${Math.max(n.left, Math.min(e.left, n.left + n.width - 16 * t))}px`, M.style.top = `${Math.max(n.top, Math.min(e.top, n.top + n.height - 3 * t))}px`;
			}
			N.focus(), N.select();
		}
	}, { signal: r });
	let ae = null, oe = () => {
		ae?.remove(), ae = null;
	}, I = (t, n) => {
		if (oe(), e.readOnly) return;
		let r = o.createElement("div");
		r.className = "aa-controls aa-menu aa-reaction-picker aa-callout-icons", r.setAttribute("role", "menu"), r.setAttribute("aria-label", H("Callout icon"));
		let i = (n) => {
			oe(), e.callout({ icon: n }, t), e.focus();
		};
		r.append(...le.map((e) => Oi(o, H("Icon {emoji}", { emoji: e }), e, () => i(e))));
		let s = Oi(o, H("No icon"), H("No icon"), () => i(null));
		s.className = "aa-callout-icons-none", r.append(s), r.addEventListener("keydown", (t) => {
			t.key === "Escape" && (t.preventDefault(), t.stopPropagation(), oe(), e.focus());
		}), C.append(r), ae = r;
		let l = 20 * Pi(a), u = c(), d = 8 * l, f = 3 * l, p = 4 * l / 20;
		r.style.left = `${Math.max(u.left, Math.min(n.left, u.left + u.width - d))}px`, r.style.top = `${n.bottom + p + f <= u.top + u.height ? n.bottom + p : Math.max(u.top, n.top - p - f)}px`, r.querySelector("button")?.focus();
	};
	a.addEventListener("aa-callout-icon", (e) => {
		let t = e.detail;
		I(t.index, t.rect);
	}, { signal: r }), o.addEventListener("pointerdown", (e) => {
		ae && !ae.contains(e.target) && oe();
	}, {
		capture: !0,
		signal: r
	});
	let L = -1, se = 0, R = [], z = null, ce, B = !1, V = (e) => {
		let t = 20 * Pi(a), n = c(), r = w.getBoundingClientRect(), i = r.height || (Math.min(R.length, 8) + 1) * t;
		for (let e of Array.from(T.querySelectorAll("button > span:not(.aa-icon)"))) e.toggleAttribute("data-cut", e.scrollWidth > e.clientWidth + 1);
		w.style.left = `${Math.max(n.left, Math.min(e.left, n.left + n.width - r.width))}px`;
		let o = e.bottom, s = e.top - i, l = o + i <= n.top + n.height;
		w.style.top = `${l || s < n.top ? Math.max(n.top, Math.min(o, n.top + n.height - i)) : s}px`;
	}, U = () => {
		clearTimeout(ce), u.contains(o.activeElement) && o.activeElement.blur(), u.hidden = !0;
		let t = e.selection();
		f = t ? { ...t } : null;
	}, ue = () => {
		w.hidden || (delete w.dataset.palette, A(), w.hidden = !0, z = null, T.replaceChildren(), w.replaceChildren(), a.removeAttribute("aria-controls"));
	}, de = (t) => {
		if (e.readOnly) return;
		let n = z;
		if (ue(), e.transaction(() => {
			n && e.replace(n.from, n.to, ""), t.run(e);
		}), l()) {
			let t = e.selection();
			t && t.start !== t.end && e.selectRange(t.end);
		}
		t.id.startsWith("color-") ? (u.hidden = !1, ge()) : U();
	}, W = () => {
		if (T.replaceChildren(...R.map((e, t) => {
			let n = Ei(e.label, e.icon, () => de(e), !("palette" in w.dataset));
			return "palette" in w.dataset && (n.classList.add("aa-colour-swatch"), n.querySelector(".aa-icon")?.removeAttribute("style")), e.ink && n.querySelector(".aa-icon")?.setAttribute("data-color", e.ink), e.swatch && n.querySelector(".aa-icon")?.setAttribute("data-fill", e.swatch), n.classList.add("note-menu-row"), n.dataset.command = e.id, n.setAttribute("role", "menuitem"), e.id === "count" && (n.lastElementChild.textContent = H(e.label).split(",")[0], n.querySelector(".aa-icon")?.remove()), n.tabIndex = t === se ? 0 : -1, n.toggleAttribute("data-current", t === se), n.addEventListener("pointerenter", () => {
				se = t, Array.from(T.children).forEach((e, t) => e.toggleAttribute("data-current", t === se)), ne("pointer", !0);
			}), n;
		})), !R.length) {
			let e = o.createElement("span");
			e.className = "aa-menu-empty", e.textContent = H("No matching commands"), T.append(e);
		}
		w.replaceChildren(T, E), ne();
		let e = T.children[se];
		e && typeof e.scrollIntoView == "function" && e.scrollIntoView({ block: "nearest" });
	};
	function fe(t, n) {
		R = t.filter((t) => t.enabled?.(e) !== !1), w.toggleAttribute("data-palette", R.length > 0 && R.every((e) => e.id.startsWith("color-"))), w.setAttribute("aria-label", H("palette" in w.dataset ? R[0].id.startsWith("color-bg") ? "Background colour" : "Text colour" : "Block commands")), se = 0, w.hidden = !1, W(), V(n), j();
	}
	let pe = [...wi.map((t) => ({
		id: t.kind,
		label: t.label,
		icon: t.icon,
		run: () => e.turnInto(t.kind)
	})), ...i];
	t.onFiles && pe.push({
		id: "image",
		label: "Image or file",
		icon: "image",
		run: () => {
			let t = o.createElement("input");
			t.type = "file", t.multiple = !0, t.addEventListener("change", () => Array.from(t.files ?? []).forEach((t) => e.insertFile(t)), { once: !0 }), t.click();
		}
	});
	let me = (n, r) => {
		if (L < 0 || t.menus === !1) return;
		let i = e.activeBlock();
		(i?.index !== L || i.block.kind !== "table" && !l()) && e.selectBlocks(L);
		let o = (r ?? a.children[L]?.querySelector(".aa-atom[data-atom=\"image\"]:has(> img):has(> .aa-caption:empty)"))?.querySelector(":scope > .aa-caption:empty"), s = [
			...o ? [{
				id: "add-caption",
				label: "Add a caption",
				icon: "text",
				run: () => ai(o)
			}] : [],
			...pe,
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
				"bold-header",
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
			...Xe.map((t) => ({
				id: `fill-${t}`,
				label: `${t === "gray" ? "Grey" : t[0].toUpperCase() + t.slice(1)} fill`,
				icon: "color",
				swatch: t,
				keywords: "callout colour background",
				enabled: (e) => e.activeBlock()?.block.kind === "callout",
				run: () => e.callout({ color: t }, L)
			})),
			...t.blockCommands ?? []
		], c = e.stats();
		s.push({
			id: "count",
			label: H("{words} words, {characters} characters", {
				words: c.words,
				characters: c.characters
			}),
			icon: "text",
			run: () => {}
		}), z = null, fe(s, n ?? (a.children[L] ?? a).getBoundingClientRect());
	}, he = () => {
		if (B || e.readOnly || t.menus === !1) {
			ue();
			return;
		}
		let n = e.activeBlock(), r = e.selection();
		if (!n || !r || r.start !== r.end || n.block.kind === "code" || n.block.kind === "table") return;
		let i = e.value.slice(n.start, r.end), o = /(?:^|\s)\/([^/\n]*)$/.exec(i);
		if (!o) {
			z && ue();
			return;
		}
		let s = o[1].toLocaleLowerCase();
		z = {
			from: r.end - o[1].length - 1,
			to: r.end
		}, fe([...pe, ...t.commands ?? []].filter((e) => `${H(e.label)} ${e.label} ${e.keywords ?? ""}`.toLocaleLowerCase().includes(s)), a.children[n.index]?.getBoundingClientRect() ?? a.getBoundingClientRect());
	}, ge = () => {
		if (!u.hidden) {
			if (l()) u.below && u.lastElementChild !== u.below && u.append(u.below), Fi(u, d ? e.rangeOf(d.start, d.end)?.getBoundingClientRect() : null);
			else {
				delete u.dataset.docked, u.style.width = "";
				let t = d ? e.rangeOf(d.start, d.end) : null, n = Array.from(t?.getClientRects?.() ?? []).filter((e) => e.width > 0 && e.height > 0), r = n[0], i = r ? n.filter((e) => Math.abs(e.top - r.top) < 2) : [], o = t?.getBoundingClientRect?.() ?? a.getBoundingClientRect(), s = i.length ? {
					left: Math.min(...i.map((e) => e.left)),
					top: Math.min(...i.map((e) => e.top)),
					width: Math.max(...i.map((e) => e.right)) - Math.min(...i.map((e) => e.left)),
					bottom: o.bottom
				} : o, l = Ii(s, u.getBoundingClientRect(), c(), Pi(a));
				if (u.below) {
					let e = s.top - u.getBoundingClientRect().height < c().top;
					e && u.firstElementChild !== u.below ? u.prepend(u.below) : !e && u.lastElementChild !== u.below && u.append(u.below);
				}
				u.style.left = `${Math.round(l.left)}px`, u.style.top = `${Math.round(l.top)}px`;
			}
		}
	}, _e = () => {
		if (clearTimeout(ce), u.contains(o.activeElement)) return;
		let n = e.selection();
		if (n && n.start === f?.start && n.end === f?.end) {
			u.hidden = !0;
			return;
		}
		f = null;
		let r = l() && a.contains(o.activeElement);
		!n || !r && n.start === n.end || e.readOnly ? u.hidden = !0 : (d = n, ce = setTimeout(() => {
			!B && t.toolbar && !e.readOnly && (u.hidden = !1, ge());
		}, 140));
	}, ve = o.createElement("input");
	ve.placeholder = H("Find"), ve.setAttribute("aria-label", H("Find"));
	let ye = o.createElement("input");
	ye.placeholder = H("Replace"), ye.setAttribute("aria-label", H("Replace"));
	let G = o.createElement("span");
	G.setAttribute("aria-live", "polite");
	let be = [], xe = -1, Se = () => {
		D.hidden || (be = e.find(ve.value), e.decorate(be.map((e) => ({
			from: e.start,
			to: e.end,
			className: "aa-find-match"
		})), "find"), G.textContent = H("{count} matches", { count: be.length }), xe = Math.min(xe, be.length - 1));
	}, Ce = (t) => {
		if (!be.length) return;
		xe = (xe + t + be.length) % be.length;
		let n = be[xe];
		e.selectRange(n.start, n.end), G.textContent = H("{number} of {count}", {
			number: xe + 1,
			count: be.length
		});
	}, we = () => {
		D.hidden = !0, e.decorate([], "find"), e.focus();
	};
	ve.addEventListener("input", Se), D.append(ve, ye, Ei("Previous match", "up", () => Ce(-1)), Ei("Next match", "down", () => Ce(1)), Ei("Replace", "text", () => {
		let t = be[xe < 0 ? 0 : xe];
		t && !e.readOnly && (e.replace(t.start, t.end, ye.value), Se());
	}), Ei("Replace all", "text", () => {
		if (!be.length || e.readOnly) return;
		let t = e.value;
		for (let e of [...be].reverse()) t = t.slice(0, e.start) + ye.value + t.slice(e.end);
		e.replace(0, e.value.length, t), Se();
	}), G, Ei("Close find", "close", we)), D.addEventListener("keydown", (e) => {
		e.key === "Escape" ? (e.preventDefault(), we()) : e.key === "Enter" && (e.preventDefault(), Ce(e.shiftKey ? -1 : 1));
	});
	let Te = () => {
		clearTimeout(ce);
		let t = o.activeElement;
		t?.nodeType === 1 && [
			u,
			w,
			M,
			D
		].some((e) => e.contains(t)) && t.blur(), ue(), u.hidden = !0, M.hidden = !0, F = null, D.hidden = !0, e.decorate([], "find"), d = null, f = null;
	}, Ee = (t) => {
		if (t.key !== "Escape" || t.isComposing || t.defaultPrevented) return;
		let n = t.target;
		n && [
			a,
			u,
			w,
			M,
			D
		].some((e) => e.contains(n)) && (u.hidden && w.hidden && M.hidden && D.hidden || (t.preventDefault(), t.stopImmediatePropagation(), e.dismiss()));
	}, K = (n) => {
		if (n.isComposing || n.defaultPrevented) return;
		let r = /Mac|iPhone|iPad/.test(navigator.platform) ? n.metaKey : n.ctrlKey;
		if (r && n.key.toLowerCase() === "f") {
			n.preventDefault(), n.stopImmediatePropagation(), D.hidden = !1;
			let e = a.getBoundingClientRect();
			D.style.left = `${Math.max(0, e.left)}px`, D.style.top = `${Math.max(0, e.top)}px`, Se(), ve.focus();
		} else r && n.key === "/" && t.menus !== !1 ? (n.preventDefault(), n.stopImmediatePropagation(), L = e.activeBlock()?.index ?? -1, me()) : w.hidden || (n.key === "Escape" ? (n.preventDefault(), n.stopImmediatePropagation(), ue()) : n.key === "ArrowDown" || n.key === "ArrowUp" ? (n.preventDefault(), n.stopImmediatePropagation(), R.length && (se = (se + (n.key === "ArrowDown" ? 1 : -1) + R.length) % R.length), W()) : n.key === "Enter" && R[se] && (n.preventDefault(), n.stopImmediatePropagation(), de(R[se])));
	};
	w.addEventListener("keydown", K);
	let De = (e) => {
		let t = e.target;
		w.contains(t) || ue(), [
			u,
			w,
			M,
			D
		].some((e) => e.contains(t)) || (U(), M.hidden = !0, F = null);
	}, Oe = () => {
		he(), Se(), e.readOnly && (u.hidden = !0, M.hidden = !0, F = null);
	}, ke = (n) => {
		let r = n.target, i = r.closest(".aa-block");
		!i || i.parentElement !== a || e.readOnly || t.menus === !1 || n.shiftKey || l() || r.closest("input, textarea, .aa-caption, [data-aa-interactive]") || (n.preventDefault(), L = Array.from(a.children).indexOf(i), me(new DOMRect(n.clientX, n.clientY, 0, 0), r.closest(".aa-atom[data-atom=\"image\"]:has(> img)") ?? void 0), clearTimeout(ce), u.hidden = !0, f = e.selection());
	}, q = (t) => {
		let n = t.target;
		if (!(n?.nodeType && w.contains(n)) && (ge(), !M.hidden && "docked" in M.dataset && Fi(M), !w.hidden)) {
			let t = e.activeBlock(), n = t ? a.children[t.index]?.getBoundingClientRect() : null;
			n && (V(n), j());
		}
	};
	a.addEventListener("pointerdown", () => {
		f = null;
	}, { signal: r }), a.addEventListener("aa-dismiss", Te, { signal: r }), a.addEventListener("aa-moved", U, { signal: r }), o.addEventListener("keydown", Ee, {
		capture: !0,
		signal: r
	}), a.addEventListener("aa-selectionchange", _e, { signal: r }), a.addEventListener("aa-change", Oe, { signal: r }), a.addEventListener("contextmenu", ke, { signal: r }), a.addEventListener("keydown", K, {
		capture: !0,
		signal: r
	}), o.addEventListener("pointerdown", De, { signal: r }), s.addEventListener("resize", q, { signal: r }), s.addEventListener("scroll", q, {
		capture: !0,
		signal: r
	}), s.visualViewport?.addEventListener("resize", q, { signal: r }), s.visualViewport?.addEventListener("scroll", q, { signal: r });
	let J = () => {}, Ae = [
		"pointerover",
		"focusin",
		"dragenter",
		"touchstart"
	], je = () => {
		if (!(B || e.readOnly || t.menus === !1 && !t.onFiles)) {
			for (let e of Ae) a.removeEventListener(e, je);
			J = Li.when(({ createDragging: n }) => n(e, t, C));
		}
	};
	for (let e of Ae) a.addEventListener(e, je, {
		passive: !0,
		signal: r
	});
	return Li.here() ? je() : (s.requestIdleCallback ?? s.setTimeout)(je), () => {
		n.abort(), A(), O.remove(), B = !0, clearTimeout(ce), J(), u.remove(), w.remove(), D.remove(), M.remove();
	};
}
//#endregion
//#region src/selection.ts
function zi(e, t, n) {
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
		return Bi(i, n);
	}).join(" ");
}
function Bi(e, t) {
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
function Vi(e) {
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
			let l = Math.min(...c.map((e) => e.left)), d = Math.min(...c.map((e) => e.top)) - s / 2, f = Math.max(...c.map((e) => e.right)) - l, p = Math.max(...c.map((e) => e.bottom)) - d + s / 2, m = parseFloat(a.getPropertyValue("--sf")) || 1, h = zi(c.map((e) => ({
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
	m.observe(e, {
		childList: !0,
		subtree: !0,
		characterData: !0
	});
	let h = new AbortController(), { signal: g } = h;
	return t.addEventListener("selectionchange", u, { signal: g }), t.addEventListener("scroll", u, {
		capture: !0,
		signal: g
	}), n.addEventListener("resize", u, { signal: g }), e.addEventListener("compositionstart", d, { signal: g }), e.addEventListener("compositionend", f, { signal: g }), e.addEventListener("load", u, {
		capture: !0,
		signal: g
	}), t.fonts?.addEventListener("loadingdone", u, { signal: g }), s.addEventListener?.("change", u, { signal: g }), () => {
		i = !0, n.cancelAnimationFrame(r), c(), p.disconnect(), m.disconnect(), h.abort();
	};
}
function Hi(e, t, n) {
	let r = new AbortController(), { signal: i } = r, a = typeof ResizeObserver > "u" ? null : new ResizeObserver(n);
	return a?.observe(t), e.addEventListener("scroll", n, {
		capture: !0,
		signal: i
	}), e.addEventListener("resize", n, { signal: i }), e.visualViewport?.addEventListener("resize", n, { signal: i }), () => {
		a?.disconnect(), r.abort();
	};
}
//#endregion
//#region src/placement.ts
function Ui(e, t, n, r = 20) {
	let i = e.findIndex((e, i) => i !== t && n.y >= e.top && n.y <= e.bottom && n.x >= e.left - r && n.x <= e.right + r), a = e[i];
	if (!a) return null;
	let o = Math.min(a.width / 5, 4 * r), s = n.x < a.left + o ? "start" : n.x > a.right - o ? "end" : null;
	return s ? {
		index: i,
		at: s,
		rect: a
	} : null;
}
function Wi(e, t, n) {
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
//#region src/span.ts
var Gi = 24, Ki = "button, input, textarea, select, video, audio, .aa-caption, [data-aa-interactive]", qi = (e) => e.hasAttribute("data-aa-across");
function Ji(e) {
	if (qi(e)) {
		e.removeAttribute("data-aa-across"), e.removeAttribute("contenteditable");
		for (let t of Array.from(e.children)) t.contentEditable === "inherit" && (t.contentEditable = "true");
	}
}
function Yi(e, t, n, r) {
	if (t.setBaseAndExtent(n.node, n.offset, r.node, r.offset), (t.focusNode !== r.node || t.anchorNode !== n.node) && n.node.isConnected && r.node.isConnected) {
		e.setAttribute("data-aa-across", ""), e.contentEditable = "true";
		for (let t of Array.from(e.children)) t.contentEditable === "true" && (t.contentEditable = "inherit");
		e.focus({ preventScroll: !0 }), t.setBaseAndExtent(n.node, n.offset, r.node, r.offset);
	}
}
function Xi(e, t) {
	let n = new AbortController(), { signal: r } = n, i = e.ownerDocument, a = i.defaultView, o = () => Array.from(e.children).filter((e) => e.classList.contains("aa-block")), s = (t) => {
		let n = (t?.nodeType === 1 ? t : t?.parentElement)?.closest(".aa-block");
		return n && n.parentElement === e ? n : null;
	}, c = (e, t) => {
		let n = o();
		if (!n.length) return null;
		let r = n.map((e) => e.getBoundingClientRect()), a = r.findIndex((e) => t < e.bottom);
		a < 0 && (a = n.length - 1), a > 0 && t < r[a].top && r[a].top - t > t - r[a - 1].bottom && a--;
		let c = n[a], u = r[a];
		if (t < u.top) return {
			block: c,
			offset: 0
		};
		if (t >= u.bottom) return {
			block: c,
			offset: l(c)
		};
		let d = Wi(i, Math.min(Math.max(e, u.left + 1), u.right - 1), t);
		return !d || s(d.node) !== c ? {
			block: c,
			offset: e < u.left + u.width / 2 ? 0 : l(c)
		} : {
			block: c,
			offset: Gr(c, d.node, d.offset)
		};
	}, l = (e) => Gr(e, e, e.childNodes.length), u = (e, t) => {
		let n = s(e);
		return n && e ? {
			block: n,
			offset: Gr(n, e, t)
		} : null;
	}, d = !1, f = (t, n) => {
		let r = a.getSelection();
		if (!r || !t.block.isConnected || !n.block.isConnected) return;
		let i = Kr(t.block, t.offset), o = Kr(n.block, n.offset);
		if (r.anchorNode !== i.node || r.anchorOffset !== i.offset || r.focusNode !== o.node || r.focusOffset !== o.offset) {
			d = !0;
			try {
				Yi(e, r, i, o);
			} finally {
				d = !1;
			}
		}
	}, p = null, m = 0, h = (e) => {
		if (p = null, e.pointerType !== "mouse" || e.button !== 0 || e.altKey || e.metaKey || e.ctrlKey || t()) return;
		let n = e.target?.nodeType === 1 ? e.target : null;
		if (!s(n) || n?.closest(Ki)) return;
		let r = c(e.clientX, e.clientY);
		if (r) {
			if (e.shiftKey) {
				let t = a.getSelection(), n = t?.rangeCount ? u(t.anchorNode, t.anchorOffset) : null;
				if (!n || n.block === r.block) return;
				e.preventDefault(), p = {
					pointer: e.pointerId,
					start: n,
					words: !1,
					anchor: n,
					focus: r,
					x: e.clientX,
					y: e.clientY
				}, f(n, r);
			} else p = {
				pointer: e.pointerId,
				start: r,
				words: !1,
				anchor: null,
				focus: null,
				x: e.clientX,
				y: e.clientY
			};
		}
	}, g = () => {
		if (!p?.anchor) return;
		let e = c(p.x, p.y);
		e && (p.focus = e, f(p.anchor, e));
	}, _ = (t) => {
		if (p && t.pointerId === p.pointer) {
			if (!(t.buttons & 1) || e.hasAttribute("data-dragging")) C();
			else {
				if (p.x = t.clientX, p.y = t.clientY, !p.anchor) {
					let e = c(t.clientX, t.clientY);
					if (!e || e.block === p.start.block) return;
					let n = a.getSelection(), r = p.words && n?.rangeCount ? u(n.anchorNode, n.anchorOffset) : null;
					p.anchor = r?.block === p.start.block ? r : p.start;
				}
				g(), S();
			}
		}
	}, v = (e) => {
		p?.anchor && e.buttons & 1 && e.preventDefault();
	}, y = (e) => {
		p && e.detail > 1 && (p.words = !0);
	}, b = (e) => {
		p?.anchor && e.preventDefault();
	}, x = () => {
		!d && p?.anchor && p.focus && f(p.anchor, p.focus);
	}, S = () => {
		if (m || !p?.anchor) return;
		let t = p.y < Gi ? p.y - Gi : p.y > a.innerHeight - Gi ? p.y - (a.innerHeight - Gi) : 0;
		t && (m = requestAnimationFrame(() => {
			m = 0, p?.anchor && (Zi(e).scrollBy(0, Math.sign(t) * Math.min(Math.abs(t), Gi)), g(), S());
		}));
	}, C = () => {
		p = null, m && cancelAnimationFrame(m), m = 0;
	}, w = (e) => {
		p && e.pointerId === p.pointer && C();
	};
	return a.addEventListener("pointerdown", h, {
		capture: !0,
		signal: r
	}), a.addEventListener("pointermove", _, {
		capture: !0,
		signal: r
	}), a.addEventListener("pointerup", w, {
		capture: !0,
		signal: r
	}), a.addEventListener("pointercancel", w, {
		capture: !0,
		signal: r
	}), a.addEventListener("mousemove", v, {
		capture: !0,
		signal: r
	}), a.addEventListener("mousedown", y, {
		capture: !0,
		signal: r
	}), i.addEventListener("selectstart", b, {
		capture: !0,
		signal: r
	}), i.addEventListener("selectionchange", x, { signal: r }), () => {
		n.abort(), C();
	};
}
function Zi(e) {
	for (let t = e.parentElement; t; t = t.parentElement) {
		let e = getComputedStyle(t).overflowY;
		if ((e === "auto" || e === "scroll") && t.scrollHeight > t.clientHeight) return t;
	}
	return e.ownerDocument.defaultView;
}
//#endregion
//#region src/shimmer.ts
var Qi = 60, $i = 6;
function ea(e) {
	let t = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(e);
	if (t) return (.2126 * t[1] + .7152 * t[2] + .0722 * t[3]) / 255;
	let n = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(e);
	if (n) return .2126 * n[1] + .7152 * n[2] + .0722 * n[3];
	let r = /^ok(?:lch|lab)\(\s*([\d.]+)(%?)/.exec(e);
	if (r) return r[2] ? r[1] / 100 : +r[1];
	let i = /^(?:lch|lab)\(\s*([\d.]+)/.exec(e);
	return i ? i[1] / 100 : null;
}
function ta(e, t, n = e.closest("dialog") ?? e.ownerDocument.body) {
	let r = e.ownerDocument, i = r.defaultView;
	if (!i || !t.length || !e.isConnected || i.matchMedia?.("(forced-colors: active)").matches) return () => {};
	let a = i.getComputedStyle(e), o = ["--aa-shimmer", "--aa-accent"].map((e) => a.getPropertyValue(e).trim()).find(Boolean), s = ea(a.color), c = s === null ? !!i.matchMedia?.("(prefers-color-scheme: dark)").matches : s > .5, l = [];
	if (t.forEach(([t, n], i) => {
		let a = r.createRange();
		try {
			let r = Kr(e, t), i = Kr(e, n);
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
				animationDelay: `${Math.min(i, $i) * Qi}ms`
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
var na = "⟦here⟧";
function ra(e, t) {
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
//#region src/aa.css?inline
var ia = "[data-ds-shape=square],:host([data-ds-shape=square]){--ds-corner-size:0px;--ds-corner-shape:round;--ds-button-inset:.5px}[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:4px;--ds-corner-shape:round;--ds-button-inset:2.5px}[data-ds-shape=circular],:host([data-ds-shape=circular]){--ds-corner-size:999px;--ds-corner-shape:round;--ds-button-inset:5px}@supports (corner-shape:squircle){[data-ds-shape=rounded],:host([data-ds-shape=rounded]){--ds-corner-size:8px;--ds-corner-shape:squircle}}:root,:host,:where([data-ds-surface]){--ds-unit:calc(var(--ds-1,20px) * var(--ds-sf,1));--ds-control-height:calc(var(--ds-control-size,var(--ds-08,16px)) * var(--ds-sf,1));--ds-row-height:calc(var(--ds-row-size,var(--ds-1,20px)) * var(--ds-sf,1));--ds-type-size-default:calc(var(--ds-text-size,14px) * var(--ds-sf,1));--ds-type-size-small:calc(var(--ds-small-text-size,10px) * var(--ds-sf,1));--ds-type-size-heading:calc(var(--ds-heading-text-size,13px) * var(--ds-sf,1));--ds-type-size-display:calc(var(--ds-display-text-size,20px) * var(--ds-sf,1));--ds-type-lineheight-default:calc(var(--ds-text-leading,16px) * var(--ds-sf,1));--ds-type-letterspacing-default:calc(var(--ds-text-tracking,-.3px) * var(--ds-sf,1));--ds-radius:calc(var(--ds-corner-size,4px) * var(--ds-sf,1));--ds-radius-card:calc(var(--ds-card-corner-size,4px) * var(--ds-sf,1))}.ds-context{--ds-context-row:calc(var(--ds-row-height) - 1px);--ds-context-fill:light-dark(var(--ds-black,#2a2a2a),var(--ds-slate,#1e1e1e));--ds-context-ink:var(--ds-white,#fff);--ds-context-hover:color-mix(in srgb, var(--ds-context-fill) 78%, var(--ds-context-ink));--ds-context-danger:var(--ds-tuned-red,#ff5f5f);--ds-context-refused:var(--ds-tuned-red,#ff5f5f);box-sizing:border-box;width:var(--ds-menu-width,max-content);min-width:calc(4 * var(--ds-unit));max-height:var(--ds-menu-max-height,calc(16 * var(--ds-unit)));box-shadow:none;clip-path:inset(0 round var(--ds-context-radius,var(--ds-radius,4px)));color:var(--ds-context-ink);font-family:\"Inter Arrows\", var(--ds-typeface-regular);font-feature-settings:var(--ds-font-features);font-size:var(--ds-type-size-default);font-weight:var(--ds-type-weight-default);line-height:var(--ds-type-lineheight-default);letter-spacing:var(--ds-type-letterspacing-default);background:0 0;border:0;flex-direction:column;gap:1px;margin:0;padding:0;list-style:none;display:flex;overflow-y:auto}.ds-context>[role=group]{display:contents}.ds-context :is(.ds-context__item,:is(.ds-context,.ds-context>[role=group])>:is(button,a,li,[role^=menuitem]):not(.ds-context__label,.ds-context__separator,[role=separator])){gap:calc(4px * var(--ds-sf,1));width:100%;font:inherit;letter-spacing:inherit;text-align:start;white-space:nowrap;cursor:pointer;appearance:none;-webkit-tap-highlight-color:transparent;outline:none;text-decoration:none;box-sizing:border-box!important;height:var(--ds-context-row)!important;min-height:var(--ds-context-row)!important;max-height:var(--ds-context-row)!important;padding:0 calc(4px * var(--ds-sf,1))!important;background:var(--ds-context-fill)!important;color:var(--ds-context-ink)!important;line-height:var(--ds-type-lineheight-default)!important;border:0!important;border-radius:0!important;flex:none!important;justify-content:space-between!important;align-items:flex-end!important;margin:0!important;display:flex!important}.ds-context :is(.ds-context__item,:is(.ds-context,.ds-context>[role=group])>:is(button,a,li,[role^=menuitem])):is(:hover,:focus-visible,[data-highlighted]):not(:disabled,[aria-disabled=true],[data-disabled]){background:var(--ds-context-hover)!important}.ds-context :is(.ds-context__item,:is(.ds-context,.ds-context>[role=group])>:is(button,a,li,[role^=menuitem])):focus-visible{box-shadow:inset 0 0 0 2px var(--ds-focus-ring,#594dff)}.ds-context :is(.ds-context__item,:is(.ds-context,.ds-context>[role=group])>:is(button,a,li,[role^=menuitem])):is(:disabled,[aria-disabled=true],[data-disabled]){cursor:default;opacity:.5}.ds-context[aria-busy=true]>*{cursor:wait!important}.ds-context :is(.ds-context__item,:is(.ds-context,.ds-context>[role=group])>:is(button,a,li,[role^=menuitem])):is(.ds-context__item--danger,[data-danger],[data-variant=destructive]){color:var(--ds-context-danger)!important}.ds-context :is(.ds-context__item,:is(.ds-context,.ds-context>[role=group])>:is(button,a,li,[role^=menuitem]))[data-ds-refused]{background:var(--ds-context-refused)!important}.ds-context>:is(hr,.ds-context__separator,[role=separator]){background:0 0!important;border:0!important;flex:0 0 0!important;height:0!important;margin:0!important;padding:0!important}.ds-context>:is(hr,.ds-context__separator,[role=separator]):is(:first-child,:last-child),.ds-context>:is(hr,.ds-context__separator,[role=separator])+:is(hr,.ds-context__separator,[role=separator]){display:none!important}.ds-context :is(.ds-context__label,[data-ds-menu-label]){box-sizing:border-box;height:var(--ds-context-row);padding:calc(var(--ds-context-row) - var(--ds-type-lineheight-default)) calc(4px * var(--ds-sf,1)) 0;background:var(--ds-context-fill);color:color-mix(in srgb, var(--ds-context-ink) 60%, var(--ds-context-fill));line-height:var(--ds-type-lineheight-default);white-space:nowrap}.ds-context__shortcut{color:color-mix(in srgb, var(--ds-context-ink) 60%, var(--ds-context-fill));margin-left:auto}.ds-context.ds-context--bar{width:var(--ds-menu-width,max-content);min-width:0;height:var(--ds-context-row);scrollbar-width:none;flex-direction:row;max-height:none;overflow:auto hidden}.ds-context.ds-context--bar :is(.ds-context__item,:is(.ds-context,.ds-context>[role=group])>:is(button,a,li,[role^=menuitem])){width:auto;min-width:var(--ds-context-row)}.ds-context.ds-context--bar :is(.ds-context__item,:is(.ds-context,.ds-context>[role=group])>:is(button,a,li,[role^=menuitem])):is(.ds-context__item--icon,[data-ds-context-icon]){width:var(--ds-context-row);justify-content:center!important;align-items:center!important;padding:0!important}.ds-context.ds-context--bar>:is(hr,.ds-context__separator,[role=separator]){width:0!important;height:auto!important}:where(:root){--aa-accent:var(--ds-sharp-blue,#594dff);--aa-on-accent:#fff}@font-face{font-family:Inter Arrows;src:url(data:font/woff2;base64,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)format(\"woff2\");unicode-range:U+2190-21FF,U+27F?,U+2900-297F,U+2B??;font-weight:100 900;font-style:normal;font-display:swap}@font-face{font-family:Aa Mono;src:url(data:font/woff2;base64,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)format(\"woff2\");font-weight:400;font-style:normal;font-display:swap}:root{--aa-sheet:1}:where(.aa,aa-editor){--aa-sf:var(--ds-sf,var(--sf,1));--aa-unit:var(--ds-unit,var(--1,calc(20px * var(--sf,1))));--aa-rule-color:var(--aa-rule,var(--ds-border-color,light-dark(#d8d8d8,#3d3d3d)));font-family:\"Inter Arrows\", var(--aa-typeface,var(--ds-typeface-regular,var(--typeface-regular,system-ui))), system-ui, sans-serif;font-feature-settings:var(--aa-font-features,var(--ds-font-features,normal));font-size:var(--aa-size,var(--ds-type-size-default,calc(14px * var(--aa-sf))));line-height:var(--aa-line,var(--aa-unit));font-weight:var(--aa-weight,var(--ds-type-weight-default,400));letter-spacing:var(--aa-letterspacing,var(--ds-type-letterspacing-default,calc(-.3px * var(--aa-sf))));color:var(--aa-color,var(--ds-text-color,currentColor));-webkit-font-smoothing:antialiased;touch-action:manipulation;-webkit-tap-highlight-color:transparent;display:block}.aa-block{white-space:pre-wrap;overflow-wrap:anywhere;-webkit-user-modify:read-write-plaintext-only;outline:none;min-height:1lh;margin:0;position:relative}.aa-block:not(:first-child){margin-top:var(--aa-gap,var(--aa-unit))}.aa-block[data-kind=heading]:where(:not(:first-child,[data-after=heading])){margin-top:var(--aa-heading-gap,calc(2 * var(--aa-gap,var(--aa-unit))))}.aa-block[data-selected],.aa-block[data-lifted]{background:var(--aa-selection,var(--aa-text-selection,color-mix(in srgb, currentColor 15%, transparent)));border-radius:calc(2px * var(--aa-sf))}.aa[data-movable]>.aa-block[data-selected]{cursor:grab}.aa[data-dragging],.aa[data-dragging] *,.aa[data-dragging] :before{cursor:grabbing;-webkit-user-select:none;user-select:none}.aa-block[data-ghost]{opacity:.4}.aa-block[data-aa-selection]{isolation:isolate}.aa-block[data-aa-selection]:after{content:\"\";inset:var(--aa-selection-box);width:var(--aa-selection-width);height:var(--aa-selection-height);pointer-events:none;z-index:-1;background:var(--aa-text-selection,color-mix(in srgb, currentColor 15%, transparent));mask:var(--aa-selection-mask) 0 0 / 100% 100% no-repeat;position:absolute}.aa-block[data-aa-selection]::selection,.aa-block[data-aa-selection] ::selection{color:inherit;background:0 0}.aa-block[data-selected][data-aa-selection]:after,.aa-block[data-lifted][data-aa-selection]:after{display:none}@media (forced-colors:active){.aa-block[data-aa-selection]:after{display:none}.aa-block[data-aa-selection]::selection,.aa-block[data-aa-selection] ::selection{color:highlighttext;background:highlight}}.aa-block[data-kind=bullet][data-after=bullet]{margin-top:0}.aa-syntax{display:none}.aa[data-aa-across]{outline:none}.aa-b{font-family:\"Inter Arrows\", var(--aa-typeface-bold,var(--ds-typeface-medium,var(--typeface-medium,var(--aa-typeface,var(--typeface-regular,system-ui))))), system-ui, sans-serif;font-weight:var(--aa-weight-bold,var(--ds-type-weight-bold,500))}.aa-i{font-style:italic}.aa-s{text-decoration:line-through}.aa-u{text-underline-offset:.15em;text-decoration-line:underline}.aa-s.aa-u{text-decoration-line:underline line-through}[data-color=gray]{color:var(--aa-color-gray,light-dark(#737373,#a3a3a3))}[data-color=red]{color:var(--aa-color-red,var(--ds-danger-color,light-dark(#de0331,#ff5f5f)))}[data-color=orange]{color:var(--aa-color-orange,var(--ds-warning-color,light-dark(#4c3f1a,#fec20d)))}[data-color=green]{color:var(--aa-color-green,light-dark(#026d5b,#99ff73))}[data-color=blue]{color:var(--aa-color-blue,light-dark(#006de8,#69d8fb))}[data-color=purple]{color:var(--aa-color-purple,light-dark(#b92f8d,#f5aad1))}.aa-c,.aa-block[data-kind=code]{font-family:\"Inter Arrows\", var(--aa-typeface-mono,var(--typeface-mono,\"Aa Mono\")), \"Aa Mono\", ui-monospace, \"SF Mono\", Menlo, monospace;font-size:var(--aa-code-size,calc(var(--ds-code-text-size,13px) * var(--aa-sf)));font-variant-ligatures:none;letter-spacing:0}.aa-c{padding:0 calc(4px * var(--aa-sf));border-radius:var(--ds-radius,calc(4px * var(--aa-sf)));background:var(--aa-code-fill,var(--ds-fill,light-dark(#e6e6e6,#3c3c3c)))}a.aa-link:not([data-color]){color:var(--aa-link,currentColor)}.aa-link-fade{mask-image:linear-gradient(90deg,#000,#0000)}a.aa-link{text-underline-offset:calc(3px * var(--aa-sf));cursor:text;text-decoration-line:underline;text-decoration-thickness:1px}.aa-block[data-kind=heading]{font-family:\"Inter Arrows\", var(--aa-typeface-heading,var(--ds-typeface-medium,var(--typeface-medium,var(--aa-typeface,var(--typeface-regular,system-ui))))), system-ui, sans-serif;font-weight:var(--aa-weight-heading,var(--ds-type-weight-bold,500))}.aa-block[data-kind=heading][data-level=\"1\"]{font-size:var(--aa-h1,var(--ds-type-size-display,calc(20px * var(--aa-sf))));line-height:calc(2 * var(--aa-unit));letter-spacing:calc(var(--ds-display-text-tracking,-.4px) * var(--aa-sf))}.aa-block[data-kind=heading][data-level=\"2\"]{font-size:var(--aa-h2,calc(var(--ds-prose-h2-size,17px) * var(--aa-sf)));letter-spacing:calc(var(--ds-prose-h2-tracking,-.34px) * var(--aa-sf))}.aa-block[data-kind=heading][data-level=\"3\"]{font-size:var(--aa-h3,calc(var(--ds-prose-h3-size,15px) * var(--aa-sf)))}.aa-block[data-kind=quote]{padding-left:var(--aa-unit);box-shadow:inset 1px 0 var(--aa-quote-rule,var(--ds-text-color-muted,light-dark(#5f5f5f,#cacaca)))}.aa-block[data-kind=code]>.aa-syntax:first-child+br{display:none}.aa-block[data-kind=code] .aa-c{background:0 0;border-radius:0;padding:0}.aa-block[data-kind=code]:not([data-drawn]):before{content:\"\";width:calc(16px * var(--aa-sf));height:calc(16px * var(--aa-sf));opacity:.6;cursor:pointer;pointer-events:auto;-webkit-mask:var(--aa-copy-icon) center / contain no-repeat;mask:var(--aa-copy-icon) center / contain no-repeat;background:currentColor;position:absolute;inset-block-start:calc((var(--aa-unit) - 16px * var(--aa-sf)) / 2);inset-inline-end:calc((var(--aa-unit) - 16px * var(--aa-sf)) / 2)}.aa-block[data-kind=code][data-copied]:not([data-drawn]):before{opacity:1;-webkit-mask-image:var(--aa-copied-icon);mask-image:var(--aa-copied-icon)}@media (hover:hover){.aa-block[data-kind=code]:not([data-drawn]):hover:before{opacity:1}}.aa-block[data-kind=code]{padding:var(--aa-unit);border-radius:var(--ds-radius,calc(4px * var(--aa-sf)));box-shadow:inset 0 0 0 1px var(--aa-rule-color);background:var(--aa-code-paper,transparent);position:relative}.aa-block[data-kind=bullet]{padding-left:var(--aa-indent,var(--aa-unit))}.aa-block[data-kind=bullet]:before{content:\"\";width:var(--aa-indent,var(--aa-unit));height:1lh;color:var(--aa-marker,currentColor);pointer-events:none;justify-content:center;align-items:center;display:flex;position:absolute;top:0;left:0}.aa-block[data-kind=bullet]:not([data-checked]):before{content:\"•\"}.aa-block[data-kind=bullet][data-checked]:before{content:\"\";width:calc(16px * var(--aa-sf));height:calc(16px * var(--aa-sf));margin-top:calc((var(--aa-unit) - 16px * var(--aa-sf)) / 2);box-sizing:border-box;border:1px solid var(--aa-rule-color);border-radius:var(--ds-radius,calc(4px * var(--aa-sf)));background:var(--ds-input-background,light-dark(#e8e8e8,#303030));pointer-events:auto;cursor:pointer}.aa-block[data-kind=bullet][data-checked=true]:before{background:var(--aa-accent) url(data:image/svg+xml,%3Csvg%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6.68649%2011.884L12.443%206.13601L11.736%205.42715L6.68835%2010.4827L4.26399%208.0501L3.55696%208.74525L6.68649%2011.884Z%22%20fill%3D%22%23ffffff%22%2F%3E%3C%2Fsvg%3E) center / 100% no-repeat;border-color:#0000}.aa-block[data-kind=bullet][data-checked=true]{color:var(--aa-done,var(--ds-text-color-muted,color-mix(in srgb, currentColor 55%, transparent)))}.aa-block[data-kind=divider]:not(:first-child){margin-top:0}.aa-block[data-kind=divider]{min-height:1lh}.aa-block[data-kind=divider]:before{content:\"\";background:var(--aa-rule-color);height:1px;position:absolute;top:100%;left:0;right:0}.aa-block[data-placeholder]:before{content:attr(data-placeholder)}.aa[data-block-hints] .aa-block[data-kind=heading][data-empty]:before{content:var(--aa-heading-word,\"Heading\") \" \" attr(data-level)}.aa-block[data-hint]:after{content:attr(data-hint);color:var(--aa-placeholder,var(--ds-input-placeholder-color,light-dark(#797979,#ababab)));pointer-events:none}.aa-block[data-kind=bullet][data-hint]:has(>br[data-filler]):after{inset-inline-start:var(--aa-indent,var(--aa-unit));inset-inline-end:0;position:absolute;top:0}.aa-block[data-placeholder]:before,.aa[data-block-hints] .aa-block[data-kind=heading][data-empty]:before{color:var(--aa-placeholder,var(--ds-input-placeholder-color,light-dark(#797979,#ababab)));pointer-events:none;white-space:nowrap;position:absolute;top:0;left:0}.aa-atom{-webkit-user-modify:read-only;cursor:default}.aa-atom[data-atom=person]{color:var(--aa-person,var(--aa-accent));font-weight:var(--ds-type-weight-medium,500);white-space:nowrap}.aa-atom[data-atom=image]{vertical-align:top;max-width:100%;display:inline-block;position:relative}.aa-atom[data-atom=image] img{border-radius:var(--aa-picture-radius,var(--ds-radius,calc(4px * var(--aa-sf))));max-width:100%;height:auto;display:block}.aa-atom[data-atom=image]:not([data-width]){max-width:min(100%, calc(var(--aa-picture-default,16) * var(--aa-unit)))}.aa-atom[data-atom=image][data-width]{width:calc(var(--aa-picture-width) * var(--aa-unit))}.aa-atom[data-atom=image][data-settling]{transition:width .14s cubic-bezier(.2,1,.1,1)}@media (prefers-reduced-motion:reduce){.aa-atom[data-atom=image][data-settling]{transition:none}}.aa-atom[data-atom=image][data-width] img{width:100%}.aa-atom[data-atom=image][data-fitted]{width:calc(var(--aa-picture-across) * var(--aa-unit));max-width:none}.aa-atom[data-atom=image][data-fitted] img{width:100%;height:calc(var(--aa-picture-down) * var(--aa-unit));object-fit:cover}.aa-atom[data-atom=image][data-settling] img{transition:height .14s cubic-bezier(.2,1,.1,1)}@media (prefers-reduced-motion:reduce){.aa-atom[data-atom=image][data-settling] img{transition:none}}.aa-atom[data-atom=image][data-linked] img{outline:calc(2px * var(--aa-sf)) solid var(--aa-accent);outline-offset:calc(2px * var(--aa-sf))}.aa-atom[data-atom=image][data-linked] .aa-picture-grip{opacity:1}.aa-picture-grip{top:50%;width:calc(4px * var(--aa-sf));height:min(40%, calc(2 * var(--aa-unit)));border-radius:calc(2px * var(--aa-sf));cursor:ew-resize;opacity:0;touch-action:none;background:#0000008c;transition:opacity .12s ease-out;position:absolute;inset-inline-end:calc(6px * var(--aa-sf));transform:translateY(-50%);box-shadow:0 0 0 1px #fffc}.aa-atom[data-atom=image]:hover .aa-picture-grip,.aa-atom[data-atom=image][data-sizing] .aa-picture-grip{opacity:1}.aa-block[data-readonly=true] .aa-picture-grip{display:none}@media (hover:none){.aa-picture-grip{display:none}}@media (prefers-reduced-motion:reduce){.aa-picture-grip{transition:none}}.aa-controls{--aa-sf:var(--ds-sf,var(--sf,1));--aa-square:var(--ds-unit,var(--1,calc(20px * var(--sf,1))));--aa-menu-fill:light-dark(var(--ds-black,#2a2a2a),var(--ds-slate,#1e1e1e));--aa-menu-ink:var(--ds-white,#fff);--aa-menu-hover:color-mix(in srgb, var(--aa-menu-fill) 78%, var(--aa-menu-ink));z-index:var(--aa-controls-layer,1000);-webkit-tap-highlight-color:transparent;font:var(--ds-type-weight-default,400) var(--ds-type-size-default,calc(14px * var(--aa-sf)))/var(--aa-square) \"Inter Arrows\", var(--ds-typeface-regular,var(--typeface-regular,system-ui)), system-ui, sans-serif;font-feature-settings:var(--ds-font-features,normal);letter-spacing:var(--ds-type-letterspacing-default,calc(-.3px * var(--aa-sf)));position:fixed}.aa-controls[hidden],.aa-drop-line[hidden]{display:none}.aa-controls button{box-sizing:border-box;height:var(--aa-square);min-width:var(--aa-square);color:inherit;font:inherit;cursor:pointer;background:0 0;border:0;border-radius:0;flex-shrink:0;justify-content:center;align-items:center;margin:0;padding:0;display:inline-flex}.aa-controls button[data-current]{background:var(--aa-accent);color:var(--aa-on-accent)}@media (hover:hover){.aa-controls button:hover{background:var(--aa-accent);color:var(--aa-on-accent)}}.aa-controls button:focus-visible{outline:2px solid var(--ds-focus-ring,currentColor);outline-offset:-2px}.aa-icon{width:calc(16px * var(--aa-sf,var(--sf,1)));height:calc(16px * var(--aa-sf,var(--sf,1)));background:currentColor;flex-shrink:0;display:inline-block;mask-position:50%;mask-size:contain;mask-repeat:no-repeat}.aa-toolbar{max-width:100vw}.aa-toolbar.aa-controls:not([data-docked]){width:calc(5 * var(--aa-square) - 1px);flex-wrap:wrap;height:auto;max-height:none}.aa-toolbar.aa-controls:has(.aa-toolbar-ask){flex-wrap:wrap;height:auto;max-height:none}.aa-toolbar-ask{contain:inline-size;box-sizing:border-box;height:var(--ds-context-row,calc(var(--aa-square) - 1px));background:var(--aa-menu-fill);flex:1 0 100%;margin:0;display:flex}.aa-toolbar-ask textarea{box-sizing:border-box;width:100%;min-width:0;height:100%;padding:calc(3px * var(--aa-sf)) calc(4px * var(--aa-sf)) 0;color:var(--aa-menu-ink);font:inherit;line-height:calc(16px * var(--aa-sf));letter-spacing:inherit;resize:none;background:0 0;border:0;border-radius:0;outline:none}.aa-toolbar-ask textarea::placeholder{color:color-mix(in srgb, var(--aa-menu-ink) 60%, var(--aa-menu-fill))}.aa-toolbar-ask textarea:focus-visible{box-shadow:inset 0 0 0 2px var(--ds-focus-ring,#594dff)}.aa-toolbar.aa-controls:has(.aa-toolbar-ask){overflow:hidden}.aa-toolbar-ask:before,.aa-toolbar-ask textarea{width:100%;height:100%;transform:translateY(calc(100% - var(--ds-context-row,calc(var(--aa-square) - 1px))));transition:transform .18s cubic-bezier(.23,1,.32,1);position:absolute;inset:0}.aa-toolbar-ask:before{content:\"\";z-index:1;background:var(--aa-menu-fill);pointer-events:none}.aa-toolbar-ask textarea{z-index:2}.aa-toolbar-ask:first-child:before{transform:translateY(calc(-100% + var(--ds-context-row,calc(var(--aa-square) - 1px))))}.aa-toolbar-ask:first-child textarea{height:var(--ds-context-row,calc(var(--aa-square) - 1px));transform:none}.aa-toolbar[data-asking] .aa-toolbar-ask:first-child textarea{height:100%}.aa-toolbar[data-asking] .aa-toolbar-ask:before,.aa-toolbar[data-asking] .aa-toolbar-ask textarea{transform:translateY(0)}.aa-toolbar[data-asking] .aa-toolbar-ask textarea{padding-top:calc(3px * var(--aa-sf));line-height:var(--aa-square)}@media (prefers-reduced-motion:reduce){.aa-toolbar-ask:before,.aa-toolbar-ask textarea{transition:none}}.aa-controls[data-docked]{--aa-safe-bottom:env(safe-area-inset-bottom,0px);max-width:none}.ds-context.ds-context--bar.aa-toolbar[data-docked]{grid-template-columns:repeat(6,minmax(0,1fr));height:auto;max-height:none;display:grid;overflow:hidden}.ds-context.ds-context--bar.aa-toolbar.aa-controls[data-docked]>button.note-menu-row.ds-context__item--icon{width:auto;min-width:0}.aa-toolbar[data-docked]>.aa-toolbar-ask{grid-column:1/-1}.aa-find[data-docked]{border-width:1px 0 0}.aa-menu{width:calc(4 * var(--aa-square));border-radius:var(--aa-menu-radius,var(--ds-radius,calc(4px * var(--aa-sf))));max-width:100vw;clip-path:inset(0 round var(--aa-menu-radius,var(--ds-radius,calc(4px * var(--aa-sf)))));color:var(--aa-menu-ink);line-height:calc(16px * var(--aa-sf));background:0 0;border:0;flex-direction:column;gap:1px;display:flex;overflow:hidden}.aa-menu button{width:100%;height:calc(var(--aa-square) - 1px);text-align:start;justify-content:space-between;align-items:flex-end;gap:calc(4px * var(--aa-sf));padding:0 calc(4px * var(--aa-sf));white-space:nowrap;background:var(--aa-menu-fill);color:var(--aa-menu-ink);display:flex}.aa-menu button[data-current],.aa-menu button:focus-visible{background:var(--aa-menu-hover);color:var(--aa-menu-ink)}@media (hover:hover){.aa-menu button:hover{background:var(--aa-menu-hover);color:var(--aa-menu-ink)}}.aa-menu button:focus-visible{box-shadow:inset 0 0 0 2px var(--ds-focus-ring,currentColor);outline:0}.aa-menu-list{max-height:calc(8 * var(--aa-square));overscroll-behavior:contain;scrollbar-width:none;flex-direction:column;gap:1px;display:flex;overflow-y:auto}.aa-menu-list::-webkit-scrollbar{display:none}.aa-menu button[data-command=close] kbd{font:inherit;color:color-mix(in srgb, var(--aa-menu-ink) 60%, var(--aa-menu-fill));order:2}.aa-menu button[data-command=count]{font-size:var(--ds-type-size-small,calc(10px * var(--aa-sf)))}.aa-menu button .aa-icon{order:2}.aa-menu button>span:not(.aa-icon){flex:1;order:1;min-width:0;overflow:hidden}.aa-menu button>span:not(.aa-icon)[data-cut]{mask-image:linear-gradient(to right, black calc(100% - var(--aa-square)), transparent 100%)}.aa-menu button>span.aa-avatar{flex:none;order:0}.aa-menu-empty{height:calc(var(--aa-square) - 1px);padding:calc(3px * var(--aa-sf)) calc(4px * var(--aa-sf)) 0;box-sizing:border-box;background:var(--aa-menu-fill);display:block}dialog.aa-sheet{--aa-sf:var(--ds-sf,var(--sf,1));--aa-square:var(--ds-unit,var(--1,calc(20px * var(--sf,1))));box-sizing:border-box;width:100%;height:fit-content;max-height:calc(100dvh - 2 * var(--aa-square));padding:var(--aa-square);border:1px solid var(--ds-border-color,light-dark(#d8d8d8,#3d3d3d));box-shadow:none;background:var(--ds-overlay-paper,var(--ds-paper,var(--background,Canvas)));color:var(--ds-text-color,var(--text-color,CanvasText));overscroll-behavior:contain;font:var(--ds-type-weight-default,400) var(--ds-type-size-default,calc(14px * var(--aa-sf)))/calc(16px * var(--aa-sf)) \"Inter Arrows\", var(--ds-typeface-regular,var(--typeface-regular,system-ui)), system-ui, sans-serif;font-feature-settings:var(--ds-font-features,normal);letter-spacing:var(--ds-type-letterspacing-default,calc(-.3px * var(--aa-sf)));-webkit-tap-highlight-color:transparent;border-radius:0;margin:auto;position:fixed;inset:0;overflow:auto}dialog.aa-sheet[open]{gap:var(--aa-square);flex-direction:column;display:flex}dialog.aa-sheet:focus{outline:none}dialog.aa-sheet::backdrop{background:color-mix(in srgb, var(--ds-black,#2a2a2a) 40%, transparent)}.aa-sheet-head{height:var(--aa-square);line-height:calc(16px * var(--aa-sf));flex:none;justify-content:space-between;align-items:flex-end;display:flex}.aa-sheet-title{font:inherit;font-family:\"Inter Arrows\", var(--ds-typeface-medium,var(--typeface-medium,inherit)), system-ui, sans-serif;font-weight:var(--ds-type-weight-bold,500);margin:0}.aa-sheet-cancel{color:inherit;font:inherit;line-height:inherit;cursor:pointer;background:0 0;border:0;margin:0;padding:0}.aa-sheet-group{flex-direction:column;flex:none;display:flex}.aa-sheet-label{box-sizing:border-box;height:var(--aa-square);padding-top:calc(4px * var(--aa-sf));line-height:calc(16px * var(--aa-sf));color:var(--ds-text-color-muted,GrayText)}.aa-sheet-row{width:100%;height:var(--aa-square);border-radius:calc(2px * var(--aa-sf));color:inherit;font:inherit;line-height:calc(16px * var(--aa-sf));text-align:start;cursor:pointer;background:0 0;border:0;align-items:flex-end;margin:0;padding:0;display:flex}.aa-sheet-row:active{background:var(--ds-row-fill-press,var(--ds-fill,light-dark(#e6e6e6,#3c3c3c)))}.aa-sheet-row:focus-visible{outline:2px solid var(--ds-focus-ring,currentColor);outline-offset:-2px}.aa-sheet-row>.aa-icon{margin-right:calc(var(--aa-square) - 16px * var(--aa-sf))}.aa-sheet-words{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;overflow:hidden}.aa-sheet-key{color:var(--ds-text-color-muted,GrayText);font-family:\"Inter Arrows\", var(--aa-typeface-mono,var(--typeface-mono,\"Aa Mono\")), \"Aa Mono\", ui-monospace, monospace;font-size:calc(var(--ds-code-text-size,13px) * var(--aa-sf));letter-spacing:0}.aa-drop-line{z-index:1000;height:calc(2px * var(--aa-sf,1));margin-top:calc(-1px * var(--aa-sf,1));background:var(--aa-accent);pointer-events:none;position:fixed}.aa-find{width:calc(16 * var(--aa-square));max-width:calc(100vw - 2 * var(--aa-square) - 2px);border:1px solid var(--aa-rule,var(--ds-border-color,currentColor));color:var(--ds-text-color,var(--text-color,CanvasText));background:var(--ds-paper,var(--background,Canvas));flex-wrap:wrap;display:flex}.aa-find input{box-sizing:border-box;font:inherit;color:inherit;width:50%;min-width:0;height:var(--aa-square);padding:0 calc(4px * var(--aa-sf));border:0;border-right:1px solid var(--ds-border-color,currentColor);background:0 0;border-radius:0}.aa-find span[aria-live]{padding-inline:calc(4px * var(--aa-sf));white-space:nowrap}.aa-bg{background:var(--aa-callout-fill)}.aa-menu [data-command=color-bg-yellow] .aa-icon[data-fill]{background:var(--aa-highlight,var(--ds-yellow,var(--yellow,Highlight)))}.aa-find-match,.aa-highlight{background:var(--aa-highlight,var(--ds-yellow,var(--yellow,Highlight)));color:var(--aa-highlight-ink,var(--ds-black,inherit))}.aa-block[data-kind=bullet]{margin-left:calc(var(--aa-depth,0) * var(--aa-indent,var(--aa-unit)))}.aa-block[data-kind=bullet][data-number]:before{content:attr(data-number) \".\"}.aa-block[data-kind=callout]{padding-left:var(--aa-unit);box-shadow:inset 1px 0 var(--aa-rule-color)}.aa-block[data-kind=callout]:before{content:\"\";width:var(--aa-unit);height:var(--aa-unit);mask:var(--aa-callout-icon) 50% 100% / calc(16px * var(--aa-sf)) no-repeat;cursor:pointer;background:currentColor;position:absolute;top:0;left:0}.aa-block[data-folded]:not([data-body-active]) .aa-callout-body{display:none}[data-fill=gray]{--aa-callout-fill:var(--aa-callout-fill-gray,color-mix(in srgb, var(--ds-fill,light-dark(#e6e6e6,#3c3c3c)) 50%, transparent))}[data-fill=brown]{--aa-callout-fill:var(--aa-callout-fill-brown,var(--one-sand-pastel,light-dark(#f3ecd8,#403926)))}[data-fill=orange]{--aa-callout-fill:var(--aa-callout-fill-orange,var(--one-orange-pastel,light-dark(#fff2cc,#4c3f1a)))}[data-fill=yellow]{--aa-callout-fill:var(--aa-callout-fill-yellow,var(--one-yellow-pastel,light-dark(#fbffcc,#484c1a)))}[data-fill=green]{--aa-callout-fill:var(--aa-callout-fill-green,var(--one-apple-green-pastel,light-dark(#daffcc,#284c1a)))}[data-fill=blue]{--aa-callout-fill:var(--aa-callout-fill-blue,var(--one-sharp-blue-pastel,light-dark(#ccf,#1d1a4c)))}[data-fill=purple]{--aa-callout-fill:var(--aa-callout-fill-purple,var(--one-purple-pastel,light-dark(#f9d2ed,#46203a)))}[data-fill=pink]{--aa-callout-fill:var(--aa-callout-fill-pink,var(--one-pink-pastel,light-dark(#fad1e6,#471f34)))}[data-fill=red]{--aa-callout-fill:var(--aa-callout-fill-red,var(--one-tuned-red-pastel,light-dark(#fcc,#4c1a1a)))}[data-fill=white]{--aa-callout-fill:var(--aa-callout-fill-white,transparent)}.aa-block[data-kind=callout][data-box]{--aa-callout-grey:var(--aa-callout-fill-gray,color-mix(in srgb, var(--ds-fill,light-dark(#e6e6e6,#3c3c3c)) 50%, transparent));box-sizing:border-box;padding:var(--aa-unit);border-radius:var(--ds-radius,calc(4px * var(--aa-sf)));background:var(--aa-callout-fill,var(--aa-callout-grey));box-shadow:none}.aa-block[data-kind=callout][data-box][data-fill=white]{box-shadow:inset 0 0 0 1px var(--aa-rule-color)}.aa-block[data-kind=callout][data-box][data-icon],.aa-block[data-kind=callout][data-box][data-picture]{padding-left:calc(2 * var(--aa-unit))}.aa-block[data-kind=callout][data-box]:before{content:none;left:var(--aa-unit);top:var(--aa-unit);background:0 0;mask:none}.aa-block[data-kind=callout][data-box][data-icon]:before{content:attr(data-icon);box-sizing:border-box;padding-top:calc(4px * var(--aa-sf));font-size:var(--aa-size,var(--ds-type-size-default,calc(14px * var(--aa-sf))));line-height:calc(16px * var(--aa-sf));letter-spacing:0;text-align:start;white-space:nowrap;-webkit-user-select:none;user-select:none;overflow:hidden}.aa-block[data-kind=callout][data-box][data-picture]:before{content:\"\";background:var(--aa-callout-picture) 0 100% / calc(16px * var(--aa-sf)) calc(16px * var(--aa-sf)) no-repeat}.aa-block[data-kind=callout][data-box][data-selected],.aa-block[data-kind=callout][data-box][data-lifted]{background:color-mix(in srgb, currentColor 15%, var(--aa-callout-fill,var(--aa-callout-grey)))}.aa-icon[data-fill]{border-radius:var(--ds-radius,calc(4px * var(--aa-sf)));background:var(--aa-callout-fill);mask:none}.aa-icon[data-fill=white]{box-shadow:inset 0 0 0 1px var(--aa-rule-color)}.aa-block[data-kind=table]{white-space:normal;font-variant-numeric:tabular-nums}.aa-table-row{grid-template-columns:var(--aa-table-columns,var(--aa-table-auto));display:grid}.aa-block[data-kind=table]{scrollbar-width:none;width:100%;width:round(down, 100%, var(--aa-unit));box-sizing:border-box;border-radius:var(--ds-radius,calc(4px * var(--aa-sf)));box-shadow:inset 0 0 0 1px var(--aa-table-rule,var(--aa-rule-color));overflow-x:auto}.aa-block[data-kind=table][style*=--aa-table-columns]{width:fit-content;max-width:100%}.aa-block[data-kind=table][data-settling] .aa-table-row{transition:grid-template-columns .14s cubic-bezier(.2,1,.1,1)}@media (prefers-reduced-motion:reduce){.aa-block[data-kind=table][data-settling] .aa-table-row{transition:none}}.aa-table-cell:has(>.ds-table-column-resize){overflow:visible}.aa-table-cell>.ds-table-column-resize{z-index:3;width:var(--aa-unit);height:var(--ds-table-resize-height,var(--aa-unit));cursor:col-resize;touch-action:none;-webkit-user-select:none;user-select:none;outline:none;position:absolute;inset-block-start:0;inset-inline-end:calc(var(--aa-unit) / -2)}.aa-table-cell>.ds-table-column-resize:after{content:\"\";background:var(--ds-focus-ring,currentColor);opacity:0;pointer-events:none;width:1px;height:100%;transition:opacity .14s ease-out;position:absolute;inset-block-start:0;inset-inline-start:calc(50% - 1px)}.aa-table-cell>.ds-table-column-resize:is(:focus,[data-resizing]):after{opacity:1}@media (hover:hover){.aa-table-cell>.ds-table-column-resize:hover:after{opacity:1}}.aa-table-cell:last-child>.ds-table-column-resize{inset-inline-end:0}.aa-table-cell:last-child>.ds-table-column-resize:after{inset-inline:auto 0}.aa-block[data-readonly=true] .ds-table-column-resize{display:none}.aa-table-cell{box-sizing:border-box;min-width:0;min-height:var(--aa-unit);padding:0 calc(4px * var(--aa-sf));box-shadow:inset -1px 0 var(--aa-table-rule,var(--aa-rule-color)), inset 0 -1px var(--aa-table-rule,var(--aa-rule-color));line-height:var(--aa-unit);white-space:pre-wrap;-webkit-user-modify:read-write-plaintext-only;outline:none;position:relative}.aa-table-cell [data-table-placeholder]:before{content:attr(data-table-placeholder);color:var(--aa-table-placeholder,light-dark(#c4c4c4,#666));pointer-events:none;font-weight:400;position:absolute}.aa-table-cell:last-child{box-shadow:inset 0 -1px var(--aa-table-rule,var(--aa-rule-color))}.aa-table-row:nth-last-child(2) .aa-table-cell{box-shadow:inset -1px 0 var(--aa-table-rule,var(--aa-rule-color))}.aa-table-row:nth-last-child(2) .aa-table-cell:last-child{box-shadow:none}.aa-table-cell[data-align=center]{text-align:center}.aa-table-cell[data-align=end]{text-align:end}.aa-table-row:first-child{color:var(--aa-table-header,inherit)}.aa-atom video,.aa-atom audio{max-width:100%;display:block}.aa-caption{font:inherit;font-size:var(--ds-type-size-small,calc(10px * var(--aa-sf)));color:var(--ds-text-color-muted,inherit);cursor:text;-webkit-user-modify:read-write-plaintext-only;outline:none;min-height:1lh;display:block}.aa-caption:empty:before{content:attr(data-placeholder);color:var(--aa-placeholder,var(--ds-input-placeholder-color,GrayText))}.aa-caption:empty:not([data-open]),.aa-block[data-readonly=true] .aa-caption:empty{display:none}.aa-atom[data-atom=equation-block]{display:block}.aa-block[data-fence][data-drawn]{box-shadow:none;font-size:inherit;letter-spacing:inherit;background:0 0;border-radius:0;padding:0}.aa-block[data-fence]>.aa-atom{max-width:100%;font-family:\"Inter Arrows\", var(--aa-typeface,var(--ds-typeface-regular,var(--typeface-regular,system-ui))), system-ui, sans-serif;font-size:var(--aa-size,var(--ds-type-size-default,calc(14px * var(--aa-sf))));letter-spacing:var(--aa-letterspacing,var(--ds-type-letterspacing-default,calc(-.3px * var(--aa-sf))));display:block;overflow-x:auto}.aa-block[data-fence]>.aa-atom>*{margin-inline-start:0}.aa-peer-selection{background:color-mix(in srgb, var(--aa-accent,var(--ds-sharp-blue,Highlight)) 20%, transparent)}.aa-peer-caret{border-left:calc(1px * var(--aa-sf)) solid var(--aa-accent,var(--ds-sharp-blue,Highlight));display:inline;position:relative}.aa-peer-caret:after{content:attr(data-initial);box-sizing:border-box;width:calc(16px * var(--aa-sf,1));height:calc(16px * var(--aa-sf,1));background:var(--aa-accent,var(--ds-sharp-blue,Highlight));color:var(--ds-white,HighlightText);font:var(--ds-type-weight-default,400) var(--ds-type-size-small,calc(10px * var(--aa-sf,1))) / 1 var(--aa-typeface,var(--ds-typeface-regular,var(--typeface-regular,system-ui)));letter-spacing:normal;white-space:nowrap;pointer-events:none;-webkit-user-select:none;user-select:none;border-radius:50%;place-items:center;font-style:normal;text-decoration:none;display:grid;position:absolute;bottom:100%;left:0;transform:translate(-50%)}.aa-peer-caret:not([data-initial]):after{content:none}.aa-block[data-kind=callout][data-level]>span:not(.aa-syntax):not(.aa-callout-body){font-family:\"Inter Arrows\", var(--ds-typeface-medium,var(--typeface-medium,inherit)), system-ui, sans-serif;font-weight:var(--ds-type-weight-bold,500)}.aa-link-editor input{flex:1;width:auto}:where(.aa-plain){font:inherit;font-feature-settings:inherit;letter-spacing:inherit;color:inherit}:where(.aa-plain)>.aa-block{font:inherit;letter-spacing:inherit}.aa-plain[data-empty]>.aa-block[data-placeholder]:before{content:attr(data-placeholder);color:var(--ds-text-color-muted,#8a8a8a);pointer-events:none}.aa-plain[data-listening]>.aa-block{caret-color:#0000}.aa-plain[data-listening]>.aa-block[data-placeholder]:before{color:var(--aa-prompt,light-dark(#594dff,#b7b0ff));margin-inline-end:.25em}.aa-shimmer{z-index:1000;pointer-events:none;mix-blend-mode:screen;opacity:0;animation:.9s ease-out both aa-shimmer-show;position:fixed;overflow:hidden}.aa-shimmer[data-dark]{mix-blend-mode:multiply}.aa-shimmer:after{content:\"\";background:linear-gradient(90deg, transparent, var(--aa-shimmer-color,var(--aa-accent)) 50%, transparent);animation:.9s cubic-bezier(.4,0,.2,1) both aa-shimmer-pass;animation-delay:inherit;position:absolute;inset:0;transform:translate(-100%)}@keyframes aa-shimmer-pass{to{transform:translate(100%)}}@keyframes aa-shimmer-show{0%{opacity:0}15%,70%{opacity:1}to{opacity:0}}@media (prefers-reduced-motion:reduce){.aa-shimmer:after{background:var(--aa-shimmer-color,var(--aa-accent));animation:none;transform:none}}@media (forced-colors:active){.aa-shimmer{display:none}}.aa-prompt{--aa-prompt-color:var(--aa-prompt,light-dark(#594dff,#b7b0ff));z-index:1000;box-sizing:border-box;color:var(--aa-prompt-color);caret-color:var(--aa-prompt-color);white-space:pre-wrap;overflow-wrap:anywhere;padding:0;background:0 0;outline:none;margin:0;padding-inline-end:.2em;position:fixed;overflow:visible}.aa-prompt[data-placed=page]{position:absolute}.aa-prompt:empty:before{content:attr(data-placeholder);color:var(--aa-prompt-color);pointer-events:none}.aa-prompt[data-listening]{caret-color:#0000}.aa-prompt-caret{width:calc(6px * var(--aa-sf,1));height:calc(6px * var(--aa-sf,1));background:var(--aa-prompt,light-dark(#594dff,#b7b0ff));vertical-align:middle;pointer-events:none;border-radius:50%;display:inline-block;position:relative}.aa-prompt-caret[data-after]{margin-inline-start:.25em}.aa-prompt i{margin-inline-end:-.2em;padding-inline-end:.2em;font-style:italic}.aa-prompt .aa-prompt-heard{text-underline-offset:.15em;-webkit-text-decoration:underline dotted;text-decoration:underline dotted}.aa-prompt[data-loading]{cursor:progress}.aa-prompt[data-failed]{-webkit-text-decoration:underline wavy var(--ds-danger-color,#d33);text-decoration:underline wavy var(--ds-danger-color,#d33);text-underline-offset:3px}@keyframes aa-prompt-breathe{0%,to{opacity:.35}50%{opacity:1}}[data-aa-glisten]{background-image:linear-gradient(105deg, currentColor 35%, var(--aa-prompt,light-dark(#594dff,#b7b0ff)) 50%, currentColor 65%);-webkit-text-fill-color:transparent;animation:1.8s ease-in-out infinite aa-glisten-pass;animation-delay:var(--aa-glisten-delay,0s);background-position:100% 0;background-repeat:no-repeat;background-size:300% 100%;background-clip:text}[data-aa-glisten] :is(.aa-c,.aa-comment,.aa-highlight){background:0 0}@keyframes aa-glisten-pass{to{background-position:0 0}}@media (prefers-reduced-motion:reduce){[data-aa-glisten]{-webkit-text-fill-color:currentColor;background-image:none;animation:none}}@media (forced-colors:active){[data-aa-glisten]{-webkit-text-fill-color:currentColor;background-image:none;animation:none}}.aa-ai-marks{z-index:999;pointer-events:none;position:fixed;inset:0}.aa-ai-hold{box-sizing:border-box;border:1px solid color-mix(in srgb, var(--ds-sharp-blue,var(--sharp-blue,#594dff)) 45%, transparent);border-radius:var(--ds-radius,calc(4px * var(--aa-sf,1)));background:color-mix(in srgb, var(--ds-zenith-blue,var(--zenith-blue,#ccf)) 30%, transparent);mix-blend-mode:multiply;animation:.24s cubic-bezier(.2,0,0,1) both aa-ai-appear;position:fixed}@media (prefers-color-scheme:dark){.aa-ai-hold{mix-blend-mode:screen;background:color-mix(in srgb, var(--ds-sharp-blue,var(--sharp-blue,#594dff)) 18%, transparent)}}.aa-ai-revert{width:calc(16px * var(--aa-sf,1));height:calc(16px * var(--aa-sf,1));transform:translate(calc(2px * var(--aa-sf,1)), -50%);cursor:pointer;pointer-events:auto;background:0 0;border:0;margin:0;padding:0;animation:.24s cubic-bezier(.2,0,0,1) both aa-ai-appear;display:block;position:fixed}.aa-ai-dot{left:calc(4px * var(--aa-sf,1));top:calc(5px * var(--aa-sf,1));width:calc(6px * var(--aa-sf,1));height:calc(6px * var(--aa-sf,1));background:var(--ds-sharp-blue,var(--sharp-blue,#594dff));border-radius:50%;transition:transform .18s cubic-bezier(.2,0,0,1),opacity .18s cubic-bezier(.2,0,0,1);position:absolute}.aa-ai-label{height:calc(16px * var(--aa-sf,1));padding:0 calc(4px * var(--aa-sf,1));border-radius:var(--ds-radius,calc(4px * var(--aa-sf,1)));background:var(--ds-sharp-blue,var(--sharp-blue,#594dff));color:var(--ds-white,#fff);font:inherit;font-family:var(--aa-typeface,var(--ds-typeface-regular,var(--typeface-regular,system-ui))), system-ui, sans-serif;font-size:var(--ds-type-size-default,calc(14px * var(--aa-sf,1)));line-height:calc(16px * var(--aa-sf,1));white-space:nowrap;opacity:0;transform-origin:calc(7px * var(--aa-sf,1)) 50%;transition:transform .22s cubic-bezier(.2,0,0,1),opacity .16s cubic-bezier(.2,0,0,1);position:absolute;top:0;left:0;transform:scale(.25)}.aa-ai-revert:hover .aa-ai-dot,.aa-ai-revert:focus-visible .aa-ai-dot{opacity:0;transform:scale(2)}.aa-ai-revert:hover .aa-ai-label,.aa-ai-revert:focus-visible .aa-ai-label{opacity:1;transform:none}.aa-ai-revert:focus-visible{outline:none}.aa-ai-revert:focus-visible .aa-ai-label{box-shadow:0 0 0 2px var(--ds-focus-ring,#594dff), 0 0 0 3px var(--ds-white,#fff)}.aa-ai-mark[data-kind=section] .aa-ai-revert{transform:translate(calc(-16px * var(--aa-sf,1)), -50%)}.aa-ai-mark[data-kind=section] .aa-ai-label{transform-origin:calc(100% - 7px * var(--aa-sf,1)) 50%;left:auto;right:0}@keyframes aa-ai-appear{0%{opacity:0}to{opacity:1}}@media (prefers-reduced-motion:reduce){.aa-ai-hold,.aa-ai-revert{animation:none}.aa-ai-dot,.aa-ai-label{transition:none}}@media (forced-colors:active){.aa-ai-hold{background:0 0;border-color:highlight}}.aa-block[data-kind=bullet][data-checked][data-ai-box]:before{border-color:var(--ds-sharp-blue,var(--sharp-blue,#594dff));box-shadow:0 0 0 1px var(--ds-sharp-blue,var(--sharp-blue,#594dff))}.aa[data-ai-fading] .aa-block[data-ai-box]:before{box-shadow:none}.aa-ai-marks[data-fading]{opacity:0;transition:opacity .4s cubic-bezier(.2,0,0,1)}@media (prefers-reduced-motion:reduce){.aa-ai-changed,.aa-ai-marks[data-fading]{transition:none}}.aa-comment{background:var(--aa-comment-fill,color-mix(in srgb, var(--ds-orange,var(--orange,#fec20d)) 28%, transparent));border-radius:calc(2px * var(--aa-sf,1));transition:background-color .18s cubic-bezier(.2,0,0,1)}.aa-comment--open{background:var(--aa-comment-fill-open,color-mix(in srgb, var(--ds-orange,var(--orange,#fec20d)) 55%, transparent))}.aa-comment--unread{box-shadow:inset 0 -1px var(--ds-orange,var(--orange,#fec20d))}.aa-comment--draft{background:var(--aa-comment-fill-open,color-mix(in srgb, var(--ds-orange,var(--orange,#fec20d)) 55%, transparent))}@media (forced-colors:active){.aa-comment{background:0 0;outline:1px solid highlight}}.aa-comments{--aa-unit:var(--ds-unit,var(--1,calc(20px * var(--sf,1))));--aa-sf:var(--ds-sf,var(--sf,1));--aa-rule-color:var(--aa-rule,var(--ds-border-color,light-dark(#d8d8d8,#3d3d3d)));--aa-muted:var(--ds-text-color-muted,light-dark(#797979,#ababab));box-sizing:border-box;color:var(--ds-text-color,light-dark(#1e1e1e,#fff));font-family:\"Inter Arrows\", var(--aa-typeface,var(--ds-typeface-regular,var(--typeface-regular,system-ui))), system-ui, sans-serif;font-feature-settings:var(--aa-font-features,var(--ds-font-features,normal));font-size:var(--ds-type-size-default,calc(14px * var(--aa-sf,1)));font-weight:var(--ds-type-weight-default,400);letter-spacing:var(--ds-type-letterspacing-default,calc(-.3px * var(--aa-sf,1)));line-height:var(--aa-unit)}.aa-comments[data-mode=popover]{z-index:1000;max-height:calc(100vh - var(--aa-unit));padding:calc(var(--aa-unit) / 2);border:1px solid var(--aa-rule-color);border-radius:var(--ds-radius-card,calc(8px * var(--aa-sf,1)));background:var(--ds-background-color,light-dark(#fff,#1e1e1e));box-shadow:var(--ds-shadow,0 calc(4px * var(--aa-sf,1)) calc(20px * var(--aa-sf,1)) #00000014);animation:.22s cubic-bezier(.2,0,0,1) both aa-comments-in;position:fixed;overflow-y:auto}@keyframes aa-comments-in{0%{opacity:0;transform:translateY(calc(4px * var(--aa-sf,1)))}}.aa-comments[data-mode=popover] :is(.aa-thread-head,.aa-comment-meta,.aa-composer,.aa-comment-reactions,.aa-thread-actions){align-items:center}.aa-comments[data-mode=popover] .aa-composer textarea{padding:0}.aa-comments[data-mode=panel] .aa-thread+.aa-thread{margin-top:calc(var(--aa-unit) / 2)}.aa-comments-tabs{align-items:flex-end;gap:calc(4px * var(--aa-sf,1));height:var(--aa-unit);margin:0 0 0 calc(-4px * var(--aa-sf,1));line-height:calc(16px * var(--aa-sf,1));display:flex}.aa-comments-tabs [role=tab]{height:calc(16px * var(--aa-sf,1));padding:0 calc(4px * var(--aa-sf,1));border-radius:var(--ds-radius,calc(4px * var(--aa-sf,1)));color:var(--aa-muted);font:inherit;letter-spacing:inherit;line-height:calc(16px * var(--aa-sf,1));white-space:nowrap;cursor:pointer;background:0 0;border:0;margin:0}.aa-comments-tabs [role=tab][aria-selected=true],.aa-comments-tabs [role=tab]:hover{color:inherit}.aa-comments-tabs [role=tab]:focus-visible{outline:2px solid var(--ds-focus-ring,#594dff);outline-offset:-2px}.aa-comments-tab-count{font-variant-numeric:tabular-nums}.aa-comments-empty{color:var(--aa-muted)}.aa-comments[data-mode=panel] .aa-comments-tabs+.aa-thread{margin-top:0}.aa-comments-empty{margin:0}.aa-thread-head{align-items:flex-end;gap:calc(4px * var(--aa-sf,1));box-sizing:border-box;width:100%;min-height:var(--aa-unit);color:inherit;font:inherit;letter-spacing:inherit;line-height:calc(16px * var(--aa-sf,1));text-align:start;background:0 0;border:0;margin:0;padding:0;display:flex}button.aa-thread-head{cursor:pointer}button.aa-thread-head:focus-visible{outline:2px solid var(--ds-focus-ring,#594dff);outline-offset:1px;border-radius:calc(2px * var(--aa-sf,1))}.aa-thread-quote{min-width:0;color:var(--aa-muted);white-space:normal;overflow-wrap:break-word;flex:auto;overflow:hidden}.aa-thread[data-orphaned] .aa-thread-quote{font-style:italic}.aa-thread[data-unread] .aa-thread-quote:before{content:\"\";width:calc(6px * var(--aa-sf,1));height:calc(6px * var(--aa-sf,1));margin-right:calc(4px * var(--aa-sf,1));background:var(--ds-orange,var(--orange,#fec20d));vertical-align:calc(2px * var(--aa-sf,1));border-radius:50%;display:inline-block}.aa-thread-count{color:var(--aa-muted);font-variant-numeric:tabular-nums;flex:none}.aa-thread-title{min-width:0;font-family:\"Inter Arrows\", var(--aa-typeface-bold,var(--ds-typeface-medium,var(--typeface-medium,inherit))), system-ui, sans-serif;font-weight:var(--ds-type-weight-bold,500);white-space:nowrap;flex:auto}.aa-thread[data-titled]>.aa-thread-head{margin-bottom:calc(var(--aa-unit) / 2)}.aa-thread-actions{align-items:flex-end;gap:calc(4px * var(--aa-sf,1));flex:none;margin-left:auto;display:flex}.aa-comments-button{width:calc(16px * var(--aa-sf,1));height:calc(16px * var(--aa-sf,1));border-radius:var(--ds-radius,calc(4px * var(--aa-sf,1)));color:inherit;cursor:pointer;background:0 0;border:0;justify-content:center;align-items:center;margin:0;padding:0;display:inline-flex}.aa-comments-button:hover{background:var(--ds-fill,light-dark(#e6e6e6,#3c3c3c))}.aa-comments-button:disabled{opacity:.5;cursor:default}.aa-comments-word{height:calc(16px * var(--aa-sf,1));padding:0 calc(4px * var(--aa-sf,1));border-radius:var(--ds-radius,calc(4px * var(--aa-sf,1)));background:var(--ds-fill,light-dark(#e6e6e6,#3c3c3c));color:inherit;font:inherit;letter-spacing:inherit;line-height:calc(16px * var(--aa-sf,1));white-space:nowrap;cursor:pointer;border:0;margin:0}.aa-comments-word:hover{background:var(--ds-fill-hover,light-dark(#d8d8d8,#4a4a4a))}.aa-thread-reopen{background:var(--ds-zenith-blue,var(--zenith-blue,#ccf));color:var(--ds-sharp-blue,var(--sharp-blue,#594dff))}.aa-thread-delete{background:var(--ds-tuned-red,var(--tuned-red,#ff5f5f));color:var(--ds-white,#fff)}.aa-comment-edit{color:var(--aa-muted);background:0 0;margin-left:auto}.aa-comment-meta .aa-thread-actions{margin-left:auto}.aa-comment-meta .aa-comment-edit+.aa-thread-actions{margin-left:0}.aa-comment-edit:hover{color:inherit}.aa-comments-button:focus-visible,.aa-comments-word:focus-visible{outline:2px solid var(--ds-focus-ring,#594dff);outline-offset:1px}.aa-comment-entry{margin-top:calc(var(--aa-unit) / 2)}.aa-thread-head+.aa-comment-entry{margin-top:0}.aa-comment-meta{align-items:flex-end;gap:calc(4px * var(--aa-sf,1));min-height:var(--aa-unit);line-height:calc(16px * var(--aa-sf,1));display:flex}.aa-comment-author{font-family:\"Inter Arrows\", var(--aa-typeface-bold,var(--ds-typeface-medium,var(--typeface-medium,inherit))), system-ui, sans-serif;font-weight:var(--ds-type-weight-bold,500);white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.aa-comment-time{color:var(--aa-muted);white-space:nowrap}.aa-comment-body{margin:0 0 0 var(--aa-unit);line-height:var(--aa-unit);white-space:pre-wrap;overflow-wrap:anywhere}.aa-comment-mention{color:var(--aa-person,inherit)}.aa-comment-entry--internal{border-radius:var(--ds-radius,calc(4px * var(--aa-sf,1)));background:var(--aa-internal,light-dark(#e4e4e7,#34343a));box-shadow:0 0 0 calc(var(--aa-unit) / 4) var(--aa-internal,light-dark(#e4e4e7,#34343a))}.aa-comment-internal{color:var(--aa-muted);white-space:nowrap}.aa-comment-reactions{align-items:flex-end;gap:calc(var(--aa-unit) / 2);min-height:var(--aa-unit);margin-left:var(--aa-unit);line-height:calc(16px * var(--aa-sf,1));flex-wrap:wrap;display:flex}.aa-reaction{align-items:center;gap:calc(4px * var(--aa-sf,1));height:calc(16px * var(--aa-sf,1));border-radius:var(--ds-radius,calc(4px * var(--aa-sf,1)));color:var(--aa-muted);font:inherit;letter-spacing:inherit;line-height:calc(16px * var(--aa-sf,1));cursor:pointer;background:0 0;border:0;margin:0;padding:0;display:inline-flex}.aa-reaction:hover:not(:disabled){color:inherit}.aa-reaction[aria-pressed=true]{color:var(--ds-sharp-blue,var(--sharp-blue,#594dff))}.aa-reaction:disabled{cursor:default}.aa-reaction:is(:hover,:active,[aria-pressed]){background:0 0}.aa-reaction-count{font-variant-numeric:tabular-nums}.aa-reaction-add{color:var(--aa-muted)}.aa-reaction-add:hover{color:inherit}.aa-reaction:focus-visible{outline:2px solid var(--ds-focus-ring,#594dff);outline-offset:1px}.aa-reaction-picker{grid-template-columns:repeat(8, calc(var(--aa-square) - 1px));grid-auto-rows:calc(var(--aa-square) - 1px);width:calc(8 * var(--aa-square) - 1px);gap:1px;display:grid}.aa-reaction-picker button{width:calc(var(--aa-square) - 1px);height:calc(var(--aa-square) - 1px);min-width:0;font-size:calc(12px * var(--aa-sf,1));justify-content:center;align-items:center;padding:0;line-height:1;overflow:visible}.aa-callout-icons{position:fixed}.aa-callout-icons .aa-callout-icons-none{width:auto;padding:0 calc(4px * var(--aa-sf));grid-column:1/-1;justify-content:flex-start}.aa-thread-resolved{margin:0 0 0 var(--aa-unit);min-height:var(--aa-unit);color:var(--aa-muted)}.aa-comments-error{margin:0 0 0 var(--aa-unit);min-height:var(--aa-unit);color:var(--ds-tuned-red,var(--tuned-red,#ff5f5f))}.aa-avatar{--ds-avatar-background:var(--aa-person,var(--ds-fill,#ededed));--ds-avatar-color:var(--aa-person-ink,#1e1e1e);box-sizing:border-box;width:calc(16px * var(--aa-sf,1));height:calc(16px * var(--aa-sf,1));background:var(--aa-person,var(--ds-fill,#ededed));color:var(--aa-person-ink,#1e1e1e);font:var(--ds-type-weight-default,400) var(--ds-type-size-small,calc(10px * var(--aa-sf,1))) / 1 var(--aa-typeface,var(--ds-typeface-regular,var(--typeface-regular,system-ui)));letter-spacing:normal;text-align:center;white-space:nowrap;-webkit-user-select:none;user-select:none;border-radius:50%;flex:none;place-items:center;display:inline-grid;position:relative;overflow:hidden}.aa-composer{align-items:flex-end;gap:calc(4px * var(--aa-sf,1));margin:calc(var(--aa-unit) / 2) 0 0;min-height:var(--aa-unit);display:flex}.aa-thread-head+.aa-composer,.aa-thread>.aa-composer:first-child{margin-top:0}.aa-composer textarea,.aa-comment-editing{box-sizing:border-box;width:100%;min-width:0;min-height:var(--aa-unit);max-height:calc(8 * var(--aa-unit));color:inherit;font:inherit;letter-spacing:inherit;line-height:var(--aa-unit);resize:none;background:0 0;border:0;border-radius:0;outline:none;flex:auto;margin:0;padding:0;overflow:hidden}.aa-comment-editing{width:calc(100% - var(--aa-unit));margin-left:var(--aa-unit);background:0 0;padding:0;display:block}.aa-composer textarea::placeholder,.aa-comment-editing::placeholder{color:var(--aa-placeholder,var(--ds-input-placeholder-color,light-dark(#797979,#ababab)))}.aa-composer textarea[data-asking]{color:var(--aa-prompt,light-dark(#594dff,#b7b0ff));caret-color:var(--aa-prompt,light-dark(#594dff,#b7b0ff))}.aa-composer>.aa-avatar{margin-top:calc((var(--aa-unit) - 16px * var(--aa-sf,1)) / 2);align-self:flex-start}.aa-composer>.aa-composer-send{align-self:flex-end}.aa-composer-send{color:var(--aa-muted)}.aa-composer-field[hidden]{display:none}.aa-composer-field{flex:auto;min-width:0;display:flex;position:relative}.aa-composer-backdrop{white-space:pre-wrap;overflow-wrap:break-word;line-height:var(--aa-unit);pointer-events:none;position:absolute;inset:0;overflow:hidden}.aa-composer textarea{position:relative}.aa-composer textarea[data-mentions]:not([data-asking],[data-listening]){color:#0000;caret-color:var(--ds-text-color,currentColor)}.aa-composer textarea[data-listening]{color:#0000;caret-color:#0000}.aa-composer-field:has(textarea[data-listening]) .aa-composer-backdrop{color:var(--aa-prompt,light-dark(#594dff,#b7b0ff))}.aa-composer-listening{color:var(--aa-placeholder,var(--ds-input-placeholder-color,light-dark(#797979,#ababab)));margin-inline-start:.25em}.aa-composer textarea[data-mentions]::selection{color:#0000}.aa-composer-field:has(textarea[data-asking]) .aa-composer-backdrop{visibility:hidden}.aa-composer-thinking{min-width:0;line-height:var(--aa-unit);flex:auto}.aa-composer-send:hover{color:inherit}.aa-menu.aa-comments-people{--aa-menu-fill:var(--ds-paper,#fff);--aa-menu-ink:var(--ds-text-color,#1e1e1e);--aa-menu-hover:var(--ds-fill,#f2f2f2);width:calc(8 * var(--aa-square));background:var(--aa-menu-fill);box-shadow:inset 0 0 0 1px var(--ds-border-color,#0000001f);gap:0}.aa-comments-people button{justify-content:flex-start}.aa-comments-people button span:last-child{white-space:nowrap;mask-image:linear-gradient(to right, black calc(100% - var(--aa-square)), transparent 100%);flex:1}@media (prefers-reduced-motion:reduce){.aa-comments[data-mode=popover]{animation:none}.aa-comment{transition:none}}.aa-atom.aa-columns{grid-template-columns:repeat(var(--aa-columns,2), minmax(0, 1fr));gap:calc(2 * var(--aa-unit));vertical-align:top;width:100%;display:grid}.aa-column{min-width:0}@media (width<=480px){.aa-atom.aa-columns{gap:var(--aa-unit);grid-template-columns:minmax(0,1fr)}}.aa-atom.aa-tabs{vertical-align:top;width:100%;display:block}.aa-tabs-row{align-items:flex-end;gap:calc(4px * var(--aa-sf));min-height:var(--aa-unit);line-height:calc(16px * var(--aa-sf));white-space:nowrap;flex-wrap:wrap;margin-inline-start:calc(-4px * var(--aa-sf));display:flex}.aa-tab{align-items:flex-end;gap:calc(4px * var(--aa-sf));box-sizing:border-box;height:calc(16px * var(--aa-sf));padding:0 calc(4px * var(--aa-sf));border-radius:var(--ds-radius,calc(4px * var(--aa-sf)));color:var(--ds-text-color-muted,GrayText);font:inherit;letter-spacing:inherit;line-height:calc(16px * var(--aa-sf));white-space:nowrap;cursor:pointer;-webkit-user-select:none;user-select:none;background:0 0;border:0;flex:none;margin:0;display:inline-flex}.aa-tab[aria-selected=true]{color:var(--ds-text-color,inherit)}.aa-tab:focus-visible{outline:2px solid var(--ds-focus-ring,currentColor);outline-offset:-2px}.aa-tab-icon{font-size:calc(12px * var(--aa-sf));line-height:calc(16px * var(--aa-sf))}.aa-tab-add{color:var(--ds-text-color-muted,GrayText)}.aa-tab-add:hover,.aa-tab-add:focus-visible{color:var(--ds-text-color,inherit)}.aa-tab-name[contenteditable]{white-space:pre;cursor:text;-webkit-user-select:text;user-select:text;min-width:1px;color:var(--ds-text-color,inherit);outline:none;display:inline-block}.aa-tab-panel{margin-top:var(--aa-unit);min-height:var(--aa-unit)}.aa-block[data-readonly=true] .aa-tab{cursor:default}.aa-drop-line.aa-drop-side{width:calc(2px * var(--aa-sf))}.aa-drop-line.aa-drop-side[data-swap]{box-shadow:inset 0 0 0 calc(2px * var(--aa-sf)) var(--aa-accent);border-radius:var(--ds-radius,calc(4px * var(--aa-sf)));background:0 0}.aa[style*=--drag-reserve],.aa-column[style*=--drag-reserve]{padding-bottom:var(--drag-reserve)}.aa-column .aa-atom[data-atom=image]:not([data-width]){width:100%;max-width:100%;display:block}.aa-column .aa-atom:has(>img):not([data-width]){width:100%;max-width:100%;display:block}.aa-column .aa-atom[data-atom=image][data-width]{display:block}.aa-column .aa-atom>img{width:100%}.aa-column .aa-atom[data-atom=image][data-fitted]{width:calc(var(--aa-picture-across) * var(--aa-unit))}:where(.aa-toc){white-space:normal;display:block}:where(.aa-toc ds-table-of-contents){--ds-toc-width:100%}:where(.aa-toc-empty){color:var(--ds-text-color-muted,GrayText)}:where(.aa-partial){vertical-align:baseline;cursor:pointer;max-width:100%;display:inline-block}:where(.aa-partial>ds-button){pointer-events:none}:where(.aa-partial:focus-visible){outline:1px solid var(--ds-focus-color,Highlight);outline-offset:2px}:where(.aa-partial-properties){--ds-overlay-width:calc(12 * var(--ds-unit,20px))}:where(.aa-partial-properties>*){margin-bottom:var(--ds-unit,20px);display:block}:where(.aa-partial-properties>label>ds-select){display:block}:where(.aa-partial-properties>.aa-partial-actions){justify-content:flex-end;gap:var(--ds-half,10px);margin-bottom:0;display:flex}.aa-command-preview{z-index:1001;width:calc(16 * var(--aa-square,20px));pointer-events:none;position:fixed}.aa-command-preview[hidden]{display:none}.aa-toolbar-spacer{flex:0 0 var(--ds-context-row,calc(var(--aa-square) - 1px));height:var(--ds-context-row,calc(var(--aa-square) - 1px));background:var(--aa-menu-fill);pointer-events:none;justify-content:center;align-items:center;display:flex}.aa-menu[data-palette]{width:max-content;min-width:0}.aa-menu[data-palette] .aa-menu-list{grid-template-columns:repeat(4,var(--aa-square));gap:1px;display:grid;overflow:visible}.aa-menu[data-palette] .aa-colour-swatch{width:var(--aa-square);justify-content:center;min-width:0;padding:0}.aa-menu[data-palette] .aa-colour-swatch .aa-icon{width:calc(10px * var(--aa-sf));height:calc(10px * var(--aa-sf));border-radius:calc(2px * var(--aa-sf));mask-image:none}.aa-menu[data-palette]>button[data-command=close]{display:none}.aa-writer{--aa-sf:var(--ds-sf,var(--sf,1));--aa-square:var(--ds-unit,var(--1,calc(20px * var(--sf,1))));--aa-writer-line:var(--ds-border-color,light-dark(#d8d8d8,#3d3d3d));gap:calc(var(--aa-square) / 2);flex-direction:column;min-width:0;display:flex}.aa-writer-frame{border:1px solid var(--aa-writer-line);border-radius:calc(4px * var(--aa-sf));background:var(--ds-paper,Canvas);min-width:0}.aa-writer-frame:focus-within{border-color:var(--ds-focus-ring,Highlight);outline:2px solid var(--ds-focus-ring,Highlight);outline-offset:-2px}.aa-writer-bar{z-index:1;align-items:center;gap:calc(var(--aa-square) / 2);box-sizing:border-box;height:calc(1.5 * var(--aa-square));padding-inline:calc(var(--aa-square) / 4);scrollbar-width:none;border-bottom:1px solid var(--aa-writer-line);background:var(--ds-paper,Canvas);border-radius:calc(3px * var(--aa-sf)) calc(3px * var(--aa-sf)) 0 0;display:flex;position:sticky;top:0;overflow:auto hidden}.aa-writer-bar::-webkit-scrollbar{display:none}.aa-writer-group{flex:none;align-items:center;display:inline-flex}.aa-writer-group+.aa-writer-group{position:relative}.aa-writer-group+.aa-writer-group:before{content:\"\";inset-block:calc(2px * var(--aa-sf));background:var(--aa-writer-line);width:1px;position:absolute;inset-inline-start:calc(var(--aa-square) / -4)}.aa-writer-end{margin-inline-start:auto}.aa-writer-end.aa-writer-group:before{display:none}.aa-writer-bar button{box-sizing:border-box;height:var(--aa-square);min-width:var(--aa-square);border-radius:calc(2px * var(--aa-sf));color:inherit;cursor:pointer;background:0 0;border:0;flex:none;justify-content:center;align-items:center;margin:0;padding:0;display:inline-flex}.aa-writer-bar button.aa-writer-opens{width:calc(1.75 * var(--aa-square))}.aa-writer-opens .aa-icon:last-child{width:calc(10px * var(--aa-sf));height:calc(10px * var(--aa-sf))}.aa-writer-bar button[aria-pressed=true],.aa-writer-bar button[aria-expanded=true]{background:var(--ds-fill,light-dark(#f2f2f2,#2c2c2c))}@media (hover:hover){.aa-writer-bar button:hover{background:var(--ds-fill,light-dark(#f2f2f2,#2c2c2c))}}.aa-writer-bar button:focus-visible{outline:2px solid var(--ds-focus-ring,currentColor);outline-offset:-2px}.aa-writer-page{padding:calc(var(--aa-square) / 2) var(--aa-square);min-width:0}.aa-writer-foot{align-items:center;gap:calc(var(--aa-square) / 2);min-height:var(--aa-square);display:flex}.aa-writer-foot button{box-sizing:border-box;height:var(--aa-square);min-width:calc(3 * var(--aa-square));padding-inline:calc(var(--aa-square) / 2);border-radius:calc(4px * var(--aa-sf));font:inherit;cursor:pointer;border:0;justify-content:center;align-items:center;margin:0;display:inline-flex}.aa-writer-save{background:var(--aa-accent);color:var(--aa-on-accent)}.aa-writer-cancel{color:inherit;background:0 0}@media (hover:hover){.aa-writer-cancel:hover:not(:disabled){background:var(--ds-fill,light-dark(#f2f2f2,#2c2c2c))}}.aa-writer-foot button:disabled{opacity:.4;cursor:default}.aa-writer-foot button:focus-visible{outline:2px solid var(--ds-focus-ring,currentColor);outline-offset:2px}.aa-writer-state{color:var(--ds-text-color-muted,color-mix(in srgb, currentColor 60%, transparent));white-space:nowrap;margin-inline-start:auto}.aa-writer[data-state=failed] .aa-writer-state{color:var(--ds-danger-color,#c0392b)}.aa-writer[data-read-only] .aa-writer-bar,.aa-writer[data-read-only] .aa-writer-foot{display:none}.aa-writer[data-read-only] .aa-writer-frame{box-shadow:none;border-color:#0000}.aa-menu.aa-writer-menu{--aa-menu-fill:var(--ds-paper,#fff);--aa-menu-ink:var(--ds-text-color,#1e1e1e);--aa-menu-hover:var(--ds-fill,#f2f2f2);box-sizing:border-box;width:calc(8 * var(--aa-square));background:var(--aa-menu-fill);box-shadow:inset 0 0 0 1px var(--ds-border-color,#0000001f);border-radius:0;gap:0;padding:1px}";
//#endregion
//#region src/styles.ts
function aa(e) {
	let t = e.getRootNode(), n = e.ownerDocument, r = t.host ? t : n.head ?? n.documentElement;
	if (r.querySelector("style[data-aa-styles]") || r !== t && n.defaultView?.getComputedStyle(n.documentElement).getPropertyValue("--aa-sheet").trim()) return;
	let i = n.createElement("style");
	i.dataset.aaStyles = "", i.textContent = ia, r.prepend(i);
}
//#endregion
//#region src/button-partial.ts
var oa = [
	"default",
	"primary",
	"secondary",
	"active",
	"disabled",
	"danger"
], sa = /@Button\(("(?:[^"\\\n]|\\.)*"),\s*"(default|primary|secondary|active|disabled|danger)"\)/;
function ca(e) {
	let t = sa.exec(e);
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
function la({ label: e, state: t }) {
	return `@Button(${JSON.stringify(e.replace(/[\r\n]/g, " "))}, "${t}")`;
}
var ua = Et("button-partial", sa, (e) => !!ca(e[0])), da = si(() => import("./aa-components.js"));
da.get;
var fa = (e) => ({
	...ua,
	draw(t, n) {
		return t.textContent = ca(n)?.label ?? "", da.when(({ drawButtonPartial: r }) => (t.textContent = "", r(t, n, e)));
	}
}), pa = (e) => da.when(({ createPartialPicker: t }) => t(e));
function ma(e, t, n, r) {
	let i = () => {};
	return da.when(({ createTableOfContents: a }) => {
		i = a(e, t, n, r), i();
	}), () => i();
}
//#endregion
//#region src/dictation.ts
var ha = typeof navigator < "u" && /^((?!chrome|chromium|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);
function ga(e) {
	return e === "not-allowed" ? H(ha ? "The microphone is blocked: allow it for this site in Safari › Settings › Websites › Microphone" : "The microphone is blocked: allow it for this site in the browser’s settings") : e === "service-not-allowed" ? H(ha ? "Turn on Dictation in System Settings › Keyboard to speak here" : "Speaking is turned off in this browser") : e === "audio-capture" ? H("No microphone was found") : e === "network" ? H("Speaking needs a connection") : e === "no-speech" ? H("Nothing was heard: press Space twice to try again") : null;
}
function _a() {
	let e = globalThis, t = e.SpeechRecognition ?? e.webkitSpeechRecognition;
	return t ? new t() : null;
}
function va(e, t, n) {
	return e ? .85 : Math.min(1, .55 + .3 * t + .3 * n);
}
function ya(e, t) {
	if (t.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return {
		followVoice: null,
		stop: () => {}
	};
	let n = 0, r = !1, i = 0, a = va(!1, 0, 0), o = null, s, c, l = /* @__PURE__ */ new Float32Array(512), u = performance.now(), d = -Infinity, f = !1, p = null, m = (t) => {
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
		a += (va(c, h, i) - a) * .12, e.style.opacity = a.toFixed(3), n = requestAnimationFrame(m);
	};
	return n = requestAnimationFrame(m), {
		followVoice: async () => {
			if (!ha && navigator.mediaDevices?.getUserMedia && typeof AudioContext < "u") try {
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
var ba = () => {
	let e = globalThis;
	return !!(e.SpeechRecognition ?? e.webkitSpeechRecognition);
};
function xa(e) {
	let t = _a();
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
		n = ga(e.error) ?? n, i();
	}, e.audio && (t.onaudiostart = e.audio);
	try {
		t.start();
	} catch {
		return n = H("Speaking could not start here"), i(), null;
	}
	return {
		stop: () => t.stop(),
		abort: () => {
			t.abort(), i();
		}
	};
}
//#endregion
//#region src/comments-view.ts
var Sa = 800, Ca = (e, t, n) => {
	let r = H(e), i = document.createElement("button");
	return i.type = "button", i.className = "aa-comments-button", i.dataset.tooltip = r, i.setAttribute("aria-label", r), i.append(Sr(t)), i.addEventListener("click", (e) => {
		e.preventDefault(), n();
	}), i;
}, wa = (e, t, n = "") => {
	let r = document.createElement("button");
	return r.type = "button", r.className = `aa-comments-word ${n}`.trim(), r.textContent = H(e), r.addEventListener("click", (e) => {
		e.preventDefault(), t();
	}), r;
}, Ta = (e) => {
	let t = document.createElement("span");
	return t.className = "aa-avatar ds-avatar", t.textContent = xe(e.name), t.style.setProperty("--aa-person", Ce(e)), t.setAttribute("aria-hidden", "true"), t;
};
function Ea(e, t) {
	let n = new AbortController(), { signal: r } = n, i = (t, n) => Object.assign(e.ownerDocument.createElement(t), { className: n }), { store: a } = t, o = e.ownerDocument, s = o.defaultView, c = t.root ?? e.closest("dialog") ?? o.body, l = a.panel ?? null, u = [], d = [], f = t.value(), p = null, m = null, h = null, g = null, _ = !1, v = 0, y, b = /* @__PURE__ */ new Map(), x = null, S = null, C = /* @__PURE__ */ new Map(), w = /* @__PURE__ */ new Set(), T = /* @__PURE__ */ new Map(), E = null, ee = null, D = "open", O = (e) => l && D === "resolved" ? !!e.resolvedAt : !e.resolvedAt, te = () => !!a.me && !t.readOnly(), k = () => d.find((e) => e.id === p) ?? null, A = () => {
		let e = [];
		for (let t of d) {
			if (t.orphaned || !O(t)) continue;
			let n = [
				"aa-comment",
				t.id === p ? "aa-comment--open" : "",
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
		h && e.push({
			from: h.from,
			to: h.to,
			className: "aa-comment aa-comment--open aa-comment--draft",
			attributes: { "data-comment": "draft" }
		}), t.decorate(e);
	}, j = (t) => Array.from(e.querySelectorAll("[data-comment]")).filter((e) => (e.getAttribute("data-comment") ?? "").split(" ").includes(t)).flatMap((e) => Array.from(e.getClientRects())), ne = (e) => {
		if (a.move && e.length) {
			for (let t of e) b.set(t.id, t);
			clearTimeout(y), y = setTimeout(() => {
				let e = [...b.values()];
				b = /* @__PURE__ */ new Map(), u = u.map((t) => {
					let n = e.find((e) => e.id === t.id);
					return n ? {
						...t,
						...n
					} : t;
				}), Promise.resolve(a.move(e)).catch(() => {});
			}, Sa);
		}
	}, M = (e) => {
		if (!_) {
			if (u = e, f = t.value(), d = fe(e, t.value()), p && !d.some((e) => e.id === p) && (p = null), g) {
				let e = d.find((e) => e.from === g.from && e.to === g.to && !e.resolvedAt);
				e && (g = null, h = null, p = e.id, a.seen?.(e.id));
			}
			ne(pe(u, d)), A(), Y();
		}
	}, N = () => {
		if (_) return;
		let e = t.value();
		if (e === f) return;
		let n = U(f, e);
		if (f = e, d = de(d, n, e).map((t) => {
			if (!t.orphaned) return t;
			let n = u.find((e) => e.id === t.id), r = n && !n.orphaned && W(n, e);
			return r ? {
				...t,
				...r,
				quote: n.quote,
				orphaned: !1
			} : t;
		}), h) {
			let t = ue(h, n);
			h = t ? {
				...t,
				quote: e.slice(t.from, t.to)
			} : null, h || F();
		}
		ne(pe(u, d)), A(), Y();
	}, P = () => {
		if (_) return;
		let e = t.selection();
		if (!e || e.start !== e.end) return;
		let n = he(d, e.start);
		n.length ? p && n.some((e) => e.id === p) || n[0].id !== m && re(n[0].id) : (m = null, p && !l && !h && (p = null, A(), Y()));
	};
	e.addEventListener("aa-selectionchange", () => P(), { signal: r }), e.addEventListener("aa-change", N, { signal: r }), e.addEventListener("click", (t) => {
		let n = t.target?.closest?.("[data-comment]");
		if (!n || !e.contains(n)) return;
		let r = (n.getAttribute("data-comment") ?? "").split(" ").find((e) => e !== "draft");
		r && re(r);
	}, { signal: r });
	let re = (e) => {
		let t = d.find((t) => t.id === e);
		t && (l && (D = t.resolvedAt ? "resolved" : "open"), h && (h = null, T.delete("draft")), p = e, m = null, E = null, ee = null, t.unread && Promise.resolve(a.seen?.(e)).catch(() => {}), A(), Y(), l && x?.querySelector(`[data-thread="${e}"]`)?.scrollIntoView({ block: "nearest" }));
	}, F = () => {
		h = null, T.delete("draft"), g = null;
	}, ie = () => {
		let n = !!p || !!h;
		p && (m = p);
		let r = k()?.to ?? h?.to;
		return p = null, F(), E = null, ee = null, R(), J(), A(), Y(), n && r !== void 0 && !e.contains(o.activeElement) && t.selectRange(r), n;
	}, ae = () => {
		if (!te()) return !1;
		let e = t.selection();
		if (!e || e.start === e.end) return !1;
		let n = t.value(), r = Math.min(e.start, e.end), i = Math.max(e.start, e.end), a = n.slice(r, i);
		return a.trim() ? (p = null, h = {
			from: r,
			to: i,
			quote: a
		}, E = null, ee = null, A(), Y(), x?.querySelector("textarea")?.focus(), !0) : !1;
	}, oe = (e, t) => {
		C.set(e, t instanceof Error && t.message ? t.message : H("Not saved")), Y(), setTimeout(() => {
			C.get(e) && (C.delete(e), Y());
		}, 4e3);
	}, I = async (e, t, n) => {
		if (!w.has(e)) {
			w.add(e), Y();
			try {
				await t(), n?.();
			} catch (t) {
				oe(e, t);
			} finally {
				w.delete(e), Y();
			}
		}
	}, L = /* @__PURE__ */ new Map(), se = (e, t) => {
		let n = t.trim();
		if (!n || !te()) return;
		let r = ve(n, [...L.values()]);
		if (e === "draft") {
			if (!h) return;
			let t = h;
			g = t, I(e, () => a.add(t, n, r), () => {
				T.delete("draft"), h = null, A(), Y();
			}).then(() => {
				C.has("draft") && (g = null);
			});
		} else I(e, () => a.reply(e, n, r), () => {
			T.delete(e), Y();
		});
	}, R = () => {
		S?.remove(), S = null;
	}, z = [], ce = 0, B = null, _e = null, be = 0, xe = (e) => {
		if (!B || !_e) return;
		L.set(e.id, e);
		let t = B, { start: n } = _e, r = t.selectionStart ?? t.value.length;
		t.value = `${t.value.slice(0, n)}@${e.name} ${t.value.slice(r)}`;
		let i = n + e.name.length + 2;
		t.setSelectionRange(i, i), t.dispatchEvent(new Event("input", { bubbles: !0 })), R(), t.focus();
	}, Se = () => {
		if (S && (S.replaceChildren(...z.map((e, t) => {
			let n = o.createElement("button");
			n.type = "button", n.setAttribute("role", "option"), n.className = "note-menu-row", n.setAttribute("aria-selected", String(t === ce)), n.toggleAttribute("data-current", t === ce);
			let r = o.createElement("span");
			return r.textContent = e.name, n.append(Ta(e), r), n.addEventListener("pointerdown", (e) => e.preventDefault()), n.addEventListener("click", () => xe(e)), n;
		})), !z.length)) {
			let e = o.createElement("span");
			e.className = "aa-menu-empty", e.textContent = H("Nobody to mention"), S.append(e);
		}
	}, we = () => {
		if (!S || !B) return;
		let t = B.getBoundingClientRect(), n = 20 * (parseFloat(getComputedStyle(e).getPropertyValue("--aa-sf")) || 1), r = Math.max(1, Math.min(z.length, 8)) * n, i = t.bottom + n / 2;
		S.style.left = `${Math.max(0, Math.min(t.left, s.innerWidth - 4 * n))}px`, S.style.top = `${i + r <= s.innerHeight ? i : Math.max(0, t.top - n / 2 - r)}px`;
	}, Te = (e) => {
		if (!a.people) return;
		let t = ye(e.value, e.selectionStart ?? e.value.length);
		if (!t) {
			R();
			return;
		}
		B = e, _e = t;
		let n = ++be;
		Promise.resolve(a.people(t.query)).then((t) => {
			if (!_ && n === be && B && B === e) {
				z = t.slice(0, 8);
				for (let e of z) L.set(e.id, e);
				S || (S = o.createElement("div"), S.className = "aa-controls aa-menu aa-comments-people", S.setAttribute("role", "listbox"), S.setAttribute("aria-label", H("People to mention")), c.append(S)), ce = Math.min(ce, Math.max(0, z.length - 1)), Se(), we();
			}
		}).catch(() => R());
	}, Ee = (e) => S ? e.key === "ArrowDown" || e.key === "ArrowUp" ? (e.preventDefault(), ce = (ce + (e.key === "ArrowDown" ? 1 : z.length - 1)) % Math.max(1, z.length), Se(), !0) : (e.key === "Enter" || e.key === "Tab") && z.length ? (e.preventDefault(), xe(z[ce]), !0) : e.key === "Escape" && (e.preventDefault(), R(), !0) : !1, K = (e, t) => {
		let n = t.filter((e) => e.name.trim()).sort((e, t) => t.name.length - e.name.length), r = n.length ? new RegExp(n.map((e) => `@${e.name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).join("|"), "g") : null;
		if (!r) return [e];
		let a = [], o = 0;
		for (let t of e.matchAll(r)) {
			a.push(e.slice(o, t.index));
			let r = i("span", "aa-comment-mention");
			r.textContent = t[0];
			let s = n.find((e) => `@${e.name.trim()}` === t[0]);
			s && r.style.setProperty("--aa-person", Ce(s)), a.push(r), o = t.index + t[0].length;
		}
		return a.push(e.slice(o)), a;
	}, De = (e) => {
		e.style.height = "0px";
		let t = e.scrollHeight;
		e.style.height = t ? `${t}px` : "";
	}, Oe = (e, n) => {
		let r = i("form", "aa-composer");
		r.setAttribute("aria-label", n), a.me && r.append(Ta(a.me));
		let c = o.createElement("textarea"), l = ba(), u = `${n.charAt(0).toLowerCase()}${n.slice(1)}`, f = l ? H("Press space to speak, or {action}", { action: u }) : t.prompt ? H("Press space for AI, or {action}", { action: u }) : n;
		c.rows = 1, c.placeholder = f, c.setAttribute("aria-label", n), c.value = T.get(e) ?? "";
		let p = i("span", "aa-composer-field"), m = i("span", "aa-composer-backdrop");
		m.setAttribute("aria-hidden", "true"), p.append(m, c);
		let g = null, _ = () => {
			let e = c.value.includes("@") ? ve(c.value, [...L.values()]) : [];
			if (c.toggleAttribute("data-mentions", e.length > 0), g) {
				g.toggleAttribute("data-after", !!c.value);
				let t = c.value ? [] : [Object.assign(o.createElement("span"), {
					className: "aa-composer-listening",
					textContent: H("Listening…")
				})];
				m.replaceChildren(...K(c.value, e), g, ...t);
			} else e.length ? m.replaceChildren(...K(c.value, e), "​") : m.replaceChildren();
		};
		_(), c.disabled = w.has(e);
		let v = null, y = () => {
			v?.abort(), v = null, delete c.dataset.asking, c.removeAttribute("data-aa-glisten"), c.placeholder = f;
		}, b = async () => {
			let n = c.value.trim();
			if (!n || !t.prompt || !v) return;
			let r = e === "draft" ? null : d.find((t) => t.id === e), i = e === "draft" ? h?.quote ?? "" : r?.quote ?? "", a = r ? r.comments.map((e) => `${e.author.name}: ${e.body}`).join("\n\n") : "", { signal: s } = v, l = Object.assign(o.createElement("span"), {
				className: "aa-composer-thinking",
				textContent: H("Thinking…")
			});
			l.setAttribute("data-aa-glisten", ""), l.setAttribute("role", "status"), p.before(l), p.hidden = !0, c.readOnly = !0;
			try {
				let r = await t.prompt(n, {
					kind: "writing",
					signal: s,
					text: i,
					before: a,
					after: ""
				});
				if (s.aborted) return;
				let o = typeof r == "string" ? r : r.insert ?? r.document ?? "";
				c.value = o.trim(), T.set(e, c.value);
			} catch (t) {
				s.aborted || oe(e, t);
			} finally {
				l.remove(), p.hidden = !1, c.readOnly = !1, y(), _(), De(c), c.focus();
			}
		}, x = null, C = () => {
			let t = c.value, n = null;
			x = xa({
				lang: o.documentElement.lang || navigator.language,
				heard: (n) => {
					c.isConnected ? (c.value = `${t}${t && n ? " " : ""}${n}`, T.set(e, c.value), _(), De(c)) : x?.abort();
				},
				audio: () => {
					n?.followVoice?.();
				},
				end: (e) => {
					x = null, n?.stop(), g = null, delete c.dataset.listening, c.placeholder = e ?? f, _();
				}
			}), x && (c.dataset.listening = "", c.placeholder = "", g = Object.assign(o.createElement("span"), { className: "aa-prompt-caret" }), n = ya(g, s), _());
		};
		c.addEventListener("blur", () => x?.stop()), c.addEventListener("input", () => {
			T.set(e, c.value), _(), De(c), v || Te(c);
		}), c.addEventListener("keydown", (n) => {
			if (!Ee(n)) {
				if (x && !n.isComposing) {
					if (n.key === "Escape") {
						n.preventDefault(), n.stopPropagation(), x.abort();
						return;
					}
					if (n.key === "Enter" && !n.shiftKey) {
						n.preventDefault(), x.abort(), se(e, c.value);
						return;
					}
					x.stop();
				}
				if (n.key === "Backspace" && !n.isComposing && c.selectionStart === c.selectionEnd) {
					let e = c.selectionStart ?? 0, t = c.value.slice(0, e), r = ve(c.value, [...L.values()]).find((e) => t.endsWith(`@${e.name.trim()}`) || t.endsWith(`@${e.name.trim()} `));
					if (r) {
						n.preventDefault();
						let i = t.lastIndexOf(`@${r.name.trim()}`);
						c.setRangeText("", i, e, "end"), c.dispatchEvent(new Event("input", { bubbles: !0 }));
						return;
					}
				}
				n.key === " " && !c.value && l && !n.isComposing ? (n.preventDefault(), C()) : n.key === " " && !c.value && t.prompt && !v && !n.isComposing ? (n.preventDefault(), v = new AbortController(), c.dataset.asking = "", c.placeholder = H("Ask AI about these words")) : v ? (n.key === "Enter" && !n.shiftKey && !n.isComposing && (n.preventDefault(), b()), (n.key === "Escape" || n.key === "Backspace" && !c.value) && (n.preventDefault(), y(), c.value = "", T.delete(e))) : (n.key === "Enter" && !n.shiftKey && !n.isComposing && (n.preventDefault(), se(e, c.value)), n.key === "Escape" && (n.preventDefault(), ie()));
			}
		}), c.addEventListener("blur", () => setTimeout(() => {
			B === c && !S?.contains(o.activeElement) && R();
		}, 120));
		let E = Ca(e === "draft" ? "Comment" : "Reply", "send", () => se(e, c.value));
		return E.classList.add("aa-composer-send"), E.disabled = w.has(e), r.append(p, E), r.addEventListener("submit", (t) => {
			t.preventDefault(), se(e, c.value);
		}), s.requestAnimationFrame(() => De(c)), r;
	}, ke = (e, t) => {
		let n = o.createElement("div");
		n.className = t.internal ? "aa-comment-entry aa-comment-entry--internal" : "aa-comment-entry";
		let r = i("div", "aa-comment-meta"), c = i("span", "aa-comment-author");
		c.textContent = t.author.name;
		let l = i("time", "aa-comment-time");
		if (l.dateTime = new Date(t.createdAt).toISOString(), l.textContent = `${G(t.createdAt)}${E === t.id ? ` · ${H("Editing")}` : t.editedAt ? ` · ${H("Edited")}` : ""}`, l.title = new Date(t.createdAt).toLocaleString(V()), r.append(Ta(t.author), c, l), t.internal) {
			let e = o.createElement("span");
			e.className = "aa-comment-internal", e.textContent = H("Internal"), r.append(e);
		}
		if (a.me && t.author.id === a.me.id && a.edit && te() && !e.resolvedAt && E !== t.id && r.append(wa("Edit", () => {
			E = t.id, T.set(`edit:${t.id}`, t.body), Y(), x?.querySelector(`[data-edit="${t.id}"]`)?.focus();
		}, "aa-comment-edit")), n.append(r), E === t.id) {
			let e = o.createElement("textarea");
			e.className = "aa-comment-body aa-comment-editing", e.setAttribute("aria-label", H("Edit comment")), e.dataset.edit = t.id, e.value = T.get(`edit:${t.id}`) ?? t.body, e.rows = Math.max(1, e.value.split("\n").length);
			let r = () => {
				let n = e.value.trim();
				n && I(`edit:${t.id}`, () => a.edit(t.id, n), () => {
					E = null, T.delete(`edit:${t.id}`);
				});
			};
			e.addEventListener("input", () => {
				T.set(`edit:${t.id}`, e.value), De(e);
			}), e.addEventListener("keydown", (e) => {
				e.key === "Enter" && !e.shiftKey && !e.isComposing && (e.preventDefault(), r()), e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), E = null, T.delete(`edit:${t.id}`), Y());
			}), n.append(e), s.requestAnimationFrame(() => De(e));
		} else {
			let e = i("p", "aa-comment-body");
			e.append(...K(t.body, t.mentions ?? [])), n.append(e);
		}
		let u = !!a.react && te() && !e.resolvedAt;
		if (t.reactions?.length || u) {
			let e = i("div", "aa-comment-reactions");
			for (let n of t.reactions ?? []) {
				let r = o.createElement("button");
				r.type = "button", r.className = "aa-reaction", r.setAttribute("aria-pressed", String(n.reacted)), r.setAttribute("aria-label", `${n.emoji} ${n.count}${n.names.length ? `, from ${n.names.join(", ")}` : ""}${n.reacted ? ", you too" : ""}`), r.title = [...n.names, ...n.reacted ? ["You"] : []].join(", "), r.append(Object.assign(o.createElement("span"), {
					className: "aa-reaction-emoji",
					textContent: n.emoji
				}), Object.assign(o.createElement("span"), {
					className: "aa-reaction-count",
					textContent: String(n.count)
				})), r.disabled = !u, r.addEventListener("click", (e) => {
					e.preventDefault(), I(`react:${t.id}`, () => a.react(t.id, n.emoji));
				}), e.append(r);
			}
			if (u) {
				let n = Ca("Add reaction", "plus", () => Ae(n, t.id));
				n.classList.add("aa-reaction-add"), e.append(n);
			}
			n.append(e);
		}
		let d = C.get(`edit:${t.id}`) ?? C.get(`react:${t.id}`);
		if (d) {
			let e = o.createElement("p");
			e.className = "aa-comments-error", e.setAttribute("role", "alert"), e.textContent = d, n.append(e);
		}
		return n;
	}, q = null, J = () => {
		q?.remove(), q = null;
	}, Ae = (t, n) => {
		J(), q = o.createElement("div"), q.className = "aa-controls aa-menu aa-reaction-picker", q.setAttribute("role", "menu"), q.setAttribute("aria-label", "Reactions"), q.append(...le.map((e) => Oi(o, H("React with {emoji}", { emoji: e }), e, () => {
			J(), I(`react:${n}`, () => a.react(n, e));
		}))), q.addEventListener("keydown", (e) => {
			e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), J(), t.focus());
		}), c.append(q);
		let r = t.getBoundingClientRect(), i = 20 * (parseFloat(getComputedStyle(e).getPropertyValue("--aa-sf")) || 1), l = 8 * i, u = 2 * i, d = 4 * i / 20, f = t.closest(".aa-comments")?.getBoundingClientRect(), p = Math.max(0, f?.left ?? 0), m = Math.min(s.innerWidth, f?.right ?? s.innerWidth), h = r.right + d + l <= m ? r.right + d : r.left - d - l >= p ? r.left - d - l : null;
		q.style.left = `${h ?? Math.max(p, Math.min(r.left, m - l))}px`, q.style.top = `${h === null ? r.bottom + d + u <= s.innerHeight ? r.bottom + d : Math.max(0, r.top - d - u) : Math.max(0, Math.min(r.top, s.innerHeight - u))}px`, q.querySelector("button")?.focus();
	}, je = (e) => e.comments.length >= 3 && e.comments.reduce((e, t) => e + 1 + Math.ceil(t.body.length / 40), 0) >= 10, Me = (e, n) => {
		let r = i("article", "aa-thread");
		r.dataset.thread = e.id, r.toggleAttribute("data-open", n), r.toggleAttribute("data-resolved", !!e.resolvedAt), r.toggleAttribute("data-orphaned", e.orphaned), r.toggleAttribute("data-unread", !!e.unread);
		let s = o.createElement(l ? "button" : "div");
		s.className = "aa-thread-head", s instanceof HTMLButtonElement && (s.type = "button", s.setAttribute("aria-expanded", String(n)), s.addEventListener("click", () => {
			n ? (p = null, A(), Y()) : (re(e.id), t.selectRange(e.from, e.to));
		}));
		let c = !!l || e.orphaned;
		if (c) {
			let t = i("span", "aa-thread-quote");
			t.textContent = e.orphaned ? `“${e.quote}” is no longer in the text` : e.quote.replace(/\s+/g, " "), t.title = e.quote, s.append(t);
		}
		if (!n) {
			let t = o.createElement("span");
			t.className = "aa-thread-count", t.textContent = String(e.comments.length), s.append(t);
		}
		if (r.append(s), !n) return r;
		let u = i("div", "aa-thread-actions"), f = me(d).filter((e) => !e.orphaned && !e.resolvedAt), m = f.findIndex((t) => t.id === e.id);
		if (!l && f.length > 1 && m >= 0) {
			let e = (e) => {
				let n = f[(m + e + f.length) % f.length];
				t.selectRange(n.from), re(n.id);
			};
			u.append(Ca("Previous comment", "chevron-up", () => e(-1)), Ca("Next comment", "chevron-down", () => e(1)));
		}
		if (te() && (e.resolvedAt ? u.append(wa("Reopen", () => void I(`resolve:${e.id}`, () => a.resolve(e.id, !1)), "aa-thread-reopen")) : u.append(Ca("Resolve", "check", () => void I(`resolve:${e.id}`, () => a.resolve(e.id, !0), () => {
			l || ie();
		}))), a.remove && e.canDelete)) {
			let t = ee === e.id ? wa("Delete?", () => void I(`remove:${e.id}`, () => a.remove(e.id), () => {
				ee = null, p === e.id && (p = null);
			}), "aa-thread-delete") : Ca("Delete thread", "delete", () => {
				ee = e.id, Y();
			});
			u.append(t);
		}
		!c && je(e) && (s.append(Object.assign(o.createElement("span"), {
			className: "aa-thread-title",
			textContent: `${e.comments.length} comments`
		})), r.toggleAttribute("data-titled", !0)), s.append(u);
		for (let t of e.comments) r.append(ke(e, t));
		let h = C.get(`resolve:${e.id}`) ?? C.get(`remove:${e.id}`) ?? C.get(e.id);
		if (h) {
			let e = o.createElement("p");
			e.className = "aa-comments-error", e.setAttribute("role", "alert"), e.textContent = h, r.append(e);
		}
		if (e.resolvedAt) {
			let t = i("p", "aa-thread-resolved");
			t.textContent = e.resolvedBy ? H("Resolved by {name}.", { name: e.resolvedBy.name }) : H("Resolved."), r.append(t);
		} else te() && r.append(Oe(e.id, H("Reply")));
		return r;
	}, Ne = () => {
		let e = i("article", "aa-thread");
		e.dataset.thread = "draft", e.setAttribute("data-open", "");
		let t = Oe("draft", H("Add a comment"));
		if (l) {
			let n = i("div", "aa-thread-head"), r = i("span", "aa-thread-quote");
			r.textContent = h.quote.replace(/\s+/g, " "), n.append(r), e.append(n, t);
		} else e.append(t);
		let n = C.get("draft");
		if (n) {
			let t = o.createElement("p");
			t.className = "aa-comments-error", t.setAttribute("role", "alert"), t.textContent = n, e.append(t);
		}
		return e;
	}, Pe = () => x || (x = l ?? o.createElement("div"), x.classList.add("aa-comments"), x.dataset.mode = l ? "panel" : "popover", x.setAttribute("role", l ? "region" : "dialog"), x.setAttribute("aria-label", H("Comments")), x.addEventListener("keydown", (e) => {
		e.key === "Escape" && !S && !q && !E && (e.preventDefault(), ie());
	}), l || c.append(x), x), Y = () => {
		if (_) return;
		let e = x?.getRootNode()?.activeElement ?? o.activeElement, t = x?.contains(e) ? e : null, n = t?.closest("[data-thread]")?.dataset.thread, r = t instanceof HTMLTextAreaElement ? {
			start: t.selectionStart,
			end: t.selectionEnd,
			edit: t.dataset.edit
		} : null;
		if (l) {
			let e = Pe(), t = ge(d), n = i("div", "aa-comments-tabs");
			n.setAttribute("role", "tablist"), n.setAttribute("aria-label", H("Comments"));
			for (let [e, r, i] of [[
				"open",
				"Open",
				t.open
			], [
				"resolved",
				"Resolved",
				t.resolved
			]]) {
				let t = o.createElement("button");
				t.type = "button", t.setAttribute("role", "tab"), t.dataset.tab = e, t.setAttribute("aria-selected", String(D === e)), t.tabIndex = D === e ? 0 : -1, t.append(H(r), Object.assign(o.createElement("span"), {
					className: "aa-comments-tab-count",
					textContent: ` ${i}`
				})), t.addEventListener("click", () => {
					D !== e && (D = e, p && !O(k()) && (p = null), A(), Y());
				}), t.addEventListener("keydown", (t) => {
					(t.key === "ArrowLeft" || t.key === "ArrowRight") && (t.preventDefault(), n.querySelector(`[data-tab="${e === "open" ? "resolved" : "open"}"]`)?.click(), Y(), x?.querySelector(`[data-tab="${e === "open" ? "resolved" : "open"}"]`)?.focus());
				}), n.append(t);
			}
			let r = me(d).filter(O), a = [n];
			h && D === "open" && a.push(Ne());
			for (let e of r) a.push(Me(e, e.id === p));
			if (!r.length && !(h && D === "open")) {
				let e = o.createElement("p");
				e.className = "aa-comments-empty", e.textContent = H(D === "resolved" ? "Nothing resolved yet." : te() ? "Select words and press Comment to start a thread." : "No comments yet."), a.push(e);
			}
			e.replaceChildren(...a);
		} else {
			let e = k();
			if (!e && !h) {
				x?.remove(), x = null, R();
				return;
			}
			Pe().replaceChildren(h ? Ne() : Me(e, !0)), Fe();
		}
		if (n) {
			let e = x?.querySelector(r?.edit ? `[data-edit="${r.edit}"]` : `[data-thread="${n}"] .aa-composer textarea`);
			if (e && r) {
				e.focus({ preventScroll: !0 });
				try {
					e.setSelectionRange(r.start, r.end);
				} catch {}
			}
		}
	}, Fe = () => {
		if (v = 0, !x || l) return;
		let t = h ? "draft" : p, n = t ? j(t) : [], r = 20 * (parseFloat(getComputedStyle(e).getPropertyValue("--aa-sf")) || 1), i = Math.min(16 * r, s.innerWidth - 2 * r);
		x.style.width = `${i}px`;
		let a = n.length ? {
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
		})(), o = x.offsetHeight, c = Math.max(r, Math.min(a.left, s.innerWidth - i - r)), u = a.bottom + r / 2, d = u + o <= s.innerHeight - r / 2 || a.top - r / 2 - o < r / 2 ? u : a.top - r / 2 - o;
		x.style.left = `${c}px`, x.style.top = `${Math.max(r / 2, Math.min(d, s.innerHeight - o - r / 2))}px`;
	}, X = Hi(s, e, () => {
		!v && x && !l && (v = s.requestAnimationFrame(Fe));
	});
	o.addEventListener("pointerdown", (t) => {
		if (!x || l || !(t.target instanceof Node)) return;
		let n = (e) => !!e && t.composedPath().some((t) => t instanceof Node && e.contains(t));
		q && !n(q) && J();
		let r = t.composedPath().some((t) => t instanceof Element && t.hasAttribute("data-comment") && e.contains(t));
		n(x) || n(S) || n(q) || r || ie();
	}, {
		capture: !0,
		signal: r
	});
	let Ie = a.subscribe(M);
	return {
		open: re,
		start: ae,
		close: ie,
		changed: N,
		get threads() {
			return d;
		},
		destroy() {
			n.abort(), _ = !0, Ie(), clearTimeout(y), v && s.cancelAnimationFrame(v), X(), R(), J(), l ? (l.replaceChildren(), l.classList.remove("aa-comments")) : x?.remove(), x = null, t.decorate([]);
		}
	};
}
//#endregion
//#region src/nesting.ts
function Da(e, t) {
	let n = /* @__PURE__ */ new Set();
	function r(r, i) {
		r.classList.add("aa-columns"), r.setAttribute("data-aa-interactive", "");
		let a = at(i), o = [], s = () => {
			let e = st(a);
			r.dataset.source = e, r.dispatchEvent(new CustomEvent("aa-atom-change", {
				bubbles: !0,
				detail: { source: e }
			}));
		}, c = () => {
			o.forEach((e) => {
				n.delete(e), e.destroy();
			}), r.querySelectorAll(":scope > .aa-column").forEach((e) => e.remove()), r.style.setProperty("--aa-columns", String(a.length)), o = a.map((t, i) => {
				let c = document.createElement("div");
				c.className = "aa-column", r.append(c);
				let l;
				return l = e(c, t, (e) => {
					let t = l ? o.indexOf(l) : i;
					a[t < 0 ? i : t] = e, s();
				}), n.add(l), l;
			});
		}, l = (e) => {
			let { from: n, slot: i, swap: l } = e.detail, u = Array.from(r.querySelectorAll(":scope > .aa-column")), d = u.indexOf(e.target.closest(".aa-column"));
			if (d < 0 || !t().placing || t().readOnly) return;
			if (e.stopPropagation(), l !== void 0) {
				if (l === d || a[l] === void 0 || St(a[d]).length !== 1) return;
				let e = [...a];
				[e[d], e[l]] = [e[l], e[d]], a = e;
				let t = u[d], n = u[l], r = n.getBoundingClientRect(), i = document.createComment("");
				t.replaceWith(i), n.replaceWith(t), i.replaceWith(n), [o[d], o[l]] = [o[l], o[d]];
				let c = n.getBoundingClientRect(), f = r.left - c.left, p = r.top - c.top;
				(f || p) && !matchMedia("(prefers-reduced-motion: reduce)").matches && n.animate?.([{ translate: `${f}px ${p}px` }, { translate: "none" }], {
					duration: 200,
					easing: "cubic-bezier(0.2, 0, 0, 1)"
				}), s();
				return;
			}
			let f = St(a[d]), p = f[n];
			if (!p || i === void 0) return;
			let m = Ct(f.filter((e, t) => t !== n)), h = m.trim() ? a.map((e, t) => t === d ? m : e) : a.filter((e, t) => t !== d);
			h.splice(Math.max(0, Math.min(i, h.length)), 0, p.source), a = h, c(), s();
		};
		return r.addEventListener("aa-column-carry", l), c(), () => {
			r.removeEventListener("aa-column-carry", l), o.forEach((e) => {
				n.delete(e), e.destroy();
			});
		};
	}
	function i(r, i) {
		r.classList.add("aa-tabs"), r.setAttribute("data-aa-interactive", "");
		let a = ht(i), o = 0, s = null, c = document.createElement("div");
		c.className = "aa-tabs-row", c.setAttribute("role", "tablist");
		let l = document.createElement("div");
		l.className = "aa-tab-panel", l.setAttribute("role", "tabpanel"), r.append(c, l);
		let u = () => {
			let e = gt(a);
			r.dataset.source = e, r.dispatchEvent(new CustomEvent("aa-atom-change", {
				bubbles: !0,
				detail: { source: e }
			}));
		}, d = () => {
			if (c.replaceChildren(...a.map((e, n) => {
				let r = document.createElement("button");
				if (r.type = "button", r.className = "aa-tab", r.setAttribute("role", "tab"), r.setAttribute("aria-selected", String(n === o)), r.tabIndex = n === o ? 0 : -1, r.dataset.tab = String(n), e.icon) {
					let t = document.createElement("span");
					t.className = "aa-tab-icon", t.textContent = e.icon, r.append(t);
				}
				let i = document.createElement("span");
				return i.className = "aa-tab-name", i.textContent = e.name || H("Tab {number}", { number: n + 1 }), r.append(i), r.addEventListener("pointerdown", (e) => {
					n === o && !t().readOnly && e.preventDefault();
				}), r.addEventListener("click", (e) => {
					e.preventDefault(), e.stopPropagation(), n === o && !t().readOnly ? f(n, r) : p(n, !0);
				}), r;
			})), !t().readOnly) {
				let e = document.createElement("button");
				e.type = "button", e.className = "aa-tab aa-tab-add", e.setAttribute("aria-label", H("Add tab")), e.dataset.tooltip = H("Add tab"), e.append(Sr("plus")), e.addEventListener("pointerdown", (e) => e.preventDefault()), e.addEventListener("click", (e) => {
					e.preventDefault(), e.stopPropagation(), a = [...a, {
						name: H("Tab {number}", { number: a.length + 1 }),
						content: ""
					}], o = a.length - 1, u(), m();
					let t = c.querySelector(`[data-tab="${o}"]`);
					t && f(o, t);
				}), c.append(e);
			}
		}, f = (e, t) => {
			let n = t.querySelector(".aa-tab-name");
			if (!n) return;
			let r = document.createElement("span");
			r.className = t.className, r.dataset.tab = String(e), r.append(...Array.from(t.childNodes)), t.replaceWith(r), n.textContent = a[e].name;
			try {
				n.contentEditable = "plaintext-only";
			} catch {
				n.contentEditable = "true";
			}
			n.setAttribute("role", "textbox"), n.setAttribute("aria-label", H("Tab name"));
			let i = !1, o = (t) => {
				if (i) return;
				i = !0;
				let r = (n.textContent ?? "").replace(/\s+/g, " ").trim();
				t && r !== a[e].name && (a = a.map((t, n) => n === e ? {
					...t,
					name: r
				} : t), u()), d(), c.querySelector(`[data-tab="${e}"]`)?.focus({ preventScroll: !0 });
			};
			for (let e of [
				"beforeinput",
				"input",
				"paste",
				"cut",
				"copy",
				"pointerdown",
				"click"
			]) n.addEventListener(e, (e) => e.stopPropagation());
			n.addEventListener("keydown", (e) => {
				e.stopPropagation(), e.key === "Enter" && (e.preventDefault(), o(!0)), e.key === "Escape" && (e.preventDefault(), o(!1));
			}), n.addEventListener("blur", () => o(!0)), n.focus({ preventScroll: !0 });
			let s = document.getSelection(), l = document.createRange();
			l.selectNodeContents(n), s?.removeAllRanges(), s?.addRange(l);
		}, p = (t, r = !1) => {
			o = Math.max(0, Math.min(a.length - 1, t)), s &&= (n.delete(s), s.destroy(), null), l.replaceChildren(), d(), s = e(l, a[o]?.content ?? "", (e) => {
				a = a.map((t, n) => n === o ? {
					...t,
					content: e
				} : t), u();
			}), n.add(s), r && c.querySelector(`[data-tab="${o}"]`)?.focus({ preventScroll: !0 });
		}, m = () => p(o);
		return c.addEventListener("keydown", (e) => {
			let n = e.target.closest(".aa-tab[data-tab]");
			if (!n || !c.contains(n)) return;
			let r = Number(n.dataset.tab);
			e.key === "ArrowRight" || e.key === "ArrowLeft" ? (e.preventDefault(), e.stopPropagation(), p((r + (e.key === "ArrowRight" ? 1 : a.length - 1)) % a.length, !0)) : (e.key === "Enter" || e.key === "F2") && !t().readOnly ? (e.preventDefault(), e.stopPropagation(), f(r, n)) : (e.key === "Delete" || e.key === "Backspace") && !t().readOnly && a.length > 1 && (e.preventDefault(), e.stopPropagation(), a = a.filter((e, t) => t !== r), o = Math.min(r, a.length - 1), u(), p(o, !0));
		}), m(), () => {
			s &&= (n.delete(s), s.destroy(), null);
		};
	}
	return {
		columnEditors: n,
		drawColumns: r,
		drawTabs: i
	};
}
//#endregion
//#region src/editor.ts
function Oa(e, t, n) {
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
var ka = si(() => import("./aa-assist.js"));
ka.get;
var Aa = typeof navigator < "u" && /Mac|iPhone|iPad/.test(navigator.platform);
function ja(e, t = {}) {
	return aa(e), t.sourceComments || q(t.value ?? "") ? Fe(e, t, Ma) : Ma(e, t);
}
function Ma(e, t = {}) {
	let n = new AbortController(), { signal: r } = n, i = e.ownerDocument, a = i.defaultView, o = zn(t.value ?? ""), s = !!t.readOnly, c = t.reordering !== !1, l = t.placing !== !1, u = t.placeholder ?? "", d = t.menus === !1 ? "" : t.blockPlaceholder ?? "", f = !1, p = !1, m = null, h = !1, g = [], _ = /* @__PURE__ */ new Map(), v = () => {}, y = () => {}, b = 0, x = null, S = /* @__PURE__ */ new Map(), C = [
		...t.atoms ?? [oi],
		...t.partials ? [fa(() => !s)] : [],
		{
			...At,
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
			draw: (e, t) => ee(e, t),
			insert: {
				label: "Columns",
				icon: "column",
				keywords: "side by side layout pictures images",
				source: st(["", ""])
			}
		},
		{
			name: "toc",
			match: () => 0,
			draw: (e) => w(e),
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
			draw: (e, t) => D(e, t),
			insert: {
				label: "Tabs",
				icon: "tabs",
				keywords: "tab pages sections panels",
				source: gt([{
					name: H("Tab {number}", { number: 1 }),
					content: ""
				}, {
					name: H("Tab {number}", { number: 2 }),
					content: ""
				}])
			}
		}
	];
	function w(t) {
		let n = ma(t, () => o, e, (e) => {
			let t = P()[e];
			if (t && (t.scrollIntoView({
				block: "start",
				behavior: "instant"
			}), s && (t.tabIndex = -1), t.focus({ preventScroll: !0 }), !s)) {
				let t = {
					block: e,
					offset: o[e].prefix
				};
				U(t), W({
					anchor: t,
					focus: t
				});
			}
		});
		return S.set(t, n), () => {
			S.delete(t);
		};
	}
	let T = () => {
		for (let e of S.values()) e();
	}, { columnEditors: E, drawColumns: ee, drawTabs: D } = Da((e, n, r) => ja(e, {
		value: n,
		readOnly: s,
		reordering: c,
		placing: l,
		atoms: t.atoms,
		partials: t.partials,
		drawEquation: t.drawEquation,
		blockPlaceholder: "",
		onChange: r
	}), () => ({
		readOnly: s,
		placing: l
	})), O = /* @__PURE__ */ new Map(), te = (e, t) => {
		let n = wr(e, t, i), r = C.find((t) => t.name === e);
		return r?.draw ? O.set(n, r.draw(n, t)) : n.textContent = t, n.querySelectorAll(".aa-caption").forEach((e) => e.contentEditable = s ? "false" : "true"), n;
	}, k = (t = !1) => {
		for (let [n, r] of O) (t || !e.contains(n)) && (O.delete(n), r?.());
	}, A = (e, t, n) => {
		e.dataset.readonly = String(s), zr(e, t, n, C, te, j(t));
	}, j = (e) => {
		if (!g.length) return [];
		let t = o.indexOf(e), n = t < 0 ? 0 : me({
			block: t,
			offset: 0
		});
		return g.map((e) => ({
			...e,
			from: e.from - n,
			to: e.to - n
		}));
	}, ne = new hr({
		blocks: o,
		anchor: {
			block: 0,
			offset: 0
		},
		focus: {
			block: 0,
			offset: 0
		}
	});
	e.classList.add("aa"), e.toggleAttribute("data-block-hints", !!d), H("Heading") !== "Heading" && e.style.setProperty("--aa-heading-word", JSON.stringify(H("Heading"))), e.setAttribute("role", "textbox"), e.setAttribute("aria-multiline", "true");
	let M = () => {
		e.setAttribute("aria-readonly", String(s)), u ? e.setAttribute("aria-placeholder", u) : e.removeAttribute("aria-placeholder");
	};
	M();
	let N = null, P = () => N ??= Array.from(e.children), re = new a.MutationObserver(() => {
		N = null;
	});
	re.observe(e, { childList: !0 });
	let F = (e, t) => {
		let n = i.createElement("div");
		return n.contentEditable = s ? "false" : "true", t && n.append(...Array.from(t.querySelectorAll(":scope > .aa-atom[data-aa-interactive]"))), A(n, e, null), n;
	}, ie = (e) => {
		if (!e || !t.prompt || s || m || f || Hn(e.anchor, e.focus) !== 0) return !1;
		let n = o[e.focus.block];
		return !n || e.focus.offset !== n.source.length ? !1 : n.kind === "bullet" && n.source.length === n.prefix || (n.kind === "paragraph" || n.kind === "bullet") && /[^\s][.!?]["”’)]? $/.test(n.source);
	}, ae = null, oe = null, I = (t) => {
		t === void 0 && (t = V());
		let n = d && ie(t) ? t.focus.block : -1, r = t && !m && !s && Hn(t.anchor, t.focus) === 0 ? t.focus.block : -1, i = o.length === 1 ? 0 : r, a = o[i], c = !a || a.source ? "" : o.length === 1 && u ? u : i === r && a.kind === "paragraph" ? d : "", l = c ? e.children[i] : void 0;
		ae && ae !== l && delete ae.dataset.placeholder, ae = l ?? null, l && l.dataset.placeholder !== c && (l.dataset.placeholder = c);
		let f = n >= 0 ? e.children[n] : void 0;
		oe && oe !== f && delete oe.dataset.hint, oe = f ?? null, f && (f.dataset.hint = H("Press space for AI"));
	}, L = (e, t) => {
		let n = P();
		for (let r = e; r <= t && r < n.length; r++) {
			let e = o[r - 1]?.kind ?? "";
			n[r].dataset.after !== e && (n[r].dataset.after = e);
		}
	}, se = () => {
		e.replaceChildren(...o.map((e) => F(e))), N = null, L(0, o.length - 1), T(), I(), k();
	}, R = (t) => {
		let n = o, r = P(), a = 0;
		for (; a < n.length && a < t.length && n[a] === t[a];) a++;
		let s = n.length, c = t.length;
		for (; s > a && c > a && n[s - 1] === t[c - 1];) s--, c--;
		o = t;
		let l = s - a === c - a, u = l, d = i.getSelection(), f = i.activeElement, p = l && f && e.contains(f) && f.closest(".aa-atom") ? {
			focused: f,
			...d?.rangeCount ? {
				anchorNode: d.anchorNode,
				anchorOffset: d.anchorOffset,
				focusNode: d.focusNode,
				focusOffset: d.focusOffset
			} : {}
		} : null;
		if (l) {
			let i = n.slice(a, s), o = /* @__PURE__ */ new Set(), l = t.slice(a, c).map((e) => {
				let t = i.findIndex((t, n) => t === e && !o.has(n));
				return t >= 0 && o.add(t), t;
			}), d = i.map((e, t) => t).filter((e) => !o.has(e)), f = l.map((e) => e >= 0 ? e : d.shift());
			if (f.some((e, t) => e !== t)) {
				let t = r[s] ?? null;
				for (let n of f) e.insertBefore(r[a + n], t);
				N = null, u = !1;
			}
			for (let e = 0; e < c - a; e++) {
				let n = r[a + f[e]], o = i[f[e]], s = t[a + e];
				(g.length || !Rr(n, o, s, C)) && (u = !1, s.kind !== "table" && o.kind !== "table" ? A(n, s, null) : (n.replaceWith(F(s, n)), N = null));
			}
		} else {
			let n = t.slice(a, c).map((e) => F(e)), i = r[s] ?? null;
			for (let e = a; e < s; e++) r[e].remove();
			for (let t of n) e.insertBefore(t, i);
			N = null;
		}
		if (L(a, c), p && e.contains(p.focused) && i.activeElement !== p.focused && (p.focused.focus({ preventScroll: !0 }), p.anchorNode && p.focusNode && p.focused.contains(p.focusNode))) try {
			d.setBaseAndExtent(p.anchorNode, p.anchorOffset, p.focusNode, p.focusOffset);
		} catch {}
		return T(), I(), k(), yt?.draw(), u;
	}, z = (t) => {
		let n = (t?.nodeType === 1 ? t : t?.parentElement ?? null)?.closest(".aa-block");
		return !n || n.parentElement !== e ? -1 : P().indexOf(n);
	}, ce = () => !!i.activeElement?.closest?.(".aa-caption, [data-aa-interactive]"), B = null, V = () => {
		if (ce()) return null;
		if (m) {
			let e = Math.min(m.anchor, m.focus), t = Math.max(m.anchor, m.focus);
			return {
				anchor: {
					block: e,
					offset: 0
				},
				focus: {
					block: t,
					offset: o[t].source.length
				}
			};
		}
		let e = a.getSelection();
		if (!e || !e.rangeCount || !e.anchorNode || !e.focusNode) return null;
		let { anchorNode: t, anchorOffset: n, focusNode: r, focusOffset: i } = e;
		if (B && B.blocks === o && B.anchorNode === t && B.anchorOffset === n && B.focusNode === r && B.focusOffset === i) return B.read;
		let s = z(t), c = z(r);
		if (s < 0 || c < 0) return null;
		let l = P(), u = {
			anchor: {
				block: s,
				offset: Gr(l[s], t, n)
			},
			focus: {
				block: c,
				offset: Gr(l[c], r, i)
			}
		};
		return B = {
			blocks: o,
			anchorNode: t,
			anchorOffset: n,
			focusNode: r,
			focusOffset: i,
			read: u
		}, u;
	}, le = !1, U = (t, n = t) => {
		let r = P(), i = Kr(r[t.block], Math.min(t.offset, o[t.block].source.length)), s = Kr(r[n.block], Math.min(n.offset, o[n.block].source.length)), c = a.getSelection();
		if (c) {
			le = !0;
			try {
				t.block === n.block && qi(e) && (Ji(e), r[n.block].focus({ preventScroll: !0 })), Yi(e, c, i, s);
			} finally {
				le = !1;
			}
		}
	}, ue = (e, t) => {
		if (!t) return null;
		let [n, r] = Un(t.anchor, t.focus);
		return e < n.block || e > r.block ? null : {
			from: e === n.block ? n.offset : 0,
			to: e === r.block ? r.offset : o[e].source.length
		};
	}, de = /* @__PURE__ */ new Set(), W = (e) => {
		if (e === void 0 && (e = V()), f) return;
		let t = P(), n = !1, r = (r) => {
			let i = t[r], a = o[r], s = ue(r, e);
			s ? de.add(i) : de.delete(i), i.dataset.reveal === jr(a, s, C) ? i.hasAttribute("data-active") !== !!s && i.toggleAttribute("data-active", !!s) : (A(i, a, s), n = !0);
		}, [i, a] = e ? Un(e.anchor, e.focus) : [], s = i?.block ?? 0, c = a?.block ?? -1;
		for (let e of [...de]) {
			let n = t.indexOf(e);
			n < 0 ? de.delete(e) : (n < s || n > c) && r(n);
		}
		for (let e = s; e <= c; e++) r(e);
		n && (k(), e && U(e.anchor, e.focus)), fe(e);
	}, fe = (e) => {
		if (!e || s || m || Hn(e.anchor, e.focus) !== 0) return;
		let t = e.focus.block;
		Tt(o[t], C) && P()[t]?.querySelector("[data-aa-interactive]")?.focus({ preventScroll: !0 });
	}, pe = (e) => o[e].kind === "bullet" && o[e + 1]?.kind === "bullet" ? 1 : 2, me = (e) => {
		let t = 0;
		for (let n = 0; n < e.block; n++) t += o[n].source.length + pe(n);
		return t + e.offset;
	}, he = (e) => {
		let t = 0;
		for (let n = 0; n < o.length; n++) {
			let r = t + o[n].source.length;
			if (e <= r || n === o.length - 1) return {
				block: n,
				offset: Math.max(0, Math.min(e - t, o[n].source.length))
			};
			if (e < r + pe(n)) return {
				block: n,
				offset: o[n].source.length
			};
			t = r + pe(n);
		}
		return {
			block: 0,
			offset: 0
		};
	}, ge = (e, t) => ({
		blocks: o,
		anchor: e,
		focus: t
	}), _e = (n, r, i) => {
		ne.record(ge(n, r), i), t.onChange?.(Q(o)), e.dispatchEvent(new Event("aa-change"));
	}, ve = (e, t) => {
		et(), R(dr(t));
		let n = {
			block: e,
			offset: 0
		};
		_e(n, n, "edit");
	}, ye = (e) => {
		e && G(e.blocks, e.caret, e.caret, "edit");
	}, G = (t, n, r, a) => {
		let s = o, c = e.contains(i.activeElement);
		et();
		let l = dr(t), u = (e) => ({
			...e,
			offset: Math.max(0, e.offset + l[e.block].prefix - t[e.block].prefix)
		});
		n = u(n), r = u(r);
		let d = !R(l), f = d ? null : V();
		(d || !f || Hn(f.anchor, n) !== 0 || Hn(f.focus, r) !== 0) && U(n, r), W({
			anchor: n,
			focus: r
		}), I({
			anchor: n,
			focus: r
		}), d && Ze(c), b || (_e(n, r, a), J?.written(s, a !== "edit"));
	}, be = (n) => {
		let r = e.contains(i.activeElement), a = !!i.activeElement?.closest?.("[data-aa-interactive]");
		et(), R(n.blocks), a ? W(null) : (U(n.anchor, n.focus), W({
			anchor: n.anchor,
			focus: n.focus
		}), Ze(r)), t.onChange?.(Q(o)), e.dispatchEvent(new Event("aa-change"));
	}, xe = () => {
		if (s) return !1;
		if (J?.undoing(), x) return x.undo();
		let e = ne.undo();
		return e && be(e), !!e;
	}, Se = () => {
		if (s) return !1;
		if (J?.stop(), x) return x.redo();
		let e = ne.redo();
		return e && be(e), !!e;
	}, Ce = null, we = (e, t, n) => {
		n && Hn(e, t) === 0 && (Ce = {
			...n,
			block: o[t.block],
			offset: t.offset
		});
	}, Te = (e) => {
		let t = P().indexOf(e);
		if (t < 0) return;
		let n = Ur(e), r = n.replace(/^\[\] /, "- [ ] "), i = o[t];
		if (r === i.source) return;
		let a = r.length < i.source.length ? "delete" : "type", s = V(), c = Ce?.block === i ? Ce : null;
		Ce = null;
		let l = Oa(i.source, r, s?.focus.block === t ? s.focus.offset : r.length), u = r === n ? jn(i, l.from, l.to, l.text, C, c && l.from === c.offset && l.to === c.offset ? c : null) : null;
		u && (r = u.source);
		let { blocks: d, caret: f } = qn(o, t, r, u?.caret);
		if (u) {
			G(d, f, f, a), we(f, f, u.carry);
			return;
		}
		let p = (e) => e.block === t ? Ee(d, t, f, r, e.offset) : {
			...e,
			block: e.block + (d.length - o.length) * +(e.block > t)
		}, m = (e) => r !== n && e.block === t ? {
			...e,
			offset: e.offset + r.length - n.length
		} : e, h = s ? p(m(s.anchor)) : f, g = s ? p(m(s.focus)) : f;
		G(d, h, g, a);
	}, Ee = (e, t, n, r, i) => {
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
	}, K = (e, t, n = "edit") => {
		let { blocks: r, caret: i, carry: a } = $(o, e.anchor, e.focus, t, C);
		G(r, i, i, n), we(i, i, a);
	}, De = /* @__PURE__ */ new Set(), Oe = (n, r, a, s) => {
		let c = V(), l = e.contains(i.activeElement), { blocks: u } = $(o, {
			block: n,
			offset: 0
		}, {
			block: n,
			offset: o[n].source.length
		}, r);
		if (u.length !== o.length) return;
		let d = (e) => e.block === n ? {
			block: n,
			offset: a(e.offset)
		} : e, f = {
			block: n,
			offset: u[n].source.length
		}, p = c ? d(c.anchor) : f, m = c ? d(c.focus) : f;
		o = u, A(P()[n], o[n], ue(n, c && {
			anchor: p,
			focus: m
		})), T(), k(), c && Math.min(c.anchor.block, c.focus.block) <= n && Math.max(c.anchor.block, c.focus.block) >= n && l && U(p, m);
		let h = ta(P()[n], s);
		De.add(h), setTimeout(() => De.delete(h), 2e3), ne.record(ge(p, m), "edit"), t.onChange?.(Q(o)), e.dispatchEvent(new CustomEvent("aa-change", { detail: { correction: !0 } }));
	}, ke = e.getAttribute("spellcheck"), q = (t) => {
		t ? e.setAttribute("spellcheck", "false") : ke === null ? e.removeAttribute("spellcheck") : e.setAttribute("spellcheck", ke);
	};
	(t.prompt || t.correct) && ka.get();
	let J = null, Ae = !!t.correct && t.correcting !== !1;
	Ae && q(!0), t.correct && ka.when(({ createCorrection: e }) => {
		p || (J = e({
			blocks: () => o,
			atoms: C,
			selection: V,
			busy: () => s || f || p || b > 0,
			apply: Oe,
			value: () => Q(o)
		}, t.correct, Ae));
	});
	let je = (e) => {
		let t = {
			block: e,
			offset: 0
		};
		G([
			...o.slice(0, e),
			{
				kind: "paragraph",
				source: "",
				prefix: 0
			},
			...o.slice(e + 1)
		], t, t, "edit");
	}, Me = (e) => {
		let [t, n] = Un(e.anchor, e.focus);
		if (t.block !== n.block || o[t.block].kind !== "table") return !1;
		let r = X(o[t.block].source).flat();
		return !r.length || t.offset > r[0].from || n.offset < r.at(-1).to ? !1 : (je(t.block), !0);
	}, Pe = (e, t) => {
		if (Hn(e.anchor, e.focus) !== 0) return !1;
		let { block: n, offset: r } = e.focus, i = o[n].source, a = Zt(o[n], C).find((e) => e.kind !== "atom" || !e.to ? !1 : t === "forward" ? e.from === r : e.to === r || e.to === r - 1 && i[e.to] === " " && C.find((t) => t.name === e.atom)?.tag);
		return a ? (K({
			anchor: {
				block: n,
				offset: a.from
			},
			focus: {
				block: n,
				offset: t === "forward" ? a.to : r
			}
		}, ""), !0) : !1;
	}, Y = (e, t) => {
		let [n, r] = Un(e.anchor, e.focus);
		if (n.block !== r.block || n.offset !== r.offset) return !1;
		let i = o[n.block];
		if (i.kind === "table") {
			let e = X(i.source), r = e.flat().find((e) => n.offset >= e.from && n.offset <= e.to);
			if (!r || n.offset !== (t === "backward" ? r.from : r.to)) return !1;
			let a = (e) => e.every((e) => !e.text.trim()), s = e.findIndex((e) => e.includes(r));
			if (e.every(a)) je(n.block);
			else if (s > 0 && a(e[s])) {
				let e = We(i, "delete-row", s, 0), t = $(o, {
					block: n.block,
					offset: 0
				}, {
					block: n.block,
					offset: i.source.length
				}, e), r = {
					block: n.block,
					offset: X(e)[s - 1].at(-1).to
				};
				G(t.blocks, r, r, "edit");
			}
			return !0;
		}
		let a = mn(i) ? Sn(i, C) : {
			start: 0,
			end: i.source.length
		};
		if (t === "backward") {
			if (n.offset <= Math.max(i.prefix, a.start)) {
				let e = Zn(o, n.block);
				if (e) return G(e.blocks, e.caret, e.caret, "edit"), !0;
			}
			return n.offset > a.start ? !1 : (ye(Qn(o, n.block, C)), !0);
		}
		return n.offset < a.end ? !1 : (ye($n(o, n.block, C)), !0);
	}, Fe = (e) => {
		if (p) return;
		if (s) {
			e.preventDefault();
			return;
		}
		if (e.target.closest?.(".aa-caption")) return;
		let n = e.inputType;
		if (n === "historyUndo") {
			e.preventDefault(), xe();
			return;
		}
		if (n === "historyRedo") {
			e.preventDefault(), Se();
			return;
		}
		if (f || e.isComposing) return;
		let r = V();
		if (!r) return;
		if (m && n.startsWith("insert")) {
			e.preventDefault(), K(r, e.data ?? "", "edit");
			return;
		}
		let [i, a] = Un(r.anchor, r.focus), c = i.block !== a.block, l = !c && i.offset === a.offset, u = o[i.block];
		if (n === "insertText" && (e.data === " " || e.data === "\xA0") && t.prompt && l && Et(r)) e.preventDefault();
		else {
			if (u.kind === "table") {
				let t = Ie(u.source, i.offset);
				if (t && l && (n === "deleteContentBackward" && i.offset === t.from || n === "deleteContentForward" && i.offset === t.to)) {
					e.preventDefault();
					return;
				}
				if (!l && !c && n === "insertText" && !Le(u.source, i.offset, a.offset)) {
					e.preventDefault(), K(r, e.data ?? "");
					return;
				}
			}
			switch (n) {
				case "insertParagraph":
				case "insertLineBreak":
					e.preventDefault(), Ge(r);
					return;
				case "insertFromPaste": {
					e.preventDefault();
					let t = e.dataTransfer?.getData("text/plain") ?? "";
					t && K(r, t.replace(/\r\n?/g, "\n"));
					return;
				}
				case "insertFromDrop":
					e.preventDefault();
					return;
				case "deleteContentBackward":
				case "deleteContentForward": {
					if (!l) {
						e.preventDefault(), Me(r) || K(r, "");
						return;
					}
					let t = n === "deleteContentBackward" ? "backward" : "forward";
					(Pe(r, t) || Y(r, t)) && e.preventDefault();
					return;
				}
				case "deleteByCut":
					e.preventDefault();
					return;
				case "formatBold":
					e.preventDefault(), Ke(r, "**");
					return;
				case "formatItalic":
					e.preventDefault(), Ke(r, "*");
					return;
				case "formatStrikeThrough":
					e.preventDefault(), Ke(r, "~~");
					return;
				default:
					if (!c) return;
					e.preventDefault(), n.startsWith("insert") ? K(r, e.data ?? "", "type") : n.startsWith("delete") && K(r, "");
			}
		}
	}, Be = (t) => {
		if (p || s || f || "isComposing" in t && t.isComposing) return;
		let n = t.target.closest?.(".aa-caption");
		if (n) {
			let e = n.closest(".aa-atom"), t = e.closest(".aa-block"), r = P().indexOf(t), i = (e.dataset.source ?? "").replace(/^!\[[^\]]*\]/, `![${(n.textContent ?? "").replace(/\]/g, "").replace(/\n/g, " ")}]`);
			e.dataset.source = i;
			let a = [...o];
			a[r] = {
				...o[r],
				source: Ur(t)
			}, o = a, T();
			let s = {
				block: r,
				offset: Gr(t, e, 1)
			};
			_e(s, s, "type");
			return;
		}
		let r = t.target?.closest?.(".aa-block");
		r && r.parentElement === e && Te(r);
	}, Ge = (e, t = !1) => {
		if (o[e.focus.block].kind === "table") {
			let n = e.focus.block, r = o[n], i = X(r.source), a = i.at(-1)?.at(-1);
			if (!t && Hn(e.anchor, e.focus) === 0 && a && e.focus.offset >= a.from && e.focus.offset <= a.to) {
				let e = We(r, "add-row", i.length - 1, 0), t = $(o, {
					block: n,
					offset: 0
				}, {
					block: n,
					offset: r.source.length
				}, e), a = {
					block: n,
					offset: X(e).at(-1)[0].from
				};
				G(t.blocks, a, a, "edit");
				return;
			}
			let s = [
				...o.slice(0, n + 1),
				{
					kind: "paragraph",
					source: "",
					prefix: 0
				},
				...o.slice(n + 1)
			], c = {
				block: n + 1,
				offset: 0
			};
			G(s, c, c, "edit");
			return;
		}
		if (o[e.focus.block].kind === "callout" && !t) {
			K(e, "\n> ");
			return;
		}
		if (t) {
			let t = bt(o[e.focus.block]);
			t && K(e, t);
			return;
		}
		let [n, r] = Un(e.anchor, e.focus), i = o, a = n;
		Hn(n, r) !== 0 && ({blocks: i, caret: a} = $(o, n, r, "", C));
		let s = Xn(i, a, C);
		G(s.blocks, s.caret, s.caret, "edit");
	}, Ke = (e, t, n = t) => {
		let r = fn(t, n);
		if (r && t !== "[" && Hn(e.anchor, e.focus) === 0) {
			let { block: t, offset: n } = e.focus, i = Ce?.block === o[t] && Ce.offset === n ? Ce : null;
			if (i?.add.some((e) => e.key === r.key) || i?.remove.includes(r.key)) {
				Ce = null;
				return;
			}
			Ce = {
				add: [...i?.add ?? [], ...Rn(o[t], n, r.key, C) ? [] : [r]],
				remove: [...i?.remove ?? [], ...Rn(o[t], n, r.key, C) ? [r.key] : []],
				back: 0,
				block: o[t],
				offset: n
			};
			return;
		}
		let i = er(o, e.anchor, e.focus, t, n, C);
		i && G(i.blocks, i.anchor, i.focus, "edit");
	}, qe = (e, t) => {
		t === "link" ? Je(e) : t === "underline" ? Ke(e, "<u>", "</u>") : Ke(e, {
			bold: "**",
			italic: "*",
			strike: "~~",
			code: "`",
			equation: "$",
			highlight: "=="
		}[t]);
	}, Je = (t) => {
		let [n, r] = Un(t.anchor, t.focus);
		if (n.block !== r.block || o[n.block].kind === "table" && !Le(o[n.block].source, n.offset, r.offset)) return;
		let i = n.offset, a = r.offset, s = o[n.block].source.slice(i, a), c = "", l = Ht(o[n.block].source, n.offset, r.offset);
		l && (i = l.from, a = l.to, s = l.words, c = l.href), e.dispatchEvent(new CustomEvent("aa-link-request", { detail: {
			start: me({
				block: n.block,
				offset: i
			}),
			end: me({
				block: n.block,
				offset: a
			}),
			text: s,
			url: c
		} }));
	}, Ye = () => {
		let e = a.getSelection();
		if (!e?.rangeCount) return null;
		let t = e.getRangeAt(0), n = t.getClientRects();
		if (n.length) return n[n.length - 1];
		let r = t.getBoundingClientRect();
		if (r.height) return r;
		let o = t.startContainer;
		if (o.nodeType === Node.TEXT_NODE && t.startOffset > 0) {
			let e = i.createRange();
			e.setStart(o, t.startOffset - 1), e.setEnd(o, t.startOffset);
			let n = e.getClientRects();
			if (n.length) return n[n.length - 1];
		}
		return (o?.nodeType === 1 ? o : o.parentElement)?.getBoundingClientRect() ?? null;
	}, Xe = (e, t, n, r) => e < n ? e - n : t > r ? Math.min(t - r, e - n) : 0, Ze = (t = e.contains(i.activeElement)) => {
		if (!t) return;
		let n = Ye(), r = a.getSelection()?.focusNode;
		if (!n || !r || !e.contains(r) || !n.width && !n.height && !n.top && !n.left) return;
		let { top: o, bottom: s, left: c, right: l } = n;
		for (let e = r?.nodeType === 1 ? r : r.parentElement; e && e !== i.body && e !== i.documentElement; e = e.parentElement) {
			let t = getComputedStyle(e), n = /auto|scroll|overlay/.test(t.overflowY) && e.scrollHeight > e.clientHeight, r = /auto|scroll|overlay/.test(t.overflowX) && e.scrollWidth > e.clientWidth;
			if (!n && !r) continue;
			let i = e.getBoundingClientRect(), a = i.top + e.clientTop, u = i.left + e.clientLeft, d = n ? Xe(o, s, a, a + e.clientHeight) : 0, f = r ? Xe(c, l, u, u + e.clientWidth) : 0;
			if (!f && !d) continue;
			let p = e.scrollTop, m = e.scrollLeft;
			e.scrollBy({
				top: d,
				left: f,
				behavior: "instant"
			}), o -= e.scrollTop - p, s -= e.scrollTop - p, c -= e.scrollLeft - m, l -= e.scrollLeft - m;
		}
		let u = a.visualViewport, d = u?.offsetTop ?? 0, f = u?.offsetLeft ?? 0, p = Xe(o, s, d, d + (u?.height ?? a.innerHeight)), m = Xe(c, l, f, f + (u?.width ?? a.innerWidth));
		(m || p) && a.scrollBy({
			top: p,
			left: m,
			behavior: "instant"
		});
	}, Qe = (e, t, n) => {
		let r = P()[e], a = r.getBoundingClientRect(), s = n === "top" ? a.top + 2 : a.bottom - 2, c = Wi(i, t, s), l = c && r.contains(c.node) ? {
			block: e,
			offset: Gr(r, c.node, c.offset)
		} : {
			block: e,
			offset: n === "top" ? $e(e) : o[e].source.length
		};
		U(l), W({
			anchor: l,
			focus: l
		}), Ze();
	}, $e = (e) => {
		let t = o[e];
		return t.kind === "code" || t.kind === "divider" ? 0 : t.prefix;
	}, et = () => {
		if (m) {
			m = null;
			for (let e of P()) e.removeAttribute("data-selected");
		}
	}, tt = (e, t = e) => {
		m = or(o, e, t);
		let n = Math.min(m.anchor, m.focus), r = Math.max(m.anchor, m.focus);
		U({
			block: n,
			offset: 0
		}, {
			block: r,
			offset: o[r].source.length
		}), W(), P().forEach((e, t) => e.toggleAttribute("data-selected", t >= n && t <= r));
	}, nt = (e, t) => {
		if (!c && (e === "up" || e === "down")) return;
		let n = Math.min(t.anchor, t.focus), r = Math.max(t.anchor, t.focus), i = e === "delete" ? cr(o, t) : e === "duplicate" ? lr(o, t) : ur(o, t, e === "up" ? -1 : 1);
		i && (G(i.blocks, i.caret, i.caret, "edit"), e !== "delete" && tt(i.caret.block, i.caret.block + r - n));
	}, rt = () => {
		xt?.close(), yt?.clear(), et(), Ji(e);
		let t = e.ownerDocument.getSelection();
		t && (e.contains(t.anchorNode) || e.contains(t.focusNode)) && t.removeAllRanges();
		let n = e.ownerDocument.activeElement;
		n?.nodeType === 1 && e.contains(n) && n.blur(), W(), e.dispatchEvent(new Event("aa-dismiss"));
	}, it = (e) => {
		if (p || s || f || e.isComposing || e.defaultPrevented) return;
		let n = e.target.closest?.(".aa-caption");
		if (n) {
			if ((Aa ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "a") {
				e.preventDefault();
				let t = i.createRange();
				t.selectNodeContents(n);
				let r = a.getSelection();
				r?.removeAllRanges(), r?.addRange(t);
				return;
			}
			e.key === "Escape" ? (e.preventDefault(), e.stopPropagation(), rt()) : e.key === "Enter" && (e.preventDefault(), e.target.blur());
			return;
		}
		let r = Aa ? e.metaKey : e.ctrlKey;
		if (t.onSubmit && (e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key === "Enter") {
			e.preventDefault(), e.repeat || t.onSubmit();
			return;
		}
		if (r && !e.altKey && e.key.toLowerCase() === "z") {
			e.preventDefault(), e.shiftKey ? Se() : xe();
			return;
		}
		if (r && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "y") {
			e.preventDefault(), Se();
			return;
		}
		if (e.key === "Escape") {
			e.preventDefault(), e.stopPropagation(), rt();
			return;
		}
		let c = V();
		if (!c) return;
		let l = e.key.toLowerCase();
		if (h = !1, c.anchor.block !== c.focus.block && !m && !r && !e.ctrlKey) {
			if (e.key === "Backspace" || e.key === "Delete") {
				e.preventDefault(), K(c, "");
				return;
			}
			if (e.key === "Process" || e.keyCode === 229) {
				K(c, "");
				return;
			}
			if (e.key.length === 1 && !e.altKey) {
				e.preventDefault(), K(c, e.key, "type");
				return;
			}
		}
		if (r && e.shiftKey && l === "v") {
			h = !0;
			return;
		}
		if (r && e.shiftKey && !e.altKey && l === "m" && xt) {
			e.preventDefault(), xt.start();
			return;
		}
		if (e.key === " " && t.prompt && !r && !e.altKey && !e.shiftKey && !m && Hn(c.anchor, c.focus) === 0 && Et(c)) {
			e.preventDefault();
			return;
		}
		if ((e.key === "Backspace" || e.key === "Delete") && !m && !r && !e.altKey && !e.shiftKey) {
			let t = e.key === "Backspace" ? "backward" : "forward";
			if (Pe(c, t) || Y(c, t)) {
				e.preventDefault();
				return;
			}
		}
		if (r && l === "a" && !e.altKey) {
			e.preventDefault();
			let t = c.focus.block, n = o[t], r = n.kind === "table" && !m ? Ie(n.source, c.focus.offset) : null, i = r ? r.from : $e(t), a = r ? r.to : n.source.length, [s, l] = Un(c.anchor, c.focus), u = s.block === t && l.block === t && s.offset <= i && l.offset >= a, d = o.length - 1, f = !!m || u;
			if (et(), !f) {
				U({
					block: t,
					offset: i
				}, {
					block: t,
					offset: a
				}), W();
				return;
			}
			let p = {
				block: d,
				offset: o[d].source.length
			};
			U({
				block: 0,
				offset: $e(0)
			}, p);
			let h = V(), [g, _] = h ? Un(h.anchor, h.focus) : [];
			!g || !_ || g.block !== 0 || g.offset > $e(0) || Hn(_, p) !== 0 ? tt(0, d) : W();
			return;
		}
		let u = m ?? or(o, c.anchor.block, c.focus.block), d = o[c.focus.block];
		if (d.kind === "table" && !r && !e.shiftKey && c.anchor.offset === c.focus.offset && /^Arrow/.test(e.key)) {
			let t = X(d.source), n = t.flat(), r = n.findIndex((e) => c.focus.offset >= e.from && c.focus.offset <= e.to), i = n[r], a;
			if (i && e.key === "ArrowLeft" && c.focus.offset === i.from && (a = n[r - 1]), i && e.key === "ArrowRight" && c.focus.offset === i.to && (a = n[r + 1]), i && (e.key === "ArrowUp" || e.key === "ArrowDown") && (a = n[r + (e.key === "ArrowUp" ? -t[0].length : t[0].length)]), a) {
				e.preventDefault();
				let t = {
					block: c.focus.block,
					offset: e.key === "ArrowLeft" ? a.to : a.from
				};
				P()[t.block].querySelectorAll("[data-cell]")[n.indexOf(a)]?.focus(), U(t);
				return;
			}
		}
		if (e.key === "Tab" && !r && !e.altKey) {
			let t = o[c.focus.block];
			if (t.kind === "table") {
				e.preventDefault();
				let n = X(t.source).flat(), r = n[n.findIndex((e) => c.focus.offset >= e.from && c.focus.offset <= e.to) + (e.shiftKey ? -1 : 1)];
				if (r) {
					let e = {
						block: c.focus.block,
						offset: r.from
					};
					U(e), P()[e.block].querySelectorAll("[data-cell]")[n.indexOf(r)]?.focus(), U(e);
				} else e.shiftKey || Ge(c);
				return;
			}
			if (t.kind === "bullet") {
				e.preventDefault();
				let t = fr(o, u, e.shiftKey ? -1 : 1);
				ye(t);
				return;
			}
		}
		if (r && e.altKey && l === "t") {
			e.preventDefault();
			let t = o;
			for (let e = 0; e < t.length; e++) t = pr(t, e, !0)?.blocks ?? t;
			G(t, c.anchor, c.focus, "edit");
			return;
		}
		if (r && l === "d" && !e.altKey) {
			e.preventDefault(), nt("duplicate", u);
			return;
		}
		if (r && e.shiftKey && (l === "arrowup" || l === "arrowdown")) {
			e.preventDefault(), nt(l === "arrowup" ? "up" : "down", u);
			return;
		}
		let g = /^Digit[0-9]$/.test(e.code) ? Number(e.code.slice(-1)) : /^\d$/.test(l) ? Number(l) : -1;
		if (r && e.altKey && g >= 0) {
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
				let n = sr(o, u, t);
				G(n.blocks, n.caret, n.caret, "edit");
			}
			return;
		}
		if (r && e.key === "Enter") {
			e.preventDefault(), ye(ar(o, c.focus.block) ?? pr(o, c.focus.block));
			return;
		}
		if (m) {
			if (l === "backspace" || l === "delete") {
				e.preventDefault(), nt("delete", m);
				return;
			}
			if (l === "arrowup" || l === "arrowdown") {
				e.preventDefault();
				let t = m.focus + (l === "arrowup" ? -1 : 1);
				tt(e.shiftKey ? m.anchor : t, t);
				return;
			}
			if (l === "arrowleft" || l === "arrowright" || l === "enter") {
				e.preventDefault();
				let t = m.focus;
				et();
				let n = {
					block: t,
					offset: l === "arrowright" ? o[t].source.length : $e(t)
				};
				P()[t].focus(), U(n), W();
				return;
			}
		}
		if (!r && !e.altKey && e.shiftKey && (l === "arrowup" || l === "arrowdown")) {
			e.preventDefault(), tt(c.anchor.block, c.focus.block + (l === "arrowup" ? -1 : 1));
			return;
		}
		if (e.key === "Enter" && !r && !e.altKey) {
			e.preventDefault(), Ge(c, e.shiftKey);
			return;
		}
		if (r && !e.altKey) {
			let t = e.key.toLowerCase(), n = e.shiftKey ? t === "x" || t === "s" ? "strike" : void 0 : {
				b: "bold",
				i: "italic",
				e: "code",
				u: "underline"
			}[t];
			if (n) {
				e.preventDefault(), qe(c, n);
				return;
			}
			if (t === "k" && !e.shiftKey) {
				e.preventDefault(), Je(c);
				return;
			}
			return;
		}
		if (e.altKey || e.shiftKey || e.metaKey || e.ctrlKey || Hn(c.anchor, c.focus) !== 0) return;
		let { block: _, offset: v } = c.focus, y = P()[_], b = mn(o[_]) ? Sn(o[_], C) : {
			start: 0,
			end: o[_].source.length
		};
		if (e.key === "ArrowLeft" && v <= b.start && _ > 0) {
			e.preventDefault();
			let t = {
				block: _ - 1,
				offset: o[_ - 1].source.length
			};
			U(t), W({
				anchor: t,
				focus: t
			}), Ze();
		} else if (e.key === "ArrowRight" && v >= b.end && _ + 1 < o.length) {
			e.preventDefault();
			let t = {
				block: _ + 1,
				offset: $e(_ + 1)
			};
			U(t), W({
				anchor: t,
				focus: t
			}), Ze();
		} else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
			let t = e.key === "ArrowUp";
			if (t ? _ === 0 : _ + 1 >= o.length) return;
			let n = Ye(), r = y.getBoundingClientRect();
			if (!n) return;
			let i = n.height || parseFloat(getComputedStyle(y).lineHeight) || 16;
			if (!(t ? n.top - r.top < i * .75 : r.bottom - n.bottom < i * .75)) return;
			let a = t ? -1 : 1, s = _ + a;
			for (; s >= 0 && s < o.length; s += a) {
				let e = o[s];
				if (e.kind !== "paragraph") break;
				let t = Zt(e, C);
				if (!t.some((e) => e.kind === "atom" && e.atom === "image") || t.some((t) => t.kind === "atom" ? t.atom !== "image" : t.kind === "text" && e.source.slice(t.from, t.to).trim())) break;
			}
			e.preventDefault(), s >= 0 && s < o.length && Qe(s, n.left, t ? "bottom" : "top");
		}
	}, at = (e) => {
		if (e.target.closest?.(".aa-caption")) return;
		let t = V();
		t && e.clipboardData && Hn(t.anchor, t.focus) !== 0 && (e.preventDefault(), e.clipboardData.setData("text/plain", Jn(o, t.anchor, t.focus, C)), e.type === "cut" && !s && (m ? nt("delete", m) : K(t, "")));
	}, ot = (t) => {
		let n = Rt(t);
		if (n) {
			t.preventDefault();
			let e = o[n.index], r = e.source.split("\n").slice(1);
			wt(e) && r.pop(), navigator.clipboard?.writeText(r.join("\n")), n.element.setAttribute("data-copied", ""), setTimeout(() => n.element.removeAttribute("data-copied"), 1200);
			return;
		}
		et();
		let r = t.target, i = r?.closest?.("a.aa-link");
		if (i && e.contains(i)) {
			t.metaKey || t.ctrlKey || s ? (t.preventDefault(), a.open(i.href, "_blank", "noopener,noreferrer")) : t.preventDefault();
			return;
		}
		let c = r?.closest?.(".aa-block");
		if (!c || c.parentElement !== e || s) return;
		let l = P().indexOf(c), u = o[l];
		if (u.kind === "callout") {
			let n = c.getBoundingClientRect(), r = getComputedStyle(c), i = t.clientX - n.left, a = t.clientY - n.top, s = parseFloat(r.paddingLeft);
			if (u.box) {
				let o = parseFloat(r.paddingTop) || s;
				i >= s - o && i < s && a >= o && a < 2 * o && (t.preventDefault(), e.dispatchEvent(new CustomEvent("aa-callout-icon", {
					bubbles: !0,
					detail: {
						index: l,
						rect: new DOMRect(n.left + s - o, n.top + o, o, o)
					}
				})));
				return;
			}
			if (i < s) {
				t.preventDefault();
				let e = pr(o, l);
				ye(e);
			}
			return;
		}
		if (u.kind !== "bullet" || u.checked === void 0) return;
		let d = c.getBoundingClientRect(), f = parseFloat(getComputedStyle(c).paddingLeft);
		t.clientX - d.left > f || (t.preventDefault(), ye(ar(o, l)));
	}, ct = () => {
		let e = 0;
		return o.map((t, n) => {
			let r = e, i = e + t.source.length;
			return e = i + pe(n), JSON.stringify(g.filter((e) => e.from <= i && e.to >= r).map((e) => ({
				...e,
				from: e.from - r,
				to: e.to - r
			})));
		});
	}, lt = null, ut = (e) => {
		lt = null;
		let t = V(), n = P(), r = ct(), i = !1;
		o.forEach((a, o) => {
			e[o] !== r[o] && (A(n[o], a, ue(o, t)), i = !0);
		}), i && (t && U(t.anchor, t.focus), k());
	}, dt = (e) => {
		f = !0;
		let t = e.target?.closest?.(".aa-block");
		t && delete t.dataset.placeholder;
	}, ft = (t) => {
		if (f = !1, t.target.closest?.(".aa-caption")) {
			Be(t);
			return;
		}
		let n = t.target?.closest?.(".aa-block");
		n && n.parentElement === e && Te(n), lt && ut(lt);
	}, pt = () => {
		if (!p && !f && !le && !ce() && !a.getSelection()?.anchorNode?.parentElement?.closest(".aa-caption")) {
			if (Ce) {
				let e = V();
				(!e || e.focus.offset !== Ce.offset || e.anchor.offset !== Ce.offset || o[e.focus.block] !== Ce.block) && (Ce = null);
			}
			if (qi(e) && !m) {
				let e = V();
				e && e.anchor.block === e.focus.block && U(e.anchor, e.focus);
			}
			W(), I(), e.dispatchEvent(new Event("aa-selectionchange")), J?.moved();
		}
	}, mt = (t) => {
		let n = t.detail?.source, r = t.target?.closest?.(".aa-block");
		if (p || s || typeof n != "string" || !r || r.parentElement !== e) return;
		t.stopPropagation();
		let i = P().indexOf(r);
		if (i < 0 || o[i].source === n) return;
		let a = V(), { blocks: c } = $(o, {
			block: i,
			offset: 0
		}, {
			block: i,
			offset: o[i].source.length
		}, n);
		et(), R(dr(c));
		let l = (e) => ({
			block: Math.min(e.block, o.length - 1),
			offset: Math.min(e.offset, o[Math.min(e.block, o.length - 1)].source.length)
		});
		a && (U(l(a.anchor), l(a.focus)), W({
			anchor: l(a.anchor),
			focus: l(a.focus)
		}));
		let u = a ? l(a.focus) : {
			block: Math.min(i, o.length - 1),
			offset: 0
		};
		_e(u, u, "edit");
	}, ht = (t) => {
		let n = t.detail?.source, r = t.target?.closest?.(".aa-atom"), i = r?.closest(".aa-block");
		if (p || s || typeof n != "string" || !r || !i || i.parentElement !== e) return;
		t.stopPropagation();
		let a = P().indexOf(i);
		if (a < 0) return;
		r.dataset.source = n;
		let c = [...o];
		c[a] = {
			...o[a],
			source: Ur(i)
		};
		let { width: l } = Ot(n);
		l ? (r.dataset.width = String(l), r.style.setProperty("--aa-picture-width", String(l))) : (delete r.dataset.width, r.style.removeProperty("--aa-picture-width")), ve(a, $(o, {
			block: a,
			offset: 0
		}, {
			block: a,
			offset: o[a].source.length
		}, c[a].source).blocks);
	}, _t = (t) => {
		let n = t.detail?.forward !== !1, r = t.target?.closest?.(".aa-block");
		if (p || !r || r.parentElement !== e) return;
		t.stopPropagation();
		let i = P().indexOf(r) + (n ? 1 : -1);
		if (i < 0 || i >= o.length) return;
		let a = {
			block: i,
			offset: n ? $e(i) : o[i].source.length
		};
		P()[i].focus({ preventScroll: !0 }), U(a), W({
			anchor: a,
			focus: a
		}), Ze();
	}, vt = null, yt = null, xt = null, St = (e) => {
		let t = e, n = e;
		for (; t > 0 && o[t].kind !== "heading";) t--;
		for (; n + 1 < o.length && o[n + 1].kind !== "heading";) n++;
		return Array.from({ length: n - t + 1 }, (e, n) => t + n).filter((t) => t !== e && o[t].source.trim());
	}, Ct = () => {
		let e = a.getSelection();
		if (!e?.rangeCount) return;
		let t = e.getRangeAt(0), n = t.getClientRects()[0];
		if (n && n.height) return n;
		let r = t.startContainer, o = t.startOffset;
		if (r.nodeType !== Node.TEXT_NODE || !o) return;
		let s = i.createRange();
		s.setStart(r, o - 1), s.setEnd(r, o);
		let c = s.getClientRects()[0];
		return c ? new DOMRect(c.right, c.top, 0, c.height) : void 0;
	}, Et = (e) => {
		let { block: t } = e.focus, n = o[t], r = n.kind === "paragraph" && !n.source;
		return !r && !ie(e) ? !1 : (Dt(t, !r), !0);
	}, Dt = (e, n = !1) => {
		ka.when(({ openPrompt: r }) => {
			let i = P()[e], a = o[e], c = a.source, l = n ? Ct() : void 0, u = i.getBoundingClientRect(), d = getComputedStyle(i), f = i.clientLeft + (parseFloat(d.paddingLeft) || 0), m = (parseFloat(d.paddingRight) || 0) + (parseFloat(d.borderRightWidth) || 0), h = i.clientTop + (parseFloat(d.paddingTop) || 0), g = parseFloat(d.lineHeight) || l?.height || 0, _ = l ? l.left - u.left - f : 0, v = l ? h + (g ? Math.max(0, Math.floor((l.top + l.height / 2 - u.top - h) / g)) * g : l.top - u.top - h) : h;
			vt?.close(), vt = r({
				place: () => {
					let e = i.getBoundingClientRect();
					return new DOMRect(e.left + f, e.top + v, Math.max(e.width - f - m, 80), g || l?.height || e.height);
				},
				indent: _,
				type: i,
				placeholder: n ? H("Ask AI or press space to speak") : void 0,
				grow: (e) => {
					i.style.minHeight = e ? `${v + e}px` : "";
				},
				about: () => St(o.indexOf(a)).map((e) => P()[e]),
				send: async (e, r) => {
					let l = o.indexOf(a), u = await t.prompt(e, {
						kind: "writing",
						signal: r,
						text: Q(St(l).map((e) => o[e])),
						before: Q(o.slice(0, l)),
						after: Q(o.slice(l + 1)),
						document: Q(o.map((e) => e === a ? {
							...e,
							source: n ? `${e.source}${na}` : na
						} : e))
					}), d = o.indexOf(a);
					if (p || s || d < 0 || a.source !== (n ? c : "")) throw Error(H("Not answered"));
					i.style.minHeight = "";
					let f = It(d, u, n);
					if (!f) throw Error(H("Not answered"));
					P()[Math.min(f.caret, o.length - 1)]?.focus({ preventScroll: !0 });
				},
				close: (e) => {
					vt = null, i.style.minHeight = "";
					let t = o.indexOf(a);
					e || t < 0 || p || (P()[t].focus({ preventScroll: !0 }), U({
						block: t,
						offset: n ? o[t].source.length : 0
					}));
				}
			});
		});
	}, kt = (e, t, n = !1) => {
		let r = t.replace(/\r\n?/g, "\n"), i = r.indexOf(na), a = i < 0 ? null : r.slice(0, i).trimEnd(), s = (i < 0 ? r : n ? r.slice(0, i) + r.slice(i + na.length) : `${r.slice(0, i).trimEnd()}\n\n${r.slice(i + na.length).trimStart()}`).trim();
		if (s === Q(n ? o : o.filter((t, n) => n !== e)).trim()) return null;
		if (n) return Z(s, Math.max(0, a ? zn(r.slice(0, i)).length - 1 : e));
		let c = a === null ? e : a ? zn(a).length : 0;
		return Z(s, Math.max(0, c - 1));
	}, Z = (e, t) => {
		let n = o, r = dr(zn(e)), i = /* @__PURE__ */ new Set(), a = r.map((e) => {
			let t = n.find((t) => !i.has(t) && t.source === e.source && t.kind === e.kind && (t.depth ?? 0) === (e.depth ?? 0) && t.number === e.number);
			return t ? (i.add(t), t) : e;
		}), s = Math.min(t, a.length - 1), c = {
			block: s,
			offset: a[s].source.length
		};
		G(a, c, c, "edit"), o.forEach((e, t) => {
			if (n.includes(e)) return;
			let r = ta(P()[t], [[0, e.source.length]]);
			De.add(r), setTimeout(() => De.delete(r), 2e3);
		});
		let l = Pt(n, o);
		return yt?.set(l), { caret: s };
	}, jt = "", Mt = (e) => {
		let t = [];
		for (let n of e) n.blocks.forEach((e, r) => {
			let i = o.indexOf(e);
			if (i < 0) return;
			let a = me({
				block: i,
				offset: 0
			});
			for (let [e, i] of n.words[r] ?? []) t.push({
				from: a + e,
				to: a + i,
				className: "aa-ai-changed"
			});
		});
		let n = JSON.stringify(t);
		n !== jt && (jt = n, Nt("ai", t));
	}, Nt = (e, t) => {
		let n = lt ?? ct();
		t.length ? _.set(e, [...t]) : _.delete(e), g = [..._.values()].flat(), f ? lt = n : ut(n);
	}, Pt = (e, t) => {
		let n = ka.here();
		if (!n) return [];
		let r = [], i = 0, a = [], o = (t) => {
			let o = e.slice(i, t).filter((e) => e.source);
			a.length && a.length === o.length ? a.forEach((e, t) => {
				let i = n.onlyBox(o[t].source, e.source);
				r.push({
					blocks: [e],
					before: [o[t]],
					words: [i ? [] : n.changedWords(o[t].source.slice(o[t].prefix), e.source.slice(e.prefix)).map(([t, n]) => [t + e.prefix, n + e.prefix])],
					box: i
				});
			}) : a.length && r.push({
				blocks: a,
				before: o,
				words: a.map((e) => e.source.trim() ? [[e.prefix, e.source.length]] : [])
			}), a = [];
		};
		for (let n of t) {
			let t = e.indexOf(n);
			t < i ? a.push(n) : (o(t), i = t + 1);
		}
		return o(e.length), r;
	}, Ft = (e) => {
		let t = o.indexOf(e.blocks[0]), n = e.blocks.length;
		if (s || p || t < 0 || e.blocks.some((e, n) => o[t + n] !== e)) return !1;
		let r = t + n - 1, i = e.before.length - n, a = V(), c = dr([
			...o.slice(0, t),
			...e.before,
			...o.slice(r + 1)
		]), l = (n) => n.block > r ? {
			...n,
			block: n.block + i
		} : n.block >= t ? {
			block: Math.max(0, Math.min(t + e.before.length - 1, c.length - 1)),
			offset: 0
		} : n, u = a ? l(a.anchor) : {
			block: Math.min(t, c.length - 1),
			offset: 0
		}, d = a ? l(a.focus) : u, f = (e) => ({
			block: Math.min(e.block, c.length - 1),
			offset: Math.min(e.offset, c[Math.min(e.block, c.length - 1)].source.length)
		});
		return G(c, f(u), f(d), "edit"), !0;
	}, It = (e, t, n = !1) => {
		let { edits: r = [], insert: i = "", document: a } = typeof t == "string" ? { insert: t } : t;
		if (typeof a == "string" && a.trim()) return kt(e, a, n);
		if (n) return null;
		let s = (e, t) => {
			let n = e.indexOf(t);
			return n >= 0 && e.indexOf(t, n + 1) < 0 ? n : -1;
		}, c = Q(o.slice(0, e)), l = Q(o.slice(e + 1)), u = 0;
		for (let { find: e, replace: t } of r) {
			if (!e) continue;
			let n = s(c, e), r = s(l, e);
			n >= 0 && l.indexOf(e) < 0 ? (c = c.slice(0, n) + t + c.slice(n + e.length), u++) : r >= 0 && c.indexOf(e) < 0 && (l = l.slice(0, r) + t + l.slice(r + e.length), u++);
		}
		let d = i.trim();
		if (!u && !d) return null;
		let f = c.trim() ? zn(c.trimEnd()).length : 0;
		return Z([
			c.trimEnd(),
			d,
			l.trimStart()
		].filter(Boolean).join("\n\n"), d ? f + zn(d).length - 1 : Math.max(0, f - 1));
	}, Lt = (e) => {
		let n = e.detail;
		!n || p || s || (e.stopPropagation(), n.available = !!t.prompt, t.prompt && n.prompt && n.signal && (n.answer = t.prompt(n.prompt, {
			kind: "diagram",
			text: n.text ?? "",
			signal: n.signal
		}).then((e) => typeof e == "string" ? e : e.insert ?? "")));
	}, Rt = (t) => {
		let n = t.target?.closest?.(".aa-block");
		if (!n || n.parentElement !== e || n.dataset.kind !== "code" || "drawn" in n.dataset || n.hasAttribute("data-drawn")) return null;
		let r = n.getBoundingClientRect(), i = Qr(n), a = getComputedStyle(n).direction === "rtl" ? t.clientX - r.left : r.right - t.clientX;
		return a >= 0 && a < i && t.clientY - r.top >= 0 && t.clientY - r.top < i ? {
			element: n,
			index: P().indexOf(n)
		} : null;
	}, zt = (e) => {
		Rt(e) ? e.preventDefault() : et();
	}, Bt = (e) => Array.from(e?.files ?? []);
	e.addEventListener("beforeinput", Fe, { signal: r }), e.addEventListener("input", Be, { signal: r }), e.addEventListener("keydown", it, { signal: r }), e.addEventListener("copy", at, { signal: r }), e.addEventListener("cut", at, { signal: r }), e.addEventListener("click", ot, { signal: r }), e.addEventListener("pointerdown", zt, { signal: r }), e.addEventListener("drop", (e) => {
		e.preventDefault();
		let n = Bt(e.dataTransfer);
		if (!n.length || !t.onFiles || s || p || !l) return;
		let r = i.caretRangeFromPoint?.(e.clientX, e.clientY), a = r ? z(r.startContainer) : -1;
		if (r && a >= 0) {
			let e = {
				block: a,
				offset: Gr(P()[a], r.startContainer, r.startOffset)
			};
			P()[a].focus({ preventScroll: !0 }), U(e);
		}
		t.onFiles(n);
	}, { signal: r }), e.addEventListener("paste", (e) => {
		if (e.target.closest?.(".aa-caption")) return;
		let n = h;
		if (h = !1, s || p) return;
		let r = Bt(e.clipboardData);
		if (r.length && t.onFiles) {
			e.preventDefault(), t.onFiles(r);
			return;
		}
		let i = V(), a = e.clipboardData?.getData("text/plain");
		if (!i || a === void 0) return;
		e.preventDefault();
		let [c, l] = Un(i.anchor, i.focus), u = o[c.block];
		if (!n && !m && c.block === l.block && u.kind === "table" && a.includes("	")) {
			let e = X(u.source), t = e.findIndex((e) => e.some((e) => c.offset >= e.from && c.offset <= e.to)), n = t < 0 ? -1 : e[t].findIndex((e) => c.offset >= e.from && c.offset <= e.to);
			if (t >= 0 && n >= 0) {
				let r = e.map((e) => e.map((e) => e.text));
				a.replace(/\r\n?/g, "\n").replace(/\n$/, "").split("\n").map((e) => e.split("	")).forEach((e, i) => {
					let a = r[t + i] ?? (r[t + i] = []);
					e.forEach((e, t) => {
						a[n + t] = e;
					});
				});
				let i = He(r, Re(u.source), ze(u.source)), s = X(i)[t][n], l = $(o, {
					block: c.block,
					offset: 0
				}, {
					block: c.block,
					offset: u.source.length
				}, i), d = {
					block: c.block,
					offset: s.to
				};
				G(l.blocks, d, d, "edit");
				return;
			}
		}
		if (n && c.block === l.block) {
			let e = Zt(u, C).find((e) => e.kind === "syntax" && e.group && u.source.slice(e.from, e.from + 2) === "](" && c.offset === e.group[0] + 1 && l.offset === e.from);
			if (e?.group) {
				K({
					anchor: {
						block: c.block,
						offset: e.group[0]
					},
					focus: {
						block: c.block,
						offset: e.group[1]
					}
				}, a.replace(/\r\n?/g, "\n"));
				return;
			}
		}
		!n && c.block === l.block && c.offset !== l.offset && /^https?:\/\/[^\s<>]+$/i.test(a.trim()) ? Ke(i, "[", `](${a.trim().replace(/\(/g, "%28").replace(/\)/g, "%29")})`) : K(i, (n ? null : Ue(a)) ?? a.replace(/\r\n?/g, "\n"));
	}, { signal: r }), e.addEventListener("aa-atom-change", mt, { signal: r }), e.addEventListener("aa-atom-source", ht, { signal: r }), e.addEventListener("aa-atom-leave", _t, { signal: r }), e.addEventListener("aa-atom-prompt", Lt, { signal: r }), e.addEventListener("compositionstart", dt, { signal: r }), e.addEventListener("compositionend", ft, { signal: r }), i.addEventListener("selectionchange", pt, { signal: r }), t.prompt && ka.when(({ createMarks: t }) => {
		p || (yt = t(e, {
			blocks: () => o,
			elements: P,
			revert: Ft,
			shown: Mt
		}));
	}), se();
	let Vt = Vi(e), Ut = Xi(e, () => s || p), Wt = Yr(e, {
		readOnly: () => s || p,
		square: Qr,
		write(e, t) {
			let n = P().indexOf(e);
			if (n < 0) return null;
			let r = Ve(o[n].source, t);
			return r === o[n].source ? e : (ve(n, qn(o, n, r).blocks), P()[n] ?? null);
		}
	}), Gt = (t) => {
		for (let e of E) e.readOnly = t;
		if (t !== s) {
			s = t, M(), et(), I(), J?.stop();
			for (let e of P()) e.contentEditable = t || e.dataset.kind === "table" ? "false" : "true", e.dataset.readonly = String(t), e.querySelectorAll("[data-cell], .aa-caption").forEach((e) => e.contentEditable = t ? "false" : "true");
			e.dispatchEvent(new Event("aa-change"));
		}
	}, Kt = {
		element: e,
		exportMarkdown() {
			return Ne(Q(o));
		},
		get value() {
			return Q(o);
		},
		set value(t) {
			if (Q(o) === t) return;
			let n = e.contains(i.activeElement) ? V() : null, r = o, a = zn(t), s = (e, t) => JSON.stringify(e) === JSON.stringify(t), c = 0;
			for (; c < r.length && c < a.length && s(r[c], a[c]);) c++;
			let l = 0;
			for (; l < r.length - c && l < a.length - c && s(r[r.length - 1 - l], a[a.length - 1 - l]);) l++;
			let u = [
				...r.slice(0, c),
				...a.slice(c, a.length - l),
				...r.slice(r.length - l)
			];
			et(), R(u);
			let d = (e) => {
				let t = e.block < c ? e.block : e.block >= r.length - l ? e.block + u.length - r.length : Math.min(e.block, u.length - 1);
				return {
					block: t,
					offset: Math.min(e.offset, u[t].source.length)
				};
			}, f = n ? d(n.anchor) : {
				block: 0,
				offset: 0
			}, p = n ? d(n.focus) : f;
			n && (U(f, p), W({
				anchor: f,
				focus: p
			})), ne.reset({
				blocks: o,
				anchor: f,
				focus: p
			}), xt?.changed();
		},
		get readOnly() {
			return s;
		},
		set readOnly(e) {
			Gt(e);
		},
		get reordering() {
			return c;
		},
		set reordering(t) {
			if (c !== t) {
				c = t;
				for (let e of E) e.reordering = t;
				e.dispatchEvent(new Event("aa-movement-change"));
			}
		},
		get placing() {
			return l;
		},
		set placing(t) {
			if (l !== t) {
				l = t;
				for (let e of E) e.placing = t;
				e.dispatchEvent(new Event("aa-movement-change"));
			}
		},
		get placeholder() {
			return u;
		},
		set placeholder(e) {
			u = e, I(), M();
		},
		focus() {
			let e = o.length - 1;
			P()[e]?.focus({ preventScroll: !0 });
			let t = {
				block: e,
				offset: o[e].source.length
			};
			U(t), W({
				anchor: t,
				focus: t
			});
		},
		blur() {
			i.activeElement?.blur();
		},
		dismiss: rt,
		selection() {
			let e = V();
			if (!e) return null;
			let [t, n] = Un(e.anchor, e.focus);
			return {
				start: me(t),
				end: me(n)
			};
		},
		replace(t, n, r) {
			if (p) return;
			let { blocks: a, caret: s } = $(o, he(Math.min(t, n)), he(Math.max(t, n)), r, C);
			G(a, s, s, "edit"), e.contains(i.activeElement) || (P()[s.block]?.focus({ preventScroll: !0 }), U(s));
		},
		undo: xe,
		redo: Se,
		activeBlock() {
			let e = V();
			if (!e) return null;
			let t = e.focus.block;
			return {
				index: t,
				block: o[t],
				start: me({
					block: t,
					offset: 0
				}),
				end: me({
					block: t,
					offset: o[t].source.length
				})
			};
		},
		selectBlocks: tt,
		format(e) {
			if (s) return;
			let t = V();
			t && qe(t, e);
		},
		background(e) {
			if (s) return;
			let t = V();
			if (!t) return;
			let n = rr(o, t.anchor, t.focus, e, C);
			n && G(n.blocks, n.anchor, n.focus, "edit");
		},
		color(e) {
			if (s) return;
			let t = V();
			if (!t) return;
			let n = nr(o, t.anchor, t.focus, e, C);
			n && G(n.blocks, n.anchor, n.focus, "edit");
		},
		turnInto(e) {
			if (s) return;
			let t = V();
			if (!t) return;
			let n = sr(o, m ?? or(o, t.anchor.block, t.focus.block), e);
			G(n.blocks, n.caret, n.caret, "edit");
		},
		blockAction(e) {
			if (s) return;
			let t = V();
			t && nt(e, m ?? or(o, t.anchor.block, t.focus.block));
		},
		moveBlock(e, t, n = 1) {
			if (s || !c || n < 1 || e < 0 || t < 0 || e + n > o.length || t + n > o.length || e === t) return;
			let r = [...o], i = r.splice(e, n);
			r.splice(t, 0, ...i);
			let a = {
				block: t,
				offset: i[0].prefix
			};
			G(r, a, a, "edit"), P()[t].focus({ preventScroll: !0 }), tt(t, t + n - 1);
		},
		indent(e) {
			if (s) return;
			let t = V();
			if (!t) return;
			let n = fr(o, m ?? or(o, t.anchor.block, t.focus.block), e);
			ye(n);
		},
		toggle(e) {
			if (s) return;
			let t = V();
			if (!t) return;
			let n = pr(o, t.focus.block, e) ?? ar(o, t.focus.block);
			ye(n);
		},
		callout(e, t) {
			if (s) return;
			let n = t ?? V()?.focus.block ?? -1;
			if (n < 0 || n >= o.length) return;
			let r = mr(o, n, e);
			if (!r) return;
			let i = V(), a = i && i.focus.block === n && i.focus.offset >= o[n].prefix, c = r.blocks[n].prefix - o[n].prefix, l = a ? {
				block: n,
				offset: i.focus.offset + c
			} : r.caret;
			G(r.blocks, l, l, "edit");
		},
		table(e) {
			if (s) return;
			let t = V();
			if (!t) return;
			let n = t.focus.block, r = o[n];
			if (r.kind !== "table") return;
			let i = X(r.source), a = 0, c = 0;
			i.forEach((e, n) => e.forEach((e, r) => {
				t.focus.offset >= e.from && t.focus.offset <= e.to && (a = n, c = r);
			}));
			let l = We(r, e, a, c), u = $(o, {
				block: n,
				offset: 0
			}, {
				block: n,
				offset: r.source.length
			}, l), d = {
				block: n,
				offset: X(l)[Math.min(a, X(l).length - 1)][Math.min(c, X(l)[0].length - 1)].from
			};
			G(u.blocks, d, d, "edit");
		},
		insertFile(e) {
			!s && !p && t.onFiles?.([e]);
		},
		decorate(e, t = "external") {
			Nt(t, e.map((e) => ({ ...e })));
		},
		stats() {
			let e = o.flatMap((e) => e.kind === "code" ? [] : [e.source.slice(e.prefix)]).join(" ").replace(/[*_~`#>|=$\[\]()]/g, " ");
			return {
				words: typeof Intl.Segmenter == "function" ? [...new Intl.Segmenter(void 0, { granularity: "word" }).segment(e)].filter((e) => e.isWordLike).length : e.match(/\S+/g)?.length ?? 0,
				characters: [...Q(o)].length,
				blocks: o.length
			};
		},
		find(e, t = !1) {
			if (!e) return [];
			let n = t ? Q(o) : Q(o).toLocaleLowerCase(), r = t ? e : e.toLocaleLowerCase(), i = [];
			for (let t = n.indexOf(r); t >= 0; t = n.indexOf(r, t + r.length)) i.push({
				start: t,
				end: t + e.length
			});
			return i;
		},
		rangeOf(e, t) {
			let n = he(e), r = he(t), a = P();
			if (!a[n.block] || !a[r.block]) return null;
			let s = Kr(a[n.block], Math.min(n.offset, o[n.block].source.length)), c = Kr(a[r.block], Math.min(r.offset, o[r.block].source.length)), l = i.createRange();
			return l.setStart(s.node, s.offset), l.setEnd(c.node, c.offset), l;
		},
		selectRange(e, t = e) {
			let n = he(e), r = he(t);
			et(), P()[n.block].focus(), U(n, r), W({
				anchor: n,
				focus: r
			});
		},
		transaction(e) {
			let t = Q(o);
			b++;
			try {
				e();
			} finally {
				if (b--, !b && Q(o) !== t) {
					let e = V() ?? {
						anchor: {
							block: 0,
							offset: 0
						},
						focus: {
							block: 0,
							offset: 0
						}
					};
					_e(e.anchor, e.focus, "edit");
				}
			}
		},
		setHistoryProvider(e) {
			x = e;
		},
		async askAbout(e) {
			let n = e.trim(), r = V();
			if (!n || !t.prompt || s || p || !r || Hn(r.anchor, r.focus) === 0) return !1;
			let [i, a] = Un(r.anchor, r.focus), c = me(i), l = me(a), u = Q(o), d = ra(P().slice(i.block, a.block + 1));
			try {
				let e = await t.prompt(n, {
					kind: "writing",
					signal: new AbortController().signal,
					text: u.slice(c, l),
					before: u.slice(0, c),
					after: u.slice(l)
				});
				if (p || s || Q(o) !== u) return !1;
				let r = (typeof e == "string" ? e : e.insert ?? "").trim();
				return r ? (Kt.replace(c, l, r), Kt.selectRange(c, c + r.length), !0) : !1;
			} finally {
				d();
			}
		},
		get comments() {
			return xt ?? void 0;
		},
		get correcting() {
			return Ae;
		},
		set correcting(e) {
			t.correct && Ae !== e && (Ae = e, J && (J.enabled = e), q(e));
		},
		destroy() {
			n.abort(), p = !0, re.disconnect(), Ji(e), J?.stop();
			for (let e of De) e();
			De.clear(), Vt(), Ut(), Wt(), v(), y(), vt?.close(), yt?.destroy(), xt?.destroy(), k(!0);
		}
	};
	return t.comments && (xt = Ea(e, {
		store: t.comments,
		value: () => Q(o),
		selection: () => Kt.selection(),
		decorate: (e) => Kt.decorate(e, "comments"),
		selectRange: (e, t) => Kt.selectRange(e, t),
		readOnly: () => s,
		prompt: t.prompt
	})), v = Ri(Kt, {
		...t,
		atoms: C
	}), t.partials && t.menus !== !1 && (y = pa(Kt)), Kt;
}
//#endregion
//#region src/element.ts
var Na = class extends (typeof HTMLElement > "u" ? class {} : HTMLElement) {
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
		this.#e ||= ja(this, {
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
function Pa(e = "aa-editor") {
	customElements.get(e) || customElements.define(e, Na);
}
//#endregion
//#region src/writer.ts
var Fa = {
	load(e) {
		try {
			return localStorage.getItem(`aa-draft:${e}`);
		} catch {
			return null;
		}
	},
	save(e, t) {
		try {
			localStorage.setItem(`aa-draft:${e}`, t);
		} catch {}
	},
	clear(e) {
		try {
			localStorage.removeItem(`aa-draft:${e}`);
		} catch {}
	}
}, Ia = 400;
function La(e, t = {}) {
	let n = new AbortController(), { signal: r } = n, { draft: i, drafts: a = Fa, onSave: o, onCancel: s, onState: c, actions: l = [], onChange: u, ...d } = t, f = e.ownerDocument, p = f.defaultView, m = t.value ?? "", h = i ? a.load(i) : null, g = h !== null && h !== m, _ = f.createElement("div");
	_.className = "aa-writer";
	let v = f.createElement("div");
	v.className = "aa-writer-frame";
	let y = f.createElement("div");
	y.className = "aa-writer-bar", y.setAttribute("role", "toolbar"), y.setAttribute("aria-label", H("Text formatting"));
	let b = f.createElement("div");
	b.className = "aa-writer-page";
	let x = f.createElement("div");
	x.className = "aa-writer-foot", v.append(y, b), _.append(v, x), e.append(_);
	let S = g ? "draft" : "saved", C, w = !1, T, E = ja(b, {
		...d,
		value: g ? h : m,
		toolbar: !1,
		onChange: (e) => {
			u?.(e), N();
		}
	}), ee = f.createElement("span");
	ee.className = "aa-writer-state", ee.setAttribute("aria-live", "polite");
	let D = (e) => {
		ee.textContent = e && H(e);
	}, O = Ei("Save", "check", () => {
		P();
	}, !0);
	O.classList.add("aa-writer-save"), O.querySelector(".aa-icon")?.remove();
	let te = Ei("Cancel", "close", () => re(), !0);
	te.classList.add("aa-writer-cancel"), te.querySelector(".aa-icon")?.remove(), x.append(O, te, ee);
	let k = () => E.value !== m, A = (e, t) => {
		let n = e !== S;
		S = e, _.dataset.state = e, O.disabled = e === "saving" || !k() || E.readOnly, te.disabled = e === "saving" || E.readOnly, D(t), n && c?.(e);
	}, j = () => {
		clearTimeout(C), C = void 0, i && a.clear(i);
	}, ne = () => {
		clearTimeout(C), C = void 0, i && !w && k() && (a.save(i, E.value), A("draft", "Draft saved"));
	}, M = () => {
		A("draft", i ? "Draft" : "Not saved yet"), clearTimeout(C), C = setTimeout(ne, Ia);
	}, N = () => {
		k() ? M() : (j(), A("saved", ""));
	}, P = async () => {
		if (w || S === "saving" || !k() || E.readOnly) return !1;
		let e = E.value;
		A("saving", "Saving…");
		try {
			await o?.(e);
		} catch {
			return w || (T !== void 0 && T !== e && (m = T), T = void 0, A("failed", "Not saved"), O.disabled = !1), !1;
		}
		return w ? (i && a.load(i) === e && a.clear(i), !0) : (m = e, T = void 0, k() ? M() : (j(), A("saved", "Saved")), !0);
	}, re = () => {
		S !== "saving" && (j(), k() && (E.value = m), A("saved", ""), s?.());
	}, F = null, ie = () => {
		if (!E.selection()) {
			let e = F ?? {
				start: E.value.length,
				end: E.value.length
			};
			E.selectRange(e.start, e.end);
		}
	}, ae = (e) => () => {
		E.readOnly || (ie(), e());
	}, oe = e.closest("dialog") ?? f.body, I = null, L = () => {
		I &&= (I.panel.remove(), I.anchor.setAttribute("aria-expanded", "false"), null);
	}, se = (e, t, n, r) => {
		if (I?.anchor === e) {
			L();
			return;
		}
		if (L(), Ni(p)) {
			yi({
				title: H(t),
				groups: [{ rows: n }],
				root: oe,
				nonModal: !0,
				onClose: (e) => {
					e && ie();
				}
			});
			return;
		}
		let i = f.createElement("div");
		i.className = "aa-controls aa-menu aa-writer-menu", i.setAttribute("role", "menu"), i.setAttribute("aria-label", H(t));
		let a = f.createElement("div");
		a.className = "aa-menu-list", a.setAttribute("role", "none");
		for (let e of n) {
			let t = Ei(e.label, e.icon, () => {
				L(), ae(e.run)();
			}, !0);
			t.classList.add("note-menu-row"), t.setAttribute("role", "menuitem"), t.dataset.command = e.id, t.tabIndex = -1, a.append(t);
		}
		i.append(a), oe.append(i);
		let o = e.getBoundingClientRect();
		i.style.left = `${Math.round(o.left)}px`, i.style.top = `${Math.round(o.bottom)}px`;
		let s = i.getBoundingClientRect().width;
		o.left + s > p.innerWidth && (i.style.left = `${Math.round(Math.max(0, p.innerWidth - s))}px`), e.setAttribute("aria-expanded", "true"), I = {
			panel: i,
			anchor: e
		}, r && a.querySelector("button")?.focus(), i.addEventListener("keydown", (t) => {
			let n = [...a.querySelectorAll("button")], r = n.indexOf(f.activeElement);
			t.key === "Escape" ? (t.preventDefault(), t.stopPropagation(), L(), e.focus()) : (t.key === "ArrowDown" || t.key === "ArrowUp") && (t.preventDefault(), n[(r + (t.key === "ArrowDown" ? 1 : -1) + n.length) % n.length]?.focus());
		});
	}, R = (e, t, n, r) => {
		let i = Ei(t, n, (e) => se(i, t, r(), e.detail === 0));
		return i.dataset.action = e, i.classList.add("aa-writer-opens"), i.setAttribute("aria-haspopup", "menu"), i.setAttribute("aria-expanded", "false"), i.append(Sr("chevron-down", f)), i;
	}, z = (e, t, n, r, i) => {
		let a = Ei(t, n, ae(r), !1, i);
		return a.dataset.action = e, a;
	}, ce = (e) => wi.filter((t) => e.includes(t.kind)).map((e) => ({
		id: e.kind,
		label: e.label,
		icon: e.icon,
		run: () => E.turnInto(e.kind)
	})), B = () => {
		let e = wi.filter((e) => [
			"quote",
			"code",
			"table",
			"divider",
			"callout",
			"toggle",
			"equation"
		].includes(e.kind)).map((e) => ({
			id: e.kind,
			label: e.label,
			icon: e.icon,
			run: () => ji(E, e.kind)
		})), n = [...(t.atoms ?? []).map(Ai).filter((e) => !!e), ...t.commands ?? []];
		return [...e, ...n.map((e) => ({
			id: e.id,
			label: e.label,
			icon: e.icon,
			run: () => e.run(E)
		}))];
	}, V = (...e) => {
		let t = f.createElement("span");
		return t.className = "aa-writer-group", t.append(...e), t;
	}, le = f.createElement("input");
	if (le.type = "file", le.multiple = !0, le.hidden = !0, le.addEventListener("change", () => {
		let e = [...le.files ?? []];
		le.value = "", e.length && (ie(), t.onFiles?.(e));
	}), y.append(V(R("style", "Text style", "text", () => ce([
		"paragraph",
		"h1",
		"h2",
		"h3"
	]))), V(z("bold", "Bold", "bold", () => E.format("bold"), "⌘B"), z("italic", "Italic", "italic", () => E.format("italic"), "⌘I"), R("marks", "More formatting", "underline", () => [
		{
			id: "underline",
			label: "Underline",
			icon: "underline",
			run: () => E.format("underline")
		},
		{
			id: "strike",
			label: "Strikethrough",
			icon: "strike",
			run: () => E.format("strike")
		},
		{
			id: "code",
			label: "Code",
			icon: "code",
			run: () => E.format("code")
		},
		{
			id: "highlight",
			label: "Highlight",
			icon: "background",
			run: () => E.format("highlight")
		}
	])), V(R("lists", "Lists", "bullet", () => ce([
		"bullet",
		"numbered",
		"todo"
	]))), V(z("link", "Link", "link", () => E.format("link"), "⌘K"), ...t.onFiles ? [z("picture", "Add picture or file", "image", () => le.click())] : [], R("insert", "Insert block", "plus", B))), l.length) {
		let e = V(...l.map((e) => z(e.id, e.label, e.icon, () => e.run(E), e.shortcut)));
		e.classList.add("aa-writer-end"), y.append(e);
	}
	y.append(le);
	let U = (e) => {
		let t = E.selection(), n = E.activeBlock();
		if (!t || !n) return !1;
		let r = t.start - n.start, i = t.end - n.start;
		return Zt(n.block).some((t) => t.kind === "text" && !!t[e] && t.from <= r && t.to >= i && (r < i ? t.from < i : t.from < r || r === 0));
	}, ue = () => {
		E.selection() && (F = E.selection());
		for (let e of ["bold", "italic"]) y.querySelector(`[data-action="${e}"]`)?.setAttribute("aria-pressed", String(U(e)));
	}, de = (e) => {
		I && !I.panel.contains(e.target) && !I.anchor.contains(e.target) && L();
	}, W = (e) => {
		!(/Mac|iPhone|iPad/.test(navigator.platform) ? e.metaKey : e.ctrlKey) || e.isComposing || e.key !== "Enter" && e.key.toLowerCase() !== "s" || (e.preventDefault(), e.stopPropagation(), P());
	}, fe = () => {
		C !== void 0 && ne();
	};
	return b.addEventListener("aa-selectionchange", ue, { signal: r }), b.addEventListener("aa-change", ue, { signal: r }), _.addEventListener("keydown", W, {
		capture: !0,
		signal: r
	}), f.addEventListener("pointerdown", de, { signal: r }), f.addEventListener("visibilitychange", () => {
		f.visibilityState === "hidden" && fe();
	}, { signal: r }), p.addEventListener("pagehide", fe, { signal: r }), _.toggleAttribute("data-read-only", !!t.readOnly), _.dataset.state = S, A(S, g ? "Draft restored" : ""), {
		editor: E,
		element: _,
		get value() {
			return E.value;
		},
		set value(e) {
			E.value = e, N();
		},
		get saved() {
			return m;
		},
		set saved(e) {
			if (S === "saving") {
				T = e;
				return;
			}
			if (e === m) return;
			let t = !k();
			m = e, t && (E.value = e), N();
		},
		get dirty() {
			return k();
		},
		get state() {
			return S;
		},
		get readOnly() {
			return E.readOnly;
		},
		set readOnly(e) {
			E.readOnly = e, _.toggleAttribute("data-read-only", e), A(S, ee.textContent ?? "");
		},
		save: P,
		cancel: re,
		destroy() {
			n.abort(), !w && (fe(), w = !0, clearTimeout(C), L(), E.destroy(), _.remove());
		}
	};
}
//#endregion
//#region src/plain.ts
function Ra(e, t = {}) {
	let n = new AbortController(), { signal: r } = n, i = e.ownerDocument;
	aa(e);
	let a = i.createElement("div");
	a.className = "aa-block", a.contentEditable = t.readOnly ? "false" : "plaintext-only", a.spellcheck = !1, a.textContent = t.value ?? e.textContent ?? "", e.classList.add("aa", "aa-plain"), e.setAttribute("role", "textbox"), e.setAttribute("aria-multiline", "true"), e.replaceChildren(a);
	let o = !!t.speak && ba(), s = t.placeholder ? `${t.placeholder.charAt(0).toLowerCase()}${t.placeholder.slice(1)}` : H("write"), c = o ? H("Press space to speak, or {action}", { action: s }) : t.placeholder ?? "";
	t.placeholder && e.setAttribute("aria-label", t.placeholder);
	let l = () => a.innerText, u = () => e.toggleAttribute("data-empty", !l().trim()), d = (e) => {
		e ? a.dataset.placeholder = e : delete a.dataset.placeholder;
	};
	d(c), u();
	let f = null, p = () => {
		let n = l().trim(), r = Object.assign(i.createElement("span"), {
			className: "aa-prompt-caret",
			contentEditable: "false"
		});
		r.setAttribute("aria-hidden", "true");
		let o = null;
		f = xa({
			lang: i.documentElement.lang || navigator.language,
			heard: (e) => {
				let i = `${n}${n && e ? " " : ""}${e}`;
				r.toggleAttribute("data-after", !!i), a.replaceChildren(i, r), u(), t.onChange?.(i);
			},
			audio: () => {
				o?.followVoice?.();
			},
			end: (t) => {
				f = null, o?.stop(), r.remove(), delete e.dataset.listening, d(t ?? c), u();
				let n = i.getSelection();
				i.activeElement === a && n && (n.selectAllChildren(a), n.collapseToEnd());
			}
		}), f && (e.dataset.listening = "", d(H("Listening…")), a.append(r), o = ya(r, i.defaultView));
	}, m = (e) => {
		if (!(e.isComposing || e.defaultPrevented)) {
			if (f) {
				if (e.key === "Escape") {
					e.preventDefault(), e.stopPropagation(), f.abort();
					return;
				}
				f.stop();
			} else if ((/Mac|iPhone|iPad/.test(i.defaultView?.navigator.platform ?? navigator.platform) ? e.metaKey : e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "a") {
				e.preventDefault(), e.stopPropagation();
				let t = i.createRange();
				t.selectNodeContents(a);
				let n = i.getSelection();
				n?.removeAllRanges(), n?.addRange(t);
			} else e.key === " " && o && !l().trim() && !e.metaKey && !e.ctrlKey && !e.altKey && a.isContentEditable && (e.preventDefault(), p());
		}
	}, h = () => {
		u(), t.onChange?.(l());
	}, g = () => f?.stop(), _ = () => a.focus({ preventScroll: !0 });
	a.addEventListener("input", h, { signal: r }), a.addEventListener("keydown", m, { signal: r }), a.addEventListener("blur", g, { signal: r }), e.addEventListener("click", (t) => {
		t.target === e && _();
	}, { signal: r });
	let v = Vi(e);
	return {
		element: e,
		get value() {
			return l();
		},
		set value(e) {
			l() !== e && (a.textContent = e, u());
		},
		get readOnly() {
			return a.contentEditable === "false";
		},
		set readOnly(e) {
			let t = e ? "false" : "plaintext-only";
			a.contentEditable !== t && (a.contentEditable = t);
		},
		get listening() {
			return !!f;
		},
		focus: _,
		destroy() {
			n.abort(), f?.abort(), v();
		}
	};
}
//#endregion
//#region src/comments-memory.ts
function za(e = {}) {
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
			if (await f(), !le.includes(t)) throw Error("Not one of the reactions");
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
export { Na as AaEditorElement, Di as AaToolbarElement, ua as BUTTON_PARTIAL, oa as BUTTON_STATES, Xe as CALLOUT_COLORS, Z as DEFAULT_ATOMS, At as EQUATION, hr as History, Dt as IMAGE, na as PROMPT_HERE, le as REACTION_EMOJIS, jt as TEXT_COLORS, V as aaLanguage, H as aaWord, fe as anchorThreads, de as applyEdit, wr as atomElement, Et as atomPattern, _t as besideChange, Zt as blockRuns, et as calloutIsBox, Y as changeCommentSource, _e as commentsLabel, ge as countThreads, Ea as createCommentsView, ja as createEditor, ii as createImageAtom, Ra as createPlainEditor, La as createWriter, Pa as defineAaEditor, ki as defineAaToolbar, cr as deleteBlocks, lr as duplicateBlocks, We as editTable, Ne as exportMarkdown, zn as fromMarkdown, Ue as fromTSV, ra as glisten, oi as imageAtom, fr as indentBlocks, xe as initialOf, $n as joinWithNext, Qn as joinWithPrevious, Zn as liftPrefix, Fa as localDrafts, ue as mapRange, za as memoryCommentStore, ye as mentionQuery, ve as mentionsIn, ur as moveBlocks, pe as movedThreads, St as parseBlocks, Xr as personAtom, Ce as personColour, ca as readButtonPartial, Qe as readCallout, at as readColumns, J as readCommentSource, Ot as readPicture, ht as readTabs, G as relativeTime, W as relocate, dr as renumber, $ as replaceRange, or as select, Ct as serialize, B as setAaWords, mr as setCallout, Ve as setTableWidths, Ui as sidePlacement, ri as sizePicture, Jn as sliceMarkdown, me as sortThreads, Xn as splitAt, Re as tableAlignments, X as tableRows, ze as tableWidths, U as textChange, he as threadsAt, Q as toMarkdown, ar as toggleBox, pr as toggleCallout, sr as turnInto, er as wrapSelection, la as writeButtonPartial, $e as writeCallout, st as writeColumns, Me as writeCommentSource, kt as writePicture, He as writeTable, gt as writeTabs };

