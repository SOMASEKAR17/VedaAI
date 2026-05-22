import Image from "next/image";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export default function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header className="flex w-[80vw] md:hidden items-center justify-between bg-white rounded-[20px] px-5 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] select-none w-full">
      <div className="flex items-center -gap-4">
        <Image
          src="/logo.svg"
          alt="VedaAI Logo"
          width={10}
          height={10}
          className="w-10 object-contain h-10 translate-y-1.5"
        />
        <span className="text-xl font-bold tracking-tight  text-[#1c1c1c] font-sans">
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
          <Image 
            src="/pfp.jpg"
            alt="pfp"
            width={36}
            height={36}
            className="w-8 h-8 object-cover"
          />
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
