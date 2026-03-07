import Sidebar from "./components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 w-full max-w-[100vw] p-4 md:p-6 overflow-y-auto overflow-x-hidden relative mt-16 md:mt-0">{children}</main>
    </div>
  );
}
