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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { KanbanBoard } from "../../components/KanbanBoard";
import { Issue, IssueStatus } from "@synapse/protocol";
import { useSynapseClient, useHaptics } from "../../hooks/use-synapse-client";

interface KanbanScreenProps {
  projectId?: string;
  onIssuePress?: (issue: Issue) => void;
}

export function KanbanScreen({ projectId, onIssuePress }: KanbanScreenProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "mine" | "unassigned">("all");
  const { client } = useSynapseClient();
  const { impact, notification } = useHaptics();

  const loadIssues = useCallback(async () => {
    if (!client) return;
    try {
      const fetchedIssues = await client.issues.list({ projectId, status: undefined });
      setIssues(fetchedIssues);
    } catch (error) {
      console.error("Failed to load issues:", error);
      Alert.alert("Error", "Failed to load issues");
    }
  }, [client, projectId]);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    impact("light");
    await loadIssues();
    setIsRefreshing(false);
    notification("success");
  }, [loadIssues, impact, notification]);

  const handleIssueMove = useCallback(
    async (issue: Issue, newStatus: IssueStatus) => {
      if (!client) return;
      try {
        await client.issues.update(issue.id, { status: newStatus });
        setIssues((prev) =>
          prev.map((i) => (i.id === issue.id ? { ...i, status: newStatus } : i))
        );
        notification("success");
      } catch (error) {
        console.error("Failed to move issue:", error);
        Alert.alert("Error", "Failed to move issue");
      }
    },
    [client, notification]
  );

  const filteredIssues = issues.filter((issue) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !issue.title.toLowerCase().includes(query) &&
        !issue.description?.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (selectedFilter === "mine" && issue.assignee) {
      return true;
    }
    if (selectedFilter === "unassigned" && !issue.assignee) {
      return true;
    }
    return selectedFilter === "all";
  });

  const filterButtons = [
    { key: "all", label: "All", icon: "apps-outline" },
    { key: "mine", label: "Mine", icon: "person-outline" },
    { key: "unassigned", label: "Unassigned", icon: "help-circle-outline" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Kanban Board</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => {}}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search issues..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.filterContainer}>
          {filterButtons.map((button) => (
            <TouchableOpacity
              key={button.key}
              style={[
                styles.filterButton,
                selectedFilter === button.key && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(button.key as typeof selectedFilter)}
            >
              <Ionicons
                name={button.icon as keyof typeof Ionicons.glyphMap}
                size={16}
                color={selectedFilter === button.key ? "#3B82F6" : "#9CA3AF"}
              />
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === button.key && styles.filterButtonTextActive,
                ]}
              >
                {button.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <KanbanBoard
        issues={filteredIssues}
        onIssuePress={onIssuePress}
        onIssueMove={handleIssueMove}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
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
    paddingBottom: 8,
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
  addButton: {
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
  filterContainer: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#374151",
    gap: 4,
  },
  filterButtonActive: {
    backgroundColor: "#1E3A5F",
  },
  filterButtonText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  filterButtonTextActive: {
    color: "#3B82F6",
    fontWeight: "600",
  },
});
