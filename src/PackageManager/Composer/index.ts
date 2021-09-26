import {ComposerFile, ComposerLockFile, ComposerLockPackage, MetaComposerLockPackage} from "Composer";
import {PackageInfos, PackageList} from "PackageManager";
import {PackageVersion} from "PackageVersionDiffListCreator";
import PackageManager from "../index";

export default class Composer extends PackageManager<
    ComposerFile,
    ComposerLockFile,
    MetaComposerLockPackage
>{
    constructor() {
        super('composer.json', 'composer.lock');
    }

    public async loadLockFile(content: string): Promise<ComposerLockFile> {
        return JSON.parse(content) as ComposerLockFile;
    }

    public async loadRequirementFile(content: string): Promise<ComposerFile> {
        return JSON.parse(content) as ComposerFile;
    }

    public async extractLockPackageList(lockFile: ComposerLockFile): Promise<PackageList<MetaComposerLockPackage>> {
        const reduceFn = (isDevRequirement: boolean) => (
            acc: PackageList<MetaComposerLockPackage>,
            item: ComposerLockPackage
        ): PackageList<MetaComposerLockPackage> => {
            acc[item.name] = {
                ...item,
                isDevRequirement,
                sourceLink: item.support?.source || undefined,
            };

            return acc;
        };

        return (lockFile.packages || []).reduce(
            reduceFn(false),
            (lockFile['packages-dev'] || []).reduce(
                reduceFn(true),
                {} as PackageList<MetaComposerLockPackage>
            )
        );
    }

    public async extractPackageVersion(lockPackage: MetaComposerLockPackage): Promise<PackageVersion> {
        if (/^v?\d+\.\d+\.\d+/.test(lockPackage.version)) {
            const match = this.sanitizeTag(lockPackage.version)
                .match(/^(\d+)\.(\d+)\.(\d+)(.*)?/) as RegExpMatchArray;
            // TagPackageVersion
            return {
                full: lockPackage.version,
                isDev: false,
                type: 'TAG',
                major: match[1] && match[1].length ? match[1] : null,
                minor: match[2] && match[2].length ? match[2] : null,
                patch: match[3] && match[3].length ? match[3] : null,
                extra: match[4] && match[4].length ? match[4] : null,
            };
        }

        // CommitPackageVersion
        return {
            // Append the commit ref (only the first 7 chars (=short ref))
            full: lockPackage.version+'#'+lockPackage.dist.reference.substr(0, 7),
            isDev: true, // Commit version are always dev version (else it's a tag)
            type: 'COMMIT',
            commit: lockPackage.dist.reference
        };
    }

    public async getPackageInfos(lockPackage: MetaComposerLockPackage, requirementFile: ComposerFile): Promise<PackageInfos> {
        const rootRequirements = requirementFile[lockPackage.isDevRequirement ? 'require-dev' : 'require'] || {};
        const isRootRequirement = undefined !== rootRequirements[lockPackage.name];

        return Promise.resolve({
            isRootRequirement: isRootRequirement,
            isRootDevRequirement: isRootRequirement && lockPackage.isDevRequirement,
            sourceLink: lockPackage.sourceLink
        });
    }

    protected sanitizeTag(version: string): string {
        return 'v' === version.charAt(0)
            ? version.substr(1) // Remove 'v' prefix if it exists
            : version
        ;
    }
}
