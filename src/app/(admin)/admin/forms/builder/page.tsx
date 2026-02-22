import { getForm } from "@/actions/forms";
import { getCategories, getDepartments } from "@/actions/admin";
import { requireDeptManagerOrAdmin } from "@/lib/auth/helpers";
import { FormBuilderClient } from "./form-builder-client";

export default async function FormBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  await requireDeptManagerOrAdmin();
  const params = await searchParams;

  let existingForm = null;
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let departments: Awaited<ReturnType<typeof getDepartments>> = [];

  try {
    [categories, departments] = await Promise.all([getCategories(), getDepartments()]);
    if (params.id) {
      existingForm = await getForm(params.id);
    }
  } catch {}

  return (
    <FormBuilderClient
      existingForm={existingForm ?? null}
      categories={categories}
      departments={departments}
    />
  );
}
