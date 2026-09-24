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

export const FORMATS = ["3on3", "1v1", "3point"] as const;
export type Format = (typeof FORMATS)[number];

// How each contest presents. 3on3 is a team of four; 1v1 and 3-point are solo.
export const FORMAT_META: Record<
  Format,
  { label: string; tag: string; solo: boolean; players: number }
> = {
  "3on3": { label: "3 on 3 Tournament", tag: "3 on 3", solo: false, players: 4 },
  "1v1": { label: "King of the Court", tag: "1 v 1", solo: true, players: 1 },
  "3point": { label: "3-Point Contest", tag: "Range", solo: true, players: 1 },
};

const playerSchema = z.object({
  first: z.string().trim().min(1),
  last: z.string().trim().min(1),
});

export const registrationSchema = z
  .object({
    format: z.enum(FORMATS).default("3on3"),
    // Solo contests send one player; 3on3 sends four. Enforced in superRefine.
    players: z.array(playerSchema).min(1).max(4),
    // Team name for 3on3; an optional nickname/tag for solo entries.
    teamName: z.string().trim().optional(),
    division: z.enum(DIVISIONS),
    cellPhone: z.string().trim().optional(),
    email: z.string().trim().email(),
    volunteerReferee: z.boolean(),
    volunteerScoreboard: z.boolean(),
    liabilityAgreed: z.literal(true),
  })
  .superRefine((val, ctx) => {
    const solo = FORMAT_META[val.format].solo;
    if (solo) {
      if (val.players.length !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["players"],
          message: "Solo contests take one player.",
        });
      }
    } else {
      if (val.players.length !== 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["players"],
          message: "A 3 on 3 team needs four players.",
        });
      }
      if (!val.teamName || val.teamName.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["teamName"],
          message: "A team name is required.",
        });
      }
    }
  });

export type RegistrationInput = z.infer<typeof registrationSchema>;
