import { TreeManager } from "./TreeManager";

@component
export class NodeClickForwarder extends BaseScriptComponent {
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

        TreeManager.instance.onNodeClicked(nodePath);
        print("CLICKED NODE: " + nodePath);
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