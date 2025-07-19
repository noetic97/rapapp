import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  RAPS: "@rapapp:raps",
  FOLDERS: "@rapapp:folders",
} as const;

export const storageUtils = {
  // Generic storage functions
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error("Error storing data:", error);
      throw error;
    }
  },

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error("Error retrieving data:", error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing data:", error);
      throw error;
    }
  },

  // Rap-specific storage
  async saveRaps(raps: any[]): Promise<void> {
    return this.setItem(STORAGE_KEYS.RAPS, raps);
  },

  async loadRaps(): Promise<any[]> {
    const raps = await this.getItem<any[]>(STORAGE_KEYS.RAPS);
    return raps || [];
  },

  async saveFolders(folders: any[]): Promise<void> {
    return this.setItem(STORAGE_KEYS.FOLDERS, folders);
  },

  async loadFolders(): Promise<any[]> {
    const folders = await this.getItem<any[]>(STORAGE_KEYS.FOLDERS);
    return folders || [];
  },
};
