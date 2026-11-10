import React from "react";

export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[#D5DDEB]/60 ${className}`}
      {...props}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <div className="space-y-1.5 pt-1">
        <Skeleton className="w-24 h-3.5" />
        <Skeleton className="w-32 h-7" />
      </div>
      <Skeleton className="w-full h-3" />
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D5DDEB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-32 h-5 rounded-full" />
          <Skeleton className="w-20 h-5 rounded-full" />
        </div>
        <Skeleton className="w-64 sm:w-80 h-8" />
        <Skeleton className="w-80 sm:w-96 h-4" />
      </div>
      <div className="flex items-center gap-2.5">
        <Skeleton className="w-32 h-10 rounded-xl" />
        <Skeleton className="w-32 h-10 rounded-xl" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#D5DDEB]">
        <Skeleton className="w-40 h-5" />
        <Skeleton className="w-24 h-8 rounded-xl" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center gap-4 py-2">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <Skeleton
                key={cIdx}
                className={`h-4 ${cIdx === 0 ? "w-1/4" : cIdx === 1 ? "w-1/3" : "flex-1"}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
