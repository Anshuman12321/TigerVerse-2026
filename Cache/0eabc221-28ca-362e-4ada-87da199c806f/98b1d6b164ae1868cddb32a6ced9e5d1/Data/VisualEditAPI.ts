

export namespace VisualEditManagerAPI {
    export interface IEvent {
        add(listener: (enabled: boolean) => void): void;
        remove(listener: (enabled: boolean) => void): void;
        addOnce(listener: (enabled: boolean) => void): void;
        clear(): void;
        trigger(enabled: boolean): void;
        disable(): void;
        enable(): void;
        listenerCount(): number;
    }

    export interface IUIGizmo2DTransform {
        position: vec2;
        rotation: number;
        rotationDegrees: number;
        size: vec2;
    }

    interface IObservableValue<T = any> {
        getValue(): T;
        addListener(listener: (newValue: T, oldValue: T | undefined) => void): void;
        removeListener(listener: (newValue: T, oldValue: T | undefined) => void): void;
    }

    export interface IProperty<T = any> extends IObservableValue<T> {
        setValue(value: T): void;
    }

    export interface IIconLabelCarousel {
        setActiveItem(index: number): void;
        value: number;
    }

    export interface IControllerReference {
        controllerId: string;
        valueProperty: IProperty<any>;
    }
    

    // UI SETTINGS TYPES
    export type UIControllerType = 'slider' | 'colorPicker' | 'toggle' | 'gizmo2D' | 'presetCarousel' | 'pageSelector' | 'custom';
    export type UIControllerParams = SliderParams | ToggleParams | ColorPickerParams | Gizmo2DParams | PresetCarouselParams | PageSelectorParams;
    export type SliderTrackBarMode = "none" | "start" | "center";
    export type Gizmo2DSizingMode = "anchors" | "scale";
    export type PositionLimitType = "unset" | "limitEdges" | "limitEdgesReverse" | "limitCenter";

    export interface UISettings {
        categories: EffectCategory[]; 
    }

    export interface EffectCategory { 
        controllers: UIController[];
        options?: CategoryOptions;
    }

    export interface CategoryOptions {
        id?: string;                
        icon?: Texture; // icon for the UI panel 
        displayName?: string; // name under the icon in the UI panel                  
        activeOnInit?: boolean;
        showIf?: ShowIfOptions;
        onSelectionStatusChanged?: (isActive: boolean) => void;
    }

    export interface ShowIfOptions {
        controllerId: string;
        condition: (value: any) => boolean;
    }

    export interface UIController {
        type: UIControllerType;
        params?: UIControllerParams;
    }

    // UI CONTROLLER PARAMS 
    export interface SliderParams {
        inputNames: string[];
        controllerId?: string;
        label?: string;
        defaultValue?: number;
        min?: number;
        max?: number;
        minDisplayValue?: number;
        maxDisplayValue?: number;
        step?: number;
        trackBarMode?: SliderTrackBarMode;
        autoUpdateInputs?: boolean;
        onValueChanged?: (value: number) => void;
        onTouchStart?: (value: number) => void;
        onTouchEnd?: (value: number) => void;
    }

    export interface Gizmo2DParams { 
        imageSceneObject: SceneObject; // SceneObject with the screen transform
        inputNames: gizmo2DInputNamesParams;
        controllerId?: string;
        uniformScale?: boolean;
        attachTo2DCamera?: boolean;
        sizingMode?: Gizmo2DSizingMode;
        autoUpdateInputs?: boolean;
        fixAspect?: boolean;
        limitPositioning?: PositionLimitType;
        bounds?: vec4;
        onValueChanged?: (transform: IUIGizmo2DTransform) => void;
    }

    export interface ColorPickerParams {
        inputNames: string[];
        controllerId?: string;
        opacity?: boolean;  
        defaultValue?: vec4 | vec3;
        autoUpdateInputs?: boolean;
        onValueChanged?: (value: vec4 | vec3) => void;
    }

    export interface ToggleParams {
        inputNames: string[];
        controllerId?: string;
        onText?: string;
        offText?: string;
        defaultValue?: boolean;
        autoUpdateInputs?: boolean;
        onValueChanged?: (value: boolean) => void;
    }

    export interface gizmo2DInputNamesParams {
        positionInputNames: string[];
        scaleInputNames: string[];
        rotationInputNames: string[];
    }

    export interface PresetCarouselParams {
        inputNames: string[];
        controllerId?: string;
        items?: PresetCarouselItem[];
        noneOption?: boolean;
        defaultIndex?: number;
        autoUpdateInputs?: boolean;
        onValueChanged?: (value: any) => void;
    }

    export interface PresetCarouselItem {
        icon: Texture;
        value?: any;
    }


    export interface PageSelectorParams {
        inputNames: string[];
        controllerId?: string;
        leftLabel?: string;
        rightLabel?: string;
        defaultValue?: 0 | 1;
        leftValue?: any;
        rightValue?: any;
        autoUpdateInputs?: boolean;
        onValueChanged?: (value: any) => void;
    }


    // UI SETTINGS BUILDER INTERFACES
    export interface IUISettingsBuilder {
        addCategory(options?: CategoryOptions): ICategoryBuilder;
    }

    export interface ICategoryBuilder {
        addSlider(params: SliderParams): ICategoryBuilder;
        addColorPicker(params: ColorPickerParams): ICategoryBuilder;
        addToggle(params: ToggleParams): ICategoryBuilder;
        addGizmo2D(params: Gizmo2DParams): ICategoryBuilder;
        addPresetCarousel(params: PresetCarouselParams): IPresetCarouselBuilder;
        addCategory(options?: CategoryOptions): ICategoryBuilder;
        addPageSelector(params: PageSelectorParams): ICategoryBuilder;
        addController(controller: UIController): ICategoryBuilder;
        build(): UISettings;
    }

    export interface IPresetCarouselBuilder {
        addItem(options: PresetCarouselItem): IPresetCarouselBuilder;
        addSlider(params: SliderParams): IPresetCarouselBuilder;
        addColorPicker(params: ColorPickerParams): IPresetCarouselBuilder;
        addToggle(params: ToggleParams): IPresetCarouselBuilder;
        addGizmo2D(params: Gizmo2DParams): IPresetCarouselBuilder;
        addController(controller: UIController): IPresetCarouselBuilder;
        addPageSelector(params: PageSelectorParams): IPresetCarouselBuilder;
        addCategory(options?: CategoryOptions): ICategoryBuilder;
        build(): UISettings;
    }

    // VEM API INTERFACES
    export interface IBlock extends BaseScriptComponent {
        [key: string]: any; // getters and setters for the block properties
    }

    export interface IUIDelegate {
        blockId: string;
        uiName: string;
        onSetEnabled: IEvent;
        visualEnabled: boolean;
        getPanel(): IIconLabelCarousel | null;
        getControllerReference(controllerId: string): IControllerReference | null;
    }

    export interface IVisualEditManager {
        registerCustomUI(block: IBlock, uiName: string): IUIDelegate;
        createUI(block: IBlock, uiName: string, settings: UISettings): IUIDelegate;
        updateInputValue(block: IBlock, inputName: string, value: any): void;
        attachToUICamera2D(so: SceneObject | ObjectPrefab): void;
        attachToUICamera3D(so: SceneObject | ObjectPrefab): void;
        createUISettingsObject(): IUISettingsBuilder;
        getUICameraLayer2D(): LayerSet;
        getUICameraLayer3D(): LayerSet;
    }
}


export function isVisualEditManagerAvailable(): boolean {
    // @ts-ignore
    if(global.EasyLens && global.EasyLens.VisualEdit) {
        return true;
    }
    return false;
}

export function getVisualEditManager(): VisualEditManagerAPI.IVisualEditManager {
    // @ts-ignore
    return global.EasyLens.VisualEdit;
}