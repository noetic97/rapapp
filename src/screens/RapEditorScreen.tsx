import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "@/types/navigation";
import { useRapStore } from "@/stores/rapStore";
import { colors, spacing, typography } from "@/styles";
import { APP_CONSTANTS } from "@/utils/constants";

type RapEditorScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "RapEditor"
>;

type RapEditorScreenRouteProp = RouteProp<RootStackParamList, "RapEditor">;

interface Props {
  navigation: RapEditorScreenNavigationProp;
  route: RapEditorScreenRouteProp;
}

export const RapEditorScreen: React.FC<Props> = ({ navigation, route }) => {
  const { rapId, folderId } = route.params;
  const { createRap, updateRap, getRap, error, clearError } = useRapStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [currentRapId, setCurrentRapId] = useState(rapId); // Track the current rap ID

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const savePromiseRef = useRef<Promise<void> | null>(null);
  const isEditing = Boolean(currentRapId); // Use currentRapId instead of rapId
  const existingRap = currentRapId ? getRap(currentRapId) : null;

  // Load existing rap data
  useEffect(() => {
    if (existingRap && !initialDataLoaded) {
      setTitle(existingRap.title);
      setContent(existingRap.content);
      setInitialDataLoaded(true);
    } else if (!existingRap && !initialDataLoaded) {
      setInitialDataLoaded(true);
    }
  }, [existingRap, initialDataLoaded]);

  // Auto-save functionality - only after initial data is loaded
  useEffect(() => {
    if (
      !initialDataLoaded ||
      !hasUnsavedChanges ||
      (!title.trim() && !content.trim()) ||
      isSaving
    ) {
      return;
    }

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout
    autoSaveTimeoutRef.current = setTimeout(() => {
      handleSave(false); // Auto-save without navigating back
    }, APP_CONSTANTS.AUTO_SAVE_DELAY);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [title, content, hasUnsavedChanges, initialDataLoaded, isSaving]);

  const handleSave = async (shouldNavigateBack = true) => {
    // Prevent multiple simultaneous saves
    if (isSaving || savePromiseRef.current) {
      if (shouldNavigateBack && savePromiseRef.current) {
        await savePromiseRef.current;
        navigation.goBack();
      }
      return;
    }

    if (!title.trim() && !content.trim()) {
      if (shouldNavigateBack) {
        navigation.goBack();
      }
      return;
    }

    setIsSaving(true);
    clearError();

    // Clear auto-save timeout since we're saving now
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    const savePromise = (async () => {
      try {
        if (isEditing && existingRap) {
          // Update existing rap
          await updateRap(existingRap.id, {
            title: title.trim() || "Untitled Rap",
            content: content.trim(),
          });
        } else {
          // Create new rap and update currentRapId
          const newRap = await createRap(
            title.trim() || "Untitled Rap",
            content.trim(),
            folderId
          );
          setCurrentRapId(newRap.id); // Update the current rap ID so future saves will update this rap
        }

        setHasUnsavedChanges(false);

        if (shouldNavigateBack) {
          navigation.goBack();
        }
      } catch (error) {
        Alert.alert(
          "Save Error",
          "Failed to save your rap. Please try again.",
          [{ text: "OK" }]
        );
      } finally {
        setIsSaving(false);
        savePromiseRef.current = null;
      }
    })();

    savePromiseRef.current = savePromise;
    await savePromise;
  };

  const handleBack = () => {
    if (hasUnsavedChanges && (title.trim() || content.trim())) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Do you want to save before leaving?",
        [
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
          { text: "Cancel", style: "cancel" },
          { text: "Save", onPress: () => handleSave() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleTitleChange = (newTitle: string) => {
    if (newTitle.length <= APP_CONSTANTS.MAX_TITLE_LENGTH) {
      setTitle(newTitle);
      if (initialDataLoaded) {
        setHasUnsavedChanges(true);
      }
    }
  };

  const handleContentChange = (newContent: string) => {
    if (newContent.length <= APP_CONSTANTS.MAX_CONTENT_LENGTH) {
      setContent(newContent);
      if (initialDataLoaded) {
        setHasUnsavedChanges(true);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {isEditing ? "Edit Rap" : "New Rap"}
            </Text>
            {isSaving && <Text style={styles.savingText}>Saving...</Text>}
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              !title.trim() && !content.trim() && styles.saveButtonDisabled,
            ]}
            onPress={() => handleSave()}
            disabled={!title.trim() && !content.trim()}
          >
            <Text
              style={[
                styles.saveButtonText,
                !title.trim() &&
                  !content.trim() &&
                  styles.saveButtonTextDisabled,
              ]}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.content}>
          <TextInput
            style={styles.titleInput}
            placeholder="Rap title..."
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={handleTitleChange}
            maxLength={APP_CONSTANTS.MAX_TITLE_LENGTH}
            returnKeyType="next"
          />

          <TextInput
            style={styles.contentInput}
            placeholder="Start writing your rap..."
            placeholderTextColor={colors.textMuted}
            value={content}
            onChangeText={handleContentChange}
            multiline
            textAlignVertical="top"
            scrollEnabled
            maxLength={APP_CONSTANTS.MAX_CONTENT_LENGTH}
          />

          <View style={styles.footer}>
            <Text style={styles.characterCount}>
              {content.length} / {APP_CONSTANTS.MAX_CONTENT_LENGTH}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
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
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  savingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  saveButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: colors.border,
  },
  saveButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  saveButtonTextDisabled: {
    color: colors.textMuted,
  },
  errorContainer: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorText: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  titleInput: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  contentInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: typography.fontFamily.mono,
    lineHeight: typography.fontSize.md * 1.6, // Fixed line height for proper spacing
  },
  footer: {
    paddingTop: spacing.sm,
    alignItems: "flex-end",
  },
  characterCount: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
});
