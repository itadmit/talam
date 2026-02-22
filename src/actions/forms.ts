"use server";

import { db } from "@/lib/db";
import { forms, formSubmissions, tickets, ticketMessages, notifications, assets, users } from "@/lib/db/schema";
import { formSchema } from "@/lib/validators";
import { requireAuth } from "@/lib/auth/helpers";
import { eq, and, isNull, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendFormStatusEmail } from "@/lib/email";

export async function getForms(params?: {
  categoryId?: string;
  ownerDepartmentId?: string;
  status?: string;
  q?: string;
  page?: number;
}) {
  const limit = 20;
  const offset = ((params?.page || 1) - 1) * limit;

  const conditions = [isNull(forms.deletedAt)];

  if (params?.categoryId) {
    conditions.push(eq(forms.categoryId, params.categoryId));
  }

  if (params?.ownerDepartmentId) {
    conditions.push(eq(forms.ownerDepartmentId, params.ownerDepartmentId));
  }

  if (params?.status) {
    conditions.push(
      eq(forms.status, params.status as "draft" | "active" | "archived")
    );
  }

  if (params?.q) {
    conditions.push(
      sql`(${forms.title} ILIKE ${"%" + params.q + "%"} OR ${forms.description} ILIKE ${"%" + params.q + "%"})`
    );
  }

  const items = await db.query.forms.findMany({
    where: and(...conditions),
    with: {
      category: true,
      ownerDepartment: true,
    },
    orderBy: [desc(forms.updatedAt)],
    limit,
    offset,
  });

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(forms)
    .where(and(...conditions));

  return { items, total: Number(count), page: params?.page || 1, limit };
}

export async function getForm(id: string) {
  return db.query.forms.findFirst({
    where: and(eq(forms.id, id), isNull(forms.deletedAt)),
    with: {
      category: true,
      ownerDepartment: true,
    },
  });
}

export async function createForm(data: {
  formType?: "digital" | "external";
  title: string;
  description?: string;
  externalUrl?: string | null;
  categoryId?: string | null;
  ownerDepartmentId?: string | null;
  schema: unknown;
  requiresSignature?: boolean;
  status?: "draft" | "active" | "archived";
}) {
  await requireAuth();
  const parsed = formSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: "נתונים לא תקינים" };
  }

  const [form] = await db
    .insert(forms)
    .values({
      ...parsed.data,
      schema: parsed.data.schema,
    })
    .returning();

  revalidatePath("/forms");
  revalidatePath("/admin/forms");
  return { ok: true, data: form };
}

export async function updateForm(
  id: string,
  data: {
    formType?: "digital" | "external";
    title?: string;
    description?: string;
    externalUrl?: string | null;
    categoryId?: string | null;
    ownerDepartmentId?: string | null;
    schema?: unknown;
    requiresSignature?: boolean;
    status?: "draft" | "active" | "archived";
  }
) {
  await requireAuth();

  await db
    .update(forms)
    .set({ ...data, schema: data.schema as never, updatedAt: new Date() })
    .where(eq(forms.id, id));

  revalidatePath("/forms");
  revalidatePath(`/forms/${id}`);
  revalidatePath("/admin/forms");
  return { ok: true };
}

export async function deleteForm(id: string) {
  await requireAuth();
  await db
    .update(forms)
    .set({ deletedAt: new Date() })
    .where(eq(forms.id, id));

  revalidatePath("/forms");
  revalidatePath("/admin/forms");
  return { ok: true };
}

export async function submitForm(data: {
  formId: string;
  answers: Record<string, unknown>;
  signatureAssetId?: string;
}) {
  const session = await requireAuth();

  const [submission] = await db
    .insert(formSubmissions)
    .values({
      formId: data.formId,
      submittedByUserId: session.user.id,
      answers: data.answers,
      signatureAssetId: data.signatureAssetId || null,
      status: "received",
    })
    .returning();

  // Fetch the form to get its title and department
  const form = await db.query.forms.findFirst({
    where: eq(forms.id, data.formId),
  });

  if (form) {
    const deptId = form.ownerDepartmentId;

    // Auto-create a ticket linked to the submission
    const [ticket] = await db
      .insert(tickets)
      .values({
        createdByUserId: session.user.id,
        departmentId: deptId!,
        subject: `הגשת טופס: ${form.title}`,
        status: "open",
        formSubmissionId: submission.id,
      })
      .returning();

    // Map field IDs to Hebrew labels from the form schema
    const fieldLabelMap: Record<string, string> = {};
    if (form.schema?.fields) {
      for (const field of form.schema.fields) {
        fieldLabelMap[field.id] = field.label;
      }
    }

    const answerLines = Object.entries(data.answers)
      .map(([key, val]) => `${fieldLabelMap[key] || key}: ${val}`)
      .join("\n");

    await db.insert(ticketMessages).values({
      ticketId: ticket.id,
      senderUserId: session.user.id,
      message: `הוגש טופס "${form.title}"\n\n${answerLines}`,
      visibility: "shared",
    });

    revalidatePath("/admin/tickets");
    revalidatePath("/tickets");
  }

  revalidatePath("/forms");
  revalidatePath(`/forms/${data.formId}`);
  return { ok: true, data: submission };
}

export async function getSubmissions(params?: {
  formId?: string;
  status?: string;
  page?: number;
}) {
  const session = await requireAuth();
  const limit = 20;
  const offset = ((params?.page || 1) - 1) * limit;

  const conditions = [];

  if (session.user.role === "user") {
    conditions.push(
      eq(formSubmissions.submittedByUserId, session.user.id)
    );
  }

  if (params?.formId) {
    conditions.push(eq(formSubmissions.formId, params.formId));
  }

  if (params?.status) {
    conditions.push(
      eq(
        formSubmissions.status,
        params.status as "received" | "in_review" | "approved" | "rejected"
      )
    );
  }

  const items = await db.query.formSubmissions.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      form: true,
      submittedBy: true,
      reviewedBy: true,
    },
    orderBy: [desc(formSubmissions.submittedAt)],
    limit,
    offset,
  });

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(formSubmissions)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return { items, total: Number(count), page: params?.page || 1, limit };
}

export async function updateSubmissionStatus(
  id: string,
  data: {
    status: "received" | "in_review" | "approved" | "rejected";
    note?: string;
  }
) {
  const session = await requireAuth();

  await db
    .update(formSubmissions)
    .set({
      status: data.status,
      reviewedByUserId: session.user.id,
      reviewNote: data.note || null,
      updatedAt: new Date(),
    })
    .where(eq(formSubmissions.id, id));

  // Notify user
  const submission = await db.query.formSubmissions.findFirst({
    where: eq(formSubmissions.id, id),
    with: { form: true },
  });

  if (submission) {
    const statusLabels: Record<string, string> = {
      received: "התקבל",
      in_review: "בבדיקה",
      approved: "אושר",
      rejected: "נדחה",
    };
    await db.insert(notifications).values({
      userId: submission.submittedByUserId,
      type: "submission_status",
      title: "עדכון סטטוס הגשה",
      message: `הטופס "${submission.form.title}" עודכן ל: ${statusLabels[data.status]}`,
      entityType: "submission",
      entityId: id,
    });

    // Send email notification
    const submitter = await db.query.users.findFirst({
      where: eq(users.id, submission.submittedByUserId),
    });
    if (submitter?.email) {
      sendFormStatusEmail(
        submitter.email,
        submission.form.title,
        statusLabels[data.status]
      ).catch((err) => console.error("Email send failed:", err));
    }
  }

  revalidatePath("/admin/forms");
  return { ok: true };
}
