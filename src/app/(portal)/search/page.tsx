import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  BookOpen,
  FileText,
  Phone,
  Link2,
  MessageSquare,
} from "lucide-react";
import { globalSearch } from "@/actions/search";
import { SearchFilters } from "./search-filters";

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  knowledge: { label: "מידע", icon: BookOpen, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  form: { label: "טופס", icon: FileText, color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  contact: { label: "איש קשר", icon: Phone, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  link: { label: "קישור", icon: Link2, color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400" },
  community: { label: "שאלה", icon: MessageSquare, color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim();
  const type = params.type || "all";

  let results: { type: string; id: string; title: string; snippet: string; url: string; sourceNote?: string | null }[] = [];
  let searched = false;

  if (query) {
    searched = true;
    try {
      results = await globalSearch(query, type);
    } catch {
      results = [];
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Search className="h-6 w-6" />
          חיפוש חכם
        </h1>
        <p className="text-muted-foreground mt-1">
          חיפוש במידע, טפסים, אנשי קשר וקישורים
        </p>
      </div>

      <SearchFilters currentQuery={query} currentType={type} />

      {/* Results */}
      {searched && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {results.length} תוצאות
          </p>
          {results.length > 0 ? (
            results.map((result) => {
              const tc = typeConfig[result.type] || typeConfig.knowledge;
              const Icon = tc.icon;
              return (
                <Link key={`${result.type}-${result.id}`} href={result.url}>
                  <Card className="hover:shadow-md transition-all cursor-pointer mb-3">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-sm">{result.title}</h3>
                            <Badge className={`text-[10px] ${tc.color}`}>
                              {tc.label}
                            </Badge>
                          </div>
                          {result.snippet && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {result.snippet}
                            </p>
                          )}
                          {result.sourceNote && (
                            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                              <span className="font-medium">מקור:</span> {result.sourceNote}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground">
                  לא נמצאו תוצאות עבור &quot;{query}&quot;
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
