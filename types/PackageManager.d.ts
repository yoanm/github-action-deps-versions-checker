declare module "PackageManager" {
    export type LockFile = unknown;

    export type RequirementFile = unknown;

    export type LockPackage = unknown;

    export type PackageList<T extends LockPackage> = {
        [packageName: string]: T | undefined;
    };

    export interface PackageInfos {
        isRootRequirement: boolean,
        isRootDevRequirement: boolean,
        sourceLink?: string,
    }

    export type PackageManagerType = 'composer'/* | 'npm' | 'yarn'*/;
}
