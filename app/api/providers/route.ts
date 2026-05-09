import { getEnvProvidersStatus } from "@/lib/chat/serverEnv";

export async function GET() {
  return Response.json(getEnvProvidersStatus(), {
    headers: { "Cache-Control": "no-store" },
  });
}
