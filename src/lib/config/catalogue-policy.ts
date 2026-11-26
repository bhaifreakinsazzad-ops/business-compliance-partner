/** Live deployment must never silently publish demo inventory. */
export function canUseCatalogueFixtures(env: NodeJS.ProcessEnv = process.env): boolean {
  if (env.DISABLE_SEED_FALLBACK === "true" ||
      env.VERCEL_ENV === "production" ||
      env.NEXT_PUBLIC_APP_ENV === "production") return false;
  return env.NODE_ENV !== "production" ||
    (env.NEXT_PUBLIC_APP_ENV === "staging" && env.BCP_ALLOW_DEMO_CATALOGUE === "true");
}
