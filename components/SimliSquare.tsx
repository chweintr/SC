"use client";
import * as React from "react";

/**
 * Creates and mounts a <simli-widget> in overlay mode.
 *
 * In overlay mode the widget looks for <button id="simliOverlayBtn">
 * (rendered by ClickZone) and wires its own click handler to
 * start/stop the session.
 *
 * The widget calls GET /auto/start/{agentId}/{token} to get a Daily.co
 * room URL, then joins via WebRTC.
 *
 * We inject CSS into the shadow root to hide the widget's built-in
 * chrome and make the video fill the container for overlay compositing.
 */

const FACE_ID = "db457e6f-ac2e-4478-9f75-430ed9fd5a3c";

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

      const el = document.createElement("simli-widget") as any;

      // Set attributes – the widget reads these via getAttribute()
      // Use multiple naming formats for compatibility (Simli docs are inconsistent)
      el.setAttribute("token", token);
      el.setAttribute("agentid", avatarid);
      el.setAttribute("agentId", avatarid);
      el.setAttribute("agent-id", avatarid);
      el.setAttribute("faceid", FACE_ID);
      el.setAttribute("faceId", FACE_ID);
      el.setAttribute("face-id", FACE_ID);
      el.setAttribute("overlay", "true");
      el.setAttribute("position", "relative");
      el.setAttribute(
        "style",
        "display:block;position:relative;inset:auto;width:100%;height:100%;background:transparent;z-index:1"
      );

      // Also set as JS properties for compatibility
      el.token = token;
      el.agentid = avatarid;
      el.agentId = avatarid;
      el.faceid = FACE_ID;
      el.faceId = FACE_ID;

      if (hostRef.current) {
        hostRef.current.innerHTML = "";
        hostRef.current.appendChild(el);
      }

      console.log("[SimliSquare] Widget mounted with overlay=true, agentId:", avatarid);

      // ── Inject styles into the shadow root to hide chrome ──
      const injectStyles = () => {
        const shadow = el.shadowRoot;
        if (!shadow) return false;
        if (shadow.getElementById("squatch-style")) return true;

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
        const running = el.isRunning === true;
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

      // Expose stop function for the HeroScene "End" button
      (window as any).__squatchSimliStop = () => {
        if (typeof el.stopSession === "function") {
          el.stopSession();
        } else if (typeof el.closeWidget === "function") {
          el.closeWidget();
        }
      };

      // Expose auto-start: polls for the widget's internal Start button
      // and clicks it programmatically. Last-resort fallback if overlay
      // mode's findAndConnectTriggerButton() didn't bind properly.
      (window as any).__squatchSimliAutoStart = () => {
        // First try the widget's public API
        if (typeof el.startSession === "function" && !el.isRunning) {
          console.log("[SimliSquare] autoStart: calling startSession()");
          el.startSession();
          return;
        }
        // Fallback: find and click the internal button
        let attempts = 0;
        const tryClick = () => {
          attempts++;
          let btn: HTMLButtonElement | null = el.querySelector("button");
          if (!btn && el.shadowRoot) {
            btn = el.shadowRoot.querySelector("button");
          }
          if (btn) {
            console.log("[SimliSquare] autoStart: clicking internal button");
            btn.click();
            return;
          }
          if (attempts < 30) setTimeout(tryClick, 200);
          else console.warn("[SimliSquare] autoStart: gave up after 30 attempts");
        };
        tryClick();
      };
    };

    mount().catch((err) => console.error("SimliSquare mount error:", err));

    return () => {
      if (shadowStyleInterval) clearInterval(shadowStyleInterval);
      if (syncInterval) clearInterval(syncInterval);
      delete (window as any).__squatchSimliStop;
      delete (window as any).__squatchSimliAutoStart;
    };
  }, []);

  return <div ref={hostRef} className="h-full w-full" />;
}
