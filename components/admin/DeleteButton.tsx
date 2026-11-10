"use client";

import { useState, useRef } from "react";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteButtonProps {
  confirmMessage?: string;
}

export default function DeleteButton({
  confirmMessage = "Apakah Anda yakin ingin menghapus data ini?",
}: DeleteButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleConfirmDelete = () => {
    setShowConfirm(false);
    const form = btnRef.current?.closest("form");
    if (form) {
      form.requestSubmit();
    }
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label="Hapus data"
        title="Hapus"
        onClick={() => setShowConfirm(true)}
        className="p-1.5 rounded-xl border border-[#D5DDEB] hover:bg-[#FBE9E5] hover:border-[#B4381F]/30 text-[#B4381F] transition-colors cursor-pointer"
      >
        <Trash2 size={14} />
      </button>

      {showConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0A2650]/50 backdrop-blur-xs p-4 text-left"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white border border-[#D5DDEB] rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FBE9E5] text-[#B4381F] flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold font-display text-[#0A2650]">
                  Konfirmasi Penghapusan
                </h3>
                <p className="text-xs text-[#5B6882] mt-1 leading-relaxed">
                  {confirmMessage}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-xl border border-[#D5DDEB] text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-[#B4381F] hover:bg-[#992d17] text-white text-xs font-bold transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
