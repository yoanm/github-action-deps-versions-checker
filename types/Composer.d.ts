declare module "Composer" {
    import {LockFile, LockPackage, RequirementFile} from "PackageManager";

    export type ComposerFile = RequirementFile & {
        require?: RequirementList,
        'require-dev'?: RequirementList,
    };

    export type ComposerLockFile = LockFile & {
        packages?: ComposerLockPackage[],
        'packages-dev'?: ComposerLockPackage[],
    };

    export type ComposerLockPackage = LockPackage & {
        name: string,
        version: string,
        dist: {
            reference: string,
        },
        support?: {
            source?: string | undefined;
        }
    };

    export type MetaComposerLockPackage = ComposerLockPackage & {
        isDevRequirement: boolean;
        sourceLink: string | undefined;
    };

    export type RequirementList = {
        [key: string]: string | undefined
    };
}
