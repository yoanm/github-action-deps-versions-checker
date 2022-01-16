import {WebhookPayload} from "@actions/github/lib/interfaces";
import {Behavior} from "Behavior";
import {File} from "GithubApi";
import {LockFile, LockPackage, PackageManagerType, RequirementFile} from "PackageManager";
import {PackageVersionDiff} from "PackageVersionDiffListCreator";
import {GithubFileManager} from "../../GithubFileManager";
import {GithubPRCommentManager} from "../../GithubPRCommentManager";
import logger from "../../logger";
import PackageManager from "../../PackageManager";
import PackageVersionDiffListCreator from "../../PackageVersionDiffListCreator";
import {packageManagerFactory} from "../../utils";

export class GithubPRBehavior implements Behavior {
    private readonly prId: number;
    private readonly baseCommitSha: string;
    private readonly headCommitSha: string;
    private readonly force: boolean;
    private readonly packageManager: PackageManager<RequirementFile, LockFile, LockPackage>;
    private readonly githubFileManager: GithubFileManager;
    private readonly githubCommentManager: GithubPRCommentManager;

    constructor(
        repositoryOwner: string,
        repositoryName: string,
        payload: NonNullable<WebhookPayload['pull_request']>,
        packageManagerType: PackageManagerType,
        postResults: boolean,
        force: boolean,
    ) {
        this.prId = payload.number;
        this.baseCommitSha = payload.base.sha;
        this.headCommitSha = payload.head.sha;
        this.force = force;
        this.packageManager = packageManagerFactory(packageManagerType);
        this.githubFileManager = new GithubFileManager(repositoryOwner, repositoryName);
        this.githubCommentManager = new GithubPRCommentManager(
            repositoryOwner,
            repositoryName,
            this.prId,
            packageManagerType,
            postResults
        );
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


        logger.info(this.packageManager.getLockFilename() + ' not updated on that PR !');
        await this.githubCommentManager.deletePreviousIfExisting();

        return [];
    }

    public async manageDiffNotification(packagesDiff: PackageVersionDiff[]): Promise<void> {
        if (packagesDiff.length) {
            return this.githubCommentManager.createNewIfNeeded(this.headCommitSha, packagesDiff);
        }

        return this.githubCommentManager.deletePreviousIfExisting();
    }

    protected  async shouldCreateDiff(): Promise<boolean> {
        // /!\ Checking only between comment commit and latest commit may produce bad result
        // see https://github.com/yoanm/github-action-deps-versions-checker/issues/63
        // ==> Always check between base branch and latest commit instead
        logger.debug('Checking if lock file has been updated on PR ...');
        const lockFile = await this.githubFileManager.getPRFile(
            this.packageManager.getLockFilename(),
            this.prId,
            ['modified', 'added', 'removed']
        );

        return lockFile !== undefined;
    }
}
