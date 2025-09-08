"use client";
import * as React from "react";

export default function SimliSquare() {
  const hostRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    (async () => {
      const r = await fetch("/api/simli/token", { cache: "no-store" });
      if (!r.ok) { console.error("Token error", await r.text()); return; }
      const { token, avatarid } = await r.json();

      const el = document.createElement("simli-widget");
      (el as any).token = token;
      (el as any).avatarid = avatarid;   // <- avatar id, not face/agent
      (el as any).overlay = false;
      el.setAttribute("style", "display:block;width:100%;height:100%");
      hostRef.current?.appendChild(el);
    })();
  }, []);

  return <div ref={hostRef} className="h-full w-full" />;
}