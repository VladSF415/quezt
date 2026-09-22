// Placeholder shell, wired to the server action in Task 7.
export function RegisterForm({ deadline }: { deadline: Date | null }) {
  return (
    <div className="taped p-8 pt-10">
      <span className="scoretag scoretag--purple">Register</span>
      <h2 className="font-display mt-4 text-3xl text-court sm:text-4xl">
        Sign your team up
      </h2>
      {deadline && (
        <p className="mt-2 text-court/70">
          Registration closes{" "}
          {deadline.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: "America/Los_Angeles",
          })}
          .
        </p>
      )}
      <p className="mt-6 text-court/60">Registration form coming up next.</p>
    </div>
  );
}
