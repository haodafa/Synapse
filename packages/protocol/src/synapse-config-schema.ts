import { z } from "zod";

export function normalizeLifecycleCommands(commands: unknown): string[] {
  if (typeof commands === "string") {
    return commands.trim().length > 0 ? [commands] : [];
  }
  if (!Array.isArray(commands)) {
    return [];
  }
  return commands.filter((command): command is string => {
    return typeof command === "string" && command.trim().length > 0;
  });
}

export const SynapseLifecycleCommandRawSchema = z.union([z.string(), z.array(z.string())]);

export const SynapseScriptEntryRawSchema = z
  .object({
    type: z.unknown().optional(),
    command: z.unknown().optional(),
    port: z.unknown().optional(),
  })
  .passthrough();

export const SynapseWorktreeConfigRawSchema = z
  .object({
    setup: SynapseLifecycleCommandRawSchema.optional(),
    teardown: SynapseLifecycleCommandRawSchema.optional(),
    terminals: z.unknown().optional(),
  })
  .passthrough();

export const SynapseMetadataGenerationEntrySchema = z
  .object({
    instructions: z.string().optional(),
  })
  .passthrough()
  .catch({});

export const SynapseMetadataGenerationSchema = z
  .object({
    agentTitle: SynapseMetadataGenerationEntrySchema.optional(),
    branchName: SynapseMetadataGenerationEntrySchema.optional(),
    commitMessage: SynapseMetadataGenerationEntrySchema.optional(),
    pullRequest: SynapseMetadataGenerationEntrySchema.optional(),
  })
  .passthrough()
  .catch({});

export const SynapseConfigRawSchema = z
  .object({
    worktree: SynapseWorktreeConfigRawSchema.optional(),
    scripts: z.record(z.string(), SynapseScriptEntryRawSchema).optional(),
    metadataGeneration: SynapseMetadataGenerationSchema.optional(),
  })
  .passthrough();

export const WorktreeConfigSchema = SynapseWorktreeConfigRawSchema.extend({
  setup: z.unknown().transform(normalizeLifecycleCommands),
  teardown: z.unknown().transform(normalizeLifecycleCommands),
})
  .passthrough()
  .catch({ setup: [], teardown: [] });

export const ScriptEntrySchema = SynapseScriptEntryRawSchema.catch({});

export const SynapseConfigSchema = SynapseConfigRawSchema.extend({
  worktree: WorktreeConfigSchema.optional(),
  scripts: z.record(z.string(), ScriptEntrySchema).optional().catch({}),
  metadataGeneration: SynapseMetadataGenerationSchema.optional(),
})
  .passthrough()
  .catch({});

export const SynapseConfigRevisionSchema = z.object({
  mtimeMs: z.number(),
  size: z.number(),
});

export const ProjectConfigRpcErrorSchema = z.discriminatedUnion("code", [
  z.object({ code: z.literal("project_not_found") }),
  z.object({ code: z.literal("invalid_project_config") }),
  z.object({
    code: z.literal("stale_project_config"),
    currentRevision: SynapseConfigRevisionSchema.nullable(),
  }),
  z.object({ code: z.literal("write_failed") }),
]);

export type SynapseScriptEntryRaw = z.infer<typeof SynapseScriptEntryRawSchema>;
export type SynapseMetadataGenerationEntry = z.infer<typeof SynapseMetadataGenerationEntrySchema>;
export type SynapseMetadataGeneration = z.infer<typeof SynapseMetadataGenerationSchema>;
export type SynapseConfigRaw = z.infer<typeof SynapseConfigRawSchema>;
export type SynapseConfig = z.infer<typeof SynapseConfigSchema>;
export type SynapseConfigRevision = z.infer<typeof SynapseConfigRevisionSchema>;
export type ProjectConfigRpcError = z.infer<typeof ProjectConfigRpcErrorSchema>;
