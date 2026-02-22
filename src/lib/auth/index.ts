import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users, otpVerifyTokens } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      id: "otp",
      name: "OTP",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        try {
          const token = (credentials?.token as string)?.trim();
          if (!token) {
            console.error("[auth] authorize: missing token");
            return null;
          }

          const [row] = await db
            .select()
            .from(otpVerifyTokens)
            .where(
              and(
                eq(otpVerifyTokens.token, token),
                gt(otpVerifyTokens.expiresAt, new Date())
              )
            )
            .limit(1);

          if (!row) {
            console.error("[auth] authorize: invalid or expired token");
            return null;
          }

          await db
            .delete(otpVerifyTokens)
            .where(eq(otpVerifyTokens.id, row.id));

          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, row.userId))
            .limit(1);

          if (!user || !user.isActive) {
            console.error("[auth] authorize: user not found or inactive");
            return null;
          }

          await db
            .update(users)
            .set({ lastLoginAt: new Date() })
            .where(eq(users.id, user.id));

          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            role: user.role,
            departmentId: user.departmentId,
          };
        } catch (err) {
          console.error("[auth] authorize error:", err);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
        token.departmentId = (user as { departmentId?: string }).departmentId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role: string }).role = token.role as string;
        (session.user as { departmentId?: string }).departmentId =
          token.departmentId as string | undefined;
      }
      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
