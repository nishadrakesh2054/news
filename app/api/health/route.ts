import { apiSuccess } from "@/lib/api-response";
import { MESSAGES } from "@/constants/messages";

export async function GET() {
  return apiSuccess(
    {
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
    MESSAGES.SYSTEM.HEALTH_OK
  );
}
