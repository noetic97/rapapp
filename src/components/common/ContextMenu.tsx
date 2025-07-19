import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { colors, spacing, typography } from "@/styles";

export interface ContextMenuItem {
  id: string;
  title: string;
  icon: string;
  onPress: () => void;
  destructive?: boolean;
}

interface ContextMenuProps {
  visible: boolean;
  onClose: () => void;
  items: ContextMenuItem[];
  title?: string;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  onClose,
  items,
  title,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          {title && (
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
            </View>
          )}

          {items.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === 0 && !title && styles.firstItem,
                index === items.length - 1 && styles.lastItem,
                item.destructive && styles.destructiveItem,
              ]}
              onPress={() => {
                onClose();
                item.onPress();
              }}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.menuText,
                  item.destructive && styles.destructiveText,
                ]}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    padding: spacing.md,
  },
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: spacing.sm,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  titleContainer: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: "center",
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  firstItem: {
    // No additional styling needed
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  destructiveItem: {
    // Background can remain the same, we'll just change text color
  },
  menuIcon: {
    fontSize: typography.fontSize.lg,
    marginRight: spacing.md,
    width: 24,
    textAlign: "center",
  },
  menuText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
  cancelButton: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    alignItems: "center",
    borderRadius: 16,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
});
