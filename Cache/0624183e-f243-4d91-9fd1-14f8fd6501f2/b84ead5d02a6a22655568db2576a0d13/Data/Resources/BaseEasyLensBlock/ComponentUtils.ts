/**
 * Recursively assigns a render layer to a scene object and all its children
 * @param root - The root scene object to start from
 * @param layer - The layer to assign
 */
export function assignRenderLayerRecursively(root: SceneObject, layer: LayerSet): void {
    forEachChild(root, (so: SceneObject) => {
        so.layer = layer;
    });
}

/**
 * Safely instantiates a prefab and assigns it to the same layer as the parent scene object
 * @param prefab - The prefab to instantiate
 * @param parent - Parent scene object (its layer will be used)
 * @returns The instantiated scene object or null if failed
 */
export function instantiatePrefabWithSceneObjectLayer(prefab: ObjectPrefab, parent: SceneObject): SceneObject | null {
    if (!prefab) {
        print("ComponentUtils error: Prefab is null");
        return null;
    }

    const instantiated = prefab.instantiate(parent);
    
    assignRenderLayerRecursively(instantiated, parent.layer);

    return instantiated;
}

/**
 * Ensures a scene object has a specific component type, creates one if missing
 * @param sceneObject - Scene object to check
 * @param componentType - Component type string (e.g., "Component.ScreenTransform")
 * @returns The component
 */
export function ensureComponent<T extends Component>(sceneObject: SceneObject, componentType: string): T {
    let component = sceneObject.getComponent(componentType as any);

    if (!component) {
        component = sceneObject.createComponent(componentType as any);
    }

    return component as T;
}

/**
 * Recursively applies a function to a scene object and all its children
 * @param sceneObject - The scene object to start from
 * @param func - The function to apply to each scene object
 */
export function forEachChild(sceneObject: SceneObject, func: (so: SceneObject) => void): void {
    func(sceneObject);
    sceneObject.children.forEach(child => forEachChild(child, func));
}