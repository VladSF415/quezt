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
