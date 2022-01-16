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

export default function createBody(packageManagerType: PackageManagerType, commit: string, packagesDiff: PackageVersionDiff[]): string|undefined {
    const updatedPackageDiffList = packagesDiff.filter(isDiffTypeFilter<UpdatedPackageDiff>('UPDATED'));
    const addedPackageDiffList = packagesDiff.filter(isDiffTypeFilter<AddedPackageDiff>('ADDED'));
    const removedPackageDiffList = packagesDiff.filter(isDiffTypeFilter<RemovedPackageDiff>('REMOVED'));
    const unknownPackageDiffList = packagesDiff.filter(isDiffTypeFilter<UnknownUpdatePackageDiff>('UNKNOWN'));

    const listCount = updatedPackageDiffList.length
        + addedPackageDiffList.length
        + removedPackageDiffList.length
        + unknownPackageDiffList.length
    ;

    if (listCount === 0) {
        return undefined;
    }

    return `${COMMENT_HEADER}${commentPkgTypeFactory(packageManagerType)}<!-- commit="${commit}" --> \n`
        +`# 🔎 ${getPackageManagerName(packageManagerType)} packages versions checker 🔍 \n`
        + '\n'
        + createRiskyUpdatesBody([...updatedPackageDiffList, ...addedPackageDiffList])
        + createMinorVersionUpdatesBody(updatedPackageDiffList)
        + createPatchVersionUpdatesBody(updatedPackageDiffList)
        + createAddedAndRemovedBody([
            ...addedPackageDiffList,
            ...removedPackageDiffList,
        ])
        + createUnknownBody(unknownPackageDiffList)
        + createCaptionBody();
}

function getPackageManagerName(packageManagerType: PackageManagerType): string {
    switch(packageManagerType) {
        case 'composer':
            return 'Composer';
    }

    return '';
}
