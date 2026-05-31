#!/usr/bin/env npx tsx

import assert from "node:assert";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { $ } from "zx";
import { getAvailablePort } from "./helpers/network.ts";

$.verbose = false;

console.log("=== Onboarding Command ===\n");

const synapseHome = await mkdtemp(join(tmpdir(), "synapse-onboard-home-"));
const port = await getAvailablePort();

try {
  console.log("Test 1: `synapse` runs blocking onboarding and prints pairing info");
  const onboard =
    await $`SYNAPSE_HOME=${synapseHome} SYNAPSE_LISTEN=127.0.0.1:${port} SYNAPSE_PAIRING_QR=0 npx synapse`.nothrow();

  assert.strictEqual(
    onboard.exitCode,
    0,
    `onboard should succeed:\nstdout:\n${onboard.stdout}\nstderr:\n${onboard.stderr}`,
  );
  assert(onboard.stdout.includes("Scan to pair"), "onboard output should include scan header");
  assert(
    onboard.stdout.includes("Pairing link"),
    "onboard output should include pairing link header",
  );
  assert(onboard.stdout.includes("#offer="), "onboard output should include pairing offer URL");
  assert(
    onboard.stdout.includes("CLI quick reference"),
    "onboard output should include CLI quick reference",
  );
  assert(onboard.stdout.includes("synapse --help"), "onboard output should include --help shortcut");
  assert(onboard.stdout.includes("synapse ls"), "onboard output should include ls shortcut");
  assert(
    onboard.stdout.includes('synapse run "your prompt"'),
    "onboard output should include run shortcut",
  );
  assert(onboard.stdout.includes("synapse status"), "onboard output should include status shortcut");
  assert(
    onboard.stdout.includes(join(synapseHome, "daemon.log")),
    "onboard output should include daemon log path",
  );

  const status =
    await $`SYNAPSE_HOME=${synapseHome} npx synapse daemon status --home ${synapseHome}`.nothrow();
  assert.strictEqual(status.exitCode, 0, `daemon status should succeed: ${status.stderr}`);
  assert(status.stdout.includes("running"), "daemon should be running when onboarding exits");
  console.log("✓ onboarding prints pairing info and waits for daemon readiness\n");

  console.log("Test 2: non-interactive onboarding persists voice disabled config");
  const configRaw = await readFile(join(synapseHome, "config.json"), "utf-8");
  const config = JSON.parse(configRaw) as {
    features?: {
      dictation?: { enabled?: boolean };
      voiceMode?: { enabled?: boolean };
    };
  };

  assert.strictEqual(
    config.features?.dictation?.enabled,
    false,
    "dictation.enabled should be false",
  );
  assert.strictEqual(
    config.features?.voiceMode?.enabled,
    false,
    "voiceMode.enabled should be false",
  );
  const daemonLog = await readFile(join(synapseHome, "daemon.log"), "utf-8");
  assert(
    !daemonLog.includes("Ensuring local speech models"),
    "daemon should not attempt local speech model setup when voice is disabled",
  );
  console.log("✓ non-interactive run persisted voice disabled choices\n");
} finally {
  await $`SYNAPSE_HOME=${synapseHome} npx synapse daemon stop --home ${synapseHome} --force`.nothrow();
  await rm(synapseHome, { recursive: true, force: true });
}

console.log("=== Onboarding tests passed ===");
