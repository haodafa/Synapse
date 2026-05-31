import type {
  AgentSnapshotPayload,
  CreateAgentRequestMessage,
  FetchWorkspacesRequestMessage,
  FetchWorkspacesResponseMessage,
  GetProvidersSnapshotResponseMessage,
  ListAvailableProvidersResponse,
  ListProviderFeaturesRequestMessage,
  ListProviderFeaturesResponseMessage,
  ListProviderModelsResponseMessage,
  ListProviderModesResponseMessage,
  MutableDaemonConfig,
  MutableDaemonConfigPatch,
  ProviderDiagnosticResponseMessage,
  ProjectPlacementPayload,
  RefreshProvidersSnapshotResponseMessage,
  SendAgentMessageRequest,
  SessionOutboundMessage,
  WorkspaceDescriptorPayload,
} from "@synapse/protocol/messages";
import { DaemonClient } from "./daemon-client.js";
import type {
  FetchAgentTimelineCursor,
  FetchAgentTimelineDirection,
  FetchAgentTimelinePayload,
  FetchAgentTimelineProjection,
} from "./daemon-client.js";

export { DaemonClient };
export type {
  DaemonClientConfig,
  DaemonEvent,
  WebSocketFactory,
  WebSocketLike,
} from "./daemon-client.js";

export type ConnectionState =
  | { status: "idle" }
  | { status: "connecting"; attempt: number }
  | { status: "connected" }
  | { status: "disconnected"; reason?: string }
  | { status: "disposed" };

export interface SynapseLogger {
  debug(obj: object, msg?: string): void;
  info(obj: object, msg?: string): void;
  warn(obj: object, msg?: string): void;
  error(obj: object, msg?: string): void;
}

export interface SynapseClientConfig {
  url: string;
  clientId?: string;
  appVersion?: string;
  runtimeGeneration?: number | null;
  password?: string;
  authHeader?: string;
  suppressSendErrors?: boolean;
  logger?: SynapseLogger;
  connectTimeoutMs?: number;
  e2ee?: {
    enabled?: boolean;
    daemonPublicKeyB64?: string;
  };
  reconnect?: {
    enabled?: boolean;
    baseDelayMs?: number;
    maxDelayMs?: number;
  };
  runtimeMetricsIntervalMs?: number;
  runtimeMetricsWindowMs?: number;
}

export type SynapseWorkspace = WorkspaceDescriptorPayload;
export type SynapseAgent = AgentSnapshotPayload;
export type SynapseWorkspaceListOptions = Omit<
  FetchWorkspacesRequestMessage,
  "type" | "requestId"
> & {
  requestId?: string;
};

export interface SynapseWorkspaceListResult {
  requestId: string;
  subscriptionId?: string | null;
  entries: SynapseWorkspace[];
  pageInfo: FetchWorkspacesResponseMessage["payload"]["pageInfo"];
}

export interface SynapseWorkspaceOpenOptions {
  cwd: string;
  requestId?: string;
}

export interface SynapseWorkspaceOpenResult {
  requestId: string;
  workspace: SynapseWorkspaceHandle | null;
  error: string | null;
}

export interface SynapseWorkspaceArchiveResult {
  requestId: string;
  workspaceId: string;
  archivedAt: string | null;
  error: string | null;
}

export type SynapseWorkspaceUpdate = Extract<
  SessionOutboundMessage,
  { type: "workspace_update" }
>["payload"];

export type SynapseWorkspaceUpdateHandler = (update: SynapseWorkspaceUpdate) => void;

/**
 * A handle is a stable typed reference to a daemon resource. Its identity is the
 * daemon id, and `latest()` only returns the most recent snapshot this handle has
 * seen through construction, `refetch()`, or this handle's local subscription.
 */
export interface SynapseWorkspaceHandle {
  readonly id: string;
  latest(): SynapseWorkspace | null;
  /**
   * Fetches a fresh workspace snapshot through the existing workspace list RPC,
   * exact-matches this handle id from the result, and updates `latest()`.
   */
  refetch(options?: { requestId?: string }): Promise<SynapseWorkspace | null>;
  archive(requestId?: string): Promise<SynapseWorkspaceArchiveResult>;
  /**
   * Subscribes to already-emitted daemon workspace_update events for this id.
   * This returns a local unsubscribe function; it does not own app cache state or
   * send a daemon unsubscribe RPC. Call `workspaces.list({ subscribe: {} })` when
   * the daemon should start streaming workspace directory updates.
   */
  subscribe(handler: (update: SynapseWorkspaceUpdate) => void): () => void;
}

export interface SynapseWorkspaceActions {
  list(options?: SynapseWorkspaceListOptions): Promise<SynapseWorkspaceListResult>;
  ref(workspace: string | SynapseWorkspace): SynapseWorkspaceHandle;
  open(
    input: string | SynapseWorkspaceOpenOptions,
    requestId?: string,
  ): Promise<SynapseWorkspaceOpenResult>;
  create(
    input: string | SynapseWorkspaceOpenOptions,
    requestId?: string,
  ): Promise<SynapseWorkspaceOpenResult>;
  archive(
    workspace: string | SynapseWorkspaceHandle,
    requestId?: string,
  ): Promise<SynapseWorkspaceArchiveResult>;
  /**
   * Local event subscription over the low-level driver's workspace_update stream.
   * The returned function only removes this SDK listener.
   */
  subscribe(handler: SynapseWorkspaceUpdateHandler): () => void;
}

type SynapseAgentSessionConfig = CreateAgentRequestMessage["config"];
type SynapseAgentProvider = SynapseAgentSessionConfig["provider"];
type SynapseAgentConfigOverrides = Partial<Omit<SynapseAgentSessionConfig, "provider" | "cwd">>;

export interface SynapseAgentCreateOptions extends SynapseAgentConfigOverrides {
  config?: SynapseAgentSessionConfig;
  provider?: CreateAgentRequestMessage["config"]["provider"];
  cwd?: string;
  workspaceId?: string;
  initialPrompt?: string;
  clientMessageId?: string;
  outputSchema?: Record<string, unknown>;
  images?: CreateAgentRequestMessage["images"];
  attachments?: CreateAgentRequestMessage["attachments"];
  git?: CreateAgentRequestMessage["git"];
  worktreeName?: string;
  requestId?: string;
  labels?: Record<string, string>;
}

export interface SynapseAgentRefetchResult {
  agent: SynapseAgent;
  project: ProjectPlacementPayload | null;
}

export interface SynapseAgentTimelineRefetchOptions {
  direction?: FetchAgentTimelineDirection;
  cursor?: FetchAgentTimelineCursor;
  limit?: number;
  projection?: FetchAgentTimelineProjection;
  requestId?: string;
}

export interface SynapseAgentSendOptions {
  messageId?: string;
  images?: Array<{ data: string; mimeType: string }>;
  attachments?: SendAgentMessageRequest["attachments"];
}

export type SynapseAgentUpdate = Extract<SessionOutboundMessage, { type: "agent_update" }>["payload"];

export type SynapseAgentStream = Extract<SessionOutboundMessage, { type: "agent_stream" }>["payload"];

export type SynapseAgentUpdateHandler = (update: SynapseAgentUpdate) => void;

export interface SynapseAgentTimelineHandle {
  /**
   * Fetches a fresh timeline page through the existing daemon RPC. If the daemon
   * includes an agent snapshot in the response, the parent handle's `latest()`
   * is updated to that snapshot.
   */
  refetch(options?: SynapseAgentTimelineRefetchOptions): Promise<FetchAgentTimelinePayload>;
  /**
   * Local listener for agent_stream events matching this handle id. It does not
   * retain timeline entries or own application cache state.
   */
  subscribe(handler: (event: SynapseAgentStream) => void): () => void;
}

/**
 * Agent handles follow the same identity/snapshot rule as workspace handles:
 * `id` is stable, while `latest()` is only the newest snapshot observed by this
 * handle through construction, `refetch()`, timeline refetch, archive, or local
 * agent_update subscription.
 */
export interface SynapseAgentHandle {
  readonly id: string;
  readonly timeline: SynapseAgentTimelineHandle;
  latest(): SynapseAgent | null;
  refetch(requestId?: string): Promise<SynapseAgentRefetchResult | null>;
  send(text: string, options?: SynapseAgentSendOptions): Promise<void>;
  archive(): Promise<{ archivedAt: string }>;
  subscribe(handler: (update: SynapseAgentUpdate) => void): () => void;
}

export interface SynapseAgentActions {
  ref(agent: string | SynapseAgent): SynapseAgentHandle;
  create(options: SynapseAgentCreateOptions): Promise<SynapseAgentHandle>;
  /**
   * Local event subscription over the low-level driver's agent_update stream.
   * The returned function only removes this SDK listener.
   */
  subscribe(handler: SynapseAgentUpdateHandler): () => void;
}

export interface SynapseProviderConfig extends SynapseProviderConfigInput {
  provider: SynapseAgentProvider;
}
export type SynapseProviderFeatureValues = Record<string, unknown>;

export interface SynapseProviderConfigInput {
  model?: string;
  modeId?: string;
  thinkingOptionId?: string;
  featureValues?: SynapseProviderFeatureValues;
}

export type SynapseProviderModelsResult = ListProviderModelsResponseMessage["payload"];
export type SynapseProviderModesResult = ListProviderModesResponseMessage["payload"];
export type SynapseProviderFeaturesInput = ListProviderFeaturesRequestMessage["draftConfig"];
export type SynapseProviderFeaturesResult = ListProviderFeaturesResponseMessage["payload"];
export type SynapseProviderAvailabilityResult = ListAvailableProvidersResponse["payload"];
export type SynapseProviderSnapshotResult = GetProvidersSnapshotResponseMessage["payload"];
export type SynapseProviderSnapshotUpdate = Extract<
  SessionOutboundMessage,
  { type: "providers_snapshot_update" }
>["payload"];
export type SynapseProviderRefreshResult = RefreshProvidersSnapshotResponseMessage["payload"];
export type SynapseProviderDiagnosticResult = ProviderDiagnosticResponseMessage["payload"];

export interface SynapseProviderListOptions {
  cwd?: string;
  requestId?: string;
}

export interface SynapseProviderRefreshOptions {
  cwd?: string;
  providers?: SynapseAgentProvider[];
  requestId?: string;
}

export interface SynapseProviderActions {
  codex(input?: SynapseProviderConfigInput): SynapseProviderConfig;
  claude(input?: SynapseProviderConfigInput): SynapseProviderConfig;
  opencode(input?: SynapseProviderConfigInput): SynapseProviderConfig;
  copilot(input?: SynapseProviderConfigInput): SynapseProviderConfig;
  config(provider: SynapseAgentProvider, input?: SynapseProviderConfigInput): SynapseProviderConfig;
  listModels(
    provider: SynapseAgentProvider,
    options?: SynapseProviderListOptions,
  ): Promise<SynapseProviderModelsResult>;
  listModes(
    provider: SynapseAgentProvider,
    options?: SynapseProviderListOptions,
  ): Promise<SynapseProviderModesResult>;
  listFeatures(
    draftConfig: SynapseProviderFeaturesInput,
    options?: { requestId?: string },
  ): Promise<SynapseProviderFeaturesResult>;
  listAvailable(options?: { requestId?: string }): Promise<SynapseProviderAvailabilityResult>;
  snapshot(options?: SynapseProviderListOptions): Promise<SynapseProviderSnapshotResult>;
  refresh(options?: SynapseProviderRefreshOptions): Promise<SynapseProviderRefreshResult>;
  diagnostic(
    provider: SynapseAgentProvider,
    options?: { requestId?: string },
  ): Promise<SynapseProviderDiagnosticResult>;
  subscribe(handler: (update: SynapseProviderSnapshotUpdate) => void): () => void;
}

export interface SynapseConfigActions {
  /**
   * Reads daemon config through the existing config RPC. Provider profiles,
   * custom provider entries, keys/env, custom binaries, and provider enablement
   * are currently config-file-shaped daemon state, so the SDK exposes this raw
   * typed surface instead of pretending there are higher-level provider-settings
   * RPCs.
   */
  get(requestId?: string): Promise<{ requestId: string; config: MutableDaemonConfig }>;
  /**
   * Patches daemon config through the existing config RPC. The daemon validates
   * and persists supported fields; unsupported provider/settings workflows remain
   * daemon gaps until first-class RPCs exist.
   */
  patch(
    config: MutableDaemonConfigPatch,
    requestId?: string,
  ): Promise<{ requestId: string; config: MutableDaemonConfig }>;
}

export interface SynapseClient {
  readonly workspaces: SynapseWorkspaceActions;
  readonly agents: SynapseAgentActions;
  readonly providers: SynapseProviderActions;
  readonly config: SynapseConfigActions;
  connect(): Promise<void>;
  close(): Promise<void>;
  ensureConnected(): void;
  getConnectionState(): ConnectionState;
}

export function createSynapseClient(config: SynapseClientConfig): SynapseClient {
  const daemonClient = new DaemonClient({
    ...config,
    clientId: config.clientId ?? createGeneratedClientId(),
    clientType: "cli",
  });
  const createWorkspaceHandle = createWorkspaceHandleFactory(daemonClient);
  const createAgentHandle = createAgentHandleFactory(daemonClient);

  return {
    workspaces: {
      list: (options) => daemonClient.fetchWorkspaces(options),
      ref: (workspace) => createWorkspaceHandle(workspace),
      open: (input, requestId) =>
        openWorkspace(daemonClient, createWorkspaceHandle, input, requestId),
      create: (input, requestId) =>
        openWorkspace(daemonClient, createWorkspaceHandle, input, requestId),
      archive: (workspace, requestId) =>
        daemonClient.archiveWorkspace(resolveWorkspaceId(workspace), requestId),
      subscribe: (handler) =>
        daemonClient.on("workspace_update", (message) => {
          handler(message.payload);
        }),
    },
    agents: {
      ref: (agent) => createAgentHandle(agent),
      create: async (options) => {
        const agent = await daemonClient.createAgent(options);
        return createAgentHandle(agent);
      },
      subscribe: (handler) =>
        daemonClient.on("agent_update", (message) => {
          handler(message.payload);
        }),
    },
    providers: {
      codex: (input) => providerConfig("codex", input),
      claude: (input) => providerConfig("claude", input),
      opencode: (input) => providerConfig("opencode", input),
      copilot: (input) => providerConfig("copilot", input),
      config: (provider, input) => providerConfig(provider, input),
      listModels: (provider, options) => daemonClient.listProviderModels(provider, options),
      listModes: (provider, options) => daemonClient.listProviderModes(provider, options),
      listFeatures: (draftConfig, options) =>
        daemonClient.listProviderFeatures(draftConfig, options),
      listAvailable: (options) => daemonClient.listAvailableProviders(options),
      snapshot: (options) => daemonClient.getProvidersSnapshot(options),
      refresh: (options) => daemonClient.refreshProvidersSnapshot(options),
      diagnostic: (provider, options) => daemonClient.getProviderDiagnostic(provider, options),
      subscribe: (handler) =>
        daemonClient.on("providers_snapshot_update", (message) => {
          handler(message.payload);
        }),
    },
    config: {
      get: (requestId) => daemonClient.getDaemonConfig(requestId),
      patch: (patch, requestId) => daemonClient.patchDaemonConfig(patch, requestId),
    },
    connect: () => daemonClient.connect(),
    close: () => daemonClient.close(),
    ensureConnected: () => daemonClient.ensureConnected(),
    getConnectionState: () => daemonClient.getConnectionState(),
  };
}

type WorkspaceHandleFactory = (workspace: string | SynapseWorkspace) => SynapseWorkspaceHandle;
type AgentHandleFactory = (agent: string | SynapseAgent) => SynapseAgentHandle;

function createWorkspaceHandleFactory(daemonClient: DaemonClient): WorkspaceHandleFactory {
  return (workspace) => {
    const id = typeof workspace === "string" ? workspace : workspace.id;
    let latest = typeof workspace === "string" ? null : workspace;

    return {
      id,
      latest: () => latest,
      refetch: async (options) => {
        const result = await daemonClient.fetchWorkspaces({
          requestId: options?.requestId,
          filter: { idPrefix: id },
          page: { limit: 25 },
        });
        latest = result.entries.find((entry) => entry.id === id) ?? null;
        return latest;
      },
      archive: async (requestId) => {
        const result = await daemonClient.archiveWorkspace(id, requestId);
        if (latest) {
          latest = { ...latest, archivingAt: result.archivedAt };
        }
        return result;
      },
      subscribe: (handler) =>
        daemonClient.on("workspace_update", (message) => {
          const update = message.payload;
          if (update.kind === "upsert" && update.workspace.id === id) {
            latest = update.workspace;
            handler(update);
          }
          if (update.kind === "remove" && update.id === id) {
            latest = null;
            handler(update);
          }
        }),
    };
  };
}

function createAgentHandleFactory(daemonClient: DaemonClient): AgentHandleFactory {
  return (agent) => {
    const id = typeof agent === "string" ? agent : agent.id;
    let latest = typeof agent === "string" ? null : agent;

    const handle: SynapseAgentHandle = {
      id,
      timeline: {
        refetch: async (options) => {
          const result = await daemonClient.fetchAgentTimeline(id, options);
          if (result.agent) {
            latest = result.agent;
          }
          return result;
        },
        subscribe: (handler) =>
          daemonClient.on("agent_stream", (message) => {
            if (message.payload.agentId === id) {
              handler(message.payload);
            }
          }),
      },
      latest: () => latest,
      refetch: async (requestId) => {
        const result = await daemonClient.fetchAgent(id, requestId);
        latest = result?.agent ?? null;
        return result;
      },
      send: (text, options) => daemonClient.sendAgentMessage(id, text, options),
      archive: async () => {
        const result = await daemonClient.archiveAgent(id);
        if (latest) {
          latest = { ...latest, archivedAt: result.archivedAt };
        }
        return result;
      },
      subscribe: (handler) =>
        daemonClient.on("agent_update", (message) => {
          const update = message.payload;
          if (update.kind === "upsert" && update.agent.id === id) {
            latest = update.agent;
            handler(update);
          }
          if (update.kind === "remove" && update.agentId === id) {
            latest = null;
            handler(update);
          }
        }),
    };

    return handle;
  };
}

async function openWorkspace(
  daemonClient: DaemonClient,
  createWorkspaceHandle: WorkspaceHandleFactory,
  input: string | SynapseWorkspaceOpenOptions,
  requestId?: string,
): Promise<SynapseWorkspaceOpenResult> {
  const options = typeof input === "string" ? { cwd: input, requestId } : input;
  const result = await daemonClient.openProject(options.cwd, options.requestId);
  return {
    ...result,
    workspace: result.workspace ? createWorkspaceHandle(result.workspace) : null,
  };
}

function resolveWorkspaceId(workspace: string | SynapseWorkspaceHandle): string {
  return typeof workspace === "string" ? workspace : workspace.id;
}

function providerConfig(
  provider: SynapseAgentProvider,
  input: SynapseProviderConfigInput = {},
): SynapseProviderConfig {
  return {
    provider,
    ...(input.model !== undefined ? { model: input.model } : {}),
    ...(input.modeId !== undefined ? { modeId: input.modeId } : {}),
    ...(input.thinkingOptionId !== undefined ? { thinkingOptionId: input.thinkingOptionId } : {}),
    ...(input.featureValues !== undefined ? { featureValues: input.featureValues } : {}),
  };
}

function createGeneratedClientId(): string {
  const randomId =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `synapse-sdk-${randomId}`;
}
