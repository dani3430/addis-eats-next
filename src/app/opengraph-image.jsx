import { ImageResponse } from "next/og";

export const alt = "Addis Eats — Ethiopian food delivery in Addis Ababa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          background: "#fffbeb",
          color: "#292524",
        }}
      >
        <div style={{ display: "flex", fontSize: 110, color: "#b45309" }}>
          Addis Eats
        </div>
        <div style={{ display: "flex", fontSize: 52, marginTop: 24 }}>
          Ethiopian food, ordered fast.
        </div>
        <div
          style={{ display: "flex", fontSize: 34, marginTop: 48, color: "#57534e" }}
        >
          Doro Wat · Kitfo · Tibs · Shiro
        </div>
      </div>
    ),
    { ...size }
  );
}