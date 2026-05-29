import React, { useState } from "react";
import { Issue, IssueStatus } from "@synapse/protocol";

interface IssueDetailModalProps {
  issue: Issue;
  onClose: () => void;
  onUpdate: (issueId: string, updates: Partial<Issue>) => void;
  onDelete: (issueId: string) => void;
}

const STATUS_OPTIONS: { value: IssueStatus; label: string; color: string }[] = [
  { value: "backlog", label: "Backlog", color: "#6B7280" },
  { value: "todo", label: "To Do", color: "#3B82F6" },
  { value: "in_progress", label: "In Progress", color: "#F59E0B" },
  { value: "in_review", label: "In Review", color: "#8B5CF6" },
  { value: "done", label: "Done", color: "#10B981" },
];

const PRIORITY_OPTIONS = [
  { value: "critical", label: "Critical", color: "#EF4444" },
  { value: "high", label: "High", color: "#F59E0B" },
  { value: "medium", label: "Medium", color: "#3B82F6" },
  { value: "low", label: "Low", color: "#6B7280" },
];

export function IssueDetailModal({ issue, onClose, onUpdate, onDelete }: IssueDetailModalProps) {
  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description ?? "");
  const [status, setStatus] = useState<IssueStatus>(issue.status ?? "todo");
  const [priority, setPriority] = useState(issue.priority ?? "medium");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    onUpdate(issue.id, {
      title,
      description,
      status,
      priority: priority as Issue["priority"],
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(issue.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-mono">{issue.key ?? issue.id.slice(0, 8)}</span>
            <span className={`px-2 py-0.5 text-xs rounded ${
              status === "done" ? "bg-green-500/20 text-green-400" :
              status === "in_progress" ? "bg-yellow-500/20 text-yellow-400" :
              "bg-gray-700 text-gray-400"
            }`}>
              {STATUS_OPTIONS.find(s => s.value === status)?.label ?? status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!isEditing}
              className="w-full text-xl font-semibold bg-transparent border-none text-white focus:outline-none focus:ring-0 disabled:opacity-100"
              placeholder="Issue title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IssueStatus)}
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-100"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-100"
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isEditing}
              rows={4}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-100 resize-none"
              placeholder="Add a description..."
            />
          </div>

          {issue.assignee && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Assignee</label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  {issue.assignee.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-white">{issue.assignee.name}</span>
              </div>
            </div>
          )}

          {issue.labels && issue.labels.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Labels</label>
              <div className="flex flex-wrap gap-2">
                {issue.labels.map((label, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs rounded"
                    style={{ backgroundColor: label.color, color: "#fff" }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {issue.comments && issue.comments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Comments ({issue.comments.length})
              </label>
              <div className="space-y-3">
                {issue.comments.map((comment, idx) => (
                  <div key={idx} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">
                        {comment.author?.charAt(0).toUpperCase() ?? "?"}
                      </div>
                      <span className="text-sm font-medium text-white">
                        {comment.author ?? "Unknown"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-gray-700">
          <div>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-400">Delete this issue?</span>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-1 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Delete issue
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setTitle(issue.title);
                    setDescription(issue.description ?? "");
                    setStatus(issue.status ?? "todo");
                    setPriority(issue.priority ?? "medium");
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                  Save changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
              >
                Edit issue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
