@component
export class ResetAllSpawnedBoxes extends BaseScriptComponent {
    @input
    searchRoot: SceneObject;

    public resetSpawnedBoxes() {
        if (!this.searchRoot) {
            print("ERROR: Missing Search Root.");
            return;
        }

        this.deleteGeneratedNodes();

        print("Reset complete.");
    }

    private deleteGeneratedNodes() {
        for (var i = this.searchRoot.getChildrenCount() - 1; i >= 0; i--) {
            var child = this.searchRoot.getChild(i);

            if (child.name.indexOf("GeneratedNode__") === 0) {
                print("Reset deleting " + child.name);
                child.destroy();
            }
        }
    }
}