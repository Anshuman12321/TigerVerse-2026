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
            this.boxTemplate = this.boxTemplate;
            this.nodeId = this.nodeId;
            this.forwardSpacing = this.forwardSpacing;
            this.horizontalSpacing = this.horizontalSpacing;
            this.treeData = {
                project: {
                    label: "Project",
                    children: ["frontend", "backend", "database"]
                },
                frontend: {
                    label: "Frontend",
                    children: ["frontend_file_one", "frontend_file_two"]
                },
                backend: {
                    label: "Backend",
                    children: ["backend_file_one", "backend_file_two"]
                },
                database: {
                    label: "Database",
                    children: ["database_file_one"]
                },
                frontend_file_one: {
                    label: "file one",
                    children: []
                },
                frontend_file_two: {
                    label: "file two",
                    children: []
                },
                backend_file_one: {
                    label: "file one",
                    children: []
                },
                backend_file_two: {
                    label: "file two",
                    children: []
                },
                database_file_one: {
                    label: "file one",
                    children: []
                }
            };
        }
        __initialize() {
            super.__initialize();
            this.boxTemplate = this.boxTemplate;
            this.nodeId = this.nodeId;
            this.forwardSpacing = this.forwardSpacing;
            this.horizontalSpacing = this.horizontalSpacing;
            this.treeData = {
                project: {
                    label: "Project",
                    children: ["frontend", "backend", "database"]
                },
                frontend: {
                    label: "Frontend",
                    children: ["frontend_file_one", "frontend_file_two"]
                },
                backend: {
                    label: "Backend",
                    children: ["backend_file_one", "backend_file_two"]
                },
                database: {
                    label: "Database",
                    children: ["database_file_one"]
                },
                frontend_file_one: {
                    label: "file one",
                    children: []
                },
                frontend_file_two: {
                    label: "file two",
                    children: []
                },
                backend_file_one: {
                    label: "file one",
                    children: []
                },
                backend_file_two: {
                    label: "file two",
                    children: []
                },
                database_file_one: {
                    label: "file one",
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
            this.readNodeIdFromName();
            this.interactable = this.getSceneObject().getComponent(Interactable_1.Interactable.getTypeName());
            if (!this.interactable) {
                print("ERROR: No Interactable on " + this.getSceneObject().name);
                return;
            }
            if (!this.boxTemplate) {
                print("ERROR: Missing BoxTemplate on " + this.getSceneObject().name);
                return;
            }
            this.setLabelOnBox(this.getSceneObject(), this.getCurrentLabel());
            print("Ready: " + this.getSceneObject().name + " nodeId=" + this.nodeId);
            this.interactable.onTriggerStart.add(() => {
                this.readNodeIdFromName();
                this.toggleFolder();
            });
        }
        toggleFolder() {
            if (this.hasOpenChildren()) {
                this.closeFolder();
            }
            else {
                this.openFolder();
            }
        }
        openFolder() {
            var node = this.treeData[this.nodeId];
            if (!node) {
                print("ERROR: No JSON node for " + this.nodeId);
                return;
            }
            if (node.children.length === 0) {
                print("Leaf node clicked: " + this.nodeId);
                return;
            }
            var count = node.children.length;
            var totalWidth = (count - 1) * this.horizontalSpacing;
            var startX = -totalWidth / 2;
            for (var i = 0; i < count; i++) {
                var childId = node.children[i];
                var childNode = this.treeData[childId];
                if (!childNode) {
                    print("ERROR: Missing JSON entry for " + childId);
                    continue;
                }
                var newBox = this.boxTemplate.copyWholeHierarchy(this.getSceneObject());
                newBox.name = "TreeNode__" + childId + "__" + CondenseCreate.nextId;
                CondenseCreate.nextId++;
                newBox.enabled = true;
                // X = left/right
                // Z = forward/above on the surface
                // Y = height, so keep it 0
                newBox.getTransform().setLocalPosition(new vec3(startX + i * this.horizontalSpacing, 0, -this.forwardSpacing));
                newBox.getTransform().setLocalScale(new vec3(1, 1, 1));
                this.setLabelOnBox(newBox, childNode.label);
                print("Created child: " + childNode.label + " under " + this.nodeId);
            }
        }
        closeFolder() {
            for (var i = this.getSceneObject().getChildrenCount() - 1; i >= 0; i--) {
                var child = this.getSceneObject().getChild(i);
                if (this.isTreeNode(child)) {
                    child.destroy();
                }
            }
            print("Closed folder: " + this.nodeId);
        }
        hasOpenChildren() {
            for (var i = 0; i < this.getSceneObject().getChildrenCount(); i++) {
                var child = this.getSceneObject().getChild(i);
                if (this.isTreeNode(child)) {
                    return true;
                }
            }
            return false;
        }
        isTreeNode(obj) {
            return obj.name.indexOf("TreeNode__") === 0 || obj.name.indexOf("TreeNode_") === 0;
        }
        readNodeIdFromName() {
            var name = this.getSceneObject().name;
            if (name.indexOf("TreeNode__") === 0) {
                var parts = name.split("__");
                if (parts.length >= 3) {
                    this.nodeId = parts[1];
                }
                return;
            }
            if (name.indexOf("TreeNode_") === 0) {
                var withoutPrefix = name.replace("TreeNode_", "");
                var lastUnderscore = withoutPrefix.lastIndexOf("_");
                if (lastUnderscore > -1) {
                    this.nodeId = withoutPrefix.substring(0, lastUnderscore);
                }
            }
        }
        getCurrentLabel() {
            var node = this.treeData[this.nodeId];
            if (node) {
                return node.label;
            }
            return this.nodeId;
        }
        setLabelOnBox(box, label) {
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
    })();
    _classThis.nextId = 0;
    (() => {
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CondenseCreate = _classThis;
})();
exports.CondenseCreate = CondenseCreate;
//# sourceMappingURL=CondenseCreate.js.map