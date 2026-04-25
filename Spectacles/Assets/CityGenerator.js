//@input Component.RenderMeshVisual nodeMesh
//@input Component.RenderMeshVisual connectionMesh
//@input Asset.JsonAsset cityDataJson
//@input float dataScale = 0.1
//@input float nodeHalfSize = 1
//@input float connectionRadius = 0.25

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

// Standard cube indices (12 triangles, 36 indices)
var CUBE_INDICES = [
    0,1,2, 2,3,0, 4,5,6, 6,7,4, 0,4,7, 7,3,0,
    1,5,6, 6,2,1, 0,1,5, 5,4,0, 3,2,6, 6,7,3
];

function getPositiveInput(value, fallback) {
    return value && value > 0 ? value : fallback;
}

var DATA_SCALE = getPositiveInput(script.dataScale, 0.1);
var NODE_HALF_SIZE = getPositiveInput(script.nodeHalfSize, 1);
var CONNECTION_RADIUS = getPositiveInput(script.connectionRadius, 0.25);
var CYLINDER_SEGMENTS = 12;
var CITY_OFFSET = new vec3(0, 0, 0);

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

function addBuilding(node, color) {
    var startIdx = nodeBuilder.getVerticesCount();
    var base = scaledNodePosition(node);
    var h = node.height * DATA_SCALE;
    var s = NODE_HALF_SIZE * DATA_SCALE;

    // The 8 corners of our building
    var v = [
        new vec3(base.x - s, base.y,     base.z - s),
        new vec3(base.x + s, base.y,     base.z - s),
        new vec3(base.x + s, base.y + h, base.z - s),
        new vec3(base.x - s, base.y + h, base.z - s),
        new vec3(base.x - s, base.y,     base.z + s),
        new vec3(base.x + s, base.y,     base.z + s),
        new vec3(base.x + s, base.y + h, base.z + s),
        new vec3(base.x - s, base.y + h, base.z + s)
    ];

    // Interleave the positions with the color provided
    for (var i = 0; i < 8; i++) {
        appendColoredVertex(nodeBuilder, v[i], color);
    }

    // Offset indices for this specific building
    var offsetIndices = [];
    for (var index = 0; index < CUBE_INDICES.length; index++) {
        offsetIndices.push(CUBE_INDICES[index] + startIdx);
    }
    nodeBuilder.appendIndices(offsetIndices);
}

// Connections are built as actual thin cylinders so they render on device.
var connectionBuilder = new MeshBuilder([
    { name: "position", components: 3 },
    { name: "color", components: 4 }
]);
connectionBuilder.topology = MeshTopology.Triangles;
connectionBuilder.indexType = MeshIndexType.UInt16;

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

function addConnectionCylinder(start, end, color) {
    var axis = subtract(end, start);
    var axisLength = length(axis);
    if (axisLength <= 0.0001) {
        return;
    }

    var direction = scale(axis, 1 / axisLength);
    var helper = Math.abs(direction.y) < 0.9 ? new vec3(0, 1, 0) : new vec3(1, 0, 0);
    var right = normalize(cross(helper, direction));
    var forward = normalize(cross(direction, right));
    var startIndex = connectionBuilder.getVerticesCount();
    var radius = CONNECTION_RADIUS * DATA_SCALE;

    for (var i = 0; i < CYLINDER_SEGMENTS; i++) {
        var angle = (i / CYLINDER_SEGMENTS) * Math.PI * 2;
        var radial = add(scale(right, Math.cos(angle) * radius), scale(forward, Math.sin(angle) * radius));
        appendColoredVertex(connectionBuilder, add(start, radial), color);
        appendColoredVertex(connectionBuilder, add(end, radial), color);
    }

    for (var side = 0; side < CYLINDER_SEGMENTS; side++) {
        var next = (side + 1) % CYLINDER_SEGMENTS;
        var startA = startIndex + side * 2;
        var endA = startA + 1;
        var startB = startIndex + next * 2;
        var endB = startB + 1;
        connectionBuilder.appendIndices([startA, endA, startB, startB, endA, endB]);
    }

    var startCenterIndex = connectionBuilder.getVerticesCount();
    appendColoredVertex(connectionBuilder, start, color);
    var endCenterIndex = connectionBuilder.getVerticesCount();
    appendColoredVertex(connectionBuilder, end, color);

    for (var cap = 0; cap < CYLINDER_SEGMENTS; cap++) {
        var capNext = (cap + 1) % CYLINDER_SEGMENTS;
        connectionBuilder.appendIndices([
            startCenterIndex,
            startIndex + capNext * 2,
            startIndex + cap * 2,
            endCenterIndex,
            startIndex + cap * 2 + 1,
            startIndex + capNext * 2 + 1
        ]);
    }
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
    var maxX = minX;
    var minY = nodes[0].pos[1] * DATA_SCALE;
    var minZ = nodes[0].pos[2] * DATA_SCALE;
    var maxZ = minZ;

    for (var i = 1; i < nodes.length; i++) {
        var x = nodes[i].pos[0] * DATA_SCALE;
        var y = nodes[i].pos[1] * DATA_SCALE;
        var z = nodes[i].pos[2] * DATA_SCALE;

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        minZ = Math.min(minZ, z);
        maxZ = Math.max(maxZ, z);
    }

    // Center the graph around the placed object, while keeping its base on the tabletop plane.
    return new vec3((minX + maxX) * 0.5, minY, (minZ + maxZ) * 0.5);
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
    var nodeColorsById = {};
    data.nodes.forEach(function(node) {
        var col = makeColor(node.color);
        nodeColorsById[node.id] = col;
        addBuilding(node, col);
    });

    // 2. Build Connections
    data.connections.forEach(function(conn) {
        var fromNode = findNodeById(data.nodes, conn.from);
        var toNode = findNodeById(data.nodes, conn.to);

        if (fromNode && toNode) {
            var start = nodeTopPosition(fromNode);
            var end = nodeTopPosition(toNode);
            var connectionColor = averageColor(nodeColorsById[fromNode.id], nodeColorsById[toNode.id]);
            addConnectionCylinder(start, end, connectionColor);
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
}

// Build on lens start. The object will become visible once placed by the surface placement script.
buildCity();
