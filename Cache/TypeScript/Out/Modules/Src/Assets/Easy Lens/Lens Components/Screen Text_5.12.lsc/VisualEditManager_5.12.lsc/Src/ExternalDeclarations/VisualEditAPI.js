"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isVisualEditManagerAvailable = isVisualEditManagerAvailable;
exports.getVisualEditManager = getVisualEditManager;
function isVisualEditManagerAvailable() {
    // @ts-ignore
    if (global.EasyLens && global.EasyLens.VisualEdit) {
        return true;
    }
    return false;
}
function getVisualEditManager() {
    // @ts-ignore
    return global.EasyLens.VisualEdit;
}
//# sourceMappingURL=VisualEditAPI.js.map