import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen overflow-x-hidden selection:bg-cyan-500/30">
        {children}
        <ToastContainer
          theme="dark"
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={true}
          newestOnTop
          closeOnClick
          pauseOnHover
          toastClassName="!bg-[#0b0f10]/80 !backdrop-blur-lg !border !border-slate-700/50 !rounded-2xl !shadow-2xl !shadow-cyan-900/20 !px-4 !py-3 !text-slate-200 !text-sm !font-medium !m-0 !p-2"
        />
      </body>
    </html>
  );
}
