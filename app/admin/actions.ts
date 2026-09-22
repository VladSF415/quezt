"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isValidSession, SESSION_COOKIE } from "@/lib/auth";

export async function togglePaid(id: string): Promise<void> {
  const cookieStore = await cookies();
  if (!isValidSession(cookieStore.get(SESSION_COOKIE)?.value)) {
    throw new Error("Not authorized");
  }
  const current = await prisma.registration.findUnique({ where: { id } });
  if (!current) return;
  await prisma.registration.update({
    where: { id },
    data: { paid: !current.paid },
  });
  revalidatePath("/admin");
}
