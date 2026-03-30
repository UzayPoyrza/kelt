import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Incraft — AI Guided Meditation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#1a1614",
          color: "#faf9f7",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "8px",
            }}
          >
            <svg
              width="48"
              height="50"
              viewBox="0 0 36 37.8281"
              fill="none"
            >
              <path
                d="M18 0C18 0 22.5 7.5 30 12C30 12 22.5 16.5 18 24C18 24 13.5 16.5 6 12C6 12 13.5 7.5 18 0Z"
                fill="#7a9e7e"
              />
              <path
                d="M10 14C10 14 13 19 18 22C18 22 13 25 10 30C10 30 7 25 2 22C2 22 7 19 10 14Z"
                fill="#6d9ab5"
                opacity="0.8"
              />
              <path
                d="M26 14C26 14 23 19 18 22C18 22 23 25 26 30C26 30 29 25 34 22C34 22 29 19 26 14Z"
                fill="#8b7ea6"
                opacity="0.8"
              />
            </svg>
            <span
              style={{
                fontSize: "48px",
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              Incraft
            </span>
          </div>

          <div
            style={{
              fontSize: "28px",
              fontWeight: 400,
              color: "rgba(250, 249, 247, 0.7)",
              textAlign: "center",
              maxWidth: "700px",
              lineHeight: 1.4,
            }}
          >
            AI-generated meditations with studio-quality audio and clinical
            protocols
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            {["CBT-I", "PMR", "MBSR", "NSDR", "HRV-BF"].map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "6px 16px",
                  borderRadius: "20px",
                  border: "1px solid rgba(250, 249, 247, 0.15)",
                  fontSize: "14px",
                  color: "rgba(250, 249, 247, 0.5)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
