"use server";

import { prisma } from "@/lib/db";
import { registrationSchema } from "@/lib/registration-schema";
import {
  sendCoachNotification,
  sendRegistrantConfirmation,
} from "@/lib/email";

export async function registerTeam(
  input: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the form and try again." };
  }

  const event = await prisma.event.findFirst({ where: { isActive: true } });
  if (!event) {
    return { ok: false, error: "Registration is not open right now." };
  }

  const data = parsed.data;
  await prisma.registration.create({
    data: {
      eventId: event.id,
      format: data.format,
      teamName: data.teamName ?? null,
      players: data.players,
      division: data.division,
      cellPhone: data.cellPhone,
      email: data.email,
      volunteerReferee: data.volunteerReferee,
      volunteerScoreboard: data.volunteerScoreboard,
      liabilityAgreed: data.liabilityAgreed,
    },
  });

  const withEvent = { ...data, eventName: event.name };
  try {
    await sendCoachNotification(withEvent);
  } catch (e) {
    console.error("[register] coach notification failed", e);
  }
  try {
    await sendRegistrantConfirmation(withEvent);
  } catch (e) {
    console.error("[register] registrant confirmation failed", e);
  }

  return { ok: true };
}
