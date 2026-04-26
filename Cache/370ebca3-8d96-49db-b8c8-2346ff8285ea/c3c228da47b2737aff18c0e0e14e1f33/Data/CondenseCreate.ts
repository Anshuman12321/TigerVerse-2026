import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";

type TreeNode = {
    label: string;
    children: string[];
};

@component
export class CondenseCreate extends BaseScriptComponent {
    @input
    rootInteractable: Interactable;

    @input
    boxTemplate: SceneObject;

    @input
    treeRoot: SceneObject;

    @input
    verticalSpacing: number = 3;

    @input
    horizontalSpacing: number = 4;

    private nodeObjects: { [key: string]: SceneObject } = {};

    private treeData: { [key: string]: TreeNode } = {
        root: {
            label: "Root",
            children: ["frontend", "backend", "cloud"]
        },

        frontend: {
            label: "Frontend",
            children: ["react", "css"]
        },

        backend: {
            label: "Backend",
            children: ["api", "database", "auth"]
        },

        cloud: {
            label: "Cloud",
            children: ["digitalocean", "cloudflare"]
        },

        react: {
            label: "React",
            children: []
        },

        css: {
            label: "CSS",
            children: []
        },

        api: {
            label: "API",
            children: []
        },

        database: {
            label: "Database",
            children: []
        },

        auth: {
            label: "Auth",
            children: []
        },

        digitalocean: {
            label: "DigitalOcean",
            children: []
        },

        cloudflare: {
            label: "Cloudflare",
            children: []
        }
    };

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => {
            this.onStart();
        });
    }

    onStart() {
        if (!this.rootInteractable) {
            print("ERROR: Root Interactable is missing.");
            return;
        }

        if (!this.boxTemplate) {
            print("ERROR: BoxTemplate is missing.");
            return;
        }

        if (!this.treeRoot) {
            print("ERROR: Tree Root is missing.");
            return;
        }

        this.setNodeLabel(this.getSceneObject(), this.treeData["root"].label);

        this.buildWholeTree();

        this.rootInteractable.onTriggerStart.add(() => {
            this.toggleNode("root");
        });

        print("Tree ready.");
    }

    private buildWholeTree() {
        var rootPos = this.getSceneObject().getTransform().getWorldPosition();

        this.createChildrenForNode("root", rootPos.x, rootPos.y, rootPos.z);
    }

    private createChildrenForNode(parentId: string, parentX: number, parentY: number, parentZ: number) {
        var parentNode = this.treeData[parentId];

        if (!parentNode || parentNode.children.length === 0) {
            return;
        }

        var childCount = parentNode.children.length;
        var totalWidth = (childCount - 1) * this.horizontalSpacing;
        var startX = parentX - totalWidth / 2;

        for (var i = 0; i < childCount; i++) {
            var childId = parentNode.children[i];
            var childNode = this.treeData[childId];

            var childX = startX + i * this.horizontalSpacing;
            var childY = parentY + this.verticalSpacing;
            var childZ = parentZ;

            var newBox = this.boxTemplate.copyWholeHierarchy(this.treeRoot);

            newBox.name = "TreeNode_" + childId;
            newBox.enabled = false;

            newBox.getTransform().setWorldPosition(new vec3(childX, childY, childZ));
            newBox.getTransform().setLocalScale(new vec3(1, 1, 1));

            this.setNodeLabel(newBox, childNode.label);

            this.nodeObjects[childId] = newBox;

            this.bindNodeClick(newBox, childId);

            this.createChildrenForNode(childId, childX, childY, childZ);
        }
    }

    private bindNodeClick(nodeObject: SceneObject, nodeId: string) {
        var interactable = nodeObject.getComponent(
            Interactable.getTypeName()
        ) as unknown as Interactable;

        if (!interactable) {
            print("WARNING: No Interactable on " + nodeObject.name);
            return;
        }

        interactable.onTriggerStart.add(() => {
            this.toggleNode(nodeId);
        });
    }

    private toggleNode(nodeId: string) {
        var node = this.treeData[nodeId];

        if (!node || node.children.length === 0) {
            print("Leaf node clicked: " + nodeId);
            return;
        }

        if (this.areDirectChildrenVisible(nodeId)) {
            this.hideChildrenRecursive(nodeId);
        } else {
            this.showDirectChildren(nodeId);
        }
    }

    private showDirectChildren(nodeId: string) {
        var node = this.treeData[nodeId];

        for (var i = 0; i < node.children.length; i++) {
            var childId = node.children[i];
            var childObject = this.nodeObjects[childId];

            if (childObject) {
                childObject.enabled = true;
            }
        }

        print("Opened " + nodeId);
    }

    private hideChildrenRecursive(nodeId: string) {
        var node = this.treeData[nodeId];

        for (var i = 0; i < node.children.length; i++) {
            var childId = node.children[i];
            var childObject = this.nodeObjects[childId];

            this.hideChildrenRecursive(childId);

            if (childObject) {
                childObject.enabled = false;
            }
        }

        print("Closed " + nodeId);
    }

    private areDirectChildrenVisible(nodeId: string): boolean {
        var node = this.treeData[nodeId];

        if (!node || node.children.length === 0) {
            return false;
        }

        var firstChildId = node.children[0];
        var firstChildObject = this.nodeObjects[firstChildId];

        return firstChildObject && firstChildObject.enabled;
    }

    private setNodeLabel(box: SceneObject, label: string) {
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