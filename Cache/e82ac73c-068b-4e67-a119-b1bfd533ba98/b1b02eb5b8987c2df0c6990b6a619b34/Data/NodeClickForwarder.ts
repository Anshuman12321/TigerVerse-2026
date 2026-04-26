import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";
import { TreeManager } from "./TreeManager";

@component
export class NodeClickForwarder extends BaseScriptComponent {
    @input
    interactable: Interactable;

    private ready: boolean = false;
    private hasBound: boolean = false;

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => {
            this.onStart();
        });
    }

    private onStart() {
        if (!this.interactable) {
            print("ERROR: NodeClickForwarder missing Interactable on " + this.getSceneObject().name);
            return;
        }

        // Important:
        // Do NOT immediately return if the name is BoxTemplate.
        // Copied objects may briefly start as BoxTemplate before TreeManager renames them.
        var delay = this.createEvent("DelayedCallbackEvent");

        delay.bind(() => {
            this.tryBindAfterRename();
        });

        delay.reset(0.3);
    }

    private tryBindAfterRename() {
        var obj = this.getSceneObject();
        var objName = obj.name;

        // Original template should not be clickable.
        if (objName === "BoxTemplate") {
            print("NodeClickForwarder ignored original BoxTemplate.");
            return;
        }

        // Generated nodes must start with TreeNode__
        if (objName.indexOf("TreeNode__") !== 0) {
            print("NodeClickForwarder ignored non-tree object: " + objName);
            return;
        }

        if (this.hasBound) {
            return;
        }

        this.hasBound = true;
        this.ready = true;

        this.interactable.onTriggerEnd.add(() => {
            if (!this.ready) {
                return;
            }

            if (!TreeManager.instance) {
                print("ERROR: TreeManager instance not found.");
                return;
            }

            TreeManager.instance.onGeneratedNodeClickedByName(this.getSceneObject().name);
        });

        print("NODE CLICK READY: " + objName);
    }
}