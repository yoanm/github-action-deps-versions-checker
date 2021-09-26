import {RequestError} from "@octokit/request-error";
import {Content, File, FileContent} from "GithubApi";
import api from "./index";


export async function get(ownerName: string, repoName: string, path: string, commitHash: string): Promise<Content | undefined> {
    try {
        const {data} = await api.rest.repos.getContent({
            owner: ownerName,
            repo: repoName,
            path: path,
            ref: commitHash,
        });

        return data;
    } catch (e) {
        if ((e as RequestError).status !== undefined && (e as RequestError).status === 404) {
            return undefined;
        }

        throw e;
    }
}

export async function getFile(ownerName: string, repoName: string, path: string, commitHash: string): Promise<FileContent | undefined> {
    const res = await get(ownerName, repoName, path, commitHash);
    if (res === undefined) {
        return undefined;
    }
    const file = res as FileContent;

    const contentType = file.type || null;
    if (contentType !== 'file') {
        throw new Error(`Expected type="file" but received "${contentType}" !`);
    }

    return file;
}

export async function getFileBetween(
    ownerName: string,
    repoName: string,
    baseSha: string,
    headSha: string,
    filename: string
): Promise<File | undefined> {
    const pageIterator = api.paginate.iterator(
        api.rest.repos.compareCommitsWithBasehead,
        {
            owner: ownerName,
            repo: repoName,
            basehead: `${baseSha}...${headSha}`,
            per_page: 100,
        }
    );

    for await (const response of pageIterator) {
        const file = response.data.files?.find(item => item.filename === filename) || undefined;

        if (file !== undefined) {
            return file;
        }
    }

    return undefined;
}
