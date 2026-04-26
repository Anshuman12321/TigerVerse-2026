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
            this.interactable = this.interactable;
            this.nodeData = this.nodeData;
            this.ready = false;
        }
        __initialize() {
            super.__initialize();
            this.interactable = this.interactable;
            this.nodeData = this.nodeData;
            this.ready = false;
        }
        onAwake() {
            this.createEvent("OnStartEvent").bind(() => {
                this.onStart();
            });
        }
        onStart() {
            if (!this.interactable) {
                print("ERROR: NodeClickForwarder missing Interactable on " + this.getSceneObject().name);
                return;
            }
            if (!this.nodeData) {
                print("ERROR: NodeClickForwarder missing TreeNodeData on " + this.getSceneObject().name);
                return;
            }
            // Template should not respond to clicks.
            if (this.getSceneObject().name === "BoxTemplate") {
                return;
            }
            var delay = this.createEvent("DelayedCallbackEvent");
            delay.bind(() => {
                this.ready = true;
            });
            delay.reset(0.25);
            this.interactable.onTriggerEnd.add(() => {
                if (!this.ready) {
                    return;
                }
                if (!TreeManager_1.TreeManager.instance) {
                    print("ERROR: TreeManager instance not found.");
                    return;
                }
                TreeManager_1.TreeManager.instance.onGeneratedNodeClicked(this.nodeData.uid);
            });
            print("NODE READY: " + this.nodeData.label + " uid=" + this.nodeData.uid + " nodeId=" + this.nodeData.nodeId);
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