"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.GithubPRCommentManager = void 0;
const comment_body_1 = __importStar(require("../comment-body"));
const pulls_1 = require("../github-api/pulls");
const logger_1 = __importDefault(require("../logger"));
class GithubPRCommentManager {
    constructor(repositoryOwner, repositoryName, prId, packageManagerType, postResults) {
        this.previousComment = null;
        this.repositoryOwner = repositoryOwner;
        this.repositoryName = repositoryName;
        this.prId = prId;
        this.packageManagerType = packageManagerType;
        this.postResults = postResults;
    }
    getPrevious() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (this.previousComment === null) {
                this.previousComment = undefined;
                if (this.postResults) {
                    logger_1.default.debug('Loading previous comment ...');
                    const comment = yield (0, pulls_1.getLastCommentMatching)(this.repositoryOwner, this.repositoryName, this.prId, new RegExp('^'
                        + comment_body_1.COMMENT_HEADER.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
                        + (0, comment_body_1.commentPkgTypeFactory)(this.packageManagerType)));
                    const match = (_a = comment === null || comment === void 0 ? void 0 : comment.body) === null || _a === void 0 ? void 0 : _a.match(new RegExp(comment_body_1.COMMENT_COMMIT_REGEXP));
                    if (comment && match) {
                        this.previousComment = Object.assign(Object.assign({}, comment), { commitRef: match[1] });
                    }
                }
            }
            return this.previousComment;
        });
    }
    createNewIfNeeded(commitSha, packagesDiff) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!this.postResults) {
                return;
            }
            const commentBody = (0, comment_body_1.default)(this.packageManagerType, commitSha, packagesDiff);
            if (commentBody === undefined) {
                logger_1.default.debug('Nothing to post ! Removing previous if it exists !');
                return this.deletePreviousIfExisting();
            }
            const previousComment = yield this.getPrevious();
            if (previousComment) {
                // Remove first line of each bodies as they contains commit information (and so can't never match)
                const previousBodyToCompare = (_a = previousComment.body) === null || _a === void 0 ? void 0 : _a.substring(((_b = previousComment.body) === null || _b === void 0 ? void 0 : _b.indexOf("\n")) + 1);
                const newBodyToCompare = commentBody.substring(commentBody.indexOf("\n") + 1);
                if (previousBodyToCompare === newBodyToCompare) {
                    // Avoid deleting comment and then create the exact same one
                    logger_1.default.info('Same comment as before, nothing to do. Bye !');
                    return;
                }
            }
            yield this.deletePreviousIfExisting();
            logger_1.default.debug('Posting comment ...');
            return (0, pulls_1.createComment)(this.repositoryOwner, this.repositoryName, this.prId, commentBody);
        });
    }
    deletePreviousIfExisting() {
        return __awaiter(this, void 0, void 0, function* () {
            const previousComment = yield this.getPrevious();
            if (previousComment) {
                logger_1.default.info('Removing previous comment ...');
                return (0, pulls_1.deleteComment)(this.repositoryOwner, this.repositoryName, previousComment.id);
            }
        });
    }
}
exports.GithubPRCommentManager = GithubPRCommentManager;
