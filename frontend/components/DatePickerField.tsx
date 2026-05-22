"use client";

import { useState } from "react";

export default function DatePickerField() {
  const [dueDate, setDueDate] = useState("");

  return (
    <div className="flex flex-col gap-2 w-full select-none">
      <label className="text-sm font-bold text-[#1c1c1c] font-sans tracking-tight">
        Due Date
      </label>
      <div className="relative w-full">
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full bg-[#fcfcfc] text-[#1c1c1c] border border-[#e5e5e5] rounded-[16px] px-4 py-3.5 pr-12 text-sm focus:outline-none focus:border-[#f06e30] focus:ring-1 focus:ring-[#f06e30] transition-all duration-200 placeholder:text-[#a0a0a0] font-sans font-medium"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7c7c7c] pointer-events-none">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
      </div>
    </div>
  );
}
