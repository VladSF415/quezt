import { describe, it, expect } from "vitest";
import { prisma } from "@/lib/db";

describe("seeded event", () => {
  it("has one active event with 7 divisions", async () => {
    const event = await prisma.event.findFirst({ where: { isActive: true } });
    expect(event).not.toBeNull();
    expect(event?.divisions).toHaveLength(7);
    expect(event?.divisions).toContain("18UP");
  });
});
