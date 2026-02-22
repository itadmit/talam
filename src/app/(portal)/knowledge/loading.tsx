import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 flex-1 max-w-lg" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
