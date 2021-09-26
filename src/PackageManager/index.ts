import {
    LockFile as BaseLockFile,
    LockPackage as BaseLockPackage,
    PackageInfos,
    PackageList,
    RequirementFile as BaseRequirementFile,
} from "PackageManager";
import {PackageVersion} from "PackageVersionDiffListCreator";


export default abstract class PackageManager<
    RequirementFile extends BaseRequirementFile,
    LockFile extends BaseLockFile,
    LockPackage extends BaseLockPackage,
> {
    private readonly requirementFilename: string;
    private readonly lockFilename: string;

    protected constructor(
        requirementFilename: string,
        lockFilename: string,
    ) {
        this.requirementFilename = requirementFilename;
        this.lockFilename = lockFilename;
    }

    public getRequirementFilename(): string {
        return this.requirementFilename;
    }

    public getLockFilename(): string {
        return this.lockFilename;
    }

    public abstract loadLockFile(content: string): Promise<LockFile>;
    public abstract loadRequirementFile(content: string): Promise<RequirementFile>;
    public abstract extractLockPackageList(lockFile: LockFile): Promise<PackageList<LockPackage>>;
    public abstract extractPackageVersion(lockPackage: LockPackage): Promise<PackageVersion>;
    public abstract getPackageInfos(lockPackage: LockPackage, file: RequirementFile): Promise<PackageInfos>;
}
