// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
const { execSync } = require("child_process");
execSync('echo "Yarn version: `yarn --version`"', { stdio: "inherit" });
execSync(`yarn --cwd "${__dirname}/../" install --prod  --non-interactive --no-progress`, { stdio: "inherit" });
execSync(`yarn --cwd "${__dirname}/../" list --depth=0 --prod --non-interactive --no-progress`, { stdio: "inherit" });
