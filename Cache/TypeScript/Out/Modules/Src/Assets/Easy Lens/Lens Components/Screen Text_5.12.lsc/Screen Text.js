"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenText = void 0;
var __selfType = requireType("./Screen Text");
function component(target) {
    target.getTypeName = function () { return __selfType; };
    if (target.prototype.hasOwnProperty("getTypeName"))
        return;
    Object.defineProperty(target.prototype, "getTypeName", {
        value: function () { return __selfType; },
        configurable: true,
        writable: true
    });
}
const DestructionHelper_1 = require("./Resources/DestructionHelper");
const BaseEasyLensBlock_1 = require("./Resources/BaseEasyLensBlock/BaseEasyLensBlock");
const VisualEditAPI_1 = require("./VisualEditManager_5.12.lsc/Src/ExternalDeclarations/VisualEditAPI");
var FontStyle;
(function (FontStyle) {
    FontStyle[FontStyle["Regular"] = 0] = "Regular";
    FontStyle[FontStyle["Casual"] = 1] = "Casual";
    FontStyle[FontStyle["Headline"] = 2] = "Headline";
    FontStyle[FontStyle["Comic"] = 3] = "Comic";
    FontStyle[FontStyle["Bold"] = 4] = "Bold";
    FontStyle[FontStyle["Playful"] = 5] = "Playful";
    FontStyle[FontStyle["Retro"] = 6] = "Retro";
    FontStyle[FontStyle["Handwritten"] = 7] = "Handwritten";
    FontStyle[FontStyle["GrandElegant"] = 8] = "GrandElegant";
    FontStyle[FontStyle["ArtDeco"] = 9] = "ArtDeco";
    FontStyle[FontStyle["Quirky"] = 10] = "Quirky";
})(FontStyle || (FontStyle = {}));
var DynamicTextComponentMenuItems;
(function (DynamicTextComponentMenuItems) {
    DynamicTextComponentMenuItems["Location"] = "location";
    DynamicTextComponentMenuItems["Date"] = "date";
    DynamicTextComponentMenuItems["Time"] = "time";
    DynamicTextComponentMenuItems["Name"] = "name";
})(DynamicTextComponentMenuItems || (DynamicTextComponentMenuItems = {}));
const DynamicTextComponentMenuItemsMap = {
    [DynamicTextComponentMenuItems.Location]: "{location}",
    [DynamicTextComponentMenuItems.Date]: "{date}",
    [DynamicTextComponentMenuItems.Time]: "{time}",
    [DynamicTextComponentMenuItems.Name]: "{name}"
};
const FontStyleSizeMap = {
    [FontStyle.Regular]: 1.0,
    [FontStyle.Casual]: 0.65,
    [FontStyle.Headline]: 0.95,
    [FontStyle.Comic]: 1.0,
    [FontStyle.Bold]: 1.7,
    [FontStyle.Playful]: 1.05,
    [FontStyle.Retro]: 0.75,
    [FontStyle.Handwritten]: 0.9,
    [FontStyle.GrandElegant]: 0.75,
    [FontStyle.ArtDeco]: 1.2,
    [FontStyle.Quirky]: 0.6
};
const INVISIBLE_POINT = new vec2(-10000, -10000);
let ScreenText = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseEasyLensBlock_1.BaseEasyLensBlock;
    var ScreenText = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.blockId = this.blockId;
            this.text = this.text;
            this.editable = this.editable;
            this.font = this.font;
            this.alignment = this.alignment;
            this.position = this.position;
            this.size = this.size;
            this.rotation = this.rotation;
            this.color = this.color;
            this.outlineEnabled = this.outlineEnabled;
            this.outlineColor = this.outlineColor;
            this.outlineThickness = this.outlineThickness;
            this.backgroundEnabled = this.backgroundEnabled;
            this.backgroundColor = this.backgroundColor;
            this.backgroundScale = this.backgroundScale;
            this.backgroundRoundness = this.backgroundRoundness;
            this.shadowEnabled = this.shadowEnabled;
            this.shadowColor = this.shadowColor;
            this.shadowOffsetX = this.shadowOffsetX;
            this.shadowOffsetY = this.shadowOffsetY;
            this.textWrap = this.textWrap;
            this.fonts = this.fonts;
            this.fontIcons = this.fontIcons;
            this.fontCategoryIcon = this.fontCategoryIcon;
            this.alignmentCategoryIcon = this.alignmentCategoryIcon;
            this.colorCategoryIcon = this.colorCategoryIcon;
            this.outlineThicknessCategoryIcon = this.outlineThicknessCategoryIcon;
            this.outlineColorCategoryIcon = this.outlineColorCategoryIcon;
            this.shadowColorCategoryIcon = this.shadowColorCategoryIcon;
            this.shadowOffsetCategoryIcon = this.shadowOffsetCategoryIcon;
            this.backgroundColorCategoryIcon = this.backgroundColorCategoryIcon;
            this.backgroundScaleCategoryIcon = this.backgroundScaleCategoryIcon;
            this.editableCategoryIcon = this.editableCategoryIcon;
            this.alignmentIcons = this.alignmentIcons;
            this.destructionHelper = new DestructionHelper_1.DestructionHelper();
            this.safeRegionEnforced = false;
            this.isVisualEditingEnabled = false;
            // Dynamic text properties
            this.cachedLocation = "";
            this.cachedDate = "";
            this.cachedName = "";
            this.DEFAULT_LOCATION_PLACEHOLDER = "Your Location";
            this.isTextSplit = false;
            // Cache for forceWrapDynamicTextAnchors optimization
            this.prevPosition = null;
            this.prevText = "";
            this.prevRotation = 0;
            this.prevScale = 0;
        }
        __initialize() {
            super.__initialize();
            this.blockId = this.blockId;
            this.text = this.text;
            this.editable = this.editable;
            this.font = this.font;
            this.alignment = this.alignment;
            this.position = this.position;
            this.size = this.size;
            this.rotation = this.rotation;
            this.color = this.color;
            this.outlineEnabled = this.outlineEnabled;
            this.outlineColor = this.outlineColor;
            this.outlineThickness = this.outlineThickness;
            this.backgroundEnabled = this.backgroundEnabled;
            this.backgroundColor = this.backgroundColor;
            this.backgroundScale = this.backgroundScale;
            this.backgroundRoundness = this.backgroundRoundness;
            this.shadowEnabled = this.shadowEnabled;
            this.shadowColor = this.shadowColor;
            this.shadowOffsetX = this.shadowOffsetX;
            this.shadowOffsetY = this.shadowOffsetY;
            this.textWrap = this.textWrap;
            this.fonts = this.fonts;
            this.fontIcons = this.fontIcons;
            this.fontCategoryIcon = this.fontCategoryIcon;
            this.alignmentCategoryIcon = this.alignmentCategoryIcon;
            this.colorCategoryIcon = this.colorCategoryIcon;
            this.outlineThicknessCategoryIcon = this.outlineThicknessCategoryIcon;
            this.outlineColorCategoryIcon = this.outlineColorCategoryIcon;
            this.shadowColorCategoryIcon = this.shadowColorCategoryIcon;
            this.shadowOffsetCategoryIcon = this.shadowOffsetCategoryIcon;
            this.backgroundColorCategoryIcon = this.backgroundColorCategoryIcon;
            this.backgroundScaleCategoryIcon = this.backgroundScaleCategoryIcon;
            this.editableCategoryIcon = this.editableCategoryIcon;
            this.alignmentIcons = this.alignmentIcons;
            this.destructionHelper = new DestructionHelper_1.DestructionHelper();
            this.safeRegionEnforced = false;
            this.isVisualEditingEnabled = false;
            // Dynamic text properties
            this.cachedLocation = "";
            this.cachedDate = "";
            this.cachedName = "";
            this.DEFAULT_LOCATION_PLACEHOLDER = "Your Location";
            this.isTextSplit = false;
            // Cache for forceWrapDynamicTextAnchors optimization
            this.prevPosition = null;
            this.prevText = "";
            this.prevRotation = 0;
            this.prevScale = 0;
        }
        onAwake() {
            super.onAwake();
            this.textComponent = this.destructionHelper.createComponent(this.sceneObject, "Text");
            this.screenTransform = this.destructionHelper.getOrAddComponent(this.sceneObject, "ScreenTransform");
            const extentsTarget = this.destructionHelper.createSceneObject(this.sceneObject, "ExtentsTarget");
            this.extentsTargetScreenTransform = this.destructionHelper.getOrAddComponent(extentsTarget, "ScreenTransform");
            this.textComponent.extentsTarget = this.extentsTargetScreenTransform;
            this.screenTransform.anchors.setSize(new vec2(1.0, 1.0));
            this.registerReactiveProperty([
                "text",
                "position",
                "size",
                "rotation",
                "color",
                "font",
                "outlineEnabled", "outlineColor", "outlineThickness",
                "backgroundEnabled", "backgroundColor", "backgroundScale", "backgroundRoundness",
                "shadowEnabled", "shadowColor", "shadowOffsetX", "shadowOffsetY",
                "alignment", "editable"
            ], false);
            this.setText(this.text);
            this.setSize(this.size);
            this.setColor(new vec4(1, 1, 1, 0.0));
            this.setOutlineColor(new vec4(0, 0, 0, 0.0));
            this.setBackgroundColor(new vec4(0, 0, 0, 0.0));
            this.setOutlineEnabled(true);
            this.setBackgroundEnabled(true);
            this.setAlignment(this.alignment);
            this.syncTextScreenTransform();
            this.createEvent("OnStartEvent").bind(() => {
                if ((0, VisualEditAPI_1.isVisualEditManagerAvailable)()) {
                    this.setupVisualEditing();
                }
            });
            this.createEvent("OnDestroyEvent").bind(() => {
                this.destructionHelper.destroy();
            });
            if (!this.textWrap) {
                this.text = this.splitWord(this.text);
            }
        }
        setText(text) {
            if (this.containsDynamicText(text)) {
                this.parseText(text).then((parsedText) => {
                    this.textComponent.text = parsedText;
                }).catch((error) => {
                    print("Error parsing dynamic text: " + error);
                    this.textComponent.text = text;
                });
            }
            else {
                this.textComponent.text = text;
            }
        }
        setPosition(position) {
            const parentPosition = this.screenTransform.screenPointToParentPoint(position);
            this.screenTransform.anchors.setCenter(parentPosition);
        }
        setSize(size) {
            this.screenTransform.scale = vec3.one().uniformScale(size);
        }
        setRotation(rotation) {
            this.screenTransform.rotation = quat.angleAxis(rotation * MathUtils.DegToRad, vec3.forward());
        }
        setColor(color) {
            this.textComponent.textFill.color = color;
        }
        setBackgroundEnabled(enabled) {
            this.textComponent.backgroundSettings.enabled = enabled;
        }
        setBackgroundColor(color) {
            this.textComponent.backgroundSettings.fill.color = color;
        }
        setBackgroundScale(scale) {
            let marginsScale = scale * 2.0;
            this.textComponent.backgroundSettings.margins = Rect.create(marginsScale, marginsScale, marginsScale, marginsScale);
        }
        setBackgroundRoundness(roundness) {
            this.textComponent.backgroundSettings.cornerRadius = roundness * 2.5;
        }
        setShadowEnabled(enabled) {
            this.textComponent.dropshadowSettings.enabled = enabled;
        }
        setShadowColor(color) {
            this.textComponent.dropshadowSettings.fill.color = color;
        }
        setShadowOffsetX(offsetX) {
            this.textComponent.dropshadowSettings.offset = new vec2(offsetX, this.textComponent.dropshadowSettings.offset.y);
        }
        setShadowOffsetY(offsetY) {
            this.textComponent.dropshadowSettings.offset = new vec2(this.textComponent.dropshadowSettings.offset.x, offsetY);
        }
        setFont(font) {
            if (this.fonts[font]) {
                this.textComponent.font = this.fonts[font];
            }
            else {
                print("Invalid font: " + font);
                this.textComponent.font = this.fonts[0];
            }
        }
        setOutlineEnabled(enabled) {
            this.textComponent.outlineSettings.enabled = enabled;
        }
        setOutlineColor(color) {
            this.textComponent.outlineSettings.fill.color = color;
        }
        setOutlineThickness(thickness) {
            this.textComponent.outlineSettings.size = thickness;
        }
        setAlignment(alignment) {
            if (alignment >= 0 && alignment < 3) {
                this.textComponent.horizontalAlignment = alignment;
            }
            else {
                print("Invalid alignment: " + alignment);
            }
        }
        setEditable(editable) {
            if (global.deviceInfoSystem?.isCameraKit?.()) {
                return;
            }
            this.textComponent.editable = editable;
        }
        forceSafeRegion(enforce) {
            this.safeRegionEnforced = enforce;
            this.textWrap = enforce;
            if (enforce === true) {
                let splitText = this.splitWord(this.text);
                this.text = splitText;
            }
        }
        onEnable() {
            this.textComponent.enabled = true;
        }
        onDisable() {
            this.textComponent.enabled = false;
        }
        setupVisualEditing() {
            const uiSettings = this.setupUISettings();
            const uiDelegate = (0, VisualEditAPI_1.getVisualEditManager)().createUI(this, 'screenTextPanelUI', uiSettings);
            uiDelegate.onSetEnabled.add((enabled) => {
                this.isVisualEditingEnabled = enabled;
                if (enabled) {
                    this.forceSafeRegion(false);
                }
                else if (!enabled) {
                    global.textInputSystem.dismissKeyboard();
                }
                else if (!this.textWrap) {
                    this.textWrap = true;
                    (0, VisualEditAPI_1.getVisualEditManager)().updateInputValue(this, "text", this.text);
                    (0, VisualEditAPI_1.getVisualEditManager)().updateInputValue(this, "textWrap", this.textWrap);
                }
            });
            this.setupTextEditing();
        }
        syncTextScreenTransform() {
            let skippedFrames = 0;
            const framesToSkip = 2;
            this.createEvent("UpdateEvent").bind(() => {
                // Skip frames for extents target to be initialized
                if (skippedFrames < framesToSkip) {
                    skippedFrames++;
                    return;
                }
                const extentsSize = this.extentsTargetScreenTransform.anchors.getSize();
                const currentSize = this.screenTransform.anchors.getSize();
                const actualSize = new vec2(extentsSize.x * currentSize.x / 2.0, extentsSize.y * currentSize.y / 2.0);
                actualSize.x = Math.max(actualSize.x, 0.01);
                actualSize.y = Math.max(actualSize.y, 0.01);
                this.screenTransform.anchors.setSize(actualSize);
                if (this.safeRegionEnforced) {
                    this.forceWrapDynamicTextAnchors(this.screenTransform);
                }
                if (skippedFrames === framesToSkip + 1) {
                    // Call all setters when text screen transform is synced
                    this.callAllSetters();
                    skippedFrames++;
                }
                skippedFrames++;
            });
        }
        setupUISettings() {
            const uiSettings = (0, VisualEditAPI_1.getVisualEditManager)().createUISettingsObject()
                .addCategory()
                .addGizmo2D({
                controllerId: "gizmo",
                imageSceneObject: this.sceneObject,
                inputNames: {
                    positionInputNames: ['position'],
                    scaleInputNames: ['size'],
                    rotationInputNames: ['rotation']
                },
                attachTo2DCamera: true,
                fixAspect: true,
                sizingMode: "scale",
                autoUpdateInputs: false,
                onValueChanged: (transform) => {
                    const screenPosition = this.screenTransform.localPointToScreenPoint(vec2.zero());
                    (0, VisualEditAPI_1.getVisualEditManager)().updateInputValue(this, "position", screenPosition);
                    (0, VisualEditAPI_1.getVisualEditManager)().updateInputValue(this, "size", transform.size.x);
                    const clampedRotation = (transform.rotationDegrees + 360) % 360;
                    (0, VisualEditAPI_1.getVisualEditManager)().updateInputValue(this, "rotation", clampedRotation);
                },
                limitPositioning: "limitEdgesReverse",
                bounds: new vec4(0.05, 0.95, 0.03, 0.97)
            })
                .addCategory({
                displayName: "Color",
                activeOnInit: true,
                icon: this.colorCategoryIcon,
            })
                .addColorPicker({
                inputNames: ["color"],
                defaultValue: this.color,
                opacity: true
            })
                .addCategory({
                displayName: "Font",
                icon: this.fontCategoryIcon,
            })
                .addPresetCarousel({
                inputNames: ["font"],
                noneOption: false,
                defaultIndex: this.font,
                autoUpdateInputs: false,
                onValueChanged: (value) => {
                    this.updateFontSize(value);
                    (0, VisualEditAPI_1.getVisualEditManager)().updateInputValue(this, "font", value);
                }
            })
                .addItem({ icon: this.fontIcons[0] })
                .addItem({ icon: this.fontIcons[1] })
                .addItem({ icon: this.fontIcons[2] })
                .addItem({ icon: this.fontIcons[3] })
                .addItem({ icon: this.fontIcons[4] })
                .addItem({ icon: this.fontIcons[5] })
                .addItem({ icon: this.fontIcons[6] })
                .addItem({ icon: this.fontIcons[7] })
                .addItem({ icon: this.fontIcons[8] })
                .addItem({ icon: this.fontIcons[9] })
                .addItem({ icon: this.fontIcons[10] })
                .addCategory({
                displayName: "Use BG",
                icon: this.backgroundColorCategoryIcon,
            })
                .addToggle({
                inputNames: ["backgroundEnabled"],
                defaultValue: this.backgroundEnabled,
                onText: "Background",
                offText: "Background",
                controllerId: "backgroundEnabled",
            })
                .addCategory({
                displayName: "BG Color",
                icon: this.colorCategoryIcon,
                showIf: {
                    controllerId: "backgroundEnabled",
                    condition(value) {
                        return value;
                    },
                }
            })
                .addColorPicker({
                inputNames: ["backgroundColor"],
                defaultValue: this.backgroundColor,
                opacity: true
            })
                .addCategory({
                displayName: "BG Settings",
                icon: this.backgroundScaleCategoryIcon,
                showIf: {
                    controllerId: "backgroundEnabled",
                    condition(value) {
                        return value;
                    },
                }
            })
                .addSlider({
                inputNames: ["backgroundScale"],
                label: "Background Margins",
                defaultValue: this.backgroundScale,
                min: 0,
                max: 1,
                minDisplayValue: 0,
                maxDisplayValue: 100,
            })
                .addSlider({
                inputNames: ["backgroundRoundness"],
                label: "Background Roundness",
                defaultValue: this.backgroundRoundness,
                min: 0,
                max: 1,
                minDisplayValue: 0,
                maxDisplayValue: 100,
            })
                .addCategory({
                displayName: "Use Outline",
                icon: this.outlineColorCategoryIcon,
            })
                .addToggle({
                inputNames: ["outlineEnabled"],
                defaultValue: this.outlineEnabled,
                onText: "Outline",
                offText: "Outline",
                controllerId: "outlineEnabled",
            })
                .addCategory({
                displayName: "Outline\nThickness",
                icon: this.outlineThicknessCategoryIcon,
                showIf: {
                    controllerId: "outlineEnabled",
                    condition(value) {
                        return value;
                    },
                }
            })
                .addSlider({
                inputNames: ["outlineThickness"],
                label: "Outline Thickness",
                defaultValue: this.outlineThickness,
                min: 0,
                max: 0.9,
                minDisplayValue: 0,
                maxDisplayValue: 100,
            })
                .addCategory({
                displayName: "Outline\nColor",
                icon: this.colorCategoryIcon,
                showIf: {
                    controllerId: "outlineEnabled",
                    condition(value) {
                        return value;
                    },
                }
            })
                .addColorPicker({
                inputNames: ["outlineColor"],
                defaultValue: this.outlineColor,
                opacity: true
            })
                .addCategory({
                displayName: "Use Shadow",
                icon: this.shadowColorCategoryIcon,
            })
                .addToggle({
                inputNames: ["shadowEnabled"],
                defaultValue: this.shadowEnabled,
                onText: "Shadow",
                offText: "Shadow",
                controllerId: "shadowEnabled",
            })
                .addCategory({
                displayName: "Shadow\nColor",
                icon: this.colorCategoryIcon,
                showIf: {
                    controllerId: "shadowEnabled",
                    condition(value) {
                        return value;
                    },
                }
            })
                .addColorPicker({
                inputNames: ["shadowColor"],
                defaultValue: this.shadowColor,
                opacity: true
            })
                .addCategory({
                displayName: "Shadow\nOffset",
                icon: this.shadowOffsetCategoryIcon,
                showIf: {
                    controllerId: "shadowEnabled",
                    condition(value) {
                        return value;
                    },
                }
            })
                .addSlider({
                inputNames: ["shadowOffsetX"],
                label: "Offset X",
                defaultValue: this.shadowOffsetX,
                min: -1,
                max: 1,
                minDisplayValue: -100,
                maxDisplayValue: 100,
                trackBarMode: "center"
            })
                .addSlider({
                inputNames: ["shadowOffsetY"],
                label: "Offset Y",
                defaultValue: this.shadowOffsetY,
                min: -1,
                max: 1,
                minDisplayValue: -100,
                maxDisplayValue: 100,
                trackBarMode: "center"
            })
                .addCategory({
                displayName: "Alignment",
                icon: this.alignmentCategoryIcon,
            })
                .addPresetCarousel({
                inputNames: ["alignment"],
                noneOption: false,
                defaultIndex: this.alignment,
            })
                .addItem({ icon: this.alignmentIcons[0] })
                .addItem({ icon: this.alignmentIcons[1] })
                .addItem({ icon: this.alignmentIcons[2] })
                .addCategory({
                displayName: "Editable",
                icon: this.editableCategoryIcon,
            })
                .addToggle({
                inputNames: ["editable"],
                defaultValue: this.editable,
                onText: "Unlock editing",
                offText: "Unlock editing",
            })
                .build();
            return uiSettings;
        }
        setupTextEditing() {
            const keyboardOptions = new TextInputSystem.KeyboardOptions();
            keyboardOptions.enablePreview = true;
            keyboardOptions.returnKeyType = TextInputSystem.ReturnKeyType.Return;
            keyboardOptions.onTextChanged = ((text) => {
                let splitText = this.splitWord(text);
                this.text = splitText;
                (0, VisualEditAPI_1.getVisualEditManager)().updateInputValue(this, "text", splitText);
            });
            let dismissTime = 0;
            keyboardOptions.onKeyboardStateChanged = ((state) => {
                if (!state) {
                    isEditing = false;
                    tapEvent.enabled = false;
                }
                else {
                    tapEvent.enabled = true;
                }
            });
            let isEditing = false;
            this.interaction = this.destructionHelper.getOrAddComponent(this.sceneObject, "InteractionComponent");
            this.interaction.onTap.add(() => {
                keyboardOptions.initialText = this.text;
                if (!isEditing && (getTime() > dismissTime)) {
                    isEditing = true;
                    global.textInputSystem.requestKeyboard(keyboardOptions);
                }
            });
            const fullScreenTouchHandlerSO = this.destructionHelper.createSceneObject();
            const fullScreenTouchHandler = this.destructionHelper.getOrAddComponent(fullScreenTouchHandlerSO, "ScriptComponent");
            const tapEvent = fullScreenTouchHandler.createEvent("TapEvent");
            tapEvent.bind((e) => {
                if (isEditing) {
                    dismissTime = getTime();
                    global.textInputSystem.dismissKeyboard();
                }
            });
            tapEvent.enabled = false;
        }
        updateFontSize(value) {
            const currentFont = this.font;
            this.font = value;
            if (FontStyleSizeMap[value] !== FontStyleSizeMap[currentFont]) {
                const currentSize = this.screenTransform.scale.x;
                this.size = currentSize * FontStyleSizeMap[currentFont] / FontStyleSizeMap[value];
                (0, VisualEditAPI_1.getVisualEditManager)().updateInputValue(this, "size", this.size);
                // Show text withdelay to avoid flickering
                const previousPosition = this.screenTransform.anchors.getCenter();
                this.position = INVISIBLE_POINT;
                let skippedFrames = 0;
                const framesToSkip = 1;
                this.createEvent("LateUpdateEvent").bind((e) => {
                    if (skippedFrames < framesToSkip) {
                        skippedFrames++;
                        return;
                    }
                    this.screenTransform.anchors.setCenter(previousPosition);
                    this.removeEvent(e);
                    skippedFrames = 0;
                });
            }
        }
        containsDynamicText(text) {
            const dynamicKeys = Object.values(DynamicTextComponentMenuItemsMap);
            // Check for both regular {key} and escaped \{key\} patterns
            return dynamicKeys.some(key => {
                const escapedKey = key.replace(/[{}]/g, '\\$&');
                return text.includes(key) || text.includes(escapedKey);
            });
        }
        async parseText(text) {
            if (!this.containsDynamicText(text)) {
                return text;
            }
            let parsedText = text;
            for (const [key, placeholder] of Object.entries(DynamicTextComponentMenuItemsMap)) {
                const escapedPlaceholder = placeholder.replace(/[{}]/g, '\\$&');
                if (parsedText.includes(placeholder) || parsedText.includes(escapedPlaceholder)) {
                    const staticValue = await this.getStaticValueForItem(placeholder);
                    if (parsedText.includes(placeholder)) {
                        parsedText = parsedText.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), staticValue);
                    }
                    if (parsedText.includes(escapedPlaceholder)) {
                        parsedText = parsedText.replace(new RegExp(escapedPlaceholder.replace(/[\\{}]/g, '\\$&'), 'g'), staticValue);
                    }
                }
            }
            return parsedText;
        }
        async getStaticValueForItem(item) {
            let staticValue = "";
            switch (item) {
                case DynamicTextComponentMenuItemsMap[DynamicTextComponentMenuItems.Location]:
                    staticValue = await this.getLocation();
                    break;
                case DynamicTextComponentMenuItemsMap[DynamicTextComponentMenuItems.Date]:
                    staticValue = this.getDate();
                    break;
                case DynamicTextComponentMenuItemsMap[DynamicTextComponentMenuItems.Time]:
                    staticValue = this.getTime();
                    break;
                case DynamicTextComponentMenuItemsMap[DynamicTextComponentMenuItems.Name]:
                    staticValue = await this.getName();
                    break;
            }
            return new Promise((resolve) => {
                resolve(staticValue);
            });
        }
        getLocation() {
            return new Promise((resolve) => {
                if (global.deviceInfoSystem?.isCameraKit?.() && !global.deviceInfoSystem?.isMobile?.()) {
                    // In Lens Studio Web, we can't fetch user's location
                    resolve(this.DEFAULT_LOCATION_PLACEHOLDER);
                    return;
                }
                if (this.cachedLocation) {
                    resolve(this.cachedLocation);
                }
                const timeout = this.createEvent("DelayedCallbackEvent");
                timeout.bind(() => {
                    resolve(this.DEFAULT_LOCATION_PLACEHOLDER);
                    this.removeEvent(timeout);
                });
                timeout.reset(0.5);
                global.userContextSystem.requestCity((city) => {
                    this.cachedLocation = city;
                    resolve(city);
                });
            });
        }
        getDate() {
            if (!this.cachedDate) {
                const month = global.localizationSystem.getMonth(new Date());
                this.cachedDate = global.localizationSystem.getDateFormatted(new Date()).replace(month.substring(0, 3), month);
            }
            return this.cachedDate;
        }
        getTime() {
            return global.localizationSystem.getTimeFormatted(new Date());
        }
        getName() {
            return new Promise((resolve) => {
                if (this.cachedName) {
                    resolve(this.cachedName);
                }
                global.userContextSystem.requestDisplayName((displayName) => {
                    this.cachedName = displayName;
                    resolve(displayName);
                });
            });
        }
        /**
         * Split the text into lines, preserving newlines within words and limiting the number of rows to MAX_ROWS
         */
        splitWord(str) {
            let result = '';
            let currentLength = 0;
            let rowCount = 1;
            const currentTextSize = this.screenTransform.scale.x * FontStyleSizeMap[this.font];
            let maxCharsPerRow = Math.round(17 / currentTextSize);
            if (maxCharsPerRow < 4) {
                maxCharsPerRow = 4;
            }
            let words = str.split(' ');
            for (let i = 0; i < words.length; i++) {
                let word = words[i];
                if (word.includes('\n')) {
                    let wordParts = word.split('\n');
                    for (let j = 0; j < wordParts.length; j++) {
                        let part = wordParts[j];
                        if (j > 0) {
                            result += '\n';
                            currentLength = 0;
                            rowCount++;
                        }
                        if (part.length > 0) {
                            if (currentLength + part.length + (currentLength > 0 ? 1 : 0) > maxCharsPerRow) {
                                result += '\n';
                                currentLength = 0;
                                rowCount++;
                            }
                            if (currentLength > 0) {
                                result += ' ';
                                currentLength += 1;
                            }
                            result += part;
                            currentLength += part.length;
                        }
                    }
                }
                else {
                    if (currentLength + word.length + (currentLength > 0 ? 1 : 0) > maxCharsPerRow) {
                        result += '\n';
                        currentLength = 0;
                        rowCount++;
                    }
                    if (currentLength > 0) {
                        result += ' ';
                        currentLength += 1;
                    }
                    result += word;
                    currentLength += word.length;
                }
            }
            return result;
        }
        joinWord(str) {
            // Replace newlines with spaces
            let result = str.replace(/\n/g, ' ');
            // Collapse multiple consecutive spaces into a single space
            result = result.replace(/  +/g, ' ');
            // Trim leading/trailing whitespace
            return result.trim();
        }
        forceWrapDynamicTextAnchors(st) {
            var r = st.anchors;
            var s = st.scale.x;
            var center = r.getCenter();
            var size = r.getSize();
            // Early return if nothing changed since previous frame
            if (this.prevPosition !== null &&
                this.prevPosition.equal(center) &&
                this.prevText === this.textComponent.text &&
                this.prevRotation === this.rotation &&
                this.prevScale === s) {
                return;
            }
            // Update cached values
            this.prevPosition = center;
            this.prevText = this.textComponent.text;
            this.prevRotation = this.rotation;
            this.prevScale = s;
            var halfWidth = (size.x / 2) * s;
            var halfHeight = (size.y / 2) * s;
            const rotationAngle = this.rotation % 360;
            // Get the 4 corners in screen space
            let minX, maxX, minY, maxY;
            if (rotationAngle !== 0) {
                const rad = rotationAngle * MathUtils.DegToRad;
                const cos = Math.cos(rad);
                const sin = Math.sin(rad);
                // Calculate all 4 rotated corners
                const c1x = center.x + (-halfWidth * cos - halfHeight * sin);
                const c1y = center.y + (-halfWidth * sin + halfHeight * cos);
                const c2x = center.x + (halfWidth * cos - halfHeight * sin);
                const c2y = center.y + (halfWidth * sin + halfHeight * cos);
                const c3x = center.x + (-halfWidth * cos + halfHeight * sin);
                const c3y = center.y + (-halfWidth * sin - halfHeight * cos);
                const c4x = center.x + (halfWidth * cos + halfHeight * sin);
                const c4y = center.y + (halfWidth * sin - halfHeight * cos);
                // Bounding box from all corners
                minX = Math.min(c1x, c2x, c3x, c4x);
                maxX = Math.max(c1x, c2x, c3x, c4x);
                minY = Math.min(c1y, c2y, c3y, c4y);
                maxY = Math.max(c1y, c2y, c3y, c4y);
            }
            else {
                minX = center.x - halfWidth;
                maxX = center.x + halfWidth;
                minY = center.y - halfHeight;
                maxY = center.y + halfHeight;
            }
            // Bounding rectangle properties
            const boundingWidth = maxX - minX;
            const boundingHeight = maxY - minY;
            const boundingCenterX = (minX + maxX) / 2;
            const boundingCenterY = (minY + maxY) / 2;
            let shiftX = 0;
            let shiftY = 0;
            // Clamp bounding box to screen (-1 to 1)
            if (maxX > 1.0)
                shiftX = 1.0 - maxX;
            if (minX + shiftX < -1.0)
                shiftX = -1.0 - minX;
            if (minY < -1.0)
                shiftY = -1.0 - minY;
            if (maxY + shiftY > 1.0)
                shiftY = 1.0 - maxY;
            if (shiftX !== 0 || shiftY !== 0) {
                st.anchors.setCenter(new vec2(center.x + shiftX, center.y + shiftY));
            }
        }
    };
    __setFunctionName(_classThis, "ScreenText");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ScreenText = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ScreenText = _classThis;
})();
exports.ScreenText = ScreenText;
//# sourceMappingURL=Screen%20Text.js.map