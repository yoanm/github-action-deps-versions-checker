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
exports.getFileBetween = exports.getFile = exports.get = void 0;
const index_1 = __importDefault(require("./index"));
function get(ownerName, repoName, path, commitHash) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data } = yield index_1.default.rest.repos.getContent({
                owner: ownerName,
                repo: repoName,
                path: path,
                ref: commitHash,
            });
            return data;
        }
        catch (e) {
            if (e.status !== undefined && e.status === 404) {
                return undefined;
            }
            throw e;
        }
    });
}
exports.get = get;
function getFile(ownerName, repoName, path, commitHash) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield get(ownerName, repoName, path, commitHash);
        if (res === undefined) {
            return undefined;
        }
        const file = res;
        const contentType = file.type || null;
        if (contentType !== 'file') {
            throw new Error(`Expected type="file" but received "${contentType}" !`);
        }
        return file;
    });
}
exports.getFile = getFile;
function getFileBetween(ownerName, repoName, baseSha, headSha, filename) {
    var e_1, _a;
    var _b;
    return __awaiter(this, void 0, void 0, function* () {
        const pageIterator = index_1.default.paginate.iterator(index_1.default.rest.repos.compareCommitsWithBasehead, {
            owner: ownerName,
            repo: repoName,
            basehead: `${baseSha}...${headSha}`,
            per_page: 100,
        });
        try {
            for (var pageIterator_1 = __asyncValues(pageIterator), pageIterator_1_1; pageIterator_1_1 = yield pageIterator_1.next(), !pageIterator_1_1.done;) {
                const response = pageIterator_1_1.value;
                const file = ((_b = response.data.files) === null || _b === void 0 ? void 0 : _b.find(item => item.filename === filename)) || undefined;
                if (file !== undefined) {
                    return file;
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
exports.getFileBetween = getFileBetween;
