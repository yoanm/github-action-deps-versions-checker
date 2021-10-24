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
exports.GithubPushTagBehavior = void 0;
const GithubFileManager_1 = require("../../GithubFileManager");
const logger_1 = __importDefault(require("../../logger"));
const PackageVersionDiffListCreator_1 = __importDefault(require("../../PackageVersionDiffListCreator"));
const utils_1 = require("../../utils");
const GithubReleaseCommentManager_1 = require("../../GithubReleaseCommentManager");
const refs_1 = require("../../github-api/refs");
class GithubPushTagBehavior {
    constructor(repositoryOwner, repositoryName, tagName, packageManagerType, postResults, force) {
        this.previousTagRef = null;
        this.currentTagRef = null;
        this.tagName = tagName;
        this.force = force;
        this.repositoryOwner = repositoryOwner;
        this.repositoryName = repositoryName;
        this.packageManager = (0, utils_1.packageManagerFactory)(packageManagerType);
        this.githubFileManager = new GithubFileManager_1.GithubFileManager(repositoryOwner, repositoryName);
        this.githubCommentManager = new GithubReleaseCommentManager_1.GithubReleaseCommentManager(repositoryOwner, repositoryName, tagName, packageManagerType, postResults);
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug('Creating diff ...');
            if (yield this.shouldCreateDiff()) {
                logger_1.default.info(this.packageManager.getLockFilename() + ' updated ! Gathering data ...');
                const [currentTagRef, previousTagRef] = yield Promise.all([
                    this.getCurrentTagRef(),
                    this.getPreviousTagRef()
                ]);
                if (previousTagRef === undefined) {
                    throw new Error('GithubPushTagBehavior requires a previous tag !');
                }
                const packageVersionDiffListCreator = new PackageVersionDiffListCreator_1.default(this.packageManager, this.githubFileManager, previousTagRef.object.sha, currentTagRef.object.sha);
                logger_1.default.debug(`Creating diff between ${previousTagRef.object.sha.substr(0, 7)} and ${currentTagRef.object.sha.substr(0, 7)} ...`);
                const packagesDiff = yield packageVersionDiffListCreator.createPackageVersionList();
                yield this.manageDiffNotification(packagesDiff);
                return packagesDiff;
            }
            return [];
        });
    }
    manageDiffNotification(packagesDiff) {
        return __awaiter(this, void 0, void 0, function* () {
            if (packagesDiff.length) {
                return this.githubCommentManager.create(this.tagName, packagesDiff);
            }
            return this.githubCommentManager.deletePreviousIfExisting();
        });
    }
    shouldCreateDiff() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug(`Checking if lock file has been updated ...`);
            const [currentTagRef, previousTagRef] = yield Promise.all([
                this.getCurrentTagRef(),
                this.getPreviousTagRef()
            ]);
            if (previousTagRef) {
                const lockFile = yield this.githubFileManager.getFileBetween(this.packageManager.getLockFilename(), previousTagRef.object.sha, currentTagRef.object.sha, ['modified', 'added', 'removed']);
                if (lockFile === undefined) {
                    logger_1.default.info(`${this.packageManager.getLockFilename()} not updated on between ${previousTagRef.object.sha.substr(0, 7)} and ${currentTagRef.object.sha.substr(0, 7)} ...`);
                }
                return lockFile !== undefined;
            }
            return false;
        });
    }
    getCurrentTagRef() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentTagRef === null) {
                logger_1.default.debug('Loading current tag ref...');
                const tagRefs = yield (0, refs_1.getRef)(this.repositoryOwner, this.repositoryName, `tags/${this.tagName}`);
                if (tagRefs === undefined) {
                    throw Error('Unable to load current tag information !');
                }
                this.currentTagRef = tagRefs;
            }
            return this.currentTagRef;
        });
    }
    getPreviousTagRef() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.previousTagRef === null) {
                logger_1.default.debug('Loading previous tag ...');
                this.previousTagRef = yield (0, refs_1.getPreviousSemverTagRef)(this.repositoryOwner, this.repositoryName, `tags/${this.tagName}`);
            }
            return this.previousTagRef;
        });
    }
}
exports.GithubPushTagBehavior = GithubPushTagBehavior;
