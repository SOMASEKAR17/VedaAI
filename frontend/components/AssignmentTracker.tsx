"use client";

import { useEffect, useState, useRef } from "react";
import { WS_BASE_URL } from "@/lib/api";
import { useAssignmentStore } from "@/store/useAssignmentStore";

interface AssignmentTrackerProps {
  assignmentId: string;
  onComplete: (result: any) => void;
  onCancel: () => void;
}

interface Step {
  id: number;
  label: string;
  description: string;
  status: "pending" | "processing" | "completed" | "failed";
}

export default function AssignmentTracker({
  assignmentId,
  onComplete,
  onCancel,
}: AssignmentTrackerProps) {
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, label: "Assignment Registered", description: "Saved draft in database.", status: "completed" },
    { id: 2, label: "Queued in Job Engine", description: "Pushed to BullMQ worker queue.", status: "completed" },
    { id: 3, label: "AI Generation Active", description: "Calling Groq (Llama-3.3-70B) API to build questions.", status: "processing" },
    { id: 4, label: "Formatting Assessment", description: "Structuring sections, rubrics, and answer keys.", status: "pending" },
    { id: 5, label: "Ready to Review", description: "Saving finalized PDF parameters.", status: "pending" },
  ]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socketUrl = `${WS_BASE_URL}`;
    console.log(`Connecting to WebSocket: ${socketUrl}`);
    const ws = new WebSocket(socketUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connection established");
      // Register for updates on this assignmentId
      ws.send(
        JSON.stringify({
          type: "register",
          assignmentId,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("WebSocket event received:", message);

        if (message.event === "registered") {
          console.log(`Successfully registered client for assignment ID: ${assignmentId}`);
        } else if (message.event === "generation:started") {
          updateStepStatus(3, "processing");
          updateStepStatus(4, "pending");
        } else if (message.event === "generation:completed") {
          setSteps((prev) =>
            prev.map((step) =>
              step.id <= 5
                ? { ...step, status: "completed", description: step.id === 5 ? "Generation successful!" : step.description }
                : step
            )
          );
          setTimeout(() => {
            onComplete(message.payload.result);
          }, 1500);
        } else if (message.event === "generation:failed") {
          setSteps((prev) =>
            prev.map((step) =>
              step.status === "processing" ? { ...step, status: "failed" } : step
            )
          );
          setErrorMessage(message.payload.error || "Generation failed in the queue worker");
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [assignmentId, onComplete]);

  const updateStepStatus = (stepId: number, status: Step["status"]) => {
    setSteps((prev) =>
      prev.map((step) => {
        if (step.id === stepId) {
          return { ...step, status };
        }
        if (stepId > step.id && status === "processing") {
          return { ...step, status: "completed" };
        }
        return step;
      })
    );
  };

  return (
    <div className="flex-1 bg-white rounded-[28px] shadow-[0_6px_24px_rgba(0,0,0,0.02)] border border-[#f0f0f0]/50 p-6 sm:p-10 flex flex-col items-center justify-center max-w-2xl mx-auto w-full select-none">
      <div className="flex flex-col items-center text-center gap-2 mb-8">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#fdf5f2] flex items-center justify-center text-[#f06e30] border border-[#f06e30]/10 shadow-sm relative z-10">
            {errorMessage ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-7 h-7 text-[#e15222]">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            ) : steps[4].status === "completed" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-7 h-7 text-green-500 animate-bounce">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-6 h-6 animate-spin">
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
              </svg>
            )}
          </div>
          {!errorMessage && steps[4].status !== "completed" && (
            <div className="absolute inset-0 w-20 h-20 -left-2 -top-2 rounded-full border-2 border-dashed border-[#f06e30]/30 animate-spin-slow shrink-0" />
          )}
        </div>
        <h3 className="text-xl font-bold text-[#1c1c1c] font-sans mt-3">
          {errorMessage ? "Generation Failed" : steps[4].status === "completed" ? "Generation Complete!" : "Creating Assessment..."}
        </h3>
        <p className="text-xs text-[#7c7c7c] font-medium font-sans max-w-[280px]">
          {errorMessage ? "An error occurred during Groq AI generation." : "We are creating your questions in real-time. Do not close this tab."}
        </p>
      </div>

      <div className="w-full flex flex-col gap-6.5 max-w-md border-l-2 border-[#e5e5e5] pl-6.5 relative ml-6">
        {steps.map((step) => {
          const isDone = step.status === "completed";
          const isActive = step.status === "processing";
          const isFailed = step.status === "failed";

          return (
            <div key={step.id} className="relative flex flex-col text-left gap-1 group">
              <div
                className={`absolute -left-[35px] top-1 w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-extrabold border shadow-sm transition-all duration-300 ${
                  isFailed
                    ? "bg-[#e15222] text-white border-[#e15222]"
                    : isDone
                    ? "bg-green-500 text-white border-green-500"
                    : isActive
                    ? "bg-[#f06e30] text-white border-[#f06e30] animate-pulse"
                    : "bg-white text-[#7c7c7c] border-[#ebebeb]"
                }`}
              >
                {isDone ? "✓" : isFailed ? "!" : step.id}
              </div>

              <span
                className={`text-sm font-bold font-sans transition-colors duration-200 ${
                  isFailed
                    ? "text-[#e15222]"
                    : isDone
                    ? "text-[#1c1c1c]"
                    : isActive
                    ? "text-[#f06e30]"
                    : "text-[#7c7c7c]"
                }`}
              >
                {step.label}
              </span>
              <span className="text-[11px] text-[#a0a0a0] font-sans font-medium leading-relaxed">
                {step.description}
              </span>
            </div>
          );
        })}
      </div>

      {errorMessage && (
        <div className="w-full bg-[#fdf5f2] border border-[#e15222]/20 text-[#e15222] rounded-[18px] p-4 text-xs font-semibold font-sans mt-8 text-left leading-relaxed">
          Error Log: {errorMessage}
        </div>
      )}

      <div className="mt-8 flex justify-center w-full">
        <button
          onClick={onCancel}
          className="bg-white hover:bg-[#f5f5f5] text-[#7c7c7c] hover:text-[#1c1c1c] font-bold py-3.5 px-8 rounded-full text-xs sm:text-sm border border-[#e5e5e5] shadow-sm transition-all duration-200 cursor-pointer"
        >
          {errorMessage ? "Go Back" : "Cancel & Draft"}
        </button>
      </div>
    </div>
  );
}
