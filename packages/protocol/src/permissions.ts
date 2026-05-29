import { z } from "zod";

// 角色定义
export const RoleType = z.enum([
  "owner",
  "admin",
  "maintainer",
  "member",
  "guest",
  "agent",
]);
export type RoleType = z.infer<typeof RoleType>;

// 权限操作
export const PermissionAction = z.enum([
  "read",
  "write",
  "delete",
  "admin",
  "create",
  "update",
  "execute",
  "assign",
]);
export type PermissionAction = z.infer<typeof PermissionAction>;

// 权限对象
export const PermissionResource = z.enum([
  "issue",
  "project",
  "workspace",
  "agent",
  "skill",
  "squad",
  "webhook",
  "schedule",
  "user",
  "setting",
  "comment",
  "file",
]);
export type PermissionResource = z.infer<typeof PermissionResource>;

// 权限规则
export const PermissionRule = z.object({
  resource: PermissionResource,
  actions: z.array(PermissionAction),
  conditions: z.record(z.any()).optional(),
});
export type PermissionRule = z.infer<typeof PermissionRule>;

// 完整角色配置
export const RoleDefinition = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  permissions: z.array(PermissionRule),
  isDefault: z.boolean().default(false),
  isAdmin: z.boolean().default(false),
  isAgent: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type RoleDefinition = z.infer<typeof RoleDefinition>;

// 用户角色分配
export const UserRoleAssignment = z.object({
  id: z.string(),
  userId: z.string(),
  roleId: z.string(),
  workspaceId: z.string().optional(),
  projectId: z.string().optional(),
  grantedBy: z.string(),
  grantedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});
export type UserRoleAssignment = z.infer<typeof UserRoleAssignment>;

// 预定义的角色
export const DEFAULT_ROLES: Record<string, RoleDefinition> = {
  owner: {
    id: "owner",
    name: "Owner",
    description: "Workspace owner with full access",
    isDefault: false,
    isAdmin: true,
    isAgent: false,
    permissions: [
      {
        resource: "workspace",
        actions: ["read", "write", "delete", "admin", "create", "update"],
      },
      {
        resource: "project",
        actions: ["read", "write", "delete", "admin", "create", "update"],
      },
      {
        resource: "issue",
        actions: ["read", "write", "delete", "admin", "create", "update", "assign"],
      },
      {
        resource: "agent",
        actions: ["read", "write", "delete", "admin", "create", "update", "execute"],
      },
      {
        resource: "skill",
        actions: ["read", "write", "delete", "admin", "create", "update", "execute"],
      },
      {
        resource: "squad",
        actions: ["read", "write", "delete", "admin", "create", "update"],
      },
      {
        resource: "webhook",
        actions: ["read", "write", "delete", "admin", "create", "update"],
      },
      {
        resource: "schedule",
        actions: ["read", "write", "delete", "admin", "create", "update", "execute"],
      },
      {
        resource: "user",
        actions: ["read", "write", "delete", "admin", "create", "update"],
      },
      {
        resource: "setting",
        actions: ["read", "write", "delete", "admin", "create", "update"],
      },
      {
        resource: "comment",
        actions: ["read", "write", "delete", "create", "update"],
      },
      {
        resource: "file",
        actions: ["read", "write", "delete", "create", "update"],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  admin: {
    id: "admin",
    name: "Administrator",
    description: "Administrator with most permissions",
    isDefault: false,
    isAdmin: true,
    isAgent: false,
    permissions: [
      {
        resource: "workspace",
        actions: ["read", "write", "create", "update"],
      },
      {
        resource: "project",
        actions: ["read", "write", "delete", "admin", "create", "update"],
      },
      {
        resource: "issue",
        actions: ["read", "write", "delete", "create", "update", "assign"],
      },
      {
        resource: "agent",
        actions: ["read", "write", "delete", "create", "update", "execute"],
      },
      {
        resource: "skill",
        actions: ["read", "write", "delete", "create", "update", "execute"],
      },
      {
        resource: "squad",
        actions: ["read", "write", "delete", "create", "update"],
      },
      {
        resource: "webhook",
        actions: ["read", "write", "delete", "create", "update"],
      },
      {
        resource: "schedule",
        actions: ["read", "write", "delete", "create", "update", "execute"],
      },
      {
        resource: "user",
        actions: ["read", "write", "create", "update"],
      },
      {
        resource: "setting",
        actions: ["read", "write", "update"],
      },
      {
        resource: "comment",
        actions: ["read", "write", "delete", "create", "update"],
      },
      {
        resource: "file",
        actions: ["read", "write", "delete", "create", "update"],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  maintainer: {
    id: "maintainer",
    name: "Maintainer",
    description: "Project maintainer with write access",
    isDefault: false,
    isAdmin: false,
    isAgent: false,
    permissions: [
      {
        resource: "workspace",
        actions: ["read"],
      },
      {
        resource: "project",
        actions: ["read", "write", "create", "update"],
      },
      {
        resource: "issue",
        actions: ["read", "write", "create", "update", "assign"],
      },
      {
        resource: "agent",
        actions: ["read", "write", "create", "update", "execute"],
      },
      {
        resource: "skill",
        actions: ["read", "write", "create", "update", "execute"],
      },
      {
        resource: "squad",
        actions: ["read", "write", "create", "update"],
      },
      {
        resource: "comment",
        actions: ["read", "write", "create", "update"],
      },
      {
        resource: "file",
        actions: ["read", "write", "create", "update"],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  member: {
    id: "member",
    name: "Member",
    description: "Regular team member",
    isDefault: true,
    isAdmin: false,
    isAgent: false,
    permissions: [
      {
        resource: "workspace",
        actions: ["read"],
      },
      {
        resource: "project",
        actions: ["read"],
      },
      {
        resource: "issue",
        actions: ["read", "write", "create", "update"],
      },
      {
        resource: "agent",
        actions: ["read", "execute"],
      },
      {
        resource: "skill",
        actions: ["read", "execute"],
      },
      {
        resource: "squad",
        actions: ["read"],
      },
      {
        resource: "comment",
        actions: ["read", "write", "create", "update"],
      },
      {
        resource: "file",
        actions: ["read", "create", "update"],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  guest: {
    id: "guest",
    name: "Guest",
    description: "Read-only guest user",
    isDefault: false,
    isAdmin: false,
    isAgent: false,
    permissions: [
      {
        resource: "workspace",
        actions: ["read"],
      },
      {
        resource: "project",
        actions: ["read"],
      },
      {
        resource: "issue",
        actions: ["read"],
      },
      {
        resource: "agent",
        actions: ["read"],
      },
      {
        resource: "skill",
        actions: ["read"],
      },
      {
        resource: "squad",
        actions: ["read"],
      },
      {
        resource: "comment",
        actions: ["read"],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  agent: {
    id: "agent",
    name: "Agent",
    description: "AI Agent role with specific permissions",
    isDefault: false,
    isAdmin: false,
    isAgent: true,
    permissions: [
      {
        resource: "issue",
        actions: ["read", "write", "update"],
      },
      {
        resource: "agent",
        actions: ["read", "execute"],
      },
      {
        resource: "skill",
        actions: ["read", "execute"],
      },
      {
        resource: "comment",
        actions: ["read", "write", "create", "update"],
      },
      {
        resource: "file",
        actions: ["read", "create", "update"],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

/**
 * 检查用户是否有特定权限
 */
export function hasPermission(
  roles: RoleDefinition[],
  resource: PermissionResource,
  action: PermissionAction,
  conditions?: Record<string, any>
): boolean {
  for (const role of roles) {
    if (role.isAdmin) {
      return true;
    }
    
    for (const rule of role.permissions) {
      if (rule.resource === resource && rule.actions.includes(action)) {
        if (conditions) {
          if (rule.conditions && !matchConditions(conditions, rule.conditions)) {
            continue;
          }
        }
        return true;
      }
    }
  }
  return false;
}

/**
 * 检查条件匹配（简单实现）
 */
function matchConditions(
  actual: Record<string, any>,
  expected: Record<string, any>
): boolean {
  for (const [key, value] of Object.entries(expected)) {
    if (actual[key] !== value) {
      return false;
    }
  }
  return true;
}

/**
 * 获取角色定义
 */
export function getRoleDefinition(roleId: string): RoleDefinition | undefined {
  return DEFAULT_ROLES[roleId];
}

/**
 * 获取所有可用角色
 */
export function getAllRoles(): RoleDefinition[] {
  return Object.values(DEFAULT_ROLES);
}

/**
 * 检查是否是管理员角色
 */
export function isAdminRole(role: RoleDefinition): boolean {
  return role.isAdmin;
}

/**
 * 获取角色的所有权限
 */
export function getRolePermissions(role: RoleDefinition): PermissionRule[] {
  return role.permissions;
}
