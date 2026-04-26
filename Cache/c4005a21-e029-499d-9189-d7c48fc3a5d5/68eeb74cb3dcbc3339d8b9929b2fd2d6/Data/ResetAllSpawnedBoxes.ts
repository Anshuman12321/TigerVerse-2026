@component
export class ResetAllSpawnedBoxes extends BaseScriptComponent {
    @input
    searchRoot: SceneObject;

    public resetSpawnedBoxes() {
        if (!this.searchRoot) {
            print("ERROR: Search Root is missing.");
            return;
        }

        this.deleteSpawnedBoxes(this.searchRoot);
        print("Reset: deleted all spawned boxes.");
    }

    private deleteSpawnedBoxes(obj: SceneObject) {
        for (var i = obj.getChildrenCount() - 1; i >= 0; i--) {
            var child = obj.getChild(i);

            this.deleteSpawnedBoxes(child);

            if (child.name.indexOf("SpawnedBox_") === 0) {
                print("Deleting: " + child.name);
                child.destroy();
            }
        }
    }
}