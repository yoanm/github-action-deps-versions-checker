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
exports.get = void 0;
const index_1 = __importDefault(require("./index"));
const request_error_1 = require("@octokit/request-error");
function get(ownerName, repoName, tagSha) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data } = yield index_1.default.rest.git.getTag({ owner: ownerName, repo: repoName, tag_sha: tagSha });
            return data;
        }
        catch (e) {
            if (e instanceof request_error_1.RequestError && e.status === 404) {
                return undefined;
            }
            throw e;
        }
    });
}
exports.get = get;
