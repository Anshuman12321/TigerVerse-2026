@component
export class ResetAllSpawnedBoxes extends BaseScriptComponent {
    @input
    searchRoot: SceneObject;

    public resetSpawnedBoxes() {
        if (!this.searchRoot) {
            print("ERROR: Missing Search Root.");
            return;
        }

        this.deleteGenerated(this.searchRoot);
        print("Reset complete.");
    }

    private deleteGenerated(obj: SceneObject) {
        for (var i = obj.getChildrenCount() - 1; i >= 0; i--) {
            var child = obj.getChild(i);

            this.deleteGenerated(child);

            if (child.name.indexOf("GeneratedFolder_") === 0) {
                child.destroy();
            }
        }
    }
}