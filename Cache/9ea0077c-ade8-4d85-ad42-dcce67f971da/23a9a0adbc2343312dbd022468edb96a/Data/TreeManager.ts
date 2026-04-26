@component
export class TreeManager extends BaseScriptComponent {
    @input rootBox: SceneObject;
    @input rootInteractable: Component.ScriptComponent;
    @input boxTemplate: ObjectPrefab;
    @input treeRoot: SceneObject;

    @input horizontalSpacing: number = 28;
    @input forwardSpacingZ: number = -28;
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
                            {
                                id: "button",
                                label: "Button"
                            },
                            {
                                id: "navbar",
                                label: "Navbar"
                            },
                            {
                                id: "card",
                                label: "Card"
                            }
                        ]
                    },
                    {
                        id: "pages",
                        label: "Pages",
                        children: [
                            {
                                id: "home",
                                label: "Home Page"
                            },
                            {
                                id: "login",
                                label: "Login Page"
                            },
                            {
                                id: "dashboard",
                                label: "Dashboard Page"
                            }
                        ]
                    },
                    {
                        id: "styles",
                        label: "Styles",
                        children: [
                            {
                                id: "css",
                                label: "CSS"
                            },
                            {
                                id: "tailwind",
                                label: "Tailwind"
                            }
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
                            {
                                id: "authRoutes",
                                label: "Auth Routes"
                            },
                            {
                                id: "userRoutes",
                                label: "User Routes"
                            },
                            {
                                id: "postRoutes",
                                label: "Post Routes"
                            }
                        ]
                    },
                    {
                        id: "controllers",
                        label: "Controllers",
                        children: [
                            {
                                id: "authController",
                                label: "Auth Controller"
                            },
                            {
                                id: "userController",
                                label: "User Controller"
                            },
                            {
                                id: "postController",
                                label: "Post Controller"
                            }
                        ]
                    },
                    {
                        id: "middleware",
                        label: "Middleware",
                        children: [
                            {
                                id: "authMiddleware",
                                label: "Auth Middleware"
                            },
                            {
                                id: "errorMiddleware",
                                label: "Error Middleware"
                            }
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
                            {
                                id: "userModel",
                                label: "User Model"
                            },
                            {
                                id: "postModel",
                                label: "Post Model"
                            }
                        ]
                    },
                    {
                        id: "tables",
                        label: "Tables",
                        children: [
                            {
                                id: "usersTable",
                                label: "Users Table"
                            },
                            {
                                id: "postsTable",
                                label: "Posts Table"
                            }
                        ]
                    }
                ]
            }
        ]
    };

    onAwake() {
        print("TREE MANAGER READY");

        if (this.hasBuilt) {
            print("TREE ALREADY BUILT, SKIPPING");
            return;
        }

        this.hasBuilt = true;
        this.buildTree();
    }

    private buildTree() {
        this.createdNodes = {};

        if (!this.rootBox) {
            print("ERROR: rootBox is not assigned in Inspector");
            return;
        }

        if (!this.boxTemplate) {
            print("ERROR: boxTemplate is not assigned in Inspector");
            return;
        }

        if (!this.treeRoot) {
            print("ERROR: treeRoot is not assigned in Inspector");
            return;
        }

        this.rootBox.name = "Node_" + this.data.id;
        this.setLabel(this.rootBox, this.data.label);

        this.createdNodes[this.data.id] = this.rootBox;

        print("ROOT: " + this.data.label + " path=" + this.data.id);

        if (this.data.children && this.data.children.length > 0) {
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
        var childCount = obj.getChildrenCount();

        for (var i = 0; i < childCount; i++) {
            var child = obj.getChild(i);

            if (child.name == "NodeLabel") {
                var textComponent = child.getComponent("Component.Text");

                if (textComponent) {
                    textComponent.text = label;
                } else {
                    print("NodeLabel found but no Text component on: " + obj.name);
                }

                return;
            }
        }

        print("NO NodeLabel FOUND ON: " + obj.name);
    }
}