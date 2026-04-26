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
// @input SceneObject boxTemplate
// @input SceneObject treeRoot
// @input float horizontalSpacing = 10
// @input float forwardSpacingZ = -10
// @input float heightOffsetY = 0.5
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../Modules/Src/Assets/CondenseCreate");
Object.setPrototypeOf(script, Module.CondenseCreate.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("boxTemplate", []);
    checkUndefined("treeRoot", []);
    checkUndefined("horizontalSpacing", []);
    checkUndefined("forwardSpacingZ", []);
    checkUndefined("heightOffsetY", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
