import "server-only";
import { config } from "./config";
import { clearTokens, readTokens, writeTokens, type Tokens } from "./session";

/** Exchange the refresh token for new tokens. Returns the new access token or null. */
export async function refreshSession(): Promise<string | null> {
  const { refresh } = await readTokens();
  if (!refresh) return null;
  const res = await fetch(`${config.mangoAuthUrl}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
    cache: "no-store",
  });
  if (!res.ok) {
    await clearTokens();
    return null;
  }
  const tokens = (await res.json()) as Tokens;
  await writeTokens(tokens);
  return tokens.access_token;
}

/**
 * Call an upstream service with the session's bearer token.
 * On a 401 it refreshes the session once and retries.
 */
export async function callUpstream(url: string, init: RequestInit): Promise<Response> {
  const { access } = await readTokens();
  let token = access ?? (await refreshSession());
  if (!token) return unauthorized();

  const send = (t: string) => {
    const headers = new Headers(init.headers);
    headers.set("authorization", `Bearer ${t}`);
    return fetch(url, { ...init, headers, cache: "no-store" });
  };

  let res = await send(token);
  if (res.status === 401) {
    token = await refreshSession();
    if (!token) return unauthorized();
    res = await send(token);
  }
  return res;
}

function unauthorized() {
  return Response.json(
    { detail: "Your session has expired. Please sign in again.", code: "unauthorized", request_id: null },
    { status: 401 },
  );
}
