import {PayloadRepository, WebhookPayload} from "@actions/github/lib/interfaces";
import {Behavior} from "Behavior";
import {PackageManagerType} from "PackageManager";
import {GithubPRBehavior} from "./behavior/GithubPRBehavior";
import logger from "./logger";
import Composer from "./PackageManager/Composer";
import {GithubPushTagBehavior} from "./behavior/GithubPushTagBehavior";

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
      logger.debug(`Using PR behavior for PR #${webHookPayload.number}`);
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
    case 'push':
      logger.debug(`Using push behavior for ref ${webHookPayload.ref}`);
      const tagMatch = webHookPayload.ref?.match(/^refs\/tags\/(v?\d+(?:\.\d+)?(?:\.\d+)?)$/);
      if (!tagMatch || tagMatch[0]?.length <= 0) {
        throw new Error('Only semver tags are managed !');
      }

      if (webHookPayload.created !== true) {
        throw new Error('Only newly created tags are managed');
      }

      if (webHookPayload.sha?.length <= 0) {
        throw new Error('Tag must have a commit attached !');
      }

      return new GithubPushTagBehavior(
          repositoryData.owner.login,
          repositoryData.name,
          webHookPayload.sha,
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

export const escapeRegex = (regex: string): string => regex.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

export function listPossiblePreviousSemver(release: string): string[];
export function listPossiblePreviousSemver(release: string, asRegex: false): string[];
export function listPossiblePreviousSemver(release: string, asRegex: true): RegExp[];

export function listPossiblePreviousSemver(tag: string, asRegex: true | false = false): (string|RegExp)[] {

  const matches = tag.match(/(v?)(\d+)(?:\.(\d+))?(?:\.(\d+))?$/);

  if (matches && matches[1]?.length) {
    const header = matches[0].trim();
    const major = parseInt(matches[1]);
    const minor = matches[2]?.length > 0 ? parseInt(matches[2]) :  undefined;
    const patch = matches[3]?.length > 0 ? parseInt(matches[3]) :  undefined;
    const tmpList: string[][] = [
      [], // vX.Y.Z versions
      [], // vX.Y versions
      [], // vX versions
    ];

    if (patch && (patch - 1) >= 0) {
      tmpList[0].push(`${header}${major}.${minor}.${patch - 1}`);
    }

    if (minor && (minor - 1) >= 0) {
      tmpList[0].push(`${header}${major}.${minor - 1}.0`);
      tmpList[1].push(`${header}${major}.${minor - 1}`);
    }

    if ((major - 1) >= 0) {
      tmpList[0].push(`${header}${major - 1}.0.0`);
      tmpList[1].push(`${header}${major - 1}.0`);
      tmpList[2].push(`${header}${major - 1}`);
    }

    if (asRegex) {
      return tmpList.flat().map(item => new RegExp(`/^${escapeRegex(item)}/`));
    }

    return tmpList.flat();
  }

  return [];
}
