import {Comment, File} from "GithubApi";
import api from "./index";

export async function getFile(ownerName: string, repoName: string, prId: number, filename: string): Promise<File | undefined> {
    const pageIterator = api.paginate.iterator(
        api.rest.pulls.listFiles,
        {
            owner: ownerName,
            repo: repoName,
            pull_number: prId,
            per_page: 100,
        }
    );

    for await (const { data } of pageIterator) {
        for (const file of data) {
            if (file.filename === filename) {
                return file;
            }
        }
    }

    return undefined;
}

export async function getLastCommentMatching(ownerName: string, repoName: string, pullNumber: number, bodyMatch: RegExp): Promise<Comment | undefined> {
    const pageIterator = api.paginate.iterator(
        api.rest.issues.listComments,
        {
            owner: ownerName,
            repo: repoName,
            issue_number: pullNumber,
        }
    );

    for await (const response of pageIterator) {
        const comment = response.data.find(item => item.body && bodyMatch.test(item.body));

        if (comment !== undefined) {
            return comment;
        }
    }

    return undefined;
}

export async function deleteComment(ownerName: string, repoName: string, commentId: number): Promise<void> {
    await api.rest.issues.deleteComment({
        owner: ownerName,
        repo: repoName,
        comment_id: commentId,
    });
}

export async function createComment(ownerName: string, repoName: string, pullNumber: number, body: string): Promise<void> {
    await api.rest.issues.createComment({
        owner: ownerName,
        repo: repoName,
        issue_number: pullNumber,
        body,
    });
}
