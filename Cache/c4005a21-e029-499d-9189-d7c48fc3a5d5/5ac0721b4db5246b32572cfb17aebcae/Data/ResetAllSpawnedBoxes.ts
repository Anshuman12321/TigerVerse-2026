@component
export class ResetAllSpawnedBoxes extends BaseScriptComponent {
    @input
    searchRoot: SceneObject;

    public resetSpawnedBoxes() {
        if (!this.searchRoot) {
            print("ERROR: Missing Search Root.");
            return;
        }

        this.hideTreeNodes(this.searchRoot);

        print("Reset complete. Tree hidden again.");
    }

    private hideTreeNodes(obj: SceneObject) {
        for (var i = 0; i < obj.getChildrenCount(); i++) {
            var child = obj.getChild(i);

            if (child.name.indexOf("TreeNode_") === 0) {
                child.enabled = false;
            }

            this.hideTreeNodes(child);
        }
    }
}