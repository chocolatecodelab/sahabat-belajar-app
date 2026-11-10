import { Skeleton } from "@/components/ui/Skeleton";

export default function TutorPortalLoading() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Tutor Profile Header Skeleton */}
      <div className="bg-white rounded-3xl p-6 border border-[#D5DDEB] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="w-24 h-4 rounded-full" />
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-36 h-3" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-24 h-9 rounded-xl" />
          <Skeleton className="w-20 h-9 rounded-xl" />
        </div>
      </div>

      {/* Tutor Honor & Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-xs space-y-2">
          <Skeleton className="w-28 h-3.5" />
          <Skeleton className="w-36 h-7" />
          <Skeleton className="w-48 h-3" />
        </div>
        <div className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-xs space-y-2">
          <Skeleton className="w-28 h-3.5" />
          <Skeleton className="w-36 h-7" />
          <Skeleton className="w-48 h-3" />
        </div>
      </div>

      {/* Filter Chips Placeholder */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Skeleton className="w-24 h-8 rounded-xl shrink-0" />
        <Skeleton className="w-24 h-8 rounded-xl shrink-0" />
        <Skeleton className="w-24 h-8 rounded-xl shrink-0" />
      </div>

      {/* Session Cards Skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="w-32 h-5 rounded-full" />
              <Skeleton className="w-24 h-4" />
            </div>
            <Skeleton className="w-56 h-5" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-28 h-8 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
