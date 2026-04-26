@component
export class ResetAllSpawnedBoxes extends BaseScriptComponent {
    @input
    searchRoot: SceneObject;

    public resetSpawnedBoxes() {
        if (!this.searchRoot) {
            print("ERROR: Search Root is missing.");
            return;
        }

        this.deleteGeneratedBoxes(this.searchRoot);
        print("Reset: deleted all generated boxes.");
    }

    private deleteGeneratedBoxes(obj: SceneObject) {
        for (var i = obj.getChildrenCount() - 1; i >= 0; i--) {
            var child = obj.getChild(i);

            this.deleteGeneratedBoxes(child);

            if (
                child.name.indexOf("SpawnedBox_") === 0 ||
                child.name.indexOf("FolderBox_Child") === 0
            ) {
                print("Deleting: " + child.name);
                child.destroy();
            }
        }
    }
}