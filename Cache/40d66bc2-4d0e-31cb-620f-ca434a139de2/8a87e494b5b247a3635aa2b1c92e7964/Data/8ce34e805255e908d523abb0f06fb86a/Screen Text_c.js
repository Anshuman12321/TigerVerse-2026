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
// @input string blockId
// @input string text {"widget":"text_area"}
// @input bool editable
// @ui {"widget":"separator"}
// @input int font {"widget":"combobox", "values":[{"label":"Regular", "value":0}, {"label":"Casual", "value":1}, {"label":"Headline", "value":2}, {"label":"Comic", "value":3}, {"label":"Bold", "value":4}, {"label":"Playful", "value":5}, {"label":"Retro", "value":6}, {"label":"Handwritten", "value":7}, {"label":"Grand, Elegant", "value":8}, {"label":"Art Deco", "value":9}, {"label":"Quirky", "value":10}]}
// @input int alignment {"widget":"combobox", "values":[{"label":"Left", "value":0}, {"label":"Center", "value":1}, {"label":"Right", "value":2}]}
// @ui {"widget":"separator"}
// @input vec2 position = {0.5,0.5}
// @input float size
// @input float rotation {"widget":"slider", "min":0, "max":360}
// @ui {"widget":"separator"}
// @input vec4 color = {1,1,1,1} {"widget":"color"}
// @input bool outlineEnabled
// @input vec4 outlineColor = {0,0,0,1} {"widget":"color", "showIf":"outlineEnabled"}
// @input float outlineThickness {"widget":"slider", "min":0, "max":0.9, "showIf":"outlineEnabled"}
// @input bool backgroundEnabled
// @input vec4 backgroundColor = {1,1,1,1} {"widget":"color", "showIf":"backgroundEnabled"}
// @input float backgroundScale = 1 {"widget":"slider", "min":0, "max":1, "showIf":"backgroundEnabled"}
// @input float backgroundRoundness {"widget":"slider", "min":0, "max":1, "showIf":"backgroundEnabled"}
// @input bool shadowEnabled = true
// @input vec4 shadowColor = {0,0,0,1} {"widget":"color", "showIf":"shadowEnabled"}
// @input float shadowOffsetX {"widget":"slider", "min":-1, "max":1, "showIf":"shadowEnabled"}
// @input float shadowOffsetY {"widget":"slider", "min":-1, "max":1, "showIf":"shadowEnabled"}
// @input bool textWrap
// @input Asset.Font[] fonts = {}
// @input Asset.Texture[] fontIcons = {}
// @input Asset.Texture fontCategoryIcon
// @input Asset.Texture alignmentCategoryIcon
// @input Asset.Texture colorCategoryIcon
// @input Asset.Texture outlineThicknessCategoryIcon
// @input Asset.Texture outlineColorCategoryIcon
// @input Asset.Texture shadowColorCategoryIcon
// @input Asset.Texture shadowOffsetCategoryIcon
// @input Asset.Texture backgroundColorCategoryIcon
// @input Asset.Texture backgroundScaleCategoryIcon
// @input Asset.Texture editableCategoryIcon
// @input Asset.Texture[] alignmentIcons = {}
if (!global.BaseScriptComponent) {
    function BaseScriptComponent() {}
    global.BaseScriptComponent = BaseScriptComponent;
    global.BaseScriptComponent.prototype = Object.getPrototypeOf(script);
    global.BaseScriptComponent.prototype.__initialize = function () {};
    global.BaseScriptComponent.getTypeName = function () {
        throw new Error("Cannot get type name from the class, not decorated with @component");
    };
}
var Module = require("../../../../../../Modules/Src/Assets/Easy Lens/Lens Components/Screen Text_5.12.lsc/Screen Text");
Object.setPrototypeOf(script, Module.ScreenText.prototype);
script.__initialize();
let awakeEvent = script.createEvent("OnAwakeEvent");
awakeEvent.bind(() => {
    checkUndefined("blockId", []);
    checkUndefined("text", []);
    checkUndefined("editable", []);
    checkUndefined("font", []);
    checkUndefined("alignment", []);
    checkUndefined("position", []);
    checkUndefined("size", []);
    checkUndefined("rotation", []);
    checkUndefined("color", []);
    checkUndefined("outlineEnabled", []);
    checkUndefined("outlineColor", [["outlineEnabled",true]]);
    checkUndefined("outlineThickness", [["outlineEnabled",true]]);
    checkUndefined("backgroundEnabled", []);
    checkUndefined("backgroundColor", [["backgroundEnabled",true]]);
    checkUndefined("backgroundScale", [["backgroundEnabled",true]]);
    checkUndefined("backgroundRoundness", [["backgroundEnabled",true]]);
    checkUndefined("shadowEnabled", []);
    checkUndefined("shadowColor", [["shadowEnabled",true]]);
    checkUndefined("shadowOffsetX", [["shadowEnabled",true]]);
    checkUndefined("shadowOffsetY", [["shadowEnabled",true]]);
    checkUndefined("textWrap", []);
    checkUndefined("fonts", []);
    checkUndefined("fontIcons", []);
    checkUndefined("fontCategoryIcon", []);
    checkUndefined("alignmentCategoryIcon", []);
    checkUndefined("colorCategoryIcon", []);
    checkUndefined("outlineThicknessCategoryIcon", []);
    checkUndefined("outlineColorCategoryIcon", []);
    checkUndefined("shadowColorCategoryIcon", []);
    checkUndefined("shadowOffsetCategoryIcon", []);
    checkUndefined("backgroundColorCategoryIcon", []);
    checkUndefined("backgroundScaleCategoryIcon", []);
    checkUndefined("editableCategoryIcon", []);
    checkUndefined("alignmentIcons", []);
    if (script.onAwake) {
       script.onAwake();
    }
});
