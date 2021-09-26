"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PackageManager {
    constructor(requirementFilename, lockFilename) {
        this.requirementFilename = requirementFilename;
        this.lockFilename = lockFilename;
    }
    getRequirementFilename() {
        return this.requirementFilename;
    }
    getLockFilename() {
        return this.lockFilename;
    }
}
exports.default = PackageManager;
