"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class PackageVersionDiffListCreator {
    constructor(packageManager, githubFileManager, baseCommitSha, headCommitSha) {
        this.packageManager = packageManager;
        this.githubFileManager = githubFileManager;
        this.baseCommitSha = baseCommitSha;
        this.headCommitSha = headCommitSha;
    }
    createPackageVersionList() {
        return __awaiter(this, void 0, void 0, function* () {
            const [previousLockFileContent, currentLockFileContent, previousRequirementFileContent, currentRequirementFileContent] = yield Promise.all([
                this.githubFileManager.getFileContentAt(this.packageManager.getLockFilename(), this.baseCommitSha),
                this.githubFileManager.getFileContentAt(this.packageManager.getLockFilename(), this.headCommitSha),
                this.githubFileManager.getFileContentAt(this.packageManager.getRequirementFilename(), this.baseCommitSha),
                this.githubFileManager.getFileContentAt(this.packageManager.getRequirementFilename(), this.headCommitSha),
            ]);
            const [previousLockFile, currentLockFile, previousRequirementFile, currentRequirementFile] = yield Promise.all([
                previousLockFileContent ? this.packageManager.loadLockFile(previousLockFileContent) : undefined,
                currentLockFileContent ? this.packageManager.loadLockFile(currentLockFileContent) : undefined,
                previousRequirementFileContent ? this.packageManager.loadRequirementFile(previousRequirementFileContent) : undefined,
                currentRequirementFileContent ? this.packageManager.loadRequirementFile(currentRequirementFileContent) : undefined,
            ]);
            const list = yield this.createPackageVersionsDiff(previousLockFile, currentLockFile, previousRequirementFile, currentRequirementFile);
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
        });
    }
    createPackageVersionsDiff(previousLockFile, currentLockFile, previousRequirementFile, currentRequirementFile) {
        return __awaiter(this, void 0, void 0, function* () {
            if (previousLockFile === undefined && currentLockFile === undefined) {
                throw new Error('At least a previous or current lock file has to be provided');
            }
            if (previousRequirementFile === undefined && currentRequirementFile === undefined) {
                throw new Error('At least a previous or current requirement file has to be provided');
            }
            const packageProcessedList = {};
            const promiseList = [];
            const [previousLockPackageList, currentLockPackageList] = yield Promise.all([
                previousLockFile ? this.packageManager.extractLockPackageList(previousLockFile) : {},
                currentLockFile ? this.packageManager.extractLockPackageList(currentLockFile) : {},
            ]);
            // Loop over current to find Added / Updated + all other packages
            Object.keys(currentLockPackageList).forEach(packageName => {
                packageProcessedList[packageName] = true;
                promiseList.push(this.createPackageDiff(packageName, previousLockPackageList ? previousLockPackageList[packageName] : undefined, currentLockPackageList[packageName], previousRequirementFile, currentRequirementFile));
            });
            // Loop over previous (skipping already processed packages) to find Removed packages
            Object.keys(previousLockPackageList).forEach(packageName => {
                if (!packageProcessedList[packageName]) {
                    packageProcessedList[packageName] = true;
                    promiseList.push(this.createPackageDiff(packageName, previousLockPackageList[packageName], currentLockPackageList ? currentLockPackageList[packageName] : undefined, previousRequirementFile, currentRequirementFile));
                }
            });
            return Promise.all(promiseList);
        });
    }
    createPackageDiff(packageName, previousLockPackage, currentLockPackage, previousRequirementFile, currentRequirementFile) {
        return __awaiter(this, void 0, void 0, function* () {
            if (previousLockPackage === undefined && currentLockPackage === undefined) {
                throw new Error('At least a previous or current lock package has to be provided');
            }
            if (previousRequirementFile === undefined && currentRequirementFile === undefined) {
                throw new Error('At least a previous or current requirement file has to be provided');
            }
            const [previousVersionData, currentVersionData] = yield Promise.all([
                previousLockPackage ? this.packageManager.extractPackageVersion(previousLockPackage) : undefined,
                currentLockPackage ? this.packageManager.extractPackageVersion(currentLockPackage) : undefined,
            ]);
            const updateType = this.getUpdateType(previousVersionData, currentVersionData);
            const isRemoval = currentLockPackage === undefined;
            const lockPackage = isRemoval ? previousLockPackage : currentLockPackage;
            const requirementFile = isRemoval ? previousRequirementFile : currentRequirementFile;
            const packageInfos = yield this.packageManager.getPackageInfos(lockPackage, requirementFile);
            const base = {
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
                return Object.assign(Object.assign({}, base), { update: {
                        type: updateType,
                        subType: this.getUpdateSubType(updateType, previousVersionData, currentVersionData),
                        direction: this.getUpdateDirection(updateType, previousVersionData, currentVersionData)
                    }, previous: previousVersionData, current: currentVersionData });
            }
            const defaultUpdateData = {
                type: updateType,
                subType: 'UNKNOWN',
                direction: 'UNKNOWN',
            };
            if ('ADDED' === defaultUpdateData.type) {
                if (!currentVersionData) {
                    throw new Error('ADDED require current package version');
                }
                // AddedPackageDiff
                return Object.assign(Object.assign({}, base), { update: defaultUpdateData, current: currentVersionData });
            }
            if ('REMOVED' === defaultUpdateData.type) {
                if (!previousVersionData) {
                    throw new Error('REMOVED require previous package version');
                }
                // RemovedPackageDiff
                return Object.assign(Object.assign({}, base), { update: defaultUpdateData, previous: previousVersionData });
            }
            if ('NONE' === defaultUpdateData.type) {
                if (!previousVersionData || !currentVersionData) {
                    throw new Error('NONE require previous and current package versions');
                }
                // NoUpdatePackageDiff
                return Object.assign(Object.assign({}, base), { update: defaultUpdateData, previous: previousVersionData, current: currentVersionData });
            }
            // UnknownUpdatePackageDiff
            return Object.assign(Object.assign({}, base), { update: defaultUpdateData, previous: previousVersionData, current: currentVersionData });
        });
    }
    getUpdateDirection(updateType, previous, current) {
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
        }
        else if (previous.minor !== current.minor) {
            before = previous.minor;
            after = current.minor;
        }
        else if (previous.patch !== current.patch) {
            before = previous.patch;
            after = current.patch;
        }
        else {
            return 'NONE';
        }
        if (!before || !after) {
            return 'UNKNOWN';
        }
        else {
            return parseInt(before) > parseInt(after)
                ? 'DOWN'
                : 'UP';
        }
    }
    getUpdateType(previous, current) {
        if (!previous && current) {
            return 'ADDED';
        }
        else if (previous && !current) {
            return 'REMOVED';
        }
        else if (!previous || !current) {
            return 'UNKNOWN';
        }
        else if (previous.full === current.full) {
            return 'NONE';
        }
        return 'UPDATED';
    }
    getUpdateSubType(updateType, previous, current) {
        if ('NONE' === updateType || 'UNKNOWN' === updateType) {
            return updateType;
        }
        else if (!previous || !current) {
            return 'UNKNOWN';
        }
        if ('TAG' !== previous.type || 'TAG' !== current.type) {
            return 'UNKNOWN'; // Not doable to know the sub type in that case as we can only parse tags !
        }
        else if (previous.major !== current.major) {
            return 'MAJOR';
        }
        else if (previous.minor !== current.minor) {
            return 'MINOR';
        }
        else if (previous.patch !== current.patch) {
            return 'PATCH';
        }
        return 'UNKNOWN';
    }
}
exports.default = PackageVersionDiffListCreator;
