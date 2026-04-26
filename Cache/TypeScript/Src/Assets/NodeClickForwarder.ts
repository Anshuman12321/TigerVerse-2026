import { TreeManager } from "./TreeManager";

@component
export class NodeClickForwarder extends BaseScriptComponent {
    onAwake() {
        var interactable = this.findInteractableOnThisObject();

        if (!interactable) {
            print("NodeClickForwarder ERROR: No Interactable found on " + this.sceneObject.name);
            return;
        }

        if (interactable.onTriggerStart) {
            interactable.onTriggerStart.add(() => {
                this.forwardClick();
            });

            print("NodeClickForwarder bound onTriggerStart for " + this.sceneObject.name);
            return;
        }

        if (interactable.onTriggerEnd) {
            interactable.onTriggerEnd.add(() => {
                this.forwardClick();
            });

            print("NodeClickForwarder bound onTriggerEnd for " + this.sceneObject.name);
            return;
        }

        print("NodeClickForwarder ERROR: No usable trigger event on " + this.sceneObject.name);
    }

    private findInteractableOnThisObject(): any {
        var components = this.sceneObject.getComponents("Component.ScriptComponent");

        for (var i = 0; i < components.length; i++) {
            var comp: any = components[i];

            if (comp.onTriggerStart || comp.onTriggerEnd) {
                return comp;
            }
        }

        return null;
    }

    public forwardClick() {
        print("FORWARD CLICK CALLED ON " + this.sceneObject.name);

        if (!TreeManager.instance) {
            print("TreeManager.instance missing");
            return;
        }

        var nodePath = this.getNodePath();

        if (nodePath == "") {
            print("No node path found on " + this.sceneObject.name);
            return;
        }

        print("CLICKED NODE: " + nodePath);
        TreeManager.instance.onNodeClicked(nodePath);
    }

    private getNodePath(): string {
        var prefix = "NODE__";
        var objName = this.sceneObject.name;

        if (objName.indexOf(prefix) == 0) {
            return objName.substring(prefix.length);
        }

        return "";
    }
}