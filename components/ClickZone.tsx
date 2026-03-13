"use client";
import * as React from "react";

type ClickZoneProps = {
  style?: React.CSSProperties;
  className?: string;
};

/**
 * Invisible button over the red button in the overlay PNG.
 *
 * The Simli widget (overlay mode) auto-binds to id="simliOverlayBtn"
 * and wires its own click → handleConnection() + startSession().
 *
 * IMPORTANT: We must NOT read widget.isRunning here to decide
 * connect vs disconnect.  The widget's native listener fires BEFORE
 * React's onClick, so isRunning is already flipped by the time we
 * read it — causing us to immediately stop the session we just started.
 *
 * Instead we track intent via our own flag and only dispatch the UI
 * event for HeroScene.  The widget handles the actual session toggle.
 * For disconnect, HeroScene uses __squatchSimliStop().
 */
export default function ClickZone({ style, className }: ClickZoneProps) {
  const lastTriggerRef = React.useRef(0);
  const intentRef = React.useRef<"idle" | "connected">("idle");

  const handleActivate = () => {
    const now = Date.now();
    if (now - lastTriggerRef.current < 500) return;
    lastTriggerRef.current = now;

    console.log("ClickZone activated, intent:", intentRef.current);

    const widget = document.querySelector("simli-widget") as any;

    if (intentRef.current === "idle") {
      // User wants to connect
      intentRef.current = "connected";

      document.dispatchEvent(
        new CustomEvent("squatch-button-clicked", {
          detail: { action: "connect" },
        })
      );

      // Fallback: if the widget's own overlay handler didn't attach,
      // start the session directly.  We defer briefly so the widget's
      // native handler gets a chance to run first.
      setTimeout(() => {
        const w = document.querySelector("simli-widget") as any;
        if (w && !w.isRunning) {
          console.log("ClickZone: widget handler didn't fire, using autoStart fallback");
          const autoStart = (window as any).__squatchSimliAutoStart;
          if (typeof autoStart === "function") {
            autoStart();
          } else if (typeof w.startSession === "function") {
            w.startSession();
          }
        }
      }, 200);
    } else {
      // User wants to disconnect
      intentRef.current = "idle";

      document.dispatchEvent(
        new CustomEvent("squatch-button-clicked", {
          detail: { action: "disconnect" },
        })
      );

      if (widget) {
        if (typeof widget.stopSession === "function") widget.stopSession();
        else if (typeof widget.closeWidget === "function") widget.closeWidget();
      }
    }
  };

  // Reset intent when the widget disconnects externally (e.g., timeout)
  React.useEffect(() => {
    const onDisconnect = () => {
      intentRef.current = "idle";
    };
    // The widget fires handleDisconnection which sets isRunning=false;
    // we listen for the HeroScene event as a proxy.
    document.addEventListener("squatch-button-clicked", (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.action === "disconnect") {
        intentRef.current = "idle";
      }
    });
    return () => {};
  }, []);

  return (
    <button
      id="simliOverlayBtn"
      type="button"
      className={`absolute z-[60] cursor-pointer touch-manipulation ${className ?? ""}`}
      onClick={handleActivate}
      style={{
        ...style,
        background: "transparent",
        border: "none",
        borderRadius: "999px",
      }}
      aria-label="Activate Squatch"
      tabIndex={0}
    />
  );
}
