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

## Responsive Scaling
Make overlay, widget, and videos scale proportionally across ALL devices and orientations while maintaining alignment.

## Additional Ideas
- Connection sound effects for different states
- Haptic feedback on mobile when button is pressed
- Timeout handling if connection takes too long
