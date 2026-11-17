export interface ArtifactWriteResult {
  ok: true;
  key: string;
  etag: string | null;
  contentHash: string;
  byteSize: number;
  reused: boolean;
}

export class ArtifactError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "ArtifactError";
  }
}

function endpoint(): string {
  const base = process.env.ARTIFACTS_URL;
  if (!base) throw new Error("ARTIFACTS_URL is not configured.");
  return base.replace(/\/$/, "");
}

function secret(): string {
  const value = process.env.PUBLISH_SECRET;
  if (!value) throw new Error("PUBLISH_SECRET is not configured.");
  return value;
}

async function put(
  path: string,
  css: string,
  meta: { libraryId: string; version: number; contentHash: string },
): Promise<ArtifactWriteResult> {
  const response = await fetch(`${endpoint()}${path}`, {
    method: "PUT",
    headers: {
      authorization: `Bearer ${secret()}`,
      "content-type": "text/css; charset=utf-8",
      "ds1-library-id": meta.libraryId,
      "ds1-version": String(meta.version),
      "ds1-content-hash": meta.contentHash,
    },
    body: css,
  });

  if (!response.ok) {
    let code = "artifact_write_failed";
    try {
      const body = (await response.json()) as { error?: { code?: string } };
      if (body.error?.code) code = body.error.code;
    } catch {
    }
    throw new ArtifactError(`Artifact write failed (${response.status})`, response.status, code);
  }

  return (await response.json()) as ArtifactWriteResult;
}

export function putVersion(
  publicId: string,
  version: number,
  css: string,
  meta: { libraryId: string; contentHash: string },
): Promise<ArtifactWriteResult> {
  return put(`/${publicId}/v/${version}`, css, { ...meta, version });
}

export function putLatest(
  publicId: string,
  version: number,
  css: string,
  meta: { libraryId: string; contentHash: string },
): Promise<ArtifactWriteResult> {
  return put(`/${publicId}/latest`, css, { ...meta, version });
}

export async function headLatest(
  publicId: string,
): Promise<{ version: number | null; contentHash: string | null } | null> {
  const response = await fetch(`${endpoint()}/${publicId}/latest`, {
    method: "HEAD",
    headers: { authorization: `Bearer ${secret()}` },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new ArtifactError(`Artifact head failed (${response.status})`, response.status, "head_failed");
  }

  const version = response.headers.get("ds1-version");
  return {
    version: version ? Number(version) : null,
    contentHash: response.headers.get("ds1-content-hash"),
  };
}
