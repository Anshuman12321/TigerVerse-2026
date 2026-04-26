import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";

@component
export class CondenseCreate extends BaseScriptComponent {
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
        var existingChild = this.findDirectGeneratedChild();

        if (existingChild) {
            existingChild.destroy();
            print("Condensed " + this.getSceneObject().name);
        } else {
            this.expand();
        }
    }

    private expand() {
        var newBox = this.childTemplate.copyWholeHierarchy(this.getSceneObject());

        newBox.name = "GeneratedFolder_" + CondenseCreate.nextId;
        CondenseCreate.nextId++;

        newBox.enabled = true;

        newBox.getTransform().setLocalPosition(new vec3(
            this.childOffsetX,
            this.childOffsetY,
            this.childOffsetZ
        ));

        newBox.getTransform().setLocalScale(new vec3(1, 1, 1));

        print("Expanded " + this.getSceneObject().name + " into " + newBox.name);
    }

    private findDirectGeneratedChild(): SceneObject {
        for (var i = 0; i < this.getSceneObject().getChildrenCount(); i++) {
            var child = this.getSceneObject().getChild(i);

            if (child.name.indexOf("GeneratedFolder_") === 0) {
                return child;
            }
        }

        return null;
    }
}