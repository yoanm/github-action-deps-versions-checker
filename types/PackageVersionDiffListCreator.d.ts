declare module "PackageVersionDiffListCreator" {
    interface BasePackageDiff {
        name: string,
        isRootRequirement: boolean,
        isRootDevRequirement: boolean,
        extra: {
            sourceLink?: string,
        }
    }

    export interface AddedPackageDiff extends BasePackageDiff {
        update: {
            type: Extract<UpdateType, 'ADDED'>,
            subType: Extract<UpdateSubType, 'UNKNOWN'>,
            direction: Extract<UpdateDirection, 'UNKNOWN'>,
        },
        current: PackageVersion,
    }

    export interface UpdatedPackageDiff extends BasePackageDiff {
        update: {
            type: Extract<UpdateType, 'UPDATED'>,
            subType: UpdateSubType,
            direction: UpdateDirection,
        },
        previous: PackageVersion,
        current: PackageVersion,
    }

    export interface RemovedPackageDiff extends BasePackageDiff {
        update: {
            type: Extract<UpdateType, 'REMOVED'>,
            subType: Extract<UpdateSubType, 'UNKNOWN'>,
            direction: Extract<UpdateDirection, 'UNKNOWN'>,
        },
        previous: PackageVersion,
    }

    export interface NoUpdatePackageDiff extends BasePackageDiff {
        update: {
            type: Extract<UpdateType, 'NONE'>,
            subType: Extract<UpdateSubType, 'UNKNOWN'>,
            direction: Extract<UpdateDirection, 'UNKNOWN'>,
        },
        current: PackageVersion,
        previous: PackageVersion,
    }

    export interface UnknownUpdatePackageDiff extends BasePackageDiff {
        update: {
            type: Extract<UpdateType, 'UNKNOWN'>,
            subType: Extract<UpdateSubType, 'UNKNOWN'>,
            direction: Extract<UpdateDirection, 'UNKNOWN'>,
        },
        current?: PackageVersion | undefined,
        previous?: PackageVersion | undefined,
    }

    export type PackageVersionDiff = AddedPackageDiff
        | UpdatedPackageDiff
        | RemovedPackageDiff
        | NoUpdatePackageDiff
        | UnknownUpdatePackageDiff
    ;

    interface BasePackageVersion {
        full: string,
        isDev: boolean
    }

    export interface TagPackageVersion extends BasePackageVersion {
        type: Extract<VersionType, 'TAG'>,
        major: string | null,
        minor: string | null,
        patch: string | null,
        extra: string | null
    }

    export interface CommitPackageVersion extends BasePackageVersion {
        type: Extract<VersionType, 'COMMIT'>,
        commit?: string,
    }

    export type PackageVersion = TagPackageVersion | CommitPackageVersion;

    export type VersionType = 'TAG' | 'COMMIT';
    export type UpdateType = 'ADDED' | 'REMOVED' | 'UPDATED' | 'NONE' | 'UNKNOWN';

    export type UpdateSubType = 'MAJOR' | 'MINOR' | 'PATCH' | 'NONE' | 'UNKNOWN';
    export type UpdateDirection = 'UP' | 'DOWN' | 'NONE' | 'UNKNOWN';
}
