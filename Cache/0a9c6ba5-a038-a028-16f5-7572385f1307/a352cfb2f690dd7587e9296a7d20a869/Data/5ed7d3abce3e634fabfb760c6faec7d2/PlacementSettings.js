"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlacementSettings = exports.PlacementMode = void 0;
/**
 * Specs Inc. 2026
 * Placement configuration classes for surface detection modes and widget settings. Defines PlacementMode
 * enum (HORIZONTAL for ground, VERTICAL for walls, NEAR_SURFACE for tabletop), PlacementSettings for
 * mode selection with optional height adjustment widget, configurable widget offset position, and slider
 * update callback for real-time height changes during placement workflow.
 */
var PlacementMode;
(function (PlacementMode) {
    PlacementMode[PlacementMode["HORIZONTAL"] = 0] = "HORIZONTAL";
    PlacementMode[PlacementMode["VERTICAL"] = 1] = "VERTICAL";
    PlacementMode[PlacementMode["NEAR_SURFACE"] = 2] = "NEAR_SURFACE";
})(PlacementMode || (exports.PlacementMode = PlacementMode = {}));
class PlacementSettings {
    constructor(mode, useWidget = true, widgetOffset = new vec3(2, 2, 0), onSliderUpdated = null) {
        this.onSliderUpdate = null;
        this.placementMode = mode;
        this.useAdjustmentWidget = useWidget;
        this.adjustmentWidgetOffset = widgetOffset;
        this.onSliderUpdate = onSliderUpdated;
    }
}
exports.PlacementSettings = PlacementSettings;
//# sourceMappingURL=PlacementSettings.js.map