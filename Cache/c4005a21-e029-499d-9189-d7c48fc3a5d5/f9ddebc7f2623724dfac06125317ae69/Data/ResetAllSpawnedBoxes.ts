@component
export class ResetAllSpawnedBoxes extends BaseScriptComponent {
    @input
    searchRoot: SceneObject;

    public resetSpawnedBoxes() {
        if (!this.searchRoot) {
            print("ERROR: Missing Search Root.");
            return;
        }

        this.deleteTreeNodes(this.searchRoot);
        print("Reset complete.");
    }

    private deleteTreeNodes(obj: SceneObject) {
        for (var i = obj.getChildrenCount() - 1; i >= 0; i--) {
            var child = obj.getChild(i);

            this.deleteTreeNodes(child);

            if (child.name.indexOf("TreeNode__") === 0 || child.name.indexOf("TreeNode_") === 0) {
                child.destroy();
            }
        }
    }
}