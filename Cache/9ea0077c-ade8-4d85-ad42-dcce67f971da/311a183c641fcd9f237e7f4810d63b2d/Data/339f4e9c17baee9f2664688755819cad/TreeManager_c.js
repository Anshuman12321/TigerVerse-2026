if (script.onAwake) {
    script.onAwake();
    return;
}
function checkUndefined(property, showIfData) {
    for (var i = 0; i < showIfData.length; i++) {
        if (showIfData[i][0] && script[showIfData[i][0]] != showIfData[i][1]) {
            return;
        }
    }
    if (script[property] == undefined) {
        throw new Error("Input " + property + " was not provided for the object " + script.getSceneObject().name);
    }
}
// @input SceneObject rootBox
// @input Asset.ObjectPrefab boxTemplate
// @input SceneObject treeRoot
// @input float horizontalSpacing = 18
// @input float forwardSpacingZ = -35
// @input float heightOffsetY = 8
// @input float branchSpacingX = 34
// @input bool showRootChildrenOnStart
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../Modules/Src/Assets/TreeManager");
Object.setPrototypeOf(script, Module.TreeManager.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("rootBox", []);
    checkUndefined("boxTemplate", []);
    checkUndefined("treeRoot", []);
    checkUndefined("horizontalSpacing", []);
    checkUndefined("forwardSpacingZ", []);
    checkUndefined("heightOffsetY", []);
    checkUndefined("branchSpacingX", []);
    checkUndefined("showRootChildrenOnStart", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
