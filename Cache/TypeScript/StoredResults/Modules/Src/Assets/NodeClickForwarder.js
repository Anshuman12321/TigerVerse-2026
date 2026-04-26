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
exports.NodeClickForwarder = void 0;
var __selfType = requireType("./NodeClickForwarder");
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
const TreeManager_1 = require("./TreeManager");
let NodeClickForwarder = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var NodeClickForwarder = _classThis = class extends _classSuper {
        constructor() {
            super();
        }
        __initialize() {
            super.__initialize();
        }
        onAwake() {
            var interactable = this.findInteractableOnThisObject();
            if (!interactable) {
                print("NodeClickForwarder ERROR: No Interactable found on " + this.sceneObject.name);
                return;
            }
            if (interactable.onTriggerStart) {
                interactable.onTriggerStart.add(() => {
                    this.forwardClick();
                });
                print("NodeClickForwarder bound onTriggerStart for " + this.sceneObject.name);
                return;
            }
            if (interactable.onTriggerEnd) {
                interactable.onTriggerEnd.add(() => {
                    this.forwardClick();
                });
                print("NodeClickForwarder bound onTriggerEnd for " + this.sceneObject.name);
                return;
            }
            print("NodeClickForwarder ERROR: No usable trigger event on " + this.sceneObject.name);
        }
        findInteractableOnThisObject() {
            var components = this.sceneObject.getComponents("Component.ScriptComponent");
            for (var i = 0; i < components.length; i++) {
                var comp = components[i];
                if (comp.onTriggerStart || comp.onTriggerEnd) {
                    return comp;
                }
            }
            return null;
        }
        forwardClick() {
            print("FORWARD CLICK CALLED ON " + this.sceneObject.name);
            if (!TreeManager_1.TreeManager.instance) {
                print("TreeManager.instance missing");
                return;
            }
            var nodePath = this.getNodePath();
            if (nodePath == "") {
                print("No node path found on " + this.sceneObject.name);
                return;
            }
            print("CLICKED NODE: " + nodePath);
            TreeManager_1.TreeManager.instance.onNodeClicked(nodePath);
        }
        getNodePath() {
            var prefix = "NODE__";
            var objName = this.sceneObject.name;
            if (objName.indexOf(prefix) == 0) {
                return objName.substring(prefix.length);
            }
            return "";
        }
    };
    __setFunctionName(_classThis, "NodeClickForwarder");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NodeClickForwarder = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NodeClickForwarder = _classThis;
})();
exports.NodeClickForwarder = NodeClickForwarder;
//# sourceMappingURL=NodeClickForwarder.js.map