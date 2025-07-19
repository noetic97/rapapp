import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
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
  // Build folder hierarchy
  const buildFolderOptions = (): FolderOption[] => {
    const options: FolderOption[] = [
      { id: undefined, name: "Root (No Folder)", isRoot: true, depth: 0 },
    ];

    const addFoldersRecursively = (
      parentId: string | undefined,
      depth: number
    ) => {
      const childFolders = folders
        .filter((f) => f.parentId === parentId)
        .sort((a, b) => a.name.localeCompare(b.name));

      childFolders.forEach((folder) => {
        // Don't include the current folder (can't move to itself)
        if (folder.id !== currentFolderId) {
          options.push({
            id: folder.id,
            name: folder.name,
            depth,
          });
          // Add subfolders
          addFoldersRecursively(folder.id, depth + 1);
        }
      });
    };

    addFoldersRecursively(undefined, 1);
    return options;
  };

  const folderOptions = buildFolderOptions();

  const renderFolderOption = ({ item }: { item: FolderOption }) => (
    <TouchableOpacity
      style={styles.folderOption}
      onPress={() => {
        onSelectFolder(item.id);
        onClose();
      }}
    >
      <View
        style={[styles.folderContent, { marginLeft: item.depth * spacing.lg }]}
      >
        <Text style={styles.folderIcon}>{item.isRoot ? "🏠" : "📁"}</Text>
        <Text style={styles.folderName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
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
            <View style={styles.headerSpacer} />
          </View>

          <FlatList
            data={folderOptions}
            renderItem={renderFolderOption}
            keyExtractor={(item) => item.id || "root"}
            style={styles.folderList}
            showsVerticalScrollIndicator={false}
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
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textAlign: "center",
  },
  headerSpacer: {
    width: 60, // Balance the cancel button
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
});
