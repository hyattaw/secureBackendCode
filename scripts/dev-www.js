const { execSync } = require("child_process");
execSync("pnpm --filter www dev", { stdio: "inherit" });
