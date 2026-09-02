import * as Sentry from "@sentry/nextjs";
import { getBaseSentryOptions } from "@/lib/sentry-options";

const isProd = process.env.NODE_ENV === "production";

Sentry.init({
  ...getBaseSentryOptions(),
  integrations: [Sentry.replayIntegration()],
  replaysSessionSampleRate: isProd ? 0.05 : 0.1,
  replaysOnErrorSampleRate: 1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
