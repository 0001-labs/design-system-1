export interface ReportsEnv {
  LIBRARIES: R2Bucket;
  REPORTS_AUTH_URL?: string;
  REPORTS_OWNER_ID?: string;
}
export const REPORT_KEY = "reports/component-adoption.json";
const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Content-Type-Options": "nosniff",
  "Vary": "Cookie, Authorization",
};
const failure = (error: string, status: number) => Response.json({ error }, { status, headers });

export async function authorizeReport(request: Request, env: ReportsEnv, send: typeof fetch = fetch): Promise<Response | null> {
  const identity = await signedIn(request, env, send);
  if (identity instanceof Response) return identity;
  return isStudioOwner(identity, env) ? null : failure("This report is private to the studio owner.", 403);
}

export interface SignedIn { _id: string; email?: string; emailVerified?: boolean }

export const isStudioOwner = (identity: SignedIn, env: ReportsEnv) =>
  identity._id === env.REPORTS_OWNER_ID && identity.email?.trim().toLowerCase() === "jaa90@icloud.com" && identity.emailVerified === true;

export async function signedIn(request: Request, env: ReportsEnv, send: typeof fetch = fetch): Promise<SignedIn | Response> {
  const authorization = request.headers.get("authorization") ?? "";
  if (!/^Bearer [^\s]{1,8192}$/.test(authorization)) return failure("Sign in to view this report.", 401);
  if (!env.REPORTS_OWNER_ID || !env.REPORTS_AUTH_URL || !/^https:\/\/[a-z0-9-]+\.convex\.cloud$/.test(env.REPORTS_AUTH_URL)) {
    return failure("Report access has not been configured.", 503);
  }
  let identity: { status?: string; value?: { _id?: string; email?: string; emailVerified?: boolean } | null };
  try {
    const response = await send(`${env.REPORTS_AUTH_URL}/api/query`, {
      method: "POST", headers: { authorization, "Content-Type": "application/json" },
      body: JSON.stringify({ path: "users:current", args: [{}], format: "convex_encoded_json" }),
      signal: AbortSignal.timeout(8_000), redirect: "manual",
    });
    if (response.status === 401 || response.status === 403) return failure("Your session has expired. Sign in again.", 401);
    if (!response.ok) return failure("Sign-in could not be checked. Try again.", 503);
    identity = await response.json();
  } catch { return failure("Sign-in could not be checked. Try again.", 503); }
  if (identity.status !== "success" || !identity.value?._id) return failure("Your session has expired. Sign in again.", 401);
  return identity.value as SignedIn;
}

export async function componentReport(request: Request, env: ReportsEnv, send: typeof fetch = fetch): Promise<Response> {
  return privateReport(request, env, send, REPORT_KEY, "No source snapshot has been published yet.");
}

export const ARCHITECTURE_KEY = "reports/architecture.md";
export async function architectureReport(request: Request, env: ReportsEnv, send: typeof fetch = fetch): Promise<Response> {
  return privateReport(request, env, send, ARCHITECTURE_KEY, "The architecture has not been published yet.", "text/markdown; charset=utf-8");
}

async function privateReport(request: Request, env: ReportsEnv, send: typeof fetch, key: string, missing: string, type = headers["Content-Type"]): Promise<Response> {
  if (request.method !== "GET") return new Response(null, { status: 405, headers: { ...headers, Allow: "GET" } });
  const denied = await authorizeReport(request, env, send);
  if (denied) return denied;
  const report = await env.LIBRARIES.get(key);
  if (!report) return failure(missing, 404);
  return new Response(report.body, { headers: { ...headers, "Content-Type": type } });
}
