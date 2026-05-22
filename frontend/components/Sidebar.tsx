import Image from "next/image";
import SidebarLink from "./SidebarLink";

export default function Sidebar() {
  return (
    <aside className="w-[280px] bg-white rounded-[24px] shadow-2xl p-6 flex flex-col justify-between h-[calc(100vh-2rem)] select-none">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="VedaAI Logo"
            width={36}
            height={36}
            className="w-9 h-9"
          />
          <span className="text-2xl font-bold tracking-tight text-[#1c1c1c] font-sans">
            VedaAI
          </span>
        </div>

        <button className="font-inter w-full relative p-[1.5px] rounded-full bg-gradient-to-r from-[#e15222] via-[#f06e30] to-[#fb923c] shadow-[0_4px_16px_rgba(240,110,48,0.15)] hover:shadow-[0_6px_20px_rgba(240,110,48,0.25)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer">
          <div className="flex items-center justify-center gap-2 bg-[#2d2d2d] text-white py-3 px-6 rounded-full font-medium text-sm">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 text-white"
            >
              <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            Create Assignment
          </div>
        </button>

        <nav className="flex flex-col gap-1">
          <SidebarLink
            href="#"
            label="Home"
            iconPath="/home.svg"
            isActive={false}
          />
          <SidebarLink
            href="#"
            label="My Groups"
            iconPath="/my_groups.svg"
            isActive={false}
          />
          <SidebarLink
            href="#"
            label="Assignments"
            iconPath="/assignments.svg"
            isActive={true}
          />
          <SidebarLink
            href="#"
            label="AI Teacher's Toolkit"
            iconPath="/ai_teacher_toolkit.svg"
            isActive={false}
          />
          <SidebarLink
            href="#"
            label="My Library"
            iconPath="/my_library.svg"
            isActive={false}
          />
        </nav>
      </div>

      <div className="flex flex-col gap-4">
        <SidebarLink
          href="#"
          label="Settings"
          iconPath="/settings.svg"
          isActive={false}
        />

        <div className="flex items-center gap-3 bg-[#f0f0f0] p-3 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-[#fde8e8] flex-shrink-0 flex items-center justify-center overflow-hidden border border-orange-200">
            <svg viewBox="0 0 64 64" className="w-8 h-8 text-orange-600">
              <circle cx="32" cy="32" r="30" fill="#FFE8E0" />
              <circle cx="32" cy="26" r="12" fill="#F472B6" />
              <rect x="20" y="24" width="24" height="6" rx="3" fill="#3B82F6" />
              <circle cx="28" cy="25" r="2" fill="#FFFFFF" />
              <circle cx="36" cy="25" r="2" fill="#FFFFFF" />
              <path d="M 24 46 Q 32 40 40 46" fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
              <circle cx="32" cy="48" r="8" fill="#FBBF24" />
            </svg>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-[#1c1c1c] truncate font-sans">
              Delhi Public School
            </span>
            <span className="text-[11px] text-[#7c7c7c] truncate font-sans">
              Bokaro Steel City
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
