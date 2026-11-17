(function () {
  if (typeof window === "undefined" || typeof document === "undefined" || window.DS_ONE_THEME) return;
  var root = document.documentElement;
  var MODES = ["light", "dark", "system"];
  var LANGUAGES = ["da", "de", "en", "es", "fi", "fr", "is", "it", "ja", "ko", "nb", "nn", "no", "pt", "pt-BR", "sv", "zh"];
  var PAPER = { light: "#ffffff", dark: "#2a2a2a" };
  var session = null;
  var shown = null;
  var shownMode = null;
  var crossing = null;

  function options() { return window.DS_ONE_PREFERENCES || {}; }
  function key() { return options().themeStorageKey || "ds-one:theme"; }
  function query(media) {
    try { return window.matchMedia ? window.matchMedia(media) : null; } catch { return null; }
  }

  function mode() {
    if (session) return session;
    if (options().themeMode === "system") return "system";
    try {
      var stored = window.localStorage.getItem(key());
      if (MODES.indexOf(stored) >= 0) return stored;
    } catch {}
    var first = options().themeDefault;
    return MODES.indexOf(first) >= 0 ? first : "system";
  }

  function resolve(choice) {
    if (choice !== "system") return choice;
    var system = query("(prefers-color-scheme: dark)");
    return system && system.matches ? "dark" : "light";
  }

  function paint(theme) {
    root.classList.remove(theme === "dark" ? "light-theme" : "dark-theme");
    root.classList.add(theme + "-theme");
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
    root.style.setProperty("--lightningcss-light", theme === "light" ? "initial" : " ");
    root.style.setProperty("--lightningcss-dark", theme === "dark" ? "initial" : " ");
    var paper = options().themePaper;
    if (paper === false) return;
    var colour = (paper && paper[theme]) || PAPER[theme];
    root.style.backgroundColor = colour;
    var meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (!meta && document.head) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    if (meta) meta.setAttribute("content", colour);
  }

  function cross(theme) {
    var reduced = query("(prefers-reduced-motion: reduce)");
    if (typeof document.startViewTransition !== "function" || (reduced && reduced.matches) || document.visibilityState === "hidden") {
      paint(theme);
      return;
    }
    if (crossing) crossing.skipTransition();
    var painted = false;
    var once = function () { if (!painted) { painted = true; paint(theme); } };
    try {
      var transition = document.startViewTransition(once);
      crossing = transition;
      void transition.ready.catch(function () {});
      void transition.updateCallbackDone.catch(once);
      void transition.finished.catch(function () {}).then(function () { if (crossing === transition) crossing = null; });
    } catch {
      once();
    }
  }

  function apply() {
    var choice = mode();
    var theme = resolve(choice);
    var first = shown === null;
    var moved = theme !== shown || choice !== shownMode;
    if (!first && theme !== shown) cross(theme);
    else paint(theme);
    shown = theme;
    shownMode = choice;
    if (!first && moved) window.dispatchEvent(new CustomEvent("theme-changed", { detail: { theme: theme, mode: choice } }));
  }

  function set(choice) {
    if (MODES.indexOf(choice) < 0) return;
    session = null;
    if (options().themeMode === "system") {
      if (choice !== "system") session = choice;
    } else {
      try { window.localStorage.setItem(key(), choice); } catch { session = choice; }
    }
    apply();
  }

  var i18n = window.DS_ONE_I18N || {};
  function addressLanguage() {
    if (!i18n.languageFromAddress) return null;
    var routing = i18n.routing || {};
    var prefixed = (routing.languages && routing.languages.length ? routing.languages : null) || (i18n.languages && i18n.languages.length ? i18n.languages : null) || LANGUAGES;
    var segment = String((window.location && window.location.pathname) || "").split("/")[1] || "";
    var slug = segment.toLowerCase().replace(/_/g, "-");
    if (!slug) return null;
    for (var index = 0; index < prefixed.length; index++) {
      if (String(prefixed[index]).toLowerCase().replace(/_/g, "-") === slug) return String(prefixed[index]);
    }
    return null;
  }
  function storedLanguage() {
    if (i18n.persist === false) return null;
    try {
      var language = window.localStorage.getItem(i18n.storageKey || "language");
      if (language && (!i18n.languages || i18n.languages.indexOf(language) >= 0)) return language;
    } catch {}
    return null;
  }
  if (i18n.langTarget === undefined) {
    var language = addressLanguage() || storedLanguage();
    if (language && /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(language)) root.lang = language;
  }

  window.DS_ONE_THEME = {
    mode: function () { return shownMode; },
    theme: function () { return shown; },
    set: set,
    apply: function () { apply(); },
  };
  apply();

  var system = query("(prefers-color-scheme: dark)");
  if (system && system.addEventListener) system.addEventListener("change", function () { apply(); });
  else if (system && system.addListener) system.addListener(function () { apply(); });
  window.addEventListener("storage", function (event) { if (event.key === null || event.key === key()) apply(); });
  window.addEventListener("pageshow", function () { apply(); });
})();

(function () {
  if (typeof window === "undefined" || typeof document === "undefined" || window.DS_ONE_SHAPE) return;
  var root = document.documentElement;
  var SHAPES = ["square", "rounded", "circular"];
  var session = null;
  function options() { return window.DS_ONE_PREFERENCES || {}; }
  function key() { return options().shapeStorageKey || "ds-one:shape"; }
  function stored() {
    if (session) return session;
    try {
      var saved = window.localStorage.getItem(key());
      if (SHAPES.indexOf(saved) >= 0) return saved;
    } catch {}
    return SHAPES.indexOf(options().shapeDefault) >= 0 ? options().shapeDefault : null;
  }
  function apply() {
    var shape = stored();
    if (shape) root.setAttribute("data-ds-shape", shape);
    else root.removeAttribute("data-ds-shape");
    return shape;
  }
  function set(shape) {
    if (SHAPES.indexOf(shape) < 0) return;
    try { window.localStorage.setItem(key(), shape); session = null; } catch { session = shape; }
    apply();
    window.dispatchEvent(new CustomEvent("shape-changed", { detail: { shape: shape } }));
  }
  window.DS_ONE_SHAPE = { shape: stored, set: set, apply: apply };
  apply();
  window.addEventListener("storage", function (event) { if (event.key === null || event.key === key()) apply(); });
})();
