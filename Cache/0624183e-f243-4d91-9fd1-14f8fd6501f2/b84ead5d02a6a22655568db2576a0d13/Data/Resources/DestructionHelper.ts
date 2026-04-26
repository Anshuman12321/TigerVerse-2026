export type Destroyable = { destroy(): void };

export class DestructionHelper implements Destroyable {
    protected readonly objectsToDestroy: Destroyable[] = [];

    destroy(): void {
        const errs: any[] = [];
        this.objectsToDestroy
            .splice(0)
            .forEach((obj: Destroyable) => {
                if (!isNull(obj) && typeof obj.destroy == "function") {
                    try {
                        obj.destroy();
                    } catch (e) {
                        errs.push(e);
                        this.objectsToDestroy.push(obj);
                    }
                }
            });
        if (this.objectsToDestroy.length > 0) {
            throw new Error("Could not destroy " + this.objectsToDestroy.length + " objects: \n" + errs.join("\n"));
        }
    }

    markForDestroy(obj: Destroyable): void {
        this.objectsToDestroy.push(obj);
    }

    getOrAddComponent<K extends keyof ComponentNameMap>(so: SceneObject, componentType: K): ComponentNameMap[K] {
        const component: ComponentNameMap[K] = so.getComponent(componentType);
        if (isNull(component)) {
            return this.createComponent(so, componentType);
        }
        return component;
    }

    addOrOverrideComponent<K extends keyof ComponentNameMap>(so: SceneObject, componentType: K): ComponentNameMap[K] {
        const component: ComponentNameMap[K] = so.getComponent(componentType);
        if (!isNull(component)) {
            component.destroy();
        }
        return this.createComponent(so, componentType);
    }

    createSceneObject(parent?: SceneObject, name?: string): SceneObject {
        const so: SceneObject = global.scene.createSceneObject(name ? name : "");
        so.setParent(parent ? parent : null);
        this.objectsToDestroy.push(so);
        return so;
    }

    createComponent<K extends keyof ComponentNameMap>(so: SceneObject, componentType: K): ComponentNameMap[K] {
        const component: ComponentNameMap[K] = so.createComponent(componentType);
        this.objectsToDestroy.push(component);
        return component;
    }

    createExtentsTarget(parent: SceneObject, visual: BaseMeshVisual, name: string): SceneObject {
        const extentsSO: SceneObject = this.createSceneObject(parent, name);
        visual.extentsTarget = this.createComponent(extentsSO, "ScreenTransform");
        return extentsSO;
    }

    instantiatePrefab(prefab: ObjectPrefab, parent: SceneObject, name: string): SceneObject {
        const so: SceneObject = prefab.instantiate(parent);
        so.name = name;
        this.objectsToDestroy.push(so);
        return so;
    }
}