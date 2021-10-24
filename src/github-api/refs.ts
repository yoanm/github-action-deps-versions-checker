import api from "./index";
import {RequestError} from "@octokit/request-error";
import {Ref} from "GithubApi";
import {listPossiblePreviousSemver} from "../utils";
import logger from "../logger";

export async function  getRef(ownerName: string, repoName: string, ref: string): Promise<Ref | undefined> {
    try {
        //
        const { data } =  await api.rest.git.getRef({
            owner: ownerName,
            repo: repoName,
            ref
        });

        return data;
    } catch (e) {
        if (e instanceof RequestError && e.status === 404) {
            return undefined;
        }

        throw e;
    }
}

export async function getPreviousSemverTagRef(ownerName: string, repoName: string, tag: string): Promise<Ref | undefined> {
    const previousTagList = listPossiblePreviousSemver(tag);

    let previousTagRef: Ref | undefined;
    for (const attempt of previousTagList) {
        logger.debug(`Try loading ref for tag before "${tag}" - try $"{attempt}"`);
        previousTagRef = await getRef(ownerName, repoName, `tags/${attempt}`);
        if (previousTagRef) {
            break;
        }
    }

    return previousTagRef;
}
