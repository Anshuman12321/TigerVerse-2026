"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DestructionHelper = void 0;
class DestructionHelper {
    constructor() {
        this.objectsToDestroy = [];
    }
    destroy() {
        const errs = [];
        this.objectsToDestroy
            .splice(0)
            .forEach((obj) => {
            if (!isNull(obj) && typeof obj.destroy == "function") {
                try {
                    obj.destroy();
                }
                catch (e) {
                    errs.push(e);
                    this.objectsToDestroy.push(obj);
                }
            }
        });
        if (this.objectsToDestroy.length > 0) {
            throw new Error("Could not destroy " + this.objectsToDestroy.length + " objects: \n" + errs.join("\n"));
        }
    }
    markForDestroy(obj) {
        this.objectsToDestroy.push(obj);
    }
    getOrAddComponent(so, componentType) {
        const component = so.getComponent(componentType);
        if (isNull(component)) {
            return this.createComponent(so, componentType);
        }
        return component;
    }
    addOrOverrideComponent(so, componentType) {
        const component = so.getComponent(componentType);
        if (!isNull(component)) {
            component.destroy();
        }
        return this.createComponent(so, componentType);
    }
    createSceneObject(parent, name) {
        const so = global.scene.createSceneObject(name ? name : "");
        so.setParent(parent ? parent : null);
        this.objectsToDestroy.push(so);
        return so;
    }
    createComponent(so, componentType) {
        const component = so.createComponent(componentType);
        this.objectsToDestroy.push(component);
        return component;
    }
    createExtentsTarget(parent, visual, name) {
        const extentsSO = this.createSceneObject(parent, name);
        visual.extentsTarget = this.createComponent(extentsSO, "ScreenTransform");
        return extentsSO;
    }
    instantiatePrefab(prefab, parent, name) {
        const so = prefab.instantiate(parent);
        so.name = name;
        this.objectsToDestroy.push(so);
        return so;
    }
}
exports.DestructionHelper = DestructionHelper;
//# sourceMappingURL=DestructionHelper.js.map