// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
const { execSync } = require("child_process");
execSync('echo "Yarn version: `yarn --version`"', { stdio: "inherit" });
const projectRootDir = `${__dirname}/../`;
execSync(`yarn install --prod  --non-interactive --no-progress`, { stdio: "inherit", cwd: projectRootDir });
execSync(`yarn list --depth=0 --prod --non-interactive --no-progress`, { stdio: "inherit", cwd: projectRootDir });
