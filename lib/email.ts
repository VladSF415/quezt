import { Resend } from "resend";
import type { RegistrationInput } from "@/lib/registration-schema";

export async function sendCoachNotification(
  reg: RegistrationInput & { eventName: string }
): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log("[email] RESEND_API_KEY not set, skipping notification");
    return;
  }
  const resend = new Resend(key);
  const players = reg.players.map((p) => `${p.first} ${p.last}`).join(", ");
  await resend.emails.send({
    from: process.env.RESEND_FROM || "onboarding@resend.dev",
    to: process.env.COACH_NOTIFY_EMAIL || "queztbasketball@gmail.com",
    subject: `New team registered: ${reg.teamName} (${reg.division})`,
    text:
      `Event: ${reg.eventName}\n` +
      `Team: ${reg.teamName}\n` +
      `Division: ${reg.division}\n` +
      `Players: ${players}\n` +
      `Email: ${reg.email}\n` +
      `Phone: ${reg.cellPhone || "n/a"}\n` +
      `Volunteer referee: ${reg.volunteerReferee}\n` +
      `Volunteer scoreboard: ${reg.volunteerScoreboard}\n`,
  });
}
