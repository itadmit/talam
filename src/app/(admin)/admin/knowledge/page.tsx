import Link from "next/link";
import { getKnowledgeItems } from "@/actions/knowledge";
import { getCategories } from "@/actions/admin";
import { requireDeptManagerOrAdmin } from "@/lib/auth/helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpen, Pencil, Plus } from "lucide-react";
import { DeleteKnowledgeButton, KnowledgeFilters } from "./knowledge-actions-client";

const statusLabels: Record<string, string> = {
  green: "מאושר",
  yellow: "בבדיקה",
  red: "מושבת",
};

const statusColors: Record<string, string> = {
  green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default async function AdminKnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; status?: string; page?: string }>;
}) {
  await requireDeptManagerOrAdmin();
  const params = await searchParams;

  let data: Awaited<ReturnType<typeof getKnowledgeItems>> = {
    items: [],
    total: 0,
    page: 1,
    limit: 20,
  };
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    [data, categories] = await Promise.all([
      getKnowledgeItems({
        categoryId: params.categoryId,
        status: params.status,
        page: params.page ? parseInt(params.page) : 1,
      }),
      getCategories(),
    ]);
  } catch {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            ניהול ידע
          </h1>
          <p className="text-muted-foreground mt-1">
            {data.total} פריטים • עמוד {data.page}
          </p>
        </div>
        <Link href="/admin/knowledge/editor">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            פריט ידע חדש
          </Button>
        </Link>
      </div>

      <KnowledgeFilters
        currentCategory={params.categoryId}
        currentStatus={params.status}
        categories={categories}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>כותרת</TableHead>
                <TableHead>קטגוריה</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>מדור</TableHead>
                <TableHead className="w-24">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item: { id: string; title: string; status: string; category?: { name: string } | null; ownerDepartment?: { name: string } | null }) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.category?.name || "—"}</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${statusColors[item.status] || ""}`}>
                      {statusLabels[item.status] || item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.ownerDepartment?.name || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/knowledge/editor?id=${item.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <DeleteKnowledgeButton id={item.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {data.items.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              לא נמצאו פריטי ידע
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
