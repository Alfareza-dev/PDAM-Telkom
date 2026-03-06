import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen overflow-x-hidden selection:bg-cyan-500/30">
        {children}
        <ToastContainer theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
