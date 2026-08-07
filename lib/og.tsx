import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";
export const OG_ALT =
  "ABHAAS: a growth-stage-aware digital twin for smart polyhouse management. Team Nirvaah, Avinya 2026.";

const INK = "#0a0a0a";
const PAPER = "#f4f1e8";
const GREEN = "#67cf00";
const PURPLE = "#ce69ea";
const PURPLE_DARK = "#7d559c";

function Badge({
  children,
  bg,
  color = INK,
  fontFamily,
}: {
  children: string;
  bg: string;
  color?: string;
  fontFamily: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: bg,
        color,
        border: `3px solid ${PAPER}`,
        padding: "7px 16px",
        fontSize: 19,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 1,
        fontFamily,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Renders the brutalist OG/social-card image server-side (satori, via
 * next/og). Same visual language as the live UI — hard offset shadow via
 * a stacked duplicate box (satori's box-shadow support is unreliable), the
 * site's own Samarkan wordmark font, and the actual logo asset — not a
 * plain screenshot or a static export of the logo file.
 */
export async function renderOgImage() {
  const [samarkan, logoBuffer, body] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/Samarkan.woff")),
    readFile(join(process.cwd(), "public/abhaas_logo.png")),
    // Providing a custom `fonts` array to ImageResponse disables next/og's
    // automatic Geist fallback, so anything without an explicit fontFamily
    // would otherwise render in Samarkan too. Reuse the framework's own
    // bundled Geist for body text instead of fetching a font over the network.
    readFile(
      join(process.cwd(), "node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf")
    ).catch(() => null),
  ]);
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  const logoW = 176;
  const logoH = 191;
  const bodyFont = body ? "Geist" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: INK,
          padding: 26,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            border: `6px solid ${GREEN}`,
            padding: "44px 60px",
          }}
        >
          <div style={{ display: "flex", gap: 14 }}>
            <Badge bg={GREEN} fontFamily={bodyFont}>
              Team Nirvaah
            </Badge>
            <Badge bg={PURPLE} fontFamily={bodyFont}>
              PS3 · Smart Polyhouse Management
            </Badge>
            <Badge bg={INK} color={PAPER} fontFamily={bodyFont}>
              Avinya 2026
            </Badge>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 44, marginTop: 50 }}>
            <div style={{ display: "flex", position: "relative", width: logoW, height: logoH }}>
              <div
                style={{
                  display: "flex",
                  position: "absolute",
                  top: 10,
                  left: 10,
                  width: logoW,
                  height: logoH,
                  background: PURPLE_DARK,
                }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt="Abhaas logo"
                width={logoW}
                height={logoH}
                style={{ position: "relative", border: `4px solid ${PAPER}`, objectFit: "cover" }}
              />
            </div>
            <div style={{ display: "flex", fontFamily: "Samarkan", fontSize: 128, lineHeight: 1 }}>
              <span style={{ color: GREEN }}>ABH</span>
              <span style={{ color: PURPLE }}>AAS</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 36,
              fontSize: 32,
              fontWeight: 700,
              color: PAPER,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontFamily: bodyFont,
            }}
          >
            Rehearse before you act.
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "auto",
              fontSize: 18,
              color: PAPER,
              opacity: 0.55,
              textTransform: "uppercase",
              letterSpacing: 2,
              gap: 18,
              fontFamily: bodyFont,
            }}
          >
            <span>Zoned</span>
            <span style={{ color: PURPLE }}>/</span>
            <span>Physiological</span>
            <span style={{ color: PURPLE }}>/</span>
            <span>Predictive</span>
            <span style={{ color: PURPLE }}>/</span>
            <span>Rehearsable</span>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Samarkan", data: samarkan, weight: 400, style: "normal" },
        ...(body ? [{ name: "Geist", data: body, weight: 400 as const, style: "normal" as const }] : []),
      ],
    }
  );
}
