import Image from "next/image";

export default function EmptyState() {
  return (
    <div className="flex-1 bg-transparent rounded-[24px] flex flex-col items-center justify-center px-6 py-12 shadow-[0_2px_8px_rgba(0,0,0,0.02)] select-none">
      <div className="flex flex-col items-center max-w-[520px] text-center gap-6">
        <div className="relative w-[340px] h-[220px]">
          <Image
            src="/no_assignments.svg"
            alt="No Assignments Illustration"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-[#1c1c1c] font-sans">
            No assignments yet
          </h2>
          <p className="text-[14px] leading-relaxed text-[#7c7c7c] font-sans">
            Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 bg-[#121212] hover:bg-[#2a2a2a] text-white py-3 px-6 rounded-full font-bold text-sm tracking-wide shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer font-sans">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="w-4 h-4 text-white"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Your First Assignment
        </button>
      </div>
    </div>
  );
}
