// DragSquare.js
// Attach this script to the square SceneObject you want to move.
// @input Component.Camera worldCamera {"hint":"Camera used for screen/world conversion"}
// @input float clickRadius = 0.12 {"hint":"How close touch must be to object center (screen units 0-1)"}

var transform = script.getSceneObject().getTransform();

var isDragging = false;
var dragDepth = 60.0;
var worldOffset = vec3.zero();

function getTouchPosition(ev) {
    if (!ev || !ev.getTouchPosition) {
        return null;
    }
    return ev.getTouchPosition();
}

function isTouchNearObject(screenPos) {
    var worldPos = transform.getWorldPosition();
    var objectScreenPos = script.worldCamera.worldSpaceToScreenSpace(worldPos);
    var delta = screenPos.sub(objectScreenPos);
    return delta.length <= script.clickRadius;
}

function getDepthFromCamera(worldPos) {
    var cameraPos = script.worldCamera.getTransform().getWorldPosition();
    return worldPos.sub(cameraPos).length;
}

function onTouchStart(ev) {
    if (!script.worldCamera) {
        return;
    }

    var touchPos = getTouchPosition(ev);
    if (!touchPos || !isTouchNearObject(touchPos)) {
        return;
    }

    var currentPos = transform.getWorldPosition();
    dragDepth = getDepthFromCamera(currentPos);
    var touchWorldPos = script.worldCamera.screenSpaceToWorldSpace(touchPos, dragDepth);

    worldOffset = currentPos.sub(touchWorldPos);
    isDragging = true;
}

function onTouchMove(ev) {
    if (!isDragging || !script.worldCamera) {
        return;
    }

    var touchPos = getTouchPosition(ev);
    if (!touchPos) {
        return;
    }

    var touchWorldPos = script.worldCamera.screenSpaceToWorldSpace(touchPos, dragDepth);
    transform.setWorldPosition(touchWorldPos.add(worldOffset));
}

function onTouchEnd() {
    isDragging = false;
}

script.createEvent("TouchStartEvent").bind(onTouchStart);
script.createEvent("TouchMoveEvent").bind(onTouchMove);
script.createEvent("TouchEndEvent").bind(onTouchEnd);
