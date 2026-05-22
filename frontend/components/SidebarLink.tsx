import Image from "next/image";
import Link from "next/link";

interface SidebarLinkProps {
  href: string;
  label: string;
  iconPath: string;
  isActive?: boolean;
  onClick?: () => void;
  badge?: number | string;
}

export default function SidebarLink({
  href,
  label,
  iconPath,
  isActive = false,
  onClick,
  badge,
}: SidebarLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 ${
        isActive
          ? "bg-[#eaeaea] text-[#1c1c1c] font-medium"
          : "text-[#7c7c7c] hover:bg-[#f5f5f5] hover:text-[#1c1c1c]"
      }`}
    >
      <div className="flex items-center gap-3">
        <Image
          src={iconPath}
          alt={label}
          width={20}
          height={20}
          className={`w-5 h-5 transition-opacity ${isActive ? "opacity-100" : "opacity-70"}`}
        />
        <span className="text-[15px] font-sans font-medium">{label}</span>
      </div>
      {badge !== undefined && (
        <span className="bg-[#f06e30] text-white text-[11px] font-bold px-2 py-0.5 rounded-full select-none min-w-[20px] text-center">
          {badge}
        </span>
      )}
    </Link>
  );
}
