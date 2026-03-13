"use client";
import * as React from "react";

/**
 * Creates and mounts a <simli-widget> in overlay mode.
 *
 * In overlay mode the widget looks for <button id="simliOverlayBtn">
 * (rendered by ClickZone) and wires its own click handler to
 * start/stop the session – no programmatic .openWidget() needed.
 *
 * We inject CSS into the shadow root to hide the widget's built-in
 * chrome (buttons, logo, dotted-face) and make the video fill the
 * container so it composites cleanly under the overlay PNG.
 */
export default function SimliSquare() {
  const hostRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let shadowStyleInterval: ReturnType<typeof setInterval> | null = null;
    let syncInterval: ReturnType<typeof setInterval> | null = null;

    const mount = async () => {
      const r = await fetch("/api/simli/token", { cache: "no-store" });
      if (!r.ok) {
        console.error("Token error", await r.text());
        return;
      }

      const { token, avatarid, _isMock } = await r.json();
      if (!token || _isMock) return;

      const el = document.createElement("simli-widget");

      // Set attributes – the widget reads these via getAttribute()
      el.setAttribute("token", token);
      el.setAttribute("agentid", avatarid);
      el.setAttribute("overlay", "true");          // <-- key: enables #simliOverlayBtn binding
      el.setAttribute("position", "relative");
      el.setAttribute(
        "style",
        "display:block;position:relative;inset:auto;width:100%;height:100%;background:transparent;z-index:1"
      );

      if (hostRef.current) {
        hostRef.current.innerHTML = "";
        hostRef.current.appendChild(el);
      }

      console.log("[SimliSquare] Widget mounted with overlay=true");

      // ── Inject styles into the shadow root to hide chrome ──
      const injectStyles = () => {
        const shadow = el.shadowRoot;
        if (!shadow) return false;
        if (shadow.getElementById("squatch-style")) return true; // already done

        const s = document.createElement("style");
        s.id = "squatch-style";
        s.textContent = `
          :host {
            display: block !important;
            position: relative !important;
            inset: auto !important;
            width: 100% !important;
            height: 100% !important;
          }
          .widget-container,
          .video-wrapper {
            position: relative !important;
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
            margin: 0 !important;
            overflow: hidden !important;
            background: transparent !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          .controls-wrapper,
          .control-button,
          .close-button,
          .status-container,
          .simli-logo,
          .dotted-face {
            display: none !important;
          }
          .simli-video {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            background: transparent !important;
          }
          *, *::before, *::after {
            background: transparent !important;
            background-color: transparent !important;
          }
        `;
        shadow.appendChild(s);
        console.log("[SimliSquare] Shadow styles injected");
        return true;
      };

      // Poll until shadowRoot exists (created after Daily.js loads)
      shadowStyleInterval = setInterval(() => {
        if (injectStyles()) {
          clearInterval(shadowStyleInterval!);
          shadowStyleInterval = null;
        }
      }, 150);

      // ── Toggle idle video based on stream state ──
      const idleVideo = document.getElementById("idle-video") as HTMLVideoElement | null;

      syncInterval = setInterval(() => {
        const shadow = el.shadowRoot;
        if (!shadow || !idleVideo) return;

        const simliVideo = shadow.querySelector(".simli-video") as HTMLVideoElement | null;
        const running = (el as any).isRunning === true;
        const hasStream =
          !!simliVideo &&
          (!!simliVideo.srcObject ||
            (simliVideo.readyState >= 2 && !simliVideo.paused));

        const showIdle = !running || !hasStream;
        idleVideo.style.opacity = showIdle ? "1" : "0";
        idleVideo.style.visibility = showIdle ? "visible" : "hidden";
      }, 300);

      // Stop polling after 60s to save resources
      setTimeout(() => {
        if (syncInterval) clearInterval(syncInterval);
      }, 60000);

      // Expose a simple stop function for the HeroScene "End" button
      (window as any).__squatchSimliStop = () => {
        if (typeof (el as any).stopSession === "function") {
          (el as any).stopSession();
        } else if (typeof (el as any).closeWidget === "function") {
          (el as any).closeWidget();
        }
      };
    };

    mount().catch((err) => console.error("SimliSquare mount error:", err));

    return () => {
      if (shadowStyleInterval) clearInterval(shadowStyleInterval);
      if (syncInterval) clearInterval(syncInterval);
      delete (window as any).__squatchSimliStop;
    };
  }, []);

  return <div ref={hostRef} className="h-full w-full" />;
}
