"use client";
import * as React from "react";

type WidgetElement = HTMLElement & {
  shadowRoot?: ShadowRoot | null;
  isRunning?: boolean;
};

function applyShadowStyles(widget: WidgetElement) {
  const shadow = widget.shadowRoot;
  if (!shadow) return;

  if (!shadow.getElementById("squatch-widget-style")) {
    const style = document.createElement("style");
    style.id = "squatch-widget-style";
    style.textContent = `
      :host {
        display: block !important;
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
        aspect-ratio: 1 / 1 !important;
        margin: 0 !important;
        overflow: hidden !important;
        background: transparent !important;
        border: none !important;
      }
      .controls-wrapper,
      .control-button,
      .close-button,
      .status-container,
      .simli-logo {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
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
      audio {
        display: none !important;
      }
    `;
    shadow.appendChild(style);
  }
}

function stripWidgetChrome(widget: WidgetElement) {
  const shadow = widget.shadowRoot;
  if (!shadow) return;

  shadow
    .querySelectorAll(
      ".controls-wrapper, .control-button, .close-button, .status-container, .simli-logo, .dotted-face"
    )
    .forEach((el) => el.remove());

  const container = shadow.querySelector(".widget-container") as HTMLElement | null;
  if (container) {
    container.style.display = "block";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.maxWidth = "100%";
    container.style.maxHeight = "100%";
    container.style.background = "transparent";
  }

  const wrapper = shadow.querySelector(".video-wrapper") as HTMLElement | null;
  if (wrapper) {
    wrapper.style.width = "100%";
    wrapper.style.height = "100%";
    wrapper.style.maxWidth = "100%";
    wrapper.style.maxHeight = "100%";
    wrapper.style.margin = "0";
    wrapper.style.overflow = "hidden";
  }
}

function syncVisualState(widget: WidgetElement, idleVideo: HTMLVideoElement | null) {
  applyShadowStyles(widget);
  stripWidgetChrome(widget);
  const shadow = widget.shadowRoot;
  if (!shadow || !idleVideo) return;

  const simliVideo = shadow.querySelector(".simli-video") as HTMLVideoElement | null;
  const running = Boolean(widget.isRunning);
  const hasStream =
    !!simliVideo &&
    (!!(simliVideo as HTMLVideoElement & { srcObject?: MediaStream | null }).srcObject ||
      (simliVideo.readyState >= 2 && !simliVideo.paused) ||
      simliVideo.currentTime > 0);

  const showIdle = !running || !hasStream;
  idleVideo.style.opacity = showIdle ? "1" : "0";
  idleVideo.style.visibility = showIdle ? "visible" : "hidden";
}

export default function SimliSquare() {
  const hostRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let widget: WidgetElement | null = null;
    let intervalId: number | null = null;
    let shadowObserver: MutationObserver | null = null;
    let hostObserver: MutationObserver | null = null;

    const idleVideo = document.getElementById("idle-video") as HTMLVideoElement | null;

    const mount = async () => {
      const r = await fetch("/api/simli/token", { cache: "no-store" });
      if (!r.ok) {
        console.error("Token error", await r.text());
        return;
      }

      const responseData = await r.json();
      const { token, avatarid, _isMock } = responseData;
      if (!token || _isMock) return;

      widget = document.createElement("simli-widget") as WidgetElement;
      (widget as unknown as Record<string, unknown>).token = token;
      (widget as unknown as Record<string, unknown>).avatarid = avatarid;
      (widget as unknown as Record<string, unknown>).agentid = avatarid;
      (widget as unknown as Record<string, unknown>).overlay = false;

      widget.setAttribute("token", token);
      widget.setAttribute("avatarid", avatarid);
      widget.setAttribute("agentid", avatarid);
      widget.setAttribute("overlay", "false");
      widget.setAttribute("style", "display:block;width:100%;height:100%;background:transparent");

      if (hostRef.current) {
        hostRef.current.innerHTML = "";
        hostRef.current.appendChild(widget);
      }

      const sync = () => {
        if (!widget) return;
        syncVisualState(widget, idleVideo);
      };

      sync();

      intervalId = window.setInterval(sync, 250);
      window.setTimeout(() => {
        if (intervalId) window.clearInterval(intervalId);
      }, 30000);

      hostObserver = new MutationObserver(sync);
      hostObserver.observe(widget, { childList: true, subtree: true });

      const waitForShadow = window.setInterval(() => {
        if (!widget?.shadowRoot) return;
        applyShadowStyles(widget);
        sync();
        shadowObserver = new MutationObserver(sync);
        shadowObserver.observe(widget.shadowRoot, {
          childList: true,
          subtree: true,
          attributes: true,
        });
        window.clearInterval(waitForShadow);
      }, 100);
    };

    mount().catch((err) => {
      console.error("Simli widget mount error:", err);
    });

    return () => {
      if (intervalId) window.clearInterval(intervalId);
      shadowObserver?.disconnect();
      hostObserver?.disconnect();
    };
  }, []);

  return <div ref={hostRef} className="h-full w-full" />;
}
