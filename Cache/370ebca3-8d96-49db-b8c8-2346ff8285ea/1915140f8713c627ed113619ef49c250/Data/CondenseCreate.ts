import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";

@component
export class CondenseCreate extends BaseScriptComponent {
    @input
    interactable: Interactable;

    @input
    boxTemplate: SceneObject;

    @input
    offsetX: number = 15;

    private childBox: SceneObject = null;
    private isOpen: boolean = false;
    private static nextId: number = 0;

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => {
            this.onStart();
        });
    }

    onStart() {
        if (!this.interactable) {
            print("ERROR: Missing Interactable on " + this.getSceneObject().name);
            return;
        }

        if (!this.boxTemplate) {
            print("ERROR: Missing Box Template on " + this.getSceneObject().name);
            return;
        }

        print("CondenseCreate ready on " + this.getSceneObject().name);

        this.interactable.onTriggerStart.add(() => {
            this.toggle();
        });
    }

    private toggle() {
        if (this.isOpen) {
            this.closeFolder();
        } else {
            this.openFolder();
        }
    }

    private openFolder() {
        // If the child was deleted by reset or something else, clean it up first
        if (this.childBox && isNull(this.childBox)) {
            this.childBox = null;
        }

        // Do not make more than one child
        if (this.childBox) {
            this.isOpen = true;
            return;
        }

        this.childBox = this.boxTemplate.copyWholeHierarchy(this.getSceneObject().getParent());

        this.childBox.name = "GeneratedFolder_" + CondenseCreate.nextId;
        CondenseCreate.nextId++;

        this.childBox.enabled = true;

        var myPos = this.getSceneObject().getTransform().getWorldPosition();

        this.childBox.getTransform().setWorldPosition(new vec3(
            myPos.x,
            myPos.y + this.offsetX,
            myPos.z
        ));

        this.childBox.getTransform().setLocalScale(new vec3(1, 1, 1));

        this.isOpen = true;

        print("Opened " + this.getSceneObject().name + " -> " + this.childBox.name);
    }

    private closeFolder() {
        if (this.childBox && !isNull(this.childBox)) {
            this.childBox.destroy();
        }

        this.childBox = null;
        this.isOpen = false;

        print("Closed " + this.getSceneObject().name);
    }
}