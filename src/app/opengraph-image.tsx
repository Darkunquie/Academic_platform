import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Preplyfly — Prep. Fly.";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, #0B3D2E 0%, #155E45 55%, #1F8765 100%)",
          color: "#F8F6F1",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 28,
          }}
        >
          <svg width="84" height="84" viewBox="0 0 32 32">
            <path
              d="M6 16.8 25 6.5 17.4 25.5l-3.2-7.2-8.2-1.5Z"
              fill="#F6A488"
            />
            <path d="M14.2 18.3 25 6.5l-10 14.6-.8-2.8Z" fill="#C9462C" />
          </svg>
          <div style={{ fontSize: 30, color: "#A8DCC5", letterSpacing: 2 }}>
            Prepare yourself.
          </div>
        </div>

        <div style={{ fontSize: 132, fontWeight: 800, lineHeight: 1 }}>
          preplyfly
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 24,
            fontSize: 40,
            color: "#F6A488",
          }}
        >
          <span style={{ fontWeight: 700 }}>Prep. Fly.</span>
          <span style={{ color: "#A8DCC5", fontSize: 28 }}>
            · Learn · Practice · Assess
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
