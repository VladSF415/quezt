"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function AdminLogin() {
  const [state, formAction, pending] = useActionState(login, {});

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-20">
      <div className="taped w-full max-w-sm p-8 pt-10">
        <span className="scoretag scoretag--purple">Coach login</span>
        <h1 className="font-display mt-4 text-3xl text-court">Quezt admin</h1>
        <p className="mt-2 text-court/70">
          Sign in to see the teams that have registered.
        </p>
        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-court/80 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
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
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
