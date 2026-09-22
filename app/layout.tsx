import type { Metadata } from "next";
import { Anton, Inter, Oswald } from "next/font/google";
import "./globals.css";

const anton = Anton({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-stencil",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quezt Sports Association | Community Basketball in San Francisco",
  description:
    "Quezt runs community 3 on 3 tournaments, 1v1, and 3-point contests for ages 8U to 18 and up in San Francisco. More than just a game. Register your team.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${oswald.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
