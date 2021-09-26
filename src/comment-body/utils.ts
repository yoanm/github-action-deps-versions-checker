import {TableRowDataProvider} from "CommentBody";
import {PackageVersion, PackageVersionDiff} from "PackageVersionDiffListCreator";

/**
 * Will return a function used to retrieve only T type objects
 */
export function isDiffTypeFilter<T extends PackageVersionDiff>(updateType: T["update"]["type"]) {
    return function (item: PackageVersionDiff): item is T {
        return (item as T).update.type === updateType;
    };
}

export function createDiffTableBody<T extends PackageVersionDiff>(
    packageDiffListList: T[][],
    header: string,
    columnList: string[],
    separatorList: string[],
    rowDataProvider: TableRowDataProvider<T>
): string {
    return '## ' + header + '\n'
        + '| ' + columnList.join(' | ') + ' |\n'
        + '| ' + separatorList.join(' | ') + ' |\n'
        + packageDiffListList.map(
            (packageDiffList) => packageDiffList.map(
                (item) => '| ' + rowDataProvider(item).join(' | ') + ' |'
            ).join('\n')
        )
            .filter(item => item.length > 0) // Remove empty line (from empty list)
            .join('\n') + '\n'
        + '\n';
}

export function getDirectionIcon(version: PackageVersionDiff): string {
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

export function displayVersion(version: PackageVersion): string {
    return version.full
        + (version.isDev ? '❗' : '')
    ;
}


export function displayName(versionDiff: PackageVersionDiff): string {
    let modifier = '';
    if (versionDiff.isRootDevRequirement) {
        modifier = '_'; // Italic
    } else if (versionDiff.isRootRequirement) {
        modifier = '**'; // Bold
    }

    return modifier
        + (versionDiff.extra.sourceLink !== undefined ? '['+versionDiff.name+']('+versionDiff.extra.sourceLink+')' : versionDiff.name)
        + modifier;
}
