import { existsSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import {
  SynapseConfigRawSchema,
  type SynapseConfigRaw,
  type SynapseConfigRevision,
  type ProjectConfigRpcError,
} from "@synapse/protocol/synapse-config-schema";
export {
  SynapseConfigRevisionSchema,
  ProjectConfigRpcErrorSchema,
  type SynapseConfigRevision,
  type ProjectConfigRpcError,
} from "@synapse/protocol/synapse-config-schema";

export const SYNAPSE_CONFIG_FILE_NAME = "synapse.json";

export type ReadSynapseConfigForEditResult =
  | { ok: true; config: SynapseConfigRaw | null; revision: SynapseConfigRevision | null }
  | { ok: false; error: ProjectConfigRpcError };

export type WriteSynapseConfigForEditResult =
  | { ok: true; config: SynapseConfigRaw; revision: SynapseConfigRevision }
  | { ok: false; error: ProjectConfigRpcError };

export interface WriteSynapseConfigForEditInput {
  repoRoot: string;
  config: SynapseConfigRaw;
  expectedRevision: SynapseConfigRevision | null;
}

export function resolveSynapseConfigPath(repoRoot: string): string {
  return join(repoRoot, SYNAPSE_CONFIG_FILE_NAME);
}

export function statSynapseConfigPath(repoRoot: string): SynapseConfigRevision | null {
  const configPath = resolveSynapseConfigPath(repoRoot);
  if (!existsSync(configPath)) {
    return null;
  }
  const stats = statSync(configPath);
  return {
    mtimeMs: stats.mtimeMs,
    size: stats.size,
  };
}

export function readSynapseConfigJson(repoRoot: string): unknown {
  const configPath = resolveSynapseConfigPath(repoRoot);
  if (!existsSync(configPath)) {
    return null;
  }
  return JSON.parse(readFileSync(configPath, "utf8"));
}

export function readSynapseConfigForEdit(repoRoot: string): ReadSynapseConfigForEditResult {
  try {
    const json = readSynapseConfigJson(repoRoot);
    if (json === null) {
      return { ok: true, config: null, revision: null };
    }
    return {
      ok: true,
      config: SynapseConfigRawSchema.parse(json),
      revision: statSynapseConfigPath(repoRoot),
    };
  } catch {
    return {
      ok: false,
      error: { code: "invalid_project_config" },
    };
  }
}

export function writeSynapseConfigForEdit(
  input: WriteSynapseConfigForEditInput,
): WriteSynapseConfigForEditResult {
  const parsed = SynapseConfigRawSchema.safeParse(input.config);
  if (!parsed.success) {
    return { ok: false, error: { code: "invalid_project_config" } };
  }

  const configPath = resolveSynapseConfigPath(input.repoRoot);
  const tempPath = join(
    input.repoRoot,
    `.${SYNAPSE_CONFIG_FILE_NAME}.${process.pid}.${randomUUID()}.tmp`,
  );

  try {
    writeFileSync(tempPath, `${JSON.stringify(parsed.data, null, 2)}\n`);
    const currentRevision = statSynapseConfigPath(input.repoRoot);
    if (!paseoConfigRevisionsEqual(currentRevision, input.expectedRevision)) {
      removeTempSynapseConfig(tempPath);
      return {
        ok: false,
        error: { code: "stale_project_config", currentRevision },
      };
    }

    renameSync(tempPath, configPath);
    const revision = statSynapseConfigPath(input.repoRoot);
    if (!revision) {
      return { ok: false, error: { code: "write_failed" } };
    }
    return { ok: true, config: parsed.data, revision };
  } catch {
    removeTempSynapseConfig(tempPath);
    return { ok: false, error: { code: "write_failed" } };
  }
}

function paseoConfigRevisionsEqual(
  left: SynapseConfigRevision | null,
  right: SynapseConfigRevision | null,
): boolean {
  if (left === null || right === null) {
    return left === right;
  }
  return left.mtimeMs === right.mtimeMs && left.size === right.size;
}

function removeTempSynapseConfig(tempPath: string): void {
  try {
    rmSync(tempPath, { force: true });
  } catch {
    // Best-effort cleanup only; callers need the original write outcome.
  }
}
