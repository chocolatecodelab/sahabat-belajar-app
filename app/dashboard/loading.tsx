import { Skeleton, PageHeaderSkeleton, StatCardSkeleton, TableSkeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Top Executive Header Skeleton */}
      <PageHeaderSkeleton />

      {/* 4 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Middle Action Items & Critical Quota Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <TableSkeleton rows={4} cols={4} />
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#D5DDEB]">
              <Skeleton className="w-32 h-5" />
              <Skeleton className="w-16 h-4 rounded-full" />
            </div>
            <Skeleton className="w-full h-16 rounded-xl" />
            <Skeleton className="w-full h-16 rounded-xl" />
            <Skeleton className="w-full h-16 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
