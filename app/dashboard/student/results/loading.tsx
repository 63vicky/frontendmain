import { Skeleton } from "@/components/ui/skeleton"

export default function StudentResultsLoading() {
  return (
    <div className="container mx-auto p-6">
      <Skeleton className="h-10 w-[250px] mb-6" />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[120px] rounded-lg" />
          ))}
        </div>

        <Skeleton className="h-8 w-[200px] mb-4" />

        <div className="border rounded-lg p-4">
          <Skeleton className="h-8 w-[150px] mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
