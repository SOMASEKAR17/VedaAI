"use client";

import { useState, useRef,useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileHeader from "./MobileHeader";
import MobileBottomNav from "./MobileBottomNav";
import FAB from "./FAB";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAssignmentStore } from "@/store/useAssignmentStore";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isRendered, setIsRendered] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const shouldAnimateOpenRef = useRef(false);
    const pathname = usePathname();

  useLayoutEffect(() => {
    if (!isRendered || !shouldAnimateOpenRef.current) return;
    shouldAnimateOpenRef.current = false;

    timelineRef.current?.kill();

    gsap.set(overlayRef.current, { opacity: 0 });
    gsap.set(drawerRef.current, { x: "-100%" });

    const tl = gsap.timeline();
    timelineRef.current = tl;

    tl.to(overlayRef.current, {
      opacity: 1,
      duration: 0.35,
      ease: "power2.out",
    }).to(
      drawerRef.current,
      {
        x: "0%",
        duration: 0.4,
        ease: "expo.out",
      },
      "<0.05"
    );
  }, [isRendered]);

  const handleOpen = () => {
    shouldAnimateOpenRef.current = true;
    setIsRendered(true);
  };

  const handleClose = () => {
    timelineRef.current?.kill();

    const tl = gsap.timeline({
      onComplete: () => setIsRendered(false),
    });
    timelineRef.current = tl;

    tl.to(drawerRef.current, {
      x: "-100%",
      duration: 0.35,
      ease: "expo.in",
    }).to(
      overlayRef.current,
      {
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
      },
      "<0.05"
    );
  };
  const { assignments, loadAssignments } = useAssignmentStore();
  useEffect(() => {
      loadAssignments();
    }, []);

  return (
    <div className="flex w-full min-h-screen bg-[#ebebeb] p-4 gap-4 box-border overflow-x-hidden relative">
      <div className="hidden md:flex gap-4 w-full pl-[300px]">
        <div className="fixed top-4 left-4 w-[280px]">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="w-full z-45">
            <Topbar />
          </div>
          <div className="w-full relative animate-slide-up">
            {children}
            
          </div>
         { pathname==="/"&& assignments.length > 0 &&(<div className="fixed bottom-0 left-74 right-0 z-[9999] pointer-events-none flex flex-col items-center select-none">
        
        <div
          className="absolute bottom-0 left-0 right-0 h-28"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
            backdropFilter: 'blur(90px)',
            WebkitBackdropFilter: 'blur(10px)',
            background: 'linear-gradient(to top, rgba(255,255,255,0.92) 0%, rgba(150, 150, 150, 0.8) 100%)',
          }}
        />
        <div className="pb-6 pointer-events-auto relative z-10">
          <Link
            href="/create-assignment"
            className="bg-[#121212] hover:bg-[#2a2a2a] text-white py-3 px-5 rounded-full font-bold text-xs shadow-[0_8px_30px_rgba(0,0,0,0.25)] flex items-center gap-1.5 cursor-pointer transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5 text-white">
              <path d="M12 5v14M5 12h14" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Create Assignment
          </Link>
        </div>
      </div>)}
        </div>
      </div>

      <div className="flex md:hidden flex-col gap-4 w-full pb-20 pt-16">
        <div className="fixed top-4 left-4 right-4 z-40">
          <MobileHeader onMenuClick={handleOpen} />
        </div>
        <div className="w-full animate-slide-up">
          {children}
        </div>
        <FAB />
        <div className="fixed bottom-4 left-4 right-4 z-40">
          <MobileBottomNav />
        </div>
      </div>
      

      {isRendered && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            ref={overlayRef}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div
            ref={drawerRef}
            className="relative flex flex-col bg-white h-full w-[280px] shadow-2xl will-change-transform"
          >
            <Sidebar isMobileDrawer={true} onClose={handleClose} />
          </div>
        </div>
      )}
    </div>
  );
}
