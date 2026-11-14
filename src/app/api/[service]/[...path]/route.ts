import { type NextRequest } from "next/server";
import { config } from "@/lib/server/config";
import { callUpstream } from "@/lib/server/upstream";

/** BFF proxy: /api/<service>/<path> -> <service url>/api/v1/<path> with the session's bearer token. */
async function handle(req: NextRequest, ctx: { params: Promise<{ service: string; path: string[] }> }) {
  const { service, path } = await ctx.params;
  const base = config.services[service];
  if (!base) return Response.json({ detail: "Unknown service", code: "not_found", request_id: null }, { status: 404 });

  const url = `${base}/api/v1/${path.join("/")}${req.nextUrl.search}`;
  const hasBody = !["GET", "HEAD"].includes(req.method);
  const res = await callUpstream(url, {
    method: req.method,
    headers: { "content-type": req.headers.get("content-type") ?? "application/json", "x-request-id": crypto.randomUUID() },
    body: hasBody ? await req.text() : undefined,
  });

  const headers = new Headers({ "content-type": res.headers.get("content-type") ?? "application/json" });
  const location = res.headers.get("location");
  if (location) headers.set("location", location);
  const reqId = res.headers.get("x-request-id");
  if (reqId) headers.set("x-request-id", reqId);
  return new Response(res.status === 204 ? null : res.body, { status: res.status, headers });
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
