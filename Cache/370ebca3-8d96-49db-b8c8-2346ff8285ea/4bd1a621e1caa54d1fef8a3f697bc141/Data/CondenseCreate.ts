import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";

@component
export class CondenseCreate extends BaseScriptComponent {
    @input
    childTemplate: SceneObject;

    @input
    childOffsetX: number = 15;

    @input
    childOffsetY: number = 0;

    @input
    childOffsetZ: number = 0;

    private interactable: Interactable;
    private static nextId: number = 0;
    private locked: boolean = false;

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => {
            this.onStart();
        });
    }

    onStart() {
        this.interactable = this.getSceneObject().getComponent(
            Interactable.getTypeName()
        ) as unknown as Interactable;

        if (!this.interactable) {
            print("ERROR: No Interactable on " + this.getSceneObject().name);
            return;
        }

        if (!this.childTemplate) {
            print("ERROR: No Child Template on " + this.getSceneObject().name);
            return;
        }

        this.interactable.onTriggerStart.add(() => {
            if (this.locked) {
                return;
            }

            this.locked = true;
            this.toggleFolder();
        });

        this.interactable.onTriggerEnd.add(() => {
            this.locked = false;
        });

        print("CondenseCreate ready on " + this.getSceneObject().name);
    }

    private toggleFolder() {
        var existingChild = this.findDirectGeneratedChild();

        if (existingChild) {
            print("Condensing " + this.getSceneObject().name);
            existingChild.destroy();
        } else {
            print("Expanding " + this.getSceneObject().name);
            this.createChildFolder();
        }
    }

    private createChildFolder() {
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

        print("Created " + newBox.name);
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