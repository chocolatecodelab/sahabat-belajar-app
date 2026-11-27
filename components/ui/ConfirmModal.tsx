"use client";

import { useEffect } from "react";
import { AlertTriangle, CheckCircle2, HelpCircle, X } from "lucide-react";

export type ConfirmModalVariant = "primary" | "danger" | "success" | "warning";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmModalVariant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_STYLES: Record<
  ConfirmModalVariant,
  {
    iconBg: string;
    iconColor: string;
    btnClass: string;
    Icon: typeof HelpCircle;
  }
> = {
  primary: {
    iconBg: "bg-[#EAF1FA]",
    iconColor: "text-[#09408C]",
    btnClass: "bg-[#09408C] hover:bg-[#0E3571] text-white",
    Icon: HelpCircle,
  },
  success: {
    iconBg: "bg-[#E3F4EC]",
    iconColor: "text-[#1F6F4A]",
    btnClass: "bg-[#1F6F4A] hover:bg-[#165538] text-white",
    Icon: CheckCircle2,
  },
  warning: {
    iconBg: "bg-[#FEF7E6]",
    iconColor: "text-[#B45309]",
    btnClass: "bg-[#F5B82E] hover:bg-[#E0A31B] text-[#1B2A41]",
    Icon: AlertTriangle,
  },
  danger: {
    iconBg: "bg-[#FBE9E5]",
    iconColor: "text-[#B4381F]",
    btnClass: "bg-[#B4381F] hover:bg-[#962D18] text-white",
    Icon: AlertTriangle,
  },
};

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
  variant = "primary",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  const style = VARIANT_STYLES[variant];
  const Icon = style.Icon;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
      onClick={() => {
        if (!loading) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#D5DDEB] shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl ${style.iconBg} ${style.iconColor} flex items-center justify-center shrink-0`}
            >
              <Icon size={20} />
            </div>
            <div>
              <h3
                id="confirm-modal-title"
                className="text-base font-bold text-[#1B2A41] font-heading leading-snug"
              >
                {title}
              </h3>
              <div className="text-xs text-[#5B6882] mt-1.5 leading-relaxed">
                {description}
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="p-1.5 rounded-lg text-[#5B6882] hover:bg-[#F4F7FB] hover:text-[#1B2A41] transition-colors shrink-0 disabled:opacity-40"
            aria-label="Tutup dialog"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D5DDEB]">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="px-4 py-2.5 min-h-[40px] rounded-xl border border-[#D5DDEB] bg-white text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB] hover:text-[#1B2A41] transition-colors disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`px-4 py-2.5 min-h-[40px] rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50 ${style.btnClass}`}
          >
            {loading ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
