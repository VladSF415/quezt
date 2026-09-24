"use client";

import { useEffect, useState } from "react";
import { registerTeam } from "@/app/actions/register";
import {
  DIVISIONS,
  FORMATS,
  FORMAT_META,
  type Format,
} from "@/lib/registration-schema";
import { buildPayload } from "@/lib/form-payload";
import { CONTEST_EVENT } from "@/lib/contest-select";

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

function PlayerRow({ n, label }: { n: number; label?: string }) {
  const who = label ?? `Player ${n}`;
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className={labelClass} htmlFor={`player${n}First`}>
          {`${who} first name`}
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
          {`${who} last name`}
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
  // null = show the contest picker; a Format = show that contest's form.
  const [format, setFormat] = useState<Format | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    function onSelect(e: Event) {
      const detail = (e as CustomEvent<Format>).detail;
      if (FORMATS.includes(detail)) {
        setFormat(detail);
        setStatus("idle");
        setError("");
      }
    }
    window.addEventListener(CONTEST_EVENT, onSelect);
    return () => window.removeEventListener(CONTEST_EVENT, onSelect);
  }, []);

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

  function reset() {
    setFormat(null);
    setStatus("idle");
    setError("");
  }

  // ---- Success screen ----
  if (status === "done" && format) {
    const meta = FORMAT_META[format];
    return (
      <div className="taped p-8 pt-10">
        <span className="scoretag">You are in</span>
        <h2 className="font-display mt-4 text-3xl text-court sm:text-4xl">
          {meta.solo ? "You are registered" : "Your team is registered"}
        </h2>
        <p className="mt-3 text-court/80">
          You are signed up for the{" "}
          <span className="font-semibold text-court">{meta.label}</span>. The
          coach will be in touch with the details. See you on the court.
        </p>
        <button
          type="button"
          onClick={reset}
          className="btn-register mt-6 px-6 py-3 text-base"
        >
          Register for another contest
        </button>
      </div>
    );
  }

  // ---- Contest picker (no contest chosen yet) ----
  if (!format) {
    return (
      <div className="taped p-6 pt-10 sm:p-8 sm:pt-10">
        <span className="scoretag scoretag--purple">Register</span>
        <h2 className="font-display mt-4 text-3xl text-court sm:text-4xl">
          Pick your contest
        </h2>
        <p className="mt-2 text-court/70">
          Choose one to sign up. You can come back and enter another.
        </p>
        <div className="mt-6 grid gap-3">
          {FORMATS.map((f) => {
            const meta = FORMAT_META[f];
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className="flex items-center justify-between border-2 border-court bg-white px-5 py-4 text-left transition hover:bg-chalk"
              >
                <span className="font-display text-xl text-court">
                  {meta.label}
                </span>
                <span className="scoretag scoretag--purple">{meta.tag}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const meta = FORMAT_META[format];

  return (
    <div className="taped p-6 pt-10 sm:p-8 sm:pt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="scoretag scoretag--purple">
          Register &middot; {meta.tag}
        </span>
        <button
          type="button"
          onClick={reset}
          className="text-sm font-semibold text-purple underline underline-offset-2 hover:text-red"
        >
          Change contest
        </button>
      </div>
      <h2 className="font-display mt-4 text-3xl text-court sm:text-4xl">
        {meta.solo ? "Sign yourself up" : "Sign your team up"}
      </h2>
      <p className="mt-2 text-court/70">
        {meta.label}
        {deadline && (
          <>
            {" "}
            &middot; registration closes {formatDeadline(deadline)}
          </>
        )}
        {!meta.solo && ". Bring a team of four."}
      </p>

      {/* Key on format so React remounts the inputs when the contest changes. */}
      <form key={format} onSubmit={onSubmit} className="mt-7 space-y-6">
        <input type="hidden" name="format" value={format} />

        {meta.solo ? (
          <fieldset className="space-y-4">
            <legend className="scoretag mb-3">Your name</legend>
            <PlayerRow n={1} label="Your" />
            <div>
              <label className={labelClass} htmlFor="teamName">
                Nickname or tag (optional)
              </label>
              <input
                id="teamName"
                name="teamName"
                className={inputClass}
                placeholder="What the bracket should call you"
              />
            </div>
          </fieldset>
        ) : (
          <>
            <fieldset className="space-y-4">
              <legend className="scoretag mb-3">Your players</legend>
              <p className="-mt-1 mb-1 text-sm text-court/60">
                Three on the court plus one substitute.
              </p>
              <PlayerRow n={1} />
              <PlayerRow n={2} />
              <PlayerRow n={3} />
              <PlayerRow n={4} label="Player 4 (sub)" />
            </fieldset>
            <div>
              <label className={labelClass} htmlFor="teamName">
                Team name
              </label>
              <input
                id="teamName"
                name="teamName"
                required
                className={inputClass}
              />
            </div>
          </>
        )}

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
          {status === "sending"
            ? "Sending..."
            : `Register for ${meta.label}`}
        </button>
      </form>
    </div>
  );
}
