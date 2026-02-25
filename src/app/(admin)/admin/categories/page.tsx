import { getAllCategories } from "@/actions/admin";
import { requireDeptManagerOrAdmin } from "@/lib/auth/helpers";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpen } from "lucide-react";
import { CategoryDialog, ToggleCategoryActive, DeleteCategoryButton } from "./category-actions-client";

export default async function AdminCategoriesPage() {
  await requireDeptManagerOrAdmin();

  let categories: Awaited<ReturnType<typeof getAllCategories>> = [];
  try {
    categories = await getAllCategories();
  } catch {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            ניהול קטגוריות
          </h1>
          <p className="text-muted-foreground mt-1">{categories.length} קטגוריות</p>
        </div>
        <CategoryDialog
          totalCategories={categories.length}
          categories={categories.map((c: { id: string; name: string; parentId: string | null }) => ({
            id: c.id,
            name: c.name,
            parentId: c.parentId ?? null,
          }))}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>סדר</TableHead>
                <TableHead>מפתח</TableHead>
                <TableHead>שם</TableHead>
                <TableHead>תחת</TableHead>
                <TableHead title="כשכבוי – הקטגוריה מוסתרת מהפורטל">מוצג בפורטל</TableHead>
                <TableHead className="w-24">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {categories.map((cat: any) => (
                <TableRow key={cat.id}>
                  <TableCell>{cat.order}</TableCell>
                  <TableCell className="font-mono text-xs">{cat.key}</TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {cat.parent ? cat.parent.name : "—"}
                  </TableCell>
                  <TableCell>
                    <ToggleCategoryActive id={cat.id} isActive={cat.isActive} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <CategoryDialog
                        category={cat}
                        categories={categories.map((c: { id: string; name: string; parentId: string | null }) => ({
                          id: c.id,
                          name: c.name,
                          parentId: c.parentId ?? null,
                        }))}
                      />
                      <DeleteCategoryButton id={cat.id} name={cat.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
