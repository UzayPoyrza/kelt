import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#1a1614",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 21 21">
          <path
            d="M10.5 0C10.5 0 11.08 5.41 13.34 7.66C15.59 9.92 21 10.5 21 10.5C21 10.5 15.59 11.08 13.34 13.34C11.08 15.59 10.5 21 10.5 21C10.5 21 9.92 15.59 7.66 13.34C5.41 11.08 0 10.5 0 10.5C0 10.5 5.41 9.92 7.66 7.66C9.92 5.41 10.5 0 10.5 0Z"
            fill="url(#g)"
          />
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="21" y2="21">
              <stop offset="0%" stopColor="#7a9e7e" />
              <stop offset="50%" stopColor="#6d9ab5" />
              <stop offset="100%" stopColor="#8b7ea6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    { ...size }
  );
}
