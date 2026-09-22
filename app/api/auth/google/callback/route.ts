import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";
import { exchangeCodeForProfile } from "@/lib/google";
import {
  createSessionToken,
  SESSION_COOKIE,
  normalizeEmail,
  publicBaseUrl,
} from "@/lib/auth";

const STATE_COOKIE = "quezt_oauth_state";

function stateValid(cookieVal: string | undefined, returned: string | null): boolean {
  if (!cookieVal || !returned) return false;
  const idx = cookieVal.lastIndexOf(".");
  if (idx <= 0) return false;
  const value = cookieVal.slice(0, idx);
  const sig = cookieVal.slice(idx + 1);
  const expected = createHmac("sha256", process.env.SESSION_SECRET || "")
    .update(value)
    .digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  // state returned by Google must match the one we signed
  return value === returned;
}

function redirect(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, publicBaseUrl(request)));
}

// Google redirects here after consent. Verify CSRF state, exchange the code for
// the verified email, and log the user in ONLY if that email was invited
// (an AdminUser row exists). Otherwise bounce with a clear message.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");

  const cookieStore = await cookies();
  const stateCookie = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  if (!stateValid(stateCookie, returnedState)) {
    return redirect(request, "/admin/login?error=state");
  }
  if (!code) {
    return redirect(request, "/admin/login?error=google");
  }

  let profile: { email: string; name: string | null } | null;
  try {
    profile = await exchangeCodeForProfile(code);
  } catch {
    profile = null;
  }
  if (!profile) {
    return redirect(request, "/admin/login?error=google");
  }

  const email = normalizeEmail(profile.email);
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) {
    return redirect(request, "/admin/login?error=not_invited");
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
      // fill in a name from Google on first sign-in if we don't have one
      name: user.name ?? profile.name ?? undefined,
    },
  });

  cookieStore.set(SESSION_COOKIE, createSessionToken(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return redirect(request, "/admin");
}
