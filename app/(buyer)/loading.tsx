import { DashboardSkeleton } from '@/components/ui/skeleton-cards'
import { Skeleton } from '@/components/ui/skeleton'

export default function BuyerLoading() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar skeleton */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-white p-4 gap-4">
        <div className="flex items-center gap-3 p-2">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex-1 space-y-1 mt-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-center gap-3 p-2">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 w-16" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="h-16 border-b border-border bg-white px-6 flex items-center justify-between flex-shrink-0">
          <Skeleton className="h-9 w-64 rounded-xl" />
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <Skeleton className="w-9 h-9 rounded-full" />
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <DashboardSkeleton />
        </main>
      </div>
    </div>
  )
}
