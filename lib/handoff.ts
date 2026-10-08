import { cleanHtmlToText } from "@/lib/utils";

const GEMINI_MODELS = ["gemini-flash-lite-latest", "gemini-flash-latest"];
function getGeminiEndpoint(model: string = GEMINI_MODELS[0]) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

function getGeminiApiKey(): string {
  return process.env.GEMINI_API_KEY || "";
}

export type HandoffEvaluationResult = {
  shouldHandoff: boolean;
  triggerReason: "KEYWORD_TRIGGER" | "COMPLEX_RESEARCH_TOPIC" | "NEGATIVE_SENTIMENT" | "MANUAL_REQUEST" | "FAQ_INQUIRY";
  category: "KONSULTASI_RISET" | "PENDAFTARAN" | "PEMBAYARAN" | "KOMPLAIN" | "LAINNYA";
  summary: string;
  confidence: number;
  customerSentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "FRUSTRATED";
};

// 1. Direct Regex Keyword Matchers (Instant 0ms detection)
const DIRECT_HUMAN_PATTERNS = [
  /\badmin\b/i,
  /\bmanusia\b/i,
  /bicara (dengan|sama) (orang|manusia|staf|admin)/i,
  /\bstaf\b/i,
  /\boperator\b/i,
  /\bcustomer service\b/i,
  /\bcs\b/i,
  /hubungi (admin|staf|orang)/i,
  /tanya (admin|orang|manusia)/i,
  /bukan (bot|ai)/i,
  /jangan (bot|ai)/i,
];

const COMPLAINT_PATTERNS = [
  /\bkomplain\b/i,
  /\brefund\b/i,
  /\buang kembali\b/i,
  /\bkecewa\b/i,
  /\bsalah transfer\b/i,
  /\bsalah bayar\b/i,
  /\btidak bisa login\b/i,
  /\bkenapa belum (aktif|diberikan|dikirim)\b/i,
  /\bbatalkan\b/i,
  /\bpenipuan\b/i,
];

const COMPLEX_RESEARCH_PATTERNS = [
  /disertasi (s3|doktor)/i,
  /tesis (s2|magister)/i,
  /proposal ditolak (dosen|promotor)/i,
  /bedah novelty scopus (q1|q2)/i,
  /kerjasama (kampus|universitas|institusi|lembaga)/i,
  /paket (kustom|khusus|lembaga)/i,
  /konsultasi judul (skripsi|tesis|disertasi)/i,
  /butuh bimbingan privat mendalam/i,
];

/**
 * 2. Evaluate Message for Human Handoff Triggers
 */
export async function evaluateHandoffIntent(
  message: string,
  history?: { role: string; content: string }[]
): Promise<HandoffEvaluationResult> {
  const cleanMsg = message.trim();

  // A. Check Direct Human Request
  for (const regex of DIRECT_HUMAN_PATTERNS) {
    if (regex.test(cleanMsg)) {
      return {
        shouldHandoff: true,
        triggerReason: "KEYWORD_TRIGGER",
        category: "LAINNYA",
        summary: `Pengguna secara eksplisit meminta berbicara dengan admin/manusia: "${cleanMsg.slice(0, 100)}"`,
        confidence: 0.99,
        customerSentiment: "NEUTRAL",
      };
    }
  }

  // B. Check Complaints / Urgent Matters
  for (const regex of COMPLAINT_PATTERNS) {
    if (regex.test(cleanMsg)) {
      return {
        shouldHandoff: true,
        triggerReason: "NEGATIVE_SENTIMENT",
        category: "KOMPLAIN",
        summary: `Keluhan/kendala mendesak terdeteksi: "${cleanMsg.slice(0, 100)}"`,
        confidence: 0.95,
        customerSentiment: "FRUSTRATED",
      };
    }
  }

  // C. Check Complex Research Consultation
  for (const regex of COMPLEX_RESEARCH_PATTERNS) {
    if (regex.test(cleanMsg)) {
      return {
        shouldHandoff: true,
        triggerReason: "COMPLEX_RESEARCH_TOPIC",
        category: "KONSULTASI_RISET",
        summary: `Konsultasi riset/naskah mendalam membutuhkan pertimbangan konsultan manusia: "${cleanMsg.slice(0, 100)}"`,
        confidence: 0.92,
        customerSentiment: "NEUTRAL",
      };
    }
  }

  // D. Semantic Classification via Gemini LLM (for nuanced/implicit requests)
  const apiKey = getGeminiApiKey();
  if (apiKey && cleanMsg.length > 25) {
    try {
      const prompt = `Analisis pesan dari calon peserta kursus bimbingan riset "BIAS RISTEK":
Pesan: "${cleanMsg}"
Riwayat Percakapan Terakhir:
${(history || []).slice(-3).map((h) => `${h.role}: ${h.content}`).join("\n")}

Tugas:
Tentukan apakah pertanyaan ini merupakan FAQ umum yang dapat dijawab AI secara otomatis, ATAU memerlukan alih kendali ke konsultan manusia (Human Handoff).

Kriteria HUMAN HANDOFF (shouldHandoff = true):
- Meminta negosiasi harga, cicilan khusus, atau kerja sama kelembagaan.
- Kendala skripsi/tesis yang sangat spesifik dan rumit (dosen menolak berkali-kali, butuh tutor spesifik).
- Indikasi komplain, frustrasi, atau kebingungan pembayaran.
- Meminta kontak person admin langsung.

Keluarkan HANYA format JSON valid berikut:
{
  "shouldHandoff": true/false,
  "triggerReason": "KEYWORD_TRIGGER" / "COMPLEX_RESEARCH_TOPIC" / "NEGATIVE_SENTIMENT" / "FAQ_INQUIRY",
  "category": "KONSULTASI_RISET" / "PENDAFTARAN" / "PEMBAYARAN" / "KOMPLAIN" / "LAINNYA",
  "summary": "Ringkasan maksud pengguna dalam 1 kalimat padat",
  "confidence": 0.85,
  "customerSentiment": "POSITIVE" / "NEUTRAL" / "NEGATIVE" / "FRUSTRATED"
}`;

      const systemInstruction = "Anda adalah Lead Customer Service Classifier untuk platform EdTech riset ilmiah BIAS RISTEK.";

      const res = await fetch(`${getGeminiEndpoint()}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            temperature: 0.2,
            response_mime_type: "application/json",
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return {
            shouldHandoff: Boolean(parsed.shouldHandoff),
            triggerReason: parsed.triggerReason || "FAQ_INQUIRY",
            category: parsed.category || "KONSULTASI_RISET",
            summary: parsed.summary || cleanMsg.slice(0, 120),
            confidence: parsed.confidence || 0.8,
            customerSentiment: parsed.customerSentiment || "NEUTRAL",
          };
        }
      }
    } catch {
      // Fallback below
    }
  }

  // Default: Treat as standard FAQ for bot auto-reply
  return {
    shouldHandoff: false,
    triggerReason: "FAQ_INQUIRY",
    category: "PENDAFTARAN",
    summary: cleanMsg.slice(0, 120),
    confidence: 0.8,
    customerSentiment: "NEUTRAL",
  };
}
