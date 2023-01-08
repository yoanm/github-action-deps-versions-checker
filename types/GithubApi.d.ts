declare module "GithubApi" {
    import {components} from "@octokit/openapi-types";
    import {RestEndpointMethodTypes} from "@octokit/plugin-rest-endpoint-methods";

    export type Content = RestEndpointMethodTypes["repos"]["getContent"]['response']['data'];
    export type FileContent = Content & components["schemas"]["content-file"];

    export type File = RestEndpointMethodTypes['pulls']['listFiles']['response']['data'][number];

    export type Comment = RestEndpointMethodTypes['issues']['listComments']['response']['data'][number];
}
