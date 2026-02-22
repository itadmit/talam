import { getForm } from "@/actions/forms";
import { notFound } from "next/navigation";
import { FormDetailClient } from "./form-detail-client";

export default async function FormDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const form = await getForm(id);
  if (!form) notFound();

  return <FormDetailClient form={form} />;
}
