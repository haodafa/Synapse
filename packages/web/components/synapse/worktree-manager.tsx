"use client";

import { useState } from "react";
import { Worktree } from "./types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  GitBranch,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface WorktreeManagerProps {
  agentId: string;
  currentWorktree?: string;
}

export function WorktreeManager({ agentId, currentWorktree }: WorktreeManagerProps) {
  const [worktrees, setWorktrees] = useState<Worktree[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newBranchName, setNewBranchName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useState(() => {
    loadWorktrees();
  });

  const loadWorktrees = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/worktrees");
      if (response.ok) {
        const data = await response.json();
        setWorktrees(data);
      }
    } catch (error) {
      console.error("Failed to load worktrees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createWorktree = async () => {
    if (!newBranchName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/worktrees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch: newBranchName,
          name: `wt-${newBranchName}`,
          agentId,
        }),
      });

      if (response.ok) {
        const worktree = await response.json();
        setWorktrees([...worktrees, worktree]);
        setNewBranchName("");
      }
    } catch (error) {
      console.error("Failed to create worktree:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const deleteWorktree = async (worktreeId: string) => {
    try {
      const response = await fetch(`/api/worktrees/${worktreeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setWorktrees(worktrees.filter((wt) => wt.id !== worktreeId));
      }
    } catch (error) {
      console.error("Failed to delete worktree:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading worktrees...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h4 className="font-medium flex items-center gap-2 mb-3">
          <GitBranch className="w-4 h-4" />
          Git Worktrees
        </h4>
        <div className="flex gap-2">
          <Input
            placeholder="Branch name..."
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && createWorktree()}
          />
          <Button onClick={createWorktree} disabled={isCreating || !newBranchName.trim()}>
            {isCreating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {worktrees.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <GitBranch className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No worktrees created yet</p>
              <p className="text-xs">Create a worktree to isolate agent tasks</p>
            </div>
          ) : (
            worktrees.map((worktree) => (
              <WorktreeItem
                key={worktree.id}
                worktree={worktree}
                isActive={worktree.name === currentWorktree}
                onDelete={() => deleteWorktree(worktree.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <div className="mt-4 p-3 bg-muted rounded-lg">
        <h5 className="text-sm font-medium mb-2">Benefits of Worktree Isolation</h5>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Each task runs in an isolated Git branch</li>
          <li>• No branch conflicts when running multiple agents</li>
          <li>• Easy to review and merge changes</li>
          <li>• Safe cleanup without affecting main branch</li>
        </ul>
      </div>
    </div>
  );
}

interface WorktreeItemProps {
  worktree: Worktree;
  isActive: boolean;
  onDelete: () => void;
}

function WorktreeItem({ worktree, isActive, onDelete }: WorktreeItemProps) {
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitBranch className="w-4 h-4" />
          <div>
            <div className="font-medium text-sm">{worktree.name}</div>
            <div className="text-xs text-muted-foreground">
              {worktree.path}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <Badge variant="default" className="text-xs">
              <Check className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
          <Badge
            variant="outline"
            className="text-xs"
            style={{
              borderColor: getStatusColor(worktree.status),
              color: getStatusColor(worktree.status),
            }}
          >
            {worktree.status}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "#10b981",
    completed: "#3b82f6",
    failed: "#ef4444",
    cleaned: "#6b7280",
  };
  return colors[status] || "#6b7280";
}
