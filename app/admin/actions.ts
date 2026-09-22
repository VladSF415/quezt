"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSessionUser, SESSION_COOKIE, normalizeEmail } from "@/lib/auth";
import type { AdminUser } from "@prisma/client";

// Resolve the current admin or throw. Optionally require the owner role.
async function requireAdmin(requireOwner = false): Promise<AdminUser> {
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore.get(SESSION_COOKIE)?.value);
  if (!user) throw new Error("Not authorized");
  if (requireOwner && user.role !== "owner") throw new Error("Owner only");
  return user;
}

export async function togglePaid(id: string): Promise<void> {
  await requireAdmin();
  const current = await prisma.registration.findUnique({ where: { id } });
  if (!current) return;
  await prisma.registration.update({
    where: { id },
    data: { paid: !current.paid },
  });
  revalidatePath("/admin");
}

// Owner invites a coach by email. Google carries identity, so no email needs
// to send: creating the row is what lets that address sign in with Google.
export async function inviteCoach(
  _prev: { error?: string; ok?: string } | undefined,
  formData: FormData
): Promise<{ error?: string; ok?: string }> {
  await requireAdmin(true);
  const email = normalizeEmail((formData.get("email") as string | null) ?? "");
  const name = ((formData.get("name") as string | null) ?? "").trim() || null;
  if (!email || !email.includes("@")) {
    return { error: "Enter a valid email address." };
  }
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    return { error: "That email already has access." };
  }
  await prisma.adminUser.create({
    data: { email, name, role: "coach" },
  });
  revalidatePath("/admin");
  return { ok: `${email} can now sign in with Google.` };
}

export async function removeCoach(id: string): Promise<void> {
  const owner = await requireAdmin(true);
  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) return;
  // Never remove an owner, and never let the owner remove themselves.
  if (target.role === "owner" || target.id === owner.id) return;
  await prisma.adminUser.delete({ where: { id } });
  revalidatePath("/admin");
}
