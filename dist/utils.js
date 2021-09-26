"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageManagerFactory = exports.behaviorFactory = void 0;
const GithubPRBehavior_1 = require("./behavior/GithubPRBehavior");
const logger_1 = __importDefault(require("./logger"));
const Composer_1 = __importDefault(require("./PackageManager/Composer"));
function behaviorFactory(event_name, repositoryData, webHookPayload, packageManagerType, postResults, force) {
    switch (event_name) {
        case 'pull_request':
            logger_1.default.debug('Using PR behavior!');
            if (webHookPayload.pull_request === undefined) {
                throw new Error('Pull Request context is undefined !');
            }
            return new GithubPRBehavior_1.GithubPRBehavior(repositoryData.owner.login, repositoryData.name, webHookPayload.pull_request, packageManagerType, postResults, force);
    }
    throw new Error('Context type "' + event_name + '" is not supported !');
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
