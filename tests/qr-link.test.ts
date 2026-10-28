import { describe, it, expect } from "vitest";
import { GET } from "@/app/r/route";

describe("/r, the link in the flyer's QR code", () => {
  it("sends the visitor straight to the registration form", async () => {
    const res = await GET();
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("/#register");
  });
});
