import { Skeleton } from "@/components/ui/skeleton";

export default function KnowledgeEditorLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
