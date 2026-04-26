import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";

type FileNode = {
    id: string;
    label: string;
    type: "folder" | "file";
    children?: FileNode[];
};

type CreatedNode = {
    uid: string;
    data: FileNode;
    object: SceneObject;
    parentUid: string;
};

@component
export class TreeManager extends BaseScriptComponent {
    static instance: TreeManager;

    @input
    rootBox: SceneObject;

    @input
    rootInteractable: Interactable;

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

    private nextUid: number = 0;
    private clickLocked: boolean = false;

    private createdNodes: { [key: string]: CreatedNode } = {};
    private openedChildren: { [key: string]: string[] } = {};

    private readonly rootUid: string = "root";

    private fileTree: FileNode = {
        id: "project",
        label: "Project",
        type: "folder",
        children: [
            {
                id: "frontend",
                label: "Frontend",
                type: "folder",
                children: [
                    { id: "frontend_file_one", label: "file one", type: "file" },
                    { id: "frontend_file_two", label: "file two", type: "file" }
                ]
            },
            {
                id: "backend",
                label: "Backend",
                type: "folder",
                children: [
                    { id: "backend_file_one", label: "file one", type: "file" },
                    { id: "backend_file_two", label: "file two", type: "file" }
                ]
            },
            {
                id: "database",
                label: "Database",
                type: "folder",
                children: [
                    { id: "database_file_one", label: "file one", type: "file" }
                ]
            }
        ]
    };

    onAwake() {
        TreeManager.instance = this;

        this.createEvent("OnStartEvent").bind(() => {
            this.onStart();
        });
    }

    private onStart() {
        if (!this.rootBox) {
            print("ERROR: Root Box is missing.");
            return;
        }

        if (!this.rootInteractable) {
            print("ERROR: Root Interactable is missing.");
            return;
        }

        if (!this.boxTemplate) {
            print("ERROR: Box Template is missing.");
            return;
        }

        if (!this.treeRoot) {
            print("ERROR: Tree Root is missing.");
            return;
        }

        this.setLabel(this.rootBox, this.fileTree.label);

        this.rootInteractable.onTriggerEnd.add(() => {
            this.onNodeClicked(this.rootUid, this.fileTree, this.rootBox);
        });

        print("TREE MANAGER READY");
    }

    public onGeneratedNodeClickedByName(objectName: string) {
        var uid = this.getUidFromName(objectName);

        if (uid === "") {
            print("ERROR: Could not read uid from " + objectName);
            return;
        }

        var created = this.createdNodes[uid];

        if (!created) {
            print("ERROR: No created node found for uid=" + uid + " name=" + objectName);
            return;
        }

        this.onNodeClicked(uid, created.data, created.object);
    }

    private onNodeClicked(uid: string, data: FileNode, obj: SceneObject) {
        if (this.clickLocked) {
            return;
        }

        this.clickLocked = true;

        print("CLICKED: " + data.label + " uid=" + uid + " nodeId=" + data.id);

        if (data.type === "file") {
            print("File clicked: " + data.label);
            this.unlockSoon();
            return;
        }

        if (this.isOpen(uid)) {
            this.closeNode(uid);
        } else {
            this.openNode(uid, data, obj);
        }

        this.unlockSoon();
    }

    private openNode(parentUid: string, parentData: FileNode, parentObject: SceneObject) {
        if (!parentData.children || parentData.children.length === 0) {
            return;
        }

        var parentPos = parentObject.getTransform().getWorldPosition();

        var count = parentData.children.length;
        var totalWidth = (count - 1) * this.horizontalSpacing;
        var startX = parentPos.x - totalWidth / 2;

        var childUids: string[] = [];

        for (var i = 0; i < count; i++) {
            var childData = parentData.children[i];

            var childUid = "node_" + this.nextUid;
            this.nextUid++;

            var newBox = this.boxTemplate.copyWholeHierarchy(this.treeRoot);

            newBox.name = "TreeNode__" + childUid + "__" + childData.id;
            newBox.enabled = true;

            newBox.getTransform().setWorldPosition(new vec3(
                startX + i * this.horizontalSpacing,
                parentPos.y + this.heightOffsetY,
                parentPos.z + this.forwardSpacingZ
            ));

            newBox.getTransform().setLocalScale(new vec3(1, 1, 1));

            this.setLabel(newBox, childData.label);

            this.createdNodes[childUid] = {
                uid: childUid,
                data: childData,
                object: newBox,
                parentUid: parentUid
            };

            childUids.push(childUid);

            print("CREATED: " + childData.label + " uid=" + childUid + " nodeId=" + childData.id);
        }

        this.openedChildren[parentUid] = childUids;
    }

    private closeNode(uid: string) {
        var children = this.openedChildren[uid];

        if (!children) {
            return;
        }

        for (var i = 0; i < children.length; i++) {
            var childUid = children[i];

            this.closeNode(childUid);

            var childNode = this.createdNodes[childUid];

            if (childNode && childNode.object && !isNull(childNode.object)) {
                print("DELETING: " + childNode.data.label);
                childNode.object.destroy();
            }

            delete this.createdNodes[childUid];
        }

        delete this.openedChildren[uid];

        print("CLOSED uid=" + uid);
    }

    public resetTree() {
        this.closeNode(this.rootUid);

        this.createdNodes = {};
        this.openedChildren = {};
        this.nextUid = 0;

        print("TREE RESET COMPLETE");
    }

    private isOpen(uid: string): boolean {
        return this.openedChildren[uid] !== undefined;
    }

    private unlockSoon() {
        var delay = this.createEvent("DelayedCallbackEvent");

        delay.bind(() => {
            this.clickLocked = false;
        });

        delay.reset(0.25);
    }

    private getUidFromName(name: string): string {
        var parts = name.split("__");

        if (parts.length >= 3) {
            return parts[1];
        }

        return "";
    }

    private setLabel(obj: SceneObject, label: string) {
        var labelObject = this.findChildByName(obj, "NodeLabel");

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