#!/usr/bin/env npx tsx

import assert from "node:assert";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  getDaemonHost,
  normalizeDaemonHost,
  resolveDaemonPassword,
  resolveDaemonTarget,
  resolveDefaultDaemonHosts,
} from "../src/utils/client.js";
import { resolveCliVersion } from "../src/version.js";

console.log("=== CLI IPC Target Helpers ===\n");

{
  console.log("Test 1: unix hosts resolve to ws+unix URLs");
  const target = resolveDaemonTarget("unix:///tmp/synapse.sock");
  assert.deepStrictEqual(target, {
    type: "ipc",
    url: "ws+unix:///tmp/synapse.sock:/ws",
    socketPath: "/tmp/synapse.sock",
  });
  console.log("✓ unix hosts resolve to ws+unix URLs\n");
}

{
  console.log("Test 2: pipe hosts preserve the Node socketPath transport form");
  const target = resolveDaemonTarget("pipe://\\\\.\\pipe\\synapse-managed-test");
  assert.deepStrictEqual(target, {
    type: "ipc",
    url: "ws://localhost/ws",
    socketPath: "\\\\.\\pipe\\synapse-managed-test",
  });
  console.log("✓ pipe hosts preserve Node socketPath transport form\n");
}

{
  console.log("Test 3: tcp URI host targets honor ssl=true");
  const target = resolveDaemonTarget("tcp://example.com:6767?ssl=true&password=query-secret");
  assert.deepStrictEqual(target, {
    type: "tcp",
    url: "wss://example.com:6767/ws",
  });
  console.log("✓ tcp URI host targets honor ssl=true\n");
}

{
  console.log("Test 4: tcp URI hosts normalize into canonical direct TCP targets");
  assert.strictEqual(
    normalizeDaemonHost("tcp://Example.com:6767?ssl=true&password=query-secret"),
    "tcp://Example.com:6767?ssl=true&password=query-secret",
  );
  console.log("✓ tcp URI hosts normalize into canonical direct TCP targets\n");
}

{
  console.log("Test 5: local unix socket paths normalize into IPC daemon targets");
  assert.strictEqual(normalizeDaemonHost("/tmp/synapse.sock"), "unix:///tmp/synapse.sock");
  console.log("✓ local unix socket paths normalize into IPC daemon targets\n");
}

{
  console.log("Test 5b: Windows absolute paths are NOT treated as unix sockets");
  assert.strictEqual(normalizeDaemonHost("C:\\Users\\foo\\.synapse\\synapse.sock"), null);
  assert.strictEqual(normalizeDaemonHost("D:\\project\\socket"), null);
  console.log("✓ Windows absolute paths are not treated as unix sockets\n");
}

{
  console.log("Test 6: default host resolution tries local IPC first, then localhost fallback");
  const synapseHome = mkdtempSync(path.join(os.tmpdir(), "synapse-client-targets-"));
  try {
    mkdirSync(synapseHome, { recursive: true });
    writeFileSync(
      path.join(synapseHome, "synapse.pid"),
      JSON.stringify({ pid: process.pid, listen: "/tmp/synapse-from-pid.sock" }),
    );
    assert.deepStrictEqual(resolveDefaultDaemonHosts({ SYNAPSE_HOME: synapseHome }), [
      "unix:///tmp/synapse-from-pid.sock",
      "localhost:6767",
    ]);
    const previousHome = process.env.SYNAPSE_HOME;
    const previousHost = process.env.SYNAPSE_HOST;
    process.env.SYNAPSE_HOME = synapseHome;
    delete process.env.SYNAPSE_HOST;
    assert.strictEqual(getDaemonHost(), "unix:///tmp/synapse-from-pid.sock");
    if (previousHome === undefined) delete process.env.SYNAPSE_HOME;
    else process.env.SYNAPSE_HOME = previousHome;
    if (previousHost === undefined) delete process.env.SYNAPSE_HOST;
    else process.env.SYNAPSE_HOST = previousHost;
  } finally {
    rmSync(synapseHome, { recursive: true, force: true });
  }
  console.log("✓ default host resolution tries local IPC first, then localhost fallback\n");
}

{
  console.log("Test 7: configured TCP host is preserved before the localhost fallback");
  const synapseHome = mkdtempSync(path.join(os.tmpdir(), "synapse-client-targets-tcp-"));
  try {
    assert.deepStrictEqual(
      resolveDefaultDaemonHosts({
        SYNAPSE_HOME: synapseHome,
        SYNAPSE_LISTEN: "127.0.0.1:7777",
      }),
      ["127.0.0.1:7777", "localhost:6767"],
    );
  } finally {
    rmSync(synapseHome, { recursive: true, force: true });
  }
  console.log("✓ configured TCP host is preserved before the localhost fallback\n");
}

{
  console.log("Test 8: CLI app version resolves for daemon hello compatibility");
  assert.match(resolveCliVersion(), /^\d+\.\d+\.\d+/);
  console.log("✓ CLI app version resolves for daemon hello compatibility\n");
}

{
  console.log("Test 9: local IPC still takes priority over configured TCP hosts");
  const synapseHome = mkdtempSync(path.join(os.tmpdir(), "synapse-client-targets-order-"));
  try {
    mkdirSync(synapseHome, { recursive: true });
    writeFileSync(
      path.join(synapseHome, "synapse.pid"),
      JSON.stringify({ pid: process.pid, listen: "/tmp/synapse-priority.sock" }),
    );
    assert.deepStrictEqual(
      resolveDefaultDaemonHosts({
        SYNAPSE_HOME: synapseHome,
        SYNAPSE_LISTEN: "127.0.0.1:7777",
      }),
      ["unix:///tmp/synapse-priority.sock", "127.0.0.1:7777", "localhost:6767"],
    );
  } finally {
    rmSync(synapseHome, { recursive: true, force: true });
  }
  console.log("✓ local IPC still takes priority over configured TCP hosts\n");
}

{
  console.log("Test 10: daemon password resolution prefers TCP URI query, falls back to env");
  const previousEnv = process.env.SYNAPSE_PASSWORD;
  try {
    delete process.env.SYNAPSE_PASSWORD;
    assert.strictEqual(
      resolveDaemonPassword("tcp://example.com:6767?ssl=true&password=query-secret"),
      "query-secret",
    );
    assert.strictEqual(resolveDaemonPassword("tcp://missing.example:6767"), undefined);
    assert.strictEqual(resolveDaemonPassword("example.com:6767"), undefined);

    process.env.SYNAPSE_PASSWORD = "env-secret";
    assert.strictEqual(
      resolveDaemonPassword("tcp://example.com:6767?ssl=true&password=query-secret"),
      "query-secret",
      "URI password should take precedence over env var",
    );
    assert.strictEqual(
      resolveDaemonPassword("tcp://missing.example:6767"),
      "env-secret",
      "TCP host without query password should fall back to env var",
    );
    assert.strictEqual(
      resolveDaemonPassword("example.com:6767"),
      "env-secret",
      "Bare host should pick up env var password",
    );
    assert.strictEqual(resolveDaemonPassword("localhost:6767"), "env-secret");

    process.env.SYNAPSE_PASSWORD = "";
    assert.strictEqual(
      resolveDaemonPassword("localhost:6767"),
      undefined,
      "Empty env var should be treated as unset",
    );
  } finally {
    if (previousEnv === undefined) {
      delete process.env.SYNAPSE_PASSWORD;
    } else {
      process.env.SYNAPSE_PASSWORD = previousEnv;
    }
  }
  console.log("✓ daemon password resolution prefers TCP URI query, falls back to env\n");
}

console.log("=== All CLI IPC target tests passed ===");
