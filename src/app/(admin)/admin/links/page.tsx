import { getLinks, getCategories, getDepartments } from "@/actions/admin";
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
import { Link2, ExternalLink } from "lucide-react";
import { LinkDialog, DeleteLinkButton, LinkFilters } from "./link-actions-client";

export default async function AdminLinksPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; q?: string }>;
}) {
  await requireDeptManagerOrAdmin();
  const params = await searchParams;

  let links: Awaited<ReturnType<typeof getLinks>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let departments: Awaited<ReturnType<typeof getDepartments>> = [];

  try {
    [links, categories, departments] = await Promise.all([
      getLinks({ categoryId: params.categoryId, q: params.q }),
      getCategories(),
      getDepartments(),
    ]);
  } catch {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Link2 className="h-6 w-6" />
            ניהול קישורים
          </h1>
          <p className="text-muted-foreground mt-1">{links.length} קישורים</p>
        </div>
        <LinkDialog categories={categories} departments={departments} />
      </div>

      <LinkFilters
        currentQuery={params.q}
        currentCategory={params.categoryId}
        categories={categories}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>כותרת</TableHead>
                <TableHead>קישור</TableHead>
                <TableHead>קטגוריה</TableHead>
                <TableHead>מדור</TableHead>
                <TableHead className="w-28">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {links.map((link: any) => (
                <TableRow key={link.id}>
                  <TableCell className="font-medium">{link.title}</TableCell>
                  <TableCell>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 text-sm truncate max-w-[200px]"
                      dir="ltr"
                    >
                      {link.url}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell>{link.category?.name || "—"}</TableCell>
                  <TableCell>{link.ownerDepartment?.name || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <LinkDialog categories={categories} departments={departments} link={link} />
                      <DeleteLinkButton id={link.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {links.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              לא נמצאו קישורים
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
