import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  Alert,
} from "react-native";
import { RapFolder } from "@/types/rap";
import { colors, spacing, typography } from "@/styles";

interface FolderPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectFolder: (folderId: string | undefined) => void;
  folders: RapFolder[];
  currentFolderId?: string;
  title: string;
}

interface FolderOption {
  id: string | undefined;
  name: string;
  isRoot?: boolean;
  depth: number;
}

export const FolderPicker: React.FC<FolderPickerProps> = ({
  visible,
  onClose,
  onSelectFolder,
  folders,
  currentFolderId,
  title,
}) => {
  // Debug: Show what we received
  React.useEffect(() => {
    if (visible) {
      console.log("FolderPicker opened with:");
      console.log("- Folders count:", folders?.length || 0);
      console.log("- Folders:", folders);
      console.log("- Current folder ID:", currentFolderId);
      console.log("- Title:", title);
    }
  }, [visible, folders, currentFolderId, title]);

  // Build folder hierarchy with extensive debugging
  const buildFolderOptions = (): FolderOption[] => {
    console.log("Building folder options...");

    const options: FolderOption[] = [
      { id: undefined, name: "Root (No Folder)", isRoot: true, depth: 0 },
    ];

    console.log("Added root option, options now:", options.length);

    if (!folders || folders.length === 0) {
      console.log("No folders available, returning only root option");
      return options;
    }

    const addFoldersRecursively = (
      parentId: string | undefined,
      depth: number
    ) => {
      console.log(
        `Looking for folders with parentId: ${parentId}, depth: ${depth}`
      );

      const childFolders = folders
        .filter((f) => f.parentId === parentId)
        .sort((a, b) => a.name.localeCompare(b.name));

      console.log(
        `Found ${childFolders.length} child folders:`,
        childFolders.map((f) => f.name)
      );

      childFolders.forEach((folder) => {
        console.log(`Processing folder: ${folder.name} (id: ${folder.id})`);

        // Don't include the current folder (can't move to itself)
        if (folder.id !== currentFolderId) {
          console.log(`Adding folder ${folder.name} to options`);
          options.push({
            id: folder.id,
            name: folder.name,
            depth,
          });
          // Add subfolders
          addFoldersRecursively(folder.id, depth + 1);
        } else {
          console.log(`Skipping current folder: ${folder.name}`);
        }
      });
    };

    addFoldersRecursively(undefined, 1);

    console.log("Final options:", options);
    return options;
  };

  const folderOptions = buildFolderOptions();

  // Debug button in the header
  const showDebugInfo = () => {
    Alert.alert(
      "Debug Info",
      `Folders received: ${folders?.length || 0}\nOptions built: ${
        folderOptions.length
      }\nCurrent folder: ${currentFolderId || "none"}`,
      [{ text: "OK" }]
    );
  };

  const renderFolderOption = ({ item }: { item: FolderOption }) => {
    console.log("Rendering folder option:", item);

    return (
      <TouchableOpacity
        style={styles.folderOption}
        onPress={() => {
          console.log("Selected folder:", item);
          onSelectFolder(item.id);
          onClose();
        }}
      >
        <View
          style={[
            styles.folderContent,
            { marginLeft: item.depth * spacing.lg },
          ]}
        >
          <Text style={styles.folderIcon}>{item.isRoot ? "🏠" : "📁"}</Text>
          <Text style={styles.folderName}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No folder options available</Text>
      <TouchableOpacity style={styles.debugButton} onPress={showDebugInfo}>
        <Text style={styles.debugButtonText}>Debug Info</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity onPress={showDebugInfo}>
              <Text style={styles.debugHeaderButton}>Debug</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={folderOptions}
            renderItem={renderFolderOption}
            keyExtractor={(item) => item.id || "root"}
            style={styles.folderList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyList}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelButton: {
    fontSize: typography.fontSize.md,
    color: colors.accent,
    fontWeight: typography.fontWeight.medium,
  },
  debugHeaderButton: {
    fontSize: typography.fontSize.sm,
    color: colors.warning,
    fontWeight: typography.fontWeight.medium,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textAlign: "center",
  },
  folderList: {
    flex: 1,
  },
  folderOption: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  folderContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  folderIcon: {
    fontSize: typography.fontSize.lg,
    marginRight: spacing.md,
    width: 24,
  },
  folderName: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    flex: 1,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  debugButton: {
    backgroundColor: colors.warning,
    padding: spacing.sm,
    borderRadius: 8,
  },
  debugButtonText: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});
