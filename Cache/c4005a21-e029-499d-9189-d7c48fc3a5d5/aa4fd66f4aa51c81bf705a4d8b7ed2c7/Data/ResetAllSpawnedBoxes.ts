@component
export class ResetAllSpawnedBoxes extends BaseScriptComponent {
    @input
    searchRoot: SceneObject;

    public resetSpawnedBoxes() {
        if (!this.searchRoot) {
            print("ERROR: Missing Search Root.");
            return;
        }

        for (var i = this.searchRoot.getChildrenCount() - 1; i >= 0; i--) {
            var child = this.searchRoot.getChild(i);

            if (child.name.indexOf("TreeNode__") === 0) {
                print("RESET DELETING: " + child.name);
                child.destroy();
            }
        }

        print("RESET COMPLETE");
    }
}