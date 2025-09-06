"use client";
import * as React from "react";
import Script from "next/script";

// Strongly-typed props for the custom element
type SimliWidgetProps = React.HTMLAttributes<HTMLElement> & {
  token?: string;
  agentid?: string;
  position?: string;
  overlay?: boolean | "true" | "false";
  "button-text"?: string;
  "button-image"?: string;
  "bot-name"?: string;
  theme?: string;
};

// Wrapper avoids JSX.IntrinsicElements typing entirely
const SimliWidget: React.FC<SimliWidgetProps> = (props) =>
  React.createElement("simli-widget", props as unknown as Record<string, unknown>);

export default function HeroScene() {
  const [simliToken, setSimliToken] = React.useState<string | null>(null);
  const [agentId, setAgentId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showWidget, setShowWidget] = React.useState(false);

  async function summon() {
    setIsLoading(true);
    try {
      const r = await fetch("/api/simli/token");
      const j = await r.json();
      if (j.token && j.agentid) {
        setSimliToken(j.token);
        setAgentId(j.agentid);
        setShowWidget(true);
      } else {
        console.error("Token route failed", j);
        alert('Failed to summon Sasquatch. Please try again.');
      }
    } catch (err) {
      console.error("Failed to summon:", err);
      alert('Failed to summon Sasquatch. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function closeWidget() {
    setShowWidget(false);
    setSimliToken(null);
    setAgentId(null);
  }

  return (
    <>
      <Script src="https://cdn.simli.com/widget.js" strategy="afterInteractive" />
      
      <section className="relative w-full h-full overflow-hidden bg-black">
        {/* Background video */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          src="/video/hero_16x9.mp4"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <div className="relative" style={{ width: 'clamp(280px, 50vmin, 720px)' }}>
            {!showWidget ? (
              <div className="aspect-square overflow-hidden rounded-3xl relative bg-gradient-to-b from-amber-900/90 to-amber-950/90 flex items-center justify-center">
                <button 
                  onClick={summon} 
                  disabled={isLoading}
                  className="px-8 py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-700 disabled:opacity-50 text-black font-bold rounded-full shadow-lg transform transition hover:scale-105 disabled:scale-100"
                >
                  {isLoading ? 'Summoning...' : 'Summon Sasquatch'}
                </button>
              </div>
            ) : (
              <div className="aspect-square overflow-hidden rounded-3xl bg-black relative">
                {simliToken && agentId ? (
                  <SimliWidget
                    token={simliToken}
                    agentid={agentId}
                    position="relative"
                    overlay="true"
                  />
                ) : null}
                <button
                  onClick={closeWidget}
                  className="absolute top-4 right-4 z-50 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg"
                  aria-label="Close"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <img 
            src="/images/trees-left.png" 
            alt="" 
            className="absolute left-0 bottom-0 h-full w-auto opacity-30"
          />
          <img 
            src="/images/trees-right.png" 
            alt="" 
            className="absolute right-0 bottom-0 h-full w-auto opacity-30" 
          />
        </div>
      </section>
    </>
  );
}