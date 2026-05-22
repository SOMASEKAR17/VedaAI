import Image from "next/image";
import SidebarLink from "./SidebarLink";

export default function Sidebar() {
  return (
    <aside className="w-[280px] bg-white rounded-[24px] shadow-2xl p-6 flex flex-col justify-between h-[calc(100vh-2rem)] select-none">
      <div className="flex flex-col gap-8">
        <div className="flex">
          <Image
            src="/logo.svg"
            alt="VedaAI Logo"
            width={36}
            height={36}
            className="w-15 h-15"
          />
          <span className="text-3xl font-bold tracking-tight mt-1 -ml-2 text-[#1c1c1c] font-sans">
            VedaAI
          </span>
        </div>

        <button className="font-inter w-full relative p-[1.5px] rounded-full bg-gradient-to-r from-[#e15222] via-[#f06e30] to-[#fb923c] shadow-[0_4px_16px_rgba(240,110,48,0.15)] hover:shadow-[0_6px_20px_rgba(240,110,48,0.25)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer">
          <div className="flex items-center justify-center gap-2 bg-[#2d2d2d] text-white py-3 px-6 rounded-full font-medium text-sm">
            <Image
            src="/stars.svg"
            alt="star"
            width={36}
            height={36}
            className="w-5 h-5"
          />
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
            <Image 
              src="/pfp.jpg"
              alt="pfp"
              width={36}
              height={36}
              className="w-10 h-10 object-cover"
            />
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
