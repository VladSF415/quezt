import { FORMAT_META, FORMATS, type Format } from "@/lib/registration-schema";

export function buildPayload(fd: FormData): unknown {
  const g = (k: string) => (fd.get(k) as string | null)?.toString() ?? "";

  const rawFormat = g("format");
  const format: Format = (FORMATS as readonly string[]).includes(rawFormat)
    ? (rawFormat as Format)
    : "3on3";

  const count = FORMAT_META[format].players;
  const players = Array.from({ length: count }, (_, i) => i + 1).map((n) => ({
    first: g(`player${n}First`),
    last: g(`player${n}Last`),
  }));

  const teamName = g("teamName").trim();

  return {
    format,
    players,
    teamName: teamName || undefined,
    division: g("division"),
    cellPhone: g("cellPhone") || undefined,
    email: g("email"),
    volunteerReferee: fd.get("volunteerReferee") === "on",
    volunteerScoreboard: fd.get("volunteerScoreboard") === "on",
    liabilityAgreed: fd.get("liabilityAgreed") === "on",
  };
}
