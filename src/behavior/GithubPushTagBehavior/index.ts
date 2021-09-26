import {Behavior} from "Behavior";
import {Tag} from "GithubApi";
import {LockFile, LockPackage, PackageManagerType, RequirementFile} from "PackageManager";
import {PackageVersionDiff} from "PackageVersionDiffListCreator";
import {GithubFileManager} from "../../GithubFileManager";
import logger from "../../logger";
import PackageManager from "../../PackageManager";
import PackageVersionDiffListCreator from "../../PackageVersionDiffListCreator";
import {packageManagerFactory} from "../../utils";
import {GithubReleaseCommentManager} from "../../GithubReleaseCommentManager";
import {get as getTag, getPreviousSemver as getPreviousTag} from "../../github-api/tags";

export class GithubPushTagBehavior implements Behavior {
    private readonly tagSha: string;
    private readonly force: boolean;
    private readonly repositoryOwner: string;
    private readonly repositoryName: string;
    private readonly packageManager: PackageManager<RequirementFile, LockFile, LockPackage>;
    private readonly githubFileManager: GithubFileManager;
    private readonly githubCommentManager: GithubReleaseCommentManager;
    private previousTag: Tag | undefined | null = null;
    private currentTag: Tag | null = null;

    constructor(
        repositoryOwner: string,
        repositoryName: string,
        tagSha: string,
        packageManagerType: PackageManagerType,
        postResults: boolean,
        force: boolean,
    ) {
        this.tagSha = tagSha;
        this.force = force;
        this.repositoryOwner = repositoryOwner;
        this.repositoryName = repositoryName;
        this.packageManager = packageManagerFactory(packageManagerType);
        this.githubFileManager = new GithubFileManager(repositoryOwner, repositoryName);
        this.githubCommentManager = new GithubReleaseCommentManager(
            repositoryOwner,
            repositoryName,
            tagSha,
            packageManagerType,
            postResults
        );
    }

    public async execute(): Promise<PackageVersionDiff[]> {
        logger.debug('Creating diff ...');
        if (await this.shouldCreateDiff()) {
            logger.info(this.packageManager.getLockFilename() + ' updated ! Gathering data ...');
            const previousTag = await this.getPrevious();
            if (previousTag === undefined) {
                throw new Error('GithubPushTagBehavior requires a previous tag !');
            }
            const packageVersionDiffListCreator = new PackageVersionDiffListCreator(
                this.packageManager,
                this.githubFileManager,
                previousTag.object.sha,
                this.tagSha
            );

            logger.debug('Creating diff ...');
            const packagesDiff = await packageVersionDiffListCreator.createPackageVersionList();

            await this.manageDiffNotification(packagesDiff);

            return packagesDiff;
        }

        return [];
    }

    public async manageDiffNotification(packagesDiff: PackageVersionDiff[]): Promise<void> {
        if (packagesDiff.length) {
            return this.githubCommentManager.create(this.tagSha, packagesDiff);
        }

        return this.githubCommentManager.deletePreviousIfExisting();
    }

    protected  async shouldCreateDiff(): Promise<boolean> {
        logger.debug(`Checking if lock file has been updated ...`);
        const previousTag = await this.getPrevious();
        if (previousTag) {
            const lockFile = await this.githubFileManager.getFileBetween(
                this.packageManager.getLockFilename(),
                previousTag.object.sha,
                this.tagSha,
                ['modified', 'added', 'removed']
            );

            if (lockFile === undefined) {
                logger.info(`${this.packageManager.getLockFilename()} not updated on between ${previousTag.object.sha.substr(0, 7)} and ${this.tagSha.substr(0, 7)} ...`);
            }

            return lockFile !== undefined;
        }

        return false;
    }



    private async getCurrent(): Promise<Tag> {
        if (this.currentTag === null) {
            logger.debug('Loading current tag ...');
            const tag = await getTag(this.repositoryOwner, this.repositoryName, this.tagSha);
            if (tag === undefined) {
                throw Error('Unable to load current tag information !');
            }
            this.currentTag = tag;
        }

        return this.currentTag;
    }

    private async getPrevious(): Promise<Tag | undefined> {
        if (this.previousTag === null) {
            logger.debug('Loading previous tag ...');
            this.previousTag = undefined;
            const currentTag = await this.getCurrent();
            if (currentTag) {
                logger.debug(`Loading tag before ${currentTag.tag}...`);
                this.previousTag = await getPreviousTag(this.repositoryOwner, this.repositoryName, currentTag.tag);
            }
        }

        return this.previousTag;
    }
}
