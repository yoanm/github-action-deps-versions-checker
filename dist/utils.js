"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPossiblePreviousSemverTagRef = exports.escapeRegex = exports.packageManagerFactory = exports.behaviorFactory = void 0;
const GithubPRBehavior_1 = require("./behavior/GithubPRBehavior");
const logger_1 = __importDefault(require("./logger"));
const Composer_1 = __importDefault(require("./PackageManager/Composer"));
const GithubPushTagBehavior_1 = require("./behavior/GithubPushTagBehavior");
function behaviorFactory(context, repositoryData, packageManagerType, postResults, force) {
    var _a, _b, _c, _d;
    switch (context.eventName) {
        case 'pull_request':
            logger_1.default.debug(`Using PR behavior for PR #${context.payload.number}`);
            if (context.payload.pull_request === undefined) {
                throw new Error('Pull Request context is undefined !');
            }
            return new GithubPRBehavior_1.GithubPRBehavior(repositoryData.owner.login, repositoryData.name, context.payload.pull_request, packageManagerType, postResults, force);
        case 'push':
            logger_1.default.debug(`Using push behavior for ref ${context.payload.ref}`);
            const tagMatch = (_a = context.payload.ref) === null || _a === void 0 ? void 0 : _a.match(/^refs\/tags\/(?<tag>v?\d+(?:\.\d+)?(?:\.\d+)?)$/);
            console.log({ tagMatch });
            if (!tagMatch || ((_c = (_b = tagMatch.groups) === null || _b === void 0 ? void 0 : _b.tag) === null || _c === void 0 ? void 0 : _c.length) == 0) {
                throw new Error('Only semver tags are managed !');
            }
            if (context.payload.created !== true) {
                throw new Error('Only newly created tags are managed');
            }
            if (((_d = context.sha) === null || _d === void 0 ? void 0 : _d.length) <= 0) {
                throw new Error('Tag must have a commit attached !');
            }
            return new GithubPushTagBehavior_1.GithubPushTagBehavior(repositoryData.owner.login, repositoryData.name, tagMatch.groups.tag, packageManagerType, postResults, force);
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
function listPossiblePreviousSemverTagRef(tag) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const list = [];
    const matches = tag.match(/(?<header>v?)(?<major>\d+)(?:\.(?<minor>\d+))?(?:\.(?<patch>\d+))?$/);
    if (matches && ((_b = (_a = matches.groups) === null || _a === void 0 ? void 0 : _a.major) === null || _b === void 0 ? void 0 : _b.length)) {
        const header = (_d = (_c = matches.groups) === null || _c === void 0 ? void 0 : _c.header) === null || _d === void 0 ? void 0 : _d.trim();
        const major = parseInt((_e = matches.groups) === null || _e === void 0 ? void 0 : _e.major);
        const minor = ((_g = (_f = matches.groups) === null || _f === void 0 ? void 0 : _f.minor) === null || _g === void 0 ? void 0 : _g.length) > 0 ? parseInt((_h = matches.groups) === null || _h === void 0 ? void 0 : _h.minor) : undefined;
        const patch = ((_k = (_j = matches.groups) === null || _j === void 0 ? void 0 : _j.patch) === null || _k === void 0 ? void 0 : _k.length) > 0 ? parseInt((_l = matches.groups) === null || _l === void 0 ? void 0 : _l.patch) : undefined;
        const appendMinor = () => {
            if (minor) {
                if ((minor - 1) >= 0) {
                    list.push(`${header}${major}.${minor - 1}`);
                }
                if (minor > 0) {
                    list.push(`${header}${major}`);
                }
            }
        };
        const appendMajor = () => {
            if ((major - 1) >= 0) {
                list.push(`${header}${major - 1}`);
            }
        };
        if (patch) {
            if ((patch - 1) >= 0) {
                list.push(`${header}${major}.${minor}.${patch - 1}`);
            }
            if (patch > 0) {
                list.push(`${header}${major}.${minor}`);
            }
            appendMinor();
            appendMajor();
        }
        else if (minor) {
            appendMinor();
            appendMajor();
        }
        else if ((major - 1) >= 0) {
            appendMajor();
        }
    }
    return list;
}
exports.listPossiblePreviousSemverTagRef = listPossiblePreviousSemverTagRef;
