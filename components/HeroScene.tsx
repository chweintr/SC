"use client";
import * as React from "react";
import Script from "next/script";

// Wrapper so TS is happy
type SimliProps = React.HTMLAttributes<HTMLElement> & {
  token?: string;
  agentid?: string;
  position?: string;
  overlay?: boolean | "true" | "false";
};
const SimliWidget: React.FC<SimliProps> = (props) =>
  React.createElement("simli-widget", props as unknown as Record<string, unknown>);

export default function HeroScene() {
  const [simliToken, setSimliToken] = React.useState<string | null>(null);
  const [agentId, setAgentId] = React.useState<string | null>(null);

  async function summon() {
    const r = await fetch("/api/simli/token", { cache: "no-store" });
    const body = await r.json().catch(async () => ({ raw: await r.text() }));
    if (!r.ok || !body?.token) {
      console.error("Token route failed", { status: r.status, body });
      alert(`Token error ${r.status}: ${body?.details ?? body?.error ?? "unknown"}`);
      return;
    }
    setSimliToken(body.token);
    setAgentId(body.agentid);
  }

  return (
    <>
      {/* Load widget script once */}
      <Script src="https://cdn.simli.com/widget.js" strategy="afterInteractive" />

      {/* Full-bleed background video */}
      <video
        className="fixed inset-0 -z-10 h-[100dvh] w-screen object-cover"
        autoPlay
        muted
        loop
        playsInline
        src="/video/hero_16x9.mp4"
      />

      {/* Optional darkening overlay across whole page */}
      <div className="fixed inset-0 -z-10 bg-black/40" />

      {/* Top controls */}
      <div className="fixed top-4 left-0 right-0 flex justify-center">
        <button
          onClick={summon}
          className="rounded-xl px-4 py-2 bg-white/90 text-black shadow"
        >
          Summon Sasquatch
        </button>
      </div>

      {/* Centered 16:9 overlay card that contains the widget */}
      <div className="fixed inset-0 grid place-items-center p-4 pointer-events-none">
        <div className="w-full max-w-3xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black/80 pointer-events-auto">
          {/* We control framing; set overlay=false and position=relative */}
          {simliToken && agentId ? (
            <SimliWidget
              token={simliToken}
              agentid={agentId}
              position="relative"
              overlay={false}
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-white/80">
              Click "Summon Sasquatch"
            </div>
          )}
        </div>
      </div>
    </>
  );
}