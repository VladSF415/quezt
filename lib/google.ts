import { OAuth2Client } from "google-auth-library";

// Google OAuth for admin sign-in. Domain-independent: works against whatever
// APP_URL is set to (the Railway URL today, quezt.org later). The callback
// path must match the redirect URI registered in the Google Cloud console.

const CALLBACK_PATH = "/api/auth/google/callback";
const SCOPES = ["openid", "email", "profile"];

function appUrl(): string {
  return (process.env.APP_URL || "").replace(/\/$/, "");
}

export function googleConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && appUrl()
  );
}

function client(): OAuth2Client {
  return new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: `${appUrl()}${CALLBACK_PATH}`,
  });
}

/** URL to send the user to Google's consent screen. `state` is our CSRF token. */
export function googleAuthUrl(state: string): string {
  return client().generateAuthUrl({
    access_type: "online",
    scope: SCOPES,
    state,
    prompt: "select_account",
  });
}

/**
 * Exchange the callback `code` for the user's verified email.
 * Returns { email, name } or null if verification fails.
 */
export async function exchangeCodeForProfile(
  code: string
): Promise<{ email: string; name: string | null } | null> {
  const c = client();
  const { tokens } = await c.getToken(code);
  if (!tokens.id_token) return null;
  const ticket = await c.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email || !payload.email_verified) return null;
  return { email: payload.email, name: payload.name ?? null };
}
