declare module "GithubAction" {
    import {context} from "@actions/github";

    export type Context = typeof context;
    export type WebhookPayload = Context['payload'];
    export type PullRequestPayload = NonNullable<WebhookPayload['pull_request']>;
}
