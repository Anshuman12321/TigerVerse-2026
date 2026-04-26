//@input Asset.ObjectPrefab nodePrefab
//@input Asset.ObjectPrefab connectionPrefab
//@input Asset.ObjectPrefab flowTokenPrefab
//@input float dataScale = 1.0
//@input float connectionThickness = 0.15
//@input float flowSpeed = 5.0
//@input float segmentPauseSeconds = 0.15
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
var flowScenarios = require("./Data/FlowScenarios");
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
var childOffsetByPath = {};
var lastNodePositions = {};
var nodePathById = {};
var nodePathsById = {};
var connectionByNodePair = {};
var activeFlow = null;

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

function getConnectionKey(fromPath, toPath) {
    return fromPath + "::" + toPath;
}

function registerNodePath(nodeId, nodePath) {
    if (!nodePathsById[nodeId]) {
        nodePathsById[nodeId] = [];
    }

    nodePathsById[nodeId].push(nodePath);

    if (!nodePathById[nodeId]) {
        nodePathById[nodeId] = nodePath;
    }
}

function getParentPath(nodePath) {
    var separatorIndex = nodePath.lastIndexOf(">");

    if (separatorIndex < 0) {
        return null;
    }

    return nodePath.substring(0, separatorIndex);
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

function getChildLayerYOffset() {
    return script.depthSpacingY * script.dataScale;
}

function sanitizeName(value) {
    return String(value).replace(/[^A-Za-z0-9_]/g, "_");
}

function cloneVec3(value) {
    return new vec3(value.x, value.y, value.z);
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

function getNodeFootprint(nodeData, depth) {
    var nodeScale = getNodeScale(nodeData, depth);

    return Math.max(nodeScale.x, nodeScale.z);
}

function getTierRadius(nodes, depth) {
    var count = nodes.length;
    var baseRadius = (depth === 1 ? script.rootRadius : script.childRadius) * script.dataScale;
    var maxNodeFootprint = 0;

    for (var i = 0; i < count; i++) {
        maxNodeFootprint = Math.max(maxNodeFootprint, getNodeFootprint(nodes[i], depth));
    }

    if (count <= 1) {
        return baseRadius;
    }

    var minChordSpacing = maxNodeFootprint * 1.35 + 0.35;
    var requiredRadius = minChordSpacing / (2 * Math.sin(Math.PI / count));

    return Math.max(baseRadius, requiredRadius);
}

function createFibonacciTierOffset(index, count, radius, yOffset) {
    var goldenAngle = Math.PI * (3 - Math.sqrt(5));
    var normalizedIndex = (index + 0.5) / Math.max(count, 1);
    var angleJitter = (Math.random() - 0.5) * goldenAngle * 0.55;
    var distanceJitter = 0.82 + Math.random() * 0.36;
    var angle = index * goldenAngle + angleJitter;
    var distance = Math.sqrt(normalizedIndex) * radius * distanceJitter;

    if (count === 1) {
        distance = radius * (0.25 + Math.random() * 0.35);
    }

    return new vec3(
        Math.cos(angle) * distance,
        yOffset,
        Math.sin(angle) * distance
    );
}

function getOffsetDistanceXZ(offsetA, offsetB) {
    var dx = offsetA.x - offsetB.x;
    var dz = offsetA.z - offsetB.z;

    return Math.sqrt(dx * dx + dz * dz);
}

function doesOffsetOverlap(offset, footprint, placedOffsets, placedFootprints) {
    for (var i = 0; i < placedOffsets.length; i++) {
        var minDistance = (footprint + placedFootprints[i]) * 0.55 + 0.2;

        if (getOffsetDistanceXZ(offset, placedOffsets[i]) < minDistance) {
            return true;
        }
    }

    return false;
}

function getTierNodeOffsets(nodes, depth, radius, yOffset) {
    var offsets = [];
    var footprints = [];
    var layoutRadius = radius * 1.35;
    var count = nodes.length;

    for (var i = 0; i < count; i++) {
        var footprint = getNodeFootprint(nodes[i], depth);
        var bestOffset = null;

        for (var attempt = 0; attempt < 24; attempt++) {
            var candidate = createFibonacciTierOffset(i, count, layoutRadius, yOffset);

            if (!doesOffsetOverlap(candidate, footprint, offsets, footprints)) {
                bestOffset = candidate;
                break;
            }

            if (!bestOffset || getOffsetDistanceXZ(candidate, new vec3(0, yOffset, 0)) > getOffsetDistanceXZ(bestOffset, new vec3(0, yOffset, 0))) {
                bestOffset = candidate;
            }
        }

        offsets.push(bestOffset || createFibonacciTierOffset(i, count, layoutRadius, yOffset));
        footprints.push(footprint);
    }

    return offsets;
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

function getNodeLocalPosition(nodePath) {
    return spawnedNodes[nodePath].getTransform().getLocalPosition();
}

function setNodeLocalPosition(nodePath, position) {
    spawnedNodes[nodePath].getTransform().setLocalPosition(position);
    lastNodePositions[nodePath] = cloneVec3(position);
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

function repositionChildrenAroundParent(parentPath) {
    var children = childPathsByParent[parentPath];
    var parentObject = spawnedNodes[parentPath];

    if (!children || !parentObject) {
        return;
    }

    var parentPosition = parentObject.getTransform().getLocalPosition();

    for (var i = 0; i < children.length; i++) {
        var childPath = children[i];
        var offset = childOffsetByPath[childPath];

        if (offset && spawnedNodes[childPath]) {
            setNodeLocalPosition(childPath, parentPosition.add(offset));
        }
    }
}

function applyDeltaToExpandedDescendants(parentPath, delta) {
    if (!expandedState[parentPath]) {
        return;
    }

    var children = childPathsByParent[parentPath];

    if (!children) {
        return;
    }

    for (var i = 0; i < children.length; i++) {
        var childPath = children[i];
        var childObject = spawnedNodes[childPath];

        if (!childObject || !childObject.enabled) {
            continue;
        }

        setNodeLocalPosition(childPath, getNodeLocalPosition(childPath).add(delta));
        applyDeltaToExpandedDescendants(childPath, delta);
    }
}

function updateExpandedNodeMovement() {
    var movedNodes = [];

    for (var nodePath in spawnedNodes) {
        if (spawnedNodes.hasOwnProperty(nodePath)) {
            var currentPosition = getNodeLocalPosition(nodePath);
            var previousPosition = lastNodePositions[nodePath];

            if (previousPosition && previousPosition.distance(currentPosition) > 0.0001) {
                movedNodes.push({
                    path: nodePath,
                    delta: currentPosition.sub(previousPosition)
                });
            }
        }
    }

    for (var i = 0; i < movedNodes.length; i++) {
        applyDeltaToExpandedDescendants(movedNodes[i].path, movedNodes[i].delta);
    }

    for (var trackedPath in spawnedNodes) {
        if (spawnedNodes.hasOwnProperty(trackedPath)) {
            lastNodePositions[trackedPath] = cloneVec3(getNodeLocalPosition(trackedPath));
        }
    }
}

function buildTier(tierData, parentPath, depth, centerPosition, visibleAtStart) {
    var nodes = tierData.nodes || [];
    var localPathById = {};
    var count = nodes.length;
    var radius = getTierRadius(nodes, depth);
    var yOffset = parentPath === ROOT_PATH ? 0 : getChildLayerYOffset();
    var offsets = getTierNodeOffsets(nodes, depth, radius, yOffset);

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
        var offset = offsets[i];
        var position = centerPosition.add(offset);

        if (parentPath !== ROOT_PATH) {
            childOffsetByPath[nodePath] = offset;
        }

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
    lastNodePositions[nodePath] = cloneVec3(position);
    registerNodePath(getNodeId(nodeData), nodePath);
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
        nodeB_Transform: nodeB.getTransform(),
        fromPath: fromPath,
        toPath: toPath,
        key: getConnectionKey(fromPath, toPath)
    });

    var activeConnection = activeConnections[activeConnections.length - 1];
    connectionByNodePair[activeConnection.key] = activeConnection;
    updateConnection(activeConnection);
    return connectionObject;
}

function getRouteEntries(scenario) {
    return scenario.travelPath || scenario.steps || [];
}

function shouldVisitRouteChildren(scenario) {
    return scenario.visitChildren === true || (!scenario.travelPath && scenario.visitChildren !== false);
}

function getRouteEntryLabel(entry) {
    if (typeof entry === "string") {
        return entry;
    }

    if (entry && entry.path) {
        return entry.path;
    }

    if (entry && entry.id) {
        return entry.id;
    }

    return String(entry);
}

function buildNodePathFromParentIds(nodeId, parentIds) {
    var candidatePath = ROOT_PATH;

    for (var i = 0; i < parentIds.length; i++) {
        candidatePath += ">" + String(parentIds[i]);
    }

    return candidatePath + ">" + nodeId;
}

function resolveRouteEntry(entry, scenarioName) {
    if (typeof entry === "string") {
        if (spawnedNodes[entry]) {
            return entry;
        }

        return resolveRouteEntry({ id: entry }, scenarioName);
    }

    if (!entry) {
        print("WARNING: Flow scenario '" + scenarioName + "' has an empty route entry.");
        return null;
    }

    if (entry.path) {
        var explicitPath = String(entry.path);
        if (spawnedNodes[explicitPath]) {
            return explicitPath;
        }

        print("WARNING: Flow scenario '" + scenarioName + "' references missing node path: " + explicitPath);
        return null;
    }

    if (!entry.id) {
        print("WARNING: Flow scenario '" + scenarioName + "' route entry is missing id or path.");
        return null;
    }

    var nodeId = String(entry.id);

    if (entry.parentIds && entry.parentIds.length !== undefined) {
        var nestedPath = buildNodePathFromParentIds(nodeId, entry.parentIds);
        if (spawnedNodes[nestedPath]) {
            return nestedPath;
        }

        print("WARNING: Flow scenario '" + scenarioName + "' references missing nested node: " + nestedPath);
        return null;
    }

    var matches = nodePathsById[nodeId];

    if (!matches || matches.length === 0) {
        print("WARNING: Flow scenario '" + scenarioName + "' references missing node id: " + nodeId);
        return null;
    }

    if (matches.length > 1) {
        print("WARNING: Flow scenario '" + scenarioName + "' references ambiguous node id: " + nodeId + ". Add parentIds or path.");
        return null;
    }

    return matches[0];
}

function resolveScenarioPaths(scenario) {
    var routeEntries = getRouteEntries(scenario);
    var resolvedPaths = [];

    for (var i = 0; i < routeEntries.length; i++) {
        var nodePath = resolveRouteEntry(routeEntries[i], scenario.name);

        if (!nodePath) {
            print("WARNING: Flow scenario '" + scenario.name + "' could not resolve route entry: " + getRouteEntryLabel(routeEntries[i]));
            return null;
        }

        resolvedPaths.push(nodePath);
    }

    if (shouldVisitRouteChildren(scenario)) {
        resolvedPaths = expandRouteWithDescendants(resolvedPaths);
    }

    return resolvedPaths;
}

function appendPathIfMissing(paths, seenPaths, nodePath) {
    if (!seenPaths[nodePath]) {
        paths.push(nodePath);
        seenPaths[nodePath] = true;
    }
}

function appendDescendants(paths, seenPaths, parentPath) {
    var children = childPathsByParent[parentPath];

    if (!children) {
        return;
    }

    for (var i = 0; i < children.length; i++) {
        var childPath = children[i];
        appendPathIfMissing(paths, seenPaths, childPath);
        appendDescendants(paths, seenPaths, childPath);
    }
}

function expandRouteWithDescendants(resolvedPaths) {
    var expandedPaths = [];
    var seenPaths = {};

    for (var i = 0; i < resolvedPaths.length; i++) {
        appendPathIfMissing(expandedPaths, seenPaths, resolvedPaths[i]);
        appendDescendants(expandedPaths, seenPaths, resolvedPaths[i]);
    }

    return expandedPaths;
}

function ensureNodePathVisible(nodePath) {
    var ancestors = [];
    var parentPath = getParentPath(nodePath);

    while (parentPath && parentPath !== ROOT_PATH) {
        ancestors.unshift(parentPath);
        parentPath = getParentPath(parentPath);
    }

    for (var i = 0; i < ancestors.length; i++) {
        if (!expandedState[ancestors[i]]) {
            expandNode(ancestors[i]);
        }
    }

    setVisible(spawnedNodes[nodePath], true);
}

function ensureFlowRouteVisible(resolvedPaths) {
    if (resolvedPaths.length > 0) {
        ensureNodePathVisible(resolvedPaths[0]);
    }
}

function expandFlowArrivalNode(nodePath) {
    var children = childPathsByParent[nodePath];

    if (children && children.length > 0 && !expandedState[nodePath]) {
        expandNode(nodePath);
    }
}

function orientFlowTokenAlongSegment(tokenTransform, fromPosition, toPosition) {
    var segment = toPosition.sub(fromPosition);
    var segmentLength = Math.sqrt(segment.x * segment.x + segment.y * segment.y + segment.z * segment.z);

    if (segmentLength < 0.001) {
        return;
    }

    // Align the token's local X axis to the route; this is the 90-degree correction
    // from the vertical/up-axis alignment used by connection cylinders.
    tokenTransform.setWorldRotation(quat.rotationFromTo(new vec3(1, 0, 0), segment.uniformScale(1 / segmentLength)));
}

function getFlowConnectionForSegment(fromPath, toPath) {
    return connectionByNodePair[getConnectionKey(fromPath, toPath)] ||
        connectionByNodePair[getConnectionKey(toPath, fromPath)] ||
        null;
}

function getFlowTokenPrefab() {
    return script.flowTokenPrefab || script.nodePrefab;
}

function createFlowToken(scenario) {
    var prefab = getFlowTokenPrefab();

    if (!prefab) {
        return null;
    }

    var tokenObject = prefab.instantiate(script.getSceneObject());
    tokenObject.name = "FLOW_TOKEN__" + sanitizeName(scenario.id);
    tokenObject.getTransform().setLocalScale(new vec3(0.18, 0.18, 0.18));
    setNodeText(tokenObject, scenario.tokenLabel || scenario.name, "", new vec3(1, 1, 1));
    setVisible(tokenObject, true);

    return tokenObject;
}

function startFlowScenario(scenario) {
    var resolvedPaths = resolveScenarioPaths(scenario);

    if (!resolvedPaths || resolvedPaths.length < 2) {
        print("WARNING: Flow scenario could not start: " + scenario.name);
        return;
    }

    if (activeFlow && activeFlow.tokenObject) {
        setVisible(activeFlow.tokenObject, false);
    }

    ensureFlowRouteVisible(resolvedPaths);

    var tokenObject = createFlowToken(scenario);

    if (!tokenObject) {
        print("WARNING: No flow token prefab or node prefab available for scenario: " + scenario.name);
        return;
    }

    activeFlow = {
        scenario: scenario,
        paths: resolvedPaths,
        tokenObject: tokenObject,
        tokenTransform: tokenObject.getTransform(),
        segmentIndex: 0,
        segmentStartTime: getTime(),
        isPlaying: true,
        activeFromPath: null,
        activeToPath: null,
        activeConnectionKey: null,
        pausedElapsed: 0
    };

    updateFlowAnimation();
    print("Started flow: " + scenario.name);
}

function restartActiveFlow() {
    if (activeFlow && activeFlow.scenario) {
        startFlowScenario(activeFlow.scenario);
    }
}

function getFlowScenarioById(scenarioId) {
    for (var i = 0; i < flowScenarios.length; i++) {
        if (flowScenarios[i].id === scenarioId) {
            return flowScenarios[i];
        }
    }

    print("WARNING: Flow scenario not found: " + scenarioId);
    return null;
}

function startFlowScenarioById(scenarioId) {
    var scenario = getFlowScenarioById(scenarioId);

    if (scenario) {
        startFlowScenario(scenario);
    }
}

function playFlow() {
    if (activeFlow) {
        setActiveFlowPlaying(true);
    } else if (flowScenarios.length > 0) {
        startFlowScenario(flowScenarios[0]);
    }
}

function pauseFlow() {
    setActiveFlowPlaying(false);
}

function restartFlow() {
    restartActiveFlow();
}

function startUserPromptFlow() {
    startFlowScenarioById("user_prompt");
}

function startToolExecutionFlow() {
    startFlowScenarioById("tool_execution");
}

function startProviderRequestFlow() {
    startFlowScenarioById("provider_request");
}

function startTelemetryFlow() {
    startFlowScenarioById("telemetry");
}

function startRepositoryDrilldownFlow() {
    startFlowScenarioById("repository_drilldown");
}

function setActiveFlowPlaying(isPlaying) {
    if (activeFlow) {
        if (isPlaying) {
            activeFlow.segmentStartTime = getTime() - (activeFlow.pausedElapsed || 0);
        } else {
            activeFlow.pausedElapsed = getTime() - activeFlow.segmentStartTime;
        }

        activeFlow.isPlaying = isPlaying;
    }
}

function updateActiveFlowSegmentHighlight(fromPath, toPath) {
    var connection = getFlowConnectionForSegment(fromPath, toPath);

    activeFlow.activeFromPath = fromPath;
    activeFlow.activeToPath = toPath;
    activeFlow.activeConnectionKey = connection ? connection.key : null;
}

function updateFlowAnimation() {
    if (!activeFlow || !activeFlow.isPlaying) {
        return;
    }

    if (activeFlow.segmentIndex >= activeFlow.paths.length - 1) {
        activeFlow.isPlaying = false;
        activeFlow.activeFromPath = null;
        activeFlow.activeToPath = null;
        activeFlow.activeConnectionKey = null;
        return;
    }

    var fromPath = activeFlow.paths[activeFlow.segmentIndex];
    var toPath = activeFlow.paths[activeFlow.segmentIndex + 1];
    var fromObject = spawnedNodes[fromPath];
    var toObject = spawnedNodes[toPath];

    if (!fromObject || !toObject) {
        activeFlow.isPlaying = false;
        activeFlow.activeFromPath = null;
        activeFlow.activeToPath = null;
        activeFlow.activeConnectionKey = null;
        return;
    }

    ensureNodePathVisible(fromPath);
    ensureNodePathVisible(toPath);
    updateActiveFlowSegmentHighlight(fromPath, toPath);

    var fromPosition = fromObject.getTransform().getWorldPosition();
    var toPosition = toObject.getTransform().getWorldPosition();
    var distance = fromPosition.distance(toPosition);
    var speed = Math.max(script.flowSpeed || 1.0, 0.01);
    var segmentDuration = Math.max(distance / speed, 0.2);
    var elapsed = getTime() - activeFlow.segmentStartTime;
    var pauseSeconds = script.segmentPauseSeconds || 0;
    var t = Math.min(elapsed / segmentDuration, 1);
    var tokenPosition = fromPosition.add(toPosition.sub(fromPosition).uniformScale(t));

    activeFlow.tokenTransform.setWorldPosition(tokenPosition);
    orientFlowTokenAlongSegment(activeFlow.tokenTransform, fromPosition, toPosition);

    if (elapsed >= segmentDuration + pauseSeconds) {
        expandFlowArrivalNode(toPath);
        activeFlow.segmentIndex++;
        activeFlow.segmentStartTime = getTime();
        activeFlow.pausedElapsed = 0;
    }
}

function isFlowHighlightedNode(nodePath) {
    return activeFlow &&
        (activeFlow.activeFromPath === nodePath || activeFlow.activeToPath === nodePath);
}

function updateFlowNodeHighlights() {
    for (var nodePath in spawnedNodes) {
        if (spawnedNodes.hasOwnProperty(nodePath)) {
            var baseScale = fixedNodeScales[nodePath];

            if (isFlowHighlightedNode(nodePath)) {
                spawnedNodes[nodePath].getTransform().setLocalScale(baseScale.uniformScale(1.25));
            }
        }
    }
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

    repositionChildrenAroundParent(nodePath);

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
    updateExpandedNodeMovement();
    updateFlowAnimation();

    for (var nodeId in spawnedNodes) {
        if (spawnedNodes.hasOwnProperty(nodeId)) {
            spawnedNodes[nodeId].getTransform().setLocalScale(fixedNodeScales[nodeId]);
        }
    }

    updateFlowNodeHighlights();

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
    var thickness = script.connectionThickness;

    if (activeFlow && activeFlow.activeConnectionKey === conn.key) {
        thickness *= 2.5;
    }

    conn.transform.setWorldScale(new vec3(thickness, distance, thickness));

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

script.playFlow = playFlow;
script.pauseFlow = pauseFlow;
script.restartFlow = restartFlow;
script.startUserPromptFlow = startUserPromptFlow;
script.startToolExecutionFlow = startToolExecutionFlow;
script.startProviderRequestFlow = startProviderRequestFlow;
script.startTelemetryFlow = startTelemetryFlow;
script.startRepositoryDrilldownFlow = startRepositoryDrilldownFlow;
