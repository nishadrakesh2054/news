import { apiSuccess } from "@/lib/api-response";
import { getVapidPublicKey } from "@/lib/web-push";

export async function GET() {
  const publicKey = getVapidPublicKey();
  return apiSuccess({ publicKey, enabled: Boolean(publicKey) });
}
