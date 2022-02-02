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
            docs?: string | undefined;
            wiki?: string | undefined;
        },
        homepage?: string | undefined;
        abandoned?: boolean | undefined;
    };

    export type MetaComposerLockPackage = ComposerLockPackage & {
        isDevRequirement: boolean;
        link: string | undefined;
    };

    export type RequirementList = {
        [key: string]: string | undefined
    };
}
