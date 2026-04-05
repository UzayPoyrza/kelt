import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a Meditation",
  description:
    "Configure your personalized AI meditation. Choose your voice, duration, focus area, and clinical protocol, then generate in seconds.",
  alternates: { canonical: "/create" },
  openGraph: {
    title: "Create a Meditation | Incraft",
    description:
      "Configure your personalized AI meditation. Choose your voice, duration, focus area, and clinical protocol.",
    url: "https://incraft.io/create",
  },
};

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
