import { Resend } from "resend";
import type { RegistrationInput } from "@/lib/registration-schema";
import {
  renderCoachNotificationHtml,
  renderCoachNotificationText,
} from "@/lib/email-template";

export async function sendCoachNotification(
  reg: RegistrationInput & { eventName: string }
): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log("[email] RESEND_API_KEY not set, skipping notification");
    return;
  }
  const resend = new Resend(key);
  await resend.emails.send({
    from: process.env.RESEND_FROM || "onboarding@resend.dev",
    to: process.env.COACH_NOTIFY_EMAIL || "queztbasketball@gmail.com",
    subject: `New team registered: ${reg.teamName} (${reg.division})`,
    html: renderCoachNotificationHtml(reg),
    text: renderCoachNotificationText(reg),
  });
}
