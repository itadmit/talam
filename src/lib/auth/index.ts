import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users, otpCodes } from "@/lib/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
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
        const email = credentials?.email as string;
        const code = credentials?.code as string;

        if (!email || !code) return null;

        // Find valid OTP
        const [otp] = await db
          .select()
          .from(otpCodes)
          .where(
            and(
              eq(otpCodes.email, email.toLowerCase()),
              gt(otpCodes.expiresAt, new Date()),
              isNull(otpCodes.consumedAt)
            )
          )
          .orderBy(otpCodes.createdAt)
          .limit(1);

        if (!otp) return null;

        // Check attempts
        if (otp.attempts >= 5) return null;

        // Verify code
        const isValid = await bcrypt.compare(code, otp.codeHash);

        if (!isValid) {
          // Increment attempts
          await db
            .update(otpCodes)
            .set({ attempts: otp.attempts + 1 })
            .where(eq(otpCodes.id, otp.id));
          return null;
        }

        // Mark as consumed
        await db
          .update(otpCodes)
          .set({ consumedAt: new Date() })
          .where(eq(otpCodes.id, otp.id));

        // Get or create user
        let [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email.toLowerCase()));

        if (!user) {
          // Auto-create user for whitelisted emails
          const [newUser] = await db
            .insert(users)
            .values({
              email: email.toLowerCase(),
              role: "user",
              isActive: true,
            })
            .returning();
          user = newUser;
        }

        if (!user.isActive) return null;

        // Update last login
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
