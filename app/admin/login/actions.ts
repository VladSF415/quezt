"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  verifyPassword,
  createSessionToken,
  SESSION_COOKIE,
  normalizeEmail,
} from "@/lib/auth";

// Email + password login (the fallback path; Google is primary). Generic error
// so we never reveal whether the email exists or the password was wrong.
export async function login(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const email = normalizeEmail((formData.get("email") as string | null) ?? "");
  const password = (formData.get("password") as string | null) ?? "";
  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  const ok = user && (await verifyPassword(password, user.passwordHash));
  if (!user || !ok) {
    return { error: "Email or password is not right." };
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}
