import Link from "next/link";

export default function FAB() {
  return (
    <Link
      href="/create-assignment"
      className="flex md:hidden fixed bottom-24 right-6 w-14 h-14 bg-white text-[#f06e30] rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 z-40 select-none"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="w-6 h-6"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </Link>
  );
}
