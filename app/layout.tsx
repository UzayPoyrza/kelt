import type { Metadata } from "next";
import { Navigation } from "@/components/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "MindFlow — AI Guided Meditation",
  description:
    "AI-generated meditations with natural pauses, studio-quality audio, and adaptive guidance that evolves with you.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-white">
          <Navigation />
          <main className="pt-16">{children}</main>
        </div>
      </body>
    </html>
  );
}
