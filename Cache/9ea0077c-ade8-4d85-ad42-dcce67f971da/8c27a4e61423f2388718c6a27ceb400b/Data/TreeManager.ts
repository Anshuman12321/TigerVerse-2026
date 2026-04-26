@component
export class TreeManager extends BaseScriptComponent {
    @input rootBox: SceneObject;
    @input boxTemplate: ObjectPrefab;
    @input treeRoot: SceneObject;

    @input horizontalSpacing: number = 28;
    @input forwardSpacingZ: number = -25;
    @input heightOffsetY: number = 1.5;

    private hasBuilt: boolean = false;
    private createdNodes: {[key: string]: SceneObject} = {};

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
                            { id: "navbar", label: "Navbar" }
                        ]
                    },
                    {
                        id: "pages",
                        label: "Pages",
                        children: [
                            { id: "home", label: "Home" },
                            { id: "login", label: "Login" }
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
                            { id: "auth", label: "Auth Routes" },
                            { id: "user", label: "User Routes" }
                        ]
                    },
                    {
                        id: "controllers",
                        label: "Controllers",
                        children: [
                            { id: "authController", label: "Auth Controller" },
                            { id: "userController", label: "User Controller" }
                        ]
                    }
                ]
            },
            {
                id: "database",
                label: "Database",
                children: [
                    { id: "usersTable", label: "Users Table" },
                    { id: "postsTable", label: "Posts Table" }
                ]
            }
        ]
    };

    onAwake() {
        print("TREE MANAGER READY");

        if (!this.hasBuilt) {
            this.hasBuilt = true;
            this.buildTree();
        }
    }

    private buildTree() {
        this.createdNodes = {};

        this.setLabel(this.rootBox, this.data.label);

        this.createdNodes[this.data.id] = this.rootBox;

        print("ROOT: " + this.data.label + " uid=" + this.data.id);

        if (this.data.children) {
            this.createChildrenRecursive(
                this.data.children,
                this.rootBox,
                this.data.id,
                1,
                0
            );
        }
    }

    private createChildrenRecursive(
        children: any[],
        parentObject: SceneObject,
        parentPath: string,
        depth: number,
        centerX: number
    ) {
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

            print(
                "CREATED: " +
                    child.label +
                    " path=" +
                    childPath +
                    " parent=" +
                    parentPath +
                    " depth=" +
                    depth
            );

            if (child.children && child.children.length > 0) {
                this.createChildrenRecursive(
                    child.children,
                    box,
                    childPath,
                    depth + 1,
                    x
                );
            }
        }
    }

    private setLabel(obj: SceneObject, label: string) {
        var labelObject = obj.findChildByName("NodeLabel");

        if (!labelObject) {
            print("NO LABEL FOUND ON: " + obj.name);
            return;
        }

        var textComponent = labelObject.getComponent("Component.Text");

        if (!textComponent) {
            print("NO TEXT COMPONENT ON: " + labelObject.name);
            return;
        }

        textComponent.text = label;
    }
}