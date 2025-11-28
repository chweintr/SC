import React from "react";
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
}
export {};