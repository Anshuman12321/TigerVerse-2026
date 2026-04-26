import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";
import { TreeManager } from "./TreeManager";
import { TreeNodeData } from "./TreeNodeData";

@component
export class NodeClickForwarder extends BaseScriptComponent {
    @input
    interactable: Interactable;

    @input
    nodeData: TreeNodeData;

    private ready: boolean = false;

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => {
            this.onStart();
        });
    }

    private onStart() {
        if (this.getSceneObject().name === "BoxTemplate") {
            print("NodeClickForwarder loaded on template only.");
            return;
        }

        if (!this.interactable) {
            print("ERROR: Missing Interactable on " + this.getSceneObject().name);
            return;
        }

        if (!this.nodeData) {
            print("ERROR: Missing TreeNodeData on " + this.getSceneObject().name);
            return;
        }

        var delay = this.createEvent("DelayedCallbackEvent");

        delay.bind(() => {
            this.ready = true;
        });

        delay.reset(0.25);

        this.interactable.onTriggerEnd.add(() => {
            if (!this.ready) {
                return;
            }

            if (!TreeManager.instance) {
                print("ERROR: TreeManager instance not found.");
                return;
            }

            TreeManager.instance.onGeneratedNodeClicked(this.nodeData.uid);
        });

        print("NODE CLICK READY: " + this.nodeData.label + " uid=" + this.nodeData.uid);
    }
}