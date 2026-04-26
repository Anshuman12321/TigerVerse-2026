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
exports.CondenseCreate = void 0;
var __selfType = requireType("./CondenseCreate");
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
let CondenseCreate = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var CondenseCreate = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.childTemplate = this.childTemplate;
            this.childOffsetX = this.childOffsetX;
            this.childOffsetY = this.childOffsetY;
            this.childOffsetZ = this.childOffsetZ;
            this.locked = false;
        }
        __initialize() {
            super.__initialize();
            this.childTemplate = this.childTemplate;
            this.childOffsetX = this.childOffsetX;
            this.childOffsetY = this.childOffsetY;
            this.childOffsetZ = this.childOffsetZ;
            this.locked = false;
        }
        onAwake() {
            this.createEvent("OnStartEvent").bind(() => {
                this.onStart();
            });
        }
        onStart() {
            this.interactable = this.getSceneObject().getComponent(Interactable_1.Interactable.getTypeName());
            if (!this.interactable) {
                print("ERROR: No Interactable on " + this.getSceneObject().name);
                return;
            }
            if (!this.childTemplate) {
                print("ERROR: No Child Template on " + this.getSceneObject().name);
                return;
            }
            this.interactable.onTriggerStart.add(() => {
                if (this.locked) {
                    return;
                }
                this.locked = true;
                this.toggleFolder();
            });
            this.interactable.onTriggerEnd.add(() => {
                this.locked = false;
            });
            print("CondenseCreate ready on " + this.getSceneObject().name);
        }
        toggleFolder() {
            var existingChild = this.findDirectGeneratedChild();
            if (existingChild) {
                print("Condensing " + this.getSceneObject().name);
                existingChild.destroy();
            }
            else {
                print("Expanding " + this.getSceneObject().name);
                this.createChildFolder();
            }
        }
        createChildFolder() {
            var newBox = this.childTemplate.copyWholeHierarchy(this.getSceneObject());
            newBox.name = "GeneratedFolder_" + CondenseCreate.nextId;
            CondenseCreate.nextId++;
            newBox.enabled = true;
            newBox.getTransform().setLocalPosition(new vec3(this.childOffsetX, this.childOffsetY, this.childOffsetZ));
            newBox.getTransform().setLocalScale(new vec3(1, 1, 1));
            print("Created " + newBox.name);
        }
        findDirectGeneratedChild() {
            for (var i = 0; i < this.getSceneObject().getChildrenCount(); i++) {
                var child = this.getSceneObject().getChild(i);
                if (child.name.indexOf("GeneratedFolder_") === 0) {
                    return child;
                }
            }
            return null;
        }
    };
    __setFunctionName(_classThis, "CondenseCreate");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CondenseCreate = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    })();
    _classThis.nextId = 0;
    (() => {
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CondenseCreate = _classThis;
})();
exports.CondenseCreate = CondenseCreate;
//# sourceMappingURL=CondenseCreate.js.map