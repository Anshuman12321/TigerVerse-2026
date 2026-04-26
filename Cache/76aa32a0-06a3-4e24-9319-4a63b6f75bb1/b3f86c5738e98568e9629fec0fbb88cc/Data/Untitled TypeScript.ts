import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";

@component
export class NewScript extends BaseScriptComponent {
    @input
    surfaceMaterial: Material;

    private interactable: Interactable | null = null;

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => {
            this.onStart();
        });
    }

    onStart() {
        const interactableTypeName = Interactable.getTypeName();

        this.interactable = this.getSceneObject().getComponent(interactableTypeName) as Interactable;

        if (isNull(this.interactable)) {
            print("ERROR: Interactable component not found. Add Interactable to this same object.");
            return;
        }

        print("SUCCESS: Interactable found.");

        this.interactable.onHoverEnter.add(() => {
            print("Hover entered");

            if (this.surfaceMaterial) {
                this.surfaceMaterial.mainPass.baseColor = new vec4(1, 1, 0, 1);
            }
        });

        this.interactable.onHoverExit.add(() => {
            print("Hover exited");

            if (this.surfaceMaterial) {
                this.surfaceMaterial.mainPass.baseColor = new vec4(1, 1, 1, 1);
            }
        });

        this.interactable.onTriggerStart.add(() => {
            print("Pinch started");

            if (this.surfaceMaterial) {
                this.surfaceMaterial.mainPass.baseColor = new vec4(1, 0, 0, 1);
            }
        });

        this.interactable.onTriggerEnd.add(() => {
            print("Pinch ended");

            if (this.surfaceMaterial) {
                this.surfaceMaterial.mainPass.baseColor = new vec4(0, 1, 0, 1);
            }
        });
    }
}