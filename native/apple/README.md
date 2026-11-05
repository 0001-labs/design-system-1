# Native comparison charts

`DS1ComparisonBars` draws two periods in one square: current above previous. Both Swift and Kotlin packages provide the same component and `DS1ComparisonValues` model.

The default colours are Sharp blue and the muted ink, over Fill tracks. Colours follow the theme and can be supplied from the design's palette. An unknown value draws neither track nor bar; a measured zero keeps its track. Two unknown periods take no height. A caller supplies the complete accessible description, including values, unknown periods and scale.

`maximum` fixes the domain, for example `1` for failure rates. Without it the domain is the greater of the two finite values and 1. Plot fractions clamp to 0–1; non-finite values are unknown. The 20-point square contains six-point tracks at y=2 and y=12, all multiplied by the native scale.

```swift
DS1ComparisonBars(current: 0.2, previous: nil, maximum: 1,
    label: "Current: 20%. Previous: not recorded. Scale: 0 to 100%.")
```

Apps take this source through Sync 1's `swift` or `kotlin` export. Native package checks are `vp run native:test` and `vp run native:test:android` from the repository root. Swift rendering checks cover both themes, the one-square height, unknown/zero tracks and a fixed domain.
