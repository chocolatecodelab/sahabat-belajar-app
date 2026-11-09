"use client";

import { useMemo } from "react";
import { TrendingUp, Award, Target, CheckCircle2, AlertCircle, Sparkles, BarChart2 } from "lucide-react";
import type { StudentExamSession } from "@/actions/ujian";

interface ScoreProgressChartProps {
  sessions: StudentExamSession[];
}

export default function ScoreProgressChart({ sessions }: ScoreProgressChartProps) {
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
  const latestScore = scores[scores.length - 1];
  const previousScore = scores.length > 1 ? scores[scores.length - 2] : latestScore;
  const scoreDiff = latestScore - previousScore;
  const passedCount = sortedSessions.filter((s) => s.isPassed).length;
  const passRate = Math.round((passedCount / sortedSessions.length) * 100);

  // SVG Chart Dimensions
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
  const latestSession = sortedSessions[sortedSessions.length - 1];
  const sectionBreakdown = latestSession.sectionScores || {};
  const sectionEntries = Object.entries(sectionBreakdown);

  return (
    <div className="bg-white rounded-3xl border border-[#D5DDEB] p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-xs font-bold border border-[#9AC1E2] mb-1.5">
            <Sparkles size={14} />
            <span>Pembelajaran Berbasis Data</span>
          </div>
          <h3 className="text-lg font-bold text-[#09408C] font-heading">
            Grafik Tren Skor & Analisis Perkembangan Belajar
          </h3>
          <p className="text-xs text-[#5B6882]">
            Visualisasi riwayat performa tryout berkala untuk memetakan kesiapan ujian dan passing grade.
          </p>
        </div>

        {scoreDiff > 0 && (
          <div className="flex items-center gap-2 bg-[#E3F4EC] text-[#1F6F4A] px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 self-start sm:self-auto border border-[#1F6F4A]/30">
            <TrendingUp size={16} />
            <span>+{scoreDiff} Poin dibanding tes sebelumnya</span>
          </div>
        )}
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

      {/* Main Chart Visualization */}
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

              {/* Passing Grade Reference Line (e.g. 311 for CPNS or passing grade of latest exam) */}
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
                          x={chartWidth - paddingX + 5}
                          y={pgY + 3}
                          fill="#B45309"
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          PG: {pg}
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
                  {/* Point Label Score */}
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

                  {/* X Axis Date Label */}
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

      {/* Sub-Materi Breakdown Analysis */}
      {sectionEntries.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1B2A41]">
              Peta Penguasaan Sub-Materi (Simulasi Terakhir)
            </span>
            <span className="text-[11px] text-[#5B6882]">
              {latestSession.exam?.title || "Simulasi Terakhir"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {sectionEntries.map(([sectionName, sectionScore]) => {
              // Estimate percentage relative to ideal score range
              const maxEst = sectionScore > 100 ? 200 : 100;
              const percent = Math.min(100, Math.round((sectionScore / maxEst) * 100));

              return (
                <div
                  key={sectionName}
                  className="bg-[#F4F7FB] p-3 rounded-xl border border-[#D5DDEB] space-y-1.5"
                >
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-[#1B2A41] truncate max-w-[140px]" title={sectionName}>
                      {sectionName}
                    </span>
                    <span className="text-[#09408C] font-bold">{sectionScore} Poin</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#D5DDEB] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#09408C] transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Academic Recommendation Box */}
      <div className="bg-[#EAF1FA] p-4 rounded-2xl border border-[#9AC1E2] text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-[#09408C]">
          <Sparkles size={15} />
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
