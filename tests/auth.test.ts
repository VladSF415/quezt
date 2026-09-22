import { describe, it, expect, beforeAll } from "vitest";
import {
  verifyPassword,
  createSessionToken,
  isValidSession,
} from "@/lib/auth";

beforeAll(() => {
  process.env.ADMIN_PASSWORD = "secret123";
  process.env.SESSION_SECRET = "test-secret-long";
});

describe("auth", () => {
  it("verifies the right password", () => {
    expect(verifyPassword("secret123")).toBe(true);
    expect(verifyPassword("nope")).toBe(false);
  });
  it("round-trips a session token", () => {
    const t = createSessionToken();
    expect(isValidSession(t)).toBe(true);
    expect(isValidSession("garbage")).toBe(false);
    expect(isValidSession(undefined)).toBe(false);
  });
});
