/** Dev stub — keeps Turbopack fast. Production loads Sentry from instrumentation-client.sentry.ts */
export const onRouterTransitionStart = () => {};

if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  void import("./instrumentation-client.sentry");
}
