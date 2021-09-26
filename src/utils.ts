import {PayloadRepository, WebhookPayload} from "@actions/github/lib/interfaces";
import {Behavior} from "Behavior";
import {PackageManagerType} from "PackageManager";
import {GithubPRBehavior} from "./behavior/GithubPRBehavior";
import logger from "./logger";
import Composer from "./PackageManager/Composer";

export function behaviorFactory(
    event_name: string,
    repositoryData: PayloadRepository,
    webHookPayload: WebhookPayload,
    packageManagerType: PackageManagerType,
    postResults: boolean,
    force: boolean,
): Behavior {
  switch (event_name) {
    case 'pull_request':
      logger.debug('Using PR behavior!');
      if (webHookPayload.pull_request === undefined) {
        throw new Error('Pull Request context is undefined !');
      }
      return new GithubPRBehavior(
          repositoryData.owner.login,
          repositoryData.name,
          webHookPayload.pull_request,
          packageManagerType,
          postResults,
          force,
      );
  }

  throw new Error('Context type "'+event_name+'" is not supported !');
}

export function packageManagerFactory(packageManagerType: PackageManagerType): Composer {
  switch (packageManagerType) {
    case 'composer':
      logger.debug('Using Composer package manager!');
      return new Composer();
  }

  throw new Error(`Package manager type "${packageManagerType}" is not supported !`);
}

