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
exports.NewScript = void 0;
var __selfType = requireType("./Untitled TypeScript");
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
const Interactable_1 = require("SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable");
let NewScript = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var NewScript = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.surfaceMaterial = this.surfaceMaterial;
        }
        __initialize() {
            super.__initialize();
            this.surfaceMaterial = this.surfaceMaterial;
        }
        onAwake() {
            this.createEvent("OnStartEvent").bind(() => {
                this.onStart();
            });
        }
        onStart() {
            this.interactable = this.sceneObject.getComponent(Interactable_1.Interactable.getTypeName());
            if (!this.interactable) {
                print("ERROR: Add an Interactable component to this object.");
                return;
            }
            print("SUCCESS: Interactable found.");
            this.interactable.onHoverEnter.add(() => {
                print("Hover entered");
                if (this.surfaceMaterial) {
                    this.surfaceMaterial.mainPass.baseColor = new vec4(1, 1, 0, 1); // yellow
                }
            });
            this.interactable.onHoverExit.add(() => {
                print("Hover exited");
                if (this.surfaceMaterial) {
                    this.surfaceMaterial.mainPass.baseColor = new vec4(1, 1, 1, 1); // white
                }
            });
            this.interactable.onTriggerStart.add(() => {
                print("Pinch / trigger started");
                if (this.surfaceMaterial) {
                    this.surfaceMaterial.mainPass.baseColor = new vec4(1, 0, 0, 1); // red
                }
            });
            this.interactable.onTriggerEnd.add(() => {
                print("Pinch / trigger ended");
                if (this.surfaceMaterial) {
                    this.surfaceMaterial.mainPass.baseColor = new vec4(0, 1, 0, 1); // green
                }
            });
        }
    };
    __setFunctionName(_classThis, "NewScript");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NewScript = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NewScript = _classThis;
})();
exports.NewScript = NewScript;
//# sourceMappingURL=Untitled%20TypeScript.js.map