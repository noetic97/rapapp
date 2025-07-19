import { Rap, RapFolder } from "@/types/rap";
import { storageUtils } from "@/utils/storage";

export class StorageService {
  // Rap operations
  static async saveRap(rap: Rap): Promise<void> {
    const raps = await storageUtils.loadRaps();
    const existingIndex = raps.findIndex((r) => r.id === rap.id);

    if (existingIndex >= 0) {
      raps[existingIndex] = rap;
    } else {
      raps.push(rap);
    }

    await storageUtils.saveRaps(raps);
  }

  static async loadRaps(): Promise<Rap[]> {
    const raps = await storageUtils.loadRaps();
    return raps.map((rap) => ({
      ...rap,
      createdAt: new Date(rap.createdAt),
      updatedAt: new Date(rap.updatedAt),
    }));
  }

  static async deleteRap(rapId: string): Promise<void> {
    const raps = await storageUtils.loadRaps();
    const filteredRaps = raps.filter((rap) => rap.id !== rapId);
    await storageUtils.saveRaps(filteredRaps);
  }

  static async getRap(rapId: string): Promise<Rap | null> {
    const raps = await this.loadRaps();
    return raps.find((rap) => rap.id === rapId) || null;
  }

  // Folder operations
  static async saveFolder(folder: RapFolder): Promise<void> {
    const folders = await storageUtils.loadFolders();
    const existingIndex = folders.findIndex((f) => f.id === folder.id);

    if (existingIndex >= 0) {
      folders[existingIndex] = folder;
    } else {
      folders.push(folder);
    }

    await storageUtils.saveFolders(folders);
  }

  static async loadFolders(): Promise<RapFolder[]> {
    const folders = await storageUtils.loadFolders();
    return folders.map((folder) => ({
      ...folder,
      createdAt: new Date(folder.createdAt),
    }));
  }

  static async deleteFolder(folderId: string): Promise<void> {
    const folders = await storageUtils.loadFolders();
    const filteredFolders = folders.filter((folder) => folder.id !== folderId);
    await storageUtils.saveFolders(filteredFolders);
  }
}
