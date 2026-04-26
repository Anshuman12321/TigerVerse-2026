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
    private createdBoxes: SceneObject[] = [];
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
        this.readNodeIdFromName();

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

        print("CondenseCreate ready on " + this.getSceneObject().name + " with nodeId: " + this.nodeId);

        this.interactable.onTriggerStart.add(() => {
            print("CLICKED: " + this.getSceneObject().name);
            this.toggleNode();
        });
    }

    private readNodeIdFromName() {
        var name = this.getSceneObject().name;
        var prefix = "GeneratedNode_";

        if (name.indexOf(prefix) === 0) {
            var withoutPrefix = name.replace(prefix, "");
            var parts = withoutPrefix.split("__");
            this.nodeId = parts[0];
        }
    }

    private toggleNode() {
        this.cleanDeletedBoxes();

        if (this.createdBoxes.length > 0) {
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

        var parent = this.getSceneObject().getParent();
        var myPos = this.getSceneObject().getTransform().getWorldPosition();

        var count = node.children.length;
        var totalWidth = (count - 1) * this.horizontalSpacing;
        var startX = myPos.x - totalWidth / 2;

        for (var i = 0; i < count; i++) {
            var childData = node.children[i];

            var newBox = this.boxTemplate.copyWholeHierarchy(parent);

            newBox.name = "GeneratedNode_" + childData.id + "__" + CondenseCreate.nextId;
            CondenseCreate.nextId++;

            newBox.enabled = true;

            newBox.getTransform().setWorldPosition(new vec3(
                startX + i * this.horizontalSpacing,
                myPos.y + this.verticalSpacing,
                myPos.z
            ));

            newBox.getTransform().setLocalScale(new vec3(1, 1, 1));

            this.createdBoxes.push(newBox);

            print("Created visible node: " + newBox.name);
        }
    }

    private closeNode() {
        for (var i = 0; i < this.createdBoxes.length; i++) {
            var box = this.createdBoxes[i];

            if (box && !isNull(box)) {
                print("Deleting child: " + box.name);
                box.destroy();
            }
        }

        this.createdBoxes = [];
    }

    private cleanDeletedBoxes() {
        var remaining: SceneObject[] = [];

        for (var i = 0; i < this.createdBoxes.length; i++) {
            var box = this.createdBoxes[i];

            if (box && !isNull(box)) {
                remaining.push(box);
            }
        }

        this.createdBoxes = remaining;
    }
}