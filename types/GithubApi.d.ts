declare module "GithubApi" {
    import {components} from "@octokit/openapi-types";
    import {Endpoints} from "@octokit/types";

    export type Content = Endpoints['GET /repos/{owner}/{repo}/contents/{path}']['response']['data'];
    export type FileContent = Content & components["schemas"]["content-file"];

    export type File = Endpoints['GET /repos/{owner}/{repo}/pulls/{pull_number}/files']['response']['data'][number];

    export type Comment = Endpoints['GET /repos/{owner}/{repo}/issues/{issue_number}/comments']['response']['data'][number];
    export type Release = Endpoints['GET /repos/{owner}/{repo}/releases']['response']['data'][number];
    export type Tag = Endpoints['GET /repos/{owner}/{repo}/git/tags/{tag_sha}']['response']['data'];
}
