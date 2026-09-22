import { z } from "zod";

export const DIVISIONS = [
  "8U",
  "10U",
  "12U",
  "14U",
  "16U",
  "18U",
  "18UP",
] as const;

const playerSchema = z.object({
  first: z.string().trim().min(1),
  last: z.string().trim().min(1),
});

export const registrationSchema = z.object({
  players: z.array(playerSchema).length(4),
  teamName: z.string().trim().min(1),
  division: z.enum(DIVISIONS),
  cellPhone: z.string().trim().optional(),
  email: z.string().trim().email(),
  volunteerReferee: z.boolean(),
  volunteerScoreboard: z.boolean(),
  liabilityAgreed: z.literal(true),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
