export function buildPayload(fd: FormData): unknown {
  const g = (k: string) => (fd.get(k) as string | null)?.toString() ?? "";
  const players = [1, 2, 3, 4].map((n) => ({
    first: g(`player${n}First`),
    last: g(`player${n}Last`),
  }));
  return {
    players,
    teamName: g("teamName"),
    division: g("division"),
    cellPhone: g("cellPhone") || undefined,
    email: g("email"),
    volunteerReferee: fd.get("volunteerReferee") === "on",
    volunteerScoreboard: fd.get("volunteerScoreboard") === "on",
    liabilityAgreed: fd.get("liabilityAgreed") === "on",
  };
}
