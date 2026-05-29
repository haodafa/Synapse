"use client";

import { Agent } from "./types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  Clock,
  Cpu,
  Database,
  FileCode,
  GitBranch,
  Hash,
  Layers,
  Settings,
  Terminal,
  Zap,
} from "lucide-react";

interface AgentDetailPanelProps {
  agent: Agent;
}

export function AgentDetailPanel({ agent }: AgentDetailPanelProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Inspector
        </h3>
      </div>

      <Tabs defaultValue="info" className="flex-1">
        <TabsList className="w-full">
          <TabsTrigger value="info" className="flex-1">
            Info
          </TabsTrigger>
          <TabsTrigger value="config" className="flex-1">
            Config
          </TabsTrigger>
          <TabsTrigger value="env" className="flex-1">
            Env
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <ScrollArea className="h-[calc(100%-20px)]">
            <div className="space-y-4">
              <InfoSection icon={Bot} title="Basic Info">
                <InfoItem label="ID" value={agent.id} copyable />
                <InfoItem label="Name" value={agent.name} />
                <InfoItem label="Provider" value={agent.provider} />
                <InfoItem
                  label="Status"
                  value={agent.status}
                  badge
                  badgeColor={getStatusColor(agent.status)}
                />
              </InfoSection>

              <InfoSection icon={Clock} title="Timeline">
                <InfoItem
                  label="Created"
                  value={formatDate(agent.createdAt)}
                />
                {agent.startedAt && (
                  <InfoItem
                    label="Started"
                    value={formatDate(agent.startedAt)}
                  />
                )}
                {agent.completedAt && (
                  <InfoItem
                    label="Completed"
                    value={formatDate(agent.completedAt)}
                  />
                )}
                {agent.startedAt && (
                  <InfoItem
                    label="Duration"
                    value={calculateDuration(agent.startedAt, agent.completedAt)}
                  />
                )}
              </InfoSection>

              {(agent.issueId || agent.runId) && (
                <InfoSection icon={Layers} title="Task Info">
                  {agent.issueId && (
                    <InfoItem label="Issue" value={agent.issueId} copyable />
                  )}
                  {agent.runId && (
                    <InfoItem label="Run" value={agent.runId} copyable />
                  )}
                </InfoSection>
              )}

              {agent.worktree && (
                <InfoSection icon={GitBranch} title="Worktree">
                  <InfoItem label="Branch" value={agent.worktree} />
                </InfoSection>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="config" className="mt-4">
          <ScrollArea className="h-[calc(100%-20px)]">
            <div className="space-y-4">
              <InfoSection icon={Cpu} title="Model">
                <InfoItem
                  label="Model"
                  value={agent.model || "default"}
                />
                {agent.temperature !== undefined && (
                  <InfoItem
                    label="Temperature"
                    value={agent.temperature.toString()}
                  />
                )}
                {agent.maxTokens !== undefined && (
                  <InfoItem
                    label="Max Tokens"
                    value={agent.maxTokens.toString()}
                  />
                )}
              </InfoSection>

              {agent.systemPrompt && (
                <InfoSection icon={Terminal} title="System Prompt">
                  <div className="text-sm bg-muted p-2 rounded">
                    {agent.systemPrompt}
                  </div>
                </InfoSection>
              )}

              {agent.tools && agent.tools.length > 0 && (
                <InfoSection icon={Zap} title="Tools">
                  <div className="flex flex-wrap gap-1">
                    {agent.tools.map((tool) => (
                      <Badge key={tool} variant="outline">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </InfoSection>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="env" className="mt-4">
          <ScrollArea className="h-[calc(100%-20px)]">
            <div className="space-y-4">
              <InfoSection icon={Database} title="Environment Variables">
                {agent.environment ? (
                  Object.entries(agent.environment).map(([key, value]) => (
                    <InfoItem key={key} label={key} value={value} copyable />
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No environment variables
                  </div>
                )}
              </InfoSection>

              {agent.metadata && Object.keys(agent.metadata).length > 0 && (
                <InfoSection icon={Hash} title="Metadata">
                  {Object.entries(agent.metadata).map(([key, value]) => (
                    <InfoItem
                      key={key}
                      label={key}
                      value={JSON.stringify(value)}
                      copyable
                    />
                  ))}
                </InfoSection>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface InfoSectionProps {
  icon: any;
  title: string;
  children: React.ReactNode;
}

function InfoSection({ icon: Icon, title, children }: InfoSectionProps) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4" />
        <h4 className="font-medium text-sm">{title}</h4>
      </div>
      <div className="space-y-2">{children}</div>
    </Card>
  );
}

interface InfoItemProps {
  label: string;
  value: string;
  copyable?: boolean;
  badge?: boolean;
  badgeColor?: string;
}

function InfoItem({
  label,
  value,
  copyable,
  badge,
  badgeColor,
}: InfoItemProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      {badge ? (
        <Badge
          variant="outline"
          style={badgeColor ? { borderColor: badgeColor, color: badgeColor } : {}}
        >
          {value}
        </Badge>
      ) : (
        <span className="font-mono text-xs truncate max-w-[200px]" title={value}>
          {value}
        </span>
      )}
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    idle: "#6b7280",
    starting: "#f59e0b",
    running: "#10b981",
    paused: "#8b5cf6",
    completed: "#3b82f6",
    failed: "#ef4444",
    cancelled: "#6b7280",
  };
  return colors[status] || "#6b7280";
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString();
  } catch {
    return dateStr;
  }
}

function calculateDuration(start: string, end?: string): string {
  try {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diff = endDate.getTime() - startDate.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  } catch {
    return "N/A";
  }
}
