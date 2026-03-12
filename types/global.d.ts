import React from "react";

type SquatchSimliController = {
  open: () => boolean;
  close: () => boolean;
  toggle: () => "connect" | "disconnect" | null;
  isReady: () => boolean;
  isRunning: () => boolean;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "simli-widget": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        token?: string;
        avatarid?: string;   // <-- use avatarid
        overlay?: boolean | "true" | "false";
        position?: string;
      };
    }
  }

  interface Window {
    __squatchSimliController?: SquatchSimliController;
  }
}
export {};
