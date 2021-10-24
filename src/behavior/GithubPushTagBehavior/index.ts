import {Behavior} from "Behavior";
import {Ref} from "GithubApi";
import {LockFile, LockPackage, PackageManagerType, RequirementFile} from "PackageManager";
import {PackageVersionDiff} from "PackageVersionDiffListCreator";
import {GithubFileManager} from "../../GithubFileManager";
import logger from "../../logger";
import PackageManager from "../../PackageManager";
import PackageVersionDiffListCreator from "../../PackageVersionDiffListCreator";
import {packageManagerFactory} from "../../utils";
import {GithubReleaseCommentManager} from "../../GithubReleaseCommentManager";
import {getPreviousSemverTagRef, getRef} from "../../github-api/refs";

export class GithubPushTagBehavior implements Behavior {
    private readonly tagName: string;
    private readonly force: boolean;
    private readonly repositoryOwner: string;
    private readonly repositoryName: string;
    private readonly packageManager: PackageManager<RequirementFile, LockFile, LockPackage>;
    private readonly githubFileManager: GithubFileManager;
    private readonly githubCommentManager: GithubReleaseCommentManager;
    private previousTagRef: Ref | undefined | null = null;
    private currentTagRef: Ref | null = null;

    constructor(
        repositoryOwner: string,
        repositoryName: string,
        tagName: string,
        packageManagerType: PackageManagerType,
        postResults: boolean,
        force: boolean,
    ) {
        this.tagName = tagName;
        this.force = force;
        this.repositoryOwner = repositoryOwner;
        this.repositoryName = repositoryName;
        this.packageManager = packageManagerFactory(packageManagerType);
        this.githubFileManager = new GithubFileManager(repositoryOwner, repositoryName);
        this.githubCommentManager = new GithubReleaseCommentManager(
            repositoryOwner,
            repositoryName,
            tagName,
            packageManagerType,
            postResults
        );
    }

    public async execute(): Promise<PackageVersionDiff[]> {
        logger.debug('Creating diff ...');
        if (await this.shouldCreateDiff()) {
            logger.info(this.packageManager.getLockFilename() + ' updated ! Gathering data ...');
            const [currentTagRef, previousTagRef] = await Promise.all([
                this.getCurrentTagRef(),
                this.getPreviousTagRef()
            ]);
            if (previousTagRef === undefined) {
                throw new Error('GithubPushTagBehavior requires a previous tag !');
            }
            const packageVersionDiffListCreator = new PackageVersionDiffListCreator(
                this.packageManager,
                this.githubFileManager,
                previousTagRef.object.sha,
                currentTagRef.object.sha
            );

            logger.debug(`Creating diff between ${previousTagRef.object.sha.substr(0, 7)} and ${currentTagRef.object.sha.substr(0, 7)} ...`);
            const packagesDiff = await packageVersionDiffListCreator.createPackageVersionList();

            await this.manageDiffNotification(packagesDiff);

            return packagesDiff;
        }

        return [];
    }

    public async manageDiffNotification(packagesDiff: PackageVersionDiff[]): Promise<void> {
        if (packagesDiff.length) {
            return this.githubCommentManager.create(this.tagName, packagesDiff);
        }

        return this.githubCommentManager.deletePreviousIfExisting();
    }

    protected  async shouldCreateDiff(): Promise<boolean> {
        logger.debug(`Checking if lock file has been updated ...`);
        const [currentTagRef, previousTagRef] = await Promise.all([
            this.getCurrentTagRef(),
            this.getPreviousTagRef()
        ]);
        if (previousTagRef) {
            const lockFile = await this.githubFileManager.getFileBetween(
                this.packageManager.getLockFilename(),
                previousTagRef.object.sha,
                currentTagRef.object.sha,
                ['modified', 'added', 'removed']
            );

            if (lockFile === undefined) {
                logger.info(`${this.packageManager.getLockFilename()} not updated on between ${previousTagRef.object.sha.substr(0, 7)} and ${currentTagRef.object.sha.substr(0, 7)} ...`);
            }

            return lockFile !== undefined;
        }

        return false;
    }



    private async getCurrentTagRef(): Promise<Ref> {
        if (this.currentTagRef === null) {
            logger.debug(`Loading current ref for "tags/${this.tagName}" ...`);
            const tagRef = await getRef(this.repositoryOwner, this.repositoryName, `tags/${this.tagName}`);
            logger.debug(`Ref: "${JSON.stringify(tagRef)}"`);
            if (tagRef === undefined) {
                throw Error('Unable to load current tag information !');
            }
            this.currentTagRef = tagRef;
        }

        return this.currentTagRef;
    }

    private async getPreviousTagRef(): Promise<Ref | undefined> {
        if (this.previousTagRef === null) {
            logger.debug(`Loading previous ref for tag before ${this.tagName} ...`);
            this.previousTagRef = await getPreviousSemverTagRef(this.repositoryOwner, this.repositoryName, this.tagName);
            logger.debug(`Ref: "${JSON.stringify(this.previousTagRef)}"`);
        }

        return this.previousTagRef;
    }
}
