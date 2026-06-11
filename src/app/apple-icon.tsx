import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#155E45",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 32 32">
          <path d="M6 16.8 25 6.5 17.4 25.5l-3.2-7.2-8.2-1.5Z" fill="#F6A488" />
          <path d="M14.2 18.3 25 6.5l-10 14.6-.8-2.8Z" fill="#C9462C" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
