import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";

type TreeChild = {
    id: string,
    label: string
};

type TreeNode = {
    label: string,
    children: TreeChild[]
};

@component
export class CondenseCreate extends BaseScriptComponent {
    @input
    boxTemplate: SceneObject;

    @input
    nodeId: string = "root";

    @input
    verticalSpacing: number = 3;

    @input
    horizontalSpacing: number = 4;

    private interactable: Interactable;
    private static nextId: number = 0;

    private treeData: {[key: string]: TreeNode} = {
        "root": {
            label: "Root",
            children: [
                { id: "frontend", label: "Frontend" },
                { id: "backend", label: "Backend" },
                { id: "cloud", label: "Cloud" }
            ]
        },

        "frontend": {
            label: "Frontend",
            children: [
                { id: "react", label: "React" },
                { id: "css", label: "CSS" }
            ]
        },

        "backend": {
            label: "Backend",
            children: [
                { id: "api", label: "API" },
                { id: "database", label: "Database" },
                { id: "auth", label: "Auth" }
            ]
        },

        "cloud": {
            label: "Cloud",
            children: [
                { id: "digitalocean", label: "DigitalOcean" },
                { id: "cloudflare", label: "Cloudflare" }
            ]
        },

        "react": { label: "React", children: [] },
        "css": { label: "CSS", children: [] },
        "api": { label: "API", children: [] },
        "database": { label: "Database", children: [] },
        "auth": { label: "Auth", children: [] },
        "digitalocean": { label: "DigitalOcean", children: [] },
        "cloudflare": { label: "Cloudflare", children: [] }
    };

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => {
            this.onStart();
        });
    }

    onStart() {
        this.interactable = this.getSceneObject().getComponent(
            Interactable.getTypeName()
        ) as unknown as Interactable;

        if (!this.interactable) {
            print("ERROR: No Interactable found on " + this.getSceneObject().name);
            return;
        }

        if (!this.boxTemplate) {
            print("ERROR: No BoxTemplate assigned on " + this.getSceneObject().name);
            return;
        }

        this.updateNodeIdFromName();
        this.setNodeLabel(this.getSceneObject(), this.getCurrentLabel());

        print("CondenseCreate ready on " + this.getSceneObject().name + " nodeId=" + this.nodeId);

        this.interactable.onTriggerStart.add(() => {
            this.updateNodeIdFromName();
            this.toggleNode();
        });
    }

    private updateNodeIdFromName() {
        var name = this.getSceneObject().name;
        var prefix = "GeneratedNode_";

        if (name.indexOf(prefix) === 0) {
            var withoutPrefix = name.replace(prefix, "");
            var parts = withoutPrefix.split("__");
            this.nodeId = parts[0];
        }
    }

    private getCurrentLabel(): string {
        var node = this.treeData[this.nodeId];

        if (node) {
            return node.label;
        }

        return this.nodeId;
    }

    private toggleNode() {
        if (this.hasDirectGeneratedChildren()) {
            this.closeNode();
        } else {
            this.openNode();
        }
    }

    private openNode() {
        var node = this.treeData[this.nodeId];

        if (!node) {
            print("ERROR: No tree data for nodeId: " + this.nodeId);
            return;
        }

        if (node.children.length === 0) {
            print("Leaf node. No children for: " + this.nodeId);
            return;
        }

        var count = node.children.length;
        var totalWidth = (count - 1) * this.horizontalSpacing;
        var startX = -totalWidth / 2;

        for (var i = 0; i < count; i++) {
            var childData = node.children[i];

            var newBox = this.boxTemplate.copyWholeHierarchy(this.getSceneObject());

            newBox.name = "GeneratedNode_" + childData.id + "__" + CondenseCreate.nextId;
            CondenseCreate.nextId++;

            newBox.enabled = true;

            newBox.getTransform().setLocalPosition(new vec3(
                startX + (i * this.horizontalSpacing),
                this.verticalSpacing,
                0
            ));

            newBox.getTransform().setLocalScale(new vec3(1, 1, 1));

            this.setNodeLabel(newBox, childData.label);

            print("Created node: " + childData.label);
        }
    }

    private closeNode() {
        for (var i = this.getSceneObject().getChildrenCount() - 1; i >= 0; i--) {
            var child = this.getSceneObject().getChild(i);

            if (child.name.indexOf("GeneratedNode_") === 0) {
                print("Closing/deleting child: " + child.name);
                child.destroy();
            }
        }
    }

    private hasDirectGeneratedChildren(): boolean {
        for (var i = 0; i < this.getSceneObject().getChildrenCount(); i++) {
            var child = this.getSceneObject().getChild(i);

            if (child.name.indexOf("GeneratedNode_") === 0) {
                return true;
            }
        }

        return false;
    }

    private setNodeLabel(box: SceneObject, label: string) {
        var labelObject = this.findChildByName(box, "NodeLabel");

        if (!labelObject) {
            print("WARNING: No NodeLabel child found on " + box.name);
            return;
        }

        var textComponent = labelObject.getComponent("Component.Text") as any;

        if (!textComponent) {
            print("WARNING: NodeLabel exists but has no Text component.");
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