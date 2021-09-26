import {debug, error, info} from "@actions/core";
import {Logger} from "Logger";

const logger: Logger = {
    info,
    error,
    debug,
};

export default logger;
