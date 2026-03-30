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
    default: "Incraft — AI Guided Meditation",
    template: "%s | Incraft",
  },
  description:
    "AI-generated meditations with natural pauses, studio-quality audio, and adaptive guidance that evolves with you.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Incraft — AI Guided Meditation",
    description:
      "Generate personalized AI meditations with studio-quality audio, natural pauses, and clinical protocols. Try it free.",
    url: "https://incraft.io",
    siteName: "Incraft",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Incraft — AI Guided Meditation",
    description:
      "Generate personalized AI meditations with studio-quality audio, natural pauses, and clinical protocols.",
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
