import React, { useState } from "react";
import { Issue, IssueStatus } from "@synapse/protocol";

interface CreateIssueModalProps {
  defaultStatus: IssueStatus;
  onClose: () => void;
  onCreate: (issue: Omit<Issue, "id">) => void;
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

export function CreateIssueModal({ defaultStatus, onClose, onCreate }: CreateIssueModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<IssueStatus>(defaultStatus);
  const [priority, setPriority] = useState<Issue["priority"]>("medium");
  const [labelInput, setLabelInput] = useState("");

  const handleCreate = () => {
    if (!title.trim()) return;

    const issue: Omit<Issue, "id"> = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      labels: labelInput ? labelInput.split(",").map((l) => l.trim()).filter(Boolean).map((name, idx) => ({
        name,
        color: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"][idx % 5],
      })) : undefined,
    };

    onCreate(issue);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Create Issue</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter issue title"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Add a description (optional)"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IssueStatus)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                onChange={(e) => setPriority(e.target.value as Issue["priority"])}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Labels <span className="text-gray-500">(comma separated)</span>
            </label>
            <input
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              placeholder="bug, feature, enhancement"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {labelInput && (
              <div className="flex flex-wrap gap-1 mt-2">
                {labelInput.split(",").map((l) => l.trim()).filter(Boolean).map((name, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-xs rounded"
                    style={{ backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"][idx % 5], color: "#fff" }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim()}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Issue
          </button>
        </div>
      </div>
    </div>
  );
}
