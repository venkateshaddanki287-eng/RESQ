# RESQ Frontend Demo

RESQ is a frontend-only disaster response coordination demo built with Next.js, TypeScript, Tailwind CSS, Leaflet, and Zustand.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Demo routes

- `/` — product landing page
- `/report` — citizen location and report flow
- `/report/status/RX-1042` — live status for a report in the current browser
- `/coordinator` — command center, incident queue, map, and resource inventory
- `/coordinator/incidents/RX-1042` — coordinator review, triage, and human-approved dispatch
- `/responder` — responder queue, role filters, claiming, and status progression
- `/responder/requests/RX-1042?branch=FIRE` — individual responder assignment
- `/resources` — resource inventory

## Demo behavior and limits

- Incidents, assignments, and resource availability use mock data stored in this browser's local storage. Use **Reset demo** in the command center to restore the seed data.
- Reports submitted in the citizen flow appear in the coordinator queue. New reports are untriaged until a coordinator adds response branches.
- A coordinator explicitly selects a response resource and approves dispatch. Responders can claim and advance their branch through responding, on-scene, and resolved.
- The map uses OpenStreetMap tiles and omits manually entered locations when coordinates are unavailable.
- Voice recordings are captured and played locally; the mock submission adapter currently submits text only.
- No backend, AI analysis, emergency service, or real dispatch is connected. The visible mock-mode labels are intentional.

## Checks

```bash
npm run lint
npm run build
```
