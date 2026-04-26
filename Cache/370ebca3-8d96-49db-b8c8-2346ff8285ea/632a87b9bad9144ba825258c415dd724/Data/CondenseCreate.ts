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
    interactable: Interactable;

    @input
    boxTemplate: SceneObject;

    @input
    nodeId: string = "root";

    @input
    verticalSpacing: number = 18;

    @input
    horizontalSpacing: number = 18;

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

        "react": {
            label: "React",
            children: []
        },

        "css": {
            label: "CSS",
            children: []
        },

        "api": {
            label: "API",
            children: []
        },

        "database": {
            label: "Database",
            children: []
        },

        "auth": {
            label: "Auth",
            children: []
        },

        "digitalocean": {
            label: "DigitalOcean",
            children: []
        },

        "cloudflare": {
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
        if (!this.interactable) {
            print("ERROR: Missing Interactable on " + this.getSceneObject().name);
            return;
        }

        if (!this.boxTemplate) {
            print("ERROR: Missing BoxTemplate on " + this.getSceneObject().name);
            return;
        }

        print("Tree node ready: " + this.nodeId);

        this.interactable.onTriggerStart.add(() => {
            this.toggleNode();
        });
    }

    private toggleNode() {
        var existingChild = this.findDirectGeneratedChild();

        if (existingChild) {
            this.closeNode();
        } else {
            this.openNode();
        }
    }

    private openNode() {
        var node = this.treeData[this.nodeId];

        if (!node) {
            print("No tree data found for node: " + this.nodeId);
            return;
        }

        if (node.children.length === 0) {
            print("Leaf node. No children for: " + this.nodeId);
            return;
        }

        var myPos = this.getSceneObject().getTransform().getWorldPosition();
        var parent = this.getSceneObject().getParent();

        var count = node.children.length;
        var totalWidth = (count - 1) * this.horizontalSpacing;
        var startX = myPos.x - totalWidth / 2;

        for (var i = 0; i < count; i++) {
            var childData = node.children[i];

            var newBox = this.boxTemplate.copyWholeHierarchy(parent);

            newBox.name = "GeneratedNode_" + childData.id + "_" + CondenseCreate.nextId;
            CondenseCreate.nextId++;

            newBox.enabled = true;

            newBox.getTransform().setWorldPosition(new vec3(
                startX + i * this.horizontalSpacing,
                myPos.y + this.verticalSpacing,
                myPos.z
            ));

            newBox.getTransform().setLocalScale(new vec3(1, 1, 1));

            var childScript = newBox.getComponent(CondenseCreate.getTypeName()) as CondenseCreate;

            if (childScript) {
                childScript.nodeId = childData.id;
                childScript.boxTemplate = this.boxTemplate;
            }

            print("Created child node: " + childData.label);
        }
    }

    private closeNode() {
        for (var i = this.getSceneObject().getParent().getChildrenCount() - 1; i >= 0; i--) {
            var child = this.getSceneObject().getParent().getChild(i);

            if (child.name.indexOf("GeneratedNode_") === 0) {
                var childPos = child.getTransform().getWorldPosition();
                var myPos = this.getSceneObject().getTransform().getWorldPosition();

                if (childPos.y > myPos.y) {
                    child.destroy();
                }
            }
        }

        print("Closed node: " + this.nodeId);
    }

    private findDirectGeneratedChild(): SceneObject {
        var parent = this.getSceneObject().getParent();
        var myPos = this.getSceneObject().getTransform().getWorldPosition();

        for (var i = 0; i < parent.getChildrenCount(); i++) {
            var child = parent.getChild(i);

            if (child.name.indexOf("GeneratedNode_") === 0) {
                var childPos = child.getTransform().getWorldPosition();

                if (childPos.y > myPos.y) {
                    return child;
                }
            }
        }

        return null;
    }
}