"use client";

import { useActionState } from "react";
import { inviteCoach, removeCoach } from "./actions";

type Coach = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  lastLoginAt: Date | null;
};

export function CoachesSection({ coaches }: { coaches: Coach[] }) {
  const [state, formAction, pending] = useActionState(inviteCoach, {});

  return (
    <section className="mt-14">
      <span className="scoretag scoretag--purple">Owner</span>
      <h2 className="font-display mt-3 text-3xl text-chalk">Coaches</h2>
      <p className="mt-1 text-chalk/70">
        Add a coach by email. They sign in with Google using that address.
        Only emails you add here can get in.
      </p>

      <form
        action={formAction}
        className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label htmlFor="coach-email" className="mb-1 block text-sm font-semibold text-chalk/80">
            Email
          </label>
          <input
            id="coach-email"
            name="email"
            type="email"
            required
            placeholder="coach@gmail.com"
            className="w-full border-2 border-chalk/30 bg-white/5 px-3 py-2 text-chalk"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="coach-name" className="mb-1 block text-sm font-semibold text-chalk/80">
            Name (optional)
          </label>
          <input
            id="coach-name"
            name="name"
            type="text"
            className="w-full border-2 border-chalk/30 bg-white/5 px-3 py-2 text-chalk"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="btn-register px-6 py-2 disabled:opacity-60"
        >
          {pending ? "Adding..." : "Add coach"}
        </button>
      </form>

      {state?.error && (
        <p className="mt-3 border-2 border-red bg-red/10 px-3 py-2 text-sm font-semibold text-red">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="mt-3 border-2 border-green-600 bg-green-600/10 px-3 py-2 text-sm font-semibold text-green-400">
          {state.ok}
        </p>
      )}

      <ul className="mt-6 divide-y divide-chalk/10 border-2 border-chalk/15">
        {coaches.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate font-semibold text-chalk">
                {c.name || c.email}
                {c.role === "owner" && (
                  <span className="ml-2 rounded bg-purple-600/30 px-2 py-0.5 text-xs uppercase tracking-wide text-purple-300">
                    Owner
                  </span>
                )}
              </p>
              <p className="truncate text-sm text-chalk/60">
                {c.email}
                {" · "}
                {c.lastLoginAt
                  ? `last in ${new Date(c.lastLoginAt).toLocaleDateString()}`
                  : "never signed in"}
              </p>
            </div>
            {c.role !== "owner" && (
              <form action={removeCoach.bind(null, c.id)}>
                <button
                  type="submit"
                  className="scoretag py-1 text-red hover:bg-red/10"
                >
                  Remove
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
