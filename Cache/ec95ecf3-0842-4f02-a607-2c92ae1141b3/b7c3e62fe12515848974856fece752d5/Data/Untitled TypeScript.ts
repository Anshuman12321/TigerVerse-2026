import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";

@component
export class NewScript extends BaseScriptComponent {
    @input
    surfaceMaterial: Material;

    private interactable: Interactable;

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => {
            this.onStart();
        });
    }

    onStart() {
        this.interactable = this.sceneObject.getComponent(
            Interactable.getTypeName()
        );

        if (!this.interactable) {
            print("ERROR: Add an Interactable component to this object.");
            return;
        }

        print("Interactable found. Script is working.");

        this.interactable.onHoverEnter.add(() => {
            print("Hover entered");

            if (this.surfaceMaterial) {
                this.surfaceMaterial.mainPass.baseColor = new vec4(1, 1, 0, 1); // yellow
            }
        });

        this.interactable.onHoverExit.add(() => {
            print("Hover exited");

            if (this.surfaceMaterial) {
                this.surfaceMaterial.mainPass.baseColor = new vec4(1, 1, 1, 1); // white
            }
        });

        this.interactable.onTriggerStart.add(() => {
            print("Pinched / clicked");

            if (this.surfaceMaterial) {
                this.surfaceMaterial.mainPass.baseColor = new vec4(1, 0, 0, 1); // red
            }
        });

        this.interactable.onTriggerEnd.add(() => {
            print("Released");

            if (this.surfaceMaterial) {
                this.surfaceMaterial.mainPass.baseColor = new vec4(0, 1, 0, 1); // green
            }
        });
    }
}