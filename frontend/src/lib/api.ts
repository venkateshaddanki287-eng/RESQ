import { useAppStore } from "@/store/app-store";
import type { Incident, IncidentSubmission, Resource } from "@/types/incident";

export const delay = (ms = 1200) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getIncidents(): Promise<Incident[]> {
  await delay(300);
  return useAppStore.getState().incidents;
}

export async function getIncident(id: string): Promise<Incident | null> {
  await delay(250);
  return useAppStore.getState().incidents.find((incident) => incident.id === id) ?? null;
}

export async function getResources(): Promise<Resource[]> {
  await delay(200);
  return useAppStore.getState().resources;
}

export async function submitIncident(payload: {
  description: string;
  location: IncidentSubmission["location"];
}): Promise<IncidentSubmission> {
  await delay(1600);

  const currentState = useAppStore.getState();
  let id: string;
  do {
    id = `RX-${Math.floor(1000 + Math.random() * 9000)}`;
  } while (currentState.incidents.some((incident) => incident.id === id));

  const submission: IncidentSubmission = {
    id,
    description: payload.description,
    location: payload.location,
    createdAt: "Just now",
  };

  currentState.addIncident({
    ...submission,
    status: "REPORT_RECEIVED",
    title: "New citizen report",
    priority: null,
    branches: [],
    affectedPeople: 1,
    source: "CITIZEN",
    tags: ["Untriaged"],
  });

  return submission;
}

export async function dispatchResource(
  incidentId: string,
  branchId: Incident["branches"][number]["id"],
  resourceId: string
): Promise<void> {
  await delay(500);
  useAppStore.getState().dispatchResource(incidentId, branchId, resourceId);
}

export async function addResponseBranch(
  incidentId: string,
  branch: Incident["branches"][number]
): Promise<void> {
  await delay(250);
  useAppStore.getState().addResponseBranch(incidentId, branch);
}

export async function claimRequest(
  incidentId: string,
  branchId: Incident["branches"][number]["id"],
  resourceId: string
): Promise<void> {
  await delay(350);
  useAppStore.getState().claimBranch(incidentId, branchId, resourceId);
}

export async function updateBranchStatus(
  incidentId: string,
  branchId: Incident["branches"][number]["id"],
  status: Incident["status"]
): Promise<void> {
  await delay(300);
  useAppStore.getState().setBranchStatus(incidentId, branchId, status);
}

export async function updateIncidentStatus(
  incidentId: string,
  status: Incident["status"]
): Promise<void> {
  await delay(350);
  useAppStore.getState().updateIncidentStatus(incidentId, status);
}
