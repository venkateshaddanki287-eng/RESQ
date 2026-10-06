import { create } from "zustand";
import type { IncidentStatus, Location, ResponderType } from "@/types/incident";

interface AppState {
  selectedResponderType: ResponderType;
  submittedIncidentId: string | null;
  currentLocation: Location | null;
  incidentStatus: Record<string, IncidentStatus>;
  setResponderType: (type: ResponderType) => void;
  setCurrentLocation: (location: Location | null) => void;
  setSubmittedIncidentId: (id: string | null) => void;
  setIncidentStatus: (id: string, status: IncidentStatus) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  selectedResponderType: "FIRE",
  submittedIncidentId: null,
  currentLocation: null,
  incidentStatus: {},
  setResponderType: (type) => set({ selectedResponderType: type }),
  setCurrentLocation: (location) => set({ currentLocation: location }),
  setSubmittedIncidentId: (id) => set({ submittedIncidentId: id }),
  setIncidentStatus: (id, status) =>
    set((state) => ({
      incidentStatus: { ...state.incidentStatus, [id]: status },
    })),
}));
