import {PayloadRepository} from "@actions/github/lib/interfaces";
import {Behavior} from "Behavior";
import {PackageManagerType} from "PackageManager";
import {GithubPRBehavior} from "./behavior/GithubPRBehavior";
import logger from "./logger";
import Composer from "./PackageManager/Composer";
import {GithubPushTagBehavior} from "./behavior/GithubPushTagBehavior";
import {Context} from "GithubAction";

export function behaviorFactory(
    context: Context,
    repositoryData: PayloadRepository,
    packageManagerType: PackageManagerType,
    postResults: boolean,
    force: boolean,
): Behavior {
  switch (context.eventName) {
    case 'pull_request':
      logger.debug(`Using PR behavior for PR #${context.payload.number}`);
      if (context.payload.pull_request === undefined) {
        throw new Error('Pull Request context is undefined !');
      }
      return new GithubPRBehavior(
          repositoryData.owner.login,
          repositoryData.name,
          context.payload.pull_request,
          packageManagerType,
          postResults,
          force,
      );
    case 'push':
      logger.debug(`Using push behavior for ref ${context.payload.ref}`);
      const tagMatch = context.payload.ref?.match(/^refs\/tags\/(?<tag>v?\d+(?:\.\d+)?(?:\.\d+)?)$/);
      console.log({tagMatch});
      if (!tagMatch || tagMatch.groups?.tag?.length == 0) {
        throw new Error('Only semver tags are managed !');
      }

      if (context.payload.created !== true) {
        throw new Error('Only newly created tags are managed');
      }

      if (context.sha?.length <= 0) {
        throw new Error('Tag must have a commit attached !');
      }

      return new GithubPushTagBehavior(
          repositoryData.owner.login,
          repositoryData.name,
          tagMatch.groups.tag,
          packageManagerType,
          postResults,
          force,
      );
  }

  throw new Error('Context type "'+context.eventName+'" is not supported !');
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

export function listPossiblePreviousSemverTagRef(tag: string): string[] {
  const list: string[] = [];
  const matches = tag.match(/(?<header>v?)(?<major>\d+)(?:\.(?<minor>\d+))?(?:\.(?<patch>\d+))?$/);

  if (matches && matches.groups?.major?.length) {
    const header = matches.groups?.header?.trim();
    const major = parseInt(matches.groups?.major);
    const minor = matches.groups?.minor?.length > 0 ? parseInt(matches.groups?.minor) : undefined;
    const patch = matches.groups?.patch?.length > 0 ? parseInt(matches.groups?.patch) : undefined;
    const appendMinor = (): void => {
      if (minor) {
        if ((minor - 1) >= 0) {
          list.push(`${header}${major}.${minor - 1}`);
        }
        if (minor > 0) {
          list.push(`${header}${major}`);
        }
      }
    };
    const appendMajor = (): void => {
      if ((major - 1) >= 0) {
        list.push(`${header}${major - 1}`);
      }
    };

    if (patch) {
      if ((patch - 1) >= 0) {
        list.push(`${header}${major}.${minor}.${patch - 1}`);
      }
      if (patch > 0) {
        list.push(`${header}${major}.${minor}`);
      }
      appendMinor();
      appendMajor();
    } else if (minor) {
      appendMinor();
      appendMajor();
    } else if ((major - 1) >= 0) {
      appendMajor();
    }
  }

  return list;
}
