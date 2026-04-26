import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";

type TreeChild = {
    id: string;
    label: string;
};

type TreeNode = {
    label: string;
    children: TreeChild[];
};

type NodeInfo = {
    isGenerated: boolean;
    uid: string;
    parentUid: string;
    nodeId: string;
};

@component
export class CondenseCreate extends BaseScriptComponent {
    @input
    boxTemplate: SceneObject;

    @input
    treeRoot: SceneObject;

    @input
    nodeId: string = "root";

    @input
    verticalSpacing: number = 3;

    @input
    horizontalSpacing: number = 4;

    private interactable: Interactable;
    private static nextUid: number = 0;

    private treeData: { [key: string]: TreeNode } = {
        root: {
            label: "Root",
            children: [
                { id: "frontend", label: "Frontend" },
                { id: "backend", label: "Backend" },
                { id: "cloud", label: "Cloud" }
            ]
        },

        frontend: {
            label: "Frontend",
            children: [
                { id: "react", label: "React" },
                { id: "css", label: "CSS" }
            ]
        },

        backend: {
            label: "Backend",
            children: [
                { id: "api", label: "API" },
                { id: "database", label: "Database" },
                { id: "auth", label: "Auth" }
            ]
        },

        cloud: {
            label: "Cloud",
            children: [
                { id: "digitalocean", label: "DigitalOcean" },
                { id: "cloudflare", label: "Cloudflare" }
            ]
        },

        react: { label: "React", children: [] },
        css: { label: "CSS", children: [] },
        api: { label: "API", children: [] },
        database: { label: "Database", children: [] },
        auth: { label: "Auth", children: [] },
        digitalocean: { label: "DigitalOcean", children: [] },
        cloudflare: { label: "Cloudflare", children: [] }
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
            print("ERROR: No Interactable on " + this.getSceneObject().name);
            return;
        }

        if (!this.boxTemplate) {
            print("ERROR: BoxTemplate missing on " + this.getSceneObject().name);
            return;
        }

        if (!this.treeRoot) {
            this.treeRoot = this.getSceneObject().getParent();
        }

        this.setNodeLabel(this.getSceneObject(), this.getNodeLabel());

        print("CondenseCreate ready on " + this.getSceneObject().name);

        this.interactable.onTriggerStart.add(() => {
            this.toggleNode();
        });
    }

    private toggleNode() {
        var info = this.getMyNodeInfo();

        print("Clicked nodeId=" + info.nodeId + " uid=" + info.uid);

        if (this.hasDirectChildren(info.uid)) {
            this.closeNode(info.uid);
        } else {
            this.openNode(info);
        }
    }

    private openNode(info: NodeInfo) {
        var node = this.treeData[info.nodeId];

        if (!node) {
            print("ERROR: No JSON node for " + info.nodeId);
            return;
        }

        if (node.children.length === 0) {
            print("Leaf node: " + info.nodeId);
            return;
        }

        var myPos = this.getSceneObject().getTransform().getWorldPosition();

        var count = node.children.length;
        var totalWidth = (count - 1) * this.horizontalSpacing;
        var startX = myPos.x - totalWidth / 2;

        for (var i = 0; i < count; i++) {
            var childData = node.children[i];
            var uid = "" + CondenseCreate.nextUid;
            CondenseCreate.nextUid++;

            var newBox = this.boxTemplate.copyWholeHierarchy(this.treeRoot);

            newBox.name = "GeneratedNode__" + uid + "__" + info.uid + "__" + childData.id;
            newBox.enabled = true;

            newBox.getTransform().setWorldPosition(new vec3(
                startX + i * this.horizontalSpacing,
                myPos.y + this.verticalSpacing,
                myPos.z
            ));

            newBox.getTransform().setLocalScale(new vec3(1, 1, 1));

            this.setNodeLabel(newBox, childData.label);

            print("Created " + childData.label + " as " + newBox.name);
        }
    }

    private closeNode(parentUid: string) {
        for (var i = this.treeRoot.getChildrenCount() - 1; i >= 0; i--) {
            var child = this.treeRoot.getChild(i);
            var info = this.parseNodeInfo(child.name);

            if (info.isGenerated && info.parentUid === parentUid) {
                this.deleteNodeAndDescendants(info.uid);
            }
        }

        print("Closed node uid=" + parentUid);
    }

    private deleteNodeAndDescendants(uid: string) {
        for (var i = this.treeRoot.getChildrenCount() - 1; i >= 0; i--) {
            var child = this.treeRoot.getChild(i);
            var info = this.parseNodeInfo(child.name);

            if (info.isGenerated && info.parentUid === uid) {
                this.deleteNodeAndDescendants(info.uid);
            }
        }

        for (var j = this.treeRoot.getChildrenCount() - 1; j >= 0; j--) {
            var possibleNode = this.treeRoot.getChild(j);
            var possibleInfo = this.parseNodeInfo(possibleNode.name);

            if (possibleInfo.isGenerated && possibleInfo.uid === uid) {
                print("Deleting " + possibleNode.name);
                possibleNode.destroy();
            }
        }
    }

    private hasDirectChildren(parentUid: string): boolean {
        for (var i = 0; i < this.treeRoot.getChildrenCount(); i++) {
            var child = this.treeRoot.getChild(i);
            var info = this.parseNodeInfo(child.name);

            if (info.isGenerated && info.parentUid === parentUid) {
                return true;
            }
        }

        return false;
    }

    private getMyNodeInfo(): NodeInfo {
        var info = this.parseNodeInfo(this.getSceneObject().name);

        if (info.isGenerated) {
            return info;
        }

        return {
            isGenerated: false,
            uid: "root",
            parentUid: "",
            nodeId: this.nodeId
        };
    }

    private parseNodeInfo(name: string): NodeInfo {
        var prefix = "GeneratedNode__";

        if (name.indexOf(prefix) !== 0) {
            return {
                isGenerated: false,
                uid: "",
                parentUid: "",
                nodeId: ""
            };
        }

        var parts = name.split("__");

        return {
            isGenerated: true,
            uid: parts[1],
            parentUid: parts[2],
            nodeId: parts[3]
        };
    }

    private getNodeLabel(): string {
        var info = this.getMyNodeInfo();
        var node = this.treeData[info.nodeId];

        if (node) {
            return node.label;
        }

        return info.nodeId;
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

    private findChildByName(parent: SceneObject, name: string): SceneObject {
        for (var i = 0; i < parent.getChildrenCount(); i++) {
            var child = parent.getChild(i);

            if (child.name === name) {
                return child;
            }

            var found = this.findChildByName(child, name);

            if (found) {
                return found;
            }
        }

        return null;
    }
}