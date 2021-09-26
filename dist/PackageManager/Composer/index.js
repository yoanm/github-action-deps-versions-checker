"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../index"));
class Composer extends index_1.default {
    constructor() {
        super('composer.json', 'composer.lock');
    }
    loadLockFile(content) {
        return __awaiter(this, void 0, void 0, function* () {
            return JSON.parse(content);
        });
    }
    loadRequirementFile(content) {
        return __awaiter(this, void 0, void 0, function* () {
            return JSON.parse(content);
        });
    }
    extractLockPackageList(lockFile) {
        return __awaiter(this, void 0, void 0, function* () {
            const reduceFn = (isDevRequirement) => (acc, item) => {
                var _a;
                acc[item.name] = Object.assign(Object.assign({}, item), { isDevRequirement, sourceLink: ((_a = item.support) === null || _a === void 0 ? void 0 : _a.source) || undefined });
                return acc;
            };
            return (lockFile.packages || []).reduce(reduceFn(false), (lockFile['packages-dev'] || []).reduce(reduceFn(true), {}));
        });
    }
    extractPackageVersion(lockPackage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (/^v?\d+\.\d+\.\d+/.test(lockPackage.version)) {
                const match = this.sanitizeTag(lockPackage.version)
                    .match(/^(\d+)\.(\d+)\.(\d+)(.*)?/);
                // TagPackageVersion
                return {
                    full: lockPackage.version,
                    isDev: false,
                    type: 'TAG',
                    major: match[1] && match[1].length ? match[1] : null,
                    minor: match[2] && match[2].length ? match[2] : null,
                    patch: match[3] && match[3].length ? match[3] : null,
                    extra: match[4] && match[4].length ? match[4] : null,
                };
            }
            // CommitPackageVersion
            return {
                // Append the commit ref (only the first 7 chars (=short ref))
                full: lockPackage.version + '#' + lockPackage.dist.reference.substr(0, 7),
                isDev: true,
                type: 'COMMIT',
                commit: lockPackage.dist.reference
            };
        });
    }
    getPackageInfos(lockPackage, requirementFile) {
        return __awaiter(this, void 0, void 0, function* () {
            const rootRequirements = requirementFile[lockPackage.isDevRequirement ? 'require-dev' : 'require'] || {};
            const isRootRequirement = undefined !== rootRequirements[lockPackage.name];
            return Promise.resolve({
                isRootRequirement: isRootRequirement,
                isRootDevRequirement: isRootRequirement && lockPackage.isDevRequirement,
                sourceLink: lockPackage.sourceLink
            });
        });
    }
    sanitizeTag(version) {
        return 'v' === version.charAt(0)
            ? version.substr(1) // Remove 'v' prefix if it exists
            : version;
    }
}
exports.default = Composer;
