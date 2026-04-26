@component
export class DragSquare extends BaseScriptComponent {
  @input
  worldCamera: Camera;

  @input
  clickRadius: number = 0.12;

  private isDragging: boolean = false;
  private dragDepth: number = 60.0;
  private worldOffset: vec3 = vec3.zero();
  private transform: Transform;

  onAwake(): void {
    this.transform = this.getSceneObject().getTransform();

    this.createEvent("TouchStartEvent").bind((ev: any) => this.onTouchStart(ev));
    this.createEvent("TouchMoveEvent").bind((ev: any) => this.onTouchMove(ev));
    this.createEvent("TouchEndEvent").bind(() => this.onTouchEnd());
  }

  private getTouchPosition(ev: any): vec2 | null {
    if (!ev || !ev.getTouchPosition) {
      return null;
    }
    return ev.getTouchPosition();
  }

  private isTouchNearObject(screenPos: vec2): boolean {
    const worldPos = this.transform.getWorldPosition();
    const objectScreenPos = this.worldCamera.worldSpaceToScreenSpace(worldPos);
    const delta = screenPos.sub(objectScreenPos);
    return delta.length <= this.clickRadius;
  }

  private getDepthFromCamera(worldPos: vec3): number {
    const cameraPos = this.worldCamera.getTransform().getWorldPosition();
    return worldPos.sub(cameraPos).length;
  }

  private onTouchStart(ev: any): void {
    if (!this.worldCamera) {
      return;
    }

    const touchPos = this.getTouchPosition(ev);
    if (!touchPos || !this.isTouchNearObject(touchPos)) {
      return;
    }

    const currentPos = this.transform.getWorldPosition();
    this.dragDepth = this.getDepthFromCamera(currentPos);
    const touchWorldPos = this.worldCamera.screenSpaceToWorldSpace(touchPos, this.dragDepth);

    this.worldOffset = currentPos.sub(touchWorldPos);
    this.isDragging = true;
  }

  private onTouchMove(ev: any): void {
    if (!this.isDragging || !this.worldCamera) {
      return;
    }

    const touchPos = this.getTouchPosition(ev);
    if (!touchPos) {
      return;
    }

    const touchWorldPos = this.worldCamera.screenSpaceToWorldSpace(touchPos, this.dragDepth);
    this.transform.setWorldPosition(touchWorldPos.add(this.worldOffset));
  }

  private onTouchEnd(): void {
    this.isDragging = false;
  }
}
