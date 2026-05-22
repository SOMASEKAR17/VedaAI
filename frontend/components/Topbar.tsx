import Image from "next/image";

export default function Topbar() {
  return (
    <header className="bg-white rounded-[20px] px-6 py-3 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] select-none">
      <div className="flex items-center gap-4">
        <button className="text-[#1c1c1c] hover:bg-[#f5f5f5] p-2 rounded-full transition-colors cursor-pointer">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7c7c7c"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          <span className="text-[15px] font-medium text-[#7c7c7c] font-sans">
            Assignment
          </span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative text-[#1c1c1c] hover:bg-[#f5f5f5] p-2 rounded-full transition-colors cursor-pointer">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[22px] h-[22px]"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute top-[7px] right-[7px] w-2.5 h-2.5 bg-[#f05138] border-2 border-white rounded-full" />
        </button>

        <div className="flex items-center gap-2 bg-[#f0f0f0] pl-2 pr-3 py-1.5 rounded-full hover:bg-[#e6e6e6] transition-colors cursor-pointer select-none">
          <div className="w-7 h-7 rounded-full bg-[#fde8e8] flex items-center justify-center overflow-hidden border border-orange-200">
            <svg viewBox="0 0 64 64" className="w-6 h-6 text-orange-600">
              <circle cx="32" cy="32" r="30" fill="#FFE8E0" />
              <circle cx="32" cy="26" r="12" fill="#F472B6" />
              <rect x="20" y="24" width="24" height="6" rx="3" fill="#3B82F6" />
              <circle cx="28" cy="25" r="2" fill="#FFFFFF" />
              <circle cx="36" cy="25" r="2" fill="#FFFFFF" />
              <path d="M 24 46 Q 32 40 40 46" fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
              <circle cx="32" cy="48" r="8" fill="#FBBF24" />
            </svg>
          </div>
          <span className="text-sm font-bold text-[#1c1c1c] font-sans">
            John Doe
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1c1c1c"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5 text-[#1c1c1c]"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </header>
  );
}
