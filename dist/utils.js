"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageManagerFactory = exports.behaviorFactory = void 0;
const GithubPRBehavior_1 = require("./behavior/GithubPRBehavior");
const logger_1 = __importDefault(require("./logger"));
const Composer_1 = __importDefault(require("./PackageManager/Composer"));
function behaviorFactory(contextType, repositoryData, webHookPayload, packageManagerType, postResults, force) {
    switch (contextType) {
        case 'PR':
            logger_1.default.debug('Using PR behavior!');
            return new GithubPRBehavior_1.GithubPRBehavior(repositoryData.owner.login, repositoryData.name, webHookPayload.pull_request, packageManagerType, postResults, force);
    }
    throw new Error('Context type "' + contextType + '" is not supported !');
}
exports.behaviorFactory = behaviorFactory;
function packageManagerFactory(packageManagerType) {
    switch (packageManagerType) {
        case 'composer':
            logger_1.default.debug('Using Composer package manager!');
            return new Composer_1.default();
    }
    throw new Error(`Package manager type "${packageManagerType}" is not supported !`);
}
exports.packageManagerFactory = packageManagerFactory;
