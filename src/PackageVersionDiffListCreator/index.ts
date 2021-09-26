import {LockFile, LockPackage, RequirementFile} from "PackageManager";
import {
    PackageVersion,
    PackageVersionDiff,
    UpdateDirection,
    UpdatedPackageDiff,
    UpdateSubType,
    UpdateType
} from "PackageVersionDiffListCreator";
import {GithubFileManager} from "../GithubFileManager";
import BasePackageManager from "../PackageManager";

export default class PackageVersionDiffListCreator<
    PackageManager extends BasePackageManager<RequirementFile, LockFile, LockPackage>,
> {
    private readonly packageManager: PackageManager;
    private readonly githubFileManager: GithubFileManager;
    private readonly baseCommitSha: string;
    private readonly headCommitSha: string;

    constructor(packageManager: PackageManager, githubFileManager: GithubFileManager, baseCommitSha: string, headCommitSha: string) {
        this.packageManager = packageManager;
        this.githubFileManager = githubFileManager;
        this.baseCommitSha = baseCommitSha;
        this.headCommitSha = headCommitSha;
    }


    public async createPackageVersionList(): Promise<PackageVersionDiff[]> {
        const [previousLockFileContent, currentLockFileContent, previousRequirementFileContent, currentRequirementFileContent] = await Promise.all([
            this.githubFileManager.getFileContentAt(this.packageManager.getLockFilename(), this.baseCommitSha),
            this.githubFileManager.getFileContentAt(this.packageManager.getLockFilename(), this.headCommitSha),
            this.githubFileManager.getFileContentAt(this.packageManager.getRequirementFilename(), this.baseCommitSha),
            this.githubFileManager.getFileContentAt(this.packageManager.getRequirementFilename(), this.headCommitSha),
        ]);

        const [previousLockFile, currentLockFile, previousRequirementFile, currentRequirementFile] = await Promise.all([
            previousLockFileContent ? this.packageManager.loadLockFile(previousLockFileContent) : undefined,
            currentLockFileContent ? this.packageManager.loadLockFile(currentLockFileContent) : undefined,
            previousRequirementFileContent ? this.packageManager.loadRequirementFile(previousRequirementFileContent) : undefined,
            currentRequirementFileContent ? this.packageManager.loadRequirementFile(currentRequirementFileContent) : undefined,
        ]);

        const list = await this.createPackageVersionsDiff(previousLockFile, currentLockFile, previousRequirementFile, currentRequirementFile);

        // Order by name, isRootRequirement and isRootDevRequirement
        // Output => list with root non dev requirements first, then root dev requirements, then others. All sorted by their name

        list.sort((a, b) => {
            if (a.isRootRequirement && b.isRootRequirement) {
                // If both root requirements, sort by dev version vs non dev version
                if (a.isRootDevRequirement && b.isRootDevRequirement) {
                    // If both dev version, sort by name
                    return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
                }

                return (!a.isRootDevRequirement && b.isRootDevRequirement) ? 1 : ((a.isRootDevRequirement && !b.isRootDevRequirement) ? -1 : 0);
            }

            return (!a.isRootRequirement && b.isRootRequirement) ? 1 : ((a.isRootRequirement && !b.isRootRequirement) ? -1 : 0);
        });

        return list;
    }

    public async createPackageVersionsDiff(
        previousLockFile: LockFile | undefined,
        currentLockFile: LockFile | undefined,
        previousRequirementFile: RequirementFile | undefined,
        currentRequirementFile: RequirementFile | undefined
    ): Promise<PackageVersionDiff[]> {
        if (previousLockFile === undefined && currentLockFile === undefined) {
            throw new Error('At least a previous or current lock file has to be provided');
        }
        if (previousRequirementFile === undefined && currentRequirementFile === undefined) {
            throw new Error('At least a previous or current requirement file has to be provided');
        }

        const packageProcessedList: { [ k: string ]: boolean } = {};
        const promiseList: Promise<PackageVersionDiff>[] = [];

        const [previousLockPackageList, currentLockPackageList] = await Promise.all([
            previousLockFile ? this.packageManager.extractLockPackageList(previousLockFile) : {},
            currentLockFile ? this.packageManager.extractLockPackageList(currentLockFile) : {},
        ]);

        // Loop over current to find Added / Updated + all other packages
        Object.keys(currentLockPackageList).forEach(packageName => {
            packageProcessedList[packageName] = true;

            promiseList.push(
                this.createPackageDiff(
                    packageName,
                    previousLockPackageList ? previousLockPackageList[packageName] : undefined,
                    currentLockPackageList[packageName],
                    previousRequirementFile,
                    currentRequirementFile,
                )
            );
        });

        // Loop over previous (skipping already processed packages) to find Removed packages
        Object.keys(previousLockPackageList).forEach(packageName => {
            if (!packageProcessedList[packageName]) {
                packageProcessedList[packageName] = true;

                promiseList.push(
                    this.createPackageDiff(
                        packageName,
                        previousLockPackageList[packageName],
                        currentLockPackageList ? currentLockPackageList[packageName] : undefined,
                        previousRequirementFile,
                        currentRequirementFile,
                    )
                );
            }
        });

        return Promise.all(promiseList);
    }

    public async createPackageDiff(
        packageName: string,
        previousLockPackage: LockPackage | undefined,
        currentLockPackage: LockPackage | undefined,
        previousRequirementFile: RequirementFile | undefined,
        currentRequirementFile: RequirementFile | undefined
    ): Promise<PackageVersionDiff> {
        if (previousLockPackage === undefined && currentLockPackage === undefined) {
            throw new Error('At least a previous or current lock package has to be provided');
        }
        if (previousRequirementFile === undefined && currentRequirementFile === undefined) {
            throw new Error('At least a previous or current requirement file has to be provided');
        }

        const [previousVersionData, currentVersionData] = await Promise.all([
            previousLockPackage ? this.packageManager.extractPackageVersion(previousLockPackage) : undefined,
            currentLockPackage ? this.packageManager.extractPackageVersion(currentLockPackage) : undefined,
        ]);
        const updateType: UpdateType = this.getUpdateType(previousVersionData, currentVersionData);

        const isRemoval = currentLockPackage === undefined;
        const lockPackage: LockPackage = isRemoval ? previousLockPackage : currentLockPackage;
        const requirementFile: LockPackage = isRemoval ? previousRequirementFile : currentRequirementFile;

        const packageInfos = await this.packageManager.getPackageInfos(lockPackage, requirementFile);

        const base: Pick<PackageVersionDiff, 'name' | 'isRootDevRequirement' | 'isRootRequirement' | 'extra'> = {
            name: packageName,
            isRootRequirement: packageInfos.isRootRequirement,
            isRootDevRequirement: packageInfos.isRootDevRequirement,
            extra: {
                sourceLink: packageInfos.sourceLink,
            }
        };

        if ('UPDATED' === updateType) {
            if (!previousVersionData || !currentVersionData) {
                throw new Error('UPDATED require previous and current package versions');
            }

            // UpdatedPackageDiff
            return {
                ...base,
                update: {
                    type: updateType,
                    subType: this.getUpdateSubType(updateType, previousVersionData, currentVersionData),
                    direction: this.getUpdateDirection(updateType, previousVersionData, currentVersionData)
                },
                previous: previousVersionData,
                current: currentVersionData,
            };
        }

        const defaultUpdateData: Exclude<PackageVersionDiff, UpdatedPackageDiff>['update'] = {
            type: updateType,
            subType: 'UNKNOWN',
            direction: 'UNKNOWN',
        };

        if ('ADDED' === defaultUpdateData.type) {
            if (!currentVersionData) {
                throw new Error('ADDED require current package version');
            }

            // AddedPackageDiff
            return {
                ...base,
                update: defaultUpdateData,
                current: currentVersionData,
            };
        }
        if ('REMOVED' === defaultUpdateData.type) {
            if (!previousVersionData) {
                throw new Error('REMOVED require previous package version');
            }

            // RemovedPackageDiff
            return {
                ...base,
                update: defaultUpdateData,
                previous: previousVersionData,
            };
        }
        if ('NONE' === defaultUpdateData.type) {
            if (!previousVersionData || !currentVersionData) {
                throw new Error('NONE require previous and current package versions');
            }

            // NoUpdatePackageDiff
            return {
                ...base,
                update: defaultUpdateData,
                previous: previousVersionData,
                current: currentVersionData,
            };
        }

        // UnknownUpdatePackageDiff
        return {
            ...base,
            update: defaultUpdateData,
            previous: previousVersionData,
            current: currentVersionData,
        };
    }
    protected getUpdateDirection(
        updateType: UpdateType,
        previous: PackageVersion | undefined,
        current: PackageVersion | undefined
    ): UpdateDirection {
        if ('NONE' === updateType || 'UNKNOWN' === updateType) {
            return updateType;
        }
        if (undefined === previous || undefined === current || 'TAG' !== previous.type || 'TAG' !== current.type) {
            return 'UNKNOWN';
        }

        let before;
        let after;

        if (previous.major !== current.major) {
            before = previous.major;
            after = current.major;
        } else if (previous.minor !== current.minor) {
            before = previous.minor;
            after = current.minor;
        } else if (previous.patch !== current.patch) {
            before = previous.patch;
            after = current.patch;
        } else {
            return 'NONE';
        }

        if (!before || !after) {
            return 'UNKNOWN';
        } else {
            return parseInt(before) > parseInt(after)
                ? 'DOWN'
                : 'UP'
                ;
        }
    }

    protected getUpdateType(previous: PackageVersion | undefined, current: PackageVersion | undefined): UpdateType {
        if (!previous && current) {
            return 'ADDED';
        } else if (previous && !current) {
            return 'REMOVED';
        } else if (!previous || !current) {
            return 'UNKNOWN';
        } else if (previous.full === current.full) {
            return 'NONE';
        }

        return 'UPDATED';
    }

    protected getUpdateSubType(
        updateType: UpdateType,
        previous: PackageVersion | undefined,
        current: PackageVersion | undefined
    ): UpdateSubType {
        if ('NONE' === updateType || 'UNKNOWN' === updateType) {
            return updateType;
        } else if (!previous || !current) {
            return 'UNKNOWN';
        }

        if ('TAG' !== previous.type || 'TAG' !== current.type) {
            return 'UNKNOWN'; // Not doable to know the sub type in that case as we can only parse tags !
        } else if (previous.major !== current.major) {
            return 'MAJOR';
        } else if (previous.minor !== current.minor) {
            return 'MINOR';
        } else if (previous.patch !== current.patch) {
            return 'PATCH';
        }

        return 'UNKNOWN';
    }
}
