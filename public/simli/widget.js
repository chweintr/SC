// Function to load external script
function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Styles configuration
const WIDGET_STYLES = {
  // Base styles for the widget host
  host: (position) => `
    display: block;
    position: ${position === "relative" ? "relative" : "fixed"};
    bottom: ${position === "relative" ? "auto" : "24px"};
    ${position === "left" ? "left: 24px" : position === "right" ? "right: 24px" : ""};
    z-index: 9999;
    transition: left 0.3s ease, right 0.3s ease;
  `,
  
  // Container styles
  container: (position) => `
    width: 480px;
    display: flex;
    flex-direction: column;
    align-items: ${position === "left" ? "start" : position === "relative" ? "center" : "end"};
    justify-content: flex-end;
    gap: 12px;
    position: relative;
    transition: width 0.3s ease, height 0.3s ease;
  `,
  
  containerExpanded: (position) => `
    width: min(420px, calc(100vw - 48px));
  `,
  
  // Video container styles
  videoContainer: `
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    background-color: black;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  `,
  
  // Controls container styles
  controlsContainer: `
    z-index: 2;
  `,
  
  // Video element styles
  video: `
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  `,
  
  // Logo styles
  logo: `
    position: absolute;
    top: 10px;
    left: 10px;
    width: 48px;
    z-index: 1;
  `,
  
  // Dotted face styles
  dottedFace: `
    width: 100%;
    object-fit: cover;
    pointer-events: none;
  `,
  
  // Button styles
  button: {
    base: `
      padding: 6px 18px;
      font-size: 24px;
      font-weight: 500;
      font-family: "ABCRepro", sans-serif;
      cursor: pointer;
      background-color: #0000FF;
      border-radius: 24px;
      border: none;
      color: white;
      outline: none;
      transition: all 0.1s ease;
      text-wrap: nowrap;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `,
    hover: `
      border-radius: 4px;
    `,
    active: `
      background-color: #ff0000;
      color: white;
    `
  }
};

const OVERLAY_STYLES = {
  // Host styles
  host: (position) => `
    position: ${position === "relative" ? "relative" : "fixed"};
    bottom: ${position === "relative" ? "auto" : "24px"};
    ${position === "left" ? "left: 24px" : position === "right" ? "right: 24px" : ""};
    z-index: 9999;
  `,

  // Container styles
  container: `
    width: fit-content;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    position: relative;
  `,

  // Expanded container styles
  containerExpanded: `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `,

  // Video wrapper styles
  videoWrapper: `
    width: min(80%, 500px);
    max-width: min(500px, calc(100vw - 40px));
    aspect-ratio: 1/1;
    display: none;
    flex-direction: column;
    align-items: center;
    position: relative;
    background-color: black;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  `,

  // Video wrapper expanded styles
  videoWrapperExpanded: `
    display: flex;
  `,

  // Video styles
  video: `
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
    transform: none;
  `,

  // Button styles
  button: {
    base: `
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      background-color: #007AFF;
      border-radius: 8px;
      border: none;
      color: white;
      outline: none;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `,
    hover: `
      background-color: #0056b3;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `,
    active: `
      background-color: #dc3545;
    `
  },

  // Controls container styles for overlay
  controlsContainer: `
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10000;
    display: flex;
    gap: 12px;
    padding: 0 20px;
    box-sizing: border-box;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  `,

  // Close button styles for overlay
  closeButton: `
    padding: 6px 12px;
    font-size: 24px;
    font-weight: 500;
    font-family: "ABCRepro", sans-serif;
    cursor: pointer;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    border: none;
    color: white;
    outline: none;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 24px;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,

  closeButtonHover: `
    background-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  `,

  // Status message styles
  statusContainer: `
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    border-radius: 8px;
    font-family: sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: white;
    background-color: rgba(0, 0, 0, 0.8);
    display: none;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;
    max-width: calc(100vw - 40px);
    text-align: center;
    word-wrap: break-word;
  `,

  statusError: `
    background-color: rgba(220, 53, 69, 0.8);
  `,
};

// Add mobile-specific styles
const MOBILE_STYLES = (position) => `
  @media (max-width: 768px) {
    :host {
      ${position === "left" ? "left: 12px !important;" : position === "right" ? "right: 12px !important;" : ""}
    }
    
    .widget-container.expanded {
      width: min(420px, calc(100vw - 24px)) !important;
    }
  }
  
  @media (max-width: 480px) {
    :host {
      ${position === "left" ? "left: 8px !important;" : position === "right" ? "right: 8px !important;" : ""}
    }
    
    .widget-container.expanded {
      width: min(420px, calc(100vw - 16px)) !important;
    }
  }
`;

// Load
loadScript("https://unpkg.com/@daily-co/daily-js")
  .then(() => {
    // Singleton instance manager to prevent duplicate instances
    const DailyInstanceManager = {
      instance: null,
      cleanup() {
        if (this.instance) {
          this.instance.destroy();
          this.instance = null;
        }
      },
    };

    class DailyCallManager {
      constructor(widget) {
        // Clean up any existing instance before creating a new one
        if (DailyInstanceManager.instance) {
          DailyInstanceManager.cleanup();
        }

        this.widget = widget;
        this.call = Daily.createCallObject();
        this.currentRoomUrl = null;

        // Store bound event handlers
        this.boundHandlers = {
          "joined-meeting": this.handleJoin.bind(this),
          "left-meeting": this.handleLeave.bind(this),
          "participant-joined":
            this.handleParticipantJoinedOrUpdated.bind(this),
          "participant-left": this.handleParticipantLeft.bind(this),
          "participant-updated":
            this.handleParticipantJoinedOrUpdated.bind(this),
          error: this.handleError.bind(this),
        };

        DailyInstanceManager.instance = this;
        this.initialize();
      }

      destroy() {
        if (this.call) {
          // Remove event listeners using stored references
          Object.entries(this.boundHandlers).forEach(([event, handler]) => {
            this.call.off(event, handler);
          });

          // Clear bound handlers
          this.boundHandlers = {};

          // Destroy the call object
          this.call.destroy();
          this.call = null;
        }
      }

      async initialize() {
        this.setupEventListeners();
      }

      setupEventListeners() {
        // Use stored bound handlers to set up listeners
        Object.entries(this.boundHandlers).forEach(([event, handler]) => {
          this.call.on(event, handler);
        });
      }

      handleJoin(event) {
        console.log(`Successfully joined`);
        const tracks = event.participants.local.tracks;

        // Update UI elements
        this.widget.handleConnection();
        // Hide status message on successful connection
        this.widget.hideStatus();

        // Initialize tracks
        Object.entries(tracks).forEach(([trackType, trackInfo]) => {
          if (trackInfo.persistentTrack) {
            this.startOrUpdateTrack(trackType, trackInfo, "local");
          }
        });
      }

      handleLeave() {
        console.log("Successfully left the call");
        this.widget.handleDisconnection();
      }

      handleError(e) {
        console.error("DAILY ERROR:", e.error ? e.error : e.errorMsg);
        this.widget.handleDisconnection();
      }

      handleParticipantJoinedOrUpdated(event) {
        const { participant } = event;
        const participantId = participant.session_id;
        const isLocal = participant.local;
        const tracks = participant.tracks;

        Object.entries(tracks).forEach(([trackType, trackInfo]) => {
          if (trackInfo.persistentTrack && !isLocal) {
            this.startOrUpdateTrack(trackType, trackInfo, participantId);
          }
        });
      }

      handleParticipantLeft(event) {
        const participantId = event.participant.session_id;
        this.destroyTracks(["video", "audio"], participantId);
      }

      startOrUpdateTrack(trackType, track, participantId) {
        const element =
          trackType === "video" ? this.widget.video : this.widget.audio;

        if (!element) {
          console.error(`${trackType} element not found`);
          return;
        }

        // Skip if it's a local audio track
        if (trackType === "audio" && participantId === "local") {
          return;
        }

        const existingTracks = element.srcObject?.getTracks();
        const needsUpdate = !existingTracks?.includes(track.persistentTrack);

        if (needsUpdate) {
          element.srcObject = new MediaStream([track.persistentTrack]);
          element.onloadedmetadata = () => {
            element
              .play()
              .catch((e) => console.error(`Error playing ${trackType}:`, e));
          };
        }
      }

      destroyTracks(trackTypes, participantId) {
        trackTypes.forEach((trackType) => {
          const element =
            trackType === "video" ? this.widget.video : this.widget.audio;
          if (element) {
            element.srcObject = null;
          }
        });
      }

      async joinRoom(roomUrl) {
        if (!roomUrl) {
          console.error("Room URL is required");
          return;
        }

        this.currentRoomUrl = roomUrl;
        try {
          await this.call.join({ url: roomUrl });
        } catch (e) {
          console.error("Join failed:", e);
          this.widget.handleDisconnection();
        }
      }

      async leave() {
        try {
          await this.call.leave();
          this.widget.handleDisconnection();
        } catch (e) {
          console.error("Leave failed:", e);
        }
      }
    }

    // Define the custom element
    class SimliWidget extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.isRunning = false;
        this.callManager = null;
      }

      static get observedAttributes() {
        return [
          "token",
          "agentid",
          "position",
          "customimage",
          "customtext",
          "overlay"
        ];
      }

      addStyles() {
        const position = this.getAttribute("position");
        const isOverlay = this.getAttribute("overlay") === "true";
        
        const styles = `
          :host { 
            ${isOverlay ? OVERLAY_STYLES.host(position) : WIDGET_STYLES.host(position)}
          }

          .widget-container { 
            ${isOverlay ? OVERLAY_STYLES.container : WIDGET_STYLES.container(position)}
          }

          .widget-container.expanded { 
            ${isOverlay ? OVERLAY_STYLES.containerExpanded : WIDGET_STYLES.containerExpanded(position)}
          }

          .video-wrapper { 
            ${isOverlay ? OVERLAY_STYLES.videoWrapper : WIDGET_STYLES.videoContainer}
          }

          .widget-container.expanded .video-wrapper {
            ${isOverlay ? OVERLAY_STYLES.videoWrapperExpanded : ''}
          }

          .controls-wrapper { 
            ${isOverlay ? OVERLAY_STYLES.controlsContainer : WIDGET_STYLES.controlsContainer}
          }

          .simli-video { 
            ${isOverlay ? OVERLAY_STYLES.video : WIDGET_STYLES.video}
          }

          .simli-logo { ${WIDGET_STYLES.logo} }
          .dotted-face { ${WIDGET_STYLES.dottedFace} }

          .control-button { 
            ${isOverlay ? OVERLAY_STYLES.button.base : WIDGET_STYLES.button.base}
          }

          .control-button:hover { 
            ${isOverlay ? OVERLAY_STYLES.button.hover : WIDGET_STYLES.button.hover}
          }

          .active { 
            ${isOverlay ? OVERLAY_STYLES.button.active : WIDGET_STYLES.button.active}
          }

          .close-button {
            ${OVERLAY_STYLES.closeButton}
          }

          .close-button:hover {
            ${OVERLAY_STYLES.closeButtonHover}
          }

          .status-container {
            ${OVERLAY_STYLES.statusContainer}
          }

          .status-container.error {
            ${OVERLAY_STYLES.statusError}
          }

          ${MOBILE_STYLES(position)}
        `;

        const styleSheet = document.createElement("style");
        styleSheet.textContent = styles;
        this.shadowRoot.appendChild(styleSheet);
      }

      // Handle visibility change
      visibilityChangeHandler = () => {
        if (document.hidden && this.callManager) {
          this.stopSession();
          this.callManager.destroy();
          this.callManager = null;
        } else if (!document.hidden && !this.callManager) {
          // Reinitialize callManager when coming back to the tab
          this.callManager = new DailyCallManager(this);
        }
      };

      // Add method to find and connect to the trigger button
      findAndConnectTriggerButton() {
        const isOverlay = this.getAttribute("overlay") === "true";
        if (!isOverlay) return;

        const button = document.getElementById("simliOverlayBtn");
        if (button) {
          button.addEventListener('click', () => {
            if (!this.isRunning) {
              // Show overlay immediately only in overlay mode
              if (isOverlay) {
                this.handleConnection();
              }
              // Then start the connection process
              this.startSession();
            }
          });
        }
      }

      async connectedCallback() {
        this.addStyles();
        this.setupDOMElements();

        // Clean up any existing instances before creating new one
        if (DailyInstanceManager.instance) {
          DailyInstanceManager.cleanup();
        }

        this.callManager = new DailyCallManager(this);

        // Add visibility change listener
        document.addEventListener(
          "visibilitychange",
          this.visibilityChangeHandler
        );

        // Only add click handler if not in overlay mode
        if (this.getAttribute("overlay") !== "true" && this.controlButton) {
          this.controlButton.addEventListener("click", () => {
            if (!this.isRunning) {
              this.startSession();
              this.controlButton.textContent = "Connecting...";
            } else {
              this.stopSession();
            }
          });
        } else {
          // Find and connect to the trigger button
          this.findAndConnectTriggerButton();
        }
      }

      setupDOMElements() {
        const widgetContainer = document.createElement("div");
        widgetContainer.className = "widget-container";

        const videoWrapper = document.createElement("div");
        videoWrapper.className = "video-wrapper";

        const controlsWrapper = document.createElement("div");
        controlsWrapper.className = "controls-wrapper";

        const simliLogo = document.createElement("img");
        simliLogo.className = "simli-logo";
        simliLogo.src =
          "https://www.simli.com/_next/static/media/SimliLogoV2.c4705897.svg";
        simliLogo.alt = "Simli";

        const dottedFaceGift = document.createElement("video");
        dottedFaceGift.className = "dotted-face";
        dottedFaceGift.autoplay = true;
        dottedFaceGift.loop = true;
        dottedFaceGift.muted = true;
        dottedFaceGift.playsInline = true;
        dottedFaceGift.src =
          this.getAttribute("customimage") ||
          "/squatch-idle.mp4";

        this.video = document.createElement("video");
        this.video.className = "simli-video";
        this.video.autoplay = true;
        this.video.playsInline = true;

        this.audio = document.createElement("audio");
        this.audio.autoplay = true;

        // Create status container for overlay mode
        if (this.getAttribute("overlay") === "true") {
          this.statusContainer = document.createElement("div");
          this.statusContainer.className = "status-container";
        }

        // Only create control button if not in overlay mode
        if (this.getAttribute("overlay") !== "true") {
          this.controlButton = document.createElement("button");
          this.controlButton.className = "control-button";
          this.controlButton.textContent =
            this.getAttribute("customtext") || "Start";
        }

        // Create close button for overlay mode
        if (this.getAttribute("overlay") === "true") {
          this.closeButton = document.createElement("button");
          this.closeButton.className = "close-button";
          this.closeButton.style.display = "none"; // Hide by default
          this.closeButton.addEventListener("click", () => {
            this.stopSession();
          });
        }

        this.shadowRoot.appendChild(widgetContainer);
        widgetContainer.appendChild(videoWrapper);
        videoWrapper.appendChild(dottedFaceGift);
        videoWrapper.appendChild(this.video);
        videoWrapper.appendChild(this.audio);
        
        // Only append controls wrapper if not in overlay mode
        if (this.getAttribute("overlay") !== "true") {
          widgetContainer.appendChild(controlsWrapper);
          controlsWrapper.appendChild(this.controlButton);
        } else {
          // Append controls wrapper with close button for overlay mode
          widgetContainer.appendChild(controlsWrapper);
          controlsWrapper.appendChild(this.closeButton);
          // Append status container
          widgetContainer.appendChild(this.statusContainer);
        }
      }

      showStatus(message, isError = false) {
        if (this.statusContainer) {
          this.statusContainer.textContent = message;
          this.statusContainer.style.display = "block";
          if (isError) {
            this.statusContainer.classList.add("error");
          } else {
            this.statusContainer.classList.remove("error");
          }
        }
      }

      hideStatus() {
        if (this.statusContainer) {
          this.statusContainer.style.display = "none";
          this.statusContainer.classList.remove("error");
        }
      }

      handleConnection() {
        if (this.controlButton) {
          this.controlButton.textContent = "Close";
          this.controlButton.classList.add("active");
        }
        const container = this.shadowRoot.querySelector(".widget-container");
        container.classList.add("expanded");
        if (this.getAttribute("overlay") === "true") {
          document.body.style.overflow = "hidden";
          // Update container styles for overlay mode
          const videoWrapper = container.querySelector(".video-wrapper");
          if (videoWrapper) {
            videoWrapper.style.width = "min(80vw, 500px)";
            videoWrapper.style.maxWidth = "min(500px, calc(100vw - 40px))";
            videoWrapper.style.aspectRatio = "1/1";
          }
          // Show close button
          if (this.closeButton) {
            this.closeButton.style.display = "flex";
          }
          // Show connecting status
          this.showStatus("Connecting...");
        }
        this.isRunning = true;
      }

      handleDisconnection() {
        if (this.controlButton) {
          this.controlButton.textContent =
            this.getAttribute("customtext") || "Start";
          this.controlButton.classList.remove("active");
        }
        this.isRunning = false;
        const container = this.shadowRoot.querySelector(".widget-container");
        container.classList.remove("expanded");
        if (this.getAttribute("overlay") === "true") {
          document.body.style.overflow = "";
          // Reset container styles for overlay mode
          const videoWrapper = container.querySelector(".video-wrapper");
          if (videoWrapper) {
            videoWrapper.style.width = "";
            videoWrapper.style.maxWidth = "";
            videoWrapper.style.aspectRatio = "";
          }
          // Hide close button
          if (this.closeButton) {
            this.closeButton.style.display = "none";
          }
          // Hide status
          this.hideStatus();
        }
        // clear video and audio srcObject
        if (this.video) {
          this.video.srcObject = null;
        }
        if (this.audio) {
          this.audio.srcObject = null;
        }
      }

      startAgentSession(callback) {
        const token = this.getAttribute("token");
        const agentId = this.getAttribute("agentid");
        const isOverlay = this.getAttribute("overlay") === "true";

        const xhr = new XMLHttpRequest();
        xhr.open("GET", `https://api.simli.ai/session/${agentId}/${token}`, true);
        
        // Add necessary headers
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Accept", "application/json");

        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              const data = JSON.parse(xhr.responseText);
              callback(null, data.roomUrl);
            } else {
              // More detailed error handling
              let errorMessage = "Error ";
              if (xhr.status === 403) {
                errorMessage += "- Session not allowed";
              } else if (xhr.status === 401) {
                errorMessage += "- Unauthorized";
              } else {
                errorMessage += xhr.status;
              }
              
              if (isOverlay) {
                this.showStatus(errorMessage, true);
                setTimeout(() => {
                  this.handleDisconnection();
                }, 3000);
              } else {
                this.controlButton.textContent = `⚠️ ${errorMessage}`;
                this.controlButton.classList.add("active");
                this.controlButton.disabled = true;
              }
              callback(new Error(`Request failed. Status: ${xhr.status}`));
              
              // Log the error response for debugging
              console.error("API Error:", xhr.responseText);
            }
          }
        }.bind(this);

        xhr.onerror = function() {
          if (isOverlay) {
            this.showStatus("Network Error", true);
            setTimeout(() => {
              this.handleDisconnection();
            }, 3000);
          } else {
            this.controlButton.textContent = "⚠️ Network Error";
            this.controlButton.classList.add("active");
            this.controlButton.disabled = true;
          }
          callback(new Error("Network error occurred"));
        }.bind(this);

        xhr.send();
      }

      async startSession() {
        try {
          // Ensure callManager exists before starting
          if (!this.callManager) {
            this.callManager = new DailyCallManager(this);
          }

          const isOverlay = this.getAttribute("overlay") === "true";

          this.startAgentSession((error, roomUrl) => {
            if (error) {
              console.error("Failed to start session:", error);
              return;
            }
            
            // Double check callManager exists before joining
            if (this.callManager) {
              this.callManager.joinRoom(roomUrl);
              // Only call handleConnection if not in overlay mode (since it's already called for overlay)
              if (!isOverlay) {
                this.handleConnection();
              }
            } else {
              console.error("CallManager not initialized");
              this.handleDisconnection();
            }
          });
        } catch (error) {
          console.error("Failed to start:", error);
          this.handleDisconnection();
        }
      }

      stopSession() {
        if (this.callManager) {
          this.callManager.leave();
        }
        this.handleDisconnection();
      }

      attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
          if (name === "position") {
            // First check if style element exists before removing it
            const existingStyle = this.shadowRoot.querySelector("style");
            if (existingStyle) {
              existingStyle.remove();
            }
            this.addStyles();
          }
          if (this.isRunning) {
            this.stopSession();
          }
        }
      }

      disconnectedCallback() {
        this.stopSession();
        document.removeEventListener(
          "visibilitychange",
          this.visibilityChangeHandler
        );
        if (this.callManager) {
          this.callManager.destroy();
          this.callManager = null;
        }
      }

      // Add public method to control the widget
      openWidget() {
        if (!this.isRunning) {
          this.startSession();
        }
      }

      closeWidget() {
        if (this.isRunning) {
          this.stopSession();
        }
      }
    }

    // Register the custom element
    customElements.define("simli-widget", SimliWidget);
  })
  .catch((error) => {
    console.error("Failed to load Daily JS:", error);
  });