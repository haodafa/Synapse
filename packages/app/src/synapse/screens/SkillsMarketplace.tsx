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
import { Skill } from "@synapse/protocol";
import { useSynapseClient, useHaptics } from "../../hooks/use-synapse-client";

interface SkillCardProps {
  skill: Skill;
  onPress?: () => void;
  onInstall?: () => void;
  onUninstall?: () => void;
  isInstalled?: boolean;
}

function SkillCard({ skill, onPress, onInstall, onUninstall, isInstalled }: SkillCardProps) {
  const { impact } = useHaptics();

  const handlePress = useCallback(() => {
    impact("light");
    onPress?.();
  }, [impact, onPress]);

  const handleInstall = useCallback(() => {
    impact("medium");
    onInstall?.();
  }, [impact, onInstall]);

  return (
    <TouchableOpacity style={styles.skillCard} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.skillHeader}>
        <View style={styles.skillIconContainer}>
          <Text style={styles.skillIcon}>{skill.icon ?? "⚡"}</Text>
        </View>
        <View style={styles.skillInfo}>
          <Text style={styles.skillName}>{skill.name}</Text>
          <Text style={styles.skillVersion}>v{skill.version ?? "1.0.0"}</Text>
        </View>
        <TouchableOpacity
          style={[styles.installButton, isInstalled && styles.installedButton]}
          onPress={isInstalled ? onUninstall : handleInstall}
        >
          <Text style={[styles.installButtonText, isInstalled && styles.installedButtonText]}>
            {isInstalled ? "Installed" : "Install"}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.skillDescription} numberOfLines={2}>
        {skill.description ?? "No description available"}
      </Text>
      <View style={styles.skillFooter}>
        <View style={styles.skillStats}>
          <View style={styles.statItem}>
            <Ionicons name="download-outline" size={14} color="#6B7280" />
            <Text style={styles.statText}>{skill.downloads ?? 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="star-outline" size={14} color="#F59E0B" />
            <Text style={styles.statText}>{skill.rating ?? 0}</Text>
          </View>
        </View>
        {skill.tags && skill.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {skill.tags.slice(0, 3).map((tag, idx) => (
              <View key={idx} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

interface SkillsMarketplaceProps {
  onSkillPress?: (skill: Skill) => void;
}

export function SkillsMarketplace({ onSkillPress }: SkillsMarketplaceProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [installedSkills, setInstalledSkills] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { client } = useSynapseClient();
  const { impact, notification } = useHaptics();

  const categories = [
    { key: "all", label: "All", icon: "apps-outline" },
    { key: "coding", label: "Coding", icon: "code-slash-outline" },
    { key: "writing", label: "Writing", icon: "create-outline" },
    { key: "analysis", label: "Analysis", icon: "analytics-outline" },
    { key: "automation", label: "Automation", icon: "settings-outline" },
    { key: "communication", label: "Communication", icon: "chatbubbles-outline" },
  ];

  const loadSkills = useCallback(async () => {
    if (!client) return;
    try {
      const fetchedSkills = await client.skills.list({ category: undefined });
      setSkills(fetchedSkills);
    } catch (error) {
      console.error("Failed to load skills:", error);
    }
  }, [client]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    impact("light");
    await loadSkills();
    setIsRefreshing(false);
    notification("success");
  }, [loadSkills, impact, notification]);

  const handleInstallSkill = useCallback(
    async (skillId: string) => {
      if (!client) return;
      try {
        await client.skills.install(skillId);
        setInstalledSkills((prev) => new Set([...prev, skillId]));
        notification("success");
      } catch (error) {
        console.error("Failed to install skill:", error);
        Alert.alert("Error", "Failed to install skill");
      }
    },
    [client, notification]
  );

  const handleUninstallSkill = useCallback(
    async (skillId: string) => {
      if (!client) return;
      Alert.alert("Uninstall Skill", "Are you sure you want to uninstall this skill?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Uninstall",
          style: "destructive",
          onPress: async () => {
            try {
              await client.skills.uninstall(skillId);
              setInstalledSkills((prev) => {
                const next = new Set(prev);
                next.delete(skillId);
                return next;
              });
              notification("success");
            } catch (error) {
              console.error("Failed to uninstall skill:", error);
              Alert.alert("Error", "Failed to uninstall skill");
            }
          },
        },
      ]);
    },
    [client, notification]
  );

  const filteredSkills = skills.filter((skill) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !skill.name.toLowerCase().includes(query) &&
        !skill.description?.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (selectedCategory !== "all" && skill.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Skills Marketplace</Text>
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
            placeholder="Search skills..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryButton,
                selectedCategory === category.key && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Ionicons
                name={category.icon as keyof typeof Ionicons.glyphMap}
                size={16}
                color={selectedCategory === category.key ? "#3B82F6" : "#9CA3AF"}
              />
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category.key && styles.categoryButtonTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#3B82F6" />
        }
      >
        {filteredSkills.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            onPress={() => onSkillPress?.(skill)}
            onInstall={() => handleInstallSkill(skill.id)}
            onUninstall={() => handleUninstallSkill(skill.id)}
            isInstalled={installedSkills.has(skill.id)}
          />
        ))}
        {filteredSkills.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="construct-outline" size={48} color="#374151" />
            <Text style={styles.emptyTitle}>No skills found</Text>
            <Text style={styles.emptyDescription}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}
      </ScrollView>
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
  categoriesContainer: {
    flexDirection: "row",
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#374151",
    marginRight: 8,
    gap: 4,
  },
  categoryButtonActive: {
    backgroundColor: "#1E3A5F",
  },
  categoryButtonText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  categoryButtonTextActive: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  skillCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  skillHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  skillIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  skillIcon: {
    fontSize: 24,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F9FAFB",
  },
  skillVersion: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  installButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#3B82F6",
  },
  installedButton: {
    backgroundColor: "#374151",
  },
  installButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  installedButtonText: {
    color: "#9CA3AF",
  },
  skillDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 12,
    lineHeight: 20,
  },
  skillFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skillStats: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#6B7280",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "#374151",
  },
  tagText: {
    fontSize: 10,
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
  },
});
