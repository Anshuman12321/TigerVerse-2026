// Main Controller
//
// Made with Easy Lens

//@input Component.ScriptComponent touch_events


try {

// Tunable parameters
var tapMaxMoveThreshold = 0.03; // Maximum movement (in normalized screen units) allowed between down and up to still count as a tap

// 3D SquareButtonBox interaction via screen-space hit test
// Requirements: assign your 3D object to Script Input: SceneObject named 'squareButtonBox3D'
// and ensure it has a Collider or MeshVisual with collision enabled for hit testing or exposes getScreenTransform for bounds.
var squareButtonBox3D = script.squareButtonBox3D; // SceneObject (Script Input)
var activePressTouchId = -1;
var pressBeganOnButton = false;
var pressStartPos = new vec2(0, 0);

function hitTestSquare(x, y) {
    // Screen-space bounds test fallback. Replace with your project's raycast if available.
    if (!squareButtonBox3D || !squareButtonBox3D.getScreenTransform) { return false; }
    var st = squareButtonBox3D.getScreenTransform();
    if (!st) { return false; }
    var min = st.topLeft;
    var max = st.bottomRight;
    if (!min || !max) { return false; }
    return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
}

// Touch: begin possible press on the 3D object
script.touch_events.onTouchDown.add(function(touchId, touchX, touchY) {
    if (activePressTouchId !== -1) { return; }
    if (hitTestSquare(touchX, touchY)) {
        activePressTouchId = touchId;
        pressBeganOnButton = true;
        pressStartPos = new vec2(touchX, touchY);
    }
});

// Touch: confirm tap on release if still over object and movement small
script.touch_events.onTouchUp.add(function(touchId, touchX, touchY) {
    if (pressBeganOnButton && touchId === activePressTouchId) {
        var isOverButton = hitTestSquare(touchX, touchY);
        var movedTooFar = new vec2(touchX, touchY).distance(pressStartPos) > tapMaxMoveThreshold;
        if (isOverButton && !movedTooFar) {
            // Action: keep 3D-only behavior, print to console
            print("SquareButtonBox tapped");
        }
        pressBeganOnButton = false;
        activePressTouchId = -1;
    }
});

// Keep default Snapchat gestures enabled since we no longer drag or block UI.
// If your project needs to suppress camera gestures, flip these flags explicitly elsewhere.

} catch(e) {
  print("error in controller");
  print(e);
}
