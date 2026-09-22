"use client";

import { useActionState } from "react";
import { login } from "./actions";

const ERRORS: Record<string, string> = {
  not_invited:
    "That Google account has not been invited yet. Ask the owner to add your email.",
  google: "Google sign-in did not complete. Please try again.",
  google_off: "Google sign-in is not configured yet.",
  state: "Your sign-in link expired. Please try again.",
};

export default function AdminLogin({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const [state, formAction, pending] = useActionState(login, {});
  const urlError = searchParams?.error ? ERRORS[searchParams.error] : undefined;

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-20">
      <div className="taped w-full max-w-sm p-8 pt-10">
        <span className="scoretag scoretag--purple">Coach login</span>
        <h1 className="font-display mt-4 text-3xl text-court">Quezt admin</h1>
        <p className="mt-2 text-court/70">
          Sign in to see the teams that have registered.
        </p>

        {urlError && (
          <p className="mt-4 border-2 border-red bg-red/10 px-3 py-2 text-sm font-semibold text-red">
            {urlError}
          </p>
        )}

        {/* Primary path: Google. Works with no domain and no email setup. */}
        <a
          href="/api/auth/google/login"
          className="btn-register mt-6 flex w-full items-center justify-center gap-2 px-6 py-3"
        >
          Sign in with Google
        </a>

        <div className="my-6 flex items-center gap-3 text-court/50">
          <span className="h-px flex-1 bg-court/20" />
          <span className="text-xs font-semibold uppercase tracking-wide">or</span>
          <span className="h-px flex-1 bg-court/20" />
        </div>

        {/* Fallback: email + password (for coaches who have set one). */}
        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-semibold text-court/80"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="w-full border-2 border-court bg-white px-3 py-2 text-court"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-semibold text-court/80"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="w-full border-2 border-court bg-white px-3 py-2 text-court"
            />
          </div>
          {state?.error && (
            <p className="border-2 border-red bg-red/10 px-3 py-2 text-sm font-semibold text-red">
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="btn-register w-full px-6 py-3 disabled:opacity-60"
          >
            {pending ? "Signing in..." : "Sign in with email"}
          </button>
        </form>
      </div>
    </main>
  );
}
