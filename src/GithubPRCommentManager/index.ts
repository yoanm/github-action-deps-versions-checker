import {Comment} from "GithubApi";
import {PackageManagerType} from "PackageManager";
import {PackageVersionDiff} from "PackageVersionDiffListCreator";
import createBody, {COMMENT_COMMIT_REGEXP, COMMENT_HEADER, commentPkgTypeFactory} from "../comment-body";
import {createComment, deleteComment, getLastCommentMatching} from "../github-api/pulls";
import logger from "../logger";

export class GithubPRCommentManager {
    private readonly repositoryOwner: string;
    private readonly repositoryName: string;
    private readonly prId: number;
    private readonly packageManagerType: PackageManagerType;
    private readonly postResults: boolean;
    private previousComment: Comment & { commitRef: string } | undefined | null = null;

    constructor(
        repositoryOwner: string,
        repositoryName: string,
        prId: number,
        packageManagerType: PackageManagerType,
        postResults: boolean,
    ) {
        this.repositoryOwner = repositoryOwner;
        this.repositoryName = repositoryName;
        this.prId = prId;
        this.packageManagerType = packageManagerType;
        this.postResults = postResults;
    }

    public async getPrevious(): Promise<Comment & { commitRef: string } | undefined> {
        if (this.previousComment === null) {
            this.previousComment = undefined;
            if (this.postResults) {
                logger.debug('Loading previous comment ...');
                const comment = await getLastCommentMatching(
                    this.repositoryOwner,
                    this.repositoryName,
                    this.prId,
                    new RegExp(
                        '^'
                        + COMMENT_HEADER.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
                        + commentPkgTypeFactory(this.packageManagerType)
                    ),
                );

                const match = comment?.body?.match(new RegExp(COMMENT_COMMIT_REGEXP));

                if (comment && match) {
                    this.previousComment = {
                        ...comment,
                        commitRef: match[1],
                    };
                }
            }
        }

        return this.previousComment;
    }

    public async createNewIfNeeded(
        commitSha: string,
        packagesDiff: PackageVersionDiff[],
    ): Promise<void> {
        if (!this.postResults) {
            return;
        }

        const commentBody = createBody(this.packageManagerType, commitSha, packagesDiff);
        if (commentBody === undefined) {
            logger.debug('Nothing to post ! Removing previous if it exists !');
            return this.deletePreviousIfExisting();
        }

        const previousComment = await this.getPrevious();
        if (previousComment) {
            // Remove first line of each bodies as they contains commit information (and so can't never match)
            const previousBodyToCompare = previousComment.body?.substring(previousComment.body?.indexOf("\n") + 1);
            const newBodyToCompare = commentBody.substring(commentBody.indexOf("\n") + 1);
            if (previousBodyToCompare === newBodyToCompare) {
                // Avoid deleting comment and then create the exact same one
                logger.info('Same comment as before, nothing to do. Bye !');

                return;
            }
        }

        await this.deletePreviousIfExisting();

        logger.debug('Posting comment ...');
        return createComment(this.repositoryOwner, this.repositoryName, this.prId, commentBody);
    }

    public async deletePreviousIfExisting(): Promise<void> {
        const previousComment = await this.getPrevious();
        if (previousComment) {
            logger.info('Removing previous comment ...');
            return deleteComment(this.repositoryOwner, this.repositoryName, previousComment.id);
        }
    }
}
