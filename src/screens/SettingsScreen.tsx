import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { colors, spacing, typography } from "@/styles";

export const SettingsScreen: React.FC = () => {
  const settingsOptions = [
    { id: "1", title: "Audio Settings", subtitle: "Default BPM, volume" },
    { id: "2", title: "Notation Style", subtitle: "Customize rap notation" },
    { id: "3", title: "Storage & Sync", subtitle: "iCloud, local storage" },
    { id: "4", title: "Export Options", subtitle: "Share and backup raps" },
  ];

  const renderSettingItem = (item: (typeof settingsOptions)[0]) => (
    <TouchableOpacity key={item.id} style={styles.settingItem}>
      <View>
        <Text style={styles.settingTitle}>{item.title}</Text>
        <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
      </View>
      <Text style={styles.chevron}>→</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          {settingsOptions.map(renderSettingItem)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutItem}>
            <Text style={styles.aboutText}>RapApp v1.0.0</Text>
            <Text style={styles.aboutSubtext}>
              A powerful tool for writing and organizing your raps
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.fontSize.title,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settingSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: typography.fontSize.lg,
    color: colors.textMuted,
  },
  aboutItem: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aboutText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  aboutSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});
