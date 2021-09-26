"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentPkgTypeFactory = exports.COMMENT_COMMIT_REGEXP = exports.COMMENT_HEADER = void 0;
const sections_1 = require("./sections");
const utils_1 = require("./utils");
exports.COMMENT_HEADER = '<!-- packagesVersionsChecker -->';
exports.COMMENT_COMMIT_REGEXP = '<\!\-\- commit="([^"]+)" \-\->';
const commentPkgTypeFactory = (packageManagerType) => `<!-- type="${packageManagerType}" -->`;
exports.commentPkgTypeFactory = commentPkgTypeFactory;
function createBody(packageManagerType, commit, packagesDiff) {
    const updatedPackageDiffList = packagesDiff.filter((0, utils_1.isDiffTypeFilter)('UPDATED'));
    return `${exports.COMMENT_HEADER}${(0, exports.commentPkgTypeFactory)(packageManagerType)}<!-- commit="${commit}" --> \n`
        + `# 🔎 ${getPackageManagerName(packageManagerType)} packages versions checker 🔍 \n`
        + '\n'
        + (0, sections_1.createRiskyUpdatesBody)(updatedPackageDiffList)
        + (0, sections_1.createMinorVersionUpdatesBody)(updatedPackageDiffList)
        + (0, sections_1.createPatchVersionUpdatesBody)(updatedPackageDiffList)
        + (0, sections_1.createAddedAndRemovedBody)([
            ...packagesDiff.filter((0, utils_1.isDiffTypeFilter)('ADDED')),
            ...packagesDiff.filter((0, utils_1.isDiffTypeFilter)('REMOVED')),
        ])
        + (0, sections_1.createUnknownBody)(packagesDiff.filter((0, utils_1.isDiffTypeFilter)('UNKNOWN')))
        + (0, sections_1.createCaptionBody)();
}
exports.default = createBody;
function getPackageManagerName(packageManagerType) {
    switch (packageManagerType) {
        case 'composer':
            return 'Composer';
    }
    return '';
}
