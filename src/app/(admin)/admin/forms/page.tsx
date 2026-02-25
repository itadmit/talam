import { getForms, getSubmissions } from "@/actions/forms";
import { getCategoriesForForms, getDepartments } from "@/actions/admin";
import { requireDeptManagerOrAdmin } from "@/lib/auth/helpers";
import { FormsAdminClient } from "./forms-admin-client";

export default async function AdminFormsPage() {
  await requireDeptManagerOrAdmin();

  let formsData: Awaited<ReturnType<typeof getForms>> = {
    items: [],
    total: 0,
    page: 1,
    limit: 20,
  };
  let subsData: Awaited<ReturnType<typeof getSubmissions>> = {
    items: [],
    total: 0,
    page: 1,
    limit: 20,
  };
  let categories: Awaited<ReturnType<typeof getCategoriesForForms>> = [];
  let departments: Awaited<ReturnType<typeof getDepartments>> = [];

  try {
    [formsData, subsData, categories, departments] = await Promise.all([
      getForms().catch(() => ({ items: [], total: 0, page: 1, limit: 20 })),
      getSubmissions().catch(() => ({ items: [], total: 0, page: 1, limit: 20 })),
      getCategoriesForForms().catch(() => []),
      getDepartments().catch(() => []),
    ]);
  } catch {}

  return (
    <FormsAdminClient
      forms={formsData.items as Parameters<typeof FormsAdminClient>[0]["forms"]}
      submissions={
        subsData.items as Parameters<typeof FormsAdminClient>[0]["submissions"]
      }
      categories={categories}
      departments={departments}
    />
  );
}
