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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComment = exports.deleteComment = exports.getLastCommentMatching = exports.getFile = void 0;
const index_1 = __importDefault(require("./index"));
function getFile(ownerName, repoName, prId, filename) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        const pageIterator = index_1.default.paginate.iterator(index_1.default.rest.pulls.listFiles, {
            owner: ownerName,
            repo: repoName,
            pull_number: prId,
            per_page: 100,
        });
        try {
            for (var pageIterator_1 = __asyncValues(pageIterator), pageIterator_1_1; pageIterator_1_1 = yield pageIterator_1.next(), !pageIterator_1_1.done;) {
                const { data } = pageIterator_1_1.value;
                for (const file of data) {
                    if (file.filename === filename) {
                        return file;
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (pageIterator_1_1 && !pageIterator_1_1.done && (_a = pageIterator_1.return)) yield _a.call(pageIterator_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return undefined;
    });
}
exports.getFile = getFile;
function getLastCommentMatching(ownerName, repoName, pullNumber, bodyMatch) {
    var e_2, _a;
    return __awaiter(this, void 0, void 0, function* () {
        const pageIterator = index_1.default.paginate.iterator(index_1.default.rest.issues.listComments, {
            owner: ownerName,
            repo: repoName,
            issue_number: pullNumber,
        });
        try {
            for (var pageIterator_2 = __asyncValues(pageIterator), pageIterator_2_1; pageIterator_2_1 = yield pageIterator_2.next(), !pageIterator_2_1.done;) {
                const response = pageIterator_2_1.value;
                const comment = response.data.find(item => item.body && bodyMatch.test(item.body));
                if (comment !== undefined) {
                    return comment;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (pageIterator_2_1 && !pageIterator_2_1.done && (_a = pageIterator_2.return)) yield _a.call(pageIterator_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return undefined;
    });
}
exports.getLastCommentMatching = getLastCommentMatching;
function deleteComment(ownerName, repoName, commentId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield index_1.default.rest.issues.deleteComment({
            owner: ownerName,
            repo: repoName,
            comment_id: commentId,
        });
    });
}
exports.deleteComment = deleteComment;
function createComment(ownerName, repoName, pullNumber, body) {
    return __awaiter(this, void 0, void 0, function* () {
        yield index_1.default.rest.issues.createComment({
            owner: ownerName,
            repo: repoName,
            issue_number: pullNumber,
            body,
        });
    });
}
exports.createComment = createComment;
