import Image from "next/image";
import Link from "next/link";

export default function EmptyState() {
  return (
    <div className="flex-1 bg-transparent rounded-[24px] flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 shadow-[0_2px_8px_rgba(0,0,0,0.02)] select-none">
      <div className="flex flex-col items-center w-full max-w-[90%] sm:max-w-[520px] text-center gap-4 sm:gap-6">
        <div className="relative w-full max-w-[min(340px,80vw)] aspect-[340/220]">
          <Image
            src="/no_assignments.svg"
            alt="No Assignments Illustration"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:gap-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1c1c1c] font-sans">
            No assignments yet
          </h2>
          <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#7c7c7c] font-sans">
            Create your first assignment to start collecting and grading student
            submissions. You can set up rubrics, define marking criteria, and
            let AI assist with grading.
          </p>
        </div>
        <Link
          href="/create-assignment" >
          <button className=" hidden md:flex items-center justify-center gap-2 bg-[#121212] hover:bg-[#2a2a2a] text-white py-2.5 sm:py-3 px-5 sm:px-6 rounded-full font-bold text-xs sm:text-sm tracking-wide shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer font-sans w-full sm:w-auto">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Your First Assignment
          </button>
        </Link>
      </div>
    </div>
  );
}