import type { RegistrationInput } from "@/lib/registration-schema";

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
                New team<br><span style="color:${GOLD};">registered</span>
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
                ${tag(esc(reg.teamName), PURPLE, CHALK)}
                ${tag(esc(reg.division), GOLD, COURT)}
              </div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${row("Team", esc(reg.teamName))}
                ${row("Division", esc(reg.division))}
                ${row("Players", players)}
                ${row("Email", esc(reg.email))}
                ${row("Phone", esc(reg.cellPhone || "Not provided"))}
                ${row("Volunteering", esc(volunteer))}
              </table>

              <div style="margin-top:24px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b6b6b;">
                See every team in the coach dashboard.
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
  const players = reg.players.map((p) => `${p.first} ${p.last}`).join(", ");
  const volunteer =
    [
      reg.volunteerReferee ? "Referee" : null,
      reg.volunteerScoreboard ? "Scoreboard" : null,
    ]
      .filter(Boolean)
      .join(", ") || "None";
  return (
    `New team registered for ${reg.eventName}\n\n` +
    `Team: ${reg.teamName}\n` +
    `Division: ${reg.division}\n` +
    `Players: ${players}\n` +
    `Email: ${reg.email}\n` +
    `Phone: ${reg.cellPhone || "Not provided"}\n` +
    `Volunteering: ${volunteer}\n`
  );
}
