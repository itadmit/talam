"use server";

import { db } from "@/lib/db";
import {
  knowledgeItems,
  knowledgeItemTags,
  knowledgeTags,
  assets,
} from "@/lib/db/schema";
import { knowledgeItemSchema } from "@/lib/validators";
import { requireAuth } from "@/lib/auth/helpers";
import { eq, and, isNull, ilike, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getKnowledgeItems(params?: {
  categoryId?: string;
  status?: string;
  q?: string;
  page?: number;
}) {
  const limit = 20;
  const offset = ((params?.page || 1) - 1) * limit;

  const conditions = [isNull(knowledgeItems.deletedAt)];

  if (params?.categoryId) {
    conditions.push(eq(knowledgeItems.categoryId, params.categoryId));
  }

  if (params?.status) {
    conditions.push(
      eq(
        knowledgeItems.status,
        params.status as "green" | "yellow" | "red"
      )
    );
  }

  if (params?.q) {
    conditions.push(
      sql`(${knowledgeItems.title} ILIKE ${"%" + params.q + "%"} OR ${knowledgeItems.summary} ILIKE ${"%" + params.q + "%"} OR ${knowledgeItems.content} ILIKE ${"%" + params.q + "%"})`
    );
  }

  const items = await db.query.knowledgeItems.findMany({
    where: and(...conditions),
    with: {
      category: true,
      ownerDepartment: true,
      itemTags: { with: { tag: true } },
    },
    orderBy: [desc(knowledgeItems.updatedAt)],
    limit,
    offset,
  });

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(knowledgeItems)
    .where(and(...conditions));

  return { items, total: Number(count), page: params?.page || 1, limit };
}

export async function getKnowledgeItem(id: string) {
  const item = await db.query.knowledgeItems.findFirst({
    where: and(eq(knowledgeItems.id, id), isNull(knowledgeItems.deletedAt)),
    with: {
      category: true,
      ownerDepartment: true,
      updatedBy: true,
      itemTags: { with: { tag: true } },
    },
  });

  if (!item) return null;

  // Get attachments
  const attachments = await db
    .select()
    .from(assets)
    .where(
      and(eq(assets.ownerType, "knowledge"), eq(assets.ownerId, id))
    );

  return { ...item, attachments };
}

export async function createKnowledgeItem(data: {
  categoryId: string;
  ownerDepartmentId: string;
  title: string;
  summary?: string;
  content?: string;
  status?: "green" | "yellow" | "red";
  statusNote?: string;
  sourceNote?: string;
  tags?: string[];
}) {
  const session = await requireAuth();
  const parsed = knowledgeItemSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: "נתונים לא תקינים" };
  }

  const { tags, ...itemData } = parsed.data;

  const [item] = await db
    .insert(knowledgeItems)
    .values({
      ...itemData,
      status: itemData.status || "green",
      updatedByUserId: session.user.id,
      publishedAt: new Date(),
    })
    .returning();

  // Handle tags
  if (tags && tags.length > 0) {
    for (const tagName of tags) {
      let [tag] = await db
        .select()
        .from(knowledgeTags)
        .where(eq(knowledgeTags.name, tagName));

      if (!tag) {
        [tag] = await db
          .insert(knowledgeTags)
          .values({ name: tagName })
          .returning();
      }

      await db.insert(knowledgeItemTags).values({
        knowledgeItemId: item.id,
        tagId: tag.id,
      });
    }
  }

  revalidatePath("/knowledge");
  revalidatePath("/admin/knowledge");
  return { ok: true, data: item };
}

export async function updateKnowledgeItem(
  id: string,
  data: {
    categoryId?: string;
    ownerDepartmentId?: string;
    title?: string;
    summary?: string;
    content?: string;
    status?: "green" | "yellow" | "red";
    statusNote?: string;
    sourceNote?: string;
    tags?: string[];
  }
) {
  const session = await requireAuth();
  const { tags, ...itemData } = data;

  await db
    .update(knowledgeItems)
    .set({
      ...itemData,
      updatedByUserId: session.user.id,
      updatedAt: new Date(),
    })
    .where(eq(knowledgeItems.id, id));

  // Update tags
  if (tags !== undefined) {
    await db
      .delete(knowledgeItemTags)
      .where(eq(knowledgeItemTags.knowledgeItemId, id));

    for (const tagName of tags) {
      let [tag] = await db
        .select()
        .from(knowledgeTags)
        .where(eq(knowledgeTags.name, tagName));

      if (!tag) {
        [tag] = await db
          .insert(knowledgeTags)
          .values({ name: tagName })
          .returning();
      }

      await db.insert(knowledgeItemTags).values({
        knowledgeItemId: id,
        tagId: tag.id,
      });
    }
  }

  revalidatePath("/knowledge");
  revalidatePath(`/knowledge/${id}`);
  revalidatePath("/admin/knowledge");
  return { ok: true };
}

export async function deleteKnowledgeItem(id: string) {
  await requireAuth();
  await db
    .update(knowledgeItems)
    .set({ deletedAt: new Date() })
    .where(eq(knowledgeItems.id, id));

  revalidatePath("/knowledge");
  revalidatePath("/admin/knowledge");
  return { ok: true };
}
