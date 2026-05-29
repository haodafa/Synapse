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
import { Squad, SquadMember } from "@synapse/protocol";
import { useSynapseClient, useHaptics } from "../../hooks/use-synapse-client";

interface SquadCardProps {
  squad: Squad;
  onPress?: () => void;
  onManageMembers?: () => void;
}

function SquadCard({ squad, onPress, onManageMembers }: SquadCardProps) {
  const { impact } = useHaptics();

  const handlePress = useCallback(() => {
    impact("light");
    onPress?.();
  }, [impact, onPress]);

  const roleColors: Record<string, string> = {
    lead: "#F59E0B",
    advisor: "#8B5CF6",
    member: "#3B82F6",
  };

  return (
    <TouchableOpacity style={styles.squadCard} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.squadHeader}>
        <View style={[styles.squadIcon, { backgroundColor: squad.color ?? "#3B82F6" }]}>
          <Text style={styles.squadIconText}>
            {squad.name?.charAt(0)?.toUpperCase() ?? "S"}
          </Text>
        </View>
        <View style={styles.squadInfo}>
          <Text style={styles.squadName}>{squad.name}</Text>
          <Text style={styles.squadDescription} numberOfLines={1}>
            {squad.description ?? "No description"}
          </Text>
        </View>
        <View style={styles.memberCount}>
          <Ionicons name="people-outline" size={16} color="#9CA3AF" />
          <Text style={styles.memberCountText}>{squad.members?.length ?? 0}</Text>
        </View>
      </View>
      <View style={styles.squadFooter}>
        <View style={styles.membersPreview}>
          {squad.members?.slice(0, 4).map((member, idx) => (
            <View
              key={member.id}
              style={[
                styles.memberAvatar,
                { marginLeft: idx > 0 ? -8 : 0, backgroundColor: roleColors[member.role] ?? "#6B7280" },
              ]}
            >
              <Text style={styles.memberAvatarText}>
                {member.name?.charAt(0)?.toUpperCase() ?? "?"}
              </Text>
            </View>
          ))}
          {(squad.members?.length ?? 0) > 4 && (
            <View style={[styles.memberAvatar, { marginLeft: -8, backgroundColor: "#374151" }]}>
              <Text style={styles.memberAvatarText}>+{squad.members!.length - 4}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.manageButton} onPress={onManageMembers}>
          <Ionicons name="settings-outline" size={16} color="#9CA3AF" />
          <Text style={styles.manageButtonText}>Manage</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

interface SquadsScreenProps {
  onSquadPress?: (squad: Squad) => void;
}

export function SquadsScreen({ onSquadPress }: SquadsScreenProps) {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSquadName, setNewSquadName] = useState("");
  const [newSquadDescription, setNewSquadDescription] = useState("");
  const { client } = useSynapseClient();
  const { impact, notification } = useHaptics();

  const loadSquads = useCallback(async () => {
    if (!client) return;
    try {
      const fetchedSquads = await client.squads.list();
      setSquads(fetchedSquads);
    } catch (error) {
      console.error("Failed to load squads:", error);
    }
  }, [client]);

  useEffect(() => {
    loadSquads();
  }, [loadSquads]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    impact("light");
    await loadSquads();
    setIsRefreshing(false);
    notification("success");
  }, [loadSquads, impact, notification]);

  const handleCreateSquad = useCallback(async () => {
    if (!client || !newSquadName.trim()) return;
    try {
      await client.squads.create({
        name: newSquadName.trim(),
        description: newSquadDescription.trim(),
      });
      setNewSquadName("");
      setNewSquadDescription("");
      setShowCreateModal(false);
      await loadSquads();
      notification("success");
    } catch (error) {
      console.error("Failed to create squad:", error);
      Alert.alert("Error", "Failed to create squad");
    }
  }, [client, newSquadName, newSquadDescription, loadSquads, notification]);

  const filteredSquads = squads.filter((squad) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        squad.name?.toLowerCase().includes(query) ||
        squad.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Squads</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search squads..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{squads.length}</Text>
            <Text style={styles.statLabel}>Total Squads</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {squads.reduce((acc, squad) => acc + (squad.members?.length ?? 0), 0)}
            </Text>
            <Text style={styles.statLabel}>Total Members</Text>
          </View>
        </View>
      </View>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#3B82F6" />
        }
      >
        {filteredSquads.map((squad) => (
          <SquadCard
            key={squad.id}
            squad={squad}
            onPress={() => onSquadPress?.(squad)}
            onManageMembers={() => {}}
          />
        ))}
        {filteredSquads.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#374151" />
            <Text style={styles.emptyTitle}>No squads found</Text>
            <Text style={styles.emptyDescription}>
              Create a squad to start collaborating with your team
            </Text>
            <TouchableOpacity
              style={styles.createFirstButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.createFirstButtonText}>Create Squad</Text>
            </TouchableOpacity>
          </View>
        )}
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
              <Text style={styles.modalTitle}>Create Squad</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Squad name"
              placeholderTextColor="#6B7280"
              value={newSquadName}
              onChangeText={setNewSquadName}
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Description (optional)"
              placeholderTextColor="#6B7280"
              value={newSquadDescription}
              onChangeText={setNewSquadDescription}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, !newSquadName.trim() && styles.submitButtonDisabled]}
                onPress={handleCreateSquad}
                disabled={!newSquadName.trim()}
              >
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
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  statLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  squadCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  squadHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  squadIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  squadIconText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  squadInfo: {
    flex: 1,
  },
  squadName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F9FAFB",
  },
  squadDescription: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  memberCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#374151",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memberCountText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  squadFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  membersPreview: {
    flexDirection: "row",
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1F2937",
  },
  memberAvatarText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  manageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#374151",
    borderRadius: 16,
  },
  manageButtonText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#F9FAFB",
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  createFirstButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#3B82F6",
    borderRadius: 24,
  },
  createFirstButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
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
    marginBottom: 12,
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
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
