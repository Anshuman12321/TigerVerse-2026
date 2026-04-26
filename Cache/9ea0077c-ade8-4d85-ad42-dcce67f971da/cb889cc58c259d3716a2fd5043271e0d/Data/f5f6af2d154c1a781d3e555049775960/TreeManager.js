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
exports.TreeManager = void 0;
var __selfType = requireType("./TreeManager");
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
let TreeManager = (() => {
    let _classDecorators = [component];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseScriptComponent;
    var TreeManager = _classThis = class extends _classSuper {
        constructor() {
            super();
            this.rootBox = this.rootBox;
            this.rootInteractable = this.rootInteractable;
            this.boxTemplate = this.boxTemplate;
            this.treeRoot = this.treeRoot;
            this.horizontalSpacing = this.horizontalSpacing;
            this.forwardSpacingZ = this.forwardSpacingZ;
            this.heightOffsetY = this.heightOffsetY;
            this.nextUid = 0;
            this.clickLocked = false;
            this.createdNodes = {};
            this.openedChildren = {};
            this.rootUid = "root";
            this.fileTree = {
                id: "project",
                label: "Project",
                type: "folder",
                children: [
                    {
                        id: "frontend",
                        label: "Frontend",
                        type: "folder",
                        children: [
                            { id: "frontend_file_one", label: "file one", type: "file" },
                            { id: "frontend_file_two", label: "file two", type: "file" }
                        ]
                    },
                    {
                        id: "backend",
                        label: "Backend",
                        type: "folder",
                        children: [
                            { id: "backend_file_one", label: "file one", type: "file" },
                            { id: "backend_file_two", label: "file two", type: "file" }
                        ]
                    },
                    {
                        id: "database",
                        label: "Database",
                        type: "folder",
                        children: [
                            { id: "database_file_one", label: "file one", type: "file" }
                        ]
                    }
                ]
            };
        }
        __initialize() {
            super.__initialize();
            this.rootBox = this.rootBox;
            this.rootInteractable = this.rootInteractable;
            this.boxTemplate = this.boxTemplate;
            this.treeRoot = this.treeRoot;
            this.horizontalSpacing = this.horizontalSpacing;
            this.forwardSpacingZ = this.forwardSpacingZ;
            this.heightOffsetY = this.heightOffsetY;
            this.nextUid = 0;
            this.clickLocked = false;
            this.createdNodes = {};
            this.openedChildren = {};
            this.rootUid = "root";
            this.fileTree = {
                id: "project",
                label: "Project",
                type: "folder",
                children: [
                    {
                        id: "frontend",
                        label: "Frontend",
                        type: "folder",
                        children: [
                            { id: "frontend_file_one", label: "file one", type: "file" },
                            { id: "frontend_file_two", label: "file two", type: "file" }
                        ]
                    },
                    {
                        id: "backend",
                        label: "Backend",
                        type: "folder",
                        children: [
                            { id: "backend_file_one", label: "file one", type: "file" },
                            { id: "backend_file_two", label: "file two", type: "file" }
                        ]
                    },
                    {
                        id: "database",
                        label: "Database",
                        type: "folder",
                        children: [
                            { id: "database_file_one", label: "file one", type: "file" }
                        ]
                    }
                ]
            };
        }
        onAwake() {
            TreeManager.instance = this;
            this.createEvent("OnStartEvent").bind(() => {
                this.onStart();
            });
        }
        onStart() {
            if (!this.rootBox) {
                print("ERROR: Root Box is missing.");
                return;
            }
            if (!this.rootInteractable) {
                print("ERROR: Root Interactable is missing.");
                return;
            }
            if (!this.boxTemplate) {
                print("ERROR: Box Template is missing.");
                return;
            }
            if (!this.treeRoot) {
                print("ERROR: Tree Root is missing.");
                return;
            }
            this.setLabel(this.rootBox, this.fileTree.label);
            this.rootInteractable.onTriggerEnd.add(() => {
                this.onNodeClicked(this.rootUid, this.fileTree, this.rootBox);
            });
            print("TREE MANAGER READY");
        }
        onGeneratedNodeClickedByName(objectName) {
            var uid = this.getUidFromName(objectName);
            if (uid === "") {
                print("ERROR: Could not read uid from " + objectName);
                return;
            }
            var created = this.createdNodes[uid];
            if (!created) {
                print("ERROR: No created node found for uid=" + uid + " name=" + objectName);
                return;
            }
            this.onNodeClicked(uid, created.data, created.object);
        }
        onNodeClicked(uid, data, obj) {
            if (this.clickLocked) {
                return;
            }
            this.clickLocked = true;
            print("CLICKED: " + data.label + " uid=" + uid + " nodeId=" + data.id);
            if (data.type === "file") {
                print("File clicked: " + data.label);
                this.unlockSoon();
                return;
            }
            if (this.isOpen(uid)) {
                this.closeNode(uid);
            }
            else {
                this.openNode(uid, data, obj);
            }
            this.unlockSoon();
        }
        openNode(parentUid, parentData, parentObject) {
            if (!parentData.children || parentData.children.length === 0) {
                return;
            }
            var parentPos = parentObject.getTransform().getWorldPosition();
            var count = parentData.children.length;
            var totalWidth = (count - 1) * this.horizontalSpacing;
            var startX = parentPos.x - totalWidth / 2;
            var childUids = [];
            for (var i = 0; i < count; i++) {
                var childData = parentData.children[i];
                var childUid = "node_" + this.nextUid;
                this.nextUid++;
                var newBox = this.boxTemplate.copyWholeHierarchy(this.treeRoot);
                newBox.name = "TreeNode__" + childUid + "__" + childData.id;
                newBox.enabled = true;
                newBox.getTransform().setWorldPosition(new vec3(startX + i * this.horizontalSpacing, parentPos.y + this.heightOffsetY, parentPos.z + this.forwardSpacingZ));
                newBox.getTransform().setLocalScale(new vec3(1, 1, 1));
                this.setLabel(newBox, childData.label);
                this.createdNodes[childUid] = {
                    uid: childUid,
                    data: childData,
                    object: newBox,
                    parentUid: parentUid
                };
                childUids.push(childUid);
                print("CREATED: " + childData.label + " uid=" + childUid + " nodeId=" + childData.id);
            }
            this.openedChildren[parentUid] = childUids;
        }
        closeNode(uid) {
            var children = this.openedChildren[uid];
            if (!children) {
                return;
            }
            for (var i = 0; i < children.length; i++) {
                var childUid = children[i];
                this.closeNode(childUid);
                var childNode = this.createdNodes[childUid];
                if (childNode && childNode.object && !isNull(childNode.object)) {
                    print("DELETING: " + childNode.data.label);
                    childNode.object.destroy();
                }
                delete this.createdNodes[childUid];
            }
            delete this.openedChildren[uid];
            print("CLOSED uid=" + uid);
        }
        resetTree() {
            this.closeNode(this.rootUid);
            this.createdNodes = {};
            this.openedChildren = {};
            this.nextUid = 0;
            print("TREE RESET COMPLETE");
        }
        isOpen(uid) {
            return this.openedChildren[uid] !== undefined;
        }
        unlockSoon() {
            var delay = this.createEvent("DelayedCallbackEvent");
            delay.bind(() => {
                this.clickLocked = false;
            });
            delay.reset(0.25);
        }
        getUidFromName(name) {
            var parts = name.split("__");
            if (parts.length >= 3) {
                return parts[1];
            }
            return "";
        }
        setLabel(obj, label) {
            var labelObject = this.findChildByName(obj, "NodeLabel");
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
    __setFunctionName(_classThis, "TreeManager");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TreeManager = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TreeManager = _classThis;
})();
exports.TreeManager = TreeManager;
//# sourceMappingURL=TreeManager.js.map