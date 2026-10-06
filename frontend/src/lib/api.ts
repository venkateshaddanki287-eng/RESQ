import { incidentSeed, resourceSeed } from "@/lib/mock-data";
import type { Incident, IncidentSubmission, Resource } from "@/types/incident";

export const delay = (ms = 1200) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getIncidents(): Promise<Incident[]> {
  await delay(300);
  return incidentSeed;
}

export async function getIncident(id: string): Promise<Incident | null> {
  await delay(250);
  return incidentSeed.find((incident) => incident.id === id) ?? null;
}

export async function getResources(): Promise<Resource[]> {
  await delay(200);
  return resourceSeed;
}

export async function submitIncident(payload: {
  description: string;
  location: IncidentSubmission["location"];
}): Promise<IncidentSubmission> {
  await delay(1600);

  return {
    id: `RX-${Math.floor(1000 + Math.random() * 9000)}`,
    description: payload.description,
    location: payload.location,
    createdAt: "Just now",
  };
}

export async function claimRequest(incidentId: string, resourceId: string): Promise<void> {
  await delay(500);
  const incident = incidentSeed.find((item) => item.id === incidentId);
  const resource = resourceSeed.find((item) => item.id === resourceId);

  if (!incident || !resource) return;

  incident.status = "CLAIMED";
  resource.status = "EN_ROUTE";

  incident.tags = [...new Set([...incident.tags, resource.category])];
}

export async function updateIncidentStatus(incidentId: string, status: Incident["status"]): Promise<void> {
  await delay(350);
  const incident = incidentSeed.find((item) => item.id === incidentId);
  if (incident) {
    incident.status = status;
  }
}
