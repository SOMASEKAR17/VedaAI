import Image from "next/image";
import Link from "next/link";

interface SidebarLinkProps {
  href: string;
  label: string;
  iconPath: string;
  isActive?: boolean;
}

export default function SidebarLink({
  href,
  label,
  iconPath,
  isActive = false,
}: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        isActive
          ? "bg-[#eaeaea] text-[#1c1c1c] font-medium"
          : "text-[#7c7c7c] hover:bg-[#f5f5f5] hover:text-[#1c1c1c]"
      }`}
    >
      <Image
        src={iconPath}
        alt={label}
        width={20}
        height={20}
        className={`w-5 h-5 transition-opacity ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}
      />
      <span className="text-[15px]">{label}</span>
    </Link>
  );
}
