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
            this.nodeId = this.nodeId;
            this.horizontalSpacing = this.horizontalSpacing;
            this.forwardSpacingZ = this.forwardSpacingZ;
            this.heightOffsetY = this.heightOffsetY;
            this.isClickLocked = false;
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
            this.nodeId = this.nodeId;
            this.horizontalSpacing = this.horizontalSpacing;
            this.forwardSpacingZ = this.forwardSpacingZ;
            this.heightOffsetY = this.heightOffsetY;
            this.isClickLocked = false;
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
            this.interactable = this.getSceneObject().getComponent(Interactable_1.Interactable.getTypeName());
            if (!this.interactable) {
                print("ERROR: No Interactable on " + this.getSceneObject().name);
                return;
            }
            if (!this.boxTemplate) {
                print("ERROR: Missing BoxTemplate on " + this.getSceneObject().name);
                return;
            }
            if (!this.treeRoot) {
                print("ERROR: Missing Tree Root on " + this.getSceneObject().name);
                return;
            }
            var info = this.getMyInfo();
            this.nodeId = info.nodeId;
            this.setLabelOnBox(this.getSceneObject(), this.getLabel(this.nodeId));
            print("READY: " + this.getSceneObject().name + " nodeId=" + this.nodeId + " uid=" + info.uid);
            // IMPORTANT:
            // Use onTriggerEnd, not onTriggerStart.
            // This prevents one pinch/click from firing repeatedly.
            this.interactable.onTriggerEnd.add(() => {
                this.handleClick();
            });
        }
        handleClick() {
            if (this.isClickLocked) {
                return;
            }
            this.isClickLocked = true;
            var info = this.getMyInfo();
            this.nodeId = info.nodeId;
            print("CLICKED: " + this.getSceneObject().name + " nodeId=" + info.nodeId + " uid=" + info.uid);
            if (this.hasDirectChildren(info.uid)) {
                this.closeChildren(info.uid);
            }
            else {
                this.openChildren(info);
            }
            var delay = this.createEvent("DelayedCallbackEvent");
            delay.bind(() => {
                this.isClickLocked = false;
            });
            delay.reset(0.35);
        }
        openChildren(info) {
            var node = this.treeData[info.nodeId];
            if (!node) {
                print("ERROR: No JSON node for " + info.nodeId);
                return;
            }
            if (node.children.length === 0) {
                print("Leaf node clicked: " + info.nodeId);
                return;
            }
            var myPos = this.getSceneObject().getTransform().getWorldPosition();
            var count = node.children.length;
            var totalWidth = (count - 1) * this.horizontalSpacing;
            var startX = myPos.x - totalWidth / 2;
            for (var i = 0; i < count; i++) {
                var childId = node.children[i];
                var childNode = this.treeData[childId];
                if (!childNode) {
                    print("ERROR: Missing JSON entry for " + childId);
                    continue;
                }
                var childUid = "" + CondenseCreate.nextUid;
                CondenseCreate.nextUid++;
                var newBox = this.boxTemplate.copyWholeHierarchy(this.treeRoot);
                // Format:
                // TreeNode__uid__parentUid__nodeId
                newBox.name = "TreeNode__" + childUid + "__" + info.uid + "__" + childId;
                newBox.enabled = true;
                newBox.getTransform().setWorldPosition(new vec3(startX + i * this.horizontalSpacing, myPos.y + this.heightOffsetY, myPos.z + this.forwardSpacingZ));
                newBox.getTransform().setLocalScale(new vec3(1, 1, 1));
                this.setLabelOnBox(newBox, childNode.label);
                print("CREATED: " + childNode.label + " nodeId=" + childId + " uid=" + childUid + " parent=" + info.uid);
            }
        }
        closeChildren(parentUid) {
            for (var i = this.treeRoot.getChildrenCount() - 1; i >= 0; i--) {
                var child = this.treeRoot.getChild(i);
                var info = this.parseNodeInfo(child.name);
                if (info.isGenerated && info.parentUid === parentUid) {
                    this.deleteNodeAndDescendants(info.uid);
                }
            }
            print("CLOSED children of uid=" + parentUid);
        }
        deleteNodeAndDescendants(uid) {
            // First delete children of this node
            for (var i = this.treeRoot.getChildrenCount() - 1; i >= 0; i--) {
                var child = this.treeRoot.getChild(i);
                var info = this.parseNodeInfo(child.name);
                if (info.isGenerated && info.parentUid === uid) {
                    this.deleteNodeAndDescendants(info.uid);
                }
            }
            // Then delete this node
            for (var j = this.treeRoot.getChildrenCount() - 1; j >= 0; j--) {
                var possible = this.treeRoot.getChild(j);
                var possibleInfo = this.parseNodeInfo(possible.name);
                if (possibleInfo.isGenerated && possibleInfo.uid === uid) {
                    possible.destroy();
                }
            }
        }
        hasDirectChildren(parentUid) {
            for (var i = 0; i < this.treeRoot.getChildrenCount(); i++) {
                var child = this.treeRoot.getChild(i);
                var info = this.parseNodeInfo(child.name);
                if (info.isGenerated && info.parentUid === parentUid) {
                    return true;
                }
            }
            return false;
        }
        getMyInfo() {
            var info = this.parseNodeInfo(this.getSceneObject().name);
            if (info.isGenerated) {
                return info;
            }
            return {
                isGenerated: false,
                uid: "root",
                parentUid: "",
                nodeId: this.nodeId
            };
        }
        parseNodeInfo(name) {
            var prefix = "TreeNode__";
            if (name.indexOf(prefix) !== 0) {
                return {
                    isGenerated: false,
                    uid: "",
                    parentUid: "",
                    nodeId: ""
                };
            }
            var parts = name.split("__");
            return {
                isGenerated: true,
                uid: parts[1],
                parentUid: parts[2],
                nodeId: parts[3]
            };
        }
        getLabel(id) {
            var node = this.treeData[id];
            if (node) {
                return node.label;
            }
            return id;
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
    _classThis.nextUid = 0;
    (() => {
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CondenseCreate = _classThis;
})();
exports.CondenseCreate = CondenseCreate;
//# sourceMappingURL=CondenseCreate.js.map