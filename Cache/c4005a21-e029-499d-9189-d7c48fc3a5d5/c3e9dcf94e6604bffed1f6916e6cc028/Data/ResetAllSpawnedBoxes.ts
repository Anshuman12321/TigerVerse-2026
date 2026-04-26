@component
export class ResetAllSpawnedBoxes extends BaseScriptComponent {
    @input
    searchRoot: SceneObject;

    public resetSpawnedBoxes() {
        if (!this.searchRoot) {
            print("ERROR: Missing Search Root.");
            return;
        }

        this.deleteGeneratedNodes(this.searchRoot);

        print("Reset complete. Deleted all generated nodes.");
    }

    private deleteGeneratedNodes(obj: SceneObject) {
        for (var i = obj.getChildrenCount() - 1; i >= 0; i--) {
            var child = obj.getChild(i);

            this.deleteGeneratedNodes(child);

            if (child.name.indexOf("GeneratedNode_") === 0) {
                print("Reset deleting: " + child.name);
                child.destroy();
            }
        }
    }
}