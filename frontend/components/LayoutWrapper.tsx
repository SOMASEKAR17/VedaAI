"use client";

import { useState, useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileHeader from "./MobileHeader";
import MobileBottomNav from "./MobileBottomNav";
import FAB from "./FAB";

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
          <div className="w-full relative">
            {children}
          </div>
        </div>
      </div>

      <div className="flex md:hidden flex-col gap-4 w-full pb-20 pt-16">
        <div className="fixed top-4 left-4 right-4 z-40">
          <MobileHeader onMenuClick={handleOpen} />
        </div>
        {children}
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
