import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Incraft. Covers accounts, billing, credits, AI-generated content, acceptable use, and liability.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service | Incraft",
    description:
      "Terms of Service for Incraft covering accounts, billing, AI content, and acceptable use.",
    url: "https://incraft.io/terms",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
