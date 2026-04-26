// Main Controller
//
// Made with Easy Lens

//@input Component.ScriptComponent draggable_object
//@input Component.ScriptComponent hint_text
//@input Component.ScriptComponent touch_events


try {

// Tunable parameters
var hitRadius = 0.15; // Distance threshold to start dragging in normalized screen units
var clampPadding = 0.0; // Keep object fully within [0,1] (set small padding if needed)
var showHint = true; // Controls whether hint text stays visible
var hintTextContent = "Drag the object"; // Hint message when object is visible
var hintHiddenTextContent = "Object hidden — tap the square to show"; // Message when object is hidden
var hintTextColor = new vec4(1.0, 1.0, 1.0, 1.0); // RGBA in 0-1
var hintBackgroundEnabled = true;
var hintBackgroundColor = new vec4(0.0, 0.0, 0.0, 0.35);

// Internal state
var isDragging = false;
var activeTouchId = -1;

// Helper: clamp a vec2 within [min, max]
function clampVec2(v, minV, maxV) {
    return new vec2(
        MathUtils.clamp(v.x, minV.x, maxV.x),
        MathUtils.clamp(v.y, minV.y, maxV.y)
    );
}

// Helper: update hint text based on draggable visibility
function refreshHint() {
    if (!script.hint_text) { return; }
    script.hint_text.text = script.draggable_object.enabled ? hintTextContent : hintHiddenTextContent;
}

// Initialize hint text and safe region on start
var onStart = script.createEvent("OnStartEvent");
onStart.bind(function() {
    // Keep hint visible and constrained to safe region since text content is static UI
    script.hint_text.enabled = showHint;
    script.hint_text.text = hintTextContent;
    script.hint_text.color = hintTextColor;
    script.hint_text.backgroundEnabled = hintBackgroundEnabled;
    script.hint_text.backgroundColor = hintBackgroundColor;
    script.hint_text.forceSafeRegion(true);

    // Ensure the UI button accepts interaction
    script.SquareButtonBox.interactionEnabled = true;

    // Set initial hint state based on current object visibility
    refreshHint();

    // Improve gesture reliability for dragging
    script.touch_events.blockDefaultTouches = true;
    script.touch_events.allowDoubleTap = false;
});

// UI Button interactions
// Use press events to ensure compatibility if onTap is unavailable
script.SquareButtonBox.onPressEnd.add(function() {
    // Toggle draggable visibility
    script.draggable_object.enabled = !script.draggable_object.enabled;
    // Update hint to reflect current state
    refreshHint();
});

// Determine if touch is within the draggable's hit radius
function isTouchOnObject(touchPos) {
    var objPos = script.draggable_object.position;
    var dist = objPos.distance(touchPos);
    return dist <= hitRadius;
}

// Convert incoming touch coordinates to normalized vec2 (already in 0..1 per API)
function toVec2(x, y) {
    return new vec2(x, y);
}

// Touch handlers
script.touch_events.onTouchDown.add(function(touchId, touchX, touchY) {
    // Only begin drag if nothing is being dragged
    if (isDragging) {
        return;
    }
    var touchPos = toVec2(touchX, touchY);
    if (isTouchOnObject(touchPos)) {
        isDragging = true;
        activeTouchId = touchId;
    }
});

script.touch_events.onTouchMove.add(function(touchId, touchX, touchY) {
    if (!isDragging || touchId !== activeTouchId) {
        return;
    }
    var target = toVec2(touchX, touchY);

    // Clamp to screen bounds with optional padding
    var minV = new vec2(0.0 + clampPadding, 0.0 + clampPadding);
    var maxV = new vec2(1.0 - clampPadding, 1.0 - clampPadding);
    target = clampVec2(target, minV, maxV);

    script.draggable_object.position = target;
});

script.touch_events.onTouchUp.add(function(touchId, touchX, touchY) {
    if (isDragging && touchId === activeTouchId) {
        isDragging = false;
        activeTouchId = -1;
    }
});

} catch(e) {
  print("error in controller");
  print(e);
}
