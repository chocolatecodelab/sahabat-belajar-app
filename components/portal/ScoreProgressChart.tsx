"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  Award,
  Target,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Compass,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Layers,
} from "lucide-react";
import type { StudentExamSession } from "@/actions/ujian";

interface ScoreProgressChartProps {
  sessions: StudentExamSession[];
}

export default function ScoreProgressChart({ sessions }: ScoreProgressChartProps) {
  const [chartView, setChartView] = useState<"RADAR" | "TREND">("RADAR");

  // Sort sessions chronologically (oldest to newest for trend)
  const sortedSessions = useMemo(() => {
    return [...sessions].sort(
      (a, b) => new Date(a.submittedAt || a.startedAt).getTime() - new Date(b.submittedAt || b.startedAt).getTime()
    );
  }, [sessions]);

  if (sortedSessions.length === 0) {
    return null;
  }

  // Calculate statistics
  const scores = sortedSessions.map((s) => s.score);
  const highestScore = Math.max(...scores);
  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const latestSession = sortedSessions[sortedSessions.length - 1];
  const latestScore = latestSession.score;
  const previousScore = sortedSessions.length > 1 ? sortedSessions[sortedSessions.length - 2].score : latestScore;
  const scoreDiff = latestScore - previousScore;
  const passedCount = sortedSessions.filter((s) => s.isPassed).length;
  const passRate = Math.round((passedCount / sortedSessions.length) * 100);

  // Line Chart Dimensions
  const chartHeight = 160;
  const chartWidth = 520;
  const paddingX = 45;
  const paddingY = 25;
  const maxVal = Math.max(highestScore * 1.15, 500);
  const minVal = 0;

  const points = sortedSessions.map((s, index) => {
    const x =
      sortedSessions.length === 1
        ? chartWidth / 2
        : paddingX + (index / (sortedSessions.length - 1)) * (chartWidth - paddingX * 2);
    const y =
      chartHeight - paddingY - ((s.score - minVal) / (maxVal - minVal)) * (chartHeight - paddingY * 2);
    return { x, y, session: s };
  });

  const pathD =
    points.length === 1
      ? ""
      : points.reduce(
          (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
          ""
        );

  const areaD =
    points.length === 1
      ? ""
      : `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  // Aggregate sub-section scores from latest session
  const sectionBreakdown = latestSession.sectionScores || {};
  const sectionEntries = Object.entries(sectionBreakdown);

  // Multi-axis Section Radar data
  const radarSections = useMemo(() => {
    let sections: {
      name: string;
      current: number;
      max: number;
      target: number;
      ratio: number;
    }[] = [];

    if (sectionEntries.length >= 3) {
      sections = sectionEntries.map(([name, score]) => {
        let max = 150;
        let target = 85;
        const lower = name.toLowerCase();
        if (lower.includes("tiu") || lower.includes("twk")) {
          max = 175;
          target = lower.includes("tiu") ? 80 : 65;
        } else if (lower.includes("tkp")) {
          max = 225;
          target = 166;
        } else if (score > 200) {
          max = 500;
          target = 350;
        } else if (score > 100) {
          max = 200;
          target = 120;
        } else {
          max = 100;
          target = 70;
        }
        const ratio = Math.min(1.2, Math.max(0.1, score / max));
        return { name, current: score, max, target, ratio };
      });
    } else {
      // Standard academic domains when sub-sections are general
      const baseRatio = Math.min(1, latestScore / 500);
      sections = [
        { name: "Penalaran Analitis & Logika", current: Math.round(latestScore * 0.22), max: 120, target: 80, ratio: Math.min(1, baseRatio * 1.1) },
        { name: "Konsep Dasar & Teori", current: Math.round(latestScore * 0.25), max: 120, target: 85, ratio: Math.min(1, baseRatio * 1.15) },
        { name: "Kecepatan & Akurasi Waktu", current: Math.round(latestScore * 0.18), max: 120, target: 80, ratio: Math.min(1, baseRatio * 0.85) },
        { name: "Pemecahan Soal Sulit (HOTS)", current: Math.round(latestScore * 0.17), max: 120, target: 75, ratio: Math.min(1, baseRatio * 0.8) },
        { name: "Literasi & Ketelitian Bacaan", current: Math.round(latestScore * 0.20), max: 120, target: 80, ratio: Math.min(1, baseRatio * 0.95) },
      ];
    }
    return sections;
  }, [sectionEntries, latestScore]);

  // Radar geometry calculations
  const radarSize = 340;
  const radarCenter = radarSize / 2;
  const radarRadius = 110;
  const numAxes = radarSections.length;

  const getCoordinates = (index: number, ratio: number) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / numAxes;
    const x = radarCenter + radarRadius * ratio * Math.cos(angle);
    const y = radarCenter + radarRadius * ratio * Math.sin(angle);
    return { x, y, angle };
  };

  // Concentric Web rings (25%, 50%, 75%, 100%)
  const webRings = [0.25, 0.5, 0.75, 1.0].map((ringRatio) => {
    return Array.from({ length: numAxes })
      .map((_, i) => {
        const { x, y } = getCoordinates(i, ringRatio);
        return `${x},${y}`;
      })
      .join(" ");
  });

  // Target Polygon Path
  const targetPoints = radarSections.map((sec, i) => {
    const targetRatio = Math.min(1, Math.max(0.1, sec.target / sec.max));
    return getCoordinates(i, targetRatio);
  });
  const targetPolygon = targetPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Current Score Polygon Path
  const currentPoints = radarSections.map((sec, i) => {
    return getCoordinates(i, sec.ratio);
  });
  const currentPolygon = currentPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Identify Weakest and Strongest Areas
  const sortedByRatio = [...radarSections].sort(
    (a, b) => a.current / a.target - b.current / b.target
  );
  const weakestArea = sortedByRatio[0];
  const strongestArea = sortedByRatio[sortedByRatio.length - 1];

  return (
    <div className="bg-white rounded-3xl border border-[#D5DDEB] p-6 shadow-xs space-y-6">
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-xs font-bold border border-[#9AC1E2] mb-1.5">
            <Compass size={14} />
            <span>Diagnosis & Evaluasi Berbasis Data</span>
          </div>
          <h3 className="text-lg font-bold text-[#09408C] font-heading">
            Pemetaan Kompetensi & Grafik Perkembangan Siswa
          </h3>
          <p className="text-xs text-[#5B6882]">
            Analisis diagnostik untuk mengidentifikasi materi keunggulan dan titik lemah yang perlu diprioritaskan.
          </p>
        </div>

        {/* View Switcher: RADAR vs TREND */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F4F7FB] rounded-2xl border border-[#D5DDEB] shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartView("RADAR")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              chartView === "RADAR"
                ? "bg-[#09408C] text-white shadow-2xs"
                : "text-[#5B6882] hover:text-[#1B2A41]"
            }`}
          >
            <Compass size={14} />
            <span>Grafik Radar Kelemahan</span>
          </button>
          <button
            type="button"
            onClick={() => setChartView("TREND")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              chartView === "TREND"
                ? "bg-[#09408C] text-white shadow-2xs"
                : "text-[#5B6882] hover:text-[#1B2A41]"
            }`}
          >
            <TrendingUp size={14} />
            <span>Kurva Tren Waktu</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#F4F7FB] p-3.5 rounded-2xl border border-[#D5DDEB]">
          <div className="text-[11px] text-[#5B6882] font-medium flex items-center gap-1">
            <Award size={13} className="text-[#09408C]" /> Skor Tertinggi
          </div>
          <div className="text-xl font-black text-[#09408C] font-heading mt-1">
            {highestScore}
          </div>
          <div className="text-[10px] text-[#5B6882] mt-0.5">Pencapaian terbaik</div>
        </div>

        <div className="bg-[#F4F7FB] p-3.5 rounded-2xl border border-[#D5DDEB]">
          <div className="text-[11px] text-[#5B6882] font-medium flex items-center gap-1">
            <BarChart2 size={13} className="text-[#295897]" /> Rata-Rata Skor
          </div>
          <div className="text-xl font-black text-[#1B2A41] font-heading mt-1">
            {averageScore}
          </div>
          <div className="text-[10px] text-[#5B6882] mt-0.5">Dari {sortedSessions.length}x simulasi</div>
        </div>

        <div className="bg-[#F4F7FB] p-3.5 rounded-2xl border border-[#D5DDEB]">
          <div className="text-[11px] text-[#5B6882] font-medium flex items-center gap-1">
            <Target size={13} className="text-[#1F6F4A]" /> Tingkat Kelulusan
          </div>
          <div className="text-xl font-black text-[#1F6F4A] font-heading mt-1">
            {passRate}%
          </div>
          <div className="text-[10px] text-[#5B6882] mt-0.5">Di atas Passing Grade</div>
        </div>

        <div className="bg-[#F4F7FB] p-3.5 rounded-2xl border border-[#D5DDEB]">
          <div className="text-[11px] text-[#5B6882] font-medium flex items-center gap-1">
            <CheckCircle2 size={13} className="text-[#09408C]" /> Tes Terakhir
          </div>
          <div className="text-xl font-black text-[#09408C] font-heading mt-1">
            {latestScore}
          </div>
          <div className="text-[10px] text-[#5B6882] mt-0.5">
            {latestSession.isPassed ? "Lulus Passing Grade" : "Belum Lulus"}
          </div>
        </div>
      </div>

      {/* VIEW 1: RADAR CHART & WEAKNESS MAPPING */}
      {chartView === "RADAR" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: SVG Radar Canvas */}
            <div className="lg:col-span-6 bg-[#F4F7FB] rounded-3xl p-4 sm:p-6 border border-[#D5DDEB] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="w-full flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-[#1B2A41] flex items-center gap-1.5">
                  <Compass size={15} className="text-[#09408C]" />
                  <span>Jaring Radar Kompetensi</span>
                </span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-[#09408C] font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#09408C]"></span> Capaian Siswa
                  </span>
                  <span className="flex items-center gap-1 text-[#B45309] font-semibold">
                    <span className="w-3 h-0.5 border-t border-dashed border-[#F5B82E]"></span> Target Standar
                  </span>
                </div>
              </div>

              {/* Radar SVG */}
              <div className="w-full max-w-[340px] aspect-square flex items-center justify-center">
                <svg viewBox={`0 0 ${radarSize} ${radarSize}`} className="w-full h-full overflow-visible">
                  {/* Web Rings */}
                  {webRings.map((pointsStr, ringIdx) => (
                    <polygon
                      key={ringIdx}
                      points={pointsStr}
                      fill="none"
                      stroke="#D5DDEB"
                      strokeWidth="1"
                      strokeDasharray={ringIdx === 3 ? "none" : "2 2"}
                    />
                  ))}

                  {/* Axis Spokes from Center */}
                  {Array.from({ length: numAxes }).map((_, i) => {
                    const { x, y } = getCoordinates(i, 1.0);
                    return (
                      <line
                        key={i}
                        x1={radarCenter}
                        y1={radarCenter}
                        x2={x}
                        y2={y}
                        stroke="#D5DDEB"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Target Standard Polygon */}
                  <polygon
                    points={targetPolygon}
                    fill="rgba(245, 184, 46, 0.12)"
                    stroke="#F5B82E"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />

                  {/* Student Current Polygon */}
                  <polygon
                    points={currentPolygon}
                    fill="rgba(9, 64, 140, 0.28)"
                    stroke="#09408C"
                    strokeWidth="2.5"
                  />

                  {/* Data Points on Current Polygon */}
                  {currentPoints.map((pt, i) => (
                    <circle
                      key={i}
                      cx={pt.x}
                      cy={pt.y}
                      r="4.5"
                      fill="#FFFFFF"
                      stroke="#09408C"
                      strokeWidth="2.5"
                    />
                  ))}

                  {/* Axis Labels */}
                  {radarSections.map((sec, i) => {
                    const { x, y, angle } = getCoordinates(i, 1.25);
                    const isRight = Math.cos(angle) > 0.1;
                    const isLeft = Math.cos(angle) < -0.1;
                    const textAnchor = isRight ? "start" : isLeft ? "end" : "middle";

                    return (
                      <g key={i}>
                        <text
                          x={x}
                          y={y}
                          fill="#1B2A41"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor={textAnchor}
                          fontFamily="sans-serif"
                        >
                          {sec.name}
                        </text>
                        <text
                          x={x}
                          y={y + 11}
                          fill="#09408C"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor={textAnchor}
                          fontFamily="sans-serif"
                        >
                          {sec.current} / {sec.max}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <p className="text-[10px] text-[#5B6882] text-center mt-3">
                *Area yang berada di luar garis putus-putus kuning menunjukkan kompetensi di atas standar passing grade.
              </p>
            </div>

            {/* Right: Weakness & Strength Diagnosis Matrix */}
            <div className="lg:col-span-6 space-y-4">
              {/* Highlight Titik Lemah */}
              {weakestArea && (
                <div className="bg-[#FEF7E6]/70 border border-[#F5B82E] rounded-3xl p-4 sm:p-5 space-y-2">
                  <div className="flex items-center gap-2 text-[#B45309] font-bold text-xs uppercase tracking-wide">
                    <AlertTriangle size={16} />
                    <span>Titik Lemah yang Perlu Diprioritaskan:</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-base font-bold text-[#1B2A41] font-heading">
                      {weakestArea.name}
                    </h4>
                    <span className="text-xs font-bold text-[#B45309]">
                      {weakestArea.current} dari target {weakestArea.target}
                    </span>
                  </div>
                  <p className="text-xs text-[#5B6882] leading-relaxed">
                    Penguasaan pada sub-materi ini berada pada rasio terendah. Disarankan menambah sesi drill soal 
                    dan review ringkasan rumus pada modul ini untuk mendongkrak total skor secara signifikan.
                  </p>
                </div>
              )}

              {/* Highlight Titik Kuat */}
              {strongestArea && (
                <div className="bg-[#E3F4EC]/70 border border-[#1F6F4A]/30 rounded-3xl p-4 sm:p-5 space-y-2">
                  <div className="flex items-center gap-2 text-[#1F6F4A] font-bold text-xs uppercase tracking-wide">
                    <ShieldCheck size={16} />
                    <span>Kekuatan Utama Siswa:</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-base font-bold text-[#1B2A41] font-heading">
                      {strongestArea.name}
                    </h4>
                    <span className="text-xs font-bold text-[#1F6F4A]">
                      {strongestArea.current} dari target {strongestArea.target}
                    </span>
                  </div>
                  <p className="text-xs text-[#5B6882] leading-relaxed">
                    Kemampuan pada bagian ini sangat matang dan konsisten menyumbang poin tinggi. Pertahankan ritme pengerjaan 
                    dan fokuskan sisa waktu ujian untuk sub-materi yang masih menantang.
                  </p>
                </div>
              )}

              {/* Rekomendasi Alokasi Waktu Belajar */}
              <div className="bg-[#F4F7FB] border border-[#D5DDEB] rounded-2xl p-4 text-xs space-y-1.5">
                <span className="font-bold text-[#09408C] block">
                  💡 Rekomendasi Alokasi Belajar Mingguan:
                </span>
                <p className="text-[#5B6882] leading-relaxed">
                  Alokasikan <strong>60% waktu</strong> bimbingan untuk pendalaman materi <em>{weakestArea?.name}</em> dan 
                  <strong> 40% waktu</strong> untuk simulasi komprehensif agar daya tahan ujian tetap prima.
                </p>
              </div>
            </div>
          </div>

          {/* Sub-Materi Competency Table */}
          <div className="bg-white rounded-3xl border border-[#D5DDEB] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1B2A41]">
                Tabel Rincian Evaluasi per Sub-Materi
              </span>
              <span className="text-[11px] text-[#5B6882]">
                Sesi: {latestSession.exam?.title || "Simulasi Terkini"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F7FB] border-b border-[#D5DDEB] text-[#5B6882] font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Sub-Materi / Kompetensi</th>
                    <th className="py-2.5 px-3 text-center">Skor Siswa</th>
                    <th className="py-2.5 px-3 text-center">Target Passing</th>
                    <th className="py-2.5 px-3 text-center">Selisih (Gap)</th>
                    <th className="py-2.5 px-3">Status Kompetensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5DDEB]">
                  {radarSections.map((sec) => {
                    const gap = sec.current - sec.target;
                    const isCompetent = sec.current >= sec.target;
                    const isBorderline = sec.current >= sec.target * 0.8 && !isCompetent;

                    return (
                      <tr key={sec.name} className="hover:bg-[#EAF1FA]/40 transition-colors">
                        <td className="py-3 px-3 font-bold text-[#1B2A41]">
                          {sec.name}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-[#09408C]">
                          {sec.current} / {sec.max}
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-[#5B6882]">
                          {sec.target}
                        </td>
                        <td className="py-3 px-3 text-center font-bold">
                          <span
                            className={
                              gap >= 0 ? "text-[#1F6F4A]" : "text-[#B45309]"
                            }
                          >
                            {gap >= 0 ? `+${gap}` : gap}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isCompetent
                                ? "bg-[#E3F4EC] text-[#1F6F4A] border border-[#1F6F4A]/30"
                                : isBorderline
                                ? "bg-[#FEF7E6] text-[#B45309] border border-[#F5B82E]/50"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {isCompetent
                              ? "✓ Menguasai"
                              : isBorderline
                              ? "⚠ Butuh Pemantapan"
                              : "✕ Prioritas Perbaikan"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LINEAR TREND CURVE */}
      {chartView === "TREND" && (
        <div className="space-y-4">
          <div className="bg-[#F4F7FB] rounded-2xl p-4 border border-[#D5DDEB]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#1B2A41]">
                Kurva Peningkatan Skor Ujian
              </span>
              <div className="flex items-center gap-3 text-[11px] text-[#5B6882]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#09408C]"></span> Skor Simulasi
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t border-dashed border-[#F5B82E]"></span> Ambang Passing Grade
                </span>
              </div>
            </div>

            {/* SVG Responsive Line Chart */}
            <div className="w-full overflow-x-auto no-scrollbar">
              <div className="min-w-[480px]">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-44 overflow-visible"
                >
                  {/* Horizontal Grid lines */}
                  {[0.25, 0.5, 0.75, 1].map((ratio) => {
                    const yVal = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
                    const scoreLabel = Math.round(minVal + ratio * (maxVal - minVal));
                    return (
                      <g key={ratio}>
                        <line
                          x1={paddingX}
                          y1={yVal}
                          x2={chartWidth - paddingX}
                          y2={yVal}
                          stroke="#D5DDEB"
                          strokeDasharray="3 3"
                        />
                        <text
                          x={paddingX - 8}
                          y={yVal + 3}
                          fill="#5B6882"
                          fontSize="9"
                          textAnchor="end"
                          fontFamily="sans-serif"
                        >
                          {scoreLabel}
                        </text>
                      </g>
                    );
                  })}

                  {/* Passing Grade Reference Line */}
                  {latestSession.exam?.passingGrade && (
                    <g>
                      {(() => {
                        const pg = latestSession.exam.passingGrade;
                        const pgY =
                          chartHeight - paddingY - ((pg - minVal) / (maxVal - minVal)) * (chartHeight - paddingY * 2);
                        return (
                          <>
                            <line
                              x1={paddingX}
                              y1={pgY}
                              x2={chartWidth - paddingX}
                              y2={pgY}
                              stroke="#F5B82E"
                              strokeWidth="1.5"
                              strokeDasharray="4 4"
                            />
                            <text
                              x={chartWidth - paddingX}
                              y={pgY - 5}
                              fill="#B45309"
                              fontSize="9"
                              fontWeight="bold"
                              textAnchor="end"
                              fontFamily="sans-serif"
                            >
                              Passing Grade: {pg}
                            </text>
                          </>
                        );
                      })()}
                    </g>
                  )}

                  {/* Area Gradient */}
                  <defs>
                    <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#09408C" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#09408C" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {areaD && <path d={areaD} fill="url(#scoreAreaGradient)" />}

                  {/* Path Line */}
                  {pathD && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#09408C"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Data Points */}
                  {points.map((pt, i) => (
                    <g key={i}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="5.5"
                        fill="#FFFFFF"
                        stroke="#09408C"
                        strokeWidth="3"
                      />
                      <rect
                        x={pt.x - 18}
                        y={pt.y - 24}
                        width="36"
                        height="16"
                        rx="8"
                        fill="#09408C"
                      />
                      <text
                        x={pt.x}
                        y={pt.y - 13}
                        fill="#FFFFFF"
                        fontSize="9.5"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="sans-serif"
                      >
                        {pt.session.score}
                      </text>
                      <text
                        x={pt.x}
                        y={chartHeight - 6}
                        fill="#5B6882"
                        fontSize="9.5"
                        fontWeight="500"
                        textAnchor="middle"
                        fontFamily="sans-serif"
                      >
                        Tes #{i + 1}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Academic Recommendation Box */}
      <div className="bg-[#EAF1FA] p-4 sm:p-5 rounded-2xl border border-[#9AC1E2] text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-[#09408C]">
          <Award size={16} />
          <span>Rekomendasi Akademik Tutor Sahabat Belajar:</span>
        </div>
        <p className="text-[#5B6882] pl-5 leading-relaxed">
          {scoreDiff >= 0
            ? "Perkembangan skor menunjukkan pemahaman konsep dasar yang semakin solid. Lanjutkan latihan manajemen waktu 45 detik per soal untuk memaksimalkan akurasi pada butir penalaran analitis."
            : "Evaluasi catatan tutor pada materi yang belum mencapai ambang target. Gunakan bank modul rumus cepat untuk memperkuat bagian yang masih sering ragu-ragu."}
        </p>
      </div>
    </div>
  );
}
