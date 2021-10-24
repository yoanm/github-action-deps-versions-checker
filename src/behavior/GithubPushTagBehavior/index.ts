import {Behavior} from "Behavior";
import {LockFile, LockPackage, PackageManagerType, RequirementFile} from "PackageManager";
import {PackageVersionDiff} from "PackageVersionDiffListCreator";
import {GithubFileManager} from "../../GithubFileManager";
import logger from "../../logger";
import PackageManager from "../../PackageManager";
import PackageVersionDiffListCreator from "../../PackageVersionDiffListCreator";
import {packageManagerFactory} from "../../utils";
import {GithubReleaseCommentManager} from "../../GithubReleaseCommentManager";
import {getPreviousSemverTagRef, getRef} from "../../github-api/refs";
import {getTag} from "../../github-api/tags";

export class GithubPushTagBehavior implements Behavior {
    private readonly tagName: string;
    private readonly force: boolean;
    private readonly repositoryOwner: string;
    private readonly repositoryName: string;
    private readonly packageManager: PackageManager<RequirementFile, LockFile, LockPackage>;
    private readonly githubFileManager: GithubFileManager;
    private readonly githubCommentManager: GithubReleaseCommentManager;
    private previousTagRefCommitSha: string | undefined | null = null;
    private currentTagCommitSha: string | null = null;

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
            const [currentTagCommitSha, previousTagRefCommitSha] = await Promise.all([
                this.getCurrentTagCommitSha(),
                this.getPreviousTagCommitSha()
            ]);
            if (previousTagRefCommitSha === undefined) {
                throw new Error('GithubPushTagBehavior requires a previous tag !');
            }
            const packageVersionDiffListCreator = new PackageVersionDiffListCreator(
                this.packageManager,
                this.githubFileManager,
                previousTagRefCommitSha,
                currentTagCommitSha
            );

            logger.debug(`Creating diff between ${previousTagRefCommitSha.substr(0, 7)} and ${currentTagCommitSha.substr(0, 7)} ...`);
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
        const [currentTagCommitSha, previousTagRefCommitSha] = await Promise.all([
            this.getCurrentTagCommitSha(),
            this.getPreviousTagCommitSha()
        ]);
        if (previousTagRefCommitSha) {
            const lockFile = await this.githubFileManager.getFileBetween(
                this.packageManager.getLockFilename(),
                previousTagRefCommitSha,
                currentTagCommitSha,
                ['modified', 'added', 'removed']
            );

            if (lockFile === undefined) {
                logger.info(`${this.packageManager.getLockFilename()} not updated on between ${previousTagRefCommitSha.substr(0, 7)} and ${currentTagCommitSha.substr(0, 7)} ...`);
            }

            return lockFile !== undefined;
        }

        return false;
    }



    private async getCurrentTagCommitSha(): Promise<string> {
        if (this.currentTagCommitSha === null) {
            logger.debug(`Loading current ref for "tags/${this.tagName}" ...`);
            const tagRef = await getRef(this.repositoryOwner, this.repositoryName, `tags/${this.tagName}`);
            logger.debug(`Current ref: "${JSON.stringify(tagRef)}"`);
            if (tagRef === undefined) {
                throw Error('Unable to load current tag information !');
            }
            if (tagRef.object.type === 'tag') {
                const tag = await getTag(this.repositoryOwner, this.repositoryName, tagRef.object.sha);
                if (tag === undefined) {
                    throw new Error(`Unable to retrieve current tag commit sha for "${tagRef.ref}/${tagRef.object.type}/${tagRef.object.sha}"`);
                }
                this.currentTagCommitSha = tag.sha;
            } else if (tagRef.object.type === 'commit') {
                this.currentTagCommitSha = tagRef.object.sha;
            } else {
                throw new Error(`Unable to manage current tag ref of type "${tagRef.object.type}"`);
            }
        }

        return this.currentTagCommitSha;
    }

    private async getPreviousTagCommitSha(): Promise<string | undefined> {
        if (this.previousTagRefCommitSha === null) {
            logger.debug(`Loading previous ref for tag before ${this.tagName} ...`);
            const tagRef = await getPreviousSemverTagRef(this.repositoryOwner, this.repositoryName, this.tagName);
            logger.debug(`previous ref: "${JSON.stringify(tagRef)}"`);
            if (tagRef === undefined) {
                this.previousTagRefCommitSha = undefined;
            } else {
                if (tagRef.object.type === 'tag') {
                    const tag = await getTag(this.repositoryOwner, this.repositoryName, tagRef.object.sha);
                    if (tag === undefined) {
                        throw new Error(`Unable to retrieve previous tag commit sha for "${tagRef.ref}/${tagRef.object.type}/${tagRef.object.sha}"`);
                    }
                    this.previousTagRefCommitSha = tag.sha;
                } else if (tagRef.object.type === 'commit') {
                    this.previousTagRefCommitSha = tagRef.object.sha;
                } else {
                    throw new Error(`Unable to manage previous tag ref of type "${tagRef.object.type}"`);
                }
            }
        }

        return this.previousTagRefCommitSha;
    }
}
