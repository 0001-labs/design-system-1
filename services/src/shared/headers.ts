export const CONTENT_TYPE = "text/css; charset=utf-8";

export const IMMUTABLE_CACHE_CONTROL = "public, max-age=31536000, immutable";

export const LATEST_CACHE_CONTROL =
  "public, max-age=0, must-revalidate, s-maxage=10, stale-if-error=86400";

export function baseArtifactHeaders(headers: Headers = new Headers()): Headers {
  headers.set("content-type", CONTENT_TYPE);
  headers.set("access-control-allow-origin", "*");
  headers.set("cross-origin-resource-policy", "cross-origin");
  headers.set("timing-allow-origin", "*");
  headers.set("x-content-type-options", "nosniff");
  return headers;
}

export function corsPreflight(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, HEAD, OPTIONS",
      "access-control-allow-headers": "if-none-match, if-modified-since",
      "access-control-max-age": "86400",
    },
  });
}

export function notFound(): Response {
  const headers = baseArtifactHeaders();
  headers.set("cache-control", "public, max-age=30");
  return new Response("/* DS1: library not found */\n", { status: 404, headers });
}

export function methodNotAllowed(allow: string): Response {
  return new Response(null, { status: 405, headers: { allow } });
}
