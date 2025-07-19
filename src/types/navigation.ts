export type RootStackParamList = {
  Home: undefined;
  RapEditor: { rapId?: string; folderId?: string };
  Folder: { folderId: string };
  Settings: undefined;
};

export type BottomTabParamList = {
  Raps: undefined;
  Settings: undefined;
};
