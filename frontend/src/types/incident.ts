export type IncidentStatus =
  | "OPEN"
  | "CLAIMED"
  | "DISPATCHED"
  | "RESPONDING"
  | "ON_SCENE"
  | "RESOLVED"
  | "ESCALATED"
  | "REVIEWING"
  | "REPORT_RECEIVED"
  | "RESOURCE_ASSIGNED";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ResponseType =
  | "FIRE"
  | "RESCUE"
  | "MEDICAL"
  | "NGO"
  | "SHELTER"
  | "FOOD"
  | "WATER"
  | "VOLUNTEER";

export interface Location {
  lat: number;
  lng: number;
  city: string;
  region: string;
  label: string;
}

export interface ResponseBranch {
  id: ResponseType;
  label: string;
  situation: string;
  recommendedResource: string;
  availability: "AVAILABLE" | "BUSY" | "UNAVAILABLE";
  distanceKm: number;
  status: IncidentStatus;
}

export interface Resource {
  id: string;
  category: ResponseType;
  name: string;
  status: "AVAILABLE" | "BUSY" | "EN_ROUTE";
  distanceKm: number;
  capacity?: number;
  currentLoad?: number;
}

export interface Incident {
  id: string;
  status: IncidentStatus;
  title: string;
  description: string;
  priority: Priority;
  branches: ResponseBranch[];
  createdAt: string;
  affectedPeople: number;
  location: Location;
  source: "CITIZEN" | "COORDINATOR" | "RESPONDER";
  tags: string[];
}

export interface IncidentSubmission {
  id: string;
  description: string;
  location: Location;
  createdAt: string;
}

export type ResponderType = "FIRE" | "RESCUE" | "MEDICAL" | "NGO";
