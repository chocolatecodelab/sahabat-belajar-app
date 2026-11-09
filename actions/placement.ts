"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";
import {
  DIAGNOSTIC_QUESTIONS,
  type DiagnosticQuestion,
  type DiagnosticResult,
} from "@/lib/diagnostic_questions";

export async function submitDiagnosticPlacement(input: {
  name: string;
  phone: string;
  email?: string;
  targetProgram: string;
  answers: Record<string, string>;
}): Promise<ActionResponse<DiagnosticResult>> {
  try {
    let verbalCorrect = 0;
    let kuantitatifCorrect = 0;
    let logikaCorrect = 0;

    DIAGNOSTIC_QUESTIONS.forEach((q) => {
      const selected = input.answers[q.id];
      const isCorrect = selected === q.correctKey;
      if (isCorrect) {
        if (q.category === "VERBAL") verbalCorrect++;
        if (q.category === "KUANTITATIF") kuantitatifCorrect++;
        if (q.category === "LOGIKA") logikaCorrect++;
      }
    });

    const totalQuestions = DIAGNOSTIC_QUESTIONS.length;
    const totalCorrect = verbalCorrect + kuantitatifCorrect + logikaCorrect;
    const percentage = Math.round((totalCorrect / totalQuestions) * 100);

    const verbalTotal = 3;
    const kuantitatifTotal = 4;
    const logikaTotal = 3;

    const verbalPct = Math.round((verbalCorrect / verbalTotal) * 100);
    const kuantitatifPct = Math.round((kuantitatifCorrect / kuantitatifTotal) * 100);
    const logikaPct = Math.round((logikaCorrect / logikaTotal) * 100);

    const strengths: string[] = [];
    const areasToImprove: string[] = [];

    if (verbalPct >= 66) strengths.push("Penalaran Verbal & Wacana Kuat");
    else areasToImprove.push("Kosakata, Analogi & Penarikan Kesimpulan Verbal");

    if (kuantitatifPct >= 75) strengths.push("Kecepatan Berhitung & Aritmatika Aljabar");
    else areasToImprove.push("Metode Trik Cepat Rumus Matematika & Deret");

    if (logikaPct >= 66) strengths.push("Logika Kondisional & Urutan Analitis");
    else areasToImprove.push("Studi Kasus Posisi & Logika Analitik Silogisme");

    let recommendedPackage = "Paket Semi-Privat Bimbingan Belajar (10 Sesi)";
    if (percentage < 60) {
      recommendedPackage = "Paket Privat Intensif 1-on-1 (10 Sesi + Pendampingan Konsep Dasar)";
    } else if (percentage >= 80) {
      recommendedPackage = "Paket Latihan Tryout Soal HOTS & Pemantapan Lanjutan (5 Sesi)";
    }

    // Auto-create lead in Database
    let leadId = `lead_diag_${Date.now()}`;
    try {
      const { data, error } = await supabaseAdmin.from("Lead").insert([
        {
          id: leadId,
          name: input.name,
          phone: input.phone,
          email: input.email || null,
          programInterest: input.targetProgram,
          classModel: "SEMI_PRIVAT",
          source: "WEBSITE_PLACEMENT_TEST",
          status: "IKUT_PLACEMENT",
          notes: `Hasil Placement Test: Skor ${percentage}% (${totalCorrect}/${totalQuestions} Soal Benar). Verbal: ${verbalPct}%, Kuantitatif: ${kuantitatifPct}%, Logika: ${logikaPct}%. Rekomendasi: ${recommendedPackage}.`,
        },
      ]);
      if (error) {
        console.warn("Save diagnostic lead warning:", error.message);
      }
    } catch (dbErr) {
      console.warn("DB Lead save fallback:", dbErr);
    }

    revalidatePath("/dashboard/lead");

    return {
      success: true,
      message: "Hasil tes diagnostik berhasil dianalisis!",
      data: {
        score: totalCorrect,
        maxScore: totalQuestions,
        percentage,
        breakdown: {
          verbal: { correct: verbalCorrect, total: verbalTotal, percentage: verbalPct },
          kuantitatif: { correct: kuantitatifCorrect, total: kuantitatifTotal, percentage: kuantitatifPct },
          logika: { correct: logikaCorrect, total: logikaTotal, percentage: logikaPct },
        },
        strengths,
        areasToImprove,
        recommendedPackage,
        leadId,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal memproses tes diagnostik",
    };
  }
}
