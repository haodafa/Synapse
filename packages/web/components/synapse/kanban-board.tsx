import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Issue, IssueStatus } from "@synapse/protocol";
import { KanbanColumn } from "./kanban-column";
import { IssueCard } from "./issue-card";
import { IssueDetailModal } from "./issue-detail-modal";
import { CreateIssueModal } from "./create-issue-modal";

interface KanbanBoardProps {
  issues: Issue[];
  onIssueUpdate?: (issueId: string, updates: Partial<Issue>) => void;
  onIssueDelete?: (issueId: string) => void;
  onIssueCreate?: (issue: Omit<Issue, "id">) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const STATUS_COLUMNS: { status: IssueStatus; label: string; color: string }[] = [
  { status: "backlog", label: "Backlog", color: "#6B7280" },
  { status: "todo", label: "To Do", color: "#3B82F6" },
  { status: "in_progress", label: "In Progress", color: "#F59E0B" },
  { status: "in_review", label: "In Review", color: "#8B5CF6" },
  { status: "done", label: "Done", color: "#10B981" },
];

export function KanbanBoard({
  issues,
  onIssueUpdate,
  onIssueDelete,
  onIssueCreate,
  onRefresh,
  isLoading = false,
}: KanbanBoardProps) {
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createColumnStatus, setCreateColumnStatus] = useState<IssueStatus>("todo");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const issuesByStatus = useMemo(() => {
    const grouped: Record<IssueStatus, Issue[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
    };

    issues.forEach((issue) => {
      const status = issue.status ?? "backlog";
      if (grouped[status]) {
        grouped[status].push(issue);
      } else {
        grouped.backlog.push(issue);
      }
    });

    return grouped;
  }, [issues]);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !issue.title.toLowerCase().includes(query) &&
          !issue.description?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      if (filterAssignee && issue.assignee?.id !== filterAssignee) {
        return false;
      }
      if (filterPriority && issue.priority !== filterPriority) {
        return false;
      }
      return true;
    });
  }, [issues, searchQuery, filterAssignee, filterPriority]);

  const filteredIssuesByStatus = useMemo(() => {
    const grouped: Record<IssueStatus, Issue[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
    };

    filteredIssues.forEach((issue) => {
      const status = issue.status ?? "backlog";
      if (grouped[status]) {
        grouped[status].push(issue);
      } else {
        grouped.backlog.push(issue);
      }
    });

    return grouped;
  }, [filteredIssues]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const issue = issues.find((i) => i.id === event.active.id);
    if (issue) {
      setActiveIssue(issue);
    }
  }, [issues]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveIssue(null);
      return;
    }

    const issueId = active.id as string;
    const overId = over.id as string;

    let newStatus: IssueStatus | null = null;

    if (STATUS_COLUMNS.some((col) => col.status === overId)) {
      newStatus = overId as IssueStatus;
    } else {
      const overIssue = issues.find((i) => i.id === overId);
      if (overIssue) {
        newStatus = overIssue.status ?? "backlog";
      }
    }

    if (newStatus) {
      const issue = issues.find((i) => i.id === issueId);
      if (issue && issue.status !== newStatus) {
        onIssueUpdate?.(issueId, { status: newStatus });
      }
    }

    setActiveIssue(null);
  }, [issues, onIssueUpdate]);

  const handleIssueClick = useCallback((issue: Issue) => {
    setSelectedIssue(issue);
  }, []);

  const handleIssueUpdate = useCallback((issueId: string, updates: Partial<Issue>) => {
    onIssueUpdate?.(issueId, updates);
    setSelectedIssue((prev) => (prev?.id === issueId ? { ...prev, ...updates } : prev));
  }, [onIssueUpdate]);

  const handleIssueDelete = useCallback((issueId: string) => {
    onIssueDelete?.(issueId);
    setSelectedIssue(null);
  }, [onIssueDelete]);

  const handleCreateIssue = useCallback((issue: Omit<Issue, "id">) => {
    onIssueCreate?.(issue);
    setShowCreateModal(false);
  }, [onIssueCreate]);

  const handleCreateClick = useCallback((status: IssueStatus) => {
    setCreateColumnStatus(status);
    setShowCreateModal(true);
  }, []);

  const allAssignees = useMemo(() => {
    const assigneeMap = new Map<string, { id: string; name: string }>();
    issues.forEach((issue) => {
      if (issue.assignee) {
        assigneeMap.set(issue.assignee.id, issue.assignee);
      }
    });
    return Array.from(assigneeMap.values());
  }, [issues]);

  const priorities = ["critical", "high", "medium", "low"];

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Kanban Board</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRefresh?.()}
              className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={() => handleCreateClick("todo")}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Issue
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterAssignee ?? ""}
            onChange={(e) => setFilterAssignee(e.target.value || null)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Assignees</option>
            {allAssignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.name}
              </option>
            ))}
          </select>

          <select
            value={filterPriority ?? ""}
            onChange={(e) => setFilterPriority(e.target.value || null)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </option>
            ))}
          </select>

          {(searchQuery || filterAssignee || filterPriority) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterAssignee(null);
                setFilterPriority(null);
              }}
              className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-6 mt-3 text-sm text-gray-400">
          <span>{filteredIssues.length} issues</span>
          {filteredIssues.length !== issues.length && (
            <span className="text-blue-400">
              (filtered from {issues.length} total)
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full min-w-max">
            {STATUS_COLUMNS.map((column) => (
              <KanbanColumn
                key={column.status}
                status={column.status}
                label={column.label}
                color={column.color}
                issues={filteredIssuesByStatus[column.status]}
                onIssueClick={handleIssueClick}
                onAddIssue={() => handleCreateClick(column.status)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeIssue && (
              <IssueCard issue={activeIssue} isDragging />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpdate={handleIssueUpdate}
          onDelete={handleIssueDelete}
        />
      )}

      {showCreateModal && (
        <CreateIssueModal
          defaultStatus={createColumnStatus}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateIssue}
        />
      )}
    </div>
  );
}
