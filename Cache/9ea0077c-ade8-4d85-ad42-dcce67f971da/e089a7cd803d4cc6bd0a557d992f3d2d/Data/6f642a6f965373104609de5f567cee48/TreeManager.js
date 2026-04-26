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
            this.horizontalSpacing = this.horizontalSpacing;
            this.forwardSpacingZ = this.forwardSpacingZ;
            this.heightOffsetY = this.heightOffsetY;
            this.hasBuilt = false;
            this.createdNodes = {};
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
            this.horizontalSpacing = this.horizontalSpacing;
            this.forwardSpacingZ = this.forwardSpacingZ;
            this.heightOffsetY = this.heightOffsetY;
            this.hasBuilt = false;
            this.createdNodes = {};
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
            print("TREE MANAGER READY");
            if (this.hasBuilt) {
                print("TREE ALREADY BUILT, SKIPPING");
                return;
            }
            this.hasBuilt = true;
            this.buildTree();
        }
        buildTree() {
            this.createdNodes = {};
            if (!this.rootBox) {
                print("ERROR: Root Box is not assigned");
                return;
            }
            if (!this.boxTemplate) {
                print("ERROR: Box Template is not assigned");
                return;
            }
            if (!this.treeRoot) {
                print("ERROR: Tree Root is not assigned");
                return;
            }
            this.rootBox.name = "Node_" + this.data.id;
            this.setLabel(this.rootBox, this.data.label);
            this.createdNodes[this.data.id] = this.rootBox;
            print("ROOT: " + this.data.label + " path=" + this.data.id);
            if (this.data.children && this.data.children.length > 0) {
                this.createChildrenRecursive(this.data.children, this.data.id, 1, 0);
            }
        }
        createChildrenRecursive(children, parentPath, depth, centerX) {
            var count = children.length;
            var startX = centerX - ((count - 1) * this.horizontalSpacing) / 2;
            for (var i = 0; i < count; i++) {
                var child = children[i];
                var childPath = parentPath + "/" + child.id;
                if (this.createdNodes[childPath]) {
                    print("SKIPPED DUPLICATE: " + child.label + " path=" + childPath);
                    continue;
                }
                var box = this.boxTemplate.instantiate(this.treeRoot);
                box.name = "Node_" + child.id;
                var x = startX + i * this.horizontalSpacing;
                var y = depth * this.heightOffsetY;
                var z = depth * this.forwardSpacingZ;
                box.getTransform().setLocalPosition(new vec3(x, y, z));
                this.setLabel(box, child.label);
                this.createdNodes[childPath] = box;
                print("CREATED: " +
                    child.label +
                    " path=" +
                    childPath +
                    " parent=" +
                    parentPath +
                    " depth=" +
                    depth);
                if (child.children && child.children.length > 0) {
                    this.createChildrenRecursive(child.children, childPath, depth + 1, x);
                }
            }
        }
        setLabel(obj, label) {
            var childCount = obj.getChildrenCount();
            for (var i = 0; i < childCount; i++) {
                var child = obj.getChild(i);
                if (child.name == "NodeLabel") {
                    var textComponent = child.getComponent("Component.Text");
                    if (textComponent) {
                        textComponent.text = label;
                    }
                    else {
                        print("NodeLabel found but no Text component on " + obj.name);
                    }
                    return;
                }
            }
            print("NO NodeLabel FOUND ON " + obj.name);
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