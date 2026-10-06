import type { Incident } from "@/types/incident";
import { useAppStore } from "@/store/app-store";

export type RealtimeEvent = {
  type: "NEW_INCIDENT" | "STATUS_UPDATE" | "ASSIGNMENT";
  payload: Partial<Incident> & { id: string };
};

export function subscribeToRealtime(callback: (event: RealtimeEvent) => void) {
  let previousIncidents = useAppStore.getState().incidents;
  const unsubscribe = useAppStore.subscribe((state) => {
    const currentIncidents = state.incidents;
    const previousById = new Map(previousIncidents.map((incident) => [incident.id, incident]));

    for (const incident of currentIncidents) {
      const previous = previousById.get(incident.id);
      if (!previous) {
        callback({ type: "NEW_INCIDENT", payload: incident });
      } else if (
        incident.branches.some((branch) => {
          const oldBranch = previous.branches.find((item) => item.id === branch.id);
          return oldBranch?.assignedResourceId !== branch.assignedResourceId;
        })
      ) {
        callback({ type: "ASSIGNMENT", payload: incident });
      } else if (
        previous.status !== incident.status ||
        incident.branches.some((branch) => {
          const oldBranch = previous.branches.find((item) => item.id === branch.id);
          return oldBranch?.status !== branch.status;
        })
      ) {
        callback({ type: "STATUS_UPDATE", payload: incident });
      }
    }

    previousIncidents = currentIncidents;
  });

  return unsubscribe;
}
