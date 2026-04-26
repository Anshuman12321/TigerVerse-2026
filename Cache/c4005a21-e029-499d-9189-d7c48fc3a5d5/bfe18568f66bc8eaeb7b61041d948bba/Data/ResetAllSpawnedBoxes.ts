@component
export class ResetAllSpawnedBoxes extends BaseScriptComponent {
    @input
    searchRoot: SceneObject;

    public resetSpawnedBoxes() {
        if (!this.searchRoot) {
            print("ERROR: Search Root is missing.");
            return;
        }

        this.deleteGeneratedFolders(this.searchRoot);

        print("Reset complete: deleted all generated folders.");
    }

    private deleteGeneratedFolders(obj: SceneObject) {
        for (var i = obj.getChildrenCount() - 1; i >= 0; i--) {
            var child = obj.getChild(i);

            this.deleteGeneratedFolders(child);

            if (child.name.indexOf("GeneratedFolder_") === 0) {
                print("Deleting generated folder: " + child.name);
                child.destroy();
            }
        }
    }
}