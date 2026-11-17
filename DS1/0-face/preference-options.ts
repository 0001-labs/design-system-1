export interface PreferenceOptions {
  storageKey?: string;
  themeStorageKey?: string;
  themeMode?: "system";
  themeDefault?: "light" | "dark" | "system";
  themePaper?: { light: string; dark: string } | false;
  shapeStorageKey?: string;
  shapeDefault?: "square" | "rounded" | "circular";
}

declare global {
  interface Window { DS_ONE_PREFERENCES?: PreferenceOptions; }
}
