"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import EmptyState from "@/components/EmptyState";
import AssignmentDetailsModal from "@/components/AssignmentDetailsModal";
import AssignmentTracker from "@/components/AssignmentTracker";
import { downloadPDF, fetchAssignmentDetails, deleteAssignment } from "@/lib/api";

export default function Assignments() {
  const router = useRouter();
  const { assignments, loadAssignments } = useAssignmentStore();
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [activeTrackerId, setActiveTrackerId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Active three dots dropdown card ID
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Initial load on mount
  useEffect(() => {
    loadAssignments();
  }, []);

  // Listen globally to close dropdowns when clicking outside
  useEffect(() => {
    const handleGlobalClick = () => {
      setActiveDropdownId(null);
      setIsFilterOpen(false);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  // Auto-polling: if any assignment is pending or processing, poll the DB every 5 seconds
  useEffect(() => {
    const hasActiveJobs = assignments.some(
      (asg) => asg.status === "pending" || asg.status === "processing"
    );

    if (hasActiveJobs) {
      const interval = setInterval(() => {
        console.log("Active generation jobs detected. Refreshing list...");
        loadAssignments();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [assignments]);

  // Route to the detailed paper viewer page
  const handleViewDetails = (asgId: string) => {
    router.push(`/assignments/${asgId}`);
  };

  // Download PDF
  const handleDownloadPDF = async (asgId: string, title: string) => {
    setDownloadingId(asgId);
    try {
      await downloadPDF(asgId, title);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  // Delete Assignment
  const handleDeleteAssignment = async (asgId: string) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      const success = await deleteAssignment(asgId);
      if (success) {
        loadAssignments();
      } else {
        alert("Failed to delete assignment. Ensure backend is active.");
      }
    }
  };

  // Format date to DD-MM-YYYY format matching screenshot
  const formatToDDMMYYYY = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateStr;
    }
  };

  // Get list of unique subjects for filter options
  const uniqueSubjects = Array.from(new Set(assignments.map((asg) => asg.subject)));

  // Filter and Search logic
  const filteredAssignments = assignments.filter((asg) => {
    const matchesSearch = asg.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject ? asg.subject === filterSubject : true;
    return matchesSearch && matchesSubject;
  });

  // Render empty state if no assignments exist
  if (!assignments || assignments.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex-1 flex flex-col gap-6 select-none max-w-6xl mx-auto w-full pb-32 animate-fade-in pr-4">
      
      {/* Tracker overlay if the user clicks a processing card to watch live progress */}
      {activeTrackerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-[32px] overflow-hidden max-w-2xl w-full shadow-2xl p-6 relative">
            <button
              onClick={() => setActiveTrackerId(null)}
              className="absolute right-6 top-6 bg-white hover:bg-gray-100 border p-2 rounded-full cursor-pointer shadow-sm z-55"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-gray-500">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="mt-8">
              <AssignmentTracker
                assignmentId={activeTrackerId}
                onComplete={() => {
                  setActiveTrackerId(null);
                  loadAssignments();
                }}
                onCancel={() => setActiveTrackerId(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Header section matching screenshot */}
      <div className="flex flex-col gap-0.5 text-left px-1 mt-2">
        <div className="flex items-center gap-2">
          {/* Green dot status indicator */}
          <div className="w-3.5 h-3.5 rounded-full bg-[#4ade80] border-2 border-white shadow-sm shrink-0" />
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1c1c1c] font-sans">
            Assignments
          </h1>
        </div>
        <p className="text-[13px] sm:text-[14px] text-[#7c7c7c] font-semibold font-sans mt-0.5">
          Manage and create assignments for your classes.
        </p>
      </div>

      {/* Filter and Search Bar matching screenshot */}
      <div className="w-full bg-white rounded-[20px] px-6 py-3.5 flex items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.015)] border border-[#f0f0f0]/50 gap-4 mb-2 select-none">
        
        {/* Left Side: Filter Dropdown */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 hover:bg-[#f8f8f8] px-4 py-2 rounded-full transition-colors cursor-pointer select-none"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-[#7c7c7c]">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span className="text-sm font-semibold text-[#7c7c7c] font-sans">
              {filterSubject ? `Subject: ${filterSubject}` : "Filter By"}
            </span>
          </button>

          {isFilterOpen && (
            <div className="absolute top-12 left-0 bg-white rounded-[18px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-[#f0f0f0]/60 py-2 min-w-[200px] z-30 animate-fade-in">
              <button
                onClick={() => {
                  setFilterSubject(null);
                  setIsFilterOpen(false);
                }}
                className={`w-full text-left px-5 py-2.5 text-xs font-bold font-sans transition-colors cursor-pointer ${
                  !filterSubject ? "text-[#f06e30] bg-[#fffbf9]" : "text-[#7c7c7c] hover:text-[#1c1c1c] hover:bg-[#f8f8f8]"
                }`}
              >
                All Subjects
              </button>
              {uniqueSubjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => {
                    setFilterSubject(subject);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-5 py-2.5 text-xs font-bold font-sans transition-colors cursor-pointer ${
                    filterSubject === subject ? "text-[#f06e30] bg-[#fffbf9]" : "text-[#7c7c7c] hover:text-[#1c1c1c] hover:bg-[#f8f8f8]"
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Search Input Pill */}
        <div className="relative w-full sm:w-[280px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search Assignment"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#fbfbfb] border border-[#f0f0f0] rounded-full pl-10 pr-4 py-2.5 text-xs font-bold text-[#1c1c1c] placeholder-gray-400 focus:outline-none focus:border-gray-200 transition-colors font-sans"
          />
        </div>
      </div>

      {/* Grid of assessments - 2 Columns Grid matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6.5 w-full px-1">
        {filteredAssignments.map((asg) => {
          const isPending = asg.status === "pending";
          const isProcessing = asg.status === "processing";
          const isCompleted = asg.status === "completed";
          const isFailed = asg.status === "failed";
          const isDropdownOpen = activeDropdownId === asg._id;

          return (
            <div
              key={asg._id}
              onClick={() => isCompleted && handleViewDetails(asg._id)}
              className={`bg-white rounded-[28px] shadow-[0_4px_24px_rgba(0,0,0,0.015)] border border-[#f0f0f0]/60 p-8 flex flex-col justify-between min-h-[175px] relative transition-all duration-300 select-none ${
                isCompleted
                  ? "hover:shadow-[0_8px_32px_rgba(0,0,0,0.035)] hover:-translate-y-0.5 cursor-pointer"
                  : "cursor-default"
              }`}
            >
              {/* Three dots menu button (top-right corner) */}
              <div className="absolute top-7 right-7" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setActiveDropdownId(isDropdownOpen ? null : asg._id)}
                  className="text-[#a0a0a0] hover:text-[#1c1c1c] p-1.5 rounded-full transition-colors cursor-pointer flex items-center justify-center hover:bg-[#f8f8f8]"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5.5 h-5.5">
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>

                {/* Dropdown Menu matching screenshot */}
                {isDropdownOpen && (
                  <div className="absolute top-10 right-0 bg-white rounded-[18px] shadow-[0_8px_28px_rgba(0,0,0,0.08)] border border-[#f0f0f0]/60 py-2 min-w-[160px] z-30 animate-fade-in text-left">
                    <button
                      onClick={() => {
                        setActiveDropdownId(null);
                        if (isCompleted) {
                          handleViewDetails(asg._id);
                        } else if (isProcessing || isPending) {
                          setActiveTrackerId(asg._id);
                        }
                      }}
                      className="w-full text-left px-5 py-2.5 text-xs font-bold text-[#1c1c1c] hover:bg-[#f8f8f8] transition-colors cursor-pointer font-sans"
                    >
                      {isCompleted ? "View Assignment" : "Track Live Progress"}
                    </button>

                    {isCompleted && (
                      <button
                        onClick={() => {
                          setActiveDropdownId(null);
                          handleDownloadPDF(asg._id, asg.title);
                        }}
                        disabled={downloadingId === asg._id}
                        className="w-full text-left px-5 py-2.5 text-xs font-bold text-[#1c1c1c] hover:bg-[#f8f8f8] transition-colors cursor-pointer flex items-center justify-between font-sans disabled:opacity-50"
                      >
                        {downloadingId === asg._id ? "Downloading..." : "Download PDF"}
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setActiveDropdownId(null);
                        handleDeleteAssignment(asg._id);
                      }}
                      className="w-full text-left px-5 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50/40 transition-colors cursor-pointer font-sans"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Title Section (Spans 1 or 2 lines) */}
              <div className="flex flex-col text-left pr-8">
                <h3 className="text-xl sm:text-[22px] font-extrabold text-[#1c1c1c] font-sans leading-snug tracking-tight line-clamp-2">
                  {asg.title}
                </h3>
                {/* Optional status metadata for queued/processing cards */}
                {(isProcessing || isPending || isFailed) && (
                  <div className="mt-2 select-none">
                    {isProcessing && (
                      <span
                        onClick={() => setActiveTrackerId(asg._id)}
                        className="bg-orange-50 text-orange-700 border border-orange-100 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wide animate-pulse inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                        Generating Questions...
                      </span>
                    )}
                    {isPending && (
                      <span className="bg-gray-50 text-gray-500 border border-gray-100 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wide inline-block">
                        Queued in Engine
                      </span>
                    )}
                    {isFailed && (
                      <span className="bg-red-50 text-red-700 border border-red-100 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wide inline-block">
                        Generation Failed
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Row matching screenshot EXACTLY */}
              <div className="flex justify-between items-center w-full mt-6 text-[#7c7c7c] text-xs sm:text-[13px] font-semibold font-sans">
                
                {/* Left Side: Assigned on Date */}
                <span>
                  Assigned on : <strong className="font-extrabold text-[#1c1c1c]">{formatToDDMMYYYY(asg.createdAt)}</strong>
                </span>

                {/* Right Side: Due Date */}
                <span>
                  Due : <strong className="font-extrabold text-[#1c1c1c]">{formatToDDMMYYYY(asg.dueDate)}</strong>
                </span>
                
              </div>

            </div>
          );
        })}
      </div>

      {/* Center Floating Bottom "+ Create Assignment" Button matching screenshot */}
      <div className="fixed bottom-8 left-[50%] md:left-[calc(50%+140px)] transform -translate-x-1/2 z-40 select-none">
        <Link
          href="/create-assignment"
          className="bg-[#121212] hover:bg-[#2a2a2a] text-white py-4 px-8 rounded-full font-extrabold text-xs sm:text-sm shadow-[0_8px_30px_rgba(0,0,0,0.18)] flex items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.04] active:scale-[0.96]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-white">
            <path d="M12 5v14M5 12h14" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Create Assignment
        </Link>
      </div>

      {/* Details modal overlay */}
      {selectedAssignment && (
        <AssignmentDetailsModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
        />
      )}

    </div>
  );
}
