import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  let notificationCount = 0;
  let recentNotifications: {
    id: string;
    title: string;
    message: string | null;
    type: string;
    isRead: boolean;
    entityType: string | null;
    entityId: string | null;
    createdAt: Date;
  }[] = [];
  try {
    const [notifCountResult, notifListResult] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, session.user.id),
            eq(notifications.isRead, false)
          )
        ),
      db.query.notifications.findMany({
        where: eq(notifications.userId, session.user.id),
        orderBy: [desc(notifications.createdAt)],
        limit: 5,
      }),
    ]);
    notificationCount = Number(notifCountResult[0].count);
    recentNotifications = notifListResult as typeof recentNotifications;
  } catch {
    // DB might not be ready yet
  }

  return (
    <AdminShell
      user={{
        id: session.user.id,
        email: session.user.email!,
        name: session.user.name,
        role: (session.user as { role: string }).role,
      }}
      notificationCount={notificationCount}
      recentNotifications={recentNotifications}
    >
      {children}
    </AdminShell>
  );
}
