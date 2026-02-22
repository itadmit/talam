import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
