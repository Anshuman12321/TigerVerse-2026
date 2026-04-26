@component
export class TreeNodeData extends BaseScriptComponent {
    @input nodeId: string = "";
    @input label: string = "";
    @input path: string = "";
    @input parentPath: string = "";
    @input depth: number = 0;

    public setup(
        nodeId: string,
        label: string,
        path: string,
        parentPath: string,
        depth: number
    ) {
        this.nodeId = nodeId;
        this.label = label;
        this.path = path;
        this.parentPath = parentPath;
        this.depth = depth;
    }
}