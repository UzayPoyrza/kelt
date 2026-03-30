import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Choose your Incraft plan. Free, Personal ($8/mo), or Pro ($24/mo). Generate AI meditations with studio-quality audio, clinical protocols, and commercial use rights.",
  alternates: { canonical: "/upgrade" },
  openGraph: {
    title: "Pricing | Incraft",
    description:
      "Choose your Incraft plan. Free, Personal, or Pro. AI meditations with studio-quality audio and clinical protocols.",
    url: "https://incraft.io/upgrade",
  },
};

export default function UpgradeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
