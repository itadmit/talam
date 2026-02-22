import { requireDeptManagerOrAdmin } from "@/lib/auth/helpers";
import { getKnowledgeItem } from "@/actions/knowledge";
import { getCategories, getDepartments } from "@/actions/admin";
import { KnowledgeEditorForm } from "./knowledge-editor-form";
import { notFound } from "next/navigation";

export default async function KnowledgeEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  await requireDeptManagerOrAdmin();
  const params = await searchParams;

  const [categories, departments] = await Promise.all([
    getCategories(),
    getDepartments(),
  ]);

  let item = null;
  if (params.id) {
    item = await getKnowledgeItem(params.id);
    if (!item) {
      notFound();
    }
  }

  return (
    <KnowledgeEditorForm
      item={
        item
          ? {
              id: item.id,
              title: item.title,
              summary: item.summary,
              content: item.content,
              status: item.status,
              statusNote: item.statusNote,
              sourceNote: item.sourceNote,
              categoryId: item.categoryId,
              ownerDepartmentId: item.ownerDepartmentId,
              publishedAt: item.publishedAt,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              itemTags: item.itemTags as { tag: { id: string; name: string } }[],
            }
          : null
      }
      categories={categories.map((c: { id: string; name: string }) => ({
        id: c.id,
        name: c.name,
      }))}
      departments={departments.map((d: { id: string; name: string }) => ({
        id: d.id,
        name: d.name,
      }))}
    />
  );
}
