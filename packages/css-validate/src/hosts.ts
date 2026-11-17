export const DEFAULT_ALLOWED_HOSTS: readonly string[] = [
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "dsone.dev",
  "cdn.jsdelivr.net",
];

export const ALLOWED_DATA_URL_TYPES: readonly string[] = [
  "image/svg+xml",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "font/woff2",
];

export type ClassifiedUrl =
  | { kind: "https"; host: string }
  | { kind: "insecure-scheme"; scheme: string }
  | { kind: "protocol-relative" }
  | { kind: "data"; mime: string; base64: boolean; payload: string }
  | { kind: "fragment" }
  | { kind: "relative" }
  | { kind: "other-scheme"; scheme: string };

const SCHEME = /^([a-z][a-z0-9+.-]*):/i;

export function classifyUrl(raw: string): ClassifiedUrl {
  const value = raw.trim();

  if (value.startsWith("#")) return { kind: "fragment" };
  if (value.startsWith("//")) return { kind: "protocol-relative" };

  const schemeMatch = SCHEME.exec(value);
  if (!schemeMatch) return { kind: "relative" };

  const scheme = (schemeMatch[1] ?? "").toLowerCase();

  if (scheme === "data") {
    const parsed = parseDataUrl(value);
    return parsed ?? { kind: "other-scheme", scheme };
  }

  if (scheme === "http") return { kind: "insecure-scheme", scheme };

  if (scheme === "https") {
    try {
      return { kind: "https", host: new URL(value).hostname.toLowerCase() };
    } catch {
      return { kind: "other-scheme", scheme };
    }
  }

  return { kind: "other-scheme", scheme };
}

export function isAllowedHost(host: string, allowed: readonly string[]): boolean {
  const needle = host.toLowerCase();
  return allowed.some((entry) => entry.toLowerCase() === needle);
}

function parseDataUrl(value: string): ClassifiedUrl | null {
  const match = /^data:([^,]*),([\s\S]*)$/i.exec(value);
  if (!match) return null;

  const meta = match[1] ?? "";
  const payload = match[2] ?? "";
  const base64 = /;base64\s*$/i.test(meta);
  const withoutEncoding = base64 ? meta.replace(/;base64\s*$/i, "") : meta;
  const mime = (withoutEncoding.split(";")[0] ?? "").trim().toLowerCase() || "text/plain";

  return { kind: "data", mime, base64, payload };
}

export function decodeDataUrlPayload(payload: string, base64: boolean): string | null {
  try {
    if (base64) return atob(payload);
    return decodeURIComponent(payload);
  } catch {
    return null;
  }
}

export function svgPayloadIsScriptable(decoded: string): boolean {
  return /<script[\s>]/i.test(decoded) || /\son\w+\s*=/i.test(decoded);
}
