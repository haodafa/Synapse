import { mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";

import { resolveSynapseHome } from "./synapse-home.js";
import { PRIVATE_DIRECTORY_MODE } from "./private-files.js";

const MODE_MASK = 0o777;

function modeOf(filePath: string): number {
  return statSync(filePath).mode & MODE_MASK;
}

describe.skipIf(process.platform === "win32")("resolveSynapseHome permissions", () => {
  test("creates SYNAPSE_HOME with private permissions", () => {
    const parent = mkdtempSync(path.join(tmpdir(), "synapse-home-parent-"));
    const synapseHome = path.join(parent, "home");
    try {
      expect(resolveSynapseHome({ SYNAPSE_HOME: synapseHome })).toBe(synapseHome);
      expect(modeOf(synapseHome)).toBe(PRIVATE_DIRECTORY_MODE);
    } finally {
      rmSync(parent, { recursive: true, force: true });
    }
  });
});
