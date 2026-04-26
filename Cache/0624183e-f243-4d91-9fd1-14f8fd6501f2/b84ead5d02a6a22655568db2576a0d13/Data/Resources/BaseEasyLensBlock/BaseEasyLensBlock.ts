import { instantiatePrefabWithSceneObjectLayer } from "./ComponentUtils";

@component
export abstract class BaseEasyLensBlock extends BaseScriptComponent {
    protected reactivePropertyValues: Map<string, any> = new Map();


    onAwake() {
        this.setupEnableDisableEvents();
    }

    /**
     * Register properties for reactive behavior and automatically set them up
     * Call this in your constructor with property names that need reactive getters/setters
     * @param propertyNames - The name(s) of the @input property(ies) to make reactive
     * @param callSetters - Whether to automatically call setters with initial values (default: true)
     */
    protected registerReactiveProperty(propertyNames: string | string[], callSetters: boolean = true): void {
        const names = Array.isArray(propertyNames) ? propertyNames : [propertyNames];

        for (const name of names) {
            if (this.reactivePropertyValues.has(name)) {
                throw new Error(`Property '${name}' is already registered as reactive. Each property can only be registered once.`);
            }
            this.setupSingleReactiveProperty(name);
        }

        if (callSetters) {
            this.callInitialSettersForProperties(names);
        }
    }

    /**
     * Sets up the OnEnableEvent and OnDisableEvent automatically
     * This ensures all components have these events properly configured
     */
    private setupEnableDisableEvents(): void {
        this.createEvent("OnDisableEvent").bind(() => {
            this.onDisable();
        });

        this.createEvent("OnEnableEvent").bind(() => {
            this.onEnable();
        });
    }

    /**
     * Sets up a single reactive property - requires custom setter, provides automatic getter
     */
    private setupSingleReactiveProperty(propertyName: string): void {
        const initialValue = (this as any)[propertyName];
        this.reactivePropertyValues.set(propertyName, initialValue);

        const customSetterName = `set${propertyName.charAt(0).toUpperCase() + propertyName.slice(1)}`;
        const customGetterName = `get${propertyName.charAt(0).toUpperCase() + propertyName.slice(1)}`;

        const hasSetter = typeof (this as any)[customSetterName] === 'function';
        const hasGetter = typeof (this as any)[customGetterName] === 'function';

        if (!hasSetter) {
            throw new Error(`Property '${propertyName}' registered as reactive requires setter method '${customSetterName}(value)'`);
        }

        const getterFn = hasGetter
            ? () => (this as any)[customGetterName]()
            : () => this.getReactiveValue(propertyName);

        const setterFn = (value: any) => {
            this.setReactiveValue(propertyName, value);
            (this as any)[customSetterName](value);
        };

        this.createReactiveProperty(propertyName, setterFn, getterFn);
    }



    /**
     * Creates a reactive property with custom getter/setter logic
     * IMPORTANT: propertyName must match an existing @input property name
     * @param propertyName - The name of the @input property to make reactive
     * @param setter - Function to call when property is set
     * @param getter - Function to call when property is accessed
     */
    protected createReactiveProperty<T>(propertyName: string,
        setter: (value: T) => void,
        getter: () => T): void {
        if (!(propertyName in this)) {
            print(`BaseEasyLensBlock error: Property '${propertyName}' does not exist on component. Make sure it matches your @input property name exactly.`);
            return;
        }

        let isSetting = false;

        Object.defineProperty(this, propertyName, {
            get: getter,
            set: (value: T) => {
                if (isSetting) {
                    this.setReactiveValue(propertyName, value);
                    return;
                }

                isSetting = true;
                try {
                    setter(value);
                } finally {
                    isSetting = false;
                }
            },
            enumerable: true,
            configurable: true
        });
    }

    /**
     * Instantiate a prefab with the same layer as this component's scene object
     * @param prefab - The prefab to instantiate
     * @param parent - Optional parent scene object (defaults to this component's scene object)
     * @returns The instantiated scene object or null if failed
     */
    protected instantiatePrefabWithSceneObjectLayer(prefab: ObjectPrefab, parent?: SceneObject): SceneObject | null {
        return instantiatePrefabWithSceneObjectLayer(prefab, parent || this.getSceneObject());
    }

    /**
     * Called when the component is disabled
     * MUST be implemented in derived classes to handle disable logic
     */
    protected abstract onDisable(): void;

    /**
     * Called when the component is enabled
     * MUST be implemented in derived classes to handle enable logic
     */
    protected abstract onEnable(): void;

    /**
     * Helper method to get a reactive property value from storage
     * Use this in your custom getter methods
     */
    protected getReactiveValue<T>(propertyName: string): T {
        return this.reactivePropertyValues.get(propertyName);
    }

    /**
     * Helper method to set a reactive property value in storage
     * Use this in your custom setter methods
     */
    protected setReactiveValue<T>(propertyName: string, value: T): void {
        this.reactivePropertyValues.set(propertyName, value);
    }

    /**
     * Generic getter for reactive properties
     * Can be used when you need to access reactive values programmatically
     * Example: const color = this.getProperty<vec4>('hairColorVec4');
     */
    protected getProperty<T>(propertyName: string): T {
        return this.getReactiveValue<T>(propertyName);
    }

    /**
     * Call initial setters for specific properties
     * This is called automatically by registerReactiveProperty when callSetters is true
     */
    private callInitialSettersForProperties(propertyNames: string[]): void {
        for (const propertyName of propertyNames) {
            const initialValue = this.reactivePropertyValues.get(propertyName);
            const setterName = `set${propertyName.charAt(0).toUpperCase() + propertyName.slice(1)}`;
            if (typeof (this as any)[setterName] === 'function') {
                (this as any)[setterName](initialValue);
            }
        }
    }

    /**
     * Call setters for all registered reactive properties
     * Useful when you want to trigger all setters manually after registration
     */
    protected callAllSetters(): void {
        const allPropertyNames = Array.from(this.reactivePropertyValues.keys());
        this.callInitialSettersForProperties(allPropertyNames);
    }

    /**
     * Call setters for specific properties by name
     * @param propertyNames - The name(s) of the property(ies) to call setters for
     */
    protected callSettersFor(propertyNames: string | string[]): void {
        const names = Array.isArray(propertyNames) ? propertyNames : [propertyNames];
        
        // Validate that all properties are registered
        for (const name of names) {
            if (!this.reactivePropertyValues.has(name)) {
                throw new Error(`Property '${name}' is not registered as reactive. Register it first with registerReactiveProperty.`);
            }
        }
        
        this.callInitialSettersForProperties(names);
    }
}