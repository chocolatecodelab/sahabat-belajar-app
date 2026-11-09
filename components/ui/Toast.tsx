"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
}

export interface ToastMethods {
  success: (titleOrMsg?: string, msg?: string) => void;
  error: (titleOrMsg?: string, msg?: string) => void;
  warning: (titleOrMsg?: string, msg?: string) => void;
  info: (titleOrMsg?: string, msg?: string) => void;
}

export interface ToastContextValue extends ToastMethods {
  toast: ToastMethods;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastType, message: string, title?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const trigger = useCallback(
    (type: ToastType, arg1?: string, arg2?: string) => {
      const defaultTitle =
        type === "success"
          ? "Berhasil"
          : type === "error"
          ? "Terjadi Kesalahan"
          : type === "warning"
          ? "Peringatan"
          : "Informasi";

      if (arg2 !== undefined) {
        addToast(type, arg2, arg1 || defaultTitle);
      } else {
        addToast(type, arg1 || defaultTitle);
      }
    },
    [addToast]
  );

  const toastMethods: ToastMethods = {
    success: (arg1?: string, arg2?: string) => trigger("success", arg1, arg2),
    error: (arg1?: string, arg2?: string) => trigger("error", arg1, arg2),
    warning: (arg1?: string, arg2?: string) => trigger("warning", arg1, arg2),
    info: (arg1?: string, arg2?: string) => trigger("info", arg1, arg2),
  };

  const contextValue: ToastContextValue = {
    ...toastMethods,
    toast: toastMethods,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast Overlay Container */}
      <div
        className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
        aria-live="polite"
        role="region"
        aria-label="Notifikasi sistem"
      >
        {toasts.map((t) => {
          const config = {
            success: {
              bg: "bg-[#E3F4EC]",
              border: "border-[#A3E635]",
              text: "text-[#1F6F4A]",
              icon: <CheckCircle2 size={18} className="text-[#1F6F4A] shrink-0" />,
            },
            error: {
              bg: "bg-[#FBE9E5]",
              border: "border-[#FCA5A5]",
              text: "text-[#B4381F]",
              icon: <XCircle size={18} className="text-[#B4381F] shrink-0" />,
            },
            warning: {
              bg: "bg-[#FEF3C7]",
              border: "border-[#FCD34D]",
              text: "text-[#B45309]",
              icon: <AlertTriangle size={18} className="text-[#B45309] shrink-0" />,
            },
            info: {
              bg: "bg-[#EAF1FA]",
              border: "border-[#9AC1E2]",
              text: "text-[#09408C]",
              icon: <Info size={18} className="text-[#09408C] shrink-0" />,
            },
          }[t.type];

          return (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-2xl border shadow-lg backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${config.bg} ${config.border}`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="mt-0.5">{config.icon}</span>
                <div className="min-w-0">
                  {t.title && (
                    <div className={`text-xs font-bold font-display ${config.text}`}>
                      {t.title}
                    </div>
                  )}
                  <div className={`text-xs font-medium leading-relaxed break-words ${config.text}`}>
                    {t.message}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className={`p-1 rounded-lg hover:bg-black/5 transition-colors shrink-0 text-[#5B6882]`}
                aria-label="Tutup notifikasi"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if used outside provider
    const dummyMethods: ToastMethods = {
      success: (msg?: string) => console.log("[Toast Success]", msg),
      error: (msg?: string) => console.error("[Toast Error]", msg),
      warning: (msg?: string) => console.warn("[Toast Warning]", msg),
      info: (msg?: string) => console.info("[Toast Info]", msg),
    };
    return {
      ...dummyMethods,
      toast: dummyMethods,
    };
  }
  return context;
}
