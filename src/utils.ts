import {PayloadRepository, WebhookPayload} from "@actions/github/lib/interfaces";
import {Behavior} from "Behavior";
import {PackageManagerType} from "PackageManager";
import {GithubPRBehavior} from "./behavior/GithubPRBehavior";
import logger from "./logger";
import Composer from "./PackageManager/Composer";

export function behaviorFactory(
    contextType: string,
    repositoryData: PayloadRepository,
    webHookPayload: WebhookPayload,
    packageManagerType: PackageManagerType,
    postResults: boolean,
    force: boolean,
): Behavior {
  switch (contextType) {
    case 'PR':
      logger.debug('Using PR behavior!');
      return new GithubPRBehavior(
          repositoryData.owner.login,
          repositoryData.name,
          webHookPayload.pull_request,
          packageManagerType,
          postResults,
          force,
      );
  }

  throw new Error('Context type "'+contextType+'" is not supported !');
}

export function packageManagerFactory(packageManagerType: PackageManagerType): Composer {
  switch (packageManagerType) {
    case 'composer':
      logger.debug('Using Composer package manager!');
      return new Composer();
  }

  throw new Error(`Package manager type "${packageManagerType}" is not supported !`);
}

