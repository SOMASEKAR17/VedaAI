"use client";

import Link from "next/link";
import { useState } from "react";
import UploadZone from "@/components/UploadZone";
import DatePickerField from "@/components/DatePickerField";
import QuestionTypeTable from "@/components/QuestionTypeTable";
import AdditionalInfoField from "@/components/AdditionalInfoField";

export default function CreateAssignment() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 select-none max-w-4xl mx-auto w-full pb-10">
      <div className="flex flex-col gap-1 w-full px-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#22c55e] border-2 border-white shadow-sm shrink-0" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1c1c1c] font-sans">
            Create Assignment
          </h1>
        </div>
        <p className="text-[13px] sm:text-sm text-[#7c7c7c] font-medium font-sans">
          Set up a new assignment for your students
        </p>

        <div className="w-full bg-[#e5e5e5] h-1 rounded-full overflow-hidden mt-6 flex gap-1">
          <div className="w-1/3 bg-[#2d2d2d] h-full rounded-full" />
          <div className="w-2/3 h-full bg-transparent" />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[28px] shadow-[0_6px_24px_rgba(0,0,0,0.02)] border border-[#f0f0f0]/50 p-5 sm:p-8 flex flex-col gap-6 sm:gap-7 w-full relative"
      >
        <div className="flex flex-col gap-0.5 border-b border-[#f5f5f5] pb-4">
          <h2 className="text-lg font-bold text-[#1c1c1c] font-sans tracking-tight">
            Assignment Details
          </h2>
          <p className="text-xs text-[#7c7c7c] font-medium font-sans">
            Basic information about your assignment
          </p>
        </div>

        <UploadZone />

        <DatePickerField />

        <div className="border-t border-[#f5f5f5] pt-5">
          <QuestionTypeTable />
        </div>

        <div className="border-t border-[#f5f5f5] pt-5">
          <AdditionalInfoField />
        </div>

        {showSuccess && (
          <div className="absolute inset-0 bg-white/95 rounded-[28px] flex flex-col items-center justify-center gap-4 text-center z-10 px-6 transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-500 border border-green-200">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="w-7 h-7"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-[#1c1c1c]">
                Assignment Created!
              </h3>
              <p className="text-xs text-[#7c7c7c] font-medium">
                Your new assignment has been successfully prepared for your students.
              </p>
            </div>
          </div>
        )}
      </form>

      <div className="flex justify-between items-center w-full mt-4 px-1">
        <Link
          href="/"
          className="bg-white hover:bg-[#f5f5f5] text-[#1c1c1c] font-bold py-3.5 px-7 rounded-full text-xs sm:text-sm border border-[#e5e5e5] shadow-sm flex items-center gap-2 cursor-pointer transition-all duration-200"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="w-4 h-4"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Previous
        </Link>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-[#121212] hover:bg-[#2a2a2a] disabled:bg-[#7c7c7c] text-white font-bold py-3.5 px-8 rounded-full text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
        >
          {isSubmitting ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
          ) : null}
          Next
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="w-4 h-4"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}
