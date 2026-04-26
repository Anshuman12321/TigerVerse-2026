import { DestructionHelper } from "./Resources/DestructionHelper";
import { BaseEasyLensBlock } from "./Resources/BaseEasyLensBlock/BaseEasyLensBlock";
import { getVisualEditManager, isVisualEditManagerAvailable , VisualEditManagerAPI} from "./VisualEditManager_5.12.lsc/Src/ExternalDeclarations/VisualEditAPI";


enum FontStyle {
    Regular = 0,
    Casual = 1,
    Headline,
    Comic = 3,
    Bold = 4,
    Playful = 5,
    Retro = 6,
    Handwritten = 7,
    GrandElegant = 8,
    ArtDeco = 9,
    Quirky = 10
}

enum DynamicTextComponentMenuItems {
    Location = "location",
    Date = "date",
    Time = "time",
    Name = "name"
}

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

@component
export class ScreenText extends BaseEasyLensBlock {
    @input
    blockId: string;

    @input
    @widget(new TextAreaWidget())
    protected text: string;

    @input
    protected editable: boolean;

    @ui.separator

    @input("int")
    @widget(new ComboBoxWidget()
        .addItem("Regular", 0)
        .addItem("Casual", 1)
        .addItem("Headline", 2)
        .addItem("Comic", 3)
        .addItem("Bold", 4)
        .addItem("Playful", 5)
        .addItem("Retro", 6)
        .addItem("Handwritten", 7)
        .addItem("Grand, Elegant", 8)
        .addItem("Art Deco", 9)
        .addItem("Quirky", 10)
    )
    protected font: FontStyle = FontStyle.Regular;

    @input("int")
    @widget(new ComboBoxWidget()
        .addItem("Left", 0)
        .addItem("Center", 1)
        .addItem("Right", 2)
    )
    protected alignment: HorizontalAlignment = HorizontalAlignment.Center;

    @ui.separator

    @input
    protected position: vec2 = new vec2(0.5, 0.5);

    @input
    protected size: number;

    @input
    @widget(new SliderWidget(0, 360))
    protected rotation: number;

    @ui.separator

    @input
    @widget(new ColorWidget())
    protected color: vec4 = new vec4(1, 1, 1, 1);

    @input
    protected outlineEnabled: boolean = false;

    @input
    @widget(new ColorWidget())
    @showIf("outlineEnabled")
    protected outlineColor: vec4 = new vec4(0, 0, 0, 1);

    @input
    @widget(new SliderWidget(0, 0.9))
    @showIf("outlineEnabled")
    protected outlineThickness: number = 0;

    @input
    protected backgroundEnabled: boolean = false;

    @input
    @widget(new ColorWidget())
    @showIf("backgroundEnabled")
    protected backgroundColor: vec4 = new vec4(1, 1, 1, 1);

    @input
    @widget(new SliderWidget(0, 1))
    @showIf("backgroundEnabled")
    protected backgroundScale: number = 1;

    @input
    @widget(new SliderWidget(0, 1))
    @showIf("backgroundEnabled")
    protected backgroundRoundness: number = 0;

    @input
    protected shadowEnabled: boolean = true;

    @input
    @widget(new ColorWidget())
    @showIf("shadowEnabled")
    protected shadowColor: vec4 = new vec4(0, 0, 0, 1);

    @input
    @widget(new SliderWidget(-1, 1))
    @showIf("shadowEnabled")
    protected shadowOffsetX: number = 0;

    @input
    @widget(new SliderWidget(-1, 1))
    @showIf("shadowEnabled")
    protected shadowOffsetY: number = 0;

    @input 
    textWrap: boolean = false;

    @input
    protected readonly fonts: Font[] = [];

    @input
    protected readonly fontIcons: Texture[] = [];

    @input
    protected readonly fontCategoryIcon: Texture;

    @input
    protected readonly alignmentCategoryIcon: Texture;

    @input
    protected readonly colorCategoryIcon: Texture;

    @input
    protected readonly outlineThicknessCategoryIcon: Texture;

    @input
    protected readonly outlineColorCategoryIcon: Texture;

    @input
    protected readonly shadowColorCategoryIcon: Texture;

    @input
    protected readonly shadowOffsetCategoryIcon: Texture;

    @input
    protected readonly backgroundColorCategoryIcon: Texture;

    @input
    protected readonly backgroundScaleCategoryIcon: Texture;

    @input
    protected readonly editableCategoryIcon: Texture;

    @input
    protected readonly alignmentIcons: Texture[] = [];


    protected textComponent: Text;
    protected screenTransform: ScreenTransform;
    protected interaction: InteractionComponent;
    protected extentsTargetScreenTransform: ScreenTransform;
    protected destructionHelper: DestructionHelper = new DestructionHelper();
    protected  safeRegionEnforced: boolean = false;
    protected isVisualEditingEnabled: boolean = false;

    // Dynamic text properties
    protected cachedLocation: string = "";
    protected cachedDate: string = "";
    protected cachedName: string = "";
    protected readonly DEFAULT_LOCATION_PLACEHOLDER: string = "Your Location";

    protected isTextSplit: boolean = false;

    // Cache for forceWrapDynamicTextAnchors optimization
    private prevPosition: vec2 | null = null;
    private prevText: string = "";
    private prevRotation: number = 0;
    private prevScale: number = 0;

    onAwake(): void {
        super.onAwake();
        this.textComponent = this.destructionHelper.createComponent(this.sceneObject, "Text");
        this.screenTransform = this.destructionHelper.getOrAddComponent(this.sceneObject, "ScreenTransform");

        const extentsTarget = this.destructionHelper.createSceneObject(this.sceneObject, "ExtentsTarget");
        this.extentsTargetScreenTransform = this.destructionHelper.getOrAddComponent(extentsTarget, "ScreenTransform");
        this.textComponent.extentsTarget = this.extentsTargetScreenTransform;

        this.screenTransform.anchors.setSize(new vec2(1.0,1.0));
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
            if (isVisualEditManagerAvailable()) {
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

    setText(text: string): void {
        if (this.containsDynamicText(text)) {
            this.parseText(text).then((parsedText) => {
                this.textComponent.text = parsedText;
            }).catch((error) => {
                print("Error parsing dynamic text: " + error);
                this.textComponent.text = text;
            });
        } else {
            this.textComponent.text = text;
        }
    }

    setPosition(position: vec2): void {
        const parentPosition = this.screenTransform.screenPointToParentPoint(position);
        this.screenTransform.anchors.setCenter(parentPosition);
    }

    setSize(size: number): void {
        this.screenTransform.scale = vec3.one().uniformScale(size);
    }

    setRotation(rotation: number): void {
        this.screenTransform.rotation = quat.angleAxis(rotation * MathUtils.DegToRad, vec3.forward());
    }

    setColor(color: vec4): void {
        this.textComponent.textFill.color = color;
    }

    setBackgroundEnabled(enabled: boolean): void {
        this.textComponent.backgroundSettings.enabled = enabled;
    }

    setBackgroundColor(color: vec4): void {
        this.textComponent.backgroundSettings.fill.color = color;
    }

    setBackgroundScale(scale: number): void {
        let marginsScale = scale * 2.0;
        this.textComponent.backgroundSettings.margins = Rect.create(marginsScale, marginsScale, marginsScale, marginsScale);
    }

    setBackgroundRoundness(roundness: number): void {
        this.textComponent.backgroundSettings.cornerRadius = roundness * 2.5;
    }

    setShadowEnabled(enabled: boolean): void {
        this.textComponent.dropshadowSettings.enabled = enabled;
    }

    setShadowColor(color: vec4): void {
        this.textComponent.dropshadowSettings.fill.color = color;
    }

    setShadowOffsetX(offsetX: number): void {
        this.textComponent.dropshadowSettings.offset = new vec2(offsetX, this.textComponent.dropshadowSettings.offset.y);
    }

    setShadowOffsetY(offsetY: number): void {
        this.textComponent.dropshadowSettings.offset = new vec2(this.textComponent.dropshadowSettings.offset.x, offsetY);
    }

    setFont(font: number): void {
        if (this.fonts[font]) {
            this.textComponent.font = this.fonts[font];
        } else {
            print("Invalid font: " + font);
            this.textComponent.font = this.fonts[0];
        }
    }

    setOutlineEnabled(enabled: boolean): void {
        this.textComponent.outlineSettings.enabled = enabled;
    }

    setOutlineColor(color: vec4): void {
        this.textComponent.outlineSettings.fill.color = color;
    }

    setOutlineThickness(thickness: number): void {
        this.textComponent.outlineSettings.size = thickness;
    }

    setAlignment(alignment: number): void {
        if (alignment >= 0 && alignment < 3) {
            this.textComponent.horizontalAlignment = alignment;
        } else {
            print("Invalid alignment: " + alignment);
        }
    }

    setEditable(editable: boolean): void {
        if (global.deviceInfoSystem?.isCameraKit?.()) {
            return;
        }
        this.textComponent.editable = editable;
    }

    forceSafeRegion(enforce:boolean) {
       this.safeRegionEnforced = enforce;
       this.textWrap = enforce;
       if(enforce === true){
            let splitText = this.splitWord(this.text);
            this.text =  splitText;
       }
    }

    protected onEnable(): void {
        this.textComponent.enabled = true;
    }

    protected onDisable(): void {
        this.textComponent.enabled = false;
    }

    protected setupVisualEditing(): void {
        const uiSettings = this.setupUISettings();
        const uiDelegate = getVisualEditManager().createUI(this, 'screenTextPanelUI', uiSettings);
        uiDelegate.onSetEnabled.add((enabled: boolean) => {
            this.isVisualEditingEnabled = enabled;
            if(enabled){
                this.forceSafeRegion(false);
            }
            else if (!enabled) {
                global.textInputSystem.dismissKeyboard();
            } else if (!this.textWrap) {
                this.textWrap = true;
                getVisualEditManager().updateInputValue(this, "text", this.text);
                getVisualEditManager().updateInputValue(this, "textWrap", this.textWrap);

            }
        });
        this.setupTextEditing();
    }

    protected syncTextScreenTransform(): void {
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
            if(this.safeRegionEnforced){
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

    protected setupUISettings(): VisualEditManagerAPI.UISettings {
        const uiSettings = getVisualEditManager().createUISettingsObject()
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
                    getVisualEditManager().updateInputValue(this, "position", screenPosition);
                    getVisualEditManager().updateInputValue(this, "size", transform.size.x);
                    const clampedRotation = (transform.rotationDegrees + 360) % 360;
                    getVisualEditManager().updateInputValue(this, "rotation", clampedRotation);
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
                onValueChanged: (value: number) => {
                    this.updateFontSize(value);
                    getVisualEditManager().updateInputValue(this, "font", value);
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
                    condition(value: boolean) {
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
                    condition(value: boolean) {
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
                    condition(value: boolean) {
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
                    condition(value: boolean) {
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
                    condition(value: boolean) {
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
                    condition(value: boolean) {
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

    protected setupTextEditing(): void {
        const keyboardOptions = new TextInputSystem.KeyboardOptions();
        keyboardOptions.enablePreview = true;
        keyboardOptions.returnKeyType = TextInputSystem.ReturnKeyType.Return;
        keyboardOptions.onTextChanged = ((text: string) => {
            let splitText = this.splitWord(text);
            this.text =  splitText;
            getVisualEditManager().updateInputValue(this, "text", splitText);
        });

        let dismissTime: number = 0;
        keyboardOptions.onKeyboardStateChanged = ((state: boolean) => {
            if (!state) {
                isEditing = false;
                tapEvent.enabled = false;
            } else {
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
        const tapEvent = fullScreenTouchHandler.createEvent("TapEvent")
        tapEvent.bind((e) => {
            if (isEditing) {
                dismissTime = getTime();
                global.textInputSystem.dismissKeyboard();
            }
        });
        tapEvent.enabled = false;
    }

    protected updateFontSize(value: number): void {
        const currentFont = this.font;
        this.font = value;
        if (FontStyleSizeMap[value] !== FontStyleSizeMap[currentFont]) {
            const currentSize = this.screenTransform.scale.x;
            this.size = currentSize * FontStyleSizeMap[currentFont] / FontStyleSizeMap[value];
            getVisualEditManager().updateInputValue(this, "size", this.size);

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

    protected containsDynamicText(text: string): boolean {
        const dynamicKeys = Object.values(DynamicTextComponentMenuItemsMap);
        // Check for both regular {key} and escaped \{key\} patterns
        return dynamicKeys.some(key => {
            const escapedKey = key.replace(/[{}]/g, '\\$&');
            return text.includes(key) || text.includes(escapedKey);
        });
    }

    protected async parseText(text: string): Promise<string> {
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

    private async getStaticValueForItem(item: string): Promise<string> {
        let staticValue = ""
        switch (item) {
            case DynamicTextComponentMenuItemsMap[DynamicTextComponentMenuItems.Location]:
                staticValue = await this.getLocation()
                break
            case DynamicTextComponentMenuItemsMap[DynamicTextComponentMenuItems.Date]:
                staticValue = this.getDate()
                break
            case DynamicTextComponentMenuItemsMap[DynamicTextComponentMenuItems.Time]:
                staticValue = this.getTime()
                break
            case DynamicTextComponentMenuItemsMap[DynamicTextComponentMenuItems.Name]:
                staticValue = await this.getName()
                break
        }
        return new Promise<string>((resolve) => {
            resolve(staticValue)
        })
    }

    private getLocation() {
        return new Promise<string>((resolve) => {
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
        })
    }

    private getDate() {
        if (!this.cachedDate) {
            const month = global.localizationSystem.getMonth(new Date())
            this.cachedDate = global.localizationSystem.getDateFormatted(new Date()).replace(month.substring(0, 3), month)
        }
        return this.cachedDate
    }

    private getTime() {
        return global.localizationSystem.getTimeFormatted(new Date())
    }

    private getName() {
        return new Promise<string>((resolve) => {
            if (this.cachedName) {
                resolve(this.cachedName)
            }
            global.userContextSystem.requestDisplayName((displayName) => {
                this.cachedName = displayName
                resolve(displayName)
            })
        })
    }

    /**
     * Split the text into lines, preserving newlines within words and limiting the number of rows to MAX_ROWS
     */
    private splitWord(str: string): string {
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
            } else {
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

    private joinWord(str: string): string {
        // Replace newlines with spaces
        let result = str.replace(/\n/g, ' ');
        // Collapse multiple consecutive spaces into a single space
        result = result.replace(/  +/g, ' ');
        // Trim leading/trailing whitespace
        return result.trim();
    }
    
    private forceWrapDynamicTextAnchors(st: ScreenTransform) {
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
        let minX: number, maxX: number, minY: number, maxY: number;
    
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
        } else {
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
        if (maxX > 1.0) shiftX = 1.0 - maxX;
        if (minX + shiftX < -1.0) shiftX = -1.0 - minX;
        
        if (minY < -1.0) shiftY = -1.0 - minY;
        if (maxY + shiftY > 1.0) shiftY = 1.0 - maxY;
    
        if (shiftX !== 0 || shiftY !== 0) {
            st.anchors.setCenter(new vec2(center.x + shiftX, center.y + shiftY));
        }
    }
}
