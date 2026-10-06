"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, MapPin, Mic, Radio, Send, Sparkles } from "lucide-react";
import { getIncidents, submitIncident } from "@/lib/api";
import { useAppStore } from "@/store/app-store";
import { StatusBadge } from "@/components/shared/resq-ui";
import type { Incident } from "@/types/incident";

const sampleLocation = {
  lat: 17.385044,
  lng: 78.486671,
  city: "Hyderabad",
  region: "Telangana",
  label: "Hyderabad, Telangana",
};

export function CitizenFlow() {
  const [step, setStep] = useState<"location" | "report" | "sending" | "received" | "status">("location");
  const [locationState, setLocationState] = useState<"idle" | "detecting" | "success" | "denied">("idle");
  const [locationText, setLocationText] = useState<string>("Hyderabad, Telangana");
  const [reportText, setReportText] = useState(
    "There is a fire in my apartment building.\nMy mother is trapped upstairs and my brother is injured."
  );
  const [, setLoading] = useState(false);
  const [submissionId, setSubmissionId] = useState("RX-1042");
  const [voiceActive, setVoiceActive] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(12);
  const [statusIncident, setStatusIncident] = useState<Incident | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { setCurrentLocation, currentLocation, setSubmittedIncidentId } = useAppStore();

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const incidents = await getIncidents();
        setStatusIncident(incidents[0] ?? null);
      } catch {
        setStatusError("Live status is temporarily unavailable.");
      }
    };

    if (step === "status") {
      fetchIncident();
    }
  }, [step]);

  useEffect(() => {
    if (!voiceActive) return;

    const timer = window.setInterval(() => {
      setRecordSeconds((previous) => (previous >= 59 ? 0 : previous + 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [voiceActive]);

  async function requestLocation() {
    setLocationState("detecting");

    if (!navigator.geolocation) {
      setLocationState("denied");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detected = {
          ...sampleLocation,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: "Hyderabad, Telangana",
        };
        setCurrentLocation(detected);
        setLocationText(detected.label);
        setLocationState("success");
      },
      () => {
        setLocationState("denied");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSubmit() {
    setLoading(true);
    setStep("sending");

    try {
      const result = await submitIncident({
        description: reportText,
        location: currentLocation ?? sampleLocation,
      });

      setSubmissionId(result.id);
      setSubmittedIncidentId(result.id);
      setCurrentLocation(currentLocation ?? sampleLocation);
      setStep("received");
    } catch {
      setStep("report");
      setLoading(false);
    }
  }

  function handleVoiceRecord() {
    if (!voiceActive) {
      const stream = navigator.mediaDevices.getUserMedia({ audio: true });
      stream.then((mediaStream) => {
        const recorder = new MediaRecorder(mediaStream);
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunksRef.current.push(event.data);
        };
        recorder.onstop = () => {
          const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
          if (audioBlob.size > 0) {
            setReportText((previous) => previous + "\n[voice note attached]");
          }
          mediaStream.getTracks().forEach((track) => track.stop());
        };
        recorder.start();
        setVoiceActive(true);
        setRecordSeconds(0);
      });
      return;
    }

    mediaRecorderRef.current?.stop();
    setVoiceActive(false);
  }

  const statusSteps = useMemo(
    () => [
      "REPORT RECEIVED",
      "REVIEWING",
      "RESOURCE ASSIGNED",
      "RESPONDING",
      "ON SCENE",
      "RESOLVED",
    ],
    []
  );

  const activeStatusIndex = statusIncident ? Math.max(0, statusSteps.indexOf(statusIncident.status.toUpperCase().replace(" ", "_"))) : 0;

  return (
    <div className="w-full rounded-[28px] border border-[#2B2E31] bg-[#111315] p-4 sm:p-6">
      {step === "location" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7E858B]">Where are you?</div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#3FB6A8]/30 bg-[#1A1D1F] px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[#3FB6A8]">
              <span className="h-2 w-2 rounded-full bg-[#3FB6A8]" /> System operational
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight text-[#F2EFE7]">WHERE ARE YOU?</h2>
            <p className="max-w-md text-sm leading-6 text-[#7E858B]">We need your location so responders can find you.</p>
          </div>

          <button
            onClick={requestLocation}
            className="w-full rounded-xl bg-[#F2EFE7] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#111315] transition hover:bg-[#ffffff]"
          >
            {locationState === "detecting" ? "Detecting location..." : "USE MY LOCATION"}
          </button>

          {locationState === "success" && (
            <div className="rounded-2xl border border-[#3FB6A8]/35 bg-[#0F1717] p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[#3FB6A8]">
                <Check className="h-4 w-4" /> Location detected
              </div>
              <div className="mt-3 space-y-1 text-[#F2EFE7]">
                <div className="text-base font-medium">{locationText}</div>
                <div className="text-sm text-[#7E858B]">17.385044, 78.486671</div>
              </div>
              <button
                onClick={() => setStep("report")}
                className="mt-5 w-full rounded-xl border border-[#F2EFE7]/10 bg-[#1A1D1F] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#F2EFE7]"
              >
                CONTINUE
              </button>
            </div>
          )}

          {locationState === "denied" && (
            <div className="rounded-2xl border border-[#E5484D]/30 bg-[#1A1D1F] p-4 text-sm text-[#F2EFE7]">
              <div className="flex items-center gap-2 text-[#E5484D]">
                <AlertTriangle className="h-4 w-4" /> We couldn&apos;t access your location.
              </div>
              <p className="mt-3 text-[#7E858B]">You can enable location permission or enter your location manually.</p>
            </div>
          )}
        </div>
      )}

      {step === "report" && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7E858B]">
            <Radio className="h-3.5 w-3.5" /> Emergency report
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-[#F2EFE7]">TELL US WHAT HAPPENED</h2>
            <p className="text-sm text-[#7E858B]">Describe the situation in your own words. Don&apos;t worry about choosing a category.</p>
          </div>

          <label className="block">
            <textarea
              value={reportText}
              onChange={(event) => setReportText(event.target.value)}
              rows={8}
              placeholder="Example: There is a fire in my apartment building. My mother is trapped upstairs and my brother is injured."
              className="w-full rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-4 text-sm leading-6 text-[#F2EFE7] placeholder:text-[#7E858B] outline-none ring-0 focus:border-[#E5A93D]"
            />
          </label>

          <div className="rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-4">
            <div className="flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">
              <span className="h-px flex-1 bg-[#2B2E31]" /> OR <span className="h-px flex-1 bg-[#2B2E31]" />
            </div>

            <button
              type="button"
              onClick={handleVoiceRecord}
              className={`mt-4 flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] ${
                voiceActive ? "bg-[#E5484D] text-[#111315]" : "bg-[#111315] text-[#F2EFE7] border border-[#2B2E31]"
              }`}
            >
              <Mic className="h-4 w-4" />
              {voiceActive ? `Recording... ${recordSeconds.toString().padStart(2, "0")}` : "HOLD TO RECORD"}
            </button>

            {voiceActive && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-[#E5484D]/30 bg-[#1A1D1F] p-3 text-xs uppercase tracking-[0.18em] text-[#E5484D]">
                <span className="flex items-center gap-2"><span className="h-2 w-2 animate-pulse rounded-full bg-[#E5484D]" /> Recording</span>
                <button type="button" onClick={handleVoiceRecord} className="rounded-full border border-[#E5484D]/40 px-2 py-1 text-[10px] text-[#F2EFE7]">STOP RECORDING</button>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("location")}
              className="flex-1 rounded-xl border border-[#2B2E31] bg-[#111315] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#F2EFE7]"
            >
              BACK
            </button>
            <button
              onClick={handleSubmit}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#F2EFE7] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#111315]"
            >
              <Send className="h-4 w-4" /> Send report
            </button>
          </div>
        </div>
      )}

      {step === "sending" && (
        <div className="space-y-6 py-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#E5A93D]/30 bg-[#1A1D1F]">
            <Sparkles className="h-6 w-6 animate-pulse text-[#E5A93D]" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#F2EFE7]">ANALYZING YOUR REPORT</h2>
            <p className="mt-2 text-sm text-[#7E858B]">Understanding the situation, identifying response needs, finding your location, preparing the response request.</p>
          </div>
          <div className="space-y-3 text-left text-xs uppercase tracking-[0.2em] text-[#7E858B]">
            <div className="flex items-center justify-between rounded-xl border border-[#2B2E31] bg-[#1A1D1F] px-3 py-2"><span>Understanding the situation</span><span className="text-[#3FB6A8]">✓</span></div>
            <div className="flex items-center justify-between rounded-xl border border-[#2B2E31] bg-[#1A1D1F] px-3 py-2"><span>Identifying response needs</span><span className="text-[#E5A93D]">…</span></div>
            <div className="flex items-center justify-between rounded-xl border border-[#2B2E31] bg-[#1A1D1F] px-3 py-2"><span>Finding your location</span><span className="text-[#7E858B]">…</span></div>
            <div className="flex items-center justify-between rounded-xl border border-[#2B2E31] bg-[#1A1D1F] px-3 py-2"><span>Preparing the response request</span><span className="text-[#7E858B]">…</span></div>
          </div>
        </div>
      )}

      {step === "received" && (
        <div className="space-y-5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">Report received</div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#F2EFE7]">REPORT RECEIVED</h2>
          <div className="rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">Reference</div>
            <div className="mt-2 text-2xl font-semibold text-[#F2EFE7]">{submissionId}</div>
          </div>
          <p className="text-sm leading-6 text-[#7E858B]">Your report has been sent to the response coordination center.</p>
          <div className="grid gap-3 rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7E858B]">Location</div>
            <div className="flex items-center gap-2 text-sm text-[#F2EFE7]"><MapPin className="h-4 w-4 text-[#3FB6A8]" /> Hyderabad, Telangana</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7E858B]">Status</div>
            <div className="flex items-center gap-2 text-sm text-[#F2EFE7]"><span className="h-2 w-2 rounded-full bg-[#E5A93D]" /> Awaiting response assignment</div>
          </div>
          <button
            onClick={() => setStep("status")}
            className="w-full rounded-xl bg-[#F2EFE7] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#111315]"
          >
            VIEW RESPONSE STATUS
          </button>
        </div>
      )}

      {step === "status" && (
        <div className="space-y-6">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">Incident lifecycle</div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#F2EFE7]">CURRENT STATUS</h2>

          <div className="space-y-4">
            {statusSteps.map((stepName, index) => {
              const isDone = index <= (activeStatusIndex < 0 ? 0 : activeStatusIndex);
              const isCurrent = index === activeStatusIndex;
              return (
                <div key={stepName} className="flex items-center gap-3">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold ${isDone ? "border-[#3FB6A8] bg-[#3FB6A8] text-[#111315]" : isCurrent ? "border-[#E5A93D] bg-[#E5A93D] text-[#111315]" : "border-[#2B2E31] bg-[#111315] text-[#7E858B]"}`}>
                    {isDone ? "✓" : index + 1}
                  </div>
                  <span className={`text-sm ${isCurrent ? "text-[#F2EFE7]" : isDone ? "text-[#3FB6A8]" : "text-[#7E858B]"}`}>{stepName}</span>
                </div>
              );
            })}
          </div>

          {statusIncident && (
            <div className="rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium uppercase tracking-[0.2em] text-[#7E858B]">Response assigned</div>
                <StatusBadge status={statusIncident.status} />
              </div>
              <div className="mt-4 space-y-3 text-[#F2EFE7]">
                <div className="text-xl font-semibold">Rescue Team Alpha</div>
                <div className="flex items-center justify-between text-sm text-[#7E858B]">
                  <span>ETA</span>
                  <span className="text-[#F2EFE7]">8 min</span>
                </div>
                <div className="flex items-center justify-between text-sm text-[#7E858B]">
                  <span>Current status</span>
                  <span className="text-[#E5A93D]">Responding</span>
                </div>
              </div>
            </div>
          )}

          {statusError && <div className="rounded-xl border border-[#E5484D]/30 bg-[#1A1D1F] p-3 text-sm text-[#E5484D]">{statusError}</div>}

          <div className="rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-4">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">Response plan</div>
            <div className="space-y-3">
              <div className="rounded-xl border border-[#E5484D]/20 bg-[#1A1D1F] p-3">
                <div className="flex items-center gap-2 text-[#E5484D] font-semibold"><span>🔥</span> Fire Response</div>
                <div className="mt-2 text-sm text-[#F2EFE7]">Fire Team Alpha</div>
                <div className="text-xs text-[#7E858B]">Responding</div>
              </div>
              <div className="rounded-xl border border-[#E5A93D]/20 bg-[#1A1D1F] p-3">
                <div className="flex items-center gap-2 text-[#E5A93D] font-semibold"><span>🚨</span> Rescue</div>
                <div className="mt-2 text-sm text-[#F2EFE7]">Rescue Team 3</div>
                <div className="text-xs text-[#7E858B]">Assigned</div>
              </div>
              <div className="rounded-xl border border-[#3FB6A8]/20 bg-[#1A1D1F] p-3">
                <div className="flex items-center gap-2 text-[#3FB6A8] font-semibold"><span>🏥</span> Medical</div>
                <div className="mt-2 text-sm text-[#F2EFE7]">Ambulance 12</div>
                <div className="text-xs text-[#7E858B]">Awaiting dispatch</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
