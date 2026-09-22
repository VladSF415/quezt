import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomBytes, createHmac } from "crypto";
import { googleAuthUrl, googleConfigured } from "@/lib/google";
import { publicBaseUrl } from "@/lib/auth";

const STATE_COOKIE = "quezt_oauth_state";

// Start the Google sign-in flow: mint a CSRF state value, stash a signed copy
// in a short-lived cookie, and redirect to Google's consent screen.
export async function GET(request: Request) {
  if (!googleConfigured()) {
    return NextResponse.redirect(
      new URL("/admin/login?error=google_off", publicBaseUrl(request))
    );
  }
  const state = randomBytes(16).toString("hex");
  const sig = createHmac("sha256", process.env.SESSION_SECRET || "")
    .update(state)
    .digest("hex");

  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, `${state}.${sig}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });

  return NextResponse.redirect(googleAuthUrl(state));
}
