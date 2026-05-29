import { z } from "zod";

export const BlockerType = z.enum(["depends_on", "blocks"]);
export type BlockerType = z.infer<typeof BlockerType>;

export const BlockerStatus = z.enum(["pending", "active", "resolved"]);
export type BlockerStatus = z.infer<typeof BlockerStatus>;

export const IssueDependency = z.object({
  id: z.string(),
  issueId: z.string(),
  dependsOnIssueId: z.string(),
  type: BlockerType,
  status: BlockerStatus,
  createdAt: z.string().datetime(),
  resolvedAt: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
});
export type IssueDependency = z.infer<typeof IssueDependency>;

export const CreateIssueDependencyRequest = z.object({
  issueId: z.string(),
  dependsOnIssueId: z.string(),
  type: BlockerType.default("depends_on"),
  metadata: z.record(z.any()).optional(),
});
export type CreateIssueDependencyRequest = z.infer<typeof CreateIssueDependencyRequest>;

export const UpdateIssueDependencyRequest = z.object({
  status: BlockerStatus.optional(),
  metadata: z.record(z.any()).optional(),
});
export type UpdateIssueDependencyRequest = z.infer<typeof UpdateIssueDependencyRequest>;

export const ListIssueDependenciesResponse = z.object({
  dependencies: z.array(IssueDependency),
  blockers: z.array(IssueDependency), // 此 issue 被其他 issue 阻塞的关系
  blocking: z.array(IssueDependency), // 此 issue 阻塞其他 issue 的关系
  total: z.number(),
});
export type ListIssueDependenciesResponse = z.infer<typeof ListIssueDependenciesResponse>;

/**
 * 检查 Issue 是否被阻塞
 */
export function isIssueBlocked(
  issueId: string,
  dependencies: IssueDependency[],
  checkStatuses: BlockerStatus[] = ["pending", "active"]
): boolean {
  return dependencies.some(
    dep => 
      dep.dependsOnIssueId === issueId && 
      checkStatuses.includes(dep.status)
  );
}

/**
 * 获取阻塞此 Issue 的所有 Issue ID
 */
export function getBlockingIssueIds(
  issueId: string,
  dependencies: IssueDependency[]
): string[] {
  return dependencies
    .filter(dep => dep.issueId === issueId && dep.status !== "resolved")
    .map(dep => dep.dependsOnIssueId);
}

/**
 * 获取被此 Issue 阻塞的所有 Issue ID
 */
export function getBlockedIssueIds(
  issueId: string,
  dependencies: IssueDependency[]
): string[] {
  return dependencies
    .filter(dep => dep.dependsOnIssueId === issueId && dep.status !== "resolved")
    .map(dep => dep.issueId);
}

/**
 * 检查是否会形成循环依赖
 */
export function wouldCreateCycle(
  issueId: string,
  dependsOnIssueId: string,
  existingDependencies: IssueDependency[]
): boolean {
  // 直接自引用
  if (issueId === dependsOnIssueId) {
    return true;
  }

  // BFS 检查循环
  const visited = new Set<string>();
  const queue: string[] = [dependsOnIssueId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (current === issueId) {
      return true;
    }
    
    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    // 查找依赖于当前 issue 的关系
    const blockers = existingDependencies.filter(
      dep => dep.issueId === current && dep.status !== "resolved"
    );
    
    for (const blocker of blockers) {
      queue.push(blocker.dependsOnIssueId);
    }
  }

  return false;
}
