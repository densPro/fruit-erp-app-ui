import { config } from "@/lib/server/config";
import { writeTokens, type Tokens } from "@/lib/server/session";

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; password?: string };
  const res = await fetch(`${config.mangoAuthUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: body.email, password: body.password, app: config.mangoAuthApp }),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return Response.json(
      { detail: err.detail ?? "Invalid email or password", code: err.code ?? "unauthorized", request_id: err.request_id ?? null },
      { status: res.status },
    );
  }
  await writeTokens((await res.json()) as Tokens);
  return Response.json({ ok: true });
}
