import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

export const alt = "Decidia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0b0d12", color: "#eef1f7", padding: 80 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: 26, background: "linear-gradient(135deg,#2f6bff,#00c2ff)", display: "flex", position: "relative" }}>
            <div style={{ position: "absolute", top: 14, left: 14, width: 38, height: 38, borderRadius: 19, background: "#0b0d12" }} />
          </div>
          <div style={{ fontSize: 44, fontFamily: "serif" }}>Decidia</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 92, lineHeight: 1.02, fontFamily: "serif", display: "flex", flexWrap: "wrap" }}>
            <span style={{ marginRight: 22 }}>{t("h1a")}</span>
            <span style={{ color: "#5b8aff", fontStyle: "italic" }}>{t("h1b")}</span>
          </div>
          <div style={{ fontSize: 30, color: "#a9b1c3", maxWidth: 900 }}>{t("small")}</div>
        </div>
      </div>
    ),
    size,
  );
}
