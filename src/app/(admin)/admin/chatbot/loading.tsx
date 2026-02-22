import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
      <Skeleton className="h-20 rounded-xl" />
    </div>
  );
}
