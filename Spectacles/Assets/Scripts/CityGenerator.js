//@input Asset.ObjectPrefab nodePrefab
//@input Asset.ObjectPrefab connectionPrefab
//@input float dataScale = 1.0
//@input float connectionThickness = 0.15
//@input float nodeSize = 1.0
//@input float depthSpacingY = 8.0
//@input float rootRadius = 10.0
//@input float childRadius = 5.0
//@input float slabHeight = 0.18
//@input float slabDepth = 0.65
//@input float tapMoveThreshold = 0.15
//@input float dragHoldDelaySeconds = 0.35
//@input bool collapseSiblingsOnExpand = false

var visualizerData = require("./Data/claude_vizualizer_data");
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
var nodeInteractionStates = [];

function callIfAvailable(target, methodName, args) {
    if (target && target[methodName]) {
        target[methodName].apply(target, args || []);
    }
}

function setManipulationDragging(manipulation, enabled) {
    if (!manipulation) {
        return;
    }

    callIfAvailable(manipulation, "setCanTranslate", [enabled]);
    callIfAvailable(manipulation, "setCanDrag", [enabled]);
}

function configureNodeManipulation(sceneObject, rootTransform) {
    var manipulation = sceneObject.getComponent(InteractableManipulation.getTypeName());

    if (!manipulation) {
        manipulation = sceneObject.createComponent(InteractableManipulation.getTypeName());
    }

    if (manipulation) {
        callIfAvailable(manipulation, "setManipulateRoot", [rootTransform]);
        setManipulationDragging(manipulation, false);
        callIfAvailable(manipulation, "setCanScale", [false]);
        callIfAvailable(manipulation, "setCanRotate", [false]);
    }

    for (var i = 0; i < sceneObject.getChildrenCount(); i++) {
        var childManipulation = sceneObject.getChild(i).getComponent(InteractableManipulation.getTypeName());
        if (childManipulation) {
            configureNodeManipulation(sceneObject.getChild(i), rootTransform);
        }
    }

    return manipulation;
}

function getNodeId(nodeData) {
    return String(nodeData.id);
}

function getNodeLabel(nodeData) {
    return nodeData.name || nodeData.title || nodeData.label || getNodeId(nodeData);
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

function getNodeScale(nodeData, depth) {
    var radius = 0.36;

    if (nodeData.layout && nodeData.layout.suggested_radius) {
        radius = nodeData.layout.suggested_radius;
    }

    var size = script.nodeSize * radius * 2.5 * getDepthScale(depth);
    var slabHeight = script.slabHeight || 0.18;
    var slabDepth = script.slabDepth || 0.65;

    return new vec3(size * 1.7, size * slabHeight, size * slabDepth);
}

function getTierRadius(nodes, depth) {
    var count = nodes.length;
    var baseRadius = (depth === 1 ? script.rootRadius : script.childRadius) * script.dataScale;
    var maxNodeFootprint = 0;

    for (var i = 0; i < count; i++) {
        var nodeScale = getNodeScale(nodes[i], depth);
        var nodeFootprint = Math.max(nodeScale.x, nodeScale.z);
        maxNodeFootprint = Math.max(maxNodeFootprint, nodeFootprint);
    }

    if (count <= 1) {
        return baseRadius;
    }

    var minChordSpacing = maxNodeFootprint * 1.55 + 0.55;
    var requiredRadius = minChordSpacing / (2 * Math.sin(Math.PI / count));

    return Math.max(baseRadius, requiredRadius);
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

function shortenText(value, maxLength) {
    var text = String(value || "");

    if (text.length <= maxLength) {
        return text;
    }

    return text.substring(0, maxLength - 3) + "...";
}

function formatNodeText(label, description) {
    var title = shortenText(label, 32);

    return title;
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

function setNodeText(sceneObject, label, description, fixedScale) {
    var labelTextComponent = null;
    var fallbackTextComponent = null;

    for (var i = 0; i < sceneObject.getChildrenCount(); i++) {
        var child = sceneObject.getChild(i);
        var textComponent = child.getComponent("Component.Text");

        if (textComponent) {
            if (child.name === "NodeLabel" || child.name === "Title" || child.name === "Label") {
                labelTextComponent = textComponent;
            } else {
                fallbackTextComponent = textComponent;
            }
        }
    }

    if (!labelTextComponent) {
        labelTextComponent = fallbackTextComponent || createTextChild(
            sceneObject,
            "NodeLabel",
            new vec3(0, 0.58, 0),
            getCompensatedTextScale(fixedScale, new vec3(0.22, 0.22, 0.22))
        );
    }

    configureText(labelTextComponent, formatNodeText(label, description), new vec4(1, 1, 1, 1));
}

function bindNodeInteraction(sceneObject, nodePath, rootTransform, manipulation) {
    var interactable = sceneObject.getComponent(Interactable.getTypeName());

    if (!interactable) {
        interactable = sceneObject.createComponent(Interactable.getTypeName());
    }

    if (!interactable) {
        print("WARNING: Could not create Interactable for node: " + nodePath);
        return;
    }

    (function(path, transform, nodeManipulation) {
        var interactionState = {
            manipulation: nodeManipulation,
            isTriggerActive: false,
            isDragActive: false,
            triggerStartPosition: null,
            triggerStartTime: 0
        };

        nodeInteractionStates.push(interactionState);

        interactable.onTriggerStart.add(function() {
            interactionState.isTriggerActive = true;
            interactionState.isDragActive = false;
            interactionState.triggerStartPosition = transform.getWorldPosition();
            interactionState.triggerStartTime = getTime();
            setManipulationDragging(nodeManipulation, false);
        });

        interactable.onTriggerEnd.add(function() {
            var currentPosition = transform.getWorldPosition();
            var movedDistance = interactionState.triggerStartPosition ? interactionState.triggerStartPosition.distance(currentPosition) : 0;
            var wasDragActive = interactionState.isDragActive;

            interactionState.isTriggerActive = false;
            interactionState.isDragActive = false;
            interactionState.triggerStartPosition = null;
            setManipulationDragging(nodeManipulation, false);

            if (!wasDragActive && movedDistance <= (script.tapMoveThreshold || 0.15)) {
                onNodeClicked(path);
            }
        });
    })(nodePath, rootTransform, manipulation);
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
        "Visualizer nodes and connections generated from claude_vizualizer_data.js: nodes=" +
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

function updateNodeInteractionStates() {
    var holdDelay = script.dragHoldDelaySeconds || 0.35;
    var now = getTime();

    for (var i = 0; i < nodeInteractionStates.length; i++) {
        var state = nodeInteractionStates[i];

        if (state.isTriggerActive && !state.isDragActive && now - state.triggerStartTime >= holdDelay) {
            state.isDragActive = true;
            setManipulationDragging(state.manipulation, true);
        }
    }
}

function buildTier(tierData, parentPath, depth, centerPosition, visibleAtStart) {
    var nodes = tierData.nodes || [];
    var localPathById = {};
    var count = nodes.length;
    var radius = getTierRadius(nodes, depth);

    if (!childPathsByParent[parentPath]) {
        childPathsByParent[parentPath] = [];
    }

    if (!tierConnectionsByParentPath[parentPath]) {
        tierConnectionsByParentPath[parentPath] = [];
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

    setNodeText(nodeObject, getNodeLabel(nodeData), getNodeDescription(nodeData), fixedScale);
    setVisible(nodeObject, visibleAtStart);
    var manipulation = configureNodeManipulation(nodeObject, transform);
    bindNodeInteraction(nodeObject, nodePath, transform, manipulation);

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
    updateNodeInteractionStates();

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
