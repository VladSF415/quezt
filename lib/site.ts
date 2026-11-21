// Site-wide config the coach can update without touching components.

// YouTube Shorts video IDs for the "Watch the games" highlights (the part
// after /shorts/ in a youtube.com/shorts/XXXX link). Empty array hides the
// video section.
export const YOUTUBE_SHORT_IDS = [
  "TFjB1k01tdk",
  "UBxphVSK4c0",
  "MkLHr1TJH78",
  "QioRUHfpjpo",
  "JSXuykMOVs8",
  "NkkiCpqeLq8",
];

// The Quezt YouTube channel URL (shown in the footer). Leave empty to hide.
export const YOUTUBE_CHANNEL_URL =
  "https://www.youtube.com/channel/UClVWgMW_ieJKkWiy94TqtqQ";

// Instagram handle + URL.
export const INSTAGRAM_URL = "https://www.instagram.com/quezsf/";

// Who to reach with questions (shown in the event section and the footer).
export const CONTACT_NAME = "Marquez Shaw";
export const CONTACT_PHONE = "(415) 713-2256";
export const CONTACT_EMAIL = "queztbasketball@gmail.com";

// tel: link for a US number written any way, e.g. "(415) 713-2256".
export function telHref(phone: string): string {
  return `tel:+1${phone.replace(/\D/g, "").slice(-10)}`;
}

// Where the Nov 24 event moves if it rains (the coach, Nov 20 2026). Same "Place, street, city"
// shape as the event's location, so the card splits it the same way.
export const RAIN_LOCATION =
  "Ella Hill Hutch Community Center, 1050 McAllister St, San Francisco, CA 94115";

// The day's schedule, as the coach sent it (Nov 20 2026), in time order. His text said
// "12:30 AM" and "1:30 AM" for the 3-point contest and King of the Court; those are PM.
export type ScheduleStep = { time: string; what: string; staff?: boolean };
export const SCHEDULE: ScheduleStep[] = [
  { time: "10:00 AM", what: "Staff arrival and setup", staff: true },
  { time: "11:00 AM", what: "Registration and check-in" },
  { time: "12:30 PM", what: "3-point contest begins" },
  { time: "1:00 PM", what: "3-on-3 tournament begins" },
  { time: "1:30 PM", what: "1v1 King of the Court" },
  { time: "3:30 PM", what: "Championship games" },
  { time: "4:30 PM", what: "Awards" },
  { time: "5:00 PM", what: "Community closing and photos" },
  { time: "5:30 PM", what: "Cleanup", staff: true },
];
