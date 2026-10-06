import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { incidentSeed, resourceSeed } from "@/lib/mock-data";
import type { Incident, IncidentStatus, Location, Resource, ResponderType } from "@/types/incident";

interface AppState {
  incidents: Incident[];
  resources: Resource[];
  hasHydrated: boolean;
  selectedResponderType: ResponderType;
  selectedResponderResourceId: string | null;
  submittedIncidentId: string | null;
  currentLocation: Location | null;
  setIncidents: (incidents: Incident[]) => void;
  addIncident: (incident: Incident) => void;
  addResponseBranch: (incidentId: string, branch: Incident["branches"][number]) => void;
  setResources: (resources: Resource[]) => void;
  setResponderType: (type: ResponderType) => void;
  setResponderResourceId: (resourceId: string) => void;
  setCurrentLocation: (location: Location | null) => void;
  setSubmittedIncidentId: (id: string | null) => void;
  dispatchResource: (incidentId: string, branchId: Incident["branches"][number]["id"], resourceId: string) => void;
  claimBranch: (incidentId: string, branchId: Incident["branches"][number]["id"], resourceId: string) => void;
  setBranchStatus: (incidentId: string, branchId: Incident["branches"][number]["id"], status: IncidentStatus) => void;
  updateIncidentStatus: (incidentId: string, status: IncidentStatus) => void;
  resetDemoData: () => void;
  setHasHydrated: (hydrated: boolean) => void;
}

type PersistedAppState = Pick<
  AppState,
  | "incidents"
  | "resources"
  | "selectedResponderType"
  | "selectedResponderResourceId"
  | "submittedIncidentId"
  | "currentLocation"
>;

function updateBranchStatus(
  incidents: Incident[],
  incidentId: string,
  branchId: Incident["branches"][number]["id"],
  status: IncidentStatus,
  resourceId?: string
) {
  let incidentFound = false;
  const updatedIncidents = incidents.map((incident) => {
    if (incident.id !== incidentId) return incident;
    incidentFound = true;
    const branchFound = incident.branches.some((branch) => branch.id === branchId);
    if (!branchFound) throw new Error(`Response branch ${branchId} was not found on ${incidentId}.`);

    const branches = incident.branches.map((branch) =>
      branch.id === branchId
        ? { ...branch, status, assignedResourceId: resourceId ?? branch.assignedResourceId }
        : branch
    );
    const activeBranches = branches.filter((branch) => branch.status !== "RESOLVED");
    const incidentStatus =
      branches.length > 0 && activeBranches.length === 0
        ? "RESOLVED"
        : activeBranches.reduce<IncidentStatus>(
            (highest, branch) =>
              statusProgress[branch.status] > statusProgress[highest] ? branch.status : highest,
            activeBranches[0]?.status ?? status
          );

    return {
      ...incident,
      status: incidentStatus,
      branches,
    };
  });

  if (!incidentFound) throw new Error(`Incident ${incidentId} was not found.`);
  return updatedIncidents;
}

function isResourceForBranch(resource: Resource, branchId: Incident["branches"][number]["id"]) {
  if (["FOOD", "WATER", "SHELTER", "CLOTHING", "VOLUNTEER"].includes(branchId)) {
    return resource.category === "NGO";
  }
  return resource.category === branchId;
}

const statusProgress: Record<IncidentStatus, number> = {
  OPEN: 0,
  REPORT_RECEIVED: 0,
  REVIEWING: 1,
  CLAIMED: 2,
  DISPATCHED: 2,
  RESOURCE_ASSIGNED: 2,
  RESPONDING: 3,
  ON_SCENE: 4,
  RESOLVED: 5,
  ESCALATED: 1,
};

export const useAppStore = create<AppState>()(
  persist<AppState, [], [], PersistedAppState>(
    (set) => ({
      incidents: incidentSeed,
      resources: resourceSeed,
      hasHydrated: false,
      selectedResponderType: "FIRE",
      selectedResponderResourceId: "fire-alpha",
      submittedIncidentId: null,
      currentLocation: null,
      setIncidents: (incidents) => set({ incidents }),
      addIncident: (incident) =>
        set((state) => ({ incidents: [incident, ...state.incidents] })),
      addResponseBranch: (incidentId, branch) =>
        set((state) => {
          if (!state.incidents.some((incident) => incident.id === incidentId)) {
            throw new Error(`Incident ${incidentId} was not found.`);
          }
          if (state.incidents.some((incident) =>
            incident.id === incidentId && incident.branches.some((item) => item.id === branch.id)
          )) {
            throw new Error(`A ${branch.id} response branch already exists.`);
          }
          return {
            incidents: state.incidents.map((incident) =>
              incident.id === incidentId
                ? {
                    ...incident,
                    status: incident.status === "REPORT_RECEIVED" ? "REVIEWING" : incident.status,
                    branches: [...incident.branches, branch],
                    tags: [...new Set([...incident.tags, branch.label])],
                  }
                : incident
            ),
          };
        }),
      setResources: (resources) => set({ resources }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setResponderType: (type) => {
        const category = type === "NGO" ? "NGO" : type;
        const firstUnit = resourceSeed.find((resource) => resource.category === category);
        set({
          selectedResponderType: type,
          selectedResponderResourceId: firstUnit?.id ?? null,
        });
      },
      setResponderResourceId: (selectedResponderResourceId) =>
        set({ selectedResponderResourceId }),
      setCurrentLocation: (location) => set({ currentLocation: location }),
      setSubmittedIncidentId: (id) => set({ submittedIncidentId: id }),
      dispatchResource: (incidentId, branchId, resourceId) =>
        set((state) => {
          const resource = state.resources.find((item) => item.id === resourceId);
          if (!resource) throw new Error(`Resource ${resourceId} was not found.`);
          if (resource.status !== "AVAILABLE") throw new Error(`${resource.name} is no longer available.`);
          const incident = state.incidents.find((item) => item.id === incidentId);
          const branch = incident?.branches.find((item) => item.id === branchId);
          if (!branch) throw new Error(`Response branch ${branchId} was not found on ${incidentId}.`);
          if (!["OPEN", "REVIEWING", "REPORT_RECEIVED"].includes(branch.status)) {
            throw new Error(`${branch.label} is already assigned or in progress.`);
          }
          if (!isResourceForBranch(resource, branchId)) {
            throw new Error(`${resource.name} cannot be assigned to ${branch.label}.`);
          }

          return {
            incidents: updateBranchStatus(
              state.incidents,
              incidentId,
              branchId,
              "DISPATCHED",
              resourceId
            ),
            resources: state.resources.map((item) =>
              item.id === resourceId
                ? { ...item, status: "EN_ROUTE", currentLoad: (item.currentLoad ?? 0) + 1 }
                : item
            ),
          };
        }),
      claimBranch: (incidentId, branchId, resourceId) =>
        set((state) => {
          const resource = state.resources.find((item) => item.id === resourceId);
          if (!resource) throw new Error(`Resource ${resourceId} was not found.`);
          if (resource.status !== "AVAILABLE") throw new Error(`${resource.name} is already assigned.`);
          const incident = state.incidents.find((item) => item.id === incidentId);
          const branch = incident?.branches.find((item) => item.id === branchId);
          if (!branch) throw new Error(`Response branch ${branchId} was not found on ${incidentId}.`);
          if (!["OPEN", "REVIEWING", "REPORT_RECEIVED"].includes(branch.status)) {
            throw new Error(`${branch.label} is already assigned or in progress.`);
          }
          if (!isResourceForBranch(resource, branchId)) {
            throw new Error(`${resource.name} cannot accept ${branch.label}.`);
          }

          return {
            incidents: updateBranchStatus(
              state.incidents,
              incidentId,
              branchId,
              "CLAIMED",
              resourceId
            ),
            resources: state.resources.map((item) =>
              item.id === resourceId
                ? { ...item, status: "EN_ROUTE", currentLoad: (item.currentLoad ?? 0) + 1 }
                : item
            ),
          };
        }),
      setBranchStatus: (incidentId, branchId, status) =>
        set((state) => {
          const incident = state.incidents.find((item) => item.id === incidentId);
          const branch = incident?.branches.find((item) => item.id === branchId);
          if (!branch) throw new Error(`Response branch ${branchId} was not found on ${incidentId}.`);
          const allowedNextStatus: Partial<Record<IncidentStatus, IncidentStatus>> = {
            CLAIMED: "RESPONDING",
            DISPATCHED: "RESPONDING",
            RESPONDING: "ON_SCENE",
            ON_SCENE: "RESOLVED",
          };
          if (allowedNextStatus[branch.status] !== status) {
            throw new Error(`Cannot move ${branch.label} from ${branch.status} to ${status}.`);
          }
          const resolvedResourceId =
            status === "RESOLVED" ? branch?.assignedResourceId : undefined;

          return {
            incidents: updateBranchStatus(state.incidents, incidentId, branchId, status),
            resources: resolvedResourceId
              ? state.resources.map((resource) =>
                  resource.id === resolvedResourceId
                    ? {
                        ...resource,
                        status: "AVAILABLE",
                        currentLoad: Math.max(0, (resource.currentLoad ?? 1) - 1),
                      }
                    : resource
                )
              : state.resources,
          };
        }),
      updateIncidentStatus: (incidentId, status) =>
        set((state) => {
          if (!state.incidents.some((incident) => incident.id === incidentId)) {
            throw new Error(`Incident ${incidentId} was not found.`);
          }
          return {
            incidents: state.incidents.map((incident) => ({
              ...incident,
              status,
              branches: incident.branches.map((branch) =>
                branch.status === "RESOLVED" ? branch : { ...branch, status }
              ),
            })),
          };
        }),
      resetDemoData: () =>
        set({
          incidents: structuredClone(incidentSeed),
          resources: structuredClone(resourceSeed),
          selectedResponderType: "FIRE",
          selectedResponderResourceId: "fire-alpha",
          submittedIncidentId: null,
          currentLocation: null,
        }),
    }),
    {
      name: "resq-demo-state",
      version: 6,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error("Failed to load the saved RESQ demo state.", error);
        state?.setHasHydrated(true);
      },
      migrate: () => ({
        incidents: structuredClone(incidentSeed),
        resources: structuredClone(resourceSeed),
        selectedResponderType: "FIRE",
        selectedResponderResourceId: "fire-alpha",
        submittedIncidentId: null,
        currentLocation: null,
      }),
      partialize: (state) => ({
        incidents: state.incidents,
        resources: state.resources,
        selectedResponderType: state.selectedResponderType,
        selectedResponderResourceId: state.selectedResponderResourceId,
        submittedIncidentId: state.submittedIncidentId,
        currentLocation: state.currentLocation,
      }),
    }
  )
);
