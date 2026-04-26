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
            this.boxTemplate = this.boxTemplate;
            this.treeRoot = this.treeRoot;
            // Good vertical defaults
            this.horizontalSpacing = this.horizontalSpacing;
            this.forwardSpacingZ = this.forwardSpacingZ;
            this.heightOffsetY = this.heightOffsetY;
            // Extra offset so child groups do not stack directly on top of each other
            this.branchSpacingX = this.branchSpacingX;
            this.showRootChildrenOnStart = this.showRootChildrenOnStart;
            this.hasBuilt = false;
            this.createdNodes = {};
            this.childPathsByParent = {};
            this.expandedState = {};
            this.data = {
                id: "root",
                label: "Project",
                children: [
                    {
                        id: "frontend",
                        label: "Frontend",
                        children: [
                            {
                                id: "components",
                                label: "Components",
                                children: [
                                    { id: "button", label: "Button" },
                                    { id: "navbar", label: "Navbar" },
                                    { id: "card", label: "Card" }
                                ]
                            },
                            {
                                id: "pages",
                                label: "Pages",
                                children: [
                                    { id: "home", label: "Home Page" },
                                    { id: "login", label: "Login Page" },
                                    { id: "dashboard", label: "Dashboard Page" }
                                ]
                            },
                            {
                                id: "styles",
                                label: "Styles",
                                children: [
                                    { id: "css", label: "CSS" },
                                    { id: "tailwind", label: "Tailwind" }
                                ]
                            }
                        ]
                    },
                    {
                        id: "backend",
                        label: "Backend",
                        children: [
                            {
                                id: "routes",
                                label: "Routes",
                                children: [
                                    { id: "authRoutes", label: "Auth Routes" },
                                    { id: "userRoutes", label: "User Routes" },
                                    { id: "postRoutes", label: "Post Routes" }
                                ]
                            },
                            {
                                id: "controllers",
                                label: "Controllers",
                                children: [
                                    { id: "authController", label: "Auth Controller" },
                                    { id: "userController", label: "User Controller" },
                                    { id: "postController", label: "Post Controller" }
                                ]
                            },
                            {
                                id: "middleware",
                                label: "Middleware",
                                children: [
                                    { id: "authMiddleware", label: "Auth Middleware" },
                                    { id: "errorMiddleware", label: "Error Middleware" }
                                ]
                            }
                        ]
                    },
                    {
                        id: "database",
                        label: "Database",
                        children: [
                            {
                                id: "models",
                                label: "Models",
                                children: [
                                    { id: "userModel", label: "User Model" },
                                    { id: "postModel", label: "Post Model" }
                                ]
                            },
                            {
                                id: "tables",
                                label: "Tables",
                                children: [
                                    { id: "usersTable", label: "Users Table" },
                                    { id: "postsTable", label: "Posts Table" }
                                ]
                            }
                        ]
                    }
                ]
            };
        }
        __initialize() {
            super.__initialize();
            this.rootBox = this.rootBox;
            this.boxTemplate = this.boxTemplate;
            this.treeRoot = this.treeRoot;
            // Good vertical defaults
            this.horizontalSpacing = this.horizontalSpacing;
            this.forwardSpacingZ = this.forwardSpacingZ;
            this.heightOffsetY = this.heightOffsetY;
            // Extra offset so child groups do not stack directly on top of each other
            this.branchSpacingX = this.branchSpacingX;
            this.showRootChildrenOnStart = this.showRootChildrenOnStart;
            this.hasBuilt = false;
            this.createdNodes = {};
            this.childPathsByParent = {};
            this.expandedState = {};
            this.data = {
                id: "root",
                label: "Project",
                children: [
                    {
                        id: "frontend",
                        label: "Frontend",
                        children: [
                            {
                                id: "components",
                                label: "Components",
                                children: [
                                    { id: "button", label: "Button" },
                                    { id: "navbar", label: "Navbar" },
                                    { id: "card", label: "Card" }
                                ]
                            },
                            {
                                id: "pages",
                                label: "Pages",
                                children: [
                                    { id: "home", label: "Home Page" },
                                    { id: "login", label: "Login Page" },
                                    { id: "dashboard", label: "Dashboard Page" }
                                ]
                            },
                            {
                                id: "styles",
                                label: "Styles",
                                children: [
                                    { id: "css", label: "CSS" },
                                    { id: "tailwind", label: "Tailwind" }
                                ]
                            }
                        ]
                    },
                    {
                        id: "backend",
                        label: "Backend",
                        children: [
                            {
                                id: "routes",
                                label: "Routes",
                                children: [
                                    { id: "authRoutes", label: "Auth Routes" },
                                    { id: "userRoutes", label: "User Routes" },
                                    { id: "postRoutes", label: "Post Routes" }
                                ]
                            },
                            {
                                id: "controllers",
                                label: "Controllers",
                                children: [
                                    { id: "authController", label: "Auth Controller" },
                                    { id: "userController", label: "User Controller" },
                                    { id: "postController", label: "Post Controller" }
                                ]
                            },
                            {
                                id: "middleware",
                                label: "Middleware",
                                children: [
                                    { id: "authMiddleware", label: "Auth Middleware" },
                                    { id: "errorMiddleware", label: "Error Middleware" }
                                ]
                            }
                        ]
                    },
                    {
                        id: "database",
                        label: "Database",
                        children: [
                            {
                                id: "models",
                                label: "Models",
                                children: [
                                    { id: "userModel", label: "User Model" },
                                    { id: "postModel", label: "Post Model" }
                                ]
                            },
                            {
                                id: "tables",
                                label: "Tables",
                                children: [
                                    { id: "usersTable", label: "Users Table" },
                                    { id: "postsTable", label: "Posts Table" }
                                ]
                            }
                        ]
                    }
                ]
            };
        }
        onAwake() {
            TreeManager.instance = this;
            if (this.hasBuilt) {
                return;
            }
            this.hasBuilt = true;
            this.buildTree();
        }
        buildTree() {
            if (!this.rootBox) {
                print("ERROR: Root Box not assigned");
                return;
            }
            if (!this.boxTemplate) {
                print("ERROR: Box Template not assigned");
                return;
            }
            if (!this.treeRoot) {
                print("ERROR: Tree Root not assigned");
                return;
            }
            this.createdNodes = {};
            this.childPathsByParent = {};
            this.expandedState = {};
            var rootPath = this.data.id;
            this.rootBox.name = "NODE__" + rootPath;
            this.rootBox.getTransform().setLocalPosition(new vec3(0, 0, 0));
            this.setLabel(this.rootBox, this.data.label);
            this.createdNodes[rootPath] = this.rootBox;
            this.childPathsByParent[rootPath] = [];
            this.expandedState[rootPath] = false;
            this.setVisible(this.rootBox, true);
            print("ROOT: " + this.data.label + " path=" + rootPath);
            if (this.data.children && this.data.children.length > 0) {
                this.createChildrenRecursive(this.data.children, rootPath, 1, 0);
            }
            if (this.showRootChildrenOnStart) {
                this.expandNode(rootPath);
            }
        }
        createChildrenRecursive(children, parentPath, depth, centerX) {
            var count = children.length;
            if (!this.childPathsByParent[parentPath]) {
                this.childPathsByParent[parentPath] = [];
            }
            var spread = this.horizontalSpacing + this.branchSpacingX / depth;
            var startX = centerX - ((count - 1) * spread) / 2;
            for (var i = 0; i < count; i++) {
                var child = children[i];
                var childPath = parentPath + "/" + child.id;
                var box = this.boxTemplate.instantiate(this.treeRoot);
                box.name = "NODE__" + childPath;
                var x = startX + i * spread;
                var y = depth * this.heightOffsetY;
                var z = depth * this.forwardSpacingZ;
                box.getTransform().setLocalPosition(new vec3(x, y, z));
                this.setLabel(box, child.label);
                this.setVisible(box, false);
                this.createdNodes[childPath] = box;
                this.childPathsByParent[parentPath].push(childPath);
                this.childPathsByParent[childPath] = [];
                this.expandedState[childPath] = false;
                print("CREATED: " +
                    child.label +
                    " path=" +
                    childPath +
                    " parent=" +
                    parentPath +
                    " depth=" +
                    depth +
                    " pos=(" +
                    x +
                    "," +
                    y +
                    "," +
                    z +
                    ")");
                if (child.children && child.children.length > 0) {
                    this.createChildrenRecursive(child.children, childPath, depth + 1, x);
                }
            }
        }
        onNodeClicked(nodePath) {
            if (!this.createdNodes[nodePath]) {
                print("CLICK IGNORED, UNKNOWN NODE: " + nodePath);
                return;
            }
            var children = this.childPathsByParent[nodePath];
            if (!children || children.length == 0) {
                print("LEAF NODE CLICKED: " + nodePath);
                return;
            }
            if (this.expandedState[nodePath]) {
                this.collapseNode(nodePath);
            }
            else {
                this.expandNode(nodePath);
            }
        }
        expandNode(nodePath) {
            var children = this.childPathsByParent[nodePath];
            if (!children) {
                return;
            }
            for (var i = 0; i < children.length; i++) {
                var childPath = children[i];
                var childObj = this.createdNodes[childPath];
                if (childObj) {
                    this.setVisible(childObj, true);
                }
            }
            this.expandedState[nodePath] = true;
            print("EXPANDED: " + nodePath);
        }
        collapseNode(nodePath) {
            var children = this.childPathsByParent[nodePath];
            if (!children) {
                return;
            }
            for (var i = 0; i < children.length; i++) {
                var childPath = children[i];
                this.hideSubtree(childPath);
            }
            this.expandedState[nodePath] = false;
            print("COLLAPSED: " + nodePath);
        }
        hideSubtree(nodePath) {
            var obj = this.createdNodes[nodePath];
            if (obj) {
                this.setVisible(obj, false);
            }
            var children = this.childPathsByParent[nodePath];
            if (children) {
                for (var i = 0; i < children.length; i++) {
                    this.hideSubtree(children[i]);
                }
            }
            this.expandedState[nodePath] = false;
        }
        setVisible(obj, visible) {
            obj.enabled = visible;
        }
        setLabel(obj, label) {
            var childCount = obj.getChildrenCount();
            for (var i = 0; i < childCount; i++) {
                var child = obj.getChild(i);
                if (child.name == "NodeLabel" || child.name == "Title") {
                    var textComponent = child.getComponent("Component.Text");
                    if (textComponent) {
                        textComponent.text = label;
                        return;
                    }
                }
            }
            print("NO LABEL CHILD FOUND ON " + obj.name);
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