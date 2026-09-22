import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "quezt_admin";

export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function sign(value: string): string {
  const secret = process.env.SESSION_SECRET || "";
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createSessionToken(): string {
  const value = "ok";
  return `${value}.${sign(value)}`;
}

export function isValidSession(token?: string): boolean {
  if (!token) return false;
  const [value, sig] = token.split(".");
  if (!value || !sig) return false;
  const expected = sign(value);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
