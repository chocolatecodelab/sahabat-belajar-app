"use client";

import { useState } from "react";
import {
  BookOpen,
  Plus,
  Phone,
  Mail,
  Award,
  DollarSign,
  CheckCircle2,
  Calendar,
  Search,
} from "lucide-react";
import { createTutor, updateTutor } from "@/actions/tutor";
import { TutorStatus } from "@prisma/client";

export default function TutorManagerClient({
  initialTutors,
  isStaffViewer = false,
}: {
  initialTutors: any[];
  isStaffViewer?: boolean;
}) {
  const [tutors, setTutors] = useState(initialTutors);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [expertiseString, setExpertiseString] = useState("");
  const [ratePerSession, setRatePerSession] = useState("100000");
  const [bio, setBio] = useState("");

  const filteredTutors = tutors.filter((t) => {
    const query = searchQuery.toLowerCase();
    const matchName = t.name.toLowerCase().includes(query);
    const matchPhone = t.phone.includes(query);
    const matchExp = t.expertise?.some((e: string) => e.toLowerCase().includes(query));
    return matchName || matchPhone || matchExp;
  });

  const handleCreateTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setIsSubmitting(true);

    const expertise = expertiseString
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await createTutor({
      name,
      phone,
      email: email || undefined,
      expertise,
      ratePerSession: parseInt(ratePerSession) || 100000,
      bio,
    });
    setIsSubmitting(false);

    if (res.success && res.data) {
      setTutors((prev) => [
        {
          id: res.data!.id,
          name,
          phone,
          email,
          expertise,
          ratePerSession: parseInt(ratePerSession) || 100000,
          status: "AKTIF",
          bio,
          _count: { sessions: 0 },
        },
        ...prev,
      ]);
      setShowAddModal(false);
      setName("");
      setPhone("");
      setEmail("");
      setExpertiseString("");
      setRatePerSession("100000");
      setBio("");
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#09408C] font-display">
            Direktori Tutor Pakar
          </h1>
          <p className="text-sm text-[#5B6882] mt-0.5">
            Daftar pengajar bimbingan belajar privat & semi-privat Sahabat Belajar.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors shadow-xs"
        >
          <Plus size={14} />
          <span>Tambah Tutor Baru</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3 top-2.5 text-[#5B6882]" />
          <input
            type="text"
            placeholder="Cari nama tutor atau bidang keahlian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5DDEB] focus-ring bg-white"
          />
        </div>
      </div>

      {/* Grid of Tutors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTutors.map((tutor) => (
          <div
            key={tutor.id}
            className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-xs hover:border-[#9AC1E2] transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base text-[#1B2A41] font-display">
                    {tutor.name}
                  </h3>
                  <div className="text-xs text-[#5B6882] flex items-center gap-1 mt-0.5">
                    <Phone size={11} className="text-[#1F6F4A]" />
                    <a
                      href={`https://wa.me/${tutor.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-[#1F6F4A] font-semibold"
                    >
                      {tutor.phone}
                    </a>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E3F4EC] text-[#1F6F4A] border border-[#A3E635]">
                  {tutor.status}
                </span>
              </div>

              {/* Keahlian Tags */}
              <div className="mt-3 flex flex-wrap gap-1">
                {tutor.expertise?.map((exp: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-[#EAF1FA] text-[#09408C] rounded-md text-[11px] font-medium"
                  >
                    {exp}
                  </span>
                ))}
              </div>

              {tutor.bio && (
                <p className="text-xs text-[#5B6882] mt-2.5 line-clamp-2">{tutor.bio}</p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#D5DDEB] flex items-center justify-between text-xs">
              <div>
                <span className="text-[#5B6882]">Tarif Honor: </span>
                {isStaffViewer ? (
                  <span className="italic text-[#5B6882]">Dirahasiakan</span>
                ) : (
                  <span className="font-bold text-[#09408C] tabular-nums">
                    Rp {tutor.ratePerSession?.toLocaleString("id-ID")} / sesi
                  </span>
                )}
              </div>

              <div className="text-[11px] text-[#5B6882]">
                <strong>{tutor._count?.sessions || 0}</strong> sesi total
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah Tutor */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateTutor}
            className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#D5DDEB] shadow-xl space-y-4"
          >
            <h3 className="text-lg font-bold text-[#09408C] font-display">
              Tambah Profil Tutor
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                Nama Lengkap & Gelar *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Muhammad Akbar, S.Pd."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Nomor WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Tarif Honor per Sesi (Rp) *
                </label>
                <input
                  type="number"
                  required
                  value={ratePerSession}
                  onChange={(e) => setRatePerSession(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                Bidang Keahlian / Mapel (pisahkan dengan koma)
              </label>
              <input
                type="text"
                placeholder="Matematika SMA, Fisika, SKD TIU"
                value={expertiseString}
                onChange={(e) => setExpertiseString(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                Biografi Singkat / Pengalaman Mengajar
              </label>
              <textarea
                rows={2}
                placeholder="Pengalaman mengajar 4 tahun, alumni FMIPA..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D5DDEB]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB] rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold bg-[#09408C] text-white hover:bg-[#0E3571] rounded-xl transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Tutor"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
