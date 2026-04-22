"use client";
import React from "react";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import InvoicePDF from "./InvoicePDF";
import { Printer, Download, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export default function PDFActionButtons({ billData, status }: { billData: any, status: string }) {
  const handlePrint = async () => {
    try {
      const blob = await pdf(<InvoicePDF bill={billData} status={status} />).toBlob();
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url, "_blank");
      if (newWindow) {
        newWindow.onload = () => {
          setTimeout(() => { newWindow.print(); }, 200);
        };
      } else {
        toast.error("Pop-up diblokir. Harap izinkan pop-up.");
      }
    } catch (error) {
      console.error("Gagal print PDF", error);
      toast.error("Gagal membuat PDF.");
    }
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      {/* TOMBOL CETAK NOTA (PRINT) */}
      <button 
        onClick={handlePrint}
        className="flex items-center justify-center gap-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition text-sm font-bold border border-white/5"
      >
        <Printer size={16} className="text-cyan-400" /> Print
      </button>

      {/* TOMBOL DOWNLOAD PDF */}
      <PDFDownloadLink
        document={<InvoicePDF bill={billData} status={status} />}
        fileName={`Invoice_PDAM_${billData.id}.pdf`}
        className="flex items-center justify-center gap-2 text-slate-900 bg-cyan-500 hover:bg-cyan-400 px-4 py-2 rounded-xl transition text-sm font-bold"
      >
        {/* @ts-ignore */}
        {({ loading }: any) => (
          <>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Download
          </>
        )}
      </PDFDownloadLink>
    </div>
  );
}
