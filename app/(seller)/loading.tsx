import { Skeleton } from '@/components/ui/skeleton'

function SellerSidebarSkeleton() {
  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-white p-4 gap-4">
      <div className="flex items-center gap-3 p-2">
        <Skeleton className="w-9 h-9 rounded-xl" />
        <Skeleton className="h-5 w-24" />
      </div>
      {/* Store info */}
      <div className="p-3 bg-muted rounded-xl space-y-2">
        <Skeleton className="h-10 w-10 rounded-xl mx-auto" />
        <Skeleton className="h-3 w-28 mx-auto" />
        <Skeleton className="h-2 w-20 mx-auto" />
      </div>
      <div className="flex-1 space-y-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-xl" />
        ))}
      </div>
    </aside>
  )
}

export default function SellerLoading() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SellerSidebarSkeleton />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 border-b border-border bg-white px-6 flex items-center justify-between flex-shrink-0">
          <Skeleton className="h-6 w-40" />
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <Skeleton className="w-9 h-9 rounded-full" />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-border p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="w-9 h-9 rounded-xl" />
                </div>
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
            <Skeleton className="h-5 w-36" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
