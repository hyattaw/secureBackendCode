const { execSync } = require("child_process");
execSync("pnpm --filter games/web build", { stdio: "inherit" });
