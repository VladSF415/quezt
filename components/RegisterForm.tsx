"use client";

import { useState } from "react";
import { registerTeam } from "@/app/actions/register";
import { DIVISIONS } from "@/lib/registration-schema";
import { buildPayload } from "@/lib/form-payload";

type Status = "idle" | "sending" | "done" | "error";

function formatDeadline(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  });
}

const labelClass = "block text-sm font-semibold text-court/80 mb-1";
const inputClass =
  "w-full border-2 border-court bg-white px-3 py-2 text-court placeholder-court/40";

function PlayerRow({ n }: { n: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className={labelClass} htmlFor={`player${n}First`}>
          Player {n} first name
        </label>
        <input
          id={`player${n}First`}
          name={`player${n}First`}
          required
          className={inputClass}
          autoComplete="off"
        />
      </div>
      <div>
        <label className={labelClass} htmlFor={`player${n}Last`}>
          Player {n} last name
        </label>
        <input
          id={`player${n}Last`}
          name={`player${n}Last`}
          required
          className={inputClass}
          autoComplete="off"
        />
      </div>
    </div>
  );
}

export function RegisterForm({ deadline }: { deadline: Date | null }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const payload = buildPayload(new FormData(e.currentTarget));
    const res = await registerTeam(payload);
    if (res.ok) {
      setStatus("done");
    } else {
      setStatus("error");
      setError(res.error);
    }
  }

  if (status === "done") {
    return (
      <div className="taped p-8 pt-10">
        <span className="scoretag">You are in</span>
        <h2 className="font-display mt-4 text-3xl text-court sm:text-4xl">
          Your team is registered
        </h2>
        <p className="mt-3 text-court/80">
          The coach will be in touch with the details. See you on the court.
        </p>
      </div>
    );
  }

  return (
    <div className="taped p-6 pt-10 sm:p-8 sm:pt-10">
      <span className="scoretag scoretag--purple">Register</span>
      <h2 className="font-display mt-4 text-3xl text-court sm:text-4xl">
        Sign your team up
      </h2>
      {deadline && (
        <p className="mt-2 text-court/70">
          Registration closes {formatDeadline(deadline)}. Bring a team of four.
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-7 space-y-6">
        <fieldset className="space-y-4">
          <legend className="scoretag mb-3">Your players</legend>
          <PlayerRow n={1} />
          <PlayerRow n={2} />
          <PlayerRow n={3} />
          <PlayerRow n={4} />
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="teamName">
              Team name
            </label>
            <input id="teamName" name="teamName" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="division">
              Age division
            </label>
            <select
              id="division"
              name="division"
              required
              defaultValue=""
              className={inputClass}
            >
              <option value="" disabled>
                Pick your division
              </option>
              {DIVISIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="cellPhone">
              Cell phone (optional)
            </label>
            <input
              id="cellPhone"
              name="cellPhone"
              type="tel"
              className={inputClass}
              placeholder="(415) 555-1212"
            />
          </div>
        </div>

        <fieldset>
          <legend className="scoretag mb-3">Want to help out?</legend>
          <div className="space-y-2">
            <label className="flex items-center gap-3 text-court">
              <input
                type="checkbox"
                name="volunteerReferee"
                className="h-5 w-5 accent-purple"
              />
              I can help referee matches
            </label>
            <label className="flex items-center gap-3 text-court">
              <input
                type="checkbox"
                name="volunteerScoreboard"
                className="h-5 w-5 accent-purple"
              />
              I can help run the scoreboard
            </label>
          </div>
        </fieldset>

        <label className="flex items-start gap-3 border-t-2 border-court/20 pt-5 text-court">
          <input
            type="checkbox"
            name="liabilityAgreed"
            required
            className="mt-1 h-5 w-5 accent-red"
          />
          <span className="text-sm">
            I agree to the release of liability. Playing is at my own risk, and I
            release Quezt Sports Association and the event organizers from
            responsibility for any injury.
          </span>
        </label>

        {status === "error" && (
          <p className="border-2 border-red bg-red/10 px-3 py-2 text-sm font-semibold text-red">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="btn-register w-full px-7 py-4 text-lg disabled:opacity-60"
        >
          {status === "sending" ? "Sending..." : "Register my team"}
        </button>
      </form>
    </div>
  );
}
