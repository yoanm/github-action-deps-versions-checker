"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayName = exports.displayVersion = exports.getDirectionIcon = exports.createDiffTableBody = exports.isDiffTypeFilter = void 0;
/**
 * Will return a function used to retrieve only T type objects
 */
function isDiffTypeFilter(updateType) {
    return function (item) {
        return item.update.type === updateType;
    };
}
exports.isDiffTypeFilter = isDiffTypeFilter;
function createDiffTableBody(packageDiffListList, header, columnList, separatorList, rowDataProvider, detailsPanel = true) {
    let body;
    if (detailsPanel) {
        body = '<details>\n'
            + ' <summary>' + header + '</summary>\n'
            + '\n';
    }
    else {
        body = '#### ' + header + '\n';
    }
    body += '| ' + columnList.join(' | ') + ' |\n'
        + '| ' + separatorList.join(' | ') + ' |\n'
        + packageDiffListList.map((packageDiffList) => packageDiffList.map((item) => '| ' + rowDataProvider(item).join(' | ') + ' |').join('\n'))
            .filter(item => item.length > 0) // Remove empty line (from empty list)
            .join('\n') + '\n'
        + '\n';
    if (detailsPanel) {
        body += '</details>\n'
            + '\n';
    }
    return body;
}
exports.createDiffTableBody = createDiffTableBody;
function getDirectionIcon(version) {
    if ('UPDATED' === version.update.type) {
        switch (version.update.direction) {
            case 'UP':
                return '↗️️';
            case 'DOWN':
                return '↘️‼️️';
            case 'NONE':
                return '✔️';
            case 'UNKNOWN':
                return '➡️';
        }
    }
    return '⁉️️️️';
}
exports.getDirectionIcon = getDirectionIcon;
function displayVersion(version) {
    return version.full
        + (version.isDev ? '❗' : '');
}
exports.displayVersion = displayVersion;
function displayName(versionDiff) {
    var _a, _b;
    let modifier = '';
    if (versionDiff.isRootDevRequirement) {
        modifier = '_'; // Italic
    }
    else if (versionDiff.isRootRequirement) {
        modifier = '**'; // Bold
    }
    const currentRequirement = (_a = versionDiff.current) === null || _a === void 0 ? void 0 : _a.requirement;
    const previousRequirement = (_b = versionDiff.previous) === null || _b === void 0 ? void 0 : _b.requirement;
    return modifier
        + (versionDiff.extra.sourceLink !== undefined ? '[' + versionDiff.name + '](' + versionDiff.extra.sourceLink + ')' : versionDiff.name)
        + (currentRequirement !== previousRequirement ? ` (${previousRequirement}->${currentRequirement})` : '')
        + modifier;
}
exports.displayName = displayName;
