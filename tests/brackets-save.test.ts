// The coach's "Save for the public page" button: only a signed-in coach can save, and only the
// page's own settings are kept, on the active event.
import { describe, it, expect, vi, beforeAll } from "vitest";

const state: { token?: string; redirectedTo?: string } = {};
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => (state.token ? { value: state.token } : undefined) }),
}));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    state.redirectedTo = to;
    throw new Error("NEXT_REDIRECT");
  },
}));

import { prisma } from "@/lib/db";
import { createSessionToken } from "@/lib/auth";
import { saveBracketSettings } from "@/app/admin/actions";

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("saveBracketSettings", () => {
  beforeAll(async () => {
    const user = await prisma.adminUser.upsert({
      where: { email: "save-test-coach@example.com" },
      update: {},
      create: { email: "save-test-coach@example.com", role: "coach" },
    });
    state.token = createSessionToken(user.id);
  });

  it("refuses anyone who isn't signed in", async () => {
    const saved = state.token;
    state.token = undefined;
    await expect(saveBracketSettings(form({ s3: "14:00" }))).rejects.toThrow("Not authorized");
    state.token = saved;
  });

  it("saves the settings on the active event and goes back to the brackets", async () => {
    await expect(saveBracketSettings(form({ s3: "14:00", c3: "3", evil: "x" }))).rejects.toThrow("NEXT_REDIRECT");
    expect(state.redirectedTo).toBe("/admin/brackets?saved=1");
    const event = await prisma.event.findFirst({ where: { isActive: true } });
    const s = event!.bracketSettings as Record<string, string>;
    expect(s.s3).toBe("14:00");
    expect(s.c3).toBe("3");
    expect(s.evil).toBeUndefined();
    expect(typeof s.savedAt).toBe("string");
  });
});
