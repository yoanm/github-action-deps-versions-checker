import {PackageManagerType} from "PackageManager";
import {PackageVersionDiff} from "PackageVersionDiffListCreator";
import createBody from "../comment-body";
import {create as createRelease, getByTag as getReleaseByTag, update as updateRelease} from "../github-api/releases";
import logger from "../logger";
import {get as getTag} from "../github-api/tags";

export class GithubReleaseCommentManager {
    private readonly repositoryOwner: string;
    private readonly repositoryName: string;
    private readonly tagSha: string;
    private readonly packageManagerType: PackageManagerType;
    private readonly postResults: boolean;

    constructor(
        repositoryOwner: string,
        repositoryName: string,
        tagSha: string,
        packageManagerType: PackageManagerType,
        postResults: boolean,
    ) {
        this.repositoryOwner = repositoryOwner;
        this.repositoryName = repositoryName;
        this.tagSha = tagSha;
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

        const tag = await getTag(this.repositoryOwner, this.repositoryName, this.tagSha);
        if (!tag) {
            throw new Error('Unable to retrieve the current tag !');
        }
        const release = tag
            ? await getReleaseByTag(this.repositoryOwner, this.repositoryName, tag.tag)
            : undefined
        ;
        const commentBody = createBody(this.packageManagerType, commitSha, packagesDiff);

        if (!release) {
            // create the release
            await createRelease(this.repositoryOwner, this.repositoryName, tag.tag, commentBody);
        } else {
            if (release.body) {
                // Remove first line of each bodies as they contains commit information (and so can't never match)
                const previousBodyToCompare = release.body.substring(release.body.indexOf("\n") + 1);
                const newBodyToCompare = commentBody.substring(commentBody.indexOf("\n") + 1);
                if (previousBodyToCompare === newBodyToCompare) {
                    logger.info('Same comment as before, nothing to do. Bye !');

                    return;
                }
            }

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
