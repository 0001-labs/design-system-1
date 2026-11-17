export const LIBRARY_TOKENS = [
  ["--ds-accent-color", "--one-accent-color"],
  ["--ds-button-background-color-primary", "--one-button-primary-background"],
  ["--ds-button-text-color-on-accent", "--one-button-primary-text"],
  ["--ds-button-background-color-secondary", "--one-button-neutral-background"],
  ["--ds-button-text-color", "--one-button-neutral-text"],
  ["--ds-fill-hover", "--one-button-neutral-background-hover"],
  ["--ds-paper", "--one-background"],
  ["--ds-fill", "--one-surface"],
  ["--ds-text-color", "--one-text"],
  ["--ds-text-color-muted", "--one-text-muted"],
  ["--ds-border-color", "--one-border"],
  ["--ds-focus-ring", "--one-color-focus"],
  ["--ds-input-background", "--one-input-background"],
  ["--ds-input-color", "--one-input-text"],
  ["--ds-input-placeholder-color", "--one-input-placeholder"],
  ["--ds-input-disabled-color", "--one-input-disabled-text"],
  ["--accent-color", "--one-accent-color"],
  ["--button-background-color-primary", "--one-button-primary-background"],
  ["--button-text-color-on-light", "--one-button-primary-text"],
  ["--button-background-color-secondary", "--one-button-neutral-background"],
  ["--button-text-color", "--one-button-neutral-text"],
  ["--base-light-grey", "--one-input-background"],
  ["--base-slate", "--one-input-text"],
  ["--ds-typeface-regular", "--one-font"],
  ["--ds-typeface-medium", "--one-font-medium"],
  ["--ds-typeface-mono", "--one-font-mono"],
  ["--ds-text-size", "--one-font-size"],
  ["--ds-small-text-size", "--one-font-size-small"],
  ["--ds-heading-text-size", "--one-heading-size"],
  ["--ds-display-text-size", "--one-display-size"],
  ["--ds-text-tracking", "--one-letter-spacing"],
  ["--ds-control-size", "--one-control-height"],
  ["--ds-corner-size", "--one-radius"],
  ["--ds-card-corner-size", "--one-radius"],
  ["--ds-button-inset", "--one-button-padding-inline"],
  ["--ds-1", "--one-unit"],
] as const satisfies ReadonlyArray<readonly [`--${string}`, `--one-${string}`]>;

export const LIBRARY_BUTTON_LINK = "data-library-button";

export const LIBRARY_SELECTORS = {
  button: `:is(button, :where(a[${LIBRARY_BUTTON_LINK}]))`,
  a: `a:not(:where([${LIBRARY_BUTTON_LINK}]))`,
  ":disabled": `:is(:disabled, :where([${LIBRARY_BUTTON_LINK}][aria-disabled="true"]))`,
} as const;

export const LIBRARY_BUTTON_LINK_BASE = `:where(a[${LIBRARY_BUTTON_LINK}]) { display: inline-block; text-align: center; text-decoration: none; }`;

export const LIBRARY_REVISION = "sha256:8a0b55ce3acd";

export const libraryStamp = (revision = LIBRARY_REVISION as string) => `/* Design system 1 library, revision ${revision} */`;

export function libraryRevision(css: string): string | undefined {
  return /^(?:\uFEFF)?(?:@charset "[^"]*";\s*)?\/\* Design system 1 library, revision (sha256:[0-9a-f]{12}) \*\//.exec(css)?.[1];
}
