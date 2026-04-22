"use client";

import { Loader2, Trash2 } from "lucide-react";
import React from "react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  title?: string;
  description: React.ReactNode;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  title = "Konfirmasi Hapus",
  description
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 transition-opacity duration-300">
      <div className="w-full max-w-lg bg-[#0b0f10] rounded-2xl shadow-2xl border border-slate-800 flex flex-col max-h-full">
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Trash2 className="text-red-400" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">{title}</h2>
            <div className="text-slate-400 text-sm mt-2 leading-relaxed">
              {description}
            </div>
          </div>
          <div className="flex justify-center gap-3 w-full pt-4">
            <button onClick={onClose} disabled={isSubmitting} className="btn-secondary px-6">Batal</button>
            <button 
              onClick={onConfirm} 
              disabled={isSubmitting}
              className="px-6 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-400 text-white font-black text-sm rounded-2xl transition-all active:scale-95 shadow-lg shadow-red-500/20"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
              {isSubmitting ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
