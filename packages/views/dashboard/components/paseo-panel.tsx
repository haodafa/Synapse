"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, Bot, Brain, Cpu, Inbox, Sparkles, Zap } from "lucide-react";
import { api } from "@synapse/core/api";
import { workspaceKeys } from "@synapse/core/workspace/queries";
import { cn } from "@synapse/ui/lib/utils";

type Runtime = {
  id: string;
  name: string;
  type: "local" | "cloud";
  provider: string;
  status: "connected" | "working" | "idle" | "offline";
  os?: string;
  last_active?: string;
  tokens_today?: number;
};

type Agent = {
  id: string;
  name: string;
  role: string;
  status: "working" | "idle" | "connected";
  last_task?: string;
  updated_at?: string;
};

type InboxItem = {
  id: string;
  type: string;
  title: string;
  body?: string;
  agent_name?: string;
  created_at: string;
  read?: boolean;
};

type Skill = {
  id: string;
  name: string;
  description: string;
  trigger: string;
  updated_at?: string;
};

const statusDotClass: Record<string, string> = {
  working: "bg-[oklch(0.55_0.25_298)] animate-agent-pulse",
  connected: "bg-[oklch(0.65_0.18_88)] animate-synapse-pulse",
  idle: "bg-muted-foreground/50",
  offline: "bg-muted-foreground/20",
};

const statusLabel: Record<string, string> = {
  working: "Working",
  connected: "Connected",
  idle: "Idle",
  offline: "Offline",
};

const statusLabelZh: Record<string, string> = {
  working: "工作中",
  connected: "在线",
  idle: "空闲",
  offline: "离线",
};

function timeAgo(iso?: string): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatTokens(n?: number): string {
  if (!n) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function PaseoPanel({ workspaceId }: { workspaceId: string }) {
  const { data: runtimes = [] } = useQuery({
    queryKey: [...workspaceKeys.cloudRuntimeNodes(), workspaceId],
    queryFn: () => api.listCloudRuntimeNodes(),
  }) as { data: Runtime[] };

  const { data: agents = [] } = useQuery({
    queryKey: [...workspaceKeys.members(workspaceId), "agents"],
    queryFn: () => api.listAgents(),
  }) as { data: Agent[] };

  const { data: inbox = [] } = useQuery({
    queryKey: ["inbox"],
    queryFn: () => api.listInbox(),
  }) as { data: InboxItem[] };

  const { data: skills = [] } = useQuery({
    queryKey: ["skills"],
    queryFn: () => api.listSkills(),
  }) as { data: Skill[] };

  const workingRuntimes = runtimes.filter((r) => r.status === "working");
  const workingAgents = agents.filter((a) => a.status === "working");
  const totalTokens = runtimes.reduce((s, r) => s + (r.tokens_today ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* ── Header card: Paseo value prop ── */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 100% 0%, oklch(0.55 0.25 298 / 18%) 0%, transparent 60%), radial-gradient(ellipse 40% 60% at 0% 100%, oklch(0.70 0.16 88 / 12%) 0%, transparent 60%)",
          }}
        />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Brain className="size-3.5" />
              <span className="animate-gradient-text font-semibold">
                Paseo Agent Layer
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Your agents are <span className="animate-gradient-text">working</span> for you
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {workingRuntimes.length} runtime{workingRuntimes.length === 1 ? "" : "s"} active · {workingAgents.length} agent{workingAgents.length === 1 ? "" : "s"} executing · {formatTokens(totalTokens)} tokens today
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <span className="size-2 rounded-full bg-[oklch(0.55_0.25_298)] animate-agent-pulse" />
            Live
          </div>
        </div>
      </div>

      {/* ── Runtimes grid ── */}
      <section>
        <SectionHeader
          icon={<Cpu className="size-4" />}
          title="Runtimes"
          subtitle="Local + cloud AI agent runtimes"
          count={runtimes.length}
        />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {runtimes.slice(0, 6).map((r) => (
            <div
              key={r.id}
              className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-[oklch(0.55_0.25_298_/_40%)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      statusDotClass[r.status] ?? statusDotClass.idle,
                    )}
                    aria-hidden
                  />
                  <div>
                    <div className="text-sm font-semibold">{r.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {r.provider} · {r.os ?? "unknown"}
                    </div>
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    r.type === "cloud"
                      ? "bg-[oklch(0.55_0.22_255_/_15%)] text-[oklch(0.62_0.22_255)]"
                      : "bg-[oklch(0.70_0.16_88_/_15%)] text-[oklch(0.65_0.16_88)]",
                  )}
                >
                  {r.type}
                </span>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <div className="text-[11px] text-muted-foreground">
                  {statusLabel[r.status] ?? r.status} · {timeAgo(r.last_active)}
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums">
                    {formatTokens(r.tokens_today)}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    tokens
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Agents ── */}
        <section className="lg:col-span-2">
          <SectionHeader
            icon={<Bot className="size-4" />}
            title="Agents"
            subtitle="Active teammates"
            count={agents.length}
          />
          <div className="mt-3 space-y-2">
            {agents.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className="relative">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-[oklch(0.55_0.25_298_/_10%)] text-[oklch(0.55_0.25_298)]">
                    <Bot className="size-4" />
                  </div>
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card",
                      statusDotClass[a.status] ?? statusDotClass.idle,
                    )}
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">
                      {a.name}
                    </span>
                    <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {a.role}
                    </span>
                  </div>
                  <div className="truncate text-[12px] text-muted-foreground">
                    {a.last_task ?? "—"}
                  </div>
                </div>
                <div className="shrink-0 text-right text-[11px] text-muted-foreground">
                  {timeAgo(a.updated_at)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Inbox ── */}
        <section>
          <SectionHeader
            icon={<Inbox className="size-4" />}
            title="Inbox"
            subtitle="Recent activity"
            count={inbox.length}
          />
          <div className="mt-3 space-y-2">
            {inbox.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="relative rounded-lg border border-border bg-card p-3"
              >
                {!item.read && (
                  <span className="absolute right-2 top-2 size-2 rounded-full bg-[oklch(0.55_0.25_298)]" />
                )}
                <div className="text-[11px] font-medium text-muted-foreground">
                  {item.agent_name}
                </div>
                <div className="mt-0.5 text-[13px] font-medium leading-snug">
                  {item.title}
                </div>
                {item.body && (
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {item.body}
                  </div>
                )}
                <div className="mt-1 text-[10px] text-muted-foreground/70">
                  {timeAgo(item.created_at)}
                </div>
              </div>
            ))}
            {inbox.length === 0 && (
              <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No recent activity
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Skills ── */}
      <section>
        <SectionHeader
          icon={<Sparkles className="size-4" />}
          title="Skills"
          subtitle="Reusable capabilities"
          count={skills.length}
        />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {skills.slice(0, 4).map((s) => (
            <button
              key={s.id}
              className="group rounded-xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[oklch(0.55_0.25_298_/_40%)] hover:shadow-[0_8px_24px_-8px_oklch(0.55_0.25_298_/_20%)]"
            >
              <div className="flex items-center gap-2">
                <Zap className="size-3.5 text-[oklch(0.55_0.25_298)]" />
                <div className="text-sm font-semibold">{s.name}</div>
              </div>
              <div className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                {s.description}
              </div>
              <div className="mt-2 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                /{s.trigger}
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  count?: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <span className="text-[11px] text-muted-foreground">{subtitle}</span>
      </div>
      {typeof count === "number" && count > 0 && (
        <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {count}
        </span>
      )}
    </div>
  );
}
