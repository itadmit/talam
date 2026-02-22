import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Auth, raw, skipCSRFCheck } from "@auth/core";
import { authConfig } from "@/lib/auth";

/**
 * Receives token from cookie (set by verifyOtp), creates a proper POST request
 * to the Auth callback, and returns the Auth response. Bypasses signIn() which
 * may not pass credentials correctly in serverless.
 */
export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("otp_verify_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing_token", req.url));
  }

  cookieStore.delete("otp_verify_token");

  const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || req.nextUrl.origin;
  const callbackUrl = `${baseUrl}/api/auth/callback/otp`;
  const body = new URLSearchParams({ token, callbackUrl: "/" });

  const authReq = new Request(callbackUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: req.headers.get("cookie") ?? "",
    },
    body: body.toString(),
  });

  const res = await Auth(authReq, {
    ...authConfig,
    raw,
    skipCSRFCheck,
  });

  const resObj = res as { redirect?: string; cookies?: Array<{ name: string; value: string; options?: Record<string, unknown> }> };
  if (resObj?.cookies) {
    const cookieStore2 = await cookies();
    for (const c of resObj.cookies) {
      cookieStore2.set(c.name, c.value, {
        path: (c.options?.path as string) ?? "/",
        httpOnly: true,
        sameSite: "lax",
        secure: (c.options?.secure as boolean) ?? process.env.NODE_ENV === "production",
        maxAge: (c.options?.maxAge as number) ?? 24 * 60 * 60,
      });
    }
  }

  const redirectUrl = res instanceof Response ? res.headers.get("Location") : resObj?.redirect;
  if (redirectUrl) {
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.redirect(new URL("/login?error=auth_failed", req.url));
}
