import { create } from "zustand";

type LeftPanelTab = "scrap" | "turrets";

interface UIState {
  leftPanelTab: LeftPanelTab;
  setLeftPanelTab: (tab: LeftPanelTab) => void;
}

export const useUIStore = create<UIState>((set) => ({
  leftPanelTab: "scrap",
  setLeftPanelTab: (tab) => set({ leftPanelTab: tab }),
}));
