import { FORMAT_META, type RegistrationInput } from "@/lib/registration-schema";

type NotificationData = RegistrationInput & { eventName: string };

// Quezt brand colors (match the site)
const COURT = "#0b0b0f";
const GOLD = "#f4b21a";
const PURPLE = "#6c2bd9";
const CHALK = "#f5f3ee";
const INK = "#14141c";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// A display name for the entry: the team name for 3on3, otherwise the player's
// name (with their optional nickname/tag if they gave one).
function entryName(reg: NotificationData): string {
  const meta = FORMAT_META[reg.format];
  if (!meta.solo) return reg.teamName || "Team";
  const p = reg.players[0];
  const player = p ? `${p.first} ${p.last}`.trim() : "Player";
  return reg.teamName ? `${player} (${reg.teamName})` : player;
}

function tag(label: string, bg: string, color: string): string {
  return `<span style="display:inline-block;background:${bg};color:${color};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;padding:5px 10px;">${esc(
    label
  )}</span>`;
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #e4e0d8;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b6b6b;text-transform:uppercase;letter-spacing:1px;width:130px;vertical-align:top;">${esc(
      label
    )}</td>
    <td style="padding:10px 0;border-bottom:1px solid #e4e0d8;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${COURT};font-weight:bold;vertical-align:top;">${value}</td>
  </tr>`;
}

export function renderCoachNotificationHtml(reg: NotificationData): string {
  const meta = FORMAT_META[reg.format];
  const name = entryName(reg);
  const nameLabel = meta.solo ? "Player" : "Team";
  const players = reg.players
    .map(
      (p) =>
        `<div style="padding:2px 0;">${esc(p.first)} ${esc(p.last)}</div>`
    )
    .join("");

  const volunteer =
    [
      reg.volunteerReferee ? "Referee" : null,
      reg.volunteerScoreboard ? "Scoreboard" : null,
    ]
      .filter(Boolean)
      .join(", ") || "None";

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:${INK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${INK};padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;">

          <!-- header -->
          <tr>
            <td style="background:${COURT};padding:28px 32px;">
              ${tag("Quezt Sports Association", GOLD, COURT)}
              <div style="font-family:'Arial Black',Arial,sans-serif;font-size:30px;line-height:1.05;color:${CHALK};text-transform:uppercase;font-weight:900;margin-top:16px;">
                New ${meta.solo ? "entry" : "team"}<br><span style="color:${GOLD};">registered</span>
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#b9b9c4;margin-top:8px;">
                ${esc(reg.eventName)}
              </div>
            </td>
          </tr>

          <!-- gold rule -->
          <tr><td style="height:5px;background:${GOLD};font-size:0;line-height:0;">&nbsp;</td></tr>

          <!-- body card -->
          <tr>
            <td style="background:${CHALK};padding:28px 32px;">
              <div style="margin-bottom:18px;">
                ${tag(meta.label, PURPLE, CHALK)}
                ${tag(esc(reg.division), GOLD, COURT)}
              </div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${row("Contest", esc(meta.label))}
                ${row(nameLabel, esc(name))}
                ${row("Division", esc(reg.division))}
                ${row(meta.solo ? "Player" : "Players", players)}
                ${row("Email", esc(reg.email))}
                ${row("Phone", esc(reg.cellPhone || "Not provided"))}
                ${row("Volunteering", esc(volunteer))}
              </table>

              <div style="margin-top:24px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b6b6b;">
                See every entry in the coach dashboard.
              </div>
            </td>
          </tr>

          <!-- footer -->
          <tr>
            <td style="background:${COURT};padding:20px 32px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#8a8a95;letter-spacing:1px;text-transform:uppercase;">
                Quezt &middot; Real people, real support, real community
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderCoachNotificationText(reg: NotificationData): string {
  const meta = FORMAT_META[reg.format];
  const players = reg.players.map((p) => `${p.first} ${p.last}`).join(", ");
  const volunteer =
    [
      reg.volunteerReferee ? "Referee" : null,
      reg.volunteerScoreboard ? "Scoreboard" : null,
    ]
      .filter(Boolean)
      .join(", ") || "None";
  return (
    `New ${meta.solo ? "entry" : "team"} registered for ${reg.eventName}\n\n` +
    `Contest: ${meta.label}\n` +
    `${meta.solo ? "Player" : "Team"}: ${entryName(reg)}\n` +
    `Division: ${reg.division}\n` +
    `${meta.solo ? "Player" : "Players"}: ${players}\n` +
    `Email: ${reg.email}\n` +
    `Phone: ${reg.cellPhone || "Not provided"}\n` +
    `Volunteering: ${volunteer}\n`
  );
}

// ---- Confirmation email to the person who registered ----

export function renderRegistrantConfirmationHtml(reg: NotificationData): string {
  const meta = FORMAT_META[reg.format];
  const name = entryName(reg);
  const players = reg.players
    .map((p) => `<div style="padding:2px 0;">${esc(p.first)} ${esc(p.last)}</div>`)
    .join("");

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:${INK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${INK};padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;">

          <tr>
            <td style="background:${COURT};padding:28px 32px;">
              ${tag("Quezt Sports Association", GOLD, COURT)}
              <div style="font-family:'Arial Black',Arial,sans-serif;font-size:30px;line-height:1.05;color:${CHALK};text-transform:uppercase;font-weight:900;margin-top:16px;">
                You're <span style="color:${GOLD};">in</span>
              </div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#b9b9c4;margin-top:8px;">
                ${esc(reg.eventName)}
              </div>
            </td>
          </tr>

          <tr><td style="height:5px;background:${GOLD};font-size:0;line-height:0;">&nbsp;</td></tr>

          <tr>
            <td style="background:${CHALK};padding:28px 32px;">
              <p style="font-family:Arial,Helvetica,sans-serif;font-size:16px;color:${COURT};margin:0 0 18px;">
                Thanks for registering <strong>${esc(name)}</strong> for the
                <strong>${esc(meta.label)}</strong>. Your spot in the
                <strong>${esc(reg.division)}</strong> division is saved. The coach will be in touch
                with the details before the event.
              </p>

              <div style="margin-bottom:6px;">
                ${tag(meta.solo ? "Your entry" : "Your team", PURPLE, CHALK)}
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${row("Contest", esc(meta.label))}
                ${row(meta.solo ? "Player" : "Team", esc(name))}
                ${row("Division", esc(reg.division))}
                ${row(meta.solo ? "Player" : "Players", players)}
              </table>

              <div style="margin-top:24px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b6b6b;">
                See you on the court.
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:${COURT};padding:20px 32px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#8a8a95;letter-spacing:1px;text-transform:uppercase;">
                Quezt &middot; Real people, real support, real community
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderRegistrantConfirmationText(reg: NotificationData): string {
  const meta = FORMAT_META[reg.format];
  const players = reg.players.map((p) => `${p.first} ${p.last}`).join(", ");
  return (
    `You're in. Thanks for registering ${entryName(reg)} for the ${meta.label} at ${reg.eventName}.\n\n` +
    `Your spot in the ${reg.division} division is saved. The coach will be in ` +
    `touch with the details before the event.\n\n` +
    `Contest: ${meta.label}\n` +
    `${meta.solo ? "Player" : "Team"}: ${entryName(reg)}\n` +
    `Division: ${reg.division}\n` +
    `${meta.solo ? "Player" : "Players"}: ${players}\n\n` +
    `See you on the court.\n`
  );
}
