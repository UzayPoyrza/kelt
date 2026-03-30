import type { Metadata, Viewport } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/lib/components/AuthProvider";
import { OrganizationSchema, WebSiteSchema } from "@/lib/schema";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-dm-sans",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-playfair",
});

export const viewport: Viewport = {
  themeColor: "#faf9f7",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://incraft.io"),
  title: {
    default: "[Free] Best AI Meditation Generator Online by Incraft",
    template: "%s | Incraft",
  },
  description:
    "Generate studio-quality guided meditation in 1 prompt. Natural voice narration, timed pauses, tailored scripts. AI built on scientific protocols. Free.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "[Free] Best AI Meditation Generator Online by Incraft",
    description:
      "Generate studio-quality guided meditation in 1 prompt. Natural voice narration, timed pauses, tailored scripts. AI built on scientific protocols. Free.",
    url: "https://incraft.io",
    siteName: "Incraft",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "[Free] Best AI Meditation Generator Online by Incraft",
    description:
      "Generate studio-quality guided meditation in 1 prompt. Natural voice narration, timed pauses, tailored scripts. AI built on scientific protocols. Free.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfairDisplay.variable}`} suppressHydrationWarning>
      <body style={{ backgroundColor: "#faf9f7" }}>
        <OrganizationSchema />
        <WebSiteSchema />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
