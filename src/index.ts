import * as core from "@actions/core";
import {getBooleanInput, getInput} from "@actions/core";
import {context} from "@actions/github";
import {PackageManagerType} from "PackageManager";
import logger from "./logger";
import {behaviorFactory} from "./utils";

async function run(): Promise<void> {
  try {
    const repositoryData = context.payload.repository;
    if (undefined === repositoryData) {
      throw new Error("Repository context is undefined !");
    }

    const packageManagerType = getInput("manager", {
      required: true,
      trimWhitespace: true,
    }) as PackageManagerType;
    const contextType = getInput("context", {
      required: true,
      trimWhitespace: true,
    });
    const postResults = getBooleanInput("post-results", {
      required: true,
      trimWhitespace: true,
    });
    const force = getBooleanInput("force", {
      required: true,
      trimWhitespace: true,
    });

    const behavior = behaviorFactory(
      contextType,
      repositoryData,
      context.payload,
      packageManagerType,
      postResults,
      force
    );

    const packagesDiff = await behavior.execute();
    core.setOutput("diff", packagesDiff);
  } catch (error) {
    logger.error(error instanceof Error ? error : `Unknown error ! ${error}`);
    core.setFailed("An error occurred ! See log above.");
  }
}

run();
