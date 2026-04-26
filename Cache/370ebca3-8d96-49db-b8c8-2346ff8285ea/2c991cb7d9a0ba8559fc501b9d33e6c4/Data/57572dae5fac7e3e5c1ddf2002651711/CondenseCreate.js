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
            this.treeRoot = this.treeRoot;
            this.horizontalSpacing = this.horizontalSpacing;
            this.forwardSpacingZ = this.forwardSpacingZ;
            this.heightOffsetY = this.heightOffsetY;
            this.rootUid = "root";
            this.rootNodeId = "project";
            this.nextUid = 0;
            this.clickLocked = false;
            this.createdNodes = {};
            this.openedChildren = {};
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
            this.treeRoot = this.treeRoot;
            this.horizontalSpacing = this.horizontalSpacing;
            this.forwardSpacingZ = this.forwardSpacingZ;
            this.heightOffsetY = this.heightOffsetY;
            this.rootUid = "root";
            this.rootNodeId = "project";
            this.nextUid = 0;
            this.clickLocked = false;
            this.createdNodes = {};
            this.openedChildren = {};
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
            if (!this.boxTemplate) {
                print("ERROR: BoxTemplate is missing.");
                return;
            }
            if (!this.treeRoot) {
                print("ERROR: Tree Root is missing.");
                return;
            }
            this.setLabelOnBox(this.getSceneObject(), this.treeData[this.rootNodeId].label);
            var rootInteractable = this.getSceneObject().getComponent(Interactable_1.Interactable.getTypeName());
            if (!rootInteractable) {
                print("ERROR: SquareButtonBox needs an Interactable.");
                return;
            }
            rootInteractable.onTriggerEnd.add(() => {
                this.handleNodeClick(this.rootUid, this.rootNodeId, this.getSceneObject());
            });
            print("TREE MANAGER READY");
        }
        handleNodeClick(uid, nodeId, nodeObject) {
            if (this.clickLocked) {
                return;
            }
            this.clickLocked = true;
            print("CLICKED NODE: " + nodeId + " uid=" + uid);
            if (this.isOpen(uid)) {
                this.closeNode(uid);
            }
            else {
                this.openNode(uid, nodeId, nodeObject);
            }
            var delay = this.createEvent("DelayedCallbackEvent");
            delay.bind(() => {
                this.clickLocked = false;
            });
            delay.reset(0.3);
        }
        openNode(parentUid, nodeId, parentObject) {
            var node = this.treeData[nodeId];
            if (!node) {
                print("ERROR: No JSON data for " + nodeId);
                return;
            }
            if (node.children.length === 0) {
                print("Leaf node: " + nodeId);
                return;
            }
            var parentPos = parentObject.getTransform().getWorldPosition();
            var count = node.children.length;
            var totalWidth = (count - 1) * this.horizontalSpacing;
            var startX = parentPos.x - totalWidth / 2;
            var childUids = [];
            for (var i = 0; i < count; i++) {
                var childNodeId = node.children[i];
                var childData = this.treeData[childNodeId];
                if (!childData) {
                    print("ERROR: Missing JSON child: " + childNodeId);
                    continue;
                }
                var childUid = "node_" + this.nextUid;
                this.nextUid++;
                var newBox = this.boxTemplate.copyWholeHierarchy(this.treeRoot);
                newBox.name = "TreeNode_" + childNodeId + "_" + childUid;
                newBox.enabled = true;
                newBox.getTransform().setWorldPosition(new vec3(startX + i * this.horizontalSpacing, parentPos.y + this.heightOffsetY, parentPos.z + this.forwardSpacingZ));
                newBox.getTransform().setLocalScale(new vec3(1, 1, 1));
                this.setLabelOnBox(newBox, childData.label);
                this.createdNodes[childUid] = newBox;
                childUids.push(childUid);
                this.bindGeneratedNodeDelayed(newBox, childUid, childNodeId, 0);
                print("CREATED: " + childData.label + " nodeId=" + childNodeId + " uid=" + childUid);
            }
            this.openedChildren[parentUid] = childUids;
        }
        bindGeneratedNodeDelayed(nodeObject, uid, nodeId, attempt) {
            var delay = this.createEvent("DelayedCallbackEvent");
            delay.bind(() => {
                var interactable = nodeObject.getComponent(Interactable_1.Interactable.getTypeName());
                if (interactable) {
                    interactable.onTriggerEnd.add(() => {
                        this.handleNodeClick(uid, nodeId, nodeObject);
                    });
                    print("BOUND CLICK: " + nodeObject.name + " nodeId=" + nodeId);
                    return;
                }
                if (attempt < 5) {
                    this.bindGeneratedNodeDelayed(nodeObject, uid, nodeId, attempt + 1);
                }
                else {
                    print("ERROR: Still no Interactable after retry: " + nodeObject.name);
                }
            });
            delay.reset(0.05);
        }
        closeNode(uid) {
            var children = this.openedChildren[uid];
            if (!children) {
                return;
            }
            for (var i = 0; i < children.length; i++) {
                var childUid = children[i];
                this.closeNode(childUid);
                var childObject = this.createdNodes[childUid];
                if (childObject && !isNull(childObject)) {
                    print("DELETING: " + childObject.name);
                    childObject.destroy();
                }
                delete this.createdNodes[childUid];
            }
            delete this.openedChildren[uid];
            print("CLOSED uid=" + uid);
        }
        isOpen(uid) {
            return this.openedChildren[uid] !== undefined;
        }
        resetTree() {
            this.closeNode(this.rootUid);
            this.createdNodes = {};
            this.openedChildren = {};
            this.nextUid = 0;
            print("TREE RESET COMPLETE");
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
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CondenseCreate = _classThis;
})();
exports.CondenseCreate = CondenseCreate;
//# sourceMappingURL=CondenseCreate.js.map