import {PackageManagerType} from "PackageManager";
import {
    AddedPackageDiff,
    PackageVersionDiff,
    RemovedPackageDiff,
    UnknownUpdatePackageDiff,
    UpdatedPackageDiff
} from "PackageVersionDiffListCreator";
import {
    createAddedAndRemovedBody,
    createCaptionBody,
    createMinorVersionUpdatesBody,
    createPatchVersionUpdatesBody,
    createRiskyUpdatesBody,
    createUnknownBody
} from "./sections";
import {isDiffTypeFilter} from "./utils";

export const COMMENT_HEADER = '<!-- packagesVersionsChecker -->';
export const COMMENT_COMMIT_REGEXP = '<!-- commit="([^"]+)" -->';
export const commentPkgTypeFactory = (packageManagerType: PackageManagerType): string => `<!-- type="${packageManagerType}" -->`;

export default function createBody(packageManagerType: PackageManagerType, commit: string, packagesDiff: PackageVersionDiff[]): string {
    const updatedPackageDiffList = packagesDiff.filter(isDiffTypeFilter<UpdatedPackageDiff>('UPDATED'));
    const addedPackageDiffList = packagesDiff.filter(isDiffTypeFilter<AddedPackageDiff>('ADDED'));
    const riskyAddedPackageDiffList: AddedPackageDiff[] = [];
    const harmlessAddedPackageDiffList: AddedPackageDiff[] = [];
    for (const item of addedPackageDiffList) {
        if (item.current.isDev) {
            // In case package has been added with dev version, append it to risky updates
            riskyAddedPackageDiffList.push(item);
        } else {
            harmlessAddedPackageDiffList.push(item);
        }
    }

    return `${COMMENT_HEADER}${commentPkgTypeFactory(packageManagerType)}<!-- commit="${commit}" --> \n`
        +`# 🔎 ${getPackageManagerName(packageManagerType)} packages versions checker 🔍 \n`
        + '\n'
        + createRiskyUpdatesBody([...updatedPackageDiffList, ...riskyAddedPackageDiffList])
        + createMinorVersionUpdatesBody(updatedPackageDiffList)
        + createPatchVersionUpdatesBody(updatedPackageDiffList)
        + createAddedAndRemovedBody([
            ...harmlessAddedPackageDiffList,
            ...packagesDiff.filter(isDiffTypeFilter<RemovedPackageDiff>('REMOVED')),
        ])
        + createUnknownBody(packagesDiff.filter(isDiffTypeFilter<UnknownUpdatePackageDiff>('UNKNOWN')))
        + createCaptionBody();
}

function getPackageManagerName(packageManagerType: PackageManagerType): string {
    switch(packageManagerType) {
        case 'composer':
            return 'Composer';
    }

    return '';
}
