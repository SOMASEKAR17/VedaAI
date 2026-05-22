"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import SidebarLink from "./SidebarLink";

interface SidebarProps {
  isMobileDrawer?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isMobileDrawer = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { assignments, loadAssignments } = useAssignmentStore();

  useEffect(() => {
    loadAssignments();
  }, []);

  const badgeCount = assignments.length > 0 ? assignments.length : 10;

  return (
    <aside
      className={`select-none ${
        isMobileDrawer
          ? "flex flex-col justify-between h-full w-full bg-white p-6"
          : "w-[280px] bg-white rounded-[24px] shadow-2xl p-6 flex flex-col justify-between h-[calc(100vh-2rem)]"
      }`}
    >
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center -gap-5">
            <Image
              src="/logo.svg"
              alt="VedaAI Logo"
              width={36}
              height={36}
              className="w-15 h-15"
            />
            <span className="text-3xl font-bold tracking-tight -mt-4 text-[#1c1c1c] font-sans">
              VedaAI
            </span>
          </div>
          {isMobileDrawer && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#f5f5f5] text-[#7c7c7c] transition-colors cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="w-5.5 h-5.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <Link
          href="/create-assignment"
          onClick={onClose}
          className="font-inter w-full relative p-[1.5px] rounded-full bg-gradient-to-r from-[#e15222] via-[#f06e30] to-[#fb923c] shadow-[0_4px_16px_rgba(240,110,48,0.15)] hover:shadow-[0_6px_20px_rgba(240,110,48,0.25)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer block"
        >
          <div className="flex items-center justify-center gap-2 bg-[#2d2d2d] text-white py-3 px-6 rounded-full font-medium text-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-4 h-4 text-white"
            >
              <path d="M12 5v14M5 12h14" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            Create Assignment
          </div>
        </Link>

        <nav className="flex flex-col gap-1">
          <SidebarLink
            href="/"
            label="Home"
            iconPath="/home.svg"
            isActive={false}
            onClick={onClose}
          />
          <SidebarLink
            href="#"
            label="My Groups"
            iconPath="/my_groups.svg"
            isActive={false}
            onClick={onClose}
          />
          <SidebarLink
            href="/"
            label="Assignments"
            iconPath="/assignments.svg"
            isActive={pathname === "/" || pathname === "/assignments" || pathname === "/create-assignment"}
            onClick={onClose}
            badge={badgeCount}
          />
          <SidebarLink
            href="#"
            label="AI Teacher's Toolkit"
            iconPath="/ai_teacher_toolkit.svg"
            isActive={false}
            onClick={onClose}
          />
          <SidebarLink
            href="#"
            label="My Library"
            iconPath="/my_library.svg"
            isActive={false}
            onClick={onClose}
          />
        </nav>
      </div>

      <div className="flex flex-col gap-4">
        <SidebarLink
          href="#"
          label="Settings"
          iconPath="/settings.svg"
          isActive={false}
          onClick={onClose}
        />

        <div className="flex items-center gap-3 bg-[#f0f0f0] p-3 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-[#fde8e8] flex-shrink-0 flex items-center justify-center overflow-hidden border border-orange-200">
            <Image 
              src="/pfp.jpg"
              alt="pfp"
              width={36}
              height={36}
              className="w-8 h-8 object-cover"
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
