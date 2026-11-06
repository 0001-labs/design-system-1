import { blockRuns as e, parseBlocks as t } from "./aa.js";
//#endregion
//#region src/words.ts
var n = { da: {
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
} }, r = Symbol.for("design-system-1.translate"), i = Symbol.for("aa.words"), a = globalThis;
function o() {
	return (typeof document > "u" ? "" : document.documentElement.lang || "").trim().toLowerCase() || "en";
}
function s(e, t) {
	let s = o(), c = a[i], l = typeof c == "function" ? c(e, s) : c?.[e];
	if (l === void 0) {
		let t = globalThis[r];
		if (typeof t == "function") {
			let n = String(t(e));
			n !== e && (l = n);
		}
	}
	l === void 0 && (l = n[s]?.[e] ?? n[s.split("-")[0]]?.[e]);
	let u = l ?? e;
	return t ? u.replace(/\{(\w+)\}/g, (e, n) => n in t ? String(t[n]) : e) : u;
}
//#endregion
//#region src/dictation.ts
var c = typeof navigator < "u" && /^((?!chrome|chromium|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);
function l(e) {
	return e === "not-allowed" ? s(c ? "The microphone is blocked: allow it for this site in Safari › Settings › Websites › Microphone" : "The microphone is blocked: allow it for this site in the browser’s settings") : e === "service-not-allowed" ? s(c ? "Turn on Dictation in System Settings › Keyboard to speak here" : "Speaking is turned off in this browser") : e === "audio-capture" ? s("No microphone was found") : e === "network" ? s("Speaking needs a connection") : e === "no-speech" ? s("Nothing was heard: press Space twice to try again") : null;
}
function u() {
	let e = globalThis, t = e.SpeechRecognition ?? e.webkitSpeechRecognition;
	return t ? new t() : null;
}
function d(e, t, n) {
	return e ? .85 : Math.min(1, .55 + .3 * t + .3 * n);
}
function f(e, t) {
	if (t.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return {
		followVoice: null,
		stop: () => {}
	};
	let n = 0, r = !1, i = 0, a = d(!1, 0, 0), o = null, s, l, u = /* @__PURE__ */ new Float32Array(512), f = performance.now(), p = -Infinity, m = !1, h = null, g = (t) => {
		if (r) return;
		o && (o.getFloatTimeDomainData(u), i += (Math.min(1, Math.sqrt(u.reduce((e, t) => e + t * t, 0) / u.length) * 8) - i) * .15);
		let s = e.getBoundingClientRect();
		h && (Math.abs(s.left - h.x) > .5 || Math.abs(s.top - h.y) > .5) && (p = t), h = {
			x: s.left,
			y: s.top
		};
		let c = t - p < 500;
		m && !c && (f = t), m = c;
		let l = .5 - .5 * Math.cos((t - f) / 2400 * 2 * Math.PI);
		a += (d(c, l, i) - a) * .12, e.style.opacity = a.toFixed(3), n = requestAnimationFrame(g);
	};
	return n = requestAnimationFrame(g), {
		followVoice: async () => {
			if (!c && navigator.mediaDevices?.getUserMedia && typeof AudioContext < "u") try {
				let e = await navigator.mediaDevices.getUserMedia({ audio: !0 });
				if (r) {
					e.getTracks().forEach((e) => e.stop());
					return;
				}
				s = e, l = new AudioContext(), o = l.createAnalyser(), o.fftSize = u.length, l.createMediaStreamSource(e).connect(o);
			} catch {}
		},
		stop: () => {
			r = !0, cancelAnimationFrame(n), s?.getTracks().forEach((e) => e.stop()), l?.close();
		}
	};
}
//#endregion
//#region src/shimmer.ts
function p(e) {
	let t = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(e);
	if (t) return (.2126 * t[1] + .7152 * t[2] + .0722 * t[3]) / 255;
	let n = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(e);
	if (n) return .2126 * n[1] + .7152 * n[2] + .0722 * n[3];
	let r = /^ok(?:lch|lab)\(\s*([\d.]+)(%?)/.exec(e);
	if (r) return r[2] ? r[1] / 100 : +r[1];
	let i = /^(?:lch|lab)\(\s*([\d.]+)/.exec(e);
	return i ? i[1] / 100 : null;
}
function m(e, t) {
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
//#region src/prompt.ts
function h(e) {
	let t = e.type.ownerDocument, n = t.defaultView, r = t.createElement("div");
	r.className = "aa-prompt", r.setAttribute("role", "textbox"), r.setAttribute("aria-label", s("Ask AI")), r.dataset.placeholder = e.placeholder ?? s("Ask AI or press space to speak"), r.spellcheck = !1;
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
	let a = p(i.color);
	a !== null && a > .5 && (r.dataset.dark = "");
	let o = e.root ?? t.body;
	o.append(r);
	let c = typeof ResizeObserver > "u" ? null : new ResizeObserver(() => e.grow?.(r.offsetHeight));
	c?.observe(r);
	let d = o === t.body;
	d && (r.dataset.placed = "page");
	let h = () => {
		if (!d) return {
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
	}, g = () => {
		let t = e.place(), n = h();
		Object.assign(r.style, {
			left: `${t.left + n.x}px`,
			top: `${t.top + n.y}px`,
			width: `${Math.max(t.width, 80)}px`,
			minHeight: `${t.height}px`,
			textIndent: e.indent ? `${e.indent}px` : ""
		});
	};
	g(), r.focus({ preventScroll: !0 });
	let _ = !1, v = null, y = () => {}, b = null, x = null, S = null, C = null, w = () => {
		if (!S) return;
		let e = t.createRange();
		e.setStartBefore(S), e.collapse(!0);
		let r = n.getSelection();
		r?.removeAllRanges(), r?.addRange(e);
	}, T = () => {
		S && S.toggleAttribute("data-after", !!O());
	}, E = () => {
		S?.remove(), S = null, C &&= (C.stop(), null);
	}, D = () => {
		if (!S) return null;
		let e = f(S, n);
		return C = {
			frame: 0,
			stop: e.stop
		}, e.followVoice;
	}, O = () => (r.textContent ?? "").replace(/\s+/g, " ").trim(), k = (t = !1) => {
		_ || (_ = !0, v?.abort(), b?.abort(), E(), y(), c?.disconnect(), r.remove(), e.grow?.(0), n.removeEventListener("scroll", g, !0), n.removeEventListener("resize", g), e.close(t));
	}, A = () => {
		let i = u();
		if (!i) {
			r.dataset.placeholder = s("Speaking is not available in this browser");
			return;
		}
		b = i, r.dataset.listening = "", S = Object.assign(t.createElement("span"), {
			className: "aa-prompt-caret",
			contentEditable: "false"
		}), S.setAttribute("aria-hidden", "true"), r.append(S), T(), w(), r.dataset.placeholder = s("Listening…"), i.lang = t.documentElement.lang || navigator.language, i.continuous = !0, i.interimResults = !0;
		let a = null;
		i.onresult = (e) => {
			for (let n = e.resultIndex; n < e.results.length; n++) {
				let i = e.results[n], a = i[0]?.transcript ?? "";
				x ??= Object.assign(t.createElement("i"), {
					className: "aa-prompt-heard",
					contentEditable: "false"
				}), x.isConnected || (S ? S.before(x) : r.append(x)), x.textContent = `${x.previousSibling && !/\s$/.test(x.previousSibling.textContent ?? "") ? " " : ""}${a.trim()}`, i.isFinal && (x.removeAttribute("class"), x.removeAttribute("contenteditable"), x.textContent = `${O() && !/\s$/.test(r.textContent ?? "") && x.previousSibling ? " " : ""}${a.trim()}`, x = null);
			}
			T();
			let i = n.getSelection();
			i?.rangeCount && r.contains(i.anchorNode) && !(i.isCollapsed && S && i.anchorNode === r && r.childNodes[i.anchorOffset] === S) || w();
		}, i.onend = () => {
			b = null, E(), delete r.dataset.listening, r.dataset.placeholder = a ?? e.placeholder ?? s("Ask AI to write");
		}, i.onerror = (e) => {
			a = l(e.error) ?? a, i.onend?.();
		};
		try {
			i.start();
		} catch {
			a = s("Speaking could not start here"), i.onend?.();
			return;
		}
		let o = D();
		o && (i.onaudiostart = () => {
			o();
		});
	}, j = async () => {
		let t = O();
		if (t && !v) {
			b?.stop(), v = new AbortController(), r.contentEditable = "false", r.dataset.loading = "", r.setAttribute("aria-busy", "true"), y = m([r, ...e.about()]);
			try {
				await e.send(t, v.signal), k(!0);
			} catch {
				if (_) return;
				y(), v = null, delete r.dataset.loading, r.removeAttribute("aria-busy"), r.dataset.failed = "", r.contentEditable = "plaintext-only", r.contentEditable !== "plaintext-only" && (r.contentEditable = "true"), r.focus({ preventScroll: !0 });
			}
		}
	};
	r.addEventListener("keydown", (e) => {
		e.stopPropagation(), !e.isComposing && (delete r.dataset.failed, e.key === "Escape" ? (e.preventDefault(), k()) : e.key === "Enter" && !e.shiftKey ? (e.preventDefault(), j()) : e.key === "Backspace" && !r.textContent ? (e.preventDefault(), k()) : e.key === " " && !r.textContent && !b && (e.preventDefault(), A()));
	}), r.addEventListener("beforeinput", (e) => {
		e.stopPropagation(), !(e.isComposing || b || r.textContent) && e.inputType === "insertText" && (e.data === " " || e.data === "\xA0") && (e.preventDefault(), A());
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
		!v && !b && !O() && k();
	}), n.addEventListener("scroll", g, !0), n.addEventListener("resize", g), e.listen && A(), {
		element: r,
		close: () => k()
	};
}
var g = 4e3, _ = /* @__PURE__ */ new Set([
	"paragraph",
	"heading",
	"bullet",
	"quote",
	"callout"
]), v = /[\p{L}\p{M}\p{N}_]/u, y = /[\p{L}\p{M}\p{N}_]+(?:['’][\p{L}\p{M}\p{N}_]+)*|\s+|[^]/gu, b = /(?:https?:\/\/|www\.)\S+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
function x(e) {
	return _.has(e.kind) && e.source.length <= g && /\p{L}/u.test(e.source);
}
function S(t, n) {
	if (!x(t)) return [];
	let r = [];
	for (let i of e(t, n)) {
		if (i.kind !== "text" || i.code) continue;
		let e = r[r.length - 1];
		e && e[1] === i.from ? e[1] = i.to : r.push([i.from, i.to]);
	}
	for (let e of t.source.matchAll(b)) {
		let t = e.index, n = t + e[0].length;
		r = r.flatMap(([e, r]) => r <= t || e >= n ? [[e, r]] : [...e < t ? [[e, t]] : [], ...r > n ? [[n, r]] : []]);
	}
	return r;
}
var C = (e) => Array.from(e.matchAll(y), (e) => ({
	text: e[0],
	at: e.index
}));
function w(e, t) {
	let n = C(e), r = C(t), i = (t) => t < n.length ? n[t].at : e.length, a = (e, t) => r.slice(e, t).map((e) => e.text).join(""), o = 0;
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
var T = (e, t) => {
	let n = 0;
	for (; n < e.length && n < t.length && e[n] === t[n];) n++;
	let r = 0;
	for (; r < e.length - n && r < t.length - n && e[e.length - 1 - r] === t[t.length - 1 - r];) r++;
	return Math.max(e.length, t.length) - n - r;
};
function E(n, r) {
	let i = t(n);
	if (i.length !== 1) return "";
	let { start: a, ...o } = i[0], s = [];
	for (let t of e(o, r)) {
		let e = t.kind === "text" && !t.code ? [
			"text",
			t.bold,
			t.italic,
			t.strike,
			t.highlight,
			t.href
		] : [t.kind, n.slice(t.from, t.to)];
		(e[0] !== "text" || JSON.stringify(s[s.length - 1]) !== JSON.stringify(e)) && s.push(e);
	}
	return JSON.stringify([
		o.kind,
		o.prefix,
		o.level,
		o.checked,
		o.number,
		o.callout,
		o.icon,
		o.color,
		o.folded,
		s
	]);
}
var D = (e, t) => `${e}\u0000${t}`;
function O(e, t, n = {}) {
	let { source: r } = e, [, i, , a] = /^(\s*)([^]*?)(\s*)$/.exec(r), o = i + t.trim() + a, s = S(e, n.atoms);
	if (o === r || !t.trim() || !s.length) return {
		edits: [],
		partial: !1
	};
	let c = w(r, o).filter((e) => s.some(([t, n]) => e.from >= t && e.to <= n)), l = s.reduce((e, [t, n]) => e + n - t, 0);
	if (c.reduce((e, t) => e + T(r.slice(t.from, t.to), t.text), 0) > Math.max(12, l / 2)) return {
		edits: [],
		partial: !1
	};
	let u = E(r, n.atoms), d = [], f = !1, p = r, m = 0;
	for (let e of c) {
		let t = r.slice(e.from, e.to);
		if (/\n/.test(t + e.text) || n.rejected?.has(D(t, e.text))) continue;
		let i = n.protect;
		if (i && e.from <= i[1] && e.to >= i[0]) {
			f = !0;
			continue;
		}
		let a = p.slice(0, e.from + m) + e.text + p.slice(e.to + m);
		E(a, n.atoms) === u && (d.push(e), p = a, m += e.text.length - t.length);
	}
	return {
		edits: d,
		partial: f
	};
}
function k(e, t) {
	let n = e;
	for (let e = t.length - 1; e >= 0; e--) n = n.slice(0, t[e].from) + t[e].text + n.slice(t[e].to);
	return n;
}
function A(e, t) {
	let n = k(e, t), r = [], i = 0;
	for (let e of t) {
		let t = e.from + i;
		i += e.text.length - (e.to - e.from);
		let [a, o] = M(n, t, t + e.text.length);
		for (; a < o && /\s/.test(n[a]);) a++;
		for (; o > a && /\s/.test(n[o - 1]);) o--;
		if (a === o) continue;
		let s = r[r.length - 1];
		s && a <= s[1] ? s[1] = Math.max(s[1], o) : r.push([a, o]);
	}
	return r;
}
function j(e, t) {
	let n = 0;
	for (let r of t) {
		if (e <= r.from) break;
		if (e < r.to) return r.from + n + Math.min(e - r.from, r.text.length);
		n += r.text.length - (r.to - r.from);
	}
	return e + n;
}
function M(e, t, n = t) {
	for (; t > 0 && v.test(e[t - 1]);) t--;
	for (; n < e.length && v.test(e[n]);) n++;
	return [t, n];
}
function N(e, t, n = !0) {
	let r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), s = [], c = /* @__PURE__ */ new Set(), l, u = !1, d = (e, t) => {
		o.delete(e), o.set(e, t), o.size > 200 && o.delete(o.keys().next().value);
	}, f = (t, a) => {
		let o = e.blocks().indexOf(t);
		if (!n || o < 0 || e.busy()) return;
		let l = e.selection(), u = null;
		if (l) {
			let [e, n] = l.anchor.block < l.focus.block || l.anchor.block === l.focus.block && l.anchor.offset <= l.focus.offset ? [l.anchor, l.focus] : [l.focus, l.anchor];
			e.block <= o && n.block >= o && (u = M(t.source, e.block === o ? e.offset : 0, n.block === o ? n.offset : t.source.length));
		}
		let { edits: f, partial: p } = O(t, a, {
			atoms: e.atoms,
			protect: u,
			rejected: c
		});
		r.delete(t), i.delete(t);
		let m = t;
		f.length && (e.apply(o, k(t.source, f), (e) => j(e, f), A(t.source, f)), m = e.blocks()[o], p && d(m.source, a), s.push({
			value: e.value(),
			pairs: f.map((e) => D(t.source.slice(e.from, e.to), e.text))
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
			if (o || f) for (let e of s) !c.has(e) && x(e) && r.add(e);
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
//#region src/selection.ts
function P(e, t, n) {
	let r = new AbortController(), { signal: i } = r, a = typeof ResizeObserver > "u" ? null : new ResizeObserver(n);
	return a?.observe(t), e.addEventListener("scroll", n, {
		capture: !0,
		signal: i
	}), e.addEventListener("resize", n, { signal: i }), e.visualViewport?.addEventListener("resize", n, { signal: i }), () => {
		a?.disconnect(), r.abort();
	};
}
//#endregion
//#region src/marks.ts
function F(e, t) {
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
function I(e, t) {
	let n = /^(\s*[-*+][ \t]+)\[([ xX])\]/, r = n.exec(e), i = n.exec(t);
	return !!r && !!i && r[2].toLowerCase() !== i[2].toLowerCase() && e.slice(r[0].length) === t.slice(i[0].length);
}
function L(e, t) {
	let n = e.ownerDocument, r = n.defaultView, i = [], a = null, o = 0, c = /* @__PURE__ */ new Set(), l = () => i.filter((e) => e.blocks.every((e) => t.blocks().includes(e))), u = () => {
		o = 0, i = l(), t.shown?.(i);
		let r = t.elements(), u = t.blocks(), f = new Set(i.filter((e) => e.box).flatMap((e) => e.blocks.map((e) => r[u.indexOf(e)])));
		for (let e of c) f.has(e) || e.removeAttribute("data-ai-box");
		for (let e of f) e?.setAttribute("data-ai-box", "");
		if (c = f, !i.length) {
			a?.remove(), a = null;
			return;
		}
		if (!a) {
			let r = n.createElement("div");
			r.className = "aa-ai-marks", (t.root ?? e.closest("dialog") ?? n.body).append(r), a = r;
		}
		let p = i.map((e) => {
			let a = e.blocks.map((e) => r[u.indexOf(e)]?.getBoundingClientRect()).filter((e) => !!e);
			if (!a.length) return null;
			let o = e.blocks.length > 1 || e.before.length > 1 || /^(`{3,}|~{3,})/.test(e.blocks[0]?.source ?? ""), c = n.createElement("div");
			c.className = "aa-ai-mark", c.dataset.kind = o ? "section" : "dot";
			let l = Math.min(...a.map((e) => e.top)), f = Math.max(...a.map((e) => e.bottom)), p = Math.min(...a.map((e) => e.left)), m = Math.max(...a.map((e) => e.right));
			if (o) {
				let e = n.createElement("div");
				e.className = "aa-ai-hold", Object.assign(e.style, {
					left: `${p - 4}px`,
					top: `${l - 4}px`,
					width: `${m - p + 8}px`,
					height: `${f - l + 8}px`
				}), c.append(e);
			}
			let h = o ? {
				x: m,
				y: l + 10
			} : R(r[u.indexOf(e.blocks[0])]) ?? {
				x: m,
				y: l + 10
			}, g = n.createElement("button");
			return g.type = "button", g.className = "aa-ai-revert", g.setAttribute("aria-label", s(o ? "Revert what AI wrote here" : "Revert what AI changed here")), g.title = s("Revert"), g.style.left = `${h.x}px`, g.style.top = `${h.y}px`, g.append(Object.assign(n.createElement("span"), { className: "aa-ai-dot" }), Object.assign(n.createElement("span"), {
				className: "aa-ai-label",
				textContent: s("Revert")
			})), g.addEventListener("pointerdown", (e) => {
				e.preventDefault(), e.stopPropagation();
			}), g.addEventListener("click", (n) => {
				n.preventDefault(), n.stopPropagation(), t.revert(e), i = i.filter((t) => t !== e), d();
			}), c.append(g), c;
		}).filter((e) => !!e);
		a.replaceChildren(...p);
	}, d = () => {
		o ||= r.requestAnimationFrame(u);
	}, f = () => {
		if (!i.length) return;
		e.setAttribute("data-ai-fading", ""), a?.setAttribute("data-fading", "");
		let t = r.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
		setTimeout(() => {
			e.removeAttribute("data-ai-fading"), i = [], u();
		}, t ? 0 : 400);
	}, p = P(r, e, d);
	return {
		set(e) {
			i = e.filter((e) => e.blocks.length), u();
		},
		clear: f,
		get size() {
			return l().length;
		},
		draw: d,
		destroy() {
			o && r.cancelAnimationFrame(o), p(), a?.remove();
		}
	};
}
function R(e) {
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
export { F as changedWords, N as createCorrection, L as createMarks, I as onlyBox, h as openPrompt };

