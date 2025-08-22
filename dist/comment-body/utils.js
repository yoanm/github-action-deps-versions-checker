"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDiffTypeFilter = isDiffTypeFilter;
exports.createDiffTableBody = createDiffTableBody;
exports.getDirectionIcon = getDirectionIcon;
exports.displayVersion = displayVersion;
exports.displayName = displayName;
/**
 * Will return a function used to retrieve only T type objects
 */
function isDiffTypeFilter(updateType) {
    return function (item) {
        return item.update.type === updateType;
    };
}
function createDiffTableBody(packageDiffListList, header, columnList, separatorList, rowDataProvider) {
    return '## ' + header + '\n'
        + '| ' + columnList.join(' | ') + ' |\n'
        + '| ' + separatorList.join(' | ') + ' |\n'
        + packageDiffListList.map((packageDiffList) => packageDiffList.map((item) => '| ' + rowDataProvider(item).join(' | ') + ' |').join('\n'))
            .filter(item => item.length > 0) // Remove empty line (from empty list)
            .join('\n') + '\n'
        + '\n';
}
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
    else if ('ADDED' === version.update.type) {
        return '➕️';
    }
    return '⁉️️️️';
}
function displayVersion(version) {
    return version.full
        + (version.isDev ? '❗' : '');
}
function displayName(versionDiff) {
    let modifier = '';
    if (versionDiff.isRootDevRequirement) {
        modifier = '_'; // Italic
    }
    else if (versionDiff.isRootRequirement) {
        modifier = '**'; // Bold
    }
    return modifier
        + (versionDiff.extra.link !== undefined ? '[' + versionDiff.name + '](' + versionDiff.extra.link + ')' : versionDiff.name)
        + (versionDiff.isAbandoned ? ':skull_and_crossbones:' : '')
        + modifier;
}
