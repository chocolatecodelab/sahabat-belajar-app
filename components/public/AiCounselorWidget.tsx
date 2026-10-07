"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  GraduationCap,
  ArrowRight,
  Calendar,
  Clock,
  CheckCircle2,
  BookOpen,
  Bot,
  User,
  Phone,
  HelpCircle,
} from "lucide-react";
import type { CourseItem } from "@/actions/kursus";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  recommendedCourses?: CourseItem[];
  suggestedQuestions?: string[];
  createdAt: string;
}

const INITIAL_GREETING: ChatMessage = {
  id: "msg_init_greeting",
  role: "assistant",
  content:
    "Halo! Saya **Dr. Ristek AI**, konsultan akademik dari BIAS RISTEK.\n\nSedang mempersiapkan naskah jurnal Scopus, olah data statistik, atau butuh bimbingan tesis/disertasi? Ceritakan kendala riset Anda, dan saya siap memberikan rekomendasi solusi & program terbaik!",
  suggestedQuestions: [
    "Saya mau publikasi artikel ke jurnal Scopus Q1-Q2",
    "Saya kesulitan analisis data mediasi di SmartPLS",
    "Bagaimana alur pendampingan tesis agar cepat lulus?",
    "Metode pembayaran apa saja yang tersedia?",
  ],
  createdAt: new Date().toISOString(),
};

export default function AiCounselorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPromptTooltip, setHasPromptTooltip] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("bias_ai_counselor_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, []);

  // Save to sessionStorage on update
  useEffect(() => {
    if (messages.length > 1) {
      try {
        sessionStorage.setItem("bias_ai_counselor_history", JSON.stringify(messages));
      } catch {
        // Ignore
      }
    }
  }, [messages]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Auto focus input on open
  useEffect(() => {
    if (isOpen) {
      setHasPromptTooltip(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage("");
    setIsLoading(true);

    try {
      const apiMessages = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/counselor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          role: "assistant",
          content: resData.data.reply,
          recommendedCourses: resData.data.recommendedCourses || [],
          suggestedQuestions: resData.data.suggestedQuestions || [],
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `bot_err_${Date.now()}`,
          role: "assistant",
          content:
            resData.message ||
            "Mohon maaf, terjadi kendala saat memproses jawaban. Silakan coba tanyakan kembali.",
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `bot_err_${Date.now()}`,
        role: "assistant",
        content:
          "Koneksi ke asisten AI terputus. Silakan periksa koneksi internet Anda atau hubungi admin via WhatsApp.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_GREETING]);
    try {
      sessionStorage.removeItem("bias_ai_counselor_history");
    } catch {
      // Ignore
    }
  };

  // Helper to render markdown bold and linebreaks
  const renderFormattedText = (text: string) => {
    return text.split("\n").map((line, lineIdx) => {
      // Simple bold parser
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={lineIdx} className={line.trim() === "" ? "h-2" : "min-h-[1.25rem]"}>
          {parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={pIdx} className="font-bold text-slate-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <aside aria-label="AI Course Counselor" className="fixed bottom-6 right-6 z-50 font-[var(--font-body)]">
      {/* 1. Floating Launcher Button & Prompt Popover */}
      {!isOpen && (
        <div className="flex flex-col items-end gap-3">
          {hasPromptTooltip && (
            <div className="relative elevation-2 bg-white text-slate-800 p-3.5 rounded-2xl border border-slate-200/80 shadow-xl max-w-xs animate-bounce-subtle flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#001847] text-white flex items-center justify-center shrink-0 shadow-xs">
                <GraduationCap size={16} className="text-[#fdbc13]" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900 font-[var(--font-heading)]">Konsultan Riset AI</p>
                <p className="text-slate-500 text-3xs mt-0.5 leading-relaxed">
                  Butuh rekomendasi kelas publikasi Scopus / olah data? Tanya saya!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHasPromptTooltip(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5"
                title="Tutup"
              >
                <X size={13} />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 px-4 py-3.5 rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #001847 0%, #002b80 100%)",
              border: "2px solid #fdbc13",
            }}
          >
            {/* Pulsing indicator */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fdbc13] opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#fdbc13]" />
            </span>

            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#fdbc13] group-hover:rotate-12 transition-transform">
              <GraduationCap size={20} />
            </div>
            <div className="text-left pr-1">
              <span className="block text-2xs font-extrabold font-[var(--font-heading)] leading-none text-white">
                Tanya Konsultan AI
              </span>
              <span className="block text-3xs text-[#fdbc13] font-semibold leading-none mt-1">
                Dr. Ristek • Online
              </span>
            </div>
          </button>
        </div>
      )}

      {/* 2. Expandable Chat Modal Window */}
      {isOpen && (
        <div
          className="elevation-2 rounded-2xl bg-white w-[370px] sm:w-[420px] max-w-[calc(100vw-32px)] h-[580px] max-h-[calc(100vh-100px)] flex flex-col overflow-hidden border border-slate-200 shadow-2xl animate-fade-in"
          style={{
            borderTop: "4px solid #fdbc13",
          }}
        >
          {/* Header */}
          <div
            className="p-4 flex items-center justify-between text-white"
            style={{
              background: "linear-gradient(135deg, #001847 0%, #002b80 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#fdbc13] shadow-inner">
                  <GraduationCap size={22} />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#001847]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm font-[var(--font-heading)] tracking-tight text-white flex items-center gap-1.5">
                  <span>Dr. Ristek AI</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-[#fdbc13] text-[#001847] text-3xs font-extrabold">
                    PRO
                  </span>
                </h3>
                <p className="text-3xs text-white/80 font-medium">Konsultan Program Riset BIAS RISTEK</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/80">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Reset Percakapan"
              >
                <RotateCcw size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Tutup Chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 text-xs">
            {messages.map((msg) => {
              const isUser = msg.role === "user";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl space-y-2 leading-relaxed shadow-xs ${isUser
                      ? "bg-[#001847] text-white rounded-br-xs font-medium"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs"
                      }`}
                  >
                    {isUser ? (
                      <p>{msg.content}</p>
                    ) : (
                      <div className="space-y-1.5 text-slate-700">
                        {renderFormattedText(msg.content)}
                      </div>
                    )}

                    {/* Interactive Course Recommendation Cards */}
                    {!isUser && msg.recommendedCourses && msg.recommendedCourses.length > 0 && (
                      <div className="pt-2.5 mt-2.5 border-t border-slate-100 space-y-2.5">
                        <span className="text-2xs font-bold uppercase tracking-wider text-[#001847] flex items-center gap-1.5">
                          <BookOpen size={12} className="text-[#001847]" />
                          <span>Rekomendasi Program Terkait:</span>
                        </span>

                        {msg.recommendedCourses.map((course) => {
                          const basePrice =
                            course.salePrice !== null && course.salePrice !== undefined
                              ? course.salePrice
                              : course.price;
                          const hasDiscount =
                            course.salePrice !== null &&
                            course.salePrice !== undefined &&
                            course.salePrice < course.price;

                          return (
                            <div
                              key={course.id}
                              className="p-3 rounded-xl border border-blue-100 bg-blue-50/40 hover:bg-blue-50 transition-all space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="px-2 py-0.5 rounded-md text-2xs font-semibold bg-[#001847]/8 text-[#001847] border border-[#001847]/15">
                                  {course.category}
                                </span>
                                {course.batchNumber && (
                                  <span className="text-2xs font-semibold text-[#7a5900] bg-[#fef9c3] px-2 py-0.5 rounded border border-[#fef08a]">
                                    {course.batchNumber}
                                  </span>
                                )}
                              </div>

                              <h4 className="font-bold text-xs text-slate-900 leading-snug">
                                {course.title}
                              </h4>

                              <div className="flex items-center justify-between pt-1 border-t border-blue-100/80">
                                <div>
                                  {hasDiscount && (
                                    <span className="text-3xs text-slate-400 line-through block leading-none">
                                      Rp {course.price.toLocaleString("id-ID")}
                                    </span>
                                  )}
                                  <strong className="text-xs font-extrabold text-blue-950 block leading-tight">
                                    {course.isFree ? "GRATIS" : `Rp ${basePrice.toLocaleString("id-ID")}`}
                                  </strong>
                                </div>

                                <Link
                                  href={`/kursus/${course.slug}`}
                                  onClick={() => setIsOpen(false)}
                                  className="px-2.5 py-1.5 rounded-lg text-3xs font-bold text-white bg-[var(--color-primary)] hover:opacity-90 transition-all flex items-center gap-1 shadow-xs"
                                >
                                  <span>Lihat Silabus</span>
                                  <ArrowRight size={11} />
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Dynamic Suggested Follow-up Questions */}
                  {!isUser && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                      {msg.suggestedQuestions.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleSendMessage(q)}
                          className="px-2.5 py-1.5 rounded-xl border border-blue-200/80 bg-white hover:bg-blue-50 text-blue-900 text-3xs font-semibold transition-all text-left shadow-2xs hover:border-blue-300 flex items-center gap-1"
                        >
                          <MessageSquare size={12} className="text-blue-600 shrink-0" />
                          <span>{q}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2 animate-fade-in">
                <div className="p-3.5 rounded-2xl rounded-bl-xs bg-white border border-slate-200/80 shadow-xs flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#001847] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#001847] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#001847] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-3xs text-slate-500 font-medium">
                    Dr. Ristek sedang menganalisis...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div className="p-3 border-t border-slate-200 bg-white space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Tanyakan kendala riset atau program kelas..."
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus-ring bg-slate-50/50 font-medium"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs shrink-0"
                style={{ background: "var(--color-primary)" }}
                title="Kirim Pesan"
              >
                <Send size={15} />
              </button>
            </form>

            <div className="flex items-center justify-between text-3xs text-slate-400 pt-1">
              {/* <span>Didukung oleh Google Gemini 3.6 Flash</span> */}
              <a
                href="https://wa.me/6287777659482?text=Halo%20Admin%20BIAS%20RISTEK,%20saya%20ingin%20konsultasi%20program%20bimbingan%20riset"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:underline"
              >
                {/* <Phone size={10} /> */}
                {/* <span>Konsultan Manusia (WA)</span> */}
              </a>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
