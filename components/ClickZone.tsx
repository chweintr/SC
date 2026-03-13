"use client";
import * as React from "react";

type ClickZoneProps = {
  style?: React.CSSProperties;
  className?: string;
};

/**
 * Invisible button positioned over the red button in the overlay PNG.
 * The Simli widget (in overlay mode) automatically finds this button
 * by its id="simliOverlayBtn" and wires up its own click handler
 * to start/stop the session. We just need to dispatch a UI event
 * so HeroScene can update its visual state.
 */
export default function ClickZone({ style, className }: ClickZoneProps) {
  const lastTriggerRef = React.useRef(0);

  const handleActivate = () => {
    const now = Date.now();
    if (now - lastTriggerRef.current < 500) return;
    lastTriggerRef.current = now;

    console.log("ClickZone activated");

    // Check if the widget is currently running to determine the action
    const widget = document.querySelector("simli-widget") as HTMLElement | null;
    const isRunning = widget && (widget as any).isRunning;
    const action = isRunning ? "disconnect" : "connect";

    document.dispatchEvent(
      new CustomEvent("squatch-button-clicked", { detail: { action } })
    );
  };

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
