import { config } from "@/lib/server/config";
import { callUpstream } from "@/lib/server/upstream";

export async function GET() {
  const res = await callUpstream(`${config.mangoAuthUrl}/api/v1/auth/me`, { method: "GET" });
  return new Response(res.body, { status: res.status, headers: { "content-type": "application/json" } });
}
