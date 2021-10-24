import api from "./index";
import {RequestError} from "@octokit/request-error";
import {Ref} from "GithubApi";
import {listPossiblePreviousSemverTagRef} from "../utils";
import logger from "../logger";

export async function  getRef(ownerName: string, repoName: string, ref: string): Promise<Ref | undefined> {
    try {
        const { data } =  await api.rest.git.getRef({owner: ownerName, repo: repoName, ref});

        return data;
    } catch (e) {
        if (e instanceof RequestError && e.status === 404) {
            return undefined;
        }

        throw e;
    }
}

export async function  getMatchingRefs(ownerName: string, repoName: string, ref: string): Promise<Ref[]> {
    const { data } =  await api.rest.git.listMatchingRefs({owner: ownerName, repo: repoName, ref});

    return data;
}

export async function getPreviousSemverTagRef(ownerName: string, repoName: string, tag: string): Promise<Ref | undefined> {
    const previousTagList = listPossiblePreviousSemverTagRef(tag);

    let previousTagRef: Ref | undefined;
    for (const attempt of previousTagList) {
        logger.debug(`Try loading ref for tag before "${tag}" - try "${attempt}"`);
        // TODO - implements pagination (for repo with a lot of tags)
        const previousTagRefs = await getMatchingRefs(ownerName, repoName, `tags/${attempt}`);
        if (previousTagRefs && previousTagRefs.length) {
            // Start from bottom
            for (const ref of previousTagRefs.reverse()) {
                if (ref.ref !== `refs/tags/${tag}`) {
                    previousTagRef = ref;
                    break;
                }
            }
            if (previousTagRef) {
                break;
            }
        }
    }

    return previousTagRef;
}
