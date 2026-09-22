"use server";

import { prisma } from "@/lib/db";
import { registrationSchema } from "@/lib/registration-schema";
import { sendCoachNotification } from "@/lib/email";

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
      teamName: data.teamName,
      players: data.players,
      division: data.division,
      cellPhone: data.cellPhone,
      email: data.email,
      volunteerReferee: data.volunteerReferee,
      volunteerScoreboard: data.volunteerScoreboard,
      liabilityAgreed: data.liabilityAgreed,
    },
  });

  try {
    await sendCoachNotification({ ...data, eventName: event.name });
  } catch (e) {
    console.error("[register] notification failed", e);
  }

  return { ok: true };
}
