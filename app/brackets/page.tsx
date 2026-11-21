import type { Metadata } from "next";
import { loadPublicBrackets } from "@/lib/public-brackets";
import { BracketsSheet } from "@/app/admin/brackets/BracketsSheet";

export const dynamic = "force-dynamic";
// Public, so players and families can find their games; kept out of search because it lists
// players' first names.
export const metadata: Metadata = {
  title: "Brackets | Quezt Sports Association",
  description: "Brackets, game times and courts for the Quezt community basketball event.",
  robots: { index: false, follow: true },
};

export default async function PublicBracketsPage() {
  const data = await loadPublicBrackets();
  const asOf = new Date().toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
  });
  return (
    <main className="flex-1 px-5 py-10 print:p-0">
      <div className="mx-auto max-w-6xl">
        {data ? (
          <BracketsSheet view="public" eventName={data.eventName} asOf={asOf} {...data.brackets} />
        ) : (
          <p className="text-chalk/80">
            No event right now. <a href="/" className="underline">Back to the home page</a>.
          </p>
        )}
      </div>
    </main>
  );
}
