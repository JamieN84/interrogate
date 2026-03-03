/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function getRepoRoot() {
  try {
    return execSync("git rev-parse --show-toplevel", {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "ignore"]
    })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

function installPreCommitHook(repoRoot) {
  const hooksDir = path.join(repoRoot, ".git", "hooks");
  const preCommitPath = path.join(hooksDir, "pre-commit");
  const prePushPath = path.join(hooksDir, "pre-push");
  const preCommitScript = "#!/usr/bin/env sh\ncd app && npm run lint\n";
  const prePushScript = "#!/usr/bin/env sh\ncd app && npm test\n";

  fs.mkdirSync(hooksDir, { recursive: true });
  fs.writeFileSync(preCommitPath, preCommitScript, "utf8");
  fs.writeFileSync(prePushPath, prePushScript, "utf8");

  try {
    fs.chmodSync(preCommitPath, 0o755);
    fs.chmodSync(prePushPath, 0o755);
  } catch {
    // chmod may not be meaningful on some Windows setups.
  }
}

const repoRoot = getRepoRoot();

if (!repoRoot) {
  console.log("[hooks] Skipped: not inside a git repository.");
  process.exit(0);
}

installPreCommitHook(repoRoot);
console.log("[hooks] Installed pre-commit hook: cd app && npm run lint");
console.log("[hooks] Installed pre-push hook: cd app && npm test");
