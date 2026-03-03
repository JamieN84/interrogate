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
  const hookPath = path.join(hooksDir, "pre-commit");
  const hookScript = "#!/usr/bin/env sh\ncd app && npm run lint\n";

  fs.mkdirSync(hooksDir, { recursive: true });
  fs.writeFileSync(hookPath, hookScript, "utf8");

  try {
    fs.chmodSync(hookPath, 0o755);
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
