import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { KanbanScreen } from "./screens/KanbanScreen";
import { SkillsMarketplace } from "./screens/SkillsMarketplace";
import { SquadsScreen } from "./screens/SquadsScreen";
import { AgentsListScreen } from "./screens/AgentsListScreen";

type TabKey = "agents" | "kanban" | "skills" | "squads" | "settings";

interface TabConfig {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}

const tabs: TabConfig[] = [
  { key: "agents", label: "Agents", icon: "robot-outline", activeIcon: "robot" },
  { key: "kanban", label: "Board", icon: "grid-outline", activeIcon: "grid" },
  { key: "skills", label: "Skills", icon: "extension-puzzle-outline", activeIcon: "extension-puzzle" },
  { key: "squads", label: "Teams", icon: "people-outline", activeIcon: "people" },
  { key: "settings", label: "Settings", icon: "settings-outline", activeIcon: "settings" },
];

export function SynapseTabNavigator() {
  const [activeTab, setActiveTab] = useState<TabKey>("agents");

  const renderScreen = () => {
    switch (activeTab) {
      case "agents":
        return <AgentsListScreen />;
      case "kanban":
        return <KanbanScreen />;
      case "skills":
        return <SkillsMarketplace />;
      case "squads":
        return <SquadsScreen />;
      case "settings":
        return <SettingsPlaceholder />;
      default:
        return <AgentsListScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <View style={styles.content}>{renderScreen()}</View>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab.key)}
          >
            <View
              style={[
                styles.tabIconContainer,
                activeTab === tab.key && styles.tabIconContainerActive,
              ]}
            >
              <Ionicons
                name={activeTab === tab.key ? tab.activeIcon : tab.icon}
                size={22}
                color={activeTab === tab.key ? "#3B82F6" : "#9CA3AF"}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

function SettingsPlaceholder() {
  return (
    <View style={settingsStyles.container}>
      <View style={settingsStyles.header}>
        <Text style={settingsStyles.headerTitle}>Settings</Text>
      </View>
      <View style={settingsStyles.content}>
        <View style={settingsStyles.section}>
          <Text style={settingsStyles.sectionTitle}>Account</Text>
          <TouchableOpacity style={settingsStyles.settingItem}>
            <Ionicons name="person-outline" size={22} color="#9CA3AF" />
            <Text style={settingsStyles.settingText}>Profile</Text>
            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={settingsStyles.settingItem}>
            <Ionicons name="key-outline" size={22} color="#9CA3AF" />
            <Text style={settingsStyles.settingText}>API Keys</Text>
            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <View style={settingsStyles.section}>
          <Text style={settingsStyles.sectionTitle}>Providers</Text>
          <TouchableOpacity style={settingsStyles.settingItem}>
            <Ionicons name="cloud-outline" size={22} color="#9CA3AF" />
            <Text style={settingsStyles.settingText}>Manage Providers</Text>
            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={settingsStyles.settingItem}>
            <Ionicons name="link-outline" size={22} color="#9CA3AF" />
            <Text style={settingsStyles.settingText}>Relay Connections</Text>
            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <View style={settingsStyles.section}>
          <Text style={settingsStyles.sectionTitle}>Preferences</Text>
          <TouchableOpacity style={settingsStyles.settingItem}>
            <Ionicons name="notifications-outline" size={22} color="#9CA3AF" />
            <Text style={settingsStyles.settingText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={settingsStyles.settingItem}>
            <Ionicons name="color-palette-outline" size={22} color="#9CA3AF" />
            <Text style={settingsStyles.settingText}>Appearance</Text>
            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={settingsStyles.settingItem}>
            <Ionicons name="volume-high-outline" size={22} color="#9CA3AF" />
            <Text style={settingsStyles.settingText}>Voice Settings</Text>
            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <View style={settingsStyles.section}>
          <Text style={settingsStyles.sectionTitle}>About</Text>
          <TouchableOpacity style={settingsStyles.settingItem}>
            <Ionicons name="information-circle-outline" size={22} color="#9CA3AF" />
            <Text style={settingsStyles.settingText}>Version 0.1.0</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    borderTopWidth: 1,
    borderTopColor: "#374151",
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
  },
  tabIconContainer: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  tabIconContainerActive: {
    backgroundColor: "#1E3A5F",
  },
  tabLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
  },
  tabLabelActive: {
    color: "#3B82F6",
    fontWeight: "600",
  },
});

const settingsStyles = StyleSheet.create({
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  settingText: {
    flex: 1,
    fontSize: 15,
    color: "#F9FAFB",
    marginLeft: 12,
  },
});
