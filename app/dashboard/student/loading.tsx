import { Skeleton } from "@/components/ui/skeleton"

export default function StudentDashboardLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <Skeleton className="h-10 w-[250px] mb-4" />
        <Skeleton className="h-6 w-[350px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[200px] rounded-lg" />
        ))}
      </div>

      <div className="mb-8">
        <Skeleton className="h-8 w-[200px] mb-4" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-md" />
          ))}
        </div>
      </div>

      <div>
        <Skeleton className="h-8 w-[200px] mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-[150px] rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
