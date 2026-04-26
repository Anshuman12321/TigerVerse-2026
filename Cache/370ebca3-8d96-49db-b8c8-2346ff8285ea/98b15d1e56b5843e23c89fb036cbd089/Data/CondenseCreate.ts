import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";

type TreeNode = {
    label: string;
    children: string[];
};

@component
export class CondenseCreate extends BaseScriptComponent {
    @input
    boxTemplate: SceneObject;

    @input
    nodeId: string = "project";

    @input
    forwardSpacing: number = 4;

    @input
    horizontalSpacing: number = 4;

    private interactable: Interactable;
    private static nextId: number = 0;

    private treeData: { [key: string]: TreeNode } = {
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

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => {
            this.onStart();
        });
    }

    onStart() {
        this.readNodeIdFromName();

        this.interactable = this.getSceneObject().getComponent(
            Interactable.getTypeName()
        ) as unknown as Interactable;

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

    private toggleFolder() {
        if (this.hasOpenChildren()) {
            this.closeFolder();
        } else {
            this.openFolder();
        }
    }

    private openFolder() {
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
            newBox.getTransform().setLocalPosition(new vec3(
                startX + i * this.horizontalSpacing,
                0,
                -this.forwardSpacing
            ));

            newBox.getTransform().setLocalScale(new vec3(1, 1, 1));

            this.setLabelOnBox(newBox, childNode.label);

            print("Created child: " + childNode.label + " under " + this.nodeId);
        }
    }

    private closeFolder() {
        for (var i = this.getSceneObject().getChildrenCount() - 1; i >= 0; i--) {
            var child = this.getSceneObject().getChild(i);

            if (this.isTreeNode(child)) {
                child.destroy();
            }
        }

        print("Closed folder: " + this.nodeId);
    }

    private hasOpenChildren(): boolean {
        for (var i = 0; i < this.getSceneObject().getChildrenCount(); i++) {
            var child = this.getSceneObject().getChild(i);

            if (this.isTreeNode(child)) {
                return true;
            }
        }

        return false;
    }

    private isTreeNode(obj: SceneObject): boolean {
        return obj.name.indexOf("TreeNode__") === 0 || obj.name.indexOf("TreeNode_") === 0;
    }

    private readNodeIdFromName() {
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

    private getCurrentLabel(): string {
        var node = this.treeData[this.nodeId];

        if (node) {
            return node.label;
        }

        return this.nodeId;
    }

    private setLabelOnBox(box: SceneObject, label: string) {
        var labelObject = this.findChildByName(box, "NodeLabel");

        if (!labelObject) {
            return;
        }

        var textComponent = labelObject.getComponent("Component.Text") as any;

        if (!textComponent) {
            return;
        }

        textComponent.text = label;
    }

    private findChildByName(parent: SceneObject, childName: string): SceneObject {
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
}