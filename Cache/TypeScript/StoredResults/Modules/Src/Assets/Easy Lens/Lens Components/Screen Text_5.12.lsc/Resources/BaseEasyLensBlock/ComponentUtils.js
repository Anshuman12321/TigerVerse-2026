"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignRenderLayerRecursively = assignRenderLayerRecursively;
exports.instantiatePrefabWithSceneObjectLayer = instantiatePrefabWithSceneObjectLayer;
exports.ensureComponent = ensureComponent;
exports.forEachChild = forEachChild;
/**
 * Recursively assigns a render layer to a scene object and all its children
 * @param root - The root scene object to start from
 * @param layer - The layer to assign
 */
function assignRenderLayerRecursively(root, layer) {
    forEachChild(root, (so) => {
        so.layer = layer;
    });
}
/**
 * Safely instantiates a prefab and assigns it to the same layer as the parent scene object
 * @param prefab - The prefab to instantiate
 * @param parent - Parent scene object (its layer will be used)
 * @returns The instantiated scene object or null if failed
 */
function instantiatePrefabWithSceneObjectLayer(prefab, parent) {
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
function ensureComponent(sceneObject, componentType) {
    let component = sceneObject.getComponent(componentType);
    if (!component) {
        component = sceneObject.createComponent(componentType);
    }
    return component;
}
/**
 * Recursively applies a function to a scene object and all its children
 * @param sceneObject - The scene object to start from
 * @param func - The function to apply to each scene object
 */
function forEachChild(sceneObject, func) {
    func(sceneObject);
    sceneObject.children.forEach(child => forEachChild(child, func));
}
//# sourceMappingURL=ComponentUtils.js.map