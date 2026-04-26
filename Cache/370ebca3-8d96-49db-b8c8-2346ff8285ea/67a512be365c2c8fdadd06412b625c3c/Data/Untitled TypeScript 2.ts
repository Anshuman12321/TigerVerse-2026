import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";

@component
export class ButtonCreateBox extends BaseScriptComponent {
    @input
    buttonInteractable: Interactable;

    @input
    boxTemplate: SceneObject;

    private spawnCount: number = 0;

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => {
            this.onStart();
        });
    }

    onStart() {
        if (!this.buttonInteractable) {
            print("ERROR: Drag SpawnButton's Interactable into Button Interactable.");
            return;
        }

        if (!this.boxTemplate) {
            print("ERROR: Drag BoxTemplate into Box Template.");
            return;
        }

        this.buttonInteractable.onTriggerStart.add(() => {
            this.createNewBox();
        });
    }

    private createNewBox() {
        var parent = this.getSceneObject().getParent();
        var newBox = this.boxTemplate.copyWholeHierarchy(parent);

        newBox.name = "SpawnedBox_" + this.spawnCount;
        newBox.enabled = true;

        var buttonPos = this.getSceneObject().getTransform().getWorldPosition();

        newBox.getTransform().setWorldPosition(new vec3(
            buttonPos.x + 20,
            buttonPos.y,
            buttonPos.z + this.spawnCount * 10
        ));

        this.spawnCount++;

        print("Created new box");
    }
}