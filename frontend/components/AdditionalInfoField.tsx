"use client";

import { useState } from "react";
import { useAssignmentStore } from "@/store/useAssignmentStore";

export default function AdditionalInfoField() {
  const { additionalInfo, setAdditionalInfo } = useAssignmentStore();
  const [isListening, setIsListening] = useState(false);

  const toggleListen = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setAdditionalInfo(
          additionalInfo
            ? additionalInfo + " with voice instructions added."
            : "Generate a 3-hour exam paper focused on advanced calculus."
        );
        setIsListening(false);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full select-none">
      <label className="text-sm font-bold text-[#1c1c1c] font-sans tracking-tight">
        Additional Information (For better output)
      </label>
      <div
        className={`relative rounded-[24px] border transition-all duration-300 ${
          isListening
            ? "border-[#f06e30] ring-2 ring-[#f06e30]/10 bg-[#fdf5f2]"
            : "border-[#e5e5e5] bg-[#f9f9f9] hover:border-[#b0b0b0]"
        }`}
      >
        <textarea
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          placeholder={
            isListening
              ? "Listening to voice input..."
              : "e.g. Generate a question paper for 3 hour exam duration..."
          }
          disabled={isListening}
          className="w-full min-h-[140px] bg-transparent text-[#1c1c1c] rounded-[24px] px-5 py-4.5 pr-14 text-sm focus:outline-none placeholder:text-[#a0a0a0] font-sans font-medium resize-none"
        />

        <button
          type="button"
          onClick={toggleListen}
          className={`absolute right-4.5 bottom-4.5 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm ${
            isListening
              ? "bg-[#f06e30] text-white animate-pulse"
              : "bg-white hover:bg-[#f5f5f5] text-[#7c7c7c] hover:text-[#1c1c1c]"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
        </button>
      </div>
    </div>
  );
}
