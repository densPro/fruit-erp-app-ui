import { config } from "@/lib/server/config";
import { clearTokens, readTokens } from "@/lib/server/session";

export async function POST() {
  const { refresh } = await readTokens();
  if (refresh) {
    await fetch(`${config.mangoAuthUrl}/api/v1/auth/logout`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    }).catch(() => undefined);
  }
  await clearTokens();
  return new Response(null, { status: 204 });
}
