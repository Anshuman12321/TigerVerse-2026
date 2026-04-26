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
    verticalSpacing: number = 3;

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

        this.setLabel(this.getCurrentLabel());

        print("Ready: " + this.getSceneObject().name + " nodeId=" + this.nodeId);

        this.interactable.onTriggerStart.add(() => {
            this.readNodeIdFromName();
            this.toggleFolder();
        });
    }

    private readNodeIdFromName() {
        var name = this.getSceneObject().name;
        var prefix = "TreeNode__";

        if (name.indexOf(prefix) === 0) {
            var withoutPrefix = name.replace(prefix, "");
            var parts = withoutPrefix.split("__");
            this.nodeId = parts[0];
        }
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
            print("Leaf node: " + this.nodeId);
            return;
        }

        var count = node.children.length;
        var totalWidth = (count - 1) * this.horizontalSpacing;
        var startX = -totalWidth / 2;

        for (var i = 0; i < count; i++) {
            var childId = node.children[i];
            var childNode = this.treeData[childId];

            var newBox = this.boxTemplate.copyWholeHierarchy(this.getSceneObject());

            newBox.name = "TreeNode__" + childId + "__" + CondenseCreate.nextId;
            CondenseCreate.nextId++;

            newBox.enabled = true;

            newBox.getTransform().setLocalPosition(new vec3(
                startX + i * this.horizontalSpacing,
                this.verticalSpacing,
                0
            ));

            newBox.getTransform().setLocalScale(new vec3(1, 1, 1));

            this.setLabelOnBox(newBox, childNode.label);

            print("Created child: " + childNode.label);
        }
    }

    private closeFolder() {
        for (var i = this.getSceneObject().getChildrenCount() - 1; i >= 0; i--) {
            var child = this.getSceneObject().getChild(i);

            if (child.name.indexOf("TreeNode__") === 0) {
                child.destroy();
            }
        }

        print("Closed folder: " + this.nodeId);
    }

    private hasOpenChildren(): boolean {
        for (var i = 0; i < this.getSceneObject().getChildrenCount(); i++) {
            var child = this.getSceneObject().getChild(i);

            if (child.name.indexOf("TreeNode__") === 0) {
                return true;
            }
        }

        return false;
    }

    private getCurrentLabel(): string {
        var node = this.treeData[this.nodeId];

        if (node) {
            return node.label;
        }

        return this.nodeId;
    }

    private setLabel(label: string) {
        this.setLabelOnBox(this.getSceneObject(), label);
    }

    private setLabelOnBox(box: SceneObject, label: string) {
        var labelObject = this.findChildByName(box, "NodeLabel");

        if (!labelObject) {
            print("WARNING: No NodeLabel found on " + box.name);
            return;
        }

        var textComponent = labelObject.getComponent("Component.Text") as any;

        if (!textComponent) {
            print("WARNING: NodeLabel has no Text component.");
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