"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ListOrdered, Plus, Edit, Trash2, X, Compass, Video, FileEdit, Send, Award, CheckCircle2 } from "lucide-react";
import { getLearningSteps, createLearningStep, updateLearningStep, deleteLearningStep } from "@/actions/tampilan";

type LearningStepItem = {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
};

const AVAILABLE_ICONS = ["Compass", "Video", "FileEdit", "Send", "Award", "CheckCircle2"];

export default function AlurBelajarClient({ steps: initial }: { steps: LearningStepItem[] }) {
  const router = useRouter();
  const [steps, setSteps] = useState<LearningStepItem[]>(initial);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<LearningStepItem | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSteps(initial);
  }, [initial]);

  // Form State
  const [stepNumber, setStepNumber] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Compass");
  const [isActive, setIsActive] = useState(true);

  const openCreate = () => {
    setEditing(null);
    setStepNumber(steps.length + 1);
    setTitle("");
    setDescription("");
    setIcon("Compass");
    setIsActive(true);
    setError("");
    setShowModal(true);
  };

  const openEdit = (item: LearningStepItem) => {
    setEditing(item);
    setStepNumber(item.stepNumber);
    setTitle(item.title);
    setDescription(item.description);
    setIcon(item.icon || "Compass");
    setIsActive(item.isActive);
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("stepNumber", String(stepNumber));
    formData.set("title", title);
    formData.set("description", description);
    formData.set("icon", icon);
    formData.set("isActive", String(isActive));

    const result = editing
      ? await updateLearningStep(editing.id, formData)
      : await createLearningStep(formData);

    if (result.success) {
      setShowModal(false);
      const updated = await getLearningSteps();
      setSteps(updated);
      router.refresh();
    } else {
      setError(result.message || "Gagal menyimpan langkah alur belajar");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus langkah alur bimbingan ini?")) return;
    const result = await deleteLearningStep(id);
    if (result.success) {
      const updated = await getLearningSteps();
      setSteps(updated);
      router.refresh();
    } else {
      alert(result.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg flex items-center gap-3" style={{ color: "var(--color-on-surface)" }}>
            <ListOrdered size={28} /> Alur Belajar & Bimbingan Riset
          </h1>
          <p className="text-body-md mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
            Kelola tahapan bimbingan (roadmap) yang ditampilkan ke calon peserta kursus
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-lg font-semibold text-white shadow-sm hover:shadow-md transition-all"
          style={{ background: "var(--color-primary)" }}
        >
          <Plus size={18} /> Tambah Langkah
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {steps.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl p-6 border shadow-xs transition-all relative ${
              item.isActive ? "border-gray-200" : "border-gray-200 opacity-60 bg-gray-50/50"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="w-8 h-8 rounded-full bg-[#001847] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {item.stepNumber}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(item)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#001847] hover:bg-slate-100 transition-colors"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Hapus"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">{item.description}</p>
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className={`inline-flex px-2 py-0.5 rounded-full font-semibold ${
                item.isActive ? "bg-emerald-50 text-emerald-800" : "bg-gray-100 text-gray-500"
              }`}>
                {item.isActive ? "Aktif" : "Nonaktif"}
              </span>
              <span className="text-gray-400 font-mono text-2xs">Ikon: {item.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-title-lg font-bold text-gray-900">
                {editing ? "Edit Langkah Alur" : "Tambah Langkah Alur"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg mb-4 bg-red-50 text-red-800 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Nomor Langkah</label>
                  <input
                    type="number"
                    value={stepNumber}
                    onChange={(e) => setStepNumber(Number(e.target.value))}
                    min={1}
                    max={10}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border text-sm font-bold text-blue-900 focus-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Ikon</label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm focus-ring"
                  >
                    {AVAILABLE_ICONS.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Judul Langkah</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Konsultasi & Pilih Program"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border text-sm focus-ring"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Deskripsi Singkat</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Jelaskan apa yang dilakukan peserta pada langkah ini..."
                  required
                  className="w-full px-4 py-2.5 rounded-lg border text-sm resize-none focus-ring"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="stepActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-900"
                />
                <label htmlFor="stepActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Tampilkan di Landing Page (Aktif)
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg text-sm font-semibold text-white shadow-sm disabled:opacity-50"
                  style={{ background: "var(--color-primary)" }}
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
