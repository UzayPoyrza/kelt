import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Incraft collects, uses, and protects your personal information. Covers data collection, cookies, third-party services, and your rights.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | Incraft",
    description:
      "Learn how Incraft collects, uses, and protects your personal information.",
    url: "https://incraft.io/privacy",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
