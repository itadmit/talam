"use server";

import { db } from "@/lib/db";
import { chatbotSettings, type QuickQuestion } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/helpers";
import { globalSearch } from "./search";

export async function getChatbotSettings() {
  const [settings] = await db.select().from(chatbotSettings).limit(1);
  return settings || null;
}

export async function updateChatbotSettings(data: {
  isActive?: boolean;
  welcomeMessage?: string;
  quickQuestions?: QuickQuestion[];
}) {
  await requireAdmin();

  const existing = await getChatbotSettings();
  if (!existing) {
    // Create if none exists
    await db.insert(chatbotSettings).values({
      isActive: data.isActive ?? true,
      welcomeMessage: data.welcomeMessage ?? "שלום! אני כאן לעזור.",
      quickQuestions: data.quickQuestions ?? [],
    });
    return { ok: true };
  }

  await db
    .update(chatbotSettings)
    .set({
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.welcomeMessage !== undefined && {
        welcomeMessage: data.welcomeMessage,
      }),
      ...(data.quickQuestions !== undefined && {
        quickQuestions: data.quickQuestions,
      }),
      updatedAt: new Date(),
    })
    .where(eq(chatbotSettings.id, existing.id));

  return { ok: true };
}

export async function chatbotSearch(query: string) {
  if (!query || query.trim().length < 2) {
    return { results: [], query };
  }

  const results = await globalSearch(query.trim(), "all");

  return {
    results: results.slice(0, 8),
    query: query.trim(),
  };
}
