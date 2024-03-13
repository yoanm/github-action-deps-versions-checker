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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubFileManager = void 0;
const contents_1 = require("../github-api/contents");
const pulls_1 = require("../github-api/pulls");
class GithubFileManager {
    constructor(repositoryOwner, repositoryName) {
        this.repositoryOwner = repositoryOwner;
        this.repositoryName = repositoryName;
    }
    getPRFile(filename_1, prNumber_1) {
        return __awaiter(this, arguments, void 0, function* (filename, prNumber, fileStatusFilter = undefined) {
            const file = yield (0, pulls_1.getFile)(this.repositoryOwner, this.repositoryName, prNumber, filename);
            if (!file || !fileStatusFilter) {
                return file;
            }
            return (yield this.filterFiles(filename, [file], fileStatusFilter)).pop();
        });
    }
    getFileBetween(filename_1, baseSha_1, headSha_1) {
        return __awaiter(this, arguments, void 0, function* (filename, baseSha, headSha, fileStatusFilter = undefined) {
            const file = yield (0, contents_1.getFileBetween)(this.repositoryOwner, this.repositoryName, baseSha, headSha, filename);
            if (!file || !fileStatusFilter) {
                return file;
            }
            return (yield this.filterFiles(filename, [file], fileStatusFilter)).pop();
        });
    }
    filterFiles(filename_1, fileList_1) {
        return __awaiter(this, arguments, void 0, function* (filename, fileList, fileStatusFilter = undefined) {
            const result = [];
            for (const file of fileList) {
                if (filename === file.filename && fileStatusFilter ? fileStatusFilter.includes(file.status) : true) {
                    result.push(file);
                }
            }
            return result;
        });
    }
    getFileContentAt(filename, commitSha) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield (0, contents_1.getFile)(this.repositoryOwner, this.repositoryName, filename, commitSha);
            if (data === undefined) {
                return undefined;
            }
            if (data.encoding !== 'base64') {
                throw new Error(`Expected base64 encoded file but received "${data.encoding}" !`);
            }
            return this.base64ContentToUTF8(data.content);
        });
    }
    base64ContentToUTF8(content) {
        return Buffer.from(content, 'base64')
            .toString('utf-8');
    }
}
exports.GithubFileManager = GithubFileManager;
