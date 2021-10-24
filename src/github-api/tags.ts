import {Tag} from "GithubApi";
import api from "./index";
import {RequestError} from "@octokit/request-error";

export async function  get(ownerName: string, repoName: string, tagSha: string): Promise<Tag | undefined> {
    try {
        const { data } =  await api.rest.git.getTag({owner: ownerName, repo: repoName, tag_sha: tagSha});

        return data;
    } catch (e) {
        if (e instanceof RequestError && e.status === 404) {
            return undefined;
        }

        throw e;
    }
}
