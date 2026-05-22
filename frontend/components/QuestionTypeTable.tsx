"use client";

import { useState } from "react";

interface QuestionTypeRow {
  id: string;
  type: string;
  count: number;
  marks: number;
}

const AVAILABLE_TYPES = [
  "Multiple Choice Questions",
  "Short Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "Long Answer Questions",
  "True / False Questions",
  "Fill in the Blanks",
];

export default function QuestionTypeTable() {
  const [rows, setRows] = useState<QuestionTypeRow[]>([
    {
      id: "1",
      type: "Multiple Choice Questions",
      count: 4,
      marks: 1,
    },
    {
      id: "2",
      type: "Short Questions",
      count: 3,
      marks: 2,
    },
    {
      id: "3",
      type: "Diagram/Graph-Based Questions",
      count: 5,
      marks: 5,
    },
    {
      id: "4",
      type: "Numerical Problems",
      count: 5,
      marks: 5,
    },
  ]);

  const updateType = (id: string, newType: string) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, type: newType } : row)));
  };

  const incrementCount = (id: string) => {
    setRows(
      rows.map((row) => (row.id === id ? { ...row, count: row.count + 1 } : row))
    );
  };

  const decrementCount = (id: string) => {
    setRows(
      rows.map((row) =>
        row.id === id ? { ...row, count: Math.max(0, row.count - 1) } : row
      )
    );
  };

  const incrementMarks = (id: string) => {
    setRows(
      rows.map((row) => (row.id === id ? { ...row, marks: row.marks + 1 } : row))
    );
  };

  const decrementMarks = (id: string) => {
    setRows(
      rows.map((row) =>
        row.id === id ? { ...row, marks: Math.max(0, row.marks - 1) } : row
      )
    );
  };

  const addRow = () => {
    const newId = String(Date.now());
    setRows([
      ...rows,
      {
        id: newId,
        type: "Multiple Choice Questions",
        count: 1,
        marks: 1,
      },
    ]);
  };

  const deleteRow = (id: string) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const totalQuestions = rows.reduce((sum, row) => sum + row.count, 0);
  const totalMarks = rows.reduce((sum, row) => sum + row.count * row.marks, 0);

  return (
    <div className="w-full flex flex-col gap-5 select-none">
      <div className="flex justify-between items-center text-xs font-bold text-[#7c7c7c] px-1 font-sans">
        <span className="w-1/2 md:w-3/5">Question Type</span>
        <div className="flex w-1/2 md:w-2/5 justify-between pr-4 pl-8 sm:pl-16">
          <span className="w-24 text-center shrink-0">No. of Questions</span>
          <span className="w-20 text-center shrink-0">Marks</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex flex-col sm:flex-row items-center gap-3 w-full bg-transparent"
          >
            <div className="flex items-center gap-3 w-full sm:w-1/2 md:w-3/5">
              <div className="relative w-full">
                <select
                  value={row.type}
                  onChange={(e) => updateType(row.id, e.target.value)}
                  className="w-full bg-[#fcfcfc] text-[#1c1c1c] border border-[#e5e5e5] rounded-[16px] px-4 py-3 pr-10 text-sm focus:outline-none focus:border-[#f06e30] font-sans font-medium appearance-none cursor-pointer"
                >
                  {AVAILABLE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7c7c7c] pointer-events-none">
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

              <button
                type="button"
                onClick={() => deleteRow(row.id)}
                className="p-2 hover:bg-[#f5f5f5] text-[#7c7c7c] hover:text-[#e15222] rounded-full transition-colors cursor-pointer shrink-0"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4.5 h-4.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex w-full sm:w-1/2 md:w-2/5 justify-between items-center sm:pl-8 sm:pr-4 gap-4">
              <div className="flex items-center justify-between bg-[#f5f5f5] border border-[#ebebeb] rounded-full p-1.5 w-[110px] shrink-0 shadow-sm">
                <button
                  type="button"
                  onClick={() => decrementCount(row.id)}
                  className="w-7 h-7 rounded-full bg-white hover:bg-[#e6e6e6] text-[#1c1c1c] flex items-center justify-center font-bold text-sm shadow-sm transition-colors cursor-pointer"
                >
                  &minus;
                </button>
                <span className="font-bold text-sm text-[#1c1c1c] font-sans w-6 text-center">
                  {row.count}
                </span>
                <button
                  type="button"
                  onClick={() => incrementCount(row.id)}
                  className="w-7 h-7 rounded-full bg-white hover:bg-[#e6e6e6] text-[#1c1c1c] flex items-center justify-center font-bold text-sm shadow-sm transition-colors cursor-pointer"
                >
                  &#43;
                </button>
              </div>

              <div className="flex items-center justify-between bg-[#f5f5f5] border border-[#ebebeb] rounded-full p-1.5 w-[100px] shrink-0 shadow-sm">
                <button
                  type="button"
                  onClick={() => decrementMarks(row.id)}
                  className="w-7 h-7 rounded-full bg-white hover:bg-[#e6e6e6] text-[#1c1c1c] flex items-center justify-center font-bold text-sm shadow-sm transition-colors cursor-pointer"
                >
                  &minus;
                </button>
                <span className="font-bold text-sm text-[#1c1c1c] font-sans w-6 text-center">
                  {row.marks}
                </span>
                <button
                  type="button"
                  onClick={() => incrementMarks(row.id)}
                  className="w-7 h-7 rounded-full bg-white hover:bg-[#e6e6e6] text-[#1c1c1c] flex items-center justify-center font-bold text-sm shadow-sm transition-colors cursor-pointer"
                >
                  &#43;
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 gap-4">
        <button
          type="button"
          onClick={addRow}
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
