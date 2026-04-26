@component
export class TreeManager extends BaseScriptComponent {
    public static instance: TreeManager;

    @input rootBox: SceneObject;
    @input boxTemplate: ObjectPrefab;
    @input treeRoot: SceneObject;

    // Good vertical defaults
    @input horizontalSpacing: number = 18;
    @input forwardSpacingZ: number = -35;
    @input heightOffsetY: number = 8;

    // Extra offset so child groups do not stack directly on top of each other
    @input branchSpacingX: number = 34;

    @input showRootChildrenOnStart: boolean = false;

    private hasBuilt: boolean = false;

    private createdNodes: { [key: string]: SceneObject } = {};
    private childPathsByParent: { [key: string]: string[] } = {};
    private expandedState: { [key: string]: boolean } = {};

    private data = {
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

    onAwake() {
        TreeManager.instance = this;

        if (this.hasBuilt) {
            return;
        }

        this.hasBuilt = true;
        this.buildTree();
    }

    private buildTree() {
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
            this.createChildrenRecursive(
                this.data.children,
                rootPath,
                1,
                0
            );
        }

        if (this.showRootChildrenOnStart) {
            this.expandNode(rootPath);
        }
    }

    private createChildrenRecursive(
        children: any[],
        parentPath: string,
        depth: number,
        centerX: number
    ) {
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

            print(
                "CREATED: " +
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
                ")"
            );

            if (child.children && child.children.length > 0) {
                this.createChildrenRecursive(
                    child.children,
                    childPath,
                    depth + 1,
                    x
                );
            }
        }
    }

    public onNodeClicked(nodePath: string) {
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
        } else {
            this.expandNode(nodePath);
        }
    }

    private expandNode(nodePath: string) {
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

    private collapseNode(nodePath: string) {
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

    private hideSubtree(nodePath: string) {
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

    private setVisible(obj: SceneObject, visible: boolean) {
        obj.enabled = visible;
    }

    private setLabel(obj: SceneObject, label: string) {
        var childCount = obj.getChildrenCount();

        for (var i = 0; i < childCount; i++) {
            var child = obj.getChild(i);

            if (child.name == "NodeLabel" || child.name == "Title") {
                var textComponent: any = child.getComponent("Component.Text");

                if (textComponent) {
                    textComponent.text = label;
                    return;
                }
            }
        }

        print("NO LABEL CHILD FOUND ON " + obj.name);
    }
}