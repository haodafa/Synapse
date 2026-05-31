import { join } from "node:path";

import { getSynapseWorktreesRoot, isPaseoOwnedWorktreeCwd } from "../../utils/worktree.js";
import {
  archiveSynapseWorktree,
  type ArchiveSynapseWorktreeDependencies,
} from "../synapse-worktree-archive-service.js";
import type {
  CreateSynapseWorktreeInput,
  CreateSynapseWorktreeResult,
} from "../synapse-worktree-service.js";
import { toWorktreeWireError, type WorktreeWireError } from "../worktree-errors.js";
import type { WorkspaceGitService, WorkspaceGitWorktreeInfo } from "../workspace-git-service.js";

export interface ListSynapseWorktreesCommandDependencies {
  workspaceGitService: Pick<WorkspaceGitService, "listWorktrees">;
}

export interface ListSynapseWorktreesCommandInput {
  cwd: string;
  reason?: string;
}

export async function listSynapseWorktreesCommand(
  dependencies: ListSynapseWorktreesCommandDependencies,
  input: ListSynapseWorktreesCommandInput,
): Promise<WorkspaceGitWorktreeInfo[]> {
  if (input.reason) {
    return dependencies.workspaceGitService.listWorktrees(input.cwd, { reason: input.reason });
  }
  return dependencies.workspaceGitService.listWorktrees(input.cwd);
}

type CreateSynapseWorktreeWorkflow<Result extends CreateSynapseWorktreeResult> = (
  input: CreateSynapseWorktreeInput,
) => Promise<Result>;

export interface CreateSynapseWorktreeCommandDependencies<
  Result extends CreateSynapseWorktreeResult = CreateSynapseWorktreeResult,
> {
  paseoHome?: string;
  createSynapseWorktreeWorkflow?: CreateSynapseWorktreeWorkflow<Result>;
}

export type CreateSynapseWorktreeCommandInput = Omit<
  CreateSynapseWorktreeInput,
  "paseoHome" | "runSetup"
> & {
  paseoHome?: string;
};

export type CreateSynapseWorktreeCommandResult<Result extends CreateSynapseWorktreeResult> =
  | {
      ok: true;
      createdWorktree: Result;
    }
  | {
      ok: false;
      error: WorktreeWireError;
      cause: unknown;
    };

export async function createSynapseWorktreeCommand<Result extends CreateSynapseWorktreeResult>(
  dependencies: CreateSynapseWorktreeCommandDependencies<Result>,
  input: CreateSynapseWorktreeCommandInput,
): Promise<CreateSynapseWorktreeCommandResult<Result>> {
  try {
    if (!dependencies.createSynapseWorktreeWorkflow) {
      throw new Error("Synapse worktree service is not configured");
    }

    const createdWorktree = await dependencies.createSynapseWorktreeWorkflow({
      ...input,
      runSetup: false,
      paseoHome: input.paseoHome ?? dependencies.paseoHome,
    });
    return { ok: true, createdWorktree };
  } catch (error) {
    return {
      ok: false,
      error: toWorktreeWireError(error),
      cause: error,
    };
  }
}

export interface ArchiveSynapseWorktreeCommandDependencies extends Omit<
  ArchiveSynapseWorktreeDependencies,
  "workspaceGitService"
> {
  workspaceGitService: Pick<WorkspaceGitService, "getSnapshot" | "listWorktrees">;
}

export interface ArchiveSynapseWorktreeCommandInput {
  requestId: string;
  repoRoot?: string | null;
  worktreePath?: string;
  worktreeSlug?: string;
  branchName?: string;
}

export type ArchiveSynapseWorktreeCommandResult =
  | {
      ok: true;
      removedAgents: string[];
    }
  | {
      ok: false;
      code: "NOT_ALLOWED";
      message: string;
      removedAgents: [];
    };

export async function archiveSynapseWorktreeCommand(
  dependencies: ArchiveSynapseWorktreeCommandDependencies,
  input: ArchiveSynapseWorktreeCommandInput,
): Promise<ArchiveSynapseWorktreeCommandResult> {
  const resolvedTarget = await resolveArchiveTarget(dependencies, input);
  const ownership = await isPaseoOwnedWorktreeCwd(resolvedTarget.targetPath, {
    paseoHome: dependencies.paseoHome,
  });

  if (!ownership.allowed) {
    return {
      ok: false,
      code: "NOT_ALLOWED",
      message: "Worktree is not a Synapse-owned worktree",
      removedAgents: [],
    };
  }

  const repoRoot = ownership.repoRoot ?? resolvedTarget.repoRoot ?? null;
  const removedAgents = await archiveSynapseWorktree(dependencies, {
    targetPath: resolvedTarget.targetPath,
    repoRoot,
    worktreesRoot: ownership.worktreeRoot,
    requestId: input.requestId,
  });

  return {
    ok: true,
    removedAgents,
  };
}

interface ResolvedArchiveTarget {
  targetPath: string;
  repoRoot: string | null;
}

async function resolveArchiveTarget(
  dependencies: ArchiveSynapseWorktreeCommandDependencies,
  input: ArchiveSynapseWorktreeCommandInput,
): Promise<ResolvedArchiveTarget> {
  const repoRoot = input.repoRoot ?? null;
  if (input.worktreePath) {
    return { targetPath: input.worktreePath, repoRoot };
  }

  if (input.worktreeSlug) {
    if (!repoRoot) {
      throw new Error("repoRoot is required when worktreeSlug is supplied");
    }
    return {
      targetPath: await resolveWorktreeSlugPath(dependencies, repoRoot, input.worktreeSlug),
      repoRoot,
    };
  }

  if (repoRoot && input.branchName) {
    const worktrees = await dependencies.workspaceGitService.listWorktrees(repoRoot);
    const match = worktrees.find((entry) => entry.branchName === input.branchName);
    if (!match) {
      throw new Error(`Synapse worktree not found for branch ${input.branchName}`);
    }
    return { targetPath: match.path, repoRoot };
  }

  throw new Error("worktreePath, worktreeSlug, or repoRoot+branchName is required");
}

async function resolveWorktreeSlugPath(
  dependencies: ArchiveSynapseWorktreeCommandDependencies,
  repoRoot: string,
  worktreeSlug: string,
): Promise<string> {
  const worktreesRoot = await getSynapseWorktreesRoot(repoRoot, dependencies.paseoHome);
  return join(worktreesRoot, worktreeSlug);
}
