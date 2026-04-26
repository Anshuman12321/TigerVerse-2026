@component
export class ResetAllSpawnedBoxes extends BaseScriptComponent {
    @input
    searchRoot: SceneObject;

    public resetSpawnedBoxes() {
        if (!this.searchRoot) {
            print("ERROR: Missing Search Root.");
            return;
        }

        this.deleteTreeNodes();
        print("RESET COMPLETE");
    }

    private deleteTreeNodes() {
        for (var i = this.searchRoot.getChildrenCount() - 1; i >= 0; i--) {
            var child = this.searchRoot.getChild(i);

            if (child.name.indexOf("TreeNode__") === 0) {
                child.destroy();
            }
        }
    }
}