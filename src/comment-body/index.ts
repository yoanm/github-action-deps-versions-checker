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
export const COMMENT_COMMIT_REGEXP = '<\!\-\- commit="([^"]+)" \-\->';
export const commentPkgTypeFactory = (packageManagerType: PackageManagerType): string => `<!-- type="${packageManagerType}" -->`;

export default function createBody(packageManagerType: PackageManagerType, commit: string, packagesDiff: PackageVersionDiff[]): string {
    const updatedPackageDiffList = packagesDiff.filter(isDiffTypeFilter<UpdatedPackageDiff>('UPDATED'));

    return `${COMMENT_HEADER}${commentPkgTypeFactory(packageManagerType)}<!-- commit="${commit}" --> \n`
        +`# 🔎 ${getPackageManagerName(packageManagerType)} packages versions checker 🔍 \n`
        + '\n'
        + createRiskyUpdatesBody(updatedPackageDiffList)
        + createMinorVersionUpdatesBody(updatedPackageDiffList)
        + createPatchVersionUpdatesBody(updatedPackageDiffList)
        + createAddedAndRemovedBody([
            ...packagesDiff.filter(isDiffTypeFilter<AddedPackageDiff>('ADDED')),
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
