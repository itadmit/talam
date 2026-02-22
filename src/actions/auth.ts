"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { emailWhitelist, otpCodes, otpVerifyTokens, users } from "@/lib/db/schema";
import { requestOtpSchema, verifyOtpSchema } from "@/lib/validators";
import { sendOtpEmail } from "@/lib/email";
import { signOut } from "@/lib/auth";
import { eq, and, gt, isNull, desc } from "drizzle-orm";
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

  const email = parsed.data.email.trim().toLowerCase();

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

  // Send email – כשמוגדר RESEND_API_KEY, שליחת המייל חובה
  try {
    await sendOtpEmail(email, code);
  } catch (err) {
    console.error("OTP email failed:", err);
    if (process.env.RESEND_API_KEY) {
      return { ok: false, error: "שליחת המייל נכשלה, נסה שנית" };
    }
    if (process.env.NODE_ENV !== "development") {
      return { ok: false, error: "שליחת המייל נכשלה, נסה שנית" };
    }
  }

  const showDevCode =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_DEV_OTP_DISPLAY === "true";

  return {
    ok: true,
    data: {
      otpSent: true,
      ...(showDevCode && { devCode: code }),
    },
  };
}

/** אימות OTP, צריכת הקוד, יצירת משתמש אם צריך, והחזרת טוקן חד־פעמי */
async function verifyOtpAndCreateToken(
  email: string,
  code: string
): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  const normEmail = email.trim().toLowerCase();
  const normCode = code.trim();

  const [otp] = await db
    .select()
    .from(otpCodes)
    .where(eq(otpCodes.email, normEmail))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  if (!otp) {
    return { ok: false, error: "לא נמצא קוד. נסה לבקש קוד חדש." };
  }

  if (otp.consumedAt) {
    return { ok: false, error: "הקוד כבר נוצל. נסה לבקש קוד חדש." };
  }

  if (new Date() >= otp.expiresAt) {
    return { ok: false, error: "פג תוקף הקוד. נסה לבקש קוד חדש." };
  }

  if (otp.attempts >= 5) {
    return { ok: false, error: "פג תוקף הקוד. נסה לבקש קוד חדש." };
  }

  const isValid = await bcrypt.compare(normCode, otp.codeHash);
  if (!isValid) {
    await db
      .update(otpCodes)
      .set({ attempts: otp.attempts + 1 })
      .where(eq(otpCodes.id, otp.id));
    return { ok: false, error: "קוד שגוי." };
  }

  await db
    .update(otpCodes)
    .set({ consumedAt: new Date() })
    .where(eq(otpCodes.id, otp.id));

  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normEmail));

  if (!user) {
    const [newUser] = await db
      .insert(users)
      .values({
        email: normEmail,
        role: "user",
        isActive: true,
      })
      .returning();
    user = newUser;
  }

  if (!user.isActive) {
    return { ok: false, error: "המשתמש אינו פעיל." };
  }

  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  await db.insert(otpVerifyTokens).values({
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + 60 * 1000),
  });

  return { ok: true, token };
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

  const email = parsed.data.email.trim().toLowerCase();
  const code = parsed.data.code.trim();

  const result = await verifyOtpAndCreateToken(email, code);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  const cookieStore = await cookies();
  cookieStore.set("otp_verify_token", result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/otp-callback",
    maxAge: 60,
  });

  return { ok: true, redirectUrl: "/api/auth/otp-callback" };
}

export async function logout() {
  await signOut({ redirect: false });
  return { ok: true };
}
