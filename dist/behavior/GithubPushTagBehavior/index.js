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
const tags_1 = require("../../github-api/tags");
class GithubPushTagBehavior {
    constructor(repositoryOwner, repositoryName, tagSha, packageManagerType, postResults, force) {
        this.previousTag = null;
        this.currentTag = null;
        this.tagSha = tagSha;
        this.force = force;
        this.repositoryOwner = repositoryOwner;
        this.repositoryName = repositoryName;
        this.packageManager = (0, utils_1.packageManagerFactory)(packageManagerType);
        this.githubFileManager = new GithubFileManager_1.GithubFileManager(repositoryOwner, repositoryName);
        this.githubCommentManager = new GithubReleaseCommentManager_1.GithubReleaseCommentManager(repositoryOwner, repositoryName, tagSha, packageManagerType, postResults);
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug('Creating diff ...');
            if (yield this.shouldCreateDiff()) {
                logger_1.default.info(this.packageManager.getLockFilename() + ' updated ! Gathering data ...');
                const previousTag = yield this.getPrevious();
                if (previousTag === undefined) {
                    throw new Error('GithubPushTagBehavior requires a previous tag !');
                }
                const packageVersionDiffListCreator = new PackageVersionDiffListCreator_1.default(this.packageManager, this.githubFileManager, previousTag.object.sha, this.tagSha);
                logger_1.default.debug('Creating diff ...');
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
                return this.githubCommentManager.create(this.tagSha, packagesDiff);
            }
            return this.githubCommentManager.deletePreviousIfExisting();
        });
    }
    shouldCreateDiff() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug(`Checking if lock file has been updated ...`);
            const previousTag = yield this.getPrevious();
            if (previousTag) {
                const lockFile = yield this.githubFileManager.getFileBetween(this.packageManager.getLockFilename(), previousTag.object.sha, this.tagSha, ['modified', 'added', 'removed']);
                if (lockFile === undefined) {
                    logger_1.default.info(`${this.packageManager.getLockFilename()} not updated on between ${previousTag.object.sha.substr(0, 7)} and ${this.tagSha.substr(0, 7)} ...`);
                }
                return lockFile !== undefined;
            }
            return false;
        });
    }
    getCurrent() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentTag === null) {
                logger_1.default.debug('Loading current tag ...');
                const tag = yield (0, tags_1.get)(this.repositoryOwner, this.repositoryName, this.tagSha);
                if (tag === undefined) {
                    throw Error('Unable to load current tag information !');
                }
                this.currentTag = tag;
            }
            return this.currentTag;
        });
    }
    getPrevious() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.previousTag === null) {
                logger_1.default.debug('Loading previous tag ...');
                this.previousTag = undefined;
                const currentTag = yield this.getCurrent();
                if (currentTag) {
                    logger_1.default.debug(`Loading tag before ${currentTag.tag}...`);
                    this.previousTag = yield (0, tags_1.getPreviousSemver)(this.repositoryOwner, this.repositoryName, currentTag.tag);
                }
            }
            return this.previousTag;
        });
    }
}
exports.GithubPushTagBehavior = GithubPushTagBehavior;
