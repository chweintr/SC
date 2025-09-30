# Future Enhancements

## Visual Feedback for Connection States

### Red Button State Indicators
Currently the red button on the overlay remains static. For better UX, implement visual state changes:

- **Initial State (Idle):** Red button - indicates ready to call
- **Connecting State:** Yellow button - indicates connection in progress  
- **Connected State:** Green button - indicates active call with Squatch
- **Disconnecting:** Brief yellow flash back to red

### Implementation Notes
This would require:
1. A dynamic overlay image or CSS-based button color change
2. Listening to Simli connection state events
3. Smooth transitions between states
4. Ensure button remains clickable and aligned during state changes

### Alternative: Glow Effect
If changing button color is complex with the overlay image, could add:
- Pulsing glow around button during connecting (yellow/amber)
- Steady glow when connected (green)

## Responsive Scaling ⚠️ HIGH PRIORITY

### Problem
Currently the overlay and widget don't scale proportionally when window is resized:
- Overlay uses `objectFit: "cover"` (scales to fill viewport)
- Widget uses `vw` units (scales based on width only)
- Different scaling rates cause misalignment and gaps

### Solution Approaches

**Option 1: CSS Container Queries (Modern)**
```css
/* Wrapper that maintains aspect ratio */
.scale-container {
  aspect-ratio: 1408 / 736; /* Overlay dimensions */
  container-type: size;
}

/* Widget sizes relative to container */
.widget {
  width: 42cqw; /* Container query units */
  height: 16.5cqh;
}
```

**Option 2: JavaScript Scaling**
- Calculate scale factor based on viewport vs overlay aspect ratio
- Apply CSS transform: `scale(factor)` to unified container
- Ensures overlay and widget scale together

**Option 3: SVG Overlay (Most Flexible)**
- Convert PNG overlay to SVG with viewport units
- Widget can use same coordinate system
- Perfect scaling guaranteed

### Current Workaround
App works well at normal sizes on iPhone and MacBook. Don't scale the window.

## Personality & Intelligence Settings

### Squatch Intelligence Slider
Allow users to adjust Squatch's personality and knowledge level:

**UI**: Slider control (before starting call or in settings)
- **Position 1 - "Wild & Primitive"**: Basic responses, grunts, simple language
- **Position 2 - "Forest Dweller"**: Moderate knowledge, cryptid folklore
- **Position 3 - "Sage Sasquatch"**: Intelligent, philosophical, deep knowledge
- **Position 4 - "Cryptid Scholar"**: Expert on all cryptids, paranormal phenomena

**Implementation**:
- Different knowledge base files in `kb/` directory:
  - `kb/persona-wild.md` - Primitive Bigfoot
  - `kb/persona-moderate.md` - Current personality
  - `kb/persona-sage.md` - Wise elder
  - `kb/persona-scholar.md` - Expert researcher
- Agent reads appropriate KB based on slider value
- Could also adjust LLM temperature/model for each level

### Voice/Accent Variations
- Different voice settings per intelligence level
- Gruffer voice for "Wild", smoother for "Scholar"

## Product Expansion: CryptidChat

### Multi-Creature Platform
Expand beyond Bigfoot to include other cryptids:

**Creature Options**:
- 🦎 Loch Ness Monster (Nessie)
- 👽 Mothman
- 🐉 Chupacabra
- 🧜‍♀️ Mermaid/Siren
- 🦅 Thunderbird
- 🐺 Wendigo
- 👻 Jersey Devil

**UI Changes**:
- Landing page with creature selection grid
- Each creature has unique:
  - Overlay frame design (underwater for Nessie, cave for Wendigo, etc.)
  - Background video/environment
  - Idle animation
  - Knowledge base & personality
  - Voice characteristics

**Architecture**:
```
/cryptids/
  ├── bigfoot/
  │   ├── overlay.png
  │   ├── idle-video.mp4
  │   ├── background.mp4
  │   └── kb/
  ├── nessie/
  │   ├── overlay.png (underwater scene)
  │   ├── idle-video.mp4 (swimming)
  │   ├── background.mp4 (loch)
  │   └── kb/
  └── mothman/
      └── ...
```

**Monetization Ideas**:
- Free: Bigfoot + 1 other creature
- Premium: All creatures unlocked
- Special events: Limited-time cryptids (Krampus at Christmas)

## Additional Ideas
- Connection sound effects for different states
- Haptic feedback on mobile when button is pressed
- ~~Timeout handling if connection takes too long~~ ✅ IMPLEMENTED (6 seconds)
- Improve Simli stream detection (currently polling every 500ms)
- Add "end call" functionality to stop Simli
- User accounts to save preferences & conversation history
- Share conversation snippets to social media
