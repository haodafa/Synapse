import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Issue, IssueStatus } from "@synapse/protocol";
import { IssueCard } from "./issue-card";

interface KanbanColumnProps {
  status: IssueStatus;
  label: string;
  color: string;
  issues: Issue[];
  onIssueClick?: (issue: Issue) => void;
  onAddIssue?: () => void;
}

export function KanbanColumn({
  status,
  label,
  color,
  issues,
  onIssueClick,
  onAddIssue,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 bg-gray-800 rounded-xl flex flex-col transition-colors ${
        isOver ? "ring-2 ring-blue-500 ring-opacity-50" : ""
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h3 className="font-semibold text-white">{label}</h3>
          <span className="px-2 py-0.5 text-xs font-medium bg-gray-700 text-gray-300 rounded-full">
            {issues.length}
          </span>
        </div>
        <button
          onClick={onAddIssue}
          className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <SortableContext
          items={issues.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onClick={() => onIssueClick?.(issue)}
            />
          ))}
        </SortableContext>

        {issues.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">No issues</p>
            <button
              onClick={onAddIssue}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300"
            >
              Add one
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
