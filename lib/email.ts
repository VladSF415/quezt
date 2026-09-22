import { Resend } from "resend";
import type { RegistrationInput } from "@/lib/registration-schema";
import {
  renderCoachNotificationHtml,
  renderCoachNotificationText,
  renderRegistrantConfirmationHtml,
  renderRegistrantConfirmationText,
} from "@/lib/email-template";

type Notification = RegistrationInput & { eventName: string };

const TEST_SENDER = "onboarding@resend.dev";

function getFrom(): string {
  return process.env.RESEND_FROM || TEST_SENDER;
}

// The Resend test sender can only deliver to the account's own address, so we
// only email the person who registered once a real (verified domain) sender is
// configured. Until then, registrant confirmations are skipped, no failures.
function canEmailRegistrant(): boolean {
  const from = getFrom();
  return !!process.env.RESEND_API_KEY && from !== TEST_SENDER;
}

export async function sendCoachNotification(reg: Notification): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log("[email] RESEND_API_KEY not set, skipping notification");
    return;
  }
  const resend = new Resend(key);
  await resend.emails.send({
    from: getFrom(),
    to: process.env.COACH_NOTIFY_EMAIL || "queztbasketball@gmail.com",
    subject: `New team registered: ${reg.teamName} (${reg.division})`,
    html: renderCoachNotificationHtml(reg),
    text: renderCoachNotificationText(reg),
  });
}

export async function sendRegistrantConfirmation(
  reg: Notification
): Promise<void> {
  if (!canEmailRegistrant()) {
    console.log(
      "[email] skipping registrant confirmation (no verified domain sender yet)"
    );
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: getFrom(),
    to: reg.email,
    subject: `You're registered for ${reg.eventName}`,
    html: renderRegistrantConfirmationHtml(reg),
    text: renderRegistrantConfirmationText(reg),
  });
}
