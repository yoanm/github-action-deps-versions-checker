"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayRequirement = exports.displayName = exports.displayVersion = exports.getDirectionIcon = exports.createDiffTableBody = exports.isDiffTypeFilter = void 0;
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
                return ':arrow_heading_up:';
            case 'DOWN':
                return ':arrow_heading_down::bangbang:️️';
            case 'NONE':
                return ':heavy_check_mark:️';
            case 'UNKNOWN':
                return ':arrow_right:️';
        }
    }
    return ':interrobang:️️️';
}
exports.getDirectionIcon = getDirectionIcon;
function displayVersion(version) {
    return version.full
        + (version.isDev ? ':exclamation:' : '');
}
exports.displayVersion = displayVersion;
function displayName(versionDiff) {
    var _a;
    let modifier = '';
    if (versionDiff.isRootDevRequirement) {
        modifier = '_'; // Italic
    }
    else if (versionDiff.isRootRequirement) {
        modifier = '**'; // Bold
    }
    let requirementUpdateLabel = '';
    if (isDiffTypeFilter('UPDATED')(versionDiff)) {
        const currentRequirement = versionDiff.current.requirement;
        const previousRequirement = versionDiff.previous.requirement;
        if (currentRequirement !== previousRequirement) {
            requirementUpdateLabel = ` (${previousRequirement}->${currentRequirement})`;
        }
        else if (currentRequirement !== undefined) {
            requirementUpdateLabel = ` (${currentRequirement})`;
        }
    }
    else if ((isDiffTypeFilter('ADDED')(versionDiff) || isDiffTypeFilter('UNKNOWN')(versionDiff))
        && ((_a = versionDiff.current) === null || _a === void 0 ? void 0 : _a.requirement) !== undefined) {
        requirementUpdateLabel = ` (${versionDiff.current.requirement})`;
    }
    return modifier
        + (versionDiff.extra.sourceLink !== undefined ? '[' + versionDiff.name + '](' + versionDiff.extra.sourceLink + ')' : versionDiff.name)
        + requirementUpdateLabel
        + modifier;
}
exports.displayName = displayName;
function displayRequirement(versionDiff) {
    var _a;
    if (isDiffTypeFilter('UPDATED')(versionDiff)) {
        const currentRequirement = versionDiff.current.requirement;
        const previousRequirement = versionDiff.previous.requirement;
        if (currentRequirement !== previousRequirement) {
            return `${previousRequirement} -> ${currentRequirement}`;
        }
        else if (currentRequirement !== undefined) {
            return `${currentRequirement}`;
        }
    }
    else if ((isDiffTypeFilter('ADDED')(versionDiff) || isDiffTypeFilter('UNKNOWN')(versionDiff))
        && ((_a = versionDiff.current) === null || _a === void 0 ? void 0 : _a.requirement) !== undefined) {
        return `${versionDiff.current.requirement}`;
    }
    return '';
}
exports.displayRequirement = displayRequirement;
