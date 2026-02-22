"use server";

import { db } from "@/lib/db";
import { emailWhitelist, otpCodes } from "@/lib/db/schema";
import { requestOtpSchema, verifyOtpSchema } from "@/lib/validators";
import { sendOtpEmail } from "@/lib/email";
import { signIn, signOut } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function requestOtp(formData: FormData) {
  const raw = { email: formData.get("email") };
  const parsed = requestOtpSchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, error: "כתובת מייל לא תקינה" };
  }

  const { email } = parsed.data;

  // Check whitelist
  const [whitelisted] = await db
    .select()
    .from(emailWhitelist)
    .where(
      and(
        eq(emailWhitelist.email, email),
        eq(emailWhitelist.isActive, true)
      )
    );

  if (!whitelisted) {
    return { ok: false, error: "כתובת המייל אינה מאושרת במערכת" };
  }

  // Generate and hash OTP
  const code = generateOtp();
  const codeHash = await bcrypt.hash(code, 10);

  // Store OTP
  await db.insert(otpCodes).values({
    email,
    codeHash,
    channel: "email",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });

  // Always log in dev for convenience
  if (process.env.NODE_ENV === "development") {
    console.log(`\n🔑 OTP for ${email}: ${code}\n`);
  }

  // Send email (both dev and production – Resend API key required)
  try {
    await sendOtpEmail(email, code);
  } catch (err) {
    console.error("OTP email failed:", err);
    // In dev, continue even if email fails (code is in console)
    if (process.env.NODE_ENV !== "development") {
      return { ok: false, error: "שליחת המייל נכשלה, נסה שנית" };
    }
  }

  return { ok: true, data: { otpSent: true } };
}

export async function verifyOtp(formData: FormData) {
  const raw = {
    email: formData.get("email"),
    code: formData.get("code"),
  };
  const parsed = verifyOtpSchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, error: "נתונים לא תקינים" };
  }

  try {
    await signIn("otp", {
      email: parsed.data.email,
      code: parsed.data.code,
      redirect: false,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "קוד שגוי או שפג תוקפו" };
  }
}

export async function logout() {
  await signOut({ redirect: false });
  return { ok: true };
}
