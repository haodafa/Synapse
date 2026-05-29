import { Issue, IssueStatus } from "@synapse/protocol";
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useHaptics } from "../hooks/use-synapse-client";

interface KanbanBoardProps {
  issues: Issue[];
  onIssuePress?: (issue: Issue) => void;
  onIssueMove?: (issue: Issue, newStatus: IssueStatus) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const COLUMN_WIDTH = Dimensions.get("window").width * 0.75;
const STATUS_COLUMNS: { status: IssueStatus; label: string; color: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { status: "backlog", label: "Backlog", color: "#6B7280", icon: "infinite-outline" },
  { status: "todo", label: "To Do", color: "#3B82F6", icon: "ellipse-outline" },
  { status: "in_progress", label: "In Progress", color: "#F59E0B", icon: "play-circle-outline" },
  { status: "in_review", label: "In Review", color: "#8B5CF6", icon: "eye-outline" },
  { status: "done", label: "Done", color: "#10B981", icon: "checkmark-circle-outline" },
];

function IssueCard({ issue, onPress }: { issue: Issue; onPress?: () => void }) {
  const { impact } = useHaptics();
  const priorityColors = {
    critical: "#EF4444",
    high: "#F59E0B",
    medium: "#3B82F6",
    low: "#6B7280",
  };
  const priorityColor = priorityColors[issue.priority] ?? priorityColors.medium;

  const handlePress = useCallback(() => {
    impact("light");
    onPress?.();
  }, [impact, onPress]);

  return (
    <TouchableOpacity style={styles.issueCard} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.issueCardHeader}>
        <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
          <Text style={styles.priorityText}>{issue.priority.toUpperCase()}</Text>
        </View>
        {issue.labels && issue.labels.length > 0 && (
          <View style={styles.labelContainer}>
            {issue.labels.slice(0, 2).map((label, idx) => (
              <View key={idx} style={[styles.labelBadge, { backgroundColor: label.color }]}>
                <Text style={styles.labelText}>{label.name}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <Text style={styles.issueTitle} numberOfLines={2}>
        {issue.title}
      </Text>
      {issue.description && (
        <Text style={styles.issueDescription} numberOfLines={2}>
          {issue.description}
        </Text>
      )}
      <View style={styles.issueCardFooter}>
        <View style={styles.issueMeta}>
          <Ionicons name="chatbubble-outline" size={12} color="#6B7280" />
          <Text style={styles.metaText}>{issue.comments?.length ?? 0}</Text>
        </View>
        {issue.assignee && (
          <View style={styles.assigneeBadge}>
            <Text style={styles.assigneeText}>{issue.assignee.name}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function KanbanColumn({
  status,
  label,
  color,
  icon,
  issues,
  onIssuePress,
  onIssueMove,
}: {
  status: IssueStatus;
  label: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  issues: Issue[];
  onIssuePress?: (issue: Issue) => void;
  onIssueMove?: (issue: Issue, newStatus: IssueStatus) => void;
}) {
  const handleMoveLeft = useCallback(() => {
    const currentIndex = STATUS_COLUMNS.findIndex((c) => c.status === status);
    if (currentIndex > 0) {
      const prevStatus = STATUS_COLUMNS[currentIndex - 1].status;
      issues.forEach((issue) => onIssueMove?.(issue, prevStatus));
    }
  }, [status, issues, onIssueMove]);

  const handleMoveRight = useCallback(() => {
    const currentIndex = STATUS_COLUMNS.findIndex((c) => c.status === status);
    if (currentIndex < STATUS_COLUMNS.length - 1) {
      const nextStatus = STATUS_COLUMNS[currentIndex + 1].status;
      issues.forEach((issue) => onIssueMove?.(issue, nextStatus));
    }
  }, [status, issues, onIssueMove]);

  return (
    <View style={styles.column}>
      <View style={styles.columnHeader}>
        <View style={[styles.statusIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={16} color="#FFFFFF" />
        </View>
        <Text style={styles.columnTitle}>{label}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{issues.length}</Text>
        </View>
      </View>
      <View style={styles.columnActions}>
        <TouchableOpacity style={styles.moveButton} onPress={handleMoveLeft}>
          <Ionicons name="chevron-back" size={16} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.moveButton} onPress={handleMoveRight}>
          <Ionicons name="chevron-forward" size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.columnContent} showsVerticalScrollIndicator={false}>
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} onPress={() => onIssuePress?.(issue)} />
        ))}
        {issues.length === 0 && (
          <View style={styles.emptyColumn}>
            <Ionicons name="document-text-outline" size={32} color="#374151" />
            <Text style={styles.emptyText}>No issues</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export function KanbanBoard({
  issues,
  onIssuePress,
  onIssueMove,
  onRefresh,
  isRefreshing = false,
}: KanbanBoardProps) {
  const issuesByStatus = useMemo(() => {
    const grouped: Record<IssueStatus, Issue[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
    };
    issues.forEach((issue) => {
      const status = issue.status ?? "backlog";
      if (grouped[status]) {
        grouped[status].push(issue);
      } else {
        grouped.backlog.push(issue);
      }
    });
    return grouped;
  }, [issues]);

  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      style={styles.board}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
      }
    >
      {STATUS_COLUMNS.map((column) => (
        <KanbanColumn
          key={column.status}
          status={column.status}
          label={column.label}
          color={column.color}
          icon={column.icon}
          issues={issuesByStatus[column.status]}
          onIssuePress={onIssuePress}
          onIssueMove={onIssueMove}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  board: {
    flex: 1,
  },
  column: {
    width: COLUMN_WIDTH,
    marginHorizontal: 8,
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 12,
  },
  columnHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F9FAFB",
    flex: 1,
  },
  countBadge: {
    backgroundColor: "#374151",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  columnActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  moveButton: {
    padding: 4,
    backgroundColor: "#374151",
    borderRadius: 6,
  },
  columnContent: {
    flex: 1,
  },
  issueCard: {
    backgroundColor: "#374151",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  issueCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  labelContainer: {
    flexDirection: "row",
    marginLeft: 6,
  },
  labelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  labelText: {
    fontSize: 10,
    color: "#FFFFFF",
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F9FAFB",
    marginBottom: 4,
  },
  issueDescription: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 8,
  },
  issueCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  issueMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  assigneeBadge: {
    backgroundColor: "#4B5563",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  assigneeText: {
    fontSize: 11,
    color: "#D1D5DB",
  },
  emptyColumn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
  },
});
