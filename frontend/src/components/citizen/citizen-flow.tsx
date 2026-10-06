"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, MapPin, Mic, Radio, Send, Square } from "lucide-react";
import { submitIncident } from "@/lib/api";
import { useAppStore } from "@/store/app-store";
import type { Location } from "@/types/incident";

export function CitizenFlow() {
  const [step, setStep] = useState<"location" | "report" | "sending" | "received">("location");
  const [locationState, setLocationState] = useState<"idle" | "detecting" | "success" | "denied">("idle");
  const [manualLocation, setManualLocation] = useState("");
  const [reportText, setReportText] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [submissionLocation, setSubmissionLocation] = useState<Location | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const recordingChunks = useRef<Blob[]>([]);
  const { currentLocation, setCurrentLocation, setSubmittedIncidentId } = useAppStore();
  const latestLocation = currentLocation ?? submissionLocation;

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => setRecordingSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  useEffect(
    () => () => {
      if (voiceUrl) URL.revokeObjectURL(voiceUrl);
      mediaStream.current?.getTracks().forEach((track) => track.stop());
    },
    [voiceUrl]
  );

  function requestLocation() {
    setLocationError(null);
    setLocationState("detecting");

    if (!navigator.geolocation) {
      setLocationState("denied");
      setLocationError("This browser does not support location detection.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detected: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          city: "Current location",
          region: "GPS",
          label: "Current location",
        };
        setCurrentLocation(detected);
        setLocationState("success");
      },
      (error) => {
        setLocationState("denied");
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied."
            : "We could not determine your location."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function saveManualLocation() {
    const label = manualLocation.trim();
    if (!label) {
      setLocationError("Enter a nearby address, landmark, or area to continue.");
      return;
    }
    setCurrentLocation({
      lat: null,
      lng: null,
      city: label,
      region: "Manually entered",
      label: `${label} · manually entered`,
    });
    setLocationState("success");
    setLocationError(null);
  }

  async function startRecording() {
    setVoiceError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setVoiceError("Audio recording is not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;
      const recorder = new MediaRecorder(stream);
      recordingChunks.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordingChunks.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordingChunks.current, { type: recorder.mimeType || "audio/webm" });
        if (blob.size > 0) {
          setVoiceUrl((previousUrl) => {
            if (previousUrl) URL.revokeObjectURL(previousUrl);
            return URL.createObjectURL(blob);
          });
        }
        mediaStream.current?.getTracks().forEach((track) => track.stop());
        mediaStream.current = null;
        setRecording(false);
      };
      mediaRecorder.current = recorder;
      recorder.start();
      setRecordingSeconds(0);
      setRecording(true);
    } catch {
      setVoiceError("Microphone access was unavailable. You can still type your report.");
    }
  }

  function stopRecording() {
    if (mediaRecorder.current?.state === "recording") mediaRecorder.current.stop();
  }

  async function handleSubmit() {
    const description = reportText.trim() || (voiceUrl ? "Voice recording attached (demo only)." : "");
    if (!description) {
      setSubmitError("Describe what happened or attach a voice recording.");
      return;
    }
    if (!currentLocation) {
      setSubmitError("Set your location before sending the report.");
      setStep("location");
      return;
    }

    setSubmitError(null);
    setStep("sending");
    try {
      const result = await submitIncident({ description, location: currentLocation });
      setSubmissionId(result.id);
      setSubmissionLocation(currentLocation);
      setSubmittedIncidentId(result.id);
      setStep("received");
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : "Your report could not be sent. Try again.");
      setStep("report");
    }
  }

  return (
    <div className="w-full rounded-[28px] border border-[#2B2E31] bg-[#111315] p-4 text-[#F2EFE7] sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7E858B]">
          <Radio className="h-3.5 w-3.5" /> RESQ emergency report
        </div>
        <span className="rounded-full border border-[#E5A93D]/30 bg-[#1A1D1F] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[#E5A93D]">
          Mock mode
        </span>
      </div>

      {step === "location" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">WHERE ARE YOU?</h1>
            <p className="max-w-md text-sm leading-6 text-[#7E858B]">
              We need your location so responders can find you.
            </p>
          </div>

          <button
            type="button"
            onClick={requestLocation}
            disabled={locationState === "detecting"}
            className="w-full rounded-xl bg-[#F2EFE7] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#111315] disabled:opacity-60"
          >
            {locationState === "detecting" ? "Detecting location…" : "Use my location"}
          </button>

          {locationState === "success" && currentLocation && (
            <div className="rounded-2xl border border-[#3FB6A8]/35 bg-[#0F1717] p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[#3FB6A8]">
                <Check className="h-4 w-4" /> Location set
              </div>
              <div className="mt-3 text-base font-medium">{currentLocation.label}</div>
              {currentLocation.lat !== null && currentLocation.lng !== null && (
                <div className="mt-1 text-sm text-[#7E858B]">
                  {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}
                </div>
              )}
              <button
                type="button"
                onClick={() => setStep("report")}
                className="mt-5 w-full rounded-xl border border-[#F2EFE7]/10 bg-[#1A1D1F] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em]"
              >
                Continue
              </button>
            </div>
          )}

          {(locationState === "denied" || locationState === "idle") && (
            <div className="rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-4">
              {locationState === "denied" && (
                <div className="mb-3 text-sm text-[#F2EFE7]">
                  <div className="flex items-center gap-2 text-[#E5484D]">
                    <AlertTriangle className="h-4 w-4" /> We couldn&apos;t access your location.
                  </div>
                  <p className="mt-2 text-[#7E858B]">
                    {locationError ?? "Enable location permission or enter your location manually."}
                  </p>
                </div>
              )}
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#7E858B]">
                  Enter a nearby address or landmark
                </span>
                <input
                  value={manualLocation}
                  onChange={(event) => setManualLocation(event.target.value)}
                  placeholder="Street, landmark, or area"
                  className="w-full rounded-xl border border-[#2B2E31] bg-[#111315] px-3 py-3 text-sm text-[#F2EFE7] placeholder:text-[#7E858B]"
                />
              </label>
              <button
                type="button"
                onClick={saveManualLocation}
                className="mt-3 w-full rounded-xl border border-[#2B2E31] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#F2EFE7]"
              >
                Set location manually
              </button>
              {locationError && (
                <p role="alert" className="mt-2 text-xs text-[#E5484D]">{locationError}</p>
              )}
              <p className="mt-3 text-xs leading-5 text-[#7E858B]">
                Manual locations are not placed on the map until coordinates are available.
              </p>
            </div>
          )}
        </div>
      )}

      {step === "report" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">TELL US WHAT HAPPENED</h1>
            <p className="text-sm text-[#7E858B]">
              Describe the situation in your own words. Don&apos;t worry about choosing a category.
            </p>
          </div>
          <label className="block">
            <span className="sr-only">Describe what happened</span>
            <textarea
              value={reportText}
              onChange={(event) => setReportText(event.target.value)}
              rows={7}
              placeholder={"Example:\nThere is a fire in my apartment building. My mother is trapped upstairs and my brother is injured."}
              className="w-full rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-4 text-sm leading-6 text-[#F2EFE7] placeholder:text-[#7E858B] outline-none focus:border-[#E5A93D]"
            />
          </label>

          <div className="rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-4">
            <div className="flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">
              <span className="h-px flex-1 bg-[#2B2E31]" /> OR <span className="h-px flex-1 bg-[#2B2E31]" />
            </div>
            {!recording && !voiceUrl && (
              <button
                type="button"
                onClick={startRecording}
                className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl border border-[#2B2E31] bg-[#111315] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em]"
              >
                <Mic className="h-4 w-4" /> Record a voice message
              </button>
            )}
            {recording && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-[#E5484D]/30 bg-[#111315] p-3 text-xs uppercase tracking-[0.18em]">
                <span className="flex items-center gap-2 text-[#E5484D]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#E5484D]" />
                  Recording · {String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:
                  {String(recordingSeconds % 60).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="inline-flex items-center gap-1 rounded-full border border-[#E5484D]/40 px-2 py-1 text-[10px] text-[#F2EFE7]"
                >
                  <Square className="h-3 w-3" /> Stop
                </button>
              </div>
            )}
            {voiceUrl && !recording && (
              <div className="mt-4 space-y-3 rounded-xl border border-[#3FB6A8]/25 bg-[#111315] p-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3FB6A8]">
                  Voice message ready
                </div>
                <audio controls src={voiceUrl} className="w-full" aria-label="Recorded voice message" />
                <button
                  type="button"
                  onClick={() => setVoiceUrl(null)}
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7E858B]"
                >
                  Record again
                </button>
                <p className="text-xs leading-5 text-[#7E858B]">
                  Voice is recorded locally for this demo; the mock backend currently receives the report text only.
                </p>
              </div>
            )}
            {voiceError && <p role="alert" className="mt-3 text-xs text-[#E5484D]">{voiceError}</p>}
          </div>

          {submitError && (
            <div role="alert" className="rounded-xl border border-[#E5484D]/30 bg-[#1A1D1F] p-3 text-sm text-[#E5484D]">
              {submitError}
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("location")}
              className="flex-1 rounded-xl border border-[#2B2E31] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={recording}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#F2EFE7] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#111315] disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> Send report
            </button>
          </div>
        </div>
      )}

      {step === "sending" && (
        <div className="space-y-6 py-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#E5A93D]/30 bg-[#1A1D1F]">
            <Send className="h-5 w-5 animate-pulse text-[#E5A93D]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">SENDING YOUR REPORT</h1>
            <p className="mt-2 text-sm text-[#7E858B]">
              Submitting your report and location to the coordination queue.
            </p>
          </div>
          <div className="rounded-xl border border-[#E5A93D]/20 bg-[#1A1D1F] p-3 text-xs leading-5 text-[#7E858B]">
            Mock mode · no AI analysis or real emergency dispatch is taking place.
          </div>
        </div>
      )}

      {step === "received" && submissionId && latestLocation && (
        <div className="space-y-5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">
            Report received
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">REPORT RECEIVED</h1>
          <div className="rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7E858B]">
              Reference
            </div>
            <div className="mt-2 text-2xl font-semibold">{submissionId}</div>
          </div>
          <p className="text-sm leading-6 text-[#7E858B]">
            Your report has been added to the response coordination queue.
          </p>
          <div className="grid gap-3 rounded-2xl border border-[#2B2E31] bg-[#1A1D1F] p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7E858B]">
              Location
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-[#3FB6A8]" /> {latestLocation.label}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7E858B]">
              Status
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-[#E5A93D]" /> Awaiting coordinator review
            </div>
          </div>
          <Link
            href={`/report/status/${submissionId}`}
            className="block w-full rounded-xl bg-[#F2EFE7] px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.18em] text-[#111315]"
          >
            View response status
          </Link>
        </div>
      )}
    </div>
  );
}
