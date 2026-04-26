import { FolderBox } from "./FolderBox";

@component
export class ResetAllSpawnedBoxes extends BaseScriptComponent {
    @input
    searchRoot: SceneObject;

    @input
    rootFolder: FolderBox;

    public resetSpawnedBoxes() {
        if (!this.searchRoot) {
            print("ERROR: Search Root is missing.");
            return;
        }

        this.deleteGeneratedFolders(this.searchRoot);

        if (this.rootFolder) {
            this.rootFolder.resetFolderState();
        }

        print("Reset complete.");
    }

    private deleteGeneratedFolders(obj: SceneObject) {
        for (var i = obj.getChildrenCount() - 1; i >= 0; i--) {
            var child = obj.getChild(i);

            this.deleteGeneratedFolders(child);

            if (child.name.indexOf("GeneratedFolder_") === 0) {
                print("Deleting: " + child.name);
                child.destroy();
            }
        }
    }
}