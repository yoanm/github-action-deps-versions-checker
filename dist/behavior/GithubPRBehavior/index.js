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
exports.GithubPRBehavior = void 0;
const GithubFileManager_1 = require("../../GithubFileManager");
const GithubPRCommentManager_1 = require("../../GithubPRCommentManager");
const logger_1 = __importDefault(require("../../logger"));
const PackageVersionDiffListCreator_1 = __importDefault(require("../../PackageVersionDiffListCreator"));
const utils_1 = require("../../utils");
class GithubPRBehavior {
    constructor(repositoryOwner, repositoryName, payload, packageManagerType, postResults, force) {
        this.prId = payload.number;
        this.baseCommitSha = payload.base.sha;
        this.headCommitSha = payload.head.sha;
        this.force = force;
        this.packageManager = (0, utils_1.packageManagerFactory)(packageManagerType);
        this.githubFileManager = new GithubFileManager_1.GithubFileManager(repositoryOwner, repositoryName);
        this.githubCommentManager = new GithubPRCommentManager_1.GithubPRCommentManager(repositoryOwner, repositoryName, this.prId, packageManagerType, postResults);
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug('Creating diff ...');
            if (yield this.shouldCreateDiff()) {
                logger_1.default.info(this.packageManager.getLockFilename() + ' updated ! Gathering data ...');
                const packageVersionDiffListCreator = new PackageVersionDiffListCreator_1.default(this.packageManager, this.githubFileManager, this.baseCommitSha, this.headCommitSha);
                logger_1.default.debug('Creating diff ...');
                const packagesDiff = yield packageVersionDiffListCreator.createPackageVersionList();
                yield this.manageDiffNotification(packagesDiff);
                return packagesDiff;
            }
            logger_1.default.info(this.packageManager.getLockFilename() + ' not updated on that PR !');
            yield this.githubCommentManager.deletePreviousIfExisting();
            return [];
        });
    }
    manageDiffNotification(packagesDiff) {
        return __awaiter(this, void 0, void 0, function* () {
            if (packagesDiff.length) {
                return this.githubCommentManager.createNewIfNeeded(this.headCommitSha, packagesDiff);
            }
            return this.githubCommentManager.deletePreviousIfExisting();
        });
    }
    shouldCreateDiff() {
        return __awaiter(this, void 0, void 0, function* () {
            // /!\ Checking only between comment commit and latest commit may produce bad result
            // see https://github.com/yoanm/github-action-deps-versions-checker/issues/63
            // ==> Always check between base branch and latest commit instead
            logger_1.default.debug('Checking if lock file has been updated on PR ...');
            const lockFile = yield this.githubFileManager.getPRFile(this.packageManager.getLockFilename(), this.prId, ['modified', 'added', 'removed']);
            return lockFile !== undefined;
        });
    }
}
exports.GithubPRBehavior = GithubPRBehavior;
