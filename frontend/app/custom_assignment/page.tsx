"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { fetchAssignmentDetails, downloadPDF } from "@/lib/api";

interface Question {
  questionNumber: number;
  text: string;
  type: string;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  options: string[];
  answer?: string;
}

interface Section {
  title: string;
  instruction: string;
  questions: Question[];
}

interface Assignment {
  _id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  totalQuestions: number;
  totalMarks: number;
  difficulty: string;
  createdAt: string;
  dueDate: string;
  result?: {
    sections: Section[];
    totalMarks: number;
  } | null;
}

function CustomAssignmentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [keptQuestionNumbers, setKeptQuestionNumbers] = useState<number[]>([]);
  const [expandedAnswers, setExpandedAnswers] = useState<Record<number, boolean>>({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchAssignmentDetails(id);
        setAssignment(data);
        if (data && data.result?.sections) {
          const allNumbers = data.result.sections
            .flatMap((s: Section) => s.questions)
            .map((q: Question) => q.questionNumber);
          setKeptQuestionNumbers(allNumbers);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 mt-5 flex flex-col gap-6 select-none max-w-4xl mx-auto w-full pb-16 animate-pulse px-4">
        <div className="bg-[#252525] rounded-[28px] p-6 sm:p-8 text-white flex flex-col gap-4">
          <div className="h-6 bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-700 rounded w-1/2" />
        </div>
        <div className="bg-white rounded-[28px] shadow-sm p-6 sm:p-14 flex flex-col gap-6 min-h-[400px]">
          <div className="h-7 bg-gray-200 rounded w-1/3 self-center" />
          <div className="h-5 bg-gray-200 rounded w-1/2 self-center mt-2" />
          <div className="h-16 bg-gray-100 rounded-[18px] w-full mt-6" />
          <div className="h-20 bg-gray-50 rounded-xl w-full" />
          <div className="h-20 bg-gray-50 rounded-xl w-full" />
        </div>
      </div>
    );
  }

  if (!id || !assignment) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-20 px-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-16 h-16 text-[#7c7c7c]/40">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h3 className="text-xl font-bold text-[#1c1c1c]">Assignment Not Found</h3>
        <p className="text-sm text-[#7c7c7c] max-w-[320px]">
          The assignment you are trying to customize does not exist or has been deleted.
        </p>
        <Link href="/" className="bg-[#121212] hover:bg-[#2c2c2c] text-white py-3 px-6 rounded-full font-bold text-xs shadow-sm mt-2 transition-transform">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const sections = assignment.result?.sections || [];

  const handleToggleQuestion = (qNum: number) => {
    setKeptQuestionNumbers((prev) =>
      prev.includes(qNum) ? prev.filter((num) => num !== qNum) : [...prev, qNum]
    );
  };

  const handleToggleAnswerVisibility = (qNum: number) => {
    setExpandedAnswers((prev) => ({
      ...prev,
      [qNum]: !prev[qNum],
    }));
  };

  const handleSelectAll = () => {
    const allNumbers = sections.flatMap((s) => s.questions).map((q) => q.questionNumber);
    setKeptQuestionNumbers(allNumbers);
  };

  const handleDeselectAll = () => {
    setKeptQuestionNumbers([]);
  };

  const dynamicTotalQuestions = keptQuestionNumbers.length;
  const dynamicTotalMarks = sections.reduce((sum, s) => {
    const sectionMarks = s.questions
      .filter((q) => keptQuestionNumbers.includes(q.questionNumber))
      .reduce((sSum, q) => sSum + q.marks, 0);
    return sum + sectionMarks;
  }, 0);

  const getDifficultyLabel = (difficulty: string) => {
    const d = difficulty.toLowerCase().trim();
    if (d === "easy") return "Easy";
    if (d === "hard") return "Challenging";
    return "Moderate";
  };

  const getSimulatedAnswer = (qText: string, qType: string, options: string[], marks: number) => {
    const lower = qText.toLowerCase();
    if (lower.includes("electroplating")) {
      return "Electroplating is the process of depositing a thin layer of metal on the surface of another metal using electric current. Its purpose is to prevent corrosion, improve appearance, or increase thickness.";
    }
    if (lower.includes("conductor") && lower.includes("electrolysis")) {
      return "A conductor allows the flow of electric current, causing ions in the electrolyte to move and enabling chemical changes at electrodes.";
    }
    if (lower.includes("copper sulfate")) {
      return "Copper sulfate solution contains free copper and sulfate ions which carry electric charge, thus conducting electricity.";
    }
    if (lower.includes("chemical effect")) {
      return "An example of the chemical effect of electric current is the electroplating of silver on jewelry to prevent tarnishing.";
    }
    if (lower.includes("electric current") && lower.includes("chemical effects")) {
      return "Electric current causes the movement of ions in an electrolyte, leading to chemical changes at the electrodes (e.g., gas release, metal deposition), which shows chemical effects.";
    }
    if (lower.includes("sodium hydroxide")) {
      return "Sodium hydroxide is formed at the cathode during brine electrolysis as water gains electrons:\n2H₂O + 2e⁻ → H₂ + 2OH⁻\nNa⁺ + OH⁻ → NaOH (in solution)";
    }
    if (lower.includes("cathode") && lower.includes("anode")) {
      return "At the cathode: water is reduced to hydrogen gas and hydroxide ions.\nAt the anode: water is oxidized to oxygen gas and hydrogen ions.";
    }
    if (lower.includes("importance of electric current") && lower.includes("metallurgy")) {
      return "Electric current is critical in electrometallurgy for extracting highly reactive metals (like sodium or aluminum) from their ores and refining metals via electrolytic purification.";
    }
    if (lower.includes("chemical equation") && lower.includes("copper")) {
      return "During the electroplating of copper, copper ions migrate to the cathode (object) and are reduced to metallic copper:\nCu²⁺(aq) + 2e⁻ → Cu(s)\nAt the pure copper anode, oxidation takes place:\nCu(s) → Cu²⁺(aq) + 2e⁻";
    }

    if (qType === "MCQ" && options && options.length > 0) {
      return "Option A is the correct answer because it directly satisfies the structural conditions described in the NCERT reference text.";
    }
    return `Ideal response should correctly define the core concept, explain its theoretical background, list practical applications, and include relevant chemical equations or diagrams where applicable (valued at ${marks} Marks).`;
  };

  const handleDownload = async (withAnswerKey: boolean) => {
    setShowDownloadModal(false);
    setIsDownloading(true);
    try {
      const success = await downloadPDF(assignment._id, assignment.title, withAnswerKey, keptQuestionNumbers);
      if (!success) {
        alert("Failed to generate PDF. Please verify backend is running.");
      }
    } catch {
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 select-none max-w-4xl mx-auto w-full pb-44 sm:pb-32 animate-fade-in px-4 sm:px-0 text-left">
      
      <div className="bg-[#252525] rounded-[28px] p-6 sm:p-8 text-white flex flex-col gap-4 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2">
          <Link href={`/assignments/${assignment._id}`} className="text-gray-400 hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#f06e30] font-sans">Customizer</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold font-inter tracking-tight leading-relaxed">
          Customize Assessment Questions
        </h1>
        <p className="text-[13px] sm:text-sm font-semibold text-gray-300 font-inter max-w-2xl leading-relaxed">
          Select or exclude questions to refine your question paper. The output PDF and answer keys will adapt dynamically.
        </p>

        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <button
            onClick={handleSelectAll}
            className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-5 rounded-full text-xs transition-colors cursor-pointer w-full sm:w-auto"
          >
            Select All
          </button>
          <button
            onClick={handleDeselectAll}
            className="bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-2 px-5 rounded-full text-xs transition-colors cursor-pointer w-full sm:w-auto"
          >
            Deselect All
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[28px] shadow-[0_4px_30px_rgba(0,0,0,0.015)] border border-[#f0f0f0]/60 p-5 sm:p-12 text-[#1c1c1c] flex flex-col mt-4 font-inter leading-relaxed relative">
        
        <div className="flex flex-col items-center text-center gap-1.5 mb-6">
          <h2 className="text-base sm:text-xl font-extrabold uppercase tracking-wide text-[#1c1c1c] max-w-md sm:max-w-none">
            Delhi Public School, Sector-4, Bokaro
          </h2>
          <div className="flex flex-col gap-0.5 mt-0.5">
            <h3 className="text-xs sm:text-sm font-bold text-gray-700">
              Subject: {assignment.subject}
            </h3>
            <h3 className="text-xs sm:text-sm font-bold text-gray-700">
              Class: {assignment.gradeLevel}
            </h3>
          </div>
        </div>

        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-2 text-gray-400 py-16">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12 text-gray-300">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p className="text-sm font-bold">No questions available to customize</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="flex flex-col gap-5 border-b border-gray-100/70 pb-6 last:border-b-0">
                <div className="text-left border-b border-gray-150 pb-1.5">
                  <h3 className="text-sm sm:text-base font-extrabold text-[#1c1c1c]">
                    {section.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] italic text-[#7c7c7c] mt-0.5">
                    {section.instruction}
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {section.questions.map((q) => {
                    const isKept = keptQuestionNumbers.includes(q.questionNumber);
                    const isAnswerExpanded = expandedAnswers[q.questionNumber] || false;
                    const simulatedAnswer = q.answer || getSimulatedAnswer(q.text, q.type, q.options, q.marks);

                    return (
                      <div
                        key={q.questionNumber}
                        onClick={() => handleToggleQuestion(q.questionNumber)}
                        className={`border rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-all duration-300 cursor-pointer ${
                          isKept
                            ? "bg-white border-[#f06e30]/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] hover:border-[#f06e30]/70"
                            : "bg-[#f8f8f8] border-gray-200 opacity-45 grayscale text-gray-500"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center transition-all duration-200 mt-0.5 shrink-0 ${
                                isKept
                                  ? "bg-[#121212] border-[#121212] text-white"
                                  : "bg-white border-gray-300 text-transparent"
                              }`}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                            <div className="flex flex-col gap-1 w-full">
                              <span className={`text-xs sm:text-[13px] font-bold leading-relaxed font-sans ${isKept ? "text-[#1c1c1c]" : "text-gray-400 line-through"}`}>
                                Q{q.questionNumber}. [{getDifficultyLabel(q.difficulty)}] {q.text}
                              </span>
                              
                              {q.options && q.options.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 pl-1 mt-1">
                                  {q.options.map((opt, optIdx) => {
                                    const labels = ["A", "B", "C", "D"];
                                    return (
                                      <div key={optIdx} className="text-xs flex items-start gap-1 font-semibold text-gray-500">
                                        <span className="font-extrabold">{labels[optIdx]}.</span>
                                        <span>{opt.replace(/^[A-D]\.\s*/i, "")}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-sans tracking-wider shrink-0">
                              {q.marks} Mark{q.marks > 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>

                        {isKept && (
                          <div 
                            className="border-t border-gray-100 pt-3.5 mt-1 flex flex-col gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleToggleAnswerVisibility(q.questionNumber)}
                              className="text-[11px] font-extrabold text-[#f06e30] hover:text-[#e05e20] flex items-center gap-1 cursor-pointer focus:outline-none w-fit"
                            >
                              {isAnswerExpanded ? "Hide Answer Preview" : "Show Answer Preview"}
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                className={`w-3 h-3 transition-transform duration-200 ${isAnswerExpanded ? "rotate-180" : ""}`}
                              >
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </button>

                            {isAnswerExpanded && (
                              <div className="bg-[#fffbf9] border border-[#f06e30]/10 rounded-xl p-3 text-xs leading-relaxed font-semibold text-[#5c5c5c] animate-fade-in">
                                <strong className="text-[#1c1c1c] block mb-1">Simulated Answer Key Response:</strong>
                                {simulatedAnswer}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-4 left-4 right-4 md:left-[calc(16px+140px)] z-40 flex justify-center select-none max-w-4xl mx-auto w-full">
        <div className="bg-white/95 backdrop-blur-md rounded-[24px] sm:rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-gray-150 p-4 sm:py-3.5 sm:px-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-6 w-full animate-fade-in">
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7c7c7c] font-sans">Live Assessment Totals</span>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mt-0.5">
              <span className="text-xs sm:text-base font-extrabold text-[#1c1c1c]">
                {dynamicTotalQuestions} / {sections.flatMap((s) => s.questions).length} Kept
              </span>
              <span className="hidden sm:inline text-xs font-bold text-[#7c7c7c]">•</span>
              <span className="text-xs sm:text-sm font-extrabold text-[#f06e30]">
                {dynamicTotalMarks} / {assignment.totalMarks} Marks
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href={`/assignments/${assignment._id}`}
              className="bg-white hover:bg-gray-100 text-[#1c1c1c] font-bold py-3 px-4 sm:px-5 rounded-full text-xs border border-gray-200 transition-colors cursor-pointer flex-1 sm:flex-none text-center"
            >
              Cancel
            </Link>
            <button
              onClick={() => {
                if (dynamicTotalQuestions === 0) {
                  alert("Please select at least one question to generate the PDF.");
                  return;
                }
                setShowDownloadModal(true);
              }}
              disabled={isDownloading || dynamicTotalQuestions === 0}
              className="bg-[#121212] hover:bg-[#2a2a2a] disabled:bg-[#7c7c7c] text-white font-bold py-3 px-5 sm:px-7 rounded-full text-xs sm:text-[13px] shadow-sm flex items-center justify-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex-1 sm:flex-none"
            >
              {isDownloading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  Downloading...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" className="w-3.5 h-3.5 mr-2 text-white">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4 font-inter text-left relative">
            <button
              onClick={() => setShowDownloadModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-650 p-1.5 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="flex flex-col gap-1.5 mt-2">
              <h3 className="text-base font-extrabold text-[#1c1c1c]">Customize PDF Export</h3>
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                Should we attach the dynamically filtered Answer Key matching your kept questions at the end of the PDF file?
              </p>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={() => handleDownload(true)}
                className="w-full bg-[#121212] hover:bg-[#2c2c2c] text-white py-3.5 px-4 rounded-full font-bold text-xs shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                Include Answer Key
              </button>
              <button
                onClick={() => handleDownload(false)}
                className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-[#1c1c1c] py-3.5 px-4 rounded-full font-bold text-xs shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                Only Question Paper
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomAssignmentPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-20 select-none max-w-4xl mx-auto w-full">
        <div className="w-8 h-8 border-4 border-black/20 border-t-[#f06e30] rounded-full animate-spin shrink-0" />
      </div>
    }>
      <CustomAssignmentContent />
    </Suspense>
  );
}