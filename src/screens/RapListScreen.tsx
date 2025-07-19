import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "@/types/navigation";
import { Rap } from "@/types/rap";
import { useRapStorage } from "@/hooks/useRapStorage";
import { colors, spacing, typography } from "@/styles";

type RapListScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Home"
>;

interface Props {
  navigation: RapListScreenNavigationProp;
}

export const RapListScreen: React.FC<Props> = ({ navigation }) => {
  const { raps, isLoading, error, deleteRap, clearError, loadInitialData } =
    useRapStorage();

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadInitialData();
    }, [loadInitialData])
  );

  const handleNewRap = async () => {
    navigation.navigate("RapEditor", {});
  };

  const handleRapPress = (rapId: string) => {
    navigation.navigate("RapEditor", { rapId });
  };

  const handleDeleteRap = (rap: Rap) => {
    Alert.alert(
      "Delete Rap",
      `Are you sure you want to delete "${rap.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteRap(rap.id),
        },
      ]
    );
  };

  const renderRapItem = ({ item }: { item: Rap }) => {
    const updatedDate = item.updatedAt.toLocaleDateString();

    return (
      <TouchableOpacity
        style={styles.rapItem}
        onPress={() => handleRapPress(item.id)}
        onLongPress={() => handleDeleteRap(item)}
      >
        <View style={styles.rapHeader}>
          <Text style={styles.rapTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.rapDate}>{updatedDate}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No raps yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Tap the + button to create your first rap
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading your raps...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Raps</Text>
        <TouchableOpacity style={styles.newButton} onPress={handleNewRap}>
          <Text style={styles.newButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError} style={styles.errorButton}>
            <Text style={styles.errorButtonText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={raps.sort(
          (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
        )}
        renderItem={renderRapItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          raps.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  newButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  newButtonText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  errorContainer: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    flex: 1,
  },
  errorButton: {
    paddingHorizontal: spacing.sm,
  },
  errorButtonText: {
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    marginTop: spacing.md,
  },
  listContainer: {
    padding: spacing.md,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
  },
  rapItem: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rapTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    flex: 1,
  },
  rapDate: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyStateSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
