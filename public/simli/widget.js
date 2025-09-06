// Simli Widget - Custom Element Definition
class SimliWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const token = this.getAttribute('token');
    const agentid = this.getAttribute('agentid');
    const position = this.getAttribute('position') || 'absolute';
    const overlay = this.getAttribute('overlay') === 'true';

    if (!token || !agentid) {
      console.error('Simli Widget: token and agentid are required');
      return;
    }

    // Create iframe for Simli widget
    const iframe = document.createElement('iframe');
    iframe.src = `https://app.simli.com/widget?token=${encodeURIComponent(token)}&agentid=${encodeURIComponent(agentid)}&overlay=${overlay}`;
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      position: ${position};
      top: 0;
      left: 0;
      z-index: 1;
    `;
    iframe.allow = 'camera; microphone; autoplay';

    this.shadowRoot.appendChild(iframe);
  }
}

// Register the custom element
if (!customElements.get('simli-widget')) {
  customElements.define('simli-widget', SimliWidget);
}
