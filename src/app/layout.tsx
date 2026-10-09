import type { Metadata } from "next";
import "@fontsource/newsreader/400.css";
import "@fontsource/newsreader/400-italic.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./globals.css";
import { LangProvider } from "@/i18n";

const siteUrl = "https://landlord.canada.nshipyard.com";

export const metadata: Metadata = {
  title: "Landlord Operator Index: which management companies run Toronto's worst-rated rental buildings?",
  description:
    "Toronto's RentSafeTO program scores 3,593 rental buildings 0-100%. We joined the scores to the City's open registration file and ranked 831 property management companies by red-rated buildings, average scores, and portfolio share rated red or yellow. Open data, methodology published.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Landlord Operator Index",
    description:
      "3,593 Toronto rental buildings scored. 831 management companies ranked by red-rated buildings and average scores. Find yours.",
    url: siteUrl,
    siteName: "Open Nshipyard",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Landlord Operator Index" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Landlord Operator Index",
    description:
      "3,593 Toronto rental buildings scored. 831 management companies ranked by red-rated buildings and average scores. Find yours.",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
