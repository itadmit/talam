import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ChatWidget } from "@/components/chatbot/chat-widget";
import { db } from "@/lib/db";
import { notifications, chatbotSettings } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Get notifications + chatbot settings in parallel
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
  let chatbot: typeof chatbotSettings.$inferSelect | null = null;
  try {
    const [notifCountResult, notifListResult, chatbotResult] = await Promise.all([
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
      db.select().from(chatbotSettings).limit(1),
    ]);
    notificationCount = Number(notifCountResult[0].count);
    recentNotifications = notifListResult as typeof recentNotifications;
    chatbot = chatbotResult[0] || null;
  } catch {
    // DB might not be ready yet
  }

  return (
    <AppShell
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
      {chatbot && (
        <ChatWidget
          isActive={chatbot.isActive}
          welcomeMessage={chatbot.welcomeMessage}
          quickQuestions={chatbot.quickQuestions}
        />
      )}
    </AppShell>
  );
}
