"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  BookOpen,
  Calendar,
  DollarSign,
  User,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import TinyEditor from "@/components/admin/TinyEditor";
import CoverImageUpload from "@/components/admin/CoverImageUpload";
import { createCourse, updateCourse, type CourseItem } from "@/actions/kursus";

interface CourseFormProps {
  initialData?: CourseItem | null;
  isEditing?: boolean;
}

export default function CourseForm({ initialData, isEditing = false }: CourseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Form Fields
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [tagline, setTagline] = useState(initialData?.tagline || "");
  const [category, setCategory] = useState(initialData?.category || "Scopus & SINTA");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState<number>(initialData?.price || 500000);
  const [salePrice, setSalePrice] = useState<string>(initialData?.salePrice?.toString() || "");
  const [isFree, setIsFree] = useState<boolean>(initialData?.isFree || false);
  const [level, setLevel] = useState(initialData?.level || "Semua Jenjang");
  const [deliveryMode, setDeliveryMode] = useState(initialData?.deliveryMode || "Live Zoom & Mentorship");
  const [batchNumber, setBatchNumber] = useState(initialData?.batchNumber || "Batch 01");
  const [startDate, setStartDate] = useState(initialData?.startDate || "");
  const [duration, setDuration] = useState(initialData?.duration || "4 Minggu (8 Sesi)");
  const [maxQuota, setMaxQuota] = useState<number>(initialData?.maxQuota || 30);
  const [featuredImage, setFeaturedImage] = useState<string | null>(initialData?.featuredImage || null);
  const [mentorName, setMentorName] = useState(initialData?.mentorName || "Dr. Ir. Tim Pakar Riset");
  const [mentorTitle, setMentorTitle] = useState(initialData?.mentorTitle || "Reviewer Jurnal Scopus Q1");
  const [mentorAvatar, setMentorAvatar] = useState<string | null>(initialData?.mentorAvatar || null);
  const [status, setStatus] = useState<"OPEN" | "UPCOMING" | "FULL" | "CLOSED">(initialData?.status || "OPEN");

  // Dynamic Lists: Curriculum & Benefits
  let initialCurriculum: string[] = ["Sesi 1: Pengantar & Bedah Anatomi Standar", "Sesi 2: Metodologi & Analisis Data"];
  try {
    if (initialData?.curriculum) initialCurriculum = JSON.parse(initialData.curriculum);
  } catch {}

  let initialBenefits: string[] = ["E-Sertifikat 32 JP Resmi", "Akses Rekaman Zoom Seumur Hidup", "Template Olah Data"];
  try {
    if (initialData?.benefits) initialBenefits = JSON.parse(initialData.benefits);
  } catch {}

  const [curriculumList, setCurriculumList] = useState<string[]>(initialCurriculum);
  const [newSession, setNewSession] = useState("");

  const [benefitsList, setBenefitsList] = useState<string[]>(initialBenefits);
  const [newBenefit, setNewBenefit] = useState("");

  const handleAddCurriculum = () => {
    if (newSession.trim()) {
      setCurriculumList([...curriculumList, newSession.trim()]);
      setNewSession("");
    }
  };

  const handleRemoveCurriculum = (index: number) => {
    setCurriculumList(curriculumList.filter((_, i) => i !== index));
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setBenefitsList([...benefitsList, newBenefit.trim()]);
      setNewBenefit("");
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefitsList(benefitsList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Judul program kelas wajib diisi");
      return;
    }

    setError("");
    startTransition(async () => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("tagline", tagline);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("price", price.toString());
      formData.append("salePrice", salePrice);
      formData.append("isFree", isFree.toString());
      formData.append("level", level);
      formData.append("deliveryMode", deliveryMode);
      formData.append("batchNumber", batchNumber);
      formData.append("startDate", startDate);
      formData.append("duration", duration);
      formData.append("maxQuota", maxQuota.toString());
      formData.append("featuredImage", featuredImage || "");
      formData.append("mentorName", mentorName);
      formData.append("mentorTitle", mentorTitle);
      formData.append("mentorAvatar", mentorAvatar || "");
      formData.append("curriculum", JSON.stringify(curriculumList));
      formData.append("benefits", JSON.stringify(benefitsList));
      formData.append("status", status);

      let res;
      if (isEditing && initialData?.id) {
        res = await updateCourse(initialData.id, formData);
      } else {
        res = await createCourse(formData);
      }

      if (res.success) {
        router.push("/dashboard/kursus");
      } else {
        setError(res.message || "Gagal menyimpan program kursus");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-[var(--font-body)] animate-fade-in pb-16">
      {/* Header Bar */}
      <div
        className="elevation-1 rounded-2xl p-6 bg-white border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          borderColor: "var(--color-outline-variant)",
          borderTop: "4px solid var(--color-primary)",
        }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/kursus"
            className="p-2.5 rounded-xl border hover:bg-slate-50 text-gray-600 transition-colors"
            style={{ borderColor: "var(--color-outline-variant)" }}
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-display-md font-extrabold font-[var(--font-heading)]" style={{ color: "var(--color-on-surface)" }}>
              {isEditing ? "Edit Program Kursus" : "Tambah Program Kursus Baru"}
            </h1>
            <p className="text-body-sm text-gray-500 mt-1">
              Atur silabus materi, profil mentor pakar, harga investasi, dan kuota pendaftaran
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-label-lg font-bold text-white shadow-xs hover:opacity-90 transition-all self-start sm:self-center disabled:opacity-50"
          style={{ background: "var(--color-primary)" }}
        >
          {isPending ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          <span>{isEditing ? "Simpan Perubahan" : "Publikasikan Program"}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-body-sm font-semibold">
          {error}
        </div>
      )}

      {/* Main Grid: Left 2 Cols (Details, Editor, Syllabus) + Right 1 Col (Settings & Media) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT 2 COLS */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <div
            className="elevation-1 rounded-2xl p-6 bg-white border space-y-4"
            style={{ borderColor: "var(--color-outline-variant)" }}
          >
            <h3 className="font-bold text-headline-sm font-[var(--font-heading)] text-gray-900">
              Informasi Umum Program
            </h3>

            <div>
              <label className="text-label-md font-bold block mb-1" style={{ color: "var(--color-on-surface)" }}>
                Judul Program Kursus <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Mentorship Intensif Publikasi Jurnal Scopus Q1-Q2"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border text-body-md focus-ring bg-white font-bold"
                style={{ borderColor: "var(--color-outline-variant)" }}
              />
            </div>

            <div>
              <label className="text-label-md font-bold block mb-1" style={{ color: "var(--color-on-surface)" }}>
                Tagline / Ringkasan Menarik
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Contoh: Bimbingan langkah demi langkah dari draft mentah hingga Accepted"
                className="w-full px-3.5 py-2 rounded-xl border text-body-sm focus-ring bg-white"
                style={{ borderColor: "var(--color-outline-variant)" }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-label-md font-bold block mb-1" style={{ color: "var(--color-on-surface)" }}>
                  Kategori Kursus
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-body-sm focus-ring bg-white font-semibold"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                >
                  <option value="Scopus & SINTA">Scopus & SINTA</option>
                  <option value="SmartPLS & SEM">SmartPLS & SEM</option>
                  <option value="SPSS & Statistik">SPSS & Statistik</option>
                  <option value="Bimbingan Tesis">Bimbingan Tesis / Disertasi</option>
                  <option value="Metodologi">Metodologi Riset</option>
                  <option value="Umum">Umum</option>
                </select>
              </div>

              <div>
                <label className="text-label-md font-bold block mb-1" style={{ color: "var(--color-on-surface)" }}>
                  Metode Pelaksanaan
                </label>
                <select
                  value={deliveryMode}
                  onChange={(e) => setDeliveryMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-body-sm focus-ring bg-white font-semibold"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                >
                  <option value="Live Zoom & Mentorship">Live Zoom & Mentorship</option>
                  <option value="1-on-1 Mentorship Khusus">1-on-1 Mentorship Khusus</option>
                  <option value="Video On-Demand & Diskusi">Video On-Demand & Diskusi</option>
                  <option value="Workshop Offline (Tatap Muka)">Workshop Offline (Tatap Muka)</option>
                </select>
              </div>
            </div>

            {/* Rich Text Editor for Full Description */}
            <div>
              <label className="text-label-md font-bold block mb-2" style={{ color: "var(--color-on-surface)" }}>
                Deskripsi Lengkap & Penjelasan Program
              </label>
              <TinyEditor
                value={description}
                onChange={(content) => setDescription(content)}
                height={350}
                placeholder="Tuliskan deskripsi lengkap, latar belakang, dan cakupan program pelatihan..."
              />
            </div>
          </div>

          {/* Curriculum & Syllabus Builder */}
          <div
            className="elevation-1 rounded-2xl p-6 bg-white border space-y-4"
            style={{ borderColor: "var(--color-outline-variant)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-headline-sm font-[var(--font-heading)] text-gray-900">
                  Silabus & Kurikulum Sesi Pembelajaran
                </h3>
                <p className="text-2xs text-gray-500">Tambahkan topik pembahasan per sesi/pertemuan</p>
              </div>
              <span className="text-3xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 border">
                {curriculumList.length} Sesi
              </span>
            </div>

            <div className="space-y-2">
              {curriculumList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-blue-900 text-white font-bold text-3xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-2xs font-semibold text-gray-800 truncate">{item}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCurriculum(idx)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newSession}
                onChange={(e) => setNewSession(e.target.value)}
                placeholder="Tambah judul sesi baru..."
                className="flex-1 px-3 py-2 rounded-lg border text-2xs focus-ring bg-white"
                style={{ borderColor: "var(--color-outline-variant)" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCurriculum();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCurriculum}
                className="px-4 py-2 rounded-lg text-2xs font-bold text-white bg-blue-900 hover:bg-blue-950 flex items-center gap-1 shrink-0"
              >
                <Plus size={14} /> Tambah Sesi
              </button>
            </div>
          </div>

          {/* Benefits & Facilities Builder */}
          <div
            className="elevation-1 rounded-2xl p-6 bg-white border space-y-4"
            style={{ borderColor: "var(--color-outline-variant)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-headline-sm font-[var(--font-heading)] text-gray-900">
                  Fasilitas & Keuntungan Peserta
                </h3>
                <p className="text-2xs text-gray-500">Poin fasilitas (E-Sertifikat, Rekaman, Template Olah Data, dll.)</p>
              </div>
            </div>

            <div className="space-y-2">
              {benefitsList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-200"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span className="text-2xs font-semibold text-emerald-950 truncate">{item}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveBenefit(idx)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                placeholder="Tambah fasilitas baru..."
                className="flex-1 px-3 py-2 rounded-lg border text-2xs focus-ring bg-white"
                style={{ borderColor: "var(--color-outline-variant)" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddBenefit();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddBenefit}
                className="px-4 py-2 rounded-lg text-2xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 flex items-center gap-1 shrink-0"
              >
                <Plus size={14} /> Tambah Fasilitas
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT 1 COL */}
        <div className="lg:col-span-1 space-y-6">
          {/* Pricing & Quota Card */}
          <div
            className="elevation-1 rounded-2xl p-5 bg-white border space-y-4"
            style={{ borderColor: "var(--color-outline-variant)" }}
          >
            <h3 className="font-bold text-headline-sm font-[var(--font-heading)] text-gray-900">
              Investasi & Kuota Pendaftaran
            </h3>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border" style={{ borderColor: "var(--color-outline-variant)" }}>
              <input
                type="checkbox"
                id="isFree"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="w-4 h-4 rounded text-blue-900"
              />
              <label htmlFor="isFree" className="text-2xs font-bold text-gray-800 cursor-pointer">
                Program Gratis / Webinar Terbuka
              </label>
            </div>

            {!isFree && (
              <>
                <div>
                  <label className="text-2xs font-bold text-gray-600 block mb-1">
                    Harga Normal (Rp)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border text-body-sm font-bold bg-white"
                    style={{ borderColor: "var(--color-outline-variant)" }}
                  />
                </div>

                <div>
                  <label className="text-2xs font-bold text-gray-600 block mb-1">
                    Harga Promo / Diskon (Rp - Opsional)
                  </label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="Kosongkan jika tanpa diskon"
                    className="w-full px-3 py-2 rounded-lg border text-body-sm font-bold bg-white text-emerald-700"
                    style={{ borderColor: "var(--color-outline-variant)" }}
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2 border-t" style={{ borderColor: "var(--color-outline-variant)" }}>
              <div>
                <label className="text-3xs font-bold text-gray-500 block mb-1">
                  Gelombang / Batch
                </label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="Batch 14"
                  className="w-full px-2.5 py-1.5 rounded-lg border text-2xs bg-white"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                />
              </div>

              <div>
                <label className="text-3xs font-bold text-gray-500 block mb-1">
                  Kuota Maksimal
                </label>
                <input
                  type="number"
                  value={maxQuota}
                  onChange={(e) => setMaxQuota(parseInt(e.target.value) || 30)}
                  className="w-full px-2.5 py-1.5 rounded-lg border text-2xs bg-white font-bold"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-3xs font-bold text-gray-500 block mb-1">
                  Tanggal Mulai
                </label>
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="15 Sep 2026"
                  className="w-full px-2.5 py-1.5 rounded-lg border text-2xs bg-white"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                />
              </div>

              <div>
                <label className="text-3xs font-bold text-gray-500 block mb-1">
                  Durasi Kursus
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="4 Minggu"
                  className="w-full px-2.5 py-1.5 rounded-lg border text-2xs bg-white"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                />
              </div>
            </div>

            <div>
              <label className="text-2xs font-bold text-gray-600 block mb-1">
                Status Pendaftaran
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border text-2xs font-bold bg-white"
                style={{ borderColor: "var(--color-outline-variant)" }}
              >
                <option value="OPEN">OPEN (Pendaftaran Terbuka)</option>
                <option value="UPCOMING">UPCOMING (Segera Hadir)</option>
                <option value="FULL">FULL (Kuota Penuh)</option>
                <option value="CLOSED">CLOSED (Ditutup)</option>
              </select>
            </div>
          </div>

          {/* Cover Image Upload */}
          <div
            className="elevation-1 rounded-2xl p-5 bg-white border space-y-3"
            style={{ borderColor: "var(--color-outline-variant)" }}
          >
            <h3 className="font-bold text-headline-sm font-[var(--font-heading)] text-gray-900">
              Gambar Sampul / Banner
            </h3>
            <CoverImageUpload
              value={featuredImage}
              onChange={(url) => setFeaturedImage(url)}
              folder="covers"
            />
          </div>

          {/* Mentor Profile Details */}
          <div
            className="elevation-1 rounded-2xl p-5 bg-white border space-y-3"
            style={{ borderColor: "var(--color-outline-variant)" }}
          >
            <h3 className="font-bold text-headline-sm font-[var(--font-heading)] text-gray-900">
              Profil Mentor / Instruktur
            </h3>

            <div>
              <label className="text-3xs font-bold text-gray-500 block mb-1">
                Nama Lengkap Mentor & Gelar
              </label>
              <input
                type="text"
                value={mentorName}
                onChange={(e) => setMentorName(e.target.value)}
                placeholder="Dr. Ir. Hendra Gunawan, M.Sc."
                className="w-full px-3 py-2 rounded-lg border text-2xs bg-white font-bold"
                style={{ borderColor: "var(--color-outline-variant)" }}
              />
            </div>

            <div>
              <label className="text-3xs font-bold text-gray-500 block mb-1">
                Jabatan / Keahlian Mentor
              </label>
              <input
                type="text"
                value={mentorTitle}
                onChange={(e) => setMentorTitle(e.target.value)}
                placeholder="Chief Editor & Reviewer Jurnal Scopus Q1"
                className="w-full px-3 py-2 rounded-lg border text-2xs bg-white"
                style={{ borderColor: "var(--color-outline-variant)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
