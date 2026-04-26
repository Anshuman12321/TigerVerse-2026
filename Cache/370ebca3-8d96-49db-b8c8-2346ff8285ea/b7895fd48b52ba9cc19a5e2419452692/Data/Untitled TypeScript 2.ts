import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";

@component
export class FolderBox extends BaseScriptComponent {
    @input
    interactable: Interactable;

    @input
    childTemplate: SceneObject;

    private childBox: SceneObject = null;
    private isOpen: boolean = false;

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => {
            this.onStart();
        });
    }

    onStart() {
        if (!this.interactable) {
            print("ERROR: Drag this box's Interactable into Interactable.");
            return;
        }

        if (!this.childTemplate) {
            print("ERROR: Drag BoxTemplate into Child Template.");
            return;
        }

        this.interactable.onTriggerStart.add(() => {
            this.toggleFolder();
        });
    }

    private toggleFolder() {
        if (this.isOpen) {
            this.condense();
        } else {
            this.expand();
        }
    }

    private expand() {
        var parent = this.getSceneObject().getParent();

        this.childBox = this.childTemplate.copyWholeHierarchy(parent);
        this.childBox.name = "FolderBox_Child";

        var myPos = this.getSceneObject().getTransform().getWorldPosition();

        this.childBox.getTransform().setWorldPosition(new vec3(
            myPos.x + 15,
            myPos.y,
            myPos.z
        ));

        this.childBox.getTransform().setLocalScale(new vec3(1, 1, 1));
        this.childBox.enabled = true;

        this.isOpen = true;

        print("Expanded folder box.");
    }

    private condense() {
        if (this.childBox) {
            this.childBox.destroy();
            this.childBox = null;
        }

        this.isOpen = false;

        print("Condensed folder box.");
    }
}