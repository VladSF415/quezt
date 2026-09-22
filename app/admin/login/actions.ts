"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  verifyPassword,
  createSessionToken,
  SESSION_COOKIE,
} from "@/lib/auth";

export async function login(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const password = (formData.get("password") as string | null) ?? "";
  if (!verifyPassword(password)) {
    return { error: "That password is not right." };
  }
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}
