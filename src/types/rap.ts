export interface Rap {
  id: string;
  title: string;
  content: string;
  folderId?: string;
  audioUrl?: string;
  audioFile?: string; // local file path
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  metadata?: {
    bpm?: number;
    audioStartTime?: number;
    audioEndTime?: number;
  };
}

export interface RapFolder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: Date;
}
