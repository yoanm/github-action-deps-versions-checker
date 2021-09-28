"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPossiblePreviousSemver = exports.escapeRegex = exports.packageManagerFactory = exports.behaviorFactory = void 0;
const GithubPRBehavior_1 = require("./behavior/GithubPRBehavior");
const logger_1 = __importDefault(require("./logger"));
const Composer_1 = __importDefault(require("./PackageManager/Composer"));
const GithubPushTagBehavior_1 = require("./behavior/GithubPushTagBehavior");
function behaviorFactory(context, repositoryData, packageManagerType, postResults, force) {
    var _a, _b, _c;
    switch (context.eventName) {
        case 'pull_request':
            logger_1.default.debug(`Using PR behavior for PR #${context.payload.number}`);
            if (context.payload.pull_request === undefined) {
                throw new Error('Pull Request context is undefined !');
            }
            return new GithubPRBehavior_1.GithubPRBehavior(repositoryData.owner.login, repositoryData.name, context.payload.pull_request, packageManagerType, postResults, force);
        case 'push':
            logger_1.default.debug(`Using push behavior for ref ${context.payload.ref}`);
            const tagMatch = (_a = context.payload.ref) === null || _a === void 0 ? void 0 : _a.match(/^refs\/tags\/(v?\d+(?:\.\d+)?(?:\.\d+)?)$/);
            if (!tagMatch || ((_b = tagMatch[0]) === null || _b === void 0 ? void 0 : _b.length) <= 0) {
                throw new Error('Only semver tags are managed !');
            }
            if (context.payload.created !== true) {
                throw new Error('Only newly created tags are managed');
            }
            if (((_c = context.payload.sha) === null || _c === void 0 ? void 0 : _c.length) <= 0) {
                throw new Error('Tag must have a commit attached !');
            }
            return new GithubPushTagBehavior_1.GithubPushTagBehavior(repositoryData.owner.login, repositoryData.name, context.sha, packageManagerType, postResults, force);
    }
    throw new Error('Context type "' + context.eventName + '" is not supported !');
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
const escapeRegex = (regex) => regex.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
exports.escapeRegex = escapeRegex;
function listPossiblePreviousSemver(tag, asRegex = false) {
    var _a, _b, _c;
    const matches = tag.match(/(v?)(\d+)(?:\.(\d+))?(?:\.(\d+))?$/);
    if (matches && ((_a = matches[1]) === null || _a === void 0 ? void 0 : _a.length)) {
        const header = matches[0].trim();
        const major = parseInt(matches[1]);
        const minor = ((_b = matches[2]) === null || _b === void 0 ? void 0 : _b.length) > 0 ? parseInt(matches[2]) : undefined;
        const patch = ((_c = matches[3]) === null || _c === void 0 ? void 0 : _c.length) > 0 ? parseInt(matches[3]) : undefined;
        const tmpList = [
            [],
            [],
            [], // vX versions
        ];
        if (patch && (patch - 1) >= 0) {
            tmpList[0].push(`${header}${major}.${minor}.${patch - 1}`);
        }
        if (minor && (minor - 1) >= 0) {
            tmpList[0].push(`${header}${major}.${minor - 1}.0`);
            tmpList[1].push(`${header}${major}.${minor - 1}`);
        }
        if ((major - 1) >= 0) {
            tmpList[0].push(`${header}${major - 1}.0.0`);
            tmpList[1].push(`${header}${major - 1}.0`);
            tmpList[2].push(`${header}${major - 1}`);
        }
        if (asRegex) {
            return tmpList.flat().map(item => new RegExp(`/^${(0, exports.escapeRegex)(item)}/`));
        }
        return tmpList.flat();
    }
    return [];
}
exports.listPossiblePreviousSemver = listPossiblePreviousSemver;
