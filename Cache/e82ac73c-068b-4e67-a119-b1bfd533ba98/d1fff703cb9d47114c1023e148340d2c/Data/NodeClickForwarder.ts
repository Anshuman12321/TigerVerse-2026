import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";
import { TreeManager } from "./TreeManager";

@component
export class NodeClickForwarder extends BaseScriptComponent {
    @input
    interactable: Interactable;

    private ready: boolean = false;

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => {
            this.onStart();
        });
    }

    private onStart() {
        // Ignore the original template. Only generated copies should forward clicks.
        if (this.getSceneObject().name === "BoxTemplate") {
            return;
        }

        if (!this.interactable) {
            print("ERROR: NodeClickForwarder missing Interactable on " + this.getSceneObject().name);
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

            TreeManager.instance.onGeneratedNodeClicked(this.getSceneObject());
        });

        print("NODE CLICK FORWARDER READY: " + this.getSceneObject().name);
    }
}