"use client";
import * as React from "react";

type ClickZoneProps = {
  style?: React.CSSProperties;
  className?: string;
};

type WidgetElement = HTMLElement & {
  isRunning?: boolean;
  openWidget?: () => void;
  closeWidget?: () => void;
  shadowRoot?: ShadowRoot | null;
};

export default function ClickZone({ style, className }: ClickZoneProps) {
  const lastTriggerRef = React.useRef(0);

  const triggerSimliWidget = (): "connect" | "disconnect" | null => {
    const simliWidget = document.querySelector('simli-widget') as WidgetElement | null;
    if (!simliWidget) {
      console.log('simli-widget not found');
      return null;
    }

    const isRunning = Boolean(simliWidget.isRunning);
    if (isRunning) {
      if (typeof simliWidget.closeWidget === 'function') {
        simliWidget.closeWidget();
        return "disconnect";
      }
      const closeButton = simliWidget.shadowRoot?.querySelector('.close-button') as HTMLButtonElement | null;
      closeButton?.click();
      return "disconnect";
    }

    if (typeof simliWidget.openWidget === 'function') {
      simliWidget.openWidget();
      return "connect";
    }

    const controlButton = simliWidget.shadowRoot?.querySelector('.control-button') as HTMLButtonElement | null;
    if (controlButton) {
      controlButton.click();
      return "connect";
    }

    return null;
  };

  const handleActivate = (event?: React.SyntheticEvent) => {
    event?.preventDefault();
    const now = Date.now();
    if (now - lastTriggerRef.current < 250) {
      return;
    }
    lastTriggerRef.current = now;

    console.log('ClickZone activated');
    const action = triggerSimliWidget();
    if (action) {
      document.dispatchEvent(new CustomEvent('squatch-button-clicked', { detail: { action } }));
      return;
    }

    // Slow devices can render the widget late; retry briefly.
    let attempts = 0;
    const maxAttempts = 12;
    const retry = window.setInterval(() => {
      attempts += 1;
      const retryAction = triggerSimliWidget();
      if (retryAction) {
        document.dispatchEvent(new CustomEvent('squatch-button-clicked', { detail: { action: retryAction } }));
      }
      if (retryAction || attempts >= maxAttempts) {
        window.clearInterval(retry);
      }
    }, 250);
  };

  return (
    <div 
      className={`absolute z-[60] cursor-pointer ${className ?? ""}`}
      onPointerDown={handleActivate}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          handleActivate(event);
        }
      }}
      style={{
        ...style,
        // Invisible but clickable
        background: 'transparent',
      }}
      aria-label="Activate Squatch"
      role="button"
      tabIndex={0}
    />
  );
}
