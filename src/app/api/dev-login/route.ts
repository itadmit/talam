import { NextResponse } from "next/server";
import { signIn } from "@/lib/auth";
import { db } from "@/lib/db";
import { otpCodes } from "@/lib/db/schema";
import bcrypt from "bcryptjs";

// DEV ONLY - bypass OTP for development
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const email = "itadmit@gmail.com";
  const code = "123456";
  const codeHash = await bcrypt.hash(code, 10);

  // Create OTP
  await db.insert(otpCodes).values({
    email,
    codeHash,
    channel: "email",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  // Sign in
  try {
    await signIn("otp", {
      email,
      code,
      redirect: false,
    });
  } catch (error) {
    // NextAuth might throw a redirect, that's ok
    console.log("Sign in result:", error);
  }

  // Redirect to dashboard
  return NextResponse.redirect(new URL("/", process.env.AUTH_URL || "http://localhost:3001"));
}
