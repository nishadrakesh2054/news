import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { verifyCronSecret } from "@/lib/admin-auth";

describe("verifyCronSecret", () => {
  let cronSecret: string | undefined;

  beforeEach(() => {
    cronSecret = process.env.CRON_SECRET;
  });

  afterEach(() => {
    if (cronSecret === undefined) {
      delete process.env.CRON_SECRET;
    } else {
      process.env.CRON_SECRET = cronSecret;
    }
  });

  it("allows bearer token when CRON_SECRET matches", () => {
    process.env.CRON_SECRET = "test-secret";

    const request = new NextRequest("http://localhost/api/cron/test", {
      headers: { authorization: "Bearer test-secret" },
    });

    expect(verifyCronSecret(request)).toBeNull();
  });

  it("rejects wrong bearer token when secret is configured", () => {
    process.env.CRON_SECRET = "test-secret";

    const request = new NextRequest("http://localhost/api/cron/test", {
      headers: { authorization: "Bearer wrong" },
    });

    const result = verifyCronSecret(request);
    expect(result?.status).toBe(401);
  });

  it("returns 503 when CRON_SECRET missing outside development", () => {
    delete process.env.CRON_SECRET;
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv === "development") {
      // verifyCronSecret allows unauthenticated access only in development
      return;
    }

    const request = new NextRequest("http://localhost/api/cron/test");
    const result = verifyCronSecret(request);
    expect(result?.status).toBe(503);
  });
});
