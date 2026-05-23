"use client";

import { useAssignmentStore } from "@/store/useAssignmentStore";

export default function DatePickerField() {
  const { dueDate, setDueDate, errors } = useAssignmentStore();

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
          className={`w-full bg-[#fcfcfc] text-[#1c1c1c] border rounded-[16px] px-4 py-3.5  text-sm focus:outline-none focus:ring-1 transition-all duration-200 placeholder:text-[#a0a0a0] font-sans font-medium ${
            errors.dueDate
              ? "border-[#e15222] focus:border-[#e15222] focus:ring-[#e15222]/20"
              : "border-[#e5e5e5] focus:border-[#f06e30] focus:ring-[#f06e30]/20"
          }`}
        />
        <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${
          errors.dueDate ? "text-[#e15222]" : "text-[#7c7c7c]"
        }`}>
        </div>
      </div>
      {errors.dueDate && (
        <span className="text-[11px] font-bold text-[#e15222] font-sans px-1">
          {errors.dueDate}
        </span>
      )}
    </div>
  );
}
