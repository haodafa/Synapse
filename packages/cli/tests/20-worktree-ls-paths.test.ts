#!/usr/bin/env npx tsx

import assert from "node:assert";
import { homedir } from "node:os";
import { join } from "node:path";
import { resolveSynapseHomePath, resolveSynapseWorktreesDir } from "../src/commands/worktree/ls.js";

console.log("=== Worktree LS Path Helper Tests ===\n");

const originalSynapseHome = process.env.SYNAPSE_HOME;

try {
  {
    console.log("Test 1: resolves explicit SYNAPSE_HOME when set");
    process.env.SYNAPSE_HOME = "/tmp/synapse-explicit-home";

    assert.strictEqual(resolveSynapseHomePath(), "/tmp/synapse-explicit-home");
    assert.strictEqual(resolveSynapseWorktreesDir(), "/tmp/synapse-explicit-home/worktrees");
    console.log("\u2713 explicit SYNAPSE_HOME is respected\n");
  }

  {
    console.log("Test 2: falls back to homedir/.synapse when SYNAPSE_HOME is unset");
    delete process.env.SYNAPSE_HOME;

    assert.strictEqual(resolveSynapseHomePath(), join(homedir(), ".synapse"));
    assert.strictEqual(resolveSynapseWorktreesDir(), join(homedir(), ".synapse", "worktrees"));
    console.log("\u2713 fallback home path is derived from os.homedir()\n");
  }
} finally {
  if (originalSynapseHome === undefined) {
    delete process.env.SYNAPSE_HOME;
  } else {
    process.env.SYNAPSE_HOME = originalSynapseHome;
  }
}

console.log("=== All worktree ls path helper tests passed ===");
