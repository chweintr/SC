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
  const [isLoading, setIsLoading] = React.useState(false);
  const [showWidget, setShowWidget] = React.useState(false);
  const [motionOk, setMotionOk] = React.useState(true);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      setMotionOk(!motion.matches);
      const onMotion = () => setMotionOk(!motion.matches);
      motion.addEventListener?.('change', onMotion);
      return () => {
        motion.removeEventListener?.('change', onMotion);
      };
    }
  }, []);

  async function summon() {
    setIsLoading(true);
    try {
      const r = await fetch("/api/simli/token", { cache: "no-store" });
      const body = await r.json().catch(async () => ({ raw: await r.text() }));
      if (!r.ok || !body?.token) {
        console.error("Token route failed", { status: r.status, body });
        alert(`Token error ${r.status}: ${body?.details ?? body?.error ?? "unknown"}`);
        return;
      }
      setSimliToken(body.token);
      setAgentId(body.agentid);
      setShowWidget(true);
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
      <Script 
        src="https://cdn.jsdelivr.net/npm/@simli/widget@latest/dist/simli-widget.js" 
        strategy="afterInteractive"
        onError={(e) => console.error('Failed to load Simli widget:', e)}
      />
      
      {/* Full viewport container */}
      <section className="relative w-screen h-screen overflow-hidden bg-black">
        {/* Background video */}
        {motionOk && (
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            src="/video/hero_16x9.mp4"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
        )}
        
        {/* Device frame overlay at full viewport */}
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="/ui/device_frame.png" 
            alt=""
            className="w-full h-full object-cover pointer-events-none"
            style={{ position: 'absolute', inset: 0, zIndex: 20 }}
          />
          
          {/* Interactive area - positioned to match device frame cutout */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Adjust this container size to match your device frame's screen area */}
            <div className="relative" style={{ 
              width: '60%', 
              maxWidth: '800px',
              aspectRatio: '1/1'
            }}>
              {!showWidget ? (
                <div className="w-full h-full flex items-center justify-center">
                  <button 
                    onClick={summon} 
                    disabled={isLoading}
                    className="px-8 py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-700 disabled:opacity-50 text-black font-bold rounded-full shadow-lg transform transition hover:scale-105 disabled:scale-100 z-30 relative"
                  >
                    {isLoading ? 'Summoning...' : 'Summon Sasquatch'}
                  </button>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  {/* Simli widget */}
                  <div className="absolute inset-0 overflow-hidden rounded-3xl">
                    {simliToken && agentId ? (
                      <SimliWidget
                        token={simliToken}
                        agentid={agentId}
                        position="relative"
                        overlay={false}
                        className="w-full h-full"
                      />
                    ) : null}
                  </div>
                  
                  {/* Close button */}
                  <button
                    onClick={closeWidget}
                    className="absolute top-4 right-4 z-30 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg"
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
        </div>
      </section>
    </>
  );
}