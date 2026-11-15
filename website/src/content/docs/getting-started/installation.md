---
title: Installation
description: Start with HTML and CSS, then add interactive components when needed.
---

For ordinary HTML, follow [Use with HTML](/start-here/quick-start/). It uses the current public stylesheet and fonts, with no framework or build step. [Download a complete example](/start-here/examples/html/) to begin.

Install the package for a project with a build step, or to host a pinned copy of the files yourself.

## Install the package

```sh
npm install @0001-labs/design-system-1
```

For interactive components, see the [component catalogue](/2-core/overview/#component-overview) and each component's import/API documentation. The package is another distribution channel, and it may lag the current documentation release; check that a component exists in the installed version. CSS-only pages do not need that package or its JavaScript bundle.

## Use it with a bundler

In a project with a bundler that handles CSS, import the stylesheet and the components once, at your entry point:

```js
import "@0001-labs/design-system-1/styles";
import "@0001-labs/design-system-1";
```

The first line loads the foundations. The second registers every `ds-*` element and exports the shared modules, such as `setThemeMode` and `setLanguage`. Then write the elements in your markup:

```html
<ds-button>Save</ds-button>
```

React apps use the adapters in `DS1/react` over these same Lit components. Server-rendered apps register the components in the browser.

## What the package holds

| Path | What it is |
| --- | --- |
| `dist/` | The built bundle with Lit included, its JavaScript chunks and its types. |
| `DS1/` | The source: components, stylesheets, fonts and React adapters. |

| Import | What it gives you |
| --- | --- |
| `@0001-labs/design-system-1` | The bundle, `dist/design-system-1.bundle.js`. |
| `@0001-labs/design-system-1/styles` | The foundations, `DS1/1-root/one.css`. |
| `@0001-labs/design-system-1/DS1/*` | Any source file. |
| `@0001-labs/design-system-1/dist/*` | Any built file. |

## Hosting the files yourself

The public URLs in [Use with HTML](/start-here/quick-start/) follow the current documentation release and need a connection. For a pinned or offline copy, host the package's files on your own site:

1. Copy the bundle from `dist/` with the JavaScript chunks beside it.
2. Copy the stylesheets from `DS1/1-root/` with their `fonts` folder.
3. Keep their relative paths, so the bundle finds its chunks and the stylesheets find their fonts.
4. Link the stylesheet and load the bundle as a module, as in [Use with HTML](/start-here/quick-start/).

jsDelivr serves the same files by version, at `https://cdn.jsdelivr.net/npm/@0001-labs/design-system-1@latest/` or with an exact version in place of `latest`.

[Use with HTML](/start-here/quick-start/) · [Scaling](/1-root/scaling/) · [Theming](/1-root/theming/)
