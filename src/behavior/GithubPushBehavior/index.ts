import {Behavior} from "Behavior";
import {File} from "GithubApi";
import {LockFile, LockPackage, PackageManagerType, RequirementFile} from "PackageManager";
import {PackageVersionDiff} from "PackageVersionDiffListCreator";
import {GithubFileManager} from "../../GithubFileManager";
import logger from "../../logger";
import PackageManager from "../../PackageManager";
import PackageVersionDiffListCreator from "../../PackageVersionDiffListCreator";
import {packageManagerFactory} from "../../utils";

export class GithubPushBehavior implements Behavior {
    private readonly baseCommitSha: string;
    private readonly headCommitSha: string;
    private readonly force: boolean;
    private readonly packageManager: PackageManager<RequirementFile, LockFile, LockPackage>;
    private readonly githubFileManager: GithubFileManager;
    //private readonly githubCommentManager: GithubPRCommentManager;

    constructor(
        repositoryOwner: string,
        repositoryName: string,
        baseCommitSha: string,
        headCommitSha: string,
        packageManagerType: PackageManagerType,
        postResults: boolean,
        force: boolean,
    ) {
        this.baseCommitSha = baseCommitSha;
        this.headCommitSha = headCommitSha;
        this.force = force;
        this.packageManager = packageManagerFactory(packageManagerType);
        this.githubFileManager = new GithubFileManager(repositoryOwner, repositoryName);
        /*this.githubCommentManager = new GithubPRCommentManager(
            repositoryOwner,
            repositoryName,
            this.prId,
            packageManagerType,
            postResults
        );*/
    }

    public async execute(): Promise<PackageVersionDiff[]> {
        logger.debug('Creating diff ...');
        if (await this.shouldCreateDiff()) {
            logger.info(this.packageManager.getLockFilename() + ' updated ! Gathering data ...');
            const packageVersionDiffListCreator = new PackageVersionDiffListCreator(
                this.packageManager,
                this.githubFileManager,
                this.baseCommitSha,
                this.headCommitSha
            );

            logger.debug('Creating diff ...');
            const packagesDiff = await packageVersionDiffListCreator.createPackageVersionList();

            await this.manageDiffNotification(packagesDiff);

            return packagesDiff;
        }

        return [];
    }

    public async manageDiffNotification(packagesDiff: PackageVersionDiff[]): Promise<void> {
        return;
        /*
        if (packagesDiff.length) {
            return this.githubCommentManager.createNewIfNeeded(this.headCommitSha, packagesDiff);
        }

        return this.githubCommentManager.deletePreviousIfExisting();
         */
    }

    protected  async shouldCreateDiff(): Promise<boolean> {
        logger.debug(`Checking if lock file has been updated between ${this.baseCommitSha.substr(0,7)} and ${this.headCommitSha.substr(0,7)} ...`);
        const lockFile: File | undefined = await this.githubFileManager.getFileBetween(
            this.packageManager.getLockFilename(),
            this.baseCommitSha,
            this.headCommitSha,
            ['modified', 'added', 'removed']
        );

        if (lockFile === undefined) {
            logger.info(this.packageManager.getLockFilename() + ' not updated on that PR !');
        }

        return lockFile !== undefined;
    }
}
