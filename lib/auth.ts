import { createHmac, timingSafeEqual, randomBytes, createHash } from "crypto";
import { hash as bcryptHash, verify as bcryptVerify } from "@node-rs/bcrypt";
import { prisma } from "@/lib/db";
import type { AdminUser } from "@prisma/client";

export const SESSION_COOKIE = "quezt_admin";

// --- Session cookie: HMAC-signed user id -----------------------------------
// The cookie value is `${userId}.${hmac(userId)}`. We keep the existing
// SESSION_SECRET-based HMAC, but sign the user id instead of a constant, so a
// session identifies WHO is logged in. Tampering fails the signature check;
// a deleted user simply won't resolve in getSessionUser (session dies).

function sign(value: string): string {
  const secret = process.env.SESSION_SECRET || "";
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createSessionToken(userId: string): string {
  return `${userId}.${sign(userId)}`;
}

/** Extract the signed user id from a session token, or null if invalid. */
export function verifySessionToken(token?: string): string | null {
  if (!token) return null;
  const idx = token.lastIndexOf(".");
  if (idx <= 0) return null;
  const value = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = sign(value);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return value;
}

/** Resolve the logged-in admin from a session cookie value, or null. */
export async function getSessionUser(token?: string): Promise<AdminUser | null> {
  const userId = verifySessionToken(token);
  if (!userId) return null;
  return prisma.adminUser.findUnique({ where: { id: userId } });
}

// --- Passwords (dormant fallback path) -------------------------------------

export async function hashPassword(plain: string): Promise<string> {
  return bcryptHash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string | null): Promise<boolean> {
  if (!hash) return false;
  try {
    return await bcryptVerify(plain, hash);
  } catch {
    return false;
  }
}

// --- One-time tokens (invite / reset) --------------------------------------
// The raw token is returned once (for the link). Only its sha256 hash is
// stored. Verifying re-hashes the incoming raw token and looks it up.

export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function newRawToken(): string {
  return randomBytes(32).toString("hex");
}

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
