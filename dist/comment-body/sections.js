"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCaptionBody = exports.createUnknownBody = exports.createAddedAndRemovedBody = exports.createPatchVersionUpdatesBody = exports.createMinorVersionUpdatesBody = exports.createRiskyUpdatesBody = void 0;
const utils_1 = require("./utils");
function createRiskyUpdatesBody(packagesDiff) {
    const majorUpdateList = packagesDiff.filter(item => 'MAJOR' === item.update.subType);
    const unknownUpdateList = packagesDiff.filter(item => 'UNKNOWN' === item.update.subType);
    const minorDowngradeList = packagesDiff.filter(item => 'MINOR' === item.update.subType && item.update.direction === 'DOWN');
    const patchDowngradeList = packagesDiff.filter(item => 'PATCH' === item.update.subType && item.update.direction === 'DOWN');
    const totalCount = majorUpdateList.length
        + unknownUpdateList.length
        + minorDowngradeList.length
        + patchDowngradeList.length;
    if (0 === totalCount) {
        return '';
    }
    return (0, utils_1.createDiffTableBody)([majorUpdateList, unknownUpdateList, minorDowngradeList, patchDowngradeList], `${totalCount} risky update${totalCount > 1 ? 's' : ''}\n_Major/Unknown updates & Minor/Patch downgrades_`, ['Name', 'From', '  ', 'To'], [':---', '---:', ':---:', '---:'], item => [
        (0, utils_1.displayName)(item),
        (0, utils_1.displayVersion)(item.previous),
        (0, utils_1.getDirectionIcon)(item),
        (0, utils_1.displayVersion)(item.current)
    ], false);
}
exports.createRiskyUpdatesBody = createRiskyUpdatesBody;
function createMinorVersionUpdatesBody(packagesDiff) {
    const list = packagesDiff.filter(item => 'MINOR' === item.update.subType && item.update.direction !== 'DOWN');
    if (0 === list.length) {
        return '';
    }
    return (0, utils_1.createDiffTableBody)([list], `${list.length} minor version update${list.length > 1 ? 's' : ''}`, ['Name', 'From', '  ', 'To'], [':---', '---:', ':---:', '---:'], item => [
        (0, utils_1.displayName)(item),
        (0, utils_1.displayVersion)(item.previous),
        (0, utils_1.getDirectionIcon)(item),
        (0, utils_1.displayVersion)(item.current)
    ]);
}
exports.createMinorVersionUpdatesBody = createMinorVersionUpdatesBody;
function createPatchVersionUpdatesBody(packagesDiff) {
    const list = packagesDiff.filter(item => 'PATCH' === item.update.subType && item.update.direction !== 'DOWN');
    if (0 === list.length) {
        return '';
    }
    return (0, utils_1.createDiffTableBody)([list], `${list.length} patch version update${list.length > 1 ? 's' : ''}`, ['Name', 'From', '  ', 'To'], [':---', '---:', ':---:', '---:'], item => [
        (0, utils_1.displayName)(item),
        (0, utils_1.displayVersion)(item.previous),
        (0, utils_1.getDirectionIcon)(item),
        (0, utils_1.displayVersion)(item.current)
    ]);
}
exports.createPatchVersionUpdatesBody = createPatchVersionUpdatesBody;
function createAddedAndRemovedBody(packagesDiff) {
    if (0 === packagesDiff.length) {
        return '';
    }
    const addedPackageList = packagesDiff.filter((0, utils_1.isDiffTypeFilter)('ADDED'));
    const removedPackageList = packagesDiff.filter((0, utils_1.isDiffTypeFilter)('REMOVED'));
    // Can't use createDiffTableBody as there two different types, AddedPackageDiff and RemovedPackageDiff types !
    return (0, utils_1.createDiffTableBody)([addedPackageList, removedPackageList], `${addedPackageList.length} package${addedPackageList.length > 1 ? 's' : ''} added & ${removedPackageList.length} package${removedPackageList.length > 1 ? 's' : ''} removed`, ['Name', 'Version'], [':---:', ':---'], item => {
        if ((0, utils_1.isDiffTypeFilter)('ADDED')(item)) {
            return [':heavy_plus_sign:', (0, utils_1.displayName)(item), (0, utils_1.displayVersion)(item.current)];
        }
        return [':heavy_minus_sign:', (0, utils_1.displayName)(item), (0, utils_1.displayVersion)(item.previous)];
    });
}
exports.createAddedAndRemovedBody = createAddedAndRemovedBody;
function createUnknownBody(packagesDiff) {
    if (0 === packagesDiff.length) {
        return '';
    }
    return (0, utils_1.createDiffTableBody)([packagesDiff], `${packagesDiff.length} unknown operation${packagesDiff.length > 1 ? 's' : ''}`, ['Name'], [':---'], item => [(0, utils_1.displayName)(item)]);
}
exports.createUnknownBody = createUnknownBody;
function createCaptionBody() {
    return '\n'
        + '\n'
        + '<details>\n'
        + ' <summary>Caption</summary>\n'
        + '\n'
        + '##### Root dependencies\n'
        + '|   | Meaning |\n'
        + '| :---: | :--- |\n'
        + '| **Bold** | Root dependency |\n'
        + '| _Italic_ | Root dev dependency |'
        + '\n'
        + '##### Version update directions\n'
        + '| Icon | Meaning |\n'
        + '| :---: | :--- |\n'
        + '| :arrow_heading_up: | Upgrade |\n'
        + '| :arrow_heading_down::bangbang: | Downgrade |\n'
        + '| :arrow_right: | Unknown |\n'
        + '| :heavy_check_mark: | Unchanged |\n'
        + '| :interrobang: | Unmanaged |\n'
        + '\n'
        + '##### Versions\n'
        + '| Icon | Meaning |\n'
        + '| :---: | :--- |\n'
        + '| {VERSION}:exclamation:| dev version (usually a branch or a ref) |\n'
        + '\n'
        + '##### Added & removed packages\n'
        + '| Icon | Meaning |\n'
        + '| :---: | :--- |\n'
        + '| :heavy_plus_sign: | Added package |\n'
        + '| :heavy_minus_sign: | Removed package |\n'
        + '\n'
        + '</details>\n'
        + '\n';
}
exports.createCaptionBody = createCaptionBody;
