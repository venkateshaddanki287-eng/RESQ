import type { Incident } from "@/types/incident";

export type RealtimeEvent = {
  type: "NEW_INCIDENT" | "STATUS_UPDATE" | "ASSIGNMENT";
  payload: Partial<Incident> & { id: string };
};

export function subscribeToRealtime(callback: (event: RealtimeEvent) => void) {
  const interval = setInterval(() => {
    callback({
      type: "NEW_INCIDENT",
      payload: {
        id: "RX-1045",
        title: "Power outage affecting elevator access",
        priority: "HIGH",
        status: "OPEN",
      },
    });
  }, 24000);

  return () => clearInterval(interval);
}
