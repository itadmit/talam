import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assets } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const ownerType = formData.get("ownerType") as string;
  const ownerId = formData.get("ownerId") as string;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "הקובץ גדול מדי (מקסימום 10MB)" },
      { status: 400 }
    );
  }

  try {
    // Upload to Vercel Blob
    const blob = await put(`talam/${ownerType}/${ownerId}/${file.name}`, file, {
      access: "public",
    });

    // Save to DB
    const [asset] = await db
      .insert(assets)
      .values({
        ownerType: ownerType as "knowledge" | "ticket" | "ticket_message" | "form" | "submission" | "other",
        ownerId,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        storageKey: blob.pathname,
        storageUrl: blob.url,
        uploadedByUserId: session.user.id,
      })
      .returning();

    return NextResponse.json({ ok: true, data: asset });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "העלאת הקובץ נכשלה" },
      { status: 500 }
    );
  }
}
