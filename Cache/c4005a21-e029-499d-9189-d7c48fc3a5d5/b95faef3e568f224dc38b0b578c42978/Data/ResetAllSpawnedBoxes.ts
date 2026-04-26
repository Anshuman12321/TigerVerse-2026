import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";

@component
export class ResetAllSpawnedBoxes extends BaseScriptComponent {
    @input
    resetInteractable: Interactable;

    @input
    searchRoot: SceneObject;

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => {
            this.onStart();
        });
    }

    onStart() {
        if (!this.resetInteractable) {
            print("ERROR: Drag ResetButton's Interactable into Reset Interactable.");
            return;
        }

        if (!this.searchRoot) {
            print("ERROR: Drag ExampleSurface into Search Root.");
            return;
        }

        this.resetInteractable.onTriggerStart.add(() => {
            this.deleteSpawnedBoxesRecursive(this.searchRoot);
            print("Deleted all spawned boxes.");
        });
    }

    private deleteSpawnedBoxesRecursive(obj: SceneObject) {
        var childCount = obj.getChildrenCount();

        for (var i = childCount - 1; i >= 0; i--) {
            var child = obj.getChild(i);
            this.deleteSpawnedBoxesRecursive(child);
        }

        if (obj.name.indexOf("SpawnedBox_") === 0) {
            obj.destroy();
        }
    }
}