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
exports.getByTag = exports.update = exports.create = void 0;
const index_1 = __importDefault(require("./index"));
const request_error_1 = require("@octokit/request-error");
function create(ownerName, repoName, tag, body) {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
exports.create = create;
function update(ownerName, repoName, releaseId, body) {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
exports.update = update;
function getByTag(ownerName, repoName, tag) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data } = yield index_1.default.rest.repos.getReleaseByTag({
                owner: ownerName,
                repo: repoName,
                tag
            });
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
exports.getByTag = getByTag;
