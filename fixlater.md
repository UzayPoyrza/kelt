# Fix Later

## Studio session loading flash
When clicking into a studio session, there's a brief flash/flicker before the session view fully renders. The loading overlay and fade-in approach didn't fully resolve it. Needs investigation into the render timing between the sessions list unmounting and StudioSession mounting — may need to keep both mounted and toggle visibility, or use a transition group.
