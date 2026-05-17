import { Skeleton } from '@/components/ui/skeleton'
import { TableSkeleton } from '@/components/ui/skeleton-cards'

export default function AdminLoading() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0F1117]">
      {/* Admin sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/10 p-4 gap-4">
        <div className="flex items-center gap-3 p-2">
          <Skeleton className="w-8 h-8 rounded-lg bg-white/10" />
          <Skeleton className="h-5 w-20 bg-white/10" />
        </div>
        <div className="space-y-1 mt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl bg-white/10" />
          ))}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="h-16 border-b border-white/10 px-6 flex items-center justify-between flex-shrink-0">
          <Skeleton className="h-6 w-32 bg-white/10" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-24 bg-white/10" />
            <Skeleton className="w-9 h-9 rounded-full bg-white/10" />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border border-white/10 p-5 bg-white/5 space-y-3">
                <Skeleton className="h-4 w-24 bg-white/10" />
                <Skeleton className="h-8 w-32 bg-white/10" />
                <Skeleton className="h-3 w-20 bg-white/10" />
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <Skeleton className="h-5 w-32 bg-white/10" />
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <th key={i} className="px-4 py-3 text-left">
                      <Skeleton className="h-3 w-20 bg-white/10" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <TableSkeleton rows={8} cols={5} />
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}
