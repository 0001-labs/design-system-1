---
title: Preferences
description: A record of a reader's choices in the browser, and the options that name where theme and shape are stored.
---

The preferences module keeps a reader's choices together in the browser, as one object you can add to.

## Overview

`savePreferences()` merges what you give it into one JSON object in `localStorage`, so settings last across sessions. It is a record: theme and language each keep a store of their own, and that is what they read back when a page opens. Use it for choices of your own, and to keep a note of those two beside them.

[Cycle](/2-core/cycle/) calls it for you whenever a reader changes the language, the theme or the accent colour.

## Basic Usage

```javascript
import { savePreferences } from '@0001-labs/design-system-1';

// Save user preferences
savePreferences({
  language: 'ja',
  theme: 'dark'
});
```

Each call merges into what is stored, so keys you do not name keep their values.

## Preference Types

### Language

```javascript
import { savePreferences } from '@0001-labs/design-system-1';

savePreferences({
  language: 'ja'
});
```

A language is a `LanguageCode`. The page's language itself is set with `setLanguage()`; see [Languages](/1-root/languages/).

### Theme

```javascript
savePreferences({
  theme: 'dark' // or 'light' or 'system'
});
```

The page's theme itself is set with `setThemeMode()`; see [Theming](/1-root/theming/).

### Custom Preferences

Any other key is yours. Its value must survive `JSON.stringify`.

```javascript
savePreferences({
  customSetting: 'value',
  anotherSetting: 123
});
```

## Storage

Preferences are stored in localStorage under the key `ds-one:preferences`:

```javascript
// Storage structure
{
  "language": "ja",
  "theme": "light",
  "customSetting": "value"
}
```

The module has no function to read this object: read it with `localStorage` and `preferenceStorageKey("preferences")`, which gives the key in use. `preferenceStorageKey("theme")` gives the theme's.

Each choice has its own store:

| Choice | Key | Set by |
| --- | --- | --- |
| The merged object | `ds-one:preferences` | `savePreferences()` |
| Theme | `ds-one:theme` | `setThemeMode()` |
| Shape | `ds-one:shape` | `setShape()` |
| Language | `language` | `setLanguage()` |

A product with its own storage names sets them on `window.DS_ONE_PREFERENCES` before these modules load. The language's key is set apart, through `configureI18n`.

| Option | Default | What it does |
| --- | --- | --- |
| `storageKey` | `ds-one:preferences` | The key of the merged object. |
| `themeStorageKey` | `ds-one:theme` | The key of the theme. |
| `themeMode` | Unset | `system` follows the system without reading or writing a saved theme. |
| `themeDefault` | `system` | The theme of a reader who has chosen none: `light`, `dark` or `system`. |
| `themePaper` | The system's paper | The canvas and the browser's theme colour for each theme, `light` and `dark`. `false` leaves both to the page. |
| `shapeStorageKey` | `ds-one:shape` | The key of the shape. |
| `shapeDefault` | Unset | The shape of a reader who has chosen none: `square`, `rounded` or `circular`. |

```html
<script>window.DS_ONE_PREFERENCES = { storageKey: 'product:preferences', themeStorageKey: 'product:theme' };</script>
```

## Type Definition

```typescript
type Preferences = {
  language?: LanguageCode;
  theme?: ThemeMode;
  [key: string]: unknown;
};
```

## Error Handling

The module handles storage errors gracefully:

```javascript
import { savePreferences } from '@0001-labs/design-system-1';

// Won't throw if localStorage is unavailable
savePreferences({ theme: 'dark' });
// Logs a warning if storage fails
```

Outside a browser it does nothing. If what is stored is not valid JSON, that save is skipped with the same warning.

## Integration

Preferences work beside the other Design system 1 modules. `setThemeMode()` and `setLanguage()` store their own choice, so the second line in each example below only keeps it in the merged object too.

### With Theme

```javascript
import { setThemeMode, savePreferences } from '@0001-labs/design-system-1';

function updateTheme(mode) {
  setThemeMode(mode);
  savePreferences({ theme: mode });
}
```

### With i18n

```javascript
import { setLanguage, savePreferences } from '@0001-labs/design-system-1';

function updateLanguage(language) {
  setLanguage(language);
  savePreferences({ language });
}
```

## Best Practices

1. **Save what changed** - Each call merges, so pass only the keys that changed
2. **Handle errors** - Storage might be unavailable in private browsing, so keep a choice working for the current page without it
3. **Validate values** - Ensure preference values are valid before saving

[Theming](/1-root/theming/) · [Languages](/1-root/languages/) · [Shape](/1-root/shape/) · [Cycle](/2-core/cycle/)
