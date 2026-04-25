//@input Component.RenderMeshVisual nodeMesh
//@input Component.RenderMeshVisual connectionMesh
//@input Component.RenderMeshVisual edgeMesh
//@input Asset.JsonAsset cityDataJson
//@input float dataScale = 0.1
//@input float nodeHalfSize = 1
//@input float nodeCornerRadius = 0.3
//@input int cornerSegments = 3
//@input float connectionRadius = 0.08

// Builds a simple “graph city” from a JsonAsset with shape:
// {
//   nodes: [{ id:number, name:string, pos:[x,y,z], height:number, color:[r,g,b,a] }],
//   connections: [{ from:number, to:number }]
// }

var nodeBuilder = new MeshBuilder([
    { name: "position", components: 3 },
    { name: "color", components: 4 }
]);
nodeBuilder.topology = MeshTopology.Triangles;
nodeBuilder.indexType = MeshIndexType.UInt16;

// Standard cube indices (12 triangles, 36 indices), including a top cap.
var CUBE_INDICES = [
    0,1,2, 2,3,0, 4,5,6, 6,7,4, 0,4,7, 7,3,0,
    1,5,6, 6,2,1, 0,1,5, 5,4,0, 3,2,6, 6,7,3
];

function appendDoubleSidedIndices(builder, triangleIndices) {
    // Duplicate every triangle with reversed winding so faces render from both sides.
    for (var i = 0; i < triangleIndices.length; i += 3) {
        var a = triangleIndices[i];
        var b = triangleIndices[i + 1];
        var c = triangleIndices[i + 2];
        builder.appendIndices([a, b, c, a, c, b]);
    }
}

function getPositiveInput(value, fallback) {
    return value && value > 0 ? value : fallback;
}

var DATA_SCALE = getPositiveInput(script.dataScale, 0.1);
var NODE_HALF_SIZE = getPositiveInput(script.nodeHalfSize, 1);
var NODE_CORNER_RADIUS = getPositiveInput(script.nodeCornerRadius, 0.3);
var CORNER_SEGMENTS = Math.max(1, Math.floor(script.cornerSegments || 3));
var CONNECTION_RADIUS = getPositiveInput(script.connectionRadius, 0.08);
var EDGE_RADIUS = 0.04;
var CYLINDER_SEGMENTS = 12;
var EDGE_SEGMENTS = 6;
var LABEL_SCALE = 0.2;
var LABEL_TOP_OFFSET = 1;
var CITY_OFFSET = new vec3(0, 0, 0);
var NODE_XZ_SCALE = 2.0;

// Holographic palette: translucent blue body + bright cyan edges/connections
var HOLO_BODY = { r: 0.05, g: 0.25, b: 0.9,  a: 0.10 };
var HOLO_EDGE = { r: 0.2,  g: 0.82, b: 1.0,  a: 1.0  };
var HOLO_CONN = { r: 0.1,  g: 0.6,  b: 1.0,  a: 0.85 };

function makeColor(colorArray) {
    if (!colorArray || colorArray.length < 4) {
        return { r: 1, g: 1, b: 1, a: 1 };
    }

    return {
        r: colorArray[0],
        g: colorArray[1],
        b: colorArray[2],
        a: colorArray[3]
    };
}

function averageColor(a, b) {
    return {
        r: (a.r + b.r) * 0.5,
        g: (a.g + b.g) * 0.5,
        b: (a.b + b.b) * 0.5,
        a: (a.a + b.a) * 0.5
    };
}

function appendColoredVertex(builder, point, color) {
    builder.appendVerticesInterleaved([
        point.x, point.y, point.z,
        color.r, color.g, color.b, color.a
    ]);
}

function scaledNodePosition(node) {
    return new vec3(
        node.pos[0] * DATA_SCALE - CITY_OFFSET.x,
        node.pos[1] * DATA_SCALE - CITY_OFFSET.y,
        node.pos[2] * DATA_SCALE - CITY_OFFSET.z
    );
}

function nodeTopPosition(node) {
    var base = scaledNodePosition(node);
    return new vec3(base.x, base.y + node.height * DATA_SCALE, base.z);
}

function nodeCenterPosition(node) {
    var base = scaledNodePosition(node);
    return new vec3(base.x, base.y + node.height * DATA_SCALE * 0.5, base.z);
}

function nodeSurfaceAnchorPosition(node, targetNode) {
    // Finds the point where a ray from this node's center toward the target hits the node's box bounds.
    // We then extend slightly by the connection radius so the cylinder visually reaches the cube face.
    var center = nodeCenterPosition(node);
    var targetCenter = nodeCenterPosition(targetNode);

    var dir = normalize(subtract(targetCenter, center));
    if (length(dir) <= 0.0001) {
        return nodeTopPosition(node);
    }

    var halfHeight = Math.max(node.height * DATA_SCALE * 0.5, 0.0001);
    var halfWidth = Math.max(NODE_HALF_SIZE * DATA_SCALE * NODE_XZ_SCALE, 0.0001);

    // Ray-box intersection (AABB) in parametric form; since we start at center, we can do the “slab” min.
    var t = Number.MAX_VALUE;
    if (Math.abs(dir.x) > 0.0001) {
        t = Math.min(t, halfWidth / Math.abs(dir.x));
    }
    if (Math.abs(dir.y) > 0.0001) {
        t = Math.min(t, halfHeight / Math.abs(dir.y));
    }
    if (Math.abs(dir.z) > 0.0001) {
        t = Math.min(t, halfWidth / Math.abs(dir.z));
    }

    // Push out by the cylinder radius so the cap meets the cube face (avoids tiny visual gaps).
    var radius = CONNECTION_RADIUS * DATA_SCALE;
    return add(center, scale(dir, t + radius));
}

function createNodeLabel(node) {
    if (!node.name) {
        return;
    }

    var labelObject = global.scene.createSceneObject("Label_" + node.name);
    labelObject.setParent(script.getSceneObject());

    var top = nodeTopPosition(node);
    var transform = labelObject.getTransform();
    transform.setLocalPosition(new vec3(top.x, top.y + 0.01, top.z));
    transform.setLocalScale(new vec3(LABEL_SCALE, LABEL_SCALE, LABEL_SCALE));
    // Lay the label flat on top of the node.
    transform.setLocalRotation(quat.fromEulerAngles(-90, 0, 0));

    var labelText = labelObject.createComponent("Component.Text");
    var supportsRichMarkup = false;
    if (labelText.richText !== undefined) {
        labelText.richText = true;
        supportsRichMarkup = true;
    }
    if (labelText.enableMarkup !== undefined) {
        labelText.enableMarkup = true;
        supportsRichMarkup = true;
    }
    labelText.text = supportsRichMarkup ? "<b>" + node.name + "</b>" : String(node.name).toUpperCase();
    labelText.fontSize = 56;
    labelText.sizeToFit = true;
    labelText.depthTest = false;
    if (labelText.textFill && labelText.textFill.color) {
        labelText.textFill.color = new vec4(0.0, 0.0, 0.0, 1.0);
    }
    if (typeof HorizontalAlignment !== "undefined") {
        labelText.horizontalAlignment = HorizontalAlignment.Center;
    }
    if (typeof VerticalAlignment !== "undefined") {
        labelText.verticalAlignment = VerticalAlignment.Center;
    }
}

function addBuilding(node) {
    var startIdx = nodeBuilder.getVerticesCount();
    var base = scaledNodePosition(node);
    var h = node.height * DATA_SCALE;
    var s = NODE_HALF_SIZE * DATA_SCALE * NODE_XZ_SCALE;
    var profile = getRoundedProfilePoints(s);
    var pointCount = profile.length;

    for (var i = 0; i < pointCount; i++) {
        var p = profile[i];
        appendColoredVertex(nodeBuilder, new vec3(base.x + p.x, base.y, base.z + p.z), HOLO_BODY);
        appendColoredVertex(nodeBuilder, new vec3(base.x + p.x, base.y + h, base.z + p.z), HOLO_BODY);
    }

    var bottomCenterIndex = nodeBuilder.getVerticesCount();
    appendColoredVertex(nodeBuilder, new vec3(base.x, base.y, base.z), HOLO_BODY);
    var topCenterIndex = nodeBuilder.getVerticesCount();
    appendColoredVertex(nodeBuilder, new vec3(base.x, base.y + h, base.z), HOLO_BODY);

    for (var side = 0; side < pointCount; side++) {
        var next = (side + 1) % pointCount;
        var bottomA = startIdx + side * 2;
        var topA = bottomA + 1;
        var bottomB = startIdx + next * 2;
        var topB = bottomB + 1;

        // Side quads.
        appendDoubleSidedIndices(nodeBuilder, [bottomA, topA, bottomB, bottomB, topA, topB]);
        // Top and bottom caps.
        appendDoubleSidedIndices(nodeBuilder, [topCenterIndex, topA, topB, bottomCenterIndex, bottomB, bottomA]);
    }
}

// Connections are built as actual thin cylinders so they render on device.
var connectionBuilder = new MeshBuilder([
    { name: "position", components: 3 },
    { name: "color", components: 4 }
]);
connectionBuilder.topology = MeshTopology.Triangles;
connectionBuilder.indexType = MeshIndexType.UInt16;

// Edge outlines for the holographic cube borders.
var edgeBuilder = new MeshBuilder([
    { name: "position", components: 3 },
    { name: "color", components: 4 }
]);
edgeBuilder.topology = MeshTopology.Triangles;
edgeBuilder.indexType = MeshIndexType.UInt16;

function subtract(a, b) {
    return new vec3(a.x - b.x, a.y - b.y, a.z - b.z);
}

function add(a, b) {
    return new vec3(a.x + b.x, a.y + b.y, a.z + b.z);
}

function scale(v, amount) {
    return new vec3(v.x * amount, v.y * amount, v.z * amount);
}

function length(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function normalize(v) {
    var len = length(v);
    if (len <= 0.0001) {
        return new vec3(0, 0, 0);
    }
    return scale(v, 1 / len);
}

function cross(a, b) {
    return new vec3(
        a.y * b.z - a.z * b.y,
        a.z * b.x - a.x * b.z,
        a.x * b.y - a.y * b.x
    );
}

function addCylinder(builder, segments, radius, start, end, color) {
    var axis = subtract(end, start);
    var axisLength = length(axis);
    if (axisLength <= 0.0001) {
        return;
    }

    var direction = scale(axis, 1 / axisLength);
    var helper = Math.abs(direction.y) < 0.9 ? new vec3(0, 1, 0) : new vec3(1, 0, 0);
    var right = normalize(cross(helper, direction));
    var forward = normalize(cross(direction, right));
    var startIndex = builder.getVerticesCount();

    for (var i = 0; i < segments; i++) {
        var angle = (i / segments) * Math.PI * 2;
        var radial = add(scale(right, Math.cos(angle) * radius), scale(forward, Math.sin(angle) * radius));
        appendColoredVertex(builder, add(start, radial), color);
        appendColoredVertex(builder, add(end, radial), color);
    }

    for (var side = 0; side < segments; side++) {
        var next = (side + 1) % segments;
        var startA = startIndex + side * 2;
        var endA = startA + 1;
        var startB = startIndex + next * 2;
        var endB = startB + 1;
        builder.appendIndices([startA, endA, startB, startB, endA, endB]);
    }

    var startCenterIndex = builder.getVerticesCount();
    appendColoredVertex(builder, start, color);
    var endCenterIndex = builder.getVerticesCount();
    appendColoredVertex(builder, end, color);

    for (var cap = 0; cap < segments; cap++) {
        var capNext = (cap + 1) % segments;
        builder.appendIndices([
            startCenterIndex,
            startIndex + capNext * 2,
            startIndex + cap * 2,
            endCenterIndex,
            startIndex + cap * 2 + 1,
            startIndex + capNext * 2 + 1
        ]);
    }
}

function addConnectionCylinder(start, end, color) {
    addCylinder(connectionBuilder, CYLINDER_SEGMENTS, CONNECTION_RADIUS * DATA_SCALE, start, end, color);
}

function addEdgeCylinder(start, end, color) {
    addCylinder(edgeBuilder, EDGE_SEGMENTS, EDGE_RADIUS * DATA_SCALE, start, end, color);
}

function addBuildingEdges(node) {
    var base = scaledNodePosition(node);
    var h = node.height * DATA_SCALE;
    var s = NODE_HALF_SIZE * DATA_SCALE * NODE_XZ_SCALE;
    var profile = getRoundedProfilePoints(s);
    var vBottom = [];
    var vTop = [];
    var i;

    for (i = 0; i < profile.length; i++) {
        vBottom.push(new vec3(base.x + profile[i].x, base.y, base.z + profile[i].z));
        vTop.push(new vec3(base.x + profile[i].x, base.y + h, base.z + profile[i].z));
    }

    var c = HOLO_EDGE;
    for (i = 0; i < profile.length; i++) {
        var next = (i + 1) % profile.length;
        addEdgeCylinder(vBottom[i], vBottom[next], c);
        addEdgeCylinder(vTop[i], vTop[next], c);
        addEdgeCylinder(vBottom[i], vTop[i], c);
    }
}

function appendArcPoints(points, centerX, centerZ, startAngle, endAngle, radius, segments, includeFirst) {
    var stepStart = includeFirst ? 0 : 1;
    for (var i = stepStart; i <= segments; i++) {
        var t = i / segments;
        var angle = startAngle + (endAngle - startAngle) * t;
        points.push({
            x: centerX + Math.cos(angle) * radius,
            z: centerZ + Math.sin(angle) * radius
        });
    }
}

function getRoundedProfilePoints(halfSize) {
    var radius = Math.min(NODE_CORNER_RADIUS * DATA_SCALE, halfSize);
    if (radius <= 0.0001) {
        return [
            { x: halfSize,  z: -halfSize },
            { x: halfSize,  z: halfSize },
            { x: -halfSize, z: halfSize },
            { x: -halfSize, z: -halfSize }
        ];
    }

    var inner = halfSize - radius;
    var points = [];

    appendArcPoints(points, inner, -inner, -Math.PI * 0.5, 0, radius, CORNER_SEGMENTS, true);
    appendArcPoints(points, inner, inner, 0, Math.PI * 0.5, radius, CORNER_SEGMENTS, false);
    appendArcPoints(points, -inner, inner, Math.PI * 0.5, Math.PI, radius, CORNER_SEGMENTS, false);
    appendArcPoints(points, -inner, -inner, Math.PI, Math.PI * 1.5, radius, CORNER_SEGMENTS, false);

    return points;
}

function findNodeById(nodes, id) {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) {
            return nodes[i];
        }
    }
    return null;
}

function calculateCityOffset(nodes) {
    if (!nodes || nodes.length === 0) {
        return new vec3(0, 0, 0);
    }

    var minX = nodes[0].pos[0] * DATA_SCALE;
    var minY = nodes[0].pos[1] * DATA_SCALE;
    var minZ = nodes[0].pos[2] * DATA_SCALE;

    for (var i = 1; i < nodes.length; i++) {
        var x = nodes[i].pos[0] * DATA_SCALE;
        var y = nodes[i].pos[1] * DATA_SCALE;
        var z = nodes[i].pos[2] * DATA_SCALE;

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        minZ = Math.min(minZ, z);
    }

    // Anchor the city's first visible corner to placement origin.
    return new vec3(minX, minY, minZ);
}

function getCityData() {
    if (script.cityDataJson && script.cityDataJson.json) {
        return script.cityDataJson.json;
    }

    var moduleData = require("Scripts/Data/CityData");
    if (moduleData) {
        return moduleData;
    }

    print("ERROR: No city data found. Assign Assets/data.json to CityGenerator.cityDataJson in the Inspector.");
    return null;
}

function validateInputs() {
    if (!script.nodeMesh) {
        script.nodeMesh = script.getSceneObject().getComponent("Component.RenderMeshVisual");
    }

    if (!script.nodeMesh) {
        print("ERROR: nodeMesh input is not assigned and no Render Mesh Visual exists on this SceneObject.");
        return false;
    }

    if (!script.connectionMesh) {
        script.connectionMesh = script.getSceneObject().createComponent("Component.RenderMeshVisual");
        if (script.nodeMesh.getMaterial(0)) {
            script.connectionMesh.addMaterial(script.nodeMesh.getMaterial(0));
        }
    }

    if (!script.edgeMesh) {
        script.edgeMesh = script.getSceneObject().createComponent("Component.RenderMeshVisual");
        if (script.nodeMesh.getMaterial(0)) {
            script.edgeMesh.addMaterial(script.nodeMesh.getMaterial(0));
        }
    }

    return true;
}

// THE EXECUTION LOOP
function buildCity() {
    if (!validateInputs()) {
        return;
    }

    var data = getCityData();
    if (!data) {
        return;
    }

    if (!data.nodes || !data.connections) {
        print("ERROR: JSON must contain 'nodes' and 'connections' arrays.");
        return;
    }

    print("Success! Rendering " + data.nodes.length + " nodes.");
    CITY_OFFSET = calculateCityOffset(data.nodes);

    // 1. Build Nodes
    data.nodes.forEach(function(node) {
        addBuilding(node);
        addBuildingEdges(node);
        createNodeLabel(node);
    });

    // 2. Build Connections
    data.connections.forEach(function(conn) {
        var fromNode = findNodeById(data.nodes, conn.from);
        var toNode = findNodeById(data.nodes, conn.to);

        if (fromNode && toNode) {
            var start = nodeSurfaceAnchorPosition(fromNode, toNode);
            var end = nodeSurfaceAnchorPosition(toNode, fromNode);
            addConnectionCylinder(start, end, HOLO_CONN);
        } else {
            print("WARNING: Connection skipped because a node id was not found: " + conn.from + " -> " + conn.to);
        }
    });

    finalizeCity();
}

function finalizeCity() {
    if (nodeBuilder.isValid()) {
        script.nodeMesh.mesh = nodeBuilder.getMesh();
        nodeBuilder.updateMesh();
    }
    if (connectionBuilder.isValid()) {
        script.connectionMesh.mesh = connectionBuilder.getMesh();
        connectionBuilder.updateMesh();
    }
    if (edgeBuilder.isValid()) {
        script.edgeMesh.mesh = edgeBuilder.getMesh();
        edgeBuilder.updateMesh();
    }
}

// Build on lens start. The object will become visible once placed by the surface placement script.
buildCity();
