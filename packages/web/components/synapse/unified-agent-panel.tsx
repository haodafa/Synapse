"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Agent,
  AgentStatus,
  getAgentStatusColor,
  getAgentStatusText,
} from "./types";
import { AgentDetailPanel } from "./agent-detail-panel";
import { AgentActivityFeed } from "./agent-activity-feed";
import { WorktreeManager } from "./worktree-manager";
import { AgentTerminal } from "./agent-terminal";
import {
  Bot,
  Activity,
  GitBranch,
  Terminal,
  Plus,
  RefreshCw,
  Zap,
} from "lucide-react";

interface UnifiedAgentPanelProps {
  agents: Agent[];
  onAgentSelect: (agent: Agent) => void;
  onAgentAction: (agentId: string, action: string) => void;
  onCreateAgent: () => void;
}

export function UnifiedAgentPanel({
  agents,
  onAgentSelect,
  onAgentAction,
  onCreateAgent,
}: UnifiedAgentPanelProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState("agents");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
  }, [agents, selectedAgent]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="flex h-full gap-4">
      {/* Left Panel: Agent List & Quick Actions */}
      <div className="w-80 flex flex-col border-r pr-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Agents
            <Badge variant="secondary">{agents.length}</Badge>
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className={isRefreshing ? "animate-spin" : ""}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <Button onClick={onCreateAgent} className="mb-4">
          <Plus className="w-4 h-4 mr-2" />
          New Agent
        </Button>

        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {agents.map((agent) => (
              <AgentListItem
                key={agent.id}
                agent={agent}
                isSelected={selectedAgent?.id === agent.id}
                onClick={() => {
                  setSelectedAgent(agent);
                  onAgentSelect(agent);
                }}
                onAction={(action) => onAgentAction(agent.id, action)}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Center Panel: Agent Details & Activity */}
      <div className="flex-1 flex flex-col">
        {selectedAgent ? (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{selectedAgent.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: getAgentStatusColor(selectedAgent.status),
                        color: getAgentStatusColor(selectedAgent.status),
                      }}
                    >
                      {getAgentStatusText(selectedAgent.status)}
                    </Badge>
                    <Badge variant="outline">{selectedAgent.provider}</Badge>
                    {selectedAgent.worktree && (
                      <Badge variant="secondary">
                        <GitBranch className="w-3 h-3 mr-1" />
                        {selectedAgent.worktree}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedAgent.status === "running" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        onAgentAction(selectedAgent.id, "stop")
                      }
                    >
                      Stop
                    </Button>
                  )}
                  {selectedAgent.status === "idle" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        onAgentAction(selectedAgent.id, "start")
                      }
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Start
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList>
                <TabsTrigger value="agents" className="gap-2">
                  <Activity className="w-4 h-4" />
                  Activity
                </TabsTrigger>
                <TabsTrigger value="terminal" className="gap-2">
                  <Terminal className="w-4 h-4" />
                  Terminal
                </TabsTrigger>
                <TabsTrigger value="worktree" className="gap-2">
                  <GitBranch className="w-4 h-4" />
                  Worktree
                </TabsTrigger>
              </TabsList>

              <TabsContent value="agents" className="h-[calc(100%-40px)]">
                <AgentActivityFeed agentId={selectedAgent.id} />
              </TabsContent>

              <TabsContent value="terminal" className="h-[calc(100%-40px)]">
                <AgentTerminal agentId={selectedAgent.id} />
              </TabsContent>

              <TabsContent value="worktree" className="h-[calc(100%-40px)]">
                <WorktreeManager
                  agentId={selectedAgent.id}
                  currentWorktree={selectedAgent.worktree}
                />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select an agent to view details
          </div>
        )}
      </div>

      {/* Right Panel: Agent Inspector */}
      {selectedAgent && (
        <div className="w-96 border-l pl-4">
          <AgentDetailPanel agent={selectedAgent} />
        </div>
      )}
    </div>
  );
}

interface AgentListItemProps {
  agent: Agent;
  isSelected: boolean;
  onClick: () => void;
  onAction: (action: string) => void;
}

function AgentListItem({
  agent,
  isSelected,
  onClick,
  onAction,
}: AgentListItemProps) {
  return (
    <Card
      className={`p-3 cursor-pointer transition-colors ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-medium flex items-center gap-2">
            <Bot className="w-4 h-4" />
            {agent.name}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {agent.provider}
          </div>
          {agent.issueId && (
            <Badge variant="outline" className="mt-1 text-xs">
              Issue: {agent.issueId}
            </Badge>
          )}
        </div>
        <Badge
          variant="outline"
          className="text-xs"
          style={{
            borderColor: getAgentStatusColor(agent.status),
            color: getAgentStatusColor(agent.status),
          }}
        >
          {getAgentStatusText(agent.status)}
        </Badge>
      </div>
      {agent.status === "running" && (
        <div className="mt-2 flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onAction("attach");
            }}
          >
            Attach
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onAction("stop");
            }}
          >
            Stop
          </Button>
        </div>
      )}
    </Card>
  );
}
