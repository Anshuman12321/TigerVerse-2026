import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";

type TreeNode = {
    label: string;
    children: string[];
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
    nodeId: string = "project";

    @input
    horizontalSpacing: number = 20;

    @input
    forwardSpacingZ: number = -20;

    @input
    heightOffsetY: number = 2;

    private interactable: Interactable;
    private isClickLocked: boolean = false;
    private isReadyForClicks: boolean = false;

    private static nextUid: number = 0;

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

        if (!this.treeRoot) {
            print("ERROR: Missing Tree Root on " + this.getSceneObject().name);
            return;
        }

        var info = this.getMyInfo();
        this.nodeId = info.nodeId;

        this.setLabelOnBox(this.getSceneObject(), this.getLabel(this.nodeId));

        print("READY: " + this.getSceneObject().name + " nodeId=" + this.nodeId + " uid=" + info.uid);

        this.delayClickEnable();

        this.interactable.onTriggerEnd.add(() => {
            this.handleClick();
        });
    }

    private delayClickEnable() {
        this.isReadyForClicks = false;

        var delay = this.createEvent("DelayedCallbackEvent");
        delay.bind(() => {
            this.isReadyForClicks = true;
        });

        delay.reset(0.25);
    }

    private handleClick() {
        if (!this.isReadyForClicks) {
            return;
        }

        if (this.isClickLocked) {
            return;
        }

        this.isClickLocked = true;

        var info = this.getMyInfo();
        this.nodeId = info.nodeId;

        print("CLICKED: " + this.getSceneObject().name + " nodeId=" + info.nodeId + " uid=" + info.uid);

        if (this.hasDirectChildren(info.uid)) {
            this.closeChildren(info.uid);
        } else {
            this.openChildren(info);
        }

        var delay = this.createEvent("DelayedCallbackEvent");
        delay.bind(() => {
            this.isClickLocked = false;
        });

        delay.reset(0.35);
    }

    private openChildren(info: NodeInfo) {
        var node = this.treeData[info.nodeId];

        if (!node) {
            print("ERROR: No JSON node for " + info.nodeId);
            return;
        }

        if (node.children.length === 0) {
            print("Leaf node clicked: " + info.nodeId);
            return;
        }

        var myPos = this.getSceneObject().getTransform().getWorldPosition();

        var count = node.children.length;
        var totalWidth = (count - 1) * this.horizontalSpacing;
        var startX = myPos.x - totalWidth / 2;

        for (var i = 0; i < count; i++) {
            var childId = node.children[i];
            var childNode = this.treeData[childId];

            if (!childNode) {
                print("ERROR: Missing JSON entry for " + childId);
                continue;
            }

            var childUid = "" + CondenseCreate.nextUid;
            CondenseCreate.nextUid++;

            var newBox = this.boxTemplate.copyWholeHierarchy(this.treeRoot);

            newBox.name = "TreeNode__" + childUid + "__" + info.uid + "__" + childId;
            newBox.enabled = true;

            newBox.getTransform().setWorldPosition(new vec3(
                startX + i * this.horizontalSpacing,
                myPos.y + this.heightOffsetY,
                myPos.z + this.forwardSpacingZ
            ));

            newBox.getTransform().setLocalScale(new vec3(1, 1, 1));

            this.setLabelOnBox(newBox, childNode.label);

            print("CREATED: " + childNode.label + " nodeId=" + childId + " uid=" + childUid + " parent=" + info.uid);
        }
    }

    private closeChildren(parentUid: string) {
        for (var i = this.treeRoot.getChildrenCount() - 1; i >= 0; i--) {
            var child = this.treeRoot.getChild(i);
            var info = this.parseNodeInfo(child.name);

            if (info.isGenerated && info.parentUid === parentUid) {
                this.deleteNodeAndDescendants(info.uid);
            }
        }

        print("CLOSED children of uid=" + parentUid);
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
            var possible = this.treeRoot.getChild(j);
            var possibleInfo = this.parseNodeInfo(possible.name);

            if (possibleInfo.isGenerated && possibleInfo.uid === uid) {
                print("DELETING: " + possible.name);
                possible.destroy();
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

    private getMyInfo(): NodeInfo {
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
        var prefix = "TreeNode__";

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

    private getLabel(id: string): string {
        var node = this.treeData[id];

        if (node) {
            return node.label;
        }

        return id;
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