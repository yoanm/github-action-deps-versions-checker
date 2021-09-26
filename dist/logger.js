"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const logger = {
    info: core_1.info,
    error: core_1.error,
    debug: core_1.debug,
};
exports.default = logger;
