"use client";

import { useState } from "react";
import { downloadPDF } from "@/lib/api";

interface Question {
  questionNumber: number;
  text: string;
  type: string;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  options: string[];
}

interface Section {
  title: string;
  instruction: string;
  questions: Question[];
}

interface AssignmentDetailsModalProps {
  assignment: {
    _id: string;
    title: string;
    subject: string;
    gradeLevel: string;
    totalQuestions: number;
    totalMarks: number;
    difficulty: string;
    additionalInstructions?: string;
    result?: {
      sections: Section[];
      totalMarks: number;
    } | null;
  };
  onClose: () => void;
}

export default function AssignmentDetailsModal({
  assignment,
  onClose,
}: AssignmentDetailsModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const success = await downloadPDF(assignment._id, assignment.title);
      if (success) {
      } else {
        alert("Failed to generate PDF. Please verify backend Puppeteer setup.");
      }
    } catch (err) {
    } finally {
      setIsDownloading(false);
    }
  };

  const sections = assignment.result?.sections || [];


  const getDuration = (marks: number) => {
    if (marks <= 20) return "45 minutes";
    if (marks <= 50) return "1.5 Hours";
    if (marks <= 80) return "2.5 Hours";
    return "3 Hours";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in select-none">

      <div className="bg-[#ebebeb] w-full max-w-4xl h-[90vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col border border-white/20 animate-scale-up">
        

        <div className="bg-white border-b border-[#f0f0f0] px-6 py-4.5 flex justify-between items-center shrink-0">
          <div className="flex flex-col text-left gap-0.5">
            <h2 className="text-base font-bold text-[#1c1c1c] font-sans tracking-tight">
              Assessment Preview
            </h2>
            <p className="text-[11px] text-[#7c7c7c] font-medium font-sans">
              Preview AI-generated paper for {assignment.title}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={isDownloading || !assignment.result}
              className="bg-[#121212] hover:bg-[#2d2d2d] disabled:bg-[#7c7c7c] text-white text-xs font-bold py-2.5 px-6 rounded-full flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              {isDownloading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  Download as PDF
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="bg-white hover:bg-[#f5f5f5] text-[#7c7c7c] hover:text-[#1c1c1c] border border-[#e5e5e5] p-2 rounded-full cursor-pointer shadow-sm transition-all duration-200"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>


        <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex justify-center bg-[#ebebeb] scrollbar-thin">
          

          <div className="bg-white max-w-2xl w-full min-h-[842px] shadow-lg border border-[#e0e0e0] rounded-[2px] p-8 sm:p-12 text-[#111111] flex flex-col text-left font-serif leading-relaxed relative">
            

            <div className="flex flex-col items-center text-center gap-1.5 border-b-2 border-[#111111] pb-4 mb-6">
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide font-sans text-[#1a1a1a]">
                Delhi Public School, Bokaro Steel City
              </h1>
              <div className="flex flex-col gap-0.5 sm:gap-1 mt-1">
                <h3 className="text-sm sm:text-base font-bold">
                  Subject: {assignment.subject}
                </h3>
                <h3 className="text-sm sm:text-base font-bold">
                  Class: {assignment.gradeLevel}
                </h3>
              </div>
            </div>


            <div className="flex justify-between items-center text-xs sm:text-sm font-bold border-b border-[#e0e0e0] pb-2 mb-6 font-sans">
              <span>Time Allowed: {getDuration(assignment.totalMarks)}</span>
              <span>Maximum Marks: {assignment.totalMarks}</span>
            </div>


            <div className="text-[11px] sm:text-xs font-semibold mb-6 border-b border-[#e0e0e0] pb-3.5 font-sans">
              <p className="mb-1 uppercase tracking-wider text-[#777]">General Instructions:</p>
              <ul className="list-disc pl-5 flex flex-col gap-1 text-[#444]">
                <li>All questions are compulsory unless stated otherwise.</li>
                {assignment.additionalInstructions && (
                  <li>Additional constraints: {assignment.additionalInstructions}</li>
                )}
              </ul>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm font-sans mb-8 border border-dashed border-[#dcdcdc] p-4 rounded-lg bg-gray-50/50">
              <div className="flex gap-2">
                <span className="font-bold shrink-0">Name:</span>
                <div className="border-b border-[#a0a0a0] flex-1 min-w-[120px]" />
              </div>
              <div className="flex gap-2">
                <span className="font-bold shrink-0">Roll Number:</span>
                <div className="border-b border-[#a0a0a0] flex-1 min-w-[80px]" />
              </div>
              <div className="flex gap-2 col-span-1 sm:col-span-2">
                <span className="font-bold shrink-0">Class {assignment.gradeLevel} Section:</span>
                <div className="border-b border-[#a0a0a0] flex-1 min-w-[100px]" />
              </div>
            </div>


            {sections.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 text-gray-400 py-20 font-sans">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12 text-gray-300">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <p className="text-sm font-bold">No generation results</p>
                <p className="text-xs">Wait for AI generation to complete.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-8 flex-1 pb-10">
                {sections.map((section, sIdx) => (
                  <div key={sIdx} className="flex flex-col gap-4">

                    <div className="flex flex-col items-center text-center border-b border-[#111111] pb-1.5 mb-1">
                      <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider font-sans">
                        {section.title}
                      </h2>
                      <p className="text-xs italic text-gray-500 font-sans mt-0.5">
                        {section.instruction}
                      </p>
                    </div>


                    <div className="flex flex-col gap-6">
                      {section.questions.map((q, qIdx) => (
                        <div key={qIdx} className="flex flex-col gap-2 relative group pl-2">
                          

                          <div className="flex items-start gap-2.5">
                            <span className="font-bold font-sans shrink-0 min-w-[28px]">
                              Q{q.questionNumber}.
                            </span>
                            <div className="flex-1 flex flex-col sm:flex-row justify-between items-start gap-2 pr-6">
                              <span className="text-[14px] sm:text-[15px] font-medium leading-relaxed">
                                {q.text}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0 mt-1 font-sans">
                                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border tracking-wide select-none ${
                                  q.difficulty === "easy"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : q.difficulty === "medium"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                                }`}>
                                  {q.difficulty}
                                </span>
                                <span className="text-[11px] font-bold text-gray-500">
                                  [{q.marks} Mark{q.marks > 1 ? "s" : ""}]
                                </span>
                              </div>
                            </div>
                          </div>


                          {q.options && q.options.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 pl-[38px] mt-1.5 font-sans">
                              {q.options.map((opt, optIdx) => {
                                const labels = ["A", "B", "C", "D"];
                                return (
                                  <div key={optIdx} className="text-xs text-gray-700 flex items-start gap-1">
                                    <span className="font-bold text-gray-900">{labels[optIdx]}.</span>
                                    <span>{opt.replace(/^[A-D]\.\s*/i, "")}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                        </div>
                      ))}
                    </div>
                  </div>
                ))}


                <div className="border-t-2 border-[#111111] pt-4 mt-8 flex justify-center shrink-0">
                  <span className="text-xs font-bold uppercase tracking-widest font-sans text-gray-400">
                    --- End of Question Paper ---
                  </span>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
