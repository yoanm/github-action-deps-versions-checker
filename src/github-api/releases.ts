import {Release} from "GithubApi";
import api from "./index";
import {RequestError} from "@octokit/request-error";

export async function  create(ownerName: string, repoName: string, tag: string, body: string): Promise<Release> {
    const {data} = await api.rest.repos.createRelease({
        owner: ownerName,
        repo: repoName,
        body,
        tag_name: tag,
    });

    return data;
}


export async function  update(ownerName: string, repoName: string, releaseId: number, body: string): Promise<Release> {
    const {data} = await api.rest.repos.updateRelease({
        owner: ownerName,
        repo: repoName,
        release_id: releaseId,
        body,
    });

    return data;
}

export async function  getByTag(ownerName: string, repoName: string, tag: string): Promise<Release | undefined> {
    try {
        const { data } =  await api.rest.repos.getReleaseByTag({
            owner: ownerName,
            repo: repoName,
            tag
        });

        return data;
    } catch (e) {
        if (e instanceof RequestError && e.status === 404) {
            return undefined;
        }

        throw e;
    }
}
