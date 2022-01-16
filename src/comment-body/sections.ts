import {
    AddedPackageDiff, PackageVersionDiff,
    RemovedPackageDiff,
    UnknownUpdatePackageDiff,
    UpdatedPackageDiff
} from "PackageVersionDiffListCreator";
import {createDiffTableBody, displayName, displayVersion, getDirectionIcon, isDiffTypeFilter} from "./utils";

function sortByPkgName<T extends PackageVersionDiff>(list: T[]): T[] {
    return list.sort((a, b) => a.name.localeCompare(b.name));
}

export function createRiskyUpdatesBody(packagesDiff: (AddedPackageDiff|UpdatedPackageDiff)[]): string {
    const majorUpdateList = sortByPkgName(packagesDiff.filter(item => 'MAJOR' === item.update.subType));
    const unknownUpdateList = sortByPkgName(packagesDiff.filter(item => 'UPDATED' === item.update.type && 'UNKNOWN' === item.update.subType));
    const riskyAddedList = sortByPkgName(packagesDiff.filter(item => 'ADDED' === item.update.type && item.current.isDev));

    const totalCount: number = majorUpdateList.length + unknownUpdateList.length + riskyAddedList.length;

    if (0 === totalCount) {
        return '';
    }

    return createDiffTableBody<(AddedPackageDiff|UpdatedPackageDiff)>(
        [majorUpdateList, unknownUpdateList, riskyAddedList],
        `${totalCount} risky update${totalCount > 1 ? 's' : ''}`,
        ['Name', 'From', '  ', 'To'],
        [':---', '---:', ':---:', '---:'],
        item => [
            displayName(item),
            isDiffTypeFilter<AddedPackageDiff>('ADDED')(item) ? '' : displayVersion(item.previous),
            getDirectionIcon(item),
            displayVersion(item.current)
        ],
    );
}

export function createMinorVersionUpdatesBody(packagesDiff: UpdatedPackageDiff[]): string {
    const list = sortByPkgName(packagesDiff.filter(item => 'MINOR' === item.update.subType));

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
    const list = sortByPkgName(packagesDiff.filter(item => 'PATCH' === item.update.subType));

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

    const addedPackageList = sortByPkgName(packagesDiff.filter(item => isDiffTypeFilter<AddedPackageDiff>('ADDED')(item) && !item.current.isDev));
    const removedPackageList = sortByPkgName(packagesDiff.filter(isDiffTypeFilter<RemovedPackageDiff>('REMOVED')));

    return createDiffTableBody<AddedPackageDiff|RemovedPackageDiff>(
        [addedPackageList, removedPackageList],
        `${addedPackageList.length} package${addedPackageList.length > 1 ? 's' : ''} added & ${removedPackageList.length} package${removedPackageList.length > 1 ? 's' : ''} removed`,
        ['', 'Name', 'Version'],
        [':---:', ':---', '---:'],
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
