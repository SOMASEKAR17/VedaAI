import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import EmptyState from "../components/EmptyState";

export default function Home() {
  return (
    <div className="flex w-full min-h-screen bg-[#ebebeb] p-4 gap-4 box-border overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <Topbar />
        <EmptyState />
      </div>
    </div>
  );
}
