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
let CondenseCreate = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var CondenseCreate = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.interactable = this.interactable;
            this.boxTemplate = this.boxTemplate;
            this.nodeId = this.nodeId;
            this.verticalSpacing = this.verticalSpacing;
            this.horizontalSpacing = this.horizontalSpacing;
            this.treeData = {
                "root": {
                    label: "Root",
                    children: [
                        { id: "frontend", label: "Frontend" },
                        { id: "backend", label: "Backend" },
                        { id: "cloud", label: "Cloud" }
                    ]
                },
                "frontend": {
                    label: "Frontend",
                    children: [
                        { id: "react", label: "React" },
                        { id: "css", label: "CSS" }
                    ]
                },
                "backend": {
                    label: "Backend",
                    children: [
                        { id: "api", label: "API" },
                        { id: "database", label: "Database" },
                        { id: "auth", label: "Auth" }
                    ]
                },
                "cloud": {
                    label: "Cloud",
                    children: [
                        { id: "digitalocean", label: "DigitalOcean" },
                        { id: "cloudflare", label: "Cloudflare" }
                    ]
                },
                "react": {
                    label: "React",
                    children: []
                },
                "css": {
                    label: "CSS",
                    children: []
                },
                "api": {
                    label: "API",
                    children: []
                },
                "database": {
                    label: "Database",
                    children: []
                },
                "auth": {
                    label: "Auth",
                    children: []
                },
                "digitalocean": {
                    label: "DigitalOcean",
                    children: []
                },
                "cloudflare": {
                    label: "Cloudflare",
                    children: []
                }
            };
        }
        __initialize() {
            super.__initialize();
            this.interactable = this.interactable;
            this.boxTemplate = this.boxTemplate;
            this.nodeId = this.nodeId;
            this.verticalSpacing = this.verticalSpacing;
            this.horizontalSpacing = this.horizontalSpacing;
            this.treeData = {
                "root": {
                    label: "Root",
                    children: [
                        { id: "frontend", label: "Frontend" },
                        { id: "backend", label: "Backend" },
                        { id: "cloud", label: "Cloud" }
                    ]
                },
                "frontend": {
                    label: "Frontend",
                    children: [
                        { id: "react", label: "React" },
                        { id: "css", label: "CSS" }
                    ]
                },
                "backend": {
                    label: "Backend",
                    children: [
                        { id: "api", label: "API" },
                        { id: "database", label: "Database" },
                        { id: "auth", label: "Auth" }
                    ]
                },
                "cloud": {
                    label: "Cloud",
                    children: [
                        { id: "digitalocean", label: "DigitalOcean" },
                        { id: "cloudflare", label: "Cloudflare" }
                    ]
                },
                "react": {
                    label: "React",
                    children: []
                },
                "css": {
                    label: "CSS",
                    children: []
                },
                "api": {
                    label: "API",
                    children: []
                },
                "database": {
                    label: "Database",
                    children: []
                },
                "auth": {
                    label: "Auth",
                    children: []
                },
                "digitalocean": {
                    label: "DigitalOcean",
                    children: []
                },
                "cloudflare": {
                    label: "Cloudflare",
                    children: []
                }
            };
        }
        onAwake() {
            this.createEvent("OnStartEvent").bind(() => {
                this.onStart();
            });
        }
        onStart() {
            if (!this.interactable) {
                print("ERROR: Missing Interactable on " + this.getSceneObject().name);
                return;
            }
            if (!this.boxTemplate) {
                print("ERROR: Missing BoxTemplate on " + this.getSceneObject().name);
                return;
            }
            print("Tree node ready: " + this.nodeId);
            this.interactable.onTriggerStart.add(() => {
                this.toggleNode();
            });
        }
        toggleNode() {
            var existingChild = this.findDirectGeneratedChild();
            if (existingChild) {
                this.closeNode();
            }
            else {
                this.openNode();
            }
        }
        openNode() {
            var node = this.treeData[this.nodeId];
            if (!node) {
                print("No tree data found for node: " + this.nodeId);
                return;
            }
            if (node.children.length === 0) {
                print("Leaf node. No children for: " + this.nodeId);
                return;
            }
            var myPos = this.getSceneObject().getTransform().getWorldPosition();
            var parent = this.getSceneObject().getParent();
            var count = node.children.length;
            var totalWidth = (count - 1) * this.horizontalSpacing;
            var startX = myPos.x - totalWidth / 2;
            for (var i = 0; i < count; i++) {
                var childData = node.children[i];
                var newBox = this.boxTemplate.copyWholeHierarchy(parent);
                newBox.name = "GeneratedNode_" + childData.id + "_" + CondenseCreate.nextId;
                CondenseCreate.nextId++;
                newBox.enabled = true;
                newBox.getTransform().setWorldPosition(new vec3(startX + i * this.horizontalSpacing, myPos.y + this.verticalSpacing, myPos.z));
                newBox.getTransform().setLocalScale(new vec3(1, 1, 1));
                var childScript = newBox.getComponent(CondenseCreate.getTypeName());
                if (childScript) {
                    childScript.nodeId = childData.id;
                    childScript.boxTemplate = this.boxTemplate;
                }
                print("Created child node: " + childData.label);
            }
        }
        closeNode() {
            for (var i = this.getSceneObject().getParent().getChildrenCount() - 1; i >= 0; i--) {
                var child = this.getSceneObject().getParent().getChild(i);
                if (child.name.indexOf("GeneratedNode_") === 0) {
                    var childPos = child.getTransform().getWorldPosition();
                    var myPos = this.getSceneObject().getTransform().getWorldPosition();
                    if (childPos.y > myPos.y) {
                        child.destroy();
                    }
                }
            }
            print("Closed node: " + this.nodeId);
        }
        findDirectGeneratedChild() {
            var parent = this.getSceneObject().getParent();
            var myPos = this.getSceneObject().getTransform().getWorldPosition();
            for (var i = 0; i < parent.getChildrenCount(); i++) {
                var child = parent.getChild(i);
                if (child.name.indexOf("GeneratedNode_") === 0) {
                    var childPos = child.getTransform().getWorldPosition();
                    if (childPos.y > myPos.y) {
                        return child;
                    }
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