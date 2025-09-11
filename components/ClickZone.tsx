"use client";
import * as React from "react";

export default function ClickZone() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClick = () => {
    console.log('ClickZone clicked!');
    // Find the actual Simli button and click it
    const simliWidget = document.querySelector('simli-widget');
    console.log('Found simli-widget:', !!simliWidget);
    
    if (simliWidget) {
      const buttons = simliWidget.querySelectorAll('button');
      console.log('Found buttons:', buttons.length);
      
      if (buttons.length > 0) {
        const button = buttons[0]; // Get first button
        console.log('Button text:', button.textContent);
        console.log('Button visible:', button.offsetWidth > 0);
        console.log('Clicking button...');
        
        // Try multiple click methods
        button.click();
        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        button.dispatchEvent(new Event('click', { bubbles: true }));
      } else {
        console.log('No buttons found in simli-widget');
      }
    } else {
      console.log('simli-widget not found');
    }
  };

  if (!isMobile) return null;

  return (
    <div 
      className="fixed z-[60] cursor-pointer"
      onClick={handleClick}
      style={{
        // Position exactly where the red button is in Overlay_9
        left: '75%',  // Adjusted for red button position
        top: '61%',   // Lower position for the red button
        transform: 'translate(-50%, -50%)',
        width: '80px',
        height: '80px',
        // Invisible but clickable
        background: 'transparent',
        // border: '2px dashed red', // Uncomment to see position
      }}
      aria-label="Activate Squatch"
    />
  );
}