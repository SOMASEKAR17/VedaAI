"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import { createAssignment } from "@/lib/api";
import UploadZone from "@/components/UploadZone";
import DatePickerField from "@/components/DatePickerField";
import QuestionTypeTable from "@/components/QuestionTypeTable";
import AdditionalInfoField from "@/components/AdditionalInfoField";
import AssignmentTracker from "@/components/AssignmentTracker";

export default function CreateAssignment() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdAssignmentId, setCreatedAssignmentId] = useState<string | null>(null);

  const {

    title,
    subject,
    gradeLevel,
    difficulty,
    dueDate,
    questionTypes,
    additionalInfo,
    file,
    errors,
    

    setTitle,
    setSubject,
    setGradeLevel,
    setDifficulty,
    

    validateForm,
    resetForm,
  } = useAssignmentStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const totalQuestions = questionTypes.reduce((sum, row) => sum + row.count, 0);
      const totalMarks = questionTypes.reduce((sum, row) => sum + row.count * row.marks, 0);
      const typesArray = questionTypes.map((row) => row.type);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("subject", subject);
      formData.append("gradeLevel", gradeLevel);
      formData.append("dueDate", dueDate);
      formData.append("questionTypes", JSON.stringify(typesArray));
      formData.append("totalQuestions", String(totalQuestions));
      formData.append("totalMarks", String(totalMarks));
      formData.append("difficulty", difficulty);
      formData.append("additionalInstructions", additionalInfo || "");

      if (file) {
        formData.append("file", file);
      }



      const res = await createAssignment(formData);
      
      if (res.success && res.assignmentId) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
        setCreatedAssignmentId(res.assignmentId);
      } else {
        setErrorMsg(res.error || "Failed to create assignment");
        setIsSubmitting(false);
      }
    } catch (err: any) {

      setErrorMsg(err.message || "An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  const handleTrackerComplete = () => {
    const id = createdAssignmentId;
    resetForm();
    if (id) {
      router.push(`/assignments/${id}`);
    } else {
      router.push("/");
    }
  };

  const handleTrackerCancel = () => {
    setCreatedAssignmentId(null);
    setIsSubmitting(false);
  };

  const uniqueErrorMessages = Array.from(
    new Set(Object.keys(errors).map((key) => errors[key]))
  );

  return (
    <div className="flex-1 flex flex-col gap-6 select-none max-w-4xl mx-auto w-full pb-10">
      
      <div className="flex flex-col gap-1 w-full px-1">
        <div className="flex items-center gap-2 transition-all duration-500">
          {createdAssignmentId ? (
            <div className="w-3.5 h-3.5 rounded-full bg-[#f06e30] border-2 border-white shadow-sm shrink-0 animate-ping" />
          ) : (
            <div className="w-3 h-3 rounded-full bg-[#22c55e] border-2 border-white shadow-sm shrink-0" />
          )}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1c1c1c] font-sans transition-all duration-300">
            {createdAssignmentId ? "AI Assessment Creator" : "Create Assignment"}
          </h1>
        </div>
        <p className="text-[13px] sm:text-sm text-[#7c7c7c] font-medium font-sans transition-all duration-300">
          {createdAssignmentId 
            ? "Real-time status updates from our generation engine" 
            : "Set up a new assignment for your students"}
        </p>

        <div className="w-full bg-[#e5e5e5] h-1 rounded-full overflow-hidden mt-6 flex gap-1">
          <div 
            className="bg-[#2d2d2d] h-full rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: createdAssignmentId ? '66.666%' : '33.333%' }}
          />
        </div>
      </div>

      <div className="overflow-hidden w-full relative">
        <div 
          className="flex transition-transform duration-500 ease-in-out w-[200%]"
          style={{ transform: createdAssignmentId ? 'translateX(-50%)' : 'translateX(0%)' }}
        >
          <div className="w-1/2 shrink-0 pr-1 flex flex-col gap-6">
            
            {uniqueErrorMessages.length > 0 && (
              <div className="bg-[#fdf5f2] border border-[#e15222]/30 rounded-[20px] p-4.5 flex gap-3.5 items-start animate-fade-in">
                <div className="w-6 h-6 rounded-full bg-[#e15222] text-white flex items-center justify-center shrink-0 text-xs font-bold font-sans">
                  !
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-bold text-[#e15222] font-sans tracking-tight">
                    Please fix the following validation errors:
                  </h4>
                  <ul className="list-disc pl-5 text-xs text-[#7c7c7c] font-medium font-sans flex flex-col gap-1 mt-1">
                    {uniqueErrorMessages.map((msg, index) => (
                      <li key={index} className="leading-relaxed">
                        {msg}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="bg-[#fdf5f2] border border-[#e15222]/30 rounded-[20px] p-4.5 flex gap-3.5 items-start animate-fade-in text-[#e15222]">
                <div className="w-6 h-6 rounded-full bg-[#e15222] text-white flex items-center justify-center shrink-0 text-xs font-bold font-sans">
                  !
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-bold text-[#e15222] font-sans tracking-tight">
                    Server/Network Error:
                  </h4>
                  <p className="text-xs text-[#7c7c7c] font-medium mt-1">{errorMsg}</p>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-[28px] shadow-[0_6px_24px_rgba(0,0,0,0.02)] border border-[#f0f0f0]/50 p-5 sm:p-8 flex flex-col gap-6 sm:gap-7 w-full relative animate-fade-in"
            >
        <div className="flex flex-col gap-0.5 border-b border-[#f5f5f5] pb-4">
          <h2 className="text-lg font-bold text-[#1c1c1c] font-sans tracking-tight">
            Assignment Details
          </h2>
          <p className="text-xs text-[#7c7c7c] font-medium font-sans">
            Basic information about your assessment
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-bold text-[#1c1c1c] font-sans tracking-tight">
            Assignment Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. NCERT Science Chapter 8 Mock Test"
            className={`w-full bg-[#fcfcfc] text-[#1c1c1c] border rounded-[16px] px-4 py-3.5 text-sm focus:outline-none focus:ring-1 transition-all duration-200 placeholder:text-[#a0a0a0] font-sans font-medium ${
              errors.title
                ? "border-[#e15222] focus:border-[#e15222] focus:ring-[#e15222]/20"
                : "border-[#e5e5e5] focus:border-[#f06e30] focus:ring-[#f06e30]/20"
            }`}
          />
          {errors.title && (
            <span className="text-[11px] font-bold text-[#e15222] font-sans px-1">
              {errors.title}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5.5">
          <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-bold text-[#1c1c1c] font-sans tracking-tight">
              Subject
            </label>
            <div className="relative w-full">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={`w-full bg-[#fcfcfc] text-[#1c1c1c] border rounded-[16px] px-4 py-3.5 pr-10 text-sm focus:outline-none transition-all duration-200 font-sans font-medium appearance-none cursor-pointer ${
                  errors.subject
                    ? "border-[#e15222]"
                    : "border-[#e5e5e5] focus:border-[#f06e30]"
                }`}
              >
                <option value="" disabled>
                  Select Subject
                </option>
                <option value="English">English</option>
                <option value="Science">Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Social Studies">Social Studies</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Computer Science">Computer Science</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7c7c7c] pointer-events-none">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="w-4 h-4"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
            {errors.subject && (
              <span className="text-[11px] font-bold text-[#e15222] font-sans px-1">
                {errors.subject}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-bold text-[#1c1c1c] font-sans tracking-tight">
              Grade Level / Class
            </label>
            <div className="relative w-full">
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className={`w-full bg-[#fcfcfc] text-[#1c1c1c] border rounded-[16px] px-4 py-3.5 pr-10 text-sm focus:outline-none transition-all duration-200 font-sans font-medium appearance-none cursor-pointer ${
                  errors.gradeLevel
                    ? "border-[#e15222]"
                    : "border-[#e5e5e5] focus:border-[#f06e30]"
                }`}
              >
                <option value="" disabled>
                  Select Grade
                </option>
                <option value="5th">Class 5th</option>
                <option value="6th">Class 6th</option>
                <option value="7th">Class 7th</option>
                <option value="8th">Class 8th</option>
                <option value="9th">Class 9th</option>
                <option value="10th">Class 10th</option>
                <option value="11th">Class 11th</option>
                <option value="12th">Class 12th</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7c7c7c] pointer-events-none">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="w-4 h-4"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
            {errors.gradeLevel && (
              <span className="text-[11px] font-bold text-[#e15222] font-sans px-1">
                {errors.gradeLevel}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-bold text-[#1c1c1c] font-sans tracking-tight font-sans">
            Difficulty Level
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
            {(["easy", "medium", "hard", "mixed"] as const).map((level) => {
              const isActive = difficulty === level;
              const colorMap = {
                easy: "hover:border-green-400 active:bg-green-50/50",
                medium: "hover:border-blue-400 active:bg-blue-50/50",
                hard: "hover:border-red-400 active:bg-red-50/50",
                mixed: "hover:border-orange-400 active:bg-orange-50/50",
              };
              const activeStyles = {
                easy: "border-green-500 bg-green-50/30 text-green-700 shadow-sm",
                medium: "border-blue-500 bg-blue-50/30 text-blue-700 shadow-sm",
                hard: "border-red-500 bg-red-50/30 text-red-700 shadow-sm",
                mixed: "border-orange-500 bg-orange-50/30 text-orange-700 shadow-sm",
              };
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`border rounded-2xl py-3 px-4 text-center cursor-pointer capitalize font-sans text-xs sm:text-sm font-bold transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                    isActive
                      ? activeStyles[level]
                      : "border-[#e5e5e5] bg-white text-[#7c7c7c] " + colorMap[level]
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        <UploadZone />

        <DatePickerField />

        <div className="border-t border-[#f5f5f5] pt-5">
          <QuestionTypeTable />
        </div>

        <div className="border-t border-[#f5f5f5] pt-5">
          <AdditionalInfoField />
        </div>
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

      <div className="w-1/2 shrink-0 pl-1">
        {createdAssignmentId && (
          <AssignmentTracker
            assignmentId={createdAssignmentId}
            onComplete={handleTrackerComplete}
            onCancel={handleTrackerCancel}
          />
        )}
      </div>

    </div>
  </div>
</div>
  );
}
