import { getLinks, getCategories } from "@/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2, ExternalLink } from "lucide-react";
import { LinkFilters } from "./link-filters";

export default async function LinksPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; q?: string }>;
}) {
  const params = await searchParams;
  let linksList: Awaited<ReturnType<typeof getLinks>> = [];
  let cats: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    [linksList, cats] = await Promise.all([
      getLinks({ categoryId: params.categoryId, q: params.q }),
      getCategories(),
    ]);
  } catch {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Link2 className="h-6 w-6" />
          קישורים שימושיים
        </h1>
        <p className="text-muted-foreground mt-1">אוסף קישורים חשובים</p>
      </div>

      <LinkFilters
        categories={cats}
        currentCategory={params.categoryId}
        currentQuery={params.q}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {linksList.length > 0 ? (
          linksList.map((link: { id: string; url: string; title: string; description?: string | null; category?: { name: string } | null }) => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer">
              <Card className="h-full hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Link2 className="h-4 w-4 text-primary" />
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="font-semibold text-sm">{link.title}</h3>
                  {link.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {link.description}
                    </p>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {link.category && (
                      <Badge variant="secondary" className="text-[10px]">
                        {link.category.name}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </a>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <Link2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">אין קישורים</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
