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
exports.getPreviousSemverTagRef = exports.getRef = void 0;
const index_1 = __importDefault(require("./index"));
const request_error_1 = require("@octokit/request-error");
const utils_1 = require("../utils");
const logger_1 = __importDefault(require("../logger"));
function getRef(ownerName, repoName, ref) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data } = yield index_1.default.rest.git.getRef({ owner: ownerName, repo: repoName, ref });
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
exports.getRef = getRef;
function getPreviousSemverTagRef(ownerName, repoName, tag) {
    return __awaiter(this, void 0, void 0, function* () {
        const previousTagList = (0, utils_1.listPossiblePreviousSemver)(tag);
        let previousTagRef;
        for (const attempt of previousTagList) {
            logger_1.default.debug(`Try loading ref for tag before "${tag}" - try $"{attempt}"`);
            previousTagRef = yield getRef(ownerName, repoName, `tags/${attempt}`);
            if (previousTagRef) {
                break;
            }
        }
        return previousTagRef;
    });
}
exports.getPreviousSemverTagRef = getPreviousSemverTagRef;
