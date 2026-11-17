export type ComponentVisibility = "public" | "internal";
export const COMPONENT_VISIBILITY: Readonly<Record<string, ComponentVisibility>> = {
  "spacing-handle": "internal",
  "loading": "internal",
  "kbd": "internal",
};
export function componentVisibility(name: string): ComponentVisibility {
  return COMPONENT_VISIBILITY[name.replace(/^ds-/, "")] ?? "public";
}
export function isPublicComponent(name: string): boolean {
  return componentVisibility(name) === "public";
}
