import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar skeleton */}
      <div className="h-16 border-b border-border bg-white/80 backdrop-blur-sm px-6 flex items-center justify-between">
        <Skeleton className="h-7 w-24" />
        <div className="hidden md:flex items-center gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-4 w-16" />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-20 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="container mx-auto px-4 pt-24 pb-16 text-center space-y-6">
        <Skeleton className="h-5 w-40 mx-auto rounded-full" />
        <Skeleton className="h-14 w-3/4 mx-auto" />
        <Skeleton className="h-14 w-1/2 mx-auto" />
        <Skeleton className="h-6 w-96 max-w-full mx-auto" />
        <div className="flex gap-3 justify-center pt-4">
          <Skeleton className="h-12 w-36 rounded-xl" />
          <Skeleton className="h-12 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
