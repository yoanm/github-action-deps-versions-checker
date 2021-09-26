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
exports.GithubReleaseCommentManager = void 0;
const comment_body_1 = __importDefault(require("../comment-body"));
const releases_1 = require("../github-api/releases");
const logger_1 = __importDefault(require("../logger"));
const tags_1 = require("../github-api/tags");
class GithubReleaseCommentManager {
    constructor(repositoryOwner, repositoryName, tagSha, packageManagerType, postResults) {
        this.repositoryOwner = repositoryOwner;
        this.repositoryName = repositoryName;
        this.tagSha = tagSha;
        this.packageManagerType = packageManagerType;
        this.postResults = postResults;
    }
    create(commitSha, packagesDiff) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.postResults) {
                return;
            }
            const tag = yield (0, tags_1.get)(this.repositoryOwner, this.repositoryName, this.tagSha);
            if (!tag) {
                throw new Error('Unable to retrieve the current tag !');
            }
            const release = tag
                ? yield (0, releases_1.getByTag)(this.repositoryOwner, this.repositoryName, tag.tag)
                : undefined;
            const commentBody = (0, comment_body_1.default)(this.packageManagerType, commitSha, packagesDiff);
            if (!release) {
                // create the release
                yield (0, releases_1.create)(this.repositoryOwner, this.repositoryName, tag.tag, commentBody);
            }
            else {
                if (release.body) {
                    // Remove first line of each bodies as they contains commit information (and so can't never match)
                    const previousBodyToCompare = release.body.substring(release.body.indexOf("\n") + 1);
                    const newBodyToCompare = commentBody.substring(commentBody.indexOf("\n") + 1);
                    if (previousBodyToCompare === newBodyToCompare) {
                        logger_1.default.info('Same comment as before, nothing to do. Bye !');
                        return;
                    }
                }
                logger_1.default.debug('Posting comment ...');
                yield (0, releases_1.update)(this.repositoryOwner, this.repositoryName, release.id, `${((_a = release.body) === null || _a === void 0 ? void 0 : _a.length) ? `${release.body}\n\n` : ''}${commentBody}`);
                return;
            }
        });
    }
    deletePreviousIfExisting() {
        return __awaiter(this, void 0, void 0, function* () {
            // Nothing to do in that case
            return;
        });
    }
}
exports.GithubReleaseCommentManager = GithubReleaseCommentManager;
