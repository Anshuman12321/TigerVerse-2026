// SquareTap.js

var interaction = script.getSceneObject().getComponent("Component.InteractionComponent");

if (!interaction) {
    print("No Interaction Component found. Add one to this object.");
} else {
    interaction.onTap.add(function(eventArgs) {
        print("Square tapped!");

        // Example action: move the square upward
        var transform = script.getSceneObject().getTransform();
        var pos = transform.getLocalPosition();

        pos.y += 2;
        transform.setLocalPosition(pos);
    });
}