import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useHaptics, useSpeechSynthesis } from "../../hooks/use-synapse-client";

interface Agent {
  id: string;
  name: string;
  status: "online" | "offline" | "busy";
  model?: string;
  provider?: string;
  lastActive?: Date;
  skills?: string[];
}

interface AgentCardProps {
  agent: Agent;
  onPress?: () => void;
  onVoiceCommand?: () => void;
  onStartChat?: () => void;
}

function AgentCard({ agent, onPress, onVoiceCommand, onStartChat }: AgentCardProps) {
  const { impact } = useHaptics();
  const statusColors = {
    online: "#10B981",
    offline: "#6B7280",
    busy: "#F59E0B",
  };

  const handlePress = useCallback(() => {
    impact("light");
    onPress?.();
  }, [impact, onPress]);

  return (
    <TouchableOpacity style={styles.agentCard} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.agentHeader}>
        <View style={styles.agentAvatar}>
          <Text style={styles.agentAvatarText}>
            {agent.name?.charAt(0)?.toUpperCase() ?? "A"}
          </Text>
          <View
            style={[styles.statusDot, { backgroundColor: statusColors[agent.status] }]}
          />
        </View>
        <View style={styles.agentInfo}>
          <Text style={styles.agentName}>{agent.name}</Text>
          <View style={styles.agentMeta}>
            {agent.model && (
              <Text style={styles.agentModel}>{agent.model}</Text>
            )}
            {agent.provider && (
              <>
                <Text style={styles.metaSeparator}>•</Text>
                <Text style={styles.agentProvider}>{agent.provider}</Text>
              </>
            )}
          </View>
        </View>
      </View>
      {agent.skills && agent.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          {agent.skills.slice(0, 3).map((skill, idx) => (
            <View key={idx} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {agent.skills.length > 3 && (
            <View style={[styles.skillBadge, styles.moreSkillsBadge]}>
              <Text style={styles.moreSkillsText}>+{agent.skills.length - 3}</Text>
            </View>
          )}
        </View>
      )}
      <View style={styles.agentActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onVoiceCommand}>
          <Ionicons name="mic-outline" size={20} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.chatButton} onPress={onStartChat}>
          <Ionicons name="chatbubbles-outline" size={18} color="#FFFFFF" />
          <Text style={styles.chatButtonText}>Chat</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

interface AgentsListScreenProps {
  onAgentPress?: (agent: Agent) => void;
  onCreateAgent?: () => void;
}

export function AgentsListScreen({ onAgentPress, onCreateAgent }: AgentsListScreenProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [selectedModel, setSelectedModel] = useState("claude-sonnet-4");
  const { impact, notification } = useHaptics();
  const { speak, stop } = useSpeechSynthesis();

  const models = [
    { id: "claude-sonnet-4", name: "Claude Sonnet 4", provider: "Anthropic" },
    { id: "claude-opus-4", name: "Claude Opus 4", provider: "Anthropic" },
    { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI" },
    { id: "gemini-pro", name: "Gemini Pro", provider: "Google" },
  ];

  const loadAgents = useCallback(async () => {
    setAgents([
      {
        id: "1",
        name: "Code Assistant",
        status: "online",
        model: "Claude Sonnet 4",
        provider: "Anthropic",
        skills: ["coding", "debugging", "refactoring"],
      },
      {
        id: "2",
        name: "Writing Assistant",
        status: "online",
        model: "GPT-4o",
        provider: "OpenAI",
        skills: ["writing", "editing", "translation"],
      },
      {
        id: "3",
        name: "Analysis Agent",
        status: "busy",
        model: "Claude Opus 4",
        provider: "Anthropic",
        skills: ["data analysis", "research", "reporting"],
      },
    ]);
  }, []);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    impact("light");
    await loadAgents();
    setIsRefreshing(false);
    notification("success");
  }, [loadAgents, impact, notification]);

  const handleVoiceCommand = useCallback(async () => {
    impact("medium");
    setIsListening(true);
    await speak("Listening for voice command...");
    setTimeout(async () => {
      stop();
      setIsListening(false);
      notification("success");
    }, 3000);
  }, [impact, speak, stop, notification]);

  const handleCreateAgent = useCallback(async () => {
    if (!newAgentName.trim()) return;
    const newAgent: Agent = {
      id: Date.now().toString(),
      name: newAgentName.trim(),
      status: "online",
      model: models.find((m) => m.id === selectedModel)?.name,
      provider: models.find((m) => m.id === selectedModel)?.provider,
    };
    setAgents((prev) => [...prev, newAgent]);
    setNewAgentName("");
    setShowCreateModal(false);
    notification("success");
  }, [newAgentName, selectedModel, notification]);

  const filteredAgents = agents.filter((agent) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        agent.name?.toLowerCase().includes(query) ||
        agent.model?.toLowerCase().includes(query) ||
        agent.provider?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const onlineCount = agents.filter((a) => a.status === "online").length;
  const busyCount = agents.filter((a) => a.status === "busy").length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Agents</Text>
          <TouchableOpacity
            style={[styles.createButton, isListening && styles.listeningButton]}
            onPress={handleVoiceCommand}
          >
            <Ionicons
              name={isListening ? "mic" : "mic-outline"}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search agents..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.onlineStat]}>
            <View style={styles.statDot} />
            <Text style={styles.statValue}>{onlineCount}</Text>
            <Text style={styles.statLabel}>Online</Text>
          </View>
          <View style={[styles.statCard, styles.busyStat]}>
            <View style={styles.statDot} />
            <Text style={styles.statValue}>{busyCount}</Text>
            <Text style={styles.statLabel}>Busy</Text>
          </View>
          <View style={[styles.statCard, styles.offlineStat]}>
            <View style={styles.statDot} />
            <Text style={styles.statValue}>{agents.length - onlineCount - busyCount}</Text>
            <Text style={styles.statLabel}>Offline</Text>
          </View>
        </View>
      </View>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#3B82F6" />
        }
      >
        {filteredAgents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onPress={() => onAgentPress?.(agent)}
            onVoiceCommand={handleVoiceCommand}
            onStartChat={() => {}}
          />
        ))}
        <TouchableOpacity style={styles.addAgentCard} onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add-circle-outline" size={32} color="#3B82F6" />
          <Text style={styles.addAgentText}>Add New Agent</Text>
        </TouchableOpacity>
      </ScrollView>
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Agent</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Agent name"
              placeholderTextColor="#6B7280"
              value={newAgentName}
              onChangeText={setNewAgentName}
            />
            <Text style={styles.modalLabel}>Select Model</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modelsContainer}>
              {models.map((model) => (
                <TouchableOpacity
                  key={model.id}
                  style={[
                    styles.modelCard,
                    selectedModel === model.id && styles.modelCardSelected,
                  ]}
                  onPress={() => setSelectedModel(model.id)}
                >
                  <Text style={styles.modelName}>{model.name}</Text>
                  <Text style={styles.modelProvider}>{model.provider}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, !newAgentName.trim() && styles.submitButtonDisabled]}
                onPress={handleCreateAgent}
                disabled={!newAgentName.trim()}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#1F2937",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  listeningButton: {
    backgroundColor: "#10B981",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#374151",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: "#F9FAFB",
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onlineStat: {
    backgroundColor: "#064E3B",
  },
  busyStat: {
    backgroundColor: "#78350F",
  },
  offlineStat: {
    backgroundColor: "#374151",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  statLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  agentCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  agentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  agentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  agentAvatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statusDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#1F2937",
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F9FAFB",
  },
  agentMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  agentModel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  metaSeparator: {
    fontSize: 12,
    color: "#6B7280",
    marginHorizontal: 6,
  },
  agentProvider: {
    fontSize: 12,
    color: "#6B7280",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  skillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#374151",
  },
  skillText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  moreSkillsBadge: {
    backgroundColor: "#1E3A5F",
  },
  moreSkillsText: {
    fontSize: 11,
    color: "#3B82F6",
    fontWeight: "600",
  },
  agentActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#3B82F6",
    borderRadius: 18,
  },
  chatButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  addAgentCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#374151",
    borderStyle: "dashed",
  },
  addAgentText: {
    fontSize: 14,
    color: "#3B82F6",
    marginTop: 8,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1F2937",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#F9FAFB",
  },
  modalInput: {
    backgroundColor: "#374151",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#F9FAFB",
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F9FAFB",
    marginBottom: 12,
  },
  modelsContainer: {
    marginBottom: 20,
  },
  modelCard: {
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    minWidth: 120,
  },
  modelCardSelected: {
    backgroundColor: "#1E3A5F",
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
  modelName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F9FAFB",
  },
  modelProvider: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#374151",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  submitButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#1E3A5F",
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
