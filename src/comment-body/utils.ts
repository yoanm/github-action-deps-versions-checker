import {TableRowDataProvider} from "CommentBody";
import {
    AddedPackageDiff,
    PackageVersion,
    PackageVersionDiff,
    UnknownUpdatePackageDiff,
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

export function displayVersion(version: PackageVersion): string {
    return version.full
        + (version.isDev ? ':exclamation:' : '')
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
export function displayRequirement(versionDiff: PackageVersionDiff): string {
    if (isDiffTypeFilter<UpdatedPackageDiff>('UPDATED')(versionDiff)) {
        const currentRequirement = versionDiff.current.requirement;
        const previousRequirement = versionDiff.previous.requirement;
        if (currentRequirement !== previousRequirement) {
            return `${previousRequirement} -> ${currentRequirement}`;
        } else if (currentRequirement !== undefined) {
            return `${currentRequirement}`;
        }
    } else if (
        (isDiffTypeFilter<AddedPackageDiff>('ADDED')(versionDiff) || isDiffTypeFilter<UnknownUpdatePackageDiff>('UNKNOWN')(versionDiff))
        && versionDiff.current?.requirement !== undefined
    ) {
        return `${versionDiff.current.requirement}`;
    }

    return '';
}
