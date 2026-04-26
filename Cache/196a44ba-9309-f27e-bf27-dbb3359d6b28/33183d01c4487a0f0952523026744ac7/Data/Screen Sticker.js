
//@input Asset.Texture texture;
//@input Asset.Material mat;
//@input vec2 position = {0.5, 0.6};
//@input vec2 scale = {0.3, 0.3};
//@input float rotation = 0;
//@input bool forceSafeArea = true;
//@input int renderOrder = 1;
//@input string blockId;

const DEG_TO_RAD = 0.01745329;
const RAD_TO_DEG = 57.29577951;
const BLOCK_AREA_RECT = [
    new vec2(1, 0.25),   // top-right
    new vec2(0, 0.25),   // top-left
    new vec2(0, 0.48),   // bottom-left
    new vec2(1, 0.48)    // bottom-right
];
const RETRY_FRAME_COUNT = 10;

let stComp;
let imgComp;
let imgSO;
let scriptSO = script.getSceneObject();
let inputCache = {
    texture: script.texture,
    position: script.position,
    scale: script.scale,
    rotation: script.rotation
};
let ratio = 1.0;
let nDebugRects = 0;
let camAspectRatio;
let textureAspectRatio;
let totalAspectRatio;
let pendingSafeArea = false;

function init(){
    if(!validateInputs()){
        return;
    }

    const cam = getParentCamera(scriptSO);
    
    if (global.deviceInfoSystem.isEditor()) {
        camAspectRatio = cam.aspect;
    } else {
        camAspectRatio = cam.renderTarget.getWidth() / cam.renderTarget.getHeight();
    }
    
    // Create the sticker scene object
    imgSO = script.getSceneObject();
    imgComp = imgSO.createComponent('Component.Image');
    imgComp.mainMaterial = script.mat.clone();
    imgComp.stretchMode = StretchMode.Stretch;

    stComp = imgSO.getComponent('Component.ScreenTransform');
    inputsToComp(inputCache);
    fixLayer(imgSO);

    bindInput('texture');
    bindInput('position');
    bindInput('scale');
    bindInput('rotation');

    if (script.forceSafeArea) {
        if (inputCache.texture) {
            forceSafeArea();
        } else {
            pendingSafeArea = true;
        }
    }
    
    script.createEvent("OnStartEvent").bind(() => {
        const cachedTexture = script.texture;
        if (global.EasyLens && global.EasyLens.VisualEdit) {

            const uiSettings = global.EasyLens.VisualEdit.createUISettingsObject()
            .addCategory()
            .addGizmo2D({
                imageSceneObject: imgSO, 
                inputNames: {
                    positionInputNames: ["position"],
                    scaleInputNames: ["scale"],
                    rotationInputNames: ["rotation"]
                }, 
                autoUpdateInputs: false,
                onValueChanged: () => {
                    const {position, scale, rotation} = stToInputs(stComp);
                    global.EasyLens.VisualEdit.updateInputValue(script, "position", position);
                    global.EasyLens.VisualEdit.updateInputValue(script, "scale", scale);
                    global.EasyLens.VisualEdit.updateInputValue(script, "rotation", rotation);
                    global.EasyLens.VisualEdit.updateInputValue(script, "forceSafeArea", false);
                    script.position = position;
                    script.scale = scale;
                    script.rotation = rotation;
                    script.forceSafeArea = false;
                }
            })
            .addMediaPicker({
                inputNames: ["texture"],
                isImagePickingEnabled: true,
                // Temporary disabled video picking until the issue is resolved
                // isVideoPickingEnabled: true, 
                isVideoPickingEnabled: false,
                isRemoveOptionEnabled: true,
                onRemoveAction: () => {
                    script.texture = cachedTexture;
                },
                onFilePicked: (texture) => {
                    script.texture = texture;
                }
            })
            .build()
            global.EasyLens.VisualEdit.createUI(script, "StickerUI", uiSettings); 
        }
    });
    
    script.createEvent("OnDisableEvent").bind(function() {
        if (imgComp) {
            imgComp.enabled = false;
        }
    });
    script.createEvent("OnEnableEvent").bind(function() {
        if (imgComp) {
            imgComp.enabled = true;
        }
    });
}

function inputsToComp(inputs) {
    if (!stComp || !imgComp) {
        return;
    }

    stComp.anchors.setCenter(pos2cam(inputs.position));
    stComp.rotation = quat.fromEulerAngles(0, 0, inputs.rotation*DEG_TO_RAD);
    setTexture(inputs.texture);
}

function stToInputs(st) {
    const anchorSize = st.anchors.getSize();
    
    // Extract scale by dividing anchor size by the base aspect ratio size
    let scaleX, scaleY;
    if (totalAspectRatio > 1) {
        scaleX = anchorSize.x / 2;
        scaleY = anchorSize.y / (2/totalAspectRatio);
    } else {
        scaleX = anchorSize.x / (2*totalAspectRatio);
        scaleY = anchorSize.y / 2;
    }
    
    return {
        position: cam2pos(st.anchors.getCenter()),
        scale: new vec2(scaleX, scaleY),
        rotation: radToDeg(st.rotation.toEulerAngles().z)
    }
}

// Helpers
function validateInputs(){
    if(!getParentCamera(scriptSO)){
        print("Screen Sticker error: please place under orthographic camera!");
        return false;
    }

    if (!script.getSceneObject().getComponent("ScreenTransform")) {
        print("Screen Sticker error: please add a ScreenTransform component");
        return false;
    }

    return true;
}

function getParentCamera(obj) {
    if (!obj) {
        return null;
    }

    var cam = obj.getComponent("Component.Camera");
    if (cam) {
        return cam;
    }

    return getParentCamera(obj.getParent());
}

function fixLayer(obj){
    obj.renderOrder = script.renderOrder;
    obj.layer = scriptSO.layer;
}

function bindInput(inputName) {
    Object.defineProperty(script, inputName, {
        set: (val) => {
            inputCache[inputName] = val;
            inputsToComp(inputCache);
        },
        get: () => {
            return inputCache[inputName];
        }
    });
}

function setTexture(tex) {
    if (!imgComp) {
        return;
    }

    if (!tex) {
        imgComp.enabled = false;
        return;
    }

    imgComp.enabled = true;
    imgComp.mainMaterial.mainPass.baseTex = tex;
    
    if (tex.control.getLoadStatus() != LoadStatus.Loaded) {
        awaitVideoTextureLoad(tex, RETRY_FRAME_COUNT, () => {
            setTransformAnchors(tex);
        });
    } else {
        setTransformAnchors(tex);
    }
}

function getTexture() {
    if (!imgComp) {
        return null;
    }

    return imgComp.mainMaterial.mainPass.baseTex;
}

function awaitVideoTextureLoad(tex, maxFrames, callback) {
    let frameCount = 0;
    let updateEvent;
    
    function checkTexture() {
        frameCount++;
        if (tex.control.getLoadStatus() == LoadStatus.Loaded || frameCount >= maxFrames) {
            // Texture is loaded or max frames reached, cleanup and callback
            if (updateEvent) {
                script.removeEvent(updateEvent);
                updateEvent = null;
            }
            callback();
            return;
        }
    }
    
    updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(checkTexture);
}

function setTransformAnchors(tex) {
    textureAspectRatio = tex.getWidth() / tex.getHeight();
    totalAspectRatio = textureAspectRatio/camAspectRatio;

    const scaleX = inputCache.scale.x;
    const scaleY = inputCache.scale.y;
    
    if (totalAspectRatio>1) {
        stComp.anchors.setSize(new vec2(2 * scaleX, 2/totalAspectRatio * scaleY));
    } else {
        stComp.anchors.setSize(new vec2(2*totalAspectRatio * scaleX, 2 * scaleY));
    }

    stComp.anchors.setCenter(pos2cam(inputCache.position));
    stComp.rotation = quat.fromEulerAngles(0, 0, inputCache.rotation * DEG_TO_RAD);

    if (pendingSafeArea) {
        pendingSafeArea = false;
        forceSafeArea();
    }
}


init();


function pos2cam(screenPos) {
    return new vec2(2 * screenPos.x - 1, 1 - 2 * screenPos.y);
}

function cam2pos(camPos) {
    return new vec2(0.5 * (camPos.x + 1), 1 - 0.5 * (camPos.y + 1));
}

function radToDeg(radians) {
    let deg = radians*RAD_TO_DEG;
    deg = ((deg % 360) + 360) % 360;
    return deg;
}

function forceSafeArea() {
    const tlPos = stComp.localPointToScreenPoint(new vec2(-1, 1));
    const trPos = stComp.localPointToScreenPoint(new vec2(1, 1));
    const blPos = stComp.localPointToScreenPoint(new vec2(-1, -1));
    const brPos = stComp.localPointToScreenPoint(new vec2(1, -1));

    // Calculate the Y offset needed
    const offset = calculateYOffset(
        [trPos, tlPos, blPos, brPos],
        BLOCK_AREA_RECT
    );

    if (offset !== 0) {
        const currentPos = script.position;
        script.position = new vec2(currentPos.x, currentPos.y + offset);
    }
}

/**
 * Calculates the Y offset needed to move rect1 out of intersection with rect2
 * @param {Array<vec2>} rect1Points - Array of 4 points defining the first rectangle
 * @param {Array<vec2>} rect2Points - Array of 4 points defining the second rectangle
 * @returns {number} - Y offset to apply to rect1 to avoid intersection (positive = move up, negative = move down)
 */
function calculateYOffset(rect1Points, rect2Points) {
    // Check if rectangles intersect using SAT
    if (!doRectanglesIntersect(rect1Points, rect2Points)) {
        return 0; // No offset needed if no intersection
    }
    
    // Find min/max Y values for each rectangle
    let rect1MinY = rect1Points[0].y;
    let rect1MaxY = rect1Points[0].y;
    let rect2MinY = rect2Points[0].y;
    let rect2MaxY = rect2Points[0].y;
    
    // Calculate average Y for each rectangle (center Y)
    let rect1SumY = rect1Points[0].y;
    let rect2SumY = rect2Points[0].y;
    
    for (let i = 1; i < rect1Points.length; i++) {
        rect1MinY = Math.min(rect1MinY, rect1Points[i].y);
        rect1MaxY = Math.max(rect1MaxY, rect1Points[i].y);
        rect1SumY += rect1Points[i].y;
    }
    
    for (let i = 1; i < rect2Points.length; i++) {
        rect2MinY = Math.min(rect2MinY, rect2Points[i].y);
        rect2MaxY = Math.max(rect2MaxY, rect2Points[i].y);
        rect2SumY += rect2Points[i].y;
    }
    
    const rect1CenterY = rect1SumY / rect1Points.length;
    const rect2CenterY = rect2SumY / rect2Points.length;
    
    // Determine whether to push up or down based on relative positions
    if (rect1CenterY > rect2CenterY) {
        // Push rect1 up
        return rect2MaxY - rect1MinY;
    } else {
        // Push rect1 down
        return rect2MinY - rect1MaxY;
    }
}

/**
 * Check if two convex polygons (represented as arrays of points) intersect
 * Using Separating Axis Theorem (SAT)
 * @param {Array<vec2>} poly1 - First polygon vertices
 * @param {Array<vec2>} poly2 - Second polygon vertices
 * @returns {boolean} - True if polygons intersect
 */
function doRectanglesIntersect(poly1, poly2) {
    // Check if poly1's edges separate the polygons
    for (let i = 0; i < poly1.length; i++) {
        const j = (i + 1) % poly1.length;
        const edge = new vec2(poly1[j].y - poly1[i].y, poly1[i].x - poly1[j].x); // Perpendicular to edge
        
        if (polygonsSeparated(poly1, poly2, edge)) {
            return false;
        }
    }
    
    // Check if poly2's edges separate the polygons
    for (let i = 0; i < poly2.length; i++) {
        const j = (i + 1) % poly2.length;
        const edge = new vec2(poly2[j].y - poly2[i].y, poly2[i].x - poly2[j].x); // Perpendicular to edge
        
        if (polygonsSeparated(poly1, poly2, edge)) {
            return false;
        }
    }
    
    return true; // No separating axis found, rectangles must intersect
}

/**
 * Check if polygons are separated along a given axis
 * @param {Array<vec2>} poly1 - First polygon vertices
 * @param {Array<vec2>} poly2 - Second polygon vertices
 * @param {vec2} axis - Axis to project onto
 * @returns {boolean} - True if polygons are separated along this axis
 */
function polygonsSeparated(poly1, poly2, axis) {
    const proj1 = projectPolygon(poly1, axis);
    const proj2 = projectPolygon(poly2, axis);
    
    return proj1.max < proj2.min || proj2.max < proj1.min;
}

/**
 * Project a polygon onto an axis
 * @param {Array<vec2>} poly - Polygon vertices
 * @param {vec2} axis - Axis to project onto
 * @returns {Object} - Min and max projection values
 */
function projectPolygon(poly, axis) {
    const axisLength = Math.sqrt(axis.x * axis.x + axis.y * axis.y);
    const normalizedAxis = new vec2(axis.x / axisLength, axis.y / axisLength);
    
    let min = Infinity;
    let max = -Infinity;
    
    for (let i = 0; i < poly.length; i++) {
        const dot = poly[i].x * normalizedAxis.x + poly[i].y * normalizedAxis.y;
        min = Math.min(min, dot);
        max = Math.max(max, dot);
    }
    
    return { min, max };
}