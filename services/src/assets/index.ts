import {
  baseArtifactHeaders,
  corsPreflight,
  IMMUTABLE_CACHE_CONTROL,
  LATEST_CACHE_CONTROL,
  methodNotAllowed,
  notFound,
} from "../shared/headers.ts";
import { parseArtifactPath } from "../shared/keys.ts";

export interface Env {
  LIBRARIES: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === "OPTIONS") return corsPreflight();
    if (request.method !== "GET" && request.method !== "HEAD") {
      return methodNotAllowed("GET, HEAD, OPTIONS");
    }

    const url = new URL(request.url);
    const ref = parseArtifactPath(url.pathname);
    if (!ref) return notFound();

    const cacheControl = ref.immutable ? IMMUTABLE_CACHE_CONTROL : LATEST_CACHE_CONTROL;

    if (request.method === "HEAD") {
      const head = await env.LIBRARIES.head(ref.key);
      if (!head) return notFound();

      const headers = describe(head, cacheControl);
      headers.set("content-length", String(head.size));
      return new Response(null, { headers });
    }

    const cache = caches.default;
    const cacheKey = new Request(url.toString(), { method: "GET" });

    const cached = await cache.match(cacheKey);
    if (cached) {
      const etag = cached.headers.get("etag");
      if (etag && matchesIfNoneMatch(request.headers.get("if-none-match"), etag)) {
        return new Response(null, { status: 304, headers: new Headers(cached.headers) });
      }
      return cached;
    }

    const object = await env.LIBRARIES.get(ref.key, { onlyIf: request.headers });
    if (!object) return notFound();

    const headers = describe(object, cacheControl);

    if (!isBody(object)) {
      return new Response(null, { status: 304, headers });
    }

    const response = new Response(object.body, { headers });
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  },
} satisfies ExportedHandler<Env>;

function describe(object: R2Object, cacheControl: string): Headers {
  const headers = new Headers();
  object.writeHttpMetadata(headers);

  headers.set("etag", object.httpEtag);
  baseArtifactHeaders(headers);
  headers.set("cache-control", cacheControl);
  headers.set("ds1-version", object.customMetadata?.version ?? "");
  headers.set("ds1-content-hash", object.customMetadata?.contentHash ?? "");
  headers.set("access-control-expose-headers", "ds1-version, ds1-content-hash");
  return headers;
}

function isBody(object: R2Object | R2ObjectBody): object is R2ObjectBody {
  return "body" in object && object.body !== null;
}

function matchesIfNoneMatch(header: string | null, etag: string): boolean {
  if (!header) return false;
  if (header.trim() === "*") return true;

  const normalize = (value: string) => value.trim().replace(/^W\//, "");
  const target = normalize(etag);
  return header.split(",").some((candidate) => normalize(candidate) === target);
}
