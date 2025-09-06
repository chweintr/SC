// types/simli-widget.d.ts
import type * as React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "simli-widget": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        token?: string;
        agentid?: string;
        position?: string;
        overlay?: boolean | "true" | "false";
        // optional extras if you plan to use them:
        "button-text"?: string;
        "button-image"?: string;
        "bot-name"?: string;
        theme?: string;
      };
    }
  }
}
export {};