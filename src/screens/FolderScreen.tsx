import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "@/types/navigation";
import { Rap, RapFolder } from "@/types/rap";
import { useRapStorage } from "@/hooks/useRapStorage";
import { colors, spacing, typography } from "@/styles";

type FolderScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Folder"
>;

type FolderScreenRouteProp = RouteProp<RootStackParamList, "Folder">;

interface Props {
  navigation: FolderScreenNavigationProp;
  route: FolderScreenRouteProp;
}

export const FolderScreen: React.FC<Props> = ({ navigation, route }) => {
  const { folderId } = route.params;
  const {
    raps,
    folders,
    isLoading,
    error,
    deleteRap,
    deleteFolder,
    createFolder,
    clearError,
    loadInitialData,
  } = useRapStorage();

  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Get current folder info
  const currentFolder = folders.find((f) => f.id === folderId);
  const subfolders = folders.filter((f) => f.parentId === folderId);
  const folderRaps = raps.filter((r) => r.folderId === folderId);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadInitialData();
    }, [loadInitialData])
  );

  const handleNewRap = () => {
    navigation.navigate("RapEditor", { folderId });
  };

  const handleRapPress = (rapId: string) => {
    navigation.navigate("RapEditor", { rapId });
  };

  const handleFolderPress = (subfolderId: string) => {
    navigation.push("Folder", { folderId: subfolderId });
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

  const handleDeleteFolder = (folder: RapFolder) => {
    const folderRapCount = raps.filter((r) => r.folderId === folder.id).length;
    const subfolderCount = folders.filter(
      (f) => f.parentId === folder.id
    ).length;

    if (folderRapCount > 0 || subfolderCount > 0) {
      Alert.alert(
        "Cannot Delete Folder",
        "This folder contains raps or subfolders. Please move or delete the contents first.",
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Delete Folder",
      `Are you sure you want to delete the folder "${folder.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteFolder(folder.id),
        },
      ]
    );
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      Alert.alert("Error", "Please enter a folder name");
      return;
    }

    try {
      await createFolder(newFolderName.trim(), folderId);
      setNewFolderName("");
      setShowCreateFolder(false);
    } catch (error) {
      Alert.alert("Error", "Failed to create folder");
    }
  };

  const renderFolderItem = ({ item }: { item: RapFolder }) => {
    const subfolderCount = folders.filter((f) => f.parentId === item.id).length;
    const rapCount = raps.filter((r) => r.folderId === item.id).length;
    const totalItems = subfolderCount + rapCount;

    return (
      <TouchableOpacity
        style={styles.folderItem}
        onPress={() => handleFolderPress(item.id)}
        onLongPress={() => handleDeleteFolder(item)}
      >
        <View style={styles.folderIcon}>
          <Text style={styles.folderEmoji}>📁</Text>
        </View>
        <View style={styles.folderInfo}>
          <Text style={styles.folderName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.folderCount}>
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </Text>
        </View>
        <Text style={styles.chevron}>→</Text>
      </TouchableOpacity>
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

  const renderItem = ({ item }: { item: RapFolder | Rap }) => {
    if ("name" in item) {
      return renderFolderItem({ item });
    } else {
      return renderRapItem({ item });
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>Empty folder</Text>
      <Text style={styles.emptyStateSubtitle}>
        Tap the + button to create a new rap or folder
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerButtons}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => setShowCreateFolder(true)}
      >
        <Text style={styles.actionButtonEmoji}>📁</Text>
        <Text style={styles.actionButtonText}>New Folder</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={handleNewRap}>
        <Text style={styles.actionButtonEmoji}>📝</Text>
        <Text style={styles.actionButtonText}>New Rap</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading folder...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Combine and sort items (folders first, then raps)
  const allItems = [
    ...subfolders.sort((a, b) => a.name.localeCompare(b.name)),
    ...folderRaps.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {currentFolder?.name || "Folder"}
        </Text>
        <View style={styles.headerSpacer} />
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
        data={allItems}
        renderItem={renderItem}
        keyExtractor={(item) =>
          "name" in item ? `folder-${item.id}` : `rap-${item.id}`
        }
        contentContainerStyle={[
          styles.listContainer,
          allItems.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Create Folder Modal */}
      <Modal
        visible={showCreateFolder}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateFolder(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Folder</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Folder name..."
              placeholderTextColor={colors.textMuted}
              value={newFolderName}
              onChangeText={setNewFolderName}
              maxLength={50}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowCreateFolder(false);
                  setNewFolderName("");
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalCreateButton]}
                onPress={handleCreateFolder}
              >
                <Text style={styles.modalCreateText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: typography.fontSize.xl,
    color: colors.text,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.title,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: "center",
    marginHorizontal: spacing.sm,
  },
  headerSpacer: {
    width: 44,
  },
  headerButtons: {
    flexDirection: "row",
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  actionButtonEmoji: {
    fontSize: typography.fontSize.lg,
  },
  actionButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
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
  folderItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  folderIcon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  folderEmoji: {
    fontSize: 24,
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  folderCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: typography.fontSize.lg,
    color: colors.textMuted,
    marginLeft: spacing.sm,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    width: "100%",
    maxWidth: 320,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCreateButton: {
    backgroundColor: colors.accent,
  },
  modalCancelText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  modalCreateText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
});
