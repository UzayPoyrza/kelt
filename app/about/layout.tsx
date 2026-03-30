import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Generate studio-quality guided meditation in 1 prompt. Tailored scripts, natural voice narration, timed pauses — AI powered by science-based protocols. Free.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Incraft — AI Guided Meditation Generator",
    description:
      "Generate studio-quality guided meditation in 1 prompt. Tailored scripts, natural voice narration, timed pauses — AI powered by science-based protocols. Free.",
    url: "https://incraft.io/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
