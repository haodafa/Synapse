import { z } from "zod";

export const SearchOperator = z.enum([
  "eq",        // 等于
  "ne",        // 不等于
  "gt",        // 大于
  "gte",       // 大于等于
  "lt",        // 小于
  "lte",       // 小于等于
  "contains",  // 包含字符串
  "starts_with", // 以...开头
  "ends_with",   // 以...结尾
  "in",        // 在列表中
  "not_in",    // 不在列表中
  "is_null",   // 是 null
  "is_not_null", // 不是 null
]);
export type SearchOperator = z.infer<typeof SearchOperator>;

export const SearchSortDirection = z.enum(["asc", "desc"]);
export type SearchSortDirection = z.infer<typeof SearchSortDirection>;

export const SearchSort = z.object({
  field: z.string(),
  direction: SearchSortDirection.default("asc"),
});
export type SearchSort = z.infer<typeof SearchSort>;

export const SearchFilter = z.object({
  field: z.string(),
  operator: SearchOperator,
  value: z.any(),
});
export type SearchFilter = z.infer<typeof SearchFilter>;

export const SearchQuery = z.object({
  query: z.string().optional(),  // 全文搜索查询
  filters: z.array(SearchFilter).optional(),
  sort: z.array(SearchSort).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  include: z.array(z.string()).optional(), // 要包含的关联资源
});
export type SearchQuery = z.infer<typeof SearchQuery>;

export const SearchResultItem = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  summary: z.string().optional(),
  score: z.number().optional(),
  highlight: z.record(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type SearchResultItem = z.infer<typeof SearchResultItem>;

export const SearchResponse = z.object({
  results: z.array(SearchResultItem),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
  took: z.number().optional(), // 毫秒
  suggestedQuery: z.string().optional(), // 拼写建议
});
export type SearchResponse = z.infer<typeof SearchResponse>;

// Issue 搜索查询
export const IssueSearchQuery = SearchQuery.extend({
  projectId: z.string().optional(),
  statuses: z.array(z.string()).optional(),
  priorities: z.array(z.string()).optional(),
  assigneeIds: z.array(z.string()).optional(),
  creatorIds: z.array(z.string()).optional(),
  labels: z.array(z.string()).optional(),
  dateRange: z.object({
    field: z.string().default("createdAt"),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }).optional(),
});
export type IssueSearchQuery = z.infer<typeof IssueSearchQuery>;

// Agent 搜索查询
export const AgentSearchQuery = SearchQuery.extend({
  provider: z.string().optional(),
  statuses: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
});
export type AgentSearchQuery = z.infer<typeof AgentSearchQuery>;

// Skill 搜索查询
export const SkillSearchQuery = SearchQuery.extend({
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
});
export type SkillSearchQuery = z.infer<typeof SkillSearchQuery>;

/**
 * 构建搜索过滤器
 */
export function buildSearchFilter(
  field: string,
  operator: SearchOperator,
  value: any
): SearchFilter {
  return {
    field,
    operator,
    value,
  };
}

/**
 * 构建搜索查询
 */
export function buildSearchQuery(options: {
  query?: string;
  filters?: SearchFilter[];
  sort?: SearchSort[];
  limit?: number;
  offset?: number;
}): SearchQuery {
  return {
    query: options.query,
    filters: options.filters,
    sort: options.sort,
    limit: options.limit,
    offset: options.offset,
  };
}

/**
 * 构建排序配置
 */
export function buildSort(
  field: string,
  direction: SearchSortDirection = "asc"
): SearchSort {
  return { field, direction };
}

/**
 * 解析搜索查询字符串为结构化查询
 * 支持语法: field:value, status:open, author:@me
 */
export function parseSearchQueryString(query: string): SearchQuery {
  const filters: SearchFilter[] = [];
  let textQuery = "";
  const parts = query.match(/(?:[^\s"]+|"[^"]*")+/g) || [];

  for (const part of parts) {
    const colonIndex = part.indexOf(":");
    if (colonIndex > 0) {
      const field = part.substring(0, colonIndex);
      let value = part.substring(colonIndex + 1);
      
      // 移除引号
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      
      // 特殊字段处理
      if (value.startsWith("@")) {
        if (value === "@me") {
          filters.push(buildSearchFilter(field, "eq", "current_user"));
        } else {
          filters.push(buildSearchFilter(field, "eq", value.slice(1)));
        }
      } else if (value.startsWith("!")) {
        filters.push(buildSearchFilter(field, "ne", value.slice(1)));
      } else if (value.includes(",")) {
        const values = value.split(",").map(v => v.trim());
        filters.push(buildSearchFilter(field, "in", values));
      } else {
        filters.push(buildSearchFilter(field, "contains", value));
      }
    } else {
      textQuery += (textQuery ? " " : "") + part;
    }
  }

  return {
    query: textQuery.trim() || undefined,
    filters: filters.length > 0 ? filters : undefined,
    limit: 20,
    offset: 0,
  };
}

/**
 * 常用搜索预设
 */
export const SEARCH_PRESETS = {
  myOpenIssues: {
    query: "",
    filters: [
      buildSearchFilter("assigneeId", "eq", "current_user"),
      buildSearchFilter("status", "in", ["backlog", "todo", "in_progress", "in_review"]),
    ],
    sort: [buildSort("priority", "desc"), buildSort("createdAt", "desc")],
  },
  recentIssues: {
    query: "",
    filters: [],
    sort: [buildSort("updatedAt", "desc")],
    limit: 10,
  },
  blockedIssues: {
    query: "",
    filters: [
      buildSearchFilter("status", "in", ["backlog", "todo"]),
      buildSearchFilter("hasBlockers", "eq", true),
    ],
    sort: [buildSort("priority", "desc")],
  },
} as const;
