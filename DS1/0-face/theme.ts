import { signal } from "@lit-labs/signals";
import "./theme-bootstrap.js";
import type { PreferenceOptions } from "./preference-options";

export type ThemeType = "light" | "dark";
export type ThemeMode = ThemeType | "system";
export const THEME_MODES: readonly ThemeMode[] = ["light", "dark", "system"];

export interface ThemeRuntime {
  mode(): ThemeMode;
  theme(): ThemeType;
  set(mode: ThemeMode): void;
  apply(): void;
}

declare global {
  interface Window { DS_ONE_THEME?: ThemeRuntime; }
}

function runtime(): ThemeRuntime | undefined {
  return typeof window === "undefined" ? undefined : window.DS_ONE_THEME;
}

runtime()?.apply();

export const currentTheme = signal<ThemeType>(runtime()?.theme() ?? "light");
export const currentThemeMode = signal<ThemeMode>(runtime()?.mode() ?? "system");

function sync(): void {
  const theme = runtime();
  if (!theme) return;
  currentTheme.set(theme.theme());
  currentThemeMode.set(theme.mode());
}

if (typeof window !== "undefined") window.addEventListener("theme-changed", sync);

export function getThemeMode(): ThemeMode {
  return runtime()?.mode() ?? currentThemeMode.get();
}

export function setThemeMode(mode: ThemeMode): void {
  runtime()?.set(mode);
  sync();
}

export function setTheme(theme: ThemeType): void {
  setThemeMode(theme);
}

export function followSystemTheme(): () => void {
  if (typeof window === "undefined") return () => {};
  const previous = window.DS_ONE_PREFERENCES?.themeMode;
  const following: PreferenceOptions = { ...window.DS_ONE_PREFERENCES, themeMode: "system" };
  window.DS_ONE_PREFERENCES = following;
  setThemeMode("system");
  return () => {
    const options = { ...window.DS_ONE_PREFERENCES };
    if (previous) options.themeMode = previous;
    else delete options.themeMode;
    window.DS_ONE_PREFERENCES = options;
    runtime()?.apply();
    sync();
  };
}
