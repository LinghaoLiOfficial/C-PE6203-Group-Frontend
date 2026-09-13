import { create } from "zustand";

type AppStore = {
  sidebarOpen: boolean;
  appLoading: boolean;
  resumeRevision: number;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setAppLoading: (loading: boolean) => void;
  bumpResumeRevision: () => void;
};

export const useAppStore = create<AppStore>((set) => ({
  sidebarOpen: false,
  appLoading: false,
  resumeRevision: 0,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),
  setAppLoading: (loading) => set({ appLoading: loading }),
  bumpResumeRevision: () =>
    set((state) => ({ resumeRevision: state.resumeRevision + 1 })),
}));
