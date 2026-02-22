import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users, otpCodes } from "@/lib/db/schema";
import { eq, and, gt, isNull, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "otp",
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        try {
          const rawEmail = (credentials?.email as string)?.trim();
          const email = rawEmail?.toLowerCase();
          const code = (credentials?.code as string)?.trim();

          if (!email || !code) {
            console.error("[auth] authorize: missing email or code");
            return null;
          }

          // Find valid OTP
          const [otp] = await db
            .select()
            .from(otpCodes)
            .where(
              and(
                eq(otpCodes.email, email),
                gt(otpCodes.expiresAt, new Date()),
                isNull(otpCodes.consumedAt)
              )
            )
            .orderBy(desc(otpCodes.createdAt))
            .limit(1);

          if (!otp) {
            console.error("[auth] authorize: no valid OTP found for", email);
            return null;
          }

          if (otp.attempts >= 5) {
            console.error("[auth] authorize: too many attempts for", email);
            return null;
          }

          const isValid = await bcrypt.compare(code, otp.codeHash);
          if (!isValid) {
            await db
              .update(otpCodes)
              .set({ attempts: otp.attempts + 1 })
              .where(eq(otpCodes.id, otp.id));
            console.error("[auth] authorize: invalid OTP code for", email);
            return null;
          }

          await db
            .update(otpCodes)
            .set({ consumedAt: new Date() })
            .where(eq(otpCodes.id, otp.id));

          let [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));

          if (!user) {
            const [newUser] = await db
              .insert(users)
              .values({
                email,
                role: "user",
                isActive: true,
              })
              .returning();
            user = newUser;
          }

          if (!user.isActive) {
            console.error("[auth] authorize: user inactive", email);
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
});
