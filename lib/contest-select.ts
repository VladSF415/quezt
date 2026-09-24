import type { Format } from "@/lib/registration-schema";

// The About cards and the RegisterForm live in separate components. The cards
// fire this event; the form listens and morphs to the chosen contest, then
// scrolls itself into view.
export const CONTEST_EVENT = "quezt:select-contest";

export function selectContest(format: Format) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<Format>(CONTEST_EVENT, { detail: format })
  );
  document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
}
