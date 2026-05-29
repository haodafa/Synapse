import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Issue } from "@synapse/protocol";

interface IssueCardProps {
  issue: Issue;
  onClick?: () => void;
  isDragging?: boolean;
}

const priorityColors: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-blue-500",
  low: "bg-gray-500",
};

const priorityTextColors: Record<string, string> = {
  critical: "text-red-400",
  high: "text-orange-400",
  medium: "text-blue-400",
  low: "text-gray-400",
};

export function IssueCard({ issue, onClick, isDragging = false }: IssueCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: issue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragging = isDragging || isSortableDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-gray-700 rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all hover:bg-gray-650 ${
        dragging ? "opacity-50 shadow-lg ring-2 ring-blue-500" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${priorityColors[issue.priority] ?? priorityColors.medium}`}
          />
          <span className={`text-xs font-medium ${priorityTextColors[issue.priority] ?? priorityTextColors.medium}`}>
            {issue.priority?.toUpperCase() ?? "MEDIUM"}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {issue.key ?? issue.id.slice(0, 8)}
        </span>
      </div>

      <h4 className="text-sm font-medium text-white mb-1 line-clamp-2">
        {issue.title}
      </h4>

      {issue.description && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2">
          {issue.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {issue.labels && issue.labels.length > 0 && (
            <div className="flex items-center gap-1">
              {issue.labels.slice(0, 2).map((label, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 text-xs rounded"
                  style={{ backgroundColor: label.color, color: "#fff" }}
                >
                  {label.name}
                </span>
              ))}
              {issue.labels.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{issue.labels.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {issue.comments && issue.comments.length > 0 && (
            <div className="flex items-center gap-1 text-gray-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-xs">{issue.comments.length}</span>
            </div>
          )}

          {issue.assignee && (
            <div
              className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs font-medium text-white"
              title={issue.assignee.name}
            >
              {issue.assignee.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
