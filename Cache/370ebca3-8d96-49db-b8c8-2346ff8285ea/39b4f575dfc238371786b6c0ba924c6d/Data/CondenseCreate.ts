import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";

@component
export class FolderBox extends BaseScriptComponent {
    @input
    interactable: Interactable;

    @input
    childTemplate: SceneObject;

    @input
    childOffsetX: number = 15;

    @input
    childOffsetY: number = 0;

    @input
    childOffsetZ: number = 0;

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

        if (!this.childTemplate) {
            print("ERROR: Missing Child Template on " + this.getSceneObject().name);
            return;
        }

        this.interactable.onTriggerStart.add(() => {
            this.toggleFolder();
        });
    }

    private toggleFolder() {
        // Important fix:
        // If reset deleted the child, clear the old reference.
        if (this.childBox && isNull(this.childBox)) {
            this.childBox = null;
            this.isOpen = false;
        }

        if (this.isOpen && this.childBox) {
            this.condense();
        } else {
            this.expand();
        }
    }

    private expand() {
        if (this.childBox && !isNull(this.childBox)) {
            return;
        }

        var parent = this.getSceneObject().getParent();
        var myTransform = this.getSceneObject().getTransform();
        var myPos = myTransform.getWorldPosition();

        this.childBox = this.childTemplate.copyWholeHierarchy(parent);

        this.childBox.name = "GeneratedFolder_" + FolderBox.nextId;
        FolderBox.nextId++;

        this.childBox.enabled = true;

        this.childBox.getTransform().setWorldPosition(new vec3(
            myPos.x + this.childOffsetX,
            myPos.y + this.childOffsetY,
            myPos.z + this.childOffsetZ
        ));

        this.childBox.getTransform().setLocalScale(new vec3(1, 1, 1));

        this.isOpen = true;

        print("Expanded: " + this.getSceneObject().name);
    }

    private condense() {
        if (this.childBox && !isNull(this.childBox)) {
            this.childBox.destroy();
        }

        this.childBox = null;
        this.isOpen = false;

        print("Condensed: " + this.getSceneObject().name);
    }

    public resetFolderState() {
        this.childBox = null;
        this.isOpen = false;
        print("Reset folder state: " + this.getSceneObject().name);
    }
}