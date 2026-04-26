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
    treeRoot: SceneObject;

    @input
    horizontalSpacing: number = 10;

    @input
    forwardSpacingZ: number = -10;

    @input
    heightOffsetY: number = 0.5;

    private rootUid: string = "root";
    private rootNodeId: string = "project";

    private nextUid: number = 0;
    private clickLocked: boolean = false;

    private createdNodes: { [key: string]: SceneObject } = {};
    private openedChildren: { [key: string]: string[] } = {};

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
        if (!this.boxTemplate) {
            print("ERROR: BoxTemplate is missing.");
            return;
        }

        if (!this.treeRoot) {
            print("ERROR: Tree Root is missing.");
            return;
        }

        this.setLabelOnBox(this.getSceneObject(), this.treeData[this.rootNodeId].label);

        var rootInteractable = this.getSceneObject().getComponent(
            Interactable.getTypeName()
        ) as unknown as Interactable;

        if (!rootInteractable) {
            print("ERROR: SquareButtonBox needs an Interactable.");
            return;
        }

        rootInteractable.onTriggerEnd.add(() => {
            this.handleNodeClick(this.rootUid, this.rootNodeId, this.getSceneObject());
        });

        print("TREE MANAGER READY");
    }

    private handleNodeClick(uid: string, nodeId: string, nodeObject: SceneObject) {
        if (this.clickLocked) {
            return;
        }

        this.clickLocked = true;

        print("CLICKED NODE: " + nodeId + " uid=" + uid);

        if (this.isOpen(uid)) {
            this.closeNode(uid);
        } else {
            this.openNode(uid, nodeId, nodeObject);
        }

        var delay = this.createEvent("DelayedCallbackEvent");
        delay.bind(() => {
            this.clickLocked = false;
        });
        delay.reset(0.3);
    }

    private openNode(parentUid: string, nodeId: string, parentObject: SceneObject) {
        var node = this.treeData[nodeId];

        if (!node) {
            print("ERROR: No JSON data for " + nodeId);
            return;
        }

        if (node.children.length === 0) {
            print("Leaf node: " + nodeId);
            return;
        }

        var parentPos = parentObject.getTransform().getWorldPosition();

        var count = node.children.length;
        var totalWidth = (count - 1) * this.horizontalSpacing;
        var startX = parentPos.x - totalWidth / 2;

        var childUids: string[] = [];

        for (var i = 0; i < count; i++) {
            var childNodeId = node.children[i];
            var childData = this.treeData[childNodeId];

            if (!childData) {
                print("ERROR: Missing JSON child: " + childNodeId);
                continue;
            }

            var childUid = "node_" + this.nextUid;
            this.nextUid++;

            var newBox = this.boxTemplate.copyWholeHierarchy(this.treeRoot);

            newBox.name = "TreeNode_" + childNodeId + "_" + childUid;
            newBox.enabled = true;

            newBox.getTransform().setWorldPosition(new vec3(
                startX + i * this.horizontalSpacing,
                parentPos.y + this.heightOffsetY,
                parentPos.z + this.forwardSpacingZ
            ));

            newBox.getTransform().setLocalScale(new vec3(1, 1, 1));

            this.setLabelOnBox(newBox, childData.label);

            this.createdNodes[childUid] = newBox;
            childUids.push(childUid);

            this.bindGeneratedNodeDelayed(newBox, childUid, childNodeId, 0);

            print("CREATED: " + childData.label + " nodeId=" + childNodeId + " uid=" + childUid);
        }

        this.openedChildren[parentUid] = childUids;
    }

    private bindGeneratedNodeDelayed(nodeObject: SceneObject, uid: string, nodeId: string, attempt: number) {
        var delay = this.createEvent("DelayedCallbackEvent");

        delay.bind(() => {
            var interactable = nodeObject.getComponent(
                Interactable.getTypeName()
            ) as unknown as Interactable;

            if (interactable) {
                interactable.onTriggerEnd.add(() => {
                    this.handleNodeClick(uid, nodeId, nodeObject);
                });

                print("BOUND CLICK: " + nodeObject.name + " nodeId=" + nodeId);
                return;
            }

            if (attempt < 5) {
                this.bindGeneratedNodeDelayed(nodeObject, uid, nodeId, attempt + 1);
            } else {
                print("ERROR: Still no Interactable after retry: " + nodeObject.name);
            }
        });

        delay.reset(0.05);
    }

    private closeNode(uid: string) {
        var children = this.openedChildren[uid];

        if (!children) {
            return;
        }

        for (var i = 0; i < children.length; i++) {
            var childUid = children[i];

            this.closeNode(childUid);

            var childObject = this.createdNodes[childUid];

            if (childObject && !isNull(childObject)) {
                print("DELETING: " + childObject.name);
                childObject.destroy();
            }

            delete this.createdNodes[childUid];
        }

        delete this.openedChildren[uid];

        print("CLOSED uid=" + uid);
    }

    private isOpen(uid: string): boolean {
        return this.openedChildren[uid] !== undefined;
    }

    public resetTree() {
        this.closeNode(this.rootUid);

        this.createdNodes = {};
        this.openedChildren = {};
        this.nextUid = 0;

        print("TREE RESET COMPLETE");
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