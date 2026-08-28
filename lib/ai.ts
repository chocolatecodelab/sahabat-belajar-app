import { cleanHtmlToText } from "@/lib/utils";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Helper to call Gemini API with prompt and system instructions
 */
async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY belum disetel di file .env");
  }

  const payload: any = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 8192,
      response_mime_type: "application/json",
    },
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const rawMsg = errorData?.error?.message || "";
    const code = response.status;

    if (code === 429 || rawMsg.toLowerCase().includes("quota") || rawMsg.toLowerCase().includes("resource_exhausted")) {
      throw new Error(
        "Batas kuota Gemini API tercapai (Rate Limit / Quota Exceeded). Silakan tunggu 30-60 detik atau periksa kuota di Google AI Studio."
      );
    }
    if (code === 400 && (rawMsg.includes("API_KEY") || rawMsg.includes("invalid"))) {
      throw new Error("GEMINI_API_KEY tidak valid atau belum diaktifkan di Google AI Studio.");
    }
    throw new Error(rawMsg || `Gemini API error (Status ${code})`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return text.trim();
}

/**
 * Strip Markdown code blocks if JSON was wrapped in ```json ... ```
 */
function cleanJsonOutput(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

/**
 * 1. AI Auto SEO Generator (Excerpt, Meta Title, Meta Description)
 */
export async function generateArticleSEO(title: string, content: string) {
  const plainText = (content || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 3000);

  const prompt = `Analisis artikel berikut dari platform kursus riset ilmiah "BIAS RISTEK":
Judul Saat Ini: "${title || "Tanpa Judul"}"
Isi Artikel:
"${plainText}"

Tugas Anda:
1. Buat 'excerpt' (ringkasan padat dan menarik untuk preview card berita, 140-180 karakter).
2. Buat 'metaTitle' (ramah Google SEO, menyertakan keyword utama riset/penelitian, maksimal 55-60 karakter).
3. Buat 'metaDescription' (meta deskripsi SEO dengan call-to-action yang meningkatkan CTR di Google, 130-155 karakter).
4. Buat 'keywords' (array berisi 4-6 kata kunci/tag relevan).

Keluarkan HANYA format JSON valid berikut tanpa pembuka/penutup tambahan:
{
  "excerpt": "...",
  "metaTitle": "...",
  "metaDescription": "...",
  "keywords": ["...", "..."]
}`;

  const systemInstruction = "Anda adalah Senior SEO Specialist & Academic Content Strategist profesional untuk portal riset ilmiah dan publikasi akademik.";

  const raw = await callGemini(prompt, systemInstruction);
  try {
    const parsed = JSON.parse(cleanJsonOutput(raw));
    return {
      success: true,
      data: parsed,
    };
  } catch {
    return {
      success: false,
      error: "Gagal memproses format respons AI",
      raw,
    };
  }
}

/**
 * 2. AI Headline & Title Optimizer
 */
export async function suggestTitles(content: string, currentTitle?: string) {
  const plainText = (content || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 2500);

  const prompt = `Artikel tentang pelatihan riset dan publikasi ilmiah:
Judul Asli: "${currentTitle || "Belum ada"}"
Konten:
"${plainText || currentTitle || "Panduan penelitian dan publikasi jurnal ilmiah"}"

Buatlah 5 variasi judul artikel yang sangat menarik, berbobot, dan ramah SEO dengan kategori gaya berikut:
1. Akademik Formal (kredibel untuk dosen/peneliti)
2. Action & Solusi Praktis (mengatasi kendala riset/skripsi)
3. SEO Keyword Hook (berdasarkan pencarian Google)
4. Panduan / How-To (langkah demi langkah)
5. Ringkas & Berdampak Tinggi

Keluarkan HANYA format JSON valid:
{
  "titles": [
    { "style": "Akademik Formal", "title": "..." },
    { "style": "Solusi & Praktis", "title": "..." },
    { "style": "SEO Hook", "title": "..." },
    { "style": "Panduan / How-To", "title": "..." },
    { "style": "Ringkas & Berdampak", "title": "..." }
  ]
}`;

  const raw = await callGemini(prompt, "Anda adalah Editor Jurnal & Jurnalis Sains Berpengalaman.");
  try {
    const parsed = JSON.parse(cleanJsonOutput(raw));
    return {
      success: true,
      data: parsed.titles || [],
    };
  } catch {
    return {
      success: false,
      error: "Gagal memproses variasi judul",
      raw,
    };
  }
}

/**
 * 3. AI Academic Tone & Grammar Polisher
 */
export async function polishAcademicTone(text: string) {
  const prompt = `Perbaiki dan sempurnakan paragraf draft artikel riset berikut agar memiliki tata bahasa Bahasa Indonesia baku (EYD/PUEBI), gaya bahasa akademik yang elegan, jelas, dan persuasif:

Draft Asli:
"${text}"

Tugas Anda:
1. Sempurnakan kalimat yang ambigu, rancu, atau informal menjadi bahasa akademik profesional.
2. Pertahankan makna aslinya.
3. Berikan catatan singkat perubahan yang dilakukan.

Keluarkan HANYA format JSON valid:
{
  "polishedText": "...",
  "notes": "..."
}`;

  const raw = await callGemini(prompt, "Anda adalah Chief Editor penerbitan buku ilmiah dan jurnal internasional.");
  try {
    const parsed = JSON.parse(cleanJsonOutput(raw));
    return {
      success: true,
      data: parsed,
    };
  } catch {
    return {
      success: false,
      error: "Gagal memoles gaya bahasa",
      raw,
    };
  }
}

/**
 * 4. AI Article Outline Generator (Formatted as HTML for TinyMCE)
 */
export async function generateArticleOutline(topic: string, keywords?: string) {
  const prompt = `Buat kerangka (outline) artikel riset & panduan mendalam untuk portal BIAS RISTEK berdasarkan topik berikut:
Topik: "${topic}"
Kata Kunci Terkait: "${keywords || "riset, publikasi, metode penelitian"}"

Format output harus berupa HTML bersih (menggunakan tag <h2>, <h3>, <p>, <ul>, <li>) yang siap dimasukkan ke editor TinyMCE, dengan struktur:
- <h2> Pendahuluan & Latar Belakang Masalah
- <h2> Poin-Poin Pembahasan Utama (dengan sub-bab <h3> dan bullet points)
- <h2> Studi Kasus / Tips Praktis untuk Peneliti
- <h2> Kesimpulan & Langkah Selanjutnya

Keluarkan HANYA format JSON valid:
{
  "titleSuggestion": "...",
  "outlineHtml": "<h2>...</h2>...",
  "summary": "..."
}`;

  const raw = await callGemini(prompt, "Anda adalah Dosen Peneliti dan Academic Curriculum Writer.");
  try {
    const parsed = JSON.parse(cleanJsonOutput(raw));
    return {
      success: true,
      data: parsed,
    };
  } catch (err: any) {
    // Regex fallback to recover outline if JSON parsing failed
    const htmlMatch = raw.match(/"outlineHtml"\s*:\s*"([\s\S]*?)"(?=\s*,\s*"summary"|\s*})/);
    const titleMatch = raw.match(/"titleSuggestion"\s*:\s*"([^"]+)"/);
    if (htmlMatch && htmlMatch[1]) {
      const recoveredHtml = htmlMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
      return {
        success: true,
        data: {
          titleSuggestion: titleMatch ? titleMatch[1] : topic,
          outlineHtml: recoveredHtml,
          summary: "Outline artikel hasil kurasi AI.",
        },
      };
    }
    return {
      success: false,
      error: "Gagal memproses struktur outline AI: " + err.message,
      raw,
    };
  }
}

/**
 * 5. AI Course Counselor Chatbot Engine
 */
export async function callGeminiCounselor(
  messages: { role: "user" | "assistant"; content: string }[],
  coursesContext: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!GEMINI_API_KEY) {
    return { success: false, error: "GEMINI_API_KEY belum disetel di file .env" };
  }

  try {
    const systemInstruction = `Anda adalah "Dr. Ristek AI", Konsultan Akademik Senior & Penasihat Program Riset di BIAS RISTEK.

IDENTITAS & KARAKTER:
- Nama: Dr. Ristek AI
- Gaya Bahasa: Ramah, empatik, berbasis solusi akademik, profesional, dan menyemangati (Academic Innovation).
- Tugas Utama:
  1. Membantu calon peserta (mahasiswa S1/S2/S3, dosen, dan peneliti) mendiagnosis kendala riset mereka (misal: penyusunan Bab 1-5 tesis/disertasi, perumusan GAP analysis/novelty, olah data statistik dengan SmartPLS 4 atau SPSS, penulisan artikel Scopus Q1-Q4 / SINTA 1-2, dan strategi menjawab reviewer).
  2. Memberikan solusi akademis ringkas dan merekomendasikan program kursus / bimbingan BIAS RISTEK yang paling cocok dari daftar kelas aktif yang tersedia.
  3. Menjawab pertanyaan seputar fasilitas (E-Sertifikat 32 JP, rekaman Zoom seumur hidup, review draft 1-on-1, komunitas alumni), jadwal batch, harga promo, dan metode pembayaran (QRIS & Transfer Bank BCA/Mandiri/BSI).
  4. Jika peserta butuh konsultasi instansi kustom, sarankan untuk klik tombol WhatsApp Admin.

DATA KATALOG PROGRAM KELAS AKTIF BIAS RISTEK:
${coursesContext}

PETUNJUK FORMAT RESPON:
Wajib memberikan output HANYA dalam format JSON valid berikut:
{
  "reply": "Teks jawaban Anda dalam format Markdown (gunakan bold, bullet points, penomoran yang rapi). Berikan empati, panduan akademis praktis, dan jelaskan mengapa program yang disarankan sangat relevan.",
  "recommendedCourseSlugs": ["slug-kursus-1", "slug-kursus-2"],
  "suggestedQuestions": [
    "Saran pertanyaan cepat 1",
    "Saran pertanyaan cepat 2",
    "Saran pertanyaan cepat 3"
  ]
}

Catatan: "recommendedCourseSlugs" hanya diisi slug kelas yang benar-benar relevan dengan pertanyaan user (bisa kosong [] jika user hanya menyapa atau bertanya hal umum).`;

    // Map messages to Gemini format (user / model)
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const payload: any = {
      contents,
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 8192,
        response_mime_type: "application/json",
      },
    };

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const rawMsg = errorData?.error?.message || "";
      const code = response.status;

      if (code === 429 || rawMsg.toLowerCase().includes("quota") || rawMsg.toLowerCase().includes("resource_exhausted")) {
        return { success: false, error: "Batas kuota AI tercapai. Silakan coba lagi beberapa saat." };
      }
      return { success: false, error: rawMsg || `Gemini API error (Status ${code})` };
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    try {
      const parsed = JSON.parse(cleanJsonOutput(text));
      return {
        success: true,
        data: parsed,
      };
    } catch {
      return {
        success: true,
        data: {
          reply: text,
          recommendedCourseSlugs: [],
          suggestedQuestions: [
            "Bagaimana cara daftar kelas?",
            "Apakah dapat sertifikat 32 JP?",
            "Berapa biaya bimbingan riset?"
          ],
        },
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Gagal menghubungi layanan Gemini AI",
    };
  }
}

