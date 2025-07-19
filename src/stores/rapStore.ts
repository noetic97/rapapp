import { create } from "zustand";
import { Rap, RapFolder } from "@/types/rap";
import { StorageService } from "@/services/StorageService";

interface RapStore {
  // State
  raps: Rap[];
  folders: RapFolder[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadInitialData: () => Promise<void>;

  // Rap actions
  createRap: (
    title: string,
    content?: string,
    folderId?: string
  ) => Promise<Rap>;
  updateRap: (rapId: string, updates: Partial<Rap>) => Promise<void>;
  deleteRap: (rapId: string) => Promise<void>;
  getRap: (rapId: string) => Rap | undefined;

  // Folder actions (for later)
  createFolder: (name: string, parentId?: string) => Promise<RapFolder>;
  deleteFolder: (folderId: string) => Promise<void>;

  // Utility actions
  clearError: () => void;
}

export const useRapStore = create<RapStore>((set, get) => ({
  // Initial state
  raps: [],
  folders: [],
  isLoading: false,
  error: null,

  // Load initial data from storage
  loadInitialData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [raps, folders] = await Promise.all([
        StorageService.loadRaps(),
        StorageService.loadFolders(),
      ]);
      set({ raps, folders, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load data",
        isLoading: false,
      });
    }
  },

  // Create a new rap
  createRap: async (title: string, content = "", folderId) => {
    const now = new Date();
    const newRap: Rap = {
      id: `rap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim() || "Untitled Rap",
      content,
      folderId,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await StorageService.saveRap(newRap);
      set((state) => ({
        raps: [...state.raps, newRap],
        error: null,
      }));
      return newRap;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to create rap",
      });
      throw error;
    }
  },

  // Update an existing rap
  updateRap: async (rapId: string, updates: Partial<Rap>) => {
    const { raps } = get();
    const existingRap = raps.find((rap) => rap.id === rapId);

    if (!existingRap) {
      throw new Error("Rap not found");
    }

    const updatedRap: Rap = {
      ...existingRap,
      ...updates,
      updatedAt: new Date(),
    };

    try {
      await StorageService.saveRap(updatedRap);
      set((state) => ({
        raps: state.raps.map((rap) => (rap.id === rapId ? updatedRap : rap)),
        error: null,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update rap",
      });
      throw error;
    }
  },

  // Delete a rap
  deleteRap: async (rapId: string) => {
    try {
      await StorageService.deleteRap(rapId);
      set((state) => ({
        raps: state.raps.filter((rap) => rap.id !== rapId),
        error: null,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete rap",
      });
      throw error;
    }
  },

  // Get a specific rap
  getRap: (rapId: string) => {
    return get().raps.find((rap) => rap.id === rapId);
  },

  // Create a new folder
  createFolder: async (name: string, parentId) => {
    const now = new Date();
    const newFolder: RapFolder = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      parentId,
      createdAt: now,
    };

    try {
      await StorageService.saveFolder(newFolder);
      set((state) => ({
        folders: [...state.folders, newFolder],
        error: null,
      }));
      return newFolder;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to create folder",
      });
      throw error;
    }
  },

  // Delete a folder
  deleteFolder: async (folderId: string) => {
    try {
      await StorageService.deleteFolder(folderId);
      set((state) => ({
        folders: state.folders.filter((folder) => folder.id !== folderId),
        error: null,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete folder",
      });
      throw error;
    }
  },

  // Clear any errors
  clearError: () => set({ error: null }),
}));
