"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

interface CourseCatalogToolbarProps {
  categories: string[];
  currentCategory: string;
  initialQuery: string;
  totalResults: number;
}

export default function CourseCatalogToolbar({
  categories,
  currentCategory,
  initialQuery,
  totalResults,
}: CourseCatalogToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (newQuery.trim()) {
        params.set("q", newQuery.trim());
      } else {
        params.delete("q");
      }
      router.push(`/kursus?${params.toString()}`);
    });
  };

  const handleCategoryClick = (cat: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (cat === "Semua") {
        params.delete("kategori");
      } else {
        params.set("kategori", cat);
      }
      router.push(`/kursus?${params.toString()}`);
    });
  };

  return (
    <div
      className="elevation-1 rounded-2xl p-5 bg-white border space-y-4"
      style={{ borderColor: "var(--color-outline-variant)" }}
    >
      {/* Top Search Input & Result Count */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari program riset, software (SmartPLS, SPSS), topik..."
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200/90 text-xs focus-ring bg-slate-50/50 hover:bg-white transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => handleSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md"
              title="Hapus pencarian"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <span className="text-2xs text-slate-500 font-semibold self-start sm:self-center">
          Menampilkan <strong>{totalResults}</strong> Program Kursus
          {isPending && <span className="ml-1 text-slate-400 animate-pulse">(memuat...)</span>}
        </span>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 pt-1 border-t border-slate-100">
        {categories.map((cat) => {
          const isActive = currentCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-2xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-[#001847] text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
