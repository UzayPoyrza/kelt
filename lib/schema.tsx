/**
 * Schema.org JSON-LD structured data for Incraft.
 * All blocks use JSON-LD format with https://schema.org context.
 */

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* ─── Organization (global) ─── */

export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Incraft",
        url: "https://incraft.io",
        logo: "https://incraft.io/icon.png",
        description:
          "AI-generated meditations with natural pauses, studio-quality audio, and adaptive guidance that evolves with you.",
        sameAs: [],
      }}
    />
  );
}

/* ─── WebSite with SearchAction (global) ─── */

export function WebSiteSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Incraft",
        url: "https://incraft.io",
        description:
          "AI-generated meditations with natural pauses, studio-quality audio, and adaptive guidance that evolves with you.",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate:
              "https://incraft.io/create?prompt={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

/* ─── WebApplication (homepage) ─── */

export function WebApplicationSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Incraft",
        url: "https://incraft.io",
        applicationCategory: "HealthApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires a modern web browser",
        description:
          "AI-guided meditation generator. Enter a prompt, choose your voice, duration, and clinical protocol, and generate a personalized meditation session with studio-quality audio and ambient soundscapes.",
        offers: {
          "@type": "AggregateOffer",
          lowPrice: "0",
          highPrice: "24",
          priceCurrency: "USD",
          offerCount: 3,
        },
        featureList: [
          "AI-generated meditation scripts",
          "Studio-quality 48kHz 24-bit audio",
          "4 natural AI voices",
          "40+ ambient soundscapes",
          "Clinical protocols (CBT-I, PMR, MBSR, NSDR, ACT, HRV-BF)",
          "3-15 minute session durations",
          "Binaural spatial audio mixing",
          "Script-aware sound pairing",
        ],
      }}
    />
  );
}

/* ─── Product/Offer schemas for /upgrade ─── */

export function PricingSchemas() {
  const plans = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Incraft Free",
      description:
        "Free tier of Incraft AI meditation generator. 2 credits per month, all voices and soundscapes, personal use only.",
      brand: { "@type": "Organization", name: "Incraft" },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://incraft.io/upgrade",
        priceValidUntil: "2026-12-31",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Incraft Personal",
      description:
        "Personal plan for daily meditation practice. 32 credits per month, all voices and soundscapes, priority generation, commercial use included.",
      brand: { "@type": "Organization", name: "Incraft" },
      offers: [
        {
          "@type": "Offer",
          price: "8",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://incraft.io/upgrade",
          priceValidUntil: "2026-12-31",
          description: "Monthly billing",
        },
        {
          "@type": "Offer",
          price: "6",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://incraft.io/upgrade",
          priceValidUntil: "2026-12-31",
          description: "Yearly billing (per month)",
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Incraft Pro",
      description:
        "Professional plan for creators and practitioners. 102 credits per month, exclusive Aditya voice, highest priority generation, commercial use included.",
      brand: { "@type": "Organization", name: "Incraft" },
      offers: [
        {
          "@type": "Offer",
          price: "24",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://incraft.io/upgrade",
          priceValidUntil: "2026-12-31",
          description: "Monthly billing",
        },
        {
          "@type": "Offer",
          price: "18",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://incraft.io/upgrade",
          priceValidUntil: "2026-12-31",
          description: "Yearly billing (per month)",
        },
      ],
    },
  ];

  return (
    <>
      {plans.map((plan, i) => (
        <JsonLd key={i} data={plan} />
      ))}
    </>
  );
}

/* ─── BreadcrumbList ─── */

export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

/* ─── Review schemas for homepage testimonials ─── */

export function TestimonialReviewSchemas() {
  const reviews = [
    {
      author: "Mia Torres",
      body: "...honestly it replaced like 4 hours of recording and editing per week. I just type what the client needs and it's done.",
    },
    {
      author: "James Chen",
      body: "I've tried every meditation app out there. This is the first one where I actually fall asleep before it ends.",
    },
    {
      author: "Dr. Anita Kapoor",
      body: "The PMR timing is clinically accurate. I've started recommending it to patients between sessions.",
    },
  ];

  return (
    <>
      {reviews.map((review, i) => (
        <JsonLd
          key={i}
          data={{
            "@context": "https://schema.org",
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: "5",
              bestRating: "5",
            },
            author: { "@type": "Person", name: review.author },
            reviewBody: review.body,
            itemReviewed: {
              "@type": "WebApplication",
              name: "Incraft",
              url: "https://incraft.io",
            },
          }}
        />
      ))}
    </>
  );
}
