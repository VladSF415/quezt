import { describe, it, expect, beforeAll } from "vitest";
import {
  createSessionToken,
  verifySessionToken,
  hashPassword,
  verifyPassword,
  hashToken,
  newRawToken,
  normalizeEmail,
} from "@/lib/auth";

beforeAll(() => {
  process.env.SESSION_SECRET = "test-secret-long";
});

describe("session tokens", () => {
  it("round-trips a signed user id", () => {
    const t = createSessionToken("user_abc123");
    expect(verifySessionToken(t)).toBe("user_abc123");
  });
  it("rejects tampered or garbage tokens", () => {
    const t = createSessionToken("user_abc123");
    expect(verifySessionToken(t.replace("user_abc123", "user_evil"))).toBeNull();
    expect(verifySessionToken("garbage")).toBeNull();
    expect(verifySessionToken(undefined)).toBeNull();
    expect(verifySessionToken("noDotHere")).toBeNull();
  });
  it("preserves ids that contain dots", () => {
    const t = createSessionToken("a.b.c");
    expect(verifySessionToken(t)).toBe("a.b.c");
  });
});

describe("passwords (bcrypt)", () => {
  it("verifies a correct password and rejects a wrong one", async () => {
    const hash = await hashPassword("hunter2!");
    expect(await verifyPassword("hunter2!", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
  it("rejects when no hash is set (Google-only users)", async () => {
    expect(await verifyPassword("anything", null)).toBe(false);
  });
});

describe("one-time tokens", () => {
  it("hashes deterministically and differs from the raw token", () => {
    const raw = newRawToken();
    expect(raw).toMatch(/^[0-9a-f]{64}$/);
    const h = hashToken(raw);
    expect(h).toHaveLength(64);
    expect(h).not.toBe(raw);
    expect(hashToken(raw)).toBe(h); // stable
    expect(hashToken(newRawToken())).not.toBe(h); // unique per token
  });
});

describe("email normalization", () => {
  it("lowercases and trims", () => {
    expect(normalizeEmail("  Coach@Gmail.COM ")).toBe("coach@gmail.com");
  });
});
