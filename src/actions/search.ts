"use server";

import { db } from "@/lib/db";
import {
  knowledgeItems,
  knowledgeItemTags,
  knowledgeTags,
  forms,
  contacts,
  links,
  communityQna,
} from "@/lib/db/schema";
import { sql, and, isNull, eq } from "drizzle-orm";

export interface SearchResult {
  type: "knowledge" | "form" | "contact" | "link" | "community";
  id: string;
  title: string;
  snippet: string;
  url: string;
  sourceNote?: string | null;
}

export async function globalSearch(
  q: string,
  type: string = "all"
): Promise<SearchResult[]> {
  if (!q || q.trim().length < 2) return [];

  const searchTerm = `%${q.trim()}%`;
  const results: SearchResult[] = [];

  // Search knowledge items
  if (type === "all" || type === "knowledge") {
    const knowledgeResults: { id: string; title: string; summary: string | null; sourceNote: string | null }[] = await db
      .select({
        id: knowledgeItems.id,
        title: knowledgeItems.title,
        summary: knowledgeItems.summary,
        sourceNote: knowledgeItems.sourceNote,
      })
      .from(knowledgeItems)
      .where(
        and(
          isNull(knowledgeItems.deletedAt),
          sql`(
            ${knowledgeItems.title} ILIKE ${searchTerm}
            OR ${knowledgeItems.summary} ILIKE ${searchTerm}
            OR ${knowledgeItems.content} ILIKE ${searchTerm}
            OR EXISTS (
              SELECT 1 FROM ${knowledgeItemTags}
              JOIN ${knowledgeTags} ON ${knowledgeTags.id} = ${knowledgeItemTags.tagId}
              WHERE ${knowledgeItemTags.knowledgeItemId} = ${knowledgeItems.id}
              AND ${knowledgeTags.name} ILIKE ${searchTerm}
            )
          )`
        )
      )
      .limit(10);

    results.push(
      ...knowledgeResults.map((r) => ({
        type: "knowledge" as const,
        id: r.id,
        title: r.title,
        snippet: r.summary?.substring(0, 150) || "",
        url: `/knowledge/${r.id}`,
        sourceNote: r.sourceNote,
      }))
    );
  }

  // Search forms
  if (type === "all" || type === "forms") {
    const formResults: { id: string; title: string; description: string | null }[] = await db
      .select({
        id: forms.id,
        title: forms.title,
        description: forms.description,
      })
      .from(forms)
      .where(
        and(
          isNull(forms.deletedAt),
          eq(forms.status, "active"),
          sql`(${forms.title} ILIKE ${searchTerm} OR ${forms.description} ILIKE ${searchTerm})`
        )
      )
      .limit(10);

    results.push(
      ...formResults.map((r) => ({
        type: "form" as const,
        id: r.id,
        title: r.title,
        snippet: r.description?.substring(0, 150) || "",
        url: `/forms/${r.id}`,
      }))
    );
  }

  // Search contacts
  if (type === "all" || type === "contacts") {
    const contactResults: { id: string; name: string; roleTitle: string | null; phone: string | null }[] = await db
      .select({
        id: contacts.id,
        name: contacts.name,
        roleTitle: contacts.roleTitle,
        phone: contacts.phone,
      })
      .from(contacts)
      .where(
        and(
          eq(contacts.isPublic, true),
          sql`(${contacts.name} ILIKE ${searchTerm} OR ${contacts.roleTitle} ILIKE ${searchTerm})`
        )
      )
      .limit(10);

    results.push(
      ...contactResults.map((r) => ({
        type: "contact" as const,
        id: r.id,
        title: r.name,
        snippet: [r.roleTitle, r.phone].filter(Boolean).join(" · "),
        url: `/contacts`,
      }))
    );
  }

  // Search links
  if (type === "all" || type === "links") {
    const linkResults: { id: string; title: string; description: string | null }[] = await db
      .select({
        id: links.id,
        title: links.title,
        description: links.description,
      })
      .from(links)
      .where(
        and(
          isNull(links.deletedAt),
          sql`(${links.title} ILIKE ${searchTerm} OR ${links.description} ILIKE ${searchTerm})`
        )
      )
      .limit(10);

    results.push(
      ...linkResults.map((r) => ({
        type: "link" as const,
        id: r.id,
        title: r.title,
        snippet: r.description?.substring(0, 150) || "",
        url: `/links`,
      }))
    );
  }

  // Search community Q&A
  if (type === "all" || type === "community") {
    const communityResults: { id: string; question: string; answer: string }[] = await db
      .select({
        id: communityQna.id,
        question: communityQna.question,
        answer: communityQna.answer,
      })
      .from(communityQna)
      .where(
        sql`(${communityQna.question} ILIKE ${searchTerm} OR ${communityQna.answer} ILIKE ${searchTerm})`
      )
      .limit(10);

    results.push(
      ...communityResults.map((r) => ({
        type: "community" as const,
        id: r.id,
        title: r.question,
        snippet: r.answer.substring(0, 150),
        url: `/community`,
      }))
    );
  }

  return results;
}
