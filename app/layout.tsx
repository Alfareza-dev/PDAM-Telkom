import Header from "./components/Header";
import Footer from "./components/Footer";
import PageWrapper from "./components/PageWrapper";
import "./globals.css";

export const metadata = {
  title: "PDAM Smart",
  description: "Smart Water Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans text-slate-100 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950">
        <Header /> {/* ✅ Hanya di layout */}
        <PageWrapper>{children}</PageWrapper>
        <Footer /> {/* ✅ Hanya di layout */}
      </body>
    </html>
  );
}
