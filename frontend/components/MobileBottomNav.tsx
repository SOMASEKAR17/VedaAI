"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from 'next/image';

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex md:hidden items-center justify-around bg-[#121212] rounded-[24px] py-3.5 px-6 shadow-[0_8px_30px_rgba(0,0,0,0.3)] w-full select-none">
      <Link
        href="/"
        className={`flex flex-col items-center gap-1 cursor-pointer group transition-colors duration-200 ${
          pathname === "/" ? "text-white font-bold" : "text-[#7c7c7c] hover:text-white"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5.5 h-5.5"
        >
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
        <span className="text-[11px] font-sans">Home</span>
      </Link>

      <Link
        href="/create-assignment"
        className={`flex flex-col items-center gap-1 cursor-pointer group transition-colors duration-200 ${
          pathname === "/create-assignment" ? "text-white font-bold" : "text-[#7c7c7c] hover:text-white"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5.5 h-5.5"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="8" y1="14" x2="16" y2="14" />
        </svg>
        <span className="text-[11px] font-sans">Create</span>
      </Link>

      <Link
        href="#"
        className="flex flex-col items-center gap-1 cursor-pointer group text-[#7c7c7c] hover:text-white transition-colors duration-200"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5.5 h-5.5"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <span className="text-[11px] font-medium font-sans">Library</span>
      </Link>

      <Link
        href="#"
        className="flex flex-col items-center gap-1 cursor-pointer group text-[#7c7c7c] hover:text-white transition-colors duration-200"
      >
        <Image 
          src={"stars.svg"}
          alt="stars"
          height={25}
          width={25}
        />
        <span className="text-[11px] font-medium font-sans">AI Toolkit</span>
      </Link>
    </nav>
  );
}
