"use client";
import * as React from "react";

type SimliProps = React.HTMLAttributes<HTMLElement> & {
  token?: string; agentid?: string; position?: string; overlay?: boolean | "true" | "false";
};
const SimliWidget: React.FC<SimliProps> =
  (props) => React.createElement("simli-widget", props as unknown as Record<string, unknown>);

export default function HeroScene() {
  const [token, setToken] = React.useState<string | null>(null);
  const [agentId, setAgentId] = React.useState<string | null>(null);

  async function summon() {
    const r = await fetch("/api/simli/token", { cache: "no-store" });
    const body = await r.json().catch(async () => ({ raw: await r.text() }));
    if (!r.ok || !body?.token) {
      console.error("Token route failed", { status: r.status, body });
      alert(`Token error ${r.status}: ${body?.details ?? body?.error ?? "unknown"}`);
      return;
    }
    setToken(body.token);
    setAgentId(body.agentid);
  }

  // Tune these four to match the overlay cutout (percentages of viewport)
  const HOLE = {
    left: "50%",    // center of the hole on screen (x)
    top: "55%",     // center (y)
    sizeVw: "28vw", // square width/height
    radius: "20px", // match the cutout corner radius
    rotate: "0deg", // small adjust if needed
    skewY: "0deg",
  };

  return (
    <>
      {/* 1) Full-page 16:9 background video */}
      <video
        className="fixed inset-0 -z-30 h-[100dvh] w-screen object-cover"
        autoPlay muted loop playsInline
        src="/video/hero_16x9.mp4"
      />

      {/* 2) Square Simli widget positioned under the overlay hole */}
      <div
        className="fixed -z-10 overflow-hidden"
        style={{
          left: HOLE.left,
          top: HOLE.top,
          width: HOLE.sizeVw,
          height: HOLE.sizeVw,              // square
          transform: `translate(-50%, -50%) rotate(${HOLE.rotate}) skewY(${HOLE.skewY})`,
          borderRadius: HOLE.radius,
          pointerEvents: "auto",
        }}
      >
        {token && agentId ? (
          <SimliWidget
            token={token}
            agentid={agentId}
            position="relative"
            overlay={false}                  // we control framing
            style={{ display: "block", width: "100%", height: "100%" }}
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-black/70 text-white/80">
            Click "Summon"
          </div>
        )}
      </div>

      {/* 3) Summon button */}
      <div className="fixed top-4 left-0 right-0 z-10 flex justify-center">
        <button onClick={summon} className="rounded-xl px-4 py-2 bg-white/90 text-black shadow">
          Summon
        </button>
      </div>

      {/* 4) Top overlay image that covers the whole page with the transparent cutout */}
      <img
        src="/public_ui_device_frame.png"
        alt=""
        className="fixed inset-0 -z-20 pointer-events-none"
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
      />
    </>
  );
}