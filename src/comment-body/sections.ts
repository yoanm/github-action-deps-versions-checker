import {
    AddedPackageDiff,
    RemovedPackageDiff,
    UnknownUpdatePackageDiff,
    UpdatedPackageDiff
} from "PackageVersionDiffListCreator";
import {createDiffTableBody, displayName, displayVersion, getDirectionIcon, isDiffTypeFilter} from "./utils";

export function createRiskyUpdatesBody(packagesDiff: UpdatedPackageDiff[]): string {
    const majorUpdateList = packagesDiff.filter(item => 'MAJOR' === item.update.subType);
    const unknownUpdateList = packagesDiff.filter(item => 'UNKNOWN' === item.update.subType);
    const minorDowngradeList = packagesDiff.filter(item => 'MINOR' === item.update.subType && item.update.direction === 'DOWN');
    const patchDowngradeList = packagesDiff.filter(item => 'PATCH' === item.update.subType && item.update.direction === 'DOWN');

    const totalCount: number = majorUpdateList.length
        + unknownUpdateList.length
        + minorDowngradeList.length
        + patchDowngradeList.length
    ;

    if (0 === totalCount) {
        return '';
    }

    return createDiffTableBody<UpdatedPackageDiff>(
        [majorUpdateList, unknownUpdateList, minorDowngradeList, patchDowngradeList],
        `${totalCount} risky update${totalCount > 1 ? 's' : ''}\n_Major/Unknown updates & Minor/Patch downgrades_`,
        ['Name', 'From', '  ', 'To'],
        [':---', '---:', ':---:', '---:'],
        item => [
            displayName(item),
            displayVersion(item.previous),
            getDirectionIcon(item),
            displayVersion(item.current)
        ],
        false,
    );
}

export function createMinorVersionUpdatesBody(packagesDiff: UpdatedPackageDiff[]): string {
    const list = packagesDiff.filter(item => 'MINOR' === item.update.subType && item.update.direction !== 'DOWN');

    if (0 === list.length) {
        return '';
    }

    return createDiffTableBody<UpdatedPackageDiff>(
        [list],
        `${list.length} minor version update${list.length > 1 ? 's' : ''}`,
        ['Name', 'From', '  ', 'To'],
        [':---', '---:', ':---:', '---:'],
        item => [
            displayName(item),
            displayVersion(item.previous),
            getDirectionIcon(item),
            displayVersion(item.current)
        ],
    );
}

export function createPatchVersionUpdatesBody(packagesDiff: UpdatedPackageDiff[]): string {
    const list = packagesDiff.filter(item => 'PATCH' === item.update.subType && item.update.direction !== 'DOWN');

    if (0 === list.length) {
        return '';
    }

    return createDiffTableBody<UpdatedPackageDiff>(
        [list],
        `${list.length} patch version update${list.length > 1 ? 's' : ''}`,
        ['Name', 'From', '  ', 'To'],
        [':---', '---:', ':---:', '---:'],
        item => [
            displayName(item),
            displayVersion(item.previous),
            getDirectionIcon(item),
            displayVersion(item.current)
        ],
    );
}

export function createAddedAndRemovedBody(packagesDiff: (AddedPackageDiff|RemovedPackageDiff)[]): string {
    if (0 === packagesDiff.length) {
        return '';
    }

    const addedPackageList = packagesDiff.filter(isDiffTypeFilter<AddedPackageDiff>('ADDED'));
    const removedPackageList = packagesDiff.filter(isDiffTypeFilter<RemovedPackageDiff>('REMOVED'));

    // Can't use createDiffTableBody as there two different types, AddedPackageDiff and RemovedPackageDiff types !
    return createDiffTableBody<AddedPackageDiff|RemovedPackageDiff>(
        [addedPackageList, removedPackageList],
        `${addedPackageList.length} package${addedPackageList.length > 1 ? 's' : ''} added & ${removedPackageList.length} package${removedPackageList.length > 1 ? 's' : ''} removed`,
        ['Name', 'Version'],
        [':---:', ':---'],
        item => {
            if (isDiffTypeFilter<AddedPackageDiff>('ADDED')(item)) {
                return [':heavy_plus_sign:', displayName(item), displayVersion(item.current)];
            }

            return [':heavy_minus_sign:', displayName(item), displayVersion(item.previous)];
        },
    );
}

export function createUnknownBody(packagesDiff: UnknownUpdatePackageDiff[]): string {
    if (0 === packagesDiff.length) {
        return '';
    }

    return createDiffTableBody<UnknownUpdatePackageDiff>(
        [packagesDiff],
        `${packagesDiff.length} unknown operation${packagesDiff.length > 1 ? 's' : ''}`,
        ['Name'],
        [':---'],
        item => [displayName(item)],
    );
}

export function createCaptionBody(): string {
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
        + '\n'
    ;
}
