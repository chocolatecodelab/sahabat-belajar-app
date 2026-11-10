import { Skeleton } from "@/components/ui/Skeleton";

export default function StudentPortalLoading() {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Student Welcome Header Skeleton */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D5DDEB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full shrink-0" />
          <div className="space-y-2">
            <Skeleton className="w-24 h-4 rounded-full" />
            <Skeleton className="w-56 h-7" />
            <Skeleton className="w-40 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-28 h-9 rounded-xl" />
          <Skeleton className="w-24 h-9 rounded-xl" />
        </div>
      </div>

      {/* 2 Quick Action Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#D5DDEB] p-5 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="w-28 h-3" />
              <Skeleton className="w-44 h-4" />
              <Skeleton className="w-36 h-3" />
            </div>
          </div>
          <Skeleton className="w-24 h-9 rounded-xl shrink-0" />
        </div>

        <div className="bg-white rounded-2xl border border-[#D5DDEB] p-5 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="w-28 h-3" />
              <Skeleton className="w-44 h-4" />
              <Skeleton className="w-36 h-3" />
            </div>
          </div>
          <Skeleton className="w-24 h-9 rounded-xl shrink-0" />
        </div>
      </div>

      {/* Package Quota Cards Skeleton */}
      <div className="space-y-3">
        <Skeleton className="w-48 h-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="w-24 h-5 rounded-full" />
                <Skeleton className="w-16 h-4 rounded-full" />
              </div>
              <Skeleton className="w-40 h-5" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="w-20 h-3" />
                  <Skeleton className="w-16 h-3" />
                </div>
                <Skeleton className="w-full h-2 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Placeholder */}
      <div className="flex items-center gap-2 border-b border-[#D5DDEB] pb-2">
        <Skeleton className="w-36 h-8 rounded-xl" />
        <Skeleton className="w-44 h-8 rounded-xl" />
        <Skeleton className="w-36 h-8 rounded-xl" />
        <Skeleton className="w-32 h-8 rounded-xl" />
      </div>

      {/* Session Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="w-24 h-5 rounded-full" />
              <Skeleton className="w-20 h-4" />
            </div>
            <Skeleton className="w-48 h-5" />
            <Skeleton className="w-full h-12 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
