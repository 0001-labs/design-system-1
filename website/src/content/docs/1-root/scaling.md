---
title: Scaling
description: The page's scale, --sf, for phones and tablets, Desktop aligned for a computer, put on before the first paint
---

Every measure in Design system 1 is a number of squares multiplied by `--sf`. The scaling module (`DS1/0-face/scaling.ts`) works the scale out and puts it on the page.

## The rule

- **A computer stays at 1**, however narrow its window. A narrow window rearranges the layout with media queries; it does not scale. A page that asks for [Desktop aligned](#desktop-aligned) moves the scale slightly, so the window is whole squares wide.
- **A phone or a tablet** is drawn as if the screen were 280 units wide: the scale is the page's width (without its scroll bar) over 280, never under 0.75 or over 2. A 375px phone gets 1.339, so everything is a third larger.
- A phone or tablet is a mobile browser, or a screen that takes touch and whose shorter side is at most 820px.

## Which screens scale

Before it works out a scale, the module decides whether the page is on a phone or a tablet. That decision is the only one it needs about the device, and it makes it itself, with nothing imported:

1. **The browser says it is mobile.** The user agent names a phone or tablet: `Mobile`, `Android`, `iPhone`, `iPad`, `iPod`, `Windows Phone`, `Kindle`, `Silk`, `Opera Mini`, `Tablet` and the like.
2. **Or the screen takes touch and is small enough.** It reports more than one touch point (`navigator.maxTouchPoints > 1`) and the shorter side of the window is at most 820px. An iPad that reports itself as a Mac is caught here when its shorter side is 820px or less, and so is a phone browser asking for the desktop site. A larger iPad in desktop mode, 1024px on its shorter side, counts as a computer.

Either one makes it a phone or a tablet: the page scales, and the root gets `data-mobile`. Neither makes it a computer: `--sf` stays 1 and `data-mobile` is taken off. A touch-screen laptop whose window is wider and taller than 820px stays a computer, and so does a computer's window made as narrow as a phone's.

The check runs again with every resize and turn, so a tablet's split-screen view is decided afresh. The scale itself never tells a phone from a tablet; both follow the same rule, and only the cap at 2 sets a tablet apart.

The [Device](/1-root/device/) module makes the same check and also tells a tablet from a phone, marks the root `.mobile` or `.desktop`, and reports `scaling-changed`, for the pages that need more than the scale.

## On a phone or a tablet

A phone is always fourteen squares wide. 280 units are fourteen squares of 20, so the square grows with the screen instead of more squares fitting on it: a wider phone draws the same page larger, never a different one. Everything written in squares or multiplied by `--sf` grows by the same factor (the square, the type, the rows, the corners, the gaps), so the page keeps its proportions on every phone.

| Screen | `--sf` | A square | 14px type | Squares across |
| --- | --- | --- | --- | --- |
| 320px | 1.143 | 22.86px | 16px | 14 |
| 375px | 1.339 | 26.79px | 18.75px | 14 |
| 390px | 1.393 | 27.86px | 19.5px | 14 |
| 402px | 1.436 | 28.71px | 20.1px | 14 |
| 430px | 1.536 | 30.71px | 21.5px | 14 |
| 768px | 2 | 40px | 28px | 19.2 |
| A computer, any width | 1 | 20px | 14px | the window's width over 20 |

- **The scale stops at 2.** From 560px across, a tablet or a phone turned on its side keeps a 40px square and gains squares instead, so the layout's wider arrangements (its media queries) take over there as they do on a computer.
- **It does not go under 0.75.** Below 210px the square stays at 15px rather than shrink further, so fewer than fourteen fit across.
- **It follows the screen.** Turning the phone or resizing a split-screen view on a tablet works the scale out again at once, from the page's width without its scroll bar.
- **Media queries still read CSS pixels.** `--sf` changes what a square measures, not the width the browser reports, so a 375px phone still matches `max-width: 700px`. Use the widths to choose an arrangement and `[data-mobile]` for what differs on a touch screen.
- **Hairlines stay one pixel.** A border is the one length not multiplied by `--sf`.

Without `snap` the scale keeps three decimals, so a square on a 375px phone is 26.79px and long runs of rows can drift off the lines a little. `"layout"` gives 1.3390625 there, a square of exactly 1714 layout steps. `"pixel"` on a screen of three device pixels to the pixel gives 1.333, a square of 80 device pixels (26.67px), so every line falls on a whole pixel.

## Put it on the page

Call `startScaling()` before the page renders, so the first paint is already to scale:

```ts
import { startScaling } from './ds1/0-face/scaling';

startScaling();
```

It sets `--sf` on the root element, and `data-mobile` on a phone or tablet, and follows every resize and turn of the screen. It returns a function that stops following. `applyScaling()` does the same once and returns the factor.

| Option | Default | What it does |
| --- | --- | --- |
| `snap` | none | `"layout"` rounds the scale so a square is a whole number of the 1/64px steps browsers lay pages out in; long runs of rows stay on lines drawn exactly. `"pixel"` rounds it down so a square is a whole number of device pixels, which keeps every grid line and hairline sharp. |
| `baseWidth`, `minScale`, `maxScale` | 280, 0.75, 2 | The rule above. |
| `mode` | `"auto"` | `"fixed"` keeps the scale at 1. |
| `desktop` | none | `"aligned"` puts a computer's window on whole squares; see [Desktop aligned](#desktop-aligned). |
| `columns` | none | With Desktop aligned, `"even"` takes an even number of squares across, so a centred column stands on whole squares. |
| `root` | the document's root | The element that receives `--sf` and `data-mobile`. With an element `surface`, the element that receives that surface's `--sf`. |
| `surface` | none | Scale a surface to its own width instead; see below. |

```ts
startScaling({ snap: 'layout' });
```

## A surface with a scale of its own

A phone drawn on a page, such as a prototype in a frame, scales to its own width rather than the window's, on any device, a computer too:

```ts
startScaling({ surface: document.querySelector('.phone'), snap: 'pixel' });
// Or every element marked data-ds-surface:
startScaling({ surface: true });
```

```html
<div class="phone" data-ds-surface>…</div>
```

The surface is measured by its `clientWidth` and scaled by the same rule (its width over 280, between 0.75 and 2) and the same `snap`. `--sf` goes on the surface, and `--ds-sf` with it, so the shared components inside draw at the surface's scale; the page's `--sf` and `data-mobile` are left alone. Marked `data-ds-surface`, the surface's own `--ds-unit` spacing follows too. `startScaling` follows each surface's size through a `ResizeObserver` as well as the window's resizes and turns, and finds the `data-ds-surface` elements once, when it is called. `applyScaling({ surface })` does it once and returns the first surface's factor.

The surface's width must not depend on its own `--sf`: give it a width of the page around it (a percentage, a fixed frame, the viewport), and draw everything inside it in squares.

`toLayoutStep(factor)`, `toDevicePixel(factor, pixelRatio)` and `calculateScalingFactor(width, config)` are the calculations alone.

## Desktop aligned

A phone is always fourteen squares wide, so its page ends on a square at both sides. A computer's window is any width: at 1447px it holds 72.35 squares, and the right edge cuts through one. Desktop aligned gives a computer the same exactness. It is opt-in:

```ts
startScaling({ desktop: 'aligned' });
```

**Across, the scale moves to the nearest whole number of squares.** Fewer squares would draw the page slightly larger and one more would draw it slightly smaller; the count whose scale is closer to 1 is taken, and `--sf` is the window's width over that many squares. The change is small, under one percent from 1000px across, and it is worked out again with every resize.

**Down, what is left over goes to the top.** The height cannot be made whole the same way, since the scale is already set by the width. The rows are the whole squares that fit, and the rest, always under one square, is added to the first row. That row is a little taller, and every row under it, down to the window's bottom edge, is a whole square.

| Window | Squares across | `--sf` | A square | Rows at 900px high | Left over on top |
| --- | --- | --- | --- | --- | --- |
| 1440px | 72 | 1 | 20px | 45 | 0 |
| 1447px | 72 | 1.00486, up | 20.097px | 44 | 15.72px |
| 1453px | 73 | 0.99521, down | 19.904px | 45 | 4.32px |

On a computer the root gets `data-desktop-aligned` and four values:

| Property | What it holds |
| --- | --- |
| `--sf` | The scale, kept exact so the last square ends on the window's edge. |
| `--ds-grid-columns` | Whole squares across. |
| `--ds-grid-rows` | Whole squares down, under the leftover. |
| `--ds-grid-top` | The leftover, in pixels. |

`grid.css` puts the leftover on as the body's top padding, so a page in the normal flow needs nothing more: everything starts under it. Two layouts take it themselves:

```css
/* A bar fixed to the top is its squares and the leftover. */
.bar {
  height: calc(2 * var(--ds-grid-unit) + var(--ds-grid-top, 0px));
}
/* A layout as high as the window is the whole rows under the leftover. */
.app {
  height: calc(var(--ds-grid-rows) * var(--ds-grid-unit));
}
```

- **The grid overlay follows.** Its rows start under the leftover, and the rule at the leftover's edge is not drawn, so the first row shows as one taller square.
- **A square is rarely a whole pixel.** At 1447px it is 20.097px. The squares still add up to exactly the window, and borders stay sharp, but the overlay's lines can soften a little. `snap` rounds the scale as on a phone, for sharp lines and a fit that is no longer exact.
- **The scroll bar's room is kept.** `grid.css` sets `scrollbar-gutter: stable` on the root, so a scroll bar that comes and goes never changes the width the scale is worked out from.
- **Phones and tablets keep their own rule.** There the option does nothing: fourteen squares across, and none of the values above.

A page centred in the window, with its column in the middle, asks for an even count: `startScaling({ desktop: 'aligned', columns: 'even' })`, or `setScalingConfig({ desktop: 'aligned', columns: 'even' })` where the device module scales the page. The window's middle is then a line, so a centred column an even number of squares wide starts and ends on lines at every width. The scale moves a little further for it, at most two squares across the window.

`alignedGrid(width, height, snap, pixelRatio, columns)` is the calculation alone, returning the scale, the columns, the rows and the leftover. See it at work on the [Desktop aligned example](/examples/desktop-aligned/): resize the window, and turn the mode off to compare. The [field grids example](/examples/desktop-aligned-grids/) lays pictures out on field grids of whole squares, after the Swiss grid systems: each picture fills whole fields with its caption on the square below, and a picture can run to the window's edge. The [Multitrack workbench](/start-here/examples/workbenches/) is a whole tool on it: its panes, tracks and beat grid are whole squares under the leftover.

**Every application stands on it in the [App frame](/4-page/app/).** `ds-app` starts Desktop aligned through `startAppScale()` (`4-page/app-scale.ts`), which also has the shared components follow the scale (`--ds-sf` takes `--sf`) and marks the root `data-ds-scaling-managed`, so the device module reads that scale instead of putting its own. Its bar is two squares and the leftover, and its panes end on the window's bottom edge. Call `startAppScale()` first in an app's entry module, and never a second `startScaling()` beside it: two scales on one page fight.

## In the styles

Write lengths as squares or `calc(Npx * var(--sf))`, never bare pixels, except hairlines. `[data-mobile]` on the root marks a phone or tablet for the few rules that differ there.

Shared components read their own `--ds-sf`, which stays 1 so an embedded document keeps its scale. A page whose components follow the phone's scale sets it from the page's:

```css
:root {
  --ds-sf: var(--sf);
}
```

## The margin after scaling

Once the square is the phone's, the page's margins are worked out in those squares, not in pixels. A phone fourteen squares wide gets a column of twelve with one square on each side, at every phone width.

The column is whole squares, never more than its measure, with at least a square beside it on each side, and an even number of squares, so the page's centre falls on a line and both of its edges do too:

```css
body {
  --column: min(
    calc(28 * var(--unit)),
    calc(2 * round(down, (100% - 2 * var(--unit)) / 2, var(--unit)))
  );
}
main {
  padding-inline: calc((100% - var(--column)) / 2 - var(--ds-page-bleed));
}
```

`--unit` is one square, `calc(20px * var(--sf))`. On a 768px tablet, at a 40px square, the room is 19.2 squares: the column takes sixteen and the 1.6 squares left on each side are shared equally, so the column stays centred on the grid.

On a phone the content then stands a little past the column's edges, by `--ds-page-bleed`, while the column and the grid's lines stay where they are. Lists and prose get a slightly longer line on the narrowest screens, with the square of margin still reading as the page's edge:

```css
:root {
  --ds-page-bleed: 0px;
}
@media (max-width: 700px) {
  :root {
    --ds-page-bleed: calc(4px * var(--sf));
  }
}
```

The bleed is multiplied by `--sf` like every other measure, so it is 5.36px on a 375px phone. [Page](/4-page/page/) takes the same `--ds-page-bleed`: its padding is a square less the bleed, and its column grows by the bleed on each side.

## Copying it

The module imports nothing. Sync 1's `root` export copies it alone with `"modules": ["scaling"]`, as `0-face/scaling.ts` (`"scriptsTo"` puts it in a folder apart from the stylesheets); see [Root](/1-root/overview/).
