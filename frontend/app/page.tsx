"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import EmptyState from "../components/EmptyState";
import MobileHeader from "../components/MobileHeader";
import MobileBottomNav from "../components/MobileBottomNav";
import FAB from "../components/FAB";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex w-full min-h-screen bg-[#ebebeb] p-4 gap-4 box-border overflow-x-hidden relative">
      <div className="hidden md:flex gap-4 w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <Topbar />
          <EmptyState />
        </div>
      </div>

      <div className="flex md:hidden flex-col gap-4 w-full pb-20">
        <MobileHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
        <EmptyState />
        <FAB />
        <div className="fixed bottom-4 left-4 right-4 z-40">
          <MobileBottomNav />
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col bg-white h-full w-[280px] shadow-2xl transition-transform duration-300 ease-out transform translate-x-0">
            <Sidebar isMobileDrawer={true} onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
