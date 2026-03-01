"use client";
import * as React from "react";

type ClickZoneProps = {
  style?: React.CSSProperties;
  className?: string;
};

export default function ClickZone({ style, className }: ClickZoneProps) {
  const lastTriggerRef = React.useRef(0);

  const triggerSimliButton = () => {
    const simliWidget = document.querySelector('simli-widget');
    if (!simliWidget) {
      console.log('simli-widget not found');
      return false;
    }

    const buttons = Array.from(simliWidget.querySelectorAll('button')) as HTMLButtonElement[];
    if (!buttons.length) {
      console.log('No buttons found in simli-widget');
      return false;
    }

    const clickable = buttons.find((btn) => !btn.disabled) ?? buttons[0];
    console.log('Clicking Simli button:', clickable?.textContent || clickable?.getAttribute('aria-label') || 'unknown');
    clickable.click();
    clickable.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    clickable.dispatchEvent(new Event('click', { bubbles: true }));
    return true;
  };

  const handleActivate = (event?: React.SyntheticEvent) => {
    event?.preventDefault();
    const now = Date.now();
    if (now - lastTriggerRef.current < 250) {
      return;
    }
    lastTriggerRef.current = now;

    console.log('ClickZone activated');
    document.dispatchEvent(new CustomEvent('squatch-button-clicked'));

    if (triggerSimliButton()) {
      return;
    }

    // Slow devices can render Simli controls late; retry briefly.
    let attempts = 0;
    const maxAttempts = 12;
    const retry = window.setInterval(() => {
      attempts += 1;
      if (triggerSimliButton() || attempts >= maxAttempts) {
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
