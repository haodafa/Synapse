import { SynapseClient } from "@synapse/client";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import {
  KanbanBoard,
  Issue,
  IssueStatus,
  Project,
  Skill,
  Squad,
  SquadMember,
  ChatMessage,
  Provider,
  RelayPeer,
  ScheduledTask,
  WebhookEvent,
  SpeechRecognitionResult,
} from "@synapse/protocol";

interface UseSynapseClientReturn {
  client: SynapseClient | null;
  isConnected: boolean;
  error: string | null;
}

export function useSynapseClient(daemonUrl?: string): UseSynapseClientReturn {
  const [client, setClient] = useState<SynapseClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!daemonUrl) return;

    const synapseClient = new SynapseClient({
      baseUrl: daemonUrl,
      wsProtocol: "ws",
      reconnectAttempts: 5,
      reconnectInterval: 3000,
    });

    synapseClient.onConnect(() => setIsConnected(true));
    synapseClient.onDisconnect(() => setIsConnected(false));
    synapseClient.onError((err) => setError(err.message));

    setClient(synapseClient);

    return () => {
      synapseClient.disconnect();
    };
  }, [daemonUrl]);

  return { client, isConnected, error };
}

export function useSpeechSynthesis() {
  const speak = useCallback(async (text: string, options?: {
    language?: string;
    rate?: number;
    pitch?: number;
  }) => {
    try {
      await Speech.speak(text, {
        language: options?.language ?? "en-US",
        rate: options?.rate ?? 1.0,
        pitch: options?.pitch ?? 1.0,
      });
    } catch (err) {
      console.error("Speech synthesis error:", err);
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      await Speech.stop();
    } catch (err) {
      console.error("Speech stop error:", err);
    }
  }, []);

  return { speak, stop };
}

export function useHaptics() {
  const impact = useCallback((style: "light" | "medium" | "heavy" = "medium") => {
    const styles = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    };
    Haptics.impactAsync(styles[style]);
  }, []);

  const notification = useCallback((type: "success" | "warning" | "error" = "success") => {
    const types = {
      success: Haptics.NotificationFeedbackType.Success,
      warning: Haptics.NotificationFeedbackType.Warning,
      error: Haptics.NotificationFeedbackType.Error,
    };
    Haptics.notificationAsync(types[type]);
  }, []);

  return { impact, notification };
}

export { KanbanBoard, Issue, IssueStatus, Project, Skill, Squad, SquadMember, ChatMessage, Provider, RelayPeer, ScheduledTask, WebhookEvent, SpeechRecognitionResult };
