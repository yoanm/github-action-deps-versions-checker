import {TableRowDataProvider} from "CommentBody";
import {
    AddedPackageDiff,
    PackageVersion,
    PackageVersionDiff,
    RemovedPackageDiff, UnknownUpdatePackageDiff,
    UpdatedPackageDiff
} from "PackageVersionDiffListCreator";

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
    rowDataProvider: TableRowDataProvider<T>,
    detailsPanel = true
): string {
    let body: string;
    if (detailsPanel) {
        body = '<details>\n'
            + ' <summary>' + header + '</summary>\n'
            + '\n'
        ;
    } else {
        body = '#### ' + header + '\n';
    }
    body += '| ' + columnList.join(' | ') + ' |\n'
        + '| ' + separatorList.join(' | ') + ' |\n'
        + packageDiffListList.map(
            (packageDiffList) => packageDiffList.map(
                (item) => '| ' + rowDataProvider(item).join(' | ') + ' |'
            ).join('\n')
        )
            .filter(item => item.length > 0) // Remove empty line (from empty list)
            .join('\n') + '\n'
        + '\n';
    if (detailsPanel) {
        body += '</details>\n'
            + '\n'
        ;
    }

    return body;
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
    let requirementUpdateLabel = '';
    if (isDiffTypeFilter<UpdatedPackageDiff>('UPDATED')(versionDiff)) {
        const currentRequirement = versionDiff.current.requirement;
        const previousRequirement = versionDiff.previous.requirement;
        if (currentRequirement !== previousRequirement) {
            requirementUpdateLabel = ` (${previousRequirement}->${currentRequirement})`
        } else {
            requirementUpdateLabel = ` (${currentRequirement})`;
        }
    } else if (
        (isDiffTypeFilter<AddedPackageDiff>('ADDED')(versionDiff) || isDiffTypeFilter<UnknownUpdatePackageDiff>('UNKNOWN')(versionDiff))
        && versionDiff.current !== undefined
    ) {
        requirementUpdateLabel = ` (${versionDiff.current.requirement})`;
    }

    return modifier
        + (versionDiff.extra.sourceLink !== undefined ? '['+versionDiff.name+']('+versionDiff.extra.sourceLink+')' : versionDiff.name)
        + requirementUpdateLabel
        + modifier;
}
