import Link from "next/link";
import { getForms } from "@/actions/forms";
import { getCategories } from "@/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, PenTool, Building2 } from "lucide-react";
import { FormFilters } from "./form-filters";

export default async function FormsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  let data: Awaited<ReturnType<typeof getForms>> = { items: [], total: 0, page: 1, limit: 20 };
  let cats: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    [data, cats] = await Promise.all([
      getForms({
        categoryId: params.categoryId,
        q: params.q,
        status: "active",
        page: params.page ? parseInt(params.page) : 1,
      }),
      getCategories(),
    ]);
  } catch {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          טפסים
        </h1>
        <p className="text-muted-foreground mt-1">הורדה, מילוי וחתימה על טפסים</p>
      </div>

      <FormFilters
        categories={cats}
        currentCategory={params.categoryId}
        currentQuery={params.q}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.items.length > 0 ? (
          data.items.map((form: { id: string; title: string; description?: string | null; requiresSignature?: boolean; category?: { name: string } | null; ownerDepartment?: { name: string } | null }) => (
            <Link key={form.id} href={`/forms/${form.id}`}>
              <Card className="h-full hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    {form.requiresSignature && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <PenTool className="h-2.5 w-2.5" />
                        חתימה
                      </Badge>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{form.title}</h3>
                    {form.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {form.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {form.category && (
                      <Badge variant="secondary" className="text-[10px]">
                        {form.category.name}
                      </Badge>
                    )}
                    {form.ownerDepartment && (
                      <Badge variant="outline" className="text-[10px]">
                        <Building2 className="h-2.5 w-2.5 mr-1" />
                        {form.ownerDepartment.name}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">אין טפסים זמינים</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
