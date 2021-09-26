import {Release} from "GithubApi";
import api from "./index";
import {RequestError} from "@octokit/request-error";

export async function  create(ownerName: string, repoName: string, tag: string, body: string): Promise<Release> {

}


export async function  update(ownerName: string, repoName: string, releaseId: number, body: string): Promise<Release> {

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
