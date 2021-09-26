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
exports.GithubPushBehavior = void 0;
const GithubFileManager_1 = require("../../GithubFileManager");
const logger_1 = __importDefault(require("../../logger"));
const PackageVersionDiffListCreator_1 = __importDefault(require("../../PackageVersionDiffListCreator"));
const utils_1 = require("../../utils");
class GithubPushBehavior {
    //private readonly githubCommentManager: GithubPRCommentManager;
    constructor(repositoryOwner, repositoryName, baseCommitSha, headCommitSha, packageManagerType, postResults, force) {
        this.baseCommitSha = baseCommitSha;
        this.headCommitSha = headCommitSha;
        this.force = force;
        this.packageManager = (0, utils_1.packageManagerFactory)(packageManagerType);
        this.githubFileManager = new GithubFileManager_1.GithubFileManager(repositoryOwner, repositoryName);
        /*this.githubCommentManager = new GithubPRCommentManager(
            repositoryOwner,
            repositoryName,
            this.prId,
            packageManagerType,
            postResults
        );*/
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
            return [];
        });
    }
    manageDiffNotification(packagesDiff) {
        return __awaiter(this, void 0, void 0, function* () {
            return;
            /*
            if (packagesDiff.length) {
                return this.githubCommentManager.createNewIfNeeded(this.headCommitSha, packagesDiff);
            }
    
            return this.githubCommentManager.deletePreviousIfExisting();
             */
        });
    }
    shouldCreateDiff() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug(`Checking if lock file has been updated between ${this.baseCommitSha.substr(0, 7)} and ${this.headCommitSha.substr(0, 7)} ...`);
            const lockFile = yield this.githubFileManager.getFileBetween(this.packageManager.getLockFilename(), this.baseCommitSha, this.headCommitSha, ['modified', 'added', 'removed']);
            if (lockFile === undefined) {
                logger_1.default.info(this.packageManager.getLockFilename() + ' not updated on that PR !');
            }
            return lockFile !== undefined;
        });
    }
}
exports.GithubPushBehavior = GithubPushBehavior;
