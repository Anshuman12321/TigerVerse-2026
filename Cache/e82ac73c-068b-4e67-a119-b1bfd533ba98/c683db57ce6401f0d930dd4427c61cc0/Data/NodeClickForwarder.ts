import { TreeManager } from "./TreeManager";

@component
export class NodeClickForwarder extends BaseScriptComponent {
    @input interactable: any;

    onAwake() {
        if (!this.interactable) {
            print("NodeClickForwarder: Interactable input is missing on " + this.sceneObject.name);
            return;
        }

        if (this.interactable.onTriggerEnd) {
            this.interactable.onTriggerEnd.add(() => {
                this.forwardClick();
            });

            print("NodeClickForwarder bound onTriggerEnd for " + this.sceneObject.name);
            return;
        }

        if (this.interactable.onTriggerStart) {
            this.interactable.onTriggerStart.add(() => {
                this.forwardClick();
            });

            print("NodeClickForwarder bound onTriggerStart for " + this.sceneObject.name);
            return;
        }

        print("NodeClickForwarder: Could not find trigger event on " + this.sceneObject.name);
    }

    public forwardClick() {
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