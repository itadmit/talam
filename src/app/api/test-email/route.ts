import { sendTestEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { ok: false, error: "Missing email parameter" },
      { status: 400 }
    );
  }

  const result = await sendTestEmail(email);

  return NextResponse.json(result);
}
