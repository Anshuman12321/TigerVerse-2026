@component
export class TreeNodeData extends BaseScriptComponent {
    @input
    uid: string = "";

    @input
    nodeId: string = "";

    @input
    label: string = "";

    @input
    parentUid: string = "";
}