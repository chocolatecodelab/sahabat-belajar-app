"use client";

import { useState } from "react";
import {
  FileText,
  Newspaper,
  Eye,
  TrendingUp,
  FolderOpen,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Archive,
} from "lucide-react";
import Link from "next/link";
import type { DashboardAnalyticsData } from "@/actions/analytics";

interface DashboardAnalyticsClientProps {
  initialData: DashboardAnalyticsData;
}

export default function DashboardAnalyticsClient({ initialData }: DashboardAnalyticsClientProps) {
  const [data, setData] = useState<DashboardAnalyticsData>(initialData);
  const [activeTimeRange, setActiveTimeRange] = useState<"7d" | "30d" | "this_month">(
    (initialData.timeRange as any) || "7d"
  );
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    dayLabel: string;
    views: number;
    published: number;
    x: number;
    y: number;
  } | null>(null);

  // SVG Chart Dimensions
  const chartHeight = 220;
  const chartWidth = 700;
  const padding = { top: 20, right: 25, bottom: 35, left: 35 };

  const points = data.timeSeries;
  const maxViews = Math.max(...points.map((p) => p.views), 10);

  const getX = (index: number) => {
    if (points.length <= 1) return padding.left;
    return padding.left + (index / (points.length - 1)) * (chartWidth - padding.left - padding.right);
  };

  const getY = (val: number) => {
    const availableHeight = chartHeight - padding.top - padding.bottom;
    return chartHeight - padding.bottom - (val / maxViews) * availableHeight;
  };

  // Generate SVG Path for Area and Line
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(p.views)}`)
    .join(" ");

  const areaPath = `${linePath} L ${getX(points.length - 1)} ${chartHeight - padding.bottom} L ${getX(0)} ${chartHeight - padding.bottom} Z`;

  const totalPub = data.overview.publishedArticles;
  const totalDraft = data.overview.draftArticles;
  const totalArch = data.overview.archivedArticles;
  const totalArt = Math.max(data.overview.totalArticles, 1);

  const pubPct = Math.round((totalPub / totalArt) * 100);
  const draftPct = Math.round((totalDraft / totalArt) * 100);
  const archPct = 100 - pubPct - draftPct;

  return (
    <div className="space-y-8 animate-fade-in font-[var(--font-body)]">
      {/* Welcome Banner */}
      <div
        className="rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md"
        style={{
          background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-container))",
          borderTop: "4px solid var(--color-secondary-container)",
        }}
      >
        {/* Ambient Glow */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1 text-label-md font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs"
                style={{
                  background: "var(--color-secondary-container)",
                  color: "var(--color-on-secondary-container)",
                }}
              >
                <Sparkles size={13} />
                Executive Analytics Center
              </span>
              <span className="text-body-sm text-blue-200">
                BIAS RISTEK v2.0
              </span>
            </div>
            <h1 className="text-display-md font-extrabold leading-tight tracking-tight font-[var(--font-heading)]">
              Dashboard Analisis Visual
            </h1>
            <p className="text-body-md text-white/80 mt-1.5 leading-relaxed">
              Pantau performa pembaca, tren publikasi artikel riset, distribusi kategori ilmiah, dan galeri aset secara terpusat.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/berita/buat"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-label-lg font-bold transition-transform hover:scale-102 shadow-sm"
              style={{
                background: "var(--color-secondary-container)",
                color: "var(--color-on-secondary-container)",
              }}
            >
              <Plus size={18} />
              Tulis Berita
            </Link>
            <Link
              href="/dashboard/media"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-label-lg font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
            >
              <ImageIcon size={18} />
              Pustaka Media
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Top Executive Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Views */}
        <div
          className="elevation-1 rounded-2xl p-5 bg-white transition-all hover:elevation-2 hover:-translate-y-0.5 border"
          style={{ borderColor: "var(--color-outline-variant)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                color: "var(--color-primary)",
              }}
            >
              <Eye size={24} />
            </div>
            <span className="inline-flex items-center gap-1 text-2xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <TrendingUp size={11} /> +12.5%
            </span>
          </div>
          <p className="text-body-sm font-semibold" style={{ color: "var(--color-on-surface-variant)" }}>
            Total Pembaca (Views)
          </p>
          <p className="text-display-md font-extrabold mt-1 tracking-tight" style={{ color: "var(--color-on-surface)" }}>
            {data.overview.totalViews.toLocaleString("id-ID")}
          </p>
          <p className="text-2xs text-gray-400 mt-1">
            Akumulasi pembaca seluruh artikel
          </p>
        </div>

        {/* Card 2: Total Publikasi Riset */}
        <div
          className="elevation-1 rounded-2xl p-5 bg-white transition-all hover:elevation-2 hover:-translate-y-0.5 border"
          style={{ borderColor: "var(--color-outline-variant)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: "color-mix(in srgb, var(--color-primary-container) 10%, transparent)",
                color: "var(--color-primary-container)",
              }}
            >
              <Newspaper size={24} />
            </div>
            <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              {data.overview.publishedArticles} Published
            </span>
          </div>
          <p className="text-body-sm font-semibold" style={{ color: "var(--color-on-surface-variant)" }}>
            Total Artikel Berita
          </p>
          <p className="text-display-md font-extrabold mt-1 tracking-tight" style={{ color: "var(--color-on-surface)" }}>
            {data.overview.totalArticles}
          </p>
          <p className="text-2xs text-gray-400 mt-1">
            {data.overview.draftArticles} draft • {data.overview.archivedArticles} arsip
          </p>
        </div>

        {/* Card 3: Halaman Statis & Profil */}
        <div
          className="elevation-1 rounded-2xl p-5 bg-white transition-all hover:elevation-2 hover:-translate-y-0.5 border"
          style={{ borderColor: "var(--color-outline-variant)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: "color-mix(in srgb, var(--color-secondary) 10%, transparent)",
                color: "var(--color-secondary)",
              }}
            >
              <FileText size={24} />
            </div>
            <Link
              href="/dashboard/halaman"
              className="text-2xs font-bold text-gray-400 hover:text-blue-900 transition-colors"
            >
              Kelola →
            </Link>
          </div>
          <p className="text-body-sm font-semibold" style={{ color: "var(--color-on-surface-variant)" }}>
            Halaman Aktif
          </p>
          <p className="text-display-md font-extrabold mt-1 tracking-tight" style={{ color: "var(--color-on-surface)" }}>
            {data.overview.totalPages}
          </p>
          <p className="text-2xs text-gray-400 mt-1">
            Profil, visi-misi, & informasi lab
          </p>
        </div>

        {/* Card 4: Rata-rata Engagement */}
        <div
          className="elevation-1 rounded-2xl p-5 bg-white transition-all hover:elevation-2 hover:-translate-y-0.5 border"
          style={{ borderColor: "var(--color-outline-variant)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: "color-mix(in srgb, var(--color-secondary-container) 25%, transparent)",
                color: "var(--color-on-secondary-container)",
              }}
            >
              <Layers size={24} className="text-amber-700" />
            </div>
            <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Avg/Artikel
            </span>
          </div>
          <p className="text-body-sm font-semibold" style={{ color: "var(--color-on-surface-variant)" }}>
            Rata-rata Views
          </p>
          <p className="text-display-md font-extrabold mt-1 tracking-tight" style={{ color: "var(--color-on-surface)" }}>
            {data.overview.avgViewsPerArticle}
          </p>
          <p className="text-2xs text-gray-400 mt-1">
            Tingkat keterbacaan artikel riset
          </p>
        </div>
      </div>

      {/* Main Analytics Grid: Chart + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Views Chart */}
        <div
          className="lg:col-span-2 elevation-1 rounded-2xl p-5 sm:p-6 bg-white border flex flex-col justify-between"
          style={{ borderColor: "var(--color-outline-variant)" }}
        >
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: "var(--color-outline-variant)" }}>
              <div>
                <h2 className="text-headline-md font-bold font-[var(--font-heading)]" style={{ color: "var(--color-on-surface)" }}>
                  Tren Kunjungan Pembaca & Publikasi
                </h2>
                <p className="text-body-sm text-gray-500 mt-0.5">
                  Visualisasi volume pembaca dan artikel terbit harian
                </p>
              </div>

              {/* Timeframe Filter Pills */}
              <div
                className="inline-flex p-1 rounded-xl text-2xs font-bold self-start sm:self-auto"
                style={{
                  background: "var(--color-surface-container-low)",
                  border: "1px solid var(--color-outline-variant)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTimeRange("7d")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTimeRange === "7d"
                      ? "bg-[var(--color-primary)] text-white shadow-xs"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  7 Hari
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTimeRange("30d")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTimeRange === "30d"
                      ? "bg-[var(--color-primary)] text-white shadow-xs"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  30 Hari
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTimeRange("this_month")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTimeRange === "this_month"
                      ? "bg-[var(--color-primary)] text-white shadow-xs"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  Bulan Ini
                </button>
              </div>
            </div>

            {/* Interactive SVG Chart Canvas */}
            <div className="relative mt-5 pt-2">
              {/* Hover Inspection Card Tooltip */}
              {hoveredPoint && (
                <div
                  className="absolute z-20 pointer-events-none p-2.5 rounded-xl bg-slate-900/95 text-white shadow-xl text-2xs space-y-1 border border-white/20 animate-fade-in -translate-x-1/2 -translate-y-full"
                  style={{
                    left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                    top: `${hoveredPoint.y - 12}px`,
                  }}
                >
                  <div className="flex items-center gap-1.5 font-bold text-amber-300 border-b border-white/10 pb-1">
                    <Calendar size={11} />
                    <span>{hoveredPoint.dayLabel}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-slate-200">
                    <span>Estimasi Views:</span>
                    <strong className="text-white">{hoveredPoint.views} pembaca</strong>
                  </div>
                  {hoveredPoint.published > 0 && (
                    <div className="flex items-center justify-between gap-3 text-emerald-300">
                      <span>Artikel Terbit:</span>
                      <strong>{hoveredPoint.published} artikel</strong>
                    </div>
                  )}
                </div>
              )}

              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-56 overflow-visible"
              >
                <defs>
                  {/* Linear Gradient for Area */}
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0b2c6b" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#0b2c6b" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = chartHeight - padding.bottom - ratio * (chartHeight - padding.top - padding.bottom);
                  const val = Math.round(ratio * maxViews);
                  return (
                    <g key={i}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={chartWidth - padding.right}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={padding.left - 6}
                        y={y + 4}
                        fontSize="10"
                        fill="#94a3b8"
                        textAnchor="end"
                        fontWeight="500"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Area Fill */}
                <path d={areaPath} fill="url(#areaGradient)" />

                {/* Smooth Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="#001847"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive Points */}
                {points.map((p, i) => {
                  const cx = getX(i);
                  const cy = getY(p.views);
                  const isHovered = hoveredPoint?.date === p.date;

                  return (
                    <g
                      key={i}
                      className="cursor-pointer group"
                      onMouseEnter={() =>
                        setHoveredPoint({
                          date: p.date,
                          dayLabel: p.dayLabel,
                          views: p.views,
                          published: p.published,
                          x: cx,
                          y: cy,
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      {/* Invisible larger hit target */}
                      <circle cx={cx} cy={cy} r="14" fill="transparent" />

                      {/* Visible Point */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isHovered ? "6" : "4"}
                        fill={isHovered ? "#fdbc13" : "#001847"}
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-all duration-150"
                      />

                      {/* X-Axis Date Label */}
                      <text
                        x={cx}
                        y={chartHeight - 10}
                        fontSize="10"
                        fill="#64748b"
                        textAnchor="middle"
                        fontWeight={isHovered ? "700" : "500"}
                      >
                        {p.dayLabel}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t text-xs text-gray-500 mt-2" style={{ borderColor: "var(--color-outline-variant)" }}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[var(--color-primary)]" />
                <span className="font-medium text-gray-700">Volume Kunjungan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="font-medium text-gray-700">Interaksi Terpilih</span>
              </div>
            </div>
            <span className="text-2xs text-gray-400">Data terdistribusi real-time</span>
          </div>
        </div>

        {/* Right 1 Col: Category Share & Publishing Health */}
        <div className="space-y-6">
          {/* Category Share Breakdown */}
          <div
            className="elevation-1 rounded-2xl p-5 bg-white border"
            style={{ borderColor: "var(--color-outline-variant)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--color-outline-variant)" }}>
              <div>
                <h3 className="font-bold text-headline-sm font-[var(--font-heading)]" style={{ color: "var(--color-on-surface)" }}>
                  Distribusi Kategori Riset
                </h3>
                <p className="text-2xs text-gray-500">Pangsa publikasi berdasarkan topik</p>
              </div>
              <Link
                href="/dashboard/kategori"
                className="text-2xs font-bold text-[var(--color-primary-container)] hover:underline"
              >
                Semua
              </Link>
            </div>

            {/* Stacked Percentage Bar */}
            <div className="w-full h-3 rounded-full overflow-hidden flex my-4 bg-gray-100">
              {data.categoryDistribution.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.color || "#0b2c6b",
                  }}
                  title={`${cat.name}: ${cat.percentage}% (${cat.count} artikel)`}
                  className="h-full transition-all hover:opacity-80"
                />
              ))}
            </div>

            {/* Category List */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {data.categoryDistribution.length === 0 ? (
                <p className="text-2xs text-gray-400 text-center py-4">Belum ada kategori terdaftar.</p>
              ) : (
                data.categoryDistribution.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between text-body-sm p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color || "#0b2c6b" }}
                      />
                      <span className="font-medium truncate max-w-[130px] text-gray-800">
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-2xs">
                      <span className="text-gray-400">{cat.count} artikel</span>
                      <strong className="font-bold text-gray-900 w-8 text-right">
                        {cat.percentage}%
                      </strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Publishing Health Card */}
          <div
            className="elevation-1 rounded-2xl p-5 bg-white border space-y-3"
            style={{ borderColor: "var(--color-outline-variant)" }}
          >
            <h3 className="font-bold text-headline-sm font-[var(--font-heading)]" style={{ color: "var(--color-on-surface)" }}>
              Kesehatan Konten & Status
            </h3>

            {/* Tripartite Health Bar */}
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-100">
              <div style={{ width: `${pubPct}%` }} className="bg-emerald-500 h-full" title={`Published: ${pubPct}%`} />
              <div style={{ width: `${draftPct}%` }} className="bg-amber-400 h-full" title={`Draft: ${draftPct}%`} />
              <div style={{ width: `${archPct}%` }} className="bg-gray-400 h-full" title={`Archived: ${archPct}%`} />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900">
                <div className="flex items-center justify-center gap-1 text-2xs font-semibold">
                  <CheckCircle2 size={12} className="text-emerald-600" />
                  <span>Publikasi</span>
                </div>
                <p className="text-label-lg font-bold mt-0.5">{totalPub}</p>
              </div>

              <div className="p-2 rounded-lg bg-amber-50 text-amber-900">
                <div className="flex items-center justify-center gap-1 text-2xs font-semibold">
                  <Clock size={12} className="text-amber-600" />
                  <span>Draft</span>
                </div>
                <p className="text-label-lg font-bold mt-0.5">{totalDraft}</p>
              </div>

              <div className="p-2 rounded-lg bg-gray-100 text-gray-800">
                <div className="flex items-center justify-center gap-1 text-2xs font-semibold">
                  <Archive size={12} className="text-gray-500" />
                  <span>Arsip</span>
                </div>
                <p className="text-label-lg font-bold mt-0.5">{totalArch}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard: Top 5 Artikel Paling Banyak Dibaca */}
      <div
        className="elevation-1 rounded-2xl p-5 sm:p-6 bg-white border"
        style={{ borderColor: "var(--color-outline-variant)" }}
      >
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: "var(--color-outline-variant)" }}>
          <div>
            <h2 className="text-headline-md font-bold font-[var(--font-heading)]" style={{ color: "var(--color-on-surface)" }}>
              Top 5 Publikasi Terpopuler
            </h2>
            <p className="text-body-sm text-gray-500 mt-0.5">
              Artikel dengan akumulasi interaksi pembaca tertinggi
            </p>
          </div>
          <Link
            href="/dashboard/berita"
            className="text-body-sm font-semibold text-[var(--color-primary-container)] hover:underline"
          >
            Lihat Semua Berita →
          </Link>
        </div>

        <div className="space-y-3 mt-4">
          {data.topArticles.length === 0 ? (
            <p className="text-body-sm text-gray-400 text-center py-6">
              Belum ada data artikel.
            </p>
          ) : (
            data.topArticles.map((article, idx) => {
              const maxArticleViews = Math.max(...data.topArticles.map((a) => a.viewCount), 1);
              const barWidth = Math.round((article.viewCount / maxArticleViews) * 100);

              return (
                <div
                  key={article.id}
                  className="p-3.5 rounded-xl transition-all hover:bg-slate-50 border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        idx === 0
                          ? "bg-amber-400 text-blue-950 shadow-xs"
                          : idx === 1
                          ? "bg-slate-300 text-slate-900"
                          : idx === 2
                          ? "bg-amber-700/30 text-amber-900"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      #{idx + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-3xs font-bold px-2 py-0.5 rounded-full uppercase"
                          style={{
                            backgroundColor: `${article.categoryColor}20`,
                            color: article.categoryColor,
                          }}
                        >
                          {article.categoryName}
                        </span>
                        <span className="text-3xs text-gray-400">
                          Oleh {article.authorName}
                        </span>
                      </div>
                      <p className="font-bold text-body-md text-gray-900 truncate">
                        {article.title}
                      </p>

                      {/* Visual View Bar */}
                      <div className="w-full h-1.5 rounded-full bg-gray-100 mt-2 overflow-hidden max-w-md">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-900 to-indigo-600 transition-all duration-500"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                    <div className="text-right">
                      <p className="text-headline-sm font-extrabold text-[var(--color-primary)]">
                        {article.viewCount.toLocaleString("id-ID")}
                      </p>
                      <span className="text-3xs text-gray-400">Total Views</span>
                    </div>

                    <Link
                      href={`/dashboard/berita/${article.id}/edit`}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                      title="Edit Berita"
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Access Grid */}
      <div>
        <h2 className="text-headline-md font-bold mb-4 font-[var(--font-heading)]" style={{ color: "var(--color-on-surface)" }}>
          Aksi & Navigasi Cepat
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard/berita/buat"
            className="elevation-1 rounded-2xl p-5 bg-white border hover:elevation-2 hover:-translate-y-0.5 transition-all flex flex-col justify-between group"
            style={{ borderColor: "var(--color-outline-variant)" }}
          >
            <div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-blue-50 text-blue-950">
                <Newspaper size={20} />
              </div>
              <h3 className="font-bold text-body-md group-hover:text-blue-950 transition-colors">
                Tulis Berita Baru
              </h3>
              <p className="text-2xs text-gray-500 mt-1">
                Tulis artikel riset dengan panduan AI Copilot
              </p>
            </div>
            <div className="flex items-center gap-1 text-2xs font-bold text-blue-900 mt-4">
              <span>Buka</span>
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/dashboard/media"
            className="elevation-1 rounded-2xl p-5 bg-white border hover:elevation-2 hover:-translate-y-0.5 transition-all flex flex-col justify-between group"
            style={{ borderColor: "var(--color-outline-variant)" }}
          >
            <div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-amber-50 text-amber-800">
                <ImageIcon size={20} />
              </div>
              <h3 className="font-bold text-body-md group-hover:text-blue-950 transition-colors">
                Pustaka Media
              </h3>
              <p className="text-2xs text-gray-500 mt-1">
                Kelola aset cover, foto, & dokumen terpusat
              </p>
            </div>
            <div className="flex items-center gap-1 text-2xs font-bold text-blue-900 mt-4">
              <span>Buka</span>
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/dashboard/halaman/buat"
            className="elevation-1 rounded-2xl p-5 bg-white border hover:elevation-2 hover:-translate-y-0.5 transition-all flex flex-col justify-between group"
            style={{ borderColor: "var(--color-outline-variant)" }}
          >
            <div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-indigo-50 text-indigo-900">
                <FileText size={20} />
              </div>
              <h3 className="font-bold text-body-md group-hover:text-blue-950 transition-colors">
                Buat Halaman
              </h3>
              <p className="text-2xs text-gray-500 mt-1">
                Tambah info kurikulum, fasilitas, & profil
              </p>
            </div>
            <div className="flex items-center gap-1 text-2xs font-bold text-blue-900 mt-4">
              <span>Buka</span>
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/dashboard/tampilan/layanan"
            className="elevation-1 rounded-2xl p-5 bg-white border hover:elevation-2 hover:-translate-y-0.5 transition-all flex flex-col justify-between group"
            style={{ borderColor: "var(--color-outline-variant)" }}
          >
            <div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-purple-50 text-purple-900">
                <FolderOpen size={20} />
              </div>
              <h3 className="font-bold text-body-md group-hover:text-blue-950 transition-colors">
                Program Kursus
              </h3>
              <p className="text-2xs text-gray-500 mt-1">
                Perbarui paket mentorship & kurikulum riset
              </p>
            </div>
            <div className="flex items-center gap-1 text-2xs font-bold text-blue-900 mt-4">
              <span>Buka</span>
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
