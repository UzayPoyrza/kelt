import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the Incraft team. Report bugs, request features, or get support with your account and billing.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact | Incraft",
    description:
      "Get in touch with the Incraft team for support, bug reports, or feature requests.",
    url: "https://incraft.io/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
