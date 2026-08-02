const { execSync } = require("child_process");
execSync("pnpm --filter www build", { stdio: "inherit" });
