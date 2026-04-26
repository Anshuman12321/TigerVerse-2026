//@input Asset.ObjectPrefab nodePrefab
//@input Asset.ObjectPrefab connectionPrefab
//@input float dataScale = 1.0
//@input float connectionThickness = 0.05
//@input float nodeSize = 1.0
//@input float depthSpacingY = 5.0
//@input float rootRadius = 10.0
//@input float childRadius = 5.0
//@input float slabHeight = 0.18
//@input float slabDepth = 0.65
//@input float tapMoveThreshold = 0.15
//@input bool collapseSiblingsOnExpand = false
//@input Asset.RenderMesh sphereMesh
//@input Asset.RenderMesh cylinderMesh
//@input Asset.RenderMesh boxMesh
//@input Asset.Material defaultNodeMaterial
//@input Asset.Material componentNodeMaterial
//@input Asset.Material moduleNodeMaterial
//@input Asset.Material slabNodeMaterial
//@input Asset.Material repositoryNodeMaterial
//@input Asset.Material connectionMaterial
//@input vec4 uiColor = {0.960784, 0.815686, 0.788235, 1.0}
//@input vec4 frontendColor = {0.905882, 0.756863, 0.721569, 1.0}
//@input vec4 backendColor = {0.172549, 0.180392, 0.2, 1.0}
//@input vec4 coreColor = {0.101961, 0.109804, 0.117647, 1.0}
//@input vec4 dataColor = {0.698039, 0.760784, 0.72549, 1.0}
//@input vec4 stateColor = {0.545098, 0.666667, 0.647059, 1.0}
//@input vec4 repositoryColor = {0.94902, 0.94902, 0.94902, 1.0}
//@input vec4 repositoryAltColor = {0.752941, 0.752941, 0.752941, 1.0}
//@input vec4 defaultNodeColor = {0.827451, 0.764706, 0.752941, 1.0}
//@input vec4 connectionColor = {0.878431, 0.878431, 0.878431, 1.0}

var visualizerData = require("./Data/VisualizerData");
var InteractableManipulation = require("SpectaclesInteractionKit.lspkg/Components/Interaction/InteractableManipulation/InteractableManipulation").InteractableManipulation;
var Interactable = require("SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable").Interactable;

var ROOT_PATH = "__visualizer_root__";
var spawnedNodes = {};
var fixedNodeScales = {};
var childPathsByParent = {};
var expandedState = {};
var connectionByChildPath = {};
var tierConnectionsByParentPath = {};
var rootPathByNodeId = {};
var rootConnectionKeys = {};
var activeConnections = [];

function callIfAvailable(target, methodName, args) {
    if (target && target[methodName]) {
        target[methodName].apply(target, args || []);
    }
}

function configureNodeManipulation(sceneObject, rootTransform) {
    var manipulation = sceneObject.getComponent(InteractableManipulation.getTypeName());

    if (!manipulation) {
        manipulation = sceneObject.createComponent(InteractableManipulation.getTypeName());
    }

    if (manipulation) {
        callIfAvailable(manipulation, "setManipulateRoot", [rootTransform]);
        callIfAvailable(manipulation, "setCanTranslate", [true]);
        callIfAvailable(manipulation, "setCanDrag", [true]);
        callIfAvailable(manipulation, "setCanScale", [false]);
        callIfAvailable(manipulation, "setCanRotate", [false]);
    }

    for (var i = 0; i < sceneObject.getChildrenCount(); i++) {
        var childManipulation = sceneObject.getChild(i).getComponent(InteractableManipulation.getTypeName());
        if (childManipulation) {
            configureNodeManipulation(sceneObject.getChild(i), rootTransform);
        }
    }
}

function getNodeId(nodeData) {
    return String(nodeData.id);
}

function getNodeLabel(nodeData) {
    return nodeData.title || nodeData.name || nodeData.label || getNodeId(nodeData);
}

function getNodeDescription(nodeData) {
    return nodeData.description || "";
}

function getRootTier(data) {
    if (data && data.tier && data.tier.nodes) {
        return data.tier;
    }

    if (data && data.root_layer && data.root_layer.nodes) {
        return normalizeLayerAsTier(data.root_layer);
    }

    return null;
}

function getChildTier(nodeData) {
    if (nodeData.tier && nodeData.tier.nodes) {
        return nodeData.tier;
    }

    if (nodeData.child_layer && nodeData.child_layer.nodes) {
        return normalizeLayerAsTier(nodeData.child_layer);
    }

    return null;
}

function normalizeLayerAsTier(layerData) {
    return {
        id: layerData.id,
        title: layerData.title,
        description: layerData.description || "",
        edges: layerData.edges,
        nodes: layerData.nodes
    };
}

function getDepthScale(depth) {
    if (depth === 1) {
        return 1.2;
    }

    return 1.0;
}

function getYForDepth(depth) {
    return (depth - 1) * script.depthSpacingY * script.dataScale;
}

function sanitizeName(value) {
    return String(value).replace(/[^A-Za-z0-9_]/g, "_");
}

function getNodeType(nodeData) {
    return String((nodeData && nodeData.type) || "").toLowerCase();
}

function getNodeCategory(nodeData) {
    return String((nodeData && nodeData.category) || "").toLowerCase();
}

function getColorOrFallback(color, fallback) {
    return color || fallback;
}

function getNodeColor(nodeData) {
    var category = getNodeCategory(nodeData);

    if (category === "ui") {
        return getColorOrFallback(script.uiColor, new vec4(0.960784, 0.815686, 0.788235, 1.0));
    }

    if (category === "frontend") {
        return getColorOrFallback(script.frontendColor, new vec4(0.905882, 0.756863, 0.721569, 1.0));
    }

    if (category === "backend") {
        return getColorOrFallback(script.backendColor, new vec4(0.172549, 0.180392, 0.2, 1.0));
    }

    if (category === "business_logic" || category === "api" || category === "integration" || category === "configuration") {
        return getColorOrFallback(script.coreColor, new vec4(0.101961, 0.109804, 0.117647, 1.0));
    }

    if (category === "data_access") {
        return getColorOrFallback(script.dataColor, new vec4(0.698039, 0.760784, 0.72549, 1.0));
    }

    if (category === "state_management") {
        return getColorOrFallback(script.stateColor, new vec4(0.545098, 0.666667, 0.647059, 1.0));
    }

    if (category === "repository") {
        return getColorOrFallback(script.repositoryColor, new vec4(0.94902, 0.94902, 0.94902, 1.0));
    }

    if (category === "tests") {
        return getColorOrFallback(script.repositoryAltColor, new vec4(0.752941, 0.752941, 0.752941, 1.0));
    }

    return getColorOrFallback(script.defaultNodeColor, new vec4(0.827451, 0.764706, 0.752941, 1.0));
}

function getTextColorForBackground(color) {
    var luminance = (color.x * 0.2126) + (color.y * 0.7152) + (color.z * 0.0722);
    return luminance > 0.58 ? new vec4(0.12, 0.11, 0.11, 1.0) : new vec4(1.0, 0.96, 0.94, 1.0);
}

function getNodeScale(nodeData, depth) {
    var radius = 0.36;

    if (nodeData.layout && nodeData.layout.suggested_radius) {
        radius = nodeData.layout.suggested_radius;
    }

    var size = script.nodeSize * radius * 2.5 * getDepthScale(depth);
    var slabHeight = script.slabHeight || 0.18;
    var slabDepth = script.slabDepth || 0.65;
    var nodeType = getNodeType(nodeData);

    if (nodeType === "component") {
        return new vec3(size * 1.45, size * Math.max(slabHeight * 0.85, 0.12), size * 1.45);
    }

    if (nodeType === "module") {
        return new vec3(size, size, size);
    }

    if (nodeType === "directory") {
        return new vec3(size * 1.55, size * Math.max(slabHeight * 0.8, 0.12), size * slabDepth);
    }

    return new vec3(size * 1.7, size * slabHeight, size * slabDepth);
}

function setVisible(obj, visible) {
    if (obj) {
        obj.enabled = visible;
    }
}

function setConnectionVisible(connectionObj, visible) {
    if (connectionObj) {
        connectionObj.enabled = visible;
    }
}

function getCompensatedTextScale(fixedScale, baseScale) {
    return new vec3(
        baseScale.x / Math.max(fixedScale.x, 0.001),
        baseScale.y / Math.max(fixedScale.y, 0.001),
        baseScale.z / Math.max(fixedScale.z, 0.001)
    );
}

function createTextChild(parentObject, name, localPosition, localScale) {
    var textObject = global.scene.createSceneObject(name);
    textObject.layer = parentObject.layer;
    textObject.setParent(parentObject);
    textObject.createComponent("Component.ScreenTransform");

    var textTransform = textObject.getTransform();
    textTransform.setLocalPosition(localPosition);
    textTransform.setLocalScale(localScale);

    return textObject.createComponent("Component.Text");
}

function getLabelLocalPosition(fixedScale) {
    var labelPadding = 0.18;
    var localY = 0.5 + (labelPadding / Math.max(fixedScale.y, 0.001));
    return new vec3(0, localY, 0);
}

function shortenText(value, maxLength) {
    var text = String(value || "");

    if (text.length <= maxLength) {
        return text;
    }

    return text.substring(0, maxLength - 3) + "...";
}

function formatNodeText(label, description) {
    var title = shortenText(label, 32);

    if (!description) {
        return title;
    }

    return title + "\n" + shortenText(description, 72);
}

function setTextColor(textComponent, color) {
    if (textComponent && textComponent.textFill) {
        textComponent.textFill.color = color;
    }
}

function configureText(textComponent, text, color) {
    if (!textComponent) {
        return;
    }

    textComponent.text = text;
    setTextColor(textComponent, color);
}

function setNodeText(sceneObject, label, description, fixedScale, textColor) {
    var labelTextComponent = null;
    var labelTextObject = null;
    var fallbackTextComponent = null;
    var fallbackTextObject = null;

    for (var i = 0; i < sceneObject.getChildrenCount(); i++) {
        var child = sceneObject.getChild(i);
        var textComponent = child.getComponent("Component.Text");

        if (textComponent) {
            if (child.name === "NodeLabel" || child.name === "Title" || child.name === "Label") {
                labelTextComponent = textComponent;
                labelTextObject = child;
            } else {
                fallbackTextComponent = textComponent;
                fallbackTextObject = child;
            }
        }
    }

    if (!labelTextComponent) {
        labelTextComponent = fallbackTextComponent || createTextChild(
            sceneObject,
            "NodeLabel",
            getLabelLocalPosition(fixedScale),
            getCompensatedTextScale(fixedScale, new vec3(0.22, 0.22, 0.22))
        );
        labelTextObject = fallbackTextObject;
    }

    if (labelTextObject) {
        var labelTransform = labelTextObject.getTransform();
        labelTransform.setLocalPosition(getLabelLocalPosition(fixedScale));
        labelTransform.setLocalScale(getCompensatedTextScale(fixedScale, new vec3(0.22, 0.22, 0.22)));
    }

    configureText(labelTextComponent, formatNodeText(label, description), textColor || new vec4(1, 1, 1, 1));
}

function getRenderMeshVisual(sceneObject) {
    var visual = sceneObject.getComponent("Component.RenderMeshVisual");

    if (visual) {
        return visual;
    }

    for (var i = 0; i < sceneObject.getChildrenCount(); i++) {
        visual = getRenderMeshVisual(sceneObject.getChild(i));
        if (visual) {
            return visual;
        }
    }

    return null;
}

function getNodeMesh(nodeData) {
    var nodeType = getNodeType(nodeData);

    if (nodeType === "component") {
        return script.cylinderMesh;
    }

    if (nodeType === "module") {
        return script.sphereMesh;
    }

    if (nodeType === "subsystem" || nodeType === "directory") {
        return script.boxMesh;
    }

    return null;
}

function getNodeMaterial(nodeData) {
    var nodeType = getNodeType(nodeData);
    var category = getNodeCategory(nodeData);

    if ((category === "repository" || category === "tests") && script.repositoryNodeMaterial) {
        return script.repositoryNodeMaterial;
    }

    if (nodeType === "component" && script.componentNodeMaterial) {
        return script.componentNodeMaterial;
    }

    if (nodeType === "module" && script.moduleNodeMaterial) {
        return script.moduleNodeMaterial;
    }

    if ((nodeType === "subsystem" || nodeType === "directory") && script.slabNodeMaterial) {
        return script.slabNodeMaterial;
    }

    return script.defaultNodeMaterial;
}

function cloneMaterial(material) {
    if (material && material.clone) {
        return material.clone();
    }

    return material;
}

function setPassProperty(pass, propertyName, value) {
    if (!pass) {
        return;
    }

    try {
        pass[propertyName] = value;
    } catch (error) {
    }
}

function getDimmedColor3(color, intensity) {
    return new vec3(color.x * intensity, color.y * intensity, color.z * intensity);
}

function tintMaterial(material, color) {
    if (!material || !material.mainPass || !color) {
        return;
    }

    setPassProperty(material.mainPass, "baseColor", color);
    setPassProperty(material.mainPass, "mainColor", color);
    setPassProperty(material.mainPass, "Port_FinalColor1_N004", color);
    setPassProperty(material.mainPass, "Port_FinalColor2_N004", color);
    setPassProperty(material.mainPass, "Port_FinalColor3_N004", color);
    setPassProperty(material.mainPass, "Port_Emissive_N006", getDimmedColor3(color, 0.08));
    setPassProperty(material.mainPass, "metallic", 0.35);
    setPassProperty(material.mainPass, "roughness", 0.62);
}

function applyMaterialToVisual(visual, material) {
    if (!visual || !material) {
        return;
    }

    try {
        visual.mainMaterial = material;
        return;
    } catch (error) {
    }

    try {
        visual.clearMaterials();
        visual.addMaterial(material);
        return;
    } catch (error2) {
    }

    try {
        visual.materials = [material];
    } catch (error3) {
    }
}

function applyMeshToVisual(visual, mesh) {
    if (!visual || !mesh) {
        return;
    }

    try {
        visual.mesh = mesh;
    } catch (error) {
    }
}

function styleNodeVisual(sceneObject, nodeData) {
    var visual = getRenderMeshVisual(sceneObject);

    if (!visual) {
        return;
    }

    applyMeshToVisual(visual, getNodeMesh(nodeData));

    var material = cloneMaterial(getNodeMaterial(nodeData));
    if (material) {
        tintMaterial(material, getNodeColor(nodeData));
        applyMaterialToVisual(visual, material);
    }
}

function styleConnectionVisual(sceneObject) {
    var visual = getRenderMeshVisual(sceneObject);

    if (!visual) {
        return;
    }

    var material = cloneMaterial(script.connectionMaterial);
    if (material) {
        tintMaterial(material, script.connectionColor || new vec4(0.878431, 0.878431, 0.878431, 1.0));
        applyMaterialToVisual(visual, material);
    }
}

function bindNodeInteraction(sceneObject, nodePath, rootTransform) {
    var interactable = sceneObject.getComponent(Interactable.getTypeName());

    if (!interactable) {
        interactable = sceneObject.createComponent(Interactable.getTypeName());
    }

    if (!interactable) {
        print("WARNING: Could not create Interactable for node: " + nodePath);
        return;
    }

    (function(path, transform) {
        var triggerStartPosition = null;

        interactable.onTriggerStart.add(function() {
            triggerStartPosition = transform.getWorldPosition();
        });

        interactable.onTriggerEnd.add(function() {
            var currentPosition = transform.getWorldPosition();
            var movedDistance = triggerStartPosition ? triggerStartPosition.distance(currentPosition) : 0;

            triggerStartPosition = null;

            if (movedDistance <= (script.tapMoveThreshold || 0.15)) {
                onNodeClicked(path);
            }
        });
    })(nodePath, rootTransform);
}

function buildInteractiveCity() {
    var data = visualizerData;
    var rootTier = getRootTier(data);

    if (!rootTier) {
        print("ERROR: visualizer_data.json does not contain a supported tier/root_layer graph.");
        return;
    }

    childPathsByParent[ROOT_PATH] = [];
    expandedState[ROOT_PATH] = true;
    tierConnectionsByParentPath[ROOT_PATH] = [];

    buildTier(rootTier, ROOT_PATH, 1, new vec3(0, 0, 0), true);
    createRootConnectionsFromGlobalEdges(data.edges || []);

    print(
        "Visualizer nodes and connections generated from visualizer_data.json: nodes=" +
        getSpawnedNodeCount() +
        " connections=" +
        activeConnections.length
    );
}

function getSpawnedNodeCount() {
    var count = 0;

    for (var nodeId in spawnedNodes) {
        if (spawnedNodes.hasOwnProperty(nodeId)) {
            count++;
        }
    }

    return count;
}

function buildTier(tierData, parentPath, depth, centerPosition, visibleAtStart) {
    var nodes = tierData.nodes || [];
    var localPathById = {};
    var count = nodes.length;
    var radius = (depth === 1 ? script.rootRadius : script.childRadius) * script.dataScale;

    if (!childPathsByParent[parentPath]) {
        childPathsByParent[parentPath] = [];
    }

    if (!tierConnectionsByParentPath[parentPath]) {
        tierConnectionsByParentPath[parentPath] = [];
    }

    if (count > 8) {
        radius *= 1 + (count - 8) * 0.08;
    }

    for (var i = 0; i < count; i++) {
        var nodeData = nodes[i];
        var nodeId = getNodeId(nodeData);
        var nodePath = parentPath + ">" + nodeId;
        var angle = count === 1 ? 0 : (Math.PI * 2 * i) / count;
        var position = new vec3(
            centerPosition.x + Math.cos(angle) * radius,
            getYForDepth(depth),
            centerPosition.z + Math.sin(angle) * radius
        );

        spawnNode(nodeData, nodePath, position, depth, visibleAtStart);
        childPathsByParent[parentPath].push(nodePath);
        childPathsByParent[nodePath] = [];
        expandedState[nodePath] = false;
        localPathById[nodeId] = nodePath;
        mapNodeIdToRootPath(nodeId, nodePath, parentPath);

        if (parentPath !== ROOT_PATH) {
            createConnection(parentPath, nodePath, "contains", false, connectionByChildPath);
        }

        var childTier = getChildTier(nodeData);
        if (childTier) {
            buildTier(childTier, nodePath, depth + 1, position, false);
        }
    }

    createTierConnections(tierData.edges || [], parentPath, localPathById, visibleAtStart);
}

function spawnNode(nodeData, nodePath, position, depth, visibleAtStart) {
    if (spawnedNodes[nodePath]) {
        print("WARNING: Duplicate node path skipped: " + nodePath);
        return;
    }

    if (!script.nodePrefab) {
        return;
    }

    var nodeObject = script.nodePrefab.instantiate(script.getSceneObject());
    var transform = nodeObject.getTransform();
    var fixedScale = getNodeScale(nodeData, depth);

    nodeObject.name = "NODE__" + sanitizeName(nodePath);
    transform.setLocalPosition(position);
    transform.setLocalScale(fixedScale);

    var nodeColor = getNodeColor(nodeData);
    styleNodeVisual(nodeObject, nodeData);
    setNodeText(nodeObject, getNodeLabel(nodeData), getNodeDescription(nodeData), fixedScale, getTextColorForBackground(nodeColor));
    setVisible(nodeObject, visibleAtStart);
    configureNodeManipulation(nodeObject, transform);
    bindNodeInteraction(nodeObject, nodePath, transform);

    spawnedNodes[nodePath] = nodeObject;
    fixedNodeScales[nodePath] = fixedScale;
}

function createTierConnections(edges, parentPath, localPathById, visibleAtStart) {
    for (var i = 0; i < edges.length; i++) {
        var edge = edges[i];
        var fromPath = localPathById[String(edge.from)];
        var toPath = localPathById[String(edge.to)];

        if (fromPath && toPath) {
            var connectionObject = createConnection(fromPath, toPath, edge.type || "edge", visibleAtStart, null);
            if (connectionObject) {
                tierConnectionsByParentPath[parentPath].push(connectionObject);
            }
        }
    }
}

function mapNodeIdToRootPath(nodeId, nodePath, parentPath) {
    if (parentPath === ROOT_PATH) {
        rootPathByNodeId[nodeId] = nodePath;
        return;
    }

    var parentRootPath = rootPathByNodeId[getNodeIdFromPath(parentPath)];
    if (parentRootPath) {
        rootPathByNodeId[nodeId] = parentRootPath;
    }
}

function getNodeIdFromPath(nodePath) {
    var separatorIndex = nodePath.lastIndexOf(">");

    if (separatorIndex < 0) {
        return nodePath;
    }

    return nodePath.substring(separatorIndex + 1);
}

function createRootConnectionsFromGlobalEdges(edges) {
    for (var i = 0; i < edges.length; i++) {
        var edge = edges[i];
        var fromRootPath = rootPathByNodeId[String(edge.from)];
        var toRootPath = rootPathByNodeId[String(edge.to)];

        if (!fromRootPath || !toRootPath || fromRootPath === toRootPath) {
            continue;
        }

        createRootConnection(fromRootPath, toRootPath, edge.type || "root_edge");
    }
}

function createRootConnection(fromRootPath, toRootPath, connectionType) {
    var keyParts = [fromRootPath, toRootPath].sort();
    var key = keyParts[0] + "::" + keyParts[1];

    if (rootConnectionKeys[key]) {
        return;
    }

    rootConnectionKeys[key] = true;
    createConnection(fromRootPath, toRootPath, connectionType, true, null);
}

function createConnection(fromPath, toPath, connectionType, visibleAtStart, childLookup) {
    var nodeA = spawnedNodes[fromPath];
    var nodeB = spawnedNodes[toPath];

    if (!nodeA || !nodeB || !script.connectionPrefab) {
        return null;
    }

    var connectionObject = script.connectionPrefab.instantiate(script.getSceneObject());
    connectionObject.name = "CONNECTION__" + sanitizeName(connectionType + "__" + fromPath + "__" + toPath);
    connectionObject.enabled = visibleAtStart;
    styleConnectionVisual(connectionObject);

    if (childLookup) {
        childLookup[toPath] = connectionObject;
    }

    activeConnections.push({
        sceneObject: connectionObject,
        transform: connectionObject.getTransform(),
        nodeA_Transform: nodeA.getTransform(),
        nodeB_Transform: nodeB.getTransform()
    });

    updateConnection(activeConnections[activeConnections.length - 1]);
    return connectionObject;
}

function onNodeClicked(nodePath) {
    var children = childPathsByParent[nodePath];

    if (!children || children.length === 0) {
        print("Leaf node clicked: " + nodePath);
        return;
    }

    if (expandedState[nodePath]) {
        collapseNode(nodePath);
    } else {
        if (script.collapseSiblingsOnExpand) {
            collapseSiblingNodes(nodePath);
        }

        expandNode(nodePath);
    }
}

function collapseSiblingNodes(nodePath) {
    var parentPath = nodePath.substring(0, nodePath.lastIndexOf(">"));
    var siblings = childPathsByParent[parentPath];

    if (!siblings) {
        return;
    }

    for (var i = 0; i < siblings.length; i++) {
        if (siblings[i] !== nodePath && expandedState[siblings[i]]) {
            collapseNode(siblings[i]);
        }
    }
}

function expandNode(nodePath) {
    var children = childPathsByParent[nodePath];

    if (!children) {
        return;
    }

    for (var i = 0; i < children.length; i++) {
        var childPath = children[i];
        setVisible(spawnedNodes[childPath], true);
        setConnectionVisible(connectionByChildPath[childPath], true);
    }

    setTierConnectionsVisible(nodePath, true);
    expandedState[nodePath] = true;
    print("Expanded: " + nodePath);
}

function collapseNode(nodePath) {
    var children = childPathsByParent[nodePath];

    if (!children) {
        return;
    }

    for (var i = 0; i < children.length; i++) {
        hideSubtree(children[i]);
    }

    setTierConnectionsVisible(nodePath, false);
    expandedState[nodePath] = false;
    print("Collapsed: " + nodePath);
}

function hideSubtree(nodePath) {
    setVisible(spawnedNodes[nodePath], false);
    setConnectionVisible(connectionByChildPath[nodePath], false);
    setTierConnectionsVisible(nodePath, false);

    var children = childPathsByParent[nodePath];

    if (children) {
        for (var i = 0; i < children.length; i++) {
            hideSubtree(children[i]);
        }
    }

    expandedState[nodePath] = false;
}

function setTierConnectionsVisible(parentPath, visible) {
    var connections = tierConnectionsByParentPath[parentPath];

    if (!connections) {
        return;
    }

    for (var i = 0; i < connections.length; i++) {
        setConnectionVisible(connections[i], visible);
    }
}

function updateConnections() {
    for (var nodeId in spawnedNodes) {
        if (spawnedNodes.hasOwnProperty(nodeId)) {
            spawnedNodes[nodeId].getTransform().setLocalScale(fixedNodeScales[nodeId]);
        }
    }

    for (var i = 0; i < activeConnections.length; i++) {
        updateConnection(activeConnections[i]);
    }
}

function updateConnection(conn) {
    var posA = conn.nodeA_Transform.getWorldPosition();
    var posB = conn.nodeB_Transform.getWorldPosition();
    var midPoint = posA.add(posB).uniformScale(0.5);
    var distance = posA.distance(posB);

    conn.transform.setWorldPosition(midPoint);
    conn.transform.setWorldScale(new vec3(script.connectionThickness, distance, script.connectionThickness));

    if (distance > 0.001) {
        var direction = posB.sub(posA).normalize();
        conn.transform.setWorldRotation(quat.rotationFromTo(vec3.up(), direction));
    }
}

if (script.nodePrefab && script.connectionPrefab) {
    buildInteractiveCity();

    var updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(updateConnections);
} else {
    print("ERROR: Please assign nodePrefab and connectionPrefab in the Inspector.");
}