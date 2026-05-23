"use client";

import { useAssignmentStore } from "@/store/useAssignmentStore";

const AVAILABLE_TYPES = [
  "Multiple Choice Questions",
  "Short Questions",
  "Numerical Problems",
  "Long Answer Questions",
  "True / False Questions",
  "Fill in the Blanks",
];

export default function QuestionTypeTable() {
  const {
    questionTypes,
    errors,
    addQuestionType,
    removeQuestionType,
    updateQuestionType,
    incrementQuestionCount,
    decrementQuestionCount,
    incrementQuestionMarks,
    decrementQuestionMarks,
  } = useAssignmentStore();

  const totalQuestions = questionTypes.reduce((sum, row) => sum + row.count, 0);
  const totalMarks = questionTypes.reduce((sum, row) => sum + row.count * row.marks, 0);

  return (
    <div className="w-full flex flex-col gap-5 select-none">
      <div className="hidden md:flex justify-between items-center text-xs font-bold text-[#7c7c7c] px-1 font-sans">
        <span className="w-1/2 md:w-3/5">Question Type</span>
        <div className="flex w-1/2 md:w-2/5 justify-between pr-4 pl-8 sm:pl-16">
          <span className="w-24 text-center shrink-0">No. of Questions</span>
          <span className="w-20 text-center shrink-0">Marks</span>
        </div>
      </div>

      {questionTypes.length === 0 ? (
        <div
          className={`border-2 border-dashed rounded-[20px] p-6 text-center transition-all duration-300 ${
            errors.questionTypes
              ? "border-[#e15222] bg-[#fdf5f2]"
              : "border-[#ebebeb] bg-[#fcfcfc]"
          }`}
        >
          <span className="text-xs font-bold text-[#7c7c7c] block mb-1">
            No question types added yet
          </span>
          <span className="text-[11px] font-medium text-[#a0a0a0]">
            Use the add button below to define questions, count, and weightage.
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {questionTypes.map((row) => {
            const countError = errors[`count_${row.id}`];
            const marksError = errors[`marks_${row.id}`];

            return (
              <div
                key={row.id}
                className="flex flex-col gap-2 w-full border-b border-[#fbfbfb] md:border-b md:pb-3"
              >
                <div className="flex bg-white flex-col md:flex-row items-center gap-3 w-full p-4 md:p-0 border border-[#ebebeb] md:border-none rounded-[24px] md:rounded-none bg-[#fdfdfd] md:bg-transparent relative shadow-sm md:shadow-none">
                  
                  <div className="flex items-center gap-3 w-full md:w-3/5 pr-6 md:pr-0">
                    <div className="relative  w-full">
                      <select
                        value={row.type}
                        onChange={(e) => updateQuestionType(row.id, e.target.value)}
                        className="w-full bg-transparent md:bg-[#fcfcfc] text-[#1c1c1c] border-none md:border md:border-[#e5e5e5] rounded-none md:rounded-[16px] px-0 md:px-4 py-1 md:py-3 pr-10 text-base md:text-sm font-bold md:font-medium font-sans appearance-none cursor-pointer focus:outline-none"
                      >
                        {AVAILABLE_TYPES.map((type) => (
                          <option key={type} className="bg-transparent" value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1c1c1c] md:text-[#7c7c7c] pointer-events-none">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeQuestionType(row.id)}
                    className="absolute right-3 top-4 p-1 md:p-2 hover:bg-[#f5f5f5] text-[#1c1c1c] md:text-[#7c7c7c] hover:text-[#e15222] rounded-full transition-colors cursor-pointer shrink-0 md:static"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 md:w-4.5 md:h-4.5"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>

                  <div className="flex w-full md:w-2/5 justify-between items-center bg-[#f2f2f2] md:bg-transparent rounded-[20px] md:rounded-none p-3.5 md:p-0 mt-2 md:mt-0 md:pl-8 md:pr-4 gap-4">
                    
                    <div className="flex flex-col items-center gap-1.5 flex-1 md:flex-initial">
                      <span className="block md:hidden text-[11px] font-bold text-[#4a4a4a] font-sans">
                        No. of Questions
                      </span>
                      <div
                        className={`flex items-center justify-between border rounded-full p-1 w-full min-w-[105px] max-w-[130px] md:w-[110px] shrink-0 shadow-sm transition-all duration-200 ${
                          countError
                            ? "bg-[#fdf5f2] border-[#e15222]"
                            : "bg-white md:bg-[#f5f5f5] border-transparent md:border-[#ebebeb]"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => decrementQuestionCount(row.id)}
                          className="w-7 h-7 rounded-full bg-white text-[#7c7c7c] md:text-[#1c1c1c] md:hover:bg-[#e6e6e6] flex items-center justify-center font-bold text-sm shadow-sm md:shadow-sm border border-[#ebebeb] md:border-none transition-colors cursor-pointer"
                        >
                          &minus;
                        </button>
                        <span className="font-bold text-sm text-[#1c1c1c] font-sans w-6 text-center">
                          {row.count}
                        </span>
                        <button
                          type="button"
                          onClick={() => incrementQuestionCount(row.id)}
                          className="w-7 h-7 rounded-full bg-white text-[#7c7c7c] md:text-[#1c1c1c] md:hover:bg-[#e6e6e6] flex items-center justify-center font-bold text-sm shadow-sm md:shadow-sm border border-[#ebebeb] md:border-none transition-colors cursor-pointer"
                        >
                          &#43;
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 flex-1 md:flex-initial">
                      <span className="block md:hidden text-[11px] font-bold text-[#4a4a4a] font-sans">
                        Marks
                      </span>
                      <div
                        className={`flex items-center justify-between border rounded-full p-1 w-full min-w-[105px] max-w-[130px] md:w-[100px] shrink-0 shadow-sm transition-all duration-200 ${
                          marksError
                            ? "bg-[#fdf5f2] border-[#e15222]"
                            : "bg-white md:bg-[#f5f5f5] border-transparent md:border-[#ebebeb]"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => decrementQuestionMarks(row.id)}
                          className="w-7 h-7 rounded-full bg-white text-[#7c7c7c] md:text-[#1c1c1c] md:hover:bg-[#e6e6e6] flex items-center justify-center font-bold text-sm shadow-sm md:shadow-sm border border-[#ebebeb] md:border-none transition-colors cursor-pointer"
                        >
                          &minus;
                        </button>
                        <span className="font-bold text-sm text-[#1c1c1c] font-sans w-6 text-center">
                          {row.marks}
                        </span>
                        <button
                          type="button"
                          onClick={() => incrementQuestionMarks(row.id)}
                          className="w-7 h-7 rounded-full bg-white text-[#7c7c7c] md:text-[#1c1c1c] md:hover:bg-[#e6e6e6] flex items-center justify-center font-bold text-sm shadow-sm md:shadow-sm border border-[#ebebeb] md:border-none transition-colors cursor-pointer"
                        >
                          &#43;
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {(countError || marksError) && (
                  <div className="flex flex-col gap-0.5 px-4 md:px-0 sm:pl-4 w-full text-left shrink-0">
                    {countError && (
                      <span className="text-[10px] font-bold text-[#e15222] font-sans">
                        * {countError}
                      </span>
                    )}
                    {marksError && (
                      <span className="text-[10px] font-bold text-[#e15222] font-sans">
                        * {marksError}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {errors.questionTypes && (
        <span className="text-[11px] font-bold text-[#e15222] font-sans px-1">
          {errors.questionTypes}
        </span>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 gap-4">
        <button
          type="button"
          onClick={addQuestionType}
          className="flex items-center gap-2 text-sm font-bold text-[#1c1c1c] hover:text-[#f06e30] transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-[#121212] text-white flex items-center justify-center transition-colors">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="w-4 h-4 text-white"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          Add Question Type
        </button>

        <div className="flex flex-col items-end gap-1.5 w-full sm:w-auto text-right font-sans pr-4">
          <div className="text-sm font-bold text-[#7c7c7c]">
            Total Questions :{" "}
            <span className="text-[#1c1c1c] text-[16px]">
              {totalQuestions}
            </span>
          </div>
          <div className="text-sm font-bold text-[#7c7c7c]">
            Total Marks :{" "}
            <span className="text-[#1c1c1c] text-[16px]">
              {totalMarks}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}