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

    const totalCount: number = majorUpdateList.length + unknownUpdateList.length;

    if (0 === totalCount) {
        return '';
    }

    return createDiffTableBody<UpdatedPackageDiff>(
        [majorUpdateList, unknownUpdateList],
        `${totalCount} risky update${totalCount > 1 ? 's' : ''}`,
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

export function createMinorVersionUpdatesBody(packagesDiff: UpdatedPackageDiff[]): string {
    const list = packagesDiff.filter(item => 'MINOR' === item.update.subType);

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
    const list = packagesDiff.filter(item => 'PATCH' === item.update.subType);

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
        [':---', ':---'],
        item => {
            if (isDiffTypeFilter<AddedPackageDiff>('ADDED')(item)) {
                return ['➕', displayName(item), displayVersion(item.current)];
            }

            return ['➖', displayName(item), displayVersion(item.previous)];
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
        + '### Root dependencies\n'
        + '|   | Meaning |\n'
        + '| :---: | :--- |\n'
        + '| **Bold** | Root dependency |\n'
        + '| _Italic_ | Root dev dependency |'
        + '\n'
        + '### Version update directions\n'
        + '| Icon | Meaning |\n'
        + '| :---: | :--- |\n'
        + '| ↗ | Upgrade |\n'
        + '| ↘️‼ | Downgrade |\n'
        + '| ➡️ | Unknown |\n'
        + '| ✔ | Unchanged |\n'
        + '| ⁉️ | Unmanaged |\n'
        + '\n'
        + '### Versions\n'
        + '| Icon | Meaning |\n'
        + '| :---: | :--- |\n'
        + '| {VERSION}❗| dev version (usually a branch or a ref) |\n'
        + '\n'
        + '### Added & removed packages\n'
        + '| Icon | Meaning |\n'
        + '| :---: | :--- |\n'
        + '| ➕ | Added package |\n'
        + '| ➖ | Removed package |\n'
        + '\n'
        + '</details>\n'
        + '\n'
    ;
}
