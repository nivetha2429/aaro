import { describe, it, expect } from "vitest";
import { isJwtExpired } from "@/lib/auth";

// Helper to create a JWT with a given exp timestamp (seconds)
function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fakesignature`;
}

describe("isJwtExpired", () => {
  it("returns false for a token expiring in the future", () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    expect(isJwtExpired(makeJwt({ exp: futureExp }))).toBe(false);
  });

  it("returns true for a token that already expired", () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    expect(isJwtExpired(makeJwt({ exp: pastExp }))).toBe(true);
  });

  it("returns true for a malformed token", () => {
    expect(isJwtExpired("not.a.jwt")).toBe(true);
  });

  it("returns true for an empty string", () => {
    expect(isJwtExpired("")).toBe(true);
  });

  it("returns false for a token without exp claim (no expiry = never expires)", () => {
    // When exp is undefined, `undefined * 1000 < Date.now()` → NaN < number → false
    expect(isJwtExpired(makeJwt({ sub: "user123" }))).toBe(false);
  });
});
