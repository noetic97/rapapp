import { useEffect } from "react";
import { useRapStore } from "@/stores/rapStore";

// Hook to initialize the app data
export const useRapStorage = () => {
  const store = useRapStore();

  useEffect(() => {
    store.loadInitialData();
  }, []);

  return store;
};
