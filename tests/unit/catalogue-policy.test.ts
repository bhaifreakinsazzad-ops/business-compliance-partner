import { describe, expect, it } from "vitest";
import { canUseCatalogueFixtures } from "@/lib/config/catalogue-policy";

describe("catalogue fixture release policy", () => {
  it("denies fixtures on live Vercel even with a staging override", () => {
    expect(canUseCatalogueFixtures({ NODE_ENV: "production", VERCEL_ENV: "production", NEXT_PUBLIC_APP_ENV: "staging", BCP_ALLOW_DEMO_CATALOGUE: "true" })).toBe(false);
  });
  it("denies fixtures in explicit production and unconfigured production runtimes", () => {
    expect(canUseCatalogueFixtures({ NODE_ENV: "test", NEXT_PUBLIC_APP_ENV: "production" })).toBe(false);
    expect(canUseCatalogueFixtures({ NODE_ENV: "production" })).toBe(false);
  });
  it("allows development and explicitly isolated staging only", () => {
    expect(canUseCatalogueFixtures({ NODE_ENV: "test" })).toBe(true);
    expect(canUseCatalogueFixtures({ NODE_ENV: "production", NEXT_PUBLIC_APP_ENV: "staging", BCP_ALLOW_DEMO_CATALOGUE: "true" })).toBe(true);
    expect(canUseCatalogueFixtures({ NODE_ENV: "test", DISABLE_SEED_FALLBACK: "true" })).toBe(false);
  });
});
