"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const core = __importStar(require("@actions/core"));
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
const logger_1 = __importDefault(require("./logger"));
const utils_1 = require("./utils");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const repositoryData = github_1.context.payload.repository;
            if (undefined === repositoryData) {
                throw new Error("Repository context is undefined !");
            }
            const packageManagerType = (0, core_1.getInput)("manager", {
                required: true,
                trimWhitespace: true,
            });
            const contextType = (0, core_1.getInput)("context", {
                required: true,
                trimWhitespace: true,
            });
            const postResults = (0, core_1.getBooleanInput)("post-results", {
                required: true,
                trimWhitespace: true,
            });
            const force = (0, core_1.getBooleanInput)("force", {
                required: true,
                trimWhitespace: true,
            });
            const behavior = (0, utils_1.behaviorFactory)(contextType, repositoryData, github_1.context.payload, packageManagerType, postResults, force);
            const packagesDiff = yield behavior.execute();
            core.setOutput("diff", packagesDiff);
        }
        catch (error) {
            logger_1.default.error(error instanceof Error ? error : `Unknown error ! ${error}`);
            core.setFailed("An error occurred ! See log above.");
        }
    });
}
run();
