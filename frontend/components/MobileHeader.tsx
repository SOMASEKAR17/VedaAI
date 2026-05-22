import Image from "next/image";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export default function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header className="flex md:hidden items-center justify-between bg-white rounded-[20px] px-5 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] select-none w-full">
      <div className="flex items-center gap-2.5">
        <Image
          src="/logo.svg"
          alt="VedaAI Logo"
          width={30}
          height={30}
          className="w-7.5 h-7.5"
        />
        <span className="text-xl font-bold tracking-tight text-[#1c1c1c] font-sans">
          VedaAI
        </span>
      </div>

      <div className="flex items-center gap-3.5">
        <button className="relative text-[#1c1c1c] hover:bg-[#f5f5f5] p-1.5 rounded-full transition-colors cursor-pointer">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5.5 h-5.5"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute top-[5px] right-[5px] w-2 h-2 bg-[#f05138] border border-white rounded-full" />
        </button>

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

        <button
          onClick={onMenuClick}
          className="text-[#1c1c1c] hover:bg-[#f5f5f5] p-1.5 rounded-full transition-colors cursor-pointer"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </div>
    </header>
  );
}
