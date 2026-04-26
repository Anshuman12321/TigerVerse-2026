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
            this.rootInteractable = this.rootInteractable;
            this.boxTemplate = this.boxTemplate;
            this.treeRoot = this.treeRoot;
            this.verticalSpacing = this.verticalSpacing;
            this.horizontalSpacing = this.horizontalSpacing;
            this.nodeObjects = {};
            this.treeData = {
                root: {
                    label: "Root",
                    children: ["frontend", "backend", "cloud"]
                },
                frontend: {
                    label: "Frontend",
                    children: ["react", "css"]
                },
                backend: {
                    label: "Backend",
                    children: ["api", "database", "auth"]
                },
                cloud: {
                    label: "Cloud",
                    children: ["digitalocean", "cloudflare"]
                },
                react: {
                    label: "React",
                    children: []
                },
                css: {
                    label: "CSS",
                    children: []
                },
                api: {
                    label: "API",
                    children: []
                },
                database: {
                    label: "Database",
                    children: []
                },
                auth: {
                    label: "Auth",
                    children: []
                },
                digitalocean: {
                    label: "DigitalOcean",
                    children: []
                },
                cloudflare: {
                    label: "Cloudflare",
                    children: []
                }
            };
        }
        __initialize() {
            super.__initialize();
            this.rootInteractable = this.rootInteractable;
            this.boxTemplate = this.boxTemplate;
            this.treeRoot = this.treeRoot;
            this.verticalSpacing = this.verticalSpacing;
            this.horizontalSpacing = this.horizontalSpacing;
            this.nodeObjects = {};
            this.treeData = {
                root: {
                    label: "Root",
                    children: ["frontend", "backend", "cloud"]
                },
                frontend: {
                    label: "Frontend",
                    children: ["react", "css"]
                },
                backend: {
                    label: "Backend",
                    children: ["api", "database", "auth"]
                },
                cloud: {
                    label: "Cloud",
                    children: ["digitalocean", "cloudflare"]
                },
                react: {
                    label: "React",
                    children: []
                },
                css: {
                    label: "CSS",
                    children: []
                },
                api: {
                    label: "API",
                    children: []
                },
                database: {
                    label: "Database",
                    children: []
                },
                auth: {
                    label: "Auth",
                    children: []
                },
                digitalocean: {
                    label: "DigitalOcean",
                    children: []
                },
                cloudflare: {
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
            if (!this.rootInteractable) {
                print("ERROR: Root Interactable is missing.");
                return;
            }
            if (!this.boxTemplate) {
                print("ERROR: BoxTemplate is missing.");
                return;
            }
            if (!this.treeRoot) {
                print("ERROR: Tree Root is missing.");
                return;
            }
            this.setNodeLabel(this.getSceneObject(), this.treeData["root"].label);
            this.buildWholeTree();
            this.rootInteractable.onTriggerStart.add(() => {
                this.toggleNode("root");
            });
            print("Tree ready.");
        }
        buildWholeTree() {
            var rootPos = this.getSceneObject().getTransform().getWorldPosition();
            this.createChildrenForNode("root", rootPos.x, rootPos.y, rootPos.z);
        }
        createChildrenForNode(parentId, parentX, parentY, parentZ) {
            var parentNode = this.treeData[parentId];
            if (!parentNode || parentNode.children.length === 0) {
                return;
            }
            var childCount = parentNode.children.length;
            var totalWidth = (childCount - 1) * this.horizontalSpacing;
            var startX = parentX - totalWidth / 2;
            for (var i = 0; i < childCount; i++) {
                var childId = parentNode.children[i];
                var childNode = this.treeData[childId];
                var childX = startX + i * this.horizontalSpacing;
                var childY = parentY + this.verticalSpacing;
                var childZ = parentZ;
                var newBox = this.boxTemplate.copyWholeHierarchy(this.treeRoot);
                newBox.name = "TreeNode_" + childId;
                newBox.enabled = false;
                newBox.getTransform().setWorldPosition(new vec3(childX, childY, childZ));
                newBox.getTransform().setLocalScale(new vec3(1, 1, 1));
                this.setNodeLabel(newBox, childNode.label);
                this.nodeObjects[childId] = newBox;
                this.bindNodeClick(newBox, childId);
                this.createChildrenForNode(childId, childX, childY, childZ);
            }
        }
        bindNodeClick(nodeObject, nodeId) {
            var interactable = nodeObject.getComponent(Interactable_1.Interactable.getTypeName());
            if (!interactable) {
                print("WARNING: No Interactable on " + nodeObject.name);
                return;
            }
            interactable.onTriggerStart.add(() => {
                this.toggleNode(nodeId);
            });
        }
        toggleNode(nodeId) {
            var node = this.treeData[nodeId];
            if (!node || node.children.length === 0) {
                print("Leaf node clicked: " + nodeId);
                return;
            }
            if (this.areDirectChildrenVisible(nodeId)) {
                this.hideChildrenRecursive(nodeId);
            }
            else {
                this.showDirectChildren(nodeId);
            }
        }
        showDirectChildren(nodeId) {
            var node = this.treeData[nodeId];
            for (var i = 0; i < node.children.length; i++) {
                var childId = node.children[i];
                var childObject = this.nodeObjects[childId];
                if (childObject) {
                    childObject.enabled = true;
                }
            }
            print("Opened " + nodeId);
        }
        hideChildrenRecursive(nodeId) {
            var node = this.treeData[nodeId];
            for (var i = 0; i < node.children.length; i++) {
                var childId = node.children[i];
                var childObject = this.nodeObjects[childId];
                this.hideChildrenRecursive(childId);
                if (childObject) {
                    childObject.enabled = false;
                }
            }
            print("Closed " + nodeId);
        }
        areDirectChildrenVisible(nodeId) {
            var node = this.treeData[nodeId];
            if (!node || node.children.length === 0) {
                return false;
            }
            var firstChildId = node.children[0];
            var firstChildObject = this.nodeObjects[firstChildId];
            return firstChildObject && firstChildObject.enabled;
        }
        setNodeLabel(box, label) {
            var labelObject = this.findChildByName(box, "NodeLabel");
            if (!labelObject) {
                return;
            }
            var textComponent = labelObject.getComponent("Component.Text");
            if (!textComponent) {
                return;
            }
            textComponent.text = label;
        }
        findChildByName(parent, childName) {
            for (var i = 0; i < parent.getChildrenCount(); i++) {
                var child = parent.getChild(i);
                if (child.name === childName) {
                    return child;
                }
                var found = this.findChildByName(child, childName);
                if (found) {
                    return found;
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
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CondenseCreate = _classThis;
})();
exports.CondenseCreate = CondenseCreate;
//# sourceMappingURL=CondenseCreate.js.map