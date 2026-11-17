export const PUBLIC_ID_PATTERN = /^[0-9a-hjkmnp-tv-z]{20}$/;

export const VERSION_PATTERN = /^[1-9][0-9]{0,8}$/;

export function isPublicId(value: string): boolean {
  return PUBLIC_ID_PATTERN.test(value);
}

export const BASE_ID = "base";

export function isVersion(value: string): boolean {
  return VERSION_PATTERN.test(value);
}

export function versionKey(publicId: string, version: number | string): string {
  return `ds1/${publicId}/v/${version}.css`;
}

export function latestKey(publicId: string): string {
  return `ds1/${publicId}/latest.css`;
}

export interface ArtifactRef {
  publicId: string;
  version?: number;
  key: string;
  immutable: boolean;
}

export function parseArtifactPath(pathname: string, prefix = "/ds1"): ArtifactRef | null {
  if (!pathname.startsWith(`${prefix}/`)) return null;

  const segments = pathname.slice(prefix.length + 1).split("/");
  const publicId = segments[0];
  if (publicId === undefined || !(isPublicId(publicId) || publicId === BASE_ID)) return null;

  if (segments.length === 2 && segments[1] === "latest.css") {
    return { publicId, key: latestKey(publicId), immutable: false };
  }

  if (segments.length === 3 && segments[1] === "v" && segments[2]?.endsWith(".css")) {
    const raw = segments[2].slice(0, -".css".length);
    if (!isVersion(raw)) return null;
    return {
      publicId,
      version: Number(raw),
      key: versionKey(publicId, raw),
      immutable: true,
    };
  }

  return null;
}

export function parseWritePath(pathname: string, prefix = "/api/artifacts"): ArtifactRef | null {
  if (!pathname.startsWith(`${prefix}/`)) return null;

  const segments = pathname.slice(prefix.length + 1).split("/");
  const publicId = segments[0];
  if (publicId === undefined || !isPublicId(publicId)) return null;

  if (segments.length === 2 && segments[1] === "latest") {
    return { publicId, key: latestKey(publicId), immutable: false };
  }

  if (segments.length === 3 && segments[1] === "v" && segments[2] !== undefined) {
    if (!isVersion(segments[2])) return null;
    return {
      publicId,
      version: Number(segments[2]),
      key: versionKey(publicId, segments[2]),
      immutable: true,
    };
  }

  return null;
}
