declare module "Logger" {
    export type Logger = {
        info: (message: string) => void,
        error: (message: string | Error) => void,
        debug: (message: string) => void,
    };
}
