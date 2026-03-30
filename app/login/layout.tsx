import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to Incraft to access your meditation studio, session history, and personalized AI-generated meditations.",
  alternates: { canonical: "/login" },
  openGraph: {
    title: "Sign In | Incraft",
    description:
      "Sign in to access your meditation studio and personalized AI-generated sessions.",
    url: "https://incraft.io/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
