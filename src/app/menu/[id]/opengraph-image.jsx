import { ImageResponse } from "next/og";
import { getDish } from "@/lib/dishes";

export const alt = "A dish on Addis Eats";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }) {
  const { id } = await params;
  const dish = await getDish(id);

  const name = dish ? dish.name : "Addis Eats";
  const category = dish ? dish.category : "";
  const price = dish ? `${dish.price} ETB` : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px",
          background: "#fffbeb",
          color: "#292524",
        }}
      >
        <div style={{ display: "flex", fontSize: 44, color: "#b45309" }}>
          Addis Eats
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 36, color: "#78716c" }}>
            {category}
          </div>
          <div style={{ display: "flex", fontSize: 130, fontWeight: 700 }}>
            {name}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 64, color: "#b45309" }}>
          {price}
        </div>
      </div>
    ),
    { ...size }
  );
}