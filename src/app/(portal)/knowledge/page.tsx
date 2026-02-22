import Link from "next/link";
import { getKnowledgeItems } from "@/actions/knowledge";
import { getCategories } from "@/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { KnowledgeFilters } from "./knowledge-filters";

const statusConfig: Record<string, { label: string; color: string; dotColor: string }> = {
  green: { label: "מעודכן", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", dotColor: "bg-green-500" },
  yellow: { label: "עדכון נדרש", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", dotColor: "bg-yellow-500" },
  red: { label: "חסר מידע", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", dotColor: "bg-red-500" },
};

function buildPageUrl(
  currentParams: Record<string, string | undefined>,
  newPage: number
) {
  const params = new URLSearchParams();
  Object.entries(currentParams).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });
  params.set("page", String(newPage));
  return `/knowledge?${params.toString()}`;
}

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  let items: Awaited<ReturnType<typeof getKnowledgeItems>> = {
    items: [],
    total: 0,
    page: 1,
    limit: 20,
  };
  let cats: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    [items, cats] = await Promise.all([
      getKnowledgeItems({
        categoryId: params.category,
        status: params.status,
        q: params.q,
        page: params.page ? parseInt(params.page) : 1,
      }),
      getCategories(),
    ]);
  } catch {
    // DB not ready
  }

  const page = items.page;
  const totalPages = Math.ceil(items.total / 20);
  const filterParams = {
    category: params.category,
    status: params.status,
    q: params.q,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          מרכז מידע
        </h1>
        <p className="text-muted-foreground mt-1">
          מידע על זכויות, נהלים ושירותים
        </p>
      </div>

      <KnowledgeFilters
        categories={cats}
        currentCategory={params.category}
        currentStatus={params.status}
        currentQuery={params.q}
      />

      {/* Results */}
      <div className="space-y-3">
        {items.items.length > 0 ? (
          items.items.map((item: { id: string; status: string; title: string; summary?: string | null; category?: { name: string } | null; ownerDepartment?: { name: string } | null; itemTags?: { tag: { id: string; name: string } }[] }) => {
            const sc = statusConfig[item.status] || statusConfig.green;
            return (
              <Link key={item.id} href={`/knowledge/${item.id}`}>
                <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/20 cursor-pointer mb-3">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <div className={`h-2.5 w-2.5 rounded-full ${sc.dotColor}`} />
                          <h3 className="font-semibold text-base">
                            {item.title}
                          </h3>
                        </div>
                        {item.summary && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {item.summary}
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap mt-3">
                          {item.category && (
                            <Badge variant="secondary" className="text-xs">
                              {item.category.name}
                            </Badge>
                          )}
                          {item.ownerDepartment && (
                            <Badge variant="outline" className="text-xs">
                              {item.ownerDepartment.name}
                            </Badge>
                          )}
                          {item.itemTags?.slice(0, 3).map(({ tag }: { tag: { id: string; name: string } }) => (
                            <Badge key={tag.id} variant="outline" className="text-xs opacity-60">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Badge className={`shrink-0 text-xs ${sc.color}`}>
                        {sc.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">לא נמצאו פריטי מידע</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 ? (
            <Link href={buildPageUrl(filterParams, page - 1)}>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            עמוד {page} מתוך {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={buildPageUrl(filterParams, page + 1)}>
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
