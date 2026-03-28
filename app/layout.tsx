import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Incraft — AI Guided Meditation",
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
      <body style={{ backgroundColor: "#faf9f7" }}>
        {children}
      </body>
    </html>
  );
}
