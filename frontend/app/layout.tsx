import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { SITE_NAME } from "@/lib/constants";

const SITE_URL = "https://biohacking.example.com";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const DESCRIPTION =
  "Personalised online coaching for men — training, nutrition and performance systems built around your goals, delivered through Everfit and backed by a real coach.";

export const metadata: Metadata = {
  title: {
    default: "Biohacking — Online Coaching for Men",
    template: "%s | Biohacking",
  },
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "en_GB",
    title: "Biohacking — Online Coaching for Men",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Biohacking — Online Coaching for Men",
    description: DESCRIPTION,
  },
};

// Organization/WebSite JSON-LD kept minimal and factual — no fabricated
// logo asset or social profile URLs since none exist yet. Individual blog
// posts carry their own BlogPosting JSON-LD (see blog/[slug]/page.tsx).
const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <head>
        {/* eslint-disable-next-line react/no-danger */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
