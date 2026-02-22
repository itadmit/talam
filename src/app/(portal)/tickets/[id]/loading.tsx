import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-9 w-36" />
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
