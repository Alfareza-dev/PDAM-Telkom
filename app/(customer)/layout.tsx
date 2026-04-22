import Sidebar from "./components/Sidebar";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0f131d] text-[#dfe2f1] overflow-x-hidden overflow-y-auto">
      <Sidebar />
      <main className="flex-1 w-full max-w-[100vw] p-4 md:p-6 overflow-x-hidden mt-16 md:mt-0">{children}</main>
    </div>
  );
}
