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
const tags_1 = require("../../github-api/tags");
class GithubPushTagBehavior {
    constructor(repositoryOwner, repositoryName, tagName, packageManagerType, postResults, force) {
        this.previousTagRefCommitSha = null;
        this.currentTagCommitSha = null;
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
                const [currentTagCommitSha, previousTagRefCommitSha] = yield Promise.all([
                    this.getCurrentTagCommitSha(),
                    this.getPreviousTagCommitSha()
                ]);
                if (previousTagRefCommitSha === undefined) {
                    throw new Error('GithubPushTagBehavior requires a previous tag !');
                }
                const packageVersionDiffListCreator = new PackageVersionDiffListCreator_1.default(this.packageManager, this.githubFileManager, previousTagRefCommitSha, currentTagCommitSha);
                logger_1.default.debug(`Creating diff between ${previousTagRefCommitSha.substr(0, 7)} and ${currentTagCommitSha.substr(0, 7)} ...`);
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
            const [currentTagCommitSha, previousTagRefCommitSha] = yield Promise.all([
                this.getCurrentTagCommitSha(),
                this.getPreviousTagCommitSha()
            ]);
            if (previousTagRefCommitSha) {
                const lockFile = yield this.githubFileManager.getFileBetween(this.packageManager.getLockFilename(), previousTagRefCommitSha, currentTagCommitSha, ['modified', 'added', 'removed']);
                if (lockFile === undefined) {
                    logger_1.default.info(`${this.packageManager.getLockFilename()} not updated on between ${previousTagRefCommitSha.substr(0, 7)} and ${currentTagCommitSha.substr(0, 7)} ...`);
                }
                return lockFile !== undefined;
            }
            return false;
        });
    }
    getCurrentTagCommitSha() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentTagCommitSha === null) {
                logger_1.default.debug(`Loading current ref for "tags/${this.tagName}" ...`);
                const tagRef = yield (0, refs_1.getRef)(this.repositoryOwner, this.repositoryName, `tags/${this.tagName}`);
                logger_1.default.debug(`Current ref: "${JSON.stringify(tagRef)}"`);
                if (tagRef === undefined) {
                    throw Error('Unable to load current tag information !');
                }
                if (tagRef.object.type === 'tag') {
                    // Retrieve the commit sha attached to the tag
                    const tag = yield (0, tags_1.getTag)(this.repositoryOwner, this.repositoryName, tagRef.object.sha);
                    if (tag === undefined) {
                        throw new Error(`Unable to retrieve current tag commit sha for "${tagRef.ref}/${tagRef.object.type}/${tagRef.object.sha}"`);
                    }
                    this.currentTagCommitSha = tag.object.sha;
                }
                else if (tagRef.object.type === 'commit') {
                    this.currentTagCommitSha = tagRef.object.sha;
                }
                else {
                    throw new Error(`Unable to manage current tag ref of type "${tagRef.object.type}"`);
                }
                logger_1.default.debug(`Current tag commit sha: "${this.currentTagCommitSha}"`);
            }
            return this.currentTagCommitSha;
        });
    }
    getPreviousTagCommitSha() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.previousTagRefCommitSha === null) {
                logger_1.default.debug(`Loading previous ref for tag before ${this.tagName} ...`);
                const tagRef = yield (0, refs_1.getPreviousSemverTagRef)(this.repositoryOwner, this.repositoryName, this.tagName);
                logger_1.default.debug(`previous ref: "${JSON.stringify(tagRef)}"`);
                if (tagRef === undefined) {
                    this.previousTagRefCommitSha = undefined;
                }
                else {
                    if (tagRef.object.type === 'tag') {
                        // Retrieve the commit sha attached to the tag
                        const tag = yield (0, tags_1.getTag)(this.repositoryOwner, this.repositoryName, tagRef.object.sha);
                        if (tag === undefined) {
                            throw new Error(`Unable to retrieve previous tag commit sha for "${tagRef.ref}/${tagRef.object.type}/${tagRef.object.sha}"`);
                        }
                        this.previousTagRefCommitSha = tag.object.sha;
                    }
                    else if (tagRef.object.type === 'commit') {
                        this.previousTagRefCommitSha = tagRef.object.sha;
                    }
                    else {
                        throw new Error(`Unable to manage previous tag ref of type "${tagRef.object.type}"`);
                    }
                }
                logger_1.default.debug(`Previous tag commit sha: "${this.previousTagRefCommitSha}"`);
            }
            return this.previousTagRefCommitSha;
        });
    }
}
exports.GithubPushTagBehavior = GithubPushTagBehavior;
