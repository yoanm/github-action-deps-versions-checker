import {PackageManagerType} from "PackageManager";
import {PackageVersionDiff} from "PackageVersionDiffListCreator";
import createBody from "../comment-body";
import {create as createRelease, getByTag as getReleaseByTag, update as updateRelease} from "../github-api/releases";
import logger from "../logger";
import {get as getTag} from "../github-api/tags";

export class GithubReleaseCommentManager {
    private readonly repositoryOwner: string;
    private readonly repositoryName: string;
    private readonly tagName: string;
    private readonly packageManagerType: PackageManagerType;
    private readonly postResults: boolean;

    constructor(
        repositoryOwner: string,
        repositoryName: string,
        tagName: string,
        packageManagerType: PackageManagerType,
        postResults: boolean,
    ) {
        this.repositoryOwner = repositoryOwner;
        this.repositoryName = repositoryName;
        this.tagName = tagName;
        this.packageManagerType = packageManagerType;
        this.postResults = postResults;
    }

    public async create(
        commitSha: string,
        packagesDiff: PackageVersionDiff[],
    ): Promise<void> {
        if (!this.postResults) {
            return;
        }

        const release = await getReleaseByTag(this.repositoryOwner, this.repositoryName, this.tagName);
        const commentBody = createBody(this.packageManagerType, commitSha, packagesDiff);

        if (!release) {
            // create the release
            await createRelease(this.repositoryOwner, this.repositoryName, this.tagName, commentBody);
        } else {
            // Append infos to existing release
            logger.debug('Posting comment ...');
            await updateRelease(
                this.repositoryOwner,
                this.repositoryName,
                release.id,
                `${release.body?.length ? `${release.body}\n\n` : ''}${commentBody}`
            );

            return;
        }
    }

    public async deletePreviousIfExisting(): Promise<void> {
        // Nothing to do in that case
        return;
    }
}
