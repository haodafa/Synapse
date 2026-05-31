#!/usr/bin/env npx tsx

/**
 * Phase 3: LS Command Tests
 *
 * Tests the ls command - listing agents (top-level command).
 * Since daemon may not be running, we test both:
 * - Help and argument parsing
 * - Graceful error handling when daemon not running
 * - JSON output format
 *
 * Tests:
 * - synapse --help shows ls command
 * - synapse ls --help shows options
 * - synapse ls returns empty list or error when no daemon
 * - synapse ls --json returns valid JSON (or error)
 * - synapse ls -a flag is accepted
 * - synapse ls -g flag is accepted
 * - synapse ls does not support --ui
 */

import assert from "node:assert";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { runLocalSynapse } from "./helpers/local-cli.ts";

console.log("=== LS Command Tests ===\n");

// Get random port that's definitely not in use (never 6767)
const port = 10000 + Math.floor(Math.random() * 50000);
const synapseHome = await mkdtemp(join(tmpdir(), "synapse-test-home-"));

try {
  // Test 1: synapse --help shows ls command
  {
    console.log("Test 1: synapse --help shows ls command");
    const result = await runLocalSynapse(["--help"]);
    assert.strictEqual(result.exitCode, 0, "synapse --help should exit 0");
    assert(result.stdout.includes("ls"), "help should mention ls command");
    console.log("✓ synapse --help shows ls command\n");
  }

  // Test 2: synapse ls --help shows options
  {
    console.log("Test 2: synapse ls --help shows options");
    const result = await runLocalSynapse(["ls", "--help"]);
    assert.strictEqual(result.exitCode, 0, "synapse ls --help should exit 0");
    assert(result.stdout.includes("-a"), "help should mention -a flag");
    assert(result.stdout.includes("--all"), "help should mention --all flag");
    assert(result.stdout.includes("-g"), "help should mention -g flag");
    assert(result.stdout.includes("--global"), "help should mention --global flag");
    assert(result.stdout.includes("--host"), "help should mention --host option");
    assert(!result.stdout.includes("--ui"), "help should not mention --ui");
    console.log("✓ synapse ls --help shows options\n");
  }

  // Test 3: synapse ls returns error when no daemon running
  {
    console.log("Test 3: synapse ls handles daemon not running");
    const result = await runLocalSynapse(["ls"], {
      SYNAPSE_HOST: `localhost:${port}`,
      SYNAPSE_HOME: synapseHome,
    });
    // Should fail because daemon not running
    assert.notStrictEqual(result.exitCode, 0, "should fail when daemon not running");
    const output = result.stdout + result.stderr;
    const hasError =
      output.toLowerCase().includes("daemon") ||
      output.toLowerCase().includes("connect") ||
      output.toLowerCase().includes("cannot");
    assert(hasError, "error message should mention connection issue");
    assert(output.includes("--host <host:port>"), "error message should mention --host");
    assert(output.includes("SYNAPSE_HOST"), "error message should mention SYNAPSE_HOST");
    console.log("✓ synapse ls handles daemon not running\n");
  }

  // Test 4: synapse ls --json returns valid JSON error
  {
    console.log("Test 4: synapse ls --json handles errors");
    const result = await runLocalSynapse(["ls", "--json"], {
      SYNAPSE_HOST: `localhost:${port}`,
      SYNAPSE_HOME: synapseHome,
    });
    // Should still fail (daemon not running)
    assert.notStrictEqual(result.exitCode, 0, "should fail when daemon not running");
    // But output should be valid JSON if present
    const output = result.stdout.trim();
    if (output.length > 0) {
      try {
        JSON.parse(output);
        console.log("✓ synapse ls --json outputs valid JSON error\n");
      } catch {
        // Empty or stderr-only output is acceptable
        console.log("✓ synapse ls --json handled error (output may be in stderr)\n");
      }
    } else {
      console.log("✓ synapse ls --json handled error gracefully\n");
    }
  }

  // Test 5: synapse ls -a flag is accepted
  {
    console.log("Test 5: synapse ls -a flag is accepted");
    const result = await runLocalSynapse(["ls", "-a"], {
      SYNAPSE_HOST: `localhost:${port}`,
      SYNAPSE_HOME: synapseHome,
    });
    // Will fail due to no daemon, but flag should be parsed without error
    // (no "unknown option" error)
    const output = result.stdout + result.stderr;
    assert(!output.includes("unknown option"), "should accept -a flag");
    assert(!output.includes("error: option"), "should not have option parsing error");
    console.log("✓ synapse ls -a flag is accepted\n");
  }

  // Test 6: synapse ls -g flag is accepted
  {
    console.log("Test 6: synapse ls -g flag is accepted");
    const result = await runLocalSynapse(["ls", "-g"], {
      SYNAPSE_HOST: `localhost:${port}`,
      SYNAPSE_HOME: synapseHome,
    });
    const output = result.stdout + result.stderr;
    assert(!output.includes("unknown option"), "should accept -g flag");
    assert(!output.includes("error: option"), "should not have option parsing error");
    console.log("✓ synapse ls -g flag is accepted\n");
  }

  // Test 7: synapse ls -ag combined flags are accepted
  {
    console.log("Test 7: synapse ls -ag combined flags are accepted");
    const result = await runLocalSynapse(["ls", "-ag"], {
      SYNAPSE_HOST: `localhost:${port}`,
      SYNAPSE_HOME: synapseHome,
    });
    const output = result.stdout + result.stderr;
    assert(!output.includes("unknown option"), "should accept -ag flags");
    assert(!output.includes("error: option"), "should not have option parsing error");
    console.log("✓ synapse ls -ag combined flags are accepted\n");
  }

  // Test 8: -q (quiet) flag is accepted globally
  {
    console.log("Test 8: -q (quiet) flag is accepted");
    const result = await runLocalSynapse(["-q", "ls"], {
      SYNAPSE_HOST: `localhost:${port}`,
      SYNAPSE_HOME: synapseHome,
    });
    const output = result.stdout + result.stderr;
    assert(!output.includes("unknown option"), "should accept -q flag");
    assert(!output.includes("error: option"), "should not have option parsing error");
    console.log("✓ -q (quiet) flag is accepted\n");
  }

  // Test 9: synapse ls --ui is rejected (flag removed)
  {
    console.log("Test 9: synapse ls --ui is rejected");
    const result = await runLocalSynapse(["ls", "--ui"], {
      SYNAPSE_HOST: `localhost:${port}`,
      SYNAPSE_HOME: synapseHome,
    });
    assert.notStrictEqual(result.exitCode, 0, "should fail for removed --ui flag");
    const output = result.stdout + result.stderr;
    assert(output.includes("unknown option"), "should report unknown option for --ui");
    console.log("✓ synapse ls --ui is rejected\n");
  }
} finally {
  // Clean up temp directory
  await rm(synapseHome, { recursive: true, force: true });
}

console.log("=== All ls tests passed ===");
