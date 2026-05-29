"use client";

import { useState, useEffect } from "react";
import { AgentActivity } from "./types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  Bot,
  FileCode,
  AlertCircle,
  MessageSquare,
  Terminal,
  GitCommit,
} from "lucide-react";

interface AgentActivityFeedProps {
  agentId: string;
}

export function AgentActivityFeed({ agentId }: AgentActivityFeedProps) {
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [agentId]);

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/agents/${agentId}/activities`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error("Failed to load activities:", error);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading activities...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Activity Feed
        </h4>
        <Badge variant="outline">{activities.length} events</Badge>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {activities.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No activity yet
            </div>
          ) : (
            activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface ActivityItemProps {
  activity: AgentActivity;
}

function ActivityItem({ activity }: ActivityItemProps) {
  const Icon = getActivityIcon(activity.type);
  const color = getActivityColor(activity.type);

  return (
    <Card className="p-3">
      <div className="flex items-start gap-3">
        <div
          className="p-2 rounded-full"
          style={{ backgroundColor: `${color}20`, color }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              {activity.type}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatTime(activity.timestamp)}
            </span>
          </div>
          <p className="text-sm break-words">{activity.message}</p>
          {activity.data && (
            <div className="mt-2 text-xs bg-muted p-2 rounded font-mono overflow-x-auto">
              <pre>{JSON.stringify(activity.data, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function getActivityIcon(type: string) {
  switch (type) {
    case "started":
      return Bot;
    case "stopped":
      return Bot;
    case "message":
      return MessageSquare;
    case "error":
      return AlertCircle;
    case "tool_use":
      return Terminal;
    case "file_change":
      return FileCode;
    case "git_commit":
      return GitCommit;
    default:
      return Activity;
  }
}

function getActivityColor(type: string): string {
  switch (type) {
    case "started":
      return "#10b981";
    case "stopped":
      return "#6b7280";
    case "message":
      return "#3b82f6";
    case "error":
      return "#ef4444";
    case "tool_use":
      return "#8b5cf6";
    case "file_change":
      return "#f59e0b";
    case "git_commit":
      return "#10b981";
    default:
      return "#6b7280";
  }
}

function formatTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  } catch {
    return timestamp;
  }
}
