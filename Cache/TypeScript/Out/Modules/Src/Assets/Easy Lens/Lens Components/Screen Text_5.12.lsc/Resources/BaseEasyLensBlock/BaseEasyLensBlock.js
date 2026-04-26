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
exports.BaseEasyLensBlock = void 0;
var __selfType = requireType("./BaseEasyLensBlock");
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
const ComponentUtils_1 = require("./ComponentUtils");
let BaseEasyLensBlock = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var BaseEasyLensBlock = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.reactivePropertyValues = new Map();
        }
        __initialize() {
            super.__initialize();
            this.reactivePropertyValues = new Map();
        }
        onAwake() {
            this.setupEnableDisableEvents();
        }
        /**
         * Register properties for reactive behavior and automatically set them up
         * Call this in your constructor with property names that need reactive getters/setters
         * @param propertyNames - The name(s) of the @input property(ies) to make reactive
         * @param callSetters - Whether to automatically call setters with initial values (default: true)
         */
        registerReactiveProperty(propertyNames, callSetters = true) {
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
        setupEnableDisableEvents() {
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
        setupSingleReactiveProperty(propertyName) {
            const initialValue = this[propertyName];
            this.reactivePropertyValues.set(propertyName, initialValue);
            const customSetterName = `set${propertyName.charAt(0).toUpperCase() + propertyName.slice(1)}`;
            const customGetterName = `get${propertyName.charAt(0).toUpperCase() + propertyName.slice(1)}`;
            const hasSetter = typeof this[customSetterName] === 'function';
            const hasGetter = typeof this[customGetterName] === 'function';
            if (!hasSetter) {
                throw new Error(`Property '${propertyName}' registered as reactive requires setter method '${customSetterName}(value)'`);
            }
            const getterFn = hasGetter
                ? () => this[customGetterName]()
                : () => this.getReactiveValue(propertyName);
            const setterFn = (value) => {
                this.setReactiveValue(propertyName, value);
                this[customSetterName](value);
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
        createReactiveProperty(propertyName, setter, getter) {
            if (!(propertyName in this)) {
                print(`BaseEasyLensBlock error: Property '${propertyName}' does not exist on component. Make sure it matches your @input property name exactly.`);
                return;
            }
            let isSetting = false;
            Object.defineProperty(this, propertyName, {
                get: getter,
                set: (value) => {
                    if (isSetting) {
                        this.setReactiveValue(propertyName, value);
                        return;
                    }
                    isSetting = true;
                    try {
                        setter(value);
                    }
                    finally {
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
        instantiatePrefabWithSceneObjectLayer(prefab, parent) {
            return (0, ComponentUtils_1.instantiatePrefabWithSceneObjectLayer)(prefab, parent || this.getSceneObject());
        }
        /**
         * Helper method to get a reactive property value from storage
         * Use this in your custom getter methods
         */
        getReactiveValue(propertyName) {
            return this.reactivePropertyValues.get(propertyName);
        }
        /**
         * Helper method to set a reactive property value in storage
         * Use this in your custom setter methods
         */
        setReactiveValue(propertyName, value) {
            this.reactivePropertyValues.set(propertyName, value);
        }
        /**
         * Generic getter for reactive properties
         * Can be used when you need to access reactive values programmatically
         * Example: const color = this.getProperty<vec4>('hairColorVec4');
         */
        getProperty(propertyName) {
            return this.getReactiveValue(propertyName);
        }
        /**
         * Call initial setters for specific properties
         * This is called automatically by registerReactiveProperty when callSetters is true
         */
        callInitialSettersForProperties(propertyNames) {
            for (const propertyName of propertyNames) {
                const initialValue = this.reactivePropertyValues.get(propertyName);
                const setterName = `set${propertyName.charAt(0).toUpperCase() + propertyName.slice(1)}`;
                if (typeof this[setterName] === 'function') {
                    this[setterName](initialValue);
                }
            }
        }
        /**
         * Call setters for all registered reactive properties
         * Useful when you want to trigger all setters manually after registration
         */
        callAllSetters() {
            const allPropertyNames = Array.from(this.reactivePropertyValues.keys());
            this.callInitialSettersForProperties(allPropertyNames);
        }
        /**
         * Call setters for specific properties by name
         * @param propertyNames - The name(s) of the property(ies) to call setters for
         */
        callSettersFor(propertyNames) {
            const names = Array.isArray(propertyNames) ? propertyNames : [propertyNames];
            // Validate that all properties are registered
            for (const name of names) {
                if (!this.reactivePropertyValues.has(name)) {
                    throw new Error(`Property '${name}' is not registered as reactive. Register it first with registerReactiveProperty.`);
                }
            }
            this.callInitialSettersForProperties(names);
        }
    };
    __setFunctionName(_classThis, "BaseEasyLensBlock");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BaseEasyLensBlock = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BaseEasyLensBlock = _classThis;
})();
exports.BaseEasyLensBlock = BaseEasyLensBlock;
//# sourceMappingURL=BaseEasyLensBlock.js.map